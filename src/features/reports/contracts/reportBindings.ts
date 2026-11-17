export interface PartyBlock {
  billTo: string
  shipper: string
  consignee: string
  notify: string
}

export interface CompanyBlock {
  name: string
  address: string
  phone: string
  email: string
}

export interface ShipmentBlock {
  mawb: string
  hawb: string
  hbl: string
  mbl: string
  pol: string
  pod: string
  placeOfReceipt: string
  placeOfDelivery: string
  finalDestination: string
  vessel: string
  voyage: string
  etd: string
  eta: string
  carrier: string
  freightTerms: string
  serviceType: string
}

export interface CargoBlock {
  description: string
  marks: string
  pieces: string
  grossWeight: string
  netWeight: string
  measurement: string
  containerNo: string
  containerType: string
  sealNo: string
}

export interface InvoiceReportData {
  company: CompanyBlock
  party: PartyBlock
  job: { number: string }
  invoice: {
    number: string
    date: string
    currency: string
    amount: string
    tax: string
    total: string
  }
  shipment: ShipmentBlock
  cargo: CargoBlock
}

export interface BillOfLadingReportData {
  company: CompanyBlock
  party: PartyBlock
  job: { number: string }
  shipment: ShipmentBlock
  cargo: CargoBlock
}

export interface ArrivalNoticeReportData {
  company: CompanyBlock
  party: PartyBlock
  job: { number: string }
  shipment: ShipmentBlock
  cargo: CargoBlock
  invoice: {
    currency: string
    amount: string
    tax: string
    total: string
  }
}

export const invoiceBindingPaths = [
  'company.name', 'company.address', 'company.phone', 'company.email',
  'party.billTo', 'party.shipper', 'party.consignee', 'party.notify',
  'job.number',
  'invoice.number', 'invoice.date', 'invoice.currency', 'invoice.amount', 'invoice.tax', 'invoice.total',
  'shipment.mawb', 'shipment.hawb', 'shipment.hbl', 'shipment.mbl', 'shipment.pol', 'shipment.pod',
  'shipment.placeOfReceipt', 'shipment.placeOfDelivery', 'shipment.finalDestination',
  'shipment.vessel', 'shipment.voyage', 'shipment.etd', 'shipment.eta', 'shipment.carrier',
  'shipment.freightTerms', 'shipment.serviceType',
  'cargo.description', 'cargo.marks', 'cargo.pieces', 'cargo.grossWeight', 'cargo.netWeight',
  'cargo.measurement', 'cargo.containerNo', 'cargo.containerType', 'cargo.sealNo',
] as const

export const billOfLadingBindingPaths = [
  'company.name', 'company.address', 'company.phone', 'company.email',
  'party.billTo', 'party.shipper', 'party.consignee', 'party.notify',
  'job.number',
  'shipment.mawb', 'shipment.hawb', 'shipment.hbl', 'shipment.mbl', 'shipment.pol', 'shipment.pod',
  'shipment.placeOfReceipt', 'shipment.placeOfDelivery', 'shipment.finalDestination',
  'shipment.vessel', 'shipment.voyage', 'shipment.etd', 'shipment.eta', 'shipment.carrier',
  'shipment.freightTerms', 'shipment.serviceType',
  'cargo.description', 'cargo.marks', 'cargo.pieces', 'cargo.grossWeight', 'cargo.netWeight',
  'cargo.measurement', 'cargo.containerNo', 'cargo.containerType', 'cargo.sealNo',
] as const

export const arrivalNoticeBindingPaths = [
  ...billOfLadingBindingPaths,
  'invoice.currency', 'invoice.amount', 'invoice.tax', 'invoice.total',
] as const

export type InvoiceBindingPath = (typeof invoiceBindingPaths)[number]
export type BillOfLadingBindingPath = (typeof billOfLadingBindingPaths)[number]
export type ArrivalNoticeBindingPath = (typeof arrivalNoticeBindingPaths)[number]

export const bindingPathsByFamily = {
  invoice: invoiceBindingPaths,
  billOfLading: billOfLadingBindingPaths,
  arrivalNotice: arrivalNoticeBindingPaths,
} as const
