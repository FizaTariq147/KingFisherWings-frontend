/**
 * Prove the status path for INVOICE_FLOW_TAX_INVOICE_1 and QUOTATION_FLOW_1.
 * Uses a temporary copy of signoff.csv (never committed). Restores signoff.csv
 * and status.json afterward. Does not run report:signoff.
 *
 *   node tools/reports/prove-flow-status-path.mjs
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { FLOW_INVOICE_OPTIONS, listFlowCatalogEntries } from './invoice-flow-options.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const signoffPath = path.join(root, 'reports/signoff.csv');
const statusPath = path.join(root, 'reports/status.json');
const workDir = path.join(root, 'reports/output/flow-status-proof');
const RELEASE = ['INVOICE_FLOW_TAX_INVOICE_1', 'QUOTATION_FLOW_1'];
const applicability = JSON.parse(
  fs.readFileSync(path.join(root, 'reports/invoice-v2-applicability.json'), 'utf8'),
);
const invoiceV2SpecCodes = new Set(
  Object.keys(applicability).filter((code) => !/_FLOW_/i.test(code)),
);

fs.mkdirSync(workDir, { recursive: true });
const signoffBackup = fs.readFileSync(signoffPath, 'utf8');
const statusBackup = fs.existsSync(statusPath) ? fs.readFileSync(statusPath, 'utf8') : null;
fs.writeFileSync(path.join(workDir, 'signoff.csv.backup'), signoffBackup);
if (statusBackup) fs.writeFileSync(path.join(workDir, 'status.json.backup'), statusBackup);

function gated(code) {
  const key = String(code || '').trim().toUpperCase();
  return invoiceV2SpecCodes.has(key) || Boolean(FLOW_INVOICE_OPTIONS[key]);
}

function visible(code, { engine, gate, statusMap }) {
  const key = String(code || '').trim().toUpperCase();
  if (!gated(key)) return true;
  if (engine !== 'v2') return false;
  if (gate === 'hard' && statusMap[key] !== 'accepted') return false;
  // staging-only still need catalog list filter
  const options = FLOW_INVOICE_OPTIONS[key];
  if (options?.stagingOnly) return false;
  return true;
}

function catalogCodes({ engine, gate, statusMap, stagingEnv }) {
  const flow = listFlowCatalogEntries(stagingEnv).map((row) => row.code.toUpperCase());
  const v2 = [...invoiceV2SpecCodes];
  const all = [...new Set([...flow, ...v2])];
  return all.filter((code) => visible(code, { engine, gate, statusMap })).sort();
}

try {
  const today = new Date().toISOString().slice(0, 10);
  const hash = 'flow-release-proof-not-for-commit';
  let next = signoffBackup.replace(/\n*$/, '\n');
  for (const code of RELEASE) {
    const row = `${code},proof-reviewer,${today},${hash}`;
    if (next.split(/\r?\n/).some((line) => line.startsWith(`${code},`))) {
      next = next
        .split(/\r?\n/)
        .map((line) => (line.startsWith(`${code},`) ? row : line))
        .join('\n');
    } else {
      next += `${row}\n`;
    }
  }
  fs.writeFileSync(signoffPath, next);
  fs.writeFileSync(path.join(workDir, 'signoff.temp.csv'), next);

  execFileSync(process.execPath, [path.join(root, 'tools/reports/build-status.mjs')], {
    cwd: root,
    stdio: 'inherit',
  });

  const statusMap = JSON.parse(fs.readFileSync(statusPath, 'utf8'));
  const acceptedFlow = RELEASE.map((code) => ({ code, status: statusMap[code] }));
  const hardList = catalogCodes({
    engine: 'v2',
    gate: 'hard',
    statusMap,
    stagingEnv: { VITE_REPORTS_GATE: 'hard', VITE_REPORTS_FLOW_STAGING: '' },
  });
  const legacyUnset = catalogCodes({
    engine: 'legacy',
    gate: 'soft',
    statusMap,
    stagingEnv: { VITE_REPORTS_GATE: 'soft', VITE_REPORTS_FLOW_STAGING: '' },
  });
  const softStagingOff = catalogCodes({
    engine: 'v2',
    gate: 'soft',
    statusMap,
    stagingEnv: { VITE_REPORTS_GATE: 'soft', VITE_REPORTS_FLOW_STAGING: '' },
  });

  const proof = {
    acceptedFlow,
    bothAccepted: acceptedFlow.every((row) => row.status === 'accepted'),
    hardGateList: hardList,
    hardGateExactlyRelease: hardList.length === 2 && RELEASE.every((code) => hardList.includes(code)),
    hardGateHasCreditOrDebit: hardList.some((code) => /CREDIT_NOTE_FLOW|DEBIT_NOTE_FLOW/.test(code)),
    hardGateHasOtherV2: hardList.some((code) => !RELEASE.includes(code)),
    legacyList: legacyUnset,
    legacyEmpty: legacyUnset.length === 0,
    softIncludesRelease: RELEASE.every((code) => softStagingOff.includes(code)),
    softExcludesStagingNotes: !softStagingOff.some((code) => /CREDIT_NOTE_FLOW|DEBIT_NOTE_FLOW/.test(code)),
    note: 'Temporary signoff/status restored after this proof. Nothing committed as accepted.',
  };

  fs.writeFileSync(path.join(workDir, 'proof.json'), `${JSON.stringify(proof, null, 2)}\n`);
  fs.writeFileSync(
    path.join(root, 'reports/flow-spike/status-path-proof.json'),
    `${JSON.stringify(proof, null, 2)}\n`,
  );
  console.log(JSON.stringify(proof, null, 2));

  if (!proof.bothAccepted || !proof.hardGateExactlyRelease || !proof.legacyEmpty) {
    throw new Error('Status path proof failed — see proof.json');
  }
} finally {
  fs.writeFileSync(signoffPath, signoffBackup);
  if (statusBackup != null) fs.writeFileSync(statusPath, statusBackup);
  else if (fs.existsSync(statusPath)) {
    // rebuild clean status from restored signoff
    execFileSync(process.execPath, [path.join(root, 'tools/reports/build-status.mjs')], {
      cwd: root,
      stdio: 'inherit',
    });
  }
}
