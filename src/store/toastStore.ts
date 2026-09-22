import { create } from 'zustand';

export type ToastVariant = 'info' | 'success' | 'warning' | 'error' | 'notification';

export interface ToastItem {
  id: string;
  title: string;
  message: string;
  variant: ToastVariant;
  durationMs: number;
  createdAt: number;
}

export interface ToastInput {
  title?: string;
  message: string;
  variant?: ToastVariant;
  durationMs?: number;
  /** Skip if the same title+message was pushed within this window (ms). */
  dedupeMs?: number;
}

const DEFAULT_DURATION: Record<ToastVariant, number> = {
  info: 5000,
  success: 4000,
  warning: 6000,
  error: 8000,
  notification: 6500,
};

const DEFAULT_TITLE: Record<ToastVariant, string> = {
  info: 'Notice',
  success: 'Success',
  warning: 'Warning',
  error: 'Error',
  notification: 'Notification',
};

const MAX_TOASTS = 5;
const recentKeys = new Map<string, number>();

function makeId(): string {
  return `toast-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function normalizeMessage(message: string): string {
  return message.replace(/\s+/g, ' ').trim();
}

interface ToastStore {
  toasts: ToastItem[];
  push: (input: ToastInput) => string | null;
  dismiss: (id: string) => void;
  clear: () => void;
}

export const useToastStore = create<ToastStore>((set, get) => ({
  toasts: [],

  push: (input) => {
    const message = normalizeMessage(input.message ?? '');
    if (!message) return null;

    const variant = input.variant ?? 'info';
    const title = (input.title?.trim() || DEFAULT_TITLE[variant]).slice(0, 80);
    const dedupeMs = input.dedupeMs ?? 2500;
    const key = `${variant}|${title}|${message}`;
    const now = Date.now();
    const last = recentKeys.get(key);
    if (last != null && now - last < dedupeMs) return null;
    recentKeys.set(key, now);

    const item: ToastItem = {
      id: makeId(),
      title,
      message: message.slice(0, 500),
      variant,
      durationMs: input.durationMs ?? DEFAULT_DURATION[variant],
      createdAt: now,
    };

    const next = [...get().toasts, item];
    while (next.length > MAX_TOASTS) next.shift();
    set({ toasts: next });
    return item.id;
  },

  dismiss: (id) => {
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
  },

  clear: () => set({ toasts: [] }),
}));

/** Imperative helpers — safe to call outside React. */
export const toast = {
  show(input: ToastInput) {
    return useToastStore.getState().push(input);
  },
  info(message: string, opts?: Omit<ToastInput, 'message' | 'variant'>) {
    return useToastStore.getState().push({ ...opts, message, variant: 'info' });
  },
  success(message: string, opts?: Omit<ToastInput, 'message' | 'variant'>) {
    return useToastStore.getState().push({ ...opts, message, variant: 'success' });
  },
  warning(message: string, opts?: Omit<ToastInput, 'message' | 'variant'>) {
    return useToastStore.getState().push({ ...opts, message, variant: 'warning' });
  },
  error(message: string, opts?: Omit<ToastInput, 'message' | 'variant'>) {
    return useToastStore.getState().push({ ...opts, message, variant: 'error' });
  },
  notification(message: string, opts?: Omit<ToastInput, 'message' | 'variant'>) {
    return useToastStore.getState().push({ ...opts, message, variant: 'notification' });
  },
  dismiss(id: string) {
    useToastStore.getState().dismiss(id);
  },
  clear() {
    useToastStore.getState().clear();
  },
};
