export const DEFAULT_MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

export type FileUploadValidationOptions = {
  maxBytes?: number;
  allowedMimeTypes?: string[];
  allowedExtensions?: string[];
};

export type FileUploadValidationResult =
  | { ok: true }
  | { ok: false; message: string };

function extensionOf(name: string): string {
  const index = name.lastIndexOf('.');
  return index >= 0 ? name.slice(index + 1).toLowerCase() : '';
}

/** Reject names like `report.pdf.exe` (double extension). */
function hasSuspiciousDoubleExtension(name: string): boolean {
  const base = name.replace(/\\/g, '/').split('/').pop() ?? name;
  const parts = base.split('.');
  return parts.length > 2;
}

export function validateUploadFile(
  file: File,
  options: FileUploadValidationOptions = {},
): FileUploadValidationResult {
  const maxBytes = options.maxBytes ?? DEFAULT_MAX_UPLOAD_BYTES;

  if (file.size <= 0) {
    return { ok: false, message: 'File is empty.' };
  }

  if (file.size > maxBytes) {
    const limitMb = Math.round(maxBytes / (1024 * 1024));
    return { ok: false, message: `File must be ${limitMb} MB or smaller.` };
  }

  if (hasSuspiciousDoubleExtension(file.name)) {
    return { ok: false, message: 'Invalid file name.' };
  }

  const extension = extensionOf(file.name);
  if (options.allowedExtensions?.length && !options.allowedExtensions.includes(extension)) {
    return { ok: false, message: `File type .${extension || '?'} is not allowed.` };
  }

  if (
    options.allowedMimeTypes?.length &&
    file.type &&
    !options.allowedMimeTypes.includes(file.type)
  ) {
    return { ok: false, message: 'File type is not allowed.' };
  }

  return { ok: true };
}

export function pickValidatedUploadFile(
  fileList: FileList | null,
  options?: FileUploadValidationOptions,
): { file: File | null; error?: string } {
  const file = fileList?.[0] ?? null;
  if (!file) return { file: null };

  const result = validateUploadFile(file, options);
  if (!result.ok) return { file: null, error: result.message };

  return { file };
}

export function handleValidatedFileInput(
  fileList: FileList | null,
  onValid: (file: File | null) => void,
  onError?: (message: string) => void,
  options?: FileUploadValidationOptions,
): void {
  const { file, error } = pickValidatedUploadFile(fileList, options);
  if (error) {
    onError?.(error);
    onValid(null);
    return;
  }
  onValid(file);
}

/** Common attachment presets for portal / CRM uploads. */
export const ATTACHMENT_UPLOAD_OPTIONS: FileUploadValidationOptions = {
  maxBytes: DEFAULT_MAX_UPLOAD_BYTES,
  allowedExtensions: ['pdf', 'png', 'jpg', 'jpeg', 'gif', 'webp', 'doc', 'docx', 'xls', 'xlsx', 'csv', 'txt'],
  allowedMimeTypes: [
    'application/pdf',
    'image/png',
    'image/jpeg',
    'image/gif',
    'image/webp',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/csv',
    'text/plain',
  ],
};

export const PDF_UPLOAD_OPTIONS: FileUploadValidationOptions = {
  maxBytes: DEFAULT_MAX_UPLOAD_BYTES,
  allowedExtensions: ['pdf'],
  allowedMimeTypes: ['application/pdf'],
};
