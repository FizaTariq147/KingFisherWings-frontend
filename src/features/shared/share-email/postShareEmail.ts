import type { AxiosInstance } from 'axios';
import { wakeApi } from '@/lib/wakeApi';
import { formatShareEmailError } from './formatShareEmailError';
import { normalizeShareEmailResult } from './normalizeShareEmailResult';
import { SHARE_EMAIL_TIMEOUT_MS } from './shareEmailTimeout';
import type { ShareEmailDto, ShareEmailResult } from './types';

/**
 * POST a Part 7 share body.
 * Wakes a cold API first, then uses a longer timeout (PDF + SMTP).
 * Skips gateway retry so SMTP 503 is not masked as cold-start.
 */
export async function postShareEmail(
  client: AxiosInstance,
  url: string,
  dto: ShareEmailDto = {},
): Promise<ShareEmailResult> {
  try {
    await wakeApi(45_000);
    const res = await client.post<unknown>(url, dto, {
      timeout: SHARE_EMAIL_TIMEOUT_MS,
    });
    return normalizeShareEmailResult(res.data);
  } catch (error) {
    throw formatShareEmailError(error);
  }
}
