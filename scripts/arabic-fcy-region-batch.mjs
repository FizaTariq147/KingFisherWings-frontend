/**
 * Arabic / FCY / USA / Malaysia / Kampala / Courier / Summary / Tax samples.
 * Formats 34–53 — from fg_standard_invoice_arabic* + related sample PDF links.
 */
export function buildArabicFcyRegionBatch({ layout, simpleClientDemo, BOMINV, THEME_TAX }) {
  const client = {
    billToLabel: 'Customer',
    billToName: 'DEMO LOGISTICS INDIA PVT LTD',
    billToAddress: '21, PORT BLAIR, KRISHNA ST, MANNARGUDI, TAMIL NADU, INDIA, 676876',
    billToPhone: '798798798',
    fax: '9879878',
    vatNo: '68768978898098',
    invoiceNo: BOMINV.no,
    currency: 'INR',
    words: 'Rupee Four Thousand Two Hundred Only',
    total: '4,200.00',
  };

  const arabicChargeHeaders = [
    'Charge Description',
    'Curr',
    'Rate Per Unit',
    'Unit',
    'Curr. Amount',
    'ROE',
    'Total Price excl. VAT',
    'VAT%',
    'VAT Amount',
    'Total',
  ];
  const arabicChargeRows = [
    ['FREIGHT CHARGE', 'INR', '1,500.00', '1', '1,500.00', '1.00000', '1,500.00', '18', '', '1,500.00'],
    ['LOCAL CHARGES', 'INR', '800.00', '1', '800.00', '1.00000', '800.00', '18', '', '800.00'],
    ['SEA FREIGHT CHARGE', 'INR', '900.00', '1', '900.00', '1.00000', '900.00', '18', '', '900.00'],
    ['CONTAINER CLEANING FEE', 'INR', '1,000.00', '1', '1,000.00', '1.00000', '1,000.00', '15', '', '1,000.00'],
  ];

  const arabicFmt1Headers = [
    'Charges Details',
    'QTY',
    'Unit',
    'Curr',
    'Unit Price',
    'Exch. Rate',
    'Amount',
    'VAT %',
    'VAT',
    'Total Amt',
  ];
  const arabicFmt1Rows = [
    ['FREIGHT CHARGE', '1', '1 TON OR 1/2 MEASURE', 'INR', '1,500.00', '1.00000', '1,500.00', '18', '', '1,500.00'],
    ['LOCAL CHARGES', '1', '—', 'INR', '800.00', '1.00000', '800.00', '18', '', '800.00'],
    ['SEA FREIGHT CHARGE', '1', '1 TON OR 1/2 MEASURE', 'INR', '900.00', '1.00000', '900.00', '18', '', '900.00'],
    ['CONTAINER CLEANING FEE', '1', '1 TON OR 1/2 MEASURE', 'INR', '1,000.00', '1.00000', '1,000.00', '15', '', '1,000.00'],
  ];

  const shipGridBase = [
    { k: 'Shipper', v: 'DEMO-SHIPPER ENGG COMPANY' },
    { k: 'Consignee', v: 'DEMO STEEL FACTORY CO. LTD.' },
    { k: 'Place of Origin', v: 'NHAVA SHEVA, INDIA' },
    { k: 'Final destination', v: 'JEDDAH, SAUDI ARABIA' },
    { k: 'House No.', v: 'NSAJED85630124277' },
    { k: 'Number of Packs', v: '3.00' },
    { k: 'Weight in Kgs', v: '22,700.000' },
    { k: 'ETD', v: '01-MAR-23' },
    { k: 'ETA', v: '20-MAR-23' },
    { k: 'Narration', v: 'MBL NO... / HBL NO. NSAJED85630124277 / JOB NO.' },
  ];

  function arabicStandard(opts) {
    const {
      title,
      metaExtra = [],
      fieldExtra = [],
      headers = arabicChargeHeaders,
      rows = arabicChargeRows,
      rtl = true,
      showContainer = true,
      accentTitle,
    } = opts;
    return layout({
      theme: THEME_TAX,
      rtl,
      demo: simpleClientDemo({
        ...client,
        billToLabel: 'Customer',
        docSubtitle: accentTitle || title,
        metaRows: [
          { k: 'Customer VAT No.', v: '68768978898098' },
          { k: 'Invoice No.', v: BOMINV.no },
          { k: 'Invoice Date', v: '17-MAY-23 (POSTED)' },
          { k: 'Payment Due Date', v: '17-MAY-23' },
          ...metaExtra,
        ],
        fieldGrid: [...shipGridBase, ...fieldExtra],
        tableHeaders: headers,
        tableRows: rows,
        containerNote: showContainer ? "TTNU0712894 · 1 × 40' FLAT" : undefined,
        totalLabel: 'Total in : INR',
      }),
      blocks: [
        { type: 'companyHeader' },
        { type: 'arabicHeader' },
        { type: 'docTitle', text: title, align: 'center' },
        { type: 'twoColumn', showBillTo: true },
        { type: 'fieldGrid', cols: 2 },
        { type: 'chargeTable', headerColor: 'fill' },
        { type: 'wordsAndTotal' },
        ...(showContainer ? [{ type: 'containerNote' }] : []),
        { type: 'termsBank' },
        { type: 'colorfulFooter' },
      ],
    });
  }

  function arabicFormat1(variantLabel) {
    return layout({
      theme: THEME_TAX,
      rtl: true,
      demo: simpleClientDemo({
        ...client,
        billToLabel: 'فاتورة إلى / Bill To',
        docSubtitle: variantLabel,
        metaRows: [
          { k: 'رقم الفاتورة / Invoice No.', v: BOMINV.no },
          { k: 'تاريخ / Date', v: '17-MAY-23 (POSTED)' },
          { k: 'الرقم الضريبي / VAT', v: '68768978898098' },
          { k: 'رقم بوليصة / BL', v: 'NSAJED85630124277' },
        ],
        fieldGrid: [
          { k: 'مكان التحميل / Place of Loading', v: 'INMAA-CHENNAI' },
          { k: 'موعد المغادرة / ETD', v: '01-MAR-23' },
          { k: 'مكان التوصيل / Place of Delivery', v: 'JEDDAH SAUDI ARABIA' },
          { k: 'موعد الوصول / ETA', v: '20-MAR-23' },
          { k: 'الشاحن / Shipper', v: 'DEMO-SHIPPER ENGG COMPANY' },
          { k: 'المرسل إليه / Consignee', v: 'DEMO STEEL FACTORY CO. LTD.' },
        ],
        tableHeaders: arabicFmt1Headers,
        tableRows: arabicFmt1Rows,
        containerHeaders: ['Container', 'Type', 'Description'],
        containerRow: ['TTNU0712894', "40' FLAT", 'GENERAL CARGO'],
        totalLabel: 'INR',
      }),
      blocks: [
        { type: 'companyHeader' },
        { type: 'arabicHeader' },
        { type: 'docTitle', text: 'فاتورة ضريبية', align: 'center' },
        { type: 'twoColumn', showBillTo: true },
        { type: 'fieldGrid', cols: 2 },
        { type: 'chargeTable', headerColor: 'fill' },
        { type: 'wordsAndTotal' },
        { type: 'containerNote' },
        { type: 'termsBank' },
        { type: 'colorfulFooter' },
      ],
    });
  }

  return {
    // 34 — fg_standard_invoice_arabic
    34: arabicStandard({
      title: 'TAX INVOICE  فاتورة ضريبية',
      metaExtra: [{ k: 'Job Number', v: '—' }],
    }),
    // 35 — arabic format1 ref 939
    35: arabicFormat1('Arabic Format-1'),
    // 36 — arabic format1 ref 941 (alt)
    36: arabicFormat1('Arabic Format-1 Alt'),
    // 37 — arabic oman
    37: arabicStandard({
      title: 'TAX INVOICE OMAN  فاتورة',
      accentTitle: 'OMAN',
      metaExtra: [{ k: 'Region', v: 'OMAN' }],
    }),
    // 38 — arabic format2
    38: arabicStandard({
      title: 'TAX INVOICE  فاتورة ضريبية',
      metaExtra: [
        { k: 'Master Number', v: 'NSAJED85630124277' },
        { k: 'Notify Name', v: 'ENGLISH' },
      ],
      fieldExtra: [{ k: 'Volume in CBM', v: '—' }],
    }),
    // 39 — arabic format3
    39: arabicStandard({
      title: 'TAX INVOICE  فاتورة ضريبية',
      fieldExtra: [
        { k: 'Vessel / Flight', v: 'CAP SAN JUAN' },
        { k: 'Voyage / Flight No.', v: '310W' },
        { k: 'Shipper Ref No.', v: '—' },
        { k: 'Customer P/O No.', v: '—' },
      ],
    }),
    // 40 — arabic format4
    40: arabicStandard({
      title: 'TAX INVOICE  فاتورة ضريبية',
      metaExtra: [{ k: 'Attention', v: 'ENGLISH' }],
      showContainer: true,
    }),
    // 41 — arabic format5
    41: arabicStandard({
      title: 'TAX INVOICE  فاتورة ضريبية',
      fieldExtra: [{ k: 'Remarks', v: '—' }],
    }),
    // 42 — arabic format7
    42: arabicStandard({
      title: 'TAX INVOICE  فاتورة ضريبية',
      metaExtra: [{ k: 'Customer VAT No.', v: '68768978898098' }],
      fieldExtra: [
        { k: 'IGM No.', v: '—' },
        { k: 'INCO Terms', v: 'FOB' },
      ],
    }),

    // 43 — courier
    43: layout({
      theme: THEME_TAX,
      demo: simpleClientDemo({
        ...client,
        billToLabel: 'Acc. Name',
        words: 'Rupee Four Thousand Seven Hundred Seventy-Six Only',
        total: '4,776.00',
        metaRows: [
          { k: 'Invoice No.', v: BOMINV.no },
          { k: 'Invoice Date', v: '17-MAY-23 (POSTED)' },
          { k: 'Invoice Period', v: 'MAY-23' },
          { k: 'Job No.', v: '—' },
        ],
        tableHeaders: ['L.No.', 'Charges', 'Destination', 'Group', 'Weight', 'Amount (INR)'],
        tableRows: [
          ['1', 'FREIGHT CHARGE', 'JEDDAH, SAUDI ARABIA', 'PACKAGES', '', '1,500.00'],
          ['2', 'LOCAL CHARGES', 'JEDDAH, SAUDI ARABIA', 'PACKAGES', '', '800.00'],
          ['3', 'SEA FREIGHT CHARGE', 'JEDDAH, SAUDI ARABIA', 'PACKAGES', '', '900.00'],
          ['4', 'CONTAINER CLEANING FEE', 'JEDDAH, SAUDI ARABIA', 'PACKAGES', '', '1,000.00'],
        ],
        totalLabel: 'Total Amount',
      }),
      blocks: [
        { type: 'companyHeader' },
        { type: 'docTitle', text: 'INVOICE', align: 'center' },
        { type: 'twoColumn', showBillTo: true },
        { type: 'chargeTable', headerColor: 'fill' },
        { type: 'wordsAndTotal' },
        { type: 'termsBank' },
        { type: 'colorfulFooter' },
      ],
    }),

    // 44 — standard_invoice_fcy
    44: layout({
      theme: THEME_TAX,
      demo: simpleClientDemo({
        ...client,
        billToLabel: 'Agent',
        words: 'Rupee Four Thousand Seven Hundred Seventy-Six Only',
        total: '4,776.00',
        metaRows: [
          { k: 'Invoice No.', v: `${BOMINV.no} / 17-MAY-23 (POSTED)` },
          { k: 'Credit Term', v: 'CASH' },
          { k: 'Due Date', v: '17-MAY-23' },
        ],
        fieldGrid: [
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
          { k: 'INCO Terms', v: 'FOB' },
          { k: 'Narration', v: 'MBL NO... / HBL NO. NSAJED85630124277 / JOB NO.' },
        ],
        containerHeaders: ['Container No.', 'Type', 'Description', 'No of Pcs', 'Gross Weight', 'Volume'],
        containerRow: ['TTNU0712894', "40' FLAT", 'GENERAL CARGO', '3 PACKAGES', '22,700.000 KGS', '22,700.000'],
        tableHeaders: ['Charges', 'Currency', 'Qty', 'Amount / Qty', 'FCY Amount', 'Total Amount (INR)'],
        tableRows: [
          ['FREIGHT CHARGE', 'INR', '1', '1,500.00', '1,500.00', '1,500.00'],
          ['LOCAL CHARGES', 'INR', '1', '800.00', '800.00', '800.00'],
          ['SEA FREIGHT CHARGE', 'INR', '1', '900.00', '900.00', '900.00'],
          ['CONTAINER CLEANING FEE', 'INR', '1', '1,000.00', '1,000.00', '1,000.00'],
          ['I/U GST 18%', 'INR', '1', '576.00', '576.00', '576.00'],
        ],
      }),
      blocks: [
        { type: 'companyHeader' },
        { type: 'docTitle', text: 'INVOICE / DEBIT NOTE', align: 'center' },
        { type: 'twoColumn', showBillTo: true, showCreditTerm: true },
        { type: 'fieldGrid', cols: 2 },
        { type: 'containerNote' },
        { type: 'chargeTable', headerColor: 'fill' },
        { type: 'wordsAndTotal' },
        { type: 'termsBank' },
        { type: 'colorfulFooter' },
      ],
    }),

    // 45 — standard_invoice_fcy_format2
    45: layout({
      theme: THEME_TAX,
      demo: simpleClientDemo({
        ...client,
        billToLabel: 'Invoice Receiver',
        words: 'Rupee Four Thousand Seven Hundred Seventy-Six Only',
        total: '4,776.00',
        taxAmountLines: ['GST18', 'GST 15%'],
        metaRows: [
          { k: 'Invoice No.', v: BOMINV.no },
          { k: 'Date', v: '17-MAY-23 (POSTED)' },
          { k: 'Movement Type', v: 'FCL' },
        ],
        fieldGrid: [
          { k: 'Port of Loading', v: 'NHAVA SHEVA, INDIA' },
          { k: 'Port of Discharge', v: 'JEDDAH, SAUDI ARABIA' },
          { k: 'ETD', v: '01-MAR-23' },
          { k: 'ETA', v: '20-MAR-23' },
          { k: 'Vessel/Voyage', v: 'CAP SAN JUAN / 310W' },
          { k: 'Narration', v: 'MBL NO... / HBL NO. NSAJED85630124277 / JOB NO.' },
        ],
        tableHeaders: ['BL No', 'Description', 'Shipper', 'Place of Delivery', 'Units', 'Amount (INR)'],
        tableRows: [
          ['NSAJED85630124277', 'FREIGHT CHARGE', 'DEMO-SHIPPER ENGG COMPANY', 'JEDDAH SAUDI ARABIA', '1 × 1,500.00', '1,500.00'],
          ['NSAJED85630124277', 'LOCAL CHARGES', 'DEMO-SHIPPER ENGG COMPANY', 'JEDDAH SAUDI ARABIA', '1 × 800.00', '800.00'],
          ['NSAJED85630124277', 'SEA FREIGHT CHARGE', 'DEMO-SHIPPER ENGG COMPANY', 'JEDDAH SAUDI ARABIA', '1 × 900.00', '900.00'],
          ['NSAJED85630124277', 'CONTAINER CLEANING FEE', 'DEMO-SHIPPER ENGG COMPANY', 'JEDDAH SAUDI ARABIA', '1 × 1,000.00', '1,000.00'],
        ],
        containerNote: "Container : TTNU0712894 / 40' FLAT",
      }),
      blocks: [
        { type: 'companyHeader' },
        { type: 'docTitle', text: 'TAX INVOICE', align: 'center' },
        { type: 'twoColumn', showBillTo: true },
        { type: 'taxAmountBox' },
        { type: 'fieldGrid', cols: 2 },
        { type: 'chargeTable', headerColor: 'fill' },
        { type: 'wordsAndTotal' },
        { type: 'containerNote' },
        { type: 'termsBank' },
        { type: 'colorfulFooter' },
      ],
    }),

    // 46 — fg_standard_invoice_fcy
    46: layout({
      theme: THEME_TAX,
      demo: simpleClientDemo({
        ...client,
        billToLabel: 'Agent',
        words: 'Rupee Four Thousand Seven Hundred Seventy-Six Only',
        total: '4,776.00',
        metaRows: [
          { k: 'Invoice No.', v: `${BOMINV.no} / 17-MAY-23 (POSTED)` },
          { k: 'Credit Term', v: 'CASH' },
          { k: 'Due Date', v: '17-MAY-23' },
          { k: 'Shipment No.', v: `${BOMINV.shipment} / 16-MAY-23` },
        ],
        fieldGrid: [
          { k: 'Shipper', v: 'DEMO-SHIPPER ENGG COMPANY' },
          { k: 'Consignee', v: 'DEMO STEEL FACTORY CO. LTD.' },
          { k: 'HBL No.', v: 'NSAJED85630124277' },
          { k: 'Place of Receipt', v: 'INMAA-CHENNAI' },
          { k: 'Port of Loading', v: 'NHAVA SHEVA, INDIA' },
          { k: 'Port of Discharge', v: 'JEDDAH, SAUDI ARABIA' },
          { k: 'Place of Delivery', v: 'JEDDAH SAUDI ARABIA' },
          { k: 'ETD', v: '01-MAR-23' },
          { k: 'ETA', v: '20-MAR-23' },
          { k: 'INCO Terms', v: 'FOB' },
          { k: 'IRN No', v: '—' },
          { k: 'Narration', v: 'MBL NO... / HBL NO. NSAJED85630124277 / JOB NO.' },
        ],
        tableHeaders: ['Charges', 'Currency', 'Qty', 'Amount / Qty', 'FCY Amount', 'Total Amount (INR)'],
        tableRows: [
          ['FREIGHT CHARGE', 'INR', '1', '1,500.00', '1,500.00', '1,770.00'],
          ['LOCAL CHARGES', 'INR', '1', '800.00', '800.00', '944.00'],
          ['SEA FREIGHT CHARGE', 'INR', '1', '900.00', '900.00', '1,062.00'],
          ['CONTAINER CLEANING FEE', 'INR', '1', '1,000.00', '1,000.00', '1,000.00'],
          ['I/U GST 18%', 'INR', '1', '576.00', '576.00', '576.00'],
        ],
        containerNote: "TTNU0712894 · 40' FLAT · GENERAL CARGO · 3 PACKAGES",
        totalLabel: 'Total : INR',
      }),
      blocks: [
        { type: 'companyHeader' },
        { type: 'docTitle', text: 'INVOICE / DEBIT NOTE', align: 'center' },
        { type: 'twoColumn', showBillTo: true, showCreditTerm: true },
        { type: 'fieldGrid', cols: 2 },
        { type: 'chargeTable', headerColor: 'fill' },
        { type: 'wordsAndTotal' },
        { type: 'containerNote' },
        { type: 'termsBank' },
        { type: 'colorfulFooter' },
      ],
    }),

    // 47 — kampala
    47: layout({
      theme: THEME_TAX,
      demo: simpleClientDemo({
        ...client,
        billToLabel: 'Client',
        trnNo: '100617975600003',
        metaRows: [
          { k: 'Invoice No.', v: BOMINV.no },
          { k: 'Date', v: '17-MAY-23 (POSTED)' },
          { k: 'TRN NO', v: '100617975600003' },
        ],
        fieldGrid: [
          { k: 'Shipper', v: 'DEMO-SHIPPER ENGG COMPANY' },
          { k: 'Consignee', v: 'DEMO STEEL FACTORY CO. LTD.' },
          { k: 'Shipment No.', v: BOMINV.shipment },
          { k: 'Place of Receipt', v: 'INMAA-CHENNAI' },
          { k: 'Port of Loading', v: 'NHAVA SHEVA, INDIA' },
          { k: 'Port of Discharge', v: 'JEDDAH, SAUDI ARABIA' },
          { k: 'Place of Delivery', v: 'JEDDAH SAUDI ARABIA' },
          { k: 'ETD', v: '01-MAR-23' },
          { k: 'ETA', v: '20-MAR-23' },
          { k: 'Narration', v: 'MBL NO... / HBL NO. NSAJED85630124277 / JOB NO.' },
        ],
        tableHeaders: [
          'Charges',
          'Unit',
          'Qty',
          'Amount / Qty',
          'Currency',
          'Ex.Rate',
          'Currency Amount',
          'Amount (INR)',
        ],
        tableRows: [
          ['FREIGHT CHARGE', '1 TON OR 1/2 MEASURE', '1', '1,500.00', 'INR', '1.000000', '1,500.00', '1,500.00'],
          ['LOCAL CHARGES', '—', '1', '800.00', 'INR', '1.000000', '800.00', '800.00'],
          ['SEA FREIGHT CHARGE', '1 TON OR 1/2 MEASURE', '1', '900.00', 'INR', '1.000000', '900.00', '900.00'],
          ['CONTAINER CLEANING FEE', '1 TON OR 1/2 MEASURE', '1', '1,000.00', 'INR', '1.000000', '1,000.00', '1,000.00'],
        ],
        containerNote: "TTNU0712894 · 40' FLAT · 3 pcs · 22,700.00",
      }),
      blocks: [
        { type: 'companyHeader', showContact: true },
        { type: 'officeAddressBand' },
        { type: 'docTitle', text: `TAX INVOICE - ${BOMINV.no}`, align: 'center' },
        { type: 'twoColumn', showBillTo: true },
        { type: 'fieldGrid', cols: 2 },
        { type: 'chargeTable', headerColor: 'fill' },
        { type: 'wordsAndTotal' },
        { type: 'containerNote' },
        { type: 'termsBank' },
        { type: 'colorfulFooter' },
      ],
    }),

    // 48 — USA
    48: layout({
      theme: THEME_TAX,
      paper: 'Letter',
      demo: simpleClientDemo({
        ...client,
        billToLabel: 'Bill To',
        metaRows: [
          { k: 'INVOICE#', v: BOMINV.no },
          { k: 'Date', v: '17-MAY-23 (POSTED)' },
        ],
        fieldGrid: [
          { k: 'Shipper', v: 'DEMO-SHIPPER ENGG COMPANY' },
          { k: 'Consignee', v: 'DEMO STEEL FACTORY CO. LTD.' },
          { k: 'Origin', v: 'NHAVA SHEVA, INDIA' },
          { k: 'Destination', v: 'JEDDAH, SAUDI ARABIA' },
          { k: 'ETD / ETA', v: '01-MAR-23 / 20-MAR-23' },
          { k: 'HBL', v: 'NSAJED85630124277' },
        ],
        tableHeaders: ['Charges', 'Qty', 'Amount / Qty', 'Total Amount (INR)'],
        tableRows: [
          ['FREIGHT CHARGE', '1', '1,500.00', '1,500.00'],
          ['LOCAL CHARGES', '1', '800.00', '800.00'],
          ['SEA FREIGHT CHARGE', '1', '900.00', '900.00'],
          ['CONTAINER CLEANING FEE', '1', '1,000.00', '1,000.00'],
        ],
      }),
      blocks: [
        { type: 'companyHeader' },
        { type: 'docTitle', text: 'INVOICE', align: 'center' },
        { type: 'twoColumn', showBillTo: true },
        { type: 'fieldGrid', cols: 2 },
        { type: 'chargeTable', headerColor: 'fill' },
        { type: 'wordsAndTotal' },
        { type: 'termsBank' },
        { type: 'colorfulFooter' },
      ],
    }),

    // 49 — tax format16 cum AN
    49: layout({
      theme: THEME_TAX,
      demo: simpleClientDemo({
        ...client,
        billToLabel: 'Client',
        words: 'Rupee Four Thousand Seven Hundred Seventy-Six Only',
        total: '4,776.00',
        metaRows: [
          { k: 'Invoice No.', v: BOMINV.no },
          { k: 'Date', v: '17-MAY-23 (POSTED)' },
          { k: 'Variant', v: 'Format-16 Cum AN' },
        ],
        fieldGrid: [
          { k: 'Shipper', v: 'DEMO-SHIPPER ENGG COMPANY' },
          { k: 'Consignee', v: 'DEMO STEEL FACTORY CO. LTD.' },
          { k: 'Port of Loading', v: 'NHAVA SHEVA, INDIA' },
          { k: 'Port of Discharge', v: 'JEDDAH, SAUDI ARABIA' },
          { k: 'ETD', v: '01-MAR-23' },
          { k: 'ETA', v: '20-MAR-23' },
          { k: 'HBL', v: 'NSAJED85630124277' },
          { k: 'Narration', v: 'MBL NO... / HBL NO. NSAJED85630124277 / JOB NO.' },
        ],
        tableHeaders: [
          'Charge',
          'Tax %',
          'Qty',
          'Unit',
          'Cur.',
          'Ex.Rate',
          'Amount / Qty',
          'FCY',
          'Taxable',
          'Tax Amt',
          'Total',
        ],
        tableRows: [
          ['FREIGHT CHARGE', '18', '1', '1 TON OR 1/2 MEASURE', 'INR', '1.000000', '1,500.00', '1,500.00', '1,500.00', '270.00', '1,770.00'],
          ['LOCAL CHARGES', '18', '1', '—', 'INR', '1.000000', '800.00', '800.00', '800.00', '144.00', '944.00'],
          ['SEA FREIGHT CHARGE', '18', '1', '1 TON OR 1/2 MEASURE', 'INR', '1.000000', '900.00', '900.00', '900.00', '162.00', '1,062.00'],
          ['CONTAINER CLEANING FEE', '15', '1', '1 TON OR 1/2 MEASURE', 'INR', '1.000000', '1,000.00', '1,000.00', '1,000.00', '', '1,000.00'],
        ],
      }),
      blocks: [
        { type: 'companyHeader' },
        { type: 'docTitle', text: `TAX INVOICE - ${BOMINV.no}`, align: 'center' },
        { type: 'twoColumn', showBillTo: true },
        { type: 'fieldGrid', cols: 2 },
        { type: 'chargeTable', headerColor: 'fill' },
        { type: 'wordsAndTotal' },
        { type: 'termsBank' },
        { type: 'colorfulFooter' },
      ],
    }),

    // 50 — Malaysia
    50: layout({
      theme: THEME_TAX,
      demo: simpleClientDemo({
        ...client,
        billToLabel: 'Client',
        metaRows: [
          { k: 'Invoice No.', v: BOMINV.no },
          { k: 'Date', v: '17-MAY-23 (POSTED)' },
          { k: 'Region', v: 'Malaysia' },
        ],
        fieldGrid: [
          { k: 'Shipper', v: 'DEMO-SHIPPER ENGG COMPANY' },
          { k: 'Consignee', v: 'DEMO STEEL FACTORY CO. LTD.' },
          { k: 'Place of Receipt', v: 'INMAA-CHENNAI' },
          { k: 'Port of Loading', v: 'NHAVA SHEVA, INDIA' },
          { k: 'Port of Discharge', v: 'JEDDAH, SAUDI ARABIA' },
          { k: 'Place of Delivery', v: 'JEDDAH SAUDI ARABIA' },
          { k: 'ETD', v: '01-MAR-23' },
          { k: 'ETA', v: '20-MAR-23' },
        ],
        tableHeaders: [
          'Charges',
          'Unit',
          'Qty',
          'Amount / Qty',
          'Currency',
          'FCY Amount',
          'Taxable',
          'Tax %',
          'Tax Amount',
          'Total',
        ],
        tableRows: [
          ['FREIGHT CHARGE', '1 TON OR 1/2 MEASURE', '1', '1,500.00', 'INR', '1,500.00', '1,500.00', '18', '', '1,500.00'],
          ['LOCAL CHARGES', '—', '1', '800.00', 'INR', '800.00', '800.00', '18', '', '800.00'],
          ['SEA FREIGHT CHARGE', '1 TON OR 1/2 MEASURE', '1', '900.00', 'INR', '900.00', '900.00', '18', '', '900.00'],
          ['CONTAINER CLEANING FEE', '1 TON OR 1/2 MEASURE', '1', '1,000.00', 'INR', '1,000.00', '1,000.00', '15', '', '1,000.00'],
        ],
      }),
      blocks: [
        { type: 'companyHeader' },
        { type: 'docTitle', text: `TAX INVOICE - ${BOMINV.no}`, align: 'center' },
        { type: 'twoColumn', showBillTo: true },
        { type: 'fieldGrid', cols: 2 },
        { type: 'chargeTable', headerColor: 'fill' },
        { type: 'wordsAndTotal' },
        { type: 'termsBank' },
        { type: 'colorfulFooter' },
      ],
    }),

    // 51 — USA format 2
    51: layout({
      theme: THEME_TAX,
      paper: 'Letter',
      demo: simpleClientDemo({
        ...client,
        billToLabel: 'Bill To',
        metaRows: [
          { k: 'Invoice No.', v: BOMINV.no },
          { k: 'Date', v: '17-MAY-23 (POSTED)' },
        ],
        fieldGrid: [
          { k: 'Shipper', v: 'DEMO-SHIPPER ENGG COMPANY' },
          { k: 'Consignee', v: 'DEMO STEEL FACTORY CO. LTD.' },
          { k: 'Port of Loading', v: 'NHAVA SHEVA, INDIA' },
          { k: 'Port of Discharge', v: 'JEDDAH, SAUDI ARABIA' },
          { k: 'ETD', v: '01-MAR-23' },
          { k: 'ETA', v: '20-MAR-23' },
          { k: 'HBL', v: 'NSAJED85630124277' },
          { k: 'Vessel / Voyage', v: 'CAP SAN JUAN / 310W' },
        ],
        tableHeaders: ['Charges', 'Unit', 'Qty', 'Amount / Qty', 'Total Amount (INR)'],
        tableRows: [
          ['FREIGHT CHARGE', '1 TON OR 1/2 MEASURE', '1', '1,500.00', '1,500.00'],
          ['LOCAL CHARGES', '—', '1', '800.00', '800.00'],
          ['SEA FREIGHT CHARGE', '1 TON OR 1/2 MEASURE', '1', '900.00', '900.00'],
          ['CONTAINER CLEANING FEE', '1 TON OR 1/2 MEASURE', '1', '1,000.00', '1,000.00'],
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

    // 52 — fg_standard_tax_invoice
    52: layout({
      theme: THEME_TAX,
      demo: simpleClientDemo({
        ...client,
        billToLabel: 'Client',
        words: 'Rupee Four Thousand Seven Hundred Seventy-Six Only',
        total: '4,776.00',
        metaRows: [
          { k: 'Invoice No.', v: BOMINV.no },
          { k: 'Date', v: '17-MAY-23 (POSTED)' },
          { k: 'Total No. of Pcs', v: '3.00' },
          { k: 'G.Weight', v: '22,700.00' },
          { k: 'V.Weight', v: '22,700.00' },
        ],
        fieldGrid: [
          { k: 'Shipper', v: 'DEMO-SHIPPER ENGG COMPANY' },
          { k: 'Consignee', v: 'DEMO STEEL FACTORY CO. LTD.' },
          { k: 'Origin', v: 'NHAVA SHEVA, INDIA' },
          { k: 'Destination', v: 'JEDDAH, SAUDI ARABIA' },
          { k: 'ETD', v: '01-MAR-23' },
          { k: 'ETA', v: '20-MAR-23' },
          { k: 'HBL', v: 'NSAJED85630124277' },
        ],
        tableHeaders: [
          'Charge',
          'Qty',
          'Cur.',
          'Ex.Rate',
          'Amount / Qty',
          'Tax %',
          'FCY Amount',
          'VAT Amount (INR)',
        ],
        tableRows: [
          ['FREIGHT CHARGE', '1', 'INR', '1.000000', '1,500.00', '18', '1,500.00', '1,500.00'],
          ['LOCAL CHARGES', '1', 'INR', '1.000000', '800.00', '18', '800.00', '800.00'],
          ['SEA FREIGHT CHARGE', '1', 'INR', '1.000000', '900.00', '18', '900.00', '900.00'],
          ['CONTAINER CLEANING FEE', '1', 'INR', '1.000000', '1,000.00', '15', '1,000.00', '1,000.00'],
        ],
        subtotalParts: ['4,200.00', '576.00', '4,776.00'],
        totalLabel: 'Total : INR',
      }),
      blocks: [
        { type: 'companyHeader' },
        { type: 'docTitle', text: 'TAX INVOICE', align: 'center' },
        { type: 'twoColumn', showBillTo: true },
        { type: 'fieldGrid', cols: 2 },
        { type: 'chargeTable', headerColor: 'fill' },
        { type: 'subtotalBar', variant: 'tax' },
        { type: 'wordsAndTotal' },
        { type: 'termsBank' },
        { type: 'colorfulFooter' },
      ],
    }),

    // 53 — summary_invoice_rpm_ref_202.pdf (exact sample structure)
    53: layout({
      theme: THEME_TAX,
      demo: simpleClientDemo({
        ...client,
        billToLabel: 'Bill To',
        billToGstin: '888329087642356',
        trnNo: '888329087642356',
        creditTerm: 'CASH',
        words: 'Rupee Four Thousand Seven Hundred Seventy-Six Only',
        total: '4,776.00',
        taxAmountLines: ['GST18', 'GST 15%'],
        officeAddressLines: [
          'Collection Branch Address',
          'MUMBAI,',
          '406, 4TH FLOOR, D-21 CORPORATE PARK, SECTOR 21,, MUMBAI,',
          'Pincode : 400001',
        ],
        metaRows: [
          { k: 'Invoice No.', v: `${BOMINV.no} / 17-MAY-23 (POSTED)` },
          { k: 'Credit Term', v: 'CASH' },
          { k: 'TRN No', v: '888329087642356' },
          { k: 'VAT No.', v: '68768978898098' },
        ],
        fieldGrid: [
          { k: 'Consignee', v: 'DEMO STEEL FACTORY CO. LTD.' },
          { k: 'Shipper', v: 'DEMO-SHIPPER ENGG COMPANY' },
          { k: 'Shipment No.', v: `${BOMINV.shipment} / 16-MAY-23` },
          { k: 'Job No.', v: '—' },
          { k: 'MBL / MAWB No.', v: '—' },
          { k: 'Place of Receipt', v: 'INMAA-CHENNAI' },
          { k: 'Port of Loading', v: 'NHAVA SHEVA, INDIA' },
          { k: 'Port of Discharge', v: 'JEDDAH, SAUDI ARABIA' },
          { k: 'Vessel / Flight Name', v: '—' },
          { k: 'Place of Delivery', v: 'JEDDAH SAUDI ARABIA' },
          { k: 'Voyage / Flight No', v: '—' },
          { k: 'ETD', v: '01-MAR-23' },
          { k: 'ETA', v: '20-MAR-23' },
          { k: 'Currency', v: 'INR 1.000000' },
          { k: 'HBL/AWB No.', v: 'NSAJED85630124277' },
          { k: 'BOE No', v: '—' },
          { k: 'Narration', v: 'MBL NO... / HBL NO. NSAJED85630124277 / JOB NO.' },
          { k: 'Reference No.', v: '—' },
        ],
        tableHeaders: ['Charges', 'Currency', 'Amount (INR)'],
        tableRows: [
          ['LOCAL CHARGES', 'INR', '800.00'],
          ['SEA FREIGHT CHARGE', 'INR', '900.00'],
          ['FREIGHT CHARGE', 'INR', '1,500.00'],
          ['CONTAINER CLEANING FEE', 'INR', '1,000.00'],
        ],
        containerHeaders: ['Container No', 'Description', 'Pcs', 'Weight', 'Volume Weight'],
        containerRow: ['TTNU0712894', 'GENERAL CARGO', '3.00', '22,700.00', '22,700.00'],
        containerNote: 'TTNU0712894 · GENERAL CARGO · 3.00 pcs · 22,700.00 · 22,700.00',
      }),
      blocks: [
        { type: 'companyHeader' },
        { type: 'officeAddressBand' },
        { type: 'docTitle', text: `TAX INVOICE - ${BOMINV.no}`, align: 'center' },
        { type: 'twoColumn', showBillTo: true, showCreditTerm: true },
        { type: 'taxAmountBox' },
        { type: 'fieldGrid', cols: 2 },
        { type: 'chargeTable', headerColor: 'fill' },
        { type: 'wordsAndTotal' },
        { type: 'containerNote' },
        { type: 'termsBank' },
        { type: 'colorfulFooter' },
      ],
    }),
  };
}
