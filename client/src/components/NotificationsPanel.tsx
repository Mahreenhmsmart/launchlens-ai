/**
 * NotificationsPanel — dropdown/panel showing user notifications.
 *
 * Renders newest-first, with mark-read and clear actions.
 * Responsive: dropdown on desktop, fixed portal on mobile (≤640px).
 */

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Bell, Check, Trash2 } from 'lucide-react';
import { Button, Card, EmptyState } from '@/components/ui';
import { cn } from '@/utils/cn';
import { useTranslation } from '@/utils/i18n';
import type { Notification } from '@/hooks/useNotifications';

interface NotificationsPanelProps {
  notifications: Notification[];
  open: boolean;
  onClose: () => void;
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onClearAll: () => void;
  className?: string;
  /** Position of the bell icon for desktop alignment (optional) */
  bellRect?: DOMRect | null;
}

/** Hook to detect if viewport is at or below mobile breakpoint */
function useIsMobile(breakpoint = 640): boolean {
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth <= breakpoint : false,
  );

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${breakpoint}px)`);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mql.addEventListener('change', handler);
    setIsMobile(mql.matches);
    return () => mql.removeEventListener('change', handler);
  }, [breakpoint]);

  return isMobile;
}

/** Formats an ISO date string to a human-friendly relative or absolute label. */
function formatRelativeTime(isoString: string, t: (key: string) => string): string {
  const now = Date.now();
  const then = new Date(isoString).getTime();
  const diffMs = now - then;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffSec < 60) return t('Just now');
  if (diffMin < 60) return `${diffMin} ${t('minutes ago')}`;
  if (diffHr < 24) return `${diffHr} ${t('hours ago')}`;
  if (diffDay < 7) return `${diffDay} ${t('days ago')}`;
  return new Date(isoString).toLocaleDateString();
}

/**
 * Translates a notification message. For readiness notifications that contain
 * a dynamic percentage (e.g. "Launch readiness 75%"), extracts the number and
 * uses the translation template with interpolation.
 */
function translateNotificationMessage(message: string, type: string, t: (key: string) => string): string {
  if (type === 'readiness') {
    // Extract percentage from messages like "Launch readiness 75%"
    const match = message.match(/(\d+)/);
    if (match) {
      const pct = match[1];
      // t() returns the Urdu template with {pct} placeholder, or the English
      // key "Launch readiness X%" when language is English. Handle both.
      return t('Launch readiness X%')
        .replace('{pct}', pct)
        .replace('X%', `${pct}%`);
    }
  }
  return t(message);
}

export default function NotificationsPanel({
  notifications,
  open,
  onClose,
  onMarkRead,
  onMarkAllRead,
  onClearAll,
  className,
  bellRect,
}: NotificationsPanelProps) {
  const { t } = useTranslation();
  const isMobile = useIsMobile(640);

  if (!open) return null;

  // Sort newest first
  const sorted = [...notifications].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  // Panel content — shared between mobile and desktop rendering
  const panelContent = (
    <>
      {/* Backdrop for click-outside-to-close */}
      <div
        className={cn(
          'fixed inset-0 z-40',
          !isMobile && 'bg-transparent',
        )}
        onClick={onClose}
        aria-hidden="true"
        data-icod-id="src_components_notificationspanel_tsx_3f27" />
      {/* Panel */}
      <Card
        className={cn(
          // Mobile: fixed positioning with full-width minus margins
          isMobile && 'fixed left-4 right-4 top-[72px] z-50 w-auto max-w-none shadow-xl',
          // Desktop: absolute dropdown anchored under the bell icon
          !isMobile && 'absolute right-0 top-full z-50 mt-2 w-[360px] overflow-hidden shadow-xl',
          className,
        )}
        role="dialog"
        aria-label={t('Notifications')}
        data-icod-id="src_components_notificationspanel_tsx_e850">
        {/* Header */}
        <div
          className="flex items-center justify-between border-b border-border px-4 py-3"
          data-icod-id="src_components_notificationspanel_tsx_d419">
          <h3
            className="text-sm font-semibold text-foreground"
            data-icod-id="src_components_notificationspanel_tsx_91e0">{t('Notifications')}</h3>
          <div
            className="flex items-center gap-1"
            data-icod-id="src_components_notificationspanel_tsx_7835">
            {sorted.length > 0 && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onMarkAllRead}
                  className="h-7 px-2 text-xs"
                  data-icod-id="src_components_notificationspanel_tsx_7123">
                  <Check
                    className="mr-1 h-3 w-3"
                    data-icod-id="src_components_notificationspanel_tsx_2e06" />
                  {t('Mark all read')}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClearAll}
                  className="h-7 px-2 text-xs"
                  data-icod-id="src_components_notificationspanel_tsx_b689">
                  <Trash2
                    className="mr-1 h-3 w-3"
                    data-icod-id="src_components_notificationspanel_tsx_d75c" />
                  {t('Clear')}
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Body */}
        <div
          className="max-h-80 overflow-y-auto"
          data-icod-id="src_components_notificationspanel_tsx_7107">
          {sorted.length === 0 ? (
            <EmptyState
              icon={Bell}
              title={t('No notifications yet')}
              className="py-12"
              data-icod-id="src_components_notificationspanel_tsx_210b" />
          ) : (
            <ul
              className="divide-y divide-border"
              data-icod-id="src_components_notificationspanel_tsx_622b">
              {sorted.map((notification) => (
                <li
                  key={notification.id}
                  className={cn(
                    'flex cursor-pointer items-start gap-3 px-4 py-3 transition-colors hover:bg-muted',
                    !notification.read && 'bg-primary/5',
                  )}
                  onClick={() => onMarkRead(notification.id)}
                  data-icod-id={`src_components_notificationspanel_tsx_9bf0_${notification.id}`}>
                  {/* Type indicator dot */}
                  <span
                    className={cn(
                      'mt-1.5 h-2 w-2 shrink-0 rounded-full',
                      notification.type === 'courier' && 'bg-blue-500',
                      notification.type === 'readiness' && 'bg-green-500',
                      notification.type === 'analysis' && 'bg-purple-500',
                      notification.read && 'opacity-30',
                    )}
                    data-icod-id={`src_components_notificationspanel_tsx_1ead_${notification.id}`} />
                  <div
                    className="min-w-0 flex-1"
                    data-icod-id={`src_components_notificationspanel_tsx_b411_${notification.id}`}>
                    <p
                      className={cn(
                        'text-sm leading-snug text-foreground',
                        notification.read ? 'font-normal' : 'font-medium',
                      )}
                      data-icod-id={`src_components_notificationspanel_tsx_79f3_${notification.id}`}>
                      {translateNotificationMessage(notification.message, notification.type, t)}
                    </p>
                    <p
                      className="mt-0.5 text-xs text-muted-foreground"
                      data-icod-id={`src_components_notificationspanel_tsx_f845_${notification.id}`}>
                      {formatRelativeTime(notification.createdAt, t)}
                    </p>
                  </div>
                  {!notification.read && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onMarkRead(notification.id);
                      }}
                      className="shrink-0 rounded p-1 text-muted-foreground hover:text-foreground"
                      aria-label={t('Mark as read')}
                      title={t('Mark as read')}
                      data-icod-id={`src_components_notificationspanel_tsx_38aa_${notification.id}`}>
                      <Check
                        className="h-3.5 w-3.5"
                        data-icod-id={`src_components_notificationspanel_tsx_ea90_${notification.id}`} />
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </Card>
    </>
  );

  // On mobile, render via portal to escape any clipping parent containers
  if (isMobile) {
    return createPortal(panelContent, document.body);
  }

  return panelContent;
}
