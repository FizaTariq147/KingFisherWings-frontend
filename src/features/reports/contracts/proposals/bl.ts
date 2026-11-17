/**
 * Proposed Bill of lading bindings from the filtered label inventory.
 * Not wired into the report renderer.
 */
export interface BillOfLadingContractProposal {
  /** shipper (174). Source: Job.shipper_name. */
  shipper: string;
  /** consignee (160). Source: Job.consignee_name. */
  consignee: string;
  /** freight prepaid (138). No source in the current data model. */
  freightTerms: string;
  /** notify party (105). No source in the current data model. */
  notify: string;
  /** port of discharge (105). Source: Job.dest_port_code. */
  pod: string;
  /** gst18 (90). Source: Invoice.tax_total. */
  tax: string;
  /** nil marks (80). Source: JobCargo.description. */
  description: string;
  /** consignor (77). No source in the current data model. */
  consignor: string;
  /** place of delivery (64). No source in the current data model. */
  placeOfDelivery: string;
  /** port of loading (61). Source: Job.origin_port_code. */
  pol: string;
  /** delivery agent (51). No source in the current data model. */
  delivery_agent: string;
  /** place of receipt (46). No source in the current data model. */
  placeOfReceipt: string;
  /** packages (30). Source: JobCargo.packages. */
  pieces: string;
  /** no hbl (22). Source: JobSeaFclDetail.hbl_number. */
  hbl: string;
  /** container no s (18). Source: JobCargo.container_number. */
  containerNo: string;
  /** final destination (14). No source in the current data model. */
  finalDestination: string;
  /** email (11). Source: OrganizationProfile.email. */
  email: string;
  /** web www (11). Source: OrganizationProfile.website. */
  website: string;
  /** destination agent (10). No source in the current data model. */
  destination_agent: string;
  /** place of loading (9). No source in the current data model. */
  place_of_loading: string;
  /** f agent name ref (8). No source in the current data model. */
  f_agent_name_ref: string;
  /** place of acceptance (7). No source in the current data model. */
  place_of_acceptance: string;
  /** shipment reference no (7). No source in the current data model. */
  referenceNo: string;
}
