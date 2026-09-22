import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, AlertTriangle, Bell, CheckCircle2, Info, X } from 'lucide-react';
import { toast, useToastStore, type ToastItem, type ToastVariant } from '@/store/toastStore';
import { cn } from '@/lib/utils';

const VARIANT_META: Record<
  ToastVariant,
  { Icon: typeof Info; accent: string; chip: string }
> = {
  info: {
    Icon: Info,
    accent: 'var(--color-primary-600)',
    chip: 'bg-[var(--color-primary-100)] text-[var(--color-primary-700)]',
  },
  success: {
    Icon: CheckCircle2,
    accent: 'var(--color-success-500)',
    chip: 'bg-[var(--color-success-50)] text-[var(--color-success-500)]',
  },
  warning: {
    Icon: AlertTriangle,
    accent: 'var(--color-warning-500)',
    chip: 'bg-[var(--color-warning-50)] text-[var(--color-warning-500)]',
  },
  error: {
    Icon: AlertCircle,
    accent: 'var(--color-danger-500)',
    chip: 'bg-[var(--color-danger-50)] text-[var(--color-danger-600)]',
  },
  notification: {
    Icon: Bell,
    accent: 'var(--color-secondary)',
    chip: 'bg-[var(--color-secondary-100)] text-[var(--color-secondary-700)]',
  },
};

function ToastCard({ item }: { item: ToastItem }) {
  const dismiss = useToastStore((s) => s.dismiss);
  const meta = VARIANT_META[item.variant];
  const { Icon } = meta;
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(1);
  const remainingRef = useRef(item.durationMs);
  const lastTickRef = useRef<number | null>(null);

  useEffect(() => {
    let raf = 0;
    const tick = (now: number) => {
      if (!paused) {
        if (lastTickRef.current != null) {
          remainingRef.current = Math.max(0, remainingRef.current - (now - lastTickRef.current));
        }
        lastTickRef.current = now;
        setProgress(remainingRef.current / item.durationMs);
        if (remainingRef.current <= 0) {
          dismiss(item.id);
          return;
        }
      } else {
        lastTickRef.current = null;
      }
      raf = window.requestAnimationFrame(tick);
    };
    raf = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(raf);
  }, [paused, dismiss, item.id, item.durationMs]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 48, y: 8, scale: 0.98 }}
      animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 36, scale: 0.96, transition: { duration: 0.18 } }}
      transition={{ type: 'spring', stiffness: 420, damping: 32 }}
      role="status"
      aria-live={item.variant === 'error' ? 'assertive' : 'polite'}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      className={cn(
        'pointer-events-auto relative w-[min(100vw-1.5rem,360px)] overflow-hidden',
        'rounded-md border border-[var(--color-neutral-200)] bg-white',
        'shadow-[0_8px_28px_rgba(10,41,66,0.16)]',
      )}
      style={{ borderLeftWidth: 4, borderLeftColor: meta.accent }}
    >
      <div className="flex gap-3 px-3.5 py-3">
        <span
          className={cn(
            'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md',
            meta.chip,
          )}
        >
          <Icon size={16} strokeWidth={2.2} aria-hidden />
        </span>
        <div className="min-w-0 flex-1 pt-0.5">
          <p className="truncate text-[13px] font-semibold text-[var(--color-neutral-900)]">
            {item.title}
          </p>
          <p className="mt-0.5 whitespace-pre-wrap break-words text-[12.5px] leading-relaxed text-[var(--color-neutral-600)]">
            {item.message}
          </p>
        </div>
        <button
          type="button"
          aria-label="Dismiss"
          onClick={() => dismiss(item.id)}
          className="shrink-0 rounded p-1 text-[var(--color-neutral-400)] transition hover:bg-[var(--color-neutral-100)] hover:text-[var(--color-neutral-700)]"
        >
          <X size={14} />
        </button>
      </div>
      <div className="h-0.5 w-full bg-[var(--color-neutral-100)]">
        <div
          className="h-full origin-left"
          style={{
            width: `${Math.max(0, Math.min(1, progress)) * 100}%`,
            backgroundColor: meta.accent,
            opacity: paused ? 0.35 : 0.85,
          }}
        />
      </div>
    </motion.div>
  );
}

/** Windows-style bottom-right toast stack — mount once at app root. */
export function ToastHost() {
  const toasts = useToastStore((s) => s.toasts);

  return (
    <div
      className="pointer-events-none fixed bottom-4 right-4 z-[10000] flex max-h-[min(100dvh-2rem,560px)] flex-col-reverse gap-2.5 overflow-y-auto sm:bottom-5 sm:right-5"
      aria-label="Notifications"
    >
      <AnimatePresence initial={false}>
        {toasts.map((item) => (
          <ToastCard key={item.id} item={item} />
        ))}
      </AnimatePresence>
    </div>
  );
}

/**
 * Watches unread notification counts and pops a toast when they rise.
 * Additive only — does not change badge or list behaviour.
 */
export function NotificationToastWatcher({
  unreadCount,
  title = 'Notification',
}: {
  unreadCount: number;
  title?: string;
}) {
  const prevRef = useRef<number | null>(null);

  useEffect(() => {
    if (prevRef.current === null) {
      prevRef.current = unreadCount;
      return;
    }
    if (unreadCount > prevRef.current) {
      const delta = unreadCount - prevRef.current;
      toast.notification(
        delta === 1 ? 'You have a new notification.' : `You have ${delta} new notifications.`,
        { title, dedupeMs: 4000 },
      );
    }
    prevRef.current = unreadCount;
  }, [unreadCount, title]);

  return null;
}
