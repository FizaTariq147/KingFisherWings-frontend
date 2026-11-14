/**
 * One-shot collector: parse official Fresa sample-report-formats scrape,
 * map to FreightNest registry codes, download PDF binaries locally,
 * emit FRESA_REFERENCE_*.json/md.
 *
 * Does NOT modify report configuration sources.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../../../../');
const OUT_DIR = __dirname;
const PDF_DIR = path.join(OUT_DIR, 'pdfs');
const SCRAPE =
  process.env.FRESA_SCRAPE_PATH ||
  path.join(
    process.env.USERPROFILE || '',
    '.cursor/projects/d-KingFisherWings-frontend/agent-tools/b5648a84-6018-4885-82ac-0ba225e8465f.txt',
  );

const SOURCE_URL = 'https://fresatechnologies.com/sample-report-formats/';
const GENERATED = path.join(ROOT, 'src/features/reports/data/fresaReportRegistry.generated.ts');

function normalizeName(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/[–—]/g, '-')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function nameToCodeGuess(name) {
  return normalizeName(name)
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '')
    .toUpperCase();
}

function decodeUrl(u) {
  try {
    let x = u.replace(/%5F/gi, '_').replace(/\\_/g, '_');
    x = decodeURIComponent(x);
    return x.split('?')[0];
  } catch {
    return u.split('?')[0];
  }
}

function loadRegistryCodes() {
  const text = fs.readFileSync(GENERATED, 'utf8');
  const codes = [];
  const re = /"code":\s*"([^"]+)"/g;
  let m;
  while ((m = re.exec(text))) codes.push(m[1]);
  const names = new Map();
  const nameRe = /"code":\s*"([^"]+)"[\s\S]*?"name":\s*"([^"]*)"/g;
  while ((m = nameRe.exec(text))) names.set(m[1], m[2]);
  return { codes, names };
}

function scoreMatch(fresaName, code, registryName) {
  const a = normalizeName(fresaName);
  const b = normalizeName(registryName || code.replace(/_/g, ' '));
  if (!a || !b) return 0;
  if (a === b) return 100;
  if (b.includes(a) || a.includes(b)) return 85;
  const at = new Set(a.split(' ').filter((t) => t.length > 2));
  const bt = new Set(b.split(' ').filter((t) => t.length > 2));
  let inter = 0;
  for (const t of at) if (bt.has(t)) inter++;
  const union = new Set([...at, ...bt]).size || 1;
  return Math.round((inter / union) * 70);
}

function mapToFreightnest(fresaName, registry) {
  const guess = nameToCodeGuess(fresaName);
  const exact = registry.codes.find((c) => c === guess);
  if (exact) {
    return {
      freightnestCode: exact,
      freightnestName: registry.names.get(exact) || exact,
      mappingConfidence: 'exact_code_guess',
      mappingStatus: 'mapped',
    };
  }

  let best = null;
  let bestScore = 0;
  const candidates = [];
  for (const code of registry.codes) {
    const score = scoreMatch(fresaName, code, registry.names.get(code));
    if (score >= 70) candidates.push({ code, score });
    if (score > bestScore) {
      bestScore = score;
      best = code;
    }
  }
  candidates.sort((a, b) => b.score - a.score);

  if (candidates.length > 1 && candidates[0].score - candidates[1].score < 8) {
    return {
      freightnestCode: null,
      freightnestName: null,
      mappingConfidence: 'ambiguous',
      mappingStatus: 'ambiguous',
      candidateCodes: candidates.slice(0, 5).map((c) => c.code),
    };
  }
  if (best && bestScore >= 78) {
    return {
      freightnestCode: best,
      freightnestName: registry.names.get(best) || best,
      mappingConfidence: bestScore >= 95 ? 'high' : 'medium',
      mappingStatus: 'mapped',
      matchScore: bestScore,
    };
  }
  if (best && bestScore >= 60) {
    return {
      freightnestCode: null,
      freightnestName: null,
      mappingConfidence: 'low',
      mappingStatus: 'ambiguous',
      candidateCodes: candidates.slice(0, 5).map((c) => c.code),
      matchScore: bestScore,
    };
  }
  return {
    freightnestCode: null,
    freightnestName: null,
    mappingConfidence: 'unmapped',
    mappingStatus: 'unmapped',
  };
}

function parseScrape(text) {
  const entries = [];
  const seen = new Set();

  // Markdown links in main table / body
  const linkRe = /\[([^\]]+)\]\((https?:\/\/fresatechnologies\.com[^)\s]+)\)/g;
  let m;
  while ((m = linkRe.exec(text))) {
    const fresaName = m[1].trim();
    const sampleUrl = decodeUrl(m[2]);
    const key = `${normalizeName(fresaName)}|${sampleUrl}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const ext = path.extname(new URL(sampleUrl).pathname).toLowerCase();
    entries.push({
      fresaName,
      sampleUrl,
      fileType: ext.replace('.', '') || 'unknown',
      sourceColumn: 'page_link',
    });
  }

  // Named section lists without links (Invoice Formats, Arrival Notice, …)
  const sectionHeaders = [
    'Invoice Formats',
    'Accounts other Formats',
    'Arrival Notice',
    'HBL',
    'HAWB',
    'Delivery order',
    'WMS – ASN',
    'WMS - ASN',
    'Other Reports',
  ];
  const lines = text.split(/\r?\n/);
  let currentSection = null;
  for (const line of lines) {
    const h = line.match(/^###\s+\*{0,2}(.+?)\*{0,2}\s*$/);
    if (h) {
      const title = h[1].replace(/\*/g, '').trim();
      currentSection = sectionHeaders.find(
        (s) => normalizeName(s) === normalizeName(title),
      )
        ? title
        : currentSection && sectionHeaders.some((s) => normalizeName(s) === normalizeName(title))
          ? title
          : sectionHeaders.find((s) => normalizeName(title).includes(normalizeName(s)))
            ? title
            : null;
      if (sectionHeaders.some((s) => normalizeName(s) === normalizeName(title))) {
        currentSection = title;
      } else if (title === 'Accounts') {
        currentSection = null;
      }
      continue;
    }
    if (!currentSection) continue;
    const item = line.match(/^\d+\.\s+(.+)$/);
    if (!item) continue;
    const fresaName = item[1].trim();
    const key = `${normalizeName(fresaName)}|section`;
    // Prefer existing linked entry if same name
    const existing = entries.find((e) => normalizeName(e.fresaName) === normalizeName(fresaName));
    if (existing) {
      existing.catalogueSection = currentSection;
      continue;
    }
    if (seen.has(key)) continue;
    seen.add(key);
    entries.push({
      fresaName,
      sampleUrl: null,
      fileType: null,
      sourceColumn: 'section_list_name_only',
      catalogueSection: currentSection,
    });
  }

  // Infer section from name heuristics for linked rows without section
  for (const e of entries) {
    if (e.catalogueSection) continue;
    const n = normalizeName(e.fresaName);
    if (n.includes('invoice') || n.includes('proforma') || n.includes('debit note')) {
      e.catalogueSection = 'Invoice Formats';
    } else if (n.includes('hawb')) e.catalogueSection = 'HAWB';
    else if (n.includes('hbl') || n.includes('bill of lading')) e.catalogueSection = 'HBL';
    else if (n.includes('arrival notice') || n.includes('cargo arrival')) {
      e.catalogueSection = 'Arrival Notice';
    } else if (n.includes('delivery order') || n.includes('delivery note') || n.includes('proof of delivery')) {
      e.catalogueSection = 'Delivery order';
    } else if (n.includes('advance shipping') || n.includes('asn')) e.catalogueSection = 'WMS – ASN';
    else if (
      n.includes('voucher') ||
      n.includes('trial balance') ||
      n.includes('outstanding') ||
      n.includes('profit and loss') ||
      n.includes('statement of accounts') ||
      n.includes('aging')
    ) {
      e.catalogueSection = 'Accounts other Formats';
    } else if (n.includes('list report') || n.includes('daily status')) {
      e.catalogueSection = 'Other Reports';
    } else {
      e.catalogueSection = 'Uncategorized (page table)';
    }
  }

  // Supplemental verified URLs from prior HAWB/WMS/DO extraction (do not invent).
  const supplementalTs = path.join(
    ROOT,
    'src/features/reports/data/fresaOfficialSampleCatalogue.ts',
  );
  if (fs.existsSync(supplementalTs)) {
    const ts = fs.readFileSync(supplementalTs, 'utf8');
    const blockRe =
      /fresaName:\s*'([^']+)'[\s\S]*?samplePdfUrl:\s*`([^`]+)`[\s\S]*?freightnestCode:\s*'([^']+)'/g;
    let sm;
    while ((sm = blockRe.exec(ts))) {
      const fresaName = sm[1];
      const sampleUrl = sm[2].replace(/\$\{HAWB_BASE\}/g, 'https://fresatechnologies.com/wp-content/uploads/report-formats/')
        .replace(/\$\{WMS_BASE\}/g, 'https://fresatechnologies.com/wp-content/uploads/2020/03/')
        .replace(
          /\$\{DO_BASE\}/g,
          'https://fresatechnologies.com/wp-content/fresa-std-files/fresagold/sample_reports/',
        );
      // Template literals already expanded in source as full URLs for constants — handle both.
      const url = sampleUrl.includes('${') ? null : sampleUrl;
      if (!url) continue;
      const key = `${normalizeName(fresaName)}|${url}`;
      if (seen.has(key)) continue;
      const existing = entries.find((e) => normalizeName(e.fresaName) === normalizeName(fresaName));
      if (existing) {
        if (!existing.sampleUrl) existing.sampleUrl = url;
        continue;
      }
      seen.add(key);
      entries.push({
        fresaName,
        sampleUrl: url,
        fileType: 'pdf',
        sourceColumn: 'prior_verified_extraction',
        catalogueSection: /hawb/i.test(fresaName)
          ? 'HAWB'
          : /shipping note|asn/i.test(fresaName)
            ? 'WMS – ASN'
            : 'Delivery order',
        knownFreightnestCode: sm[3],
      });
    }
  }

  return entries;
}

function classifyReference(entry, mapping, urlOwners) {
  const issues = [];
  let verificationStatus = 'pending';

  if (!entry.sampleUrl) {
    verificationStatus = 'unavailable';
    issues.push('no_direct_url_on_catalogue_page');
  } else if (!/\.pdf$/i.test(entry.sampleUrl)) {
    verificationStatus = 'non_pdf_reference';
    issues.push(`file_type_${entry.fileType || 'unknown'}`);
  } else {
    verificationStatus = 'url_listed';
  }

  // Ambiguous page link: Job House Record Format-1 points at MAWB PDF
  if (
    /job house record list report format-?\s*1/i.test(entry.fresaName) &&
    /mawb-draft/i.test(entry.sampleUrl || '')
  ) {
    verificationStatus = 'ambiguous';
    issues.push('catalogue_name_points_to_mawb_pdf');
  }

  if (mapping.mappingStatus === 'ambiguous') {
    if (verificationStatus === 'url_listed') verificationStatus = 'ambiguous';
    issues.push('multiple_freightnest_code_candidates');
  }
  if (mapping.mappingStatus === 'unmapped') {
    issues.push('no_freightnest_code_match');
  }

  // Duplicate URL used by multiple distinct catalogue names
  if (entry.sampleUrl && urlOwners.get(entry.sampleUrl)?.length > 1) {
    issues.push('duplicate_url_shared_by_multiple_catalogue_names');
    if (verificationStatus === 'url_listed') verificationStatus = 'duplicate_url';
  }

  return { verificationStatus, issues };
}

async function downloadPdf(url, dest) {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'FreightNest-FresaReferenceCollector/1.0' },
    redirect: 'follow',
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 100) throw new Error('empty_or_tiny_body');
  // PDF magic
  const head = buf.subarray(0, 5).toString('utf8');
  if (!head.startsWith('%PDF')) throw new Error(`not_pdf_magic:${head}`);
  fs.writeFileSync(dest, buf);
  return buf.length;
}

function safeFileName(url, index) {
  const base = path.basename(new URL(url).pathname) || `ref-${index}.pdf`;
  return base.replace(/[^a-zA-Z0-9._-]+/g, '_').slice(0, 180);
}

async function main() {
  if (!fs.existsSync(SCRAPE)) {
    console.error('Scrape file missing:', SCRAPE);
    process.exit(1);
  }
  fs.mkdirSync(PDF_DIR, { recursive: true });

  const scrapeText = fs.readFileSync(SCRAPE, 'utf8');
  const registry = loadRegistryCodes();
  const rawEntries = parseScrape(scrapeText);

  // Build URL ownership for duplicate detection
  const urlOwners = new Map();
  for (const e of rawEntries) {
    if (!e.sampleUrl) continue;
    if (!urlOwners.has(e.sampleUrl)) urlOwners.set(e.sampleUrl, []);
    urlOwners.get(e.sampleUrl).push(e.fresaName);
  }

  const inventory = [];
  const mapping = [];
  let idSeq = 0;

  for (const e of rawEntries) {
    idSeq += 1;
    const refId = `FRESA-REF-${String(idSeq).padStart(4, '0')}`;
    let map = mapToFreightnest(e.fresaName, registry);
    if (e.knownFreightnestCode && registry.codes.includes(e.knownFreightnestCode)) {
      map = {
        freightnestCode: e.knownFreightnestCode,
        freightnestName: registry.names.get(e.knownFreightnestCode) || e.knownFreightnestCode,
        mappingConfidence: 'prior_verified_extraction',
        mappingStatus: 'mapped',
      };
    }
    const { verificationStatus, issues } = classifyReference(e, map, urlOwners);

    const row = {
      referenceId: refId,
      fresaName: e.fresaName,
      catalogueSection: e.catalogueSection,
      sampleUrl: e.sampleUrl,
      fileType: e.fileType,
      source: SOURCE_URL,
      sourceColumn: e.sourceColumn,
      verificationStatus,
      issues,
      pageCount: null,
      localPdfPath: null,
      localPdfBytes: null,
      downloadStatus: e.sampleUrl && /\.pdf$/i.test(e.sampleUrl) ? 'pending' : 'skipped',
    };
    inventory.push(row);
    mapping.push({
      referenceId: refId,
      fresaName: e.fresaName,
      sampleUrl: e.sampleUrl,
      freightnestCode: map.freightnestCode,
      freightnestName: map.freightnestName,
      mappingStatus: map.mappingStatus,
      mappingConfidence: map.mappingConfidence,
      matchScore: map.matchScore ?? null,
      candidateCodes: map.candidateCodes || [],
      notes:
        map.mappingStatus === 'mapped'
          ? 'Name/code heuristic match — confirm before implementing layout'
          : map.mappingStatus === 'ambiguous'
            ? 'Do not bind a reference PDF until mapping is explicitly approved'
            : 'No FreightNest registry code matched — do not fabricate',
    });
  }

  // Download PDFs (only distinct URLs; each file kept once; inventory points to shared path if duplicate URL)
  const urlToLocal = new Map();
  const pdfUrls = [
    ...new Set(
      inventory
        .filter((r) => r.sampleUrl && /\.pdf$/i.test(r.sampleUrl) && r.verificationStatus !== 'ambiguous')
        .map((r) => r.sampleUrl),
    ),
  ];

  // Also download ambiguous PDFs but mark status separately (preserve locally still)
  const ambiguousPdfUrls = [
    ...new Set(
      inventory
        .filter((r) => r.sampleUrl && /\.pdf$/i.test(r.sampleUrl) && r.verificationStatus === 'ambiguous')
        .map((r) => r.sampleUrl),
    ),
  ];

  const allDownload = [...new Set([...pdfUrls, ...ambiguousPdfUrls])];
  console.log(`Downloading ${allDownload.length} unique PDF URLs…`);

  let i = 0;
  for (const url of allDownload) {
    i += 1;
    const fname = safeFileName(url, i);
    const dest = path.join(PDF_DIR, fname);
    const rel = path.relative(ROOT, dest).replace(/\\/g, '/');
    try {
      if (fs.existsSync(dest) && fs.statSync(dest).size > 100) {
        urlToLocal.set(url, { path: rel, bytes: fs.statSync(dest).size, status: 'cached' });
        console.log(`[${i}/${allDownload.length}] cached ${fname}`);
        continue;
      }
      const bytes = await downloadPdf(url, dest);
      urlToLocal.set(url, { path: rel, bytes, status: 'downloaded' });
      console.log(`[${i}/${allDownload.length}] ok ${fname} (${bytes} bytes)`);
    } catch (err) {
      urlToLocal.set(url, { path: null, bytes: null, status: 'broken', error: String(err.message || err) });
      console.warn(`[${i}/${allDownload.length}] FAIL ${url}: ${err.message}`);
    }
  }

  for (const row of inventory) {
    if (!row.sampleUrl || !/\.pdf$/i.test(row.sampleUrl)) continue;
    const local = urlToLocal.get(row.sampleUrl);
    if (!local) continue;
    if (local.status === 'broken') {
      row.verificationStatus = 'broken';
      row.downloadStatus = 'broken';
      row.issues = [...new Set([...(row.issues || []), 'download_failed', local.error].filter(Boolean))];
      row.localPdfPath = null;
    } else {
      row.localPdfPath = local.path;
      row.localPdfBytes = local.bytes;
      row.downloadStatus = local.status;
      if (row.verificationStatus === 'url_listed' || row.verificationStatus === 'duplicate_url') {
        row.verificationStatus =
          row.verificationStatus === 'duplicate_url' ? 'duplicate_url_local_preserved' : 'url_verified_local';
      }
    }
  }

  const summary = {
    sourceUrl: SOURCE_URL,
    generatedAt: new Date().toISOString(),
    registryCodes: registry.codes.length,
    catalogueEntries: inventory.length,
    withDirectPdfUrl: inventory.filter((r) => r.sampleUrl && /\.pdf$/i.test(r.sampleUrl)).length,
    withNonPdfUrl: inventory.filter((r) => r.sampleUrl && !/\.pdf$/i.test(r.sampleUrl)).length,
    nameOnlyNoUrl: inventory.filter((r) => !r.sampleUrl).length,
    urlVerifiedLocal: inventory.filter((r) => r.verificationStatus === 'url_verified_local').length,
    broken: inventory.filter((r) => r.verificationStatus === 'broken').length,
    ambiguous: inventory.filter((r) => r.verificationStatus === 'ambiguous').length,
    duplicateUrl: inventory.filter((r) => String(r.verificationStatus).includes('duplicate')).length,
    mapped: mapping.filter((m) => m.mappingStatus === 'mapped').length,
    mappingAmbiguous: mapping.filter((m) => m.mappingStatus === 'ambiguous').length,
    unmapped: mapping.filter((m) => m.mappingStatus === 'unmapped').length,
    uniquePdfUrlsDownloaded: [...urlToLocal.values()].filter((v) => v.status !== 'broken').length,
    rules: [
      'Official Fresa catalogue is source of truth',
      'Never fabricate missing reference documents',
      'Never use one report reference PDF for another',
      'Do not modify report configurations during collection',
      'Implement layouts only when correct reference is available or explicitly approved',
    ],
  };

  const inventoryDoc = {
    ...summary,
    categories: [...new Set(inventory.map((r) => r.catalogueSection))].sort(),
    entries: inventory,
  };

  const mappingDoc = {
    generatedAt: summary.generatedAt,
    sourceUrl: SOURCE_URL,
    summary: {
      mapped: summary.mapped,
      ambiguous: summary.mappingAmbiguous,
      unmapped: summary.unmapped,
    },
    mappings: mapping,
  };

  fs.writeFileSync(
    path.join(OUT_DIR, 'FRESA_REFERENCE_INVENTORY.json'),
    JSON.stringify(inventoryDoc, null, 2),
  );
  fs.writeFileSync(
    path.join(OUT_DIR, 'FRESA_REFERENCE_MAPPING.json'),
    JSON.stringify(mappingDoc, null, 2),
  );

  // Missing references markdown
  const missing = inventory.filter(
    (r) =>
      !r.sampleUrl ||
      r.verificationStatus === 'unavailable' ||
      r.verificationStatus === 'broken' ||
      r.verificationStatus === 'ambiguous' ||
      String(r.verificationStatus).includes('duplicate'),
  );
  const unmappedMaps = mapping.filter((m) => m.mappingStatus !== 'mapped');

  const md = [];
  md.push('# Fresa Missing / Incomplete References');
  md.push('');
  md.push(`Source: ${SOURCE_URL}`);
  md.push(`Generated: ${summary.generatedAt}`);
  md.push('');
  md.push('## Rules');
  md.push('');
  for (const r of summary.rules) md.push(`- ${r}`);
  md.push('');
  md.push('## Summary');
  md.push('');
  md.push(`| Metric | Count |`);
  md.push(`|--------|------:|`);
  md.push(`| Catalogue entries collected | ${summary.catalogueEntries} |`);
  md.push(`| Direct PDF URLs listed | ${summary.withDirectPdfUrl} |`);
  md.push(`| Non-PDF links (xlsx etc.) | ${summary.withNonPdfUrl} |`);
  md.push(`| Name-only (no URL on page) | ${summary.nameOnlyNoUrl} |`);
  md.push(`| Local PDF preserved | ${summary.urlVerifiedLocal} |`);
  md.push(`| Broken downloads | ${summary.broken} |`);
  md.push(`| Ambiguous references | ${summary.ambiguous} |`);
  md.push(`| Duplicate URL sharing | ${summary.duplicateUrl} |`);
  md.push(`| FreightNest mapped | ${summary.mapped} |`);
  md.push(`| Mapping ambiguous | ${summary.mappingAmbiguous} |`);
  md.push(`| Unmapped to registry | ${summary.unmapped} |`);
  md.push('');
  md.push('## Unavailable (no direct URL on catalogue page)');
  md.push('');
  const unavailable = inventory.filter((r) => !r.sampleUrl);
  md.push(`Count: ${unavailable.length}`);
  md.push('');
  for (const r of unavailable.slice(0, 200)) {
    md.push(`- \`${r.referenceId}\` — ${r.fresaName} (${r.catalogueSection})`);
  }
  if (unavailable.length > 200) md.push(`- … and ${unavailable.length - 200} more`);
  md.push('');
  md.push('## Broken downloads');
  md.push('');
  const broken = inventory.filter((r) => r.verificationStatus === 'broken');
  if (!broken.length) md.push('_None in this pass._');
  for (const r of broken) {
    md.push(`- \`${r.referenceId}\` — ${r.fresaName}`);
    md.push(`  - URL: ${r.sampleUrl}`);
    md.push(`  - Issues: ${(r.issues || []).join(', ')}`);
  }
  md.push('');
  md.push('## Ambiguous references (do not use for layout until approved)');
  md.push('');
  const amb = inventory.filter((r) => r.verificationStatus === 'ambiguous');
  for (const r of amb) {
    const mapRow = mapping.find((m) => m.referenceId === r.referenceId);
    md.push(`- \`${r.referenceId}\` — ${r.fresaName}`);
    md.push(`  - URL: ${r.sampleUrl || '(none)'}`);
    md.push(`  - Issues: ${(r.issues || []).join(', ')}`);
    if (mapRow?.candidateCodes?.length) {
      md.push(`  - Candidate FreightNest codes: ${mapRow.candidateCodes.join(', ')}`);
    }
  }
  md.push('');
  md.push('## Duplicate URL (same PDF linked to multiple catalogue names)');
  md.push('');
  const dups = inventory.filter((r) => String(r.verificationStatus).includes('duplicate'));
  const byUrl = new Map();
  for (const r of dups) {
    if (!r.sampleUrl) continue;
    if (!byUrl.has(r.sampleUrl)) byUrl.set(r.sampleUrl, []);
    byUrl.get(r.sampleUrl).push(r.fresaName);
  }
  if (!byUrl.size) md.push('_None flagged beyond shared local preservation._');
  for (const [url, names] of byUrl) {
    md.push(`- URL: ${url}`);
    for (const n of names) md.push(`  - ${n}`);
  }
  md.push('');
  md.push('## Unmapped / ambiguous FreightNest code bindings');
  md.push('');
  md.push(`Count: ${unmappedMaps.length} (see FRESA_REFERENCE_MAPPING.json)`);
  md.push('');
  md.push('## Non-PDF catalogue links');
  md.push('');
  const nonPdf = inventory.filter((r) => r.sampleUrl && !/\.pdf$/i.test(r.sampleUrl));
  md.push(`Count: ${nonPdf.length} — tracked as references but not layout PDF sources.`);
  md.push('');
  md.push('## Next actions');
  md.push('');
  md.push('1. Manually resolve ambiguous mappings before any layout work.');
  md.push('2. Extract remaining name-only section entries’ direct PDF URLs from Fresa (if published).');
  md.push('3. Re-run this collector after scrape refresh; do not invent missing PDFs.');
  md.push('4. Keep `pdfs/` as the local preserved store for verified downloads.');

  fs.writeFileSync(path.join(OUT_DIR, 'FRESA_MISSING_REFERENCES.md'), md.join('\n'));

  // Also copy deliverables to qa/ root aliases requested by user
  fs.copyFileSync(
    path.join(OUT_DIR, 'FRESA_REFERENCE_INVENTORY.json'),
    path.join(path.dirname(OUT_DIR), 'FRESA_REFERENCE_INVENTORY.json'),
  );
  fs.copyFileSync(
    path.join(OUT_DIR, 'FRESA_REFERENCE_MAPPING.json'),
    path.join(path.dirname(OUT_DIR), 'FRESA_REFERENCE_MAPPING.json'),
  );
  fs.copyFileSync(
    path.join(OUT_DIR, 'FRESA_MISSING_REFERENCES.md'),
    path.join(path.dirname(OUT_DIR), 'FRESA_MISSING_REFERENCES.md'),
  );

  console.log(JSON.stringify(summary, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
