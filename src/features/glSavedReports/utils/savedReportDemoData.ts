import type { CreateSavedReportDto } from '../types/savedReport.types';

export const SAVED_REPORT_DEMO_PL: CreateSavedReportDto = {
  name: 'Monthly P&L — June',
  report_type: 'PROFIT_AND_LOSS',
  description: 'Standard monthly profit and loss for finance review.',
  filters: {
    from_date: '2026-06-01',
    to_date: '2026-06-30',
    hide_zero: true,
  },
  is_shared: false,
};

export const SAVED_REPORT_DEMO_AR_AGING: CreateSavedReportDto = {
  name: 'AR Aging — Current Month',
  report_type: 'AR_AGING',
  description: 'Customer receivables aging snapshot.',
  filters: {
    as_of: new Date().toISOString().slice(0, 10),
  },
  is_shared: true,
};
