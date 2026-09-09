import { quotationService } from '../services/quotation.service';
import type { CreateQuotationLineDto, Quotation } from '../types/quotation.types';
import type { QuotationWizardCostingPayload } from '../types/quotationWizardCosting.types';

/**
 * After POST /quotations header create: optionally apply tariff, then POST draft lines.
 * Failures on costing are collected so the header quotation still navigates.
 */
export async function persistQuotationWizardCosting(
  quotationId: string,
  costing: QuotationWizardCostingPayload | undefined,
): Promise<{ quotation: Quotation; warnings: string[] }> {
  const warnings: string[] = [];
  let quotation = await quotationService.getById(quotationId);

  if (!costing) return { quotation, warnings };

  if (costing.apply_tariff) {
    try {
      quotation = await quotationService.applyTariff(quotationId);
    } catch (err) {
      warnings.push(
        err instanceof Error ? err.message : 'Apply tariff failed after create.',
      );
    }
  }

  for (const [index, line] of costing.lines.entries()) {
    try {
      const dto: CreateQuotationLineDto = {
        ...line,
        sort_order: line.sort_order ?? index,
      };
      await quotationService.addLine(quotationId, dto);
    } catch (err) {
      warnings.push(
        err instanceof Error
          ? `Line ${index + 1}: ${err.message}`
          : `Line ${index + 1} could not be saved.`,
      );
    }
  }

  if (costing.lines.length || costing.apply_tariff) {
    try {
      quotation = await quotationService.getById(quotationId);
    } catch {
      // keep last known quotation
    }
  }

  return { quotation, warnings };
}
