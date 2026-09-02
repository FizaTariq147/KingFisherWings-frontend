import { Badge } from '@/components/ui/Badge';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import {
  formatDocumentTypeLabel,
  generationStatusLabel,
  generationStatusVariant,
  normalizeJobDocumentGenerationStatus,
  type JobDocumentGenerationState,
} from '../../utils/normalizeJobDocumentGenerationStatus';

interface JobDocumentGenerationStatusCardProps {
  status: unknown;
  polling?: boolean;
}

function formatTimestamp(value?: string): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

export function JobDocumentGenerationStatusCard({
  status,
  polling = false,
}: JobDocumentGenerationStatusCardProps) {
  const summary = normalizeJobDocumentGenerationStatus(status);

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle>Generation status</CardTitle>
          <Badge variant={generationStatusVariant(summary.overallStatus)} dot={false}>
            {generationStatusLabel(summary.overallStatus)}
          </Badge>
        </div>
      </CardHeader>
      <div className="px-4 pb-4 space-y-3">
        {summary.message && (
          <p className="text-sm text-[var(--color-neutral-600)]">{summary.message}</p>
        )}

        {summary.items.length === 0 ? (
          <p className="text-sm text-[var(--color-neutral-400)]">
            {summary.overallStatus === 'unknown'
              ? 'No active document generation tasks.'
              : `Overall status: ${generationStatusLabel(summary.overallStatus)}.`}
          </p>
        ) : (
          <div className="divide-y divide-[var(--color-neutral-100)] border border-[var(--color-neutral-100)] rounded-md">
            {summary.items.map((item) => (
              <GenerationStatusRow key={item.key} item={item} />
            ))}
          </div>
        )}

        {polling && (
          <p className="text-xs text-[var(--color-neutral-400)]">
            Refreshing every 5 seconds until generation finishes.
          </p>
        )}
      </div>
    </Card>
  );
}

function GenerationStatusRow({
  item,
}: {
  item: {
    key: string;
    label: string;
    status: JobDocumentGenerationState;
    message?: string;
    fileName?: string;
    updatedAt?: string;
  };
}) {
  const updated = formatTimestamp(item.updatedAt);

  return (
    <div className="flex flex-wrap items-start justify-between gap-3 px-3 py-2.5 text-sm">
      <div className="min-w-0">
        <p className="font-medium text-[var(--color-neutral-800)]">
          {item.label || formatDocumentTypeLabel(item.key)}
        </p>
        {item.fileName && (
          <p className="text-xs text-[var(--color-neutral-500)] truncate">{item.fileName}</p>
        )}
        {item.message && (
          <p className="text-xs text-[var(--color-danger-600)] mt-1">{item.message}</p>
        )}
        {updated && (
          <p className="text-xs text-[var(--color-neutral-400)] mt-1">Updated {updated}</p>
        )}
      </div>
      <Badge variant={generationStatusVariant(item.status)} dot={false}>
        {generationStatusLabel(item.status)}
      </Badge>
    </div>
  );
}
