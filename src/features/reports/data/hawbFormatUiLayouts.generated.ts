import type { InvoiceFormatUiLayout } from '../types/invoiceFormatUiLayout.types';

/** Auto-generated HAWB formats — run: node scripts/build-hawb-format-ui-layouts.mjs */
export const HAWB_FORMAT_UI_LAYOUTS: InvoiceFormatUiLayout[] = [
  {
    "code": "HAWB_DRAFT_REPORT_FORMAT",
    "formatNumber": 1,
    "name": "HAWB Draft Report Format",
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
      "invoiceNo": "PLMAAJEA00081",
      "invoiceDate": "29-JAN-19",
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
        "title": "Issuing Carrier Agent",
        "lines": [
          "KingFisher Logistic",
          "Dubai, United Arab Emirates"
        ]
      },
      "fieldGrid": [
        {
          "k": "HAWB No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MAWB No.",
          "v": "176-12345678"
        },
        {
          "k": "Airport of Departure",
          "v": "CHENNAI (MAA)"
        },
        {
          "k": "Airport of Destination",
          "v": "DUBAI (DXB)"
        },
        {
          "k": "Flight / Date",
          "v": "EK-512 / 29-JAN-19"
        },
        {
          "k": "Currency",
          "v": "USD"
        },
        {
          "k": "WT/VAL",
          "v": "PPD"
        },
        {
          "k": "Other",
          "v": "PPD"
        },
        {
          "k": "Declared Value Carriage",
          "v": "NVD"
        },
        {
          "k": "Declared Value Customs",
          "v": "NCV"
        },
        {
          "k": "Amount of Insurance",
          "v": "XXX"
        },
        {
          "k": "Pieces",
          "v": "125"
        },
        {
          "k": "Gross Weight",
          "v": "18,000.0 K"
        },
        {
          "k": "Chargeable Weight",
          "v": "18,000.0 K"
        },
        {
          "k": "Rate / Charge",
          "v": "As agreed"
        },
        {
          "k": "Total",
          "v": "As per AWB"
        }
      ],
      "tableHeaders": [
        "No. of Pieces",
        "Gross Weight",
        "Rate Class",
        "Nature of Goods"
      ],
      "tableRows": [
        [
          "125",
          "18,000.0 K",
          "Q",
          "STC: VALVE MATERIALS FOR MACHINERY PARTS"
        ]
      ],
      "termsLines": [
        "DRAFT — Not valid for carriage until issued as original AWB.",
        "Shipper certifies that particulars on the face hereof are correct."
      ],
      "remarks": "Draft Report Format"
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
        "text": "HOUSE AIR WAYBILL — HAWB DRAFT",
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
        "type": "signatureRow"
      },
      {
        "type": "colorfulFooter"
      }
    ]
  },
  {
    "code": "HAWB_DRAFT_REPORT_FORMAT_1",
    "formatNumber": 2,
    "name": "HAWB Draft Report Format-1",
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
      "invoiceNo": "PLMAAJEA00081",
      "invoiceDate": "29-JAN-19",
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
        "title": "Issuing Carrier Agent",
        "lines": [
          "KingFisher Logistic",
          "Dubai, United Arab Emirates"
        ]
      },
      "fieldGrid": [
        {
          "k": "HAWB No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MAWB No.",
          "v": "176-12345678"
        },
        {
          "k": "Airport of Departure",
          "v": "CHENNAI (MAA)"
        },
        {
          "k": "Airport of Destination",
          "v": "DUBAI (DXB)"
        },
        {
          "k": "Flight / Date",
          "v": "EK-512 / 29-JAN-19"
        },
        {
          "k": "Currency",
          "v": "USD"
        },
        {
          "k": "WT/VAL",
          "v": "PPD"
        },
        {
          "k": "Other",
          "v": "PPD"
        },
        {
          "k": "Declared Value Carriage",
          "v": "NVD"
        },
        {
          "k": "Declared Value Customs",
          "v": "NCV"
        },
        {
          "k": "Amount of Insurance",
          "v": "XXX"
        },
        {
          "k": "Pieces",
          "v": "125"
        },
        {
          "k": "Gross Weight",
          "v": "18,000.0 K"
        },
        {
          "k": "Chargeable Weight",
          "v": "18,000.0 K"
        },
        {
          "k": "Rate / Charge",
          "v": "As agreed"
        },
        {
          "k": "Total",
          "v": "As per AWB"
        },
        {
          "k": "Layout",
          "v": "Draft Format-1"
        }
      ],
      "tableHeaders": [
        "No. of Pieces",
        "Gross Weight",
        "Rate Class",
        "Nature of Goods"
      ],
      "tableRows": [
        [
          "125",
          "18,000.0 K",
          "Q",
          "STC: VALVE MATERIALS FOR MACHINERY PARTS"
        ]
      ],
      "termsLines": [
        "DRAFT — Not valid for carriage until issued as original AWB.",
        "Shipper certifies that particulars on the face hereof are correct."
      ],
      "remarks": "Draft Report Format-1"
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
        "text": "HOUSE AIR WAYBILL — HAWB DRAFT FORMAT 1",
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
    "code": "HAWB_DRAFT_REPORT_FORMAT_2",
    "formatNumber": 3,
    "name": "HAWB Draft Report Format-2",
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
      "invoiceNo": "PLMAAJEA00081",
      "invoiceDate": "29-JAN-19",
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
        "title": "Issuing Carrier Agent",
        "lines": [
          "KingFisher Logistic",
          "Dubai, United Arab Emirates"
        ]
      },
      "fieldGrid": [
        {
          "k": "HAWB No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MAWB No.",
          "v": "176-12345678"
        },
        {
          "k": "Airport of Departure",
          "v": "CHENNAI (MAA)"
        },
        {
          "k": "Airport of Destination",
          "v": "DUBAI (DXB)"
        },
        {
          "k": "Flight / Date",
          "v": "EK-512 / 29-JAN-19"
        },
        {
          "k": "Currency",
          "v": "USD"
        },
        {
          "k": "WT/VAL",
          "v": "PPD"
        },
        {
          "k": "Other",
          "v": "PPD"
        },
        {
          "k": "Declared Value Carriage",
          "v": "NVD"
        },
        {
          "k": "Declared Value Customs",
          "v": "NCV"
        },
        {
          "k": "Amount of Insurance",
          "v": "XXX"
        },
        {
          "k": "Pieces",
          "v": "125"
        },
        {
          "k": "Gross Weight",
          "v": "18,000.0 K"
        },
        {
          "k": "Chargeable Weight",
          "v": "18,000.0 K"
        },
        {
          "k": "Rate / Charge",
          "v": "As agreed"
        },
        {
          "k": "Total",
          "v": "As per AWB"
        },
        {
          "k": "Layout",
          "v": "Draft Format-2"
        }
      ],
      "tableHeaders": [
        "No. of Pieces",
        "Gross Weight",
        "Rate Class",
        "Nature of Goods"
      ],
      "tableRows": [
        [
          "125",
          "18,000.0 K",
          "Q",
          "STC: VALVE MATERIALS FOR MACHINERY PARTS"
        ]
      ],
      "termsLines": [
        "DRAFT — Not valid for carriage until issued as original AWB.",
        "Shipper certifies that particulars on the face hereof are correct."
      ],
      "remarks": "Draft Report Format-2"
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
        "text": "HOUSE AIR WAYBILL — HAWB DRAFT FORMAT 2",
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
        "type": "signatureRow"
      },
      {
        "type": "colorfulFooter"
      }
    ]
  },
  {
    "code": "HAWB_ORIGINAL_PRE_PRINTED_REPORT_FORMAT_1",
    "formatNumber": 4,
    "name": "HAWB Original Pre Printed Report Format-1",
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
      "invoiceNo": "PLMAAJEA00081",
      "invoiceDate": "29-JAN-19",
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
        "title": "Issuing Carrier Agent",
        "lines": [
          "KingFisher Logistic",
          "Dubai, United Arab Emirates"
        ]
      },
      "fieldGrid": [
        {
          "k": "HAWB No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MAWB No.",
          "v": "176-12345678"
        },
        {
          "k": "Airport of Departure",
          "v": "CHENNAI (MAA)"
        },
        {
          "k": "Airport of Destination",
          "v": "DUBAI (DXB)"
        },
        {
          "k": "Flight / Date",
          "v": "EK-512 / 29-JAN-19"
        },
        {
          "k": "Currency",
          "v": "USD"
        },
        {
          "k": "WT/VAL",
          "v": "PPD"
        },
        {
          "k": "Other",
          "v": "PPD"
        },
        {
          "k": "Declared Value Carriage",
          "v": "NVD"
        },
        {
          "k": "Declared Value Customs",
          "v": "NCV"
        },
        {
          "k": "Amount of Insurance",
          "v": "XXX"
        },
        {
          "k": "Pieces",
          "v": "125"
        },
        {
          "k": "Gross Weight",
          "v": "18,000.0 K"
        },
        {
          "k": "Chargeable Weight",
          "v": "18,000.0 K"
        },
        {
          "k": "Rate / Charge",
          "v": "As agreed"
        },
        {
          "k": "Total",
          "v": "As per AWB"
        },
        {
          "k": "Stock",
          "v": "Pre-printed Format-1"
        }
      ],
      "tableHeaders": [
        "No. of Pieces",
        "Gross Weight",
        "Rate Class",
        "Nature of Goods"
      ],
      "tableRows": [
        [
          "125",
          "18,000.0 K",
          "Q",
          "STC: VALVE MATERIALS FOR MACHINERY PARTS"
        ]
      ],
      "termsLines": [
        "ORIGINAL PRE-PRINTED — For carrier pre-printed stock.",
        "Shipper certifies that particulars on the face hereof are correct."
      ],
      "remarks": "Original Pre Printed Format-1"
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
        "text": "HOUSE AIR WAYBILL — ORIGINAL (PRE-PRINTED) FORMAT 1",
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
    "code": "HAWB_ORIGINAL_PRE_PRINTED_REPORT_FORMAT_2",
    "formatNumber": 5,
    "name": "HAWB Original Pre Printed Report Format-2",
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
      "invoiceNo": "PLMAAJEA00081",
      "invoiceDate": "29-JAN-19",
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
        "title": "Issuing Carrier Agent",
        "lines": [
          "KingFisher Logistic",
          "Dubai, United Arab Emirates"
        ]
      },
      "fieldGrid": [
        {
          "k": "HAWB No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MAWB No.",
          "v": "176-12345678"
        },
        {
          "k": "Airport of Departure",
          "v": "CHENNAI (MAA)"
        },
        {
          "k": "Airport of Destination",
          "v": "DUBAI (DXB)"
        },
        {
          "k": "Flight / Date",
          "v": "EK-512 / 29-JAN-19"
        },
        {
          "k": "Currency",
          "v": "USD"
        },
        {
          "k": "WT/VAL",
          "v": "PPD"
        },
        {
          "k": "Other",
          "v": "PPD"
        },
        {
          "k": "Declared Value Carriage",
          "v": "NVD"
        },
        {
          "k": "Declared Value Customs",
          "v": "NCV"
        },
        {
          "k": "Amount of Insurance",
          "v": "XXX"
        },
        {
          "k": "Pieces",
          "v": "125"
        },
        {
          "k": "Gross Weight",
          "v": "18,000.0 K"
        },
        {
          "k": "Chargeable Weight",
          "v": "18,000.0 K"
        },
        {
          "k": "Rate / Charge",
          "v": "As agreed"
        },
        {
          "k": "Total",
          "v": "As per AWB"
        },
        {
          "k": "Stock",
          "v": "Pre-printed Format-2"
        }
      ],
      "tableHeaders": [
        "No. of Pieces",
        "Gross Weight",
        "Rate Class",
        "Nature of Goods"
      ],
      "tableRows": [
        [
          "125",
          "18,000.0 K",
          "Q",
          "STC: VALVE MATERIALS FOR MACHINERY PARTS"
        ]
      ],
      "termsLines": [
        "ORIGINAL PRE-PRINTED — For carrier pre-printed stock.",
        "Shipper certifies that particulars on the face hereof are correct."
      ],
      "remarks": "Original Pre Printed Format-2"
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
        "text": "HOUSE AIR WAYBILL — ORIGINAL (PRE-PRINTED) FORMAT 2",
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
