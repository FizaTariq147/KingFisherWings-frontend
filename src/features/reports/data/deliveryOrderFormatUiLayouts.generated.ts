import type { InvoiceFormatUiLayout } from '../types/invoiceFormatUiLayout.types';

/** Permanent JSON UI layouts — deliveryOrderFormatUiLayouts. */
export const DELIVERY_ORDER_FORMAT_UI_LAYOUTS: InvoiceFormatUiLayout[] = [
  {
    "code": "DELIVERY_CONFIRMATION_REPORT_FORMAT",
    "formatNumber": 1,
    "name": "Delivery Confirmation Report Format",
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
      "invoiceNo": "CEXP190150",
      "invoiceDate": "07-FEB-19",
      "partyLeft": {
        "title": "Consignee",
        "lines": [
          "AL NASER TRADING COMPANY LLC",
          "30 AL MAKTHOOM BUILDING NEAR MUBARAK CENTRE",
          "AL NABHA SHARJAH UAE"
        ]
      },
      "partyMid": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "NUNGAMBAKKAM CHENNAI TAMIL NADU 600084 INDIA"
        ]
      },
      "fieldGrid": [
        {
          "k": "HBL No.",
          "v": "PLMAAJEA00081 / 28-JAN-19"
        },
        {
          "k": "MBL No.",
          "v": "MBLCOPY87667888 / 28-JAN-19"
        },
        {
          "k": "Delivery Date",
          "v": "08-FEB-19"
        },
        {
          "k": "Place",
          "v": "JEBEL ALI, UAE"
        }
      ],
      "tableHeaders": [
        "Description",
        "Qty",
        "Condition"
      ],
      "tableRows": [
        [
          "STC: VALVE MATERIALS FOR MACHINERY PARTS",
          "125 PKGS",
          "Received in good order"
        ]
      ],
      "termsLines": [
        "We confirm receipt of the above shipment in full and good order.",
        "This is a computer generated document."
      ]
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "docTitle",
        "text": "DELIVERY CONFIRMATION",
        "align": "center",
        "band": true
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
        "headerColor": "primary"
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
    "code": "DELIVERY_CONFIRMATION_OSA_REPORT_FORMAT",
    "formatNumber": 2,
    "name": "Delivery Confirmation OSA Report Format",
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
      "invoiceNo": "CEXP190150",
      "invoiceDate": "07-FEB-19",
      "letterBody": "OSA Delivery Confirmation — cargo delivered to consignee premises as per attached job details.",
      "partyLeft": {
        "title": "Consignee",
        "lines": [
          "AL NASER TRADING COMPANY LLC",
          "30 AL MAKTHOOM BUILDING NEAR MUBARAK CENTRE",
          "AL NABHA SHARJAH UAE"
        ]
      },
      "partyMid": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "NUNGAMBAKKAM CHENNAI TAMIL NADU 600084 INDIA"
        ]
      },
      "fieldGrid": [
        {
          "k": "Job No.",
          "v": "CEXP190150"
        },
        {
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "Delivery Date & Time",
          "v": "08-FEB-19 14:30"
        },
        {
          "k": "Driver / Vehicle",
          "v": "Ahmed / DXB-98765"
        }
      ],
      "tableHeaders": [
        "Particulars",
        "Remarks"
      ],
      "tableRows": [
        [
          "125 PACKAGES — VALVE MATERIALS",
          "No damage noted"
        ]
      ],
      "termsLines": [
        "Signed on behalf of operations."
      ]
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "docTitle",
        "text": "DELIVERY CONFIRMATION (OSA)",
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
        "type": "stampSignature"
      },
      {
        "type": "colorfulFooter"
      }
    ]
  },
  {
    "code": "DELIVERY_ORDER_REPORT_FORMAT_17",
    "formatNumber": 3,
    "name": "Delivery Order Report Format-17",
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
      "invoiceNo": "DO-CEXP190150",
      "partyLeft": {
        "title": "Client",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "NUNGAMBAKKAM CHENNAI TAMIL NADU 600084"
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
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "NUNGAMBAKKAM CHENNAI TAMIL NADU 600084 INDIA"
        ]
      },
      "fieldGrid": [
        {
          "k": "Job Ref.",
          "v": "CEXP190150 / 29-JAN-19"
        },
        {
          "k": "Shipment Ref.",
          "v": "B/EXP/19/0254 / 23-JAN-19"
        },
        {
          "k": "B/E NO.",
          "v": "—"
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
          "k": "Place of Delivery",
          "v": "JEBEL ALI, UNITED ARAB EMIRATES"
        },
        {
          "k": "BOE No",
          "v": "SBILLNO767 / 27-JAN-19"
        },
        {
          "k": "Declaration No.",
          "v": "DECNO9812345 / 26-JAN-19"
        }
      ],
      "tableHeaders": [
        "Container",
        "Type",
        "Pkgs",
        "Volume",
        "Net Weight",
        "Gross Weight",
        "Description",
        "Remarks"
      ],
      "tableRows": [
        [
          "ABCU9877666",
          "20' DC",
          "125",
          "24.000",
          "17,000.000",
          "18,000.000",
          "STC: VALVE MATERIALS FOR MACHINERY PARTS",
          "FREIGHT PREPAID"
        ]
      ],
      "remarks": "Received the above goods in good condition.",
      "termsLines": [
        "Truck No: ___________  Driver name: ___________",
        "Delivery Date: ___________  Cargo Received By: ___________"
      ]
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "docTitle",
        "text": "DELIVERY ORDER",
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
    "code": "DELIVERY_ORDER_REPORT_FORMAT_FCL_VIETNAM",
    "formatNumber": 4,
    "name": "Delivery Order FCL Vietnam",
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
      "invoiceNo": "DO-FCL-VN-411",
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
          "k": "Job Ref.",
          "v": "CEXP190150 / 29-JAN-19"
        },
        {
          "k": "Shipment Ref.",
          "v": "B/EXP/19/0254 / 23-JAN-19"
        },
        {
          "k": "B/E NO.",
          "v": "—"
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
          "k": "Place of Delivery",
          "v": "JEBEL ALI, UNITED ARAB EMIRATES"
        },
        {
          "k": "BOE No",
          "v": "SBILLNO767 / 27-JAN-19"
        },
        {
          "k": "Declaration No.",
          "v": "DECNO9812345 / 26-JAN-19"
        },
        {
          "k": "Service Type",
          "v": "FCL"
        },
        {
          "k": "Stamp",
          "v": "Official stamp on document"
        }
      ],
      "tableHeaders": [
        "Container",
        "Type",
        "Pkgs",
        "Volume",
        "Net Weight",
        "Gross Weight",
        "Description",
        "Remarks"
      ],
      "tableRows": [
        [
          "ABCU9877666",
          "20' DC",
          "125",
          "24.000",
          "17,000.000",
          "18,000.000",
          "STC: VALVE MATERIALS FOR MACHINERY PARTS",
          "FREIGHT PREPAID"
        ]
      ],
      "termsLines": [
        "Delivery Order — FCL Vietnam sample layout.",
        "Present original endorsed B/L and pay local charges prior to release."
      ]
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "docTitle",
        "text": "DELIVERY ORDER (FCL VIETNAM)",
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
    "code": "DELIVERY_ORDER_REPORT_FORMAT_LCL_VIETNAM_WITHOUT_STAMP",
    "formatNumber": 5,
    "name": "Delivery Order LCL Vietnam Without Stamp",
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
      "invoiceNo": "DO-LCL-VN-427",
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
          "k": "HBL No.",
          "v": "PLMAAJEA00081 / 28-JAN-19"
        },
        {
          "k": "Service Type",
          "v": "LCL"
        },
        {
          "k": "CFS",
          "v": "HO CHI MINH CFS"
        },
        {
          "k": "ETD / ETA",
          "v": "29-JAN-19 / 07-FEB-19"
        }
      ],
      "tableHeaders": [
        "Marks & Nos",
        "Description",
        "Pkgs",
        "Weight",
        "Volume"
      ],
      "tableRows": [
        [
          "CM MARKS",
          "STC: VALVE MATERIALS FOR MACHINERY PARTS",
          "125",
          "18,000.000",
          "24.000"
        ]
      ],
      "termsLines": [
        "LCL Vietnam — without stamp variant."
      ]
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "docTitle",
        "text": "DELIVERY ORDER (LCL VIETNAM)",
        "align": "center",
        "band": true
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
        "type": "termsBank"
      },
      {
        "type": "colorfulFooter"
      }
    ]
  },
  {
    "code": "FG_DELIVERY_NOTE",
    "formatNumber": 6,
    "name": "FG Delivery Note",
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
      "invoiceNo": "CEXP190150",
      "invoiceDate": "29-JAN-19",
      "fieldGrid": [
        {
          "k": "Date",
          "v": "29-JAN-19"
        },
        {
          "k": "M/S",
          "v": "AL NASER TRADING COMPANY LLC"
        },
        {
          "k": "Driver Name",
          "v": "—"
        },
        {
          "k": "Vehicle No.",
          "v": "—"
        },
        {
          "k": "Job Number",
          "v": "CEXP190150"
        },
        {
          "k": "Contact No.",
          "v": "—"
        }
      ],
      "tableHeaders": [
        "Qty",
        "Type Description",
        "Weight/Vol",
        "Remarks"
      ],
      "tableRows": [
        [
          "125",
          "STC: VALVE MATERIALS FOR MACHINERY PARTS FREIGHT PREPAID",
          "18000",
          "B/L No. PLMAAJEA00081"
        ]
      ],
      "termsLines": [
        "RECEIVED ABOVE SHIPMENT IN FULL & GOOD ORDER",
        "Receiver's Signature | Operation Dept. Remarks | Transporter Sign"
      ]
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "docTitle",
        "text": "DELIVERY NOTE",
        "align": "center",
        "band": true
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
        "type": "signatureRow"
      },
      {
        "type": "colorfulFooter"
      }
    ]
  },
  {
    "code": "FG_DELIVERY_NOTE_FORMAT_1",
    "formatNumber": 7,
    "name": "FG Delivery Note Format-1",
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
      "invoiceNo": "DN-F1-1337",
      "invoiceDate": "29-JAN-19",
      "partyLeft": {
        "title": "Consignee",
        "lines": [
          "AL NASER TRADING COMPANY LLC",
          "30 AL MAKTHOOM BUILDING NEAR MUBARAK CENTRE",
          "AL NABHA SHARJAH UAE"
        ]
      },
      "partyMid": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "NUNGAMBAKKAM CHENNAI TAMIL NADU 600084 INDIA"
        ]
      },
      "fieldGrid": [
        {
          "k": "Delivery Note No.",
          "v": "DN-1337"
        },
        {
          "k": "Job Ref.",
          "v": "CEXP190150"
        },
        {
          "k": "HBL",
          "v": "PLMAAJEA00081"
        }
      ],
      "tableHeaders": [
        "S.No",
        "Description",
        "Pkgs",
        "G.Wt",
        "Remarks"
      ],
      "tableRows": [
        [
          "1",
          "VALVE MATERIALS FOR MACHINERY PARTS",
          "125",
          "18,000.000",
          "—"
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
        "text": "DELIVERY NOTE — FORMAT 1",
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
        "type": "signatureRow"
      },
      {
        "type": "colorfulFooter"
      }
    ]
  },
  {
    "code": "FG_DELIVERY_NOTE_FORMAT_UK",
    "formatNumber": 8,
    "name": "FG Delivery Note Format UK",
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
      "invoiceNo": "DN-UK-1305",
      "invoiceDate": "29-JAN-19",
      "partyLeft": {
        "title": "Deliver To",
        "lines": [
          "AL NASER TRADING COMPANY LLC",
          "30 AL MAKTHOOM BUILDING NEAR MUBARAK CENTRE",
          "AL NABHA SHARJAH UAE"
        ]
      },
      "partyMid": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "NUNGAMBAKKAM CHENNAI TAMIL NADU 600084 INDIA"
        ]
      },
      "fieldGrid": [
        {
          "k": "Delivery Note Ref",
          "v": "UK-1305"
        },
        {
          "k": "Job",
          "v": "CEXP190150"
        },
        {
          "k": "VAT Reg",
          "v": "GB123456789"
        }
      ],
      "tableHeaders": [
        "Item",
        "Description",
        "Qty",
        "Weight"
      ],
      "tableRows": [
        [
          "1",
          "VALVE MATERIALS FOR MACHINERY PARTS",
          "125",
          "18,000 KGS"
        ]
      ],
      "termsLines": [
        "United Kingdom delivery note format."
      ]
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "docTitle",
        "text": "DELIVERY NOTE (UK)",
        "align": "center",
        "band": true
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
        "headerColor": "primary"
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
    "code": "FG_CONSIGNMENT_DELIVERY_NOTE",
    "formatNumber": 9,
    "name": "FG Consignment Delivery Note",
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
      "invoiceNo": "CDN-1379",
      "partyLeft": {
        "title": "Consignee",
        "lines": [
          "AL NASER TRADING COMPANY LLC",
          "30 AL MAKTHOOM BUILDING NEAR MUBARAK CENTRE",
          "AL NABHA SHARJAH UAE"
        ]
      },
      "partyMid": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "NUNGAMBAKKAM CHENNAI TAMIL NADU 600084 INDIA"
        ]
      },
      "fieldGrid": [
        {
          "k": "Consignment Note No.",
          "v": "CDN-1379"
        },
        {
          "k": "Job",
          "v": "CEXP190150"
        },
        {
          "k": "HBL",
          "v": "PLMAAJEA00081"
        }
      ],
      "tableHeaders": [
        "Consignment",
        "Goods",
        "Pkgs",
        "Weight"
      ],
      "tableRows": [
        [
          "1",
          "VALVE MATERIALS",
          "125",
          "18,000.000"
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
        "text": "CONSIGNMENT DELIVERY NOTE",
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
        "type": "signatureRow"
      },
      {
        "type": "colorfulFooter"
      }
    ]
  },
  {
    "code": "FG_CONSIGNMENT_DELIVERY_NOTE_FORMAT_1",
    "formatNumber": 10,
    "name": "FG Consignment Delivery Note Format-1",
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
      "invoiceNo": "CDN-F1-1445",
      "partyLeft": {
        "title": "Consignee",
        "lines": [
          "AL NASER TRADING COMPANY LLC",
          "30 AL MAKTHOOM BUILDING NEAR MUBARAK CENTRE",
          "AL NABHA SHARJAH UAE"
        ]
      },
      "partyMid": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "NUNGAMBAKKAM CHENNAI TAMIL NADU 600084 INDIA"
        ]
      },
      "fieldGrid": [
        {
          "k": "Note Ref.",
          "v": "CDN-F1-1445"
        },
        {
          "k": "Transporter",
          "v": "KingFisher Logistic"
        }
      ],
      "tableHeaders": [
        "Line",
        "Description",
        "Qty",
        "Condition"
      ],
      "tableRows": [
        [
          "1",
          "VALVE MATERIALS FOR MACHINERY PARTS",
          "125",
          "Good"
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
        "text": "CONSIGNMENT DELIVERY NOTE — FORMAT 1",
        "align": "center",
        "band": true
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
        "type": "signatureRow"
      },
      {
        "type": "colorfulFooter"
      }
    ]
  },
  {
    "code": "FG_DELIVERY_NOC_LETTER",
    "formatNumber": 11,
    "name": "FG Delivery NOC Letter",
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
      "invoiceNo": "NOC-1320",
      "invoiceDate": "29-JAN-19",
      "letterBody": "To Whom It May Concern,\n\nWe hereby confirm No Objection for release / delivery of the captioned shipment to the consignee named below, subject to presentation of all original documents and settlement of applicable charges.\n\nJob Ref: CEXP190150 | HBL: PLMAAJEA00081",
      "partyLeft": {
        "title": "Consignee",
        "lines": [
          "AL NASER TRADING COMPANY LLC",
          "30 AL MAKTHOOM BUILDING NEAR MUBARAK CENTRE",
          "AL NABHA SHARJAH UAE"
        ]
      },
      "partyMid": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "NUNGAMBAKKAM CHENNAI TAMIL NADU 600084 INDIA"
        ]
      },
      "fieldGrid": [
        {
          "k": "Reference",
          "v": "NOC-1320"
        },
        {
          "k": "Valid Until",
          "v": "15-FEB-19"
        }
      ],
      "termsLines": [
        "Authorized signatory — KingFisher Logistic"
      ]
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "docTitle",
        "text": "DELIVERY NOC LETTER",
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
        "type": "stampSignature"
      },
      {
        "type": "colorfulFooter"
      }
    ]
  },
  {
    "code": "DELIVERY_ORDER_REPORT_FORMAT_16",
    "formatNumber": 12,
    "name": "Delivery Order Report Format-16 (House)",
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
      "invoiceNo": "DO-CEXP190150",
      "partyLeft": {
        "title": "Client",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "NUNGAMBAKKAM CHENNAI TAMIL NADU 600084"
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
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "NUNGAMBAKKAM CHENNAI TAMIL NADU 600084 INDIA"
        ]
      },
      "fieldGrid": [
        {
          "k": "House B/L No.",
          "v": "PLMAAJEA00081 / 28-JAN-19"
        },
        {
          "k": "Master B/L No.",
          "v": "MBLCOPY87667888 / 28-JAN-19"
        },
        {
          "k": "Job Ref.",
          "v": "CEXP190150 / 29-JAN-19"
        },
        {
          "k": "Shipment Ref.",
          "v": "B/EXP/19/0254 / 23-JAN-19"
        },
        {
          "k": "B/E NO.",
          "v": "—"
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
        }
      ],
      "tableHeaders": [
        "Container",
        "Type",
        "Pkgs",
        "Volume",
        "Net Weight",
        "Gross Weight",
        "Description",
        "Remarks"
      ],
      "tableRows": [
        [
          "ABCU9877666",
          "20' DC",
          "125",
          "24.000",
          "17,000.000",
          "18,000.000",
          "STC: VALVE MATERIALS FOR MACHINERY PARTS",
          "FREIGHT PREPAID"
        ]
      ],
      "remarks": "House delivery order — release against house bill of lading.",
      "termsLines": [
        "House delivery order — release against house bill of lading."
      ]
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "docTitle",
        "text": "DELIVERY ORDER — HOUSE B/L",
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
    "code": "FG_DELIVERY_ORDER_ABU_DHABI",
    "formatNumber": 13,
    "name": "FG Delivery Order Abu Dhabi",
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
      "invoiceNo": "DO-CEXP190150",
      "partyLeft": {
        "title": "Client",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "NUNGAMBAKKAM CHENNAI TAMIL NADU 600084"
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
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "NUNGAMBAKKAM CHENNAI TAMIL NADU 600084 INDIA"
        ]
      },
      "fieldGrid": [
        {
          "k": "Place of Delivery",
          "v": "ABU DHABI, UAE"
        },
        {
          "k": "CFS / Terminal",
          "v": "KHALIFA PORT CFS"
        },
        {
          "k": "Job Ref.",
          "v": "CEXP190150 / 29-JAN-19"
        },
        {
          "k": "Shipment Ref.",
          "v": "B/EXP/19/0254 / 23-JAN-19"
        },
        {
          "k": "B/E NO.",
          "v": "—"
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
          "k": "Place of Delivery",
          "v": "JEBEL ALI, UNITED ARAB EMIRATES"
        },
        {
          "k": "BOE No",
          "v": "SBILLNO767 / 27-JAN-19"
        },
        {
          "k": "Declaration No.",
          "v": "DECNO9812345 / 26-JAN-19"
        }
      ],
      "tableHeaders": [
        "Container",
        "Type",
        "Pkgs",
        "Volume",
        "Net Weight",
        "Gross Weight",
        "Description",
        "Remarks"
      ],
      "tableRows": [
        [
          "ABCU9877666",
          "20' DC",
          "125",
          "24.000",
          "17,000.000",
          "18,000.000",
          "STC: VALVE MATERIALS FOR MACHINERY PARTS",
          "FREIGHT PREPAID"
        ]
      ],
      "remarks": "Abu Dhabi delivery order sample layout.",
      "termsLines": [
        "Abu Dhabi delivery order sample layout."
      ]
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "docTitle",
        "text": "DELIVERY ORDER — ABU DHABI",
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
        "type": "signatureRow"
      },
      {
        "type": "colorfulFooter"
      }
    ]
  },
  {
    "code": "DELIVERY_ORDER_AIR_JASPER_REPORT_FORMAT",
    "formatNumber": 14,
    "name": "Delivery Order AIR Jasper Report Format",
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
      "invoiceNo": "DO-CEXP190150",
      "partyLeft": {
        "title": "Client",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "NUNGAMBAKKAM CHENNAI TAMIL NADU 600084"
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
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "NUNGAMBAKKAM CHENNAI TAMIL NADU 600084 INDIA"
        ]
      },
      "fieldGrid": [
        {
          "k": "MAWB No.",
          "v": "176-12345678 / 28-JAN-19"
        },
        {
          "k": "HAWB No.",
          "v": "PLMAAJEA00081 / 28-JAN-19"
        },
        {
          "k": "Flight No.",
          "v": "EK-512 / 29-JAN-19"
        },
        {
          "k": "Origin",
          "v": "CHENNAI (MAA)"
        },
        {
          "k": "Destination",
          "v": "DUBAI (DXB)"
        },
        {
          "k": "ETD",
          "v": "29-JAN-19"
        },
        {
          "k": "ETA",
          "v": "29-JAN-19"
        },
        {
          "k": "Pieces",
          "v": "125"
        },
        {
          "k": "Gross Weight",
          "v": "18,000.000 KGS"
        },
        {
          "k": "Chargeable Weight",
          "v": "18,000.000 KGS"
        }
      ],
      "tableHeaders": [
        "HAWB",
        "Description",
        "Pkgs",
        "Weight",
        "Remarks"
      ],
      "tableRows": [
        [
          "PLMAAJEA00081",
          "STC: VALVE MATERIALS FOR MACHINERY PARTS",
          "125",
          "18,000.000",
          "—"
        ]
      ],
      "termsLines": [
        "Present endorsed documents and pay applicable charges."
      ]
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "docTitle",
        "text": "DELIVERY ORDER — AIR",
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
    "code": "FG_DELIVERY_ORDER_AIR_FORMAT_1",
    "formatNumber": 15,
    "name": "FG Delivery Order Air Format-1",
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
      "invoiceNo": "DO-CEXP190150",
      "partyLeft": {
        "title": "Client",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "NUNGAMBAKKAM CHENNAI TAMIL NADU 600084"
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
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "NUNGAMBAKKAM CHENNAI TAMIL NADU 600084 INDIA"
        ]
      },
      "fieldGrid": [
        {
          "k": "MAWB No.",
          "v": "176-12345678 / 28-JAN-19"
        },
        {
          "k": "HAWB No.",
          "v": "PLMAAJEA00081 / 28-JAN-19"
        },
        {
          "k": "Flight No.",
          "v": "EK-512 / 29-JAN-19"
        },
        {
          "k": "Origin",
          "v": "CHENNAI (MAA)"
        },
        {
          "k": "Destination",
          "v": "DUBAI (DXB)"
        },
        {
          "k": "ETD",
          "v": "29-JAN-19"
        },
        {
          "k": "ETA",
          "v": "29-JAN-19"
        },
        {
          "k": "Pieces",
          "v": "125"
        },
        {
          "k": "Gross Weight",
          "v": "18,000.000 KGS"
        },
        {
          "k": "Chargeable Weight",
          "v": "18,000.000 KGS"
        },
        {
          "k": "Format",
          "v": "Air Format-1"
        }
      ],
      "tableHeaders": [
        "Particulars",
        "Qty",
        "Weight",
        "Remarks"
      ],
      "tableRows": [
        [
          "VALVE MATERIALS FOR MACHINERY PARTS",
          "125",
          "18,000.000",
          "As per HAWB"
        ]
      ],
      "termsLines": [
        "Present endorsed documents and pay applicable charges."
      ]
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "docTitle",
        "text": "DELIVERY ORDER — AIR FORMAT 1",
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
  },
  {
    "code": "FG_DELIVERY_ORDER_AIR_FORMAT_2",
    "formatNumber": 16,
    "name": "FG Delivery Order Air Format-2",
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
      "invoiceNo": "DO-CEXP190150",
      "partyLeft": {
        "title": "Client",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "NUNGAMBAKKAM CHENNAI TAMIL NADU 600084"
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
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "NUNGAMBAKKAM CHENNAI TAMIL NADU 600084 INDIA"
        ]
      },
      "fieldGrid": [
        {
          "k": "MAWB No.",
          "v": "176-12345678 / 28-JAN-19"
        },
        {
          "k": "HAWB No.",
          "v": "PLMAAJEA00081 / 28-JAN-19"
        },
        {
          "k": "Flight No.",
          "v": "EK-512 / 29-JAN-19"
        },
        {
          "k": "Origin",
          "v": "CHENNAI (MAA)"
        },
        {
          "k": "Destination",
          "v": "DUBAI (DXB)"
        },
        {
          "k": "ETD",
          "v": "29-JAN-19"
        },
        {
          "k": "ETA",
          "v": "29-JAN-19"
        },
        {
          "k": "Pieces",
          "v": "125"
        },
        {
          "k": "Gross Weight",
          "v": "18,000.000 KGS"
        },
        {
          "k": "Chargeable Weight",
          "v": "18,000.000 KGS"
        },
        {
          "k": "Format",
          "v": "Air Format-2"
        }
      ],
      "tableHeaders": [
        "Line",
        "Goods Description",
        "Pkgs",
        "G.Wt"
      ],
      "tableRows": [
        [
          "1",
          "VALVE MATERIALS FOR MACHINERY PARTS",
          "125",
          "18,000.000"
        ]
      ],
      "termsLines": [
        "Present endorsed documents and pay applicable charges."
      ]
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "docTitle",
        "text": "DELIVERY ORDER — AIR FORMAT 2",
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
        "headerColor": "orange"
      },
      {
        "type": "termsBank"
      },
      {
        "type": "signatureRow"
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
    "code": "DELIVERY_ORDER_REPORT_FORMAT_8",
    "formatNumber": 17,
    "name": "Delivery Order Report Format-8 (FG SEA)",
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
      "invoiceNo": "DO-CEXP190150",
      "partyLeft": {
        "title": "Client",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "NUNGAMBAKKAM CHENNAI TAMIL NADU 600084"
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
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "NUNGAMBAKKAM CHENNAI TAMIL NADU 600084 INDIA"
        ]
      },
      "fieldGrid": [
        {
          "k": "Job Ref.",
          "v": "CEXP190150 / 29-JAN-19"
        },
        {
          "k": "Shipment Ref.",
          "v": "B/EXP/19/0254 / 23-JAN-19"
        },
        {
          "k": "B/E NO.",
          "v": "—"
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
          "k": "Place of Delivery",
          "v": "JEBEL ALI, UNITED ARAB EMIRATES"
        },
        {
          "k": "BOE No",
          "v": "SBILLNO767 / 27-JAN-19"
        },
        {
          "k": "Declaration No.",
          "v": "DECNO9812345 / 26-JAN-19"
        },
        {
          "k": "Layout",
          "v": "FG SEA Format-8"
        }
      ],
      "tableHeaders": [
        "Container",
        "Type",
        "Pkgs",
        "Volume",
        "Net Weight",
        "Gross Weight",
        "Description",
        "Remarks"
      ],
      "tableRows": [
        [
          "ABCU9877666",
          "20' DC",
          "125",
          "24.000",
          "17,000.000",
          "18,000.000",
          "STC: VALVE MATERIALS FOR MACHINERY PARTS",
          "FREIGHT PREPAID"
        ]
      ],
      "termsLines": [
        "Present endorsed documents and pay applicable charges."
      ]
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "docTitle",
        "text": "DELIVERY ORDER — SEA FORMAT 8",
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
    "code": "DELIVERY_ORDER_REPORT_FORMAT_10",
    "formatNumber": 18,
    "name": "Delivery Order Report Format-10",
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
      "invoiceNo": "DO-CEXP190150",
      "partyLeft": {
        "title": "Client",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "NUNGAMBAKKAM CHENNAI TAMIL NADU 600084"
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
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "NUNGAMBAKKAM CHENNAI TAMIL NADU 600084 INDIA"
        ]
      },
      "fieldGrid": [
        {
          "k": "Job Ref.",
          "v": "CEXP190150 / 29-JAN-19"
        },
        {
          "k": "Shipment Ref.",
          "v": "B/EXP/19/0254 / 23-JAN-19"
        },
        {
          "k": "B/E NO.",
          "v": "—"
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
          "k": "Place of Delivery",
          "v": "JEBEL ALI, UNITED ARAB EMIRATES"
        },
        {
          "k": "BOE No",
          "v": "SBILLNO767 / 27-JAN-19"
        },
        {
          "k": "Declaration No.",
          "v": "DECNO9812345 / 26-JAN-19"
        },
        {
          "k": "Format No.",
          "v": "10"
        }
      ],
      "tableHeaders": [
        "Container",
        "Type",
        "Pkgs",
        "Volume",
        "Net Weight",
        "Gross Weight",
        "Description",
        "Remarks"
      ],
      "tableRows": [
        [
          "ABCU9877666",
          "20' DC",
          "125",
          "24.000",
          "17,000.000",
          "18,000.000",
          "STC: VALVE MATERIALS FOR MACHINERY PARTS",
          "FREIGHT PREPAID"
        ]
      ],
      "termsLines": [
        "Present endorsed documents and pay applicable charges."
      ]
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "docTitle",
        "text": "DELIVERY ORDER — FORMAT 10",
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
    "code": "FG_DELIVERY_ORDER_SEA_FORMAT_10",
    "formatNumber": 19,
    "name": "FG Delivery Order SEA Format-10",
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
      "invoiceNo": "DO-CEXP190150",
      "partyLeft": {
        "title": "Client",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "NUNGAMBAKKAM CHENNAI TAMIL NADU 600084"
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
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "NUNGAMBAKKAM CHENNAI TAMIL NADU 600084 INDIA"
        ]
      },
      "fieldGrid": [
        {
          "k": "Job Ref.",
          "v": "CEXP190150 / 29-JAN-19"
        },
        {
          "k": "Shipment Ref.",
          "v": "B/EXP/19/0254 / 23-JAN-19"
        },
        {
          "k": "B/E NO.",
          "v": "—"
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
          "k": "Place of Delivery",
          "v": "JEBEL ALI, UNITED ARAB EMIRATES"
        },
        {
          "k": "BOE No",
          "v": "SBILLNO767 / 27-JAN-19"
        },
        {
          "k": "Declaration No.",
          "v": "DECNO9812345 / 26-JAN-19"
        },
        {
          "k": "Layout",
          "v": "FG SEA Format-10"
        }
      ],
      "tableHeaders": [
        "Container",
        "Type",
        "Pkgs",
        "Volume",
        "Net Weight",
        "Gross Weight",
        "Description",
        "Remarks"
      ],
      "tableRows": [
        [
          "ABCU9877666",
          "20' DC",
          "125",
          "24.000",
          "17,000.000",
          "18,000.000",
          "STC: VALVE MATERIALS FOR MACHINERY PARTS",
          "FREIGHT PREPAID"
        ]
      ],
      "termsLines": [
        "Present endorsed documents and pay applicable charges."
      ]
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "docTitle",
        "text": "DELIVERY ORDER — SEA FORMAT 10",
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
        "type": "signatureRow"
      },
      {
        "type": "colorfulFooter"
      }
    ]
  },
  {
    "code": "FG_DELIVERY_ORDER_SEA_FORMAT_3",
    "formatNumber": 20,
    "name": "FG Delivery Order SEA Format-3",
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
      "invoiceNo": "DO-CEXP190150",
      "partyLeft": {
        "title": "Client",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "NUNGAMBAKKAM CHENNAI TAMIL NADU 600084"
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
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "NUNGAMBAKKAM CHENNAI TAMIL NADU 600084 INDIA"
        ]
      },
      "fieldGrid": [
        {
          "k": "Job Ref.",
          "v": "CEXP190150 / 29-JAN-19"
        },
        {
          "k": "Shipment Ref.",
          "v": "B/EXP/19/0254 / 23-JAN-19"
        },
        {
          "k": "B/E NO.",
          "v": "—"
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
          "k": "Place of Delivery",
          "v": "JEBEL ALI, UNITED ARAB EMIRATES"
        },
        {
          "k": "BOE No",
          "v": "SBILLNO767 / 27-JAN-19"
        },
        {
          "k": "Declaration No.",
          "v": "DECNO9812345 / 26-JAN-19"
        },
        {
          "k": "Layout",
          "v": "FG SEA Format-3"
        }
      ],
      "tableHeaders": [
        "Container",
        "Type",
        "Pkgs",
        "Volume",
        "Net Weight",
        "Gross Weight",
        "Description",
        "Remarks"
      ],
      "tableRows": [
        [
          "ABCU9877666",
          "20' DC",
          "125",
          "24.000",
          "17,000.000",
          "18,000.000",
          "STC: VALVE MATERIALS FOR MACHINERY PARTS",
          "FREIGHT PREPAID"
        ]
      ],
      "termsLines": [
        "Present endorsed documents and pay applicable charges."
      ]
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "docTitle",
        "text": "DELIVERY ORDER — SEA FORMAT 3",
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
    "code": "FG_DELIVERY_ORDER_SEA_FORMAT_5",
    "formatNumber": 21,
    "name": "FG Delivery Order SEA Format-5",
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
      "invoiceNo": "DO-CEXP190150",
      "partyLeft": {
        "title": "Client",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "NUNGAMBAKKAM CHENNAI TAMIL NADU 600084"
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
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "NUNGAMBAKKAM CHENNAI TAMIL NADU 600084 INDIA"
        ]
      },
      "fieldGrid": [
        {
          "k": "Job Ref.",
          "v": "CEXP190150 / 29-JAN-19"
        },
        {
          "k": "Shipment Ref.",
          "v": "B/EXP/19/0254 / 23-JAN-19"
        },
        {
          "k": "B/E NO.",
          "v": "—"
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
          "k": "Place of Delivery",
          "v": "JEBEL ALI, UNITED ARAB EMIRATES"
        },
        {
          "k": "BOE No",
          "v": "SBILLNO767 / 27-JAN-19"
        },
        {
          "k": "Declaration No.",
          "v": "DECNO9812345 / 26-JAN-19"
        },
        {
          "k": "Layout",
          "v": "FG SEA Format-5"
        }
      ],
      "tableHeaders": [
        "Container",
        "Type",
        "Pkgs",
        "Volume",
        "Net Weight",
        "Gross Weight",
        "Description",
        "Remarks"
      ],
      "tableRows": [
        [
          "ABCU9877666",
          "20' DC",
          "125",
          "24.000",
          "17,000.000",
          "18,000.000",
          "STC: VALVE MATERIALS FOR MACHINERY PARTS",
          "FREIGHT PREPAID"
        ]
      ],
      "termsLines": [
        "Present endorsed documents and pay applicable charges."
      ]
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "docTitle",
        "text": "DELIVERY ORDER — SEA FORMAT 5",
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
    "code": "FG_DELIVERY_ORDER_SEA_FORMAT_6",
    "formatNumber": 22,
    "name": "FG Delivery Order SEA Format-6",
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
      "invoiceNo": "DO-CEXP190150",
      "partyLeft": {
        "title": "Client",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "NUNGAMBAKKAM CHENNAI TAMIL NADU 600084"
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
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "NUNGAMBAKKAM CHENNAI TAMIL NADU 600084 INDIA"
        ]
      },
      "fieldGrid": [
        {
          "k": "Job Ref.",
          "v": "CEXP190150 / 29-JAN-19"
        },
        {
          "k": "Shipment Ref.",
          "v": "B/EXP/19/0254 / 23-JAN-19"
        },
        {
          "k": "B/E NO.",
          "v": "—"
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
          "k": "Place of Delivery",
          "v": "JEBEL ALI, UNITED ARAB EMIRATES"
        },
        {
          "k": "BOE No",
          "v": "SBILLNO767 / 27-JAN-19"
        },
        {
          "k": "Declaration No.",
          "v": "DECNO9812345 / 26-JAN-19"
        },
        {
          "k": "Layout",
          "v": "FG SEA Format-6"
        }
      ],
      "tableHeaders": [
        "Container",
        "Type",
        "Pkgs",
        "Volume",
        "Net Weight",
        "Gross Weight",
        "Description",
        "Remarks"
      ],
      "tableRows": [
        [
          "ABCU9877666",
          "20' DC",
          "125",
          "24.000",
          "17,000.000",
          "18,000.000",
          "STC: VALVE MATERIALS FOR MACHINERY PARTS",
          "FREIGHT PREPAID"
        ]
      ],
      "termsLines": [
        "Present endorsed documents and pay applicable charges."
      ]
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "docTitle",
        "text": "DELIVERY ORDER — SEA FORMAT 6",
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
        "type": "signatureRow"
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
    "code": "FG_DELIVERY_ORDER_SEA_FORMAT_7",
    "formatNumber": 23,
    "name": "FG Delivery Order SEA Format-7",
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
      "invoiceNo": "DO-CEXP190150",
      "partyLeft": {
        "title": "Client",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "NUNGAMBAKKAM CHENNAI TAMIL NADU 600084"
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
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "NUNGAMBAKKAM CHENNAI TAMIL NADU 600084 INDIA"
        ]
      },
      "fieldGrid": [
        {
          "k": "Job Ref.",
          "v": "CEXP190150 / 29-JAN-19"
        },
        {
          "k": "Shipment Ref.",
          "v": "B/EXP/19/0254 / 23-JAN-19"
        },
        {
          "k": "B/E NO.",
          "v": "—"
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
          "k": "Place of Delivery",
          "v": "JEBEL ALI, UNITED ARAB EMIRATES"
        },
        {
          "k": "BOE No",
          "v": "SBILLNO767 / 27-JAN-19"
        },
        {
          "k": "Declaration No.",
          "v": "DECNO9812345 / 26-JAN-19"
        },
        {
          "k": "Layout",
          "v": "FG SEA Format-7"
        }
      ],
      "tableHeaders": [
        "Container",
        "Type",
        "Pkgs",
        "Volume",
        "Net Weight",
        "Gross Weight",
        "Description",
        "Remarks"
      ],
      "tableRows": [
        [
          "ABCU9877666",
          "20' DC",
          "125",
          "24.000",
          "17,000.000",
          "18,000.000",
          "STC: VALVE MATERIALS FOR MACHINERY PARTS",
          "FREIGHT PREPAID"
        ]
      ],
      "termsLines": [
        "Present endorsed documents and pay applicable charges."
      ]
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "docTitle",
        "text": "DELIVERY ORDER — SEA FORMAT 7",
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
    "code": "FG_DELIVERY_ORDER_FORMAT_8",
    "formatNumber": 24,
    "name": "FG Delivery Order Format-8",
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
      "invoiceNo": "DO-CEXP190150",
      "partyLeft": {
        "title": "Client",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "NUNGAMBAKKAM CHENNAI TAMIL NADU 600084"
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
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "NUNGAMBAKKAM CHENNAI TAMIL NADU 600084 INDIA"
        ]
      },
      "fieldGrid": [
        {
          "k": "Job Ref.",
          "v": "CEXP190150 / 29-JAN-19"
        },
        {
          "k": "Shipment Ref.",
          "v": "B/EXP/19/0254 / 23-JAN-19"
        },
        {
          "k": "B/E NO.",
          "v": "—"
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
          "k": "Place of Delivery",
          "v": "JEBEL ALI, UNITED ARAB EMIRATES"
        },
        {
          "k": "BOE No",
          "v": "SBILLNO767 / 27-JAN-19"
        },
        {
          "k": "Declaration No.",
          "v": "DECNO9812345 / 26-JAN-19"
        },
        {
          "k": "Format No.",
          "v": "8 (FG sample 777)"
        }
      ],
      "tableHeaders": [
        "Container",
        "Type",
        "Pkgs",
        "Volume",
        "Net Weight",
        "Gross Weight",
        "Description",
        "Remarks"
      ],
      "tableRows": [
        [
          "ABCU9877666",
          "20' DC",
          "125",
          "24.000",
          "17,000.000",
          "18,000.000",
          "STC: VALVE MATERIALS FOR MACHINERY PARTS",
          "FREIGHT PREPAID"
        ]
      ],
      "termsLines": [
        "Present endorsed documents and pay applicable charges."
      ]
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "docTitle",
        "text": "DELIVERY ORDER — FORMAT 8",
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
    "code": "DELIVERY_ORDER_REPORT_FORMAT_9",
    "formatNumber": 25,
    "name": "Delivery Order Report Format-9",
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
      "invoiceNo": "DO-CEXP190150",
      "partyLeft": {
        "title": "Client",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "NUNGAMBAKKAM CHENNAI TAMIL NADU 600084"
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
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "NUNGAMBAKKAM CHENNAI TAMIL NADU 600084 INDIA"
        ]
      },
      "fieldGrid": [
        {
          "k": "Job Ref.",
          "v": "CEXP190150 / 29-JAN-19"
        },
        {
          "k": "Shipment Ref.",
          "v": "B/EXP/19/0254 / 23-JAN-19"
        },
        {
          "k": "B/E NO.",
          "v": "—"
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
          "k": "Place of Delivery",
          "v": "JEBEL ALI, UNITED ARAB EMIRATES"
        },
        {
          "k": "BOE No",
          "v": "SBILLNO767 / 27-JAN-19"
        },
        {
          "k": "Declaration No.",
          "v": "DECNO9812345 / 26-JAN-19"
        },
        {
          "k": "Format No.",
          "v": "9"
        }
      ],
      "tableHeaders": [
        "Container",
        "Type",
        "Pkgs",
        "Volume",
        "Net Weight",
        "Gross Weight",
        "Description",
        "Remarks"
      ],
      "tableRows": [
        [
          "ABCU9877666",
          "20' DC",
          "125",
          "24.000",
          "17,000.000",
          "18,000.000",
          "STC: VALVE MATERIALS FOR MACHINERY PARTS",
          "FREIGHT PREPAID"
        ]
      ],
      "termsLines": [
        "Present endorsed documents and pay applicable charges."
      ]
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "docTitle",
        "text": "DELIVERY ORDER — FORMAT 9",
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
        "type": "signatureRow"
      },
      {
        "type": "colorfulFooter"
      }
    ]
  },
  {
    "code": "DELIVERY_ORDER_REPORT_FORMAT_13",
    "formatNumber": 26,
    "name": "Delivery Order Report Format-13",
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
      "invoiceNo": "DO-CEXP190150",
      "partyLeft": {
        "title": "Client",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "NUNGAMBAKKAM CHENNAI TAMIL NADU 600084"
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
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "NUNGAMBAKKAM CHENNAI TAMIL NADU 600084 INDIA"
        ]
      },
      "fieldGrid": [
        {
          "k": "Job Ref.",
          "v": "CEXP190150 / 29-JAN-19"
        },
        {
          "k": "Shipment Ref.",
          "v": "B/EXP/19/0254 / 23-JAN-19"
        },
        {
          "k": "B/E NO.",
          "v": "—"
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
          "k": "Place of Delivery",
          "v": "JEBEL ALI, UNITED ARAB EMIRATES"
        },
        {
          "k": "BOE No",
          "v": "SBILLNO767 / 27-JAN-19"
        },
        {
          "k": "Declaration No.",
          "v": "DECNO9812345 / 26-JAN-19"
        },
        {
          "k": "Format No.",
          "v": "13"
        }
      ],
      "tableHeaders": [
        "Container",
        "Type",
        "Pkgs",
        "Volume",
        "Net Weight",
        "Gross Weight",
        "Description",
        "Remarks"
      ],
      "tableRows": [
        [
          "ABCU9877666",
          "20' DC",
          "125",
          "24.000",
          "17,000.000",
          "18,000.000",
          "STC: VALVE MATERIALS FOR MACHINERY PARTS",
          "FREIGHT PREPAID"
        ]
      ],
      "termsLines": [
        "Present endorsed documents and pay applicable charges."
      ]
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "docTitle",
        "text": "DELIVERY ORDER — FORMAT 13",
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
    "code": "DELIVERY_ORDER_REPORT_FORMAT_14",
    "formatNumber": 27,
    "name": "Delivery Order Report Format-14",
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
      "invoiceNo": "DO-CEXP190150",
      "partyLeft": {
        "title": "Client",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "NUNGAMBAKKAM CHENNAI TAMIL NADU 600084"
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
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "NUNGAMBAKKAM CHENNAI TAMIL NADU 600084 INDIA"
        ]
      },
      "fieldGrid": [
        {
          "k": "Job Ref.",
          "v": "CEXP190150 / 29-JAN-19"
        },
        {
          "k": "Shipment Ref.",
          "v": "B/EXP/19/0254 / 23-JAN-19"
        },
        {
          "k": "B/E NO.",
          "v": "—"
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
          "k": "Place of Delivery",
          "v": "JEBEL ALI, UNITED ARAB EMIRATES"
        },
        {
          "k": "BOE No",
          "v": "SBILLNO767 / 27-JAN-19"
        },
        {
          "k": "Declaration No.",
          "v": "DECNO9812345 / 26-JAN-19"
        },
        {
          "k": "Format No.",
          "v": "14"
        }
      ],
      "tableHeaders": [
        "Container",
        "Type",
        "Pkgs",
        "Volume",
        "Net Weight",
        "Gross Weight",
        "Description",
        "Remarks"
      ],
      "tableRows": [
        [
          "ABCU9877666",
          "20' DC",
          "125",
          "24.000",
          "17,000.000",
          "18,000.000",
          "STC: VALVE MATERIALS FOR MACHINERY PARTS",
          "FREIGHT PREPAID"
        ]
      ],
      "termsLines": [
        "Present endorsed documents and pay applicable charges."
      ]
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "docTitle",
        "text": "DELIVERY ORDER — FORMAT 14",
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
    "code": "DELIVERY_ORDER_REPORT_FORMAT_15",
    "formatNumber": 28,
    "name": "Delivery Order Report Format-15",
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
      "invoiceNo": "DO-CEXP190150",
      "partyLeft": {
        "title": "Client",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "NUNGAMBAKKAM CHENNAI TAMIL NADU 600084"
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
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "NUNGAMBAKKAM CHENNAI TAMIL NADU 600084 INDIA"
        ]
      },
      "fieldGrid": [
        {
          "k": "Job Ref.",
          "v": "CEXP190150 / 29-JAN-19"
        },
        {
          "k": "Shipment Ref.",
          "v": "B/EXP/19/0254 / 23-JAN-19"
        },
        {
          "k": "B/E NO.",
          "v": "—"
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
          "k": "Place of Delivery",
          "v": "JEBEL ALI, UNITED ARAB EMIRATES"
        },
        {
          "k": "BOE No",
          "v": "SBILLNO767 / 27-JAN-19"
        },
        {
          "k": "Declaration No.",
          "v": "DECNO9812345 / 26-JAN-19"
        },
        {
          "k": "Format No.",
          "v": "15"
        }
      ],
      "tableHeaders": [
        "Container",
        "Type",
        "Pkgs",
        "Volume",
        "Net Weight",
        "Gross Weight",
        "Description",
        "Remarks"
      ],
      "tableRows": [
        [
          "ABCU9877666",
          "20' DC",
          "125",
          "24.000",
          "17,000.000",
          "18,000.000",
          "STC: VALVE MATERIALS FOR MACHINERY PARTS",
          "FREIGHT PREPAID"
        ]
      ],
      "termsLines": [
        "Present endorsed documents and pay applicable charges."
      ]
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "docTitle",
        "text": "DELIVERY ORDER — FORMAT 15",
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
        "type": "signatureRow"
      },
      {
        "type": "colorfulFooter"
      }
    ]
  },
  {
    "code": "FG_DELIVERY_ORDER_FORMAT_16",
    "formatNumber": 29,
    "name": "FG Delivery Order Format-16",
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
      "invoiceNo": "DO-CEXP190150",
      "partyLeft": {
        "title": "Client",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "NUNGAMBAKKAM CHENNAI TAMIL NADU 600084"
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
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "NUNGAMBAKKAM CHENNAI TAMIL NADU 600084 INDIA"
        ]
      },
      "fieldGrid": [
        {
          "k": "Job Ref.",
          "v": "CEXP190150 / 29-JAN-19"
        },
        {
          "k": "Shipment Ref.",
          "v": "B/EXP/19/0254 / 23-JAN-19"
        },
        {
          "k": "B/E NO.",
          "v": "—"
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
          "k": "Place of Delivery",
          "v": "JEBEL ALI, UNITED ARAB EMIRATES"
        },
        {
          "k": "BOE No",
          "v": "SBILLNO767 / 27-JAN-19"
        },
        {
          "k": "Declaration No.",
          "v": "DECNO9812345 / 26-JAN-19"
        },
        {
          "k": "Format No.",
          "v": "16 (FG sample 1306)"
        }
      ],
      "tableHeaders": [
        "Container",
        "Type",
        "Pkgs",
        "Volume",
        "Net Weight",
        "Gross Weight",
        "Description",
        "Remarks"
      ],
      "tableRows": [
        [
          "ABCU9877666",
          "20' DC",
          "125",
          "24.000",
          "17,000.000",
          "18,000.000",
          "STC: VALVE MATERIALS FOR MACHINERY PARTS",
          "FREIGHT PREPAID"
        ]
      ],
      "termsLines": [
        "Present endorsed documents and pay applicable charges."
      ]
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "docTitle",
        "text": "DELIVERY ORDER — FORMAT 16",
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
    "code": "DELIVERY_ORDER_REPORT_FORMAT_18",
    "formatNumber": 30,
    "name": "Delivery Order Report Format-18",
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
      "invoiceNo": "DO-CEXP190150",
      "partyLeft": {
        "title": "Client",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "NUNGAMBAKKAM CHENNAI TAMIL NADU 600084"
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
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "NUNGAMBAKKAM CHENNAI TAMIL NADU 600084 INDIA"
        ]
      },
      "fieldGrid": [
        {
          "k": "Job Ref.",
          "v": "CEXP190150 / 29-JAN-19"
        },
        {
          "k": "Shipment Ref.",
          "v": "B/EXP/19/0254 / 23-JAN-19"
        },
        {
          "k": "B/E NO.",
          "v": "—"
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
          "k": "Place of Delivery",
          "v": "JEBEL ALI, UNITED ARAB EMIRATES"
        },
        {
          "k": "BOE No",
          "v": "SBILLNO767 / 27-JAN-19"
        },
        {
          "k": "Declaration No.",
          "v": "DECNO9812345 / 26-JAN-19"
        },
        {
          "k": "Format No.",
          "v": "18"
        }
      ],
      "tableHeaders": [
        "Container",
        "Type",
        "Pkgs",
        "Volume",
        "Net Weight",
        "Gross Weight",
        "Description",
        "Remarks"
      ],
      "tableRows": [
        [
          "ABCU9877666",
          "20' DC",
          "125",
          "24.000",
          "17,000.000",
          "18,000.000",
          "STC: VALVE MATERIALS FOR MACHINERY PARTS",
          "FREIGHT PREPAID"
        ]
      ],
      "termsLines": [
        "Present endorsed documents and pay applicable charges."
      ]
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "docTitle",
        "text": "DELIVERY ORDER — FORMAT 18",
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
        "headerColor": "accent"
      },
      {
        "type": "termsBank"
      },
      {
        "type": "signatureRow"
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
    "code": "FG_DELIVERY_ORDER_SEA_FORMAT_1",
    "formatNumber": 31,
    "name": "FG Delivery Order SEA Format-1",
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
      "invoiceNo": "DO-CEXP190150",
      "partyLeft": {
        "title": "Client",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "NUNGAMBAKKAM CHENNAI TAMIL NADU 600084"
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
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "NUNGAMBAKKAM CHENNAI TAMIL NADU 600084 INDIA"
        ]
      },
      "fieldGrid": [
        {
          "k": "Job Ref.",
          "v": "CEXP190150 / 29-JAN-19"
        },
        {
          "k": "Shipment Ref.",
          "v": "B/EXP/19/0254 / 23-JAN-19"
        },
        {
          "k": "B/E NO.",
          "v": "—"
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
          "k": "Place of Delivery",
          "v": "JEBEL ALI, UNITED ARAB EMIRATES"
        },
        {
          "k": "BOE No",
          "v": "SBILLNO767 / 27-JAN-19"
        },
        {
          "k": "Declaration No.",
          "v": "DECNO9812345 / 26-JAN-19"
        },
        {
          "k": "Layout",
          "v": "FG SEA Format-1"
        }
      ],
      "tableHeaders": [
        "Container",
        "Type",
        "Pkgs",
        "Volume",
        "Net Weight",
        "Gross Weight",
        "Description",
        "Remarks"
      ],
      "tableRows": [
        [
          "ABCU9877666",
          "20' DC",
          "125",
          "24.000",
          "17,000.000",
          "18,000.000",
          "STC: VALVE MATERIALS FOR MACHINERY PARTS",
          "FREIGHT PREPAID"
        ]
      ],
      "termsLines": [
        "Present endorsed documents and pay applicable charges."
      ]
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "docTitle",
        "text": "DELIVERY ORDER — SEA FORMAT 1",
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
        "type": "signatureRow"
      },
      {
        "type": "colorfulFooter"
      }
    ]
  },
  {
    "code": "DELIVERY_ORDER_REPORT_FORMAT_3",
    "formatNumber": 32,
    "name": "Delivery Order Report Format-3",
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
      "invoiceNo": "DO-CEXP190150",
      "partyLeft": {
        "title": "Client",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "NUNGAMBAKKAM CHENNAI TAMIL NADU 600084"
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
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "NUNGAMBAKKAM CHENNAI TAMIL NADU 600084 INDIA"
        ]
      },
      "fieldGrid": [
        {
          "k": "Job Ref.",
          "v": "CEXP190150 / 29-JAN-19"
        },
        {
          "k": "Shipment Ref.",
          "v": "B/EXP/19/0254 / 23-JAN-19"
        },
        {
          "k": "B/E NO.",
          "v": "—"
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
          "k": "Place of Delivery",
          "v": "JEBEL ALI, UNITED ARAB EMIRATES"
        },
        {
          "k": "BOE No",
          "v": "SBILLNO767 / 27-JAN-19"
        },
        {
          "k": "Declaration No.",
          "v": "DECNO9812345 / 26-JAN-19"
        },
        {
          "k": "Format No.",
          "v": "3"
        }
      ],
      "tableHeaders": [
        "Container",
        "Type",
        "Pkgs",
        "Volume",
        "Net Weight",
        "Gross Weight",
        "Description",
        "Remarks"
      ],
      "tableRows": [
        [
          "ABCU9877666",
          "20' DC",
          "125",
          "24.000",
          "17,000.000",
          "18,000.000",
          "STC: VALVE MATERIALS FOR MACHINERY PARTS",
          "FREIGHT PREPAID"
        ]
      ],
      "termsLines": [
        "Present endorsed documents and pay applicable charges."
      ]
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "docTitle",
        "text": "DELIVERY ORDER — FORMAT 3",
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
    "code": "FG_DELIVERY_ORDER_AIR_USA",
    "formatNumber": 33,
    "name": "FG Delivery Order Air USA",
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
      "invoiceNo": "DO-CEXP190150",
      "letterBody": "USA air delivery order — present ID and pay applicable terminal charges.",
      "partyLeft": {
        "title": "Client",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "NUNGAMBAKKAM CHENNAI TAMIL NADU 600084"
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
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "NUNGAMBAKKAM CHENNAI TAMIL NADU 600084 INDIA"
        ]
      },
      "fieldGrid": [
        {
          "k": "MAWB No.",
          "v": "176-12345678 / 28-JAN-19"
        },
        {
          "k": "HAWB No.",
          "v": "PLMAAJEA00081 / 28-JAN-19"
        },
        {
          "k": "Flight No.",
          "v": "EK-512 / 29-JAN-19"
        },
        {
          "k": "Origin",
          "v": "CHENNAI (MAA)"
        },
        {
          "k": "Destination",
          "v": "DUBAI (DXB)"
        },
        {
          "k": "ETD",
          "v": "29-JAN-19"
        },
        {
          "k": "ETA",
          "v": "29-JAN-19"
        },
        {
          "k": "Pieces",
          "v": "125"
        },
        {
          "k": "Gross Weight",
          "v": "18,000.000 KGS"
        },
        {
          "k": "Chargeable Weight",
          "v": "18,000.000 KGS"
        },
        {
          "k": "Region",
          "v": "USA"
        },
        {
          "k": "IATA / Agent",
          "v": "USA Import Agent"
        }
      ],
      "tableHeaders": [
        "HAWB",
        "Description",
        "Pkgs",
        "Weight",
        "Remarks"
      ],
      "tableRows": [
        [
          "PLMAAJEA00081",
          "STC: VALVE MATERIALS FOR MACHINERY PARTS",
          "125",
          "18,000.000",
          "USA air DO"
        ]
      ],
      "termsLines": [
        "Present endorsed documents and pay applicable charges."
      ]
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "docTitle",
        "text": "DELIVERY ORDER — AIR USA",
        "align": "center",
        "band": true
      },
      {
        "type": "letterBody"
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
  },
  {
    "code": "FG_DELIVERY_ORDER_FOR_TRUCKER",
    "formatNumber": 34,
    "name": "FG Delivery Order For Trucker",
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
      "invoiceNo": "DO-CEXP190150",
      "partyLeft": {
        "title": "Client",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "NUNGAMBAKKAM CHENNAI TAMIL NADU 600084"
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
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "NUNGAMBAKKAM CHENNAI TAMIL NADU 600084 INDIA"
        ]
      },
      "fieldGrid": [
        {
          "k": "Truck No.",
          "v": "DXB-98765"
        },
        {
          "k": "Driver Name",
          "v": "Ahmed Hassan"
        },
        {
          "k": "Contact",
          "v": "+971 50 000 0000"
        },
        {
          "k": "Job Ref.",
          "v": "CEXP190150"
        },
        {
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "Pickup / Delivery",
          "v": "JEBEL ALI CFS → Consignee"
        }
      ],
      "tableHeaders": [
        "Qty",
        "Description",
        "Weight",
        "Remarks"
      ],
      "tableRows": [
        [
          "125",
          "VALVE MATERIALS FOR MACHINERY PARTS",
          "18,000.000",
          "Trucker release copy"
        ]
      ],
      "remarks": "For transporter use — present at gate with valid ID.",
      "termsLines": [
        "For transporter use — present at gate with valid ID."
      ]
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "docTitle",
        "text": "DELIVERY ORDER — TRUCKER COPY",
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
    "code": "FG_E_DELIVERY_ORDER",
    "formatNumber": 35,
    "name": "FG E-Delivery Order",
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
      "invoiceNo": "DO-CEXP190150",
      "letterBody": "Electronic delivery order — valid when released in Fresa Gold with digital authorization.",
      "partyLeft": {
        "title": "Client",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "NUNGAMBAKKAM CHENNAI TAMIL NADU 600084"
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
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "NUNGAMBAKKAM CHENNAI TAMIL NADU 600084 INDIA"
        ]
      },
      "fieldGrid": [
        {
          "k": "e-DO Ref.",
          "v": "EDO-837"
        },
        {
          "k": "Job Ref.",
          "v": "CEXP190150"
        },
        {
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "Release Token",
          "v": "QR / OTP verified"
        }
      ],
      "tableHeaders": [
        "Container",
        "Type",
        "Pkgs",
        "Volume",
        "Net Weight",
        "Gross Weight",
        "Description",
        "Remarks"
      ],
      "tableRows": [
        [
          "ABCU9877666",
          "20' DC",
          "125",
          "24.000",
          "17,000.000",
          "18,000.000",
          "STC: VALVE MATERIALS FOR MACHINERY PARTS",
          "FREIGHT PREPAID"
        ]
      ],
      "termsLines": [
        "Present endorsed documents and pay applicable charges."
      ]
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "docTitle",
        "text": "E-DELIVERY ORDER",
        "align": "center",
        "band": true
      },
      {
        "type": "letterBody"
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
    "code": "FG_E_DELIVERY_ORDER_SEA_FORMAT_1",
    "formatNumber": 36,
    "name": "FG E-Delivery Order SEA Format-1",
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
      "invoiceNo": "DO-CEXP190150",
      "partyLeft": {
        "title": "Client",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "NUNGAMBAKKAM CHENNAI TAMIL NADU 600084"
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
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "NUNGAMBAKKAM CHENNAI TAMIL NADU 600084 INDIA"
        ]
      },
      "fieldGrid": [
        {
          "k": "Layout",
          "v": "E-DO SEA Format-1"
        },
        {
          "k": "Job Ref.",
          "v": "CEXP190150"
        },
        {
          "k": "Job Ref.",
          "v": "CEXP190150 / 29-JAN-19"
        },
        {
          "k": "Shipment Ref.",
          "v": "B/EXP/19/0254 / 23-JAN-19"
        },
        {
          "k": "B/E NO.",
          "v": "—"
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
          "k": "ETD",
          "v": "29-JAN-19"
        }
      ],
      "tableHeaders": [
        "Container",
        "Type",
        "Pkgs",
        "Volume",
        "Net Weight",
        "Gross Weight",
        "Description",
        "Remarks"
      ],
      "tableRows": [
        [
          "ABCU9877666",
          "20' DC",
          "125",
          "24.000",
          "17,000.000",
          "18,000.000",
          "STC: VALVE MATERIALS FOR MACHINERY PARTS",
          "FREIGHT PREPAID"
        ]
      ],
      "termsLines": [
        "Present endorsed documents and pay applicable charges."
      ]
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "docTitle",
        "text": "E-DELIVERY ORDER — SEA FORMAT 1",
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
    "code": "FG_EXPORT_DELIVERY_ORDER",
    "formatNumber": 37,
    "name": "FG Export Delivery Order",
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
      "invoiceNo": "DO-CEXP190150",
      "partyLeft": {
        "title": "Client",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "NUNGAMBAKKAM CHENNAI TAMIL NADU 600084"
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
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "NUNGAMBAKKAM CHENNAI TAMIL NADU 600084 INDIA"
        ]
      },
      "fieldGrid": [
        {
          "k": "Shipment Type",
          "v": "EXPORT"
        },
        {
          "k": "Job Ref.",
          "v": "CEXP190150"
        },
        {
          "k": "SB No.",
          "v": "SBILLNO767 / 27-JAN-19"
        },
        {
          "k": "B/E NO.",
          "v": "—"
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
          "v": "EVERGREEN MARINE / 9887"
        },
        {
          "k": "Port of Loading",
          "v": "CHENNAI (EX MADRAS), INDIA"
        }
      ],
      "tableHeaders": [
        "Container",
        "Type",
        "Pkgs",
        "Volume",
        "Net Weight",
        "Gross Weight",
        "Description",
        "Remarks"
      ],
      "tableRows": [
        [
          "ABCU9877666",
          "20' DC",
          "125",
          "24.000",
          "17,000.000",
          "18,000.000",
          "STC: VALVE MATERIALS FOR MACHINERY PARTS",
          "FREIGHT PREPAID"
        ]
      ],
      "remarks": "Export delivery order — customs export release.",
      "termsLines": [
        "Export delivery order — customs export release."
      ]
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "docTitle",
        "text": "EXPORT DELIVERY ORDER",
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
        "type": "signatureRow"
      },
      {
        "type": "colorfulFooter"
      }
    ]
  },
  {
    "code": "FG_NOTICE_OF_DELIVERY",
    "formatNumber": 38,
    "name": "FG Notice Of Delivery",
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
      "invoiceNo": "NOD-905",
      "invoiceDate": "08-FEB-19",
      "letterBody": "Notice of Delivery\n\nPlease be advised that the captioned shipment is ready for delivery / has been scheduled for delivery to the consignee address below.",
      "partyLeft": {
        "title": "Consignee",
        "lines": [
          "AL NASER TRADING COMPANY LLC",
          "30 AL MAKTHOOM BUILDING NEAR MUBARAK CENTRE",
          "AL NABHA SHARJAH UAE"
        ]
      },
      "partyMid": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "NUNGAMBAKKAM CHENNAI TAMIL NADU 600084 INDIA"
        ]
      },
      "fieldGrid": [
        {
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "Delivery Window",
          "v": "08-FEB-19 09:00–17:00"
        }
      ],
      "termsLines": [
        "This notice does not replace the delivery order or proof of delivery."
      ]
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "docTitle",
        "text": "NOTICE OF DELIVERY",
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
        "type": "colorfulFooter"
      }
    ]
  },
  {
    "code": "PROOF_OF_DELIVERY_REPORT_FORMAT",
    "formatNumber": 39,
    "name": "Proof Of Delivery Report Format",
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
      "invoiceNo": "POD-CEXP190150",
      "invoiceDate": "08-FEB-19",
      "partyLeft": {
        "title": "Consignee",
        "lines": [
          "AL NASER TRADING COMPANY LLC",
          "30 AL MAKTHOOM BUILDING NEAR MUBARAK CENTRE",
          "AL NABHA SHARJAH UAE"
        ]
      },
      "partyMid": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "NUNGAMBAKKAM CHENNAI TAMIL NADU 600084 INDIA"
        ]
      },
      "fieldGrid": [
        {
          "k": "HBL No.",
          "v": "PLMAAJEA00081"
        },
        {
          "k": "Delivered Date",
          "v": "08-FEB-19 14:30"
        },
        {
          "k": "Received By",
          "v": "Consignee representative"
        }
      ],
      "tableHeaders": [
        "Description",
        "Qty",
        "Condition"
      ],
      "tableRows": [
        [
          "VALVE MATERIALS FOR MACHINERY PARTS",
          "125",
          "Good"
        ]
      ],
      "termsLines": [
        "Proof of delivery — official report format sample."
      ]
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "docTitle",
        "text": "PROOF OF DELIVERY",
        "align": "center",
        "band": true
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
        "headerColor": "primary"
      },
      {
        "type": "signatureRow"
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
    "code": "FG_PROOF_OF_DELIVERY",
    "formatNumber": 40,
    "name": "FG Proof Of Delivery / HBL PLMAAJEA00081",
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
      "invoiceDate": "08-FEB-19",
      "partyLeft": {
        "title": "Client",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "NUNGAMBAKKAM CHENNAI TAMIL NADU 600084"
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
        "title": "Notify",
        "lines": [
          "AL NASER TRADING COMPANY LLC",
          "30 AL MAKTHOOM BUILDING NEAR MUBARAK CENTRE",
          "AL NABHA SHARJAH UAE"
        ]
      },
      "fieldGrid": [
        {
          "k": "Deliver To",
          "v": "AL NASER TRADING COMPANY LLC"
        },
        {
          "k": "B/E No.",
          "v": "SBILLNO767 / 27-JAN-19"
        },
        {
          "k": "Job Ref.",
          "v": "CEXP190150 / 29-JAN-19"
        },
        {
          "k": "Shipment Ref.",
          "v": "B/EXP/19/0254 / 23-JAN-19"
        },
        {
          "k": "B/E NO.",
          "v": "—"
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
          "k": "Place of Delivery",
          "v": "JEBEL ALI, UNITED ARAB EMIRATES"
        },
        {
          "k": "BOE No",
          "v": "SBILLNO767 / 27-JAN-19"
        },
        {
          "k": "Declaration No.",
          "v": "DECNO9812345 / 26-JAN-19"
        },
        {
          "k": "BOE No",
          "v": "SBILLNO767 / 27-JAN-19"
        }
      ],
      "tableHeaders": [
        "Container",
        "Type",
        "Pkgs",
        "Volume",
        "Net Weight",
        "Gross Weight",
        "Description",
        "Remarks"
      ],
      "tableRows": [
        [
          "ABCU9877666",
          "20' DC",
          "125",
          "24.000",
          "17,000.000",
          "18,000.000",
          "STC: VALVE MATERIALS FOR MACHINERY PARTS",
          "FREIGHT PREPAID"
        ]
      ],
      "remarks": "Received the above goods in good condition — same quantity as mentioned above received in good condition.",
      "termsLines": [
        "Delivery Received By: Consignee | Cargo Received: AL NASER TRADING COMPANY LLC",
        "Truck No: ______  Driver name: ______  Delivery Date: ______",
        "REFERENCE NO: POD-847",
        "WAREHOUSE SUPERVISOR SIGN | ACCOUNTANT SIGN"
      ]
    },
    "blocks": [
      {
        "type": "companyHeader",
        "showContact": true
      },
      {
        "type": "docTitle",
        "text": "PROOF OF DELIVERY / HBL NO - PLMAAJEA00081",
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
        "type": "termsBank"
      },
      {
        "type": "signatureRow"
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
    "code": "PROOF_OF_DELIVERY_RPM_SAMPLE",
    "formatNumber": 41,
    "name": "Proof Of Delivery (RPM Sample)",
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
      "invoiceNo": "POD-275",
      "invoiceDate": "08-FEB-19",
      "partyLeft": {
        "title": "Consignee",
        "lines": [
          "AL NASER TRADING COMPANY LLC",
          "30 AL MAKTHOOM BUILDING NEAR MUBARAK CENTRE",
          "AL NABHA SHARJAH UAE"
        ]
      },
      "partyMid": {
        "title": "Shipper",
        "lines": [
          "4G LOGISTICS INDIA PVT LTD",
          "10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD",
          "NUNGAMBAKKAM CHENNAI TAMIL NADU 600084 INDIA"
        ]
      },
      "fieldGrid": [
        {
          "k": "Reference",
          "v": "RPM-275"
        },
        {
          "k": "HBL",
          "v": "PLMAAJEA00081"
        }
      ],
      "tableHeaders": [
        "Goods",
        "Pkgs",
        "Status"
      ],
      "tableRows": [
        [
          "VALVE MATERIALS",
          "125",
          "Delivered"
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
        "text": "PROOF OF DELIVERY",
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
        "type": "signatureRow"
      },
      {
        "type": "colorfulFooter"
      }
    ]
  }
] as InvoiceFormatUiLayout[];
