/**
 * Proposed Air waybill bindings from the filtered label inventory.
 * Not wired into the report renderer.
 */
export interface AirWaybillContractProposal {
  /** shipper (174). Source: Job.shipper_name. */
  shipper: string;
  /** notify party (105). No source in the current data model. */
  notify: string;
  /** consignee s name and address (36). Source: Job.consignee_name. */
  consignee: string;
  /** gross weight (21). Source: JobCargo.gross_weight. */
  grossWeight: string;
  /** airport of destination (13). No source in the current data model. */
  airport_of_destination: string;
  /** signature of issuing carrier or its agent (11). Source: Quotation.carrier_name. */
  carrier: string;
  /** weight (9). No source in the current data model. */
  weight: string;
  /** agent (9). No source in the current data model. */
  agent: string;
  /** total collect (9). No source in the current data model. */
  total_collect: string;
}
