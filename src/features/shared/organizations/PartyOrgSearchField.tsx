import { useMemo, useState } from 'react';
import { Input } from '@/components/ui/Input';
import { isUuid } from '@/lib/isUuid';
import { axiosInstance } from '@/lib/axios';
import { useParties } from '@/features/parties/hooks/useParties';
import { withGatewayRetry } from '@/lib/wakeApi';
import { jobService } from '@/features/jobs/services/job.service';
import { shipmentService } from '@/features/shipments/services/shipment.service';

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function unwrapPartyList(raw: unknown): Record<string, unknown>[] {
  if (Array.isArray(raw)) {
    return raw.map(asRecord).filter((r): r is Record<string, unknown> => Boolean(r));
  }
  const rec = asRecord(raw);
  if (!rec) return [];
  for (const key of ['items', 'parties', 'data', 'results']) {
    if (Array.isArray(rec[key])) {
      return (rec[key] as unknown[])
        .map(asRecord)
        .filter((r): r is Record<string, unknown> => Boolean(r));
    }
  }
  return [];
}

type PartyHit = { id: string; label: string };

function mapPartyHits(rows: Record<string, unknown>[]): PartyHit[] {
  return rows
    .map((r) => {
      const id = String(r.id ?? r.party_id ?? '').trim();
      if (!isUuid(id)) return null;
      const name = String(r.party_name ?? r.name ?? r.display_name ?? '').trim();
      const code = String(r.party_code ?? r.code ?? '').trim();
      const type = String(r.party_type ?? r.type ?? '').trim();
      const label = [name || code || 'Party', code && name ? code : '', type]
        .filter(Boolean)
        .join(' · ');
      return { id, label };
    })
    .filter((x): x is PartyHit => Boolean(x));
}

async function tryOrgPartySearch(
  q: string,
  scope?: { jobId?: string; shipmentId?: string },
): Promise<PartyHit[] | null> {
  const term = q.trim();
  if (term.length < 2) return [];

  if (scope?.jobId && isUuid(scope.jobId)) {
    try {
      const raw = await jobService.searchOrganizationParties(scope.jobId, term, {
        limit: 20,
      });
      return mapPartyHits(unwrapPartyList(raw));
    } catch {
      /* fall through */
    }
  }
  if (scope?.shipmentId && isUuid(scope.shipmentId)) {
    try {
      const raw = await shipmentService.searchOrganizationParties(
        scope.shipmentId,
        term,
        { limit: 20 },
      );
      return mapPartyHits(unwrapPartyList(raw));
    } catch {
      /* fall through */
    }
  }

  const paths = [
    `/organizations/party-search`,
    `/jobs/organizations/party-search`,
    `/shipments/organizations/party-search`,
  ];
  for (const path of paths) {
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.get(path, { params: { q: term, limit: 20 } }),
      );
      const rows = unwrapPartyList(res.data);
      if (!rows.length && res.status === 404) continue;
      return mapPartyHits(rows);
    } catch {
      /* try next path / fall back to party list */
    }
  }
  return null;
}

/**
 * Party search for org tabs — prefers GET …/organizations/party-search?q=
 * when present; otherwise uses existing GET /parties?search=.
 * Never requires typing UUIDs; party_id is bound on select.
 */
export function PartyOrgSearchField({
  value,
  onChange,
  label = 'Party search',
  jobId,
  shipmentId,
}: {
  value: string;
  onChange: (partyId: string, meta?: { label?: string }) => void;
  label?: string;
  jobId?: string;
  shipmentId?: string;
}) {
  const [q, setQ] = useState('');
  const [selectedLabel, setSelectedLabel] = useState('');
  const [remoteHits, setRemoteHits] = useState<PartyHit[] | null>(null);
  const [searching, setSearching] = useState(false);

  const partiesQuery = useParties({
    page: 1,
    limit: 20,
    search: q.trim().length >= 2 ? q.trim() : undefined,
  });

  const listHits = useMemo(() => {
    const parties = partiesQuery.data?.parties ?? [];
    return parties.map((p) => {
      const name = (p.name || '').trim();
      const code = (p.code || '').trim();
      const type = (p.party_type || '').trim();
      return {
        id: p.id,
        label: [name || code || 'Party', code && name ? code : '', type]
          .filter(Boolean)
          .join(' · '),
      };
    });
  }, [partiesQuery.data?.parties]);

  const hits = remoteHits ?? listHits;

  const runSearch = async (term: string) => {
    setQ(term);
    if (term.trim().length < 2) {
      setRemoteHits(null);
      return;
    }
    setSearching(true);
    try {
      const remote = await tryOrgPartySearch(term, { jobId, shipmentId });
      setRemoteHits(remote);
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="space-y-1.5">
      <Input
        label={label}
        value={q}
        placeholder="Search name or code…"
        onChange={(e) => void runSearch(e.target.value)}
      />
      {value ? (
        <p className="text-[11px] text-[#64748b]">
          Selected: {selectedLabel || 'party bound'} (id kept for API, not typed).
        </p>
      ) : null}
      {searching || partiesQuery.isFetching ? (
        <p className="text-[11px] text-[#64748b]">Searching…</p>
      ) : hits.length > 0 && q.trim().length >= 2 ? (
        <ul className="max-h-36 overflow-auto rounded-sm border border-[#e8edf2] bg-white text-[12px]">
          {hits.map((hit) => (
            <li key={hit.id}>
              <button
                type="button"
                className={`block w-full px-2.5 py-1.5 text-left hover:bg-[#f8fafc] ${
                  value === hit.id ? 'bg-[#eff6ff]' : ''
                }`}
                onClick={() => {
                  onChange(hit.id, { label: hit.label });
                  setSelectedLabel(hit.label);
                  setQ(hit.label);
                }}
              >
                {hit.label}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
