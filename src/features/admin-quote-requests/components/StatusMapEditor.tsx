import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export type StatusMapRow = { id: string; remote: string; local: string };

let rowSeq = 0;
export function newStatusMapRow(remote = '', local = ''): StatusMapRow {
  rowSeq += 1;
  return { id: `sm-${rowSeq}`, remote, local };
}

export function statusMapFromRows(rows: StatusMapRow[]): Record<string, string> | undefined {
  const out: Record<string, string> = {};
  for (const row of rows) {
    const remote = row.remote.trim();
    const local = row.local.trim();
    if (!remote || !local) continue;
    out[remote] = local;
  }
  return Object.keys(out).length ? out : undefined;
}

export function rowsFromStatusMap(map: Record<string, string> | null | undefined): StatusMapRow[] {
  if (!map) return [];
  return Object.entries(map).map(([remote, local]) => newStatusMapRow(remote, local));
}

export function StatusMapEditor({
  rows,
  onChange,
  disabled,
}: {
  rows: StatusMapRow[];
  onChange: (rows: StatusMapRow[]) => void;
  disabled?: boolean;
}) {
  const update = (id: string, patch: Partial<StatusMapRow>) => {
    onChange(rows.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-xs font-medium text-[var(--color-neutral-600)]">
            Website → KingFisher status mapping
          </p>
          <p className="text-xs text-[var(--color-neutral-400)]">
            Optional. Map remote website statuses to local labels used in lists.
          </p>
        </div>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          disabled={disabled}
          onClick={() => onChange([...rows, newStatusMapRow()])}
        >
          Add mapping
        </Button>
      </div>
      {rows.length === 0 ? (
        <p className="rounded-md border border-dashed border-[var(--color-neutral-200)] px-3 py-2 text-xs text-[var(--color-neutral-500)]">
          No mappings — website statuses are kept as received.
        </p>
      ) : (
        <ul className="space-y-2">
          {rows.map((row) => (
            <li key={row.id} className="flex flex-wrap items-end gap-2">
              <div className="min-w-[140px] flex-1">
                <Input
                  label="Website status"
                  value={row.remote}
                  disabled={disabled}
                  placeholder="e.g. new"
                  onChange={(e) => update(row.id, { remote: e.target.value })}
                />
              </div>
              <div className="min-w-[140px] flex-1">
                <Input
                  label="KingFisher status"
                  value={row.local}
                  disabled={disabled}
                  placeholder="e.g. pending"
                  onChange={(e) => update(row.id, { local: e.target.value })}
                />
              </div>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                disabled={disabled}
                onClick={() => onChange(rows.filter((r) => r.id !== row.id))}
              >
                Remove
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
