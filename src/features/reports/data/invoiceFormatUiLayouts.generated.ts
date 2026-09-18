import type { InvoiceFormatUiLayout } from '../types/invoiceFormatUiLayout.types';

/** Permanent JSON UI layouts — invoiceFormatUiLayouts. */
export const INVOICE_FORMAT_UI_LAYOUTS: InvoiceFormatUiLayout[] = [
  {
    "code": "INVOICE_REPORT_FORMAT_1_TAX_INVOICE_INDIA",
    "formatNumber": 1,
    "name": "Invoice Report Format-1 Tax Invoice India",
    "paper": "A4",
    "rtl": false,
    "theme": {
      "primary": "#000000",
      "accent": "#0F4D96",
      "fill": "#F3F3F3",
      "panel": "#EBF0F4",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#9AD7FF",
      "ink": "#101010",
      "gray": "#656565",
      "white": "#FFFFFF"
    },
    "branding": {
      "company": "KingFisher Logistic",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "info@kingfisherwingsgroup.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "BOMINV230500382",
      "invoiceDate": "17-MAY-23",
      "dueDate": "17-MAY-23",
      "creditTerm": "CASH",
      "billToName": "DEMOCLIEJK001",
      "billToPhone": "798798798",
      "fax": "9879878",
      "vatNo": "68768978898098",
      "shipmentNo": "BOM/EXP/23/05/B/0709",
      "shippersReference": "FCL EXPORT",
      "goodsDescription": "GENERAL CARGO",
      "placeOfSupply": "TAMIL NADU",
      "termsOfShipment": "FOB",
      "quotationNo": "—",
      "irnNo": "—",
      "currency": "INR",
      "words": "Rupee Four Thousand Seven Hundred Seventy-Six Only",
      "subtotal": "4,200.00",
      "tax": "576.00",
      "total": "4,776.00",
      "totalLabel": "INR",
      "subtotalParts": [
        "4,200.00",
        "576.00",
        "4,776.00"
      ],
      "frenchTotalWords": "quatre mille sept cent soixante-seize dollars",
      "metaRows": [
        {
          "k": "INVOICE DATE",
          "v": "17-MAY-23"
        },
        {
          "k": "SHIPMENT",
          "v": "BOM/EXP/23/05/B/0709"
        },
        {
          "k": "TERMS",
          "v": "CASH"
        },
        {
          "k": "JOB NUMBER",
          "v": "—"
        },
        {
          "k": "CUSTOMER ID",
          "v": "DEMOCLIEJK001"
        },
        {
          "k": "DUE DATE",
          "v": "17-MAY-23"
        }
      ],
      "partyLeft": {
        "title": "SHIPPER",
        "lines": [
          "DEMO-SHIPPER ENGG COMPANY"
        ]
      },
      "partyMid": {
        "title": "CONSIGNEE",
        "lines": [
          "DEMO STEEL FACTORY CO. LTD."
        ]
      },
      "fieldGrid": [
        {
          "k": "DEPARTMENT",
          "v": "FCL EXPORT"
        },
        {
          "k": "GROSS WEIGHT",
          "v": "22,700.000 KGS"
        },
        {
          "k": "CUSTOMS BROKER",
          "v": "—"
        },
        {
          "k": "Vessel / Voyage",
          "v": "CAP SAN JUAN / 310W"
        },
        {
          "k": "ORIGIN ETD",
          "v": "01-MAR-23 INNSA - NHAVA SHEVA, INDIA"
        },
        {
          "k": "DESTINATION ETA",
          "v": "20-MAR-23 SAJED - JEDDAH, SAUDI ARABIA"
        },
        {
          "k": "CONTAINERS",
          "v": "TTNU0712894 / 40' FLAT"
        },
        {
          "k": "OCEAN BILL OF LADING",
          "v": "NSAJED85630124277"
        },
        {
          "k": "HOUSE BILL OF LADING",
          "v": "—"
        },
        {
          "k": "CHARGEABLE PACKAGES",
          "v": "3 PACKAGES"
        },
        {
          "k": "VOLUME",
          "v": "22,700.000 KGS"
        }
      ],
      "termsLines": [
        "1. Payment to be made by cash. The company is not responsible for any cash settlement without an official receipt."
      ],
      "bankLines": [
        "Beneficiary Name: KingFisher Logistic",
        "Transfer Funds To : KingFisher Logistic",
        "Bank : HDFC",
        "A/c No : XXXXXXXXXXX",
        "IBAN Code : ABA:XXXXXX",
        "Swift Code : XXXXXX",
        "Address : Dubai, United Arab Emirates"
      ],
      "footerBullets": [
        "Payments delayed beyond agreed credit terms will attract interest @24% per annum.",
        "Cheques should be made out to KingFisher Logistic & crossed A/C payee.",
        "Any discrepancy should be notified in writing within 07 days from the invoice date.",
        "This is a computer-generated document & does not require a signature & stamp."
      ],
      "tableHeaders": [
        "Charge Details",
        "SAC",
        "Cur.",
        "Rate/Unit",
        "Qty",
        "Cur",
        "Amount",
        "Ex.Rate",
        "Amount",
        "IGST%",
        "IGST",
        "Total Amt (INR)"
      ],
      "tableRows": [
        [
          "FREIGHT CHARGE",
          "",
          "INR",
          "1,500.00",
          "1",
          "1,500.00",
          "1.00000",
          "1,500.00",
          "18",
          "270.00",
          "1,770.00"
        ],
        [
          "LOCAL CHARGES",
          "",
          "INR",
          "800.00",
          "1",
          "800.00",
          "1.00000",
          "800.00",
          "18",
          "144.00",
          "944.00"
        ],
        [
          "SEA FREIGHT CHARGE",
          "",
          "INR",
          "900.00",
          "1",
          "900.00",
          "1.00000",
          "900.00",
          "18",
          "162.00",
          "1,062.00"
        ],
        [
          "CONTAINER CLEANING FEE",
          "",
          "INR",
          "1,000.00",
          "1",
          "1,000.00",
          "1.00000",
          "1,000.00",
          "0",
          "0.00",
          "1,000.00"
        ]
      ]
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "docTitle",
        "text": "INVOICE BOMINV230500382",
        "align": "start"
      },
      {
        "type": "exportMetaStrip"
      },
      {
        "type": "shipmentDetails",
        "showPlaceOfSupply": true
      },
      {
        "type": "chargeTable",
        "headerColor": "fill"
      },
      {
        "type": "subtotalBar",
        "variant": "igst"
      },
      {
        "type": "exportClosing"
      },
      {
        "type": "colorfulFooter"
      }
    ]
  },
  {
    "code": "INVOICE_REPORT_FORMAT_2_TAX_INVOICE_INDIA",
    "formatNumber": 2,
    "name": "Invoice Report Format-2 Tax Invoice India",
    "paper": "A4",
    "rtl": false,
    "theme": {
      "primary": "#000000",
      "accent": "#0F4D96",
      "fill": "#F3F3F3",
      "panel": "#EBF0F4",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#9AD7FF",
      "ink": "#101010",
      "gray": "#656565",
      "white": "#FFFFFF"
    },
    "branding": {
      "company": "KingFisher Logistic",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "info@kingfisherwingsgroup.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "BOMINV230500382",
      "invoiceDate": "17-MAY-23",
      "dueDate": "17-MAY-23",
      "creditTerm": "CASH",
      "billToName": "DEMOCLIEJK001",
      "billToPhone": "798798798",
      "fax": "9879878",
      "vatNo": "68768978898098",
      "shipmentNo": "BOM/EXP/23/05/B/0709",
      "shippersReference": "FCL EXPORT",
      "goodsDescription": "GENERAL CARGO",
      "placeOfSupply": "TAMIL NADU",
      "termsOfShipment": "FOB",
      "quotationNo": "—",
      "irnNo": "—",
      "currency": "INR",
      "words": "Rupee Four Thousand Seven Hundred Seventy-Six Only",
      "subtotal": "4,200.00",
      "tax": "576.00",
      "total": "4,776.00",
      "totalLabel": "INR",
      "subtotalParts": [
        "4,200.00",
        "576.00",
        "4,776.00"
      ],
      "frenchTotalWords": "quatre mille sept cent soixante-seize dollars",
      "metaRows": [
        {
          "k": "INVOICE DATE",
          "v": "17-MAY-23"
        },
        {
          "k": "SHIPMENT",
          "v": "BOM/EXP/23/05/B/0709"
        },
        {
          "k": "TERMS",
          "v": "CASH"
        },
        {
          "k": "JOB NUMBER",
          "v": "—"
        },
        {
          "k": "CUSTOMER ID",
          "v": "DEMOCLIEJK001"
        },
        {
          "k": "DUE DATE",
          "v": "17-MAY-23"
        }
      ],
      "partyLeft": {
        "title": "SHIPPER",
        "lines": [
          "DEMO-SHIPPER ENGG COMPANY"
        ]
      },
      "partyMid": {
        "title": "CONSIGNEE",
        "lines": [
          "DEMO STEEL FACTORY CO. LTD."
        ]
      },
      "fieldGrid": [
        {
          "k": "DEPARTMENT",
          "v": "FCL EXPORT"
        },
        {
          "k": "GROSS WEIGHT",
          "v": "22,700.000 KGS"
        },
        {
          "k": "CUSTOMS BROKER",
          "v": "—"
        },
        {
          "k": "Vessel / Voyage",
          "v": "CAP SAN JUAN / 310W"
        },
        {
          "k": "ORIGIN ETD",
          "v": "01-MAR-23 INNSA - NHAVA SHEVA, INDIA"
        },
        {
          "k": "DESTINATION ETA",
          "v": "20-MAR-23 SAJED - JEDDAH, SAUDI ARABIA"
        },
        {
          "k": "CONTAINERS",
          "v": "TTNU0712894 / 40' FLAT"
        },
        {
          "k": "OCEAN BILL OF LADING",
          "v": "NSAJED85630124277"
        },
        {
          "k": "HOUSE BILL OF LADING",
          "v": "—"
        },
        {
          "k": "CHARGEABLE PACKAGES",
          "v": "3 PACKAGES"
        },
        {
          "k": "VOLUME",
          "v": "22,700.000 KGS"
        }
      ],
      "termsLines": [
        "1. Payment to be made by cash. The company is not responsible for any cash settlement without an official receipt."
      ],
      "bankLines": [
        "Beneficiary Name: KingFisher Logistic",
        "Transfer Funds To : KingFisher Logistic",
        "Bank : HDFC",
        "A/c No : XXXXXXXXXXX",
        "IBAN Code : ABA:XXXXXX",
        "Swift Code : XXXXXX",
        "Address : Dubai, United Arab Emirates"
      ],
      "footerBullets": [
        "Payments delayed beyond agreed credit terms will attract interest @24% per annum.",
        "Cheques should be made out to KingFisher Logistic & crossed A/C payee.",
        "Any discrepancy should be notified in writing within 07 days from the invoice date.",
        "This is a computer-generated document & does not require a signature & stamp."
      ],
      "tableHeaders": [
        "Charge Details",
        "SAC",
        "Cur.",
        "Rate/Unit",
        "Qty",
        "Cur",
        "Amount",
        "Ex.Rate",
        "Amount",
        "IGST%",
        "IGST",
        "Total Amt (INR)"
      ],
      "tableRows": [
        [
          "FREIGHT CHARGE",
          "",
          "INR",
          "1,500.00",
          "1",
          "1,500.00",
          "1.00000",
          "1,500.00",
          "18",
          "270.00",
          "1,770.00"
        ],
        [
          "LOCAL CHARGES",
          "",
          "INR",
          "800.00",
          "1",
          "800.00",
          "1.00000",
          "800.00",
          "18",
          "144.00",
          "944.00"
        ],
        [
          "SEA FREIGHT CHARGE",
          "",
          "INR",
          "900.00",
          "1",
          "900.00",
          "1.00000",
          "900.00",
          "18",
          "162.00",
          "1,062.00"
        ],
        [
          "CONTAINER CLEANING FEE",
          "",
          "INR",
          "1,000.00",
          "1",
          "1,000.00",
          "1.00000",
          "1,000.00",
          "0",
          "0.00",
          "1,000.00"
        ]
      ]
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "docTitle",
        "text": "INVOICE BOMINV230500382",
        "align": "start"
      },
      {
        "type": "exportMetaStrip"
      },
      {
        "type": "shipmentDetails",
        "showPlaceOfSupply": true
      },
      {
        "type": "chargeTable",
        "headerColor": "fill"
      },
      {
        "type": "subtotalBar",
        "variant": "igst"
      },
      {
        "type": "exportClosing"
      },
      {
        "type": "colorfulFooter"
      }
    ]
  },
  {
    "code": "INVOICE_REPORT_FORMAT_3_SUMMARY_INVOICE",
    "formatNumber": 3,
    "name": "Invoice Report Format-3 Summary Invoice",
    "paper": "A4",
    "rtl": false,
    "theme": {
      "primary": "#000000",
      "accent": "#0F4D96",
      "fill": "#F3F3F3",
      "panel": "#EBF0F4",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#9AD7FF",
      "ink": "#101010",
      "gray": "#656565",
      "white": "#FFFFFF"
    },
    "branding": {
      "company": "KingFisher Logistic",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "info@kingfisherwingsgroup.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "BOMINV230500382",
      "invoiceDate": "17-MAY-23",
      "dueDate": "24-MAY-23",
      "billToLabel": "Bill To",
      "billToName": "DEMO LOGISTICS INDIA PVT LTD",
      "billToAddress": "21, PORT BLAIR, KRISHNA ST, MANNARGUDI, TAMIL NADU, INDIA, 676876",
      "billToPhone": "798798798",
      "fax": "9879878",
      "vatNo": "68768978898098",
      "billToGstin": "888329087642356",
      "creditTerm": "CASH",
      "currency": "INR",
      "words": "Rupee Four Thousand Seven Hundred Seventy-Six Only",
      "subtotal": "4,200.00",
      "tax": "576.00",
      "total": "4,776.00",
      "narration": "MBL NO... / HBL NO. NSAJED85630124277 / JOB NO.",
      "officeAddressLines": [
        "Collection Branch Address",
        "MUMBAI,",
        "406, 4TH FLOOR, D-21 CORPORATE PARK, SECTOR 21,, MUMBAI,",
        "Pincode : 400001"
      ],
      "taxAmountLines": [
        "GST18",
        "GST 15%"
      ],
      "metaRows": [
        {
          "k": "Invoice No.",
          "v": "BOMINV230500382 / 17-MAY-23 (POSTED)"
        },
        {
          "k": "Credit Term",
          "v": "CASH"
        },
        {
          "k": "TRN No",
          "v": "888329087642356"
        },
        {
          "k": "VAT No.",
          "v": "68768978898098"
        }
      ],
      "termsLines": [
        "1. Payment to be made by cash. The company is not responsible for any cash settlement without an official receipt."
      ],
      "bankLines": [
        "Beneficiary Name: KingFisher Logistic",
        "Bank : HDFC",
        "A/c No : XXXXXXXXXXX",
        "IBAN Code : ABA:XXXXXX",
        "Swift Code : XXXXXX",
        "Address : Dubai, United Arab Emirates"
      ],
      "osTableHeaders": [
        "Date",
        "Voucher No",
        "Narration",
        "Currency",
        "FCY Amount",
        "O/S FCY Amount",
        "Aging"
      ],
      "osTableRows": [
        [
          "16-MAY-23",
          "BOMINV230500371",
          "MBL NO... / HBL NO. 6676687 / JOB NO.CBOMEXP230764",
          "INR",
          "944.00",
          "944.00",
          "1"
        ]
      ],
      "agingHeaders": [
        "Currency",
        "Total O/S",
        "< 30",
        "30 - 60",
        "60 - 90",
        "90 - 120",
        "120 - 150",
        "150 - 180",
        "180+"
      ],
      "agingRow": [
        "INR",
        "944.00",
        "944.00",
        "",
        "",
        "",
        "",
        "",
        ""
      ],
      "trnNo": "888329087642356",
      "fieldGrid": [
        {
          "k": "Consignee",
          "v": "DEMO STEEL FACTORY CO. LTD."
        },
        {
          "k": "Shipper",
          "v": "DEMO-SHIPPER ENGG COMPANY"
        },
        {
          "k": "Shipment No.",
          "v": "BOM/EXP/23/05/B/0709 / 16-MAY-23"
        },
        {
          "k": "Job No.",
          "v": "—"
        },
        {
          "k": "MBL / MAWB No.",
          "v": "—"
        },
        {
          "k": "Place of Receipt",
          "v": "INMAA-CHENNAI"
        },
        {
          "k": "Port of Loading",
          "v": "NHAVA SHEVA, INDIA"
        },
        {
          "k": "Port of Discharge",
          "v": "JEDDAH, SAUDI ARABIA"
        },
        {
          "k": "Vessel / Flight Name",
          "v": "—"
        },
        {
          "k": "Place of Delivery",
          "v": "JEDDAH SAUDI ARABIA"
        },
        {
          "k": "Voyage / Flight No",
          "v": "—"
        },
        {
          "k": "ETD",
          "v": "01-MAR-23"
        },
        {
          "k": "ETA",
          "v": "20-MAR-23"
        },
        {
          "k": "Currency",
          "v": "INR 1.000000"
        },
        {
          "k": "HBL/AWB No.",
          "v": "NSAJED85630124277"
        },
        {
          "k": "BOE No",
          "v": "—"
        },
        {
          "k": "Narration",
          "v": "MBL NO... / HBL NO. NSAJED85630124277 / JOB NO."
        },
        {
          "k": "Reference No.",
          "v": "—"
        }
      ],
      "tableHeaders": [
        "Charges",
        "Currency",
        "Amount (INR)"
      ],
      "tableRows": [
        [
          "LOCAL CHARGES",
          "INR",
          "800.00"
        ],
        [
          "SEA FREIGHT CHARGE",
          "INR",
          "900.00"
        ],
        [
          "FREIGHT CHARGE",
          "INR",
          "1,500.00"
        ],
        [
          "CONTAINER CLEANING FEE",
          "INR",
          "1,000.00"
        ]
      ],
      "containerHeaders": [
        "Container No",
        "Description",
        "Pcs",
        "Weight",
        "Volume Weight"
      ],
      "containerRow": [
        "TTNU0712894",
        "GENERAL CARGO",
        "3.00",
        "22,700.00",
        "22,700.00"
      ],
      "containerNote": "TTNU0712894 · GENERAL CARGO · 3.00 pcs · 22,700.00 · 22,700.00"
    },
    "blocks": [
      {
        "type": "companyHeader"
      },
      {
        "type": "officeAddressBand"
      },
      {
        "type": "docTitle",
        "text": "TAX INVOICE - BOMINV230500382",
        "align": "center"
      },
      {
        "type": "twoColumn",
        "showBillTo": true,
        "showCreditTerm": true
      },
      {
        "type": "taxAmountBox"
      },
      {
        "type": "fieldGrid",
        "cols": 2
      },
      {
        "type": "chargeTable",
        "headerColor": "fill"
      },
      {
        "type": "wordsAndTotal"
      },
      {
        "type": "containerNote"
      },
      {
        "type": "termsBank"
      },
      {
        "type": "colorfulFooter"
      }
    ]
  },
  {
    "code": "INVOICE_REPORT_FORMAT_4_STANDARD_TAX_INVOICE",
    "formatNumber": 4,
    "name": "Invoice Report Format-4 Standard Tax Invoice",
    "paper": "A4",
    "rtl": false,
    "theme": {
      "primary": "#000000",
      "accent": "#0F4D96",
      "fill": "#F3F3F3",
      "panel": "#EBF0F4",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#9AD7FF",
      "ink": "#101010",
      "gray": "#656565",
      "white": "#FFFFFF"
    },
    "branding": {
      "company": "KingFisher Logistic",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "info@kingfisherwingsgroup.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "BOMINV230500382",
      "invoiceDate": "17-MAY-23",
      "dueDate": "24-MAY-23",
      "billToLabel": "Bill To",
      "billToName": "DEMO LOGISTICS INDIA PVT LTD",
      "billToAddress": "21, PORT BLAIR, KRISHNA ST, MANNARGUDI, TAMIL NADU, INDIA, 676876",
      "billToPhone": "798798798",
      "fax": "9879878",
      "vatNo": "68768978898098",
      "billToGstin": "888329087642356",
      "creditTerm": "CASH",
      "currency": "INR",
      "words": "Rupee Four Thousand Seven Hundred Seventy-Six Only",
      "subtotal": "4,200.00",
      "tax": "576.00",
      "total": "4,776.00",
      "narration": "MBL NO... / HBL NO. NSAJED85630124277 / JOB NO.",
      "officeAddressLines": [
        "MUMBAI",
        "406, 4TH FLOOR, D-21 CORPORATE PARK, SECTOR 21,, MUMBAI, Pincode : 400001"
      ],
      "taxAmountLines": [
        "GST18",
        "GST 15%"
      ],
      "metaRows": [
        {
          "k": "Invoice No.",
          "v": "BOMINV230500382"
        },
        {
          "k": "Date of Invoice",
          "v": "17-MAY-23"
        },
        {
          "k": "Due Date",
          "v": "17-MAY-23"
        },
        {
          "k": "ETD",
          "v": "01-MAR-23"
        },
        {
          "k": "ETA",
          "v": "20-MAR-23"
        },
        {
          "k": "Shipment type",
          "v": "FCL"
        },
        {
          "k": "Shipment No.",
          "v": "BOM/EXP/23/05/B/0709 / 16-MAY-23"
        },
        {
          "k": "Currency",
          "v": "INR 1.000000"
        },
        {
          "k": "Narration",
          "v": "MBL NO... / HBL NO. NSAJED85630124277 / JOB NO."
        }
      ],
      "termsLines": [
        "1. Payment to be made by cash. The company is not responsible for any cash settlement without an official receipt."
      ],
      "bankLines": [
        "Beneficiary Name: KingFisher Logistic",
        "Bank : HDFC",
        "A/c No : XXXXXXXXXXX",
        "IBAN Code : ABA:XXXXXX",
        "Swift Code : XXXXXX",
        "Address : Dubai, United Arab Emirates"
      ],
      "osTableHeaders": [
        "Date",
        "Voucher No",
        "Narration",
        "Currency",
        "FCY Amount",
        "O/S FCY Amount",
        "Aging"
      ],
      "osTableRows": [
        [
          "16-MAY-23",
          "BOMINV230500371",
          "MBL NO... / HBL NO. 6676687 / JOB NO.CBOMEXP230764",
          "INR",
          "944.00",
          "944.00",
          "1"
        ]
      ],
      "agingHeaders": [
        "Currency",
        "Total O/S",
        "< 30",
        "30 - 60",
        "60 - 90",
        "90 - 120",
        "120 - 150",
        "150 - 180",
        "180+"
      ],
      "agingRow": [
        "INR",
        "944.00",
        "944.00",
        "",
        "",
        "",
        "",
        "",
        ""
      ],
      "fieldGrid": [
        {
          "k": "Consignee",
          "v": "DEMO STEEL FACTORY CO. LTD."
        },
        {
          "k": "Shipper",
          "v": "DEMO-SHIPPER ENGG COMPANY"
        },
        {
          "k": "MBL / MAWB No.",
          "v": "—"
        },
        {
          "k": "HBL / AWB No.",
          "v": "NSAJED85630124277"
        },
        {
          "k": "Vessel / Flight",
          "v": "CAP SAN JUAN"
        },
        {
          "k": "Voyage / Flight No",
          "v": "310W"
        },
        {
          "k": "Port of Loading",
          "v": "NHAVA SHEVA, INDIA"
        },
        {
          "k": "Place of Receipt",
          "v": "INMAA-CHENNAI"
        },
        {
          "k": "Port of Discharge",
          "v": "JEDDAH, SAUDI ARABIA"
        },
        {
          "k": "Place of Delivery",
          "v": "JEDDAH SAUDI ARABIA"
        }
      ],
      "tableHeaders": [
        "Charges",
        "Unit",
        "Qty",
        "Amount / Qty",
        "Curr.",
        "Ex.Rate",
        "FCY Amount",
        "Taxable Amount",
        "Non Taxable Amount",
        "Tax %",
        "Tax Amount",
        "Total Amount"
      ],
      "tableRows": [
        [
          "FREIGHT CHARGE",
          "1 TON OR 1/2 MEASURE",
          "1",
          "1,500.00",
          "INR",
          "1.00",
          "1,500.00",
          "1,500.00",
          "",
          "18",
          "",
          "1,500.00"
        ],
        [
          "LOCAL CHARGES",
          "—",
          "1",
          "800.00",
          "INR",
          "1.00",
          "800.00",
          "800.00",
          "",
          "18",
          "",
          "800.00"
        ],
        [
          "SEA FREIGHT CHARGE",
          "1 TON OR 1/2 MEASURE",
          "1",
          "900.00",
          "INR",
          "1.00",
          "900.00",
          "900.00",
          "",
          "18",
          "",
          "900.00"
        ],
        [
          "CONTAINER CLEANING FEE",
          "1 TON OR 1/2 MEASURE",
          "1",
          "1,000.00",
          "INR",
          "1.00",
          "1,000.00",
          "1,000.00",
          "",
          "15",
          "",
          "1,000.00"
        ]
      ],
      "containerHeaders": [
        "Container No",
        "Type",
        "Description",
        "No of Pcs",
        "Gross Weight",
        "Volume"
      ],
      "containerRow": [
        "TTNU0712894",
        "40' FLAT",
        "GENERAL CARGO",
        "3 PACKAGES",
        "22,700.00 KGS",
        "22,700.00"
      ]
    },
    "blocks": [
      {
        "type": "companyHeader"
      },
      {
        "type": "docTitle",
        "text": "TAX INVOICE",
        "align": "center"
      },
      {
        "type": "twoColumn",
        "showBillTo": true
      },
      {
        "type": "fieldGrid",
        "cols": 2
      },
      {
        "type": "chargeTable",
        "headerColor": "fill"
      },
      {
        "type": "taxAmountBox"
      },
      {
        "type": "wordsAndTotal"
      },
      {
        "type": "containerStrip"
      },
      {
        "type": "termsBank"
      },
      {
        "type": "colorfulFooter"
      }
    ]
  },
  {
    "code": "INVOICE_REPORT_FORMAT_5_TAX_INVOICE_INDIA",
    "formatNumber": 5,
    "name": "Invoice Report Format-5 Tax Invoice India",
    "paper": "A4",
    "rtl": false,
    "theme": {
      "primary": "#000000",
      "accent": "#0F4D96",
      "fill": "#F3F3F3",
      "panel": "#EBF0F4",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#9AD7FF",
      "ink": "#101010",
      "gray": "#656565",
      "white": "#FFFFFF"
    },
    "branding": {
      "company": "KingFisher Logistic",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "info@kingfisherwingsgroup.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "BOMINV230500382",
      "invoiceDate": "17-MAY-23",
      "dueDate": "17-MAY-23",
      "creditTerm": "CASH",
      "billToName": "DEMOCLIEJK001",
      "billToPhone": "798798798",
      "fax": "9879878",
      "vatNo": "68768978898098",
      "shipmentNo": "BOM/EXP/23/05/B/0709",
      "shippersReference": "FCL EXPORT",
      "goodsDescription": "GENERAL CARGO",
      "placeOfSupply": "TAMIL NADU",
      "termsOfShipment": "FOB",
      "quotationNo": "—",
      "irnNo": "—",
      "currency": "INR",
      "words": "Rupee Four Thousand Seven Hundred Seventy-Six Only",
      "subtotal": "4,200.00",
      "tax": "576.00",
      "total": "4,776.00",
      "totalLabel": "INR",
      "subtotalParts": [
        "4,200.00",
        "576.00",
        "4,776.00"
      ],
      "frenchTotalWords": "quatre mille sept cent soixante-seize dollars",
      "metaRows": [
        {
          "k": "INVOICE DATE",
          "v": "17-MAY-23"
        },
        {
          "k": "SHIPMENT",
          "v": "BOM/EXP/23/05/B/0709"
        },
        {
          "k": "TERMS",
          "v": "CASH"
        },
        {
          "k": "JOB NUMBER",
          "v": "—"
        },
        {
          "k": "CUSTOMER ID",
          "v": "DEMOCLIEJK001"
        },
        {
          "k": "DUE DATE",
          "v": "17-MAY-23"
        }
      ],
      "partyLeft": {
        "title": "SHIPPER",
        "lines": [
          "DEMO-SHIPPER ENGG COMPANY"
        ]
      },
      "partyMid": {
        "title": "CONSIGNEE",
        "lines": [
          "DEMO STEEL FACTORY CO. LTD."
        ]
      },
      "fieldGrid": [
        {
          "k": "DEPARTMENT",
          "v": "FCL EXPORT"
        },
        {
          "k": "GROSS WEIGHT",
          "v": "22,700.000 KGS"
        },
        {
          "k": "CUSTOMS BROKER",
          "v": "—"
        },
        {
          "k": "Vessel / Voyage",
          "v": "CAP SAN JUAN / 310W"
        },
        {
          "k": "ORIGIN ETD",
          "v": "01-MAR-23 INNSA - NHAVA SHEVA, INDIA"
        },
        {
          "k": "DESTINATION ETA",
          "v": "20-MAR-23 SAJED - JEDDAH, SAUDI ARABIA"
        },
        {
          "k": "CONTAINERS",
          "v": "TTNU0712894 / 40' FLAT"
        },
        {
          "k": "OCEAN BILL OF LADING",
          "v": "NSAJED85630124277"
        },
        {
          "k": "HOUSE BILL OF LADING",
          "v": "—"
        },
        {
          "k": "CHARGEABLE PACKAGES",
          "v": "3 PACKAGES"
        },
        {
          "k": "VOLUME",
          "v": "22,700.000 KGS"
        }
      ],
      "termsLines": [
        "1. Payment to be made by cash. The company is not responsible for any cash settlement without an official receipt."
      ],
      "bankLines": [
        "Beneficiary Name: KingFisher Logistic",
        "Transfer Funds To : KingFisher Logistic",
        "Bank : HDFC",
        "A/c No : XXXXXXXXXXX",
        "IBAN Code : ABA:XXXXXX",
        "Swift Code : XXXXXX",
        "Address : Dubai, United Arab Emirates"
      ],
      "footerBullets": [
        "Payments delayed beyond agreed credit terms will attract interest @24% per annum.",
        "Cheques should be made out to KingFisher Logistic & crossed A/C payee.",
        "Any discrepancy should be notified in writing within 07 days from the invoice date.",
        "This is a computer-generated document & does not require a signature & stamp."
      ],
      "tableHeaders": [
        "Charge Details",
        "SAC",
        "Cur.",
        "Rate/Unit",
        "Qty",
        "Cur",
        "Amount",
        "Ex.Rate",
        "Amount",
        "IGST%",
        "IGST",
        "Total Amt (INR)"
      ],
      "tableRows": [
        [
          "FREIGHT CHARGE",
          "",
          "INR",
          "1,500.00",
          "1",
          "1,500.00",
          "1.00000",
          "1,500.00",
          "18",
          "270.00",
          "1,770.00"
        ],
        [
          "LOCAL CHARGES",
          "",
          "INR",
          "800.00",
          "1",
          "800.00",
          "1.00000",
          "800.00",
          "18",
          "144.00",
          "944.00"
        ],
        [
          "SEA FREIGHT CHARGE",
          "",
          "INR",
          "900.00",
          "1",
          "900.00",
          "1.00000",
          "900.00",
          "18",
          "162.00",
          "1,062.00"
        ],
        [
          "CONTAINER CLEANING FEE",
          "",
          "INR",
          "1,000.00",
          "1",
          "1,000.00",
          "1.00000",
          "1,000.00",
          "0",
          "0.00",
          "1,000.00"
        ]
      ]
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "docTitle",
        "text": "INVOICE BOMINV230500382",
        "align": "start"
      },
      {
        "type": "exportMetaStrip"
      },
      {
        "type": "shipmentDetails",
        "showPlaceOfSupply": true
      },
      {
        "type": "chargeTable",
        "headerColor": "fill"
      },
      {
        "type": "subtotalBar",
        "variant": "igst"
      },
      {
        "type": "exportClosing"
      },
      {
        "type": "colorfulFooter"
      }
    ]
  },
  {
    "code": "INVOICE_REPORT_FORMAT_6_SIMPLE_INVOICE_INDIA",
    "formatNumber": 6,
    "name": "Invoice Report Format-6 Simple Invoice (India)",
    "paper": "A4",
    "rtl": false,
    "theme": {
      "primary": "#000000",
      "accent": "#0F4D96",
      "fill": "#F3F3F3",
      "panel": "#EBF0F4",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#9AD7FF",
      "ink": "#101010",
      "gray": "#656565",
      "white": "#FFFFFF"
    },
    "branding": {
      "company": "KingFisher Logistic",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "info@kingfisherwingsgroup.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "BOMINV230500382 / 17-MAY-23 (POSTED)",
      "invoiceDate": "17-MAY-23",
      "dueDate": "24-MAY-23",
      "billToLabel": "Client",
      "billToName": "DEMO LOGISTICS INDIA PVT LTD",
      "billToAddress": "21, PORT BLAIR, KRISHNA ST, MANNARGUDI, TAMIL NADU, INDIA, 676876",
      "billToPhone": "798798798",
      "fax": "9879878",
      "vatNo": "68768978898098",
      "billToGstin": "888329087642356",
      "creditTerm": "CASH",
      "currency": "INR",
      "words": "Rupee Four Thousand Two Hundred Only",
      "subtotal": "4,200.00",
      "tax": "576.00",
      "total": "4,200.00",
      "narration": "MBL NO... / HBL NO. NSAJED85630124277 / JOB NO.",
      "officeAddressLines": [
        "MUMBAI",
        "406, 4TH FLOOR, D-21 CORPORATE PARK, SECTOR 21,, MUMBAI, Pincode : 400001"
      ],
      "taxAmountLines": [
        "GST18",
        "GST 15%"
      ],
      "metaRows": [
        {
          "k": "Invoice No.",
          "v": "BOMINV230500382 / 17-MAY-23 (POSTED)"
        },
        {
          "k": "Narration",
          "v": "MBL NO... / HBL NO. NSAJED85630124277 / JOB NO."
        },
        {
          "k": "Reference No.",
          "v": "—"
        },
        {
          "k": "Currency",
          "v": "INR 1.000000"
        },
        {
          "k": "Due Date",
          "v": "24-MAY-23"
        },
        {
          "k": "Credit Term",
          "v": "CASH"
        },
        {
          "k": "VAT No. (Client)",
          "v": "888329087642356"
        }
      ],
      "termsLines": [
        "1. Payment to be made by cash. The company is not responsible for any cash settlement without an official receipt."
      ],
      "bankLines": [
        "Beneficiary Name: KingFisher Logistic",
        "Bank : HDFC",
        "A/c No : XXXXXXXXXXX",
        "IBAN Code : ABA:XXXXXX",
        "Swift Code : XXXXXX",
        "Address : Dubai, United Arab Emirates"
      ],
      "osTableHeaders": [
        "Date",
        "Voucher No",
        "Narration",
        "Currency",
        "FCY Amount",
        "O/S FCY Amount",
        "Aging"
      ],
      "osTableRows": [
        [
          "16-MAY-23",
          "BOMINV230500371",
          "MBL NO... / HBL NO. 6676687 / JOB NO.CBOMEXP230764",
          "INR",
          "944.00",
          "944.00",
          "1"
        ]
      ],
      "agingHeaders": [
        "Currency",
        "Total O/S",
        "< 30",
        "30 - 60",
        "60 - 90",
        "90 - 120",
        "120 - 150",
        "150 - 180",
        "180+"
      ],
      "agingRow": [
        "INR",
        "944.00",
        "944.00",
        "",
        "",
        "",
        "",
        "",
        ""
      ],
      "tableHeaders": [
        "Charges",
        "Unit",
        "Qty",
        "Amount / Qty",
        "Currency",
        "Ex.Rate",
        "FCY Amount",
        "Amount (INR)"
      ],
      "tableRows": [
        [
          "FREIGHT CHARGE",
          "1 TON OR 1/2 MEASURE",
          "1",
          "1,500.00",
          "INR",
          "1.00000",
          "1,500.00",
          "1,500.00"
        ],
        [
          "LOCAL CHARGES",
          "—",
          "1",
          "800.00",
          "INR",
          "1.00000",
          "800.00",
          "800.00"
        ],
        [
          "SEA FREIGHT CHARGE",
          "1 TON OR 1/2 MEASURE",
          "1",
          "900.00",
          "INR",
          "1.00000",
          "900.00",
          "900.00"
        ],
        [
          "CONTAINER CLEANING FEE",
          "1 TON OR 1/2 MEASURE",
          "1",
          "1,000.00",
          "INR",
          "1.00000",
          "1,000.00",
          "1,000.00"
        ]
      ],
      "docSubtitle": "Simple Invoice (India)"
    },
    "blocks": [
      {
        "type": "companyHeader"
      },
      {
        "type": "officeAddressBand"
      },
      {
        "type": "docTitle",
        "text": "INVOICE",
        "align": "center"
      },
      {
        "type": "twoColumn",
        "showBillTo": true,
        "showCreditTerm": true
      },
      {
        "type": "chargeTable",
        "headerColor": "fill"
      },
      {
        "type": "totalsOnly"
      },
      {
        "type": "taxAmountBox"
      },
      {
        "type": "wordsAndTotal"
      },
      {
        "type": "termsBank"
      },
      {
        "type": "colorfulFooter"
      }
    ]
  },
  {
    "code": "INVOICE_REPORT_FORMAT_7_SIMPLE_INVOICE",
    "formatNumber": 7,
    "name": "Invoice Report Format-7 Simple Invoice",
    "paper": "A4",
    "rtl": false,
    "theme": {
      "primary": "#000000",
      "accent": "#0F4D96",
      "fill": "#F3F3F3",
      "panel": "#EBF0F4",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#9AD7FF",
      "ink": "#101010",
      "gray": "#656565",
      "white": "#FFFFFF"
    },
    "branding": {
      "company": "KingFisher Logistic",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "info@kingfisherwingsgroup.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "BOMINV230500382 / 17-MAY-23 (POSTED)",
      "invoiceDate": "17-MAY-23",
      "dueDate": "24-MAY-23",
      "billToLabel": "Client",
      "billToName": "DEMO LOGISTICS INDIA PVT LTD",
      "billToAddress": "21, PORT BLAIR, KRISHNA ST, MANNARGUDI, TAMIL NADU, INDIA, 676876",
      "billToPhone": "798798798",
      "fax": "9879878",
      "vatNo": "68768978898098",
      "billToGstin": "888329087642356",
      "creditTerm": "CASH",
      "currency": "INR",
      "words": "Rupee Four Thousand Two Hundred Only",
      "subtotal": "4,200.00",
      "tax": "576.00",
      "total": "4,200.00",
      "narration": "MBL NO... / HBL NO. NSAJED85630124277 / JOB NO.",
      "officeAddressLines": [
        "MUMBAI",
        "406, 4TH FLOOR, D-21 CORPORATE PARK, SECTOR 21,, MUMBAI, Pincode : 400001"
      ],
      "taxAmountLines": [
        "GST18",
        "GST 15%"
      ],
      "metaRows": [
        {
          "k": "Invoice No.",
          "v": "BOMINV230500382 / 17-MAY-23 (POSTED)"
        },
        {
          "k": "Narration",
          "v": "MBL NO... / HBL NO. NSAJED85630124277 / JOB NO."
        },
        {
          "k": "Reference No.",
          "v": "—"
        },
        {
          "k": "Currency",
          "v": "INR 1.000000"
        },
        {
          "k": "Due Date",
          "v": "24-MAY-23"
        },
        {
          "k": "Credit Term",
          "v": "CASH"
        },
        {
          "k": "VAT No. (Client)",
          "v": "888329087642356"
        }
      ],
      "termsLines": [
        "1. Payment to be made by cash. The company is not responsible for any cash settlement without an official receipt."
      ],
      "bankLines": [
        "Beneficiary Name: KingFisher Logistic",
        "Bank : HDFC",
        "A/c No : XXXXXXXXXXX",
        "IBAN Code : ABA:XXXXXX",
        "Swift Code : XXXXXX",
        "Address : Dubai, United Arab Emirates"
      ],
      "osTableHeaders": [
        "Date",
        "Voucher No",
        "Narration",
        "Currency",
        "FCY Amount",
        "O/S FCY Amount",
        "Aging"
      ],
      "osTableRows": [
        [
          "16-MAY-23",
          "BOMINV230500371",
          "MBL NO... / HBL NO. 6676687 / JOB NO.CBOMEXP230764",
          "INR",
          "944.00",
          "944.00",
          "1"
        ]
      ],
      "agingHeaders": [
        "Currency",
        "Total O/S",
        "< 30",
        "30 - 60",
        "60 - 90",
        "90 - 120",
        "120 - 150",
        "150 - 180",
        "180+"
      ],
      "agingRow": [
        "INR",
        "944.00",
        "944.00",
        "",
        "",
        "",
        "",
        "",
        ""
      ],
      "tableHeaders": [
        "Charges",
        "Unit",
        "Qty",
        "Amount / Qty",
        "Currency",
        "Ex.Rate",
        "FCY Amount",
        "Amount (INR)"
      ],
      "tableRows": [
        [
          "FREIGHT CHARGE",
          "1 TON OR 1/2 MEASURE",
          "1",
          "1,500.00",
          "INR",
          "1.00000",
          "1,500.00",
          "1,500.00"
        ],
        [
          "LOCAL CHARGES",
          "—",
          "1",
          "800.00",
          "INR",
          "1.00000",
          "800.00",
          "800.00"
        ],
        [
          "SEA FREIGHT CHARGE",
          "1 TON OR 1/2 MEASURE",
          "1",
          "900.00",
          "INR",
          "1.00000",
          "900.00",
          "900.00"
        ],
        [
          "CONTAINER CLEANING FEE",
          "1 TON OR 1/2 MEASURE",
          "1",
          "1,000.00",
          "INR",
          "1.00000",
          "1,000.00",
          "1,000.00"
        ]
      ]
    },
    "blocks": [
      {
        "type": "companyHeader"
      },
      {
        "type": "officeAddressBand"
      },
      {
        "type": "docTitle",
        "text": "INVOICE",
        "align": "center"
      },
      {
        "type": "twoColumn",
        "showBillTo": true,
        "showCreditTerm": true
      },
      {
        "type": "chargeTable",
        "headerColor": "fill"
      },
      {
        "type": "totalsOnly"
      },
      {
        "type": "taxAmountBox"
      },
      {
        "type": "wordsAndTotal"
      },
      {
        "type": "termsBank"
      },
      {
        "type": "colorfulFooter"
      }
    ]
  },
  {
    "code": "INVOICE_REPORT_FORMAT_8_STANDARD_INVOICE_ARABIC",
    "formatNumber": 8,
    "name": "Invoice Report Format-8 Standard Invoice Arabic",
    "paper": "A4",
    "rtl": true,
    "theme": {
      "primary": "#000000",
      "accent": "#0F4D96",
      "fill": "#F3F3F3",
      "panel": "#EBF0F4",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#9AD7FF",
      "ink": "#101010",
      "gray": "#656565",
      "white": "#FFFFFF"
    },
    "branding": {
      "company": "KingFisher Logistic",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "info@kingfisherwingsgroup.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "BOMINV230500382",
      "invoiceDate": "17-MAY-23",
      "dueDate": "24-MAY-23",
      "billToLabel": "Customer",
      "billToName": "DEMO LOGISTICS INDIA PVT LTD",
      "billToAddress": "21, PORT BLAIR, KRISHNA ST, MANNARGUDI, TAMIL NADU, INDIA, 676876",
      "billToPhone": "798798798",
      "fax": "9879878",
      "vatNo": "68768978898098",
      "billToGstin": "888329087642356",
      "creditTerm": "CASH",
      "currency": "INR",
      "words": "Rupee Four Thousand Two Hundred Only",
      "subtotal": "4,200.00",
      "tax": "576.00",
      "total": "4,200.00",
      "narration": "MBL NO... / HBL NO. NSAJED85630124277 / JOB NO.",
      "officeAddressLines": [
        "MUMBAI",
        "406, 4TH FLOOR, D-21 CORPORATE PARK, SECTOR 21,, MUMBAI, Pincode : 400001"
      ],
      "taxAmountLines": [
        "GST18",
        "GST 15%"
      ],
      "metaRows": [
        {
          "k": "Customer VAT No.",
          "v": "68768978898098"
        },
        {
          "k": "Invoice No.",
          "v": "BOMINV230500382"
        },
        {
          "k": "Invoice Date",
          "v": "17-MAY-23 (POSTED)"
        },
        {
          "k": "Payment Due Date",
          "v": "17-MAY-23"
        },
        {
          "k": "Job Number",
          "v": "—"
        }
      ],
      "termsLines": [
        "1. Payment to be made by cash. The company is not responsible for any cash settlement without an official receipt."
      ],
      "bankLines": [
        "Beneficiary Name: KingFisher Logistic",
        "Bank : HDFC",
        "A/c No : XXXXXXXXXXX",
        "IBAN Code : ABA:XXXXXX",
        "Swift Code : XXXXXX",
        "Address : Dubai, United Arab Emirates"
      ],
      "osTableHeaders": [
        "Date",
        "Voucher No",
        "Narration",
        "Currency",
        "FCY Amount",
        "O/S FCY Amount",
        "Aging"
      ],
      "osTableRows": [
        [
          "16-MAY-23",
          "BOMINV230500371",
          "MBL NO... / HBL NO. 6676687 / JOB NO.CBOMEXP230764",
          "INR",
          "944.00",
          "944.00",
          "1"
        ]
      ],
      "agingHeaders": [
        "Currency",
        "Total O/S",
        "< 30",
        "30 - 60",
        "60 - 90",
        "90 - 120",
        "120 - 150",
        "150 - 180",
        "180+"
      ],
      "agingRow": [
        "INR",
        "944.00",
        "944.00",
        "",
        "",
        "",
        "",
        "",
        ""
      ],
      "docSubtitle": "TAX INVOICE  فاتورة ضريبية",
      "fieldGrid": [
        {
          "k": "Shipper",
          "v": "DEMO-SHIPPER ENGG COMPANY"
        },
        {
          "k": "Consignee",
          "v": "DEMO STEEL FACTORY CO. LTD."
        },
        {
          "k": "Place of Origin",
          "v": "NHAVA SHEVA, INDIA"
        },
        {
          "k": "Final destination",
          "v": "JEDDAH, SAUDI ARABIA"
        },
        {
          "k": "House No.",
          "v": "NSAJED85630124277"
        },
        {
          "k": "Number of Packs",
          "v": "3.00"
        },
        {
          "k": "Weight in Kgs",
          "v": "22,700.000"
        },
        {
          "k": "ETD",
          "v": "01-MAR-23"
        },
        {
          "k": "ETA",
          "v": "20-MAR-23"
        },
        {
          "k": "Narration",
          "v": "MBL NO... / HBL NO. NSAJED85630124277 / JOB NO."
        }
      ],
      "tableHeaders": [
        "Charge Description",
        "Curr",
        "Rate Per Unit",
        "Unit",
        "Curr. Amount",
        "ROE",
        "Total Price excl. VAT",
        "VAT%",
        "VAT Amount",
        "Total"
      ],
      "tableRows": [
        [
          "FREIGHT CHARGE",
          "INR",
          "1,500.00",
          "1",
          "1,500.00",
          "1.00000",
          "1,500.00",
          "18",
          "",
          "1,500.00"
        ],
        [
          "LOCAL CHARGES",
          "INR",
          "800.00",
          "1",
          "800.00",
          "1.00000",
          "800.00",
          "18",
          "",
          "800.00"
        ],
        [
          "SEA FREIGHT CHARGE",
          "INR",
          "900.00",
          "1",
          "900.00",
          "1.00000",
          "900.00",
          "18",
          "",
          "900.00"
        ],
        [
          "CONTAINER CLEANING FEE",
          "INR",
          "1,000.00",
          "1",
          "1,000.00",
          "1.00000",
          "1,000.00",
          "15",
          "",
          "1,000.00"
        ]
      ],
      "containerNote": "TTNU0712894 · 1 × 40' FLAT",
      "totalLabel": "Total in : INR"
    },
    "blocks": [
      {
        "type": "companyHeader"
      },
      {
        "type": "arabicHeader"
      },
      {
        "type": "docTitle",
        "text": "TAX INVOICE  فاتورة ضريبية",
        "align": "center"
      },
      {
        "type": "twoColumn",
        "showBillTo": true
      },
      {
        "type": "fieldGrid",
        "cols": 2
      },
      {
        "type": "chargeTable",
        "headerColor": "fill"
      },
      {
        "type": "wordsAndTotal"
      },
      {
        "type": "containerNote"
      },
      {
        "type": "termsBank"
      },
      {
        "type": "colorfulFooter"
      }
    ]
  },
  {
    "code": "INVOICE_REPORT_FORMAT_9_STANDARD_INVOICE_USA",
    "formatNumber": 9,
    "name": "Invoice Report Format-9 Standard Invoice USA",
    "paper": "Letter",
    "rtl": false,
    "theme": {
      "primary": "#000000",
      "accent": "#0F4D96",
      "fill": "#F3F3F3",
      "panel": "#EBF0F4",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#9AD7FF",
      "ink": "#101010",
      "gray": "#656565",
      "white": "#FFFFFF"
    },
    "branding": {
      "company": "KingFisher Logistic",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "info@kingfisherwingsgroup.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "BOMINV230500382",
      "invoiceDate": "17-MAY-23",
      "dueDate": "24-MAY-23",
      "billToLabel": "Bill To",
      "billToName": "DEMO LOGISTICS INDIA PVT LTD",
      "billToAddress": "21, PORT BLAIR, KRISHNA ST, MANNARGUDI, TAMIL NADU, INDIA, 676876",
      "billToPhone": "798798798",
      "fax": "9879878",
      "vatNo": "68768978898098",
      "billToGstin": "888329087642356",
      "creditTerm": "CASH",
      "currency": "INR",
      "words": "IN WORDS : Rupee Four Thousand Seven Hundred Seventy-Six Only",
      "subtotal": "4,200.00",
      "tax": "576.00",
      "total": "4,776.00",
      "narration": "MBL NO... / HBL NO. NSAJED85630124277 / JOB NO.",
      "officeAddressLines": [
        "MUMBAI",
        "406, 4TH FLOOR, D-21 CORPORATE PARK, SECTOR 21,, MUMBAI, Pincode : 400001"
      ],
      "taxAmountLines": [
        "GST18",
        "GST 15%"
      ],
      "metaRows": [
        {
          "k": "Invoice No.",
          "v": "BOMINV230500382"
        },
        {
          "k": "Invoice Date",
          "v": "17-MAY-23 (POSTED)"
        },
        {
          "k": "PAN",
          "v": "AABCT1557F"
        },
        {
          "k": "TAN",
          "v": "TAN123TAN"
        },
        {
          "k": "GSTIN",
          "v": "—"
        }
      ],
      "termsLines": [
        "1. Payment to be made by cash. The company is not responsible for any cash settlement without an official receipt."
      ],
      "bankLines": [
        "Beneficiary Name: KingFisher Logistic",
        "Bank : HDFC",
        "A/c No : XXXXXXXXXXX",
        "IBAN Code : ABA:XXXXXX",
        "Swift Code : XXXXXX",
        "Address : Dubai, United Arab Emirates"
      ],
      "osTableHeaders": [
        "Date",
        "Voucher No",
        "Narration",
        "Currency",
        "FCY Amount",
        "O/S FCY Amount",
        "Aging"
      ],
      "osTableRows": [
        [
          "16-MAY-23",
          "BOMINV230500371",
          "MBL NO... / HBL NO. 6676687 / JOB NO.CBOMEXP230764",
          "INR",
          "944.00",
          "944.00",
          "1"
        ]
      ],
      "agingHeaders": [
        "Currency",
        "Total O/S",
        "< 30",
        "30 - 60",
        "60 - 90",
        "90 - 120",
        "120 - 150",
        "150 - 180",
        "180+"
      ],
      "agingRow": [
        "INR",
        "944.00",
        "944.00",
        "",
        "",
        "",
        "",
        "",
        ""
      ],
      "fieldGrid": [
        {
          "k": "MBL / MAWB No.",
          "v": "—"
        },
        {
          "k": "HBL / HAWB No.",
          "v": "NSAJED85630124277"
        },
        {
          "k": "Consignee",
          "v": "DEMO STEEL FACTORY CO. LTD."
        },
        {
          "k": "No. of Pkg/WT/CBM",
          "v": "3.00 PACKAGES / 22,700.00 KGS"
        },
        {
          "k": "Cargo Type",
          "v": "FCL"
        },
        {
          "k": "Vessel/Flight",
          "v": "CAP SAN JUAN / 310W"
        },
        {
          "k": "Container No.",
          "v": "TTNU0712894"
        },
        {
          "k": "ETA",
          "v": "20-MAR-23"
        },
        {
          "k": "Origin",
          "v": "NHAVA SHEVA, INDIA"
        },
        {
          "k": "ETD",
          "v": "01-MAR-23"
        },
        {
          "k": "Destination",
          "v": "JEDDAH, SAUDI ARABIA"
        },
        {
          "k": "Shipper",
          "v": "DEMO-SHIPPER ENGG COMPANY"
        },
        {
          "k": "Commodity",
          "v": "GENERAL CARGO"
        }
      ],
      "tableHeaders": [
        "Particulars",
        "SAC",
        "Rate",
        "Qty",
        "Curr",
        "Ex.Rate",
        "Taxable Amount",
        "I/UGST %",
        "I/UGST",
        "Total Amount"
      ],
      "tableRows": [
        [
          "FREIGHT CHARGE",
          "",
          "1,500.00",
          "1.000",
          "INR",
          "1.00000",
          "1,500.00",
          "18.00",
          "270.00",
          "1,770.00"
        ],
        [
          "LOCAL CHARGES",
          "",
          "800.00",
          "1.000",
          "INR",
          "1.00000",
          "800.00",
          "18.00",
          "144.00",
          "944.00"
        ],
        [
          "SEA FREIGHT CHARGE",
          "",
          "900.00",
          "1.000",
          "INR",
          "1.00000",
          "900.00",
          "18.00",
          "162.00",
          "1,062.00"
        ],
        [
          "CONTAINER CLEANING FEE",
          "",
          "1,000.00",
          "1.000",
          "INR",
          "1.00000",
          "1,000.00",
          "0.00",
          "0.00",
          "1,000.00"
        ]
      ],
      "subtotalParts": [
        "4,200.00",
        "576.00",
        "4,776.00"
      ],
      "totalLabel": "Total Amount"
    },
    "blocks": [
      {
        "type": "companyHeader"
      },
      {
        "type": "docTitle",
        "text": "TAX INVOICE",
        "align": "center"
      },
      {
        "type": "twoColumn",
        "showBillTo": true
      },
      {
        "type": "fieldGrid",
        "cols": 2
      },
      {
        "type": "chargeTable",
        "headerColor": "fill"
      },
      {
        "type": "subtotalBar",
        "variant": "igst"
      },
      {
        "type": "wordsAndTotal"
      },
      {
        "type": "termsBank"
      },
      {
        "type": "colorfulFooter"
      }
    ]
  },
  {
    "code": "INVOICE_REPORT_FORMAT_10_STANDARD_INVOICE",
    "formatNumber": 10,
    "name": "Invoice Report Format-10 Standard Invoice",
    "paper": "A4",
    "rtl": false,
    "theme": {
      "primary": "#000000",
      "accent": "#0F4D96",
      "fill": "#F3F3F3",
      "panel": "#EBF0F4",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#9AD7FF",
      "ink": "#101010",
      "gray": "#656565",
      "white": "#FFFFFF"
    },
    "branding": {
      "company": "KingFisher Logistic",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "info@kingfisherwingsgroup.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "BOMINV230500382",
      "invoiceDate": "17-MAY-23",
      "dueDate": "24-MAY-23",
      "billToLabel": "Client",
      "billToName": "DEMO LOGISTICS INDIA PVT LTD",
      "billToAddress": "21, PORT BLAIR, KRISHNA ST, MANNARGUDI, TAMIL NADU, INDIA, 676876",
      "billToPhone": "798798798",
      "fax": "9879878",
      "vatNo": "68768978898098",
      "billToGstin": "888329087642356",
      "creditTerm": "CASH",
      "currency": "INR",
      "words": "Rupee Four Thousand Seven Hundred Seventy-Six Only",
      "subtotal": "4,200.00",
      "tax": "576.00",
      "total": "4,776.00",
      "narration": "MBL NO... / HBL NO. NSAJED85630124277 / JOB NO.",
      "officeAddressLines": [
        "MUMBAI",
        "406, 4TH FLOOR, D-21 CORPORATE PARK, SECTOR 21,, MUMBAI, Pincode : 400001"
      ],
      "taxAmountLines": [
        "GST18",
        "GST 15%"
      ],
      "metaRows": [
        {
          "k": "Invoice No.",
          "v": "BOMINV230500382"
        },
        {
          "k": "Date",
          "v": "17-MAY-23 (POSTED)"
        },
        {
          "k": "Payment Due date",
          "v": "17-MAY-23"
        },
        {
          "k": "Job No.",
          "v": "—"
        },
        {
          "k": "Shipment No.",
          "v": "BOM/EXP/23/05/B/0709 / 16-MAY-23"
        },
        {
          "k": "TRN No.",
          "v": "888329087642356"
        },
        {
          "k": "Department",
          "v": "FCL EXPORT"
        }
      ],
      "termsLines": [
        "1. Payment to be made by cash. The company is not responsible for any cash settlement without an official receipt."
      ],
      "bankLines": [
        "Beneficiary Name: KingFisher Logistic",
        "Bank : HDFC",
        "A/c No : XXXXXXXXXXX",
        "IBAN Code : ABA:XXXXXX",
        "Swift Code : XXXXXX",
        "Address : Dubai, United Arab Emirates"
      ],
      "osTableHeaders": [
        "Date",
        "Voucher No",
        "Narration",
        "Currency",
        "FCY Amount",
        "O/S FCY Amount",
        "Aging"
      ],
      "osTableRows": [
        [
          "16-MAY-23",
          "BOMINV230500371",
          "MBL NO... / HBL NO. 6676687 / JOB NO.CBOMEXP230764",
          "INR",
          "944.00",
          "944.00",
          "1"
        ]
      ],
      "agingHeaders": [
        "Currency",
        "Total O/S",
        "< 30",
        "30 - 60",
        "60 - 90",
        "90 - 120",
        "120 - 150",
        "150 - 180",
        "180+"
      ],
      "agingRow": [
        "INR",
        "944.00",
        "944.00",
        "",
        "",
        "",
        "",
        "",
        ""
      ],
      "fieldGrid": [
        {
          "k": "MBL No.",
          "v": "—"
        },
        {
          "k": "HBL No.",
          "v": "NSAJED85630124277"
        },
        {
          "k": "Shipper",
          "v": "DEMO-SHIPPER ENGG COMPANY"
        },
        {
          "k": "Origin",
          "v": "NHAVA SHEVA, INDIA"
        },
        {
          "k": "Consignee",
          "v": "DEMO STEEL FACTORY CO. LTD."
        },
        {
          "k": "Destination",
          "v": "JEDDAH, SAUDI ARABIA"
        },
        {
          "k": "ETD",
          "v": "01-MAR-23"
        },
        {
          "k": "ETA",
          "v": "20-MAR-23"
        },
        {
          "k": "Vessel / Voyage",
          "v": "CAP SAN JUAN / 310W"
        },
        {
          "k": "Handled by",
          "v": "DEMO-PERSON"
        },
        {
          "k": "Place of Receipt",
          "v": "INMAA-CHENNAI"
        },
        {
          "k": "Place of Delivery",
          "v": "JEDDAH SAUDI ARABIA"
        },
        {
          "k": "Narration",
          "v": "MBL NO... / HBL NO. NSAJED85630124277 / JOB NO."
        }
      ],
      "tableHeaders": [
        "Charge",
        "Unit",
        "Qty",
        "Cur.",
        "Ex.Rate",
        "Amount / Qty",
        "Tax %",
        "FCY Amount",
        "VAT Amount (INR)"
      ],
      "tableRows": [
        [
          "FREIGHT CHARGE",
          "1 TON OR 1/2 MEASURE",
          "1.00",
          "INR",
          "1.000000",
          "1,500.000",
          "18.00",
          "1,500.00",
          "1,500.00"
        ],
        [
          "LOCAL CHARGES",
          "—",
          "1.00",
          "INR",
          "1.000000",
          "800.000",
          "18.00",
          "800.00",
          "800.00"
        ],
        [
          "SEA FREIGHT CHARGE",
          "1 TON OR 1/2 MEASURE",
          "1.00",
          "INR",
          "1.000000",
          "900.000",
          "18.00",
          "900.00",
          "900.00"
        ],
        [
          "CONTAINER CLEANING FEE",
          "1 TON OR 1/2 MEASURE",
          "1.00",
          "INR",
          "1.000000",
          "1,000.000",
          "15.00",
          "1,000.00",
          "1,000.00"
        ]
      ],
      "containerHeaders": [
        "Container No.",
        "Size",
        "Description",
        "Qty",
        "Gross Weight",
        "Volume"
      ],
      "containerRow": [
        "TTNU0712894",
        "40' FLAT",
        "GENERAL CARGO",
        "3 - PACKAGES",
        "22,700.000",
        "—"
      ],
      "totalLabel": "Total : INR"
    },
    "blocks": [
      {
        "type": "companyHeader"
      },
      {
        "type": "docTitle",
        "text": "INVOICE",
        "align": "center"
      },
      {
        "type": "twoColumn",
        "showBillTo": true
      },
      {
        "type": "fieldGrid",
        "cols": 2
      },
      {
        "type": "chargeTable",
        "headerColor": "fill"
      },
      {
        "type": "totalsOnly"
      },
      {
        "type": "wordsAndTotal"
      },
      {
        "type": "containerStrip"
      },
      {
        "type": "termsBank"
      },
      {
        "type": "colorfulFooter"
      }
    ]
  },
  {
    "code": "INVOICE_REPORT_FORMAT_11_STANDARD_INVOICE_LAND",
    "formatNumber": 11,
    "name": "Invoice Report Format-11 Standard Invoice Land",
    "paper": "A4",
    "rtl": false,
    "theme": {
      "primary": "#000000",
      "accent": "#0F4D96",
      "fill": "#F3F3F3",
      "panel": "#EBF0F4",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#9AD7FF",
      "ink": "#101010",
      "gray": "#656565",
      "white": "#FFFFFF"
    },
    "branding": {
      "company": "KingFisher Logistic",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "info@kingfisherwingsgroup.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "BOMINV230500382",
      "invoiceDate": "17-MAY-23",
      "billToLabel": "BILL TO",
      "billToName": "DEMO LOGISTICS INDIA PVT LTD",
      "billToAddress": "21, PORT BLAIR, KRISHNA ST, MANNARGUDI, TAMIL NADU, INDIA, 676876",
      "billToPhone": "798798798",
      "fax": "9879878",
      "vatNo": "68768978898098",
      "billToGstin": "888329087642356",
      "currency": "INR",
      "words": "Rupee Four Thousand Seven Hundred Seventy-Six Only",
      "total": "4,776.00",
      "docSubtitle": "TRANSPORTATION INVOICE",
      "narration": "MBL NO... / HBL NO. NSAJED85630124277 / JOB NO.",
      "referenceRows": [
        {
          "k": "Invoice Number",
          "v": "BOMINV230500382"
        },
        {
          "k": "Invoice Date",
          "v": "17-MAY-23"
        },
        {
          "k": "Agreed Terms/Days",
          "v": "CASH / 0"
        },
        {
          "k": "Customer Ref.",
          "v": "—"
        },
        {
          "k": "Narration",
          "v": "MBL NO... / HBL NO. NSAJED85630124277 / JOB NO."
        }
      ],
      "containerHeaders": [
        "Container No.",
        "Type",
        "Description",
        "No of Pcs",
        "Gross Weight",
        "Volume",
        "Volume Weight"
      ],
      "containerRow": [
        "TTNU0712894",
        "40' FLAT",
        "GENERAL CARGO",
        "3 PACKAGES",
        "22,700.000 KGS",
        "22,700.000",
        "—"
      ],
      "tableHeaders": [
        "Truck# / Charge",
        "Unit Type",
        "Unit Rate",
        "TAX Amount",
        "Total Charges"
      ],
      "tableRows": [
        [
          "FREIGHT CHARGE",
          "1 TON OR 1/2 MEASURE",
          "1,500.00",
          "270.00",
          "1,500.00"
        ],
        [
          "LOCAL CHARGES",
          "—",
          "800.00",
          "144.00",
          "800.00"
        ],
        [
          "SEA FREIGHT CHARGE",
          "1 TON OR 1/2 MEASURE",
          "900.00",
          "162.00",
          "900.00"
        ],
        [
          "CONTAINER CLEANING FEE",
          "1 TON OR 1/2 MEASURE",
          "1,000.00",
          "0.00",
          "1,000.00"
        ]
      ],
      "subtotalParts": [
        "4,200.00",
        "576.00",
        "4,776.00"
      ],
      "termsLines": [
        "1. Payment to be made by cash. The company is not responsible for any cash settlement without an official receipt."
      ],
      "bankLines": [
        "Beneficiary Name: KingFisher Logistic",
        "Bank : HDFC",
        "A/c No : XXXXXXXXXXX",
        "IBAN Code : ABA:XXXXXX",
        "Swift Code : XXXXXX",
        "Address : Dubai, United Arab Emirates"
      ]
    },
    "blocks": [
      {
        "type": "companyHeader"
      },
      {
        "type": "landFreightHeader",
        "title": "TRANSPORTATION INVOICE"
      },
      {
        "type": "twoColumn",
        "showBillTo": true
      },
      {
        "type": "docTitle",
        "text": "CONTAINER DETAILS",
        "align": "start"
      },
      {
        "type": "containerStrip"
      },
      {
        "type": "docTitle",
        "text": "DETAILS OF CHARGES / SHIPMENTS",
        "align": "start"
      },
      {
        "type": "chargeTable",
        "headerColor": "fill"
      },
      {
        "type": "subtotalBar",
        "variant": "igst"
      },
      {
        "type": "wordsAndTotal"
      },
      {
        "type": "termsBank"
      },
      {
        "type": "stampSignature"
      },
      {
        "type": "colorfulFooter"
      }
    ]
  },
  {
    "code": "INVOICE_REPORT_FORMAT_12_STANDARD_INVOICE_PREPRINTED",
    "formatNumber": 12,
    "name": "Invoice Report Format-12 Standard Invoice Preprinted",
    "paper": "A4",
    "rtl": false,
    "theme": {
      "primary": "#000000",
      "accent": "#0F4D96",
      "fill": "#F3F3F3",
      "panel": "#EBF0F4",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#9AD7FF",
      "ink": "#101010",
      "gray": "#656565",
      "white": "#FFFFFF"
    },
    "branding": {
      "company": "KingFisher Logistic",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "info@kingfisherwingsgroup.com",
      "logo": "kingfisher"
    },
    "demo": {
      "billToName": "Demo Customer Trading Co.",
      "billToAddress": "Plot 12, JAFZA, Dubai, UAE",
      "invoiceNo": "KFL-INV-2026-0042",
      "invoiceDate": "14-Sep-2026",
      "dueDate": "28-Sep-2026",
      "currency": "AED",
      "total": "AED 1,517.25",
      "metaRows": [
        {
          "k": "No.",
          "v": "KFL-INV-2026-0042"
        },
        {
          "k": "Date",
          "v": "14-Sep-2026"
        },
        {
          "k": "Due",
          "v": "28-Sep-2026"
        }
      ],
      "tableHeaders": [
        "Description",
        "Qty",
        "Rate",
        "Amount"
      ],
      "tableRows": [
        [
          "Freight charges",
          "1",
          "1,250.00",
          "1,250.00"
        ],
        [
          "Documentation fee",
          "1",
          "75.00",
          "75.00"
        ],
        [
          "THC origin",
          "1",
          "120.00",
          "120.00"
        ]
      ]
    },
    "blocks": [
      {
        "type": "companyHeader"
      },
      {
        "type": "docTitle",
        "text": "TAX INVOICE",
        "align": "center"
      },
      {
        "type": "formatBadge"
      },
      {
        "type": "twoColumn",
        "showBillTo": true
      },
      {
        "type": "chargeTable",
        "headerColor": "fill"
      },
      {
        "type": "wordsAndTotal"
      },
      {
        "type": "colorfulFooter"
      }
    ]
  },
  {
    "code": "INVOICE_REPORT_FORMAT_13_STANDARD_INVOICE_USA",
    "formatNumber": 13,
    "name": "Invoice Report Format-13 Standard Invoice USA",
    "paper": "Letter",
    "rtl": false,
    "theme": {
      "primary": "#000000",
      "accent": "#0F4D96",
      "fill": "#F3F3F3",
      "panel": "#EBF0F4",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#9AD7FF",
      "ink": "#101010",
      "gray": "#656565",
      "white": "#FFFFFF"
    },
    "branding": {
      "company": "KingFisher Logistic",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "info@kingfisherwingsgroup.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "BOMINV230500382",
      "invoiceDate": "17-MAY-23",
      "dueDate": "24-MAY-23",
      "billToLabel": "Bill To",
      "billToName": "DEMO LOGISTICS INDIA PVT LTD",
      "billToAddress": "21, PORT BLAIR, KRISHNA ST, MANNARGUDI, TAMIL NADU, INDIA, 676876",
      "billToPhone": "798798798",
      "fax": "9879878",
      "vatNo": "68768978898098",
      "billToGstin": "888329087642356",
      "creditTerm": "CASH",
      "currency": "INR",
      "words": "IN WORDS : Rupee Four Thousand Seven Hundred Seventy-Six Only",
      "subtotal": "4,200.00",
      "tax": "576.00",
      "total": "4,776.00",
      "narration": "MBL NO... / HBL NO. NSAJED85630124277 / JOB NO.",
      "officeAddressLines": [
        "MUMBAI",
        "406, 4TH FLOOR, D-21 CORPORATE PARK, SECTOR 21,, MUMBAI, Pincode : 400001"
      ],
      "taxAmountLines": [
        "GST18",
        "GST 15%"
      ],
      "metaRows": [
        {
          "k": "Invoice No.",
          "v": "BOMINV230500382"
        },
        {
          "k": "Invoice Date",
          "v": "17-MAY-23 (POSTED)"
        },
        {
          "k": "PAN",
          "v": "AABCT1557F"
        },
        {
          "k": "TAN",
          "v": "TAN123TAN"
        },
        {
          "k": "GSTIN",
          "v": "—"
        }
      ],
      "termsLines": [
        "1. Payment to be made by cash. The company is not responsible for any cash settlement without an official receipt."
      ],
      "bankLines": [
        "Beneficiary Name: KingFisher Logistic",
        "Bank : HDFC",
        "A/c No : XXXXXXXXXXX",
        "IBAN Code : ABA:XXXXXX",
        "Swift Code : XXXXXX",
        "Address : Dubai, United Arab Emirates"
      ],
      "osTableHeaders": [
        "Date",
        "Voucher No",
        "Narration",
        "Currency",
        "FCY Amount",
        "O/S FCY Amount",
        "Aging"
      ],
      "osTableRows": [
        [
          "16-MAY-23",
          "BOMINV230500371",
          "MBL NO... / HBL NO. 6676687 / JOB NO.CBOMEXP230764",
          "INR",
          "944.00",
          "944.00",
          "1"
        ]
      ],
      "agingHeaders": [
        "Currency",
        "Total O/S",
        "< 30",
        "30 - 60",
        "60 - 90",
        "90 - 120",
        "120 - 150",
        "150 - 180",
        "180+"
      ],
      "agingRow": [
        "INR",
        "944.00",
        "944.00",
        "",
        "",
        "",
        "",
        "",
        ""
      ],
      "fieldGrid": [
        {
          "k": "MBL / MAWB No.",
          "v": "—"
        },
        {
          "k": "HBL / HAWB No.",
          "v": "NSAJED85630124277"
        },
        {
          "k": "Consignee",
          "v": "DEMO STEEL FACTORY CO. LTD."
        },
        {
          "k": "No. of Pkg/WT/CBM",
          "v": "3.00 PACKAGES / 22,700.00 KGS"
        },
        {
          "k": "Cargo Type",
          "v": "FCL"
        },
        {
          "k": "Vessel/Flight",
          "v": "CAP SAN JUAN / 310W"
        },
        {
          "k": "Container No.",
          "v": "TTNU0712894"
        },
        {
          "k": "ETA",
          "v": "20-MAR-23"
        },
        {
          "k": "Origin",
          "v": "NHAVA SHEVA, INDIA"
        },
        {
          "k": "ETD",
          "v": "01-MAR-23"
        },
        {
          "k": "Destination",
          "v": "JEDDAH, SAUDI ARABIA"
        },
        {
          "k": "Shipper",
          "v": "DEMO-SHIPPER ENGG COMPANY"
        },
        {
          "k": "Commodity",
          "v": "GENERAL CARGO"
        }
      ],
      "tableHeaders": [
        "Particulars",
        "SAC",
        "Rate",
        "Qty",
        "Curr",
        "Ex.Rate",
        "Taxable Amount",
        "I/UGST %",
        "I/UGST",
        "Total Amount"
      ],
      "tableRows": [
        [
          "FREIGHT CHARGE",
          "",
          "1,500.00",
          "1.000",
          "INR",
          "1.00000",
          "1,500.00",
          "18.00",
          "270.00",
          "1,770.00"
        ],
        [
          "LOCAL CHARGES",
          "",
          "800.00",
          "1.000",
          "INR",
          "1.00000",
          "800.00",
          "18.00",
          "144.00",
          "944.00"
        ],
        [
          "SEA FREIGHT CHARGE",
          "",
          "900.00",
          "1.000",
          "INR",
          "1.00000",
          "900.00",
          "18.00",
          "162.00",
          "1,062.00"
        ],
        [
          "CONTAINER CLEANING FEE",
          "",
          "1,000.00",
          "1.000",
          "INR",
          "1.00000",
          "1,000.00",
          "0.00",
          "0.00",
          "1,000.00"
        ]
      ],
      "subtotalParts": [
        "4,200.00",
        "576.00",
        "4,776.00"
      ],
      "totalLabel": "Total Amount"
    },
    "blocks": [
      {
        "type": "companyHeader"
      },
      {
        "type": "docTitle",
        "text": "TAX INVOICE",
        "align": "center"
      },
      {
        "type": "twoColumn",
        "showBillTo": true
      },
      {
        "type": "fieldGrid",
        "cols": 2
      },
      {
        "type": "chargeTable",
        "headerColor": "fill"
      },
      {
        "type": "subtotalBar",
        "variant": "igst"
      },
      {
        "type": "wordsAndTotal"
      },
      {
        "type": "termsBank"
      },
      {
        "type": "colorfulFooter"
      }
    ]
  },
  {
    "code": "INVOICE_REPORT_FORMAT_14_INVOICE",
    "formatNumber": 14,
    "name": "Invoice Report Format-14 Invoice",
    "paper": "A4",
    "rtl": false,
    "theme": {
      "primary": "#000000",
      "accent": "#0F4D96",
      "fill": "#F3F3F3",
      "panel": "#EBF0F4",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#9AD7FF",
      "ink": "#101010",
      "gray": "#656565",
      "white": "#FFFFFF"
    },
    "branding": {
      "company": "KingFisher Logistic",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "info@kingfisherwingsgroup.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "BOMINV230500382 / 17-MAY-23 (POSTED)",
      "invoiceDate": "17-MAY-23",
      "dueDate": "24-MAY-23",
      "billToLabel": "Client",
      "billToName": "DEMO LOGISTICS INDIA PVT LTD",
      "billToAddress": "21, PORT BLAIR, KRISHNA ST, MANNARGUDI, TAMIL NADU, INDIA, 676876",
      "billToPhone": "798798798",
      "fax": "9879878",
      "vatNo": "68768978898098",
      "billToGstin": "888329087642356",
      "creditTerm": "CASH",
      "currency": "INR",
      "words": "Rupee Four Thousand Two Hundred Only",
      "subtotal": "4,200.00",
      "tax": "576.00",
      "total": "4,200.00",
      "narration": "MBL NO... / HBL NO. NSAJED85630124277 / JOB NO.",
      "officeAddressLines": [
        "MUMBAI",
        "406, 4TH FLOOR, D-21 CORPORATE PARK, SECTOR 21,, MUMBAI, Pincode : 400001"
      ],
      "taxAmountLines": [
        "GST18",
        "GST 15%"
      ],
      "metaRows": [
        {
          "k": "Invoice No.",
          "v": "BOMINV230500382 / 17-MAY-23 (POSTED)"
        },
        {
          "k": "Narration",
          "v": "MBL NO... / HBL NO. NSAJED85630124277 / JOB NO."
        },
        {
          "k": "Reference No.",
          "v": "—"
        },
        {
          "k": "Currency",
          "v": "INR 1.000000"
        },
        {
          "k": "Due Date",
          "v": "24-MAY-23"
        },
        {
          "k": "Credit Term",
          "v": "CASH"
        },
        {
          "k": "VAT No. (Client)",
          "v": "888329087642356"
        }
      ],
      "termsLines": [
        "1. Payment to be made by cash. The company is not responsible for any cash settlement without an official receipt."
      ],
      "bankLines": [
        "Beneficiary Name: KingFisher Logistic",
        "Bank : HDFC",
        "A/c No : XXXXXXXXXXX",
        "IBAN Code : ABA:XXXXXX",
        "Swift Code : XXXXXX",
        "Address : Dubai, United Arab Emirates"
      ],
      "osTableHeaders": [
        "Date",
        "Voucher No",
        "Narration",
        "Currency",
        "FCY Amount",
        "O/S FCY Amount",
        "Aging"
      ],
      "osTableRows": [
        [
          "16-MAY-23",
          "BOMINV230500371",
          "MBL NO... / HBL NO. 6676687 / JOB NO.CBOMEXP230764",
          "INR",
          "944.00",
          "944.00",
          "1"
        ]
      ],
      "agingHeaders": [
        "Currency",
        "Total O/S",
        "< 30",
        "30 - 60",
        "60 - 90",
        "90 - 120",
        "120 - 150",
        "150 - 180",
        "180+"
      ],
      "agingRow": [
        "INR",
        "944.00",
        "944.00",
        "",
        "",
        "",
        "",
        "",
        ""
      ],
      "tableHeaders": [
        "Charges",
        "Unit",
        "Qty",
        "Amount / Qty",
        "Currency",
        "Ex.Rate",
        "FCY Amount",
        "Amount (INR)"
      ],
      "tableRows": [
        [
          "FREIGHT CHARGE",
          "1 TON OR 1/2 MEASURE",
          "1",
          "1,500.00",
          "INR",
          "1.00000",
          "1,500.00",
          "1,500.00"
        ],
        [
          "LOCAL CHARGES",
          "—",
          "1",
          "800.00",
          "INR",
          "1.00000",
          "800.00",
          "800.00"
        ],
        [
          "SEA FREIGHT CHARGE",
          "1 TON OR 1/2 MEASURE",
          "1",
          "900.00",
          "INR",
          "1.00000",
          "900.00",
          "900.00"
        ],
        [
          "CONTAINER CLEANING FEE",
          "1 TON OR 1/2 MEASURE",
          "1",
          "1,000.00",
          "INR",
          "1.00000",
          "1,000.00",
          "1,000.00"
        ]
      ]
    },
    "blocks": [
      {
        "type": "companyHeader"
      },
      {
        "type": "officeAddressBand"
      },
      {
        "type": "docTitle",
        "text": "INVOICE",
        "align": "center"
      },
      {
        "type": "twoColumn",
        "showBillTo": true,
        "showCreditTerm": true
      },
      {
        "type": "chargeTable",
        "headerColor": "fill"
      },
      {
        "type": "totalsOnly"
      },
      {
        "type": "taxAmountBox"
      },
      {
        "type": "wordsAndTotal"
      },
      {
        "type": "termsBank"
      },
      {
        "type": "colorfulFooter"
      }
    ]
  },
  {
    "code": "INVOICE_REPORT_FORMAT_15_INVOICE_FCY",
    "formatNumber": 15,
    "name": "Invoice Report Format-15 Invoice FCY",
    "paper": "Letter",
    "rtl": false,
    "theme": {
      "primary": "#000000",
      "accent": "#0F4D96",
      "fill": "#F3F3F3",
      "panel": "#EBF0F4",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#9AD7FF",
      "ink": "#101010",
      "gray": "#656565",
      "white": "#FFFFFF"
    },
    "branding": {
      "company": "KingFisher Logistic",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "info@kingfisherwingsgroup.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "BOMINV230500382",
      "invoiceDate": "17-MAY-23",
      "dueDate": "24-MAY-23",
      "billToLabel": "Agent",
      "billToName": "DEMO LOGISTICS INDIA PVT LTD",
      "billToAddress": "21, PORT BLAIR, KRISHNA ST, MANNARGUDI, TAMIL NADU, INDIA, 676876",
      "billToPhone": "798798798",
      "fax": "9879878",
      "vatNo": "68768978898098",
      "billToGstin": "888329087642356",
      "creditTerm": "CASH",
      "currency": "INR",
      "words": "Rupee Four Thousand Seven Hundred Seventy-Six Only",
      "subtotal": "4,200.00",
      "tax": "576.00",
      "total": "4,776.00",
      "narration": "MBL NO... / HBL NO. NSAJED85630124277 / JOB NO.",
      "officeAddressLines": [
        "MUMBAI",
        "406, 4TH FLOOR, D-21 CORPORATE PARK, SECTOR 21,, MUMBAI, Pincode : 400001"
      ],
      "taxAmountLines": [
        "GST18",
        "GST 15%"
      ],
      "metaRows": [
        {
          "k": "Invoice No.",
          "v": "BOMINV230500382 / 17-MAY-23 (POSTED)"
        },
        {
          "k": "Credit Term",
          "v": "CASH"
        },
        {
          "k": "Due Date",
          "v": "17-MAY-23"
        }
      ],
      "termsLines": [
        "1. Payment to be made by cash. The company is not responsible for any cash settlement without an official receipt."
      ],
      "bankLines": [
        "Beneficiary Name: KingFisher Logistic",
        "Bank : HDFC",
        "A/c No : XXXXXXXXXXX",
        "IBAN Code : ABA:XXXXXX",
        "Swift Code : XXXXXX",
        "Address : Dubai, United Arab Emirates"
      ],
      "osTableHeaders": [
        "Date",
        "Voucher No",
        "Narration",
        "Currency",
        "FCY Amount",
        "O/S FCY Amount",
        "Aging"
      ],
      "osTableRows": [
        [
          "16-MAY-23",
          "BOMINV230500371",
          "MBL NO... / HBL NO. 6676687 / JOB NO.CBOMEXP230764",
          "INR",
          "944.00",
          "944.00",
          "1"
        ]
      ],
      "agingHeaders": [
        "Currency",
        "Total O/S",
        "< 30",
        "30 - 60",
        "60 - 90",
        "90 - 120",
        "120 - 150",
        "150 - 180",
        "180+"
      ],
      "agingRow": [
        "INR",
        "944.00",
        "944.00",
        "",
        "",
        "",
        "",
        "",
        ""
      ],
      "fieldGrid": [
        {
          "k": "Shipper",
          "v": "DEMO-SHIPPER ENGG COMPANY"
        },
        {
          "k": "Consignee",
          "v": "DEMO STEEL FACTORY CO. LTD."
        },
        {
          "k": "Shipment No.",
          "v": "BOM/EXP/23/05/B/0709 / 16-MAY-23"
        },
        {
          "k": "HBL / HAWB No.",
          "v": "NSAJED85630124277"
        },
        {
          "k": "Place of Receipt",
          "v": "INMAA-CHENNAI"
        },
        {
          "k": "Port of Loading",
          "v": "NHAVA SHEVA, INDIA"
        },
        {
          "k": "Port of Discharge",
          "v": "JEDDAH, SAUDI ARABIA"
        },
        {
          "k": "Place of Delivery",
          "v": "JEDDAH SAUDI ARABIA"
        },
        {
          "k": "ETD",
          "v": "01-MAR-23"
        },
        {
          "k": "ETA",
          "v": "20-MAR-23"
        },
        {
          "k": "INCO Terms",
          "v": "FOB"
        },
        {
          "k": "Narration",
          "v": "MBL NO... / HBL NO. NSAJED85630124277 / JOB NO."
        }
      ],
      "containerHeaders": [
        "Container No.",
        "Type",
        "Description",
        "No of Pcs",
        "Gross Weight",
        "Volume"
      ],
      "containerRow": [
        "TTNU0712894",
        "40' FLAT",
        "GENERAL CARGO",
        "3 PACKAGES",
        "22,700.000 KGS",
        "22,700.000"
      ],
      "tableHeaders": [
        "Charges",
        "Currency",
        "Qty",
        "Amount / Qty",
        "FCY Amount",
        "Total Amount (INR)"
      ],
      "tableRows": [
        [
          "FREIGHT CHARGE",
          "INR",
          "1",
          "1,500.00",
          "1,500.00",
          "1,500.00"
        ],
        [
          "LOCAL CHARGES",
          "INR",
          "1",
          "800.00",
          "800.00",
          "800.00"
        ],
        [
          "SEA FREIGHT CHARGE",
          "INR",
          "1",
          "900.00",
          "900.00",
          "900.00"
        ],
        [
          "CONTAINER CLEANING FEE",
          "INR",
          "1",
          "1,000.00",
          "1,000.00",
          "1,000.00"
        ],
        [
          "I/U GST 18%",
          "INR",
          "1",
          "576.00",
          "576.00",
          "576.00"
        ]
      ]
    },
    "blocks": [
      {
        "type": "companyHeader"
      },
      {
        "type": "docTitle",
        "text": "INVOICE / DEBIT NOTE",
        "align": "center"
      },
      {
        "type": "twoColumn",
        "showBillTo": true,
        "showCreditTerm": true
      },
      {
        "type": "fieldGrid",
        "cols": 2
      },
      {
        "type": "containerNote"
      },
      {
        "type": "chargeTable",
        "headerColor": "fill"
      },
      {
        "type": "wordsAndTotal"
      },
      {
        "type": "termsBank"
      },
      {
        "type": "colorfulFooter"
      }
    ]
  },
  {
    "code": "INVOICE_REPORT_FORMAT_16_STANDARD_TAX_INVOICE_PREPRINTED",
    "formatNumber": 16,
    "name": "Invoice Report Format-16 Standard Tax Invoice Preprinted",
    "paper": "A4",
    "rtl": false,
    "theme": {
      "primary": "#000000",
      "accent": "#0F4D96",
      "fill": "#F3F3F3",
      "panel": "#EBF0F4",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#9AD7FF",
      "ink": "#101010",
      "gray": "#656565",
      "white": "#FFFFFF"
    },
    "branding": {
      "company": "KingFisher Logistic",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "info@kingfisherwingsgroup.com",
      "logo": "kingfisher"
    },
    "demo": {
      "billToName": "Demo Customer Trading Co.",
      "billToAddress": "Plot 12, JAFZA, Dubai, UAE",
      "invoiceNo": "KFL-INV-2026-0042",
      "invoiceDate": "14-Sep-2026",
      "dueDate": "28-Sep-2026",
      "currency": "AED",
      "total": "AED 1,517.25",
      "metaRows": [
        {
          "k": "No.",
          "v": "KFL-INV-2026-0042"
        },
        {
          "k": "Date",
          "v": "14-Sep-2026"
        },
        {
          "k": "Due",
          "v": "28-Sep-2026"
        }
      ],
      "tableHeaders": [
        "Description",
        "Qty",
        "Rate",
        "Amount"
      ],
      "tableRows": [
        [
          "Freight charges",
          "1",
          "1,250.00",
          "1,250.00"
        ],
        [
          "Documentation fee",
          "1",
          "75.00",
          "75.00"
        ],
        [
          "THC origin",
          "1",
          "120.00",
          "120.00"
        ]
      ]
    },
    "blocks": [
      {
        "type": "companyHeader"
      },
      {
        "type": "docTitle",
        "text": "TAX INVOICE",
        "align": "center"
      },
      {
        "type": "formatBadge"
      },
      {
        "type": "twoColumn",
        "showBillTo": true
      },
      {
        "type": "chargeTable",
        "headerColor": "fill"
      },
      {
        "type": "wordsAndTotal"
      },
      {
        "type": "colorfulFooter"
      }
    ]
  },
  {
    "code": "INVOICE_REPORT_FORMAT_17_INVOICE_JASPER",
    "formatNumber": 17,
    "name": "Invoice Report Format-17 Invoice Jasper",
    "paper": "A4",
    "rtl": false,
    "theme": {
      "primary": "#000000",
      "accent": "#0F4D96",
      "fill": "#F3F3F3",
      "panel": "#EBF0F4",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#9AD7FF",
      "ink": "#101010",
      "gray": "#656565",
      "white": "#FFFFFF"
    },
    "branding": {
      "company": "KingFisher Logistic",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "info@kingfisherwingsgroup.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "BOMINV230500382 / 17-MAY-23 (POSTED)",
      "invoiceDate": "17-MAY-23",
      "dueDate": "24-MAY-23",
      "billToLabel": "Client",
      "billToName": "DEMO LOGISTICS INDIA PVT LTD",
      "billToAddress": "21, PORT BLAIR, KRISHNA ST, MANNARGUDI, TAMIL NADU, INDIA, 676876",
      "billToPhone": "798798798",
      "fax": "9879878",
      "vatNo": "68768978898098",
      "billToGstin": "888329087642356",
      "creditTerm": "CASH",
      "currency": "INR",
      "words": "Rupee Four Thousand Two Hundred Only",
      "subtotal": "4,200.00",
      "tax": "576.00",
      "total": "4,200.00",
      "narration": "MBL NO... / HBL NO. NSAJED85630124277 / JOB NO.",
      "officeAddressLines": [
        "MUMBAI",
        "406, 4TH FLOOR, D-21 CORPORATE PARK, SECTOR 21,, MUMBAI, Pincode : 400001"
      ],
      "taxAmountLines": [
        "GST18",
        "GST 15%"
      ],
      "metaRows": [
        {
          "k": "Invoice No.",
          "v": "BOMINV230500382 / 17-MAY-23 (POSTED)"
        },
        {
          "k": "Narration",
          "v": "MBL NO... / HBL NO. NSAJED85630124277 / JOB NO."
        },
        {
          "k": "Reference No.",
          "v": "—"
        },
        {
          "k": "Currency",
          "v": "INR 1.000000"
        },
        {
          "k": "Due Date",
          "v": "24-MAY-23"
        },
        {
          "k": "Credit Term",
          "v": "CASH"
        },
        {
          "k": "VAT No. (Client)",
          "v": "888329087642356"
        }
      ],
      "termsLines": [
        "1. Payment to be made by cash. The company is not responsible for any cash settlement without an official receipt."
      ],
      "bankLines": [
        "Beneficiary Name: KingFisher Logistic",
        "Bank : HDFC",
        "A/c No : XXXXXXXXXXX",
        "IBAN Code : ABA:XXXXXX",
        "Swift Code : XXXXXX",
        "Address : Dubai, United Arab Emirates"
      ],
      "osTableHeaders": [
        "Date",
        "Voucher No",
        "Narration",
        "Currency",
        "FCY Amount",
        "O/S FCY Amount",
        "Aging"
      ],
      "osTableRows": [
        [
          "16-MAY-23",
          "BOMINV230500371",
          "MBL NO... / HBL NO. 6676687 / JOB NO.CBOMEXP230764",
          "INR",
          "944.00",
          "944.00",
          "1"
        ]
      ],
      "agingHeaders": [
        "Currency",
        "Total O/S",
        "< 30",
        "30 - 60",
        "60 - 90",
        "90 - 120",
        "120 - 150",
        "150 - 180",
        "180+"
      ],
      "agingRow": [
        "INR",
        "944.00",
        "944.00",
        "",
        "",
        "",
        "",
        "",
        ""
      ],
      "tableHeaders": [
        "Charges",
        "Unit",
        "Qty",
        "Amount / Qty",
        "Currency",
        "Ex.Rate",
        "FCY Amount",
        "Amount (INR)"
      ],
      "tableRows": [
        [
          "FREIGHT CHARGE",
          "1 TON OR 1/2 MEASURE",
          "1",
          "1,500.00",
          "INR",
          "1.00000",
          "1,500.00",
          "1,500.00"
        ],
        [
          "LOCAL CHARGES",
          "—",
          "1",
          "800.00",
          "INR",
          "1.00000",
          "800.00",
          "800.00"
        ],
        [
          "SEA FREIGHT CHARGE",
          "1 TON OR 1/2 MEASURE",
          "1",
          "900.00",
          "INR",
          "1.00000",
          "900.00",
          "900.00"
        ],
        [
          "CONTAINER CLEANING FEE",
          "1 TON OR 1/2 MEASURE",
          "1",
          "1,000.00",
          "INR",
          "1.00000",
          "1,000.00",
          "1,000.00"
        ]
      ]
    },
    "blocks": [
      {
        "type": "companyHeader"
      },
      {
        "type": "officeAddressBand"
      },
      {
        "type": "docTitle",
        "text": "INVOICE",
        "align": "center"
      },
      {
        "type": "twoColumn",
        "showBillTo": true,
        "showCreditTerm": true
      },
      {
        "type": "chargeTable",
        "headerColor": "fill"
      },
      {
        "type": "totalsOnly"
      },
      {
        "type": "taxAmountBox"
      },
      {
        "type": "wordsAndTotal"
      },
      {
        "type": "termsBank"
      },
      {
        "type": "colorfulFooter"
      }
    ]
  },
  {
    "code": "INVOICE_REPORT_FORMAT_18_LAND_FREIGHT_TRANSPORTATION_INVOICE",
    "formatNumber": 18,
    "name": "Invoice Report Format-18 Land Freight Transportation Invoice",
    "paper": "A4",
    "rtl": false,
    "theme": {
      "primary": "#000000",
      "accent": "#0F4D96",
      "fill": "#F3F3F3",
      "panel": "#EBF0F4",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#9AD7FF",
      "ink": "#101010",
      "gray": "#656565",
      "white": "#FFFFFF"
    },
    "branding": {
      "company": "KingFisher Logistic",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "info@kingfisherwingsgroup.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "BOMINV230500382",
      "invoiceDate": "17-MAY-23",
      "billToLabel": "BILL TO",
      "billToName": "DEMO LOGISTICS INDIA PVT LTD",
      "billToAddress": "21, PORT BLAIR, KRISHNA ST, MANNARGUDI, TAMIL NADU, INDIA, 676876",
      "billToPhone": "798798798",
      "fax": "9879878",
      "vatNo": "68768978898098",
      "billToGstin": "888329087642356",
      "currency": "INR",
      "words": "Rupee Four Thousand Seven Hundred Seventy-Six Only",
      "total": "4,776.00",
      "trnNo": "100617975600003",
      "docSubtitle": "VAT / TAX INVOICE — LAND FREIGHT / TRANSPORTATION",
      "referenceRows": [
        {
          "k": "Invoice Number",
          "v": "BOMINV230500382"
        },
        {
          "k": "Invoice Date",
          "v": "17-MAY-23"
        },
        {
          "k": "Agreed Terms/Days",
          "v": "CASH / 0"
        },
        {
          "k": "Customer Ref.",
          "v": "—"
        }
      ],
      "tableHeaders": [
        "Load Date",
        "Delivery Date",
        "Origin",
        "Destination",
        "Truck# / Charge",
        "Unit Type",
        "VAT %",
        "Unit Rate",
        "TAX Amount",
        "Total Charges"
      ],
      "tableRows": [
        [
          "01-MAR-23",
          "20-MAR-23",
          "INNSA",
          "SAJED",
          "FREIGHT CHARGE",
          "1 TON OR 1/2 MEASURE",
          "18 %",
          "1,500.00",
          "",
          "1,500.00"
        ],
        [
          "01-MAR-23",
          "20-MAR-23",
          "INNSA",
          "SAJED",
          "LOCAL CHARGES",
          "—",
          "18 %",
          "800.00",
          "",
          "800.00"
        ],
        [
          "01-MAR-23",
          "20-MAR-23",
          "INNSA",
          "SAJED",
          "SEA FREIGHT CHARGE",
          "1 TON OR 1/2 MEASURE",
          "18 %",
          "900.00",
          "",
          "900.00"
        ],
        [
          "01-MAR-23",
          "20-MAR-23",
          "INNSA",
          "SAJED",
          "CONTAINER CLEANING FEE",
          "1 TON OR 1/2 MEASURE",
          "15 %",
          "1,000.00",
          "",
          "1,000.00"
        ]
      ],
      "subtotalParts": [
        "4,200.00",
        "0.00",
        "4,200.00"
      ],
      "termsLines": [
        "1. Payment to be made by cash. The company is not responsible for any cash settlement without an official receipt."
      ],
      "bankLines": [
        "Beneficiary Name: KingFisher Logistic",
        "Bank : HDFC",
        "A/c No : XXXXXXXXXXX",
        "IBAN Code : ABA:XXXXXX",
        "Swift Code : XXXXXX",
        "Address : Dubai, United Arab Emirates"
      ]
    },
    "blocks": [
      {
        "type": "companyHeader"
      },
      {
        "type": "landFreightHeader",
        "title": "VAT / TAX INVOICE — LAND FREIGHT / TRANSPORTATION"
      },
      {
        "type": "twoColumn",
        "showBillTo": true
      },
      {
        "type": "docTitle",
        "text": "DETAILS OF CHARGES / SHIPMENTS",
        "align": "start"
      },
      {
        "type": "chargeTable",
        "headerColor": "fill"
      },
      {
        "type": "subtotalBar",
        "variant": "tax"
      },
      {
        "type": "wordsAndTotal"
      },
      {
        "type": "termsBank"
      },
      {
        "type": "stampSignature"
      },
      {
        "type": "colorfulFooter"
      }
    ]
  },
  {
    "code": "INVOICE_REPORT_FORMAT_19_DEBIT_NOTE_VIETNAM",
    "formatNumber": 19,
    "name": "Invoice Report Format-19 Debit Note Vietnam",
    "paper": "A4",
    "rtl": false,
    "theme": {
      "primary": "#000000",
      "accent": "#0F4D96",
      "fill": "#F3F3F3",
      "panel": "#EBF0F4",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#9AD7FF",
      "ink": "#101010",
      "gray": "#656565",
      "white": "#FFFFFF"
    },
    "branding": {
      "company": "KingFisher Logistic",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "info@kingfisherwingsgroup.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "BOMINV230500382",
      "invoiceDate": "17-MAY-23 (POSTED)",
      "billToLabel": "Client",
      "billToName": "DEMO LOGISTICS INDIA PVT LTD",
      "billToAddress": "21, PORT BLAIR KRISHNA ST MANNARGUDI, TAMIL NADU INDIA 676876",
      "billToPhone": "798798798",
      "billToGstin": "888329087642356",
      "currency": "INR",
      "words": "Rupee Four Thousand Seven Hundred Seventy-Six Only",
      "total": "4,776.00",
      "totalLabel": "Total : INR",
      "containerNote": "TTNU0712894,",
      "metaRows": [
        {
          "k": "Invoice No.",
          "v": "BOMINV230500382"
        },
        {
          "k": "Date",
          "v": "17-MAY-23 (POSTED)"
        },
        {
          "k": "Job No.",
          "v": "—"
        },
        {
          "k": "Shipment No.",
          "v": "BOM/EXP/23/05/B/0709 / 16-MAY-23"
        }
      ],
      "fieldGrid": [
        {
          "k": "Place of Receipt",
          "v": "INMAA-CHENNAI"
        },
        {
          "k": "Consignee",
          "v": "DEMO STEEL FACTORY CO. LTD. JEDDAH SAUDI ARABIA"
        },
        {
          "k": "Place of Delivery",
          "v": "JEDDAH SAUDI ARABIA"
        },
        {
          "k": "MAWB/MBL No.",
          "v": "—"
        },
        {
          "k": "Vsl / Voyage",
          "v": "CAP SAN JUAN / 310W"
        },
        {
          "k": "ETD",
          "v": "01-MAR-23"
        },
        {
          "k": "ETA",
          "v": "20-MAR-23"
        },
        {
          "k": "Reference No.",
          "v": "—"
        },
        {
          "k": "Currency",
          "v": "INR 1.000000"
        },
        {
          "k": "HAWB/HBL No.",
          "v": "NSAJED85630124277"
        },
        {
          "k": "Total No. of Pcs / G.Weight / V.Weight",
          "v": "3.00 / 22,700.00 / 22,700.00"
        },
        {
          "k": "Department",
          "v": "FCL EXPORT"
        },
        {
          "k": "Port of Loading",
          "v": "NHAVA SHEVA, INDIA"
        },
        {
          "k": "Shipper",
          "v": "DEMO-SHIPPER ENGG COMPANY"
        },
        {
          "k": "Port of Discharge",
          "v": "JEDDAH, SAUDI ARABIA"
        },
        {
          "k": "Narration",
          "v": "MBL NO... / HBL NO. NSAJED85630124277 / JOB NO."
        }
      ],
      "tableHeaders": [
        "Charge",
        "Qty",
        "Amount / Qty",
        "Amount (INR)"
      ],
      "tableRows": [
        [
          "FREIGHT CHARGE",
          "1.000",
          "1,500.00",
          "1,500.00"
        ],
        [
          "LOCAL CHARGES",
          "1.000",
          "800.00",
          "800.00"
        ],
        [
          "SEA FREIGHT CHARGE",
          "1.000",
          "900.00",
          "900.00"
        ],
        [
          "CONTAINER CLEANING FEE",
          "1.000",
          "1,000.00",
          "1,000.00"
        ]
      ],
      "termsLines": [
        "1. Payment to be made by cash. The company is not responsible for any cash settlement without an official receipt."
      ],
      "bankLines": [
        "Beneficiary Name: KingFisher Logistic",
        "Bank : HDFC",
        "A/c No : XXXXXXXXXXX",
        "IBAN Code : ABA:XXXXXX",
        "Swift Code : XXXXXX",
        "Address : Dubai, United Arab Emirates"
      ]
    },
    "blocks": [
      {
        "type": "companyHeader"
      },
      {
        "type": "docTitle",
        "text": "EXPORT INVOICE",
        "align": "center"
      },
      {
        "type": "exportBondBanner"
      },
      {
        "type": "twoColumn",
        "showBillTo": true
      },
      {
        "type": "fieldGrid",
        "cols": 2
      },
      {
        "type": "chargeTable",
        "headerColor": "fill"
      },
      {
        "type": "wordsAndTotal"
      },
      {
        "type": "containerNote"
      },
      {
        "type": "termsBank"
      },
      {
        "type": "colorfulFooter"
      }
    ]
  },
  {
    "code": "INVOICE_REPORT_FORMAT_20_TAX_INVOICE_INDIA",
    "formatNumber": 20,
    "name": "Invoice Report Format-20 Tax Invoice India",
    "paper": "A4",
    "rtl": false,
    "theme": {
      "primary": "#000000",
      "accent": "#0F4D96",
      "fill": "#F3F3F3",
      "panel": "#EBF0F4",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#9AD7FF",
      "ink": "#101010",
      "gray": "#656565",
      "white": "#FFFFFF"
    },
    "branding": {
      "company": "KingFisher Logistic",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "info@kingfisherwingsgroup.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "BOMINV230500382",
      "invoiceDate": "17-MAY-23",
      "dueDate": "17-MAY-23",
      "creditTerm": "CASH",
      "billToName": "DEMOCLIEJK001",
      "billToPhone": "798798798",
      "fax": "9879878",
      "vatNo": "68768978898098",
      "shipmentNo": "BOM/EXP/23/05/B/0709",
      "shippersReference": "FCL EXPORT",
      "goodsDescription": "GENERAL CARGO",
      "placeOfSupply": "TAMIL NADU",
      "termsOfShipment": "FOB",
      "quotationNo": "—",
      "irnNo": "—",
      "currency": "INR",
      "words": "Rupee Four Thousand Seven Hundred Seventy-Six Only",
      "subtotal": "4,200.00",
      "tax": "576.00",
      "total": "4,776.00",
      "totalLabel": "INR",
      "subtotalParts": [
        "4,200.00",
        "576.00",
        "4,776.00"
      ],
      "frenchTotalWords": "quatre mille sept cent soixante-seize dollars",
      "metaRows": [
        {
          "k": "INVOICE DATE",
          "v": "17-MAY-23"
        },
        {
          "k": "SHIPMENT",
          "v": "BOM/EXP/23/05/B/0709"
        },
        {
          "k": "TERMS",
          "v": "CASH"
        },
        {
          "k": "JOB NUMBER",
          "v": "—"
        },
        {
          "k": "CUSTOMER ID",
          "v": "DEMOCLIEJK001"
        },
        {
          "k": "DUE DATE",
          "v": "17-MAY-23"
        }
      ],
      "partyLeft": {
        "title": "SHIPPER",
        "lines": [
          "DEMO-SHIPPER ENGG COMPANY"
        ]
      },
      "partyMid": {
        "title": "CONSIGNEE",
        "lines": [
          "DEMO STEEL FACTORY CO. LTD."
        ]
      },
      "fieldGrid": [
        {
          "k": "DEPARTMENT",
          "v": "FCL EXPORT"
        },
        {
          "k": "GROSS WEIGHT",
          "v": "22,700.000 KGS"
        },
        {
          "k": "CUSTOMS BROKER",
          "v": "—"
        },
        {
          "k": "Vessel / Voyage",
          "v": "CAP SAN JUAN / 310W"
        },
        {
          "k": "ORIGIN ETD",
          "v": "01-MAR-23 INNSA - NHAVA SHEVA, INDIA"
        },
        {
          "k": "DESTINATION ETA",
          "v": "20-MAR-23 SAJED - JEDDAH, SAUDI ARABIA"
        },
        {
          "k": "CONTAINERS",
          "v": "TTNU0712894 / 40' FLAT"
        },
        {
          "k": "OCEAN BILL OF LADING",
          "v": "NSAJED85630124277"
        },
        {
          "k": "HOUSE BILL OF LADING",
          "v": "—"
        },
        {
          "k": "CHARGEABLE PACKAGES",
          "v": "3 PACKAGES"
        },
        {
          "k": "VOLUME",
          "v": "22,700.000 KGS"
        }
      ],
      "termsLines": [
        "1. Payment to be made by cash. The company is not responsible for any cash settlement without an official receipt."
      ],
      "bankLines": [
        "Beneficiary Name: KingFisher Logistic",
        "Transfer Funds To : KingFisher Logistic",
        "Bank : HDFC",
        "A/c No : XXXXXXXXXXX",
        "IBAN Code : ABA:XXXXXX",
        "Swift Code : XXXXXX",
        "Address : Dubai, United Arab Emirates"
      ],
      "footerBullets": [
        "Payments delayed beyond agreed credit terms will attract interest @24% per annum.",
        "Cheques should be made out to KingFisher Logistic & crossed A/C payee.",
        "Any discrepancy should be notified in writing within 07 days from the invoice date.",
        "This is a computer-generated document & does not require a signature & stamp."
      ],
      "tableHeaders": [
        "Charge Details",
        "SAC",
        "Cur.",
        "Rate/Unit",
        "Qty",
        "Cur",
        "Amount",
        "Ex.Rate",
        "Amount",
        "IGST%",
        "IGST",
        "Total Amt (INR)"
      ],
      "tableRows": [
        [
          "FREIGHT CHARGE",
          "",
          "INR",
          "1,500.00",
          "1",
          "1,500.00",
          "1.00000",
          "1,500.00",
          "18",
          "270.00",
          "1,770.00"
        ],
        [
          "LOCAL CHARGES",
          "",
          "INR",
          "800.00",
          "1",
          "800.00",
          "1.00000",
          "800.00",
          "18",
          "144.00",
          "944.00"
        ],
        [
          "SEA FREIGHT CHARGE",
          "",
          "INR",
          "900.00",
          "1",
          "900.00",
          "1.00000",
          "900.00",
          "18",
          "162.00",
          "1,062.00"
        ],
        [
          "CONTAINER CLEANING FEE",
          "",
          "INR",
          "1,000.00",
          "1",
          "1,000.00",
          "1.00000",
          "1,000.00",
          "0",
          "0.00",
          "1,000.00"
        ]
      ]
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "docTitle",
        "text": "INVOICE BOMINV230500382",
        "align": "start"
      },
      {
        "type": "exportMetaStrip"
      },
      {
        "type": "shipmentDetails",
        "showPlaceOfSupply": true
      },
      {
        "type": "chargeTable",
        "headerColor": "fill"
      },
      {
        "type": "subtotalBar",
        "variant": "igst"
      },
      {
        "type": "exportClosing"
      },
      {
        "type": "colorfulFooter"
      }
    ]
  },
  {
    "code": "INVOICE_REPORT_FORMAT_21_WAREHOUSE_INVOICE",
    "formatNumber": 21,
    "name": "Invoice Report Format-21 Warehouse Invoice",
    "paper": "A4",
    "rtl": false,
    "theme": {
      "primary": "#0F4D96",
      "accent": "#2286C8",
      "fill": "#F3F3F3",
      "panel": "#EBF0F4",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#9AD7FF",
      "ink": "#101010",
      "gray": "#656565",
      "white": "#FFFFFF"
    },
    "branding": {
      "company": "KingFisher Logistic",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "info@kingfisherwingsgroup.com",
      "logo": "kingfisher"
    },
    "demo": {
      "billToLabel": "Client",
      "billToName": "KINGFISHER DEMO DUBAI LLC",
      "billToAddress": "AL NABHA, DUBAI",
      "billToPhone": "04-233456",
      "billToGstin": "29760737473",
      "currency": "AED",
      "words": "Dirham Seven Hundred Fifty-Six and Sixteen Fils Only",
      "total": "756.160",
      "totalLabel": "Amount (AED)",
      "metaRows": [
        {
          "k": "Invoice No",
          "v": "INV1800564"
        },
        {
          "k": "Consignee",
          "v": "KINGFISHER DEMO DUBAI LLC"
        },
        {
          "k": "Date",
          "v": "27-NOV-18 (CREATED)"
        },
        {
          "k": "Job No",
          "v": "CCDXBSI18000061 / 27-NOV-18"
        },
        {
          "k": "Shipment No",
          "v": "500138050266 / 10-OCT-18"
        },
        {
          "k": "MBL No",
          "v": "NSA.JEA.18/26917 / 12-OCT-18"
        },
        {
          "k": "Port of Loading",
          "v": "NHAVA SHEVA, INDIA"
        },
        {
          "k": "Port of Discharge",
          "v": "JEBEL ALI, UAE"
        },
        {
          "k": "Place of Delivery",
          "v": "JEBEL ALI, UAE"
        },
        {
          "k": "Vessel / Voyage",
          "v": "NORTHERN GENERAL / 0068"
        },
        {
          "k": "ETD",
          "v": "12-OCT-18"
        },
        {
          "k": "ETA",
          "v": "24-OCT-18"
        },
        {
          "k": "Narration",
          "v": "BDXBSI180115 / MBL NSA.JEA.18/26917 / HBL 500138050266"
        },
        {
          "k": "Reference No",
          "v": "REFE NO. 987890/22-NOV-18"
        },
        {
          "k": "Remarks",
          "v": "SHIPMENT FROM INDIA - PO REF # 7778909 DATE 14/10/2018"
        }
      ],
      "containerHeaders": [
        "Container No",
        "Type",
        "No of Pcs",
        "Gross Weight",
        "Volume",
        "Volume Weight"
      ],
      "containerRow": [
        "TEMU6105051",
        "40' HC",
        "12",
        "1,116.000",
        "1.903",
        "—"
      ],
      "tableHeaders": [
        "Charges",
        "GRN / GDN No",
        "Client Ref No.",
        "Unit",
        "Qty",
        "Amount / Qty",
        "Amount (AED)"
      ],
      "tableRows": [
        [
          "DELIVERY ORDER CHARGES",
          "",
          "",
          "PER SHIPMENT",
          "1",
          "275.000",
          "275.000"
        ],
        [
          "THC CHARGES",
          "",
          "",
          "W/M",
          "1.903",
          "50.000",
          "95.150"
        ],
        [
          "DOCUMENTATION CHARGES",
          "",
          "",
          "PER SHIPMENT",
          "1",
          "100.000",
          "100.000"
        ],
        [
          "HANDLING CHARGES",
          "",
          "",
          "PER SHIPMENT",
          "1",
          "250.000",
          "250.000"
        ]
      ],
      "termsLines": [
        "Payment shall be made for full amount on or prior to due date, free of charges, without any deductions.",
        "All bank charges are for the account of the paying remitter.",
        "Payment before Delivery of Bill of Lading (Export) or containers (Import).",
        "Please use Invoice Number or BL number for reference during payment."
      ],
      "wireLines": [
        "KingFisher Logistic ACCOUNT #: XXXXXXXXXXXXX (USD)",
        "SWIFT ID #: 0198766 · WIRE ROUTING #: 9877777 · ABA #: 9876666"
      ]
    },
    "blocks": [
      {
        "type": "colorBar"
      },
      {
        "type": "companyHeader"
      },
      {
        "type": "docTitle",
        "text": "INVOICE - INV1800564",
        "align": "center",
        "band": true
      },
      {
        "type": "twoColumn",
        "showBillTo": true
      },
      {
        "type": "containerStrip"
      },
      {
        "type": "chargeTable",
        "headerColor": "primary"
      },
      {
        "type": "wordsAndTotal"
      },
      {
        "type": "wireBox"
      },
      {
        "type": "termsBank"
      },
      {
        "type": "colorfulFooter"
      }
    ]
  },
  {
    "code": "INVOICE_REPORT_FORMAT_22",
    "formatNumber": 22,
    "name": "Invoice Report Format-22 Standard Tax Invoice Format-22",
    "paper": "A4",
    "rtl": false,
    "theme": {
      "primary": "#000000",
      "accent": "#0F4D96",
      "fill": "#F3F3F3",
      "panel": "#EBF0F4",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#9AD7FF",
      "ink": "#101010",
      "gray": "#656565",
      "white": "#FFFFFF"
    },
    "branding": {
      "company": "KingFisher Logistic",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "info@kingfisherwingsgroup.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "BOMINV230500382",
      "invoiceDate": "17-MAY-23",
      "dueDate": "24-MAY-23",
      "billToLabel": "To Account Of",
      "billToName": "DEMO LOGISTICS INDIA PVT LTD",
      "billToAddress": "21, PORT BLAIR, KRISHNA ST, MANNARGUDI, TAMIL NADU, INDIA, 676876",
      "billToPhone": "798798798",
      "fax": "9879878",
      "vatNo": "68768978898098",
      "billToGstin": "888329087642356",
      "creditTerm": "0 Days",
      "currency": "INR",
      "words": "Rupee Four Thousand Seven Hundred Seventy-Six Only",
      "subtotal": "4,200.00",
      "tax": "576.00",
      "total": "4,776.00",
      "narration": "MBL NO... / HBL NO. NSAJED85630124277 / JOB NO.",
      "officeAddressLines": [
        "MUMBAI",
        "406, 4TH FLOOR, D-21 CORPORATE PARK, SECTOR 21,, MUMBAI, Pincode : 400001"
      ],
      "taxAmountLines": [
        "GST18",
        "GST 15%"
      ],
      "metaRows": [
        {
          "k": "Invoice No.",
          "v": "BOMINV230500382"
        },
        {
          "k": "Date",
          "v": "17-May-23"
        },
        {
          "k": "Job No.",
          "v": "—"
        },
        {
          "k": "Terms",
          "v": "0 Days"
        },
        {
          "k": "Tax ID",
          "v": "68768978898098"
        }
      ],
      "termsLines": [
        "1. Payment to be made by cash. The company is not responsible for any cash settlement without an official receipt."
      ],
      "bankLines": [
        "Beneficiary Name: KingFisher Logistic",
        "Bank : HDFC",
        "A/c No : XXXXXXXXXXX",
        "IBAN Code : ABA:XXXXXX",
        "Swift Code : XXXXXX",
        "Address : Dubai, United Arab Emirates"
      ],
      "osTableHeaders": [
        "Date",
        "Voucher No",
        "Narration",
        "Currency",
        "FCY Amount",
        "O/S FCY Amount",
        "Aging"
      ],
      "osTableRows": [
        [
          "16-MAY-23",
          "BOMINV230500371",
          "MBL NO... / HBL NO. 6676687 / JOB NO.CBOMEXP230764",
          "INR",
          "944.00",
          "944.00",
          "1"
        ]
      ],
      "agingHeaders": [
        "Currency",
        "Total O/S",
        "< 30",
        "30 - 60",
        "60 - 90",
        "90 - 120",
        "120 - 150",
        "150 - 180",
        "180+"
      ],
      "agingRow": [
        "INR",
        "944.00",
        "944.00",
        "",
        "",
        "",
        "",
        "",
        ""
      ],
      "fieldGrid": [
        {
          "k": "Vessel",
          "v": "CAP SAN JUAN"
        },
        {
          "k": "Voyage",
          "v": "310W"
        },
        {
          "k": "ETD/ETA",
          "v": "01-MAR-23 / 20-MAR-23"
        },
        {
          "k": "MBL No.",
          "v": "—"
        },
        {
          "k": "HBL No.",
          "v": "NSAJED85630124277"
        },
        {
          "k": "POL",
          "v": "NHAVA SHEVA, INDIA"
        },
        {
          "k": "POD",
          "v": "JEDDAH, SAUDI ARABIA"
        },
        {
          "k": "DEL",
          "v": "JEDDAH SAUDI ARABIA"
        }
      ],
      "containerNote": "TTNU0712894",
      "tableHeaders": [
        "Detail of Charges",
        "Currency",
        "Rate",
        "Qty",
        "Unit",
        "Ex.Rate",
        "VAT Amount (INR)"
      ],
      "tableRows": [
        [
          "FREIGHT CHARGE",
          "INR",
          "1,500.00",
          "1",
          "1 TON OR 1/2 MEASURE",
          "1.00000",
          "1,500.00"
        ],
        [
          "LOCAL CHARGES",
          "INR",
          "800.00",
          "1",
          "—",
          "1.00000",
          "800.00"
        ],
        [
          "SEA FREIGHT CHARGE",
          "INR",
          "900.00",
          "1",
          "1 TON OR 1/2 MEASURE",
          "1.00000",
          "900.00"
        ],
        [
          "CONTAINER CLEANING FEE",
          "INR",
          "1,000.00",
          "1",
          "1 TON OR 1/2 MEASURE",
          "1.00000",
          "1,000.00"
        ]
      ],
      "totalLabel": "INR"
    },
    "blocks": [
      {
        "type": "companyHeader"
      },
      {
        "type": "docTitle",
        "text": "TAX INVOICE",
        "align": "center"
      },
      {
        "type": "twoColumn",
        "showBillTo": true,
        "showCreditTerm": true
      },
      {
        "type": "docTitle",
        "text": "Vessel Details",
        "align": "start"
      },
      {
        "type": "fieldGrid",
        "cols": 2
      },
      {
        "type": "containerNote"
      },
      {
        "type": "chargeTable",
        "headerColor": "fill"
      },
      {
        "type": "totalsOnly"
      },
      {
        "type": "wordsAndTotal"
      },
      {
        "type": "termsBank"
      },
      {
        "type": "colorfulFooter"
      }
    ]
  },
  {
    "code": "INVOICE_REPORT_FORMAT_23",
    "formatNumber": 23,
    "name": "Invoice Report Format-23 Purchase Invoice",
    "paper": "A4",
    "rtl": false,
    "theme": {
      "primary": "#000000",
      "accent": "#0F4D96",
      "fill": "#F3F3F3",
      "panel": "#EBF0F4",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#9AD7FF",
      "ink": "#101010",
      "gray": "#656565",
      "white": "#FFFFFF"
    },
    "branding": {
      "company": "KingFisher Logistic",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "info@kingfisherwingsgroup.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "MAAPI1900248",
      "invoiceDate": "28-JAN-19",
      "currency": "INR",
      "words": "Rupee Thirteen Thousand Three Hundred Thirty-Five Only",
      "total": "13,335.00",
      "remarks": "1X20: SHIPMENT TO JEBEL ALI - CMA CGM - PO NO. 9877777 DATE: 17/01/2019",
      "billToName": "4G LOGISTICS INDIA PVT LTD",
      "metaRows": [
        {
          "k": "PIN No.",
          "v": "MAAPI1900248"
        },
        {
          "k": "Date",
          "v": "28-JAN-19"
        },
        {
          "k": "A/C Name",
          "v": "CMA CGM GL"
        },
        {
          "k": "GL Date",
          "v": "28-JAN-19 (CREATED)"
        },
        {
          "k": "Narration",
          "v": "B/EXP/19/0251"
        },
        {
          "k": "Client",
          "v": "4G LOGISTICS INDIA PVT LTD"
        },
        {
          "k": "HBL No.",
          "v": "PLMAAJEA00080"
        },
        {
          "k": "MBL No.",
          "v": "MBLC9878909999"
        },
        {
          "k": "Ref No.",
          "v": "500138050036 / 22-JAN-19"
        },
        {
          "k": "Job No.",
          "v": "CEXP190148"
        },
        {
          "k": "Remarks",
          "v": "1X20: SHIPMENT TO JEBEL ALI - CMA CGM - PO NO. 9877777 DATE: 17/01/2019"
        }
      ],
      "fieldGrid": [
        {
          "k": "PIN No.",
          "v": "MAAPI1900248"
        },
        {
          "k": "Date",
          "v": "28-JAN-19"
        },
        {
          "k": "A/C Name",
          "v": "CMA CGM GL"
        },
        {
          "k": "GL Date",
          "v": "28-JAN-19 (CREATED)"
        },
        {
          "k": "Narration",
          "v": "B/EXP/19/0251"
        },
        {
          "k": "Client",
          "v": "4G LOGISTICS INDIA PVT LTD"
        },
        {
          "k": "HBL No.",
          "v": "PLMAAJEA00080"
        },
        {
          "k": "MBL No.",
          "v": "MBLC9878909999"
        },
        {
          "k": "Ref No.",
          "v": "500138050036 / 22-JAN-19"
        },
        {
          "k": "Job No.",
          "v": "CEXP190148"
        },
        {
          "k": "Remarks",
          "v": "1X20: SHIPMENT TO JEBEL ALI - CMA CGM - PO NO. 9877777 DATE: 17/01/2019"
        }
      ],
      "tableHeaders": [
        "A/C Name",
        "Narration",
        "Currency",
        "Dr / Cr",
        "Amount (INR)"
      ],
      "tableRows": [
        [
          "SEA FREIGHT FCL COST",
          "FREIGHT CHARGE",
          "INR",
          "Dr",
          "3,600.00"
        ],
        [
          "SEA FREIGHT FCL COST",
          "TERMINAL HANDLING CHARGES 20\"GP",
          "INR",
          "Dr",
          "5,500.00"
        ],
        [
          "SEA FREIGHT FCL COST",
          "SEAL FEE",
          "INR",
          "Dr",
          "250.00"
        ],
        [
          "SEA FREIGHT FCL COST",
          "BILL OF LADING",
          "INR",
          "Dr",
          "2,500.00"
        ],
        [
          "IGST COST A/C",
          "I/U GST 18%",
          "INR",
          "Dr",
          "1,485.00"
        ],
        [
          "TDS PAYABLE",
          "TDS PAYABLES 2%",
          "INR",
          "Cr",
          "237.00"
        ],
        [
          "CMA CGM",
          "TDS PAYABLES 2%",
          "INR",
          "Dr",
          "237.00"
        ]
      ],
      "signatureLabels": [
        "Requested By",
        "Checked By",
        "Chq Issued By",
        "Accountant",
        "Approved By"
      ]
    },
    "blocks": [
      {
        "type": "colorBar"
      },
      {
        "type": "companyHeader"
      },
      {
        "type": "docTitle",
        "text": "PURCHASE INVOICE - MAAPI1900248",
        "align": "center"
      },
      {
        "type": "twoColumn",
        "showBillTo": true
      },
      {
        "type": "fieldGrid",
        "cols": 2
      },
      {
        "type": "chargeTable",
        "headerColor": "fill"
      },
      {
        "type": "wordsAndTotal"
      },
      {
        "type": "signatureRow"
      },
      {
        "type": "termsBank"
      },
      {
        "type": "colorfulFooter"
      }
    ]
  },
  {
    "code": "INVOICE_REPORT_FORMAT_24",
    "formatNumber": 24,
    "name": "Invoice Report Format-24 Simple Invoice With OS",
    "paper": "A4",
    "rtl": false,
    "theme": {
      "primary": "#000000",
      "accent": "#0F4D96",
      "fill": "#F3F3F3",
      "panel": "#EBF0F4",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#9AD7FF",
      "ink": "#101010",
      "gray": "#656565",
      "white": "#FFFFFF"
    },
    "branding": {
      "company": "KingFisher Logistic",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "info@kingfisherwingsgroup.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "BOMINV230500382 / 17-MAY-23 (POSTED)",
      "invoiceDate": "17-MAY-23",
      "dueDate": "24-MAY-23",
      "billToLabel": "Client",
      "billToName": "DEMO LOGISTICS INDIA PVT LTD",
      "billToAddress": "21, PORT BLAIR, KRISHNA ST, MANNARGUDI, TAMIL NADU, INDIA, 676876",
      "billToPhone": "798798798",
      "fax": "9879878",
      "vatNo": "68768978898098",
      "billToGstin": "888329087642356",
      "creditTerm": "CASH",
      "currency": "INR",
      "words": "Rupee Four Thousand Two Hundred Only",
      "subtotal": "4,200.00",
      "tax": "576.00",
      "total": "4,200.00",
      "narration": "MBL NO... / HBL NO. NSAJED85630124277 / JOB NO.",
      "officeAddressLines": [
        "MUMBAI",
        "406, 4TH FLOOR, D-21 CORPORATE PARK, SECTOR 21,, MUMBAI, Pincode : 400001"
      ],
      "taxAmountLines": [
        "GST18",
        "GST 15%"
      ],
      "metaRows": [
        {
          "k": "Invoice No.",
          "v": "BOMINV230500382 / 17-MAY-23 (POSTED)"
        },
        {
          "k": "Narration",
          "v": "MBL NO... / HBL NO. NSAJED85630124277 / JOB NO."
        },
        {
          "k": "Reference No.",
          "v": "—"
        },
        {
          "k": "Currency",
          "v": "INR 1.000000"
        },
        {
          "k": "Due Date",
          "v": "24-MAY-23"
        },
        {
          "k": "Credit Term",
          "v": "CASH"
        },
        {
          "k": "VAT No. (Client)",
          "v": "888329087642356"
        }
      ],
      "termsLines": [
        "1. Payment to be made by cash. The company is not responsible for any cash settlement without an official receipt."
      ],
      "bankLines": [
        "Beneficiary Name: KingFisher Logistic",
        "Bank : HDFC",
        "A/c No : XXXXXXXXXXX",
        "IBAN Code : ABA:XXXXXX",
        "Swift Code : XXXXXX",
        "Address : Dubai, United Arab Emirates"
      ],
      "osTableHeaders": [
        "Date",
        "Voucher No",
        "Narration",
        "Currency",
        "FCY Amount",
        "O/S FCY Amount",
        "Aging"
      ],
      "osTableRows": [
        [
          "16-MAY-23",
          "BOMINV230500371",
          "MBL NO... / HBL NO. 6676687 / JOB NO.CBOMEXP230764",
          "INR",
          "944.00",
          "944.00",
          "1"
        ]
      ],
      "agingHeaders": [
        "Currency",
        "Total O/S",
        "< 30",
        "30 - 60",
        "60 - 90",
        "90 - 120",
        "120 - 150",
        "150 - 180",
        "180+"
      ],
      "agingRow": [
        "INR",
        "944.00",
        "944.00",
        "",
        "",
        "",
        "",
        "",
        ""
      ],
      "tableHeaders": [
        "Charges",
        "Unit",
        "Qty",
        "Amount / Qty",
        "Currency",
        "Ex.Rate",
        "FCY Amount",
        "Amount (INR)"
      ],
      "tableRows": [
        [
          "FREIGHT CHARGE",
          "1 TON OR 1/2 MEASURE",
          "1",
          "1,500.00",
          "INR",
          "1.00000",
          "1,500.00",
          "1,500.00"
        ],
        [
          "LOCAL CHARGES",
          "—",
          "1",
          "800.00",
          "INR",
          "1.00000",
          "800.00",
          "800.00"
        ],
        [
          "SEA FREIGHT CHARGE",
          "1 TON OR 1/2 MEASURE",
          "1",
          "900.00",
          "INR",
          "1.00000",
          "900.00",
          "900.00"
        ],
        [
          "CONTAINER CLEANING FEE",
          "1 TON OR 1/2 MEASURE",
          "1",
          "1,000.00",
          "INR",
          "1.00000",
          "1,000.00",
          "1,000.00"
        ]
      ]
    },
    "blocks": [
      {
        "type": "companyHeader"
      },
      {
        "type": "docTitle",
        "text": "TAX INVOICE - BOMINV230500382",
        "align": "center"
      },
      {
        "type": "twoColumn",
        "showBillTo": true,
        "showCreditTerm": true
      },
      {
        "type": "chargeTable",
        "headerColor": "fill"
      },
      {
        "type": "totalsOnly"
      },
      {
        "type": "taxAmountBox"
      },
      {
        "type": "wordsAndTotal"
      },
      {
        "type": "termsBank"
      },
      {
        "type": "outstandingTable"
      },
      {
        "type": "colorfulFooter"
      }
    ]
  },
  {
    "code": "INVOICE_REPORT_FORMAT_25",
    "formatNumber": 25,
    "name": "Invoice Report Format-25 Simple Invoice India With OS",
    "paper": "A4",
    "rtl": false,
    "theme": {
      "primary": "#000000",
      "accent": "#0F4D96",
      "fill": "#F3F3F3",
      "panel": "#EBF0F4",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#9AD7FF",
      "ink": "#101010",
      "gray": "#656565",
      "white": "#FFFFFF"
    },
    "branding": {
      "company": "KingFisher Logistic",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "info@kingfisherwingsgroup.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "BOMINV230500382 / 17-MAY-23 (POSTED)",
      "invoiceDate": "17-MAY-23",
      "dueDate": "24-MAY-23",
      "billToLabel": "Client",
      "billToName": "DEMO LOGISTICS INDIA PVT LTD",
      "billToAddress": "21, PORT BLAIR, KRISHNA ST, MANNARGUDI, TAMIL NADU, INDIA, 676876",
      "billToPhone": "798798798",
      "fax": "9879878",
      "vatNo": "68768978898098",
      "billToGstin": "888329087642356",
      "creditTerm": "CASH",
      "currency": "INR",
      "words": "Rupee Four Thousand Seven Hundred Seventy-Six Only",
      "subtotal": "4,200.00",
      "tax": "576.00",
      "total": "4,776.00",
      "narration": "MBL NO... / HBL NO. NSAJED85630124277 / JOB NO.",
      "officeAddressLines": [
        "MUMBAI",
        "406, 4TH FLOOR, D-21 CORPORATE PARK, SECTOR 21,, MUMBAI, Pincode : 400001"
      ],
      "taxAmountLines": [
        "GST18-I/U GST18% 576.00"
      ],
      "metaRows": [
        {
          "k": "Invoice No.",
          "v": "BOMINV230500382 / 17-MAY-23 (POSTED)"
        },
        {
          "k": "Narration",
          "v": "MBL NO... / HBL NO. NSAJED85630124277 / JOB NO."
        },
        {
          "k": "Reference No.",
          "v": "—"
        },
        {
          "k": "Currency",
          "v": "INR 1.000000"
        },
        {
          "k": "Due Date",
          "v": "24-MAY-23"
        },
        {
          "k": "Credit Term",
          "v": "CASH"
        },
        {
          "k": "VAT No. (Client)",
          "v": "888329087642356"
        }
      ],
      "termsLines": [
        "1. Payment to be made by cash. The company is not responsible for any cash settlement without an official receipt."
      ],
      "bankLines": [
        "Beneficiary Name: KingFisher Logistic",
        "Bank : HDFC",
        "A/c No : XXXXXXXXXXX",
        "IBAN Code : ABA:XXXXXX",
        "Swift Code : XXXXXX",
        "Address : Dubai, United Arab Emirates"
      ],
      "osTableHeaders": [
        "Date",
        "Voucher No",
        "Narration",
        "Currency",
        "FCY Amount",
        "O/S FCY Amount",
        "Aging"
      ],
      "osTableRows": [
        [
          "16-MAY-23",
          "BOMINV230500371",
          "MBL NO... / HBL NO. 6676687 / JOB NO.CBOMEXP230764",
          "INR",
          "944.00",
          "944.00",
          "1"
        ]
      ],
      "agingHeaders": [
        "Currency",
        "Total O/S",
        "< 30",
        "30 - 60",
        "60 - 90",
        "90 - 120",
        "120 - 150",
        "150 - 180",
        "180+"
      ],
      "agingRow": [
        "INR",
        "944.00",
        "944.00",
        "",
        "",
        "",
        "",
        "",
        ""
      ],
      "tableHeaders": [
        "Charges",
        "SAC",
        "Taxable Amount",
        "SGST %",
        "SGST",
        "CGST %",
        "CGST",
        "I/UGST %",
        "I/UGST",
        "Total Amount (INR)"
      ],
      "tableRows": [
        [
          "FREIGHT CHARGE",
          "",
          "1,500.00",
          "",
          "",
          "",
          "",
          "18.00",
          "270.00",
          "1,500.00"
        ],
        [
          "LOCAL CHARGES",
          "",
          "800.00",
          "",
          "",
          "",
          "",
          "18.00",
          "144.00",
          "800.00"
        ],
        [
          "SEA FREIGHT CHARGE",
          "",
          "900.00",
          "",
          "",
          "",
          "",
          "18.00",
          "162.00",
          "900.00"
        ],
        [
          "CONTAINER CLEANING FEE",
          "",
          "1,000.00",
          "",
          "",
          "",
          "",
          "0.00",
          "0.00",
          "1,000.00"
        ]
      ],
      "subtotalParts": [
        "4,200.00",
        "576.00",
        "4,200.00"
      ]
    },
    "blocks": [
      {
        "type": "companyHeader"
      },
      {
        "type": "docTitle",
        "text": "TAX INVOICE - BOMINV230500382",
        "align": "center"
      },
      {
        "type": "twoColumn",
        "showBillTo": true,
        "showCreditTerm": true
      },
      {
        "type": "chargeTable",
        "headerColor": "fill"
      },
      {
        "type": "subtotalBar",
        "variant": "igst"
      },
      {
        "type": "taxAmountBox"
      },
      {
        "type": "wordsAndTotal"
      },
      {
        "type": "termsBank"
      },
      {
        "type": "outstandingTable"
      },
      {
        "type": "colorfulFooter"
      }
    ]
  },
  {
    "code": "INVOICE_REPORT_FORMAT_26",
    "formatNumber": 26,
    "name": "Invoice Report Format-26 FG Simple Invoice",
    "paper": "A4",
    "rtl": false,
    "theme": {
      "primary": "#000000",
      "accent": "#0F4D96",
      "fill": "#F3F3F3",
      "panel": "#EBF0F4",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#9AD7FF",
      "ink": "#101010",
      "gray": "#656565",
      "white": "#FFFFFF"
    },
    "branding": {
      "company": "KingFisher Logistic",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "info@kingfisherwingsgroup.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "BOMINV230500382 / 17-MAY-23 (POSTED)",
      "invoiceDate": "17-MAY-23",
      "dueDate": "24-MAY-23",
      "billToLabel": "Client",
      "billToName": "DEMO LOGISTICS INDIA PVT LTD",
      "billToAddress": "21, PORT BLAIR, KRISHNA ST, MANNARGUDI, TAMIL NADU, INDIA, 676876",
      "billToPhone": "798798798",
      "fax": "9879878",
      "vatNo": "68768978898098",
      "billToGstin": "888329087642356",
      "creditTerm": "CASH",
      "currency": "INR",
      "words": "Rupee Four Thousand Two Hundred Only",
      "subtotal": "4,200.00",
      "tax": "576.00",
      "total": "4,200.00",
      "narration": "MBL NO... / HBL NO. NSAJED85630124277 / JOB NO.",
      "officeAddressLines": [
        "MUMBAI",
        "406, 4TH FLOOR, D-21 CORPORATE PARK, SECTOR 21,, MUMBAI, Pincode : 400001"
      ],
      "taxAmountLines": [
        "GST18",
        "GST 15%"
      ],
      "metaRows": [
        {
          "k": "Invoice No.",
          "v": "BOMINV230500382 / 17-MAY-23 (POSTED)"
        },
        {
          "k": "Narration",
          "v": "MBL NO... / HBL NO. NSAJED85630124277 / JOB NO."
        },
        {
          "k": "Reference No.",
          "v": "—"
        },
        {
          "k": "Currency",
          "v": "INR 1.000000"
        },
        {
          "k": "Due Date",
          "v": "24-MAY-23"
        },
        {
          "k": "Credit Term",
          "v": "CASH"
        },
        {
          "k": "VAT No. (Client)",
          "v": "888329087642356"
        }
      ],
      "termsLines": [
        "1. Payment to be made by cash. The company is not responsible for any cash settlement without an official receipt."
      ],
      "bankLines": [
        "Beneficiary Name: KingFisher Logistic",
        "Bank : HDFC",
        "A/c No : XXXXXXXXXXX",
        "IBAN Code : ABA:XXXXXX",
        "Swift Code : XXXXXX",
        "Address : Dubai, United Arab Emirates"
      ],
      "osTableHeaders": [
        "Date",
        "Voucher No",
        "Narration",
        "Currency",
        "FCY Amount",
        "O/S FCY Amount",
        "Aging"
      ],
      "osTableRows": [
        [
          "16-MAY-23",
          "BOMINV230500371",
          "MBL NO... / HBL NO. 6676687 / JOB NO.CBOMEXP230764",
          "INR",
          "944.00",
          "944.00",
          "1"
        ]
      ],
      "agingHeaders": [
        "Currency",
        "Total O/S",
        "< 30",
        "30 - 60",
        "60 - 90",
        "90 - 120",
        "120 - 150",
        "150 - 180",
        "180+"
      ],
      "agingRow": [
        "INR",
        "944.00",
        "944.00",
        "",
        "",
        "",
        "",
        "",
        ""
      ],
      "tableHeaders": [
        "Charges",
        "Unit",
        "Qty",
        "Amount / Qty",
        "Currency",
        "Ex.Rate",
        "FCY Amount",
        "Amount (INR)"
      ],
      "tableRows": [
        [
          "FREIGHT CHARGE",
          "1 TON OR 1/2 MEASURE",
          "1",
          "1,500.00",
          "INR",
          "1.00000",
          "1,500.00",
          "1,500.00"
        ],
        [
          "LOCAL CHARGES",
          "—",
          "1",
          "800.00",
          "INR",
          "1.00000",
          "800.00",
          "800.00"
        ],
        [
          "SEA FREIGHT CHARGE",
          "1 TON OR 1/2 MEASURE",
          "1",
          "900.00",
          "INR",
          "1.00000",
          "900.00",
          "900.00"
        ],
        [
          "CONTAINER CLEANING FEE",
          "1 TON OR 1/2 MEASURE",
          "1",
          "1,000.00",
          "INR",
          "1.00000",
          "1,000.00",
          "1,000.00"
        ]
      ]
    },
    "blocks": [
      {
        "type": "companyHeader"
      },
      {
        "type": "officeAddressBand"
      },
      {
        "type": "docTitle",
        "text": "INVOICE",
        "align": "center"
      },
      {
        "type": "twoColumn",
        "showBillTo": true,
        "showCreditTerm": true
      },
      {
        "type": "chargeTable",
        "headerColor": "fill"
      },
      {
        "type": "totalsOnly"
      },
      {
        "type": "taxAmountBox"
      },
      {
        "type": "wordsAndTotal"
      },
      {
        "type": "termsBank"
      },
      {
        "type": "colorfulFooter"
      }
    ]
  },
  {
    "code": "INVOICE_REPORT_FORMAT_27",
    "formatNumber": 27,
    "name": "Invoice Report Format-27 Standard Invoice Tanzania",
    "paper": "A4",
    "rtl": false,
    "theme": {
      "primary": "#000000",
      "accent": "#0F4D96",
      "fill": "#F3F3F3",
      "panel": "#EBF0F4",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#9AD7FF",
      "ink": "#101010",
      "gray": "#656565",
      "white": "#FFFFFF"
    },
    "branding": {
      "company": "KingFisher Logistic",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "info@kingfisherwingsgroup.com",
      "logo": "kingfisher"
    },
    "demo": {
      "billToLabel": "Client",
      "billToName": "BOORTMALT ASIA PACIFIC PTY LTD",
      "billToAddress": "11, 28 FRESHWATER PLACE, MELBOURNE, VIC 3006, AUSTRALIA",
      "billToPhone": "4867239856",
      "invoiceNo": "TZSINV2310071",
      "invoiceDate": "03-MAY-23 (POSTED)",
      "currency": "TZS",
      "words": "Four thousand Four Hundred Fifty Only",
      "subtotal": "TZS 4,000.00",
      "tax": "450.00",
      "taxLabel": "VAT18",
      "total": "4,450.00 TZS",
      "totalLabel": "TOTAL VALUE INC.VAT",
      "metaRows": [
        {
          "k": "Invoice No.",
          "v": "TZSINV2310071"
        },
        {
          "k": "Date",
          "v": "03-MAY-23 (POSTED)"
        },
        {
          "k": "Narration",
          "v": "MBL NO... / HBL NO. TZSFE230400004 / JOB NO."
        }
      ],
      "tableHeaders": [
        "Charge Description",
        "Amount / Qty",
        "Qty",
        "Amount"
      ],
      "tableRows": [
        [
          "TAMIL FEE",
          "500.000",
          "1.000",
          "500.00"
        ],
        [
          "AIR FREIGHT CHARGE",
          "1,000.000",
          "1.000",
          "1,180.00"
        ],
        [
          "TAMIL FEE",
          "1,500.000",
          "1.000",
          "1,770.00"
        ],
        [
          "AIR FREIGHT GENERAL CHARGES",
          "1,000.000",
          "1.000",
          "1,000.00"
        ]
      ],
      "termsLines": [
        "Cheques should be crossed & made payable to KingFisher Logistic.",
        "Interest rate of 2% per month will be charged on overdue invoice.",
        "Please contact us within 7 days should there be any discrepancies.",
        "All business subject to SLA Standard terms and condition copy available on request."
      ],
      "bankLines": [
        "Beneficiary Name: KingFisher Logistic",
        "Account No : 311 810 500 2413",
        "Bank Name : AMANA BANK"
      ],
      "gstSummary": [
        {
          "k": "TOTAL VALUE EXC.VAT",
          "v": "TZS 4,000.00"
        },
        {
          "k": "VAT18",
          "v": "450.00"
        },
        {
          "k": "RECEIPT DATE & TIME",
          "v": "2023-05-03 10:45:01"
        },
        {
          "k": "RECEIPT VERIFICATION CODE",
          "v": "GM0X3Q3552"
        }
      ]
    },
    "blocks": [
      {
        "type": "companyHeader"
      },
      {
        "type": "docTitle",
        "text": "TAX INVOICE / RECEIPT",
        "align": "center"
      },
      {
        "type": "twoColumn",
        "showBillTo": true
      },
      {
        "type": "chargeTable",
        "headerColor": "fill"
      },
      {
        "type": "wordsAndTotal"
      },
      {
        "type": "singaporeGstSummary"
      },
      {
        "type": "termsBank"
      },
      {
        "type": "colorfulFooter"
      }
    ]
  },
  {
    "code": "INVOICE_REPORT_FORMAT_28",
    "formatNumber": 28,
    "name": "Invoice Report Format Singapore",
    "paper": "A4",
    "rtl": false,
    "theme": {
      "primary": "#000000",
      "accent": "#0F4D96",
      "fill": "#F3F3F3",
      "panel": "#EBF0F4",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#9AD7FF",
      "ink": "#101010",
      "gray": "#656565",
      "white": "#FFFFFF"
    },
    "branding": {
      "company": "KingFisher Logistic",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "info@kingfisherwingsgroup.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "BOMINV230500382",
      "invoiceDate": "17-MAY-23",
      "creditTerm": "COD",
      "billToName": "DEMO-SHIPPER ENGG COMPANY",
      "words": "Rupee Four Thousand Seven Hundred Seventy-Six Only",
      "total": "4,776.00",
      "totalLabel": "Total Invoice Value",
      "currency": "INR",
      "metaRows": [
        {
          "k": "Invoice No.",
          "v": "BOMINV230500382"
        },
        {
          "k": "Reference No.",
          "v": "—"
        },
        {
          "k": "Job No.",
          "v": "BOM/EXP/23/05/B/0709"
        },
        {
          "k": "Invoice Date",
          "v": "17-MAY-23"
        },
        {
          "k": "Terms",
          "v": "COD"
        },
        {
          "k": "Customer",
          "v": "—"
        }
      ],
      "fieldGrid": [
        {
          "k": "Containers",
          "v": "TTNU0712894"
        },
        {
          "k": "MBL No.",
          "v": "NSAJED85630124277"
        },
        {
          "k": "HBL No.",
          "v": "—"
        },
        {
          "k": "No of Containers",
          "v": "1 X 40' FLAT"
        },
        {
          "k": "Vsl / Voyage",
          "v": "CAP SAN JUAN / 310W"
        },
        {
          "k": "Inco Terms",
          "v": "FOB"
        },
        {
          "k": "Shipper",
          "v": "DEMO-SHIPPER ENGG COMPANY"
        },
        {
          "k": "Place of Receipt",
          "v": "INMAA-CHENNAI"
        },
        {
          "k": "Port of Loading",
          "v": "NHAVA SHEVA, INDIA"
        },
        {
          "k": "Port of Discharge",
          "v": "JEDDAH, SAUDI ARABIA"
        },
        {
          "k": "Place of Delivery",
          "v": "JEDDAH SAUDI ARABIA"
        }
      ],
      "tableHeaders": [
        "SL NO",
        "DESCRIPTION",
        "QTY",
        "UOM",
        "UNIT PRICE",
        "TOTAL AMOUNT (INR)"
      ],
      "tableRows": [
        [
          "1",
          "FREIGHT CHARGE",
          "1",
          "W2",
          "1,500.00",
          "1,500.00"
        ],
        [
          "2",
          "LOCAL CHARGES",
          "1",
          "—",
          "800.00",
          "800.00"
        ],
        [
          "3",
          "SEA FREIGHT CHARGE",
          "1",
          "W2",
          "900.00",
          "900.00"
        ],
        [
          "4",
          "CONTAINER CLEANING FEE",
          "1",
          "W2",
          "1,000.00",
          "1,000.00"
        ]
      ],
      "gstSummary": [
        {
          "k": "Total Amount Before Tax",
          "v": "4,200.00"
        },
        {
          "k": "Add: GST",
          "v": "576.00"
        }
      ],
      "termsLines": [
        "1. Kindly highlight any discrepancy upon received. otherwise this invoice shall be deemed to be correct.",
        "2. All business is transacted in accordance with the Standard Trading Conditions of Singapore Logistics Association (SLA).",
        "3. For payment by TT, 100% invoiced amount to be remitted into nominated Bank Account, free of banking charges."
      ],
      "bankLines": [
        "Beneficiary Name: KingFisher Logistic",
        "Bank : HDFC",
        "A/c No : XXXXXXXXXXX",
        "Swift Code : XXXXXX",
        "Address : Dubai, United Arab Emirates"
      ]
    },
    "blocks": [
      {
        "type": "companyHeader"
      },
      {
        "type": "singaporeHeader"
      },
      {
        "type": "fieldGrid",
        "cols": 2
      },
      {
        "type": "chargeTable",
        "headerColor": "fill"
      },
      {
        "type": "singaporeGstSummary"
      },
      {
        "type": "termsBank"
      },
      {
        "type": "colorfulFooter"
      }
    ]
  },
  {
    "code": "INVOICE_REPORT_FORMAT_29",
    "formatNumber": 29,
    "name": "Invoice Report Format Land Freight Transportation",
    "paper": "A4",
    "rtl": false,
    "theme": {
      "primary": "#000000",
      "accent": "#0F4D96",
      "fill": "#F3F3F3",
      "panel": "#EBF0F4",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#9AD7FF",
      "ink": "#101010",
      "gray": "#656565",
      "white": "#FFFFFF"
    },
    "branding": {
      "company": "KingFisher Logistic",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "info@kingfisherwingsgroup.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "BOMINV230500382",
      "invoiceDate": "17-MAY-23",
      "billToLabel": "BILL TO",
      "billToName": "DEMO LOGISTICS INDIA PVT LTD",
      "billToAddress": "21, PORT BLAIR, KRISHNA ST, MANNARGUDI, TAMIL NADU, INDIA, 676876",
      "billToPhone": "798798798",
      "fax": "9879878",
      "vatNo": "68768978898098",
      "billToGstin": "888329087642356",
      "currency": "INR",
      "words": "Rupee Four Thousand Seven Hundred Seventy-Six Only",
      "total": "4,776.00",
      "trnNo": "100617975600003",
      "docSubtitle": "VAT / TAX INVOICE — LAND FREIGHT / TRANSPORTATION",
      "referenceRows": [
        {
          "k": "Invoice Number",
          "v": "BOMINV230500382"
        },
        {
          "k": "Invoice Date",
          "v": "17-MAY-23"
        },
        {
          "k": "Agreed Terms/Days",
          "v": "CASH / 0"
        },
        {
          "k": "Customer Ref.",
          "v": "—"
        }
      ],
      "tableHeaders": [
        "Load Date",
        "Delivery Date",
        "Origin",
        "Destination",
        "Truck# / Charge",
        "Unit Type",
        "VAT %",
        "Unit Rate",
        "TAX Amount",
        "Total Charges"
      ],
      "tableRows": [
        [
          "01-MAR-23",
          "20-MAR-23",
          "INNSA",
          "SAJED",
          "FREIGHT CHARGE",
          "1 TON OR 1/2 MEASURE",
          "18 %",
          "1,500.00",
          "",
          "1,500.00"
        ],
        [
          "01-MAR-23",
          "20-MAR-23",
          "INNSA",
          "SAJED",
          "LOCAL CHARGES",
          "—",
          "18 %",
          "800.00",
          "",
          "800.00"
        ],
        [
          "01-MAR-23",
          "20-MAR-23",
          "INNSA",
          "SAJED",
          "SEA FREIGHT CHARGE",
          "1 TON OR 1/2 MEASURE",
          "18 %",
          "900.00",
          "",
          "900.00"
        ],
        [
          "01-MAR-23",
          "20-MAR-23",
          "INNSA",
          "SAJED",
          "CONTAINER CLEANING FEE",
          "1 TON OR 1/2 MEASURE",
          "15 %",
          "1,000.00",
          "",
          "1,000.00"
        ]
      ],
      "subtotalParts": [
        "4,200.00",
        "0.00",
        "4,200.00"
      ],
      "termsLines": [
        "1. Payment to be made by cash. The company is not responsible for any cash settlement without an official receipt."
      ],
      "bankLines": [
        "Beneficiary Name: KingFisher Logistic",
        "Bank : HDFC",
        "A/c No : XXXXXXXXXXX",
        "IBAN Code : ABA:XXXXXX",
        "Swift Code : XXXXXX",
        "Address : Dubai, United Arab Emirates"
      ]
    },
    "blocks": [
      {
        "type": "companyHeader"
      },
      {
        "type": "landFreightHeader",
        "title": "VAT / TAX INVOICE — LAND FREIGHT / TRANSPORTATION"
      },
      {
        "type": "twoColumn",
        "showBillTo": true
      },
      {
        "type": "docTitle",
        "text": "DETAILS OF CHARGES / SHIPMENTS",
        "align": "start"
      },
      {
        "type": "chargeTable",
        "headerColor": "fill"
      },
      {
        "type": "subtotalBar",
        "variant": "tax"
      },
      {
        "type": "wordsAndTotal"
      },
      {
        "type": "termsBank"
      },
      {
        "type": "stampSignature"
      },
      {
        "type": "colorfulFooter"
      }
    ]
  },
  {
    "code": "INVOICE_REPORT_FORMAT_30",
    "formatNumber": 30,
    "name": "Invoice Report Format Overseas Debit Note Format-2",
    "paper": "A4",
    "rtl": false,
    "theme": {
      "primary": "#000000",
      "accent": "#0F4D96",
      "fill": "#F3F3F3",
      "panel": "#EBF0F4",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#9AD7FF",
      "ink": "#101010",
      "gray": "#656565",
      "white": "#FFFFFF"
    },
    "branding": {
      "company": "KingFisher Logistic",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "info@kingfisherwingsgroup.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "BOMINV230500382",
      "invoiceDate": "17-MAY-23 (POSTED)",
      "billToLabel": "Client",
      "billToName": "DEMO LOGISTICS INDIA PVT LTD",
      "billToAddress": "21, PORT BLAIR KRISHNA ST MANNARGUDI, TAMIL NADU INDIA 676876",
      "billToPhone": "798798798",
      "billToGstin": "888329087642356",
      "currency": "INR",
      "words": "Rupee Four Thousand Seven Hundred Seventy-Six Only",
      "total": "4,776.00",
      "totalLabel": "Total : INR",
      "containerNote": "TTNU0712894,",
      "metaRows": [
        {
          "k": "Invoice No.",
          "v": "BOMINV230500382"
        },
        {
          "k": "Date",
          "v": "17-MAY-23 (POSTED)"
        },
        {
          "k": "Job No.",
          "v": "—"
        },
        {
          "k": "Shipment No.",
          "v": "BOM/EXP/23/05/B/0709 / 16-MAY-23"
        }
      ],
      "fieldGrid": [
        {
          "k": "Place of Receipt",
          "v": "INMAA-CHENNAI"
        },
        {
          "k": "Consignee",
          "v": "DEMO STEEL FACTORY CO. LTD. JEDDAH SAUDI ARABIA"
        },
        {
          "k": "Place of Delivery",
          "v": "JEDDAH SAUDI ARABIA"
        },
        {
          "k": "MAWB/MBL No.",
          "v": "—"
        },
        {
          "k": "Vsl / Voyage",
          "v": "CAP SAN JUAN / 310W"
        },
        {
          "k": "ETD",
          "v": "01-MAR-23"
        },
        {
          "k": "ETA",
          "v": "20-MAR-23"
        },
        {
          "k": "Reference No.",
          "v": "—"
        },
        {
          "k": "Currency",
          "v": "INR 1.000000"
        },
        {
          "k": "HAWB/HBL No.",
          "v": "NSAJED85630124277"
        },
        {
          "k": "Total No. of Pcs / G.Weight / V.Weight",
          "v": "3.00 / 22,700.00 / 22,700.00"
        },
        {
          "k": "Department",
          "v": "FCL EXPORT"
        },
        {
          "k": "Port of Loading",
          "v": "NHAVA SHEVA, INDIA"
        },
        {
          "k": "Shipper",
          "v": "DEMO-SHIPPER ENGG COMPANY"
        },
        {
          "k": "Port of Discharge",
          "v": "JEDDAH, SAUDI ARABIA"
        },
        {
          "k": "Narration",
          "v": "MBL NO... / HBL NO. NSAJED85630124277 / JOB NO."
        }
      ],
      "tableHeaders": [
        "Charge",
        "Qty",
        "Amount / Qty",
        "Amount (INR)"
      ],
      "tableRows": [
        [
          "FREIGHT CHARGE",
          "1.000",
          "1,500.00",
          "1,500.00"
        ],
        [
          "LOCAL CHARGES",
          "1.000",
          "800.00",
          "800.00"
        ],
        [
          "SEA FREIGHT CHARGE",
          "1.000",
          "900.00",
          "900.00"
        ],
        [
          "CONTAINER CLEANING FEE",
          "1.000",
          "1,000.00",
          "1,000.00"
        ]
      ],
      "termsLines": [
        "1. Payment to be made by cash. The company is not responsible for any cash settlement without an official receipt."
      ],
      "bankLines": [
        "Beneficiary Name: KingFisher Logistic",
        "Bank : HDFC",
        "A/c No : XXXXXXXXXXX",
        "IBAN Code : ABA:XXXXXX",
        "Swift Code : XXXXXX",
        "Address : Dubai, United Arab Emirates"
      ]
    },
    "blocks": [
      {
        "type": "companyHeader"
      },
      {
        "type": "docTitle",
        "text": "EXPORT INVOICE",
        "align": "center"
      },
      {
        "type": "exportBondBanner"
      },
      {
        "type": "twoColumn",
        "showBillTo": true
      },
      {
        "type": "fieldGrid",
        "cols": 2
      },
      {
        "type": "chargeTable",
        "headerColor": "fill"
      },
      {
        "type": "wordsAndTotal"
      },
      {
        "type": "containerNote"
      },
      {
        "type": "termsBank"
      },
      {
        "type": "colorfulFooter"
      }
    ]
  },
  {
    "code": "INVOICE_REPORT_FORMAT_34",
    "formatNumber": 34,
    "name": "Invoice Report Format-34 Standard Invoice Arabic",
    "paper": "A4",
    "rtl": true,
    "theme": {
      "primary": "#000000",
      "accent": "#0F4D96",
      "fill": "#F3F3F3",
      "panel": "#EBF0F4",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#9AD7FF",
      "ink": "#101010",
      "gray": "#656565",
      "white": "#FFFFFF"
    },
    "branding": {
      "company": "KingFisher Logistic",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "info@kingfisherwingsgroup.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "BOMINV230500382",
      "invoiceDate": "17-MAY-23",
      "dueDate": "24-MAY-23",
      "billToLabel": "Customer",
      "billToName": "DEMO LOGISTICS INDIA PVT LTD",
      "billToAddress": "21, PORT BLAIR, KRISHNA ST, MANNARGUDI, TAMIL NADU, INDIA, 676876",
      "billToPhone": "798798798",
      "fax": "9879878",
      "vatNo": "68768978898098",
      "billToGstin": "888329087642356",
      "creditTerm": "CASH",
      "currency": "INR",
      "words": "Rupee Four Thousand Two Hundred Only",
      "subtotal": "4,200.00",
      "tax": "576.00",
      "total": "4,200.00",
      "narration": "MBL NO... / HBL NO. NSAJED85630124277 / JOB NO.",
      "officeAddressLines": [
        "MUMBAI",
        "406, 4TH FLOOR, D-21 CORPORATE PARK, SECTOR 21,, MUMBAI, Pincode : 400001"
      ],
      "taxAmountLines": [
        "GST18",
        "GST 15%"
      ],
      "metaRows": [
        {
          "k": "Customer VAT No.",
          "v": "68768978898098"
        },
        {
          "k": "Invoice No.",
          "v": "BOMINV230500382"
        },
        {
          "k": "Invoice Date",
          "v": "17-MAY-23 (POSTED)"
        },
        {
          "k": "Payment Due Date",
          "v": "17-MAY-23"
        },
        {
          "k": "Job Number",
          "v": "—"
        }
      ],
      "termsLines": [
        "1. Payment to be made by cash. The company is not responsible for any cash settlement without an official receipt."
      ],
      "bankLines": [
        "Beneficiary Name: KingFisher Logistic",
        "Bank : HDFC",
        "A/c No : XXXXXXXXXXX",
        "IBAN Code : ABA:XXXXXX",
        "Swift Code : XXXXXX",
        "Address : Dubai, United Arab Emirates"
      ],
      "osTableHeaders": [
        "Date",
        "Voucher No",
        "Narration",
        "Currency",
        "FCY Amount",
        "O/S FCY Amount",
        "Aging"
      ],
      "osTableRows": [
        [
          "16-MAY-23",
          "BOMINV230500371",
          "MBL NO... / HBL NO. 6676687 / JOB NO.CBOMEXP230764",
          "INR",
          "944.00",
          "944.00",
          "1"
        ]
      ],
      "agingHeaders": [
        "Currency",
        "Total O/S",
        "< 30",
        "30 - 60",
        "60 - 90",
        "90 - 120",
        "120 - 150",
        "150 - 180",
        "180+"
      ],
      "agingRow": [
        "INR",
        "944.00",
        "944.00",
        "",
        "",
        "",
        "",
        "",
        ""
      ],
      "docSubtitle": "TAX INVOICE  فاتورة ضريبية",
      "fieldGrid": [
        {
          "k": "Shipper",
          "v": "DEMO-SHIPPER ENGG COMPANY"
        },
        {
          "k": "Consignee",
          "v": "DEMO STEEL FACTORY CO. LTD."
        },
        {
          "k": "Place of Origin",
          "v": "NHAVA SHEVA, INDIA"
        },
        {
          "k": "Final destination",
          "v": "JEDDAH, SAUDI ARABIA"
        },
        {
          "k": "House No.",
          "v": "NSAJED85630124277"
        },
        {
          "k": "Number of Packs",
          "v": "3.00"
        },
        {
          "k": "Weight in Kgs",
          "v": "22,700.000"
        },
        {
          "k": "ETD",
          "v": "01-MAR-23"
        },
        {
          "k": "ETA",
          "v": "20-MAR-23"
        },
        {
          "k": "Narration",
          "v": "MBL NO... / HBL NO. NSAJED85630124277 / JOB NO."
        }
      ],
      "tableHeaders": [
        "Charge Description",
        "Curr",
        "Rate Per Unit",
        "Unit",
        "Curr. Amount",
        "ROE",
        "Total Price excl. VAT",
        "VAT%",
        "VAT Amount",
        "Total"
      ],
      "tableRows": [
        [
          "FREIGHT CHARGE",
          "INR",
          "1,500.00",
          "1",
          "1,500.00",
          "1.00000",
          "1,500.00",
          "18",
          "",
          "1,500.00"
        ],
        [
          "LOCAL CHARGES",
          "INR",
          "800.00",
          "1",
          "800.00",
          "1.00000",
          "800.00",
          "18",
          "",
          "800.00"
        ],
        [
          "SEA FREIGHT CHARGE",
          "INR",
          "900.00",
          "1",
          "900.00",
          "1.00000",
          "900.00",
          "18",
          "",
          "900.00"
        ],
        [
          "CONTAINER CLEANING FEE",
          "INR",
          "1,000.00",
          "1",
          "1,000.00",
          "1.00000",
          "1,000.00",
          "15",
          "",
          "1,000.00"
        ]
      ],
      "containerNote": "TTNU0712894 · 1 × 40' FLAT",
      "totalLabel": "Total in : INR"
    },
    "blocks": [
      {
        "type": "companyHeader"
      },
      {
        "type": "arabicHeader"
      },
      {
        "type": "docTitle",
        "text": "TAX INVOICE  فاتورة ضريبية",
        "align": "center"
      },
      {
        "type": "twoColumn",
        "showBillTo": true
      },
      {
        "type": "fieldGrid",
        "cols": 2
      },
      {
        "type": "chargeTable",
        "headerColor": "fill"
      },
      {
        "type": "wordsAndTotal"
      },
      {
        "type": "containerNote"
      },
      {
        "type": "termsBank"
      },
      {
        "type": "colorfulFooter"
      }
    ]
  },
  {
    "code": "INVOICE_REPORT_FORMAT_35",
    "formatNumber": 35,
    "name": "Invoice Report Format-35 Standard Invoice Arabic Format-1",
    "paper": "A4",
    "rtl": true,
    "theme": {
      "primary": "#000000",
      "accent": "#0F4D96",
      "fill": "#F3F3F3",
      "panel": "#EBF0F4",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#9AD7FF",
      "ink": "#101010",
      "gray": "#656565",
      "white": "#FFFFFF"
    },
    "branding": {
      "company": "KingFisher Logistic",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "info@kingfisherwingsgroup.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "BOMINV230500382",
      "invoiceDate": "17-MAY-23",
      "dueDate": "24-MAY-23",
      "billToLabel": "فاتورة إلى / Bill To",
      "billToName": "DEMO LOGISTICS INDIA PVT LTD",
      "billToAddress": "21, PORT BLAIR, KRISHNA ST, MANNARGUDI, TAMIL NADU, INDIA, 676876",
      "billToPhone": "798798798",
      "fax": "9879878",
      "vatNo": "68768978898098",
      "billToGstin": "888329087642356",
      "creditTerm": "CASH",
      "currency": "INR",
      "words": "Rupee Four Thousand Two Hundred Only",
      "subtotal": "4,200.00",
      "tax": "576.00",
      "total": "4,200.00",
      "narration": "MBL NO... / HBL NO. NSAJED85630124277 / JOB NO.",
      "officeAddressLines": [
        "MUMBAI",
        "406, 4TH FLOOR, D-21 CORPORATE PARK, SECTOR 21,, MUMBAI, Pincode : 400001"
      ],
      "taxAmountLines": [
        "GST18",
        "GST 15%"
      ],
      "metaRows": [
        {
          "k": "رقم الفاتورة / Invoice No.",
          "v": "BOMINV230500382"
        },
        {
          "k": "تاريخ / Date",
          "v": "17-MAY-23 (POSTED)"
        },
        {
          "k": "الرقم الضريبي / VAT",
          "v": "68768978898098"
        },
        {
          "k": "رقم بوليصة / BL",
          "v": "NSAJED85630124277"
        }
      ],
      "termsLines": [
        "1. Payment to be made by cash. The company is not responsible for any cash settlement without an official receipt."
      ],
      "bankLines": [
        "Beneficiary Name: KingFisher Logistic",
        "Bank : HDFC",
        "A/c No : XXXXXXXXXXX",
        "IBAN Code : ABA:XXXXXX",
        "Swift Code : XXXXXX",
        "Address : Dubai, United Arab Emirates"
      ],
      "osTableHeaders": [
        "Date",
        "Voucher No",
        "Narration",
        "Currency",
        "FCY Amount",
        "O/S FCY Amount",
        "Aging"
      ],
      "osTableRows": [
        [
          "16-MAY-23",
          "BOMINV230500371",
          "MBL NO... / HBL NO. 6676687 / JOB NO.CBOMEXP230764",
          "INR",
          "944.00",
          "944.00",
          "1"
        ]
      ],
      "agingHeaders": [
        "Currency",
        "Total O/S",
        "< 30",
        "30 - 60",
        "60 - 90",
        "90 - 120",
        "120 - 150",
        "150 - 180",
        "180+"
      ],
      "agingRow": [
        "INR",
        "944.00",
        "944.00",
        "",
        "",
        "",
        "",
        "",
        ""
      ],
      "docSubtitle": "Arabic Format-1",
      "fieldGrid": [
        {
          "k": "مكان التحميل / Place of Loading",
          "v": "INMAA-CHENNAI"
        },
        {
          "k": "موعد المغادرة / ETD",
          "v": "01-MAR-23"
        },
        {
          "k": "مكان التوصيل / Place of Delivery",
          "v": "JEDDAH SAUDI ARABIA"
        },
        {
          "k": "موعد الوصول / ETA",
          "v": "20-MAR-23"
        },
        {
          "k": "الشاحن / Shipper",
          "v": "DEMO-SHIPPER ENGG COMPANY"
        },
        {
          "k": "المرسل إليه / Consignee",
          "v": "DEMO STEEL FACTORY CO. LTD."
        }
      ],
      "tableHeaders": [
        "Charges Details",
        "QTY",
        "Unit",
        "Curr",
        "Unit Price",
        "Exch. Rate",
        "Amount",
        "VAT %",
        "VAT",
        "Total Amt"
      ],
      "tableRows": [
        [
          "FREIGHT CHARGE",
          "1",
          "1 TON OR 1/2 MEASURE",
          "INR",
          "1,500.00",
          "1.00000",
          "1,500.00",
          "18",
          "",
          "1,500.00"
        ],
        [
          "LOCAL CHARGES",
          "1",
          "—",
          "INR",
          "800.00",
          "1.00000",
          "800.00",
          "18",
          "",
          "800.00"
        ],
        [
          "SEA FREIGHT CHARGE",
          "1",
          "1 TON OR 1/2 MEASURE",
          "INR",
          "900.00",
          "1.00000",
          "900.00",
          "18",
          "",
          "900.00"
        ],
        [
          "CONTAINER CLEANING FEE",
          "1",
          "1 TON OR 1/2 MEASURE",
          "INR",
          "1,000.00",
          "1.00000",
          "1,000.00",
          "15",
          "",
          "1,000.00"
        ]
      ],
      "containerHeaders": [
        "Container",
        "Type",
        "Description"
      ],
      "containerRow": [
        "TTNU0712894",
        "40' FLAT",
        "GENERAL CARGO"
      ],
      "totalLabel": "INR"
    },
    "blocks": [
      {
        "type": "companyHeader"
      },
      {
        "type": "arabicHeader"
      },
      {
        "type": "docTitle",
        "text": "فاتورة ضريبية",
        "align": "center"
      },
      {
        "type": "twoColumn",
        "showBillTo": true
      },
      {
        "type": "fieldGrid",
        "cols": 2
      },
      {
        "type": "chargeTable",
        "headerColor": "fill"
      },
      {
        "type": "wordsAndTotal"
      },
      {
        "type": "containerNote"
      },
      {
        "type": "termsBank"
      },
      {
        "type": "colorfulFooter"
      }
    ]
  },
  {
    "code": "INVOICE_REPORT_FORMAT_36",
    "formatNumber": 36,
    "name": "Invoice Report Format-36 Standard Invoice Arabic Format-1 Alt",
    "paper": "A4",
    "rtl": true,
    "theme": {
      "primary": "#000000",
      "accent": "#0F4D96",
      "fill": "#F3F3F3",
      "panel": "#EBF0F4",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#9AD7FF",
      "ink": "#101010",
      "gray": "#656565",
      "white": "#FFFFFF"
    },
    "branding": {
      "company": "KingFisher Logistic",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "info@kingfisherwingsgroup.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "BOMINV230500382",
      "invoiceDate": "17-MAY-23",
      "dueDate": "24-MAY-23",
      "billToLabel": "فاتورة إلى / Bill To",
      "billToName": "DEMO LOGISTICS INDIA PVT LTD",
      "billToAddress": "21, PORT BLAIR, KRISHNA ST, MANNARGUDI, TAMIL NADU, INDIA, 676876",
      "billToPhone": "798798798",
      "fax": "9879878",
      "vatNo": "68768978898098",
      "billToGstin": "888329087642356",
      "creditTerm": "CASH",
      "currency": "INR",
      "words": "Rupee Four Thousand Two Hundred Only",
      "subtotal": "4,200.00",
      "tax": "576.00",
      "total": "4,200.00",
      "narration": "MBL NO... / HBL NO. NSAJED85630124277 / JOB NO.",
      "officeAddressLines": [
        "MUMBAI",
        "406, 4TH FLOOR, D-21 CORPORATE PARK, SECTOR 21,, MUMBAI, Pincode : 400001"
      ],
      "taxAmountLines": [
        "GST18",
        "GST 15%"
      ],
      "metaRows": [
        {
          "k": "رقم الفاتورة / Invoice No.",
          "v": "BOMINV230500382"
        },
        {
          "k": "تاريخ / Date",
          "v": "17-MAY-23 (POSTED)"
        },
        {
          "k": "الرقم الضريبي / VAT",
          "v": "68768978898098"
        },
        {
          "k": "رقم بوليصة / BL",
          "v": "NSAJED85630124277"
        }
      ],
      "termsLines": [
        "1. Payment to be made by cash. The company is not responsible for any cash settlement without an official receipt."
      ],
      "bankLines": [
        "Beneficiary Name: KingFisher Logistic",
        "Bank : HDFC",
        "A/c No : XXXXXXXXXXX",
        "IBAN Code : ABA:XXXXXX",
        "Swift Code : XXXXXX",
        "Address : Dubai, United Arab Emirates"
      ],
      "osTableHeaders": [
        "Date",
        "Voucher No",
        "Narration",
        "Currency",
        "FCY Amount",
        "O/S FCY Amount",
        "Aging"
      ],
      "osTableRows": [
        [
          "16-MAY-23",
          "BOMINV230500371",
          "MBL NO... / HBL NO. 6676687 / JOB NO.CBOMEXP230764",
          "INR",
          "944.00",
          "944.00",
          "1"
        ]
      ],
      "agingHeaders": [
        "Currency",
        "Total O/S",
        "< 30",
        "30 - 60",
        "60 - 90",
        "90 - 120",
        "120 - 150",
        "150 - 180",
        "180+"
      ],
      "agingRow": [
        "INR",
        "944.00",
        "944.00",
        "",
        "",
        "",
        "",
        "",
        ""
      ],
      "docSubtitle": "Arabic Format-1 Alt",
      "fieldGrid": [
        {
          "k": "مكان التحميل / Place of Loading",
          "v": "INMAA-CHENNAI"
        },
        {
          "k": "موعد المغادرة / ETD",
          "v": "01-MAR-23"
        },
        {
          "k": "مكان التوصيل / Place of Delivery",
          "v": "JEDDAH SAUDI ARABIA"
        },
        {
          "k": "موعد الوصول / ETA",
          "v": "20-MAR-23"
        },
        {
          "k": "الشاحن / Shipper",
          "v": "DEMO-SHIPPER ENGG COMPANY"
        },
        {
          "k": "المرسل إليه / Consignee",
          "v": "DEMO STEEL FACTORY CO. LTD."
        }
      ],
      "tableHeaders": [
        "Charges Details",
        "QTY",
        "Unit",
        "Curr",
        "Unit Price",
        "Exch. Rate",
        "Amount",
        "VAT %",
        "VAT",
        "Total Amt"
      ],
      "tableRows": [
        [
          "FREIGHT CHARGE",
          "1",
          "1 TON OR 1/2 MEASURE",
          "INR",
          "1,500.00",
          "1.00000",
          "1,500.00",
          "18",
          "",
          "1,500.00"
        ],
        [
          "LOCAL CHARGES",
          "1",
          "—",
          "INR",
          "800.00",
          "1.00000",
          "800.00",
          "18",
          "",
          "800.00"
        ],
        [
          "SEA FREIGHT CHARGE",
          "1",
          "1 TON OR 1/2 MEASURE",
          "INR",
          "900.00",
          "1.00000",
          "900.00",
          "18",
          "",
          "900.00"
        ],
        [
          "CONTAINER CLEANING FEE",
          "1",
          "1 TON OR 1/2 MEASURE",
          "INR",
          "1,000.00",
          "1.00000",
          "1,000.00",
          "15",
          "",
          "1,000.00"
        ]
      ],
      "containerHeaders": [
        "Container",
        "Type",
        "Description"
      ],
      "containerRow": [
        "TTNU0712894",
        "40' FLAT",
        "GENERAL CARGO"
      ],
      "totalLabel": "INR"
    },
    "blocks": [
      {
        "type": "companyHeader"
      },
      {
        "type": "arabicHeader"
      },
      {
        "type": "docTitle",
        "text": "فاتورة ضريبية",
        "align": "center"
      },
      {
        "type": "twoColumn",
        "showBillTo": true
      },
      {
        "type": "fieldGrid",
        "cols": 2
      },
      {
        "type": "chargeTable",
        "headerColor": "fill"
      },
      {
        "type": "wordsAndTotal"
      },
      {
        "type": "containerNote"
      },
      {
        "type": "termsBank"
      },
      {
        "type": "colorfulFooter"
      }
    ]
  },
  {
    "code": "INVOICE_REPORT_FORMAT_37",
    "formatNumber": 37,
    "name": "Invoice Report Format-37 Standard Invoice Arabic Oman",
    "paper": "A4",
    "rtl": true,
    "theme": {
      "primary": "#000000",
      "accent": "#0F4D96",
      "fill": "#F3F3F3",
      "panel": "#EBF0F4",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#9AD7FF",
      "ink": "#101010",
      "gray": "#656565",
      "white": "#FFFFFF"
    },
    "branding": {
      "company": "KingFisher Logistic",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "info@kingfisherwingsgroup.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "BOMINV230500382",
      "invoiceDate": "17-MAY-23",
      "dueDate": "24-MAY-23",
      "billToLabel": "Customer",
      "billToName": "DEMO LOGISTICS INDIA PVT LTD",
      "billToAddress": "21, PORT BLAIR, KRISHNA ST, MANNARGUDI, TAMIL NADU, INDIA, 676876",
      "billToPhone": "798798798",
      "fax": "9879878",
      "vatNo": "68768978898098",
      "billToGstin": "888329087642356",
      "creditTerm": "CASH",
      "currency": "INR",
      "words": "Rupee Four Thousand Two Hundred Only",
      "subtotal": "4,200.00",
      "tax": "576.00",
      "total": "4,200.00",
      "narration": "MBL NO... / HBL NO. NSAJED85630124277 / JOB NO.",
      "officeAddressLines": [
        "MUMBAI",
        "406, 4TH FLOOR, D-21 CORPORATE PARK, SECTOR 21,, MUMBAI, Pincode : 400001"
      ],
      "taxAmountLines": [
        "GST18",
        "GST 15%"
      ],
      "metaRows": [
        {
          "k": "Customer VAT No.",
          "v": "68768978898098"
        },
        {
          "k": "Invoice No.",
          "v": "BOMINV230500382"
        },
        {
          "k": "Invoice Date",
          "v": "17-MAY-23 (POSTED)"
        },
        {
          "k": "Payment Due Date",
          "v": "17-MAY-23"
        },
        {
          "k": "Region",
          "v": "OMAN"
        }
      ],
      "termsLines": [
        "1. Payment to be made by cash. The company is not responsible for any cash settlement without an official receipt."
      ],
      "bankLines": [
        "Beneficiary Name: KingFisher Logistic",
        "Bank : HDFC",
        "A/c No : XXXXXXXXXXX",
        "IBAN Code : ABA:XXXXXX",
        "Swift Code : XXXXXX",
        "Address : Dubai, United Arab Emirates"
      ],
      "osTableHeaders": [
        "Date",
        "Voucher No",
        "Narration",
        "Currency",
        "FCY Amount",
        "O/S FCY Amount",
        "Aging"
      ],
      "osTableRows": [
        [
          "16-MAY-23",
          "BOMINV230500371",
          "MBL NO... / HBL NO. 6676687 / JOB NO.CBOMEXP230764",
          "INR",
          "944.00",
          "944.00",
          "1"
        ]
      ],
      "agingHeaders": [
        "Currency",
        "Total O/S",
        "< 30",
        "30 - 60",
        "60 - 90",
        "90 - 120",
        "120 - 150",
        "150 - 180",
        "180+"
      ],
      "agingRow": [
        "INR",
        "944.00",
        "944.00",
        "",
        "",
        "",
        "",
        "",
        ""
      ],
      "docSubtitle": "OMAN",
      "fieldGrid": [
        {
          "k": "Shipper",
          "v": "DEMO-SHIPPER ENGG COMPANY"
        },
        {
          "k": "Consignee",
          "v": "DEMO STEEL FACTORY CO. LTD."
        },
        {
          "k": "Place of Origin",
          "v": "NHAVA SHEVA, INDIA"
        },
        {
          "k": "Final destination",
          "v": "JEDDAH, SAUDI ARABIA"
        },
        {
          "k": "House No.",
          "v": "NSAJED85630124277"
        },
        {
          "k": "Number of Packs",
          "v": "3.00"
        },
        {
          "k": "Weight in Kgs",
          "v": "22,700.000"
        },
        {
          "k": "ETD",
          "v": "01-MAR-23"
        },
        {
          "k": "ETA",
          "v": "20-MAR-23"
        },
        {
          "k": "Narration",
          "v": "MBL NO... / HBL NO. NSAJED85630124277 / JOB NO."
        }
      ],
      "tableHeaders": [
        "Charge Description",
        "Curr",
        "Rate Per Unit",
        "Unit",
        "Curr. Amount",
        "ROE",
        "Total Price excl. VAT",
        "VAT%",
        "VAT Amount",
        "Total"
      ],
      "tableRows": [
        [
          "FREIGHT CHARGE",
          "INR",
          "1,500.00",
          "1",
          "1,500.00",
          "1.00000",
          "1,500.00",
          "18",
          "",
          "1,500.00"
        ],
        [
          "LOCAL CHARGES",
          "INR",
          "800.00",
          "1",
          "800.00",
          "1.00000",
          "800.00",
          "18",
          "",
          "800.00"
        ],
        [
          "SEA FREIGHT CHARGE",
          "INR",
          "900.00",
          "1",
          "900.00",
          "1.00000",
          "900.00",
          "18",
          "",
          "900.00"
        ],
        [
          "CONTAINER CLEANING FEE",
          "INR",
          "1,000.00",
          "1",
          "1,000.00",
          "1.00000",
          "1,000.00",
          "15",
          "",
          "1,000.00"
        ]
      ],
      "containerNote": "TTNU0712894 · 1 × 40' FLAT",
      "totalLabel": "Total in : INR"
    },
    "blocks": [
      {
        "type": "companyHeader"
      },
      {
        "type": "arabicHeader"
      },
      {
        "type": "docTitle",
        "text": "TAX INVOICE OMAN  فاتورة",
        "align": "center"
      },
      {
        "type": "twoColumn",
        "showBillTo": true
      },
      {
        "type": "fieldGrid",
        "cols": 2
      },
      {
        "type": "chargeTable",
        "headerColor": "fill"
      },
      {
        "type": "wordsAndTotal"
      },
      {
        "type": "containerNote"
      },
      {
        "type": "termsBank"
      },
      {
        "type": "colorfulFooter"
      }
    ]
  },
  {
    "code": "INVOICE_REPORT_FORMAT_38",
    "formatNumber": 38,
    "name": "Invoice Report Format-38 Standard Invoice Arabic Format-2",
    "paper": "A4",
    "rtl": true,
    "theme": {
      "primary": "#000000",
      "accent": "#0F4D96",
      "fill": "#F3F3F3",
      "panel": "#EBF0F4",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#9AD7FF",
      "ink": "#101010",
      "gray": "#656565",
      "white": "#FFFFFF"
    },
    "branding": {
      "company": "KingFisher Logistic",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "info@kingfisherwingsgroup.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "BOMINV230500382",
      "invoiceDate": "17-MAY-23",
      "dueDate": "24-MAY-23",
      "billToLabel": "Customer",
      "billToName": "DEMO LOGISTICS INDIA PVT LTD",
      "billToAddress": "21, PORT BLAIR, KRISHNA ST, MANNARGUDI, TAMIL NADU, INDIA, 676876",
      "billToPhone": "798798798",
      "fax": "9879878",
      "vatNo": "68768978898098",
      "billToGstin": "888329087642356",
      "creditTerm": "CASH",
      "currency": "INR",
      "words": "Rupee Four Thousand Two Hundred Only",
      "subtotal": "4,200.00",
      "tax": "576.00",
      "total": "4,200.00",
      "narration": "MBL NO... / HBL NO. NSAJED85630124277 / JOB NO.",
      "officeAddressLines": [
        "MUMBAI",
        "406, 4TH FLOOR, D-21 CORPORATE PARK, SECTOR 21,, MUMBAI, Pincode : 400001"
      ],
      "taxAmountLines": [
        "GST18",
        "GST 15%"
      ],
      "metaRows": [
        {
          "k": "Customer VAT No.",
          "v": "68768978898098"
        },
        {
          "k": "Invoice No.",
          "v": "BOMINV230500382"
        },
        {
          "k": "Invoice Date",
          "v": "17-MAY-23 (POSTED)"
        },
        {
          "k": "Payment Due Date",
          "v": "17-MAY-23"
        },
        {
          "k": "Master Number",
          "v": "NSAJED85630124277"
        },
        {
          "k": "Notify Name",
          "v": "ENGLISH"
        }
      ],
      "termsLines": [
        "1. Payment to be made by cash. The company is not responsible for any cash settlement without an official receipt."
      ],
      "bankLines": [
        "Beneficiary Name: KingFisher Logistic",
        "Bank : HDFC",
        "A/c No : XXXXXXXXXXX",
        "IBAN Code : ABA:XXXXXX",
        "Swift Code : XXXXXX",
        "Address : Dubai, United Arab Emirates"
      ],
      "osTableHeaders": [
        "Date",
        "Voucher No",
        "Narration",
        "Currency",
        "FCY Amount",
        "O/S FCY Amount",
        "Aging"
      ],
      "osTableRows": [
        [
          "16-MAY-23",
          "BOMINV230500371",
          "MBL NO... / HBL NO. 6676687 / JOB NO.CBOMEXP230764",
          "INR",
          "944.00",
          "944.00",
          "1"
        ]
      ],
      "agingHeaders": [
        "Currency",
        "Total O/S",
        "< 30",
        "30 - 60",
        "60 - 90",
        "90 - 120",
        "120 - 150",
        "150 - 180",
        "180+"
      ],
      "agingRow": [
        "INR",
        "944.00",
        "944.00",
        "",
        "",
        "",
        "",
        "",
        ""
      ],
      "docSubtitle": "TAX INVOICE  فاتورة ضريبية",
      "fieldGrid": [
        {
          "k": "Shipper",
          "v": "DEMO-SHIPPER ENGG COMPANY"
        },
        {
          "k": "Consignee",
          "v": "DEMO STEEL FACTORY CO. LTD."
        },
        {
          "k": "Place of Origin",
          "v": "NHAVA SHEVA, INDIA"
        },
        {
          "k": "Final destination",
          "v": "JEDDAH, SAUDI ARABIA"
        },
        {
          "k": "House No.",
          "v": "NSAJED85630124277"
        },
        {
          "k": "Number of Packs",
          "v": "3.00"
        },
        {
          "k": "Weight in Kgs",
          "v": "22,700.000"
        },
        {
          "k": "ETD",
          "v": "01-MAR-23"
        },
        {
          "k": "ETA",
          "v": "20-MAR-23"
        },
        {
          "k": "Narration",
          "v": "MBL NO... / HBL NO. NSAJED85630124277 / JOB NO."
        },
        {
          "k": "Volume in CBM",
          "v": "—"
        }
      ],
      "tableHeaders": [
        "Charge Description",
        "Curr",
        "Rate Per Unit",
        "Unit",
        "Curr. Amount",
        "ROE",
        "Total Price excl. VAT",
        "VAT%",
        "VAT Amount",
        "Total"
      ],
      "tableRows": [
        [
          "FREIGHT CHARGE",
          "INR",
          "1,500.00",
          "1",
          "1,500.00",
          "1.00000",
          "1,500.00",
          "18",
          "",
          "1,500.00"
        ],
        [
          "LOCAL CHARGES",
          "INR",
          "800.00",
          "1",
          "800.00",
          "1.00000",
          "800.00",
          "18",
          "",
          "800.00"
        ],
        [
          "SEA FREIGHT CHARGE",
          "INR",
          "900.00",
          "1",
          "900.00",
          "1.00000",
          "900.00",
          "18",
          "",
          "900.00"
        ],
        [
          "CONTAINER CLEANING FEE",
          "INR",
          "1,000.00",
          "1",
          "1,000.00",
          "1.00000",
          "1,000.00",
          "15",
          "",
          "1,000.00"
        ]
      ],
      "containerNote": "TTNU0712894 · 1 × 40' FLAT",
      "totalLabel": "Total in : INR"
    },
    "blocks": [
      {
        "type": "companyHeader"
      },
      {
        "type": "arabicHeader"
      },
      {
        "type": "docTitle",
        "text": "TAX INVOICE  فاتورة ضريبية",
        "align": "center"
      },
      {
        "type": "twoColumn",
        "showBillTo": true
      },
      {
        "type": "fieldGrid",
        "cols": 2
      },
      {
        "type": "chargeTable",
        "headerColor": "fill"
      },
      {
        "type": "wordsAndTotal"
      },
      {
        "type": "containerNote"
      },
      {
        "type": "termsBank"
      },
      {
        "type": "colorfulFooter"
      }
    ]
  },
  {
    "code": "INVOICE_REPORT_FORMAT_39",
    "formatNumber": 39,
    "name": "Invoice Report Format-39 Standard Invoice Arabic Format-3",
    "paper": "A4",
    "rtl": true,
    "theme": {
      "primary": "#000000",
      "accent": "#0F4D96",
      "fill": "#F3F3F3",
      "panel": "#EBF0F4",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#9AD7FF",
      "ink": "#101010",
      "gray": "#656565",
      "white": "#FFFFFF"
    },
    "branding": {
      "company": "KingFisher Logistic",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "info@kingfisherwingsgroup.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "BOMINV230500382",
      "invoiceDate": "17-MAY-23",
      "dueDate": "24-MAY-23",
      "billToLabel": "Customer",
      "billToName": "DEMO LOGISTICS INDIA PVT LTD",
      "billToAddress": "21, PORT BLAIR, KRISHNA ST, MANNARGUDI, TAMIL NADU, INDIA, 676876",
      "billToPhone": "798798798",
      "fax": "9879878",
      "vatNo": "68768978898098",
      "billToGstin": "888329087642356",
      "creditTerm": "CASH",
      "currency": "INR",
      "words": "Rupee Four Thousand Two Hundred Only",
      "subtotal": "4,200.00",
      "tax": "576.00",
      "total": "4,200.00",
      "narration": "MBL NO... / HBL NO. NSAJED85630124277 / JOB NO.",
      "officeAddressLines": [
        "MUMBAI",
        "406, 4TH FLOOR, D-21 CORPORATE PARK, SECTOR 21,, MUMBAI, Pincode : 400001"
      ],
      "taxAmountLines": [
        "GST18",
        "GST 15%"
      ],
      "metaRows": [
        {
          "k": "Customer VAT No.",
          "v": "68768978898098"
        },
        {
          "k": "Invoice No.",
          "v": "BOMINV230500382"
        },
        {
          "k": "Invoice Date",
          "v": "17-MAY-23 (POSTED)"
        },
        {
          "k": "Payment Due Date",
          "v": "17-MAY-23"
        }
      ],
      "termsLines": [
        "1. Payment to be made by cash. The company is not responsible for any cash settlement without an official receipt."
      ],
      "bankLines": [
        "Beneficiary Name: KingFisher Logistic",
        "Bank : HDFC",
        "A/c No : XXXXXXXXXXX",
        "IBAN Code : ABA:XXXXXX",
        "Swift Code : XXXXXX",
        "Address : Dubai, United Arab Emirates"
      ],
      "osTableHeaders": [
        "Date",
        "Voucher No",
        "Narration",
        "Currency",
        "FCY Amount",
        "O/S FCY Amount",
        "Aging"
      ],
      "osTableRows": [
        [
          "16-MAY-23",
          "BOMINV230500371",
          "MBL NO... / HBL NO. 6676687 / JOB NO.CBOMEXP230764",
          "INR",
          "944.00",
          "944.00",
          "1"
        ]
      ],
      "agingHeaders": [
        "Currency",
        "Total O/S",
        "< 30",
        "30 - 60",
        "60 - 90",
        "90 - 120",
        "120 - 150",
        "150 - 180",
        "180+"
      ],
      "agingRow": [
        "INR",
        "944.00",
        "944.00",
        "",
        "",
        "",
        "",
        "",
        ""
      ],
      "docSubtitle": "TAX INVOICE  فاتورة ضريبية",
      "fieldGrid": [
        {
          "k": "Shipper",
          "v": "DEMO-SHIPPER ENGG COMPANY"
        },
        {
          "k": "Consignee",
          "v": "DEMO STEEL FACTORY CO. LTD."
        },
        {
          "k": "Place of Origin",
          "v": "NHAVA SHEVA, INDIA"
        },
        {
          "k": "Final destination",
          "v": "JEDDAH, SAUDI ARABIA"
        },
        {
          "k": "House No.",
          "v": "NSAJED85630124277"
        },
        {
          "k": "Number of Packs",
          "v": "3.00"
        },
        {
          "k": "Weight in Kgs",
          "v": "22,700.000"
        },
        {
          "k": "ETD",
          "v": "01-MAR-23"
        },
        {
          "k": "ETA",
          "v": "20-MAR-23"
        },
        {
          "k": "Narration",
          "v": "MBL NO... / HBL NO. NSAJED85630124277 / JOB NO."
        },
        {
          "k": "Vessel / Flight",
          "v": "CAP SAN JUAN"
        },
        {
          "k": "Voyage / Flight No.",
          "v": "310W"
        },
        {
          "k": "Shipper Ref No.",
          "v": "—"
        },
        {
          "k": "Customer P/O No.",
          "v": "—"
        }
      ],
      "tableHeaders": [
        "Charge Description",
        "Curr",
        "Rate Per Unit",
        "Unit",
        "Curr. Amount",
        "ROE",
        "Total Price excl. VAT",
        "VAT%",
        "VAT Amount",
        "Total"
      ],
      "tableRows": [
        [
          "FREIGHT CHARGE",
          "INR",
          "1,500.00",
          "1",
          "1,500.00",
          "1.00000",
          "1,500.00",
          "18",
          "",
          "1,500.00"
        ],
        [
          "LOCAL CHARGES",
          "INR",
          "800.00",
          "1",
          "800.00",
          "1.00000",
          "800.00",
          "18",
          "",
          "800.00"
        ],
        [
          "SEA FREIGHT CHARGE",
          "INR",
          "900.00",
          "1",
          "900.00",
          "1.00000",
          "900.00",
          "18",
          "",
          "900.00"
        ],
        [
          "CONTAINER CLEANING FEE",
          "INR",
          "1,000.00",
          "1",
          "1,000.00",
          "1.00000",
          "1,000.00",
          "15",
          "",
          "1,000.00"
        ]
      ],
      "containerNote": "TTNU0712894 · 1 × 40' FLAT",
      "totalLabel": "Total in : INR"
    },
    "blocks": [
      {
        "type": "companyHeader"
      },
      {
        "type": "arabicHeader"
      },
      {
        "type": "docTitle",
        "text": "TAX INVOICE  فاتورة ضريبية",
        "align": "center"
      },
      {
        "type": "twoColumn",
        "showBillTo": true
      },
      {
        "type": "fieldGrid",
        "cols": 2
      },
      {
        "type": "chargeTable",
        "headerColor": "fill"
      },
      {
        "type": "wordsAndTotal"
      },
      {
        "type": "containerNote"
      },
      {
        "type": "termsBank"
      },
      {
        "type": "colorfulFooter"
      }
    ]
  },
  {
    "code": "INVOICE_REPORT_FORMAT_40",
    "formatNumber": 40,
    "name": "Invoice Report Format-40 Standard Invoice Arabic Format-4",
    "paper": "A4",
    "rtl": true,
    "theme": {
      "primary": "#000000",
      "accent": "#0F4D96",
      "fill": "#F3F3F3",
      "panel": "#EBF0F4",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#9AD7FF",
      "ink": "#101010",
      "gray": "#656565",
      "white": "#FFFFFF"
    },
    "branding": {
      "company": "KingFisher Logistic",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "info@kingfisherwingsgroup.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "BOMINV230500382",
      "invoiceDate": "17-MAY-23",
      "dueDate": "24-MAY-23",
      "billToLabel": "Customer",
      "billToName": "DEMO LOGISTICS INDIA PVT LTD",
      "billToAddress": "21, PORT BLAIR, KRISHNA ST, MANNARGUDI, TAMIL NADU, INDIA, 676876",
      "billToPhone": "798798798",
      "fax": "9879878",
      "vatNo": "68768978898098",
      "billToGstin": "888329087642356",
      "creditTerm": "CASH",
      "currency": "INR",
      "words": "Rupee Four Thousand Two Hundred Only",
      "subtotal": "4,200.00",
      "tax": "576.00",
      "total": "4,200.00",
      "narration": "MBL NO... / HBL NO. NSAJED85630124277 / JOB NO.",
      "officeAddressLines": [
        "MUMBAI",
        "406, 4TH FLOOR, D-21 CORPORATE PARK, SECTOR 21,, MUMBAI, Pincode : 400001"
      ],
      "taxAmountLines": [
        "GST18",
        "GST 15%"
      ],
      "metaRows": [
        {
          "k": "Customer VAT No.",
          "v": "68768978898098"
        },
        {
          "k": "Invoice No.",
          "v": "BOMINV230500382"
        },
        {
          "k": "Invoice Date",
          "v": "17-MAY-23 (POSTED)"
        },
        {
          "k": "Payment Due Date",
          "v": "17-MAY-23"
        },
        {
          "k": "Attention",
          "v": "ENGLISH"
        }
      ],
      "termsLines": [
        "1. Payment to be made by cash. The company is not responsible for any cash settlement without an official receipt."
      ],
      "bankLines": [
        "Beneficiary Name: KingFisher Logistic",
        "Bank : HDFC",
        "A/c No : XXXXXXXXXXX",
        "IBAN Code : ABA:XXXXXX",
        "Swift Code : XXXXXX",
        "Address : Dubai, United Arab Emirates"
      ],
      "osTableHeaders": [
        "Date",
        "Voucher No",
        "Narration",
        "Currency",
        "FCY Amount",
        "O/S FCY Amount",
        "Aging"
      ],
      "osTableRows": [
        [
          "16-MAY-23",
          "BOMINV230500371",
          "MBL NO... / HBL NO. 6676687 / JOB NO.CBOMEXP230764",
          "INR",
          "944.00",
          "944.00",
          "1"
        ]
      ],
      "agingHeaders": [
        "Currency",
        "Total O/S",
        "< 30",
        "30 - 60",
        "60 - 90",
        "90 - 120",
        "120 - 150",
        "150 - 180",
        "180+"
      ],
      "agingRow": [
        "INR",
        "944.00",
        "944.00",
        "",
        "",
        "",
        "",
        "",
        ""
      ],
      "docSubtitle": "TAX INVOICE  فاتورة ضريبية",
      "fieldGrid": [
        {
          "k": "Shipper",
          "v": "DEMO-SHIPPER ENGG COMPANY"
        },
        {
          "k": "Consignee",
          "v": "DEMO STEEL FACTORY CO. LTD."
        },
        {
          "k": "Place of Origin",
          "v": "NHAVA SHEVA, INDIA"
        },
        {
          "k": "Final destination",
          "v": "JEDDAH, SAUDI ARABIA"
        },
        {
          "k": "House No.",
          "v": "NSAJED85630124277"
        },
        {
          "k": "Number of Packs",
          "v": "3.00"
        },
        {
          "k": "Weight in Kgs",
          "v": "22,700.000"
        },
        {
          "k": "ETD",
          "v": "01-MAR-23"
        },
        {
          "k": "ETA",
          "v": "20-MAR-23"
        },
        {
          "k": "Narration",
          "v": "MBL NO... / HBL NO. NSAJED85630124277 / JOB NO."
        }
      ],
      "tableHeaders": [
        "Charge Description",
        "Curr",
        "Rate Per Unit",
        "Unit",
        "Curr. Amount",
        "ROE",
        "Total Price excl. VAT",
        "VAT%",
        "VAT Amount",
        "Total"
      ],
      "tableRows": [
        [
          "FREIGHT CHARGE",
          "INR",
          "1,500.00",
          "1",
          "1,500.00",
          "1.00000",
          "1,500.00",
          "18",
          "",
          "1,500.00"
        ],
        [
          "LOCAL CHARGES",
          "INR",
          "800.00",
          "1",
          "800.00",
          "1.00000",
          "800.00",
          "18",
          "",
          "800.00"
        ],
        [
          "SEA FREIGHT CHARGE",
          "INR",
          "900.00",
          "1",
          "900.00",
          "1.00000",
          "900.00",
          "18",
          "",
          "900.00"
        ],
        [
          "CONTAINER CLEANING FEE",
          "INR",
          "1,000.00",
          "1",
          "1,000.00",
          "1.00000",
          "1,000.00",
          "15",
          "",
          "1,000.00"
        ]
      ],
      "containerNote": "TTNU0712894 · 1 × 40' FLAT",
      "totalLabel": "Total in : INR"
    },
    "blocks": [
      {
        "type": "companyHeader"
      },
      {
        "type": "arabicHeader"
      },
      {
        "type": "docTitle",
        "text": "TAX INVOICE  فاتورة ضريبية",
        "align": "center"
      },
      {
        "type": "twoColumn",
        "showBillTo": true
      },
      {
        "type": "fieldGrid",
        "cols": 2
      },
      {
        "type": "chargeTable",
        "headerColor": "fill"
      },
      {
        "type": "wordsAndTotal"
      },
      {
        "type": "containerNote"
      },
      {
        "type": "termsBank"
      },
      {
        "type": "colorfulFooter"
      }
    ]
  },
  {
    "code": "INVOICE_REPORT_FORMAT_41",
    "formatNumber": 41,
    "name": "Invoice Report Format-41 Standard Invoice Arabic Format-5",
    "paper": "A4",
    "rtl": true,
    "theme": {
      "primary": "#000000",
      "accent": "#0F4D96",
      "fill": "#F3F3F3",
      "panel": "#EBF0F4",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#9AD7FF",
      "ink": "#101010",
      "gray": "#656565",
      "white": "#FFFFFF"
    },
    "branding": {
      "company": "KingFisher Logistic",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "info@kingfisherwingsgroup.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "BOMINV230500382",
      "invoiceDate": "17-MAY-23",
      "dueDate": "24-MAY-23",
      "billToLabel": "Customer",
      "billToName": "DEMO LOGISTICS INDIA PVT LTD",
      "billToAddress": "21, PORT BLAIR, KRISHNA ST, MANNARGUDI, TAMIL NADU, INDIA, 676876",
      "billToPhone": "798798798",
      "fax": "9879878",
      "vatNo": "68768978898098",
      "billToGstin": "888329087642356",
      "creditTerm": "CASH",
      "currency": "INR",
      "words": "Rupee Four Thousand Two Hundred Only",
      "subtotal": "4,200.00",
      "tax": "576.00",
      "total": "4,200.00",
      "narration": "MBL NO... / HBL NO. NSAJED85630124277 / JOB NO.",
      "officeAddressLines": [
        "MUMBAI",
        "406, 4TH FLOOR, D-21 CORPORATE PARK, SECTOR 21,, MUMBAI, Pincode : 400001"
      ],
      "taxAmountLines": [
        "GST18",
        "GST 15%"
      ],
      "metaRows": [
        {
          "k": "Customer VAT No.",
          "v": "68768978898098"
        },
        {
          "k": "Invoice No.",
          "v": "BOMINV230500382"
        },
        {
          "k": "Invoice Date",
          "v": "17-MAY-23 (POSTED)"
        },
        {
          "k": "Payment Due Date",
          "v": "17-MAY-23"
        }
      ],
      "termsLines": [
        "1. Payment to be made by cash. The company is not responsible for any cash settlement without an official receipt."
      ],
      "bankLines": [
        "Beneficiary Name: KingFisher Logistic",
        "Bank : HDFC",
        "A/c No : XXXXXXXXXXX",
        "IBAN Code : ABA:XXXXXX",
        "Swift Code : XXXXXX",
        "Address : Dubai, United Arab Emirates"
      ],
      "osTableHeaders": [
        "Date",
        "Voucher No",
        "Narration",
        "Currency",
        "FCY Amount",
        "O/S FCY Amount",
        "Aging"
      ],
      "osTableRows": [
        [
          "16-MAY-23",
          "BOMINV230500371",
          "MBL NO... / HBL NO. 6676687 / JOB NO.CBOMEXP230764",
          "INR",
          "944.00",
          "944.00",
          "1"
        ]
      ],
      "agingHeaders": [
        "Currency",
        "Total O/S",
        "< 30",
        "30 - 60",
        "60 - 90",
        "90 - 120",
        "120 - 150",
        "150 - 180",
        "180+"
      ],
      "agingRow": [
        "INR",
        "944.00",
        "944.00",
        "",
        "",
        "",
        "",
        "",
        ""
      ],
      "docSubtitle": "TAX INVOICE  فاتورة ضريبية",
      "fieldGrid": [
        {
          "k": "Shipper",
          "v": "DEMO-SHIPPER ENGG COMPANY"
        },
        {
          "k": "Consignee",
          "v": "DEMO STEEL FACTORY CO. LTD."
        },
        {
          "k": "Place of Origin",
          "v": "NHAVA SHEVA, INDIA"
        },
        {
          "k": "Final destination",
          "v": "JEDDAH, SAUDI ARABIA"
        },
        {
          "k": "House No.",
          "v": "NSAJED85630124277"
        },
        {
          "k": "Number of Packs",
          "v": "3.00"
        },
        {
          "k": "Weight in Kgs",
          "v": "22,700.000"
        },
        {
          "k": "ETD",
          "v": "01-MAR-23"
        },
        {
          "k": "ETA",
          "v": "20-MAR-23"
        },
        {
          "k": "Narration",
          "v": "MBL NO... / HBL NO. NSAJED85630124277 / JOB NO."
        },
        {
          "k": "Remarks",
          "v": "—"
        }
      ],
      "tableHeaders": [
        "Charge Description",
        "Curr",
        "Rate Per Unit",
        "Unit",
        "Curr. Amount",
        "ROE",
        "Total Price excl. VAT",
        "VAT%",
        "VAT Amount",
        "Total"
      ],
      "tableRows": [
        [
          "FREIGHT CHARGE",
          "INR",
          "1,500.00",
          "1",
          "1,500.00",
          "1.00000",
          "1,500.00",
          "18",
          "",
          "1,500.00"
        ],
        [
          "LOCAL CHARGES",
          "INR",
          "800.00",
          "1",
          "800.00",
          "1.00000",
          "800.00",
          "18",
          "",
          "800.00"
        ],
        [
          "SEA FREIGHT CHARGE",
          "INR",
          "900.00",
          "1",
          "900.00",
          "1.00000",
          "900.00",
          "18",
          "",
          "900.00"
        ],
        [
          "CONTAINER CLEANING FEE",
          "INR",
          "1,000.00",
          "1",
          "1,000.00",
          "1.00000",
          "1,000.00",
          "15",
          "",
          "1,000.00"
        ]
      ],
      "containerNote": "TTNU0712894 · 1 × 40' FLAT",
      "totalLabel": "Total in : INR"
    },
    "blocks": [
      {
        "type": "companyHeader"
      },
      {
        "type": "arabicHeader"
      },
      {
        "type": "docTitle",
        "text": "TAX INVOICE  فاتورة ضريبية",
        "align": "center"
      },
      {
        "type": "twoColumn",
        "showBillTo": true
      },
      {
        "type": "fieldGrid",
        "cols": 2
      },
      {
        "type": "chargeTable",
        "headerColor": "fill"
      },
      {
        "type": "wordsAndTotal"
      },
      {
        "type": "containerNote"
      },
      {
        "type": "termsBank"
      },
      {
        "type": "colorfulFooter"
      }
    ]
  },
  {
    "code": "INVOICE_REPORT_FORMAT_42",
    "formatNumber": 42,
    "name": "Invoice Report Format-42 Standard Invoice Arabic Format-7",
    "paper": "A4",
    "rtl": true,
    "theme": {
      "primary": "#000000",
      "accent": "#0F4D96",
      "fill": "#F3F3F3",
      "panel": "#EBF0F4",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#9AD7FF",
      "ink": "#101010",
      "gray": "#656565",
      "white": "#FFFFFF"
    },
    "branding": {
      "company": "KingFisher Logistic",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "info@kingfisherwingsgroup.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "BOMINV230500382",
      "invoiceDate": "17-MAY-23",
      "dueDate": "24-MAY-23",
      "billToLabel": "Customer",
      "billToName": "DEMO LOGISTICS INDIA PVT LTD",
      "billToAddress": "21, PORT BLAIR, KRISHNA ST, MANNARGUDI, TAMIL NADU, INDIA, 676876",
      "billToPhone": "798798798",
      "fax": "9879878",
      "vatNo": "68768978898098",
      "billToGstin": "888329087642356",
      "creditTerm": "CASH",
      "currency": "INR",
      "words": "Rupee Four Thousand Two Hundred Only",
      "subtotal": "4,200.00",
      "tax": "576.00",
      "total": "4,200.00",
      "narration": "MBL NO... / HBL NO. NSAJED85630124277 / JOB NO.",
      "officeAddressLines": [
        "MUMBAI",
        "406, 4TH FLOOR, D-21 CORPORATE PARK, SECTOR 21,, MUMBAI, Pincode : 400001"
      ],
      "taxAmountLines": [
        "GST18",
        "GST 15%"
      ],
      "metaRows": [
        {
          "k": "Customer VAT No.",
          "v": "68768978898098"
        },
        {
          "k": "Invoice No.",
          "v": "BOMINV230500382"
        },
        {
          "k": "Invoice Date",
          "v": "17-MAY-23 (POSTED)"
        },
        {
          "k": "Payment Due Date",
          "v": "17-MAY-23"
        },
        {
          "k": "Customer VAT No.",
          "v": "68768978898098"
        }
      ],
      "termsLines": [
        "1. Payment to be made by cash. The company is not responsible for any cash settlement without an official receipt."
      ],
      "bankLines": [
        "Beneficiary Name: KingFisher Logistic",
        "Bank : HDFC",
        "A/c No : XXXXXXXXXXX",
        "IBAN Code : ABA:XXXXXX",
        "Swift Code : XXXXXX",
        "Address : Dubai, United Arab Emirates"
      ],
      "osTableHeaders": [
        "Date",
        "Voucher No",
        "Narration",
        "Currency",
        "FCY Amount",
        "O/S FCY Amount",
        "Aging"
      ],
      "osTableRows": [
        [
          "16-MAY-23",
          "BOMINV230500371",
          "MBL NO... / HBL NO. 6676687 / JOB NO.CBOMEXP230764",
          "INR",
          "944.00",
          "944.00",
          "1"
        ]
      ],
      "agingHeaders": [
        "Currency",
        "Total O/S",
        "< 30",
        "30 - 60",
        "60 - 90",
        "90 - 120",
        "120 - 150",
        "150 - 180",
        "180+"
      ],
      "agingRow": [
        "INR",
        "944.00",
        "944.00",
        "",
        "",
        "",
        "",
        "",
        ""
      ],
      "docSubtitle": "TAX INVOICE  فاتورة ضريبية",
      "fieldGrid": [
        {
          "k": "Shipper",
          "v": "DEMO-SHIPPER ENGG COMPANY"
        },
        {
          "k": "Consignee",
          "v": "DEMO STEEL FACTORY CO. LTD."
        },
        {
          "k": "Place of Origin",
          "v": "NHAVA SHEVA, INDIA"
        },
        {
          "k": "Final destination",
          "v": "JEDDAH, SAUDI ARABIA"
        },
        {
          "k": "House No.",
          "v": "NSAJED85630124277"
        },
        {
          "k": "Number of Packs",
          "v": "3.00"
        },
        {
          "k": "Weight in Kgs",
          "v": "22,700.000"
        },
        {
          "k": "ETD",
          "v": "01-MAR-23"
        },
        {
          "k": "ETA",
          "v": "20-MAR-23"
        },
        {
          "k": "Narration",
          "v": "MBL NO... / HBL NO. NSAJED85630124277 / JOB NO."
        },
        {
          "k": "IGM No.",
          "v": "—"
        },
        {
          "k": "INCO Terms",
          "v": "FOB"
        }
      ],
      "tableHeaders": [
        "Charge Description",
        "Curr",
        "Rate Per Unit",
        "Unit",
        "Curr. Amount",
        "ROE",
        "Total Price excl. VAT",
        "VAT%",
        "VAT Amount",
        "Total"
      ],
      "tableRows": [
        [
          "FREIGHT CHARGE",
          "INR",
          "1,500.00",
          "1",
          "1,500.00",
          "1.00000",
          "1,500.00",
          "18",
          "",
          "1,500.00"
        ],
        [
          "LOCAL CHARGES",
          "INR",
          "800.00",
          "1",
          "800.00",
          "1.00000",
          "800.00",
          "18",
          "",
          "800.00"
        ],
        [
          "SEA FREIGHT CHARGE",
          "INR",
          "900.00",
          "1",
          "900.00",
          "1.00000",
          "900.00",
          "18",
          "",
          "900.00"
        ],
        [
          "CONTAINER CLEANING FEE",
          "INR",
          "1,000.00",
          "1",
          "1,000.00",
          "1.00000",
          "1,000.00",
          "15",
          "",
          "1,000.00"
        ]
      ],
      "containerNote": "TTNU0712894 · 1 × 40' FLAT",
      "totalLabel": "Total in : INR"
    },
    "blocks": [
      {
        "type": "companyHeader"
      },
      {
        "type": "arabicHeader"
      },
      {
        "type": "docTitle",
        "text": "TAX INVOICE  فاتورة ضريبية",
        "align": "center"
      },
      {
        "type": "twoColumn",
        "showBillTo": true
      },
      {
        "type": "fieldGrid",
        "cols": 2
      },
      {
        "type": "chargeTable",
        "headerColor": "fill"
      },
      {
        "type": "wordsAndTotal"
      },
      {
        "type": "containerNote"
      },
      {
        "type": "termsBank"
      },
      {
        "type": "colorfulFooter"
      }
    ]
  },
  {
    "code": "INVOICE_REPORT_FORMAT_43",
    "formatNumber": 43,
    "name": "Invoice Report Format-43 Standard Courier Invoice",
    "paper": "A4",
    "rtl": false,
    "theme": {
      "primary": "#000000",
      "accent": "#0F4D96",
      "fill": "#F3F3F3",
      "panel": "#EBF0F4",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#9AD7FF",
      "ink": "#101010",
      "gray": "#656565",
      "white": "#FFFFFF"
    },
    "branding": {
      "company": "KingFisher Logistic",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "info@kingfisherwingsgroup.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "BOMINV230500382",
      "invoiceDate": "17-MAY-23",
      "dueDate": "24-MAY-23",
      "billToLabel": "Acc. Name",
      "billToName": "DEMO LOGISTICS INDIA PVT LTD",
      "billToAddress": "21, PORT BLAIR, KRISHNA ST, MANNARGUDI, TAMIL NADU, INDIA, 676876",
      "billToPhone": "798798798",
      "fax": "9879878",
      "vatNo": "68768978898098",
      "billToGstin": "888329087642356",
      "creditTerm": "CASH",
      "currency": "INR",
      "words": "Rupee Four Thousand Seven Hundred Seventy-Six Only",
      "subtotal": "4,200.00",
      "tax": "576.00",
      "total": "4,776.00",
      "narration": "MBL NO... / HBL NO. NSAJED85630124277 / JOB NO.",
      "officeAddressLines": [
        "MUMBAI",
        "406, 4TH FLOOR, D-21 CORPORATE PARK, SECTOR 21,, MUMBAI, Pincode : 400001"
      ],
      "taxAmountLines": [
        "GST18",
        "GST 15%"
      ],
      "metaRows": [
        {
          "k": "Invoice No.",
          "v": "BOMINV230500382"
        },
        {
          "k": "Invoice Date",
          "v": "17-MAY-23 (POSTED)"
        },
        {
          "k": "Invoice Period",
          "v": "MAY-23"
        },
        {
          "k": "Job No.",
          "v": "—"
        }
      ],
      "termsLines": [
        "1. Payment to be made by cash. The company is not responsible for any cash settlement without an official receipt."
      ],
      "bankLines": [
        "Beneficiary Name: KingFisher Logistic",
        "Bank : HDFC",
        "A/c No : XXXXXXXXXXX",
        "IBAN Code : ABA:XXXXXX",
        "Swift Code : XXXXXX",
        "Address : Dubai, United Arab Emirates"
      ],
      "osTableHeaders": [
        "Date",
        "Voucher No",
        "Narration",
        "Currency",
        "FCY Amount",
        "O/S FCY Amount",
        "Aging"
      ],
      "osTableRows": [
        [
          "16-MAY-23",
          "BOMINV230500371",
          "MBL NO... / HBL NO. 6676687 / JOB NO.CBOMEXP230764",
          "INR",
          "944.00",
          "944.00",
          "1"
        ]
      ],
      "agingHeaders": [
        "Currency",
        "Total O/S",
        "< 30",
        "30 - 60",
        "60 - 90",
        "90 - 120",
        "120 - 150",
        "150 - 180",
        "180+"
      ],
      "agingRow": [
        "INR",
        "944.00",
        "944.00",
        "",
        "",
        "",
        "",
        "",
        ""
      ],
      "tableHeaders": [
        "L.No.",
        "Charges",
        "Destination",
        "Group",
        "Weight",
        "Amount (INR)"
      ],
      "tableRows": [
        [
          "1",
          "FREIGHT CHARGE",
          "JEDDAH, SAUDI ARABIA",
          "PACKAGES",
          "",
          "1,500.00"
        ],
        [
          "2",
          "LOCAL CHARGES",
          "JEDDAH, SAUDI ARABIA",
          "PACKAGES",
          "",
          "800.00"
        ],
        [
          "3",
          "SEA FREIGHT CHARGE",
          "JEDDAH, SAUDI ARABIA",
          "PACKAGES",
          "",
          "900.00"
        ],
        [
          "4",
          "CONTAINER CLEANING FEE",
          "JEDDAH, SAUDI ARABIA",
          "PACKAGES",
          "",
          "1,000.00"
        ]
      ],
      "totalLabel": "Total Amount"
    },
    "blocks": [
      {
        "type": "companyHeader"
      },
      {
        "type": "docTitle",
        "text": "INVOICE",
        "align": "center"
      },
      {
        "type": "twoColumn",
        "showBillTo": true
      },
      {
        "type": "chargeTable",
        "headerColor": "fill"
      },
      {
        "type": "wordsAndTotal"
      },
      {
        "type": "termsBank"
      },
      {
        "type": "colorfulFooter"
      }
    ]
  },
  {
    "code": "INVOICE_REPORT_FORMAT_44",
    "formatNumber": 44,
    "name": "Invoice Report Format-44 Standard Invoice FCY",
    "paper": "A4",
    "rtl": false,
    "theme": {
      "primary": "#000000",
      "accent": "#0F4D96",
      "fill": "#F3F3F3",
      "panel": "#EBF0F4",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#9AD7FF",
      "ink": "#101010",
      "gray": "#656565",
      "white": "#FFFFFF"
    },
    "branding": {
      "company": "KingFisher Logistic",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "info@kingfisherwingsgroup.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "BOMINV230500382",
      "invoiceDate": "17-MAY-23",
      "dueDate": "24-MAY-23",
      "billToLabel": "Agent",
      "billToName": "DEMO LOGISTICS INDIA PVT LTD",
      "billToAddress": "21, PORT BLAIR, KRISHNA ST, MANNARGUDI, TAMIL NADU, INDIA, 676876",
      "billToPhone": "798798798",
      "fax": "9879878",
      "vatNo": "68768978898098",
      "billToGstin": "888329087642356",
      "creditTerm": "CASH",
      "currency": "INR",
      "words": "Rupee Four Thousand Seven Hundred Seventy-Six Only",
      "subtotal": "4,200.00",
      "tax": "576.00",
      "total": "4,776.00",
      "narration": "MBL NO... / HBL NO. NSAJED85630124277 / JOB NO.",
      "officeAddressLines": [
        "MUMBAI",
        "406, 4TH FLOOR, D-21 CORPORATE PARK, SECTOR 21,, MUMBAI, Pincode : 400001"
      ],
      "taxAmountLines": [
        "GST18",
        "GST 15%"
      ],
      "metaRows": [
        {
          "k": "Invoice No.",
          "v": "BOMINV230500382 / 17-MAY-23 (POSTED)"
        },
        {
          "k": "Credit Term",
          "v": "CASH"
        },
        {
          "k": "Due Date",
          "v": "17-MAY-23"
        }
      ],
      "termsLines": [
        "1. Payment to be made by cash. The company is not responsible for any cash settlement without an official receipt."
      ],
      "bankLines": [
        "Beneficiary Name: KingFisher Logistic",
        "Bank : HDFC",
        "A/c No : XXXXXXXXXXX",
        "IBAN Code : ABA:XXXXXX",
        "Swift Code : XXXXXX",
        "Address : Dubai, United Arab Emirates"
      ],
      "osTableHeaders": [
        "Date",
        "Voucher No",
        "Narration",
        "Currency",
        "FCY Amount",
        "O/S FCY Amount",
        "Aging"
      ],
      "osTableRows": [
        [
          "16-MAY-23",
          "BOMINV230500371",
          "MBL NO... / HBL NO. 6676687 / JOB NO.CBOMEXP230764",
          "INR",
          "944.00",
          "944.00",
          "1"
        ]
      ],
      "agingHeaders": [
        "Currency",
        "Total O/S",
        "< 30",
        "30 - 60",
        "60 - 90",
        "90 - 120",
        "120 - 150",
        "150 - 180",
        "180+"
      ],
      "agingRow": [
        "INR",
        "944.00",
        "944.00",
        "",
        "",
        "",
        "",
        "",
        ""
      ],
      "fieldGrid": [
        {
          "k": "Shipper",
          "v": "DEMO-SHIPPER ENGG COMPANY"
        },
        {
          "k": "Consignee",
          "v": "DEMO STEEL FACTORY CO. LTD."
        },
        {
          "k": "Shipment No.",
          "v": "BOM/EXP/23/05/B/0709 / 16-MAY-23"
        },
        {
          "k": "HBL / HAWB No.",
          "v": "NSAJED85630124277"
        },
        {
          "k": "Place of Receipt",
          "v": "INMAA-CHENNAI"
        },
        {
          "k": "Port of Loading",
          "v": "NHAVA SHEVA, INDIA"
        },
        {
          "k": "Port of Discharge",
          "v": "JEDDAH, SAUDI ARABIA"
        },
        {
          "k": "Place of Delivery",
          "v": "JEDDAH SAUDI ARABIA"
        },
        {
          "k": "ETD",
          "v": "01-MAR-23"
        },
        {
          "k": "ETA",
          "v": "20-MAR-23"
        },
        {
          "k": "INCO Terms",
          "v": "FOB"
        },
        {
          "k": "Narration",
          "v": "MBL NO... / HBL NO. NSAJED85630124277 / JOB NO."
        }
      ],
      "containerHeaders": [
        "Container No.",
        "Type",
        "Description",
        "No of Pcs",
        "Gross Weight",
        "Volume"
      ],
      "containerRow": [
        "TTNU0712894",
        "40' FLAT",
        "GENERAL CARGO",
        "3 PACKAGES",
        "22,700.000 KGS",
        "22,700.000"
      ],
      "tableHeaders": [
        "Charges",
        "Currency",
        "Qty",
        "Amount / Qty",
        "FCY Amount",
        "Total Amount (INR)"
      ],
      "tableRows": [
        [
          "FREIGHT CHARGE",
          "INR",
          "1",
          "1,500.00",
          "1,500.00",
          "1,500.00"
        ],
        [
          "LOCAL CHARGES",
          "INR",
          "1",
          "800.00",
          "800.00",
          "800.00"
        ],
        [
          "SEA FREIGHT CHARGE",
          "INR",
          "1",
          "900.00",
          "900.00",
          "900.00"
        ],
        [
          "CONTAINER CLEANING FEE",
          "INR",
          "1",
          "1,000.00",
          "1,000.00",
          "1,000.00"
        ],
        [
          "I/U GST 18%",
          "INR",
          "1",
          "576.00",
          "576.00",
          "576.00"
        ]
      ]
    },
    "blocks": [
      {
        "type": "companyHeader"
      },
      {
        "type": "docTitle",
        "text": "INVOICE / DEBIT NOTE",
        "align": "center"
      },
      {
        "type": "twoColumn",
        "showBillTo": true,
        "showCreditTerm": true
      },
      {
        "type": "fieldGrid",
        "cols": 2
      },
      {
        "type": "containerNote"
      },
      {
        "type": "chargeTable",
        "headerColor": "fill"
      },
      {
        "type": "wordsAndTotal"
      },
      {
        "type": "termsBank"
      },
      {
        "type": "colorfulFooter"
      }
    ]
  },
  {
    "code": "INVOICE_REPORT_FORMAT_45",
    "formatNumber": 45,
    "name": "Invoice Report Format-45 Standard Invoice FCY Format-2",
    "paper": "A4",
    "rtl": false,
    "theme": {
      "primary": "#000000",
      "accent": "#0F4D96",
      "fill": "#F3F3F3",
      "panel": "#EBF0F4",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#9AD7FF",
      "ink": "#101010",
      "gray": "#656565",
      "white": "#FFFFFF"
    },
    "branding": {
      "company": "KingFisher Logistic",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "info@kingfisherwingsgroup.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "BOMINV230500382",
      "invoiceDate": "17-MAY-23",
      "dueDate": "24-MAY-23",
      "billToLabel": "Invoice Receiver",
      "billToName": "DEMO LOGISTICS INDIA PVT LTD",
      "billToAddress": "21, PORT BLAIR, KRISHNA ST, MANNARGUDI, TAMIL NADU, INDIA, 676876",
      "billToPhone": "798798798",
      "fax": "9879878",
      "vatNo": "68768978898098",
      "billToGstin": "888329087642356",
      "creditTerm": "CASH",
      "currency": "INR",
      "words": "Rupee Four Thousand Seven Hundred Seventy-Six Only",
      "subtotal": "4,200.00",
      "tax": "576.00",
      "total": "4,776.00",
      "narration": "MBL NO... / HBL NO. NSAJED85630124277 / JOB NO.",
      "officeAddressLines": [
        "MUMBAI",
        "406, 4TH FLOOR, D-21 CORPORATE PARK, SECTOR 21,, MUMBAI, Pincode : 400001"
      ],
      "taxAmountLines": [
        "GST18",
        "GST 15%"
      ],
      "metaRows": [
        {
          "k": "Invoice No.",
          "v": "BOMINV230500382"
        },
        {
          "k": "Date",
          "v": "17-MAY-23 (POSTED)"
        },
        {
          "k": "Movement Type",
          "v": "FCL"
        }
      ],
      "termsLines": [
        "1. Payment to be made by cash. The company is not responsible for any cash settlement without an official receipt."
      ],
      "bankLines": [
        "Beneficiary Name: KingFisher Logistic",
        "Bank : HDFC",
        "A/c No : XXXXXXXXXXX",
        "IBAN Code : ABA:XXXXXX",
        "Swift Code : XXXXXX",
        "Address : Dubai, United Arab Emirates"
      ],
      "osTableHeaders": [
        "Date",
        "Voucher No",
        "Narration",
        "Currency",
        "FCY Amount",
        "O/S FCY Amount",
        "Aging"
      ],
      "osTableRows": [
        [
          "16-MAY-23",
          "BOMINV230500371",
          "MBL NO... / HBL NO. 6676687 / JOB NO.CBOMEXP230764",
          "INR",
          "944.00",
          "944.00",
          "1"
        ]
      ],
      "agingHeaders": [
        "Currency",
        "Total O/S",
        "< 30",
        "30 - 60",
        "60 - 90",
        "90 - 120",
        "120 - 150",
        "150 - 180",
        "180+"
      ],
      "agingRow": [
        "INR",
        "944.00",
        "944.00",
        "",
        "",
        "",
        "",
        "",
        ""
      ],
      "fieldGrid": [
        {
          "k": "Port of Loading",
          "v": "NHAVA SHEVA, INDIA"
        },
        {
          "k": "Port of Discharge",
          "v": "JEDDAH, SAUDI ARABIA"
        },
        {
          "k": "ETD",
          "v": "01-MAR-23"
        },
        {
          "k": "ETA",
          "v": "20-MAR-23"
        },
        {
          "k": "Vessel/Voyage",
          "v": "CAP SAN JUAN / 310W"
        },
        {
          "k": "Narration",
          "v": "MBL NO... / HBL NO. NSAJED85630124277 / JOB NO."
        }
      ],
      "tableHeaders": [
        "BL No",
        "Description",
        "Shipper",
        "Place of Delivery",
        "Units",
        "Amount (INR)"
      ],
      "tableRows": [
        [
          "NSAJED85630124277",
          "FREIGHT CHARGE",
          "DEMO-SHIPPER ENGG COMPANY",
          "JEDDAH SAUDI ARABIA",
          "1 × 1,500.00",
          "1,500.00"
        ],
        [
          "NSAJED85630124277",
          "LOCAL CHARGES",
          "DEMO-SHIPPER ENGG COMPANY",
          "JEDDAH SAUDI ARABIA",
          "1 × 800.00",
          "800.00"
        ],
        [
          "NSAJED85630124277",
          "SEA FREIGHT CHARGE",
          "DEMO-SHIPPER ENGG COMPANY",
          "JEDDAH SAUDI ARABIA",
          "1 × 900.00",
          "900.00"
        ],
        [
          "NSAJED85630124277",
          "CONTAINER CLEANING FEE",
          "DEMO-SHIPPER ENGG COMPANY",
          "JEDDAH SAUDI ARABIA",
          "1 × 1,000.00",
          "1,000.00"
        ]
      ],
      "containerNote": "Container : TTNU0712894 / 40' FLAT"
    },
    "blocks": [
      {
        "type": "companyHeader"
      },
      {
        "type": "docTitle",
        "text": "TAX INVOICE",
        "align": "center"
      },
      {
        "type": "twoColumn",
        "showBillTo": true
      },
      {
        "type": "taxAmountBox"
      },
      {
        "type": "fieldGrid",
        "cols": 2
      },
      {
        "type": "chargeTable",
        "headerColor": "fill"
      },
      {
        "type": "wordsAndTotal"
      },
      {
        "type": "containerNote"
      },
      {
        "type": "termsBank"
      },
      {
        "type": "colorfulFooter"
      }
    ]
  },
  {
    "code": "INVOICE_REPORT_FORMAT_46",
    "formatNumber": 46,
    "name": "Invoice Report Format-46 FG Standard Invoice FCY",
    "paper": "A4",
    "rtl": false,
    "theme": {
      "primary": "#000000",
      "accent": "#0F4D96",
      "fill": "#F3F3F3",
      "panel": "#EBF0F4",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#9AD7FF",
      "ink": "#101010",
      "gray": "#656565",
      "white": "#FFFFFF"
    },
    "branding": {
      "company": "KingFisher Logistic",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "info@kingfisherwingsgroup.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "BOMINV230500382",
      "invoiceDate": "17-MAY-23",
      "dueDate": "24-MAY-23",
      "billToLabel": "Agent",
      "billToName": "DEMO LOGISTICS INDIA PVT LTD",
      "billToAddress": "21, PORT BLAIR, KRISHNA ST, MANNARGUDI, TAMIL NADU, INDIA, 676876",
      "billToPhone": "798798798",
      "fax": "9879878",
      "vatNo": "68768978898098",
      "billToGstin": "888329087642356",
      "creditTerm": "CASH",
      "currency": "INR",
      "words": "Rupee Four Thousand Seven Hundred Seventy-Six Only",
      "subtotal": "4,200.00",
      "tax": "576.00",
      "total": "4,776.00",
      "narration": "MBL NO... / HBL NO. NSAJED85630124277 / JOB NO.",
      "officeAddressLines": [
        "MUMBAI",
        "406, 4TH FLOOR, D-21 CORPORATE PARK, SECTOR 21,, MUMBAI, Pincode : 400001"
      ],
      "taxAmountLines": [
        "GST18",
        "GST 15%"
      ],
      "metaRows": [
        {
          "k": "Invoice No.",
          "v": "BOMINV230500382 / 17-MAY-23 (POSTED)"
        },
        {
          "k": "Credit Term",
          "v": "CASH"
        },
        {
          "k": "Due Date",
          "v": "17-MAY-23"
        },
        {
          "k": "Shipment No.",
          "v": "BOM/EXP/23/05/B/0709 / 16-MAY-23"
        }
      ],
      "termsLines": [
        "1. Payment to be made by cash. The company is not responsible for any cash settlement without an official receipt."
      ],
      "bankLines": [
        "Beneficiary Name: KingFisher Logistic",
        "Bank : HDFC",
        "A/c No : XXXXXXXXXXX",
        "IBAN Code : ABA:XXXXXX",
        "Swift Code : XXXXXX",
        "Address : Dubai, United Arab Emirates"
      ],
      "osTableHeaders": [
        "Date",
        "Voucher No",
        "Narration",
        "Currency",
        "FCY Amount",
        "O/S FCY Amount",
        "Aging"
      ],
      "osTableRows": [
        [
          "16-MAY-23",
          "BOMINV230500371",
          "MBL NO... / HBL NO. 6676687 / JOB NO.CBOMEXP230764",
          "INR",
          "944.00",
          "944.00",
          "1"
        ]
      ],
      "agingHeaders": [
        "Currency",
        "Total O/S",
        "< 30",
        "30 - 60",
        "60 - 90",
        "90 - 120",
        "120 - 150",
        "150 - 180",
        "180+"
      ],
      "agingRow": [
        "INR",
        "944.00",
        "944.00",
        "",
        "",
        "",
        "",
        "",
        ""
      ],
      "fieldGrid": [
        {
          "k": "Shipper",
          "v": "DEMO-SHIPPER ENGG COMPANY"
        },
        {
          "k": "Consignee",
          "v": "DEMO STEEL FACTORY CO. LTD."
        },
        {
          "k": "HBL No.",
          "v": "NSAJED85630124277"
        },
        {
          "k": "Place of Receipt",
          "v": "INMAA-CHENNAI"
        },
        {
          "k": "Port of Loading",
          "v": "NHAVA SHEVA, INDIA"
        },
        {
          "k": "Port of Discharge",
          "v": "JEDDAH, SAUDI ARABIA"
        },
        {
          "k": "Place of Delivery",
          "v": "JEDDAH SAUDI ARABIA"
        },
        {
          "k": "ETD",
          "v": "01-MAR-23"
        },
        {
          "k": "ETA",
          "v": "20-MAR-23"
        },
        {
          "k": "INCO Terms",
          "v": "FOB"
        },
        {
          "k": "IRN No",
          "v": "—"
        },
        {
          "k": "Narration",
          "v": "MBL NO... / HBL NO. NSAJED85630124277 / JOB NO."
        }
      ],
      "tableHeaders": [
        "Charges",
        "Currency",
        "Qty",
        "Amount / Qty",
        "FCY Amount",
        "Total Amount (INR)"
      ],
      "tableRows": [
        [
          "FREIGHT CHARGE",
          "INR",
          "1",
          "1,500.00",
          "1,500.00",
          "1,770.00"
        ],
        [
          "LOCAL CHARGES",
          "INR",
          "1",
          "800.00",
          "800.00",
          "944.00"
        ],
        [
          "SEA FREIGHT CHARGE",
          "INR",
          "1",
          "900.00",
          "900.00",
          "1,062.00"
        ],
        [
          "CONTAINER CLEANING FEE",
          "INR",
          "1",
          "1,000.00",
          "1,000.00",
          "1,000.00"
        ],
        [
          "I/U GST 18%",
          "INR",
          "1",
          "576.00",
          "576.00",
          "576.00"
        ]
      ],
      "containerNote": "TTNU0712894 · 40' FLAT · GENERAL CARGO · 3 PACKAGES",
      "totalLabel": "Total : INR"
    },
    "blocks": [
      {
        "type": "companyHeader"
      },
      {
        "type": "docTitle",
        "text": "INVOICE / DEBIT NOTE",
        "align": "center"
      },
      {
        "type": "twoColumn",
        "showBillTo": true,
        "showCreditTerm": true
      },
      {
        "type": "fieldGrid",
        "cols": 2
      },
      {
        "type": "chargeTable",
        "headerColor": "fill"
      },
      {
        "type": "wordsAndTotal"
      },
      {
        "type": "containerNote"
      },
      {
        "type": "termsBank"
      },
      {
        "type": "colorfulFooter"
      }
    ]
  },
  {
    "code": "INVOICE_REPORT_FORMAT_47",
    "formatNumber": 47,
    "name": "Invoice Report Format-47 Standard Invoice Kampala",
    "paper": "A4",
    "rtl": false,
    "theme": {
      "primary": "#000000",
      "accent": "#0F4D96",
      "fill": "#F3F3F3",
      "panel": "#EBF0F4",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#9AD7FF",
      "ink": "#101010",
      "gray": "#656565",
      "white": "#FFFFFF"
    },
    "branding": {
      "company": "KingFisher Logistic",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "info@kingfisherwingsgroup.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "BOMINV230500382",
      "invoiceDate": "17-MAY-23",
      "dueDate": "24-MAY-23",
      "billToLabel": "Client",
      "billToName": "DEMO LOGISTICS INDIA PVT LTD",
      "billToAddress": "21, PORT BLAIR, KRISHNA ST, MANNARGUDI, TAMIL NADU, INDIA, 676876",
      "billToPhone": "798798798",
      "fax": "9879878",
      "vatNo": "68768978898098",
      "billToGstin": "888329087642356",
      "creditTerm": "CASH",
      "currency": "INR",
      "words": "Rupee Four Thousand Two Hundred Only",
      "subtotal": "4,200.00",
      "tax": "576.00",
      "total": "4,200.00",
      "narration": "MBL NO... / HBL NO. NSAJED85630124277 / JOB NO.",
      "officeAddressLines": [
        "MUMBAI",
        "406, 4TH FLOOR, D-21 CORPORATE PARK, SECTOR 21,, MUMBAI, Pincode : 400001"
      ],
      "taxAmountLines": [
        "GST18",
        "GST 15%"
      ],
      "metaRows": [
        {
          "k": "Invoice No.",
          "v": "BOMINV230500382"
        },
        {
          "k": "Date",
          "v": "17-MAY-23 (POSTED)"
        },
        {
          "k": "TRN NO",
          "v": "100617975600003"
        }
      ],
      "termsLines": [
        "1. Payment to be made by cash. The company is not responsible for any cash settlement without an official receipt."
      ],
      "bankLines": [
        "Beneficiary Name: KingFisher Logistic",
        "Bank : HDFC",
        "A/c No : XXXXXXXXXXX",
        "IBAN Code : ABA:XXXXXX",
        "Swift Code : XXXXXX",
        "Address : Dubai, United Arab Emirates"
      ],
      "osTableHeaders": [
        "Date",
        "Voucher No",
        "Narration",
        "Currency",
        "FCY Amount",
        "O/S FCY Amount",
        "Aging"
      ],
      "osTableRows": [
        [
          "16-MAY-23",
          "BOMINV230500371",
          "MBL NO... / HBL NO. 6676687 / JOB NO.CBOMEXP230764",
          "INR",
          "944.00",
          "944.00",
          "1"
        ]
      ],
      "agingHeaders": [
        "Currency",
        "Total O/S",
        "< 30",
        "30 - 60",
        "60 - 90",
        "90 - 120",
        "120 - 150",
        "150 - 180",
        "180+"
      ],
      "agingRow": [
        "INR",
        "944.00",
        "944.00",
        "",
        "",
        "",
        "",
        "",
        ""
      ],
      "trnNo": "100617975600003",
      "fieldGrid": [
        {
          "k": "Shipper",
          "v": "DEMO-SHIPPER ENGG COMPANY"
        },
        {
          "k": "Consignee",
          "v": "DEMO STEEL FACTORY CO. LTD."
        },
        {
          "k": "Shipment No.",
          "v": "BOM/EXP/23/05/B/0709"
        },
        {
          "k": "Place of Receipt",
          "v": "INMAA-CHENNAI"
        },
        {
          "k": "Port of Loading",
          "v": "NHAVA SHEVA, INDIA"
        },
        {
          "k": "Port of Discharge",
          "v": "JEDDAH, SAUDI ARABIA"
        },
        {
          "k": "Place of Delivery",
          "v": "JEDDAH SAUDI ARABIA"
        },
        {
          "k": "ETD",
          "v": "01-MAR-23"
        },
        {
          "k": "ETA",
          "v": "20-MAR-23"
        },
        {
          "k": "Narration",
          "v": "MBL NO... / HBL NO. NSAJED85630124277 / JOB NO."
        }
      ],
      "tableHeaders": [
        "Charges",
        "Unit",
        "Qty",
        "Amount / Qty",
        "Currency",
        "Ex.Rate",
        "Currency Amount",
        "Amount (INR)"
      ],
      "tableRows": [
        [
          "FREIGHT CHARGE",
          "1 TON OR 1/2 MEASURE",
          "1",
          "1,500.00",
          "INR",
          "1.000000",
          "1,500.00",
          "1,500.00"
        ],
        [
          "LOCAL CHARGES",
          "—",
          "1",
          "800.00",
          "INR",
          "1.000000",
          "800.00",
          "800.00"
        ],
        [
          "SEA FREIGHT CHARGE",
          "1 TON OR 1/2 MEASURE",
          "1",
          "900.00",
          "INR",
          "1.000000",
          "900.00",
          "900.00"
        ],
        [
          "CONTAINER CLEANING FEE",
          "1 TON OR 1/2 MEASURE",
          "1",
          "1,000.00",
          "INR",
          "1.000000",
          "1,000.00",
          "1,000.00"
        ]
      ],
      "containerNote": "TTNU0712894 · 40' FLAT · 3 pcs · 22,700.00"
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "officeAddressBand"
      },
      {
        "type": "docTitle",
        "text": "TAX INVOICE - BOMINV230500382",
        "align": "center"
      },
      {
        "type": "twoColumn",
        "showBillTo": true
      },
      {
        "type": "fieldGrid",
        "cols": 2
      },
      {
        "type": "chargeTable",
        "headerColor": "fill"
      },
      {
        "type": "wordsAndTotal"
      },
      {
        "type": "containerNote"
      },
      {
        "type": "termsBank"
      },
      {
        "type": "colorfulFooter"
      }
    ]
  },
  {
    "code": "INVOICE_REPORT_FORMAT_48",
    "formatNumber": 48,
    "name": "Invoice Report Format-48 Standard Invoice USA",
    "paper": "A4",
    "rtl": false,
    "theme": {
      "primary": "#000000",
      "accent": "#0F4D96",
      "fill": "#F3F3F3",
      "panel": "#EBF0F4",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#9AD7FF",
      "ink": "#101010",
      "gray": "#656565",
      "white": "#FFFFFF"
    },
    "branding": {
      "company": "KingFisher Logistic",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "info@kingfisherwingsgroup.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "BOMINV230500382",
      "invoiceDate": "17-MAY-23",
      "dueDate": "24-MAY-23",
      "billToLabel": "Bill To",
      "billToName": "DEMO LOGISTICS INDIA PVT LTD",
      "billToAddress": "21, PORT BLAIR, KRISHNA ST, MANNARGUDI, TAMIL NADU, INDIA, 676876",
      "billToPhone": "798798798",
      "fax": "9879878",
      "vatNo": "68768978898098",
      "billToGstin": "888329087642356",
      "creditTerm": "CASH",
      "currency": "INR",
      "words": "Rupee Four Thousand Two Hundred Only",
      "subtotal": "4,200.00",
      "tax": "576.00",
      "total": "4,200.00",
      "narration": "MBL NO... / HBL NO. NSAJED85630124277 / JOB NO.",
      "officeAddressLines": [
        "MUMBAI",
        "406, 4TH FLOOR, D-21 CORPORATE PARK, SECTOR 21,, MUMBAI, Pincode : 400001"
      ],
      "taxAmountLines": [
        "GST18",
        "GST 15%"
      ],
      "metaRows": [
        {
          "k": "INVOICE#",
          "v": "BOMINV230500382"
        },
        {
          "k": "Date",
          "v": "17-MAY-23 (POSTED)"
        }
      ],
      "termsLines": [
        "1. Payment to be made by cash. The company is not responsible for any cash settlement without an official receipt."
      ],
      "bankLines": [
        "Beneficiary Name: KingFisher Logistic",
        "Bank : HDFC",
        "A/c No : XXXXXXXXXXX",
        "IBAN Code : ABA:XXXXXX",
        "Swift Code : XXXXXX",
        "Address : Dubai, United Arab Emirates"
      ],
      "osTableHeaders": [
        "Date",
        "Voucher No",
        "Narration",
        "Currency",
        "FCY Amount",
        "O/S FCY Amount",
        "Aging"
      ],
      "osTableRows": [
        [
          "16-MAY-23",
          "BOMINV230500371",
          "MBL NO... / HBL NO. 6676687 / JOB NO.CBOMEXP230764",
          "INR",
          "944.00",
          "944.00",
          "1"
        ]
      ],
      "agingHeaders": [
        "Currency",
        "Total O/S",
        "< 30",
        "30 - 60",
        "60 - 90",
        "90 - 120",
        "120 - 150",
        "150 - 180",
        "180+"
      ],
      "agingRow": [
        "INR",
        "944.00",
        "944.00",
        "",
        "",
        "",
        "",
        "",
        ""
      ],
      "fieldGrid": [
        {
          "k": "Shipper",
          "v": "DEMO-SHIPPER ENGG COMPANY"
        },
        {
          "k": "Consignee",
          "v": "DEMO STEEL FACTORY CO. LTD."
        },
        {
          "k": "Origin",
          "v": "NHAVA SHEVA, INDIA"
        },
        {
          "k": "Destination",
          "v": "JEDDAH, SAUDI ARABIA"
        },
        {
          "k": "ETD / ETA",
          "v": "01-MAR-23 / 20-MAR-23"
        },
        {
          "k": "HBL",
          "v": "NSAJED85630124277"
        }
      ],
      "tableHeaders": [
        "Charges",
        "Qty",
        "Amount / Qty",
        "Total Amount (INR)"
      ],
      "tableRows": [
        [
          "FREIGHT CHARGE",
          "1",
          "1,500.00",
          "1,500.00"
        ],
        [
          "LOCAL CHARGES",
          "1",
          "800.00",
          "800.00"
        ],
        [
          "SEA FREIGHT CHARGE",
          "1",
          "900.00",
          "900.00"
        ],
        [
          "CONTAINER CLEANING FEE",
          "1",
          "1,000.00",
          "1,000.00"
        ]
      ]
    },
    "blocks": [
      {
        "type": "companyHeader"
      },
      {
        "type": "docTitle",
        "text": "INVOICE",
        "align": "center"
      },
      {
        "type": "twoColumn",
        "showBillTo": true
      },
      {
        "type": "fieldGrid",
        "cols": 2
      },
      {
        "type": "chargeTable",
        "headerColor": "fill"
      },
      {
        "type": "wordsAndTotal"
      },
      {
        "type": "termsBank"
      },
      {
        "type": "colorfulFooter"
      }
    ]
  },
  {
    "code": "INVOICE_REPORT_FORMAT_49",
    "formatNumber": 49,
    "name": "Invoice Report Format-49 Standard Tax Invoice Format-16 Cum AN",
    "paper": "A4",
    "rtl": false,
    "theme": {
      "primary": "#000000",
      "accent": "#0F4D96",
      "fill": "#F3F3F3",
      "panel": "#EBF0F4",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#9AD7FF",
      "ink": "#101010",
      "gray": "#656565",
      "white": "#FFFFFF"
    },
    "branding": {
      "company": "KingFisher Logistic",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "info@kingfisherwingsgroup.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "BOMINV230500382",
      "invoiceDate": "17-MAY-23",
      "dueDate": "24-MAY-23",
      "billToLabel": "Client",
      "billToName": "DEMO LOGISTICS INDIA PVT LTD",
      "billToAddress": "21, PORT BLAIR, KRISHNA ST, MANNARGUDI, TAMIL NADU, INDIA, 676876",
      "billToPhone": "798798798",
      "fax": "9879878",
      "vatNo": "68768978898098",
      "billToGstin": "888329087642356",
      "creditTerm": "CASH",
      "currency": "INR",
      "words": "Rupee Four Thousand Seven Hundred Seventy-Six Only",
      "subtotal": "4,200.00",
      "tax": "576.00",
      "total": "4,776.00",
      "narration": "MBL NO... / HBL NO. NSAJED85630124277 / JOB NO.",
      "officeAddressLines": [
        "MUMBAI",
        "406, 4TH FLOOR, D-21 CORPORATE PARK, SECTOR 21,, MUMBAI, Pincode : 400001"
      ],
      "taxAmountLines": [
        "GST18",
        "GST 15%"
      ],
      "metaRows": [
        {
          "k": "Invoice No.",
          "v": "BOMINV230500382"
        },
        {
          "k": "Date",
          "v": "17-MAY-23 (POSTED)"
        },
        {
          "k": "Variant",
          "v": "Format-16 Cum AN"
        }
      ],
      "termsLines": [
        "1. Payment to be made by cash. The company is not responsible for any cash settlement without an official receipt."
      ],
      "bankLines": [
        "Beneficiary Name: KingFisher Logistic",
        "Bank : HDFC",
        "A/c No : XXXXXXXXXXX",
        "IBAN Code : ABA:XXXXXX",
        "Swift Code : XXXXXX",
        "Address : Dubai, United Arab Emirates"
      ],
      "osTableHeaders": [
        "Date",
        "Voucher No",
        "Narration",
        "Currency",
        "FCY Amount",
        "O/S FCY Amount",
        "Aging"
      ],
      "osTableRows": [
        [
          "16-MAY-23",
          "BOMINV230500371",
          "MBL NO... / HBL NO. 6676687 / JOB NO.CBOMEXP230764",
          "INR",
          "944.00",
          "944.00",
          "1"
        ]
      ],
      "agingHeaders": [
        "Currency",
        "Total O/S",
        "< 30",
        "30 - 60",
        "60 - 90",
        "90 - 120",
        "120 - 150",
        "150 - 180",
        "180+"
      ],
      "agingRow": [
        "INR",
        "944.00",
        "944.00",
        "",
        "",
        "",
        "",
        "",
        ""
      ],
      "fieldGrid": [
        {
          "k": "Shipper",
          "v": "DEMO-SHIPPER ENGG COMPANY"
        },
        {
          "k": "Consignee",
          "v": "DEMO STEEL FACTORY CO. LTD."
        },
        {
          "k": "Port of Loading",
          "v": "NHAVA SHEVA, INDIA"
        },
        {
          "k": "Port of Discharge",
          "v": "JEDDAH, SAUDI ARABIA"
        },
        {
          "k": "ETD",
          "v": "01-MAR-23"
        },
        {
          "k": "ETA",
          "v": "20-MAR-23"
        },
        {
          "k": "HBL",
          "v": "NSAJED85630124277"
        },
        {
          "k": "Narration",
          "v": "MBL NO... / HBL NO. NSAJED85630124277 / JOB NO."
        }
      ],
      "tableHeaders": [
        "Charge",
        "Tax %",
        "Qty",
        "Unit",
        "Cur.",
        "Ex.Rate",
        "Amount / Qty",
        "FCY",
        "Taxable",
        "Tax Amt",
        "Total"
      ],
      "tableRows": [
        [
          "FREIGHT CHARGE",
          "18",
          "1",
          "1 TON OR 1/2 MEASURE",
          "INR",
          "1.000000",
          "1,500.00",
          "1,500.00",
          "1,500.00",
          "270.00",
          "1,770.00"
        ],
        [
          "LOCAL CHARGES",
          "18",
          "1",
          "—",
          "INR",
          "1.000000",
          "800.00",
          "800.00",
          "800.00",
          "144.00",
          "944.00"
        ],
        [
          "SEA FREIGHT CHARGE",
          "18",
          "1",
          "1 TON OR 1/2 MEASURE",
          "INR",
          "1.000000",
          "900.00",
          "900.00",
          "900.00",
          "162.00",
          "1,062.00"
        ],
        [
          "CONTAINER CLEANING FEE",
          "15",
          "1",
          "1 TON OR 1/2 MEASURE",
          "INR",
          "1.000000",
          "1,000.00",
          "1,000.00",
          "1,000.00",
          "",
          "1,000.00"
        ]
      ]
    },
    "blocks": [
      {
        "type": "companyHeader"
      },
      {
        "type": "docTitle",
        "text": "TAX INVOICE - BOMINV230500382",
        "align": "center"
      },
      {
        "type": "twoColumn",
        "showBillTo": true
      },
      {
        "type": "fieldGrid",
        "cols": 2
      },
      {
        "type": "chargeTable",
        "headerColor": "fill"
      },
      {
        "type": "wordsAndTotal"
      },
      {
        "type": "termsBank"
      },
      {
        "type": "colorfulFooter"
      }
    ]
  },
  {
    "code": "INVOICE_REPORT_FORMAT_50",
    "formatNumber": 50,
    "name": "Invoice Report Format-50 Standard Invoice Malaysia",
    "paper": "A4",
    "rtl": false,
    "theme": {
      "primary": "#000000",
      "accent": "#0F4D96",
      "fill": "#F3F3F3",
      "panel": "#EBF0F4",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#9AD7FF",
      "ink": "#101010",
      "gray": "#656565",
      "white": "#FFFFFF"
    },
    "branding": {
      "company": "KingFisher Logistic",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "info@kingfisherwingsgroup.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "BOMINV230500382",
      "invoiceDate": "17-MAY-23",
      "dueDate": "24-MAY-23",
      "billToLabel": "Client",
      "billToName": "DEMO LOGISTICS INDIA PVT LTD",
      "billToAddress": "21, PORT BLAIR, KRISHNA ST, MANNARGUDI, TAMIL NADU, INDIA, 676876",
      "billToPhone": "798798798",
      "fax": "9879878",
      "vatNo": "68768978898098",
      "billToGstin": "888329087642356",
      "creditTerm": "CASH",
      "currency": "INR",
      "words": "Rupee Four Thousand Two Hundred Only",
      "subtotal": "4,200.00",
      "tax": "576.00",
      "total": "4,200.00",
      "narration": "MBL NO... / HBL NO. NSAJED85630124277 / JOB NO.",
      "officeAddressLines": [
        "MUMBAI",
        "406, 4TH FLOOR, D-21 CORPORATE PARK, SECTOR 21,, MUMBAI, Pincode : 400001"
      ],
      "taxAmountLines": [
        "GST18",
        "GST 15%"
      ],
      "metaRows": [
        {
          "k": "Invoice No.",
          "v": "BOMINV230500382"
        },
        {
          "k": "Date",
          "v": "17-MAY-23 (POSTED)"
        },
        {
          "k": "Region",
          "v": "Malaysia"
        }
      ],
      "termsLines": [
        "1. Payment to be made by cash. The company is not responsible for any cash settlement without an official receipt."
      ],
      "bankLines": [
        "Beneficiary Name: KingFisher Logistic",
        "Bank : HDFC",
        "A/c No : XXXXXXXXXXX",
        "IBAN Code : ABA:XXXXXX",
        "Swift Code : XXXXXX",
        "Address : Dubai, United Arab Emirates"
      ],
      "osTableHeaders": [
        "Date",
        "Voucher No",
        "Narration",
        "Currency",
        "FCY Amount",
        "O/S FCY Amount",
        "Aging"
      ],
      "osTableRows": [
        [
          "16-MAY-23",
          "BOMINV230500371",
          "MBL NO... / HBL NO. 6676687 / JOB NO.CBOMEXP230764",
          "INR",
          "944.00",
          "944.00",
          "1"
        ]
      ],
      "agingHeaders": [
        "Currency",
        "Total O/S",
        "< 30",
        "30 - 60",
        "60 - 90",
        "90 - 120",
        "120 - 150",
        "150 - 180",
        "180+"
      ],
      "agingRow": [
        "INR",
        "944.00",
        "944.00",
        "",
        "",
        "",
        "",
        "",
        ""
      ],
      "fieldGrid": [
        {
          "k": "Shipper",
          "v": "DEMO-SHIPPER ENGG COMPANY"
        },
        {
          "k": "Consignee",
          "v": "DEMO STEEL FACTORY CO. LTD."
        },
        {
          "k": "Place of Receipt",
          "v": "INMAA-CHENNAI"
        },
        {
          "k": "Port of Loading",
          "v": "NHAVA SHEVA, INDIA"
        },
        {
          "k": "Port of Discharge",
          "v": "JEDDAH, SAUDI ARABIA"
        },
        {
          "k": "Place of Delivery",
          "v": "JEDDAH SAUDI ARABIA"
        },
        {
          "k": "ETD",
          "v": "01-MAR-23"
        },
        {
          "k": "ETA",
          "v": "20-MAR-23"
        }
      ],
      "tableHeaders": [
        "Charges",
        "Unit",
        "Qty",
        "Amount / Qty",
        "Currency",
        "FCY Amount",
        "Taxable",
        "Tax %",
        "Tax Amount",
        "Total"
      ],
      "tableRows": [
        [
          "FREIGHT CHARGE",
          "1 TON OR 1/2 MEASURE",
          "1",
          "1,500.00",
          "INR",
          "1,500.00",
          "1,500.00",
          "18",
          "",
          "1,500.00"
        ],
        [
          "LOCAL CHARGES",
          "—",
          "1",
          "800.00",
          "INR",
          "800.00",
          "800.00",
          "18",
          "",
          "800.00"
        ],
        [
          "SEA FREIGHT CHARGE",
          "1 TON OR 1/2 MEASURE",
          "1",
          "900.00",
          "INR",
          "900.00",
          "900.00",
          "18",
          "",
          "900.00"
        ],
        [
          "CONTAINER CLEANING FEE",
          "1 TON OR 1/2 MEASURE",
          "1",
          "1,000.00",
          "INR",
          "1,000.00",
          "1,000.00",
          "15",
          "",
          "1,000.00"
        ]
      ]
    },
    "blocks": [
      {
        "type": "companyHeader"
      },
      {
        "type": "docTitle",
        "text": "TAX INVOICE - BOMINV230500382",
        "align": "center"
      },
      {
        "type": "twoColumn",
        "showBillTo": true
      },
      {
        "type": "fieldGrid",
        "cols": 2
      },
      {
        "type": "chargeTable",
        "headerColor": "fill"
      },
      {
        "type": "wordsAndTotal"
      },
      {
        "type": "termsBank"
      },
      {
        "type": "colorfulFooter"
      }
    ]
  },
  {
    "code": "INVOICE_REPORT_FORMAT_51",
    "formatNumber": 51,
    "name": "Invoice Report Format-51 Standard Invoice USA Format-2",
    "paper": "A4",
    "rtl": false,
    "theme": {
      "primary": "#000000",
      "accent": "#0F4D96",
      "fill": "#F3F3F3",
      "panel": "#EBF0F4",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#9AD7FF",
      "ink": "#101010",
      "gray": "#656565",
      "white": "#FFFFFF"
    },
    "branding": {
      "company": "KingFisher Logistic",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "info@kingfisherwingsgroup.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "BOMINV230500382",
      "invoiceDate": "17-MAY-23",
      "dueDate": "24-MAY-23",
      "billToLabel": "Bill To",
      "billToName": "DEMO LOGISTICS INDIA PVT LTD",
      "billToAddress": "21, PORT BLAIR, KRISHNA ST, MANNARGUDI, TAMIL NADU, INDIA, 676876",
      "billToPhone": "798798798",
      "fax": "9879878",
      "vatNo": "68768978898098",
      "billToGstin": "888329087642356",
      "creditTerm": "CASH",
      "currency": "INR",
      "words": "Rupee Four Thousand Two Hundred Only",
      "subtotal": "4,200.00",
      "tax": "576.00",
      "total": "4,200.00",
      "narration": "MBL NO... / HBL NO. NSAJED85630124277 / JOB NO.",
      "officeAddressLines": [
        "MUMBAI",
        "406, 4TH FLOOR, D-21 CORPORATE PARK, SECTOR 21,, MUMBAI, Pincode : 400001"
      ],
      "taxAmountLines": [
        "GST18",
        "GST 15%"
      ],
      "metaRows": [
        {
          "k": "Invoice No.",
          "v": "BOMINV230500382"
        },
        {
          "k": "Date",
          "v": "17-MAY-23 (POSTED)"
        }
      ],
      "termsLines": [
        "1. Payment to be made by cash. The company is not responsible for any cash settlement without an official receipt."
      ],
      "bankLines": [
        "Beneficiary Name: KingFisher Logistic",
        "Bank : HDFC",
        "A/c No : XXXXXXXXXXX",
        "IBAN Code : ABA:XXXXXX",
        "Swift Code : XXXXXX",
        "Address : Dubai, United Arab Emirates"
      ],
      "osTableHeaders": [
        "Date",
        "Voucher No",
        "Narration",
        "Currency",
        "FCY Amount",
        "O/S FCY Amount",
        "Aging"
      ],
      "osTableRows": [
        [
          "16-MAY-23",
          "BOMINV230500371",
          "MBL NO... / HBL NO. 6676687 / JOB NO.CBOMEXP230764",
          "INR",
          "944.00",
          "944.00",
          "1"
        ]
      ],
      "agingHeaders": [
        "Currency",
        "Total O/S",
        "< 30",
        "30 - 60",
        "60 - 90",
        "90 - 120",
        "120 - 150",
        "150 - 180",
        "180+"
      ],
      "agingRow": [
        "INR",
        "944.00",
        "944.00",
        "",
        "",
        "",
        "",
        "",
        ""
      ],
      "fieldGrid": [
        {
          "k": "Shipper",
          "v": "DEMO-SHIPPER ENGG COMPANY"
        },
        {
          "k": "Consignee",
          "v": "DEMO STEEL FACTORY CO. LTD."
        },
        {
          "k": "Port of Loading",
          "v": "NHAVA SHEVA, INDIA"
        },
        {
          "k": "Port of Discharge",
          "v": "JEDDAH, SAUDI ARABIA"
        },
        {
          "k": "ETD",
          "v": "01-MAR-23"
        },
        {
          "k": "ETA",
          "v": "20-MAR-23"
        },
        {
          "k": "HBL",
          "v": "NSAJED85630124277"
        },
        {
          "k": "Vessel / Voyage",
          "v": "CAP SAN JUAN / 310W"
        }
      ],
      "tableHeaders": [
        "Charges",
        "Unit",
        "Qty",
        "Amount / Qty",
        "Total Amount (INR)"
      ],
      "tableRows": [
        [
          "FREIGHT CHARGE",
          "1 TON OR 1/2 MEASURE",
          "1",
          "1,500.00",
          "1,500.00"
        ],
        [
          "LOCAL CHARGES",
          "—",
          "1",
          "800.00",
          "800.00"
        ],
        [
          "SEA FREIGHT CHARGE",
          "1 TON OR 1/2 MEASURE",
          "1",
          "900.00",
          "900.00"
        ],
        [
          "CONTAINER CLEANING FEE",
          "1 TON OR 1/2 MEASURE",
          "1",
          "1,000.00",
          "1,000.00"
        ]
      ]
    },
    "blocks": [
      {
        "type": "companyHeader"
      },
      {
        "type": "docTitle",
        "text": "INVOICE - BOMINV230500382",
        "align": "center"
      },
      {
        "type": "twoColumn",
        "showBillTo": true
      },
      {
        "type": "fieldGrid",
        "cols": 2
      },
      {
        "type": "chargeTable",
        "headerColor": "fill"
      },
      {
        "type": "wordsAndTotal"
      },
      {
        "type": "termsBank"
      },
      {
        "type": "colorfulFooter"
      }
    ]
  },
  {
    "code": "INVOICE_REPORT_FORMAT_52",
    "formatNumber": 52,
    "name": "Invoice Report Format-52 Standard Tax Invoice",
    "paper": "A4",
    "rtl": false,
    "theme": {
      "primary": "#000000",
      "accent": "#0F4D96",
      "fill": "#F3F3F3",
      "panel": "#EBF0F4",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#9AD7FF",
      "ink": "#101010",
      "gray": "#656565",
      "white": "#FFFFFF"
    },
    "branding": {
      "company": "KingFisher Logistic",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "info@kingfisherwingsgroup.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "BOMINV230500382",
      "invoiceDate": "17-MAY-23",
      "dueDate": "24-MAY-23",
      "billToLabel": "Client",
      "billToName": "DEMO LOGISTICS INDIA PVT LTD",
      "billToAddress": "21, PORT BLAIR, KRISHNA ST, MANNARGUDI, TAMIL NADU, INDIA, 676876",
      "billToPhone": "798798798",
      "fax": "9879878",
      "vatNo": "68768978898098",
      "billToGstin": "888329087642356",
      "creditTerm": "CASH",
      "currency": "INR",
      "words": "Rupee Four Thousand Seven Hundred Seventy-Six Only",
      "subtotal": "4,200.00",
      "tax": "576.00",
      "total": "4,776.00",
      "narration": "MBL NO... / HBL NO. NSAJED85630124277 / JOB NO.",
      "officeAddressLines": [
        "MUMBAI",
        "406, 4TH FLOOR, D-21 CORPORATE PARK, SECTOR 21,, MUMBAI, Pincode : 400001"
      ],
      "taxAmountLines": [
        "GST18",
        "GST 15%"
      ],
      "metaRows": [
        {
          "k": "Invoice No.",
          "v": "BOMINV230500382"
        },
        {
          "k": "Date",
          "v": "17-MAY-23 (POSTED)"
        },
        {
          "k": "Total No. of Pcs",
          "v": "3.00"
        },
        {
          "k": "G.Weight",
          "v": "22,700.00"
        },
        {
          "k": "V.Weight",
          "v": "22,700.00"
        }
      ],
      "termsLines": [
        "1. Payment to be made by cash. The company is not responsible for any cash settlement without an official receipt."
      ],
      "bankLines": [
        "Beneficiary Name: KingFisher Logistic",
        "Bank : HDFC",
        "A/c No : XXXXXXXXXXX",
        "IBAN Code : ABA:XXXXXX",
        "Swift Code : XXXXXX",
        "Address : Dubai, United Arab Emirates"
      ],
      "osTableHeaders": [
        "Date",
        "Voucher No",
        "Narration",
        "Currency",
        "FCY Amount",
        "O/S FCY Amount",
        "Aging"
      ],
      "osTableRows": [
        [
          "16-MAY-23",
          "BOMINV230500371",
          "MBL NO... / HBL NO. 6676687 / JOB NO.CBOMEXP230764",
          "INR",
          "944.00",
          "944.00",
          "1"
        ]
      ],
      "agingHeaders": [
        "Currency",
        "Total O/S",
        "< 30",
        "30 - 60",
        "60 - 90",
        "90 - 120",
        "120 - 150",
        "150 - 180",
        "180+"
      ],
      "agingRow": [
        "INR",
        "944.00",
        "944.00",
        "",
        "",
        "",
        "",
        "",
        ""
      ],
      "fieldGrid": [
        {
          "k": "Shipper",
          "v": "DEMO-SHIPPER ENGG COMPANY"
        },
        {
          "k": "Consignee",
          "v": "DEMO STEEL FACTORY CO. LTD."
        },
        {
          "k": "Origin",
          "v": "NHAVA SHEVA, INDIA"
        },
        {
          "k": "Destination",
          "v": "JEDDAH, SAUDI ARABIA"
        },
        {
          "k": "ETD",
          "v": "01-MAR-23"
        },
        {
          "k": "ETA",
          "v": "20-MAR-23"
        },
        {
          "k": "HBL",
          "v": "NSAJED85630124277"
        }
      ],
      "tableHeaders": [
        "Charge",
        "Qty",
        "Cur.",
        "Ex.Rate",
        "Amount / Qty",
        "Tax %",
        "FCY Amount",
        "VAT Amount (INR)"
      ],
      "tableRows": [
        [
          "FREIGHT CHARGE",
          "1",
          "INR",
          "1.000000",
          "1,500.00",
          "18",
          "1,500.00",
          "1,500.00"
        ],
        [
          "LOCAL CHARGES",
          "1",
          "INR",
          "1.000000",
          "800.00",
          "18",
          "800.00",
          "800.00"
        ],
        [
          "SEA FREIGHT CHARGE",
          "1",
          "INR",
          "1.000000",
          "900.00",
          "18",
          "900.00",
          "900.00"
        ],
        [
          "CONTAINER CLEANING FEE",
          "1",
          "INR",
          "1.000000",
          "1,000.00",
          "15",
          "1,000.00",
          "1,000.00"
        ]
      ],
      "subtotalParts": [
        "4,200.00",
        "576.00",
        "4,776.00"
      ],
      "totalLabel": "Total : INR"
    },
    "blocks": [
      {
        "type": "companyHeader"
      },
      {
        "type": "docTitle",
        "text": "TAX INVOICE",
        "align": "center"
      },
      {
        "type": "twoColumn",
        "showBillTo": true
      },
      {
        "type": "fieldGrid",
        "cols": 2
      },
      {
        "type": "chargeTable",
        "headerColor": "fill"
      },
      {
        "type": "subtotalBar",
        "variant": "tax"
      },
      {
        "type": "wordsAndTotal"
      },
      {
        "type": "termsBank"
      },
      {
        "type": "colorfulFooter"
      }
    ]
  },
  {
    "code": "INVOICE_REPORT_FORMAT_53",
    "formatNumber": 53,
    "name": "Invoice Report Format-53 Summary Invoice",
    "paper": "A4",
    "rtl": false,
    "theme": {
      "primary": "#000000",
      "accent": "#0F4D96",
      "fill": "#F3F3F3",
      "panel": "#EBF0F4",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#9AD7FF",
      "ink": "#101010",
      "gray": "#656565",
      "white": "#FFFFFF"
    },
    "branding": {
      "company": "KingFisher Logistic",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "info@kingfisherwingsgroup.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "BOMINV230500382",
      "invoiceDate": "17-MAY-23",
      "dueDate": "24-MAY-23",
      "billToLabel": "Bill To",
      "billToName": "DEMO LOGISTICS INDIA PVT LTD",
      "billToAddress": "21, PORT BLAIR, KRISHNA ST, MANNARGUDI, TAMIL NADU, INDIA, 676876",
      "billToPhone": "798798798",
      "fax": "9879878",
      "vatNo": "68768978898098",
      "billToGstin": "888329087642356",
      "creditTerm": "CASH",
      "currency": "INR",
      "words": "Rupee Four Thousand Seven Hundred Seventy-Six Only",
      "subtotal": "4,200.00",
      "tax": "576.00",
      "total": "4,776.00",
      "narration": "MBL NO... / HBL NO. NSAJED85630124277 / JOB NO.",
      "officeAddressLines": [
        "Collection Branch Address",
        "MUMBAI,",
        "406, 4TH FLOOR, D-21 CORPORATE PARK, SECTOR 21,, MUMBAI,",
        "Pincode : 400001"
      ],
      "taxAmountLines": [
        "GST18",
        "GST 15%"
      ],
      "metaRows": [
        {
          "k": "Invoice No.",
          "v": "BOMINV230500382 / 17-MAY-23 (POSTED)"
        },
        {
          "k": "Credit Term",
          "v": "CASH"
        },
        {
          "k": "TRN No",
          "v": "888329087642356"
        },
        {
          "k": "VAT No.",
          "v": "68768978898098"
        }
      ],
      "termsLines": [
        "1. Payment to be made by cash. The company is not responsible for any cash settlement without an official receipt."
      ],
      "bankLines": [
        "Beneficiary Name: KingFisher Logistic",
        "Bank : HDFC",
        "A/c No : XXXXXXXXXXX",
        "IBAN Code : ABA:XXXXXX",
        "Swift Code : XXXXXX",
        "Address : Dubai, United Arab Emirates"
      ],
      "osTableHeaders": [
        "Date",
        "Voucher No",
        "Narration",
        "Currency",
        "FCY Amount",
        "O/S FCY Amount",
        "Aging"
      ],
      "osTableRows": [
        [
          "16-MAY-23",
          "BOMINV230500371",
          "MBL NO... / HBL NO. 6676687 / JOB NO.CBOMEXP230764",
          "INR",
          "944.00",
          "944.00",
          "1"
        ]
      ],
      "agingHeaders": [
        "Currency",
        "Total O/S",
        "< 30",
        "30 - 60",
        "60 - 90",
        "90 - 120",
        "120 - 150",
        "150 - 180",
        "180+"
      ],
      "agingRow": [
        "INR",
        "944.00",
        "944.00",
        "",
        "",
        "",
        "",
        "",
        ""
      ],
      "trnNo": "888329087642356",
      "fieldGrid": [
        {
          "k": "Consignee",
          "v": "DEMO STEEL FACTORY CO. LTD."
        },
        {
          "k": "Shipper",
          "v": "DEMO-SHIPPER ENGG COMPANY"
        },
        {
          "k": "Shipment No.",
          "v": "BOM/EXP/23/05/B/0709 / 16-MAY-23"
        },
        {
          "k": "Job No.",
          "v": "—"
        },
        {
          "k": "MBL / MAWB No.",
          "v": "—"
        },
        {
          "k": "Place of Receipt",
          "v": "INMAA-CHENNAI"
        },
        {
          "k": "Port of Loading",
          "v": "NHAVA SHEVA, INDIA"
        },
        {
          "k": "Port of Discharge",
          "v": "JEDDAH, SAUDI ARABIA"
        },
        {
          "k": "Vessel / Flight Name",
          "v": "—"
        },
        {
          "k": "Place of Delivery",
          "v": "JEDDAH SAUDI ARABIA"
        },
        {
          "k": "Voyage / Flight No",
          "v": "—"
        },
        {
          "k": "ETD",
          "v": "01-MAR-23"
        },
        {
          "k": "ETA",
          "v": "20-MAR-23"
        },
        {
          "k": "Currency",
          "v": "INR 1.000000"
        },
        {
          "k": "HBL/AWB No.",
          "v": "NSAJED85630124277"
        },
        {
          "k": "BOE No",
          "v": "—"
        },
        {
          "k": "Narration",
          "v": "MBL NO... / HBL NO. NSAJED85630124277 / JOB NO."
        },
        {
          "k": "Reference No.",
          "v": "—"
        }
      ],
      "tableHeaders": [
        "Charges",
        "Currency",
        "Amount (INR)"
      ],
      "tableRows": [
        [
          "LOCAL CHARGES",
          "INR",
          "800.00"
        ],
        [
          "SEA FREIGHT CHARGE",
          "INR",
          "900.00"
        ],
        [
          "FREIGHT CHARGE",
          "INR",
          "1,500.00"
        ],
        [
          "CONTAINER CLEANING FEE",
          "INR",
          "1,000.00"
        ]
      ],
      "containerHeaders": [
        "Container No",
        "Description",
        "Pcs",
        "Weight",
        "Volume Weight"
      ],
      "containerRow": [
        "TTNU0712894",
        "GENERAL CARGO",
        "3.00",
        "22,700.00",
        "22,700.00"
      ],
      "containerNote": "TTNU0712894 · GENERAL CARGO · 3.00 pcs · 22,700.00 · 22,700.00"
    },
    "blocks": [
      {
        "type": "companyHeader"
      },
      {
        "type": "officeAddressBand"
      },
      {
        "type": "docTitle",
        "text": "TAX INVOICE - BOMINV230500382",
        "align": "center"
      },
      {
        "type": "twoColumn",
        "showBillTo": true,
        "showCreditTerm": true
      },
      {
        "type": "taxAmountBox"
      },
      {
        "type": "fieldGrid",
        "cols": 2
      },
      {
        "type": "chargeTable",
        "headerColor": "fill"
      },
      {
        "type": "wordsAndTotal"
      },
      {
        "type": "containerNote"
      },
      {
        "type": "termsBank"
      },
      {
        "type": "colorfulFooter"
      }
    ]
  },
  {
    "code": "INVOICE_REPORT_FORMAT_54",
    "formatNumber": 54,
    "name": "Invoice Report Format-54 Tax Invoice India",
    "paper": "A4",
    "rtl": false,
    "theme": {
      "primary": "#000000",
      "accent": "#0F4D96",
      "fill": "#F3F3F3",
      "panel": "#EBF0F4",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#9AD7FF",
      "ink": "#101010",
      "gray": "#656565",
      "white": "#FFFFFF"
    },
    "branding": {
      "company": "KingFisher Logistic",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "info@kingfisherwingsgroup.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "BOMINV230500382",
      "invoiceDate": "17-MAY-23",
      "dueDate": "24-MAY-23",
      "billToLabel": "Bill To",
      "billToName": "DEMO LOGISTICS INDIA PVT LTD",
      "billToAddress": "21, PORT BLAIR, KRISHNA ST, MANNARGUDI, TAMIL NADU, INDIA, 676876",
      "billToPhone": "798798798",
      "fax": "9879878",
      "vatNo": "68768978898098",
      "billToGstin": "888329087642356",
      "creditTerm": "CASH",
      "currency": "INR",
      "words": "Rupee Four Thousand Seven Hundred Seventy-Six Only",
      "subtotal": "4,200.00",
      "tax": "576.00",
      "total": "4,776.00",
      "narration": "MBL NO... / HBL NO. NSAJED85630124277 / JOB NO.",
      "officeAddressLines": [
        "MUMBAI",
        "406, 4TH FLOOR, D-21 CORPORATE PARK, SECTOR 21,, MUMBAI, Pincode : 400001"
      ],
      "taxAmountLines": [
        "GST18-I/U GST18% 576.00"
      ],
      "metaRows": [
        {
          "k": "Invoice No.",
          "v": "BOMINV230500382 / 17-MAY-23 (POSTED)"
        },
        {
          "k": "Credit Term",
          "v": "CASH"
        },
        {
          "k": "GST NO",
          "v": "100617975600003"
        },
        {
          "k": "Variant",
          "v": "Tax Invoice India"
        }
      ],
      "termsLines": [
        "1. Payment to be made by cash. The company is not responsible for any cash settlement without an official receipt."
      ],
      "bankLines": [
        "Beneficiary Name: KingFisher Logistic",
        "Bank : HDFC",
        "A/c No : XXXXXXXXXXX",
        "IBAN Code : ABA:XXXXXX",
        "Swift Code : XXXXXX",
        "Address : Dubai, United Arab Emirates"
      ],
      "osTableHeaders": [
        "Date",
        "Voucher No",
        "Narration",
        "Currency",
        "FCY Amount",
        "O/S FCY Amount",
        "Aging"
      ],
      "osTableRows": [
        [
          "16-MAY-23",
          "BOMINV230500371",
          "MBL NO... / HBL NO. 6676687 / JOB NO.CBOMEXP230764",
          "INR",
          "944.00",
          "944.00",
          "1"
        ]
      ],
      "agingHeaders": [
        "Currency",
        "Total O/S",
        "< 30",
        "30 - 60",
        "60 - 90",
        "90 - 120",
        "120 - 150",
        "150 - 180",
        "180+"
      ],
      "agingRow": [
        "INR",
        "944.00",
        "944.00",
        "",
        "",
        "",
        "",
        "",
        ""
      ],
      "trnNo": "100617975600003",
      "docSubtitle": "Tax Invoice India",
      "gstNo": "100617975600003",
      "fieldGrid": [
        {
          "k": "Shipper",
          "v": "DEMO-SHIPPER ENGG COMPANY"
        },
        {
          "k": "Consignee",
          "v": "DEMO STEEL FACTORY CO. LTD."
        },
        {
          "k": "Shipment No.",
          "v": "BOM/EXP/23/05/B/0709 / 16-MAY-23"
        },
        {
          "k": "HBL / HAWB No.",
          "v": "NSAJED85630124277"
        },
        {
          "k": "Place of Receipt",
          "v": "INMAA-CHENNAI"
        },
        {
          "k": "Port of Loading",
          "v": "NHAVA SHEVA, INDIA"
        },
        {
          "k": "Port of Discharge",
          "v": "JEDDAH, SAUDI ARABIA"
        },
        {
          "k": "Place of Delivery",
          "v": "JEDDAH SAUDI ARABIA"
        },
        {
          "k": "ETD",
          "v": "01-MAR-23"
        },
        {
          "k": "ETA",
          "v": "20-MAR-23"
        },
        {
          "k": "Currency",
          "v": "INR 1.000000"
        },
        {
          "k": "INCO Terms",
          "v": "FOB"
        },
        {
          "k": "Narration",
          "v": "MBL NO... / HBL NO. NSAJED85630124277 / JOB NO."
        }
      ],
      "tableHeaders": [
        "Charges",
        "SAC Code",
        "Qty",
        "Amount / Qty",
        "Currency",
        "Ex.Rate",
        "FCY Amount",
        "Taxable Amount",
        "Non Taxable",
        "SGST %",
        "SGST",
        "CGST %",
        "CGST",
        "I/UGST %",
        "I/UGST",
        "Total Amount (INR)"
      ],
      "tableRows": [
        [
          "FREIGHT CHARGE",
          "",
          "1",
          "1,500.00",
          "INR",
          "1.00000",
          "1,500.00",
          "1,500.00",
          "",
          "",
          "",
          "",
          "",
          "18.00",
          "270.00",
          "1,770.00"
        ],
        [
          "LOCAL CHARGES",
          "",
          "1",
          "800.00",
          "INR",
          "1.00000",
          "800.00",
          "800.00",
          "",
          "",
          "",
          "",
          "",
          "18.00",
          "144.00",
          "944.00"
        ],
        [
          "SEA FREIGHT CHARGE",
          "",
          "1",
          "900.00",
          "INR",
          "1.00000",
          "900.00",
          "900.00",
          "",
          "",
          "",
          "",
          "",
          "18.00",
          "162.00",
          "1,062.00"
        ],
        [
          "CONTAINER CLEANING FEE",
          "",
          "1",
          "1,000.00",
          "INR",
          "1.00000",
          "1,000.00",
          "1,000.00",
          "",
          "",
          "",
          "",
          "",
          "0.00",
          "0.00",
          "1,000.00"
        ]
      ],
      "gstSummary": [
        {
          "k": "GST18-I/U GST18%",
          "v": "576.00"
        }
      ],
      "containerNote": "TTNU0712894 · 40' FLAT · GENERAL CARGO · 3 PACKAGES · 22,700.000 KGS",
      "subtotalParts": [
        "4,200.00",
        "576.00",
        "4,776.00"
      ]
    },
    "blocks": [
      {
        "type": "companyHeader"
      },
      {
        "type": "docTitle",
        "text": "TAX INVOICE - BOMINV230500382",
        "align": "center"
      },
      {
        "type": "twoColumn",
        "showBillTo": true,
        "showCreditTerm": true
      },
      {
        "type": "taxAmountBox"
      },
      {
        "type": "fieldGrid",
        "cols": 2
      },
      {
        "type": "containerNote"
      },
      {
        "type": "chargeTable",
        "headerColor": "fill"
      },
      {
        "type": "wordsAndTotal"
      },
      {
        "type": "termsBank"
      },
      {
        "type": "colorfulFooter"
      }
    ]
  },
  {
    "code": "INVOICE_REPORT_FORMAT_55",
    "formatNumber": 55,
    "name": "Invoice Report Format-55 Tax Invoice India Reimbursement Bill",
    "paper": "A4",
    "rtl": false,
    "theme": {
      "primary": "#000000",
      "accent": "#0F4D96",
      "fill": "#F3F3F3",
      "panel": "#EBF0F4",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#9AD7FF",
      "ink": "#101010",
      "gray": "#656565",
      "white": "#FFFFFF"
    },
    "branding": {
      "company": "KingFisher Logistic",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "info@kingfisherwingsgroup.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "BOMINV230500382",
      "invoiceDate": "17-MAY-23",
      "dueDate": "24-MAY-23",
      "billToLabel": "Bill To",
      "billToName": "DEMO LOGISTICS INDIA PVT LTD",
      "billToAddress": "21, PORT BLAIR, KRISHNA ST, MANNARGUDI, TAMIL NADU, INDIA, 676876",
      "billToPhone": "798798798",
      "fax": "9879878",
      "vatNo": "68768978898098",
      "billToGstin": "888329087642356",
      "creditTerm": "CASH",
      "currency": "INR",
      "words": "Rupee Four Thousand Seven Hundred Seventy-Six Only",
      "subtotal": "4,200.00",
      "tax": "576.00",
      "total": "4,776.00",
      "narration": "MBL NO... / HBL NO. NSAJED85630124277 / JOB NO.",
      "officeAddressLines": [
        "MUMBAI",
        "406, 4TH FLOOR, D-21 CORPORATE PARK, SECTOR 21,, MUMBAI, Pincode : 400001"
      ],
      "taxAmountLines": [
        "GST18-I/U GST18% 576.00"
      ],
      "metaRows": [
        {
          "k": "Invoice No.",
          "v": "BOMINV230500382 / 17-MAY-23 (POSTED)"
        },
        {
          "k": "Credit Term",
          "v": "CASH"
        },
        {
          "k": "GST NO",
          "v": "100617975600003"
        },
        {
          "k": "Doc Type",
          "v": "Reimbursement Bill"
        }
      ],
      "termsLines": [
        "1. Payment to be made by cash. The company is not responsible for any cash settlement without an official receipt."
      ],
      "bankLines": [
        "Beneficiary Name: KingFisher Logistic",
        "Bank : HDFC",
        "A/c No : XXXXXXXXXXX",
        "IBAN Code : ABA:XXXXXX",
        "Swift Code : XXXXXX",
        "Address : Dubai, United Arab Emirates"
      ],
      "osTableHeaders": [
        "Date",
        "Voucher No",
        "Narration",
        "Currency",
        "FCY Amount",
        "O/S FCY Amount",
        "Aging"
      ],
      "osTableRows": [
        [
          "16-MAY-23",
          "BOMINV230500371",
          "MBL NO... / HBL NO. 6676687 / JOB NO.CBOMEXP230764",
          "INR",
          "944.00",
          "944.00",
          "1"
        ]
      ],
      "agingHeaders": [
        "Currency",
        "Total O/S",
        "< 30",
        "30 - 60",
        "60 - 90",
        "90 - 120",
        "120 - 150",
        "150 - 180",
        "180+"
      ],
      "agingRow": [
        "INR",
        "944.00",
        "944.00",
        "",
        "",
        "",
        "",
        "",
        ""
      ],
      "trnNo": "100617975600003",
      "docSubtitle": "Reimbursement Bill",
      "gstNo": "100617975600003",
      "fieldGrid": [
        {
          "k": "Shipper",
          "v": "DEMO-SHIPPER ENGG COMPANY"
        },
        {
          "k": "Consignee",
          "v": "DEMO STEEL FACTORY CO. LTD."
        },
        {
          "k": "Shipment No.",
          "v": "BOM/EXP/23/05/B/0709 / 16-MAY-23"
        },
        {
          "k": "HBL / HAWB No.",
          "v": "NSAJED85630124277"
        },
        {
          "k": "Place of Receipt",
          "v": "INMAA-CHENNAI"
        },
        {
          "k": "Port of Loading",
          "v": "NHAVA SHEVA, INDIA"
        },
        {
          "k": "Port of Discharge",
          "v": "JEDDAH, SAUDI ARABIA"
        },
        {
          "k": "Place of Delivery",
          "v": "JEDDAH SAUDI ARABIA"
        },
        {
          "k": "ETD",
          "v": "01-MAR-23"
        },
        {
          "k": "ETA",
          "v": "20-MAR-23"
        },
        {
          "k": "Currency",
          "v": "INR 1.000000"
        },
        {
          "k": "INCO Terms",
          "v": "FOB"
        },
        {
          "k": "Narration",
          "v": "MBL NO... / HBL NO. NSAJED85630124277 / JOB NO."
        }
      ],
      "tableHeaders": [
        "Charges",
        "SAC Code",
        "Qty",
        "Amount / Qty",
        "Currency",
        "Ex.Rate",
        "FCY Amount",
        "Taxable Amount",
        "Non Taxable",
        "SGST %",
        "SGST",
        "CGST %",
        "CGST",
        "I/UGST %",
        "I/UGST",
        "Total Amount (INR)"
      ],
      "tableRows": [
        [
          "FREIGHT CHARGE",
          "",
          "1",
          "1,500.00",
          "INR",
          "1.00000",
          "1,500.00",
          "1,500.00",
          "",
          "",
          "",
          "",
          "",
          "18.00",
          "270.00",
          "1,770.00"
        ],
        [
          "LOCAL CHARGES",
          "",
          "1",
          "800.00",
          "INR",
          "1.00000",
          "800.00",
          "800.00",
          "",
          "",
          "",
          "",
          "",
          "18.00",
          "144.00",
          "944.00"
        ],
        [
          "SEA FREIGHT CHARGE",
          "",
          "1",
          "900.00",
          "INR",
          "1.00000",
          "900.00",
          "900.00",
          "",
          "",
          "",
          "",
          "",
          "18.00",
          "162.00",
          "1,062.00"
        ],
        [
          "CONTAINER CLEANING FEE",
          "",
          "1",
          "1,000.00",
          "INR",
          "1.00000",
          "1,000.00",
          "1,000.00",
          "",
          "",
          "",
          "",
          "",
          "0.00",
          "0.00",
          "1,000.00"
        ]
      ],
      "gstSummary": [
        {
          "k": "GST18-I/U GST18%",
          "v": "576.00"
        }
      ],
      "containerNote": "TTNU0712894 · 40' FLAT · GENERAL CARGO · 3 PACKAGES · 22,700.000 KGS",
      "subtotalParts": [
        "4,200.00",
        "576.00",
        "4,776.00"
      ]
    },
    "blocks": [
      {
        "type": "companyHeader"
      },
      {
        "type": "docTitle",
        "text": "REIMBURSEMENT BILL - BOMINV230500382",
        "align": "center"
      },
      {
        "type": "twoColumn",
        "showBillTo": true,
        "showCreditTerm": true
      },
      {
        "type": "taxAmountBox"
      },
      {
        "type": "fieldGrid",
        "cols": 2
      },
      {
        "type": "containerNote"
      },
      {
        "type": "chargeTable",
        "headerColor": "fill"
      },
      {
        "type": "wordsAndTotal"
      },
      {
        "type": "termsBank"
      },
      {
        "type": "colorfulFooter"
      }
    ]
  },
  {
    "code": "INVOICE_REPORT_FORMAT_56",
    "formatNumber": 56,
    "name": "Invoice Report Format-56 FG Tax Invoice India",
    "paper": "A4",
    "rtl": false,
    "theme": {
      "primary": "#000000",
      "accent": "#0F4D96",
      "fill": "#F3F3F3",
      "panel": "#EBF0F4",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#9AD7FF",
      "ink": "#101010",
      "gray": "#656565",
      "white": "#FFFFFF"
    },
    "branding": {
      "company": "KingFisher Logistic",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "info@kingfisherwingsgroup.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "BOMINV230500382",
      "invoiceDate": "17-MAY-23",
      "dueDate": "24-MAY-23",
      "billToLabel": "Client",
      "billToName": "DEMO LOGISTICS INDIA PVT LTD",
      "billToAddress": "21, PORT BLAIR, KRISHNA ST, MANNARGUDI, TAMIL NADU, INDIA, 676876",
      "billToPhone": "798798798",
      "fax": "9879878",
      "vatNo": "68768978898098",
      "billToGstin": "888329087642356",
      "creditTerm": "CASH",
      "currency": "INR",
      "words": "Rupee Four Thousand Seven Hundred Seventy-Six Only",
      "subtotal": "4,200.00",
      "tax": "576.00",
      "total": "4,776.00",
      "narration": "MBL NO... / HBL NO. NSAJED85630124277 / JOB NO.",
      "officeAddressLines": [
        "MUMBAI",
        "406, 4TH FLOOR, D-21 CORPORATE PARK, SECTOR 21,, MUMBAI, Pincode : 400001"
      ],
      "taxAmountLines": [
        "GST18",
        "GST 15%"
      ],
      "metaRows": [
        {
          "k": "Invoice No.",
          "v": "BOMINV230500382"
        },
        {
          "k": "Shipment No.",
          "v": "BOM/EXP/23/05/B/0709"
        },
        {
          "k": "Date",
          "v": "17-MAY-23 (POSTED)"
        }
      ],
      "termsLines": [
        "1. Payment to be made by cash. The company is not responsible for any cash settlement without an official receipt."
      ],
      "bankLines": [
        "Beneficiary Name: KingFisher Logistic",
        "Bank : HDFC",
        "A/c No : XXXXXXXXXXX",
        "IBAN Code : ABA:XXXXXX",
        "Swift Code : XXXXXX",
        "Address : Dubai, United Arab Emirates"
      ],
      "osTableHeaders": [
        "Date",
        "Voucher No",
        "Narration",
        "Currency",
        "FCY Amount",
        "O/S FCY Amount",
        "Aging"
      ],
      "osTableRows": [
        [
          "16-MAY-23",
          "BOMINV230500371",
          "MBL NO... / HBL NO. 6676687 / JOB NO.CBOMEXP230764",
          "INR",
          "944.00",
          "944.00",
          "1"
        ]
      ],
      "agingHeaders": [
        "Currency",
        "Total O/S",
        "< 30",
        "30 - 60",
        "60 - 90",
        "90 - 120",
        "120 - 150",
        "150 - 180",
        "180+"
      ],
      "agingRow": [
        "INR",
        "944.00",
        "944.00",
        "",
        "",
        "",
        "",
        "",
        ""
      ],
      "trnNo": "100617975600003",
      "fieldGrid": [
        {
          "k": "Shipper",
          "v": "DEMO-SHIPPER ENGG COMPANY"
        },
        {
          "k": "Consignee",
          "v": "DEMO STEEL FACTORY CO. LTD."
        },
        {
          "k": "Shipment No.",
          "v": "BOM/EXP/23/05/B/0709 / 16-MAY-23"
        },
        {
          "k": "HBL / HAWB No.",
          "v": "NSAJED85630124277"
        },
        {
          "k": "Place of Receipt",
          "v": "INMAA-CHENNAI"
        },
        {
          "k": "Port of Loading",
          "v": "NHAVA SHEVA, INDIA"
        },
        {
          "k": "Port of Discharge",
          "v": "JEDDAH, SAUDI ARABIA"
        },
        {
          "k": "Place of Delivery",
          "v": "JEDDAH SAUDI ARABIA"
        },
        {
          "k": "ETD",
          "v": "01-MAR-23"
        },
        {
          "k": "ETA",
          "v": "20-MAR-23"
        },
        {
          "k": "Currency",
          "v": "INR 1.000000"
        },
        {
          "k": "INCO Terms",
          "v": "FOB"
        },
        {
          "k": "Narration",
          "v": "MBL NO... / HBL NO. NSAJED85630124277 / JOB NO."
        }
      ],
      "tableHeaders": [
        "Charges",
        "SAC Code",
        "Qty",
        "Amount / Qty",
        "Curr.",
        "Ex.Rate",
        "FCY Amount",
        "Taxable",
        "Non Taxable",
        "SGST %",
        "SGST",
        "CGST %",
        "CGST",
        "I/UGST",
        "Total Amount (INR)"
      ],
      "tableRows": [
        [
          "FREIGHT CHARGE",
          "",
          "1",
          "1,500.00",
          "INR",
          "1.00000",
          "1,500.00",
          "1,500.00",
          "",
          "9",
          "135.00",
          "9",
          "135.00",
          "",
          "1,770.00"
        ],
        [
          "LOCAL CHARGES",
          "",
          "1",
          "800.00",
          "INR",
          "1.00000",
          "800.00",
          "800.00",
          "",
          "9",
          "72.00",
          "9",
          "72.00",
          "",
          "944.00"
        ],
        [
          "SEA FREIGHT CHARGE",
          "",
          "1",
          "900.00",
          "INR",
          "1.00000",
          "900.00",
          "900.00",
          "",
          "9",
          "81.00",
          "9",
          "81.00",
          "",
          "1,062.00"
        ],
        [
          "CONTAINER CLEANING FEE",
          "",
          "1",
          "1,000.00",
          "INR",
          "1.00000",
          "1,000.00",
          "1,000.00",
          "",
          "",
          "",
          "",
          "",
          "",
          "1,000.00"
        ]
      ],
      "gstSummary": [
        {
          "k": "GST 18-CGST9%",
          "v": "135.00"
        },
        {
          "k": "GST 18-SGST9%",
          "v": "135.00"
        }
      ],
      "containerNote": "TTNU0712894 · 40' FLAT · GENERAL CARGO · 3 PACKAGES · 22,700.000 KGS"
    },
    "blocks": [
      {
        "type": "companyHeader"
      },
      {
        "type": "docTitle",
        "text": "TAX INVOICE",
        "align": "center"
      },
      {
        "type": "twoColumn",
        "showBillTo": true
      },
      {
        "type": "fieldGrid",
        "cols": 2
      },
      {
        "type": "chargeTable",
        "headerColor": "fill"
      },
      {
        "type": "wordsAndTotal"
      },
      {
        "type": "termsBank"
      },
      {
        "type": "colorfulFooter"
      }
    ]
  },
  {
    "code": "INVOICE_REPORT_FORMAT_57",
    "formatNumber": 57,
    "name": "Invoice Report Format-57 FG Tax Invoice India Format-1",
    "paper": "A4",
    "rtl": false,
    "theme": {
      "primary": "#000000",
      "accent": "#0F4D96",
      "fill": "#F3F3F3",
      "panel": "#EBF0F4",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#9AD7FF",
      "ink": "#101010",
      "gray": "#656565",
      "white": "#FFFFFF"
    },
    "branding": {
      "company": "KingFisher Logistic",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "info@kingfisherwingsgroup.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "BOMINV230500382",
      "invoiceDate": "17-MAY-23",
      "dueDate": "24-MAY-23",
      "billToLabel": "Bill To",
      "billToName": "DEMO LOGISTICS INDIA PVT LTD",
      "billToAddress": "21, PORT BLAIR, KRISHNA ST, MANNARGUDI, TAMIL NADU, INDIA, 676876",
      "billToPhone": "798798798",
      "fax": "9879878",
      "vatNo": "68768978898098",
      "billToGstin": "888329087642356",
      "creditTerm": "CASH",
      "currency": "INR",
      "words": "Rupee Four Thousand Seven Hundred Seventy-Six Only",
      "subtotal": "4,200.00",
      "tax": "576.00",
      "total": "4,776.00",
      "narration": "MBL NO... / HBL NO. NSAJED85630124277 / JOB NO.",
      "officeAddressLines": [
        "MUMBAI",
        "406, 4TH FLOOR, D-21 CORPORATE PARK, SECTOR 21,, MUMBAI, Pincode : 400001"
      ],
      "taxAmountLines": [
        "GST18-I/U GST18% 576.00"
      ],
      "metaRows": [
        {
          "k": "Invoice No.",
          "v": "BOMINV230500382 / 17-MAY-23 (POSTED)"
        },
        {
          "k": "Credit Term",
          "v": "CASH"
        },
        {
          "k": "GST NO",
          "v": "100617975600003"
        },
        {
          "k": "GST RCM",
          "v": "No"
        },
        {
          "k": "Variant",
          "v": "FG Format-1"
        }
      ],
      "termsLines": [
        "1. Payment to be made by cash. The company is not responsible for any cash settlement without an official receipt."
      ],
      "bankLines": [
        "Beneficiary Name: KingFisher Logistic",
        "Bank : HDFC",
        "A/c No : XXXXXXXXXXX",
        "IBAN Code : ABA:XXXXXX",
        "Swift Code : XXXXXX",
        "Address : Dubai, United Arab Emirates"
      ],
      "osTableHeaders": [
        "Date",
        "Voucher No",
        "Narration",
        "Currency",
        "FCY Amount",
        "O/S FCY Amount",
        "Aging"
      ],
      "osTableRows": [
        [
          "16-MAY-23",
          "BOMINV230500371",
          "MBL NO... / HBL NO. 6676687 / JOB NO.CBOMEXP230764",
          "INR",
          "944.00",
          "944.00",
          "1"
        ]
      ],
      "agingHeaders": [
        "Currency",
        "Total O/S",
        "< 30",
        "30 - 60",
        "60 - 90",
        "90 - 120",
        "120 - 150",
        "150 - 180",
        "180+"
      ],
      "agingRow": [
        "INR",
        "944.00",
        "944.00",
        "",
        "",
        "",
        "",
        "",
        ""
      ],
      "trnNo": "100617975600003",
      "docSubtitle": "FG Format-1 · GST RCM : No",
      "gstNo": "100617975600003",
      "fieldGrid": [
        {
          "k": "Shipper",
          "v": "DEMO-SHIPPER ENGG COMPANY"
        },
        {
          "k": "Consignee",
          "v": "DEMO STEEL FACTORY CO. LTD."
        },
        {
          "k": "Shipment No.",
          "v": "BOM/EXP/23/05/B/0709 / 16-MAY-23"
        },
        {
          "k": "HBL / HAWB No.",
          "v": "NSAJED85630124277"
        },
        {
          "k": "Place of Receipt",
          "v": "INMAA-CHENNAI"
        },
        {
          "k": "Port of Loading",
          "v": "NHAVA SHEVA, INDIA"
        },
        {
          "k": "Port of Discharge",
          "v": "JEDDAH, SAUDI ARABIA"
        },
        {
          "k": "Place of Delivery",
          "v": "JEDDAH SAUDI ARABIA"
        },
        {
          "k": "ETD",
          "v": "01-MAR-23"
        },
        {
          "k": "ETA",
          "v": "20-MAR-23"
        },
        {
          "k": "Currency",
          "v": "INR 1.000000"
        },
        {
          "k": "INCO Terms",
          "v": "FOB"
        },
        {
          "k": "Narration",
          "v": "MBL NO... / HBL NO. NSAJED85630124277 / JOB NO."
        }
      ],
      "tableHeaders": [
        "Charges",
        "HSN/SAC",
        "Qty",
        "Amount / Qty",
        "Curr.",
        "Ex.Rate",
        "FCY Amount",
        "Taxable",
        "Non Taxable",
        "SGST %",
        "SGST",
        "CGST %",
        "CGST",
        "IGST %",
        "IGST",
        "Total Amount (INR)"
      ],
      "tableRows": [
        [
          "FREIGHT CHARGE",
          "—",
          "1",
          "1,500.00",
          "INR",
          "1.00000",
          "1,500.00",
          "1,500.00",
          "",
          "",
          "",
          "",
          "",
          "18.00",
          "270.00",
          "1,770.00"
        ],
        [
          "LOCAL CHARGES",
          "—",
          "1",
          "800.00",
          "INR",
          "1.00000",
          "800.00",
          "800.00",
          "",
          "",
          "",
          "",
          "",
          "18.00",
          "144.00",
          "944.00"
        ],
        [
          "SEA FREIGHT CHARGE",
          "—",
          "1",
          "900.00",
          "INR",
          "1.00000",
          "900.00",
          "900.00",
          "",
          "",
          "",
          "",
          "",
          "18.00",
          "162.00",
          "1,062.00"
        ],
        [
          "CONTAINER CLEANING FEE",
          "—",
          "1",
          "1,000.00",
          "INR",
          "1.00000",
          "1,000.00",
          "1,000.00",
          "",
          "",
          "",
          "",
          "",
          "0.00",
          "0.00",
          "1,000.00"
        ]
      ],
      "gstSummary": [
        {
          "k": "GST18-I/U GST18%",
          "v": "576.00"
        }
      ],
      "containerNote": "TTNU0712894 · 40' FLAT · GENERAL CARGO · 3 PACKAGES · 22,700.000 KGS",
      "subtotalParts": [
        "4,200.00",
        "576.00",
        "4,776.00"
      ]
    },
    "blocks": [
      {
        "type": "companyHeader"
      },
      {
        "type": "docTitle",
        "text": "TAX INVOICE",
        "align": "center"
      },
      {
        "type": "twoColumn",
        "showBillTo": true,
        "showCreditTerm": true
      },
      {
        "type": "taxAmountBox"
      },
      {
        "type": "fieldGrid",
        "cols": 2
      },
      {
        "type": "containerNote"
      },
      {
        "type": "chargeTable",
        "headerColor": "fill"
      },
      {
        "type": "wordsAndTotal"
      },
      {
        "type": "termsBank"
      },
      {
        "type": "colorfulFooter"
      }
    ]
  },
  {
    "code": "INVOICE_REPORT_FORMAT_58",
    "formatNumber": 58,
    "name": "Invoice Report Format-58 Tax Invoice India Format-1",
    "paper": "A4",
    "rtl": false,
    "theme": {
      "primary": "#000000",
      "accent": "#0F4D96",
      "fill": "#F3F3F3",
      "panel": "#EBF0F4",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#9AD7FF",
      "ink": "#101010",
      "gray": "#656565",
      "white": "#FFFFFF"
    },
    "branding": {
      "company": "KingFisher Logistic",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "info@kingfisherwingsgroup.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "BOMINV230500382",
      "invoiceDate": "17-MAY-23",
      "dueDate": "24-MAY-23",
      "billToLabel": "Bill To",
      "billToName": "DEMO LOGISTICS INDIA PVT LTD",
      "billToAddress": "21, PORT BLAIR, KRISHNA ST, MANNARGUDI, TAMIL NADU, INDIA, 676876",
      "billToPhone": "798798798",
      "fax": "9879878",
      "vatNo": "68768978898098",
      "billToGstin": "888329087642356",
      "creditTerm": "CASH",
      "currency": "INR",
      "words": "Rupee Four Thousand Seven Hundred Seventy-Six Only",
      "subtotal": "4,200.00",
      "tax": "576.00",
      "total": "4,776.00",
      "narration": "MBL NO... / HBL NO. NSAJED85630124277 / JOB NO.",
      "officeAddressLines": [
        "MUMBAI",
        "406, 4TH FLOOR, D-21 CORPORATE PARK, SECTOR 21,, MUMBAI, Pincode : 400001"
      ],
      "taxAmountLines": [
        "GST18-I/U GST18% 576.00"
      ],
      "metaRows": [
        {
          "k": "Invoice No.",
          "v": "BOMINV230500382 / 17-MAY-23 (POSTED)"
        },
        {
          "k": "Credit Term",
          "v": "CASH"
        }
      ],
      "termsLines": [
        "1. Payment to be made by cash. The company is not responsible for any cash settlement without an official receipt."
      ],
      "bankLines": [
        "Beneficiary Name: KingFisher Logistic",
        "Bank : HDFC",
        "A/c No : XXXXXXXXXXX",
        "IBAN Code : ABA:XXXXXX",
        "Swift Code : XXXXXX",
        "Address : Dubai, United Arab Emirates"
      ],
      "osTableHeaders": [
        "Date",
        "Voucher No",
        "Narration",
        "Currency",
        "FCY Amount",
        "O/S FCY Amount",
        "Aging"
      ],
      "osTableRows": [
        [
          "16-MAY-23",
          "BOMINV230500371",
          "MBL NO... / HBL NO. 6676687 / JOB NO.CBOMEXP230764",
          "INR",
          "944.00",
          "944.00",
          "1"
        ]
      ],
      "agingHeaders": [
        "Currency",
        "Total O/S",
        "< 30",
        "30 - 60",
        "60 - 90",
        "90 - 120",
        "120 - 150",
        "150 - 180",
        "180+"
      ],
      "agingRow": [
        "INR",
        "944.00",
        "944.00",
        "",
        "",
        "",
        "",
        "",
        ""
      ],
      "trnNo": "100617975600003",
      "fieldGrid": [
        {
          "k": "Shipper",
          "v": "DEMO-SHIPPER ENGG COMPANY"
        },
        {
          "k": "Consignee",
          "v": "DEMO STEEL FACTORY CO. LTD."
        },
        {
          "k": "Shipment No.",
          "v": "BOM/EXP/23/05/B/0709 / 16-MAY-23"
        },
        {
          "k": "HBL / HAWB No.",
          "v": "NSAJED85630124277"
        },
        {
          "k": "Place of Receipt",
          "v": "INMAA-CHENNAI"
        },
        {
          "k": "Port of Loading",
          "v": "NHAVA SHEVA, INDIA"
        },
        {
          "k": "Port of Discharge",
          "v": "JEDDAH, SAUDI ARABIA"
        },
        {
          "k": "Place of Delivery",
          "v": "JEDDAH SAUDI ARABIA"
        },
        {
          "k": "ETD",
          "v": "01-MAR-23"
        },
        {
          "k": "ETA",
          "v": "20-MAR-23"
        },
        {
          "k": "Currency",
          "v": "INR 1.000000"
        },
        {
          "k": "INCO Terms",
          "v": "FOB"
        },
        {
          "k": "Narration",
          "v": "MBL NO... / HBL NO. NSAJED85630124277 / JOB NO."
        }
      ],
      "tableHeaders": [
        "Charges",
        "Unit",
        "SAC Code",
        "Qty",
        "Amount / Qty",
        "Currency",
        "Ex.Rate",
        "FCY Amount",
        "Taxable",
        "SGST %",
        "CGST %",
        "I/UGST %",
        "Total Amount (INR)"
      ],
      "tableRows": [
        [
          "FREIGHT CHARGE",
          "1 TON OR 1/2 MEASURE",
          "",
          "1",
          "1,500.00",
          "INR",
          "1.00000",
          "1,500.00",
          "1,500.00",
          "",
          "",
          "18",
          "1,770.00"
        ],
        [
          "LOCAL CHARGES",
          "—",
          "",
          "1",
          "800.00",
          "INR",
          "1.00000",
          "800.00",
          "800.00",
          "",
          "",
          "18",
          "944.00"
        ],
        [
          "SEA FREIGHT CHARGE",
          "1 TON OR 1/2 MEASURE",
          "",
          "1",
          "900.00",
          "INR",
          "1.00000",
          "900.00",
          "900.00",
          "",
          "",
          "18",
          "1,062.00"
        ],
        [
          "CONTAINER CLEANING FEE",
          "1 TON OR 1/2 MEASURE",
          "",
          "1",
          "1,000.00",
          "INR",
          "1.00000",
          "1,000.00",
          "1,000.00",
          "",
          "",
          "0",
          "1,000.00"
        ]
      ],
      "containerNote": "TTNU0712894 · 40' FLAT · GENERAL CARGO · 3 PACKAGES · 22,700.000 KGS"
    },
    "blocks": [
      {
        "type": "companyHeader"
      },
      {
        "type": "docTitle",
        "text": "INVOICE",
        "align": "center"
      },
      {
        "type": "twoColumn",
        "showBillTo": true,
        "showCreditTerm": true
      },
      {
        "type": "taxAmountBox"
      },
      {
        "type": "fieldGrid",
        "cols": 2
      },
      {
        "type": "chargeTable",
        "headerColor": "fill"
      },
      {
        "type": "wordsAndTotal"
      },
      {
        "type": "termsBank"
      },
      {
        "type": "colorfulFooter"
      }
    ]
  },
  {
    "code": "INVOICE_REPORT_FORMAT_59",
    "formatNumber": 59,
    "name": "Invoice Report Format-59 Tax Invoice India Format-2",
    "paper": "A4",
    "rtl": false,
    "theme": {
      "primary": "#000000",
      "accent": "#0F4D96",
      "fill": "#F3F3F3",
      "panel": "#EBF0F4",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#9AD7FF",
      "ink": "#101010",
      "gray": "#656565",
      "white": "#FFFFFF"
    },
    "branding": {
      "company": "KingFisher Logistic",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "info@kingfisherwingsgroup.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "BOMINV230500382",
      "invoiceDate": "17-MAY-23",
      "dueDate": "24-MAY-23",
      "billToLabel": "Bill To",
      "billToName": "DEMO LOGISTICS INDIA PVT LTD",
      "billToAddress": "21, PORT BLAIR, KRISHNA ST, MANNARGUDI, TAMIL NADU, INDIA, 676876",
      "billToPhone": "798798798",
      "fax": "9879878",
      "vatNo": "68768978898098",
      "billToGstin": "888329087642356",
      "creditTerm": "CASH",
      "currency": "INR",
      "words": "Rupee Four Thousand Seven Hundred Seventy-Six Only",
      "subtotal": "4,200.00",
      "tax": "576.00",
      "total": "4,776.00",
      "narration": "MBL NO... / HBL NO. NSAJED85630124277 / JOB NO.",
      "officeAddressLines": [
        "MUMBAI",
        "406, 4TH FLOOR, D-21 CORPORATE PARK, SECTOR 21,, MUMBAI, Pincode : 400001"
      ],
      "taxAmountLines": [
        "GST18-I/U GST18% 576.00"
      ],
      "metaRows": [
        {
          "k": "Invoice No.",
          "v": "BOMINV230500382 / 17-MAY-23 (POSTED)"
        },
        {
          "k": "Credit Term",
          "v": "CASH"
        },
        {
          "k": "GST NO",
          "v": "100617975600003"
        },
        {
          "k": "Variant",
          "v": "Format-2"
        }
      ],
      "termsLines": [
        "1. Payment to be made by cash. The company is not responsible for any cash settlement without an official receipt."
      ],
      "bankLines": [
        "Beneficiary Name: KingFisher Logistic",
        "Bank : HDFC",
        "A/c No : XXXXXXXXXXX",
        "IBAN Code : ABA:XXXXXX",
        "Swift Code : XXXXXX",
        "Address : Dubai, United Arab Emirates"
      ],
      "osTableHeaders": [
        "Date",
        "Voucher No",
        "Narration",
        "Currency",
        "FCY Amount",
        "O/S FCY Amount",
        "Aging"
      ],
      "osTableRows": [
        [
          "16-MAY-23",
          "BOMINV230500371",
          "MBL NO... / HBL NO. 6676687 / JOB NO.CBOMEXP230764",
          "INR",
          "944.00",
          "944.00",
          "1"
        ]
      ],
      "agingHeaders": [
        "Currency",
        "Total O/S",
        "< 30",
        "30 - 60",
        "60 - 90",
        "90 - 120",
        "120 - 150",
        "150 - 180",
        "180+"
      ],
      "agingRow": [
        "INR",
        "944.00",
        "944.00",
        "",
        "",
        "",
        "",
        "",
        ""
      ],
      "trnNo": "100617975600003",
      "docSubtitle": "Tax Invoice India Format-2",
      "gstNo": "100617975600003",
      "fieldGrid": [
        {
          "k": "Shipper",
          "v": "DEMO-SHIPPER ENGG COMPANY"
        },
        {
          "k": "Consignee",
          "v": "DEMO STEEL FACTORY CO. LTD."
        },
        {
          "k": "Shipment No.",
          "v": "BOM/EXP/23/05/B/0709 / 16-MAY-23"
        },
        {
          "k": "HBL / HAWB No.",
          "v": "NSAJED85630124277"
        },
        {
          "k": "Place of Receipt",
          "v": "INMAA-CHENNAI"
        },
        {
          "k": "Port of Loading",
          "v": "NHAVA SHEVA, INDIA"
        },
        {
          "k": "Port of Discharge",
          "v": "JEDDAH, SAUDI ARABIA"
        },
        {
          "k": "Place of Delivery",
          "v": "JEDDAH SAUDI ARABIA"
        },
        {
          "k": "ETD",
          "v": "01-MAR-23"
        },
        {
          "k": "ETA",
          "v": "20-MAR-23"
        },
        {
          "k": "Currency",
          "v": "INR 1.000000"
        },
        {
          "k": "INCO Terms",
          "v": "FOB"
        },
        {
          "k": "Narration",
          "v": "MBL NO... / HBL NO. NSAJED85630124277 / JOB NO."
        }
      ],
      "tableHeaders": [
        "Charges",
        "SAC Code",
        "Qty",
        "Amount / Qty",
        "Currency",
        "Ex.Rate",
        "FCY Amount",
        "Taxable Amount",
        "Non Taxable",
        "SGST %",
        "SGST",
        "CGST %",
        "CGST",
        "I/UGST %",
        "I/UGST",
        "Total Amount (INR)"
      ],
      "tableRows": [
        [
          "FREIGHT CHARGE",
          "",
          "1",
          "1,500.00",
          "INR",
          "1.00000",
          "1,500.00",
          "1,500.00",
          "",
          "",
          "",
          "",
          "",
          "18.00",
          "270.00",
          "1,770.00"
        ],
        [
          "LOCAL CHARGES",
          "",
          "1",
          "800.00",
          "INR",
          "1.00000",
          "800.00",
          "800.00",
          "",
          "",
          "",
          "",
          "",
          "18.00",
          "144.00",
          "944.00"
        ],
        [
          "SEA FREIGHT CHARGE",
          "",
          "1",
          "900.00",
          "INR",
          "1.00000",
          "900.00",
          "900.00",
          "",
          "",
          "",
          "",
          "",
          "18.00",
          "162.00",
          "1,062.00"
        ],
        [
          "CONTAINER CLEANING FEE",
          "",
          "1",
          "1,000.00",
          "INR",
          "1.00000",
          "1,000.00",
          "1,000.00",
          "",
          "",
          "",
          "",
          "",
          "0.00",
          "0.00",
          "1,000.00"
        ]
      ],
      "gstSummary": [
        {
          "k": "GST18-I/U GST18%",
          "v": "576.00"
        }
      ],
      "containerNote": "TTNU0712894 · 40' FLAT · GENERAL CARGO · 3 PACKAGES · 22,700.000 KGS",
      "subtotalParts": [
        "4,200.00",
        "576.00",
        "4,776.00"
      ]
    },
    "blocks": [
      {
        "type": "companyHeader"
      },
      {
        "type": "docTitle",
        "text": "TAX INVOICE",
        "align": "center"
      },
      {
        "type": "twoColumn",
        "showBillTo": true,
        "showCreditTerm": true
      },
      {
        "type": "taxAmountBox"
      },
      {
        "type": "fieldGrid",
        "cols": 2
      },
      {
        "type": "containerNote"
      },
      {
        "type": "chargeTable",
        "headerColor": "fill"
      },
      {
        "type": "wordsAndTotal"
      },
      {
        "type": "termsBank"
      },
      {
        "type": "colorfulFooter"
      }
    ]
  },
  {
    "code": "INVOICE_REPORT_FORMAT_60",
    "formatNumber": 60,
    "name": "Invoice Report Format-60 FG Tax Invoice India Format-2",
    "paper": "A4",
    "rtl": false,
    "theme": {
      "primary": "#000000",
      "accent": "#0F4D96",
      "fill": "#F3F3F3",
      "panel": "#EBF0F4",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#9AD7FF",
      "ink": "#101010",
      "gray": "#656565",
      "white": "#FFFFFF"
    },
    "branding": {
      "company": "KingFisher Logistic",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "info@kingfisherwingsgroup.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "BOMINV230500382",
      "invoiceDate": "17-MAY-23",
      "dueDate": "24-MAY-23",
      "billToLabel": "Bill To",
      "billToName": "DEMO LOGISTICS INDIA PVT LTD",
      "billToAddress": "21, PORT BLAIR, KRISHNA ST, MANNARGUDI, TAMIL NADU, INDIA, 676876",
      "billToPhone": "798798798",
      "fax": "9879878",
      "vatNo": "68768978898098",
      "billToGstin": "888329087642356",
      "creditTerm": "CASH",
      "currency": "INR",
      "words": "Rupee Four Thousand Seven Hundred Seventy-Six Only",
      "subtotal": "4,200.00",
      "tax": "576.00",
      "total": "4,776.00",
      "narration": "MBL NO... / HBL NO. NSAJED85630124277 / JOB NO.",
      "officeAddressLines": [
        "MUMBAI",
        "406, 4TH FLOOR, D-21 CORPORATE PARK, SECTOR 21,, MUMBAI, Pincode : 400001"
      ],
      "taxAmountLines": [
        "GST18-I/U GST18% 576.00"
      ],
      "metaRows": [
        {
          "k": "Invoice No.",
          "v": "BOMINV230500382 / 17-MAY-23 (POSTED)"
        },
        {
          "k": "Credit Term",
          "v": "CASH"
        },
        {
          "k": "GST NO",
          "v": "100617975600003"
        },
        {
          "k": "Copy",
          "v": "ORIGINAL FOR RECIPIENT"
        }
      ],
      "termsLines": [
        "1. Payment to be made by cash. The company is not responsible for any cash settlement without an official receipt."
      ],
      "bankLines": [
        "Beneficiary Name: KingFisher Logistic",
        "Bank : HDFC",
        "A/c No : XXXXXXXXXXX",
        "IBAN Code : ABA:XXXXXX",
        "Swift Code : XXXXXX",
        "Address : Dubai, United Arab Emirates"
      ],
      "osTableHeaders": [
        "Date",
        "Voucher No",
        "Narration",
        "Currency",
        "FCY Amount",
        "O/S FCY Amount",
        "Aging"
      ],
      "osTableRows": [
        [
          "16-MAY-23",
          "BOMINV230500371",
          "MBL NO... / HBL NO. 6676687 / JOB NO.CBOMEXP230764",
          "INR",
          "944.00",
          "944.00",
          "1"
        ]
      ],
      "agingHeaders": [
        "Currency",
        "Total O/S",
        "< 30",
        "30 - 60",
        "60 - 90",
        "90 - 120",
        "120 - 150",
        "150 - 180",
        "180+"
      ],
      "agingRow": [
        "INR",
        "944.00",
        "944.00",
        "",
        "",
        "",
        "",
        "",
        ""
      ],
      "trnNo": "100617975600003",
      "docSubtitle": "FG Format-2",
      "gstNo": "100617975600003",
      "fieldGrid": [
        {
          "k": "Shipper",
          "v": "DEMO-SHIPPER ENGG COMPANY"
        },
        {
          "k": "Consignee",
          "v": "DEMO STEEL FACTORY CO. LTD."
        },
        {
          "k": "Shipment No.",
          "v": "BOM/EXP/23/05/B/0709 / 16-MAY-23"
        },
        {
          "k": "HBL / HAWB No.",
          "v": "NSAJED85630124277"
        },
        {
          "k": "Place of Receipt",
          "v": "INMAA-CHENNAI"
        },
        {
          "k": "Port of Loading",
          "v": "NHAVA SHEVA, INDIA"
        },
        {
          "k": "Port of Discharge",
          "v": "JEDDAH, SAUDI ARABIA"
        },
        {
          "k": "Place of Delivery",
          "v": "JEDDAH SAUDI ARABIA"
        },
        {
          "k": "ETD",
          "v": "01-MAR-23"
        },
        {
          "k": "ETA",
          "v": "20-MAR-23"
        },
        {
          "k": "Currency",
          "v": "INR 1.000000"
        },
        {
          "k": "INCO Terms",
          "v": "FOB"
        },
        {
          "k": "Narration",
          "v": "MBL NO... / HBL NO. NSAJED85630124277 / JOB NO."
        }
      ],
      "tableHeaders": [
        "Charges",
        "SAC Code",
        "Qty",
        "Amount / Qty",
        "Currency",
        "Ex.Rate",
        "FCY Amount",
        "Taxable Amount",
        "Non Taxable",
        "SGST %",
        "SGST",
        "CGST %",
        "CGST",
        "I/UGST %",
        "I/UGST",
        "Total Amount (INR)"
      ],
      "tableRows": [
        [
          "FREIGHT CHARGE",
          "",
          "1",
          "1,500.00",
          "INR",
          "1.00000",
          "1,500.00",
          "1,500.00",
          "",
          "",
          "",
          "",
          "",
          "18.00",
          "270.00",
          "1,770.00"
        ],
        [
          "LOCAL CHARGES",
          "",
          "1",
          "800.00",
          "INR",
          "1.00000",
          "800.00",
          "800.00",
          "",
          "",
          "",
          "",
          "",
          "18.00",
          "144.00",
          "944.00"
        ],
        [
          "SEA FREIGHT CHARGE",
          "",
          "1",
          "900.00",
          "INR",
          "1.00000",
          "900.00",
          "900.00",
          "",
          "",
          "",
          "",
          "",
          "18.00",
          "162.00",
          "1,062.00"
        ],
        [
          "CONTAINER CLEANING FEE",
          "",
          "1",
          "1,000.00",
          "INR",
          "1.00000",
          "1,000.00",
          "1,000.00",
          "",
          "",
          "",
          "",
          "",
          "0.00",
          "0.00",
          "1,000.00"
        ]
      ],
      "gstSummary": [
        {
          "k": "GST18-I/U GST18%",
          "v": "576.00"
        }
      ],
      "containerNote": "TTNU0712894 · 40' FLAT · GENERAL CARGO · 3 PACKAGES · 22,700.000 KGS",
      "subtotalParts": [
        "4,200.00",
        "576.00",
        "4,776.00"
      ]
    },
    "blocks": [
      {
        "type": "companyHeader"
      },
      {
        "type": "docTitle",
        "text": "TAX INVOICE - BOMINV230500382 (ORIGINAL FOR RECIPIENT)",
        "align": "center"
      },
      {
        "type": "twoColumn",
        "showBillTo": true,
        "showCreditTerm": true
      },
      {
        "type": "taxAmountBox"
      },
      {
        "type": "fieldGrid",
        "cols": 2
      },
      {
        "type": "containerNote"
      },
      {
        "type": "chargeTable",
        "headerColor": "fill"
      },
      {
        "type": "wordsAndTotal"
      },
      {
        "type": "termsBank"
      },
      {
        "type": "colorfulFooter"
      }
    ]
  },
  {
    "code": "INVOICE_REPORT_FORMAT_61",
    "formatNumber": 61,
    "name": "Invoice Report Format-61 FG Tax Invoice India Format-6",
    "paper": "A4",
    "rtl": false,
    "theme": {
      "primary": "#000000",
      "accent": "#0F4D96",
      "fill": "#F3F3F3",
      "panel": "#EBF0F4",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#9AD7FF",
      "ink": "#101010",
      "gray": "#656565",
      "white": "#FFFFFF"
    },
    "branding": {
      "company": "KingFisher Logistic",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "info@kingfisherwingsgroup.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "BOMINV230500382",
      "invoiceDate": "17-MAY-23",
      "dueDate": "24-MAY-23",
      "billToLabel": "Bill To",
      "billToName": "DEMO LOGISTICS INDIA PVT LTD",
      "billToAddress": "21, PORT BLAIR, KRISHNA ST, MANNARGUDI, TAMIL NADU, INDIA, 676876",
      "billToPhone": "798798798",
      "fax": "9879878",
      "vatNo": "68768978898098",
      "billToGstin": "888329087642356",
      "creditTerm": "CASH",
      "currency": "INR",
      "words": "Rupee Four Thousand Seven Hundred Seventy-Six Only",
      "subtotal": "4,200.00",
      "tax": "576.00",
      "total": "4,776.00",
      "narration": "MBL NO... / HBL NO. NSAJED85630124277 / JOB NO.",
      "officeAddressLines": [
        "MUMBAI",
        "406, 4TH FLOOR, D-21 CORPORATE PARK, SECTOR 21,, MUMBAI, Pincode : 400001"
      ],
      "taxAmountLines": [
        "GST18-I/U GST18% 576.00"
      ],
      "metaRows": [
        {
          "k": "Invoice No.",
          "v": "BOMINV230500382 / 17-MAY-23 (POSTED)"
        },
        {
          "k": "Credit Term",
          "v": "CASH"
        },
        {
          "k": "GST NO",
          "v": "100617975600003"
        },
        {
          "k": "Copy",
          "v": "ORIGINAL FOR RECIPIENT"
        },
        {
          "k": "Variant",
          "v": "Format-6"
        }
      ],
      "termsLines": [
        "1. Payment to be made by cash. The company is not responsible for any cash settlement without an official receipt."
      ],
      "bankLines": [
        "Beneficiary Name: KingFisher Logistic",
        "Bank : HDFC",
        "A/c No : XXXXXXXXXXX",
        "IBAN Code : ABA:XXXXXX",
        "Swift Code : XXXXXX",
        "Address : Dubai, United Arab Emirates"
      ],
      "osTableHeaders": [
        "Date",
        "Voucher No",
        "Narration",
        "Currency",
        "FCY Amount",
        "O/S FCY Amount",
        "Aging"
      ],
      "osTableRows": [
        [
          "16-MAY-23",
          "BOMINV230500371",
          "MBL NO... / HBL NO. 6676687 / JOB NO.CBOMEXP230764",
          "INR",
          "944.00",
          "944.00",
          "1"
        ]
      ],
      "agingHeaders": [
        "Currency",
        "Total O/S",
        "< 30",
        "30 - 60",
        "60 - 90",
        "90 - 120",
        "120 - 150",
        "150 - 180",
        "180+"
      ],
      "agingRow": [
        "INR",
        "944.00",
        "944.00",
        "",
        "",
        "",
        "",
        "",
        ""
      ],
      "trnNo": "100617975600003",
      "docSubtitle": "FG Format-6",
      "gstNo": "100617975600003",
      "fieldGrid": [
        {
          "k": "Shipper",
          "v": "DEMO-SHIPPER ENGG COMPANY"
        },
        {
          "k": "Consignee",
          "v": "DEMO STEEL FACTORY CO. LTD."
        },
        {
          "k": "Shipment No.",
          "v": "BOM/EXP/23/05/B/0709 / 16-MAY-23"
        },
        {
          "k": "HBL / HAWB No.",
          "v": "NSAJED85630124277"
        },
        {
          "k": "Place of Receipt",
          "v": "INMAA-CHENNAI"
        },
        {
          "k": "Port of Loading",
          "v": "NHAVA SHEVA, INDIA"
        },
        {
          "k": "Port of Discharge",
          "v": "JEDDAH, SAUDI ARABIA"
        },
        {
          "k": "Place of Delivery",
          "v": "JEDDAH SAUDI ARABIA"
        },
        {
          "k": "ETD",
          "v": "01-MAR-23"
        },
        {
          "k": "ETA",
          "v": "20-MAR-23"
        },
        {
          "k": "Currency",
          "v": "INR 1.000000"
        },
        {
          "k": "INCO Terms",
          "v": "FOB"
        },
        {
          "k": "Narration",
          "v": "MBL NO... / HBL NO. NSAJED85630124277 / JOB NO."
        },
        {
          "k": "Department",
          "v": "FCL EXPORT"
        }
      ],
      "tableHeaders": [
        "Charges",
        "SAC Code",
        "Qty",
        "Amount / Qty",
        "Currency",
        "Ex.Rate",
        "FCY Amount",
        "Taxable Amount",
        "Non Taxable",
        "SGST %",
        "SGST",
        "CGST %",
        "CGST",
        "I/UGST %",
        "I/UGST",
        "Total Amount (INR)"
      ],
      "tableRows": [
        [
          "FREIGHT CHARGE",
          "",
          "1",
          "1,500.00",
          "INR",
          "1.00000",
          "1,500.00",
          "1,500.00",
          "",
          "",
          "",
          "",
          "",
          "18.00",
          "270.00",
          "1,770.00"
        ],
        [
          "LOCAL CHARGES",
          "",
          "1",
          "800.00",
          "INR",
          "1.00000",
          "800.00",
          "800.00",
          "",
          "",
          "",
          "",
          "",
          "18.00",
          "144.00",
          "944.00"
        ],
        [
          "SEA FREIGHT CHARGE",
          "",
          "1",
          "900.00",
          "INR",
          "1.00000",
          "900.00",
          "900.00",
          "",
          "",
          "",
          "",
          "",
          "18.00",
          "162.00",
          "1,062.00"
        ],
        [
          "CONTAINER CLEANING FEE",
          "",
          "1",
          "1,000.00",
          "INR",
          "1.00000",
          "1,000.00",
          "1,000.00",
          "",
          "",
          "",
          "",
          "",
          "0.00",
          "0.00",
          "1,000.00"
        ]
      ],
      "gstSummary": [
        {
          "k": "GST18-I/U GST18%",
          "v": "576.00"
        }
      ],
      "containerNote": "TTNU0712894 · 40' FLAT · GENERAL CARGO · 3 PACKAGES · 22,700.000 KGS",
      "subtotalParts": [
        "4,200.00",
        "576.00",
        "4,776.00"
      ]
    },
    "blocks": [
      {
        "type": "companyHeader"
      },
      {
        "type": "docTitle",
        "text": "TAX INVOICE - BOMINV230500382 (ORIGINAL FOR RECIPIENT)",
        "align": "center"
      },
      {
        "type": "twoColumn",
        "showBillTo": true,
        "showCreditTerm": true
      },
      {
        "type": "taxAmountBox"
      },
      {
        "type": "fieldGrid",
        "cols": 2
      },
      {
        "type": "containerNote"
      },
      {
        "type": "chargeTable",
        "headerColor": "fill"
      },
      {
        "type": "wordsAndTotal"
      },
      {
        "type": "termsBank"
      },
      {
        "type": "colorfulFooter"
      }
    ]
  },
  {
    "code": "INVOICE_REPORT_FORMAT_62",
    "formatNumber": 62,
    "name": "Invoice Report Format-62 FG Tax Invoice India Format-7",
    "paper": "A4",
    "rtl": false,
    "theme": {
      "primary": "#000000",
      "accent": "#0F4D96",
      "fill": "#F3F3F3",
      "panel": "#EBF0F4",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#9AD7FF",
      "ink": "#101010",
      "gray": "#656565",
      "white": "#FFFFFF"
    },
    "branding": {
      "company": "KingFisher Logistic",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "info@kingfisherwingsgroup.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "BOMINV230500382",
      "invoiceDate": "17-MAY-23",
      "dueDate": "24-MAY-23",
      "billToLabel": "Bill To",
      "billToName": "DEMO LOGISTICS INDIA PVT LTD",
      "billToAddress": "21, PORT BLAIR, KRISHNA ST, MANNARGUDI, TAMIL NADU, INDIA, 676876",
      "billToPhone": "798798798",
      "fax": "9879878",
      "vatNo": "68768978898098",
      "billToGstin": "888329087642356",
      "creditTerm": "CASH",
      "currency": "INR",
      "words": "Rupee Four Thousand Seven Hundred Seventy-Six Only",
      "subtotal": "4,200.00",
      "tax": "576.00",
      "total": "4,776.00",
      "narration": "MBL NO... / HBL NO. NSAJED85630124277 / JOB NO.",
      "officeAddressLines": [
        "MUMBAI",
        "406, 4TH FLOOR, D-21 CORPORATE PARK, SECTOR 21,, MUMBAI, Pincode : 400001"
      ],
      "taxAmountLines": [
        "GST18-I/U GST18% 576.00"
      ],
      "metaRows": [
        {
          "k": "Invoice No.",
          "v": "BOMINV230500382 / 17-MAY-23 (POSTED)"
        },
        {
          "k": "Credit Term",
          "v": "CASH"
        },
        {
          "k": "GST NO",
          "v": "100617975600003"
        },
        {
          "k": "Variant",
          "v": "Format-7"
        }
      ],
      "termsLines": [
        "1. Payment to be made by cash. The company is not responsible for any cash settlement without an official receipt."
      ],
      "bankLines": [
        "Beneficiary Name: KingFisher Logistic",
        "Bank : HDFC",
        "A/c No : XXXXXXXXXXX",
        "IBAN Code : ABA:XXXXXX",
        "Swift Code : XXXXXX",
        "Address : Dubai, United Arab Emirates"
      ],
      "osTableHeaders": [
        "Date",
        "Voucher No",
        "Narration",
        "Currency",
        "FCY Amount",
        "O/S FCY Amount",
        "Aging"
      ],
      "osTableRows": [
        [
          "16-MAY-23",
          "BOMINV230500371",
          "MBL NO... / HBL NO. 6676687 / JOB NO.CBOMEXP230764",
          "INR",
          "944.00",
          "944.00",
          "1"
        ]
      ],
      "agingHeaders": [
        "Currency",
        "Total O/S",
        "< 30",
        "30 - 60",
        "60 - 90",
        "90 - 120",
        "120 - 150",
        "150 - 180",
        "180+"
      ],
      "agingRow": [
        "INR",
        "944.00",
        "944.00",
        "",
        "",
        "",
        "",
        "",
        ""
      ],
      "trnNo": "100617975600003",
      "docSubtitle": "FG Format-7",
      "gstNo": "100617975600003",
      "fieldGrid": [
        {
          "k": "Shipper",
          "v": "DEMO-SHIPPER ENGG COMPANY"
        },
        {
          "k": "Consignee",
          "v": "DEMO STEEL FACTORY CO. LTD."
        },
        {
          "k": "Shipment No.",
          "v": "BOM/EXP/23/05/B/0709 / 16-MAY-23"
        },
        {
          "k": "HBL / HAWB No.",
          "v": "NSAJED85630124277"
        },
        {
          "k": "Place of Receipt",
          "v": "INMAA-CHENNAI"
        },
        {
          "k": "Port of Loading",
          "v": "NHAVA SHEVA, INDIA"
        },
        {
          "k": "Port of Discharge",
          "v": "JEDDAH, SAUDI ARABIA"
        },
        {
          "k": "Place of Delivery",
          "v": "JEDDAH SAUDI ARABIA"
        },
        {
          "k": "ETD",
          "v": "01-MAR-23"
        },
        {
          "k": "ETA",
          "v": "20-MAR-23"
        },
        {
          "k": "Currency",
          "v": "INR 1.000000"
        },
        {
          "k": "INCO Terms",
          "v": "FOB"
        },
        {
          "k": "Narration",
          "v": "MBL NO... / HBL NO. NSAJED85630124277 / JOB NO."
        }
      ],
      "tableHeaders": [
        "Charges",
        "SAC Code",
        "Qty",
        "Amount / Qty",
        "Currency",
        "Ex.Rate",
        "FCY Amount",
        "Taxable Amount",
        "Non Taxable",
        "SGST %",
        "SGST",
        "CGST %",
        "CGST",
        "I/UGST %",
        "I/UGST",
        "Total Amount (INR)"
      ],
      "tableRows": [
        [
          "FREIGHT CHARGE",
          "",
          "1",
          "1,500.00",
          "INR",
          "1.00000",
          "1,500.00",
          "1,500.00",
          "",
          "",
          "",
          "",
          "",
          "18.00",
          "270.00",
          "1,770.00"
        ],
        [
          "LOCAL CHARGES",
          "",
          "1",
          "800.00",
          "INR",
          "1.00000",
          "800.00",
          "800.00",
          "",
          "",
          "",
          "",
          "",
          "18.00",
          "144.00",
          "944.00"
        ],
        [
          "SEA FREIGHT CHARGE",
          "",
          "1",
          "900.00",
          "INR",
          "1.00000",
          "900.00",
          "900.00",
          "",
          "",
          "",
          "",
          "",
          "18.00",
          "162.00",
          "1,062.00"
        ],
        [
          "CONTAINER CLEANING FEE",
          "",
          "1",
          "1,000.00",
          "INR",
          "1.00000",
          "1,000.00",
          "1,000.00",
          "",
          "",
          "",
          "",
          "",
          "0.00",
          "0.00",
          "1,000.00"
        ]
      ],
      "gstSummary": [
        {
          "k": "GST18-I/U GST18%",
          "v": "576.00"
        }
      ],
      "containerNote": "TTNU0712894 · 40' FLAT · GENERAL CARGO · 3 PACKAGES · 22,700.000 KGS",
      "subtotalParts": [
        "4,200.00",
        "576.00",
        "4,776.00"
      ]
    },
    "blocks": [
      {
        "type": "companyHeader"
      },
      {
        "type": "docTitle",
        "text": "TAX INVOICE - BOMINV230500382 (ORIGINAL FOR RECIPIENT)",
        "align": "center"
      },
      {
        "type": "twoColumn",
        "showBillTo": true,
        "showCreditTerm": true
      },
      {
        "type": "taxAmountBox"
      },
      {
        "type": "fieldGrid",
        "cols": 2
      },
      {
        "type": "containerNote"
      },
      {
        "type": "chargeTable",
        "headerColor": "fill"
      },
      {
        "type": "wordsAndTotal"
      },
      {
        "type": "termsBank"
      },
      {
        "type": "colorfulFooter"
      }
    ]
  },
  {
    "code": "INVOICE_REPORT_FORMAT_63",
    "formatNumber": 63,
    "name": "Invoice Report Format-63 FG Tax Invoice India Format-8",
    "paper": "A4",
    "rtl": false,
    "theme": {
      "primary": "#000000",
      "accent": "#0F4D96",
      "fill": "#F3F3F3",
      "panel": "#EBF0F4",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#9AD7FF",
      "ink": "#101010",
      "gray": "#656565",
      "white": "#FFFFFF"
    },
    "branding": {
      "company": "KingFisher Logistic",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "info@kingfisherwingsgroup.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "BOMINV230500382",
      "invoiceDate": "17-MAY-23",
      "dueDate": "24-MAY-23",
      "billToLabel": "Bill To",
      "billToName": "DEMO LOGISTICS INDIA PVT LTD",
      "billToAddress": "21, PORT BLAIR, KRISHNA ST, MANNARGUDI, TAMIL NADU, INDIA, 676876",
      "billToPhone": "798798798",
      "fax": "9879878",
      "vatNo": "68768978898098",
      "billToGstin": "888329087642356",
      "creditTerm": "CASH",
      "currency": "INR",
      "words": "Rupee Four Thousand Seven Hundred Seventy-Six Only",
      "subtotal": "4,200.00",
      "tax": "576.00",
      "total": "4,776.00",
      "narration": "MBL NO... / HBL NO. NSAJED85630124277 / JOB NO.",
      "officeAddressLines": [
        "MUMBAI",
        "406, 4TH FLOOR, D-21 CORPORATE PARK, SECTOR 21,, MUMBAI, Pincode : 400001"
      ],
      "taxAmountLines": [
        "GST18-I/U GST18% 576.00"
      ],
      "metaRows": [
        {
          "k": "Invoice No.",
          "v": "BOMINV230500382 / 17-MAY-23 (POSTED)"
        },
        {
          "k": "Credit Term",
          "v": "CASH"
        },
        {
          "k": "GST NO",
          "v": "100617975600003"
        },
        {
          "k": "Variant",
          "v": "Format-8"
        }
      ],
      "termsLines": [
        "1. Payment to be made by cash. The company is not responsible for any cash settlement without an official receipt."
      ],
      "bankLines": [
        "Beneficiary Name: KingFisher Logistic",
        "Bank : HDFC",
        "A/c No : XXXXXXXXXXX",
        "IBAN Code : ABA:XXXXXX",
        "Swift Code : XXXXXX",
        "Address : Dubai, United Arab Emirates"
      ],
      "osTableHeaders": [
        "Date",
        "Voucher No",
        "Narration",
        "Currency",
        "FCY Amount",
        "O/S FCY Amount",
        "Aging"
      ],
      "osTableRows": [
        [
          "16-MAY-23",
          "BOMINV230500371",
          "MBL NO... / HBL NO. 6676687 / JOB NO.CBOMEXP230764",
          "INR",
          "944.00",
          "944.00",
          "1"
        ]
      ],
      "agingHeaders": [
        "Currency",
        "Total O/S",
        "< 30",
        "30 - 60",
        "60 - 90",
        "90 - 120",
        "120 - 150",
        "150 - 180",
        "180+"
      ],
      "agingRow": [
        "INR",
        "944.00",
        "944.00",
        "",
        "",
        "",
        "",
        "",
        ""
      ],
      "trnNo": "100617975600003",
      "docSubtitle": "FG Format-8",
      "gstNo": "100617975600003",
      "fieldGrid": [
        {
          "k": "Shipper",
          "v": "DEMO-SHIPPER ENGG COMPANY"
        },
        {
          "k": "Consignee",
          "v": "DEMO STEEL FACTORY CO. LTD."
        },
        {
          "k": "Shipment No.",
          "v": "BOM/EXP/23/05/B/0709 / 16-MAY-23"
        },
        {
          "k": "HBL / HAWB No.",
          "v": "NSAJED85630124277"
        },
        {
          "k": "Place of Receipt",
          "v": "INMAA-CHENNAI"
        },
        {
          "k": "Port of Loading",
          "v": "NHAVA SHEVA, INDIA"
        },
        {
          "k": "Port of Discharge",
          "v": "JEDDAH, SAUDI ARABIA"
        },
        {
          "k": "Place of Delivery",
          "v": "JEDDAH SAUDI ARABIA"
        },
        {
          "k": "ETD",
          "v": "01-MAR-23"
        },
        {
          "k": "ETA",
          "v": "20-MAR-23"
        },
        {
          "k": "Currency",
          "v": "INR 1.000000"
        },
        {
          "k": "INCO Terms",
          "v": "FOB"
        },
        {
          "k": "Narration",
          "v": "MBL NO... / HBL NO. NSAJED85630124277 / JOB NO."
        },
        {
          "k": "PO No.",
          "v": "—"
        }
      ],
      "tableHeaders": [
        "Charges",
        "SAC Code",
        "Qty",
        "Amount / Qty",
        "Currency",
        "Ex.Rate",
        "FCY Amount",
        "Taxable Amount",
        "Non Taxable",
        "SGST %",
        "SGST",
        "CGST %",
        "CGST",
        "I/UGST %",
        "I/UGST",
        "Total Amount (INR)"
      ],
      "tableRows": [
        [
          "FREIGHT CHARGE",
          "",
          "1",
          "1,500.00",
          "INR",
          "1.00000",
          "1,500.00",
          "1,500.00",
          "",
          "",
          "",
          "",
          "",
          "18.00",
          "270.00",
          "1,770.00"
        ],
        [
          "LOCAL CHARGES",
          "",
          "1",
          "800.00",
          "INR",
          "1.00000",
          "800.00",
          "800.00",
          "",
          "",
          "",
          "",
          "",
          "18.00",
          "144.00",
          "944.00"
        ],
        [
          "SEA FREIGHT CHARGE",
          "",
          "1",
          "900.00",
          "INR",
          "1.00000",
          "900.00",
          "900.00",
          "",
          "",
          "",
          "",
          "",
          "18.00",
          "162.00",
          "1,062.00"
        ],
        [
          "CONTAINER CLEANING FEE",
          "",
          "1",
          "1,000.00",
          "INR",
          "1.00000",
          "1,000.00",
          "1,000.00",
          "",
          "",
          "",
          "",
          "",
          "0.00",
          "0.00",
          "1,000.00"
        ]
      ],
      "gstSummary": [
        {
          "k": "GST18-I/U GST18%",
          "v": "576.00"
        }
      ],
      "containerNote": "TTNU0712894 · 40' FLAT · GENERAL CARGO · 3 PACKAGES · 22,700.000 KGS",
      "subtotalParts": [
        "4,200.00",
        "576.00",
        "4,776.00"
      ]
    },
    "blocks": [
      {
        "type": "companyHeader"
      },
      {
        "type": "docTitle",
        "text": "TAX INVOICE - BOMINV230500382 (ORIGINAL FOR RECIPIENT)",
        "align": "center"
      },
      {
        "type": "twoColumn",
        "showBillTo": true,
        "showCreditTerm": true
      },
      {
        "type": "taxAmountBox"
      },
      {
        "type": "fieldGrid",
        "cols": 2
      },
      {
        "type": "containerNote"
      },
      {
        "type": "chargeTable",
        "headerColor": "fill"
      },
      {
        "type": "wordsAndTotal"
      },
      {
        "type": "termsBank"
      },
      {
        "type": "colorfulFooter"
      }
    ]
  },
  {
    "code": "INVOICE_REPORT_FORMAT_64",
    "formatNumber": 64,
    "name": "Invoice Report Format-64 FG Tax Invoice India Format-3",
    "paper": "A4",
    "rtl": false,
    "theme": {
      "primary": "#000000",
      "accent": "#0F4D96",
      "fill": "#F3F3F3",
      "panel": "#EBF0F4",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#9AD7FF",
      "ink": "#101010",
      "gray": "#656565",
      "white": "#FFFFFF"
    },
    "branding": {
      "company": "KingFisher Logistic",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "info@kingfisherwingsgroup.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "BOMINV230500382",
      "invoiceDate": "17-MAY-23",
      "dueDate": "24-MAY-23",
      "billToLabel": "Bill To",
      "billToName": "DEMO LOGISTICS INDIA PVT LTD",
      "billToAddress": "21, PORT BLAIR, KRISHNA ST, MANNARGUDI, TAMIL NADU, INDIA, 676876",
      "billToPhone": "798798798",
      "fax": "9879878",
      "vatNo": "68768978898098",
      "billToGstin": "888329087642356",
      "creditTerm": "CASH",
      "currency": "INR",
      "words": "Rupee Four Thousand Seven Hundred Seventy-Six Only",
      "subtotal": "4,200.00",
      "tax": "576.00",
      "total": "4,776.00",
      "narration": "MBL NO... / HBL NO. NSAJED85630124277 / JOB NO.",
      "officeAddressLines": [
        "MUMBAI",
        "406, 4TH FLOOR, D-21 CORPORATE PARK, SECTOR 21,, MUMBAI, Pincode : 400001"
      ],
      "taxAmountLines": [
        "GST18-I/U GST18% 576.00"
      ],
      "metaRows": [
        {
          "k": "Invoice No.",
          "v": "BOMINV230500382 / 17-MAY-23 (POSTED)"
        },
        {
          "k": "Credit Term",
          "v": "CASH"
        },
        {
          "k": "GST NO",
          "v": "100617975600003"
        },
        {
          "k": "Variant",
          "v": "Format-3"
        }
      ],
      "termsLines": [
        "1. Payment to be made by cash. The company is not responsible for any cash settlement without an official receipt."
      ],
      "bankLines": [
        "Beneficiary Name: KingFisher Logistic",
        "Bank : HDFC",
        "A/c No : XXXXXXXXXXX",
        "IBAN Code : ABA:XXXXXX",
        "Swift Code : XXXXXX",
        "Address : Dubai, United Arab Emirates"
      ],
      "osTableHeaders": [
        "Date",
        "Voucher No",
        "Narration",
        "Currency",
        "FCY Amount",
        "O/S FCY Amount",
        "Aging"
      ],
      "osTableRows": [
        [
          "16-MAY-23",
          "BOMINV230500371",
          "MBL NO... / HBL NO. 6676687 / JOB NO.CBOMEXP230764",
          "INR",
          "944.00",
          "944.00",
          "1"
        ]
      ],
      "agingHeaders": [
        "Currency",
        "Total O/S",
        "< 30",
        "30 - 60",
        "60 - 90",
        "90 - 120",
        "120 - 150",
        "150 - 180",
        "180+"
      ],
      "agingRow": [
        "INR",
        "944.00",
        "944.00",
        "",
        "",
        "",
        "",
        "",
        ""
      ],
      "trnNo": "100617975600003",
      "docSubtitle": "FG Format-3",
      "gstNo": "100617975600003",
      "fieldGrid": [
        {
          "k": "Shipper",
          "v": "DEMO-SHIPPER ENGG COMPANY"
        },
        {
          "k": "Consignee",
          "v": "DEMO STEEL FACTORY CO. LTD."
        },
        {
          "k": "Shipment No.",
          "v": "BOM/EXP/23/05/B/0709 / 16-MAY-23"
        },
        {
          "k": "HBL / HAWB No.",
          "v": "NSAJED85630124277"
        },
        {
          "k": "Place of Receipt",
          "v": "INMAA-CHENNAI"
        },
        {
          "k": "Port of Loading",
          "v": "NHAVA SHEVA, INDIA"
        },
        {
          "k": "Port of Discharge",
          "v": "JEDDAH, SAUDI ARABIA"
        },
        {
          "k": "Place of Delivery",
          "v": "JEDDAH SAUDI ARABIA"
        },
        {
          "k": "ETD",
          "v": "01-MAR-23"
        },
        {
          "k": "ETA",
          "v": "20-MAR-23"
        },
        {
          "k": "Currency",
          "v": "INR 1.000000"
        },
        {
          "k": "INCO Terms",
          "v": "FOB"
        },
        {
          "k": "Narration",
          "v": "MBL NO... / HBL NO. NSAJED85630124277 / JOB NO."
        }
      ],
      "tableHeaders": [
        "Charges",
        "SAC Code",
        "Qty",
        "Amount / Qty",
        "Currency",
        "Ex.Rate",
        "FCY Amount",
        "Taxable Amount",
        "Non Taxable",
        "SGST %",
        "SGST",
        "CGST %",
        "CGST",
        "I/UGST %",
        "I/UGST",
        "Total Amount (INR)"
      ],
      "tableRows": [
        [
          "FREIGHT CHARGE",
          "",
          "1",
          "1,500.00",
          "INR",
          "1.00000",
          "1,500.00",
          "1,500.00",
          "",
          "",
          "",
          "",
          "",
          "18.00",
          "270.00",
          "1,770.00"
        ],
        [
          "LOCAL CHARGES",
          "",
          "1",
          "800.00",
          "INR",
          "1.00000",
          "800.00",
          "800.00",
          "",
          "",
          "",
          "",
          "",
          "18.00",
          "144.00",
          "944.00"
        ],
        [
          "SEA FREIGHT CHARGE",
          "",
          "1",
          "900.00",
          "INR",
          "1.00000",
          "900.00",
          "900.00",
          "",
          "",
          "",
          "",
          "",
          "18.00",
          "162.00",
          "1,062.00"
        ],
        [
          "CONTAINER CLEANING FEE",
          "",
          "1",
          "1,000.00",
          "INR",
          "1.00000",
          "1,000.00",
          "1,000.00",
          "",
          "",
          "",
          "",
          "",
          "0.00",
          "0.00",
          "1,000.00"
        ]
      ],
      "gstSummary": [
        {
          "k": "GST18-I/U GST18%",
          "v": "576.00"
        }
      ],
      "containerNote": "TTNU0712894 · 40' FLAT · GENERAL CARGO · 3 PACKAGES · 22,700.000 KGS",
      "subtotalParts": [
        "4,200.00",
        "576.00",
        "4,776.00"
      ]
    },
    "blocks": [
      {
        "type": "companyHeader"
      },
      {
        "type": "docTitle",
        "text": "TAX INVOICE - BOMINV230500382 (ORIGINAL FOR RECIPIENT)",
        "align": "center"
      },
      {
        "type": "twoColumn",
        "showBillTo": true,
        "showCreditTerm": true
      },
      {
        "type": "taxAmountBox"
      },
      {
        "type": "fieldGrid",
        "cols": 2
      },
      {
        "type": "containerNote"
      },
      {
        "type": "chargeTable",
        "headerColor": "fill"
      },
      {
        "type": "wordsAndTotal"
      },
      {
        "type": "termsBank"
      },
      {
        "type": "colorfulFooter"
      }
    ]
  },
  {
    "code": "INVOICE_REPORT_FORMAT_65",
    "formatNumber": 65,
    "name": "Invoice Report Format-65 FG Tax Invoice India Format-4",
    "paper": "A4",
    "rtl": false,
    "theme": {
      "primary": "#000000",
      "accent": "#0F4D96",
      "fill": "#F3F3F3",
      "panel": "#EBF0F4",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#9AD7FF",
      "ink": "#101010",
      "gray": "#656565",
      "white": "#FFFFFF"
    },
    "branding": {
      "company": "KingFisher Logistic",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "info@kingfisherwingsgroup.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "BOMINV230500382",
      "invoiceDate": "17-MAY-23",
      "dueDate": "24-MAY-23",
      "billToLabel": "Bill To",
      "billToName": "DEMO LOGISTICS INDIA PVT LTD",
      "billToAddress": "21, PORT BLAIR, KRISHNA ST, MANNARGUDI, TAMIL NADU, INDIA, 676876",
      "billToPhone": "798798798",
      "fax": "9879878",
      "vatNo": "68768978898098",
      "billToGstin": "888329087642356",
      "creditTerm": "CASH",
      "currency": "INR",
      "words": "Rupee Four Thousand Seven Hundred Seventy-Six Only",
      "subtotal": "4,200.00",
      "tax": "576.00",
      "total": "4,776.00",
      "narration": "MBL NO... / HBL NO. NSAJED85630124277 / JOB NO.",
      "officeAddressLines": [
        "MUMBAI",
        "406, 4TH FLOOR, D-21 CORPORATE PARK, SECTOR 21,, MUMBAI, Pincode : 400001"
      ],
      "taxAmountLines": [
        "GST18-I/U GST18% 576.00"
      ],
      "metaRows": [
        {
          "k": "Invoice No.",
          "v": "BOMINV230500382 / 17-MAY-23 (POSTED)"
        },
        {
          "k": "Credit Term",
          "v": "CASH"
        },
        {
          "k": "GST NO",
          "v": "100617975600003"
        },
        {
          "k": "GST RCM",
          "v": "No"
        },
        {
          "k": "Variant",
          "v": "Format-4"
        }
      ],
      "termsLines": [
        "1. Payment to be made by cash. The company is not responsible for any cash settlement without an official receipt."
      ],
      "bankLines": [
        "Beneficiary Name: KingFisher Logistic",
        "Bank : HDFC",
        "A/c No : XXXXXXXXXXX",
        "IBAN Code : ABA:XXXXXX",
        "Swift Code : XXXXXX",
        "Address : Dubai, United Arab Emirates"
      ],
      "osTableHeaders": [
        "Date",
        "Voucher No",
        "Narration",
        "Currency",
        "FCY Amount",
        "O/S FCY Amount",
        "Aging"
      ],
      "osTableRows": [
        [
          "16-MAY-23",
          "BOMINV230500371",
          "MBL NO... / HBL NO. 6676687 / JOB NO.CBOMEXP230764",
          "INR",
          "944.00",
          "944.00",
          "1"
        ]
      ],
      "agingHeaders": [
        "Currency",
        "Total O/S",
        "< 30",
        "30 - 60",
        "60 - 90",
        "90 - 120",
        "120 - 150",
        "150 - 180",
        "180+"
      ],
      "agingRow": [
        "INR",
        "944.00",
        "944.00",
        "",
        "",
        "",
        "",
        "",
        ""
      ],
      "trnNo": "100617975600003",
      "docSubtitle": "FG Format-4 · GST RCM : No",
      "gstNo": "100617975600003",
      "fieldGrid": [
        {
          "k": "Shipper",
          "v": "DEMO-SHIPPER ENGG COMPANY"
        },
        {
          "k": "Consignee",
          "v": "DEMO STEEL FACTORY CO. LTD."
        },
        {
          "k": "Shipment No.",
          "v": "BOM/EXP/23/05/B/0709 / 16-MAY-23"
        },
        {
          "k": "HBL / HAWB No.",
          "v": "NSAJED85630124277"
        },
        {
          "k": "Place of Receipt",
          "v": "INMAA-CHENNAI"
        },
        {
          "k": "Port of Loading",
          "v": "NHAVA SHEVA, INDIA"
        },
        {
          "k": "Port of Discharge",
          "v": "JEDDAH, SAUDI ARABIA"
        },
        {
          "k": "Place of Delivery",
          "v": "JEDDAH SAUDI ARABIA"
        },
        {
          "k": "ETD",
          "v": "01-MAR-23"
        },
        {
          "k": "ETA",
          "v": "20-MAR-23"
        },
        {
          "k": "Currency",
          "v": "INR 1.000000"
        },
        {
          "k": "INCO Terms",
          "v": "FOB"
        },
        {
          "k": "Narration",
          "v": "MBL NO... / HBL NO. NSAJED85630124277 / JOB NO."
        }
      ],
      "tableHeaders": [
        "Charges",
        "Unit",
        "Qty",
        "Amount / Qty",
        "Curr.",
        "Ex.Rate",
        "FCY",
        "Taxable",
        "S/UGST %",
        "S/UGST",
        "CGST %",
        "CGST",
        "I/UGST %",
        "I/UGST",
        "Total (INR)"
      ],
      "tableRows": [
        [
          "FREIGHT CHARGE",
          "1 TON OR 1/2 MEASURE",
          "1",
          "1,500.00",
          "INR",
          "1.00000",
          "1,500.00",
          "1,500.00",
          "",
          "",
          "",
          "",
          "18",
          "270.00",
          "1,770.00"
        ],
        [
          "LOCAL CHARGES",
          "—",
          "1",
          "800.00",
          "INR",
          "1.00000",
          "800.00",
          "800.00",
          "",
          "",
          "",
          "",
          "18",
          "144.00",
          "944.00"
        ],
        [
          "SEA FREIGHT CHARGE",
          "1 TON OR 1/2 MEASURE",
          "1",
          "900.00",
          "INR",
          "1.00000",
          "900.00",
          "900.00",
          "",
          "",
          "",
          "",
          "18",
          "162.00",
          "1,062.00"
        ],
        [
          "CONTAINER CLEANING FEE",
          "1 TON OR 1/2 MEASURE",
          "1",
          "1,000.00",
          "INR",
          "1.00000",
          "1,000.00",
          "1,000.00",
          "",
          "",
          "",
          "",
          "0",
          "0.00",
          "1,000.00"
        ]
      ],
      "gstSummary": [
        {
          "k": "GST18-I/U GST18%",
          "v": "576.00"
        }
      ],
      "containerNote": "TTNU0712894 · 40' FLAT · GENERAL CARGO · 3 PACKAGES · 22,700.000 KGS",
      "subtotalParts": [
        "4,200.00",
        "576.00",
        "4,776.00"
      ]
    },
    "blocks": [
      {
        "type": "companyHeader"
      },
      {
        "type": "docTitle",
        "text": "TAX INVOICE",
        "align": "center"
      },
      {
        "type": "twoColumn",
        "showBillTo": true,
        "showCreditTerm": true
      },
      {
        "type": "taxAmountBox"
      },
      {
        "type": "fieldGrid",
        "cols": 2
      },
      {
        "type": "containerNote"
      },
      {
        "type": "chargeTable",
        "headerColor": "fill"
      },
      {
        "type": "wordsAndTotal"
      },
      {
        "type": "termsBank"
      },
      {
        "type": "colorfulFooter"
      }
    ]
  },
  {
    "code": "INVOICE_REPORT_FORMAT_66",
    "formatNumber": 66,
    "name": "Invoice Report Format-66 FG Tax Invoice India Format-5",
    "paper": "A4",
    "rtl": false,
    "theme": {
      "primary": "#000000",
      "accent": "#0F4D96",
      "fill": "#F3F3F3",
      "panel": "#EBF0F4",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#9AD7FF",
      "ink": "#101010",
      "gray": "#656565",
      "white": "#FFFFFF"
    },
    "branding": {
      "company": "KingFisher Logistic",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "info@kingfisherwingsgroup.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "BOMINV230500382",
      "invoiceDate": "17-MAY-23",
      "dueDate": "24-MAY-23",
      "billToLabel": "INVOICE TO",
      "billToName": "DEMO LOGISTICS INDIA PVT LTD",
      "billToAddress": "21, PORT BLAIR, KRISHNA ST, MANNARGUDI, TAMIL NADU, INDIA, 676876",
      "billToPhone": "798798798",
      "fax": "9879878",
      "vatNo": "68768978898098",
      "billToGstin": "888329087642356",
      "creditTerm": "CASH",
      "currency": "INR",
      "words": "Rupee Four Thousand Seven Hundred Seventy-Six Only",
      "subtotal": "4,200.00",
      "tax": "576.00",
      "total": "4,776.00",
      "narration": "MBL NO... / HBL NO. NSAJED85630124277 / JOB NO.",
      "officeAddressLines": [
        "MUMBAI",
        "406, 4TH FLOOR, D-21 CORPORATE PARK, SECTOR 21,, MUMBAI, Pincode : 400001"
      ],
      "taxAmountLines": [
        "GST18",
        "GST 15%"
      ],
      "metaRows": [
        {
          "k": "INVOICE NO.",
          "v": "BOMINV230500382"
        },
        {
          "k": "DATE",
          "v": "17-MAY-23"
        },
        {
          "k": "NO OF CONTAINER",
          "v": "1"
        }
      ],
      "termsLines": [
        "1. Payment to be made by cash. The company is not responsible for any cash settlement without an official receipt."
      ],
      "bankLines": [
        "Beneficiary Name: KingFisher Logistic",
        "Bank : HDFC",
        "A/c No : XXXXXXXXXXX",
        "IBAN Code : ABA:XXXXXX",
        "Swift Code : XXXXXX",
        "Address : Dubai, United Arab Emirates"
      ],
      "osTableHeaders": [
        "Date",
        "Voucher No",
        "Narration",
        "Currency",
        "FCY Amount",
        "O/S FCY Amount",
        "Aging"
      ],
      "osTableRows": [
        [
          "16-MAY-23",
          "BOMINV230500371",
          "MBL NO... / HBL NO. 6676687 / JOB NO.CBOMEXP230764",
          "INR",
          "944.00",
          "944.00",
          "1"
        ]
      ],
      "agingHeaders": [
        "Currency",
        "Total O/S",
        "< 30",
        "30 - 60",
        "60 - 90",
        "90 - 120",
        "120 - 150",
        "150 - 180",
        "180+"
      ],
      "agingRow": [
        "INR",
        "944.00",
        "944.00",
        "",
        "",
        "",
        "",
        "",
        ""
      ],
      "trnNo": "100617975600003",
      "fieldGrid": [
        {
          "k": "Shipper",
          "v": "DEMO-SHIPPER ENGG COMPANY"
        },
        {
          "k": "Consignee",
          "v": "DEMO STEEL FACTORY CO. LTD."
        },
        {
          "k": "Origin",
          "v": "NHAVA SHEVA, INDIA"
        },
        {
          "k": "Destination",
          "v": "JEDDAH, SAUDI ARABIA"
        },
        {
          "k": "HBL",
          "v": "NSAJED85630124277"
        }
      ],
      "tableHeaders": [
        "Charges",
        "RATE",
        "GST %",
        "Total Amt (INR)"
      ],
      "tableRows": [
        [
          "FREIGHT CHARGE",
          "1,500.00",
          "18",
          "1,770.00"
        ],
        [
          "LOCAL CHARGES",
          "800.00",
          "18",
          "944.00"
        ],
        [
          "SEA FREIGHT CHARGE",
          "900.00",
          "18",
          "1,062.00"
        ],
        [
          "CONTAINER CLEANING FEE",
          "1,000.00",
          "0",
          "1,000.00"
        ]
      ],
      "gstSummary": [
        {
          "k": "IGST",
          "v": "576.00"
        }
      ],
      "containerNote": "TTNU0712894 / 40' FLAT"
    },
    "blocks": [
      {
        "type": "companyHeader"
      },
      {
        "type": "docTitle",
        "text": "TAX INVOICE",
        "align": "center"
      },
      {
        "type": "twoColumn",
        "showBillTo": true
      },
      {
        "type": "fieldGrid",
        "cols": 2
      },
      {
        "type": "chargeTable",
        "headerColor": "fill"
      },
      {
        "type": "wordsAndTotal"
      },
      {
        "type": "containerNote"
      },
      {
        "type": "termsBank"
      },
      {
        "type": "colorfulFooter"
      }
    ]
  },
  {
    "code": "INVOICE_REPORT_FORMAT_67",
    "formatNumber": 67,
    "name": "Invoice Report Format-67 FG Tax Invoice Malaysia",
    "paper": "A4",
    "rtl": false,
    "theme": {
      "primary": "#000000",
      "accent": "#0F4D96",
      "fill": "#F3F3F3",
      "panel": "#EBF0F4",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#9AD7FF",
      "ink": "#101010",
      "gray": "#656565",
      "white": "#FFFFFF"
    },
    "branding": {
      "company": "KingFisher Logistic",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "info@kingfisherwingsgroup.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "BOMINV230500382",
      "invoiceDate": "17-MAY-23",
      "dueDate": "24-MAY-23",
      "billToLabel": "Bill To",
      "billToName": "DEMO LOGISTICS INDIA PVT LTD",
      "billToAddress": "21, PORT BLAIR, KRISHNA ST, MANNARGUDI, TAMIL NADU, INDIA, 676876",
      "billToPhone": "798798798",
      "fax": "9879878",
      "vatNo": "68768978898098",
      "billToGstin": "888329087642356",
      "creditTerm": "CASH",
      "currency": "INR",
      "words": "Rupee Four Thousand Two Hundred Only",
      "subtotal": "4,200.00",
      "tax": "576.00",
      "total": "4,200.00",
      "narration": "MBL NO... / HBL NO. NSAJED85630124277 / JOB NO.",
      "officeAddressLines": [
        "MUMBAI",
        "406, 4TH FLOOR, D-21 CORPORATE PARK, SECTOR 21,, MUMBAI, Pincode : 400001"
      ],
      "taxAmountLines": [
        "GST18",
        "GST 15%"
      ],
      "metaRows": [
        {
          "k": "INVOICE DATE",
          "v": "17-MAY-23"
        },
        {
          "k": "Invoice No.",
          "v": "BOMINV230500382"
        },
        {
          "k": "Region",
          "v": "Malaysia"
        }
      ],
      "termsLines": [
        "1. Payment to be made by cash. The company is not responsible for any cash settlement without an official receipt."
      ],
      "bankLines": [
        "Beneficiary Name: KingFisher Logistic",
        "Bank : HDFC",
        "A/c No : XXXXXXXXXXX",
        "IBAN Code : ABA:XXXXXX",
        "Swift Code : XXXXXX",
        "Address : Dubai, United Arab Emirates"
      ],
      "osTableHeaders": [
        "Date",
        "Voucher No",
        "Narration",
        "Currency",
        "FCY Amount",
        "O/S FCY Amount",
        "Aging"
      ],
      "osTableRows": [
        [
          "16-MAY-23",
          "BOMINV230500371",
          "MBL NO... / HBL NO. 6676687 / JOB NO.CBOMEXP230764",
          "INR",
          "944.00",
          "944.00",
          "1"
        ]
      ],
      "agingHeaders": [
        "Currency",
        "Total O/S",
        "< 30",
        "30 - 60",
        "60 - 90",
        "90 - 120",
        "120 - 150",
        "150 - 180",
        "180+"
      ],
      "agingRow": [
        "INR",
        "944.00",
        "944.00",
        "",
        "",
        "",
        "",
        "",
        ""
      ],
      "trnNo": "100617975600003",
      "fieldGrid": [
        {
          "k": "Shipper",
          "v": "DEMO-SHIPPER ENGG COMPANY"
        },
        {
          "k": "Consignee",
          "v": "DEMO STEEL FACTORY CO. LTD."
        },
        {
          "k": "Shipment No.",
          "v": "BOM/EXP/23/05/B/0709 / 16-MAY-23"
        },
        {
          "k": "HBL / HAWB No.",
          "v": "NSAJED85630124277"
        },
        {
          "k": "Place of Receipt",
          "v": "INMAA-CHENNAI"
        },
        {
          "k": "Port of Loading",
          "v": "NHAVA SHEVA, INDIA"
        },
        {
          "k": "Port of Discharge",
          "v": "JEDDAH, SAUDI ARABIA"
        },
        {
          "k": "Place of Delivery",
          "v": "JEDDAH SAUDI ARABIA"
        },
        {
          "k": "ETD",
          "v": "01-MAR-23"
        },
        {
          "k": "ETA",
          "v": "20-MAR-23"
        }
      ],
      "tableHeaders": [
        "Charge",
        "Curr",
        "Rate",
        "Qty",
        "Amount",
        "ROE",
        "Tax",
        "Total"
      ],
      "tableRows": [
        [
          "FREIGHT CHARGE",
          "INR",
          "1,500.00",
          "1",
          "1,500.00",
          "1.00000",
          "GST18 %",
          "1,500.00"
        ],
        [
          "LOCAL CHARGES",
          "INR",
          "800.00",
          "1",
          "800.00",
          "1.00000",
          "GST18 %",
          "800.00"
        ],
        [
          "SEA FREIGHT CHARGE",
          "INR",
          "900.00",
          "1",
          "900.00",
          "1.00000",
          "GST18 %",
          "900.00"
        ],
        [
          "CONTAINER CLEANING FEE",
          "INR",
          "1,000.00",
          "1",
          "1,000.00",
          "1.00000",
          "GST15 %",
          "1,000.00"
        ]
      ]
    },
    "blocks": [
      {
        "type": "companyHeader"
      },
      {
        "type": "docTitle",
        "text": "TAX INVOICE BOMINV230500382",
        "align": "center"
      },
      {
        "type": "twoColumn",
        "showBillTo": true
      },
      {
        "type": "fieldGrid",
        "cols": 2
      },
      {
        "type": "chargeTable",
        "headerColor": "fill"
      },
      {
        "type": "wordsAndTotal"
      },
      {
        "type": "termsBank"
      },
      {
        "type": "colorfulFooter"
      }
    ]
  },
  {
    "code": "INVOICE_REPORT_FORMAT_68",
    "formatNumber": 68,
    "name": "Invoice Report Format-68 FG Tax Invoice Singapore",
    "paper": "A4",
    "rtl": false,
    "theme": {
      "primary": "#000000",
      "accent": "#0F4D96",
      "fill": "#F3F3F3",
      "panel": "#EBF0F4",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#9AD7FF",
      "ink": "#101010",
      "gray": "#656565",
      "white": "#FFFFFF"
    },
    "branding": {
      "company": "KingFisher Logistic",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "info@kingfisherwingsgroup.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "BOMINV230500382",
      "invoiceDate": "17-MAY-23",
      "dueDate": "24-MAY-23",
      "billToLabel": "Bill To",
      "billToName": "DEMO LOGISTICS INDIA PVT LTD",
      "billToAddress": "21, PORT BLAIR, KRISHNA ST, MANNARGUDI, TAMIL NADU, INDIA, 676876",
      "billToPhone": "798798798",
      "fax": "9879878",
      "vatNo": "68768978898098",
      "billToGstin": "888329087642356",
      "creditTerm": "CASH",
      "currency": "INR",
      "words": "Rupee Four Thousand Two Hundred Only",
      "subtotal": "4,200.00",
      "tax": "576.00",
      "total": "4,200.00",
      "narration": "MBL NO... / HBL NO. NSAJED85630124277 / JOB NO.",
      "officeAddressLines": [
        "MUMBAI",
        "406, 4TH FLOOR, D-21 CORPORATE PARK, SECTOR 21,, MUMBAI, Pincode : 400001"
      ],
      "taxAmountLines": [
        "GST18",
        "GST 15%"
      ],
      "metaRows": [
        {
          "k": "INVOICE DATE",
          "v": "17-MAY-23"
        },
        {
          "k": "Invoice No.",
          "v": "BOMINV230500382"
        },
        {
          "k": "Region",
          "v": "Singapore"
        }
      ],
      "termsLines": [
        "1. Payment to be made by cash. The company is not responsible for any cash settlement without an official receipt."
      ],
      "bankLines": [
        "Beneficiary Name: KingFisher Logistic",
        "Bank : HDFC",
        "A/c No : XXXXXXXXXXX",
        "IBAN Code : ABA:XXXXXX",
        "Swift Code : XXXXXX",
        "Address : Dubai, United Arab Emirates"
      ],
      "osTableHeaders": [
        "Date",
        "Voucher No",
        "Narration",
        "Currency",
        "FCY Amount",
        "O/S FCY Amount",
        "Aging"
      ],
      "osTableRows": [
        [
          "16-MAY-23",
          "BOMINV230500371",
          "MBL NO... / HBL NO. 6676687 / JOB NO.CBOMEXP230764",
          "INR",
          "944.00",
          "944.00",
          "1"
        ]
      ],
      "agingHeaders": [
        "Currency",
        "Total O/S",
        "< 30",
        "30 - 60",
        "60 - 90",
        "90 - 120",
        "120 - 150",
        "150 - 180",
        "180+"
      ],
      "agingRow": [
        "INR",
        "944.00",
        "944.00",
        "",
        "",
        "",
        "",
        "",
        ""
      ],
      "trnNo": "100617975600003",
      "fieldGrid": [
        {
          "k": "Shipper",
          "v": "DEMO-SHIPPER ENGG COMPANY"
        },
        {
          "k": "Consignee",
          "v": "DEMO STEEL FACTORY CO. LTD."
        },
        {
          "k": "Shipment No.",
          "v": "BOM/EXP/23/05/B/0709 / 16-MAY-23"
        },
        {
          "k": "HBL / HAWB No.",
          "v": "NSAJED85630124277"
        },
        {
          "k": "Place of Receipt",
          "v": "INMAA-CHENNAI"
        },
        {
          "k": "Port of Loading",
          "v": "NHAVA SHEVA, INDIA"
        },
        {
          "k": "Port of Discharge",
          "v": "JEDDAH, SAUDI ARABIA"
        },
        {
          "k": "Place of Delivery",
          "v": "JEDDAH SAUDI ARABIA"
        },
        {
          "k": "ETD",
          "v": "01-MAR-23"
        },
        {
          "k": "ETA",
          "v": "20-MAR-23"
        }
      ],
      "tableHeaders": [
        "Charge",
        "Curr",
        "Rate",
        "Qty",
        "Amount",
        "ROE",
        "Tax",
        "Total"
      ],
      "tableRows": [
        [
          "FREIGHT CHARGE",
          "INR",
          "1,500.00",
          "1",
          "1,500.00",
          "1.00000",
          "GST18 %",
          "1,500.00"
        ],
        [
          "LOCAL CHARGES",
          "INR",
          "800.00",
          "1",
          "800.00",
          "1.00000",
          "GST18 %",
          "800.00"
        ],
        [
          "SEA FREIGHT CHARGE",
          "INR",
          "900.00",
          "1",
          "900.00",
          "1.00000",
          "GST18 %",
          "900.00"
        ],
        [
          "CONTAINER CLEANING FEE",
          "INR",
          "1,000.00",
          "1",
          "1,000.00",
          "1.00000",
          "GST15 %",
          "1,000.00"
        ]
      ]
    },
    "blocks": [
      {
        "type": "companyHeader"
      },
      {
        "type": "docTitle",
        "text": "TAX INVOICE BOMINV230500382",
        "align": "center"
      },
      {
        "type": "twoColumn",
        "showBillTo": true
      },
      {
        "type": "fieldGrid",
        "cols": 2
      },
      {
        "type": "chargeTable",
        "headerColor": "fill"
      },
      {
        "type": "wordsAndTotal"
      },
      {
        "type": "termsBank"
      },
      {
        "type": "colorfulFooter"
      }
    ]
  },
  {
    "code": "INVOICE_REPORT_FORMAT_69",
    "formatNumber": 69,
    "name": "Invoice Report Format-69 Warehouse Invoice",
    "paper": "A4",
    "rtl": false,
    "theme": {
      "primary": "#000000",
      "accent": "#0F4D96",
      "fill": "#F3F3F3",
      "panel": "#EBF0F4",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#9AD7FF",
      "ink": "#101010",
      "gray": "#656565",
      "white": "#FFFFFF"
    },
    "branding": {
      "company": "KingFisher Logistic",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "info@kingfisherwingsgroup.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "BOMINV230500382",
      "invoiceDate": "17-MAY-23",
      "dueDate": "24-MAY-23",
      "billToLabel": "Client",
      "billToName": "DEMO LOGISTICS INDIA PVT LTD",
      "billToAddress": "21, PORT BLAIR, KRISHNA ST, MANNARGUDI, TAMIL NADU, INDIA, 676876",
      "billToPhone": "798798798",
      "fax": "9879878",
      "vatNo": "68768978898098",
      "billToGstin": "888329087642356",
      "creditTerm": "CASH",
      "currency": "INR",
      "words": "Rupee Four Thousand Two Hundred Only",
      "subtotal": "4,200.00",
      "tax": "576.00",
      "total": "4,200.00",
      "narration": "MBL NO... / HBL NO. NSAJED85630124277 / JOB NO.",
      "officeAddressLines": [
        "MUMBAI",
        "406, 4TH FLOOR, D-21 CORPORATE PARK, SECTOR 21,, MUMBAI, Pincode : 400001"
      ],
      "taxAmountLines": [
        "GST18",
        "GST 15%"
      ],
      "metaRows": [
        {
          "k": "Invoice No.",
          "v": "BOMINV230500382"
        },
        {
          "k": "Date",
          "v": "17-MAY-23 (POSTED)"
        }
      ],
      "termsLines": [
        "1. Payment to be made by cash. The company is not responsible for any cash settlement without an official receipt."
      ],
      "bankLines": [
        "Beneficiary Name: KingFisher Logistic",
        "Bank : HDFC",
        "A/c No : XXXXXXXXXXX",
        "IBAN Code : ABA:XXXXXX",
        "Swift Code : XXXXXX",
        "Address : Dubai, United Arab Emirates"
      ],
      "osTableHeaders": [
        "Date",
        "Voucher No",
        "Narration",
        "Currency",
        "FCY Amount",
        "O/S FCY Amount",
        "Aging"
      ],
      "osTableRows": [
        [
          "16-MAY-23",
          "BOMINV230500371",
          "MBL NO... / HBL NO. 6676687 / JOB NO.CBOMEXP230764",
          "INR",
          "944.00",
          "944.00",
          "1"
        ]
      ],
      "agingHeaders": [
        "Currency",
        "Total O/S",
        "< 30",
        "30 - 60",
        "60 - 90",
        "90 - 120",
        "120 - 150",
        "150 - 180",
        "180+"
      ],
      "agingRow": [
        "INR",
        "944.00",
        "944.00",
        "",
        "",
        "",
        "",
        "",
        ""
      ],
      "trnNo": "100617975600003",
      "fieldGrid": [
        {
          "k": "Warehouse",
          "v": "DEMO WH - MUMBAI"
        },
        {
          "k": "Client Ref",
          "v": "—"
        },
        {
          "k": "Shipper",
          "v": "DEMO-SHIPPER ENGG COMPANY"
        },
        {
          "k": "Consignee",
          "v": "DEMO STEEL FACTORY CO. LTD."
        }
      ],
      "tableHeaders": [
        "Charges",
        "GRN / GDN No",
        "Client Ref No.",
        "Unit",
        "Qty",
        "Amount"
      ],
      "tableRows": [
        [
          "FREIGHT CHARGE",
          "GRN-001",
          "—",
          "PKG",
          "1",
          "1,500.00"
        ],
        [
          "LOCAL CHARGES",
          "GRN-001",
          "—",
          "PKG",
          "1",
          "800.00"
        ],
        [
          "SEA FREIGHT CHARGE",
          "GDN-002",
          "—",
          "PKG",
          "1",
          "900.00"
        ],
        [
          "CONTAINER CLEANING FEE",
          "GDN-002",
          "—",
          "PKG",
          "1",
          "1,000.00"
        ]
      ]
    },
    "blocks": [
      {
        "type": "companyHeader"
      },
      {
        "type": "docTitle",
        "text": "INVOICE - BOMINV230500382",
        "align": "center"
      },
      {
        "type": "twoColumn",
        "showBillTo": true
      },
      {
        "type": "fieldGrid",
        "cols": 2
      },
      {
        "type": "chargeTable",
        "headerColor": "fill"
      },
      {
        "type": "wordsAndTotal"
      },
      {
        "type": "termsBank"
      },
      {
        "type": "colorfulFooter"
      }
    ]
  },
  {
    "code": "INVOICE_REPORT_FORMAT_70",
    "formatNumber": 70,
    "name": "Invoice Report Format-70 Warehouse Invoice India Format",
    "paper": "A4",
    "rtl": false,
    "theme": {
      "primary": "#000000",
      "accent": "#0F4D96",
      "fill": "#F3F3F3",
      "panel": "#EBF0F4",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#9AD7FF",
      "ink": "#101010",
      "gray": "#656565",
      "white": "#FFFFFF"
    },
    "branding": {
      "company": "KingFisher Logistic",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "info@kingfisherwingsgroup.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "BOMINV230500382",
      "invoiceDate": "17-MAY-23",
      "dueDate": "24-MAY-23",
      "billToLabel": "Client",
      "billToName": "DEMO LOGISTICS INDIA PVT LTD",
      "billToAddress": "21, PORT BLAIR, KRISHNA ST, MANNARGUDI, TAMIL NADU, INDIA, 676876",
      "billToPhone": "798798798",
      "fax": "9879878",
      "vatNo": "68768978898098",
      "billToGstin": "888329087642356",
      "creditTerm": "CASH",
      "currency": "INR",
      "words": "Rupee Four Thousand Seven Hundred Seventy-Six Only",
      "subtotal": "4,200.00",
      "tax": "576.00",
      "total": "4,776.00",
      "narration": "MBL NO... / HBL NO. NSAJED85630124277 / JOB NO.",
      "officeAddressLines": [
        "MUMBAI",
        "406, 4TH FLOOR, D-21 CORPORATE PARK, SECTOR 21,, MUMBAI, Pincode : 400001"
      ],
      "taxAmountLines": [
        "GST18-I/U GST18% 576.00"
      ],
      "metaRows": [
        {
          "k": "Invoice No.",
          "v": "BOMINV230500382 / 17-MAY-23 (POSTED)"
        },
        {
          "k": "Credit Term",
          "v": "CASH"
        },
        {
          "k": "GST NO",
          "v": "100617975600003"
        },
        {
          "k": "Warehouse Format",
          "v": "India"
        }
      ],
      "termsLines": [
        "1. Payment to be made by cash. The company is not responsible for any cash settlement without an official receipt."
      ],
      "bankLines": [
        "Beneficiary Name: KingFisher Logistic",
        "Bank : HDFC",
        "A/c No : XXXXXXXXXXX",
        "IBAN Code : ABA:XXXXXX",
        "Swift Code : XXXXXX",
        "Address : Dubai, United Arab Emirates"
      ],
      "osTableHeaders": [
        "Date",
        "Voucher No",
        "Narration",
        "Currency",
        "FCY Amount",
        "O/S FCY Amount",
        "Aging"
      ],
      "osTableRows": [
        [
          "16-MAY-23",
          "BOMINV230500371",
          "MBL NO... / HBL NO. 6676687 / JOB NO.CBOMEXP230764",
          "INR",
          "944.00",
          "944.00",
          "1"
        ]
      ],
      "agingHeaders": [
        "Currency",
        "Total O/S",
        "< 30",
        "30 - 60",
        "60 - 90",
        "90 - 120",
        "120 - 150",
        "150 - 180",
        "180+"
      ],
      "agingRow": [
        "INR",
        "944.00",
        "944.00",
        "",
        "",
        "",
        "",
        "",
        ""
      ],
      "trnNo": "100617975600003",
      "docSubtitle": "Warehouse Invoice India Format",
      "gstNo": "100617975600003",
      "fieldGrid": [
        {
          "k": "Shipper",
          "v": "DEMO-SHIPPER ENGG COMPANY"
        },
        {
          "k": "Consignee",
          "v": "DEMO STEEL FACTORY CO. LTD."
        },
        {
          "k": "Shipment No.",
          "v": "BOM/EXP/23/05/B/0709 / 16-MAY-23"
        },
        {
          "k": "HBL / HAWB No.",
          "v": "NSAJED85630124277"
        },
        {
          "k": "Place of Receipt",
          "v": "INMAA-CHENNAI"
        },
        {
          "k": "Port of Loading",
          "v": "NHAVA SHEVA, INDIA"
        },
        {
          "k": "Port of Discharge",
          "v": "JEDDAH, SAUDI ARABIA"
        },
        {
          "k": "Place of Delivery",
          "v": "JEDDAH SAUDI ARABIA"
        },
        {
          "k": "ETD",
          "v": "01-MAR-23"
        },
        {
          "k": "ETA",
          "v": "20-MAR-23"
        },
        {
          "k": "Currency",
          "v": "INR 1.000000"
        },
        {
          "k": "INCO Terms",
          "v": "FOB"
        },
        {
          "k": "Narration",
          "v": "MBL NO... / HBL NO. NSAJED85630124277 / JOB NO."
        }
      ],
      "tableHeaders": [
        "Charges",
        "SAC Code",
        "Qty",
        "Amount / Qty",
        "Currency",
        "Ex.Rate",
        "FCY Amount",
        "Taxable Amount",
        "Non Taxable",
        "SGST %",
        "SGST",
        "CGST %",
        "CGST",
        "I/UGST %",
        "I/UGST",
        "Total Amount (INR)"
      ],
      "tableRows": [
        [
          "FREIGHT CHARGE",
          "",
          "1",
          "1,500.00",
          "INR",
          "1.00000",
          "1,500.00",
          "1,500.00",
          "",
          "",
          "",
          "",
          "",
          "18.00",
          "270.00",
          "1,770.00"
        ],
        [
          "LOCAL CHARGES",
          "",
          "1",
          "800.00",
          "INR",
          "1.00000",
          "800.00",
          "800.00",
          "",
          "",
          "",
          "",
          "",
          "18.00",
          "144.00",
          "944.00"
        ],
        [
          "SEA FREIGHT CHARGE",
          "",
          "1",
          "900.00",
          "INR",
          "1.00000",
          "900.00",
          "900.00",
          "",
          "",
          "",
          "",
          "",
          "18.00",
          "162.00",
          "1,062.00"
        ],
        [
          "CONTAINER CLEANING FEE",
          "",
          "1",
          "1,000.00",
          "INR",
          "1.00000",
          "1,000.00",
          "1,000.00",
          "",
          "",
          "",
          "",
          "",
          "0.00",
          "0.00",
          "1,000.00"
        ]
      ],
      "gstSummary": [
        {
          "k": "GST18-I/U GST18%",
          "v": "576.00"
        }
      ],
      "containerNote": "TTNU0712894 · 40' FLAT · GENERAL CARGO · 3 PACKAGES · 22,700.000 KGS",
      "subtotalParts": [
        "4,200.00",
        "576.00",
        "4,776.00"
      ]
    },
    "blocks": [
      {
        "type": "companyHeader"
      },
      {
        "type": "docTitle",
        "text": "INVOICE - BOMINV230500382",
        "align": "center"
      },
      {
        "type": "twoColumn",
        "showBillTo": true,
        "showCreditTerm": true
      },
      {
        "type": "taxAmountBox"
      },
      {
        "type": "fieldGrid",
        "cols": 2
      },
      {
        "type": "containerNote"
      },
      {
        "type": "chargeTable",
        "headerColor": "fill"
      },
      {
        "type": "wordsAndTotal"
      },
      {
        "type": "termsBank"
      },
      {
        "type": "colorfulFooter"
      }
    ]
  },
  {
    "code": "INVOICE_REPORT_FORMAT_71",
    "formatNumber": 71,
    "name": "Invoice Report Format-71 Proforma Invoice All Charges",
    "paper": "A4",
    "rtl": false,
    "theme": {
      "primary": "#000000",
      "accent": "#0F4D96",
      "fill": "#F3F3F3",
      "panel": "#EBF0F4",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#9AD7FF",
      "ink": "#101010",
      "gray": "#656565",
      "white": "#FFFFFF"
    },
    "branding": {
      "company": "KingFisher Logistic",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "info@kingfisherwingsgroup.com",
      "logo": "kingfisher"
    },
    "demo": {
      "billToLabel": "Bill To",
      "billToName": "4G LOGISTICS INDIA PVT LTD",
      "billToAddress": "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD, CHENNAI TAMIL NADU 600084",
      "invoiceNo": "CAE190028",
      "currency": "INR",
      "words": "Rupee One Thousand Two Hundred Fifty Only",
      "total": "1,250.00",
      "partyLeft": {
        "title": "Bill To",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084"
        ]
      },
      "partyMid": {
        "title": "Shipper",
        "lines": [
          "BABU SECTOR PTLTD",
          "144/78B GKM TOWERS MUTHUSAMY STREET",
          "NEELANKARAI CHENNAI"
        ]
      },
      "partyThird": {
        "title": "Consignee",
        "lines": [
          "AL NASER TRADING COMPANY LLC",
          "30 AL MAKTHOOM BUILDING",
          "SHARJAH UNITED ARAB EMIRATES"
        ]
      },
      "partyNotify": {
        "title": "Notify",
        "lines": [
          "AL NASER TRADING COMPANY LLC",
          "SHARJAH UNITED ARAB EMIRATES"
        ]
      },
      "metaRows": [
        {
          "k": "Proforma",
          "v": "CAE190028 / 20-FEB-19"
        }
      ],
      "fieldGrid": [
        {
          "k": "Job No",
          "v": "CAE190028 / 20-FEB-19"
        },
        {
          "k": "Shipment No",
          "v": "B/AE/19/0112 / 18-FEB-19"
        },
        {
          "k": "MAWB / MBL No",
          "v": "17623456882 / 18-FEB-19"
        },
        {
          "k": "HAWB / HBL No",
          "v": "MAA/DXB/1900014 / 18-FEB-19"
        },
        {
          "k": "Place of Receipt",
          "v": "CHENNAI"
        },
        {
          "k": "Port of Loading",
          "v": "CHENNAI, INDIA"
        },
        {
          "k": "Port of Discharge",
          "v": "DUBAI INTERNATIONAL AIRPORT"
        },
        {
          "k": "Place of Delivery",
          "v": "DUBAI"
        },
        {
          "k": "ETD / ETA",
          "v": "20-FEB-19 / 20-FEB-19"
        },
        {
          "k": "Airline / Carrier",
          "v": "EMIRATES"
        },
        {
          "k": "Flight",
          "v": "EK9876"
        },
        {
          "k": "Service Type",
          "v": "AIR"
        },
        {
          "k": "PP / CC",
          "v": "PREPAID"
        }
      ],
      "tableHeaders": [
        "Charge",
        "Unit",
        "PP/CC",
        "Currency",
        "Amount/Unit",
        "Qty",
        "FCY Amount",
        "Ex.Rate",
        "Amount",
        "Taxable"
      ],
      "tableRows": [
        [
          "FREIGHT",
          "KG",
          "PP",
          "INR",
          "10.00",
          "125",
          "1,250.00",
          "1.00000",
          "1,250.00",
          "1,250.00"
        ]
      ],
      "containerNote": "STC: PAPER CUPS · 100 pcs · 1,250.000 KGS"
    },
    "blocks": [
      {
        "type": "companyHeader"
      },
      {
        "type": "docTitle",
        "text": "PROFORMA INVOICE",
        "align": "center"
      },
      {
        "type": "partyTriple"
      },
      {
        "type": "fieldGrid",
        "cols": 2
      },
      {
        "type": "containerNote"
      },
      {
        "type": "chargeTable",
        "headerColor": "fill"
      },
      {
        "type": "wordsAndTotal"
      },
      {
        "type": "colorfulFooter"
      }
    ]
  },
  {
    "code": "INVOICE_REPORT_FORMAT_72",
    "formatNumber": 72,
    "name": "Invoice Report Format-72 Standard Tax Invoice Format-13",
    "paper": "A4",
    "rtl": false,
    "theme": {
      "primary": "#000000",
      "accent": "#0F4D96",
      "fill": "#F3F3F3",
      "panel": "#EBF0F4",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#9AD7FF",
      "ink": "#101010",
      "gray": "#656565",
      "white": "#FFFFFF"
    },
    "branding": {
      "company": "KingFisher Logistic",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "info@kingfisherwingsgroup.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "BOMINV230500382",
      "invoiceDate": "17-MAY-23",
      "dueDate": "24-MAY-23",
      "billToLabel": "Invoice Receiver",
      "billToName": "DEMO LOGISTICS INDIA PVT LTD",
      "billToAddress": "21, PORT BLAIR, KRISHNA ST, MANNARGUDI, TAMIL NADU, INDIA, 676876",
      "billToPhone": "798798798",
      "fax": "9879878",
      "vatNo": "68768978898098",
      "billToGstin": "888329087642356",
      "creditTerm": "CASH",
      "currency": "INR",
      "words": "Rupee Four Thousand Seven Hundred Seventy-Six Only",
      "subtotal": "4,200.00",
      "tax": "576.00",
      "total": "4,776.00",
      "narration": "MBL NO... / HBL NO. NSAJED85630124277 / JOB NO.",
      "officeAddressLines": [
        "MUMBAI",
        "406, 4TH FLOOR, D-21 CORPORATE PARK, SECTOR 21,, MUMBAI, Pincode : 400001"
      ],
      "taxAmountLines": [
        "GST18-I/U GST18% 576.00"
      ],
      "metaRows": [
        {
          "k": "Invoice No.",
          "v": "BOMINV230500382"
        },
        {
          "k": "Date",
          "v": "17-MAY-23 (POSTED)"
        },
        {
          "k": "Consignee",
          "v": "DEMO STEEL FACTORY CO. LTD."
        },
        {
          "k": "Job No.",
          "v": "—"
        }
      ],
      "termsLines": [
        "1. Payment to be made by cash. The company is not responsible for any cash settlement without an official receipt."
      ],
      "bankLines": [
        "Beneficiary Name: KingFisher Logistic",
        "Bank : HDFC",
        "A/c No : XXXXXXXXXXX",
        "IBAN Code : ABA:XXXXXX",
        "Swift Code : XXXXXX",
        "Address : Dubai, United Arab Emirates"
      ],
      "osTableHeaders": [
        "Date",
        "Voucher No",
        "Narration",
        "Currency",
        "FCY Amount",
        "O/S FCY Amount",
        "Aging"
      ],
      "osTableRows": [
        [
          "16-MAY-23",
          "BOMINV230500371",
          "MBL NO... / HBL NO. 6676687 / JOB NO.CBOMEXP230764",
          "INR",
          "944.00",
          "944.00",
          "1"
        ]
      ],
      "agingHeaders": [
        "Currency",
        "Total O/S",
        "< 30",
        "30 - 60",
        "60 - 90",
        "90 - 120",
        "120 - 150",
        "150 - 180",
        "180+"
      ],
      "agingRow": [
        "INR",
        "944.00",
        "944.00",
        "",
        "",
        "",
        "",
        "",
        ""
      ],
      "fieldGrid": [
        {
          "k": "MBL No.",
          "v": "—"
        },
        {
          "k": "GSTIN",
          "v": "—"
        },
        {
          "k": "Shipper",
          "v": "DEMO-SHIPPER ENGG COMPANY"
        },
        {
          "k": "Port of Discharge",
          "v": "JEDDAH, SAUDI ARABIA"
        },
        {
          "k": "Place of Delivery",
          "v": "JEDDAH SAUDI ARABIA"
        },
        {
          "k": "Narration",
          "v": "MBL NO... / HBL NO. NSAJED85630124277 / JOB NO."
        },
        {
          "k": "HBL No.",
          "v": "NSAJED85630124277"
        },
        {
          "k": "ETA",
          "v": "20-MAR-23"
        },
        {
          "k": "Reference",
          "v": "—"
        },
        {
          "k": "Port of Loading",
          "v": "NHAVA SHEVA, INDIA"
        },
        {
          "k": "Place of Receipt",
          "v": "INMAA-CHENNAI"
        },
        {
          "k": "ETD",
          "v": "01-MAR-23"
        },
        {
          "k": "Vessel / Voyage",
          "v": "CAP SAN JUAN / 310W"
        }
      ],
      "tableHeaders": [
        "Description of Charges",
        "SAC",
        "Tax %",
        "Qty",
        "Unit",
        "Curr.",
        "Amount/Unit",
        "Ex.Rate",
        "Amount",
        "Non Taxable",
        "Taxable",
        "Tax Amt"
      ],
      "tableRows": [
        [
          "FREIGHT CHARGE",
          "",
          "18",
          "1",
          "1 TON OR 1/2 MEASURE",
          "INR",
          "1,500.00",
          "1.00",
          "1,500.00",
          "",
          "1,500.00",
          "270.00"
        ],
        [
          "LOCAL CHARGES",
          "",
          "18",
          "1",
          "—",
          "INR",
          "800.00",
          "1.00",
          "800.00",
          "",
          "800.00",
          "144.00"
        ],
        [
          "SEA FREIGHT CHARGE",
          "",
          "18",
          "1",
          "1 TON OR 1/2 MEASURE",
          "INR",
          "900.00",
          "1.00",
          "900.00",
          "",
          "900.00",
          "162.00"
        ],
        [
          "CONTAINER CLEANING FEE",
          "",
          "15",
          "1",
          "1 TON OR 1/2 MEASURE",
          "INR",
          "1,000.00",
          "1.00",
          "1,000.00",
          "",
          "1,000.00",
          "0.00"
        ]
      ],
      "subtotalParts": [
        "4,200.00",
        "576.00"
      ],
      "containerNote": "TTNU0712894,",
      "totalLabel": "Total : INR"
    },
    "blocks": [
      {
        "type": "companyHeader"
      },
      {
        "type": "docTitle",
        "text": "TAX INVOICE",
        "align": "center"
      },
      {
        "type": "twoColumn",
        "showBillTo": true
      },
      {
        "type": "fieldGrid",
        "cols": 2
      },
      {
        "type": "chargeTable",
        "headerColor": "fill"
      },
      {
        "type": "subtotalBar",
        "variant": "igst"
      },
      {
        "type": "taxAmountBox"
      },
      {
        "type": "wordsAndTotal"
      },
      {
        "type": "containerNote"
      },
      {
        "type": "termsBank"
      },
      {
        "type": "colorfulFooter"
      }
    ]
  },
  {
    "code": "INVOICE_REPORT_FORMAT_73",
    "formatNumber": 73,
    "name": "Invoice Report Format-73 Standard Tax Invoice Format-14",
    "paper": "A4",
    "rtl": false,
    "theme": {
      "primary": "#000000",
      "accent": "#0F4D96",
      "fill": "#F3F3F3",
      "panel": "#EBF0F4",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#9AD7FF",
      "ink": "#101010",
      "gray": "#656565",
      "white": "#FFFFFF"
    },
    "branding": {
      "company": "KingFisher Logistic",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "info@kingfisherwingsgroup.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "BOMINV230500382",
      "invoiceDate": "17-MAY-23",
      "dueDate": "24-MAY-23",
      "billToLabel": "Invoice Receiver",
      "billToName": "DEMO LOGISTICS INDIA PVT LTD",
      "billToAddress": "21, PORT BLAIR, KRISHNA ST, MANNARGUDI, TAMIL NADU, INDIA, 676876",
      "billToPhone": "798798798",
      "fax": "9879878",
      "vatNo": "68768978898098",
      "billToGstin": "888329087642356",
      "creditTerm": "CASH",
      "currency": "INR",
      "words": "Rupee Four Thousand Seven Hundred Seventy-Six Only",
      "subtotal": "4,200.00",
      "tax": "576.00",
      "total": "4,776.00",
      "narration": "MBL NO... / HBL NO. NSAJED85630124277 / JOB NO.",
      "officeAddressLines": [
        "MUMBAI",
        "406, 4TH FLOOR, D-21 CORPORATE PARK, SECTOR 21,, MUMBAI, Pincode : 400001"
      ],
      "taxAmountLines": [
        "GST18-I/U GST18% 576.00"
      ],
      "metaRows": [
        {
          "k": "Invoice No.",
          "v": "BOMINV230500382"
        },
        {
          "k": "Date",
          "v": "17-MAY-23 (POSTED)"
        },
        {
          "k": "Payment Due date",
          "v": "17-MAY-23"
        },
        {
          "k": "Job No.",
          "v": "—"
        },
        {
          "k": "TRN No.",
          "v": "68768978898098"
        }
      ],
      "termsLines": [
        "1. Payment to be made by cash. The company is not responsible for any cash settlement without an official receipt."
      ],
      "bankLines": [
        "Beneficiary Name: KingFisher Logistic",
        "Bank : HDFC",
        "A/c No : XXXXXXXXXXX",
        "IBAN Code : ABA:XXXXXX",
        "Swift Code : XXXXXX",
        "Address : Dubai, United Arab Emirates"
      ],
      "osTableHeaders": [
        "Date",
        "Voucher No",
        "Narration",
        "Currency",
        "FCY Amount",
        "O/S FCY Amount",
        "Aging"
      ],
      "osTableRows": [
        [
          "16-MAY-23",
          "BOMINV230500371",
          "MBL NO... / HBL NO. 6676687 / JOB NO.CBOMEXP230764",
          "INR",
          "944.00",
          "944.00",
          "1"
        ]
      ],
      "agingHeaders": [
        "Currency",
        "Total O/S",
        "< 30",
        "30 - 60",
        "60 - 90",
        "90 - 120",
        "120 - 150",
        "150 - 180",
        "180+"
      ],
      "agingRow": [
        "INR",
        "944.00",
        "944.00",
        "",
        "",
        "",
        "",
        "",
        ""
      ],
      "fieldGrid": [
        {
          "k": "Consignee",
          "v": "DEMO STEEL FACTORY CO. LTD."
        },
        {
          "k": "Shipper",
          "v": "DEMO-SHIPPER ENGG COMPANY"
        },
        {
          "k": "Port of Discharge",
          "v": "JEDDAH, SAUDI ARABIA"
        },
        {
          "k": "Place of Delivery",
          "v": "JEDDAH SAUDI ARABIA"
        },
        {
          "k": "Narration",
          "v": "MBL NO... / HBL NO. NSAJED85630124277 / JOB NO."
        },
        {
          "k": "HBL No.",
          "v": "NSAJED85630124277"
        },
        {
          "k": "MBL No.",
          "v": "—"
        },
        {
          "k": "Port of Loading",
          "v": "NHAVA SHEVA, INDIA"
        },
        {
          "k": "Place of Receipt",
          "v": "INMAA-CHENNAI"
        },
        {
          "k": "INCO Terms",
          "v": "FOB"
        },
        {
          "k": "ETD",
          "v": "01-MAR-23"
        },
        {
          "k": "ETA",
          "v": "20-MAR-23"
        },
        {
          "k": "Vessel / Voyage",
          "v": "CAP SAN JUAN / 310W"
        }
      ],
      "tableHeaders": [
        "Charge",
        "Tax %",
        "Qty",
        "Unit",
        "Cur.",
        "Ex.Rate",
        "Amount / Qty",
        "Amount",
        "Non Taxable",
        "Taxable",
        "Tax Amt"
      ],
      "tableRows": [
        [
          "FREIGHT CHARGE",
          "18",
          "1.00",
          "1 TON OR 1/2 MEASURE",
          "INR",
          "1.000000",
          "1,500.000",
          "1,500.00",
          "",
          "1,500.00",
          "270.00"
        ],
        [
          "LOCAL CHARGES",
          "18",
          "1.00",
          "—",
          "INR",
          "1.000000",
          "800.000",
          "800.00",
          "",
          "800.00",
          "144.00"
        ],
        [
          "SEA FREIGHT CHARGE",
          "18",
          "1.00",
          "1 TON OR 1/2 MEASURE",
          "INR",
          "1.000000",
          "900.000",
          "900.00",
          "",
          "900.00",
          "162.00"
        ],
        [
          "CONTAINER CLEANING FEE",
          "15",
          "1.00",
          "1 TON OR 1/2 MEASURE",
          "INR",
          "1.000000",
          "1,000.000",
          "1,000.00",
          "",
          "1,000.00",
          "0.00"
        ]
      ],
      "containerHeaders": [
        "Container No.",
        "Size / Type",
        "Description",
        "Qty / Pcs",
        "Gross Weight",
        "Volume"
      ],
      "containerRow": [
        "TTNU0712894",
        "40' FLAT",
        "GENERAL CARGO",
        "3 PACKAGES",
        "22,700.000",
        "22,700.000"
      ],
      "totalLabel": "Total : INR"
    },
    "blocks": [
      {
        "type": "companyHeader"
      },
      {
        "type": "docTitle",
        "text": "TAX INVOICE",
        "align": "center"
      },
      {
        "type": "twoColumn",
        "showBillTo": true
      },
      {
        "type": "fieldGrid",
        "cols": 2
      },
      {
        "type": "chargeTable",
        "headerColor": "fill"
      },
      {
        "type": "totalsOnly"
      },
      {
        "type": "taxAmountBox"
      },
      {
        "type": "wordsAndTotal"
      },
      {
        "type": "containerStrip"
      },
      {
        "type": "termsBank"
      },
      {
        "type": "colorfulFooter"
      }
    ]
  },
  {
    "code": "INVOICE_REPORT_FORMAT_74",
    "formatNumber": 74,
    "name": "Invoice Report Format-74 Standard Tax Invoice Format-15",
    "paper": "A4",
    "rtl": false,
    "theme": {
      "primary": "#000000",
      "accent": "#0F4D96",
      "fill": "#F3F3F3",
      "panel": "#EBF0F4",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#9AD7FF",
      "ink": "#101010",
      "gray": "#656565",
      "white": "#FFFFFF"
    },
    "branding": {
      "company": "KingFisher Logistic",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "info@kingfisherwingsgroup.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "BOMINV230500382",
      "invoiceDate": "17-MAY-23",
      "dueDate": "24-MAY-23",
      "billToLabel": "Invoice To",
      "billToName": "Demo Logistics India Pvt Ltd",
      "billToAddress": "21, PORT BLAIR, KRISHNA ST, MANNARGUDI, TAMIL NADU, INDIA, 676876",
      "billToPhone": "798798798",
      "fax": "9879878",
      "vatNo": "68768978898098",
      "billToGstin": "888329087642356",
      "creditTerm": "CASH",
      "currency": "INR",
      "words": "Rupee Four Thousand Seven Hundred Seventy-Six Only",
      "subtotal": "4,200.00",
      "tax": "576.00",
      "total": "4,776.00",
      "narration": "MBL NO... / HBL NO. NSAJED85630124277 / JOB NO.",
      "officeAddressLines": [
        "MUMBAI",
        "406, 4TH FLOOR, D-21 CORPORATE PARK, SECTOR 21,, MUMBAI, Pincode : 400001"
      ],
      "taxAmountLines": [
        "GST18"
      ],
      "metaRows": [
        {
          "k": "Date",
          "v": "17-MAY-23"
        },
        {
          "k": "Customer ID #",
          "v": "DEMOCLIEJK001"
        },
        {
          "k": "Payment Due By",
          "v": "17-MAY-23"
        },
        {
          "k": "Invoice #",
          "v": "BOMINV230500382"
        }
      ],
      "termsLines": [
        "1. Payment to be made by cash. The company is not responsible for any cash settlement without an official receipt."
      ],
      "bankLines": [
        "Beneficiary Name: KingFisher Logistic",
        "Bank : HDFC",
        "A/c No : XXXXXXXXXXX",
        "IBAN Code : ABA:XXXXXX",
        "Swift Code : XXXXXX",
        "Address : Dubai, United Arab Emirates"
      ],
      "osTableHeaders": [
        "Date",
        "Voucher No",
        "Narration",
        "Currency",
        "FCY Amount",
        "O/S FCY Amount",
        "Aging"
      ],
      "osTableRows": [
        [
          "16-MAY-23",
          "BOMINV230500371",
          "MBL NO... / HBL NO. 6676687 / JOB NO.CBOMEXP230764",
          "INR",
          "944.00",
          "944.00",
          "1"
        ]
      ],
      "agingHeaders": [
        "Currency",
        "Total O/S",
        "< 30",
        "30 - 60",
        "60 - 90",
        "90 - 120",
        "120 - 150",
        "150 - 180",
        "180+"
      ],
      "agingRow": [
        "INR",
        "944.00",
        "944.00",
        "",
        "",
        "",
        "",
        "",
        ""
      ],
      "fieldGrid": [
        {
          "k": "Our Ref",
          "v": "—"
        },
        {
          "k": "Your Ref",
          "v": "—"
        },
        {
          "k": "Origin",
          "v": "Nhava Sheva, India"
        },
        {
          "k": "Destination",
          "v": "Jeddah, Saudi Arabia"
        },
        {
          "k": "Vessel Info",
          "v": "CAP SAN JUAN 310W · 1 x 40' FLAT"
        },
        {
          "k": "BL Ref",
          "v": "NSAJED85630124277"
        },
        {
          "k": "Cargo",
          "v": "GENERAL CARGO"
        },
        {
          "k": "Container No",
          "v": "TTNU0712894"
        },
        {
          "k": "Volume",
          "v": "—"
        },
        {
          "k": "Shipped On",
          "v": "—"
        }
      ],
      "tableHeaders": [
        "Sl No.",
        "Description of Charges",
        "Basis / Unit",
        "VAT - (INR)",
        "Value - (INR)"
      ],
      "tableRows": [
        [
          "1",
          "Freight Charge",
          "1 Ton Or 1/2 Measure",
          "INR",
          "1,500.00"
        ],
        [
          "2",
          "Local Charges",
          "—",
          "INR",
          "800.00"
        ],
        [
          "3",
          "Sea Freight Charge",
          "1 Ton Or 1/2 Measure",
          "INR",
          "900.00"
        ],
        [
          "4",
          "Container Cleaning Fee",
          "1 Ton Or 1/2 Measure",
          "INR",
          "1,000.00"
        ]
      ],
      "totalLabel": "Grand Total INR"
    },
    "blocks": [
      {
        "type": "companyHeader"
      },
      {
        "type": "docTitle",
        "text": "TAX INVOICE",
        "align": "center"
      },
      {
        "type": "twoColumn",
        "showBillTo": true
      },
      {
        "type": "fieldGrid",
        "cols": 2
      },
      {
        "type": "chargeTable",
        "headerColor": "fill"
      },
      {
        "type": "totalsOnly"
      },
      {
        "type": "taxAmountBox"
      },
      {
        "type": "wordsAndTotal"
      },
      {
        "type": "termsBank"
      },
      {
        "type": "stampSignature"
      },
      {
        "type": "colorfulFooter"
      }
    ]
  },
  {
    "code": "INVOICE_REPORT_FORMAT_75",
    "formatNumber": 75,
    "name": "Invoice Report Format-75 Standard Tax Invoice Format-16",
    "paper": "A4",
    "rtl": false,
    "theme": {
      "primary": "#000000",
      "accent": "#0F4D96",
      "fill": "#F3F3F3",
      "panel": "#EBF0F4",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#9AD7FF",
      "ink": "#101010",
      "gray": "#656565",
      "white": "#FFFFFF"
    },
    "branding": {
      "company": "KingFisher Logistic",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "info@kingfisherwingsgroup.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "BOMINV230500382",
      "invoiceDate": "17-MAY-23",
      "dueDate": "24-MAY-23",
      "billToLabel": "Bill To",
      "billToName": "DEMO LOGISTICS INDIA PVT LTD",
      "billToAddress": "21, PORT BLAIR, KRISHNA ST, MANNARGUDI, TAMIL NADU, INDIA, 676876",
      "billToPhone": "798798798",
      "fax": "9879878",
      "vatNo": "68768978898098",
      "billToGstin": "888329087642356",
      "creditTerm": "CASH",
      "currency": "INR",
      "words": "Rupee Four Thousand Seven Hundred Seventy-Six Only",
      "subtotal": "4,200.00",
      "tax": "576.00",
      "total": "4,776.00",
      "narration": "MBL NO... / HBL NO. NSAJED85630124277 / JOB NO.",
      "officeAddressLines": [
        "MUMBAI",
        "406, 4TH FLOOR, D-21 CORPORATE PARK, SECTOR 21,, MUMBAI, Pincode : 400001"
      ],
      "taxAmountLines": [
        "GST18",
        "GST 15%"
      ],
      "metaRows": [
        {
          "k": "Invoice No.",
          "v": "BOMINV230500382 17-MAY-23 (POSTED)"
        },
        {
          "k": "Credit Term",
          "v": "CASH"
        },
        {
          "k": "TRN No.",
          "v": "68768978898098"
        },
        {
          "k": "Job No.",
          "v": "—"
        }
      ],
      "termsLines": [
        "1. Payment to be made by cash. The company is not responsible for any cash settlement without an official receipt."
      ],
      "bankLines": [
        "Beneficiary Name: KingFisher Logistic",
        "Bank : HDFC",
        "A/c No : XXXXXXXXXXX",
        "IBAN Code : ABA:XXXXXX",
        "Swift Code : XXXXXX",
        "Address : Dubai, United Arab Emirates"
      ],
      "osTableHeaders": [
        "Date",
        "Voucher No",
        "Narration",
        "Currency",
        "FCY Amount",
        "O/S FCY Amount",
        "Aging"
      ],
      "osTableRows": [
        [
          "16-MAY-23",
          "BOMINV230500371",
          "MBL NO... / HBL NO. 6676687 / JOB NO.CBOMEXP230764",
          "INR",
          "944.00",
          "944.00",
          "1"
        ]
      ],
      "agingHeaders": [
        "Currency",
        "Total O/S",
        "< 30",
        "30 - 60",
        "60 - 90",
        "90 - 120",
        "120 - 150",
        "150 - 180",
        "180+"
      ],
      "agingRow": [
        "INR",
        "944.00",
        "944.00",
        "",
        "",
        "",
        "",
        "",
        ""
      ],
      "fieldGrid": [
        {
          "k": "Shipper",
          "v": "DEMO-SHIPPER ENGG COMPANY"
        },
        {
          "k": "Consignee",
          "v": "DEMO STEEL FACTORY CO. LTD."
        },
        {
          "k": "MBL No.",
          "v": "—"
        },
        {
          "k": "HBL No.",
          "v": "NSAJED85630124277"
        },
        {
          "k": "Port of Loading",
          "v": "NHAVA SHEVA, INDIA"
        },
        {
          "k": "Port of Discharge",
          "v": "JEDDAH, SAUDI ARABIA"
        },
        {
          "k": "Place of Receipt",
          "v": "INMAA-CHENNAI"
        },
        {
          "k": "Place of Delivery",
          "v": "JEDDAH SAUDI ARABIA"
        },
        {
          "k": "ETD",
          "v": "01-MAR-23"
        },
        {
          "k": "ETA",
          "v": "20-MAR-23"
        },
        {
          "k": "Vessel / Voyage",
          "v": "CAP SAN JUAN / 310W"
        },
        {
          "k": "Narration",
          "v": "MBL NO... / HBL NO. NSAJED85630124277 / JOB NO."
        },
        {
          "k": "Shipment No.",
          "v": "BOM/EXP/23/05/B/0709 / 16-MAY-23"
        },
        {
          "k": "Currency",
          "v": "INR 1.000000"
        },
        {
          "k": "HBL/AWB No.",
          "v": "NSAJED85630124277"
        },
        {
          "k": "BOE No",
          "v": "—"
        }
      ],
      "tableHeaders": [
        "Charge",
        "Unit",
        "Qty",
        "Amount / Qty",
        "Currency",
        "Ex.Rate",
        "FCY Amount",
        "Taxable Amount",
        "Non Taxable",
        "Tax %",
        "Tax Amount",
        "Total Amount (INR)"
      ],
      "tableRows": [
        [
          "FREIGHT CHARGE",
          "1 TON OR 1/2 MEASURE",
          "1",
          "1,500.00",
          "INR",
          "1.000000",
          "1,500.00",
          "1,500.000",
          "",
          "18.00",
          "270.00",
          "1,500.00"
        ],
        [
          "LOCAL CHARGES",
          "—",
          "1",
          "800.00",
          "INR",
          "1.000000",
          "800.00",
          "800.000",
          "",
          "18.00",
          "144.00",
          "800.00"
        ],
        [
          "SEA FREIGHT CHARGE",
          "1 TON OR 1/2 MEASURE",
          "1",
          "900.00",
          "INR",
          "1.000000",
          "900.00",
          "900.000",
          "",
          "18.00",
          "162.00",
          "900.00"
        ],
        [
          "CONTAINER CLEANING FEE",
          "1 TON OR 1/2 MEASURE",
          "1",
          "1,000.00",
          "INR",
          "1.000000",
          "1,000.00",
          "1,000.000",
          "",
          "15.00",
          "0.00",
          "1,000.00"
        ]
      ],
      "containerHeaders": [
        "Container No.",
        "Size / Type",
        "Description",
        "Qty / Pcs",
        "Gross Weight",
        "Volume"
      ],
      "containerRow": [
        "TTNU0712894",
        "40' FLAT",
        "GENERAL CARGO",
        "3 PACKAGES",
        "22,700.000",
        "22,700.000"
      ]
    },
    "blocks": [
      {
        "type": "companyHeader"
      },
      {
        "type": "docTitle",
        "text": "TAX INVOICE - BOMINV230500382",
        "align": "center"
      },
      {
        "type": "twoColumn",
        "showBillTo": true,
        "showCreditTerm": true
      },
      {
        "type": "fieldGrid",
        "cols": 2
      },
      {
        "type": "chargeTable",
        "headerColor": "fill"
      },
      {
        "type": "containerStrip"
      },
      {
        "type": "taxAmountBox"
      },
      {
        "type": "wordsAndTotal"
      },
      {
        "type": "termsBank"
      },
      {
        "type": "colorfulFooter"
      }
    ]
  },
  {
    "code": "INVOICE_REPORT_FORMAT_76",
    "formatNumber": 76,
    "name": "Invoice Report Format-76 Standard Tax Invoice Format-17",
    "paper": "A4",
    "rtl": false,
    "theme": {
      "primary": "#000000",
      "accent": "#0F4D96",
      "fill": "#F3F3F3",
      "panel": "#EBF0F4",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#9AD7FF",
      "ink": "#101010",
      "gray": "#656565",
      "white": "#FFFFFF"
    },
    "branding": {
      "company": "KingFisher Logistic",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "info@kingfisherwingsgroup.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "BOMINV230500382",
      "invoiceDate": "17-MAY-23",
      "dueDate": "24-MAY-23",
      "billToLabel": "Invoice To",
      "billToName": "DEMO LOGISTICS INDIA PVT LTD",
      "billToAddress": "21, PORT BLAIR, KRISHNA ST, MANNARGUDI, TAMIL NADU, INDIA, 676876",
      "billToPhone": "798798798",
      "fax": "9879878",
      "vatNo": "68768978898098",
      "billToGstin": "888329087642356",
      "creditTerm": "CASH",
      "currency": "INR",
      "words": "Rupee Four Thousand Seven Hundred Seventy-Six Only",
      "subtotal": "4,200.00",
      "tax": "576.00",
      "total": "4,776.00",
      "narration": "MBL NO... / HBL NO. NSAJED85630124277 / JOB NO.",
      "officeAddressLines": [
        "MUMBAI",
        "406, 4TH FLOOR, D-21 CORPORATE PARK, SECTOR 21,, MUMBAI, Pincode : 400001"
      ],
      "taxAmountLines": [
        "Amount before Tax 4,200.00",
        "Sub Total 4,200.00"
      ],
      "metaRows": [
        {
          "k": "Invoice No.",
          "v": "BOMINV230500382"
        },
        {
          "k": "Date",
          "v": "17-May-23"
        },
        {
          "k": "Job No.",
          "v": "—"
        },
        {
          "k": "Shipment No.",
          "v": "BOM/EXP/23/05/B/0709 / 16-May-23"
        },
        {
          "k": "Department",
          "v": "FCL EXPORT"
        }
      ],
      "termsLines": [
        "1. Payment to be made by cash. The company is not responsible for any cash settlement without an official receipt."
      ],
      "bankLines": [
        "Beneficiary Name: KingFisher Logistic",
        "Bank : HDFC",
        "A/c No : XXXXXXXXXXX",
        "IBAN Code : ABA:XXXXXX",
        "Swift Code : XXXXXX",
        "Address : Dubai, United Arab Emirates"
      ],
      "osTableHeaders": [
        "Date",
        "Voucher No",
        "Narration",
        "Currency",
        "FCY Amount",
        "O/S FCY Amount",
        "Aging"
      ],
      "osTableRows": [
        [
          "16-MAY-23",
          "BOMINV230500371",
          "MBL NO... / HBL NO. 6676687 / JOB NO.CBOMEXP230764",
          "INR",
          "944.00",
          "944.00",
          "1"
        ]
      ],
      "agingHeaders": [
        "Currency",
        "Total O/S",
        "< 30",
        "30 - 60",
        "60 - 90",
        "90 - 120",
        "120 - 150",
        "150 - 180",
        "180+"
      ],
      "agingRow": [
        "INR",
        "944.00",
        "944.00",
        "",
        "",
        "",
        "",
        "",
        ""
      ],
      "fieldGrid": [
        {
          "k": "MBL No.",
          "v": "—"
        },
        {
          "k": "HBL No.",
          "v": "NSAJED85630124277"
        },
        {
          "k": "Shipper",
          "v": "DEMO-SHIPPER ENGG COMPANY"
        },
        {
          "k": "Origin",
          "v": "NHAVA SHEVA, INDIA"
        },
        {
          "k": "Consignee",
          "v": "DEMO STEEL FACTORY CO. LTD."
        },
        {
          "k": "Destination",
          "v": "JEDDAH, SAUDI ARABIA"
        },
        {
          "k": "Vessel / Voyage",
          "v": "CAP SAN JUAN / 310W"
        },
        {
          "k": "ETD",
          "v": "01-Mar-23"
        },
        {
          "k": "ETA",
          "v": "20-Mar-23"
        },
        {
          "k": "Container No",
          "v": "TTNU0712894"
        },
        {
          "k": "Pieces",
          "v": "3.00 PACKAGES"
        },
        {
          "k": "Gross weight",
          "v": "22,700.00"
        },
        {
          "k": "Narration",
          "v": "MBL NO... / HBL NO. NSAJED85630124277 / JOB NO."
        }
      ],
      "tableHeaders": [
        "Charge",
        "Qty",
        "Cur.",
        "Ex.Rate",
        "Amount / Qty",
        "Tax",
        "VAT",
        "WHT %",
        "WHT",
        "Amount (INR)"
      ],
      "tableRows": [
        [
          "FREIGHT CHARGE",
          "1",
          "INR",
          "1.00000",
          "1,500.000",
          "18",
          "",
          "0.00",
          "",
          "1,500.00"
        ],
        [
          "LOCAL CHARGES",
          "1",
          "INR",
          "1.00000",
          "800.000",
          "18",
          "",
          "0.00",
          "",
          "800.00"
        ],
        [
          "SEA FREIGHT CHARGE",
          "1",
          "INR",
          "1.00000",
          "900.000",
          "18",
          "",
          "0.00",
          "",
          "900.00"
        ],
        [
          "CONTAINER CLEANING FEE",
          "1",
          "INR",
          "1.00000",
          "1,000.000",
          "15",
          "",
          "0.00",
          "",
          "1,000.00"
        ]
      ],
      "totalLabel": "Net Payable : INR"
    },
    "blocks": [
      {
        "type": "companyHeader"
      },
      {
        "type": "docTitle",
        "text": "INVOICE",
        "align": "center"
      },
      {
        "type": "twoColumn",
        "showBillTo": true
      },
      {
        "type": "fieldGrid",
        "cols": 2
      },
      {
        "type": "chargeTable",
        "headerColor": "fill"
      },
      {
        "type": "taxAmountBox"
      },
      {
        "type": "wordsAndTotal"
      },
      {
        "type": "termsBank"
      },
      {
        "type": "colorfulFooter"
      }
    ]
  },
  {
    "code": "INVOICE_REPORT_FORMAT_77",
    "formatNumber": 77,
    "name": "Invoice Report Format-77 Standard Tax Invoice Format-18",
    "paper": "A4",
    "rtl": false,
    "theme": {
      "primary": "#000000",
      "accent": "#0F4D96",
      "fill": "#F3F3F3",
      "panel": "#EBF0F4",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#9AD7FF",
      "ink": "#101010",
      "gray": "#656565",
      "white": "#FFFFFF"
    },
    "branding": {
      "company": "KingFisher Logistic",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "info@kingfisherwingsgroup.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "BOMINV230500382 / (POSTED)",
      "invoiceDate": "17-MAY-23",
      "dueDate": "24-MAY-23",
      "billToLabel": "Bill To",
      "billToName": "DEMO STEEL FACTORY CO. LTD.",
      "billToAddress": "P.O BOX 11700, 8100 UNIT NO 2, JEDDAH, SAUDI ARABIA, 21463",
      "billToPhone": "+966",
      "fax": "9879878",
      "vatNo": "68768978898098",
      "billToGstin": "888329087642356",
      "creditTerm": "CASH",
      "currency": "INR",
      "words": "Rupee Four Thousand Seven Hundred Seventy-Six Only",
      "subtotal": "4,200.00",
      "tax": "576.00",
      "total": "4,776.00",
      "narration": "MBL NO... / HBL NO. NSAJED85630124277 / JOB NO.",
      "officeAddressLines": [
        "MUMBAI",
        "406, 4TH FLOOR, D-21 CORPORATE PARK, SECTOR 21,, MUMBAI, Pincode : 400001"
      ],
      "taxAmountLines": [
        "GST18",
        "GST 15%"
      ],
      "metaRows": [
        {
          "k": "Invoice No.",
          "v": "BOMINV230500382 / (POSTED)"
        },
        {
          "k": "Date",
          "v": "17-MAY-23"
        },
        {
          "k": "Job No.",
          "v": "—"
        },
        {
          "k": "Shipment No.",
          "v": "BOM/EXP/23/05/B/0709 / 16-MAY-23"
        },
        {
          "k": "Currency",
          "v": "INR 1.000000"
        }
      ],
      "termsLines": [
        "1. Payment to be made by cash. The company is not responsible for any cash settlement without an official receipt."
      ],
      "bankLines": [
        "Beneficiary Name: KingFisher Logistic",
        "Bank : HDFC",
        "A/c No : XXXXXXXXXXX",
        "IBAN Code : ABA:XXXXXX",
        "Swift Code : XXXXXX",
        "Address : Dubai, United Arab Emirates"
      ],
      "osTableHeaders": [
        "Date",
        "Voucher No",
        "Narration",
        "Currency",
        "FCY Amount",
        "O/S FCY Amount",
        "Aging"
      ],
      "osTableRows": [
        [
          "16-MAY-23",
          "BOMINV230500371",
          "MBL NO... / HBL NO. 6676687 / JOB NO.CBOMEXP230764",
          "INR",
          "944.00",
          "944.00",
          "1"
        ]
      ],
      "agingHeaders": [
        "Currency",
        "Total O/S",
        "< 30",
        "30 - 60",
        "60 - 90",
        "90 - 120",
        "120 - 150",
        "150 - 180",
        "180+"
      ],
      "agingRow": [
        "INR",
        "944.00",
        "944.00",
        "",
        "",
        "",
        "",
        "",
        ""
      ],
      "fieldGrid": [
        {
          "k": "Shipper",
          "v": "DEMO-SHIPPER ENGG COMPANY"
        },
        {
          "k": "Consignee",
          "v": "DEMO STEEL FACTORY CO. LTD."
        },
        {
          "k": "HBL/AWB No.",
          "v": "NSAJED85630124277"
        },
        {
          "k": "MBL / MAWB No.",
          "v": "—"
        },
        {
          "k": "Port of Loading",
          "v": "NHAVA SHEVA, INDIA"
        },
        {
          "k": "Destination Place",
          "v": "JEDDAH SAUDI ARABIA"
        },
        {
          "k": "Vessel / Flight",
          "v": "CAP SAN JUAN"
        },
        {
          "k": "Voyage / Flight No",
          "v": "310W"
        },
        {
          "k": "Reference No.",
          "v": "—"
        },
        {
          "k": "BOE No",
          "v": "—"
        },
        {
          "k": "Narration",
          "v": "MBL NO... / HBL NO. NSAJED85630124277 / JOB NO."
        }
      ],
      "tableHeaders": [
        "Charge",
        "Unit",
        "Qty",
        "Amount / Qty",
        "Currency",
        "Ex.Rate",
        "FCY Amount",
        "Taxable Amount",
        "Non Taxable",
        "Tax %",
        "Tax Amount",
        "Total Amount (INR)"
      ],
      "tableRows": [
        [
          "FREIGHT CHARGE",
          "1 TON OR 1/2 MEASURE",
          "1",
          "1,500.00",
          "INR",
          "1.000000",
          "1,500.00",
          "1,500.000",
          "",
          "18.00",
          "270.00",
          "1,500.00"
        ],
        [
          "LOCAL CHARGES",
          "—",
          "1",
          "800.00",
          "INR",
          "1.000000",
          "800.00",
          "800.000",
          "",
          "18.00",
          "144.00",
          "800.00"
        ],
        [
          "SEA FREIGHT CHARGE",
          "1 TON OR 1/2 MEASURE",
          "1",
          "900.00",
          "INR",
          "1.000000",
          "900.00",
          "900.000",
          "",
          "18.00",
          "162.00",
          "900.00"
        ],
        [
          "CONTAINER CLEANING FEE",
          "1 TON OR 1/2 MEASURE",
          "1",
          "1,000.00",
          "INR",
          "1.000000",
          "1,000.00",
          "1,000.000",
          "",
          "15.00",
          "0.00",
          "1,000.00"
        ]
      ],
      "containerHeaders": [
        "Container No.",
        "Size / Type",
        "Description",
        "Qty / Pcs",
        "Gross Weight",
        "Volume"
      ],
      "containerRow": [
        "TTNU0712894",
        "40' FLAT",
        "GENERAL CARGO",
        "3 PACKAGES",
        "22,700.000",
        "22,700.000"
      ]
    },
    "blocks": [
      {
        "type": "companyHeader"
      },
      {
        "type": "docTitle",
        "text": "TAX INVOICE",
        "align": "center"
      },
      {
        "type": "twoColumn",
        "showBillTo": true
      },
      {
        "type": "fieldGrid",
        "cols": 2
      },
      {
        "type": "containerStrip"
      },
      {
        "type": "chargeTable",
        "headerColor": "fill"
      },
      {
        "type": "taxAmountBox"
      },
      {
        "type": "wordsAndTotal"
      },
      {
        "type": "termsBank"
      },
      {
        "type": "colorfulFooter"
      }
    ]
  },
  {
    "code": "INVOICE_REPORT_FORMAT_78",
    "formatNumber": 78,
    "name": "Invoice Report Format-78 Standard Tax Invoice Format-19",
    "paper": "A4",
    "rtl": false,
    "theme": {
      "primary": "#000000",
      "accent": "#0F4D96",
      "fill": "#F3F3F3",
      "panel": "#EBF0F4",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#9AD7FF",
      "ink": "#101010",
      "gray": "#656565",
      "white": "#FFFFFF"
    },
    "branding": {
      "company": "KingFisher Logistic",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "info@kingfisherwingsgroup.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "BOMINV230500382",
      "invoiceDate": "17-MAY-23",
      "dueDate": "24-MAY-23",
      "billToLabel": "Client",
      "billToName": "DEMO LOGISTICS INDIA PVT LTD",
      "billToAddress": "21, PORT BLAIR, KRISHNA ST, MANNARGUDI, TAMIL NADU, INDIA, 676876",
      "billToPhone": "798798798",
      "fax": "9879878",
      "vatNo": "68768978898098",
      "billToGstin": "888329087642356",
      "creditTerm": "CASH",
      "currency": "INR",
      "words": "Rupee Four Thousand Seven Hundred Seventy-Six Only",
      "subtotal": "4,200.00",
      "tax": "576.00",
      "total": "4,776.00",
      "narration": "MBL NO... / HBL NO. NSAJED85630124277 / JOB NO.",
      "officeAddressLines": [
        "MUMBAI",
        "406, 4TH FLOOR, D-21 CORPORATE PARK, SECTOR 21,, MUMBAI, Pincode : 400001"
      ],
      "taxAmountLines": [
        "GST18",
        "GST 15%"
      ],
      "metaRows": [
        {
          "k": "Invoice No.",
          "v": "BOMINV230500382"
        },
        {
          "k": "Date",
          "v": "17-MAY-23 (POSTED)"
        },
        {
          "k": "Job No.",
          "v": "—"
        },
        {
          "k": "Shipment No.",
          "v": "BOM/EXP/23/05/B/0709"
        },
        {
          "k": "TRN No.",
          "v": "888329087642356"
        },
        {
          "k": "Department",
          "v": "FCL EXPORT"
        }
      ],
      "termsLines": [
        "1. Payment to be made by cash. The company is not responsible for any cash settlement without an official receipt."
      ],
      "bankLines": [
        "Beneficiary Name: KingFisher Logistic",
        "Bank : HDFC",
        "A/c No : XXXXXXXXXXX",
        "IBAN Code : ABA:XXXXXX",
        "Swift Code : XXXXXX",
        "Address : Dubai, United Arab Emirates"
      ],
      "osTableHeaders": [
        "Date",
        "Voucher No",
        "Narration",
        "Currency",
        "FCY Amount",
        "O/S FCY Amount",
        "Aging"
      ],
      "osTableRows": [
        [
          "16-MAY-23",
          "BOMINV230500371",
          "MBL NO... / HBL NO. 6676687 / JOB NO.CBOMEXP230764",
          "INR",
          "944.00",
          "944.00",
          "1"
        ]
      ],
      "agingHeaders": [
        "Currency",
        "Total O/S",
        "< 30",
        "30 - 60",
        "60 - 90",
        "90 - 120",
        "120 - 150",
        "150 - 180",
        "180+"
      ],
      "agingRow": [
        "INR",
        "944.00",
        "944.00",
        "",
        "",
        "",
        "",
        "",
        ""
      ],
      "fieldGrid": [
        {
          "k": "MBL No.",
          "v": "—"
        },
        {
          "k": "HBL No.",
          "v": "NSAJED85630124277"
        },
        {
          "k": "Shipper",
          "v": "DEMO-SHIPPER ENGG COMPANY"
        },
        {
          "k": "Origin",
          "v": "NHAVA SHEVA, INDIA"
        },
        {
          "k": "Consignee",
          "v": "DEMO STEEL FACTORY CO. LTD."
        },
        {
          "k": "Destination",
          "v": "JEDDAH, SAUDI ARABIA"
        },
        {
          "k": "No of PCS",
          "v": "3 PACKAGES"
        },
        {
          "k": "G Weight",
          "v": "22700 KGS"
        },
        {
          "k": "Place of Delivery",
          "v": "JEDDAH SAUDI ARABIA"
        },
        {
          "k": "Chg.Weight",
          "v": "23 KGS"
        },
        {
          "k": "Nature of Goods",
          "v": "GENERAL CARGO"
        },
        {
          "k": "Narration",
          "v": "MBL NO... / HBL NO. NSAJED85630124277 / JOB NO."
        }
      ],
      "tableHeaders": [
        "Charge",
        "Qty",
        "Cur.",
        "Amount / Qty",
        "Tax %",
        "Amount",
        "VAT Amount (INR)"
      ],
      "tableRows": [
        [
          "FREIGHT CHARGE",
          "1.00",
          "INR",
          "1,500.00",
          "18.00",
          "1,500.00",
          "1,500.00"
        ],
        [
          "LOCAL CHARGES",
          "1.00",
          "INR",
          "800.00",
          "18.00",
          "800.00",
          "800.00"
        ],
        [
          "SEA FREIGHT CHARGE",
          "1.00",
          "INR",
          "900.00",
          "18.00",
          "900.00",
          "900.00"
        ],
        [
          "CONTAINER CLEANING FEE",
          "1.00",
          "INR",
          "1,000.00",
          "15.00",
          "1,000.00",
          "1,000.00"
        ]
      ],
      "containerNote": "TTNU0712894",
      "totalLabel": "Total : INR"
    },
    "blocks": [
      {
        "type": "companyHeader"
      },
      {
        "type": "docTitle",
        "text": "TAX INVOICE",
        "align": "center"
      },
      {
        "type": "twoColumn",
        "showBillTo": true
      },
      {
        "type": "fieldGrid",
        "cols": 2
      },
      {
        "type": "chargeTable",
        "headerColor": "fill"
      },
      {
        "type": "totalsOnly"
      },
      {
        "type": "wordsAndTotal"
      },
      {
        "type": "containerNote"
      },
      {
        "type": "termsBank"
      },
      {
        "type": "colorfulFooter"
      }
    ]
  },
  {
    "code": "INVOICE_REPORT_FORMAT_79",
    "formatNumber": 79,
    "name": "Invoice Report Format-79 Standard Tax Invoice Format-20",
    "paper": "A4",
    "rtl": false,
    "theme": {
      "primary": "#000000",
      "accent": "#0F4D96",
      "fill": "#F3F3F3",
      "panel": "#EBF0F4",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#9AD7FF",
      "ink": "#101010",
      "gray": "#656565",
      "white": "#FFFFFF"
    },
    "branding": {
      "company": "KingFisher Logistic",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "info@kingfisherwingsgroup.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "BOMINV230500382",
      "invoiceDate": "17-MAY-23",
      "dueDate": "24-MAY-23",
      "billToLabel": "Bill To",
      "billToName": "DEMO LOGISTICS INDIA PVT LTD",
      "billToAddress": "21, PORT BLAIR, KRISHNA ST, MANNARGUDI, TAMIL NADU, INDIA, 676876",
      "billToPhone": "798798798",
      "fax": "9879878",
      "vatNo": "68768978898098",
      "billToGstin": "888329087642356",
      "creditTerm": "CASH",
      "currency": "INR",
      "words": "Rupee Four Thousand Seven Hundred Seventy-Six Only",
      "subtotal": "4,200.00",
      "tax": "576.00",
      "total": "4,776.00",
      "narration": "MBL NO... / HBL NO. NSAJED85630124277 / JOB NO.",
      "officeAddressLines": [
        "MUMBAI",
        "406, 4TH FLOOR, D-21 CORPORATE PARK, SECTOR 21,, MUMBAI, Pincode : 400001"
      ],
      "taxAmountLines": [
        "GST18",
        "GST 15%"
      ],
      "metaRows": [
        {
          "k": "Invoice No.",
          "v": "BOMINV230500382 17-MAY-23 (POSTED)"
        },
        {
          "k": "Credit Term",
          "v": "CASH"
        },
        {
          "k": "TRN No.",
          "v": "68768978898098"
        },
        {
          "k": "Job No.",
          "v": "—"
        },
        {
          "k": "Shipment No.",
          "v": "BOM/EXP/23/05/B/0709 / 16-MAY-23"
        },
        {
          "k": "HBL/AWB No.",
          "v": "NSAJED85630124277"
        }
      ],
      "termsLines": [
        "1. Payment to be made by cash. The company is not responsible for any cash settlement without an official receipt."
      ],
      "bankLines": [
        "Beneficiary Name: KingFisher Logistic",
        "Bank : HDFC",
        "A/c No : XXXXXXXXXXX",
        "IBAN Code : ABA:XXXXXX",
        "Swift Code : XXXXXX",
        "Address : Dubai, United Arab Emirates"
      ],
      "osTableHeaders": [
        "Date",
        "Voucher No",
        "Narration",
        "Currency",
        "FCY Amount",
        "O/S FCY Amount",
        "Aging"
      ],
      "osTableRows": [
        [
          "16-MAY-23",
          "BOMINV230500371",
          "MBL NO... / HBL NO. 6676687 / JOB NO.CBOMEXP230764",
          "INR",
          "944.00",
          "944.00",
          "1"
        ]
      ],
      "agingHeaders": [
        "Currency",
        "Total O/S",
        "< 30",
        "30 - 60",
        "60 - 90",
        "90 - 120",
        "120 - 150",
        "150 - 180",
        "180+"
      ],
      "agingRow": [
        "INR",
        "944.00",
        "944.00",
        "",
        "",
        "",
        "",
        "",
        ""
      ],
      "fieldGrid": [
        {
          "k": "Shipper",
          "v": "DEMO-SHIPPER ENGG COMPANY"
        },
        {
          "k": "Consignee",
          "v": "DEMO STEEL FACTORY CO. LTD."
        },
        {
          "k": "MBL No.",
          "v": "—"
        },
        {
          "k": "HBL No.",
          "v": "NSAJED85630124277"
        },
        {
          "k": "Port of Loading",
          "v": "NHAVA SHEVA, INDIA"
        },
        {
          "k": "Port of Discharge",
          "v": "JEDDAH, SAUDI ARABIA"
        },
        {
          "k": "Place of Receipt",
          "v": "INMAA-CHENNAI"
        },
        {
          "k": "Place of Delivery",
          "v": "JEDDAH SAUDI ARABIA"
        },
        {
          "k": "ETD",
          "v": "01-MAR-23"
        },
        {
          "k": "ETA",
          "v": "20-MAR-23"
        },
        {
          "k": "Vessel / Voyage",
          "v": "CAP SAN JUAN / 310W"
        },
        {
          "k": "Narration",
          "v": "MBL NO... / HBL NO. NSAJED85630124277 / JOB NO."
        }
      ],
      "tableHeaders": [
        "Charge",
        "Unit",
        "Qty",
        "Amount / Qty",
        "Currency",
        "Ex.Rate",
        "FCY Amount",
        "Taxable Amount",
        "Non Taxable",
        "Tax %",
        "Tax Amount",
        "Total Amount (INR)"
      ],
      "tableRows": [
        [
          "FREIGHT CHARGE",
          "1 TON OR 1/2 MEASURE",
          "1",
          "1,500.00",
          "INR",
          "1.000000",
          "1,500.00",
          "1,500.000",
          "",
          "18.00",
          "270.00",
          "1,500.00"
        ],
        [
          "LOCAL CHARGES",
          "—",
          "1",
          "800.00",
          "INR",
          "1.000000",
          "800.00",
          "800.000",
          "",
          "18.00",
          "144.00",
          "800.00"
        ],
        [
          "SEA FREIGHT CHARGE",
          "1 TON OR 1/2 MEASURE",
          "1",
          "900.00",
          "INR",
          "1.000000",
          "900.00",
          "900.000",
          "",
          "18.00",
          "162.00",
          "900.00"
        ],
        [
          "CONTAINER CLEANING FEE",
          "1 TON OR 1/2 MEASURE",
          "1",
          "1,000.00",
          "INR",
          "1.000000",
          "1,000.00",
          "1,000.000",
          "",
          "15.00",
          "0.00",
          "1,000.00"
        ]
      ],
      "containerHeaders": [
        "Container No.",
        "Size / Type",
        "Description",
        "Qty / Pcs",
        "Gross Weight",
        "Volume"
      ],
      "containerRow": [
        "TTNU0712894",
        "40' FLAT",
        "GENERAL CARGO",
        "3 PACKAGES",
        "22,700.000",
        "22,700.000"
      ]
    },
    "blocks": [
      {
        "type": "companyHeader"
      },
      {
        "type": "docTitle",
        "text": "TAX INVOICE - BOMINV230500382",
        "align": "center"
      },
      {
        "type": "twoColumn",
        "showBillTo": true,
        "showCreditTerm": true
      },
      {
        "type": "fieldGrid",
        "cols": 2
      },
      {
        "type": "containerStrip"
      },
      {
        "type": "chargeTable",
        "headerColor": "fill"
      },
      {
        "type": "taxAmountBox"
      },
      {
        "type": "wordsAndTotal"
      },
      {
        "type": "termsBank"
      },
      {
        "type": "colorfulFooter"
      }
    ]
  },
  {
    "code": "INVOICE_REPORT_FORMAT_80",
    "formatNumber": 80,
    "name": "Invoice Report Format-80 Standard Tax Invoice Format-21",
    "paper": "A4",
    "rtl": false,
    "theme": {
      "primary": "#000000",
      "accent": "#0F4D96",
      "fill": "#F3F3F3",
      "panel": "#EBF0F4",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#9AD7FF",
      "ink": "#101010",
      "gray": "#656565",
      "white": "#FFFFFF"
    },
    "branding": {
      "company": "KingFisher Logistic",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "info@kingfisherwingsgroup.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "BOMINV230500382",
      "invoiceDate": "17-MAY-23",
      "dueDate": "24-MAY-23",
      "billToLabel": "Invoice To",
      "billToName": "DEMO LOGISTICS INDIA PVT LTD",
      "billToAddress": "21, PORT BLAIR, KRISHNA ST, MANNARGUDI, TAMIL NADU, INDIA, 676876",
      "billToPhone": "798798798",
      "fax": "9879878",
      "vatNo": "68768978898098",
      "billToGstin": "888329087642356",
      "creditTerm": "CASH",
      "currency": "INR",
      "words": "Rupee Four Thousand Seven Hundred Seventy-Six Only",
      "subtotal": "4,200.00",
      "tax": "576.00",
      "total": "4,776.00",
      "narration": "MBL NO... / HBL NO. NSAJED85630124277 / JOB NO.",
      "officeAddressLines": [
        "MUMBAI",
        "406, 4TH FLOOR, D-21 CORPORATE PARK, SECTOR 21,, MUMBAI, Pincode : 400001"
      ],
      "taxAmountLines": [
        "Amount before Tax 4,200.00",
        "Sub Total 4,200.00"
      ],
      "metaRows": [
        {
          "k": "Invoice No.",
          "v": "BOMINV230500382"
        },
        {
          "k": "Date",
          "v": "17-May-23"
        },
        {
          "k": "Job No.",
          "v": "—"
        },
        {
          "k": "Shipment No.",
          "v": "BOM/EXP/23/05/B/0709 / 16-MAY-23"
        },
        {
          "k": "Department",
          "v": "FCL EXPORT"
        },
        {
          "k": "Tax ID",
          "v": "68768978898098"
        }
      ],
      "termsLines": [
        "1. Payment to be made by cash. The company is not responsible for any cash settlement without an official receipt."
      ],
      "bankLines": [
        "Beneficiary Name: KingFisher Logistic",
        "Bank : HDFC",
        "A/c No : XXXXXXXXXXX",
        "IBAN Code : ABA:XXXXXX",
        "Swift Code : XXXXXX",
        "Address : Dubai, United Arab Emirates"
      ],
      "osTableHeaders": [
        "Date",
        "Voucher No",
        "Narration",
        "Currency",
        "FCY Amount",
        "O/S FCY Amount",
        "Aging"
      ],
      "osTableRows": [
        [
          "16-MAY-23",
          "BOMINV230500371",
          "MBL NO... / HBL NO. 6676687 / JOB NO.CBOMEXP230764",
          "INR",
          "944.00",
          "944.00",
          "1"
        ]
      ],
      "agingHeaders": [
        "Currency",
        "Total O/S",
        "< 30",
        "30 - 60",
        "60 - 90",
        "90 - 120",
        "120 - 150",
        "150 - 180",
        "180+"
      ],
      "agingRow": [
        "INR",
        "944.00",
        "944.00",
        "",
        "",
        "",
        "",
        "",
        ""
      ],
      "fieldGrid": [
        {
          "k": "MBL No.",
          "v": "—"
        },
        {
          "k": "HBL No.",
          "v": "NSAJED85630124277"
        },
        {
          "k": "Shipper",
          "v": "DEMO-SHIPPER ENGG COMPANY"
        },
        {
          "k": "Origin",
          "v": "NHAVA SHEVA, INDIA"
        },
        {
          "k": "Consignee",
          "v": "DEMO STEEL FACTORY CO. LTD."
        },
        {
          "k": "Destination",
          "v": "JEDDAH, SAUDI ARABIA"
        },
        {
          "k": "Vessel / Voyage",
          "v": "CAP SAN JUAN / 310W"
        },
        {
          "k": "ETD",
          "v": "01-MAR-23"
        },
        {
          "k": "ETA",
          "v": "20-MAR-23"
        },
        {
          "k": "Container No",
          "v": "TTNU0712894"
        },
        {
          "k": "Pieces",
          "v": "3.00 PACKAGES"
        },
        {
          "k": "Gross weight",
          "v": "22,700.00"
        },
        {
          "k": "Narration",
          "v": "MBL NO... / HBL NO. NSAJED85630124277 / JOB NO."
        }
      ],
      "tableHeaders": [
        "Charge",
        "Qty",
        "Cur.",
        "Ex.Rate",
        "Amount / Qty",
        "Tax %",
        "FCY Amount",
        "VAT",
        "Amount (INR)"
      ],
      "tableRows": [
        [
          "FREIGHT CHARGE",
          "1.000",
          "INR",
          "1.00000",
          "1,500.000",
          "18.00",
          "1,500.00",
          "0.00",
          "1,500.00"
        ],
        [
          "LOCAL CHARGES",
          "1.000",
          "INR",
          "1.00000",
          "800.000",
          "18.00",
          "800.00",
          "0.00",
          "800.00"
        ],
        [
          "SEA FREIGHT CHARGE",
          "1.000",
          "INR",
          "1.00000",
          "900.000",
          "18.00",
          "900.00",
          "0.00",
          "900.00"
        ],
        [
          "CONTAINER CLEANING FEE",
          "1.000",
          "INR",
          "1.00000",
          "1,000.000",
          "15.00",
          "1,000.00",
          "0.00",
          "1,000.00"
        ]
      ],
      "totalLabel": "Net Payment INR"
    },
    "blocks": [
      {
        "type": "companyHeader"
      },
      {
        "type": "docTitle",
        "text": "INVOICE",
        "align": "center"
      },
      {
        "type": "twoColumn",
        "showBillTo": true
      },
      {
        "type": "fieldGrid",
        "cols": 2
      },
      {
        "type": "chargeTable",
        "headerColor": "fill"
      },
      {
        "type": "taxAmountBox"
      },
      {
        "type": "wordsAndTotal"
      },
      {
        "type": "termsBank"
      },
      {
        "type": "colorfulFooter"
      }
    ]
  },
  {
    "code": "INVOICE_REPORT_FORMAT_81",
    "formatNumber": 81,
    "name": "Invoice Report Format-81 Standard Tax Invoice Format-22",
    "paper": "A4",
    "rtl": false,
    "theme": {
      "primary": "#000000",
      "accent": "#0F4D96",
      "fill": "#F3F3F3",
      "panel": "#EBF0F4",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#9AD7FF",
      "ink": "#101010",
      "gray": "#656565",
      "white": "#FFFFFF"
    },
    "branding": {
      "company": "KingFisher Logistic",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "info@kingfisherwingsgroup.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "BOMINV230500382",
      "invoiceDate": "17-MAY-23",
      "dueDate": "24-MAY-23",
      "billToLabel": "To Account Of",
      "billToName": "DEMO LOGISTICS INDIA PVT LTD",
      "billToAddress": "21, PORT BLAIR, KRISHNA ST, MANNARGUDI, TAMIL NADU, INDIA, 676876",
      "billToPhone": "798798798",
      "fax": "9879878",
      "vatNo": "68768978898098",
      "billToGstin": "888329087642356",
      "creditTerm": "0 Days",
      "currency": "INR",
      "words": "Rupee Four Thousand Seven Hundred Seventy-Six Only",
      "subtotal": "4,200.00",
      "tax": "576.00",
      "total": "4,776.00",
      "narration": "MBL NO... / HBL NO. NSAJED85630124277 / JOB NO.",
      "officeAddressLines": [
        "MUMBAI",
        "406, 4TH FLOOR, D-21 CORPORATE PARK, SECTOR 21,, MUMBAI, Pincode : 400001"
      ],
      "taxAmountLines": [
        "GST18",
        "GST 15%"
      ],
      "metaRows": [
        {
          "k": "Invoice No.",
          "v": "BOMINV230500382"
        },
        {
          "k": "Date",
          "v": "17-May-23"
        },
        {
          "k": "Job No.",
          "v": "—"
        },
        {
          "k": "Terms",
          "v": "0 Days"
        },
        {
          "k": "Tax ID",
          "v": "68768978898098"
        }
      ],
      "termsLines": [
        "1. Payment to be made by cash. The company is not responsible for any cash settlement without an official receipt."
      ],
      "bankLines": [
        "Beneficiary Name: KingFisher Logistic",
        "Bank : HDFC",
        "A/c No : XXXXXXXXXXX",
        "IBAN Code : ABA:XXXXXX",
        "Swift Code : XXXXXX",
        "Address : Dubai, United Arab Emirates"
      ],
      "osTableHeaders": [
        "Date",
        "Voucher No",
        "Narration",
        "Currency",
        "FCY Amount",
        "O/S FCY Amount",
        "Aging"
      ],
      "osTableRows": [
        [
          "16-MAY-23",
          "BOMINV230500371",
          "MBL NO... / HBL NO. 6676687 / JOB NO.CBOMEXP230764",
          "INR",
          "944.00",
          "944.00",
          "1"
        ]
      ],
      "agingHeaders": [
        "Currency",
        "Total O/S",
        "< 30",
        "30 - 60",
        "60 - 90",
        "90 - 120",
        "120 - 150",
        "150 - 180",
        "180+"
      ],
      "agingRow": [
        "INR",
        "944.00",
        "944.00",
        "",
        "",
        "",
        "",
        "",
        ""
      ],
      "fieldGrid": [
        {
          "k": "Vessel",
          "v": "CAP SAN JUAN"
        },
        {
          "k": "Voyage",
          "v": "310W"
        },
        {
          "k": "ETD/ETA",
          "v": "01-MAR-23 / 20-MAR-23"
        },
        {
          "k": "MBL No.",
          "v": "—"
        },
        {
          "k": "HBL No.",
          "v": "NSAJED85630124277"
        },
        {
          "k": "POL",
          "v": "NHAVA SHEVA, INDIA"
        },
        {
          "k": "POD",
          "v": "JEDDAH, SAUDI ARABIA"
        },
        {
          "k": "DEL",
          "v": "JEDDAH SAUDI ARABIA"
        }
      ],
      "containerNote": "TTNU0712894",
      "tableHeaders": [
        "Detail of Charges",
        "Currency",
        "Rate",
        "Qty",
        "Unit",
        "Ex.Rate",
        "VAT Amount (INR)"
      ],
      "tableRows": [
        [
          "FREIGHT CHARGE",
          "INR",
          "1,500.00",
          "1",
          "1 TON OR 1/2 MEASURE",
          "1.00000",
          "1,500.00"
        ],
        [
          "LOCAL CHARGES",
          "INR",
          "800.00",
          "1",
          "—",
          "1.00000",
          "800.00"
        ],
        [
          "SEA FREIGHT CHARGE",
          "INR",
          "900.00",
          "1",
          "1 TON OR 1/2 MEASURE",
          "1.00000",
          "900.00"
        ],
        [
          "CONTAINER CLEANING FEE",
          "INR",
          "1,000.00",
          "1",
          "1 TON OR 1/2 MEASURE",
          "1.00000",
          "1,000.00"
        ]
      ],
      "totalLabel": "INR"
    },
    "blocks": [
      {
        "type": "companyHeader"
      },
      {
        "type": "docTitle",
        "text": "TAX INVOICE",
        "align": "center"
      },
      {
        "type": "twoColumn",
        "showBillTo": true,
        "showCreditTerm": true
      },
      {
        "type": "docTitle",
        "text": "Vessel Details",
        "align": "start"
      },
      {
        "type": "fieldGrid",
        "cols": 2
      },
      {
        "type": "containerNote"
      },
      {
        "type": "chargeTable",
        "headerColor": "fill"
      },
      {
        "type": "totalsOnly"
      },
      {
        "type": "wordsAndTotal"
      },
      {
        "type": "termsBank"
      },
      {
        "type": "colorfulFooter"
      }
    ]
  },
  {
    "code": "INVOICE_REPORT_FORMAT_82",
    "formatNumber": 82,
    "name": "Invoice Report Format-82 Standard Tax Invoice Format-5",
    "paper": "A4",
    "rtl": false,
    "theme": {
      "primary": "#000000",
      "accent": "#0F4D96",
      "fill": "#F3F3F3",
      "panel": "#EBF0F4",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#9AD7FF",
      "ink": "#101010",
      "gray": "#656565",
      "white": "#FFFFFF"
    },
    "branding": {
      "company": "KingFisher Logistic",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "info@kingfisherwingsgroup.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "BOMINV230500382",
      "invoiceDate": "17-MAY-23",
      "dueDate": "24-MAY-23",
      "billToLabel": "Client",
      "billToName": "DEMO LOGISTICS INDIA PVT LTD",
      "billToAddress": "21, PORT BLAIR, KRISHNA ST, MANNARGUDI, TAMIL NADU, INDIA, 676876",
      "billToPhone": "798798798",
      "fax": "9879878",
      "vatNo": "68768978898098",
      "billToGstin": "888329087642356",
      "creditTerm": "CASH",
      "currency": "INR",
      "words": "Rupee Four Thousand Two Hundred Only",
      "subtotal": "4,200.00",
      "tax": "576.00",
      "total": "4,200.00",
      "narration": "MBL NO... / HBL NO. NSAJED85630124277 / JOB NO.",
      "officeAddressLines": [
        "MUMBAI",
        "406, 4TH FLOOR, D-21 CORPORATE PARK, SECTOR 21,, MUMBAI, Pincode : 400001"
      ],
      "taxAmountLines": [
        "GST18",
        "GST 15%"
      ],
      "metaRows": [
        {
          "k": "Invoice No.",
          "v": "BOMINV230500382"
        },
        {
          "k": "Date",
          "v": "17-MAY-23 (POSTED)"
        },
        {
          "k": "Job No.",
          "v": "—"
        },
        {
          "k": "Shipment No.",
          "v": "BOM/EXP/23/05/B/0709 / 16-MAY-23"
        },
        {
          "k": "Department",
          "v": "FCL EXPORT"
        }
      ],
      "termsLines": [
        "1. Payment to be made by cash. The company is not responsible for any cash settlement without an official receipt."
      ],
      "bankLines": [
        "Beneficiary Name: KingFisher Logistic",
        "Bank : HDFC",
        "A/c No : XXXXXXXXXXX",
        "IBAN Code : ABA:XXXXXX",
        "Swift Code : XXXXXX",
        "Address : Dubai, United Arab Emirates"
      ],
      "osTableHeaders": [
        "Date",
        "Voucher No",
        "Narration",
        "Currency",
        "FCY Amount",
        "O/S FCY Amount",
        "Aging"
      ],
      "osTableRows": [
        [
          "16-MAY-23",
          "BOMINV230500371",
          "MBL NO... / HBL NO. 6676687 / JOB NO.CBOMEXP230764",
          "INR",
          "944.00",
          "944.00",
          "1"
        ]
      ],
      "agingHeaders": [
        "Currency",
        "Total O/S",
        "< 30",
        "30 - 60",
        "60 - 90",
        "90 - 120",
        "120 - 150",
        "150 - 180",
        "180+"
      ],
      "agingRow": [
        "INR",
        "944.00",
        "944.00",
        "",
        "",
        "",
        "",
        "",
        ""
      ],
      "fieldGrid": [
        {
          "k": "Origin",
          "v": "NHAVA SHEVA, INDIA"
        },
        {
          "k": "Destination",
          "v": "JEDDAH, SAUDI ARABIA"
        },
        {
          "k": "Shipper",
          "v": "DEMO-SHIPPER ENGG COMPANY"
        },
        {
          "k": "Consignee",
          "v": "DEMO STEEL FACTORY CO. LTD."
        },
        {
          "k": "ETD",
          "v": "01-MAR-23"
        },
        {
          "k": "ETA",
          "v": "20-MAR-23"
        },
        {
          "k": "Currency",
          "v": "INR 1.000000"
        },
        {
          "k": "Total No. of Pcs / G.Weight / V.Weight",
          "v": "3.00 / 22,700.00 / 22,700.00"
        },
        {
          "k": "Salesperson",
          "v": "DEMO-PERSON"
        },
        {
          "k": "TRN No.",
          "v": "888329087642356"
        },
        {
          "k": "HBL No.",
          "v": "NSAJED85630124277"
        },
        {
          "k": "Narration",
          "v": "MBL NO... / HBL NO. NSAJED85630124277 / JOB NO."
        }
      ],
      "tableHeaders": [
        "Charge",
        "Unit",
        "Qty",
        "Cur.",
        "Ex.Rate",
        "Amount / Qty",
        "Tax %",
        "FCY Amount",
        "VAT Amount (INR)"
      ],
      "tableRows": [
        [
          "FREIGHT CHARGE",
          "1 TON OR 1/2 MEASURE",
          "1.00",
          "INR",
          "1.000000",
          "1,500.000",
          "18.00",
          "1,500.00",
          "1,500.00"
        ],
        [
          "LOCAL CHARGES",
          "—",
          "1.00",
          "INR",
          "1.000000",
          "800.000",
          "18.00",
          "800.00",
          "800.00"
        ],
        [
          "SEA FREIGHT CHARGE",
          "1 TON OR 1/2 MEASURE",
          "1.00",
          "INR",
          "1.000000",
          "900.000",
          "18.00",
          "900.00",
          "900.00"
        ],
        [
          "CONTAINER CLEANING FEE",
          "1 TON OR 1/2 MEASURE",
          "1.00",
          "INR",
          "1.000000",
          "1,000.000",
          "15.00",
          "1,000.00",
          "1,000.00"
        ]
      ],
      "totalLabel": "Total : INR",
      "containerNote": "TTNU0712894,"
    },
    "blocks": [
      {
        "type": "companyHeader"
      },
      {
        "type": "docTitle",
        "text": "TAX INVOICE",
        "align": "center"
      },
      {
        "type": "twoColumn",
        "showBillTo": true
      },
      {
        "type": "fieldGrid",
        "cols": 2
      },
      {
        "type": "chargeTable",
        "headerColor": "fill"
      },
      {
        "type": "totalsOnly"
      },
      {
        "type": "wordsAndTotal"
      },
      {
        "type": "containerNote"
      },
      {
        "type": "termsBank"
      },
      {
        "type": "colorfulFooter"
      }
    ]
  },
  {
    "code": "INVOICE_REPORT_FORMAT_83",
    "formatNumber": 83,
    "name": "Invoice Report Format-83 Standard Tax Invoice Format-6",
    "paper": "A4",
    "rtl": false,
    "theme": {
      "primary": "#000000",
      "accent": "#0F4D96",
      "fill": "#F3F3F3",
      "panel": "#EBF0F4",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#9AD7FF",
      "ink": "#101010",
      "gray": "#656565",
      "white": "#FFFFFF"
    },
    "branding": {
      "company": "KingFisher Logistic",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "info@kingfisherwingsgroup.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "BOMINV230500382",
      "invoiceDate": "17-MAY-23",
      "dueDate": "17-MAY-23",
      "billToLabel": "Client",
      "billToName": "DEMO LOGISTICS INDIA PVT LTD",
      "billToAddress": "21, PORT BLAIR, KRISHNA ST, MANNARGUDI, TAMIL NADU, INDIA, 676876",
      "billToPhone": "798798798",
      "fax": "9879878",
      "vatNo": "68768978898098",
      "billToGstin": "888329087642356",
      "creditTerm": "CASH",
      "currency": "INR",
      "words": "Rupee Four Thousand Seven Hundred Seventy-Six Only",
      "subtotal": "4,200.00",
      "tax": "576.00",
      "total": "4,776.00",
      "narration": "MBL NO... / HBL NO. NSAJED85630124277 / JOB NO.",
      "officeAddressLines": [
        "MUMBAI",
        "406, 4TH FLOOR, D-21 CORPORATE PARK, SECTOR 21,, MUMBAI, Pincode : 400001"
      ],
      "taxAmountLines": [
        "GST18",
        "GST 15%"
      ],
      "metaRows": [
        {
          "k": "Invoice No.",
          "v": "BOMINV230500382"
        },
        {
          "k": "Date",
          "v": "17-MAY-23"
        },
        {
          "k": "Job No.",
          "v": "—"
        },
        {
          "k": "Payment Due Date",
          "v": "17-MAY-23"
        },
        {
          "k": "VAT/TRN No",
          "v": "888329087642356"
        }
      ],
      "termsLines": [
        "1. Payment to be made by cash. The company is not responsible for any cash settlement without an official receipt.",
        "The invoice is considered correct, if no written objection is received within 7 days from the date of this invoice."
      ],
      "bankLines": [
        "Beneficiary Name: KingFisher Logistic",
        "Bank : HDFC",
        "A/c No : XXXXXXXXXXX",
        "IBAN Code : ABA:XXXXXX",
        "Swift Code : XXXXXX",
        "Address : Dubai, United Arab Emirates"
      ],
      "osTableHeaders": [
        "Date",
        "Voucher No",
        "Narration",
        "Currency",
        "FCY Amount",
        "O/S FCY Amount",
        "Aging"
      ],
      "osTableRows": [
        [
          "16-MAY-23",
          "BOMINV230500371",
          "MBL NO... / HBL NO. 6676687 / JOB NO.CBOMEXP230764",
          "INR",
          "944.00",
          "944.00",
          "1"
        ]
      ],
      "agingHeaders": [
        "Currency",
        "Total O/S",
        "< 30",
        "30 - 60",
        "60 - 90",
        "90 - 120",
        "120 - 150",
        "150 - 180",
        "180+"
      ],
      "agingRow": [
        "INR",
        "944.00",
        "944.00",
        "",
        "",
        "",
        "",
        "",
        ""
      ],
      "fieldGrid": [
        {
          "k": "Shipper",
          "v": "DEMO-SHIPPER ENGG COMPANY"
        },
        {
          "k": "Consignee",
          "v": "DEMO STEEL FACTORY CO. LTD."
        },
        {
          "k": "Place of Receipt",
          "v": "INMAA-CHENNAI"
        },
        {
          "k": "Port of Loading",
          "v": "NHAVA SHEVA, INDIA"
        },
        {
          "k": "Port of Discharge",
          "v": "JEDDAH, SAUDI ARABIA"
        },
        {
          "k": "Place of Delivery",
          "v": "JEDDAH SAUDI ARABIA"
        },
        {
          "k": "ETD",
          "v": "01-MAR-23"
        },
        {
          "k": "ETA",
          "v": "20-MAR-23"
        },
        {
          "k": "Vessel / Voyage",
          "v": "CAP SAN JUAN / 310W"
        },
        {
          "k": "HBL No.",
          "v": "NSAJED85630124277"
        },
        {
          "k": "MBL No.",
          "v": "—"
        },
        {
          "k": "Narration",
          "v": "MBL NO... / HBL NO. NSAJED85630124277 / JOB NO."
        },
        {
          "k": "Department",
          "v": "FCL EXPORT"
        },
        {
          "k": "Reference No.",
          "v": "—"
        }
      ],
      "containerHeaders": [
        "Container No.",
        "Type",
        "Description",
        "No. of Pcs",
        "G.Weight",
        "Volume",
        "V.Weight"
      ],
      "containerRow": [
        "TTNU0712894",
        "40' FLAT",
        "GENERAL CARGO",
        "3 PACKAGES",
        "22,700.000 KGS",
        "22,700.000",
        "—"
      ],
      "tableHeaders": [
        "Charge",
        "Qty",
        "Amount / Qty",
        "Amount (INR)"
      ],
      "tableRows": [
        [
          "FREIGHT CHARGE",
          "1.000",
          "1,500.00",
          "1,500.00"
        ],
        [
          "LOCAL CHARGES",
          "1.000",
          "800.00",
          "800.00"
        ],
        [
          "SEA FREIGHT CHARGE",
          "1.000",
          "900.00",
          "900.00"
        ],
        [
          "CONTAINER CLEANING FEE",
          "1.000",
          "1,000.00",
          "1,000.00"
        ]
      ],
      "totalLabel": "Total : INR"
    },
    "blocks": [
      {
        "type": "companyHeader"
      },
      {
        "type": "docTitle",
        "text": "INVOICE",
        "align": "center"
      },
      {
        "type": "twoColumn",
        "showBillTo": true
      },
      {
        "type": "fieldGrid",
        "cols": 2
      },
      {
        "type": "containerStrip"
      },
      {
        "type": "chargeTable",
        "headerColor": "fill"
      },
      {
        "type": "wordsAndTotal"
      },
      {
        "type": "termsBank"
      },
      {
        "type": "stampSignature"
      },
      {
        "type": "colorfulFooter"
      }
    ]
  },
  {
    "code": "INVOICE_REPORT_FORMAT_84",
    "formatNumber": 84,
    "name": "Invoice Report Format-84 Standard Tax Invoice Format-9",
    "paper": "A4",
    "rtl": false,
    "theme": {
      "primary": "#000000",
      "accent": "#0F4D96",
      "fill": "#F3F3F3",
      "panel": "#EBF0F4",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#9AD7FF",
      "ink": "#101010",
      "gray": "#656565",
      "white": "#FFFFFF"
    },
    "branding": {
      "company": "KingFisher Logistic",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "info@kingfisherwingsgroup.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "BOMINV230500382",
      "invoiceDate": "17-MAY-23",
      "dueDate": "24-MAY-23",
      "billToLabel": "Bill To",
      "billToName": "DEMO LOGISTICS INDIA PVT LTD",
      "billToAddress": "21, PORT BLAIR, KRISHNA ST, MANNARGUDI, TAMIL NADU, INDIA, 676876",
      "billToPhone": "798798798",
      "fax": "9879878",
      "vatNo": "68768978898098",
      "billToGstin": "888329087642356",
      "creditTerm": "CASH",
      "currency": "INR",
      "words": "IN WORDS : Rupee Four Thousand Seven Hundred Seventy-Six Only",
      "subtotal": "4,200.00",
      "tax": "576.00",
      "total": "4,776.00",
      "narration": "MBL NO... / HBL NO. NSAJED85630124277 / JOB NO.",
      "officeAddressLines": [
        "MUMBAI",
        "406, 4TH FLOOR, D-21 CORPORATE PARK, SECTOR 21,, MUMBAI, Pincode : 400001"
      ],
      "taxAmountLines": [
        "GST18",
        "GST 15%"
      ],
      "metaRows": [
        {
          "k": "Invoice No.",
          "v": "BOMINV230500382"
        },
        {
          "k": "Invoice Date",
          "v": "17-MAY-23 (POSTED)"
        },
        {
          "k": "PAN",
          "v": "AABCT1557F"
        },
        {
          "k": "TAN",
          "v": "TAN123TAN"
        },
        {
          "k": "GSTIN",
          "v": "—"
        }
      ],
      "termsLines": [
        "1. Payment to be made by cash. The company is not responsible for any cash settlement without an official receipt."
      ],
      "bankLines": [
        "Beneficiary Name: KingFisher Logistic",
        "Bank : HDFC",
        "A/c No : XXXXXXXXXXX",
        "IBAN Code : ABA:XXXXXX",
        "Swift Code : XXXXXX",
        "Address : Dubai, United Arab Emirates"
      ],
      "osTableHeaders": [
        "Date",
        "Voucher No",
        "Narration",
        "Currency",
        "FCY Amount",
        "O/S FCY Amount",
        "Aging"
      ],
      "osTableRows": [
        [
          "16-MAY-23",
          "BOMINV230500371",
          "MBL NO... / HBL NO. 6676687 / JOB NO.CBOMEXP230764",
          "INR",
          "944.00",
          "944.00",
          "1"
        ]
      ],
      "agingHeaders": [
        "Currency",
        "Total O/S",
        "< 30",
        "30 - 60",
        "60 - 90",
        "90 - 120",
        "120 - 150",
        "150 - 180",
        "180+"
      ],
      "agingRow": [
        "INR",
        "944.00",
        "944.00",
        "",
        "",
        "",
        "",
        "",
        ""
      ],
      "fieldGrid": [
        {
          "k": "MBL / MAWB No.",
          "v": "—"
        },
        {
          "k": "HBL / HAWB No.",
          "v": "NSAJED85630124277"
        },
        {
          "k": "Consignee",
          "v": "DEMO STEEL FACTORY CO. LTD."
        },
        {
          "k": "No. of Pkg/WT/CBM",
          "v": "3.00 PACKAGES / 22,700.00 KGS"
        },
        {
          "k": "Cargo Type",
          "v": "FCL"
        },
        {
          "k": "Vessel/Flight",
          "v": "CAP SAN JUAN / 310W"
        },
        {
          "k": "Container No.",
          "v": "TTNU0712894"
        },
        {
          "k": "ETA",
          "v": "20-MAR-23"
        },
        {
          "k": "Origin",
          "v": "NHAVA SHEVA, INDIA"
        },
        {
          "k": "ETD",
          "v": "01-MAR-23"
        },
        {
          "k": "Destination",
          "v": "JEDDAH, SAUDI ARABIA"
        },
        {
          "k": "Shipper",
          "v": "DEMO-SHIPPER ENGG COMPANY"
        },
        {
          "k": "Commodity",
          "v": "GENERAL CARGO"
        }
      ],
      "tableHeaders": [
        "Particulars",
        "SAC",
        "Rate",
        "Qty",
        "Curr",
        "Ex.Rate",
        "Taxable Amount",
        "I/UGST %",
        "I/UGST",
        "Total Amount"
      ],
      "tableRows": [
        [
          "FREIGHT CHARGE",
          "",
          "1,500.00",
          "1.000",
          "INR",
          "1.00000",
          "1,500.00",
          "18.00",
          "270.00",
          "1,770.00"
        ],
        [
          "LOCAL CHARGES",
          "",
          "800.00",
          "1.000",
          "INR",
          "1.00000",
          "800.00",
          "18.00",
          "144.00",
          "944.00"
        ],
        [
          "SEA FREIGHT CHARGE",
          "",
          "900.00",
          "1.000",
          "INR",
          "1.00000",
          "900.00",
          "18.00",
          "162.00",
          "1,062.00"
        ],
        [
          "CONTAINER CLEANING FEE",
          "",
          "1,000.00",
          "1.000",
          "INR",
          "1.00000",
          "1,000.00",
          "0.00",
          "0.00",
          "1,000.00"
        ]
      ],
      "subtotalParts": [
        "4,200.00",
        "576.00",
        "4,776.00"
      ],
      "totalLabel": "Total Amount"
    },
    "blocks": [
      {
        "type": "companyHeader"
      },
      {
        "type": "docTitle",
        "text": "TAX INVOICE",
        "align": "center"
      },
      {
        "type": "twoColumn",
        "showBillTo": true
      },
      {
        "type": "fieldGrid",
        "cols": 2
      },
      {
        "type": "chargeTable",
        "headerColor": "fill"
      },
      {
        "type": "subtotalBar",
        "variant": "igst"
      },
      {
        "type": "wordsAndTotal"
      },
      {
        "type": "termsBank"
      },
      {
        "type": "colorfulFooter"
      }
    ]
  },
  {
    "code": "INVOICE_REPORT_FORMAT_85",
    "formatNumber": 85,
    "name": "Invoice Report Format-85 Standard Invoice Format-2",
    "paper": "A4",
    "rtl": false,
    "theme": {
      "primary": "#000000",
      "accent": "#0F4D96",
      "fill": "#F3F3F3",
      "panel": "#EBF0F4",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#9AD7FF",
      "ink": "#101010",
      "gray": "#656565",
      "white": "#FFFFFF"
    },
    "branding": {
      "company": "KingFisher Logistic",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "info@kingfisherwingsgroup.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "BOMINV230500382",
      "invoiceDate": "17-MAY-23",
      "dueDate": "24-MAY-23",
      "billToLabel": "Client",
      "billToName": "DEMO LOGISTICS INDIA PVT LTD",
      "billToAddress": "21, PORT BLAIR, KRISHNA ST, MANNARGUDI, TAMIL NADU, INDIA, 676876",
      "billToPhone": "798798798",
      "fax": "9879878",
      "vatNo": "68768978898098",
      "billToGstin": "888329087642356",
      "creditTerm": "CASH",
      "currency": "INR",
      "words": "Rupee Four Thousand Seven Hundred Seventy-Six Only",
      "subtotal": "4,200.00",
      "tax": "576.00",
      "total": "4,776.00",
      "narration": "MBL NO... / HBL NO. NSAJED85630124277 / JOB NO.",
      "officeAddressLines": [
        "MUMBAI",
        "406, 4TH FLOOR, D-21 CORPORATE PARK, SECTOR 21,, MUMBAI, Pincode : 400001"
      ],
      "taxAmountLines": [
        "GST18",
        "GST 15%"
      ],
      "metaRows": [
        {
          "k": "Invoice No.",
          "v": "BOMINV230500382"
        },
        {
          "k": "Date",
          "v": "17-MAY-23 (POSTED)"
        },
        {
          "k": "Job No.",
          "v": "—"
        },
        {
          "k": "Shipment No.",
          "v": "BOM/EXP/23/05/B/0709"
        }
      ],
      "termsLines": [
        "1. Payment to be made by cash. The company is not responsible for any cash settlement without an official receipt."
      ],
      "bankLines": [
        "Beneficiary Name: KingFisher Logistic",
        "Bank : HDFC",
        "A/c No : XXXXXXXXXXX",
        "IBAN Code : ABA:XXXXXX",
        "Swift Code : XXXXXX",
        "Address : Dubai, United Arab Emirates"
      ],
      "osTableHeaders": [
        "Date",
        "Voucher No",
        "Narration",
        "Currency",
        "FCY Amount",
        "O/S FCY Amount",
        "Aging"
      ],
      "osTableRows": [
        [
          "16-MAY-23",
          "BOMINV230500371",
          "MBL NO... / HBL NO. 6676687 / JOB NO.CBOMEXP230764",
          "INR",
          "944.00",
          "944.00",
          "1"
        ]
      ],
      "agingHeaders": [
        "Currency",
        "Total O/S",
        "< 30",
        "30 - 60",
        "60 - 90",
        "90 - 120",
        "120 - 150",
        "150 - 180",
        "180+"
      ],
      "agingRow": [
        "INR",
        "944.00",
        "944.00",
        "",
        "",
        "",
        "",
        "",
        ""
      ],
      "fieldGrid": [
        {
          "k": "Shipper",
          "v": "DEMO-SHIPPER ENGG COMPANY"
        },
        {
          "k": "Consignee",
          "v": "DEMO STEEL FACTORY CO. LTD."
        },
        {
          "k": "Place of Receipt",
          "v": "INMAA-CHENNAI"
        },
        {
          "k": "Port of Loading",
          "v": "NHAVA SHEVA, INDIA"
        },
        {
          "k": "Port of Discharge",
          "v": "JEDDAH, SAUDI ARABIA"
        },
        {
          "k": "Place of Delivery",
          "v": "JEDDAH SAUDI ARABIA"
        },
        {
          "k": "ETD",
          "v": "01-MAR-23"
        },
        {
          "k": "ETA",
          "v": "20-MAR-23"
        },
        {
          "k": "Vessel / Voyage",
          "v": "CAP SAN JUAN / 310W"
        },
        {
          "k": "HBL No.",
          "v": "NSAJED85630124277"
        },
        {
          "k": "MBL No.",
          "v": "—"
        },
        {
          "k": "Narration",
          "v": "MBL NO... / HBL NO. NSAJED85630124277 / JOB NO."
        },
        {
          "k": "Department",
          "v": "FCL EXPORT"
        },
        {
          "k": "Currency",
          "v": "INR 1.000000"
        },
        {
          "k": "Total No. of Pcs / G.Weight / V.Weight",
          "v": "3.00 / 22,700.00 / 22,700.00"
        }
      ],
      "tableHeaders": [
        "Charge",
        "Qty",
        "Currency",
        "Amount / Qty",
        "Ex.Rate",
        "FCY Amount",
        "Amount (INR)"
      ],
      "tableRows": [
        [
          "FREIGHT CHARGE",
          "1.000",
          "INR",
          "1,500.000",
          "1.000000",
          "1,500.000",
          "1,500.000"
        ],
        [
          "LOCAL CHARGES",
          "1.000",
          "INR",
          "800.000",
          "1.000000",
          "800.000",
          "800.000"
        ],
        [
          "SEA FREIGHT CHARGE",
          "1.000",
          "INR",
          "900.000",
          "1.000000",
          "900.000",
          "900.000"
        ],
        [
          "CONTAINER CLEANING FEE",
          "1.000",
          "INR",
          "1,000.000",
          "1.000000",
          "1,000.000",
          "1,000.000"
        ]
      ],
      "containerNote": "TTNU0712894,",
      "totalLabel": "Total : INR"
    },
    "blocks": [
      {
        "type": "companyHeader"
      },
      {
        "type": "docTitle",
        "text": "INVOICE",
        "align": "center"
      },
      {
        "type": "twoColumn",
        "showBillTo": true
      },
      {
        "type": "fieldGrid",
        "cols": 2
      },
      {
        "type": "chargeTable",
        "headerColor": "fill"
      },
      {
        "type": "wordsAndTotal"
      },
      {
        "type": "containerNote"
      },
      {
        "type": "termsBank"
      },
      {
        "type": "colorfulFooter"
      }
    ]
  }
] as InvoiceFormatUiLayout[];
