import { useMutation } from '@tanstack/react-query';
import { quotationService } from '../services/quotation.service';
import type {
  CreateQuotationLineDto,
  UpdateQuotationLineDto,
} from '../types/quotation.types';
import { useInvalidateQuotations } from './useQuotations';

export function useQuotationLines(quotationId: string) {
  const invalidate = useInvalidateQuotations();

  const add = useMutation({
    mutationFn: (dto: CreateQuotationLineDto) => quotationService.addLine(quotationId, dto),
    onSuccess: () => invalidate(quotationId),
  });

  const update = useMutation({
    mutationFn: ({ lineId, dto }: { lineId: string; dto: UpdateQuotationLineDto }) =>
      quotationService.updateLine(quotationId, lineId, dto),
    onSuccess: () => invalidate(quotationId),
  });

  const remove = useMutation({
    mutationFn: (lineId: string) => quotationService.removeLine(quotationId, lineId),
    onSuccess: () => invalidate(quotationId),
  });

  const applyTariff = useMutation({
    mutationFn: () => quotationService.applyTariff(quotationId),
    onSuccess: () => invalidate(quotationId),
  });

  return { add, update, remove, applyTariff };
}
