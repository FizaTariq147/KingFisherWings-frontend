import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import {
  PARTY_PORTAL_DOCUMENT_TYPE_LABELS,
  PARTY_PORTAL_DOCUMENT_TYPES,
  type PartyPortalDocumentType,
} from '../../api/party.api';
import {
  usePartyPortalPermissions,
  useResetPartyPortalPermissions,
  useUpsertPartyPortalPermissions,
} from '../../hooks/usePartyPortal';
import type { PartyPortalPermissionEntry } from '../../types/partyPortal.types';
import { getErrorMessage } from '../../utils/getErrorMessage';

interface PartyPortalPermissionsSectionProps {
  partyId: string;
}

type DraftRow = {
  documentType: PartyPortalDocumentType;
  canView: boolean;
  canDownload: boolean;
};

function toDraft(entries: PartyPortalPermissionEntry[]): DraftRow[] {
  const byType = new Map(entries.map((e) => [String(e.documentType).toUpperCase(), e]));
  return PARTY_PORTAL_DOCUMENT_TYPES.map((documentType) => {
    const existing = byType.get(documentType);
    return {
      documentType,
      canView: existing?.canView ?? true,
      canDownload: existing?.canDownload ?? false,
    };
  });
}

export function PartyPortalPermissionsSection({ partyId }: PartyPortalPermissionsSectionProps) {
  const { data, isLoading, isError, error, refetch } = usePartyPortalPermissions(partyId);
  const upsert = useUpsertPartyPortalPermissions(partyId);
  const reset = useResetPartyPortalPermissions(partyId);
  const [draft, setDraft] = useState<DraftRow[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (data) setDraft(toDraft(data));
  }, [data]);

  const pending = upsert.isPending || reset.isPending;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2 flex-wrap">
        <CardTitle>Portal document rights</CardTitle>
        <div className="flex gap-2">
          <Button
            type="button"
            size="sm"
            variant="secondary"
            disabled={pending}
            onClick={async () => {
              setMessage(null);
              try {
                const next = await reset.mutateAsync();
                setDraft(toDraft(next));
                setMessage('Permissions reset to defaults.');
              } catch (err) {
                setMessage(getErrorMessage(err) || 'Reset failed.');
              }
            }}
          >
            Reset defaults
          </Button>
          <Button
            type="button"
            size="sm"
            disabled={pending || draft.length === 0}
            onClick={async () => {
              setMessage(null);
              try {
                await upsert.mutateAsync({
                  permissions: draft.map((row) => ({
                    document_type: row.documentType,
                    can_view: row.canView,
                    can_download: row.canDownload,
                  })),
                });
                setMessage('Permissions saved.');
              } catch (err) {
                setMessage(getErrorMessage(err) || 'Save failed.');
              }
            }}
          >
            {upsert.isPending ? 'Saving…' : 'Save'}
          </Button>
        </div>
      </CardHeader>

      <div className="p-4 pt-0 space-y-3">
        {message && (
          <p className="text-sm text-[var(--color-neutral-600)]" role="status">
            {message}
          </p>
        )}

        {isLoading ? (
          <p className="text-sm text-[var(--color-neutral-400)]">Loading permissions…</p>
        ) : isError ? (
          <div className="space-y-2">
            <p className="text-sm text-[var(--color-danger-600)]">
              {error instanceof Error ? error.message : 'Failed to load permissions.'}
            </p>
            <Button type="button" size="sm" variant="secondary" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-[var(--color-neutral-500)] border-b border-[var(--color-neutral-200)]">
                  <th className="py-2 pr-3 font-medium">Document</th>
                  <th className="py-2 pr-3 font-medium">View</th>
                  <th className="py-2 font-medium">Download</th>
                </tr>
              </thead>
              <tbody>
                {draft.map((row) => (
                  <tr key={row.documentType} className="border-b border-[var(--color-neutral-100)]">
                    <td className="py-2 pr-3 text-[var(--color-neutral-800)]">
                      {PARTY_PORTAL_DOCUMENT_TYPE_LABELS[row.documentType]}
                    </td>
                    <td className="py-2 pr-3">
                      <input
                        type="checkbox"
                        checked={row.canView}
                        onChange={(e) => {
                          const canView = e.target.checked;
                          setDraft((prev) =>
                            prev.map((r) =>
                              r.documentType === row.documentType
                                ? {
                                    ...r,
                                    canView,
                                    canDownload: canView ? r.canDownload : false,
                                  }
                                : r,
                            ),
                          );
                        }}
                      />
                    </td>
                    <td className="py-2">
                      <input
                        type="checkbox"
                        checked={row.canDownload}
                        disabled={!row.canView}
                        onChange={(e) => {
                          const canDownload = e.target.checked;
                          setDraft((prev) =>
                            prev.map((r) =>
                              r.documentType === row.documentType ? { ...r, canDownload } : r,
                            ),
                          );
                        }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Card>
  );
}
