export interface PortalDashboardWidgets {
  shipmentsTotal?: number;
  shipmentsActive?: number;
  shipmentsDelivered?: number;
  quotationsTotal?: number;
  quotationsOpen?: number;
  documentsTotal?: number;
  invoicesOutstanding?: number;
  invoicesOverdue?: number;
  raw?: Record<string, unknown>;
}
