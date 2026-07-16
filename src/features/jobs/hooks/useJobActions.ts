import { useMutation } from '@tanstack/react-query';
import { jobService } from '../services/job.service';
import type {
  CreateJobChargeDto,
  CreateJobNoteDto,
  CreateCustomMilestoneDto,
  GenerateJobDocumentDto,
  SchedulePreAlertDto,
  SendPreAlertDto,
  SendWhatsAppStatusDto,
  UpdateJobChargeDto,
  UpdateJobMilestoneDto,
  UpdateJobNoteDto,
} from '../types/job.types';
import { useInvalidateJobs } from './useJobs';

/** Detail-page lifecycle actions for a single job. */
export function useJobActions(jobId: string) {
  const invalidate = useInvalidateJobs();
  const id = jobId;

  const cancel = useMutation({
    mutationFn: () => jobService.cancel(id),
    onSuccess: () => invalidate(id),
  });
  const close = useMutation({
    mutationFn: () => jobService.close(id),
    onSuccess: () => invalidate(id),
  });
  const remove = useMutation({
    mutationFn: () => jobService.softDelete(id),
    onSuccess: () => invalidate(id),
  });
  const prorateCost = useMutation({
    mutationFn: (chargeCodeId: string) => jobService.prorateCost(id, chargeCodeId),
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

  const generateHawb = useMutation({
    mutationFn: (dto?: GenerateJobDocumentDto) => jobService.generateHawb(id, dto),
    onSuccess: () => invalidate(id),
  });
  const generateMawb = useMutation({
    mutationFn: (dto?: GenerateJobDocumentDto) => jobService.generateMawb(id, dto),
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
    remove,
    prorateCost,
    sendPreAlert,
    schedulePreAlert,
    sendWhatsAppStatus,
    generateHawb,
    generateMawb,
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
    remove: useMutation({
      mutationFn: (id: string) => jobService.softDelete(id),
      onSuccess: (_d, id) => invalidate(id),
    }),
  };
}

export function useJobChargeMutations(jobId: string) {
  const invalidate = useInvalidateJobs();
  return {
    create: useMutation({
      mutationFn: (dto: CreateJobChargeDto) => jobService.createCharge(jobId, dto),
      onSuccess: () => invalidate(jobId),
    }),
    update: useMutation({
      mutationFn: ({ chargeId, dto }: { chargeId: string; dto: UpdateJobChargeDto }) =>
        jobService.updateCharge(jobId, chargeId, dto),
      onSuccess: () => invalidate(jobId),
    }),
    remove: useMutation({
      mutationFn: (chargeId: string) => jobService.deleteCharge(jobId, chargeId),
      onSuccess: () => invalidate(jobId),
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
