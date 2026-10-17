/** Jobs REST paths — Swagger tag Jobs (Bearer JWT). */
export const JOB_API = {
  list: '/jobs',
  dashboardCounts: '/jobs/dashboard-counts',
  teamWorkload: '/jobs/team-workload',
  /** Catalog (Approved / Open / Closed labels); optional ?job_id= */
  statusOptions: '/jobs/status-options',
  /** Name dropdowns for department / GPUM (no UUIDs in UI). */
  lookupsDropdowns: '/jobs/lookups/dropdowns',
  byBarcode: (code: string) => `/jobs/by-barcode/${encodeURIComponent(code)}`,
  scan: '/jobs/scan',
  byId: (id: string) => `/jobs/${id}`,
  /** Fresa header + tabs + actions */
  detail: (id: string) => `/jobs/${id}/detail`,
  detailTab: (id: string, tab: string) =>
    `/jobs/${id}/detail/${encodeURIComponent(tab)}`,
  changeStatus: (id: string) => `/jobs/${id}/change-status`,
  reopen: (id: string) => `/jobs/${id}/reopen`,
  stop: (id: string) => `/jobs/${id}/stop`,
  cancel: (id: string) => `/jobs/${id}/cancel`,
  close: (id: string) => `/jobs/${id}/close`,
  closeChecklist: (id: string) => `/jobs/${id}/close-checklist`,
  copy: (id: string) => `/jobs/${id}/copy`,
  organizationClientReference: (id: string) =>
    `/jobs/${id}/organization/client-reference`,
  dimensions: (id: string) => `/jobs/${id}/dimensions`,
  /** PATCH /jobs/:id/department — Department tab */
  department: (id: string) => `/jobs/${id}/department`,
  /** POST /jobs/:id/exchange-rates — Ex Rate tab */
  exchangeRates: (id: string) => `/jobs/${id}/exchange-rates`,
  exchangeRate: (id: string, rateId: string) =>
    `/jobs/${id}/exchange-rates/${encodeURIComponent(rateId)}`,
  /** GET/POST routing legs — Routing tab */
  routingLegs: (id: string) => `/jobs/${id}/routing-legs`,
  routingLeg: (id: string, legId: string) =>
    `/jobs/${id}/routing-legs/${encodeURIComponent(legId)}`,
  /** Customs / shipping bill tabs */
  customsRefs: (id: string) => `/jobs/${id}/customs-refs`,
  customsRef: (id: string, refId: string) =>
    `/jobs/${id}/customs-refs/${encodeURIComponent(refId)}`,
  gpum: (id: string) => `/jobs/${id}/gpum`,
  storageChargesCalculate: (id: string) =>
    `/jobs/${id}/containers/storage-charges/calculate`,
  storageChargesConfirm: (id: string) =>
    `/jobs/${id}/containers/storage-charges/confirm-to-costing`,
  chargeAttachments: (id: string, chargeId: string) =>
    `/jobs/${id}/charges/${chargeId}/attachments`,
  /** POST /jobs/:id/charges/composite — sale+cost pair */
  chargesComposite: (id: string) => `/jobs/${id}/charges/composite`,
  /** PATCH /jobs/:id/charges/:chargeId/sale */
  chargeSale: (id: string, chargeId: string) =>
    `/jobs/${id}/charges/${encodeURIComponent(chargeId)}/sale`,
  /** PATCH /jobs/:id/charges/:chargeId/cost */
  chargeCost: (id: string, chargeId: string) =>
    `/jobs/${id}/charges/${encodeURIComponent(chargeId)}/cost`,
  /** GET /jobs/:id/charges/history */
  chargesHistory: (id: string) => `/jobs/${id}/charges/history`,
  /** GET /jobs/:id/charges/:chargeId/history */
  chargeHistory: (id: string, chargeId: string) =>
    `/jobs/${id}/charges/${encodeURIComponent(chargeId)}/history`,
  /** POST /jobs/:id/invoices/sale · /purchase */
  invoicesSale: (id: string) => `/jobs/${id}/invoices/sale`,
  invoicesPurchase: (id: string) => `/jobs/${id}/invoices/purchase`,
  /** GET/POST /jobs/:id/invoices/purchase/bulk — Fresa bulk PI preview + generate */
  invoicesPurchaseBulk: (id: string) => `/jobs/${id}/invoices/purchase/bulk`,
  /** GET /jobs/:id/edi/types · POST generate · GET submissions · GET download (PDF stream) */
  ediTypes: (id: string) => `/jobs/${id}/edi/types`,
  ediGenerate: (id: string) => `/jobs/${id}/edi/generate`,
  ediSubmissions: (id: string) => `/jobs/${id}/edi/submissions`,
  /** Bearer PDF attachment — not an S3 URL. */
  ediSubmissionDownload: (id: string, submissionId: string) =>
    `/jobs/${id}/edi/submissions/${encodeURIComponent(submissionId)}/download`,
  /** GET /jobs/:id/pnl/custom-duty */
  pnlCustomDuty: (id: string) => `/jobs/${id}/pnl/custom-duty`,
  /** POST /jobs/:id/documents/job-pnl-custom-duty */
  generateJobPnlCustomDuty: (id: string) =>
    `/jobs/${id}/documents/job-pnl-custom-duty`,
  /** POST /jobs/:id/routing-legs/push-to-subjobs */
  routingLegsPushToSubjobs: (id: string) =>
    `/jobs/${id}/routing-legs/push-to-subjobs`,
  /** POST /jobs/:id/containers/push-to-sub-jobs */
  containersPushToSubJobs: (id: string) =>
    `/jobs/${id}/containers/push-to-sub-jobs`,
  /** GET/PUT /jobs/:id/references · PUT .../references/:type */
  references: (id: string) => `/jobs/${id}/references`,
  referenceByType: (id: string, type: string) =>
    `/jobs/${id}/references/${encodeURIComponent(type)}`,
  /** GET /jobs/:id/email-recipients/suggest */
  emailRecipientsSuggest: (id: string) =>
    `/jobs/${id}/email-recipients/suggest`,
  /** PATCH /jobs/:id/closed-overrides */
  closedOverrides: (id: string) => `/jobs/${id}/closed-overrides`,
  shipments: (id: string) => `/jobs/${id}/shipments`,
  shipmentsAttach: (id: string) => `/jobs/${id}/shipments/attach`,
  getCharges: (id: string) => `/jobs/${id}/get-charges`,
  /** POST /jobs/:id/get-job-charges — Fresa Get Job Charges from shipment */
  getJobChargesFromShipment: (id: string) => `/jobs/${id}/get-job-charges`,
  copyCharges: (id: string) => `/jobs/${id}/copy-charges`,
  profitSharePreview: (id: string) => `/jobs/${id}/profit-share/preview`,
  profitShareAdd: (id: string) => `/jobs/${id}/profit-share/add`,
  /** GET /jobs/:id/profit-share/calculator — weights + pieces for Profit Share modal */
  profitShareCalculator: (id: string) => `/jobs/${id}/profit-share/calculator`,
  /** GET /jobs/:id/profit-share/accounts?search= — postable COA for profit_share_account_id */
  profitShareAccounts: (id: string) => `/jobs/${id}/profit-share/accounts`,
  prorateToShipments: (id: string) => `/jobs/${id}/prorate-to-shipments`,
  cancelProrate: (id: string) => `/jobs/${id}/cancel-prorate`,
  /** GET /jobs/:id/vouchers · POST /jobs/:id/vouchers/generate */
  vouchers: (id: string) => `/jobs/${id}/vouchers`,
  vouchersGenerate: (id: string) => `/jobs/${id}/vouchers/generate`,
  houseJobs: (id: string) => `/jobs/${id}/house-jobs`,
  subJobs: (id: string) => `/jobs/${id}/sub-jobs`,
  prorateCost: (id: string, chargeCodeId: string) =>
    `/jobs/${id}/prorate-cost/${chargeCodeId}`,

  airDetails: (id: string) => `/jobs/${id}/air-details`,
  airBookingForm: (id: string) => `/jobs/${id}/air-booking-form`,
  airCsTriage: (id: string) => `/jobs/${id}/air/cs-triage`,
  airMarkQuoteSent: (id: string) => `/jobs/${id}/air/mark-quote-sent`,
  airSendInvoice: (id: string) => `/jobs/${id}/air/send-invoice`,
  /** @deprecated Air pallet / ULD APIs removed from backend — do not call. */
  airUldRequests: (id: string) => `/jobs/${id}/air/uld-requests`,
  /** @deprecated */
  airIssueUldRequest: (id: string, requestId: string) =>
    `/jobs/${id}/air/uld-requests/${requestId}/issue`,
  /** @deprecated */
  airAllocateUldRequest: (id: string, requestId: string) =>
    `/jobs/${id}/air/uld-requests/${requestId}/allocate`,
  airStageBuildUp: (id: string) => `/jobs/${id}/air/stage/build-up`,
  airStageMawbReceived: (id: string) => `/jobs/${id}/air/stage/mawb-received`,
  airStageMawbIssued: (id: string) => `/jobs/${id}/air/stage/mawb-issued`,
  airStagePod: (id: string) => `/jobs/${id}/air/stage/pod`,
  airConfirmPayment: (id: string) => `/jobs/${id}/air/accounts/confirm-payment`,
  airCloseReport: (id: string) => `/jobs/${id}/air/close-report`,
  seaFclDetails: (id: string) => `/jobs/${id}/sea-fcl-details`,
  seaLclDetails: (id: string) => `/jobs/${id}/sea-lcl-details`,
  seaFclBookingForm: (id: string) => `/jobs/${id}/sea-fcl/booking-form`,
  seaFclBookingFormComplete: (id: string) => `/jobs/${id}/sea-fcl/booking-form/complete`,
  seaLclBookingForm: (id: string) => `/jobs/${id}/sea-lcl/booking-form`,
  seaLclBookingFormComplete: (id: string) => `/jobs/${id}/sea-lcl/booking-form/complete`,
  /** POST multipart — mode: sea-fcl|sea-lcl|land|road-freight|courier|customs-clearance|warehouse */
  bookingFormDocument: (id: string, mode: string, kind: string) =>
    `/jobs/${encodeURIComponent(id)}/${encodeURIComponent(mode)}/booking-form/documents/${encodeURIComponent(kind)}`,
  submitSi: (id: string) => `/jobs/${id}/sea-fcl-details/si-submission`,
  submitLclSi: (id: string) => `/jobs/${id}/sea-lcl-details/si-submission`,
  submitVgm: (id: string) => `/jobs/${id}/sea-fcl-details/vgm-submission`,
  cutoffs: (id: string) => `/jobs/${id}/cutoffs`,
  customsStatus: (id: string) => `/jobs/${id}/customs-status`,
  cfsStorageCalculate: (id: string) => `/jobs/${id}/cfs-storage/calculate`,
  storageCalculation: (id: string) => `/jobs/${id}/storage-calculation`,
  storageInvoice: (id: string) => `/jobs/${id}/storage-invoice`,
  customsExaminations: (id: string) => `/jobs/${id}/customs-examinations`,
  airTranshipmentLink: (id: string) => `/jobs/${id}/air-transhipment-link`,
  importNoticeCanSend: (id: string) => `/jobs/${id}/import-notices/can/send`,
  importNoticeDoSend: (id: string) => `/jobs/${id}/import-notices/do/send`,
  transhipmentLink: (id: string) => `/jobs/${id}/transhipment-link`,

  courierDetails: (id: string) => `/jobs/${id}/courier-details`,
  courierCheckpoints: (id: string) => `/jobs/${id}/courier/checkpoints`,
  courierConfirmBooking: (id: string) => `/jobs/${id}/courier/confirm-booking`,
  courierLinkExport: (id: string) => `/jobs/${id}/courier/link-export`,
  courierLinkImport: (id: string) => `/jobs/${id}/courier/link-import`,
  courierPod: (id: string) => `/jobs/${id}/courier/pod`,
  courierScanCheckpoint: (id: string) => `/jobs/${id}/courier/scan-checkpoint`,
  courierBookingForm: (id: string) => `/jobs/${id}/courier/booking-form`,
  courierBookingFormComplete: (id: string) => `/jobs/${id}/courier/booking-form/complete`,

  landDetails: (id: string) => `/jobs/${id}/land-details`,
  landAssignTrucker: (id: string) => `/jobs/${id}/land/assign-trucker`,
  landBorderCrossing: (id: string) => `/jobs/${id}/land/border-crossing`,
  landCrossBorder: (id: string) => `/jobs/${id}/land/cross-border`,
  landPickup: (id: string) => `/jobs/${id}/land/pickup`,
  landPod: (id: string) => `/jobs/${id}/land/pod`,
  landBookingForm: (id: string) => `/jobs/${id}/land/booking-form`,
  landBookingFormComplete: (id: string) => `/jobs/${id}/land/booking-form/complete`,

  roadFreightDetails: (id: string) => `/jobs/${id}/road-freight-details`,
  roadFreightAssignTrucker: (id: string) => `/jobs/${id}/road-freight/assign-trucker`,
  roadFreightPickup: (id: string) => `/jobs/${id}/road-freight/pickup`,
  roadFreightBorderCrossing: (id: string) => `/jobs/${id}/road-freight/border-crossing`,
  roadFreightCrossBorder: (id: string) => `/jobs/${id}/road-freight/cross-border`,
  roadFreightPod: (id: string) => `/jobs/${id}/road-freight/pod`,
  roadFreightBookingForm: (id: string) => `/jobs/${id}/road-freight/booking-form`,
  roadFreightBookingFormComplete: (id: string) =>
    `/jobs/${id}/road-freight/booking-form/complete`,

  warehouseBookingForm: (id: string) => `/jobs/${id}/warehouse/booking-form`,
  warehouseBookingFormComplete: (id: string) =>
    `/jobs/${id}/warehouse/booking-form/complete`,

  customsClearanceBookingForm: (id: string) =>
    `/jobs/${id}/customs-clearance/booking-form`,
  customsClearanceBookingFormComplete: (id: string) =>
    `/jobs/${id}/customs-clearance/booking-form/complete`,

  lclConsolidation: (id: string) => `/jobs/${id}/lcl-consolidation`,
  lclAttachHouse: (id: string) => `/jobs/${id}/lcl/attach-house`,
  lclDetachHouse: (id: string, houseJobId: string) =>
    `/jobs/${id}/lcl/detach-house/${houseJobId}`,
  lclCfsStorageCalculate: (id: string) => `/jobs/${id}/lcl/cfs-storage/calculate`,
  lclCfsStorageInvoice: (id: string) => `/jobs/${id}/lcl/cfs-storage-invoice`,
  lclTranshipmentLink: (id: string) => `/jobs/${id}/lcl/transhipment-link`,
  lclWmsStorageLink: (id: string) => `/jobs/${id}/lcl/wms-storage-link`,
  lclMilestoneCargoReceivedAtCfs: (id: string) =>
    `/jobs/${id}/lcl/milestones/cargo-received-at-cfs`,
  lclMilestoneCfsDevanningCompleted: (id: string) =>
    `/jobs/${id}/lcl/milestones/cfs-devanning-completed`,
  lclMilestoneCfsStuffingCompleted: (id: string) =>
    `/jobs/${id}/lcl/milestones/cfs-stuffing-completed`,
  lclMilestoneConsolidationStarted: (id: string) =>
    `/jobs/${id}/lcl/milestones/consolidation-started`,

  transportRequests: (id: string) => `/jobs/${id}/transport-requests`,

  containers: (id: string) => `/jobs/${id}/containers`,
  container: (id: string, containerId: string) => `/jobs/${id}/containers/${containerId}`,
  containersBulk: (id: string) => `/jobs/${id}/containers/bulk`,
  containersExport: (id: string) => `/jobs/${id}/containers/export`,
  containersJobDetails: (id: string) => `/jobs/${id}/containers/job-details`,
  containersSyncFromSubJobs: (id: string) => `/jobs/${id}/containers/sync-from-sub-jobs`,
  containersUpload: (id: string) => `/jobs/${id}/containers/upload`,
  containersUploadSample: (id: string) => `/jobs/${id}/containers/upload-sample`,
  containersUploadConfirm: (id: string) => `/jobs/${id}/containers/upload/confirm`,
  containersUploadPaste: (id: string) => `/jobs/${id}/containers/upload/paste`,
  containersFill: (id: string) => `/jobs/${id}/containers/fill`,
  containerFill: (id: string, containerId: string) =>
    `/jobs/${id}/containers/${containerId}/fill`,
  assignCargo: (id: string, containerId: string) =>
    `/jobs/${id}/containers/${containerId}/cargo`,
  splitContainer: (id: string, containerId: string) =>
    `/jobs/${id}/containers/${containerId}/split`,
  returnContainer: (id: string, containerId: string) =>
    `/jobs/${id}/containers/${containerId}/return`,

  dimensionLine: (id: string, lineId: string) => `/jobs/${id}/dimensions/${lineId}`,
  dimensionsBulk: (id: string) => `/jobs/${id}/dimensions/bulk`,
  dimensionsExport: (id: string) => `/jobs/${id}/dimensions/export`,
  dimensionsSyncToCargo: (id: string) => `/jobs/${id}/dimensions/sync-to-cargo`,
  dimensionsUpload: (id: string) => `/jobs/${id}/dimensions/upload`,
  dimensionsUploadSample: (id: string) => `/jobs/${id}/dimensions/upload-sample`,
  dimensionsUploadConfirm: (id: string) => `/jobs/${id}/dimensions/upload/confirm`,
  dimensionsUploadPaste: (id: string) => `/jobs/${id}/dimensions/upload/paste`,

  organizations: (id: string) => `/jobs/${id}/organizations`,
  organizationByType: (id: string, orgType: string) =>
    `/jobs/${id}/organizations/${encodeURIComponent(orgType)}`,
  organizationsCopyFrom: (id: string) => `/jobs/${id}/organizations/copy-from`,
  organizationsRefreshSnapshots: (id: string) =>
    `/jobs/${id}/organizations/refresh-snapshots`,

  cargo: (id: string) => `/jobs/${id}/cargo`,
  cargoItem: (id: string, cargoId: string) => `/jobs/${id}/cargo/${cargoId}`,

  billsOfLading: (id: string) => `/jobs/${id}/bills-of-lading`,
  billOfLading: (id: string, blId: string) => `/jobs/${id}/bills-of-lading/${blId}`,

  charges: (id: string) => `/jobs/${id}/charges`,
  charge: (id: string, chargeId: string) => `/jobs/${id}/charges/${chargeId}`,
  pnl: (id: string) => `/jobs/${id}/pnl`,

  deposits: (id: string) => `/jobs/${id}/deposits`,
  deposit: (id: string, depositId: string) => `/jobs/${id}/deposits/${depositId}`,

  freeDays: (id: string) => `/jobs/${id}/free-days`,
  freeDaysRecalculate: (id: string) => `/jobs/${id}/free-days/recalculate`,

  damageReports: (id: string) => `/jobs/${id}/damage-reports`,

  partDeliveries: (id: string) => `/jobs/${id}/part-deliveries`,
  pods: (id: string) => `/jobs/${id}/pods`,

  paymentRequests: (id: string) => `/jobs/${id}/payment-requests`,

  passToVendor: (id: string) => `/jobs/${id}/pass-to-vendor`,
  sendToVendor: (id: string) => `/jobs/${id}/send-to-vendor`,
  /** Live OpenAPI prefers job-offers; vendor-quotes kept as alternate in vendor-job-offers service. */
  jobOffersList: '/jobs/job-offers',
  vendorOffers: (id: string) => `/jobs/${id}/job-offers`,
  approveVendorOffer: (_id: string, offerId: string) => `/job-offers/${offerId}/approve`,
  disapproveVendorOffer: (_id: string, offerId: string) => `/job-offers/${offerId}/disapprove`,

  milestones: (id: string) => `/jobs/${id}/milestones`,
  milestone: (id: string, milestoneId: string) => `/jobs/${id}/milestones/${milestoneId}`,

  notes: (id: string) => `/jobs/${id}/notes`,
  note: (id: string, noteId: string) => `/jobs/${id}/notes/${noteId}`,

  stuffingRecords: (id: string) => `/jobs/${id}/stuffing-records`,
  stuffingRecord: (id: string, recordId: string) =>
    `/jobs/${id}/stuffing-records/${recordId}`,

  documents: (id: string) => `/jobs/${id}/documents`,
  /** POST multipart — typed job document upload (returns file_url / s3_key). */
  documentTypeUpload: (id: string, documentType: string) =>
    `/jobs/${id}/documents/${encodeURIComponent(documentType)}/upload`,
  document: (id: string, documentId: string) => `/jobs/${id}/documents/${documentId}`,
  finalizeDocument: (id: string, documentId: string) =>
    `/jobs/${id}/documents/${documentId}/finalize`,
  documentGenerationStatus: (id: string) => `/jobs/${id}/documents/generation-status`,

  generateHawb: (id: string) => `/jobs/${id}/documents/hawb`,
  generateMawb: (id: string) => `/jobs/${id}/documents/mawb`,
  generateHawbDraftGated: (id: string) => `/jobs/${id}/documents/hawb-draft-gated`,
  generateHawbFinalGated: (id: string) => `/jobs/${id}/documents/hawb-final-gated`,
  generatePreCanGated: (id: string) => `/jobs/${id}/documents/pre-can-gated`,
  generateCanGated: (id: string) => `/jobs/${id}/documents/can-gated`,
  generateDeliveryOrderGated: (id: string) => `/jobs/${id}/documents/delivery-order-gated`,
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
  generateCourierReport: (id: string) => `/jobs/${id}/documents/courier-report`,
  generateSailingConfirmation: (id: string) => `/jobs/${id}/documents/sailing-confirmation`,
  generateTranshipmentConfirmation: (id: string) =>
    `/jobs/${id}/documents/transhipment-confirmation`,
  generateCargoManifest: (id: string) => `/jobs/${id}/documents/cargo-manifest`,
  generateFreightManifest: (id: string) => `/jobs/${id}/documents/freight-manifest`,
  generatePreAlertDoc: (id: string) => `/jobs/${id}/documents/pre-alert`,
  generateJobCard: (id: string) => `/jobs/${id}/documents/job-card`,
  generateBookingConfirmation: (id: string) => `/jobs/${id}/documents/booking-confirmation`,
  generateJobPnl: (id: string) => `/jobs/${id}/documents/job-pnl`,
  generateProformaInvoice: (id: string) => `/jobs/${id}/documents/proforma-invoice`,
  generateDeliveryOrder: (id: string) => `/jobs/${id}/documents/delivery-order`,
  generatePreCan: (id: string) => `/jobs/${id}/documents/pre-can`,
  generateCan: (id: string) => `/jobs/${id}/documents/can`,
  generateExchangeLetter: (id: string) => `/jobs/${id}/documents/exchange-letter`,
  generateUndertakeLetter: (id: string) => `/jobs/${id}/documents/undertake-letter`,
  generateTransportRequest: (id: string) => `/jobs/${id}/documents/transport-request`,
  generateCrossBorderDeclaration: (id: string) =>
    `/jobs/${id}/documents/cross-border-declaration`,
  generateCustomsTransit: (id: string) => `/jobs/${id}/documents/customs-transit`,
  generateDeliveryNote: (id: string) => `/jobs/${id}/documents/delivery-note`,
  seaScans: (id: string) => `/jobs/${id}/sea-scans`,
  airComplianceForm: (id: string) => `/jobs/${id}/air/compliance-form`,
  generateShippingAdvice: (id: string) => `/jobs/${id}/documents/shipping-advice`,
  generateProofOfDelivery: (id: string) => `/jobs/${id}/documents/proof-of-delivery`,
  generateEAwb: (id: string) => `/jobs/${id}/documents/e-awb`,
  generateBarcodeLabel: (id: string) => `/jobs/${id}/documents/barcode-label`,
  generateConsigneeLabel: (id: string) => `/jobs/${id}/documents/consignee-label`,
  generateJobCosting: (id: string) => `/jobs/${id}/documents/job-costing`,
  generateFreightCertificate: (id: string) => `/jobs/${id}/documents/freight-certificate`,

  sendPreAlert: (id: string) => `/jobs/${id}/pre-alert/send`,
  schedulePreAlert: (id: string) => `/jobs/${id}/pre-alert/schedule`,
  whatsappStatus: (id: string) => `/jobs/${id}/whatsapp/status`,
} as const;

/**
 * Known job detail/{tab} keys (docs reference).
 * Tab strip on the FE uses only GET /jobs/:id/detail `tabs` — this list is not a fallback.
 * (GPUM is separate GET/PUT — not a detail tab; lives under Actions.)
 */
export const JOB_DETAIL_TABS = [
  'show_all',
  'info',
  'organization',
  'dimensions',
  'planned_container',
  'actual_container',
  'costing',
  'history',
  'shipments',
  'department',
  'ex_rate',
  'routing',
  'customs',
  'shipping_bill_boe',
  'booking_form',
] as const;

export type JobDetailTabKey = (typeof JOB_DETAIL_TABS)[number];
