import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { isUuid } from '@/lib/isUuid';
import { usePartyTypes } from '@/features/parties/hooks/useParties';
import { resolvePartyTypeOptions } from '@/features/parties/utils/resolvePartyTypeOptions';
import { JOB_ORG_TYPES } from '@/features/shared/organizations/orgTypes';
import { useShipmentDetailTab } from '../hooks/useShipments';
import { useAddShipmentOrganization } from '../hooks/useShipmentOrganizations';
import { getErrorMessage } from '../utils/getErrorMessage';

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function orgRows(raw: unknown): Record<string, unknown>[] {
  if (Array.isArray(raw)) {
    return raw.map(asRecord).filter((r): r is Record<string, unknown> => Boolean(r));
  }
  const rec = asRecord(raw);
  if (!rec) return [];
  for (const key of ['items', 'organizations', 'data', 'results', 'parties']) {
    if (Array.isArray(rec[key])) {
      return (rec[key] as unknown[])
        .map(asRecord)
        .filter((r): r is Record<string, unknown> => Boolean(r));
    }
  }
  return [];
}

/**
 * Shipment Party / Organization tab — POST /shipments/:id/organizations
 * (AddJobOrganizationDto; proxies to job when linked). Includes Vendor.
 */
export function ShipmentPartyPanel({
  shipmentId,
  onChanged,
}: {
  shipmentId: string;
  onChanged?: () => void;
}) {
  const tabQuery = useShipmentDetailTab(shipmentId, 'organization');
  const addOrg = useAddShipmentOrganization(shipmentId);

  const [orgType, setOrgType] = useState<string>('SHIPPER');
  const [partyId, setPartyId] = useState('');
  const [createPartyType, setCreatePartyType] = useState('VENDOR');
  const [createCode, setCreateCode] = useState('');
  const [createName, setCreateName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const typesQuery = usePartyTypes(true);
  const partyTypeOptions = resolvePartyTypeOptions(typesQuery.data);
  const rows = useMemo(() => orgRows(tabQuery.data), [tabQuery.data]);

  const run = async (fn: () => Promise<unknown>, success: string) => {
    setError(null);
    setMsg(null);
    try {
      await fn();
      setMsg(success);
      onChanged?.();
      void tabQuery.refetch();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div className="space-y-4 p-3 text-sm">
      {error ? <p className="text-[var(--color-danger-600)]">{error}</p> : null}
      {msg ? <p className="text-[var(--color-success-700)]">{msg}</p> : null}

      <section className="space-y-2 rounded-sm border border-[var(--fresa-border,#C9D3DF)] p-3">
        <p className="text-[12px] font-semibold uppercase tracking-wide text-[var(--fresa-header-text,#0A2942)]">
          Organizations
        </p>
        {tabQuery.isLoading ? (
          <p className="text-[13px] text-[#64748b]">Loading organizations…</p>
        ) : rows.length === 0 ? (
          <p className="text-[13px] text-[#64748b]">No organizations linked.</p>
        ) : (
          <ul className="space-y-2">
            {rows.map((row, i) => {
              const type = String(row.org_type ?? row.type ?? row.role ?? '—');
              const name = String(
                row.party_name ?? row.name ?? row.display_name ?? '',
              ).trim();
              const pid = String(row.party_id ?? row.id ?? '').trim();
              return (
                <li
                  key={`${type}-${pid || i}`}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-sm border border-[#e8edf2] bg-white px-2.5 py-2"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-[#0f172a]">{type}</p>
                    <p className="truncate text-[12px] text-[#64748b]">
                      {name || (isUuid(pid) ? pid.slice(0, 8) : pid) || '—'}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          <label className="block">
            <span className="mb-1 block text-[12px] font-medium text-[#334155]">Org type</span>
            <select
              className="h-8 w-full rounded-sm border border-[var(--fresa-border,#C9D3DF)] px-2.5 text-[13px]"
              value={orgType}
              onChange={(e) => setOrgType(e.target.value)}
            >
              {JOB_ORG_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t.replaceAll('_', ' ')}
                </option>
              ))}
            </select>
          </label>
          <Input
            label="Party ID (UUID)"
            value={partyId}
            onChange={(e) => setPartyId(e.target.value)}
          />
          <div className="flex items-end">
            <Button
              type="button"
              size="sm"
              variant="edit"
              disabled={addOrg.isPending || !orgType.trim() || !isUuid(partyId.trim())}
              onClick={() =>
                void run(
                  () =>
                    addOrg.mutateAsync({
                      org_type: orgType.trim(),
                      party_id: partyId.trim(),
                    }),
                  `Linked ${orgType}.`,
                )
              }
            >
              Add organization
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-4">
          <label className="block">
            <span className="mb-1 block text-[12px] font-medium text-[#334155]">
              Or create party type
            </span>
            <select
              className="h-8 w-full rounded-sm border border-[var(--fresa-border,#C9D3DF)] px-2.5 text-[13px]"
              value={createPartyType}
              onChange={(e) => setCreatePartyType(e.target.value)}
            >
              {partyTypeOptions.map(({ code, label }) => (
                <option key={code} value={code}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <Input
            label="New party code"
            value={createCode}
            onChange={(e) => setCreateCode(e.target.value)}
          />
          <Input
            label="New party name"
            value={createName}
            onChange={(e) => setCreateName(e.target.value)}
          />
          <div className="flex items-end">
            <Button
              type="button"
              size="sm"
              variant="create"
              disabled={
                addOrg.isPending ||
                !orgType.trim() ||
                !createPartyType.trim() ||
                createCode.trim().length < 1 ||
                createName.trim().length < 2
              }
              onClick={() =>
                void run(async () => {
                  await addOrg.mutateAsync({
                    org_type: orgType.trim(),
                    create_party: {
                      party_type: createPartyType.trim(),
                      code: createCode.trim(),
                      name: createName.trim(),
                    },
                  });
                  setCreateCode('');
                  setCreateName('');
                }, 'Party created and organization linked.')
              }
            >
              Create & link
            </Button>
          </div>
        </div>
        <p className="text-[11px] text-[#64748b]">
          Org types include Vendor. When a job is linked, this proxies to the job organization
          tab.
        </p>
      </section>
    </div>
  );
}
