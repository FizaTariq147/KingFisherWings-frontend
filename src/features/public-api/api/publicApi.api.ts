/** External /api/v1 clients (tenant API key or public track token). */
export const PUBLIC_API_V1 = {
  health: '/api/v1/health',
  jobs: '/api/v1/jobs',
  job: (id: string) => `/api/v1/jobs/${encodeURIComponent(id)}`,
  track: (token: string) => `/api/v1/track/${encodeURIComponent(token)}`,
} as const;
