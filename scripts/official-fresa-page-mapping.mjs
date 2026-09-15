/**
 * After all sample-PDF batches, restore Invoice Report Format-1…21 to match
 * https://fresatechnologies.com/sample-report-formats/ and park displaced
 * PDF layouts at Format-72+ so prior work remains available.
 */
export function applyOfficialFresaPageMapping({
  DISTINCT,
  deepClone,
  KIND_TEMPLATES,
}) {
  const snap = {};
  for (const n of [2, 5, 6, 9, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22]) {
    if (DISTINCT[n]) snap[n] = deepClone(DISTINCT[n]);
  }

  const taxIndia = () => deepClone(DISTINCT[1] || KIND_TEMPLATES.tax_india());
  const simpleBase = deepClone(DISTINCT[7] || KIND_TEMPLATES.simple());
  const usa = () => deepClone(KIND_TEMPLATES.usa());
  const land = () => deepClone(KIND_TEMPLATES.land());
  const preprinted = () => deepClone(KIND_TEMPLATES.preprinted());
  const warehouse = () => deepClone(KIND_TEMPLATES.warehouse());
  const debit = () => deepClone(KIND_TEMPLATES.debit_vietnam());
  const arabic = () => deepClone(DISTINCT[34] || KIND_TEMPLATES.arabic_rtl());
  const fcy = () => deepClone(DISTINCT[44] || snap[15] || taxIndia());
  const summary = () => deepClone(DISTINCT[53] || DISTINCT[3]);

  // Official page Format-1…21
  DISTINCT[1] = taxIndia();
  DISTINCT[2] = taxIndia();
  DISTINCT[3] = summary();
  // 4 stays Standard Tax Invoice if present
  if (!DISTINCT[4]) DISTINCT[4] = taxIndia();
  DISTINCT[5] = taxIndia();
  // Simple Invoice (India) — clone base simple, force India labelling
  DISTINCT[6] = deepClone(simpleBase);
  {
    const t = DISTINCT[6].blocks?.find((b) => b.type === 'docTitle');
    if (t) t.text = 'INVOICE';
    if (DISTINCT[6].demo) {
      DISTINCT[6].demo.docSubtitle = 'Simple Invoice (India)';
      DISTINCT[6].demo.billToLabel = DISTINCT[6].demo.billToLabel || 'Bill To';
    }
  }
  DISTINCT[7] = deepClone(simpleBase);
  {
    const t = DISTINCT[7].blocks?.find((b) => b.type === 'docTitle');
    if (t) t.text = 'INVOICE';
  }
  DISTINCT[8] = arabic();
  DISTINCT[9] = usa();
  DISTINCT[10] = deepClone(DISTINCT[10] || usa());
  if (DISTINCT[10].blocks) {
    const title = DISTINCT[10].blocks.find((b) => b.type === 'docTitle');
    if (title) title.text = 'INVOICE';
  }
  DISTINCT[11] = deepClone(KIND_TEMPLATES.land_format1?.() || land());
  DISTINCT[12] = preprinted();
  DISTINCT[13] = usa();
  DISTINCT[14] = deepClone(simpleBase);
  {
    const t = DISTINCT[14].blocks?.find((b) => b.type === 'docTitle');
    if (t) t.text = 'INVOICE';
  }
  DISTINCT[15] = fcy();
  {
    const t = DISTINCT[15].blocks?.find((b) => b.type === 'docTitle');
    if (t) t.text = 'INVOICE / DEBIT NOTE';
  }
  DISTINCT[16] = preprinted();
  DISTINCT[17] = deepClone(simpleBase);
  {
    const t = DISTINCT[17].blocks?.find((b) => b.type === 'docTitle');
    if (t) t.text = 'INVOICE';
  }
  DISTINCT[18] = land();
  DISTINCT[19] = debit();
  DISTINCT[20] = taxIndia();
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

  // Format 22 keeps standard tax format-22 sample if snapped
  if (snap[22]) DISTINCT[22] = deepClone(snap[22]);

  return { parkedFrom: park, snapped: Object.keys(snap).map(Number) };
}
