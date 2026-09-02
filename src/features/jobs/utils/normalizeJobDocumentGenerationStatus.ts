export type JobDocumentGenerationState =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'unknown';

export interface JobDocumentGenerationItem {
  key: string;
  label: string;
  status: JobDocumentGenerationState;
  message?: string;
  fileName?: string;
  updatedAt?: string;
}

export interface JobDocumentGenerationSummary {
  items: JobDocumentGenerationItem[];
  overallStatus: JobDocumentGenerationState;
  isComplete: boolean;
  hasFailure: boolean;
  message?: string;
}

const STATUS_ALIASES: Record<string, JobDocumentGenerationState> = {
  PENDING: 'pending',
  QUEUED: 'pending',
  WAITING: 'pending',
  PROCESSING: 'processing',
  IN_PROGRESS: 'processing',
  RUNNING: 'processing',
  GENERATING: 'processing',
  COMPLETED: 'completed',
  COMPLETE: 'completed',
  DONE: 'completed',
  SUCCESS: 'completed',
  READY: 'completed',
  SUCCEEDED: 'completed',
  FAILED: 'failed',
  ERROR: 'failed',
  FAILURE: 'failed',
};

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function readString(value: unknown): string | undefined {
  if (typeof value === 'string' && value.trim()) return value.trim();
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  return undefined;
}

export function normalizeJobDocumentGenerationStatus(
  raw: unknown,
): JobDocumentGenerationSummary {
  const empty: JobDocumentGenerationSummary = {
    items: [],
    overallStatus: 'unknown',
    isComplete: false,
    hasFailure: false,
  };

  if (raw == null) return empty;

  const record = asRecord(raw);
  if (!record) return empty;

  const topMessage = readString(record.message) ?? readString(record.detail);
  const items = collectItems(record);

  if (items.length === 0) {
    const overall = normalizeStatus(record.status ?? record.overall_status ?? record.state);
    return {
      items: [],
      overallStatus: overall,
      isComplete: overall === 'completed',
      hasFailure: overall === 'failed',
      message: topMessage,
    };
  }

  const hasFailure = items.some((item) => item.status === 'failed');
  const hasActive = items.some(
    (item) => item.status === 'pending' || item.status === 'processing',
  );
  const allCompleted = items.every((item) => item.status === 'completed');

  let overallStatus: JobDocumentGenerationState = 'unknown';
  if (hasFailure) overallStatus = 'failed';
  else if (hasActive) overallStatus = 'processing';
  else if (allCompleted) overallStatus = 'completed';
  else overallStatus = normalizeStatus(record.status ?? record.overall_status ?? record.state);

  return {
    items,
    overallStatus,
    isComplete: allCompleted && !hasFailure,
    hasFailure,
    message: topMessage,
  };
}

function collectItems(record: Record<string, unknown>): JobDocumentGenerationItem[] {
  const nested =
    record.documents ??
    record.items ??
    record.tasks ??
    record.generations ??
    record.jobs;

  if (Array.isArray(nested)) {
    return nested
      .map((entry, index) => parseItem(entry, `item-${index}`))
      .filter((item): item is JobDocumentGenerationItem => item != null);
  }

  const ignoredKeys = new Set([
    'status',
    'overall_status',
    'state',
    'message',
    'detail',
    'meta',
    'success',
    'data',
    'id',
    'job_id',
    'updated_at',
    'created_at',
  ]);

  const mapItems = Object.entries(record)
    .filter(([key]) => !ignoredKeys.has(key))
    .map(([key, value]) => parseItem(value, key))
    .filter((item): item is JobDocumentGenerationItem => item != null);

  if (mapItems.length > 0) return mapItems;

  const single = parseItem(record, readString(record.document_type) ?? 'document');
  return single ? [single] : [];
}

function parseItem(value: unknown, fallbackKey: string): JobDocumentGenerationItem | null {
  if (typeof value === 'string') {
    return {
      key: fallbackKey,
      label: formatDocumentTypeLabel(fallbackKey),
      status: normalizeStatus(value),
    };
  }

  const record = asRecord(value);
  if (!record) return null;

  const key =
    readString(record.document_type) ??
    readString(record.type) ??
    readString(record.key) ??
    readString(record.name) ??
    fallbackKey;

  const status = normalizeStatus(
    record.status ??
      record.state ??
      record.generation_status ??
      record.result ??
      (typeof record.completed === 'boolean'
        ? record.completed
          ? 'COMPLETED'
          : 'PENDING'
        : undefined),
  );

  const message =
    readString(record.message) ??
    readString(record.error) ??
    readString(record.error_message) ??
    readString(record.detail);

  return {
    key,
    label:
      readString(record.label) ??
      readString(record.document_type_label) ??
      formatDocumentTypeLabel(key),
    status,
    message,
    fileName: readString(record.file_name) ?? readString(record.filename),
    updatedAt:
      readString(record.updated_at) ??
      readString(record.completed_at) ??
      readString(record.generated_at),
  };
}

export function normalizeStatus(value: unknown): JobDocumentGenerationState {
  const raw = readString(value)?.toUpperCase();
  if (!raw) return 'unknown';
  return STATUS_ALIASES[raw] ?? 'unknown';
}

export function formatDocumentTypeLabel(key: string): string {
  return key
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[-_]+/g, ' ')
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function generationStatusLabel(status: JobDocumentGenerationState): string {
  switch (status) {
    case 'pending':
      return 'Pending';
    case 'processing':
      return 'Processing';
    case 'completed':
      return 'Completed';
    case 'failed':
      return 'Failed';
    default:
      return 'Unknown';
  }
}

export function generationStatusVariant(
  status: JobDocumentGenerationState,
): 'success' | 'warning' | 'danger' | 'info' | 'neutral' {
  switch (status) {
    case 'completed':
      return 'success';
    case 'processing':
      return 'info';
    case 'pending':
      return 'warning';
    case 'failed':
      return 'danger';
    default:
      return 'neutral';
  }
}
