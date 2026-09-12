/**
 * Share endpoints return 503 by design when SMTP is misconfigured.
 * Do not treat that as a cold-start gateway failure.
 *
 * Connection-timeout text means the API still cannot open SMTP from its host
 * (usually Render → Gmail). That is not a frontend bug; FE only surfaces the API body.
 */
export function formatShareEmailError(error: unknown, fallback = 'Could not send email.'): Error {
  if (isNetworkOrTimeoutError(error)) {
    return new Error(networkOrTimeoutMessage(error));
  }

  if (error instanceof Error && !(error as { response?: unknown }).response) {
    return error;
  }

  const axiosErr = error as {
    code?: string;
    response?: {
      status?: number;
      data?: unknown;
    };
    message?: string;
  };

  const status = axiosErr.response?.status;
  const detail = extractShareErrorDetail(axiosErr.response?.data) || axiosErr.message?.trim();

  if (status === 503 || looksLikeSmtpConfigError(detail) || looksLikeSmtpConnectionTimeout(detail)) {
    return new Error(
      rewriteSmtpDetail(detail) ||
        'Email service unavailable (SMTP not configured or unreachable). Check SMTP_HOST is a hostname like smtp.gmail.com — not an email address.',
    );
  }

  if (status === 500 && isGenericInternalError(detail)) {
    return new Error(
      'Email send failed on the server (500). Usually SMTP/PDF generation — confirm SMTP_HOST=smtp.gmail.com and that the PDF can be generated, then retry.',
    );
  }

  if (detail) return new Error(detail);
  return new Error(axiosErr.message || fallback);
}

export function formatShareEmailSuccess(result: {
  success?: boolean;
  pdf_attached?: boolean;
  message?: string;
}): string {
  if (result.message?.trim()) return result.message.trim();
  const parts = ['Email sent'];
  if (result.pdf_attached) parts.push('PDF attached');
  return `${parts.join(' — ')}.`;
}

function isNetworkOrTimeoutError(error: unknown): boolean {
  const axiosErr = error as {
    code?: string;
    message?: string;
    response?: unknown;
  };
  if (axiosErr.response) return false;
  if (axiosErr.code === 'ECONNABORTED' || axiosErr.code === 'ERR_NETWORK') return true;
  const msg = typeof axiosErr.message === 'string' ? axiosErr.message : '';
  return /timeout|network error|failed to fetch|ecconnreset|econnrefused/i.test(msg);
}

function networkOrTimeoutMessage(error: unknown): string {
  const msg = error instanceof Error ? error.message : '';
  if (/timeout|ECONNABORTED/i.test(msg) || (error as { code?: string }).code === 'ECONNABORTED') {
    return (
      'Email send timed out waiting for the server. PDF + SMTP can take several minutes on a cold API. ' +
      'Check whether the email still arrived, then retry. If this keeps happening, backend must speed up PDF/SMTP or raise server timeouts.'
    );
  }
  return (
    'Network Error: the connection to the API closed before a response (often the local /backend proxy or Render cutting a long PDF+SMTP request). ' +
    'Restart the Vite dev server after the proxy timeout fix, wait for the API to wake, then retry. Also check inbox/Spam — the email may still have been sent.'
  );
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function extractShareErrorDetail(data: unknown): string | undefined {
  const root = asRecord(data);
  if (!root) return undefined;

  const candidates: unknown[] = [
    root.message,
    root.error,
    root.detail,
    root.cause,
    asRecord(root.error)?.message,
    asRecord(root.cause)?.message,
    asRecord(root.data)?.message,
  ];

  for (const candidate of candidates) {
    if (typeof candidate === 'string' && candidate.trim()) return candidate.trim();
    if (Array.isArray(candidate)) {
      const joined = candidate.map(String).filter(Boolean).join('; ');
      if (joined) return joined;
    }
  }
  return undefined;
}

function isGenericInternalError(detail?: string): boolean {
  if (!detail) return true;
  return /^(internal server error|error|failed)$/i.test(detail.trim());
}

function looksLikeSmtpConfigError(detail?: string): boolean {
  if (!detail) return false;
  return /EBADNAME|queryA|ENOTFOUND|ECONNREFUSED|SMTP|nodemailer|getaddrinfo|mail server/i.test(
    detail,
  );
}

function looksLikeSmtpConnectionTimeout(detail?: string): boolean {
  if (!detail) return false;
  return /email delivery failed.*connection timeout|connection timeout|etimedout|smtp.*timeout|greeting never received/i.test(
    detail,
  );
}

const SMTP_REACHABILITY_HINT =
  'The API host timed out opening SMTP during send (PDF + mail). /health can show smtp.configured=true and still fail here. Backend must fix the send path on the deployed host: raise Nodemailer connection/greeting timeouts, retry once on ETIMEDOUT, check Render logs for this request, and confirm outbound TCP to the SMTP host:port works under load — wrong env is unlikely if health already shows smtp.gmail.com:587.';

function alreadyHasSmtpHint(detail: string): boolean {
  return /smtp\.gmail\.com|SMTP_SECURE|App Password|Resend|SendGrid|cannot reach the SMTP|STARTTLS|SMTP_PASS|Nodemailer|ETIMEDOUT|\/health/i.test(
    detail,
  );
}

/** Collapse duplicated remediation if FE and BE both appended the same advice. */
function dedupeSmtpAdvice(detail: string): string {
  const parts = detail
    .split(/\s+[—–-]\s+/)
    .map((p) => p.trim())
    .filter(Boolean);
  if (parts.length <= 1) return detail;
  const seen = new Set<string>();
  const kept: string[] = [];
  for (const part of parts) {
    const key = /smtp|app password|render|starttls|connection timeout/i.test(part)
      ? 'smtp-advice'
      : part.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    kept.push(part);
  }
  return kept.join(' — ');
}

function rewriteSmtpDetail(detail?: string): string | undefined {
  if (!detail) return undefined;
  const cleaned = dedupeSmtpAdvice(detail);
  // API often already includes remediation — do not append a second copy.
  if (alreadyHasSmtpHint(cleaned)) return cleaned;
  if (/EBADNAME|queryA/i.test(cleaned)) {
    return `${cleaned} — SMTP host is probably set to an email address. Use smtp.gmail.com (or your real SMTP hostname), not the mailbox.`;
  }
  if (looksLikeSmtpConnectionTimeout(cleaned)) {
    return `${cleaned} — ${SMTP_REACHABILITY_HINT}`;
  }
  return cleaned;
}
