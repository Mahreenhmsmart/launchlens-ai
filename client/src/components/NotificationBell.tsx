/**
 * NotificationBell — bell icon button with unread count badge.
 *
 * Click toggles the NotificationsPanel. Escape closes it.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui';
import { cn } from '@/utils/cn';
import { useNotifications } from '@/hooks/useNotifications';
import NotificationsPanel from './NotificationsPanel';

interface NotificationBellProps {
  className?: string;
}

export default function NotificationBell({ className }: NotificationBellProps) {
  const [open, setOpen] = useState(false);
  const [bellRect, setBellRect] = useState<DOMRect | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { notifications, unreadCount, markRead, markAllRead, clearAll } =
    useNotifications();

  const toggle = useCallback(() => {
    setOpen((prev) => {
      if (!prev && buttonRef.current) {
        // Capture bell position when opening for desktop panel alignment
        setBellRect(buttonRef.current.getBoundingClientRect());
      }
      return !prev;
    });
  }, []);
  const close = useCallback(() => setOpen(false), []);

  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, close]);

  return (
    <div
      className={cn('relative', className)}
      data-icod-id="src_components_notificationbell_tsx_48c6">
      <Button
        ref={buttonRef}
        variant="ghost"
        size="icon"
        onClick={toggle}
        className={cn(
          'h-8 w-8 text-white hover:bg-white/10 sm:h-9 sm:w-9',
          open && 'bg-white/10',
        )}
        aria-label="Notifications"
        aria-expanded={open}
        data-icod-id="src_components_notificationbell_tsx_8183">
        <Bell
          className="h-4 w-4 sm:h-[18px] sm:w-[18px]"
          data-icod-id="src_components_notificationbell_tsx_4f07" />
        {unreadCount > 0 && (
          <span
            className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold leading-none text-destructive-foreground"
            data-icod-id="src_components_notificationbell_tsx_6fa3">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </Button>
      <NotificationsPanel
        notifications={notifications}
        open={open}
        onClose={close}
        onMarkRead={markRead}
        onMarkAllRead={markAllRead}
        onClearAll={clearAll}
        bellRect={bellRect}
        data-icod-id="src_components_notificationbell_tsx_fc01" />
    </div>
  );
}
