import { AlertCircle } from 'lucide-react';

export function AwbStockErrorBanner({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="flex items-start gap-2 rounded-lg border px-3 py-2 text-sm"
      style={{
        background: 'var(--color-danger-100)',
        borderColor: '#FECACA',
        color: 'var(--color-danger-700)',
      }}
    >
      <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
      <span>{message}</span>
    </div>
  );
}

export function AwbStockSuccessBanner({ message }: { message: string }) {
  return (
    <div
      role="status"
      className="rounded-lg border px-3 py-2 text-sm"
      style={{
        background: 'var(--color-success-100)',
        borderColor: '#BBF7D0',
        color: 'var(--color-success-700)',
      }}
    >
      {message}
    </div>
  );
}

export function AwbStockWarningBanner({
  message,
  onClick,
}: {
  message: string;
  onClick?: () => void;
}) {
  const className =
    'rounded-lg border px-3 py-2 text-sm flex items-center justify-between gap-3';
  const style = {
    background: 'var(--color-warning-100)',
    borderColor: '#FDE68A',
    color: 'var(--color-warning-700)',
  } as const;

  if (onClick) {
    return (
      <button type="button" className={`${className} w-full text-left hover:opacity-90`} style={style} onClick={onClick}>
        <span>{message}</span>
        <span className="text-xs font-medium underline shrink-0">Show low stock</span>
      </button>
    );
  }

  return (
    <div role="status" className={className} style={style}>
      {message}
    </div>
  );
}
