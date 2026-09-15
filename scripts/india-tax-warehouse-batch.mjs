/**
 * Tax Invoice India / Malaysia / Singapore + Warehouse + Proforma samples.
 * Formats 54–71 from provided Fresa sample PDF links.
 */
export function buildIndiaTaxWarehouseBatch({ layout, simpleClientDemo, BOMINV, THEME_TAX }) {
  const client = {
    billToLabel: 'Bill To',
    billToName: 'DEMO LOGISTICS INDIA PVT LTD',
    billToAddress: '21, PORT BLAIR, KRISHNA ST, MANNARGUDI, TAMIL NADU, INDIA, 676876',
    billToPhone: '798798798',
    fax: '9879878',
    vatNo: '68768978898098',
    invoiceNo: BOMINV.no,
    currency: 'INR',
    words: 'Rupee Four Thousand Seven Hundred Seventy-Six Only',
    total: '4,776.00',
    trnNo: '100617975600003',
  };

  const shipGrid = [
    { k: 'Shipper', v: 'DEMO-SHIPPER ENGG COMPANY' },
    { k: 'Consignee', v: 'DEMO STEEL FACTORY CO. LTD.' },
    { k: 'Shipment No.', v: `${BOMINV.shipment} / 16-MAY-23` },
    { k: 'HBL / HAWB No.', v: 'NSAJED85630124277' },
    { k: 'Place of Receipt', v: 'INMAA-CHENNAI' },
    { k: 'Port of Loading', v: 'NHAVA SHEVA, INDIA' },
    { k: 'Port of Discharge', v: 'JEDDAH, SAUDI ARABIA' },
    { k: 'Place of Delivery', v: 'JEDDAH SAUDI ARABIA' },
    { k: 'ETD', v: '01-MAR-23' },
    { k: 'ETA', v: '20-MAR-23' },
    { k: 'Currency', v: 'INR 1.000000' },
    { k: 'INCO Terms', v: 'FOB' },
    { k: 'Narration', v: 'MBL NO... / HBL NO. NSAJED85630124277 / JOB NO.' },
  ];

  const gstHeaders = [
    'Charges',
    'SAC Code',
    'Qty',
    'Amount / Qty',
    'Currency',
    'Ex.Rate',
    'FCY Amount',
    'Taxable Amount',
    'Non Taxable',
    'SGST %',
    'SGST',
    'CGST %',
    'CGST',
    'I/UGST %',
    'I/UGST',
    'Total Amount (INR)',
  ];
  const gstRows = [
    ['FREIGHT CHARGE', '', '1', '1,500.00', 'INR', '1.00000', '1,500.00', '1,500.00', '', '', '', '', '', '18.00', '270.00', '1,770.00'],
    ['LOCAL CHARGES', '', '1', '800.00', 'INR', '1.00000', '800.00', '800.00', '', '', '', '', '', '18.00', '144.00', '944.00'],
    ['SEA FREIGHT CHARGE', '', '1', '900.00', 'INR', '1.00000', '900.00', '900.00', '', '', '', '', '', '18.00', '162.00', '1,062.00'],
    ['CONTAINER CLEANING FEE', '', '1', '1,000.00', 'INR', '1.00000', '1,000.00', '1,000.00', '', '', '', '', '', '0.00', '0.00', '1,000.00'],
  ];

  const hsnHeaders = [
    'Charges',
    'HSN/SAC',
    'Qty',
    'Amount / Qty',
    'Curr.',
    'Ex.Rate',
    'FCY Amount',
    'Taxable',
    'Non Taxable',
    'SGST %',
    'SGST',
    'CGST %',
    'CGST',
    'IGST %',
    'IGST',
    'Total Amount (INR)',
  ];

  const containerNote = "TTNU0712894 · 40' FLAT · GENERAL CARGO · 3 PACKAGES · 22,700.000 KGS";

  function indiaTax(opts) {
    const {
      title,
      subtitle,
      headers = gstHeaders,
      rows = gstRows,
      metaExtra = [],
      fieldExtra = [],
      taxLines = ['GST18-I/U GST18% 576.00'],
      showGstSummary = true,
      billLabel = 'Bill To',
    } = opts;
    return layout({
      theme: THEME_TAX,
      demo: simpleClientDemo({
        ...client,
        billToLabel: billLabel,
        docSubtitle: subtitle,
        gstNo: '100617975600003',
        metaRows: [
          { k: 'Invoice No.', v: `${BOMINV.no} / 17-MAY-23 (POSTED)` },
          { k: 'Credit Term', v: 'CASH' },
          { k: 'GST NO', v: '100617975600003' },
          ...metaExtra,
        ],
        fieldGrid: [...shipGrid, ...fieldExtra],
        tableHeaders: headers,
        tableRows: rows,
        taxAmountLines: taxLines,
        gstSummary: showGstSummary ? [{ k: 'GST18-I/U GST18%', v: '576.00' }] : undefined,
        containerNote,
        subtotalParts: ['4,200.00', '576.00', '4,776.00'],
      }),
      blocks: [
        { type: 'companyHeader' },
        { type: 'docTitle', text: title, align: 'center' },
        { type: 'twoColumn', showBillTo: true, showCreditTerm: true },
        { type: 'taxAmountBox' },
        { type: 'fieldGrid', cols: 2 },
        { type: 'containerNote' },
        { type: 'chargeTable', headerColor: 'fill' },
        { type: 'wordsAndTotal' },
        { type: 'termsBank' },
        { type: 'colorfulFooter' },
      ],
    });
  }

  return {
    // 54 — tax_invoice_india
    54: indiaTax({
      title: `TAX INVOICE - ${BOMINV.no}`,
      subtitle: 'Tax Invoice India',
      metaExtra: [{ k: 'Variant', v: 'Tax Invoice India' }],
    }),

    // 55 — reimbursement bill
    55: indiaTax({
      title: `REIMBURSEMENT BILL - ${BOMINV.no}`,
      subtitle: 'Reimbursement Bill',
      metaExtra: [{ k: 'Doc Type', v: 'Reimbursement Bill' }],
    }),

    // 56 — fg_tax_invoice_india
    56: layout({
      theme: THEME_TAX,
      demo: simpleClientDemo({
        ...client,
        billToLabel: 'Client',
        metaRows: [
          { k: 'Invoice No.', v: BOMINV.no },
          { k: 'Shipment No.', v: BOMINV.shipment },
          { k: 'Date', v: '17-MAY-23 (POSTED)' },
        ],
        fieldGrid: shipGrid,
        tableHeaders: [
          'Charges',
          'SAC Code',
          'Qty',
          'Amount / Qty',
          'Curr.',
          'Ex.Rate',
          'FCY Amount',
          'Taxable',
          'Non Taxable',
          'SGST %',
          'SGST',
          'CGST %',
          'CGST',
          'I/UGST',
          'Total Amount (INR)',
        ],
        tableRows: [
          ['FREIGHT CHARGE', '', '1', '1,500.00', 'INR', '1.00000', '1,500.00', '1,500.00', '', '9', '135.00', '9', '135.00', '', '1,770.00'],
          ['LOCAL CHARGES', '', '1', '800.00', 'INR', '1.00000', '800.00', '800.00', '', '9', '72.00', '9', '72.00', '', '944.00'],
          ['SEA FREIGHT CHARGE', '', '1', '900.00', 'INR', '1.00000', '900.00', '900.00', '', '9', '81.00', '9', '81.00', '', '1,062.00'],
          ['CONTAINER CLEANING FEE', '', '1', '1,000.00', 'INR', '1.00000', '1,000.00', '1,000.00', '', '', '', '', '', '', '1,000.00'],
        ],
        gstSummary: [
          { k: 'GST 18-CGST9%', v: '135.00' },
          { k: 'GST 18-SGST9%', v: '135.00' },
        ],
        containerNote,
      }),
      blocks: [
        { type: 'companyHeader' },
        { type: 'docTitle', text: 'TAX INVOICE', align: 'center' },
        { type: 'twoColumn', showBillTo: true },
        { type: 'fieldGrid', cols: 2 },
        { type: 'chargeTable', headerColor: 'fill' },
        { type: 'wordsAndTotal' },
        { type: 'termsBank' },
        { type: 'colorfulFooter' },
      ],
    }),

    // 57 — fg format1
    57: indiaTax({
      title: 'TAX INVOICE',
      subtitle: 'FG Format-1 · GST RCM : No',
      headers: hsnHeaders,
      rows: gstRows.map((r) => {
        const copy = [...r];
        copy[1] = '—';
        return copy;
      }),
      metaExtra: [
        { k: 'GST RCM', v: 'No' },
        { k: 'Variant', v: 'FG Format-1' },
      ],
    }),

    // 58 — tax_invoice_india format1
    58: layout({
      theme: THEME_TAX,
      demo: simpleClientDemo({
        ...client,
        billToLabel: 'Bill To',
        metaRows: [
          { k: 'Invoice No.', v: `${BOMINV.no} / 17-MAY-23 (POSTED)` },
          { k: 'Credit Term', v: 'CASH' },
        ],
        fieldGrid: shipGrid,
        tableHeaders: [
          'Charges',
          'Unit',
          'SAC Code',
          'Qty',
          'Amount / Qty',
          'Currency',
          'Ex.Rate',
          'FCY Amount',
          'Taxable',
          'SGST %',
          'CGST %',
          'I/UGST %',
          'Total Amount (INR)',
        ],
        tableRows: [
          ['FREIGHT CHARGE', '1 TON OR 1/2 MEASURE', '', '1', '1,500.00', 'INR', '1.00000', '1,500.00', '1,500.00', '', '', '18', '1,770.00'],
          ['LOCAL CHARGES', '—', '', '1', '800.00', 'INR', '1.00000', '800.00', '800.00', '', '', '18', '944.00'],
          ['SEA FREIGHT CHARGE', '1 TON OR 1/2 MEASURE', '', '1', '900.00', 'INR', '1.00000', '900.00', '900.00', '', '', '18', '1,062.00'],
          ['CONTAINER CLEANING FEE', '1 TON OR 1/2 MEASURE', '', '1', '1,000.00', 'INR', '1.00000', '1,000.00', '1,000.00', '', '', '0', '1,000.00'],
        ],
        taxAmountLines: ['GST18-I/U GST18% 576.00'],
        containerNote,
      }),
      blocks: [
        { type: 'companyHeader' },
        { type: 'docTitle', text: 'INVOICE', align: 'center' },
        { type: 'twoColumn', showBillTo: true, showCreditTerm: true },
        { type: 'taxAmountBox' },
        { type: 'fieldGrid', cols: 2 },
        { type: 'chargeTable', headerColor: 'fill' },
        { type: 'wordsAndTotal' },
        { type: 'termsBank' },
        { type: 'colorfulFooter' },
      ],
    }),

    // 59 — tax_invoice_india format2
    59: indiaTax({
      title: 'TAX INVOICE',
      subtitle: 'Tax Invoice India Format-2',
      metaExtra: [{ k: 'Variant', v: 'Format-2' }],
    }),

    // 60 — fg format2 ORIGINAL FOR RECIPIENT
    60: indiaTax({
      title: `TAX INVOICE - ${BOMINV.no} (ORIGINAL FOR RECIPIENT)`,
      subtitle: 'FG Format-2',
      metaExtra: [{ k: 'Copy', v: 'ORIGINAL FOR RECIPIENT' }],
    }),

    // 61 — fg format6
    61: indiaTax({
      title: `TAX INVOICE - ${BOMINV.no} (ORIGINAL FOR RECIPIENT)`,
      subtitle: 'FG Format-6',
      metaExtra: [
        { k: 'Copy', v: 'ORIGINAL FOR RECIPIENT' },
        { k: 'Variant', v: 'Format-6' },
      ],
      fieldExtra: [{ k: 'Department', v: 'FCL EXPORT' }],
    }),

    // 62 — fg format7
    62: indiaTax({
      title: `TAX INVOICE - ${BOMINV.no} (ORIGINAL FOR RECIPIENT)`,
      subtitle: 'FG Format-7',
      metaExtra: [{ k: 'Variant', v: 'Format-7' }],
    }),

    // 63 — fg format8
    63: indiaTax({
      title: `TAX INVOICE - ${BOMINV.no} (ORIGINAL FOR RECIPIENT)`,
      subtitle: 'FG Format-8',
      metaExtra: [{ k: 'Variant', v: 'Format-8' }],
      fieldExtra: [{ k: 'PO No.', v: '—' }],
    }),

    // 64 — fg format3
    64: indiaTax({
      title: `TAX INVOICE - ${BOMINV.no} (ORIGINAL FOR RECIPIENT)`,
      subtitle: 'FG Format-3',
      metaExtra: [{ k: 'Variant', v: 'Format-3' }],
    }),

    // 65 — fg format4 (S/UGST)
    65: indiaTax({
      title: 'TAX INVOICE',
      subtitle: 'FG Format-4 · GST RCM : No',
      headers: [
        'Charges',
        'Unit',
        'Qty',
        'Amount / Qty',
        'Curr.',
        'Ex.Rate',
        'FCY',
        'Taxable',
        'S/UGST %',
        'S/UGST',
        'CGST %',
        'CGST',
        'I/UGST %',
        'I/UGST',
        'Total (INR)',
      ],
      rows: [
        ['FREIGHT CHARGE', '1 TON OR 1/2 MEASURE', '1', '1,500.00', 'INR', '1.00000', '1,500.00', '1,500.00', '', '', '', '', '18', '270.00', '1,770.00'],
        ['LOCAL CHARGES', '—', '1', '800.00', 'INR', '1.00000', '800.00', '800.00', '', '', '', '', '18', '144.00', '944.00'],
        ['SEA FREIGHT CHARGE', '1 TON OR 1/2 MEASURE', '1', '900.00', 'INR', '1.00000', '900.00', '900.00', '', '', '', '', '18', '162.00', '1,062.00'],
        ['CONTAINER CLEANING FEE', '1 TON OR 1/2 MEASURE', '1', '1,000.00', 'INR', '1.00000', '1,000.00', '1,000.00', '', '', '', '', '0', '0.00', '1,000.00'],
      ],
      metaExtra: [
        { k: 'GST RCM', v: 'No' },
        { k: 'Variant', v: 'Format-4' },
      ],
    }),

    // 66 — fg format5 compact
    66: layout({
      theme: THEME_TAX,
      demo: simpleClientDemo({
        ...client,
        billToLabel: 'INVOICE TO',
        metaRows: [
          { k: 'INVOICE NO.', v: BOMINV.no },
          { k: 'DATE', v: '17-MAY-23' },
          { k: 'NO OF CONTAINER', v: '1' },
        ],
        fieldGrid: [
          { k: 'Shipper', v: 'DEMO-SHIPPER ENGG COMPANY' },
          { k: 'Consignee', v: 'DEMO STEEL FACTORY CO. LTD.' },
          { k: 'Origin', v: 'NHAVA SHEVA, INDIA' },
          { k: 'Destination', v: 'JEDDAH, SAUDI ARABIA' },
          { k: 'HBL', v: 'NSAJED85630124277' },
        ],
        tableHeaders: ['Charges', 'RATE', 'GST %', 'Total Amt (INR)'],
        tableRows: [
          ['FREIGHT CHARGE', '1,500.00', '18', '1,770.00'],
          ['LOCAL CHARGES', '800.00', '18', '944.00'],
          ['SEA FREIGHT CHARGE', '900.00', '18', '1,062.00'],
          ['CONTAINER CLEANING FEE', '1,000.00', '0', '1,000.00'],
        ],
        gstSummary: [{ k: 'IGST', v: '576.00' }],
        containerNote: "TTNU0712894 / 40' FLAT",
      }),
      blocks: [
        { type: 'companyHeader' },
        { type: 'docTitle', text: 'TAX INVOICE', align: 'center' },
        { type: 'twoColumn', showBillTo: true },
        { type: 'fieldGrid', cols: 2 },
        { type: 'chargeTable', headerColor: 'fill' },
        { type: 'wordsAndTotal' },
        { type: 'containerNote' },
        { type: 'termsBank' },
        { type: 'colorfulFooter' },
      ],
    }),

    // 67 — Malaysia tax invoice
    67: layout({
      theme: THEME_TAX,
      demo: simpleClientDemo({
        ...client,
        billToLabel: 'Bill To',
        metaRows: [
          { k: 'INVOICE DATE', v: '17-MAY-23' },
          { k: 'Invoice No.', v: BOMINV.no },
          { k: 'Region', v: 'Malaysia' },
        ],
        fieldGrid: shipGrid.slice(0, 10),
        tableHeaders: ['Charge', 'Curr', 'Rate', 'Qty', 'Amount', 'ROE', 'Tax', 'Total'],
        tableRows: [
          ['FREIGHT CHARGE', 'INR', '1,500.00', '1', '1,500.00', '1.00000', 'GST18 %', '1,500.00'],
          ['LOCAL CHARGES', 'INR', '800.00', '1', '800.00', '1.00000', 'GST18 %', '800.00'],
          ['SEA FREIGHT CHARGE', 'INR', '900.00', '1', '900.00', '1.00000', 'GST18 %', '900.00'],
          ['CONTAINER CLEANING FEE', 'INR', '1,000.00', '1', '1,000.00', '1.00000', 'GST15 %', '1,000.00'],
        ],
        words: 'Rupee Four Thousand Two Hundred Only',
        total: '4,200.00',
      }),
      blocks: [
        { type: 'companyHeader' },
        { type: 'docTitle', text: `TAX INVOICE ${BOMINV.no}`, align: 'center' },
        { type: 'twoColumn', showBillTo: true },
        { type: 'fieldGrid', cols: 2 },
        { type: 'chargeTable', headerColor: 'fill' },
        { type: 'wordsAndTotal' },
        { type: 'termsBank' },
        { type: 'colorfulFooter' },
      ],
    }),

    // 68 — Singapore tax invoice
    68: layout({
      theme: THEME_TAX,
      demo: simpleClientDemo({
        ...client,
        billToLabel: 'Bill To',
        metaRows: [
          { k: 'INVOICE DATE', v: '17-MAY-23' },
          { k: 'Invoice No.', v: BOMINV.no },
          { k: 'Region', v: 'Singapore' },
        ],
        fieldGrid: shipGrid.slice(0, 10),
        tableHeaders: ['Charge', 'Curr', 'Rate', 'Qty', 'Amount', 'ROE', 'Tax', 'Total'],
        tableRows: [
          ['FREIGHT CHARGE', 'INR', '1,500.00', '1', '1,500.00', '1.00000', 'GST18 %', '1,500.00'],
          ['LOCAL CHARGES', 'INR', '800.00', '1', '800.00', '1.00000', 'GST18 %', '800.00'],
          ['SEA FREIGHT CHARGE', 'INR', '900.00', '1', '900.00', '1.00000', 'GST18 %', '900.00'],
          ['CONTAINER CLEANING FEE', 'INR', '1,000.00', '1', '1,000.00', '1.00000', 'GST15 %', '1,000.00'],
        ],
        words: 'Rupee Four Thousand Two Hundred Only',
        total: '4,200.00',
      }),
      blocks: [
        { type: 'companyHeader' },
        { type: 'docTitle', text: `TAX INVOICE ${BOMINV.no}`, align: 'center' },
        { type: 'twoColumn', showBillTo: true },
        { type: 'fieldGrid', cols: 2 },
        { type: 'chargeTable', headerColor: 'fill' },
        { type: 'wordsAndTotal' },
        { type: 'termsBank' },
        { type: 'colorfulFooter' },
      ],
    }),

    // 69 — warehouse invoice
    69: layout({
      theme: THEME_TAX,
      demo: simpleClientDemo({
        ...client,
        billToLabel: 'Client',
        words: 'Rupee Four Thousand Two Hundred Only',
        total: '4,200.00',
        metaRows: [
          { k: 'Invoice No.', v: BOMINV.no },
          { k: 'Date', v: '17-MAY-23 (POSTED)' },
        ],
        fieldGrid: [
          { k: 'Warehouse', v: 'DEMO WH - MUMBAI' },
          { k: 'Client Ref', v: '—' },
          { k: 'Shipper', v: 'DEMO-SHIPPER ENGG COMPANY' },
          { k: 'Consignee', v: 'DEMO STEEL FACTORY CO. LTD.' },
        ],
        tableHeaders: ['Charges', 'GRN / GDN No', 'Client Ref No.', 'Unit', 'Qty', 'Amount'],
        tableRows: [
          ['FREIGHT CHARGE', 'GRN-001', '—', 'PKG', '1', '1,500.00'],
          ['LOCAL CHARGES', 'GRN-001', '—', 'PKG', '1', '800.00'],
          ['SEA FREIGHT CHARGE', 'GDN-002', '—', 'PKG', '1', '900.00'],
          ['CONTAINER CLEANING FEE', 'GDN-002', '—', 'PKG', '1', '1,000.00'],
        ],
      }),
      blocks: [
        { type: 'companyHeader' },
        { type: 'docTitle', text: `INVOICE - ${BOMINV.no}`, align: 'center' },
        { type: 'twoColumn', showBillTo: true },
        { type: 'fieldGrid', cols: 2 },
        { type: 'chargeTable', headerColor: 'fill' },
        { type: 'wordsAndTotal' },
        { type: 'termsBank' },
        { type: 'colorfulFooter' },
      ],
    }),

    // 70 — warehouse india format
    70: indiaTax({
      title: `INVOICE - ${BOMINV.no}`,
      subtitle: 'Warehouse Invoice India Format',
      billLabel: 'Client',
      metaExtra: [{ k: 'Warehouse Format', v: 'India' }],
    }),

    // 71 — proforma all charges
    71: layout({
      theme: THEME_TAX,
      demo: {
        billToLabel: 'Bill To',
        billToName: '4G LOGISTICS INDIA PVT LTD',
        billToAddress: '10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD, CHENNAI TAMIL NADU 600084',
        invoiceNo: 'CAE190028',
        currency: 'INR',
        words: 'Rupee One Thousand Two Hundred Fifty Only',
        total: '1,250.00',
        partyLeft: {
          title: 'Bill To',
          lines: ['4G LOGISTICS INDIA PVT LTD', '10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD', 'CHENNAI TAMIL NADU 600084'],
        },
        partyMid: {
          title: 'Shipper',
          lines: ['BABU SECTOR PTLTD', '144/78B GKM TOWERS MUTHUSAMY STREET', 'NEELANKARAI CHENNAI'],
        },
        partyThird: {
          title: 'Consignee',
          lines: ['AL NASER TRADING COMPANY LLC', '30 AL MAKTHOOM BUILDING', 'SHARJAH UNITED ARAB EMIRATES'],
        },
        partyNotify: {
          title: 'Notify',
          lines: ['AL NASER TRADING COMPANY LLC', 'SHARJAH UNITED ARAB EMIRATES'],
        },
        metaRows: [{ k: 'Proforma', v: 'CAE190028 / 20-FEB-19' }],
        fieldGrid: [
          { k: 'Job No', v: 'CAE190028 / 20-FEB-19' },
          { k: 'Shipment No', v: 'B/AE/19/0112 / 18-FEB-19' },
          { k: 'MAWB / MBL No', v: '17623456882 / 18-FEB-19' },
          { k: 'HAWB / HBL No', v: 'MAA/DXB/1900014 / 18-FEB-19' },
          { k: 'Place of Receipt', v: 'CHENNAI' },
          { k: 'Port of Loading', v: 'CHENNAI, INDIA' },
          { k: 'Port of Discharge', v: 'DUBAI INTERNATIONAL AIRPORT' },
          { k: 'Place of Delivery', v: 'DUBAI' },
          { k: 'ETD / ETA', v: '20-FEB-19 / 20-FEB-19' },
          { k: 'Airline / Carrier', v: 'EMIRATES' },
          { k: 'Flight', v: 'EK9876' },
          { k: 'Service Type', v: 'AIR' },
          { k: 'PP / CC', v: 'PREPAID' },
        ],
        tableHeaders: [
          'Charge',
          'Unit',
          'PP/CC',
          'Currency',
          'Amount/Unit',
          'Qty',
          'FCY Amount',
          'Ex.Rate',
          'Amount',
          'Taxable',
        ],
        tableRows: [
          ['FREIGHT', 'KG', 'PP', 'INR', '10.00', '125', '1,250.00', '1.00000', '1,250.00', '1,250.00'],
        ],
        containerNote: 'STC: PAPER CUPS · 100 pcs · 1,250.000 KGS',
      },
      blocks: [
        { type: 'companyHeader' },
        { type: 'docTitle', text: 'PROFORMA INVOICE', align: 'center' },
        { type: 'partyTriple' },
        { type: 'fieldGrid', cols: 2 },
        { type: 'containerNote' },
        { type: 'chargeTable', headerColor: 'fill' },
        { type: 'wordsAndTotal' },
        { type: 'colorfulFooter' },
      ],
    }),
  };
}
