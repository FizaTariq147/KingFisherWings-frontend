export const DEFAULT_MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

export type FileUploadValidationOptions = {
  maxBytes?: number;
  allowedMimeTypes?: string[];
  allowedExtensions?: string[];
  /** When true, skip extension / MIME / filename checks — only empty + size. */
  allowAnyFile?: boolean;
};

export type FileUploadValidationResult =
  | { ok: true }
  | { ok: false; message: string };

function extensionOf(name: string): string {
  const index = name.lastIndexOf('.');
  return index >= 0 ? name.slice(index + 1).toLowerCase() : '';
}

/**
 * Reject names like `report.pdf.exe` where a *middle* segment is a real extension.
 * Do not reject dots in the basename (e.g. WhatsApp `3.52.24 PM.jpeg`).
 */
const DANGEROUS_INNER_EXTENSIONS = new Set([
  'exe',
  'bat',
  'cmd',
  'com',
  'msi',
  'scr',
  'js',
  'jse',
  'vbs',
  'vbe',
  'wsf',
  'wsh',
  'ps1',
  'jar',
  'apk',
  'dll',
  'html',
  'htm',
  'svg',
  'php',
  'asp',
  'aspx',
  'cgi',
  'sh',
  'pdf', // report.pdf.exe style
  'doc',
  'docx',
  'xls',
  'xlsx',
  'zip',
  'rar',
]);

function hasSuspiciousDoubleExtension(name: string): boolean {
  const base = name.replace(/\\/g, '/').split('/').pop() ?? name;
  const parts = base.split('.');
  if (parts.length <= 2) return false;
  // Middle segments only (exclude basename + final extension).
  const inner = parts.slice(1, -1).map((p) => p.trim().toLowerCase());
  return inner.some((p) => DANGEROUS_INNER_EXTENSIONS.has(p));
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

  if (options.allowAnyFile) {
    return { ok: true };
  }

  if (hasSuspiciousDoubleExtension(file.name)) {
    return { ok: false, message: 'Invalid file name.' };
  }

  const extension = extensionOf(file.name);
  if (options.allowedExtensions?.length && !options.allowedExtensions.includes(extension)) {
    return { ok: false, message: `File type .${extension || '?'} is not allowed.` };
  }

  if (options.allowedMimeTypes?.length) {
    if (!file.type) {
      // Browsers often omit MIME for CSV/zip — require a matching extension allowlist.
      if (!options.allowedExtensions?.length) {
        return { ok: false, message: 'File type is not allowed.' };
      }
    } else if (!options.allowedMimeTypes.includes(file.type)) {
      return { ok: false, message: 'File type is not allowed.' };
    }
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

export type MultiFileUploadValidationOptions = FileUploadValidationOptions & {
  /** Max files accepted in one pick (default 10). */
  maxFiles?: number;
};

/** Validate multiple files; returns only files that pass, or error if none / over cap. */
export function pickValidatedUploadFiles(
  fileList: FileList | null,
  options: MultiFileUploadValidationOptions = {},
): { files: File[]; error?: string } {
  const maxFiles = options.maxFiles ?? 10;
  const picked = Array.from(fileList ?? []);
  if (!picked.length) return { files: [] };
  if (picked.length > maxFiles) {
    return {
      files: [],
      error: `Select at most ${maxFiles} files.`,
    };
  }
  const files: File[] = [];
  for (const file of picked) {
    const result = validateUploadFile(file, options);
    if (!result.ok) {
      return { files: [], error: `${file.name}: ${result.message}` };
    }
    files.push(file);
  }
  return { files };
}

export function handleValidatedMultiFileInput(
  fileList: FileList | null,
  onValid: (files: File[]) => void,
  onError?: (message: string) => void,
  options?: MultiFileUploadValidationOptions,
): void {
  const { files, error } = pickValidatedUploadFiles(fileList, options);
  if (error) {
    onError?.(error);
    onValid([]);
    return;
  }
  onValid(files);
}

/**
 * Delivery acknowledgement proofs — any file type/name.
 * Cap only: 10 files × 25MB (`file` single / `files` multi).
 */
export const ACKNOWLEDGEMENT_UPLOAD_OPTIONS: MultiFileUploadValidationOptions = {
  maxBytes: 25 * 1024 * 1024,
  maxFiles: 10,
  allowAnyFile: true,
};

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

export const PAYMENT_PROOF_UPLOAD_OPTIONS: FileUploadValidationOptions = {
  maxBytes: DEFAULT_MAX_UPLOAD_BYTES,
  allowedExtensions: ['pdf', 'png', 'jpg', 'jpeg', 'webp'],
  allowedMimeTypes: ['application/pdf', 'image/png', 'image/jpeg', 'image/webp'],
};

export const SPREADSHEET_UPLOAD_OPTIONS: FileUploadValidationOptions = {
  maxBytes: DEFAULT_MAX_UPLOAD_BYTES,
  allowedExtensions: ['xlsx', 'xls', 'csv', 'txt'],
  allowedMimeTypes: [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
    'text/csv',
    'text/plain',
    'application/csv',
  ],
};

export const CSV_UPLOAD_OPTIONS: FileUploadValidationOptions = {
  maxBytes: DEFAULT_MAX_UPLOAD_BYTES,
  allowedExtensions: ['csv'],
  allowedMimeTypes: ['text/csv', 'application/csv', 'text/plain', 'application/vnd.ms-excel'],
};

export const JOB_TRANSFER_UPLOAD_OPTIONS: FileUploadValidationOptions = {
  maxBytes: 50 * 1024 * 1024,
  allowedExtensions: ['zip', 'json'],
  allowedMimeTypes: [
    'application/zip',
    'application/x-zip-compressed',
    'application/json',
    'text/json',
  ],
};
