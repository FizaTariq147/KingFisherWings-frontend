/** Pick a system-generated temporary password from common Nest/API envelope shapes. */
export function pickTemporaryPassword(raw: unknown): string {
  if (!raw || typeof raw !== 'object') return '';

  const preferredKeys = [
    'temporary_password',
    'temporaryPassword',
    'temp_password',
    'tempPassword',
    'generated_password',
    'generatedPassword',
    'plain_password',
    'plainPassword',
    'new_password',
    'newPassword',
  ] as const;

  const seen = new Set<unknown>();
  const queue: unknown[] = [raw];

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current || typeof current !== 'object' || seen.has(current)) continue;
    seen.add(current);

    const record = current as Record<string, unknown>;

    for (const key of preferredKeys) {
      const value = record[key];
      if (typeof value === 'string' && value.trim()) return value.trim();
    }

    for (const nestedKey of ['data', 'result', 'payload', 'user', 'meta', 'credentials']) {
      if (record[nestedKey] != null) queue.push(record[nestedKey]);
    }
  }

  return '';
}
