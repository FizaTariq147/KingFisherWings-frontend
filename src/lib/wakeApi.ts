import { axiosInstance } from '@/lib/axios';

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

/** Render free-tier / proxy gateway failures while the dyno is sleeping. */
export function isGatewayError(err: unknown): boolean {
  const axiosErr = err as {
    response?: { status?: number };
    code?: string;
    message?: string;
  };
  const status = axiosErr.response?.status;
  if (status === 502 || status === 503 || status === 504) return true;
  if (axiosErr.code === 'ECONNABORTED' || axiosErr.code === 'ETIMEDOUT') return true;
  if (typeof axiosErr.message === 'string' && /status code 502|gateway|timeout/i.test(axiosErr.message)) {
    return true;
  }
  return false;
}

/**
 * Poll `/health` until Render responds with a non-gateway status.
 * Never throws — returns false if still cold after `timeoutMs`.
 */
export async function wakeApi(timeoutMs = 90_000): Promise<boolean> {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    const remaining = deadline - Date.now();
    if (remaining < 1_000) break;

    try {
      const res = await axiosInstance.get('/health', {
        timeout: Math.min(45_000, remaining),
        validateStatus: () => true,
      });
      // Any HTTP response other than gateway errors means the process is up
      // (/health may be 200 or 401 depending on deployment).
      if (res.status !== 502 && res.status !== 503 && res.status !== 504) {
        return true;
      }
    } catch {
      // Cold start / network — keep polling.
    }

    await sleep(2_500);
  }

  return false;
}

/**
 * Run an API call; on 502/503/504 wake the dyno and retry a few times.
 */
export async function withGatewayRetry<T>(
  fn: () => Promise<T>,
  options?: { attempts?: number; wakeMs?: number },
): Promise<T> {
  const attempts = options?.attempts ?? 3;
  const wakeMs = options?.wakeMs ?? 60_000;
  let lastError: unknown;

  for (let i = 0; i < attempts; i += 1) {
    try {
      if (i > 0) {
        await wakeApi(wakeMs);
        await sleep(1_500);
      }
      return await fn();
    } catch (err) {
      lastError = err;
      if (!isGatewayError(err) || i === attempts - 1) throw err;
    }
  }

  throw lastError;
}
