import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { AirJobWorkflowPanel } from '../AirJobWorkflowPanel';
import { useJobSubresourceMutations } from '../../hooks/useJobSubresources';
import {
  useJobAirBookingForm,
  useJobContainers,
  useJobCutoffs,
  useUpdateJobAirBookingForm,
} from '../../hooks/useJobs';
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
  const airBookingQuery = useJobAirBookingForm(job.id, isAir);
  const updateAirBooking = useUpdateJobAirBookingForm(job.id);
  const mutations = useJobSubresourceMutations(job.id);
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [hawb, setHawb] = useState(job.air_details?.hawb_number ?? '');
  const [mawb, setMawb] = useState(job.air_details?.mawb_number ?? '');
  const [voyage, setVoyage] = useState(job.sea_fcl_details?.voyage_number ?? '');
  const [hbl, setHbl] = useState(job.sea_fcl_details?.hbl_number ?? '');
  const [mbl, setMbl] = useState(job.sea_fcl_details?.mbl_number ?? '');
  const [bookingForm, setBookingForm] = useState({
    flight_number: '',
    flight_date: '',
    airline_id: '',
    origin_airport_id: '',
    dest_airport_id: '',
    pieces: '',
    gross_weight: '',
    chargeable_weight: '',
    volume_cbm: '',
    commodity: '',
    notes: '',
  });

  useEffect(() => {
    const form = airBookingQuery.data;
    if (!form) return;
    setBookingForm({
      flight_number: String(form.flight_number ?? ''),
      flight_date: String(form.flight_date ?? '').slice(0, 10),
      airline_id: String(form.airline_id ?? ''),
      origin_airport_id: String(form.origin_airport_id ?? ''),
      dest_airport_id: String(form.dest_airport_id ?? ''),
      pieces: form.pieces != null ? String(form.pieces) : '',
      gross_weight: form.gross_weight != null ? String(form.gross_weight) : '',
      chargeable_weight: form.chargeable_weight != null ? String(form.chargeable_weight) : '',
      volume_cbm: form.volume_cbm != null ? String(form.volume_cbm) : '',
      commodity: String(form.commodity ?? ''),
      notes: String(form.notes ?? ''),
    });
    if (form.hawb_number) setHawb(String(form.hawb_number));
    if (form.mawb_number) setMawb(String(form.mawb_number));
  }, [airBookingQuery.data]);

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

  const saveAirBookingForm = async () => {
    setError(null);
    try {
      const dto: Record<string, unknown> = {
        hawb_number: hawb || undefined,
        mawb_number: mawb || undefined,
        flight_number: bookingForm.flight_number.trim() || undefined,
        flight_date: bookingForm.flight_date.trim() || undefined,
        airline_id: bookingForm.airline_id.trim() || undefined,
        origin_airport_id: bookingForm.origin_airport_id.trim() || undefined,
        dest_airport_id: bookingForm.dest_airport_id.trim() || undefined,
        commodity: bookingForm.commodity.trim() || undefined,
        notes: bookingForm.notes.trim() || undefined,
      };
      if (bookingForm.pieces.trim()) dto.pieces = Number(bookingForm.pieces);
      if (bookingForm.gross_weight.trim()) dto.gross_weight = Number(bookingForm.gross_weight);
      if (bookingForm.chargeable_weight.trim()) {
        dto.chargeable_weight = Number(bookingForm.chargeable_weight);
      }
      if (bookingForm.volume_cbm.trim()) dto.volume_cbm = Number(bookingForm.volume_cbm);
      await updateAirBooking.mutateAsync(dto);
      setMsg('Air booking form saved.');
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
        <>
          <AirJobWorkflowPanel jobId={job.id} jobType={job.job_type} />

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

          <Card>
            <CardHeader>
              <CardTitle>Air booking form</CardTitle>
            </CardHeader>
            <div className="px-4 pb-4 space-y-3">
              <p className="text-xs text-[var(--color-neutral-500)]">
                GET/PUT /jobs/{'{id}'}/air-booking-form
              </p>
              {airBookingQuery.isError ? (
                <p className="text-sm text-[var(--color-danger-600)]">
                  {getErrorMessage(airBookingQuery.error)}
                </p>
              ) : null}
              <div className="grid gap-3 sm:grid-cols-2">
                <Input
                  placeholder="Flight number"
                  value={bookingForm.flight_number}
                  onChange={(e) =>
                    setBookingForm((prev) => ({ ...prev, flight_number: e.target.value }))
                  }
                />
                <Input
                  type="date"
                  placeholder="Flight date"
                  value={bookingForm.flight_date}
                  onChange={(e) =>
                    setBookingForm((prev) => ({ ...prev, flight_date: e.target.value }))
                  }
                />
                <Input
                  placeholder="Airline ID"
                  value={bookingForm.airline_id}
                  onChange={(e) =>
                    setBookingForm((prev) => ({ ...prev, airline_id: e.target.value }))
                  }
                />
                <Input
                  placeholder="Origin airport ID"
                  value={bookingForm.origin_airport_id}
                  onChange={(e) =>
                    setBookingForm((prev) => ({ ...prev, origin_airport_id: e.target.value }))
                  }
                />
                <Input
                  placeholder="Dest airport ID"
                  value={bookingForm.dest_airport_id}
                  onChange={(e) =>
                    setBookingForm((prev) => ({ ...prev, dest_airport_id: e.target.value }))
                  }
                />
                <Input
                  placeholder="Pieces"
                  value={bookingForm.pieces}
                  onChange={(e) => setBookingForm((prev) => ({ ...prev, pieces: e.target.value }))}
                />
                <Input
                  placeholder="Gross weight"
                  value={bookingForm.gross_weight}
                  onChange={(e) =>
                    setBookingForm((prev) => ({ ...prev, gross_weight: e.target.value }))
                  }
                />
                <Input
                  placeholder="Chargeable weight"
                  value={bookingForm.chargeable_weight}
                  onChange={(e) =>
                    setBookingForm((prev) => ({ ...prev, chargeable_weight: e.target.value }))
                  }
                />
                <Input
                  placeholder="Volume CBM"
                  value={bookingForm.volume_cbm}
                  onChange={(e) =>
                    setBookingForm((prev) => ({ ...prev, volume_cbm: e.target.value }))
                  }
                />
                <Input
                  placeholder="Commodity"
                  value={bookingForm.commodity}
                  onChange={(e) =>
                    setBookingForm((prev) => ({ ...prev, commodity: e.target.value }))
                  }
                />
                <Input
                  className="sm:col-span-2"
                  placeholder="Notes"
                  value={bookingForm.notes}
                  onChange={(e) => setBookingForm((prev) => ({ ...prev, notes: e.target.value }))}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  disabled={airBookingQuery.isFetching}
                  onClick={() => void airBookingQuery.refetch()}
                >
                  Reload form
                </Button>
                <Button
                  type="button"
                  disabled={updateAirBooking.isPending || airBookingQuery.isLoading}
                  onClick={() => void saveAirBookingForm()}
                >
                  Save booking form
                </Button>
              </div>
            </div>
          </Card>
        </>
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
              <Button type="button" size="sm" variant="secondary" onClick={() => refetchContainers()}>
                Refresh
              </Button>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
