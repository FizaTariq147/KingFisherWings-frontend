import type { ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { PageBackLink } from '@/components/ui/PageBackLink';
import { erpForm } from '@/lib/erpForm';
import { appType } from '@/lib/erpTypography';
import { cn } from '@/lib/utils';

export interface DetailTab {
  key: string;
  label: string;
  content: ReactNode;
}

export type DetailActionVariant =
  | 'primary'
  | 'secondary'
  | 'danger'
  | 'back'
  | 'report'
  | 'edit'
  | 'create';

interface DetailAction {
  label: string;
  onClick: () => void;
  variant?: DetailActionVariant;
  /** Leading icon — Fresa chrome pairs every toolbar action with an icon. */
  icon?: ReactNode;
}

interface DetailPageTemplateProps {
  title: string;
  /** Eyebrow above title — e.g. "Quotation details" / "Job details". */
  eyebrow?: string;
  subtitle?: ReactNode;
  statusLabel?: string;
  statusTone?: 'emerald' | 'amber' | 'rose' | 'slate';
  tabs: DetailTab[];
  /** When set and matches a tab key, select that tab (e.g. ?tab=invoices after auto-invoice). */
  defaultTab?: string;
  /** Top-right chrome actions (Create / Edit / Report). Back is auto-added when onBack/backTo set. */
  actions?: DetailAction[];
  actionsDisabled?: boolean;
  /**
   * Continuum rail / alerts — rendered below header chrome, above detail strip.
   */
  banner?: ReactNode;
  /**
   * Fresa “Xxx detail” summary strip — rendered above the actions toolbar.
   * Pass field grids matching Enquiry/Shipment detail.
   */
  detailSection?: ReactNode;
  detailTitle?: string;
  /** After detail summary (e.g. continuum / related) — before Actions toolbar. */
  afterDetail?: ReactNode;
  /**
   * Generation / special actions toolbar — rendered below detailSection, above tabs.
   */
  toolbar?: ReactNode;
  toolbarLabel?: string;
  sidebar?: ReactNode;
  /** Explicit back handler (module list). Preferred when provided. */
  onBack?: () => void;
  /** Explicit back path when `onBack` is not set. */
  backTo?: string;
  backLabel?: string;
  /** When true, also show chrome Back button in the top-right action row (Fresa). */
  showChromeBack?: boolean;
  /** Hide the text PageBackLink above the header (Fresa chrome Back is enough). */
  hidePageBackLink?: boolean;
  /** Extra root classes. */
  className?: string;
  /**
   * When true, only the detail summary form shrinks (responsive) for the Ops
   * continuum rail. Actions toolbar and tab panels stay full width.
   */
  reserveContinuumRail?: boolean;
}

const TONE_VARIANT: Record<
  string,
  'success' | 'warning' | 'danger' | 'neutral'
> = {
  emerald: 'success',
  amber: 'warning',
  rose: 'danger',
  slate: 'neutral',
};

function resolveChromeVariant(
  label: string,
  variant?: DetailActionVariant,
): DetailActionVariant {
  const key = label.trim().toLowerCase();
  if (key === 'back' || key.startsWith('back ')) return 'back';
  if (key === 'report' || key === 'reports') return 'report';
  if (key === 'edit') return 'edit';
  if (key === 'create' || key.startsWith('create ') || key === 'add' || key.startsWith('add ')) {
    return 'create';
  }
  return variant ?? 'secondary';
}

/** Fresa order: Create → Edit → Report → (other) → Back */
function chromeSortKey(label: string, variant?: DetailActionVariant): number {
  const v = resolveChromeVariant(label, variant);
  if (v === 'create') return 0;
  if (v === 'edit') return 1;
  if (v === 'report') return 2;
  if (v === 'back') return 99;
  return 50;
}

export function DetailPageTemplate({
  title,
  eyebrow,
  subtitle,
  statusLabel,
  statusTone = 'slate',
  tabs,
  defaultTab,
  actions,
  actionsDisabled,
  banner,
  detailSection,
  detailTitle = 'Detail',
  afterDetail,
  toolbar,
  toolbarLabel = 'Actions',
  sidebar,
  onBack,
  backTo,
  backLabel = 'Back',
  showChromeBack = true,
  hidePageBackLink = true,
  className = '',
  reserveContinuumRail = false,
}: DetailPageTemplateProps) {
  const formPad = reserveContinuumRail ? 'kf-ops-continuum-form-pad' : '';
  const navigate = useNavigate();
  const initialKey =
    (defaultTab && tabs.some((t) => t.key === defaultTab) ? defaultTab : undefined) ||
    tabs[0]?.key;
  const [activeTab, setActiveTab] = useState(initialKey);

  useEffect(() => {
    if (!defaultTab) return;
    if (!tabs.some((t) => t.key === defaultTab)) return;
    setActiveTab(defaultTab);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only re-select when defaultTab changes (e.g. Show All on job open)
  }, [defaultTab]);

  // If tabs load/change and current key is gone, fall back to defaultTab or first tab.
  const tabKeys = tabs.map((t) => t.key).join('\0');
  useEffect(() => {
    if (!tabs.length) return;
    setActiveTab((prev) => {
      if (prev && tabs.some((t) => t.key === prev)) return prev;
      if (defaultTab && tabs.some((t) => t.key === defaultTab)) return defaultTab;
      return tabs[0]?.key;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- keyed by tab key list, not content identity
  }, [tabKeys, defaultTab]);

  const chromeActions = useMemo(() => {
    const list = [...(actions ?? [])];
    const hasBack = list.some((a) => resolveChromeVariant(a.label, a.variant) === 'back');
    if (showChromeBack && !hasBack && (onBack || backTo)) {
      list.push({
        label: 'Back',
        variant: 'back',
        icon: <ArrowLeft />,
        onClick: () => {
          if (onBack) onBack();
          else if (backTo) navigate(backTo);
        },
      });
    }
    return list.sort(
      (a, b) => chromeSortKey(a.label, a.variant) - chromeSortKey(b.label, b.variant),
    );
  }, [actions, showChromeBack, onBack, backTo, navigate]);

  return (
    <div
      className={`space-y-2.5 bg-[var(--fresa-page-bg,#F4F6F9)] -mx-1 px-1 pb-4 ${className}`.trim()}
    >
      {!hidePageBackLink ? (
        <PageBackLink to={backTo} label={backLabel} onClick={onBack} className="mb-1" />
      ) : null}

      {/* Header chrome */}
      <div className="rounded-sm border border-[var(--fresa-border,#C9D3DF)] bg-white px-3 py-2.5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            {eyebrow ? (
              <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--fresa-header-text,#0A2942)]">
                {eyebrow}
              </p>
            ) : null}
            <div className={`flex flex-wrap items-center gap-2 ${eyebrow ? 'mt-0.5' : ''}`}>
              <h1 className={appType.pageTitle}>{title}</h1>
              {statusLabel ? (
                <Badge variant={TONE_VARIANT[statusTone] ?? 'neutral'} dot={false}>
                  {statusLabel}
                </Badge>
              ) : null}
            </div>
            {subtitle ? <div className={`${appType.pageSubtitle} mt-1`}>{subtitle}</div> : null}
          </div>
          {chromeActions.length > 0 ? (
            <div className="flex flex-wrap items-center justify-end gap-2 print:hidden">
              {chromeActions.map((a) => (
                <Button
                  key={a.label}
                  type="button"
                  size="sm"
                  variant={resolveChromeVariant(a.label, a.variant)}
                  leftIcon={a.icon}
                  onClick={a.onClick}
                  disabled={actionsDisabled}
                >
                  {a.label}
                </Button>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      {banner ? <div className="space-y-2.5">{banner}</div> : null}

      {/* Detail summary strip */}
      {detailSection ? (
        <section className={`${erpForm.section} ${formPad}`.trim()}>
          <div className={erpForm.sectionHeader}>{detailTitle}</div>
          <div className={erpForm.sectionBody}>{detailSection}</div>
        </section>
      ) : null}

      {afterDetail ? <div className="space-y-2.5">{afterDetail}</div> : null}

      {/* Actions / generation toolbar — always full width (never continuum-padded) */}
      {toolbar ? (
        <div className={`${erpForm.toolbar} w-full max-w-none print:hidden`}>
          <p className="mr-1 w-full text-[11px] font-semibold uppercase tracking-wide text-[var(--fresa-header-text,#0A2942)] sm:mr-2 sm:w-auto">
            {toolbarLabel}
          </p>
          {toolbar}
        </div>
      ) : null}

      {/* Tabs + Actions-related toolbars stay full width (no continuum pad). */}
      <section className={erpForm.section}>
        <div className="kf-tabs-scroll flex gap-0 overflow-x-auto border-b border-[var(--color-sidebar-bg,#0A2942)] bg-[var(--color-sidebar-bg,#0A2942)]">
          {tabs.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setActiveTab(t.key)}
              className={cn(
                'shrink-0 border-b-2 px-3.5 py-2.5 text-[12px] font-semibold capitalize transition-colors',
                activeTab === t.key
                  ? 'border-white bg-white/15 text-white'
                  : 'border-transparent text-white/80 hover:bg-white/10 hover:text-white',
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className={sidebar ? 'grid grid-cols-1 gap-4 p-3 lg:grid-cols-12' : 'p-3'}>
          <div className={sidebar ? 'lg:col-span-8' : ''}>
            {tabs.find((t) => t.key === activeTab)?.content}
          </div>
          {sidebar ? <div className="lg:col-span-4">{sidebar}</div> : null}
        </div>
      </section>
    </div>
  );
}
