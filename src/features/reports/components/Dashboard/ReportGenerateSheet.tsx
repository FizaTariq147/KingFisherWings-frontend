import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { ReportGeneratePanel } from '../ReportCatalog/ReportGeneratePanel';
import type { ReportTemplate } from '../../types/reportCatalog.types';

type ReportGenerateSheetProps = {
  open: boolean;
  template: ReportTemplate | null;
  onClose: () => void;
  onTemplateUpdated?: (template: ReportTemplate) => void;
};

/**
 * Right-side sheet hosting the existing ReportGeneratePanel.
 * No new generate APIs — preview/download stay inside the panel.
 */
export function ReportGenerateSheet({
  open,
  template,
  onClose,
  onTemplateUpdated,
}: ReportGenerateSheetProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    panelRef.current?.focus();
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  if (!open || !template) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={`Generate ${template.name}`}
        tabIndex={-1}
        className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-xl bg-[var(--color-neutral-50)] shadow-2xl flex flex-col outline-none"
        style={{ boxShadow: '-8px 0 32px rgba(0,0,0,0.12)' }}
      >
        <div className="flex items-center justify-between gap-3 px-4 py-3 bg-white border-b border-[var(--color-neutral-200)]">
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-[var(--color-neutral-900)] truncate">
              Generate report
            </h2>
            <p className="text-[11px] text-[var(--color-neutral-500)] truncate font-mono">
              {template.code}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close generate panel"
            className="p-1.5 rounded-lg text-[var(--color-neutral-400)] hover:bg-[var(--color-neutral-100)]"
          >
            <X className="size-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <ReportGeneratePanel
            template={template}
            onClose={onClose}
            discoveryMode
            onTemplateUpdated={onTemplateUpdated}
          />
        </div>
      </div>
    </>
  );
}
