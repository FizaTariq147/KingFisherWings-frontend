export type Priority = 'High' | 'Medium' | 'Low'

export interface ShipmentRow {
  id: string
  shipmentNo: string
  client: string
  jobNo: string
  por: string
  pof: string
}

export interface JobRow {
  id: string
  jobNo: string
  client: string
  pol: string
  pod: string
  etd: string
  eta: string
}

export interface InvoiceRow {
  id: string
  voucherNo: string
  client: string
  date: string
  amount: number
  currency: string
}

export interface TodoRow {
  id: string
  details: string
  priority: Priority
  date: string
  assigned: string
}

export interface DashboardFooterInfo {
  userEmail: string
  timestamp: string // ISO
  timezone: string
  poweredBy: string
}
