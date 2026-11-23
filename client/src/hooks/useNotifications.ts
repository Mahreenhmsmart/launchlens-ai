/**
 * useNotifications — per-user notification state backed by scoped localStorage.
 *
 * Notifications are created ONLY by real event triggers (courier sync,
 * checklist readiness changes, analysis saves). The list starts empty.
 *
 * Deduplication: when addNotification is called with the same type within a
 * short window (DEDUP_WINDOW_MS), it updates the existing unread notification's
 * timestamp and message instead of creating a new one. For 'readiness' type,
 * dedup matches on type only (not exact message) so percentage changes coalesce.
 * On load, existing duplicate unread notifications of the same type/message
 * created within COLLAPSE_WINDOW_MS are collapsed into one.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAppSelector } from '@/store/hooks';
import { STORAGE_KEYS, scopedGetItem, scopedSetItem } from '@/utils/scopedStorage';

// ─── Constants ──────────────────────────────────────────────────────────────

/** Window (ms) within which duplicate notifications are coalesced. */
const DEDUP_WINDOW_MS = 2000;

/** Window (ms) for collapsing existing duplicates on load. */
const COLLAPSE_WINDOW_MS = 5 * 60 * 1000; // 5 minutes

// ─── Types ──────────────────────────────────────────────────────────────────

export type NotificationType = 'courier' | 'readiness' | 'analysis';

export interface Notification {
  id: string;
  message: string;
  type: NotificationType;
  read: boolean;
  createdAt: string; // ISO
}

export interface UseNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (message: string, type: NotificationType) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  clearAll: () => void;
  dismiss: (id: string) => void;
}

// ─── Dedup helpers ──────────────────────────────────────────────────────────

/**
 * Returns the dedup key for a notification.
 * For 'readiness' type, we match on type only (so different percentages coalesce).
 * For other types, we match on type + message.
 */
function dedupKey(type: NotificationType, message: string): string {
  if (type === 'readiness') return `readiness`;
  return `${type}:${message}`;
}

/**
 * Collapses duplicate unread notifications in a list.
 * Groups by dedup key, keeps only the newest entry per group within the window.
 * Read notifications and notifications of different types are never removed.
 */
function collapseDuplicates(items: Notification[], windowMs: number): Notification[] {
  const now = Date.now();
  const seen = new Map<string, number>(); // dedupKey → index in result
  const result: Notification[] = [];

  // Process newest-first so we keep the latest
  const sorted = [...items].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  for (const item of sorted) {
    // Only collapse unread notifications
    if (item.read) {
      result.push(item);
      continue;
    }

    const key = dedupKey(item.type, item.message);
    const prevIdx = seen.get(key);

    if (prevIdx !== undefined) {
      // Check if within the collapse window
      const timeDiff = Math.abs(
        new Date(item.createdAt).getTime() - new Date(result[prevIdx].createdAt).getTime(),
      );
      if (timeDiff <= windowMs) {
        // Skip this duplicate — the newer one is already in result
        continue;
      }
    }

    seen.set(key, result.length);
    result.push(item);
  }

  return result;
}

// ─── Standalone helpers (for use outside React components) ──────────────────

/**
 * Reads notifications from scoped localStorage for a given user.
 */
export function getNotifications(userId: string | null): Notification[] {
  return scopedGetItem<Notification[]>(
    STORAGE_KEYS.NOTIFICATIONS,
    userId,
    [],
  );
}

/**
 * Writes notifications to scoped localStorage for a given user.
 */
export function setNotifications(userId: string | null, items: Notification[]): void {
  scopedSetItem(STORAGE_KEYS.NOTIFICATIONS, userId, items);
}

/**
 * Adds a notification directly (no React required).
 * Used by saveExport.ts and other non-component modules.
 * Includes deduplication: if an unread notification of the same type+message
 * exists within DEDUP_WINDOW_MS, updates it instead of creating a new one.
 */
export function addNotificationDirect(
  userId: string | null,
  message: string,
  type: NotificationType,
): void {
  if (!userId) return;
  const items = getNotifications(userId);
  const now = new Date();
  const key = dedupKey(type, message);

  // Look for an existing unread notification to coalesce with
  const existingIdx = items.findIndex((n) => {
    if (n.read) return false;
    if (dedupKey(n.type, n.message) !== key) return false;
    const age = now.getTime() - new Date(n.createdAt).getTime();
    return age <= DEDUP_WINDOW_MS;
  });

  if (existingIdx !== -1) {
    // Update existing notification's timestamp and message
    items[existingIdx] = {
      ...items[existingIdx],
      message,
      createdAt: now.toISOString(),
    };
    // Re-sort newest first
    items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    setNotifications(userId, items);
  } else {
    const newItem: Notification = {
      id: crypto.randomUUID(),
      message,
      type,
      read: false,
      createdAt: now.toISOString(),
    };
    items.unshift(newItem);
    setNotifications(userId, items);
  }

  // Dispatch a storage event so any mounted hook instances re-read
  window.dispatchEvent(new CustomEvent('notifications-changed'));
}

// ─── Hook ───────────────────────────────────────────────────────────────────

export function useNotifications(): UseNotificationsReturn {
  const userId = useAppSelector((state) => state.auth.user?.id ?? null);
  const [notifications, setLocalNotifications] = useState<Notification[]>([]);
  const initialized = useRef(false);

  // Load on mount / user change — collapse duplicates and clean up stale entries
  useEffect(() => {
    if (!userId) {
      setLocalNotifications([]);
      initialized.current = false;
      return;
    }
    if (!initialized.current) {
      initialized.current = true;
    }
    const loaded = getNotifications(userId);
    // Drop any notification whose message contains the literal "X%" placeholder
    // (created by a previous i18n interpolation bug)
    const cleaned = loaded.filter((n) => !n.message.includes('X%'));
    const collapsed = collapseDuplicates(cleaned, COLLAPSE_WINDOW_MS);
    // Persist cleaned/collapsed result if it differs from what was stored
    if (collapsed.length !== loaded.length) {
      setNotifications(userId, collapsed);
    }
    setLocalNotifications(collapsed);
  }, [userId]);

  // Listen for cross-component / cross-tab updates
  useEffect(() => {
    const handler = () => {
      if (userId) {
        const loaded = getNotifications(userId);
        const cleaned = loaded.filter((n) => !n.message.includes('X%'));
        setLocalNotifications(collapseDuplicates(cleaned, COLLAPSE_WINDOW_MS));
      }
    };
    window.addEventListener('storage', handler);
    window.addEventListener('notifications-changed', handler);
    return () => {
      window.removeEventListener('storage', handler);
      window.removeEventListener('notifications-changed', handler);
    };
  }, [userId]);

  const persist = useCallback(
    (items: Notification[]) => {
      setLocalNotifications(items);
      setNotifications(userId, items);
      window.dispatchEvent(new CustomEvent('notifications-changed'));
    },
    [userId],
  );

  const addNotification = useCallback(
    (message: string, type: NotificationType) => {
      const now = new Date();
      const key = dedupKey(type, message);

      // Look for an existing unread notification to coalesce with
      const existingIdx = notifications.findIndex((n) => {
        if (n.read) return false;
        if (dedupKey(n.type, n.message) !== key) return false;
        const age = now.getTime() - new Date(n.createdAt).getTime();
        return age <= DEDUP_WINDOW_MS;
      });

      if (existingIdx !== -1) {
        // Update existing notification's timestamp and message
        const updated = [...notifications];
        updated[existingIdx] = {
          ...updated[existingIdx],
          message,
          createdAt: now.toISOString(),
        };
        // Re-sort newest first
        updated.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        persist(updated);
      } else {
        const newItem: Notification = {
          id: crypto.randomUUID(),
          message,
          type,
          read: false,
          createdAt: now.toISOString(),
        };
        persist([newItem, ...notifications]);
      }
    },
    [notifications, persist],
  );

  const markRead = useCallback(
    (id: string) => {
      persist(notifications.map((n) => (n.id === id ? { ...n, read: true } : n)));
    },
    [notifications, persist],
  );

  const markAllRead = useCallback(() => {
    persist(notifications.map((n) => ({ ...n, read: true })));
  }, [notifications, persist]);

  const clearAll = useCallback(() => {
    persist([]);
  }, [persist]);

  const dismiss = useCallback(
    (id: string) => {
      persist(notifications.filter((n) => n.id !== id));
    },
    [notifications, persist],
  );

  const unreadCount = notifications.filter((n) => !n.read).length;

  return {
    notifications,
    unreadCount,
    addNotification,
    markRead,
    markAllRead,
    clearAll,
    dismiss,
  };
}
