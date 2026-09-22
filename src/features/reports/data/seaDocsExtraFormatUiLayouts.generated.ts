import type { InvoiceFormatUiLayout } from '../types/invoiceFormatUiLayout.types';

/** Permanent JSON UI layouts — seaDocsExtraFormatUiLayouts. */
export const SEA_DOCS_EXTRA_FORMAT_UI_LAYOUTS: InvoiceFormatUiLayout[] = [
  {
    "code": "JOB_HOUSES_RECORD_LIST_REPORT_FORMAT",
    "formatNumber": 1,
    "name": "Job Houses Record List Report Format",
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
      "invoiceNo": "LIST-001",
      "invoiceDate": "10-FEB-19",
      "billToName": "All Branches",
      "fieldGrid": [
        {
          "k": "As Of",
          "v": "10-FEB-19"
        },
        {
          "k": "Branch",
          "v": "Dubai"
        },
        {
          "k": "Prepared By",
          "v": "Operations"
        },
        {
          "k": "Layout",
          "v": "Job Houses Record List Report Format"
        }
      ],
      "tableHeaders": [
        "#",
        "Job No.",
        "Customer",
        "Status",
        "ETD",
        "ETA"
      ],
      "tableRows": [
        [
          "1",
          "B/EXP/19/0251",
          "4G LOGISTICS",
          "Pending",
          "29-JAN-19",
          "07-FEB-19"
        ],
        [
          "2",
          "B/EXP/19/0252",
          "AL NASER TRADING",
          "In Transit",
          "30-JAN-19",
          "08-FEB-19"
        ],
        [
          "3",
          "B/EXP/19/0253",
          "GULF FREIGHT",
          "Delivered",
          "28-JAN-19",
          "06-FEB-19"
        ]
      ],
      "termsLines": [
        "Computer generated operations list — sample preview data."
      ],
      "remarks": "Format-1"
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
        "text": "JOB HOUSES RECORD LIST",
        "align": "center",
        "band": true
      },
      {
        "type": "fieldGrid",
        "cols": 3
      },
      {
        "type": "chargeTable",
        "headerColor": "primary"
      },
      {
        "type": "colorfulFooter"
      }
    ]
  },
  {
    "code": "CARGO_MANIFEST_REPORT_FORMAT_2",
    "formatNumber": 2,
    "name": "Cargo Manifest Report Format-2",
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
          "v": "Cargo Manifest Report Format-2"
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
      "remarks": "Format-2"
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
        "text": "CARGO MANIFEST",
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
    "code": "CARGO_MANIFEST_REPORT_FORMAT_3",
    "formatNumber": 3,
    "name": "Cargo Manifest Report Format-3",
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
          "v": "Cargo Manifest Report Format-3"
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
      "remarks": "Format-3"
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
        "text": "CARGO MANIFEST",
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
    "code": "CARGO_MANIFEST_REPORT_FORMAT_4",
    "formatNumber": 4,
    "name": "Cargo Manifest Report Format-4",
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
          "v": "Cargo Manifest Report Format-4"
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
      "remarks": "Format-4"
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
        "text": "CARGO MANIFEST",
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
    "code": "CARGO_MANIFEST_REPORT_FORMAT_5",
    "formatNumber": 5,
    "name": "Cargo Manifest Report Format-5",
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
          "v": "Cargo Manifest Report Format-5"
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
      "remarks": "Format-5"
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
        "text": "CARGO MANIFEST",
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
    "code": "CARGO_MANIFEST_REPORT_FORMAT_6",
    "formatNumber": 6,
    "name": "Cargo Manifest Report Format-6",
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
          "v": "Cargo Manifest Report Format-6"
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
      "remarks": "Format-6"
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
        "text": "CARGO MANIFEST",
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
    "code": "CARGO_MANIFEST_REPORT_FORMAT_7",
    "formatNumber": 7,
    "name": "Cargo Manifest Report Format-7",
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
          "v": "Cargo Manifest Report Format-7"
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
      "remarks": "Format-7"
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
        "text": "CARGO MANIFEST",
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
    "code": "CARGO_MANIFEST_REPORT_FORMAT_8",
    "formatNumber": 8,
    "name": "Cargo Manifest Report Format-8",
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
          "v": "Cargo Manifest Report Format-8"
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
      "remarks": "Format-8"
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
        "text": "CARGO MANIFEST",
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
    "code": "CARGO_MANIFEST_REPORT_FORMAT_9",
    "formatNumber": 9,
    "name": "Cargo Manifest Report Format-9",
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
          "v": "Cargo Manifest Report Format-9"
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
      "remarks": "Format-9"
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
        "text": "CARGO MANIFEST",
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
    "code": "CARGO_MANIFEST_REPORT_FORMAT_10",
    "formatNumber": 10,
    "name": "Cargo Manifest Report Format-10",
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
          "v": "Cargo Manifest Report Format-10"
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
      "remarks": "Format-10"
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
        "text": "CARGO MANIFEST",
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
    "code": "CARGO_MANIFEST_REPORT_FORMAT_11",
    "formatNumber": 11,
    "name": "Cargo Manifest Report Format-11",
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
          "v": "Cargo Manifest Report Format-11"
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
        "text": "CARGO MANIFEST",
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
    "code": "CARGO_MANIFEST_REPORT_FORMAT_12",
    "formatNumber": 12,
    "name": "Cargo Manifest Report Format-12",
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
          "v": "Cargo Manifest Report Format-12"
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
        "text": "CARGO MANIFEST",
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
    "code": "CARGO_MANIFEST_REPORT_FORMAT_13",
    "formatNumber": 13,
    "name": "Cargo Manifest Report Format-13",
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
          "v": "Cargo Manifest Report Format-13"
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
        "text": "CARGO MANIFEST",
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
    "code": "CARGO_MANIFEST_REPORT_FORMAT_14",
    "formatNumber": 14,
    "name": "Cargo Manifest Report Format-14",
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
          "v": "Cargo Manifest Report Format-14"
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
        "text": "CARGO MANIFEST",
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
    "code": "CARGO_MANIFEST_REPORT_FORMAT_15",
    "formatNumber": 15,
    "name": "Cargo Manifest Report Format-15",
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
          "v": "Cargo Manifest Report Format-15"
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
        "text": "CARGO MANIFEST",
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
    "code": "CARGO_MANIFEST_REPORT_FORMAT_16",
    "formatNumber": 16,
    "name": "Cargo Manifest Report Format-16",
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
          "v": "Cargo Manifest Report Format-16"
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
        "text": "CARGO MANIFEST",
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
    "code": "CARGO_MANIFEST_REPORT_FORMAT_17",
    "formatNumber": 17,
    "name": "Cargo Manifest Report Format-17",
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
          "v": "Cargo Manifest Report Format-17"
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
        "text": "CARGO MANIFEST",
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
    "code": "CARGO_MANIFEST_REPORT_FORMAT_18",
    "formatNumber": 18,
    "name": "Cargo Manifest Report Format-18",
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
          "v": "Cargo Manifest Report Format-18"
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
        "text": "CARGO MANIFEST",
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
    "code": "CARGO_MANIFEST_REPORT_FORMAT_19",
    "formatNumber": 19,
    "name": "Cargo Manifest Report Format-19",
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
          "v": "Cargo Manifest Report Format-19"
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
        "text": "CARGO MANIFEST",
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
    "code": "CARGO_MANIFEST_REPORT_FORMAT_20",
    "formatNumber": 20,
    "name": "Cargo Manifest Report Format-20",
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
          "v": "Cargo Manifest Report Format-20"
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
        "text": "CARGO MANIFEST",
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
    "code": "CARGO_MANIFEST_REPORT_FORMAT_21",
    "formatNumber": 21,
    "name": "Cargo Manifest Report Format-21",
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
          "v": "Cargo Manifest Report Format-21"
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
        "text": "CARGO MANIFEST",
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
    "code": "MAWB_DRAFT_REPORT_FORMAT_2",
    "formatNumber": 2,
    "name": "MAWB Draft Report Format-2",
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
          "k": "Layout",
          "v": "MAWB Draft Report Format-2"
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
      "remarks": "Format-2"
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
        "text": "MAWB DRAFT",
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
    "code": "MAWB_DRAFT_REPORT_FORMAT_3",
    "formatNumber": 3,
    "name": "MAWB Draft Report Format-3",
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
          "k": "Layout",
          "v": "MAWB Draft Report Format-3"
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
      "remarks": "Format-3"
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
        "text": "MAWB DRAFT",
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
    "code": "MAWB_DRAFT_REPORT_FORMAT_4",
    "formatNumber": 4,
    "name": "MAWB Draft Report Format-4",
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
          "k": "Layout",
          "v": "MAWB Draft Report Format-4"
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
      "remarks": "Format-4"
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
        "text": "MAWB DRAFT",
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
    "code": "MAWB_DRAFT_REPORT_FORMAT_5",
    "formatNumber": 5,
    "name": "MAWB Draft Report Format-5",
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
          "k": "Layout",
          "v": "MAWB Draft Report Format-5"
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
      "remarks": "Format-5"
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
        "text": "MAWB DRAFT",
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
    "code": "MAWB_DRAFT_REPORT_FORMAT_6",
    "formatNumber": 6,
    "name": "MAWB Draft Report Format-6",
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
          "k": "Layout",
          "v": "MAWB Draft Report Format-6"
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
      "remarks": "Format-6"
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
        "text": "MAWB DRAFT",
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
    "code": "MAWB_DRAFT_REPORT_FORMAT_7",
    "formatNumber": 7,
    "name": "MAWB Draft Report Format-7",
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
          "k": "Layout",
          "v": "MAWB Draft Report Format-7"
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
      "remarks": "Format-7"
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
        "text": "MAWB DRAFT",
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
    "code": "MAWB_DRAFT_REPORT_FORMAT_8",
    "formatNumber": 8,
    "name": "MAWB Draft Report Format-8",
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
          "k": "Layout",
          "v": "MAWB Draft Report Format-8"
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
      "remarks": "Format-8"
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
        "text": "MAWB DRAFT",
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
    "code": "MAWB_DRAFT_REPORT_FORMAT_9",
    "formatNumber": 9,
    "name": "MAWB Draft Report Format-9",
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
          "k": "Layout",
          "v": "MAWB Draft Report Format-9"
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
      "remarks": "Format-9"
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
        "text": "MAWB DRAFT",
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
    "code": "MAWB_DRAFT_REPORT_FORMAT_10",
    "formatNumber": 10,
    "name": "MAWB Draft Report Format-10",
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
          "k": "Layout",
          "v": "MAWB Draft Report Format-10"
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
      "remarks": "Format-10"
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
        "text": "MAWB DRAFT",
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
    "code": "MAWB_DRAFT_REPORT_FORMAT_11",
    "formatNumber": 11,
    "name": "MAWB Draft Report Format-11",
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
          "k": "Layout",
          "v": "MAWB Draft Report Format-11"
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
        "text": "MAWB DRAFT",
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
    "code": "MAWB_DRAFT_REPORT_FORMAT_12",
    "formatNumber": 12,
    "name": "MAWB Draft Report Format-12",
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
          "k": "Layout",
          "v": "MAWB Draft Report Format-12"
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
        "text": "MAWB DRAFT",
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
    "code": "MAWB_DRAFT_REPORT_FORMAT_13",
    "formatNumber": 13,
    "name": "MAWB Draft Report Format-13",
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
          "k": "Layout",
          "v": "MAWB Draft Report Format-13"
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
        "text": "MAWB DRAFT",
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
    "code": "MAWB_DRAFT_REPORT_FORMAT_14",
    "formatNumber": 14,
    "name": "MAWB Draft Report Format-14",
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
          "k": "Layout",
          "v": "MAWB Draft Report Format-14"
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
        "text": "MAWB DRAFT",
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
    "code": "MAWB_DRAFT_REPORT_FORMAT_15",
    "formatNumber": 15,
    "name": "MAWB Draft Report Format-15",
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
          "k": "Layout",
          "v": "MAWB Draft Report Format-15"
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
        "text": "MAWB DRAFT",
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
    "code": "MAWB_DRAFT_REPORT_FORMAT_16",
    "formatNumber": 16,
    "name": "MAWB Draft Report Format-16",
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
          "k": "Layout",
          "v": "MAWB Draft Report Format-16"
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
        "text": "MAWB DRAFT",
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
    "code": "DELIVERY_ORDER_REPORT_FORMAT_2",
    "formatNumber": 2,
    "name": "Delivery Order Report Format-2",
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
          "v": "Delivery Order Report Format-2"
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
      "remarks": "Format-2"
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
        "text": "DELIVERY ORDER",
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
    "code": "DELIVERY_ORDER_REPORT_FORMAT_4",
    "formatNumber": 4,
    "name": "Delivery Order Report Format-4",
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
          "v": "Delivery Order Report Format-4"
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
      "remarks": "Format-4"
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
        "text": "DELIVERY ORDER",
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
    "code": "DELIVERY_ORDER_REPORT_FORMAT_5",
    "formatNumber": 5,
    "name": "Delivery Order Report Format-5",
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
          "v": "Delivery Order Report Format-5"
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
      "remarks": "Format-5"
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
        "text": "DELIVERY ORDER",
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
    "code": "DELIVERY_ORDER_REPORT_FORMAT_6",
    "formatNumber": 6,
    "name": "Delivery Order Report Format-6",
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
          "v": "Delivery Order Report Format-6"
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
      "remarks": "Format-6"
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
        "text": "DELIVERY ORDER",
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
    "code": "DELIVERY_ORDER_REPORT_FORMAT_7",
    "formatNumber": 7,
    "name": "Delivery Order Report Format-7",
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
          "v": "Delivery Order Report Format-7"
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
      "remarks": "Format-7"
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
        "text": "DELIVERY ORDER",
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
    "code": "DELIVERY_ORDER_REPORT_FORMAT_11",
    "formatNumber": 11,
    "name": "Delivery Order Report Format-11",
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
          "v": "Delivery Order Report Format-11"
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
        "text": "DELIVERY ORDER",
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
    "code": "DELIVERY_ORDER_REPORT_FORMAT_12",
    "formatNumber": 12,
    "name": "Delivery Order Report Format-12",
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
          "v": "Delivery Order Report Format-12"
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
        "text": "DELIVERY ORDER",
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
  }
] as InvoiceFormatUiLayout[];
