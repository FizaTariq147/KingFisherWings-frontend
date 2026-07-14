/** Jobs REST paths — Swagger tag Jobs (Bearer JWT). */
export const JOB_API = {
  list: '/jobs',
  byId: (id: string) => `/jobs/${id}`,
  cancel: (id: string) => `/jobs/${id}/cancel`,
  close: (id: string) => `/jobs/${id}/close`,
  houseJobs: (id: string) => `/jobs/${id}/house-jobs`,
  prorateCost: (id: string, chargeCodeId: string) =>
    `/jobs/${id}/prorate-cost/${chargeCodeId}`,

  airDetails: (id: string) => `/jobs/${id}/air-details`,
  seaFclDetails: (id: string) => `/jobs/${id}/sea-fcl-details`,
  submitSi: (id: string) => `/jobs/${id}/sea-fcl-details/si-submission`,
  submitVgm: (id: string) => `/jobs/${id}/sea-fcl-details/vgm-submission`,
  cutoffs: (id: string) => `/jobs/${id}/cutoffs`,

  containers: (id: string) => `/jobs/${id}/containers`,
  container: (id: string, containerId: string) => `/jobs/${id}/containers/${containerId}`,
  containersFill: (id: string) => `/jobs/${id}/containers/fill`,
  containerFill: (id: string, containerId: string) =>
    `/jobs/${id}/containers/${containerId}/fill`,
  assignCargo: (id: string, containerId: string) =>
    `/jobs/${id}/containers/${containerId}/cargo`,
  splitContainer: (id: string, containerId: string) =>
    `/jobs/${id}/containers/${containerId}/split`,

  cargo: (id: string) => `/jobs/${id}/cargo`,
  cargoItem: (id: string, cargoId: string) => `/jobs/${id}/cargo/${cargoId}`,

  billsOfLading: (id: string) => `/jobs/${id}/bills-of-lading`,
  billOfLading: (id: string, blId: string) => `/jobs/${id}/bills-of-lading/${blId}`,

  charges: (id: string) => `/jobs/${id}/charges`,
  charge: (id: string, chargeId: string) => `/jobs/${id}/charges/${chargeId}`,
  pnl: (id: string) => `/jobs/${id}/pnl`,

  milestones: (id: string) => `/jobs/${id}/milestones`,
  milestone: (id: string, milestoneId: string) => `/jobs/${id}/milestones/${milestoneId}`,

  notes: (id: string) => `/jobs/${id}/notes`,
  note: (id: string, noteId: string) => `/jobs/${id}/notes/${noteId}`,

  stuffingRecords: (id: string) => `/jobs/${id}/stuffing-records`,
  stuffingRecord: (id: string, recordId: string) =>
    `/jobs/${id}/stuffing-records/${recordId}`,

  documents: (id: string) => `/jobs/${id}/documents`,
  document: (id: string, documentId: string) => `/jobs/${id}/documents/${documentId}`,
  finalizeDocument: (id: string, documentId: string) =>
    `/jobs/${id}/documents/${documentId}/finalize`,
  documentGenerationStatus: (id: string) => `/jobs/${id}/documents/generation-status`,

  generateHawb: (id: string) => `/jobs/${id}/documents/hawb`,
  generateMawb: (id: string) => `/jobs/${id}/documents/mawb`,
  generateHbl: (id: string) => `/jobs/${id}/documents/hbl`,
  generateHblExpressRelease: (id: string) => `/jobs/${id}/documents/hbl-express-release`,
  generateMbl: (id: string) => `/jobs/${id}/documents/mbl`,
  generateFiataBl: (id: string) => `/jobs/${id}/documents/fiata-bl`,
  generateRiderBl: (id: string) => `/jobs/${id}/documents/rider-bl`,
  generateSwitchBl: (id: string) => `/jobs/${id}/documents/switch-bl`,
  generateProxyBl: (id: string) => `/jobs/${id}/documents/proxy-bl`,
  generateBackToBackBl: (id: string) => `/jobs/${id}/documents/back-to-back-bl`,
  generateSurrenderNotice: (id: string) => `/jobs/${id}/documents/surrender-notice`,
  generateSi: (id: string) => `/jobs/${id}/documents/si`,
  generateStuffingReport: (id: string) => `/jobs/${id}/documents/stuffing-report`,
  generateSailingConfirmation: (id: string) => `/jobs/${id}/documents/sailing-confirmation`,
  generateTranshipmentConfirmation: (id: string) =>
    `/jobs/${id}/documents/transhipment-confirmation`,
  generateCargoManifest: (id: string) => `/jobs/${id}/documents/cargo-manifest`,
  generateFreightManifest: (id: string) => `/jobs/${id}/documents/freight-manifest`,
  generatePreAlertDoc: (id: string) => `/jobs/${id}/documents/pre-alert`,
  generateJobCard: (id: string) => `/jobs/${id}/documents/job-card`,
  generateJobPnl: (id: string) => `/jobs/${id}/documents/job-pnl`,
  generateProformaInvoice: (id: string) => `/jobs/${id}/documents/proforma-invoice`,

  sendPreAlert: (id: string) => `/jobs/${id}/pre-alert/send`,
} as const;

export const QUOTATION_CONVERT_TO_JOB = (quotationId: string) =>
  `/quotations/${quotationId}/convert-to-job`;
