export const PORTAL_CC_API = {
  list: '/portal/cc-jobs',
  byId: (id: string) => `/portal/cc-jobs/${encodeURIComponent(id)}`,
  checklist: (id: string) => `/portal/cc-jobs/${encodeURIComponent(id)}/checklist`,
  documents: (id: string) => `/portal/cc-jobs/${encodeURIComponent(id)}/documents`,
} as const;
