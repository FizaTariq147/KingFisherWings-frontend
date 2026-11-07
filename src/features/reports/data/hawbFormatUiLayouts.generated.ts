import type { InvoiceFormatUiLayout } from '../types/invoiceFormatUiLayout.types';

/** Auto-generated HAWB IATA shells — run: node scripts/build-hawb-format-ui-layouts.mjs */
export const HAWB_FORMAT_UI_LAYOUTS: InvoiceFormatUiLayout[] = [
  {
    "code": "HAWB_DRAFT_REPORT_FORMAT",
    "formatNumber": 1,
    "name": "HAWB Draft Report Format",
    "paper": "A4",
    "rtl": false,
    "appendCustomerTerms": true,
    "theme": {
      "primary": "#101010",
      "accent": "#2286C8",
      "fill": "#F7F7F7",
      "panel": "#EFEFEF",
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
      "email": "inquiry@kingfishertec.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "MAA/DXB/1900014",
      "invoiceDate": "18-FEB-19",
      "currency": "INR",
      "formatBadgeLabel": "Draft Report Format",
      "heroTitle": "HAWB DRAFT",
      "partyLeft": {
        "title": "Shipper's Name and Address",
        "lines": [
          "BABU SECTOR PTLTD",
          "144/78B GKM TOWERS MUTHUSAMY STREET, NEAR A2B SIGNAL,",
          "NEELANKARAI CHENNAI TAMILNADU INDIA",
          "CHENNAI, INDIA"
        ]
      },
      "partyMid": {
        "title": "Consignee's Name and Address",
        "lines": [
          "AL NASER TRADING COMPANY LLC",
          "30 AL MAKTHOOM BUILDING NEAR MUBARAK CENTRE ROUND ABOUT",
          "AL NABHA SHARJAH UNITED ARAB EMIRATES"
        ]
      },
      "partyNotify": {
        "title": "Issuing Carrier' Agent Name and city",
        "lines": [
          "KingFisher Logistic",
          "Dubai, United Arab Emirates",
          "PHONE: +971 55 5355 286"
        ]
      },
      "fieldGrid": [
        {
          "k": "HAWB No.",
          "v": "MAA/DXB/1900014"
        },
        {
          "k": "MAWB No.",
          "v": "176-23456882"
        },
        {
          "k": "JOB NO.",
          "v": "CAE190028"
        },
        {
          "k": "Airport of Departure",
          "v": "CHENNAI (MAA)"
        },
        {
          "k": "Airport of Destination",
          "v": "DUBAI INTERNATIONAL AIRPORT"
        },
        {
          "k": "Flight / Date",
          "v": "EK9876 / 20-FEB-19"
        },
        {
          "k": "Currency",
          "v": "INR"
        },
        {
          "k": "WT/VAL",
          "v": "PP"
        },
        {
          "k": "Other",
          "v": "PP"
        },
        {
          "k": "Declared Value Carriage",
          "v": "N.V.D."
        },
        {
          "k": "Declared Value Customs",
          "v": "AS PER INV"
        },
        {
          "k": "Amount of Insurance",
          "v": "NIL"
        },
        {
          "k": "Pieces",
          "v": "100"
        },
        {
          "k": "Gross Weight",
          "v": "1,250.00"
        },
        {
          "k": "Chargeable Weight",
          "v": "1,250.00"
        },
        {
          "k": "Rate / Charge",
          "v": "AS ARRANGED"
        },
        {
          "k": "Total",
          "v": "AS ARRANGED"
        },
        {
          "k": "Carrier",
          "v": "EMIRATES"
        },
        {
          "k": "Handling Information",
          "v": "FREIGHT PREPAID"
        },
        {
          "k": "Other Charges",
          "v": "AS ARRANGED"
        },
        {
          "k": "Accounting Information",
          "v": "JOB NO.: CAE190028"
        }
      ],
      "hawbRouteFields": [
        {
          "k": "Airport of Departure",
          "v": "CHENNAI (MAA)"
        },
        {
          "k": "Airport of Destination",
          "v": "DUBAI INTERNATIONAL AIRPORT"
        },
        {
          "k": "Flight / Date",
          "v": "EK9876 / 20-FEB-19"
        },
        {
          "k": "Pieces",
          "v": "100"
        },
        {
          "k": "Gross Weight",
          "v": "1,250.00"
        },
        {
          "k": "Chargeable Weight",
          "v": "1,250.00"
        }
      ],
      "tableHeaders": [
        "No. of Pieces RCP",
        "Gross Weight",
        "kg",
        "Rate Class",
        "Chargeable Weight",
        "Rate / Charge",
        "Total",
        "Nature and Quantity of Goods (Incl. Dimensions or Volume)"
      ],
      "tableRows": [
        [
          "100",
          "1,250.00",
          "K",
          "Q",
          "1,250.00",
          "AS ARRANGED",
          "AS ARRANGED",
          "STC: PAPER CUPS\nTOTAL : (100) PACKAGES ONLY\nCTN 1-20\nDIMS IN CM"
        ]
      ],
      "goodsDescription": "STC: PAPER CUPS",
      "remarks": "FREIGHT PREPAID",
      "hblCarrierAgent": "EMIRATES",
      "termsLines": [
        "DRAFT — Not valid for carriage until issued as original AWB."
      ]
    },
    "blocks": [
      {
        "type": "hawbAwbShell",
        "variant": "draft"
      },
      {
        "type": "colorfulFooter",
        "variant": "plain"
      }
    ]
  },
  {
    "code": "HAWB_DRAFT_REPORT_FORMAT_1",
    "formatNumber": 2,
    "name": "HAWB Draft Report Format-1",
    "paper": "A4",
    "rtl": false,
    "appendCustomerTerms": true,
    "theme": {
      "primary": "#101010",
      "accent": "#2286C8",
      "fill": "#F7F7F7",
      "panel": "#EFEFEF",
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
      "email": "inquiry@kingfishertec.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "MAA/DXB/1900014",
      "invoiceDate": "18-FEB-19",
      "currency": "INR",
      "formatBadgeLabel": "Draft Report Format-1",
      "heroTitle": "HAWB DRAFT",
      "partyLeft": {
        "title": "Shipper's Name and Address",
        "lines": [
          "BABU SECTOR PTLTD",
          "144/78B GKM TOWERS MUTHUSAMY STREET, NEAR A2B SIGNAL,",
          "NEELANKARAI CHENNAI TAMILNADU INDIA",
          "CHENNAI, INDIA"
        ]
      },
      "partyMid": {
        "title": "Consignee's Name and Address",
        "lines": [
          "AL NASER TRADING COMPANY LLC",
          "30 AL MAKTHOOM BUILDING NEAR MUBARAK CENTRE ROUND ABOUT",
          "AL NABHA SHARJAH UNITED ARAB EMIRATES"
        ]
      },
      "partyNotify": {
        "title": "Notify Party",
        "lines": [
          "AL NASER TRADING COMPANY LLC",
          "30 AL MAKTHOOM BUILDING NEAR MUBARAK CENTRE ROUND ABOUT",
          "AL NABHA SHARJAH UNITED ARAB EMIRATES"
        ]
      },
      "fieldGrid": [
        {
          "k": "HAWB No.",
          "v": "MAA/DXB/1900014"
        },
        {
          "k": "MAWB No.",
          "v": "176-23456882"
        },
        {
          "k": "JOB NO.",
          "v": "CAE190028"
        },
        {
          "k": "Airport of Departure",
          "v": "CHENNAI (MAA)"
        },
        {
          "k": "Airport of Destination",
          "v": "DUBAI INTERNATIONAL AIRPORT"
        },
        {
          "k": "Flight / Date",
          "v": "EK9876 / 20-FEB-19"
        },
        {
          "k": "Currency",
          "v": "INR"
        },
        {
          "k": "WT/VAL",
          "v": "PP"
        },
        {
          "k": "Other",
          "v": "PP"
        },
        {
          "k": "Declared Value Carriage",
          "v": "N.V.D."
        },
        {
          "k": "Declared Value Customs",
          "v": "AS PER INV"
        },
        {
          "k": "Amount of Insurance",
          "v": "NIL"
        },
        {
          "k": "Pieces",
          "v": "100"
        },
        {
          "k": "Gross Weight",
          "v": "1,250.00"
        },
        {
          "k": "Chargeable Weight",
          "v": "1,250.00"
        },
        {
          "k": "Rate / Charge",
          "v": "AS ARRANGED"
        },
        {
          "k": "Total",
          "v": "AS ARRANGED"
        },
        {
          "k": "Carrier",
          "v": "EMIRATES"
        },
        {
          "k": "Handling Information",
          "v": "FREIGHT PREPAID"
        },
        {
          "k": "Other Charges",
          "v": "AS ARRANGED"
        },
        {
          "k": "Accounting Information",
          "v": "JOB NO.: CAE190028"
        }
      ],
      "hawbRouteFields": [
        {
          "k": "Airport of Departure",
          "v": "CHENNAI (MAA)"
        },
        {
          "k": "Airport of Destination",
          "v": "DUBAI INTERNATIONAL AIRPORT"
        },
        {
          "k": "Flight / Date",
          "v": "EK9876 / 20-FEB-19"
        },
        {
          "k": "Pieces",
          "v": "100"
        },
        {
          "k": "Gross Weight",
          "v": "1,250.00"
        },
        {
          "k": "Chargeable Weight",
          "v": "1,250.00"
        }
      ],
      "tableHeaders": [
        "No. of Pieces RCP",
        "Gross Weight",
        "kg",
        "Rate Class",
        "Chargeable Weight",
        "Rate / Charge",
        "Total",
        "Nature and Quantity of Goods (Incl. Dimensions or Volume)"
      ],
      "tableRows": [
        [
          "100",
          "1,250.00",
          "K",
          "Q",
          "1,250.00",
          "AS ARRANGED",
          "AS ARRANGED",
          "STC: PAPER CUPS\nTOTAL : (100) PACKAGES ONLY\nCTN 1-20\nDIMS IN CM"
        ]
      ],
      "goodsDescription": "STC: PAPER CUPS",
      "remarks": "FREIGHT PREPAID",
      "hblCarrierAgent": "EMIRATES",
      "termsLines": [
        "DRAFT — Not valid for carriage until issued as original AWB."
      ]
    },
    "blocks": [
      {
        "type": "hawbAwbShell",
        "variant": "draft1"
      },
      {
        "type": "colorfulFooter",
        "variant": "plain"
      }
    ]
  },
  {
    "code": "HAWB_DRAFT_REPORT_FORMAT_2",
    "formatNumber": 3,
    "name": "HAWB Draft Report Format-2",
    "paper": "A4",
    "rtl": false,
    "appendCustomerTerms": true,
    "theme": {
      "primary": "#101010",
      "accent": "#2286C8",
      "fill": "#F7F7F7",
      "panel": "#EFEFEF",
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
      "email": "inquiry@kingfishertec.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "MAA/DXB/1900014",
      "invoiceDate": "18-FEB-19",
      "currency": "INR",
      "formatBadgeLabel": "Draft Report Format-2",
      "heroTitle": "HAWB DRAFT",
      "partyLeft": {
        "title": "Shipper's Name and Address",
        "lines": [
          "BABU SECTOR PTLTD",
          "144/78B GKM TOWERS MUTHUSAMY STREET, NEAR A2B SIGNAL,",
          "NEELANKARAI CHENNAI TAMILNADU INDIA",
          "CHENNAI, INDIA"
        ]
      },
      "partyMid": {
        "title": "Consignee's Name and Address",
        "lines": [
          "AL NASER TRADING COMPANY LLC",
          "30 AL MAKTHOOM BUILDING NEAR MUBARAK CENTRE ROUND ABOUT",
          "AL NABHA SHARJAH UNITED ARAB EMIRATES"
        ]
      },
      "partyNotify": {
        "title": "Issuing Carrier' Agent Name and city",
        "lines": [
          "KingFisher Logistic",
          "Dubai, United Arab Emirates",
          "PHONE: +971 55 5355 286"
        ]
      },
      "fieldGrid": [
        {
          "k": "HAWB No.",
          "v": "MAA/DXB/1900014"
        },
        {
          "k": "MAWB No.",
          "v": "176-23456882"
        },
        {
          "k": "JOB NO.",
          "v": "CAE190028"
        },
        {
          "k": "Airport of Departure",
          "v": "CHENNAI (MAA)"
        },
        {
          "k": "Airport of Destination",
          "v": "DUBAI INTERNATIONAL AIRPORT"
        },
        {
          "k": "Flight / Date",
          "v": "EK9876 / 20-FEB-19"
        },
        {
          "k": "Currency",
          "v": "INR"
        },
        {
          "k": "WT/VAL",
          "v": "PP"
        },
        {
          "k": "Other",
          "v": "PP"
        },
        {
          "k": "Declared Value Carriage",
          "v": "N.V.D."
        },
        {
          "k": "Declared Value Customs",
          "v": "N.C.V"
        },
        {
          "k": "Amount of Insurance",
          "v": "NIL"
        },
        {
          "k": "Pieces",
          "v": "100"
        },
        {
          "k": "Gross Weight",
          "v": "1,250.00"
        },
        {
          "k": "Chargeable Weight",
          "v": "1,250.00"
        },
        {
          "k": "Rate / Charge",
          "v": "AS ARRANGED"
        },
        {
          "k": "Total",
          "v": "AS ARRANGED"
        },
        {
          "k": "Carrier",
          "v": "EMIRATES"
        },
        {
          "k": "Handling Information",
          "v": "FREIGHT PREPAID"
        },
        {
          "k": "Other Charges",
          "v": "AS ARRANGED"
        },
        {
          "k": "Accounting Information",
          "v": "JOB NO.: CAE190028"
        }
      ],
      "hawbRouteFields": [
        {
          "k": "Airport of Departure",
          "v": "CHENNAI (MAA)"
        },
        {
          "k": "Airport of Destination",
          "v": "DUBAI INTERNATIONAL AIRPORT"
        },
        {
          "k": "Flight / Date",
          "v": "EK9876 / 20-FEB-19"
        },
        {
          "k": "Pieces",
          "v": "100"
        },
        {
          "k": "Gross Weight",
          "v": "1,250.00"
        },
        {
          "k": "Chargeable Weight",
          "v": "1,250.00"
        }
      ],
      "tableHeaders": [
        "No. of Pieces RCP",
        "Gross Weight",
        "kg",
        "Rate Class",
        "Chargeable Weight",
        "Rate / Charge",
        "Total",
        "Nature and Quantity of Goods (Incl. Dimensions or Volume)"
      ],
      "tableRows": [
        [
          "100",
          "1,250.00",
          "K",
          "Q",
          "1,250.00",
          "AS ARRANGED",
          "AS ARRANGED",
          "STC: PAPER CUPS\nTOTAL : (100) PACKAGES ONLY\nCTN 1-20\nDIMS IN CM"
        ]
      ],
      "goodsDescription": "STC: PAPER CUPS",
      "remarks": "FREIGHT PREPAID",
      "hblCarrierAgent": "EMIRATES",
      "termsLines": [
        "DRAFT — Not valid for carriage until issued as original AWB."
      ]
    },
    "blocks": [
      {
        "type": "hawbAwbShell",
        "variant": "draft2"
      },
      {
        "type": "colorfulFooter",
        "variant": "plain"
      }
    ]
  },
  {
    "code": "HAWB_ORIGINAL_PRE_PRINTED_REPORT_FORMAT_1",
    "formatNumber": 4,
    "name": "HAWB Original Pre Printed Report Format-1",
    "paper": "A4",
    "rtl": false,
    "appendCustomerTerms": true,
    "theme": {
      "primary": "#101010",
      "accent": "#2286C8",
      "fill": "#F7F7F7",
      "panel": "#EFEFEF",
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
      "email": "inquiry@kingfishertec.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "MAA/DXB/1900014",
      "invoiceDate": "18-FEB-19",
      "currency": "INR",
      "formatBadgeLabel": "Original Pre Printed Format-1",
      "heroTitle": "HAWB ORIGINAL",
      "partyLeft": {
        "title": "Shipper's Name and Address",
        "lines": [
          "BABU SECTOR PTLTD",
          "144/78B GKM TOWERS MUTHUSAMY STREET, NEAR A2B SIGNAL,",
          "NEELANKARAI CHENNAI TAMILNADU INDIA",
          "CHENNAI, INDIA"
        ]
      },
      "partyMid": {
        "title": "Consignee's Name and Address",
        "lines": [
          "AL NASER TRADING COMPANY LLC",
          "30 AL MAKTHOOM BUILDING NEAR MUBARAK CENTRE ROUND ABOUT",
          "AL NABHA SHARJAH UNITED ARAB EMIRATES"
        ]
      },
      "partyNotify": {
        "title": "Issuing Carrier' Agent Name and city",
        "lines": [
          "KingFisher Logistic",
          "Dubai, United Arab Emirates",
          "PHONE: +971 55 5355 286"
        ]
      },
      "fieldGrid": [
        {
          "k": "HAWB No.",
          "v": "MAA/DXB/1900014"
        },
        {
          "k": "MAWB No.",
          "v": "176-23456882"
        },
        {
          "k": "JOB NO.",
          "v": "CAE190028"
        },
        {
          "k": "Airport of Departure",
          "v": "CHENNAI (MAA)"
        },
        {
          "k": "Airport of Destination",
          "v": "DUBAI INTERNATIONAL AIRPORT"
        },
        {
          "k": "Flight / Date",
          "v": "EK9876 / 20-FEB-19"
        },
        {
          "k": "Currency",
          "v": "INR"
        },
        {
          "k": "WT/VAL",
          "v": "PP"
        },
        {
          "k": "Other",
          "v": "PP"
        },
        {
          "k": "Declared Value Carriage",
          "v": "N.V.D."
        },
        {
          "k": "Declared Value Customs",
          "v": "AS PER INV"
        },
        {
          "k": "Amount of Insurance",
          "v": "NIL"
        },
        {
          "k": "Pieces",
          "v": "100"
        },
        {
          "k": "Gross Weight",
          "v": "1,250.00"
        },
        {
          "k": "Chargeable Weight",
          "v": "1,250.00"
        },
        {
          "k": "Rate / Charge",
          "v": "AS ARRANGED"
        },
        {
          "k": "Total",
          "v": "AS ARRANGED"
        },
        {
          "k": "Carrier",
          "v": "EMIRATES"
        },
        {
          "k": "Handling Information",
          "v": "FREIGHT PREPAID"
        },
        {
          "k": "Other Charges",
          "v": "AS ARRANGED"
        },
        {
          "k": "Accounting Information",
          "v": "JOB NO.: CAE190028"
        }
      ],
      "hawbRouteFields": [
        {
          "k": "Airport of Departure",
          "v": "CHENNAI (MAA)"
        },
        {
          "k": "Airport of Destination",
          "v": "DUBAI INTERNATIONAL AIRPORT"
        },
        {
          "k": "Flight / Date",
          "v": "EK9876 / 20-FEB-19"
        },
        {
          "k": "Pieces",
          "v": "100"
        },
        {
          "k": "Gross Weight",
          "v": "1,250.00"
        },
        {
          "k": "Chargeable Weight",
          "v": "1,250.00"
        }
      ],
      "tableHeaders": [
        "No. of Pieces RCP",
        "Gross Weight",
        "kg",
        "Rate Class",
        "Chargeable Weight",
        "Rate / Charge",
        "Total",
        "Nature and Quantity of Goods (Incl. Dimensions or Volume)"
      ],
      "tableRows": [
        [
          "100",
          "1,250.00",
          "K",
          "Q",
          "1,250.00",
          "AS ARRANGED",
          "AS ARRANGED",
          "STC: PAPER CUPS\nTOTAL : (100) PACKAGES ONLY\nCTN 1-20\nDIMS IN CM"
        ]
      ],
      "goodsDescription": "STC: PAPER CUPS",
      "remarks": "FREIGHT PREPAID",
      "hblCarrierAgent": "EMIRATES",
      "termsLines": [
        "ORIGINAL PRE-PRINTED — For carrier pre-printed stock."
      ]
    },
    "blocks": [
      {
        "type": "hawbAwbShell",
        "variant": "original1"
      },
      {
        "type": "colorfulFooter",
        "variant": "plain"
      }
    ]
  },
  {
    "code": "HAWB_ORIGINAL_PRE_PRINTED_REPORT_FORMAT_2",
    "formatNumber": 5,
    "name": "HAWB Original Pre Printed Report Format-2",
    "paper": "A4",
    "rtl": false,
    "appendCustomerTerms": true,
    "theme": {
      "primary": "#101010",
      "accent": "#2286C8",
      "fill": "#F7F7F7",
      "panel": "#EFEFEF",
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
      "email": "inquiry@kingfishertec.com",
      "logo": "kingfisher"
    },
    "demo": {
      "invoiceNo": "MAA/DXB/1900014",
      "invoiceDate": "18-FEB-19",
      "currency": "INR",
      "formatBadgeLabel": "Original Pre Printed Format-2",
      "heroTitle": "HAWB ORIGINAL",
      "partyLeft": {
        "title": "Shipper's Name and Address",
        "lines": [
          "BABU SECTOR PTLTD",
          "144/78B GKM TOWERS MUTHUSAMY STREET, NEAR A2B SIGNAL,",
          "NEELANKARAI CHENNAI TAMILNADU INDIA",
          "CHENNAI, INDIA"
        ]
      },
      "partyMid": {
        "title": "Consignee's Name and Address",
        "lines": [
          "AL NASER TRADING COMPANY LLC",
          "30 AL MAKTHOOM BUILDING NEAR MUBARAK CENTRE ROUND ABOUT",
          "AL NABHA SHARJAH UNITED ARAB EMIRATES"
        ]
      },
      "partyNotify": {
        "title": "Issuing Carrier' Agent Name and city",
        "lines": [
          "KingFisher Logistic",
          "Dubai, United Arab Emirates",
          "PHONE: +971 55 5355 286"
        ]
      },
      "fieldGrid": [
        {
          "k": "HAWB No.",
          "v": "MAA/DXB/1900014"
        },
        {
          "k": "MAWB No.",
          "v": "176-23456882"
        },
        {
          "k": "JOB NO.",
          "v": "CAE190028"
        },
        {
          "k": "Airport of Departure",
          "v": "CHENNAI (MAA)"
        },
        {
          "k": "Airport of Destination",
          "v": "DUBAI INTERNATIONAL AIRPORT"
        },
        {
          "k": "Flight / Date",
          "v": "EK9876 / 20-FEB-19"
        },
        {
          "k": "Currency",
          "v": "INR"
        },
        {
          "k": "WT/VAL",
          "v": "PP"
        },
        {
          "k": "Other",
          "v": "PP"
        },
        {
          "k": "Declared Value Carriage",
          "v": "N.V.D."
        },
        {
          "k": "Declared Value Customs",
          "v": "N.C.V"
        },
        {
          "k": "Amount of Insurance",
          "v": "NIL"
        },
        {
          "k": "Pieces",
          "v": "100"
        },
        {
          "k": "Gross Weight",
          "v": "1,250.00"
        },
        {
          "k": "Chargeable Weight",
          "v": "1,250.00"
        },
        {
          "k": "Rate / Charge",
          "v": "AS ARRANGED"
        },
        {
          "k": "Total",
          "v": "AS ARRANGED"
        },
        {
          "k": "Carrier",
          "v": "EMIRATES"
        },
        {
          "k": "Handling Information",
          "v": "FREIGHT PREPAID"
        },
        {
          "k": "Other Charges",
          "v": "AS ARRANGED"
        },
        {
          "k": "Accounting Information",
          "v": "JOB NO.: CAE190028"
        }
      ],
      "hawbRouteFields": [
        {
          "k": "Airport of Departure",
          "v": "CHENNAI (MAA)"
        },
        {
          "k": "Airport of Destination",
          "v": "DUBAI INTERNATIONAL AIRPORT"
        },
        {
          "k": "Flight / Date",
          "v": "EK9876 / 20-FEB-19"
        },
        {
          "k": "Pieces",
          "v": "100"
        },
        {
          "k": "Gross Weight",
          "v": "1,250.00"
        },
        {
          "k": "Chargeable Weight",
          "v": "1,250.00"
        }
      ],
      "tableHeaders": [
        "No. of Pieces RCP",
        "Gross Weight",
        "kg",
        "Rate Class",
        "Chargeable Weight",
        "Rate / Charge",
        "Total",
        "Nature and Quantity of Goods (Incl. Dimensions or Volume)"
      ],
      "tableRows": [
        [
          "100",
          "1,250.00",
          "K",
          "Q",
          "1,250.00",
          "AS ARRANGED",
          "AS ARRANGED",
          "STC: PAPER CUPS\nTOTAL : (100) PACKAGES ONLY\nCTN 1-20\nDIMS IN CM"
        ]
      ],
      "goodsDescription": "STC: PAPER CUPS",
      "remarks": "FREIGHT PREPAID",
      "hblCarrierAgent": "EMIRATES",
      "termsLines": [
        "ORIGINAL PRE-PRINTED — For carrier pre-printed stock."
      ]
    },
    "blocks": [
      {
        "type": "hawbAwbShell",
        "variant": "original2"
      },
      {
        "type": "colorfulFooter",
        "variant": "plain"
      }
    ]
  }
] as InvoiceFormatUiLayout[];
