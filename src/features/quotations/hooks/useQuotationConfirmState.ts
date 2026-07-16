import { useCallback, useState } from 'react';
import type { Quotation } from '../types/quotation.types';

export type QuotationConfirmKind =
  | 'submit'
  | 'approve'
  | 'reject'
  | 'send'
  | 'mark-won'
  | 'mark-lost'
  | 'convert'
  | 'archive'
  | 'expire'
  | 'delete'
  | 'duplicate';

export interface QuotationConfirmState {
  kind: QuotationConfirmKind;
  quotation: Quotation;
}

export function useQuotationConfirmState() {
  const [confirm, setConfirm] = useState<QuotationConfirmState | null>(null);

  const requestConfirm = useCallback((kind: QuotationConfirmKind, quotation: Quotation) => {
    setConfirm({ kind, quotation });
  }, []);

  const closeConfirm = useCallback(() => setConfirm(null), []);

  return { confirm, requestConfirm, closeConfirm };
}
