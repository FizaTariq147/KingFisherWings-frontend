import type { InvoiceFormatUiLayout } from '../types/invoiceFormatUiLayout.types';

/** Auto-generated HBL formats — permanent JSON store. */
export const HBL_FORMAT_UI_LAYOUTS: InvoiceFormatUiLayout[] = [
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_JASPER",
    "formatNumber": 0,
    "name": "HBL Draft Report Format Jasper",
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
      "company": "KingFisher Wings",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "inquiry@kingfishertec.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "PLMAAJEA00081",
      "invoiceDate": "28-JAN-19",
      "formatBadgeLabel": "Jasper Draft",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Booking Ref.",
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
          "k": "Service Type",
          "v": "FCL"
        },
        {
          "k": "Freight",
          "v": "PREPAID"
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
          "v": "HBL Draft Report Format Jasper"
        }
      ],
      "hblCargoHeaders": [
        "Container No. / Seal No. / Mark & No.",
        "No. of Pkgs",
        "Description of Goods",
        "Gross Weight",
        "Measurement"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 / 20' DC X 1\nNIL MARKS",
          "125 PACKAGES",
          "FCL STC: VALVE MATERIALS FOR MACHINERY PARTS",
          "18,000.000 KGS",
          "24.000 CBM"
        ]
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
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "termsLines": [
        "DRAFT — Not negotiable unless marked original.",
        "STC: VALVE MATERIALS FOR MACHINERY PARTS"
      ],
      "remarks": "Jasper Draft"
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "formatBadge",
        "label": "Jasper Draft"
      },
      {
        "type": "docTitle",
        "text": "HOUSE BILL OF LADING — DRAFT (JASPER)",
        "align": "center",
        "band": true
      },
      {
        "type": "partyNotifyGrid"
      },
      {
        "type": "fieldGrid",
        "cols": 2
      },
      {
        "type": "hblCargoTable"
      },
      {
        "type": "hblFreightSignature"
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
    "code": "FG_HBL_HKG",
    "formatNumber": 1,
    "name": "FG HBL HKG",
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
      "company": "KingFisher Wings",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "inquiry@kingfishertec.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "PLMAAJEA00081",
      "invoiceDate": "28-JAN-19",
      "formatBadgeLabel": "DRAFT",
      "heroTitle": "BILL OF LADING",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
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
          "POST BOX : 12356",
          "30 AL MAKTHOOM BUILDING",
          "AL NABHA SHARJAH UAE"
        ]
      },
      "fieldGrid": [
        {
          "k": "Bill of Lading No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "Job No.",
          "v": "CEXP190150"
        },
        {
          "k": "Place of Receipt",
          "v": "CHENNAI (EX MADRAS), INDIA"
        },
        {
          "k": "Port of Loading",
          "v": "CHENNAI (EX MADRAS), INDIA"
        },
        {
          "k": "Vessel / Voyage No.",
          "v": "CMA CGM / 9887"
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
          "k": "No. of Bills of Lading",
          "v": "1(ONE)"
        },
        {
          "k": "Freight",
          "v": "PREPAID"
        },
        {
          "k": "Payable At",
          "v": "CHENNAI AS ARRANGED"
        },
        {
          "k": "Onboard Date",
          "v": "16-JAN-19"
        },
        {
          "k": "Place and Date of Issue",
          "v": "CHENNAI 28-JAN-19"
        }
      ],
      "hblCargoHeaders": [
        "Container No. / Seal No. / Mark & No.",
        "No. of Pkgs or Shipping Units",
        "Description of Goods & Pkgs.",
        "Gross Weight",
        "Measurement"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 / 20' DC X 1\nNIL MARKS",
          "125 PACKAGES",
          "FCL STC: VALVE MATERIALS FOR MACHINERY PARTS\nFREIGHT PREPAID\nALL DESTINATION CHARGES ARE CONSIGNEE'S ACCOUNT",
          "18,000.000 KGS",
          "24.000 CBM"
        ]
      ],
      "containerNote": "Total Number of Containers or Packages (In words): ONE(1X20' DC) CONTAINER ONLY",
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "termsLines": [
        "DRAFT — BILL OF LADING NOT NEGOTIABLE UNLESS CONSIGNED \"TO ORDER\"",
        "RECEIVED by the Carrier the Goods as specified above in apparent good order and condition unless otherwise stated.",
        "AS AGENT FOR THE CARRIER"
      ],
      "remarks": "DRAFT"
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "formatBadge",
        "label": "DRAFT"
      },
      {
        "type": "docTitle",
        "text": "BILL OF LADING NOT NEGOTIABLE UNLESS CONSIGNED \"TO ORDER\"",
        "align": "center",
        "band": true
      },
      {
        "type": "partyNotifyGrid"
      },
      {
        "type": "fieldGrid",
        "cols": 2
      },
      {
        "type": "hblCargoTable"
      },
      {
        "type": "hblFreightSignature"
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
    "code": "FG_HBL_FORMAT_1",
    "formatNumber": 2,
    "name": "FG HBL Format-1",
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
      "company": "KingFisher Wings",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "inquiry@kingfishertec.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "PLMAAJEA00081",
      "invoiceDate": "28-JAN-19",
      "formatBadgeLabel": "FG Format-1",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Booking Ref.",
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
          "k": "Service Type",
          "v": "FCL"
        },
        {
          "k": "Freight",
          "v": "PREPAID"
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
          "v": "FG HBL Format-1"
        }
      ],
      "hblCargoHeaders": [
        "Container No. / Seal No. / Mark & No.",
        "No. of Pkgs",
        "Description of Goods",
        "Gross Weight",
        "Measurement"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 / 20' DC X 1\nNIL MARKS",
          "125 PACKAGES",
          "FCL STC: VALVE MATERIALS FOR MACHINERY PARTS",
          "18,000.000 KGS",
          "24.000 CBM"
        ]
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
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "termsLines": [
        "DRAFT — Not negotiable unless marked original.",
        "STC: VALVE MATERIALS FOR MACHINERY PARTS"
      ],
      "remarks": "FG Format-1"
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "formatBadge",
        "label": "FG Format-1"
      },
      {
        "type": "docTitle",
        "text": "FG HBL — FORMAT 1",
        "align": "center",
        "band": true
      },
      {
        "type": "partyNotifyGrid"
      },
      {
        "type": "fieldGrid",
        "cols": 2
      },
      {
        "type": "hblCargoTable"
      },
      {
        "type": "hblFreightSignature"
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
    "code": "FG_HBL_MAGICLOGISYS",
    "formatNumber": 3,
    "name": "FG HBL Magiclogisys",
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
      "company": "KingFisher Wings",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "inquiry@kingfishertec.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "PLMAAJEA00081",
      "invoiceDate": "28-JAN-19",
      "formatBadgeLabel": "Magiclogisys",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Booking Ref.",
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
          "k": "Service Type",
          "v": "FCL"
        },
        {
          "k": "Freight",
          "v": "PREPAID"
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
          "k": "Template",
          "v": "Magiclogisys"
        }
      ],
      "hblCargoHeaders": [
        "Container No. / Seal No. / Mark & No.",
        "No. of Pkgs",
        "Description of Goods",
        "Gross Weight",
        "Measurement"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 / 20' DC X 1\nNIL MARKS",
          "125 PACKAGES",
          "FCL STC: VALVE MATERIALS FOR MACHINERY PARTS",
          "18,000.000 KGS",
          "24.000 CBM"
        ]
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
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "termsLines": [
        "DRAFT — Not negotiable unless marked original.",
        "STC: VALVE MATERIALS FOR MACHINERY PARTS"
      ],
      "remarks": "Magiclogisys"
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "formatBadge",
        "label": "Magiclogisys"
      },
      {
        "type": "docTitle",
        "text": "FG HBL — MAGICLOGISYS",
        "align": "center",
        "band": true
      },
      {
        "type": "partyNotifyGrid"
      },
      {
        "type": "fieldGrid",
        "cols": 2
      },
      {
        "type": "hblCargoTable"
      },
      {
        "type": "hblFreightSignature"
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
    "code": "HBL_DRAFT_REPORT_FORMAT_2",
    "formatNumber": 4,
    "name": "HBL Draft Report Format-2",
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
      "company": "KingFisher Wings",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "inquiry@kingfishertec.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "PLMAAJEA00081",
      "invoiceDate": "28-JAN-19",
      "formatBadgeLabel": "Format-2",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Booking Ref.",
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
          "k": "Service Type",
          "v": "FCL"
        },
        {
          "k": "Freight",
          "v": "PREPAID"
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
          "v": "HBL Draft Report Format-2"
        }
      ],
      "hblCargoHeaders": [
        "Container No. / Seal No. / Mark & No.",
        "No. of Pkgs",
        "Description of Goods",
        "Gross Weight",
        "Measurement"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 / 20' DC X 1\nNIL MARKS",
          "125 PACKAGES",
          "FCL STC: VALVE MATERIALS FOR MACHINERY PARTS",
          "18,000.000 KGS",
          "24.000 CBM"
        ]
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
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "termsLines": [
        "DRAFT — Not negotiable unless marked original.",
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
        "type": "formatBadge",
        "label": "Format-2"
      },
      {
        "type": "docTitle",
        "text": "HOUSE BILL OF LADING — DRAFT FORMAT 2",
        "align": "end",
        "band": true
      },
      {
        "type": "partyNotifyGrid"
      },
      {
        "type": "fieldGrid",
        "cols": 2
      },
      {
        "type": "hblCargoTable"
      },
      {
        "type": "hblFreightSignature"
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
    "code": "HBL_DRAFT_REPORT_FORMAT_4",
    "formatNumber": 5,
    "name": "HBL Draft Report Format-4",
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
      "company": "KingFisher Wings",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "inquiry@kingfishertec.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "PLMAAJEA00081",
      "invoiceDate": "28-JAN-19",
      "formatBadgeLabel": "Format-4",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Booking Ref.",
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
          "k": "Service Type",
          "v": "FCL"
        },
        {
          "k": "Freight",
          "v": "PREPAID"
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
          "v": "HBL Draft Report Format-4"
        }
      ],
      "hblCargoHeaders": [
        "Container No. / Seal No. / Mark & No.",
        "No. of Pkgs",
        "Description of Goods",
        "Gross Weight",
        "Measurement"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 / 20' DC X 1\nNIL MARKS",
          "125 PACKAGES",
          "FCL STC: VALVE MATERIALS FOR MACHINERY PARTS",
          "18,000.000 KGS",
          "24.000 CBM"
        ]
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
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "termsLines": [
        "DRAFT — Not negotiable unless marked original.",
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
        "type": "formatBadge",
        "label": "Format-4"
      },
      {
        "type": "docTitle",
        "text": "HOUSE BILL OF LADING — DRAFT FORMAT 4",
        "align": "start",
        "band": true
      },
      {
        "type": "partyNotifyGrid"
      },
      {
        "type": "fieldGrid",
        "cols": 2
      },
      {
        "type": "hblCargoTable"
      },
      {
        "type": "hblFreightSignature"
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
    "code": "HBL_DRAFT_REPORT_FORMAT_5",
    "formatNumber": 6,
    "name": "HBL Draft Report Format-5",
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
      "company": "KingFisher Wings",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "inquiry@kingfishertec.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "PLMAAJEA00081",
      "invoiceDate": "28-JAN-19",
      "formatBadgeLabel": "Format-5",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Booking Ref.",
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
          "k": "Service Type",
          "v": "FCL"
        },
        {
          "k": "Freight",
          "v": "PREPAID"
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
          "v": "HBL Draft Report Format-5"
        }
      ],
      "hblCargoHeaders": [
        "Container No. / Seal No. / Mark & No.",
        "No. of Pkgs",
        "Description of Goods",
        "Gross Weight",
        "Measurement"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 / 20' DC X 1\nNIL MARKS",
          "125 PACKAGES",
          "FCL STC: VALVE MATERIALS FOR MACHINERY PARTS",
          "18,000.000 KGS",
          "24.000 CBM"
        ]
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
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "termsLines": [
        "DRAFT — Not negotiable unless marked original.",
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
        "type": "formatBadge",
        "label": "Format-5"
      },
      {
        "type": "docTitle",
        "text": "HOUSE BILL OF LADING — DRAFT FORMAT 5",
        "align": "end",
        "band": false
      },
      {
        "type": "partyNotifyGrid"
      },
      {
        "type": "fieldGrid",
        "cols": 3
      },
      {
        "type": "hblCargoTable"
      },
      {
        "type": "hblFreightSignature"
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
    "code": "HBL_DRAFT_REPORT_FORMAT_6",
    "formatNumber": 7,
    "name": "HBL Draft Report Format-6",
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
      "company": "KingFisher Wings",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "inquiry@kingfishertec.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "PLMAAJEA00081",
      "invoiceDate": "28-JAN-19",
      "formatBadgeLabel": "Format-6",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Booking Ref.",
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
          "k": "Service Type",
          "v": "FCL"
        },
        {
          "k": "Freight",
          "v": "PREPAID"
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
          "v": "HBL Draft Report Format-6"
        }
      ],
      "hblCargoHeaders": [
        "Container No. / Seal No. / Mark & No.",
        "No. of Pkgs",
        "Description of Goods",
        "Gross Weight",
        "Measurement"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 / 20' DC X 1\nNIL MARKS",
          "125 PACKAGES",
          "FCL STC: VALVE MATERIALS FOR MACHINERY PARTS",
          "18,000.000 KGS",
          "24.000 CBM"
        ]
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
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "termsLines": [
        "DRAFT — Not negotiable unless marked original.",
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
        "type": "formatBadge",
        "label": "Format-6"
      },
      {
        "type": "docTitle",
        "text": "HOUSE BILL OF LADING — DRAFT FORMAT 6",
        "align": "center",
        "band": true
      },
      {
        "type": "partyNotifyGrid"
      },
      {
        "type": "fieldGrid",
        "cols": 2
      },
      {
        "type": "hblCargoTable"
      },
      {
        "type": "hblFreightSignature"
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
    "code": "HBL_DRAFT_REPORT_FORMAT_7",
    "formatNumber": 8,
    "name": "HBL Draft Report Format-7",
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
      "company": "KingFisher Wings",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "inquiry@kingfishertec.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "PLMAAJEA00081",
      "invoiceDate": "28-JAN-19",
      "formatBadgeLabel": "Format-7",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Booking Ref.",
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
          "k": "Service Type",
          "v": "FCL"
        },
        {
          "k": "Freight",
          "v": "PREPAID"
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
          "v": "HBL Draft Report Format-7"
        }
      ],
      "hblCargoHeaders": [
        "Container No. / Seal No. / Mark & No.",
        "No. of Pkgs",
        "Description of Goods",
        "Gross Weight",
        "Measurement"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 / 20' DC X 1\nNIL MARKS",
          "125 PACKAGES",
          "FCL STC: VALVE MATERIALS FOR MACHINERY PARTS",
          "18,000.000 KGS",
          "24.000 CBM"
        ]
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
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "termsLines": [
        "DRAFT — Not negotiable unless marked original.",
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
        "type": "formatBadge",
        "label": "Format-7"
      },
      {
        "type": "docTitle",
        "text": "HOUSE BILL OF LADING — DRAFT FORMAT 7",
        "align": "start",
        "band": false
      },
      {
        "type": "partyNotifyGrid"
      },
      {
        "type": "fieldGrid",
        "cols": 3
      },
      {
        "type": "hblCargoTable"
      },
      {
        "type": "hblFreightSignature"
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
    "code": "HBL_DRAFT_REPORT_FORMAT_8",
    "formatNumber": 9,
    "name": "HBL Draft Report Format-8",
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
      "company": "KingFisher Wings",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "inquiry@kingfishertec.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "PLMAAJEA00081",
      "invoiceDate": "28-JAN-19",
      "formatBadgeLabel": "Format-8",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Booking Ref.",
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
          "k": "Service Type",
          "v": "FCL"
        },
        {
          "k": "Freight",
          "v": "PREPAID"
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
          "v": "HBL Draft Report Format-8"
        }
      ],
      "hblCargoHeaders": [
        "Container No. / Seal No. / Mark & No.",
        "No. of Pkgs",
        "Description of Goods",
        "Gross Weight",
        "Measurement"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 / 20' DC X 1\nNIL MARKS",
          "125 PACKAGES",
          "FCL STC: VALVE MATERIALS FOR MACHINERY PARTS",
          "18,000.000 KGS",
          "24.000 CBM"
        ]
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
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "termsLines": [
        "DRAFT — Not negotiable unless marked original.",
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
        "type": "formatBadge",
        "label": "Format-8"
      },
      {
        "type": "docTitle",
        "text": "HOUSE BILL OF LADING — DRAFT FORMAT 8",
        "align": "end",
        "band": true
      },
      {
        "type": "partyNotifyGrid"
      },
      {
        "type": "fieldGrid",
        "cols": 2
      },
      {
        "type": "hblCargoTable"
      },
      {
        "type": "hblFreightSignature"
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
    "code": "HBL_DRAFT_REPORT_FORMAT_9",
    "formatNumber": 10,
    "name": "HBL Draft Report Format-9",
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
      "company": "KingFisher Wings",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "inquiry@kingfishertec.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "PLMAAJEA00081",
      "invoiceDate": "28-JAN-19",
      "formatBadgeLabel": "Format-9",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Booking Ref.",
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
          "k": "Service Type",
          "v": "FCL"
        },
        {
          "k": "Freight",
          "v": "PREPAID"
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
          "v": "HBL Draft Report Format-9"
        }
      ],
      "hblCargoHeaders": [
        "Container No. / Seal No. / Mark & No.",
        "No. of Pkgs",
        "Description of Goods",
        "Gross Weight",
        "Measurement"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 / 20' DC X 1\nNIL MARKS",
          "125 PACKAGES",
          "FCL STC: VALVE MATERIALS FOR MACHINERY PARTS",
          "18,000.000 KGS",
          "24.000 CBM"
        ]
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
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "termsLines": [
        "DRAFT — Not negotiable unless marked original.",
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
        "type": "formatBadge",
        "label": "Format-9"
      },
      {
        "type": "docTitle",
        "text": "HOUSE BILL OF LADING — DRAFT FORMAT 9",
        "align": "center",
        "band": false
      },
      {
        "type": "partyNotifyGrid"
      },
      {
        "type": "fieldGrid",
        "cols": 3
      },
      {
        "type": "hblCargoTable"
      },
      {
        "type": "hblFreightSignature"
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
    "code": "HBL_DRAFT_REPORT_FORMAT_10",
    "formatNumber": 11,
    "name": "HBL Draft Report Format-10",
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
      "company": "KingFisher Wings",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "inquiry@kingfishertec.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "PLMAAJEA00081",
      "invoiceDate": "28-JAN-19",
      "formatBadgeLabel": "Format-10",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Booking Ref.",
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
          "k": "Service Type",
          "v": "FCL"
        },
        {
          "k": "Freight",
          "v": "PREPAID"
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
          "v": "HBL Draft Report Format-10"
        }
      ],
      "hblCargoHeaders": [
        "Container No. / Seal No. / Mark & No.",
        "No. of Pkgs",
        "Description of Goods",
        "Gross Weight",
        "Measurement"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 / 20' DC X 1\nNIL MARKS",
          "125 PACKAGES",
          "FCL STC: VALVE MATERIALS FOR MACHINERY PARTS",
          "18,000.000 KGS",
          "24.000 CBM"
        ]
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
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "termsLines": [
        "DRAFT — Not negotiable unless marked original.",
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
        "type": "formatBadge",
        "label": "Format-10"
      },
      {
        "type": "docTitle",
        "text": "HOUSE BILL OF LADING — DRAFT FORMAT 10",
        "align": "start",
        "band": true
      },
      {
        "type": "partyNotifyGrid"
      },
      {
        "type": "fieldGrid",
        "cols": 2
      },
      {
        "type": "hblCargoTable"
      },
      {
        "type": "hblFreightSignature"
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
    "code": "HBL_DRAFT_REPORT_FORMAT_11",
    "formatNumber": 12,
    "name": "HBL Draft Report Format-11",
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
      "company": "KingFisher Wings",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "inquiry@kingfishertec.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "PLMAAJEA00081",
      "invoiceDate": "28-JAN-19",
      "formatBadgeLabel": "Format-11",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Booking Ref.",
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
          "k": "Service Type",
          "v": "FCL"
        },
        {
          "k": "Freight",
          "v": "PREPAID"
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
          "v": "HBL Draft Report Format-11"
        }
      ],
      "hblCargoHeaders": [
        "Container No. / Seal No. / Mark & No.",
        "No. of Pkgs",
        "Description of Goods",
        "Gross Weight",
        "Measurement"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 / 20' DC X 1\nNIL MARKS",
          "125 PACKAGES",
          "FCL STC: VALVE MATERIALS FOR MACHINERY PARTS",
          "18,000.000 KGS",
          "24.000 CBM"
        ]
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
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "termsLines": [
        "DRAFT — Not negotiable unless marked original.",
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
        "type": "formatBadge",
        "label": "Format-11"
      },
      {
        "type": "docTitle",
        "text": "HOUSE BILL OF LADING — DRAFT FORMAT 11",
        "align": "end",
        "band": false
      },
      {
        "type": "partyNotifyGrid"
      },
      {
        "type": "fieldGrid",
        "cols": 3
      },
      {
        "type": "hblCargoTable"
      },
      {
        "type": "hblFreightSignature"
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
    "code": "HBL_DRAFT_REPORT_FORMAT_12",
    "formatNumber": 13,
    "name": "HBL Draft Report Format-12",
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
      "company": "KingFisher Wings",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "inquiry@kingfishertec.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "PLMAAJEA00081",
      "invoiceDate": "28-JAN-19",
      "formatBadgeLabel": "Format-12",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Booking Ref.",
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
          "k": "Service Type",
          "v": "FCL"
        },
        {
          "k": "Freight",
          "v": "PREPAID"
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
          "v": "HBL Draft Report Format-12"
        }
      ],
      "hblCargoHeaders": [
        "Container No. / Seal No. / Mark & No.",
        "No. of Pkgs",
        "Description of Goods",
        "Gross Weight",
        "Measurement"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 / 20' DC X 1\nNIL MARKS",
          "125 PACKAGES",
          "FCL STC: VALVE MATERIALS FOR MACHINERY PARTS",
          "18,000.000 KGS",
          "24.000 CBM"
        ]
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
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "termsLines": [
        "DRAFT — Not negotiable unless marked original.",
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
        "type": "formatBadge",
        "label": "Format-12"
      },
      {
        "type": "docTitle",
        "text": "HOUSE BILL OF LADING — DRAFT FORMAT 12",
        "align": "center",
        "band": true
      },
      {
        "type": "partyNotifyGrid"
      },
      {
        "type": "fieldGrid",
        "cols": 2
      },
      {
        "type": "hblCargoTable"
      },
      {
        "type": "hblFreightSignature"
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
    "code": "HBL_DRAFT_REPORT_FORMAT_13",
    "formatNumber": 14,
    "name": "HBL Draft Report Format-13",
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
      "company": "KingFisher Wings",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "inquiry@kingfishertec.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "PLMAAJEA00081",
      "invoiceDate": "28-JAN-19",
      "formatBadgeLabel": "Format-13",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Booking Ref.",
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
          "k": "Service Type",
          "v": "FCL"
        },
        {
          "k": "Freight",
          "v": "PREPAID"
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
          "v": "HBL Draft Report Format-13"
        }
      ],
      "hblCargoHeaders": [
        "Container No. / Seal No. / Mark & No.",
        "No. of Pkgs",
        "Description of Goods",
        "Gross Weight",
        "Measurement"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 / 20' DC X 1\nNIL MARKS",
          "125 PACKAGES",
          "FCL STC: VALVE MATERIALS FOR MACHINERY PARTS",
          "18,000.000 KGS",
          "24.000 CBM"
        ]
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
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "termsLines": [
        "DRAFT — Not negotiable unless marked original.",
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
        "type": "formatBadge",
        "label": "Format-13"
      },
      {
        "type": "docTitle",
        "text": "HOUSE BILL OF LADING — DRAFT FORMAT 13",
        "align": "start",
        "band": false
      },
      {
        "type": "partyNotifyGrid"
      },
      {
        "type": "fieldGrid",
        "cols": 3
      },
      {
        "type": "hblCargoTable"
      },
      {
        "type": "hblFreightSignature"
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
    "code": "HBL_DRAFT_REPORT_FORMAT_14",
    "formatNumber": 15,
    "name": "HBL Draft Report Format-14",
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
      "company": "KingFisher Wings",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "inquiry@kingfishertec.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "PLMAAJEA00081",
      "invoiceDate": "28-JAN-19",
      "formatBadgeLabel": "Format-14",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Booking Ref.",
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
          "k": "Service Type",
          "v": "FCL"
        },
        {
          "k": "Freight",
          "v": "PREPAID"
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
          "v": "HBL Draft Report Format-14"
        }
      ],
      "hblCargoHeaders": [
        "Container No. / Seal No. / Mark & No.",
        "No. of Pkgs",
        "Description of Goods",
        "Gross Weight",
        "Measurement"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 / 20' DC X 1\nNIL MARKS",
          "125 PACKAGES",
          "FCL STC: VALVE MATERIALS FOR MACHINERY PARTS",
          "18,000.000 KGS",
          "24.000 CBM"
        ]
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
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "termsLines": [
        "DRAFT — Not negotiable unless marked original.",
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
        "type": "formatBadge",
        "label": "Format-14"
      },
      {
        "type": "docTitle",
        "text": "HOUSE BILL OF LADING — DRAFT FORMAT 14",
        "align": "end",
        "band": true
      },
      {
        "type": "partyNotifyGrid"
      },
      {
        "type": "fieldGrid",
        "cols": 2
      },
      {
        "type": "hblCargoTable"
      },
      {
        "type": "hblFreightSignature"
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
    "code": "HBL_DRAFT_REPORT_FORMAT_15",
    "formatNumber": 16,
    "name": "HBL Draft Report Format-15",
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
      "company": "KingFisher Wings",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "inquiry@kingfishertec.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "PLMAAJEA00081",
      "invoiceDate": "28-JAN-19",
      "formatBadgeLabel": "Format-15",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Booking Ref.",
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
          "k": "Service Type",
          "v": "FCL"
        },
        {
          "k": "Freight",
          "v": "PREPAID"
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
          "v": "HBL Draft Report Format-15"
        }
      ],
      "hblCargoHeaders": [
        "Container No. / Seal No. / Mark & No.",
        "No. of Pkgs",
        "Description of Goods",
        "Gross Weight",
        "Measurement"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 / 20' DC X 1\nNIL MARKS",
          "125 PACKAGES",
          "FCL STC: VALVE MATERIALS FOR MACHINERY PARTS",
          "18,000.000 KGS",
          "24.000 CBM"
        ]
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
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "termsLines": [
        "DRAFT — Not negotiable unless marked original.",
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
        "type": "formatBadge",
        "label": "Format-15"
      },
      {
        "type": "docTitle",
        "text": "HOUSE BILL OF LADING — DRAFT FORMAT 15",
        "align": "center",
        "band": false
      },
      {
        "type": "partyNotifyGrid"
      },
      {
        "type": "fieldGrid",
        "cols": 3
      },
      {
        "type": "hblCargoTable"
      },
      {
        "type": "hblFreightSignature"
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
    "code": "HBL_DRAFT_REPORT_FORMAT_16",
    "formatNumber": 17,
    "name": "HBL Draft Report Format-16",
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
      "company": "KingFisher Wings",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "inquiry@kingfishertec.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "PLMAAJEA00081",
      "invoiceDate": "28-JAN-19",
      "formatBadgeLabel": "Format-16",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Booking Ref.",
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
          "k": "Service Type",
          "v": "FCL"
        },
        {
          "k": "Freight",
          "v": "PREPAID"
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
          "v": "HBL Draft Report Format-16"
        }
      ],
      "hblCargoHeaders": [
        "Container No. / Seal No. / Mark & No.",
        "No. of Pkgs",
        "Description of Goods",
        "Gross Weight",
        "Measurement"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 / 20' DC X 1\nNIL MARKS",
          "125 PACKAGES",
          "FCL STC: VALVE MATERIALS FOR MACHINERY PARTS",
          "18,000.000 KGS",
          "24.000 CBM"
        ]
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
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "termsLines": [
        "DRAFT — Not negotiable unless marked original.",
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
        "type": "formatBadge",
        "label": "Format-16"
      },
      {
        "type": "docTitle",
        "text": "HOUSE BILL OF LADING — DRAFT FORMAT 16",
        "align": "start",
        "band": true
      },
      {
        "type": "partyNotifyGrid"
      },
      {
        "type": "fieldGrid",
        "cols": 2
      },
      {
        "type": "hblCargoTable"
      },
      {
        "type": "hblFreightSignature"
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
    "code": "HBL_DRAFT_REPORT_FORMAT_17",
    "formatNumber": 18,
    "name": "HBL Draft Report Format-17",
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
      "company": "KingFisher Wings",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "inquiry@kingfishertec.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "PLMAAJEA00081",
      "invoiceDate": "28-JAN-19",
      "formatBadgeLabel": "Format-17",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Booking Ref.",
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
          "k": "Service Type",
          "v": "FCL"
        },
        {
          "k": "Freight",
          "v": "PREPAID"
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
          "v": "HBL Draft Report Format-17"
        }
      ],
      "hblCargoHeaders": [
        "Container No. / Seal No. / Mark & No.",
        "No. of Pkgs",
        "Description of Goods",
        "Gross Weight",
        "Measurement"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 / 20' DC X 1\nNIL MARKS",
          "125 PACKAGES",
          "FCL STC: VALVE MATERIALS FOR MACHINERY PARTS",
          "18,000.000 KGS",
          "24.000 CBM"
        ]
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
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "termsLines": [
        "DRAFT — Not negotiable unless marked original.",
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
        "type": "formatBadge",
        "label": "Format-17"
      },
      {
        "type": "docTitle",
        "text": "HOUSE BILL OF LADING — DRAFT FORMAT 17",
        "align": "end",
        "band": false
      },
      {
        "type": "partyNotifyGrid"
      },
      {
        "type": "fieldGrid",
        "cols": 3
      },
      {
        "type": "hblCargoTable"
      },
      {
        "type": "hblFreightSignature"
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
    "code": "HBL_DRAFT_REPORT_FORMAT_18",
    "formatNumber": 19,
    "name": "HBL Draft Report Format-18",
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
      "company": "KingFisher Wings",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "inquiry@kingfishertec.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "PLMAAJEA00081",
      "invoiceDate": "28-JAN-19",
      "formatBadgeLabel": "Format-18",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Booking Ref.",
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
          "k": "Service Type",
          "v": "FCL"
        },
        {
          "k": "Freight",
          "v": "PREPAID"
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
          "v": "HBL Draft Report Format-18"
        }
      ],
      "hblCargoHeaders": [
        "Container No. / Seal No. / Mark & No.",
        "No. of Pkgs",
        "Description of Goods",
        "Gross Weight",
        "Measurement"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 / 20' DC X 1\nNIL MARKS",
          "125 PACKAGES",
          "FCL STC: VALVE MATERIALS FOR MACHINERY PARTS",
          "18,000.000 KGS",
          "24.000 CBM"
        ]
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
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "termsLines": [
        "DRAFT — Not negotiable unless marked original.",
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
        "type": "formatBadge",
        "label": "Format-18"
      },
      {
        "type": "docTitle",
        "text": "HOUSE BILL OF LADING — DRAFT FORMAT 18",
        "align": "center",
        "band": true
      },
      {
        "type": "partyNotifyGrid"
      },
      {
        "type": "fieldGrid",
        "cols": 2
      },
      {
        "type": "hblCargoTable"
      },
      {
        "type": "hblFreightSignature"
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
    "code": "HBL_DRAFT_REPORT_FORMAT_19",
    "formatNumber": 20,
    "name": "HBL Draft Report Format-19",
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
      "company": "KingFisher Wings",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "inquiry@kingfishertec.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "PLMAAJEA00081",
      "invoiceDate": "28-JAN-19",
      "formatBadgeLabel": "Format-19",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Booking Ref.",
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
          "k": "Service Type",
          "v": "FCL"
        },
        {
          "k": "Freight",
          "v": "PREPAID"
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
          "v": "HBL Draft Report Format-19"
        }
      ],
      "hblCargoHeaders": [
        "Container No. / Seal No. / Mark & No.",
        "No. of Pkgs",
        "Description of Goods",
        "Gross Weight",
        "Measurement"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 / 20' DC X 1\nNIL MARKS",
          "125 PACKAGES",
          "FCL STC: VALVE MATERIALS FOR MACHINERY PARTS",
          "18,000.000 KGS",
          "24.000 CBM"
        ]
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
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "termsLines": [
        "DRAFT — Not negotiable unless marked original.",
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
        "type": "formatBadge",
        "label": "Format-19"
      },
      {
        "type": "docTitle",
        "text": "HOUSE BILL OF LADING — DRAFT FORMAT 19",
        "align": "start",
        "band": false
      },
      {
        "type": "partyNotifyGrid"
      },
      {
        "type": "fieldGrid",
        "cols": 3
      },
      {
        "type": "hblCargoTable"
      },
      {
        "type": "hblFreightSignature"
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
    "code": "HBL_DRAFT_REPORT_FORMAT_20",
    "formatNumber": 21,
    "name": "HBL Draft Report Format-20",
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
      "company": "KingFisher Wings",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "inquiry@kingfishertec.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "PLMAAJEA00081",
      "invoiceDate": "28-JAN-19",
      "formatBadgeLabel": "Format-20",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Booking Ref.",
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
          "k": "Service Type",
          "v": "FCL"
        },
        {
          "k": "Freight",
          "v": "PREPAID"
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
          "v": "HBL Draft Report Format-20"
        }
      ],
      "hblCargoHeaders": [
        "Container No. / Seal No. / Mark & No.",
        "No. of Pkgs",
        "Description of Goods",
        "Gross Weight",
        "Measurement"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 / 20' DC X 1\nNIL MARKS",
          "125 PACKAGES",
          "FCL STC: VALVE MATERIALS FOR MACHINERY PARTS",
          "18,000.000 KGS",
          "24.000 CBM"
        ]
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
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "termsLines": [
        "DRAFT — Not negotiable unless marked original.",
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
        "type": "formatBadge",
        "label": "Format-20"
      },
      {
        "type": "docTitle",
        "text": "HOUSE BILL OF LADING — DRAFT FORMAT 20",
        "align": "end",
        "band": true
      },
      {
        "type": "partyNotifyGrid"
      },
      {
        "type": "fieldGrid",
        "cols": 2
      },
      {
        "type": "hblCargoTable"
      },
      {
        "type": "hblFreightSignature"
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
    "code": "HBL_DRAFT_REPORT_FORMAT_23",
    "formatNumber": 22,
    "name": "HBL Draft Report Format-23",
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
      "company": "KingFisher Wings",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "inquiry@kingfishertec.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "PLMAAJEA00081",
      "invoiceDate": "28-JAN-19",
      "formatBadgeLabel": "Format-23",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Booking Ref.",
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
          "k": "Service Type",
          "v": "FCL"
        },
        {
          "k": "Freight",
          "v": "PREPAID"
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
          "v": "HBL Draft Report Format-23"
        }
      ],
      "hblCargoHeaders": [
        "Container No. / Seal No. / Mark & No.",
        "No. of Pkgs",
        "Description of Goods",
        "Gross Weight",
        "Measurement"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 / 20' DC X 1\nNIL MARKS",
          "125 PACKAGES",
          "FCL STC: VALVE MATERIALS FOR MACHINERY PARTS",
          "18,000.000 KGS",
          "24.000 CBM"
        ]
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
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "termsLines": [
        "DRAFT — Not negotiable unless marked original.",
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
        "type": "formatBadge",
        "label": "Format-23"
      },
      {
        "type": "docTitle",
        "text": "HOUSE BILL OF LADING — DRAFT FORMAT 23",
        "align": "end",
        "band": false
      },
      {
        "type": "partyNotifyGrid"
      },
      {
        "type": "fieldGrid",
        "cols": 3
      },
      {
        "type": "hblCargoTable"
      },
      {
        "type": "hblFreightSignature"
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
    "code": "HBL_DRAFT_REPORT_FORMAT_25",
    "formatNumber": 23,
    "name": "HBL Draft Report Format-25",
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
      "company": "KingFisher Wings",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "inquiry@kingfishertec.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "PLMAAJEA00081",
      "invoiceDate": "28-JAN-19",
      "formatBadgeLabel": "Format-25",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Booking Ref.",
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
          "k": "Service Type",
          "v": "FCL"
        },
        {
          "k": "Freight",
          "v": "PREPAID"
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
          "v": "HBL Draft Report Format-25"
        }
      ],
      "hblCargoHeaders": [
        "Container No. / Seal No. / Mark & No.",
        "No. of Pkgs",
        "Description of Goods",
        "Gross Weight",
        "Measurement"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 / 20' DC X 1\nNIL MARKS",
          "125 PACKAGES",
          "FCL STC: VALVE MATERIALS FOR MACHINERY PARTS",
          "18,000.000 KGS",
          "24.000 CBM"
        ]
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
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "termsLines": [
        "DRAFT — Not negotiable unless marked original.",
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
        "type": "formatBadge",
        "label": "Format-25"
      },
      {
        "type": "docTitle",
        "text": "HOUSE BILL OF LADING — DRAFT FORMAT 25",
        "align": "start",
        "band": false
      },
      {
        "type": "partyNotifyGrid"
      },
      {
        "type": "fieldGrid",
        "cols": 3
      },
      {
        "type": "hblCargoTable"
      },
      {
        "type": "hblFreightSignature"
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
    "code": "HBL_DRAFT_REPORT_FORMAT_26",
    "formatNumber": 24,
    "name": "HBL Draft Report Format-26",
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
      "company": "KingFisher Wings",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "inquiry@kingfishertec.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "PLMAAJEA00081",
      "invoiceDate": "28-JAN-19",
      "formatBadgeLabel": "Format-26",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Booking Ref.",
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
          "k": "Service Type",
          "v": "FCL"
        },
        {
          "k": "Freight",
          "v": "PREPAID"
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
          "v": "HBL Draft Report Format-26"
        }
      ],
      "hblCargoHeaders": [
        "Container No. / Seal No. / Mark & No.",
        "No. of Pkgs",
        "Description of Goods",
        "Gross Weight",
        "Measurement"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 / 20' DC X 1\nNIL MARKS",
          "125 PACKAGES",
          "FCL STC: VALVE MATERIALS FOR MACHINERY PARTS",
          "18,000.000 KGS",
          "24.000 CBM"
        ]
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
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "termsLines": [
        "DRAFT — Not negotiable unless marked original.",
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
        "type": "formatBadge",
        "label": "Format-26"
      },
      {
        "type": "docTitle",
        "text": "HOUSE BILL OF LADING — DRAFT FORMAT 26",
        "align": "end",
        "band": true
      },
      {
        "type": "partyNotifyGrid"
      },
      {
        "type": "fieldGrid",
        "cols": 2
      },
      {
        "type": "hblCargoTable"
      },
      {
        "type": "hblFreightSignature"
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
    "code": "HBL_DRAFT_REPORT_FORMAT_27",
    "formatNumber": 25,
    "name": "HBL Draft Report Format-27",
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
      "company": "KingFisher Wings",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "inquiry@kingfishertec.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "PLMAAJEA00081",
      "invoiceDate": "28-JAN-19",
      "formatBadgeLabel": "Format-27",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Booking Ref.",
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
          "k": "Service Type",
          "v": "FCL"
        },
        {
          "k": "Freight",
          "v": "PREPAID"
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
          "v": "HBL Draft Report Format-27"
        }
      ],
      "hblCargoHeaders": [
        "Container No. / Seal No. / Mark & No.",
        "No. of Pkgs",
        "Description of Goods",
        "Gross Weight",
        "Measurement"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 / 20' DC X 1\nNIL MARKS",
          "125 PACKAGES",
          "FCL STC: VALVE MATERIALS FOR MACHINERY PARTS",
          "18,000.000 KGS",
          "24.000 CBM"
        ]
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
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "termsLines": [
        "DRAFT — Not negotiable unless marked original.",
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
        "type": "formatBadge",
        "label": "Format-27"
      },
      {
        "type": "docTitle",
        "text": "HOUSE BILL OF LADING — DRAFT FORMAT 27",
        "align": "center",
        "band": false
      },
      {
        "type": "partyNotifyGrid"
      },
      {
        "type": "fieldGrid",
        "cols": 3
      },
      {
        "type": "hblCargoTable"
      },
      {
        "type": "hblFreightSignature"
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
    "code": "HBL_DRAFT_REPORT_FORMAT_29",
    "formatNumber": 26,
    "name": "HBL Draft Report Format-29",
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
      "company": "KingFisher Wings",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "inquiry@kingfishertec.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "PLMAAJEA00081",
      "invoiceDate": "28-JAN-19",
      "letterBody": "HTML-rendered draft HBL — sample export from Fresa Gold.",
      "formatBadgeLabel": "HTML Format-29",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Booking Ref.",
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
          "k": "Service Type",
          "v": "FCL"
        },
        {
          "k": "Freight",
          "v": "PREPAID"
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
          "v": "HBL Draft Report Format-29"
        },
        {
          "k": "Renderer",
          "v": "HTML draft layout"
        }
      ],
      "hblCargoHeaders": [
        "Container No. / Seal No. / Mark & No.",
        "No. of Pkgs",
        "Description of Goods",
        "Gross Weight",
        "Measurement"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 / 20' DC X 1\nNIL MARKS",
          "125 PACKAGES",
          "FCL STC: VALVE MATERIALS FOR MACHINERY PARTS",
          "18,000.000 KGS",
          "24.000 CBM"
        ]
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
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "termsLines": [
        "DRAFT — Not negotiable unless marked original.",
        "Generated from HTML draft template.",
        "STC: VALVE MATERIALS FOR MACHINERY PARTS"
      ],
      "remarks": "HTML Format-29"
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "formatBadge",
        "label": "HTML Format-29"
      },
      {
        "type": "docTitle",
        "text": "HOUSE BILL OF LADING — DRAFT FORMAT 29 (HTML)",
        "align": "center",
        "band": true
      },
      {
        "type": "letterBody"
      },
      {
        "type": "partyNotifyGrid"
      },
      {
        "type": "fieldGrid",
        "cols": 2
      },
      {
        "type": "hblCargoTable"
      },
      {
        "type": "hblFreightSignature"
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
    "code": "HBL_DRAFT_REPORT_FORMAT_33",
    "formatNumber": 27,
    "name": "HBL Draft Report Format-33",
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
      "company": "KingFisher Wings",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "inquiry@kingfishertec.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "PLMAAJEA00081",
      "invoiceDate": "28-JAN-19",
      "formatBadgeLabel": "Format-33",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Booking Ref.",
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
          "k": "Service Type",
          "v": "FCL"
        },
        {
          "k": "Freight",
          "v": "PREPAID"
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
          "v": "HBL Draft Report Format-33"
        }
      ],
      "hblCargoHeaders": [
        "Container No. / Seal No. / Mark & No.",
        "No. of Pkgs",
        "Description of Goods",
        "Gross Weight",
        "Measurement"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 / 20' DC X 1\nNIL MARKS",
          "125 PACKAGES",
          "FCL STC: VALVE MATERIALS FOR MACHINERY PARTS",
          "18,000.000 KGS",
          "24.000 CBM"
        ]
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
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "termsLines": [
        "DRAFT — Not negotiable unless marked original.",
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
        "type": "formatBadge",
        "label": "Format-33"
      },
      {
        "type": "docTitle",
        "text": "HOUSE BILL OF LADING — DRAFT FORMAT 33",
        "align": "center",
        "band": false
      },
      {
        "type": "partyNotifyGrid"
      },
      {
        "type": "fieldGrid",
        "cols": 3
      },
      {
        "type": "hblCargoTable"
      },
      {
        "type": "hblFreightSignature"
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
    "code": "HBL_DRAFT_REPORT_FORMAT_40",
    "formatNumber": 28,
    "name": "HBL Draft Report Format-40",
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
      "company": "KingFisher Wings",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "inquiry@kingfishertec.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "PLMAAJEA00081",
      "invoiceDate": "28-JAN-19",
      "formatBadgeLabel": "Format-40",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Booking Ref.",
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
          "k": "Service Type",
          "v": "FCL"
        },
        {
          "k": "Freight",
          "v": "PREPAID"
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
          "v": "HBL Draft Report Format-40"
        }
      ],
      "hblCargoHeaders": [
        "Container No. / Seal No. / Mark & No.",
        "No. of Pkgs",
        "Description of Goods",
        "Gross Weight",
        "Measurement"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 / 20' DC X 1\nNIL MARKS",
          "125 PACKAGES",
          "FCL STC: VALVE MATERIALS FOR MACHINERY PARTS",
          "18,000.000 KGS",
          "24.000 CBM"
        ]
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
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "termsLines": [
        "DRAFT — Not negotiable unless marked original.",
        "STC: VALVE MATERIALS FOR MACHINERY PARTS"
      ],
      "remarks": "Format-40"
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "formatBadge",
        "label": "Format-40"
      },
      {
        "type": "docTitle",
        "text": "HOUSE BILL OF LADING — DRAFT FORMAT 40",
        "align": "start",
        "band": true
      },
      {
        "type": "partyNotifyGrid"
      },
      {
        "type": "fieldGrid",
        "cols": 2
      },
      {
        "type": "hblCargoTable"
      },
      {
        "type": "hblFreightSignature"
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
    "code": "HBL_DRAFT_REPORT_FORMAT_41",
    "formatNumber": 29,
    "name": "HBL Draft Report Format-41",
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
      "company": "KingFisher Wings",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "inquiry@kingfishertec.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "PLMAAJEA00081",
      "invoiceDate": "28-JAN-19",
      "formatBadgeLabel": "Format-41",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Booking Ref.",
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
          "k": "Service Type",
          "v": "FCL"
        },
        {
          "k": "Freight",
          "v": "PREPAID"
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
          "v": "HBL Draft Report Format-41"
        }
      ],
      "hblCargoHeaders": [
        "Container No. / Seal No. / Mark & No.",
        "No. of Pkgs",
        "Description of Goods",
        "Gross Weight",
        "Measurement"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 / 20' DC X 1\nNIL MARKS",
          "125 PACKAGES",
          "FCL STC: VALVE MATERIALS FOR MACHINERY PARTS",
          "18,000.000 KGS",
          "24.000 CBM"
        ]
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
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "termsLines": [
        "DRAFT — Not negotiable unless marked original.",
        "STC: VALVE MATERIALS FOR MACHINERY PARTS"
      ],
      "remarks": "Format-41"
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "formatBadge",
        "label": "Format-41"
      },
      {
        "type": "docTitle",
        "text": "HOUSE BILL OF LADING — DRAFT FORMAT 41",
        "align": "end",
        "band": false
      },
      {
        "type": "partyNotifyGrid"
      },
      {
        "type": "fieldGrid",
        "cols": 3
      },
      {
        "type": "hblCargoTable"
      },
      {
        "type": "hblFreightSignature"
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
    "code": "HBL_DRAFT_REPORT_FORMAT_42",
    "formatNumber": 30,
    "name": "HBL Draft Report Format-42",
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
      "company": "KingFisher Wings",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "inquiry@kingfishertec.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "PLMAAJEA00081",
      "invoiceDate": "28-JAN-19",
      "formatBadgeLabel": "Format-42",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Booking Ref.",
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
          "k": "Service Type",
          "v": "FCL"
        },
        {
          "k": "Freight",
          "v": "PREPAID"
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
          "v": "HBL Draft Report Format-42"
        }
      ],
      "hblCargoHeaders": [
        "Container No. / Seal No. / Mark & No.",
        "No. of Pkgs",
        "Description of Goods",
        "Gross Weight",
        "Measurement"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 / 20' DC X 1\nNIL MARKS",
          "125 PACKAGES",
          "FCL STC: VALVE MATERIALS FOR MACHINERY PARTS",
          "18,000.000 KGS",
          "24.000 CBM"
        ]
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
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "termsLines": [
        "DRAFT — Not negotiable unless marked original.",
        "STC: VALVE MATERIALS FOR MACHINERY PARTS"
      ],
      "remarks": "Format-42"
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "formatBadge",
        "label": "Format-42"
      },
      {
        "type": "docTitle",
        "text": "HOUSE BILL OF LADING — DRAFT FORMAT 42",
        "align": "center",
        "band": true
      },
      {
        "type": "partyNotifyGrid"
      },
      {
        "type": "fieldGrid",
        "cols": 2
      },
      {
        "type": "hblCargoTable"
      },
      {
        "type": "hblFreightSignature"
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
    "code": "HBL_DRAFT_REPORT_FORMAT_43",
    "formatNumber": 31,
    "name": "HBL Draft Report Format-43",
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
      "company": "KingFisher Wings",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "inquiry@kingfishertec.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "PLMAAJEA00081",
      "invoiceDate": "28-JAN-19",
      "formatBadgeLabel": "Format-43",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Booking Ref.",
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
          "k": "Service Type",
          "v": "FCL"
        },
        {
          "k": "Freight",
          "v": "PREPAID"
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
          "v": "HBL Draft Report Format-43"
        }
      ],
      "hblCargoHeaders": [
        "Container No. / Seal No. / Mark & No.",
        "No. of Pkgs",
        "Description of Goods",
        "Gross Weight",
        "Measurement"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 / 20' DC X 1\nNIL MARKS",
          "125 PACKAGES",
          "FCL STC: VALVE MATERIALS FOR MACHINERY PARTS",
          "18,000.000 KGS",
          "24.000 CBM"
        ]
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
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "termsLines": [
        "DRAFT — Not negotiable unless marked original.",
        "STC: VALVE MATERIALS FOR MACHINERY PARTS"
      ],
      "remarks": "Format-43"
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "formatBadge",
        "label": "Format-43"
      },
      {
        "type": "docTitle",
        "text": "HOUSE BILL OF LADING — DRAFT FORMAT 43",
        "align": "start",
        "band": false
      },
      {
        "type": "partyNotifyGrid"
      },
      {
        "type": "fieldGrid",
        "cols": 3
      },
      {
        "type": "hblCargoTable"
      },
      {
        "type": "hblFreightSignature"
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
    "code": "HBL_DRAFT_REPORT_FORMAT_44",
    "formatNumber": 32,
    "name": "HBL Draft Report Format-44",
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
      "company": "KingFisher Wings",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "inquiry@kingfishertec.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "PLMAAJEA00081",
      "invoiceDate": "28-JAN-19",
      "formatBadgeLabel": "Format-44",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Booking Ref.",
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
          "k": "Service Type",
          "v": "FCL"
        },
        {
          "k": "Freight",
          "v": "PREPAID"
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
          "v": "HBL Draft Report Format-44"
        }
      ],
      "hblCargoHeaders": [
        "Container No. / Seal No. / Mark & No.",
        "No. of Pkgs",
        "Description of Goods",
        "Gross Weight",
        "Measurement"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 / 20' DC X 1\nNIL MARKS",
          "125 PACKAGES",
          "FCL STC: VALVE MATERIALS FOR MACHINERY PARTS",
          "18,000.000 KGS",
          "24.000 CBM"
        ]
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
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "termsLines": [
        "DRAFT — Not negotiable unless marked original.",
        "STC: VALVE MATERIALS FOR MACHINERY PARTS"
      ],
      "remarks": "Format-44"
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "formatBadge",
        "label": "Format-44"
      },
      {
        "type": "docTitle",
        "text": "HOUSE BILL OF LADING — DRAFT FORMAT 44",
        "align": "end",
        "band": true
      },
      {
        "type": "partyNotifyGrid"
      },
      {
        "type": "fieldGrid",
        "cols": 2
      },
      {
        "type": "hblCargoTable"
      },
      {
        "type": "hblFreightSignature"
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
    "code": "HBL_DRAFT_REPORT_FORMAT_45",
    "formatNumber": 33,
    "name": "HBL Draft Report Format-45",
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
      "company": "KingFisher Wings",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "inquiry@kingfishertec.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "PLMAAJEA00081",
      "invoiceDate": "28-JAN-19",
      "formatBadgeLabel": "Format-45",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Booking Ref.",
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
          "k": "Service Type",
          "v": "FCL"
        },
        {
          "k": "Freight",
          "v": "PREPAID"
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
          "v": "HBL Draft Report Format-45"
        }
      ],
      "hblCargoHeaders": [
        "Container No. / Seal No. / Mark & No.",
        "No. of Pkgs",
        "Description of Goods",
        "Gross Weight",
        "Measurement"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 / 20' DC X 1\nNIL MARKS",
          "125 PACKAGES",
          "FCL STC: VALVE MATERIALS FOR MACHINERY PARTS",
          "18,000.000 KGS",
          "24.000 CBM"
        ]
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
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "termsLines": [
        "DRAFT — Not negotiable unless marked original.",
        "STC: VALVE MATERIALS FOR MACHINERY PARTS"
      ],
      "remarks": "Format-45"
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "formatBadge",
        "label": "Format-45"
      },
      {
        "type": "docTitle",
        "text": "HOUSE BILL OF LADING — DRAFT FORMAT 45",
        "align": "center",
        "band": false
      },
      {
        "type": "partyNotifyGrid"
      },
      {
        "type": "fieldGrid",
        "cols": 3
      },
      {
        "type": "hblCargoTable"
      },
      {
        "type": "hblFreightSignature"
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
    "code": "HBL_DRAFT_REPORT_FORMAT_46",
    "formatNumber": 34,
    "name": "HBL Draft Report Format-46",
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
      "company": "KingFisher Wings",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "inquiry@kingfishertec.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "PLMAAJEA00081",
      "invoiceDate": "28-JAN-19",
      "formatBadgeLabel": "Format-46",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Booking Ref.",
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
          "k": "Service Type",
          "v": "FCL"
        },
        {
          "k": "Freight",
          "v": "PREPAID"
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
          "v": "HBL Draft Report Format-46"
        }
      ],
      "hblCargoHeaders": [
        "Container No. / Seal No. / Mark & No.",
        "No. of Pkgs",
        "Description of Goods",
        "Gross Weight",
        "Measurement"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 / 20' DC X 1\nNIL MARKS",
          "125 PACKAGES",
          "FCL STC: VALVE MATERIALS FOR MACHINERY PARTS",
          "18,000.000 KGS",
          "24.000 CBM"
        ]
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
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "termsLines": [
        "DRAFT — Not negotiable unless marked original.",
        "STC: VALVE MATERIALS FOR MACHINERY PARTS"
      ],
      "remarks": "Format-46"
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "formatBadge",
        "label": "Format-46"
      },
      {
        "type": "docTitle",
        "text": "HOUSE BILL OF LADING — DRAFT FORMAT 46",
        "align": "start",
        "band": true
      },
      {
        "type": "partyNotifyGrid"
      },
      {
        "type": "fieldGrid",
        "cols": 2
      },
      {
        "type": "hblCargoTable"
      },
      {
        "type": "hblFreightSignature"
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
    "code": "HBL_DRAFT_REPORT_FORMAT_47",
    "formatNumber": 35,
    "name": "HBL Draft Report Format-47",
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
      "company": "KingFisher Wings",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "inquiry@kingfishertec.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "PLMAAJEA00081",
      "invoiceDate": "28-JAN-19",
      "formatBadgeLabel": "Format-47",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Booking Ref.",
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
          "k": "Service Type",
          "v": "FCL"
        },
        {
          "k": "Freight",
          "v": "PREPAID"
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
          "v": "HBL Draft Report Format-47"
        }
      ],
      "hblCargoHeaders": [
        "Container No. / Seal No. / Mark & No.",
        "No. of Pkgs",
        "Description of Goods",
        "Gross Weight",
        "Measurement"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 / 20' DC X 1\nNIL MARKS",
          "125 PACKAGES",
          "FCL STC: VALVE MATERIALS FOR MACHINERY PARTS",
          "18,000.000 KGS",
          "24.000 CBM"
        ]
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
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "termsLines": [
        "DRAFT — Not negotiable unless marked original.",
        "STC: VALVE MATERIALS FOR MACHINERY PARTS"
      ],
      "remarks": "Format-47"
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "formatBadge",
        "label": "Format-47"
      },
      {
        "type": "docTitle",
        "text": "HOUSE BILL OF LADING — DRAFT FORMAT 47",
        "align": "end",
        "band": false
      },
      {
        "type": "partyNotifyGrid"
      },
      {
        "type": "fieldGrid",
        "cols": 3
      },
      {
        "type": "hblCargoTable"
      },
      {
        "type": "hblFreightSignature"
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
    "code": "HBL_DRAFT_REPORT_FORMAT_48",
    "formatNumber": 36,
    "name": "HBL Draft Report Format-48",
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
      "company": "KingFisher Wings",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "inquiry@kingfishertec.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "PLMAAJEA00081",
      "invoiceDate": "28-JAN-19",
      "formatBadgeLabel": "Format-48",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Booking Ref.",
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
          "k": "Service Type",
          "v": "FCL"
        },
        {
          "k": "Freight",
          "v": "PREPAID"
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
          "v": "HBL Draft Report Format-48"
        }
      ],
      "hblCargoHeaders": [
        "Container No. / Seal No. / Mark & No.",
        "No. of Pkgs",
        "Description of Goods",
        "Gross Weight",
        "Measurement"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 / 20' DC X 1\nNIL MARKS",
          "125 PACKAGES",
          "FCL STC: VALVE MATERIALS FOR MACHINERY PARTS",
          "18,000.000 KGS",
          "24.000 CBM"
        ]
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
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "termsLines": [
        "DRAFT — Not negotiable unless marked original.",
        "STC: VALVE MATERIALS FOR MACHINERY PARTS"
      ],
      "remarks": "Format-48"
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "formatBadge",
        "label": "Format-48"
      },
      {
        "type": "docTitle",
        "text": "HOUSE BILL OF LADING — DRAFT FORMAT 48",
        "align": "center",
        "band": true
      },
      {
        "type": "partyNotifyGrid"
      },
      {
        "type": "fieldGrid",
        "cols": 2
      },
      {
        "type": "hblCargoTable"
      },
      {
        "type": "hblFreightSignature"
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
    "code": "HBL_DRAFT_REPORT_FORMAT_49",
    "formatNumber": 37,
    "name": "HBL Draft Report Format-49",
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
      "company": "KingFisher Wings",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "inquiry@kingfishertec.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "PLMAAJEA00081",
      "invoiceDate": "28-JAN-19",
      "formatBadgeLabel": "Format-49",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Booking Ref.",
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
          "k": "Service Type",
          "v": "FCL"
        },
        {
          "k": "Freight",
          "v": "PREPAID"
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
          "v": "HBL Draft Report Format-49"
        }
      ],
      "hblCargoHeaders": [
        "Container No. / Seal No. / Mark & No.",
        "No. of Pkgs",
        "Description of Goods",
        "Gross Weight",
        "Measurement"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 / 20' DC X 1\nNIL MARKS",
          "125 PACKAGES",
          "FCL STC: VALVE MATERIALS FOR MACHINERY PARTS",
          "18,000.000 KGS",
          "24.000 CBM"
        ]
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
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "termsLines": [
        "DRAFT — Not negotiable unless marked original.",
        "STC: VALVE MATERIALS FOR MACHINERY PARTS"
      ],
      "remarks": "Format-49"
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "formatBadge",
        "label": "Format-49"
      },
      {
        "type": "docTitle",
        "text": "HOUSE BILL OF LADING — DRAFT FORMAT 49",
        "align": "start",
        "band": false
      },
      {
        "type": "partyNotifyGrid"
      },
      {
        "type": "fieldGrid",
        "cols": 3
      },
      {
        "type": "hblCargoTable"
      },
      {
        "type": "hblFreightSignature"
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
    "code": "HBL_DRAFT_REPORT_FORMAT_50",
    "formatNumber": 38,
    "name": "HBL Draft Report Format-50",
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
      "company": "KingFisher Wings",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "inquiry@kingfishertec.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "PLMAAJEA00081",
      "invoiceDate": "28-JAN-19",
      "formatBadgeLabel": "Format-50",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Booking Ref.",
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
          "k": "Service Type",
          "v": "FCL"
        },
        {
          "k": "Freight",
          "v": "PREPAID"
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
          "v": "HBL Draft Report Format-50"
        }
      ],
      "hblCargoHeaders": [
        "Container No. / Seal No. / Mark & No.",
        "No. of Pkgs",
        "Description of Goods",
        "Gross Weight",
        "Measurement"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 / 20' DC X 1\nNIL MARKS",
          "125 PACKAGES",
          "FCL STC: VALVE MATERIALS FOR MACHINERY PARTS",
          "18,000.000 KGS",
          "24.000 CBM"
        ]
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
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "termsLines": [
        "DRAFT — Not negotiable unless marked original.",
        "STC: VALVE MATERIALS FOR MACHINERY PARTS"
      ],
      "remarks": "Format-50"
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "formatBadge",
        "label": "Format-50"
      },
      {
        "type": "docTitle",
        "text": "HOUSE BILL OF LADING — DRAFT FORMAT 50",
        "align": "end",
        "band": true
      },
      {
        "type": "partyNotifyGrid"
      },
      {
        "type": "fieldGrid",
        "cols": 2
      },
      {
        "type": "hblCargoTable"
      },
      {
        "type": "hblFreightSignature"
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
    "code": "HBL_DRAFT_REPORT_FORMAT_51",
    "formatNumber": 39,
    "name": "HBL Draft Report Format-51",
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
      "company": "KingFisher Wings",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "inquiry@kingfishertec.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "PLMAAJEA00081",
      "invoiceDate": "28-JAN-19",
      "formatBadgeLabel": "Format-51",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Booking Ref.",
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
          "k": "Service Type",
          "v": "FCL"
        },
        {
          "k": "Freight",
          "v": "PREPAID"
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
          "v": "HBL Draft Report Format-51"
        }
      ],
      "hblCargoHeaders": [
        "Container No. / Seal No. / Mark & No.",
        "No. of Pkgs",
        "Description of Goods",
        "Gross Weight",
        "Measurement"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 / 20' DC X 1\nNIL MARKS",
          "125 PACKAGES",
          "FCL STC: VALVE MATERIALS FOR MACHINERY PARTS",
          "18,000.000 KGS",
          "24.000 CBM"
        ]
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
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "termsLines": [
        "DRAFT — Not negotiable unless marked original.",
        "STC: VALVE MATERIALS FOR MACHINERY PARTS"
      ],
      "remarks": "Format-51"
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "formatBadge",
        "label": "Format-51"
      },
      {
        "type": "docTitle",
        "text": "HOUSE BILL OF LADING — DRAFT FORMAT 51",
        "align": "center",
        "band": false
      },
      {
        "type": "partyNotifyGrid"
      },
      {
        "type": "fieldGrid",
        "cols": 3
      },
      {
        "type": "hblCargoTable"
      },
      {
        "type": "hblFreightSignature"
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
    "code": "HBL_DRAFT_REPORT_FORMAT_52",
    "formatNumber": 40,
    "name": "HBL Draft Report Format-52",
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
      "company": "KingFisher Wings",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "inquiry@kingfishertec.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "PLMAAJEA00081",
      "invoiceDate": "28-JAN-19",
      "formatBadgeLabel": "Format-52",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Booking Ref.",
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
          "k": "Service Type",
          "v": "FCL"
        },
        {
          "k": "Freight",
          "v": "PREPAID"
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
          "v": "HBL Draft Report Format-52"
        }
      ],
      "hblCargoHeaders": [
        "Container No. / Seal No. / Mark & No.",
        "No. of Pkgs",
        "Description of Goods",
        "Gross Weight",
        "Measurement"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 / 20' DC X 1\nNIL MARKS",
          "125 PACKAGES",
          "FCL STC: VALVE MATERIALS FOR MACHINERY PARTS",
          "18,000.000 KGS",
          "24.000 CBM"
        ]
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
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "termsLines": [
        "DRAFT — Not negotiable unless marked original.",
        "STC: VALVE MATERIALS FOR MACHINERY PARTS"
      ],
      "remarks": "Format-52"
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "formatBadge",
        "label": "Format-52"
      },
      {
        "type": "docTitle",
        "text": "HOUSE BILL OF LADING — DRAFT FORMAT 52",
        "align": "start",
        "band": true
      },
      {
        "type": "partyNotifyGrid"
      },
      {
        "type": "fieldGrid",
        "cols": 2
      },
      {
        "type": "hblCargoTable"
      },
      {
        "type": "hblFreightSignature"
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
    "code": "HBL_DRAFT_REPORT_FORMAT_53",
    "formatNumber": 41,
    "name": "HBL Draft Report Format-53",
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
      "company": "KingFisher Wings",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "inquiry@kingfishertec.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "PLMAAJEA00081",
      "invoiceDate": "28-JAN-19",
      "formatBadgeLabel": "Format-53",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Booking Ref.",
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
          "k": "Service Type",
          "v": "FCL"
        },
        {
          "k": "Freight",
          "v": "PREPAID"
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
          "v": "HBL Draft Report Format-53"
        }
      ],
      "hblCargoHeaders": [
        "Container No. / Seal No. / Mark & No.",
        "No. of Pkgs",
        "Description of Goods",
        "Gross Weight",
        "Measurement"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 / 20' DC X 1\nNIL MARKS",
          "125 PACKAGES",
          "FCL STC: VALVE MATERIALS FOR MACHINERY PARTS",
          "18,000.000 KGS",
          "24.000 CBM"
        ]
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
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "termsLines": [
        "DRAFT — Not negotiable unless marked original.",
        "STC: VALVE MATERIALS FOR MACHINERY PARTS"
      ],
      "remarks": "Format-53"
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "formatBadge",
        "label": "Format-53"
      },
      {
        "type": "docTitle",
        "text": "HOUSE BILL OF LADING — DRAFT FORMAT 53",
        "align": "end",
        "band": false
      },
      {
        "type": "partyNotifyGrid"
      },
      {
        "type": "fieldGrid",
        "cols": 3
      },
      {
        "type": "hblCargoTable"
      },
      {
        "type": "hblFreightSignature"
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
    "code": "HBL_DRAFT_REPORT_FORMAT_54",
    "formatNumber": 42,
    "name": "HBL Draft Report Format-54",
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
      "company": "KingFisher Wings",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "inquiry@kingfishertec.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "PLMAAJEA00081",
      "invoiceDate": "28-JAN-19",
      "formatBadgeLabel": "Format-54",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Booking Ref.",
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
          "k": "Service Type",
          "v": "FCL"
        },
        {
          "k": "Freight",
          "v": "PREPAID"
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
          "v": "HBL Draft Report Format-54"
        }
      ],
      "hblCargoHeaders": [
        "Container No. / Seal No. / Mark & No.",
        "No. of Pkgs",
        "Description of Goods",
        "Gross Weight",
        "Measurement"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 / 20' DC X 1\nNIL MARKS",
          "125 PACKAGES",
          "FCL STC: VALVE MATERIALS FOR MACHINERY PARTS",
          "18,000.000 KGS",
          "24.000 CBM"
        ]
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
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "termsLines": [
        "DRAFT — Not negotiable unless marked original.",
        "STC: VALVE MATERIALS FOR MACHINERY PARTS"
      ],
      "remarks": "Format-54"
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "formatBadge",
        "label": "Format-54"
      },
      {
        "type": "docTitle",
        "text": "HOUSE BILL OF LADING — DRAFT FORMAT 54",
        "align": "center",
        "band": true
      },
      {
        "type": "partyNotifyGrid"
      },
      {
        "type": "fieldGrid",
        "cols": 2
      },
      {
        "type": "hblCargoTable"
      },
      {
        "type": "hblFreightSignature"
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
    "code": "HBL_DRAFT_REPORT_FORMAT_55",
    "formatNumber": 43,
    "name": "HBL Draft Report Format-55",
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
      "company": "KingFisher Wings",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "inquiry@kingfishertec.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "PLMAAJEA00081",
      "invoiceDate": "28-JAN-19",
      "formatBadgeLabel": "Format-55",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Booking Ref.",
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
          "k": "Service Type",
          "v": "FCL"
        },
        {
          "k": "Freight",
          "v": "PREPAID"
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
          "v": "HBL Draft Report Format-55"
        }
      ],
      "hblCargoHeaders": [
        "Container No. / Seal No. / Mark & No.",
        "No. of Pkgs",
        "Description of Goods",
        "Gross Weight",
        "Measurement"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 / 20' DC X 1\nNIL MARKS",
          "125 PACKAGES",
          "FCL STC: VALVE MATERIALS FOR MACHINERY PARTS",
          "18,000.000 KGS",
          "24.000 CBM"
        ]
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
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "termsLines": [
        "DRAFT — Not negotiable unless marked original.",
        "STC: VALVE MATERIALS FOR MACHINERY PARTS"
      ],
      "remarks": "Format-55"
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "formatBadge",
        "label": "Format-55"
      },
      {
        "type": "docTitle",
        "text": "HOUSE BILL OF LADING — DRAFT FORMAT 55",
        "align": "start",
        "band": false
      },
      {
        "type": "partyNotifyGrid"
      },
      {
        "type": "fieldGrid",
        "cols": 3
      },
      {
        "type": "hblCargoTable"
      },
      {
        "type": "hblFreightSignature"
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
    "code": "HBL_DRAFT_REPORT_FORMAT_56",
    "formatNumber": 44,
    "name": "HBL Draft Report Format-56",
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
      "company": "KingFisher Wings",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "inquiry@kingfishertec.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "PLMAAJEA00081",
      "invoiceDate": "28-JAN-19",
      "formatBadgeLabel": "Format-56",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Booking Ref.",
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
          "k": "Service Type",
          "v": "FCL"
        },
        {
          "k": "Freight",
          "v": "PREPAID"
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
          "v": "HBL Draft Report Format-56"
        }
      ],
      "hblCargoHeaders": [
        "Container No. / Seal No. / Mark & No.",
        "No. of Pkgs",
        "Description of Goods",
        "Gross Weight",
        "Measurement"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 / 20' DC X 1\nNIL MARKS",
          "125 PACKAGES",
          "FCL STC: VALVE MATERIALS FOR MACHINERY PARTS",
          "18,000.000 KGS",
          "24.000 CBM"
        ]
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
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "termsLines": [
        "DRAFT — Not negotiable unless marked original.",
        "STC: VALVE MATERIALS FOR MACHINERY PARTS"
      ],
      "remarks": "Format-56"
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "formatBadge",
        "label": "Format-56"
      },
      {
        "type": "docTitle",
        "text": "HOUSE BILL OF LADING — DRAFT FORMAT 56",
        "align": "end",
        "band": true
      },
      {
        "type": "partyNotifyGrid"
      },
      {
        "type": "fieldGrid",
        "cols": 2
      },
      {
        "type": "hblCargoTable"
      },
      {
        "type": "hblFreightSignature"
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
    "code": "HBL_DRAFT_REPORT_FORMAT_59",
    "formatNumber": 45,
    "name": "HBL Draft Report Format-59",
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
      "company": "KingFisher Wings",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "inquiry@kingfishertec.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "PLMAAJEA00081",
      "invoiceDate": "28-JAN-19",
      "formatBadgeLabel": "Format-59",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Booking Ref.",
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
          "k": "Service Type",
          "v": "FCL"
        },
        {
          "k": "Freight",
          "v": "PREPAID"
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
          "v": "HBL Draft Report Format-59"
        }
      ],
      "hblCargoHeaders": [
        "Container No. / Seal No. / Mark & No.",
        "No. of Pkgs",
        "Description of Goods",
        "Gross Weight",
        "Measurement"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 / 20' DC X 1\nNIL MARKS",
          "125 PACKAGES",
          "FCL STC: VALVE MATERIALS FOR MACHINERY PARTS",
          "18,000.000 KGS",
          "24.000 CBM"
        ]
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
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "termsLines": [
        "DRAFT — Not negotiable unless marked original.",
        "STC: VALVE MATERIALS FOR MACHINERY PARTS"
      ],
      "remarks": "Format-59"
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "formatBadge",
        "label": "Format-59"
      },
      {
        "type": "docTitle",
        "text": "HOUSE BILL OF LADING — DRAFT FORMAT 59",
        "align": "end",
        "band": false
      },
      {
        "type": "partyNotifyGrid"
      },
      {
        "type": "fieldGrid",
        "cols": 3
      },
      {
        "type": "hblCargoTable"
      },
      {
        "type": "hblFreightSignature"
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
    "code": "HBL_DRAFT_REPORT_FORMAT_60",
    "formatNumber": 46,
    "name": "HBL Draft Report Format-60",
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
      "company": "KingFisher Wings",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "inquiry@kingfishertec.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "PLMAAJEA00081",
      "invoiceDate": "28-JAN-19",
      "formatBadgeLabel": "Format-60",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Booking Ref.",
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
          "k": "Service Type",
          "v": "FCL"
        },
        {
          "k": "Freight",
          "v": "PREPAID"
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
          "v": "HBL Draft Report Format-60"
        }
      ],
      "hblCargoHeaders": [
        "Container No. / Seal No. / Mark & No.",
        "No. of Pkgs",
        "Description of Goods",
        "Gross Weight",
        "Measurement"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 / 20' DC X 1\nNIL MARKS",
          "125 PACKAGES",
          "FCL STC: VALVE MATERIALS FOR MACHINERY PARTS",
          "18,000.000 KGS",
          "24.000 CBM"
        ]
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
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "termsLines": [
        "DRAFT — Not negotiable unless marked original.",
        "STC: VALVE MATERIALS FOR MACHINERY PARTS"
      ],
      "remarks": "Format-60"
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "formatBadge",
        "label": "Format-60"
      },
      {
        "type": "docTitle",
        "text": "HOUSE BILL OF LADING — DRAFT FORMAT 60",
        "align": "center",
        "band": true
      },
      {
        "type": "partyNotifyGrid"
      },
      {
        "type": "fieldGrid",
        "cols": 2
      },
      {
        "type": "hblCargoTable"
      },
      {
        "type": "hblFreightSignature"
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
    "code": "HBL_DRAFT_REPORT_FORMAT_61",
    "formatNumber": 47,
    "name": "HBL Draft Report Format-61",
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
      "company": "KingFisher Wings",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "inquiry@kingfishertec.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "PLMAAJEA00081",
      "invoiceDate": "28-JAN-19",
      "formatBadgeLabel": "Format-61",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Booking Ref.",
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
          "k": "Service Type",
          "v": "FCL"
        },
        {
          "k": "Freight",
          "v": "PREPAID"
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
          "v": "HBL Draft Report Format-61"
        }
      ],
      "hblCargoHeaders": [
        "Container No. / Seal No. / Mark & No.",
        "No. of Pkgs",
        "Description of Goods",
        "Gross Weight",
        "Measurement"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 / 20' DC X 1\nNIL MARKS",
          "125 PACKAGES",
          "FCL STC: VALVE MATERIALS FOR MACHINERY PARTS",
          "18,000.000 KGS",
          "24.000 CBM"
        ]
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
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "termsLines": [
        "DRAFT — Not negotiable unless marked original.",
        "STC: VALVE MATERIALS FOR MACHINERY PARTS"
      ],
      "remarks": "Format-61"
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "formatBadge",
        "label": "Format-61"
      },
      {
        "type": "docTitle",
        "text": "HOUSE BILL OF LADING — DRAFT FORMAT 61",
        "align": "start",
        "band": false
      },
      {
        "type": "partyNotifyGrid"
      },
      {
        "type": "fieldGrid",
        "cols": 3
      },
      {
        "type": "hblCargoTable"
      },
      {
        "type": "hblFreightSignature"
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
    "code": "HBL_DRAFT_REPORT_FORMAT_63",
    "formatNumber": 48,
    "name": "HBL Draft Report Format-63",
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
      "company": "KingFisher Wings",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "inquiry@kingfishertec.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "PLMAAJEA00081",
      "invoiceDate": "28-JAN-19",
      "formatBadgeLabel": "Format-63",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Booking Ref.",
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
          "k": "Service Type",
          "v": "FCL"
        },
        {
          "k": "Freight",
          "v": "PREPAID"
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
          "v": "HBL Draft Report Format-63"
        }
      ],
      "hblCargoHeaders": [
        "Container No. / Seal No. / Mark & No.",
        "No. of Pkgs",
        "Description of Goods",
        "Gross Weight",
        "Measurement"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 / 20' DC X 1\nNIL MARKS",
          "125 PACKAGES",
          "FCL STC: VALVE MATERIALS FOR MACHINERY PARTS",
          "18,000.000 KGS",
          "24.000 CBM"
        ]
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
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "termsLines": [
        "DRAFT — Not negotiable unless marked original.",
        "STC: VALVE MATERIALS FOR MACHINERY PARTS"
      ],
      "remarks": "Format-63"
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "formatBadge",
        "label": "Format-63"
      },
      {
        "type": "docTitle",
        "text": "HOUSE BILL OF LADING — DRAFT FORMAT 63",
        "align": "center",
        "band": false
      },
      {
        "type": "partyNotifyGrid"
      },
      {
        "type": "fieldGrid",
        "cols": 3
      },
      {
        "type": "hblCargoTable"
      },
      {
        "type": "hblFreightSignature"
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
    "code": "HBL_DRAFT_REPORT_FORMAT_64",
    "formatNumber": 49,
    "name": "HBL Draft Report Format-64",
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
      "company": "KingFisher Wings",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "inquiry@kingfishertec.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "PLMAAJEA00081",
      "invoiceDate": "28-JAN-19",
      "formatBadgeLabel": "Format-64",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Booking Ref.",
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
          "k": "Service Type",
          "v": "FCL"
        },
        {
          "k": "Freight",
          "v": "PREPAID"
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
          "v": "HBL Draft Report Format-64"
        }
      ],
      "hblCargoHeaders": [
        "Container No. / Seal No. / Mark & No.",
        "No. of Pkgs",
        "Description of Goods",
        "Gross Weight",
        "Measurement"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 / 20' DC X 1\nNIL MARKS",
          "125 PACKAGES",
          "FCL STC: VALVE MATERIALS FOR MACHINERY PARTS",
          "18,000.000 KGS",
          "24.000 CBM"
        ]
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
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "termsLines": [
        "DRAFT — Not negotiable unless marked original.",
        "STC: VALVE MATERIALS FOR MACHINERY PARTS"
      ],
      "remarks": "Format-64"
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "formatBadge",
        "label": "Format-64"
      },
      {
        "type": "docTitle",
        "text": "HOUSE BILL OF LADING — DRAFT FORMAT 64",
        "align": "start",
        "band": true
      },
      {
        "type": "partyNotifyGrid"
      },
      {
        "type": "fieldGrid",
        "cols": 2
      },
      {
        "type": "hblCargoTable"
      },
      {
        "type": "hblFreightSignature"
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
    "code": "HBL_DRAFT_REPORT_FORMAT_65",
    "formatNumber": 50,
    "name": "HBL Draft Report Format-65",
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
      "company": "KingFisher Wings",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "inquiry@kingfishertec.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "PLMAAJEA00081",
      "invoiceDate": "28-JAN-19",
      "formatBadgeLabel": "Format-65",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Booking Ref.",
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
          "k": "Service Type",
          "v": "FCL"
        },
        {
          "k": "Freight",
          "v": "PREPAID"
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
          "v": "HBL Draft Report Format-65"
        }
      ],
      "hblCargoHeaders": [
        "Container No. / Seal No. / Mark & No.",
        "No. of Pkgs",
        "Description of Goods",
        "Gross Weight",
        "Measurement"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 / 20' DC X 1\nNIL MARKS",
          "125 PACKAGES",
          "FCL STC: VALVE MATERIALS FOR MACHINERY PARTS",
          "18,000.000 KGS",
          "24.000 CBM"
        ]
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
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "termsLines": [
        "DRAFT — Not negotiable unless marked original.",
        "STC: VALVE MATERIALS FOR MACHINERY PARTS"
      ],
      "remarks": "Format-65"
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "formatBadge",
        "label": "Format-65"
      },
      {
        "type": "docTitle",
        "text": "HOUSE BILL OF LADING — DRAFT FORMAT 65",
        "align": "end",
        "band": false
      },
      {
        "type": "partyNotifyGrid"
      },
      {
        "type": "fieldGrid",
        "cols": 3
      },
      {
        "type": "hblCargoTable"
      },
      {
        "type": "hblFreightSignature"
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
    "code": "HBL_DRAFT_REPORT_FORMAT_66",
    "formatNumber": 51,
    "name": "HBL Draft Report Format-66",
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
      "company": "KingFisher Wings",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "inquiry@kingfishertec.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "PLMAAJEA00081",
      "invoiceDate": "28-JAN-19",
      "formatBadgeLabel": "Format-66",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Booking Ref.",
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
          "k": "Service Type",
          "v": "FCL"
        },
        {
          "k": "Freight",
          "v": "PREPAID"
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
          "v": "HBL Draft Report Format-66"
        }
      ],
      "hblCargoHeaders": [
        "Container No. / Seal No. / Mark & No.",
        "No. of Pkgs",
        "Description of Goods",
        "Gross Weight",
        "Measurement"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 / 20' DC X 1\nNIL MARKS",
          "125 PACKAGES",
          "FCL STC: VALVE MATERIALS FOR MACHINERY PARTS",
          "18,000.000 KGS",
          "24.000 CBM"
        ]
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
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "termsLines": [
        "DRAFT — Not negotiable unless marked original.",
        "STC: VALVE MATERIALS FOR MACHINERY PARTS"
      ],
      "remarks": "Format-66"
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "formatBadge",
        "label": "Format-66"
      },
      {
        "type": "docTitle",
        "text": "HOUSE BILL OF LADING — DRAFT FORMAT 66",
        "align": "center",
        "band": true
      },
      {
        "type": "partyNotifyGrid"
      },
      {
        "type": "fieldGrid",
        "cols": 2
      },
      {
        "type": "hblCargoTable"
      },
      {
        "type": "hblFreightSignature"
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
    "code": "HBL_DRAFT_REPORT_FORMAT_67",
    "formatNumber": 52,
    "name": "HBL Draft Report Format-67",
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
      "company": "KingFisher Wings",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "inquiry@kingfishertec.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "PLMAAJEA00081",
      "invoiceDate": "28-JAN-19",
      "formatBadgeLabel": "Format-67",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Booking Ref.",
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
          "k": "Service Type",
          "v": "FCL"
        },
        {
          "k": "Freight",
          "v": "PREPAID"
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
          "v": "HBL Draft Report Format-67"
        }
      ],
      "hblCargoHeaders": [
        "Container No. / Seal No. / Mark & No.",
        "No. of Pkgs",
        "Description of Goods",
        "Gross Weight",
        "Measurement"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 / 20' DC X 1\nNIL MARKS",
          "125 PACKAGES",
          "FCL STC: VALVE MATERIALS FOR MACHINERY PARTS",
          "18,000.000 KGS",
          "24.000 CBM"
        ]
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
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "termsLines": [
        "DRAFT — Not negotiable unless marked original.",
        "STC: VALVE MATERIALS FOR MACHINERY PARTS"
      ],
      "remarks": "Format-67"
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "formatBadge",
        "label": "Format-67"
      },
      {
        "type": "docTitle",
        "text": "HOUSE BILL OF LADING — DRAFT FORMAT 67",
        "align": "start",
        "band": false
      },
      {
        "type": "partyNotifyGrid"
      },
      {
        "type": "fieldGrid",
        "cols": 3
      },
      {
        "type": "hblCargoTable"
      },
      {
        "type": "hblFreightSignature"
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
    "code": "HBL_DRAFT_REPORT_FORMAT_68",
    "formatNumber": 53,
    "name": "HBL Draft Report Format-68",
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
      "company": "KingFisher Wings",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "inquiry@kingfishertec.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "PLMAAJEA00081",
      "invoiceDate": "28-JAN-19",
      "formatBadgeLabel": "Format-68",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Booking Ref.",
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
          "k": "Service Type",
          "v": "FCL"
        },
        {
          "k": "Freight",
          "v": "PREPAID"
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
          "v": "HBL Draft Report Format-68"
        }
      ],
      "hblCargoHeaders": [
        "Container No. / Seal No. / Mark & No.",
        "No. of Pkgs",
        "Description of Goods",
        "Gross Weight",
        "Measurement"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 / 20' DC X 1\nNIL MARKS",
          "125 PACKAGES",
          "FCL STC: VALVE MATERIALS FOR MACHINERY PARTS",
          "18,000.000 KGS",
          "24.000 CBM"
        ]
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
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "termsLines": [
        "DRAFT — Not negotiable unless marked original.",
        "STC: VALVE MATERIALS FOR MACHINERY PARTS"
      ],
      "remarks": "Format-68"
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "formatBadge",
        "label": "Format-68"
      },
      {
        "type": "docTitle",
        "text": "HOUSE BILL OF LADING — DRAFT FORMAT 68",
        "align": "end",
        "band": true
      },
      {
        "type": "partyNotifyGrid"
      },
      {
        "type": "fieldGrid",
        "cols": 2
      },
      {
        "type": "hblCargoTable"
      },
      {
        "type": "hblFreightSignature"
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
    "code": "HBL_DRAFT_REPORT_FORMAT_69",
    "formatNumber": 54,
    "name": "HBL Draft Report Format-69",
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
      "company": "KingFisher Wings",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "inquiry@kingfishertec.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "PLMAAJEA00081",
      "invoiceDate": "28-JAN-19",
      "formatBadgeLabel": "Format-69",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Booking Ref.",
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
          "k": "Service Type",
          "v": "FCL"
        },
        {
          "k": "Freight",
          "v": "PREPAID"
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
          "v": "HBL Draft Report Format-69"
        }
      ],
      "hblCargoHeaders": [
        "Container No. / Seal No. / Mark & No.",
        "No. of Pkgs",
        "Description of Goods",
        "Gross Weight",
        "Measurement"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 / 20' DC X 1\nNIL MARKS",
          "125 PACKAGES",
          "FCL STC: VALVE MATERIALS FOR MACHINERY PARTS",
          "18,000.000 KGS",
          "24.000 CBM"
        ]
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
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "termsLines": [
        "DRAFT — Not negotiable unless marked original.",
        "STC: VALVE MATERIALS FOR MACHINERY PARTS"
      ],
      "remarks": "Format-69"
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "formatBadge",
        "label": "Format-69"
      },
      {
        "type": "docTitle",
        "text": "HOUSE BILL OF LADING — DRAFT FORMAT 69",
        "align": "center",
        "band": false
      },
      {
        "type": "partyNotifyGrid"
      },
      {
        "type": "fieldGrid",
        "cols": 3
      },
      {
        "type": "hblCargoTable"
      },
      {
        "type": "hblFreightSignature"
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
    "code": "HBL_DRAFT_REPORT_FORMAT_70",
    "formatNumber": 55,
    "name": "HBL Draft Report Format-70",
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
      "company": "KingFisher Wings",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "inquiry@kingfishertec.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "PLMAAJEA00081",
      "invoiceDate": "28-JAN-19",
      "formatBadgeLabel": "Format-70",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Booking Ref.",
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
          "k": "Service Type",
          "v": "FCL"
        },
        {
          "k": "Freight",
          "v": "PREPAID"
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
          "v": "HBL Draft Report Format-70"
        }
      ],
      "hblCargoHeaders": [
        "Container No. / Seal No. / Mark & No.",
        "No. of Pkgs",
        "Description of Goods",
        "Gross Weight",
        "Measurement"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 / 20' DC X 1\nNIL MARKS",
          "125 PACKAGES",
          "FCL STC: VALVE MATERIALS FOR MACHINERY PARTS",
          "18,000.000 KGS",
          "24.000 CBM"
        ]
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
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "termsLines": [
        "DRAFT — Not negotiable unless marked original.",
        "STC: VALVE MATERIALS FOR MACHINERY PARTS"
      ],
      "remarks": "Format-70"
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "formatBadge",
        "label": "Format-70"
      },
      {
        "type": "docTitle",
        "text": "HOUSE BILL OF LADING — DRAFT FORMAT 70",
        "align": "start",
        "band": true
      },
      {
        "type": "partyNotifyGrid"
      },
      {
        "type": "fieldGrid",
        "cols": 2
      },
      {
        "type": "hblCargoTable"
      },
      {
        "type": "hblFreightSignature"
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
    "code": "HBL_DRAFT_REPORT_FORMAT_72",
    "formatNumber": 55,
    "name": "HBL Draft Report Format-72",
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
      "company": "KingFisher Wings",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "inquiry@kingfishertec.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "PLMAAJEA00081",
      "invoiceDate": "28-JAN-19",
      "formatBadgeLabel": "Format-72",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Booking Ref.",
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
          "k": "Service Type",
          "v": "FCL"
        },
        {
          "k": "Freight",
          "v": "PREPAID"
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
          "v": "HBL Draft Report Format-72"
        }
      ],
      "hblCargoHeaders": [
        "Container No. / Seal No. / Mark & No.",
        "No. of Pkgs",
        "Description of Goods",
        "Gross Weight",
        "Measurement"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 / 20' DC X 1\nNIL MARKS",
          "125 PACKAGES",
          "FCL STC: VALVE MATERIALS FOR MACHINERY PARTS",
          "18,000.000 KGS",
          "24.000 CBM"
        ]
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
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "termsLines": [
        "DRAFT — Not negotiable unless marked original.",
        "STC: VALVE MATERIALS FOR MACHINERY PARTS"
      ],
      "remarks": "Format-72"
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "formatBadge",
        "label": "Format-72"
      },
      {
        "type": "docTitle",
        "text": "HOUSE BILL OF LADING — DRAFT FORMAT 72",
        "align": "center",
        "band": true
      },
      {
        "type": "partyNotifyGrid"
      },
      {
        "type": "fieldGrid",
        "cols": 2
      },
      {
        "type": "hblCargoTable"
      },
      {
        "type": "hblFreightSignature"
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
    "code": "HBL_DRAFT_REPORT_FORMAT_73",
    "formatNumber": 56,
    "name": "HBL Draft Report Format-73",
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
      "company": "KingFisher Wings",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "inquiry@kingfishertec.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "PLMAAJEA00081",
      "invoiceDate": "28-JAN-19",
      "formatBadgeLabel": "Format-73",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Booking Ref.",
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
          "k": "Service Type",
          "v": "FCL"
        },
        {
          "k": "Freight",
          "v": "PREPAID"
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
          "v": "HBL Draft Report Format-73"
        }
      ],
      "hblCargoHeaders": [
        "Container No. / Seal No. / Mark & No.",
        "No. of Pkgs",
        "Description of Goods",
        "Gross Weight",
        "Measurement"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 / 20' DC X 1\nNIL MARKS",
          "125 PACKAGES",
          "FCL STC: VALVE MATERIALS FOR MACHINERY PARTS",
          "18,000.000 KGS",
          "24.000 CBM"
        ]
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
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "termsLines": [
        "DRAFT — Not negotiable unless marked original.",
        "STC: VALVE MATERIALS FOR MACHINERY PARTS"
      ],
      "remarks": "Format-73"
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "formatBadge",
        "label": "Format-73"
      },
      {
        "type": "docTitle",
        "text": "HOUSE BILL OF LADING — DRAFT FORMAT 73",
        "align": "start",
        "band": false
      },
      {
        "type": "partyNotifyGrid"
      },
      {
        "type": "fieldGrid",
        "cols": 3
      },
      {
        "type": "hblCargoTable"
      },
      {
        "type": "hblFreightSignature"
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
    "code": "HBL_DRAFT_REPORT_FORMAT_75",
    "formatNumber": 57,
    "name": "HBL Draft Report Format-75",
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
      "company": "KingFisher Wings",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "inquiry@kingfishertec.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "PLMAAJEA00081",
      "invoiceDate": "28-JAN-19",
      "formatBadgeLabel": "Format-75",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Booking Ref.",
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
          "k": "Service Type",
          "v": "FCL"
        },
        {
          "k": "Freight",
          "v": "PREPAID"
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
          "v": "HBL Draft Report Format-75"
        }
      ],
      "hblCargoHeaders": [
        "Container No. / Seal No. / Mark & No.",
        "No. of Pkgs",
        "Description of Goods",
        "Gross Weight",
        "Measurement"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 / 20' DC X 1\nNIL MARKS",
          "125 PACKAGES",
          "FCL STC: VALVE MATERIALS FOR MACHINERY PARTS",
          "18,000.000 KGS",
          "24.000 CBM"
        ]
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
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "termsLines": [
        "DRAFT — Not negotiable unless marked original.",
        "STC: VALVE MATERIALS FOR MACHINERY PARTS"
      ],
      "remarks": "Format-75"
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "formatBadge",
        "label": "Format-75"
      },
      {
        "type": "docTitle",
        "text": "HOUSE BILL OF LADING — DRAFT FORMAT 75",
        "align": "center",
        "band": false
      },
      {
        "type": "partyNotifyGrid"
      },
      {
        "type": "fieldGrid",
        "cols": 3
      },
      {
        "type": "hblCargoTable"
      },
      {
        "type": "hblFreightSignature"
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
    "code": "HBL_DRAFT_REPORT_FORMAT_77",
    "formatNumber": 58,
    "name": "HBL Draft Report Format-77",
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
      "company": "KingFisher Wings",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "inquiry@kingfishertec.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "PLMAAJEA00081",
      "invoiceDate": "28-JAN-19",
      "formatBadgeLabel": "Format-77",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Booking Ref.",
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
          "k": "Service Type",
          "v": "FCL"
        },
        {
          "k": "Freight",
          "v": "PREPAID"
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
          "v": "HBL Draft Report Format-77"
        }
      ],
      "hblCargoHeaders": [
        "Container No. / Seal No. / Mark & No.",
        "No. of Pkgs",
        "Description of Goods",
        "Gross Weight",
        "Measurement"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 / 20' DC X 1\nNIL MARKS",
          "125 PACKAGES",
          "FCL STC: VALVE MATERIALS FOR MACHINERY PARTS",
          "18,000.000 KGS",
          "24.000 CBM"
        ]
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
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "termsLines": [
        "DRAFT — Not negotiable unless marked original.",
        "STC: VALVE MATERIALS FOR MACHINERY PARTS"
      ],
      "remarks": "Format-77"
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "formatBadge",
        "label": "Format-77"
      },
      {
        "type": "docTitle",
        "text": "HOUSE BILL OF LADING — DRAFT FORMAT 77",
        "align": "end",
        "band": false
      },
      {
        "type": "partyNotifyGrid"
      },
      {
        "type": "fieldGrid",
        "cols": 3
      },
      {
        "type": "hblCargoTable"
      },
      {
        "type": "hblFreightSignature"
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
    "code": "HBL_DRAFT_REPORT_FORMAT_83",
    "formatNumber": 59,
    "name": "HBL Draft Report Format-83",
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
      "company": "KingFisher Wings",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "inquiry@kingfishertec.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "PLMAAJEA00081",
      "invoiceDate": "28-JAN-19",
      "formatBadgeLabel": "Format-83",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Booking Ref.",
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
          "k": "Service Type",
          "v": "FCL"
        },
        {
          "k": "Freight",
          "v": "PREPAID"
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
          "v": "HBL Draft Report Format-83"
        }
      ],
      "hblCargoHeaders": [
        "Container No. / Seal No. / Mark & No.",
        "No. of Pkgs",
        "Description of Goods",
        "Gross Weight",
        "Measurement"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 / 20' DC X 1\nNIL MARKS",
          "125 PACKAGES",
          "FCL STC: VALVE MATERIALS FOR MACHINERY PARTS",
          "18,000.000 KGS",
          "24.000 CBM"
        ]
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
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "termsLines": [
        "DRAFT — Not negotiable unless marked original.",
        "STC: VALVE MATERIALS FOR MACHINERY PARTS"
      ],
      "remarks": "Format-83"
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "formatBadge",
        "label": "Format-83"
      },
      {
        "type": "docTitle",
        "text": "HOUSE BILL OF LADING — DRAFT FORMAT 83",
        "align": "end",
        "band": false
      },
      {
        "type": "partyNotifyGrid"
      },
      {
        "type": "fieldGrid",
        "cols": 3
      },
      {
        "type": "hblCargoTable"
      },
      {
        "type": "hblFreightSignature"
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
    "code": "HBL_DRAFT_REPORT_FORMAT_84",
    "formatNumber": 60,
    "name": "HBL Draft Report Format-84",
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
      "company": "KingFisher Wings",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "inquiry@kingfishertec.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "PLMAAJEA00081",
      "invoiceDate": "28-JAN-19",
      "formatBadgeLabel": "Format-84",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Booking Ref.",
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
          "k": "Service Type",
          "v": "FCL"
        },
        {
          "k": "Freight",
          "v": "PREPAID"
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
          "v": "HBL Draft Report Format-84"
        }
      ],
      "hblCargoHeaders": [
        "Container No. / Seal No. / Mark & No.",
        "No. of Pkgs",
        "Description of Goods",
        "Gross Weight",
        "Measurement"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 / 20' DC X 1\nNIL MARKS",
          "125 PACKAGES",
          "FCL STC: VALVE MATERIALS FOR MACHINERY PARTS",
          "18,000.000 KGS",
          "24.000 CBM"
        ]
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
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "termsLines": [
        "DRAFT — Not negotiable unless marked original.",
        "STC: VALVE MATERIALS FOR MACHINERY PARTS"
      ],
      "remarks": "Format-84"
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "formatBadge",
        "label": "Format-84"
      },
      {
        "type": "docTitle",
        "text": "HOUSE BILL OF LADING — DRAFT FORMAT 84",
        "align": "center",
        "band": true
      },
      {
        "type": "partyNotifyGrid"
      },
      {
        "type": "fieldGrid",
        "cols": 2
      },
      {
        "type": "hblCargoTable"
      },
      {
        "type": "hblFreightSignature"
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
    "code": "HBL_DRAFT_REPORT_FORMAT_85",
    "formatNumber": 61,
    "name": "HBL Draft Report Format-85",
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
      "company": "KingFisher Wings",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "inquiry@kingfishertec.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "PLMAAJEA00081",
      "invoiceDate": "28-JAN-19",
      "formatBadgeLabel": "Format-85",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Booking Ref.",
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
          "k": "Service Type",
          "v": "FCL"
        },
        {
          "k": "Freight",
          "v": "PREPAID"
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
          "v": "HBL Draft Report Format-85"
        }
      ],
      "hblCargoHeaders": [
        "Container No. / Seal No. / Mark & No.",
        "No. of Pkgs",
        "Description of Goods",
        "Gross Weight",
        "Measurement"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 / 20' DC X 1\nNIL MARKS",
          "125 PACKAGES",
          "FCL STC: VALVE MATERIALS FOR MACHINERY PARTS",
          "18,000.000 KGS",
          "24.000 CBM"
        ]
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
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "termsLines": [
        "DRAFT — Not negotiable unless marked original.",
        "STC: VALVE MATERIALS FOR MACHINERY PARTS"
      ],
      "remarks": "Format-85"
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "formatBadge",
        "label": "Format-85"
      },
      {
        "type": "docTitle",
        "text": "HOUSE BILL OF LADING — DRAFT FORMAT 85",
        "align": "start",
        "band": false
      },
      {
        "type": "partyNotifyGrid"
      },
      {
        "type": "fieldGrid",
        "cols": 3
      },
      {
        "type": "hblCargoTable"
      },
      {
        "type": "hblFreightSignature"
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
    "code": "HBL_DRAFT_REPORT_FORMAT_86",
    "formatNumber": 62,
    "name": "HBL Draft Report Format-86",
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
      "company": "KingFisher Wings",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "inquiry@kingfishertec.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "PLMAAJEA00081",
      "invoiceDate": "28-JAN-19",
      "formatBadgeLabel": "Format-86",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Booking Ref.",
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
          "k": "Service Type",
          "v": "FCL"
        },
        {
          "k": "Freight",
          "v": "PREPAID"
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
          "v": "HBL Draft Report Format-86"
        }
      ],
      "hblCargoHeaders": [
        "Container No. / Seal No. / Mark & No.",
        "No. of Pkgs",
        "Description of Goods",
        "Gross Weight",
        "Measurement"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 / 20' DC X 1\nNIL MARKS",
          "125 PACKAGES",
          "FCL STC: VALVE MATERIALS FOR MACHINERY PARTS",
          "18,000.000 KGS",
          "24.000 CBM"
        ]
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
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "termsLines": [
        "DRAFT — Not negotiable unless marked original.",
        "STC: VALVE MATERIALS FOR MACHINERY PARTS"
      ],
      "remarks": "Format-86"
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "formatBadge",
        "label": "Format-86"
      },
      {
        "type": "docTitle",
        "text": "HOUSE BILL OF LADING — DRAFT FORMAT 86",
        "align": "end",
        "band": true
      },
      {
        "type": "partyNotifyGrid"
      },
      {
        "type": "fieldGrid",
        "cols": 2
      },
      {
        "type": "hblCargoTable"
      },
      {
        "type": "hblFreightSignature"
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
    "code": "HBL_DRAFT_REPORT_FORMAT_87",
    "formatNumber": 63,
    "name": "HBL Draft Report Format-87",
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
      "company": "KingFisher Wings",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "inquiry@kingfishertec.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "PLMAAJEA00081",
      "invoiceDate": "28-JAN-19",
      "formatBadgeLabel": "Format-87",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Booking Ref.",
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
          "k": "Service Type",
          "v": "FCL"
        },
        {
          "k": "Freight",
          "v": "PREPAID"
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
          "v": "HBL Draft Report Format-87"
        }
      ],
      "hblCargoHeaders": [
        "Container No. / Seal No. / Mark & No.",
        "No. of Pkgs",
        "Description of Goods",
        "Gross Weight",
        "Measurement"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 / 20' DC X 1\nNIL MARKS",
          "125 PACKAGES",
          "FCL STC: VALVE MATERIALS FOR MACHINERY PARTS",
          "18,000.000 KGS",
          "24.000 CBM"
        ]
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
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "termsLines": [
        "DRAFT — Not negotiable unless marked original.",
        "STC: VALVE MATERIALS FOR MACHINERY PARTS"
      ],
      "remarks": "Format-87"
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "formatBadge",
        "label": "Format-87"
      },
      {
        "type": "docTitle",
        "text": "HOUSE BILL OF LADING — DRAFT FORMAT 87",
        "align": "center",
        "band": false
      },
      {
        "type": "partyNotifyGrid"
      },
      {
        "type": "fieldGrid",
        "cols": 3
      },
      {
        "type": "hblCargoTable"
      },
      {
        "type": "hblFreightSignature"
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
    "code": "FG_HBL_ORIGINAL_FORMAT_87",
    "formatNumber": 64,
    "name": "FG HBL Original Format-87",
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
      "company": "KingFisher Wings",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "inquiry@kingfishertec.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "PLMAAJEA00081",
      "invoiceDate": "28-JAN-19",
      "formatBadgeLabel": "Original Format-87",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Booking Ref.",
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
          "k": "Service Type",
          "v": "FCL"
        },
        {
          "k": "Freight",
          "v": "PREPAID"
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
          "v": "FG HBL Original Format-87"
        },
        {
          "k": "Document Type",
          "v": "ORIGINAL"
        }
      ],
      "hblCargoHeaders": [
        "Container No. / Seal No. / Mark & No.",
        "No. of Pkgs",
        "Description of Goods",
        "Gross Weight",
        "Measurement"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 / 20' DC X 1\nNIL MARKS",
          "125 PACKAGES",
          "FCL STC: VALVE MATERIALS FOR MACHINERY PARTS",
          "18,000.000 KGS",
          "24.000 CBM"
        ]
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
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "termsLines": [
        "ORIGINAL — Negotiable when duly endorsed.",
        "FG HBL original sample (Format-87).",
        "STC: VALVE MATERIALS FOR MACHINERY PARTS"
      ],
      "remarks": "Original Format-87"
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "formatBadge",
        "label": "Original Format-87"
      },
      {
        "type": "docTitle",
        "text": "HOUSE BILL OF LADING — ORIGINAL FORMAT 87",
        "align": "center",
        "band": true
      },
      {
        "type": "partyNotifyGrid"
      },
      {
        "type": "fieldGrid",
        "cols": 2
      },
      {
        "type": "hblCargoTable"
      },
      {
        "type": "hblFreightSignature"
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
    "code": "HBL_DRAFT_REPORT_FORMAT_88",
    "formatNumber": 66,
    "name": "HBL Draft Report Format-88",
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
      "company": "KingFisher Wings",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "inquiry@kingfishertec.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "PLMAAJEA00081",
      "invoiceDate": "28-JAN-19",
      "formatBadgeLabel": "Format-88",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Booking Ref.",
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
          "k": "Service Type",
          "v": "FCL"
        },
        {
          "k": "Freight",
          "v": "PREPAID"
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
          "v": "HBL Draft Report Format-88"
        }
      ],
      "hblCargoHeaders": [
        "Container No. / Seal No. / Mark & No.",
        "No. of Pkgs",
        "Description of Goods",
        "Gross Weight",
        "Measurement"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 / 20' DC X 1\nNIL MARKS",
          "125 PACKAGES",
          "FCL STC: VALVE MATERIALS FOR MACHINERY PARTS",
          "18,000.000 KGS",
          "24.000 CBM"
        ]
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
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "termsLines": [
        "DRAFT — Not negotiable unless marked original.",
        "STC: VALVE MATERIALS FOR MACHINERY PARTS"
      ],
      "remarks": "Format-88"
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "formatBadge",
        "label": "Format-88"
      },
      {
        "type": "docTitle",
        "text": "HOUSE BILL OF LADING — DRAFT FORMAT 88",
        "align": "start",
        "band": true
      },
      {
        "type": "partyNotifyGrid"
      },
      {
        "type": "fieldGrid",
        "cols": 2
      },
      {
        "type": "hblCargoTable"
      },
      {
        "type": "hblFreightSignature"
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
    "code": "HBL_DRAFT_REPORT_FORMAT_89",
    "formatNumber": 67,
    "name": "HBL Draft Report Format-89",
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
      "company": "KingFisher Wings",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "inquiry@kingfishertec.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "PLMAAJEA00081",
      "invoiceDate": "28-JAN-19",
      "formatBadgeLabel": "Format-89",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Booking Ref.",
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
          "k": "Service Type",
          "v": "FCL"
        },
        {
          "k": "Freight",
          "v": "PREPAID"
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
          "v": "HBL Draft Report Format-89"
        }
      ],
      "hblCargoHeaders": [
        "Container No. / Seal No. / Mark & No.",
        "No. of Pkgs",
        "Description of Goods",
        "Gross Weight",
        "Measurement"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 / 20' DC X 1\nNIL MARKS",
          "125 PACKAGES",
          "FCL STC: VALVE MATERIALS FOR MACHINERY PARTS",
          "18,000.000 KGS",
          "24.000 CBM"
        ]
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
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "termsLines": [
        "DRAFT — Not negotiable unless marked original.",
        "STC: VALVE MATERIALS FOR MACHINERY PARTS"
      ],
      "remarks": "Format-89"
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "formatBadge",
        "label": "Format-89"
      },
      {
        "type": "docTitle",
        "text": "HOUSE BILL OF LADING — DRAFT FORMAT 89",
        "align": "end",
        "band": false
      },
      {
        "type": "partyNotifyGrid"
      },
      {
        "type": "fieldGrid",
        "cols": 3
      },
      {
        "type": "hblCargoTable"
      },
      {
        "type": "hblFreightSignature"
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
    "code": "HBL_DRAFT_REPORT_FORMAT_90",
    "formatNumber": 68,
    "name": "HBL Draft Report Format-90",
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
      "company": "KingFisher Wings",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "inquiry@kingfishertec.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "PLMAAJEA00081",
      "invoiceDate": "28-JAN-19",
      "formatBadgeLabel": "Format-90",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Booking Ref.",
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
          "k": "Service Type",
          "v": "FCL"
        },
        {
          "k": "Freight",
          "v": "PREPAID"
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
          "v": "HBL Draft Report Format-90"
        }
      ],
      "hblCargoHeaders": [
        "Container No. / Seal No. / Mark & No.",
        "No. of Pkgs",
        "Description of Goods",
        "Gross Weight",
        "Measurement"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 / 20' DC X 1\nNIL MARKS",
          "125 PACKAGES",
          "FCL STC: VALVE MATERIALS FOR MACHINERY PARTS",
          "18,000.000 KGS",
          "24.000 CBM"
        ]
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
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "termsLines": [
        "DRAFT — Not negotiable unless marked original.",
        "STC: VALVE MATERIALS FOR MACHINERY PARTS"
      ],
      "remarks": "Format-90"
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "formatBadge",
        "label": "Format-90"
      },
      {
        "type": "docTitle",
        "text": "HOUSE BILL OF LADING — DRAFT FORMAT 90",
        "align": "center",
        "band": true
      },
      {
        "type": "partyNotifyGrid"
      },
      {
        "type": "fieldGrid",
        "cols": 2
      },
      {
        "type": "hblCargoTable"
      },
      {
        "type": "hblFreightSignature"
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
    "code": "HBL_DRAFT_REPORT_FORMAT_92",
    "formatNumber": 69,
    "name": "HBL Draft Report Format-92",
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
      "company": "KingFisher Wings",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "inquiry@kingfishertec.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "PLMAAJEA00081",
      "invoiceDate": "28-JAN-19",
      "formatBadgeLabel": "Format-92",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Booking Ref.",
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
          "k": "Service Type",
          "v": "FCL"
        },
        {
          "k": "Freight",
          "v": "PREPAID"
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
          "v": "HBL Draft Report Format-92"
        }
      ],
      "hblCargoHeaders": [
        "Container No. / Seal No. / Mark & No.",
        "No. of Pkgs",
        "Description of Goods",
        "Gross Weight",
        "Measurement"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 / 20' DC X 1\nNIL MARKS",
          "125 PACKAGES",
          "FCL STC: VALVE MATERIALS FOR MACHINERY PARTS",
          "18,000.000 KGS",
          "24.000 CBM"
        ]
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
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "termsLines": [
        "DRAFT — Not negotiable unless marked original.",
        "STC: VALVE MATERIALS FOR MACHINERY PARTS"
      ],
      "remarks": "Format-92"
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "formatBadge",
        "label": "Format-92"
      },
      {
        "type": "docTitle",
        "text": "HOUSE BILL OF LADING — DRAFT FORMAT 92",
        "align": "end",
        "band": true
      },
      {
        "type": "partyNotifyGrid"
      },
      {
        "type": "fieldGrid",
        "cols": 2
      },
      {
        "type": "hblCargoTable"
      },
      {
        "type": "hblFreightSignature"
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
    "code": "HBL_DRAFT_REPORT_FORMAT_95",
    "formatNumber": 70,
    "name": "HBL Draft Report Format-95",
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
      "company": "KingFisher Wings",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "inquiry@kingfishertec.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "PLMAAJEA00081",
      "invoiceDate": "28-JAN-19",
      "formatBadgeLabel": "Format-95",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Booking Ref.",
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
          "k": "Service Type",
          "v": "FCL"
        },
        {
          "k": "Freight",
          "v": "PREPAID"
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
          "v": "HBL Draft Report Format-95"
        }
      ],
      "hblCargoHeaders": [
        "Container No. / Seal No. / Mark & No.",
        "No. of Pkgs",
        "Description of Goods",
        "Gross Weight",
        "Measurement"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 / 20' DC X 1\nNIL MARKS",
          "125 PACKAGES",
          "FCL STC: VALVE MATERIALS FOR MACHINERY PARTS",
          "18,000.000 KGS",
          "24.000 CBM"
        ]
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
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "termsLines": [
        "DRAFT — Not negotiable unless marked original.",
        "STC: VALVE MATERIALS FOR MACHINERY PARTS"
      ],
      "remarks": "Format-95"
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "formatBadge",
        "label": "Format-95"
      },
      {
        "type": "docTitle",
        "text": "HOUSE BILL OF LADING — DRAFT FORMAT 95",
        "align": "end",
        "band": false
      },
      {
        "type": "partyNotifyGrid"
      },
      {
        "type": "fieldGrid",
        "cols": 3
      },
      {
        "type": "hblCargoTable"
      },
      {
        "type": "hblFreightSignature"
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
    "code": "HBL_DRAFT_REPORT_FORMAT_96",
    "formatNumber": 71,
    "name": "HBL Draft Report Format-96",
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
      "company": "KingFisher Wings",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "inquiry@kingfishertec.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "PLMAAJEA00081",
      "invoiceDate": "28-JAN-19",
      "formatBadgeLabel": "Format-96",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Booking Ref.",
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
          "k": "Service Type",
          "v": "FCL"
        },
        {
          "k": "Freight",
          "v": "PREPAID"
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
          "v": "HBL Draft Report Format-96"
        }
      ],
      "hblCargoHeaders": [
        "Container No. / Seal No. / Mark & No.",
        "No. of Pkgs",
        "Description of Goods",
        "Gross Weight",
        "Measurement"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 / 20' DC X 1\nNIL MARKS",
          "125 PACKAGES",
          "FCL STC: VALVE MATERIALS FOR MACHINERY PARTS",
          "18,000.000 KGS",
          "24.000 CBM"
        ]
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
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "termsLines": [
        "DRAFT — Not negotiable unless marked original.",
        "STC: VALVE MATERIALS FOR MACHINERY PARTS"
      ],
      "remarks": "Format-96"
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "formatBadge",
        "label": "Format-96"
      },
      {
        "type": "docTitle",
        "text": "HOUSE BILL OF LADING — DRAFT FORMAT 96",
        "align": "center",
        "band": true
      },
      {
        "type": "partyNotifyGrid"
      },
      {
        "type": "fieldGrid",
        "cols": 2
      },
      {
        "type": "hblCargoTable"
      },
      {
        "type": "hblFreightSignature"
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
    "code": "HBL_DRAFT_REPORT_FORMAT_97",
    "formatNumber": 72,
    "name": "HBL Draft Report Format-97",
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
      "company": "KingFisher Wings",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "inquiry@kingfishertec.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "PLMAAJEA00081",
      "invoiceDate": "28-JAN-19",
      "formatBadgeLabel": "Format-97",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Booking Ref.",
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
          "k": "Service Type",
          "v": "FCL"
        },
        {
          "k": "Freight",
          "v": "PREPAID"
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
          "v": "HBL Draft Report Format-97"
        }
      ],
      "hblCargoHeaders": [
        "Container No. / Seal No. / Mark & No.",
        "No. of Pkgs",
        "Description of Goods",
        "Gross Weight",
        "Measurement"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 / 20' DC X 1\nNIL MARKS",
          "125 PACKAGES",
          "FCL STC: VALVE MATERIALS FOR MACHINERY PARTS",
          "18,000.000 KGS",
          "24.000 CBM"
        ]
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
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "termsLines": [
        "DRAFT — Not negotiable unless marked original.",
        "STC: VALVE MATERIALS FOR MACHINERY PARTS"
      ],
      "remarks": "Format-97"
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "formatBadge",
        "label": "Format-97"
      },
      {
        "type": "docTitle",
        "text": "HOUSE BILL OF LADING — DRAFT FORMAT 97",
        "align": "start",
        "band": false
      },
      {
        "type": "partyNotifyGrid"
      },
      {
        "type": "fieldGrid",
        "cols": 3
      },
      {
        "type": "hblCargoTable"
      },
      {
        "type": "hblFreightSignature"
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
    "code": "HBL_DRAFT_REPORT_FORMAT_99",
    "formatNumber": 73,
    "name": "HBL Draft Report Format-99",
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
      "company": "KingFisher Wings",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "inquiry@kingfishertec.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "PLMAAJEA00081",
      "invoiceDate": "28-JAN-19",
      "formatBadgeLabel": "Format-99",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Booking Ref.",
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
          "k": "Service Type",
          "v": "FCL"
        },
        {
          "k": "Freight",
          "v": "PREPAID"
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
          "v": "HBL Draft Report Format-99"
        }
      ],
      "hblCargoHeaders": [
        "Container No. / Seal No. / Mark & No.",
        "No. of Pkgs",
        "Description of Goods",
        "Gross Weight",
        "Measurement"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 / 20' DC X 1\nNIL MARKS",
          "125 PACKAGES",
          "FCL STC: VALVE MATERIALS FOR MACHINERY PARTS",
          "18,000.000 KGS",
          "24.000 CBM"
        ]
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
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "termsLines": [
        "DRAFT — Not negotiable unless marked original.",
        "STC: VALVE MATERIALS FOR MACHINERY PARTS"
      ],
      "remarks": "Format-99"
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "formatBadge",
        "label": "Format-99"
      },
      {
        "type": "docTitle",
        "text": "HOUSE BILL OF LADING — DRAFT FORMAT 99",
        "align": "center",
        "band": false
      },
      {
        "type": "partyNotifyGrid"
      },
      {
        "type": "fieldGrid",
        "cols": 3
      },
      {
        "type": "hblCargoTable"
      },
      {
        "type": "hblFreightSignature"
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
    "code": "HBL_DRAFT_REPORT_FORMAT_100",
    "formatNumber": 74,
    "name": "HBL Draft Report Format-100",
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
      "company": "KingFisher Wings",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "inquiry@kingfishertec.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "PLMAAJEA00081",
      "invoiceDate": "28-JAN-19",
      "formatBadgeLabel": "Format-100",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Booking Ref.",
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
          "k": "Service Type",
          "v": "FCL"
        },
        {
          "k": "Freight",
          "v": "PREPAID"
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
          "v": "HBL Draft Report Format-100"
        }
      ],
      "hblCargoHeaders": [
        "Container No. / Seal No. / Mark & No.",
        "No. of Pkgs",
        "Description of Goods",
        "Gross Weight",
        "Measurement"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 / 20' DC X 1\nNIL MARKS",
          "125 PACKAGES",
          "FCL STC: VALVE MATERIALS FOR MACHINERY PARTS",
          "18,000.000 KGS",
          "24.000 CBM"
        ]
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
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "termsLines": [
        "DRAFT — Not negotiable unless marked original.",
        "STC: VALVE MATERIALS FOR MACHINERY PARTS"
      ],
      "remarks": "Format-100"
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "formatBadge",
        "label": "Format-100"
      },
      {
        "type": "docTitle",
        "text": "HOUSE BILL OF LADING — DRAFT FORMAT 100",
        "align": "start",
        "band": true
      },
      {
        "type": "partyNotifyGrid"
      },
      {
        "type": "fieldGrid",
        "cols": 2
      },
      {
        "type": "hblCargoTable"
      },
      {
        "type": "hblFreightSignature"
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
    "code": "HBL_DRAFT_REPORT_FORMAT_101",
    "formatNumber": 75,
    "name": "HBL Draft Report Format-101",
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
      "company": "KingFisher Wings",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "inquiry@kingfishertec.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "PLMAAJEA00081",
      "invoiceDate": "28-JAN-19",
      "formatBadgeLabel": "Format-101",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Booking Ref.",
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
          "k": "Service Type",
          "v": "FCL"
        },
        {
          "k": "Freight",
          "v": "PREPAID"
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
          "v": "HBL Draft Report Format-101"
        }
      ],
      "hblCargoHeaders": [
        "Container No. / Seal No. / Mark & No.",
        "No. of Pkgs",
        "Description of Goods",
        "Gross Weight",
        "Measurement"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 / 20' DC X 1\nNIL MARKS",
          "125 PACKAGES",
          "FCL STC: VALVE MATERIALS FOR MACHINERY PARTS",
          "18,000.000 KGS",
          "24.000 CBM"
        ]
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
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "termsLines": [
        "DRAFT — Not negotiable unless marked original.",
        "STC: VALVE MATERIALS FOR MACHINERY PARTS"
      ],
      "remarks": "Format-101"
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "formatBadge",
        "label": "Format-101"
      },
      {
        "type": "docTitle",
        "text": "HOUSE BILL OF LADING — DRAFT FORMAT 101",
        "align": "end",
        "band": false
      },
      {
        "type": "partyNotifyGrid"
      },
      {
        "type": "fieldGrid",
        "cols": 3
      },
      {
        "type": "hblCargoTable"
      },
      {
        "type": "hblFreightSignature"
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
    "code": "HBL_DRAFT_REPORT_FORMAT_102",
    "formatNumber": 76,
    "name": "HBL Draft Report Format-102",
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
      "company": "KingFisher Wings",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "inquiry@kingfishertec.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "PLMAAJEA00081",
      "invoiceDate": "28-JAN-19",
      "formatBadgeLabel": "Format-102",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Booking Ref.",
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
          "k": "Service Type",
          "v": "FCL"
        },
        {
          "k": "Freight",
          "v": "PREPAID"
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
          "v": "HBL Draft Report Format-102"
        }
      ],
      "hblCargoHeaders": [
        "Container No. / Seal No. / Mark & No.",
        "No. of Pkgs",
        "Description of Goods",
        "Gross Weight",
        "Measurement"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 / 20' DC X 1\nNIL MARKS",
          "125 PACKAGES",
          "FCL STC: VALVE MATERIALS FOR MACHINERY PARTS",
          "18,000.000 KGS",
          "24.000 CBM"
        ]
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
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "termsLines": [
        "DRAFT — Not negotiable unless marked original.",
        "STC: VALVE MATERIALS FOR MACHINERY PARTS"
      ],
      "remarks": "Format-102"
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "formatBadge",
        "label": "Format-102"
      },
      {
        "type": "docTitle",
        "text": "HOUSE BILL OF LADING — DRAFT FORMAT 102",
        "align": "center",
        "band": true
      },
      {
        "type": "partyNotifyGrid"
      },
      {
        "type": "fieldGrid",
        "cols": 2
      },
      {
        "type": "hblCargoTable"
      },
      {
        "type": "hblFreightSignature"
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
    "code": "HBL_DRAFT_REPORT_FORMAT_107",
    "formatNumber": 77,
    "name": "HBL Draft Report Format-107",
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
      "company": "KingFisher Wings",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "inquiry@kingfishertec.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "PLMAAJEA00081",
      "invoiceDate": "28-JAN-19",
      "formatBadgeLabel": "Format-107",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Booking Ref.",
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
          "k": "Service Type",
          "v": "FCL"
        },
        {
          "k": "Freight",
          "v": "PREPAID"
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
          "v": "HBL Draft Report Format-107"
        }
      ],
      "hblCargoHeaders": [
        "Container No. / Seal No. / Mark & No.",
        "No. of Pkgs",
        "Description of Goods",
        "Gross Weight",
        "Measurement"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 / 20' DC X 1\nNIL MARKS",
          "125 PACKAGES",
          "FCL STC: VALVE MATERIALS FOR MACHINERY PARTS",
          "18,000.000 KGS",
          "24.000 CBM"
        ]
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
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "termsLines": [
        "DRAFT — Not negotiable unless marked original.",
        "STC: VALVE MATERIALS FOR MACHINERY PARTS"
      ],
      "remarks": "Format-107"
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "formatBadge",
        "label": "Format-107"
      },
      {
        "type": "docTitle",
        "text": "HOUSE BILL OF LADING — DRAFT FORMAT 107",
        "align": "end",
        "band": false
      },
      {
        "type": "partyNotifyGrid"
      },
      {
        "type": "fieldGrid",
        "cols": 3
      },
      {
        "type": "hblCargoTable"
      },
      {
        "type": "hblFreightSignature"
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
    "code": "HBL_DRAFT_REPORT_FORMAT_109",
    "formatNumber": 78,
    "name": "HBL Draft Report Format-109",
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
      "company": "KingFisher Wings",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "inquiry@kingfishertec.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "PLMAAJEA00081",
      "invoiceDate": "28-JAN-19",
      "formatBadgeLabel": "Format-109",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Booking Ref.",
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
          "k": "Service Type",
          "v": "FCL"
        },
        {
          "k": "Freight",
          "v": "PREPAID"
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
          "v": "HBL Draft Report Format-109"
        }
      ],
      "hblCargoHeaders": [
        "Container No. / Seal No. / Mark & No.",
        "No. of Pkgs",
        "Description of Goods",
        "Gross Weight",
        "Measurement"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 / 20' DC X 1\nNIL MARKS",
          "125 PACKAGES",
          "FCL STC: VALVE MATERIALS FOR MACHINERY PARTS",
          "18,000.000 KGS",
          "24.000 CBM"
        ]
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
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "termsLines": [
        "DRAFT — Not negotiable unless marked original.",
        "STC: VALVE MATERIALS FOR MACHINERY PARTS"
      ],
      "remarks": "Format-109"
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "formatBadge",
        "label": "Format-109"
      },
      {
        "type": "docTitle",
        "text": "HOUSE BILL OF LADING — DRAFT FORMAT 109",
        "align": "start",
        "band": false
      },
      {
        "type": "partyNotifyGrid"
      },
      {
        "type": "fieldGrid",
        "cols": 3
      },
      {
        "type": "hblCargoTable"
      },
      {
        "type": "hblFreightSignature"
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
    "code": "HBL_DRAFT_REPORT_FORMAT_114",
    "formatNumber": 79,
    "name": "HBL Draft Report Format-114",
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
      "company": "KingFisher Wings",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "inquiry@kingfishertec.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "PLMAAJEA00081",
      "invoiceDate": "28-JAN-19",
      "formatBadgeLabel": "Format-114",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Booking Ref.",
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
          "k": "Service Type",
          "v": "FCL"
        },
        {
          "k": "Freight",
          "v": "PREPAID"
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
          "v": "HBL Draft Report Format-114"
        }
      ],
      "hblCargoHeaders": [
        "Container No. / Seal No. / Mark & No.",
        "No. of Pkgs",
        "Description of Goods",
        "Gross Weight",
        "Measurement"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 / 20' DC X 1\nNIL MARKS",
          "125 PACKAGES",
          "FCL STC: VALVE MATERIALS FOR MACHINERY PARTS",
          "18,000.000 KGS",
          "24.000 CBM"
        ]
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
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "termsLines": [
        "DRAFT — Not negotiable unless marked original.",
        "STC: VALVE MATERIALS FOR MACHINERY PARTS"
      ],
      "remarks": "Format-114"
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "formatBadge",
        "label": "Format-114"
      },
      {
        "type": "docTitle",
        "text": "HOUSE BILL OF LADING — DRAFT FORMAT 114",
        "align": "center",
        "band": true
      },
      {
        "type": "partyNotifyGrid"
      },
      {
        "type": "fieldGrid",
        "cols": 2
      },
      {
        "type": "hblCargoTable"
      },
      {
        "type": "hblFreightSignature"
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
    "code": "HBL_DRAFT_REPORT_FORMAT_116",
    "formatNumber": 80,
    "name": "HBL Draft Report Format-116",
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
      "company": "KingFisher Wings",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "inquiry@kingfishertec.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "PLMAAJEA00081",
      "invoiceDate": "28-JAN-19",
      "formatBadgeLabel": "Format-116",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Booking Ref.",
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
          "k": "Service Type",
          "v": "FCL"
        },
        {
          "k": "Freight",
          "v": "PREPAID"
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
          "v": "HBL Draft Report Format-116"
        }
      ],
      "hblCargoHeaders": [
        "Container No. / Seal No. / Mark & No.",
        "No. of Pkgs",
        "Description of Goods",
        "Gross Weight",
        "Measurement"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 / 20' DC X 1\nNIL MARKS",
          "125 PACKAGES",
          "FCL STC: VALVE MATERIALS FOR MACHINERY PARTS",
          "18,000.000 KGS",
          "24.000 CBM"
        ]
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
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "termsLines": [
        "DRAFT — Not negotiable unless marked original.",
        "STC: VALVE MATERIALS FOR MACHINERY PARTS"
      ],
      "remarks": "Format-116"
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "formatBadge",
        "label": "Format-116"
      },
      {
        "type": "docTitle",
        "text": "HOUSE BILL OF LADING — DRAFT FORMAT 116",
        "align": "end",
        "band": true
      },
      {
        "type": "partyNotifyGrid"
      },
      {
        "type": "fieldGrid",
        "cols": 2
      },
      {
        "type": "hblCargoTable"
      },
      {
        "type": "hblFreightSignature"
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
    "code": "HBL_DRAFT_REPORT_FORMAT_117",
    "formatNumber": 81,
    "name": "HBL Draft Report Format-117",
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
      "company": "KingFisher Wings",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "inquiry@kingfishertec.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "PLMAAJEA00081",
      "invoiceDate": "28-JAN-19",
      "formatBadgeLabel": "Format-117",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Booking Ref.",
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
          "k": "Service Type",
          "v": "FCL"
        },
        {
          "k": "Freight",
          "v": "PREPAID"
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
          "v": "HBL Draft Report Format-117"
        }
      ],
      "hblCargoHeaders": [
        "Container No. / Seal No. / Mark & No.",
        "No. of Pkgs",
        "Description of Goods",
        "Gross Weight",
        "Measurement"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 / 20' DC X 1\nNIL MARKS",
          "125 PACKAGES",
          "FCL STC: VALVE MATERIALS FOR MACHINERY PARTS",
          "18,000.000 KGS",
          "24.000 CBM"
        ]
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
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "termsLines": [
        "DRAFT — Not negotiable unless marked original.",
        "STC: VALVE MATERIALS FOR MACHINERY PARTS"
      ],
      "remarks": "Format-117"
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "formatBadge",
        "label": "Format-117"
      },
      {
        "type": "docTitle",
        "text": "HOUSE BILL OF LADING — DRAFT FORMAT 117",
        "align": "center",
        "band": false
      },
      {
        "type": "partyNotifyGrid"
      },
      {
        "type": "fieldGrid",
        "cols": 3
      },
      {
        "type": "hblCargoTable"
      },
      {
        "type": "hblFreightSignature"
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
    "code": "HBL_DRAFT_REPORT_FORMAT_118",
    "formatNumber": 82,
    "name": "HBL Draft Report Format-118",
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
      "company": "KingFisher Wings",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "inquiry@kingfishertec.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "PLMAAJEA00081",
      "invoiceDate": "28-JAN-19",
      "formatBadgeLabel": "Format-118",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Booking Ref.",
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
          "k": "Service Type",
          "v": "FCL"
        },
        {
          "k": "Freight",
          "v": "PREPAID"
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
          "v": "HBL Draft Report Format-118"
        }
      ],
      "hblCargoHeaders": [
        "Container No. / Seal No. / Mark & No.",
        "No. of Pkgs",
        "Description of Goods",
        "Gross Weight",
        "Measurement"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 / 20' DC X 1\nNIL MARKS",
          "125 PACKAGES",
          "FCL STC: VALVE MATERIALS FOR MACHINERY PARTS",
          "18,000.000 KGS",
          "24.000 CBM"
        ]
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
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "termsLines": [
        "DRAFT — Not negotiable unless marked original.",
        "STC: VALVE MATERIALS FOR MACHINERY PARTS"
      ],
      "remarks": "Format-118"
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "formatBadge",
        "label": "Format-118"
      },
      {
        "type": "docTitle",
        "text": "HOUSE BILL OF LADING — DRAFT FORMAT 118",
        "align": "start",
        "band": true
      },
      {
        "type": "partyNotifyGrid"
      },
      {
        "type": "fieldGrid",
        "cols": 2
      },
      {
        "type": "hblCargoTable"
      },
      {
        "type": "hblFreightSignature"
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
    "code": "HBL_DRAFT_REPORT_FORMAT_120",
    "formatNumber": 83,
    "name": "HBL Draft Report Format-120",
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
      "company": "KingFisher Wings",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "inquiry@kingfishertec.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "PLMAAJEA00081",
      "invoiceDate": "28-JAN-19",
      "formatBadgeLabel": "Format-120",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Booking Ref.",
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
          "k": "Service Type",
          "v": "FCL"
        },
        {
          "k": "Freight",
          "v": "PREPAID"
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
          "v": "HBL Draft Report Format-120"
        }
      ],
      "hblCargoHeaders": [
        "Container No. / Seal No. / Mark & No.",
        "No. of Pkgs",
        "Description of Goods",
        "Gross Weight",
        "Measurement"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 / 20' DC X 1\nNIL MARKS",
          "125 PACKAGES",
          "FCL STC: VALVE MATERIALS FOR MACHINERY PARTS",
          "18,000.000 KGS",
          "24.000 CBM"
        ]
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
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "termsLines": [
        "DRAFT — Not negotiable unless marked original.",
        "STC: VALVE MATERIALS FOR MACHINERY PARTS"
      ],
      "remarks": "Format-120"
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "formatBadge",
        "label": "Format-120"
      },
      {
        "type": "docTitle",
        "text": "HOUSE BILL OF LADING — DRAFT FORMAT 120",
        "align": "center",
        "band": true
      },
      {
        "type": "partyNotifyGrid"
      },
      {
        "type": "fieldGrid",
        "cols": 2
      },
      {
        "type": "hblCargoTable"
      },
      {
        "type": "hblFreightSignature"
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
    "code": "HBL_DRAFT_REPORT_FORMAT_122",
    "formatNumber": 84,
    "name": "HBL Draft Report Format-122",
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
      "company": "KingFisher Wings",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "inquiry@kingfishertec.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "PLMAAJEA00081",
      "invoiceDate": "28-JAN-19",
      "formatBadgeLabel": "Format-122",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Booking Ref.",
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
          "k": "Service Type",
          "v": "FCL"
        },
        {
          "k": "Freight",
          "v": "PREPAID"
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
          "v": "HBL Draft Report Format-122"
        }
      ],
      "hblCargoHeaders": [
        "Container No. / Seal No. / Mark & No.",
        "No. of Pkgs",
        "Description of Goods",
        "Gross Weight",
        "Measurement"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 / 20' DC X 1\nNIL MARKS",
          "125 PACKAGES",
          "FCL STC: VALVE MATERIALS FOR MACHINERY PARTS",
          "18,000.000 KGS",
          "24.000 CBM"
        ]
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
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "termsLines": [
        "DRAFT — Not negotiable unless marked original.",
        "STC: VALVE MATERIALS FOR MACHINERY PARTS"
      ],
      "remarks": "Format-122"
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "formatBadge",
        "label": "Format-122"
      },
      {
        "type": "docTitle",
        "text": "HOUSE BILL OF LADING — DRAFT FORMAT 122",
        "align": "end",
        "band": true
      },
      {
        "type": "partyNotifyGrid"
      },
      {
        "type": "fieldGrid",
        "cols": 2
      },
      {
        "type": "hblCargoTable"
      },
      {
        "type": "hblFreightSignature"
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
    "code": "HBL_DRAFT_REPORT_FORMAT_127",
    "formatNumber": 85,
    "name": "HBL Draft Report Format-127",
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
      "company": "KingFisher Wings",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "inquiry@kingfishertec.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "PLMAAJEA00081",
      "invoiceDate": "28-JAN-19",
      "formatBadgeLabel": "Format-127",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Booking Ref.",
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
          "k": "Service Type",
          "v": "FCL"
        },
        {
          "k": "Freight",
          "v": "PREPAID"
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
          "v": "HBL Draft Report Format-127"
        }
      ],
      "hblCargoHeaders": [
        "Container No. / Seal No. / Mark & No.",
        "No. of Pkgs",
        "Description of Goods",
        "Gross Weight",
        "Measurement"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 / 20' DC X 1\nNIL MARKS",
          "125 PACKAGES",
          "FCL STC: VALVE MATERIALS FOR MACHINERY PARTS",
          "18,000.000 KGS",
          "24.000 CBM"
        ]
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
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "termsLines": [
        "DRAFT — Not negotiable unless marked original.",
        "STC: VALVE MATERIALS FOR MACHINERY PARTS"
      ],
      "remarks": "Format-127"
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "formatBadge",
        "label": "Format-127"
      },
      {
        "type": "docTitle",
        "text": "HOUSE BILL OF LADING — DRAFT FORMAT 127",
        "align": "start",
        "band": false
      },
      {
        "type": "partyNotifyGrid"
      },
      {
        "type": "fieldGrid",
        "cols": 3
      },
      {
        "type": "hblCargoTable"
      },
      {
        "type": "hblFreightSignature"
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
    "code": "HBL_DRAFT_REPORT_FORMAT_128",
    "formatNumber": 86,
    "name": "HBL Draft Report Format-128",
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
      "company": "KingFisher Wings",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "inquiry@kingfishertec.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "PLMAAJEA00081",
      "invoiceDate": "28-JAN-19",
      "formatBadgeLabel": "Format-128",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Booking Ref.",
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
          "k": "Service Type",
          "v": "FCL"
        },
        {
          "k": "Freight",
          "v": "PREPAID"
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
          "v": "HBL Draft Report Format-128"
        }
      ],
      "hblCargoHeaders": [
        "Container No. / Seal No. / Mark & No.",
        "No. of Pkgs",
        "Description of Goods",
        "Gross Weight",
        "Measurement"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 / 20' DC X 1\nNIL MARKS",
          "125 PACKAGES",
          "FCL STC: VALVE MATERIALS FOR MACHINERY PARTS",
          "18,000.000 KGS",
          "24.000 CBM"
        ]
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
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "termsLines": [
        "DRAFT — Not negotiable unless marked original.",
        "STC: VALVE MATERIALS FOR MACHINERY PARTS"
      ],
      "remarks": "Format-128"
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "formatBadge",
        "label": "Format-128"
      },
      {
        "type": "docTitle",
        "text": "HOUSE BILL OF LADING — DRAFT FORMAT 128",
        "align": "end",
        "band": true
      },
      {
        "type": "partyNotifyGrid"
      },
      {
        "type": "fieldGrid",
        "cols": 2
      },
      {
        "type": "hblCargoTable"
      },
      {
        "type": "hblFreightSignature"
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
    "code": "HBL_DRAFT_REPORT_FORMAT_129",
    "formatNumber": 87,
    "name": "HBL Draft Report Format-129",
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
      "company": "KingFisher Wings",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "inquiry@kingfishertec.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "PLMAAJEA00081",
      "invoiceDate": "28-JAN-19",
      "formatBadgeLabel": "Format-129",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Booking Ref.",
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
          "k": "Service Type",
          "v": "FCL"
        },
        {
          "k": "Freight",
          "v": "PREPAID"
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
          "v": "HBL Draft Report Format-129"
        }
      ],
      "hblCargoHeaders": [
        "Container No. / Seal No. / Mark & No.",
        "No. of Pkgs",
        "Description of Goods",
        "Gross Weight",
        "Measurement"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 / 20' DC X 1\nNIL MARKS",
          "125 PACKAGES",
          "FCL STC: VALVE MATERIALS FOR MACHINERY PARTS",
          "18,000.000 KGS",
          "24.000 CBM"
        ]
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
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "termsLines": [
        "DRAFT — Not negotiable unless marked original.",
        "STC: VALVE MATERIALS FOR MACHINERY PARTS"
      ],
      "remarks": "Format-129"
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "formatBadge",
        "label": "Format-129"
      },
      {
        "type": "docTitle",
        "text": "HOUSE BILL OF LADING — DRAFT FORMAT 129",
        "align": "center",
        "band": false
      },
      {
        "type": "partyNotifyGrid"
      },
      {
        "type": "fieldGrid",
        "cols": 3
      },
      {
        "type": "hblCargoTable"
      },
      {
        "type": "hblFreightSignature"
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
    "code": "HBL_DRAFT_REPORT_FORMAT_130",
    "formatNumber": 88,
    "name": "HBL Draft Report Format-130",
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
      "company": "KingFisher Wings",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "inquiry@kingfishertec.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "PLMAAJEA00081",
      "invoiceDate": "28-JAN-19",
      "formatBadgeLabel": "Format-130",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Booking Ref.",
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
          "k": "Service Type",
          "v": "FCL"
        },
        {
          "k": "Freight",
          "v": "PREPAID"
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
          "v": "HBL Draft Report Format-130"
        }
      ],
      "hblCargoHeaders": [
        "Container No. / Seal No. / Mark & No.",
        "No. of Pkgs",
        "Description of Goods",
        "Gross Weight",
        "Measurement"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 / 20' DC X 1\nNIL MARKS",
          "125 PACKAGES",
          "FCL STC: VALVE MATERIALS FOR MACHINERY PARTS",
          "18,000.000 KGS",
          "24.000 CBM"
        ]
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
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "termsLines": [
        "DRAFT — Not negotiable unless marked original.",
        "STC: VALVE MATERIALS FOR MACHINERY PARTS"
      ],
      "remarks": "Format-130"
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "formatBadge",
        "label": "Format-130"
      },
      {
        "type": "docTitle",
        "text": "HOUSE BILL OF LADING — DRAFT FORMAT 130",
        "align": "start",
        "band": true
      },
      {
        "type": "partyNotifyGrid"
      },
      {
        "type": "fieldGrid",
        "cols": 2
      },
      {
        "type": "hblCargoTable"
      },
      {
        "type": "hblFreightSignature"
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
    "code": "HBL_DRAFT_REPORT_FORMAT_132",
    "formatNumber": 89,
    "name": "HBL Draft Report Format-132",
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
      "company": "KingFisher Wings",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "inquiry@kingfishertec.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "PLMAAJEA00081",
      "invoiceDate": "28-JAN-19",
      "formatBadgeLabel": "Format-132",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Booking Ref.",
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
          "k": "Service Type",
          "v": "FCL"
        },
        {
          "k": "Freight",
          "v": "PREPAID"
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
          "v": "HBL Draft Report Format-132"
        }
      ],
      "hblCargoHeaders": [
        "Container No. / Seal No. / Mark & No.",
        "No. of Pkgs",
        "Description of Goods",
        "Gross Weight",
        "Measurement"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 / 20' DC X 1\nNIL MARKS",
          "125 PACKAGES",
          "FCL STC: VALVE MATERIALS FOR MACHINERY PARTS",
          "18,000.000 KGS",
          "24.000 CBM"
        ]
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
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "termsLines": [
        "DRAFT — Not negotiable unless marked original.",
        "STC: VALVE MATERIALS FOR MACHINERY PARTS"
      ],
      "remarks": "Format-132"
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "formatBadge",
        "label": "Format-132"
      },
      {
        "type": "docTitle",
        "text": "HOUSE BILL OF LADING — DRAFT FORMAT 132",
        "align": "center",
        "band": true
      },
      {
        "type": "partyNotifyGrid"
      },
      {
        "type": "fieldGrid",
        "cols": 2
      },
      {
        "type": "hblCargoTable"
      },
      {
        "type": "hblFreightSignature"
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
    "code": "HBL_DRAFT_REPORT_FORMAT_134",
    "formatNumber": 90,
    "name": "HBL Draft Report Format-134",
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
      "company": "KingFisher Wings",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "inquiry@kingfishertec.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "PLMAAJEA00081",
      "invoiceDate": "28-JAN-19",
      "formatBadgeLabel": "Format-134",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Booking Ref.",
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
          "k": "Service Type",
          "v": "FCL"
        },
        {
          "k": "Freight",
          "v": "PREPAID"
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
          "v": "HBL Draft Report Format-134"
        }
      ],
      "hblCargoHeaders": [
        "Container No. / Seal No. / Mark & No.",
        "No. of Pkgs",
        "Description of Goods",
        "Gross Weight",
        "Measurement"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 / 20' DC X 1\nNIL MARKS",
          "125 PACKAGES",
          "FCL STC: VALVE MATERIALS FOR MACHINERY PARTS",
          "18,000.000 KGS",
          "24.000 CBM"
        ]
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
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "termsLines": [
        "DRAFT — Not negotiable unless marked original.",
        "STC: VALVE MATERIALS FOR MACHINERY PARTS"
      ],
      "remarks": "Format-134"
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "formatBadge",
        "label": "Format-134"
      },
      {
        "type": "docTitle",
        "text": "HOUSE BILL OF LADING — DRAFT FORMAT 134",
        "align": "end",
        "band": true
      },
      {
        "type": "partyNotifyGrid"
      },
      {
        "type": "fieldGrid",
        "cols": 2
      },
      {
        "type": "hblCargoTable"
      },
      {
        "type": "hblFreightSignature"
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
    "code": "HBL_DRAFT_REPORT_FORMAT_135",
    "formatNumber": 91,
    "name": "HBL Draft Report Format-135",
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
      "company": "KingFisher Wings",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "inquiry@kingfishertec.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "PLMAAJEA00081",
      "invoiceDate": "28-JAN-19",
      "formatBadgeLabel": "Format-135",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Booking Ref.",
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
          "k": "Service Type",
          "v": "FCL"
        },
        {
          "k": "Freight",
          "v": "PREPAID"
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
          "v": "HBL Draft Report Format-135"
        }
      ],
      "hblCargoHeaders": [
        "Container No. / Seal No. / Mark & No.",
        "No. of Pkgs",
        "Description of Goods",
        "Gross Weight",
        "Measurement"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 / 20' DC X 1\nNIL MARKS",
          "125 PACKAGES",
          "FCL STC: VALVE MATERIALS FOR MACHINERY PARTS",
          "18,000.000 KGS",
          "24.000 CBM"
        ]
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
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "termsLines": [
        "DRAFT — Not negotiable unless marked original.",
        "STC: VALVE MATERIALS FOR MACHINERY PARTS"
      ],
      "remarks": "Format-135"
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "formatBadge",
        "label": "Format-135"
      },
      {
        "type": "docTitle",
        "text": "HOUSE BILL OF LADING — DRAFT FORMAT 135",
        "align": "center",
        "band": false
      },
      {
        "type": "partyNotifyGrid"
      },
      {
        "type": "fieldGrid",
        "cols": 3
      },
      {
        "type": "hblCargoTable"
      },
      {
        "type": "hblFreightSignature"
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
    "code": "HBL_DRAFT_REPORT_FORMAT_136",
    "formatNumber": 92,
    "name": "HBL Draft Report Format-136",
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
      "company": "KingFisher Wings",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "inquiry@kingfishertec.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "PLMAAJEA00081",
      "invoiceDate": "28-JAN-19",
      "formatBadgeLabel": "Format-136",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Booking Ref.",
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
          "k": "Service Type",
          "v": "FCL"
        },
        {
          "k": "Freight",
          "v": "PREPAID"
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
          "v": "HBL Draft Report Format-136"
        }
      ],
      "hblCargoHeaders": [
        "Container No. / Seal No. / Mark & No.",
        "No. of Pkgs",
        "Description of Goods",
        "Gross Weight",
        "Measurement"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 / 20' DC X 1\nNIL MARKS",
          "125 PACKAGES",
          "FCL STC: VALVE MATERIALS FOR MACHINERY PARTS",
          "18,000.000 KGS",
          "24.000 CBM"
        ]
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
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "termsLines": [
        "DRAFT — Not negotiable unless marked original.",
        "STC: VALVE MATERIALS FOR MACHINERY PARTS"
      ],
      "remarks": "Format-136"
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "formatBadge",
        "label": "Format-136"
      },
      {
        "type": "docTitle",
        "text": "HOUSE BILL OF LADING — DRAFT FORMAT 136",
        "align": "start",
        "band": true
      },
      {
        "type": "partyNotifyGrid"
      },
      {
        "type": "fieldGrid",
        "cols": 2
      },
      {
        "type": "hblCargoTable"
      },
      {
        "type": "hblFreightSignature"
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
    "code": "HBL_DRAFT_REPORT_FORMAT_137",
    "formatNumber": 93,
    "name": "HBL Draft Report Format-137",
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
      "company": "KingFisher Wings",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "inquiry@kingfishertec.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "PLMAAJEA00081",
      "invoiceDate": "28-JAN-19",
      "formatBadgeLabel": "Format-137",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Booking Ref.",
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
          "k": "Service Type",
          "v": "FCL"
        },
        {
          "k": "Freight",
          "v": "PREPAID"
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
          "v": "HBL Draft Report Format-137"
        }
      ],
      "hblCargoHeaders": [
        "Container No. / Seal No. / Mark & No.",
        "No. of Pkgs",
        "Description of Goods",
        "Gross Weight",
        "Measurement"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 / 20' DC X 1\nNIL MARKS",
          "125 PACKAGES",
          "FCL STC: VALVE MATERIALS FOR MACHINERY PARTS",
          "18,000.000 KGS",
          "24.000 CBM"
        ]
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
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "termsLines": [
        "DRAFT — Not negotiable unless marked original.",
        "STC: VALVE MATERIALS FOR MACHINERY PARTS"
      ],
      "remarks": "Format-137"
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "formatBadge",
        "label": "Format-137"
      },
      {
        "type": "docTitle",
        "text": "HOUSE BILL OF LADING — DRAFT FORMAT 137",
        "align": "end",
        "band": false
      },
      {
        "type": "partyNotifyGrid"
      },
      {
        "type": "fieldGrid",
        "cols": 3
      },
      {
        "type": "hblCargoTable"
      },
      {
        "type": "hblFreightSignature"
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
    "code": "HBL_DRAFT_REPORT_FORMAT_138",
    "formatNumber": 94,
    "name": "HBL Draft Report Format-138",
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
      "company": "KingFisher Wings",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "inquiry@kingfishertec.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "PLMAAJEA00081",
      "invoiceDate": "28-JAN-19",
      "formatBadgeLabel": "Format-138",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Booking Ref.",
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
          "k": "Service Type",
          "v": "FCL"
        },
        {
          "k": "Freight",
          "v": "PREPAID"
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
          "v": "HBL Draft Report Format-138"
        }
      ],
      "hblCargoHeaders": [
        "Container No. / Seal No. / Mark & No.",
        "No. of Pkgs",
        "Description of Goods",
        "Gross Weight",
        "Measurement"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 / 20' DC X 1\nNIL MARKS",
          "125 PACKAGES",
          "FCL STC: VALVE MATERIALS FOR MACHINERY PARTS",
          "18,000.000 KGS",
          "24.000 CBM"
        ]
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
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "termsLines": [
        "DRAFT — Not negotiable unless marked original.",
        "STC: VALVE MATERIALS FOR MACHINERY PARTS"
      ],
      "remarks": "Format-138"
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "formatBadge",
        "label": "Format-138"
      },
      {
        "type": "docTitle",
        "text": "HOUSE BILL OF LADING — DRAFT FORMAT 138",
        "align": "center",
        "band": true
      },
      {
        "type": "partyNotifyGrid"
      },
      {
        "type": "fieldGrid",
        "cols": 2
      },
      {
        "type": "hblCargoTable"
      },
      {
        "type": "hblFreightSignature"
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
    "code": "HBL_DRAFT_REPORT_FORMAT_139",
    "formatNumber": 95,
    "name": "HBL Draft Report Format-139",
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
      "company": "KingFisher Wings",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "inquiry@kingfishertec.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "PLMAAJEA00081",
      "invoiceDate": "28-JAN-19",
      "formatBadgeLabel": "Format-139",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Booking Ref.",
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
          "k": "Service Type",
          "v": "FCL"
        },
        {
          "k": "Freight",
          "v": "PREPAID"
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
          "v": "HBL Draft Report Format-139"
        }
      ],
      "hblCargoHeaders": [
        "Container No. / Seal No. / Mark & No.",
        "No. of Pkgs",
        "Description of Goods",
        "Gross Weight",
        "Measurement"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 / 20' DC X 1\nNIL MARKS",
          "125 PACKAGES",
          "FCL STC: VALVE MATERIALS FOR MACHINERY PARTS",
          "18,000.000 KGS",
          "24.000 CBM"
        ]
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
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "termsLines": [
        "DRAFT — Not negotiable unless marked original.",
        "STC: VALVE MATERIALS FOR MACHINERY PARTS"
      ],
      "remarks": "Format-139"
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "formatBadge",
        "label": "Format-139"
      },
      {
        "type": "docTitle",
        "text": "HOUSE BILL OF LADING — DRAFT FORMAT 139",
        "align": "start",
        "band": false
      },
      {
        "type": "partyNotifyGrid"
      },
      {
        "type": "fieldGrid",
        "cols": 3
      },
      {
        "type": "hblCargoTable"
      },
      {
        "type": "hblFreightSignature"
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
    "code": "HBL_DRAFT_REPORT_FORMAT_140",
    "formatNumber": 96,
    "name": "HBL Draft Report Format-140",
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
      "company": "KingFisher Wings",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "inquiry@kingfishertec.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "PLMAAJEA00081",
      "invoiceDate": "28-JAN-19",
      "formatBadgeLabel": "Format-140",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Booking Ref.",
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
          "k": "Service Type",
          "v": "FCL"
        },
        {
          "k": "Freight",
          "v": "PREPAID"
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
          "v": "HBL Draft Report Format-140"
        }
      ],
      "hblCargoHeaders": [
        "Container No. / Seal No. / Mark & No.",
        "No. of Pkgs",
        "Description of Goods",
        "Gross Weight",
        "Measurement"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 / 20' DC X 1\nNIL MARKS",
          "125 PACKAGES",
          "FCL STC: VALVE MATERIALS FOR MACHINERY PARTS",
          "18,000.000 KGS",
          "24.000 CBM"
        ]
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
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "termsLines": [
        "DRAFT — Not negotiable unless marked original.",
        "STC: VALVE MATERIALS FOR MACHINERY PARTS"
      ],
      "remarks": "Format-140"
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "formatBadge",
        "label": "Format-140"
      },
      {
        "type": "docTitle",
        "text": "HOUSE BILL OF LADING — DRAFT FORMAT 140",
        "align": "end",
        "band": true
      },
      {
        "type": "partyNotifyGrid"
      },
      {
        "type": "fieldGrid",
        "cols": 2
      },
      {
        "type": "hblCargoTable"
      },
      {
        "type": "hblFreightSignature"
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
    "code": "HBL_DRAFT_REPORT_FORMAT_141",
    "formatNumber": 97,
    "name": "HBL Draft Report Format-141",
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
      "company": "KingFisher Wings",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "inquiry@kingfishertec.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "PLMAAJEA00081",
      "invoiceDate": "28-JAN-19",
      "formatBadgeLabel": "Format-141",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Booking Ref.",
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
          "k": "Service Type",
          "v": "FCL"
        },
        {
          "k": "Freight",
          "v": "PREPAID"
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
          "v": "HBL Draft Report Format-141"
        }
      ],
      "hblCargoHeaders": [
        "Container No. / Seal No. / Mark & No.",
        "No. of Pkgs",
        "Description of Goods",
        "Gross Weight",
        "Measurement"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 / 20' DC X 1\nNIL MARKS",
          "125 PACKAGES",
          "FCL STC: VALVE MATERIALS FOR MACHINERY PARTS",
          "18,000.000 KGS",
          "24.000 CBM"
        ]
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
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "termsLines": [
        "DRAFT — Not negotiable unless marked original.",
        "STC: VALVE MATERIALS FOR MACHINERY PARTS"
      ],
      "remarks": "Format-141"
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "formatBadge",
        "label": "Format-141"
      },
      {
        "type": "docTitle",
        "text": "HOUSE BILL OF LADING — DRAFT FORMAT 141",
        "align": "center",
        "band": false
      },
      {
        "type": "partyNotifyGrid"
      },
      {
        "type": "fieldGrid",
        "cols": 3
      },
      {
        "type": "hblCargoTable"
      },
      {
        "type": "hblFreightSignature"
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
    "code": "HBL_DRAFT_REPORT_FORMAT_142",
    "formatNumber": 98,
    "name": "HBL Draft Report Format-142",
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
      "company": "KingFisher Wings",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "inquiry@kingfishertec.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "PLMAAJEA00081",
      "invoiceDate": "28-JAN-19",
      "formatBadgeLabel": "Format-142",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Booking Ref.",
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
          "k": "Service Type",
          "v": "FCL"
        },
        {
          "k": "Freight",
          "v": "PREPAID"
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
          "v": "HBL Draft Report Format-142"
        }
      ],
      "hblCargoHeaders": [
        "Container No. / Seal No. / Mark & No.",
        "No. of Pkgs",
        "Description of Goods",
        "Gross Weight",
        "Measurement"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 / 20' DC X 1\nNIL MARKS",
          "125 PACKAGES",
          "FCL STC: VALVE MATERIALS FOR MACHINERY PARTS",
          "18,000.000 KGS",
          "24.000 CBM"
        ]
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
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "termsLines": [
        "DRAFT — Not negotiable unless marked original.",
        "STC: VALVE MATERIALS FOR MACHINERY PARTS"
      ],
      "remarks": "Format-142"
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "formatBadge",
        "label": "Format-142"
      },
      {
        "type": "docTitle",
        "text": "HOUSE BILL OF LADING — DRAFT FORMAT 142",
        "align": "start",
        "band": true
      },
      {
        "type": "partyNotifyGrid"
      },
      {
        "type": "fieldGrid",
        "cols": 2
      },
      {
        "type": "hblCargoTable"
      },
      {
        "type": "hblFreightSignature"
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
    "code": "HBL_DRAFT_REPORT_FORMAT_143",
    "formatNumber": 99,
    "name": "HBL Draft Report Format-143",
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
      "company": "KingFisher Wings",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "inquiry@kingfishertec.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "PLMAAJEA00081",
      "invoiceDate": "28-JAN-19",
      "formatBadgeLabel": "Format-143",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Booking Ref.",
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
          "k": "Service Type",
          "v": "FCL"
        },
        {
          "k": "Freight",
          "v": "PREPAID"
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
          "v": "HBL Draft Report Format-143"
        }
      ],
      "hblCargoHeaders": [
        "Container No. / Seal No. / Mark & No.",
        "No. of Pkgs",
        "Description of Goods",
        "Gross Weight",
        "Measurement"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 / 20' DC X 1\nNIL MARKS",
          "125 PACKAGES",
          "FCL STC: VALVE MATERIALS FOR MACHINERY PARTS",
          "18,000.000 KGS",
          "24.000 CBM"
        ]
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
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "termsLines": [
        "DRAFT — Not negotiable unless marked original.",
        "STC: VALVE MATERIALS FOR MACHINERY PARTS"
      ],
      "remarks": "Format-143"
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "formatBadge",
        "label": "Format-143"
      },
      {
        "type": "docTitle",
        "text": "HOUSE BILL OF LADING — DRAFT FORMAT 143",
        "align": "end",
        "band": false
      },
      {
        "type": "partyNotifyGrid"
      },
      {
        "type": "fieldGrid",
        "cols": 3
      },
      {
        "type": "hblCargoTable"
      },
      {
        "type": "hblFreightSignature"
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
    "code": "HBL_DRAFT_REPORT_FORMAT_144",
    "formatNumber": 100,
    "name": "HBL Draft Report Format-144",
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
      "company": "KingFisher Wings",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "inquiry@kingfishertec.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "PLMAAJEA00081",
      "invoiceDate": "28-JAN-19",
      "formatBadgeLabel": "Format-144",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Booking Ref.",
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
          "k": "Service Type",
          "v": "FCL"
        },
        {
          "k": "Freight",
          "v": "PREPAID"
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
          "v": "HBL Draft Report Format-144"
        }
      ],
      "hblCargoHeaders": [
        "Container No. / Seal No. / Mark & No.",
        "No. of Pkgs",
        "Description of Goods",
        "Gross Weight",
        "Measurement"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 / 20' DC X 1\nNIL MARKS",
          "125 PACKAGES",
          "FCL STC: VALVE MATERIALS FOR MACHINERY PARTS",
          "18,000.000 KGS",
          "24.000 CBM"
        ]
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
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "termsLines": [
        "DRAFT — Not negotiable unless marked original.",
        "STC: VALVE MATERIALS FOR MACHINERY PARTS"
      ],
      "remarks": "Format-144"
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "formatBadge",
        "label": "Format-144"
      },
      {
        "type": "docTitle",
        "text": "HOUSE BILL OF LADING — DRAFT FORMAT 144",
        "align": "center",
        "band": true
      },
      {
        "type": "partyNotifyGrid"
      },
      {
        "type": "fieldGrid",
        "cols": 2
      },
      {
        "type": "hblCargoTable"
      },
      {
        "type": "hblFreightSignature"
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
    "code": "HBL_DRAFT_REPORT_FORMAT_145",
    "formatNumber": 101,
    "name": "HBL Draft Report Format-145",
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
      "company": "KingFisher Wings",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "inquiry@kingfishertec.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "PLMAAJEA00081",
      "invoiceDate": "28-JAN-19",
      "formatBadgeLabel": "Format-145",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Booking Ref.",
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
          "k": "Service Type",
          "v": "FCL"
        },
        {
          "k": "Freight",
          "v": "PREPAID"
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
          "v": "HBL Draft Report Format-145"
        }
      ],
      "hblCargoHeaders": [
        "Container No. / Seal No. / Mark & No.",
        "No. of Pkgs",
        "Description of Goods",
        "Gross Weight",
        "Measurement"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 / 20' DC X 1\nNIL MARKS",
          "125 PACKAGES",
          "FCL STC: VALVE MATERIALS FOR MACHINERY PARTS",
          "18,000.000 KGS",
          "24.000 CBM"
        ]
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
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "termsLines": [
        "DRAFT — Not negotiable unless marked original.",
        "STC: VALVE MATERIALS FOR MACHINERY PARTS"
      ],
      "remarks": "Format-145"
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "formatBadge",
        "label": "Format-145"
      },
      {
        "type": "docTitle",
        "text": "HOUSE BILL OF LADING — DRAFT FORMAT 145",
        "align": "start",
        "band": false
      },
      {
        "type": "partyNotifyGrid"
      },
      {
        "type": "fieldGrid",
        "cols": 3
      },
      {
        "type": "hblCargoTable"
      },
      {
        "type": "hblFreightSignature"
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
    "code": "HBL_DRAFT_REPORT_FORMAT_146",
    "formatNumber": 102,
    "name": "HBL Draft Report Format-146",
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
      "company": "KingFisher Wings",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "inquiry@kingfishertec.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "PLMAAJEA00081",
      "invoiceDate": "28-JAN-19",
      "formatBadgeLabel": "Format-146",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Booking Ref.",
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
          "k": "Service Type",
          "v": "FCL"
        },
        {
          "k": "Freight",
          "v": "PREPAID"
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
          "v": "HBL Draft Report Format-146"
        }
      ],
      "hblCargoHeaders": [
        "Container No. / Seal No. / Mark & No.",
        "No. of Pkgs",
        "Description of Goods",
        "Gross Weight",
        "Measurement"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 / 20' DC X 1\nNIL MARKS",
          "125 PACKAGES",
          "FCL STC: VALVE MATERIALS FOR MACHINERY PARTS",
          "18,000.000 KGS",
          "24.000 CBM"
        ]
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
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "termsLines": [
        "DRAFT — Not negotiable unless marked original.",
        "STC: VALVE MATERIALS FOR MACHINERY PARTS"
      ],
      "remarks": "Format-146"
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "formatBadge",
        "label": "Format-146"
      },
      {
        "type": "docTitle",
        "text": "HOUSE BILL OF LADING — DRAFT FORMAT 146",
        "align": "end",
        "band": true
      },
      {
        "type": "partyNotifyGrid"
      },
      {
        "type": "fieldGrid",
        "cols": 2
      },
      {
        "type": "hblCargoTable"
      },
      {
        "type": "hblFreightSignature"
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
    "code": "HBL_DRAFT_REPORT_FORMAT_147",
    "formatNumber": 103,
    "name": "HBL Draft Report Format-147",
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
      "company": "KingFisher Wings",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "inquiry@kingfishertec.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "PLMAAJEA00081",
      "invoiceDate": "28-JAN-19",
      "formatBadgeLabel": "Format-147",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Booking Ref.",
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
          "k": "Service Type",
          "v": "FCL"
        },
        {
          "k": "Freight",
          "v": "PREPAID"
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
          "v": "HBL Draft Report Format-147"
        }
      ],
      "hblCargoHeaders": [
        "Container No. / Seal No. / Mark & No.",
        "No. of Pkgs",
        "Description of Goods",
        "Gross Weight",
        "Measurement"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 / 20' DC X 1\nNIL MARKS",
          "125 PACKAGES",
          "FCL STC: VALVE MATERIALS FOR MACHINERY PARTS",
          "18,000.000 KGS",
          "24.000 CBM"
        ]
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
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "termsLines": [
        "DRAFT — Not negotiable unless marked original.",
        "STC: VALVE MATERIALS FOR MACHINERY PARTS"
      ],
      "remarks": "Format-147"
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "formatBadge",
        "label": "Format-147"
      },
      {
        "type": "docTitle",
        "text": "HOUSE BILL OF LADING — DRAFT FORMAT 147",
        "align": "center",
        "band": false
      },
      {
        "type": "partyNotifyGrid"
      },
      {
        "type": "fieldGrid",
        "cols": 3
      },
      {
        "type": "hblCargoTable"
      },
      {
        "type": "hblFreightSignature"
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
    "code": "HBL_DRAFT_REPORT_FORMAT_148",
    "formatNumber": 104,
    "name": "HBL Draft Report Format-148",
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
      "company": "KingFisher Wings",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "inquiry@kingfishertec.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "PLMAAJEA00081",
      "invoiceDate": "28-JAN-19",
      "formatBadgeLabel": "Format-148",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Booking Ref.",
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
          "k": "Service Type",
          "v": "FCL"
        },
        {
          "k": "Freight",
          "v": "PREPAID"
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
          "v": "HBL Draft Report Format-148"
        }
      ],
      "hblCargoHeaders": [
        "Container No. / Seal No. / Mark & No.",
        "No. of Pkgs",
        "Description of Goods",
        "Gross Weight",
        "Measurement"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 / 20' DC X 1\nNIL MARKS",
          "125 PACKAGES",
          "FCL STC: VALVE MATERIALS FOR MACHINERY PARTS",
          "18,000.000 KGS",
          "24.000 CBM"
        ]
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
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "termsLines": [
        "DRAFT — Not negotiable unless marked original.",
        "STC: VALVE MATERIALS FOR MACHINERY PARTS"
      ],
      "remarks": "Format-148"
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "formatBadge",
        "label": "Format-148"
      },
      {
        "type": "docTitle",
        "text": "HOUSE BILL OF LADING — DRAFT FORMAT 148",
        "align": "start",
        "band": true
      },
      {
        "type": "partyNotifyGrid"
      },
      {
        "type": "fieldGrid",
        "cols": 2
      },
      {
        "type": "hblCargoTable"
      },
      {
        "type": "hblFreightSignature"
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
    "code": "HBL_DRAFT_REPORT_FORMAT_149",
    "formatNumber": 105,
    "name": "HBL Draft Report Format-149",
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
      "company": "KingFisher Wings",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "inquiry@kingfishertec.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "PLMAAJEA00081",
      "invoiceDate": "28-JAN-19",
      "formatBadgeLabel": "Format-149",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Booking Ref.",
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
          "k": "Service Type",
          "v": "FCL"
        },
        {
          "k": "Freight",
          "v": "PREPAID"
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
          "v": "HBL Draft Report Format-149"
        }
      ],
      "hblCargoHeaders": [
        "Container No. / Seal No. / Mark & No.",
        "No. of Pkgs",
        "Description of Goods",
        "Gross Weight",
        "Measurement"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 / 20' DC X 1\nNIL MARKS",
          "125 PACKAGES",
          "FCL STC: VALVE MATERIALS FOR MACHINERY PARTS",
          "18,000.000 KGS",
          "24.000 CBM"
        ]
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
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "termsLines": [
        "DRAFT — Not negotiable unless marked original.",
        "STC: VALVE MATERIALS FOR MACHINERY PARTS"
      ],
      "remarks": "Format-149"
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "formatBadge",
        "label": "Format-149"
      },
      {
        "type": "docTitle",
        "text": "HOUSE BILL OF LADING — DRAFT FORMAT 149",
        "align": "end",
        "band": false
      },
      {
        "type": "partyNotifyGrid"
      },
      {
        "type": "fieldGrid",
        "cols": 3
      },
      {
        "type": "hblCargoTable"
      },
      {
        "type": "hblFreightSignature"
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
    "code": "HBL_DRAFT_REPORT_FORMAT_151",
    "formatNumber": 106,
    "name": "HBL Draft Report Format-151",
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
      "company": "KingFisher Wings",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "inquiry@kingfishertec.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "PLMAAJEA00081",
      "invoiceDate": "28-JAN-19",
      "formatBadgeLabel": "Format-151",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Booking Ref.",
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
          "k": "Service Type",
          "v": "FCL"
        },
        {
          "k": "Freight",
          "v": "PREPAID"
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
          "v": "HBL Draft Report Format-151"
        }
      ],
      "hblCargoHeaders": [
        "Container No. / Seal No. / Mark & No.",
        "No. of Pkgs",
        "Description of Goods",
        "Gross Weight",
        "Measurement"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 / 20' DC X 1\nNIL MARKS",
          "125 PACKAGES",
          "FCL STC: VALVE MATERIALS FOR MACHINERY PARTS",
          "18,000.000 KGS",
          "24.000 CBM"
        ]
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
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "termsLines": [
        "DRAFT — Not negotiable unless marked original.",
        "STC: VALVE MATERIALS FOR MACHINERY PARTS"
      ],
      "remarks": "Format-151"
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "formatBadge",
        "label": "Format-151"
      },
      {
        "type": "docTitle",
        "text": "HOUSE BILL OF LADING — DRAFT FORMAT 151",
        "align": "start",
        "band": false
      },
      {
        "type": "partyNotifyGrid"
      },
      {
        "type": "fieldGrid",
        "cols": 3
      },
      {
        "type": "hblCargoTable"
      },
      {
        "type": "hblFreightSignature"
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
    "code": "HBL_DRAFT_REPORT_FORMAT_171",
    "formatNumber": 107,
    "name": "HBL Draft Report Format-171",
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
      "company": "KingFisher Wings",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "inquiry@kingfishertec.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "PLMAAJEA00081",
      "invoiceDate": "28-JAN-19",
      "formatBadgeLabel": "Format-171",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Booking Ref.",
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
          "k": "Service Type",
          "v": "FCL"
        },
        {
          "k": "Freight",
          "v": "PREPAID"
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
          "v": "HBL Draft Report Format-171"
        }
      ],
      "hblCargoHeaders": [
        "Container No. / Seal No. / Mark & No.",
        "No. of Pkgs",
        "Description of Goods",
        "Gross Weight",
        "Measurement"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 / 20' DC X 1\nNIL MARKS",
          "125 PACKAGES",
          "FCL STC: VALVE MATERIALS FOR MACHINERY PARTS",
          "18,000.000 KGS",
          "24.000 CBM"
        ]
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
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "termsLines": [
        "DRAFT — Not negotiable unless marked original.",
        "STC: VALVE MATERIALS FOR MACHINERY PARTS"
      ],
      "remarks": "Format-171"
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "formatBadge",
        "label": "Format-171"
      },
      {
        "type": "docTitle",
        "text": "HOUSE BILL OF LADING — DRAFT FORMAT 171",
        "align": "center",
        "band": false
      },
      {
        "type": "partyNotifyGrid"
      },
      {
        "type": "fieldGrid",
        "cols": 3
      },
      {
        "type": "hblCargoTable"
      },
      {
        "type": "hblFreightSignature"
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
    "code": "HBL_DRAFT_REPORT_FORMAT_172",
    "formatNumber": 108,
    "name": "HBL Draft Report Format-172",
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
      "company": "KingFisher Wings",
      "address": "Dubai, United Arab Emirates",
      "web": "www.kingfisherwingsgroup.com",
      "phone": "+971 55 5355 286",
      "email": "inquiry@kingfishertec.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "PLMAAJEA00081",
      "invoiceDate": "28-JAN-19",
      "formatBadgeLabel": "Format-172",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Booking Ref.",
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
          "k": "Service Type",
          "v": "FCL"
        },
        {
          "k": "Freight",
          "v": "PREPAID"
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
          "v": "HBL Draft Report Format-172"
        }
      ],
      "hblCargoHeaders": [
        "Container No. / Seal No. / Mark & No.",
        "No. of Pkgs",
        "Description of Goods",
        "Gross Weight",
        "Measurement"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 / 20' DC X 1\nNIL MARKS",
          "125 PACKAGES",
          "FCL STC: VALVE MATERIALS FOR MACHINERY PARTS",
          "18,000.000 KGS",
          "24.000 CBM"
        ]
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
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "termsLines": [
        "DRAFT — Not negotiable unless marked original.",
        "STC: VALVE MATERIALS FOR MACHINERY PARTS"
      ],
      "remarks": "Format-172"
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "formatBadge",
        "label": "Format-172"
      },
      {
        "type": "docTitle",
        "text": "HOUSE BILL OF LADING — DRAFT FORMAT 172",
        "align": "start",
        "band": true
      },
      {
        "type": "partyNotifyGrid"
      },
      {
        "type": "fieldGrid",
        "cols": 2
      },
      {
        "type": "hblCargoTable"
      },
      {
        "type": "hblFreightSignature"
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
