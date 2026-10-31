import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { isUuid } from '@/lib/isUuid';
import { usePartyTypes } from '@/features/parties/hooks/useParties';
import { resolvePartyTypeOptions } from '@/features/parties/utils/resolvePartyTypeOptions';
import { JOB_ORG_TYPES } from '@/features/shared/organizations/orgTypes';
import {
  normalizeOrganizationRows,
  orgPartyLabel,
} from '@/features/shared/organizations/orgDisplay';
import { PartyOrgSearchField } from '@/features/shared/organizations/PartyOrgSearchField';
import { JobSearchSelect } from '@/features/shared/entity-search';
import { useShipmentDetailTab } from '../hooks/useShipments';
import {
  useAddShipmentOrganization,
  useCopyShipmentOrganizations,
  useReplaceShipmentOrganization,
  useShipmentOrganizationsList,
  useUnlinkShipmentOrganization,
} from '../hooks/useShipmentOrganizations';
import { getErrorMessage } from '../utils/getErrorMessage';

/**
 * Shipment Party / Organization tab — list / add / replace / delete / copy-from
 * (proxies to job when linked). Search by name/code — no UUID typing.
 */
export function ShipmentPartyPanel({
  shipmentId,
  onChanged,
}: {
  shipmentId: string;
  onChanged?: () => void;
}) {
  const tabQuery = useShipmentDetailTab(shipmentId, 'organization');
  const orgsQuery = useShipmentOrganizationsList(shipmentId);
  const addOrg = useAddShipmentOrganization(shipmentId);
  const replaceOrg = useReplaceShipmentOrganization(shipmentId);
  const unlinkOrg = useUnlinkShipmentOrganization(shipmentId);
  const copyOrg = useCopyShipmentOrganizations(shipmentId);

  const [orgType, setOrgType] = useState<string>('SHIPPER');
  const [partyId, setPartyId] = useState('');
  const [replacePartyId, setReplacePartyId] = useState('');
  const [copyFromJobId, setCopyFromJobId] = useState('');
  const [createPartyType, setCreatePartyType] = useState('VENDOR');
  const [createCode, setCreateCode] = useState('');
  const [createName, setCreateName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const typesQuery = usePartyTypes(true);
  const partyTypeOptions = resolvePartyTypeOptions(typesQuery.data);
  const rows = useMemo(() => {
    const fromOrgs = normalizeOrganizationRows(orgsQuery.data);
    if (fromOrgs.length) return fromOrgs;
    return normalizeOrganizationRows(tabQuery.data);
  }, [orgsQuery.data, tabQuery.data]);

  const pending =
    addOrg.isPending ||
    replaceOrg.isPending ||
    unlinkOrg.isPending ||
    copyOrg.isPending;

  const run = async (fn: () => Promise<unknown>, success: string) => {
    setError(null);
    setMsg(null);
    try {
      await fn();
      setMsg(success);
      onChanged?.();
      void tabQuery.refetch();
      void orgsQuery.refetch();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const orgsLoading = tabQuery.isLoading && orgsQuery.isLoading;

  return (
    <div className="space-y-4 p-3 text-sm">
      {error ? <p className="text-[var(--color-danger-600)]">{error}</p> : null}
      {msg ? <p className="text-[var(--color-success-700)]">{msg}</p> : null}

      <section className="space-y-3">
        <p className="text-[12px] font-semibold uppercase tracking-wide text-[var(--fresa-header-text,#0A2942)]">
          Organizations
        </p>
        {orgsLoading ? (
          <p className="text-[13px] text-[#64748b]">Loading organizations…</p>
        ) : rows.length === 0 ? (
          <p className="text-[13px] text-[#64748b]">No organizations linked.</p>
        ) : (
          <ul className="space-y-2">
            {rows.map((row, i) => {
              const label = orgPartyLabel(row);
              const canUnlink =
                Boolean(label.orgType && label.orgType !== '—') &&
                (Boolean(label.partyId) || label.primary !== '—');
              return (
                <li
                  key={`${label.orgType}-${label.partyId || i}`}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-sm border border-[#e8edf2] bg-white px-2.5 py-2"
                >
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-[#64748b]">
                      {label.orgType.replaceAll('_', ' ')}
                    </p>
                    <p className="truncate font-medium text-[#0f172a]">
                      {label.primary}
                    </p>
                    {label.secondary ? (
                      <p className="truncate text-[12px] text-[#64748b]">
                        {label.secondary}
                      </p>
                    ) : null}
                  </div>
                  {canUnlink ? (
                    <Button
                      type="button"
                      size="sm"
                      variant="danger"
                      disabled={pending}
                      onClick={() =>
                        void run(
                          () => unlinkOrg.mutateAsync(label.orgType),
                          `Unlinked ${label.orgType}.`,
                        )
                      }
                    >
                      Unlink
                    </Button>
                  ) : null}
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
          <PartyOrgSearchField
            shipmentId={shipmentId}
            label="Search party"
            value={partyId}
            onChange={(id) => setPartyId(id)}
          />
          <div className="flex items-end">
            <Button
              type="button"
              size="sm"
              variant="edit"
              disabled={pending || !orgType.trim() || !isUuid(partyId.trim())}
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
                pending ||
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

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          <PartyOrgSearchField
            shipmentId={shipmentId}
            label="Replace with party"
            value={replacePartyId}
            onChange={(id) => setReplacePartyId(id)}
          />
          <div className="flex items-end sm:col-span-2">
            <Button
              type="button"
              size="sm"
              variant="edit"
              disabled={pending || !orgType.trim() || !isUuid(replacePartyId.trim())}
              onClick={() =>
                void run(
                  () =>
                    replaceOrg.mutateAsync({
                      orgType: orgType.trim(),
                      dto: { party_id: replacePartyId.trim() },
                    }),
                  `Replaced ${orgType}.`,
                )
              }
            >
              Replace type
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          <JobSearchSelect
            name="shipment_copy_from_job_id"
            label="Copy from job"
            value={copyFromJobId}
            onChange={setCopyFromJobId}
            placeholder="Search job by number…"
          />
          <div className="flex items-end sm:col-span-2">
            <Button
              type="button"
              size="sm"
              variant="secondary"
              disabled={pending || !isUuid(copyFromJobId.trim())}
              onClick={() =>
                void run(
                  () =>
                    copyOrg.mutateAsync({
                      source_job_id: copyFromJobId.trim(),
                    }),
                  'Organizations copied.',
                )
              }
            >
              Copy from job
            </Button>
          </div>
        </div>

        <p className="text-[11px] text-[#64748b]">
          Search by party name or code. When a job is linked, this proxies to the job
          organization tab; otherwise rows stay shipment-local.
        </p>
      </section>
    </div>
  );
}
