import type { InvoiceFormatUiLayout } from '../types/invoiceFormatUiLayout.types';

/** Permanent JSON UI layouts — Fresa sky-blue themes. */
export const COMMERCIAL_EXTRA_FORMAT_UI_LAYOUTS: InvoiceFormatUiLayout[] = [
  {
    "code": "PROFORMA_INVOICE_REPORT_FORMAT_1_PROFORMA_INVOICE_ALL_CHARGES",
    "formatNumber": 1,
    "name": "Proforma Invoice Report Format-1 Proforma Invoice All Charges",
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
      "subtotal": "1,380.00",
      "tax": "0.00",
      "total": "1,380.00",
      "words": "USD One Thousand Three Hundred Eighty Only",
      "termsLines": [
        "Rates are subject to carrier space and equipment availability.",
        "This quotation is a KingFisher layout preview (FRESA format)."
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
        "text": "PROFORMA INVOICE",
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
        "type": "colorfulFooter"
      }
    ]
  },
  {
    "code": "PROFORMA_INVOICE_REPORT_FORMAT_2_PROFORMA_INVOICE_ALL_CHARGES",
    "formatNumber": 2,
    "name": "Proforma Invoice Report Format-2 Proforma Invoice All Charges",
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
      "subtotal": "1,380.00",
      "tax": "0.00",
      "total": "1,380.00",
      "words": "USD One Thousand Three Hundred Eighty Only",
      "termsLines": [
        "Rates are subject to carrier space and equipment availability.",
        "This quotation is a KingFisher layout preview (FRESA format)."
      ],
      "remarks": "Format-2"
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "docTitle",
        "text": "PROFORMA INVOICE",
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
        "cols": 1
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
        "headerColor": "cyan"
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
    "code": "PROFORMA_INVOICE_REPORT_FORMAT_3",
    "formatNumber": 3,
    "name": "Proforma Invoice Report Format-3",
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
      "subtotal": "1,380.00",
      "tax": "0.00",
      "total": "1,380.00",
      "words": "USD One Thousand Three Hundred Eighty Only",
      "termsLines": [
        "Rates are subject to carrier space and equipment availability.",
        "This quotation is a KingFisher layout preview (FRESA format)."
      ],
      "remarks": "Format-3"
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "docTitle",
        "text": "PROFORMA INVOICE",
        "align": "end",
        "band": true
      },
      {
        "type": "fieldGrid",
        "cols": 1
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
        "type": "formatBadge"
      },
      {
        "type": "exportMetaStrip"
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
    "code": "PROFORMA_INVOICE_REPORT_FORMAT_4",
    "formatNumber": 4,
    "name": "Proforma Invoice Report Format-4",
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
      "subtotal": "1,380.00",
      "tax": "0.00",
      "total": "1,380.00",
      "words": "USD One Thousand Three Hundred Eighty Only",
      "termsLines": [
        "Rates are subject to carrier space and equipment availability.",
        "This quotation is a KingFisher layout preview (FRESA format)."
      ],
      "remarks": "Format-4"
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "docTitle",
        "text": "PROFORMA INVOICE",
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
    "code": "PROFORMA_INVOICE_REPORT_FORMAT_5",
    "formatNumber": 5,
    "name": "Proforma Invoice Report Format-5",
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
      "subtotal": "1,380.00",
      "tax": "0.00",
      "total": "1,380.00",
      "words": "USD One Thousand Three Hundred Eighty Only",
      "termsLines": [
        "Rates are subject to carrier space and equipment availability.",
        "This quotation is a KingFisher layout preview (FRESA format)."
      ],
      "remarks": "Format-5"
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "docTitle",
        "text": "PROFORMA INVOICE",
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
        "cols": 1
      },
      {
        "type": "formatBadge"
      },
      {
        "type": "letterBody"
      },
      {
        "type": "agingSummary"
      },
      {
        "type": "wireBox"
      },
      {
        "type": "chargeTable",
        "headerColor": "cyan"
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
    "code": "PROFORMA_INVOICE_REPORT_FORMAT_6",
    "formatNumber": 6,
    "name": "Proforma Invoice Report Format-6",
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
      "subtotal": "1,380.00",
      "tax": "0.00",
      "total": "1,380.00",
      "words": "USD One Thousand Three Hundred Eighty Only",
      "termsLines": [
        "Rates are subject to carrier space and equipment availability.",
        "This quotation is a KingFisher layout preview (FRESA format)."
      ],
      "remarks": "Format-6"
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "docTitle",
        "text": "PROFORMA INVOICE",
        "align": "end",
        "band": true
      },
      {
        "type": "fieldGrid",
        "cols": 1
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
    "code": "PROFORMA_INVOICE_REPORT_FORMAT_7",
    "formatNumber": 7,
    "name": "Proforma Invoice Report Format-7",
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
      "subtotal": "1,380.00",
      "tax": "0.00",
      "total": "1,380.00",
      "words": "USD One Thousand Three Hundred Eighty Only",
      "termsLines": [
        "Rates are subject to carrier space and equipment availability.",
        "This quotation is a KingFisher layout preview (FRESA format)."
      ],
      "remarks": "Format-7"
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "docTitle",
        "text": "PROFORMA INVOICE",
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
        "type": "usaNumberedFields"
      },
      {
        "type": "colorfulFooter"
      }
    ]
  },
  {
    "code": "PROFORMA_INVOICE_REPORT_FORMAT_8",
    "formatNumber": 8,
    "name": "Proforma Invoice Report Format-8",
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
      "subtotal": "1,380.00",
      "tax": "0.00",
      "total": "1,380.00",
      "words": "USD One Thousand Three Hundred Eighty Only",
      "termsLines": [
        "Rates are subject to carrier space and equipment availability.",
        "This quotation is a KingFisher layout preview (FRESA format)."
      ],
      "remarks": "Format-8"
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "docTitle",
        "text": "PROFORMA INVOICE",
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
        "cols": 1
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
        "type": "exportMetaStrip"
      },
      {
        "type": "chargeTable",
        "headerColor": "cyan"
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
    "code": "PROFORMA_INVOICE_REPORT_FORMAT_9",
    "formatNumber": 9,
    "name": "Proforma Invoice Report Format-9",
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
      "subtotal": "1,380.00",
      "tax": "0.00",
      "total": "1,380.00",
      "words": "USD One Thousand Three Hundred Eighty Only",
      "termsLines": [
        "Rates are subject to carrier space and equipment availability.",
        "This quotation is a KingFisher layout preview (FRESA format)."
      ],
      "remarks": "Format-9"
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "docTitle",
        "text": "PROFORMA INVOICE",
        "align": "end",
        "band": true
      },
      {
        "type": "fieldGrid",
        "cols": 1
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
        "type": "formatBadge"
      },
      {
        "type": "containerStrip"
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
    "code": "PROFORMA_INVOICE_REPORT_FORMAT_10",
    "formatNumber": 10,
    "name": "Proforma Invoice Report Format-10",
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
      "subtotal": "1,380.00",
      "tax": "0.00",
      "total": "1,380.00",
      "words": "USD One Thousand Three Hundred Eighty Only",
      "termsLines": [
        "Rates are subject to carrier space and equipment availability.",
        "This quotation is a KingFisher layout preview (FRESA format)."
      ],
      "remarks": "Format-10"
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "docTitle",
        "text": "PROFORMA INVOICE",
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
        "type": "usaNumberedFields"
      },
      {
        "type": "colorfulFooter"
      }
    ]
  },
  {
    "code": "PROFORMA_INVOICE_REPORT_FORMAT_11",
    "formatNumber": 11,
    "name": "Proforma Invoice Report Format-11",
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
      "invoiceNo": "QTN-19-0011",
      "invoiceDate": "28-JAN-19",
      "dueDate": "28-FEB-19",
      "quotationNo": "QTN-19-0011",
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
          "v": "Format-11"
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
      "subtotal": "1,380.00",
      "tax": "0.00",
      "total": "1,380.00",
      "words": "USD One Thousand Three Hundred Eighty Only",
      "termsLines": [
        "Rates are subject to carrier space and equipment availability.",
        "This quotation is a KingFisher layout preview (FRESA format)."
      ],
      "remarks": "Format-11"
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "docTitle",
        "text": "PROFORMA INVOICE",
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
        "cols": 1
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
        "type": "containerStrip"
      },
      {
        "type": "chargeTable",
        "headerColor": "cyan"
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
    "code": "PROFORMA_INVOICE_REPORT_FORMAT_12",
    "formatNumber": 12,
    "name": "Proforma Invoice Report Format-12",
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
      "subtotal": "1,380.00",
      "tax": "0.00",
      "total": "1,380.00",
      "words": "USD One Thousand Three Hundred Eighty Only",
      "termsLines": [
        "Rates are subject to carrier space and equipment availability.",
        "This quotation is a KingFisher layout preview (FRESA format)."
      ],
      "remarks": "Format-12"
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "docTitle",
        "text": "PROFORMA INVOICE",
        "align": "end",
        "band": true
      },
      {
        "type": "fieldGrid",
        "cols": 1
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
    "code": "PROFORMA_INVOICE_REPORT_FORMAT_13",
    "formatNumber": 13,
    "name": "Proforma Invoice Report Format-13",
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
      "subtotal": "1,380.00",
      "tax": "0.00",
      "total": "1,380.00",
      "words": "USD One Thousand Three Hundred Eighty Only",
      "termsLines": [
        "Rates are subject to carrier space and equipment availability.",
        "This quotation is a KingFisher layout preview (FRESA format)."
      ],
      "remarks": "Format-13"
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "docTitle",
        "text": "PROFORMA INVOICE",
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
    "code": "PROFORMA_INVOICE_REPORT_FORMAT_14",
    "formatNumber": 14,
    "name": "Proforma Invoice Report Format-14",
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
      "subtotal": "1,380.00",
      "tax": "0.00",
      "total": "1,380.00",
      "words": "USD One Thousand Three Hundred Eighty Only",
      "termsLines": [
        "Rates are subject to carrier space and equipment availability.",
        "This quotation is a KingFisher layout preview (FRESA format)."
      ],
      "remarks": "Format-14"
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "docTitle",
        "text": "PROFORMA INVOICE",
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
        "cols": 1
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
        "headerColor": "cyan"
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
    "code": "PROFORMA_INVOICE_REPORT_FORMAT_15",
    "formatNumber": 15,
    "name": "Proforma Invoice Report Format-15",
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
      "subtotal": "1,380.00",
      "tax": "0.00",
      "total": "1,380.00",
      "words": "USD One Thousand Three Hundred Eighty Only",
      "termsLines": [
        "Rates are subject to carrier space and equipment availability.",
        "This quotation is a KingFisher layout preview (FRESA format)."
      ],
      "remarks": "Format-15"
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "docTitle",
        "text": "PROFORMA INVOICE",
        "align": "end",
        "band": true
      },
      {
        "type": "fieldGrid",
        "cols": 1
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
        "type": "formatBadge"
      },
      {
        "type": "exportMetaStrip"
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
    "code": "PROFORMA_INVOICE_REPORT_FORMAT_16",
    "formatNumber": 16,
    "name": "Proforma Invoice Report Format-16",
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
      "subtotal": "1,380.00",
      "tax": "0.00",
      "total": "1,380.00",
      "words": "USD One Thousand Three Hundred Eighty Only",
      "termsLines": [
        "Rates are subject to carrier space and equipment availability.",
        "This quotation is a KingFisher layout preview (FRESA format)."
      ],
      "remarks": "Format-16"
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "docTitle",
        "text": "PROFORMA INVOICE",
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
    "code": "PROFORMA_INVOICE_REPORT_FORMAT_17",
    "formatNumber": 17,
    "name": "Proforma Invoice Report Format-17",
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
      "subtotal": "1,380.00",
      "tax": "0.00",
      "total": "1,380.00",
      "words": "USD One Thousand Three Hundred Eighty Only",
      "termsLines": [
        "Rates are subject to carrier space and equipment availability.",
        "This quotation is a KingFisher layout preview (FRESA format)."
      ],
      "remarks": "Format-17"
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "docTitle",
        "text": "PROFORMA INVOICE",
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
        "cols": 1
      },
      {
        "type": "formatBadge"
      },
      {
        "type": "letterBody"
      },
      {
        "type": "containerStrip"
      },
      {
        "type": "wireBox"
      },
      {
        "type": "chargeTable",
        "headerColor": "cyan"
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
    "code": "DEBIT_NOTE_REPORT_FORMAT_1",
    "formatNumber": 1,
    "name": "Debit Note Report Format-1",
    "paper": "A4",
    "rtl": false,
    "theme": {
      "primary": "#0F4D96",
      "accent": "#2185C7",
      "fill": "#EDF6FC",
      "panel": "#E6F2FA",
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
      "subtotal": "1,380.00",
      "tax": "0.00",
      "total": "1,380.00",
      "words": "USD One Thousand Three Hundred Eighty Only",
      "termsLines": [
        "Rates are subject to carrier space and equipment availability.",
        "This quotation is a KingFisher layout preview (FRESA format)."
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
        "text": "DEBIT NOTE",
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
    "code": "DEBIT_NOTE_REPORT_FORMAT_2",
    "formatNumber": 2,
    "name": "Debit Note Report Format-2",
    "paper": "A4",
    "rtl": false,
    "theme": {
      "primary": "#0F4D96",
      "accent": "#2084C6",
      "fill": "#EBF4FA",
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
      "subtotal": "1,380.00",
      "tax": "0.00",
      "total": "1,380.00",
      "words": "USD One Thousand Three Hundred Eighty Only",
      "termsLines": [
        "Rates are subject to carrier space and equipment availability.",
        "This quotation is a KingFisher layout preview (FRESA format)."
      ],
      "remarks": "Format-2"
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "docTitle",
        "text": "DEBIT NOTE",
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
        "headerColor": "fill"
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
    "code": "DEBIT_NOTE_REPORT_FORMAT_3",
    "formatNumber": 3,
    "name": "Debit Note Report Format-3",
    "paper": "A4",
    "rtl": false,
    "theme": {
      "primary": "#0F4D96",
      "accent": "#2084C6",
      "fill": "#E9F2F8",
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
      "subtotal": "1,380.00",
      "tax": "0.00",
      "total": "1,380.00",
      "words": "USD One Thousand Three Hundred Eighty Only",
      "termsLines": [
        "Rates are subject to carrier space and equipment availability.",
        "This quotation is a KingFisher layout preview (FRESA format)."
      ],
      "remarks": "Format-3"
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
        "type": "formatBadge"
      },
      {
        "type": "colorfulFooter"
      }
    ]
  },
  {
    "code": "DEBIT_NOTE_REPORT_FORMAT_4",
    "formatNumber": 4,
    "name": "Debit Note Report Format-4",
    "paper": "A4",
    "rtl": false,
    "theme": {
      "primary": "#0F4D96",
      "accent": "#2589CB",
      "fill": "#F8FFFF",
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
      "subtotal": "1,380.00",
      "tax": "0.00",
      "total": "1,380.00",
      "words": "USD One Thousand Three Hundred Eighty Only",
      "termsLines": [
        "Rates are subject to carrier space and equipment availability.",
        "This quotation is a KingFisher layout preview (FRESA format)."
      ],
      "remarks": "Format-4"
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "docTitle",
        "text": "DEBIT NOTE",
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
        "headerColor": "fill"
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
    "code": "DEBIT_NOTE_REPORT_FORMAT_5",
    "formatNumber": 5,
    "name": "Debit Note Report Format-5",
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
      "subtotal": "1,380.00",
      "tax": "0.00",
      "total": "1,380.00",
      "words": "USD One Thousand Three Hundred Eighty Only",
      "termsLines": [
        "Rates are subject to carrier space and equipment availability.",
        "This quotation is a KingFisher layout preview (FRESA format)."
      ],
      "remarks": "Format-5"
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "docTitle",
        "text": "DEBIT NOTE",
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
        "headerColor": "fill"
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
    "code": "DEBIT_NOTE_REPORT_FORMAT_6",
    "formatNumber": 6,
    "name": "Debit Note Report Format-6",
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
      "subtotal": "1,380.00",
      "tax": "0.00",
      "total": "1,380.00",
      "words": "USD One Thousand Three Hundred Eighty Only",
      "termsLines": [
        "Rates are subject to carrier space and equipment availability.",
        "This quotation is a KingFisher layout preview (FRESA format)."
      ],
      "remarks": "Format-6"
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
        "type": "formatBadge"
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
    "code": "DEBIT_NOTE_REPORT_FORMAT_7",
    "formatNumber": 7,
    "name": "Debit Note Report Format-7",
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
      "subtotal": "1,380.00",
      "tax": "0.00",
      "total": "1,380.00",
      "words": "USD One Thousand Three Hundred Eighty Only",
      "termsLines": [
        "Rates are subject to carrier space and equipment availability.",
        "This quotation is a KingFisher layout preview (FRESA format)."
      ],
      "remarks": "Format-7"
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "docTitle",
        "text": "DEBIT NOTE",
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
        "headerColor": "fill"
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
        "type": "jobDescription"
      },
      {
        "type": "colorfulFooter"
      }
    ]
  },
  {
    "code": "DEBIT_NOTE_REPORT_FORMAT_8",
    "formatNumber": 8,
    "name": "Debit Note Report Format-8",
    "paper": "A4",
    "rtl": false,
    "theme": {
      "primary": "#0F4D96",
      "accent": "#2286C8",
      "fill": "#F0F9FF",
      "panel": "#E8F4FC",
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
      "subtotal": "1,380.00",
      "tax": "0.00",
      "total": "1,380.00",
      "words": "USD One Thousand Three Hundred Eighty Only",
      "termsLines": [
        "Rates are subject to carrier space and equipment availability.",
        "This quotation is a KingFisher layout preview (FRESA format)."
      ],
      "remarks": "Format-8"
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "docTitle",
        "text": "DEBIT NOTE",
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
        "headerColor": "fill"
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
        "type": "wireBox"
      },
      {
        "type": "colorfulFooter"
      }
    ]
  },
  {
    "code": "DEBIT_NOTE_REPORT_FORMAT_9",
    "formatNumber": 9,
    "name": "Debit Note Report Format-9",
    "paper": "A4",
    "rtl": false,
    "theme": {
      "primary": "#0F4D96",
      "accent": "#2185C7",
      "fill": "#EEF7FD",
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
      "subtotal": "1,380.00",
      "tax": "0.00",
      "total": "1,380.00",
      "words": "USD One Thousand Three Hundred Eighty Only",
      "termsLines": [
        "Rates are subject to carrier space and equipment availability.",
        "This quotation is a KingFisher layout preview (FRESA format)."
      ],
      "remarks": "Format-9"
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
        "type": "formatBadge"
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
    "code": "DEBIT_NOTE_REPORT_FORMAT_10",
    "formatNumber": 10,
    "name": "Debit Note Report Format-10",
    "paper": "A4",
    "rtl": false,
    "theme": {
      "primary": "#0F4D96",
      "accent": "#2185C7",
      "fill": "#ECF5FB",
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
      "subtotal": "1,380.00",
      "tax": "0.00",
      "total": "1,380.00",
      "words": "USD One Thousand Three Hundred Eighty Only",
      "termsLines": [
        "Rates are subject to carrier space and equipment availability.",
        "This quotation is a KingFisher layout preview (FRESA format)."
      ],
      "remarks": "Format-10"
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "docTitle",
        "text": "DEBIT NOTE",
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
        "headerColor": "fill"
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
    "code": "CREDIT_NOTE_REPORT_FORMAT_1",
    "formatNumber": 1,
    "name": "Credit Note Report Format-1",
    "paper": "A4",
    "rtl": false,
    "theme": {
      "primary": "#0F4D96",
      "accent": "#0082C5",
      "fill": "#EAF3F9",
      "panel": "#DCEEFA",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#7CD2FB",
      "ink": "#0C4A6E",
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
      "subtotal": "1,380.00",
      "tax": "0.00",
      "total": "1,380.00",
      "words": "USD One Thousand Three Hundred Eighty Only",
      "termsLines": [
        "Rates are subject to carrier space and equipment availability.",
        "This quotation is a KingFisher layout preview (FRESA format)."
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
        "text": "CREDIT NOTE",
        "align": "center",
        "band": false
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
        "cols": 2
      },
      {
        "type": "chargeTable",
        "headerColor": "fill"
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
    "code": "CREDIT_NOTE_REPORT_FORMAT_2",
    "formatNumber": 2,
    "name": "Credit Note Report Format-2",
    "paper": "A4",
    "rtl": false,
    "theme": {
      "primary": "#0A3D7A",
      "accent": "#1F83C5",
      "fill": "#F0F2F4",
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
      "subtotal": "1,380.00",
      "tax": "0.00",
      "total": "1,380.00",
      "words": "USD One Thousand Three Hundred Eighty Only",
      "termsLines": [
        "Rates are subject to carrier space and equipment availability.",
        "This quotation is a KingFisher layout preview (FRESA format)."
      ],
      "remarks": "Format-2"
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "docTitle",
        "text": "CREDIT NOTE",
        "align": "start",
        "band": false
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
    "code": "CREDIT_NOTE_REPORT_FORMAT_3",
    "formatNumber": 3,
    "name": "Credit Note Report Format-3",
    "paper": "A4",
    "rtl": false,
    "theme": {
      "primary": "#0F4D96",
      "accent": "#3ABFFA",
      "fill": "#F7FFFF",
      "panel": "#E5F7FF",
      "orange": "#F7A21C",
      "red": "#DE1F26",
      "cyan": "#7FD5FE",
      "ink": "#0C4A6E",
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
      "subtotal": "1,380.00",
      "tax": "0.00",
      "total": "1,380.00",
      "words": "USD One Thousand Three Hundred Eighty Only",
      "termsLines": [
        "Rates are subject to carrier space and equipment availability.",
        "This quotation is a KingFisher layout preview (FRESA format)."
      ],
      "remarks": "Format-3"
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "docTitle",
        "text": "CREDIT NOTE",
        "align": "end",
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
    "code": "CREDIT_NOTE_REPORT_FORMAT_4",
    "formatNumber": 4,
    "name": "Credit Note Report Format-4",
    "paper": "A4",
    "rtl": false,
    "theme": {
      "primary": "#2286C8",
      "accent": "#114F98",
      "fill": "#F5FEFF",
      "panel": "#E4F6FF",
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
      "subtotal": "1,380.00",
      "tax": "0.00",
      "total": "1,380.00",
      "words": "USD One Thousand Three Hundred Eighty Only",
      "termsLines": [
        "Rates are subject to carrier space and equipment availability.",
        "This quotation is a KingFisher layout preview (FRESA format)."
      ],
      "remarks": "Format-4"
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "docTitle",
        "text": "CREDIT NOTE",
        "align": "center",
        "band": false
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
        "cols": 2
      },
      {
        "type": "chargeTable",
        "headerColor": "fill"
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
    "code": "CREDIT_NOTE_REPORT_FORMAT_5",
    "formatNumber": 5,
    "name": "Credit Note Report Format-5",
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
      "subtotal": "1,380.00",
      "tax": "0.00",
      "total": "1,380.00",
      "words": "USD One Thousand Three Hundred Eighty Only",
      "termsLines": [
        "Rates are subject to carrier space and equipment availability.",
        "This quotation is a KingFisher layout preview (FRESA format)."
      ],
      "remarks": "Format-5"
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "docTitle",
        "text": "CREDIT NOTE",
        "align": "start",
        "band": false
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
        "type": "containerStrip"
      },
      {
        "type": "agingSummary"
      },
      {
        "type": "usaNumberedFields"
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
    "code": "CREDIT_NOTE_REPORT_FORMAT_6",
    "formatNumber": 6,
    "name": "Credit Note Report Format-6",
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
      "subtotal": "1,380.00",
      "tax": "0.00",
      "total": "1,380.00",
      "words": "USD One Thousand Three Hundred Eighty Only",
      "termsLines": [
        "Rates are subject to carrier space and equipment availability.",
        "This quotation is a KingFisher layout preview (FRESA format)."
      ],
      "remarks": "Format-6"
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "docTitle",
        "text": "CREDIT NOTE",
        "align": "end",
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
        "type": "termsBank"
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
        "type": "signatureRow"
      },
      {
        "type": "colorfulFooter"
      }
    ]
  },
  {
    "code": "CREDIT_NOTE_REPORT_FORMAT_7",
    "formatNumber": 7,
    "name": "Credit Note Report Format-7",
    "paper": "A4",
    "rtl": false,
    "theme": {
      "primary": "#0F4D96",
      "accent": "#2286C8",
      "fill": "#EAEFF3",
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
      "subtotal": "1,380.00",
      "tax": "0.00",
      "total": "1,380.00",
      "words": "USD One Thousand Three Hundred Eighty Only",
      "termsLines": [
        "Rates are subject to carrier space and equipment availability.",
        "This quotation is a KingFisher layout preview (FRESA format)."
      ],
      "remarks": "Format-7"
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "docTitle",
        "text": "CREDIT NOTE",
        "align": "center",
        "band": false
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
        "cols": 2
      },
      {
        "type": "chargeTable",
        "headerColor": "fill"
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
    "code": "CREDIT_NOTE_REPORT_FORMAT_8",
    "formatNumber": 8,
    "name": "Credit Note Report Format-8",
    "paper": "A4",
    "rtl": false,
    "theme": {
      "primary": "#000000",
      "accent": "#2185C7",
      "fill": "#F0F0F0",
      "panel": "#F1F1F1",
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
      "subtotal": "1,380.00",
      "tax": "0.00",
      "total": "1,380.00",
      "words": "USD One Thousand Three Hundred Eighty Only",
      "termsLines": [
        "Rates are subject to carrier space and equipment availability.",
        "This quotation is a KingFisher layout preview (FRESA format)."
      ],
      "remarks": "Format-8"
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "docTitle",
        "text": "CREDIT NOTE",
        "align": "start",
        "band": false
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
        "type": "summaryHero"
      },
      {
        "type": "exportMetaStrip"
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
    "code": "CREDIT_NOTE_REPORT_FORMAT_9",
    "formatNumber": 9,
    "name": "Credit Note Report Format-9",
    "paper": "A4",
    "rtl": false,
    "theme": {
      "primary": "#0A3D7A",
      "accent": "#2084C6",
      "fill": "#E7F9FA",
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
      "subtotal": "1,380.00",
      "tax": "0.00",
      "total": "1,380.00",
      "words": "USD One Thousand Three Hundred Eighty Only",
      "termsLines": [
        "Rates are subject to carrier space and equipment availability.",
        "This quotation is a KingFisher layout preview (FRESA format)."
      ],
      "remarks": "Format-9"
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "docTitle",
        "text": "CREDIT NOTE",
        "align": "end",
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
        "type": "termsBank"
      },
      {
        "type": "letterBody"
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
    "code": "CREDIT_NOTE_REPORT_FORMAT_10",
    "formatNumber": 10,
    "name": "Credit Note Report Format-10",
    "paper": "A4",
    "rtl": false,
    "theme": {
      "primary": "#0F4D96",
      "accent": "#2084C6",
      "fill": "#E9F2F8",
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
      "subtotal": "1,380.00",
      "tax": "0.00",
      "total": "1,380.00",
      "words": "USD One Thousand Three Hundred Eighty Only",
      "termsLines": [
        "Rates are subject to carrier space and equipment availability.",
        "This quotation is a KingFisher layout preview (FRESA format)."
      ],
      "remarks": "Format-10"
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "docTitle",
        "text": "CREDIT NOTE",
        "align": "center",
        "band": false
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
        "cols": 2
      },
      {
        "type": "chargeTable",
        "headerColor": "fill"
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
        "type": "outstandingTable"
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
