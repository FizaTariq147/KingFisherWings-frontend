export interface VendorScheduleItem {
  id: string;
  number: string;
  dueDate?: string;
  status?: string;
  amount?: number;
  outstanding?: number;
  currencyCode?: string;
  overdue?: boolean;
}

export interface VendorScheduleResult {
  items: VendorScheduleItem[];
  dueCount: number;
  overdueCount: number;
  outstandingTotal?: number;
}
