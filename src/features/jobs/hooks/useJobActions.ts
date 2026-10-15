import { useMutation, useQueryClient } from '@tanstack/react-query';
import { jobService } from '../services/job.service';
import type {
  ChangeJobStatusDto,
  CreateJobChargeAttachmentDto,
  CreateJobChargeDto,
  CreateJobChargesCompositeDto,
  CreateJobInvoiceFromCostingDto,
  CreateJobNoteDto,
  CreateCustomMilestoneDto,
  CalculateStorageChargesDto,
  ConfirmStorageChargesDto,
  CopyJobChargesDto,
  GenerateJobDocumentDto,
  GenerateJobVoucherDto,
  GetJobChargesDto,
  GetJobChargesFromShipmentDto,
  PatchJobChargeSideDto,
  PatchJobClosedOverridesDto,
  PatchJobDimensionsDto,
  ProfitShareAddDto,
  ProfitSharePreviewDto,
  ProrateToShipmentsDto,
  UpsertJobReferencesDto,
  PutJobGpumDto,
  ReopenJobDto,
  SchedulePreAlertDto,
  SendPreAlertDto,
  SendWhatsAppStatusDto,
  StopJobDto,
  UpdateJobChargeDto,
  UpdateJobMilestoneDto,
  UpdateJobNoteDto,
  UpsertJobPartyReferenceDto,
} from '../types/job.types';
import { jobKeys, useInvalidateJobs } from './useJobs';

/** Detail-page lifecycle actions for a single job. */
export function useJobActions(jobId: string) {
  const invalidate = useInvalidateJobs();
  const queryClient = useQueryClient();
  const id = jobId;

  const cancel = useMutation({
    mutationFn: () => jobService.cancel(id),
    onSuccess: () => invalidate(id),
  });
  const close = useMutation({
    mutationFn: (body?: { force?: boolean }) => jobService.close(id, body),
    onSuccess: () => invalidate(id),
  });
  const changeStatus = useMutation({
    mutationFn: (dto: ChangeJobStatusDto) => jobService.changeStatus(id, dto),
    onSuccess: () => invalidate(id),
  });
  const reopen = useMutation({
    mutationFn: (dto?: ReopenJobDto) => jobService.reopen(id, dto ?? {}),
    onSuccess: () => invalidate(id),
  });
  const stop = useMutation({
    mutationFn: (dto?: StopJobDto) => jobService.stop(id, dto ?? {}),
    onSuccess: () => invalidate(id),
  });
  const upsertClientReference = useMutation({
    mutationFn: (dto: UpsertJobPartyReferenceDto) =>
      jobService.upsertClientReference(id, dto),
    onSuccess: () => invalidate(id),
  });
  const patchDimensions = useMutation({
    mutationFn: (dto: PatchJobDimensionsDto) => jobService.patchDimensions(id, dto),
    onSuccess: () => invalidate(id),
  });
  const putGpum = useMutation({
    mutationFn: (dto: PutJobGpumDto) => jobService.putGpum(id, dto),
    onSuccess: () => invalidate(id),
  });
  const calculateStorageCharges = useMutation({
    mutationFn: (dto: CalculateStorageChargesDto) =>
      jobService.calculateStorageCharges(id, dto),
    onSuccess: () => invalidate(id),
  });
  const confirmStorageCharges = useMutation({
    mutationFn: (dto: ConfirmStorageChargesDto) =>
      jobService.confirmStorageCharges(id, dto),
    onSuccess: () => invalidate(id),
  });
  const createChargeAttachment = useMutation({
    mutationFn: ({
      chargeId,
      dto,
    }: {
      chargeId: string;
      dto: CreateJobChargeAttachmentDto;
    }) => jobService.createChargeAttachment(id, chargeId, dto),
    onSuccess: () => invalidate(id),
  });
  const remove = useMutation({
    mutationFn: () => jobService.softDelete(id),
    onSuccess: () => invalidate(id),
  });
  const copy = useMutation({
    mutationFn: (body?: Record<string, unknown>) =>
      jobService.copyJob(id, body ?? {}),
    onSuccess: () => invalidate(),
  });
  const prorateCost = useMutation({
    mutationFn: (chargeCodeId: string) => jobService.prorateCost(id, chargeCodeId),
    onSuccess: () => invalidate(id),
  });
  const invalidateCharges = () => {
    invalidate(id);
    void queryClient.invalidateQueries({ queryKey: jobKeys.jobCharges(id) });
  };
  const pullJobCharges = useMutation({
    mutationFn: (dto: GetJobChargesDto = {}) => jobService.pullJobCharges(id, dto),
    onSuccess: invalidateCharges,
  });
  const getJobChargesFromShipment = useMutation({
    mutationFn: (dto: GetJobChargesFromShipmentDto) =>
      jobService.getJobChargesFromShipment(id, dto),
    onSuccess: invalidateCharges,
  });
  const copyJobCharges = useMutation({
    mutationFn: (dto: CopyJobChargesDto) => jobService.copyJobCharges(id, dto),
    onSuccess: invalidateCharges,
  });
  const profitSharePreview = useMutation({
    mutationFn: (dto: ProfitSharePreviewDto) => jobService.profitSharePreview(id, dto),
  });
  const profitShareAdd = useMutation({
    mutationFn: (dto: ProfitShareAddDto) => jobService.profitShareAdd(id, dto),
    onSuccess: invalidateCharges,
  });
  const prorateToShipments = useMutation({
    mutationFn: (dto: ProrateToShipmentsDto = {}) =>
      jobService.prorateToShipments(id, dto),
    onSuccess: invalidateCharges,
  });
  const cancelProrateToShipments = useMutation({
    mutationFn: (body: Record<string, unknown> = {}) =>
      jobService.cancelProrateToShipments(id, body),
    onSuccess: invalidateCharges,
  });
  const createChargesComposite = useMutation({
    mutationFn: (dto: CreateJobChargesCompositeDto) =>
      jobService.createChargesComposite(id, dto),
    onSuccess: invalidateCharges,
  });
  const updateChargeSale = useMutation({
    mutationFn: ({
      chargeId,
      dto,
    }: {
      chargeId: string;
      dto: PatchJobChargeSideDto;
    }) => jobService.updateChargeSale(id, chargeId, dto),
    onSuccess: invalidateCharges,
  });
  const updateChargeCost = useMutation({
    mutationFn: ({
      chargeId,
      dto,
    }: {
      chargeId: string;
      dto: PatchJobChargeSideDto;
    }) => jobService.updateChargeCost(id, chargeId, dto),
    onSuccess: invalidateCharges,
  });
  const createSaleInvoiceFromJob = useMutation({
    mutationFn: (dto: CreateJobInvoiceFromCostingDto = {}) =>
      jobService.createSaleInvoiceFromJob(id, dto),
    onSuccess: () => invalidate(id),
  });
  const createPurchaseInvoiceFromJob = useMutation({
    mutationFn: (dto: CreateJobInvoiceFromCostingDto = {}) =>
      jobService.createPurchaseInvoiceFromJob(id, dto),
    onSuccess: () => invalidate(id),
  });
  const pushRoutingLegsToSubjobs = useMutation({
    mutationFn: (body: Record<string, unknown> = {}) =>
      jobService.pushRoutingLegsToSubjobs(id, body),
    onSuccess: () => invalidate(id),
  });
  const pushContainersToSubJobs = useMutation({
    mutationFn: (body: Record<string, unknown> = {}) =>
      jobService.pushContainersToSubJobs(id, body),
    onSuccess: () => invalidate(id),
  });
  const syncContainersFromSubJobs = useMutation({
    mutationFn: (body?: Record<string, unknown>) =>
      jobService.syncContainersFromSubJobs(id, body),
    onSuccess: () => invalidate(id),
  });
  const putReferences = useMutation({
    mutationFn: (dto: UpsertJobReferencesDto) => jobService.putReferences(id, dto),
    onSuccess: () => invalidate(id),
  });
  const putReferenceByType = useMutation({
    mutationFn: ({ type, dto }: { type: string; dto: Record<string, unknown> }) =>
      jobService.putReferenceByType(id, type, dto),
    onSuccess: () => invalidate(id),
  });
  const patchClosedOverrides = useMutation({
    mutationFn: (dto: PatchJobClosedOverridesDto) =>
      jobService.patchClosedOverrides(id, dto),
    onSuccess: () => invalidate(id),
  });
  const generateJobPnlCustomDuty = useMutation({
    mutationFn: (dto?: GenerateJobDocumentDto) =>
      jobService.generateJobPnlCustomDuty(id, dto),
    onSuccess: () => invalidate(id),
  });
  const sendPreAlert = useMutation({
    mutationFn: (dto: SendPreAlertDto) => jobService.sendPreAlert(id, dto),
    onSuccess: () => invalidate(id),
  });
  const schedulePreAlert = useMutation({
    mutationFn: (dto: SchedulePreAlertDto) => jobService.schedulePreAlert(id, dto),
    onSuccess: () => invalidate(id),
  });
  const sendWhatsAppStatus = useMutation({
    mutationFn: (dto: SendWhatsAppStatusDto) => jobService.sendWhatsAppStatus(id, dto),
    onSuccess: () => invalidate(id),
  });
  const generateVoucher = useMutation({
    mutationFn: (dto: GenerateJobVoucherDto) => jobService.generateJobVoucher(id, dto),
    onSuccess: () => {
      invalidate(id);
      void queryClient.invalidateQueries({ queryKey: jobKeys.jobVouchers(id) });
    },
  });

  const generateHawb = useMutation({
    mutationFn: (dto?: GenerateJobDocumentDto) => jobService.generateHawb(id, dto),
    onSuccess: () => invalidate(id),
  });
  const generateMawb = useMutation({
    mutationFn: (dto?: GenerateJobDocumentDto) => jobService.generateMawb(id, dto),
    onSuccess: () => invalidate(id),
  });
  const generateHawbDraftGated = useMutation({
    mutationFn: (dto?: GenerateJobDocumentDto) => jobService.generateHawbDraftGated(id, dto),
    onSuccess: () => invalidate(id),
  });
  const generateHawbFinalGated = useMutation({
    mutationFn: (dto?: GenerateJobDocumentDto) => jobService.generateHawbFinalGated(id, dto),
    onSuccess: () => invalidate(id),
  });
  const generatePreCanGated = useMutation({
    mutationFn: (dto?: GenerateJobDocumentDto) => jobService.generatePreCanGated(id, dto),
    onSuccess: () => invalidate(id),
  });
  const generateCanGated = useMutation({
    mutationFn: (dto?: GenerateJobDocumentDto) => jobService.generateCanGated(id, dto),
    onSuccess: () => invalidate(id),
  });
  const generateDeliveryOrderGated = useMutation({
    mutationFn: (dto?: GenerateJobDocumentDto) =>
      jobService.generateDeliveryOrderGated(id, dto),
    onSuccess: () => invalidate(id),
  });
  const generateHbl = useMutation({
    mutationFn: (dto?: GenerateJobDocumentDto) => jobService.generateHbl(id, dto),
    onSuccess: () => invalidate(id),
  });
  const generateHblExpressRelease = useMutation({
    mutationFn: (dto?: GenerateJobDocumentDto) =>
      jobService.generateHblExpressRelease(id, dto),
    onSuccess: () => invalidate(id),
  });
  const generateMbl = useMutation({
    mutationFn: (dto?: GenerateJobDocumentDto) => jobService.generateMbl(id, dto),
    onSuccess: () => invalidate(id),
  });
  const generateFiataBl = useMutation({
    mutationFn: (dto?: GenerateJobDocumentDto) => jobService.generateFiataBl(id, dto),
    onSuccess: () => invalidate(id),
  });
  const generateRiderBl = useMutation({
    mutationFn: (dto?: GenerateJobDocumentDto) => jobService.generateRiderBl(id, dto),
    onSuccess: () => invalidate(id),
  });
  const generateSwitchBl = useMutation({
    mutationFn: (dto?: GenerateJobDocumentDto) => jobService.generateSwitchBl(id, dto),
    onSuccess: () => invalidate(id),
  });
  const generateProxyBl = useMutation({
    mutationFn: (dto?: GenerateJobDocumentDto) => jobService.generateProxyBl(id, dto),
    onSuccess: () => invalidate(id),
  });
  const generateBackToBackBl = useMutation({
    mutationFn: (dto?: GenerateJobDocumentDto) =>
      jobService.generateBackToBackBl(id, dto),
    onSuccess: () => invalidate(id),
  });
  const generateSurrenderNotice = useMutation({
    mutationFn: (dto?: GenerateJobDocumentDto) =>
      jobService.generateSurrenderNotice(id, dto),
    onSuccess: () => invalidate(id),
  });
  const generateSi = useMutation({
    mutationFn: (dto?: GenerateJobDocumentDto) => jobService.generateSi(id, dto),
    onSuccess: () => invalidate(id),
  });
  const generateStuffingReport = useMutation({
    mutationFn: (dto?: GenerateJobDocumentDto) =>
      jobService.generateStuffingReport(id, dto),
    onSuccess: () => invalidate(id),
  });
  const generateCourierReport = useMutation({
    mutationFn: (dto?: GenerateJobDocumentDto) =>
      jobService.generateCourierReport(id, dto),
    onSuccess: () => invalidate(id),
  });
  const generateSailingConfirmation = useMutation({
    mutationFn: (dto?: GenerateJobDocumentDto) =>
      jobService.generateSailingConfirmation(id, dto),
    onSuccess: () => invalidate(id),
  });
  const generateTranshipmentConfirmation = useMutation({
    mutationFn: (dto?: GenerateJobDocumentDto) =>
      jobService.generateTranshipmentConfirmation(id, dto),
    onSuccess: () => invalidate(id),
  });
  const generateCargoManifest = useMutation({
    mutationFn: (dto?: GenerateJobDocumentDto) =>
      jobService.generateCargoManifest(id, dto),
    onSuccess: () => invalidate(id),
  });
  const generateFreightManifest = useMutation({
    mutationFn: (dto?: GenerateJobDocumentDto) =>
      jobService.generateFreightManifest(id, dto),
    onSuccess: () => invalidate(id),
  });
  const generatePreAlertDoc = useMutation({
    mutationFn: (dto?: GenerateJobDocumentDto) =>
      jobService.generatePreAlertDoc(id, dto),
    onSuccess: () => invalidate(id),
  });
  const generateJobCard = useMutation({
    mutationFn: (dto?: GenerateJobDocumentDto) => jobService.generateJobCard(id, dto),
    onSuccess: () => invalidate(id),
  });
  const generateJobPnl = useMutation({
    mutationFn: (dto?: GenerateJobDocumentDto) => jobService.generateJobPnl(id, dto),
    onSuccess: () => invalidate(id),
  });
  const generateProformaInvoice = useMutation({
    mutationFn: (dto?: GenerateJobDocumentDto) =>
      jobService.generateProformaInvoice(id, dto),
    onSuccess: () => invalidate(id),
  });
  const generateDeliveryOrder = useMutation({
    mutationFn: (dto?: GenerateJobDocumentDto) =>
      jobService.generateDeliveryOrder(id, dto),
    onSuccess: () => invalidate(id),
  });
  const generatePreCan = useMutation({
    mutationFn: (dto?: GenerateJobDocumentDto) => jobService.generatePreCan(id, dto),
    onSuccess: () => invalidate(id),
  });
  const generateCan = useMutation({
    mutationFn: (dto?: GenerateJobDocumentDto) => jobService.generateCan(id, dto),
    onSuccess: () => invalidate(id),
  });
  const generateExchangeLetter = useMutation({
    mutationFn: (dto?: GenerateJobDocumentDto) =>
      jobService.generateExchangeLetter(id, dto),
    onSuccess: () => invalidate(id),
  });
  const generateUndertakeLetter = useMutation({
    mutationFn: (dto?: GenerateJobDocumentDto) =>
      jobService.generateUndertakeLetter(id, dto),
    onSuccess: () => invalidate(id),
  });
  const generateTransportRequest = useMutation({
    mutationFn: (dto?: GenerateJobDocumentDto) =>
      jobService.generateTransportRequest(id, dto),
    onSuccess: () => invalidate(id),
  });
  const generateCrossBorderDeclaration = useMutation({
    mutationFn: (dto?: GenerateJobDocumentDto) =>
      jobService.generateCrossBorderDeclaration(id, dto),
    onSuccess: () => invalidate(id),
  });
  const generateCustomsTransit = useMutation({
    mutationFn: (dto?: GenerateJobDocumentDto) => jobService.generateCustomsTransit(id, dto),
    onSuccess: () => invalidate(id),
  });
  const generateDeliveryNote = useMutation({
    mutationFn: (dto?: GenerateJobDocumentDto) => jobService.generateDeliveryNote(id, dto),
    onSuccess: () => invalidate(id),
  });
  const generateShippingAdvice = useMutation({
    mutationFn: (dto?: GenerateJobDocumentDto) =>
      jobService.generateShippingAdvice(id, dto),
    onSuccess: () => invalidate(id),
  });
  const generateProofOfDelivery = useMutation({
    mutationFn: (dto?: GenerateJobDocumentDto) =>
      jobService.generateProofOfDelivery(id, dto),
    onSuccess: () => invalidate(id),
  });
  const generateEAwb = useMutation({
    mutationFn: (dto?: GenerateJobDocumentDto) => jobService.generateEAwb(id, dto),
    onSuccess: () => invalidate(id),
  });
  const generateBarcodeLabel = useMutation({
    mutationFn: (dto?: GenerateJobDocumentDto) =>
      jobService.generateBarcodeLabel(id, dto),
    onSuccess: () => invalidate(id),
  });
  const generateConsigneeLabel = useMutation({
    mutationFn: (dto?: GenerateJobDocumentDto) =>
      jobService.generateConsigneeLabel(id, dto),
    onSuccess: () => invalidate(id),
  });
  const generateJobCosting = useMutation({
    mutationFn: (dto?: GenerateJobDocumentDto) =>
      jobService.generateJobCosting(id, dto),
    onSuccess: () => invalidate(id),
  });
  const generateFreightCertificate = useMutation({
    mutationFn: (dto?: GenerateJobDocumentDto) =>
      jobService.generateFreightCertificate(id, dto),
    onSuccess: () => invalidate(id),
  });

  return {
    cancel,
    close,
    changeStatus,
    reopen,
    stop,
    upsertClientReference,
    patchDimensions,
    putGpum,
    calculateStorageCharges,
    confirmStorageCharges,
    createChargeAttachment,
    remove,
    copy,
    prorateCost,
    pullJobCharges,
    getJobChargesFromShipment,
    copyJobCharges,
    profitSharePreview,
    profitShareAdd,
    prorateToShipments,
    cancelProrateToShipments,
    createChargesComposite,
    updateChargeSale,
    updateChargeCost,
    createSaleInvoiceFromJob,
    createPurchaseInvoiceFromJob,
    pushRoutingLegsToSubjobs,
    pushContainersToSubJobs,
    syncContainersFromSubJobs,
    putReferences,
    putReferenceByType,
    patchClosedOverrides,
    generateJobPnlCustomDuty,
    sendPreAlert,
    schedulePreAlert,
    sendWhatsAppStatus,
    generateVoucher,
    generateHawb,
    generateMawb,
    generateHawbDraftGated,
    generateHawbFinalGated,
    generatePreCanGated,
    generateCanGated,
    generateDeliveryOrderGated,
    generateHbl,
    generateHblExpressRelease,
    generateMbl,
    generateFiataBl,
    generateRiderBl,
    generateSwitchBl,
    generateProxyBl,
    generateBackToBackBl,
    generateSurrenderNotice,
    generateSi,
    generateStuffingReport,
    generateCourierReport,
    generateSailingConfirmation,
    generateTranshipmentConfirmation,
    generateCargoManifest,
    generateFreightManifest,
    generatePreAlertDoc,
    generateJobCard,
    generateJobPnl,
    generateProformaInvoice,
    generateDeliveryOrder,
    generatePreCan,
    generateCan,
    generateExchangeLetter,
    generateUndertakeLetter,
    generateTransportRequest,
    generateCrossBorderDeclaration,
    generateCustomsTransit,
    generateDeliveryNote,
    generateShippingAdvice,
    generateProofOfDelivery,
    generateEAwb,
    generateBarcodeLabel,
    generateConsigneeLabel,
    generateJobCosting,
    generateFreightCertificate,
  };
}

/** List action-menu mutations (id passed per call). */
export function useJobLifecycleMutations() {
  const invalidate = useInvalidateJobs();

  return {
    cancel: useMutation({
      mutationFn: (id: string) => jobService.cancel(id),
      onSuccess: (_d, id) => invalidate(id),
    }),
    close: useMutation({
      mutationFn: (id: string) => jobService.close(id),
      onSuccess: (_d, id) => invalidate(id),
    }),
    changeStatus: useMutation({
      mutationFn: ({ id, dto }: { id: string; dto: ChangeJobStatusDto }) =>
        jobService.changeStatus(id, dto),
      onSuccess: (_d, { id }) => invalidate(id),
    }),
    reopen: useMutation({
      mutationFn: ({ id, dto }: { id: string; dto?: ReopenJobDto }) =>
        jobService.reopen(id, dto ?? {}),
      onSuccess: (_d, { id }) => invalidate(id),
    }),
    stop: useMutation({
      mutationFn: ({ id, dto }: { id: string; dto?: StopJobDto }) =>
        jobService.stop(id, dto ?? {}),
      onSuccess: (_d, { id }) => invalidate(id),
    }),
    remove: useMutation({
      mutationFn: (id: string) => jobService.softDelete(id),
      onSuccess: (_d, id) => invalidate(id),
    }),
  };
}

export function useJobChargeMutations(jobId: string) {
  const invalidate = useInvalidateJobs();
  const queryClient = useQueryClient();
  const after = () => {
    invalidate(jobId);
    void queryClient.invalidateQueries({ queryKey: jobKeys.jobCharges(jobId) });
    void queryClient.invalidateQueries({ queryKey: jobKeys.jobChargesHistory(jobId) });
  };
  return {
    create: useMutation({
      mutationFn: (dto: CreateJobChargeDto) => jobService.createCharge(jobId, dto),
      onSuccess: after,
    }),
    createComposite: useMutation({
      mutationFn: (dto: CreateJobChargesCompositeDto) =>
        jobService.createChargesComposite(jobId, dto),
      onSuccess: after,
    }),
    update: useMutation({
      mutationFn: ({ chargeId, dto }: { chargeId: string; dto: UpdateJobChargeDto }) =>
        jobService.updateCharge(jobId, chargeId, dto),
      onSuccess: after,
    }),
    updateSale: useMutation({
      mutationFn: ({
        chargeId,
        dto,
      }: {
        chargeId: string;
        dto: PatchJobChargeSideDto;
      }) => jobService.updateChargeSale(jobId, chargeId, dto),
      onSuccess: after,
    }),
    updateCost: useMutation({
      mutationFn: ({
        chargeId,
        dto,
      }: {
        chargeId: string;
        dto: PatchJobChargeSideDto;
      }) => jobService.updateChargeCost(jobId, chargeId, dto),
      onSuccess: after,
    }),
    remove: useMutation({
      mutationFn: (chargeId: string) => jobService.deleteCharge(jobId, chargeId),
      onSuccess: after,
    }),
  };
}

export function useJobNoteMutations(jobId: string) {
  const invalidate = useInvalidateJobs();
  return {
    create: useMutation({
      mutationFn: (dto: CreateJobNoteDto) => jobService.createNote(jobId, dto),
      onSuccess: () => invalidate(jobId),
    }),
    update: useMutation({
      mutationFn: ({ noteId, dto }: { noteId: string; dto: UpdateJobNoteDto }) =>
        jobService.updateNote(jobId, noteId, dto),
      onSuccess: () => invalidate(jobId),
    }),
    remove: useMutation({
      mutationFn: (noteId: string) => jobService.deleteNote(jobId, noteId),
      onSuccess: () => invalidate(jobId),
    }),
  };
}

export function useJobMilestoneMutations(jobId: string) {
  const invalidate = useInvalidateJobs();
  return {
    create: useMutation({
      mutationFn: (dto: CreateCustomMilestoneDto) => jobService.createMilestone(jobId, dto),
      onSuccess: () => invalidate(jobId),
    }),
    update: useMutation({
      mutationFn: ({
        milestoneId,
        dto,
      }: {
        milestoneId: string;
        dto: UpdateJobMilestoneDto;
      }) => jobService.updateMilestone(jobId, milestoneId, dto),
      onSuccess: () => invalidate(jobId),
    }),
  };
}

export function useConvertQuotationToJob() {
  const invalidate = useInvalidateJobs();
  return useMutation({
    mutationFn: (quotationId: string) => jobService.convertFromQuotation(quotationId),
    onSuccess: (job) => invalidate(job.id),
  });
}
