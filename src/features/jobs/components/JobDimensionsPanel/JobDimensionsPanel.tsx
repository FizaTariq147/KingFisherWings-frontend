import { useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { isUuid } from '@/lib/isUuid';
import { useJobActions } from '../../hooks/useJobActions';
import { useJobDetailTab, useJobDimensionLines } from '../../hooks/useJobs';
import { useJobTabResourceMutations } from '../../hooks/useJobTabResources';
import type { Job } from '../../types/job.types';
import { getErrorMessage } from '../../utils/getErrorMessage';

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function lineRows(raw: unknown): Record<string, unknown>[] {
  if (Array.isArray(raw)) {
    return raw.map(asRecord).filter((r): r is Record<string, unknown> => Boolean(r));
  }
  return [];
}

function triggerBlobDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function JobDimensionsPanel({
  job,
  onChanged,
}: {
  job: Job;
  onChanged?: () => void;
}) {
  const actions = useJobActions(job.id);
  const resources = useJobTabResourceMutations(job.id);
  const tabQuery = useJobDetailTab(job.id, 'dimensions');
  const linesQuery = useJobDimensionLines(job.id);
  const fileRef = useRef<HTMLInputElement>(null);

  const [commodityDescription, setCommodityDescription] = useState(
    job.commodity_description || job.commodity || '',
  );
  const [hsCode, setHsCode] = useState(job.hs_code || '');
  const [length, setLength] = useState('');
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const [pcs, setPcs] = useState('1');
  const [gWeight, setGWeight] = useState('');
  const [editLineId, setEditLineId] = useState('');
  const [pasteContent, setPasteContent] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const rows = useMemo(() => lineRows(linesQuery.data), [linesQuery.data]);

  const run = async (fn: () => Promise<unknown>, success: string) => {
    setError(null);
    setMsg(null);
    try {
      await fn();
      setMsg(success);
      onChanged?.();
      void tabQuery.refetch();
      void linesQuery.refetch();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const pending =
    actions.patchDimensions.isPending ||
    resources.addDimensionLine.isPending ||
    resources.updateDimensionLine.isPending ||
    resources.deleteDimensionLine.isPending ||
    resources.syncDimensionsToCargo.isPending ||
    resources.uploadDimensions.isPending ||
    resources.pasteDimensionsUpload.isPending ||
    resources.exportDimensions.isPending ||
    resources.downloadDimensionsSample.isPending;

  const lineDto = () => ({
    length: length === '' ? undefined : Number(length),
    width: width === '' ? undefined : Number(width),
    height: height === '' ? undefined : Number(height),
    no_of_pcs: pcs === '' ? undefined : Number(pcs),
    g_weight: gWeight === '' ? undefined : Number(gWeight),
    hs_code: hsCode.trim() || undefined,
  });

  return (
    <div className="space-y-4 text-sm">
      {error ? <p className="text-[var(--color-danger-600)]">{error}</p> : null}
      {msg ? <p className="text-[var(--color-success-700)]">{msg}</p> : null}

      <section className="space-y-2 rounded-sm border border-[var(--fresa-border,#C9D3DF)] p-3">
        <p className="text-[12px] font-semibold uppercase tracking-wide text-[var(--fresa-header-text,#0A2942)]">
          Header · PATCH /dimensions
        </p>
        <Input
          label="Commodity description"
          value={commodityDescription}
          onChange={(e) => setCommodityDescription(e.target.value)}
        />
        <Input label="HS code" value={hsCode} onChange={(e) => setHsCode(e.target.value)} />
        <Button
          type="button"
          size="sm"
          variant="edit"
          disabled={pending}
          onClick={() =>
            void run(
              () =>
                actions.patchDimensions.mutateAsync({
                  commodity_description: commodityDescription.trim() || undefined,
                  hs_code: hsCode.trim() || undefined,
                }),
              'Dimension header saved.',
            )
          }
        >
          Save header
        </Button>
      </section>

      <section className="space-y-2 rounded-sm border border-[var(--fresa-border,#C9D3DF)] p-3">
        <p className="text-[12px] font-semibold uppercase tracking-wide text-[var(--fresa-header-text,#0A2942)]">
          Lines · GET/POST /dimensions · PATCH/DELETE /dimensions/:lineId
        </p>
        {linesQuery.isLoading ? (
          <p className="text-[13px] text-[#64748b]">Loading dimension lines…</p>
        ) : rows.length === 0 ? (
          <p className="text-[13px] text-[#64748b]">No dimension lines.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-[#e8edf2] text-left text-[11px] uppercase text-[#64748b]">
                  <th className="py-1 pr-2">Line</th>
                  <th className="py-1 pr-2">L×W×H</th>
                  <th className="py-1 pr-2">Pcs</th>
                  <th className="py-1 pr-2">G.Wt</th>
                  <th className="py-1">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => {
                  const id = String(row.id ?? row.line_id ?? '').trim();
                  const lineNo = row.line_no ?? i + 1;
                  return (
                    <tr key={id || i} className="border-b border-[#f1f5f9]">
                      <td className="py-1.5 pr-2">{String(lineNo)}</td>
                      <td className="py-1.5 pr-2">
                        {[row.length, row.width, row.height]
                          .map((v) => (v == null || v === '' ? '—' : String(v)))
                          .join(' × ')}
                      </td>
                      <td className="py-1.5 pr-2">{String(row.no_of_pcs ?? '—')}</td>
                      <td className="py-1.5 pr-2">{String(row.g_weight ?? '—')}</td>
                      <td className="py-1.5">
                        <div className="flex flex-wrap gap-1">
                          <Button
                            type="button"
                            size="sm"
                            variant="secondary"
                            disabled={!id || !isUuid(id)}
                            onClick={() => {
                              setEditLineId(id);
                              setLength(row.length != null ? String(row.length) : '');
                              setWidth(row.width != null ? String(row.width) : '');
                              setHeight(row.height != null ? String(row.height) : '');
                              setPcs(row.no_of_pcs != null ? String(row.no_of_pcs) : '1');
                              setGWeight(row.g_weight != null ? String(row.g_weight) : '');
                            }}
                          >
                            Edit
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="danger"
                            disabled={pending || !id}
                            onClick={() =>
                              void run(
                                () => resources.deleteDimensionLine.mutateAsync(id),
                                'Line deleted.',
                              )
                            }
                          >
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          <Input label="Length" value={length} onChange={(e) => setLength(e.target.value)} />
          <Input label="Width" value={width} onChange={(e) => setWidth(e.target.value)} />
          <Input label="Height" value={height} onChange={(e) => setHeight(e.target.value)} />
          <Input label="Pcs" value={pcs} onChange={(e) => setPcs(e.target.value)} />
          <Input label="G. weight" value={gWeight} onChange={(e) => setGWeight(e.target.value)} />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            variant="create"
            disabled={pending}
            onClick={() =>
              void run(async () => {
                await resources.addDimensionLine.mutateAsync(lineDto());
                setLength('');
                setWidth('');
                setHeight('');
                setPcs('1');
                setGWeight('');
              }, 'Line added.')
            }
          >
            Add line
          </Button>
          <Button
            type="button"
            size="sm"
            variant="edit"
            disabled={pending || !editLineId || !isUuid(editLineId)}
            onClick={() =>
              void run(async () => {
                await resources.updateDimensionLine.mutateAsync({
                  lineId: editLineId,
                  dto: lineDto(),
                });
                setEditLineId('');
              }, 'Line updated.')
            }
          >
            Update line
          </Button>
          <Button
            type="button"
            size="sm"
            variant="success"
            disabled={pending}
            onClick={() =>
              void run(
                () => resources.syncDimensionsToCargo.mutateAsync({}),
                'Synced to cargo.',
              )
            }
          >
            Sync to cargo
          </Button>
        </div>
      </section>

      <section className="space-y-2 rounded-sm border border-[var(--fresa-border,#C9D3DF)] p-3">
        <p className="text-[12px] font-semibold uppercase tracking-wide text-[var(--fresa-header-text,#0A2942)]">
          Upload / export
        </p>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            variant="secondary"
            disabled={pending}
            onClick={() =>
              void run(async () => {
                const blob = await resources.downloadDimensionsSample.mutateAsync();
                triggerBlobDownload(blob, 'dimension-upload-sample.xlsx');
              }, 'Sample downloaded.')
            }
          >
            Download sample
          </Button>
          <Button
            type="button"
            size="sm"
            variant="report"
            disabled={pending}
            onClick={() =>
              void run(async () => {
                const blob = await resources.exportDimensions.mutateAsync();
                triggerBlobDownload(blob, `job-${job.id.slice(0, 8)}-dimensions.csv`);
              }, 'Exported.')
            }
          >
            Export CSV
          </Button>
          <Button
            type="button"
            size="sm"
            variant="primary"
            disabled={pending}
            onClick={() => fileRef.current?.click()}
          >
            Upload file
          </Button>
          <input
            ref={fileRef}
            type="file"
            className="hidden"
            accept=".xlsx,.xls,.csv,.txt"
            onChange={(e) => {
              const file = e.target.files?.[0];
              e.target.value = '';
              if (!file) return;
              void run(async () => {
                const formData = new FormData();
                formData.append('file', file);
                await resources.uploadDimensions.mutateAsync({ formData });
              }, 'Upload submitted.');
            }}
          />
        </div>
        <label className="block">
          <span className="mb-1 block text-[12px] font-medium text-[#334155]">
            Paste EDI / CSV · POST /dimensions/upload/paste
          </span>
          <textarea
            className="min-h-[4.5rem] w-full rounded-sm border border-[var(--fresa-border,#C9D3DF)] px-2.5 py-2 text-[13px]"
            value={pasteContent}
            onChange={(e) => setPasteContent(e.target.value)}
            placeholder="Paste dimension rows…"
          />
        </label>
        <Button
          type="button"
          size="sm"
          variant="create"
          disabled={pending || !pasteContent.trim()}
          onClick={() =>
            void run(
              () =>
                resources.pasteDimensionsUpload.mutateAsync({
                  content: pasteContent,
                  confirm: true,
                }),
              'Paste upload applied.',
            )
          }
        >
          Paste &amp; confirm
        </Button>
      </section>
    </div>
  );
}
