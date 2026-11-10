import { ExternalLink, Plane, Ship } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { LiveTrackingCard as LiveTrackingCardModel } from '../types/liveTracking.types';

type Props = {
  card: LiveTrackingCardModel;
  className?: string;
};

/** Compact live vessel / flight status card with provider links. */
export function LiveTrackingCard({ card, className }: Props) {
  const Icon = card.kind === 'flight' ? Plane : Ship;
  return (
    <div
      className={cn(
        'rounded-xl border border-[var(--fresa-border,#C9D3DF)] bg-white px-4 py-3 shadow-sm',
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#EEF5FF] text-[#2563EB]">
          <Icon className="h-4 w-4" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-[#64748b]">
            {card.kind === 'flight'
              ? 'Live flight'
              : card.kind === 'vessel'
                ? 'Live vessel'
                : 'Live tracking'}
            {card.provider ? ` · ${card.provider}` : ''}
          </p>
          <p className="mt-0.5 text-[15px] font-bold text-[var(--fresa-header-text,#0A2942)]">
            {card.title || card.query || '—'}
          </p>
          {card.subtitle ? (
            <p className="text-[12px] text-[#64748b]">{card.subtitle}</p>
          ) : null}
          {card.status ? (
            <p className="mt-1 text-[13px] font-medium text-[#2563EB]">{card.status}</p>
          ) : null}
          {card.summary ? (
            <p className="mt-1 text-[12px] text-[#475569]">{card.summary}</p>
          ) : null}
          <p className="mt-1 text-[11px] text-[#94a3b8]">
            {[
              card.airlineName,
              card.voyageNumber ? `Voy ${card.voyageNumber}` : null,
              card.imo ? `IMO ${card.imo}` : null,
              card.lat != null && card.lng != null
                ? `${card.lat.toFixed(4)}, ${card.lng.toFixed(4)}`
                : null,
              card.updatedAt ? `Updated ${card.updatedAt}` : null,
            ]
              .filter(Boolean)
              .join(' · ') || '\u00A0'}
          </p>
          {card.links.length ? (
            <div className="mt-2 flex flex-wrap gap-2">
              {card.links.map((link) => (
                <a
                  key={`${link.label}-${link.url}`}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 rounded-md border border-[var(--fresa-border,#C9D3DF)] px-2 py-1 text-[11px] font-medium text-[#0A2942] hover:bg-[var(--color-neutral-50)]"
                >
                  {link.label}
                  <ExternalLink className="h-3 w-3" aria-hidden />
                </a>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
