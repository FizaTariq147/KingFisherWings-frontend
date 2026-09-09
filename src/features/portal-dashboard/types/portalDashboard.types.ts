export interface PortalDashboardOnTime {
  pct?: number;
  target?: number;
  delivered?: number;
  total?: number;
}

export interface PortalDashboardAlert {
  id?: string;
  type?: string;
  label: string;
  severity?: string;
  href?: string;
  count?: number;
}

export interface PortalTaskItem {
  id: string;
  label: string;
  done: boolean;
  href?: string;
  dueAt?: string;
  category?: string;
}

export interface PortalDashboardWidgets {
  shipmentsTotal?: number;
  shipmentsActive?: number;
  shipmentsDelivered?: number;
  quotationsTotal?: number;
  quotationsOpen?: number;
  documentsTotal?: number;
  invoicesOutstanding?: number;
  invoicesOverdue?: number;
  invoicesTotal?: number;
  onTime?: PortalDashboardOnTime;
  alerts?: PortalDashboardAlert[];
  paymentsOutstanding?: number;
  creditAvailable?: number;
  tasksPreview?: PortalTaskItem[];
  period?: string;
  raw?: Record<string, unknown>;
}
