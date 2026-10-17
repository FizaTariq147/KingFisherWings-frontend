/**
 * Lifecycle continuum (all job types):
 * Enquiry → Quotation → Verified → Approved → Shipment → Job
 * (optional Party prefix when party id is present)
 */
export const OPS_CONTINUUM_FLOW =
  'Enquiry → Quotation → Verified → Approved → Shipment → Job';

export {
  buildFclContinuumSteps,
  buildFclContinuumSteps as buildOpsContinuumSteps,
  continuumApproved,
  continuumVerified,
  type ContinuumStep,
  type ContinuumStepKey,
} from './buildFclContinuumSteps';

export {
  FclContinuumRail,
  FclContinuumRail as OpsContinuumRail,
} from './FclContinuumRail';

export {
  normalizeOpsContinuum,
  normalizePathHints,
  pickDetailHints,
} from './normalizeDetailHints';

export { filterGenerationPathHints } from './filterGenerationPathHints';
