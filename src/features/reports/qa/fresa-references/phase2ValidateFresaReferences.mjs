/**
 * Phase 2: Fresa reference validation, PDF inspection, family matrix, priority.
 * Read-only vs report configs / rendering / PDF filenames.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PDFDocument } from 'pdf-lib';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const QA = path.resolve(__dirname, '..');
const PDF_DIR = path.join(__dirname, 'pdfs');
const ROOT = path.resolve(__dirname, '../../../../../');

const EXPECTED = {
  catalogueEntries: 461,
  withDirectPdfUrl: 196,
  withNonPdfUrl: 49,
  nameOnlyNoUrl: 216,
  urlVerifiedLocal: 190,
  ambiguousPdfs: 6,
  mapped: 361,
  mappingAmbiguous: 55,
  unmapped: 45,
  uniquePdfsOnDisk: 196,
};

function loadJson(name) {
  return JSON.parse(fs.readFileSync(path.join(QA, name), 'utf8'));
}

function normalize(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/[–—]/g, '-')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function orientationOf(w, h) {
  if (!w || !h) return 'unknown';
  if (Math.abs(w - h) < 2) return 'square';
  return w > h ? 'landscape' : 'portrait';
}

function classifyFamily(fresaName, catalogueSection) {
  const n = normalize(fresaName);
  const sec = normalize(catalogueSection || '');

  if (/\bhbl\b/.test(n) || n.includes('house bill') || n.includes('bill of lading draft')) {
    if (n.includes('mbl') || n.includes('master bill')) return 'MBL';
    return 'HBL';
  }
  if (/\bhawb\b/.test(n) || n.includes('house air waybill')) return 'HAWB';
  if (/\bmawb\b/.test(n) || n.includes('master air waybill')) return 'MAWB';
  if (/\bmbl\b/.test(n) || n.includes('master bill of lading')) return 'MBL';

  if (n.includes('arrival notice') || n.includes('cargo arrival')) return 'Arrival notices';
  if (
    n.includes('delivery order') ||
    n.includes('delivery note') ||
    n.includes('proof of delivery') ||
    n.includes('edelivery') ||
    n.includes('e-delivery') ||
    n.includes('notice of delivery') ||
    n.includes('consignment delivery') ||
    n.includes('delivery confirmation') ||
    n.includes('delivery noc')
  ) {
    return 'Delivery orders';
  }
  if (n.includes('manifest') || n.includes('load plan') || n.includes('unload plan')) {
    return 'Cargo manifests';
  }
  if (
    n.includes('advance shipping') ||
    n.includes(' asn') ||
    n.startsWith('asn ') ||
    sec.includes('wms')
  ) {
    return 'Warehouse reports';
  }
  if (
    n.includes('invoice') ||
    n.includes('proforma') ||
    n.includes('debit note') ||
    n.includes('credit note')
  ) {
    return 'Invoices';
  }
  if (
    n.includes('payment voucher') ||
    n.includes('receipt voucher') ||
    n.includes('journal voucher')
  ) {
    return 'Accounting vouchers';
  }
  if (
    n.includes('trial balance') ||
    n.includes('profit and loss') ||
    n.includes('statement of accounts') ||
    n.includes('aging') ||
    n.includes('outstanding letter') ||
    n.includes('gl report') ||
    n.includes('gl listing') ||
    n.includes('bank cash')
  ) {
    return 'Financial statements';
  }
  if (
    n.includes('quotation') ||
    n.includes('booking confirmation') ||
    n.includes('pre alert') ||
    n.includes('prealert') ||
    n.includes('sailing confirmation') ||
    n.includes('shipping instruction') ||
    n.includes('stuffing') ||
    n.includes('carting') ||
    n.includes('pickup') ||
    n.includes('loading confirmation') ||
    n.includes('isf ') ||
    n.includes('security fill') ||
    n.includes('letter of guarantee') ||
    n.includes('surrendered') ||
    n.includes('fcr ') ||
    n.includes('vgm') ||
    n.includes('igm')
  ) {
    if (n.includes('air ') || n.includes('airway') || n.includes(' awb')) {
      return 'Air freight documents';
    }
    return 'Shipping documents';
  }
  if (n.includes('barcode awb') || n.includes('air quotation') || n.includes('air freight')) {
    return 'Air freight documents';
  }
  if (
    n.includes('list report') ||
    n.includes('daily status') ||
    n.includes('job list') ||
    n.includes('job card') ||
    n.includes('shipments with') ||
    n.includes('pending') ||
    n.includes('nomination')
  ) {
    return 'Operational reports';
  }
  if (n.includes('certificate') || n.includes('noc letter')) return 'Certificates';
  if (sec.includes('invoice')) return 'Invoices';
  if (sec.includes('accounts')) return 'Financial statements';
  if (sec.includes('arrival')) return 'Arrival notices';
  if (sec.includes('delivery')) return 'Delivery orders';
  if (sec.includes('hbl')) return 'HBL';
  if (sec.includes('hawb')) return 'HAWB';
  if (sec.includes('other')) return 'Operational reports';
  return 'Other specialized reports';
}

function expectedFamilyFromCode(code) {
  const c = String(code || '').toUpperCase();
  if (!c) return null;
  if (c.startsWith('HBL_') || c.includes('_HBL_')) return 'HBL';
  if (c.startsWith('HAWB_')) return 'HAWB';
  if (c.startsWith('MAWB_')) return 'MAWB';
  if (c.startsWith('MBL_')) return 'MBL';
  if (c.includes('ARRIVAL_NOTICE') || c.includes('CARGO_ARRIVAL')) return 'Arrival notices';
  if (
    c.includes('DELIVERY_ORDER') ||
    c.includes('DELIVERY_NOTE') ||
    c.includes('PROOF_OF_DELIVERY') ||
    c.includes('DELIVERY_CONFIRMATION')
  ) {
    return 'Delivery orders';
  }
  if (c.includes('MANIFEST') || c.includes('LOAD_PLAN')) return 'Cargo manifests';
  if (c.includes('ADVANCE_SHIPPING') || c.includes('ASN') || c.startsWith('WMS_')) {
    return 'Warehouse reports';
  }
  if (c.includes('INVOICE') || c.includes('PROFORMA') || c.includes('DEBIT_NOTE')) {
    return 'Invoices';
  }
  if (c.includes('VOUCHER')) return 'Accounting vouchers';
  if (
    c.includes('TRIAL_BALANCE') ||
    c.includes('PROFIT_AND_LOSS') ||
    c.includes('STATEMENT_OF_ACCOUNTS') ||
    c.includes('AGING') ||
    c.includes('OUTSTANDING')
  ) {
    return 'Financial statements';
  }
  if (c.includes('LIST_REPORT') || c.includes('DAILY_STATUS')) return 'Operational reports';
  if (c.includes('QUOTATION') || c.includes('BOOKING') || c.includes('PRE_ALERT')) {
    return c.includes('AIR') ? 'Air freight documents' : 'Shipping documents';
  }
  return null;
}

function nameCodeConsistencyIssue(fresaName, code) {
  if (!code) return null;
  const n = normalize(fresaName);
  const c = code.toUpperCase();
  const checks = [
    { name: /\bhawb\b/, code: /HAWB/, bad: 'HAWB name mapped to non-HAWB code' },
    { name: /\bhbl\b/, code: /HBL/, bad: 'HBL name mapped to non-HBL code' },
    { name: /\bmawb\b/, code: /MAWB/, bad: 'MAWB name mapped to non-MAWB code' },
    { name: /invoice/, code: /INVOICE|PROFORMA|DEBIT/, bad: 'Invoice-like name mapped away from invoice family' },
    { name: /arrival notice/, code: /ARRIVAL/, bad: 'Arrival notice mapped away from ARRIVAL code' },
    { name: /delivery order/, code: /DELIVERY/, bad: 'Delivery order mapped away from DELIVERY code' },
  ];
  for (const rule of checks) {
    if (rule.name.test(n) && !rule.code.test(c)) return rule.bad;
  }
  // Known catalogue bug: Job House Record Format-1 → mawb PDF
  if (/job house record list report format\s*1/.test(n) && /MAWB/.test(c)) {
    return 'Catalogue link/PDF appears to be MAWB while name is Job House Record';
  }
  if (/job house record list report format\s*1/.test(n) && c.includes('JOB_HOUSE')) {
    return 'Name is Job House Record but linked PDF may be MAWB — verify before use';
  }
  return null;
}

async function inspectPdf(absPath) {
  const bytes = fs.readFileSync(absPath);
  const fileSize = bytes.length;
  const result = {
    filename: path.basename(absPath),
    fileSizeBytes: fileSize,
    pageCount: null,
    pageDimensions: [],
    orientation: 'unknown',
    multiPage: false,
    textExtractionAvailable: false,
    likelyBlankOrStub: false,
    likelyPreprintedForm: false,
    inspectError: null,
    validPdf: false,
  };

  try {
    const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
    const pageCount = doc.getPageCount();
    result.pageCount = pageCount;
    result.multiPage = pageCount > 1;
    result.validPdf = true;

    const dims = [];
    let textOps = 0;
    let imageXObjects = 0;
    for (let i = 0; i < pageCount; i++) {
      const page = doc.getPage(i);
      const { width, height } = page.getSize();
      dims.push({
        page: i + 1,
        widthPt: Math.round(width * 100) / 100,
        heightPt: Math.round(height * 100) / 100,
        orientation: orientationOf(width, height),
      });
      try {
        const node = page.node;
        const contents = node.Contents();
        if (contents) textOps += 1;
        const resources = page.node.Resources();
        if (resources) {
          const xobj = resources.lookup?.(resources.dict?.get?.('XObject') ? undefined : undefined);
          // Heuristic via raw bytes of page content
        }
      } catch {
        /* ignore */
      }
    }
    result.pageDimensions = dims;
    result.orientation =
      dims.length === 0
        ? 'unknown'
        : dims.every((d) => d.orientation === 'landscape')
          ? 'landscape'
          : dims.every((d) => d.orientation === 'portrait')
            ? 'portrait'
            : 'mixed';

    // Text operators in content streams (rough)
    const raw = bytes.toString('latin1');
    const hasTj = /Tj|TJ|Td|Tm/.test(raw);
    const hasFont = /\/Font/.test(raw);
    const hasImage = /\/Image|\/XObject/.test(raw);
    result.textExtractionAvailable = hasTj && hasFont;
    imageXObjects = (raw.match(/\/Subtype\s*\/Image/g) || []).length;

    // Stub / blank heuristics — small file or almost no drawing ops
    const tiny = fileSize < 8000;
    const noOps = !hasTj && imageXObjects === 0 && fileSize < 20000;
    result.likelyBlankOrStub = tiny || noOps || pageCount === 0;

    // Preprinted: often has large image background, little text, or "preprinted" in name handled outside
    result.likelyPreprintedForm =
      (imageXObjects > 0 && !hasTj && fileSize > 15000) ||
      (imageXObjects >= 1 && hasTj && /pre.?print/i.test(path.basename(absPath)));
  } catch (err) {
    result.inspectError = String(err.message || err);
    result.likelyBlankOrStub = fileSize < 8000;
  }

  return result;
}

function prioritize(entries, mappings, pdfByRef, familyByRef) {
  const mapped = new Map(mappings.filter((m) => m.mappingStatus === 'mapped').map((m) => [m.referenceId, m]));
  const scored = [];

  for (const e of entries) {
    const map = mapped.get(e.referenceId);
    if (!map?.freightnestCode) continue;
    if (e.verificationStatus === 'ambiguous') continue;
    if (String(e.verificationStatus).includes('duplicate')) continue;
    if (!e.localPdfPath && !(e.sampleUrl || '').toLowerCase().endsWith('.pdf')) continue;

    const pdf = pdfByRef[e.referenceId];
    if (!pdf?.validPdf) continue;
    if (pdf.likelyBlankOrStub) continue;

    const family = familyByRef[e.referenceId];
    let score = 0;
    const reasons = [];

    // Reliable local PDF
    if (e.verificationStatus === 'url_verified_local' || e.downloadStatus === 'downloaded' || e.downloadStatus === 'cached') {
      score += 30;
      reasons.push('reliable_local_pdf');
    }
    if (map.mappingConfidence === 'exact_code_guess' || map.mappingConfidence === 'prior_verified_extraction') {
      score += 25;
      reasons.push('strong_mapping');
    } else if (map.mappingConfidence === 'high') {
      score += 15;
      reasons.push('high_mapping');
    } else {
      score += 5;
    }

    // Important freight docs
    const important = new Set([
      'HBL',
      'HAWB',
      'MAWB',
      'Arrival notices',
      'Delivery orders',
      'Invoices',
      'Cargo manifests',
      'Warehouse reports',
    ]);
    if (important.has(family)) {
      score += 20;
      reasons.push(`important_family:${family}`);
    }

    // Prefer multi-structure variety later — boost distinct families via diversity pass
    if (!pdf.likelyPreprintedForm) {
      score += 5;
      reasons.push('not_obvious_preprinted_stub');
    }
    if (pdf.textExtractionAvailable) {
      score += 5;
      reasons.push('text_ops_present');
    }
    if (pdf.pageCount === 1) {
      score += 3;
      reasons.push('single_page_simpler_first');
    }

    // Prefer canonical format numbers / draft-1 style
    if (/format[- ]?1\b/i.test(e.fresaName) || /format\s*1\b/i.test(e.fresaName)) {
      score += 4;
      reasons.push('format_1_representative');
    }

    scored.push({
      referenceId: e.referenceId,
      fresaName: e.fresaName,
      freightnestCode: map.freightnestCode,
      family,
      score,
      reasons,
      pdfFilename: pdf.filename,
      pageCount: pdf.pageCount,
      orientation: pdf.orientation,
      mappingConfidence: map.mappingConfidence,
    });
  }

  scored.sort((a, b) => b.score - a.score || a.fresaName.localeCompare(b.fresaName));

  // Diversity: pick top 10 covering different families where possible
  const picked = [];
  const usedFamilies = new Set();
  for (const row of scored) {
    if (picked.length >= 10) break;
    if (usedFamilies.has(row.family) && picked.length < 8) continue;
    picked.push(row);
    usedFamilies.add(row.family);
  }
  // Fill remaining slots by score
  for (const row of scored) {
    if (picked.length >= 10) break;
    if (picked.some((p) => p.referenceId === row.referenceId)) continue;
    picked.push(row);
  }
  return { ranked: scored.slice(0, 40), top10: picked.slice(0, 10) };
}

async function main() {
  const inventory = loadJson('FRESA_REFERENCE_INVENTORY.json');
  const mappingDoc = loadJson('FRESA_REFERENCE_MAPPING.json');
  const entries = inventory.entries || [];
  const mappings = mappingDoc.mappings || [];

  // --- Task 1: inventory validation ---
  const actual = {
    catalogueEntries: entries.length,
    withDirectPdfUrl: entries.filter((e) => e.sampleUrl && /\.pdf$/i.test(e.sampleUrl)).length,
    withNonPdfUrl: entries.filter((e) => e.sampleUrl && !/\.pdf$/i.test(e.sampleUrl)).length,
    nameOnlyNoUrl: entries.filter((e) => !e.sampleUrl).length,
    urlVerifiedLocal: entries.filter((e) => e.verificationStatus === 'url_verified_local').length,
    ambiguous: entries.filter((e) => e.verificationStatus === 'ambiguous').length,
    mapped: mappings.filter((m) => m.mappingStatus === 'mapped').length,
    mappingAmbiguous: mappings.filter((m) => m.mappingStatus === 'ambiguous').length,
    unmapped: mappings.filter((m) => m.mappingStatus === 'unmapped').length,
  };

  const pdfFiles = fs.existsSync(PDF_DIR)
    ? fs.readdirSync(PDF_DIR).filter((f) => f.toLowerCase().endsWith('.pdf'))
    : [];
  actual.uniquePdfsOnDisk = pdfFiles.length;

  const inventoryLocalPaths = new Set(
    entries.map((e) => e.localPdfPath).filter(Boolean).map((p) => path.basename(p)),
  );
  const orphansOnDisk = pdfFiles.filter((f) => !inventoryLocalPaths.has(f));
  const missingOnDisk = [...inventoryLocalPaths].filter((f) => !pdfFiles.includes(f));

  const discrepancies = [];
  for (const [k, v] of Object.entries(EXPECTED)) {
    if (k === 'ambiguousPdfs') {
      if (actual.ambiguous !== v) {
        discrepancies.push({
          field: k,
          expected: v,
          actual: actual.ambiguous,
        });
      }
      continue;
    }
    if (actual[k] !== v) {
      discrepancies.push({ field: k, expected: v, actual: actual[k] });
    }
  }
  if (orphansOnDisk.length) {
    discrepancies.push({
      field: 'pdfs_on_disk_not_in_inventory',
      expected: 0,
      actual: orphansOnDisk.length,
      samples: orphansOnDisk.slice(0, 10),
    });
  }
  if (missingOnDisk.length) {
    discrepancies.push({
      field: 'inventory_local_pdf_missing_on_disk',
      expected: 0,
      actual: missingOnDisk.length,
      samples: missingOnDisk.slice(0, 10),
    });
  }

  // --- Task 2: PDF inspection ---
  console.log(`Inspecting ${pdfFiles.length} PDFs…`);
  const pdfInspectionByFile = {};
  for (let i = 0; i < pdfFiles.length; i++) {
    const f = pdfFiles[i];
    pdfInspectionByFile[f] = await inspectPdf(path.join(PDF_DIR, f));
    if ((i + 1) % 40 === 0) console.log(`  ${i + 1}/${pdfFiles.length}`);
  }

  const pdfValidationEntries = [];
  const pdfByRef = {};
  for (const e of entries) {
    if (!e.sampleUrl || !/\.pdf$/i.test(e.sampleUrl)) continue;
    const fname = e.localPdfPath ? path.basename(e.localPdfPath) : null;
    const insp = fname ? pdfInspectionByFile[fname] : null;
    const row = {
      referenceId: e.referenceId,
      fresaName: e.fresaName,
      catalogueSection: e.catalogueSection,
      sampleUrl: e.sampleUrl,
      localPdfPath: e.localPdfPath,
      verificationStatus: e.verificationStatus,
      pdfFilename: fname,
      ...(insp || {
        validPdf: false,
        inspectError: fname ? 'file_not_found_on_disk' : 'no_local_pdf',
      }),
    };
    // Name-based preprinted hint
    if (/pre.?print/i.test(e.fresaName)) row.likelyPreprintedForm = true;
    pdfValidationEntries.push(row);
    pdfByRef[e.referenceId] = row;
  }

  const stubCount = pdfValidationEntries.filter((r) => r.likelyBlankOrStub).length;
  const preprintedCount = pdfValidationEntries.filter((r) => r.likelyPreprintedForm).length;
  const multiPageCount = pdfValidationEntries.filter((r) => r.multiPage).length;

  // --- Task 3: mapping validation (report only) ---
  const mappedRows = mappings.filter((m) => m.mappingStatus === 'mapped');
  const codeToRefs = new Map();
  const urlToRefs = new Map();
  const mappingIssues = [];

  for (const m of mappedRows) {
    const code = m.freightnestCode;
    if (!codeToRefs.has(code)) codeToRefs.set(code, []);
    codeToRefs.get(code).push(m.referenceId);

    if (m.sampleUrl) {
      if (!urlToRefs.has(m.sampleUrl)) urlToRefs.set(m.sampleUrl, []);
      urlToRefs.get(m.sampleUrl).push({
        referenceId: m.referenceId,
        fresaName: m.fresaName,
        freightnestCode: code,
      });
    }

    const consistency = nameCodeConsistencyIssue(m.fresaName, code);
    if (consistency) {
      mappingIssues.push({
        severity: 'high',
        type: 'possible_incorrect_mapping',
        referenceId: m.referenceId,
        fresaName: m.fresaName,
        freightnestCode: code,
        detail: consistency,
      });
    }

    const famName = classifyFamily(m.fresaName, entries.find((e) => e.referenceId === m.referenceId)?.catalogueSection);
    const famCode = expectedFamilyFromCode(code);
    if (famCode && famName !== famCode) {
      // Allow Shipping vs Air freight soft mismatches
      const soft = new Set(['Shipping documents', 'Air freight documents', 'Other specialized reports']);
      if (!(soft.has(famName) && soft.has(famCode))) {
        mappingIssues.push({
          severity: 'medium',
          type: 'family_mismatch',
          referenceId: m.referenceId,
          fresaName: m.fresaName,
          freightnestCode: code,
          detail: `Name family "${famName}" vs code family "${famCode}"`,
        });
      }
    }
  }

  const duplicateMappings = [];
  for (const [code, refs] of codeToRefs) {
    if (refs.length > 1) {
      duplicateMappings.push({
        freightnestCode: code,
        referenceIds: refs,
        count: refs.length,
        type: 'multiple_references_for_one_report',
      });
      mappingIssues.push({
        severity: 'medium',
        type: 'multiple_references_for_one_report',
        freightnestCode: code,
        referenceIds: refs,
        detail: `${refs.length} catalogue references map to the same FreightNest code`,
      });
    }
  }

  for (const [url, owners] of urlToRefs) {
    const codes = [...new Set(owners.map((o) => o.freightnestCode))];
    if (codes.length > 1) {
      mappingIssues.push({
        severity: 'high',
        type: 'one_reference_pdf_multiple_unrelated_codes',
        sampleUrl: url,
        freightnestCodes: codes,
        owners,
        detail: 'Same PDF URL assigned to multiple different FreightNest codes',
      });
    }
  }

  // Ambiguous catalogue names in mapping file
  for (const m of mappings.filter((x) => x.mappingStatus === 'ambiguous')) {
    mappingIssues.push({
      severity: 'medium',
      type: 'ambiguous_name',
      referenceId: m.referenceId,
      fresaName: m.fresaName,
      candidateCodes: m.candidateCodes,
      detail: 'Do not auto-resolve; needs human approval',
    });
  }

  // --- Task 4: family matrix ---
  const familyByRef = {};
  const familyMatrix = {};
  for (const e of entries) {
    const family = classifyFamily(e.fresaName, e.catalogueSection);
    familyByRef[e.referenceId] = family;
    if (!familyMatrix[family]) {
      familyMatrix[family] = {
        family,
        count: 0,
        withPdf: 0,
        mapped: 0,
        sampleReferenceIds: [],
      };
    }
    familyMatrix[family].count += 1;
    if (e.sampleUrl && /\.pdf$/i.test(e.sampleUrl)) familyMatrix[family].withPdf += 1;
    const map = mappings.find((m) => m.referenceId === e.referenceId);
    if (map?.mappingStatus === 'mapped') familyMatrix[family].mapped += 1;
    if (familyMatrix[family].sampleReferenceIds.length < 5) {
      familyMatrix[family].sampleReferenceIds.push(e.referenceId);
    }
  }

  const familyEntries = entries.map((e) => ({
    referenceId: e.referenceId,
    fresaName: e.fresaName,
    catalogueSection: e.catalogueSection,
    visualFamily: familyByRef[e.referenceId],
    hasPdf: Boolean(e.sampleUrl && /\.pdf$/i.test(e.sampleUrl)),
    freightnestCode:
      mappings.find((m) => m.referenceId === e.referenceId)?.freightnestCode || null,
    mappingStatus: mappings.find((m) => m.referenceId === e.referenceId)?.mappingStatus || null,
  }));

  // --- Task 5: priority ---
  const priority = prioritize(entries, mappings, pdfByRef, familyByRef);

  // Write deliverables
  const pdfValidation = {
    generatedAt: new Date().toISOString(),
    phase: 2,
    inventoryReconciliation: {
      expected: EXPECTED,
      actual,
      discrepancies,
      orphansOnDisk: orphansOnDisk.slice(0, 20),
      missingOnDisk: missingOnDisk.slice(0, 20),
      match: discrepancies.length === 0,
    },
    pdfSummary: {
      filesOnDisk: pdfFiles.length,
      inspected: Object.keys(pdfInspectionByFile).length,
      validPdf: Object.values(pdfInspectionByFile).filter((p) => p.validPdf).length,
      likelyBlankOrStub: Object.values(pdfInspectionByFile).filter((p) => p.likelyBlankOrStub).length,
      likelyPreprintedForm: Object.values(pdfInspectionByFile).filter((p) => p.likelyPreprintedForm)
        .length,
      multiPage: Object.values(pdfInspectionByFile).filter((p) => p.multiPage).length,
      portrait: Object.values(pdfInspectionByFile).filter((p) => p.orientation === 'portrait').length,
      landscape: Object.values(pdfInspectionByFile).filter((p) => p.orientation === 'landscape')
        .length,
      mixedOrientation: Object.values(pdfInspectionByFile).filter((p) => p.orientation === 'mixed')
        .length,
      textOpsPresent: Object.values(pdfInspectionByFile).filter((p) => p.textExtractionAvailable)
        .length,
      entryPdfRows: pdfValidationEntries.length,
      stubOrBlankAmongEntries: stubCount,
      preprintedAmongEntries: preprintedCount,
      multiPageAmongEntries: multiPageCount,
    },
    entries: pdfValidationEntries,
    byFilename: pdfInspectionByFile,
  };

  const mappingValidation = {
    generatedAt: new Date().toISOString(),
    phase: 2,
    counts: {
      mappedChecked: mappedRows.length,
      expectedMapped: EXPECTED.mapped,
      issues: mappingIssues.length,
      duplicateCodeBindings: duplicateMappings.length,
      ambiguousMappings: mappings.filter((m) => m.mappingStatus === 'ambiguous').length,
      unmapped: mappings.filter((m) => m.mappingStatus === 'unmapped').length,
    },
    note: 'Issues are reported only — mappings were NOT auto-changed.',
    duplicateMappings,
    issues: mappingIssues,
  };

  const familyMatrixDoc = {
    generatedAt: new Date().toISOString(),
    phase: 2,
    totalEntries: entries.length,
    families: Object.values(familyMatrix).sort((a, b) => b.count - a.count),
    entries: familyEntries,
  };

  // Issues markdown
  const issuesMd = [];
  issuesMd.push('# Fresa Reference Issues (Phase 2)');
  issuesMd.push('');
  issuesMd.push(`Generated: ${pdfValidation.generatedAt}`);
  issuesMd.push('');
  issuesMd.push('## Inventory reconciliation');
  issuesMd.push('');
  issuesMd.push('| Field | Expected | Actual |');
  issuesMd.push('|-------|--------:|-------:|');
  for (const [k, v] of Object.entries(EXPECTED)) {
    const a = k === 'ambiguousPdfs' ? actual.ambiguous : actual[k];
    const mark = a === v ? 'OK' : 'DIFF';
    issuesMd.push(`| ${k} | ${v} | ${a} (${mark}) |`);
  }
  issuesMd.push('');
  if (discrepancies.length) {
    issuesMd.push('### Discrepancies');
    issuesMd.push('');
    for (const d of discrepancies) {
      issuesMd.push(
        `- **${d.field}**: expected ${d.expected}, actual ${d.actual}${d.samples ? ` — samples: ${d.samples.join(', ')}` : ''}`,
      );
    }
  } else {
    issuesMd.push('_No count discrepancies against Phase-1 summary._');
  }
  issuesMd.push('');
  issuesMd.push('## PDF quality flags');
  issuesMd.push('');
  issuesMd.push(`- Likely blank/stub PDFs (by file): ${pdfValidation.pdfSummary.likelyBlankOrStub}`);
  issuesMd.push(`- Likely preprinted (heuristic): ${pdfValidation.pdfSummary.likelyPreprintedForm}`);
  issuesMd.push(`- Multi-page: ${pdfValidation.pdfSummary.multiPage}`);
  issuesMd.push('');
  const stubs = Object.values(pdfInspectionByFile)
    .filter((p) => p.likelyBlankOrStub)
    .slice(0, 30);
  issuesMd.push('### Sample stub/blank candidates');
  issuesMd.push('');
  for (const s of stubs) {
    issuesMd.push(`- \`${s.filename}\` — ${s.fileSizeBytes} bytes, pages=${s.pageCount}`);
  }
  issuesMd.push('');
  issuesMd.push('## Mapping issues (not auto-fixed)');
  issuesMd.push('');
  issuesMd.push(`Total issues logged: ${mappingIssues.length}`);
  issuesMd.push('');
  const high = mappingIssues.filter((i) => i.severity === 'high').slice(0, 40);
  for (const i of high) {
    issuesMd.push(
      `- **${i.type}** (${i.severity}): ${i.fresaName || i.freightnestCode || i.referenceId} — ${i.detail}`,
    );
  }
  issuesMd.push('');
  issuesMd.push('## Missing references');
  issuesMd.push('');
  issuesMd.push(`- Name-only (no URL): ${actual.nameOnlyNoUrl}`);
  issuesMd.push(`- Non-PDF links: ${actual.withNonPdfUrl}`);
  issuesMd.push(`- Mapping ambiguous: ${actual.mappingAmbiguous}`);
  issuesMd.push(`- Unmapped: ${actual.unmapped}`);
  issuesMd.push('');
  issuesMd.push('See also `FRESA_MISSING_REFERENCES.md` (Phase 1).');
  issuesMd.push('');
  issuesMd.push('## Config safety');
  issuesMd.push('');
  issuesMd.push('- Existing report JSON configurations: **unchanged**');
  issuesMd.push('- Report IDs/codes: **unchanged**');
  issuesMd.push('- Reference PDF filenames: **unchanged**');
  issuesMd.push('- Rendering components: **unchanged**');
  issuesMd.push('- Ambiguous mappings: **not auto-resolved**');

  // Priority markdown
  const priMd = [];
  priMd.push('# Fresa Implementation Priority (Phase 2)');
  priMd.push('');
  priMd.push('Do **not** implement layouts in this phase. Recommendation only.');
  priMd.push('');
  priMd.push('## First 10 reports');
  priMd.push('');
  priMd.push('| # | FreightNest code | Fresa name | Family | Pages | Orient | Score | Why |');
  priMd.push('|---|------------------|------------|--------|------:|--------|------:|-----|');
  priority.top10.forEach((r, idx) => {
    priMd.push(
      `| ${idx + 1} | \`${r.freightnestCode}\` | ${r.fresaName} | ${r.family} | ${r.pageCount} | ${r.orientation} | ${r.score} | ${r.reasons.join(', ')} |`,
    );
  });
  priMd.push('');
  priMd.push('## Selection criteria');
  priMd.push('');
  priMd.push('- Reliable local PDF (not stub/ambiguous)');
  priMd.push('- Strong FreightNest mapping');
  priMd.push('- Important freight-forwarding document families');
  priMd.push('- Visual structure diversity across the top 10');
  priMd.push('- Prefer Format-1 / representative layouts when available');
  priMd.push('');
  priMd.push('## Next candidates (11–20 from ranked list)');
  priMd.push('');
  for (const r of priority.ranked.slice(10, 20)) {
    priMd.push(`- \`${r.freightnestCode}\` — ${r.fresaName} (${r.family}, score ${r.score})`);
  }

  fs.writeFileSync(path.join(QA, 'FRESA_PDF_VALIDATION.json'), JSON.stringify(pdfValidation, null, 2));
  fs.writeFileSync(
    path.join(QA, 'FRESA_MAPPING_VALIDATION.json'),
    JSON.stringify(mappingValidation, null, 2),
  );
  fs.writeFileSync(
    path.join(QA, 'FRESA_REPORT_FAMILY_MATRIX.json'),
    JSON.stringify(familyMatrixDoc, null, 2),
  );
  fs.writeFileSync(path.join(QA, 'FRESA_REFERENCE_ISSUES.md'), issuesMd.join('\n'));
  fs.writeFileSync(path.join(QA, 'FRESA_IMPLEMENTATION_PRIORITY.md'), priMd.join('\n'));

  // Console summary for final response
  console.log(
    JSON.stringify(
      {
        reconciliation: { expected: EXPECTED, actual, discrepancyCount: discrepancies.length },
        pdfSummary: pdfValidation.pdfSummary,
        mappingIssueCount: mappingIssues.length,
        highMappingIssues: high.length,
        families: Object.values(familyMatrix)
          .sort((a, b) => b.count - a.count)
          .map((f) => ({ family: f.family, count: f.count, withPdf: f.withPdf })),
        top10: priority.top10.map((r) => ({
          code: r.freightnestCode,
          name: r.fresaName,
          family: r.family,
          score: r.score,
        })),
        configsUnchanged: true,
      },
      null,
      2,
    ),
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
