import type { CreateGlPaymentDto } from '../types/glPayment.types';

export const GL_PAYMENT_DEMO_CREATE: CreateGlPaymentDto = {
  direction: 'RECEIPT',
  payment_method: 'BANK_TRANSFER',
  party_id: '',
  amount: 1500,
  currency_code: 'AED',
  exchange_rate: 1,
  payment_date: new Date().toISOString().slice(0, 10),
  narration: 'Customer receipt against freight invoice',
  reference_number: 'RCP-DEMO-001',
  is_pdc: false,
};

export const GL_PAYMENT_DEMO_VENDOR: CreateGlPaymentDto = {
  direction: 'PAYMENT',
  payment_method: 'BANK_TRANSFER',
  party_id: '',
  amount: 2500,
  currency_code: 'AED',
  exchange_rate: 1,
  payment_date: new Date().toISOString().slice(0, 10),
  narration: 'Vendor payment for carrier charges',
  reference_number: 'PAY-DEMO-001',
  is_pdc: false,
};
