#!/usr/bin/env node
/**
 * Coverage audit for the NVOCC / Air freight / Portal / Masters endpoint set.
 *
 * For each endpoint we check three layers:
 *   api      - a path builder exists in a *.api.ts (or masterPaths.ts) module
 *   service  - a service function calls that path builder
 *   ui       - a hook/component references the service function or mutation
 *
 * Run: node scripts/audit-nvocc-air-portal-coverage.mjs
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(fileURLToPath(new URL('.', import.meta.url)), '..');
const SRC = join(ROOT, 'src');

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (/\.(ts|tsx)$/.test(entry)) out.push(full);
  }
  return out;
}

const FILES = walk(SRC).map((path) => ({
  path,
  rel: relative(ROOT, path).replace(/\\/g, '/'),
  text: readFileSync(path, 'utf8'),
}));

const isApiFile = (f) => /\/api\/[^/]+\.ts$/.test(f.rel);
const isServiceFile = (f) => /\/services\/[^/]+\.ts$/.test(f.rel);
const isUiFile = (f) => /\/(hooks|components|pages|config)\//.test(f.rel);

/**
 * @type {{ group: string, method: string, path: string, api: RegExp, service: RegExp, ui: RegExp }[]}
 */
const ENDPOINTS = [];

function add(group, method, path, api, service, ui) {
  ENDPOINTS.push({ group, method, path, api, service, ui: ui ?? service });
}

// ---------------------------------------------------------------- Staff NVOCC
add('Staff NVOCC', 'POST', '/nvocc/bookings/:id/cs-triage', /\/cs-triage`/, /bookings\.csTriage/, /csTriage/);
add('Staff NVOCC', 'POST', '/nvocc/bookings/:id/mark-quote-sent', /bookings\/\$\{id\}\/mark-quote-sent/, /bookings\.markQuoteSent/, /markQuoteSent/);
add('Staff NVOCC', 'GET', '/nvocc/bookings/:id/booking-form', /bookings\/\$\{id\}\/booking-form/, /getBookingForm/, /useNvoccBookingForm/);
add('Staff NVOCC', 'PUT', '/nvocc/bookings/:id/booking-form', /bookings\/\$\{id\}\/booking-form/, /updateBookingForm/, /useUpdateNvoccBookingForm/);
add('Staff NVOCC', 'POST', '/nvocc/bookings/:id/send-invoice', /bookings\/\$\{id\}\/send-invoice/, /bookings\.sendInvoice/, /sendInvoice/);
add('Staff NVOCC', 'GET', '/nvocc/jobs/:id/container-requests', /jobs\/\$\{id\}\/container-requests/, /listContainerRequests/, /useNvoccContainerRequests/);
add('Staff NVOCC', 'POST', '/nvocc/jobs/:id/container-requests', /jobs\/\$\{id\}\/container-requests/, /createContainerRequest/, /createContainerRequest/);
add('Staff NVOCC', 'POST', '/nvocc/jobs/:jobId/container-requests/:requestId/issue', /container-requests\/\$\{requestId\}\/issue/, /issueContainerRequest/, /issueContainerRequest/);
add('Staff NVOCC', 'POST', '/nvocc/jobs/:jobId/container-requests/:requestId/allocate', /container-requests\/\$\{requestId\}\/allocate/, /allocateContainerRequest/, /allocateContainerRequest/);
add('Staff NVOCC', 'POST', '/nvocc/jobs/:id/stage/loading', /jobs\/\$\{id\}\/stage\/loading/, /stageLoading/, /stageLoading/);
add('Staff NVOCC', 'POST', '/nvocc/jobs/:id/accounts/confirm-payment', /jobs\/\$\{id\}\/accounts\/confirm-payment/, /jobs\.confirmPayment/, /confirmPayment/);
add('Staff NVOCC', 'POST', '/nvocc/jobs/:id/documents/hbl-draft-gated', /documents\/hbl-draft-gated/, /hblDraftGated/, /hblDraftGated/);
add('Staff NVOCC', 'POST', '/nvocc/jobs/:id/documents/hbl-original-gated', /documents\/hbl-original-gated/, /hblOriginalGated/, /hblOriginalGated/);
add('Staff NVOCC', 'POST', '/nvocc/jobs/:id/close-report', /jobs\/\$\{id\}\/close-report/, /jobs\.closeReport/, /closeReport/);

// --------------------------------------------------------------- Portal NVOCC
add('Portal NVOCC', 'GET', '/portal/shipments/:id/container-requests', /\/container-requests`/, /containerRequests\(/, /usePortalShipmentContainerRequests/);
add('Portal NVOCC', 'POST', '/portal/shipments/:id/containers/:lineId/confirm-pick', /\/confirm-pick`/, /confirmPick/, /confirmPick/);
add('Portal NVOCC', 'POST', '/portal/shipments/:id/port-token/confirm', /port-token\/confirm`/, /confirmPortToken/, /confirmPortToken/);
add('Portal NVOCC', 'POST', '/portal/shipments/:id/request-draft-bl', /request-draft-bl`/, /requestDraftBl/, /requestDraftBl/);

// -------------------------------------------------------------------- Masters
add('Masters', 'POST', '/masters/container-types/seed-defaults', /'container-types': '\/masters\/container-types'/, /seed-defaults/, /supportsSeedDefaults/);
add('Masters', 'GET/POST/PATCH/DELETE', '/masters/container-types', /'container-types': '\/masters\/container-types'/, /basePath/, /'container-types': \{/);
add('Masters', 'POST', '/masters/air-pallet-types/seed-defaults', /'air-pallet-types': '\/masters\/air-pallet-types'/, /seed-defaults/, /supportsSeedDefaults/);
add('Masters', 'GET/POST/PATCH/DELETE', '/masters/air-pallet-types', /'air-pallet-types': '\/masters\/air-pallet-types'/, /basePath/, /'air-pallet-types': \{/);

// ----------------------------------------------------------- Staff Air Freight
add('Staff Air', 'POST', '/jobs/:id/air/cs-triage', /air\/cs-triage/, /airCsTriage/, /csTriage/);
add('Staff Air', 'POST', '/jobs/:id/air/mark-quote-sent', /air\/mark-quote-sent/, /airMarkQuoteSent/, /markQuoteSent/);
add('Staff Air', 'GET', '/jobs/:id/air-booking-form', /air-booking-form/, /getAirBookingForm/, /useJobAirBookingForm/);
add('Staff Air', 'PUT', '/jobs/:id/air-booking-form', /air-booking-form/, /updateAirBookingForm/, /useUpdateJobAirBookingForm/);
add('Staff Air', 'POST', '/jobs/:id/air/send-invoice', /air\/send-invoice/, /airSendInvoice/, /sendInvoice/);
add('Staff Air', 'GET', '/jobs/:id/air/uld-requests', /air\/uld-requests/, /listAirUldRequests/, /useAirUldRequests/);
add('Staff Air', 'POST', '/jobs/:id/air/uld-requests', /air\/uld-requests/, /createAirUldRequest/, /createUldRequest/);
add('Staff Air', 'POST', '/jobs/:id/air/uld-requests/:requestId/issue', /uld-requests\/\$\{requestId\}\/issue/, /issueAirUldRequest/, /issueUldRequest/);
add('Staff Air', 'POST', '/jobs/:id/air/uld-requests/:requestId/allocate', /uld-requests\/\$\{requestId\}\/allocate/, /allocateAirUldRequest/, /allocateUldRequest/);
add('Staff Air', 'POST', '/jobs/:id/air/stage/build-up', /air\/stage\/build-up/, /airStageBuildUp/, /stageBuildUp/);
add('Staff Air', 'POST', '/jobs/:id/air/stage/mawb-received', /air\/stage\/mawb-received/, /airStageMawbReceived/, /stageMawbReceived/);
add('Staff Air', 'POST', '/jobs/:id/air/stage/mawb-issued', /air\/stage\/mawb-issued/, /airStageMawbIssued/, /stageMawbIssued/);
add('Staff Air', 'POST', '/jobs/:id/air/stage/pod', /air\/stage\/pod/, /airStagePod/, /stagePod/);
add('Staff Air', 'POST', '/jobs/:id/air/accounts/confirm-payment', /air\/accounts\/confirm-payment/, /airConfirmPayment/, /confirmPayment/);
add('Staff Air', 'POST', '/jobs/:id/air/close-report', /air\/close-report/, /airCloseReport/, /closeReport/);
add('Staff Air', 'POST', '/jobs/:id/documents/hawb-draft-gated', /documents\/hawb-draft-gated/, /generateHawbDraftGated/, /generateHawbDraftGated|hawbDraftGated/);
add('Staff Air', 'POST', '/jobs/:id/documents/hawb-final-gated', /documents\/hawb-final-gated/, /generateHawbFinalGated/, /generateHawbFinalGated|hawbFinalGated/);
add('Staff Air', 'POST', '/jobs/:id/documents/pre-can-gated', /documents\/pre-can-gated/, /generatePreCanGated/, /generatePreCanGated|preCanGated/);
add('Staff Air', 'POST', '/jobs/:id/documents/can-gated', /documents\/can-gated/, /generateCanGated/, /generateCanGated|canGated/);
add('Staff Air', 'POST', '/jobs/:id/documents/delivery-order-gated', /documents\/delivery-order-gated/, /generateDeliveryOrderGated/, /generateDeliveryOrderGated|deliveryOrderGated/);

// ----------------------------------------------------------------- Portal Air
add('Portal Air', 'GET', '/portal/shipments/:id/uld-requests', /\/uld-requests`/, /uldRequests\(/, /usePortalShipmentUldRequests/);
add('Portal Air', 'POST', '/portal/shipments/:id/uld-lines/:lineId/confirm-dropoff', /confirm-dropoff`/, /confirmUldDropoff/, /confirmUldDropoff/);
add('Portal Air', 'POST', '/portal/shipments/:id/request-draft-hawb', /request-draft-hawb`/, /requestDraftHawb/, /requestDraftHawb/);
add('Portal Air', 'POST', '/portal/shipments/:id/request-delivery-order', /request-delivery-order`/, /requestDeliveryOrder/, /requestDeliveryOrder/);

// -------------------------------------------------------------------- Related
add('Related', 'PATCH', '/jobs/:id/air-details', /air-details`/, /updateAirDetails/, /updateAirDetails/);
add('Related', 'POST', '/jobs/:id/documents/hawb', /documents\/hawb`/, /generateHawb:/, /generateHawb'/);
add('Related', 'POST', '/jobs/:id/documents/mawb', /documents\/mawb`/, /generateMawb:/, /generateMawb'/);
add('Related', 'POST', '/jobs/:id/documents/pre-can', /documents\/pre-can`/, /generatePreCan:/, /generatePreCan'/);
add('Related', 'POST', '/jobs/:id/documents/can', /documents\/can`/, /generateCan:/, /generateCan'/);
add('Related', 'POST', '/jobs/:id/documents/delivery-order', /documents\/delivery-order`/, /generateDeliveryOrder:/, /generateDeliveryOrder'/);

function findIn(pred, re) {
  return FILES.filter((f) => pred(f) && re.test(f.text)).map((f) => f.rel);
}

let missing = 0;
let current = '';
for (const ep of ENDPOINTS) {
  if (ep.group !== current) {
    current = ep.group;
    console.log(`\n### ${current}`);
  }
  const api = findIn(isApiFile, ep.api);
  const service = findIn(isServiceFile, ep.service);
  const ui = findIn(isUiFile, ep.ui);
  const ok = api.length && service.length && ui.length;
  if (!ok) missing += 1;
  console.log(
    `${ok ? 'OK  ' : 'GAP '} ${ep.method.padEnd(22)} ${ep.path.padEnd(58)} ` +
      `api=${api.length} service=${service.length} ui=${ui.length}`,
  );
  if (!ok) {
    console.log(`      api:     ${api.join(', ') || '(none)'}`);
    console.log(`      service: ${service.join(', ') || '(none)'}`);
    console.log(`      ui:      ${ui.join(', ') || '(none)'}`);
  }
}

console.log(`\n${ENDPOINTS.length - missing}/${ENDPOINTS.length} endpoints fully wired.`);
process.exit(missing === 0 ? 0 : 1);
