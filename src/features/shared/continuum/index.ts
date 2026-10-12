/**
 * Ops continuum (all job types):
 * Party → Enquiry → Quotation → Verified → Approved → Shipment → Job
 */
export const OPS_CONTINUUM_FLOW =
  'Party → Enquiry → Quotation → Verified → Approved → Shipment → Job';

export {
  buildFclContinuumSteps,
  buildFclContinuumSteps as buildOpsContinuumSteps,
  type ContinuumStep,
  type ContinuumStepKey,
} from './buildFclContinuumSteps';

export {
  FclContinuumRail,
  FclContinuumRail as OpsContinuumRail,
} from './FclContinuumRail';
