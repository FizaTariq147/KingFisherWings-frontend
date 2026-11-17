import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { erpTable } from '@/lib/erpTypography';
import { isUuid } from '@/lib/isUuid';
import { useAuthStore } from '@/store/authStore';
import { jobKeys, useJobContainers } from '../../hooks/useJobs';
import { jobService } from '../../services/job.service';
import { getErrorMessage } from '../../utils/getErrorMessage';

function todayIsoDate(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function asRecord(v: unknown): Record<string, unknown> | null {
  return v && typeof v === 'object' && !Array.isArray(v)
    ? (v as Record<string, unknown>)
    : null;
}

function pickStr(...vals: unknown[]): string {
  for (const v of vals) {
    if (typeof v === 'string' && v.trim()) return v.trim();
    if (typeof v === 'number' && Number.isFinite(v)) return String(v);
  }
  return '';
}

function display(value?: string | null): string {
  const raw = String(value ?? '').trim();
  return raw || '—';
}

function humanLabel(key: string): string {
  return key
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatWhen(value?: string): string {
  if (!value?.trim()) return '';
  const t = Date.parse(value);
  if (!Number.isFinite(t)) return value.trim();
  return new Date(t).toLocaleString();
}

/** Prefer nested customer form / request payload from GET /jobs/:id/port-token. */
function extractFormSnap(snapshot: Record<string, unknown> | null): Record<string, unknown> | null {
  if (!snapshot) return null;
  return (
    asRecord(snapshot.form) ??
    asRecord(snapshot.port_token_form) ??
    asRecord(snapshot.portTokenForm) ??
    asRecord(snapshot.customer_form) ??
    asRecord(snapshot.customerForm) ??
    asRecord(snapshot.request) ??
    asRecord(snapshot.submission) ??
    asRecord(snapshot.token) ??
    asRecord(snapshot.port_token) ??
    snapshot
  );
}

const FORM_FIELD_KEYS: Array<{ keys: string[]; label: string }> = [
  { keys: ['bl_number', 'blNumber', 'bl', 'mbl_number', 'hbl_number'], label: 'BL number' },
  {
    keys: ['container_number', 'containerNumber', 'container_no'],
    label: 'Container number',
  },
  { keys: ['date', 'token_date', 'requested_date', 'gate_date'], label: 'Date' },
  {
    keys: ['delivery_location', 'deliveryLocation', 'delivery_address'],
    label: 'Delivery location',
  },
  { keys: ['receiver_name', 'receiverName', 'consignee_name'], label: 'Receiver name' },
  {
    keys: ['receiver_contact', 'receiverContact', 'receiver_phone', 'contact'],
    label: 'Receiver contact',
  },
  {
    keys: ['port_gate_token', 'portGateToken', 'gate_token', 'token'],
    label: 'Port gate token',
  },
  { keys: ['status', 'token_status', 'request_status'], label: 'Request status' },
  {
    keys: ['submitted_at', 'submittedAt', 'created_at', 'confirmed_at', 'issued_at'],
    label: 'Submitted / issued',
  },
  { keys: ['notes', 'remarks', 'comment'], label: 'Notes' },
];

function DetailField({ label, value }: { label: string; value: string }) {
  if (!value || value === '—') return null;
  return (
    <div className="rounded-sm bg-white px-3 py-2">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--fresa-header-text,#0A2942)]">
        {label}
      </p>
      <p className="mt-0.5 break-words text-[13px] text-[#334155]">{value}</p>
    </div>
  );
}

interface JobPortTokenPanelProps {
  jobId: string;
}

/** Admin GET/POST /jobs/:id/port-token (+ confirm / send to customer). */
export function JobPortTokenPanel({ jobId }: JobPortTokenPanelProps) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const qc = useQueryClient();
  const { data: containers = [] } = useJobContainers(jobId);
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const query = useQuery({
    queryKey: [...jobKeys.all, 'port-token', jobId] as const,
    queryFn: () => jobService.getPortToken(jobId),
    enabled: Boolean(accessToken) && isUuid(jobId),
  });

  const snapshot = asRecord(query.data);
  const formSnap = extractFormSnap(snapshot);

  const requestFields = useMemo(() => {
    if (!formSnap) return [] as Array<{ label: string; value: string }>;
    const used = new Set<string>();
    const out: Array<{ label: string; value: string }> = [];

    for (const field of FORM_FIELD_KEYS) {
      let raw = '';
      for (const key of field.keys) {
        raw = pickStr(formSnap[key]);
        if (raw) {
          used.add(key);
          break;
        }
      }
      if (!raw) continue;
      const value =
        /submitted|issued|created|confirmed/i.test(field.label)
          ? formatWhen(raw) || raw
          : raw;
      out.push({ label: field.label, value });
    }

    // Surface any extra scalar fields the API returned (skip ids / nested).
    for (const [key, value] of Object.entries(formSnap)) {
      if (used.has(key)) continue;
      const lower = key.toLowerCase();
      if (
        lower === 'id' ||
        lower.endsWith('_id') ||
        lower.endsWith('_uuid') ||
        lower === 'containers' ||
        lower === 'raw' ||
        lower === 'job'
      ) {
        continue;
      }
      if (value == null || value === '') continue;
      if (typeof value === 'object') continue;
      const text = pickStr(value);
      if (!text || isUuid(text)) continue;
      out.push({ label: humanLabel(key), value: text });
    }
    return out;
  }, [formSnap]);

  const containerRows = useMemo(() => {
    const fromApi = Array.isArray(snapshot?.containers)
      ? (snapshot!.containers as unknown[])
      : Array.isArray(formSnap?.containers)
        ? (formSnap!.containers as unknown[])
        : [];

    const apiRows = fromApi
      .map((row) => asRecord(row))
      .filter((r): r is Record<string, unknown> => Boolean(r))
      .map((r) => ({
        number: pickStr(r.container_number, r.containerNumber, r.number),
        type: pickStr(
          r.container_type,
          r.containerType,
          r.type,
          r.size_type,
          r.iso_code,
        ),
        status: pickStr(r.status, r.container_status, r.containerStatus),
        seal: pickStr(r.seal_number, r.sealNumber, r.seal),
        kind: pickStr(r.kind, r.container_kind, r.planned_or_actual),
        grossWeight: pickStr(r.gross_weight, r.grossWeight, r.weight),
        packages: pickStr(r.packages, r.package_count, r.pkgs),
      }))
      .filter((r) => r.number);

    if (apiRows.length) return apiRows;

    return containers
      .map((c) => ({
        number: String(c.container_number ?? '').trim(),
        type: String(
          c.container_type_name ?? c.container_type_code ?? c.iso_size ?? '',
        ).trim(),
        status: String(c.status_code ?? c.status ?? '').trim(),
        seal: String(c.seal_number ?? '').trim(),
        kind: String(c.container_kind ?? '').trim(),
        grossWeight:
          c.gross_weight != null && Number.isFinite(c.gross_weight)
            ? String(c.gross_weight)
            : '',
        packages: '',
      }))
      .filter((r) => r.number);
  }, [snapshot, formSnap, containers]);

  const hasCustomerRequest = requestFields.length > 0 || Boolean(query.data);

  const [blNumber, setBlNumber] = useState('');
  const [containerNumber, setContainerNumber] = useState('');
  const [date, setDate] = useState(todayIsoDate());
  const [deliveryLocation, setDeliveryLocation] = useState('');
  const [receiverName, setReceiverName] = useState('');
  const [receiverContact, setReceiverContact] = useState('');
  const [portGateToken, setPortGateToken] = useState('');

  const containerNumbers = useMemo(() => {
    const fromContainers = containers
      .map((c) => c.container_number?.trim())
      .filter((n): n is string => Boolean(n));
    const fromRows = containerRows.map((r) => r.number).filter(Boolean);
    return Array.from(new Set([...fromContainers, ...fromRows]));
  }, [containers, containerRows]);

  useEffect(() => {
    if (!formSnap) return;
    setBlNumber((prev) => prev || pickStr(formSnap.bl_number, formSnap.blNumber));
    setContainerNumber(
      (prev) => prev || pickStr(formSnap.container_number, formSnap.containerNumber),
    );
    setDate((prev) => prev || pickStr(formSnap.date) || todayIsoDate());
    setDeliveryLocation(
      (prev) =>
        prev || pickStr(formSnap.delivery_location, formSnap.deliveryLocation),
    );
    setReceiverName(
      (prev) => prev || pickStr(formSnap.receiver_name, formSnap.receiverName),
    );
    setReceiverContact(
      (prev) =>
        prev || pickStr(formSnap.receiver_contact, formSnap.receiverContact),
    );
    setPortGateToken(
      (prev) => prev || pickStr(formSnap.port_gate_token, formSnap.portGateToken),
    );
  }, [formSnap]);

  const confirm = useMutation({
    mutationFn: () =>
      jobService.confirmPortToken(jobId, {
        bl_number: blNumber.trim(),
        container_number: containerNumber.trim(),
        date: date.trim(),
        delivery_location: deliveryLocation.trim(),
        receiver_name: receiverName.trim(),
        receiver_contact: receiverContact.trim(),
        ...(portGateToken.trim() ? { port_gate_token: portGateToken.trim() } : {}),
      }),
    onSuccess: (data) => {
      qc.setQueryData([...jobKeys.all, 'port-token', jobId], data);
      void qc.invalidateQueries({ queryKey: [...jobKeys.all, 'port-token', jobId] });
    },
  });

  const submit = async () => {
    setError(null);
    setMsg(null);
    if (
      !blNumber.trim() ||
      !containerNumber.trim() ||
      !date.trim() ||
      !deliveryLocation.trim() ||
      !receiverName.trim() ||
      !receiverContact.trim()
    ) {
      setError('Fill all required port token fields.');
      return;
    }
    if (containerNumbers.length > 1 && !containerNumbers.includes(containerNumber.trim())) {
      setError('Select a container that belongs to this job.');
      return;
    }
    try {
      await confirm.mutateAsync();
      setMsg('Port token sent to customer.');
      await query.refetch();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Customer token request</CardTitle>
        </CardHeader>
        <div className="space-y-4 px-4 pb-4 text-sm">
          <p className="text-[12px] text-[#64748b]">
            Portal port-token submissions appear here. Review the full request, then send /
            issue the token to the customer below.
          </p>
          {query.isLoading ? (
            <p className="text-[var(--color-neutral-400)]">Loading token request…</p>
          ) : query.isError ? (
            <p className="text-[var(--color-danger-600)]">
              {getErrorMessage(query.error) || 'Failed to load port token request.'}
            </p>
          ) : hasCustomerRequest ? (
            <div className="space-y-4">
              {requestFields.length > 0 ? (
                <div>
                  <p className="mb-2 text-[12px] font-semibold text-[var(--fresa-header-text,#0A2942)]">
                    Request details
                  </p>
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {requestFields.map((f) => (
                      <DetailField key={f.label} label={f.label} value={f.value} />
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-[var(--color-neutral-500)]">
                  Token payload loaded, but no form fields were returned. Containers are
                  listed below.
                </p>
              )}

              {containerRows.length > 0 ? (
                <div>
                  <p className="mb-2 text-[12px] font-semibold text-[var(--fresa-header-text,#0A2942)]">
                    Containers
                  </p>
                  <div className="overflow-x-auto rounded-sm border border-[var(--fresa-border,#C9D3DF)]">
                    <table className="w-full min-w-[640px] text-left text-[13px]">
                      <thead>
                        <tr>
                          <th className={erpTable.th}>Container number</th>
                          <th className={erpTable.th}>Type</th>
                          <th className={erpTable.th}>Status</th>
                          <th className={erpTable.th}>Seal</th>
                          <th className={erpTable.th}>Kind</th>
                          <th className={erpTable.th}>Gross weight</th>
                          <th className={erpTable.th}>Packages</th>
                        </tr>
                      </thead>
                      <tbody>
                        {containerRows.map((row) => (
                          <tr key={row.number} className={erpTable.row}>
                            <td className={erpTable.td}>{display(row.number)}</td>
                            <td className={erpTable.td}>{display(row.type)}</td>
                            <td className={erpTable.td}>{display(row.status)}</td>
                            <td className={erpTable.td}>{display(row.seal)}</td>
                            <td className={erpTable.td}>{display(row.kind)}</td>
                            <td className={erpTable.td}>{display(row.grossWeight)}</td>
                            <td className={erpTable.td}>{display(row.packages)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : null}
            </div>
          ) : (
            <p className="text-[var(--color-neutral-500)]">
              No customer request yet — you can still fill the form and send a token to the
              customer.
            </p>
          )}
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Send port token to customer</CardTitle>
        </CardHeader>
        <div className="space-y-3 px-4 pb-4 text-sm">
          {error ? <p className="text-[var(--color-danger-600)]">{error}</p> : null}
          {msg ? <p className="text-[var(--color-success-700)]">{msg}</p> : null}
          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              label="BL number *"
              value={blNumber}
              onChange={(e) => setBlNumber(e.target.value)}
            />
            {containerNumbers.length > 1 ? (
              <label className="block text-sm">
                <span className="mb-1 block text-[11px] font-semibold uppercase text-[var(--color-neutral-500)]">
                  Container number *
                </span>
                <select
                  className="h-9 w-full rounded-md border border-[var(--color-neutral-200)] bg-white px-3 text-sm"
                  value={containerNumber}
                  onChange={(e) => setContainerNumber(e.target.value)}
                >
                  <option value="">Select container…</option>
                  {containerNumbers.map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </label>
            ) : (
              <Input
                label="Container number *"
                value={containerNumber}
                onChange={(e) => setContainerNumber(e.target.value)}
              />
            )}
            <Input
              label="Date *"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
            <Input
              label="Delivery location *"
              value={deliveryLocation}
              onChange={(e) => setDeliveryLocation(e.target.value)}
            />
            <Input
              label="Receiver name *"
              value={receiverName}
              onChange={(e) => setReceiverName(e.target.value)}
            />
            <Input
              label="Receiver contact *"
              value={receiverContact}
              onChange={(e) => setReceiverContact(e.target.value)}
            />
            <Input
              label="Port gate token (optional)"
              value={portGateToken}
              onChange={(e) => setPortGateToken(e.target.value)}
            />
          </div>
          <Button
            type="button"
            size="sm"
            disabled={confirm.isPending}
            onClick={() => void submit()}
          >
            {confirm.isPending ? 'Sending…' : 'Send to customer'}
          </Button>
        </div>
      </Card>
    </div>
  );
}
