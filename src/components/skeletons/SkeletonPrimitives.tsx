import { type ReactNode } from 'react'

interface SkeletonProps {
  className?: string
}

/** Single pulsing block */
export function SkeletonBlock({ className = '' }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-[var(--color-neutral-100)] ${className}`}
      aria-hidden="true"
    />
  )
}

/** Wraps children with a semitransparent loading shimmer overlay */
export function SkeletonOverlay({ children }: { children: ReactNode }) {
  return (
    <div className="relative">
      {children}
      <div
        className="absolute inset-0 rounded-lg bg-white/60"
        aria-hidden="true"
      />
    </div>
  )
}

/** Full-page centered spinner — used during initial app boot */
export function FullPageSpinner({ message = 'Loading…' }: { message?: string }) {
  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center bg-[var(--color-neutral-50)] z-50"
      role="status"
      aria-label={message}
    >
      <div
        className="w-10 h-10 rounded-full border-[3px] border-t-transparent animate-spin mb-4"
        style={{
          borderColor: 'var(--color-primary-200)',
          borderTopColor: 'var(--color-primary-600)',
        }}
      />
      <p className="text-sm text-[var(--color-neutral-400)]">{message}</p>
    </div>
  )
}

/** Inline spinner — used inside buttons */
export function InlineSpinner({ size = 14 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className="animate-spin shrink-0"
      aria-hidden="true"
    >
      <circle
        cx="12" cy="12" r="10"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray="32"
        strokeDashoffset="12"
        opacity="0.3"
      />
      <circle
        cx="12" cy="12" r="10"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray="8"
        strokeDashoffset="0"
      />
    </svg>
  )
}