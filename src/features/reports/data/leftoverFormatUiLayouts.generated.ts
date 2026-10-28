import type { InvoiceFormatUiLayout } from '../types/invoiceFormatUiLayout.types';

/** Permanent JSON UI layouts — Fresa sky-blue themes. */
export const LEFTOVER_FORMAT_UI_LAYOUTS: InvoiceFormatUiLayout[] = [
  {
    "code": "LEFTOVER_HBL_DRAFT_JASPER",
    "formatNumber": 1,
    "name": "HBL Draft- Jasper",
    "paper": "A4",
    "rtl": false,
    "theme": {
      "primary": "#0A3D7A",
      "accent": "#2185C7",
      "fill": "#F4F6F8",
      "panel": "#E5F1F9",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#99D6FE",
      "ink": "#101010",
      "gray": "#656565",
      "white": "#FFFFFF"
    },
    "branding": {
      "company": "KingFisher Wings",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "inquiry@kingfishertec.com",
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
          "v": "HBL Draft- Jasper"
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
      "remarks": "Format-1"
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "docTitle",
        "text": "BILL OF LADING",
        "align": "start",
        "band": false
      },
      {
        "type": "twoColumn",
        "showBillTo": false,
        "rightMetaFrom": "metaRows"
      },
      {
        "type": "partyTriple"
      },
      {
        "type": "fieldGrid",
        "cols": 2
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
    "code": "LEFTOVER_HBL_DRAFT_JASPER_FORMAT_1",
    "formatNumber": 1,
    "name": "HBL Draft- Jasper format 1",
    "paper": "A4",
    "rtl": false,
    "theme": {
      "primary": "#0A3D7A",
      "accent": "#2084C6",
      "fill": "#F2F4F6",
      "panel": "#E4F0F8",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#99D6FE",
      "ink": "#101010",
      "gray": "#656565",
      "white": "#FFFFFF"
    },
    "branding": {
      "company": "KingFisher Wings",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "inquiry@kingfishertec.com",
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
          "v": "HBL Draft- Jasper format 1"
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
      "remarks": "Format-1"
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "docTitle",
        "text": "BILL OF LADING",
        "align": "start",
        "band": true
      },
      {
        "type": "twoColumn",
        "showBillTo": false,
        "rightMetaFrom": "metaRows"
      },
      {
        "type": "partyTriple"
      },
      {
        "type": "fieldGrid",
        "cols": 2
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
        "type": "outstandingTable"
      },
      {
        "type": "colorfulFooter"
      }
    ]
  },
  {
    "code": "LEFTOVER_INVOICE_FORMAT1_JASPER",
    "formatNumber": 1,
    "name": "Invoice format1 –Jasper",
    "paper": "A4",
    "rtl": false,
    "theme": {
      "primary": "#0F4D96",
      "accent": "#1F83C5",
      "fill": "#E0ECF4",
      "panel": "#D0E8F5",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#98D5FD",
      "ink": "#101010",
      "gray": "#656565",
      "white": "#FFFFFF"
    },
    "branding": {
      "company": "KingFisher Wings",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "inquiry@kingfishertec.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "QTN-19-0001",
      "invoiceDate": "28-JAN-19",
      "dueDate": "28-FEB-19",
      "quotationNo": "QTN-19-0001",
      "billToName": "AL NASER TRADING COMPANY LLC",
      "billToAddress": "30 AL MAKTHOOM BUILDING, SHARJAH UAE",
      "currency": "USD",
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
      "subtotal": "1,380.00",
      "tax": "0.00",
      "total": "1,380.00",
      "words": "USD One Thousand Three Hundred Eighty Only",
      "remarks": "Format-1",
      "fieldGrid": [
        {
          "k": "POL",
          "v": "CHENNAI, INDIA"
        },
        {
          "k": "POD",
          "v": "JEBEL ALI, UAE"
        },
        {
          "k": "Incoterm",
          "v": "FOB"
        },
        {
          "k": "Validity",
          "v": "30 Days"
        },
        {
          "k": "Layout",
          "v": "Format-1"
        }
      ],
      "tableHeaders": [
        "#",
        "Charge",
        "Qty",
        "Rate",
        "Currency",
        "Amount"
      ],
      "tableRows": [
        [
          "1",
          "Ocean Freight",
          "1",
          "1,250.00",
          "USD",
          "1,250.00"
        ],
        [
          "2",
          "THC Origin",
          "1",
          "85.00",
          "USD",
          "85.00"
        ],
        [
          "3",
          "Documentation",
          "1",
          "45.00",
          "USD",
          "45.00"
        ]
      ],
      "termsLines": [
        "Rates are subject to carrier space and equipment availability.",
        "This quotation is a KingFisher layout preview (FRESA format)."
      ],
      "letterBody": "Thank you for your enquiry. Please find our quotation below."
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "docTitle",
        "text": "INVOICE FORMAT1 –JASPER",
        "align": "start",
        "band": false
      },
      {
        "type": "partyTriple"
      },
      {
        "type": "fieldGrid",
        "cols": 3
      },
      {
        "type": "chargeTable",
        "headerColor": "accent"
      },
      {
        "type": "totalsOnly"
      },
      {
        "type": "termsBank"
      },
      {
        "type": "signatureRow"
      },
      {
        "type": "formatBadge"
      },
      {
        "type": "letterBody"
      },
      {
        "type": "summaryHero"
      },
      {
        "type": "containerStrip"
      },
      {
        "type": "taxAmountBox"
      },
      {
        "type": "colorfulFooter"
      }
    ]
  },
  {
    "code": "LEFTOVER_INVOICE_FORMAT12_JASPER",
    "formatNumber": 12,
    "name": "Invoice Format12 –Jasper",
    "paper": "A4",
    "rtl": false,
    "theme": {
      "primary": "#0F4D96",
      "accent": "#2488CA",
      "fill": "#EFFBFF",
      "panel": "#DBF3FF",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#9CD9FF",
      "ink": "#101010",
      "gray": "#656565",
      "white": "#FFFFFF"
    },
    "branding": {
      "company": "KingFisher Wings",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "inquiry@kingfishertec.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "QTN-19-0012",
      "invoiceDate": "28-JAN-19",
      "dueDate": "28-FEB-19",
      "quotationNo": "QTN-19-0012",
      "billToName": "AL NASER TRADING COMPANY LLC",
      "billToAddress": "30 AL MAKTHOOM BUILDING, SHARJAH UAE",
      "currency": "USD",
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
      "subtotal": "1,380.00",
      "tax": "0.00",
      "total": "1,380.00",
      "words": "USD One Thousand Three Hundred Eighty Only",
      "remarks": "Format-12",
      "fieldGrid": [
        {
          "k": "POL",
          "v": "CHENNAI, INDIA"
        },
        {
          "k": "POD",
          "v": "JEBEL ALI, UAE"
        },
        {
          "k": "Incoterm",
          "v": "FOB"
        },
        {
          "k": "Validity",
          "v": "30 Days"
        },
        {
          "k": "Layout",
          "v": "Format-12"
        }
      ],
      "tableHeaders": [
        "#",
        "Charge",
        "Qty",
        "Rate",
        "Currency",
        "Amount"
      ],
      "tableRows": [
        [
          "1",
          "Ocean Freight",
          "1",
          "1,250.00",
          "USD",
          "1,250.00"
        ],
        [
          "2",
          "THC Origin",
          "1",
          "85.00",
          "USD",
          "85.00"
        ],
        [
          "3",
          "Documentation",
          "1",
          "45.00",
          "USD",
          "45.00"
        ]
      ],
      "termsLines": [
        "Rates are subject to carrier space and equipment availability.",
        "This quotation is a KingFisher layout preview (FRESA format)."
      ]
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "docTitle",
        "text": "INVOICE FORMAT12 –JASPER",
        "align": "center",
        "band": false
      },
      {
        "type": "fieldGrid",
        "cols": 3
      },
      {
        "type": "partyTriple"
      },
      {
        "type": "chargeTable",
        "headerColor": "accent"
      },
      {
        "type": "subtotalBar",
        "variant": "tax"
      },
      {
        "type": "formatBadge"
      },
      {
        "type": "summaryHero"
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
    "code": "LEFTOVER_INVOICE_FORMAT14_JASPER",
    "formatNumber": 14,
    "name": "Invoice Format14 –Jasper",
    "paper": "A4",
    "rtl": false,
    "theme": {
      "primary": "#0F4D96",
      "accent": "#2488CA",
      "fill": "#EDF9FF",
      "panel": "#DAF2FF",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#9BD8FF",
      "ink": "#101010",
      "gray": "#656565",
      "white": "#FFFFFF"
    },
    "branding": {
      "company": "KingFisher Wings",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "inquiry@kingfishertec.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "QTN-19-0014",
      "invoiceDate": "28-JAN-19",
      "dueDate": "28-FEB-19",
      "quotationNo": "QTN-19-0014",
      "billToName": "AL NASER TRADING COMPANY LLC",
      "billToAddress": "30 AL MAKTHOOM BUILDING, SHARJAH UAE",
      "currency": "USD",
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
      "subtotal": "1,380.00",
      "tax": "0.00",
      "total": "1,380.00",
      "words": "USD One Thousand Three Hundred Eighty Only",
      "remarks": "Format-14",
      "fieldGrid": [
        {
          "k": "POL",
          "v": "CHENNAI, INDIA"
        },
        {
          "k": "POD",
          "v": "JEBEL ALI, UAE"
        },
        {
          "k": "Incoterm",
          "v": "FOB"
        },
        {
          "k": "Validity",
          "v": "30 Days"
        },
        {
          "k": "Layout",
          "v": "Format-14"
        }
      ],
      "tableHeaders": [
        "#",
        "Charge",
        "Qty",
        "Rate",
        "Currency",
        "Amount"
      ],
      "tableRows": [
        [
          "1",
          "Ocean Freight",
          "1",
          "1,250.00",
          "USD",
          "1,250.00"
        ],
        [
          "2",
          "THC Origin",
          "1",
          "85.00",
          "USD",
          "85.00"
        ],
        [
          "3",
          "Documentation",
          "1",
          "45.00",
          "USD",
          "45.00"
        ]
      ],
      "termsLines": [
        "Rates are subject to carrier space and equipment availability.",
        "This quotation is a KingFisher layout preview (FRESA format)."
      ],
      "letterBody": "Please confirm acceptance to proceed with booking.",
      "agingHeaders": [
        "Freight",
        "Local",
        "Docs",
        "Total"
      ],
      "agingRow": [
        "1,250.00",
        "85.00",
        "45.00",
        "1,380.00"
      ]
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "docTitle",
        "text": "INVOICE FORMAT14 –JASPER",
        "align": "end",
        "band": true
      },
      {
        "type": "partyTriple"
      },
      {
        "type": "landRoute"
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
        "type": "letterBody"
      },
      {
        "type": "exportMetaStrip"
      },
      {
        "type": "containerStrip"
      },
      {
        "type": "agingSummary"
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
    "code": "LEFTOVER_INVOICE_FORMAT15_JASPER_PREPRINTED",
    "formatNumber": 15,
    "name": "Invoice format15 –Jasper Preprinted",
    "paper": "A4",
    "rtl": false,
    "theme": {
      "primary": "#0F4D96",
      "accent": "#2387C9",
      "fill": "#FCFDFE",
      "panel": "#EDF2F6",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#9BD8FF",
      "ink": "#101010",
      "gray": "#656565",
      "white": "#FFFFFF"
    },
    "branding": {
      "company": "KingFisher Wings",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "inquiry@kingfishertec.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "QTN-19-0015",
      "invoiceDate": "28-JAN-19",
      "dueDate": "28-FEB-19",
      "quotationNo": "QTN-19-0015",
      "billToName": "AL NASER TRADING COMPANY LLC",
      "billToAddress": "30 AL MAKTHOOM BUILDING, SHARJAH UAE",
      "currency": "USD",
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
      "subtotal": "1,380.00",
      "tax": "0.00",
      "total": "1,380.00",
      "words": "USD One Thousand Three Hundred Eighty Only",
      "remarks": "Format-15",
      "fieldGrid": [
        {
          "k": "POL",
          "v": "CHENNAI, INDIA"
        },
        {
          "k": "POD",
          "v": "JEBEL ALI, UAE"
        },
        {
          "k": "Incoterm",
          "v": "FOB"
        },
        {
          "k": "Validity",
          "v": "30 Days"
        },
        {
          "k": "Layout",
          "v": "Format-15"
        }
      ],
      "tableHeaders": [
        "#",
        "Charge",
        "Qty",
        "Rate",
        "Currency",
        "Amount"
      ],
      "tableRows": [
        [
          "1",
          "Ocean Freight",
          "1",
          "1,250.00",
          "USD",
          "1,250.00"
        ],
        [
          "2",
          "THC Origin",
          "1",
          "85.00",
          "USD",
          "85.00"
        ],
        [
          "3",
          "Documentation",
          "1",
          "45.00",
          "USD",
          "45.00"
        ]
      ],
      "termsLines": [
        "Rates are subject to carrier space and equipment availability.",
        "This quotation is a KingFisher layout preview (FRESA format)."
      ]
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "docTitle",
        "text": "TAX INVOICE",
        "align": "center",
        "band": true
      },
      {
        "type": "formatBadge"
      },
      {
        "type": "twoColumn",
        "showBillTo": true,
        "rightMetaFrom": "metaRows"
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
        "type": "stampSignature"
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
    "code": "LEFTOVER_INVOICE_FORMAT15_JASPER_STANDARD",
    "formatNumber": 15,
    "name": "Invoice format15 –Jasper Standard",
    "paper": "A4",
    "rtl": false,
    "theme": {
      "primary": "#0F4D96",
      "accent": "#2286C8",
      "fill": "#E9F5FD",
      "panel": "#D7EFFC",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#9AD7FF",
      "ink": "#101010",
      "gray": "#656565",
      "white": "#FFFFFF"
    },
    "branding": {
      "company": "KingFisher Wings",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "inquiry@kingfishertec.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "QTN-19-0015",
      "invoiceDate": "28-JAN-19",
      "dueDate": "28-FEB-19",
      "quotationNo": "QTN-19-0015",
      "billToName": "AL NASER TRADING COMPANY LLC",
      "billToAddress": "30 AL MAKTHOOM BUILDING, SHARJAH UAE",
      "currency": "USD",
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
      "subtotal": "1,380.00",
      "tax": "0.00",
      "total": "1,380.00",
      "words": "USD One Thousand Three Hundred Eighty Only",
      "remarks": "Format-15",
      "fieldGrid": [
        {
          "k": "POL",
          "v": "CHENNAI, INDIA"
        },
        {
          "k": "POD",
          "v": "JEBEL ALI, UAE"
        },
        {
          "k": "Incoterm",
          "v": "FOB"
        },
        {
          "k": "Validity",
          "v": "30 Days"
        },
        {
          "k": "Layout",
          "v": "Format-15"
        }
      ],
      "tableHeaders": [
        "#",
        "Charge",
        "Qty",
        "Rate",
        "Currency",
        "Amount"
      ],
      "tableRows": [
        [
          "1",
          "Ocean Freight",
          "1",
          "1,250.00",
          "USD",
          "1,250.00"
        ],
        [
          "2",
          "THC Origin",
          "1",
          "85.00",
          "USD",
          "85.00"
        ],
        [
          "3",
          "Documentation",
          "1",
          "45.00",
          "USD",
          "45.00"
        ]
      ],
      "termsLines": [
        "Rates are subject to carrier space and equipment availability.",
        "This quotation is a KingFisher layout preview (FRESA format)."
      ]
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "docTitle",
        "text": "INVOICE FORMAT15 –JASPER STANDARD",
        "align": "center",
        "band": false
      },
      {
        "type": "fieldGrid",
        "cols": 3
      },
      {
        "type": "partyTriple"
      },
      {
        "type": "chargeTable",
        "headerColor": "accent"
      },
      {
        "type": "subtotalBar",
        "variant": "tax"
      },
      {
        "type": "formatBadge"
      },
      {
        "type": "containerStrip"
      },
      {
        "type": "outstandingTable"
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
    "code": "LEFTOVER_INVOICE_FORMAT2_FCY_JASPER",
    "formatNumber": 2,
    "name": "Invoice format2 FCY- Jasper",
    "paper": "A4",
    "rtl": false,
    "theme": {
      "primary": "#0F4D96",
      "accent": "#2286C8",
      "fill": "#EDF1FE",
      "panel": "#E7F3FB",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#9AD7FF",
      "ink": "#101010",
      "gray": "#656565",
      "white": "#FFFFFF"
    },
    "branding": {
      "company": "KingFisher Wings",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "inquiry@kingfishertec.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "QTN-19-0002",
      "invoiceDate": "28-JAN-19",
      "dueDate": "28-FEB-19",
      "quotationNo": "QTN-19-0002",
      "billToName": "AL NASER TRADING COMPANY LLC",
      "billToAddress": "30 AL MAKTHOOM BUILDING, SHARJAH UAE",
      "currency": "USD",
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
      "subtotal": "1,380.00",
      "tax": "0.00",
      "total": "1,380.00",
      "words": "USD One Thousand Three Hundred Eighty Only",
      "remarks": "Format-2",
      "fieldGrid": [
        {
          "k": "POL",
          "v": "CHENNAI, INDIA"
        },
        {
          "k": "POD",
          "v": "JEBEL ALI, UAE"
        },
        {
          "k": "Incoterm",
          "v": "FOB"
        },
        {
          "k": "Validity",
          "v": "30 Days"
        },
        {
          "k": "Layout",
          "v": "Format-2"
        }
      ],
      "tableHeaders": [
        "#",
        "Charge",
        "Qty",
        "Rate",
        "Currency",
        "Amount"
      ],
      "tableRows": [
        [
          "1",
          "Ocean Freight",
          "1",
          "1,250.00",
          "USD",
          "1,250.00"
        ],
        [
          "2",
          "THC Origin",
          "1",
          "85.00",
          "USD",
          "85.00"
        ],
        [
          "3",
          "Documentation",
          "1",
          "45.00",
          "USD",
          "45.00"
        ]
      ],
      "termsLines": [
        "Rates are subject to carrier space and equipment availability.",
        "This quotation is a KingFisher layout preview (FRESA format)."
      ]
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "docTitle",
        "text": "INVOICE / DEBIT NOTE",
        "align": "end",
        "band": false
      },
      {
        "type": "shipmentDetails",
        "fcyOrder": true,
        "showQuotation": true
      },
      {
        "type": "chargeTable",
        "headerColor": "fill"
      },
      {
        "type": "subtotalBar",
        "variant": "fcy"
      },
      {
        "type": "exportClosing",
        "showBullets": true
      },
      {
        "type": "colorfulFooter"
      }
    ]
  },
  {
    "code": "LEFTOVER_INVOICE_FORMAT3_JASPER",
    "formatNumber": 3,
    "name": "Invoice format3 –Jasper",
    "paper": "Letter",
    "rtl": false,
    "theme": {
      "primary": "#0F4D96",
      "accent": "#2185C7",
      "fill": "#E5F1F9",
      "panel": "#D4ECF9",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#99D6FE",
      "ink": "#101010",
      "gray": "#656565",
      "white": "#FFFFFF"
    },
    "branding": {
      "company": "KingFisher Wings",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "inquiry@kingfishertec.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "QTN-19-0003",
      "invoiceDate": "28-JAN-19",
      "dueDate": "28-FEB-19",
      "quotationNo": "QTN-19-0003",
      "billToName": "AL NASER TRADING COMPANY LLC",
      "billToAddress": "30 AL MAKTHOOM BUILDING, SHARJAH UAE",
      "currency": "USD",
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
      "subtotal": "1,380.00",
      "tax": "0.00",
      "total": "1,380.00",
      "words": "USD One Thousand Three Hundred Eighty Only",
      "remarks": "Format-3",
      "fieldGrid": [
        {
          "k": "POL",
          "v": "CHENNAI, INDIA"
        },
        {
          "k": "POD",
          "v": "JEBEL ALI, UAE"
        },
        {
          "k": "Incoterm",
          "v": "FOB"
        },
        {
          "k": "Validity",
          "v": "30 Days"
        },
        {
          "k": "Layout",
          "v": "Format-3"
        },
        {
          "k": "Paper",
          "v": "Letter"
        }
      ],
      "tableHeaders": [
        "#",
        "Charge",
        "Qty",
        "Rate",
        "Currency",
        "Amount"
      ],
      "tableRows": [
        [
          "1",
          "Ocean Freight",
          "1",
          "1,250.00",
          "USD",
          "1,250.00"
        ],
        [
          "2",
          "THC Origin",
          "1",
          "85.00",
          "USD",
          "85.00"
        ],
        [
          "3",
          "Documentation",
          "1",
          "45.00",
          "USD",
          "45.00"
        ]
      ],
      "termsLines": [
        "Rates are subject to carrier space and equipment availability.",
        "This quotation is a KingFisher layout preview (FRESA format)."
      ]
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "docTitle",
        "text": "INVOICE FORMAT3 –JASPER",
        "align": "center",
        "band": false
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
        "type": "subtotalBar",
        "variant": "tax"
      },
      {
        "type": "formatBadge"
      },
      {
        "type": "letterBody"
      },
      {
        "type": "exportMetaStrip"
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
    "code": "LEFTOVER_INVOICE_FORMAT3_FCY_WITH_QRIRN_JASPER",
    "formatNumber": 3,
    "name": "Invoice format3 FCY with QR/IRN –Jasper",
    "paper": "Letter",
    "rtl": false,
    "theme": {
      "primary": "#0F4D96",
      "accent": "#2084C6",
      "fill": "#E9EDFA",
      "panel": "#E5F1F9",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#99D6FE",
      "ink": "#101010",
      "gray": "#656565",
      "white": "#FFFFFF"
    },
    "branding": {
      "company": "KingFisher Wings",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "inquiry@kingfishertec.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "QTN-19-0003",
      "invoiceDate": "28-JAN-19",
      "dueDate": "28-FEB-19",
      "quotationNo": "QTN-19-0003",
      "billToName": "AL NASER TRADING COMPANY LLC",
      "billToAddress": "30 AL MAKTHOOM BUILDING, SHARJAH UAE",
      "currency": "USD",
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
      "subtotal": "1,380.00",
      "tax": "0.00",
      "total": "1,380.00",
      "words": "USD One Thousand Three Hundred Eighty Only",
      "remarks": "Format-3",
      "fieldGrid": [
        {
          "k": "POL",
          "v": "CHENNAI, INDIA"
        },
        {
          "k": "POD",
          "v": "JEBEL ALI, UAE"
        },
        {
          "k": "Incoterm",
          "v": "FOB"
        },
        {
          "k": "Validity",
          "v": "30 Days"
        },
        {
          "k": "Layout",
          "v": "Format-3"
        },
        {
          "k": "Paper",
          "v": "Letter"
        }
      ],
      "tableHeaders": [
        "#",
        "Charge",
        "Qty",
        "Rate",
        "Currency",
        "Amount"
      ],
      "tableRows": [
        [
          "1",
          "Ocean Freight",
          "1",
          "1,250.00",
          "USD",
          "1,250.00"
        ],
        [
          "2",
          "THC Origin",
          "1",
          "85.00",
          "USD",
          "85.00"
        ],
        [
          "3",
          "Documentation",
          "1",
          "45.00",
          "USD",
          "45.00"
        ]
      ],
      "termsLines": [
        "Rates are subject to carrier space and equipment availability.",
        "This quotation is a KingFisher layout preview (FRESA format)."
      ]
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "docTitle",
        "text": "INVOICE / DEBIT NOTE",
        "align": "center",
        "band": true
      },
      {
        "type": "shipmentDetails",
        "fcyOrder": true,
        "showQuotation": true
      },
      {
        "type": "chargeTable",
        "headerColor": "accent"
      },
      {
        "type": "subtotalBar",
        "variant": "fcy"
      },
      {
        "type": "exportClosing",
        "showBullets": true
      },
      {
        "type": "wireBox"
      },
      {
        "type": "colorfulFooter"
      }
    ]
  },
  {
    "code": "LEFTOVER_INVOICE_FORMAT4_FCY_JASPER",
    "formatNumber": 4,
    "name": "Invoice format4 FCY- Jasper",
    "paper": "A4",
    "rtl": false,
    "theme": {
      "primary": "#0F4D96",
      "accent": "#2084C6",
      "fill": "#E7EBF8",
      "panel": "#E3EFF7",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#98D5FD",
      "ink": "#101010",
      "gray": "#656565",
      "white": "#FFFFFF"
    },
    "branding": {
      "company": "KingFisher Wings",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "inquiry@kingfishertec.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "QTN-19-0004",
      "invoiceDate": "28-JAN-19",
      "dueDate": "28-FEB-19",
      "quotationNo": "QTN-19-0004",
      "billToName": "AL NASER TRADING COMPANY LLC",
      "billToAddress": "30 AL MAKTHOOM BUILDING, SHARJAH UAE",
      "currency": "USD",
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
      "subtotal": "1,380.00",
      "tax": "0.00",
      "total": "1,380.00",
      "words": "USD One Thousand Three Hundred Eighty Only",
      "remarks": "Format-4",
      "fieldGrid": [
        {
          "k": "POL",
          "v": "CHENNAI, INDIA"
        },
        {
          "k": "POD",
          "v": "JEBEL ALI, UAE"
        },
        {
          "k": "Incoterm",
          "v": "FOB"
        },
        {
          "k": "Validity",
          "v": "30 Days"
        },
        {
          "k": "Layout",
          "v": "Format-4"
        }
      ],
      "tableHeaders": [
        "#",
        "Charge",
        "Qty",
        "Rate",
        "Currency",
        "Amount"
      ],
      "tableRows": [
        [
          "1",
          "Ocean Freight",
          "1",
          "1,250.00",
          "USD",
          "1,250.00"
        ],
        [
          "2",
          "THC Origin",
          "1",
          "85.00",
          "USD",
          "85.00"
        ],
        [
          "3",
          "Documentation",
          "1",
          "45.00",
          "USD",
          "45.00"
        ]
      ],
      "termsLines": [
        "Rates are subject to carrier space and equipment availability.",
        "This quotation is a KingFisher layout preview (FRESA format)."
      ],
      "letterBody": "Please confirm acceptance to proceed with booking.",
      "agingHeaders": [
        "Freight",
        "Local",
        "Docs",
        "Total"
      ],
      "agingRow": [
        "1,250.00",
        "85.00",
        "45.00",
        "1,380.00"
      ]
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "docTitle",
        "text": "INVOICE / DEBIT NOTE",
        "align": "start",
        "band": true
      },
      {
        "type": "shipmentDetails",
        "fcyOrder": true,
        "showQuotation": true
      },
      {
        "type": "chargeTable",
        "headerColor": "accent"
      },
      {
        "type": "subtotalBar",
        "variant": "fcy"
      },
      {
        "type": "exportClosing",
        "showBullets": true
      },
      {
        "type": "summaryHero"
      },
      {
        "type": "colorfulFooter"
      }
    ]
  },
  {
    "code": "LEFTOVER_INVOICE_FORMAT5_JASPER",
    "formatNumber": 5,
    "name": "Invoice format5 –Jasper",
    "paper": "A4",
    "rtl": false,
    "theme": {
      "primary": "#0F4D96",
      "accent": "#2589CB",
      "fill": "#F0FCFF",
      "panel": "#DCF4FF",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#9CD9FF",
      "ink": "#101010",
      "gray": "#656565",
      "white": "#FFFFFF"
    },
    "branding": {
      "company": "KingFisher Wings",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "inquiry@kingfishertec.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "QTN-19-0005",
      "invoiceDate": "28-JAN-19",
      "dueDate": "28-FEB-19",
      "quotationNo": "QTN-19-0005",
      "billToName": "AL NASER TRADING COMPANY LLC",
      "billToAddress": "30 AL MAKTHOOM BUILDING, SHARJAH UAE",
      "currency": "USD",
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
      "subtotal": "1,380.00",
      "tax": "0.00",
      "total": "1,380.00",
      "words": "USD One Thousand Three Hundred Eighty Only",
      "remarks": "Format-5",
      "fieldGrid": [
        {
          "k": "POL",
          "v": "CHENNAI, INDIA"
        },
        {
          "k": "POD",
          "v": "JEBEL ALI, UAE"
        },
        {
          "k": "Incoterm",
          "v": "FOB"
        },
        {
          "k": "Validity",
          "v": "30 Days"
        },
        {
          "k": "Layout",
          "v": "Format-5"
        }
      ],
      "tableHeaders": [
        "#",
        "Charge",
        "Qty",
        "Rate",
        "Currency",
        "Amount"
      ],
      "tableRows": [
        [
          "1",
          "Ocean Freight",
          "1",
          "1,250.00",
          "USD",
          "1,250.00"
        ],
        [
          "2",
          "THC Origin",
          "1",
          "85.00",
          "USD",
          "85.00"
        ],
        [
          "3",
          "Documentation",
          "1",
          "45.00",
          "USD",
          "45.00"
        ]
      ],
      "termsLines": [
        "Rates are subject to carrier space and equipment availability.",
        "This quotation is a KingFisher layout preview (FRESA format)."
      ]
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "docTitle",
        "text": "INVOICE FORMAT5 –JASPER",
        "align": "end",
        "band": true
      },
      {
        "type": "partyTriple"
      },
      {
        "type": "landRoute"
      },
      {
        "type": "fieldGrid",
        "cols": 3
      },
      {
        "type": "chargeTable",
        "headerColor": "accent"
      },
      {
        "type": "termsBank"
      },
      {
        "type": "letterBody"
      },
      {
        "type": "summaryHero"
      },
      {
        "type": "containerStrip"
      },
      {
        "type": "agingSummary"
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
    "code": "LEFTOVER_INVOICE_FORMAT6",
    "formatNumber": 6,
    "name": "Invoice format6",
    "paper": "A4",
    "rtl": false,
    "theme": {
      "primary": "#0F4D96",
      "accent": "#2488CA",
      "fill": "#F6FFFF",
      "panel": "#ECF8FF",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#9CD9FF",
      "ink": "#101010",
      "gray": "#656565",
      "white": "#FFFFFF"
    },
    "branding": {
      "company": "KingFisher Wings",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "inquiry@kingfishertec.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "QTN-19-0006",
      "invoiceDate": "28-JAN-19",
      "dueDate": "28-FEB-19",
      "quotationNo": "QTN-19-0006",
      "billToName": "AL NASER TRADING COMPANY LLC",
      "billToAddress": "30 AL MAKTHOOM BUILDING, SHARJAH UAE",
      "currency": "USD",
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
      "subtotal": "1,380.00",
      "tax": "0.00",
      "total": "1,380.00",
      "words": "USD One Thousand Three Hundred Eighty Only",
      "remarks": "Format-6",
      "fieldGrid": [
        {
          "k": "POL",
          "v": "CHENNAI, INDIA"
        },
        {
          "k": "POD",
          "v": "JEBEL ALI, UAE"
        },
        {
          "k": "Incoterm",
          "v": "FOB"
        },
        {
          "k": "Validity",
          "v": "30 Days"
        },
        {
          "k": "Layout",
          "v": "Format-6"
        }
      ],
      "tableHeaders": [
        "#",
        "Charge",
        "Qty",
        "Rate",
        "Currency",
        "Amount"
      ],
      "tableRows": [
        [
          "1",
          "Ocean Freight",
          "1",
          "1,250.00",
          "USD",
          "1,250.00"
        ],
        [
          "2",
          "THC Origin",
          "1",
          "85.00",
          "USD",
          "85.00"
        ],
        [
          "3",
          "Documentation",
          "1",
          "45.00",
          "USD",
          "45.00"
        ]
      ],
      "termsLines": [
        "Rates are subject to carrier space and equipment availability.",
        "This quotation is a KingFisher layout preview (FRESA format)."
      ],
      "letterBody": "Thank you for your enquiry. Please find our quotation below."
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "docTitle",
        "text": "INVOICE FORMAT6",
        "align": "center",
        "band": true
      },
      {
        "type": "partyTriple"
      },
      {
        "type": "fieldGrid",
        "cols": 3
      },
      {
        "type": "chargeTable",
        "headerColor": "accent"
      },
      {
        "type": "termsBank"
      },
      {
        "type": "letterBody"
      },
      {
        "type": "exportMetaStrip"
      },
      {
        "type": "wireBox"
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
    "code": "LEFTOVER_INVOICE_FORMAT7_JASPER_INDIA",
    "formatNumber": 7,
    "name": "Invoice format7 –Jasper India",
    "paper": "A4",
    "rtl": false,
    "theme": {
      "primary": "#0F4D96",
      "accent": "#2387C9",
      "fill": "#ECF8FF",
      "panel": "#D9F1FE",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#9BD8FF",
      "ink": "#101010",
      "gray": "#656565",
      "white": "#FFFFFF"
    },
    "branding": {
      "company": "KingFisher Wings",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "inquiry@kingfishertec.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "QTN-19-0007",
      "invoiceDate": "28-JAN-19",
      "dueDate": "28-FEB-19",
      "quotationNo": "QTN-19-0007",
      "billToName": "AL NASER TRADING COMPANY LLC",
      "billToAddress": "30 AL MAKTHOOM BUILDING, SHARJAH UAE",
      "currency": "USD",
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
      "subtotal": "1,380.00",
      "tax": "0.00",
      "total": "1,380.00",
      "words": "USD One Thousand Three Hundred Eighty Only",
      "remarks": "Format-7",
      "fieldGrid": [
        {
          "k": "POL",
          "v": "CHENNAI, INDIA"
        },
        {
          "k": "POD",
          "v": "JEBEL ALI, UAE"
        },
        {
          "k": "Incoterm",
          "v": "FOB"
        },
        {
          "k": "Validity",
          "v": "30 Days"
        },
        {
          "k": "Layout",
          "v": "Format-7"
        }
      ],
      "tableHeaders": [
        "#",
        "Charge",
        "Qty",
        "Rate",
        "Currency",
        "Amount"
      ],
      "tableRows": [
        [
          "1",
          "Ocean Freight",
          "1",
          "1,250.00",
          "USD",
          "1,250.00"
        ],
        [
          "2",
          "THC Origin",
          "1",
          "85.00",
          "USD",
          "85.00"
        ],
        [
          "3",
          "Documentation",
          "1",
          "45.00",
          "USD",
          "45.00"
        ]
      ],
      "termsLines": [
        "Rates are subject to carrier space and equipment availability.",
        "This quotation is a KingFisher layout preview (FRESA format)."
      ]
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "docTitle",
        "text": "INVOICE FORMAT7 –JASPER INDIA",
        "align": "start",
        "band": true
      },
      {
        "type": "partyTriple"
      },
      {
        "type": "shipmentDetails",
        "showIrn": true,
        "showQuotation": true
      },
      {
        "type": "fieldGrid",
        "cols": 3
      },
      {
        "type": "chargeTable",
        "headerColor": "accent"
      },
      {
        "type": "letterBody"
      },
      {
        "type": "summaryHero"
      },
      {
        "type": "exportMetaStrip"
      },
      {
        "type": "containerStrip"
      },
      {
        "type": "usaNumberedFields"
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
    "code": "LEFTOVER_INVOICE_FORMAT7_JASPER_USA",
    "formatNumber": 7,
    "name": "Invoice format7 –Jasper USA",
    "paper": "Letter",
    "rtl": false,
    "theme": {
      "primary": "#0F4D96",
      "accent": "#2387C9",
      "fill": "#EDF2F6",
      "panel": "#ECF1F5",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#9BD8FF",
      "ink": "#101010",
      "gray": "#656565",
      "white": "#FFFFFF"
    },
    "branding": {
      "company": "KingFisher Wings",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "inquiry@kingfishertec.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "QTN-19-0007",
      "invoiceDate": "28-JAN-19",
      "dueDate": "28-FEB-19",
      "quotationNo": "QTN-19-0007",
      "billToName": "AL NASER TRADING COMPANY LLC",
      "billToAddress": "30 AL MAKTHOOM BUILDING, SHARJAH UAE",
      "currency": "USD",
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
      "subtotal": "1,380.00",
      "tax": "0.00",
      "total": "1,380.00",
      "words": "USD One Thousand Three Hundred Eighty Only",
      "remarks": "Format-7",
      "fieldGrid": [
        {
          "k": "POL",
          "v": "CHENNAI, INDIA"
        },
        {
          "k": "POD",
          "v": "JEBEL ALI, UAE"
        },
        {
          "k": "Incoterm",
          "v": "FOB"
        },
        {
          "k": "Validity",
          "v": "30 Days"
        },
        {
          "k": "Layout",
          "v": "Format-7"
        }
      ],
      "tableHeaders": [
        "#",
        "Charge",
        "Qty",
        "Rate",
        "Currency",
        "Amount"
      ],
      "tableRows": [
        [
          "1",
          "Ocean Freight",
          "1",
          "1,250.00",
          "USD",
          "1,250.00"
        ],
        [
          "2",
          "THC Origin",
          "1",
          "85.00",
          "USD",
          "85.00"
        ],
        [
          "3",
          "Documentation",
          "1",
          "45.00",
          "USD",
          "45.00"
        ]
      ],
      "termsLines": [
        "Rates are subject to carrier space and equipment availability.",
        "This quotation is a KingFisher layout preview (FRESA format)."
      ],
      "docSubtitle": "Standard Invoice USA"
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "docTitle",
        "text": "INVOICE",
        "align": "start",
        "band": false
      },
      {
        "type": "usaNumberedFields"
      },
      {
        "type": "twoColumn",
        "showBillTo": true,
        "rightMetaFrom": "metaRows"
      },
      {
        "type": "chargeTable",
        "headerColor": "orange"
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
    "code": "LEFTOVER_INVOICE_FORMAT8_WITH_QRIRN_JASPER",
    "formatNumber": 8,
    "name": "Invoice Format8 with QR/IRN –Jasper",
    "paper": "Letter",
    "rtl": false,
    "theme": {
      "primary": "#0F4D96",
      "accent": "#2286C8",
      "fill": "#E8F4FC",
      "panel": "#D6EEFB",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#9AD7FF",
      "ink": "#101010",
      "gray": "#656565",
      "white": "#FFFFFF"
    },
    "branding": {
      "company": "KingFisher Wings",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "inquiry@kingfishertec.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "QTN-19-0008",
      "invoiceDate": "28-JAN-19",
      "dueDate": "28-FEB-19",
      "quotationNo": "QTN-19-0008",
      "billToName": "AL NASER TRADING COMPANY LLC",
      "billToAddress": "30 AL MAKTHOOM BUILDING, SHARJAH UAE",
      "currency": "USD",
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
      "subtotal": "1,380.00",
      "tax": "0.00",
      "total": "1,380.00",
      "words": "USD One Thousand Three Hundred Eighty Only",
      "remarks": "Format-8",
      "fieldGrid": [
        {
          "k": "POL",
          "v": "CHENNAI, INDIA"
        },
        {
          "k": "POD",
          "v": "JEBEL ALI, UAE"
        },
        {
          "k": "Incoterm",
          "v": "FOB"
        },
        {
          "k": "Validity",
          "v": "30 Days"
        },
        {
          "k": "Layout",
          "v": "Format-8"
        },
        {
          "k": "Paper",
          "v": "Letter"
        }
      ],
      "tableHeaders": [
        "#",
        "Charge",
        "Qty",
        "Rate",
        "Currency",
        "Amount"
      ],
      "tableRows": [
        [
          "1",
          "Ocean Freight",
          "1",
          "1,250.00",
          "USD",
          "1,250.00"
        ],
        [
          "2",
          "THC Origin",
          "1",
          "85.00",
          "USD",
          "85.00"
        ],
        [
          "3",
          "Documentation",
          "1",
          "45.00",
          "USD",
          "45.00"
        ]
      ],
      "termsLines": [
        "Rates are subject to carrier space and equipment availability.",
        "This quotation is a KingFisher layout preview (FRESA format)."
      ]
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "docTitle",
        "text": "INVOICE FORMAT8 WITH QR/IRN –JASPER",
        "align": "end",
        "band": false
      },
      {
        "type": "twoColumn",
        "showBillTo": true,
        "rightMetaFrom": "metaRows"
      },
      {
        "type": "fieldGrid",
        "cols": 3
      },
      {
        "type": "formatBadge"
      },
      {
        "type": "letterBody"
      },
      {
        "type": "summaryHero"
      },
      {
        "type": "containerStrip"
      },
      {
        "type": "chargeTable",
        "headerColor": "orange"
      },
      {
        "type": "wordsAndTotal"
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
    "code": "LEFTOVER_INVOICE_FORMAT9_WITH_QRIRN_JASPER",
    "formatNumber": 9,
    "name": "Invoice Format9 with QR/IRN –Jasper",
    "paper": "A4",
    "rtl": false,
    "theme": {
      "primary": "#0F4D96",
      "accent": "#2185C7",
      "fill": "#E6F2FA",
      "panel": "#D5EDFA",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#9AD7FF",
      "ink": "#101010",
      "gray": "#656565",
      "white": "#FFFFFF"
    },
    "branding": {
      "company": "KingFisher Wings",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "inquiry@kingfishertec.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "QTN-19-0009",
      "invoiceDate": "28-JAN-19",
      "dueDate": "28-FEB-19",
      "quotationNo": "QTN-19-0009",
      "billToName": "AL NASER TRADING COMPANY LLC",
      "billToAddress": "30 AL MAKTHOOM BUILDING, SHARJAH UAE",
      "currency": "USD",
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
      "subtotal": "1,380.00",
      "tax": "0.00",
      "total": "1,380.00",
      "words": "USD One Thousand Three Hundred Eighty Only",
      "remarks": "Format-9",
      "fieldGrid": [
        {
          "k": "POL",
          "v": "CHENNAI, INDIA"
        },
        {
          "k": "POD",
          "v": "JEBEL ALI, UAE"
        },
        {
          "k": "Incoterm",
          "v": "FOB"
        },
        {
          "k": "Validity",
          "v": "30 Days"
        },
        {
          "k": "Layout",
          "v": "Format-9"
        }
      ],
      "tableHeaders": [
        "#",
        "Charge",
        "Qty",
        "Rate",
        "Currency",
        "Amount"
      ],
      "tableRows": [
        [
          "1",
          "Ocean Freight",
          "1",
          "1,250.00",
          "USD",
          "1,250.00"
        ],
        [
          "2",
          "THC Origin",
          "1",
          "85.00",
          "USD",
          "85.00"
        ],
        [
          "3",
          "Documentation",
          "1",
          "45.00",
          "USD",
          "45.00"
        ]
      ],
      "termsLines": [
        "Rates are subject to carrier space and equipment availability.",
        "This quotation is a KingFisher layout preview (FRESA format)."
      ],
      "letterBody": "Please confirm acceptance to proceed with booking.",
      "agingHeaders": [
        "Freight",
        "Local",
        "Docs",
        "Total"
      ],
      "agingRow": [
        "1,250.00",
        "85.00",
        "45.00",
        "1,380.00"
      ]
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "docTitle",
        "text": "INVOICE FORMAT9 WITH QR/IRN –JASPER",
        "align": "center",
        "band": false
      },
      {
        "type": "fieldGrid",
        "cols": 3
      },
      {
        "type": "partyTriple"
      },
      {
        "type": "chargeTable",
        "headerColor": "orange"
      },
      {
        "type": "subtotalBar",
        "variant": "tax"
      },
      {
        "type": "formatBadge"
      },
      {
        "type": "exportMetaStrip"
      },
      {
        "type": "wireBox"
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
    "code": "LEFTOVER_INVOICE_SINGAPORE_JASPER",
    "formatNumber": 18,
    "name": "Invoice Singapore –Jasper",
    "paper": "Letter",
    "rtl": false,
    "theme": {
      "primary": "#0F4D96",
      "accent": "#2185C7",
      "fill": "#E4F0F8",
      "panel": "#D3EBF8",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#99D6FE",
      "ink": "#101010",
      "gray": "#656565",
      "white": "#FFFFFF"
    },
    "branding": {
      "company": "KingFisher Wings",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "inquiry@kingfishertec.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "QTN-19-0018",
      "invoiceDate": "28-JAN-19",
      "dueDate": "28-FEB-19",
      "quotationNo": "QTN-19-0018",
      "billToName": "AL NASER TRADING COMPANY LLC",
      "billToAddress": "30 AL MAKTHOOM BUILDING, SHARJAH UAE",
      "currency": "USD",
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
      "subtotal": "1,380.00",
      "tax": "0.00",
      "total": "1,380.00",
      "words": "USD One Thousand Three Hundred Eighty Only",
      "remarks": "Format-18",
      "fieldGrid": [
        {
          "k": "POL",
          "v": "CHENNAI, INDIA"
        },
        {
          "k": "POD",
          "v": "JEBEL ALI, UAE"
        },
        {
          "k": "Incoterm",
          "v": "FOB"
        },
        {
          "k": "Validity",
          "v": "30 Days"
        },
        {
          "k": "Layout",
          "v": "Format-18"
        },
        {
          "k": "Paper",
          "v": "Letter"
        }
      ],
      "tableHeaders": [
        "#",
        "Charge",
        "Qty",
        "Rate",
        "Currency",
        "Amount"
      ],
      "tableRows": [
        [
          "1",
          "Ocean Freight",
          "1",
          "1,250.00",
          "USD",
          "1,250.00"
        ],
        [
          "2",
          "THC Origin",
          "1",
          "85.00",
          "USD",
          "85.00"
        ],
        [
          "3",
          "Documentation",
          "1",
          "45.00",
          "USD",
          "45.00"
        ]
      ],
      "termsLines": [
        "Rates are subject to carrier space and equipment availability.",
        "This quotation is a KingFisher layout preview (FRESA format)."
      ]
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "docTitle",
        "text": "INVOICE SINGAPORE –JASPER",
        "align": "center",
        "band": false
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
        "type": "subtotalBar",
        "variant": "tax"
      },
      {
        "type": "formatBadge"
      },
      {
        "type": "summaryHero"
      },
      {
        "type": "agingSummary"
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
    "code": "LEFTOVER_LAND_FREIGHT_TRANSPORTATION_INVOICE_FORMAT_1",
    "formatNumber": 1,
    "name": "Land Freight/ Transportation Invoice Format 1",
    "paper": "A4",
    "rtl": false,
    "theme": {
      "primary": "#0F4D96",
      "accent": "#2084C6",
      "fill": "#F9F2EA",
      "panel": "#E7ECF0",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#99D6FE",
      "ink": "#101010",
      "gray": "#656565",
      "white": "#FFFFFF"
    },
    "branding": {
      "company": "KingFisher Wings",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "inquiry@kingfishertec.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "QTN-19-0001",
      "invoiceDate": "28-JAN-19",
      "dueDate": "28-FEB-19",
      "quotationNo": "QTN-19-0001",
      "billToName": "AL NASER TRADING COMPANY LLC",
      "billToAddress": "30 AL MAKTHOOM BUILDING, SHARJAH UAE",
      "currency": "USD",
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
      "subtotal": "1,380.00",
      "tax": "0.00",
      "total": "1,380.00",
      "words": "USD One Thousand Three Hundred Eighty Only",
      "remarks": "Format-1",
      "fieldGrid": [
        {
          "k": "POL",
          "v": "CHENNAI, INDIA"
        },
        {
          "k": "POD",
          "v": "JEBEL ALI, UAE"
        },
        {
          "k": "Incoterm",
          "v": "FOB"
        },
        {
          "k": "Validity",
          "v": "30 Days"
        },
        {
          "k": "Layout",
          "v": "Format-1"
        }
      ],
      "tableHeaders": [
        "#",
        "Charge",
        "Qty",
        "Rate",
        "Currency",
        "Amount"
      ],
      "tableRows": [
        [
          "1",
          "Ocean Freight",
          "1",
          "1,250.00",
          "USD",
          "1,250.00"
        ],
        [
          "2",
          "THC Origin",
          "1",
          "85.00",
          "USD",
          "85.00"
        ],
        [
          "3",
          "Documentation",
          "1",
          "45.00",
          "USD",
          "45.00"
        ]
      ],
      "termsLines": [
        "Rates are subject to carrier space and equipment availability.",
        "This quotation is a KingFisher layout preview (FRESA format)."
      ],
      "letterBody": "Thank you for your enquiry. Please find our quotation below."
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "landFreightHeader",
        "title": "LAND FREIGHT / TRANSPORTATION INVOICE"
      },
      {
        "type": "twoColumn",
        "showBillTo": true,
        "rightMetaFrom": "metaRows"
      },
      {
        "type": "landRoute"
      },
      {
        "type": "chargeTable",
        "headerColor": "orange"
      },
      {
        "type": "grandTotalDue"
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
    "code": "LEFTOVER_OVERSEAS_DEBIT_NOTE_EXPORT_INVOICE_JASPER_FORMAT2",
    "formatNumber": 2,
    "name": "Overseas Debit Note (Export Invoice) –Jasper Format2",
    "paper": "A4",
    "rtl": false,
    "theme": {
      "primary": "#0F4D96",
      "accent": "#1F83C5",
      "fill": "#E8F1F7",
      "panel": "#E2EEF6",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#98D5FD",
      "ink": "#101010",
      "gray": "#656565",
      "white": "#FFFFFF"
    },
    "branding": {
      "company": "KingFisher Wings",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "inquiry@kingfishertec.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "QTN-19-0002",
      "invoiceDate": "28-JAN-19",
      "dueDate": "28-FEB-19",
      "quotationNo": "QTN-19-0002",
      "billToName": "AL NASER TRADING COMPANY LLC",
      "billToAddress": "30 AL MAKTHOOM BUILDING, SHARJAH UAE",
      "currency": "USD",
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
      "subtotal": "1,380.00",
      "tax": "0.00",
      "total": "1,380.00",
      "words": "USD One Thousand Three Hundred Eighty Only",
      "remarks": "Format-2",
      "fieldGrid": [
        {
          "k": "POL",
          "v": "CHENNAI, INDIA"
        },
        {
          "k": "POD",
          "v": "JEBEL ALI, UAE"
        },
        {
          "k": "Incoterm",
          "v": "FOB"
        },
        {
          "k": "Validity",
          "v": "30 Days"
        },
        {
          "k": "Layout",
          "v": "Format-2"
        }
      ],
      "tableHeaders": [
        "#",
        "Charge",
        "Qty",
        "Rate",
        "Currency",
        "Amount"
      ],
      "tableRows": [
        [
          "1",
          "Ocean Freight",
          "1",
          "1,250.00",
          "USD",
          "1,250.00"
        ],
        [
          "2",
          "THC Origin",
          "1",
          "85.00",
          "USD",
          "85.00"
        ],
        [
          "3",
          "Documentation",
          "1",
          "45.00",
          "USD",
          "45.00"
        ]
      ],
      "termsLines": [
        "Rates are subject to carrier space and equipment availability.",
        "This quotation is a KingFisher layout preview (FRESA format)."
      ]
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "docTitle",
        "text": "DEBIT NOTE",
        "align": "end",
        "band": false
      },
      {
        "type": "twoColumn",
        "showBillTo": true,
        "rightMetaFrom": "metaRows"
      },
      {
        "type": "fieldGrid",
        "cols": 3
      },
      {
        "type": "chargeTable",
        "headerColor": "orange"
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
    "code": "LEFTOVER_PROFORMA_INVOICE_FORMAT_1",
    "formatNumber": 1,
    "name": "Proforma Invoice format 1",
    "paper": "A4",
    "rtl": false,
    "theme": {
      "primary": "#0F4D96",
      "accent": "#2488CA",
      "fill": "#EFFBFF",
      "panel": "#DBF3FF",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#9CD9FF",
      "ink": "#101010",
      "gray": "#656565",
      "white": "#FFFFFF"
    },
    "branding": {
      "company": "KingFisher Wings",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "inquiry@kingfishertec.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "QTN-19-0001",
      "invoiceDate": "28-JAN-19",
      "dueDate": "28-FEB-19",
      "quotationNo": "QTN-19-0001",
      "billToName": "AL NASER TRADING COMPANY LLC",
      "billToAddress": "30 AL MAKTHOOM BUILDING, SHARJAH UAE",
      "currency": "USD",
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
      "subtotal": "1,380.00",
      "tax": "0.00",
      "total": "1,380.00",
      "words": "USD One Thousand Three Hundred Eighty Only",
      "remarks": "Format-1",
      "fieldGrid": [
        {
          "k": "POL",
          "v": "CHENNAI, INDIA"
        },
        {
          "k": "POD",
          "v": "JEBEL ALI, UAE"
        },
        {
          "k": "Incoterm",
          "v": "FOB"
        },
        {
          "k": "Validity",
          "v": "30 Days"
        },
        {
          "k": "Layout",
          "v": "Format-1"
        }
      ],
      "tableHeaders": [
        "#",
        "Charge",
        "Qty",
        "Rate",
        "Currency",
        "Amount"
      ],
      "tableRows": [
        [
          "1",
          "Ocean Freight",
          "1",
          "1,250.00",
          "USD",
          "1,250.00"
        ],
        [
          "2",
          "THC Origin",
          "1",
          "85.00",
          "USD",
          "85.00"
        ],
        [
          "3",
          "Documentation",
          "1",
          "45.00",
          "USD",
          "45.00"
        ]
      ],
      "termsLines": [
        "Rates are subject to carrier space and equipment availability.",
        "This quotation is a KingFisher layout preview (FRESA format)."
      ],
      "letterBody": "Thank you for your enquiry. Please find our quotation below."
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "docTitle",
        "text": "PROFORMA INVOICE FORMAT 1",
        "align": "start",
        "band": false
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
        "type": "totalsOnly"
      },
      {
        "type": "termsBank"
      },
      {
        "type": "signatureRow"
      },
      {
        "type": "formatBadge"
      },
      {
        "type": "summaryHero"
      },
      {
        "type": "exportMetaStrip"
      },
      {
        "type": "agingSummary"
      },
      {
        "type": "wireBox"
      },
      {
        "type": "colorfulFooter"
      }
    ]
  },
  {
    "code": "LEFTOVER_SAUDI_TAX_INVOICE_ARABIC_JASPER",
    "formatNumber": 22,
    "name": "Saudi TAX Invoice –Arabic Jasper",
    "paper": "A4",
    "rtl": true,
    "theme": {
      "primary": "#0F4D96",
      "accent": "#1C8C96",
      "fill": "#EDF9FF",
      "panel": "#DAF2FF",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#9BD8FF",
      "ink": "#101010",
      "gray": "#656565",
      "white": "#FFFFFF"
    },
    "branding": {
      "company": "KingFisher Wings",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "inquiry@kingfishertec.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "QTN-19-0022",
      "invoiceDate": "28-JAN-19",
      "dueDate": "28-FEB-19",
      "quotationNo": "QTN-19-0022",
      "billToName": "AL NASER TRADING COMPANY LLC",
      "billToAddress": "30 AL MAKTHOOM BUILDING, SHARJAH UAE",
      "currency": "USD",
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
      "subtotal": "1,380.00",
      "tax": "0.00",
      "total": "1,380.00",
      "words": "USD One Thousand Three Hundred Eighty Only",
      "remarks": "Format-22",
      "fieldGrid": [
        {
          "k": "POL",
          "v": "CHENNAI, INDIA"
        },
        {
          "k": "POD",
          "v": "JEBEL ALI, UAE"
        },
        {
          "k": "Incoterm",
          "v": "FOB"
        },
        {
          "k": "Validity",
          "v": "30 Days"
        },
        {
          "k": "Layout",
          "v": "Format-22"
        }
      ],
      "tableHeaders": [
        "#",
        "Charge",
        "Qty",
        "Rate",
        "Currency",
        "Amount"
      ],
      "tableRows": [
        [
          "1",
          "Ocean Freight",
          "1",
          "1,250.00",
          "USD",
          "1,250.00"
        ],
        [
          "2",
          "THC Origin",
          "1",
          "85.00",
          "USD",
          "85.00"
        ],
        [
          "3",
          "Documentation",
          "1",
          "45.00",
          "USD",
          "45.00"
        ]
      ],
      "termsLines": [
        "Rates are subject to carrier space and equipment availability.",
        "This quotation is a KingFisher layout preview (FRESA format)."
      ],
      "docSubtitle": "Standard Invoice Arabic"
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "arabicHeader"
      },
      {
        "type": "docTitle",
        "text": "فاتورة / INVOICE",
        "align": "start",
        "band": false
      },
      {
        "type": "twoColumn",
        "showBillTo": true,
        "rightMetaFrom": "metaRows"
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
    "code": "LEFTOVER_SIMPLE_INVOICE_INDIA",
    "formatNumber": 23,
    "name": "Simple Invoice –India",
    "paper": "Letter",
    "rtl": false,
    "theme": {
      "primary": "#0F4D96",
      "accent": "#2889CA",
      "fill": "#F6F6F6",
      "panel": "#EDF2F6",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#9BD8FF",
      "ink": "#101010",
      "gray": "#656565",
      "white": "#FFFFFF"
    },
    "branding": {
      "company": "KingFisher Wings",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "inquiry@kingfishertec.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "QTN-19-0023",
      "invoiceDate": "28-JAN-19",
      "dueDate": "28-FEB-19",
      "quotationNo": "QTN-19-0023",
      "billToName": "AL NASER TRADING COMPANY LLC",
      "billToAddress": "30 AL MAKTHOOM BUILDING, SHARJAH UAE",
      "currency": "USD",
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
      "subtotal": "1,380.00",
      "tax": "0.00",
      "total": "1,380.00",
      "words": "USD One Thousand Three Hundred Eighty Only",
      "remarks": "Format-23",
      "fieldGrid": [
        {
          "k": "POL",
          "v": "CHENNAI, INDIA"
        },
        {
          "k": "POD",
          "v": "JEBEL ALI, UAE"
        },
        {
          "k": "Incoterm",
          "v": "FOB"
        },
        {
          "k": "Validity",
          "v": "30 Days"
        },
        {
          "k": "Layout",
          "v": "Format-23"
        },
        {
          "k": "Paper",
          "v": "Letter"
        }
      ],
      "tableHeaders": [
        "#",
        "Charge",
        "Qty",
        "Rate",
        "Currency",
        "Amount"
      ],
      "tableRows": [
        [
          "1",
          "Ocean Freight",
          "1",
          "1,250.00",
          "USD",
          "1,250.00"
        ],
        [
          "2",
          "THC Origin",
          "1",
          "85.00",
          "USD",
          "85.00"
        ],
        [
          "3",
          "Documentation",
          "1",
          "45.00",
          "USD",
          "45.00"
        ]
      ],
      "termsLines": [
        "Rates are subject to carrier space and equipment availability.",
        "This quotation is a KingFisher layout preview (FRESA format)."
      ],
      "docSubtitle": "Simple Invoice (India)"
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "docTitle",
        "text": "INVOICE",
        "align": "end",
        "band": false
      },
      {
        "type": "format6Totals"
      },
      {
        "type": "twoColumn",
        "showBillTo": true,
        "rightMetaFrom": "metaRows"
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
    "code": "LEFTOVER_SIMPLE_INVOICE_INDIA_JASPER",
    "formatNumber": 24,
    "name": "Simple Invoice –India Jasper",
    "paper": "A4",
    "rtl": false,
    "theme": {
      "primary": "#0F4D96",
      "accent": "#2788C9",
      "fill": "#F4F4F4",
      "panel": "#ECF1F5",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#9AD7FF",
      "ink": "#101010",
      "gray": "#656565",
      "white": "#FFFFFF"
    },
    "branding": {
      "company": "KingFisher Wings",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "inquiry@kingfishertec.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "QTN-19-0024",
      "invoiceDate": "28-JAN-19",
      "dueDate": "28-FEB-19",
      "quotationNo": "QTN-19-0024",
      "billToName": "AL NASER TRADING COMPANY LLC",
      "billToAddress": "30 AL MAKTHOOM BUILDING, SHARJAH UAE",
      "currency": "USD",
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
      "subtotal": "1,380.00",
      "tax": "0.00",
      "total": "1,380.00",
      "words": "USD One Thousand Three Hundred Eighty Only",
      "remarks": "Format-24",
      "fieldGrid": [
        {
          "k": "POL",
          "v": "CHENNAI, INDIA"
        },
        {
          "k": "POD",
          "v": "JEBEL ALI, UAE"
        },
        {
          "k": "Incoterm",
          "v": "FOB"
        },
        {
          "k": "Validity",
          "v": "30 Days"
        },
        {
          "k": "Layout",
          "v": "Format-24"
        }
      ],
      "tableHeaders": [
        "#",
        "Charge",
        "Qty",
        "Rate",
        "Currency",
        "Amount"
      ],
      "tableRows": [
        [
          "1",
          "Ocean Freight",
          "1",
          "1,250.00",
          "USD",
          "1,250.00"
        ],
        [
          "2",
          "THC Origin",
          "1",
          "85.00",
          "USD",
          "85.00"
        ],
        [
          "3",
          "Documentation",
          "1",
          "45.00",
          "USD",
          "45.00"
        ]
      ],
      "termsLines": [
        "Rates are subject to carrier space and equipment availability.",
        "This quotation is a KingFisher layout preview (FRESA format)."
      ],
      "letterBody": "Please confirm acceptance to proceed with booking.",
      "agingHeaders": [
        "Freight",
        "Local",
        "Docs",
        "Total"
      ],
      "agingRow": [
        "1,250.00",
        "85.00",
        "45.00",
        "1,380.00"
      ],
      "docSubtitle": "Simple Invoice (India)"
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "docTitle",
        "text": "INVOICE",
        "align": "center",
        "band": false
      },
      {
        "type": "format6Totals"
      },
      {
        "type": "twoColumn",
        "showBillTo": true,
        "rightMetaFrom": "metaRows"
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
        "type": "wordsAndTotal"
      },
      {
        "type": "termsBank"
      },
      {
        "type": "jobDescription"
      },
      {
        "type": "colorfulFooter"
      }
    ]
  },
  {
    "code": "LEFTOVER_SIMPLE_INVOICE_INDIA_WITH_OS",
    "formatNumber": 25,
    "name": "Simple Invoice –India with O/S",
    "paper": "A4",
    "rtl": false,
    "theme": {
      "primary": "#0F4D96",
      "accent": "#2788C9",
      "fill": "#F2F2F2",
      "panel": "#EAEFF3",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#9AD7FF",
      "ink": "#101010",
      "gray": "#656565",
      "white": "#FFFFFF"
    },
    "branding": {
      "company": "KingFisher Wings",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "inquiry@kingfishertec.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "QTN-19-0025",
      "invoiceDate": "28-JAN-19",
      "dueDate": "28-FEB-19",
      "quotationNo": "QTN-19-0025",
      "billToName": "AL NASER TRADING COMPANY LLC",
      "billToAddress": "30 AL MAKTHOOM BUILDING, SHARJAH UAE",
      "currency": "USD",
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
      "subtotal": "1,380.00",
      "tax": "0.00",
      "total": "1,380.00",
      "words": "USD One Thousand Three Hundred Eighty Only",
      "remarks": "Format-25",
      "fieldGrid": [
        {
          "k": "POL",
          "v": "CHENNAI, INDIA"
        },
        {
          "k": "POD",
          "v": "JEBEL ALI, UAE"
        },
        {
          "k": "Incoterm",
          "v": "FOB"
        },
        {
          "k": "Validity",
          "v": "30 Days"
        },
        {
          "k": "Layout",
          "v": "Format-25"
        }
      ],
      "tableHeaders": [
        "#",
        "Charge",
        "Qty",
        "Rate",
        "Currency",
        "Amount"
      ],
      "tableRows": [
        [
          "1",
          "Ocean Freight",
          "1",
          "1,250.00",
          "USD",
          "1,250.00"
        ],
        [
          "2",
          "THC Origin",
          "1",
          "85.00",
          "USD",
          "85.00"
        ],
        [
          "3",
          "Documentation",
          "1",
          "45.00",
          "USD",
          "45.00"
        ]
      ],
      "termsLines": [
        "Rates are subject to carrier space and equipment availability.",
        "This quotation is a KingFisher layout preview (FRESA format)."
      ],
      "docSubtitle": "Simple Invoice (India)"
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "docTitle",
        "text": "INVOICE",
        "align": "start",
        "band": false
      },
      {
        "type": "format6Totals"
      },
      {
        "type": "twoColumn",
        "showBillTo": true,
        "rightMetaFrom": "metaRows"
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
        "type": "wordsAndTotal"
      },
      {
        "type": "termsBank"
      },
      {
        "type": "agingSummary"
      },
      {
        "type": "colorfulFooter"
      }
    ]
  },
  {
    "code": "LEFTOVER_SIMPLE_INVOICE_JASPER",
    "formatNumber": 26,
    "name": "Simple Invoice –Jasper",
    "paper": "A4",
    "rtl": false,
    "theme": {
      "primary": "#0F4D96",
      "accent": "#2687C8",
      "fill": "#F0F0F0",
      "panel": "#E9EEF2",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#99D6FE",
      "ink": "#101010",
      "gray": "#656565",
      "white": "#FFFFFF"
    },
    "branding": {
      "company": "KingFisher Wings",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "inquiry@kingfishertec.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "QTN-19-0026",
      "invoiceDate": "28-JAN-19",
      "dueDate": "28-FEB-19",
      "quotationNo": "QTN-19-0026",
      "billToName": "AL NASER TRADING COMPANY LLC",
      "billToAddress": "30 AL MAKTHOOM BUILDING, SHARJAH UAE",
      "currency": "USD",
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
      "subtotal": "1,380.00",
      "tax": "0.00",
      "total": "1,380.00",
      "words": "USD One Thousand Three Hundred Eighty Only",
      "remarks": "Format-26",
      "fieldGrid": [
        {
          "k": "POL",
          "v": "CHENNAI, INDIA"
        },
        {
          "k": "POD",
          "v": "JEBEL ALI, UAE"
        },
        {
          "k": "Incoterm",
          "v": "FOB"
        },
        {
          "k": "Validity",
          "v": "30 Days"
        },
        {
          "k": "Layout",
          "v": "Format-26"
        }
      ],
      "tableHeaders": [
        "#",
        "Charge",
        "Qty",
        "Rate",
        "Currency",
        "Amount"
      ],
      "tableRows": [
        [
          "1",
          "Ocean Freight",
          "1",
          "1,250.00",
          "USD",
          "1,250.00"
        ],
        [
          "2",
          "THC Origin",
          "1",
          "85.00",
          "USD",
          "85.00"
        ],
        [
          "3",
          "Documentation",
          "1",
          "45.00",
          "USD",
          "45.00"
        ]
      ],
      "termsLines": [
        "Rates are subject to carrier space and equipment availability.",
        "This quotation is a KingFisher layout preview (FRESA format)."
      ],
      "letterBody": "Thank you for your enquiry. Please find our quotation below.",
      "docSubtitle": "Simple Invoice"
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "docTitle",
        "text": "INVOICE",
        "align": "end",
        "band": false
      },
      {
        "type": "format6Totals"
      },
      {
        "type": "twoColumn",
        "showBillTo": true,
        "rightMetaFrom": "metaRows"
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
        "type": "wordsAndTotal"
      },
      {
        "type": "termsBank"
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
    "code": "LEFTOVER_SIMPLE_INVOICE_US_JASPER",
    "formatNumber": 27,
    "name": "Simple Invoice –US Jasper",
    "paper": "A4",
    "rtl": false,
    "theme": {
      "primary": "#0F4D96",
      "accent": "#2586C7",
      "fill": "#EEEEEE",
      "panel": "#E8EDF1",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#99D6FE",
      "ink": "#101010",
      "gray": "#656565",
      "white": "#FFFFFF"
    },
    "branding": {
      "company": "KingFisher Wings",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "inquiry@kingfishertec.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "QTN-19-0027",
      "invoiceDate": "28-JAN-19",
      "dueDate": "28-FEB-19",
      "quotationNo": "QTN-19-0027",
      "billToName": "AL NASER TRADING COMPANY LLC",
      "billToAddress": "30 AL MAKTHOOM BUILDING, SHARJAH UAE",
      "currency": "USD",
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
      "subtotal": "1,380.00",
      "tax": "0.00",
      "total": "1,380.00",
      "words": "USD One Thousand Three Hundred Eighty Only",
      "remarks": "Format-27",
      "fieldGrid": [
        {
          "k": "POL",
          "v": "CHENNAI, INDIA"
        },
        {
          "k": "POD",
          "v": "JEBEL ALI, UAE"
        },
        {
          "k": "Incoterm",
          "v": "FOB"
        },
        {
          "k": "Validity",
          "v": "30 Days"
        },
        {
          "k": "Layout",
          "v": "Format-27"
        }
      ],
      "tableHeaders": [
        "#",
        "Charge",
        "Qty",
        "Rate",
        "Currency",
        "Amount"
      ],
      "tableRows": [
        [
          "1",
          "Ocean Freight",
          "1",
          "1,250.00",
          "USD",
          "1,250.00"
        ],
        [
          "2",
          "THC Origin",
          "1",
          "85.00",
          "USD",
          "85.00"
        ],
        [
          "3",
          "Documentation",
          "1",
          "45.00",
          "USD",
          "45.00"
        ]
      ],
      "termsLines": [
        "Rates are subject to carrier space and equipment availability.",
        "This quotation is a KingFisher layout preview (FRESA format)."
      ],
      "docSubtitle": "Simple Invoice"
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "docTitle",
        "text": "INVOICE",
        "align": "center",
        "band": false
      },
      {
        "type": "format6Totals"
      },
      {
        "type": "twoColumn",
        "showBillTo": true,
        "rightMetaFrom": "metaRows"
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
        "type": "wordsAndTotal"
      },
      {
        "type": "termsBank"
      },
      {
        "type": "jobDescription"
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
    "code": "LEFTOVER_SIMPLE_INVOICE_WITH_OS",
    "formatNumber": 28,
    "name": "Simple Invoice with O/S",
    "paper": "Letter",
    "rtl": false,
    "theme": {
      "primary": "#0F4D96",
      "accent": "#2586C7",
      "fill": "#ECECEC",
      "panel": "#E6EBEF",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#98D5FD",
      "ink": "#101010",
      "gray": "#656565",
      "white": "#FFFFFF"
    },
    "branding": {
      "company": "KingFisher Wings",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "inquiry@kingfishertec.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "QTN-19-0028",
      "invoiceDate": "28-JAN-19",
      "dueDate": "28-FEB-19",
      "quotationNo": "QTN-19-0028",
      "billToName": "AL NASER TRADING COMPANY LLC",
      "billToAddress": "30 AL MAKTHOOM BUILDING, SHARJAH UAE",
      "currency": "USD",
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
      "subtotal": "1,380.00",
      "tax": "0.00",
      "total": "1,380.00",
      "words": "USD One Thousand Three Hundred Eighty Only",
      "remarks": "Format-28",
      "fieldGrid": [
        {
          "k": "POL",
          "v": "CHENNAI, INDIA"
        },
        {
          "k": "POD",
          "v": "JEBEL ALI, UAE"
        },
        {
          "k": "Incoterm",
          "v": "FOB"
        },
        {
          "k": "Validity",
          "v": "30 Days"
        },
        {
          "k": "Layout",
          "v": "Format-28"
        },
        {
          "k": "Paper",
          "v": "Letter"
        }
      ],
      "tableHeaders": [
        "#",
        "Charge",
        "Qty",
        "Rate",
        "Currency",
        "Amount"
      ],
      "tableRows": [
        [
          "1",
          "Ocean Freight",
          "1",
          "1,250.00",
          "USD",
          "1,250.00"
        ],
        [
          "2",
          "THC Origin",
          "1",
          "85.00",
          "USD",
          "85.00"
        ],
        [
          "3",
          "Documentation",
          "1",
          "45.00",
          "USD",
          "45.00"
        ]
      ],
      "termsLines": [
        "Rates are subject to carrier space and equipment availability.",
        "This quotation is a KingFisher layout preview (FRESA format)."
      ],
      "docSubtitle": "Simple Invoice"
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "docTitle",
        "text": "INVOICE",
        "align": "start",
        "band": false
      },
      {
        "type": "format6Totals"
      },
      {
        "type": "twoColumn",
        "showBillTo": true,
        "rightMetaFrom": "metaRows"
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
        "type": "wordsAndTotal"
      },
      {
        "type": "termsBank"
      },
      {
        "type": "agingSummary"
      },
      {
        "type": "wireBox"
      },
      {
        "type": "colorfulFooter"
      }
    ]
  },
  {
    "code": "LEFTOVER_SIMPLE_INVOICEVAT",
    "formatNumber": 29,
    "name": "Simple Invoice(VAT)",
    "paper": "A4",
    "rtl": false,
    "theme": {
      "primary": "#0F4D96",
      "accent": "#2A8BCC",
      "fill": "#FBFBFB",
      "panel": "#F1F6FA",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#9CD9FF",
      "ink": "#101010",
      "gray": "#656565",
      "white": "#FFFFFF"
    },
    "branding": {
      "company": "KingFisher Wings",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "inquiry@kingfishertec.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "QTN-19-0029",
      "invoiceDate": "28-JAN-19",
      "dueDate": "28-FEB-19",
      "quotationNo": "QTN-19-0029",
      "billToName": "AL NASER TRADING COMPANY LLC",
      "billToAddress": "30 AL MAKTHOOM BUILDING, SHARJAH UAE",
      "currency": "USD",
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
      "subtotal": "1,380.00",
      "tax": "0.00",
      "total": "1,380.00",
      "words": "USD One Thousand Three Hundred Eighty Only",
      "remarks": "Format-29",
      "fieldGrid": [
        {
          "k": "POL",
          "v": "CHENNAI, INDIA"
        },
        {
          "k": "POD",
          "v": "JEBEL ALI, UAE"
        },
        {
          "k": "Incoterm",
          "v": "FOB"
        },
        {
          "k": "Validity",
          "v": "30 Days"
        },
        {
          "k": "Layout",
          "v": "Format-29"
        }
      ],
      "tableHeaders": [
        "#",
        "Charge",
        "Qty",
        "Rate",
        "Currency",
        "Amount"
      ],
      "tableRows": [
        [
          "1",
          "Ocean Freight",
          "1",
          "1,250.00",
          "USD",
          "1,250.00"
        ],
        [
          "2",
          "THC Origin",
          "1",
          "85.00",
          "USD",
          "85.00"
        ],
        [
          "3",
          "Documentation",
          "1",
          "45.00",
          "USD",
          "45.00"
        ]
      ],
      "termsLines": [
        "Rates are subject to carrier space and equipment availability.",
        "This quotation is a KingFisher layout preview (FRESA format)."
      ],
      "letterBody": "Please confirm acceptance to proceed with booking.",
      "agingHeaders": [
        "Freight",
        "Local",
        "Docs",
        "Total"
      ],
      "agingRow": [
        "1,250.00",
        "85.00",
        "45.00",
        "1,380.00"
      ],
      "docSubtitle": "Simple Invoice"
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "docTitle",
        "text": "INVOICE",
        "align": "end",
        "band": false
      },
      {
        "type": "format6Totals"
      },
      {
        "type": "twoColumn",
        "showBillTo": true,
        "rightMetaFrom": "metaRows"
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
        "type": "wordsAndTotal"
      },
      {
        "type": "termsBank"
      },
      {
        "type": "letterBody"
      },
      {
        "type": "summaryHero"
      },
      {
        "type": "colorfulFooter"
      }
    ]
  },
  {
    "code": "LEFTOVER_STANDARD_INVOICE_LAND",
    "formatNumber": 30,
    "name": "Standard Invoice -Land",
    "paper": "A4",
    "rtl": false,
    "theme": {
      "primary": "#0F4D96",
      "accent": "#2488CA",
      "fill": "#F6FFFF",
      "panel": "#ECF8FF",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#9CD9FF",
      "ink": "#101010",
      "gray": "#656565",
      "white": "#FFFFFF"
    },
    "branding": {
      "company": "KingFisher Wings",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "inquiry@kingfishertec.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "QTN-19-0030",
      "invoiceDate": "28-JAN-19",
      "dueDate": "28-FEB-19",
      "quotationNo": "QTN-19-0030",
      "billToName": "AL NASER TRADING COMPANY LLC",
      "billToAddress": "30 AL MAKTHOOM BUILDING, SHARJAH UAE",
      "currency": "USD",
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
      "subtotal": "1,380.00",
      "tax": "0.00",
      "total": "1,380.00",
      "words": "USD One Thousand Three Hundred Eighty Only",
      "remarks": "Format-30",
      "fieldGrid": [
        {
          "k": "POL",
          "v": "CHENNAI, INDIA"
        },
        {
          "k": "POD",
          "v": "JEBEL ALI, UAE"
        },
        {
          "k": "Incoterm",
          "v": "FOB"
        },
        {
          "k": "Validity",
          "v": "30 Days"
        },
        {
          "k": "Layout",
          "v": "Format-30"
        }
      ],
      "tableHeaders": [
        "#",
        "Charge",
        "Qty",
        "Rate",
        "Currency",
        "Amount"
      ],
      "tableRows": [
        [
          "1",
          "Ocean Freight",
          "1",
          "1,250.00",
          "USD",
          "1,250.00"
        ],
        [
          "2",
          "THC Origin",
          "1",
          "85.00",
          "USD",
          "85.00"
        ],
        [
          "3",
          "Documentation",
          "1",
          "45.00",
          "USD",
          "45.00"
        ]
      ],
      "termsLines": [
        "Rates are subject to carrier space and equipment availability.",
        "This quotation is a KingFisher layout preview (FRESA format)."
      ]
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "docTitle",
        "text": "STANDARD INVOICE -LAND",
        "align": "center",
        "band": false
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
        "type": "subtotalBar",
        "variant": "tax"
      },
      {
        "type": "formatBadge"
      },
      {
        "type": "summaryHero"
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
    "code": "LEFTOVER_STANDARD_INVOICE_JASPER",
    "formatNumber": 31,
    "name": "Standard Invoice –Jasper",
    "paper": "A4",
    "rtl": false,
    "theme": {
      "primary": "#0F4D96",
      "accent": "#2387C9",
      "fill": "#ECF8FF",
      "panel": "#D9F1FE",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#9BD8FF",
      "ink": "#101010",
      "gray": "#656565",
      "white": "#FFFFFF"
    },
    "branding": {
      "company": "KingFisher Wings",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "inquiry@kingfishertec.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "QTN-19-0031",
      "invoiceDate": "28-JAN-19",
      "dueDate": "28-FEB-19",
      "quotationNo": "QTN-19-0031",
      "billToName": "AL NASER TRADING COMPANY LLC",
      "billToAddress": "30 AL MAKTHOOM BUILDING, SHARJAH UAE",
      "currency": "USD",
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
      "subtotal": "1,380.00",
      "tax": "0.00",
      "total": "1,380.00",
      "words": "USD One Thousand Three Hundred Eighty Only",
      "remarks": "Format-31",
      "fieldGrid": [
        {
          "k": "POL",
          "v": "CHENNAI, INDIA"
        },
        {
          "k": "POD",
          "v": "JEBEL ALI, UAE"
        },
        {
          "k": "Incoterm",
          "v": "FOB"
        },
        {
          "k": "Validity",
          "v": "30 Days"
        },
        {
          "k": "Layout",
          "v": "Format-31"
        }
      ],
      "tableHeaders": [
        "#",
        "Charge",
        "Qty",
        "Rate",
        "Currency",
        "Amount"
      ],
      "tableRows": [
        [
          "1",
          "Ocean Freight",
          "1",
          "1,250.00",
          "USD",
          "1,250.00"
        ],
        [
          "2",
          "THC Origin",
          "1",
          "85.00",
          "USD",
          "85.00"
        ],
        [
          "3",
          "Documentation",
          "1",
          "45.00",
          "USD",
          "45.00"
        ]
      ],
      "termsLines": [
        "Rates are subject to carrier space and equipment availability.",
        "This quotation is a KingFisher layout preview (FRESA format)."
      ],
      "letterBody": "Thank you for your enquiry. Please find our quotation below."
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "docTitle",
        "text": "STANDARD INVOICE –JASPER",
        "align": "start",
        "band": false
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
        "type": "totalsOnly"
      },
      {
        "type": "termsBank"
      },
      {
        "type": "signatureRow"
      },
      {
        "type": "formatBadge"
      },
      {
        "type": "exportMetaStrip"
      },
      {
        "type": "agingSummary"
      },
      {
        "type": "wireBox"
      },
      {
        "type": "jobDescription"
      },
      {
        "type": "colorfulFooter"
      }
    ]
  },
  {
    "code": "LEFTOVER_STANDARD_INVOICE_JASPER_FORMAT10",
    "formatNumber": 10,
    "name": "Standard Invoice –Jasper format10",
    "paper": "A4",
    "rtl": false,
    "theme": {
      "primary": "#0F4D96",
      "accent": "#2387C9",
      "fill": "#EAF6FE",
      "panel": "#D7EFFC",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#9BD8FF",
      "ink": "#101010",
      "gray": "#656565",
      "white": "#FFFFFF"
    },
    "branding": {
      "company": "KingFisher Wings",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "inquiry@kingfishertec.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "QTN-19-0010",
      "invoiceDate": "28-JAN-19",
      "dueDate": "28-FEB-19",
      "quotationNo": "QTN-19-0010",
      "billToName": "AL NASER TRADING COMPANY LLC",
      "billToAddress": "30 AL MAKTHOOM BUILDING, SHARJAH UAE",
      "currency": "USD",
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
      "subtotal": "1,380.00",
      "tax": "0.00",
      "total": "1,380.00",
      "words": "USD One Thousand Three Hundred Eighty Only",
      "remarks": "Format-10",
      "fieldGrid": [
        {
          "k": "POL",
          "v": "CHENNAI, INDIA"
        },
        {
          "k": "POD",
          "v": "JEBEL ALI, UAE"
        },
        {
          "k": "Incoterm",
          "v": "FOB"
        },
        {
          "k": "Validity",
          "v": "30 Days"
        },
        {
          "k": "Layout",
          "v": "Format-10"
        }
      ],
      "tableHeaders": [
        "#",
        "Charge",
        "Qty",
        "Rate",
        "Currency",
        "Amount"
      ],
      "tableRows": [
        [
          "1",
          "Ocean Freight",
          "1",
          "1,250.00",
          "USD",
          "1,250.00"
        ],
        [
          "2",
          "THC Origin",
          "1",
          "85.00",
          "USD",
          "85.00"
        ],
        [
          "3",
          "Documentation",
          "1",
          "45.00",
          "USD",
          "45.00"
        ]
      ],
      "termsLines": [
        "Rates are subject to carrier space and equipment availability.",
        "This quotation is a KingFisher layout preview (FRESA format)."
      ]
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "docTitle",
        "text": "STANDARD INVOICE –JASPER FORMAT10",
        "align": "start",
        "band": false
      },
      {
        "type": "partyTriple"
      },
      {
        "type": "fieldGrid",
        "cols": 3
      },
      {
        "type": "chargeTable",
        "headerColor": "accent"
      },
      {
        "type": "totalsOnly"
      },
      {
        "type": "termsBank"
      },
      {
        "type": "signatureRow"
      },
      {
        "type": "formatBadge"
      },
      {
        "type": "letterBody"
      },
      {
        "type": "summaryHero"
      },
      {
        "type": "outstandingTable"
      },
      {
        "type": "taxAmountBox"
      },
      {
        "type": "colorfulFooter"
      }
    ]
  },
  {
    "code": "LEFTOVER_STANDARD_INVOICE_JASPER_FORMAT12_LETTERHEAD",
    "formatNumber": 12,
    "name": "Standard Invoice –Jasper format12 Letterhead",
    "paper": "Letter",
    "rtl": false,
    "theme": {
      "primary": "#0F4D96",
      "accent": "#2286C8",
      "fill": "#E8F4FC",
      "panel": "#D6EEFB",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#9AD7FF",
      "ink": "#101010",
      "gray": "#656565",
      "white": "#FFFFFF"
    },
    "branding": {
      "company": "KingFisher Wings",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "inquiry@kingfishertec.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "QTN-19-0012",
      "invoiceDate": "28-JAN-19",
      "dueDate": "28-FEB-19",
      "quotationNo": "QTN-19-0012",
      "billToName": "AL NASER TRADING COMPANY LLC",
      "billToAddress": "30 AL MAKTHOOM BUILDING, SHARJAH UAE",
      "currency": "USD",
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
      "subtotal": "1,380.00",
      "tax": "0.00",
      "total": "1,380.00",
      "words": "USD One Thousand Three Hundred Eighty Only",
      "remarks": "Format-12",
      "fieldGrid": [
        {
          "k": "POL",
          "v": "CHENNAI, INDIA"
        },
        {
          "k": "POD",
          "v": "JEBEL ALI, UAE"
        },
        {
          "k": "Incoterm",
          "v": "FOB"
        },
        {
          "k": "Validity",
          "v": "30 Days"
        },
        {
          "k": "Layout",
          "v": "Format-12"
        }
      ],
      "tableHeaders": [
        "#",
        "Charge",
        "Qty",
        "Rate",
        "Currency",
        "Amount"
      ],
      "tableRows": [
        [
          "1",
          "Ocean Freight",
          "1",
          "1,250.00",
          "USD",
          "1,250.00"
        ],
        [
          "2",
          "THC Origin",
          "1",
          "85.00",
          "USD",
          "85.00"
        ],
        [
          "3",
          "Documentation",
          "1",
          "45.00",
          "USD",
          "45.00"
        ]
      ],
      "termsLines": [
        "Rates are subject to carrier space and equipment availability.",
        "This quotation is a KingFisher layout preview (FRESA format)."
      ]
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "docTitle",
        "text": "STANDARD INVOICE –JASPER FORMAT12 LETTERHEAD",
        "align": "center",
        "band": true
      },
      {
        "type": "partyTriple"
      },
      {
        "type": "formatBadge"
      },
      {
        "type": "summaryHero"
      },
      {
        "type": "exportMetaStrip"
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
        "type": "signatureRow"
      },
      {
        "type": "colorfulFooter"
      }
    ]
  },
  {
    "code": "LEFTOVER_STANDARD_INVOICE_JASPER_FORMAT13",
    "formatNumber": 13,
    "name": "Standard Invoice –Jasper format13",
    "paper": "Letter",
    "rtl": false,
    "theme": {
      "primary": "#0F4D96",
      "accent": "#2185C7",
      "fill": "#E6F2FA",
      "panel": "#D5EDFA",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#9AD7FF",
      "ink": "#101010",
      "gray": "#656565",
      "white": "#FFFFFF"
    },
    "branding": {
      "company": "KingFisher Wings",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "inquiry@kingfishertec.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "QTN-19-0013",
      "invoiceDate": "28-JAN-19",
      "dueDate": "28-FEB-19",
      "quotationNo": "QTN-19-0013",
      "billToName": "AL NASER TRADING COMPANY LLC",
      "billToAddress": "30 AL MAKTHOOM BUILDING, SHARJAH UAE",
      "currency": "USD",
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
      "subtotal": "1,380.00",
      "tax": "0.00",
      "total": "1,380.00",
      "words": "USD One Thousand Three Hundred Eighty Only",
      "remarks": "Format-13",
      "fieldGrid": [
        {
          "k": "POL",
          "v": "CHENNAI, INDIA"
        },
        {
          "k": "POD",
          "v": "JEBEL ALI, UAE"
        },
        {
          "k": "Incoterm",
          "v": "FOB"
        },
        {
          "k": "Validity",
          "v": "30 Days"
        },
        {
          "k": "Layout",
          "v": "Format-13"
        },
        {
          "k": "Paper",
          "v": "Letter"
        }
      ],
      "tableHeaders": [
        "#",
        "Charge",
        "Qty",
        "Rate",
        "Currency",
        "Amount"
      ],
      "tableRows": [
        [
          "1",
          "Ocean Freight",
          "1",
          "1,250.00",
          "USD",
          "1,250.00"
        ],
        [
          "2",
          "THC Origin",
          "1",
          "85.00",
          "USD",
          "85.00"
        ],
        [
          "3",
          "Documentation",
          "1",
          "45.00",
          "USD",
          "45.00"
        ]
      ],
      "termsLines": [
        "Rates are subject to carrier space and equipment availability.",
        "This quotation is a KingFisher layout preview (FRESA format)."
      ]
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "docTitle",
        "text": "STANDARD INVOICE –JASPER FORMAT13",
        "align": "start",
        "band": true
      },
      {
        "type": "partyTriple"
      },
      {
        "type": "wireBox"
      },
      {
        "type": "outstandingTable"
      },
      {
        "type": "shipmentDetails",
        "showIrn": true,
        "showQuotation": true
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
    "code": "LEFTOVER_STANDARD_INVOICE_JASPER_FORMAT14_QR_CODE",
    "formatNumber": 14,
    "name": "Standard Invoice –Jasper format14 QR code",
    "paper": "A4",
    "rtl": false,
    "theme": {
      "primary": "#0F4D96",
      "accent": "#2185C7",
      "fill": "#E4F0F8",
      "panel": "#D3EBF8",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#99D6FE",
      "ink": "#101010",
      "gray": "#656565",
      "white": "#FFFFFF"
    },
    "branding": {
      "company": "KingFisher Wings",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "inquiry@kingfishertec.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "QTN-19-0014",
      "invoiceDate": "28-JAN-19",
      "dueDate": "28-FEB-19",
      "quotationNo": "QTN-19-0014",
      "billToName": "AL NASER TRADING COMPANY LLC",
      "billToAddress": "30 AL MAKTHOOM BUILDING, SHARJAH UAE",
      "currency": "USD",
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
      "subtotal": "1,380.00",
      "tax": "0.00",
      "total": "1,380.00",
      "words": "USD One Thousand Three Hundred Eighty Only",
      "remarks": "Format-14",
      "fieldGrid": [
        {
          "k": "POL",
          "v": "CHENNAI, INDIA"
        },
        {
          "k": "POD",
          "v": "JEBEL ALI, UAE"
        },
        {
          "k": "Incoterm",
          "v": "FOB"
        },
        {
          "k": "Validity",
          "v": "30 Days"
        },
        {
          "k": "Layout",
          "v": "Format-14"
        }
      ],
      "tableHeaders": [
        "#",
        "Charge",
        "Qty",
        "Rate",
        "Currency",
        "Amount"
      ],
      "tableRows": [
        [
          "1",
          "Ocean Freight",
          "1",
          "1,250.00",
          "USD",
          "1,250.00"
        ],
        [
          "2",
          "THC Origin",
          "1",
          "85.00",
          "USD",
          "85.00"
        ],
        [
          "3",
          "Documentation",
          "1",
          "45.00",
          "USD",
          "45.00"
        ]
      ],
      "termsLines": [
        "Rates are subject to carrier space and equipment availability.",
        "This quotation is a KingFisher layout preview (FRESA format)."
      ],
      "letterBody": "Please confirm acceptance to proceed with booking.",
      "agingHeaders": [
        "Freight",
        "Local",
        "Docs",
        "Total"
      ],
      "agingRow": [
        "1,250.00",
        "85.00",
        "45.00",
        "1,380.00"
      ]
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "docTitle",
        "text": "STANDARD INVOICE –JASPER FORMAT14 QR CODE",
        "align": "end",
        "band": true
      },
      {
        "type": "partyTriple"
      },
      {
        "type": "landRoute"
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
        "type": "summaryHero"
      },
      {
        "type": "containerStrip"
      },
      {
        "type": "wireBox"
      },
      {
        "type": "outstandingTable"
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
    "code": "LEFTOVER_STANDARD_INVOICE_JASPER_FORMAT15",
    "formatNumber": 15,
    "name": "Standard Invoice –Jasper format15",
    "paper": "A4",
    "rtl": false,
    "theme": {
      "primary": "#0F4D96",
      "accent": "#2084C6",
      "fill": "#E2EEF6",
      "panel": "#D2EAF7",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#99D6FE",
      "ink": "#101010",
      "gray": "#656565",
      "white": "#FFFFFF"
    },
    "branding": {
      "company": "KingFisher Wings",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "inquiry@kingfishertec.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "QTN-19-0015",
      "invoiceDate": "28-JAN-19",
      "dueDate": "28-FEB-19",
      "quotationNo": "QTN-19-0015",
      "billToName": "AL NASER TRADING COMPANY LLC",
      "billToAddress": "30 AL MAKTHOOM BUILDING, SHARJAH UAE",
      "currency": "USD",
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
      "subtotal": "1,380.00",
      "tax": "0.00",
      "total": "1,380.00",
      "words": "USD One Thousand Three Hundred Eighty Only",
      "remarks": "Format-15",
      "fieldGrid": [
        {
          "k": "POL",
          "v": "CHENNAI, INDIA"
        },
        {
          "k": "POD",
          "v": "JEBEL ALI, UAE"
        },
        {
          "k": "Incoterm",
          "v": "FOB"
        },
        {
          "k": "Validity",
          "v": "30 Days"
        },
        {
          "k": "Layout",
          "v": "Format-15"
        }
      ],
      "tableHeaders": [
        "#",
        "Charge",
        "Qty",
        "Rate",
        "Currency",
        "Amount"
      ],
      "tableRows": [
        [
          "1",
          "Ocean Freight",
          "1",
          "1,250.00",
          "USD",
          "1,250.00"
        ],
        [
          "2",
          "THC Origin",
          "1",
          "85.00",
          "USD",
          "85.00"
        ],
        [
          "3",
          "Documentation",
          "1",
          "45.00",
          "USD",
          "45.00"
        ]
      ],
      "termsLines": [
        "Rates are subject to carrier space and equipment availability.",
        "This quotation is a KingFisher layout preview (FRESA format)."
      ]
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "docTitle",
        "text": "STANDARD INVOICE –JASPER FORMAT15",
        "align": "center",
        "band": true
      },
      {
        "type": "partyTriple"
      },
      {
        "type": "formatBadge"
      },
      {
        "type": "exportMetaStrip"
      },
      {
        "type": "agingSummary"
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
        "type": "signatureRow"
      },
      {
        "type": "colorfulFooter"
      }
    ]
  },
  {
    "code": "LEFTOVER_STANDARD_INVOICE_JASPER_FORMAT16",
    "formatNumber": 16,
    "name": "Standard Invoice –Jasper format16",
    "paper": "A4",
    "rtl": false,
    "theme": {
      "primary": "#0F4D96",
      "accent": "#1F83C5",
      "fill": "#E0ECF4",
      "panel": "#D0E8F5",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#98D5FD",
      "ink": "#101010",
      "gray": "#656565",
      "white": "#FFFFFF"
    },
    "branding": {
      "company": "KingFisher Wings",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "inquiry@kingfishertec.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "QTN-19-0016",
      "invoiceDate": "28-JAN-19",
      "dueDate": "28-FEB-19",
      "quotationNo": "QTN-19-0016",
      "billToName": "AL NASER TRADING COMPANY LLC",
      "billToAddress": "30 AL MAKTHOOM BUILDING, SHARJAH UAE",
      "currency": "USD",
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
      "subtotal": "1,380.00",
      "tax": "0.00",
      "total": "1,380.00",
      "words": "USD One Thousand Three Hundred Eighty Only",
      "remarks": "Format-16",
      "fieldGrid": [
        {
          "k": "POL",
          "v": "CHENNAI, INDIA"
        },
        {
          "k": "POD",
          "v": "JEBEL ALI, UAE"
        },
        {
          "k": "Incoterm",
          "v": "FOB"
        },
        {
          "k": "Validity",
          "v": "30 Days"
        },
        {
          "k": "Layout",
          "v": "Format-16"
        }
      ],
      "tableHeaders": [
        "#",
        "Charge",
        "Qty",
        "Rate",
        "Currency",
        "Amount"
      ],
      "tableRows": [
        [
          "1",
          "Ocean Freight",
          "1",
          "1,250.00",
          "USD",
          "1,250.00"
        ],
        [
          "2",
          "THC Origin",
          "1",
          "85.00",
          "USD",
          "85.00"
        ],
        [
          "3",
          "Documentation",
          "1",
          "45.00",
          "USD",
          "45.00"
        ]
      ],
      "termsLines": [
        "Rates are subject to carrier space and equipment availability.",
        "This quotation is a KingFisher layout preview (FRESA format)."
      ],
      "letterBody": "Thank you for your enquiry. Please find our quotation below."
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "docTitle",
        "text": "STANDARD INVOICE –JASPER FORMAT16",
        "align": "start",
        "band": true
      },
      {
        "type": "partyTriple"
      },
      {
        "type": "summaryHero"
      },
      {
        "type": "exportMetaStrip"
      },
      {
        "type": "containerStrip"
      },
      {
        "type": "agingSummary"
      },
      {
        "type": "wireBox"
      },
      {
        "type": "shipmentDetails",
        "showIrn": true,
        "showQuotation": true
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
    "code": "LEFTOVER_STANDARD_INVOICE_JASPER_FORMAT17_WITH_HOLDING_TAX",
    "formatNumber": 17,
    "name": "Standard Invoice –Jasper format17 (With Holding Tax)",
    "paper": "A4",
    "rtl": false,
    "theme": {
      "primary": "#0F4D96",
      "accent": "#2488CA",
      "fill": "#EFFBFF",
      "panel": "#DBF3FF",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#9CD9FF",
      "ink": "#101010",
      "gray": "#656565",
      "white": "#FFFFFF"
    },
    "branding": {
      "company": "KingFisher Wings",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "inquiry@kingfishertec.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "QTN-19-0017",
      "invoiceDate": "28-JAN-19",
      "dueDate": "28-FEB-19",
      "quotationNo": "QTN-19-0017",
      "billToName": "AL NASER TRADING COMPANY LLC",
      "billToAddress": "30 AL MAKTHOOM BUILDING, SHARJAH UAE",
      "currency": "USD",
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
      "subtotal": "1,380.00",
      "tax": "0.00",
      "total": "1,380.00",
      "words": "USD One Thousand Three Hundred Eighty Only",
      "remarks": "Format-17",
      "fieldGrid": [
        {
          "k": "POL",
          "v": "CHENNAI, INDIA"
        },
        {
          "k": "POD",
          "v": "JEBEL ALI, UAE"
        },
        {
          "k": "Incoterm",
          "v": "FOB"
        },
        {
          "k": "Validity",
          "v": "30 Days"
        },
        {
          "k": "Layout",
          "v": "Format-17"
        }
      ],
      "tableHeaders": [
        "#",
        "Charge",
        "Qty",
        "Rate",
        "Currency",
        "Amount"
      ],
      "tableRows": [
        [
          "1",
          "Ocean Freight",
          "1",
          "1,250.00",
          "USD",
          "1,250.00"
        ],
        [
          "2",
          "THC Origin",
          "1",
          "85.00",
          "USD",
          "85.00"
        ],
        [
          "3",
          "Documentation",
          "1",
          "45.00",
          "USD",
          "45.00"
        ]
      ],
      "termsLines": [
        "Rates are subject to carrier space and equipment availability.",
        "This quotation is a KingFisher layout preview (FRESA format)."
      ]
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "docTitle",
        "text": "STANDARD INVOICE –JASPER FORMAT17 (WITH HOLDING TAX)",
        "align": "end",
        "band": true
      },
      {
        "type": "partyTriple"
      },
      {
        "type": "landRoute"
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
        "type": "containerStrip"
      },
      {
        "type": "usaNumberedFields"
      },
      {
        "type": "outstandingTable"
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
    "code": "LEFTOVER_STANDARD_INVOICE_JASPER_FORMAT18",
    "formatNumber": 18,
    "name": "Standard Invoice –Jasper format18",
    "paper": "Letter",
    "rtl": false,
    "theme": {
      "primary": "#0F4D96",
      "accent": "#2488CA",
      "fill": "#EDF9FF",
      "panel": "#DAF2FF",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#9BD8FF",
      "ink": "#101010",
      "gray": "#656565",
      "white": "#FFFFFF"
    },
    "branding": {
      "company": "KingFisher Wings",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "inquiry@kingfishertec.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "QTN-19-0018",
      "invoiceDate": "28-JAN-19",
      "dueDate": "28-FEB-19",
      "quotationNo": "QTN-19-0018",
      "billToName": "AL NASER TRADING COMPANY LLC",
      "billToAddress": "30 AL MAKTHOOM BUILDING, SHARJAH UAE",
      "currency": "USD",
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
      "subtotal": "1,380.00",
      "tax": "0.00",
      "total": "1,380.00",
      "words": "USD One Thousand Three Hundred Eighty Only",
      "remarks": "Format-18",
      "fieldGrid": [
        {
          "k": "POL",
          "v": "CHENNAI, INDIA"
        },
        {
          "k": "POD",
          "v": "JEBEL ALI, UAE"
        },
        {
          "k": "Incoterm",
          "v": "FOB"
        },
        {
          "k": "Validity",
          "v": "30 Days"
        },
        {
          "k": "Layout",
          "v": "Format-18"
        },
        {
          "k": "Paper",
          "v": "Letter"
        }
      ],
      "tableHeaders": [
        "#",
        "Charge",
        "Qty",
        "Rate",
        "Currency",
        "Amount"
      ],
      "tableRows": [
        [
          "1",
          "Ocean Freight",
          "1",
          "1,250.00",
          "USD",
          "1,250.00"
        ],
        [
          "2",
          "THC Origin",
          "1",
          "85.00",
          "USD",
          "85.00"
        ],
        [
          "3",
          "Documentation",
          "1",
          "45.00",
          "USD",
          "45.00"
        ]
      ],
      "termsLines": [
        "Rates are subject to carrier space and equipment availability.",
        "This quotation is a KingFisher layout preview (FRESA format)."
      ]
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "docTitle",
        "text": "STANDARD INVOICE –JASPER FORMAT18",
        "align": "center",
        "band": true
      },
      {
        "type": "partyTriple"
      },
      {
        "type": "formatBadge"
      },
      {
        "type": "summaryHero"
      },
      {
        "type": "agingSummary"
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
        "type": "signatureRow"
      },
      {
        "type": "colorfulFooter"
      }
    ]
  },
  {
    "code": "LEFTOVER_STANDARD_INVOICE_JASPER_FORMAT19",
    "formatNumber": 19,
    "name": "Standard Invoice –Jasper format19",
    "paper": "A4",
    "rtl": false,
    "theme": {
      "primary": "#0F4D96",
      "accent": "#2387C9",
      "fill": "#EBF7FF",
      "panel": "#D8F0FD",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#9BD8FF",
      "ink": "#101010",
      "gray": "#656565",
      "white": "#FFFFFF"
    },
    "branding": {
      "company": "KingFisher Wings",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "inquiry@kingfishertec.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "QTN-19-0019",
      "invoiceDate": "28-JAN-19",
      "dueDate": "28-FEB-19",
      "quotationNo": "QTN-19-0019",
      "billToName": "AL NASER TRADING COMPANY LLC",
      "billToAddress": "30 AL MAKTHOOM BUILDING, SHARJAH UAE",
      "currency": "USD",
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
      "subtotal": "1,380.00",
      "tax": "0.00",
      "total": "1,380.00",
      "words": "USD One Thousand Three Hundred Eighty Only",
      "remarks": "Format-19",
      "fieldGrid": [
        {
          "k": "POL",
          "v": "CHENNAI, INDIA"
        },
        {
          "k": "POD",
          "v": "JEBEL ALI, UAE"
        },
        {
          "k": "Incoterm",
          "v": "FOB"
        },
        {
          "k": "Validity",
          "v": "30 Days"
        },
        {
          "k": "Layout",
          "v": "Format-19"
        }
      ],
      "tableHeaders": [
        "#",
        "Charge",
        "Qty",
        "Rate",
        "Currency",
        "Amount"
      ],
      "tableRows": [
        [
          "1",
          "Ocean Freight",
          "1",
          "1,250.00",
          "USD",
          "1,250.00"
        ],
        [
          "2",
          "THC Origin",
          "1",
          "85.00",
          "USD",
          "85.00"
        ],
        [
          "3",
          "Documentation",
          "1",
          "45.00",
          "USD",
          "45.00"
        ]
      ],
      "termsLines": [
        "Rates are subject to carrier space and equipment availability.",
        "This quotation is a KingFisher layout preview (FRESA format)."
      ],
      "letterBody": "Please confirm acceptance to proceed with booking.",
      "agingHeaders": [
        "Freight",
        "Local",
        "Docs",
        "Total"
      ],
      "agingRow": [
        "1,250.00",
        "85.00",
        "45.00",
        "1,380.00"
      ]
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "docTitle",
        "text": "STANDARD INVOICE –JASPER FORMAT19",
        "align": "start",
        "band": true
      },
      {
        "type": "partyTriple"
      },
      {
        "type": "exportMetaStrip"
      },
      {
        "type": "containerStrip"
      },
      {
        "type": "agingSummary"
      },
      {
        "type": "usaNumberedFields"
      },
      {
        "type": "outstandingTable"
      },
      {
        "type": "shipmentDetails",
        "showIrn": true,
        "showQuotation": true
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
    "code": "LEFTOVER_STANDARD_INVOICE_JASPER_FORMAT20_UAE_LOCAL_CURRENCY",
    "formatNumber": 20,
    "name": "Standard Invoice –Jasper format20 –UAE Local Currency",
    "paper": "A4",
    "rtl": false,
    "theme": {
      "primary": "#0F4D96",
      "accent": "#2286C8",
      "fill": "#E9F5FD",
      "panel": "#D7EFFC",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#9AD7FF",
      "ink": "#101010",
      "gray": "#656565",
      "white": "#FFFFFF"
    },
    "branding": {
      "company": "KingFisher Wings",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "inquiry@kingfishertec.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "QTN-19-0020",
      "invoiceDate": "28-JAN-19",
      "dueDate": "28-FEB-19",
      "quotationNo": "QTN-19-0020",
      "billToName": "AL NASER TRADING COMPANY LLC",
      "billToAddress": "30 AL MAKTHOOM BUILDING, SHARJAH UAE",
      "currency": "USD",
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
      "subtotal": "1,380.00",
      "tax": "0.00",
      "total": "1,380.00",
      "words": "USD One Thousand Three Hundred Eighty Only",
      "remarks": "Format-20",
      "fieldGrid": [
        {
          "k": "POL",
          "v": "CHENNAI, INDIA"
        },
        {
          "k": "POD",
          "v": "JEBEL ALI, UAE"
        },
        {
          "k": "Incoterm",
          "v": "FOB"
        },
        {
          "k": "Validity",
          "v": "30 Days"
        },
        {
          "k": "Layout",
          "v": "Format-20"
        }
      ],
      "tableHeaders": [
        "#",
        "Charge",
        "Qty",
        "Rate",
        "Currency",
        "Amount"
      ],
      "tableRows": [
        [
          "1",
          "Ocean Freight",
          "1",
          "1,250.00",
          "USD",
          "1,250.00"
        ],
        [
          "2",
          "THC Origin",
          "1",
          "85.00",
          "USD",
          "85.00"
        ],
        [
          "3",
          "Documentation",
          "1",
          "45.00",
          "USD",
          "45.00"
        ]
      ],
      "termsLines": [
        "Rates are subject to carrier space and equipment availability.",
        "This quotation is a KingFisher layout preview (FRESA format)."
      ]
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "docTitle",
        "text": "STANDARD INVOICE –JASPER FORMAT20 –UAE LOCAL CURRENCY",
        "align": "end",
        "band": true
      },
      {
        "type": "partyTriple"
      },
      {
        "type": "landRoute"
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
        "type": "summaryHero"
      },
      {
        "type": "exportMetaStrip"
      },
      {
        "type": "containerStrip"
      },
      {
        "type": "wireBox"
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
    "code": "LEFTOVER_STANDARD_INVOICE_JASPER_FORMAT21_WITH_HOLDING_TAX",
    "formatNumber": 21,
    "name": "Standard Invoice –Jasper format21 (With Holding Tax)",
    "paper": "A4",
    "rtl": false,
    "theme": {
      "primary": "#0F4D96",
      "accent": "#2286C8",
      "fill": "#E7F3FB",
      "panel": "#D5EDFA",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#9AD7FF",
      "ink": "#101010",
      "gray": "#656565",
      "white": "#FFFFFF"
    },
    "branding": {
      "company": "KingFisher Wings",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "inquiry@kingfishertec.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "QTN-19-0021",
      "invoiceDate": "28-JAN-19",
      "dueDate": "28-FEB-19",
      "quotationNo": "QTN-19-0021",
      "billToName": "AL NASER TRADING COMPANY LLC",
      "billToAddress": "30 AL MAKTHOOM BUILDING, SHARJAH UAE",
      "currency": "USD",
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
      "subtotal": "1,380.00",
      "tax": "0.00",
      "total": "1,380.00",
      "words": "USD One Thousand Three Hundred Eighty Only",
      "remarks": "Format-21",
      "fieldGrid": [
        {
          "k": "POL",
          "v": "CHENNAI, INDIA"
        },
        {
          "k": "POD",
          "v": "JEBEL ALI, UAE"
        },
        {
          "k": "Incoterm",
          "v": "FOB"
        },
        {
          "k": "Validity",
          "v": "30 Days"
        },
        {
          "k": "Layout",
          "v": "Format-21"
        }
      ],
      "tableHeaders": [
        "#",
        "Charge",
        "Qty",
        "Rate",
        "Currency",
        "Amount"
      ],
      "tableRows": [
        [
          "1",
          "Ocean Freight",
          "1",
          "1,250.00",
          "USD",
          "1,250.00"
        ],
        [
          "2",
          "THC Origin",
          "1",
          "85.00",
          "USD",
          "85.00"
        ],
        [
          "3",
          "Documentation",
          "1",
          "45.00",
          "USD",
          "45.00"
        ]
      ],
      "termsLines": [
        "Rates are subject to carrier space and equipment availability.",
        "This quotation is a KingFisher layout preview (FRESA format)."
      ],
      "letterBody": "Thank you for your enquiry. Please find our quotation below."
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "docTitle",
        "text": "STANDARD INVOICE –JASPER FORMAT21 (WITH HOLDING TAX)",
        "align": "center",
        "band": true
      },
      {
        "type": "partyTriple"
      },
      {
        "type": "formatBadge"
      },
      {
        "type": "agingSummary"
      },
      {
        "type": "wireBox"
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
        "type": "signatureRow"
      },
      {
        "type": "colorfulFooter"
      }
    ]
  },
  {
    "code": "LEFTOVER_STANDARD_INVOICE_JASPER_FORMAT22",
    "formatNumber": 22,
    "name": "Standard Invoice –Jasper format22",
    "paper": "A4",
    "rtl": false,
    "theme": {
      "primary": "#0F4D96",
      "accent": "#2185C7",
      "fill": "#E5F1F9",
      "panel": "#D4ECF9",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#99D6FE",
      "ink": "#101010",
      "gray": "#656565",
      "white": "#FFFFFF"
    },
    "branding": {
      "company": "KingFisher Wings",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "inquiry@kingfishertec.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "QTN-19-0022",
      "invoiceDate": "28-JAN-19",
      "dueDate": "28-FEB-19",
      "quotationNo": "QTN-19-0022",
      "billToName": "AL NASER TRADING COMPANY LLC",
      "billToAddress": "30 AL MAKTHOOM BUILDING, SHARJAH UAE",
      "currency": "USD",
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
      "subtotal": "1,380.00",
      "tax": "0.00",
      "total": "1,380.00",
      "words": "USD One Thousand Three Hundred Eighty Only",
      "remarks": "Format-22",
      "fieldGrid": [
        {
          "k": "POL",
          "v": "CHENNAI, INDIA"
        },
        {
          "k": "POD",
          "v": "JEBEL ALI, UAE"
        },
        {
          "k": "Incoterm",
          "v": "FOB"
        },
        {
          "k": "Validity",
          "v": "30 Days"
        },
        {
          "k": "Layout",
          "v": "Format-22"
        }
      ],
      "tableHeaders": [
        "#",
        "Charge",
        "Qty",
        "Rate",
        "Currency",
        "Amount"
      ],
      "tableRows": [
        [
          "1",
          "Ocean Freight",
          "1",
          "1,250.00",
          "USD",
          "1,250.00"
        ],
        [
          "2",
          "THC Origin",
          "1",
          "85.00",
          "USD",
          "85.00"
        ],
        [
          "3",
          "Documentation",
          "1",
          "45.00",
          "USD",
          "45.00"
        ]
      ],
      "termsLines": [
        "Rates are subject to carrier space and equipment availability.",
        "This quotation is a KingFisher layout preview (FRESA format)."
      ]
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "docTitle",
        "text": "STANDARD INVOICE –JASPER FORMAT22",
        "align": "start",
        "band": true
      },
      {
        "type": "partyTriple"
      },
      {
        "type": "summaryHero"
      },
      {
        "type": "containerStrip"
      },
      {
        "type": "agingSummary"
      },
      {
        "type": "wireBox"
      },
      {
        "type": "usaNumberedFields"
      },
      {
        "type": "shipmentDetails",
        "showIrn": true,
        "showQuotation": true
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
    "code": "LEFTOVER_STANDARD_INVOICE_JASPER_FORMAT3",
    "formatNumber": 3,
    "name": "Standard Invoice –Jasper format3",
    "paper": "Letter",
    "rtl": false,
    "theme": {
      "primary": "#0F4D96",
      "accent": "#2084C6",
      "fill": "#E3EFF7",
      "panel": "#D3EBF8",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#99D6FE",
      "ink": "#101010",
      "gray": "#656565",
      "white": "#FFFFFF"
    },
    "branding": {
      "company": "KingFisher Wings",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "inquiry@kingfishertec.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "QTN-19-0003",
      "invoiceDate": "28-JAN-19",
      "dueDate": "28-FEB-19",
      "quotationNo": "QTN-19-0003",
      "billToName": "AL NASER TRADING COMPANY LLC",
      "billToAddress": "30 AL MAKTHOOM BUILDING, SHARJAH UAE",
      "currency": "USD",
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
      "subtotal": "1,380.00",
      "tax": "0.00",
      "total": "1,380.00",
      "words": "USD One Thousand Three Hundred Eighty Only",
      "remarks": "Format-3",
      "fieldGrid": [
        {
          "k": "POL",
          "v": "CHENNAI, INDIA"
        },
        {
          "k": "POD",
          "v": "JEBEL ALI, UAE"
        },
        {
          "k": "Incoterm",
          "v": "FOB"
        },
        {
          "k": "Validity",
          "v": "30 Days"
        },
        {
          "k": "Layout",
          "v": "Format-3"
        },
        {
          "k": "Paper",
          "v": "Letter"
        }
      ],
      "tableHeaders": [
        "#",
        "Charge",
        "Qty",
        "Rate",
        "Currency",
        "Amount"
      ],
      "tableRows": [
        [
          "1",
          "Ocean Freight",
          "1",
          "1,250.00",
          "USD",
          "1,250.00"
        ],
        [
          "2",
          "THC Origin",
          "1",
          "85.00",
          "USD",
          "85.00"
        ],
        [
          "3",
          "Documentation",
          "1",
          "45.00",
          "USD",
          "45.00"
        ]
      ],
      "termsLines": [
        "Rates are subject to carrier space and equipment availability.",
        "This quotation is a KingFisher layout preview (FRESA format)."
      ]
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "docTitle",
        "text": "STANDARD INVOICE –JASPER FORMAT3",
        "align": "center",
        "band": true
      },
      {
        "type": "partyTriple"
      },
      {
        "type": "formatBadge"
      },
      {
        "type": "summaryHero"
      },
      {
        "type": "containerStrip"
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
        "type": "signatureRow"
      },
      {
        "type": "colorfulFooter"
      }
    ]
  },
  {
    "code": "LEFTOVER_STANDARD_INVOICE_JASPER_FORMAT4",
    "formatNumber": 4,
    "name": "Standard Invoice –Jasper Format4",
    "paper": "A4",
    "rtl": false,
    "theme": {
      "primary": "#0F4D96",
      "accent": "#2084C6",
      "fill": "#E1EDF5",
      "panel": "#D1E9F6",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#98D5FD",
      "ink": "#101010",
      "gray": "#656565",
      "white": "#FFFFFF"
    },
    "branding": {
      "company": "KingFisher Wings",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "inquiry@kingfishertec.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "QTN-19-0004",
      "invoiceDate": "28-JAN-19",
      "dueDate": "28-FEB-19",
      "quotationNo": "QTN-19-0004",
      "billToName": "AL NASER TRADING COMPANY LLC",
      "billToAddress": "30 AL MAKTHOOM BUILDING, SHARJAH UAE",
      "currency": "USD",
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
      "subtotal": "1,380.00",
      "tax": "0.00",
      "total": "1,380.00",
      "words": "USD One Thousand Three Hundred Eighty Only",
      "remarks": "Format-4",
      "fieldGrid": [
        {
          "k": "POL",
          "v": "CHENNAI, INDIA"
        },
        {
          "k": "POD",
          "v": "JEBEL ALI, UAE"
        },
        {
          "k": "Incoterm",
          "v": "FOB"
        },
        {
          "k": "Validity",
          "v": "30 Days"
        },
        {
          "k": "Layout",
          "v": "Format-4"
        }
      ],
      "tableHeaders": [
        "#",
        "Charge",
        "Qty",
        "Rate",
        "Currency",
        "Amount"
      ],
      "tableRows": [
        [
          "1",
          "Ocean Freight",
          "1",
          "1,250.00",
          "USD",
          "1,250.00"
        ],
        [
          "2",
          "THC Origin",
          "1",
          "85.00",
          "USD",
          "85.00"
        ],
        [
          "3",
          "Documentation",
          "1",
          "45.00",
          "USD",
          "45.00"
        ]
      ],
      "termsLines": [
        "Rates are subject to carrier space and equipment availability.",
        "This quotation is a KingFisher layout preview (FRESA format)."
      ],
      "letterBody": "Please confirm acceptance to proceed with booking.",
      "agingHeaders": [
        "Freight",
        "Local",
        "Docs",
        "Total"
      ],
      "agingRow": [
        "1,250.00",
        "85.00",
        "45.00",
        "1,380.00"
      ]
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "docTitle",
        "text": "STANDARD INVOICE –JASPER FORMAT4",
        "align": "start",
        "band": true
      },
      {
        "type": "partyTriple"
      },
      {
        "type": "exportMetaStrip"
      },
      {
        "type": "wireBox"
      },
      {
        "type": "usaNumberedFields"
      },
      {
        "type": "outstandingTable"
      },
      {
        "type": "shipmentDetails",
        "showIrn": true,
        "showQuotation": true
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
    "code": "LEFTOVER_STANDARD_INVOICE_JASPER_FORMAT5",
    "formatNumber": 5,
    "name": "Standard Invoice –Jasper format5",
    "paper": "A4",
    "rtl": false,
    "theme": {
      "primary": "#0F4D96",
      "accent": "#2589CB",
      "fill": "#F0FCFF",
      "panel": "#DCF4FF",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#9CD9FF",
      "ink": "#101010",
      "gray": "#656565",
      "white": "#FFFFFF"
    },
    "branding": {
      "company": "KingFisher Wings",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "inquiry@kingfishertec.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "QTN-19-0005",
      "invoiceDate": "28-JAN-19",
      "dueDate": "28-FEB-19",
      "quotationNo": "QTN-19-0005",
      "billToName": "AL NASER TRADING COMPANY LLC",
      "billToAddress": "30 AL MAKTHOOM BUILDING, SHARJAH UAE",
      "currency": "USD",
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
      "subtotal": "1,380.00",
      "tax": "0.00",
      "total": "1,380.00",
      "words": "USD One Thousand Three Hundred Eighty Only",
      "remarks": "Format-5",
      "fieldGrid": [
        {
          "k": "POL",
          "v": "CHENNAI, INDIA"
        },
        {
          "k": "POD",
          "v": "JEBEL ALI, UAE"
        },
        {
          "k": "Incoterm",
          "v": "FOB"
        },
        {
          "k": "Validity",
          "v": "30 Days"
        },
        {
          "k": "Layout",
          "v": "Format-5"
        }
      ],
      "tableHeaders": [
        "#",
        "Charge",
        "Qty",
        "Rate",
        "Currency",
        "Amount"
      ],
      "tableRows": [
        [
          "1",
          "Ocean Freight",
          "1",
          "1,250.00",
          "USD",
          "1,250.00"
        ],
        [
          "2",
          "THC Origin",
          "1",
          "85.00",
          "USD",
          "85.00"
        ],
        [
          "3",
          "Documentation",
          "1",
          "45.00",
          "USD",
          "45.00"
        ]
      ],
      "termsLines": [
        "Rates are subject to carrier space and equipment availability.",
        "This quotation is a KingFisher layout preview (FRESA format)."
      ]
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "docTitle",
        "text": "STANDARD INVOICE –JASPER FORMAT5",
        "align": "end",
        "band": true
      },
      {
        "type": "partyTriple"
      },
      {
        "type": "landRoute"
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
        "type": "summaryHero"
      },
      {
        "type": "exportMetaStrip"
      },
      {
        "type": "containerStrip"
      },
      {
        "type": "wireBox"
      },
      {
        "type": "signatureRow"
      },
      {
        "type": "containerStrip"
      },
      {
        "type": "colorfulFooter"
      }
    ]
  },
  {
    "code": "LEFTOVER_STANDARD_INVOICE_JASPER_FORMAT6",
    "formatNumber": 6,
    "name": "Standard Invoice –Jasper format6",
    "paper": "A4",
    "rtl": false,
    "theme": {
      "primary": "#0F4D96",
      "accent": "#2488CA",
      "fill": "#EEFAFF",
      "panel": "#DAF2FF",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#9CD9FF",
      "ink": "#101010",
      "gray": "#656565",
      "white": "#FFFFFF"
    },
    "branding": {
      "company": "KingFisher Wings",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "inquiry@kingfishertec.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "QTN-19-0006",
      "invoiceDate": "28-JAN-19",
      "dueDate": "28-FEB-19",
      "quotationNo": "QTN-19-0006",
      "billToName": "AL NASER TRADING COMPANY LLC",
      "billToAddress": "30 AL MAKTHOOM BUILDING, SHARJAH UAE",
      "currency": "USD",
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
      "subtotal": "1,380.00",
      "tax": "0.00",
      "total": "1,380.00",
      "words": "USD One Thousand Three Hundred Eighty Only",
      "remarks": "Format-6",
      "fieldGrid": [
        {
          "k": "POL",
          "v": "CHENNAI, INDIA"
        },
        {
          "k": "POD",
          "v": "JEBEL ALI, UAE"
        },
        {
          "k": "Incoterm",
          "v": "FOB"
        },
        {
          "k": "Validity",
          "v": "30 Days"
        },
        {
          "k": "Layout",
          "v": "Format-6"
        }
      ],
      "tableHeaders": [
        "#",
        "Charge",
        "Qty",
        "Rate",
        "Currency",
        "Amount"
      ],
      "tableRows": [
        [
          "1",
          "Ocean Freight",
          "1",
          "1,250.00",
          "USD",
          "1,250.00"
        ],
        [
          "2",
          "THC Origin",
          "1",
          "85.00",
          "USD",
          "85.00"
        ],
        [
          "3",
          "Documentation",
          "1",
          "45.00",
          "USD",
          "45.00"
        ]
      ],
      "termsLines": [
        "Rates are subject to carrier space and equipment availability.",
        "This quotation is a KingFisher layout preview (FRESA format)."
      ],
      "letterBody": "Thank you for your enquiry. Please find our quotation below."
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "docTitle",
        "text": "STANDARD INVOICE –JASPER FORMAT6",
        "align": "center",
        "band": true
      },
      {
        "type": "partyTriple"
      },
      {
        "type": "formatBadge"
      },
      {
        "type": "containerStrip"
      },
      {
        "type": "agingSummary"
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
        "type": "signatureRow"
      },
      {
        "type": "colorfulFooter"
      }
    ]
  },
  {
    "code": "LEFTOVER_STANDARD_INVOICE_JASPER_FORMAT9",
    "formatNumber": 9,
    "name": "Standard Invoice –Jasper format9",
    "paper": "A4",
    "rtl": false,
    "theme": {
      "primary": "#0F4D96",
      "accent": "#2387C9",
      "fill": "#ECF8FF",
      "panel": "#D9F1FE",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#9BD8FF",
      "ink": "#101010",
      "gray": "#656565",
      "white": "#FFFFFF"
    },
    "branding": {
      "company": "KingFisher Wings",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "inquiry@kingfishertec.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "QTN-19-0009",
      "invoiceDate": "28-JAN-19",
      "dueDate": "28-FEB-19",
      "quotationNo": "QTN-19-0009",
      "billToName": "AL NASER TRADING COMPANY LLC",
      "billToAddress": "30 AL MAKTHOOM BUILDING, SHARJAH UAE",
      "currency": "USD",
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
      "subtotal": "1,380.00",
      "tax": "0.00",
      "total": "1,380.00",
      "words": "USD One Thousand Three Hundred Eighty Only",
      "remarks": "Format-9",
      "fieldGrid": [
        {
          "k": "POL",
          "v": "CHENNAI, INDIA"
        },
        {
          "k": "POD",
          "v": "JEBEL ALI, UAE"
        },
        {
          "k": "Incoterm",
          "v": "FOB"
        },
        {
          "k": "Validity",
          "v": "30 Days"
        },
        {
          "k": "Layout",
          "v": "Format-9"
        }
      ],
      "tableHeaders": [
        "#",
        "Charge",
        "Qty",
        "Rate",
        "Currency",
        "Amount"
      ],
      "tableRows": [
        [
          "1",
          "Ocean Freight",
          "1",
          "1,250.00",
          "USD",
          "1,250.00"
        ],
        [
          "2",
          "THC Origin",
          "1",
          "85.00",
          "USD",
          "85.00"
        ],
        [
          "3",
          "Documentation",
          "1",
          "45.00",
          "USD",
          "45.00"
        ]
      ],
      "termsLines": [
        "Rates are subject to carrier space and equipment availability.",
        "This quotation is a KingFisher layout preview (FRESA format)."
      ],
      "letterBody": "Please confirm acceptance to proceed with booking.",
      "agingHeaders": [
        "Freight",
        "Local",
        "Docs",
        "Total"
      ],
      "agingRow": [
        "1,250.00",
        "85.00",
        "45.00",
        "1,380.00"
      ]
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "docTitle",
        "text": "STANDARD INVOICE –JASPER FORMAT9",
        "align": "center",
        "band": true
      },
      {
        "type": "partyTriple"
      },
      {
        "type": "fieldGrid",
        "cols": 1
      },
      {
        "type": "chargeTable",
        "headerColor": "cyan"
      },
      {
        "type": "termsBank"
      },
      {
        "type": "signatureRow"
      },
      {
        "type": "letterBody"
      },
      {
        "type": "summaryHero"
      },
      {
        "type": "agingSummary"
      },
      {
        "type": "colorfulFooter"
      }
    ]
  },
  {
    "code": "LEFTOVER_STANDARD_INVOICE_JASPER_TANZANIA",
    "formatNumber": 49,
    "name": "Standard Invoice –Jasper Tanzania",
    "paper": "A4",
    "rtl": false,
    "theme": {
      "primary": "#0F4D96",
      "accent": "#2387C9",
      "fill": "#EAF6FE",
      "panel": "#D7EFFC",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#9BD8FF",
      "ink": "#101010",
      "gray": "#656565",
      "white": "#FFFFFF"
    },
    "branding": {
      "company": "KingFisher Wings",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "inquiry@kingfishertec.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "QTN-19-0049",
      "invoiceDate": "28-JAN-19",
      "dueDate": "28-FEB-19",
      "quotationNo": "QTN-19-0049",
      "billToName": "AL NASER TRADING COMPANY LLC",
      "billToAddress": "30 AL MAKTHOOM BUILDING, SHARJAH UAE",
      "currency": "USD",
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
      "subtotal": "1,380.00",
      "tax": "0.00",
      "total": "1,380.00",
      "words": "USD One Thousand Three Hundred Eighty Only",
      "remarks": "Format-49",
      "fieldGrid": [
        {
          "k": "POL",
          "v": "CHENNAI, INDIA"
        },
        {
          "k": "POD",
          "v": "JEBEL ALI, UAE"
        },
        {
          "k": "Incoterm",
          "v": "FOB"
        },
        {
          "k": "Validity",
          "v": "30 Days"
        },
        {
          "k": "Layout",
          "v": "Format-49"
        }
      ],
      "tableHeaders": [
        "#",
        "Charge",
        "Qty",
        "Rate",
        "Currency",
        "Amount"
      ],
      "tableRows": [
        [
          "1",
          "Ocean Freight",
          "1",
          "1,250.00",
          "USD",
          "1,250.00"
        ],
        [
          "2",
          "THC Origin",
          "1",
          "85.00",
          "USD",
          "85.00"
        ],
        [
          "3",
          "Documentation",
          "1",
          "45.00",
          "USD",
          "45.00"
        ]
      ],
      "termsLines": [
        "Rates are subject to carrier space and equipment availability.",
        "This quotation is a KingFisher layout preview (FRESA format)."
      ],
      "letterBody": "Please confirm acceptance to proceed with booking.",
      "agingHeaders": [
        "Freight",
        "Local",
        "Docs",
        "Total"
      ],
      "agingRow": [
        "1,250.00",
        "85.00",
        "45.00",
        "1,380.00"
      ]
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "docTitle",
        "text": "STANDARD INVOICE –JASPER TANZANIA",
        "align": "start",
        "band": false
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
        "type": "totalsOnly"
      },
      {
        "type": "termsBank"
      },
      {
        "type": "signatureRow"
      },
      {
        "type": "formatBadge"
      },
      {
        "type": "containerStrip"
      },
      {
        "type": "agingSummary"
      },
      {
        "type": "wireBox"
      },
      {
        "type": "usaNumberedFields"
      },
      {
        "type": "colorfulFooter"
      }
    ]
  },
  {
    "code": "LEFTOVER_STANDARD_INVOICE_3_DECIMAL",
    "formatNumber": 50,
    "name": "Standard Invoice 3 Decimal",
    "paper": "A4",
    "rtl": false,
    "theme": {
      "primary": "#0F4D96",
      "accent": "#2286C8",
      "fill": "#E8F4FC",
      "panel": "#D6EEFB",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#9AD7FF",
      "ink": "#101010",
      "gray": "#656565",
      "white": "#FFFFFF"
    },
    "branding": {
      "company": "KingFisher Wings",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "inquiry@kingfishertec.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "QTN-19-0050",
      "invoiceDate": "28-JAN-19",
      "dueDate": "28-FEB-19",
      "quotationNo": "QTN-19-0050",
      "billToName": "AL NASER TRADING COMPANY LLC",
      "billToAddress": "30 AL MAKTHOOM BUILDING, SHARJAH UAE",
      "currency": "USD",
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
      "subtotal": "1,380.00",
      "tax": "0.00",
      "total": "1,380.00",
      "words": "USD One Thousand Three Hundred Eighty Only",
      "remarks": "Format-50",
      "fieldGrid": [
        {
          "k": "POL",
          "v": "CHENNAI, INDIA"
        },
        {
          "k": "POD",
          "v": "JEBEL ALI, UAE"
        },
        {
          "k": "Incoterm",
          "v": "FOB"
        },
        {
          "k": "Validity",
          "v": "30 Days"
        },
        {
          "k": "Layout",
          "v": "Format-50"
        }
      ],
      "tableHeaders": [
        "#",
        "Charge",
        "Qty",
        "Rate",
        "Currency",
        "Amount"
      ],
      "tableRows": [
        [
          "1",
          "Ocean Freight",
          "1",
          "1,250.00",
          "USD",
          "1,250.00"
        ],
        [
          "2",
          "THC Origin",
          "1",
          "85.00",
          "USD",
          "85.00"
        ],
        [
          "3",
          "Documentation",
          "1",
          "45.00",
          "USD",
          "45.00"
        ]
      ],
      "termsLines": [
        "Rates are subject to carrier space and equipment availability.",
        "This quotation is a KingFisher layout preview (FRESA format)."
      ]
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "docTitle",
        "text": "STANDARD INVOICE 3 DECIMAL",
        "align": "end",
        "band": false
      },
      {
        "type": "twoColumn",
        "showBillTo": true,
        "rightMetaFrom": "metaRows"
      },
      {
        "type": "fieldGrid",
        "cols": 2
      },
      {
        "type": "formatBadge"
      },
      {
        "type": "letterBody"
      },
      {
        "type": "summaryHero"
      },
      {
        "type": "agingSummary"
      },
      {
        "type": "chargeTable",
        "headerColor": "primary"
      },
      {
        "type": "wordsAndTotal"
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
    "code": "LEFTOVER_STANDARD_INVOICE_ARABIC_JASPER",
    "formatNumber": 51,
    "name": "Standard Invoice Arabic –Jasper",
    "paper": "A4",
    "rtl": true,
    "theme": {
      "primary": "#0F4D96",
      "accent": "#198993",
      "fill": "#E6F2FA",
      "panel": "#D5EDFA",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#9AD7FF",
      "ink": "#101010",
      "gray": "#656565",
      "white": "#FFFFFF"
    },
    "branding": {
      "company": "KingFisher Wings",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "inquiry@kingfishertec.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "QTN-19-0051",
      "invoiceDate": "28-JAN-19",
      "dueDate": "28-FEB-19",
      "quotationNo": "QTN-19-0051",
      "billToName": "AL NASER TRADING COMPANY LLC",
      "billToAddress": "30 AL MAKTHOOM BUILDING, SHARJAH UAE",
      "currency": "USD",
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
      "subtotal": "1,380.00",
      "tax": "0.00",
      "total": "1,380.00",
      "words": "USD One Thousand Three Hundred Eighty Only",
      "remarks": "Format-51",
      "fieldGrid": [
        {
          "k": "POL",
          "v": "CHENNAI, INDIA"
        },
        {
          "k": "POD",
          "v": "JEBEL ALI, UAE"
        },
        {
          "k": "Incoterm",
          "v": "FOB"
        },
        {
          "k": "Validity",
          "v": "30 Days"
        },
        {
          "k": "Layout",
          "v": "Format-51"
        }
      ],
      "tableHeaders": [
        "#",
        "Charge",
        "Qty",
        "Rate",
        "Currency",
        "Amount"
      ],
      "tableRows": [
        [
          "1",
          "Ocean Freight",
          "1",
          "1,250.00",
          "USD",
          "1,250.00"
        ],
        [
          "2",
          "THC Origin",
          "1",
          "85.00",
          "USD",
          "85.00"
        ],
        [
          "3",
          "Documentation",
          "1",
          "45.00",
          "USD",
          "45.00"
        ]
      ],
      "termsLines": [
        "Rates are subject to carrier space and equipment availability.",
        "This quotation is a KingFisher layout preview (FRESA format)."
      ],
      "letterBody": "Thank you for your enquiry. Please find our quotation below.",
      "docSubtitle": "Standard Invoice Arabic"
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "arabicHeader"
      },
      {
        "type": "docTitle",
        "text": "فاتورة / INVOICE",
        "align": "center",
        "band": false
      },
      {
        "type": "twoColumn",
        "showBillTo": true,
        "rightMetaFrom": "metaRows"
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
        "type": "wordsAndTotal"
      },
      {
        "type": "termsBank"
      },
      {
        "type": "jobDescription"
      },
      {
        "type": "colorfulFooter"
      }
    ]
  },
  {
    "code": "LEFTOVER_STANDARD_INVOICE_ARABIC_JASPER_FORMAT1",
    "formatNumber": 1,
    "name": "Standard Invoice Arabic –Jasper Format1",
    "paper": "A4",
    "rtl": true,
    "theme": {
      "primary": "#0F4D96",
      "accent": "#198993",
      "fill": "#E4F0F8",
      "panel": "#D3EBF8",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#99D6FE",
      "ink": "#101010",
      "gray": "#656565",
      "white": "#FFFFFF"
    },
    "branding": {
      "company": "KingFisher Wings",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "inquiry@kingfishertec.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "QTN-19-0001",
      "invoiceDate": "28-JAN-19",
      "dueDate": "28-FEB-19",
      "quotationNo": "QTN-19-0001",
      "billToName": "AL NASER TRADING COMPANY LLC",
      "billToAddress": "30 AL MAKTHOOM BUILDING, SHARJAH UAE",
      "currency": "USD",
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
      "subtotal": "1,380.00",
      "tax": "0.00",
      "total": "1,380.00",
      "words": "USD One Thousand Three Hundred Eighty Only",
      "remarks": "Format-1",
      "fieldGrid": [
        {
          "k": "POL",
          "v": "CHENNAI, INDIA"
        },
        {
          "k": "POD",
          "v": "JEBEL ALI, UAE"
        },
        {
          "k": "Incoterm",
          "v": "FOB"
        },
        {
          "k": "Validity",
          "v": "30 Days"
        },
        {
          "k": "Layout",
          "v": "Format-1"
        }
      ],
      "tableHeaders": [
        "#",
        "Charge",
        "Qty",
        "Rate",
        "Currency",
        "Amount"
      ],
      "tableRows": [
        [
          "1",
          "Ocean Freight",
          "1",
          "1,250.00",
          "USD",
          "1,250.00"
        ],
        [
          "2",
          "THC Origin",
          "1",
          "85.00",
          "USD",
          "85.00"
        ],
        [
          "3",
          "Documentation",
          "1",
          "45.00",
          "USD",
          "45.00"
        ]
      ],
      "termsLines": [
        "Rates are subject to carrier space and equipment availability.",
        "This quotation is a KingFisher layout preview (FRESA format)."
      ],
      "letterBody": "Thank you for your enquiry. Please find our quotation below.",
      "docSubtitle": "Standard Invoice Arabic"
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "arabicHeader"
      },
      {
        "type": "docTitle",
        "text": "فاتورة / INVOICE",
        "align": "start",
        "band": true
      },
      {
        "type": "twoColumn",
        "showBillTo": true,
        "rightMetaFrom": "metaRows"
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
        "type": "summaryHero"
      },
      {
        "type": "colorfulFooter"
      }
    ]
  },
  {
    "code": "LEFTOVER_STANDARD_INVOICE_ARABIC_JASPER_FORMAT1_WITH_LETTER_HEAD",
    "formatNumber": 1,
    "name": "Standard Invoice Arabic –Jasper Format1 With Letter head",
    "paper": "Letter",
    "rtl": true,
    "theme": {
      "primary": "#0F4D96",
      "accent": "#188892",
      "fill": "#E2EEF6",
      "panel": "#D2EAF7",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#99D6FE",
      "ink": "#101010",
      "gray": "#656565",
      "white": "#FFFFFF"
    },
    "branding": {
      "company": "KingFisher Wings",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "inquiry@kingfishertec.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "QTN-19-0001",
      "invoiceDate": "28-JAN-19",
      "dueDate": "28-FEB-19",
      "quotationNo": "QTN-19-0001",
      "billToName": "AL NASER TRADING COMPANY LLC",
      "billToAddress": "30 AL MAKTHOOM BUILDING, SHARJAH UAE",
      "currency": "USD",
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
      "subtotal": "1,380.00",
      "tax": "0.00",
      "total": "1,380.00",
      "words": "USD One Thousand Three Hundred Eighty Only",
      "remarks": "Format-1",
      "fieldGrid": [
        {
          "k": "POL",
          "v": "CHENNAI, INDIA"
        },
        {
          "k": "POD",
          "v": "JEBEL ALI, UAE"
        },
        {
          "k": "Incoterm",
          "v": "FOB"
        },
        {
          "k": "Validity",
          "v": "30 Days"
        },
        {
          "k": "Layout",
          "v": "Format-1"
        }
      ],
      "tableHeaders": [
        "#",
        "Charge",
        "Qty",
        "Rate",
        "Currency",
        "Amount"
      ],
      "tableRows": [
        [
          "1",
          "Ocean Freight",
          "1",
          "1,250.00",
          "USD",
          "1,250.00"
        ],
        [
          "2",
          "THC Origin",
          "1",
          "85.00",
          "USD",
          "85.00"
        ],
        [
          "3",
          "Documentation",
          "1",
          "45.00",
          "USD",
          "45.00"
        ]
      ],
      "termsLines": [
        "Rates are subject to carrier space and equipment availability.",
        "This quotation is a KingFisher layout preview (FRESA format)."
      ],
      "letterBody": "Thank you for your enquiry. Please find our quotation below.",
      "docSubtitle": "Standard Invoice Arabic"
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "arabicHeader"
      },
      {
        "type": "docTitle",
        "text": "فاتورة / INVOICE",
        "align": "start",
        "band": false
      },
      {
        "type": "twoColumn",
        "showBillTo": true,
        "rightMetaFrom": "metaRows"
      },
      {
        "type": "fieldGrid",
        "cols": 3
      },
      {
        "type": "chargeTable",
        "headerColor": "accent"
      },
      {
        "type": "wordsAndTotal"
      },
      {
        "type": "termsBank"
      },
      {
        "type": "agingSummary"
      },
      {
        "type": "colorfulFooter"
      }
    ]
  },
  {
    "code": "LEFTOVER_STANDARD_INVOICE_ARABIC_OMAN_JASPER",
    "formatNumber": 54,
    "name": "Standard Invoice Arabic Oman –Jasper",
    "paper": "A4",
    "rtl": true,
    "theme": {
      "primary": "#0F4D96",
      "accent": "#178791",
      "fill": "#E0ECF4",
      "panel": "#D0E8F5",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#98D5FD",
      "ink": "#101010",
      "gray": "#656565",
      "white": "#FFFFFF"
    },
    "branding": {
      "company": "KingFisher Wings",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "inquiry@kingfishertec.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "QTN-19-0054",
      "invoiceDate": "28-JAN-19",
      "dueDate": "28-FEB-19",
      "quotationNo": "QTN-19-0054",
      "billToName": "AL NASER TRADING COMPANY LLC",
      "billToAddress": "30 AL MAKTHOOM BUILDING, SHARJAH UAE",
      "currency": "USD",
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
      "subtotal": "1,380.00",
      "tax": "0.00",
      "total": "1,380.00",
      "words": "USD One Thousand Three Hundred Eighty Only",
      "remarks": "Format-54",
      "fieldGrid": [
        {
          "k": "POL",
          "v": "CHENNAI, INDIA"
        },
        {
          "k": "POD",
          "v": "JEBEL ALI, UAE"
        },
        {
          "k": "Incoterm",
          "v": "FOB"
        },
        {
          "k": "Validity",
          "v": "30 Days"
        },
        {
          "k": "Layout",
          "v": "Format-54"
        }
      ],
      "tableHeaders": [
        "#",
        "Charge",
        "Qty",
        "Rate",
        "Currency",
        "Amount"
      ],
      "tableRows": [
        [
          "1",
          "Ocean Freight",
          "1",
          "1,250.00",
          "USD",
          "1,250.00"
        ],
        [
          "2",
          "THC Origin",
          "1",
          "85.00",
          "USD",
          "85.00"
        ],
        [
          "3",
          "Documentation",
          "1",
          "45.00",
          "USD",
          "45.00"
        ]
      ],
      "termsLines": [
        "Rates are subject to carrier space and equipment availability.",
        "This quotation is a KingFisher layout preview (FRESA format)."
      ],
      "letterBody": "Please confirm acceptance to proceed with booking.",
      "agingHeaders": [
        "Freight",
        "Local",
        "Docs",
        "Total"
      ],
      "agingRow": [
        "1,250.00",
        "85.00",
        "45.00",
        "1,380.00"
      ],
      "docSubtitle": "Standard Invoice Arabic"
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "arabicHeader"
      },
      {
        "type": "docTitle",
        "text": "فاتورة / INVOICE",
        "align": "center",
        "band": false
      },
      {
        "type": "twoColumn",
        "showBillTo": true,
        "rightMetaFrom": "metaRows"
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
        "type": "wordsAndTotal"
      },
      {
        "type": "termsBank"
      },
      {
        "type": "jobDescription"
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
    "code": "LEFTOVER_STANDARD_INVOICE_ARABIC_WITH_QR_CODE_JASPER_FORMAT2",
    "formatNumber": 2,
    "name": "Standard Invoice Arabic with QR code –Jasper Format2",
    "paper": "A4",
    "rtl": true,
    "theme": {
      "primary": "#0F4D96",
      "accent": "#1C8C96",
      "fill": "#EFFBFF",
      "panel": "#DBF3FF",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#9CD9FF",
      "ink": "#101010",
      "gray": "#656565",
      "white": "#FFFFFF"
    },
    "branding": {
      "company": "KingFisher Wings",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "inquiry@kingfishertec.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "QTN-19-0002",
      "invoiceDate": "28-JAN-19",
      "dueDate": "28-FEB-19",
      "quotationNo": "QTN-19-0002",
      "billToName": "AL NASER TRADING COMPANY LLC",
      "billToAddress": "30 AL MAKTHOOM BUILDING, SHARJAH UAE",
      "currency": "USD",
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
      "subtotal": "1,380.00",
      "tax": "0.00",
      "total": "1,380.00",
      "words": "USD One Thousand Three Hundred Eighty Only",
      "remarks": "Format-2",
      "fieldGrid": [
        {
          "k": "POL",
          "v": "CHENNAI, INDIA"
        },
        {
          "k": "POD",
          "v": "JEBEL ALI, UAE"
        },
        {
          "k": "Incoterm",
          "v": "FOB"
        },
        {
          "k": "Validity",
          "v": "30 Days"
        },
        {
          "k": "Layout",
          "v": "Format-2"
        }
      ],
      "tableHeaders": [
        "#",
        "Charge",
        "Qty",
        "Rate",
        "Currency",
        "Amount"
      ],
      "tableRows": [
        [
          "1",
          "Ocean Freight",
          "1",
          "1,250.00",
          "USD",
          "1,250.00"
        ],
        [
          "2",
          "THC Origin",
          "1",
          "85.00",
          "USD",
          "85.00"
        ],
        [
          "3",
          "Documentation",
          "1",
          "45.00",
          "USD",
          "45.00"
        ]
      ],
      "termsLines": [
        "Rates are subject to carrier space and equipment availability.",
        "This quotation is a KingFisher layout preview (FRESA format)."
      ],
      "docSubtitle": "Standard Invoice Arabic"
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "arabicHeader"
      },
      {
        "type": "docTitle",
        "text": "فاتورة / INVOICE",
        "align": "end",
        "band": true
      },
      {
        "type": "twoColumn",
        "showBillTo": true,
        "rightMetaFrom": "metaRows"
      },
      {
        "type": "fieldGrid",
        "cols": 3
      },
      {
        "type": "chargeTable",
        "headerColor": "orange"
      },
      {
        "type": "wordsAndTotal"
      },
      {
        "type": "termsBank"
      },
      {
        "type": "containerStrip"
      },
      {
        "type": "colorfulFooter"
      }
    ]
  },
  {
    "code": "LEFTOVER_STANDARD_INVOICE_ARABIC_WITH_QR_CODE_JASPER_FORMAT3",
    "formatNumber": 3,
    "name": "Standard Invoice Arabic with QR code –Jasper Format3",
    "paper": "Letter",
    "rtl": true,
    "theme": {
      "primary": "#0F4D96",
      "accent": "#1C8C96",
      "fill": "#EDF9FF",
      "panel": "#DAF2FF",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#9BD8FF",
      "ink": "#101010",
      "gray": "#656565",
      "white": "#FFFFFF"
    },
    "branding": {
      "company": "KingFisher Wings",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "inquiry@kingfishertec.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "QTN-19-0003",
      "invoiceDate": "28-JAN-19",
      "dueDate": "28-FEB-19",
      "quotationNo": "QTN-19-0003",
      "billToName": "AL NASER TRADING COMPANY LLC",
      "billToAddress": "30 AL MAKTHOOM BUILDING, SHARJAH UAE",
      "currency": "USD",
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
      "subtotal": "1,380.00",
      "tax": "0.00",
      "total": "1,380.00",
      "words": "USD One Thousand Three Hundred Eighty Only",
      "remarks": "Format-3",
      "fieldGrid": [
        {
          "k": "POL",
          "v": "CHENNAI, INDIA"
        },
        {
          "k": "POD",
          "v": "JEBEL ALI, UAE"
        },
        {
          "k": "Incoterm",
          "v": "FOB"
        },
        {
          "k": "Validity",
          "v": "30 Days"
        },
        {
          "k": "Layout",
          "v": "Format-3"
        },
        {
          "k": "Paper",
          "v": "Letter"
        }
      ],
      "tableHeaders": [
        "#",
        "Charge",
        "Qty",
        "Rate",
        "Currency",
        "Amount"
      ],
      "tableRows": [
        [
          "1",
          "Ocean Freight",
          "1",
          "1,250.00",
          "USD",
          "1,250.00"
        ],
        [
          "2",
          "THC Origin",
          "1",
          "85.00",
          "USD",
          "85.00"
        ],
        [
          "3",
          "Documentation",
          "1",
          "45.00",
          "USD",
          "45.00"
        ]
      ],
      "termsLines": [
        "Rates are subject to carrier space and equipment availability.",
        "This quotation is a KingFisher layout preview (FRESA format)."
      ],
      "docSubtitle": "Standard Invoice Arabic"
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "arabicHeader"
      },
      {
        "type": "docTitle",
        "text": "فاتورة / INVOICE",
        "align": "center",
        "band": true
      },
      {
        "type": "twoColumn",
        "showBillTo": true,
        "rightMetaFrom": "metaRows"
      },
      {
        "type": "fieldGrid",
        "cols": 3
      },
      {
        "type": "chargeTable",
        "headerColor": "orange"
      },
      {
        "type": "wordsAndTotal"
      },
      {
        "type": "termsBank"
      },
      {
        "type": "formatBadge"
      },
      {
        "type": "colorfulFooter"
      }
    ]
  },
  {
    "code": "LEFTOVER_STANDARD_INVOICE_ARABIC_WITH_QR_CODE_JASPER_FORMAT4",
    "formatNumber": 4,
    "name": "Standard Invoice Arabic with QR code –Jasper Format4",
    "paper": "A4",
    "rtl": true,
    "theme": {
      "primary": "#0F4D96",
      "accent": "#1B8B95",
      "fill": "#EBF7FF",
      "panel": "#D8F0FD",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#9BD8FF",
      "ink": "#101010",
      "gray": "#656565",
      "white": "#FFFFFF"
    },
    "branding": {
      "company": "KingFisher Wings",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "inquiry@kingfishertec.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "QTN-19-0004",
      "invoiceDate": "28-JAN-19",
      "dueDate": "28-FEB-19",
      "quotationNo": "QTN-19-0004",
      "billToName": "AL NASER TRADING COMPANY LLC",
      "billToAddress": "30 AL MAKTHOOM BUILDING, SHARJAH UAE",
      "currency": "USD",
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
      "subtotal": "1,380.00",
      "tax": "0.00",
      "total": "1,380.00",
      "words": "USD One Thousand Three Hundred Eighty Only",
      "remarks": "Format-4",
      "fieldGrid": [
        {
          "k": "POL",
          "v": "CHENNAI, INDIA"
        },
        {
          "k": "POD",
          "v": "JEBEL ALI, UAE"
        },
        {
          "k": "Incoterm",
          "v": "FOB"
        },
        {
          "k": "Validity",
          "v": "30 Days"
        },
        {
          "k": "Layout",
          "v": "Format-4"
        }
      ],
      "tableHeaders": [
        "#",
        "Charge",
        "Qty",
        "Rate",
        "Currency",
        "Amount"
      ],
      "tableRows": [
        [
          "1",
          "Ocean Freight",
          "1",
          "1,250.00",
          "USD",
          "1,250.00"
        ],
        [
          "2",
          "THC Origin",
          "1",
          "85.00",
          "USD",
          "85.00"
        ],
        [
          "3",
          "Documentation",
          "1",
          "45.00",
          "USD",
          "45.00"
        ]
      ],
      "termsLines": [
        "Rates are subject to carrier space and equipment availability.",
        "This quotation is a KingFisher layout preview (FRESA format)."
      ],
      "letterBody": "Please confirm acceptance to proceed with booking.",
      "agingHeaders": [
        "Freight",
        "Local",
        "Docs",
        "Total"
      ],
      "agingRow": [
        "1,250.00",
        "85.00",
        "45.00",
        "1,380.00"
      ],
      "docSubtitle": "Standard Invoice Arabic"
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "arabicHeader"
      },
      {
        "type": "docTitle",
        "text": "فاتورة / INVOICE",
        "align": "start",
        "band": true
      },
      {
        "type": "twoColumn",
        "showBillTo": true,
        "rightMetaFrom": "metaRows"
      },
      {
        "type": "fieldGrid",
        "cols": 3
      },
      {
        "type": "chargeTable",
        "headerColor": "orange"
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
    "code": "LEFTOVER_STANDARD_INVOICE_ARABIC_WITH_QR_CODE_JASPER_FORMAT5",
    "formatNumber": 5,
    "name": "Standard Invoice Arabic with QR code –Jasper Format5",
    "paper": "A4",
    "rtl": true,
    "theme": {
      "primary": "#0F4D96",
      "accent": "#1A8A94",
      "fill": "#E9F5FD",
      "panel": "#D7EFFC",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#9AD7FF",
      "ink": "#101010",
      "gray": "#656565",
      "white": "#FFFFFF"
    },
    "branding": {
      "company": "KingFisher Wings",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "inquiry@kingfishertec.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "QTN-19-0005",
      "invoiceDate": "28-JAN-19",
      "dueDate": "28-FEB-19",
      "quotationNo": "QTN-19-0005",
      "billToName": "AL NASER TRADING COMPANY LLC",
      "billToAddress": "30 AL MAKTHOOM BUILDING, SHARJAH UAE",
      "currency": "USD",
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
      "subtotal": "1,380.00",
      "tax": "0.00",
      "total": "1,380.00",
      "words": "USD One Thousand Three Hundred Eighty Only",
      "remarks": "Format-5",
      "fieldGrid": [
        {
          "k": "POL",
          "v": "CHENNAI, INDIA"
        },
        {
          "k": "POD",
          "v": "JEBEL ALI, UAE"
        },
        {
          "k": "Incoterm",
          "v": "FOB"
        },
        {
          "k": "Validity",
          "v": "30 Days"
        },
        {
          "k": "Layout",
          "v": "Format-5"
        }
      ],
      "tableHeaders": [
        "#",
        "Charge",
        "Qty",
        "Rate",
        "Currency",
        "Amount"
      ],
      "tableRows": [
        [
          "1",
          "Ocean Freight",
          "1",
          "1,250.00",
          "USD",
          "1,250.00"
        ],
        [
          "2",
          "THC Origin",
          "1",
          "85.00",
          "USD",
          "85.00"
        ],
        [
          "3",
          "Documentation",
          "1",
          "45.00",
          "USD",
          "45.00"
        ]
      ],
      "termsLines": [
        "Rates are subject to carrier space and equipment availability.",
        "This quotation is a KingFisher layout preview (FRESA format)."
      ],
      "docSubtitle": "Standard Invoice Arabic"
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "arabicHeader"
      },
      {
        "type": "docTitle",
        "text": "فاتورة / INVOICE",
        "align": "end",
        "band": true
      },
      {
        "type": "twoColumn",
        "showBillTo": true,
        "rightMetaFrom": "metaRows"
      },
      {
        "type": "fieldGrid",
        "cols": 3
      },
      {
        "type": "chargeTable",
        "headerColor": "orange"
      },
      {
        "type": "wordsAndTotal"
      },
      {
        "type": "termsBank"
      },
      {
        "type": "containerStrip"
      },
      {
        "type": "agingSummary"
      },
      {
        "type": "colorfulFooter"
      }
    ]
  },
  {
    "code": "LEFTOVER_STANDARD_INVOICE_ARABIC_WITH_QR_CODE_JASPER_FORMAT7",
    "formatNumber": 7,
    "name": "Standard Invoice Arabic with QR code –Jasper Format7",
    "paper": "A4",
    "rtl": true,
    "theme": {
      "primary": "#0F4D96",
      "accent": "#1A8A94",
      "fill": "#E7F3FB",
      "panel": "#D5EDFA",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#9AD7FF",
      "ink": "#101010",
      "gray": "#656565",
      "white": "#FFFFFF"
    },
    "branding": {
      "company": "KingFisher Wings",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "inquiry@kingfishertec.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "QTN-19-0007",
      "invoiceDate": "28-JAN-19",
      "dueDate": "28-FEB-19",
      "quotationNo": "QTN-19-0007",
      "billToName": "AL NASER TRADING COMPANY LLC",
      "billToAddress": "30 AL MAKTHOOM BUILDING, SHARJAH UAE",
      "currency": "USD",
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
      "subtotal": "1,380.00",
      "tax": "0.00",
      "total": "1,380.00",
      "words": "USD One Thousand Three Hundred Eighty Only",
      "remarks": "Format-7",
      "fieldGrid": [
        {
          "k": "POL",
          "v": "CHENNAI, INDIA"
        },
        {
          "k": "POD",
          "v": "JEBEL ALI, UAE"
        },
        {
          "k": "Incoterm",
          "v": "FOB"
        },
        {
          "k": "Validity",
          "v": "30 Days"
        },
        {
          "k": "Layout",
          "v": "Format-7"
        }
      ],
      "tableHeaders": [
        "#",
        "Charge",
        "Qty",
        "Rate",
        "Currency",
        "Amount"
      ],
      "tableRows": [
        [
          "1",
          "Ocean Freight",
          "1",
          "1,250.00",
          "USD",
          "1,250.00"
        ],
        [
          "2",
          "THC Origin",
          "1",
          "85.00",
          "USD",
          "85.00"
        ],
        [
          "3",
          "Documentation",
          "1",
          "45.00",
          "USD",
          "45.00"
        ]
      ],
      "termsLines": [
        "Rates are subject to carrier space and equipment availability.",
        "This quotation is a KingFisher layout preview (FRESA format)."
      ],
      "docSubtitle": "Standard Invoice Arabic"
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "arabicHeader"
      },
      {
        "type": "docTitle",
        "text": "فاتورة / INVOICE",
        "align": "start",
        "band": false
      },
      {
        "type": "twoColumn",
        "showBillTo": true,
        "rightMetaFrom": "metaRows"
      },
      {
        "type": "fieldGrid",
        "cols": 3
      },
      {
        "type": "chargeTable",
        "headerColor": "accent"
      },
      {
        "type": "wordsAndTotal"
      },
      {
        "type": "termsBank"
      },
      {
        "type": "agingSummary"
      },
      {
        "type": "wireBox"
      },
      {
        "type": "colorfulFooter"
      }
    ]
  },
  {
    "code": "LEFTOVER_STANDARD_INVOICE_COURIER_JASPER",
    "formatNumber": 60,
    "name": "Standard Invoice Courier –Jasper",
    "paper": "A4",
    "rtl": false,
    "theme": {
      "primary": "#0F4D96",
      "accent": "#2185C7",
      "fill": "#E5F1F9",
      "panel": "#D4ECF9",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#99D6FE",
      "ink": "#101010",
      "gray": "#656565",
      "white": "#FFFFFF"
    },
    "branding": {
      "company": "KingFisher Wings",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "inquiry@kingfishertec.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "QTN-19-0060",
      "invoiceDate": "28-JAN-19",
      "dueDate": "28-FEB-19",
      "quotationNo": "QTN-19-0060",
      "billToName": "AL NASER TRADING COMPANY LLC",
      "billToAddress": "30 AL MAKTHOOM BUILDING, SHARJAH UAE",
      "currency": "USD",
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
      "subtotal": "1,380.00",
      "tax": "0.00",
      "total": "1,380.00",
      "words": "USD One Thousand Three Hundred Eighty Only",
      "remarks": "Format-60",
      "fieldGrid": [
        {
          "k": "POL",
          "v": "CHENNAI, INDIA"
        },
        {
          "k": "POD",
          "v": "JEBEL ALI, UAE"
        },
        {
          "k": "Incoterm",
          "v": "FOB"
        },
        {
          "k": "Validity",
          "v": "30 Days"
        },
        {
          "k": "Layout",
          "v": "Format-60"
        }
      ],
      "tableHeaders": [
        "#",
        "Charge",
        "Qty",
        "Rate",
        "Currency",
        "Amount"
      ],
      "tableRows": [
        [
          "1",
          "Ocean Freight",
          "1",
          "1,250.00",
          "USD",
          "1,250.00"
        ],
        [
          "2",
          "THC Origin",
          "1",
          "85.00",
          "USD",
          "85.00"
        ],
        [
          "3",
          "Documentation",
          "1",
          "45.00",
          "USD",
          "45.00"
        ]
      ],
      "termsLines": [
        "Rates are subject to carrier space and equipment availability.",
        "This quotation is a KingFisher layout preview (FRESA format)."
      ]
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "docTitle",
        "text": "STANDARD INVOICE COURIER –JASPER",
        "align": "center",
        "band": false
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
        "type": "subtotalBar",
        "variant": "tax"
      },
      {
        "type": "formatBadge"
      },
      {
        "type": "summaryHero"
      },
      {
        "type": "exportMetaStrip"
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
    "code": "LEFTOVER_STANDARD_INVOICE_CUM_ARRIVAL_NOTICE_JASPER_FORMAT16",
    "formatNumber": 16,
    "name": "Standard Invoice cum Arrival Notice –Jasper format16",
    "paper": "A4",
    "rtl": false,
    "theme": {
      "primary": "#0F4D96",
      "accent": "#2084C6",
      "fill": "#E3EFF7",
      "panel": "#D3EBF8",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#99D6FE",
      "ink": "#101010",
      "gray": "#656565",
      "white": "#FFFFFF"
    },
    "branding": {
      "company": "KingFisher Wings",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "inquiry@kingfishertec.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "QTN-19-0016",
      "invoiceDate": "28-JAN-19",
      "dueDate": "28-FEB-19",
      "quotationNo": "QTN-19-0016",
      "billToName": "AL NASER TRADING COMPANY LLC",
      "billToAddress": "30 AL MAKTHOOM BUILDING, SHARJAH UAE",
      "currency": "USD",
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
      "subtotal": "1,380.00",
      "tax": "0.00",
      "total": "1,380.00",
      "words": "USD One Thousand Three Hundred Eighty Only",
      "remarks": "Format-16",
      "fieldGrid": [
        {
          "k": "POL",
          "v": "CHENNAI, INDIA"
        },
        {
          "k": "POD",
          "v": "JEBEL ALI, UAE"
        },
        {
          "k": "Incoterm",
          "v": "FOB"
        },
        {
          "k": "Validity",
          "v": "30 Days"
        },
        {
          "k": "Layout",
          "v": "Format-16"
        }
      ],
      "tableHeaders": [
        "#",
        "Charge",
        "Qty",
        "Rate",
        "Currency",
        "Amount"
      ],
      "tableRows": [
        [
          "1",
          "Ocean Freight",
          "1",
          "1,250.00",
          "USD",
          "1,250.00"
        ],
        [
          "2",
          "THC Origin",
          "1",
          "85.00",
          "USD",
          "85.00"
        ],
        [
          "3",
          "Documentation",
          "1",
          "45.00",
          "USD",
          "45.00"
        ]
      ],
      "termsLines": [
        "Rates are subject to carrier space and equipment availability.",
        "This quotation is a KingFisher layout preview (FRESA format)."
      ],
      "letterBody": "Thank you for your enquiry. Please find our quotation below."
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "docTitle",
        "text": "STANDARD INVOICE CUM ARRIVAL NOTICE –JASPER FORMAT16",
        "align": "start",
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
    "code": "LEFTOVER_STANDARD_INVOICE_FCY_FORMAT2",
    "formatNumber": 2,
    "name": "Standard Invoice FCY Format2",
    "paper": "A4",
    "rtl": false,
    "theme": {
      "primary": "#0F4D96",
      "accent": "#2084C6",
      "fill": "#E7EBF8",
      "panel": "#E3EFF7",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#98D5FD",
      "ink": "#101010",
      "gray": "#656565",
      "white": "#FFFFFF"
    },
    "branding": {
      "company": "KingFisher Wings",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "inquiry@kingfishertec.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "QTN-19-0002",
      "invoiceDate": "28-JAN-19",
      "dueDate": "28-FEB-19",
      "quotationNo": "QTN-19-0002",
      "billToName": "AL NASER TRADING COMPANY LLC",
      "billToAddress": "30 AL MAKTHOOM BUILDING, SHARJAH UAE",
      "currency": "USD",
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
      "subtotal": "1,380.00",
      "tax": "0.00",
      "total": "1,380.00",
      "words": "USD One Thousand Three Hundred Eighty Only",
      "remarks": "Format-2",
      "fieldGrid": [
        {
          "k": "POL",
          "v": "CHENNAI, INDIA"
        },
        {
          "k": "POD",
          "v": "JEBEL ALI, UAE"
        },
        {
          "k": "Incoterm",
          "v": "FOB"
        },
        {
          "k": "Validity",
          "v": "30 Days"
        },
        {
          "k": "Layout",
          "v": "Format-2"
        }
      ],
      "tableHeaders": [
        "#",
        "Charge",
        "Qty",
        "Rate",
        "Currency",
        "Amount"
      ],
      "tableRows": [
        [
          "1",
          "Ocean Freight",
          "1",
          "1,250.00",
          "USD",
          "1,250.00"
        ],
        [
          "2",
          "THC Origin",
          "1",
          "85.00",
          "USD",
          "85.00"
        ],
        [
          "3",
          "Documentation",
          "1",
          "45.00",
          "USD",
          "45.00"
        ]
      ],
      "termsLines": [
        "Rates are subject to carrier space and equipment availability.",
        "This quotation is a KingFisher layout preview (FRESA format)."
      ]
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "docTitle",
        "text": "INVOICE / DEBIT NOTE",
        "align": "end",
        "band": false
      },
      {
        "type": "shipmentDetails",
        "fcyOrder": true,
        "showQuotation": true
      },
      {
        "type": "chargeTable",
        "headerColor": "primary"
      },
      {
        "type": "subtotalBar",
        "variant": "fcy"
      },
      {
        "type": "exportClosing",
        "showBullets": true
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
    "code": "LEFTOVER_STANDARD_INVOICE_FCY_WITH_QRIRN_JASPER",
    "formatNumber": 63,
    "name": "Standard Invoice FCY with QR/IRN –Jasper",
    "paper": "Letter",
    "rtl": false,
    "theme": {
      "primary": "#0F4D96",
      "accent": "#2589CB",
      "fill": "#F6FAFF",
      "panel": "#EEFAFF",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#9CD9FF",
      "ink": "#101010",
      "gray": "#656565",
      "white": "#FFFFFF"
    },
    "branding": {
      "company": "KingFisher Wings",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "inquiry@kingfishertec.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "QTN-19-0063",
      "invoiceDate": "28-JAN-19",
      "dueDate": "28-FEB-19",
      "quotationNo": "QTN-19-0063",
      "billToName": "AL NASER TRADING COMPANY LLC",
      "billToAddress": "30 AL MAKTHOOM BUILDING, SHARJAH UAE",
      "currency": "USD",
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
      "subtotal": "1,380.00",
      "tax": "0.00",
      "total": "1,380.00",
      "words": "USD One Thousand Three Hundred Eighty Only",
      "remarks": "Format-63",
      "fieldGrid": [
        {
          "k": "POL",
          "v": "CHENNAI, INDIA"
        },
        {
          "k": "POD",
          "v": "JEBEL ALI, UAE"
        },
        {
          "k": "Incoterm",
          "v": "FOB"
        },
        {
          "k": "Validity",
          "v": "30 Days"
        },
        {
          "k": "Layout",
          "v": "Format-63"
        },
        {
          "k": "Paper",
          "v": "Letter"
        }
      ],
      "tableHeaders": [
        "#",
        "Charge",
        "Qty",
        "Rate",
        "Currency",
        "Amount"
      ],
      "tableRows": [
        [
          "1",
          "Ocean Freight",
          "1",
          "1,250.00",
          "USD",
          "1,250.00"
        ],
        [
          "2",
          "THC Origin",
          "1",
          "85.00",
          "USD",
          "85.00"
        ],
        [
          "3",
          "Documentation",
          "1",
          "45.00",
          "USD",
          "45.00"
        ]
      ],
      "termsLines": [
        "Rates are subject to carrier space and equipment availability.",
        "This quotation is a KingFisher layout preview (FRESA format)."
      ]
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "docTitle",
        "text": "INVOICE / DEBIT NOTE",
        "align": "center",
        "band": false
      },
      {
        "type": "shipmentDetails",
        "fcyOrder": true,
        "showQuotation": true
      },
      {
        "type": "chargeTable",
        "headerColor": "primary"
      },
      {
        "type": "subtotalBar",
        "variant": "fcy"
      },
      {
        "type": "exportClosing",
        "showBullets": true
      },
      {
        "type": "jobDescription"
      },
      {
        "type": "colorfulFooter"
      }
    ]
  },
  {
    "code": "LEFTOVER_STANDARD_INVOICE_MALAYSIA",
    "formatNumber": 64,
    "name": "Standard Invoice-Malaysia",
    "paper": "A4",
    "rtl": false,
    "theme": {
      "primary": "#0F4D96",
      "accent": "#2488CA",
      "fill": "#EEFAFF",
      "panel": "#DAF2FF",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#9CD9FF",
      "ink": "#101010",
      "gray": "#656565",
      "white": "#FFFFFF"
    },
    "branding": {
      "company": "KingFisher Wings",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "inquiry@kingfishertec.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "QTN-19-0064",
      "invoiceDate": "28-JAN-19",
      "dueDate": "28-FEB-19",
      "quotationNo": "QTN-19-0064",
      "billToName": "AL NASER TRADING COMPANY LLC",
      "billToAddress": "30 AL MAKTHOOM BUILDING, SHARJAH UAE",
      "currency": "USD",
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
      "subtotal": "1,380.00",
      "tax": "0.00",
      "total": "1,380.00",
      "words": "USD One Thousand Three Hundred Eighty Only",
      "remarks": "Format-64",
      "fieldGrid": [
        {
          "k": "POL",
          "v": "CHENNAI, INDIA"
        },
        {
          "k": "POD",
          "v": "JEBEL ALI, UAE"
        },
        {
          "k": "Incoterm",
          "v": "FOB"
        },
        {
          "k": "Validity",
          "v": "30 Days"
        },
        {
          "k": "Layout",
          "v": "Format-64"
        }
      ],
      "tableHeaders": [
        "#",
        "Charge",
        "Qty",
        "Rate",
        "Currency",
        "Amount"
      ],
      "tableRows": [
        [
          "1",
          "Ocean Freight",
          "1",
          "1,250.00",
          "USD",
          "1,250.00"
        ],
        [
          "2",
          "THC Origin",
          "1",
          "85.00",
          "USD",
          "85.00"
        ],
        [
          "3",
          "Documentation",
          "1",
          "45.00",
          "USD",
          "45.00"
        ]
      ],
      "termsLines": [
        "Rates are subject to carrier space and equipment availability.",
        "This quotation is a KingFisher layout preview (FRESA format)."
      ],
      "letterBody": "Please confirm acceptance to proceed with booking.",
      "agingHeaders": [
        "Freight",
        "Local",
        "Docs",
        "Total"
      ],
      "agingRow": [
        "1,250.00",
        "85.00",
        "45.00",
        "1,380.00"
      ]
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "docTitle",
        "text": "STANDARD INVOICE-MALAYSIA",
        "align": "start",
        "band": false
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
        "type": "totalsOnly"
      },
      {
        "type": "termsBank"
      },
      {
        "type": "signatureRow"
      },
      {
        "type": "formatBadge"
      },
      {
        "type": "summaryHero"
      },
      {
        "type": "exportMetaStrip"
      },
      {
        "type": "containerStrip"
      },
      {
        "type": "agingSummary"
      },
      {
        "type": "colorfulFooter"
      }
    ]
  },
  {
    "code": "LEFTOVER_STANDARD_INVOICE_USA_FORMAT_2",
    "formatNumber": 2,
    "name": "Standard Invoice-USA Format 2",
    "paper": "Letter",
    "rtl": false,
    "theme": {
      "primary": "#0F4D96",
      "accent": "#2387C9",
      "fill": "#EFF4F8",
      "panel": "#EEF3F7",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#9BD8FF",
      "ink": "#101010",
      "gray": "#656565",
      "white": "#FFFFFF"
    },
    "branding": {
      "company": "KingFisher Wings",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "inquiry@kingfishertec.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "QTN-19-0002",
      "invoiceDate": "28-JAN-19",
      "dueDate": "28-FEB-19",
      "quotationNo": "QTN-19-0002",
      "billToName": "AL NASER TRADING COMPANY LLC",
      "billToAddress": "30 AL MAKTHOOM BUILDING, SHARJAH UAE",
      "currency": "USD",
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
      "subtotal": "1,380.00",
      "tax": "0.00",
      "total": "1,380.00",
      "words": "USD One Thousand Three Hundred Eighty Only",
      "remarks": "Format-2",
      "fieldGrid": [
        {
          "k": "POL",
          "v": "CHENNAI, INDIA"
        },
        {
          "k": "POD",
          "v": "JEBEL ALI, UAE"
        },
        {
          "k": "Incoterm",
          "v": "FOB"
        },
        {
          "k": "Validity",
          "v": "30 Days"
        },
        {
          "k": "Layout",
          "v": "Format-2"
        }
      ],
      "tableHeaders": [
        "#",
        "Charge",
        "Qty",
        "Rate",
        "Currency",
        "Amount"
      ],
      "tableRows": [
        [
          "1",
          "Ocean Freight",
          "1",
          "1,250.00",
          "USD",
          "1,250.00"
        ],
        [
          "2",
          "THC Origin",
          "1",
          "85.00",
          "USD",
          "85.00"
        ],
        [
          "3",
          "Documentation",
          "1",
          "45.00",
          "USD",
          "45.00"
        ]
      ],
      "termsLines": [
        "Rates are subject to carrier space and equipment availability.",
        "This quotation is a KingFisher layout preview (FRESA format)."
      ],
      "docSubtitle": "Standard Invoice USA"
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "docTitle",
        "text": "INVOICE",
        "align": "end",
        "band": true
      },
      {
        "type": "usaNumberedFields"
      },
      {
        "type": "twoColumn",
        "showBillTo": true,
        "rightMetaFrom": "metaRows"
      },
      {
        "type": "chargeTable",
        "headerColor": "orange"
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
    "code": "LEFTOVER_STANDARD_TAX_INVOICE_JASPER",
    "formatNumber": 66,
    "name": "Standard Tax Invoice –Jasper",
    "paper": "A4",
    "rtl": false,
    "theme": {
      "primary": "#0F4D96",
      "accent": "#2387C9",
      "fill": "#EAF6FE",
      "panel": "#D7EFFC",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#9BD8FF",
      "ink": "#101010",
      "gray": "#656565",
      "white": "#FFFFFF"
    },
    "branding": {
      "company": "KingFisher Wings",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "inquiry@kingfishertec.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "QTN-19-0066",
      "invoiceDate": "28-JAN-19",
      "dueDate": "28-FEB-19",
      "quotationNo": "QTN-19-0066",
      "billToName": "AL NASER TRADING COMPANY LLC",
      "billToAddress": "30 AL MAKTHOOM BUILDING, SHARJAH UAE",
      "currency": "USD",
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
      "subtotal": "1,380.00",
      "tax": "0.00",
      "total": "1,380.00",
      "words": "USD One Thousand Three Hundred Eighty Only",
      "remarks": "Format-66",
      "fieldGrid": [
        {
          "k": "POL",
          "v": "CHENNAI, INDIA"
        },
        {
          "k": "POD",
          "v": "JEBEL ALI, UAE"
        },
        {
          "k": "Incoterm",
          "v": "FOB"
        },
        {
          "k": "Validity",
          "v": "30 Days"
        },
        {
          "k": "Layout",
          "v": "Format-66"
        }
      ],
      "tableHeaders": [
        "#",
        "Charge",
        "Qty",
        "Rate",
        "Currency",
        "Amount"
      ],
      "tableRows": [
        [
          "1",
          "Ocean Freight",
          "1",
          "1,250.00",
          "USD",
          "1,250.00"
        ],
        [
          "2",
          "THC Origin",
          "1",
          "85.00",
          "USD",
          "85.00"
        ],
        [
          "3",
          "Documentation",
          "1",
          "45.00",
          "USD",
          "45.00"
        ]
      ],
      "termsLines": [
        "Rates are subject to carrier space and equipment availability.",
        "This quotation is a KingFisher layout preview (FRESA format)."
      ],
      "letterBody": "Thank you for your enquiry. Please find our quotation below."
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "docTitle",
        "text": "STANDARD TAX INVOICE –JASPER",
        "align": "center",
        "band": false
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
        "type": "subtotalBar",
        "variant": "tax"
      },
      {
        "type": "formatBadge"
      },
      {
        "type": "summaryHero"
      },
      {
        "type": "agingSummary"
      },
      {
        "type": "termsBank"
      },
      {
        "type": "signatureRow"
      },
      {
        "type": "jobDescription"
      },
      {
        "type": "colorfulFooter"
      }
    ]
  },
  {
    "code": "LEFTOVER_TAX_INVOICE_INDIA",
    "formatNumber": 67,
    "name": "TAX Invoice –India",
    "paper": "A4",
    "rtl": false,
    "theme": {
      "primary": "#000000",
      "accent": "#2286C8",
      "fill": "#F3F3F3",
      "panel": "#F3F3F3",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#9AD7FF",
      "ink": "#101010",
      "gray": "#656565",
      "white": "#FFFFFF"
    },
    "branding": {
      "company": "KingFisher Wings",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "inquiry@kingfishertec.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "QTN-19-0067",
      "invoiceDate": "28-JAN-19",
      "dueDate": "28-FEB-19",
      "quotationNo": "QTN-19-0067",
      "billToName": "AL NASER TRADING COMPANY LLC",
      "billToAddress": "30 AL MAKTHOOM BUILDING, SHARJAH UAE",
      "currency": "INR",
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
      "subtotal": "1,380.00",
      "tax": "0.00",
      "total": "1,380.00",
      "words": "USD One Thousand Three Hundred Eighty Only",
      "remarks": "Format-67",
      "fieldGrid": [
        {
          "k": "POL",
          "v": "CHENNAI, INDIA"
        },
        {
          "k": "POD",
          "v": "JEBEL ALI, UAE"
        },
        {
          "k": "Incoterm",
          "v": "FOB"
        },
        {
          "k": "Validity",
          "v": "30 Days"
        },
        {
          "k": "Layout",
          "v": "Format-67"
        }
      ],
      "tableHeaders": [
        "#",
        "Charge",
        "Qty",
        "Rate",
        "Currency",
        "Amount"
      ],
      "tableRows": [
        [
          "1",
          "Ocean Freight",
          "1",
          "1,250.00",
          "USD",
          "1,250.00"
        ],
        [
          "2",
          "THC Origin",
          "1",
          "85.00",
          "USD",
          "85.00"
        ],
        [
          "3",
          "Documentation",
          "1",
          "45.00",
          "USD",
          "45.00"
        ]
      ],
      "termsLines": [
        "Rates are subject to carrier space and equipment availability.",
        "This quotation is a KingFisher layout preview (FRESA format)."
      ],
      "docSubtitle": "Tax Invoice India"
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "docTitle",
        "text": "TAX INVOICE",
        "align": "start",
        "band": false
      },
      {
        "type": "exportMetaStrip"
      },
      {
        "type": "shipmentDetails",
        "showTermsOfShipment": true,
        "showPlaceOfSupply": true
      },
      {
        "type": "partyTriple"
      },
      {
        "type": "chargeTable",
        "headerColor": "primary"
      },
      {
        "type": "subtotalBar",
        "variant": "tax"
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
    "code": "LEFTOVER_TAX_INVOICE_INDIA_REIMBURSEMENT_BILL",
    "formatNumber": 68,
    "name": "TAX Invoice –India (Reimbursement Bill)",
    "paper": "Letter",
    "rtl": false,
    "theme": {
      "primary": "#000000",
      "accent": "#2185C7",
      "fill": "#F1F1F1",
      "panel": "#F2F2F2",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#9AD7FF",
      "ink": "#101010",
      "gray": "#656565",
      "white": "#FFFFFF"
    },
    "branding": {
      "company": "KingFisher Wings",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "inquiry@kingfishertec.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "QTN-19-0068",
      "invoiceDate": "28-JAN-19",
      "dueDate": "28-FEB-19",
      "quotationNo": "QTN-19-0068",
      "billToName": "AL NASER TRADING COMPANY LLC",
      "billToAddress": "30 AL MAKTHOOM BUILDING, SHARJAH UAE",
      "currency": "INR",
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
      "subtotal": "1,380.00",
      "tax": "0.00",
      "total": "1,380.00",
      "words": "USD One Thousand Three Hundred Eighty Only",
      "remarks": "Format-68",
      "fieldGrid": [
        {
          "k": "POL",
          "v": "CHENNAI, INDIA"
        },
        {
          "k": "POD",
          "v": "JEBEL ALI, UAE"
        },
        {
          "k": "Incoterm",
          "v": "FOB"
        },
        {
          "k": "Validity",
          "v": "30 Days"
        },
        {
          "k": "Layout",
          "v": "Format-68"
        },
        {
          "k": "Paper",
          "v": "Letter"
        }
      ],
      "tableHeaders": [
        "#",
        "Charge",
        "Qty",
        "Rate",
        "Currency",
        "Amount"
      ],
      "tableRows": [
        [
          "1",
          "Ocean Freight",
          "1",
          "1,250.00",
          "USD",
          "1,250.00"
        ],
        [
          "2",
          "THC Origin",
          "1",
          "85.00",
          "USD",
          "85.00"
        ],
        [
          "3",
          "Documentation",
          "1",
          "45.00",
          "USD",
          "45.00"
        ]
      ],
      "termsLines": [
        "Rates are subject to carrier space and equipment availability.",
        "This quotation is a KingFisher layout preview (FRESA format)."
      ],
      "docSubtitle": "Tax Invoice India"
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "docTitle",
        "text": "TAX INVOICE",
        "align": "end",
        "band": false
      },
      {
        "type": "exportMetaStrip"
      },
      {
        "type": "shipmentDetails",
        "showTermsOfShipment": true,
        "showPlaceOfSupply": true
      },
      {
        "type": "partyTriple"
      },
      {
        "type": "chargeTable",
        "headerColor": "primary"
      },
      {
        "type": "subtotalBar",
        "variant": "tax"
      },
      {
        "type": "exportClosing"
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
    "code": "LEFTOVER_TAX_INVOICE_INDIA_FORMAT1",
    "formatNumber": 1,
    "name": "TAX Invoice –India format1",
    "paper": "A4",
    "rtl": false,
    "theme": {
      "primary": "#000000",
      "accent": "#2185C7",
      "fill": "#EFEFEF",
      "panel": "#F0F0F0",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#99D6FE",
      "ink": "#101010",
      "gray": "#656565",
      "white": "#FFFFFF"
    },
    "branding": {
      "company": "KingFisher Wings",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "inquiry@kingfishertec.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "QTN-19-0001",
      "invoiceDate": "28-JAN-19",
      "dueDate": "28-FEB-19",
      "quotationNo": "QTN-19-0001",
      "billToName": "AL NASER TRADING COMPANY LLC",
      "billToAddress": "30 AL MAKTHOOM BUILDING, SHARJAH UAE",
      "currency": "INR",
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
      "subtotal": "1,380.00",
      "tax": "0.00",
      "total": "1,380.00",
      "words": "USD One Thousand Three Hundred Eighty Only",
      "remarks": "Format-1",
      "fieldGrid": [
        {
          "k": "POL",
          "v": "CHENNAI, INDIA"
        },
        {
          "k": "POD",
          "v": "JEBEL ALI, UAE"
        },
        {
          "k": "Incoterm",
          "v": "FOB"
        },
        {
          "k": "Validity",
          "v": "30 Days"
        },
        {
          "k": "Layout",
          "v": "Format-1"
        }
      ],
      "tableHeaders": [
        "#",
        "Charge",
        "Qty",
        "Rate",
        "Currency",
        "Amount"
      ],
      "tableRows": [
        [
          "1",
          "Ocean Freight",
          "1",
          "1,250.00",
          "USD",
          "1,250.00"
        ],
        [
          "2",
          "THC Origin",
          "1",
          "85.00",
          "USD",
          "85.00"
        ],
        [
          "3",
          "Documentation",
          "1",
          "45.00",
          "USD",
          "45.00"
        ]
      ],
      "termsLines": [
        "Rates are subject to carrier space and equipment availability.",
        "This quotation is a KingFisher layout preview (FRESA format)."
      ],
      "letterBody": "Thank you for your enquiry. Please find our quotation below.",
      "docSubtitle": "Tax Invoice India"
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "docTitle",
        "text": "TAX INVOICE",
        "align": "start",
        "band": false
      },
      {
        "type": "exportMetaStrip"
      },
      {
        "type": "shipmentDetails",
        "showTermsOfShipment": true,
        "showPlaceOfSupply": true
      },
      {
        "type": "partyTriple"
      },
      {
        "type": "chargeTable",
        "headerColor": "orange"
      },
      {
        "type": "subtotalBar",
        "variant": "tax"
      },
      {
        "type": "exportClosing"
      },
      {
        "type": "agingSummary"
      },
      {
        "type": "colorfulFooter"
      }
    ]
  },
  {
    "code": "LEFTOVER_TAX_INVOICE_INDIA_FORMAT2",
    "formatNumber": 2,
    "name": "TAX Invoice –India format2",
    "paper": "A4",
    "rtl": false,
    "theme": {
      "primary": "#000000",
      "accent": "#2084C6",
      "fill": "#EDEDED",
      "panel": "#EFEFEF",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#99D6FE",
      "ink": "#101010",
      "gray": "#656565",
      "white": "#FFFFFF"
    },
    "branding": {
      "company": "KingFisher Wings",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "inquiry@kingfishertec.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "QTN-19-0002",
      "invoiceDate": "28-JAN-19",
      "dueDate": "28-FEB-19",
      "quotationNo": "QTN-19-0002",
      "billToName": "AL NASER TRADING COMPANY LLC",
      "billToAddress": "30 AL MAKTHOOM BUILDING, SHARJAH UAE",
      "currency": "INR",
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
      "subtotal": "1,380.00",
      "tax": "0.00",
      "total": "1,380.00",
      "words": "USD One Thousand Three Hundred Eighty Only",
      "remarks": "Format-2",
      "fieldGrid": [
        {
          "k": "POL",
          "v": "CHENNAI, INDIA"
        },
        {
          "k": "POD",
          "v": "JEBEL ALI, UAE"
        },
        {
          "k": "Incoterm",
          "v": "FOB"
        },
        {
          "k": "Validity",
          "v": "30 Days"
        },
        {
          "k": "Layout",
          "v": "Format-2"
        }
      ],
      "tableHeaders": [
        "#",
        "Charge",
        "Qty",
        "Rate",
        "Currency",
        "Amount"
      ],
      "tableRows": [
        [
          "1",
          "Ocean Freight",
          "1",
          "1,250.00",
          "USD",
          "1,250.00"
        ],
        [
          "2",
          "THC Origin",
          "1",
          "85.00",
          "USD",
          "85.00"
        ],
        [
          "3",
          "Documentation",
          "1",
          "45.00",
          "USD",
          "45.00"
        ]
      ],
      "termsLines": [
        "Rates are subject to carrier space and equipment availability.",
        "This quotation is a KingFisher layout preview (FRESA format)."
      ],
      "docSubtitle": "Tax Invoice India"
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "docTitle",
        "text": "TAX INVOICE",
        "align": "end",
        "band": false
      },
      {
        "type": "exportMetaStrip"
      },
      {
        "type": "shipmentDetails",
        "showTermsOfShipment": true,
        "showPlaceOfSupply": true
      },
      {
        "type": "partyTriple"
      },
      {
        "type": "chargeTable",
        "headerColor": "orange"
      },
      {
        "type": "subtotalBar",
        "variant": "tax"
      },
      {
        "type": "exportClosing"
      },
      {
        "type": "letterBody"
      },
      {
        "type": "summaryHero"
      },
      {
        "type": "colorfulFooter"
      }
    ]
  },
  {
    "code": "LEFTOVER_TAX_INVOICE_INDIA_FORMAT2_JASPER",
    "formatNumber": 2,
    "name": "TAX Invoice –India format2 Jasper",
    "paper": "A4",
    "rtl": false,
    "theme": {
      "primary": "#000000",
      "accent": "#1F83C5",
      "fill": "#EBEBEB",
      "panel": "#EDEDED",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#98D5FD",
      "ink": "#101010",
      "gray": "#656565",
      "white": "#FFFFFF"
    },
    "branding": {
      "company": "KingFisher Wings",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "inquiry@kingfishertec.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "QTN-19-0002",
      "invoiceDate": "28-JAN-19",
      "dueDate": "28-FEB-19",
      "quotationNo": "QTN-19-0002",
      "billToName": "AL NASER TRADING COMPANY LLC",
      "billToAddress": "30 AL MAKTHOOM BUILDING, SHARJAH UAE",
      "currency": "INR",
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
      "subtotal": "1,380.00",
      "tax": "0.00",
      "total": "1,380.00",
      "words": "USD One Thousand Three Hundred Eighty Only",
      "remarks": "Format-2",
      "fieldGrid": [
        {
          "k": "POL",
          "v": "CHENNAI, INDIA"
        },
        {
          "k": "POD",
          "v": "JEBEL ALI, UAE"
        },
        {
          "k": "Incoterm",
          "v": "FOB"
        },
        {
          "k": "Validity",
          "v": "30 Days"
        },
        {
          "k": "Layout",
          "v": "Format-2"
        }
      ],
      "tableHeaders": [
        "#",
        "Charge",
        "Qty",
        "Rate",
        "Currency",
        "Amount"
      ],
      "tableRows": [
        [
          "1",
          "Ocean Freight",
          "1",
          "1,250.00",
          "USD",
          "1,250.00"
        ],
        [
          "2",
          "THC Origin",
          "1",
          "85.00",
          "USD",
          "85.00"
        ],
        [
          "3",
          "Documentation",
          "1",
          "45.00",
          "USD",
          "45.00"
        ]
      ],
      "termsLines": [
        "Rates are subject to carrier space and equipment availability.",
        "This quotation is a KingFisher layout preview (FRESA format)."
      ],
      "docSubtitle": "Tax Invoice India"
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "docTitle",
        "text": "TAX INVOICE",
        "align": "end",
        "band": true
      },
      {
        "type": "exportMetaStrip"
      },
      {
        "type": "shipmentDetails",
        "showTermsOfShipment": true,
        "showPlaceOfSupply": true
      },
      {
        "type": "partyTriple"
      },
      {
        "type": "chargeTable",
        "headerColor": "cyan"
      },
      {
        "type": "subtotalBar",
        "variant": "tax"
      },
      {
        "type": "exportClosing"
      },
      {
        "type": "containerStrip"
      },
      {
        "type": "colorfulFooter"
      }
    ]
  },
  {
    "code": "LEFTOVER_TAX_INVOICE_INDIA_FORMAT6_JASPER",
    "formatNumber": 6,
    "name": "TAX Invoice –India format6 Jasper",
    "paper": "A4",
    "rtl": false,
    "theme": {
      "primary": "#000000",
      "accent": "#2488CA",
      "fill": "#FAFAFA",
      "panel": "#F8F8F8",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#9CD9FF",
      "ink": "#101010",
      "gray": "#656565",
      "white": "#FFFFFF"
    },
    "branding": {
      "company": "KingFisher Wings",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "inquiry@kingfishertec.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "QTN-19-0006",
      "invoiceDate": "28-JAN-19",
      "dueDate": "28-FEB-19",
      "quotationNo": "QTN-19-0006",
      "billToName": "AL NASER TRADING COMPANY LLC",
      "billToAddress": "30 AL MAKTHOOM BUILDING, SHARJAH UAE",
      "currency": "INR",
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
      "subtotal": "1,380.00",
      "tax": "0.00",
      "total": "1,380.00",
      "words": "USD One Thousand Three Hundred Eighty Only",
      "remarks": "Format-6",
      "fieldGrid": [
        {
          "k": "POL",
          "v": "CHENNAI, INDIA"
        },
        {
          "k": "POD",
          "v": "JEBEL ALI, UAE"
        },
        {
          "k": "Incoterm",
          "v": "FOB"
        },
        {
          "k": "Validity",
          "v": "30 Days"
        },
        {
          "k": "Layout",
          "v": "Format-6"
        }
      ],
      "tableHeaders": [
        "#",
        "Charge",
        "Qty",
        "Rate",
        "Currency",
        "Amount"
      ],
      "tableRows": [
        [
          "1",
          "Ocean Freight",
          "1",
          "1,250.00",
          "USD",
          "1,250.00"
        ],
        [
          "2",
          "THC Origin",
          "1",
          "85.00",
          "USD",
          "85.00"
        ],
        [
          "3",
          "Documentation",
          "1",
          "45.00",
          "USD",
          "45.00"
        ]
      ],
      "termsLines": [
        "Rates are subject to carrier space and equipment availability.",
        "This quotation is a KingFisher layout preview (FRESA format)."
      ],
      "letterBody": "Thank you for your enquiry. Please find our quotation below.",
      "docSubtitle": "Tax Invoice India"
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "docTitle",
        "text": "TAX INVOICE",
        "align": "center",
        "band": false
      },
      {
        "type": "exportMetaStrip"
      },
      {
        "type": "shipmentDetails",
        "showTermsOfShipment": true,
        "showPlaceOfSupply": true
      },
      {
        "type": "partyTriple"
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
        "type": "exportClosing"
      },
      {
        "type": "exportMetaStrip"
      },
      {
        "type": "colorfulFooter"
      }
    ]
  },
  {
    "code": "LEFTOVER_TAX_INVOICE_INDIA_FORMAT7_JASPER",
    "formatNumber": 7,
    "name": "TAX Invoice –India format7 Jasper",
    "paper": "A4",
    "rtl": false,
    "theme": {
      "primary": "#000000",
      "accent": "#2488CA",
      "fill": "#F8F8F8",
      "panel": "#F7F7F7",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#9BD8FF",
      "ink": "#101010",
      "gray": "#656565",
      "white": "#FFFFFF"
    },
    "branding": {
      "company": "KingFisher Wings",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "inquiry@kingfishertec.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "QTN-19-0007",
      "invoiceDate": "28-JAN-19",
      "dueDate": "28-FEB-19",
      "quotationNo": "QTN-19-0007",
      "billToName": "AL NASER TRADING COMPANY LLC",
      "billToAddress": "30 AL MAKTHOOM BUILDING, SHARJAH UAE",
      "currency": "INR",
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
      "subtotal": "1,380.00",
      "tax": "0.00",
      "total": "1,380.00",
      "words": "USD One Thousand Three Hundred Eighty Only",
      "remarks": "Format-7",
      "fieldGrid": [
        {
          "k": "POL",
          "v": "CHENNAI, INDIA"
        },
        {
          "k": "POD",
          "v": "JEBEL ALI, UAE"
        },
        {
          "k": "Incoterm",
          "v": "FOB"
        },
        {
          "k": "Validity",
          "v": "30 Days"
        },
        {
          "k": "Layout",
          "v": "Format-7"
        }
      ],
      "tableHeaders": [
        "#",
        "Charge",
        "Qty",
        "Rate",
        "Currency",
        "Amount"
      ],
      "tableRows": [
        [
          "1",
          "Ocean Freight",
          "1",
          "1,250.00",
          "USD",
          "1,250.00"
        ],
        [
          "2",
          "THC Origin",
          "1",
          "85.00",
          "USD",
          "85.00"
        ],
        [
          "3",
          "Documentation",
          "1",
          "45.00",
          "USD",
          "45.00"
        ]
      ],
      "termsLines": [
        "Rates are subject to carrier space and equipment availability.",
        "This quotation is a KingFisher layout preview (FRESA format)."
      ],
      "docSubtitle": "Tax Invoice India"
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "docTitle",
        "text": "TAX INVOICE",
        "align": "start",
        "band": false
      },
      {
        "type": "exportMetaStrip"
      },
      {
        "type": "shipmentDetails",
        "showTermsOfShipment": true,
        "showPlaceOfSupply": true
      },
      {
        "type": "partyTriple"
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
        "type": "exportClosing"
      },
      {
        "type": "taxAmountBox"
      },
      {
        "type": "colorfulFooter"
      }
    ]
  },
  {
    "code": "LEFTOVER_TAX_INVOICE_INDIA_FORMAT8_JASPER",
    "formatNumber": 8,
    "name": "TAX Invoice –India format8 Jasper",
    "paper": "Letter",
    "rtl": false,
    "theme": {
      "primary": "#000000",
      "accent": "#2387C9",
      "fill": "#F6F6F6",
      "panel": "#F5F5F5",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#9BD8FF",
      "ink": "#101010",
      "gray": "#656565",
      "white": "#FFFFFF"
    },
    "branding": {
      "company": "KingFisher Wings",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "inquiry@kingfishertec.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "QTN-19-0008",
      "invoiceDate": "28-JAN-19",
      "dueDate": "28-FEB-19",
      "quotationNo": "QTN-19-0008",
      "billToName": "AL NASER TRADING COMPANY LLC",
      "billToAddress": "30 AL MAKTHOOM BUILDING, SHARJAH UAE",
      "currency": "INR",
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
      "subtotal": "1,380.00",
      "tax": "0.00",
      "total": "1,380.00",
      "words": "USD One Thousand Three Hundred Eighty Only",
      "remarks": "Format-8",
      "fieldGrid": [
        {
          "k": "POL",
          "v": "CHENNAI, INDIA"
        },
        {
          "k": "POD",
          "v": "JEBEL ALI, UAE"
        },
        {
          "k": "Incoterm",
          "v": "FOB"
        },
        {
          "k": "Validity",
          "v": "30 Days"
        },
        {
          "k": "Layout",
          "v": "Format-8"
        },
        {
          "k": "Paper",
          "v": "Letter"
        }
      ],
      "tableHeaders": [
        "#",
        "Charge",
        "Qty",
        "Rate",
        "Currency",
        "Amount"
      ],
      "tableRows": [
        [
          "1",
          "Ocean Freight",
          "1",
          "1,250.00",
          "USD",
          "1,250.00"
        ],
        [
          "2",
          "THC Origin",
          "1",
          "85.00",
          "USD",
          "85.00"
        ],
        [
          "3",
          "Documentation",
          "1",
          "45.00",
          "USD",
          "45.00"
        ]
      ],
      "termsLines": [
        "Rates are subject to carrier space and equipment availability.",
        "This quotation is a KingFisher layout preview (FRESA format)."
      ],
      "docSubtitle": "Tax Invoice India"
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "docTitle",
        "text": "TAX INVOICE",
        "align": "end",
        "band": false
      },
      {
        "type": "exportMetaStrip"
      },
      {
        "type": "shipmentDetails",
        "showTermsOfShipment": true,
        "showPlaceOfSupply": true
      },
      {
        "type": "partyTriple"
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
        "type": "exportClosing"
      },
      {
        "type": "usaNumberedFields"
      },
      {
        "type": "colorfulFooter"
      }
    ]
  },
  {
    "code": "LEFTOVER_TAX_INVOICE_INDIA_JASPER",
    "formatNumber": 75,
    "name": "TAX Invoice –India Jasper",
    "paper": "A4",
    "rtl": false,
    "theme": {
      "primary": "#000000",
      "accent": "#2286C8",
      "fill": "#F4F4F4",
      "panel": "#F4F4F4",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#9AD7FF",
      "ink": "#101010",
      "gray": "#656565",
      "white": "#FFFFFF"
    },
    "branding": {
      "company": "KingFisher Wings",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "inquiry@kingfishertec.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "QTN-19-0075",
      "invoiceDate": "28-JAN-19",
      "dueDate": "28-FEB-19",
      "quotationNo": "QTN-19-0075",
      "billToName": "AL NASER TRADING COMPANY LLC",
      "billToAddress": "30 AL MAKTHOOM BUILDING, SHARJAH UAE",
      "currency": "INR",
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
      "subtotal": "1,380.00",
      "tax": "0.00",
      "total": "1,380.00",
      "words": "USD One Thousand Three Hundred Eighty Only",
      "remarks": "Format-75",
      "fieldGrid": [
        {
          "k": "POL",
          "v": "CHENNAI, INDIA"
        },
        {
          "k": "POD",
          "v": "JEBEL ALI, UAE"
        },
        {
          "k": "Incoterm",
          "v": "FOB"
        },
        {
          "k": "Validity",
          "v": "30 Days"
        },
        {
          "k": "Layout",
          "v": "Format-75"
        }
      ],
      "tableHeaders": [
        "#",
        "Charge",
        "Qty",
        "Rate",
        "Currency",
        "Amount"
      ],
      "tableRows": [
        [
          "1",
          "Ocean Freight",
          "1",
          "1,250.00",
          "USD",
          "1,250.00"
        ],
        [
          "2",
          "THC Origin",
          "1",
          "85.00",
          "USD",
          "85.00"
        ],
        [
          "3",
          "Documentation",
          "1",
          "45.00",
          "USD",
          "45.00"
        ]
      ],
      "termsLines": [
        "Rates are subject to carrier space and equipment availability.",
        "This quotation is a KingFisher layout preview (FRESA format)."
      ],
      "docSubtitle": "Tax Invoice India"
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "docTitle",
        "text": "TAX INVOICE",
        "align": "center",
        "band": false
      },
      {
        "type": "exportMetaStrip"
      },
      {
        "type": "shipmentDetails",
        "showTermsOfShipment": true,
        "showPlaceOfSupply": true
      },
      {
        "type": "partyTriple"
      },
      {
        "type": "chargeTable",
        "headerColor": "primary"
      },
      {
        "type": "subtotalBar",
        "variant": "tax"
      },
      {
        "type": "exportClosing"
      },
      {
        "type": "jobDescription"
      },
      {
        "type": "colorfulFooter"
      }
    ]
  },
  {
    "code": "LEFTOVER_TAX_INVOICE_INDIA_JASPER_FORMAT1",
    "formatNumber": 1,
    "name": "TAX Invoice –India Jasper Format1",
    "paper": "A4",
    "rtl": false,
    "theme": {
      "primary": "#000000",
      "accent": "#2286C8",
      "fill": "#F2F2F2",
      "panel": "#F2F2F2",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#9AD7FF",
      "ink": "#101010",
      "gray": "#656565",
      "white": "#FFFFFF"
    },
    "branding": {
      "company": "KingFisher Wings",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "inquiry@kingfishertec.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "QTN-19-0001",
      "invoiceDate": "28-JAN-19",
      "dueDate": "28-FEB-19",
      "quotationNo": "QTN-19-0001",
      "billToName": "AL NASER TRADING COMPANY LLC",
      "billToAddress": "30 AL MAKTHOOM BUILDING, SHARJAH UAE",
      "currency": "INR",
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
      "subtotal": "1,380.00",
      "tax": "0.00",
      "total": "1,380.00",
      "words": "USD One Thousand Three Hundred Eighty Only",
      "remarks": "Format-1",
      "fieldGrid": [
        {
          "k": "POL",
          "v": "CHENNAI, INDIA"
        },
        {
          "k": "POD",
          "v": "JEBEL ALI, UAE"
        },
        {
          "k": "Incoterm",
          "v": "FOB"
        },
        {
          "k": "Validity",
          "v": "30 Days"
        },
        {
          "k": "Layout",
          "v": "Format-1"
        }
      ],
      "tableHeaders": [
        "#",
        "Charge",
        "Qty",
        "Rate",
        "Currency",
        "Amount"
      ],
      "tableRows": [
        [
          "1",
          "Ocean Freight",
          "1",
          "1,250.00",
          "USD",
          "1,250.00"
        ],
        [
          "2",
          "THC Origin",
          "1",
          "85.00",
          "USD",
          "85.00"
        ],
        [
          "3",
          "Documentation",
          "1",
          "45.00",
          "USD",
          "45.00"
        ]
      ],
      "termsLines": [
        "Rates are subject to carrier space and equipment availability.",
        "This quotation is a KingFisher layout preview (FRESA format)."
      ],
      "letterBody": "Thank you for your enquiry. Please find our quotation below.",
      "docSubtitle": "Tax Invoice India"
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "docTitle",
        "text": "TAX INVOICE",
        "align": "start",
        "band": true
      },
      {
        "type": "exportMetaStrip"
      },
      {
        "type": "shipmentDetails",
        "showTermsOfShipment": true,
        "showPlaceOfSupply": true
      },
      {
        "type": "partyTriple"
      },
      {
        "type": "chargeTable",
        "headerColor": "primary"
      },
      {
        "type": "subtotalBar",
        "variant": "tax"
      },
      {
        "type": "exportClosing"
      },
      {
        "type": "summaryHero"
      },
      {
        "type": "colorfulFooter"
      }
    ]
  },
  {
    "code": "LEFTOVER_TAX_INVOICE_MALAYSIA_JASPER",
    "formatNumber": 77,
    "name": "Tax Invoice Malaysia –Jasper",
    "paper": "A4",
    "rtl": false,
    "theme": {
      "primary": "#0F4D96",
      "accent": "#2185C7",
      "fill": "#E5F1F9",
      "panel": "#D4ECF9",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#99D6FE",
      "ink": "#101010",
      "gray": "#656565",
      "white": "#FFFFFF"
    },
    "branding": {
      "company": "KingFisher Wings",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "inquiry@kingfishertec.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "QTN-19-0077",
      "invoiceDate": "28-JAN-19",
      "dueDate": "28-FEB-19",
      "quotationNo": "QTN-19-0077",
      "billToName": "AL NASER TRADING COMPANY LLC",
      "billToAddress": "30 AL MAKTHOOM BUILDING, SHARJAH UAE",
      "currency": "USD",
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
      "subtotal": "1,380.00",
      "tax": "0.00",
      "total": "1,380.00",
      "words": "USD One Thousand Three Hundred Eighty Only",
      "remarks": "Format-77",
      "fieldGrid": [
        {
          "k": "POL",
          "v": "CHENNAI, INDIA"
        },
        {
          "k": "POD",
          "v": "JEBEL ALI, UAE"
        },
        {
          "k": "Incoterm",
          "v": "FOB"
        },
        {
          "k": "Validity",
          "v": "30 Days"
        },
        {
          "k": "Layout",
          "v": "Format-77"
        }
      ],
      "tableHeaders": [
        "#",
        "Charge",
        "Qty",
        "Rate",
        "Currency",
        "Amount"
      ],
      "tableRows": [
        [
          "1",
          "Ocean Freight",
          "1",
          "1,250.00",
          "USD",
          "1,250.00"
        ],
        [
          "2",
          "THC Origin",
          "1",
          "85.00",
          "USD",
          "85.00"
        ],
        [
          "3",
          "Documentation",
          "1",
          "45.00",
          "USD",
          "45.00"
        ]
      ],
      "termsLines": [
        "Rates are subject to carrier space and equipment availability.",
        "This quotation is a KingFisher layout preview (FRESA format)."
      ]
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "docTitle",
        "text": "TAX INVOICE MALAYSIA –JASPER",
        "align": "end",
        "band": false
      },
      {
        "type": "twoColumn",
        "showBillTo": true,
        "rightMetaFrom": "metaRows"
      },
      {
        "type": "fieldGrid",
        "cols": 2
      },
      {
        "type": "formatBadge"
      },
      {
        "type": "letterBody"
      },
      {
        "type": "jobDescription"
      },
      {
        "type": "stampSignature"
      },
      {
        "type": "chargeTable",
        "headerColor": "primary"
      },
      {
        "type": "wordsAndTotal"
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
    "code": "LEFTOVER_TAX_INVOICE_SINGAPORE_JASPER",
    "formatNumber": 78,
    "name": "Tax Invoice Singapore –Jasper",
    "paper": "Letter",
    "rtl": false,
    "theme": {
      "primary": "#0F4D96",
      "accent": "#2084C6",
      "fill": "#E3EFF7",
      "panel": "#D3EBF8",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#99D6FE",
      "ink": "#101010",
      "gray": "#656565",
      "white": "#FFFFFF"
    },
    "branding": {
      "company": "KingFisher Wings",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "inquiry@kingfishertec.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "QTN-19-0078",
      "invoiceDate": "28-JAN-19",
      "dueDate": "28-FEB-19",
      "quotationNo": "QTN-19-0078",
      "billToName": "AL NASER TRADING COMPANY LLC",
      "billToAddress": "30 AL MAKTHOOM BUILDING, SHARJAH UAE",
      "currency": "USD",
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
      "subtotal": "1,380.00",
      "tax": "0.00",
      "total": "1,380.00",
      "words": "USD One Thousand Three Hundred Eighty Only",
      "remarks": "Format-78",
      "fieldGrid": [
        {
          "k": "POL",
          "v": "CHENNAI, INDIA"
        },
        {
          "k": "POD",
          "v": "JEBEL ALI, UAE"
        },
        {
          "k": "Incoterm",
          "v": "FOB"
        },
        {
          "k": "Validity",
          "v": "30 Days"
        },
        {
          "k": "Layout",
          "v": "Format-78"
        },
        {
          "k": "Paper",
          "v": "Letter"
        }
      ],
      "tableHeaders": [
        "#",
        "Charge",
        "Qty",
        "Rate",
        "Currency",
        "Amount"
      ],
      "tableRows": [
        [
          "1",
          "Ocean Freight",
          "1",
          "1,250.00",
          "USD",
          "1,250.00"
        ],
        [
          "2",
          "THC Origin",
          "1",
          "85.00",
          "USD",
          "85.00"
        ],
        [
          "3",
          "Documentation",
          "1",
          "45.00",
          "USD",
          "45.00"
        ]
      ],
      "termsLines": [
        "Rates are subject to carrier space and equipment availability.",
        "This quotation is a KingFisher layout preview (FRESA format)."
      ]
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "docTitle",
        "text": "TAX INVOICE SINGAPORE –JASPER",
        "align": "center",
        "band": false
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
        "type": "subtotalBar",
        "variant": "tax"
      },
      {
        "type": "formatBadge"
      },
      {
        "type": "summaryHero"
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
        "type": "jobDescription"
      },
      {
        "type": "colorfulFooter"
      }
    ]
  },
  {
    "code": "LEFTOVER_TAX_INVOICE_WITH_QR_INDIA_FORMAT3_JASPER",
    "formatNumber": 3,
    "name": "TAX Invoice with QR –India format3 Jasper",
    "paper": "Letter",
    "rtl": false,
    "theme": {
      "primary": "#0F4D96",
      "accent": "#2084C6",
      "fill": "#E1EDF5",
      "panel": "#D1E9F6",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#98D5FD",
      "ink": "#101010",
      "gray": "#656565",
      "white": "#FFFFFF"
    },
    "branding": {
      "company": "KingFisher Wings",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "inquiry@kingfishertec.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "QTN-19-0003",
      "invoiceDate": "28-JAN-19",
      "dueDate": "28-FEB-19",
      "quotationNo": "QTN-19-0003",
      "billToName": "AL NASER TRADING COMPANY LLC",
      "billToAddress": "30 AL MAKTHOOM BUILDING, SHARJAH UAE",
      "currency": "USD",
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
      "subtotal": "1,380.00",
      "tax": "0.00",
      "total": "1,380.00",
      "words": "USD One Thousand Three Hundred Eighty Only",
      "remarks": "Format-3",
      "fieldGrid": [
        {
          "k": "POL",
          "v": "CHENNAI, INDIA"
        },
        {
          "k": "POD",
          "v": "JEBEL ALI, UAE"
        },
        {
          "k": "Incoterm",
          "v": "FOB"
        },
        {
          "k": "Validity",
          "v": "30 Days"
        },
        {
          "k": "Layout",
          "v": "Format-3"
        },
        {
          "k": "Paper",
          "v": "Letter"
        }
      ],
      "tableHeaders": [
        "#",
        "Charge",
        "Qty",
        "Rate",
        "Currency",
        "Amount"
      ],
      "tableRows": [
        [
          "1",
          "Ocean Freight",
          "1",
          "1,250.00",
          "USD",
          "1,250.00"
        ],
        [
          "2",
          "THC Origin",
          "1",
          "85.00",
          "USD",
          "85.00"
        ],
        [
          "3",
          "Documentation",
          "1",
          "45.00",
          "USD",
          "45.00"
        ]
      ],
      "termsLines": [
        "Rates are subject to carrier space and equipment availability.",
        "This quotation is a KingFisher layout preview (FRESA format)."
      ]
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "docTitle",
        "text": "TAX INVOICE WITH QR –INDIA FORMAT3 JASPER",
        "align": "center",
        "band": false
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
        "type": "subtotalBar",
        "variant": "tax"
      },
      {
        "type": "formatBadge"
      },
      {
        "type": "summaryHero"
      },
      {
        "type": "exportMetaStrip"
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
    "code": "LEFTOVER_TAX_INVOICE_WITH_QRIRN_INDIA_FORMAT4_JASPER",
    "formatNumber": 4,
    "name": "TAX Invoice with QR/IRN –India format4 Jasper",
    "paper": "A4",
    "rtl": false,
    "theme": {
      "primary": "#0F4D96",
      "accent": "#2589CB",
      "fill": "#F0FCFF",
      "panel": "#DCF4FF",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#9CD9FF",
      "ink": "#101010",
      "gray": "#656565",
      "white": "#FFFFFF"
    },
    "branding": {
      "company": "KingFisher Wings",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "inquiry@kingfishertec.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "QTN-19-0004",
      "invoiceDate": "28-JAN-19",
      "dueDate": "28-FEB-19",
      "quotationNo": "QTN-19-0004",
      "billToName": "AL NASER TRADING COMPANY LLC",
      "billToAddress": "30 AL MAKTHOOM BUILDING, SHARJAH UAE",
      "currency": "USD",
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
      "subtotal": "1,380.00",
      "tax": "0.00",
      "total": "1,380.00",
      "words": "USD One Thousand Three Hundred Eighty Only",
      "remarks": "Format-4",
      "fieldGrid": [
        {
          "k": "POL",
          "v": "CHENNAI, INDIA"
        },
        {
          "k": "POD",
          "v": "JEBEL ALI, UAE"
        },
        {
          "k": "Incoterm",
          "v": "FOB"
        },
        {
          "k": "Validity",
          "v": "30 Days"
        },
        {
          "k": "Layout",
          "v": "Format-4"
        }
      ],
      "tableHeaders": [
        "#",
        "Charge",
        "Qty",
        "Rate",
        "Currency",
        "Amount"
      ],
      "tableRows": [
        [
          "1",
          "Ocean Freight",
          "1",
          "1,250.00",
          "USD",
          "1,250.00"
        ],
        [
          "2",
          "THC Origin",
          "1",
          "85.00",
          "USD",
          "85.00"
        ],
        [
          "3",
          "Documentation",
          "1",
          "45.00",
          "USD",
          "45.00"
        ]
      ],
      "termsLines": [
        "Rates are subject to carrier space and equipment availability.",
        "This quotation is a KingFisher layout preview (FRESA format)."
      ],
      "letterBody": "Please confirm acceptance to proceed with booking.",
      "agingHeaders": [
        "Freight",
        "Local",
        "Docs",
        "Total"
      ],
      "agingRow": [
        "1,250.00",
        "85.00",
        "45.00",
        "1,380.00"
      ]
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "docTitle",
        "text": "TAX INVOICE WITH QR/IRN –INDIA FORMAT4 JASPER",
        "align": "start",
        "band": false
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
        "type": "totalsOnly"
      },
      {
        "type": "termsBank"
      },
      {
        "type": "signatureRow"
      },
      {
        "type": "formatBadge"
      },
      {
        "type": "containerStrip"
      },
      {
        "type": "agingSummary"
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
    "code": "LEFTOVER_TAX_INVOICE_WITH_QRIRN_INDIA_FORMAT5_JASPER",
    "formatNumber": 5,
    "name": "TAX Invoice with QR/IRN –India format5 Jasper",
    "paper": "A4",
    "rtl": false,
    "theme": {
      "primary": "#0F4D96",
      "accent": "#2488CA",
      "fill": "#EEFAFF",
      "panel": "#DAF2FF",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#9CD9FF",
      "ink": "#101010",
      "gray": "#656565",
      "white": "#FFFFFF"
    },
    "branding": {
      "company": "KingFisher Wings",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "inquiry@kingfishertec.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "QTN-19-0005",
      "invoiceDate": "28-JAN-19",
      "dueDate": "28-FEB-19",
      "quotationNo": "QTN-19-0005",
      "billToName": "AL NASER TRADING COMPANY LLC",
      "billToAddress": "30 AL MAKTHOOM BUILDING, SHARJAH UAE",
      "currency": "USD",
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
      "subtotal": "1,380.00",
      "tax": "0.00",
      "total": "1,380.00",
      "words": "USD One Thousand Three Hundred Eighty Only",
      "remarks": "Format-5",
      "fieldGrid": [
        {
          "k": "POL",
          "v": "CHENNAI, INDIA"
        },
        {
          "k": "POD",
          "v": "JEBEL ALI, UAE"
        },
        {
          "k": "Incoterm",
          "v": "FOB"
        },
        {
          "k": "Validity",
          "v": "30 Days"
        },
        {
          "k": "Layout",
          "v": "Format-5"
        }
      ],
      "tableHeaders": [
        "#",
        "Charge",
        "Qty",
        "Rate",
        "Currency",
        "Amount"
      ],
      "tableRows": [
        [
          "1",
          "Ocean Freight",
          "1",
          "1,250.00",
          "USD",
          "1,250.00"
        ],
        [
          "2",
          "THC Origin",
          "1",
          "85.00",
          "USD",
          "85.00"
        ],
        [
          "3",
          "Documentation",
          "1",
          "45.00",
          "USD",
          "45.00"
        ]
      ],
      "termsLines": [
        "Rates are subject to carrier space and equipment availability.",
        "This quotation is a KingFisher layout preview (FRESA format)."
      ]
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "docTitle",
        "text": "TAX INVOICE WITH QR/IRN –INDIA FORMAT5 JASPER",
        "align": "end",
        "band": false
      },
      {
        "type": "twoColumn",
        "showBillTo": true,
        "rightMetaFrom": "metaRows"
      },
      {
        "type": "fieldGrid",
        "cols": 2
      },
      {
        "type": "formatBadge"
      },
      {
        "type": "letterBody"
      },
      {
        "type": "summaryHero"
      },
      {
        "type": "wireBox"
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
        "type": "signatureRow"
      },
      {
        "type": "colorfulFooter"
      }
    ]
  },
  {
    "code": "LEFTOVER_VIETNAM_INVOICE",
    "formatNumber": 82,
    "name": "Vietnam Invoice",
    "paper": "A4",
    "rtl": false,
    "theme": {
      "primary": "#0F4D96",
      "accent": "#2387C9",
      "fill": "#F4FDFF",
      "panel": "#EBF7FF",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#9BD8FF",
      "ink": "#101010",
      "gray": "#656565",
      "white": "#FFFFFF"
    },
    "branding": {
      "company": "KingFisher Wings",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "inquiry@kingfishertec.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "QTN-19-0082",
      "invoiceDate": "28-JAN-19",
      "dueDate": "28-FEB-19",
      "quotationNo": "QTN-19-0082",
      "billToName": "AL NASER TRADING COMPANY LLC",
      "billToAddress": "30 AL MAKTHOOM BUILDING, SHARJAH UAE",
      "currency": "USD",
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
      "subtotal": "1,380.00",
      "tax": "0.00",
      "total": "1,380.00",
      "words": "USD One Thousand Three Hundred Eighty Only",
      "remarks": "Format-82",
      "fieldGrid": [
        {
          "k": "POL",
          "v": "CHENNAI, INDIA"
        },
        {
          "k": "POD",
          "v": "JEBEL ALI, UAE"
        },
        {
          "k": "Incoterm",
          "v": "FOB"
        },
        {
          "k": "Validity",
          "v": "30 Days"
        },
        {
          "k": "Layout",
          "v": "Format-82"
        }
      ],
      "tableHeaders": [
        "#",
        "Charge",
        "Qty",
        "Rate",
        "Currency",
        "Amount"
      ],
      "tableRows": [
        [
          "1",
          "Ocean Freight",
          "1",
          "1,250.00",
          "USD",
          "1,250.00"
        ],
        [
          "2",
          "THC Origin",
          "1",
          "85.00",
          "USD",
          "85.00"
        ],
        [
          "3",
          "Documentation",
          "1",
          "45.00",
          "USD",
          "45.00"
        ]
      ],
      "termsLines": [
        "Rates are subject to carrier space and equipment availability.",
        "This quotation is a KingFisher layout preview (FRESA format)."
      ]
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "docTitle",
        "text": "VIETNAM INVOICE",
        "align": "start",
        "band": false
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
        "type": "totalsOnly"
      },
      {
        "type": "termsBank"
      },
      {
        "type": "signatureRow"
      },
      {
        "type": "formatBadge"
      },
      {
        "type": "summaryHero"
      },
      {
        "type": "agingSummary"
      },
      {
        "type": "wireBox"
      },
      {
        "type": "jobDescription"
      },
      {
        "type": "colorfulFooter"
      }
    ]
  },
  {
    "code": "LEFTOVER_WAREHOUSE_INVOICE_INDIA_FORMAT",
    "formatNumber": 83,
    "name": "Warehouse Invoice –India Format",
    "paper": "A4",
    "rtl": false,
    "theme": {
      "primary": "#0F4D96",
      "accent": "#2387C9",
      "fill": "#F2FBFF",
      "panel": "#E9F5FD",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#9BD8FF",
      "ink": "#101010",
      "gray": "#656565",
      "white": "#FFFFFF"
    },
    "branding": {
      "company": "KingFisher Wings",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "inquiry@kingfishertec.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "ASN-19001",
      "invoiceDate": "28-JAN-19",
      "fieldGrid": [
        {
          "k": "Warehouse",
          "v": "DXB-WH-01"
        },
        {
          "k": "Customer",
          "v": "AL NASER TRADING"
        },
        {
          "k": "Reference",
          "v": "PO-77821"
        },
        {
          "k": "Layout",
          "v": "Format-83"
        }
      ],
      "tableHeaders": [
        "#",
        "SKU",
        "Description",
        "Qty",
        "UOM",
        "Location"
      ],
      "tableRows": [
        [
          "1",
          "112541AASD52",
          "WD EXTERNAL HDD",
          "500",
          "BOX",
          "AB0001"
        ],
        [
          "2",
          "2253465",
          "HP LAPTOP",
          "4",
          "BOX",
          "AB0001"
        ],
        [
          "3",
          "5251255220",
          "NVIDIA GPU",
          "600",
          "BOX",
          "GOODS_RECEIPT"
        ]
      ],
      "termsLines": [
        "WMS layout preview — FRESA Gold warehouse format."
      ],
      "remarks": "Format-83"
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "docTitle",
        "text": "WAREHOUSE INVOICE",
        "align": "end",
        "band": false
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
        "type": "wordsAndTotal"
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
