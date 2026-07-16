import type { CreateChequeDto } from '../types/cheque.types';

const dueInDays = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
};

/** Receivable PDC from customer — matches `CreateChequeDto`. */
export const CHEQUE_DEMO_RECEIVABLE_PDC: CreateChequeDto = {
  cheque_number: 'CHK-R-1042',
  cheque_type: 'RECEIVABLE',
  party_id: '',
  amount: 18500,
  currency_code: 'AED',
  cheque_date: new Date().toISOString().slice(0, 10),
  due_date: dueInDays(45),
  is_pdc: true,
  bank_name: 'Emirates NBD',
  remarks: 'Freight collection PDC — Jebel Ali export job',
};

/** Payable cheque to carrier — matches `CreateChequeDto`. */
export const CHEQUE_DEMO_PAYABLE: CreateChequeDto = {
  cheque_number: 'CHK-P-2208',
  cheque_type: 'PAYABLE',
  party_id: '',
  amount: 9200,
  currency_code: 'AED',
  cheque_date: new Date().toISOString().slice(0, 10),
  due_date: undefined,
  is_pdc: false,
  bank_name: 'ADCB',
  remarks: 'Carrier settlement — air freight AWB batch',
};
