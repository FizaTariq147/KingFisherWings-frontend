import type { InvoiceFormatUiLayout } from '../types/invoiceFormatUiLayout.types';

/** Auto-generated HBL formats — run: node scripts/build-hbl-format-ui-layouts.mjs */
export const HBL_FORMAT_UI_LAYOUTS: InvoiceFormatUiLayout[] = [
  {
    "code": "FG_HBL_HKG",
    "formatNumber": 1,
    "name": "HBL Draft Jasper",
    "paper": "A4",
    "rtl": false,
    "appendCustomerTerms": true,
    "theme": {
      "primary": "#101010",
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
      "formatBadgeLabel": "JASPER",
      "heroTitle": "DRAFT BILL OF LADING",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
      },
      "partyMid": {
        "title": "Consignee",
        "lines": [
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Job No.",
          "v": "CEXP190150"
        },
        {
          "k": "Booking Ref.",
          "v": "B/EXP/19/0254"
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
          "k": "Vessel / Voyage",
          "v": "CMA CGM / 9887"
        },
        {
          "k": "Ocean Vessel",
          "v": "CMA CGM"
        },
        {
          "k": "Voyage Number",
          "v": "9887"
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
          "k": "Pre-carriage by",
          "v": ""
        },
        {
          "k": "Layout",
          "v": "HBL Draft Jasper"
        },
        {
          "k": "Catalogue",
          "v": "jasper #1"
        }
      ],
      "hblCargoHeaders": [
        "Container Nos, Seal Nos, Mark and Nos",
        "Number and kind of packages : description of goods",
        "Gross Weight(Kg)",
        "Volume"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 /\n20' DC X 1\nNIL MARKS",
          "STC: VALVE MATERIALS FOR MACHINERY PARTS\nFREIGHT PREPAID\nALL DESTINATION CHARGES ARE CONSIGNEE'S ACCOUNT",
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
      "containerNote": "Total Number of Containers or Packages (In words): ONE(1X20' DC) CONTAINER ONLY",
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "hblBlTitle": "BILL OF LADING  NOT NEGOTIABLE UNLESS CONSIGNED \"TO ORDER\"",
      "hblOriginals": "1(ONE)",
      "hblRegisteredNo": "MTO/DGS/1182/APR/2019",
      "hblDeliveryAgent": {
        "title": "APPLICATION FOR DELIVERY AT DESTINATION MUST BE MADE TO:",
        "lines": [
          "KingFisher Wings Dubai LLC",
          "DUBAI UNITED ARAB EMIRATES",
          "TEL: +971 55 5355 286",
          "EMAIL: inquiry@kingfishertec.com"
        ]
      },
      "termsLines": [
        "DRAFT — BILL OF LADING NOT NEGOTIABLE UNLESS CONSIGNED \"TO ORDER\"",
        "RECEIVED by the Carrier the Goods as specified above in apparent good order and condition unless otherwise stated.",
        "AS AGENT FOR THE CARRIER"
      ],
      "remarks": "JASPER"
    },
    "blocks": [
      {
        "type": "hblBlShell",
        "embedLogo": true,
        "variant": "jasper"
      },
      {
        "type": "hblFreightSignature",
        "variant": "blClosing"
      },
      {
        "type": "colorfulFooter",
        "variant": "plain"
      }
    ]
  },
  {
    "code": "FG_HBL_FORMAT_1",
    "formatNumber": 2,
    "name": "HBL Draft Jasper 1",
    "paper": "A4",
    "rtl": false,
    "appendCustomerTerms": true,
    "theme": {
      "primary": "#101010",
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
      "formatBadgeLabel": "JASPER",
      "heroTitle": "DRAFT BILL OF LADING",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
      },
      "partyMid": {
        "title": "Consignee",
        "lines": [
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Job No.",
          "v": "CEXP190150"
        },
        {
          "k": "Booking Ref.",
          "v": "B/EXP/19/0254"
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
          "k": "Vessel / Voyage",
          "v": "CMA CGM / 9887"
        },
        {
          "k": "Ocean Vessel",
          "v": "CMA CGM"
        },
        {
          "k": "Voyage Number",
          "v": "9887"
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
          "k": "Pre-carriage by",
          "v": ""
        },
        {
          "k": "Layout",
          "v": "HBL Draft Jasper 1"
        },
        {
          "k": "Catalogue",
          "v": "jasper #2"
        }
      ],
      "hblCargoHeaders": [
        "Container Nos, Seal Nos, Mark and Nos",
        "Number and kind of packages : description of goods",
        "Gross Weight(Kg)",
        "Volume"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 /\n20' DC X 1\nNIL MARKS",
          "STC: VALVE MATERIALS FOR MACHINERY PARTS\nFREIGHT PREPAID\nALL DESTINATION CHARGES ARE CONSIGNEE'S ACCOUNT",
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
      "containerNote": "Total Number of Containers or Packages (In words): ONE(1X20' DC) CONTAINER ONLY",
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "hblBlTitle": "Bill of Lading FOR COMBINED TRANSPORT OR PORT TO PORT SHIPMENT",
      "hblOriginals": "1(ONE)",
      "hblRegisteredNo": "MTO/DGS/1182/APR/2019",
      "hblDeliveryAgent": {
        "title": "APPLICATION FOR DELIVERY AT DESTINATION MUST BE MADE TO:",
        "lines": [
          "KingFisher Wings Dubai LLC",
          "DUBAI UNITED ARAB EMIRATES",
          "TEL: +971 55 5355 286",
          "EMAIL: inquiry@kingfishertec.com"
        ]
      },
      "termsLines": [
        "DRAFT — BILL OF LADING NOT NEGOTIABLE UNLESS CONSIGNED \"TO ORDER\"",
        "RECEIVED by the Carrier the Goods as specified above in apparent good order and condition unless otherwise stated.",
        "AS AGENT FOR THE CARRIER"
      ],
      "remarks": "JASPER"
    },
    "blocks": [
      {
        "type": "hblBlShell",
        "embedLogo": true,
        "variant": "combined"
      },
      {
        "type": "hblFreightSignature",
        "variant": "blClosing"
      },
      {
        "type": "colorfulFooter",
        "variant": "plain"
      }
    ]
  },
  {
    "code": "FG_HBL_FORMAT_10",
    "formatNumber": 3,
    "name": "HBL Draft Jasper 10",
    "paper": "A4",
    "rtl": false,
    "appendCustomerTerms": true,
    "theme": {
      "primary": "#101010",
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
      "formatBadgeLabel": "JASPER",
      "heroTitle": "DRAFT BILL OF LADING",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
      },
      "partyMid": {
        "title": "Consignee",
        "lines": [
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Job No.",
          "v": "CEXP190150"
        },
        {
          "k": "Booking Ref.",
          "v": "B/EXP/19/0254"
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
          "k": "Vessel / Voyage",
          "v": "CMA CGM / 9887"
        },
        {
          "k": "Ocean Vessel",
          "v": "CMA CGM"
        },
        {
          "k": "Voyage Number",
          "v": "9887"
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
          "k": "Pre-carriage by",
          "v": ""
        },
        {
          "k": "Layout",
          "v": "HBL Draft Jasper 10"
        },
        {
          "k": "Catalogue",
          "v": "jasper #3"
        }
      ],
      "hblCargoHeaders": [
        "Container Nos, Seal Nos, Mark and Nos",
        "Number and kind of packages : description of goods",
        "Gross Weight(Kg)",
        "Volume"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 /\n20' DC X 1\nNIL MARKS",
          "STC: VALVE MATERIALS FOR MACHINERY PARTS\nFREIGHT PREPAID\nALL DESTINATION CHARGES ARE CONSIGNEE'S ACCOUNT",
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
      "containerNote": "Total Number of Containers or Packages (In words): ONE(1X20' DC) CONTAINER ONLY",
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "hblBlTitle": "BILL OF LADING  NOT NEGOTIABLE UNLESS CONSIGNED \"TO ORDER\"",
      "hblOriginals": "1(ONE)",
      "hblRegisteredNo": "MTO/DGS/1182/APR/2019",
      "hblDeliveryAgent": {
        "title": "APPLICATION FOR DELIVERY AT DESTINATION MUST BE MADE TO:",
        "lines": [
          "KingFisher Wings Dubai LLC",
          "DUBAI UNITED ARAB EMIRATES",
          "TEL: +971 55 5355 286",
          "EMAIL: inquiry@kingfishertec.com"
        ]
      },
      "termsLines": [
        "DRAFT — BILL OF LADING NOT NEGOTIABLE UNLESS CONSIGNED \"TO ORDER\"",
        "RECEIVED by the Carrier the Goods as specified above in apparent good order and condition unless otherwise stated.",
        "AS AGENT FOR THE CARRIER"
      ],
      "remarks": "JASPER"
    },
    "blocks": [
      {
        "type": "hblBlShell",
        "embedLogo": true,
        "variant": "jasper"
      },
      {
        "type": "hblFreightSignature",
        "variant": "blClosing"
      },
      {
        "type": "colorfulFooter",
        "variant": "plain"
      }
    ]
  },
  {
    "code": "FG_HBL_MAGICLOGISYS",
    "formatNumber": 4,
    "name": "HBL Draft Jasper 13",
    "paper": "A4",
    "rtl": false,
    "appendCustomerTerms": true,
    "theme": {
      "primary": "#101010",
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
      "formatBadgeLabel": "JASPER",
      "heroTitle": "DRAFT BILL OF LADING",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
      },
      "partyMid": {
        "title": "Consignee",
        "lines": [
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Job No.",
          "v": "CEXP190150"
        },
        {
          "k": "Booking Ref.",
          "v": "B/EXP/19/0254"
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
          "k": "Vessel / Voyage",
          "v": "CMA CGM / 9887"
        },
        {
          "k": "Ocean Vessel",
          "v": "CMA CGM"
        },
        {
          "k": "Voyage Number",
          "v": "9887"
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
          "k": "Pre-carriage by",
          "v": ""
        },
        {
          "k": "Layout",
          "v": "HBL Draft Jasper 13"
        },
        {
          "k": "Catalogue",
          "v": "jasper #4"
        }
      ],
      "hblCargoHeaders": [
        "Container Nos, Seal Nos, Mark and Nos",
        "Number and kind of packages : description of goods",
        "Gross Weight(Kg)",
        "Volume"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 /\n20' DC X 1\nNIL MARKS",
          "STC: VALVE MATERIALS FOR MACHINERY PARTS\nFREIGHT PREPAID\nALL DESTINATION CHARGES ARE CONSIGNEE'S ACCOUNT",
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
      "containerNote": "Total Number of Containers or Packages (In words): ONE(1X20' DC) CONTAINER ONLY",
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "hblBlTitle": "MULTIMODAL TRANSPORT DOCUMENT",
      "hblOriginals": "1(ONE)",
      "hblRegisteredNo": "MTO/DGS/1182/APR/2019",
      "hblDeliveryAgent": {
        "title": "APPLICATION FOR DELIVERY AT DESTINATION MUST BE MADE TO:",
        "lines": [
          "KingFisher Wings Dubai LLC",
          "DUBAI UNITED ARAB EMIRATES",
          "TEL: +971 55 5355 286",
          "EMAIL: inquiry@kingfishertec.com"
        ]
      },
      "termsLines": [
        "DRAFT — BILL OF LADING NOT NEGOTIABLE UNLESS CONSIGNED \"TO ORDER\"",
        "RECEIVED by the Carrier the Goods as specified above in apparent good order and condition unless otherwise stated.",
        "AS AGENT FOR THE CARRIER"
      ],
      "remarks": "JASPER"
    },
    "blocks": [
      {
        "type": "hblBlShell",
        "embedLogo": true,
        "variant": "mt"
      },
      {
        "type": "hblFreightSignature",
        "variant": "blClosing"
      },
      {
        "type": "colorfulFooter",
        "variant": "plain"
      }
    ]
  },
  {
    "code": "FG_HBL_FORMAT_14",
    "formatNumber": 5,
    "name": "HBL Draft Jasper 14",
    "paper": "A4",
    "rtl": false,
    "appendCustomerTerms": true,
    "theme": {
      "primary": "#101010",
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
      "formatBadgeLabel": "JASPER",
      "heroTitle": "DRAFT BILL OF LADING",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
      },
      "partyMid": {
        "title": "Consignee",
        "lines": [
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Job No.",
          "v": "CEXP190150"
        },
        {
          "k": "Booking Ref.",
          "v": "B/EXP/19/0254"
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
          "k": "Vessel / Voyage",
          "v": "CMA CGM / 9887"
        },
        {
          "k": "Ocean Vessel",
          "v": "CMA CGM"
        },
        {
          "k": "Voyage Number",
          "v": "9887"
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
          "k": "Pre-carriage by",
          "v": ""
        },
        {
          "k": "Layout",
          "v": "HBL Draft Jasper 14"
        },
        {
          "k": "Catalogue",
          "v": "jasper #5"
        }
      ],
      "hblCargoHeaders": [
        "Container Nos, Seal Nos, Mark and Nos",
        "Number and kind of packages : description of goods",
        "Gross Weight(Kg)",
        "Volume"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 /\n20' DC X 1\nNIL MARKS",
          "STC: VALVE MATERIALS FOR MACHINERY PARTS\nFREIGHT PREPAID\nALL DESTINATION CHARGES ARE CONSIGNEE'S ACCOUNT",
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
      "containerNote": "Total Number of Containers or Packages (In words): ONE(1X20' DC) CONTAINER ONLY",
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "hblBlTitle": "MULTI-MODAL TRANSPORT DOCUMENT",
      "hblOriginals": "1(ONE)",
      "hblRegisteredNo": "MTO/DGS/1182/APR/2019",
      "hblDeliveryAgent": {
        "title": "APPLICATION FOR DELIVERY AT DESTINATION MUST BE MADE TO:",
        "lines": [
          "KingFisher Wings Dubai LLC",
          "DUBAI UNITED ARAB EMIRATES",
          "TEL: +971 55 5355 286",
          "EMAIL: inquiry@kingfishertec.com"
        ]
      },
      "termsLines": [
        "DRAFT — BILL OF LADING NOT NEGOTIABLE UNLESS CONSIGNED \"TO ORDER\"",
        "RECEIVED by the Carrier the Goods as specified above in apparent good order and condition unless otherwise stated.",
        "AS AGENT FOR THE CARRIER"
      ],
      "remarks": "JASPER"
    },
    "blocks": [
      {
        "type": "hblBlShell",
        "embedLogo": true,
        "variant": "multimodal"
      },
      {
        "type": "hblFreightSignature",
        "variant": "blClosing"
      },
      {
        "type": "colorfulFooter",
        "variant": "plain"
      }
    ]
  },
  {
    "code": "FG_HBL_FORMAT_16",
    "formatNumber": 6,
    "name": "HBL Draft Jasper 16",
    "paper": "A4",
    "rtl": false,
    "appendCustomerTerms": true,
    "theme": {
      "primary": "#101010",
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
      "formatBadgeLabel": "JASPER",
      "heroTitle": "DRAFT BILL OF LADING",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
      },
      "partyMid": {
        "title": "Consignee",
        "lines": [
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Job No.",
          "v": "CEXP190150"
        },
        {
          "k": "Booking Ref.",
          "v": "B/EXP/19/0254"
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
          "k": "Vessel / Voyage",
          "v": "CMA CGM / 9887"
        },
        {
          "k": "Ocean Vessel",
          "v": "CMA CGM"
        },
        {
          "k": "Voyage Number",
          "v": "9887"
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
          "k": "Pre-carriage by",
          "v": ""
        },
        {
          "k": "Layout",
          "v": "HBL Draft Jasper 16"
        },
        {
          "k": "Catalogue",
          "v": "jasper #6"
        }
      ],
      "hblCargoHeaders": [
        "Container Nos, Seal Nos, Mark and Nos",
        "Number and kind of packages : description of goods",
        "Gross Weight(Kg)",
        "Volume"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 /\n20' DC X 1\nNIL MARKS",
          "STC: VALVE MATERIALS FOR MACHINERY PARTS\nFREIGHT PREPAID\nALL DESTINATION CHARGES ARE CONSIGNEE'S ACCOUNT",
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
      "containerNote": "Total Number of Containers or Packages (In words): ONE(1X20' DC) CONTAINER ONLY",
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "hblBlTitle": "MULTI-MODAL TRANSPORT DOCUMENT",
      "hblOriginals": "1(ONE)",
      "hblRegisteredNo": "MTO/DGS/1182/APR/2019",
      "hblDeliveryAgent": {
        "title": "APPLICATION FOR DELIVERY AT DESTINATION MUST BE MADE TO:",
        "lines": [
          "KingFisher Wings Dubai LLC",
          "DUBAI UNITED ARAB EMIRATES",
          "TEL: +971 55 5355 286",
          "EMAIL: inquiry@kingfishertec.com"
        ]
      },
      "termsLines": [
        "DRAFT — BILL OF LADING NOT NEGOTIABLE UNLESS CONSIGNED \"TO ORDER\"",
        "RECEIVED by the Carrier the Goods as specified above in apparent good order and condition unless otherwise stated.",
        "AS AGENT FOR THE CARRIER"
      ],
      "remarks": "JASPER"
    },
    "blocks": [
      {
        "type": "hblBlShell",
        "embedLogo": true,
        "variant": "multimodal"
      },
      {
        "type": "hblFreightSignature",
        "variant": "blClosing"
      },
      {
        "type": "colorfulFooter",
        "variant": "plain"
      }
    ]
  },
  {
    "code": "FG_HBL_FORMAT_20",
    "formatNumber": 7,
    "name": "HBL Draft Jasper 20",
    "paper": "A4",
    "rtl": false,
    "appendCustomerTerms": true,
    "theme": {
      "primary": "#101010",
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
      "formatBadgeLabel": "JASPER",
      "heroTitle": "DRAFT BILL OF LADING",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
      },
      "partyMid": {
        "title": "Consignee",
        "lines": [
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Job No.",
          "v": "CEXP190150"
        },
        {
          "k": "Booking Ref.",
          "v": "B/EXP/19/0254"
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
          "k": "Vessel / Voyage",
          "v": "CMA CGM / 9887"
        },
        {
          "k": "Ocean Vessel",
          "v": "CMA CGM"
        },
        {
          "k": "Voyage Number",
          "v": "9887"
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
          "k": "Pre-carriage by",
          "v": ""
        },
        {
          "k": "Layout",
          "v": "HBL Draft Jasper 20"
        },
        {
          "k": "Catalogue",
          "v": "jasper #7"
        }
      ],
      "hblCargoHeaders": [
        "Container Nos, Seal Nos, Mark and Nos",
        "Number and kind of packages : description of goods",
        "Gross Weight(Kg)",
        "Volume"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 /\n20' DC X 1\nNIL MARKS",
          "STC: VALVE MATERIALS FOR MACHINERY PARTS\nFREIGHT PREPAID\nALL DESTINATION CHARGES ARE CONSIGNEE'S ACCOUNT",
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
      "containerNote": "Total Number of Containers or Packages (In words): ONE(1X20' DC) CONTAINER ONLY",
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "hblBlTitle": "BILL OF LADING",
      "hblOriginals": "1(ONE)",
      "hblRegisteredNo": "MTO/DGS/1182/APR/2019",
      "hblDeliveryAgent": {
        "title": "APPLICATION FOR DELIVERY AT DESTINATION MUST BE MADE TO:",
        "lines": [
          "KingFisher Wings Dubai LLC",
          "DUBAI UNITED ARAB EMIRATES",
          "TEL: +971 55 5355 286",
          "EMAIL: inquiry@kingfishertec.com"
        ]
      },
      "termsLines": [
        "DRAFT — BILL OF LADING NOT NEGOTIABLE UNLESS CONSIGNED \"TO ORDER\"",
        "RECEIVED by the Carrier the Goods as specified above in apparent good order and condition unless otherwise stated.",
        "AS AGENT FOR THE CARRIER"
      ],
      "remarks": "JASPER"
    },
    "blocks": [
      {
        "type": "hblBlShell",
        "embedLogo": true,
        "variant": "ocean"
      },
      {
        "type": "hblFreightSignature",
        "variant": "blClosing"
      },
      {
        "type": "colorfulFooter",
        "variant": "plain"
      }
    ]
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_23",
    "formatNumber": 8,
    "name": "HBL Draft Jasper 23",
    "paper": "A4",
    "rtl": false,
    "appendCustomerTerms": true,
    "theme": {
      "primary": "#101010",
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
      "formatBadgeLabel": "JASPER",
      "heroTitle": "DRAFT BILL OF LADING",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
      },
      "partyMid": {
        "title": "Consignee",
        "lines": [
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Job No.",
          "v": "CEXP190150"
        },
        {
          "k": "Booking Ref.",
          "v": "B/EXP/19/0254"
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
          "k": "Vessel / Voyage",
          "v": "CMA CGM / 9887"
        },
        {
          "k": "Ocean Vessel",
          "v": "CMA CGM"
        },
        {
          "k": "Voyage Number",
          "v": "9887"
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
          "k": "Pre-carriage by",
          "v": ""
        },
        {
          "k": "Layout",
          "v": "HBL Draft Jasper 23"
        },
        {
          "k": "Catalogue",
          "v": "jasper #8"
        }
      ],
      "hblCargoHeaders": [
        "Container Nos, Seal Nos, Mark and Nos",
        "Number and kind of packages : description of goods",
        "Gross Weight(Kg)",
        "Volume"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 /\n20' DC X 1\nNIL MARKS",
          "STC: VALVE MATERIALS FOR MACHINERY PARTS\nFREIGHT PREPAID\nALL DESTINATION CHARGES ARE CONSIGNEE'S ACCOUNT",
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
      "containerNote": "Total Number of Containers or Packages (In words): ONE(1X20' DC) CONTAINER ONLY",
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "hblBlTitle": "MULTI-MODAL TRANSPORT DOCUMENT",
      "hblOriginals": "1(ONE)",
      "hblRegisteredNo": "MTO/DGS/1182/APR/2019",
      "hblDeliveryAgent": {
        "title": "APPLICATION FOR DELIVERY AT DESTINATION MUST BE MADE TO:",
        "lines": [
          "KingFisher Wings Dubai LLC",
          "DUBAI UNITED ARAB EMIRATES",
          "TEL: +971 55 5355 286",
          "EMAIL: inquiry@kingfishertec.com"
        ]
      },
      "termsLines": [
        "DRAFT — BILL OF LADING NOT NEGOTIABLE UNLESS CONSIGNED \"TO ORDER\"",
        "RECEIVED by the Carrier the Goods as specified above in apparent good order and condition unless otherwise stated.",
        "AS AGENT FOR THE CARRIER"
      ],
      "remarks": "JASPER"
    },
    "blocks": [
      {
        "type": "hblBlShell",
        "embedLogo": true,
        "variant": "multimodal"
      },
      {
        "type": "hblFreightSignature",
        "variant": "blClosing"
      },
      {
        "type": "colorfulFooter",
        "variant": "plain"
      }
    ]
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_25",
    "formatNumber": 9,
    "name": "HBL Draft Jasper 25",
    "paper": "A4",
    "rtl": false,
    "appendCustomerTerms": true,
    "theme": {
      "primary": "#101010",
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
      "formatBadgeLabel": "JASPER",
      "heroTitle": "DRAFT BILL OF LADING",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
      },
      "partyMid": {
        "title": "Consignee",
        "lines": [
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Job No.",
          "v": "CEXP190150"
        },
        {
          "k": "Booking Ref.",
          "v": "B/EXP/19/0254"
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
          "k": "Vessel / Voyage",
          "v": "CMA CGM / 9887"
        },
        {
          "k": "Ocean Vessel",
          "v": "CMA CGM"
        },
        {
          "k": "Voyage Number",
          "v": "9887"
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
          "k": "Pre-carriage by",
          "v": ""
        },
        {
          "k": "Layout",
          "v": "HBL Draft Jasper 25"
        },
        {
          "k": "Catalogue",
          "v": "jasper #9"
        }
      ],
      "hblCargoHeaders": [
        "Container Nos, Seal Nos, Mark and Nos",
        "Number and kind of packages : description of goods",
        "Gross Weight(Kg)",
        "Volume"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 /\n20' DC X 1\nNIL MARKS",
          "STC: VALVE MATERIALS FOR MACHINERY PARTS\nFREIGHT PREPAID\nALL DESTINATION CHARGES ARE CONSIGNEE'S ACCOUNT",
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
      "containerNote": "Total Number of Containers or Packages (In words): ONE(1X20' DC) CONTAINER ONLY",
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "hblBlTitle": "MULTIMODAL TRANSPORT DOCUMENT",
      "hblOriginals": "1(ONE)",
      "hblRegisteredNo": "MTO/DGS/1182/APR/2019",
      "hblDeliveryAgent": {
        "title": "APPLICATION FOR DELIVERY AT DESTINATION MUST BE MADE TO:",
        "lines": [
          "KingFisher Wings Dubai LLC",
          "DUBAI UNITED ARAB EMIRATES",
          "TEL: +971 55 5355 286",
          "EMAIL: inquiry@kingfishertec.com"
        ]
      },
      "termsLines": [
        "DRAFT — BILL OF LADING NOT NEGOTIABLE UNLESS CONSIGNED \"TO ORDER\"",
        "RECEIVED by the Carrier the Goods as specified above in apparent good order and condition unless otherwise stated.",
        "AS AGENT FOR THE CARRIER"
      ],
      "remarks": "JASPER"
    },
    "blocks": [
      {
        "type": "hblBlShell",
        "embedLogo": true,
        "variant": "mt"
      },
      {
        "type": "hblFreightSignature",
        "variant": "blClosing"
      },
      {
        "type": "colorfulFooter",
        "variant": "plain"
      }
    ]
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_26",
    "formatNumber": 10,
    "name": "HBL Draft Jasper 26",
    "paper": "A4",
    "rtl": false,
    "appendCustomerTerms": true,
    "theme": {
      "primary": "#101010",
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
      "formatBadgeLabel": "JASPER",
      "heroTitle": "DRAFT BILL OF LADING",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
      },
      "partyMid": {
        "title": "Consignee",
        "lines": [
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Job No.",
          "v": "CEXP190150"
        },
        {
          "k": "Booking Ref.",
          "v": "B/EXP/19/0254"
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
          "k": "Vessel / Voyage",
          "v": "CMA CGM / 9887"
        },
        {
          "k": "Ocean Vessel",
          "v": "CMA CGM"
        },
        {
          "k": "Voyage Number",
          "v": "9887"
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
          "k": "Pre-carriage by",
          "v": ""
        },
        {
          "k": "Layout",
          "v": "HBL Draft Jasper 26"
        },
        {
          "k": "Catalogue",
          "v": "jasper #10"
        }
      ],
      "hblCargoHeaders": [
        "Container Nos, Seal Nos, Mark and Nos",
        "Number and kind of packages : description of goods",
        "Gross Weight(Kg)",
        "Volume"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 /\n20' DC X 1\nNIL MARKS",
          "STC: VALVE MATERIALS FOR MACHINERY PARTS\nFREIGHT PREPAID\nALL DESTINATION CHARGES ARE CONSIGNEE'S ACCOUNT",
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
      "containerNote": "Total Number of Containers or Packages (In words): ONE(1X20' DC) CONTAINER ONLY",
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "hblBlTitle": "Bill of Lading FOR COMBINED TRANSPORT OR PORT TO PORT SHIPMENT",
      "hblOriginals": "1(ONE)",
      "hblRegisteredNo": "MTO/DGS/1182/APR/2019",
      "hblDeliveryAgent": {
        "title": "APPLICATION FOR DELIVERY AT DESTINATION MUST BE MADE TO:",
        "lines": [
          "KingFisher Wings Dubai LLC",
          "DUBAI UNITED ARAB EMIRATES",
          "TEL: +971 55 5355 286",
          "EMAIL: inquiry@kingfishertec.com"
        ]
      },
      "termsLines": [
        "DRAFT — BILL OF LADING NOT NEGOTIABLE UNLESS CONSIGNED \"TO ORDER\"",
        "RECEIVED by the Carrier the Goods as specified above in apparent good order and condition unless otherwise stated.",
        "AS AGENT FOR THE CARRIER"
      ],
      "remarks": "JASPER"
    },
    "blocks": [
      {
        "type": "hblBlShell",
        "embedLogo": true,
        "variant": "combined"
      },
      {
        "type": "hblFreightSignature",
        "variant": "blClosing"
      },
      {
        "type": "colorfulFooter",
        "variant": "plain"
      }
    ]
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_27",
    "formatNumber": 11,
    "name": "HBL Draft Jasper 27",
    "paper": "A4",
    "rtl": false,
    "appendCustomerTerms": true,
    "theme": {
      "primary": "#101010",
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
      "formatBadgeLabel": "JASPER",
      "heroTitle": "DRAFT BILL OF LADING",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
      },
      "partyMid": {
        "title": "Consignee",
        "lines": [
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Job No.",
          "v": "CEXP190150"
        },
        {
          "k": "Booking Ref.",
          "v": "B/EXP/19/0254"
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
          "k": "Vessel / Voyage",
          "v": "CMA CGM / 9887"
        },
        {
          "k": "Ocean Vessel",
          "v": "CMA CGM"
        },
        {
          "k": "Voyage Number",
          "v": "9887"
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
          "k": "Pre-carriage by",
          "v": ""
        },
        {
          "k": "Layout",
          "v": "HBL Draft Jasper 27"
        },
        {
          "k": "Catalogue",
          "v": "jasper #11"
        }
      ],
      "hblCargoHeaders": [
        "Container Nos, Seal Nos, Mark and Nos",
        "Number and kind of packages : description of goods",
        "Gross Weight(Kg)",
        "Volume"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 /\n20' DC X 1\nNIL MARKS",
          "STC: VALVE MATERIALS FOR MACHINERY PARTS\nFREIGHT PREPAID\nALL DESTINATION CHARGES ARE CONSIGNEE'S ACCOUNT",
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
      "containerNote": "Total Number of Containers or Packages (In words): ONE(1X20' DC) CONTAINER ONLY",
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "hblBlTitle": "MULTI-MODAL TRANSPORT DOCUMENT",
      "hblOriginals": "1(ONE)",
      "hblRegisteredNo": "MTO/DGS/1182/APR/2019",
      "hblDeliveryAgent": {
        "title": "APPLICATION FOR DELIVERY AT DESTINATION MUST BE MADE TO:",
        "lines": [
          "KingFisher Wings Dubai LLC",
          "DUBAI UNITED ARAB EMIRATES",
          "TEL: +971 55 5355 286",
          "EMAIL: inquiry@kingfishertec.com"
        ]
      },
      "termsLines": [
        "DRAFT — BILL OF LADING NOT NEGOTIABLE UNLESS CONSIGNED \"TO ORDER\"",
        "RECEIVED by the Carrier the Goods as specified above in apparent good order and condition unless otherwise stated.",
        "AS AGENT FOR THE CARRIER"
      ],
      "remarks": "JASPER"
    },
    "blocks": [
      {
        "type": "hblBlShell",
        "embedLogo": true,
        "variant": "multimodal"
      },
      {
        "type": "hblFreightSignature",
        "variant": "blClosing"
      },
      {
        "type": "colorfulFooter",
        "variant": "plain"
      }
    ]
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_29",
    "formatNumber": 12,
    "name": "HBL Draft 29",
    "paper": "A4",
    "rtl": false,
    "appendCustomerTerms": true,
    "theme": {
      "primary": "#101010",
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
      "formatBadgeLabel": "JASPER",
      "heroTitle": "DRAFT BILL OF LADING",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
      },
      "partyMid": {
        "title": "Consignee",
        "lines": [
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Job No.",
          "v": "CEXP190150"
        },
        {
          "k": "Booking Ref.",
          "v": "B/EXP/19/0254"
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
          "k": "Vessel / Voyage",
          "v": "CMA CGM / 9887"
        },
        {
          "k": "Ocean Vessel",
          "v": "CMA CGM"
        },
        {
          "k": "Voyage Number",
          "v": "9887"
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
          "k": "Pre-carriage by",
          "v": ""
        },
        {
          "k": "Layout",
          "v": "HBL Draft 29"
        },
        {
          "k": "Catalogue",
          "v": "jasper #12"
        }
      ],
      "hblCargoHeaders": [
        "Container Nos, Seal Nos, Mark and Nos",
        "Number and kind of packages : description of goods",
        "Gross Weight(Kg)",
        "Volume"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 /\n20' DC X 1\nNIL MARKS",
          "STC: VALVE MATERIALS FOR MACHINERY PARTS\nFREIGHT PREPAID\nALL DESTINATION CHARGES ARE CONSIGNEE'S ACCOUNT",
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
      "containerNote": "Total Number of Containers or Packages (In words): ONE(1X20' DC) CONTAINER ONLY",
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "hblBlTitle": "MULTI-MODAL TRANSPORT DOCUMENT",
      "hblOriginals": "1(ONE)",
      "hblRegisteredNo": "MTO/DGS/1182/APR/2019",
      "hblDeliveryAgent": {
        "title": "APPLICATION FOR DELIVERY AT DESTINATION MUST BE MADE TO:",
        "lines": [
          "KingFisher Wings Dubai LLC",
          "DUBAI UNITED ARAB EMIRATES",
          "TEL: +971 55 5355 286",
          "EMAIL: inquiry@kingfishertec.com"
        ]
      },
      "termsLines": [
        "DRAFT — BILL OF LADING NOT NEGOTIABLE UNLESS CONSIGNED \"TO ORDER\"",
        "RECEIVED by the Carrier the Goods as specified above in apparent good order and condition unless otherwise stated.",
        "AS AGENT FOR THE CARRIER"
      ],
      "remarks": "JASPER"
    },
    "blocks": [
      {
        "type": "hblBlShell",
        "embedLogo": true,
        "variant": "multimodal"
      },
      {
        "type": "hblFreightSignature",
        "variant": "blClosing"
      },
      {
        "type": "colorfulFooter",
        "variant": "plain"
      }
    ]
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_33",
    "formatNumber": 13,
    "name": "HBL Original 33",
    "paper": "A4",
    "rtl": false,
    "appendCustomerTerms": true,
    "theme": {
      "primary": "#101010",
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
      "formatBadgeLabel": "ORIGINAL",
      "heroTitle": "ORIGINAL BILL OF LADING",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
      },
      "partyMid": {
        "title": "Consignee",
        "lines": [
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Job No.",
          "v": "CEXP190150"
        },
        {
          "k": "Booking Ref.",
          "v": "B/EXP/19/0254"
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
          "k": "Vessel / Voyage",
          "v": "CMA CGM / 9887"
        },
        {
          "k": "Ocean Vessel",
          "v": "CMA CGM"
        },
        {
          "k": "Voyage Number",
          "v": "9887"
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
          "k": "Pre-carriage by",
          "v": ""
        },
        {
          "k": "Layout",
          "v": "HBL Original 33"
        },
        {
          "k": "Catalogue",
          "v": "jasper #13"
        }
      ],
      "hblCargoHeaders": [
        "Container Nos, Seal Nos, Mark and Nos",
        "Number and kind of packages : description of goods",
        "Gross Weight(Kg)",
        "Volume"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 /\n20' DC X 1\nNIL MARKS",
          "STC: VALVE MATERIALS FOR MACHINERY PARTS\nFREIGHT PREPAID\nALL DESTINATION CHARGES ARE CONSIGNEE'S ACCOUNT",
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
      "containerNote": "Total Number of Containers or Packages (In words): ONE(1X20' DC) CONTAINER ONLY",
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "hblBlTitle": "Bill of Lading FOR COMBINED TRANSPORT OR PORT TO PORT SHIPMENT",
      "hblOriginals": "1(ONE)",
      "hblRegisteredNo": "MTO/DGS/1182/APR/2019",
      "hblDeliveryAgent": {
        "title": "APPLICATION FOR DELIVERY AT DESTINATION MUST BE MADE TO:",
        "lines": [
          "KingFisher Wings Dubai LLC",
          "DUBAI UNITED ARAB EMIRATES",
          "TEL: +971 55 5355 286",
          "EMAIL: inquiry@kingfishertec.com"
        ]
      },
      "termsLines": [
        "ORIGINAL — Negotiable when duly endorsed.",
        "RECEIVED by the Carrier the Goods as specified above in apparent good order and condition unless otherwise stated.",
        "AS AGENT FOR THE CARRIER"
      ],
      "remarks": "ORIGINAL"
    },
    "blocks": [
      {
        "type": "hblBlShell",
        "embedLogo": true,
        "variant": "combined"
      },
      {
        "type": "hblFreightSignature",
        "variant": "blClosing"
      },
      {
        "type": "colorfulFooter",
        "variant": "plain"
      }
    ]
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_36",
    "formatNumber": 14,
    "name": "HBL Draft Jasper 36",
    "paper": "A4",
    "rtl": false,
    "appendCustomerTerms": true,
    "theme": {
      "primary": "#101010",
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
      "formatBadgeLabel": "JASPER",
      "heroTitle": "DRAFT BILL OF LADING",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
      },
      "partyMid": {
        "title": "Consignee",
        "lines": [
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Job No.",
          "v": "CEXP190150"
        },
        {
          "k": "Booking Ref.",
          "v": "B/EXP/19/0254"
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
          "k": "Vessel / Voyage",
          "v": "CMA CGM / 9887"
        },
        {
          "k": "Ocean Vessel",
          "v": "CMA CGM"
        },
        {
          "k": "Voyage Number",
          "v": "9887"
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
          "k": "Pre-carriage by",
          "v": ""
        },
        {
          "k": "Layout",
          "v": "HBL Draft Jasper 36"
        },
        {
          "k": "Catalogue",
          "v": "jasper #14"
        }
      ],
      "hblCargoHeaders": [
        "Container Nos, Seal Nos, Mark and Nos",
        "Number and kind of packages : description of goods",
        "Gross Weight(Kg)",
        "Volume"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 /\n20' DC X 1\nNIL MARKS",
          "STC: VALVE MATERIALS FOR MACHINERY PARTS\nFREIGHT PREPAID\nALL DESTINATION CHARGES ARE CONSIGNEE'S ACCOUNT",
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
      "containerNote": "Total Number of Containers or Packages (In words): ONE(1X20' DC) CONTAINER ONLY",
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "hblBlTitle": "MULTIMODAL TRANSPORT DOCUMENT",
      "hblOriginals": "1(ONE)",
      "hblRegisteredNo": "MTO/DGS/1182/APR/2019",
      "hblDeliveryAgent": {
        "title": "APPLICATION FOR DELIVERY AT DESTINATION MUST BE MADE TO:",
        "lines": [
          "KingFisher Wings Dubai LLC",
          "DUBAI UNITED ARAB EMIRATES",
          "TEL: +971 55 5355 286",
          "EMAIL: inquiry@kingfishertec.com"
        ]
      },
      "termsLines": [
        "DRAFT — BILL OF LADING NOT NEGOTIABLE UNLESS CONSIGNED \"TO ORDER\"",
        "RECEIVED by the Carrier the Goods as specified above in apparent good order and condition unless otherwise stated.",
        "AS AGENT FOR THE CARRIER"
      ],
      "remarks": "JASPER"
    },
    "blocks": [
      {
        "type": "hblBlShell",
        "embedLogo": true,
        "variant": "mt"
      },
      {
        "type": "hblFreightSignature",
        "variant": "blClosing"
      },
      {
        "type": "colorfulFooter",
        "variant": "plain"
      }
    ]
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_40",
    "formatNumber": 15,
    "name": "HBL Draft Jasper 40",
    "paper": "A4",
    "rtl": false,
    "appendCustomerTerms": true,
    "theme": {
      "primary": "#101010",
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
      "formatBadgeLabel": "JASPER",
      "heroTitle": "DRAFT BILL OF LADING",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
      },
      "partyMid": {
        "title": "Consignee",
        "lines": [
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Job No.",
          "v": "CEXP190150"
        },
        {
          "k": "Booking Ref.",
          "v": "B/EXP/19/0254"
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
          "k": "Vessel / Voyage",
          "v": "CMA CGM / 9887"
        },
        {
          "k": "Ocean Vessel",
          "v": "CMA CGM"
        },
        {
          "k": "Voyage Number",
          "v": "9887"
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
          "k": "Pre-carriage by",
          "v": ""
        },
        {
          "k": "Layout",
          "v": "HBL Draft Jasper 40"
        },
        {
          "k": "Catalogue",
          "v": "jasper #15"
        }
      ],
      "hblCargoHeaders": [
        "Container Nos, Seal Nos, Mark and Nos",
        "Number and kind of packages : description of goods",
        "Gross Weight(Kg)",
        "Volume"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 /\n20' DC X 1\nNIL MARKS",
          "STC: VALVE MATERIALS FOR MACHINERY PARTS\nFREIGHT PREPAID\nALL DESTINATION CHARGES ARE CONSIGNEE'S ACCOUNT",
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
      "containerNote": "Total Number of Containers or Packages (In words): ONE(1X20' DC) CONTAINER ONLY",
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "hblBlTitle": "MULTI-MODAL TRANSPORT DOCUMENT",
      "hblOriginals": "1(ONE)",
      "hblRegisteredNo": "MTO/DGS/1182/APR/2019",
      "hblDeliveryAgent": {
        "title": "APPLICATION FOR DELIVERY AT DESTINATION MUST BE MADE TO:",
        "lines": [
          "KingFisher Wings Dubai LLC",
          "DUBAI UNITED ARAB EMIRATES",
          "TEL: +971 55 5355 286",
          "EMAIL: inquiry@kingfishertec.com"
        ]
      },
      "termsLines": [
        "DRAFT — BILL OF LADING NOT NEGOTIABLE UNLESS CONSIGNED \"TO ORDER\"",
        "RECEIVED by the Carrier the Goods as specified above in apparent good order and condition unless otherwise stated.",
        "AS AGENT FOR THE CARRIER"
      ],
      "remarks": "JASPER"
    },
    "blocks": [
      {
        "type": "hblBlShell",
        "embedLogo": true,
        "variant": "multimodal"
      },
      {
        "type": "hblFreightSignature",
        "variant": "blClosing"
      },
      {
        "type": "colorfulFooter",
        "variant": "plain"
      }
    ]
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_41",
    "formatNumber": 16,
    "name": "HBL Draft Jasper 41",
    "paper": "A4",
    "rtl": false,
    "appendCustomerTerms": true,
    "theme": {
      "primary": "#101010",
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
      "formatBadgeLabel": "JASPER",
      "heroTitle": "DRAFT BILL OF LADING",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
      },
      "partyMid": {
        "title": "Consignee",
        "lines": [
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Job No.",
          "v": "CEXP190150"
        },
        {
          "k": "Booking Ref.",
          "v": "B/EXP/19/0254"
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
          "k": "Vessel / Voyage",
          "v": "CMA CGM / 9887"
        },
        {
          "k": "Ocean Vessel",
          "v": "CMA CGM"
        },
        {
          "k": "Voyage Number",
          "v": "9887"
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
          "k": "Pre-carriage by",
          "v": ""
        },
        {
          "k": "Layout",
          "v": "HBL Draft Jasper 41"
        },
        {
          "k": "Catalogue",
          "v": "jasper #16"
        }
      ],
      "hblCargoHeaders": [
        "Container Nos, Seal Nos, Mark and Nos",
        "Number and kind of packages : description of goods",
        "Gross Weight(Kg)",
        "Volume"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 /\n20' DC X 1\nNIL MARKS",
          "STC: VALVE MATERIALS FOR MACHINERY PARTS\nFREIGHT PREPAID\nALL DESTINATION CHARGES ARE CONSIGNEE'S ACCOUNT",
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
      "containerNote": "Total Number of Containers or Packages (In words): ONE(1X20' DC) CONTAINER ONLY",
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "hblBlTitle": "MULTI-MODAL TRANSPORT DOCUMENT",
      "hblOriginals": "1(ONE)",
      "hblRegisteredNo": "MTO/DGS/1182/APR/2019",
      "hblDeliveryAgent": {
        "title": "APPLICATION FOR DELIVERY AT DESTINATION MUST BE MADE TO:",
        "lines": [
          "KingFisher Wings Dubai LLC",
          "DUBAI UNITED ARAB EMIRATES",
          "TEL: +971 55 5355 286",
          "EMAIL: inquiry@kingfishertec.com"
        ]
      },
      "termsLines": [
        "DRAFT — BILL OF LADING NOT NEGOTIABLE UNLESS CONSIGNED \"TO ORDER\"",
        "RECEIVED by the Carrier the Goods as specified above in apparent good order and condition unless otherwise stated.",
        "AS AGENT FOR THE CARRIER"
      ],
      "remarks": "JASPER"
    },
    "blocks": [
      {
        "type": "hblBlShell",
        "embedLogo": true,
        "variant": "multimodal"
      },
      {
        "type": "hblFreightSignature",
        "variant": "blClosing"
      },
      {
        "type": "colorfulFooter",
        "variant": "plain"
      }
    ]
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_42",
    "formatNumber": 17,
    "name": "HBL Draft Jasper 42",
    "paper": "A4",
    "rtl": false,
    "appendCustomerTerms": true,
    "theme": {
      "primary": "#101010",
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
      "formatBadgeLabel": "JASPER",
      "heroTitle": "DRAFT BILL OF LADING",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
      },
      "partyMid": {
        "title": "Consignee",
        "lines": [
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Job No.",
          "v": "CEXP190150"
        },
        {
          "k": "Booking Ref.",
          "v": "B/EXP/19/0254"
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
          "k": "Vessel / Voyage",
          "v": "CMA CGM / 9887"
        },
        {
          "k": "Ocean Vessel",
          "v": "CMA CGM"
        },
        {
          "k": "Voyage Number",
          "v": "9887"
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
          "k": "Pre-carriage by",
          "v": ""
        },
        {
          "k": "Layout",
          "v": "HBL Draft Jasper 42"
        },
        {
          "k": "Catalogue",
          "v": "jasper #17"
        }
      ],
      "hblCargoHeaders": [
        "Container Nos, Seal Nos, Mark and Nos",
        "Number and kind of packages : description of goods",
        "Gross Weight(Kg)",
        "Volume"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 /\n20' DC X 1\nNIL MARKS",
          "STC: VALVE MATERIALS FOR MACHINERY PARTS\nFREIGHT PREPAID\nALL DESTINATION CHARGES ARE CONSIGNEE'S ACCOUNT",
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
      "containerNote": "Total Number of Containers or Packages (In words): ONE(1X20' DC) CONTAINER ONLY",
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "hblBlTitle": "BILL OF LADING  NOT NEGOTIABLE UNLESS CONSIGNED \"TO ORDER\"",
      "hblOriginals": "1(ONE)",
      "hblRegisteredNo": "MTO/DGS/1182/APR/2019",
      "hblDeliveryAgent": {
        "title": "APPLICATION FOR DELIVERY AT DESTINATION MUST BE MADE TO:",
        "lines": [
          "KingFisher Wings Dubai LLC",
          "DUBAI UNITED ARAB EMIRATES",
          "TEL: +971 55 5355 286",
          "EMAIL: inquiry@kingfishertec.com"
        ]
      },
      "termsLines": [
        "DRAFT — BILL OF LADING NOT NEGOTIABLE UNLESS CONSIGNED \"TO ORDER\"",
        "RECEIVED by the Carrier the Goods as specified above in apparent good order and condition unless otherwise stated.",
        "AS AGENT FOR THE CARRIER"
      ],
      "remarks": "JASPER"
    },
    "blocks": [
      {
        "type": "hblBlShell",
        "embedLogo": true,
        "variant": "jasper"
      },
      {
        "type": "hblFreightSignature",
        "variant": "blClosing"
      },
      {
        "type": "colorfulFooter",
        "variant": "plain"
      }
    ]
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_43",
    "formatNumber": 18,
    "name": "HBL Draft Jasper 43 SGSIN",
    "paper": "A4",
    "rtl": false,
    "appendCustomerTerms": true,
    "theme": {
      "primary": "#101010",
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
      "formatBadgeLabel": "JASPER",
      "heroTitle": "DRAFT BILL OF LADING",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
      },
      "partyMid": {
        "title": "Consignee",
        "lines": [
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Job No.",
          "v": "CEXP190150"
        },
        {
          "k": "Booking Ref.",
          "v": "B/EXP/19/0254"
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
          "k": "Vessel / Voyage",
          "v": "CMA CGM / 9887"
        },
        {
          "k": "Ocean Vessel",
          "v": "CMA CGM"
        },
        {
          "k": "Voyage Number",
          "v": "9887"
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
          "k": "Pre-carriage by",
          "v": ""
        },
        {
          "k": "Layout",
          "v": "HBL Draft Jasper 43 SGSIN"
        },
        {
          "k": "Catalogue",
          "v": "jasper #18"
        }
      ],
      "hblCargoHeaders": [
        "Container Nos, Seal Nos, Mark and Nos",
        "Number and kind of packages : description of goods",
        "Gross Weight(Kg)",
        "Volume"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 /\n20' DC X 1\nNIL MARKS",
          "STC: VALVE MATERIALS FOR MACHINERY PARTS\nFREIGHT PREPAID\nALL DESTINATION CHARGES ARE CONSIGNEE'S ACCOUNT",
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
      "containerNote": "Total Number of Containers or Packages (In words): ONE(1X20' DC) CONTAINER ONLY",
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "hblBlTitle": "BILL OF LADING",
      "hblOriginals": "1(ONE)",
      "hblRegisteredNo": "MTO/DGS/1182/APR/2019",
      "hblDeliveryAgent": {
        "title": "APPLICATION FOR DELIVERY AT DESTINATION MUST BE MADE TO:",
        "lines": [
          "KingFisher Wings Dubai LLC",
          "DUBAI UNITED ARAB EMIRATES",
          "TEL: +971 55 5355 286",
          "EMAIL: inquiry@kingfishertec.com"
        ]
      },
      "termsLines": [
        "DRAFT — BILL OF LADING NOT NEGOTIABLE UNLESS CONSIGNED \"TO ORDER\"",
        "RECEIVED by the Carrier the Goods as specified above in apparent good order and condition unless otherwise stated.",
        "AS AGENT FOR THE CARRIER"
      ],
      "remarks": "JASPER"
    },
    "blocks": [
      {
        "type": "hblBlShell",
        "embedLogo": true,
        "variant": "ocean"
      },
      {
        "type": "hblFreightSignature",
        "variant": "blClosing"
      },
      {
        "type": "colorfulFooter",
        "variant": "plain"
      }
    ]
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_44",
    "formatNumber": 19,
    "name": "HBL Draft Jasper 44",
    "paper": "A4",
    "rtl": false,
    "appendCustomerTerms": true,
    "theme": {
      "primary": "#101010",
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
      "formatBadgeLabel": "JASPER",
      "heroTitle": "DRAFT BILL OF LADING",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
      },
      "partyMid": {
        "title": "Consignee",
        "lines": [
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Job No.",
          "v": "CEXP190150"
        },
        {
          "k": "Booking Ref.",
          "v": "B/EXP/19/0254"
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
          "k": "Vessel / Voyage",
          "v": "CMA CGM / 9887"
        },
        {
          "k": "Ocean Vessel",
          "v": "CMA CGM"
        },
        {
          "k": "Voyage Number",
          "v": "9887"
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
          "k": "Pre-carriage by",
          "v": ""
        },
        {
          "k": "Layout",
          "v": "HBL Draft Jasper 44"
        },
        {
          "k": "Catalogue",
          "v": "jasper #19"
        }
      ],
      "hblCargoHeaders": [
        "Container Nos, Seal Nos, Mark and Nos",
        "Number and kind of packages : description of goods",
        "Gross Weight(Kg)",
        "Volume"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 /\n20' DC X 1\nNIL MARKS",
          "STC: VALVE MATERIALS FOR MACHINERY PARTS\nFREIGHT PREPAID\nALL DESTINATION CHARGES ARE CONSIGNEE'S ACCOUNT",
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
      "containerNote": "Total Number of Containers or Packages (In words): ONE(1X20' DC) CONTAINER ONLY",
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "hblBlTitle": "MULTIMODAL TRANSPORT DOCUMENT",
      "hblOriginals": "1(ONE)",
      "hblRegisteredNo": "MTO/DGS/1182/APR/2019",
      "hblDeliveryAgent": {
        "title": "APPLICATION FOR DELIVERY AT DESTINATION MUST BE MADE TO:",
        "lines": [
          "KingFisher Wings Dubai LLC",
          "DUBAI UNITED ARAB EMIRATES",
          "TEL: +971 55 5355 286",
          "EMAIL: inquiry@kingfishertec.com"
        ]
      },
      "termsLines": [
        "DRAFT — BILL OF LADING NOT NEGOTIABLE UNLESS CONSIGNED \"TO ORDER\"",
        "RECEIVED by the Carrier the Goods as specified above in apparent good order and condition unless otherwise stated.",
        "AS AGENT FOR THE CARRIER"
      ],
      "remarks": "JASPER"
    },
    "blocks": [
      {
        "type": "hblBlShell",
        "embedLogo": true,
        "variant": "mt"
      },
      {
        "type": "hblFreightSignature",
        "variant": "blClosing"
      },
      {
        "type": "colorfulFooter",
        "variant": "plain"
      }
    ]
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_45",
    "formatNumber": 20,
    "name": "HBL Draft Jasper 45",
    "paper": "A4",
    "rtl": false,
    "appendCustomerTerms": true,
    "theme": {
      "primary": "#101010",
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
      "formatBadgeLabel": "JASPER",
      "heroTitle": "DRAFT BILL OF LADING",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
      },
      "partyMid": {
        "title": "Consignee",
        "lines": [
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Job No.",
          "v": "CEXP190150"
        },
        {
          "k": "Booking Ref.",
          "v": "B/EXP/19/0254"
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
          "k": "Vessel / Voyage",
          "v": "CMA CGM / 9887"
        },
        {
          "k": "Ocean Vessel",
          "v": "CMA CGM"
        },
        {
          "k": "Voyage Number",
          "v": "9887"
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
          "k": "Pre-carriage by",
          "v": ""
        },
        {
          "k": "Layout",
          "v": "HBL Draft Jasper 45"
        },
        {
          "k": "Catalogue",
          "v": "jasper #20"
        }
      ],
      "hblCargoHeaders": [
        "Container Nos, Seal Nos, Mark and Nos",
        "Number and kind of packages : description of goods",
        "Gross Weight(Kg)",
        "Volume"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 /\n20' DC X 1\nNIL MARKS",
          "STC: VALVE MATERIALS FOR MACHINERY PARTS\nFREIGHT PREPAID\nALL DESTINATION CHARGES ARE CONSIGNEE'S ACCOUNT",
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
      "containerNote": "Total Number of Containers or Packages (In words): ONE(1X20' DC) CONTAINER ONLY",
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "hblBlTitle": "Bill of Lading FOR COMBINED TRANSPORT OR PORT TO PORT SHIPMENT",
      "hblOriginals": "1(ONE)",
      "hblRegisteredNo": "MTO/DGS/1182/APR/2019",
      "hblDeliveryAgent": {
        "title": "APPLICATION FOR DELIVERY AT DESTINATION MUST BE MADE TO:",
        "lines": [
          "KingFisher Wings Dubai LLC",
          "DUBAI UNITED ARAB EMIRATES",
          "TEL: +971 55 5355 286",
          "EMAIL: inquiry@kingfishertec.com"
        ]
      },
      "termsLines": [
        "DRAFT — BILL OF LADING NOT NEGOTIABLE UNLESS CONSIGNED \"TO ORDER\"",
        "RECEIVED by the Carrier the Goods as specified above in apparent good order and condition unless otherwise stated.",
        "AS AGENT FOR THE CARRIER"
      ],
      "remarks": "JASPER"
    },
    "blocks": [
      {
        "type": "hblBlShell",
        "embedLogo": true,
        "variant": "combined"
      },
      {
        "type": "hblFreightSignature",
        "variant": "blClosing"
      },
      {
        "type": "colorfulFooter",
        "variant": "plain"
      }
    ]
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_46",
    "formatNumber": 21,
    "name": "HBL Draft Jasper 46",
    "paper": "A4",
    "rtl": false,
    "appendCustomerTerms": true,
    "theme": {
      "primary": "#101010",
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
      "formatBadgeLabel": "JASPER",
      "heroTitle": "DRAFT BILL OF LADING",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
      },
      "partyMid": {
        "title": "Consignee",
        "lines": [
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Job No.",
          "v": "CEXP190150"
        },
        {
          "k": "Booking Ref.",
          "v": "B/EXP/19/0254"
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
          "k": "Vessel / Voyage",
          "v": "CMA CGM / 9887"
        },
        {
          "k": "Ocean Vessel",
          "v": "CMA CGM"
        },
        {
          "k": "Voyage Number",
          "v": "9887"
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
          "k": "Pre-carriage by",
          "v": ""
        },
        {
          "k": "Layout",
          "v": "HBL Draft Jasper 46"
        },
        {
          "k": "Catalogue",
          "v": "jasper #21"
        }
      ],
      "hblCargoHeaders": [
        "Container Nos, Seal Nos, Mark and Nos",
        "Number and kind of packages : description of goods",
        "Gross Weight(Kg)",
        "Volume"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 /\n20' DC X 1\nNIL MARKS",
          "STC: VALVE MATERIALS FOR MACHINERY PARTS\nFREIGHT PREPAID\nALL DESTINATION CHARGES ARE CONSIGNEE'S ACCOUNT",
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
      "containerNote": "Total Number of Containers or Packages (In words): ONE(1X20' DC) CONTAINER ONLY",
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "hblBlTitle": "MULTI-MODAL TRANSPORT DOCUMENT",
      "hblOriginals": "1(ONE)",
      "hblRegisteredNo": "MTO/DGS/1182/APR/2019",
      "hblDeliveryAgent": {
        "title": "APPLICATION FOR DELIVERY AT DESTINATION MUST BE MADE TO:",
        "lines": [
          "KingFisher Wings Dubai LLC",
          "DUBAI UNITED ARAB EMIRATES",
          "TEL: +971 55 5355 286",
          "EMAIL: inquiry@kingfishertec.com"
        ]
      },
      "termsLines": [
        "DRAFT — BILL OF LADING NOT NEGOTIABLE UNLESS CONSIGNED \"TO ORDER\"",
        "RECEIVED by the Carrier the Goods as specified above in apparent good order and condition unless otherwise stated.",
        "AS AGENT FOR THE CARRIER"
      ],
      "remarks": "JASPER"
    },
    "blocks": [
      {
        "type": "hblBlShell",
        "embedLogo": true,
        "variant": "multimodal"
      },
      {
        "type": "hblFreightSignature",
        "variant": "blClosing"
      },
      {
        "type": "colorfulFooter",
        "variant": "plain"
      }
    ]
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_47",
    "formatNumber": 22,
    "name": "HBL Draft Jasper 47",
    "paper": "A4",
    "rtl": false,
    "appendCustomerTerms": true,
    "theme": {
      "primary": "#101010",
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
      "formatBadgeLabel": "JASPER",
      "heroTitle": "DRAFT BILL OF LADING",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
      },
      "partyMid": {
        "title": "Consignee",
        "lines": [
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Job No.",
          "v": "CEXP190150"
        },
        {
          "k": "Booking Ref.",
          "v": "B/EXP/19/0254"
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
          "k": "Vessel / Voyage",
          "v": "CMA CGM / 9887"
        },
        {
          "k": "Ocean Vessel",
          "v": "CMA CGM"
        },
        {
          "k": "Voyage Number",
          "v": "9887"
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
          "k": "Pre-carriage by",
          "v": ""
        },
        {
          "k": "Layout",
          "v": "HBL Draft Jasper 47"
        },
        {
          "k": "Catalogue",
          "v": "jasper #22"
        }
      ],
      "hblCargoHeaders": [
        "Container Nos, Seal Nos, Mark and Nos",
        "Number and kind of packages : description of goods",
        "Gross Weight(Kg)",
        "Volume"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 /\n20' DC X 1\nNIL MARKS",
          "STC: VALVE MATERIALS FOR MACHINERY PARTS\nFREIGHT PREPAID\nALL DESTINATION CHARGES ARE CONSIGNEE'S ACCOUNT",
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
      "containerNote": "Total Number of Containers or Packages (In words): ONE(1X20' DC) CONTAINER ONLY",
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "hblBlTitle": "BILL OF LADING  NOT NEGOTIABLE UNLESS CONSIGNED \"TO ORDER\"",
      "hblOriginals": "1(ONE)",
      "hblRegisteredNo": "MTO/DGS/1182/APR/2019",
      "hblDeliveryAgent": {
        "title": "APPLICATION FOR DELIVERY AT DESTINATION MUST BE MADE TO:",
        "lines": [
          "KingFisher Wings Dubai LLC",
          "DUBAI UNITED ARAB EMIRATES",
          "TEL: +971 55 5355 286",
          "EMAIL: inquiry@kingfishertec.com"
        ]
      },
      "termsLines": [
        "DRAFT — BILL OF LADING NOT NEGOTIABLE UNLESS CONSIGNED \"TO ORDER\"",
        "RECEIVED by the Carrier the Goods as specified above in apparent good order and condition unless otherwise stated.",
        "AS AGENT FOR THE CARRIER"
      ],
      "remarks": "JASPER"
    },
    "blocks": [
      {
        "type": "hblBlShell",
        "embedLogo": true,
        "variant": "jasper"
      },
      {
        "type": "hblFreightSignature",
        "variant": "blClosing"
      },
      {
        "type": "colorfulFooter",
        "variant": "plain"
      }
    ]
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_48",
    "formatNumber": 23,
    "name": "HBL Draft Jasper 48",
    "paper": "A4",
    "rtl": false,
    "appendCustomerTerms": true,
    "theme": {
      "primary": "#101010",
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
      "formatBadgeLabel": "JASPER",
      "heroTitle": "DRAFT BILL OF LADING",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
      },
      "partyMid": {
        "title": "Consignee",
        "lines": [
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Job No.",
          "v": "CEXP190150"
        },
        {
          "k": "Booking Ref.",
          "v": "B/EXP/19/0254"
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
          "k": "Vessel / Voyage",
          "v": "CMA CGM / 9887"
        },
        {
          "k": "Ocean Vessel",
          "v": "CMA CGM"
        },
        {
          "k": "Voyage Number",
          "v": "9887"
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
          "k": "Pre-carriage by",
          "v": ""
        },
        {
          "k": "Layout",
          "v": "HBL Draft Jasper 48"
        },
        {
          "k": "Catalogue",
          "v": "jasper #23"
        }
      ],
      "hblCargoHeaders": [
        "Container Nos, Seal Nos, Mark and Nos",
        "Number and kind of packages : description of goods",
        "Gross Weight(Kg)",
        "Volume"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 /\n20' DC X 1\nNIL MARKS",
          "STC: VALVE MATERIALS FOR MACHINERY PARTS\nFREIGHT PREPAID\nALL DESTINATION CHARGES ARE CONSIGNEE'S ACCOUNT",
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
      "containerNote": "Total Number of Containers or Packages (In words): ONE(1X20' DC) CONTAINER ONLY",
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "hblBlTitle": "BILL OF LADING",
      "hblOriginals": "1(ONE)",
      "hblRegisteredNo": "MTO/DGS/1182/APR/2019",
      "hblDeliveryAgent": {
        "title": "APPLICATION FOR DELIVERY AT DESTINATION MUST BE MADE TO:",
        "lines": [
          "KingFisher Wings Dubai LLC",
          "DUBAI UNITED ARAB EMIRATES",
          "TEL: +971 55 5355 286",
          "EMAIL: inquiry@kingfishertec.com"
        ]
      },
      "termsLines": [
        "DRAFT — BILL OF LADING NOT NEGOTIABLE UNLESS CONSIGNED \"TO ORDER\"",
        "RECEIVED by the Carrier the Goods as specified above in apparent good order and condition unless otherwise stated.",
        "AS AGENT FOR THE CARRIER"
      ],
      "remarks": "JASPER"
    },
    "blocks": [
      {
        "type": "hblBlShell",
        "embedLogo": true,
        "variant": "ocean"
      },
      {
        "type": "hblFreightSignature",
        "variant": "blClosing"
      },
      {
        "type": "colorfulFooter",
        "variant": "plain"
      }
    ]
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_49",
    "formatNumber": 24,
    "name": "HBL Draft Jasper 49",
    "paper": "A4",
    "rtl": false,
    "appendCustomerTerms": true,
    "theme": {
      "primary": "#101010",
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
      "formatBadgeLabel": "JASPER",
      "heroTitle": "DRAFT BILL OF LADING",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
      },
      "partyMid": {
        "title": "Consignee",
        "lines": [
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Job No.",
          "v": "CEXP190150"
        },
        {
          "k": "Booking Ref.",
          "v": "B/EXP/19/0254"
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
          "k": "Vessel / Voyage",
          "v": "CMA CGM / 9887"
        },
        {
          "k": "Ocean Vessel",
          "v": "CMA CGM"
        },
        {
          "k": "Voyage Number",
          "v": "9887"
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
          "k": "Pre-carriage by",
          "v": ""
        },
        {
          "k": "Layout",
          "v": "HBL Draft Jasper 49"
        },
        {
          "k": "Catalogue",
          "v": "jasper #24"
        }
      ],
      "hblCargoHeaders": [
        "Container Nos, Seal Nos, Mark and Nos",
        "Number and kind of packages : description of goods",
        "Gross Weight(Kg)",
        "Volume"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 /\n20' DC X 1\nNIL MARKS",
          "STC: VALVE MATERIALS FOR MACHINERY PARTS\nFREIGHT PREPAID\nALL DESTINATION CHARGES ARE CONSIGNEE'S ACCOUNT",
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
      "containerNote": "Total Number of Containers or Packages (In words): ONE(1X20' DC) CONTAINER ONLY",
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "hblBlTitle": "MULTIMODAL TRANSPORT DOCUMENT",
      "hblOriginals": "1(ONE)",
      "hblRegisteredNo": "MTO/DGS/1182/APR/2019",
      "hblDeliveryAgent": {
        "title": "APPLICATION FOR DELIVERY AT DESTINATION MUST BE MADE TO:",
        "lines": [
          "KingFisher Wings Dubai LLC",
          "DUBAI UNITED ARAB EMIRATES",
          "TEL: +971 55 5355 286",
          "EMAIL: inquiry@kingfishertec.com"
        ]
      },
      "termsLines": [
        "DRAFT — BILL OF LADING NOT NEGOTIABLE UNLESS CONSIGNED \"TO ORDER\"",
        "RECEIVED by the Carrier the Goods as specified above in apparent good order and condition unless otherwise stated.",
        "AS AGENT FOR THE CARRIER"
      ],
      "remarks": "JASPER"
    },
    "blocks": [
      {
        "type": "hblBlShell",
        "embedLogo": true,
        "variant": "mt"
      },
      {
        "type": "hblFreightSignature",
        "variant": "blClosing"
      },
      {
        "type": "colorfulFooter",
        "variant": "plain"
      }
    ]
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_50",
    "formatNumber": 25,
    "name": "HBL Draft Jasper 50",
    "paper": "A4",
    "rtl": false,
    "appendCustomerTerms": true,
    "theme": {
      "primary": "#101010",
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
      "formatBadgeLabel": "JASPER",
      "heroTitle": "DRAFT BILL OF LADING",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
      },
      "partyMid": {
        "title": "Consignee",
        "lines": [
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Job No.",
          "v": "CEXP190150"
        },
        {
          "k": "Booking Ref.",
          "v": "B/EXP/19/0254"
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
          "k": "Vessel / Voyage",
          "v": "CMA CGM / 9887"
        },
        {
          "k": "Ocean Vessel",
          "v": "CMA CGM"
        },
        {
          "k": "Voyage Number",
          "v": "9887"
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
          "k": "Pre-carriage by",
          "v": ""
        },
        {
          "k": "Layout",
          "v": "HBL Draft Jasper 50"
        },
        {
          "k": "Catalogue",
          "v": "jasper #25"
        }
      ],
      "hblCargoHeaders": [
        "Container Nos, Seal Nos, Mark and Nos",
        "Number and kind of packages : description of goods",
        "Gross Weight(Kg)",
        "Volume"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 /\n20' DC X 1\nNIL MARKS",
          "STC: VALVE MATERIALS FOR MACHINERY PARTS\nFREIGHT PREPAID\nALL DESTINATION CHARGES ARE CONSIGNEE'S ACCOUNT",
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
      "containerNote": "Total Number of Containers or Packages (In words): ONE(1X20' DC) CONTAINER ONLY",
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "hblBlTitle": "Bill of Lading FOR COMBINED TRANSPORT OR PORT TO PORT SHIPMENT",
      "hblOriginals": "1(ONE)",
      "hblRegisteredNo": "MTO/DGS/1182/APR/2019",
      "hblDeliveryAgent": {
        "title": "APPLICATION FOR DELIVERY AT DESTINATION MUST BE MADE TO:",
        "lines": [
          "KingFisher Wings Dubai LLC",
          "DUBAI UNITED ARAB EMIRATES",
          "TEL: +971 55 5355 286",
          "EMAIL: inquiry@kingfishertec.com"
        ]
      },
      "termsLines": [
        "DRAFT — BILL OF LADING NOT NEGOTIABLE UNLESS CONSIGNED \"TO ORDER\"",
        "RECEIVED by the Carrier the Goods as specified above in apparent good order and condition unless otherwise stated.",
        "AS AGENT FOR THE CARRIER"
      ],
      "remarks": "JASPER"
    },
    "blocks": [
      {
        "type": "hblBlShell",
        "embedLogo": true,
        "variant": "combined"
      },
      {
        "type": "hblFreightSignature",
        "variant": "blClosing"
      },
      {
        "type": "colorfulFooter",
        "variant": "plain"
      }
    ]
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_51",
    "formatNumber": 26,
    "name": "HBL Draft Jasper 51",
    "paper": "A4",
    "rtl": false,
    "appendCustomerTerms": true,
    "theme": {
      "primary": "#101010",
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
      "formatBadgeLabel": "JASPER",
      "heroTitle": "DRAFT BILL OF LADING",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
      },
      "partyMid": {
        "title": "Consignee",
        "lines": [
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Job No.",
          "v": "CEXP190150"
        },
        {
          "k": "Booking Ref.",
          "v": "B/EXP/19/0254"
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
          "k": "Vessel / Voyage",
          "v": "CMA CGM / 9887"
        },
        {
          "k": "Ocean Vessel",
          "v": "CMA CGM"
        },
        {
          "k": "Voyage Number",
          "v": "9887"
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
          "k": "Pre-carriage by",
          "v": ""
        },
        {
          "k": "Layout",
          "v": "HBL Draft Jasper 51"
        },
        {
          "k": "Catalogue",
          "v": "jasper #26"
        }
      ],
      "hblCargoHeaders": [
        "Container Nos, Seal Nos, Mark and Nos",
        "Number and kind of packages : description of goods",
        "Gross Weight(Kg)",
        "Volume"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 /\n20' DC X 1\nNIL MARKS",
          "STC: VALVE MATERIALS FOR MACHINERY PARTS\nFREIGHT PREPAID\nALL DESTINATION CHARGES ARE CONSIGNEE'S ACCOUNT",
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
      "containerNote": "Total Number of Containers or Packages (In words): ONE(1X20' DC) CONTAINER ONLY",
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "hblBlTitle": "MULTI-MODAL TRANSPORT DOCUMENT",
      "hblOriginals": "1(ONE)",
      "hblRegisteredNo": "MTO/DGS/1182/APR/2019",
      "hblDeliveryAgent": {
        "title": "APPLICATION FOR DELIVERY AT DESTINATION MUST BE MADE TO:",
        "lines": [
          "KingFisher Wings Dubai LLC",
          "DUBAI UNITED ARAB EMIRATES",
          "TEL: +971 55 5355 286",
          "EMAIL: inquiry@kingfishertec.com"
        ]
      },
      "termsLines": [
        "DRAFT — BILL OF LADING NOT NEGOTIABLE UNLESS CONSIGNED \"TO ORDER\"",
        "RECEIVED by the Carrier the Goods as specified above in apparent good order and condition unless otherwise stated.",
        "AS AGENT FOR THE CARRIER"
      ],
      "remarks": "JASPER"
    },
    "blocks": [
      {
        "type": "hblBlShell",
        "embedLogo": true,
        "variant": "multimodal"
      },
      {
        "type": "hblFreightSignature",
        "variant": "blClosing"
      },
      {
        "type": "colorfulFooter",
        "variant": "plain"
      }
    ]
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_52",
    "formatNumber": 27,
    "name": "HBL Draft Jasper 52",
    "paper": "A4",
    "rtl": false,
    "appendCustomerTerms": true,
    "theme": {
      "primary": "#101010",
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
      "formatBadgeLabel": "JASPER",
      "heroTitle": "DRAFT BILL OF LADING",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
      },
      "partyMid": {
        "title": "Consignee",
        "lines": [
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Job No.",
          "v": "CEXP190150"
        },
        {
          "k": "Booking Ref.",
          "v": "B/EXP/19/0254"
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
          "k": "Vessel / Voyage",
          "v": "CMA CGM / 9887"
        },
        {
          "k": "Ocean Vessel",
          "v": "CMA CGM"
        },
        {
          "k": "Voyage Number",
          "v": "9887"
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
          "k": "Pre-carriage by",
          "v": ""
        },
        {
          "k": "Layout",
          "v": "HBL Draft Jasper 52"
        },
        {
          "k": "Catalogue",
          "v": "jasper #27"
        }
      ],
      "hblCargoHeaders": [
        "Container Nos, Seal Nos, Mark and Nos",
        "Number and kind of packages : description of goods",
        "Gross Weight(Kg)",
        "Volume"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 /\n20' DC X 1\nNIL MARKS",
          "STC: VALVE MATERIALS FOR MACHINERY PARTS\nFREIGHT PREPAID\nALL DESTINATION CHARGES ARE CONSIGNEE'S ACCOUNT",
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
      "containerNote": "Total Number of Containers or Packages (In words): ONE(1X20' DC) CONTAINER ONLY",
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "hblBlTitle": "BILL OF LADING  NOT NEGOTIABLE UNLESS CONSIGNED \"TO ORDER\"",
      "hblOriginals": "1(ONE)",
      "hblRegisteredNo": "MTO/DGS/1182/APR/2019",
      "hblDeliveryAgent": {
        "title": "APPLICATION FOR DELIVERY AT DESTINATION MUST BE MADE TO:",
        "lines": [
          "KingFisher Wings Dubai LLC",
          "DUBAI UNITED ARAB EMIRATES",
          "TEL: +971 55 5355 286",
          "EMAIL: inquiry@kingfishertec.com"
        ]
      },
      "termsLines": [
        "DRAFT — BILL OF LADING NOT NEGOTIABLE UNLESS CONSIGNED \"TO ORDER\"",
        "RECEIVED by the Carrier the Goods as specified above in apparent good order and condition unless otherwise stated.",
        "AS AGENT FOR THE CARRIER"
      ],
      "remarks": "JASPER"
    },
    "blocks": [
      {
        "type": "hblBlShell",
        "embedLogo": true,
        "variant": "jasper"
      },
      {
        "type": "hblFreightSignature",
        "variant": "blClosing"
      },
      {
        "type": "colorfulFooter",
        "variant": "plain"
      }
    ]
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_53",
    "formatNumber": 28,
    "name": "HBL Draft Jasper 53",
    "paper": "A4",
    "rtl": false,
    "appendCustomerTerms": true,
    "theme": {
      "primary": "#101010",
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
      "formatBadgeLabel": "JASPER",
      "heroTitle": "DRAFT BILL OF LADING",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
      },
      "partyMid": {
        "title": "Consignee",
        "lines": [
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Job No.",
          "v": "CEXP190150"
        },
        {
          "k": "Booking Ref.",
          "v": "B/EXP/19/0254"
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
          "k": "Vessel / Voyage",
          "v": "CMA CGM / 9887"
        },
        {
          "k": "Ocean Vessel",
          "v": "CMA CGM"
        },
        {
          "k": "Voyage Number",
          "v": "9887"
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
          "k": "Pre-carriage by",
          "v": ""
        },
        {
          "k": "Layout",
          "v": "HBL Draft Jasper 53"
        },
        {
          "k": "Catalogue",
          "v": "jasper #28"
        }
      ],
      "hblCargoHeaders": [
        "Container Nos, Seal Nos, Mark and Nos",
        "Number and kind of packages : description of goods",
        "Gross Weight(Kg)",
        "Volume"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 /\n20' DC X 1\nNIL MARKS",
          "STC: VALVE MATERIALS FOR MACHINERY PARTS\nFREIGHT PREPAID\nALL DESTINATION CHARGES ARE CONSIGNEE'S ACCOUNT",
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
      "containerNote": "Total Number of Containers or Packages (In words): ONE(1X20' DC) CONTAINER ONLY",
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "hblBlTitle": "BILL OF LADING",
      "hblOriginals": "1(ONE)",
      "hblRegisteredNo": "MTO/DGS/1182/APR/2019",
      "hblDeliveryAgent": {
        "title": "APPLICATION FOR DELIVERY AT DESTINATION MUST BE MADE TO:",
        "lines": [
          "KingFisher Wings Dubai LLC",
          "DUBAI UNITED ARAB EMIRATES",
          "TEL: +971 55 5355 286",
          "EMAIL: inquiry@kingfishertec.com"
        ]
      },
      "termsLines": [
        "DRAFT — BILL OF LADING NOT NEGOTIABLE UNLESS CONSIGNED \"TO ORDER\"",
        "RECEIVED by the Carrier the Goods as specified above in apparent good order and condition unless otherwise stated.",
        "AS AGENT FOR THE CARRIER"
      ],
      "remarks": "JASPER"
    },
    "blocks": [
      {
        "type": "hblBlShell",
        "embedLogo": true,
        "variant": "ocean"
      },
      {
        "type": "hblFreightSignature",
        "variant": "blClosing"
      },
      {
        "type": "colorfulFooter",
        "variant": "plain"
      }
    ]
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_54",
    "formatNumber": 29,
    "name": "HBL Draft Jasper 54",
    "paper": "A4",
    "rtl": false,
    "appendCustomerTerms": true,
    "theme": {
      "primary": "#101010",
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
      "formatBadgeLabel": "JASPER",
      "heroTitle": "DRAFT BILL OF LADING",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
      },
      "partyMid": {
        "title": "Consignee",
        "lines": [
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Job No.",
          "v": "CEXP190150"
        },
        {
          "k": "Booking Ref.",
          "v": "B/EXP/19/0254"
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
          "k": "Vessel / Voyage",
          "v": "CMA CGM / 9887"
        },
        {
          "k": "Ocean Vessel",
          "v": "CMA CGM"
        },
        {
          "k": "Voyage Number",
          "v": "9887"
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
          "k": "Pre-carriage by",
          "v": ""
        },
        {
          "k": "Layout",
          "v": "HBL Draft Jasper 54"
        },
        {
          "k": "Catalogue",
          "v": "jasper #29"
        }
      ],
      "hblCargoHeaders": [
        "Container Nos, Seal Nos, Mark and Nos",
        "Number and kind of packages : description of goods",
        "Gross Weight(Kg)",
        "Volume"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 /\n20' DC X 1\nNIL MARKS",
          "STC: VALVE MATERIALS FOR MACHINERY PARTS\nFREIGHT PREPAID\nALL DESTINATION CHARGES ARE CONSIGNEE'S ACCOUNT",
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
      "containerNote": "Total Number of Containers or Packages (In words): ONE(1X20' DC) CONTAINER ONLY",
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "hblBlTitle": "MULTIMODAL TRANSPORT DOCUMENT",
      "hblOriginals": "1(ONE)",
      "hblRegisteredNo": "MTO/DGS/1182/APR/2019",
      "hblDeliveryAgent": {
        "title": "APPLICATION FOR DELIVERY AT DESTINATION MUST BE MADE TO:",
        "lines": [
          "KingFisher Wings Dubai LLC",
          "DUBAI UNITED ARAB EMIRATES",
          "TEL: +971 55 5355 286",
          "EMAIL: inquiry@kingfishertec.com"
        ]
      },
      "termsLines": [
        "DRAFT — BILL OF LADING NOT NEGOTIABLE UNLESS CONSIGNED \"TO ORDER\"",
        "RECEIVED by the Carrier the Goods as specified above in apparent good order and condition unless otherwise stated.",
        "AS AGENT FOR THE CARRIER"
      ],
      "remarks": "JASPER"
    },
    "blocks": [
      {
        "type": "hblBlShell",
        "embedLogo": true,
        "variant": "mt"
      },
      {
        "type": "hblFreightSignature",
        "variant": "blClosing"
      },
      {
        "type": "colorfulFooter",
        "variant": "plain"
      }
    ]
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_55",
    "formatNumber": 30,
    "name": "HBL Draft Jasper 55",
    "paper": "A4",
    "rtl": false,
    "appendCustomerTerms": true,
    "theme": {
      "primary": "#101010",
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
      "formatBadgeLabel": "JASPER",
      "heroTitle": "DRAFT BILL OF LADING",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
      },
      "partyMid": {
        "title": "Consignee",
        "lines": [
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Job No.",
          "v": "CEXP190150"
        },
        {
          "k": "Booking Ref.",
          "v": "B/EXP/19/0254"
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
          "k": "Vessel / Voyage",
          "v": "CMA CGM / 9887"
        },
        {
          "k": "Ocean Vessel",
          "v": "CMA CGM"
        },
        {
          "k": "Voyage Number",
          "v": "9887"
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
          "k": "Pre-carriage by",
          "v": ""
        },
        {
          "k": "Layout",
          "v": "HBL Draft Jasper 55"
        },
        {
          "k": "Catalogue",
          "v": "jasper #30"
        }
      ],
      "hblCargoHeaders": [
        "Container Nos, Seal Nos, Mark and Nos",
        "Number and kind of packages : description of goods",
        "Gross Weight(Kg)",
        "Volume"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 /\n20' DC X 1\nNIL MARKS",
          "STC: VALVE MATERIALS FOR MACHINERY PARTS\nFREIGHT PREPAID\nALL DESTINATION CHARGES ARE CONSIGNEE'S ACCOUNT",
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
      "containerNote": "Total Number of Containers or Packages (In words): ONE(1X20' DC) CONTAINER ONLY",
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "hblBlTitle": "Bill of Lading FOR COMBINED TRANSPORT OR PORT TO PORT SHIPMENT",
      "hblOriginals": "1(ONE)",
      "hblRegisteredNo": "MTO/DGS/1182/APR/2019",
      "hblDeliveryAgent": {
        "title": "APPLICATION FOR DELIVERY AT DESTINATION MUST BE MADE TO:",
        "lines": [
          "KingFisher Wings Dubai LLC",
          "DUBAI UNITED ARAB EMIRATES",
          "TEL: +971 55 5355 286",
          "EMAIL: inquiry@kingfishertec.com"
        ]
      },
      "termsLines": [
        "DRAFT — BILL OF LADING NOT NEGOTIABLE UNLESS CONSIGNED \"TO ORDER\"",
        "RECEIVED by the Carrier the Goods as specified above in apparent good order and condition unless otherwise stated.",
        "AS AGENT FOR THE CARRIER"
      ],
      "remarks": "JASPER"
    },
    "blocks": [
      {
        "type": "hblBlShell",
        "embedLogo": true,
        "variant": "combined"
      },
      {
        "type": "hblFreightSignature",
        "variant": "blClosing"
      },
      {
        "type": "colorfulFooter",
        "variant": "plain"
      }
    ]
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_56",
    "formatNumber": 31,
    "name": "HBL Draft Jasper 56",
    "paper": "A4",
    "rtl": false,
    "appendCustomerTerms": true,
    "theme": {
      "primary": "#101010",
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
      "formatBadgeLabel": "JASPER",
      "heroTitle": "DRAFT BILL OF LADING",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
      },
      "partyMid": {
        "title": "Consignee",
        "lines": [
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Job No.",
          "v": "CEXP190150"
        },
        {
          "k": "Booking Ref.",
          "v": "B/EXP/19/0254"
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
          "k": "Vessel / Voyage",
          "v": "CMA CGM / 9887"
        },
        {
          "k": "Ocean Vessel",
          "v": "CMA CGM"
        },
        {
          "k": "Voyage Number",
          "v": "9887"
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
          "k": "Pre-carriage by",
          "v": ""
        },
        {
          "k": "Layout",
          "v": "HBL Draft Jasper 56"
        },
        {
          "k": "Catalogue",
          "v": "jasper #31"
        }
      ],
      "hblCargoHeaders": [
        "Container Nos, Seal Nos, Mark and Nos",
        "Number and kind of packages : description of goods",
        "Gross Weight(Kg)",
        "Volume"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 /\n20' DC X 1\nNIL MARKS",
          "STC: VALVE MATERIALS FOR MACHINERY PARTS\nFREIGHT PREPAID\nALL DESTINATION CHARGES ARE CONSIGNEE'S ACCOUNT",
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
      "containerNote": "Total Number of Containers or Packages (In words): ONE(1X20' DC) CONTAINER ONLY",
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "hblBlTitle": "MULTI-MODAL TRANSPORT DOCUMENT",
      "hblOriginals": "1(ONE)",
      "hblRegisteredNo": "MTO/DGS/1182/APR/2019",
      "hblDeliveryAgent": {
        "title": "APPLICATION FOR DELIVERY AT DESTINATION MUST BE MADE TO:",
        "lines": [
          "KingFisher Wings Dubai LLC",
          "DUBAI UNITED ARAB EMIRATES",
          "TEL: +971 55 5355 286",
          "EMAIL: inquiry@kingfishertec.com"
        ]
      },
      "termsLines": [
        "DRAFT — BILL OF LADING NOT NEGOTIABLE UNLESS CONSIGNED \"TO ORDER\"",
        "RECEIVED by the Carrier the Goods as specified above in apparent good order and condition unless otherwise stated.",
        "AS AGENT FOR THE CARRIER"
      ],
      "remarks": "JASPER"
    },
    "blocks": [
      {
        "type": "hblBlShell",
        "embedLogo": true,
        "variant": "multimodal"
      },
      {
        "type": "hblFreightSignature",
        "variant": "blClosing"
      },
      {
        "type": "colorfulFooter",
        "variant": "plain"
      }
    ]
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_59",
    "formatNumber": 32,
    "name": "HBL Draft Jasper 59",
    "paper": "A4",
    "rtl": false,
    "appendCustomerTerms": true,
    "theme": {
      "primary": "#101010",
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
      "formatBadgeLabel": "JASPER",
      "heroTitle": "DRAFT BILL OF LADING",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
      },
      "partyMid": {
        "title": "Consignee",
        "lines": [
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Job No.",
          "v": "CEXP190150"
        },
        {
          "k": "Booking Ref.",
          "v": "B/EXP/19/0254"
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
          "k": "Vessel / Voyage",
          "v": "CMA CGM / 9887"
        },
        {
          "k": "Ocean Vessel",
          "v": "CMA CGM"
        },
        {
          "k": "Voyage Number",
          "v": "9887"
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
          "k": "Pre-carriage by",
          "v": ""
        },
        {
          "k": "Layout",
          "v": "HBL Draft Jasper 59"
        },
        {
          "k": "Catalogue",
          "v": "jasper #32"
        }
      ],
      "hblCargoHeaders": [
        "Container Nos, Seal Nos, Mark and Nos",
        "Number and kind of packages : description of goods",
        "Gross Weight(Kg)",
        "Volume"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 /\n20' DC X 1\nNIL MARKS",
          "STC: VALVE MATERIALS FOR MACHINERY PARTS\nFREIGHT PREPAID\nALL DESTINATION CHARGES ARE CONSIGNEE'S ACCOUNT",
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
      "containerNote": "Total Number of Containers or Packages (In words): ONE(1X20' DC) CONTAINER ONLY",
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "hblBlTitle": "BILL OF LADING  NOT NEGOTIABLE UNLESS CONSIGNED \"TO ORDER\"",
      "hblOriginals": "1(ONE)",
      "hblRegisteredNo": "MTO/DGS/1182/APR/2019",
      "hblDeliveryAgent": {
        "title": "APPLICATION FOR DELIVERY AT DESTINATION MUST BE MADE TO:",
        "lines": [
          "KingFisher Wings Dubai LLC",
          "DUBAI UNITED ARAB EMIRATES",
          "TEL: +971 55 5355 286",
          "EMAIL: inquiry@kingfishertec.com"
        ]
      },
      "termsLines": [
        "DRAFT — BILL OF LADING NOT NEGOTIABLE UNLESS CONSIGNED \"TO ORDER\"",
        "RECEIVED by the Carrier the Goods as specified above in apparent good order and condition unless otherwise stated.",
        "AS AGENT FOR THE CARRIER"
      ],
      "remarks": "JASPER"
    },
    "blocks": [
      {
        "type": "hblBlShell",
        "embedLogo": true,
        "variant": "jasper"
      },
      {
        "type": "hblFreightSignature",
        "variant": "blClosing"
      },
      {
        "type": "colorfulFooter",
        "variant": "plain"
      }
    ]
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_60",
    "formatNumber": 33,
    "name": "HBL Draft Jasper 60",
    "paper": "A4",
    "rtl": false,
    "appendCustomerTerms": true,
    "theme": {
      "primary": "#101010",
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
      "formatBadgeLabel": "JASPER",
      "heroTitle": "DRAFT BILL OF LADING",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
      },
      "partyMid": {
        "title": "Consignee",
        "lines": [
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Job No.",
          "v": "CEXP190150"
        },
        {
          "k": "Booking Ref.",
          "v": "B/EXP/19/0254"
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
          "k": "Vessel / Voyage",
          "v": "CMA CGM / 9887"
        },
        {
          "k": "Ocean Vessel",
          "v": "CMA CGM"
        },
        {
          "k": "Voyage Number",
          "v": "9887"
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
          "k": "Pre-carriage by",
          "v": ""
        },
        {
          "k": "Layout",
          "v": "HBL Draft Jasper 60"
        },
        {
          "k": "Catalogue",
          "v": "jasper #33"
        }
      ],
      "hblCargoHeaders": [
        "Container Nos, Seal Nos, Mark and Nos",
        "Number and kind of packages : description of goods",
        "Gross Weight(Kg)",
        "Volume"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 /\n20' DC X 1\nNIL MARKS",
          "STC: VALVE MATERIALS FOR MACHINERY PARTS\nFREIGHT PREPAID\nALL DESTINATION CHARGES ARE CONSIGNEE'S ACCOUNT",
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
      "containerNote": "Total Number of Containers or Packages (In words): ONE(1X20' DC) CONTAINER ONLY",
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "hblBlTitle": "BILL OF LADING",
      "hblOriginals": "1(ONE)",
      "hblRegisteredNo": "MTO/DGS/1182/APR/2019",
      "hblDeliveryAgent": {
        "title": "APPLICATION FOR DELIVERY AT DESTINATION MUST BE MADE TO:",
        "lines": [
          "KingFisher Wings Dubai LLC",
          "DUBAI UNITED ARAB EMIRATES",
          "TEL: +971 55 5355 286",
          "EMAIL: inquiry@kingfishertec.com"
        ]
      },
      "termsLines": [
        "DRAFT — BILL OF LADING NOT NEGOTIABLE UNLESS CONSIGNED \"TO ORDER\"",
        "RECEIVED by the Carrier the Goods as specified above in apparent good order and condition unless otherwise stated.",
        "AS AGENT FOR THE CARRIER"
      ],
      "remarks": "JASPER"
    },
    "blocks": [
      {
        "type": "hblBlShell",
        "embedLogo": true,
        "variant": "ocean"
      },
      {
        "type": "hblFreightSignature",
        "variant": "blClosing"
      },
      {
        "type": "colorfulFooter",
        "variant": "plain"
      }
    ]
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_61",
    "formatNumber": 34,
    "name": "HBL Draft Jasper 61",
    "paper": "A4",
    "rtl": false,
    "appendCustomerTerms": true,
    "theme": {
      "primary": "#101010",
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
      "formatBadgeLabel": "JASPER",
      "heroTitle": "DRAFT BILL OF LADING",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
      },
      "partyMid": {
        "title": "Consignee",
        "lines": [
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Job No.",
          "v": "CEXP190150"
        },
        {
          "k": "Booking Ref.",
          "v": "B/EXP/19/0254"
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
          "k": "Vessel / Voyage",
          "v": "CMA CGM / 9887"
        },
        {
          "k": "Ocean Vessel",
          "v": "CMA CGM"
        },
        {
          "k": "Voyage Number",
          "v": "9887"
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
          "k": "Pre-carriage by",
          "v": ""
        },
        {
          "k": "Layout",
          "v": "HBL Draft Jasper 61"
        },
        {
          "k": "Catalogue",
          "v": "jasper #34"
        }
      ],
      "hblCargoHeaders": [
        "Container Nos, Seal Nos, Mark and Nos",
        "Number and kind of packages : description of goods",
        "Gross Weight(Kg)",
        "Volume"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 /\n20' DC X 1\nNIL MARKS",
          "STC: VALVE MATERIALS FOR MACHINERY PARTS\nFREIGHT PREPAID\nALL DESTINATION CHARGES ARE CONSIGNEE'S ACCOUNT",
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
      "containerNote": "Total Number of Containers or Packages (In words): ONE(1X20' DC) CONTAINER ONLY",
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "hblBlTitle": "MULTIMODAL TRANSPORT DOCUMENT",
      "hblOriginals": "1(ONE)",
      "hblRegisteredNo": "MTO/DGS/1182/APR/2019",
      "hblDeliveryAgent": {
        "title": "APPLICATION FOR DELIVERY AT DESTINATION MUST BE MADE TO:",
        "lines": [
          "KingFisher Wings Dubai LLC",
          "DUBAI UNITED ARAB EMIRATES",
          "TEL: +971 55 5355 286",
          "EMAIL: inquiry@kingfishertec.com"
        ]
      },
      "termsLines": [
        "DRAFT — BILL OF LADING NOT NEGOTIABLE UNLESS CONSIGNED \"TO ORDER\"",
        "RECEIVED by the Carrier the Goods as specified above in apparent good order and condition unless otherwise stated.",
        "AS AGENT FOR THE CARRIER"
      ],
      "remarks": "JASPER"
    },
    "blocks": [
      {
        "type": "hblBlShell",
        "embedLogo": true,
        "variant": "mt"
      },
      {
        "type": "hblFreightSignature",
        "variant": "blClosing"
      },
      {
        "type": "colorfulFooter",
        "variant": "plain"
      }
    ]
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_63",
    "formatNumber": 35,
    "name": "HBL Draft Jasper 63",
    "paper": "A4",
    "rtl": false,
    "appendCustomerTerms": true,
    "theme": {
      "primary": "#101010",
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
      "formatBadgeLabel": "JASPER",
      "heroTitle": "DRAFT BILL OF LADING",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
      },
      "partyMid": {
        "title": "Consignee",
        "lines": [
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Job No.",
          "v": "CEXP190150"
        },
        {
          "k": "Booking Ref.",
          "v": "B/EXP/19/0254"
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
          "k": "Vessel / Voyage",
          "v": "CMA CGM / 9887"
        },
        {
          "k": "Ocean Vessel",
          "v": "CMA CGM"
        },
        {
          "k": "Voyage Number",
          "v": "9887"
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
          "k": "Pre-carriage by",
          "v": ""
        },
        {
          "k": "Layout",
          "v": "HBL Draft Jasper 63"
        },
        {
          "k": "Catalogue",
          "v": "jasper #35"
        }
      ],
      "hblCargoHeaders": [
        "Container Nos, Seal Nos, Mark and Nos",
        "Number and kind of packages : description of goods",
        "Gross Weight(Kg)",
        "Volume"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 /\n20' DC X 1\nNIL MARKS",
          "STC: VALVE MATERIALS FOR MACHINERY PARTS\nFREIGHT PREPAID\nALL DESTINATION CHARGES ARE CONSIGNEE'S ACCOUNT",
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
      "containerNote": "Total Number of Containers or Packages (In words): ONE(1X20' DC) CONTAINER ONLY",
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "hblBlTitle": "Bill of Lading FOR COMBINED TRANSPORT OR PORT TO PORT SHIPMENT",
      "hblOriginals": "1(ONE)",
      "hblRegisteredNo": "MTO/DGS/1182/APR/2019",
      "hblDeliveryAgent": {
        "title": "APPLICATION FOR DELIVERY AT DESTINATION MUST BE MADE TO:",
        "lines": [
          "KingFisher Wings Dubai LLC",
          "DUBAI UNITED ARAB EMIRATES",
          "TEL: +971 55 5355 286",
          "EMAIL: inquiry@kingfishertec.com"
        ]
      },
      "termsLines": [
        "DRAFT — BILL OF LADING NOT NEGOTIABLE UNLESS CONSIGNED \"TO ORDER\"",
        "RECEIVED by the Carrier the Goods as specified above in apparent good order and condition unless otherwise stated.",
        "AS AGENT FOR THE CARRIER"
      ],
      "remarks": "JASPER"
    },
    "blocks": [
      {
        "type": "hblBlShell",
        "embedLogo": true,
        "variant": "combined"
      },
      {
        "type": "hblFreightSignature",
        "variant": "blClosing"
      },
      {
        "type": "colorfulFooter",
        "variant": "plain"
      }
    ]
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_64",
    "formatNumber": 36,
    "name": "HBL Draft Jasper 64",
    "paper": "A4",
    "rtl": false,
    "appendCustomerTerms": true,
    "theme": {
      "primary": "#101010",
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
      "formatBadgeLabel": "JASPER",
      "heroTitle": "DRAFT BILL OF LADING",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
      },
      "partyMid": {
        "title": "Consignee",
        "lines": [
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Job No.",
          "v": "CEXP190150"
        },
        {
          "k": "Booking Ref.",
          "v": "B/EXP/19/0254"
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
          "k": "Vessel / Voyage",
          "v": "CMA CGM / 9887"
        },
        {
          "k": "Ocean Vessel",
          "v": "CMA CGM"
        },
        {
          "k": "Voyage Number",
          "v": "9887"
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
          "k": "Pre-carriage by",
          "v": ""
        },
        {
          "k": "Layout",
          "v": "HBL Draft Jasper 64"
        },
        {
          "k": "Catalogue",
          "v": "jasper #36"
        }
      ],
      "hblCargoHeaders": [
        "Container Nos, Seal Nos, Mark and Nos",
        "Number and kind of packages : description of goods",
        "Gross Weight(Kg)",
        "Volume"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 /\n20' DC X 1\nNIL MARKS",
          "STC: VALVE MATERIALS FOR MACHINERY PARTS\nFREIGHT PREPAID\nALL DESTINATION CHARGES ARE CONSIGNEE'S ACCOUNT",
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
      "containerNote": "Total Number of Containers or Packages (In words): ONE(1X20' DC) CONTAINER ONLY",
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "hblBlTitle": "MULTI-MODAL TRANSPORT DOCUMENT",
      "hblOriginals": "1(ONE)",
      "hblRegisteredNo": "MTO/DGS/1182/APR/2019",
      "hblDeliveryAgent": {
        "title": "APPLICATION FOR DELIVERY AT DESTINATION MUST BE MADE TO:",
        "lines": [
          "KingFisher Wings Dubai LLC",
          "DUBAI UNITED ARAB EMIRATES",
          "TEL: +971 55 5355 286",
          "EMAIL: inquiry@kingfishertec.com"
        ]
      },
      "termsLines": [
        "DRAFT — BILL OF LADING NOT NEGOTIABLE UNLESS CONSIGNED \"TO ORDER\"",
        "RECEIVED by the Carrier the Goods as specified above in apparent good order and condition unless otherwise stated.",
        "AS AGENT FOR THE CARRIER"
      ],
      "remarks": "JASPER"
    },
    "blocks": [
      {
        "type": "hblBlShell",
        "embedLogo": true,
        "variant": "multimodal"
      },
      {
        "type": "hblFreightSignature",
        "variant": "blClosing"
      },
      {
        "type": "colorfulFooter",
        "variant": "plain"
      }
    ]
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_65",
    "formatNumber": 37,
    "name": "HBL Draft Jasper 65",
    "paper": "A4",
    "rtl": false,
    "appendCustomerTerms": true,
    "theme": {
      "primary": "#101010",
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
      "formatBadgeLabel": "JASPER",
      "heroTitle": "DRAFT BILL OF LADING",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
      },
      "partyMid": {
        "title": "Consignee",
        "lines": [
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Job No.",
          "v": "CEXP190150"
        },
        {
          "k": "Booking Ref.",
          "v": "B/EXP/19/0254"
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
          "k": "Vessel / Voyage",
          "v": "CMA CGM / 9887"
        },
        {
          "k": "Ocean Vessel",
          "v": "CMA CGM"
        },
        {
          "k": "Voyage Number",
          "v": "9887"
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
          "k": "Pre-carriage by",
          "v": ""
        },
        {
          "k": "Layout",
          "v": "HBL Draft Jasper 65"
        },
        {
          "k": "Catalogue",
          "v": "jasper #37"
        }
      ],
      "hblCargoHeaders": [
        "Container Nos, Seal Nos, Mark and Nos",
        "Number and kind of packages : description of goods",
        "Gross Weight(Kg)",
        "Volume"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 /\n20' DC X 1\nNIL MARKS",
          "STC: VALVE MATERIALS FOR MACHINERY PARTS\nFREIGHT PREPAID\nALL DESTINATION CHARGES ARE CONSIGNEE'S ACCOUNT",
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
      "containerNote": "Total Number of Containers or Packages (In words): ONE(1X20' DC) CONTAINER ONLY",
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "hblBlTitle": "BILL OF LADING  NOT NEGOTIABLE UNLESS CONSIGNED \"TO ORDER\"",
      "hblOriginals": "1(ONE)",
      "hblRegisteredNo": "MTO/DGS/1182/APR/2019",
      "hblDeliveryAgent": {
        "title": "APPLICATION FOR DELIVERY AT DESTINATION MUST BE MADE TO:",
        "lines": [
          "KingFisher Wings Dubai LLC",
          "DUBAI UNITED ARAB EMIRATES",
          "TEL: +971 55 5355 286",
          "EMAIL: inquiry@kingfishertec.com"
        ]
      },
      "termsLines": [
        "DRAFT — BILL OF LADING NOT NEGOTIABLE UNLESS CONSIGNED \"TO ORDER\"",
        "RECEIVED by the Carrier the Goods as specified above in apparent good order and condition unless otherwise stated.",
        "AS AGENT FOR THE CARRIER"
      ],
      "remarks": "JASPER"
    },
    "blocks": [
      {
        "type": "hblBlShell",
        "embedLogo": true,
        "variant": "jasper"
      },
      {
        "type": "hblFreightSignature",
        "variant": "blClosing"
      },
      {
        "type": "colorfulFooter",
        "variant": "plain"
      }
    ]
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_67",
    "formatNumber": 38,
    "name": "HBL Draft Jasper 67",
    "paper": "A4",
    "rtl": false,
    "appendCustomerTerms": true,
    "theme": {
      "primary": "#101010",
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
      "formatBadgeLabel": "JASPER",
      "heroTitle": "DRAFT BILL OF LADING",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
      },
      "partyMid": {
        "title": "Consignee",
        "lines": [
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Job No.",
          "v": "CEXP190150"
        },
        {
          "k": "Booking Ref.",
          "v": "B/EXP/19/0254"
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
          "k": "Vessel / Voyage",
          "v": "CMA CGM / 9887"
        },
        {
          "k": "Ocean Vessel",
          "v": "CMA CGM"
        },
        {
          "k": "Voyage Number",
          "v": "9887"
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
          "k": "Pre-carriage by",
          "v": ""
        },
        {
          "k": "Layout",
          "v": "HBL Draft Jasper 67"
        },
        {
          "k": "Catalogue",
          "v": "jasper #38"
        }
      ],
      "hblCargoHeaders": [
        "Container Nos, Seal Nos, Mark and Nos",
        "Number and kind of packages : description of goods",
        "Gross Weight(Kg)",
        "Volume"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 /\n20' DC X 1\nNIL MARKS",
          "STC: VALVE MATERIALS FOR MACHINERY PARTS\nFREIGHT PREPAID\nALL DESTINATION CHARGES ARE CONSIGNEE'S ACCOUNT",
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
      "containerNote": "Total Number of Containers or Packages (In words): ONE(1X20' DC) CONTAINER ONLY",
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "hblBlTitle": "BILL OF LADING",
      "hblOriginals": "1(ONE)",
      "hblRegisteredNo": "MTO/DGS/1182/APR/2019",
      "hblDeliveryAgent": {
        "title": "APPLICATION FOR DELIVERY AT DESTINATION MUST BE MADE TO:",
        "lines": [
          "KingFisher Wings Dubai LLC",
          "DUBAI UNITED ARAB EMIRATES",
          "TEL: +971 55 5355 286",
          "EMAIL: inquiry@kingfishertec.com"
        ]
      },
      "termsLines": [
        "DRAFT — BILL OF LADING NOT NEGOTIABLE UNLESS CONSIGNED \"TO ORDER\"",
        "RECEIVED by the Carrier the Goods as specified above in apparent good order and condition unless otherwise stated.",
        "AS AGENT FOR THE CARRIER"
      ],
      "remarks": "JASPER"
    },
    "blocks": [
      {
        "type": "hblBlShell",
        "embedLogo": true,
        "variant": "ocean"
      },
      {
        "type": "hblFreightSignature",
        "variant": "blClosing"
      },
      {
        "type": "colorfulFooter",
        "variant": "plain"
      }
    ]
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_66",
    "formatNumber": 39,
    "name": "HBL Draft Jasper 66",
    "paper": "A4",
    "rtl": false,
    "appendCustomerTerms": true,
    "theme": {
      "primary": "#101010",
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
      "formatBadgeLabel": "JASPER",
      "heroTitle": "DRAFT BILL OF LADING",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
      },
      "partyMid": {
        "title": "Consignee",
        "lines": [
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Job No.",
          "v": "CEXP190150"
        },
        {
          "k": "Booking Ref.",
          "v": "B/EXP/19/0254"
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
          "k": "Vessel / Voyage",
          "v": "CMA CGM / 9887"
        },
        {
          "k": "Ocean Vessel",
          "v": "CMA CGM"
        },
        {
          "k": "Voyage Number",
          "v": "9887"
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
          "k": "Pre-carriage by",
          "v": ""
        },
        {
          "k": "Layout",
          "v": "HBL Draft Jasper 66"
        },
        {
          "k": "Catalogue",
          "v": "jasper #39"
        }
      ],
      "hblCargoHeaders": [
        "Container Nos, Seal Nos, Mark and Nos",
        "Number and kind of packages : description of goods",
        "Gross Weight(Kg)",
        "Volume"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 /\n20' DC X 1\nNIL MARKS",
          "STC: VALVE MATERIALS FOR MACHINERY PARTS\nFREIGHT PREPAID\nALL DESTINATION CHARGES ARE CONSIGNEE'S ACCOUNT",
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
      "containerNote": "Total Number of Containers or Packages (In words): ONE(1X20' DC) CONTAINER ONLY",
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "hblBlTitle": "MULTIMODAL TRANSPORT DOCUMENT",
      "hblOriginals": "1(ONE)",
      "hblRegisteredNo": "MTO/DGS/1182/APR/2019",
      "hblDeliveryAgent": {
        "title": "APPLICATION FOR DELIVERY AT DESTINATION MUST BE MADE TO:",
        "lines": [
          "KingFisher Wings Dubai LLC",
          "DUBAI UNITED ARAB EMIRATES",
          "TEL: +971 55 5355 286",
          "EMAIL: inquiry@kingfishertec.com"
        ]
      },
      "termsLines": [
        "DRAFT — BILL OF LADING NOT NEGOTIABLE UNLESS CONSIGNED \"TO ORDER\"",
        "RECEIVED by the Carrier the Goods as specified above in apparent good order and condition unless otherwise stated.",
        "AS AGENT FOR THE CARRIER"
      ],
      "remarks": "JASPER"
    },
    "blocks": [
      {
        "type": "hblBlShell",
        "embedLogo": true,
        "variant": "mt"
      },
      {
        "type": "hblFreightSignature",
        "variant": "blClosing"
      },
      {
        "type": "colorfulFooter",
        "variant": "plain"
      }
    ]
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_68",
    "formatNumber": 40,
    "name": "HBL Draft Jasper 68",
    "paper": "A4",
    "rtl": false,
    "appendCustomerTerms": true,
    "theme": {
      "primary": "#101010",
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
      "formatBadgeLabel": "JASPER",
      "heroTitle": "DRAFT BILL OF LADING",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
      },
      "partyMid": {
        "title": "Consignee",
        "lines": [
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Job No.",
          "v": "CEXP190150"
        },
        {
          "k": "Booking Ref.",
          "v": "B/EXP/19/0254"
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
          "k": "Vessel / Voyage",
          "v": "CMA CGM / 9887"
        },
        {
          "k": "Ocean Vessel",
          "v": "CMA CGM"
        },
        {
          "k": "Voyage Number",
          "v": "9887"
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
          "k": "Pre-carriage by",
          "v": ""
        },
        {
          "k": "Layout",
          "v": "HBL Draft Jasper 68"
        },
        {
          "k": "Catalogue",
          "v": "jasper #40"
        }
      ],
      "hblCargoHeaders": [
        "Container Nos, Seal Nos, Mark and Nos",
        "Number and kind of packages : description of goods",
        "Gross Weight(Kg)",
        "Volume"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 /\n20' DC X 1\nNIL MARKS",
          "STC: VALVE MATERIALS FOR MACHINERY PARTS\nFREIGHT PREPAID\nALL DESTINATION CHARGES ARE CONSIGNEE'S ACCOUNT",
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
      "containerNote": "Total Number of Containers or Packages (In words): ONE(1X20' DC) CONTAINER ONLY",
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "hblBlTitle": "Bill of Lading FOR COMBINED TRANSPORT OR PORT TO PORT SHIPMENT",
      "hblOriginals": "1(ONE)",
      "hblRegisteredNo": "MTO/DGS/1182/APR/2019",
      "hblDeliveryAgent": {
        "title": "APPLICATION FOR DELIVERY AT DESTINATION MUST BE MADE TO:",
        "lines": [
          "KingFisher Wings Dubai LLC",
          "DUBAI UNITED ARAB EMIRATES",
          "TEL: +971 55 5355 286",
          "EMAIL: inquiry@kingfishertec.com"
        ]
      },
      "termsLines": [
        "DRAFT — BILL OF LADING NOT NEGOTIABLE UNLESS CONSIGNED \"TO ORDER\"",
        "RECEIVED by the Carrier the Goods as specified above in apparent good order and condition unless otherwise stated.",
        "AS AGENT FOR THE CARRIER"
      ],
      "remarks": "JASPER"
    },
    "blocks": [
      {
        "type": "hblBlShell",
        "embedLogo": true,
        "variant": "combined"
      },
      {
        "type": "hblFreightSignature",
        "variant": "blClosing"
      },
      {
        "type": "colorfulFooter",
        "variant": "plain"
      }
    ]
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_69",
    "formatNumber": 41,
    "name": "HBL Draft Jasper 69",
    "paper": "A4",
    "rtl": false,
    "appendCustomerTerms": true,
    "theme": {
      "primary": "#101010",
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
      "formatBadgeLabel": "JASPER",
      "heroTitle": "DRAFT BILL OF LADING",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
      },
      "partyMid": {
        "title": "Consignee",
        "lines": [
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Job No.",
          "v": "CEXP190150"
        },
        {
          "k": "Booking Ref.",
          "v": "B/EXP/19/0254"
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
          "k": "Vessel / Voyage",
          "v": "CMA CGM / 9887"
        },
        {
          "k": "Ocean Vessel",
          "v": "CMA CGM"
        },
        {
          "k": "Voyage Number",
          "v": "9887"
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
          "k": "Pre-carriage by",
          "v": ""
        },
        {
          "k": "Layout",
          "v": "HBL Draft Jasper 69"
        },
        {
          "k": "Catalogue",
          "v": "jasper #41"
        }
      ],
      "hblCargoHeaders": [
        "Container Nos, Seal Nos, Mark and Nos",
        "Number and kind of packages : description of goods",
        "Gross Weight(Kg)",
        "Volume"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 /\n20' DC X 1\nNIL MARKS",
          "STC: VALVE MATERIALS FOR MACHINERY PARTS\nFREIGHT PREPAID\nALL DESTINATION CHARGES ARE CONSIGNEE'S ACCOUNT",
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
      "containerNote": "Total Number of Containers or Packages (In words): ONE(1X20' DC) CONTAINER ONLY",
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "hblBlTitle": "MULTI-MODAL TRANSPORT DOCUMENT",
      "hblOriginals": "1(ONE)",
      "hblRegisteredNo": "MTO/DGS/1182/APR/2019",
      "hblDeliveryAgent": {
        "title": "APPLICATION FOR DELIVERY AT DESTINATION MUST BE MADE TO:",
        "lines": [
          "KingFisher Wings Dubai LLC",
          "DUBAI UNITED ARAB EMIRATES",
          "TEL: +971 55 5355 286",
          "EMAIL: inquiry@kingfishertec.com"
        ]
      },
      "termsLines": [
        "DRAFT — BILL OF LADING NOT NEGOTIABLE UNLESS CONSIGNED \"TO ORDER\"",
        "RECEIVED by the Carrier the Goods as specified above in apparent good order and condition unless otherwise stated.",
        "AS AGENT FOR THE CARRIER"
      ],
      "remarks": "JASPER"
    },
    "blocks": [
      {
        "type": "hblBlShell",
        "embedLogo": true,
        "variant": "multimodal"
      },
      {
        "type": "hblFreightSignature",
        "variant": "blClosing"
      },
      {
        "type": "colorfulFooter",
        "variant": "plain"
      }
    ]
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_70",
    "formatNumber": 42,
    "name": "HBL Draft Jasper 70",
    "paper": "A4",
    "rtl": false,
    "appendCustomerTerms": true,
    "theme": {
      "primary": "#101010",
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
      "formatBadgeLabel": "JASPER",
      "heroTitle": "DRAFT BILL OF LADING",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
      },
      "partyMid": {
        "title": "Consignee",
        "lines": [
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Job No.",
          "v": "CEXP190150"
        },
        {
          "k": "Booking Ref.",
          "v": "B/EXP/19/0254"
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
          "k": "Vessel / Voyage",
          "v": "CMA CGM / 9887"
        },
        {
          "k": "Ocean Vessel",
          "v": "CMA CGM"
        },
        {
          "k": "Voyage Number",
          "v": "9887"
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
          "k": "Pre-carriage by",
          "v": ""
        },
        {
          "k": "Layout",
          "v": "HBL Draft Jasper 70"
        },
        {
          "k": "Catalogue",
          "v": "jasper #42"
        }
      ],
      "hblCargoHeaders": [
        "Container Nos, Seal Nos, Mark and Nos",
        "Number and kind of packages : description of goods",
        "Gross Weight(Kg)",
        "Volume"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 /\n20' DC X 1\nNIL MARKS",
          "STC: VALVE MATERIALS FOR MACHINERY PARTS\nFREIGHT PREPAID\nALL DESTINATION CHARGES ARE CONSIGNEE'S ACCOUNT",
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
      "containerNote": "Total Number of Containers or Packages (In words): ONE(1X20' DC) CONTAINER ONLY",
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "hblBlTitle": "MULTIMODAL TRANSPORT DOCUMENT",
      "hblOriginals": "1(ONE)",
      "hblRegisteredNo": "MTO/DGS/1182/APR/2019",
      "hblDeliveryAgent": {
        "title": "APPLICATION FOR DELIVERY AT DESTINATION MUST BE MADE TO:",
        "lines": [
          "KingFisher Wings Dubai LLC",
          "DUBAI UNITED ARAB EMIRATES",
          "TEL: +971 55 5355 286",
          "EMAIL: inquiry@kingfishertec.com"
        ]
      },
      "termsLines": [
        "DRAFT — BILL OF LADING NOT NEGOTIABLE UNLESS CONSIGNED \"TO ORDER\"",
        "RECEIVED by the Carrier the Goods as specified above in apparent good order and condition unless otherwise stated.",
        "AS AGENT FOR THE CARRIER"
      ],
      "remarks": "JASPER"
    },
    "blocks": [
      {
        "type": "hblBlShell",
        "embedLogo": true,
        "variant": "mt"
      },
      {
        "type": "hblFreightSignature",
        "variant": "blClosing"
      },
      {
        "type": "colorfulFooter",
        "variant": "plain"
      }
    ]
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_72",
    "formatNumber": 43,
    "name": "HBL Draft Jasper 72",
    "paper": "A4",
    "rtl": false,
    "appendCustomerTerms": true,
    "theme": {
      "primary": "#101010",
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
      "formatBadgeLabel": "JASPER",
      "heroTitle": "DRAFT BILL OF LADING",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
      },
      "partyMid": {
        "title": "Consignee",
        "lines": [
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Job No.",
          "v": "CEXP190150"
        },
        {
          "k": "Booking Ref.",
          "v": "B/EXP/19/0254"
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
          "k": "Vessel / Voyage",
          "v": "CMA CGM / 9887"
        },
        {
          "k": "Ocean Vessel",
          "v": "CMA CGM"
        },
        {
          "k": "Voyage Number",
          "v": "9887"
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
          "k": "Pre-carriage by",
          "v": ""
        },
        {
          "k": "Layout",
          "v": "HBL Draft Jasper 72"
        },
        {
          "k": "Catalogue",
          "v": "jasper #43"
        }
      ],
      "hblCargoHeaders": [
        "Container Nos, Seal Nos, Mark and Nos",
        "Number and kind of packages : description of goods",
        "Gross Weight(Kg)",
        "Volume"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 /\n20' DC X 1\nNIL MARKS",
          "STC: VALVE MATERIALS FOR MACHINERY PARTS\nFREIGHT PREPAID\nALL DESTINATION CHARGES ARE CONSIGNEE'S ACCOUNT",
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
      "containerNote": "Total Number of Containers or Packages (In words): ONE(1X20' DC) CONTAINER ONLY",
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "hblBlTitle": "BILL OF LADING",
      "hblOriginals": "1(ONE)",
      "hblRegisteredNo": "MTO/DGS/1182/APR/2019",
      "hblDeliveryAgent": {
        "title": "APPLICATION FOR DELIVERY AT DESTINATION MUST BE MADE TO:",
        "lines": [
          "KingFisher Wings Dubai LLC",
          "DUBAI UNITED ARAB EMIRATES",
          "TEL: +971 55 5355 286",
          "EMAIL: inquiry@kingfishertec.com"
        ]
      },
      "termsLines": [
        "DRAFT — BILL OF LADING NOT NEGOTIABLE UNLESS CONSIGNED \"TO ORDER\"",
        "RECEIVED by the Carrier the Goods as specified above in apparent good order and condition unless otherwise stated.",
        "AS AGENT FOR THE CARRIER"
      ],
      "remarks": "JASPER"
    },
    "blocks": [
      {
        "type": "hblBlShell",
        "embedLogo": true,
        "variant": "ocean"
      },
      {
        "type": "hblFreightSignature",
        "variant": "blClosing"
      },
      {
        "type": "colorfulFooter",
        "variant": "plain"
      }
    ]
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_73",
    "formatNumber": 44,
    "name": "HBL Draft Jasper 73",
    "paper": "A4",
    "rtl": false,
    "appendCustomerTerms": true,
    "theme": {
      "primary": "#101010",
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
      "formatBadgeLabel": "JASPER",
      "heroTitle": "DRAFT BILL OF LADING",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
      },
      "partyMid": {
        "title": "Consignee",
        "lines": [
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Job No.",
          "v": "CEXP190150"
        },
        {
          "k": "Booking Ref.",
          "v": "B/EXP/19/0254"
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
          "k": "Vessel / Voyage",
          "v": "CMA CGM / 9887"
        },
        {
          "k": "Ocean Vessel",
          "v": "CMA CGM"
        },
        {
          "k": "Voyage Number",
          "v": "9887"
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
          "k": "Pre-carriage by",
          "v": ""
        },
        {
          "k": "Layout",
          "v": "HBL Draft Jasper 73"
        },
        {
          "k": "Catalogue",
          "v": "jasper #44"
        }
      ],
      "hblCargoHeaders": [
        "Container Nos, Seal Nos, Mark and Nos",
        "Number and kind of packages : description of goods",
        "Gross Weight(Kg)",
        "Volume"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 /\n20' DC X 1\nNIL MARKS",
          "STC: VALVE MATERIALS FOR MACHINERY PARTS\nFREIGHT PREPAID\nALL DESTINATION CHARGES ARE CONSIGNEE'S ACCOUNT",
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
      "containerNote": "Total Number of Containers or Packages (In words): ONE(1X20' DC) CONTAINER ONLY",
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "hblBlTitle": "MULTIMODAL TRANSPORT DOCUMENT",
      "hblOriginals": "1(ONE)",
      "hblRegisteredNo": "MTO/DGS/1182/APR/2019",
      "hblDeliveryAgent": {
        "title": "APPLICATION FOR DELIVERY AT DESTINATION MUST BE MADE TO:",
        "lines": [
          "KingFisher Wings Dubai LLC",
          "DUBAI UNITED ARAB EMIRATES",
          "TEL: +971 55 5355 286",
          "EMAIL: inquiry@kingfishertec.com"
        ]
      },
      "termsLines": [
        "DRAFT — BILL OF LADING NOT NEGOTIABLE UNLESS CONSIGNED \"TO ORDER\"",
        "RECEIVED by the Carrier the Goods as specified above in apparent good order and condition unless otherwise stated.",
        "AS AGENT FOR THE CARRIER"
      ],
      "remarks": "JASPER"
    },
    "blocks": [
      {
        "type": "hblBlShell",
        "embedLogo": true,
        "variant": "mt"
      },
      {
        "type": "hblFreightSignature",
        "variant": "blClosing"
      },
      {
        "type": "colorfulFooter",
        "variant": "plain"
      }
    ]
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_75",
    "formatNumber": 45,
    "name": "HBL Draft Jasper 75",
    "paper": "A4",
    "rtl": false,
    "appendCustomerTerms": true,
    "theme": {
      "primary": "#101010",
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
      "formatBadgeLabel": "JASPER",
      "heroTitle": "DRAFT BILL OF LADING",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
      },
      "partyMid": {
        "title": "Consignee",
        "lines": [
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Job No.",
          "v": "CEXP190150"
        },
        {
          "k": "Booking Ref.",
          "v": "B/EXP/19/0254"
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
          "k": "Vessel / Voyage",
          "v": "CMA CGM / 9887"
        },
        {
          "k": "Ocean Vessel",
          "v": "CMA CGM"
        },
        {
          "k": "Voyage Number",
          "v": "9887"
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
          "k": "Pre-carriage by",
          "v": ""
        },
        {
          "k": "Layout",
          "v": "HBL Draft Jasper 75"
        },
        {
          "k": "Catalogue",
          "v": "jasper #45"
        }
      ],
      "hblCargoHeaders": [
        "Container Nos, Seal Nos, Mark and Nos",
        "Number and kind of packages : description of goods",
        "Gross Weight(Kg)",
        "Volume"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 /\n20' DC X 1\nNIL MARKS",
          "STC: VALVE MATERIALS FOR MACHINERY PARTS\nFREIGHT PREPAID\nALL DESTINATION CHARGES ARE CONSIGNEE'S ACCOUNT",
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
      "containerNote": "Total Number of Containers or Packages (In words): ONE(1X20' DC) CONTAINER ONLY",
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "hblBlTitle": "Bill of Lading FOR COMBINED TRANSPORT OR PORT TO PORT SHIPMENT",
      "hblOriginals": "1(ONE)",
      "hblRegisteredNo": "MTO/DGS/1182/APR/2019",
      "hblDeliveryAgent": {
        "title": "APPLICATION FOR DELIVERY AT DESTINATION MUST BE MADE TO:",
        "lines": [
          "KingFisher Wings Dubai LLC",
          "DUBAI UNITED ARAB EMIRATES",
          "TEL: +971 55 5355 286",
          "EMAIL: inquiry@kingfishertec.com"
        ]
      },
      "termsLines": [
        "DRAFT — BILL OF LADING NOT NEGOTIABLE UNLESS CONSIGNED \"TO ORDER\"",
        "RECEIVED by the Carrier the Goods as specified above in apparent good order and condition unless otherwise stated.",
        "AS AGENT FOR THE CARRIER"
      ],
      "remarks": "JASPER"
    },
    "blocks": [
      {
        "type": "hblBlShell",
        "embedLogo": true,
        "variant": "combined"
      },
      {
        "type": "hblFreightSignature",
        "variant": "blClosing"
      },
      {
        "type": "colorfulFooter",
        "variant": "plain"
      }
    ]
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_77",
    "formatNumber": 46,
    "name": "HBL Draft Jasper 77",
    "paper": "A4",
    "rtl": false,
    "appendCustomerTerms": true,
    "theme": {
      "primary": "#101010",
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
      "formatBadgeLabel": "JASPER",
      "heroTitle": "DRAFT BILL OF LADING",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
      },
      "partyMid": {
        "title": "Consignee",
        "lines": [
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Job No.",
          "v": "CEXP190150"
        },
        {
          "k": "Booking Ref.",
          "v": "B/EXP/19/0254"
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
          "k": "Vessel / Voyage",
          "v": "CMA CGM / 9887"
        },
        {
          "k": "Ocean Vessel",
          "v": "CMA CGM"
        },
        {
          "k": "Voyage Number",
          "v": "9887"
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
          "k": "Pre-carriage by",
          "v": ""
        },
        {
          "k": "Layout",
          "v": "HBL Draft Jasper 77"
        },
        {
          "k": "Catalogue",
          "v": "jasper #46"
        }
      ],
      "hblCargoHeaders": [
        "Container Nos, Seal Nos, Mark and Nos",
        "Number and kind of packages : description of goods",
        "Gross Weight(Kg)",
        "Volume"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 /\n20' DC X 1\nNIL MARKS",
          "STC: VALVE MATERIALS FOR MACHINERY PARTS\nFREIGHT PREPAID\nALL DESTINATION CHARGES ARE CONSIGNEE'S ACCOUNT",
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
      "containerNote": "Total Number of Containers or Packages (In words): ONE(1X20' DC) CONTAINER ONLY",
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "hblBlTitle": "MULTI-MODAL TRANSPORT DOCUMENT",
      "hblOriginals": "1(ONE)",
      "hblRegisteredNo": "MTO/DGS/1182/APR/2019",
      "hblDeliveryAgent": {
        "title": "APPLICATION FOR DELIVERY AT DESTINATION MUST BE MADE TO:",
        "lines": [
          "KingFisher Wings Dubai LLC",
          "DUBAI UNITED ARAB EMIRATES",
          "TEL: +971 55 5355 286",
          "EMAIL: inquiry@kingfishertec.com"
        ]
      },
      "termsLines": [
        "DRAFT — BILL OF LADING NOT NEGOTIABLE UNLESS CONSIGNED \"TO ORDER\"",
        "RECEIVED by the Carrier the Goods as specified above in apparent good order and condition unless otherwise stated.",
        "AS AGENT FOR THE CARRIER"
      ],
      "remarks": "JASPER"
    },
    "blocks": [
      {
        "type": "hblBlShell",
        "embedLogo": true,
        "variant": "multimodal"
      },
      {
        "type": "hblFreightSignature",
        "variant": "blClosing"
      },
      {
        "type": "colorfulFooter",
        "variant": "plain"
      }
    ]
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_83",
    "formatNumber": 47,
    "name": "HBL Draft Jasper 83",
    "paper": "A4",
    "rtl": false,
    "appendCustomerTerms": true,
    "theme": {
      "primary": "#101010",
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
      "formatBadgeLabel": "JASPER",
      "heroTitle": "DRAFT BILL OF LADING",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
      },
      "partyMid": {
        "title": "Consignee",
        "lines": [
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Job No.",
          "v": "CEXP190150"
        },
        {
          "k": "Booking Ref.",
          "v": "B/EXP/19/0254"
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
          "k": "Vessel / Voyage",
          "v": "CMA CGM / 9887"
        },
        {
          "k": "Ocean Vessel",
          "v": "CMA CGM"
        },
        {
          "k": "Voyage Number",
          "v": "9887"
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
          "k": "Pre-carriage by",
          "v": ""
        },
        {
          "k": "Layout",
          "v": "HBL Draft Jasper 83"
        },
        {
          "k": "Catalogue",
          "v": "jasper #47"
        }
      ],
      "hblCargoHeaders": [
        "Container Nos, Seal Nos, Mark and Nos",
        "Number and kind of packages : description of goods",
        "Gross Weight(Kg)",
        "Volume"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 /\n20' DC X 1\nNIL MARKS",
          "STC: VALVE MATERIALS FOR MACHINERY PARTS\nFREIGHT PREPAID\nALL DESTINATION CHARGES ARE CONSIGNEE'S ACCOUNT",
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
      "containerNote": "Total Number of Containers or Packages (In words): ONE(1X20' DC) CONTAINER ONLY",
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "hblBlTitle": "BILL OF LADING  NOT NEGOTIABLE UNLESS CONSIGNED \"TO ORDER\"",
      "hblOriginals": "1(ONE)",
      "hblRegisteredNo": "MTO/DGS/1182/APR/2019",
      "hblDeliveryAgent": {
        "title": "APPLICATION FOR DELIVERY AT DESTINATION MUST BE MADE TO:",
        "lines": [
          "KingFisher Wings Dubai LLC",
          "DUBAI UNITED ARAB EMIRATES",
          "TEL: +971 55 5355 286",
          "EMAIL: inquiry@kingfishertec.com"
        ]
      },
      "termsLines": [
        "DRAFT — BILL OF LADING NOT NEGOTIABLE UNLESS CONSIGNED \"TO ORDER\"",
        "RECEIVED by the Carrier the Goods as specified above in apparent good order and condition unless otherwise stated.",
        "AS AGENT FOR THE CARRIER"
      ],
      "remarks": "JASPER"
    },
    "blocks": [
      {
        "type": "hblBlShell",
        "embedLogo": true,
        "variant": "jasper"
      },
      {
        "type": "hblFreightSignature",
        "variant": "blClosing"
      },
      {
        "type": "colorfulFooter",
        "variant": "plain"
      }
    ]
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_84",
    "formatNumber": 48,
    "name": "HBL Draft Jasper 84",
    "paper": "A4",
    "rtl": false,
    "appendCustomerTerms": true,
    "theme": {
      "primary": "#101010",
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
      "formatBadgeLabel": "JASPER",
      "heroTitle": "DRAFT BILL OF LADING",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
      },
      "partyMid": {
        "title": "Consignee",
        "lines": [
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Job No.",
          "v": "CEXP190150"
        },
        {
          "k": "Booking Ref.",
          "v": "B/EXP/19/0254"
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
          "k": "Vessel / Voyage",
          "v": "CMA CGM / 9887"
        },
        {
          "k": "Ocean Vessel",
          "v": "CMA CGM"
        },
        {
          "k": "Voyage Number",
          "v": "9887"
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
          "k": "Pre-carriage by",
          "v": ""
        },
        {
          "k": "Layout",
          "v": "HBL Draft Jasper 84"
        },
        {
          "k": "Catalogue",
          "v": "jasper #48"
        }
      ],
      "hblCargoHeaders": [
        "Container Nos, Seal Nos, Mark and Nos",
        "Number and kind of packages : description of goods",
        "Gross Weight(Kg)",
        "Volume"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 /\n20' DC X 1\nNIL MARKS",
          "STC: VALVE MATERIALS FOR MACHINERY PARTS\nFREIGHT PREPAID\nALL DESTINATION CHARGES ARE CONSIGNEE'S ACCOUNT",
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
      "containerNote": "Total Number of Containers or Packages (In words): ONE(1X20' DC) CONTAINER ONLY",
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "hblBlTitle": "BILL OF LADING",
      "hblOriginals": "1(ONE)",
      "hblRegisteredNo": "MTO/DGS/1182/APR/2019",
      "hblDeliveryAgent": {
        "title": "APPLICATION FOR DELIVERY AT DESTINATION MUST BE MADE TO:",
        "lines": [
          "KingFisher Wings Dubai LLC",
          "DUBAI UNITED ARAB EMIRATES",
          "TEL: +971 55 5355 286",
          "EMAIL: inquiry@kingfishertec.com"
        ]
      },
      "termsLines": [
        "DRAFT — BILL OF LADING NOT NEGOTIABLE UNLESS CONSIGNED \"TO ORDER\"",
        "RECEIVED by the Carrier the Goods as specified above in apparent good order and condition unless otherwise stated.",
        "AS AGENT FOR THE CARRIER"
      ],
      "remarks": "JASPER"
    },
    "blocks": [
      {
        "type": "hblBlShell",
        "embedLogo": true,
        "variant": "ocean"
      },
      {
        "type": "hblFreightSignature",
        "variant": "blClosing"
      },
      {
        "type": "colorfulFooter",
        "variant": "plain"
      }
    ]
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_85",
    "formatNumber": 49,
    "name": "HBL Draft Jasper 85",
    "paper": "A4",
    "rtl": false,
    "appendCustomerTerms": true,
    "theme": {
      "primary": "#101010",
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
      "formatBadgeLabel": "JASPER",
      "heroTitle": "DRAFT BILL OF LADING",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
      },
      "partyMid": {
        "title": "Consignee",
        "lines": [
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Job No.",
          "v": "CEXP190150"
        },
        {
          "k": "Booking Ref.",
          "v": "B/EXP/19/0254"
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
          "k": "Vessel / Voyage",
          "v": "CMA CGM / 9887"
        },
        {
          "k": "Ocean Vessel",
          "v": "CMA CGM"
        },
        {
          "k": "Voyage Number",
          "v": "9887"
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
          "k": "Pre-carriage by",
          "v": ""
        },
        {
          "k": "Layout",
          "v": "HBL Draft Jasper 85"
        },
        {
          "k": "Catalogue",
          "v": "jasper #49"
        }
      ],
      "hblCargoHeaders": [
        "Container Nos, Seal Nos, Mark and Nos",
        "Number and kind of packages : description of goods",
        "Gross Weight(Kg)",
        "Volume"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 /\n20' DC X 1\nNIL MARKS",
          "STC: VALVE MATERIALS FOR MACHINERY PARTS\nFREIGHT PREPAID\nALL DESTINATION CHARGES ARE CONSIGNEE'S ACCOUNT",
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
      "containerNote": "Total Number of Containers or Packages (In words): ONE(1X20' DC) CONTAINER ONLY",
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "hblBlTitle": "MULTIMODAL TRANSPORT DOCUMENT",
      "hblOriginals": "1(ONE)",
      "hblRegisteredNo": "MTO/DGS/1182/APR/2019",
      "hblDeliveryAgent": {
        "title": "APPLICATION FOR DELIVERY AT DESTINATION MUST BE MADE TO:",
        "lines": [
          "KingFisher Wings Dubai LLC",
          "DUBAI UNITED ARAB EMIRATES",
          "TEL: +971 55 5355 286",
          "EMAIL: inquiry@kingfishertec.com"
        ]
      },
      "termsLines": [
        "DRAFT — BILL OF LADING NOT NEGOTIABLE UNLESS CONSIGNED \"TO ORDER\"",
        "RECEIVED by the Carrier the Goods as specified above in apparent good order and condition unless otherwise stated.",
        "AS AGENT FOR THE CARRIER"
      ],
      "remarks": "JASPER"
    },
    "blocks": [
      {
        "type": "hblBlShell",
        "embedLogo": true,
        "variant": "mt"
      },
      {
        "type": "hblFreightSignature",
        "variant": "blClosing"
      },
      {
        "type": "colorfulFooter",
        "variant": "plain"
      }
    ]
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_86",
    "formatNumber": 50,
    "name": "HBL Draft Jasper 86",
    "paper": "A4",
    "rtl": false,
    "appendCustomerTerms": true,
    "theme": {
      "primary": "#101010",
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
      "formatBadgeLabel": "JASPER",
      "heroTitle": "DRAFT BILL OF LADING",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
      },
      "partyMid": {
        "title": "Consignee",
        "lines": [
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Job No.",
          "v": "CEXP190150"
        },
        {
          "k": "Booking Ref.",
          "v": "B/EXP/19/0254"
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
          "k": "Vessel / Voyage",
          "v": "CMA CGM / 9887"
        },
        {
          "k": "Ocean Vessel",
          "v": "CMA CGM"
        },
        {
          "k": "Voyage Number",
          "v": "9887"
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
          "k": "Pre-carriage by",
          "v": ""
        },
        {
          "k": "Layout",
          "v": "HBL Draft Jasper 86"
        },
        {
          "k": "Catalogue",
          "v": "jasper #50"
        }
      ],
      "hblCargoHeaders": [
        "Container Nos, Seal Nos, Mark and Nos",
        "Number and kind of packages : description of goods",
        "Gross Weight(Kg)",
        "Volume"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 /\n20' DC X 1\nNIL MARKS",
          "STC: VALVE MATERIALS FOR MACHINERY PARTS\nFREIGHT PREPAID\nALL DESTINATION CHARGES ARE CONSIGNEE'S ACCOUNT",
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
      "containerNote": "Total Number of Containers or Packages (In words): ONE(1X20' DC) CONTAINER ONLY",
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "hblBlTitle": "Bill of Lading FOR COMBINED TRANSPORT OR PORT TO PORT SHIPMENT",
      "hblOriginals": "1(ONE)",
      "hblRegisteredNo": "MTO/DGS/1182/APR/2019",
      "hblDeliveryAgent": {
        "title": "APPLICATION FOR DELIVERY AT DESTINATION MUST BE MADE TO:",
        "lines": [
          "KingFisher Wings Dubai LLC",
          "DUBAI UNITED ARAB EMIRATES",
          "TEL: +971 55 5355 286",
          "EMAIL: inquiry@kingfishertec.com"
        ]
      },
      "termsLines": [
        "DRAFT — BILL OF LADING NOT NEGOTIABLE UNLESS CONSIGNED \"TO ORDER\"",
        "RECEIVED by the Carrier the Goods as specified above in apparent good order and condition unless otherwise stated.",
        "AS AGENT FOR THE CARRIER"
      ],
      "remarks": "JASPER"
    },
    "blocks": [
      {
        "type": "hblBlShell",
        "embedLogo": true,
        "variant": "combined"
      },
      {
        "type": "hblFreightSignature",
        "variant": "blClosing"
      },
      {
        "type": "colorfulFooter",
        "variant": "plain"
      }
    ]
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_87",
    "formatNumber": 51,
    "name": "HBL Draft Jasper 87",
    "paper": "A4",
    "rtl": false,
    "appendCustomerTerms": true,
    "theme": {
      "primary": "#101010",
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
      "formatBadgeLabel": "JASPER",
      "heroTitle": "DRAFT BILL OF LADING",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
      },
      "partyMid": {
        "title": "Consignee",
        "lines": [
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Job No.",
          "v": "CEXP190150"
        },
        {
          "k": "Booking Ref.",
          "v": "B/EXP/19/0254"
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
          "k": "Vessel / Voyage",
          "v": "CMA CGM / 9887"
        },
        {
          "k": "Ocean Vessel",
          "v": "CMA CGM"
        },
        {
          "k": "Voyage Number",
          "v": "9887"
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
          "k": "Pre-carriage by",
          "v": ""
        },
        {
          "k": "Layout",
          "v": "HBL Draft Jasper 87"
        },
        {
          "k": "Catalogue",
          "v": "jasper #51"
        }
      ],
      "hblCargoHeaders": [
        "Container Nos, Seal Nos, Mark and Nos",
        "Number and kind of packages : description of goods",
        "Gross Weight(Kg)",
        "Volume"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 /\n20' DC X 1\nNIL MARKS",
          "STC: VALVE MATERIALS FOR MACHINERY PARTS\nFREIGHT PREPAID\nALL DESTINATION CHARGES ARE CONSIGNEE'S ACCOUNT",
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
      "containerNote": "Total Number of Containers or Packages (In words): ONE(1X20' DC) CONTAINER ONLY",
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "hblBlTitle": "Bill of Lading FOR COMBINED TRANSPORT OR PORT TO PORT SHIPMENT",
      "hblOriginals": "1(ONE)",
      "hblRegisteredNo": "MTO/DGS/1182/APR/2019",
      "hblDeliveryAgent": {
        "title": "APPLICATION FOR DELIVERY AT DESTINATION MUST BE MADE TO:",
        "lines": [
          "KingFisher Wings Dubai LLC",
          "DUBAI UNITED ARAB EMIRATES",
          "TEL: +971 55 5355 286",
          "EMAIL: inquiry@kingfishertec.com"
        ]
      },
      "termsLines": [
        "DRAFT — BILL OF LADING NOT NEGOTIABLE UNLESS CONSIGNED \"TO ORDER\"",
        "RECEIVED by the Carrier the Goods as specified above in apparent good order and condition unless otherwise stated.",
        "AS AGENT FOR THE CARRIER"
      ],
      "remarks": "JASPER"
    },
    "blocks": [
      {
        "type": "hblBlShell",
        "embedLogo": true,
        "variant": "combined"
      },
      {
        "type": "hblFreightSignature",
        "variant": "blClosing"
      },
      {
        "type": "colorfulFooter",
        "variant": "plain"
      }
    ]
  },
  {
    "code": "FG_HBL_ORIGINAL_FORMAT_87",
    "formatNumber": 52,
    "name": "HBL Original Jasper 87",
    "paper": "A4",
    "rtl": false,
    "appendCustomerTerms": true,
    "theme": {
      "primary": "#101010",
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
      "formatBadgeLabel": "ORIGINAL",
      "heroTitle": "ORIGINAL BILL OF LADING",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
      },
      "partyMid": {
        "title": "Consignee",
        "lines": [
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Job No.",
          "v": "CEXP190150"
        },
        {
          "k": "Booking Ref.",
          "v": "B/EXP/19/0254"
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
          "k": "Vessel / Voyage",
          "v": "CMA CGM / 9887"
        },
        {
          "k": "Ocean Vessel",
          "v": "CMA CGM"
        },
        {
          "k": "Voyage Number",
          "v": "9887"
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
          "k": "Pre-carriage by",
          "v": ""
        },
        {
          "k": "Layout",
          "v": "HBL Original Jasper 87"
        },
        {
          "k": "Catalogue",
          "v": "jasper #52"
        }
      ],
      "hblCargoHeaders": [
        "Container Nos, Seal Nos, Mark and Nos",
        "Number and kind of packages : description of goods",
        "Gross Weight(Kg)",
        "Volume"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 /\n20' DC X 1\nNIL MARKS",
          "STC: VALVE MATERIALS FOR MACHINERY PARTS\nFREIGHT PREPAID\nALL DESTINATION CHARGES ARE CONSIGNEE'S ACCOUNT",
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
      "containerNote": "Total Number of Containers or Packages (In words): ONE(1X20' DC) CONTAINER ONLY",
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "hblBlTitle": "Bill of Lading FOR COMBINED TRANSPORT OR PORT TO PORT SHIPMENT",
      "hblOriginals": "1(ONE)",
      "hblRegisteredNo": "MTO/DGS/1182/APR/2019",
      "hblDeliveryAgent": {
        "title": "APPLICATION FOR DELIVERY AT DESTINATION MUST BE MADE TO:",
        "lines": [
          "KingFisher Wings Dubai LLC",
          "DUBAI UNITED ARAB EMIRATES",
          "TEL: +971 55 5355 286",
          "EMAIL: inquiry@kingfishertec.com"
        ]
      },
      "termsLines": [
        "ORIGINAL — Negotiable when duly endorsed.",
        "RECEIVED by the Carrier the Goods as specified above in apparent good order and condition unless otherwise stated.",
        "AS AGENT FOR THE CARRIER"
      ],
      "remarks": "ORIGINAL"
    },
    "blocks": [
      {
        "type": "hblBlShell",
        "embedLogo": true,
        "variant": "combined"
      },
      {
        "type": "hblFreightSignature",
        "variant": "blClosing"
      },
      {
        "type": "colorfulFooter",
        "variant": "plain"
      }
    ]
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_88",
    "formatNumber": 53,
    "name": "HBL Draft Jasper 88",
    "paper": "A4",
    "rtl": false,
    "appendCustomerTerms": true,
    "theme": {
      "primary": "#101010",
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
      "formatBadgeLabel": "JASPER",
      "heroTitle": "DRAFT BILL OF LADING",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
      },
      "partyMid": {
        "title": "Consignee",
        "lines": [
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Job No.",
          "v": "CEXP190150"
        },
        {
          "k": "Booking Ref.",
          "v": "B/EXP/19/0254"
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
          "k": "Vessel / Voyage",
          "v": "CMA CGM / 9887"
        },
        {
          "k": "Ocean Vessel",
          "v": "CMA CGM"
        },
        {
          "k": "Voyage Number",
          "v": "9887"
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
          "k": "Pre-carriage by",
          "v": ""
        },
        {
          "k": "Layout",
          "v": "HBL Draft Jasper 88"
        },
        {
          "k": "Catalogue",
          "v": "jasper #53"
        }
      ],
      "hblCargoHeaders": [
        "Container Nos, Seal Nos, Mark and Nos",
        "Number and kind of packages : description of goods",
        "Gross Weight(Kg)",
        "Volume"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 /\n20' DC X 1\nNIL MARKS",
          "STC: VALVE MATERIALS FOR MACHINERY PARTS\nFREIGHT PREPAID\nALL DESTINATION CHARGES ARE CONSIGNEE'S ACCOUNT",
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
      "containerNote": "Total Number of Containers or Packages (In words): ONE(1X20' DC) CONTAINER ONLY",
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "hblBlTitle": "BILL OF LADING",
      "hblOriginals": "1(ONE)",
      "hblRegisteredNo": "MTO/DGS/1182/APR/2019",
      "hblDeliveryAgent": {
        "title": "APPLICATION FOR DELIVERY AT DESTINATION MUST BE MADE TO:",
        "lines": [
          "KingFisher Wings Dubai LLC",
          "DUBAI UNITED ARAB EMIRATES",
          "TEL: +971 55 5355 286",
          "EMAIL: inquiry@kingfishertec.com"
        ]
      },
      "termsLines": [
        "DRAFT — BILL OF LADING NOT NEGOTIABLE UNLESS CONSIGNED \"TO ORDER\"",
        "RECEIVED by the Carrier the Goods as specified above in apparent good order and condition unless otherwise stated.",
        "AS AGENT FOR THE CARRIER"
      ],
      "remarks": "JASPER"
    },
    "blocks": [
      {
        "type": "hblBlShell",
        "embedLogo": true,
        "variant": "ocean"
      },
      {
        "type": "hblFreightSignature",
        "variant": "blClosing"
      },
      {
        "type": "colorfulFooter",
        "variant": "plain"
      }
    ]
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_89",
    "formatNumber": 54,
    "name": "HBL Draft Jasper 89",
    "paper": "A4",
    "rtl": false,
    "appendCustomerTerms": true,
    "theme": {
      "primary": "#101010",
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
      "formatBadgeLabel": "JASPER",
      "heroTitle": "DRAFT BILL OF LADING",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
      },
      "partyMid": {
        "title": "Consignee",
        "lines": [
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Job No.",
          "v": "CEXP190150"
        },
        {
          "k": "Booking Ref.",
          "v": "B/EXP/19/0254"
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
          "k": "Vessel / Voyage",
          "v": "CMA CGM / 9887"
        },
        {
          "k": "Ocean Vessel",
          "v": "CMA CGM"
        },
        {
          "k": "Voyage Number",
          "v": "9887"
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
          "k": "Pre-carriage by",
          "v": ""
        },
        {
          "k": "Layout",
          "v": "HBL Draft Jasper 89"
        },
        {
          "k": "Catalogue",
          "v": "jasper #54"
        }
      ],
      "hblCargoHeaders": [
        "Container Nos, Seal Nos, Mark and Nos",
        "Number and kind of packages : description of goods",
        "Gross Weight(Kg)",
        "Volume"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 /\n20' DC X 1\nNIL MARKS",
          "STC: VALVE MATERIALS FOR MACHINERY PARTS\nFREIGHT PREPAID\nALL DESTINATION CHARGES ARE CONSIGNEE'S ACCOUNT",
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
      "containerNote": "Total Number of Containers or Packages (In words): ONE(1X20' DC) CONTAINER ONLY",
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "hblBlTitle": "MULTIMODAL TRANSPORT DOCUMENT",
      "hblOriginals": "1(ONE)",
      "hblRegisteredNo": "MTO/DGS/1182/APR/2019",
      "hblDeliveryAgent": {
        "title": "APPLICATION FOR DELIVERY AT DESTINATION MUST BE MADE TO:",
        "lines": [
          "KingFisher Wings Dubai LLC",
          "DUBAI UNITED ARAB EMIRATES",
          "TEL: +971 55 5355 286",
          "EMAIL: inquiry@kingfishertec.com"
        ]
      },
      "termsLines": [
        "DRAFT — BILL OF LADING NOT NEGOTIABLE UNLESS CONSIGNED \"TO ORDER\"",
        "RECEIVED by the Carrier the Goods as specified above in apparent good order and condition unless otherwise stated.",
        "AS AGENT FOR THE CARRIER"
      ],
      "remarks": "JASPER"
    },
    "blocks": [
      {
        "type": "hblBlShell",
        "embedLogo": true,
        "variant": "mt"
      },
      {
        "type": "hblFreightSignature",
        "variant": "blClosing"
      },
      {
        "type": "colorfulFooter",
        "variant": "plain"
      }
    ]
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_90",
    "formatNumber": 55,
    "name": "HBL Draft Jasper 90",
    "paper": "A4",
    "rtl": false,
    "appendCustomerTerms": true,
    "theme": {
      "primary": "#101010",
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
      "formatBadgeLabel": "JASPER",
      "heroTitle": "DRAFT BILL OF LADING",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
      },
      "partyMid": {
        "title": "Consignee",
        "lines": [
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Job No.",
          "v": "CEXP190150"
        },
        {
          "k": "Booking Ref.",
          "v": "B/EXP/19/0254"
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
          "k": "Vessel / Voyage",
          "v": "CMA CGM / 9887"
        },
        {
          "k": "Ocean Vessel",
          "v": "CMA CGM"
        },
        {
          "k": "Voyage Number",
          "v": "9887"
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
          "k": "Pre-carriage by",
          "v": ""
        },
        {
          "k": "Layout",
          "v": "HBL Draft Jasper 90"
        },
        {
          "k": "Catalogue",
          "v": "jasper #55"
        }
      ],
      "hblCargoHeaders": [
        "Container Nos, Seal Nos, Mark and Nos",
        "Number and kind of packages : description of goods",
        "Gross Weight(Kg)",
        "Volume"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 /\n20' DC X 1\nNIL MARKS",
          "STC: VALVE MATERIALS FOR MACHINERY PARTS\nFREIGHT PREPAID\nALL DESTINATION CHARGES ARE CONSIGNEE'S ACCOUNT",
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
      "containerNote": "Total Number of Containers or Packages (In words): ONE(1X20' DC) CONTAINER ONLY",
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "hblBlTitle": "Bill of Lading FOR COMBINED TRANSPORT OR PORT TO PORT SHIPMENT",
      "hblOriginals": "1(ONE)",
      "hblRegisteredNo": "MTO/DGS/1182/APR/2019",
      "hblDeliveryAgent": {
        "title": "APPLICATION FOR DELIVERY AT DESTINATION MUST BE MADE TO:",
        "lines": [
          "KingFisher Wings Dubai LLC",
          "DUBAI UNITED ARAB EMIRATES",
          "TEL: +971 55 5355 286",
          "EMAIL: inquiry@kingfishertec.com"
        ]
      },
      "termsLines": [
        "DRAFT — BILL OF LADING NOT NEGOTIABLE UNLESS CONSIGNED \"TO ORDER\"",
        "RECEIVED by the Carrier the Goods as specified above in apparent good order and condition unless otherwise stated.",
        "AS AGENT FOR THE CARRIER"
      ],
      "remarks": "JASPER"
    },
    "blocks": [
      {
        "type": "hblBlShell",
        "embedLogo": true,
        "variant": "combined"
      },
      {
        "type": "hblFreightSignature",
        "variant": "blClosing"
      },
      {
        "type": "colorfulFooter",
        "variant": "plain"
      }
    ]
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_92",
    "formatNumber": 56,
    "name": "HBL Draft Jasper 92",
    "paper": "A4",
    "rtl": false,
    "appendCustomerTerms": true,
    "theme": {
      "primary": "#101010",
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
      "formatBadgeLabel": "JASPER",
      "heroTitle": "DRAFT BILL OF LADING",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
      },
      "partyMid": {
        "title": "Consignee",
        "lines": [
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Job No.",
          "v": "CEXP190150"
        },
        {
          "k": "Booking Ref.",
          "v": "B/EXP/19/0254"
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
          "k": "Vessel / Voyage",
          "v": "CMA CGM / 9887"
        },
        {
          "k": "Ocean Vessel",
          "v": "CMA CGM"
        },
        {
          "k": "Voyage Number",
          "v": "9887"
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
          "k": "Pre-carriage by",
          "v": ""
        },
        {
          "k": "Layout",
          "v": "HBL Draft Jasper 92"
        },
        {
          "k": "Catalogue",
          "v": "jasper #56"
        }
      ],
      "hblCargoHeaders": [
        "Container Nos, Seal Nos, Mark and Nos",
        "Number and kind of packages : description of goods",
        "Gross Weight(Kg)",
        "Volume"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 /\n20' DC X 1\nNIL MARKS",
          "STC: VALVE MATERIALS FOR MACHINERY PARTS\nFREIGHT PREPAID\nALL DESTINATION CHARGES ARE CONSIGNEE'S ACCOUNT",
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
      "containerNote": "Total Number of Containers or Packages (In words): ONE(1X20' DC) CONTAINER ONLY",
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "hblBlTitle": "MULTI-MODAL TRANSPORT DOCUMENT",
      "hblOriginals": "1(ONE)",
      "hblRegisteredNo": "MTO/DGS/1182/APR/2019",
      "hblDeliveryAgent": {
        "title": "APPLICATION FOR DELIVERY AT DESTINATION MUST BE MADE TO:",
        "lines": [
          "KingFisher Wings Dubai LLC",
          "DUBAI UNITED ARAB EMIRATES",
          "TEL: +971 55 5355 286",
          "EMAIL: inquiry@kingfishertec.com"
        ]
      },
      "termsLines": [
        "DRAFT — BILL OF LADING NOT NEGOTIABLE UNLESS CONSIGNED \"TO ORDER\"",
        "RECEIVED by the Carrier the Goods as specified above in apparent good order and condition unless otherwise stated.",
        "AS AGENT FOR THE CARRIER"
      ],
      "remarks": "JASPER"
    },
    "blocks": [
      {
        "type": "hblBlShell",
        "embedLogo": true,
        "variant": "multimodal"
      },
      {
        "type": "hblFreightSignature",
        "variant": "blClosing"
      },
      {
        "type": "colorfulFooter",
        "variant": "plain"
      }
    ]
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_95",
    "formatNumber": 57,
    "name": "HBL Draft Jasper 95",
    "paper": "A4",
    "rtl": false,
    "appendCustomerTerms": true,
    "theme": {
      "primary": "#101010",
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
      "formatBadgeLabel": "JASPER",
      "heroTitle": "DRAFT BILL OF LADING",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
      },
      "partyMid": {
        "title": "Consignee",
        "lines": [
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Job No.",
          "v": "CEXP190150"
        },
        {
          "k": "Booking Ref.",
          "v": "B/EXP/19/0254"
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
          "k": "Vessel / Voyage",
          "v": "CMA CGM / 9887"
        },
        {
          "k": "Ocean Vessel",
          "v": "CMA CGM"
        },
        {
          "k": "Voyage Number",
          "v": "9887"
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
          "k": "Pre-carriage by",
          "v": ""
        },
        {
          "k": "Layout",
          "v": "HBL Draft Jasper 95"
        },
        {
          "k": "Catalogue",
          "v": "jasper #57"
        }
      ],
      "hblCargoHeaders": [
        "Container Nos, Seal Nos, Mark and Nos",
        "Number and kind of packages : description of goods",
        "Gross Weight(Kg)",
        "Volume"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 /\n20' DC X 1\nNIL MARKS",
          "STC: VALVE MATERIALS FOR MACHINERY PARTS\nFREIGHT PREPAID\nALL DESTINATION CHARGES ARE CONSIGNEE'S ACCOUNT",
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
      "containerNote": "Total Number of Containers or Packages (In words): ONE(1X20' DC) CONTAINER ONLY",
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "hblBlTitle": "BILL OF LADING  NOT NEGOTIABLE UNLESS CONSIGNED \"TO ORDER\"",
      "hblOriginals": "1(ONE)",
      "hblRegisteredNo": "MTO/DGS/1182/APR/2019",
      "hblDeliveryAgent": {
        "title": "APPLICATION FOR DELIVERY AT DESTINATION MUST BE MADE TO:",
        "lines": [
          "KingFisher Wings Dubai LLC",
          "DUBAI UNITED ARAB EMIRATES",
          "TEL: +971 55 5355 286",
          "EMAIL: inquiry@kingfishertec.com"
        ]
      },
      "termsLines": [
        "DRAFT — BILL OF LADING NOT NEGOTIABLE UNLESS CONSIGNED \"TO ORDER\"",
        "RECEIVED by the Carrier the Goods as specified above in apparent good order and condition unless otherwise stated.",
        "AS AGENT FOR THE CARRIER"
      ],
      "remarks": "JASPER"
    },
    "blocks": [
      {
        "type": "hblBlShell",
        "embedLogo": true,
        "variant": "jasper"
      },
      {
        "type": "hblFreightSignature",
        "variant": "blClosing"
      },
      {
        "type": "colorfulFooter",
        "variant": "plain"
      }
    ]
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_96",
    "formatNumber": 58,
    "name": "HBL Draft Jasper 96",
    "paper": "A4",
    "rtl": false,
    "appendCustomerTerms": true,
    "theme": {
      "primary": "#101010",
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
      "formatBadgeLabel": "JASPER",
      "heroTitle": "DRAFT BILL OF LADING",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
      },
      "partyMid": {
        "title": "Consignee",
        "lines": [
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Job No.",
          "v": "CEXP190150"
        },
        {
          "k": "Booking Ref.",
          "v": "B/EXP/19/0254"
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
          "k": "Vessel / Voyage",
          "v": "CMA CGM / 9887"
        },
        {
          "k": "Ocean Vessel",
          "v": "CMA CGM"
        },
        {
          "k": "Voyage Number",
          "v": "9887"
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
          "k": "Pre-carriage by",
          "v": ""
        },
        {
          "k": "Layout",
          "v": "HBL Draft Jasper 96"
        },
        {
          "k": "Catalogue",
          "v": "jasper #58"
        }
      ],
      "hblCargoHeaders": [
        "Container Nos, Seal Nos, Mark and Nos",
        "Number and kind of packages : description of goods",
        "Gross Weight(Kg)",
        "Volume"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 /\n20' DC X 1\nNIL MARKS",
          "STC: VALVE MATERIALS FOR MACHINERY PARTS\nFREIGHT PREPAID\nALL DESTINATION CHARGES ARE CONSIGNEE'S ACCOUNT",
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
      "containerNote": "Total Number of Containers or Packages (In words): ONE(1X20' DC) CONTAINER ONLY",
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "hblBlTitle": "BILL OF LADING",
      "hblOriginals": "1(ONE)",
      "hblRegisteredNo": "MTO/DGS/1182/APR/2019",
      "hblDeliveryAgent": {
        "title": "APPLICATION FOR DELIVERY AT DESTINATION MUST BE MADE TO:",
        "lines": [
          "KingFisher Wings Dubai LLC",
          "DUBAI UNITED ARAB EMIRATES",
          "TEL: +971 55 5355 286",
          "EMAIL: inquiry@kingfishertec.com"
        ]
      },
      "termsLines": [
        "DRAFT — BILL OF LADING NOT NEGOTIABLE UNLESS CONSIGNED \"TO ORDER\"",
        "RECEIVED by the Carrier the Goods as specified above in apparent good order and condition unless otherwise stated.",
        "AS AGENT FOR THE CARRIER"
      ],
      "remarks": "JASPER"
    },
    "blocks": [
      {
        "type": "hblBlShell",
        "embedLogo": true,
        "variant": "ocean"
      },
      {
        "type": "hblFreightSignature",
        "variant": "blClosing"
      },
      {
        "type": "colorfulFooter",
        "variant": "plain"
      }
    ]
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_97",
    "formatNumber": 59,
    "name": "HBL Draft Jasper 97",
    "paper": "A4",
    "rtl": false,
    "appendCustomerTerms": true,
    "theme": {
      "primary": "#101010",
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
      "formatBadgeLabel": "JASPER",
      "heroTitle": "DRAFT BILL OF LADING",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
      },
      "partyMid": {
        "title": "Consignee",
        "lines": [
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Job No.",
          "v": "CEXP190150"
        },
        {
          "k": "Booking Ref.",
          "v": "B/EXP/19/0254"
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
          "k": "Vessel / Voyage",
          "v": "CMA CGM / 9887"
        },
        {
          "k": "Ocean Vessel",
          "v": "CMA CGM"
        },
        {
          "k": "Voyage Number",
          "v": "9887"
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
          "k": "Pre-carriage by",
          "v": ""
        },
        {
          "k": "Layout",
          "v": "HBL Draft Jasper 97"
        },
        {
          "k": "Catalogue",
          "v": "jasper #59"
        }
      ],
      "hblCargoHeaders": [
        "Container Nos, Seal Nos, Mark and Nos",
        "Number and kind of packages : description of goods",
        "Gross Weight(Kg)",
        "Volume"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 /\n20' DC X 1\nNIL MARKS",
          "STC: VALVE MATERIALS FOR MACHINERY PARTS\nFREIGHT PREPAID\nALL DESTINATION CHARGES ARE CONSIGNEE'S ACCOUNT",
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
      "containerNote": "Total Number of Containers or Packages (In words): ONE(1X20' DC) CONTAINER ONLY",
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "hblBlTitle": "MULTIMODAL TRANSPORT DOCUMENT",
      "hblOriginals": "1(ONE)",
      "hblRegisteredNo": "MTO/DGS/1182/APR/2019",
      "hblDeliveryAgent": {
        "title": "APPLICATION FOR DELIVERY AT DESTINATION MUST BE MADE TO:",
        "lines": [
          "KingFisher Wings Dubai LLC",
          "DUBAI UNITED ARAB EMIRATES",
          "TEL: +971 55 5355 286",
          "EMAIL: inquiry@kingfishertec.com"
        ]
      },
      "termsLines": [
        "DRAFT — BILL OF LADING NOT NEGOTIABLE UNLESS CONSIGNED \"TO ORDER\"",
        "RECEIVED by the Carrier the Goods as specified above in apparent good order and condition unless otherwise stated.",
        "AS AGENT FOR THE CARRIER"
      ],
      "remarks": "JASPER"
    },
    "blocks": [
      {
        "type": "hblBlShell",
        "embedLogo": true,
        "variant": "mt"
      },
      {
        "type": "hblFreightSignature",
        "variant": "blClosing"
      },
      {
        "type": "colorfulFooter",
        "variant": "plain"
      }
    ]
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_99",
    "formatNumber": 60,
    "name": "HBL Draft Jasper 99",
    "paper": "A4",
    "rtl": false,
    "appendCustomerTerms": true,
    "theme": {
      "primary": "#101010",
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
      "formatBadgeLabel": "JASPER",
      "heroTitle": "DRAFT BILL OF LADING",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
      },
      "partyMid": {
        "title": "Consignee",
        "lines": [
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Job No.",
          "v": "CEXP190150"
        },
        {
          "k": "Booking Ref.",
          "v": "B/EXP/19/0254"
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
          "k": "Vessel / Voyage",
          "v": "CMA CGM / 9887"
        },
        {
          "k": "Ocean Vessel",
          "v": "CMA CGM"
        },
        {
          "k": "Voyage Number",
          "v": "9887"
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
          "k": "Pre-carriage by",
          "v": ""
        },
        {
          "k": "Layout",
          "v": "HBL Draft Jasper 99"
        },
        {
          "k": "Catalogue",
          "v": "jasper #60"
        }
      ],
      "hblCargoHeaders": [
        "Container Nos, Seal Nos, Mark and Nos",
        "Number and kind of packages : description of goods",
        "Gross Weight(Kg)",
        "Volume"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 /\n20' DC X 1\nNIL MARKS",
          "STC: VALVE MATERIALS FOR MACHINERY PARTS\nFREIGHT PREPAID\nALL DESTINATION CHARGES ARE CONSIGNEE'S ACCOUNT",
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
      "containerNote": "Total Number of Containers or Packages (In words): ONE(1X20' DC) CONTAINER ONLY",
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "hblBlTitle": "Bill of Lading FOR COMBINED TRANSPORT OR PORT TO PORT SHIPMENT",
      "hblOriginals": "1(ONE)",
      "hblRegisteredNo": "MTO/DGS/1182/APR/2019",
      "hblDeliveryAgent": {
        "title": "APPLICATION FOR DELIVERY AT DESTINATION MUST BE MADE TO:",
        "lines": [
          "KingFisher Wings Dubai LLC",
          "DUBAI UNITED ARAB EMIRATES",
          "TEL: +971 55 5355 286",
          "EMAIL: inquiry@kingfishertec.com"
        ]
      },
      "termsLines": [
        "DRAFT — BILL OF LADING NOT NEGOTIABLE UNLESS CONSIGNED \"TO ORDER\"",
        "RECEIVED by the Carrier the Goods as specified above in apparent good order and condition unless otherwise stated.",
        "AS AGENT FOR THE CARRIER"
      ],
      "remarks": "JASPER"
    },
    "blocks": [
      {
        "type": "hblBlShell",
        "embedLogo": true,
        "variant": "combined"
      },
      {
        "type": "hblFreightSignature",
        "variant": "blClosing"
      },
      {
        "type": "colorfulFooter",
        "variant": "plain"
      }
    ]
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_100",
    "formatNumber": 61,
    "name": "HBL Draft Jasper 100",
    "paper": "A4",
    "rtl": false,
    "appendCustomerTerms": true,
    "theme": {
      "primary": "#101010",
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
      "formatBadgeLabel": "JASPER",
      "heroTitle": "DRAFT BILL OF LADING",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
      },
      "partyMid": {
        "title": "Consignee",
        "lines": [
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Job No.",
          "v": "CEXP190150"
        },
        {
          "k": "Booking Ref.",
          "v": "B/EXP/19/0254"
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
          "k": "Vessel / Voyage",
          "v": "CMA CGM / 9887"
        },
        {
          "k": "Ocean Vessel",
          "v": "CMA CGM"
        },
        {
          "k": "Voyage Number",
          "v": "9887"
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
          "k": "Pre-carriage by",
          "v": ""
        },
        {
          "k": "Layout",
          "v": "HBL Draft Jasper 100"
        },
        {
          "k": "Catalogue",
          "v": "jasper #61"
        }
      ],
      "hblCargoHeaders": [
        "Container Nos, Seal Nos, Mark and Nos",
        "Number and kind of packages : description of goods",
        "Gross Weight(Kg)",
        "Volume"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 /\n20' DC X 1\nNIL MARKS",
          "STC: VALVE MATERIALS FOR MACHINERY PARTS\nFREIGHT PREPAID\nALL DESTINATION CHARGES ARE CONSIGNEE'S ACCOUNT",
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
      "containerNote": "Total Number of Containers or Packages (In words): ONE(1X20' DC) CONTAINER ONLY",
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "hblBlTitle": "Bill of Lading FOR COMBINED TRANSPORT OR PORT TO PORT SHIPMENT",
      "hblOriginals": "1(ONE)",
      "hblRegisteredNo": "MTO/DGS/1182/APR/2019",
      "hblDeliveryAgent": {
        "title": "APPLICATION FOR DELIVERY AT DESTINATION MUST BE MADE TO:",
        "lines": [
          "KingFisher Wings Dubai LLC",
          "DUBAI UNITED ARAB EMIRATES",
          "TEL: +971 55 5355 286",
          "EMAIL: inquiry@kingfishertec.com"
        ]
      },
      "termsLines": [
        "DRAFT — BILL OF LADING NOT NEGOTIABLE UNLESS CONSIGNED \"TO ORDER\"",
        "RECEIVED by the Carrier the Goods as specified above in apparent good order and condition unless otherwise stated.",
        "AS AGENT FOR THE CARRIER"
      ],
      "remarks": "JASPER"
    },
    "blocks": [
      {
        "type": "hblBlShell",
        "embedLogo": true,
        "variant": "combined"
      },
      {
        "type": "hblFreightSignature",
        "variant": "blClosing"
      },
      {
        "type": "colorfulFooter",
        "variant": "plain"
      }
    ]
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_101",
    "formatNumber": 62,
    "name": "HBL Draft Jasper 101",
    "paper": "A4",
    "rtl": false,
    "appendCustomerTerms": true,
    "theme": {
      "primary": "#101010",
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
      "formatBadgeLabel": "JASPER",
      "heroTitle": "DRAFT BILL OF LADING",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
      },
      "partyMid": {
        "title": "Consignee",
        "lines": [
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Job No.",
          "v": "CEXP190150"
        },
        {
          "k": "Booking Ref.",
          "v": "B/EXP/19/0254"
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
          "k": "Vessel / Voyage",
          "v": "CMA CGM / 9887"
        },
        {
          "k": "Ocean Vessel",
          "v": "CMA CGM"
        },
        {
          "k": "Voyage Number",
          "v": "9887"
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
          "k": "Pre-carriage by",
          "v": ""
        },
        {
          "k": "Layout",
          "v": "HBL Draft Jasper 101"
        },
        {
          "k": "Catalogue",
          "v": "jasper #62"
        }
      ],
      "hblCargoHeaders": [
        "Container Nos, Seal Nos, Mark and Nos",
        "Number and kind of packages : description of goods",
        "Gross Weight(Kg)",
        "Volume"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 /\n20' DC X 1\nNIL MARKS",
          "STC: VALVE MATERIALS FOR MACHINERY PARTS\nFREIGHT PREPAID\nALL DESTINATION CHARGES ARE CONSIGNEE'S ACCOUNT",
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
      "containerNote": "Total Number of Containers or Packages (In words): ONE(1X20' DC) CONTAINER ONLY",
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "hblBlTitle": "BILL OF LADING  NOT NEGOTIABLE UNLESS CONSIGNED \"TO ORDER\"",
      "hblOriginals": "1(ONE)",
      "hblRegisteredNo": "MTO/DGS/1182/APR/2019",
      "hblDeliveryAgent": {
        "title": "APPLICATION FOR DELIVERY AT DESTINATION MUST BE MADE TO:",
        "lines": [
          "KingFisher Wings Dubai LLC",
          "DUBAI UNITED ARAB EMIRATES",
          "TEL: +971 55 5355 286",
          "EMAIL: inquiry@kingfishertec.com"
        ]
      },
      "termsLines": [
        "DRAFT — BILL OF LADING NOT NEGOTIABLE UNLESS CONSIGNED \"TO ORDER\"",
        "RECEIVED by the Carrier the Goods as specified above in apparent good order and condition unless otherwise stated.",
        "AS AGENT FOR THE CARRIER"
      ],
      "remarks": "JASPER"
    },
    "blocks": [
      {
        "type": "hblBlShell",
        "embedLogo": true,
        "variant": "jasper"
      },
      {
        "type": "hblFreightSignature",
        "variant": "blClosing"
      },
      {
        "type": "colorfulFooter",
        "variant": "plain"
      }
    ]
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_102",
    "formatNumber": 63,
    "name": "HBL Draft Jasper 102",
    "paper": "A4",
    "rtl": false,
    "appendCustomerTerms": true,
    "theme": {
      "primary": "#101010",
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
      "formatBadgeLabel": "JASPER",
      "heroTitle": "DRAFT BILL OF LADING",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
      },
      "partyMid": {
        "title": "Consignee",
        "lines": [
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Job No.",
          "v": "CEXP190150"
        },
        {
          "k": "Booking Ref.",
          "v": "B/EXP/19/0254"
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
          "k": "Vessel / Voyage",
          "v": "CMA CGM / 9887"
        },
        {
          "k": "Ocean Vessel",
          "v": "CMA CGM"
        },
        {
          "k": "Voyage Number",
          "v": "9887"
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
          "k": "Pre-carriage by",
          "v": ""
        },
        {
          "k": "Layout",
          "v": "HBL Draft Jasper 102"
        },
        {
          "k": "Catalogue",
          "v": "jasper #63"
        }
      ],
      "hblCargoHeaders": [
        "Container Nos, Seal Nos, Mark and Nos",
        "Number and kind of packages : description of goods",
        "Gross Weight(Kg)",
        "Volume"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 /\n20' DC X 1\nNIL MARKS",
          "STC: VALVE MATERIALS FOR MACHINERY PARTS\nFREIGHT PREPAID\nALL DESTINATION CHARGES ARE CONSIGNEE'S ACCOUNT",
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
      "containerNote": "Total Number of Containers or Packages (In words): ONE(1X20' DC) CONTAINER ONLY",
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "hblBlTitle": "BILL OF LADING",
      "hblOriginals": "1(ONE)",
      "hblRegisteredNo": "MTO/DGS/1182/APR/2019",
      "hblDeliveryAgent": {
        "title": "APPLICATION FOR DELIVERY AT DESTINATION MUST BE MADE TO:",
        "lines": [
          "KingFisher Wings Dubai LLC",
          "DUBAI UNITED ARAB EMIRATES",
          "TEL: +971 55 5355 286",
          "EMAIL: inquiry@kingfishertec.com"
        ]
      },
      "termsLines": [
        "DRAFT — BILL OF LADING NOT NEGOTIABLE UNLESS CONSIGNED \"TO ORDER\"",
        "RECEIVED by the Carrier the Goods as specified above in apparent good order and condition unless otherwise stated.",
        "AS AGENT FOR THE CARRIER"
      ],
      "remarks": "JASPER"
    },
    "blocks": [
      {
        "type": "hblBlShell",
        "embedLogo": true,
        "variant": "ocean"
      },
      {
        "type": "hblFreightSignature",
        "variant": "blClosing"
      },
      {
        "type": "colorfulFooter",
        "variant": "plain"
      }
    ]
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_107",
    "formatNumber": 64,
    "name": "HBL Draft Jasper 107",
    "paper": "A4",
    "rtl": false,
    "appendCustomerTerms": true,
    "theme": {
      "primary": "#101010",
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
      "formatBadgeLabel": "JASPER",
      "heroTitle": "DRAFT BILL OF LADING",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
      },
      "partyMid": {
        "title": "Consignee",
        "lines": [
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Job No.",
          "v": "CEXP190150"
        },
        {
          "k": "Booking Ref.",
          "v": "B/EXP/19/0254"
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
          "k": "Vessel / Voyage",
          "v": "CMA CGM / 9887"
        },
        {
          "k": "Ocean Vessel",
          "v": "CMA CGM"
        },
        {
          "k": "Voyage Number",
          "v": "9887"
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
          "k": "Pre-carriage by",
          "v": ""
        },
        {
          "k": "Layout",
          "v": "HBL Draft Jasper 107"
        },
        {
          "k": "Catalogue",
          "v": "jasper #64"
        }
      ],
      "hblCargoHeaders": [
        "Container Nos, Seal Nos, Mark and Nos",
        "Number and kind of packages : description of goods",
        "Gross Weight(Kg)",
        "Volume"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 /\n20' DC X 1\nNIL MARKS",
          "STC: VALVE MATERIALS FOR MACHINERY PARTS\nFREIGHT PREPAID\nALL DESTINATION CHARGES ARE CONSIGNEE'S ACCOUNT",
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
      "containerNote": "Total Number of Containers or Packages (In words): ONE(1X20' DC) CONTAINER ONLY",
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "hblBlTitle": "MULTIMODAL TRANSPORT DOCUMENT",
      "hblOriginals": "1(ONE)",
      "hblRegisteredNo": "MTO/DGS/1182/APR/2019",
      "hblDeliveryAgent": {
        "title": "APPLICATION FOR DELIVERY AT DESTINATION MUST BE MADE TO:",
        "lines": [
          "KingFisher Wings Dubai LLC",
          "DUBAI UNITED ARAB EMIRATES",
          "TEL: +971 55 5355 286",
          "EMAIL: inquiry@kingfishertec.com"
        ]
      },
      "termsLines": [
        "DRAFT — BILL OF LADING NOT NEGOTIABLE UNLESS CONSIGNED \"TO ORDER\"",
        "RECEIVED by the Carrier the Goods as specified above in apparent good order and condition unless otherwise stated.",
        "AS AGENT FOR THE CARRIER"
      ],
      "remarks": "JASPER"
    },
    "blocks": [
      {
        "type": "hblBlShell",
        "embedLogo": true,
        "variant": "mt"
      },
      {
        "type": "hblFreightSignature",
        "variant": "blClosing"
      },
      {
        "type": "colorfulFooter",
        "variant": "plain"
      }
    ]
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_109",
    "formatNumber": 65,
    "name": "HBL Draft Jasper 109",
    "paper": "A4",
    "rtl": false,
    "appendCustomerTerms": true,
    "theme": {
      "primary": "#101010",
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
      "formatBadgeLabel": "JASPER",
      "heroTitle": "DRAFT BILL OF LADING",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
      },
      "partyMid": {
        "title": "Consignee",
        "lines": [
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Job No.",
          "v": "CEXP190150"
        },
        {
          "k": "Booking Ref.",
          "v": "B/EXP/19/0254"
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
          "k": "Vessel / Voyage",
          "v": "CMA CGM / 9887"
        },
        {
          "k": "Ocean Vessel",
          "v": "CMA CGM"
        },
        {
          "k": "Voyage Number",
          "v": "9887"
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
          "k": "Pre-carriage by",
          "v": ""
        },
        {
          "k": "Layout",
          "v": "HBL Draft Jasper 109"
        },
        {
          "k": "Catalogue",
          "v": "jasper #65"
        }
      ],
      "hblCargoHeaders": [
        "Container Nos, Seal Nos, Mark and Nos",
        "Number and kind of packages : description of goods",
        "Gross Weight(Kg)",
        "Volume"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 /\n20' DC X 1\nNIL MARKS",
          "STC: VALVE MATERIALS FOR MACHINERY PARTS\nFREIGHT PREPAID\nALL DESTINATION CHARGES ARE CONSIGNEE'S ACCOUNT",
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
      "containerNote": "Total Number of Containers or Packages (In words): ONE(1X20' DC) CONTAINER ONLY",
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "hblBlTitle": "Bill of Lading FOR COMBINED TRANSPORT OR PORT TO PORT SHIPMENT",
      "hblOriginals": "1(ONE)",
      "hblRegisteredNo": "MTO/DGS/1182/APR/2019",
      "hblDeliveryAgent": {
        "title": "APPLICATION FOR DELIVERY AT DESTINATION MUST BE MADE TO:",
        "lines": [
          "KingFisher Wings Dubai LLC",
          "DUBAI UNITED ARAB EMIRATES",
          "TEL: +971 55 5355 286",
          "EMAIL: inquiry@kingfishertec.com"
        ]
      },
      "termsLines": [
        "DRAFT — BILL OF LADING NOT NEGOTIABLE UNLESS CONSIGNED \"TO ORDER\"",
        "RECEIVED by the Carrier the Goods as specified above in apparent good order and condition unless otherwise stated.",
        "AS AGENT FOR THE CARRIER"
      ],
      "remarks": "JASPER"
    },
    "blocks": [
      {
        "type": "hblBlShell",
        "embedLogo": true,
        "variant": "combined"
      },
      {
        "type": "hblFreightSignature",
        "variant": "blClosing"
      },
      {
        "type": "colorfulFooter",
        "variant": "plain"
      }
    ]
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_114",
    "formatNumber": 66,
    "name": "HBL Draft Jasper 114",
    "paper": "A4",
    "rtl": false,
    "appendCustomerTerms": true,
    "theme": {
      "primary": "#101010",
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
      "formatBadgeLabel": "JASPER",
      "heroTitle": "DRAFT BILL OF LADING",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
      },
      "partyMid": {
        "title": "Consignee",
        "lines": [
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Job No.",
          "v": "CEXP190150"
        },
        {
          "k": "Booking Ref.",
          "v": "B/EXP/19/0254"
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
          "k": "Vessel / Voyage",
          "v": "CMA CGM / 9887"
        },
        {
          "k": "Ocean Vessel",
          "v": "CMA CGM"
        },
        {
          "k": "Voyage Number",
          "v": "9887"
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
          "k": "Pre-carriage by",
          "v": ""
        },
        {
          "k": "Layout",
          "v": "HBL Draft Jasper 114"
        },
        {
          "k": "Catalogue",
          "v": "jasper #66"
        }
      ],
      "hblCargoHeaders": [
        "Container Nos, Seal Nos, Mark and Nos",
        "Number and kind of packages : description of goods",
        "Gross Weight(Kg)",
        "Volume"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 /\n20' DC X 1\nNIL MARKS",
          "STC: VALVE MATERIALS FOR MACHINERY PARTS\nFREIGHT PREPAID\nALL DESTINATION CHARGES ARE CONSIGNEE'S ACCOUNT",
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
      "containerNote": "Total Number of Containers or Packages (In words): ONE(1X20' DC) CONTAINER ONLY",
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "hblBlTitle": "MULTI-MODAL TRANSPORT DOCUMENT",
      "hblOriginals": "1(ONE)",
      "hblRegisteredNo": "MTO/DGS/1182/APR/2019",
      "hblDeliveryAgent": {
        "title": "APPLICATION FOR DELIVERY AT DESTINATION MUST BE MADE TO:",
        "lines": [
          "KingFisher Wings Dubai LLC",
          "DUBAI UNITED ARAB EMIRATES",
          "TEL: +971 55 5355 286",
          "EMAIL: inquiry@kingfishertec.com"
        ]
      },
      "termsLines": [
        "DRAFT — BILL OF LADING NOT NEGOTIABLE UNLESS CONSIGNED \"TO ORDER\"",
        "RECEIVED by the Carrier the Goods as specified above in apparent good order and condition unless otherwise stated.",
        "AS AGENT FOR THE CARRIER"
      ],
      "remarks": "JASPER"
    },
    "blocks": [
      {
        "type": "hblBlShell",
        "embedLogo": true,
        "variant": "multimodal"
      },
      {
        "type": "hblFreightSignature",
        "variant": "blClosing"
      },
      {
        "type": "colorfulFooter",
        "variant": "plain"
      }
    ]
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_116",
    "formatNumber": 67,
    "name": "HBL Draft Jasper 116",
    "paper": "A4",
    "rtl": false,
    "appendCustomerTerms": true,
    "theme": {
      "primary": "#101010",
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
      "formatBadgeLabel": "JASPER",
      "heroTitle": "DRAFT BILL OF LADING",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
      },
      "partyMid": {
        "title": "Consignee",
        "lines": [
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Job No.",
          "v": "CEXP190150"
        },
        {
          "k": "Booking Ref.",
          "v": "B/EXP/19/0254"
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
          "k": "Vessel / Voyage",
          "v": "CMA CGM / 9887"
        },
        {
          "k": "Ocean Vessel",
          "v": "CMA CGM"
        },
        {
          "k": "Voyage Number",
          "v": "9887"
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
          "k": "Pre-carriage by",
          "v": ""
        },
        {
          "k": "Layout",
          "v": "HBL Draft Jasper 116"
        },
        {
          "k": "Catalogue",
          "v": "jasper #67"
        }
      ],
      "hblCargoHeaders": [
        "Container Nos, Seal Nos, Mark and Nos",
        "Number and kind of packages : description of goods",
        "Gross Weight(Kg)",
        "Volume"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 /\n20' DC X 1\nNIL MARKS",
          "STC: VALVE MATERIALS FOR MACHINERY PARTS\nFREIGHT PREPAID\nALL DESTINATION CHARGES ARE CONSIGNEE'S ACCOUNT",
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
      "containerNote": "Total Number of Containers or Packages (In words): ONE(1X20' DC) CONTAINER ONLY",
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "hblBlTitle": "BILL OF LADING  NOT NEGOTIABLE UNLESS CONSIGNED \"TO ORDER\"",
      "hblOriginals": "1(ONE)",
      "hblRegisteredNo": "MTO/DGS/1182/APR/2019",
      "hblDeliveryAgent": {
        "title": "APPLICATION FOR DELIVERY AT DESTINATION MUST BE MADE TO:",
        "lines": [
          "KingFisher Wings Dubai LLC",
          "DUBAI UNITED ARAB EMIRATES",
          "TEL: +971 55 5355 286",
          "EMAIL: inquiry@kingfishertec.com"
        ]
      },
      "termsLines": [
        "DRAFT — BILL OF LADING NOT NEGOTIABLE UNLESS CONSIGNED \"TO ORDER\"",
        "RECEIVED by the Carrier the Goods as specified above in apparent good order and condition unless otherwise stated.",
        "AS AGENT FOR THE CARRIER"
      ],
      "remarks": "JASPER"
    },
    "blocks": [
      {
        "type": "hblBlShell",
        "embedLogo": true,
        "variant": "jasper"
      },
      {
        "type": "hblFreightSignature",
        "variant": "blClosing"
      },
      {
        "type": "colorfulFooter",
        "variant": "plain"
      }
    ]
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_117",
    "formatNumber": 68,
    "name": "HBL Draft Jasper 117",
    "paper": "A4",
    "rtl": false,
    "appendCustomerTerms": true,
    "theme": {
      "primary": "#101010",
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
      "formatBadgeLabel": "JASPER",
      "heroTitle": "DRAFT BILL OF LADING",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
      },
      "partyMid": {
        "title": "Consignee",
        "lines": [
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Job No.",
          "v": "CEXP190150"
        },
        {
          "k": "Booking Ref.",
          "v": "B/EXP/19/0254"
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
          "k": "Vessel / Voyage",
          "v": "CMA CGM / 9887"
        },
        {
          "k": "Ocean Vessel",
          "v": "CMA CGM"
        },
        {
          "k": "Voyage Number",
          "v": "9887"
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
          "k": "Pre-carriage by",
          "v": ""
        },
        {
          "k": "Layout",
          "v": "HBL Draft Jasper 117"
        },
        {
          "k": "Catalogue",
          "v": "jasper #68"
        }
      ],
      "hblCargoHeaders": [
        "Container Nos, Seal Nos, Mark and Nos",
        "Number and kind of packages : description of goods",
        "Gross Weight(Kg)",
        "Volume"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 /\n20' DC X 1\nNIL MARKS",
          "STC: VALVE MATERIALS FOR MACHINERY PARTS\nFREIGHT PREPAID\nALL DESTINATION CHARGES ARE CONSIGNEE'S ACCOUNT",
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
      "containerNote": "Total Number of Containers or Packages (In words): ONE(1X20' DC) CONTAINER ONLY",
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "hblBlTitle": "BILL OF LADING",
      "hblOriginals": "1(ONE)",
      "hblRegisteredNo": "MTO/DGS/1182/APR/2019",
      "hblDeliveryAgent": {
        "title": "APPLICATION FOR DELIVERY AT DESTINATION MUST BE MADE TO:",
        "lines": [
          "KingFisher Wings Dubai LLC",
          "DUBAI UNITED ARAB EMIRATES",
          "TEL: +971 55 5355 286",
          "EMAIL: inquiry@kingfishertec.com"
        ]
      },
      "termsLines": [
        "DRAFT — BILL OF LADING NOT NEGOTIABLE UNLESS CONSIGNED \"TO ORDER\"",
        "RECEIVED by the Carrier the Goods as specified above in apparent good order and condition unless otherwise stated.",
        "AS AGENT FOR THE CARRIER"
      ],
      "remarks": "JASPER"
    },
    "blocks": [
      {
        "type": "hblBlShell",
        "embedLogo": true,
        "variant": "ocean"
      },
      {
        "type": "hblFreightSignature",
        "variant": "blClosing"
      },
      {
        "type": "colorfulFooter",
        "variant": "plain"
      }
    ]
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_118",
    "formatNumber": 69,
    "name": "HBL Draft Jasper 118",
    "paper": "A4",
    "rtl": false,
    "appendCustomerTerms": true,
    "theme": {
      "primary": "#101010",
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
      "formatBadgeLabel": "JASPER",
      "heroTitle": "DRAFT BILL OF LADING",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
      },
      "partyMid": {
        "title": "Consignee",
        "lines": [
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Job No.",
          "v": "CEXP190150"
        },
        {
          "k": "Booking Ref.",
          "v": "B/EXP/19/0254"
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
          "k": "Vessel / Voyage",
          "v": "CMA CGM / 9887"
        },
        {
          "k": "Ocean Vessel",
          "v": "CMA CGM"
        },
        {
          "k": "Voyage Number",
          "v": "9887"
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
          "k": "Pre-carriage by",
          "v": ""
        },
        {
          "k": "Layout",
          "v": "HBL Draft Jasper 118"
        },
        {
          "k": "Catalogue",
          "v": "jasper #69"
        }
      ],
      "hblCargoHeaders": [
        "Container Nos, Seal Nos, Mark and Nos",
        "Number and kind of packages : description of goods",
        "Gross Weight(Kg)",
        "Volume"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 /\n20' DC X 1\nNIL MARKS",
          "STC: VALVE MATERIALS FOR MACHINERY PARTS\nFREIGHT PREPAID\nALL DESTINATION CHARGES ARE CONSIGNEE'S ACCOUNT",
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
      "containerNote": "Total Number of Containers or Packages (In words): ONE(1X20' DC) CONTAINER ONLY",
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "hblBlTitle": "MULTIMODAL TRANSPORT DOCUMENT",
      "hblOriginals": "1(ONE)",
      "hblRegisteredNo": "MTO/DGS/1182/APR/2019",
      "hblDeliveryAgent": {
        "title": "APPLICATION FOR DELIVERY AT DESTINATION MUST BE MADE TO:",
        "lines": [
          "KingFisher Wings Dubai LLC",
          "DUBAI UNITED ARAB EMIRATES",
          "TEL: +971 55 5355 286",
          "EMAIL: inquiry@kingfishertec.com"
        ]
      },
      "termsLines": [
        "DRAFT — BILL OF LADING NOT NEGOTIABLE UNLESS CONSIGNED \"TO ORDER\"",
        "RECEIVED by the Carrier the Goods as specified above in apparent good order and condition unless otherwise stated.",
        "AS AGENT FOR THE CARRIER"
      ],
      "remarks": "JASPER"
    },
    "blocks": [
      {
        "type": "hblBlShell",
        "embedLogo": true,
        "variant": "mt"
      },
      {
        "type": "hblFreightSignature",
        "variant": "blClosing"
      },
      {
        "type": "colorfulFooter",
        "variant": "plain"
      }
    ]
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_120",
    "formatNumber": 70,
    "name": "HBL Draft Jasper 120",
    "paper": "A4",
    "rtl": false,
    "appendCustomerTerms": true,
    "theme": {
      "primary": "#101010",
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
      "formatBadgeLabel": "JASPER",
      "heroTitle": "DRAFT BILL OF LADING",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
      },
      "partyMid": {
        "title": "Consignee",
        "lines": [
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Job No.",
          "v": "CEXP190150"
        },
        {
          "k": "Booking Ref.",
          "v": "B/EXP/19/0254"
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
          "k": "Vessel / Voyage",
          "v": "CMA CGM / 9887"
        },
        {
          "k": "Ocean Vessel",
          "v": "CMA CGM"
        },
        {
          "k": "Voyage Number",
          "v": "9887"
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
          "k": "Pre-carriage by",
          "v": ""
        },
        {
          "k": "Layout",
          "v": "HBL Draft Jasper 120"
        },
        {
          "k": "Catalogue",
          "v": "jasper #70"
        }
      ],
      "hblCargoHeaders": [
        "Container Nos, Seal Nos, Mark and Nos",
        "Number and kind of packages : description of goods",
        "Gross Weight(Kg)",
        "Volume"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 /\n20' DC X 1\nNIL MARKS",
          "STC: VALVE MATERIALS FOR MACHINERY PARTS\nFREIGHT PREPAID\nALL DESTINATION CHARGES ARE CONSIGNEE'S ACCOUNT",
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
      "containerNote": "Total Number of Containers or Packages (In words): ONE(1X20' DC) CONTAINER ONLY",
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "hblBlTitle": "Bill of Lading FOR COMBINED TRANSPORT OR PORT TO PORT SHIPMENT",
      "hblOriginals": "1(ONE)",
      "hblRegisteredNo": "MTO/DGS/1182/APR/2019",
      "hblDeliveryAgent": {
        "title": "APPLICATION FOR DELIVERY AT DESTINATION MUST BE MADE TO:",
        "lines": [
          "KingFisher Wings Dubai LLC",
          "DUBAI UNITED ARAB EMIRATES",
          "TEL: +971 55 5355 286",
          "EMAIL: inquiry@kingfishertec.com"
        ]
      },
      "termsLines": [
        "DRAFT — BILL OF LADING NOT NEGOTIABLE UNLESS CONSIGNED \"TO ORDER\"",
        "RECEIVED by the Carrier the Goods as specified above in apparent good order and condition unless otherwise stated.",
        "AS AGENT FOR THE CARRIER"
      ],
      "remarks": "JASPER"
    },
    "blocks": [
      {
        "type": "hblBlShell",
        "embedLogo": true,
        "variant": "combined"
      },
      {
        "type": "hblFreightSignature",
        "variant": "blClosing"
      },
      {
        "type": "colorfulFooter",
        "variant": "plain"
      }
    ]
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_122",
    "formatNumber": 71,
    "name": "HBL Draft Jasper 122",
    "paper": "A4",
    "rtl": false,
    "appendCustomerTerms": true,
    "theme": {
      "primary": "#101010",
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
      "formatBadgeLabel": "JASPER",
      "heroTitle": "DRAFT BILL OF LADING",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
      },
      "partyMid": {
        "title": "Consignee",
        "lines": [
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Job No.",
          "v": "CEXP190150"
        },
        {
          "k": "Booking Ref.",
          "v": "B/EXP/19/0254"
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
          "k": "Vessel / Voyage",
          "v": "CMA CGM / 9887"
        },
        {
          "k": "Ocean Vessel",
          "v": "CMA CGM"
        },
        {
          "k": "Voyage Number",
          "v": "9887"
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
          "k": "Pre-carriage by",
          "v": ""
        },
        {
          "k": "Layout",
          "v": "HBL Draft Jasper 122"
        },
        {
          "k": "Catalogue",
          "v": "jasper #71"
        }
      ],
      "hblCargoHeaders": [
        "Container Nos, Seal Nos, Mark and Nos",
        "Number and kind of packages : description of goods",
        "Gross Weight(Kg)",
        "Volume"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 /\n20' DC X 1\nNIL MARKS",
          "STC: VALVE MATERIALS FOR MACHINERY PARTS\nFREIGHT PREPAID\nALL DESTINATION CHARGES ARE CONSIGNEE'S ACCOUNT",
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
      "containerNote": "Total Number of Containers or Packages (In words): ONE(1X20' DC) CONTAINER ONLY",
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "hblBlTitle": "MULTI-MODAL TRANSPORT DOCUMENT",
      "hblOriginals": "1(ONE)",
      "hblRegisteredNo": "MTO/DGS/1182/APR/2019",
      "hblDeliveryAgent": {
        "title": "APPLICATION FOR DELIVERY AT DESTINATION MUST BE MADE TO:",
        "lines": [
          "KingFisher Wings Dubai LLC",
          "DUBAI UNITED ARAB EMIRATES",
          "TEL: +971 55 5355 286",
          "EMAIL: inquiry@kingfishertec.com"
        ]
      },
      "termsLines": [
        "DRAFT — BILL OF LADING NOT NEGOTIABLE UNLESS CONSIGNED \"TO ORDER\"",
        "RECEIVED by the Carrier the Goods as specified above in apparent good order and condition unless otherwise stated.",
        "AS AGENT FOR THE CARRIER"
      ],
      "remarks": "JASPER"
    },
    "blocks": [
      {
        "type": "hblBlShell",
        "embedLogo": true,
        "variant": "multimodal"
      },
      {
        "type": "hblFreightSignature",
        "variant": "blClosing"
      },
      {
        "type": "colorfulFooter",
        "variant": "plain"
      }
    ]
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_127",
    "formatNumber": 72,
    "name": "HBL Draft Jasper 127",
    "paper": "A4",
    "rtl": false,
    "appendCustomerTerms": true,
    "theme": {
      "primary": "#101010",
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
      "formatBadgeLabel": "JASPER",
      "heroTitle": "DRAFT BILL OF LADING",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
      },
      "partyMid": {
        "title": "Consignee",
        "lines": [
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Job No.",
          "v": "CEXP190150"
        },
        {
          "k": "Booking Ref.",
          "v": "B/EXP/19/0254"
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
          "k": "Vessel / Voyage",
          "v": "CMA CGM / 9887"
        },
        {
          "k": "Ocean Vessel",
          "v": "CMA CGM"
        },
        {
          "k": "Voyage Number",
          "v": "9887"
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
          "k": "Pre-carriage by",
          "v": ""
        },
        {
          "k": "Layout",
          "v": "HBL Draft Jasper 127"
        },
        {
          "k": "Catalogue",
          "v": "jasper #72"
        }
      ],
      "hblCargoHeaders": [
        "Container Nos, Seal Nos, Mark and Nos",
        "Number and kind of packages : description of goods",
        "Gross Weight(Kg)",
        "Volume"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 /\n20' DC X 1\nNIL MARKS",
          "STC: VALVE MATERIALS FOR MACHINERY PARTS\nFREIGHT PREPAID\nALL DESTINATION CHARGES ARE CONSIGNEE'S ACCOUNT",
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
      "containerNote": "Total Number of Containers or Packages (In words): ONE(1X20' DC) CONTAINER ONLY",
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "hblBlTitle": "BILL OF LADING  NOT NEGOTIABLE UNLESS CONSIGNED \"TO ORDER\"",
      "hblOriginals": "1(ONE)",
      "hblRegisteredNo": "MTO/DGS/1182/APR/2019",
      "hblDeliveryAgent": {
        "title": "APPLICATION FOR DELIVERY AT DESTINATION MUST BE MADE TO:",
        "lines": [
          "KingFisher Wings Dubai LLC",
          "DUBAI UNITED ARAB EMIRATES",
          "TEL: +971 55 5355 286",
          "EMAIL: inquiry@kingfishertec.com"
        ]
      },
      "termsLines": [
        "DRAFT — BILL OF LADING NOT NEGOTIABLE UNLESS CONSIGNED \"TO ORDER\"",
        "RECEIVED by the Carrier the Goods as specified above in apparent good order and condition unless otherwise stated.",
        "AS AGENT FOR THE CARRIER"
      ],
      "remarks": "JASPER"
    },
    "blocks": [
      {
        "type": "hblBlShell",
        "embedLogo": true,
        "variant": "jasper"
      },
      {
        "type": "hblFreightSignature",
        "variant": "blClosing"
      },
      {
        "type": "colorfulFooter",
        "variant": "plain"
      }
    ]
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_128",
    "formatNumber": 73,
    "name": "HBL Draft Jasper 128",
    "paper": "A4",
    "rtl": false,
    "appendCustomerTerms": true,
    "theme": {
      "primary": "#101010",
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
      "formatBadgeLabel": "JASPER",
      "heroTitle": "DRAFT BILL OF LADING",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
      },
      "partyMid": {
        "title": "Consignee",
        "lines": [
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Job No.",
          "v": "CEXP190150"
        },
        {
          "k": "Booking Ref.",
          "v": "B/EXP/19/0254"
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
          "k": "Vessel / Voyage",
          "v": "CMA CGM / 9887"
        },
        {
          "k": "Ocean Vessel",
          "v": "CMA CGM"
        },
        {
          "k": "Voyage Number",
          "v": "9887"
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
          "k": "Pre-carriage by",
          "v": ""
        },
        {
          "k": "Layout",
          "v": "HBL Draft Jasper 128"
        },
        {
          "k": "Catalogue",
          "v": "jasper #73"
        }
      ],
      "hblCargoHeaders": [
        "Container Nos, Seal Nos, Mark and Nos",
        "Number and kind of packages : description of goods",
        "Gross Weight(Kg)",
        "Volume"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 /\n20' DC X 1\nNIL MARKS",
          "STC: VALVE MATERIALS FOR MACHINERY PARTS\nFREIGHT PREPAID\nALL DESTINATION CHARGES ARE CONSIGNEE'S ACCOUNT",
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
      "containerNote": "Total Number of Containers or Packages (In words): ONE(1X20' DC) CONTAINER ONLY",
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "hblBlTitle": "BILL OF LADING",
      "hblOriginals": "1(ONE)",
      "hblRegisteredNo": "MTO/DGS/1182/APR/2019",
      "hblDeliveryAgent": {
        "title": "APPLICATION FOR DELIVERY AT DESTINATION MUST BE MADE TO:",
        "lines": [
          "KingFisher Wings Dubai LLC",
          "DUBAI UNITED ARAB EMIRATES",
          "TEL: +971 55 5355 286",
          "EMAIL: inquiry@kingfishertec.com"
        ]
      },
      "termsLines": [
        "DRAFT — BILL OF LADING NOT NEGOTIABLE UNLESS CONSIGNED \"TO ORDER\"",
        "RECEIVED by the Carrier the Goods as specified above in apparent good order and condition unless otherwise stated.",
        "AS AGENT FOR THE CARRIER"
      ],
      "remarks": "JASPER"
    },
    "blocks": [
      {
        "type": "hblBlShell",
        "embedLogo": true,
        "variant": "ocean"
      },
      {
        "type": "hblFreightSignature",
        "variant": "blClosing"
      },
      {
        "type": "colorfulFooter",
        "variant": "plain"
      }
    ]
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_129",
    "formatNumber": 74,
    "name": "HBL Draft Jasper 129",
    "paper": "A4",
    "rtl": false,
    "appendCustomerTerms": true,
    "theme": {
      "primary": "#101010",
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
      "formatBadgeLabel": "JASPER",
      "heroTitle": "DRAFT BILL OF LADING",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
      },
      "partyMid": {
        "title": "Consignee",
        "lines": [
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Job No.",
          "v": "CEXP190150"
        },
        {
          "k": "Booking Ref.",
          "v": "B/EXP/19/0254"
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
          "k": "Vessel / Voyage",
          "v": "CMA CGM / 9887"
        },
        {
          "k": "Ocean Vessel",
          "v": "CMA CGM"
        },
        {
          "k": "Voyage Number",
          "v": "9887"
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
          "k": "Pre-carriage by",
          "v": ""
        },
        {
          "k": "Layout",
          "v": "HBL Draft Jasper 129"
        },
        {
          "k": "Catalogue",
          "v": "jasper #74"
        }
      ],
      "hblCargoHeaders": [
        "Container Nos, Seal Nos, Mark and Nos",
        "Number and kind of packages : description of goods",
        "Gross Weight(Kg)",
        "Volume"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 /\n20' DC X 1\nNIL MARKS",
          "STC: VALVE MATERIALS FOR MACHINERY PARTS\nFREIGHT PREPAID\nALL DESTINATION CHARGES ARE CONSIGNEE'S ACCOUNT",
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
      "containerNote": "Total Number of Containers or Packages (In words): ONE(1X20' DC) CONTAINER ONLY",
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "hblBlTitle": "MULTIMODAL TRANSPORT DOCUMENT",
      "hblOriginals": "1(ONE)",
      "hblRegisteredNo": "MTO/DGS/1182/APR/2019",
      "hblDeliveryAgent": {
        "title": "APPLICATION FOR DELIVERY AT DESTINATION MUST BE MADE TO:",
        "lines": [
          "KingFisher Wings Dubai LLC",
          "DUBAI UNITED ARAB EMIRATES",
          "TEL: +971 55 5355 286",
          "EMAIL: inquiry@kingfishertec.com"
        ]
      },
      "termsLines": [
        "DRAFT — BILL OF LADING NOT NEGOTIABLE UNLESS CONSIGNED \"TO ORDER\"",
        "RECEIVED by the Carrier the Goods as specified above in apparent good order and condition unless otherwise stated.",
        "AS AGENT FOR THE CARRIER"
      ],
      "remarks": "JASPER"
    },
    "blocks": [
      {
        "type": "hblBlShell",
        "embedLogo": true,
        "variant": "mt"
      },
      {
        "type": "hblFreightSignature",
        "variant": "blClosing"
      },
      {
        "type": "colorfulFooter",
        "variant": "plain"
      }
    ]
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_130",
    "formatNumber": 75,
    "name": "HBL Draft Jasper 130",
    "paper": "A4",
    "rtl": false,
    "appendCustomerTerms": true,
    "theme": {
      "primary": "#101010",
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
      "formatBadgeLabel": "JASPER",
      "heroTitle": "DRAFT BILL OF LADING",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
      },
      "partyMid": {
        "title": "Consignee",
        "lines": [
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Job No.",
          "v": "CEXP190150"
        },
        {
          "k": "Booking Ref.",
          "v": "B/EXP/19/0254"
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
          "k": "Vessel / Voyage",
          "v": "CMA CGM / 9887"
        },
        {
          "k": "Ocean Vessel",
          "v": "CMA CGM"
        },
        {
          "k": "Voyage Number",
          "v": "9887"
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
          "k": "Pre-carriage by",
          "v": ""
        },
        {
          "k": "Layout",
          "v": "HBL Draft Jasper 130"
        },
        {
          "k": "Catalogue",
          "v": "jasper #75"
        }
      ],
      "hblCargoHeaders": [
        "Container Nos, Seal Nos, Mark and Nos",
        "Number and kind of packages : description of goods",
        "Gross Weight(Kg)",
        "Volume"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 /\n20' DC X 1\nNIL MARKS",
          "STC: VALVE MATERIALS FOR MACHINERY PARTS\nFREIGHT PREPAID\nALL DESTINATION CHARGES ARE CONSIGNEE'S ACCOUNT",
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
      "containerNote": "Total Number of Containers or Packages (In words): ONE(1X20' DC) CONTAINER ONLY",
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "hblBlTitle": "Bill of Lading FOR COMBINED TRANSPORT OR PORT TO PORT SHIPMENT",
      "hblOriginals": "1(ONE)",
      "hblRegisteredNo": "MTO/DGS/1182/APR/2019",
      "hblDeliveryAgent": {
        "title": "APPLICATION FOR DELIVERY AT DESTINATION MUST BE MADE TO:",
        "lines": [
          "KingFisher Wings Dubai LLC",
          "DUBAI UNITED ARAB EMIRATES",
          "TEL: +971 55 5355 286",
          "EMAIL: inquiry@kingfishertec.com"
        ]
      },
      "termsLines": [
        "DRAFT — BILL OF LADING NOT NEGOTIABLE UNLESS CONSIGNED \"TO ORDER\"",
        "RECEIVED by the Carrier the Goods as specified above in apparent good order and condition unless otherwise stated.",
        "AS AGENT FOR THE CARRIER"
      ],
      "remarks": "JASPER"
    },
    "blocks": [
      {
        "type": "hblBlShell",
        "embedLogo": true,
        "variant": "combined"
      },
      {
        "type": "hblFreightSignature",
        "variant": "blClosing"
      },
      {
        "type": "colorfulFooter",
        "variant": "plain"
      }
    ]
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_132",
    "formatNumber": 76,
    "name": "HBL Draft Jasper 132",
    "paper": "A4",
    "rtl": false,
    "appendCustomerTerms": true,
    "theme": {
      "primary": "#101010",
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
      "formatBadgeLabel": "JASPER",
      "heroTitle": "DRAFT BILL OF LADING",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
      },
      "partyMid": {
        "title": "Consignee",
        "lines": [
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Job No.",
          "v": "CEXP190150"
        },
        {
          "k": "Booking Ref.",
          "v": "B/EXP/19/0254"
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
          "k": "Vessel / Voyage",
          "v": "CMA CGM / 9887"
        },
        {
          "k": "Ocean Vessel",
          "v": "CMA CGM"
        },
        {
          "k": "Voyage Number",
          "v": "9887"
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
          "k": "Pre-carriage by",
          "v": ""
        },
        {
          "k": "Layout",
          "v": "HBL Draft Jasper 132"
        },
        {
          "k": "Catalogue",
          "v": "jasper #76"
        }
      ],
      "hblCargoHeaders": [
        "Container Nos, Seal Nos, Mark and Nos",
        "Number and kind of packages : description of goods",
        "Gross Weight(Kg)",
        "Volume"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 /\n20' DC X 1\nNIL MARKS",
          "STC: VALVE MATERIALS FOR MACHINERY PARTS\nFREIGHT PREPAID\nALL DESTINATION CHARGES ARE CONSIGNEE'S ACCOUNT",
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
      "containerNote": "Total Number of Containers or Packages (In words): ONE(1X20' DC) CONTAINER ONLY",
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "hblBlTitle": "MULTI-MODAL TRANSPORT DOCUMENT",
      "hblOriginals": "1(ONE)",
      "hblRegisteredNo": "MTO/DGS/1182/APR/2019",
      "hblDeliveryAgent": {
        "title": "APPLICATION FOR DELIVERY AT DESTINATION MUST BE MADE TO:",
        "lines": [
          "KingFisher Wings Dubai LLC",
          "DUBAI UNITED ARAB EMIRATES",
          "TEL: +971 55 5355 286",
          "EMAIL: inquiry@kingfishertec.com"
        ]
      },
      "termsLines": [
        "DRAFT — BILL OF LADING NOT NEGOTIABLE UNLESS CONSIGNED \"TO ORDER\"",
        "RECEIVED by the Carrier the Goods as specified above in apparent good order and condition unless otherwise stated.",
        "AS AGENT FOR THE CARRIER"
      ],
      "remarks": "JASPER"
    },
    "blocks": [
      {
        "type": "hblBlShell",
        "embedLogo": true,
        "variant": "multimodal"
      },
      {
        "type": "hblFreightSignature",
        "variant": "blClosing"
      },
      {
        "type": "colorfulFooter",
        "variant": "plain"
      }
    ]
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_134",
    "formatNumber": 77,
    "name": "HBL Draft Jasper 134",
    "paper": "A4",
    "rtl": false,
    "appendCustomerTerms": true,
    "theme": {
      "primary": "#101010",
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
      "formatBadgeLabel": "JASPER",
      "heroTitle": "DRAFT BILL OF LADING",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
      },
      "partyMid": {
        "title": "Consignee",
        "lines": [
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Job No.",
          "v": "CEXP190150"
        },
        {
          "k": "Booking Ref.",
          "v": "B/EXP/19/0254"
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
          "k": "Vessel / Voyage",
          "v": "CMA CGM / 9887"
        },
        {
          "k": "Ocean Vessel",
          "v": "CMA CGM"
        },
        {
          "k": "Voyage Number",
          "v": "9887"
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
          "k": "Pre-carriage by",
          "v": ""
        },
        {
          "k": "Layout",
          "v": "HBL Draft Jasper 134"
        },
        {
          "k": "Catalogue",
          "v": "jasper #77"
        }
      ],
      "hblCargoHeaders": [
        "Container Nos, Seal Nos, Mark and Nos",
        "Number and kind of packages : description of goods",
        "Gross Weight(Kg)",
        "Volume"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 /\n20' DC X 1\nNIL MARKS",
          "STC: VALVE MATERIALS FOR MACHINERY PARTS\nFREIGHT PREPAID\nALL DESTINATION CHARGES ARE CONSIGNEE'S ACCOUNT",
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
      "containerNote": "Total Number of Containers or Packages (In words): ONE(1X20' DC) CONTAINER ONLY",
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "hblBlTitle": "BILL OF LADING  NOT NEGOTIABLE UNLESS CONSIGNED \"TO ORDER\"",
      "hblOriginals": "1(ONE)",
      "hblRegisteredNo": "MTO/DGS/1182/APR/2019",
      "hblDeliveryAgent": {
        "title": "APPLICATION FOR DELIVERY AT DESTINATION MUST BE MADE TO:",
        "lines": [
          "KingFisher Wings Dubai LLC",
          "DUBAI UNITED ARAB EMIRATES",
          "TEL: +971 55 5355 286",
          "EMAIL: inquiry@kingfishertec.com"
        ]
      },
      "termsLines": [
        "DRAFT — BILL OF LADING NOT NEGOTIABLE UNLESS CONSIGNED \"TO ORDER\"",
        "RECEIVED by the Carrier the Goods as specified above in apparent good order and condition unless otherwise stated.",
        "AS AGENT FOR THE CARRIER"
      ],
      "remarks": "JASPER"
    },
    "blocks": [
      {
        "type": "hblBlShell",
        "embedLogo": true,
        "variant": "jasper"
      },
      {
        "type": "hblFreightSignature",
        "variant": "blClosing"
      },
      {
        "type": "colorfulFooter",
        "variant": "plain"
      }
    ]
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_135",
    "formatNumber": 78,
    "name": "HBL Draft Jasper 135",
    "paper": "A4",
    "rtl": false,
    "appendCustomerTerms": true,
    "theme": {
      "primary": "#101010",
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
      "formatBadgeLabel": "JASPER",
      "heroTitle": "DRAFT BILL OF LADING",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
      },
      "partyMid": {
        "title": "Consignee",
        "lines": [
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Job No.",
          "v": "CEXP190150"
        },
        {
          "k": "Booking Ref.",
          "v": "B/EXP/19/0254"
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
          "k": "Vessel / Voyage",
          "v": "CMA CGM / 9887"
        },
        {
          "k": "Ocean Vessel",
          "v": "CMA CGM"
        },
        {
          "k": "Voyage Number",
          "v": "9887"
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
          "k": "Pre-carriage by",
          "v": ""
        },
        {
          "k": "Layout",
          "v": "HBL Draft Jasper 135"
        },
        {
          "k": "Catalogue",
          "v": "jasper #78"
        }
      ],
      "hblCargoHeaders": [
        "Container Nos, Seal Nos, Mark and Nos",
        "Number and kind of packages : description of goods",
        "Gross Weight(Kg)",
        "Volume"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 /\n20' DC X 1\nNIL MARKS",
          "STC: VALVE MATERIALS FOR MACHINERY PARTS\nFREIGHT PREPAID\nALL DESTINATION CHARGES ARE CONSIGNEE'S ACCOUNT",
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
      "containerNote": "Total Number of Containers or Packages (In words): ONE(1X20' DC) CONTAINER ONLY",
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "hblBlTitle": "BILL OF LADING",
      "hblOriginals": "1(ONE)",
      "hblRegisteredNo": "MTO/DGS/1182/APR/2019",
      "hblDeliveryAgent": {
        "title": "APPLICATION FOR DELIVERY AT DESTINATION MUST BE MADE TO:",
        "lines": [
          "KingFisher Wings Dubai LLC",
          "DUBAI UNITED ARAB EMIRATES",
          "TEL: +971 55 5355 286",
          "EMAIL: inquiry@kingfishertec.com"
        ]
      },
      "termsLines": [
        "DRAFT — BILL OF LADING NOT NEGOTIABLE UNLESS CONSIGNED \"TO ORDER\"",
        "RECEIVED by the Carrier the Goods as specified above in apparent good order and condition unless otherwise stated.",
        "AS AGENT FOR THE CARRIER"
      ],
      "remarks": "JASPER"
    },
    "blocks": [
      {
        "type": "hblBlShell",
        "embedLogo": true,
        "variant": "ocean"
      },
      {
        "type": "hblFreightSignature",
        "variant": "blClosing"
      },
      {
        "type": "colorfulFooter",
        "variant": "plain"
      }
    ]
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_136",
    "formatNumber": 79,
    "name": "HBL Draft Jasper 136",
    "paper": "A4",
    "rtl": false,
    "appendCustomerTerms": true,
    "theme": {
      "primary": "#101010",
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
      "formatBadgeLabel": "JASPER",
      "heroTitle": "DRAFT BILL OF LADING",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
      },
      "partyMid": {
        "title": "Consignee",
        "lines": [
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Job No.",
          "v": "CEXP190150"
        },
        {
          "k": "Booking Ref.",
          "v": "B/EXP/19/0254"
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
          "k": "Vessel / Voyage",
          "v": "CMA CGM / 9887"
        },
        {
          "k": "Ocean Vessel",
          "v": "CMA CGM"
        },
        {
          "k": "Voyage Number",
          "v": "9887"
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
          "k": "Pre-carriage by",
          "v": ""
        },
        {
          "k": "Layout",
          "v": "HBL Draft Jasper 136"
        },
        {
          "k": "Catalogue",
          "v": "jasper #79"
        }
      ],
      "hblCargoHeaders": [
        "Container Nos, Seal Nos, Mark and Nos",
        "Number and kind of packages : description of goods",
        "Gross Weight(Kg)",
        "Volume"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 /\n20' DC X 1\nNIL MARKS",
          "STC: VALVE MATERIALS FOR MACHINERY PARTS\nFREIGHT PREPAID\nALL DESTINATION CHARGES ARE CONSIGNEE'S ACCOUNT",
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
      "containerNote": "Total Number of Containers or Packages (In words): ONE(1X20' DC) CONTAINER ONLY",
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "hblBlTitle": "MULTIMODAL TRANSPORT DOCUMENT",
      "hblOriginals": "1(ONE)",
      "hblRegisteredNo": "MTO/DGS/1182/APR/2019",
      "hblDeliveryAgent": {
        "title": "APPLICATION FOR DELIVERY AT DESTINATION MUST BE MADE TO:",
        "lines": [
          "KingFisher Wings Dubai LLC",
          "DUBAI UNITED ARAB EMIRATES",
          "TEL: +971 55 5355 286",
          "EMAIL: inquiry@kingfishertec.com"
        ]
      },
      "termsLines": [
        "DRAFT — BILL OF LADING NOT NEGOTIABLE UNLESS CONSIGNED \"TO ORDER\"",
        "RECEIVED by the Carrier the Goods as specified above in apparent good order and condition unless otherwise stated.",
        "AS AGENT FOR THE CARRIER"
      ],
      "remarks": "JASPER"
    },
    "blocks": [
      {
        "type": "hblBlShell",
        "embedLogo": true,
        "variant": "mt"
      },
      {
        "type": "hblFreightSignature",
        "variant": "blClosing"
      },
      {
        "type": "colorfulFooter",
        "variant": "plain"
      }
    ]
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_137",
    "formatNumber": 80,
    "name": "HBL Draft Jasper 137",
    "paper": "A4",
    "rtl": false,
    "appendCustomerTerms": true,
    "theme": {
      "primary": "#101010",
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
      "formatBadgeLabel": "JASPER",
      "heroTitle": "DRAFT BILL OF LADING",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
      },
      "partyMid": {
        "title": "Consignee",
        "lines": [
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Job No.",
          "v": "CEXP190150"
        },
        {
          "k": "Booking Ref.",
          "v": "B/EXP/19/0254"
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
          "k": "Vessel / Voyage",
          "v": "CMA CGM / 9887"
        },
        {
          "k": "Ocean Vessel",
          "v": "CMA CGM"
        },
        {
          "k": "Voyage Number",
          "v": "9887"
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
          "k": "Pre-carriage by",
          "v": ""
        },
        {
          "k": "Layout",
          "v": "HBL Draft Jasper 137"
        },
        {
          "k": "Catalogue",
          "v": "jasper #80"
        }
      ],
      "hblCargoHeaders": [
        "Container Nos, Seal Nos, Mark and Nos",
        "Number and kind of packages : description of goods",
        "Gross Weight(Kg)",
        "Volume"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 /\n20' DC X 1\nNIL MARKS",
          "STC: VALVE MATERIALS FOR MACHINERY PARTS\nFREIGHT PREPAID\nALL DESTINATION CHARGES ARE CONSIGNEE'S ACCOUNT",
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
      "containerNote": "Total Number of Containers or Packages (In words): ONE(1X20' DC) CONTAINER ONLY",
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "hblBlTitle": "Bill of Lading FOR COMBINED TRANSPORT OR PORT TO PORT SHIPMENT",
      "hblOriginals": "1(ONE)",
      "hblRegisteredNo": "MTO/DGS/1182/APR/2019",
      "hblDeliveryAgent": {
        "title": "APPLICATION FOR DELIVERY AT DESTINATION MUST BE MADE TO:",
        "lines": [
          "KingFisher Wings Dubai LLC",
          "DUBAI UNITED ARAB EMIRATES",
          "TEL: +971 55 5355 286",
          "EMAIL: inquiry@kingfishertec.com"
        ]
      },
      "termsLines": [
        "DRAFT — BILL OF LADING NOT NEGOTIABLE UNLESS CONSIGNED \"TO ORDER\"",
        "RECEIVED by the Carrier the Goods as specified above in apparent good order and condition unless otherwise stated.",
        "AS AGENT FOR THE CARRIER"
      ],
      "remarks": "JASPER"
    },
    "blocks": [
      {
        "type": "hblBlShell",
        "embedLogo": true,
        "variant": "combined"
      },
      {
        "type": "hblFreightSignature",
        "variant": "blClosing"
      },
      {
        "type": "colorfulFooter",
        "variant": "plain"
      }
    ]
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_138",
    "formatNumber": 81,
    "name": "HBL Draft Jasper 138",
    "paper": "A4",
    "rtl": false,
    "appendCustomerTerms": true,
    "theme": {
      "primary": "#101010",
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
      "formatBadgeLabel": "JASPER",
      "heroTitle": "DRAFT BILL OF LADING",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
      },
      "partyMid": {
        "title": "Consignee",
        "lines": [
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Job No.",
          "v": "CEXP190150"
        },
        {
          "k": "Booking Ref.",
          "v": "B/EXP/19/0254"
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
          "k": "Vessel / Voyage",
          "v": "CMA CGM / 9887"
        },
        {
          "k": "Ocean Vessel",
          "v": "CMA CGM"
        },
        {
          "k": "Voyage Number",
          "v": "9887"
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
          "k": "Pre-carriage by",
          "v": ""
        },
        {
          "k": "Layout",
          "v": "HBL Draft Jasper 138"
        },
        {
          "k": "Catalogue",
          "v": "jasper #81"
        }
      ],
      "hblCargoHeaders": [
        "Container Nos, Seal Nos, Mark and Nos",
        "Number and kind of packages : description of goods",
        "Gross Weight(Kg)",
        "Volume"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 /\n20' DC X 1\nNIL MARKS",
          "STC: VALVE MATERIALS FOR MACHINERY PARTS\nFREIGHT PREPAID\nALL DESTINATION CHARGES ARE CONSIGNEE'S ACCOUNT",
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
      "containerNote": "Total Number of Containers or Packages (In words): ONE(1X20' DC) CONTAINER ONLY",
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "hblBlTitle": "MULTI-MODAL TRANSPORT DOCUMENT",
      "hblOriginals": "1(ONE)",
      "hblRegisteredNo": "MTO/DGS/1182/APR/2019",
      "hblDeliveryAgent": {
        "title": "APPLICATION FOR DELIVERY AT DESTINATION MUST BE MADE TO:",
        "lines": [
          "KingFisher Wings Dubai LLC",
          "DUBAI UNITED ARAB EMIRATES",
          "TEL: +971 55 5355 286",
          "EMAIL: inquiry@kingfishertec.com"
        ]
      },
      "termsLines": [
        "DRAFT — BILL OF LADING NOT NEGOTIABLE UNLESS CONSIGNED \"TO ORDER\"",
        "RECEIVED by the Carrier the Goods as specified above in apparent good order and condition unless otherwise stated.",
        "AS AGENT FOR THE CARRIER"
      ],
      "remarks": "JASPER"
    },
    "blocks": [
      {
        "type": "hblBlShell",
        "embedLogo": true,
        "variant": "multimodal"
      },
      {
        "type": "hblFreightSignature",
        "variant": "blClosing"
      },
      {
        "type": "colorfulFooter",
        "variant": "plain"
      }
    ]
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_139",
    "formatNumber": 82,
    "name": "HBL Draft Jasper 139",
    "paper": "A4",
    "rtl": false,
    "appendCustomerTerms": true,
    "theme": {
      "primary": "#101010",
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
      "formatBadgeLabel": "JASPER",
      "heroTitle": "DRAFT BILL OF LADING",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
      },
      "partyMid": {
        "title": "Consignee",
        "lines": [
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Job No.",
          "v": "CEXP190150"
        },
        {
          "k": "Booking Ref.",
          "v": "B/EXP/19/0254"
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
          "k": "Vessel / Voyage",
          "v": "CMA CGM / 9887"
        },
        {
          "k": "Ocean Vessel",
          "v": "CMA CGM"
        },
        {
          "k": "Voyage Number",
          "v": "9887"
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
          "k": "Pre-carriage by",
          "v": ""
        },
        {
          "k": "Layout",
          "v": "HBL Draft Jasper 139"
        },
        {
          "k": "Catalogue",
          "v": "jasper #82"
        }
      ],
      "hblCargoHeaders": [
        "Container Nos, Seal Nos, Mark and Nos",
        "Number and kind of packages : description of goods",
        "Gross Weight(Kg)",
        "Volume"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 /\n20' DC X 1\nNIL MARKS",
          "STC: VALVE MATERIALS FOR MACHINERY PARTS\nFREIGHT PREPAID\nALL DESTINATION CHARGES ARE CONSIGNEE'S ACCOUNT",
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
      "containerNote": "Total Number of Containers or Packages (In words): ONE(1X20' DC) CONTAINER ONLY",
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "hblBlTitle": "BILL OF LADING  NOT NEGOTIABLE UNLESS CONSIGNED \"TO ORDER\"",
      "hblOriginals": "1(ONE)",
      "hblRegisteredNo": "MTO/DGS/1182/APR/2019",
      "hblDeliveryAgent": {
        "title": "APPLICATION FOR DELIVERY AT DESTINATION MUST BE MADE TO:",
        "lines": [
          "KingFisher Wings Dubai LLC",
          "DUBAI UNITED ARAB EMIRATES",
          "TEL: +971 55 5355 286",
          "EMAIL: inquiry@kingfishertec.com"
        ]
      },
      "termsLines": [
        "DRAFT — BILL OF LADING NOT NEGOTIABLE UNLESS CONSIGNED \"TO ORDER\"",
        "RECEIVED by the Carrier the Goods as specified above in apparent good order and condition unless otherwise stated.",
        "AS AGENT FOR THE CARRIER"
      ],
      "remarks": "JASPER"
    },
    "blocks": [
      {
        "type": "hblBlShell",
        "embedLogo": true,
        "variant": "jasper"
      },
      {
        "type": "hblFreightSignature",
        "variant": "blClosing"
      },
      {
        "type": "colorfulFooter",
        "variant": "plain"
      }
    ]
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_140",
    "formatNumber": 83,
    "name": "HBL Draft Jasper 140",
    "paper": "A4",
    "rtl": false,
    "appendCustomerTerms": true,
    "theme": {
      "primary": "#101010",
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
      "formatBadgeLabel": "JASPER",
      "heroTitle": "DRAFT BILL OF LADING",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
      },
      "partyMid": {
        "title": "Consignee",
        "lines": [
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Job No.",
          "v": "CEXP190150"
        },
        {
          "k": "Booking Ref.",
          "v": "B/EXP/19/0254"
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
          "k": "Vessel / Voyage",
          "v": "CMA CGM / 9887"
        },
        {
          "k": "Ocean Vessel",
          "v": "CMA CGM"
        },
        {
          "k": "Voyage Number",
          "v": "9887"
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
          "k": "Pre-carriage by",
          "v": ""
        },
        {
          "k": "Layout",
          "v": "HBL Draft Jasper 140"
        },
        {
          "k": "Catalogue",
          "v": "jasper #83"
        }
      ],
      "hblCargoHeaders": [
        "Container Nos, Seal Nos, Mark and Nos",
        "Number and kind of packages : description of goods",
        "Gross Weight(Kg)",
        "Volume"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 /\n20' DC X 1\nNIL MARKS",
          "STC: VALVE MATERIALS FOR MACHINERY PARTS\nFREIGHT PREPAID\nALL DESTINATION CHARGES ARE CONSIGNEE'S ACCOUNT",
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
      "containerNote": "Total Number of Containers or Packages (In words): ONE(1X20' DC) CONTAINER ONLY",
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "hblBlTitle": "BILL OF LADING  NOT NEGOTIABLE UNLESS CONSIGNED \"TO ORDER\"",
      "hblOriginals": "1(ONE)",
      "hblRegisteredNo": "MTO/DGS/1182/APR/2019",
      "hblDeliveryAgent": {
        "title": "APPLICATION FOR DELIVERY AT DESTINATION MUST BE MADE TO:",
        "lines": [
          "KingFisher Wings Dubai LLC",
          "DUBAI UNITED ARAB EMIRATES",
          "TEL: +971 55 5355 286",
          "EMAIL: inquiry@kingfishertec.com"
        ]
      },
      "termsLines": [
        "DRAFT — BILL OF LADING NOT NEGOTIABLE UNLESS CONSIGNED \"TO ORDER\"",
        "RECEIVED by the Carrier the Goods as specified above in apparent good order and condition unless otherwise stated.",
        "AS AGENT FOR THE CARRIER"
      ],
      "remarks": "JASPER"
    },
    "blocks": [
      {
        "type": "hblBlShell",
        "embedLogo": true,
        "variant": "jasper"
      },
      {
        "type": "hblFreightSignature",
        "variant": "blClosing"
      },
      {
        "type": "colorfulFooter",
        "variant": "plain"
      }
    ]
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_141",
    "formatNumber": 84,
    "name": "HBL Draft Jasper 141",
    "paper": "A4",
    "rtl": false,
    "appendCustomerTerms": true,
    "theme": {
      "primary": "#101010",
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
      "formatBadgeLabel": "JASPER",
      "heroTitle": "DRAFT BILL OF LADING",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
      },
      "partyMid": {
        "title": "Consignee",
        "lines": [
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Job No.",
          "v": "CEXP190150"
        },
        {
          "k": "Booking Ref.",
          "v": "B/EXP/19/0254"
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
          "k": "Vessel / Voyage",
          "v": "CMA CGM / 9887"
        },
        {
          "k": "Ocean Vessel",
          "v": "CMA CGM"
        },
        {
          "k": "Voyage Number",
          "v": "9887"
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
          "k": "Pre-carriage by",
          "v": ""
        },
        {
          "k": "Layout",
          "v": "HBL Draft Jasper 141"
        },
        {
          "k": "Catalogue",
          "v": "jasper #84"
        }
      ],
      "hblCargoHeaders": [
        "Container Nos, Seal Nos, Mark and Nos",
        "Number and kind of packages : description of goods",
        "Gross Weight(Kg)",
        "Volume"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 /\n20' DC X 1\nNIL MARKS",
          "STC: VALVE MATERIALS FOR MACHINERY PARTS\nFREIGHT PREPAID\nALL DESTINATION CHARGES ARE CONSIGNEE'S ACCOUNT",
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
      "containerNote": "Total Number of Containers or Packages (In words): ONE(1X20' DC) CONTAINER ONLY",
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "hblBlTitle": "MULTIMODAL TRANSPORT DOCUMENT",
      "hblOriginals": "1(ONE)",
      "hblRegisteredNo": "MTO/DGS/1182/APR/2019",
      "hblDeliveryAgent": {
        "title": "APPLICATION FOR DELIVERY AT DESTINATION MUST BE MADE TO:",
        "lines": [
          "KingFisher Wings Dubai LLC",
          "DUBAI UNITED ARAB EMIRATES",
          "TEL: +971 55 5355 286",
          "EMAIL: inquiry@kingfishertec.com"
        ]
      },
      "termsLines": [
        "DRAFT — BILL OF LADING NOT NEGOTIABLE UNLESS CONSIGNED \"TO ORDER\"",
        "RECEIVED by the Carrier the Goods as specified above in apparent good order and condition unless otherwise stated.",
        "AS AGENT FOR THE CARRIER"
      ],
      "remarks": "JASPER"
    },
    "blocks": [
      {
        "type": "hblBlShell",
        "embedLogo": true,
        "variant": "mt"
      },
      {
        "type": "hblFreightSignature",
        "variant": "blClosing"
      },
      {
        "type": "colorfulFooter",
        "variant": "plain"
      }
    ]
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_142",
    "formatNumber": 85,
    "name": "HBL Draft Jasper 142",
    "paper": "A4",
    "rtl": false,
    "appendCustomerTerms": true,
    "theme": {
      "primary": "#101010",
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
      "formatBadgeLabel": "JASPER",
      "heroTitle": "DRAFT BILL OF LADING",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
      },
      "partyMid": {
        "title": "Consignee",
        "lines": [
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Job No.",
          "v": "CEXP190150"
        },
        {
          "k": "Booking Ref.",
          "v": "B/EXP/19/0254"
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
          "k": "Vessel / Voyage",
          "v": "CMA CGM / 9887"
        },
        {
          "k": "Ocean Vessel",
          "v": "CMA CGM"
        },
        {
          "k": "Voyage Number",
          "v": "9887"
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
          "k": "Pre-carriage by",
          "v": ""
        },
        {
          "k": "Layout",
          "v": "HBL Draft Jasper 142"
        },
        {
          "k": "Catalogue",
          "v": "jasper #85"
        }
      ],
      "hblCargoHeaders": [
        "Container Nos, Seal Nos, Mark and Nos",
        "Number and kind of packages : description of goods",
        "Gross Weight(Kg)",
        "Volume"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 /\n20' DC X 1\nNIL MARKS",
          "STC: VALVE MATERIALS FOR MACHINERY PARTS\nFREIGHT PREPAID\nALL DESTINATION CHARGES ARE CONSIGNEE'S ACCOUNT",
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
      "containerNote": "Total Number of Containers or Packages (In words): ONE(1X20' DC) CONTAINER ONLY",
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "hblBlTitle": "Bill of Lading FOR COMBINED TRANSPORT OR PORT TO PORT SHIPMENT",
      "hblOriginals": "1(ONE)",
      "hblRegisteredNo": "MTO/DGS/1182/APR/2019",
      "hblDeliveryAgent": {
        "title": "APPLICATION FOR DELIVERY AT DESTINATION MUST BE MADE TO:",
        "lines": [
          "KingFisher Wings Dubai LLC",
          "DUBAI UNITED ARAB EMIRATES",
          "TEL: +971 55 5355 286",
          "EMAIL: inquiry@kingfishertec.com"
        ]
      },
      "termsLines": [
        "DRAFT — BILL OF LADING NOT NEGOTIABLE UNLESS CONSIGNED \"TO ORDER\"",
        "RECEIVED by the Carrier the Goods as specified above in apparent good order and condition unless otherwise stated.",
        "AS AGENT FOR THE CARRIER"
      ],
      "remarks": "JASPER"
    },
    "blocks": [
      {
        "type": "hblBlShell",
        "embedLogo": true,
        "variant": "combined"
      },
      {
        "type": "hblFreightSignature",
        "variant": "blClosing"
      },
      {
        "type": "colorfulFooter",
        "variant": "plain"
      }
    ]
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_143",
    "formatNumber": 86,
    "name": "HBL Draft Jasper 143",
    "paper": "A4",
    "rtl": false,
    "appendCustomerTerms": true,
    "theme": {
      "primary": "#101010",
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
      "formatBadgeLabel": "JASPER",
      "heroTitle": "DRAFT BILL OF LADING",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
      },
      "partyMid": {
        "title": "Consignee",
        "lines": [
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Job No.",
          "v": "CEXP190150"
        },
        {
          "k": "Booking Ref.",
          "v": "B/EXP/19/0254"
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
          "k": "Vessel / Voyage",
          "v": "CMA CGM / 9887"
        },
        {
          "k": "Ocean Vessel",
          "v": "CMA CGM"
        },
        {
          "k": "Voyage Number",
          "v": "9887"
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
          "k": "Pre-carriage by",
          "v": ""
        },
        {
          "k": "Layout",
          "v": "HBL Draft Jasper 143"
        },
        {
          "k": "Catalogue",
          "v": "jasper #86"
        }
      ],
      "hblCargoHeaders": [
        "Container Nos, Seal Nos, Mark and Nos",
        "Number and kind of packages : description of goods",
        "Gross Weight(Kg)",
        "Volume"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 /\n20' DC X 1\nNIL MARKS",
          "STC: VALVE MATERIALS FOR MACHINERY PARTS\nFREIGHT PREPAID\nALL DESTINATION CHARGES ARE CONSIGNEE'S ACCOUNT",
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
      "containerNote": "Total Number of Containers or Packages (In words): ONE(1X20' DC) CONTAINER ONLY",
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "hblBlTitle": "MULTI-MODAL TRANSPORT DOCUMENT",
      "hblOriginals": "1(ONE)",
      "hblRegisteredNo": "MTO/DGS/1182/APR/2019",
      "hblDeliveryAgent": {
        "title": "APPLICATION FOR DELIVERY AT DESTINATION MUST BE MADE TO:",
        "lines": [
          "KingFisher Wings Dubai LLC",
          "DUBAI UNITED ARAB EMIRATES",
          "TEL: +971 55 5355 286",
          "EMAIL: inquiry@kingfishertec.com"
        ]
      },
      "termsLines": [
        "DRAFT — BILL OF LADING NOT NEGOTIABLE UNLESS CONSIGNED \"TO ORDER\"",
        "RECEIVED by the Carrier the Goods as specified above in apparent good order and condition unless otherwise stated.",
        "AS AGENT FOR THE CARRIER"
      ],
      "remarks": "JASPER"
    },
    "blocks": [
      {
        "type": "hblBlShell",
        "embedLogo": true,
        "variant": "multimodal"
      },
      {
        "type": "hblFreightSignature",
        "variant": "blClosing"
      },
      {
        "type": "colorfulFooter",
        "variant": "plain"
      }
    ]
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_144",
    "formatNumber": 87,
    "name": "HBL Draft Jasper 144",
    "paper": "A4",
    "rtl": false,
    "appendCustomerTerms": true,
    "theme": {
      "primary": "#101010",
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
      "formatBadgeLabel": "JASPER",
      "heroTitle": "DRAFT BILL OF LADING",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
      },
      "partyMid": {
        "title": "Consignee",
        "lines": [
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Job No.",
          "v": "CEXP190150"
        },
        {
          "k": "Booking Ref.",
          "v": "B/EXP/19/0254"
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
          "k": "Vessel / Voyage",
          "v": "CMA CGM / 9887"
        },
        {
          "k": "Ocean Vessel",
          "v": "CMA CGM"
        },
        {
          "k": "Voyage Number",
          "v": "9887"
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
          "k": "Pre-carriage by",
          "v": ""
        },
        {
          "k": "Layout",
          "v": "HBL Draft Jasper 144"
        },
        {
          "k": "Catalogue",
          "v": "jasper #87"
        }
      ],
      "hblCargoHeaders": [
        "Container Nos, Seal Nos, Mark and Nos",
        "Number and kind of packages : description of goods",
        "Gross Weight(Kg)",
        "Volume"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 /\n20' DC X 1\nNIL MARKS",
          "STC: VALVE MATERIALS FOR MACHINERY PARTS\nFREIGHT PREPAID\nALL DESTINATION CHARGES ARE CONSIGNEE'S ACCOUNT",
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
      "containerNote": "Total Number of Containers or Packages (In words): ONE(1X20' DC) CONTAINER ONLY",
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "hblBlTitle": "BILL OF LADING  NOT NEGOTIABLE UNLESS CONSIGNED \"TO ORDER\"",
      "hblOriginals": "1(ONE)",
      "hblRegisteredNo": "MTO/DGS/1182/APR/2019",
      "hblDeliveryAgent": {
        "title": "APPLICATION FOR DELIVERY AT DESTINATION MUST BE MADE TO:",
        "lines": [
          "KingFisher Wings Dubai LLC",
          "DUBAI UNITED ARAB EMIRATES",
          "TEL: +971 55 5355 286",
          "EMAIL: inquiry@kingfishertec.com"
        ]
      },
      "termsLines": [
        "DRAFT — BILL OF LADING NOT NEGOTIABLE UNLESS CONSIGNED \"TO ORDER\"",
        "RECEIVED by the Carrier the Goods as specified above in apparent good order and condition unless otherwise stated.",
        "AS AGENT FOR THE CARRIER"
      ],
      "remarks": "JASPER"
    },
    "blocks": [
      {
        "type": "hblBlShell",
        "embedLogo": true,
        "variant": "jasper"
      },
      {
        "type": "hblFreightSignature",
        "variant": "blClosing"
      },
      {
        "type": "colorfulFooter",
        "variant": "plain"
      }
    ]
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_145",
    "formatNumber": 88,
    "name": "HBL Draft Jasper 145",
    "paper": "A4",
    "rtl": false,
    "appendCustomerTerms": true,
    "theme": {
      "primary": "#101010",
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
      "formatBadgeLabel": "JASPER",
      "heroTitle": "DRAFT BILL OF LADING",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
      },
      "partyMid": {
        "title": "Consignee",
        "lines": [
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Job No.",
          "v": "CEXP190150"
        },
        {
          "k": "Booking Ref.",
          "v": "B/EXP/19/0254"
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
          "k": "Vessel / Voyage",
          "v": "CMA CGM / 9887"
        },
        {
          "k": "Ocean Vessel",
          "v": "CMA CGM"
        },
        {
          "k": "Voyage Number",
          "v": "9887"
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
          "k": "Pre-carriage by",
          "v": ""
        },
        {
          "k": "Layout",
          "v": "HBL Draft Jasper 145"
        },
        {
          "k": "Catalogue",
          "v": "jasper #88"
        }
      ],
      "hblCargoHeaders": [
        "Container Nos, Seal Nos, Mark and Nos",
        "Number and kind of packages : description of goods",
        "Gross Weight(Kg)",
        "Volume"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 /\n20' DC X 1\nNIL MARKS",
          "STC: VALVE MATERIALS FOR MACHINERY PARTS\nFREIGHT PREPAID\nALL DESTINATION CHARGES ARE CONSIGNEE'S ACCOUNT",
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
      "containerNote": "Total Number of Containers or Packages (In words): ONE(1X20' DC) CONTAINER ONLY",
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "hblBlTitle": "BILL OF LADING",
      "hblOriginals": "1(ONE)",
      "hblRegisteredNo": "MTO/DGS/1182/APR/2019",
      "hblDeliveryAgent": {
        "title": "APPLICATION FOR DELIVERY AT DESTINATION MUST BE MADE TO:",
        "lines": [
          "KingFisher Wings Dubai LLC",
          "DUBAI UNITED ARAB EMIRATES",
          "TEL: +971 55 5355 286",
          "EMAIL: inquiry@kingfishertec.com"
        ]
      },
      "termsLines": [
        "DRAFT — BILL OF LADING NOT NEGOTIABLE UNLESS CONSIGNED \"TO ORDER\"",
        "RECEIVED by the Carrier the Goods as specified above in apparent good order and condition unless otherwise stated.",
        "AS AGENT FOR THE CARRIER"
      ],
      "remarks": "JASPER"
    },
    "blocks": [
      {
        "type": "hblBlShell",
        "embedLogo": true,
        "variant": "ocean"
      },
      {
        "type": "hblFreightSignature",
        "variant": "blClosing"
      },
      {
        "type": "colorfulFooter",
        "variant": "plain"
      }
    ]
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_146",
    "formatNumber": 89,
    "name": "HBL Draft Jasper 146",
    "paper": "A4",
    "rtl": false,
    "appendCustomerTerms": true,
    "theme": {
      "primary": "#101010",
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
      "formatBadgeLabel": "JASPER",
      "heroTitle": "DRAFT BILL OF LADING",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
      },
      "partyMid": {
        "title": "Consignee",
        "lines": [
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Job No.",
          "v": "CEXP190150"
        },
        {
          "k": "Booking Ref.",
          "v": "B/EXP/19/0254"
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
          "k": "Vessel / Voyage",
          "v": "CMA CGM / 9887"
        },
        {
          "k": "Ocean Vessel",
          "v": "CMA CGM"
        },
        {
          "k": "Voyage Number",
          "v": "9887"
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
          "k": "Pre-carriage by",
          "v": ""
        },
        {
          "k": "Layout",
          "v": "HBL Draft Jasper 146"
        },
        {
          "k": "Catalogue",
          "v": "jasper #89"
        }
      ],
      "hblCargoHeaders": [
        "Container Nos, Seal Nos, Mark and Nos",
        "Number and kind of packages : description of goods",
        "Gross Weight(Kg)",
        "Volume"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 /\n20' DC X 1\nNIL MARKS",
          "STC: VALVE MATERIALS FOR MACHINERY PARTS\nFREIGHT PREPAID\nALL DESTINATION CHARGES ARE CONSIGNEE'S ACCOUNT",
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
      "containerNote": "Total Number of Containers or Packages (In words): ONE(1X20' DC) CONTAINER ONLY",
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "hblBlTitle": "MULTIMODAL TRANSPORT DOCUMENT",
      "hblOriginals": "1(ONE)",
      "hblRegisteredNo": "MTO/DGS/1182/APR/2019",
      "hblDeliveryAgent": {
        "title": "APPLICATION FOR DELIVERY AT DESTINATION MUST BE MADE TO:",
        "lines": [
          "KingFisher Wings Dubai LLC",
          "DUBAI UNITED ARAB EMIRATES",
          "TEL: +971 55 5355 286",
          "EMAIL: inquiry@kingfishertec.com"
        ]
      },
      "termsLines": [
        "DRAFT — BILL OF LADING NOT NEGOTIABLE UNLESS CONSIGNED \"TO ORDER\"",
        "RECEIVED by the Carrier the Goods as specified above in apparent good order and condition unless otherwise stated.",
        "AS AGENT FOR THE CARRIER"
      ],
      "remarks": "JASPER"
    },
    "blocks": [
      {
        "type": "hblBlShell",
        "embedLogo": true,
        "variant": "mt"
      },
      {
        "type": "hblFreightSignature",
        "variant": "blClosing"
      },
      {
        "type": "colorfulFooter",
        "variant": "plain"
      }
    ]
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_147",
    "formatNumber": 90,
    "name": "HBL Draft Jasper 147",
    "paper": "A4",
    "rtl": false,
    "appendCustomerTerms": true,
    "theme": {
      "primary": "#101010",
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
      "formatBadgeLabel": "JASPER",
      "heroTitle": "DRAFT BILL OF LADING",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
      },
      "partyMid": {
        "title": "Consignee",
        "lines": [
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Job No.",
          "v": "CEXP190150"
        },
        {
          "k": "Booking Ref.",
          "v": "B/EXP/19/0254"
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
          "k": "Vessel / Voyage",
          "v": "CMA CGM / 9887"
        },
        {
          "k": "Ocean Vessel",
          "v": "CMA CGM"
        },
        {
          "k": "Voyage Number",
          "v": "9887"
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
          "k": "Pre-carriage by",
          "v": ""
        },
        {
          "k": "Layout",
          "v": "HBL Draft Jasper 147"
        },
        {
          "k": "Catalogue",
          "v": "jasper #90"
        }
      ],
      "hblCargoHeaders": [
        "Container Nos, Seal Nos, Mark and Nos",
        "Number and kind of packages : description of goods",
        "Gross Weight(Kg)",
        "Volume"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 /\n20' DC X 1\nNIL MARKS",
          "STC: VALVE MATERIALS FOR MACHINERY PARTS\nFREIGHT PREPAID\nALL DESTINATION CHARGES ARE CONSIGNEE'S ACCOUNT",
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
      "containerNote": "Total Number of Containers or Packages (In words): ONE(1X20' DC) CONTAINER ONLY",
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "hblBlTitle": "Bill of Lading FOR COMBINED TRANSPORT OR PORT TO PORT SHIPMENT",
      "hblOriginals": "1(ONE)",
      "hblRegisteredNo": "MTO/DGS/1182/APR/2019",
      "hblDeliveryAgent": {
        "title": "APPLICATION FOR DELIVERY AT DESTINATION MUST BE MADE TO:",
        "lines": [
          "KingFisher Wings Dubai LLC",
          "DUBAI UNITED ARAB EMIRATES",
          "TEL: +971 55 5355 286",
          "EMAIL: inquiry@kingfishertec.com"
        ]
      },
      "termsLines": [
        "DRAFT — BILL OF LADING NOT NEGOTIABLE UNLESS CONSIGNED \"TO ORDER\"",
        "RECEIVED by the Carrier the Goods as specified above in apparent good order and condition unless otherwise stated.",
        "AS AGENT FOR THE CARRIER"
      ],
      "remarks": "JASPER"
    },
    "blocks": [
      {
        "type": "hblBlShell",
        "embedLogo": true,
        "variant": "combined"
      },
      {
        "type": "hblFreightSignature",
        "variant": "blClosing"
      },
      {
        "type": "colorfulFooter",
        "variant": "plain"
      }
    ]
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_148",
    "formatNumber": 91,
    "name": "HBL Draft Jasper 148",
    "paper": "A4",
    "rtl": false,
    "appendCustomerTerms": true,
    "theme": {
      "primary": "#101010",
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
      "formatBadgeLabel": "JASPER",
      "heroTitle": "DRAFT BILL OF LADING",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
      },
      "partyMid": {
        "title": "Consignee",
        "lines": [
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Job No.",
          "v": "CEXP190150"
        },
        {
          "k": "Booking Ref.",
          "v": "B/EXP/19/0254"
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
          "k": "Vessel / Voyage",
          "v": "CMA CGM / 9887"
        },
        {
          "k": "Ocean Vessel",
          "v": "CMA CGM"
        },
        {
          "k": "Voyage Number",
          "v": "9887"
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
          "k": "Pre-carriage by",
          "v": ""
        },
        {
          "k": "Layout",
          "v": "HBL Draft Jasper 148"
        },
        {
          "k": "Catalogue",
          "v": "jasper #91"
        }
      ],
      "hblCargoHeaders": [
        "Container Nos, Seal Nos, Mark and Nos",
        "Number and kind of packages : description of goods",
        "Gross Weight(Kg)",
        "Volume"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 /\n20' DC X 1\nNIL MARKS",
          "STC: VALVE MATERIALS FOR MACHINERY PARTS\nFREIGHT PREPAID\nALL DESTINATION CHARGES ARE CONSIGNEE'S ACCOUNT",
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
      "containerNote": "Total Number of Containers or Packages (In words): ONE(1X20' DC) CONTAINER ONLY",
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "hblBlTitle": "MULTI-MODAL TRANSPORT DOCUMENT",
      "hblOriginals": "1(ONE)",
      "hblRegisteredNo": "MTO/DGS/1182/APR/2019",
      "hblDeliveryAgent": {
        "title": "APPLICATION FOR DELIVERY AT DESTINATION MUST BE MADE TO:",
        "lines": [
          "KingFisher Wings Dubai LLC",
          "DUBAI UNITED ARAB EMIRATES",
          "TEL: +971 55 5355 286",
          "EMAIL: inquiry@kingfishertec.com"
        ]
      },
      "termsLines": [
        "DRAFT — BILL OF LADING NOT NEGOTIABLE UNLESS CONSIGNED \"TO ORDER\"",
        "RECEIVED by the Carrier the Goods as specified above in apparent good order and condition unless otherwise stated.",
        "AS AGENT FOR THE CARRIER"
      ],
      "remarks": "JASPER"
    },
    "blocks": [
      {
        "type": "hblBlShell",
        "embedLogo": true,
        "variant": "multimodal"
      },
      {
        "type": "hblFreightSignature",
        "variant": "blClosing"
      },
      {
        "type": "colorfulFooter",
        "variant": "plain"
      }
    ]
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_149",
    "formatNumber": 92,
    "name": "HBL Draft Jasper 149",
    "paper": "A4",
    "rtl": false,
    "appendCustomerTerms": true,
    "theme": {
      "primary": "#101010",
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
      "formatBadgeLabel": "JASPER",
      "heroTitle": "DRAFT BILL OF LADING",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
      },
      "partyMid": {
        "title": "Consignee",
        "lines": [
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Job No.",
          "v": "CEXP190150"
        },
        {
          "k": "Booking Ref.",
          "v": "B/EXP/19/0254"
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
          "k": "Vessel / Voyage",
          "v": "CMA CGM / 9887"
        },
        {
          "k": "Ocean Vessel",
          "v": "CMA CGM"
        },
        {
          "k": "Voyage Number",
          "v": "9887"
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
          "k": "Pre-carriage by",
          "v": ""
        },
        {
          "k": "Layout",
          "v": "HBL Draft Jasper 149"
        },
        {
          "k": "Catalogue",
          "v": "jasper #92"
        }
      ],
      "hblCargoHeaders": [
        "Container Nos, Seal Nos, Mark and Nos",
        "Number and kind of packages : description of goods",
        "Gross Weight(Kg)",
        "Volume"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 /\n20' DC X 1\nNIL MARKS",
          "STC: VALVE MATERIALS FOR MACHINERY PARTS\nFREIGHT PREPAID\nALL DESTINATION CHARGES ARE CONSIGNEE'S ACCOUNT",
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
      "containerNote": "Total Number of Containers or Packages (In words): ONE(1X20' DC) CONTAINER ONLY",
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "hblBlTitle": "BILL OF LADING  NOT NEGOTIABLE UNLESS CONSIGNED \"TO ORDER\"",
      "hblOriginals": "1(ONE)",
      "hblRegisteredNo": "MTO/DGS/1182/APR/2019",
      "hblDeliveryAgent": {
        "title": "APPLICATION FOR DELIVERY AT DESTINATION MUST BE MADE TO:",
        "lines": [
          "KingFisher Wings Dubai LLC",
          "DUBAI UNITED ARAB EMIRATES",
          "TEL: +971 55 5355 286",
          "EMAIL: inquiry@kingfishertec.com"
        ]
      },
      "termsLines": [
        "DRAFT — BILL OF LADING NOT NEGOTIABLE UNLESS CONSIGNED \"TO ORDER\"",
        "RECEIVED by the Carrier the Goods as specified above in apparent good order and condition unless otherwise stated.",
        "AS AGENT FOR THE CARRIER"
      ],
      "remarks": "JASPER"
    },
    "blocks": [
      {
        "type": "hblBlShell",
        "embedLogo": true,
        "variant": "jasper"
      },
      {
        "type": "hblFreightSignature",
        "variant": "blClosing"
      },
      {
        "type": "colorfulFooter",
        "variant": "plain"
      }
    ]
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_151",
    "formatNumber": 93,
    "name": "HBL Draft Jasper 151",
    "paper": "A4",
    "rtl": false,
    "appendCustomerTerms": true,
    "theme": {
      "primary": "#101010",
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
      "formatBadgeLabel": "JASPER",
      "heroTitle": "DRAFT BILL OF LADING",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
      },
      "partyMid": {
        "title": "Consignee",
        "lines": [
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Job No.",
          "v": "CEXP190150"
        },
        {
          "k": "Booking Ref.",
          "v": "B/EXP/19/0254"
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
          "k": "Vessel / Voyage",
          "v": "CMA CGM / 9887"
        },
        {
          "k": "Ocean Vessel",
          "v": "CMA CGM"
        },
        {
          "k": "Voyage Number",
          "v": "9887"
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
          "k": "Pre-carriage by",
          "v": ""
        },
        {
          "k": "Layout",
          "v": "HBL Draft Jasper 151"
        },
        {
          "k": "Catalogue",
          "v": "jasper #93"
        }
      ],
      "hblCargoHeaders": [
        "Container Nos, Seal Nos, Mark and Nos",
        "Number and kind of packages : description of goods",
        "Gross Weight(Kg)",
        "Volume"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 /\n20' DC X 1\nNIL MARKS",
          "STC: VALVE MATERIALS FOR MACHINERY PARTS\nFREIGHT PREPAID\nALL DESTINATION CHARGES ARE CONSIGNEE'S ACCOUNT",
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
      "containerNote": "Total Number of Containers or Packages (In words): ONE(1X20' DC) CONTAINER ONLY",
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "hblBlTitle": "BILL OF LADING",
      "hblOriginals": "1(ONE)",
      "hblRegisteredNo": "MTO/DGS/1182/APR/2019",
      "hblDeliveryAgent": {
        "title": "APPLICATION FOR DELIVERY AT DESTINATION MUST BE MADE TO:",
        "lines": [
          "KingFisher Wings Dubai LLC",
          "DUBAI UNITED ARAB EMIRATES",
          "TEL: +971 55 5355 286",
          "EMAIL: inquiry@kingfishertec.com"
        ]
      },
      "termsLines": [
        "DRAFT — BILL OF LADING NOT NEGOTIABLE UNLESS CONSIGNED \"TO ORDER\"",
        "RECEIVED by the Carrier the Goods as specified above in apparent good order and condition unless otherwise stated.",
        "AS AGENT FOR THE CARRIER"
      ],
      "remarks": "JASPER"
    },
    "blocks": [
      {
        "type": "hblBlShell",
        "embedLogo": true,
        "variant": "ocean"
      },
      {
        "type": "hblFreightSignature",
        "variant": "blClosing"
      },
      {
        "type": "colorfulFooter",
        "variant": "plain"
      }
    ]
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_172",
    "formatNumber": 94,
    "name": "HBL Draft Jasper 172",
    "paper": "A4",
    "rtl": false,
    "appendCustomerTerms": true,
    "theme": {
      "primary": "#101010",
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
      "formatBadgeLabel": "JASPER",
      "heroTitle": "DRAFT BILL OF LADING",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
      },
      "partyMid": {
        "title": "Consignee",
        "lines": [
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Job No.",
          "v": "CEXP190150"
        },
        {
          "k": "Booking Ref.",
          "v": "B/EXP/19/0254"
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
          "k": "Vessel / Voyage",
          "v": "CMA CGM / 9887"
        },
        {
          "k": "Ocean Vessel",
          "v": "CMA CGM"
        },
        {
          "k": "Voyage Number",
          "v": "9887"
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
          "k": "Pre-carriage by",
          "v": ""
        },
        {
          "k": "Layout",
          "v": "HBL Draft Jasper 172"
        },
        {
          "k": "Catalogue",
          "v": "jasper #94"
        }
      ],
      "hblCargoHeaders": [
        "Container Nos, Seal Nos, Mark and Nos",
        "Number and kind of packages : description of goods",
        "Gross Weight(Kg)",
        "Volume"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 /\n20' DC X 1\nNIL MARKS",
          "STC: VALVE MATERIALS FOR MACHINERY PARTS\nFREIGHT PREPAID\nALL DESTINATION CHARGES ARE CONSIGNEE'S ACCOUNT",
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
      "containerNote": "Total Number of Containers or Packages (In words): ONE(1X20' DC) CONTAINER ONLY",
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "hblBlTitle": "MULTIMODAL TRANSPORT DOCUMENT",
      "hblOriginals": "1(ONE)",
      "hblRegisteredNo": "MTO/DGS/1182/APR/2019",
      "hblDeliveryAgent": {
        "title": "APPLICATION FOR DELIVERY AT DESTINATION MUST BE MADE TO:",
        "lines": [
          "KingFisher Wings Dubai LLC",
          "DUBAI UNITED ARAB EMIRATES",
          "TEL: +971 55 5355 286",
          "EMAIL: inquiry@kingfishertec.com"
        ]
      },
      "termsLines": [
        "DRAFT — BILL OF LADING NOT NEGOTIABLE UNLESS CONSIGNED \"TO ORDER\"",
        "RECEIVED by the Carrier the Goods as specified above in apparent good order and condition unless otherwise stated.",
        "AS AGENT FOR THE CARRIER"
      ],
      "remarks": "JASPER"
    },
    "blocks": [
      {
        "type": "hblBlShell",
        "embedLogo": true,
        "variant": "mt"
      },
      {
        "type": "hblFreightSignature",
        "variant": "blClosing"
      },
      {
        "type": "colorfulFooter",
        "variant": "plain"
      }
    ]
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_171",
    "formatNumber": 95,
    "name": "HBL Draft Jasper 171",
    "paper": "A4",
    "rtl": false,
    "appendCustomerTerms": true,
    "theme": {
      "primary": "#101010",
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
      "formatBadgeLabel": "JASPER",
      "heroTitle": "DRAFT BILL OF LADING",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
      },
      "partyMid": {
        "title": "Consignee",
        "lines": [
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Job No.",
          "v": "CEXP190150"
        },
        {
          "k": "Booking Ref.",
          "v": "B/EXP/19/0254"
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
          "k": "Vessel / Voyage",
          "v": "CMA CGM / 9887"
        },
        {
          "k": "Ocean Vessel",
          "v": "CMA CGM"
        },
        {
          "k": "Voyage Number",
          "v": "9887"
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
          "k": "Pre-carriage by",
          "v": ""
        },
        {
          "k": "Layout",
          "v": "HBL Draft Jasper 171"
        },
        {
          "k": "Catalogue",
          "v": "jasper #95"
        }
      ],
      "hblCargoHeaders": [
        "Container Nos, Seal Nos, Mark and Nos",
        "Number and kind of packages : description of goods",
        "Gross Weight(Kg)",
        "Volume"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 /\n20' DC X 1\nNIL MARKS",
          "STC: VALVE MATERIALS FOR MACHINERY PARTS\nFREIGHT PREPAID\nALL DESTINATION CHARGES ARE CONSIGNEE'S ACCOUNT",
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
      "containerNote": "Total Number of Containers or Packages (In words): ONE(1X20' DC) CONTAINER ONLY",
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "hblBlTitle": "MULTI-MODAL TRANSPORT DOCUMENT",
      "hblOriginals": "1(ONE)",
      "hblRegisteredNo": "MTO/DGS/1182/APR/2019",
      "hblDeliveryAgent": {
        "title": "APPLICATION FOR DELIVERY AT DESTINATION MUST BE MADE TO:",
        "lines": [
          "KingFisher Wings Dubai LLC",
          "DUBAI UNITED ARAB EMIRATES",
          "TEL: +971 55 5355 286",
          "EMAIL: inquiry@kingfishertec.com"
        ]
      },
      "termsLines": [
        "DRAFT — BILL OF LADING NOT NEGOTIABLE UNLESS CONSIGNED \"TO ORDER\"",
        "RECEIVED by the Carrier the Goods as specified above in apparent good order and condition unless otherwise stated.",
        "AS AGENT FOR THE CARRIER"
      ],
      "remarks": "JASPER"
    },
    "blocks": [
      {
        "type": "hblBlShell",
        "embedLogo": true,
        "variant": "multimodal"
      },
      {
        "type": "hblFreightSignature",
        "variant": "blClosing"
      },
      {
        "type": "colorfulFooter",
        "variant": "plain"
      }
    ]
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_2",
    "formatNumber": 96,
    "name": "HBL Draft Report Format 2",
    "paper": "A4",
    "rtl": false,
    "appendCustomerTerms": true,
    "theme": {
      "primary": "#101010",
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
      "heroTitle": "DRAFT BILL OF LADING",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
      },
      "partyMid": {
        "title": "Consignee",
        "lines": [
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Job No.",
          "v": "CEXP190150"
        },
        {
          "k": "Booking Ref.",
          "v": "B/EXP/19/0254"
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
          "k": "Vessel / Voyage",
          "v": "CMA CGM / 9887"
        },
        {
          "k": "Ocean Vessel",
          "v": "CMA CGM"
        },
        {
          "k": "Voyage Number",
          "v": "9887"
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
          "k": "Pre-carriage by",
          "v": ""
        },
        {
          "k": "Layout",
          "v": "HBL Draft Report Format 2"
        },
        {
          "k": "Catalogue",
          "v": "legacy #96"
        }
      ],
      "hblCargoHeaders": [
        "Container Nos, Seal Nos, Mark and Nos",
        "Number and kind of packages : description of goods",
        "Gross Weight(Kg)",
        "Volume"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 /\n20' DC X 1\nNIL MARKS",
          "STC: VALVE MATERIALS FOR MACHINERY PARTS\nFREIGHT PREPAID\nALL DESTINATION CHARGES ARE CONSIGNEE'S ACCOUNT",
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
      "containerNote": "Total Number of Containers or Packages (In words): ONE(1X20' DC) CONTAINER ONLY",
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "hblBlTitle": "MULTI-MODAL TRANSPORT DOCUMENT",
      "hblOriginals": "1(ONE)",
      "hblRegisteredNo": "MTO/DGS/1182/APR/2019",
      "hblDeliveryAgent": {
        "title": "APPLICATION FOR DELIVERY AT DESTINATION MUST BE MADE TO:",
        "lines": [
          "KingFisher Wings Dubai LLC",
          "DUBAI UNITED ARAB EMIRATES",
          "TEL: +971 55 5355 286",
          "EMAIL: inquiry@kingfishertec.com"
        ]
      },
      "termsLines": [
        "DRAFT — BILL OF LADING NOT NEGOTIABLE UNLESS CONSIGNED \"TO ORDER\"",
        "RECEIVED by the Carrier the Goods as specified above in apparent good order and condition unless otherwise stated.",
        "AS AGENT FOR THE CARRIER"
      ],
      "remarks": "DRAFT"
    },
    "blocks": [
      {
        "type": "hblBlShell",
        "embedLogo": true,
        "variant": "multimodal"
      },
      {
        "type": "hblFreightSignature",
        "variant": "blClosing"
      },
      {
        "type": "colorfulFooter",
        "variant": "plain"
      }
    ]
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_4",
    "formatNumber": 97,
    "name": "HBL Draft Report Format 4",
    "paper": "A4",
    "rtl": false,
    "appendCustomerTerms": true,
    "theme": {
      "primary": "#101010",
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
      "heroTitle": "DRAFT BILL OF LADING",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
      },
      "partyMid": {
        "title": "Consignee",
        "lines": [
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Job No.",
          "v": "CEXP190150"
        },
        {
          "k": "Booking Ref.",
          "v": "B/EXP/19/0254"
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
          "k": "Vessel / Voyage",
          "v": "CMA CGM / 9887"
        },
        {
          "k": "Ocean Vessel",
          "v": "CMA CGM"
        },
        {
          "k": "Voyage Number",
          "v": "9887"
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
          "k": "Pre-carriage by",
          "v": ""
        },
        {
          "k": "Layout",
          "v": "HBL Draft Report Format 4"
        },
        {
          "k": "Catalogue",
          "v": "legacy #97"
        }
      ],
      "hblCargoHeaders": [
        "Container Nos, Seal Nos, Mark and Nos",
        "Number and kind of packages : description of goods",
        "Gross Weight(Kg)",
        "Volume"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 /\n20' DC X 1\nNIL MARKS",
          "STC: VALVE MATERIALS FOR MACHINERY PARTS\nFREIGHT PREPAID\nALL DESTINATION CHARGES ARE CONSIGNEE'S ACCOUNT",
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
      "containerNote": "Total Number of Containers or Packages (In words): ONE(1X20' DC) CONTAINER ONLY",
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "hblBlTitle": "MULTI-MODAL TRANSPORT DOCUMENT",
      "hblOriginals": "1(ONE)",
      "hblRegisteredNo": "MTO/DGS/1182/APR/2019",
      "hblDeliveryAgent": {
        "title": "APPLICATION FOR DELIVERY AT DESTINATION MUST BE MADE TO:",
        "lines": [
          "KingFisher Wings Dubai LLC",
          "DUBAI UNITED ARAB EMIRATES",
          "TEL: +971 55 5355 286",
          "EMAIL: inquiry@kingfishertec.com"
        ]
      },
      "termsLines": [
        "DRAFT — BILL OF LADING NOT NEGOTIABLE UNLESS CONSIGNED \"TO ORDER\"",
        "RECEIVED by the Carrier the Goods as specified above in apparent good order and condition unless otherwise stated.",
        "AS AGENT FOR THE CARRIER"
      ],
      "remarks": "DRAFT"
    },
    "blocks": [
      {
        "type": "hblBlShell",
        "embedLogo": true,
        "variant": "multimodal"
      },
      {
        "type": "hblFreightSignature",
        "variant": "blClosing"
      },
      {
        "type": "colorfulFooter",
        "variant": "plain"
      }
    ]
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_5",
    "formatNumber": 98,
    "name": "HBL Draft Report Format 5",
    "paper": "A4",
    "rtl": false,
    "appendCustomerTerms": true,
    "theme": {
      "primary": "#101010",
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
      "heroTitle": "DRAFT BILL OF LADING",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
      },
      "partyMid": {
        "title": "Consignee",
        "lines": [
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Job No.",
          "v": "CEXP190150"
        },
        {
          "k": "Booking Ref.",
          "v": "B/EXP/19/0254"
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
          "k": "Vessel / Voyage",
          "v": "CMA CGM / 9887"
        },
        {
          "k": "Ocean Vessel",
          "v": "CMA CGM"
        },
        {
          "k": "Voyage Number",
          "v": "9887"
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
          "k": "Pre-carriage by",
          "v": ""
        },
        {
          "k": "Layout",
          "v": "HBL Draft Report Format 5"
        },
        {
          "k": "Catalogue",
          "v": "legacy #98"
        }
      ],
      "hblCargoHeaders": [
        "Container Nos, Seal Nos, Mark and Nos",
        "Number and kind of packages : description of goods",
        "Gross Weight(Kg)",
        "Volume"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 /\n20' DC X 1\nNIL MARKS",
          "STC: VALVE MATERIALS FOR MACHINERY PARTS\nFREIGHT PREPAID\nALL DESTINATION CHARGES ARE CONSIGNEE'S ACCOUNT",
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
      "containerNote": "Total Number of Containers or Packages (In words): ONE(1X20' DC) CONTAINER ONLY",
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "hblBlTitle": "MULTI-MODAL TRANSPORT DOCUMENT",
      "hblOriginals": "1(ONE)",
      "hblRegisteredNo": "MTO/DGS/1182/APR/2019",
      "hblDeliveryAgent": {
        "title": "APPLICATION FOR DELIVERY AT DESTINATION MUST BE MADE TO:",
        "lines": [
          "KingFisher Wings Dubai LLC",
          "DUBAI UNITED ARAB EMIRATES",
          "TEL: +971 55 5355 286",
          "EMAIL: inquiry@kingfishertec.com"
        ]
      },
      "termsLines": [
        "DRAFT — BILL OF LADING NOT NEGOTIABLE UNLESS CONSIGNED \"TO ORDER\"",
        "RECEIVED by the Carrier the Goods as specified above in apparent good order and condition unless otherwise stated.",
        "AS AGENT FOR THE CARRIER"
      ],
      "remarks": "DRAFT"
    },
    "blocks": [
      {
        "type": "hblBlShell",
        "embedLogo": true,
        "variant": "multimodal"
      },
      {
        "type": "hblFreightSignature",
        "variant": "blClosing"
      },
      {
        "type": "colorfulFooter",
        "variant": "plain"
      }
    ]
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_6",
    "formatNumber": 99,
    "name": "HBL Draft Report Format 6",
    "paper": "A4",
    "rtl": false,
    "appendCustomerTerms": true,
    "theme": {
      "primary": "#101010",
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
      "heroTitle": "DRAFT BILL OF LADING",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
      },
      "partyMid": {
        "title": "Consignee",
        "lines": [
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Job No.",
          "v": "CEXP190150"
        },
        {
          "k": "Booking Ref.",
          "v": "B/EXP/19/0254"
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
          "k": "Vessel / Voyage",
          "v": "CMA CGM / 9887"
        },
        {
          "k": "Ocean Vessel",
          "v": "CMA CGM"
        },
        {
          "k": "Voyage Number",
          "v": "9887"
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
          "k": "Pre-carriage by",
          "v": ""
        },
        {
          "k": "Layout",
          "v": "HBL Draft Report Format 6"
        },
        {
          "k": "Catalogue",
          "v": "legacy #99"
        }
      ],
      "hblCargoHeaders": [
        "Container Nos, Seal Nos, Mark and Nos",
        "Number and kind of packages : description of goods",
        "Gross Weight(Kg)",
        "Volume"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 /\n20' DC X 1\nNIL MARKS",
          "STC: VALVE MATERIALS FOR MACHINERY PARTS\nFREIGHT PREPAID\nALL DESTINATION CHARGES ARE CONSIGNEE'S ACCOUNT",
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
      "containerNote": "Total Number of Containers or Packages (In words): ONE(1X20' DC) CONTAINER ONLY",
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "hblBlTitle": "BILL OF LADING  NOT NEGOTIABLE UNLESS CONSIGNED \"TO ORDER\"",
      "hblOriginals": "1(ONE)",
      "hblRegisteredNo": "MTO/DGS/1182/APR/2019",
      "hblDeliveryAgent": {
        "title": "APPLICATION FOR DELIVERY AT DESTINATION MUST BE MADE TO:",
        "lines": [
          "KingFisher Wings Dubai LLC",
          "DUBAI UNITED ARAB EMIRATES",
          "TEL: +971 55 5355 286",
          "EMAIL: inquiry@kingfishertec.com"
        ]
      },
      "termsLines": [
        "DRAFT — BILL OF LADING NOT NEGOTIABLE UNLESS CONSIGNED \"TO ORDER\"",
        "RECEIVED by the Carrier the Goods as specified above in apparent good order and condition unless otherwise stated.",
        "AS AGENT FOR THE CARRIER"
      ],
      "remarks": "DRAFT"
    },
    "blocks": [
      {
        "type": "hblBlShell",
        "embedLogo": true,
        "variant": "jasper"
      },
      {
        "type": "hblFreightSignature",
        "variant": "blClosing"
      },
      {
        "type": "colorfulFooter",
        "variant": "plain"
      }
    ]
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_7",
    "formatNumber": 100,
    "name": "HBL Draft Report Format 7",
    "paper": "A4",
    "rtl": false,
    "appendCustomerTerms": true,
    "theme": {
      "primary": "#101010",
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
      "heroTitle": "DRAFT BILL OF LADING",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
      },
      "partyMid": {
        "title": "Consignee",
        "lines": [
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Job No.",
          "v": "CEXP190150"
        },
        {
          "k": "Booking Ref.",
          "v": "B/EXP/19/0254"
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
          "k": "Vessel / Voyage",
          "v": "CMA CGM / 9887"
        },
        {
          "k": "Ocean Vessel",
          "v": "CMA CGM"
        },
        {
          "k": "Voyage Number",
          "v": "9887"
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
          "k": "Pre-carriage by",
          "v": ""
        },
        {
          "k": "Layout",
          "v": "HBL Draft Report Format 7"
        },
        {
          "k": "Catalogue",
          "v": "legacy #100"
        }
      ],
      "hblCargoHeaders": [
        "Container Nos, Seal Nos, Mark and Nos",
        "Number and kind of packages : description of goods",
        "Gross Weight(Kg)",
        "Volume"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 /\n20' DC X 1\nNIL MARKS",
          "STC: VALVE MATERIALS FOR MACHINERY PARTS\nFREIGHT PREPAID\nALL DESTINATION CHARGES ARE CONSIGNEE'S ACCOUNT",
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
      "containerNote": "Total Number of Containers or Packages (In words): ONE(1X20' DC) CONTAINER ONLY",
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "hblBlTitle": "BILL OF LADING",
      "hblOriginals": "1(ONE)",
      "hblRegisteredNo": "MTO/DGS/1182/APR/2019",
      "hblDeliveryAgent": {
        "title": "APPLICATION FOR DELIVERY AT DESTINATION MUST BE MADE TO:",
        "lines": [
          "KingFisher Wings Dubai LLC",
          "DUBAI UNITED ARAB EMIRATES",
          "TEL: +971 55 5355 286",
          "EMAIL: inquiry@kingfishertec.com"
        ]
      },
      "termsLines": [
        "DRAFT — BILL OF LADING NOT NEGOTIABLE UNLESS CONSIGNED \"TO ORDER\"",
        "RECEIVED by the Carrier the Goods as specified above in apparent good order and condition unless otherwise stated.",
        "AS AGENT FOR THE CARRIER"
      ],
      "remarks": "DRAFT"
    },
    "blocks": [
      {
        "type": "hblBlShell",
        "embedLogo": true,
        "variant": "ocean"
      },
      {
        "type": "hblFreightSignature",
        "variant": "blClosing"
      },
      {
        "type": "colorfulFooter",
        "variant": "plain"
      }
    ]
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_8",
    "formatNumber": 101,
    "name": "HBL Draft Report Format 8",
    "paper": "A4",
    "rtl": false,
    "appendCustomerTerms": true,
    "theme": {
      "primary": "#101010",
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
      "heroTitle": "DRAFT BILL OF LADING",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
      },
      "partyMid": {
        "title": "Consignee",
        "lines": [
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Job No.",
          "v": "CEXP190150"
        },
        {
          "k": "Booking Ref.",
          "v": "B/EXP/19/0254"
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
          "k": "Vessel / Voyage",
          "v": "CMA CGM / 9887"
        },
        {
          "k": "Ocean Vessel",
          "v": "CMA CGM"
        },
        {
          "k": "Voyage Number",
          "v": "9887"
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
          "k": "Pre-carriage by",
          "v": ""
        },
        {
          "k": "Layout",
          "v": "HBL Draft Report Format 8"
        },
        {
          "k": "Catalogue",
          "v": "legacy #101"
        }
      ],
      "hblCargoHeaders": [
        "Container Nos, Seal Nos, Mark and Nos",
        "Number and kind of packages : description of goods",
        "Gross Weight(Kg)",
        "Volume"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 /\n20' DC X 1\nNIL MARKS",
          "STC: VALVE MATERIALS FOR MACHINERY PARTS\nFREIGHT PREPAID\nALL DESTINATION CHARGES ARE CONSIGNEE'S ACCOUNT",
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
      "containerNote": "Total Number of Containers or Packages (In words): ONE(1X20' DC) CONTAINER ONLY",
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "hblBlTitle": "MULTI-MODAL TRANSPORT DOCUMENT",
      "hblOriginals": "1(ONE)",
      "hblRegisteredNo": "MTO/DGS/1182/APR/2019",
      "hblDeliveryAgent": {
        "title": "APPLICATION FOR DELIVERY AT DESTINATION MUST BE MADE TO:",
        "lines": [
          "KingFisher Wings Dubai LLC",
          "DUBAI UNITED ARAB EMIRATES",
          "TEL: +971 55 5355 286",
          "EMAIL: inquiry@kingfishertec.com"
        ]
      },
      "termsLines": [
        "DRAFT — BILL OF LADING NOT NEGOTIABLE UNLESS CONSIGNED \"TO ORDER\"",
        "RECEIVED by the Carrier the Goods as specified above in apparent good order and condition unless otherwise stated.",
        "AS AGENT FOR THE CARRIER"
      ],
      "remarks": "DRAFT"
    },
    "blocks": [
      {
        "type": "hblBlShell",
        "embedLogo": true,
        "variant": "multimodal"
      },
      {
        "type": "hblFreightSignature",
        "variant": "blClosing"
      },
      {
        "type": "colorfulFooter",
        "variant": "plain"
      }
    ]
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_9",
    "formatNumber": 102,
    "name": "HBL Draft Report Format 9",
    "paper": "A4",
    "rtl": false,
    "appendCustomerTerms": true,
    "theme": {
      "primary": "#101010",
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
      "heroTitle": "DRAFT BILL OF LADING",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
      },
      "partyMid": {
        "title": "Consignee",
        "lines": [
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Job No.",
          "v": "CEXP190150"
        },
        {
          "k": "Booking Ref.",
          "v": "B/EXP/19/0254"
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
          "k": "Vessel / Voyage",
          "v": "CMA CGM / 9887"
        },
        {
          "k": "Ocean Vessel",
          "v": "CMA CGM"
        },
        {
          "k": "Voyage Number",
          "v": "9887"
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
          "k": "Pre-carriage by",
          "v": ""
        },
        {
          "k": "Layout",
          "v": "HBL Draft Report Format 9"
        },
        {
          "k": "Catalogue",
          "v": "legacy #102"
        }
      ],
      "hblCargoHeaders": [
        "Container Nos, Seal Nos, Mark and Nos",
        "Number and kind of packages : description of goods",
        "Gross Weight(Kg)",
        "Volume"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 /\n20' DC X 1\nNIL MARKS",
          "STC: VALVE MATERIALS FOR MACHINERY PARTS\nFREIGHT PREPAID\nALL DESTINATION CHARGES ARE CONSIGNEE'S ACCOUNT",
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
      "containerNote": "Total Number of Containers or Packages (In words): ONE(1X20' DC) CONTAINER ONLY",
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "hblBlTitle": "Bill of Lading FOR COMBINED TRANSPORT OR PORT TO PORT SHIPMENT",
      "hblOriginals": "1(ONE)",
      "hblRegisteredNo": "MTO/DGS/1182/APR/2019",
      "hblDeliveryAgent": {
        "title": "APPLICATION FOR DELIVERY AT DESTINATION MUST BE MADE TO:",
        "lines": [
          "KingFisher Wings Dubai LLC",
          "DUBAI UNITED ARAB EMIRATES",
          "TEL: +971 55 5355 286",
          "EMAIL: inquiry@kingfishertec.com"
        ]
      },
      "termsLines": [
        "DRAFT — BILL OF LADING NOT NEGOTIABLE UNLESS CONSIGNED \"TO ORDER\"",
        "RECEIVED by the Carrier the Goods as specified above in apparent good order and condition unless otherwise stated.",
        "AS AGENT FOR THE CARRIER"
      ],
      "remarks": "DRAFT"
    },
    "blocks": [
      {
        "type": "hblBlShell",
        "embedLogo": true,
        "variant": "combined"
      },
      {
        "type": "hblFreightSignature",
        "variant": "blClosing"
      },
      {
        "type": "colorfulFooter",
        "variant": "plain"
      }
    ]
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_10",
    "formatNumber": 103,
    "name": "HBL Draft Report Format 10",
    "paper": "A4",
    "rtl": false,
    "appendCustomerTerms": true,
    "theme": {
      "primary": "#101010",
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
      "heroTitle": "DRAFT BILL OF LADING",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
      },
      "partyMid": {
        "title": "Consignee",
        "lines": [
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Job No.",
          "v": "CEXP190150"
        },
        {
          "k": "Booking Ref.",
          "v": "B/EXP/19/0254"
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
          "k": "Vessel / Voyage",
          "v": "CMA CGM / 9887"
        },
        {
          "k": "Ocean Vessel",
          "v": "CMA CGM"
        },
        {
          "k": "Voyage Number",
          "v": "9887"
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
          "k": "Pre-carriage by",
          "v": ""
        },
        {
          "k": "Layout",
          "v": "HBL Draft Report Format 10"
        },
        {
          "k": "Catalogue",
          "v": "legacy #103"
        }
      ],
      "hblCargoHeaders": [
        "Container Nos, Seal Nos, Mark and Nos",
        "Number and kind of packages : description of goods",
        "Gross Weight(Kg)",
        "Volume"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 /\n20' DC X 1\nNIL MARKS",
          "STC: VALVE MATERIALS FOR MACHINERY PARTS\nFREIGHT PREPAID\nALL DESTINATION CHARGES ARE CONSIGNEE'S ACCOUNT",
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
      "containerNote": "Total Number of Containers or Packages (In words): ONE(1X20' DC) CONTAINER ONLY",
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "hblBlTitle": "MULTIMODAL TRANSPORT DOCUMENT",
      "hblOriginals": "1(ONE)",
      "hblRegisteredNo": "MTO/DGS/1182/APR/2019",
      "hblDeliveryAgent": {
        "title": "APPLICATION FOR DELIVERY AT DESTINATION MUST BE MADE TO:",
        "lines": [
          "KingFisher Wings Dubai LLC",
          "DUBAI UNITED ARAB EMIRATES",
          "TEL: +971 55 5355 286",
          "EMAIL: inquiry@kingfishertec.com"
        ]
      },
      "termsLines": [
        "DRAFT — BILL OF LADING NOT NEGOTIABLE UNLESS CONSIGNED \"TO ORDER\"",
        "RECEIVED by the Carrier the Goods as specified above in apparent good order and condition unless otherwise stated.",
        "AS AGENT FOR THE CARRIER"
      ],
      "remarks": "DRAFT"
    },
    "blocks": [
      {
        "type": "hblBlShell",
        "embedLogo": true,
        "variant": "mt"
      },
      {
        "type": "hblFreightSignature",
        "variant": "blClosing"
      },
      {
        "type": "colorfulFooter",
        "variant": "plain"
      }
    ]
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_11",
    "formatNumber": 104,
    "name": "HBL Draft Report Format 11",
    "paper": "A4",
    "rtl": false,
    "appendCustomerTerms": true,
    "theme": {
      "primary": "#101010",
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
      "heroTitle": "DRAFT BILL OF LADING",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
      },
      "partyMid": {
        "title": "Consignee",
        "lines": [
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Job No.",
          "v": "CEXP190150"
        },
        {
          "k": "Booking Ref.",
          "v": "B/EXP/19/0254"
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
          "k": "Vessel / Voyage",
          "v": "CMA CGM / 9887"
        },
        {
          "k": "Ocean Vessel",
          "v": "CMA CGM"
        },
        {
          "k": "Voyage Number",
          "v": "9887"
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
          "k": "Pre-carriage by",
          "v": ""
        },
        {
          "k": "Layout",
          "v": "HBL Draft Report Format 11"
        },
        {
          "k": "Catalogue",
          "v": "legacy #104"
        }
      ],
      "hblCargoHeaders": [
        "Container Nos, Seal Nos, Mark and Nos",
        "Number and kind of packages : description of goods",
        "Gross Weight(Kg)",
        "Volume"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 /\n20' DC X 1\nNIL MARKS",
          "STC: VALVE MATERIALS FOR MACHINERY PARTS\nFREIGHT PREPAID\nALL DESTINATION CHARGES ARE CONSIGNEE'S ACCOUNT",
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
      "containerNote": "Total Number of Containers or Packages (In words): ONE(1X20' DC) CONTAINER ONLY",
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "hblBlTitle": "Bill of Lading FOR COMBINED TRANSPORT OR PORT TO PORT SHIPMENT",
      "hblOriginals": "1(ONE)",
      "hblRegisteredNo": "MTO/DGS/1182/APR/2019",
      "hblDeliveryAgent": {
        "title": "APPLICATION FOR DELIVERY AT DESTINATION MUST BE MADE TO:",
        "lines": [
          "KingFisher Wings Dubai LLC",
          "DUBAI UNITED ARAB EMIRATES",
          "TEL: +971 55 5355 286",
          "EMAIL: inquiry@kingfishertec.com"
        ]
      },
      "termsLines": [
        "DRAFT — BILL OF LADING NOT NEGOTIABLE UNLESS CONSIGNED \"TO ORDER\"",
        "RECEIVED by the Carrier the Goods as specified above in apparent good order and condition unless otherwise stated.",
        "AS AGENT FOR THE CARRIER"
      ],
      "remarks": "DRAFT"
    },
    "blocks": [
      {
        "type": "hblBlShell",
        "embedLogo": true,
        "variant": "combined"
      },
      {
        "type": "hblFreightSignature",
        "variant": "blClosing"
      },
      {
        "type": "colorfulFooter",
        "variant": "plain"
      }
    ]
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_12",
    "formatNumber": 105,
    "name": "HBL Draft Report Format 12",
    "paper": "A4",
    "rtl": false,
    "appendCustomerTerms": true,
    "theme": {
      "primary": "#101010",
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
      "heroTitle": "DRAFT BILL OF LADING",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
      },
      "partyMid": {
        "title": "Consignee",
        "lines": [
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Job No.",
          "v": "CEXP190150"
        },
        {
          "k": "Booking Ref.",
          "v": "B/EXP/19/0254"
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
          "k": "Vessel / Voyage",
          "v": "CMA CGM / 9887"
        },
        {
          "k": "Ocean Vessel",
          "v": "CMA CGM"
        },
        {
          "k": "Voyage Number",
          "v": "9887"
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
          "k": "Pre-carriage by",
          "v": ""
        },
        {
          "k": "Layout",
          "v": "HBL Draft Report Format 12"
        },
        {
          "k": "Catalogue",
          "v": "legacy #105"
        }
      ],
      "hblCargoHeaders": [
        "Container Nos, Seal Nos, Mark and Nos",
        "Number and kind of packages : description of goods",
        "Gross Weight(Kg)",
        "Volume"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 /\n20' DC X 1\nNIL MARKS",
          "STC: VALVE MATERIALS FOR MACHINERY PARTS\nFREIGHT PREPAID\nALL DESTINATION CHARGES ARE CONSIGNEE'S ACCOUNT",
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
      "containerNote": "Total Number of Containers or Packages (In words): ONE(1X20' DC) CONTAINER ONLY",
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "hblBlTitle": "BILL OF LADING",
      "hblOriginals": "1(ONE)",
      "hblRegisteredNo": "MTO/DGS/1182/APR/2019",
      "hblDeliveryAgent": {
        "title": "APPLICATION FOR DELIVERY AT DESTINATION MUST BE MADE TO:",
        "lines": [
          "KingFisher Wings Dubai LLC",
          "DUBAI UNITED ARAB EMIRATES",
          "TEL: +971 55 5355 286",
          "EMAIL: inquiry@kingfishertec.com"
        ]
      },
      "termsLines": [
        "DRAFT — BILL OF LADING NOT NEGOTIABLE UNLESS CONSIGNED \"TO ORDER\"",
        "RECEIVED by the Carrier the Goods as specified above in apparent good order and condition unless otherwise stated.",
        "AS AGENT FOR THE CARRIER"
      ],
      "remarks": "DRAFT"
    },
    "blocks": [
      {
        "type": "hblBlShell",
        "embedLogo": true,
        "variant": "ocean"
      },
      {
        "type": "hblFreightSignature",
        "variant": "blClosing"
      },
      {
        "type": "colorfulFooter",
        "variant": "plain"
      }
    ]
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_13",
    "formatNumber": 106,
    "name": "HBL Draft Report Format 13",
    "paper": "A4",
    "rtl": false,
    "appendCustomerTerms": true,
    "theme": {
      "primary": "#101010",
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
      "heroTitle": "DRAFT BILL OF LADING",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
      },
      "partyMid": {
        "title": "Consignee",
        "lines": [
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Job No.",
          "v": "CEXP190150"
        },
        {
          "k": "Booking Ref.",
          "v": "B/EXP/19/0254"
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
          "k": "Vessel / Voyage",
          "v": "CMA CGM / 9887"
        },
        {
          "k": "Ocean Vessel",
          "v": "CMA CGM"
        },
        {
          "k": "Voyage Number",
          "v": "9887"
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
          "k": "Pre-carriage by",
          "v": ""
        },
        {
          "k": "Layout",
          "v": "HBL Draft Report Format 13"
        },
        {
          "k": "Catalogue",
          "v": "legacy #106"
        }
      ],
      "hblCargoHeaders": [
        "Container Nos, Seal Nos, Mark and Nos",
        "Number and kind of packages : description of goods",
        "Gross Weight(Kg)",
        "Volume"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 /\n20' DC X 1\nNIL MARKS",
          "STC: VALVE MATERIALS FOR MACHINERY PARTS\nFREIGHT PREPAID\nALL DESTINATION CHARGES ARE CONSIGNEE'S ACCOUNT",
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
      "containerNote": "Total Number of Containers or Packages (In words): ONE(1X20' DC) CONTAINER ONLY",
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "hblBlTitle": "MULTI-MODAL TRANSPORT DOCUMENT",
      "hblOriginals": "1(ONE)",
      "hblRegisteredNo": "MTO/DGS/1182/APR/2019",
      "hblDeliveryAgent": {
        "title": "APPLICATION FOR DELIVERY AT DESTINATION MUST BE MADE TO:",
        "lines": [
          "KingFisher Wings Dubai LLC",
          "DUBAI UNITED ARAB EMIRATES",
          "TEL: +971 55 5355 286",
          "EMAIL: inquiry@kingfishertec.com"
        ]
      },
      "termsLines": [
        "DRAFT — BILL OF LADING NOT NEGOTIABLE UNLESS CONSIGNED \"TO ORDER\"",
        "RECEIVED by the Carrier the Goods as specified above in apparent good order and condition unless otherwise stated.",
        "AS AGENT FOR THE CARRIER"
      ],
      "remarks": "DRAFT"
    },
    "blocks": [
      {
        "type": "hblBlShell",
        "embedLogo": true,
        "variant": "multimodal"
      },
      {
        "type": "hblFreightSignature",
        "variant": "blClosing"
      },
      {
        "type": "colorfulFooter",
        "variant": "plain"
      }
    ]
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_14",
    "formatNumber": 107,
    "name": "HBL Draft Report Format 14",
    "paper": "A4",
    "rtl": false,
    "appendCustomerTerms": true,
    "theme": {
      "primary": "#101010",
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
      "heroTitle": "DRAFT BILL OF LADING",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
      },
      "partyMid": {
        "title": "Consignee",
        "lines": [
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Job No.",
          "v": "CEXP190150"
        },
        {
          "k": "Booking Ref.",
          "v": "B/EXP/19/0254"
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
          "k": "Vessel / Voyage",
          "v": "CMA CGM / 9887"
        },
        {
          "k": "Ocean Vessel",
          "v": "CMA CGM"
        },
        {
          "k": "Voyage Number",
          "v": "9887"
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
          "k": "Pre-carriage by",
          "v": ""
        },
        {
          "k": "Layout",
          "v": "HBL Draft Report Format 14"
        },
        {
          "k": "Catalogue",
          "v": "legacy #107"
        }
      ],
      "hblCargoHeaders": [
        "Container Nos, Seal Nos, Mark and Nos",
        "Number and kind of packages : description of goods",
        "Gross Weight(Kg)",
        "Volume"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 /\n20' DC X 1\nNIL MARKS",
          "STC: VALVE MATERIALS FOR MACHINERY PARTS\nFREIGHT PREPAID\nALL DESTINATION CHARGES ARE CONSIGNEE'S ACCOUNT",
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
      "containerNote": "Total Number of Containers or Packages (In words): ONE(1X20' DC) CONTAINER ONLY",
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "hblBlTitle": "MULTI-MODAL TRANSPORT DOCUMENT",
      "hblOriginals": "1(ONE)",
      "hblRegisteredNo": "MTO/DGS/1182/APR/2019",
      "hblDeliveryAgent": {
        "title": "APPLICATION FOR DELIVERY AT DESTINATION MUST BE MADE TO:",
        "lines": [
          "KingFisher Wings Dubai LLC",
          "DUBAI UNITED ARAB EMIRATES",
          "TEL: +971 55 5355 286",
          "EMAIL: inquiry@kingfishertec.com"
        ]
      },
      "termsLines": [
        "DRAFT — BILL OF LADING NOT NEGOTIABLE UNLESS CONSIGNED \"TO ORDER\"",
        "RECEIVED by the Carrier the Goods as specified above in apparent good order and condition unless otherwise stated.",
        "AS AGENT FOR THE CARRIER"
      ],
      "remarks": "DRAFT"
    },
    "blocks": [
      {
        "type": "hblBlShell",
        "embedLogo": true,
        "variant": "multimodal"
      },
      {
        "type": "hblFreightSignature",
        "variant": "blClosing"
      },
      {
        "type": "colorfulFooter",
        "variant": "plain"
      }
    ]
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_15",
    "formatNumber": 108,
    "name": "HBL Draft Report Format 15",
    "paper": "A4",
    "rtl": false,
    "appendCustomerTerms": true,
    "theme": {
      "primary": "#101010",
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
      "heroTitle": "DRAFT BILL OF LADING",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
      },
      "partyMid": {
        "title": "Consignee",
        "lines": [
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Job No.",
          "v": "CEXP190150"
        },
        {
          "k": "Booking Ref.",
          "v": "B/EXP/19/0254"
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
          "k": "Vessel / Voyage",
          "v": "CMA CGM / 9887"
        },
        {
          "k": "Ocean Vessel",
          "v": "CMA CGM"
        },
        {
          "k": "Voyage Number",
          "v": "9887"
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
          "k": "Pre-carriage by",
          "v": ""
        },
        {
          "k": "Layout",
          "v": "HBL Draft Report Format 15"
        },
        {
          "k": "Catalogue",
          "v": "legacy #108"
        }
      ],
      "hblCargoHeaders": [
        "Container Nos, Seal Nos, Mark and Nos",
        "Number and kind of packages : description of goods",
        "Gross Weight(Kg)",
        "Volume"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 /\n20' DC X 1\nNIL MARKS",
          "STC: VALVE MATERIALS FOR MACHINERY PARTS\nFREIGHT PREPAID\nALL DESTINATION CHARGES ARE CONSIGNEE'S ACCOUNT",
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
      "containerNote": "Total Number of Containers or Packages (In words): ONE(1X20' DC) CONTAINER ONLY",
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "hblBlTitle": "MULTIMODAL TRANSPORT DOCUMENT",
      "hblOriginals": "1(ONE)",
      "hblRegisteredNo": "MTO/DGS/1182/APR/2019",
      "hblDeliveryAgent": {
        "title": "APPLICATION FOR DELIVERY AT DESTINATION MUST BE MADE TO:",
        "lines": [
          "KingFisher Wings Dubai LLC",
          "DUBAI UNITED ARAB EMIRATES",
          "TEL: +971 55 5355 286",
          "EMAIL: inquiry@kingfishertec.com"
        ]
      },
      "termsLines": [
        "DRAFT — BILL OF LADING NOT NEGOTIABLE UNLESS CONSIGNED \"TO ORDER\"",
        "RECEIVED by the Carrier the Goods as specified above in apparent good order and condition unless otherwise stated.",
        "AS AGENT FOR THE CARRIER"
      ],
      "remarks": "DRAFT"
    },
    "blocks": [
      {
        "type": "hblBlShell",
        "embedLogo": true,
        "variant": "mt"
      },
      {
        "type": "hblFreightSignature",
        "variant": "blClosing"
      },
      {
        "type": "colorfulFooter",
        "variant": "plain"
      }
    ]
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_16",
    "formatNumber": 109,
    "name": "HBL Draft Report Format 16",
    "paper": "A4",
    "rtl": false,
    "appendCustomerTerms": true,
    "theme": {
      "primary": "#101010",
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
      "heroTitle": "DRAFT BILL OF LADING",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
      },
      "partyMid": {
        "title": "Consignee",
        "lines": [
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Job No.",
          "v": "CEXP190150"
        },
        {
          "k": "Booking Ref.",
          "v": "B/EXP/19/0254"
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
          "k": "Vessel / Voyage",
          "v": "CMA CGM / 9887"
        },
        {
          "k": "Ocean Vessel",
          "v": "CMA CGM"
        },
        {
          "k": "Voyage Number",
          "v": "9887"
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
          "k": "Pre-carriage by",
          "v": ""
        },
        {
          "k": "Layout",
          "v": "HBL Draft Report Format 16"
        },
        {
          "k": "Catalogue",
          "v": "legacy #109"
        }
      ],
      "hblCargoHeaders": [
        "Container Nos, Seal Nos, Mark and Nos",
        "Number and kind of packages : description of goods",
        "Gross Weight(Kg)",
        "Volume"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 /\n20' DC X 1\nNIL MARKS",
          "STC: VALVE MATERIALS FOR MACHINERY PARTS\nFREIGHT PREPAID\nALL DESTINATION CHARGES ARE CONSIGNEE'S ACCOUNT",
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
      "containerNote": "Total Number of Containers or Packages (In words): ONE(1X20' DC) CONTAINER ONLY",
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "hblBlTitle": "MULTI-MODAL TRANSPORT DOCUMENT",
      "hblOriginals": "1(ONE)",
      "hblRegisteredNo": "MTO/DGS/1182/APR/2019",
      "hblDeliveryAgent": {
        "title": "APPLICATION FOR DELIVERY AT DESTINATION MUST BE MADE TO:",
        "lines": [
          "KingFisher Wings Dubai LLC",
          "DUBAI UNITED ARAB EMIRATES",
          "TEL: +971 55 5355 286",
          "EMAIL: inquiry@kingfishertec.com"
        ]
      },
      "termsLines": [
        "DRAFT — BILL OF LADING NOT NEGOTIABLE UNLESS CONSIGNED \"TO ORDER\"",
        "RECEIVED by the Carrier the Goods as specified above in apparent good order and condition unless otherwise stated.",
        "AS AGENT FOR THE CARRIER"
      ],
      "remarks": "DRAFT"
    },
    "blocks": [
      {
        "type": "hblBlShell",
        "embedLogo": true,
        "variant": "multimodal"
      },
      {
        "type": "hblFreightSignature",
        "variant": "blClosing"
      },
      {
        "type": "colorfulFooter",
        "variant": "plain"
      }
    ]
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_17",
    "formatNumber": 110,
    "name": "HBL Draft Report Format 17",
    "paper": "A4",
    "rtl": false,
    "appendCustomerTerms": true,
    "theme": {
      "primary": "#101010",
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
      "heroTitle": "DRAFT BILL OF LADING",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
      },
      "partyMid": {
        "title": "Consignee",
        "lines": [
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Job No.",
          "v": "CEXP190150"
        },
        {
          "k": "Booking Ref.",
          "v": "B/EXP/19/0254"
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
          "k": "Vessel / Voyage",
          "v": "CMA CGM / 9887"
        },
        {
          "k": "Ocean Vessel",
          "v": "CMA CGM"
        },
        {
          "k": "Voyage Number",
          "v": "9887"
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
          "k": "Pre-carriage by",
          "v": ""
        },
        {
          "k": "Layout",
          "v": "HBL Draft Report Format 17"
        },
        {
          "k": "Catalogue",
          "v": "legacy #110"
        }
      ],
      "hblCargoHeaders": [
        "Container Nos, Seal Nos, Mark and Nos",
        "Number and kind of packages : description of goods",
        "Gross Weight(Kg)",
        "Volume"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 /\n20' DC X 1\nNIL MARKS",
          "STC: VALVE MATERIALS FOR MACHINERY PARTS\nFREIGHT PREPAID\nALL DESTINATION CHARGES ARE CONSIGNEE'S ACCOUNT",
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
      "containerNote": "Total Number of Containers or Packages (In words): ONE(1X20' DC) CONTAINER ONLY",
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "hblBlTitle": "BILL OF LADING",
      "hblOriginals": "1(ONE)",
      "hblRegisteredNo": "MTO/DGS/1182/APR/2019",
      "hblDeliveryAgent": {
        "title": "APPLICATION FOR DELIVERY AT DESTINATION MUST BE MADE TO:",
        "lines": [
          "KingFisher Wings Dubai LLC",
          "DUBAI UNITED ARAB EMIRATES",
          "TEL: +971 55 5355 286",
          "EMAIL: inquiry@kingfishertec.com"
        ]
      },
      "termsLines": [
        "DRAFT — BILL OF LADING NOT NEGOTIABLE UNLESS CONSIGNED \"TO ORDER\"",
        "RECEIVED by the Carrier the Goods as specified above in apparent good order and condition unless otherwise stated.",
        "AS AGENT FOR THE CARRIER"
      ],
      "remarks": "DRAFT"
    },
    "blocks": [
      {
        "type": "hblBlShell",
        "embedLogo": true,
        "variant": "ocean"
      },
      {
        "type": "hblFreightSignature",
        "variant": "blClosing"
      },
      {
        "type": "colorfulFooter",
        "variant": "plain"
      }
    ]
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_18",
    "formatNumber": 111,
    "name": "HBL Draft Report Format 18",
    "paper": "A4",
    "rtl": false,
    "appendCustomerTerms": true,
    "theme": {
      "primary": "#101010",
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
      "heroTitle": "DRAFT BILL OF LADING",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
      },
      "partyMid": {
        "title": "Consignee",
        "lines": [
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Job No.",
          "v": "CEXP190150"
        },
        {
          "k": "Booking Ref.",
          "v": "B/EXP/19/0254"
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
          "k": "Vessel / Voyage",
          "v": "CMA CGM / 9887"
        },
        {
          "k": "Ocean Vessel",
          "v": "CMA CGM"
        },
        {
          "k": "Voyage Number",
          "v": "9887"
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
          "k": "Pre-carriage by",
          "v": ""
        },
        {
          "k": "Layout",
          "v": "HBL Draft Report Format 18"
        },
        {
          "k": "Catalogue",
          "v": "legacy #111"
        }
      ],
      "hblCargoHeaders": [
        "Container Nos, Seal Nos, Mark and Nos",
        "Number and kind of packages : description of goods",
        "Gross Weight(Kg)",
        "Volume"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 /\n20' DC X 1\nNIL MARKS",
          "STC: VALVE MATERIALS FOR MACHINERY PARTS\nFREIGHT PREPAID\nALL DESTINATION CHARGES ARE CONSIGNEE'S ACCOUNT",
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
      "containerNote": "Total Number of Containers or Packages (In words): ONE(1X20' DC) CONTAINER ONLY",
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "hblBlTitle": "Bill of Lading FOR COMBINED TRANSPORT OR PORT TO PORT SHIPMENT",
      "hblOriginals": "1(ONE)",
      "hblRegisteredNo": "MTO/DGS/1182/APR/2019",
      "hblDeliveryAgent": {
        "title": "APPLICATION FOR DELIVERY AT DESTINATION MUST BE MADE TO:",
        "lines": [
          "KingFisher Wings Dubai LLC",
          "DUBAI UNITED ARAB EMIRATES",
          "TEL: +971 55 5355 286",
          "EMAIL: inquiry@kingfishertec.com"
        ]
      },
      "termsLines": [
        "DRAFT — BILL OF LADING NOT NEGOTIABLE UNLESS CONSIGNED \"TO ORDER\"",
        "RECEIVED by the Carrier the Goods as specified above in apparent good order and condition unless otherwise stated.",
        "AS AGENT FOR THE CARRIER"
      ],
      "remarks": "DRAFT"
    },
    "blocks": [
      {
        "type": "hblBlShell",
        "embedLogo": true,
        "variant": "combined"
      },
      {
        "type": "hblFreightSignature",
        "variant": "blClosing"
      },
      {
        "type": "colorfulFooter",
        "variant": "plain"
      }
    ]
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_19",
    "formatNumber": 112,
    "name": "HBL Draft Report Format 19",
    "paper": "A4",
    "rtl": false,
    "appendCustomerTerms": true,
    "theme": {
      "primary": "#101010",
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
      "heroTitle": "DRAFT BILL OF LADING",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
      },
      "partyMid": {
        "title": "Consignee",
        "lines": [
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Job No.",
          "v": "CEXP190150"
        },
        {
          "k": "Booking Ref.",
          "v": "B/EXP/19/0254"
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
          "k": "Vessel / Voyage",
          "v": "CMA CGM / 9887"
        },
        {
          "k": "Ocean Vessel",
          "v": "CMA CGM"
        },
        {
          "k": "Voyage Number",
          "v": "9887"
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
          "k": "Pre-carriage by",
          "v": ""
        },
        {
          "k": "Layout",
          "v": "HBL Draft Report Format 19"
        },
        {
          "k": "Catalogue",
          "v": "legacy #112"
        }
      ],
      "hblCargoHeaders": [
        "Container Nos, Seal Nos, Mark and Nos",
        "Number and kind of packages : description of goods",
        "Gross Weight(Kg)",
        "Volume"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 /\n20' DC X 1\nNIL MARKS",
          "STC: VALVE MATERIALS FOR MACHINERY PARTS\nFREIGHT PREPAID\nALL DESTINATION CHARGES ARE CONSIGNEE'S ACCOUNT",
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
      "containerNote": "Total Number of Containers or Packages (In words): ONE(1X20' DC) CONTAINER ONLY",
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "hblBlTitle": "Bill of Lading FOR COMBINED TRANSPORT OR PORT TO PORT SHIPMENT",
      "hblOriginals": "1(ONE)",
      "hblRegisteredNo": "MTO/DGS/1182/APR/2019",
      "hblDeliveryAgent": {
        "title": "APPLICATION FOR DELIVERY AT DESTINATION MUST BE MADE TO:",
        "lines": [
          "KingFisher Wings Dubai LLC",
          "DUBAI UNITED ARAB EMIRATES",
          "TEL: +971 55 5355 286",
          "EMAIL: inquiry@kingfishertec.com"
        ]
      },
      "termsLines": [
        "DRAFT — BILL OF LADING NOT NEGOTIABLE UNLESS CONSIGNED \"TO ORDER\"",
        "RECEIVED by the Carrier the Goods as specified above in apparent good order and condition unless otherwise stated.",
        "AS AGENT FOR THE CARRIER"
      ],
      "remarks": "DRAFT"
    },
    "blocks": [
      {
        "type": "hblBlShell",
        "embedLogo": true,
        "variant": "combined"
      },
      {
        "type": "hblFreightSignature",
        "variant": "blClosing"
      },
      {
        "type": "colorfulFooter",
        "variant": "plain"
      }
    ]
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_20",
    "formatNumber": 113,
    "name": "HBL Draft Report Format 20",
    "paper": "A4",
    "rtl": false,
    "appendCustomerTerms": true,
    "theme": {
      "primary": "#101010",
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
      "heroTitle": "DRAFT BILL OF LADING",
      "partyLeft": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "CHENNAI TAMIL NADU 600084 INDIA"
        ]
      },
      "partyMid": {
        "title": "Consignee",
        "lines": [
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888"
        },
        {
          "k": "Job No.",
          "v": "CEXP190150"
        },
        {
          "k": "Booking Ref.",
          "v": "B/EXP/19/0254"
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
          "k": "Vessel / Voyage",
          "v": "CMA CGM / 9887"
        },
        {
          "k": "Ocean Vessel",
          "v": "CMA CGM"
        },
        {
          "k": "Voyage Number",
          "v": "9887"
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
          "k": "Pre-carriage by",
          "v": ""
        },
        {
          "k": "Layout",
          "v": "HBL Draft Report Format 20"
        },
        {
          "k": "Catalogue",
          "v": "legacy #113"
        }
      ],
      "hblCargoHeaders": [
        "Container Nos, Seal Nos, Mark and Nos",
        "Number and kind of packages : description of goods",
        "Gross Weight(Kg)",
        "Volume"
      ],
      "hblCargoRows": [
        [
          "ABCU9877666 / SEAL NO. : SL345566 /\n20' DC X 1\nNIL MARKS",
          "STC: VALVE MATERIALS FOR MACHINERY PARTS\nFREIGHT PREPAID\nALL DESTINATION CHARGES ARE CONSIGNEE'S ACCOUNT",
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
      "containerNote": "Total Number of Containers or Packages (In words): ONE(1X20' DC) CONTAINER ONLY",
      "hblFreightText": "FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED",
      "hblOnboardDate": "16-JAN-19",
      "hblPlaceDate": "CHENNAI 28-JAN-19",
      "hblCarrierAgent": "CMA CGM",
      "hblBlTitle": "BILL OF LADING",
      "hblOriginals": "1(ONE)",
      "hblRegisteredNo": "MTO/DGS/1182/APR/2019",
      "hblDeliveryAgent": {
        "title": "APPLICATION FOR DELIVERY AT DESTINATION MUST BE MADE TO:",
        "lines": [
          "KingFisher Wings Dubai LLC",
          "DUBAI UNITED ARAB EMIRATES",
          "TEL: +971 55 5355 286",
          "EMAIL: inquiry@kingfishertec.com"
        ]
      },
      "termsLines": [
        "DRAFT — BILL OF LADING NOT NEGOTIABLE UNLESS CONSIGNED \"TO ORDER\"",
        "RECEIVED by the Carrier the Goods as specified above in apparent good order and condition unless otherwise stated.",
        "AS AGENT FOR THE CARRIER"
      ],
      "remarks": "DRAFT"
    },
    "blocks": [
      {
        "type": "hblBlShell",
        "embedLogo": true,
        "variant": "ocean"
      },
      {
        "type": "hblFreightSignature",
        "variant": "blClosing"
      },
      {
        "type": "colorfulFooter",
        "variant": "plain"
      }
    ]
  }
] as InvoiceFormatUiLayout[];
