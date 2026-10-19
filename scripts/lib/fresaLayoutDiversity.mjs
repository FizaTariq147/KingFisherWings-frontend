/**
 * Structural diversity for FRESA sample-report-formats layouts.
 * Prefers name-driven Fresa profiles (Tax India / USA / Arabic / without charges…)
 * then falls back to unique combinatorial blocks.
 */

import { fresaNameProfile } from './fresaNameProfiles.mjs';

export const HEADER_ROTATION = ['primary', 'accent', 'fill', 'orange', 'cyan'];

/** Optional body blocks — bit-selected per seed for combinatorial uniqueness. */
const OPTIONAL_POOL = [
  { type: 'formatBadge' },
  { type: 'letterBody' },
  { type: 'summaryHero' },
  { type: 'exportMetaStrip' },
  { type: 'containerStrip' },
  { type: 'agingSummary' },
  { type: 'wireBox' },
  { type: 'usaNumberedFields' },
  { type: 'outstandingTable' },
  { type: 'jobDescription' },
  { type: 'stampSignature' },
  { type: 'taxAmountBox' },
];

export function blockSignature(blocks) {
  return (blocks || [])
    .map((b) => {
      if (!b || typeof b !== 'object') return String(b);
      const parts = [b.type];
      if (b.headerColor) parts.push(b.headerColor);
      if (b.cols != null) parts.push(`c${b.cols}`);
      if (b.align) parts.push(b.align);
      if (b.band) parts.push('band');
      if (b.showContact) parts.push('contact');
      if (b.variant) parts.push(b.variant);
      return parts.join(':');
    })
    .join('>');
}

function pickOptionals(seed) {
  const out = [];
  for (let i = 0; i < OPTIONAL_POOL.length; i += 1) {
    // Unique combination: bit from seed + rotate force-include one optional
    const bit = (seed >> i) & 1;
    const force = seed % OPTIONAL_POOL.length === i;
    if (bit || force) out.push({ ...OPTIONAL_POOL[i] });
  }
  // Always at least one optional besides forced — guarantee seed encoding
  if (!out.length) out.push({ ...OPTIONAL_POOL[seed % OPTIONAL_POOL.length] });
  return out;
}

function headerColorFor(seed) {
  return HEADER_ROTATION[seed % HEADER_ROTATION.length];
}

function gridCols(seed) {
  return /** @type {1|2|3} */ ([2, 3, 1, 2, 3][seed % 5]);
}

/**
 * Document-style unique blocks (HBL, arrival, HAWB, sea/air, commercial docs).
 * @param {number} seed
 * @param {{ title?: string, paper?: string }} [opts]
 */
export function diversifyOpsBlocks(seed, opts = {}) {
  const headerColor = headerColorFor(seed);
  const cols = gridCols(seed);
  const optionals = pickOptionals(seed);
  const title = opts.title || 'REPORT';
  const mod = seed % 6;

  const head = [
    { type: 'companyHeader', showContact: true },
    { type: 'docTitle', text: title, align: mod === 2 ? 'start' : 'center', band: true },
  ];
  const foot = [{ type: 'colorfulFooter' }];

  /** @type {object[]} */
  let body;
  if (mod === 0) {
    body = [
      { type: 'partyTriple' },
      { type: 'fieldGrid', cols },
      { type: 'chargeTable', headerColor },
      { type: 'termsBank' },
      { type: 'signatureRow' },
    ];
  } else if (mod === 1) {
    body = [
      { type: 'twoColumn', showBillTo: true, rightMetaFrom: 'metaRows' },
      { type: 'fieldGrid', cols },
      { type: 'chargeTable', headerColor },
      { type: 'wordsAndTotal' },
      { type: 'termsBank' },
      { type: 'signatureRow' },
    ];
  } else if (mod === 2) {
    body = [
      { type: 'partyTriple' },
      { type: 'shipmentDetails', showIrn: seed % 2 === 0, showQuotation: true },
      { type: 'fieldGrid', cols },
      { type: 'chargeTable', headerColor },
      { type: 'termsBank' },
    ];
  } else if (mod === 3) {
    body = [
      { type: 'fieldGrid', cols },
      { type: 'partyTriple' },
      { type: 'chargeTable', headerColor },
      { type: 'subtotalBar', variant: seed % 2 === 0 ? 'simple' : 'tax' },
      { type: 'termsBank' },
      { type: 'signatureRow' },
    ];
  } else if (mod === 4) {
    body = [
      { type: 'partyTriple' },
      { type: 'landRoute' },
      { type: 'fieldGrid', cols },
      { type: 'chargeTable', headerColor },
      { type: 'termsBank' },
      { type: 'signatureRow' },
    ];
  } else {
    body = [
      { type: 'partyTriple' },
      { type: 'fieldGrid', cols },
      { type: 'chargeTable', headerColor },
      { type: 'totalsOnly' },
      { type: 'termsBank' },
      { type: 'signatureRow' },
    ];
  }

  // Interleave optionals after title (skip types already in body)
  const used = new Set(body.map((b) => b.type));
  const inject = optionals.filter((o) => !used.has(o.type));
  const insertAt = 1 + (seed % Math.max(1, body.length));
  const mid = [...body];
  mid.splice(insertAt, 0, ...inject.slice(0, 3 + (seed % 3)));

  return [...head, ...mid, ...foot];
}

/** List / ops-analytics unique blocks. */
export function diversifyListBlocks(seed, opts = {}) {
  const headerColor = headerColorFor(seed);
  const cols = gridCols(seed);
  const optionals = pickOptionals(seed).filter(
    (o) => !['usaNumberedFields', 'shipmentDetails', 'landRoute'].includes(o.type),
  );
  const title = opts.title || 'OPERATIONS LIST';
  const mod = seed % 4;

  const head = [
    { type: 'companyHeader', showContact: true },
    { type: 'docTitle', text: title, align: 'center', band: true },
  ];
  const foot = [{ type: 'colorfulFooter' }];

  let body;
  if (mod === 0) {
    body = [
      { type: 'fieldGrid', cols },
      { type: 'chargeTable', headerColor },
    ];
  } else if (mod === 1) {
    body = [
      { type: 'fieldGrid', cols },
      { type: 'agingSummary' },
      { type: 'chargeTable', headerColor },
      { type: 'termsBank' },
    ];
  } else if (mod === 2) {
    body = [
      { type: 'summaryHero' },
      { type: 'fieldGrid', cols },
      { type: 'chargeTable', headerColor },
      { type: 'signatureRow' },
    ];
  } else {
    body = [
      { type: 'fieldGrid', cols },
      { type: 'chargeTable', headerColor },
      { type: 'outstandingTable' },
      { type: 'termsBank' },
    ];
  }

  const used = new Set(body.map((b) => b.type));
  const inject = optionals.filter((o) => !used.has(o.type)).slice(0, 2 + (seed % 3));
  return [...head, ...inject, ...body, ...foot];
}

/** Finance / accounts unique blocks. */
export function diversifyFinanceBlocks(seed, opts = {}) {
  const headerColor = headerColorFor(seed);
  const cols = gridCols(seed);
  const title = opts.title || 'ACCOUNTS REPORT';
  const optionals = pickOptionals(seed);
  const mod = seed % 5;

  const head = [
    { type: 'companyHeader', showContact: true },
    { type: 'docTitle', text: title, align: 'center', band: true },
  ];
  const foot = [{ type: 'colorfulFooter' }];

  let body;
  if (mod === 0) {
    body = [
      { type: 'letterBody' },
      { type: 'fieldGrid', cols },
      { type: 'chargeTable', headerColor },
      { type: 'agingSummary' },
      { type: 'termsBank' },
      { type: 'signatureRow' },
    ];
  } else if (mod === 1) {
    body = [
      { type: 'fieldGrid', cols },
      { type: 'chargeTable', headerColor },
      { type: 'outstandingTable' },
      { type: 'wordsAndTotal' },
      { type: 'termsBank' },
    ];
  } else if (mod === 2) {
    body = [
      { type: 'letterBody' },
      { type: 'twoColumn', showBillTo: true, rightMetaFrom: 'metaRows' },
      { type: 'chargeTable', headerColor },
      { type: 'agingSummary' },
      { type: 'signatureRow' },
    ];
  } else if (mod === 3) {
    body = [
      { type: 'summaryHero' },
      { type: 'fieldGrid', cols },
      { type: 'chargeTable', headerColor },
      { type: 'totalsOnly' },
      { type: 'termsBank' },
    ];
  } else {
    body = [
      { type: 'fieldGrid', cols },
      { type: 'chargeTable', headerColor },
      { type: 'wireBox' },
      { type: 'termsBank' },
      { type: 'signatureRow' },
    ];
  }

  const used = new Set([...head, ...body].map((b) => b.type));
  const inject = optionals.filter((o) => !used.has(o.type)).slice(0, 1 + (seed % 2));
  return [...head, ...inject, ...body, ...foot];
}

/** WMS / ASN unique blocks. */
export function diversifyWmsBlocks(seed, opts = {}) {
  const headerColor = headerColorFor(seed);
  const cols = gridCols(seed);
  const title = opts.title || 'WMS REPORT';
  const optionals = pickOptionals(seed);
  const mod = seed % 4;

  const head = [
    { type: 'companyHeader', showContact: true },
    { type: 'docTitle', text: title, align: 'center', band: true },
  ];
  const foot = [{ type: 'colorfulFooter' }];

  let body;
  if (mod === 0) {
    body = [
      { type: 'fieldGrid', cols },
      { type: 'chargeTable', headerColor },
      { type: 'containerStrip' },
    ];
  } else if (mod === 1) {
    body = [
      { type: 'partyTriple' },
      { type: 'fieldGrid', cols },
      { type: 'chargeTable', headerColor },
      { type: 'termsBank' },
    ];
  } else if (mod === 2) {
    body = [
      { type: 'summaryHero' },
      { type: 'fieldGrid', cols },
      { type: 'chargeTable', headerColor },
      { type: 'signatureRow' },
    ];
  } else {
    body = [
      { type: 'fieldGrid', cols },
      { type: 'jobDescription' },
      { type: 'chargeTable', headerColor },
      { type: 'containerNote' },
      { type: 'termsBank' },
    ];
  }

  const used = new Set(body.map((b) => b.type));
  const inject = optionals.filter((o) => !used.has(o.type)).slice(0, 2);
  return [...head, ...inject, ...body, ...foot];
}

/**
 * Infer diversity family from layout code/name and rewrite blocks uniquely.
 * Prefers Fresa name profiles so Tax India ≠ USA ≠ Arabic ≠ without-charges.
 */
export function diversifyLayoutRow(row, index, usedSignatures) {
  const code = String(row.code || '').toUpperCase();
  const name = String(row.name || '');
  const title =
    name
      .replace(/\s+Report Format.*$/i, '')
      .replace(/\s+List Report Format.*$/i, '')
      .trim()
      .toUpperCase() || code;

  const seed = Number.isFinite(Number(row.formatNumber))
    ? Number(row.formatNumber) * 17 + index * 3
    : index * 13 + code.length;

  const profile = fresaNameProfile(name, code, seed);

  let family = 'ops';
  if (/_LIST|LIST_REPORT|PENDING_|DAILY_STATUS|DSR|SHIPMENTS_WITH/.test(code) || /List Report/i.test(name)) {
    family = 'list';
  } else if (/OUTSTANDING|AGING|TRIAL|VOUCHER|PROFIT_AND_LOSS|STATEMENT|GL_|JOURNAL|CHEQUE|AP_|AR_/.test(code)) {
    family = 'finance';
  } else if (/ASN|SHIPPING_NOTE|WMS_|WAREHOUSE|STOCK/.test(code) || /Advance Shipping|WMS/i.test(name)) {
    family = 'wms';
  }

  let blocks;
  let paper = row.paper || 'A4';
  let rtl = Boolean(row.rtl);
  let demo = row.demo ? { ...row.demo } : {};

  if (profile?.blocks?.length) {
    blocks = profile.blocks.map((b) => ({ ...b }));
    if (profile.paper) paper = profile.paper;
    if (profile.rtl != null) rtl = profile.rtl;
    if (profile.demoPatch) demo = { ...demo, ...profile.demoPatch };
  } else if (family === 'list') {
    blocks = diversifyListBlocks(seed, { title });
  } else if (family === 'finance') {
    blocks = diversifyFinanceBlocks(seed, { title });
  } else if (family === 'wms') {
    blocks = diversifyWmsBlocks(seed, { title });
  } else {
    blocks = diversifyOpsBlocks(seed, { title });
  }

  if (/USA|United States|Letter/i.test(name) || /_USA/.test(code)) paper = paper || 'Letter';
  if ((/ARABIC/i.test(name) || /ARABIC/.test(code)) && !blocks.some((b) => b.type === 'arabicHeader')) {
    blocks = [blocks[0], { type: 'arabicHeader' }, ...blocks.slice(1)];
    rtl = true;
  }

  let sig = blockSignature(blocks);
  let attempt = 0;
  while (usedSignatures.has(sig) && attempt < 64) {
    // Keep Fresa profile core — only append a unique optional before footer
    const foot = blocks[blocks.length - 1];
    const extra = { ...OPTIONAL_POOL[(seed + attempt) % OPTIONAL_POOL.length] };
    blocks = [...blocks.slice(0, -1), extra, foot];
    sig = blockSignature(blocks);
    attempt += 1;
  }
  usedSignatures.add(sig);

  return {
    ...row,
    paper,
    rtl,
    demo,
    blocks,
    branding: {
      company: 'KingFisher Wings',
      address: 'Dubai, United Arab Emirates',
      web: 'www.kingfisherwingsgroup.com',
      phone: '+971 55 5355 286',
      email: 'inquiry@kingfishertec.com',
      logo: 'kingfisher',
    },
  };
}
