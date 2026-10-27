import { themeForOfficialInvoiceFormat } from './lib/fresaThemePalettes.mjs';

/**
 * After all sample-PDF batches, restore Invoice Report Format-1…21 to match
 * https://fresatechnologies.com/sample-report-formats/ and park displaced
 * PDF layouts at Format-72+ so prior work remains available.
 *
 * Official formats must keep their DISTINCT / snapshot structures — do not
 * homogenize with headerColor randomization or fake marker blocks.
 */
export function applyOfficialFresaPageMapping({
  DISTINCT,
  deepClone,
  KIND_TEMPLATES,
  officialSnapshots = {},
}) {
  const snap = {};
  for (const n of [2, 5, 6, 9, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22]) {
    if (DISTINCT[n]) snap[n] = deepClone(DISTINCT[n]);
  }

  const fromOfficial = (n, fallback) => {
    if (officialSnapshots[n]) return deepClone(officialSnapshots[n]);
    if (typeof fallback === 'function') {
      const v = fallback();
      return v ? deepClone(v) : null;
    }
    if (fallback) return deepClone(fallback);
    return DISTINCT[n] ? deepClone(DISTINCT[n]) : null;
  };

  const taxIndia = () => fromOfficial(1, () => KIND_TEMPLATES.tax_india());
  const usa = () => deepClone(KIND_TEMPLATES.usa());
  const land = () => deepClone(KIND_TEMPLATES.land());
  const preprinted = () => deepClone(KIND_TEMPLATES.preprinted());
  const warehouse = () => deepClone(KIND_TEMPLATES.warehouse());
  const debit = () => deepClone(KIND_TEMPLATES.debit_vietnam());
  const arabic = () => fromOfficial(8, () => DISTINCT[34] || KIND_TEMPLATES.arabic_rtl());
  const fcy = () => fromOfficial(15, () => DISTINCT[44] || snap[15] || taxIndia());
  const summary = () =>
    deepClone(DISTINCT[53] || officialSnapshots[3] || KIND_TEMPLATES.summary?.());

  // Format-1 Tax Invoice India (SAC + container before charges)
  DISTINCT[1] = taxIndia();
  // Format-2 Tax Invoice India (partyTriple / Client)
  DISTINCT[2] = fromOfficial(2, () => snap[2] || taxIndia());
  // Format-3 Summary Invoice
  DISTINCT[3] = summary() || fromOfficial(3);
  if (DISTINCT[3]) {
    DISTINCT[3].demo = {
      ...(DISTINCT[3].demo || {}),
      heroTitle: 'SUMMARY INVOICE',
      docSubtitle: 'Summary Invoice',
      formatBadgeLabel: 'Format-3',
    };
    const blocks = [...(DISTINCT[3].blocks || [])];
    const heroIdx = blocks.findIndex((b) => b.type === 'summaryHero');
    if (heroIdx >= 0) {
      blocks[heroIdx] = { type: 'summaryHero', title: 'SUMMARY INVOICE' };
    } else {
      blocks.unshift({ type: 'summaryHero', title: 'SUMMARY INVOICE' });
    }
    if (!blocks.some((b) => b.type === 'formatBadge')) {
      blocks.splice(1, 0, { type: 'formatBadge', label: 'Format-3' });
    }
    DISTINCT[3].blocks = blocks;
  }
  // Format-4 Standard Tax Invoice (Unit/Tax% + cyan band — not Format-1)
  DISTINCT[4] = fromOfficial(4, taxIndia);
  // Format-5 Tax Invoice India (INVOICE title, totalsOnly)
  DISTINCT[5] = fromOfficial(5, () => snap[5] || taxIndia());
  // Format-6 Simple Invoice (India) — office band + GST table + IGST subtotal
  DISTINCT[6] = fromOfficial(6, () => snap[6] || KIND_TEMPLATES.simple?.());
  if (DISTINCT[6]?.demo) DISTINCT[6].demo.docSubtitle = 'Simple Invoice (India)';
  // Format-7 Simple Invoice — INVOICE band + FCY columns + totalsOnly (not Format-6)
  DISTINCT[7] = fromOfficial(7, () => KIND_TEMPLATES.simple?.());
  if (DISTINCT[7]?.demo) DISTINCT[7].demo.docSubtitle = 'Simple Invoice';
  // Format-8 Standard Invoice Arabic
  DISTINCT[8] = arabic();
  // Format-9 Standard Invoice USA — always USA template (slot 9 snapshot is not USA)
  DISTINCT[9] = usa();
  // Format-10 Standard Invoice — denser field grid (snapshot), not USA
  DISTINCT[10] = fromOfficial(10, () => {
    const base = deepClone(KIND_TEMPLATES.simple?.() || DISTINCT[7]);
    const title = base.blocks?.find((b) => b.type === 'docTitle');
    if (title) title.text = 'INVOICE';
    return base;
  });
  {
    const title = DISTINCT[10]?.blocks?.find((b) => b.type === 'docTitle');
    if (title) title.text = 'INVOICE';
  }
  // Format-11 Standard Invoice Land
  DISTINCT[11] = deepClone(KIND_TEMPLATES.land_format1?.() || land());
  // Format-12 Standard Invoice Preprinted
  DISTINCT[12] = fromOfficial(12, preprinted);
  // Format-13 Standard Invoice USA (Letter) — denser than Format-9 (field grid + tax box)
  DISTINCT[13] = usa();
  {
    const blocks = [...(DISTINCT[13].blocks || [])];
    if (!blocks.some((b) => b.type === 'usaNumberedFields')) {
      const titleIdx = blocks.findIndex((b) => b.type === 'docTitle');
      blocks.splice(Math.max(1, titleIdx + 1), 0, { type: 'usaNumberedFields' });
    }
    if (!blocks.some((b) => b.type === 'fieldGrid')) {
      const twoIdx = blocks.findIndex((b) => b.type === 'twoColumn');
      blocks.splice(twoIdx >= 0 ? twoIdx + 1 : 2, 0, { type: 'fieldGrid', cols: 2 });
    }
    if (!blocks.some((b) => b.type === 'taxAmountBox')) {
      const wordsIdx = blocks.findIndex((b) => b.type === 'wordsAndTotal');
      blocks.splice(wordsIdx >= 0 ? wordsIdx : blocks.length - 1, 0, { type: 'taxAmountBox' });
    }
    const charge = blocks.find((b) => b.type === 'chargeTable');
    if (charge) charge.headerColor = 'cyan';
    const title = blocks.find((b) => b.type === 'docTitle');
    if (title) {
      title.band = true;
      title.align = 'start';
    }
    DISTINCT[13].blocks = blocks;
  }
  DISTINCT[13].paper = 'Letter';
  // Format-14 Invoice — field grid + INR columns (≠ Format-7 simple)
  DISTINCT[14] = (() => {
    const base = fromOfficial(7, () => KIND_TEMPLATES.simple?.()) || deepClone(KIND_TEMPLATES.simple());
    base.blocks = [
      { type: 'companyHeader' },
      { type: 'docTitle', text: 'INVOICE', align: 'start', band: true },
      { type: 'twoColumn', showBillTo: true },
      { type: 'fieldGrid', cols: 2 },
      { type: 'chargeTable', headerColor: 'fill' },
      { type: 'wordsAndTotal' },
      { type: 'termsBank' },
      { type: 'colorfulFooter' },
    ];
    if (base.demo) {
      base.demo.docSubtitle = 'Invoice';
      base.demo.tableHeaders = [
        'Charge',
        'Qty',
        'Currency',
        'Amount / Qty',
        'Ex.Rate',
        'FCY Amount',
        'Amount (INR)',
      ];
    }
    return base;
  })();
  // Format-15 Invoice FCY / Debit Note
  DISTINCT[15] = fcy();
  {
    const t = DISTINCT[15]?.blocks?.find((b) => b.type === 'docTitle');
    if (t) t.text = 'INVOICE / DEBIT NOTE';
  }
  // Format-16 Standard Tax Invoice Preprinted — tax box + orange header (≠ Format-12)
  DISTINCT[16] = (() => {
    const base = preprinted();
    const blocks = [...(base.blocks || [])];
    const title = blocks.find((b) => b.type === 'docTitle');
    if (title) {
      title.text = 'TAX INVOICE';
      title.band = true;
      title.align = 'start';
    }
    if (!blocks.some((b) => b.type === 'taxAmountBox')) {
      const wordsIdx = blocks.findIndex((b) => b.type === 'wordsAndTotal');
      blocks.splice(wordsIdx >= 0 ? wordsIdx : blocks.length - 1, 0, { type: 'taxAmountBox' });
    }
    const charge = blocks.find((b) => b.type === 'chargeTable');
    if (charge) charge.headerColor = 'orange';
    base.blocks = blocks;
    return base;
  })();
  // Format-17 Invoice Jasper
  DISTINCT[17] = (() => {
    const base = fromOfficial(7, () => KIND_TEMPLATES.simple?.()) || deepClone(KIND_TEMPLATES.simple());
    const blocks = [...(base.blocks || [])];
    const titleIdx = blocks.findIndex((b) => b.type === 'docTitle');
    if (titleIdx >= 0 && !blocks.some((b) => b.type === 'formatBadge')) {
      blocks.splice(titleIdx + 1, 0, { type: 'formatBadge' });
    }
    const charge = blocks.find((b) => b.type === 'chargeTable');
    if (charge) charge.headerColor = 'cyan';
    const t = blocks.find((b) => b.type === 'docTitle');
    if (t) t.text = 'INVOICE';
    base.blocks = blocks;
    if (base.demo) base.demo.docSubtitle = 'Invoice Jasper';
    return base;
  })();
  // Format-18 Land Freight Transportation Invoice
  DISTINCT[18] = land();
  // Format-19 Debit Note Vietnam
  DISTINCT[19] = debit();
  // Format-20 Tax Invoice India — partyTriple + band title (≠ Format-1)
  DISTINCT[20] = (() => {
    const base = taxIndia();
    base.blocks = [
      { type: 'companyHeader', showContact: true },
      { type: 'docTitle', text: 'TAX INVOICE', align: 'start', band: true },
      { type: 'twoColumn', showBillTo: true, showCreditTerm: true },
      { type: 'partyTriple' },
      { type: 'fieldGrid', cols: 3 },
      { type: 'chargeTable', headerColor: 'cyan' },
      { type: 'subtotalBar', variant: 'tax' },
      { type: 'taxAmountBox' },
      { type: 'wordsAndTotal' },
      { type: 'termsBank' },
      { type: 'colorfulFooter' },
    ];
    return base;
  })();
  // Format-21 Warehouse Invoice
  DISTINCT[21] = warehouse();

  // Park displaced sample-PDF layouts (keep functionality / prior PDFs)
  const park = {
    72: { from: 13, nameKey: 'std_tax_13' },
    73: { from: 14, nameKey: 'std_tax_14' },
    74: { from: 15, nameKey: 'std_tax_15' },
    75: { from: 16, nameKey: 'std_tax_16' },
    76: { from: 17, nameKey: 'std_tax_17' },
    77: { from: 18, nameKey: 'std_tax_18' },
    78: { from: 19, nameKey: 'std_tax_19' },
    79: { from: 20, nameKey: 'std_tax_20' },
    80: { from: 21, nameKey: 'std_tax_21' },
    81: { from: 22, nameKey: 'std_tax_22' },
    82: { from: 5, nameKey: 'std_tax_5' },
    83: { from: 6, nameKey: 'std_tax_6' },
    84: { from: 9, nameKey: 'std_tax_9' },
    85: { from: 2, nameKey: 'std_inv_2' },
  };

  for (const [numStr, meta] of Object.entries(park)) {
    const n = Number(numStr);
    if (snap[meta.from]) DISTINCT[n] = deepClone(snap[meta.from]);
  }

  if (snap[22]) DISTINCT[22] = deepClone(snap[22]);

  // Theme only — never rewrite official block chains
  for (let n = 1; n <= 21; n += 1) {
    if (DISTINCT[n]) {
      DISTINCT[n].theme = themeForOfficialInvoiceFormat(n);
    }
  }

  return { parkedFrom: park, snapped: Object.keys(snap).map(Number) };
}
