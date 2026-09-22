import type { InvoiceFormatUiLayout } from '../types/invoiceFormatUiLayout.types';

/** Permanent JSON UI layouts — otherReportsFormatUiLayouts. */
export const OTHER_REPORTS_FORMAT_UI_LAYOUTS: InvoiceFormatUiLayout[] = [
  {
    "code": "CARGO_MANIFEST_REPORT_FORMAT",
    "formatNumber": 1,
    "name": "Cargo Manifest Report Format",
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
          "k": "Service Type",
          "v": "FCL / LCL"
        },
        {
          "k": "No. of Packages",
          "v": "125"
        },
        {
          "k": "Gross Weight",
          "v": "18,000.000 KGS"
        },
        {
          "k": "Measurement",
          "v": "24.000 CBM"
        },
        {
          "k": "Layout",
          "v": "Cargo Manifest Report Format"
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
        "Sample Other Reports layout — Fresa Gold report format preview.",
        "STC: VALVE MATERIALS FOR MACHINERY PARTS"
      ],
      "remarks": "Cargo Manifest"
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
    "code": "CONTAINER_LOAD_PLAN_REPORT_FORMAT",
    "formatNumber": 2,
    "name": "Container Load Plan Report Format",
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
          "k": "Service Type",
          "v": "FCL / LCL"
        },
        {
          "k": "No. of Packages",
          "v": "125"
        },
        {
          "k": "Gross Weight",
          "v": "18,000.000 KGS"
        },
        {
          "k": "Measurement",
          "v": "24.000 CBM"
        },
        {
          "k": "Layout",
          "v": "Container Load Plan Report Format"
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
        "Sample Other Reports layout — Fresa Gold report format preview.",
        "STC: VALVE MATERIALS FOR MACHINERY PARTS"
      ],
      "remarks": "Load Plan"
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
        "text": "CONTAINER LOAD PLAN",
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
    "code": "FREIGHT_MANIFEST_FOR_GROUPAGE_IMPORTS_LCL_REPORT_FORMAT",
    "formatNumber": 3,
    "name": "Freight Manifest For Groupage Imports LCL Report Format",
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
          "k": "Service Type",
          "v": "FCL / LCL"
        },
        {
          "k": "No. of Packages",
          "v": "125"
        },
        {
          "k": "Gross Weight",
          "v": "18,000.000 KGS"
        },
        {
          "k": "Measurement",
          "v": "24.000 CBM"
        },
        {
          "k": "Layout",
          "v": "Freight Manifest For Groupage Imports LCL Report Format"
        },
        {
          "k": "Mode",
          "v": "LCL Import Groupage"
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
        "Sample Other Reports layout — Fresa Gold report format preview.",
        "STC: VALVE MATERIALS FOR MACHINERY PARTS"
      ],
      "remarks": "Groupage LCL Import"
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
        "text": "FREIGHT MANIFEST — GROUPAGE IMPORTS (LCL)",
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
    "code": "TRANSSHIPMENT_LIST_REPORT_FORMAT",
    "formatNumber": 4,
    "name": "Transshipment List Report Format",
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
          "k": "Service Type",
          "v": "FCL / LCL"
        },
        {
          "k": "No. of Packages",
          "v": "125"
        },
        {
          "k": "Gross Weight",
          "v": "18,000.000 KGS"
        },
        {
          "k": "Measurement",
          "v": "24.000 CBM"
        },
        {
          "k": "Layout",
          "v": "Transshipment List Report Format"
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
        "Sample Other Reports layout — Fresa Gold report format preview.",
        "STC: VALVE MATERIALS FOR MACHINERY PARTS"
      ],
      "remarks": "Transshipment"
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
        "text": "TRANSSHIPMENT LIST",
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
    "code": "BOOKING_CONFIRMATION_REPORT_FORMAT_1",
    "formatNumber": 5,
    "name": "Booking Confirmation Report Format-1",
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
      "letterBody": "We are pleased to confirm the booking details as below.",
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
          "k": "Service Type",
          "v": "FCL / LCL"
        },
        {
          "k": "No. of Packages",
          "v": "125"
        },
        {
          "k": "Gross Weight",
          "v": "18,000.000 KGS"
        },
        {
          "k": "Measurement",
          "v": "24.000 CBM"
        },
        {
          "k": "Layout",
          "v": "Booking Confirmation Report Format-1"
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
        "Sample Other Reports layout — Fresa Gold report format preview.",
        "STC: VALVE MATERIALS FOR MACHINERY PARTS"
      ],
      "remarks": "Booking Confirmation-1"
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
        "text": "BOOKING CONFIRMATION — FORMAT 1",
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
    "code": "BOOKING_CONFIRMATION_REPORT_FORMAT_2",
    "formatNumber": 6,
    "name": "Booking Confirmation Report Format-2",
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
      "letterBody": "Booking confirmation (Format-2) — sample export from Fresa Gold.",
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
          "k": "Service Type",
          "v": "FCL / LCL"
        },
        {
          "k": "No. of Packages",
          "v": "125"
        },
        {
          "k": "Gross Weight",
          "v": "18,000.000 KGS"
        },
        {
          "k": "Measurement",
          "v": "24.000 CBM"
        },
        {
          "k": "Layout",
          "v": "Booking Confirmation Report Format-2"
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
        "Sample Other Reports layout — Fresa Gold report format preview.",
        "STC: VALVE MATERIALS FOR MACHINERY PARTS"
      ],
      "remarks": "Booking Confirmation-2"
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
        "text": "BOOKING CONFIRMATION — FORMAT 2",
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
    "code": "CARGO_RECEIPT_NOTE_FOR_EXPORT_CFS_REPORT_FORMAT",
    "formatNumber": 7,
    "name": "Cargo Receipt Note For Export CFS Report Format",
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
          "k": "Service Type",
          "v": "FCL / LCL"
        },
        {
          "k": "No. of Packages",
          "v": "125"
        },
        {
          "k": "Gross Weight",
          "v": "18,000.000 KGS"
        },
        {
          "k": "Measurement",
          "v": "24.000 CBM"
        },
        {
          "k": "Layout",
          "v": "Cargo Receipt Note For Export CFS Report Format"
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
        "Sample Other Reports layout — Fresa Gold report format preview.",
        "STC: VALVE MATERIALS FOR MACHINERY PARTS"
      ],
      "remarks": "Export CFS CRN"
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
        "text": "CARGO RECEIPT NOTE — EXPORT CFS",
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
    "code": "CONTAINER_OUTTURN_REPORT_FORMAT",
    "formatNumber": 8,
    "name": "Container Outturn Report Format",
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
          "k": "Service Type",
          "v": "FCL / LCL"
        },
        {
          "k": "No. of Packages",
          "v": "125"
        },
        {
          "k": "Gross Weight",
          "v": "18,000.000 KGS"
        },
        {
          "k": "Measurement",
          "v": "24.000 CBM"
        },
        {
          "k": "Layout",
          "v": "Container Outturn Report Format"
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
        "Sample Other Reports layout — Fresa Gold report format preview.",
        "STC: VALVE MATERIALS FOR MACHINERY PARTS"
      ],
      "remarks": "Outturn"
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
        "text": "CONTAINER OUTTURN REPORT",
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
    "code": "CONTAINER_UNLOAD_PLAN_REPORT_FORMAT",
    "formatNumber": 9,
    "name": "Container Unload Plan Report Format",
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
          "k": "Service Type",
          "v": "FCL / LCL"
        },
        {
          "k": "No. of Packages",
          "v": "125"
        },
        {
          "k": "Gross Weight",
          "v": "18,000.000 KGS"
        },
        {
          "k": "Measurement",
          "v": "24.000 CBM"
        },
        {
          "k": "Layout",
          "v": "Container Unload Plan Report Format"
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
        "Sample Other Reports layout — Fresa Gold report format preview.",
        "STC: VALVE MATERIALS FOR MACHINERY PARTS"
      ],
      "remarks": "Unload Plan"
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
        "text": "CONTAINER UNLOAD PLAN",
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
    "code": "FREIGHT_MANIFEST_LCL_EXPORTS_REPORT_FORMAT",
    "formatNumber": 10,
    "name": "Freight Manifest LCL Exports Report Format",
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
          "k": "Service Type",
          "v": "FCL / LCL"
        },
        {
          "k": "No. of Packages",
          "v": "125"
        },
        {
          "k": "Gross Weight",
          "v": "18,000.000 KGS"
        },
        {
          "k": "Measurement",
          "v": "24.000 CBM"
        },
        {
          "k": "Layout",
          "v": "Freight Manifest LCL Exports Report Format"
        },
        {
          "k": "Mode",
          "v": "LCL Export"
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
        "Sample Other Reports layout — Fresa Gold report format preview.",
        "STC: VALVE MATERIALS FOR MACHINERY PARTS"
      ],
      "remarks": "LCL Exports"
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
        "text": "FREIGHT MANIFEST — LCL EXPORTS",
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
    "code": "SAILING_CONFIRMATION_REPORT_FORMAT",
    "formatNumber": 11,
    "name": "Sailing Confirmation Report Format",
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
      "letterBody": "Vessel sailing confirmation for the shipment referenced below.",
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
          "k": "Service Type",
          "v": "FCL / LCL"
        },
        {
          "k": "No. of Packages",
          "v": "125"
        },
        {
          "k": "Gross Weight",
          "v": "18,000.000 KGS"
        },
        {
          "k": "Measurement",
          "v": "24.000 CBM"
        },
        {
          "k": "Layout",
          "v": "Sailing Confirmation Report Format"
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
        "Sample Other Reports layout — Fresa Gold report format preview.",
        "STC: VALVE MATERIALS FOR MACHINERY PARTS"
      ],
      "remarks": "Sailing Confirmation"
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
        "text": "SAILING CONFIRMATION",
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
    "code": "CONSOL_IGM_FILLING_LETTER_JASPER_REPORT_FORMAT",
    "formatNumber": 12,
    "name": "Consol IGM Filling Letter Jasper Report Format",
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
      "letterBody": "Please find enclosed the consol IGM filling particulars for customs processing.",
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
          "k": "Service Type",
          "v": "FCL / LCL"
        },
        {
          "k": "No. of Packages",
          "v": "125"
        },
        {
          "k": "Gross Weight",
          "v": "18,000.000 KGS"
        },
        {
          "k": "Measurement",
          "v": "24.000 CBM"
        },
        {
          "k": "Layout",
          "v": "Consol IGM Filling Letter Jasper Report Format"
        },
        {
          "k": "IGM No.",
          "v": "IGM/2019/004421"
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
        "Sample Other Reports layout — Fresa Gold report format preview.",
        "Jasper consol IGM filling letter sample.",
        "STC: VALVE MATERIALS FOR MACHINERY PARTS"
      ],
      "remarks": "IGM Filling Letter"
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
        "text": "CONSOL IGM FILLING LETTER",
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
    "code": "CONTAINER_MOVEMENT_FACILITATION_CELL_NOTE_REPORT_FORMAT",
    "formatNumber": 13,
    "name": "Container Movement Facilitation Cell Note Report Format",
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
          "k": "Service Type",
          "v": "FCL / LCL"
        },
        {
          "k": "No. of Packages",
          "v": "125"
        },
        {
          "k": "Gross Weight",
          "v": "18,000.000 KGS"
        },
        {
          "k": "Measurement",
          "v": "24.000 CBM"
        },
        {
          "k": "Layout",
          "v": "Container Movement Facilitation Cell Note Report Format"
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
        "Sample Other Reports layout — Fresa Gold report format preview.",
        "STC: VALVE MATERIALS FOR MACHINERY PARTS"
      ],
      "remarks": "CMFC Note"
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
        "text": "CONTAINER MOVEMENT FACILITATION CELL NOTE",
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
    "code": "EXCHANGE_LETTER_TO_CARRIER_AGENT_REPORT_FORMAT",
    "formatNumber": 14,
    "name": "Exchange Letter To Carrier Agent Report Format",
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
      "letterBody": "Exchange letter to carrier agent — sample from Fresa Gold.",
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
          "k": "Service Type",
          "v": "FCL / LCL"
        },
        {
          "k": "No. of Packages",
          "v": "125"
        },
        {
          "k": "Gross Weight",
          "v": "18,000.000 KGS"
        },
        {
          "k": "Measurement",
          "v": "24.000 CBM"
        },
        {
          "k": "Layout",
          "v": "Exchange Letter To Carrier Agent Report Format"
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
        "Sample Other Reports layout — Fresa Gold report format preview.",
        "STC: VALVE MATERIALS FOR MACHINERY PARTS"
      ],
      "remarks": "Exchange Letter"
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
        "text": "EXCHANGE LETTER TO CARRIER AGENT",
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
    "code": "IMPORT_CARGO_MANIFEST_REPORT_FORMAT",
    "formatNumber": 15,
    "name": "Import Cargo Manifest Report Format",
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
          "k": "Service Type",
          "v": "FCL / LCL"
        },
        {
          "k": "No. of Packages",
          "v": "125"
        },
        {
          "k": "Gross Weight",
          "v": "18,000.000 KGS"
        },
        {
          "k": "Measurement",
          "v": "24.000 CBM"
        },
        {
          "k": "Layout",
          "v": "Import Cargo Manifest Report Format"
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
        "Sample Other Reports layout — Fresa Gold report format preview.",
        "STC: VALVE MATERIALS FOR MACHINERY PARTS"
      ],
      "remarks": "Import Manifest"
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
        "text": "IMPORT CARGO MANIFEST",
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
    "code": "IMPORT_TALLY_SHEET_REPORT_FORMAT",
    "formatNumber": 16,
    "name": "Import Tally Sheet Report Format",
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
          "k": "Service Type",
          "v": "FCL / LCL"
        },
        {
          "k": "No. of Packages",
          "v": "125"
        },
        {
          "k": "Gross Weight",
          "v": "18,000.000 KGS"
        },
        {
          "k": "Measurement",
          "v": "24.000 CBM"
        },
        {
          "k": "Layout",
          "v": "Import Tally Sheet Report Format"
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
        "Sample Other Reports layout — Fresa Gold report format preview.",
        "STC: VALVE MATERIALS FOR MACHINERY PARTS"
      ],
      "remarks": "Import Tally"
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
        "text": "IMPORT TALLY SHEET",
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
    "code": "LETTER_OF_GUARANTEE_REPORT_FORMAT",
    "formatNumber": 17,
    "name": "Letter OF Guarantee Report Format",
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
      "letterBody": "Letter of guarantee issued for the shipment referenced below.",
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
          "k": "Service Type",
          "v": "FCL / LCL"
        },
        {
          "k": "No. of Packages",
          "v": "125"
        },
        {
          "k": "Gross Weight",
          "v": "18,000.000 KGS"
        },
        {
          "k": "Measurement",
          "v": "24.000 CBM"
        },
        {
          "k": "Layout",
          "v": "Letter OF Guarantee Report Format"
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
        "Sample Other Reports layout — Fresa Gold report format preview.",
        "STC: VALVE MATERIALS FOR MACHINERY PARTS"
      ],
      "remarks": "LOG"
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
        "text": "LETTER OF GUARANTEE",
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
    "code": "RIDER_SHEET_FOR_EXPORT_MANIFEST_REPORT_FORMAT",
    "formatNumber": 18,
    "name": "Rider Sheet For Export Manifest Report Format",
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
          "k": "Service Type",
          "v": "FCL / LCL"
        },
        {
          "k": "No. of Packages",
          "v": "125"
        },
        {
          "k": "Gross Weight",
          "v": "18,000.000 KGS"
        },
        {
          "k": "Measurement",
          "v": "24.000 CBM"
        },
        {
          "k": "Layout",
          "v": "Rider Sheet For Export Manifest Report Format"
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
        "Sample Other Reports layout — Fresa Gold report format preview.",
        "STC: VALVE MATERIALS FOR MACHINERY PARTS"
      ],
      "remarks": "Rider Sheet"
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
        "text": "RIDER SHEET — EXPORT MANIFEST",
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
    "code": "SHIPMENT_PROFIT_AND_LOSS_REPORT_FORMAT",
    "formatNumber": 19,
    "name": "Shipment Profit And Loss Report Format",
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
          "k": "Service Type",
          "v": "FCL / LCL"
        },
        {
          "k": "No. of Packages",
          "v": "125"
        },
        {
          "k": "Gross Weight",
          "v": "18,000.000 KGS"
        },
        {
          "k": "Measurement",
          "v": "24.000 CBM"
        },
        {
          "k": "Layout",
          "v": "Shipment Profit And Loss Report Format"
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
        "Sample Other Reports layout — Fresa Gold report format preview.",
        "STC: VALVE MATERIALS FOR MACHINERY PARTS"
      ],
      "remarks": "P&L"
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
        "text": "SHIPMENT PROFIT AND LOSS",
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
    "code": "SHIPMENT_STATUS_CONFIRMATION_REPORT_FORMAT",
    "formatNumber": 20,
    "name": "Shipment Status Confirmation Report Format",
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
      "letterBody": "Shipment status confirmation for the consignment below.",
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
          "k": "Service Type",
          "v": "FCL / LCL"
        },
        {
          "k": "No. of Packages",
          "v": "125"
        },
        {
          "k": "Gross Weight",
          "v": "18,000.000 KGS"
        },
        {
          "k": "Measurement",
          "v": "24.000 CBM"
        },
        {
          "k": "Layout",
          "v": "Shipment Status Confirmation Report Format"
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
        "Sample Other Reports layout — Fresa Gold report format preview.",
        "STC: VALVE MATERIALS FOR MACHINERY PARTS"
      ],
      "remarks": "Status Confirmation"
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
        "text": "SHIPMENT STATUS CONFIRMATION",
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
    "code": "TRUCK_CARGO_PICKUP_REQUEST_REPORT_FORMAT",
    "formatNumber": 21,
    "name": "Truck Cargo Pickup Request Report Format",
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
          "k": "Service Type",
          "v": "FCL / LCL"
        },
        {
          "k": "No. of Packages",
          "v": "125"
        },
        {
          "k": "Gross Weight",
          "v": "18,000.000 KGS"
        },
        {
          "k": "Measurement",
          "v": "24.000 CBM"
        },
        {
          "k": "Layout",
          "v": "Truck Cargo Pickup Request Report Format"
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
        "Sample Other Reports layout — Fresa Gold report format preview.",
        "STC: VALVE MATERIALS FOR MACHINERY PARTS"
      ],
      "remarks": "Pickup Request"
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
        "text": "TRUCK CARGO PICKUP REQUEST",
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
    "code": "CARTING_CONFIRMATION_REPORT_FORMAT",
    "formatNumber": 22,
    "name": "Carting Confirmation Report Format",
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
          "k": "Service Type",
          "v": "FCL / LCL"
        },
        {
          "k": "No. of Packages",
          "v": "125"
        },
        {
          "k": "Gross Weight",
          "v": "18,000.000 KGS"
        },
        {
          "k": "Measurement",
          "v": "24.000 CBM"
        },
        {
          "k": "Layout",
          "v": "Carting Confirmation Report Format"
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
        "Sample Other Reports layout — Fresa Gold report format preview.",
        "STC: VALVE MATERIALS FOR MACHINERY PARTS"
      ],
      "remarks": "Carting"
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
        "text": "CARTING CONFIRMATION",
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
    "code": "CONTAINER_VGM_FORM_REPORT_FORMAT",
    "formatNumber": 23,
    "name": "Container VGM Form Report Format",
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
          "k": "Service Type",
          "v": "FCL / LCL"
        },
        {
          "k": "No. of Packages",
          "v": "125"
        },
        {
          "k": "Gross Weight",
          "v": "18,000.000 KGS"
        },
        {
          "k": "Measurement",
          "v": "24.000 CBM"
        },
        {
          "k": "Layout",
          "v": "Container VGM Form Report Format"
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
        "Sample Other Reports layout — Fresa Gold report format preview.",
        "STC: VALVE MATERIALS FOR MACHINERY PARTS"
      ],
      "remarks": "VGM"
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
        "text": "CONTAINER VGM FORM",
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
    "code": "FCL_QUOTATION_REPORT_FORMAT",
    "formatNumber": 24,
    "name": "FCL Quotation Report Format",
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
      "letterBody": "FCL quotation — rates and terms as per below.",
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
          "k": "Service Type",
          "v": "FCL / LCL"
        },
        {
          "k": "No. of Packages",
          "v": "125"
        },
        {
          "k": "Gross Weight",
          "v": "18,000.000 KGS"
        },
        {
          "k": "Measurement",
          "v": "24.000 CBM"
        },
        {
          "k": "Layout",
          "v": "FCL Quotation Report Format"
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
        "Sample Other Reports layout — Fresa Gold report format preview.",
        "STC: VALVE MATERIALS FOR MACHINERY PARTS"
      ],
      "remarks": "FCL Quotation"
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
        "text": "FCL QUOTATION",
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
    "code": "FCR_DOCUMENT_REPORT_FORMAT",
    "formatNumber": 25,
    "name": "FCR Document Report Format",
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
          "k": "Service Type",
          "v": "FCL / LCL"
        },
        {
          "k": "No. of Packages",
          "v": "125"
        },
        {
          "k": "Gross Weight",
          "v": "18,000.000 KGS"
        },
        {
          "k": "Measurement",
          "v": "24.000 CBM"
        },
        {
          "k": "Layout",
          "v": "FCR Document Report Format"
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
        "Sample Other Reports layout — Fresa Gold report format preview.",
        "STC: VALVE MATERIALS FOR MACHINERY PARTS"
      ],
      "remarks": "FCR"
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
        "text": "FCR DOCUMENT",
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
    "code": "IMPORT_SECURITY_FILLING_JASPER_AMS_REPORT_FORMAT",
    "formatNumber": 26,
    "name": "Import Security Filling Jasper AMS Report Format",
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
          "k": "Service Type",
          "v": "FCL / LCL"
        },
        {
          "k": "No. of Packages",
          "v": "125"
        },
        {
          "k": "Gross Weight",
          "v": "18,000.000 KGS"
        },
        {
          "k": "Measurement",
          "v": "24.000 CBM"
        },
        {
          "k": "Layout",
          "v": "Import Security Filling Jasper AMS Report Format"
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
        "Sample Other Reports layout — Fresa Gold report format preview.",
        "STC: VALVE MATERIALS FOR MACHINERY PARTS"
      ],
      "remarks": "ISF / AMS"
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
        "text": "IMPORT SECURITY FILLING — AMS",
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
    "code": "ISF_FILING_DOCUMENT_REPORT_FORMAT",
    "formatNumber": 27,
    "name": "ISF Filing Document Report Format",
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
          "k": "Service Type",
          "v": "FCL / LCL"
        },
        {
          "k": "No. of Packages",
          "v": "125"
        },
        {
          "k": "Gross Weight",
          "v": "18,000.000 KGS"
        },
        {
          "k": "Measurement",
          "v": "24.000 CBM"
        },
        {
          "k": "Layout",
          "v": "ISF Filing Document Report Format"
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
        "Sample Other Reports layout — Fresa Gold report format preview.",
        "STC: VALVE MATERIALS FOR MACHINERY PARTS"
      ],
      "remarks": "ISF Filing"
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
        "text": "ISF FILING DOCUMENT",
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
    "code": "LOADING_CONFIRMATION_REPORT_FORMAT",
    "formatNumber": 28,
    "name": "Loading Confirmation Report Format",
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
      "letterBody": "Loading confirmation for the shipment referenced below.",
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
          "k": "Service Type",
          "v": "FCL / LCL"
        },
        {
          "k": "No. of Packages",
          "v": "125"
        },
        {
          "k": "Gross Weight",
          "v": "18,000.000 KGS"
        },
        {
          "k": "Measurement",
          "v": "24.000 CBM"
        },
        {
          "k": "Layout",
          "v": "Loading Confirmation Report Format"
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
        "Sample Other Reports layout — Fresa Gold report format preview.",
        "STC: VALVE MATERIALS FOR MACHINERY PARTS"
      ],
      "remarks": "Loading Confirmation"
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
        "text": "LOADING CONFIRMATION",
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
    "code": "PICKUP_CONFIRMATION_REPORT_FORMAT",
    "formatNumber": 29,
    "name": "Pickup Confirmation Report Format",
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
      "letterBody": "Cargo pickup confirmation for the consignment below.",
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
          "k": "Service Type",
          "v": "FCL / LCL"
        },
        {
          "k": "No. of Packages",
          "v": "125"
        },
        {
          "k": "Gross Weight",
          "v": "18,000.000 KGS"
        },
        {
          "k": "Measurement",
          "v": "24.000 CBM"
        },
        {
          "k": "Layout",
          "v": "Pickup Confirmation Report Format"
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
        "Sample Other Reports layout — Fresa Gold report format preview.",
        "STC: VALVE MATERIALS FOR MACHINERY PARTS"
      ],
      "remarks": "Pickup Confirmation"
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
        "text": "PICKUP CONFIRMATION",
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
    "code": "PRE_ALERT_TO_CLIENT_REPORT_FORMAT",
    "formatNumber": 30,
    "name": "Pre Alert To Client Report Format",
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
      "letterBody": "Pre-alert to client — shipment particulars as below.",
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
          "k": "Service Type",
          "v": "FCL / LCL"
        },
        {
          "k": "No. of Packages",
          "v": "125"
        },
        {
          "k": "Gross Weight",
          "v": "18,000.000 KGS"
        },
        {
          "k": "Measurement",
          "v": "24.000 CBM"
        },
        {
          "k": "Layout",
          "v": "Pre Alert To Client Report Format"
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
        "Sample Other Reports layout — Fresa Gold report format preview.",
        "STC: VALVE MATERIALS FOR MACHINERY PARTS"
      ],
      "remarks": "Pre Alert"
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
        "text": "PRE ALERT TO CLIENT",
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
    "code": "PREALERT_USA_JASPER_REPORT_FORMAT",
    "formatNumber": 31,
    "name": "Prealert USA Jasper Report Format",
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
      "letterBody": "USA pre-alert (Jasper) — sample export from Fresa Gold.",
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
          "k": "Service Type",
          "v": "FCL / LCL"
        },
        {
          "k": "No. of Packages",
          "v": "125"
        },
        {
          "k": "Gross Weight",
          "v": "18,000.000 KGS"
        },
        {
          "k": "Measurement",
          "v": "24.000 CBM"
        },
        {
          "k": "Layout",
          "v": "Prealert USA Jasper Report Format"
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
        "Sample Other Reports layout — Fresa Gold report format preview.",
        "STC: VALVE MATERIALS FOR MACHINERY PARTS"
      ],
      "remarks": "Prealert USA"
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
        "text": "PREALERT USA",
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
    "code": "SHIPPING_INSTRUCTION_REPORT_FORMAT",
    "formatNumber": 32,
    "name": "Shipping Instruction Report Format",
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
          "k": "Service Type",
          "v": "FCL / LCL"
        },
        {
          "k": "No. of Packages",
          "v": "125"
        },
        {
          "k": "Gross Weight",
          "v": "18,000.000 KGS"
        },
        {
          "k": "Measurement",
          "v": "24.000 CBM"
        },
        {
          "k": "Layout",
          "v": "Shipping Instruction Report Format"
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
        "Sample Other Reports layout — Fresa Gold report format preview.",
        "STC: VALVE MATERIALS FOR MACHINERY PARTS"
      ],
      "remarks": "Shipping Instruction"
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
        "text": "SHIPPING INSTRUCTION",
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
    "code": "STUFFING_REPORT_FORMAT",
    "formatNumber": 33,
    "name": "Stuffing Report Format",
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
          "k": "Service Type",
          "v": "FCL / LCL"
        },
        {
          "k": "No. of Packages",
          "v": "125"
        },
        {
          "k": "Gross Weight",
          "v": "18,000.000 KGS"
        },
        {
          "k": "Measurement",
          "v": "24.000 CBM"
        },
        {
          "k": "Layout",
          "v": "Stuffing Report Format"
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
        "Sample Other Reports layout — Fresa Gold report format preview.",
        "STC: VALVE MATERIALS FOR MACHINERY PARTS"
      ],
      "remarks": "Stuffing"
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
        "text": "STUFFING REPORT",
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
    "code": "STUFFING_REPORT_JASPER_REPORT_FORMAT",
    "formatNumber": 34,
    "name": "Stuffing Report Jasper Report Format",
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
          "k": "Service Type",
          "v": "FCL / LCL"
        },
        {
          "k": "No. of Packages",
          "v": "125"
        },
        {
          "k": "Gross Weight",
          "v": "18,000.000 KGS"
        },
        {
          "k": "Measurement",
          "v": "24.000 CBM"
        },
        {
          "k": "Layout",
          "v": "Stuffing Report Jasper Report Format"
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
        "Sample Other Reports layout — Fresa Gold report format preview.",
        "STC: VALVE MATERIALS FOR MACHINERY PARTS"
      ],
      "remarks": "Stuffing Jasper"
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
        "text": "STUFFING REPORT — JASPER",
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
    "code": "SURRENDERED_LETTER_REPORT_FORMAT",
    "formatNumber": 35,
    "name": "Surrendered Letter Report Format",
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
      "letterBody": "Bill of lading surrender confirmation for the shipment below.",
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
          "k": "Service Type",
          "v": "FCL / LCL"
        },
        {
          "k": "No. of Packages",
          "v": "125"
        },
        {
          "k": "Gross Weight",
          "v": "18,000.000 KGS"
        },
        {
          "k": "Measurement",
          "v": "24.000 CBM"
        },
        {
          "k": "Layout",
          "v": "Surrendered Letter Report Format"
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
        "Sample Other Reports layout — Fresa Gold report format preview.",
        "STC: VALVE MATERIALS FOR MACHINERY PARTS"
      ],
      "remarks": "Surrendered"
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
        "text": "SURRENDERED LETTER",
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
    "code": "TERMINAL_DEPARTURE_REPORT_TDR_REPORT_FORMAT",
    "formatNumber": 36,
    "name": "Terminal Departure Report (TDR) Report Format",
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
          "k": "Service Type",
          "v": "FCL / LCL"
        },
        {
          "k": "No. of Packages",
          "v": "125"
        },
        {
          "k": "Gross Weight",
          "v": "18,000.000 KGS"
        },
        {
          "k": "Measurement",
          "v": "24.000 CBM"
        },
        {
          "k": "Layout",
          "v": "Terminal Departure Report (TDR) Report Format"
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
        "Sample Other Reports layout — Fresa Gold report format preview.",
        "STC: VALVE MATERIALS FOR MACHINERY PARTS"
      ],
      "remarks": "TDR"
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
        "text": "TERMINAL DEPARTURE REPORT (TDR)",
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
    "code": "DAILY_STATUS_REPORT_FORMAT_1",
    "formatNumber": 37,
    "name": "Daily Status Report Format-1",
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
          "k": "Service Type",
          "v": "FCL / LCL"
        },
        {
          "k": "No. of Packages",
          "v": "125"
        },
        {
          "k": "Gross Weight",
          "v": "18,000.000 KGS"
        },
        {
          "k": "Measurement",
          "v": "24.000 CBM"
        },
        {
          "k": "Layout",
          "v": "Daily Status Report Format-1"
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
        "Sample Other Reports layout — Fresa Gold report format preview.",
        "STC: VALVE MATERIALS FOR MACHINERY PARTS"
      ],
      "remarks": "DSR Format-1"
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
        "text": "DAILY STATUS REPORT — FORMAT 1",
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
    "code": "DAILY_STATUS_REPORT_FORMAT_2",
    "formatNumber": 38,
    "name": "Daily Status Report Format-2",
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
          "k": "Service Type",
          "v": "FCL / LCL"
        },
        {
          "k": "No. of Packages",
          "v": "125"
        },
        {
          "k": "Gross Weight",
          "v": "18,000.000 KGS"
        },
        {
          "k": "Measurement",
          "v": "24.000 CBM"
        },
        {
          "k": "Layout",
          "v": "Daily Status Report Format-2"
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
        "Sample Other Reports layout — Fresa Gold report format preview.",
        "STC: VALVE MATERIALS FOR MACHINERY PARTS"
      ],
      "remarks": "DSR Format-2"
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
        "text": "DAILY STATUS REPORT — FORMAT 2",
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
    "code": "JOB_CARD_REPORT_FORMAT",
    "formatNumber": 39,
    "name": "Job Card Report Format",
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
          "k": "Service Type",
          "v": "FCL / LCL"
        },
        {
          "k": "No. of Packages",
          "v": "125"
        },
        {
          "k": "Gross Weight",
          "v": "18,000.000 KGS"
        },
        {
          "k": "Measurement",
          "v": "24.000 CBM"
        },
        {
          "k": "Layout",
          "v": "Job Card Report Format"
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
        "Sample Other Reports layout — Fresa Gold report format preview.",
        "STC: VALVE MATERIALS FOR MACHINERY PARTS"
      ],
      "remarks": "Job Card"
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
        "text": "JOB CARD",
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
    "code": "AIR_QUOTATION_REPORT_FORMAT",
    "formatNumber": 40,
    "name": "Air Quotation Report Format",
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
      "letterBody": "Air freight quotation — rates and terms as per below.",
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
          "k": "Service Type",
          "v": "FCL / LCL"
        },
        {
          "k": "No. of Packages",
          "v": "125"
        },
        {
          "k": "Gross Weight",
          "v": "18,000.000 KGS"
        },
        {
          "k": "Measurement",
          "v": "24.000 CBM"
        },
        {
          "k": "Layout",
          "v": "Air Quotation Report Format"
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
        "Sample Other Reports layout — Fresa Gold report format preview.",
        "STC: VALVE MATERIALS FOR MACHINERY PARTS"
      ],
      "remarks": "Air Quotation"
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
        "text": "AIR QUOTATION",
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
    "code": "AIR_QUOTATION_WITH_AIRLINE_REPORT_FORMAT",
    "formatNumber": 41,
    "name": "Air Quotation With Airline Report Format",
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
      "letterBody": "Air quotation including airline particulars.",
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
          "k": "Service Type",
          "v": "FCL / LCL"
        },
        {
          "k": "No. of Packages",
          "v": "125"
        },
        {
          "k": "Gross Weight",
          "v": "18,000.000 KGS"
        },
        {
          "k": "Measurement",
          "v": "24.000 CBM"
        },
        {
          "k": "Layout",
          "v": "Air Quotation With Airline Report Format"
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
        "Sample Other Reports layout — Fresa Gold report format preview.",
        "STC: VALVE MATERIALS FOR MACHINERY PARTS"
      ],
      "remarks": "Air Quotation + Airline"
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
        "text": "AIR QUOTATION WITH AIRLINE",
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
    "code": "AIR_FREIGHT_ATD_CONFIRMATION_REPORT_FORMAT",
    "formatNumber": 42,
    "name": "Air Freight ATD Confirmation Report Format",
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
      "letterBody": "Air freight ATD confirmation for the shipment below.",
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
          "k": "Service Type",
          "v": "FCL / LCL"
        },
        {
          "k": "No. of Packages",
          "v": "125"
        },
        {
          "k": "Gross Weight",
          "v": "18,000.000 KGS"
        },
        {
          "k": "Measurement",
          "v": "24.000 CBM"
        },
        {
          "k": "Layout",
          "v": "Air Freight ATD Confirmation Report Format"
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
        "Sample Other Reports layout — Fresa Gold report format preview.",
        "STC: VALVE MATERIALS FOR MACHINERY PARTS"
      ],
      "remarks": "ATD Confirmation"
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
        "text": "AIR FREIGHT ATD CONFIRMATION",
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
    "code": "BARCODE_AWB_REPORT_FORMAT",
    "formatNumber": 43,
    "name": "Barcode AWB Report Format",
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
          "k": "Service Type",
          "v": "FCL / LCL"
        },
        {
          "k": "No. of Packages",
          "v": "125"
        },
        {
          "k": "Gross Weight",
          "v": "18,000.000 KGS"
        },
        {
          "k": "Measurement",
          "v": "24.000 CBM"
        },
        {
          "k": "Layout",
          "v": "Barcode AWB Report Format"
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
        "Sample Other Reports layout — Fresa Gold report format preview.",
        "STC: VALVE MATERIALS FOR MACHINERY PARTS"
      ],
      "remarks": "Barcode AWB"
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
        "text": "BARCODE AWB",
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
    "code": "BOOKING_CONFIRMATION_AIR_REPORT_FORMAT",
    "formatNumber": 44,
    "name": "Booking Confirmation Air Report Format",
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
      "letterBody": "Air booking confirmation particulars as below.",
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
          "k": "Service Type",
          "v": "FCL / LCL"
        },
        {
          "k": "No. of Packages",
          "v": "125"
        },
        {
          "k": "Gross Weight",
          "v": "18,000.000 KGS"
        },
        {
          "k": "Measurement",
          "v": "24.000 CBM"
        },
        {
          "k": "Layout",
          "v": "Booking Confirmation Air Report Format"
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
        "Sample Other Reports layout — Fresa Gold report format preview.",
        "STC: VALVE MATERIALS FOR MACHINERY PARTS"
      ],
      "remarks": "Air Booking"
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
        "text": "BOOKING CONFIRMATION — AIR",
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
    "code": "CARGO_MANIFEST_AIR_HOUSE_REPORT_FORMAT",
    "formatNumber": 45,
    "name": "Cargo Manifest Air House Report Format",
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
          "k": "Service Type",
          "v": "FCL / LCL"
        },
        {
          "k": "No. of Packages",
          "v": "125"
        },
        {
          "k": "Gross Weight",
          "v": "18,000.000 KGS"
        },
        {
          "k": "Measurement",
          "v": "24.000 CBM"
        },
        {
          "k": "Layout",
          "v": "Cargo Manifest Air House Report Format"
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
        "Sample Other Reports layout — Fresa Gold report format preview.",
        "STC: VALVE MATERIALS FOR MACHINERY PARTS"
      ],
      "remarks": "Air House Manifest"
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
        "text": "CARGO MANIFEST — AIR HOUSE",
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
    "code": "CARGO_MANIFEST_AIR_JASPER_REPORT_FORMAT",
    "formatNumber": 46,
    "name": "Cargo Manifest Air Jasper Report format",
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
          "k": "Service Type",
          "v": "FCL / LCL"
        },
        {
          "k": "No. of Packages",
          "v": "125"
        },
        {
          "k": "Gross Weight",
          "v": "18,000.000 KGS"
        },
        {
          "k": "Measurement",
          "v": "24.000 CBM"
        },
        {
          "k": "Layout",
          "v": "Cargo Manifest Air Jasper Report format"
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
        "Sample Other Reports layout — Fresa Gold report format preview.",
        "STC: VALVE MATERIALS FOR MACHINERY PARTS"
      ],
      "remarks": "Air Jasper Manifest"
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
        "text": "CARGO MANIFEST — AIR JASPER",
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
    "code": "CARGO_MANIFEST_AIR_LC_JASPER_REPORT_FORMAT",
    "formatNumber": 47,
    "name": "Cargo Manifest Air LC Jasper Report Format",
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
          "k": "Service Type",
          "v": "FCL / LCL"
        },
        {
          "k": "No. of Packages",
          "v": "125"
        },
        {
          "k": "Gross Weight",
          "v": "18,000.000 KGS"
        },
        {
          "k": "Measurement",
          "v": "24.000 CBM"
        },
        {
          "k": "Layout",
          "v": "Cargo Manifest Air LC Jasper Report Format"
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
        "Sample Other Reports layout — Fresa Gold report format preview.",
        "STC: VALVE MATERIALS FOR MACHINERY PARTS"
      ],
      "remarks": "Air LC Jasper"
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
        "text": "CARGO MANIFEST — AIR LC JASPER",
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
    "code": "SHIPMENT_FREIGHT_MANIFEST_REPORT_FORMAT",
    "formatNumber": 48,
    "name": "Shipment Freight Manifest Report Format",
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
          "k": "Service Type",
          "v": "FCL / LCL"
        },
        {
          "k": "No. of Packages",
          "v": "125"
        },
        {
          "k": "Gross Weight",
          "v": "18,000.000 KGS"
        },
        {
          "k": "Measurement",
          "v": "24.000 CBM"
        },
        {
          "k": "Layout",
          "v": "Shipment Freight Manifest Report Format"
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
        "Sample Other Reports layout — Fresa Gold report format preview.",
        "STC: VALVE MATERIALS FOR MACHINERY PARTS"
      ],
      "remarks": "Freight Manifest"
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
        "text": "SHIPMENT FREIGHT MANIFEST",
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
    "code": "AIR_SHIPMENT_PROFIT_AND_LOSS_REPORT_FORMAT",
    "formatNumber": 49,
    "name": "Air Shipment Profit And Loss Report Format",
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
          "k": "Service Type",
          "v": "FCL / LCL"
        },
        {
          "k": "No. of Packages",
          "v": "125"
        },
        {
          "k": "Gross Weight",
          "v": "18,000.000 KGS"
        },
        {
          "k": "Measurement",
          "v": "24.000 CBM"
        },
        {
          "k": "Layout",
          "v": "Air Shipment Profit And Loss Report Format"
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
        "Sample Other Reports layout — Fresa Gold report format preview.",
        "STC: VALVE MATERIALS FOR MACHINERY PARTS"
      ],
      "remarks": "Air P&L"
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
        "text": "AIR SHIPMENT PROFIT AND LOSS",
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
    "code": "AIR_SHIPMENT_PROFIT_AND_LOSS_REPORT_FORMAT_1",
    "formatNumber": 50,
    "name": "Air Shipment Profit And Loss Report Format-1",
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
          "k": "Service Type",
          "v": "FCL / LCL"
        },
        {
          "k": "No. of Packages",
          "v": "125"
        },
        {
          "k": "Gross Weight",
          "v": "18,000.000 KGS"
        },
        {
          "k": "Measurement",
          "v": "24.000 CBM"
        },
        {
          "k": "Layout",
          "v": "Air Shipment Profit And Loss Report Format-1"
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
        "Sample Other Reports layout — Fresa Gold report format preview.",
        "STC: VALVE MATERIALS FOR MACHINERY PARTS"
      ],
      "remarks": "Air P&L Format-1"
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
        "text": "AIR SHIPMENT PROFIT AND LOSS — FORMAT 1",
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
    "code": "JOB_HOUSE_RECORD_LIST_REPORT_FORMAT",
    "formatNumber": 51,
    "name": "Job House Record List Report Format",
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
          "k": "Service Type",
          "v": "FCL / LCL"
        },
        {
          "k": "No. of Packages",
          "v": "125"
        },
        {
          "k": "Gross Weight",
          "v": "18,000.000 KGS"
        },
        {
          "k": "Measurement",
          "v": "24.000 CBM"
        },
        {
          "k": "Layout",
          "v": "Job House Record List Report Format"
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
        "Sample Other Reports layout — Fresa Gold report format preview.",
        "STC: VALVE MATERIALS FOR MACHINERY PARTS"
      ],
      "remarks": "Job House List"
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
        "text": "JOB HOUSE RECORD LIST",
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
    "code": "MAWB_DRAFT_REPORT_FORMAT",
    "formatNumber": 52,
    "name": "MAWB Draft Report Format",
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
          "k": "Service Type",
          "v": "FCL / LCL"
        },
        {
          "k": "No. of Packages",
          "v": "125"
        },
        {
          "k": "Gross Weight",
          "v": "18,000.000 KGS"
        },
        {
          "k": "Measurement",
          "v": "24.000 CBM"
        },
        {
          "k": "Layout",
          "v": "MAWB Draft Report Format"
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
        "Sample Other Reports layout — Fresa Gold report format preview.",
        "DRAFT — Not negotiable unless marked original.",
        "STC: VALVE MATERIALS FOR MACHINERY PARTS"
      ],
      "remarks": "MAWB Draft"
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
        "text": "MAWB — DRAFT",
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
    "code": "MAWB_ORIGINAL_PREPRINTED_KC_REPORT_FORMAT",
    "formatNumber": 53,
    "name": "MAWB Original Preprinted KC Report Format",
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
          "k": "Service Type",
          "v": "FCL / LCL"
        },
        {
          "k": "No. of Packages",
          "v": "125"
        },
        {
          "k": "Gross Weight",
          "v": "18,000.000 KGS"
        },
        {
          "k": "Measurement",
          "v": "24.000 CBM"
        },
        {
          "k": "Layout",
          "v": "MAWB Original Preprinted KC Report Format"
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
        "Sample Other Reports layout — Fresa Gold report format preview.",
        "ORIGINAL — Negotiable when duly endorsed.",
        "STC: VALVE MATERIALS FOR MACHINERY PARTS"
      ],
      "remarks": "MAWB Original KC"
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
        "text": "MAWB — ORIGINAL PREPRINTED KC",
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
    "code": "PRE_ALERT_AIR_REPORT_FORMAT",
    "formatNumber": 54,
    "name": "Pre Alert Air Report Format",
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
      "letterBody": "Air pre-alert for the shipment referenced below.",
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
          "k": "Service Type",
          "v": "FCL / LCL"
        },
        {
          "k": "No. of Packages",
          "v": "125"
        },
        {
          "k": "Gross Weight",
          "v": "18,000.000 KGS"
        },
        {
          "k": "Measurement",
          "v": "24.000 CBM"
        },
        {
          "k": "Layout",
          "v": "Pre Alert Air Report Format"
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
        "Sample Other Reports layout — Fresa Gold report format preview.",
        "STC: VALVE MATERIALS FOR MACHINERY PARTS"
      ],
      "remarks": "Pre Alert Air"
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
        "text": "PRE ALERT — AIR",
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
    "code": "CASH_COLLECTION_REPORT_LIST_REPORT_FORMAT",
    "formatNumber": 55,
    "name": "Cash Collection Report List Report Format",
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
          "k": "Service Type",
          "v": "FCL / LCL"
        },
        {
          "k": "No. of Packages",
          "v": "125"
        },
        {
          "k": "Gross Weight",
          "v": "18,000.000 KGS"
        },
        {
          "k": "Measurement",
          "v": "24.000 CBM"
        },
        {
          "k": "Layout",
          "v": "Cash Collection Report List Report Format"
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
        "Sample Other Reports layout — Fresa Gold report format preview.",
        "STC: VALVE MATERIALS FOR MACHINERY PARTS"
      ],
      "remarks": "Cash Collection"
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
        "text": "CASH COLLECTION REPORT LIST",
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
    "code": "CLOSED_JOB_LIST_REPORT_FORMAT",
    "formatNumber": 56,
    "name": "Closed Job List Report Format",
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
          "k": "Service Type",
          "v": "FCL / LCL"
        },
        {
          "k": "No. of Packages",
          "v": "125"
        },
        {
          "k": "Gross Weight",
          "v": "18,000.000 KGS"
        },
        {
          "k": "Measurement",
          "v": "24.000 CBM"
        },
        {
          "k": "Layout",
          "v": "Closed Job List Report Format"
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
        "Sample Other Reports layout — Fresa Gold report format preview.",
        "STC: VALVE MATERIALS FOR MACHINERY PARTS"
      ],
      "remarks": "Closed Jobs"
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
        "text": "CLOSED JOB LIST",
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
    "code": "JOB_LIST_SUMMARY_REPORT_FORMAT",
    "formatNumber": 57,
    "name": "Job List Summary Report Format",
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
          "k": "Service Type",
          "v": "FCL / LCL"
        },
        {
          "k": "No. of Packages",
          "v": "125"
        },
        {
          "k": "Gross Weight",
          "v": "18,000.000 KGS"
        },
        {
          "k": "Measurement",
          "v": "24.000 CBM"
        },
        {
          "k": "Layout",
          "v": "Job List Summary Report Format"
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
        "Sample Other Reports layout — Fresa Gold report format preview.",
        "STC: VALVE MATERIALS FOR MACHINERY PARTS"
      ],
      "remarks": "Job List Summary"
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
        "text": "JOB LIST SUMMARY",
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
    "code": "PAYMENT_REQUEST_LIST_REPORT_FORMAT",
    "formatNumber": 58,
    "name": "Payment Request List Report Format",
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
          "k": "Service Type",
          "v": "FCL / LCL"
        },
        {
          "k": "No. of Packages",
          "v": "125"
        },
        {
          "k": "Gross Weight",
          "v": "18,000.000 KGS"
        },
        {
          "k": "Measurement",
          "v": "24.000 CBM"
        },
        {
          "k": "Layout",
          "v": "Payment Request List Report Format"
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
        "Sample Other Reports layout — Fresa Gold report format preview.",
        "STC: VALVE MATERIALS FOR MACHINERY PARTS"
      ],
      "remarks": "Payment Request"
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
        "text": "PAYMENT REQUEST LIST",
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
    "code": "JOB_HOUSE_RECORD_LIST_REPORT_FORMAT_1",
    "formatNumber": 59,
    "name": "Job House Record List Report Format-1",
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
          "k": "Service Type",
          "v": "FCL / LCL"
        },
        {
          "k": "No. of Packages",
          "v": "125"
        },
        {
          "k": "Gross Weight",
          "v": "18,000.000 KGS"
        },
        {
          "k": "Measurement",
          "v": "24.000 CBM"
        },
        {
          "k": "Layout",
          "v": "Job House Record List Report Format-1"
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
        "Sample Other Reports layout — Fresa Gold report format preview.",
        "STC: VALVE MATERIALS FOR MACHINERY PARTS"
      ],
      "remarks": "Job House List-1"
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
        "text": "JOB HOUSE RECORD LIST — FORMAT 1",
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
    "code": "PROFORMA_INVOICE_ALL_CHARGES_REPORT_FORMAT",
    "formatNumber": 60,
    "name": "Proforma Invoice All Charges Report Format",
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
      "letterBody": "Proforma invoice covering all shipment charges.",
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
          "k": "Service Type",
          "v": "FCL / LCL"
        },
        {
          "k": "No. of Packages",
          "v": "125"
        },
        {
          "k": "Gross Weight",
          "v": "18,000.000 KGS"
        },
        {
          "k": "Measurement",
          "v": "24.000 CBM"
        },
        {
          "k": "Layout",
          "v": "Proforma Invoice All Charges Report Format"
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
        "Sample Other Reports layout — Fresa Gold report format preview.",
        "STC: VALVE MATERIALS FOR MACHINERY PARTS"
      ],
      "remarks": "Proforma All Charges"
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
        "text": "PROFORMA INVOICE — ALL CHARGES",
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
    "code": "BOOKING_CONFIRMATION_REPORT_FORMAT_3",
    "formatNumber": 3,
    "name": "Booking Confirmation Report Format-3",
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
      "letterBody": "Please find the details for your reference as below.",
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
          "v": "Booking Confirmation Report Format-3"
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
        "text": "BOOKING CONFIRMATION",
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
    "code": "BOOKING_CONFIRMATION_REPORT_FORMAT_4",
    "formatNumber": 4,
    "name": "Booking Confirmation Report Format-4",
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
      "letterBody": "Please find the details for your reference as below.",
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
          "v": "Booking Confirmation Report Format-4"
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
        "text": "BOOKING CONFIRMATION",
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
    "code": "BOOKING_CONFIRMATION_REPORT_FORMAT_5",
    "formatNumber": 5,
    "name": "Booking Confirmation Report Format-5",
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
      "letterBody": "Please find the details for your reference as below.",
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
          "v": "Booking Confirmation Report Format-5"
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
        "text": "BOOKING CONFIRMATION",
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
    "code": "BOOKING_CONFIRMATION_REPORT_FORMAT_6",
    "formatNumber": 6,
    "name": "Booking Confirmation Report Format-6",
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
      "letterBody": "Please find the details for your reference as below.",
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
          "v": "Booking Confirmation Report Format-6"
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
        "text": "BOOKING CONFIRMATION",
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
    "code": "BOOKING_CONFIRMATION_REPORT_FORMAT_7",
    "formatNumber": 7,
    "name": "Booking Confirmation Report Format-7",
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
      "letterBody": "Please find the details for your reference as below.",
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
          "v": "Booking Confirmation Report Format-7"
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
        "text": "BOOKING CONFIRMATION",
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
    "code": "BOOKING_CONFIRMATION_REPORT_FORMAT_8",
    "formatNumber": 8,
    "name": "Booking Confirmation Report Format-8",
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
      "letterBody": "Please find the details for your reference as below.",
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
          "v": "Booking Confirmation Report Format-8"
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
        "text": "BOOKING CONFIRMATION",
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
    "code": "BOOKING_CONFIRMATION_REPORT_FORMAT_9",
    "formatNumber": 9,
    "name": "Booking Confirmation Report Format-9",
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
      "letterBody": "Please find the details for your reference as below.",
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
          "v": "Booking Confirmation Report Format-9"
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
        "text": "BOOKING CONFIRMATION",
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
    "code": "BOOKING_CONFIRMATION_REPORT_FORMAT_10",
    "formatNumber": 10,
    "name": "Booking Confirmation Report Format-10",
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
      "letterBody": "Please find the details for your reference as below.",
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
          "v": "Booking Confirmation Report Format-10"
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
        "text": "BOOKING CONFIRMATION",
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
    "code": "PRE_ALERT_REPORT_FORMAT_1",
    "formatNumber": 1,
    "name": "Pre Alert Report Format-1",
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
      "letterBody": "Please find the details for your reference as below.",
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
          "v": "Pre Alert Report Format-1"
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
        "type": "formatBadge"
      },
      {
        "type": "docTitle",
        "text": "PRE ALERT",
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
    "code": "PRE_ALERT_REPORT_FORMAT_2",
    "formatNumber": 2,
    "name": "Pre Alert Report Format-2",
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
      "letterBody": "Please find the details for your reference as below.",
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
          "v": "Pre Alert Report Format-2"
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
        "text": "PRE ALERT",
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
    "code": "PRE_ALERT_REPORT_FORMAT_3",
    "formatNumber": 3,
    "name": "Pre Alert Report Format-3",
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
      "letterBody": "Please find the details for your reference as below.",
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
          "v": "Pre Alert Report Format-3"
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
        "text": "PRE ALERT",
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
    "code": "PRE_ALERT_REPORT_FORMAT_4",
    "formatNumber": 4,
    "name": "Pre Alert Report Format-4",
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
      "letterBody": "Please find the details for your reference as below.",
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
          "v": "Pre Alert Report Format-4"
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
        "text": "PRE ALERT",
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
    "code": "PRE_ALERT_REPORT_FORMAT_5",
    "formatNumber": 5,
    "name": "Pre Alert Report Format-5",
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
      "letterBody": "Please find the details for your reference as below.",
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
          "v": "Pre Alert Report Format-5"
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
        "text": "PRE ALERT",
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
    "code": "PRE_ALERT_REPORT_FORMAT_6",
    "formatNumber": 6,
    "name": "Pre Alert Report Format-6",
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
      "letterBody": "Please find the details for your reference as below.",
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
          "v": "Pre Alert Report Format-6"
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
        "text": "PRE ALERT",
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
    "code": "PRE_ALERT_REPORT_FORMAT_7",
    "formatNumber": 7,
    "name": "Pre Alert Report Format-7",
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
      "letterBody": "Please find the details for your reference as below.",
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
          "v": "Pre Alert Report Format-7"
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
        "text": "PRE ALERT",
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
    "code": "PRE_ALERT_REPORT_FORMAT_8",
    "formatNumber": 8,
    "name": "Pre Alert Report Format-8",
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
      "letterBody": "Please find the details for your reference as below.",
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
          "v": "Pre Alert Report Format-8"
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
        "text": "PRE ALERT",
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
    "code": "PRE_ALERT_REPORT_FORMAT_9",
    "formatNumber": 9,
    "name": "Pre Alert Report Format-9",
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
      "letterBody": "Please find the details for your reference as below.",
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
          "v": "Pre Alert Report Format-9"
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
        "text": "PRE ALERT",
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
    "code": "PRE_ALERT_REPORT_FORMAT_10",
    "formatNumber": 10,
    "name": "Pre Alert Report Format-10",
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
      "letterBody": "Please find the details for your reference as below.",
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
          "v": "Pre Alert Report Format-10"
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
        "text": "PRE ALERT",
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
    "code": "PRE_ALERT_REPORT_FORMAT_11",
    "formatNumber": 11,
    "name": "Pre Alert Report Format-11",
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
      "letterBody": "Please find the details for your reference as below.",
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
          "v": "Pre Alert Report Format-11"
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
        "text": "PRE ALERT",
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
    "code": "PRE_ALERT_REPORT_FORMAT_12",
    "formatNumber": 12,
    "name": "Pre Alert Report Format-12",
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
      "letterBody": "Please find the details for your reference as below.",
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
          "v": "Pre Alert Report Format-12"
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
        "text": "PRE ALERT",
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
