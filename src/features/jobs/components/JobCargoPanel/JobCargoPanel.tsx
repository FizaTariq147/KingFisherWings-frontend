import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { useInlineValidation } from '@/lib/validation';
import { isUuid } from '@/lib/isUuid';
import { useJobSubresourceMutations } from '../../hooks/useJobSubresources';
import { jobKeys, useJobCargo } from '../../hooks/useJobs';
import { createJobCargoSchema } from '../../schemas/job.schema';
import { jobService } from '../../services/job.service';
import { getErrorMessage } from '../../utils/getErrorMessage';
import { resolveJobDocumentFileUrl } from '../../utils/resolveJobDocumentFileUrl';
import { useFileDownload } from '@/features/files/hooks/useFileDownload';
import { useAuthStore } from '@/store/authStore';

interface JobCargoPanelProps {
  jobId: string;
}

function emptyToUndef(value: string): string | undefined {
  const t = value.trim();
  return t ? t : undefined;
}

function numberOrUndef(value: string): number | undefined {
  if (value.trim() === '') return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

function CargoDocuments({ jobId, cargoId }: { jobId: string; cargoId: string }) {
  const tenantId = useAuthStore((s) => s.user?.tenantId);
  const { downloadStoredFile } = useFileDownload();
  const qc = useQueryClient();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const docsQuery = useQuery({
    queryKey: [...jobKeys.all, 'cargo-documents', jobId, cargoId] as const,
    queryFn: () => jobService.listCargoDocuments(jobId, cargoId),
    enabled: isUuid(jobId) && isUuid(cargoId),
    staleTime: 15_000,
  });

  const upload = async (file: File) => {
    setUploading(true);
    setError(null);
    try {
      await jobService.uploadCargoDocument(jobId, cargoId, file);
      await docsQuery.refetch();
      void qc.invalidateQueries({ queryKey: jobKeys.documents(jobId) });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setUploading(false);
    }
  };

  const docs = docsQuery.data ?? [];

  return (
    <div className="mt-2 space-y-1.5 rounded-sm border border-[var(--color-neutral-100)] bg-[var(--fresa-page-bg,#F4F6F9)] px-2 py-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--color-neutral-600)]">
          Documents
        </p>
        <label className="inline-flex cursor-pointer items-center">
          <input
            type="file"
            className="sr-only"
            disabled={uploading}
            onChange={(e) => {
              const file = e.target.files?.[0];
              e.target.value = '';
              if (file) void upload(file);
            }}
          />
          <span className="rounded-sm border border-[var(--fresa-border,#C9D3DF)] bg-white px-2 py-1 text-[11px] font-medium text-[var(--fresa-header-text,#0A2942)] hover:bg-white/80">
            {uploading ? 'Uploading…' : 'Upload document'}
          </span>
        </label>
      </div>
      {error ? <p className="text-[11px] text-[var(--color-danger-600)]">{error}</p> : null}
      {docsQuery.isLoading ? (
        <p className="text-[11px] text-[var(--color-neutral-400)]">Loading documents…</p>
      ) : docs.length === 0 ? (
        <p className="text-[11px] text-[var(--color-neutral-400)]">No documents for this cargo line.</p>
      ) : (
        <ul className="space-y-1">
          {docs.map((raw, idx) => {
            const d = raw as {
              id?: string;
              file_name?: string;
              fileName?: string;
              file_url?: string;
              s3_key?: string;
              document_type?: string;
            };
            const name = d.file_name || d.fileName || d.document_type || `Document ${idx + 1}`;
            const url = resolveJobDocumentFileUrl(
              {
                file_url: d.file_url,
                s3_key: d.s3_key,
                file_name: d.file_name || d.fileName,
              },
              tenantId,
            );
            return (
              <li
                key={d.id || `${name}-${idx}`}
                className="flex items-center justify-between gap-2 text-[12px]"
              >
                <span className="min-w-0 truncate" title={name}>
                  {name}
                </span>
                {url ? (
                  <button
                    type="button"
                    className="shrink-0 text-[11px] font-medium underline"
                    onClick={() =>
                      void downloadStoredFile(url, { displayName: name })
                    }
                  >
                    Download
                  </button>
                ) : d.id ? (
                  <button
                    type="button"
                    className="shrink-0 text-[11px] font-medium underline"
                    onClick={() =>
                      void jobService
                        .downloadJobDocument(jobId, d.id!, name)
                        .catch((err) => setError(getErrorMessage(err)))
                    }
                  >
                    Download
                  </button>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export function JobCargoPanel({ jobId }: JobCargoPanelProps) {
  const { data: cargo = [], refetch } = useJobCargo(jobId);
  const mutations = useJobSubresourceMutations(jobId);
  const validation = useInlineValidation();
  const [error, setError] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [packages, setPackages] = useState('');
  const [gross, setGross] = useState('');
  const [volume, setVolume] = useState('');
  const [hs, setHs] = useState('');
  const [expandedCargoId, setExpandedCargoId] = useState<string | null>(null);

  const run = async (fn: () => Promise<unknown>) => {
    setError(null);
    try {
      await fn();
      refetch();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const add = async () => {
    const ok = await validation.runValidated(
      createJobCargoSchema,
      {
        description: emptyToUndef(description),
        packages: numberOrUndef(packages),
        gross_weight: numberOrUndef(gross),
        measurement: numberOrUndef(volume),
        hs_code: emptyToUndef(hs),
      },
      async (dto) => {
        await mutations.createCargo.mutateAsync(dto);
        setDescription('');
        setPackages('');
        setGross('');
        setVolume('');
        setHs('');
        refetch();
      },
    );
    if (!ok) setError(null);
  };

  return (
    <div className="space-y-4">
      {(error || validation.formError) && (
        <p className="text-sm text-[var(--color-danger-600)]">{error || validation.formError}</p>
      )}
      <Card>
        <CardHeader>
          <CardTitle>Cargo lines</CardTitle>
        </CardHeader>
        <div className="px-4 pb-4 space-y-2 text-sm">
          {cargo.length === 0 ? (
            <p className="text-[var(--color-neutral-400)]">No cargo lines.</p>
          ) : (
            cargo.map((raw) => {
              const c = raw as {
                id: string;
                description?: string;
                packages?: number;
                gross_weight?: number;
                volume_cbm?: number;
                hs_code?: string;
              };
              const open = expandedCargoId === c.id;
              return (
                <div
                  key={c.id}
                  className="border-b border-[var(--color-neutral-100)] py-2"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-medium">{c.description || 'Cargo'}</p>
                      <p className="text-xs text-[var(--color-neutral-400)]">
                        Pkgs {c.packages ?? '—'} · GW {c.gross_weight ?? '—'} · CBM{' '}
                        {c.volume_cbm ?? '—'} · HS {c.hs_code || '—'}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        onClick={() =>
                          setExpandedCargoId((prev) => (prev === c.id ? null : c.id))
                        }
                      >
                        {open ? 'Hide docs' : 'Documents'}
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        onClick={() =>
                          run(() =>
                            mutations.updateCargo.mutateAsync({
                              cargoId: c.id,
                              dto: {
                                description: c.description,
                                packages: c.packages,
                                gross_weight: c.gross_weight,
                              },
                            }),
                          )
                        }
                      >
                        Touch update
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="danger"
                        onClick={() => run(() => mutations.deleteCargo.mutateAsync(c.id))}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                  {open ? <CargoDocuments jobId={jobId} cargoId={c.id} /> : null}
                </div>
              );
            })
          )}
        </div>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Add cargo</CardTitle>
        </CardHeader>
        <div className="px-4 pb-4 grid gap-2 sm:grid-cols-2">
          <Input
            placeholder="Description"
            value={description}
            error={validation.fieldError('description')}
            onChange={(e) => {
              setDescription(e.target.value);
              validation.clearField('description');
            }}
            className="sm:col-span-2"
          />
          <Input
            placeholder="Packages"
            type="number"
            value={packages}
            error={validation.fieldError('packages')}
            onChange={(e) => {
              setPackages(e.target.value);
              validation.clearField('packages');
            }}
          />
          <Input
            placeholder="Gross weight"
            type="number"
            value={gross}
            error={validation.fieldError('gross_weight')}
            onChange={(e) => {
              setGross(e.target.value);
              validation.clearField('gross_weight');
            }}
          />
          <Input
            placeholder="Volume CBM"
            type="number"
            value={volume}
            error={validation.fieldError('measurement')}
            onChange={(e) => {
              setVolume(e.target.value);
              validation.clearField('measurement');
            }}
          />
          <Input
            placeholder="HS code"
            value={hs}
            error={validation.fieldError('hs_code')}
            onChange={(e) => {
              setHs(e.target.value);
              validation.clearField('hs_code');
            }}
          />
          <Button
            type="button"
            className="sm:col-span-2 w-fit"
            disabled={mutations.createCargo.isPending}
            onClick={() => void add()}
          >
            Add cargo
          </Button>
        </div>
      </Card>
    </div>
  );
}
