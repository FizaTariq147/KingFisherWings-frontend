export interface VendorDashboardKpis {
  invoiceTotal?: number;
  dueOpen?: number;
  overdue?: number;
  outstanding?: number;
  paid?: number;
  agingOutstanding?: number;
}

export interface VendorTaskItem {
  id: string;
  label: string;
  done: boolean;
  href?: string;
  dueAt?: string;
  category?: string;
}

export interface VendorDashboardWidgets {
  kpis: VendorDashboardKpis;
  tasksPreview?: VendorTaskItem[];
  period?: string;
  raw?: Record<string, unknown>;
}
