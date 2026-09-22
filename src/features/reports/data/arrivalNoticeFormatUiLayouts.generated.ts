import type { InvoiceFormatUiLayout } from '../types/invoiceFormatUiLayout.types';

/** Permanent JSON UI layouts — arrivalNoticeFormatUiLayouts. */
export const ARRIVAL_NOTICE_FORMAT_UI_LAYOUTS: InvoiceFormatUiLayout[] = [
  {
    "code": "ARRIVAL_NOTICE_REPORT_FORMAT_1_CARGO_ARRIVAL_NOTICE_JASPER",
    "formatNumber": 1,
    "name": "Arrival Notice Report Format-1 Cargo Arrival Notice Jasper",
    "paper": "A4",
    "rtl": false,
    "theme": {
      "primary": "#0A2942",
      "accent": "#0A2942",
      "fill": "#F3F3F3",
      "panel": "#EBF0F4",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#0A2942",
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
      "invoiceNo": "PLJEAMAA00001",
      "currency": "INR",
      "total": "10,332.67",
      "totalLabel": "Total :",
      "letterBody": "Attention: Ocean Import - Shipping Dept.\nPlease come before 12:30pm or after 2:00pm",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "AL NASER TRADING COMPANY LLC",
          "30 AL MAKTHOOM BUILDING NEAR MUBARAK CENTRE ROUND ABOUT",
          "AL NABHA SHARJAH SHARJAH UNITED ARAB EMIRATES"
        ]
      },
      "partyMid": {
        "title": "Consignee",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "NUNGAMBAKKAM CHENNAI TAMIL NADU 600084 INDIA",
          "EMAIL: ram@fresatechnologies.com"
        ]
      },
      "partyNotify": {
        "title": "Notify1",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "NUNGAMBAKKAM CHENNAI TAMIL NADU 600084 INDIA"
        ]
      },
      "fieldGrid": [
        {
          "k": "MBL No.",
          "v": "MBLCOPY87666666 / 16-JAN-19"
        },
        {
          "k": "HBL No.",
          "v": "PLJEAMAA00001 / 16-JAN-19"
        },
        {
          "k": "ETD / ETA",
          "v": "16-JAN-19 / 25-JAN-19"
        },
        {
          "k": "Vessel / Voyage No.",
          "v": "MSC MELINA / 987"
        },
        {
          "k": "Port of Loading",
          "v": "JEBEL ALI, UNITED ARAB EMIRATES"
        },
        {
          "k": "Port of Discharge",
          "v": "CHENNAI (EX MADRAS), INDIA"
        },
        {
          "k": "Final Destination",
          "v": "CHENNAI (EX MADRAS), INDIA"
        },
        {
          "k": "Gross Weight",
          "v": "18,000.00 KGS"
        },
        {
          "k": "Measurement",
          "v": "20.000 CBM"
        },
        {
          "k": "No. of Pcs",
          "v": "100"
        },
        {
          "k": "Freight",
          "v": "PREPAID"
        },
        {
          "k": "BL Status",
          "v": "CREATED"
        },
        {
          "k": "Shipment No.",
          "v": "B/SFI/19/0166 / 22-JAN-19"
        },
        {
          "k": "Goods Available At",
          "v": "—"
        }
      ],
      "tableHeaders": [
        "Container No. / Type",
        "Seal",
        "Commodity Desc",
        "No of Pcs",
        "G.Weight",
        "Volume"
      ],
      "tableRows": [
        [
          "TENU9876666 20' DC",
          "SL988888",
          "STC: VALVE MATERIALS",
          "100",
          "18,000.000",
          "20.000"
        ],
        [
          "Total :",
          "",
          "",
          "100",
          "18,000.000",
          "20.000"
        ]
      ],
      "osTableTitle": "Charges",
      "osTableHeaders": [
        "Charge",
        "Unit",
        "Qty",
        "Currency",
        "Ex.Rate",
        "Amount",
        "Tax",
        "Tax Amt",
        "Total"
      ],
      "osTableRows": [
        [
          "TERMINAL HANDLING CHARGES",
          "20' DRY CONTAINER",
          "1",
          "INR",
          "1.00000",
          "5,000.00",
          "GST18",
          "900.00",
          "5,900.00"
        ],
        [
          "DELIVERY ORDER FEE",
          "PER SHIPMENT",
          "1",
          "INR",
          "1.00000",
          "3,000.00",
          "GST18",
          "540.00",
          "3,540.00"
        ],
        [
          "ALL INCL - FCL IMPORT",
          "PER SHIPMENT",
          "1",
          "INR",
          "1.00000",
          "756.50",
          "GST18",
          "136.17",
          "892.67"
        ],
        [
          "TOTAL",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "10,332.67"
        ]
      ],
      "termsLines": [
        "1. Kindly contact our Imports Department/Customer Service for Actual Arrival.",
        "2. D.O Counter Timings – 10.00am to 01.00pm & 02.00pm to 4.30pm.",
        "3. Cheque in favor of “KingFisher Logistic”.",
        "4. Partial Payments are not acceptable.",
        "5. Free Days FCL– 5 Days (NON-DG), 3 Days (DG or IMCO)/ LCL – 5 Days Free Days.",
        "6. After Free days storage charges applicable."
      ],
      "remarks": "Marks: CM MARKS NO.2"
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "docTitle",
        "text": "ARRIVAL NOTICE",
        "align": "center",
        "band": true
      },
      {
        "type": "letterBody"
      },
      {
        "type": "partyTriple"
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
        "type": "outstandingTable"
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
    "code": "ARRIVAL_NOTICE_REPORT_FORMAT_2_CARGO_ARRIVAL_NOTICE_JASPER",
    "formatNumber": 2,
    "name": "Arrival Notice Report Format-2 Cargo Arrival Notice Jasper",
    "paper": "A4",
    "rtl": false,
    "theme": {
      "primary": "#0A2942",
      "accent": "#0A2942",
      "fill": "#F3F3F3",
      "panel": "#EBF0F4",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#0A2942",
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
      "invoiceNo": "PLJEAMAA00001",
      "currency": "INR",
      "total": "10,332.67",
      "totalLabel": "Total :",
      "letterBody": "Attention: Ocean Import - Shipping Dept.\nPlease come before 12:30pm or after 2:00pm",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "AL NASER TRADING COMPANY LLC",
          "30 AL MAKTHOOM BUILDING NEAR MUBARAK CENTRE ROUND ABOUT",
          "AL NABHA SHARJAH SHARJAH UNITED ARAB EMIRATES"
        ]
      },
      "partyMid": {
        "title": "Consignee",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "NUNGAMBAKKAM CHENNAI TAMIL NADU 600084 INDIA",
          "EMAIL: ram@fresatechnologies.com"
        ]
      },
      "partyNotify": {
        "title": "Notify1",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "NUNGAMBAKKAM CHENNAI TAMIL NADU 600084 INDIA"
        ]
      },
      "fieldGrid": [
        {
          "k": "MBL No.",
          "v": "MBLCOPY87666666 / 16-JAN-19"
        },
        {
          "k": "HBL No.",
          "v": "PLJEAMAA00001 / 16-JAN-19"
        },
        {
          "k": "ETD",
          "v": "16-JAN-19"
        },
        {
          "k": "ETA",
          "v": "25-JAN-19"
        },
        {
          "k": "Vessel / Voyage No.",
          "v": "MSC MELINA / 987"
        },
        {
          "k": "Port of Loading",
          "v": "JEBEL ALI, UNITED ARAB EMIRATES"
        },
        {
          "k": "Port of Discharge",
          "v": "CHENNAI (EX MADRAS), INDIA"
        },
        {
          "k": "Final Destination",
          "v": "CHENNAI (EX MADRAS), INDIA"
        },
        {
          "k": "Gross Weight",
          "v": "18000 KGS"
        },
        {
          "k": "Measurement",
          "v": "20 CBM"
        },
        {
          "k": "No. of Pcs",
          "v": "100 PACKAGES"
        },
        {
          "k": "Freight",
          "v": "PREPAID"
        },
        {
          "k": "BL Status",
          "v": "CREATED"
        },
        {
          "k": "Service Type",
          "v": "FCL/FCL"
        },
        {
          "k": "Shipment No.",
          "v": "B/SFI/19/0166 / 22-JAN-19"
        },
        {
          "k": "Item / Line No.",
          "v": "987777 / 1234"
        },
        {
          "k": "CFS",
          "v": "DUBAI PORT - FCL"
        }
      ],
      "tableHeaders": [
        "Container No. / Type",
        "Seal",
        "Commodity Desc",
        "No of Pcs",
        "G.Weight",
        "Volume"
      ],
      "tableRows": [
        [
          "TENU9876666 20' DC",
          "SL988888",
          "STC: VALVE MATERIALS",
          "100",
          "18,000.000",
          "20.000"
        ],
        [
          "Total :",
          "",
          "",
          "100",
          "18,000.000",
          "20.000"
        ]
      ],
      "osTableTitle": "Charges",
      "osTableHeaders": [
        "Charge",
        "Unit",
        "Qty",
        "Currency",
        "Ex.Rate",
        "Amount",
        "Tax",
        "Tax Amt",
        "Total"
      ],
      "osTableRows": [
        [
          "TERMINAL HANDLING CHARGES",
          "20' DRY CONTAINER",
          "1",
          "INR",
          "1.00000",
          "5,000.00",
          "GST18",
          "900.00",
          "5,900.00"
        ],
        [
          "DELIVERY ORDER FEE",
          "PER SHIPMENT",
          "1",
          "INR",
          "1.00000",
          "3,000.00",
          "GST18",
          "540.00",
          "3,540.00"
        ],
        [
          "ALL INCL - FCL IMPORT",
          "PER SHIPMENT",
          "1",
          "INR",
          "1.00000",
          "756.50",
          "GST18",
          "136.17",
          "892.67"
        ],
        [
          "TOTAL",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "10,332.67"
        ]
      ],
      "termsLines": [
        "1. Kindly contact our Imports Department/Customer Service for Actual Arrival.",
        "2. D.O Counter Timings – 10.00am to 01.00pm & 02.00pm to 4.30pm.",
        "3. Cheque in favor of “KingFisher Logistic”.",
        "4. Partial Payments are not acceptable.",
        "5. Free Days FCL– 5 Days (NON-DG), 3 Days (DG or IMCO)/ LCL – 5 Days Free Days.",
        "6. After Free days storage charges applicable.",
        "This is a computer generated document and hence requires no signature"
      ]
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "docTitle",
        "text": "CARGO ARRIVAL NOTICE",
        "align": "center",
        "band": true
      },
      {
        "type": "letterBody"
      },
      {
        "type": "partyTriple"
      },
      {
        "type": "fieldGrid",
        "cols": 2
      },
      {
        "type": "chargeTable",
        "headerColor": "primary"
      },
      {
        "type": "outstandingTable"
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
    "code": "ARRIVAL_NOTICE_REPORT_FORMAT_3_ARRIVAL_NOTICE_USA",
    "formatNumber": 3,
    "name": "Arrival Notice Report Format-3 Arrival Notice USA",
    "paper": "A4",
    "rtl": false,
    "theme": {
      "primary": "#0A2942",
      "accent": "#0A2942",
      "fill": "#F3F3F3",
      "panel": "#EBF0F4",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#0A2942",
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
      "invoiceNo": "PLJEAMAA00001",
      "currency": "USD",
      "total": "8,756.50",
      "totalLabel": "*** TOTAL DUE ( USD )***",
      "words": "USD Eight Thousand Seven Hundred Fifty-Six and Cents Fifty Only",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "AL NASER TRADING COMPANY LLC",
          "30 AL MAKTHOOM BUILDING NEAR MUBARAK CENTRE ROUND ABOUT",
          "AL NABHA SHARJAH SHARJAH UNITED ARAB EMIRATES"
        ]
      },
      "partyMid": {
        "title": "To / Consignee",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "NUNGAMBAKKAM CHENNAI TAMIL NADU 600084 INDIA",
          "EMAIL: ram@fresatechnologies.com"
        ]
      },
      "partyNotify": {
        "title": "Notify Party",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "NUNGAMBAKKAM CHENNAI TAMIL NADU 600084 INDIA"
        ]
      },
      "fieldGrid": [
        {
          "k": "House B/L No.",
          "v": "PLJEAMAA00001"
        },
        {
          "k": "Export Manifest No.",
          "v": "CSFI190012"
        },
        {
          "k": "Import House Doc. No.",
          "v": "B/SFI/19/0166"
        },
        {
          "k": "Import File No.",
          "v": "CSFI190012"
        },
        {
          "k": "Master B/L No.",
          "v": "MBLCOPY87666666"
        },
        {
          "k": "AMS Ref No.",
          "v": "AMSREF11234"
        },
        {
          "k": "Carrier",
          "v": "CMA CGM"
        },
        {
          "k": "Vessel / Voyage",
          "v": "MSC MELINA / 987"
        },
        {
          "k": "Place of Receipt",
          "v": "DUBAI"
        },
        {
          "k": "Port of Loading",
          "v": "JEBEL ALI, UNITED ARAB EMIRATES"
        },
        {
          "k": "Port of Discharge",
          "v": "CHENNAI (EX MADRAS), INDIA"
        },
        {
          "k": "ETD",
          "v": "16-JAN-19"
        },
        {
          "k": "ETA POD",
          "v": "25-JAN-19"
        },
        {
          "k": "Final Place of Delivery",
          "v": "CHENNAI"
        },
        {
          "k": "Service Type",
          "v": "FCL/FCL"
        },
        {
          "k": "Delivery Mode",
          "v": "FCL"
        },
        {
          "k": "Terms",
          "v": "Freight PREPAID / CREATED"
        },
        {
          "k": "Remarks",
          "v": "CHENNAI ARRIVAL 1X20"
        }
      ],
      "tableHeaders": [
        "Container No. / Type",
        "Seal",
        "Commodity Desc",
        "No of Pcs",
        "G.Wt (KGS)",
        "G.Wt (LBS)",
        "Vol (CBM)",
        "Vol (CFT)"
      ],
      "tableRows": [
        [
          "TENU9876666 20' DC",
          "SL988888",
          "STC: VALVE MATERIALS",
          "100",
          "18,000.000",
          "39,683.207",
          "20.000",
          "706.293"
        ],
        [
          "Total :",
          "",
          "",
          "100",
          "18,000.000",
          "39,683.20",
          "20.000",
          "706.293"
        ]
      ],
      "taxAmountLines": [
        "TERMINAL HANDLING CHARGES  5,000.00",
        "DELIVERY ORDER FEE  3,000.00",
        "ALL INCL - FCL IMPORT  756.50"
      ],
      "termsLines": [
        "1. Kindly contact our Imports Department/Customer Service for Actual Arrival.",
        "2. D.O Counter Timings – 10.00am to 01.00pm & 02.00pm to 4.30pm.",
        "3. Cheque in favor of “KingFisher Logistic”.",
        "4. Partial Payments are not acceptable.",
        "5. Free Days FCL– 5 Days (NON-DG), 3 Days (DG or IMCO)/ LCL – 5 Days Free Days.",
        "6. After Free days storage charges applicable."
      ]
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "docTitle",
        "text": "ARRIVAL NOTICE / FREIGHT BILL",
        "align": "center",
        "band": true
      },
      {
        "type": "fieldGrid",
        "cols": 2
      },
      {
        "type": "partyTriple"
      },
      {
        "type": "chargeTable",
        "headerColor": "primary"
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
    "code": "ARRIVAL_NOTICE_REPORT_FORMAT_4_ARRIVAL_NOTICE_USA",
    "formatNumber": 4,
    "name": "Arrival Notice Report Format-4 Arrival Notice USA",
    "paper": "A4",
    "rtl": false,
    "theme": {
      "primary": "#0A2942",
      "accent": "#0A2942",
      "fill": "#F3F3F3",
      "panel": "#EBF0F4",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#0A2942",
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
      "invoiceNo": "CSFI190012",
      "invoiceDate": "25-JAN-19",
      "currency": "USD",
      "total": "8,756.50",
      "totalLabel": "*** TOTAL DUE ( USD )***",
      "partyLeft": {
        "title": "Shipper (s)",
        "lines": [
          "AL NASER TRADING COMPANY LLC",
          "30 AL MAKTHOOM BUILDING NEAR MUBARAK CENTRE ROUND ABOUT",
          "AL NABHA SHARJAH SHARJAH UNITED ARAB EMIRATES"
        ]
      },
      "partyMid": {
        "title": "To (or Consignee)",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "NUNGAMBAKKAM CHENNAI TAMIL NADU 600084 INDIA",
          "EMAIL: ram@fresatechnologies.com"
        ]
      },
      "partyNotify": {
        "title": "Notify Party or Broker",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "NUNGAMBAKKAM CHENNAI TAMIL NADU 600084 INDIA"
        ]
      },
      "fieldGrid": [
        {
          "k": "Invoice No.",
          "v": "CSFI190012"
        },
        {
          "k": "Prepared By",
          "v": "RAM"
        },
        {
          "k": "MBL No. (or Carrier BL)",
          "v": "MBLCOPY87666666"
        },
        {
          "k": "File No.",
          "v": "CSFI190012"
        },
        {
          "k": "HBL No.(s)",
          "v": "PLJEAMAA00001"
        },
        {
          "k": "AMS No.(s)",
          "v": "AMSREF11234"
        },
        {
          "k": "Carrier",
          "v": "CMA CGM"
        },
        {
          "k": "Vessel Name (arriving)",
          "v": "MSC MELINA"
        },
        {
          "k": "Voyage Number",
          "v": "987"
        },
        {
          "k": "Port of Loading (Origin)",
          "v": "JEBEL ALI, UNITED ARAB EMIRATES"
        },
        {
          "k": "Place of Receipt (Origin)",
          "v": "DUBAI"
        },
        {
          "k": "Port of Discharge",
          "v": "CHENNAI (EX MADRAS), INDIA"
        },
        {
          "k": "ETA Port of Discharge",
          "v": "25-JAN-19"
        },
        {
          "k": "Custom Clearance Location",
          "v": "DUBAI PORT - FCL"
        },
        {
          "k": "Final Place of Delivery",
          "v": "CHENNAI"
        },
        {
          "k": "Service Type",
          "v": "FCL/FCL"
        },
        {
          "k": "Freight Terms",
          "v": "Freight PREPAID"
        },
        {
          "k": "BL Requirements",
          "v": "CREATED"
        },
        {
          "k": "Tracking Website",
          "v": "https://www.hapag-lloyd.com/en/online-business/tracing/"
        },
        {
          "k": "Important Remarks",
          "v": "CHENNAI ARRIVAL 1X20"
        }
      ],
      "tableHeaders": [
        "Description of Goods",
        "No. of Packages",
        "Marks & Nos / Container No.(s)",
        "Gross Weight",
        "Measurement"
      ],
      "tableRows": [
        [
          "STC: VALVE MATERIALS",
          "100",
          "TENU9876666-20' DC SEAL NO: SL988888",
          "18,000.000",
          "20.000"
        ],
        [
          "Total :",
          "100",
          "",
          "18,000.000",
          "20.000"
        ]
      ],
      "taxAmountLines": [
        "TERMINAL HANDLING CHARGES  5,000.00",
        "DELIVERY ORDER FEE  3,000.00",
        "ALL INCL - FCL IMPORT  756.50"
      ],
      "termsLines": [
        "1. Kindly contact our Imports Department/Customer Service for Actual Arrival.",
        "2. D.O Counter Timings – 10.00am to 01.00pm & 02.00pm to 4.30pm.",
        "3. Cheque in favor of “KingFisher Logistic”.",
        "4. Partial Payments are not acceptable.",
        "5. Free Days FCL– 5 Days (NON-DG), 3 Days (DG or IMCO)/ LCL – 5 Days Free Days.",
        "6. After Free days storage charges applicable."
      ]
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "docTitle",
        "text": "ARRIVAL NOTICE & INVOICE",
        "align": "center",
        "band": true
      },
      {
        "type": "partyTriple"
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
    "code": "ARRIVAL_NOTICE_REPORT_FORMAT_5_CARGO_ARRIVAL_NOTICE_SEA",
    "formatNumber": 5,
    "name": "Arrival Notice Report Format-5 Cargo Arrival Notice SEA",
    "paper": "A4",
    "rtl": false,
    "theme": {
      "primary": "#0A2942",
      "accent": "#0A2942",
      "fill": "#F3F3F3",
      "panel": "#EBF0F4",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#0A2942",
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
      "invoiceNo": "PLJEAMAA00001",
      "currency": "INR",
      "total": "10,332.67",
      "totalLabel": "TOTAL :",
      "words": "Rupee Ten Thousand Three Hundred Thirty-Two and Sixty-Seven PAISA Only",
      "billToLabel": "Client",
      "billToName": "4G LOGISTICS INDIA PVT LTD",
      "billToAddress": "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD NUNGAMBAKKAM CHENNAI TAMIL NADU 600084 INDIA",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "AL NASER TRADING COMPANY LLC",
          "30 AL MAKTHOOM BUILDING NEAR MUBARAK CENTRE ROUND ABOUT",
          "AL NABHA SHARJAH SHARJAH UNITED ARAB EMIRATES"
        ]
      },
      "partyMid": {
        "title": "Consignee",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "NUNGAMBAKKAM CHENNAI TAMIL NADU 600084 INDIA",
          "EMAIL: ram@fresatechnologies.com"
        ]
      },
      "partyNotify": {
        "title": "Notify1",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "NUNGAMBAKKAM CHENNAI TAMIL NADU 600084 INDIA"
        ]
      },
      "partyThird": {
        "title": "Forwarder",
        "lines": [
          "FRESA DEMO INDIA PVT LTD",
          "NO. 178, 2ND STREET, MOORE STREET",
          "CHENNAI TAMIL NADU 600001 INDIA"
        ]
      },
      "fieldGrid": [
        {
          "k": "Job No.",
          "v": "CSFI190012 / 25-JAN-19"
        },
        {
          "k": "Shipment No.",
          "v": "B/SFI/19/0166 / 22-JAN-19"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87666666 / 16-JAN-19"
        },
        {
          "k": "HBL No.",
          "v": "PLJEAMAA00001 / 16-JAN-19"
        },
        {
          "k": "Place of Receipt",
          "v": "DUBAI"
        },
        {
          "k": "Port of Loading",
          "v": "JEBEL ALI, UNITED ARAB EMIRATES"
        },
        {
          "k": "Port of Discharge",
          "v": "CHENNAI (EX MADRAS), INDIA"
        },
        {
          "k": "Port of Final Destination",
          "v": "CHENNAI (EX MADRAS), INDIA"
        },
        {
          "k": "Place of Delivery",
          "v": "CHENNAI"
        },
        {
          "k": "ETD",
          "v": "16-JAN-19"
        },
        {
          "k": "ETA",
          "v": "25-JAN-19"
        },
        {
          "k": "Carrier",
          "v": "CMA CGM"
        },
        {
          "k": "Vessel / Voyage",
          "v": "MSC MELINA / 987"
        },
        {
          "k": "Service Type",
          "v": "FCL/FCL"
        },
        {
          "k": "Freight",
          "v": "PREPAID"
        },
        {
          "k": "IGM No.",
          "v": "98778798 / 10-JAN-19"
        },
        {
          "k": "Line / Subline No.",
          "v": "1234 / 128"
        }
      ],
      "tableHeaders": [
        "Container",
        "Type",
        "Goods Description",
        "No. of Pkgs",
        "Volume",
        "Gross Weight"
      ],
      "tableRows": [
        [
          "TENU9876666",
          "20' DC",
          "STC: VALVE MATERIALS",
          "100",
          "20.00",
          "18,000.00"
        ]
      ],
      "osTableTitle": "Charges",
      "osTableHeaders": [
        "Charge",
        "Unit",
        "Qty",
        "Currency",
        "Ex.Rate",
        "Amount",
        "Tax",
        "Tax Amt",
        "Total"
      ],
      "osTableRows": [
        [
          "TERMINAL HANDLING CHARGES",
          "20' DRY CONTAINER",
          "1",
          "INR",
          "1.00000",
          "5,000.00",
          "GST18",
          "900.00",
          "5,900.00"
        ],
        [
          "DELIVERY ORDER FEE",
          "PER SHIPMENT",
          "1",
          "INR",
          "1.00000",
          "3,000.00",
          "GST18",
          "540.00",
          "3,540.00"
        ],
        [
          "ALL INCL - FCL IMPORT",
          "PER SHIPMENT",
          "1",
          "INR",
          "1.00000",
          "756.50",
          "GST18",
          "136.17",
          "892.67"
        ],
        [
          "TOTAL",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "10,332.67"
        ]
      ],
      "termsLines": [
        "1. Kindly contact our Imports Department/Customer Service for Actual Arrival.",
        "2. D.O Counter Timings – 10.00am to 01.00pm & 02.00pm to 4.30pm.",
        "3. Cheque in favor of “KingFisher Logistic”.",
        "4. Partial Payments are not acceptable.",
        "5. Free Days FCL– 5 Days (NON-DG), 3 Days (DG or IMCO)/ LCL – 5 Days Free Days.",
        "6. After Free days storage charges applicable."
      ],
      "remarks": "CHENNAI ARRIVAL 1X20"
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "docTitle",
        "text": "CARGO ARRIVAL NOTICE / HBL No. - PLJEAMAA00001",
        "align": "center",
        "band": true
      },
      {
        "type": "twoColumn",
        "showBillTo": true
      },
      {
        "type": "partyTriple"
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
        "type": "outstandingTable"
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
    "code": "ARRIVAL_NOTICE_REPORT_FORMAT_6_CARGO_ARRIVAL_NOTICE_SEA",
    "formatNumber": 6,
    "name": "Arrival Notice Report Format-6 Cargo Arrival Notice SEA",
    "paper": "A4",
    "rtl": false,
    "theme": {
      "primary": "#0A2942",
      "accent": "#0A2942",
      "fill": "#F3F3F3",
      "panel": "#EBF0F4",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#0A2942",
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
      "invoiceNo": "PLJEAMAA00001",
      "currency": "INR",
      "total": "10,332.67",
      "totalLabel": "TOTAL :",
      "words": "Rupee Ten Thousand Three Hundred Thirty-Two and Sixty-Seven PAISA Only",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "AL NASER TRADING COMPANY LLC",
          "30 AL MAKTHOOM BUILDING NEAR MUBARAK CENTRE ROUND ABOUT",
          "AL NABHA SHARJAH SHARJAH UNITED ARAB EMIRATES"
        ]
      },
      "partyMid": {
        "title": "Consignee",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "NUNGAMBAKKAM CHENNAI TAMIL NADU 600084 INDIA",
          "EMAIL: ram@fresatechnologies.com"
        ]
      },
      "fieldGrid": [
        {
          "k": "Job No.",
          "v": "CSFI190012 / 25-JAN-19"
        },
        {
          "k": "Shipment No.",
          "v": "B/SFI/19/0166 / 22-JAN-19"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87666666 / 16-JAN-19"
        },
        {
          "k": "HBL No.",
          "v": "PLJEAMAA00001 / 16-JAN-19"
        },
        {
          "k": "Place of Receipt",
          "v": "DUBAI"
        },
        {
          "k": "Port of Loading",
          "v": "JEBEL ALI, UNITED ARAB EMIRATES"
        },
        {
          "k": "Port of Discharge",
          "v": "CHENNAI (EX MADRAS), INDIA"
        },
        {
          "k": "Port of Final Destination",
          "v": "CHENNAI (EX MADRAS), INDIA"
        },
        {
          "k": "Place of Delivery",
          "v": "CHENNAI"
        },
        {
          "k": "ETD",
          "v": "16-JAN-19"
        },
        {
          "k": "ETA",
          "v": "25-JAN-19"
        },
        {
          "k": "Carrier",
          "v": "CMA CGM"
        },
        {
          "k": "Vessel / Voyage",
          "v": "MSC MELINA / 987"
        },
        {
          "k": "Service Type",
          "v": "FCL/FCL"
        },
        {
          "k": "Freight",
          "v": "PREPAID"
        },
        {
          "k": "IGM No.",
          "v": "98778798 / 10-JAN-19"
        },
        {
          "k": "Line / Subline No.",
          "v": "1234 / 128"
        }
      ],
      "tableHeaders": [
        "Container",
        "Type",
        "Goods Description",
        "No. of Pkgs",
        "Volume",
        "Gross Weight"
      ],
      "tableRows": [
        [
          "TENU9876666",
          "20' DC",
          "STC: VALVE MATERIALS",
          "100",
          "20.00",
          "18,000.00"
        ]
      ],
      "osTableTitle": "Charges",
      "osTableHeaders": [
        "Charge",
        "Unit",
        "Qty",
        "Currency",
        "Ex.Rate",
        "Amount",
        "Tax",
        "Tax Amt",
        "Total"
      ],
      "osTableRows": [
        [
          "TERMINAL HANDLING CHARGES",
          "20' DRY CONTAINER",
          "1",
          "INR",
          "1.00000",
          "5,000.00",
          "GST18",
          "900.00",
          "5,900.00"
        ],
        [
          "DELIVERY ORDER FEE",
          "PER SHIPMENT",
          "1",
          "INR",
          "1.00000",
          "3,000.00",
          "GST18",
          "540.00",
          "3,540.00"
        ],
        [
          "ALL INCL - FCL IMPORT",
          "PER SHIPMENT",
          "1",
          "INR",
          "1.00000",
          "756.50",
          "GST18",
          "136.17",
          "892.67"
        ],
        [
          "TOTAL",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "10,332.67"
        ]
      ],
      "termsLines": [
        "1. Kindly contact our Imports Department/Customer Service for Actual Arrival.",
        "2. D.O Counter Timings – 10.00am to 01.00pm & 02.00pm to 4.30pm.",
        "3. Cheque in favor of “KingFisher Logistic”.",
        "4. Partial Payments are not acceptable.",
        "5. Free Days FCL– 5 Days (NON-DG), 3 Days (DG or IMCO)/ LCL – 5 Days Free Days.",
        "6. After Free days storage charges applicable."
      ],
      "remarks": "CHENNAI ARRIVAL 1X20"
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "docTitle",
        "text": "CARGO ARRIVAL NOTICE",
        "align": "center",
        "band": true
      },
      {
        "type": "partyTriple"
      },
      {
        "type": "fieldGrid",
        "cols": 2
      },
      {
        "type": "chargeTable",
        "headerColor": "primary"
      },
      {
        "type": "outstandingTable"
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
    "code": "ARRIVAL_NOTICE_REPORT_FORMAT_7_CARGO_ARRIVAL_NOTICE_SEA",
    "formatNumber": 7,
    "name": "Arrival Notice Report Format-7 Cargo Arrival Notice SEA",
    "paper": "A4",
    "rtl": false,
    "theme": {
      "primary": "#0A2942",
      "accent": "#0A2942",
      "fill": "#F3F3F3",
      "panel": "#EBF0F4",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#0A2942",
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
      "invoiceNo": "PLJEAMAA00001",
      "currency": "INR",
      "total": "10,332.67",
      "totalLabel": "TOTAL :",
      "words": "Rupee Ten Thousand Three Hundred Thirty-Two and Sixty-Seven PAISA Only",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "AL NASER TRADING COMPANY LLC",
          "30 AL MAKTHOOM BUILDING NEAR MUBARAK CENTRE ROUND ABOUT",
          "AL NABHA SHARJAH SHARJAH UNITED ARAB EMIRATES"
        ]
      },
      "partyMid": {
        "title": "Consignee",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "NUNGAMBAKKAM CHENNAI TAMIL NADU 600084 INDIA",
          "EMAIL: ram@fresatechnologies.com"
        ]
      },
      "partyNotify": {
        "title": "Notify1",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "NUNGAMBAKKAM CHENNAI TAMIL NADU 600084 INDIA"
        ]
      },
      "fieldGrid": [
        {
          "k": "Job No.",
          "v": "CSFI190012 / 25-JAN-19"
        },
        {
          "k": "Shipment No.",
          "v": "B/SFI/19/0166 / 22-JAN-19"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87666666 / 16-JAN-19"
        },
        {
          "k": "HBL No.",
          "v": "PLJEAMAA00001 / 16-JAN-19"
        },
        {
          "k": "Place of Receipt",
          "v": "DUBAI"
        },
        {
          "k": "Port of Loading",
          "v": "JEBEL ALI, UNITED ARAB EMIRATES"
        },
        {
          "k": "Port of Discharge",
          "v": "CHENNAI (EX MADRAS), INDIA"
        },
        {
          "k": "Port of Final Destination",
          "v": "CHENNAI (EX MADRAS), INDIA"
        },
        {
          "k": "Place of Delivery",
          "v": "CHENNAI"
        },
        {
          "k": "ETD",
          "v": "16-JAN-19"
        },
        {
          "k": "ETA",
          "v": "25-JAN-19"
        },
        {
          "k": "Carrier",
          "v": "CMA CGM"
        },
        {
          "k": "Vessel / Voyage",
          "v": "MSC MELINA / 987"
        },
        {
          "k": "Service Type",
          "v": "FCL/FCL"
        },
        {
          "k": "Freight",
          "v": "PREPAID"
        },
        {
          "k": "IGM No.",
          "v": "98778798 / 10-JAN-19"
        }
      ],
      "tableHeaders": [
        "Container",
        "Type",
        "Goods Description",
        "No. of Pkgs",
        "Volume",
        "Gross Weight"
      ],
      "tableRows": [
        [
          "TENU9876666",
          "20' DC",
          "STC: VALVE MATERIALS",
          "100",
          "20.00",
          "18,000.00"
        ]
      ],
      "osTableTitle": "Charges",
      "osTableHeaders": [
        "Charge",
        "Unit",
        "Qty",
        "Currency",
        "Ex.Rate",
        "Amount",
        "Tax",
        "Tax Amt",
        "Total"
      ],
      "osTableRows": [
        [
          "TERMINAL HANDLING CHARGES",
          "20' DRY CONTAINER",
          "1",
          "INR",
          "1.00000",
          "5,000.00",
          "GST18",
          "900.00",
          "5,900.00"
        ],
        [
          "DELIVERY ORDER FEE",
          "PER SHIPMENT",
          "1",
          "INR",
          "1.00000",
          "3,000.00",
          "GST18",
          "540.00",
          "3,540.00"
        ],
        [
          "ALL INCL - FCL IMPORT",
          "PER SHIPMENT",
          "1",
          "INR",
          "1.00000",
          "756.50",
          "GST18",
          "136.17",
          "892.67"
        ],
        [
          "TOTAL",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "10,332.67"
        ]
      ],
      "termsLines": [
        "Note: Should you need our service to clear the cargoes on your behalf, please do not hesitate to contact the undermentioned.",
        "1. Kindly contact our Imports Department/Customer Service for Actual Arrival.",
        "2. D.O Counter Timings – 10.00am to 01.00pm & 02.00pm to 4.30pm.",
        "3. Cheque in favor of “KingFisher Logistic”.",
        "4. Partial Payments are not acceptable.",
        "5. Free Days FCL– 5 Days (NON-DG), 3 Days (DG or IMCO)/ LCL – 5 Days Free Days.",
        "6. After Free days storage charges applicable."
      ],
      "remarks": "CHENNAI ARRIVAL 1X20"
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "docTitle",
        "text": "CARGO ARRIVAL NOTICE",
        "align": "center",
        "band": true
      },
      {
        "type": "partyTriple"
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
        "type": "outstandingTable"
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
    "code": "ARRIVAL_NOTICE_REPORT_FORMAT_8_CARGO_ARRIVAL_NOTICE_SEA_WITHOUT_CHARGES",
    "formatNumber": 8,
    "name": "Arrival Notice Report Format-8 Cargo Arrival Notice SEA Without Charges",
    "paper": "A4",
    "rtl": false,
    "theme": {
      "primary": "#0A2942",
      "accent": "#0A2942",
      "fill": "#F3F3F3",
      "panel": "#EBF0F4",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#0A2942",
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
      "invoiceNo": "PLJEAMAA00001",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "AL NASER TRADING COMPANY LLC",
          "30 AL MAKTHOOM BUILDING NEAR MUBARAK CENTRE ROUND ABOUT",
          "AL NABHA SHARJAH SHARJAH UNITED ARAB EMIRATES"
        ]
      },
      "partyMid": {
        "title": "Consignee",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "NUNGAMBAKKAM CHENNAI TAMIL NADU 600084 INDIA",
          "EMAIL: ram@fresatechnologies.com"
        ]
      },
      "partyNotify": {
        "title": "Notify1",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "NUNGAMBAKKAM CHENNAI TAMIL NADU 600084 INDIA"
        ]
      },
      "fieldGrid": [
        {
          "k": "Job No",
          "v": "CSFI190012 / 25-JAN-19"
        },
        {
          "k": "MBL No",
          "v": "MBLCOPY87666666 / 16-JAN-19"
        },
        {
          "k": "HBL No",
          "v": "PLJEAMAA00001 / 16-JAN-19"
        },
        {
          "k": "Place of Receipt",
          "v": "DUBAI"
        },
        {
          "k": "Port of Loading",
          "v": "JEBEL ALI, UNITED ARAB EMIRATES"
        },
        {
          "k": "Port of Discharge",
          "v": "CHENNAI (EX MADRAS), INDIA"
        },
        {
          "k": "Port of Final Destination",
          "v": "CHENNAI (EX MADRAS), INDIA"
        },
        {
          "k": "Place of Delivery",
          "v": "CHENNAI"
        },
        {
          "k": "ETD",
          "v": "16-JAN-19"
        },
        {
          "k": "ETA",
          "v": "25-JAN-19"
        },
        {
          "k": "Carrier",
          "v": "CMA CGM"
        },
        {
          "k": "Vessel / Voyage",
          "v": "MSC MELINA / 987"
        },
        {
          "k": "Service Type",
          "v": "FCL/FCL"
        },
        {
          "k": "PP / CC",
          "v": "PREPAID"
        },
        {
          "k": "IGM No.",
          "v": "98778798 / 10-JAN-19"
        }
      ],
      "tableHeaders": [
        "Container",
        "Type",
        "Goods Description",
        "No. of Pkgs",
        "Volume",
        "Gross Weight"
      ],
      "tableRows": [
        [
          "TENU9876666",
          "20' DC",
          "STC: VALVE MATERIALS",
          "100",
          "20.00",
          "18,000.00"
        ]
      ],
      "termsLines": [
        "Note: Should you need our service to clear the cargoes on your behalf, please do not hesitate to contact the undermentioned.",
        "1. Kindly contact our Imports Department/Customer Service for Actual Arrival.",
        "2. D.O Counter Timings – 10.00am to 01.00pm & 02.00pm to 4.30pm.",
        "3. Cheque in favor of “KingFisher Logistic”.",
        "4. Partial Payments are not acceptable.",
        "5. Free Days FCL– 5 Days (NON-DG), 3 Days (DG or IMCO)/ LCL – 5 Days Free Days.",
        "6. After Free days storage charges applicable."
      ],
      "remarks": "CHENNAI ARRIVAL 1X20"
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "docTitle",
        "text": "CARGO ARRIVAL NOTICE",
        "align": "center",
        "band": true
      },
      {
        "type": "partyTriple"
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
        "type": "termsBank"
      },
      {
        "type": "colorfulFooter"
      }
    ]
  },
  {
    "code": "ARRIVAL_NOTICE_REPORT_FORMAT_9_CARGO_ARRIVAL_NOTICE_SEA_WITHOUT_CHARGES",
    "formatNumber": 9,
    "name": "Arrival Notice Report Format-9 Cargo Arrival Notice SEA Without Charges",
    "paper": "A4",
    "rtl": false,
    "theme": {
      "primary": "#0A2942",
      "accent": "#0A2942",
      "fill": "#F3F3F3",
      "panel": "#EBF0F4",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#0A2942",
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
      "invoiceNo": "PLJEAMAA00001",
      "billToLabel": "Client",
      "billToName": "4G LOGISTICS INDIA PVT LTD",
      "billToAddress": "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD NUNGAMBAKKAM CHENNAI TAMIL NADU 600084 INDIA",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "AL NASER TRADING COMPANY LLC",
          "30 AL MAKTHOOM BUILDING NEAR MUBARAK CENTRE ROUND ABOUT",
          "AL NABHA SHARJAH SHARJAH UNITED ARAB EMIRATES"
        ]
      },
      "partyMid": {
        "title": "Consignee",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "NUNGAMBAKKAM CHENNAI TAMIL NADU 600084 INDIA",
          "EMAIL: ram@fresatechnologies.com"
        ]
      },
      "partyNotify": {
        "title": "Notify1",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "NUNGAMBAKKAM CHENNAI TAMIL NADU 600084 INDIA"
        ]
      },
      "fieldGrid": [
        {
          "k": "Job No.",
          "v": "CSFI190012 / 25-JAN-19"
        },
        {
          "k": "Shipment No.",
          "v": "B/SFI/19/0166 / 22-JAN-19"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87666666 / 16-JAN-19"
        },
        {
          "k": "HBL No.",
          "v": "PLJEAMAA00001 / 16-JAN-19"
        },
        {
          "k": "Place of Receipt",
          "v": "DUBAI"
        },
        {
          "k": "Port of Loading",
          "v": "JEBEL ALI, UNITED ARAB EMIRATES"
        },
        {
          "k": "Port of Discharge",
          "v": "CHENNAI (EX MADRAS), INDIA"
        },
        {
          "k": "Port of Final Destination",
          "v": "CHENNAI (EX MADRAS), INDIA"
        },
        {
          "k": "Place of Delivery",
          "v": "CHENNAI"
        },
        {
          "k": "ETD",
          "v": "16-JAN-19"
        },
        {
          "k": "ETA",
          "v": "25-JAN-19"
        },
        {
          "k": "Carrier",
          "v": "CMA CGM"
        },
        {
          "k": "Vessel / Voyage",
          "v": "MSC MELINA / 987"
        },
        {
          "k": "Service Type",
          "v": "FCL/FCL"
        },
        {
          "k": "Freight",
          "v": "PREPAID"
        },
        {
          "k": "IGM No.",
          "v": "98778798 / 10-JAN-19"
        },
        {
          "k": "Line / Subline No.",
          "v": "1234 / 128"
        }
      ],
      "tableHeaders": [
        "Container",
        "Type",
        "Goods Description",
        "No. of Pkgs",
        "Volume",
        "Gross Weight"
      ],
      "tableRows": [
        [
          "TENU9876666",
          "20' DC",
          "STC: VALVE MATERIALS",
          "100",
          "20.00",
          "18,000.00"
        ]
      ],
      "remarks": "CHENNAI ARRIVAL 1X20",
      "termsLines": [
        "1. Kindly contact our Imports Department/Customer Service for Actual Arrival.",
        "2. D.O Counter Timings – 10.00am to 01.00pm & 02.00pm to 4.30pm.",
        "3. Cheque in favor of “KingFisher Logistic”.",
        "4. Partial Payments are not acceptable.",
        "5. Free Days FCL– 5 Days (NON-DG), 3 Days (DG or IMCO)/ LCL – 5 Days Free Days.",
        "6. After Free days storage charges applicable."
      ]
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "docTitle",
        "text": "CARGO ARRIVAL NOTICE / HBL No. - PLJEAMAA00001",
        "align": "center",
        "band": true
      },
      {
        "type": "twoColumn",
        "showBillTo": true
      },
      {
        "type": "partyTriple"
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
        "type": "termsBank"
      },
      {
        "type": "colorfulFooter"
      }
    ]
  },
  {
    "code": "ARRIVAL_NOTICE_REPORT_FORMAT_10_SEA_ARRIVAL_NOTICE_FCL_VIETNAM",
    "formatNumber": 10,
    "name": "Arrival Notice Report Format-10 SEA Arrival Notice FCL Vietnam",
    "paper": "A4",
    "rtl": false,
    "theme": {
      "primary": "#0A2942",
      "accent": "#0A2942",
      "fill": "#F3F3F3",
      "panel": "#EBF0F4",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#0A2942",
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
      "invoiceNo": "PLJEAMAA00001",
      "docSubtitle": "ARRIVAL NOTICE (THÔNG BÁO HÀNG ĐẾN)",
      "partyLeft": {
        "title": "Kính gửi / Messrs",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "NUNGAMBAKKAM CHENNAI TAMILNADU 600084 INDIA",
          "Attn: Import Department"
        ]
      },
      "partyMid": {
        "title": "NGƯỜI GỬI / SHIPPER",
        "lines": [
          "AL NASER TRADING COMPANY LLC"
        ]
      },
      "fieldGrid": [
        {
          "k": "CẢNG XẾP / POL",
          "v": "JEBEL ALI, UNITED ARAB EMIRATES"
        },
        {
          "k": "CẢNG DỠ / POD",
          "v": "CHENNAI (EX MADRAS), INDIA"
        },
        {
          "k": "TÊN TÀU / VESSEL",
          "v": "MSC MELINA / 987"
        },
        {
          "k": "NGÀY VỀ / ETA",
          "v": "25-JAN-2019"
        },
        {
          "k": "JOB",
          "v": "CSFI190012 / 25-JAN-19"
        },
        {
          "k": "SỐ MBL / HBL",
          "v": "MBLCOPY87666666 / PLJEAMAA00001"
        }
      ],
      "tableHeaders": [
        "CONT/SEAL",
        "PKG",
        "M3",
        "KGS",
        "COMM",
        "VOL",
        "BILL'S STATUS"
      ],
      "tableRows": [
        [
          "TENU9876666 / SL988888",
          "100 PACKAGES",
          "20.000",
          "18,000.000",
          "AS PER BILL",
          "1 X 20' DC",
          "CREATED"
        ]
      ],
      "osTableTitle": "ALL CHARGES HAVE TO PAY BEFORE PICK UP D/O ( Các phí cần thanh toán trước khi lấy lệnh )",
      "osTableHeaders": [
        "NO.",
        "DESCRIPTION",
        "QTY",
        "UNIT",
        "CUR",
        "UNIT PRICE",
        "TAX",
        "TOTAL USD",
        "TOTAL VND"
      ],
      "osTableRows": [
        [
          "1",
          "TERMINAL HANDLING CHARGES",
          "1",
          "20' DRY CONTAINER",
          "INR",
          "5,000.00",
          "GST18",
          "88.500",
          "5,900"
        ],
        [
          "2",
          "DELIVERY ORDER FEE",
          "1",
          "PER SHIPMENT",
          "INR",
          "3,000.00",
          "GST18",
          "53.100",
          "3,540"
        ],
        [
          "3",
          "ALL INCL",
          "1",
          "PER SHIPMENT",
          "INR",
          "756.50",
          "GST18",
          "13.391",
          "893"
        ],
        [
          "",
          "TOTAL :",
          "",
          "",
          "",
          "",
          "",
          "154.991",
          "10,333"
        ]
      ],
      "termsLines": [
        "ALL CHARGES HAVE TO PAY BEFORE PICK UP D/O ( Các phí cần thanh toán trước khi lấy lệnh )"
      ]
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "docTitle",
        "text": "ARRIVAL NOTICE (THÔNG BÁO HÀNG ĐẾN)",
        "align": "center",
        "band": true
      },
      {
        "type": "partyTriple"
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
        "type": "outstandingTable"
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
    "code": "ARRIVAL_CONFIRMATION",
    "formatNumber": 11,
    "name": "Arrival Confirmation Report Format",
    "paper": "A4",
    "rtl": false,
    "theme": {
      "primary": "#0A2942",
      "accent": "#0A2942",
      "fill": "#F3F3F3",
      "panel": "#EBF0F4",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#0A2942",
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
      "invoiceNo": "AWB91384768",
      "jobNo": "CAI190005",
      "shipmentNo": "B/AI/19/0041",
      "letterBody": "Dear Sir,\nWe are pleased to announce the arrival of your shipment in CHENNAI, INDIA on transit clearance formalities, surrender progress and we will revert with dispatch details soon.",
      "metaRows": [
        {
          "k": "MBL No",
          "v": "MAWB98777777 / 18-FEB-19"
        },
        {
          "k": "HBL No",
          "v": "AWB91384768 / 18-FEB-19"
        },
        {
          "k": "ETD",
          "v": "18-FEB-19"
        },
        {
          "k": "ETA",
          "v": "19-FEB-19"
        },
        {
          "k": "Container",
          "v": "—"
        },
        {
          "k": "Vessel / Voyage",
          "v": "EK / 176"
        },
        {
          "k": "Shipment No",
          "v": "B/AI/19/0041 / 18-FEB-19"
        },
        {
          "k": "Job No",
          "v": "CAI190005 / 19-FEB-19"
        },
        {
          "k": "Place of Receipt",
          "v": "DUBAI"
        },
        {
          "k": "Port of Loading",
          "v": "DUBAI INTERNATIONAL AIRPORT, UNITED ARAB EMIRATES"
        },
        {
          "k": "Port of Discharge",
          "v": "CHENNAI, INDIA"
        },
        {
          "k": "Place of Delivery",
          "v": "CHENNAI AIRPORT"
        },
        {
          "k": "Carrier",
          "v": "EMIRATES"
        },
        {
          "k": "Movement Type",
          "v": "PORT TO PORT"
        },
        {
          "k": "PP/CC",
          "v": "PREPAID"
        }
      ],
      "fieldGrid": [
        {
          "k": "MBL No",
          "v": "MAWB98777777 / 18-FEB-19"
        },
        {
          "k": "HBL No",
          "v": "AWB91384768 / 18-FEB-19"
        },
        {
          "k": "ETD",
          "v": "18-FEB-19"
        },
        {
          "k": "ETA",
          "v": "19-FEB-19"
        },
        {
          "k": "Vessel / Voyage",
          "v": "EK / 176"
        },
        {
          "k": "Shipment No",
          "v": "B/AI/19/0041 / 18-FEB-19"
        },
        {
          "k": "Job No",
          "v": "CAI190005 / 19-FEB-19"
        },
        {
          "k": "Port of Loading",
          "v": "DUBAI INTERNATIONAL AIRPORT, UAE"
        },
        {
          "k": "Port of Discharge",
          "v": "CHENNAI, INDIA"
        },
        {
          "k": "Place of Delivery",
          "v": "CHENNAI AIRPORT"
        },
        {
          "k": "Carrier",
          "v": "EMIRATES"
        },
        {
          "k": "PP/CC",
          "v": "PREPAID"
        }
      ],
      "partyLeft": {
        "title": "Attention",
        "lines": [
          "Air Import / Consignee"
        ]
      }
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "docTitle",
        "text": "ARRIVAL CONFIRMATION / BL NO - AWB91384768",
        "align": "center",
        "band": true
      },
      {
        "type": "fieldGrid",
        "cols": 2
      },
      {
        "type": "letterBody"
      },
      {
        "type": "colorfulFooter"
      }
    ]
  },
  {
    "code": "CARGO_ARRIVAL_NOTICE_AIR_REPORT_FORMAT",
    "formatNumber": 12,
    "name": "Cargo Arrival Notice Air Report Format",
    "paper": "A4",
    "rtl": false,
    "theme": {
      "primary": "#0A2942",
      "accent": "#0A2942",
      "fill": "#F3F3F3",
      "panel": "#EBF0F4",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#0A2942",
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
      "invoiceNo": "AWB91384768",
      "currency": "INR",
      "total": "2,950.00",
      "totalLabel": "TOTAL :",
      "words": "Rupee Two Thousand Nine Hundred Fifty Only",
      "billToLabel": "Client",
      "billToName": "BABU SECTOR PTLTD",
      "billToAddress": "144/8 NALLATHAMBI STREET, NEELANKARAI CHENNAI TAMIL NADU INDIA",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "AL NASER TRADING COMPANY LLC",
          "30 AL MAKTHOOM BUILDING NEAR MUBARAK CENTRE ROUND ABOUT",
          "AL NABHA SHARJAH SHARJAH UNITED ARAB EMIRATES"
        ]
      },
      "partyMid": {
        "title": "Consignee",
        "lines": [
          "BABU SECTOR PTLTD",
          "144/8 NALLATHAMBI STREET, NEELANKARAI",
          "CHENNAI TAMIL NADU INDIA"
        ]
      },
      "partyNotify": {
        "title": "Notify1",
        "lines": [
          "BABU SECTOR PTLTD",
          "144/8 NALLATHAMBI STREET, NEELANKARAI",
          "CHENNAI TAMIL NADU INDIA"
        ]
      },
      "fieldGrid": [
        {
          "k": "Job No.",
          "v": "CAI190005 / 19-FEB-19"
        },
        {
          "k": "MAWB No.",
          "v": "MAWB98777777 / 18-FEB-19"
        },
        {
          "k": "HAWB No.",
          "v": "AWB91384768 / 18-FEB-19"
        },
        {
          "k": "Place of Receipt",
          "v": "DUBAI"
        },
        {
          "k": "Port of Loading",
          "v": "DUBAI INTERNATIONAL AIRPORT, UNITED ARAB EMIRATES"
        },
        {
          "k": "Port of Discharge",
          "v": "CHENNAI, INDIA"
        },
        {
          "k": "Port of Final Destination",
          "v": "CHENNAI, INDIA"
        },
        {
          "k": "Place of Delivery",
          "v": "CHENNAI AIRPORT"
        },
        {
          "k": "ETD",
          "v": "18-FEB-19"
        },
        {
          "k": "ETA",
          "v": "19-FEB-19"
        },
        {
          "k": "Airline",
          "v": "EMIRATES"
        },
        {
          "k": "Flight Name / No.",
          "v": "EK / 176"
        },
        {
          "k": "Freight",
          "v": "PREPAID"
        },
        {
          "k": "IGM No.",
          "v": "9876777 / 19-FEB-19"
        },
        {
          "k": "Line / Subline No.",
          "v": "1289 / 127"
        }
      ],
      "tableHeaders": [
        "Goods Description",
        "No. of Pkgs",
        "Gross Weight",
        "Volume Weight"
      ],
      "tableRows": [
        [
          "STC: VALVE MATERIALS",
          "5",
          "375.000",
          "375.000"
        ]
      ],
      "osTableTitle": "Charges",
      "osTableHeaders": [
        "Charge",
        "Unit",
        "Qty",
        "Currency",
        "Ex.Rate",
        "Amount",
        "Tax",
        "Tax Amt",
        "Total"
      ],
      "osTableRows": [
        [
          "DELIVERY ORDER FEE",
          "PER SHIPMENT",
          "1",
          "INR",
          "1.00000",
          "2,500.00",
          "GST18",
          "450.00",
          "2,950.00"
        ],
        [
          "TOTAL",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "2,950.00"
        ]
      ],
      "termsLines": [
        "1. Kindly contact our Imports Department/Customer Service for Actual Arrival.",
        "2. D.O Counter Timings – 10.00am to 01.00pm & 02.00pm to 4.30pm.",
        "3. Cheque in favor of “KingFisher Logistic”.",
        "4. Partial Payments are not acceptable.",
        "5. Free Days FCL– 5 Days (NON-DG), 3 Days (DG or IMCO)/ LCL – 5 Days Free Days.",
        "6. After Free days storage charges applicable."
      ],
      "remarks": "VALVES"
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "docTitle",
        "text": "CARGO ARRIVAL NOTICE / HAWB - AWB91384768",
        "align": "center",
        "band": true
      },
      {
        "type": "twoColumn",
        "showBillTo": true
      },
      {
        "type": "partyTriple"
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
        "type": "outstandingTable"
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
    "code": "ARRIVAL_CONFIRMATION_FORMAT_1",
    "formatNumber": 13,
    "name": "Arrival Confirmation Format-1",
    "paper": "A4",
    "rtl": false,
    "theme": {
      "primary": "#0A2942",
      "accent": "#0A2942",
      "fill": "#F3F3F3",
      "panel": "#EBF0F4",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#0A2942",
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
      "invoiceNo": "PLMAAJEA00081",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "NUNGAMBAKKAM CHENNAI TAMIL NADU 600084 INDIA"
        ]
      },
      "partyMid": {
        "title": "Consignee",
        "lines": [
          "AL NASER TRADING COMPANY LLC",
          "30 AL MAKTHOOM BUILDING NEAR MUBARAK CENTRE",
          "AL NABHA SHARJAH UAE"
        ]
      },
      "metaRows": [
        {
          "k": "MBL No",
          "v": "MBLCOPY87667888 / 28-JAN-19"
        },
        {
          "k": "HBL No",
          "v": "PLMAAJEA00081 / 28-JAN-19"
        },
        {
          "k": "ETD",
          "v": "29-JAN-19"
        },
        {
          "k": "ETA",
          "v": "07-FEB-19"
        },
        {
          "k": "Vessel / Voyage",
          "v": "CMA CGM / 9887"
        },
        {
          "k": "Shipment No",
          "v": "B/EXP/19/0254 / 23-JAN-19"
        },
        {
          "k": "Job No",
          "v": "CEXP190150 / 29-JAN-19"
        },
        {
          "k": "Port of Loading",
          "v": "CHENNAI (EX MADRAS), INDIA"
        },
        {
          "k": "Port of Discharge",
          "v": "JEBEL ALI, UNITED ARAB EMIRATES"
        },
        {
          "k": "Place of Delivery",
          "v": "JEBEL ALI, UNITED ARAB EMIRATES"
        },
        {
          "k": "Carrier",
          "v": "CMA CGM"
        },
        {
          "k": "Movement Type",
          "v": "FCL"
        },
        {
          "k": "PP/CC",
          "v": "PREPAID"
        }
      ],
      "fieldGrid": [
        {
          "k": "MBL No",
          "v": "MBLCOPY87667888 / 28-JAN-19"
        },
        {
          "k": "HBL No",
          "v": "PLMAAJEA00081 / 28-JAN-19"
        },
        {
          "k": "ETD",
          "v": "29-JAN-19"
        },
        {
          "k": "ETA",
          "v": "07-FEB-19"
        },
        {
          "k": "Vessel / Voyage",
          "v": "CMA CGM / 9887"
        },
        {
          "k": "Shipment No",
          "v": "B/EXP/19/0254 / 23-JAN-19"
        },
        {
          "k": "Job No",
          "v": "CEXP190150 / 29-JAN-19"
        },
        {
          "k": "Port of Loading",
          "v": "CHENNAI (EX MADRAS), INDIA"
        },
        {
          "k": "Port of Discharge",
          "v": "JEBEL ALI, UNITED ARAB EMIRATES"
        },
        {
          "k": "Place of Delivery",
          "v": "JEBEL ALI, UNITED ARAB EMIRATES"
        },
        {
          "k": "Carrier",
          "v": "CMA CGM"
        },
        {
          "k": "Movement Type",
          "v": "FCL"
        },
        {
          "k": "PP/CC",
          "v": "PREPAID"
        }
      ],
      "tableHeaders": [
        "Container",
        "Type",
        "CFS Point",
        "Description",
        "No of Pcs",
        "Gross Weight",
        "Volume"
      ],
      "tableRows": [
        [
          "ABCU9877666",
          "20' DC",
          "—",
          "STC: VALVE MATERIALS FOR MACHINERY PARTS FREIGHT PREPAID",
          "125",
          "18,000.00",
          "24.00"
        ]
      ],
      "remarks": "Remarks :"
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "partyTriple"
      },
      {
        "type": "docTitle",
        "text": "ARRIVAL CONFIRMATION / BL NO - PLMAAJEA00081",
        "align": "center",
        "band": true
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
        "type": "colorfulFooter"
      }
    ]
  },
  {
    "code": "ARRIVAL_INFORMATION",
    "formatNumber": 14,
    "name": "Arrival Information",
    "paper": "A4",
    "rtl": false,
    "theme": {
      "primary": "#0A2942",
      "accent": "#0A2942",
      "fill": "#F3F3F3",
      "panel": "#EBF0F4",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#0A2942",
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
      "invoiceNo": "CEXP190150",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "NUNGAMBAKKAM CHENNAI TAMIL NADU 600084 INDIA"
        ]
      },
      "partyMid": {
        "title": "Consignee",
        "lines": [
          "AL NASER TRADING COMPANY LLC",
          "30 AL MAKTHOOM BUILDING NEAR MUBARAK CENTRE",
          "AL NABHA SHARJAH UAE"
        ]
      },
      "partyThird": {
        "title": "Agent",
        "lines": [
          "KingFisher Logistic",
          "Dubai, United Arab Emirates",
          "PHONE: +971 55 5355 286"
        ]
      },
      "partyNotify": {
        "title": "Notify Party",
        "lines": [
          "AL NASER TRADING COMPANY LLC",
          "30 AL MAKTHOOM BUILDING NEAR MUBARAK CENTRE",
          "AL NABHA SHARJAH UAE"
        ]
      },
      "fieldGrid": [
        {
          "k": "MBL No",
          "v": "MBLCOPY87667888 / 28-JAN-19"
        },
        {
          "k": "HBL No",
          "v": "PLMAAJEA00081 / 28-JAN-19"
        },
        {
          "k": "ETD",
          "v": "29-JAN-19"
        },
        {
          "k": "ETA",
          "v": "07-FEB-19"
        },
        {
          "k": "Vessel / Voyage",
          "v": "CMA CGM / 9887"
        },
        {
          "k": "Shipment No",
          "v": "B/EXP/19/0254 / 23-JAN-19"
        },
        {
          "k": "Job No",
          "v": "CEXP190150 / 29-JAN-19"
        },
        {
          "k": "Port of Loading",
          "v": "CHENNAI (EX MADRAS), INDIA"
        },
        {
          "k": "Port of Discharge",
          "v": "JEBEL ALI, UNITED ARAB EMIRATES"
        },
        {
          "k": "Place of Delivery",
          "v": "JEBEL ALI, UNITED ARAB EMIRATES"
        },
        {
          "k": "Carrier",
          "v": "CMA CGM"
        },
        {
          "k": "Movement Type",
          "v": "FCL"
        },
        {
          "k": "PP/CC",
          "v": "PREPAID"
        }
      ],
      "metaRows": [
        {
          "k": "MBL No",
          "v": "MBLCOPY87667888 / 28-JAN-19"
        },
        {
          "k": "HBL No",
          "v": "PLMAAJEA00081 / 28-JAN-19"
        },
        {
          "k": "ETD",
          "v": "29-JAN-19"
        },
        {
          "k": "ETA",
          "v": "07-FEB-19"
        },
        {
          "k": "Vessel / Voyage",
          "v": "CMA CGM / 9887"
        },
        {
          "k": "Shipment No",
          "v": "B/EXP/19/0254 / 23-JAN-19"
        },
        {
          "k": "Job No",
          "v": "CEXP190150 / 29-JAN-19"
        },
        {
          "k": "Port of Loading",
          "v": "CHENNAI (EX MADRAS), INDIA"
        },
        {
          "k": "Port of Discharge",
          "v": "JEBEL ALI, UNITED ARAB EMIRATES"
        },
        {
          "k": "Place of Delivery",
          "v": "JEBEL ALI, UNITED ARAB EMIRATES"
        },
        {
          "k": "Carrier",
          "v": "CMA CGM"
        },
        {
          "k": "Movement Type",
          "v": "FCL"
        },
        {
          "k": "PP/CC",
          "v": "PREPAID"
        }
      ],
      "tableHeaders": [
        "Container",
        "Type",
        "No. of Pkgs",
        "Goods Description",
        "Gross Weight",
        "Volume"
      ],
      "tableRows": [
        [
          "ABCU9877666",
          "20' DC",
          "125 PACKAGES",
          "STC: VALVE MATERIALS FOR MACHINERY PARTS FREIGHT PREPAID ALL DESTINATION CHARGES ARE CONSIGNEE'S ACCOUNT",
          "18,000.000 KGS",
          "24.000"
        ]
      ],
      "termsLines": [
        "********* AMOUNT WILL BE ACCEPTED IN CASH ONLY *********",
        "PLEASE CHECK WITH US FOR THE READINESS OF DELIVERY ORDER PRIOR TO COLLECTION OF SAME.",
        "Please present your original B/L duly endorsed (Except for Express Release) and collect the Line B/L - Delivery Order on payment of the following charges at the earliest to avoid Demurrage / Storage.",
        "FOR GENERAL CARGO, 5 DAYS FREE TIME FOR STORAGE FROM THE DATE OF VESSEL ARRIVAL.",
        "NO FREE STORAGE PERIOD FOR IMCO/HAZ CARGO, CHEMICAL, MEDICINE, FOOD STUFF.",
        "We thank you for giving us an opportunity to serve you and look forward for your continued support."
      ],
      "bankLines": [
        "ACCOUNT NAME: KingFisher Logistic",
        "BANK NAME - EMIRATES NBD",
        "A/C NO - 10 1235 8982 502",
        "SWIFT CODE - EBILAEAD",
        "IBAN: AE96 0260 0010 1235 8982 502"
      ]
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "docTitle",
        "text": "ARRIVAL INFORMATION",
        "align": "center",
        "band": true
      },
      {
        "type": "partyTriple"
      },
      {
        "type": "fieldGrid",
        "cols": 2
      },
      {
        "type": "chargeTable",
        "headerColor": "primary"
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
    "code": "FG_ARRIVAL_INFORMATION",
    "formatNumber": 15,
    "name": "FG Arrival Information",
    "paper": "A4",
    "rtl": false,
    "theme": {
      "primary": "#0A2942",
      "accent": "#0A2942",
      "fill": "#F3F3F3",
      "panel": "#EBF0F4",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#0A2942",
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
      "invoiceNo": "CEXP190150",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "NUNGAMBAKKAM CHENNAI TAMIL NADU 600084 INDIA"
        ]
      },
      "partyMid": {
        "title": "Consignee",
        "lines": [
          "AL NASER TRADING COMPANY LLC",
          "30 AL MAKTHOOM BUILDING NEAR MUBARAK CENTRE",
          "AL NABHA SHARJAH UAE"
        ]
      },
      "partyNotify": {
        "title": "Notify Party",
        "lines": [
          "AL NASER TRADING COMPANY LLC",
          "30 AL MAKTHOOM BUILDING NEAR MUBARAK CENTRE",
          "AL NABHA SHARJAH UAE"
        ]
      },
      "partyThird": {
        "title": "Agent",
        "lines": [
          "KingFisher Logistic",
          "Dubai, United Arab Emirates",
          "PHONE: +971 55 5355 286"
        ]
      },
      "fieldGrid": [
        {
          "k": "Job No.",
          "v": "CEXP190150 / 29-JAN-19"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888 / 28-JAN-19"
        },
        {
          "k": "HBL No.",
          "v": "PLMAAJEA00081 / 28-JAN-19"
        },
        {
          "k": "Booking No.",
          "v": "B/EXP/19/0254"
        },
        {
          "k": "Port of Loading",
          "v": "CHENNAI (EX MADRAS), INDIA"
        },
        {
          "k": "Port of Discharge",
          "v": "JEBEL ALI, UNITED ARAB EMIRATES"
        },
        {
          "k": "Place of Delivery",
          "v": "JEBEL ALI, UNITED ARAB EMIRATES"
        },
        {
          "k": "Vessel / Voyage",
          "v": "EVERGREEN MARINE / 9887"
        },
        {
          "k": "ETD",
          "v": "29-JAN-19"
        },
        {
          "k": "ETA",
          "v": "07-FEB-19"
        },
        {
          "k": "PP / CC",
          "v": "PREPAID"
        },
        {
          "k": "Movement Type",
          "v": "FCL"
        }
      ],
      "tableHeaders": [
        "Container",
        "Size",
        "No. of Pkgs",
        "Description of Goods",
        "Net Weight",
        "Gross Weight",
        "Volume"
      ],
      "tableRows": [
        [
          "ABCU9877666",
          "20' DC",
          "125 PACKAGES",
          "STC: VALVE MATERIALS FOR MACHINERY PARTS",
          "17000 KGS",
          "18000 KGS",
          "24.000"
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
        "text": "ARRIVAL INFORMATION",
        "align": "center",
        "band": true
      },
      {
        "type": "fieldGrid",
        "cols": 2
      },
      {
        "type": "partyTriple"
      },
      {
        "type": "chargeTable",
        "headerColor": "fill"
      },
      {
        "type": "colorfulFooter"
      }
    ]
  },
  {
    "code": "FG_ARRIVAL_NOTICE",
    "formatNumber": 16,
    "name": "FG Arrival Notice",
    "paper": "A4",
    "rtl": false,
    "theme": {
      "primary": "#0A2942",
      "accent": "#0A2942",
      "fill": "#F3F3F3",
      "panel": "#EBF0F4",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#0A2942",
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
      "invoiceNo": "CEXP190150",
      "total": "225.00",
      "totalLabel": "*** TOTAL DUE ( INR )***",
      "currency": "INR",
      "words": "Rupee Two Hundred Twenty-Five Only",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "NUNGAMBAKKAM CHENNAI TAMIL NADU 600084 INDIA"
        ]
      },
      "partyMid": {
        "title": "To / Consignee",
        "lines": [
          "AL NASER TRADING COMPANY LLC",
          "30 AL MAKTHOOM BUILDING NEAR MUBARAK CENTRE",
          "AL NABHA SHARJAH UAE"
        ]
      },
      "partyNotify": {
        "title": "Notify Party",
        "lines": [
          "AL NASER TRADING COMPANY LLC",
          "30 AL MAKTHOOM BUILDING NEAR MUBARAK CENTRE",
          "AL NABHA SHARJAH UAE"
        ]
      },
      "fieldGrid": [
        {
          "k": "House B/L No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "Master B/L No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Import File No.",
          "v": "CEXP190150"
        },
        {
          "k": "Carrier",
          "v": "CMA CGM"
        },
        {
          "k": "Vessel / Voyage",
          "v": "EVERGREEN MARINE / 9887"
        },
        {
          "k": "Port of Loading",
          "v": "CHENNAI (EX MADRAS), INDIA"
        },
        {
          "k": "Port of Discharge",
          "v": "JEBEL ALI, UNITED ARAB EMIRATES"
        },
        {
          "k": "Final Place of Delivery",
          "v": "JEBEL ALI, UNITED ARAB EMIRATES"
        },
        {
          "k": "ETD",
          "v": "29-JAN-19"
        },
        {
          "k": "ETA POD",
          "v": "07-FEB-19"
        },
        {
          "k": "Delivery Mode",
          "v": "FCL"
        },
        {
          "k": "Terms",
          "v": "Freight PREPAID"
        }
      ],
      "tableHeaders": [
        "Container No. / Type",
        "Seal",
        "Commodity Desc",
        "No of Pcs",
        "G.Wt (KGS)",
        "Vol (CBM)"
      ],
      "tableRows": [
        [
          "ABCU9877666 20' DC",
          "SL345566",
          "STC: VALVE MATERIALS FOR MACHINERY PARTS",
          "125",
          "18,000.000",
          "24.000"
        ],
        [
          "Total :",
          "",
          "",
          "125",
          "18,000.000",
          "24.000"
        ]
      ],
      "termsLines": [
        "1. Kindly contact our Imports Department/Customer Service for Actual Arrival.",
        "2. D.O Counter Timings – 10.00am to 01.00pm & 02.00pm to 4.30pm.",
        "3. Cheque in favor of “KingFisher Logistic”.",
        "4. Partial Payments are not acceptable.",
        "5. Free Days FCL– 5 Days (NON-DG), 3 Days (DG or IMCO)/ LCL – 5 Days Free Days.",
        "6. After Free days storage charges applicable."
      ],
      "taxAmountLines": [
        "OTHER CHARGES - PALLET REWORK  225.00"
      ]
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "docTitle",
        "text": "ARRIVAL NOTICE / FREIGHT BILL",
        "align": "center",
        "band": true
      },
      {
        "type": "fieldGrid",
        "cols": 2
      },
      {
        "type": "partyTriple"
      },
      {
        "type": "chargeTable",
        "headerColor": "primary"
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
    "code": "FG_ARRIVAL_NOTICE_FORMAT_2",
    "formatNumber": 17,
    "name": "FG Arrival Notice Format-2",
    "paper": "A4",
    "rtl": false,
    "theme": {
      "primary": "#0A2942",
      "accent": "#0A2942",
      "fill": "#F3F3F3",
      "panel": "#EBF0F4",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#0A2942",
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
      "invoiceNo": "CEXP190150",
      "invoiceDate": "07-FEB-19",
      "total": "125 pkgs",
      "totalLabel": "Total :",
      "partyLeft": {
        "title": "Shipper (s)",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "NUNGAMBAKKAM CHENNAI TAMIL NADU 600084 INDIA"
        ]
      },
      "partyMid": {
        "title": "To (or Consignee)",
        "lines": [
          "AL NASER TRADING COMPANY LLC",
          "30 AL MAKTHOOM BUILDING NEAR MUBARAK CENTRE",
          "AL NABHA SHARJAH UAE"
        ]
      },
      "partyNotify": {
        "title": "Notify Party or Broker",
        "lines": [
          "AL NASER TRADING COMPANY LLC",
          "30 AL MAKTHOOM BUILDING NEAR MUBARAK CENTRE",
          "AL NABHA SHARJAH UAE"
        ]
      },
      "fieldGrid": [
        {
          "k": "Invoice No.",
          "v": "CEXP190150"
        },
        {
          "k": "MBL No. (or Carrier BL)",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "HBL No.(s)",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "File No.",
          "v": "CEXP190150"
        },
        {
          "k": "Carrier",
          "v": "CMA CGM"
        },
        {
          "k": "Vessel Name (arriving)",
          "v": "EVERGREEN MARINE"
        },
        {
          "k": "Voyage Number",
          "v": "9887"
        },
        {
          "k": "Port of Loading (Origin)",
          "v": "CHENNAI (EX MADRAS), INDIA"
        },
        {
          "k": "Port of Discharge",
          "v": "JEBEL ALI, UNITED ARAB EMIRATES"
        },
        {
          "k": "ETA Port of Discharge",
          "v": "07-FEB-19"
        },
        {
          "k": "Delivery Type",
          "v": "FCL"
        },
        {
          "k": "Freight Terms",
          "v": "Freight PREPAID"
        },
        {
          "k": "BL Requirements",
          "v": "DRAFT"
        },
        {
          "k": "Tracking Website",
          "v": "https://www.hapag-lloyd.com/en/online-business/tracing/"
        }
      ],
      "tableHeaders": [
        "Description of Goods",
        "No. of Packages",
        "Marks & Nos / Container No.(s)",
        "Gross Weight",
        "Measurement"
      ],
      "tableRows": [
        [
          "STC: VALVE MATERIALS FOR MACHINERY PARTS",
          "125",
          "ABCU9877666-20' DC SEAL NO: SL345566",
          "18,000.000",
          "24.000"
        ],
        [
          "Total :",
          "125",
          "",
          "18,000.000",
          "24.000"
        ]
      ],
      "termsLines": [
        "1. Kindly contact our Imports Department/Customer Service for Actual Arrival.",
        "2. D.O Counter Timings – 10.00am to 01.00pm & 02.00pm to 4.30pm.",
        "3. Cheque in favor of “KingFisher Logistic”.",
        "4. Partial Payments are not acceptable.",
        "5. Free Days FCL– 5 Days (NON-DG), 3 Days (DG or IMCO)/ LCL – 5 Days Free Days.",
        "6. After Free days storage charges applicable."
      ]
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "docTitle",
        "text": "ARRIVAL NOTICE & INVOICE",
        "align": "center",
        "band": true
      },
      {
        "type": "fieldGrid",
        "cols": 2
      },
      {
        "type": "partyTriple"
      },
      {
        "type": "chargeTable",
        "headerColor": "fill"
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
    "code": "FG_ARRIVAL_NOTICE_WITHOUT_CHARGES",
    "formatNumber": 18,
    "name": "FG Arrival Notice Without Charges",
    "paper": "A4",
    "rtl": false,
    "theme": {
      "primary": "#0A2942",
      "accent": "#0A2942",
      "fill": "#F3F3F3",
      "panel": "#EBF0F4",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#0A2942",
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
      "invoiceNo": "CEXP190150",
      "invoiceDate": "07-FEB-19",
      "partyLeft": {
        "title": "Shipper (s)",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "NUNGAMBAKKAM CHENNAI TAMIL NADU 600084 INDIA"
        ]
      },
      "partyMid": {
        "title": "To (or Consignee)",
        "lines": [
          "AL NASER TRADING COMPANY LLC",
          "30 AL MAKTHOOM BUILDING NEAR MUBARAK CENTRE",
          "AL NABHA SHARJAH UAE"
        ]
      },
      "partyNotify": {
        "title": "Notify Party or Broker",
        "lines": [
          "AL NASER TRADING COMPANY LLC",
          "30 AL MAKTHOOM BUILDING NEAR MUBARAK CENTRE",
          "AL NABHA SHARJAH UAE"
        ]
      },
      "fieldGrid": [
        {
          "k": "Invoice No.",
          "v": "CEXP190150"
        },
        {
          "k": "MBL No. (or Carrier BL)",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "HBL No.(s)",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "File No.",
          "v": "CEXP190150"
        },
        {
          "k": "Carrier",
          "v": "CMA CGM"
        },
        {
          "k": "Vessel Name (arriving)",
          "v": "EVERGREEN MARINE"
        },
        {
          "k": "Voyage Number",
          "v": "9887"
        },
        {
          "k": "Port of Loading (Origin)",
          "v": "CHENNAI (EX MADRAS), INDIA"
        },
        {
          "k": "Port of Discharge",
          "v": "JEBEL ALI, UNITED ARAB EMIRATES"
        },
        {
          "k": "ETA Port of Discharge",
          "v": "07-FEB-19"
        },
        {
          "k": "Delivery Type",
          "v": "FCL"
        },
        {
          "k": "Freight Terms",
          "v": "Freight PREPAID"
        }
      ],
      "tableHeaders": [
        "Description of Goods",
        "No. of Packages",
        "Marks & Nos / Container No.(s)",
        "Gross Weight",
        "Measurement"
      ],
      "tableRows": [
        [
          "STC: VALVE MATERIALS FOR MACHINERY PARTS",
          "125",
          "ABCU9877666-20' DC SEAL NO: SL345566",
          "18,000.000",
          "24.000"
        ],
        [
          "Total :",
          "125",
          "",
          "18,000.000",
          "24.000"
        ]
      ],
      "termsLines": [
        "1. Kindly contact our Imports Department/Customer Service for Actual Arrival.",
        "2. D.O Counter Timings – 10.00am to 01.00pm & 02.00pm to 4.30pm.",
        "3. Cheque in favor of “KingFisher Logistic”.",
        "4. Partial Payments are not acceptable.",
        "5. Free Days FCL– 5 Days (NON-DG), 3 Days (DG or IMCO)/ LCL – 5 Days Free Days.",
        "6. After Free days storage charges applicable."
      ]
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "docTitle",
        "text": "ARRIVAL NOTICE & INVOICE",
        "align": "center",
        "band": true
      },
      {
        "type": "fieldGrid",
        "cols": 2
      },
      {
        "type": "partyTriple"
      },
      {
        "type": "chargeTable",
        "headerColor": "fill"
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
    "code": "FG_ARRIVAL_NOTICE_FORMAT_3",
    "formatNumber": 19,
    "name": "FG Arrival Notice Format-3",
    "paper": "A4",
    "rtl": false,
    "theme": {
      "primary": "#0A2942",
      "accent": "#0A2942",
      "fill": "#F3F3F3",
      "panel": "#EBF0F4",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#0A2942",
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
      "invoiceNo": "CEXP190150",
      "total": "225.00",
      "totalLabel": "PLEASE PAY THIS AMOUNT — TOTAL DUE INR",
      "currency": "INR",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "NUNGAMBAKKAM CHENNAI TAMIL NADU 600084 INDIA"
        ]
      },
      "partyMid": {
        "title": "Consignee",
        "lines": [
          "AL NASER TRADING COMPANY LLC",
          "30 AL MAKTHOOM BUILDING NEAR MUBARAK CENTRE",
          "AL NABHA SHARJAH UAE"
        ]
      },
      "partyNotify": {
        "title": "Notify Party",
        "lines": [
          "AL NASER TRADING COMPANY LLC",
          "30 AL MAKTHOOM BUILDING NEAR MUBARAK CENTRE",
          "AL NABHA SHARJAH UAE"
        ]
      },
      "fieldGrid": [
        {
          "k": "Master B/L No",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "House B/L No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "Filing No.",
          "v": "CEXP190150"
        },
        {
          "k": "Vessel Info.",
          "v": "EVERGREEN MARINE/9887"
        },
        {
          "k": "Port of Loading",
          "v": "CHENNAI (EX MADRAS), INDIA"
        },
        {
          "k": "Port of Discharge",
          "v": "JEBEL ALI, UNITED ARAB EMIRATES"
        },
        {
          "k": "Place of Delivery",
          "v": "JEBEL ALI, UNITED ARAB EMIRATES"
        },
        {
          "k": "ETD",
          "v": "01/29/2019"
        },
        {
          "k": "ETA",
          "v": "02/07/2019"
        },
        {
          "k": "Freight",
          "v": "FREIGHT PREPAID"
        },
        {
          "k": "Service",
          "v": "FCL"
        },
        {
          "k": "BL Required",
          "v": "No BL Required"
        }
      ],
      "tableHeaders": [
        "Container No./Seal No.",
        "No. of Packages",
        "Description of Goods",
        "Weight",
        "Measurement"
      ],
      "tableRows": [
        [
          "ABCU9877666-20' DC SEAL NO: SL345566",
          "125 PACKAGES",
          "STC: VALVE MATERIALS FOR MACHINERY PARTS",
          "18,000.000",
          "24.000"
        ]
      ],
      "taxAmountLines": [
        "OTHER CHARGES - PALLET REWORK  225.00"
      ]
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "docTitle",
        "text": "ARRIVAL NOTICE",
        "align": "center",
        "band": true
      },
      {
        "type": "fieldGrid",
        "cols": 2
      },
      {
        "type": "partyTriple"
      },
      {
        "type": "chargeTable",
        "headerColor": "primary"
      },
      {
        "type": "taxAmountBox"
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
    "code": "CARGO_ARRIVAL_NOTICE_AIR_WITHOUT_CHARGES_REPORT_FORMAT",
    "formatNumber": 20,
    "name": "Cargo Arrival Notice Air Without Charges Report Format",
    "paper": "A4",
    "rtl": false,
    "theme": {
      "primary": "#0A2942",
      "accent": "#0A2942",
      "fill": "#F3F3F3",
      "panel": "#EBF0F4",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#0A2942",
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
      "invoiceNo": "AWB91384768",
      "billToLabel": "Client",
      "billToName": "BABU SECTOR PTLTD",
      "billToAddress": "144/8 NALLATHAMBI STREET, NEELANKARAI CHENNAI TAMIL NADU INDIA",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "AL NASER TRADING COMPANY LLC",
          "30 AL MAKTHOOM BUILDING NEAR MUBARAK CENTRE ROUND ABOUT",
          "AL NABHA SHARJAH SHARJAH UNITED ARAB EMIRATES"
        ]
      },
      "partyMid": {
        "title": "Consignee",
        "lines": [
          "BABU SECTOR PTLTD",
          "144/8 NALLATHAMBI STREET, NEELANKARAI",
          "CHENNAI TAMIL NADU INDIA"
        ]
      },
      "partyNotify": {
        "title": "Notify1",
        "lines": [
          "BABU SECTOR PTLTD",
          "144/8 NALLATHAMBI STREET, NEELANKARAI",
          "CHENNAI TAMIL NADU INDIA"
        ]
      },
      "fieldGrid": [
        {
          "k": "Job No.",
          "v": "CAI190005 / 19-FEB-19"
        },
        {
          "k": "MAWB No.",
          "v": "MAWB98777777 / 18-FEB-19"
        },
        {
          "k": "HAWB No.",
          "v": "AWB91384768 / 18-FEB-19"
        },
        {
          "k": "Place of Receipt",
          "v": "DUBAI"
        },
        {
          "k": "Port of Loading",
          "v": "DUBAI INTERNATIONAL AIRPORT, UNITED ARAB EMIRATES"
        },
        {
          "k": "Port of Discharge",
          "v": "CHENNAI, INDIA"
        },
        {
          "k": "Port of Final Destination",
          "v": "CHENNAI, INDIA"
        },
        {
          "k": "Place of Delivery",
          "v": "CHENNAI AIRPORT"
        },
        {
          "k": "ETD",
          "v": "18-FEB-19"
        },
        {
          "k": "ETA",
          "v": "19-FEB-19"
        },
        {
          "k": "Airline",
          "v": "EMIRATES"
        },
        {
          "k": "Flight Name / No.",
          "v": "EK / 176"
        },
        {
          "k": "Freight",
          "v": "PREPAID"
        },
        {
          "k": "IGM No.",
          "v": "9876777 / 19-FEB-19"
        },
        {
          "k": "Line / Subline No.",
          "v": "1289 / 127"
        }
      ],
      "tableHeaders": [
        "Goods Description",
        "No. of Pkgs",
        "Gross Weight",
        "Volume Weight"
      ],
      "tableRows": [
        [
          "STC: VALVE MATERIALS",
          "5",
          "375.000",
          "375.000"
        ]
      ],
      "remarks": "VALVES",
      "termsLines": [
        "1. Kindly contact our Imports Department/Customer Service for Actual Arrival.",
        "2. D.O Counter Timings – 10.00am to 01.00pm & 02.00pm to 4.30pm.",
        "3. Cheque in favor of “KingFisher Logistic”.",
        "4. Partial Payments are not acceptable.",
        "5. Free Days FCL– 5 Days (NON-DG), 3 Days (DG or IMCO)/ LCL – 5 Days Free Days.",
        "6. After Free days storage charges applicable."
      ]
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "docTitle",
        "text": "CARGO ARRIVAL NOTICE / HAWB - AWB91384768",
        "align": "center",
        "band": true
      },
      {
        "type": "twoColumn",
        "showBillTo": true
      },
      {
        "type": "partyTriple"
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
        "type": "termsBank"
      },
      {
        "type": "colorfulFooter"
      }
    ]
  },
  {
    "code": "FG_CARGO_ARRIVAL_NOTICE",
    "formatNumber": 21,
    "name": "FG Cargo Arrival Notice",
    "paper": "A4",
    "rtl": false,
    "theme": {
      "primary": "#0A2942",
      "accent": "#0A2942",
      "fill": "#F3F3F3",
      "panel": "#EBF0F4",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#0A2942",
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
      "invoiceNo": "PLMAAJEA00081",
      "docSubtitle": "Attention: Ocean Import - Shipping Dept. Please come before 12:30pm or after 2:00pm",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "NUNGAMBAKKAM CHENNAI TAMIL NADU 600084 INDIA"
        ]
      },
      "partyMid": {
        "title": "Consignee",
        "lines": [
          "AL NASER TRADING COMPANY LLC",
          "30 AL MAKTHOOM BUILDING NEAR MUBARAK CENTRE",
          "AL NABHA SHARJAH UAE"
        ]
      },
      "partyNotify": {
        "title": "Notify 1",
        "lines": [
          "AL NASER TRADING COMPANY LLC",
          "30 AL MAKTHOOM BUILDING NEAR MUBARAK CENTRE",
          "AL NABHA SHARJAH UAE"
        ]
      },
      "fieldGrid": [
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888 / 28-JAN-19"
        },
        {
          "k": "HBL No.",
          "v": "PLMAAJEA00081 / 28-JAN-19"
        },
        {
          "k": "ETD / ETA",
          "v": "29-JAN-19 / 07-FEB-19"
        },
        {
          "k": "Vessel / Voyage No.",
          "v": "EVERGREEN MARINE / 9887"
        },
        {
          "k": "Port of Loading",
          "v": "CHENNAI (EX MADRAS), INDIA"
        },
        {
          "k": "Port of Discharge",
          "v": "JEBEL ALI, UNITED ARAB EMIRATES"
        },
        {
          "k": "Final Destination",
          "v": "JEBEL ALI, UNITED ARAB EMIRATES"
        },
        {
          "k": "Gross Weight",
          "v": "18,000.00 KGS"
        },
        {
          "k": "Measurement",
          "v": "24.000 CBM"
        },
        {
          "k": "No. of Pcs",
          "v": "125"
        },
        {
          "k": "Freight",
          "v": "PREPAID"
        },
        {
          "k": "BL Status",
          "v": "DRAFT"
        }
      ],
      "letterBody": "Attention: Ocean Import - Shipping Dept.\nPlease come before 12:30pm or after 2:00pm",
      "termsLines": [
        "1. Kindly contact our Imports Department/Customer Service for Actual Arrival.",
        "2. D.O Counter Timings – 10.00am to 01.00pm & 02.00pm to 4.30pm.",
        "3. Cheque in favor of “KingFisher Logistic”.",
        "4. Partial Payments are not acceptable.",
        "5. Free Days FCL– 5 Days (NON-DG), 3 Days (DG or IMCO)/ LCL – 5 Days Free Days.",
        "6. After Free days storage charges applicable."
      ]
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "docTitle",
        "text": "ARRIVAL NOTICE",
        "align": "center",
        "band": true
      },
      {
        "type": "letterBody"
      },
      {
        "type": "partyTriple"
      },
      {
        "type": "fieldGrid",
        "cols": 2
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
    "code": "FG_CARGO_ARRIVAL_NOTICE_FORMAT_1",
    "formatNumber": 22,
    "name": "FG Cargo Arrival Notice Format-1",
    "paper": "A4",
    "rtl": false,
    "theme": {
      "primary": "#0A2942",
      "accent": "#0A2942",
      "fill": "#F3F3F3",
      "panel": "#EBF0F4",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#0A2942",
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
      "invoiceNo": "B/EXP/19/0254",
      "invoiceDate": "23-JAN-19",
      "docSubtitle": "SUB: CONTAINER RELEASE ORDER",
      "partyLeft": {
        "title": "TO / SHIPPER",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "NUNGAMBAKKAM CHENNAI TAMIL NADU 600084 INDIA"
        ]
      },
      "partyMid": {
        "title": "BOOKING PARTY",
        "lines": [
          "AL NASER TRADING COMPANY LLC"
        ]
      },
      "fieldGrid": [
        {
          "k": "REF / CRO NO.",
          "v": "B/EXP/19/0254"
        },
        {
          "k": "Date",
          "v": "23-JAN-19"
        },
        {
          "k": "Commodity",
          "v": "STC: VALVE MATERIALS FOR MACHINERY PARTS"
        },
        {
          "k": "Weight",
          "v": "18000 KGS"
        },
        {
          "k": "Port of Loading",
          "v": "CHENNAI (EX MADRAS), INDIA"
        },
        {
          "k": "Port of Discharge",
          "v": "JEBEL ALI, UNITED ARAB EMIRATES"
        },
        {
          "k": "Final Destination",
          "v": "JEBEL ALI, UNITED ARAB EMIRATES"
        },
        {
          "k": "Vessel / Voy",
          "v": "EVERGREEN MARINE / 9887"
        },
        {
          "k": "ETA",
          "v": "07-FEB-19"
        },
        {
          "k": "ETD",
          "v": "29-JAN-19"
        },
        {
          "k": "Container No.",
          "v": "ABCU9877666 (20' DC) / SL345566"
        }
      ],
      "letterBody": "Dear Sir,\nSUB: CONTAINER RELEASE ORDER\nLoaded containers must be returned in safe and sound condition at our nominated site within stipulated free time (7 days), failing which detention / advancement fee will be levied.",
      "tableHeaders": [
        "Size",
        "1-7 Days",
        "8-14 Days",
        "15-21 Days",
        "22-28 Days",
        "29+ Days"
      ],
      "tableRows": [
        [
          "20' GP",
          "$0.00",
          "$10.00",
          "$20.00",
          "$40.00",
          "$80.00"
        ],
        [
          "40' HC",
          "$0.00",
          "$20.00",
          "$40.00",
          "$80.00",
          "$160.00"
        ]
      ],
      "termsLines": [
        "1) Please allot clean good container only.",
        "2) Ensure that empty containers received from our Yard are clean and sound in condition.",
        "3) Any Loss and/or damage to the container while in custody of Shipper shall be fully indemnified.",
        "4) Vessel ETA/ETD subject to change without prior notice.",
        "THIS IS A SYSTEM GENERATED DOCUMENT AND DOES NOT REQUIRE ANY SIGNATURE."
      ]
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "docTitle",
        "text": "EXPORT CONTAINER RELEASE ORDER",
        "align": "center",
        "band": true
      },
      {
        "type": "fieldGrid",
        "cols": 2
      },
      {
        "type": "partyTriple"
      },
      {
        "type": "letterBody"
      },
      {
        "type": "chargeTable",
        "headerColor": "fill"
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
    "code": "FG_CARGO_ARRIVAL_NOTICE_SEA",
    "formatNumber": 23,
    "name": "FG Cargo Arrival Notice SEA",
    "paper": "A4",
    "rtl": false,
    "theme": {
      "primary": "#0A2942",
      "accent": "#0A2942",
      "fill": "#F3F3F3",
      "panel": "#EBF0F4",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#0A2942",
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
      "invoiceNo": "PLMAAJEA00081",
      "currency": "INR",
      "total": "265.50",
      "totalLabel": "TOTAL :",
      "billToLabel": "Client",
      "billToName": "4G LOGISTICS INDIA PVT LTD",
      "billToAddress": "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD CHENNAI 600084",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "NUNGAMBAKKAM CHENNAI TAMIL NADU 600084 INDIA"
        ]
      },
      "partyMid": {
        "title": "Consignee",
        "lines": [
          "AL NASER TRADING COMPANY LLC",
          "30 AL MAKTHOOM BUILDING NEAR MUBARAK CENTRE",
          "AL NABHA SHARJAH UAE"
        ]
      },
      "partyNotify": {
        "title": "Notify1",
        "lines": [
          "AL NASER TRADING COMPANY LLC",
          "30 AL MAKTHOOM BUILDING NEAR MUBARAK CENTRE",
          "AL NABHA SHARJAH UAE"
        ]
      },
      "fieldGrid": [
        {
          "k": "Job No.",
          "v": "CEXP190150 / 29-JAN-19"
        },
        {
          "k": "Shipment No.",
          "v": "B/EXP/19/0254 / 23-JAN-19"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888 / 28-JAN-19"
        },
        {
          "k": "HBL No.",
          "v": "PLMAAJEA00081 / 28-JAN-19"
        },
        {
          "k": "Port of Loading",
          "v": "CHENNAI (EX MADRAS), INDIA"
        },
        {
          "k": "Port of Discharge",
          "v": "JEBEL ALI, UNITED ARAB EMIRATES"
        },
        {
          "k": "Place of Delivery",
          "v": "JEBEL ALI, UNITED ARAB EMIRATES"
        },
        {
          "k": "Service Type",
          "v": "FCL"
        },
        {
          "k": "ETD",
          "v": "29-JAN-19"
        },
        {
          "k": "ETA",
          "v": "07-FEB-19"
        },
        {
          "k": "Carrier",
          "v": "CMA CGM"
        },
        {
          "k": "Vessel / Voyage",
          "v": "CMA CGM / 9887"
        },
        {
          "k": "Freight",
          "v": "PREPAID"
        }
      ],
      "tableHeaders": [
        "Container",
        "Type",
        "Goods Description",
        "No. of Pkgs",
        "Volume",
        "Net Weight",
        "Gross Weight"
      ],
      "tableRows": [
        [
          "ABCU9877666",
          "20' DC",
          "STC: VALVE MATERIALS FOR MACHINERY PARTS",
          "125",
          "24.000",
          "17,000.000",
          "18,000.000"
        ]
      ],
      "osTableHeaders": [
        "Charge",
        "Unit",
        "Qty",
        "Currency",
        "Ex.Rate",
        "Amount",
        "Tax",
        "Tax Amt",
        "Total"
      ],
      "osTableRows": [
        [
          "OTHER CHARGES - PALLET REWORK",
          "PER SHIPMENT",
          "1",
          "INR",
          "1.00000",
          "225.00",
          "GST18",
          "40.50",
          "265.50"
        ],
        [
          "TOTAL",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "265.50"
        ]
      ],
      "termsLines": [
        "1. Kindly contact our Imports Department/Customer Service for Actual Arrival.",
        "2. D.O Counter Timings – 10.00am to 01.00pm & 02.00pm to 4.30pm.",
        "3. Cheque in favor of “KingFisher Logistic”.",
        "4. Partial Payments are not acceptable.",
        "5. Free Days FCL– 5 Days (NON-DG), 3 Days (DG or IMCO)/ LCL – 5 Days Free Days.",
        "6. After Free days storage charges applicable."
      ]
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "docTitle",
        "text": "CARGO ARRIVAL NOTICE / HBL NO. - PLMAAJEA00081",
        "align": "center",
        "band": true
      },
      {
        "type": "twoColumn",
        "showBillTo": true
      },
      {
        "type": "partyTriple"
      },
      {
        "type": "fieldGrid",
        "cols": 2
      },
      {
        "type": "chargeTable",
        "headerColor": "primary"
      },
      {
        "type": "outstandingTable"
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
    "code": "CARGO_ARRIVAL_NOTICE_SEA_FORMAT_2",
    "formatNumber": 24,
    "name": "Cargo Arrival Notice SEA Format-2",
    "paper": "A4",
    "rtl": false,
    "theme": {
      "primary": "#0A2942",
      "accent": "#0A2942",
      "fill": "#F3F3F3",
      "panel": "#EBF0F4",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#0A2942",
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
      "invoiceNo": "PLMAAJEA00081",
      "currency": "INR",
      "total": "265.50",
      "totalLabel": "TOTAL :",
      "words": "Rupee Two Hundred Sixty-Five and PAISA Fifty Only",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "NUNGAMBAKKAM CHENNAI TAMIL NADU 600084 INDIA"
        ]
      },
      "partyMid": {
        "title": "Consignee",
        "lines": [
          "AL NASER TRADING COMPANY LLC",
          "30 AL MAKTHOOM BUILDING NEAR MUBARAK CENTRE",
          "AL NABHA SHARJAH UAE"
        ]
      },
      "fieldGrid": [
        {
          "k": "Job No.",
          "v": "CEXP190150 / 29-JAN-19"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888 / 28-JAN-19"
        },
        {
          "k": "HBL No.",
          "v": "PLMAAJEA00081 / 28-JAN-19"
        },
        {
          "k": "Port of Loading",
          "v": "CHENNAI (EX MADRAS), INDIA"
        },
        {
          "k": "Port of Discharge",
          "v": "JEBEL ALI, UNITED ARAB EMIRATES"
        },
        {
          "k": "Place of Delivery",
          "v": "JEBEL ALI, UNITED ARAB EMIRATES"
        },
        {
          "k": "ETD",
          "v": "29-JAN-19"
        },
        {
          "k": "ETA",
          "v": "07-FEB-19"
        },
        {
          "k": "Carrier",
          "v": "CMA CGM"
        },
        {
          "k": "Vessel / Voyage",
          "v": "CMA CGM / 9887"
        },
        {
          "k": "Service Type",
          "v": "FCL"
        },
        {
          "k": "Freight",
          "v": "PREPAID"
        }
      ],
      "tableHeaders": [
        "Container",
        "Type",
        "Goods Description",
        "No. of Pkgs",
        "Volume",
        "Net Weight",
        "Gross Weight"
      ],
      "tableRows": [
        [
          "ABCU9877666",
          "20' DC",
          "STC: VALVE MATERIALS FOR MACHINERY PARTS",
          "125",
          "24.00",
          "17,000.00",
          "18,000.00"
        ]
      ],
      "osTableHeaders": [
        "Charge",
        "Unit",
        "Qty",
        "Currency",
        "Ex.Rate",
        "Amount",
        "Tax",
        "Tax Amt",
        "Total"
      ],
      "osTableRows": [
        [
          "OTHER CHARGES - PALLET REWORK",
          "PER SHIPMENT",
          "1",
          "INR",
          "1.00000",
          "225.00",
          "GST18",
          "40.50",
          "265.50"
        ],
        [
          "TOTAL",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "265.50"
        ]
      ],
      "termsLines": [
        "********* AMOUNT WILL BE ACCEPTED IN CASH ONLY *********",
        "PLEASE CHECK WITH US FOR THE READINESS OF DELIVERY ORDER PRIOR TO COLLECTION OF SAME.",
        "Please present your original B/L duly endorsed (Except for Express Release) and collect the Line B/L - Delivery Order on payment of the following charges at the earliest to avoid Demurrage / Storage.",
        "FOR GENERAL CARGO, 5 DAYS FREE TIME FOR STORAGE FROM THE DATE OF VESSEL ARRIVAL.",
        "NO FREE STORAGE PERIOD FOR IMCO/HAZ CARGO, CHEMICAL, MEDICINE, FOOD STUFF.",
        "We thank you for giving us an opportunity to serve you and look forward for your continued support."
      ]
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "docTitle",
        "text": "CARGO ARRIVAL NOTICE",
        "align": "center",
        "band": true
      },
      {
        "type": "partyTriple"
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
        "type": "outstandingTable"
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
    "code": "CARGO_ARRIVAL_NOTICE_SEA_FORMAT_3",
    "formatNumber": 25,
    "name": "Cargo Arrival Notice SEA Format-3",
    "paper": "A4",
    "rtl": false,
    "theme": {
      "primary": "#0A2942",
      "accent": "#0A2942",
      "fill": "#F3F3F3",
      "panel": "#EBF0F4",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#0A2942",
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
      "invoiceNo": "PLMAAJEA00081",
      "currency": "INR",
      "total": "265.50",
      "totalLabel": "TOTAL :",
      "words": "Rupee Two Hundred Sixty-Five and PAISA Fifty Only",
      "billToLabel": "Client",
      "billToName": "4G LOGISTICS INDIA PVT LTD",
      "billToAddress": "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD CHENNAI 600084",
      "partyLeft": {
        "title": "Consignee",
        "lines": [
          "AL NASER TRADING COMPANY LLC",
          "30 AL MAKTHOOM BUILDING NEAR MUBARAK CENTRE",
          "AL NABHA SHARJAH UAE"
        ]
      },
      "partyMid": {
        "title": "Notify1",
        "lines": [
          "AL NASER TRADING COMPANY LLC",
          "30 AL MAKTHOOM BUILDING NEAR MUBARAK CENTRE",
          "AL NABHA SHARJAH UAE"
        ]
      },
      "fieldGrid": [
        {
          "k": "Job No.",
          "v": "CEXP190150 / 29-JAN-19"
        },
        {
          "k": "Shipment No.",
          "v": "B/EXP/19/0254 / 23-JAN-19"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888 / 28-JAN-19"
        },
        {
          "k": "HBL No.",
          "v": "PLMAAJEA00081 / 28-JAN-19"
        },
        {
          "k": "Port of Loading",
          "v": "CHENNAI (EX MADRAS), INDIA"
        },
        {
          "k": "Port of Discharge",
          "v": "JEBEL ALI, UNITED ARAB EMIRATES"
        },
        {
          "k": "Service Type",
          "v": "FCL"
        },
        {
          "k": "ETD",
          "v": "29-JAN-19"
        },
        {
          "k": "ETA",
          "v": "07-FEB-19"
        },
        {
          "k": "Carrier",
          "v": "CMA CGM"
        },
        {
          "k": "Vessel / Voyage",
          "v": "CMA CGM / 9887"
        },
        {
          "k": "Freight",
          "v": "PREPAID"
        }
      ],
      "tableHeaders": [
        "Container",
        "Type",
        "Goods Description",
        "No. of Pkgs",
        "Volume",
        "Net Weight",
        "Gross Weight"
      ],
      "tableRows": [
        [
          "ABCU9877666",
          "20' DC",
          "STC: VALVE MATERIALS FOR MACHINERY PARTS",
          "125",
          "24.00",
          "17,000.00",
          "18,000.00"
        ],
        [
          "No. of Container",
          "Type",
          "",
          "",
          "",
          "",
          ""
        ],
        [
          "1",
          "20' DC",
          "",
          "",
          "",
          "",
          ""
        ]
      ],
      "osTableHeaders": [
        "Charge",
        "Unit",
        "Qty",
        "Currency",
        "Ex.Rate",
        "Amount",
        "Tax",
        "Tax Amt",
        "Total"
      ],
      "osTableRows": [
        [
          "OTHER CHARGES - PALLET REWORK",
          "PER SHIPMENT",
          "1",
          "INR",
          "1.00000",
          "225.00",
          "GST18",
          "40.50",
          "265.50"
        ],
        [
          "TOTAL",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "265.50"
        ]
      ],
      "termsLines": [
        "********* AMOUNT WILL BE ACCEPTED IN CASH ONLY *********",
        "PLEASE CHECK WITH US FOR THE READINESS OF DELIVERY ORDER PRIOR TO COLLECTION OF SAME.",
        "Please present your original B/L duly endorsed (Except for Express Release) and collect the Line B/L - Delivery Order on payment of the following charges at the earliest to avoid Demurrage / Storage.",
        "FOR GENERAL CARGO, 5 DAYS FREE TIME FOR STORAGE FROM THE DATE OF VESSEL ARRIVAL.",
        "NO FREE STORAGE PERIOD FOR IMCO/HAZ CARGO, CHEMICAL, MEDICINE, FOOD STUFF.",
        "We thank you for giving us an opportunity to serve you and look forward for your continued support."
      ]
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "docTitle",
        "text": "CARGO ARRIVAL NOTICE",
        "align": "center",
        "band": true
      },
      {
        "type": "twoColumn",
        "showBillTo": true
      },
      {
        "type": "partyTriple"
      },
      {
        "type": "fieldGrid",
        "cols": 2
      },
      {
        "type": "chargeTable",
        "headerColor": "primary"
      },
      {
        "type": "outstandingTable"
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
    "code": "CARGO_ARRIVAL_NOTICE_SEA_FORMAT_1",
    "formatNumber": 26,
    "name": "Cargo Arrival Notice SEA Format-1",
    "paper": "A4",
    "rtl": false,
    "theme": {
      "primary": "#0A2942",
      "accent": "#0A2942",
      "fill": "#F3F3F3",
      "panel": "#EBF0F4",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#0A2942",
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
      "invoiceNo": "BOMMAADXB0332",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "—"
        ]
      },
      "partyMid": {
        "title": "Consignee",
        "lines": [
          "—"
        ]
      },
      "partyNotify": {
        "title": "Notify1",
        "lines": [
          "—"
        ]
      },
      "fieldGrid": [
        {
          "k": "Job No.",
          "v": "CBOMEXP230787 / 18-MAY-23"
        },
        {
          "k": "MBL No.",
          "v": "/"
        },
        {
          "k": "HBL No.",
          "v": "BOMMAADXB0332 /"
        },
        {
          "k": "Port of Loading",
          "v": "CHENNAI (EX MADRAS)"
        },
        {
          "k": "Port of Discharge",
          "v": "DUBAI"
        },
        {
          "k": "Place of Delivery",
          "v": "DUBAI"
        },
        {
          "k": "ETD",
          "v": "18-MAY-23"
        },
        {
          "k": "ETA",
          "v": "31-MAY-23"
        }
      ],
      "tableHeaders": [
        "Container",
        "Type",
        "Goods Description",
        "No. of Pkgs",
        "Volume",
        "Net Weight",
        "Gross Weight"
      ],
      "tableRows": [
        [
          "—",
          "—",
          "—",
          "45",
          "400.00",
          "—",
          "500.00"
        ]
      ],
      "termsLines": [
        "1. Kindly contact our Imports Department/Customer Service for Actual Arrival.",
        "2. D.O Counter Timings – 10.00am to 01.00pm & 02.00pm to 4.30pm.",
        "3. Cheque in favor of “KingFisher Logistic”.",
        "4. Partial Payments are not acceptable.",
        "5. Free Days FCL– 5 Days (NON-DG), 3 Days (DG or IMCO)/ LCL – 5 Days Free Days.",
        "6. After Free days storage charges applicable."
      ]
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "docTitle",
        "text": "CARGO ARRIVAL NOTICE",
        "align": "center",
        "band": true
      },
      {
        "type": "partyTriple"
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
        "type": "termsBank"
      },
      {
        "type": "colorfulFooter"
      }
    ]
  },
  {
    "code": "CARGO_ARRIVAL_NOTICE_SEA_WITHOUT_CHARGES_FORMAT_1",
    "formatNumber": 27,
    "name": "Cargo Arrival Notice SEA Without Charges Format-1",
    "paper": "A4",
    "rtl": false,
    "theme": {
      "primary": "#0A2942",
      "accent": "#0A2942",
      "fill": "#F3F3F3",
      "panel": "#EBF0F4",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#0A2942",
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
      "invoiceNo": "BOMMAADXB0332",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "—"
        ]
      },
      "partyMid": {
        "title": "Consignee",
        "lines": [
          "—"
        ]
      },
      "partyNotify": {
        "title": "Notify1",
        "lines": [
          "—"
        ]
      },
      "fieldGrid": [
        {
          "k": "Job No",
          "v": "CBOMEXP230787 / 18-MAY-23"
        },
        {
          "k": "HBL No",
          "v": "BOMMAADXB0332 /"
        },
        {
          "k": "Port of Loading",
          "v": "CHENNAI (EX MADRAS)"
        },
        {
          "k": "Port of Discharge",
          "v": "DUBAI"
        },
        {
          "k": "Place of Delivery",
          "v": "DUBAI"
        },
        {
          "k": "ETD",
          "v": "18-MAY-23"
        },
        {
          "k": "ETA",
          "v": "31-MAY-23"
        }
      ],
      "tableHeaders": [
        "Container",
        "Type",
        "Goods Description",
        "No of Pkgs",
        "Volume",
        "Net Weight",
        "Gross Weight"
      ],
      "tableRows": [
        [
          "—",
          "—",
          "—",
          "45",
          "400.00",
          "—",
          "500.00"
        ]
      ],
      "termsLines": [
        "1. Kindly contact our Imports Department/Customer Service for Actual Arrival.",
        "2. D.O Counter Timings – 10.00am to 01.00pm & 02.00pm to 4.30pm.",
        "3. Cheque in favor of “KingFisher Logistic”.",
        "4. Partial Payments are not acceptable.",
        "5. Free Days FCL– 5 Days (NON-DG), 3 Days (DG or IMCO)/ LCL – 5 Days Free Days.",
        "6. After Free days storage charges applicable."
      ]
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "docTitle",
        "text": "CARGO ARRIVAL NOTICE",
        "align": "center",
        "band": true
      },
      {
        "type": "partyTriple"
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
        "type": "termsBank"
      },
      {
        "type": "colorfulFooter"
      }
    ]
  },
  {
    "code": "SEA_ARRIVAL_NOTICE_LCL_VIETNAM",
    "formatNumber": 28,
    "name": "SEA Arrival Notice LCL Vietnam",
    "paper": "A4",
    "rtl": false,
    "theme": {
      "primary": "#0A2942",
      "accent": "#0A2942",
      "fill": "#F3F3F3",
      "panel": "#EBF0F4",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#0A2942",
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
      "invoiceNo": "BOMMAADXB0332",
      "docSubtitle": "ARRIVAL NOTICE (THÔNG BÁO HÀNG ĐẾN) — LCL",
      "partyLeft": {
        "title": "Kính gửi / Messrs",
        "lines": [
          "Import Department"
        ]
      },
      "partyMid": {
        "title": "NGƯỜI GỬI / SHIPPER",
        "lines": [
          "—"
        ]
      },
      "fieldGrid": [
        {
          "k": "CẢNG XẾP / POL",
          "v": "CHENNAI (EX MADRAS)"
        },
        {
          "k": "CẢNG DỠ / POD",
          "v": "DUBAI"
        },
        {
          "k": "TÊN TÀU / VESSEL",
          "v": "/"
        },
        {
          "k": "NGÀY VỀ / ETA",
          "v": "31-MAY-2023"
        },
        {
          "k": "JOB",
          "v": "CBOMEXP230787 / 18-MAY-23"
        },
        {
          "k": "SỐ MBL / HBL",
          "v": "/ BOMMAADXB0332"
        }
      ],
      "tableHeaders": [
        "A PART OF CONT/SEAL",
        "PKG",
        "M3",
        "KGS",
        "COMM",
        "WAREHOUSE",
        "BILL'S STATUS"
      ],
      "tableRows": [
        [
          "—",
          "45",
          "400.000",
          "—",
          "AS PER BILL",
          "—",
          "CREATED"
        ]
      ],
      "osTableHeaders": [
        "NO.",
        "DESCRIPTION",
        "QTY",
        "UNIT",
        "CUR",
        "UNIT PRICE",
        "TAX",
        "TOTAL USD",
        "TOTAL VND"
      ],
      "osTableRows": [
        [
          "",
          "TOTAL :",
          "",
          "",
          "",
          "",
          "",
          "",
          ""
        ]
      ],
      "termsLines": [
        "1. Kindly contact our Imports Department/Customer Service for Actual Arrival.",
        "2. D.O Counter Timings – 10.00am to 01.00pm & 02.00pm to 4.30pm.",
        "3. Cheque in favor of “KingFisher Logistic”.",
        "4. Partial Payments are not acceptable.",
        "5. Free Days FCL– 5 Days (NON-DG), 3 Days (DG or IMCO)/ LCL – 5 Days Free Days.",
        "6. After Free days storage charges applicable."
      ]
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "docTitle",
        "text": "ARRIVAL NOTICE (THÔNG BÁO HÀNG ĐẾN) — LCL",
        "align": "center",
        "band": true
      },
      {
        "type": "partyTriple"
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
        "type": "outstandingTable"
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
    "code": "FG_CARGO_ARRIVAL_NOTICE_SEA_FORMAT_3",
    "formatNumber": 29,
    "name": "FG Cargo Arrival Notice SEA Format-3",
    "paper": "A4",
    "rtl": false,
    "theme": {
      "primary": "#0A2942",
      "accent": "#0A2942",
      "fill": "#F3F3F3",
      "panel": "#EBF0F4",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#0A2942",
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
      "invoiceNo": "BOMMAADXB0332",
      "billToLabel": "Client",
      "billToName": "DUBAI LOGISTICS",
      "billToAddress": "9 ABC BUILDING AL HUSSINE STREET DUBAI",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "—"
        ]
      },
      "partyMid": {
        "title": "Consignee",
        "lines": [
          "—"
        ]
      },
      "partyThird": {
        "title": "Agent",
        "lines": [
          "KingFisher Logistic",
          "Dubai, United Arab Emirates",
          "PHONE: +971 55 5355 286"
        ]
      },
      "fieldGrid": [
        {
          "k": "Job No.",
          "v": "CBOMEXP230787 / 18-MAY-23"
        },
        {
          "k": "Shipment No.",
          "v": "BOM/EXP/23/05/B/0719 / 17-MAY-23"
        },
        {
          "k": "HBL No.",
          "v": "BOMMAADXB0332 /"
        },
        {
          "k": "Port of Loading",
          "v": "CHENNAI (EX MADRAS)"
        },
        {
          "k": "Port of Discharge",
          "v": "DUBAI"
        },
        {
          "k": "Place of Delivery",
          "v": "DUBAI"
        },
        {
          "k": "ETD",
          "v": "18-MAY-23"
        },
        {
          "k": "ETA",
          "v": "31-MAY-23"
        }
      ],
      "tableHeaders": [
        "Container",
        "Type",
        "Goods Description",
        "No. of Pkgs",
        "Volume",
        "Gross Weight"
      ],
      "tableRows": [
        [
          "—",
          "—",
          "—",
          "45",
          "400.000",
          "—"
        ]
      ],
      "termsLines": [
        "1. Kindly contact our Imports Department/Customer Service for Actual Arrival.",
        "2. D.O Counter Timings – 10.00am to 01.00pm & 02.00pm to 4.30pm.",
        "3. Cheque in favor of “KingFisher Logistic”.",
        "4. Partial Payments are not acceptable.",
        "5. Free Days FCL– 5 Days (NON-DG), 3 Days (DG or IMCO)/ LCL – 5 Days Free Days.",
        "6. After Free days storage charges applicable."
      ]
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "docTitle",
        "text": "CARGO ARRIVAL NOTICE / HBL NO. - BOMMAADXB0332",
        "align": "center",
        "band": true
      },
      {
        "type": "twoColumn",
        "showBillTo": true
      },
      {
        "type": "partyTriple"
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
        "type": "termsBank"
      },
      {
        "type": "colorfulFooter"
      }
    ]
  },
  {
    "code": "CARGO_ARRIVAL_NOTICE_SEA_WITHOUT_CHARGES",
    "formatNumber": 30,
    "name": "Cargo Arrival Notice –Sea Without Charges",
    "paper": "A4",
    "rtl": false,
    "theme": {
      "primary": "#0A2942",
      "accent": "#0A2942",
      "fill": "#F3F3F3",
      "panel": "#EBF0F4",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#0A2942",
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
      "invoiceNo": "PLJEAMAA00001",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "AL NASER TRADING COMPANY LLC",
          "30 AL MAKTHOOM BUILDING NEAR MUBARAK CENTRE ROUND ABOUT",
          "AL NABHA SHARJAH SHARJAH UNITED ARAB EMIRATES"
        ]
      },
      "partyMid": {
        "title": "Consignee",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "NUNGAMBAKKAM CHENNAI TAMIL NADU 600084 INDIA",
          "EMAIL: ram@fresatechnologies.com"
        ]
      },
      "partyNotify": {
        "title": "Notify1",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "NUNGAMBAKKAM CHENNAI TAMIL NADU 600084 INDIA"
        ]
      },
      "fieldGrid": [
        {
          "k": "Job No",
          "v": "CSFI190012 / 25-JAN-19"
        },
        {
          "k": "MBL No",
          "v": "MBLCOPY87666666 / 16-JAN-19"
        },
        {
          "k": "HBL No",
          "v": "PLJEAMAA00001 / 16-JAN-19"
        },
        {
          "k": "Place of Receipt",
          "v": "DUBAI"
        },
        {
          "k": "Port of Loading",
          "v": "JEBEL ALI, UNITED ARAB EMIRATES"
        },
        {
          "k": "Port of Discharge",
          "v": "CHENNAI (EX MADRAS), INDIA"
        },
        {
          "k": "Port of Final Destination",
          "v": "CHENNAI (EX MADRAS), INDIA"
        },
        {
          "k": "Place of Delivery",
          "v": "CHENNAI"
        },
        {
          "k": "ETD",
          "v": "16-JAN-19"
        },
        {
          "k": "ETA",
          "v": "25-JAN-19"
        },
        {
          "k": "Carrier",
          "v": "CMA CGM"
        },
        {
          "k": "Vessel / Voyage",
          "v": "MSC MELINA / 987"
        },
        {
          "k": "Service Type",
          "v": "FCL/FCL"
        },
        {
          "k": "PP / CC",
          "v": "PREPAID"
        },
        {
          "k": "IGM No.",
          "v": "98778798 / 10-JAN-19"
        }
      ],
      "tableHeaders": [
        "Container",
        "Type",
        "Goods Description",
        "No. of Pkgs",
        "Volume",
        "Gross Weight"
      ],
      "tableRows": [
        [
          "TENU9876666",
          "20' DC",
          "STC: VALVE MATERIALS",
          "100",
          "20.00",
          "18,000.00"
        ]
      ],
      "termsLines": [
        "Note: Should you need our service to clear the cargoes on your behalf, please do not hesitate to contact the undermentioned.",
        "1. Kindly contact our Imports Department/Customer Service for Actual Arrival.",
        "2. D.O Counter Timings – 10.00am to 01.00pm & 02.00pm to 4.30pm.",
        "3. Cheque in favor of “KingFisher Logistic”.",
        "4. Partial Payments are not acceptable.",
        "5. Free Days FCL– 5 Days (NON-DG), 3 Days (DG or IMCO)/ LCL – 5 Days Free Days.",
        "6. After Free days storage charges applicable."
      ],
      "remarks": "CHENNAI ARRIVAL 1X20 — WITHOUT CHARGES"
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "docTitle",
        "text": "CARGO ARRIVAL NOTICE",
        "align": "center",
        "band": true
      },
      {
        "type": "partyTriple"
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
        "type": "termsBank"
      },
      {
        "type": "colorfulFooter"
      }
    ]
  },
  {
    "code": "ARRIVAL_NOTICE_REPORT_FORMAT_11",
    "formatNumber": 11,
    "name": "Arrival Notice Report Format-11",
    "paper": "A4",
    "rtl": false,
    "theme": {
      "primary": "#0A2942",
      "accent": "#0A2942",
      "fill": "#F3F3F3",
      "panel": "#EBF0F4",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#0A2942",
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
      "invoiceNo": "B/EXP/19/0254",
      "invoiceDate": "28-JAN-19",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
      },
      "partyMid": {
        "title": "Consignee",
        "lines": [
          "AL NASER TRADING COMPANY LLC",
          "30 AL MAKTHOOM BUILDING",
          "SHARJAH UAE"
        ]
      },
      "partyNotify": {
        "title": "Notify Party",
        "lines": [
          "AL NASER TRADING COMPANY LLC",
          "30 AL MAKTHOOM BUILDING",
          "SHARJAH UAE"
        ]
      },
      "fieldGrid": [
        {
          "k": "Job / Shipment",
          "v": "B/EXP/19/0254"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "Vessel / Voyage",
          "v": "EVERGREEN MARINE / 9887"
        },
        {
          "k": "Port of Loading",
          "v": "CHENNAI (EX MADRAS), INDIA"
        },
        {
          "k": "Port of Discharge",
          "v": "JEBEL ALI, UNITED ARAB EMIRATES"
        },
        {
          "k": "ETD",
          "v": "29-JAN-19"
        },
        {
          "k": "ETA",
          "v": "07-FEB-19"
        },
        {
          "k": "Layout",
          "v": "Arrival Notice Report Format-11"
        }
      ],
      "tableHeaders": [
        "Container No.",
        "Type",
        "Seal",
        "Pkgs",
        "Weight",
        "Volume"
      ],
      "tableRows": [
        [
          "ABCU9877666",
          "20' DC",
          "SL988888",
          "125",
          "18,000.000",
          "24.000"
        ]
      ],
      "termsLines": [
        "KingFisher layout preview — FRESA Gold report format sample.",
        "STC: VALVE MATERIALS FOR MACHINERY PARTS"
      ],
      "remarks": "Format-11"
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "formatBadge"
      },
      {
        "type": "docTitle",
        "text": "ARRIVAL NOTICE",
        "align": "center",
        "band": true
      },
      {
        "type": "partyTriple"
      },
      {
        "type": "fieldGrid",
        "cols": 2
      },
      {
        "type": "chargeTable",
        "headerColor": "primary"
      },
      {
        "type": "containerStrip"
      },
      {
        "type": "termsBank"
      },
      {
        "type": "signatureRow"
      },
      {
        "type": "colorfulFooter"
      }
    ]
  },
  {
    "code": "ARRIVAL_NOTICE_REPORT_FORMAT_12",
    "formatNumber": 12,
    "name": "Arrival Notice Report Format-12",
    "paper": "A4",
    "rtl": false,
    "theme": {
      "primary": "#0A2942",
      "accent": "#0A2942",
      "fill": "#F3F3F3",
      "panel": "#EBF0F4",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#0A2942",
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
      "invoiceNo": "B/EXP/19/0254",
      "invoiceDate": "28-JAN-19",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
      },
      "partyMid": {
        "title": "Consignee",
        "lines": [
          "AL NASER TRADING COMPANY LLC",
          "30 AL MAKTHOOM BUILDING",
          "SHARJAH UAE"
        ]
      },
      "partyNotify": {
        "title": "Notify Party",
        "lines": [
          "AL NASER TRADING COMPANY LLC",
          "30 AL MAKTHOOM BUILDING",
          "SHARJAH UAE"
        ]
      },
      "fieldGrid": [
        {
          "k": "Job / Shipment",
          "v": "B/EXP/19/0254"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "Vessel / Voyage",
          "v": "EVERGREEN MARINE / 9887"
        },
        {
          "k": "Port of Loading",
          "v": "CHENNAI (EX MADRAS), INDIA"
        },
        {
          "k": "Port of Discharge",
          "v": "JEBEL ALI, UNITED ARAB EMIRATES"
        },
        {
          "k": "ETD",
          "v": "29-JAN-19"
        },
        {
          "k": "ETA",
          "v": "07-FEB-19"
        },
        {
          "k": "Layout",
          "v": "Arrival Notice Report Format-12"
        }
      ],
      "tableHeaders": [
        "Container No.",
        "Type",
        "Seal",
        "Pkgs",
        "Weight",
        "Volume"
      ],
      "tableRows": [
        [
          "ABCU9877666",
          "20' DC",
          "SL988888",
          "125",
          "18,000.000",
          "24.000"
        ]
      ],
      "termsLines": [
        "KingFisher layout preview — FRESA Gold report format sample.",
        "STC: VALVE MATERIALS FOR MACHINERY PARTS"
      ],
      "remarks": "Format-12"
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "formatBadge"
      },
      {
        "type": "docTitle",
        "text": "ARRIVAL NOTICE",
        "align": "center",
        "band": true
      },
      {
        "type": "partyTriple"
      },
      {
        "type": "fieldGrid",
        "cols": 2
      },
      {
        "type": "chargeTable",
        "headerColor": "accent"
      },
      {
        "type": "containerStrip"
      },
      {
        "type": "termsBank"
      },
      {
        "type": "signatureRow"
      },
      {
        "type": "colorfulFooter"
      }
    ]
  },
  {
    "code": "ARRIVAL_NOTICE_REPORT_FORMAT_13",
    "formatNumber": 13,
    "name": "Arrival Notice Report Format-13",
    "paper": "A4",
    "rtl": false,
    "theme": {
      "primary": "#0A2942",
      "accent": "#0A2942",
      "fill": "#F3F3F3",
      "panel": "#EBF0F4",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#0A2942",
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
      "invoiceNo": "B/EXP/19/0254",
      "invoiceDate": "28-JAN-19",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
      },
      "partyMid": {
        "title": "Consignee",
        "lines": [
          "AL NASER TRADING COMPANY LLC",
          "30 AL MAKTHOOM BUILDING",
          "SHARJAH UAE"
        ]
      },
      "partyNotify": {
        "title": "Notify Party",
        "lines": [
          "AL NASER TRADING COMPANY LLC",
          "30 AL MAKTHOOM BUILDING",
          "SHARJAH UAE"
        ]
      },
      "fieldGrid": [
        {
          "k": "Job / Shipment",
          "v": "B/EXP/19/0254"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "Vessel / Voyage",
          "v": "EVERGREEN MARINE / 9887"
        },
        {
          "k": "Port of Loading",
          "v": "CHENNAI (EX MADRAS), INDIA"
        },
        {
          "k": "Port of Discharge",
          "v": "JEBEL ALI, UNITED ARAB EMIRATES"
        },
        {
          "k": "ETD",
          "v": "29-JAN-19"
        },
        {
          "k": "ETA",
          "v": "07-FEB-19"
        },
        {
          "k": "Layout",
          "v": "Arrival Notice Report Format-13"
        }
      ],
      "tableHeaders": [
        "Container No.",
        "Type",
        "Seal",
        "Pkgs",
        "Weight",
        "Volume"
      ],
      "tableRows": [
        [
          "ABCU9877666",
          "20' DC",
          "SL988888",
          "125",
          "18,000.000",
          "24.000"
        ]
      ],
      "termsLines": [
        "KingFisher layout preview — FRESA Gold report format sample.",
        "STC: VALVE MATERIALS FOR MACHINERY PARTS"
      ],
      "remarks": "Format-13"
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "formatBadge"
      },
      {
        "type": "docTitle",
        "text": "ARRIVAL NOTICE",
        "align": "center",
        "band": true
      },
      {
        "type": "partyTriple"
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
        "type": "termsBank"
      },
      {
        "type": "signatureRow"
      },
      {
        "type": "colorfulFooter"
      }
    ]
  },
  {
    "code": "ARRIVAL_NOTICE_REPORT_FORMAT_14",
    "formatNumber": 14,
    "name": "Arrival Notice Report Format-14",
    "paper": "A4",
    "rtl": false,
    "theme": {
      "primary": "#0A2942",
      "accent": "#0A2942",
      "fill": "#F3F3F3",
      "panel": "#EBF0F4",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#0A2942",
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
      "invoiceNo": "B/EXP/19/0254",
      "invoiceDate": "28-JAN-19",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
      },
      "partyMid": {
        "title": "Consignee",
        "lines": [
          "AL NASER TRADING COMPANY LLC",
          "30 AL MAKTHOOM BUILDING",
          "SHARJAH UAE"
        ]
      },
      "partyNotify": {
        "title": "Notify Party",
        "lines": [
          "AL NASER TRADING COMPANY LLC",
          "30 AL MAKTHOOM BUILDING",
          "SHARJAH UAE"
        ]
      },
      "fieldGrid": [
        {
          "k": "Job / Shipment",
          "v": "B/EXP/19/0254"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "Vessel / Voyage",
          "v": "EVERGREEN MARINE / 9887"
        },
        {
          "k": "Port of Loading",
          "v": "CHENNAI (EX MADRAS), INDIA"
        },
        {
          "k": "Port of Discharge",
          "v": "JEBEL ALI, UNITED ARAB EMIRATES"
        },
        {
          "k": "ETD",
          "v": "29-JAN-19"
        },
        {
          "k": "ETA",
          "v": "07-FEB-19"
        },
        {
          "k": "Layout",
          "v": "Arrival Notice Report Format-14"
        }
      ],
      "tableHeaders": [
        "Container No.",
        "Type",
        "Seal",
        "Pkgs",
        "Weight",
        "Volume"
      ],
      "tableRows": [
        [
          "ABCU9877666",
          "20' DC",
          "SL988888",
          "125",
          "18,000.000",
          "24.000"
        ]
      ],
      "termsLines": [
        "KingFisher layout preview — FRESA Gold report format sample.",
        "STC: VALVE MATERIALS FOR MACHINERY PARTS"
      ],
      "remarks": "Format-14"
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "formatBadge"
      },
      {
        "type": "docTitle",
        "text": "ARRIVAL NOTICE",
        "align": "center",
        "band": true
      },
      {
        "type": "partyTriple"
      },
      {
        "type": "fieldGrid",
        "cols": 2
      },
      {
        "type": "chargeTable",
        "headerColor": "orange"
      },
      {
        "type": "containerStrip"
      },
      {
        "type": "termsBank"
      },
      {
        "type": "signatureRow"
      },
      {
        "type": "colorfulFooter"
      }
    ]
  },
  {
    "code": "ARRIVAL_NOTICE_REPORT_FORMAT_15",
    "formatNumber": 15,
    "name": "Arrival Notice Report Format-15",
    "paper": "A4",
    "rtl": false,
    "theme": {
      "primary": "#0A2942",
      "accent": "#0A2942",
      "fill": "#F3F3F3",
      "panel": "#EBF0F4",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#0A2942",
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
      "invoiceNo": "B/EXP/19/0254",
      "invoiceDate": "28-JAN-19",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
      },
      "partyMid": {
        "title": "Consignee",
        "lines": [
          "AL NASER TRADING COMPANY LLC",
          "30 AL MAKTHOOM BUILDING",
          "SHARJAH UAE"
        ]
      },
      "partyNotify": {
        "title": "Notify Party",
        "lines": [
          "AL NASER TRADING COMPANY LLC",
          "30 AL MAKTHOOM BUILDING",
          "SHARJAH UAE"
        ]
      },
      "fieldGrid": [
        {
          "k": "Job / Shipment",
          "v": "B/EXP/19/0254"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "Vessel / Voyage",
          "v": "EVERGREEN MARINE / 9887"
        },
        {
          "k": "Port of Loading",
          "v": "CHENNAI (EX MADRAS), INDIA"
        },
        {
          "k": "Port of Discharge",
          "v": "JEBEL ALI, UNITED ARAB EMIRATES"
        },
        {
          "k": "ETD",
          "v": "29-JAN-19"
        },
        {
          "k": "ETA",
          "v": "07-FEB-19"
        },
        {
          "k": "Layout",
          "v": "Arrival Notice Report Format-15"
        }
      ],
      "tableHeaders": [
        "Container No.",
        "Type",
        "Seal",
        "Pkgs",
        "Weight",
        "Volume"
      ],
      "tableRows": [
        [
          "ABCU9877666",
          "20' DC",
          "SL988888",
          "125",
          "18,000.000",
          "24.000"
        ]
      ],
      "termsLines": [
        "KingFisher layout preview — FRESA Gold report format sample.",
        "STC: VALVE MATERIALS FOR MACHINERY PARTS"
      ],
      "remarks": "Format-15"
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "formatBadge"
      },
      {
        "type": "docTitle",
        "text": "ARRIVAL NOTICE",
        "align": "center",
        "band": true
      },
      {
        "type": "partyTriple"
      },
      {
        "type": "fieldGrid",
        "cols": 2
      },
      {
        "type": "chargeTable",
        "headerColor": "cyan"
      },
      {
        "type": "containerStrip"
      },
      {
        "type": "termsBank"
      },
      {
        "type": "signatureRow"
      },
      {
        "type": "colorfulFooter"
      }
    ]
  },
  {
    "code": "ARRIVAL_NOTICE_REPORT_FORMAT_16",
    "formatNumber": 16,
    "name": "Arrival Notice Report Format-16",
    "paper": "A4",
    "rtl": false,
    "theme": {
      "primary": "#0A2942",
      "accent": "#0A2942",
      "fill": "#F3F3F3",
      "panel": "#EBF0F4",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#0A2942",
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
      "invoiceNo": "B/EXP/19/0254",
      "invoiceDate": "28-JAN-19",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
      },
      "partyMid": {
        "title": "Consignee",
        "lines": [
          "AL NASER TRADING COMPANY LLC",
          "30 AL MAKTHOOM BUILDING",
          "SHARJAH UAE"
        ]
      },
      "partyNotify": {
        "title": "Notify Party",
        "lines": [
          "AL NASER TRADING COMPANY LLC",
          "30 AL MAKTHOOM BUILDING",
          "SHARJAH UAE"
        ]
      },
      "fieldGrid": [
        {
          "k": "Job / Shipment",
          "v": "B/EXP/19/0254"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "Vessel / Voyage",
          "v": "EVERGREEN MARINE / 9887"
        },
        {
          "k": "Port of Loading",
          "v": "CHENNAI (EX MADRAS), INDIA"
        },
        {
          "k": "Port of Discharge",
          "v": "JEBEL ALI, UNITED ARAB EMIRATES"
        },
        {
          "k": "ETD",
          "v": "29-JAN-19"
        },
        {
          "k": "ETA",
          "v": "07-FEB-19"
        },
        {
          "k": "Layout",
          "v": "Arrival Notice Report Format-16"
        }
      ],
      "tableHeaders": [
        "Container No.",
        "Type",
        "Seal",
        "Pkgs",
        "Weight",
        "Volume"
      ],
      "tableRows": [
        [
          "ABCU9877666",
          "20' DC",
          "SL988888",
          "125",
          "18,000.000",
          "24.000"
        ]
      ],
      "termsLines": [
        "KingFisher layout preview — FRESA Gold report format sample.",
        "STC: VALVE MATERIALS FOR MACHINERY PARTS"
      ],
      "remarks": "Format-16"
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "formatBadge"
      },
      {
        "type": "docTitle",
        "text": "ARRIVAL NOTICE",
        "align": "center",
        "band": true
      },
      {
        "type": "partyTriple"
      },
      {
        "type": "fieldGrid",
        "cols": 2
      },
      {
        "type": "chargeTable",
        "headerColor": "primary"
      },
      {
        "type": "containerStrip"
      },
      {
        "type": "termsBank"
      },
      {
        "type": "signatureRow"
      },
      {
        "type": "colorfulFooter"
      }
    ]
  },
  {
    "code": "ARRIVAL_NOTICE_REPORT_FORMAT_17",
    "formatNumber": 17,
    "name": "Arrival Notice Report Format-17",
    "paper": "A4",
    "rtl": false,
    "theme": {
      "primary": "#0A2942",
      "accent": "#0A2942",
      "fill": "#F3F3F3",
      "panel": "#EBF0F4",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#0A2942",
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
      "invoiceNo": "B/EXP/19/0254",
      "invoiceDate": "28-JAN-19",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
      },
      "partyMid": {
        "title": "Consignee",
        "lines": [
          "AL NASER TRADING COMPANY LLC",
          "30 AL MAKTHOOM BUILDING",
          "SHARJAH UAE"
        ]
      },
      "partyNotify": {
        "title": "Notify Party",
        "lines": [
          "AL NASER TRADING COMPANY LLC",
          "30 AL MAKTHOOM BUILDING",
          "SHARJAH UAE"
        ]
      },
      "fieldGrid": [
        {
          "k": "Job / Shipment",
          "v": "B/EXP/19/0254"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "Vessel / Voyage",
          "v": "EVERGREEN MARINE / 9887"
        },
        {
          "k": "Port of Loading",
          "v": "CHENNAI (EX MADRAS), INDIA"
        },
        {
          "k": "Port of Discharge",
          "v": "JEBEL ALI, UNITED ARAB EMIRATES"
        },
        {
          "k": "ETD",
          "v": "29-JAN-19"
        },
        {
          "k": "ETA",
          "v": "07-FEB-19"
        },
        {
          "k": "Layout",
          "v": "Arrival Notice Report Format-17"
        }
      ],
      "tableHeaders": [
        "Container No.",
        "Type",
        "Seal",
        "Pkgs",
        "Weight",
        "Volume"
      ],
      "tableRows": [
        [
          "ABCU9877666",
          "20' DC",
          "SL988888",
          "125",
          "18,000.000",
          "24.000"
        ]
      ],
      "termsLines": [
        "KingFisher layout preview — FRESA Gold report format sample.",
        "STC: VALVE MATERIALS FOR MACHINERY PARTS"
      ],
      "remarks": "Format-17"
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "formatBadge"
      },
      {
        "type": "docTitle",
        "text": "ARRIVAL NOTICE",
        "align": "center",
        "band": true
      },
      {
        "type": "partyTriple"
      },
      {
        "type": "fieldGrid",
        "cols": 2
      },
      {
        "type": "chargeTable",
        "headerColor": "accent"
      },
      {
        "type": "containerStrip"
      },
      {
        "type": "termsBank"
      },
      {
        "type": "signatureRow"
      },
      {
        "type": "colorfulFooter"
      }
    ]
  },
  {
    "code": "ARRIVAL_NOTICE_REPORT_FORMAT_18",
    "formatNumber": 18,
    "name": "Arrival Notice Report Format-18",
    "paper": "A4",
    "rtl": false,
    "theme": {
      "primary": "#0A2942",
      "accent": "#0A2942",
      "fill": "#F3F3F3",
      "panel": "#EBF0F4",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#0A2942",
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
      "invoiceNo": "B/EXP/19/0254",
      "invoiceDate": "28-JAN-19",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
      },
      "partyMid": {
        "title": "Consignee",
        "lines": [
          "AL NASER TRADING COMPANY LLC",
          "30 AL MAKTHOOM BUILDING",
          "SHARJAH UAE"
        ]
      },
      "partyNotify": {
        "title": "Notify Party",
        "lines": [
          "AL NASER TRADING COMPANY LLC",
          "30 AL MAKTHOOM BUILDING",
          "SHARJAH UAE"
        ]
      },
      "fieldGrid": [
        {
          "k": "Job / Shipment",
          "v": "B/EXP/19/0254"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "Vessel / Voyage",
          "v": "EVERGREEN MARINE / 9887"
        },
        {
          "k": "Port of Loading",
          "v": "CHENNAI (EX MADRAS), INDIA"
        },
        {
          "k": "Port of Discharge",
          "v": "JEBEL ALI, UNITED ARAB EMIRATES"
        },
        {
          "k": "ETD",
          "v": "29-JAN-19"
        },
        {
          "k": "ETA",
          "v": "07-FEB-19"
        },
        {
          "k": "Layout",
          "v": "Arrival Notice Report Format-18"
        }
      ],
      "tableHeaders": [
        "Container No.",
        "Type",
        "Seal",
        "Pkgs",
        "Weight",
        "Volume"
      ],
      "tableRows": [
        [
          "ABCU9877666",
          "20' DC",
          "SL988888",
          "125",
          "18,000.000",
          "24.000"
        ]
      ],
      "termsLines": [
        "KingFisher layout preview — FRESA Gold report format sample.",
        "STC: VALVE MATERIALS FOR MACHINERY PARTS"
      ],
      "remarks": "Format-18"
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "formatBadge"
      },
      {
        "type": "docTitle",
        "text": "ARRIVAL NOTICE",
        "align": "center",
        "band": true
      },
      {
        "type": "partyTriple"
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
        "type": "termsBank"
      },
      {
        "type": "signatureRow"
      },
      {
        "type": "colorfulFooter"
      }
    ]
  },
  {
    "code": "ARRIVAL_NOTICE_REPORT_FORMAT_19",
    "formatNumber": 19,
    "name": "Arrival Notice Report Format-19",
    "paper": "A4",
    "rtl": false,
    "theme": {
      "primary": "#0A2942",
      "accent": "#0A2942",
      "fill": "#F3F3F3",
      "panel": "#EBF0F4",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#0A2942",
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
      "invoiceNo": "B/EXP/19/0254",
      "invoiceDate": "28-JAN-19",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
      },
      "partyMid": {
        "title": "Consignee",
        "lines": [
          "AL NASER TRADING COMPANY LLC",
          "30 AL MAKTHOOM BUILDING",
          "SHARJAH UAE"
        ]
      },
      "partyNotify": {
        "title": "Notify Party",
        "lines": [
          "AL NASER TRADING COMPANY LLC",
          "30 AL MAKTHOOM BUILDING",
          "SHARJAH UAE"
        ]
      },
      "fieldGrid": [
        {
          "k": "Job / Shipment",
          "v": "B/EXP/19/0254"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "Vessel / Voyage",
          "v": "EVERGREEN MARINE / 9887"
        },
        {
          "k": "Port of Loading",
          "v": "CHENNAI (EX MADRAS), INDIA"
        },
        {
          "k": "Port of Discharge",
          "v": "JEBEL ALI, UNITED ARAB EMIRATES"
        },
        {
          "k": "ETD",
          "v": "29-JAN-19"
        },
        {
          "k": "ETA",
          "v": "07-FEB-19"
        },
        {
          "k": "Layout",
          "v": "Arrival Notice Report Format-19"
        }
      ],
      "tableHeaders": [
        "Container No.",
        "Type",
        "Seal",
        "Pkgs",
        "Weight",
        "Volume"
      ],
      "tableRows": [
        [
          "ABCU9877666",
          "20' DC",
          "SL988888",
          "125",
          "18,000.000",
          "24.000"
        ]
      ],
      "termsLines": [
        "KingFisher layout preview — FRESA Gold report format sample.",
        "STC: VALVE MATERIALS FOR MACHINERY PARTS"
      ],
      "remarks": "Format-19"
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "formatBadge"
      },
      {
        "type": "docTitle",
        "text": "ARRIVAL NOTICE",
        "align": "center",
        "band": true
      },
      {
        "type": "partyTriple"
      },
      {
        "type": "fieldGrid",
        "cols": 2
      },
      {
        "type": "chargeTable",
        "headerColor": "orange"
      },
      {
        "type": "containerStrip"
      },
      {
        "type": "termsBank"
      },
      {
        "type": "signatureRow"
      },
      {
        "type": "colorfulFooter"
      }
    ]
  },
  {
    "code": "ARRIVAL_NOTICE_REPORT_FORMAT_20",
    "formatNumber": 20,
    "name": "Arrival Notice Report Format-20",
    "paper": "A4",
    "rtl": false,
    "theme": {
      "primary": "#0A2942",
      "accent": "#0A2942",
      "fill": "#F3F3F3",
      "panel": "#EBF0F4",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#0A2942",
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
      "invoiceNo": "B/EXP/19/0254",
      "invoiceDate": "28-JAN-19",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
      },
      "partyMid": {
        "title": "Consignee",
        "lines": [
          "AL NASER TRADING COMPANY LLC",
          "30 AL MAKTHOOM BUILDING",
          "SHARJAH UAE"
        ]
      },
      "partyNotify": {
        "title": "Notify Party",
        "lines": [
          "AL NASER TRADING COMPANY LLC",
          "30 AL MAKTHOOM BUILDING",
          "SHARJAH UAE"
        ]
      },
      "fieldGrid": [
        {
          "k": "Job / Shipment",
          "v": "B/EXP/19/0254"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "Vessel / Voyage",
          "v": "EVERGREEN MARINE / 9887"
        },
        {
          "k": "Port of Loading",
          "v": "CHENNAI (EX MADRAS), INDIA"
        },
        {
          "k": "Port of Discharge",
          "v": "JEBEL ALI, UNITED ARAB EMIRATES"
        },
        {
          "k": "ETD",
          "v": "29-JAN-19"
        },
        {
          "k": "ETA",
          "v": "07-FEB-19"
        },
        {
          "k": "Layout",
          "v": "Arrival Notice Report Format-20"
        }
      ],
      "tableHeaders": [
        "Container No.",
        "Type",
        "Seal",
        "Pkgs",
        "Weight",
        "Volume"
      ],
      "tableRows": [
        [
          "ABCU9877666",
          "20' DC",
          "SL988888",
          "125",
          "18,000.000",
          "24.000"
        ]
      ],
      "termsLines": [
        "KingFisher layout preview — FRESA Gold report format sample.",
        "STC: VALVE MATERIALS FOR MACHINERY PARTS"
      ],
      "remarks": "Format-20"
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "formatBadge"
      },
      {
        "type": "docTitle",
        "text": "ARRIVAL NOTICE",
        "align": "center",
        "band": true
      },
      {
        "type": "partyTriple"
      },
      {
        "type": "fieldGrid",
        "cols": 2
      },
      {
        "type": "chargeTable",
        "headerColor": "cyan"
      },
      {
        "type": "containerStrip"
      },
      {
        "type": "termsBank"
      },
      {
        "type": "signatureRow"
      },
      {
        "type": "colorfulFooter"
      }
    ]
  },
  {
    "code": "ARRIVAL_NOTICE_REPORT_FORMAT_21",
    "formatNumber": 21,
    "name": "Arrival Notice Report Format-21",
    "paper": "A4",
    "rtl": false,
    "theme": {
      "primary": "#0A2942",
      "accent": "#0A2942",
      "fill": "#F3F3F3",
      "panel": "#EBF0F4",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#0A2942",
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
      "invoiceNo": "B/EXP/19/0254",
      "invoiceDate": "28-JAN-19",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
      },
      "partyMid": {
        "title": "Consignee",
        "lines": [
          "AL NASER TRADING COMPANY LLC",
          "30 AL MAKTHOOM BUILDING",
          "SHARJAH UAE"
        ]
      },
      "partyNotify": {
        "title": "Notify Party",
        "lines": [
          "AL NASER TRADING COMPANY LLC",
          "30 AL MAKTHOOM BUILDING",
          "SHARJAH UAE"
        ]
      },
      "fieldGrid": [
        {
          "k": "Job / Shipment",
          "v": "B/EXP/19/0254"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "Vessel / Voyage",
          "v": "EVERGREEN MARINE / 9887"
        },
        {
          "k": "Port of Loading",
          "v": "CHENNAI (EX MADRAS), INDIA"
        },
        {
          "k": "Port of Discharge",
          "v": "JEBEL ALI, UNITED ARAB EMIRATES"
        },
        {
          "k": "ETD",
          "v": "29-JAN-19"
        },
        {
          "k": "ETA",
          "v": "07-FEB-19"
        },
        {
          "k": "Layout",
          "v": "Arrival Notice Report Format-21"
        }
      ],
      "tableHeaders": [
        "Container No.",
        "Type",
        "Seal",
        "Pkgs",
        "Weight",
        "Volume"
      ],
      "tableRows": [
        [
          "ABCU9877666",
          "20' DC",
          "SL988888",
          "125",
          "18,000.000",
          "24.000"
        ]
      ],
      "termsLines": [
        "KingFisher layout preview — FRESA Gold report format sample.",
        "STC: VALVE MATERIALS FOR MACHINERY PARTS"
      ],
      "remarks": "Format-21"
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "formatBadge"
      },
      {
        "type": "docTitle",
        "text": "ARRIVAL NOTICE",
        "align": "center",
        "band": true
      },
      {
        "type": "partyTriple"
      },
      {
        "type": "fieldGrid",
        "cols": 2
      },
      {
        "type": "chargeTable",
        "headerColor": "primary"
      },
      {
        "type": "containerStrip"
      },
      {
        "type": "termsBank"
      },
      {
        "type": "signatureRow"
      },
      {
        "type": "colorfulFooter"
      }
    ]
  },
  {
    "code": "ARRIVAL_NOTICE_REPORT_FORMAT_22",
    "formatNumber": 22,
    "name": "Arrival Notice Report Format-22",
    "paper": "A4",
    "rtl": false,
    "theme": {
      "primary": "#0A2942",
      "accent": "#0A2942",
      "fill": "#F3F3F3",
      "panel": "#EBF0F4",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#0A2942",
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
      "invoiceNo": "B/EXP/19/0254",
      "invoiceDate": "28-JAN-19",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
      },
      "partyMid": {
        "title": "Consignee",
        "lines": [
          "AL NASER TRADING COMPANY LLC",
          "30 AL MAKTHOOM BUILDING",
          "SHARJAH UAE"
        ]
      },
      "partyNotify": {
        "title": "Notify Party",
        "lines": [
          "AL NASER TRADING COMPANY LLC",
          "30 AL MAKTHOOM BUILDING",
          "SHARJAH UAE"
        ]
      },
      "fieldGrid": [
        {
          "k": "Job / Shipment",
          "v": "B/EXP/19/0254"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "Vessel / Voyage",
          "v": "EVERGREEN MARINE / 9887"
        },
        {
          "k": "Port of Loading",
          "v": "CHENNAI (EX MADRAS), INDIA"
        },
        {
          "k": "Port of Discharge",
          "v": "JEBEL ALI, UNITED ARAB EMIRATES"
        },
        {
          "k": "ETD",
          "v": "29-JAN-19"
        },
        {
          "k": "ETA",
          "v": "07-FEB-19"
        },
        {
          "k": "Layout",
          "v": "Arrival Notice Report Format-22"
        }
      ],
      "tableHeaders": [
        "Container No.",
        "Type",
        "Seal",
        "Pkgs",
        "Weight",
        "Volume"
      ],
      "tableRows": [
        [
          "ABCU9877666",
          "20' DC",
          "SL988888",
          "125",
          "18,000.000",
          "24.000"
        ]
      ],
      "termsLines": [
        "KingFisher layout preview — FRESA Gold report format sample.",
        "STC: VALVE MATERIALS FOR MACHINERY PARTS"
      ],
      "remarks": "Format-22"
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "formatBadge"
      },
      {
        "type": "docTitle",
        "text": "ARRIVAL NOTICE",
        "align": "center",
        "band": true
      },
      {
        "type": "partyTriple"
      },
      {
        "type": "fieldGrid",
        "cols": 2
      },
      {
        "type": "chargeTable",
        "headerColor": "accent"
      },
      {
        "type": "containerStrip"
      },
      {
        "type": "termsBank"
      },
      {
        "type": "signatureRow"
      },
      {
        "type": "colorfulFooter"
      }
    ]
  },
  {
    "code": "ARRIVAL_NOTICE_REPORT_FORMAT_23",
    "formatNumber": 23,
    "name": "Arrival Notice Report Format-23",
    "paper": "A4",
    "rtl": false,
    "theme": {
      "primary": "#0A2942",
      "accent": "#0A2942",
      "fill": "#F3F3F3",
      "panel": "#EBF0F4",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#0A2942",
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
      "invoiceNo": "B/EXP/19/0254",
      "invoiceDate": "28-JAN-19",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
      },
      "partyMid": {
        "title": "Consignee",
        "lines": [
          "AL NASER TRADING COMPANY LLC",
          "30 AL MAKTHOOM BUILDING",
          "SHARJAH UAE"
        ]
      },
      "partyNotify": {
        "title": "Notify Party",
        "lines": [
          "AL NASER TRADING COMPANY LLC",
          "30 AL MAKTHOOM BUILDING",
          "SHARJAH UAE"
        ]
      },
      "fieldGrid": [
        {
          "k": "Job / Shipment",
          "v": "B/EXP/19/0254"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "Vessel / Voyage",
          "v": "EVERGREEN MARINE / 9887"
        },
        {
          "k": "Port of Loading",
          "v": "CHENNAI (EX MADRAS), INDIA"
        },
        {
          "k": "Port of Discharge",
          "v": "JEBEL ALI, UNITED ARAB EMIRATES"
        },
        {
          "k": "ETD",
          "v": "29-JAN-19"
        },
        {
          "k": "ETA",
          "v": "07-FEB-19"
        },
        {
          "k": "Layout",
          "v": "Arrival Notice Report Format-23"
        }
      ],
      "tableHeaders": [
        "Container No.",
        "Type",
        "Seal",
        "Pkgs",
        "Weight",
        "Volume"
      ],
      "tableRows": [
        [
          "ABCU9877666",
          "20' DC",
          "SL988888",
          "125",
          "18,000.000",
          "24.000"
        ]
      ],
      "termsLines": [
        "KingFisher layout preview — FRESA Gold report format sample.",
        "STC: VALVE MATERIALS FOR MACHINERY PARTS"
      ],
      "remarks": "Format-23"
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "formatBadge"
      },
      {
        "type": "docTitle",
        "text": "ARRIVAL NOTICE",
        "align": "center",
        "band": true
      },
      {
        "type": "partyTriple"
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
        "type": "termsBank"
      },
      {
        "type": "signatureRow"
      },
      {
        "type": "colorfulFooter"
      }
    ]
  },
  {
    "code": "ARRIVAL_NOTICE_REPORT_FORMAT_24",
    "formatNumber": 24,
    "name": "Arrival Notice Report Format-24",
    "paper": "A4",
    "rtl": false,
    "theme": {
      "primary": "#0A2942",
      "accent": "#0A2942",
      "fill": "#F3F3F3",
      "panel": "#EBF0F4",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#0A2942",
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
      "invoiceNo": "B/EXP/19/0254",
      "invoiceDate": "28-JAN-19",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
      },
      "partyMid": {
        "title": "Consignee",
        "lines": [
          "AL NASER TRADING COMPANY LLC",
          "30 AL MAKTHOOM BUILDING",
          "SHARJAH UAE"
        ]
      },
      "partyNotify": {
        "title": "Notify Party",
        "lines": [
          "AL NASER TRADING COMPANY LLC",
          "30 AL MAKTHOOM BUILDING",
          "SHARJAH UAE"
        ]
      },
      "fieldGrid": [
        {
          "k": "Job / Shipment",
          "v": "B/EXP/19/0254"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "Vessel / Voyage",
          "v": "EVERGREEN MARINE / 9887"
        },
        {
          "k": "Port of Loading",
          "v": "CHENNAI (EX MADRAS), INDIA"
        },
        {
          "k": "Port of Discharge",
          "v": "JEBEL ALI, UNITED ARAB EMIRATES"
        },
        {
          "k": "ETD",
          "v": "29-JAN-19"
        },
        {
          "k": "ETA",
          "v": "07-FEB-19"
        },
        {
          "k": "Layout",
          "v": "Arrival Notice Report Format-24"
        }
      ],
      "tableHeaders": [
        "Container No.",
        "Type",
        "Seal",
        "Pkgs",
        "Weight",
        "Volume"
      ],
      "tableRows": [
        [
          "ABCU9877666",
          "20' DC",
          "SL988888",
          "125",
          "18,000.000",
          "24.000"
        ]
      ],
      "termsLines": [
        "KingFisher layout preview — FRESA Gold report format sample.",
        "STC: VALVE MATERIALS FOR MACHINERY PARTS"
      ],
      "remarks": "Format-24"
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "formatBadge"
      },
      {
        "type": "docTitle",
        "text": "ARRIVAL NOTICE",
        "align": "center",
        "band": true
      },
      {
        "type": "partyTriple"
      },
      {
        "type": "fieldGrid",
        "cols": 2
      },
      {
        "type": "chargeTable",
        "headerColor": "orange"
      },
      {
        "type": "containerStrip"
      },
      {
        "type": "termsBank"
      },
      {
        "type": "signatureRow"
      },
      {
        "type": "colorfulFooter"
      }
    ]
  },
  {
    "code": "ARRIVAL_NOTICE_REPORT_FORMAT_25",
    "formatNumber": 25,
    "name": "Arrival Notice Report Format-25",
    "paper": "A4",
    "rtl": false,
    "theme": {
      "primary": "#0A2942",
      "accent": "#0A2942",
      "fill": "#F3F3F3",
      "panel": "#EBF0F4",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#0A2942",
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
      "invoiceNo": "B/EXP/19/0254",
      "invoiceDate": "28-JAN-19",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
      },
      "partyMid": {
        "title": "Consignee",
        "lines": [
          "AL NASER TRADING COMPANY LLC",
          "30 AL MAKTHOOM BUILDING",
          "SHARJAH UAE"
        ]
      },
      "partyNotify": {
        "title": "Notify Party",
        "lines": [
          "AL NASER TRADING COMPANY LLC",
          "30 AL MAKTHOOM BUILDING",
          "SHARJAH UAE"
        ]
      },
      "fieldGrid": [
        {
          "k": "Job / Shipment",
          "v": "B/EXP/19/0254"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "Vessel / Voyage",
          "v": "EVERGREEN MARINE / 9887"
        },
        {
          "k": "Port of Loading",
          "v": "CHENNAI (EX MADRAS), INDIA"
        },
        {
          "k": "Port of Discharge",
          "v": "JEBEL ALI, UNITED ARAB EMIRATES"
        },
        {
          "k": "ETD",
          "v": "29-JAN-19"
        },
        {
          "k": "ETA",
          "v": "07-FEB-19"
        },
        {
          "k": "Layout",
          "v": "Arrival Notice Report Format-25"
        }
      ],
      "tableHeaders": [
        "Container No.",
        "Type",
        "Seal",
        "Pkgs",
        "Weight",
        "Volume"
      ],
      "tableRows": [
        [
          "ABCU9877666",
          "20' DC",
          "SL988888",
          "125",
          "18,000.000",
          "24.000"
        ]
      ],
      "termsLines": [
        "KingFisher layout preview — FRESA Gold report format sample.",
        "STC: VALVE MATERIALS FOR MACHINERY PARTS"
      ],
      "remarks": "Format-25"
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "formatBadge"
      },
      {
        "type": "docTitle",
        "text": "ARRIVAL NOTICE",
        "align": "center",
        "band": true
      },
      {
        "type": "partyTriple"
      },
      {
        "type": "fieldGrid",
        "cols": 2
      },
      {
        "type": "chargeTable",
        "headerColor": "cyan"
      },
      {
        "type": "containerStrip"
      },
      {
        "type": "termsBank"
      },
      {
        "type": "signatureRow"
      },
      {
        "type": "colorfulFooter"
      }
    ]
  },
  {
    "code": "ARRIVAL_NOTICE_REPORT_FORMAT_26",
    "formatNumber": 26,
    "name": "Arrival Notice Report Format-26",
    "paper": "A4",
    "rtl": false,
    "theme": {
      "primary": "#0A2942",
      "accent": "#0A2942",
      "fill": "#F3F3F3",
      "panel": "#EBF0F4",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#0A2942",
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
      "invoiceNo": "B/EXP/19/0254",
      "invoiceDate": "28-JAN-19",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
      },
      "partyMid": {
        "title": "Consignee",
        "lines": [
          "AL NASER TRADING COMPANY LLC",
          "30 AL MAKTHOOM BUILDING",
          "SHARJAH UAE"
        ]
      },
      "partyNotify": {
        "title": "Notify Party",
        "lines": [
          "AL NASER TRADING COMPANY LLC",
          "30 AL MAKTHOOM BUILDING",
          "SHARJAH UAE"
        ]
      },
      "fieldGrid": [
        {
          "k": "Job / Shipment",
          "v": "B/EXP/19/0254"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "Vessel / Voyage",
          "v": "EVERGREEN MARINE / 9887"
        },
        {
          "k": "Port of Loading",
          "v": "CHENNAI (EX MADRAS), INDIA"
        },
        {
          "k": "Port of Discharge",
          "v": "JEBEL ALI, UNITED ARAB EMIRATES"
        },
        {
          "k": "ETD",
          "v": "29-JAN-19"
        },
        {
          "k": "ETA",
          "v": "07-FEB-19"
        },
        {
          "k": "Layout",
          "v": "Arrival Notice Report Format-26"
        }
      ],
      "tableHeaders": [
        "Container No.",
        "Type",
        "Seal",
        "Pkgs",
        "Weight",
        "Volume"
      ],
      "tableRows": [
        [
          "ABCU9877666",
          "20' DC",
          "SL988888",
          "125",
          "18,000.000",
          "24.000"
        ]
      ],
      "termsLines": [
        "KingFisher layout preview — FRESA Gold report format sample.",
        "STC: VALVE MATERIALS FOR MACHINERY PARTS"
      ],
      "remarks": "Format-26"
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "formatBadge"
      },
      {
        "type": "docTitle",
        "text": "ARRIVAL NOTICE",
        "align": "center",
        "band": true
      },
      {
        "type": "partyTriple"
      },
      {
        "type": "fieldGrid",
        "cols": 2
      },
      {
        "type": "chargeTable",
        "headerColor": "primary"
      },
      {
        "type": "containerStrip"
      },
      {
        "type": "termsBank"
      },
      {
        "type": "signatureRow"
      },
      {
        "type": "colorfulFooter"
      }
    ]
  },
  {
    "code": "ARRIVAL_NOTICE_REPORT_FORMAT_27",
    "formatNumber": 27,
    "name": "Arrival Notice Report Format-27",
    "paper": "A4",
    "rtl": false,
    "theme": {
      "primary": "#0A2942",
      "accent": "#0A2942",
      "fill": "#F3F3F3",
      "panel": "#EBF0F4",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#0A2942",
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
      "invoiceNo": "B/EXP/19/0254",
      "invoiceDate": "28-JAN-19",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
      },
      "partyMid": {
        "title": "Consignee",
        "lines": [
          "AL NASER TRADING COMPANY LLC",
          "30 AL MAKTHOOM BUILDING",
          "SHARJAH UAE"
        ]
      },
      "partyNotify": {
        "title": "Notify Party",
        "lines": [
          "AL NASER TRADING COMPANY LLC",
          "30 AL MAKTHOOM BUILDING",
          "SHARJAH UAE"
        ]
      },
      "fieldGrid": [
        {
          "k": "Job / Shipment",
          "v": "B/EXP/19/0254"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "Vessel / Voyage",
          "v": "EVERGREEN MARINE / 9887"
        },
        {
          "k": "Port of Loading",
          "v": "CHENNAI (EX MADRAS), INDIA"
        },
        {
          "k": "Port of Discharge",
          "v": "JEBEL ALI, UNITED ARAB EMIRATES"
        },
        {
          "k": "ETD",
          "v": "29-JAN-19"
        },
        {
          "k": "ETA",
          "v": "07-FEB-19"
        },
        {
          "k": "Layout",
          "v": "Arrival Notice Report Format-27"
        }
      ],
      "tableHeaders": [
        "Container No.",
        "Type",
        "Seal",
        "Pkgs",
        "Weight",
        "Volume"
      ],
      "tableRows": [
        [
          "ABCU9877666",
          "20' DC",
          "SL988888",
          "125",
          "18,000.000",
          "24.000"
        ]
      ],
      "termsLines": [
        "KingFisher layout preview — FRESA Gold report format sample.",
        "STC: VALVE MATERIALS FOR MACHINERY PARTS"
      ],
      "remarks": "Format-27"
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "formatBadge"
      },
      {
        "type": "docTitle",
        "text": "ARRIVAL NOTICE",
        "align": "center",
        "band": true
      },
      {
        "type": "partyTriple"
      },
      {
        "type": "fieldGrid",
        "cols": 2
      },
      {
        "type": "chargeTable",
        "headerColor": "accent"
      },
      {
        "type": "containerStrip"
      },
      {
        "type": "termsBank"
      },
      {
        "type": "signatureRow"
      },
      {
        "type": "colorfulFooter"
      }
    ]
  },
  {
    "code": "ARRIVAL_NOTICE_REPORT_FORMAT_28",
    "formatNumber": 28,
    "name": "Arrival Notice Report Format-28",
    "paper": "A4",
    "rtl": false,
    "theme": {
      "primary": "#0A2942",
      "accent": "#0A2942",
      "fill": "#F3F3F3",
      "panel": "#EBF0F4",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#0A2942",
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
      "invoiceNo": "B/EXP/19/0254",
      "invoiceDate": "28-JAN-19",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
      },
      "partyMid": {
        "title": "Consignee",
        "lines": [
          "AL NASER TRADING COMPANY LLC",
          "30 AL MAKTHOOM BUILDING",
          "SHARJAH UAE"
        ]
      },
      "partyNotify": {
        "title": "Notify Party",
        "lines": [
          "AL NASER TRADING COMPANY LLC",
          "30 AL MAKTHOOM BUILDING",
          "SHARJAH UAE"
        ]
      },
      "fieldGrid": [
        {
          "k": "Job / Shipment",
          "v": "B/EXP/19/0254"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "Vessel / Voyage",
          "v": "EVERGREEN MARINE / 9887"
        },
        {
          "k": "Port of Loading",
          "v": "CHENNAI (EX MADRAS), INDIA"
        },
        {
          "k": "Port of Discharge",
          "v": "JEBEL ALI, UNITED ARAB EMIRATES"
        },
        {
          "k": "ETD",
          "v": "29-JAN-19"
        },
        {
          "k": "ETA",
          "v": "07-FEB-19"
        },
        {
          "k": "Layout",
          "v": "Arrival Notice Report Format-28"
        }
      ],
      "tableHeaders": [
        "Container No.",
        "Type",
        "Seal",
        "Pkgs",
        "Weight",
        "Volume"
      ],
      "tableRows": [
        [
          "ABCU9877666",
          "20' DC",
          "SL988888",
          "125",
          "18,000.000",
          "24.000"
        ]
      ],
      "termsLines": [
        "KingFisher layout preview — FRESA Gold report format sample.",
        "STC: VALVE MATERIALS FOR MACHINERY PARTS"
      ],
      "remarks": "Format-28"
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "formatBadge"
      },
      {
        "type": "docTitle",
        "text": "ARRIVAL NOTICE",
        "align": "center",
        "band": true
      },
      {
        "type": "partyTriple"
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
        "type": "termsBank"
      },
      {
        "type": "signatureRow"
      },
      {
        "type": "colorfulFooter"
      }
    ]
  },
  {
    "code": "ARRIVAL_NOTICE_REPORT_FORMAT_29",
    "formatNumber": 29,
    "name": "Arrival Notice Report Format-29",
    "paper": "A4",
    "rtl": false,
    "theme": {
      "primary": "#0A2942",
      "accent": "#0A2942",
      "fill": "#F3F3F3",
      "panel": "#EBF0F4",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#0A2942",
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
      "invoiceNo": "B/EXP/19/0254",
      "invoiceDate": "28-JAN-19",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
      },
      "partyMid": {
        "title": "Consignee",
        "lines": [
          "AL NASER TRADING COMPANY LLC",
          "30 AL MAKTHOOM BUILDING",
          "SHARJAH UAE"
        ]
      },
      "partyNotify": {
        "title": "Notify Party",
        "lines": [
          "AL NASER TRADING COMPANY LLC",
          "30 AL MAKTHOOM BUILDING",
          "SHARJAH UAE"
        ]
      },
      "fieldGrid": [
        {
          "k": "Job / Shipment",
          "v": "B/EXP/19/0254"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "Vessel / Voyage",
          "v": "EVERGREEN MARINE / 9887"
        },
        {
          "k": "Port of Loading",
          "v": "CHENNAI (EX MADRAS), INDIA"
        },
        {
          "k": "Port of Discharge",
          "v": "JEBEL ALI, UNITED ARAB EMIRATES"
        },
        {
          "k": "ETD",
          "v": "29-JAN-19"
        },
        {
          "k": "ETA",
          "v": "07-FEB-19"
        },
        {
          "k": "Layout",
          "v": "Arrival Notice Report Format-29"
        }
      ],
      "tableHeaders": [
        "Container No.",
        "Type",
        "Seal",
        "Pkgs",
        "Weight",
        "Volume"
      ],
      "tableRows": [
        [
          "ABCU9877666",
          "20' DC",
          "SL988888",
          "125",
          "18,000.000",
          "24.000"
        ]
      ],
      "termsLines": [
        "KingFisher layout preview — FRESA Gold report format sample.",
        "STC: VALVE MATERIALS FOR MACHINERY PARTS"
      ],
      "remarks": "Format-29"
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "formatBadge"
      },
      {
        "type": "docTitle",
        "text": "ARRIVAL NOTICE",
        "align": "center",
        "band": true
      },
      {
        "type": "partyTriple"
      },
      {
        "type": "fieldGrid",
        "cols": 2
      },
      {
        "type": "chargeTable",
        "headerColor": "orange"
      },
      {
        "type": "containerStrip"
      },
      {
        "type": "termsBank"
      },
      {
        "type": "signatureRow"
      },
      {
        "type": "colorfulFooter"
      }
    ]
  },
  {
    "code": "ARRIVAL_NOTICE_REPORT_FORMAT_30",
    "formatNumber": 30,
    "name": "Arrival Notice Report Format-30",
    "paper": "A4",
    "rtl": false,
    "theme": {
      "primary": "#0A2942",
      "accent": "#0A2942",
      "fill": "#F3F3F3",
      "panel": "#EBF0F4",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#0A2942",
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
      "invoiceNo": "B/EXP/19/0254",
      "invoiceDate": "28-JAN-19",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
      },
      "partyMid": {
        "title": "Consignee",
        "lines": [
          "AL NASER TRADING COMPANY LLC",
          "30 AL MAKTHOOM BUILDING",
          "SHARJAH UAE"
        ]
      },
      "partyNotify": {
        "title": "Notify Party",
        "lines": [
          "AL NASER TRADING COMPANY LLC",
          "30 AL MAKTHOOM BUILDING",
          "SHARJAH UAE"
        ]
      },
      "fieldGrid": [
        {
          "k": "Job / Shipment",
          "v": "B/EXP/19/0254"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "Vessel / Voyage",
          "v": "EVERGREEN MARINE / 9887"
        },
        {
          "k": "Port of Loading",
          "v": "CHENNAI (EX MADRAS), INDIA"
        },
        {
          "k": "Port of Discharge",
          "v": "JEBEL ALI, UNITED ARAB EMIRATES"
        },
        {
          "k": "ETD",
          "v": "29-JAN-19"
        },
        {
          "k": "ETA",
          "v": "07-FEB-19"
        },
        {
          "k": "Layout",
          "v": "Arrival Notice Report Format-30"
        }
      ],
      "tableHeaders": [
        "Container No.",
        "Type",
        "Seal",
        "Pkgs",
        "Weight",
        "Volume"
      ],
      "tableRows": [
        [
          "ABCU9877666",
          "20' DC",
          "SL988888",
          "125",
          "18,000.000",
          "24.000"
        ]
      ],
      "termsLines": [
        "KingFisher layout preview — FRESA Gold report format sample.",
        "STC: VALVE MATERIALS FOR MACHINERY PARTS"
      ],
      "remarks": "Format-30"
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "formatBadge"
      },
      {
        "type": "docTitle",
        "text": "ARRIVAL NOTICE",
        "align": "center",
        "band": true
      },
      {
        "type": "partyTriple"
      },
      {
        "type": "fieldGrid",
        "cols": 2
      },
      {
        "type": "chargeTable",
        "headerColor": "cyan"
      },
      {
        "type": "containerStrip"
      },
      {
        "type": "termsBank"
      },
      {
        "type": "signatureRow"
      },
      {
        "type": "colorfulFooter"
      }
    ]
  },
  {
    "code": "ARRIVAL_NOTICE_REPORT_FORMAT_31",
    "formatNumber": 31,
    "name": "Arrival Notice Report Format-31",
    "paper": "A4",
    "rtl": false,
    "theme": {
      "primary": "#0A2942",
      "accent": "#0A2942",
      "fill": "#F3F3F3",
      "panel": "#EBF0F4",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#0A2942",
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
      "invoiceNo": "B/EXP/19/0254",
      "invoiceDate": "28-JAN-19",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
      },
      "partyMid": {
        "title": "Consignee",
        "lines": [
          "AL NASER TRADING COMPANY LLC",
          "30 AL MAKTHOOM BUILDING",
          "SHARJAH UAE"
        ]
      },
      "partyNotify": {
        "title": "Notify Party",
        "lines": [
          "AL NASER TRADING COMPANY LLC",
          "30 AL MAKTHOOM BUILDING",
          "SHARJAH UAE"
        ]
      },
      "fieldGrid": [
        {
          "k": "Job / Shipment",
          "v": "B/EXP/19/0254"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "Vessel / Voyage",
          "v": "EVERGREEN MARINE / 9887"
        },
        {
          "k": "Port of Loading",
          "v": "CHENNAI (EX MADRAS), INDIA"
        },
        {
          "k": "Port of Discharge",
          "v": "JEBEL ALI, UNITED ARAB EMIRATES"
        },
        {
          "k": "ETD",
          "v": "29-JAN-19"
        },
        {
          "k": "ETA",
          "v": "07-FEB-19"
        },
        {
          "k": "Layout",
          "v": "Arrival Notice Report Format-31"
        }
      ],
      "tableHeaders": [
        "Container No.",
        "Type",
        "Seal",
        "Pkgs",
        "Weight",
        "Volume"
      ],
      "tableRows": [
        [
          "ABCU9877666",
          "20' DC",
          "SL988888",
          "125",
          "18,000.000",
          "24.000"
        ]
      ],
      "termsLines": [
        "KingFisher layout preview — FRESA Gold report format sample.",
        "STC: VALVE MATERIALS FOR MACHINERY PARTS"
      ],
      "remarks": "Format-31"
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "formatBadge"
      },
      {
        "type": "docTitle",
        "text": "ARRIVAL NOTICE",
        "align": "center",
        "band": true
      },
      {
        "type": "partyTriple"
      },
      {
        "type": "fieldGrid",
        "cols": 2
      },
      {
        "type": "chargeTable",
        "headerColor": "primary"
      },
      {
        "type": "containerStrip"
      },
      {
        "type": "termsBank"
      },
      {
        "type": "signatureRow"
      },
      {
        "type": "colorfulFooter"
      }
    ]
  },
  {
    "code": "ARRIVAL_NOTICE_REPORT_FORMAT_32",
    "formatNumber": 32,
    "name": "Arrival Notice Report Format-32",
    "paper": "A4",
    "rtl": false,
    "theme": {
      "primary": "#0A2942",
      "accent": "#0A2942",
      "fill": "#F3F3F3",
      "panel": "#EBF0F4",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#0A2942",
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
      "invoiceNo": "B/EXP/19/0254",
      "invoiceDate": "28-JAN-19",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
      },
      "partyMid": {
        "title": "Consignee",
        "lines": [
          "AL NASER TRADING COMPANY LLC",
          "30 AL MAKTHOOM BUILDING",
          "SHARJAH UAE"
        ]
      },
      "partyNotify": {
        "title": "Notify Party",
        "lines": [
          "AL NASER TRADING COMPANY LLC",
          "30 AL MAKTHOOM BUILDING",
          "SHARJAH UAE"
        ]
      },
      "fieldGrid": [
        {
          "k": "Job / Shipment",
          "v": "B/EXP/19/0254"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "Vessel / Voyage",
          "v": "EVERGREEN MARINE / 9887"
        },
        {
          "k": "Port of Loading",
          "v": "CHENNAI (EX MADRAS), INDIA"
        },
        {
          "k": "Port of Discharge",
          "v": "JEBEL ALI, UNITED ARAB EMIRATES"
        },
        {
          "k": "ETD",
          "v": "29-JAN-19"
        },
        {
          "k": "ETA",
          "v": "07-FEB-19"
        },
        {
          "k": "Layout",
          "v": "Arrival Notice Report Format-32"
        }
      ],
      "tableHeaders": [
        "Container No.",
        "Type",
        "Seal",
        "Pkgs",
        "Weight",
        "Volume"
      ],
      "tableRows": [
        [
          "ABCU9877666",
          "20' DC",
          "SL988888",
          "125",
          "18,000.000",
          "24.000"
        ]
      ],
      "termsLines": [
        "KingFisher layout preview — FRESA Gold report format sample.",
        "STC: VALVE MATERIALS FOR MACHINERY PARTS"
      ],
      "remarks": "Format-32"
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "formatBadge"
      },
      {
        "type": "docTitle",
        "text": "ARRIVAL NOTICE",
        "align": "center",
        "band": true
      },
      {
        "type": "partyTriple"
      },
      {
        "type": "fieldGrid",
        "cols": 2
      },
      {
        "type": "chargeTable",
        "headerColor": "accent"
      },
      {
        "type": "containerStrip"
      },
      {
        "type": "termsBank"
      },
      {
        "type": "signatureRow"
      },
      {
        "type": "colorfulFooter"
      }
    ]
  },
  {
    "code": "ARRIVAL_NOTICE_REPORT_FORMAT_33",
    "formatNumber": 33,
    "name": "Arrival Notice Report Format-33",
    "paper": "A4",
    "rtl": false,
    "theme": {
      "primary": "#0A2942",
      "accent": "#0A2942",
      "fill": "#F3F3F3",
      "panel": "#EBF0F4",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#0A2942",
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
      "invoiceNo": "B/EXP/19/0254",
      "invoiceDate": "28-JAN-19",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
      },
      "partyMid": {
        "title": "Consignee",
        "lines": [
          "AL NASER TRADING COMPANY LLC",
          "30 AL MAKTHOOM BUILDING",
          "SHARJAH UAE"
        ]
      },
      "partyNotify": {
        "title": "Notify Party",
        "lines": [
          "AL NASER TRADING COMPANY LLC",
          "30 AL MAKTHOOM BUILDING",
          "SHARJAH UAE"
        ]
      },
      "fieldGrid": [
        {
          "k": "Job / Shipment",
          "v": "B/EXP/19/0254"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "Vessel / Voyage",
          "v": "EVERGREEN MARINE / 9887"
        },
        {
          "k": "Port of Loading",
          "v": "CHENNAI (EX MADRAS), INDIA"
        },
        {
          "k": "Port of Discharge",
          "v": "JEBEL ALI, UNITED ARAB EMIRATES"
        },
        {
          "k": "ETD",
          "v": "29-JAN-19"
        },
        {
          "k": "ETA",
          "v": "07-FEB-19"
        },
        {
          "k": "Layout",
          "v": "Arrival Notice Report Format-33"
        }
      ],
      "tableHeaders": [
        "Container No.",
        "Type",
        "Seal",
        "Pkgs",
        "Weight",
        "Volume"
      ],
      "tableRows": [
        [
          "ABCU9877666",
          "20' DC",
          "SL988888",
          "125",
          "18,000.000",
          "24.000"
        ]
      ],
      "termsLines": [
        "KingFisher layout preview — FRESA Gold report format sample.",
        "STC: VALVE MATERIALS FOR MACHINERY PARTS"
      ],
      "remarks": "Format-33"
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "formatBadge"
      },
      {
        "type": "docTitle",
        "text": "ARRIVAL NOTICE",
        "align": "center",
        "band": true
      },
      {
        "type": "partyTriple"
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
        "type": "termsBank"
      },
      {
        "type": "signatureRow"
      },
      {
        "type": "colorfulFooter"
      }
    ]
  },
  {
    "code": "ARRIVAL_NOTICE_REPORT_FORMAT_34",
    "formatNumber": 34,
    "name": "Arrival Notice Report Format-34",
    "paper": "A4",
    "rtl": false,
    "theme": {
      "primary": "#0A2942",
      "accent": "#0A2942",
      "fill": "#F3F3F3",
      "panel": "#EBF0F4",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#0A2942",
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
      "invoiceNo": "B/EXP/19/0254",
      "invoiceDate": "28-JAN-19",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
      },
      "partyMid": {
        "title": "Consignee",
        "lines": [
          "AL NASER TRADING COMPANY LLC",
          "30 AL MAKTHOOM BUILDING",
          "SHARJAH UAE"
        ]
      },
      "partyNotify": {
        "title": "Notify Party",
        "lines": [
          "AL NASER TRADING COMPANY LLC",
          "30 AL MAKTHOOM BUILDING",
          "SHARJAH UAE"
        ]
      },
      "fieldGrid": [
        {
          "k": "Job / Shipment",
          "v": "B/EXP/19/0254"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "Vessel / Voyage",
          "v": "EVERGREEN MARINE / 9887"
        },
        {
          "k": "Port of Loading",
          "v": "CHENNAI (EX MADRAS), INDIA"
        },
        {
          "k": "Port of Discharge",
          "v": "JEBEL ALI, UNITED ARAB EMIRATES"
        },
        {
          "k": "ETD",
          "v": "29-JAN-19"
        },
        {
          "k": "ETA",
          "v": "07-FEB-19"
        },
        {
          "k": "Layout",
          "v": "Arrival Notice Report Format-34"
        }
      ],
      "tableHeaders": [
        "Container No.",
        "Type",
        "Seal",
        "Pkgs",
        "Weight",
        "Volume"
      ],
      "tableRows": [
        [
          "ABCU9877666",
          "20' DC",
          "SL988888",
          "125",
          "18,000.000",
          "24.000"
        ]
      ],
      "termsLines": [
        "KingFisher layout preview — FRESA Gold report format sample.",
        "STC: VALVE MATERIALS FOR MACHINERY PARTS"
      ],
      "remarks": "Format-34"
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "formatBadge"
      },
      {
        "type": "docTitle",
        "text": "ARRIVAL NOTICE",
        "align": "center",
        "band": true
      },
      {
        "type": "partyTriple"
      },
      {
        "type": "fieldGrid",
        "cols": 2
      },
      {
        "type": "chargeTable",
        "headerColor": "orange"
      },
      {
        "type": "containerStrip"
      },
      {
        "type": "termsBank"
      },
      {
        "type": "signatureRow"
      },
      {
        "type": "colorfulFooter"
      }
    ]
  },
  {
    "code": "ARRIVAL_NOTICE_REPORT_FORMAT_35",
    "formatNumber": 35,
    "name": "Arrival Notice Report Format-35",
    "paper": "A4",
    "rtl": false,
    "theme": {
      "primary": "#0A2942",
      "accent": "#0A2942",
      "fill": "#F3F3F3",
      "panel": "#EBF0F4",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#0A2942",
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
      "invoiceNo": "B/EXP/19/0254",
      "invoiceDate": "28-JAN-19",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
      },
      "partyMid": {
        "title": "Consignee",
        "lines": [
          "AL NASER TRADING COMPANY LLC",
          "30 AL MAKTHOOM BUILDING",
          "SHARJAH UAE"
        ]
      },
      "partyNotify": {
        "title": "Notify Party",
        "lines": [
          "AL NASER TRADING COMPANY LLC",
          "30 AL MAKTHOOM BUILDING",
          "SHARJAH UAE"
        ]
      },
      "fieldGrid": [
        {
          "k": "Job / Shipment",
          "v": "B/EXP/19/0254"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "Vessel / Voyage",
          "v": "EVERGREEN MARINE / 9887"
        },
        {
          "k": "Port of Loading",
          "v": "CHENNAI (EX MADRAS), INDIA"
        },
        {
          "k": "Port of Discharge",
          "v": "JEBEL ALI, UNITED ARAB EMIRATES"
        },
        {
          "k": "ETD",
          "v": "29-JAN-19"
        },
        {
          "k": "ETA",
          "v": "07-FEB-19"
        },
        {
          "k": "Layout",
          "v": "Arrival Notice Report Format-35"
        }
      ],
      "tableHeaders": [
        "Container No.",
        "Type",
        "Seal",
        "Pkgs",
        "Weight",
        "Volume"
      ],
      "tableRows": [
        [
          "ABCU9877666",
          "20' DC",
          "SL988888",
          "125",
          "18,000.000",
          "24.000"
        ]
      ],
      "termsLines": [
        "KingFisher layout preview — FRESA Gold report format sample.",
        "STC: VALVE MATERIALS FOR MACHINERY PARTS"
      ],
      "remarks": "Format-35"
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "formatBadge"
      },
      {
        "type": "docTitle",
        "text": "ARRIVAL NOTICE",
        "align": "center",
        "band": true
      },
      {
        "type": "partyTriple"
      },
      {
        "type": "fieldGrid",
        "cols": 2
      },
      {
        "type": "chargeTable",
        "headerColor": "cyan"
      },
      {
        "type": "containerStrip"
      },
      {
        "type": "termsBank"
      },
      {
        "type": "signatureRow"
      },
      {
        "type": "colorfulFooter"
      }
    ]
  }
] as InvoiceFormatUiLayout[];
