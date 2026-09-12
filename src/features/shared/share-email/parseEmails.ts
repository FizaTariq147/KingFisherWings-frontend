/** Split free-text recipients into unique trimmed emails (no hardcoding of domains). */
export function parseEmailList(value: string): string[] {
  return [
    ...new Set(
      value
        .split(/[\n,;]+/)
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  ];
}

export function isLikelyEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}
