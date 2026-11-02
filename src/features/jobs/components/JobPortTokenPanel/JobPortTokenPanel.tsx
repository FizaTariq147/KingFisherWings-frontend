import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { isUuid } from '@/lib/isUuid';
import { useAuthStore } from '@/store/authStore';
import { ApiDataView } from '../ApiDataView';
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
  }
  return '';
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
  const formSnap =
    asRecord(snapshot?.form) ??
    asRecord(snapshot?.port_token_form) ??
    asRecord(snapshot?.portTokenForm) ??
    asRecord(snapshot?.customer_form) ??
    asRecord(snapshot?.request) ??
    snapshot;

  const hasCustomerRequest = Boolean(
    formSnap &&
      (pickStr(
        formSnap.bl_number,
        formSnap.blNumber,
        formSnap.container_number,
        formSnap.containerNumber,
        formSnap.receiver_name,
        formSnap.receiverName,
        formSnap.port_gate_token,
        formSnap.portGateToken,
        formSnap.status,
      ) ||
        query.data),
  );

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
    const fromApi = Array.isArray(snapshot?.containers)
      ? (snapshot!.containers as unknown[])
          .map((row) => {
            const r = asRecord(row);
            return pickStr(r?.container_number, r?.containerNumber);
          })
          .filter(Boolean)
      : [];
    return Array.from(new Set([...fromContainers, ...fromApi]));
  }, [containers, snapshot]);

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
        <div className="space-y-3 px-4 pb-4 text-sm">
          <p className="text-[12px] text-[#64748b]">
            Portal port-token submissions appear here. Review the request, then send / issue the
            token to the customer below.
          </p>
          {query.isLoading ? (
            <p className="text-[var(--color-neutral-400)]">Loading token request…</p>
          ) : hasCustomerRequest ? (
            <ApiDataView
              data={query.data}
              emptyLabel="No customer token request yet."
              maxHeightClass="max-h-56"
            />
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
