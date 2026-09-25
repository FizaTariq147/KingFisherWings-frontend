import { useMutation } from '@tanstack/react-query';
import { jobService } from '../services/job.service';
import type { ScanJobBarcodeDto } from '../types/job.types';
import { useInvalidateJobs } from './useJobs';

/** GET /jobs/by-barcode/:code — lookup without recording a scan event. */
export function useFindJobByBarcode() {
  return useMutation({
    mutationFn: (code: string) => jobService.findByBarcode(code),
  });
}

/** POST /jobs/scan — record scan event and return job. */
export function useScanJobBarcode() {
  const invalidate = useInvalidateJobs();
  return useMutation({
    mutationFn: (dto: ScanJobBarcodeDto) => jobService.scanBarcode(dto),
    onSuccess: (job) => {
      if (job?.id) invalidate(job.id);
    },
  });
}
