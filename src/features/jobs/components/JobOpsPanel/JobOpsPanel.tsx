import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { useJobSubresourceMutations } from '../../hooks/useJobSubresources';
import { useJobContainers, useJobCutoffs } from '../../hooks/useJobs';
import type { Job } from '../../types/job.types';
import { getErrorMessage } from '../../utils/getErrorMessage';

interface JobOpsPanelProps {
  job: Job;
}

export function JobOpsPanel({ job }: JobOpsPanelProps) {
  const isSeaFcl =
    job.job_type === 'SEA_FCL_EXPORT' || job.job_type === 'SEA_FCL_IMPORT';
  const isAir = job.job_type === 'AIR_EXPORT' || job.job_type === 'AIR_IMPORT';
  const { data: cutoffs } = useJobCutoffs(job.id, isSeaFcl);
  const { data: containers = [], refetch: refetchContainers } = useJobContainers(
    job.id,
    isSeaFcl,
  );
  const mutations = useJobSubresourceMutations(job.id);
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [hawb, setHawb] = useState(job.air_details?.hawb_number ?? '');
  const [mawb, setMawb] = useState(job.air_details?.mawb_number ?? '');
  const [voyage, setVoyage] = useState(job.sea_fcl_details?.voyage_number ?? '');
  const [hbl, setHbl] = useState(job.sea_fcl_details?.hbl_number ?? '');
  const [mbl, setMbl] = useState(job.sea_fcl_details?.mbl_number ?? '');

  const saveAir = async () => {
    setError(null);
    try {
      await mutations.updateAirDetails.mutateAsync({
        hawb_number: hawb || undefined,
        mawb_number: mawb || undefined,
      });
      setMsg('Air details saved.');
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const saveSea = async () => {
    setError(null);
    try {
      await mutations.updateSeaFclDetails.mutateAsync({
        voyage_number: voyage || undefined,
        hbl_number: hbl || undefined,
        mbl_number: mbl || undefined,
      });
      setMsg('Sea FCL details saved.');
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div className="space-y-4">
      {error && <p className="text-sm text-[var(--color-danger-600)]">{error}</p>}
      {msg && <p className="text-sm text-[var(--color-success-700)]">{msg}</p>}

      {isAir && (
        <Card>
          <CardHeader>
            <CardTitle>Air details</CardTitle>
          </CardHeader>
          <div className="px-4 pb-4 grid gap-3 sm:grid-cols-2">
            <Input placeholder="HAWB" value={hawb} onChange={(e) => setHawb(e.target.value)} />
            <Input placeholder="MAWB" value={mawb} onChange={(e) => setMawb(e.target.value)} />
            <Button type="button" onClick={saveAir} disabled={mutations.updateAirDetails.isPending}>
              Save air details
            </Button>
          </div>
        </Card>
      )}

      {isSeaFcl && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Sea FCL details</CardTitle>
            </CardHeader>
            <div className="px-4 pb-4 grid gap-3 sm:grid-cols-2">
              <Input
                placeholder="Voyage"
                value={voyage}
                onChange={(e) => setVoyage(e.target.value)}
              />
              <Input placeholder="HBL" value={hbl} onChange={(e) => setHbl(e.target.value)} />
              <Input placeholder="MBL" value={mbl} onChange={(e) => setMbl(e.target.value)} />
              <div className="flex flex-wrap gap-2 sm:col-span-2">
                <Button
                  type="button"
                  onClick={saveSea}
                  disabled={mutations.updateSeaFclDetails.isPending}
                >
                  Save sea details
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={async () => {
                    setError(null);
                    try {
                      await mutations.submitSi.mutateAsync({});
                      setMsg('SI submission recorded.');
                    } catch (err) {
                      setError(getErrorMessage(err));
                    }
                  }}
                >
                  Submit SI
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={async () => {
                    setError(null);
                    try {
                      await mutations.submitVgm.mutateAsync({});
                      setMsg('VGM submission recorded.');
                    } catch (err) {
                      setError(getErrorMessage(err));
                    }
                  }}
                >
                  Submit VGM
                </Button>
              </div>
            </div>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Cutoffs</CardTitle>
            </CardHeader>
            <pre className="px-4 pb-4 text-xs overflow-auto max-h-40">
              {cutoffs ? JSON.stringify(cutoffs, null, 2) : '—'}
            </pre>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Containers ({containers.length})</CardTitle>
            </CardHeader>
            <div className="px-4 pb-4 space-y-2 text-sm">
              {containers.length === 0 ? (
                <p className="text-[var(--color-neutral-400)]">No containers.</p>
              ) : (
                containers.map((raw) => {
                  const c = raw as {
                    id: string;
                    container_number?: string;
                    status?: string;
                  };
                  return (
                    <div key={c.id} className="flex justify-between border-b py-1">
                      <span>{c.container_number || c.id.slice(0, 8)}</span>
                      <span className="text-[var(--color-neutral-400)]">{c.status}</span>
                    </div>
                  );
                })
              )}
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={() => refetchContainers()}
              >
                Refresh containers
              </Button>
            </div>
          </Card>
        </>
      )}

      {!isAir && !isSeaFcl && (
        <p className="text-sm text-[var(--color-neutral-400)]">
          No mode-specific ops panel for this job type. Use Overview and Documents tabs.
        </p>
      )}
    </div>
  );
}
