/**
 * Proposed Invoice bindings from the filtered label inventory.
 * Not wired into the report renderer.
 */
export interface InvoiceContractProposal {
  /** total (133). Source: Invoice.total_amount. */
  total: string;
  /** sea freight charge (92). No source in the current data model. */
  freightTerms: string;
  /** gst18 (90). Source: Invoice.tax_total. */
  tax: string;
  /** printed date (60). No source in the current data model. */
  printed_date: string;
  /** description of goods (47). Source: JobCargo.description. */
  description: string;
  /** local charges (37). Source: JobCharge.description. */
  charge_description: string;
  /** amount (36). Source: Invoice.subtotal. */
  amount: string;
  /** sub total (30). No source in the current data model. */
  sub_total: string;
  /** g weight (20). No source in the current data model. */
  g_weight: string;
  /** account (19). Source: VoucherLine.account_name. */
  accountName: string;
  /** containers (16). Source: JobCargo.container_number. */
  containerNo: string;
  /** subtotal (16). No source in the current data model. */
  subtotal: string;
  /** shippers reference (15). No source in the current data model. */
  referenceNo: string;
  /** total in inr (14). No source in the current data model. */
  total_in_inr: string;
  /** total no of pcs (10). No source in the current data model. */
  total_no_of_pcs: string;
  /** to or consignee (9). Source: Job.consignee_name. */
  consignee: string;
  /** shipper s (9). Source: Job.shipper_name. */
  shipper: string;
  /** vat trn no (9). No source in the current data model. */
  vat_trn_no: string;
  /** trn no (7). No source in the current data model. */
  trn_no: string;
}
