import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  useJobTrackingProfile,
  useUpsertJobTrackingProfile,
} from '../../hooks/useJobs';
import type { UpsertJobTrackingProfileDto } from '../../types/job.types';
import { getErrorMessage } from '../../utils/getErrorMessage';

type JsonFieldKey =
  | 'legs'
  | 'port_of_call'
  | 'container_events'
  | 'arrival_report'
  | 'customs_status'
  | 'pre_manifest'
  | 'detailed_data'
  | 'qty_gw_vol';

const JSON_FIELDS: { key: JsonFieldKey; label: string; array: boolean }[] = [
  { key: 'legs', label: 'Legs (JSON array)', array: true },
  { key: 'port_of_call', label: 'Port of call (JSON array)', array: true },
  { key: 'container_events', label: 'Container events (JSON array)', array: true },
  { key: 'arrival_report', label: 'Arrival report (JSON array)', array: true },
  { key: 'customs_status', label: 'Customs status (JSON array)', array: true },
  { key: 'pre_manifest', label: 'Pre-manifest (JSON array)', array: true },
  { key: 'detailed_data', label: 'Detailed data (JSON object)', array: false },
  { key: 'qty_gw_vol', label: 'QTY / G.W. / VOL. (JSON object)', array: false },
];

function prettyJson(value: unknown, fallback: unknown): string {
  try {
    return JSON.stringify(value ?? fallback, null, 2);
  } catch {
    return JSON.stringify(fallback, null, 2);
  }
}

function parseJsonField(
  text: string,
  asArray: boolean,
): { ok: true; value: unknown } | { ok: false; error: string } {
  const trimmed = text.trim();
  if (!trimmed) return { ok: true, value: asArray ? [] : {} };
  try {
    const parsed = JSON.parse(trimmed) as unknown;
    if (asArray) {
      if (!Array.isArray(parsed)) {
        return { ok: false, error: 'Expected a JSON array.' };
      }
      return { ok: true, value: parsed };
    }
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return { ok: false, error: 'Expected a JSON object.' };
    }
    return { ok: true, value: parsed };
  } catch {
    return { ok: false, error: 'Invalid JSON.' };
  }
}

/**
 * Staff editor for GET|PUT /jobs/:id/tracking/profile.
 * Seeds empty on first open; saves UpsertJobTrackingProfileDto.
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
  const upsert = useUpsertJobTrackingProfile(jobId);

  const [originLabel, setOriginLabel] = useState('');
  const [destLabel, setDestLabel] = useState('');
  const [atBefore, setAtBefore] = useState('');
  const [terminalCutoffAt, setTerminalCutoffAt] = useState('');
  const [jsonText, setJsonText] = useState<Record<JsonFieldKey, string>>({
    legs: '[]',
    port_of_call: '[]',
    container_events: '[]',
    arrival_report: '[]',
    customs_status: '[]',
    pre_manifest: '[]',
    detailed_data: '{}',
    qty_gw_vol: '{}',
  });
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    const p = profileQuery.data;
    if (!p) return;
    setOriginLabel(p.origin_label ?? '');
    setDestLabel(p.dest_label ?? '');
    setAtBefore(p.at_before ?? '');
    setTerminalCutoffAt(p.terminal_cutoff_at ?? '');
    setJsonText({
      legs: prettyJson(p.legs, []),
      port_of_call: prettyJson(p.port_of_call, []),
      container_events: prettyJson(p.container_events, []),
      arrival_report: prettyJson(p.arrival_report, []),
      customs_status: prettyJson(p.customs_status, []),
      pre_manifest: prettyJson(p.pre_manifest, []),
      detailed_data: prettyJson(p.detailed_data, {}),
      qty_gw_vol: prettyJson(p.qty_gw_vol, {}),
    });
  }, [profileQuery.data]);

  const save = async () => {
    setError(null);
    setMsg(null);

    const parsedFields: Partial<UpsertJobTrackingProfileDto> = {};
    for (const field of JSON_FIELDS) {
      const parsed = parseJsonField(jsonText[field.key], field.array);
      if (!parsed.ok) {
        setError(`${field.label}: ${parsed.error}`);
        return;
      }
      if (field.key === 'detailed_data' || field.key === 'qty_gw_vol') {
        parsedFields[field.key] = parsed.value as Record<string, unknown>;
      } else {
        parsedFields[field.key] = parsed.value as Record<string, unknown>[];
      }
    }

    const dto: UpsertJobTrackingProfileDto = {
      origin_label: originLabel.trim() || undefined,
      dest_label: destLabel.trim() || undefined,
      at_before: atBefore.trim() || undefined,
      terminal_cutoff_at: terminalCutoffAt.trim() || undefined,
      ...parsedFields,
    };

    try {
      await upsert.mutateAsync(dto);
      setMsg('Tracking profile saved.');
      onSaved?.();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div className="space-y-4 text-sm">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-[12px] font-semibold uppercase tracking-wide text-[var(--fresa-header-text,#0A2942)]">
            Edit tracking profile
          </p>
          <p className="mt-1 text-[12px] text-[#64748b]">
            YQN-style route / cargo / pre-manifest enrichment. Empty seed is fine on first
            open; saved values feed staff tracking and public /track.
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
      {profileQuery.isLoading ? (
        <p className="text-[13px] text-[#64748b]">Loading tracking profile…</p>
      ) : null}
      {profileQuery.isError ? (
        <p className="text-[13px] text-red-700">{getErrorMessage(profileQuery.error)}</p>
      ) : null}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Input
          label="Origin label"
          value={originLabel}
          onChange={(e) => setOriginLabel(e.target.value)}
          placeholder="POL / origin"
        />
        <Input
          label="Destination label"
          value={destLabel}
          onChange={(e) => setDestLabel(e.target.value)}
          placeholder="POD / destination"
        />
        <Input
          label="AT before"
          value={atBefore}
          onChange={(e) => setAtBefore(e.target.value)}
          placeholder="ISO datetime"
        />
        <Input
          label="Terminal cutoff at"
          value={terminalCutoffAt}
          onChange={(e) => setTerminalCutoffAt(e.target.value)}
          placeholder="ISO datetime"
        />
      </div>

      <div className="space-y-3">
        {JSON_FIELDS.map((field) => (
          <label key={field.key} className="block space-y-1">
            <span className="text-xs font-medium text-[var(--color-neutral-600)]">
              {field.label}
            </span>
            <textarea
              value={jsonText[field.key]}
              onChange={(e) =>
                setJsonText((prev) => ({ ...prev, [field.key]: e.target.value }))
              }
              rows={field.array ? 4 : 3}
              className="w-full rounded-md border border-[var(--fresa-border,#C9D3DF)] bg-white px-3 py-2 font-mono text-[12px] text-[var(--color-neutral-800)] focus:border-[var(--color-primary-500)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary-500)]"
              spellCheck={false}
            />
          </label>
        ))}
      </div>

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
