import { StatusBadge } from '@/components/erp';
import {
  STATUS_LABELS,
  type QuotationStatus,
} from '../../constants/quotation.constants';
import { coerceQuotationStatus } from '../../utils/quotationStatus';

interface QuotationStatusBadgeProps {
  status: QuotationStatus | string;
}

export function QuotationStatusBadge({ status }: QuotationStatusBadgeProps) {
  const key = coerceQuotationStatus(status);
  const label = STATUS_LABELS[key] ?? status;
  return <StatusBadge status={key} label={label} />;
}
