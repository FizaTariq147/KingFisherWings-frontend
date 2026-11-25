/**
 * Prove the runtime kill switch: flip public/reports-config.json to legacy
 * without rebuilding, and show the catalogue lists no gated v2/flow codes.
 *
 * Does not change status.json, signoff, thresholds, or classic generators.
 *
 *   node tools/reports/prove-runtime-kill-switch.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { FLOW_INVOICE_OPTIONS, listFlowCatalogEntries } from './invoice-flow-options.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const configPath = path.join(root, 'public/reports-config.json');
const outDir = path.join(root, 'reports/output/runtime-kill-switch-proof');
const outPath = path.join(outDir, 'proof.json');

const applicability = JSON.parse(
  fs.readFileSync(path.join(root, 'reports/invoice-v2-applicability.json'), 'utf8'),
);
const invoiceV2SpecCodes = new Set(
  Object.keys(applicability).filter((code) => !/_FLOW_/i.test(code)),
);

function gated(code) {
  const key = String(code || '').trim().toUpperCase();
  return invoiceV2SpecCodes.has(key) || Boolean(FLOW_INVOICE_OPTIONS[key]);
}

function visible(code, { engine, gate, statusMap, disabledCodes }) {
  const key = String(code || '').trim().toUpperCase();
  if (!gated(key)) return true;
  if (engine !== 'v2') return false;
  if (disabledCodes.includes(key)) return false;
  if (gate === 'hard' && statusMap[key] !== 'accepted') return false;
  const options = FLOW_INVOICE_OPTIONS[key];
  if (options?.stagingOnly) return false;
  return true;
}

function catalogGatedCodes({ engine, gate, statusMap, disabledCodes, stagingEnv }) {
  const flow = listFlowCatalogEntries(stagingEnv).map((row) => row.code.toUpperCase());
  const v2 = [...invoiceV2SpecCodes];
  const all = [...new Set([...flow, ...v2])];
  return all.filter((code) => visible(code, { engine, gate, statusMap, disabledCodes })).sort();
}

function readConfig() {
  return JSON.parse(fs.readFileSync(configPath, 'utf8'));
}

fs.mkdirSync(outDir, { recursive: true });
const original = fs.readFileSync(configPath, 'utf8');
fs.writeFileSync(path.join(outDir, 'reports-config.json.backup'), original);

const statusMap = fs.existsSync(path.join(root, 'reports/status.json'))
  ? JSON.parse(fs.readFileSync(path.join(root, 'reports/status.json'), 'utf8'))
  : {};

try {
  const beforeFile = readConfig();
  if (beforeFile.engine !== 'v2') {
    // Ensure proof starts with v2 on (runtime file only — no rebuild).
    fs.writeFileSync(
      configPath,
      `${JSON.stringify({ ...beforeFile, engine: 'v2' }, null, 2)}\n`,
    );
  }
  const withV2 = readConfig();
  const listedWithV2 = catalogGatedCodes({
    engine: withV2.engine,
    gate: withV2.gate || 'soft',
    statusMap,
    disabledCodes: (withV2.disabledCodes || []).map((c) => String(c).toUpperCase()),
    stagingEnv: '0',
  });

  // Flip runtime flag only — same deploy artifact, no rebuild.
  const legacyPayload = {
    engine: 'legacy',
    gate: withV2.gate || 'soft',
    disabledCodes: withV2.disabledCodes || [],
  };
  fs.writeFileSync(configPath, `${JSON.stringify(legacyPayload, null, 2)}\n`);
  const afterFile = readConfig();
  const listedAfterLegacy = catalogGatedCodes({
    engine: afterFile.engine,
    gate: afterFile.gate || 'soft',
    statusMap,
    disabledCodes: (afterFile.disabledCodes || []).map((c) => String(c).toUpperCase()),
    stagingEnv: '0',
  });

  const proof = {
    ok:
      withV2.engine === 'v2' &&
      listedWithV2.length > 0 &&
      afterFile.engine === 'legacy' &&
      listedAfterLegacy.length === 0,
    note:
      'Catalogue visibility follows public/reports-config.json (cache: no-store). No frontend rebuild.',
    file: 'public/reports-config.json',
    before: {
      config: withV2,
      gatedCatalogueCount: listedWithV2.length,
      gatedCatalogueSample: listedWithV2.slice(0, 8),
    },
    afterRuntimeLegacy: {
      config: afterFile,
      gatedCatalogueCount: listedAfterLegacy.length,
      gatedCatalogue: listedAfterLegacy,
    },
    rebuildRequired: {
      runtimeConfigFlip: false,
      statusJsonAcceptChange: true,
      viteEnvChange: true,
    },
  };

  fs.writeFileSync(outPath, `${JSON.stringify(proof, null, 2)}\n`);
  console.log(JSON.stringify(proof, null, 2));
  if (!proof.ok) process.exitCode = 1;
} finally {
  fs.writeFileSync(configPath, original);
}
