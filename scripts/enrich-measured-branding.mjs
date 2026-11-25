/**
 * Build slim branding/header/footer slots from every reports/specs/*.json.
 * Fresa Tax Invoice pattern: logo LEFT, company + address RIGHT-aligned.
 *
 * Run: node scripts/enrich-measured-branding.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SPEC_DIR = path.join(root, 'reports/specs');
const OUT = path.join(
  root,
  'src/features/reports/templates/official/brandingSlots.generated.ts',
);

function round(n) {
  return Math.round(Number(n) * 10) / 10;
}

function boxFrom(span, extra = {}) {
  if (!span) return null;
  return {
    x: round(span.x),
    y: round(span.y),
    width: round(span.width || Math.max(40, (span.text || '').length * (span.size || 8) * 0.5)),
    height: round(span.size || 8),
    size: round(span.size || 8),
    color: span.color || '#101010',
    ...extra,
  };
}

function footerSlots(spans, pageWidth = 595, pageHeight = 842, rotate = 0) {
  // Portrait footers sit on low Y. /Rotate 90 landscape samples put the footer
  // on the mediaBox right edge (high X); labels and values share X and differ in Y.
  const footer =
    rotate === 90
      ? spans.filter((s) => (s.x || 0) > pageWidth - 50)
      : spans.filter((s) => (s.y || 0) < 55);
  const find = (re) => footer.find((s) => re.test(String(s.text || '').trim()));
  // Fresa variants: "Printed By :", "User :", "Created By :"
  const printedByLabel =
    find(/^printed by\b/i) || find(/^user\s*:/i) || find(/^created by\b/i);
  const printedDateLabel =
    find(/^printed date\b/i) ||
    footer.find((s) => {
      const text = String(s.text || '');
      if (!/\d{1,2}[-/][A-Za-z]{3}[-/]\d{2,4}/.test(text)) return false;
      if (rotate === 90) return (s.y || 0) > pageHeight * 0.35 && (s.y || 0) < pageHeight * 0.7;
      return s.x > 180 && s.x < 400;
    });
  const pageLabel =
    find(/^page\b/i) ||
    footer.find((s) => /^\d+\s*\/\s*\d+$/.test(String(s.text || '').trim()));
  const powered = footer.find(
    (s) =>
      /powered by/i.test(String(s.text || '')) ||
      (/^fresa\b/i.test(String(s.text || '').trim()) && !/@/.test(String(s.text || ''))),
  );

  const valueBeside = (label, extraFilter) => {
    if (!label) return null;
    const candidates = footer.filter(
      (s) =>
        s !== label &&
        (rotate === 90
          ? Math.abs((s.x || 0) - label.x) < 3 && (s.y || 0) > label.y
          : Math.abs((s.y || 0) - label.y) < 3 && s.x > label.x) &&
        !/^(printed|powered|page|user\s*:|created by|of\s+\d+)/i.test(String(s.text || '').trim()) &&
        (extraFilter ? extraFilter(s) : true),
    );
    if (candidates.length === 0) return null;
    // Prefer the nearest value along the footer axis (avoids "Page 1" / "of 1").
    candidates.sort((a, b) =>
      rotate === 90
        ? (a.y || 0) - (b.y || 0)
        : (a.x || 0) - (b.x || 0),
    );
    return candidates[0] || null;
  };

  // Prefer email-looking values for Printed By / User (even when sample has @fresa…).
  const printedByValue =
    valueBeside(printedByLabel, (s) => /@/.test(String(s.text || ''))) ||
    valueBeside(
      printedByLabel,
      (s) =>
        String(s.text || '').trim().length > 2 &&
        !/\d{1,2}[-/][A-Za-z]{3}[-/]\d{2,4}/.test(String(s.text || '')) &&
        !/powered|technologies|http/i.test(String(s.text || '')),
    );
  const printedDateValue =
    (printedDateLabel && /^printed date\b/i.test(String(printedDateLabel.text || ''))
      ? valueBeside(printedDateLabel)
      : null) ||
    (printedDateLabel && !/^printed date\b/i.test(String(printedDateLabel.text || ''))
      ? printedDateLabel
      : null);

  const byLabelBox = boxFrom(printedByLabel);
  const dateIsLabel = printedDateLabel && /^printed date\b/i.test(String(printedDateLabel.text || ''));
  const clampX = (x, width = 80) =>
    round(Math.min(Math.max(8, x), Math.max(8, pageWidth - width - 8)));
  const clampY = (y, width = 80) =>
    round(Math.min(Math.max(8, y), Math.max(8, pageHeight - width - 8)));

  const byValueBox = boxFrom(printedByValue) ||
    (byLabelBox
      ? rotate === 90
        ? {
            x: round(byLabelBox.x),
            y: clampY(byLabelBox.y + (byLabelBox.width || 40) + 4, 120),
            width: 120,
            height: round(byLabelBox.size || 7),
            size: round(byLabelBox.size || 7),
            color: '#101010',
          }
        : {
            x: clampX(byLabelBox.x + (byLabelBox.width || 40) + 4, 120),
            y: round(byLabelBox.y),
            width: 120,
            height: round(byLabelBox.size || 7),
            size: round(byLabelBox.size || 7),
            color: '#101010',
          }
      : null);
  if (byValueBox) {
    if (rotate === 90) byValueBox.y = clampY(byValueBox.y, byValueBox.width || 80);
    else byValueBox.x = clampX(byValueBox.x, byValueBox.width || 80);
  }

  return {
    printedByLabel: byLabelBox,
    printedByValue: byValueBox,
    printedDateLabel: dateIsLabel ? boxFrom(printedDateLabel) : null,
    printedDateValue: (() => {
      const box =
        boxFrom(printedDateValue) ||
        (dateIsLabel
          ? rotate === 90
            ? {
                x: round(printedDateLabel.x),
                y: clampY(printedDateLabel.y + (printedDateLabel.width || 50) + 4, 130),
                width: 130,
                height: round(printedDateLabel.size || 7),
                size: round(printedDateLabel.size || 7),
                color: '#101010',
              }
            : {
                x: clampX(printedDateLabel.x + (printedDateLabel.width || 50) + 4, 130),
                y: round(printedDateLabel.y),
                width: 130,
                height: round(printedDateLabel.size || 7),
                size: round(printedDateLabel.size || 7),
                color: '#101010',
              }
          : null);
      if (box) {
        if (rotate === 90) box.y = clampY(box.y, box.width || 100);
        else box.x = clampX(box.x, box.width || 100);
      }
      return box;
    })(),
    pageLabel: boxFrom(pageLabel),
    poweredByWipe: powered
      ? {
          x: round(Math.min(powered.x - 2, pageWidth - 180)),
          y: round(powered.y - 2),
          width: round(Math.max((powered.width || 120) + 80, 160)),
          height: round((powered.size || 7) + 4),
        }
      : footer.some((s) => /http:\/\/demo\.fresagold|ords\/f\?p=/i.test(String(s.text || '')))
        ? {
            x: 24,
            y: 12,
            width: Math.min(540, pageWidth - 40),
            height: 14,
          }
        : null,
  };
}

function companyAddressLines(spans, company, pageWidth) {
  if (!company) return [];
  const rightAligned = company.align === 'right' || company.x > pageWidth * 0.45;
  const lines = spans.filter((s) => {
    const text = String(s.text || '');
    if (!text.trim()) return false;
    if (s.y > company.y + 2 || s.y < company.y - 70) return false;
    if (/tax invoice|invoice|quotation|arrival|delivery|hbl|hawb|bill to|client/i.test(text)) return false;
    if (rightAligned) {
      // Right-side address block under/near the company name.
      return s.x >= company.x - 20 || s.x + (s.width || 0) > pageWidth * 0.55;
    }
    return s.x >= company.x - 8;
  });
  return lines
    .filter((s) => {
      // Drop the company-name span itself when it was tagged into the address list.
      if (!company) return true;
      return !(Math.abs((s.y || 0) - company.y) < 1 && Math.abs((s.x || 0) - company.x) < 1);
    })
    .sort((a, b) => b.y - a.y || a.x - b.x)
    .slice(0, 6)
    .map((s) => boxFrom(s, rightAligned ? { align: 'right' } : {}))
    .filter(Boolean);
}

function rightCompanyBox(pageWidth, y, size = 12, color = '#0F4D96') {
  const width = 220;
  const margin = 22;
  return {
    x: round(pageWidth - margin - width),
    y: round(y),
    width,
    height: round(size),
    size: round(size),
    color,
    align: 'right',
  };
}

function fromSpec(code, spec) {
  const spans = spec.spans || [];
  const images = spec.images || [];
  // Geometry lives in mediaBox space when /Rotate is set (see fix-rotated-measured-faces).
  const rotate = Number(spec.page?.rotate) || 0;
  const media = spec.page?.mediaBox;
  const pageWidth =
    rotate && Array.isArray(media) && media.length >= 4
      ? media[2] - media[0]
      : spec.page?.width || 595;
  const pageHeight =
    rotate && Array.isArray(media) && media.length >= 4
      ? media[3] - media[1]
      : spec.page?.height || 842;
  const logoSlot = spec.slots?.logo || null;
  const companySlot = spec.slots?.company || null;
  const logoImage = images.find((i) => i.proposedClass === 'logo');
  const letterhead = images.find((i) => i.proposedClass === 'letterhead');
  const brandingName = spans.find(
    (s) =>
      s.brandingKind === 'name' &&
      s.y > pageHeight * 0.85 &&
      !/powered by|http|fresatechnologies\.com/i.test(String(s.text || '')),
  );

  const headerYMin = pageHeight * 0.72;
  const plausibleLogo = (box) =>
    box &&
    box.width > 12 &&
    box.width <= 160 &&
    box.height > 8 &&
    box.height <= 80 &&
    box.y >= headerYMin - 8;

  let logo = null;
  if (logoSlot && plausibleLogo(logoSlot)) {
    logo = {
      x: round(logoSlot.x),
      y: round(logoSlot.y),
      width: round(logoSlot.width || 82),
      height: round(logoSlot.height || 40),
    };
  } else if (logoImage && plausibleLogo(logoImage)) {
    logo = {
      x: round(logoImage.x),
      y: round(logoImage.y),
      width: round(logoImage.width || 82),
      height: round(logoImage.height || 40),
    };
  }

  // Full-width letterhead band, or tall side-strip used by /Rotate 90 landscape samples
  // (Format 2 Tax Invoice India): left strip becomes the top banner when viewed.
  const tallStrip = images.find(
    (i) =>
      (i.proposedClass === 'letterhead' || i.proposedClass === 'decorative') &&
      (i.height || 0) > pageHeight * 0.5 &&
      (i.width || 0) < 120,
  );
  const bandSource = letterhead || tallStrip || null;

  if (!logo && bandSource) {
    const strip = (bandSource.height || 0) > (bandSource.width || 0) * 2;
    if (strip) {
      // After /Rotate 90, bottom of left strip ≈ visual top-left logo.
      logo = {
        x: round(bandSource.x + 2),
        y: round(bandSource.y + 4),
        width: Math.min(78, round((bandSource.width || 80) - 4)),
        height: 40,
      };
    } else {
      logo = {
        x: round(bandSource.x + 2),
        y: round(bandSource.y + Math.max(8, (bandSource.height || 40) - 40)),
        width: 78,
        height: Math.min(40, round(bandSource.height || 40)),
      };
    }
  }

  const headerBand = bandSource
    ? {
        x: round(bandSource.x),
        y: round(bandSource.y),
        width: round(bandSource.width),
        height: round(bandSource.height),
      }
    : null;

  // Fresa Tax Invoice / classic header: company is RIGHT-aligned on the right.
  // Prefer measured company slot / branding name when it already sits on the right.
  const slotInHeader =
    companySlot &&
    companySlot.y >= headerYMin - 8 &&
    (!headerBand || companySlot.y >= headerBand.y - 4);
  const nameInHeader =
    brandingName &&
    brandingName.y >= headerYMin - 8 &&
    (!headerBand || brandingName.y >= headerBand.y - 4);

  let company = null;
  if (slotInHeader && companySlot.x > pageWidth * 0.4) {
    company = {
      x: round(companySlot.x),
      y: round(companySlot.y),
      width: round(companySlot.width || 200),
      height: round(companySlot.height || 12),
      size: round(companySlot.height || brandingName?.size || 12),
      color: brandingName?.color && brandingName.color !== '#000000' ? brandingName.color : '#0F4D96',
      align: 'right',
    };
  } else if (nameInHeader && brandingName.x > pageWidth * 0.4) {
    company = {
      x: round(brandingName.x),
      y: round(brandingName.y),
      width: round(brandingName.width || 200),
      height: round(brandingName.size || 12),
      size: round(brandingName.size || 12),
      color: brandingName.color && brandingName.color !== '#000000' ? brandingName.color : '#0F4D96',
      align: 'right',
    };
  } else if (logo || headerBand) {
    const tallHeader =
      headerBand && headerBand.height > (headerBand.width || 1) * 2;
    if (tallHeader) {
      // Rotated landscape samples: text advances along +Y. Company is right-aligned
      // toward the top of the left strip (visual top-right after /Rotate 90).
      const startY = round(headerBand.y + 90);
      const maxAdvance = round(Math.max(120, pageHeight - startY - 24));
      company = {
        x: round(headerBand.x + Math.min(14, (headerBand.width || 40) * 0.25)),
        y: startY,
        width: Math.min(420, maxAdvance),
        height: 12,
        size: 11,
        color: '#0F4D96',
        align: 'right',
      };
    } else {
      // Classic portrait: company block mirrors Fresa — right side of the page.
      const y = logo
        ? round(logo.y + logo.height - 4)
        : round((headerBand?.y || pageHeight - 60) + (headerBand?.height || 40) - 14);
      company = rightCompanyBox(pageWidth, y, brandingName?.size || 12, '#0F4D96');
    }
  } else if (slotInHeader) {
    company = {
      x: round(companySlot.x),
      y: round(companySlot.y),
      width: round(companySlot.width || 160),
      height: round(companySlot.height || 12),
      size: round(companySlot.height || 11),
      color: '#0F4D96',
      align: companySlot.x > pageWidth * 0.4 ? 'right' : 'left',
    };
  } else if (nameInHeader) {
    company = {
      x: round(brandingName.x),
      y: round(brandingName.y),
      width: round(brandingName.width || 160),
      height: round(brandingName.size || 12),
      size: round(brandingName.size || 11),
      color: brandingName.color || '#0F4D96',
      align: brandingName.x > pageWidth * 0.4 ? 'right' : 'left',
    };
  }

  const companyWipes = spans
    .filter(
      (s) =>
        s.role === 'branding' &&
        (s.brandingKind === 'name' ||
          s.brandingKind === 'phone' ||
          s.brandingKind === 'address' ||
          s.brandingKind === 'email' ||
          s.brandingKind === 'web') &&
        !/powered by/i.test(String(s.text || '')),
    )
    .map((s) => boxFrom(s))
    .filter(Boolean);

  const tallHeader =
    headerBand && headerBand.height > (headerBand.width || 1) * 2;
  const rotatedTall = Boolean(tallHeader && company && rotate === 90);

  // Also wipe right-header sample address lines that were tagged static.
  // Skip for rotated tall letterheads — scavenged spans are table cells, not address.
  if (company?.align === 'right' && !rotatedTall) {
    for (const line of companyAddressLines(spans, company, pageWidth)) {
      if (!companyWipes.some((w) => Math.abs(w.x - line.x) < 1 && Math.abs(w.y - line.y) < 1)) {
        companyWipes.push(line);
      }
    }
  }

  let addressLines = rotatedTall
    ? // Synthetic slots under the company (toward +X = visual down).
      [0, 1, 2].map((index) => ({
        x: round(company.x + 12 + index * 10),
        y: round(company.y),
        width: round(Math.min(company.width || 200, pageHeight - company.y - 24)),
        height: 7,
        size: 7,
        color: '#000000',
        align: 'right',
      }))
    : companyAddressLines(spans, company, pageWidth);

  // Cap company advance width so right-aligned text stays on the page.
  if (rotatedTall && company) {
    company.width = round(Math.min(company.width || 200, pageHeight - company.y - 24));
  }

  return {
    code,
    logo,
    company,
    addressLines,
    companyWipes,
    headerBand,
    footer: footerSlots(spans, pageWidth, pageHeight, rotate),
  };
}

const files = fs
  .readdirSync(SPEC_DIR)
  .filter((name) => name.endsWith('.json') && !name.includes('dynamic') && !name.includes('schema'));

const rows = [];
for (const file of files) {
  const code = file.replace(/\.json$/i, '');
  try {
    const spec = JSON.parse(fs.readFileSync(path.join(SPEC_DIR, file), 'utf8'));
    rows.push(fromSpec(code, spec));
  } catch (error) {
    console.warn('skip', file, error instanceof Error ? error.message : error);
  }
}

rows.sort((a, b) => a.code.localeCompare(b.code));
const withLogo = rows.filter((r) => r.logo).length;
const withCompany = rows.filter((r) => r.company).length;
const withRight = rows.filter((r) => r.company?.align === 'right').length;
const withFooter = rows.filter((r) => r.footer?.printedByLabel || r.footer?.printedByValue || r.footer?.pageLabel).length;

fs.writeFileSync(
  OUT,
  `import type { ReportBrandingSlots } from './officialFace.types';\n\nexport const REPORT_BRANDING_SLOTS: ReportBrandingSlots[] = ${JSON.stringify(rows)};\n`,
);

console.log(
  JSON.stringify(
    {
      specs: rows.length,
      withLogo,
      withCompany,
      withRightCompany: withRight,
      withFooter,
      out: path.relative(root, OUT),
    },
    null,
    2,
  ),
);
