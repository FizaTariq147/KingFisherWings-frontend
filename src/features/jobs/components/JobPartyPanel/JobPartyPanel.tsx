import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { isUuid } from '@/lib/isUuid';
import { useJobActions } from '../../hooks/useJobActions';
import {
  useJobOrganizations,
  useJobDetailTab,
  useJobReferences,
} from '../../hooks/useJobs';
import { useJobTabResourceMutations } from '../../hooks/useJobTabResources';
import type { Job } from '../../types/job.types';
import { usePartyTypes } from '@/features/parties/hooks/useParties';
import { resolvePartyTypeOptions } from '@/features/parties/utils/resolvePartyTypeOptions';
import { JOB_ORG_TYPES, JOB_PARTY_ROLES } from '@/features/shared/organizations/orgTypes';
import { orgPartyLabel } from '@/features/shared/organizations/orgDisplay';
import { PartyOrgSearchField } from '@/features/shared/organizations/PartyOrgSearchField';
import { JobSearchSelect } from '@/features/shared/entity-search';
import { getErrorMessage } from '../../utils/getErrorMessage';

/** Matches AddJobOrganizationDto.org_type (includes Vendor). */
const ORG_TYPES = JOB_ORG_TYPES;
const PARTY_ROLES = JOB_PARTY_ROLES;

const REFERENCE_TYPES = [
  'PO_NUMBER',
  'CUSTOMER_REF',
  'SABER',
  'RA_CODE',
  'ISF',
  'OTHER',
] as const;

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
  for (const key of ['items', 'organizations', 'data', 'results']) {
    if (Array.isArray(rec[key])) {
      return (rec[key] as unknown[])
        .map(asRecord)
        .filter((r): r is Record<string, unknown> => Boolean(r));
    }
  }
  return [];
}

/** Party tab — organizations CRUD + client reference. */
export function JobPartyPanel({
  job,
  onChanged,
}: {
  job: Job;
  onChanged?: () => void;
}) {
  const actions = useJobActions(job.id);
  const resources = useJobTabResourceMutations(job.id);
  const tabQuery = useJobDetailTab(job.id, 'organization');
  const orgsQuery = useJobOrganizations(job.id);
  const refsQuery = useJobReferences(job.id);

  const [referenceType, setReferenceType] = useState(
    job.client_reference_type || 'PO_NUMBER',
  );
  const [referenceNo, setReferenceNo] = useState(job.client_reference_no || '');
  const [partyRole, setPartyRole] = useState('CLIENT');
  const [typedRefType, setTypedRefType] = useState<string>('SABER');
  const [typedRefValue, setTypedRefValue] = useState('');
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
  const rows = useMemo(() => orgRows(orgsQuery.data), [orgsQuery.data]);

  const run = async (fn: () => Promise<unknown>, success: string) => {
    setError(null);
    setMsg(null);
    try {
      await fn();
      setMsg(success);
      onChanged?.();
      void tabQuery.refetch();
      void orgsQuery.refetch();
      void refsQuery.refetch();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const typedRefRows = useMemo(() => {
    const raw = refsQuery.data;
    if (!raw) return [] as { type: string; value: string }[];
    if (Array.isArray(raw)) {
      return raw
        .map((r) => {
          const rec = asRecord(r);
          if (!rec) return null;
          const type = String(rec.type ?? rec.reference_type ?? '').trim();
          const value = String(
            rec.value ?? rec.reference_no ?? rec.reference_number ?? '',
          ).trim();
          if (!type && !value) return null;
          return { type: type || '—', value: value || '—' };
        })
        .filter((r): r is { type: string; value: string } => Boolean(r));
    }
    const rec = asRecord(raw);
    if (!rec) return [];
    const refs = asRecord(rec.references) ?? rec;
    return Object.entries(refs)
      .filter(([, v]) => typeof v === 'string' || typeof v === 'number')
      .map(([type, value]) => ({ type, value: String(value) }));
  }, [refsQuery.data]);

  const saveReference = () =>
    void run(
      () =>
        actions.upsertClientReference.mutateAsync({
          party_role: partyRole,
          reference_type: referenceType,
          reference_no: referenceNo.trim(),
          ...(job.shipper_id ? { party_id: job.shipper_id } : {}),
        }),
      'Client reference saved.',
    );

  const pending =
    actions.upsertClientReference.isPending ||
    actions.putReferenceByType.isPending ||
    resources.addOrganization.isPending ||
    resources.replaceOrganization.isPending ||
    resources.unlinkOrganization.isPending ||
    resources.copyOrganizationsFrom.isPending ||
    resources.refreshOrganizationSnapshots.isPending;

  return (
    <div className="space-y-4 text-sm">
      {error ? <p className="text-[var(--color-danger-600)]">{error}</p> : null}
      {msg ? <p className="text-[var(--color-success-700)]">{msg}</p> : null}

      <section className="space-y-3">
        <p className="text-[12px] font-semibold uppercase tracking-wide text-[var(--fresa-header-text,#0A2942)]">
          Organizations
        </p>
        {orgsQuery.isLoading ? (
          <p className="text-[13px] text-[#64748b]">Loading organizations…</p>
        ) : rows.length === 0 ? (
          <p className="text-[13px] text-[#64748b]">No organizations linked.</p>
        ) : (
          <ul className="space-y-2">
            {rows.map((row, i) => {
              const label = orgPartyLabel(row);
              return (
                <li
                  key={`${label.orgType}-${label.partyId || i}`}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-sm border border-[#e8edf2] bg-white px-2.5 py-2"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-[#0f172a]">{label.orgType}</p>
                    <p className="truncate text-[12px] text-[#64748b]">
                      {label.primary}
                      {label.secondary ? ` · ${label.secondary}` : ''}
                    </p>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="danger"
                    disabled={pending || !label.orgType || label.orgType === '—'}
                    onClick={() =>
                      void run(
                        () =>
                          resources.unlinkOrganization.mutateAsync(label.orgType),
                        `Unlinked ${label.orgType}.`,
                      )
                    }
                  >
                    Unlink
                  </Button>
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
              {ORG_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t.replaceAll('_', ' ')}
                </option>
              ))}
            </select>
          </label>
          <PartyOrgSearchField
            jobId={job.id}
            label="Search party"
            value={partyId}
            onChange={(id) => setPartyId(id)}
          />
          <div className="flex items-end">
            <Button
              type="button"
              size="sm"
              variant="create"
              disabled={pending || !orgType.trim() || !isUuid(partyId.trim())}
              onClick={() =>
                void run(
                  () =>
                    resources.addOrganization.mutateAsync({
                      org_type: orgType.trim(),
                      party_id: partyId.trim(),
                    }),
                  'Organization added.',
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
                  await resources.addOrganization.mutateAsync({
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
            jobId={job.id}
            label="Replace with party"
            value={replacePartyId}
            onChange={(id) => setReplacePartyId(id)}
          />
          <div className="flex items-end gap-2 sm:col-span-2">
            <Button
              type="button"
              size="sm"
              variant="edit"
              disabled={pending || !orgType.trim() || !isUuid(replacePartyId.trim())}
              onClick={() =>
                void run(
                  () =>
                    resources.replaceOrganization.mutateAsync({
                      orgType: orgType.trim(),
                      dto: { party_id: replacePartyId.trim() },
                    }),
                  `Replaced ${orgType}.`,
                )
              }
            >
              Replace type
            </Button>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              disabled={pending}
              onClick={() =>
                void run(
                  () => resources.refreshOrganizationSnapshots.mutateAsync({}),
                  'Snapshots refreshed.',
                )
              }
            >
              Refresh snapshots
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          <JobSearchSelect
            name="copy_from_job_id"
            label="Copy from job"
            value={copyFromJobId}
            onChange={setCopyFromJobId}
            placeholder="Search job by number…"
          />
          <div className="flex items-end sm:col-span-2">
            <Button
              type="button"
              size="sm"
              variant="report"
              disabled={pending || (copyFromJobId.trim() !== '' && !isUuid(copyFromJobId.trim()))}
              onClick={() =>
                void run(
                  () =>
                    resources.copyOrganizationsFrom.mutateAsync({
                      ...(isUuid(copyFromJobId.trim())
                        ? { source_job_id: copyFromJobId.trim() }
                        : {}),
                      overwrite: true,
                    }),
                  'Organizations copied.',
                )
              }
            >
              Copy from parent / source
            </Button>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <p className="text-[12px] font-semibold uppercase tracking-wide text-[var(--fresa-header-text,#0A2942)]">
          Client reference
        </p>
        {tabQuery.isLoading ? (
          <p className="text-[13px] text-[#64748b]">Loading party…</p>
        ) : null}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-[12px] font-medium text-[#334155]">Party role</span>
            <select
              className="h-8 w-full rounded-sm border border-[var(--fresa-border,#C9D3DF)] px-2.5 text-[13px]"
              value={partyRole}
              onChange={(e) => setPartyRole(e.target.value)}
            >
              {PARTY_ROLES.map((r) => (
                <option key={r} value={r}>
                  {r.replaceAll('_', ' ')}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-[12px] font-medium text-[#334155]">
              Reference type
            </span>
            <select
              className="h-8 w-full rounded-sm border border-[var(--fresa-border,#C9D3DF)] px-2.5 text-[13px]"
              value={referenceType}
              onChange={(e) => setReferenceType(e.target.value)}
            >
              {REFERENCE_TYPES.map((r) => (
                <option key={r} value={r}>
                  {r.replaceAll('_', ' ')}
                </option>
              ))}
            </select>
          </label>
          <Input
            label="Reference no"
            value={referenceNo}
            onChange={(e) => setReferenceNo(e.target.value)}
          />
        </div>
        <Button
          type="button"
          size="sm"
          variant="edit"
          disabled={pending || !referenceNo.trim()}
          onClick={saveReference}
        >
          Save client reference
        </Button>
      </section>

      <section className="space-y-3">
        <p className="text-[12px] font-semibold uppercase tracking-wide text-[var(--fresa-header-text,#0A2942)]">
          Typed references (SABER / RA / ISF)
        </p>
        {refsQuery.isLoading ? (
          <p className="text-[13px] text-[#64748b]">Loading references…</p>
        ) : typedRefRows.length === 0 ? (
          <p className="text-[13px] text-[#64748b]">No typed references yet.</p>
        ) : (
          <ul className="space-y-1">
            {typedRefRows.map((row) => (
              <li
                key={`${row.type}-${row.value}`}
                className="rounded-sm border border-[#e8edf2] bg-white px-2.5 py-1.5 text-[13px]"
              >
                <span className="font-medium">{row.type}</span>
                <span className="ml-2 text-[#64748b]">{row.value}</span>
              </li>
            ))}
          </ul>
        )}
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          <label className="block">
            <span className="mb-1 block text-[12px] font-medium text-[#334155]">Type</span>
            <select
              className="h-8 w-full rounded-sm border border-[var(--fresa-border,#C9D3DF)] px-2.5 text-[13px]"
              value={typedRefType}
              onChange={(e) => setTypedRefType(e.target.value)}
            >
              {REFERENCE_TYPES.map((r) => (
                <option key={r} value={r}>
                  {r.replaceAll('_', ' ')}
                </option>
              ))}
            </select>
          </label>
          <Input
            label="Value"
            value={typedRefValue}
            onChange={(e) => setTypedRefValue(e.target.value)}
          />
          <div className="flex items-end">
            <Button
              type="button"
              size="sm"
              variant="create"
              disabled={pending || !typedRefType.trim() || !typedRefValue.trim()}
              onClick={() =>
                void run(
                  () =>
                    actions.putReferenceByType.mutateAsync({
                      type: typedRefType.trim(),
                      dto: { value: typedRefValue.trim(), reference_no: typedRefValue.trim() },
                    }),
                  `${typedRefType} saved.`,
                ).then(() => setTypedRefValue(''))
              }
            >
              Upsert reference
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
