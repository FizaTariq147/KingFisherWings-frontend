export const REPORT_CATALOG_API = {
  templates: '/reports/templates',
  template: (id: string) => `/reports/templates/${id}`,
  generate: '/reports/generate',
  job: (jobId: string) => `/reports/jobs/${jobId}`,
  download: (jobId: string) => `/reports/jobs/${jobId}/download`,
} as const;

export const REPORT_CATALOG_ROUTE = '/reports/catalog';
