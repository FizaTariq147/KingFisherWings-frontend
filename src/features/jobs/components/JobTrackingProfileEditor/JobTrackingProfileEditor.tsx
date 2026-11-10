import { useEffect, useState, type ReactNode } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  useJob,
  useJobTrackingProfile,
  useUpsertJobTrackingProfile,
} from '../../hooks/useJobs';
import type {
  ArrivalReportStatusRowDto,
  CustomsStatusRowDto,
  JobTrackingLegDto,
  JobTrackingPortOfCallDto,
  JobTrackingProfile,
  ManifestStatusRowDto,
  QtyGwVolDto,
} from '../../types/job.types';
import { isAirJobType } from '../../constants/job.constants';
import { getErrorMessage } from '../../utils/getErrorMessage';
import {
  emptyJobTrackingProfile,
  seedTrackingProfileFromJob,
  toUpsertJobTrackingProfileDto,
} from '../../utils/normalizeJobTrackingProfile';

const fieldClass =
  'h-9 w-full rounded-md border border-[var(--fresa-border,#C9D3DF)] bg-white px-2.5 text-[13px] text-[var(--color-neutral-800)] focus:border-[var(--color-primary-500)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary-500)]';

function Section({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-3 rounded-lg border border-[var(--fresa-border,#C9D3DF)] bg-white p-4">
      <div>
        <h3 className="text-[12px] font-semibold uppercase tracking-wide text-[var(--fresa-header-text,#0A2942)]">
          {title}
        </h3>
        {hint ? <p className="mt-0.5 text-[12px] text-[#64748b]">{hint}</p> : null}
      </div>
      {children}
    </section>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block space-y-1">
      <span className="text-[11px] font-medium text-[var(--color-neutral-600)]">{label}</span>
      {children}
    </label>
  );
}

function TextInput({
  value,
  onChange,
  placeholder,
  type = 'text',
}: {
  value: string | number | null | undefined;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <input
      type={type}
      className={fieldClass}
      value={value ?? ''}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

function NumInput({
  value,
  onChange,
  placeholder,
}: {
  value: number | null | undefined;
  onChange: (v: number | null) => void;
  placeholder?: string;
}) {
  return (
    <input
      type="number"
      step="any"
      className={fieldClass}
      value={value ?? ''}
      placeholder={placeholder}
      onChange={(e) => {
        const raw = e.target.value;
        if (raw === '') {
          onChange(null);
          return;
        }
        const n = Number(raw);
        onChange(Number.isFinite(n) ? n : null);
      }}
    />
  );
}

function RowActions({ onRemove }: { onRemove: () => void }) {
  return (
    <Button type="button" size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={onRemove}>
      <Trash2 className="h-4 w-4 text-[var(--color-danger-600)]" />
    </Button>
  );
}

function ensureEditorLegs(legs: JobTrackingLegDto[] | undefined): JobTrackingLegDto[] {
  const byNo = new Map<number, JobTrackingLegDto>();
  for (const leg of legs ?? []) {
    const n = leg.leg_no ?? 0;
    if (n === 1 || n === 2) byNo.set(n, { ...leg, leg_no: n });
  }
  return [
    byNo.get(1) ?? { leg_no: 1 },
    byNo.get(2) ?? { leg_no: 2 },
  ];
}

/**
 * Staff editor for GET|PUT /jobs/:id/tracking/profile.
 * Seeds from job on first open; saved values feed staff tracking and public /track.
 */
export function JobTrackingProfileEditor({
  jobId,
  onSaved,
  onCancel,
}: {
  jobId: string;
  onSaved?: () => void;
  onCancel?: () => void;
}) {
  const profileQuery = useJobTrackingProfile(jobId, true);
  const jobQuery = useJob(jobId);
  const upsert = useUpsertJobTrackingProfile(jobId);

  const [form, setForm] = useState<JobTrackingProfile>(() => emptyJobTrackingProfile());
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(false);
  }, [jobId]);

  useEffect(() => {
    if (!profileQuery.data || hydrated) return;
    // Wait for job (or its failure) so first-open seed can fill BL / ports / qty.
    if (jobQuery.isLoading) return;
    setForm(seedTrackingProfileFromJob(profileQuery.data, jobQuery.data));
    setHydrated(true);
  }, [profileQuery.data, jobQuery.data, jobQuery.isLoading, hydrated]);

  const patch = (partial: Partial<JobTrackingProfile>) =>
    setForm((prev) => ({ ...prev, ...partial }));

  const patchLeg = (legNo: 1 | 2, partial: Partial<JobTrackingLegDto>) => {
    setForm((prev) => ({
      ...prev,
      legs: (prev.legs ?? []).map((leg) =>
        leg.leg_no === legNo ? { ...leg, ...partial } : leg,
      ),
    }));
  };

  const patchQty = (partial: Partial<QtyGwVolDto>) => {
    setForm((prev) => ({
      ...prev,
      qty_gw_vol: { ...(prev.qty_gw_vol ?? {}), ...partial },
    }));
  };

  const save = async () => {
    setError(null);
    setMsg(null);
    try {
      await upsert.mutateAsync(toUpsertJobTrackingProfileDto(form));
      setMsg('Tracking profile saved.');
      onSaved?.();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const legs = form.legs ?? [];
  const firstLeg = legs.find((l) => l.leg_no === 1) ?? { leg_no: 1 };
  const secondLeg = legs.find((l) => l.leg_no === 2) ?? { leg_no: 2 };
  const poc = form.port_of_call ?? [];
  const arrival = form.arrival_report ?? [];
  const customs = form.customs_status ?? [];
  const preManifest = form.pre_manifest ?? [];
  const qty = form.qty_gw_vol ?? {};
  const detailedEntries = Object.entries(form.detailed_data ?? {});
  const isAir = isAirJobType(jobQuery.data?.job_type);

  const patchFlight = (
    legNo: 1 | 2,
    partial: Partial<JobTrackingLegDto> & Partial<JobTrackingProfile>,
  ) => {
    setForm((prev) => {
      const nextLegs = ensureEditorLegs(prev.legs).map((leg) =>
        leg.leg_no === legNo ? { ...leg, ...partial } : leg,
      );
      const first = nextLegs.find((l) => l.leg_no === 1) ?? nextLegs[0];
      const top =
        legNo === 1
          ? {
              airline_name: partial.airline_name ?? prev.airline_name ?? first?.airline_name,
              flight_number: partial.flight_number ?? prev.flight_number ?? first?.flight_number,
              arrival_flight_number:
                partial.arrival_flight_number ??
                prev.arrival_flight_number ??
                first?.arrival_flight_number,
              mawb_number: partial.mawb_number ?? prev.mawb_number ?? first?.mawb_number,
              hawb_number: partial.hawb_number ?? prev.hawb_number ?? first?.hawb_number,
              flight_date: partial.flight_date ?? prev.flight_date ?? first?.flight_date,
              flight_status: partial.flight_status ?? prev.flight_status ?? first?.flight_status,
            }
          : {};
      // Keep documented sea mirrors in sync so GET/track still resolve flight if extras are stripped.
      const mirroredLegs = nextLegs.map((leg) =>
        leg.leg_no === legNo
          ? {
              ...leg,
              vessel_name: leg.airline_name || leg.vessel_name,
              voyage_number: leg.flight_number || leg.voyage_number,
            }
          : leg,
      );
      return { ...prev, ...top, legs: mirroredLegs };
    });
  };

  return (
    <div className="space-y-4 text-sm">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-[12px] font-semibold uppercase tracking-wide text-[var(--fresa-header-text,#0A2942)]">
            Edit tracking profile
          </p>
          <p className="mt-1 text-[12px] text-[#64748b]">
            {isAir
              ? 'Flight / AWB, airports, port of call, cargo / customs / pre-manifest / qty. Seeded from the job API on first open; Track & Trace reads the same profile.'
              : 'BL, ports, legs, port of call, cargo / customs / pre-manifest / qty. Seeded from the job on first open; public /track uses the same shape.'}
          </p>
        </div>
        {onCancel ? (
          <Button type="button" size="sm" variant="secondary" onClick={onCancel}>
            Close editor
          </Button>
        ) : null}
      </div>

      {error ? <p className="text-[var(--color-danger-600)]">{error}</p> : null}
      {msg ? <p className="text-[var(--color-success-700)]">{msg}</p> : null}
      {profileQuery.isLoading || (!hydrated && jobQuery.isLoading) ? (
        <p className="text-[13px] text-[#64748b]">Loading tracking profile…</p>
      ) : null}
      {profileQuery.isError ? (
        <p className="text-[13px] text-red-700">{getErrorMessage(profileQuery.error)}</p>
      ) : null}

      <Section
        title="Header / route"
        hint={
          isAir
            ? 'Document ref, origin & dest airports, terminal cut-off'
            : 'BL number, origin & dest ports, terminal cut-off'
        }
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Field label={isAir ? 'Document / AWB ref' : 'BL number'}>
            <TextInput
              value={form.bl_number}
              onChange={(v) => patch({ bl_number: v })}
              placeholder={isAir ? 'HAWB / MAWB' : 'HBL / MBL / HAWB'}
            />
          </Field>
          <Field label={isAir ? 'Origin airport' : 'Port origin'}>
            <TextInput
              value={form.origin_port}
              onChange={(v) => patch({ origin_port: v, origin_label: v })}
            />
          </Field>
          <Field label={isAir ? 'Dest airport' : 'Dest port'}>
            <TextInput
              value={form.dest_port}
              onChange={(v) => patch({ dest_port: v, dest_label: v })}
            />
          </Field>
          <Field label="Terminal cut-off">
            <TextInput
              type="datetime-local"
              value={String(form.terminal_cutoff_at ?? '').slice(0, 16)}
              onChange={(v) => patch({ terminal_cutoff_at: v || undefined })}
            />
          </Field>
          <Field label="AT before">
            <TextInput
              type="datetime-local"
              value={String(form.at_before ?? '').slice(0, 16)}
              onChange={(v) => patch({ at_before: v || undefined })}
            />
          </Field>
        </div>
      </Section>

      {isAir ? (
        <>
          <Section
            title="Flight"
            hint="Saved on tracking profile from job air details / staff entry — shown on Track & Trace"
          >
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <Field label="Airline">
                <TextInput
                  value={form.airline_name ?? firstLeg.airline_name}
                  onChange={(v) => patchFlight(1, { airline_name: v })}
                />
              </Field>
              <Field label="Flight number">
                <TextInput
                  value={form.flight_number ?? firstLeg.flight_number}
                  onChange={(v) =>
                    patchFlight(1, { flight_number: v, voyage_number: v })
                  }
                  placeholder="e.g. EK045"
                />
              </Field>
              <Field label="Arrival flight number">
                <TextInput
                  value={form.arrival_flight_number ?? firstLeg.arrival_flight_number}
                  onChange={(v) => patchFlight(1, { arrival_flight_number: v })}
                />
              </Field>
              <Field label="MAWB">
                <TextInput
                  value={form.mawb_number ?? firstLeg.mawb_number}
                  onChange={(v) => patchFlight(1, { mawb_number: v })}
                />
              </Field>
              <Field label="HAWB">
                <TextInput
                  value={form.hawb_number ?? firstLeg.hawb_number}
                  onChange={(v) => patchFlight(1, { hawb_number: v })}
                />
              </Field>
              <Field label="Flight status">
                <TextInput
                  value={form.flight_status ?? firstLeg.flight_status}
                  onChange={(v) => patchFlight(1, { flight_status: v })}
                />
              </Field>
              <Field label="Flight date">
                <TextInput
                  type="date"
                  value={String(form.flight_date ?? firstLeg.flight_date ?? '').slice(0, 10)}
                  onChange={(v) => patchFlight(1, { flight_date: v })}
                />
              </Field>
              <Field label="ETD">
                <TextInput
                  type="datetime-local"
                  value={String(firstLeg.etd ?? '').slice(0, 16)}
                  onChange={(v) => patchFlight(1, { etd: v })}
                />
              </Field>
              <Field label="ETA">
                <TextInput
                  type="datetime-local"
                  value={String(firstLeg.eta ?? '').slice(0, 16)}
                  onChange={(v) => patchFlight(1, { eta: v })}
                />
              </Field>
              <Field label="Origin airport (leg)">
                <TextInput
                  value={firstLeg.pol}
                  onChange={(v) => patchFlight(1, { pol: v })}
                />
              </Field>
              <Field label="Dest airport (leg)">
                <TextInput
                  value={firstLeg.pod}
                  onChange={(v) => patchFlight(1, { pod: v })}
                />
              </Field>
            </div>
          </Section>

          <Section
            title="Connecting flight (optional)"
            hint="2nd leg — connection / onward flight"
          >
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <Field label="Airline">
                <TextInput
                  value={secondLeg.airline_name}
                  onChange={(v) => patchFlight(2, { airline_name: v })}
                />
              </Field>
              <Field label="Flight number">
                <TextInput
                  value={secondLeg.flight_number}
                  onChange={(v) =>
                    patchFlight(2, { flight_number: v, voyage_number: v })
                  }
                />
              </Field>
              <Field label="Arrival flight number">
                <TextInput
                  value={secondLeg.arrival_flight_number}
                  onChange={(v) => patchFlight(2, { arrival_flight_number: v })}
                />
              </Field>
              <Field label="Flight date">
                <TextInput
                  type="date"
                  value={String(secondLeg.flight_date ?? '').slice(0, 10)}
                  onChange={(v) => patchFlight(2, { flight_date: v })}
                />
              </Field>
              <Field label="ETD">
                <TextInput
                  type="datetime-local"
                  value={String(secondLeg.etd ?? '').slice(0, 16)}
                  onChange={(v) => patchFlight(2, { etd: v })}
                />
              </Field>
              <Field label="ETA">
                <TextInput
                  type="datetime-local"
                  value={String(secondLeg.eta ?? '').slice(0, 16)}
                  onChange={(v) => patchFlight(2, { eta: v })}
                />
              </Field>
              <Field label="Origin airport">
                <TextInput
                  value={secondLeg.pol}
                  onChange={(v) => patchFlight(2, { pol: v })}
                />
              </Field>
              <Field label="Dest airport">
                <TextInput
                  value={secondLeg.pod}
                  onChange={(v) => patchFlight(2, { pod: v })}
                />
              </Field>
            </div>
          </Section>
        </>
      ) : (
        <>
          <Section title="1st leg" hint="leg_no: 1 — vessel, voyage, IMO, POL, POD">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {(
                [
                  ['Vessel name', 'vessel_name'],
                  ['Voyage', 'voyage_number'],
                  ['IMO', 'imo'],
                  ['POL', 'pol'],
                  ['POD', 'pod'],
                ] as const
              ).map(([label, key]) => (
                <Field key={key} label={label}>
                  <TextInput
                    value={firstLeg[key]}
                    onChange={(v) => patchLeg(1, { [key]: v })}
                  />
                </Field>
              ))}
            </div>
          </Section>

          <Section title="2nd leg" hint="leg_no: 2 — vessel, voyage, IMO, POL, POD">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {(
                [
                  ['Vessel name', 'vessel_name'],
                  ['Voyage', 'voyage_number'],
                  ['IMO', 'imo'],
                  ['POL', 'pol'],
                  ['POD', 'pod'],
                ] as const
              ).map(([label, key]) => (
                <Field key={key} label={label}>
                  <TextInput
                    value={secondLeg[key]}
                    onChange={(v) => patchLeg(2, { [key]: v })}
                  />
                </Field>
              ))}
            </div>
          </Section>
        </>
      )}

      <Section
        title="Port of call"
        hint="ORIGIN + DEST (and more): port, ETA/ATA, ETD/ATD, vessel, voyage"
      >
        <div className="space-y-3">
          {poc.map((row, index) => (
            <div
              key={`poc-${index}`}
              className="grid grid-cols-1 gap-2 rounded-md border border-[var(--fresa-border,#C9D3DF)] p-3 sm:grid-cols-2 lg:grid-cols-4"
            >
              <Field label="Role">
                <select
                  className={fieldClass}
                  value={row.role ?? ''}
                  onChange={(e) => {
                    const next = [...poc];
                    next[index] = { ...row, role: e.target.value };
                    patch({ port_of_call: next });
                  }}
                >
                  {['ORIGIN', 'DEST', 'TRANSHIP', 'CALL'].map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </Field>
              {(
                [
                  ['Port name', 'port_name'],
                  ['UN/LOCODE', 'un_locode'],
                  ['Vessel', 'vessel_name'],
                  ['Voyage', 'voyage_number'],
                  ['ETA', 'eta'],
                  ['ATA', 'ata'],
                  ['ETD', 'etd'],
                  ['ATD', 'atd'],
                ] as const
              ).map(([label, key]) => (
                <Field key={key} label={label}>
                  <TextInput
                    type={
                      key === 'eta' || key === 'ata' || key === 'etd' || key === 'atd'
                        ? 'datetime-local'
                        : 'text'
                    }
                    value={
                      key === 'eta' || key === 'ata' || key === 'etd' || key === 'atd'
                        ? String(row[key] ?? '').slice(0, 16)
                        : (row[key] as string | undefined)
                    }
                    onChange={(v) => {
                      const next = [...poc];
                      next[index] = { ...row, [key]: v };
                      patch({ port_of_call: next });
                    }}
                  />
                </Field>
              ))}
              <div className="flex items-end">
                <RowActions
                  onRemove={() =>
                    patch({ port_of_call: poc.filter((_, i) => i !== index) })
                  }
                />
              </div>
            </div>
          ))}
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={() =>
              patch({
                port_of_call: [
                  ...poc,
                  {
                    role: 'CALL',
                    port_name: '',
                    eta: '',
                    ata: '',
                    etd: '',
                    atd: '',
                    vessel_name: '',
                    voyage_number: '',
                  } satisfies JobTrackingPortOfCallDto,
                ],
              })
            }
          >
            <Plus className="h-4 w-4" />
            Add port of call
          </Button>
        </div>
      </Section>

      <Section title="Section 1 — Cargo info · Arrival report status">
        <div className="space-y-3">
          {arrival.map((row, index) => (
            <div
              key={`arr-${index}`}
              className="grid grid-cols-1 gap-2 rounded-md border border-[var(--fresa-border,#C9D3DF)] p-3 sm:grid-cols-2 lg:grid-cols-4"
            >
              {(
                [
                  ['Status', 'status'],
                  ['Sending time', 'sending_time'],
                  ['Receipt time', 'receipt_time'],
                  ['Container no', 'container_no'],
                  ['Sub container no', 'sub_container_no'],
                  ['Vessel name', 'vessel_name'],
                  ['Voyage no', 'voyage_no'],
                  ['IMO', 'imo'],
                ] as const
              ).map(([label, key]) => (
                <Field key={key} label={label}>
                  <TextInput
                    type={key.includes('time') ? 'datetime-local' : 'text'}
                    value={
                      key.includes('time')
                        ? String(row[key] ?? '').slice(0, 16)
                        : row[key]
                    }
                    onChange={(v) => {
                      const next = [...arrival];
                      next[index] = { ...row, [key]: v };
                      patch({ arrival_report: next });
                    }}
                  />
                </Field>
              ))}
              <div className="flex items-end">
                <RowActions
                  onRemove={() =>
                    patch({ arrival_report: arrival.filter((_, i) => i !== index) })
                  }
                />
              </div>
            </div>
          ))}
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={() =>
              patch({
                arrival_report: [
                  ...arrival,
                  {
                    status: '',
                    sending_time: '',
                    receipt_time: '',
                    container_no: '',
                    sub_container_no: '',
                    vessel_name: '',
                    voyage_no: '',
                    imo: '',
                  } satisfies ArrivalReportStatusRowDto,
                ],
              })
            }
          >
            <Plus className="h-4 w-4" />
            Add arrival report row
          </Button>
        </div>
      </Section>

      <Section title="Section 1 — Customs status">
        <div className="space-y-3">
          {customs.map((row, index) => (
            <div
              key={`cus-${index}`}
              className="grid grid-cols-1 gap-2 rounded-md border border-[var(--fresa-border,#C9D3DF)] p-3 sm:grid-cols-2 lg:grid-cols-4"
            >
              <Field label="Carrier operator">
                <TextInput
                  value={row.carrier_operator}
                  onChange={(v) => {
                    const next = [...customs];
                    next[index] = { ...row, carrier_operator: v };
                    patch({ customs_status: next });
                  }}
                />
              </Field>
              <Field label="Customs released">
                <select
                  className={fieldClass}
                  value={row.customs_released ? 'yes' : 'no'}
                  onChange={(e) => {
                    const next = [...customs];
                    next[index] = { ...row, customs_released: e.target.value === 'yes' };
                    patch({ customs_status: next });
                  }}
                >
                  <option value="no">No</option>
                  <option value="yes">Yes</option>
                </select>
              </Field>
              {(
                [
                  ['Sub customs no', 'sub_customs_no'],
                  ['Customs declaration no', 'customs_declaration_no'],
                  ['Inspection status', 'customs_inspection_status'],
                  ['Inspection time', 'customs_inspection_time'],
                ] as const
              ).map(([label, key]) => (
                <Field key={key} label={label}>
                  <TextInput
                    type={key.includes('time') ? 'datetime-local' : 'text'}
                    value={
                      key.includes('time')
                        ? String(row[key] ?? '').slice(0, 16)
                        : (row[key] as string | undefined)
                    }
                    onChange={(v) => {
                      const next = [...customs];
                      next[index] = { ...row, [key]: v };
                      patch({ customs_status: next });
                    }}
                  />
                </Field>
              ))}
              <Field label="Quantity">
                <NumInput
                  value={row.quantity}
                  onChange={(v) => {
                    const next = [...customs];
                    next[index] = { ...row, quantity: v ?? undefined };
                    patch({ customs_status: next });
                  }}
                />
              </Field>
              <Field label="Weight">
                <NumInput
                  value={row.weight}
                  onChange={(v) => {
                    const next = [...customs];
                    next[index] = { ...row, weight: v ?? undefined };
                    patch({ customs_status: next });
                  }}
                />
              </Field>
              <Field label="Volume">
                <NumInput
                  value={row.volume}
                  onChange={(v) => {
                    const next = [...customs];
                    next[index] = { ...row, volume: v ?? undefined };
                    patch({ customs_status: next });
                  }}
                />
              </Field>
              <div className="flex items-end">
                <RowActions
                  onRemove={() =>
                    patch({ customs_status: customs.filter((_, i) => i !== index) })
                  }
                />
              </div>
            </div>
          ))}
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={() =>
              patch({
                customs_status: [
                  ...customs,
                  {
                    carrier_operator: '',
                    customs_released: false,
                    sub_customs_no: '',
                    customs_declaration_no: '',
                    customs_inspection_status: '',
                    customs_inspection_time: '',
                  } satisfies CustomsStatusRowDto,
                ],
              })
            }
          >
            <Plus className="h-4 w-4" />
            Add customs status row
          </Button>
        </div>
      </Section>

      <Section
        title="Section 1 — Detailed data"
        hint="Job snapshot + staff overrides (key / value)"
      >
        <div className="space-y-2">
          {detailedEntries.map(([key, value], index) => (
            <div key={`dd-${index}`} className="flex flex-wrap items-end gap-2">
              <div className="min-w-[140px] flex-1">
                <Field label="Key">
                  <TextInput
                    value={key}
                    onChange={(v) => {
                      const next: Record<string, unknown> = {};
                      detailedEntries.forEach(([k, val], i) => {
                        if (i === index) next[v || `field_${i}`] = val;
                        else next[k] = val;
                      });
                      patch({ detailed_data: next });
                    }}
                  />
                </Field>
              </div>
              <div className="min-w-[180px] flex-[2]">
                <Field label="Value">
                  <TextInput
                    value={
                      typeof value === 'string' || typeof value === 'number'
                        ? String(value)
                        : value == null
                          ? ''
                          : JSON.stringify(value)
                    }
                    onChange={(v) => {
                      patch({
                        detailed_data: { ...(form.detailed_data ?? {}), [key]: v },
                      });
                    }}
                  />
                </Field>
              </div>
              <RowActions
                onRemove={() => {
                  const next = { ...(form.detailed_data ?? {}) };
                  delete next[key];
                  patch({ detailed_data: next });
                }}
              />
            </div>
          ))}
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={() =>
              patch({
                detailed_data: {
                  ...(form.detailed_data ?? {}),
                  [`note_${detailedEntries.length + 1}`]: '',
                },
              })
            }
          >
            <Plus className="h-4 w-4" />
            Add detail field
          </Button>
        </div>
      </Section>

      <Section title="Section 2 — Pre-manifest · Manifest status">
        <div className="space-y-3">
          {preManifest.map((row, index) => (
            <div
              key={`pm-${index}`}
              className="grid grid-cols-1 gap-2 rounded-md border border-[var(--fresa-border,#C9D3DF)] p-3 sm:grid-cols-2 lg:grid-cols-4"
            >
              {(
                [
                  ['Sub customs no', 'sub_customs_no'],
                  ['Status', 'status'],
                  ['Sending time', 'sending_time'],
                  ['Receipt / receiving time', 'receipt_receiving_time'],
                  ['Container no', 'container_no'],
                  ['Vessel name', 'vessel_name'],
                  ['Voyage no', 'voyage_no'],
                  ['IMO', 'imo'],
                ] as const
              ).map(([label, key]) => (
                <Field key={key} label={label}>
                  <TextInput
                    type={key.includes('time') ? 'datetime-local' : 'text'}
                    value={
                      key.includes('time')
                        ? String(row[key] ?? '').slice(0, 16)
                        : row[key]
                    }
                    onChange={(v) => {
                      const next = [...preManifest];
                      next[index] = { ...row, [key]: v };
                      patch({ pre_manifest: next });
                    }}
                  />
                </Field>
              ))}
              <div className="flex items-end">
                <RowActions
                  onRemove={() =>
                    patch({
                      pre_manifest: preManifest.filter((_, i) => i !== index),
                    })
                  }
                />
              </div>
            </div>
          ))}
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={() =>
              patch({
                pre_manifest: [
                  ...preManifest,
                  {
                    sub_customs_no: '',
                    status: '',
                    sending_time: '',
                    receipt_receiving_time: '',
                    container_no: '',
                    vessel_name: '',
                    voyage_no: '',
                    imo: '',
                  } satisfies ManifestStatusRowDto,
                ],
              })
            }
          >
            <Plus className="h-4 w-4" />
            Add manifest status row
          </Button>
        </div>
      </Section>

      <Section title="Section 3 — QTY / G.W. / VOL.">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Quantity">
            <NumInput value={qty.quantity} onChange={(v) => patchQty({ quantity: v })} />
          </Field>
          <Field label="Qty unit">
            <TextInput
              value={qty.qty_unit}
              onChange={(v) => patchQty({ qty_unit: v })}
              placeholder="PKG"
            />
          </Field>
          <Field label="Gross weight">
            <NumInput
              value={qty.gross_weight}
              onChange={(v) => patchQty({ gross_weight: v })}
            />
          </Field>
          <Field label="Net weight">
            <NumInput value={qty.net_weight} onChange={(v) => patchQty({ net_weight: v })} />
          </Field>
          <Field label="Weight unit">
            <TextInput
              value={qty.weight_unit}
              onChange={(v) => patchQty({ weight_unit: v })}
              placeholder="KG"
            />
          </Field>
          <Field label="Volume">
            <NumInput value={qty.volume} onChange={(v) => patchQty({ volume: v })} />
          </Field>
          <Field label="Volume unit">
            <TextInput
              value={qty.volume_unit}
              onChange={(v) => patchQty({ volume_unit: v })}
              placeholder="CBM"
            />
          </Field>
          <Field label="Chargeable weight">
            <NumInput
              value={qty.chargeable_weight}
              onChange={(v) => patchQty({ chargeable_weight: v })}
            />
          </Field>
        </div>
      </Section>

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          variant="success"
          disabled={upsert.isPending || profileQuery.isLoading}
          onClick={() => void save()}
        >
          {upsert.isPending ? 'Saving…' : 'Save tracking profile'}
        </Button>
        {onCancel ? (
          <Button type="button" size="sm" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        ) : null}
      </div>
    </div>
  );
}
