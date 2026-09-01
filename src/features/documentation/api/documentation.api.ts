export const DOCUMENTATION_API = {
  boe: {
    create: '/documentation/boe',
    dashboard: '/documentation/boe/dashboard',
    pendingClaims: '/documentation/boe/claims/pending',
    byId: (id: string) => `/documentation/boe/${id}`,
  },
  bulkCosts: {
    create: '/documentation/bulk-costs',
    preview: '/documentation/bulk-costs/preview',
    byId: (id: string) => `/documentation/bulk-costs/${id}`,
  },
  chargeTemplates: {
    list: '/documentation/charge-templates',
    create: '/documentation/charge-templates',
    byId: (id: string) => `/documentation/charge-templates/${id}`,
    apply: (id: string) => `/documentation/charge-templates/${id}/apply`,
  },
  deliveryOrders: {
    closedJobs: '/documentation/delivery-orders/closed-jobs',
    updateJob: (jobId: string) => `/documentation/jobs/${jobId}/delivery-order`,
  },
  edi: {
    bayan: {
      jobs: '/documentation/edi/bayan/jobs',
      shipments: '/documentation/edi/bayan/shipments',
      generate: (jobId: string) => `/documentation/edi/bayan/jobs/${jobId}/generate`,
      submit: (jobId: string) => `/documentation/edi/bayan/jobs/${jobId}/submit`,
      amend: (jobId: string) => `/documentation/edi/bayan/jobs/${jobId}/amend`,
    },
    ccn: {
      jobs: '/documentation/edi/ccn/jobs',
      generateFwb: (jobId: string) => `/documentation/edi/ccn/jobs/${jobId}/fwb/generate`,
      generateFhl: (jobId: string) => `/documentation/edi/ccn/jobs/${jobId}/fhl/generate`,
      submit: (jobId: string) => `/documentation/edi/ccn/jobs/${jobId}/submit`,
    },
    cgm: {
      vessels: '/documentation/edi/cgm/vessels',
      byId: (id: string) => `/documentation/edi/cgm/vessels/${id}`,
      downloadEdi: (id: string) => `/documentation/edi/cgm/vessels/${id}/download-edi`,
    },
    eqo: {
      dubai: {
        jobs: '/documentation/edi/eqo/dubai/jobs',
        generateBol: (jobId: string) => `/documentation/edi/eqo/dubai/jobs/${jobId}/generate-bol`,
        submit: (jobId: string) => `/documentation/edi/eqo/dubai/jobs/${jobId}/submit`,
      },
      oman: {
        jobs: '/documentation/edi/eqo/oman/jobs',
        generateBol: (jobId: string) => `/documentation/edi/eqo/oman/jobs/${jobId}/generate-bol`,
        submit: (jobId: string) => `/documentation/edi/eqo/oman/jobs/${jobId}/submit`,
      },
    },
    ial: {
      jobs: '/documentation/edi/ial/jobs',
      generate: (jobId: string) => `/documentation/edi/ial/jobs/${jobId}/generate`,
      submit: (jobId: string) => `/documentation/edi/ial/jobs/${jobId}/submit`,
    },
    downloadSubmission: (submissionId: string) =>
      `/documentation/edi/submissions/${submissionId}/download`,
  },
  jobTransfer: {
    export: '/documentation/jobs/export',
    import: '/documentation/jobs/import',
  },
  mpci: {
    list: '/documentation/mpci/filings',
    create: '/documentation/mpci/filings',
    prepare: (id: string) => `/documentation/mpci/filings/${id}/prepare`,
    status: (id: string) => `/documentation/mpci/filings/${id}/status`,
    submit: (id: string) => `/documentation/mpci/filings/${id}/submit`,
  },
  reports: {
    summary: '/documentation/reports',
    jobsList: '/documentation/reports/jobs-list',
    etaFollowup: '/documentation/reports/eta-followup',
    etdFollowup: '/documentation/reports/etd-followup',
    manifestStatus: '/documentation/reports/manifest-status',
  },
  tracking: {
    air: '/documentation/tracking/air',
  },
  uploads: {
    containerNumbers: '/documentation/uploads/container-numbers',
    containerTransport: '/documentation/uploads/container-transport',
    dpworldTracking: '/documentation/uploads/dpworld-tracking',
    truckPositions: '/documentation/uploads/truck-positions',
    template: (uploadType: string) => `/documentation/uploads/templates/${uploadType}`,
    batchErrors: (batchId: string) => `/documentation/uploads/batches/${batchId}/errors`,
  },
} as const;

export type DocumentationUploadType =
  | 'container-numbers'
  | 'container-transport'
  | 'dpworld-tracking'
  | 'truck-positions';
