import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { axiosInstance } from '@/lib/axios';
import { getErrorMessage } from '@/features/jobs/utils/getErrorMessage';
import { PARTY_API } from '../api/party.api';

function rowsOf(data: unknown): Record<string, unknown>[] {
  const value =
    data && typeof data === 'object' && 'data' in (data as object)
      ? (data as { data: unknown }).data
      : data;
  if (Array.isArray(value)) return value as Record<string, unknown>[];
  if (value && typeof value === 'object' && Array.isArray((value as { items?: unknown }).items)) {
    return (value as { items: Record<string, unknown>[] }).items;
  }
  return [];
}

export function PartyEdiAndChargesSection({ partyId }: { partyId: string }) {
  const qc = useQueryClient();
  const edi = useQuery({
    queryKey: ['party-edi', partyId],
    queryFn: async () => rowsOf((await axiosInstance.get(PARTY_API.ediCodes(partyId))).data),
  });
  const charges = useQuery({
    queryKey: ['party-charges', partyId],
    queryFn: async () => rowsOf((await axiosInstance.get(PARTY_API.standardCharges(partyId))).data),
  });
  const [code, setCode] = useState('');
  const [partner, setPartner] = useState('');
  const [chargeCodeId, setChargeCodeId] = useState('');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState<string | null>(null);

  const save = useMutation({
    mutationFn: async (kind: 'edi' | 'charge') => {
      if (kind === 'edi') {
        await axiosInstance.post(PARTY_API.ediCodes(partyId), {
          code: code.trim(),
          partner_name: partner.trim() || undefined,
        });
        return;
      }
      await axiosInstance.post(PARTY_API.standardCharges(partyId), {
        charge_code_id: chargeCodeId.trim(),
        amount: Number(amount),
      });
    },
    onSuccess: () => {
      setError(null);
      void qc.invalidateQueries({ queryKey: ['party-edi', partyId] });
      void qc.invalidateQueries({ queryKey: ['party-charges', partyId] });
    },
    onError: (err: unknown) => setError(getErrorMessage(err)),
  });

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>EDI codes</CardTitle>
        </CardHeader>
        <div className="space-y-2 px-4 pb-4">
          <Input label="Code" value={code} onChange={(e) => setCode(e.target.value)} />
          <Input label="Partner" value={partner} onChange={(e) => setPartner(e.target.value)} />
          <Button type="button" disabled={!code.trim() || save.isPending} onClick={() => save.mutate('edi')}>
            Save EDI code
          </Button>
          <ul className="text-sm">
            {(edi.data ?? []).map((row, index) => (
              <li key={String(row.id ?? index)}>
                {String(row.code ?? row.edi_code ?? JSON.stringify(row))}
              </li>
            ))}
          </ul>
        </div>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Standard charges</CardTitle>
        </CardHeader>
        <div className="space-y-2 px-4 pb-4">
          <Input
            label="Charge code id"
            value={chargeCodeId}
            onChange={(e) => setChargeCodeId(e.target.value)}
          />
          <Input label="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} />
          <Button
            type="button"
            disabled={!chargeCodeId.trim() || !amount.trim() || save.isPending}
            onClick={() => save.mutate('charge')}
          >
            Add charge
          </Button>
          <ul className="text-sm">
            {(charges.data ?? []).map((row, index) => (
              <li key={String(row.id ?? index)}>
                {String(row.description ?? row.charge_code_id ?? row.amount ?? index)}
              </li>
            ))}
          </ul>
          {error ? <p className="text-sm text-[var(--color-danger-600)]">{error}</p> : null}
        </div>
      </Card>
    </div>
  );
}
