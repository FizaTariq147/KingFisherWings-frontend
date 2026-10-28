/**
 * Fresa sample-report-formats name → structural layout profile.
 * Used so formats match Fresa kinds (Tax India, USA, Arabic, without charges, etc.)
 * not just unique random block chains.
 */

const HEADER = [{ type: 'companyHeader', showContact: true }];
const FOOT = [{ type: 'colorfulFooter' }];

function titleBlock(text, align = 'center') {
  return { type: 'docTitle', text, align, band: true };
}

/** @returns {{ blocks: object[], paper?: string, rtl?: boolean, demoPatch?: object }} */
export function fresaNameProfile(name, code, seed = 0) {
  const n = String(name || '');
  const c = String(code || '').toUpperCase();
  const title =
    n
      .replace(/\s+Report Format.*$/i, '')
      .replace(/\s+List Report Format.*$/i, '')
      .trim()
      .toUpperCase() || c.replace(/_/g, ' ');

  // ——— Invoices (official page Format-1…21 kinds) ———
  if (/Tax Invoice India|TAX_INVOICE_INDIA|FG_TAX_INVOICE/i.test(n + c)) {
    return {
      blocks: [
        ...HEADER,
        titleBlock('TAX INVOICE', 'start'),
        { type: 'exportMetaStrip' },
        { type: 'shipmentDetails', showTermsOfShipment: true, showPlaceOfSupply: true },
        { type: 'partyTriple' },
        { type: 'chargeTable', headerColor: 'fill' },
        { type: 'subtotalBar', variant: 'tax' },
        { type: 'exportClosing' },
        ...FOOT,
      ],
      demoPatch: { docSubtitle: 'Tax Invoice India', currency: 'INR' },
    };
  }
  if (/Summary Invoice/i.test(n)) {
    return {
      blocks: [
        { type: 'summaryHero' },
        ...HEADER,
        titleBlock('SUMMARY INVOICE'),
        { type: 'twoColumn', showBillTo: true, rightMetaFrom: 'metaRows' },
        { type: 'fieldGrid', cols: 2 },
        { type: 'chargeTable', headerColor: 'orange' },
        { type: 'totalsOnly' },
        ...FOOT,
      ],
    };
  }
  if (/Simple Invoice/i.test(n)) {
    return {
      blocks: [
        ...HEADER,
        titleBlock('INVOICE'),
        { type: 'format6Totals' },
        { type: 'twoColumn', showBillTo: true, rightMetaFrom: 'metaRows' },
        { type: 'fieldGrid', cols: 2 },
        { type: 'chargeTable', headerColor: 'primary' },
        { type: 'wordsAndTotal' },
        { type: 'termsBank' },
        ...FOOT,
      ],
      demoPatch: { docSubtitle: /India/i.test(n) ? 'Simple Invoice (India)' : 'Simple Invoice' },
    };
  }
  if (/Standard Invoice Arabic|ARABIC/i.test(n + c)) {
    return {
      blocks: [
        ...HEADER,
        { type: 'arabicHeader' },
        titleBlock('فاتورة / INVOICE'),
        { type: 'twoColumn', showBillTo: true, rightMetaFrom: 'metaRows' },
        { type: 'fieldGrid', cols: 2 },
        { type: 'chargeTable', headerColor: 'primary' },
        { type: 'wordsAndTotal' },
        { type: 'termsBank' },
        ...FOOT,
      ],
      rtl: true,
      demoPatch: { docSubtitle: 'Standard Invoice Arabic' },
    };
  }
  if (/Standard Invoice USA|_USA|USA Format/i.test(n + c) && /INVOICE|Invoice/.test(n + c)) {
    return {
      blocks: [
        ...HEADER,
        titleBlock('INVOICE'),
        { type: 'usaNumberedFields' },
        { type: 'twoColumn', showBillTo: true, rightMetaFrom: 'metaRows' },
        { type: 'chargeTable', headerColor: 'primary' },
        { type: 'wordsAndTotal' },
        { type: 'termsBank' },
        ...FOOT,
      ],
      paper: 'Letter',
      demoPatch: { docSubtitle: 'Standard Invoice USA' },
    };
  }
  if (/Preprinted/i.test(n)) {
    return {
      blocks: [
        ...HEADER,
        titleBlock('TAX INVOICE'),
        { type: 'formatBadge' },
        { type: 'twoColumn', showBillTo: true, rightMetaFrom: 'metaRows' },
        { type: 'fieldGrid', cols: 2 },
        { type: 'chargeTable', headerColor: 'fill' },
        { type: 'wordsAndTotal' },
        { type: 'stampSignature' },
        { type: 'termsBank' },
        ...FOOT,
      ],
    };
  }
  if (/Land Freight|Standard Invoice Land|LAND_FREIGHT/i.test(n + c)) {
    return {
      blocks: [
        ...HEADER,
        { type: 'landFreightHeader', title: 'LAND FREIGHT / TRANSPORTATION INVOICE' },
        { type: 'twoColumn', showBillTo: true, rightMetaFrom: 'metaRows' },
        { type: 'landRoute' },
        { type: 'chargeTable', headerColor: 'primary' },
        { type: 'grandTotalDue' },
        { type: 'termsBank' },
        ...FOOT,
      ],
    };
  }
  if (/Warehouse Invoice/i.test(n)) {
    return {
      blocks: [
        ...HEADER,
        titleBlock('WAREHOUSE INVOICE'),
        { type: 'fieldGrid', cols: 3 },
        { type: 'chargeTable', headerColor: 'fill' },
        { type: 'containerStrip' },
        { type: 'wordsAndTotal' },
        { type: 'termsBank' },
        ...FOOT,
      ],
    };
  }
  if (/Debit Note Vietnam|DEBIT_NOTE/i.test(n + c)) {
    return {
      blocks: [
        ...HEADER,
        titleBlock('DEBIT NOTE'),
        { type: 'twoColumn', showBillTo: true, rightMetaFrom: 'metaRows' },
        { type: 'fieldGrid', cols: 2 },
        { type: 'chargeTable', headerColor: 'accent' },
        { type: 'wordsAndTotal' },
        { type: 'termsBank' },
        ...FOOT,
      ],
    };
  }
  if (/Invoice FCY|FCY/i.test(n + c) && /INVOICE|Invoice/.test(n)) {
    return {
      blocks: [
        ...HEADER,
        titleBlock('INVOICE / DEBIT NOTE'),
        { type: 'shipmentDetails', fcyOrder: true, showQuotation: true },
        { type: 'chargeTable', headerColor: 'fill' },
        { type: 'subtotalBar', variant: 'fcy' },
        { type: 'exportClosing', showBullets: true },
        ...FOOT,
      ],
    };
  }
  if (/KSA|Saudi|Bilingual/i.test(n + c)) {
    return {
      blocks: [
        ...HEADER,
        { type: 'ksaBilingualHeader' },
        titleBlock('TAX INVOICE'),
        { type: 'twoColumn', showBillTo: true },
        { type: 'chargeTable', headerColor: 'primary' },
        { type: 'ksaTotals' },
        { type: 'termsBank' },
        ...FOOT,
      ],
    };
  }

  // ——— Arrival notices ———
  if (/Without Charges/i.test(n) || /WITHOUT_CHARGES/.test(c)) {
    return {
      blocks: [
        ...HEADER,
        titleBlock(title || 'ARRIVAL NOTICE'),
        { type: 'partyTriple' },
        { type: 'fieldGrid', cols: 2 },
        { type: 'containerStrip' },
        { type: 'letterBody' },
        { type: 'signatureRow' },
        ...FOOT,
      ],
      demoPatch: { letterBody: 'Cargo arrived — charges not included on this notice.' },
    };
  }
  if (/Arrival Notice.*USA|ARRIVAL_NOTICE.*USA/i.test(n + c)) {
    return {
      blocks: [
        ...HEADER,
        titleBlock('ARRIVAL NOTICE'),
        { type: 'usaNumberedFields' },
        { type: 'partyTriple' },
        { type: 'fieldGrid', cols: 2 },
        { type: 'chargeTable', headerColor: 'primary' },
        { type: 'termsBank' },
        ...FOOT,
      ],
      paper: 'Letter',
    };
  }
  if (/Arrival Notice|ARRIVAL_NOTICE|Cargo Arrival/i.test(n + c)) {
    const withCharges = !/Without/i.test(n);
    return {
      blocks: [
        ...HEADER,
        titleBlock(title || 'CARGO ARRIVAL NOTICE'),
        { type: 'partyTriple' },
        { type: 'fieldGrid', cols: 2 },
        { type: 'containerStrip' },
        ...(withCharges
          ? [{ type: 'chargeTable', headerColor: 'primary' }, { type: 'wordsAndTotal' }]
          : [{ type: 'letterBody' }]),
        { type: 'termsBank' },
        { type: 'signatureRow' },
        ...FOOT,
      ],
    };
  }

  // ——— HBL / HAWB / MAWB ———
  if (/HBL|HOUSE BILL|FG_HBL/i.test(n + c)) {
    const original = /Original/i.test(n + c);
    const variants = [
      [
        ...HEADER,
        { type: 'formatBadge' },
        titleBlock(original ? 'BILL OF LADING — ORIGINAL' : 'HOUSE BILL OF LADING — DRAFT'),
        { type: 'partyTriple' },
        { type: 'fieldGrid', cols: 2 },
        { type: 'chargeTable', headerColor: 'primary' },
        { type: 'containerStrip' },
        { type: 'termsBank' },
        { type: 'signatureRow' },
        ...FOOT,
      ],
      [
        ...HEADER,
        titleBlock(original ? 'BILL OF LADING — ORIGINAL' : 'HOUSE BILL OF LADING — DRAFT'),
        { type: 'letterBody' },
        { type: 'partyTriple' },
        { type: 'fieldGrid', cols: 3 },
        { type: 'containerStrip' },
        { type: 'chargeTable', headerColor: 'accent' },
        { type: 'termsBank' },
        { type: 'stampSignature' },
        ...FOOT,
      ],
      [
        ...HEADER,
        titleBlock('BILL OF LADING'),
        { type: 'twoColumn', showBillTo: false, rightMetaFrom: 'metaRows' },
        { type: 'partyTriple' },
        { type: 'fieldGrid', cols: 2 },
        { type: 'containerStrip' },
        { type: 'termsBank' },
        { type: 'signatureRow' },
        ...FOOT,
      ],
    ];
    return { blocks: variants[seed % variants.length] };
  }
  if (/HAWB|MAWB|AIR_WAYBILL/i.test(n + c)) {
    const preprinted = /Pre Printed|Preprinted|Original/i.test(n);
    return {
      blocks: [
        ...HEADER,
        titleBlock(/MAWB/i.test(n + c) ? 'MAWB' : 'HAWB'),
        ...(preprinted ? [{ type: 'formatBadge' }] : []),
        { type: 'partyTriple' },
        { type: 'fieldGrid', cols: 2 },
        { type: 'chargeTable', headerColor: preprinted ? 'fill' : 'primary' },
        { type: 'containerStrip' },
        { type: 'termsBank' },
        { type: 'signatureRow' },
        ...FOOT,
      ],
    };
  }

  // ——— WMS ASN ———
  if (/Advance Shipping Note|ASN_|SHIPPING_NOTE/i.test(n + c)) {
    if (/Location/i.test(n)) {
      return {
        blocks: [
          ...HEADER,
          titleBlock('ADVANCE SHIPPING NOTE — LOCATION'),
          { type: 'fieldGrid', cols: 3 },
          { type: 'chargeTable', headerColor: 'fill' },
          { type: 'containerStrip' },
          ...FOOT,
        ],
      };
    }
    if (/Summary/i.test(n)) {
      return {
        blocks: [
          ...HEADER,
          titleBlock('ADVANCE SHIPPING NOTE — SUMMARY'),
          { type: 'summaryHero' },
          { type: 'fieldGrid', cols: 2 },
          { type: 'chargeTable', headerColor: 'primary' },
          ...FOOT,
        ],
      };
    }
    return {
      blocks: [
        ...HEADER,
        titleBlock('ADVANCE SHIPPING NOTE'),
        { type: 'partyTriple' },
        { type: 'fieldGrid', cols: 2 },
        { type: 'chargeTable', headerColor: 'primary' },
        { type: 'jobDescription' },
        { type: 'termsBank' },
        ...FOOT,
      ],
    };
  }

  // ——— Quotation ———
  if (/Quotation|QUOTATION/i.test(n + c)) {
    const air = /Air/i.test(n + c);
    return {
      blocks: [
        ...HEADER,
        titleBlock(air ? 'AIR QUOTATION' : 'QUOTATION'),
        { type: 'letterBody' },
        { type: 'partyTriple' },
        { type: 'fieldGrid', cols: 2 },
        { type: 'chargeTable', headerColor: 'primary' },
        { type: 'wordsAndTotal' },
        { type: 'termsBank' },
        { type: 'signatureRow' },
        ...FOOT,
      ],
      demoPatch: {
        letterBody: 'Thank you for your enquiry. Please find our quotation below.',
      },
    };
  }

  // ——— Delivery order / manifest / stuffing / SI ———
  if (/Delivery Order|DELIVERY_ORDER/i.test(n + c)) {
    return {
      blocks: [
        ...HEADER,
        titleBlock('DELIVERY ORDER'),
        { type: 'partyTriple' },
        { type: 'fieldGrid', cols: 2 },
        { type: 'containerStrip' },
        { type: 'chargeTable', headerColor: 'primary' },
        { type: 'termsBank' },
        { type: 'signatureRow' },
        ...FOOT,
      ],
    };
  }
  if (/Manifest|MANIFEST/i.test(n + c)) {
    return {
      blocks: [
        ...HEADER,
        titleBlock(title || 'CARGO MANIFEST'),
        { type: 'fieldGrid', cols: 3 },
        { type: 'chargeTable', headerColor: 'fill' },
        { type: 'containerStrip' },
        { type: 'termsBank' },
        ...FOOT,
      ],
    };
  }
  if (/Stuffing|STUFFING/i.test(n + c)) {
    return {
      blocks: [
        ...HEADER,
        titleBlock('STUFFING REPORT'),
        { type: 'fieldGrid', cols: 2 },
        { type: 'containerStrip' },
        { type: 'chargeTable', headerColor: 'primary' },
        { type: 'signatureRow' },
        ...FOOT,
      ],
    };
  }
  if (/Shipping Instruction|SHIPPING_INSTRUCTION/i.test(n + c)) {
    return {
      blocks: [
        ...HEADER,
        titleBlock('SHIPPING INSTRUCTION'),
        { type: 'partyTriple' },
        { type: 'fieldGrid', cols: 2 },
        { type: 'letterBody' },
        { type: 'containerStrip' },
        { type: 'termsBank' },
        ...FOOT,
      ],
    };
  }
  if (/Booking Confirmation/i.test(n)) {
    return {
      blocks: [
        ...HEADER,
        titleBlock('BOOKING CONFIRMATION'),
        { type: 'letterBody' },
        { type: 'partyTriple' },
        { type: 'fieldGrid', cols: 2 },
        { type: 'chargeTable', headerColor: 'accent' },
        { type: 'signatureRow' },
        ...FOOT,
      ],
    };
  }

  // ——— Finance ———
  if (/Outstanding Letter|OUTSTANDING_LETTER/i.test(n + c)) {
    return {
      blocks: [
        ...HEADER,
        titleBlock('OUTSTANDING LETTER'),
        { type: 'letterBody' },
        { type: 'twoColumn', showBillTo: true, rightMetaFrom: 'metaRows' },
        { type: 'chargeTable', headerColor: 'primary' },
        { type: 'agingSummary' },
        { type: 'termsBank' },
        { type: 'signatureRow' },
        ...FOOT,
      ],
    };
  }
  if (/Aging|AGING/i.test(n + c)) {
    return {
      blocks: [
        ...HEADER,
        titleBlock(title || 'AGING SUMMARY'),
        { type: 'fieldGrid', cols: 2 },
        { type: 'agingSummary' },
        { type: 'outstandingTable' },
        { type: 'chargeTable', headerColor: 'fill' },
        ...FOOT,
      ],
    };
  }
  if (/Trial Balance|TRIAL_BALANCE/i.test(n + c)) {
    return {
      blocks: [
        ...HEADER,
        titleBlock('TRIAL BALANCE'),
        { type: 'fieldGrid', cols: 3 },
        { type: 'chargeTable', headerColor: 'primary' },
        { type: 'totalsOnly' },
        ...FOOT,
      ],
    };
  }
  if (/Profit and Loss|PROFIT_AND_LOSS|P&L/i.test(n + c)) {
    return {
      blocks: [
        ...HEADER,
        titleBlock('PROFIT AND LOSS'),
        { type: 'summaryHero' },
        { type: 'fieldGrid', cols: 2 },
        { type: 'chargeTable', headerColor: 'orange' },
        { type: 'totalsOnly' },
        ...FOOT,
      ],
    };
  }
  if (/Statement Of Accounts|STATEMENT_OF_ACCOUNTS/i.test(n + c)) {
    return {
      blocks: [
        ...HEADER,
        titleBlock('STATEMENT OF ACCOUNTS'),
        { type: 'twoColumn', showBillTo: true, rightMetaFrom: 'metaRows' },
        { type: 'chargeTable', headerColor: 'primary' },
        { type: 'agingSummary' },
        { type: 'wordsAndTotal' },
        { type: 'termsBank' },
        ...FOOT,
      ],
    };
  }
  if (/Voucher|VOUCHER|Journal/i.test(n + c)) {
    return {
      blocks: [
        ...HEADER,
        titleBlock(title || 'VOUCHER'),
        { type: 'fieldGrid', cols: 2 },
        { type: 'chargeTable', headerColor: 'fill' },
        { type: 'wordsAndTotal' },
        { type: 'signatureRow' },
        ...FOOT,
      ],
    };
  }

  // ——— Ops lists / DSR ———
  if (/List Report|_LIST|Daily Status|DSR|Pending /i.test(n + c)) {
    return {
      blocks: [
        ...HEADER,
        titleBlock(title || 'OPERATIONS LIST'),
        { type: 'fieldGrid', cols: 3 },
        { type: 'chargeTable', headerColor: seed % 2 === 0 ? 'primary' : 'fill' },
        ...(seed % 3 === 0 ? [{ type: 'agingSummary' }] : []),
        ...FOOT,
      ],
    };
  }

  return null;
}
