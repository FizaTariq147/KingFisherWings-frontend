import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useDocumentationJobOpsActions } from '@/features/documentation/hooks/useDocumentation';
import type { UpdateJobDocFieldsDto } from '@/features/documentation/types/documentation.types';
import { useJobReferences } from '../../hooks/useJobs';
import type { Job } from '../../types/job.types';
import { getErrorMessage } from '../../utils/getErrorMessage';

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function pickRefValue(refs: unknown, type: string): string {
  const root = asRecord(refs);
  if (!root) return '';
  const map = asRecord(root.references) ?? asRecord(root.data) ?? root;
  const direct = map[type] ?? map[type.toLowerCase()];
  if (typeof direct === 'string') return direct;
  const listRaw = root.items ?? root.references;
  if (Array.isArray(listRaw)) {
    for (const item of listRaw) {
      const rec = asRecord(item);
      if (!rec) continue;
      const t = String(rec.type ?? rec.reference_type ?? '').toUpperCase();
      if (t === type) return String(rec.value ?? rec.reference_no ?? rec.number ?? '');
    }
  }
  return '';
}

function pickJobStr(job: Job, ...keys: string[]): string {
  const raw = job as Job & Record<string, unknown>;
  for (const k of keys) {
    const v = raw[k];
    if (v != null && String(v).trim()) return String(v).trim();
  }
  return '';
}

/**
 * Docs BE Phase 1 — PATCH /documentation/jobs/:jobId/doc-fields
 * (PortNet, SABER, RA, overseas agent, VGM cutoff, voyage).
 * Deferred: vendor INV OCR, bulk invoice print, Get Job Charges façade.
 */
export function JobDocumentationExtrasPanel({
  job,
  onChanged,
}: {
  job: Job;
  onChanged?: () => void;
}) {
  const refsQuery = useJobReferences(job.id);
  const docOps = useDocumentationJobOpsActions();

  const initial = useMemo(
    () => ({
      portnet:
        pickJobStr(job, 'portnet_ref_no') || pickRefValue(refsQuery.data, 'PORTNET'),
      saber: pickRefValue(refsQuery.data, 'SABER'),
      ra: pickRefValue(refsQuery.data, 'RA_CODE'),
      agent: pickJobStr(job, 'overseas_agent_id', 'overseas_agent_party_id'),
      vgm: pickJobStr(job, 'vgm_cutoff', 'vgm_cutoff_date'),
      voyage: pickJobStr(job, 'voyage_number'),
    }),
    [job, refsQuery.data],
  );

  const [portnet, setPortnet] = useState('');
  const [saber, setSaber] = useState('');
  const [raCode, setRaCode] = useState('');
  const [overseasAgentId, setOverseasAgentId] = useState('');
  const [vgmCutoff, setVgmCutoff] = useState('');
  const [voyageNumber, setVoyageNumber] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    setPortnet(initial.portnet);
    setSaber(initial.saber);
    setRaCode(initial.ra);
    setOverseasAgentId(initial.agent);
    setVgmCutoff(initial.vgm.slice(0, 10));
    setVoyageNumber(initial.voyage);
  }, [initial]);

  const save = async () => {
    setError(null);
    setMsg(null);
    const dto: UpdateJobDocFieldsDto = {
      portnet_ref_no: portnet.trim() || undefined,
      saber_certificate_no: saber.trim() || undefined,
      ra_code: raCode.trim() || undefined,
      overseas_agent_party_id: overseasAgentId.trim() || undefined,
      vgm_cutoff_date: vgmCutoff || undefined,
      voyage_number: voyageNumber.trim() || undefined,
    };
    if (!Object.values(dto).some(Boolean)) {
      setError('Enter at least one documentation field to save.');
      return;
    }
    try {
      await docOps.patchDocFields.mutateAsync({ jobId: job.id, dto });
      setMsg('Documentation fields saved.');
      onChanged?.();
      void refsQuery.refetch();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div className="space-y-4 rounded-md border border-gray-200 bg-white p-4">
      <div>
        <h3 className="text-sm font-semibold text-gray-800">Documentation fields</h3>
        <p className="mt-0.5 text-xs text-gray-500">
          PATCH /documentation/jobs/:id/doc-fields — PortNet, SABER, RA, overseas agent, VGM cutoff,
          voyage (Docs BE Phase 1).
        </p>
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {msg ? <p className="text-sm text-emerald-700">{msg}</p> : null}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Input
          label="PortNet ref no."
          value={portnet}
          onChange={(e) => setPortnet(e.target.value)}
        />
        <Input label="SABER certificate" value={saber} onChange={(e) => setSaber(e.target.value)} />
        <Input label="RA code" value={raCode} onChange={(e) => setRaCode(e.target.value)} />
        <Input
          label="Overseas agent party id"
          value={overseasAgentId}
          onChange={(e) => setOverseasAgentId(e.target.value)}
          placeholder="party UUID"
        />
        <Input
          label="VGM cutoff"
          type="date"
          value={vgmCutoff}
          onChange={(e) => setVgmCutoff(e.target.value)}
        />
        <Input
          label="Voyage number"
          value={voyageNumber}
          onChange={(e) => setVoyageNumber(e.target.value)}
        />
      </div>

      <Button
        type="button"
        size="sm"
        disabled={docOps.patchDocFields.isPending}
        onClick={() => void save()}
      >
        Save documentation fields
      </Button>
      <p className="text-[11px] text-gray-500">
        SABER / RA also remain on Party → typed references. Overseas agent can be set on the
        Organization tab. Get Job Charges stays on Costing (/jobs/:id/get-job-charges).
      </p>
    </div>
  );
}
