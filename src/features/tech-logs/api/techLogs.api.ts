export const TECH_LOGS_API = {
  summary: '/super-admin/tech-logs/summary',
  activity: '/super-admin/tech-logs/activity',
  issues: '/super-admin/tech-logs/issues',
  issue: (id: string) => `/super-admin/tech-logs/issues/${encodeURIComponent(id)}`,
  /** Staff JWT — report FE/client errors into Issues. */
  clientErrors: '/super-admin/tech-logs/client-errors',
} as const;
