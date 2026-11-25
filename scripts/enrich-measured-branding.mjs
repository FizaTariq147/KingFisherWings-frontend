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
      ? rotate === 90
        ? {
            // Footer strip is high-X; width is advance along +Y (do not pull X into the body).
            x: round(powered.x - 1),
            y: round(powered.y - 2),
            width: round(Math.max(powered.width || 120, 110)),
            height: round((powered.size || 7) + 4),
          }
        : {
            x: round(Math.min(powered.x - 2, pageWidth - 180)),
            y: round(powered.y - 2),
            width: round(Math.max((powered.width || 120) + 80, 160)),
            height: round((powered.size || 7) + 4),
          }
      : footer.some((s) => /http:\/\/demo\.fresagold|ords\/f\?p=/i.test(String(s.text || '')))
        ? rotate === 90
          ? null
          : {
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
  // Explicit left (HBL agent box) wins over x-position heuristic.
  const rightAligned =
    company.align === 'right' ||
    (company.align !== 'left' && company.x > pageWidth * 0.45);
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

function isHblFamilyCode(code) {
  return /^(HBL_|FG_HBL_)/i.test(String(code || ''));
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
  const isHbl = isHblFamilyCode(code);
  // Ocean HBL agent names often sit mid-page (e.g. ORIGINAL_87 FRESA DEMO ~y=510),
  // not only in the top letterhead band. Exclude tel/email mis-tagged as "name".
  const brandingName = spans.find(
    (s) =>
      s.brandingKind === 'name' &&
      s.y > pageHeight * (isHbl ? 0.55 : 0.85) &&
      (isHbl ? (s.x || 0) > pageWidth * 0.45 : true) &&
      !/powered by|http|fresatechnologies\.com|@|^\s*tel\s*:|^\s*email\s*:/i.test(
        String(s.text || ''),
      ),
  );

  const headerYMin = pageHeight * 0.72;
  // HBL agent logos sit mid-right and are often wider than invoice letterhead marks.
  const plausibleLogo = (box) =>
    box &&
    box.width > 12 &&
    box.width <= (isHbl ? 220 : 160) &&
    box.height > 8 &&
    box.height <= (isHbl ? 110 : 80) &&
    box.y >= (isHbl ? pageHeight * 0.45 : headerYMin - 8) &&
    (!isHbl || box.x > pageWidth * 0.35);

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
      // Portrait letterhead: keep logo inside the band with padding under the
      // outer top border so branding wipes cannot erase the page frame.
      const logoH = Math.min(40, Math.max(28, round((bandSource.height || 40) - 16)));
      const topPad = 10;
      logo = {
        x: round(bandSource.x + 6),
        y: round(bandSource.y + (bandSource.height || 40) - logoH - topPad),
        width: 78,
        height: logoH,
      };
    }
  }

  // Invoice-style default top-left logo. Never invent this for HBL/AWB forms —
  // that lands in the Shipper cell (FG_HBL_FORMAT_1 House Air Waybill).
  if (!logo && !isHbl) {
    if (rotate === 90) {
      logo = { x: 24, y: 32, width: 54, height: 40 };
    } else {
      logo = {
        x: 24,
        y: round(Math.max(8, pageHeight - 56)),
        width: 82,
        height: 40,
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

  const isAirWaybill = (spans || []).some((s) =>
    /air waybill|house air/i.test(String(s.text || '')),
  );
  const issuingAgentLabel = (spans || []).find((s) =>
    /issuing carrier.*agent/i.test(String(s.text || '')),
  );

  // Air-waybill HBL (e.g. FG_HBL_FORMAT_1): Fresa has no shipper logo. Put org
  // chrome in the empty "Issuing Carrier's Agent" box — never Shipper.
  if (isHbl && isAirWaybill && !logo && issuingAgentLabel) {
    const labelY = issuingAgentLabel.y || pageHeight * 0.74;
    logo = {
      x: round((issuingAgentLabel.x || 13) + 4),
      y: round(labelY - 48),
      width: 68,
      height: 32,
    };
  }

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
  // Ocean / air HBL: org chrome never in Shipper. Prefer agent column or issuing-agent box.
  if (isHbl && isAirWaybill && issuingAgentLabel) {
    const labelY = issuingAgentLabel.y || pageHeight * 0.74;
    const companyX = round(
      (logo?.x || issuingAgentLabel.x || 13) + (logo ? logo.width + 8 : 4),
    );
    // Sit company name beside the logo (same band), not floating above it.
    const companyY = logo
      ? round(logo.y + logo.height - 10)
      : round(labelY - 18);
    company = {
      x: companyX,
      y: companyY,
      width: 200,
      height: 9,
      size: 9,
      color: '#0F4D96',
      align: 'left',
    };
  } else if (isHbl && (logo || brandingName)) {
    const agentTop =
      brandingName ||
      spans
        .filter(
          (s) =>
            s.brandingKind === 'name' &&
            (s.x || 0) > pageWidth * 0.45 &&
            (s.y || 0) > pageHeight * 0.55 &&
            !/@|powered|http|prepared by/i.test(String(s.text || '')),
        )
        .sort((a, b) => (b.y || 0) - (a.y || 0))[0];
    // Refuse shipper-column placement (left half near top).
    const x = round(agentTop?.x || logo?.x || pageWidth * 0.52);
    const y = round(agentTop?.y || (logo ? logo.y + logo.height + 2 : pageHeight - 80));
    if (x > pageWidth * 0.4 || (logo && logo.x > pageWidth * 0.35)) {
      company = {
        x: Math.max(x, pageWidth * 0.45),
        y,
        width: round(Math.max(logo?.width || 160, agentTop?.width || 160, 160)),
        height: round(agentTop?.size || 9),
        size: round(agentTop?.size || 9),
        color: '#0F4D96',
        align: 'left',
      };
    }
  } else if (slotInHeader && companySlot.x > pageWidth * 0.4) {
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
      // Sit below the outer top border (≈10pt inset from letterhead top).
      const bandTop = headerBand
        ? headerBand.y + headerBand.height
        : logo
          ? logo.y + logo.height + 10
          : pageHeight - 20;
      const y = round(bandTop - 16);
      company = rightCompanyBox(pageWidth, y, brandingName?.size || 12, '#0F4D96');
    }
  } else if (slotInHeader && !isHbl) {
    // Never take a left shipper-cell companySlot for HBL families.
    company = {
      x: round(companySlot.x),
      y: round(companySlot.y),
      width: round(companySlot.width || 160),
      height: round(companySlot.height || 12),
      size: round(companySlot.height || 11),
      color: '#0F4D96',
      align: companySlot.x > pageWidth * 0.4 ? 'right' : 'left',
    };
  } else if (nameInHeader && !isHbl) {
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

  // Fresa header: company name on the right, aligned with the logo band.
  if (!company) {
    if (rotate === 90) {
      const startY = round((logo?.y || 32) + 80);
      company = {
        x: round((logo?.x || 24) + 12),
        y: startY,
        width: round(Math.min(420, pageHeight - startY - 24)),
        height: 12,
        size: 11,
        color: '#0F4D96',
        align: 'right',
      };
    } else {
      const y = logo
        ? round(logo.y + (logo.height || 40) - 4)
        : round(pageHeight - 30);
      company = rightCompanyBox(pageWidth, y, 12, '#0F4D96');
    }
  }

  const tallHeader =
    headerBand && headerBand.height > (headerBand.width || 1) * 2;
  const rotatedTall = Boolean(tallHeader && company && rotate === 90);
  const headerXMax = headerBand
    ? headerBand.x + headerBand.width + (rotatedTall ? 2 : 0)
    : pageWidth * 0.22;

  // Only wipe branding spans that sit in the letterhead — never Client/IGM/Shipper body cells
  // (Format 2 had Phone : N/A at x=143 wiping the client block; HBL left column is shipper).
  const companyWipes = spans
    .filter((s) => {
      if (s.role !== 'branding') return false;
      if (
        !(
          s.brandingKind === 'name' ||
          s.brandingKind === 'phone' ||
          s.brandingKind === 'address' ||
          s.brandingKind === 'email' ||
          s.brandingKind === 'web'
        )
      ) {
        return false;
      }
      if (/powered by/i.test(String(s.text || ''))) return false;
      if (rotate === 90) return (s.x || 0) <= headerXMax;
      // Ocean HBL: wipe only the agent/carrier column (right), never shipper/consignee.
      // Air-waybill HBL: wipe only inside the issuing-agent band (mid-left), not Shipper top.
      if (isHbl && isAirWaybill) {
        return (
          (s.y || 0) < pageHeight * 0.78 &&
          (s.y || 0) > pageHeight * 0.55 &&
          (s.x || 0) < pageWidth * 0.5
        );
      }
      if (isHbl) return (s.x || 0) > pageWidth * 0.45 && (s.y || 0) > pageHeight * 0.5;
      return (s.y || 0) >= headerYMin - 8;
    })
    .map((s) => boxFrom(s))
    .filter(Boolean);

  // Also wipe right-header sample address lines that were tagged static.
  // Skip for rotated tall letterheads — scavenged spans are table cells, not address.
  if (company?.align === 'right' && !rotatedTall) {
    for (const line of companyAddressLines(spans, company, pageWidth)) {
      if (!companyWipes.some((w) => Math.abs(w.x - line.x) < 1 && Math.abs(w.y - line.y) < 1)) {
        companyWipes.push(line);
      }
    }
  }

  // Cap company into the letterhead strip; right-align toward visual top-right.
  if (rotatedTall && company && headerBand) {
    company.x = round(
      Math.min(
        Math.max(company.x, headerBand.x + 6),
        headerBand.x + Math.max(10, headerBand.width - 18),
      ),
    );
    company.y = round(headerBand.y + 70);
    company.width = round(Math.max(160, pageHeight - company.y - 28));
    company.align = 'right';
    company.size = 11;
  }

  // Ocean HBL: if company landed in the thin B/L / Shipment Ref strip immediately
  // above the agent logo (FORMAT_14/16), drop it under the logo like Fresa DEMO.
  // Leave true forwarding-agent names that sit well above the logo (HKG).
  if (isHbl && !isAirWaybill && logo && company && company.x > pageWidth * 0.35) {
    const logoTop = logo.y + (logo.height || 40);
    if (company.y >= logoTop - 4 && company.y <= logoTop + 28) {
      company = {
        ...company,
        x: round(Math.max(company.x, logo.x)),
        y: round(logo.y - 11),
      };
    }
  }

  let addressLines = rotatedTall && company && headerBand
    ? // Fresa letterhead: address/web under company, still inside the strip (visual down = +X).
      [0, 1, 2].map((index) => {
        const x = round(
          Math.min(company.x + 10 + index * 9, headerBand.x + headerBand.width - 8),
        );
        return {
          x,
          y: round(company.y),
          width: round(Math.min(company.width || 200, pageHeight - company.y - 24)),
          height: 7,
          size: 7,
          color: '#000000',
          align: 'right',
        };
      })
    : companyAddressLines(spans, company, pageWidth);

  // Air-waybill HBL: contact lines under company name, inside issuing-agent box.
  if (isHbl && isAirWaybill && company) {
    addressLines = [0, 1].map((index) => ({
      x: round(company.x),
      y: round(company.y - 10 * (index + 1)),
      width: round(company.width || 180),
      height: 7,
      size: 7,
      color: '#000000',
      align: 'left',
    }));
  }

  let footer = footerSlots(spans, pageWidth, pageHeight, rotate);
  // Synthetic Fresa footer chrome when the sample has no Printed By / Date / Page spans.
  const hasFooter =
    footer.printedByLabel ||
    footer.printedByValue ||
    footer.printedDateValue ||
    footer.pageLabel;
  if (!hasFooter) {
    if (rotate === 90) {
      const fx = round(pageWidth - 23);
      footer = {
        printedByLabel: { x: fx, y: 22, width: 36, height: 7, size: 7, color: '#000000' },
        printedByValue: { x: fx, y: 63, width: 120, height: 7, size: 7, color: '#101010' },
        printedDateLabel: { x: fx, y: 448, width: 43, height: 7, size: 7, color: '#000000' },
        printedDateValue: { x: fx, y: 491, width: 90, height: 7, size: 7, color: '#101010' },
        pageLabel: { x: fx, y: 746, width: 70, height: 7, size: 7, color: '#000000' },
        poweredByWipe: null,
      };
    } else {
      const fy = 22;
      footer = {
        printedByLabel: { x: 24, y: fy, width: 48, height: 7, size: 7, color: '#000000' },
        printedByValue: { x: 76, y: fy, width: 120, height: 7, size: 7, color: '#101010' },
        printedDateLabel: { x: round(pageWidth * 0.38), y: fy, width: 55, height: 7, size: 7, color: '#000000' },
        printedDateValue: {
          x: round(pageWidth * 0.38 + 58),
          y: fy,
          width: 100,
          height: 7,
          size: 7,
          color: '#101010',
        },
        pageLabel: {
          x: round(pageWidth - 90),
          y: fy,
          width: 70,
          height: 7,
          size: 7,
          color: '#000000',
        },
        poweredByWipe: null,
      };
    }
  }

  // Ocean HBL (FG_HBL_HKG): Fresa has F/Agent up top, logo, then issuer name/Tel/Email,
  // Prepared By, and signature “By {company}”. Measure those slots when present.
  let issuerCompany = null;
  let issuerAddressLines = [];
  let preparedByValue = null;
  let signatureBy = null;
  let barcode = null;
  if (isHbl && !isAirWaybill) {
    if (logo) {
      const underLogoName = (spans || [])
        .filter(
          (s) =>
            s.brandingKind === 'name' &&
            (s.x || 0) > pageWidth * 0.45 &&
            (s.y || 0) < logo.y - 2 &&
            (s.y || 0) > logo.y - 100 &&
            !/@|^\s*tel\s*:|prepared by/i.test(String(s.text || '')),
        )
        .sort((a, b) => (b.y || 0) - (a.y || 0))[0];
      if (underLogoName) {
        issuerCompany = {
          x: round(underLogoName.x),
          y: round(underLogoName.y),
          width: round(Math.max(underLogoName.width || 160, 160)),
          height: round(underLogoName.size || 8),
          size: round(underLogoName.size || 8),
          color: '#000000',
          align: 'left',
        };
        issuerAddressLines = (spans || [])
          .filter(
            (s) =>
              (s.brandingKind === 'phone' ||
                s.brandingKind === 'email' ||
                s.brandingKind === 'address' ||
                (/^\s*tel\s*:|^\s*email\s*:/i.test(String(s.text || '')) &&
                  s.brandingKind === 'name')) &&
              (s.x || 0) > pageWidth * 0.45 &&
              Math.abs((s.x || 0) - issuerCompany.x) < 40 &&
              (s.y || 0) < issuerCompany.y - 2 &&
              (s.y || 0) > issuerCompany.y - 40,
          )
          .sort((a, b) => (b.y || 0) - (a.y || 0))
          .slice(0, 3)
          .map((s) => boxFrom(s))
          .filter(Boolean);
      }
    }
    const preparedLabel = (spans || []).find((s) =>
      /prepared by\s*:/i.test(String(s.text || '')),
    );
    if (preparedLabel) {
      const value =
        (spans || []).find(
          (s) =>
            (s.brandingKind === 'name' || s.brandingKind === 'email' || /@/.test(String(s.text || ''))) &&
            Math.abs((s.y || 0) - preparedLabel.y) < 3 &&
            (s.x || 0) > (preparedLabel.x || 0) + 20,
        ) || null;
      preparedByValue = {
        x: round((value?.x || (preparedLabel.x || 302) + 60)),
        y: round(preparedLabel.y),
        width: round(value?.width || 160),
        height: round(value?.size || preparedLabel.size || 8),
        size: round(value?.size || preparedLabel.size || 8),
        color: '#000000',
        align: 'left',
      };
    }
    const signedLabel = (spans || []).find((s) =>
      /signed on behalf/i.test(String(s.text || '')),
    );
    const byName = (spans || [])
      .filter(
        (s) =>
          s.brandingKind === 'name' &&
          (s.x || 0) > pageWidth * 0.45 &&
          (s.y || 0) < 120 &&
          (s.y || 0) > 60 &&
          !/@|^\s*tel\s*:/i.test(String(s.text || '')),
      )
      .sort((a, b) => (b.y || 0) - (a.y || 0))[0];
    if (byName || signedLabel) {
      signatureBy = {
        x: round(byName?.x || (signedLabel?.x || 330)),
        y: round(byName?.y || ((signedLabel?.y || 106) - 29)),
        width: round(Math.max(byName?.width || 160, 160)),
        height: round(byName?.size || 8),
        size: round(byName?.size || 8),
        color: '#000000',
        align: 'left',
      };
    }
    const barcodeImage = (images || []).find((i) => i.proposedClass === 'barcode');
    if (barcodeImage && barcodeImage.width > 40 && barcodeImage.height > 6) {
      barcode = {
        x: round(barcodeImage.x),
        y: round(barcodeImage.y),
        width: round(barcodeImage.width),
        height: round(barcodeImage.height),
      };
    }
    // Fresa HBL agent/issuer chrome is black, not invoice blue.
    if (company) company = { ...company, color: '#000000' };
  }

  return {
    code,
    logo,
    company,
    addressLines,
    companyWipes,
    headerBand,
    issuerCompany,
    issuerAddressLines,
    preparedByValue,
    signatureBy,
    barcode,
    footer,
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
