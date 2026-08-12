export interface PortalSavedFilters {
  search?: string;
  status?: string;
  [key: string]: unknown;
}

export interface PortalPreferences {
  milestoneAlertsEnabled: boolean;
  documentAlertsEnabled: boolean;
  defaultShipmentFilters: PortalSavedFilters | null;
  defaultInvoiceFilters: PortalSavedFilters | null;
  raw?: Record<string, unknown>;
}

export interface UpdatePortalPreferencesDto {
  milestone_alerts_enabled?: boolean;
  document_alerts_enabled?: boolean;
  default_shipment_filters?: PortalSavedFilters | null;
  default_invoice_filters?: PortalSavedFilters | null;
}
