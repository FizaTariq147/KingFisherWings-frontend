import { useMemo, useState, type CSSProperties, type ComponentType } from 'react';
import {
  AlertTriangle,
  Bell,
  Hash,
  Heart,
  History,
  Link2,
  MessageSquare,
  Paperclip,
  Tag,
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useOpsContinuumCounts } from '../hooks/useOpsContinuumCounts';
import { OpsContinuumPanel } from './OpsContinuumPanel';
import {
  resolveOpsContinuumEntity,
  type OpsLifecycleLinks,
} from '../utils/resolveOpsContinuumEntity';
import { resolveOpsContinuumTabs } from '../utils/resolveOpsContinuumTabs';
import type { OpsContinuumTab, OpsEntityType } from '../types/opsActivity.types';

const TAB_META: Record<
  OpsContinuumTab,
  {
    label: string;
    Icon: ComponentType<{ className?: string }>;
    style: CSSProperties;
  }
> = {
  comments: {
    label: 'Comments',
    Icon: MessageSquare,
    style: { backgroundColor: '#0EA5E9', borderColor: '#0284C7', color: '#FFFFFF' },
  },
  'follow-ups': {
    label: 'Follow-ups',
    Icon: Bell,
    style: { backgroundColor: '#F59E0B', borderColor: '#D97706', color: '#FFFFFF' },
  },
  attachments: {
    label: 'Attachments',
    Icon: Paperclip,
    style: { backgroundColor: '#8B5CF6', borderColor: '#7C3AED', color: '#FFFFFF' },
  },
  references: {
    label: 'References',
    Icon: Hash,
    style: { backgroundColor: '#14B8A6', borderColor: '#0D9488', color: '#FFFFFF' },
  },
  tags: {
    label: 'Tags',
    Icon: Tag,
    style: { backgroundColor: '#EC4899', borderColor: '#DB2777', color: '#FFFFFF' },
  },
  links: {
    label: 'Links',
    Icon: Link2,
    style: { backgroundColor: '#6366F1', borderColor: '#4F46E5', color: '#FFFFFF' },
  },
  likes: {
    label: 'Likes',
    Icon: Heart,
    style: { backgroundColor: '#EF4444', borderColor: '#DC2626', color: '#FFFFFF' },
  },
  complaints: {
    label: 'Complaints',
    Icon: AlertTriangle,
    style: { backgroundColor: '#F97316', borderColor: '#EA580C', color: '#FFFFFF' },
  },
  history: {
    label: 'History',
    Icon: History,
    style: { backgroundColor: '#64748B', borderColor: '#475569', color: '#FFFFFF' },
  },
};

function formatCount(n: number | null): string {
  if (n == null) return '…';
  if (n > 99) return '99+';
  return String(n);
}

/**
 * Fresa-style right-side colorful icon rail for /ops/:entityType/:entityId continuum.
 * Button set comes from detail path_hints / ops_continuum / can_* (fallback: all endpoints).
 * Counts come from live list endpoints (and optional ops_continuum count fields).
 */
export function OpsContinuumRail({
  entityType,
  entityId,
  pathHints,
  opsContinuum,
  actions,
  links,
  className = '',
}: {
  entityType: OpsEntityType;
  entityId: string;
  pathHints?: string[];
  opsContinuum?: Record<string, unknown> | null;
  actions?: Record<string, unknown> | null;
  /** Linked lifecycle ids — continuum hosts on earliest entity so activity stays synced. */
  links?: OpsLifecycleLinks | null;
  className?: string;
}) {
  const host = useMemo(
    () =>
      resolveOpsContinuumEntity({
        entityType,
        entityId,
        opsContinuum,
        links,
      }),
    [entityType, entityId, opsContinuum, links],
  );
  const tabs = useMemo(
    () =>
      resolveOpsContinuumTabs({
        pathHints,
        opsContinuum: opsContinuum ?? undefined,
        actions: actions ?? undefined,
      }),
    [pathHints, opsContinuum, actions],
  );
  const counts = useOpsContinuumCounts(host.entityType, host.entityId, {
    enabled: Boolean(host.entityId) && tabs.length > 0,
    opsContinuum,
    tabs,
  });
  const [active, setActive] = useState<OpsContinuumTab | null>(null);

  if (!host.entityId || tabs.length === 0) return null;

  return (
    <>
      <aside
        aria-label="Ops continuum"
        className={`pointer-events-none fixed bottom-6 right-3 z-40 flex flex-col items-end gap-2 sm:bottom-auto sm:top-28 ${className}`}
      >
        <div className="pointer-events-auto flex max-h-[min(70vh,32rem)] flex-col gap-1.5 overflow-y-auto rounded-md border border-[var(--fresa-border,#C9D3DF)] bg-white/95 p-1.5 shadow-md backdrop-blur-sm">
          {tabs.map((tab) => {
            const meta = TAB_META[tab];
            const Icon = meta.Icon;
            const count = counts[tab];
            const countLabel = formatCount(count);
            return (
              <button
                key={tab}
                type="button"
                title={`${meta.label}${count != null ? ` (${count})` : ''}`}
                aria-label={`${meta.label}${count != null ? `, ${count}` : ''}`}
                className="relative flex w-[4.75rem] flex-col items-center gap-0.5 rounded-sm border px-1 py-1.5 text-white shadow-sm transition hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1"
                style={{
                  ...meta.style,
                  borderWidth: 1,
                  borderStyle: 'solid',
                  boxShadow: '0 1px 0 rgba(10, 41, 66, 0.12)',
                }}
                onClick={() => setActive(tab)}
              >
                <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-white px-1 text-[9px] font-bold leading-none text-[var(--fresa-header-text,#0A2942)] shadow-sm ring-1 ring-black/10">
                  {countLabel}
                </span>
                <Icon className="h-4 w-4 shrink-0" aria-hidden />
                <span className="max-w-full truncate text-[9px] font-semibold leading-tight tracking-wide">
                  {meta.label}
                </span>
              </button>
            );
          })}
        </div>
      </aside>

      {active ? (
        <Modal
          open
          size="xl"
          title={`${TAB_META[active].label}${
            counts[active] != null ? ` (${counts[active]})` : ''
          }`}
          onClose={() => setActive(null)}
          footer={
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => setActive(null)}
            >
              Close
            </Button>
          }
        >
          <OpsContinuumPanel
            entityType={host.entityType}
            entityId={host.entityId}
            defaultTab={active}
            hideTabBar
            compact
          />
        </Modal>
      ) : null}
    </>
  );
}
