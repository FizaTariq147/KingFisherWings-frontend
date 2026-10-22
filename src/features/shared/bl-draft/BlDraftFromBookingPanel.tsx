import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { jobService } from '@/features/jobs/services/job.service';
import { shipmentService } from '@/features/shipments/services/shipment.service';
import { getErrorMessage } from '@/features/jobs/utils/getErrorMessage';
import { isUuid } from '@/lib/isUuid';

/**
 * Staff BL draft from booking form:
 * GET …/bl-draft/preview (JSON autofill) → POST generate HBL draft (is_original: false).
 * Works for job or shipment scope.
 */
export function BlDraftFromBookingPanel({
  jobId,
  shipmentId,
  onGenerated,
}: {
  jobId?: string;
  shipmentId?: string;
  onGenerated?: () => void;
}) {
  const scopeJob = jobId && isUuid(jobId) ? jobId : '';
  const scopeShipment = !scopeJob && shipmentId && isUuid(shipmentId) ? shipmentId : '';
  const [preview, setPreview] = useState<Record<string, unknown> | null>(null);
  const [overridesText, setOverridesText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!scopeJob && !scopeShipment) return null;

  const loadPreview = async () => {
    setError(null);
    setMsg(null);
    setLoading(true);
    try {
      const data = scopeJob
        ? await jobService.getBlDraftPreview(scopeJob)
        : await shipmentService.getBlDraftPreview(scopeShipment);
      const rec =
        data && typeof data === 'object' && !Array.isArray(data)
          ? (data as Record<string, unknown>)
          : {};
      setPreview(rec);
      setOverridesText(JSON.stringify(rec, null, 2));
      setMsg('BL draft preview loaded from booking form.');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const generate = async () => {
    setError(null);
    setMsg(null);
    setLoading(true);
    try {
      let overrides: Record<string, unknown> = {};
      if (overridesText.trim()) {
        try {
          const parsed = JSON.parse(overridesText) as unknown;
          if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
            overrides = parsed as Record<string, unknown>;
          }
        } catch {
          setError('Overrides must be valid JSON.');
          setLoading(false);
          return;
        }
      }
      // Preview JSON may include extra autofill keys; POST still sends is_original: false.
      const dto: Record<string, unknown> = {
        is_original: false,
        ...(preview ?? {}),
        ...overrides,
      };
      if (scopeJob) {
        await jobService.generateBlDraft(scopeJob, dto);
      } else {
        await shipmentService.generateBlDraft(scopeShipment, dto);
      }
      setMsg('HBL draft generated (is_original: false). Download from Documents.');
      onGenerated?.();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="space-y-2 rounded-sm border border-[var(--fresa-border,#C9D3DF)] p-3 text-sm">
      <p className="text-[12px] font-semibold uppercase tracking-wide text-[var(--fresa-header-text,#0A2942)]">
        BL draft (from booking form)
      </p>
      <p className="text-[11px] text-[#64748b]">
        Preview autofills from the booking form, then generate an HBL draft PDF
        (not original). Portal customers still use request-draft-bl.
      </p>
      {error ? <p className="text-[var(--color-danger-600)]">{error}</p> : null}
      {msg ? <p className="text-[var(--color-success-700)]">{msg}</p> : null}
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          variant="secondary"
          disabled={loading}
          onClick={() => void loadPreview()}
        >
          {loading ? '…' : 'Load preview'}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="report"
          disabled={loading}
          onClick={() => void generate()}
        >
          {loading ? '…' : 'Generate HBL draft'}
        </Button>
      </div>
      {overridesText ? (
        <label className="block space-y-1">
          <span className="text-[11px] font-medium text-[#334155]">
            Preview / overrides (JSON)
          </span>
          <textarea
            className="min-h-28 w-full rounded-sm border border-[var(--fresa-border,#C9D3DF)] px-2.5 py-2 font-mono text-[11px]"
            value={overridesText}
            onChange={(e) => setOverridesText(e.target.value)}
          />
        </label>
      ) : null}
    </section>
  );
}
