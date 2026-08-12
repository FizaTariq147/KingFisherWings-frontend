import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import {
  PARTY_VENDOR_DOCUMENT_TYPE_LABELS,
  PARTY_VENDOR_DOCUMENT_TYPES,
  type PartyVendorDocumentType,
} from '../../api/party.api';
import {
  usePartyVendorPermissions,
  useUpsertPartyVendorPermissions,
} from '../../hooks/usePartyVendor';
import type { PartyVendorPermissionEntry } from '../../types/partyVendor.types';
import { getErrorMessage } from '../../utils/getErrorMessage';

interface PartyVendorPermissionsSectionProps {
  partyId: string;
}

type DraftRow = {
  documentType: PartyVendorDocumentType;
  canView: boolean;
  canDownload: boolean;
};

function toDraft(entries: PartyVendorPermissionEntry[]): DraftRow[] {
  const byType = new Map(entries.map((e) => [String(e.documentType).toUpperCase(), e]));
  return PARTY_VENDOR_DOCUMENT_TYPES.map((documentType) => {
    const existing = byType.get(documentType);
    return {
      documentType,
      canView: existing?.canView ?? true,
      canDownload: existing?.canDownload ?? false,
    };
  });
}

export function PartyVendorPermissionsSection({ partyId }: PartyVendorPermissionsSectionProps) {
  const { data, isLoading, isError, error, refetch } = usePartyVendorPermissions(partyId);
  const upsert = useUpsertPartyVendorPermissions(partyId);
  const [draft, setDraft] = useState<DraftRow[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (data) setDraft(toDraft(data));
  }, [data]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2 flex-wrap">
        <CardTitle>Vendor rights</CardTitle>
        <Button
          type="button"
          size="sm"
          disabled={upsert.isPending || draft.length === 0}
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
              setMessage('Vendor permissions saved.');
            } catch (err) {
              setMessage(getErrorMessage(err) || 'Save failed.');
            }
          }}
        >
          {upsert.isPending ? 'Saving…' : 'Save'}
        </Button>
      </CardHeader>

      <div className="p-4 pt-0 space-y-3">
        {message ? (
          <p className="text-sm text-[var(--color-neutral-600)]" role="status">
            {message}
          </p>
        ) : null}
        {isLoading ? (
          <p className="text-sm text-[var(--color-neutral-400)]">Loading vendor rights…</p>
        ) : isError ? (
          <div className="space-y-2">
            <p className="text-sm text-[var(--color-danger-600)]">
              {getErrorMessage(error) || 'Failed to load vendor rights.'}
            </p>
            <Button type="button" size="sm" variant="secondary" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-[var(--color-neutral-500)]">
                  <th className="py-2 pr-3">Document</th>
                  <th className="py-2 pr-3">View</th>
                  <th className="py-2">Download</th>
                </tr>
              </thead>
              <tbody>
                {draft.map((row) => (
                  <tr key={row.documentType} className="border-t border-[var(--color-neutral-100)]">
                    <td className="py-2.5 pr-3 font-medium text-[var(--color-neutral-800)]">
                      {PARTY_VENDOR_DOCUMENT_TYPE_LABELS[row.documentType]}
                    </td>
                    <td className="py-2.5 pr-3">
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
                    <td className="py-2.5">
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
