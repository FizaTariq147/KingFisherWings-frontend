import type { ReportTemplateMeta } from '../types/reportCatalog.types';

/** Auto-generated — run scripts/sync-report-registry-from-layouts.mjs / close-report-analytics-gap.mjs */
export const FRESA_REPORT_REGISTRY = [
  {
    "code": "ACTIVITY_COMPLETED_JOBS_LIST_REPORT_FORMAT",
    "name": "Activity Completed Jobs List Report Format",
    "family": "ops_list",
    "contexts": [
      "list",
      "job"
    ],
    "formats": [
      "PDF",
      "XLSX",
      "CSV"
    ],
    "rolloutPhase": 1,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Activity Completed Jobs List Report Format",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "ADVANCE_SHIPPING_NOTE",
    "name": "Advance Shipping Note",
    "family": "wms",
    "contexts": [
      "wms",
      "list"
    ],
    "formats": [
      "PDF",
      "XLSX"
    ],
    "rolloutPhase": 6,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Advance Shipping Note",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "ADVANCE_SHIPPING_NOTE_FORMAT_1",
    "name": "Advance Shipping Note Format-1",
    "family": "wms",
    "contexts": [
      "wms",
      "list"
    ],
    "formats": [
      "PDF",
      "XLSX"
    ],
    "rolloutPhase": 6,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Advance Shipping Note Format-1",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "ADVANCE_SHIPPING_NOTE_LOCATION_SUMMARY",
    "name": "Advance Shipping Note Location Summary",
    "family": "wms",
    "contexts": [
      "wms",
      "list"
    ],
    "formats": [
      "PDF",
      "XLSX"
    ],
    "rolloutPhase": 6,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Advance Shipping Note Location Summary",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "ADVANCE_SHIPPING_NOTE_LOCATION_WISE",
    "name": "Advance Shipping Note Location Wise",
    "family": "wms",
    "contexts": [
      "wms"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 6,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: Advance Shipping Note Location Wise"
  },
  {
    "code": "ADVANCE_SHIPPING_NOTE_LOCATION_WISE_2",
    "name": "Advance Shipping Note Location Wise-2",
    "family": "wms",
    "contexts": [
      "wms"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 6,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: Advance Shipping Note Location Wise-2"
  },
  {
    "code": "ADVANCE_SHIPPING_NOTE_REPORT_FORMAT_2",
    "name": "Advance Shipping Note Report Format-2",
    "family": "wms",
    "contexts": [
      "wms",
      "list"
    ],
    "formats": [
      "PDF",
      "XLSX"
    ],
    "rolloutPhase": 6,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Advance Shipping Note Report Format-2",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "ADVANCE_SHIPPING_NOTE_REPORT_FORMAT_3",
    "name": "Advance Shipping Note Report Format-3",
    "family": "wms",
    "contexts": [
      "wms",
      "list"
    ],
    "formats": [
      "PDF",
      "XLSX"
    ],
    "rolloutPhase": 6,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Advance Shipping Note Report Format-3",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "ADVANCE_SHIPPING_NOTE_REPORT_FORMAT_4",
    "name": "Advance Shipping Note Report Format-4",
    "family": "wms",
    "contexts": [
      "wms",
      "list"
    ],
    "formats": [
      "PDF",
      "XLSX"
    ],
    "rolloutPhase": 6,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Advance Shipping Note Report Format-4",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "ADVANCE_SHIPPING_NOTE_REPORT_FORMAT_5",
    "name": "Advance Shipping Note Report Format-5",
    "family": "wms",
    "contexts": [
      "wms",
      "list"
    ],
    "formats": [
      "PDF",
      "XLSX"
    ],
    "rolloutPhase": 6,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Advance Shipping Note Report Format-5",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "ADVANCE_SHIPPING_NOTE_REPORT_FORMAT_6",
    "name": "Advance Shipping Note Report Format-6",
    "family": "wms",
    "contexts": [
      "wms",
      "list"
    ],
    "formats": [
      "PDF",
      "XLSX"
    ],
    "rolloutPhase": 6,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Advance Shipping Note Report Format-6",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "ADVANCE_SHIPPING_NOTE_REPORT_FORMAT_7",
    "name": "Advance Shipping Note Report Format-7",
    "family": "wms",
    "contexts": [
      "wms",
      "list"
    ],
    "formats": [
      "PDF",
      "XLSX"
    ],
    "rolloutPhase": 6,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Advance Shipping Note Report Format-7",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "ADVANCE_SHIPPING_NOTE_REPORT_FORMAT_8",
    "name": "Advance Shipping Note Report Format-8",
    "family": "wms",
    "contexts": [
      "wms",
      "list"
    ],
    "formats": [
      "PDF",
      "XLSX"
    ],
    "rolloutPhase": 6,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Advance Shipping Note Report Format-8",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "ADVANCE_SHIPPING_NOTE_REPORT_FORMAT_9",
    "name": "Advance Shipping Note Report Format-9",
    "family": "wms",
    "contexts": [
      "wms",
      "list"
    ],
    "formats": [
      "PDF",
      "XLSX"
    ],
    "rolloutPhase": 6,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Advance Shipping Note Report Format-9",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "ADVANCE_SHIPPING_NOTE_REPORT_FORMAT_10",
    "name": "Advance Shipping Note Report Format-10",
    "family": "wms",
    "contexts": [
      "wms",
      "list"
    ],
    "formats": [
      "PDF",
      "XLSX"
    ],
    "rolloutPhase": 6,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Advance Shipping Note Report Format-10",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "ADVANCE_SHIPPING_NOTE_REPORT_FORMAT_11",
    "name": "Advance Shipping Note Report Format-11",
    "family": "wms",
    "contexts": [
      "wms",
      "list"
    ],
    "formats": [
      "PDF",
      "XLSX"
    ],
    "rolloutPhase": 6,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Advance Shipping Note Report Format-11",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "ADVANCE_SHIPPING_NOTE_REPORT_FORMAT_12",
    "name": "Advance Shipping Note Report Format-12",
    "family": "wms",
    "contexts": [
      "wms",
      "list"
    ],
    "formats": [
      "PDF",
      "XLSX"
    ],
    "rolloutPhase": 6,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Advance Shipping Note Report Format-12",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "ADVANCE_SHIPPING_NOTE_REPORT_FORMAT_13",
    "name": "Advance Shipping Note Report Format-13",
    "family": "wms",
    "contexts": [
      "wms",
      "list"
    ],
    "formats": [
      "PDF",
      "XLSX"
    ],
    "rolloutPhase": 6,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Advance Shipping Note Report Format-13",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "ADVANCE_SHIPPING_NOTE_REPORT_FORMAT_14",
    "name": "Advance Shipping Note Report Format-14",
    "family": "wms",
    "contexts": [
      "wms",
      "list"
    ],
    "formats": [
      "PDF",
      "XLSX"
    ],
    "rolloutPhase": 6,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Advance Shipping Note Report Format-14",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "ADVANCE_SHIPPING_NOTE_REPORT_FORMAT_15",
    "name": "Advance Shipping Note Report Format-15",
    "family": "wms",
    "contexts": [
      "wms",
      "list"
    ],
    "formats": [
      "PDF",
      "XLSX"
    ],
    "rolloutPhase": 6,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Advance Shipping Note Report Format-15",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "ADVANCE_SHIPPING_NOTE_REPORT_FORMAT_16",
    "name": "Advance Shipping Note Report Format-16",
    "family": "wms",
    "contexts": [
      "wms",
      "list"
    ],
    "formats": [
      "PDF",
      "XLSX"
    ],
    "rolloutPhase": 6,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Advance Shipping Note Report Format-16",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "ADVANCE_SHIPPING_NOTE_REPORT_FORMAT_17",
    "name": "Advance Shipping Note Report Format-17",
    "family": "wms",
    "contexts": [
      "wms",
      "list"
    ],
    "formats": [
      "PDF",
      "XLSX"
    ],
    "rolloutPhase": 6,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Advance Shipping Note Report Format-17",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "ADVANCE_SHIPPING_NOTE_REPORT_FORMAT_18",
    "name": "Advance Shipping Note Report Format-18",
    "family": "wms",
    "contexts": [
      "wms",
      "list"
    ],
    "formats": [
      "PDF",
      "XLSX"
    ],
    "rolloutPhase": 6,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Advance Shipping Note Report Format-18",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "ADVANCE_SHIPPING_NOTE_REPORT_FORMAT_19",
    "name": "Advance Shipping Note Report Format-19",
    "family": "wms",
    "contexts": [
      "wms",
      "list"
    ],
    "formats": [
      "PDF",
      "XLSX"
    ],
    "rolloutPhase": 6,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Advance Shipping Note Report Format-19",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "ADVANCE_SHIPPING_NOTE_REPORT_FORMAT_20",
    "name": "Advance Shipping Note Report Format-20",
    "family": "wms",
    "contexts": [
      "wms",
      "list"
    ],
    "formats": [
      "PDF",
      "XLSX"
    ],
    "rolloutPhase": 6,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Advance Shipping Note Report Format-20",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "ADVANCE_SHIPPING_NOTE_REPORT_FORMAT_21",
    "name": "Advance Shipping Note Report Format-21",
    "family": "wms",
    "contexts": [
      "wms",
      "list"
    ],
    "formats": [
      "PDF",
      "XLSX"
    ],
    "rolloutPhase": 6,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Advance Shipping Note Report Format-21",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "ADVANCE_SHIPPING_NOTE_SUMMARY",
    "name": "Advance Shipping Note Summary",
    "family": "wms",
    "contexts": [
      "wms"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 6,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: Advance Shipping Note Summary"
  },
  {
    "code": "AGENT_NOMINATION_SHIPMENTS_LIST_REPORT_FORMAT",
    "name": "Agent Nomination Shipments List Report Format",
    "family": "ops_list",
    "contexts": [
      "list",
      "job"
    ],
    "formats": [
      "PDF",
      "XLSX",
      "CSV"
    ],
    "rolloutPhase": 1,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Agent Nomination Shipments List Report Format",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "AIR_FREIGHT_ATD_CONFIRMATION_REPORT_FORMAT",
    "name": "Air Freight ATD Confirmation Report Format",
    "family": "air_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 3,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Air Freight ATD Confirmation Report Format",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "AIR_QUOTATION_REPORT_FORMAT",
    "name": "Air Quotation Report Format",
    "family": "quotation",
    "contexts": [
      "quotation"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 3,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Air Quotation Report Format",
    "existingPath": "/quotations/reports",
    "defaultParams": [
      {
        "name": "quotation_id",
        "label": "Quotation",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "AIR_QUOTATION_WITH_AIRLINE_REPORT_FORMAT",
    "name": "Air Quotation With Airline Report Format",
    "family": "quotation",
    "contexts": [
      "quotation"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 3,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Air Quotation With Airline Report Format",
    "existingPath": "/quotations/reports",
    "defaultParams": [
      {
        "name": "quotation_id",
        "label": "Quotation",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "AIR_SHIPMENT_PROFIT_AND_LOSS_REPORT_FORMAT",
    "name": "Air Shipment Profit And Loss Report Format",
    "family": "air_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 3,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Air Shipment Profit And Loss Report Format",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "AIR_SHIPMENT_PROFIT_AND_LOSS_REPORT_FORMAT_1",
    "name": "Air Shipment Profit And Loss Report Format-1",
    "family": "air_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 3,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Air Shipment Profit And Loss Report Format-1",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "AP_AGING_SUMMARY_REPORT_FORMAT",
    "name": "AP Aging Summary Report Format",
    "family": "finance",
    "contexts": [
      "gl",
      "list"
    ],
    "formats": [
      "PDF",
      "XLSX"
    ],
    "rolloutPhase": 5,
    "gapStatus": "covered_analytics",
    "description": "FRESA sample: AP Aging Summary Report Format",
    "existingPath": "/gl/ap/aging",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "AP_OUTSTANDING_STATEMENT_REPORT_FORMAT",
    "name": "AP Outstanding Statement Report Format",
    "family": "finance",
    "contexts": [
      "gl",
      "list"
    ],
    "formats": [
      "PDF",
      "XLSX"
    ],
    "rolloutPhase": 5,
    "gapStatus": "covered_analytics",
    "description": "FRESA sample: AP Outstanding Statement Report Format",
    "existingPath": "/gl/ap/aging",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "AR_AGING_SUMMARY_REPORT_FORMAT",
    "name": "AR Aging Summary Report Format",
    "family": "finance",
    "contexts": [
      "gl",
      "list"
    ],
    "formats": [
      "PDF",
      "XLSX"
    ],
    "rolloutPhase": 5,
    "gapStatus": "covered_analytics",
    "description": "FRESA sample: AR Aging Summary Report Format",
    "existingPath": "/gl/ar/aging",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "AR_JOB_NOT_INVOICE_REPORT_FORMAT",
    "name": "AR Job Not Invoice Report Format",
    "family": "finance",
    "contexts": [
      "gl",
      "list"
    ],
    "formats": [
      "PDF",
      "XLSX"
    ],
    "rolloutPhase": 5,
    "gapStatus": "covered_analytics",
    "description": "FRESA sample: AR Job Not Invoice Report Format",
    "existingPath": "/gl/ar/aging",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "ARRIVAL_CONFIRMATION",
    "name": "Arrival Confirmation Report Format",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: Arrival Confirmation Report Format"
  },
  {
    "code": "ARRIVAL_CONFIRMATION_FORMAT_1",
    "name": "Arrival Confirmation Format-1",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: Arrival Confirmation Format-1"
  },
  {
    "code": "ARRIVAL_INFORMATION",
    "name": "Arrival Information",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: Arrival Information"
  },
  {
    "code": "ARRIVAL_NOTICE_REPORT_FORMAT_1_CARGO_ARRIVAL_NOTICE_JASPER",
    "name": "Arrival Notice Report Format-1 Cargo Arrival Notice Jasper",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Arrival Notice Report Format-1 Cargo Arrival Notice Jasper",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "ARRIVAL_NOTICE_REPORT_FORMAT_2_CARGO_ARRIVAL_NOTICE_JASPER",
    "name": "Arrival Notice Report Format-2 Cargo Arrival Notice Jasper",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Arrival Notice Report Format-2 Cargo Arrival Notice Jasper",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "ARRIVAL_NOTICE_REPORT_FORMAT_3_ARRIVAL_NOTICE_USA",
    "name": "Arrival Notice Report Format-3 Arrival Notice USA",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Arrival Notice Report Format-3 Arrival Notice USA",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "ARRIVAL_NOTICE_REPORT_FORMAT_4_ARRIVAL_NOTICE_USA",
    "name": "Arrival Notice Report Format-4 Arrival Notice USA",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Arrival Notice Report Format-4 Arrival Notice USA",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "ARRIVAL_NOTICE_REPORT_FORMAT_5_CARGO_ARRIVAL_NOTICE_SEA",
    "name": "Arrival Notice Report Format-5 Cargo Arrival Notice SEA",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Arrival Notice Report Format-5 Cargo Arrival Notice SEA",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "ARRIVAL_NOTICE_REPORT_FORMAT_6_CARGO_ARRIVAL_NOTICE_SEA",
    "name": "Arrival Notice Report Format-6 Cargo Arrival Notice SEA",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Arrival Notice Report Format-6 Cargo Arrival Notice SEA",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "ARRIVAL_NOTICE_REPORT_FORMAT_7_CARGO_ARRIVAL_NOTICE_SEA",
    "name": "Arrival Notice Report Format-7 Cargo Arrival Notice SEA",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Arrival Notice Report Format-7 Cargo Arrival Notice SEA",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "ARRIVAL_NOTICE_REPORT_FORMAT_8_CARGO_ARRIVAL_NOTICE_SEA_WITHOUT_CHARGES",
    "name": "Arrival Notice Report Format-8 Cargo Arrival Notice SEA Without Charges",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Arrival Notice Report Format-8 Cargo Arrival Notice SEA Without Charges",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "ARRIVAL_NOTICE_REPORT_FORMAT_9_CARGO_ARRIVAL_NOTICE_SEA_WITHOUT_CHARGES",
    "name": "Arrival Notice Report Format-9 Cargo Arrival Notice SEA Without Charges",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Arrival Notice Report Format-9 Cargo Arrival Notice SEA Without Charges",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "ARRIVAL_NOTICE_REPORT_FORMAT_10_SEA_ARRIVAL_NOTICE_FCL_VIETNAM",
    "name": "Arrival Notice Report Format-10 SEA Arrival Notice FCL Vietnam",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Arrival Notice Report Format-10 SEA Arrival Notice FCL Vietnam",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "ARRIVAL_NOTICE_REPORT_FORMAT_11",
    "name": "Arrival Notice Report Format-11",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Arrival Notice Report Format-11",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "ARRIVAL_NOTICE_REPORT_FORMAT_12",
    "name": "Arrival Notice Report Format-12",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Arrival Notice Report Format-12",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "ARRIVAL_NOTICE_REPORT_FORMAT_13",
    "name": "Arrival Notice Report Format-13",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Arrival Notice Report Format-13",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "ARRIVAL_NOTICE_REPORT_FORMAT_14",
    "name": "Arrival Notice Report Format-14",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Arrival Notice Report Format-14",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "ARRIVAL_NOTICE_REPORT_FORMAT_15",
    "name": "Arrival Notice Report Format-15",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Arrival Notice Report Format-15",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "ARRIVAL_NOTICE_REPORT_FORMAT_16",
    "name": "Arrival Notice Report Format-16",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Arrival Notice Report Format-16",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "ARRIVAL_NOTICE_REPORT_FORMAT_17",
    "name": "Arrival Notice Report Format-17",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Arrival Notice Report Format-17",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "ARRIVAL_NOTICE_REPORT_FORMAT_18",
    "name": "Arrival Notice Report Format-18",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Arrival Notice Report Format-18",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "ARRIVAL_NOTICE_REPORT_FORMAT_19",
    "name": "Arrival Notice Report Format-19",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Arrival Notice Report Format-19",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "ARRIVAL_NOTICE_REPORT_FORMAT_20",
    "name": "Arrival Notice Report Format-20",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Arrival Notice Report Format-20",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "ARRIVAL_NOTICE_REPORT_FORMAT_21",
    "name": "Arrival Notice Report Format-21",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Arrival Notice Report Format-21",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "ARRIVAL_NOTICE_REPORT_FORMAT_22",
    "name": "Arrival Notice Report Format-22",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Arrival Notice Report Format-22",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "ARRIVAL_NOTICE_REPORT_FORMAT_23",
    "name": "Arrival Notice Report Format-23",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Arrival Notice Report Format-23",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "ARRIVAL_NOTICE_REPORT_FORMAT_24",
    "name": "Arrival Notice Report Format-24",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Arrival Notice Report Format-24",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "ARRIVAL_NOTICE_REPORT_FORMAT_25",
    "name": "Arrival Notice Report Format-25",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Arrival Notice Report Format-25",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "ARRIVAL_NOTICE_REPORT_FORMAT_26",
    "name": "Arrival Notice Report Format-26",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Arrival Notice Report Format-26",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "ARRIVAL_NOTICE_REPORT_FORMAT_27",
    "name": "Arrival Notice Report Format-27",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Arrival Notice Report Format-27",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "ARRIVAL_NOTICE_REPORT_FORMAT_28",
    "name": "Arrival Notice Report Format-28",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Arrival Notice Report Format-28",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "ARRIVAL_NOTICE_REPORT_FORMAT_29",
    "name": "Arrival Notice Report Format-29",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Arrival Notice Report Format-29",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "ARRIVAL_NOTICE_REPORT_FORMAT_30",
    "name": "Arrival Notice Report Format-30",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Arrival Notice Report Format-30",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "ARRIVAL_NOTICE_REPORT_FORMAT_31",
    "name": "Arrival Notice Report Format-31",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Arrival Notice Report Format-31",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "ARRIVAL_NOTICE_REPORT_FORMAT_32",
    "name": "Arrival Notice Report Format-32",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Arrival Notice Report Format-32",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "ARRIVAL_NOTICE_REPORT_FORMAT_33",
    "name": "Arrival Notice Report Format-33",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Arrival Notice Report Format-33",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "ARRIVAL_NOTICE_REPORT_FORMAT_34",
    "name": "Arrival Notice Report Format-34",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Arrival Notice Report Format-34",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "ARRIVAL_NOTICE_REPORT_FORMAT_35",
    "name": "Arrival Notice Report Format-35",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Arrival Notice Report Format-35",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "BANK_CASH_BOOK_SUMMARY_LIST_REPORT_FORMAT",
    "name": "Bank Cash Book Summary List Report Format",
    "family": "finance",
    "contexts": [
      "gl",
      "list"
    ],
    "formats": [
      "PDF",
      "XLSX"
    ],
    "rolloutPhase": 5,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Bank Cash Book Summary List Report Format",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "BARCODE_AWB_REPORT_FORMAT",
    "name": "Barcode AWB Report Format",
    "family": "air_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 3,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Barcode AWB Report Format",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "BILL_OF_LADING_IS_NOT_ISSUED_LIST_REPORT_FORMAT",
    "name": "Bill Of Lading Is Not Issued List Report Format",
    "family": "ops_list",
    "contexts": [
      "list",
      "job"
    ],
    "formats": [
      "PDF",
      "XLSX",
      "CSV"
    ],
    "rolloutPhase": 1,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Bill Of Lading Is Not Issued List Report Format",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "BOOKING_CONFIRMATION_AIR_REPORT_FORMAT",
    "name": "Booking Confirmation Air Report Format",
    "family": "air_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 3,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Booking Confirmation Air Report Format",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "BOOKING_CONFIRMATION_REPORT_FORMAT_1",
    "name": "Booking Confirmation Report Format-1",
    "family": "other",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Booking Confirmation Report Format-1",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "BOOKING_CONFIRMATION_REPORT_FORMAT_2",
    "name": "Booking Confirmation Report Format-2",
    "family": "other",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Booking Confirmation Report Format-2",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "BOOKING_CONFIRMATION_REPORT_FORMAT_3",
    "name": "Booking Confirmation Report Format-3",
    "family": "other",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Booking Confirmation Report Format-3",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "BOOKING_CONFIRMATION_REPORT_FORMAT_4",
    "name": "Booking Confirmation Report Format-4",
    "family": "other",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Booking Confirmation Report Format-4",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "BOOKING_CONFIRMATION_REPORT_FORMAT_5",
    "name": "Booking Confirmation Report Format-5",
    "family": "other",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Booking Confirmation Report Format-5",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "BOOKING_CONFIRMATION_REPORT_FORMAT_6",
    "name": "Booking Confirmation Report Format-6",
    "family": "other",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Booking Confirmation Report Format-6",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "BOOKING_CONFIRMATION_REPORT_FORMAT_7",
    "name": "Booking Confirmation Report Format-7",
    "family": "other",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Booking Confirmation Report Format-7",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "BOOKING_CONFIRMATION_REPORT_FORMAT_8",
    "name": "Booking Confirmation Report Format-8",
    "family": "other",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Booking Confirmation Report Format-8",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "BOOKING_CONFIRMATION_REPORT_FORMAT_9",
    "name": "Booking Confirmation Report Format-9",
    "family": "other",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Booking Confirmation Report Format-9",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "BOOKING_CONFIRMATION_REPORT_FORMAT_10",
    "name": "Booking Confirmation Report Format-10",
    "family": "other",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Booking Confirmation Report Format-10",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "CANCELLED_JOB_LIST_REPORT_FORMAT",
    "name": "Cancelled Job List Report Format",
    "family": "ops_list",
    "contexts": [
      "list",
      "job"
    ],
    "formats": [
      "PDF",
      "XLSX",
      "CSV"
    ],
    "rolloutPhase": 1,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Cancelled Job List Report Format",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "CARGO_ARRIVAL_NOTICE_AIR_REPORT_FORMAT",
    "name": "Cargo Arrival Notice Air Report Format",
    "family": "air_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 3,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Cargo Arrival Notice Air Report Format",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "CARGO_ARRIVAL_NOTICE_AIR_WITHOUT_CHARGES_REPORT_FORMAT",
    "name": "Cargo Arrival Notice Air Without Charges Report Format",
    "family": "air_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 3,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Cargo Arrival Notice Air Without Charges Report Format",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "CARGO_ARRIVAL_NOTICE_SEA_FORMAT_1",
    "name": "Cargo Arrival Notice SEA Format-1",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: Cargo Arrival Notice SEA Format-1"
  },
  {
    "code": "CARGO_ARRIVAL_NOTICE_SEA_FORMAT_2",
    "name": "Cargo Arrival Notice SEA Format-2",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: Cargo Arrival Notice SEA Format-2"
  },
  {
    "code": "CARGO_ARRIVAL_NOTICE_SEA_FORMAT_3",
    "name": "Cargo Arrival Notice SEA Format-3",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: Cargo Arrival Notice SEA Format-3"
  },
  {
    "code": "CARGO_ARRIVAL_NOTICE_SEA_WITHOUT_CHARGES",
    "name": "Cargo Arrival Notice –Sea Without Charges",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: Cargo Arrival Notice –Sea Without Charges"
  },
  {
    "code": "CARGO_ARRIVAL_NOTICE_SEA_WITHOUT_CHARGES_FORMAT_1",
    "name": "Cargo Arrival Notice SEA Without Charges Format-1",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: Cargo Arrival Notice SEA Without Charges Format-1"
  },
  {
    "code": "CARGO_ARRIVAL_NOTICE_SENT_SHIPMENTS_LIST_REPORT_FORMAT",
    "name": "Cargo Arrival Notice Sent Shipments List Report Format",
    "family": "ops_list",
    "contexts": [
      "list",
      "job"
    ],
    "formats": [
      "PDF",
      "XLSX",
      "CSV"
    ],
    "rolloutPhase": 1,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Cargo Arrival Notice Sent Shipments List Report Format",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "CARGO_MANIFEST_AIR_HOUSE_REPORT_FORMAT",
    "name": "Cargo Manifest Air House Report Format",
    "family": "air_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 3,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Cargo Manifest Air House Report Format",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "CARGO_MANIFEST_AIR_JASPER_REPORT_FORMAT",
    "name": "Cargo Manifest Air Jasper Report format",
    "family": "air_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 3,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Cargo Manifest Air Jasper Report format",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "CARGO_MANIFEST_AIR_LC_JASPER_REPORT_FORMAT",
    "name": "Cargo Manifest Air LC Jasper Report Format",
    "family": "air_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 3,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Cargo Manifest Air LC Jasper Report Format",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "CARGO_MANIFEST_REPORT_FORMAT",
    "name": "Cargo Manifest Report Format",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Cargo Manifest Report Format",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "CARGO_MANIFEST_REPORT_FORMAT_2",
    "name": "Cargo Manifest Report Format-2",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Cargo Manifest Report Format-2",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "CARGO_MANIFEST_REPORT_FORMAT_3",
    "name": "Cargo Manifest Report Format-3",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Cargo Manifest Report Format-3",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "CARGO_MANIFEST_REPORT_FORMAT_4",
    "name": "Cargo Manifest Report Format-4",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Cargo Manifest Report Format-4",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "CARGO_MANIFEST_REPORT_FORMAT_5",
    "name": "Cargo Manifest Report Format-5",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Cargo Manifest Report Format-5",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "CARGO_MANIFEST_REPORT_FORMAT_6",
    "name": "Cargo Manifest Report Format-6",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Cargo Manifest Report Format-6",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "CARGO_MANIFEST_REPORT_FORMAT_7",
    "name": "Cargo Manifest Report Format-7",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Cargo Manifest Report Format-7",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "CARGO_MANIFEST_REPORT_FORMAT_8",
    "name": "Cargo Manifest Report Format-8",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Cargo Manifest Report Format-8",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "CARGO_MANIFEST_REPORT_FORMAT_9",
    "name": "Cargo Manifest Report Format-9",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Cargo Manifest Report Format-9",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "CARGO_MANIFEST_REPORT_FORMAT_10",
    "name": "Cargo Manifest Report Format-10",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Cargo Manifest Report Format-10",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "CARGO_MANIFEST_REPORT_FORMAT_11",
    "name": "Cargo Manifest Report Format-11",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Cargo Manifest Report Format-11",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "CARGO_MANIFEST_REPORT_FORMAT_12",
    "name": "Cargo Manifest Report Format-12",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Cargo Manifest Report Format-12",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "CARGO_MANIFEST_REPORT_FORMAT_13",
    "name": "Cargo Manifest Report Format-13",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Cargo Manifest Report Format-13",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "CARGO_MANIFEST_REPORT_FORMAT_14",
    "name": "Cargo Manifest Report Format-14",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Cargo Manifest Report Format-14",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "CARGO_MANIFEST_REPORT_FORMAT_15",
    "name": "Cargo Manifest Report Format-15",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Cargo Manifest Report Format-15",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "CARGO_MANIFEST_REPORT_FORMAT_16",
    "name": "Cargo Manifest Report Format-16",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Cargo Manifest Report Format-16",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "CARGO_MANIFEST_REPORT_FORMAT_17",
    "name": "Cargo Manifest Report Format-17",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Cargo Manifest Report Format-17",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "CARGO_MANIFEST_REPORT_FORMAT_18",
    "name": "Cargo Manifest Report Format-18",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Cargo Manifest Report Format-18",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "CARGO_MANIFEST_REPORT_FORMAT_19",
    "name": "Cargo Manifest Report Format-19",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Cargo Manifest Report Format-19",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "CARGO_MANIFEST_REPORT_FORMAT_20",
    "name": "Cargo Manifest Report Format-20",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Cargo Manifest Report Format-20",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "CARGO_MANIFEST_REPORT_FORMAT_21",
    "name": "Cargo Manifest Report Format-21",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Cargo Manifest Report Format-21",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "CARGO_RECEIPT_NOTE_FOR_EXPORT_CFS_REPORT_FORMAT",
    "name": "Cargo Receipt Note For Export CFS Report Format",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Cargo Receipt Note For Export CFS Report Format",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "CARTING_CONFIRMATION_REPORT_FORMAT",
    "name": "Carting Confirmation Report Format",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Carting Confirmation Report Format",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "CASH_COLLECTION_REPORT_LIST_REPORT_FORMAT",
    "name": "Cash Collection Report List Report Format",
    "family": "ops_list",
    "contexts": [
      "list",
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 1,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: Cash Collection Report List Report Format"
  },
  {
    "code": "CHEQUE_COLLECTION_REPORT_LIST_REPORT_FORMAT",
    "name": "Cheque Collection Report List Report Format",
    "family": "ops_list",
    "contexts": [
      "list",
      "job"
    ],
    "formats": [
      "PDF",
      "XLSX",
      "CSV"
    ],
    "rolloutPhase": 1,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Cheque Collection Report List Report Format",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "CLIENT_LOST_REPORT_FOR_LAST_N_DAYS_LIST_REPORT_FORMAT",
    "name": "Client Lost Report For Last N Days List Report Format",
    "family": "ops_list",
    "contexts": [
      "list",
      "job"
    ],
    "formats": [
      "PDF",
      "XLSX",
      "CSV"
    ],
    "rolloutPhase": 1,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Client Lost Report For Last N Days List Report Format",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "CLOSED_JOB_LIST_REPORT_FORMAT",
    "name": "Closed Job List Report Format",
    "family": "ops_list",
    "contexts": [
      "list",
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 1,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: Closed Job List Report Format"
  },
  {
    "code": "COLLECT_SHIPMENT_WITH_NO_COLLECT_CHARGES_LIST_REPORT_FORMAT",
    "name": "Collect Shipment With No Collect Charges List Report Format",
    "family": "ops_list",
    "contexts": [
      "list",
      "job"
    ],
    "formats": [
      "PDF",
      "XLSX",
      "CSV"
    ],
    "rolloutPhase": 1,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Collect Shipment With No Collect Charges List Report Format",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "CONSOL_IGM_FILLING_LETTER_JASPER_REPORT_FORMAT",
    "name": "Consol IGM Filling Letter Jasper Report Format",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Consol IGM Filling Letter Jasper Report Format",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "CONTAINER_LIST_BASED_ON_CARGO_UNPACK_DATE_LIST_REPORT_FORMAT",
    "name": "Container List Based On Cargo Unpack Date List Report Format",
    "family": "ops_list",
    "contexts": [
      "list",
      "job"
    ],
    "formats": [
      "PDF",
      "XLSX",
      "CSV"
    ],
    "rolloutPhase": 1,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Container List Based On Cargo Unpack Date List Report Format",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "CONTAINER_LOAD_PLAN_REPORT_FORMAT",
    "name": "Container Load Plan Report Format",
    "family": "other",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: Container Load Plan Report Format"
  },
  {
    "code": "CONTAINER_MOVEMENT_FACILITATION_CELL_NOTE_REPORT_FORMAT",
    "name": "Container Movement Facilitation Cell Note Report Format",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Container Movement Facilitation Cell Note Report Format",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "CONTAINER_OUTTURN_REPORT_FORMAT",
    "name": "Container Outturn Report Format",
    "family": "other",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: Container Outturn Report Format"
  },
  {
    "code": "CONTAINER_SUMMARY_BASED_ON_CARRIER_LIST_REPORT_FORMAT",
    "name": "Container Summary Based On Carrier List Report Format",
    "family": "ops_list",
    "contexts": [
      "list",
      "job"
    ],
    "formats": [
      "PDF",
      "XLSX",
      "CSV"
    ],
    "rolloutPhase": 1,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Container Summary Based On Carrier List Report Format",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "CONTAINER_UNLOAD_PLAN_REPORT_FORMAT",
    "name": "Container Unload Plan Report Format",
    "family": "other",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: Container Unload Plan Report Format"
  },
  {
    "code": "CONTAINER_VGM_FORM_REPORT_FORMAT",
    "name": "Container VGM Form Report Format",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Container VGM Form Report Format",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "CREATED_INVOICE_LIST_REPORT_FORMAT",
    "name": "Created Invoice List Report Format",
    "family": "ops_list",
    "contexts": [
      "list",
      "job"
    ],
    "formats": [
      "PDF",
      "XLSX",
      "CSV"
    ],
    "rolloutPhase": 1,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Created Invoice List Report Format",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "CREATED_QUOTATIONS_LIST_REPORT_FORMAT",
    "name": "Created Quotations List Report Format",
    "family": "ops_list",
    "contexts": [
      "list",
      "job"
    ],
    "formats": [
      "PDF",
      "XLSX",
      "CSV"
    ],
    "rolloutPhase": 1,
    "gapStatus": "covered_analytics",
    "description": "FRESA sample: Created Quotations List Report Format",
    "existingPath": "/quotations/reports",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "CREDIT_NOTE_REPORT_FORMAT_1",
    "name": "Credit Note Report Format-1",
    "family": "commercial",
    "contexts": [
      "invoice"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 4,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Credit Note Report Format-1",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "CREDIT_NOTE_REPORT_FORMAT_2",
    "name": "Credit Note Report Format-2",
    "family": "commercial",
    "contexts": [
      "invoice"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 4,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Credit Note Report Format-2",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "CREDIT_NOTE_REPORT_FORMAT_3",
    "name": "Credit Note Report Format-3",
    "family": "commercial",
    "contexts": [
      "invoice"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 4,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Credit Note Report Format-3",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "CREDIT_NOTE_REPORT_FORMAT_4",
    "name": "Credit Note Report Format-4",
    "family": "commercial",
    "contexts": [
      "invoice"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 4,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Credit Note Report Format-4",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "CREDIT_NOTE_REPORT_FORMAT_5",
    "name": "Credit Note Report Format-5",
    "family": "commercial",
    "contexts": [
      "invoice"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 4,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Credit Note Report Format-5",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "CREDIT_NOTE_REPORT_FORMAT_6",
    "name": "Credit Note Report Format-6",
    "family": "commercial",
    "contexts": [
      "invoice"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 4,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Credit Note Report Format-6",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "CREDIT_NOTE_REPORT_FORMAT_7",
    "name": "Credit Note Report Format-7",
    "family": "commercial",
    "contexts": [
      "invoice"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 4,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Credit Note Report Format-7",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "CREDIT_NOTE_REPORT_FORMAT_8",
    "name": "Credit Note Report Format-8",
    "family": "commercial",
    "contexts": [
      "invoice"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 4,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Credit Note Report Format-8",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "CREDIT_NOTE_REPORT_FORMAT_9",
    "name": "Credit Note Report Format-9",
    "family": "commercial",
    "contexts": [
      "invoice"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 4,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Credit Note Report Format-9",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "CREDIT_NOTE_REPORT_FORMAT_10",
    "name": "Credit Note Report Format-10",
    "family": "commercial",
    "contexts": [
      "invoice"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 4,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Credit Note Report Format-10",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "DAILY_STATUS_REPORT_FORMAT_1",
    "name": "Daily Status Report Format-1",
    "family": "ops_list",
    "contexts": [
      "list",
      "job"
    ],
    "formats": [
      "PDF",
      "XLSX",
      "CSV"
    ],
    "rolloutPhase": 1,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Daily Status Report Format-1",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "DAILY_STATUS_REPORT_FORMAT_1_DSR_LIST_REPORT_FORMAT",
    "name": "Daily Status Report Format 1 (DSR) List Report Format",
    "family": "ops_list",
    "contexts": [
      "list",
      "job"
    ],
    "formats": [
      "PDF",
      "XLSX",
      "CSV"
    ],
    "rolloutPhase": 1,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Daily Status Report Format 1 (DSR) List Report Format",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "DAILY_STATUS_REPORT_FORMAT_2",
    "name": "Daily Status Report Format-2",
    "family": "ops_list",
    "contexts": [
      "list",
      "job"
    ],
    "formats": [
      "PDF",
      "XLSX",
      "CSV"
    ],
    "rolloutPhase": 1,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Daily Status Report Format-2",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "DAILY_STATUS_REPORT_FORMAT_3",
    "name": "Daily Status Report Format-3",
    "family": "ops_list",
    "contexts": [
      "list"
    ],
    "formats": [
      "PDF",
      "XLSX",
      "CSV"
    ],
    "rolloutPhase": 1,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Daily Status Report Format-3",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "DAILY_STATUS_REPORT_FORMAT_4",
    "name": "Daily Status Report Format-4",
    "family": "ops_list",
    "contexts": [
      "list"
    ],
    "formats": [
      "PDF",
      "XLSX",
      "CSV"
    ],
    "rolloutPhase": 1,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Daily Status Report Format-4",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "DAILY_STATUS_REPORT_FORMAT_5",
    "name": "Daily Status Report Format-5",
    "family": "ops_list",
    "contexts": [
      "list"
    ],
    "formats": [
      "PDF",
      "XLSX",
      "CSV"
    ],
    "rolloutPhase": 1,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Daily Status Report Format-5",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "DAILY_STATUS_REPORT_FORMAT_6",
    "name": "Daily Status Report Format-6",
    "family": "ops_list",
    "contexts": [
      "list"
    ],
    "formats": [
      "PDF",
      "XLSX",
      "CSV"
    ],
    "rolloutPhase": 1,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Daily Status Report Format-6",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "DAILY_STATUS_REPORT_FORMAT_7",
    "name": "Daily Status Report Format-7",
    "family": "ops_list",
    "contexts": [
      "list"
    ],
    "formats": [
      "PDF",
      "XLSX",
      "CSV"
    ],
    "rolloutPhase": 1,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Daily Status Report Format-7",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "DAILY_STATUS_REPORT_FORMAT_8",
    "name": "Daily Status Report Format-8",
    "family": "ops_list",
    "contexts": [
      "list"
    ],
    "formats": [
      "PDF",
      "XLSX",
      "CSV"
    ],
    "rolloutPhase": 1,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Daily Status Report Format-8",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "DAILY_STATUS_REPORT_FORMAT_9",
    "name": "Daily Status Report Format-9",
    "family": "ops_list",
    "contexts": [
      "list"
    ],
    "formats": [
      "PDF",
      "XLSX",
      "CSV"
    ],
    "rolloutPhase": 1,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Daily Status Report Format-9",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "DAILY_STATUS_REPORT_FORMAT_10",
    "name": "Daily Status Report Format-10",
    "family": "ops_list",
    "contexts": [
      "list"
    ],
    "formats": [
      "PDF",
      "XLSX",
      "CSV"
    ],
    "rolloutPhase": 1,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Daily Status Report Format-10",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "DAILY_STATUS_REPORT_FORMAT_11",
    "name": "Daily Status Report Format-11",
    "family": "ops_list",
    "contexts": [
      "list"
    ],
    "formats": [
      "PDF",
      "XLSX",
      "CSV"
    ],
    "rolloutPhase": 1,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Daily Status Report Format-11",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "DAILY_STATUS_REPORT_FORMAT_12",
    "name": "Daily Status Report Format-12",
    "family": "ops_list",
    "contexts": [
      "list"
    ],
    "formats": [
      "PDF",
      "XLSX",
      "CSV"
    ],
    "rolloutPhase": 1,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Daily Status Report Format-12",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "DAILY_STATUS_REPORT_FORMAT_13",
    "name": "Daily Status Report Format-13",
    "family": "ops_list",
    "contexts": [
      "list"
    ],
    "formats": [
      "PDF",
      "XLSX",
      "CSV"
    ],
    "rolloutPhase": 1,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Daily Status Report Format-13",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "DAILY_STATUS_REPORT_FORMAT_14",
    "name": "Daily Status Report Format-14",
    "family": "ops_list",
    "contexts": [
      "list"
    ],
    "formats": [
      "PDF",
      "XLSX",
      "CSV"
    ],
    "rolloutPhase": 1,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Daily Status Report Format-14",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "DAILY_STATUS_REPORT_FORMAT_15",
    "name": "Daily Status Report Format-15",
    "family": "ops_list",
    "contexts": [
      "list"
    ],
    "formats": [
      "PDF",
      "XLSX",
      "CSV"
    ],
    "rolloutPhase": 1,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Daily Status Report Format-15",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "DAILY_STATUS_REPORT_FORMAT_16",
    "name": "Daily Status Report Format-16",
    "family": "ops_list",
    "contexts": [
      "list"
    ],
    "formats": [
      "PDF",
      "XLSX",
      "CSV"
    ],
    "rolloutPhase": 1,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Daily Status Report Format-16",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "DAILY_STATUS_REPORT_FORMAT_17",
    "name": "Daily Status Report Format-17",
    "family": "ops_list",
    "contexts": [
      "list"
    ],
    "formats": [
      "PDF",
      "XLSX",
      "CSV"
    ],
    "rolloutPhase": 1,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Daily Status Report Format-17",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "DAILY_STATUS_REPORT_FORMAT_18",
    "name": "Daily Status Report Format-18",
    "family": "ops_list",
    "contexts": [
      "list"
    ],
    "formats": [
      "PDF",
      "XLSX",
      "CSV"
    ],
    "rolloutPhase": 1,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Daily Status Report Format-18",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "DAILY_STATUS_REPORT_FORMAT_19",
    "name": "Daily Status Report Format-19",
    "family": "ops_list",
    "contexts": [
      "list"
    ],
    "formats": [
      "PDF",
      "XLSX",
      "CSV"
    ],
    "rolloutPhase": 1,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Daily Status Report Format-19",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "DAILY_STATUS_REPORT_FORMAT_20",
    "name": "Daily Status Report Format-20",
    "family": "ops_list",
    "contexts": [
      "list"
    ],
    "formats": [
      "PDF",
      "XLSX",
      "CSV"
    ],
    "rolloutPhase": 1,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Daily Status Report Format-20",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "DAILY_STATUS_REPORT_FORMAT_21",
    "name": "Daily Status Report Format-21",
    "family": "ops_list",
    "contexts": [
      "list"
    ],
    "formats": [
      "PDF",
      "XLSX",
      "CSV"
    ],
    "rolloutPhase": 1,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Daily Status Report Format-21",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "DAILY_STATUS_REPORT_FORMAT_22",
    "name": "Daily Status Report Format-22",
    "family": "ops_list",
    "contexts": [
      "list"
    ],
    "formats": [
      "PDF",
      "XLSX",
      "CSV"
    ],
    "rolloutPhase": 1,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Daily Status Report Format-22",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "DEBIT_NOTE_REPORT_FORMAT_1",
    "name": "Debit Note Report Format-1",
    "family": "commercial",
    "contexts": [
      "invoice"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 4,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Debit Note Report Format-1",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "DEBIT_NOTE_REPORT_FORMAT_2",
    "name": "Debit Note Report Format-2",
    "family": "commercial",
    "contexts": [
      "invoice"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 4,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Debit Note Report Format-2",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "DEBIT_NOTE_REPORT_FORMAT_3",
    "name": "Debit Note Report Format-3",
    "family": "commercial",
    "contexts": [
      "invoice"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 4,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Debit Note Report Format-3",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "DEBIT_NOTE_REPORT_FORMAT_4",
    "name": "Debit Note Report Format-4",
    "family": "commercial",
    "contexts": [
      "invoice"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 4,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Debit Note Report Format-4",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "DEBIT_NOTE_REPORT_FORMAT_5",
    "name": "Debit Note Report Format-5",
    "family": "commercial",
    "contexts": [
      "invoice"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 4,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Debit Note Report Format-5",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "DEBIT_NOTE_REPORT_FORMAT_6",
    "name": "Debit Note Report Format-6",
    "family": "commercial",
    "contexts": [
      "invoice"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 4,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Debit Note Report Format-6",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "DEBIT_NOTE_REPORT_FORMAT_7",
    "name": "Debit Note Report Format-7",
    "family": "commercial",
    "contexts": [
      "invoice"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 4,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Debit Note Report Format-7",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "DEBIT_NOTE_REPORT_FORMAT_8",
    "name": "Debit Note Report Format-8",
    "family": "commercial",
    "contexts": [
      "invoice"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 4,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Debit Note Report Format-8",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "DEBIT_NOTE_REPORT_FORMAT_9",
    "name": "Debit Note Report Format-9",
    "family": "commercial",
    "contexts": [
      "invoice"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 4,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Debit Note Report Format-9",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "DEBIT_NOTE_REPORT_FORMAT_10",
    "name": "Debit Note Report Format-10",
    "family": "commercial",
    "contexts": [
      "invoice"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 4,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Debit Note Report Format-10",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "DELIVERY_CONFIRMATION_OSA_REPORT_FORMAT",
    "name": "Delivery Confirmation OSA Report Format",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: Delivery Confirmation OSA Report Format"
  },
  {
    "code": "DELIVERY_CONFIRMATION_REPORT_FORMAT",
    "name": "Delivery Confirmation Report Format",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Delivery Confirmation Report Format",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "DELIVERY_ORDER_AIR_JASPER_REPORT_FORMAT",
    "name": "Delivery Order AIR Jasper Report Format",
    "family": "air_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 3,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Delivery Order AIR Jasper Report Format",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "DELIVERY_ORDER_REPORT_FORMAT_2",
    "name": "Delivery Order Report Format-2",
    "family": "air_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 3,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Delivery Order Report Format-2",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "DELIVERY_ORDER_REPORT_FORMAT_3",
    "name": "Delivery Order Report Format-3",
    "family": "air_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 3,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Delivery Order Report Format-3",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "DELIVERY_ORDER_REPORT_FORMAT_4",
    "name": "Delivery Order Report Format-4",
    "family": "air_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 3,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Delivery Order Report Format-4",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "DELIVERY_ORDER_REPORT_FORMAT_5",
    "name": "Delivery Order Report Format-5",
    "family": "air_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 3,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Delivery Order Report Format-5",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "DELIVERY_ORDER_REPORT_FORMAT_6",
    "name": "Delivery Order Report Format-6",
    "family": "air_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 3,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Delivery Order Report Format-6",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "DELIVERY_ORDER_REPORT_FORMAT_7",
    "name": "Delivery Order Report Format-7",
    "family": "air_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 3,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Delivery Order Report Format-7",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "DELIVERY_ORDER_REPORT_FORMAT_8",
    "name": "Delivery Order Report Format-8",
    "family": "air_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 3,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Delivery Order Report Format-8",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "DELIVERY_ORDER_REPORT_FORMAT_9",
    "name": "Delivery Order Report Format-9",
    "family": "air_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 3,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Delivery Order Report Format-9",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "DELIVERY_ORDER_REPORT_FORMAT_10",
    "name": "Delivery Order Report Format-10",
    "family": "air_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 3,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Delivery Order Report Format-10",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "DELIVERY_ORDER_REPORT_FORMAT_11",
    "name": "Delivery Order Report Format-11",
    "family": "air_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 3,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Delivery Order Report Format-11",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "DELIVERY_ORDER_REPORT_FORMAT_12",
    "name": "Delivery Order Report Format-12",
    "family": "air_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 3,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Delivery Order Report Format-12",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "DELIVERY_ORDER_REPORT_FORMAT_13",
    "name": "Delivery Order Report Format-13",
    "family": "air_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 3,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Delivery Order Report Format-13",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "DELIVERY_ORDER_REPORT_FORMAT_14",
    "name": "Delivery Order Report Format-14",
    "family": "air_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 3,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Delivery Order Report Format-14",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "DELIVERY_ORDER_REPORT_FORMAT_15",
    "name": "Delivery Order Report Format-15",
    "family": "air_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 3,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Delivery Order Report Format-15",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "DELIVERY_ORDER_REPORT_FORMAT_16",
    "name": "Delivery Order Report Format-16",
    "family": "air_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 3,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Delivery Order Report Format-16",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "DELIVERY_ORDER_REPORT_FORMAT_17",
    "name": "Delivery Order Report Format-17",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: Delivery Order Report Format-17"
  },
  {
    "code": "DELIVERY_ORDER_REPORT_FORMAT_18",
    "name": "Delivery Order Report Format-18",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: Delivery Order Report Format-18"
  },
  {
    "code": "DELIVERY_ORDER_REPORT_FORMAT_FCL_VIETNAM",
    "name": "Delivery Order FCL Vietnam",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: Delivery Order FCL Vietnam"
  },
  {
    "code": "DELIVERY_ORDER_REPORT_FORMAT_LCL_VIETNAM_WITHOUT_STAMP",
    "name": "Delivery Order LCL Vietnam Without Stamp",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: Delivery Order LCL Vietnam Without Stamp"
  },
  {
    "code": "DO_ISSUED_SHIPMENT_LIST_REPORT_FORMAT",
    "name": "Do Issued Shipment List Report Format",
    "family": "ops_list",
    "contexts": [
      "list",
      "job"
    ],
    "formats": [
      "PDF",
      "XLSX",
      "CSV"
    ],
    "rolloutPhase": 1,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Do Issued Shipment List Report Format",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "EXCHANGE_LETTER_TO_CARRIER_AGENT_REPORT_FORMAT",
    "name": "Exchange Letter To Carrier Agent Report Format",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Exchange Letter To Carrier Agent Report Format",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "EXPORT_CARGO_READY_BUT_NOT_STUFFED_LIST_REPORT_FORMAT",
    "name": "Export Cargo Ready But Not Stuffed List Report Format",
    "family": "ops_list",
    "contexts": [
      "list",
      "job"
    ],
    "formats": [
      "PDF",
      "XLSX",
      "CSV"
    ],
    "rolloutPhase": 1,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Export Cargo Ready But Not Stuffed List Report Format",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "EXPORT_SHIPMENTS_DEPARTED_BUT_NOT_CONFIRMED_ON_BOARD_LIST_REPORT_FORMAT",
    "name": "Export Shipments Departed But Not Confirmed On Board List Report Format",
    "family": "ops_list",
    "contexts": [
      "list",
      "job"
    ],
    "formats": [
      "PDF",
      "XLSX",
      "CSV"
    ],
    "rolloutPhase": 1,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Export Shipments Departed But Not Confirmed On Board List Report Format",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "FCL_QUOTATION_REPORT_FORMAT",
    "name": "FCL Quotation Report Format",
    "family": "quotation",
    "contexts": [
      "quotation"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 4,
    "gapStatus": "partial_document_pdf",
    "description": "FCL Quotation Report Format",
    "defaultParams": [
      {
        "name": "quotation_id",
        "label": "Quotation",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "FCR_DOCUMENT_REPORT_FORMAT",
    "name": "FCR Document Report Format",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: FCR Document Report Format",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "FG_ARRIVAL_INFORMATION",
    "name": "FG Arrival Information",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: FG Arrival Information"
  },
  {
    "code": "FG_ARRIVAL_NOTICE",
    "name": "FG Arrival Notice",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: FG Arrival Notice"
  },
  {
    "code": "FG_ARRIVAL_NOTICE_FORMAT_2",
    "name": "FG Arrival Notice Format-2",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: FG Arrival Notice Format-2"
  },
  {
    "code": "FG_ARRIVAL_NOTICE_FORMAT_3",
    "name": "FG Arrival Notice Format-3",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: FG Arrival Notice Format-3"
  },
  {
    "code": "FG_ARRIVAL_NOTICE_WITHOUT_CHARGES",
    "name": "FG Arrival Notice Without Charges",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: FG Arrival Notice Without Charges"
  },
  {
    "code": "FG_CARGO_ARRIVAL_NOTICE",
    "name": "FG Cargo Arrival Notice",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: FG Cargo Arrival Notice"
  },
  {
    "code": "FG_CARGO_ARRIVAL_NOTICE_FORMAT_1",
    "name": "FG Cargo Arrival Notice Format-1",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: FG Cargo Arrival Notice Format-1"
  },
  {
    "code": "FG_CARGO_ARRIVAL_NOTICE_SEA",
    "name": "FG Cargo Arrival Notice SEA",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: FG Cargo Arrival Notice SEA"
  },
  {
    "code": "FG_CARGO_ARRIVAL_NOTICE_SEA_FORMAT_3",
    "name": "FG Cargo Arrival Notice SEA Format-3",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: FG Cargo Arrival Notice SEA Format-3"
  },
  {
    "code": "FG_CONSIGNMENT_DELIVERY_NOTE",
    "name": "FG Consignment Delivery Note",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: FG Consignment Delivery Note"
  },
  {
    "code": "FG_CONSIGNMENT_DELIVERY_NOTE_FORMAT_1",
    "name": "FG Consignment Delivery Note Format-1",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: FG Consignment Delivery Note Format-1"
  },
  {
    "code": "FG_DELIVERY_NOC_LETTER",
    "name": "FG Delivery NOC Letter",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: FG Delivery NOC Letter"
  },
  {
    "code": "FG_DELIVERY_NOTE",
    "name": "FG Delivery Note",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: FG Delivery Note"
  },
  {
    "code": "FG_DELIVERY_NOTE_FORMAT_1",
    "name": "FG Delivery Note Format-1",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: FG Delivery Note Format-1"
  },
  {
    "code": "FG_DELIVERY_NOTE_FORMAT_UK",
    "name": "FG Delivery Note Format UK",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: FG Delivery Note Format UK"
  },
  {
    "code": "FG_DELIVERY_ORDER_ABU_DHABI",
    "name": "FG Delivery Order Abu Dhabi",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: FG Delivery Order Abu Dhabi"
  },
  {
    "code": "FG_DELIVERY_ORDER_AIR_FORMAT_1",
    "name": "FG Delivery Order Air Format-1",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: FG Delivery Order Air Format-1"
  },
  {
    "code": "FG_DELIVERY_ORDER_AIR_FORMAT_2",
    "name": "FG Delivery Order Air Format-2",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: FG Delivery Order Air Format-2"
  },
  {
    "code": "FG_DELIVERY_ORDER_AIR_USA",
    "name": "FG Delivery Order Air USA",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: FG Delivery Order Air USA"
  },
  {
    "code": "FG_DELIVERY_ORDER_FOR_TRUCKER",
    "name": "FG Delivery Order For Trucker",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: FG Delivery Order For Trucker"
  },
  {
    "code": "FG_DELIVERY_ORDER_FORMAT_8",
    "name": "FG Delivery Order Format-8",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: FG Delivery Order Format-8"
  },
  {
    "code": "FG_DELIVERY_ORDER_FORMAT_16",
    "name": "FG Delivery Order Format-16",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: FG Delivery Order Format-16"
  },
  {
    "code": "FG_DELIVERY_ORDER_SEA_FORMAT_1",
    "name": "FG Delivery Order SEA Format-1",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: FG Delivery Order SEA Format-1"
  },
  {
    "code": "FG_DELIVERY_ORDER_SEA_FORMAT_3",
    "name": "FG Delivery Order SEA Format-3",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: FG Delivery Order SEA Format-3"
  },
  {
    "code": "FG_DELIVERY_ORDER_SEA_FORMAT_5",
    "name": "FG Delivery Order SEA Format-5",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: FG Delivery Order SEA Format-5"
  },
  {
    "code": "FG_DELIVERY_ORDER_SEA_FORMAT_6",
    "name": "FG Delivery Order SEA Format-6",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: FG Delivery Order SEA Format-6"
  },
  {
    "code": "FG_DELIVERY_ORDER_SEA_FORMAT_7",
    "name": "FG Delivery Order SEA Format-7",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: FG Delivery Order SEA Format-7"
  },
  {
    "code": "FG_DELIVERY_ORDER_SEA_FORMAT_10",
    "name": "FG Delivery Order SEA Format-10",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: FG Delivery Order SEA Format-10"
  },
  {
    "code": "FG_E_DELIVERY_ORDER",
    "name": "FG E-Delivery Order",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: FG E-Delivery Order"
  },
  {
    "code": "FG_E_DELIVERY_ORDER_SEA_FORMAT_1",
    "name": "FG E-Delivery Order SEA Format-1",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: FG E-Delivery Order SEA Format-1"
  },
  {
    "code": "FG_EXPORT_DELIVERY_ORDER",
    "name": "FG Export Delivery Order",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: FG Export Delivery Order"
  },
  {
    "code": "FG_HBL_FORMAT_1",
    "name": "FG HBL Format-1",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: FG HBL Format-1"
  },
  {
    "code": "FG_HBL_HKG",
    "name": "FG HBL HKG",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: FG HBL HKG"
  },
  {
    "code": "FG_HBL_MAGICLOGISYS",
    "name": "FG HBL Magiclogisys",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: FG HBL Magiclogisys"
  },
  {
    "code": "FG_HBL_ORIGINAL_FORMAT_87",
    "name": "FG HBL Original Format-87",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: FG HBL Original Format-87"
  },
  {
    "code": "FG_NOTICE_OF_DELIVERY",
    "name": "FG Notice Of Delivery",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: FG Notice Of Delivery"
  },
  {
    "code": "FG_PROOF_OF_DELIVERY",
    "name": "FG Proof Of Delivery / HBL PLMAAJEA00081",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: FG Proof Of Delivery / HBL PLMAAJEA00081"
  },
  {
    "code": "FREIGHT_MANIFEST_FOR_GROUPAGE_IMPORTS_LCL_REPORT_FORMAT",
    "name": "Freight Manifest For Groupage Imports LCL Report Format",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Freight Manifest For Groupage Imports LCL Report Format",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "FREIGHT_MANIFEST_LCL_EXPORTS_REPORT_FORMAT",
    "name": "Freight Manifest LCL Exports Report Format",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Freight Manifest LCL Exports Report Format",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "GL_LISTING_SORT_BY_CUSTOMER_CODE_VOUCHER_REPORT_FORMAT",
    "name": "GL Listing Sort By Customer Code Voucher Report Format",
    "family": "finance",
    "contexts": [
      "gl",
      "list"
    ],
    "formats": [
      "PDF",
      "XLSX"
    ],
    "rolloutPhase": 5,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: GL Listing Sort By Customer Code Voucher Report Format",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "GL_REPORT_CURRENCY_WISE_VOUCHER_REPORT_FORMAT",
    "name": "GL Report Currency Wise Voucher Report Format",
    "family": "finance",
    "contexts": [
      "gl",
      "list"
    ],
    "formats": [
      "PDF",
      "XLSX"
    ],
    "rolloutPhase": 5,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: GL Report Currency Wise Voucher Report Format",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "GL_REPORT_VOUCHER_REPORT_FORMAT",
    "name": "GL Report Voucher Report Format",
    "family": "finance",
    "contexts": [
      "gl",
      "list"
    ],
    "formats": [
      "PDF",
      "XLSX"
    ],
    "rolloutPhase": 5,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: GL Report Voucher Report Format",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "HAWB_DRAFT_REPORT_FORMAT",
    "name": "HAWB Draft Report Format",
    "family": "air_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 3,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: HAWB Draft Report Format",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "HAWB_DRAFT_REPORT_FORMAT_1",
    "name": "HAWB Draft Report Format-1",
    "family": "air_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 3,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: HAWB Draft Report Format-1",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "HAWB_DRAFT_REPORT_FORMAT_2",
    "name": "HAWB Draft Report Format-2",
    "family": "air_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 3,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: HAWB Draft Report Format-2",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "HAWB_DRAFT_REPORT_FORMAT_3",
    "name": "HAWB Draft Report Format-3",
    "family": "air_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 3,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: HAWB Draft Report Format-3",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "HAWB_DRAFT_REPORT_FORMAT_4",
    "name": "HAWB Draft Report Format-4",
    "family": "air_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 3,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: HAWB Draft Report Format-4",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "HAWB_DRAFT_REPORT_FORMAT_5",
    "name": "HAWB Draft Report Format-5",
    "family": "air_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 3,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: HAWB Draft Report Format-5",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "HAWB_DRAFT_REPORT_FORMAT_6",
    "name": "HAWB Draft Report Format-6",
    "family": "air_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 3,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: HAWB Draft Report Format-6",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "HAWB_DRAFT_REPORT_FORMAT_7",
    "name": "HAWB Draft Report Format-7",
    "family": "air_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 3,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: HAWB Draft Report Format-7",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "HAWB_DRAFT_REPORT_FORMAT_8",
    "name": "HAWB Draft Report Format-8",
    "family": "air_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 3,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: HAWB Draft Report Format-8",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "HAWB_DRAFT_REPORT_FORMAT_9",
    "name": "HAWB Draft Report Format-9",
    "family": "air_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 3,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: HAWB Draft Report Format-9",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "HAWB_DRAFT_REPORT_FORMAT_10",
    "name": "HAWB Draft Report Format-10",
    "family": "air_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 3,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: HAWB Draft Report Format-10",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "HAWB_DRAFT_REPORT_FORMAT_11",
    "name": "HAWB Draft Report Format-11",
    "family": "air_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 3,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: HAWB Draft Report Format-11",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "HAWB_DRAFT_REPORT_FORMAT_12",
    "name": "HAWB Draft Report Format-12",
    "family": "air_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 3,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: HAWB Draft Report Format-12",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "HAWB_DRAFT_REPORT_FORMAT_13",
    "name": "HAWB Draft Report Format-13",
    "family": "air_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 3,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: HAWB Draft Report Format-13",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "HAWB_DRAFT_REPORT_FORMAT_14",
    "name": "HAWB Draft Report Format-14",
    "family": "air_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 3,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: HAWB Draft Report Format-14",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "HAWB_DRAFT_REPORT_FORMAT_15",
    "name": "HAWB Draft Report Format-15",
    "family": "air_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 3,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: HAWB Draft Report Format-15",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "HAWB_DRAFT_REPORT_FORMAT_16",
    "name": "HAWB Draft Report Format-16",
    "family": "air_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 3,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: HAWB Draft Report Format-16",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "HAWB_DRAFT_REPORT_FORMAT_17",
    "name": "HAWB Draft Report Format-17",
    "family": "air_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 3,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: HAWB Draft Report Format-17",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "HAWB_DRAFT_REPORT_FORMAT_18",
    "name": "HAWB Draft Report Format-18",
    "family": "air_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 3,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: HAWB Draft Report Format-18",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "HAWB_DRAFT_REPORT_FORMAT_19",
    "name": "HAWB Draft Report Format-19",
    "family": "air_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 3,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: HAWB Draft Report Format-19",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "HAWB_DRAFT_REPORT_FORMAT_20",
    "name": "HAWB Draft Report Format-20",
    "family": "air_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 3,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: HAWB Draft Report Format-20",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "HAWB_DRAFT_REPORT_FORMAT_21",
    "name": "HAWB Draft Report Format-21",
    "family": "air_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 3,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: HAWB Draft Report Format-21",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "HAWB_DRAFT_REPORT_FORMAT_22",
    "name": "HAWB Draft Report Format-22",
    "family": "air_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 3,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: HAWB Draft Report Format-22",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "HAWB_DRAFT_REPORT_FORMAT_23",
    "name": "HAWB Draft Report Format-23",
    "family": "air_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 3,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: HAWB Draft Report Format-23",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "HAWB_DRAFT_REPORT_FORMAT_24",
    "name": "HAWB Draft Report Format-24",
    "family": "air_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 3,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: HAWB Draft Report Format-24",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "HAWB_DRAFT_REPORT_FORMAT_25",
    "name": "HAWB Draft Report Format-25",
    "family": "air_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 3,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: HAWB Draft Report Format-25",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "HAWB_DRAFT_REPORT_FORMAT_26",
    "name": "HAWB Draft Report Format-26",
    "family": "air_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 3,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: HAWB Draft Report Format-26",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "HAWB_DRAFT_REPORT_FORMAT_27",
    "name": "HAWB Draft Report Format-27",
    "family": "air_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 3,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: HAWB Draft Report Format-27",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "HAWB_ORIGINAL_PRE_PRINTED_REPORT_FORMAT_1",
    "name": "HAWB Original Pre Printed Report Format-1",
    "family": "air_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 3,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: HAWB Original Pre Printed Report Format-1",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "HAWB_ORIGINAL_PRE_PRINTED_REPORT_FORMAT_2",
    "name": "HAWB Original Pre Printed Report Format-2",
    "family": "air_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 3,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: HAWB Original Pre Printed Report Format-2",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_2",
    "name": "HBL Draft Report Format-2",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "House Bill of Lading draft Jasper format 2",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_4",
    "name": "HBL Draft Report Format-4",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "House Bill of Lading draft Jasper format 3",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_5",
    "name": "HBL Draft Report Format-5",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "House Bill of Lading draft Jasper format 4",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_6",
    "name": "HBL Draft Report Format-6",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "House Bill of Lading draft Jasper format 5",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_7",
    "name": "HBL Draft Report Format-7",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "House Bill of Lading draft Jasper format 6",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_8",
    "name": "HBL Draft Report Format-8",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "House Bill of Lading draft Jasper format 7",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_9",
    "name": "HBL Draft Report Format-9",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "House Bill of Lading draft Jasper format 8",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_10",
    "name": "HBL Draft Report Format-10",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "House Bill of Lading draft Jasper format 9",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_11",
    "name": "HBL Draft Report Format-11",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "House Bill of Lading draft Jasper format 10",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_12",
    "name": "HBL Draft Report Format-12",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "House Bill of Lading draft Jasper format 11",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_13",
    "name": "HBL Draft Report Format-13",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "House Bill of Lading draft Jasper format 12",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_14",
    "name": "HBL Draft Report Format-14",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "House Bill of Lading draft Jasper format 13",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_15",
    "name": "HBL Draft Report Format-15",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "House Bill of Lading draft Jasper format 14",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_16",
    "name": "HBL Draft Report Format-16",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "House Bill of Lading draft Jasper format 15",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_17",
    "name": "HBL Draft Report Format-17",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "House Bill of Lading draft Jasper format 16",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_18",
    "name": "HBL Draft Report Format-18",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "House Bill of Lading draft Jasper format 17",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_19",
    "name": "HBL Draft Report Format-19",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "House Bill of Lading draft Jasper format 18",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_20",
    "name": "HBL Draft Report Format-20",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "House Bill of Lading draft Jasper format 19",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_21",
    "name": "HBL Draft Report Format-21",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: HBL Draft Report Format-21",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_22",
    "name": "HBL Draft Report Format-22",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: HBL Draft Report Format-22",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_23",
    "name": "HBL Draft Report Format-23",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: HBL Draft Report Format-23",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_24",
    "name": "HBL Draft Report Format-24",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: HBL Draft Report Format-24",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_25",
    "name": "HBL Draft Report Format-25",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: HBL Draft Report Format-25",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_26",
    "name": "HBL Draft Report Format-26",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: HBL Draft Report Format-26",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_27",
    "name": "HBL Draft Report Format-27",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: HBL Draft Report Format-27",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_28",
    "name": "HBL Draft Report Format-28",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: HBL Draft Report Format-28",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_29",
    "name": "HBL Draft Report Format-29",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: HBL Draft Report Format-29",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_30",
    "name": "HBL Draft Report Format-30",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: HBL Draft Report Format-30",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_31",
    "name": "HBL Draft Report Format-31",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: HBL Draft Report Format-31",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_32",
    "name": "HBL Draft Report Format-32",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: HBL Draft Report Format-32",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_33",
    "name": "HBL Draft Report Format-33",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: HBL Draft Report Format-33",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_34",
    "name": "HBL Draft Report Format-34",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: HBL Draft Report Format-34",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_35",
    "name": "HBL Draft Report Format-35",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: HBL Draft Report Format-35",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_36",
    "name": "HBL Draft Report Format-36",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: HBL Draft Report Format-36",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_37",
    "name": "HBL Draft Report Format-37",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: HBL Draft Report Format-37",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_38",
    "name": "HBL Draft Report Format-38",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: HBL Draft Report Format-38",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_39",
    "name": "HBL Draft Report Format-39",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: HBL Draft Report Format-39",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_40",
    "name": "HBL Draft Report Format-40",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: HBL Draft Report Format-40",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_41",
    "name": "HBL Draft Report Format-41",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: HBL Draft Report Format-41",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_42",
    "name": "HBL Draft Report Format-42",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: HBL Draft Report Format-42",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_43",
    "name": "HBL Draft Report Format-43",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: HBL Draft Report Format-43",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_44",
    "name": "HBL Draft Report Format-44",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: HBL Draft Report Format-44",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_45",
    "name": "HBL Draft Report Format-45",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: HBL Draft Report Format-45",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_46",
    "name": "HBL Draft Report Format-46",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: HBL Draft Report Format-46",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_47",
    "name": "HBL Draft Report Format-47",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: HBL Draft Report Format-47",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_48",
    "name": "HBL Draft Report Format-48",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: HBL Draft Report Format-48",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_49",
    "name": "HBL Draft Report Format-49",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: HBL Draft Report Format-49",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_50",
    "name": "HBL Draft Report Format-50",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: HBL Draft Report Format-50",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_51",
    "name": "HBL Draft Report Format-51",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: HBL Draft Report Format-51"
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_52",
    "name": "HBL Draft Report Format-52",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: HBL Draft Report Format-52"
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_53",
    "name": "HBL Draft Report Format-53",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: HBL Draft Report Format-53"
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_54",
    "name": "HBL Draft Report Format-54",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: HBL Draft Report Format-54"
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_55",
    "name": "HBL Draft Report Format-55",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: HBL Draft Report Format-55"
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_56",
    "name": "HBL Draft Report Format-56",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: HBL Draft Report Format-56"
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_59",
    "name": "HBL Draft Report Format-59",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: HBL Draft Report Format-59"
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_60",
    "name": "HBL Draft Report Format-60",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: HBL Draft Report Format-60"
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_61",
    "name": "HBL Draft Report Format-61",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: HBL Draft Report Format-61"
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_63",
    "name": "HBL Draft Report Format-63",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: HBL Draft Report Format-63"
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_64",
    "name": "HBL Draft Report Format-64",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: HBL Draft Report Format-64"
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_65",
    "name": "HBL Draft Report Format-65",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: HBL Draft Report Format-65"
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_66",
    "name": "HBL Draft Report Format-66",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: HBL Draft Report Format-66"
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_67",
    "name": "HBL Draft Report Format-67",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: HBL Draft Report Format-67"
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_68",
    "name": "HBL Draft Report Format-68",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: HBL Draft Report Format-68"
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_69",
    "name": "HBL Draft Report Format-69",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: HBL Draft Report Format-69"
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_70",
    "name": "HBL Draft Report Format-70",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: HBL Draft Report Format-70"
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_72",
    "name": "HBL Draft Report Format-72",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: HBL Draft Report Format-72"
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_73",
    "name": "HBL Draft Report Format-73",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: HBL Draft Report Format-73"
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_75",
    "name": "HBL Draft Report Format-75",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: HBL Draft Report Format-75"
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_77",
    "name": "HBL Draft Report Format-77",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: HBL Draft Report Format-77"
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_83",
    "name": "HBL Draft Report Format-83",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: HBL Draft Report Format-83"
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_84",
    "name": "HBL Draft Report Format-84",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: HBL Draft Report Format-84"
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_85",
    "name": "HBL Draft Report Format-85",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: HBL Draft Report Format-85"
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_86",
    "name": "HBL Draft Report Format-86",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: HBL Draft Report Format-86"
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_87",
    "name": "HBL Draft Report Format-87",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: HBL Draft Report Format-87"
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_88",
    "name": "HBL Draft Report Format-88",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: HBL Draft Report Format-88"
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_89",
    "name": "HBL Draft Report Format-89",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: HBL Draft Report Format-89"
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_90",
    "name": "HBL Draft Report Format-90",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: HBL Draft Report Format-90"
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_92",
    "name": "HBL Draft Report Format-92",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: HBL Draft Report Format-92"
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_95",
    "name": "HBL Draft Report Format-95",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: HBL Draft Report Format-95"
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_96",
    "name": "HBL Draft Report Format-96",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: HBL Draft Report Format-96"
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_97",
    "name": "HBL Draft Report Format-97",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: HBL Draft Report Format-97"
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_99",
    "name": "HBL Draft Report Format-99",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: HBL Draft Report Format-99"
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_100",
    "name": "HBL Draft Report Format-100",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: HBL Draft Report Format-100"
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_101",
    "name": "HBL Draft Report Format-101",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: HBL Draft Report Format-101"
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_102",
    "name": "HBL Draft Report Format-102",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: HBL Draft Report Format-102"
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_107",
    "name": "HBL Draft Report Format-107",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: HBL Draft Report Format-107"
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_109",
    "name": "HBL Draft Report Format-109",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: HBL Draft Report Format-109"
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_114",
    "name": "HBL Draft Report Format-114",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: HBL Draft Report Format-114"
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_116",
    "name": "HBL Draft Report Format-116",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: HBL Draft Report Format-116"
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_117",
    "name": "HBL Draft Report Format-117",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: HBL Draft Report Format-117"
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_118",
    "name": "HBL Draft Report Format-118",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: HBL Draft Report Format-118"
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_120",
    "name": "HBL Draft Report Format-120",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: HBL Draft Report Format-120"
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_122",
    "name": "HBL Draft Report Format-122",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: HBL Draft Report Format-122"
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_127",
    "name": "HBL Draft Report Format-127",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: HBL Draft Report Format-127"
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_128",
    "name": "HBL Draft Report Format-128",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: HBL Draft Report Format-128"
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_129",
    "name": "HBL Draft Report Format-129",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: HBL Draft Report Format-129"
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_130",
    "name": "HBL Draft Report Format-130",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: HBL Draft Report Format-130"
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_132",
    "name": "HBL Draft Report Format-132",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: HBL Draft Report Format-132"
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_134",
    "name": "HBL Draft Report Format-134",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: HBL Draft Report Format-134"
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_135",
    "name": "HBL Draft Report Format-135",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: HBL Draft Report Format-135"
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_136",
    "name": "HBL Draft Report Format-136",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: HBL Draft Report Format-136"
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_137",
    "name": "HBL Draft Report Format-137",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: HBL Draft Report Format-137"
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_138",
    "name": "HBL Draft Report Format-138",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: HBL Draft Report Format-138"
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_139",
    "name": "HBL Draft Report Format-139",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: HBL Draft Report Format-139"
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_140",
    "name": "HBL Draft Report Format-140",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: HBL Draft Report Format-140"
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_141",
    "name": "HBL Draft Report Format-141",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: HBL Draft Report Format-141"
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_142",
    "name": "HBL Draft Report Format-142",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: HBL Draft Report Format-142"
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_143",
    "name": "HBL Draft Report Format-143",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: HBL Draft Report Format-143"
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_144",
    "name": "HBL Draft Report Format-144",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: HBL Draft Report Format-144"
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_145",
    "name": "HBL Draft Report Format-145",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: HBL Draft Report Format-145"
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_146",
    "name": "HBL Draft Report Format-146",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: HBL Draft Report Format-146"
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_147",
    "name": "HBL Draft Report Format-147",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: HBL Draft Report Format-147"
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_148",
    "name": "HBL Draft Report Format-148",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: HBL Draft Report Format-148"
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_149",
    "name": "HBL Draft Report Format-149",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: HBL Draft Report Format-149"
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_151",
    "name": "HBL Draft Report Format-151",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: HBL Draft Report Format-151"
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_171",
    "name": "HBL Draft Report Format-171",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: HBL Draft Report Format-171"
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_172",
    "name": "HBL Draft Report Format-172",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: HBL Draft Report Format-172"
  },
  {
    "code": "HBL_DRAFT_REPORT_FORMAT_JASPER",
    "name": "HBL Draft Report Format Jasper",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "House Bill of Lading draft Jasper format 1",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "IMPORT_CARGO_MANIFEST_REPORT_FORMAT",
    "name": "Import Cargo Manifest Report Format",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Import Cargo Manifest Report Format",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "IMPORT_SECURITY_FILLING_JASPER_AMS_REPORT_FORMAT",
    "name": "Import Security Filling Jasper AMS Report Format",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Import Security Filling Jasper AMS Report Format",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "IMPORT_TALLY_SHEET_REPORT_FORMAT",
    "name": "Import Tally Sheet Report Format",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Import Tally Sheet Report Format",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "INVOICE_REPORT_FORMAT_1_TAX_INVOICE_INDIA",
    "name": "Invoice Report Format-1 Tax Invoice India",
    "family": "commercial",
    "contexts": [
      "invoice"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 4,
    "gapStatus": "partial_document_pdf",
    "description": "Invoice Report Format-1 Tax Invoice India — additional format; does not replace default invoice PDF",
    "defaultParams": [
      {
        "name": "invoice_id",
        "label": "Invoice",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "INVOICE_REPORT_FORMAT_2_TAX_INVOICE_INDIA",
    "name": "Invoice Report Format-2 Tax Invoice India",
    "family": "commercial",
    "contexts": [
      "invoice"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 4,
    "gapStatus": "partial_document_pdf",
    "description": "Invoice Report Format-2 Tax Invoice India — additional format; does not replace default invoice PDF",
    "defaultParams": [
      {
        "name": "invoice_id",
        "label": "Invoice",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "INVOICE_REPORT_FORMAT_3_SUMMARY_INVOICE",
    "name": "Invoice Report Format-3 Summary Invoice",
    "family": "commercial",
    "contexts": [
      "invoice"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 4,
    "gapStatus": "partial_document_pdf",
    "description": "Invoice Report Format-3 Summary Invoice — additional format; does not replace default invoice PDF",
    "defaultParams": [
      {
        "name": "invoice_id",
        "label": "Invoice",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "INVOICE_REPORT_FORMAT_4_STANDARD_TAX_INVOICE",
    "name": "Invoice Report Format-4 Standard Tax Invoice",
    "family": "commercial",
    "contexts": [
      "invoice"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 4,
    "gapStatus": "partial_document_pdf",
    "description": "Invoice Report Format-4 Standard Tax Invoice — additional format; does not replace default invoice PDF",
    "defaultParams": [
      {
        "name": "invoice_id",
        "label": "Invoice",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "INVOICE_REPORT_FORMAT_5_TAX_INVOICE_INDIA",
    "name": "Invoice Report Format-5 Tax Invoice India",
    "family": "commercial",
    "contexts": [
      "invoice"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 4,
    "gapStatus": "partial_document_pdf",
    "description": "Invoice Report Format-5 Tax Invoice India — additional format; does not replace default invoice PDF",
    "defaultParams": [
      {
        "name": "invoice_id",
        "label": "Invoice",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "INVOICE_REPORT_FORMAT_6_SIMPLE_INVOICE_INDIA",
    "name": "Invoice Report Format-6 Simple Invoice (India)",
    "family": "commercial",
    "contexts": [
      "invoice"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 4,
    "gapStatus": "partial_document_pdf",
    "description": "Invoice Report Format-6 Simple Invoice (India) — additional format; does not replace default invoice PDF",
    "defaultParams": [
      {
        "name": "invoice_id",
        "label": "Invoice",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "INVOICE_REPORT_FORMAT_7_SIMPLE_INVOICE",
    "name": "Invoice Report Format-7 Simple Invoice",
    "family": "commercial",
    "contexts": [
      "invoice"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 4,
    "gapStatus": "partial_document_pdf",
    "description": "Invoice Report Format-7 Simple Invoice — additional format; does not replace default invoice PDF",
    "defaultParams": [
      {
        "name": "invoice_id",
        "label": "Invoice",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "INVOICE_REPORT_FORMAT_8_STANDARD_INVOICE_ARABIC",
    "name": "Invoice Report Format-8 Standard Invoice Arabic",
    "family": "commercial",
    "contexts": [
      "invoice"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 4,
    "gapStatus": "partial_document_pdf",
    "description": "Invoice Report Format-8 Standard Invoice Arabic — additional format; does not replace default invoice PDF",
    "defaultParams": [
      {
        "name": "invoice_id",
        "label": "Invoice",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "INVOICE_REPORT_FORMAT_9_STANDARD_INVOICE_USA",
    "name": "Invoice Report Format-9 Standard Invoice USA",
    "family": "commercial",
    "contexts": [
      "invoice"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 4,
    "gapStatus": "partial_document_pdf",
    "description": "Invoice Report Format-9 Standard Invoice USA — additional format; does not replace default invoice PDF",
    "defaultParams": [
      {
        "name": "invoice_id",
        "label": "Invoice",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "INVOICE_REPORT_FORMAT_10_STANDARD_INVOICE",
    "name": "Invoice Report Format-10 Standard Invoice",
    "family": "commercial",
    "contexts": [
      "invoice"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 4,
    "gapStatus": "partial_document_pdf",
    "description": "Invoice Report Format-10 Standard Invoice — additional format; does not replace default invoice PDF",
    "defaultParams": [
      {
        "name": "invoice_id",
        "label": "Invoice",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "INVOICE_REPORT_FORMAT_11_STANDARD_INVOICE_LAND",
    "name": "Invoice Report Format-11 Standard Invoice Land",
    "family": "commercial",
    "contexts": [
      "invoice"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 4,
    "gapStatus": "partial_document_pdf",
    "description": "Invoice Report Format-11 Standard Invoice Land — additional format; does not replace default invoice PDF",
    "defaultParams": [
      {
        "name": "invoice_id",
        "label": "Invoice",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "INVOICE_REPORT_FORMAT_12_STANDARD_INVOICE_PREPRINTED",
    "name": "Invoice Report Format-12 Standard Invoice Preprinted",
    "family": "commercial",
    "contexts": [
      "invoice"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 4,
    "gapStatus": "partial_document_pdf",
    "description": "Invoice Report Format-12 Standard Invoice Preprinted — additional format; does not replace default invoice PDF",
    "defaultParams": [
      {
        "name": "invoice_id",
        "label": "Invoice",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "INVOICE_REPORT_FORMAT_13_STANDARD_INVOICE_USA",
    "name": "Invoice Report Format-13 Standard Invoice USA",
    "family": "commercial",
    "contexts": [
      "invoice"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 4,
    "gapStatus": "partial_document_pdf",
    "description": "Invoice Report Format-13 Standard Invoice USA — additional format; does not replace default invoice PDF",
    "defaultParams": [
      {
        "name": "invoice_id",
        "label": "Invoice",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "INVOICE_REPORT_FORMAT_14_INVOICE",
    "name": "Invoice Report Format-14 Invoice",
    "family": "commercial",
    "contexts": [
      "invoice"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 4,
    "gapStatus": "partial_document_pdf",
    "description": "Invoice Report Format-14 Invoice — additional format; does not replace default invoice PDF",
    "defaultParams": [
      {
        "name": "invoice_id",
        "label": "Invoice",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "INVOICE_REPORT_FORMAT_15_INVOICE_FCY",
    "name": "Invoice Report Format-15 Invoice FCY",
    "family": "commercial",
    "contexts": [
      "invoice"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 4,
    "gapStatus": "partial_document_pdf",
    "description": "Invoice Report Format-15 Invoice FCY — additional format; does not replace default invoice PDF",
    "defaultParams": [
      {
        "name": "invoice_id",
        "label": "Invoice",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "INVOICE_REPORT_FORMAT_16_STANDARD_TAX_INVOICE_PREPRINTED",
    "name": "Invoice Report Format-16 Standard Tax Invoice Preprinted",
    "family": "commercial",
    "contexts": [
      "invoice"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 4,
    "gapStatus": "partial_document_pdf",
    "description": "Invoice Report Format-16 Standard Tax Invoice Preprinted — additional format; does not replace default invoice PDF",
    "defaultParams": [
      {
        "name": "invoice_id",
        "label": "Invoice",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "INVOICE_REPORT_FORMAT_17_INVOICE_JASPER",
    "name": "Invoice Report Format-17 Invoice Jasper",
    "family": "commercial",
    "contexts": [
      "invoice"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 4,
    "gapStatus": "partial_document_pdf",
    "description": "Invoice Report Format-17 Invoice Jasper — additional format; does not replace default invoice PDF",
    "defaultParams": [
      {
        "name": "invoice_id",
        "label": "Invoice",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "INVOICE_REPORT_FORMAT_18_LAND_FREIGHT_TRANSPORTATION_INVOICE",
    "name": "Invoice Report Format-18 Land Freight Transportation Invoice",
    "family": "commercial",
    "contexts": [
      "invoice"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 4,
    "gapStatus": "partial_document_pdf",
    "description": "Invoice Report Format-18 Land Freight Transportation Invoice — additional format; does not replace default invoice PDF",
    "defaultParams": [
      {
        "name": "invoice_id",
        "label": "Invoice",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "INVOICE_REPORT_FORMAT_19_DEBIT_NOTE_VIETNAM",
    "name": "Invoice Report Format-19 Debit Note Vietnam",
    "family": "commercial",
    "contexts": [
      "invoice"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 4,
    "gapStatus": "partial_document_pdf",
    "description": "Invoice Report Format-19 Debit Note Vietnam — additional format; does not replace default invoice PDF",
    "defaultParams": [
      {
        "name": "invoice_id",
        "label": "Invoice",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "INVOICE_REPORT_FORMAT_20_TAX_INVOICE_INDIA",
    "name": "Invoice Report Format-20 Tax Invoice India",
    "family": "commercial",
    "contexts": [
      "invoice"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 4,
    "gapStatus": "partial_document_pdf",
    "description": "Invoice Report Format-20 Tax Invoice India — additional format; does not replace default invoice PDF",
    "defaultParams": [
      {
        "name": "invoice_id",
        "label": "Invoice",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "INVOICE_REPORT_FORMAT_21_WAREHOUSE_INVOICE",
    "name": "Invoice Report Format-21 Warehouse Invoice",
    "family": "commercial",
    "contexts": [
      "invoice"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 4,
    "gapStatus": "partial_document_pdf",
    "description": "Invoice Report Format-21 Warehouse Invoice — additional format; does not replace default invoice PDF",
    "defaultParams": [
      {
        "name": "invoice_id",
        "label": "Invoice",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "INVOICE_REPORT_FORMAT_22",
    "name": "Invoice Report Format-22 Standard Tax Invoice Format-22",
    "family": "commercial",
    "contexts": [
      "invoice"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 4,
    "gapStatus": "partial_document_pdf",
    "description": "Invoice Report Format-22 Standard Tax Invoice Format-22 — additional format; does not replace default invoice PDF",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "INVOICE_REPORT_FORMAT_23",
    "name": "Invoice Report Format-23 Purchase Invoice",
    "family": "commercial",
    "contexts": [
      "invoice"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 4,
    "gapStatus": "partial_document_pdf",
    "description": "Invoice Report Format-23 Purchase Invoice — additional format; does not replace default invoice PDF",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "INVOICE_REPORT_FORMAT_24",
    "name": "Invoice Report Format-24 Simple Invoice With OS",
    "family": "commercial",
    "contexts": [
      "invoice"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 4,
    "gapStatus": "partial_document_pdf",
    "description": "Invoice Report Format-24 Simple Invoice With OS — additional format; does not replace default invoice PDF",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "INVOICE_REPORT_FORMAT_25",
    "name": "Invoice Report Format-25 Simple Invoice India With OS",
    "family": "commercial",
    "contexts": [
      "invoice"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 4,
    "gapStatus": "partial_document_pdf",
    "description": "Invoice Report Format-25 Simple Invoice India With OS — additional format; does not replace default invoice PDF",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "INVOICE_REPORT_FORMAT_26",
    "name": "Invoice Report Format-26 FG Simple Invoice",
    "family": "commercial",
    "contexts": [
      "invoice"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 4,
    "gapStatus": "partial_document_pdf",
    "description": "Invoice Report Format-26 FG Simple Invoice — additional format; does not replace default invoice PDF",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "INVOICE_REPORT_FORMAT_27",
    "name": "Invoice Report Format-27 Standard Invoice Tanzania",
    "family": "commercial",
    "contexts": [
      "invoice"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 4,
    "gapStatus": "partial_document_pdf",
    "description": "Invoice Report Format-27 Standard Invoice Tanzania — additional format; does not replace default invoice PDF",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "INVOICE_REPORT_FORMAT_28",
    "name": "Invoice Report Format Singapore",
    "family": "commercial",
    "contexts": [
      "invoice"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 4,
    "gapStatus": "partial_document_pdf",
    "description": "Invoice Report Format Singapore — additional format; does not replace default invoice PDF",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "INVOICE_REPORT_FORMAT_29",
    "name": "Invoice Report Format Land Freight Transportation",
    "family": "commercial",
    "contexts": [
      "invoice"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 4,
    "gapStatus": "partial_document_pdf",
    "description": "Invoice Report Format Land Freight Transportation — additional format; does not replace default invoice PDF",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "INVOICE_REPORT_FORMAT_30",
    "name": "Invoice Report Format Overseas Debit Note Format-2",
    "family": "commercial",
    "contexts": [
      "invoice"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 4,
    "gapStatus": "partial_document_pdf",
    "description": "Invoice Report Format Overseas Debit Note Format-2 — additional format; does not replace default invoice PDF",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "INVOICE_REPORT_FORMAT_34",
    "name": "Invoice Report Format-34 Standard Invoice Arabic",
    "family": "commercial",
    "contexts": [
      "invoice"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 4,
    "gapStatus": "partial_document_pdf",
    "description": "Invoice Report Format-34 Standard Invoice Arabic — additional format; does not replace default invoice PDF",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "INVOICE_REPORT_FORMAT_35",
    "name": "Invoice Report Format-35 Standard Invoice Arabic Format-1",
    "family": "commercial",
    "contexts": [
      "invoice"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 4,
    "gapStatus": "partial_document_pdf",
    "description": "Invoice Report Format-35 Standard Invoice Arabic Format-1 — additional format; does not replace default invoice PDF",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "INVOICE_REPORT_FORMAT_36",
    "name": "Invoice Report Format-36 Standard Invoice Arabic Format-1 Alt",
    "family": "commercial",
    "contexts": [
      "invoice"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 4,
    "gapStatus": "partial_document_pdf",
    "description": "Invoice Report Format-36 Standard Invoice Arabic Format-1 Alt — additional format; does not replace default invoice PDF",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "INVOICE_REPORT_FORMAT_37",
    "name": "Invoice Report Format-37 Standard Invoice Arabic Oman",
    "family": "commercial",
    "contexts": [
      "invoice"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 4,
    "gapStatus": "partial_document_pdf",
    "description": "Invoice Report Format-37 Standard Invoice Arabic Oman — additional format; does not replace default invoice PDF",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "INVOICE_REPORT_FORMAT_38",
    "name": "Invoice Report Format-38 Standard Invoice Arabic Format-2",
    "family": "commercial",
    "contexts": [
      "invoice"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 4,
    "gapStatus": "partial_document_pdf",
    "description": "Invoice Report Format-38 Standard Invoice Arabic Format-2 — additional format; does not replace default invoice PDF",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "INVOICE_REPORT_FORMAT_39",
    "name": "Invoice Report Format-39 Standard Invoice Arabic Format-3",
    "family": "commercial",
    "contexts": [
      "invoice"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 4,
    "gapStatus": "partial_document_pdf",
    "description": "Invoice Report Format-39 Standard Invoice Arabic Format-3 — additional format; does not replace default invoice PDF",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "INVOICE_REPORT_FORMAT_40",
    "name": "Invoice Report Format-40 Standard Invoice Arabic Format-4",
    "family": "commercial",
    "contexts": [
      "invoice"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 4,
    "gapStatus": "partial_document_pdf",
    "description": "Invoice Report Format-40 Standard Invoice Arabic Format-4 — additional format; does not replace default invoice PDF",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "INVOICE_REPORT_FORMAT_41",
    "name": "Invoice Report Format-41 Standard Invoice Arabic Format-5",
    "family": "commercial",
    "contexts": [
      "invoice"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 4,
    "gapStatus": "partial_document_pdf",
    "description": "Invoice Report Format-41 Standard Invoice Arabic Format-5 — additional format; does not replace default invoice PDF",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "INVOICE_REPORT_FORMAT_42",
    "name": "Invoice Report Format-42 Standard Invoice Arabic Format-7",
    "family": "commercial",
    "contexts": [
      "invoice"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 4,
    "gapStatus": "partial_document_pdf",
    "description": "Invoice Report Format-42 Standard Invoice Arabic Format-7 — additional format; does not replace default invoice PDF",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "INVOICE_REPORT_FORMAT_43",
    "name": "Invoice Report Format-43 Standard Courier Invoice",
    "family": "commercial",
    "contexts": [
      "invoice"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 4,
    "gapStatus": "partial_document_pdf",
    "description": "Invoice Report Format-43 Standard Courier Invoice — additional format; does not replace default invoice PDF",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "INVOICE_REPORT_FORMAT_44",
    "name": "Invoice Report Format-44 Standard Invoice FCY",
    "family": "commercial",
    "contexts": [
      "invoice"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 4,
    "gapStatus": "partial_document_pdf",
    "description": "Invoice Report Format-44 Standard Invoice FCY — additional format; does not replace default invoice PDF",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "INVOICE_REPORT_FORMAT_45",
    "name": "Invoice Report Format-45 Standard Invoice FCY Format-2",
    "family": "commercial",
    "contexts": [
      "invoice"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 4,
    "gapStatus": "partial_document_pdf",
    "description": "Invoice Report Format-45 Standard Invoice FCY Format-2 — additional format; does not replace default invoice PDF",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "INVOICE_REPORT_FORMAT_46",
    "name": "Invoice Report Format-46 FG Standard Invoice FCY",
    "family": "commercial",
    "contexts": [
      "invoice"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 4,
    "gapStatus": "partial_document_pdf",
    "description": "Invoice Report Format-46 FG Standard Invoice FCY — additional format; does not replace default invoice PDF",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "INVOICE_REPORT_FORMAT_47",
    "name": "Invoice Report Format-47 Standard Invoice Kampala",
    "family": "commercial",
    "contexts": [
      "invoice"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 4,
    "gapStatus": "partial_document_pdf",
    "description": "Invoice Report Format-47 Standard Invoice Kampala — additional format; does not replace default invoice PDF",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "INVOICE_REPORT_FORMAT_48",
    "name": "Invoice Report Format-48 Standard Invoice USA",
    "family": "commercial",
    "contexts": [
      "invoice"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 4,
    "gapStatus": "partial_document_pdf",
    "description": "Invoice Report Format-48 Standard Invoice USA — additional format; does not replace default invoice PDF",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "INVOICE_REPORT_FORMAT_49",
    "name": "Invoice Report Format-49 Standard Tax Invoice Format-16 Cum AN",
    "family": "commercial",
    "contexts": [
      "invoice"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 4,
    "gapStatus": "partial_document_pdf",
    "description": "Invoice Report Format-49 Standard Tax Invoice Format-16 Cum AN — additional format; does not replace default invoice PDF",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "INVOICE_REPORT_FORMAT_50",
    "name": "Invoice Report Format-50 Standard Invoice Malaysia",
    "family": "commercial",
    "contexts": [
      "invoice"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 4,
    "gapStatus": "partial_document_pdf",
    "description": "Invoice Report Format-50 Standard Invoice Malaysia — additional format; does not replace default invoice PDF",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "INVOICE_REPORT_FORMAT_51",
    "name": "Invoice Report Format-51 Standard Invoice USA Format-2",
    "family": "commercial",
    "contexts": [
      "invoice"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 4,
    "gapStatus": "partial_document_pdf",
    "description": "Invoice Report Format-51 Standard Invoice USA Format-2 — additional format; does not replace default invoice PDF",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "INVOICE_REPORT_FORMAT_52",
    "name": "Invoice Report Format-52 Standard Tax Invoice",
    "family": "commercial",
    "contexts": [
      "invoice"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 4,
    "gapStatus": "partial_document_pdf",
    "description": "Invoice Report Format-52 Standard Tax Invoice — additional format; does not replace default invoice PDF",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "INVOICE_REPORT_FORMAT_53",
    "name": "Invoice Report Format-53 Summary Invoice",
    "family": "commercial",
    "contexts": [
      "invoice"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 4,
    "gapStatus": "partial_document_pdf",
    "description": "Invoice Report Format-53 Summary Invoice — additional format; does not replace default invoice PDF",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "INVOICE_REPORT_FORMAT_54",
    "name": "Invoice Report Format-54 Tax Invoice India",
    "family": "commercial",
    "contexts": [
      "invoice"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 4,
    "gapStatus": "partial_document_pdf",
    "description": "Invoice Report Format-54 Tax Invoice India — additional format; does not replace default invoice PDF",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "INVOICE_REPORT_FORMAT_55",
    "name": "Invoice Report Format-55 Tax Invoice India Reimbursement Bill",
    "family": "commercial",
    "contexts": [
      "invoice"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 4,
    "gapStatus": "partial_document_pdf",
    "description": "Invoice Report Format-55 Tax Invoice India Reimbursement Bill — additional format; does not replace default invoice PDF",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "INVOICE_REPORT_FORMAT_56",
    "name": "Invoice Report Format-56 FG Tax Invoice India",
    "family": "commercial",
    "contexts": [
      "invoice"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 4,
    "gapStatus": "partial_document_pdf",
    "description": "Invoice Report Format-56 FG Tax Invoice India — additional format; does not replace default invoice PDF",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "INVOICE_REPORT_FORMAT_57",
    "name": "Invoice Report Format-57 FG Tax Invoice India Format-1",
    "family": "commercial",
    "contexts": [
      "invoice"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 4,
    "gapStatus": "partial_document_pdf",
    "description": "Invoice Report Format-57 FG Tax Invoice India Format-1 — additional format; does not replace default invoice PDF",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "INVOICE_REPORT_FORMAT_58",
    "name": "Invoice Report Format-58 Tax Invoice India Format-1",
    "family": "commercial",
    "contexts": [
      "invoice"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 4,
    "gapStatus": "partial_document_pdf",
    "description": "Invoice Report Format-58 Tax Invoice India Format-1 — additional format; does not replace default invoice PDF",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "INVOICE_REPORT_FORMAT_59",
    "name": "Invoice Report Format-59 Tax Invoice India Format-2",
    "family": "commercial",
    "contexts": [
      "invoice"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 4,
    "gapStatus": "partial_document_pdf",
    "description": "Invoice Report Format-59 Tax Invoice India Format-2 — additional format; does not replace default invoice PDF",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "INVOICE_REPORT_FORMAT_60",
    "name": "Invoice Report Format-60 FG Tax Invoice India Format-2",
    "family": "commercial",
    "contexts": [
      "invoice"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 4,
    "gapStatus": "partial_document_pdf",
    "description": "Invoice Report Format-60 FG Tax Invoice India Format-2 — additional format; does not replace default invoice PDF",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "INVOICE_REPORT_FORMAT_61",
    "name": "Invoice Report Format-61 FG Tax Invoice India Format-6",
    "family": "commercial",
    "contexts": [
      "invoice"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 4,
    "gapStatus": "partial_document_pdf",
    "description": "Invoice Report Format-61 FG Tax Invoice India Format-6 — additional format; does not replace default invoice PDF",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "INVOICE_REPORT_FORMAT_62",
    "name": "Invoice Report Format-62 FG Tax Invoice India Format-7",
    "family": "commercial",
    "contexts": [
      "invoice"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 4,
    "gapStatus": "partial_document_pdf",
    "description": "Invoice Report Format-62 FG Tax Invoice India Format-7 — additional format; does not replace default invoice PDF",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "INVOICE_REPORT_FORMAT_63",
    "name": "Invoice Report Format-63 FG Tax Invoice India Format-8",
    "family": "commercial",
    "contexts": [
      "invoice"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 4,
    "gapStatus": "partial_document_pdf",
    "description": "Invoice Report Format-63 FG Tax Invoice India Format-8 — additional format; does not replace default invoice PDF",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "INVOICE_REPORT_FORMAT_64",
    "name": "Invoice Report Format-64 FG Tax Invoice India Format-3",
    "family": "commercial",
    "contexts": [
      "invoice"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 4,
    "gapStatus": "partial_document_pdf",
    "description": "Invoice Report Format-64 FG Tax Invoice India Format-3 — additional format; does not replace default invoice PDF",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "INVOICE_REPORT_FORMAT_65",
    "name": "Invoice Report Format-65 FG Tax Invoice India Format-4",
    "family": "commercial",
    "contexts": [
      "invoice"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 4,
    "gapStatus": "partial_document_pdf",
    "description": "Invoice Report Format-65 FG Tax Invoice India Format-4 — additional format; does not replace default invoice PDF",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "INVOICE_REPORT_FORMAT_66",
    "name": "Invoice Report Format-66 FG Tax Invoice India Format-5",
    "family": "commercial",
    "contexts": [
      "invoice"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 4,
    "gapStatus": "partial_document_pdf",
    "description": "Invoice Report Format-66 FG Tax Invoice India Format-5 — additional format; does not replace default invoice PDF",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "INVOICE_REPORT_FORMAT_67",
    "name": "Invoice Report Format-67 FG Tax Invoice Malaysia",
    "family": "commercial",
    "contexts": [
      "invoice"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 4,
    "gapStatus": "partial_document_pdf",
    "description": "Invoice Report Format-67 FG Tax Invoice Malaysia — additional format; does not replace default invoice PDF",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "INVOICE_REPORT_FORMAT_68",
    "name": "Invoice Report Format-68 FG Tax Invoice Singapore",
    "family": "commercial",
    "contexts": [
      "invoice"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 4,
    "gapStatus": "partial_document_pdf",
    "description": "Invoice Report Format-68 FG Tax Invoice Singapore — additional format; does not replace default invoice PDF",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "INVOICE_REPORT_FORMAT_69",
    "name": "Invoice Report Format-69 Warehouse Invoice",
    "family": "commercial",
    "contexts": [
      "invoice"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 4,
    "gapStatus": "partial_document_pdf",
    "description": "Invoice Report Format-69 Warehouse Invoice — additional format; does not replace default invoice PDF",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "INVOICE_REPORT_FORMAT_70",
    "name": "Invoice Report Format-70 Warehouse Invoice India Format",
    "family": "commercial",
    "contexts": [
      "invoice"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 4,
    "gapStatus": "partial_document_pdf",
    "description": "Invoice Report Format-70 Warehouse Invoice India Format — additional format; does not replace default invoice PDF",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "INVOICE_REPORT_FORMAT_71",
    "name": "Invoice Report Format-71 Proforma Invoice All Charges",
    "family": "commercial",
    "contexts": [
      "invoice"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 4,
    "gapStatus": "partial_document_pdf",
    "description": "Invoice Report Format-71 Proforma Invoice All Charges — additional format; does not replace default invoice PDF",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "INVOICE_REPORT_FORMAT_72",
    "name": "Invoice Report Format-72 Standard Tax Invoice Format-13",
    "family": "commercial",
    "contexts": [
      "invoice"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 4,
    "gapStatus": "partial_document_pdf",
    "description": "Invoice Report Format-72 Standard Tax Invoice Format-13 — additional format; does not replace default invoice PDF",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "INVOICE_REPORT_FORMAT_73",
    "name": "Invoice Report Format-73 Standard Tax Invoice Format-14",
    "family": "commercial",
    "contexts": [
      "invoice"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 4,
    "gapStatus": "partial_document_pdf",
    "description": "Invoice Report Format-73 Standard Tax Invoice Format-14 — additional format; does not replace default invoice PDF",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "INVOICE_REPORT_FORMAT_74",
    "name": "Invoice Report Format-74 Standard Tax Invoice Format-15",
    "family": "commercial",
    "contexts": [
      "invoice"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 4,
    "gapStatus": "partial_document_pdf",
    "description": "Invoice Report Format-74 Standard Tax Invoice Format-15 — additional format; does not replace default invoice PDF",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "INVOICE_REPORT_FORMAT_75",
    "name": "Invoice Report Format-75 Standard Tax Invoice Format-16",
    "family": "commercial",
    "contexts": [
      "invoice"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 4,
    "gapStatus": "partial_document_pdf",
    "description": "Invoice Report Format-75 Standard Tax Invoice Format-16 — additional format; does not replace default invoice PDF",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "INVOICE_REPORT_FORMAT_76",
    "name": "Invoice Report Format-76 Standard Tax Invoice Format-17",
    "family": "commercial",
    "contexts": [
      "invoice"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 4,
    "gapStatus": "partial_document_pdf",
    "description": "Invoice Report Format-76 Standard Tax Invoice Format-17 — additional format; does not replace default invoice PDF",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "INVOICE_REPORT_FORMAT_77",
    "name": "Invoice Report Format-77 Standard Tax Invoice Format-18",
    "family": "commercial",
    "contexts": [
      "invoice"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 4,
    "gapStatus": "partial_document_pdf",
    "description": "Invoice Report Format-77 Standard Tax Invoice Format-18 — additional format; does not replace default invoice PDF",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "INVOICE_REPORT_FORMAT_78",
    "name": "Invoice Report Format-78 Standard Tax Invoice Format-19",
    "family": "commercial",
    "contexts": [
      "invoice"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 4,
    "gapStatus": "partial_document_pdf",
    "description": "Invoice Report Format-78 Standard Tax Invoice Format-19 — additional format; does not replace default invoice PDF",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "INVOICE_REPORT_FORMAT_79",
    "name": "Invoice Report Format-79 Standard Tax Invoice Format-20",
    "family": "commercial",
    "contexts": [
      "invoice"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 4,
    "gapStatus": "partial_document_pdf",
    "description": "Invoice Report Format-79 Standard Tax Invoice Format-20 — additional format; does not replace default invoice PDF",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "INVOICE_REPORT_FORMAT_80",
    "name": "Invoice Report Format-80 Standard Tax Invoice Format-21",
    "family": "commercial",
    "contexts": [
      "invoice"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 4,
    "gapStatus": "partial_document_pdf",
    "description": "Invoice Report Format-80 Standard Tax Invoice Format-21 — additional format; does not replace default invoice PDF",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "INVOICE_REPORT_FORMAT_81",
    "name": "Invoice Report Format-81 Standard Tax Invoice Format-22",
    "family": "commercial",
    "contexts": [
      "invoice"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 4,
    "gapStatus": "partial_document_pdf",
    "description": "Invoice Report Format-81 Standard Tax Invoice Format-22 — additional format; does not replace default invoice PDF",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "INVOICE_REPORT_FORMAT_82",
    "name": "Invoice Report Format-82 Standard Tax Invoice Format-5",
    "family": "commercial",
    "contexts": [
      "invoice"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 4,
    "gapStatus": "partial_document_pdf",
    "description": "Invoice Report Format-82 Standard Tax Invoice Format-5 — additional format; does not replace default invoice PDF",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "INVOICE_REPORT_FORMAT_83",
    "name": "Invoice Report Format-83 Standard Tax Invoice Format-6",
    "family": "commercial",
    "contexts": [
      "invoice"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 4,
    "gapStatus": "partial_document_pdf",
    "description": "Invoice Report Format-83 Standard Tax Invoice Format-6 — additional format; does not replace default invoice PDF",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "INVOICE_REPORT_FORMAT_84",
    "name": "Invoice Report Format-84 Standard Tax Invoice Format-9",
    "family": "commercial",
    "contexts": [
      "invoice"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 4,
    "gapStatus": "partial_document_pdf",
    "description": "Invoice Report Format-84 Standard Tax Invoice Format-9 — additional format; does not replace default invoice PDF",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "INVOICE_REPORT_FORMAT_85",
    "name": "Invoice Report Format-85 Standard Invoice Format-2",
    "family": "commercial",
    "contexts": [
      "invoice"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 4,
    "gapStatus": "partial_document_pdf",
    "description": "Invoice Report Format-85 Standard Invoice Format-2 — additional format; does not replace default invoice PDF",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "ISF_FILING_DOCUMENT_REPORT_FORMAT",
    "name": "ISF Filing Document Report Format",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: ISF Filing Document Report Format",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "JOB_ATA_IS_UPDATED_AND_CARGO_UNPACK_DATE_IS_NOT_ENTERED_LIST_REPORT_FORMAT",
    "name": "Job ATA Is Updated And Cargo Unpack Date Is Not Entered List Report Format",
    "family": "ops_list",
    "contexts": [
      "list",
      "job"
    ],
    "formats": [
      "PDF",
      "XLSX",
      "CSV"
    ],
    "rolloutPhase": 1,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Job ATA Is Updated And Cargo Unpack Date Is Not Entered List Report Format",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "JOB_ATA_NOT_UPDATED_LIST_REPORT_FORMAT",
    "name": "Job Ata Not Updated List Report Format",
    "family": "ops_list",
    "contexts": [
      "list",
      "job"
    ],
    "formats": [
      "PDF",
      "XLSX",
      "CSV"
    ],
    "rolloutPhase": 1,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Job Ata Not Updated List Report Format",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "JOB_ATA_UPDATED_ARRIVAL_NOTICE_NOT_SENT_LIST_REPORT_FORMAT",
    "name": "Job ATA Updated Arrival Notice Not Sent List Report Format",
    "family": "ops_list",
    "contexts": [
      "list",
      "job"
    ],
    "formats": [
      "PDF",
      "XLSX",
      "CSV"
    ],
    "rolloutPhase": 1,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Job ATA Updated Arrival Notice Not Sent List Report Format",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "JOB_CARD_REPORT_FORMAT",
    "name": "Job Card Report Format",
    "family": "other",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: Job Card Report Format"
  },
  {
    "code": "JOB_HOUSE_RECORD_LIST_REPORT_FORMAT",
    "name": "Job House Record List Report Format",
    "family": "air_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 3,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Job House Record List Report Format",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "JOB_HOUSE_RECORD_LIST_REPORT_FORMAT_1",
    "name": "Job House Record List Report Format-1",
    "family": "air_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 3,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Job House Record List Report Format-1",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "JOB_HOUSES_RECORD_LIST_REPORT_FORMAT",
    "name": "Job Houses Record List Report Format",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Job Houses Record List Report Format",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "JOB_LIST_SUMMARY_REPORT_FORMAT",
    "name": "Job List Summary Report Format",
    "family": "other",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: Job List Summary Report Format"
  },
  {
    "code": "JOB_NOT_CLOSED_LIST_REPORT_FORMAT",
    "name": "Job Not Closed list Report Format",
    "family": "ops_list",
    "contexts": [
      "list",
      "job"
    ],
    "formats": [
      "PDF",
      "XLSX",
      "CSV"
    ],
    "rolloutPhase": 1,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Job Not Closed list Report Format",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "JOB_STATUS_LIST_REPORT_FORMAT_1",
    "name": "Job Status List Report Format-1",
    "family": "ops_list",
    "contexts": [
      "list",
      "job"
    ],
    "formats": [
      "PDF",
      "XLSX",
      "CSV"
    ],
    "rolloutPhase": 1,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Job Status List Report Format-1",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "JOB_STATUS_LIST_REPORT_FORMAT_2",
    "name": "Job Status List Report Format-2",
    "family": "ops_list",
    "contexts": [
      "list",
      "job"
    ],
    "formats": [
      "PDF",
      "XLSX",
      "CSV"
    ],
    "rolloutPhase": 1,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Job Status List Report Format-2",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "JOB_STATUS_LIST_REPORT_FORMAT_3",
    "name": "Job Status List Report Format-3",
    "family": "ops_list",
    "contexts": [
      "list",
      "job"
    ],
    "formats": [
      "PDF",
      "XLSX",
      "CSV"
    ],
    "rolloutPhase": 1,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Job Status List Report Format-3",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "JOB_STATUS_LIST_REPORT_FORMAT_4",
    "name": "Job Status List Report Format-4",
    "family": "ops_list",
    "contexts": [
      "list",
      "job"
    ],
    "formats": [
      "PDF",
      "XLSX",
      "CSV"
    ],
    "rolloutPhase": 1,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Job Status List Report Format-4",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "JOB_STATUS_LIST_REPORT_FORMAT_5",
    "name": "Job Status List Report Format-5",
    "family": "ops_list",
    "contexts": [
      "list",
      "job"
    ],
    "formats": [
      "PDF",
      "XLSX",
      "CSV"
    ],
    "rolloutPhase": 1,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Job Status List Report Format-5",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "JOB_STATUS_LIST_REPORT_FORMAT_6",
    "name": "Job Status List Report Format-6",
    "family": "ops_list",
    "contexts": [
      "list",
      "job"
    ],
    "formats": [
      "PDF",
      "XLSX",
      "CSV"
    ],
    "rolloutPhase": 1,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Job Status List Report Format-6",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "JOB_STATUS_LIST_REPORT_FORMAT_7",
    "name": "Job Status List Report Format-7",
    "family": "ops_list",
    "contexts": [
      "list",
      "job"
    ],
    "formats": [
      "PDF",
      "XLSX",
      "CSV"
    ],
    "rolloutPhase": 1,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Job Status List Report Format-7",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "JOB_STATUS_LIST_REPORT_FORMAT_8",
    "name": "Job Status List Report Format-8",
    "family": "ops_list",
    "contexts": [
      "list",
      "job"
    ],
    "formats": [
      "PDF",
      "XLSX",
      "CSV"
    ],
    "rolloutPhase": 1,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Job Status List Report Format-8",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "JOB_STATUS_LIST_REPORT_FORMAT_9",
    "name": "Job Status List Report Format-9",
    "family": "ops_list",
    "contexts": [
      "list",
      "job"
    ],
    "formats": [
      "PDF",
      "XLSX",
      "CSV"
    ],
    "rolloutPhase": 1,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Job Status List Report Format-9",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "JOB_STATUS_LIST_REPORT_FORMAT_10",
    "name": "Job Status List Report Format-10",
    "family": "ops_list",
    "contexts": [
      "list",
      "job"
    ],
    "formats": [
      "PDF",
      "XLSX",
      "CSV"
    ],
    "rolloutPhase": 1,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Job Status List Report Format-10",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "JOB_STATUS_LIST_REPORT_FORMAT_11",
    "name": "Job Status List Report Format-11",
    "family": "ops_list",
    "contexts": [
      "list",
      "job"
    ],
    "formats": [
      "PDF",
      "XLSX",
      "CSV"
    ],
    "rolloutPhase": 1,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Job Status List Report Format-11",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "JOB_STATUS_LIST_REPORT_FORMAT_12",
    "name": "Job Status List Report Format-12",
    "family": "ops_list",
    "contexts": [
      "list",
      "job"
    ],
    "formats": [
      "PDF",
      "XLSX",
      "CSV"
    ],
    "rolloutPhase": 1,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Job Status List Report Format-12",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "JOB_STATUS_LIST_REPORT_FORMAT_13",
    "name": "Job Status List Report Format-13",
    "family": "ops_list",
    "contexts": [
      "list",
      "job"
    ],
    "formats": [
      "PDF",
      "XLSX",
      "CSV"
    ],
    "rolloutPhase": 1,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Job Status List Report Format-13",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "JOB_STATUS_LIST_REPORT_FORMAT_14",
    "name": "Job Status List Report Format-14",
    "family": "ops_list",
    "contexts": [
      "list",
      "job"
    ],
    "formats": [
      "PDF",
      "XLSX",
      "CSV"
    ],
    "rolloutPhase": 1,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Job Status List Report Format-14",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "JOB_STATUS_LIST_REPORT_FORMAT_15",
    "name": "Job Status List Report Format-15",
    "family": "ops_list",
    "contexts": [
      "list",
      "job"
    ],
    "formats": [
      "PDF",
      "XLSX",
      "CSV"
    ],
    "rolloutPhase": 1,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Job Status List Report Format-15",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "JOB_STATUS_LIST_REPORT_FORMAT_16",
    "name": "Job Status List Report Format-16",
    "family": "ops_list",
    "contexts": [
      "list",
      "job"
    ],
    "formats": [
      "PDF",
      "XLSX",
      "CSV"
    ],
    "rolloutPhase": 1,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Job Status List Report Format-16",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "JOB_STATUS_LIST_REPORT_FORMAT_17",
    "name": "Job Status List Report Format-17",
    "family": "ops_list",
    "contexts": [
      "list",
      "job"
    ],
    "formats": [
      "PDF",
      "XLSX",
      "CSV"
    ],
    "rolloutPhase": 1,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Job Status List Report Format-17",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "JOB_STATUS_LIST_REPORT_FORMAT_18",
    "name": "Job Status List Report Format-18",
    "family": "ops_list",
    "contexts": [
      "list",
      "job"
    ],
    "formats": [
      "PDF",
      "XLSX",
      "CSV"
    ],
    "rolloutPhase": 1,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Job Status List Report Format-18",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "JOB_STATUS_LIST_REPORT_FORMAT_19",
    "name": "Job Status List Report Format-19",
    "family": "ops_list",
    "contexts": [
      "list",
      "job"
    ],
    "formats": [
      "PDF",
      "XLSX",
      "CSV"
    ],
    "rolloutPhase": 1,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Job Status List Report Format-19",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "JOB_STATUS_LIST_REPORT_FORMAT_20",
    "name": "Job Status List Report Format-20",
    "family": "ops_list",
    "contexts": [
      "list",
      "job"
    ],
    "formats": [
      "PDF",
      "XLSX",
      "CSV"
    ],
    "rolloutPhase": 1,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Job Status List Report Format-20",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "JOURNAL_VOUCHER_REPORT_FORMAT_1",
    "name": "Journal Voucher Report Format-1",
    "family": "finance",
    "contexts": [
      "gl",
      "list"
    ],
    "formats": [
      "PDF",
      "XLSX"
    ],
    "rolloutPhase": 5,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Journal Voucher Report Format-1",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "JOURNAL_VOUCHER_REPORT_FORMAT_2",
    "name": "Journal Voucher Report Format-2",
    "family": "finance",
    "contexts": [
      "gl",
      "list"
    ],
    "formats": [
      "PDF",
      "XLSX"
    ],
    "rolloutPhase": 5,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Journal Voucher Report Format-2",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "JOURNAL_VOUCHER_REPORT_FORMAT_3",
    "name": "Journal Voucher Report Format-3",
    "family": "finance",
    "contexts": [
      "gl"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 5,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Journal Voucher Report Format-3",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "JOURNAL_VOUCHER_REPORT_FORMAT_4",
    "name": "Journal Voucher Report Format-4",
    "family": "finance",
    "contexts": [
      "gl"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 5,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Journal Voucher Report Format-4",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "JOURNAL_VOUCHER_REPORT_FORMAT_5",
    "name": "Journal Voucher Report Format-5",
    "family": "finance",
    "contexts": [
      "gl"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 5,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Journal Voucher Report Format-5",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "JOURNAL_VOUCHER_REPORT_FORMAT_6",
    "name": "Journal Voucher Report Format-6",
    "family": "finance",
    "contexts": [
      "gl"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 5,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Journal Voucher Report Format-6",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "JOURNAL_VOUCHER_REPORT_FORMAT_7",
    "name": "Journal Voucher Report Format-7",
    "family": "finance",
    "contexts": [
      "gl"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 5,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Journal Voucher Report Format-7",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "JOURNAL_VOUCHER_REPORT_FORMAT_8",
    "name": "Journal Voucher Report Format-8",
    "family": "finance",
    "contexts": [
      "gl"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 5,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Journal Voucher Report Format-8",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "JOURNAL_VOUCHER_REPORT_FORMAT_9",
    "name": "Journal Voucher Report Format-9",
    "family": "finance",
    "contexts": [
      "gl"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 5,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Journal Voucher Report Format-9",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "JOURNAL_VOUCHER_REPORT_FORMAT_10",
    "name": "Journal Voucher Report Format-10",
    "family": "finance",
    "contexts": [
      "gl"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 5,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Journal Voucher Report Format-10",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "JOURNAL_VOUCHER_REPORT_FORMAT_11",
    "name": "Journal Voucher Report Format-11",
    "family": "finance",
    "contexts": [
      "gl"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 5,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Journal Voucher Report Format-11",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "JOURNAL_VOUCHER_REPORT_FORMAT_12",
    "name": "Journal Voucher Report Format-12",
    "family": "finance",
    "contexts": [
      "gl"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 5,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Journal Voucher Report Format-12",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "LEFTOVER_HBL_DRAFT_JASPER",
    "name": "HBL Draft- Jasper",
    "family": "commercial",
    "contexts": [
      "invoice"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 4,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: HBL Draft- Jasper"
  },
  {
    "code": "LEFTOVER_HBL_DRAFT_JASPER_FORMAT_1",
    "name": "HBL Draft- Jasper format 1",
    "family": "commercial",
    "contexts": [
      "invoice"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 4,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: HBL Draft- Jasper format 1"
  },
  {
    "code": "LEFTOVER_INVOICE_FORMAT1_JASPER",
    "name": "Invoice format1 –Jasper",
    "family": "commercial",
    "contexts": [
      "invoice"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 4,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: Invoice format1 –Jasper"
  },
  {
    "code": "LEFTOVER_INVOICE_FORMAT2_FCY_JASPER",
    "name": "Invoice format2 FCY- Jasper",
    "family": "commercial",
    "contexts": [
      "invoice"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 4,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: Invoice format2 FCY- Jasper"
  },
  {
    "code": "LEFTOVER_INVOICE_FORMAT3_FCY_WITH_QRIRN_JASPER",
    "name": "Invoice format3 FCY with QR/IRN –Jasper",
    "family": "commercial",
    "contexts": [
      "invoice"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 4,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: Invoice format3 FCY with QR/IRN –Jasper"
  },
  {
    "code": "LEFTOVER_INVOICE_FORMAT3_JASPER",
    "name": "Invoice format3 –Jasper",
    "family": "commercial",
    "contexts": [
      "invoice"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 4,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: Invoice format3 –Jasper"
  },
  {
    "code": "LEFTOVER_INVOICE_FORMAT4_FCY_JASPER",
    "name": "Invoice format4 FCY- Jasper",
    "family": "commercial",
    "contexts": [
      "invoice"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 4,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: Invoice format4 FCY- Jasper"
  },
  {
    "code": "LEFTOVER_INVOICE_FORMAT5_JASPER",
    "name": "Invoice format5 –Jasper",
    "family": "commercial",
    "contexts": [
      "invoice"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 4,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: Invoice format5 –Jasper"
  },
  {
    "code": "LEFTOVER_INVOICE_FORMAT6",
    "name": "Invoice format6",
    "family": "commercial",
    "contexts": [
      "invoice"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 4,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: Invoice format6"
  },
  {
    "code": "LEFTOVER_INVOICE_FORMAT7_JASPER_INDIA",
    "name": "Invoice format7 –Jasper India",
    "family": "commercial",
    "contexts": [
      "invoice"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 4,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: Invoice format7 –Jasper India"
  },
  {
    "code": "LEFTOVER_INVOICE_FORMAT7_JASPER_USA",
    "name": "Invoice format7 –Jasper USA",
    "family": "commercial",
    "contexts": [
      "invoice"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 4,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: Invoice format7 –Jasper USA"
  },
  {
    "code": "LEFTOVER_INVOICE_FORMAT8_WITH_QRIRN_JASPER",
    "name": "Invoice Format8 with QR/IRN –Jasper",
    "family": "commercial",
    "contexts": [
      "invoice"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 4,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: Invoice Format8 with QR/IRN –Jasper"
  },
  {
    "code": "LEFTOVER_INVOICE_FORMAT9_WITH_QRIRN_JASPER",
    "name": "Invoice Format9 with QR/IRN –Jasper",
    "family": "commercial",
    "contexts": [
      "invoice"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 4,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: Invoice Format9 with QR/IRN –Jasper"
  },
  {
    "code": "LEFTOVER_INVOICE_FORMAT12_JASPER",
    "name": "Invoice Format12 –Jasper",
    "family": "commercial",
    "contexts": [
      "invoice"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 4,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: Invoice Format12 –Jasper"
  },
  {
    "code": "LEFTOVER_INVOICE_FORMAT14_JASPER",
    "name": "Invoice Format14 –Jasper",
    "family": "commercial",
    "contexts": [
      "invoice"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 4,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: Invoice Format14 –Jasper"
  },
  {
    "code": "LEFTOVER_INVOICE_FORMAT15_JASPER_PREPRINTED",
    "name": "Invoice format15 –Jasper Preprinted",
    "family": "commercial",
    "contexts": [
      "invoice"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 4,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: Invoice format15 –Jasper Preprinted"
  },
  {
    "code": "LEFTOVER_INVOICE_FORMAT15_JASPER_STANDARD",
    "name": "Invoice format15 –Jasper Standard",
    "family": "commercial",
    "contexts": [
      "invoice"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 4,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: Invoice format15 –Jasper Standard"
  },
  {
    "code": "LEFTOVER_INVOICE_SINGAPORE_JASPER",
    "name": "Invoice Singapore –Jasper",
    "family": "commercial",
    "contexts": [
      "invoice"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 4,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: Invoice Singapore –Jasper"
  },
  {
    "code": "LEFTOVER_LAND_FREIGHT_TRANSPORTATION_INVOICE_FORMAT_1",
    "name": "Land Freight/ Transportation Invoice Format 1",
    "family": "commercial",
    "contexts": [
      "invoice"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 4,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: Land Freight/ Transportation Invoice Format 1"
  },
  {
    "code": "LEFTOVER_OVERSEAS_DEBIT_NOTE_EXPORT_INVOICE_JASPER_FORMAT2",
    "name": "Overseas Debit Note (Export Invoice) –Jasper Format2",
    "family": "commercial",
    "contexts": [
      "invoice"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 4,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: Overseas Debit Note (Export Invoice) –Jasper Format2"
  },
  {
    "code": "LEFTOVER_PROFORMA_INVOICE_FORMAT_1",
    "name": "Proforma Invoice format 1",
    "family": "commercial",
    "contexts": [
      "invoice"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 4,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: Proforma Invoice format 1"
  },
  {
    "code": "LEFTOVER_SAUDI_TAX_INVOICE_ARABIC_JASPER",
    "name": "Saudi TAX Invoice –Arabic Jasper",
    "family": "commercial",
    "contexts": [
      "invoice"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 4,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: Saudi TAX Invoice –Arabic Jasper"
  },
  {
    "code": "LEFTOVER_SIMPLE_INVOICE_INDIA",
    "name": "Simple Invoice –India",
    "family": "commercial",
    "contexts": [
      "invoice"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 4,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: Simple Invoice –India"
  },
  {
    "code": "LEFTOVER_SIMPLE_INVOICE_INDIA_JASPER",
    "name": "Simple Invoice –India Jasper",
    "family": "commercial",
    "contexts": [
      "invoice"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 4,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: Simple Invoice –India Jasper"
  },
  {
    "code": "LEFTOVER_SIMPLE_INVOICE_INDIA_WITH_OS",
    "name": "Simple Invoice –India with O/S",
    "family": "commercial",
    "contexts": [
      "invoice"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 4,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: Simple Invoice –India with O/S"
  },
  {
    "code": "LEFTOVER_SIMPLE_INVOICE_JASPER",
    "name": "Simple Invoice –Jasper",
    "family": "commercial",
    "contexts": [
      "invoice"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 4,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: Simple Invoice –Jasper"
  },
  {
    "code": "LEFTOVER_SIMPLE_INVOICE_US_JASPER",
    "name": "Simple Invoice –US Jasper",
    "family": "commercial",
    "contexts": [
      "invoice"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 4,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: Simple Invoice –US Jasper"
  },
  {
    "code": "LEFTOVER_SIMPLE_INVOICE_WITH_OS",
    "name": "Simple Invoice with O/S",
    "family": "commercial",
    "contexts": [
      "invoice"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 4,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: Simple Invoice with O/S"
  },
  {
    "code": "LEFTOVER_SIMPLE_INVOICEVAT",
    "name": "Simple Invoice(VAT)",
    "family": "commercial",
    "contexts": [
      "invoice"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 4,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: Simple Invoice(VAT)"
  },
  {
    "code": "LEFTOVER_STANDARD_INVOICE_3_DECIMAL",
    "name": "Standard Invoice 3 Decimal",
    "family": "commercial",
    "contexts": [
      "invoice"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 4,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: Standard Invoice 3 Decimal"
  },
  {
    "code": "LEFTOVER_STANDARD_INVOICE_ARABIC_JASPER",
    "name": "Standard Invoice Arabic –Jasper",
    "family": "commercial",
    "contexts": [
      "invoice"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 4,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: Standard Invoice Arabic –Jasper"
  },
  {
    "code": "LEFTOVER_STANDARD_INVOICE_ARABIC_JASPER_FORMAT1",
    "name": "Standard Invoice Arabic –Jasper Format1",
    "family": "commercial",
    "contexts": [
      "invoice"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 4,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: Standard Invoice Arabic –Jasper Format1"
  },
  {
    "code": "LEFTOVER_STANDARD_INVOICE_ARABIC_JASPER_FORMAT1_WITH_LETTER_HEAD",
    "name": "Standard Invoice Arabic –Jasper Format1 With Letter head",
    "family": "commercial",
    "contexts": [
      "invoice"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 4,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: Standard Invoice Arabic –Jasper Format1 With Letter head"
  },
  {
    "code": "LEFTOVER_STANDARD_INVOICE_ARABIC_OMAN_JASPER",
    "name": "Standard Invoice Arabic Oman –Jasper",
    "family": "commercial",
    "contexts": [
      "invoice"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 4,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: Standard Invoice Arabic Oman –Jasper"
  },
  {
    "code": "LEFTOVER_STANDARD_INVOICE_ARABIC_WITH_QR_CODE_JASPER_FORMAT2",
    "name": "Standard Invoice Arabic with QR code –Jasper Format2",
    "family": "commercial",
    "contexts": [
      "invoice"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 4,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: Standard Invoice Arabic with QR code –Jasper Format2"
  },
  {
    "code": "LEFTOVER_STANDARD_INVOICE_ARABIC_WITH_QR_CODE_JASPER_FORMAT3",
    "name": "Standard Invoice Arabic with QR code –Jasper Format3",
    "family": "commercial",
    "contexts": [
      "invoice"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 4,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: Standard Invoice Arabic with QR code –Jasper Format3"
  },
  {
    "code": "LEFTOVER_STANDARD_INVOICE_ARABIC_WITH_QR_CODE_JASPER_FORMAT4",
    "name": "Standard Invoice Arabic with QR code –Jasper Format4",
    "family": "commercial",
    "contexts": [
      "invoice"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 4,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: Standard Invoice Arabic with QR code –Jasper Format4"
  },
  {
    "code": "LEFTOVER_STANDARD_INVOICE_ARABIC_WITH_QR_CODE_JASPER_FORMAT5",
    "name": "Standard Invoice Arabic with QR code –Jasper Format5",
    "family": "commercial",
    "contexts": [
      "invoice"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 4,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: Standard Invoice Arabic with QR code –Jasper Format5"
  },
  {
    "code": "LEFTOVER_STANDARD_INVOICE_ARABIC_WITH_QR_CODE_JASPER_FORMAT7",
    "name": "Standard Invoice Arabic with QR code –Jasper Format7",
    "family": "commercial",
    "contexts": [
      "invoice"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 4,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: Standard Invoice Arabic with QR code –Jasper Format7"
  },
  {
    "code": "LEFTOVER_STANDARD_INVOICE_COURIER_JASPER",
    "name": "Standard Invoice Courier –Jasper",
    "family": "commercial",
    "contexts": [
      "invoice"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 4,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: Standard Invoice Courier –Jasper"
  },
  {
    "code": "LEFTOVER_STANDARD_INVOICE_CUM_ARRIVAL_NOTICE_JASPER_FORMAT16",
    "name": "Standard Invoice cum Arrival Notice –Jasper format16",
    "family": "commercial",
    "contexts": [
      "invoice"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 4,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: Standard Invoice cum Arrival Notice –Jasper format16"
  },
  {
    "code": "LEFTOVER_STANDARD_INVOICE_FCY_FORMAT2",
    "name": "Standard Invoice FCY Format2",
    "family": "commercial",
    "contexts": [
      "invoice"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 4,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: Standard Invoice FCY Format2"
  },
  {
    "code": "LEFTOVER_STANDARD_INVOICE_FCY_WITH_QRIRN_JASPER",
    "name": "Standard Invoice FCY with QR/IRN –Jasper",
    "family": "commercial",
    "contexts": [
      "invoice"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 4,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: Standard Invoice FCY with QR/IRN –Jasper"
  },
  {
    "code": "LEFTOVER_STANDARD_INVOICE_JASPER",
    "name": "Standard Invoice –Jasper",
    "family": "commercial",
    "contexts": [
      "invoice"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 4,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: Standard Invoice –Jasper"
  },
  {
    "code": "LEFTOVER_STANDARD_INVOICE_JASPER_FORMAT3",
    "name": "Standard Invoice –Jasper format3",
    "family": "commercial",
    "contexts": [
      "invoice"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 4,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: Standard Invoice –Jasper format3"
  },
  {
    "code": "LEFTOVER_STANDARD_INVOICE_JASPER_FORMAT4",
    "name": "Standard Invoice –Jasper Format4",
    "family": "commercial",
    "contexts": [
      "invoice"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 4,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: Standard Invoice –Jasper Format4"
  },
  {
    "code": "LEFTOVER_STANDARD_INVOICE_JASPER_FORMAT5",
    "name": "Standard Invoice –Jasper format5",
    "family": "commercial",
    "contexts": [
      "invoice"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 4,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: Standard Invoice –Jasper format5"
  },
  {
    "code": "LEFTOVER_STANDARD_INVOICE_JASPER_FORMAT6",
    "name": "Standard Invoice –Jasper format6",
    "family": "commercial",
    "contexts": [
      "invoice"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 4,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: Standard Invoice –Jasper format6"
  },
  {
    "code": "LEFTOVER_STANDARD_INVOICE_JASPER_FORMAT9",
    "name": "Standard Invoice –Jasper format9",
    "family": "commercial",
    "contexts": [
      "invoice"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 4,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: Standard Invoice –Jasper format9"
  },
  {
    "code": "LEFTOVER_STANDARD_INVOICE_JASPER_FORMAT10",
    "name": "Standard Invoice –Jasper format10",
    "family": "commercial",
    "contexts": [
      "invoice"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 4,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: Standard Invoice –Jasper format10"
  },
  {
    "code": "LEFTOVER_STANDARD_INVOICE_JASPER_FORMAT12_LETTERHEAD",
    "name": "Standard Invoice –Jasper format12 Letterhead",
    "family": "commercial",
    "contexts": [
      "invoice"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 4,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: Standard Invoice –Jasper format12 Letterhead"
  },
  {
    "code": "LEFTOVER_STANDARD_INVOICE_JASPER_FORMAT13",
    "name": "Standard Invoice –Jasper format13",
    "family": "commercial",
    "contexts": [
      "invoice"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 4,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: Standard Invoice –Jasper format13"
  },
  {
    "code": "LEFTOVER_STANDARD_INVOICE_JASPER_FORMAT14_QR_CODE",
    "name": "Standard Invoice –Jasper format14 QR code",
    "family": "commercial",
    "contexts": [
      "invoice"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 4,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: Standard Invoice –Jasper format14 QR code"
  },
  {
    "code": "LEFTOVER_STANDARD_INVOICE_JASPER_FORMAT15",
    "name": "Standard Invoice –Jasper format15",
    "family": "commercial",
    "contexts": [
      "invoice"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 4,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: Standard Invoice –Jasper format15"
  },
  {
    "code": "LEFTOVER_STANDARD_INVOICE_JASPER_FORMAT16",
    "name": "Standard Invoice –Jasper format16",
    "family": "commercial",
    "contexts": [
      "invoice"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 4,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: Standard Invoice –Jasper format16"
  },
  {
    "code": "LEFTOVER_STANDARD_INVOICE_JASPER_FORMAT17_WITH_HOLDING_TAX",
    "name": "Standard Invoice –Jasper format17 (With Holding Tax)",
    "family": "commercial",
    "contexts": [
      "invoice"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 4,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: Standard Invoice –Jasper format17 (With Holding Tax)"
  },
  {
    "code": "LEFTOVER_STANDARD_INVOICE_JASPER_FORMAT18",
    "name": "Standard Invoice –Jasper format18",
    "family": "commercial",
    "contexts": [
      "invoice"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 4,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: Standard Invoice –Jasper format18"
  },
  {
    "code": "LEFTOVER_STANDARD_INVOICE_JASPER_FORMAT19",
    "name": "Standard Invoice –Jasper format19",
    "family": "commercial",
    "contexts": [
      "invoice"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 4,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: Standard Invoice –Jasper format19"
  },
  {
    "code": "LEFTOVER_STANDARD_INVOICE_JASPER_FORMAT20_UAE_LOCAL_CURRENCY",
    "name": "Standard Invoice –Jasper format20 –UAE Local Currency",
    "family": "commercial",
    "contexts": [
      "invoice"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 4,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: Standard Invoice –Jasper format20 –UAE Local Currency"
  },
  {
    "code": "LEFTOVER_STANDARD_INVOICE_JASPER_FORMAT21_WITH_HOLDING_TAX",
    "name": "Standard Invoice –Jasper format21 (With Holding Tax)",
    "family": "commercial",
    "contexts": [
      "invoice"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 4,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: Standard Invoice –Jasper format21 (With Holding Tax)"
  },
  {
    "code": "LEFTOVER_STANDARD_INVOICE_JASPER_FORMAT22",
    "name": "Standard Invoice –Jasper format22",
    "family": "commercial",
    "contexts": [
      "invoice"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 4,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: Standard Invoice –Jasper format22"
  },
  {
    "code": "LEFTOVER_STANDARD_INVOICE_JASPER_TANZANIA",
    "name": "Standard Invoice –Jasper Tanzania",
    "family": "commercial",
    "contexts": [
      "invoice"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 4,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: Standard Invoice –Jasper Tanzania"
  },
  {
    "code": "LEFTOVER_STANDARD_INVOICE_LAND",
    "name": "Standard Invoice -Land",
    "family": "commercial",
    "contexts": [
      "invoice"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 4,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: Standard Invoice -Land"
  },
  {
    "code": "LEFTOVER_STANDARD_INVOICE_MALAYSIA",
    "name": "Standard Invoice-Malaysia",
    "family": "commercial",
    "contexts": [
      "invoice"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 4,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: Standard Invoice-Malaysia"
  },
  {
    "code": "LEFTOVER_STANDARD_INVOICE_USA_FORMAT_2",
    "name": "Standard Invoice-USA Format 2",
    "family": "commercial",
    "contexts": [
      "invoice"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 4,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: Standard Invoice-USA Format 2"
  },
  {
    "code": "LEFTOVER_STANDARD_TAX_INVOICE_JASPER",
    "name": "Standard Tax Invoice –Jasper",
    "family": "commercial",
    "contexts": [
      "invoice"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 4,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: Standard Tax Invoice –Jasper"
  },
  {
    "code": "LEFTOVER_TAX_INVOICE_INDIA",
    "name": "TAX Invoice –India",
    "family": "commercial",
    "contexts": [
      "invoice"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 4,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: TAX Invoice –India"
  },
  {
    "code": "LEFTOVER_TAX_INVOICE_INDIA_FORMAT1",
    "name": "TAX Invoice –India format1",
    "family": "commercial",
    "contexts": [
      "invoice"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 4,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: TAX Invoice –India format1"
  },
  {
    "code": "LEFTOVER_TAX_INVOICE_INDIA_FORMAT2",
    "name": "TAX Invoice –India format2",
    "family": "commercial",
    "contexts": [
      "invoice"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 4,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: TAX Invoice –India format2"
  },
  {
    "code": "LEFTOVER_TAX_INVOICE_INDIA_FORMAT2_JASPER",
    "name": "TAX Invoice –India format2 Jasper",
    "family": "commercial",
    "contexts": [
      "invoice"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 4,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: TAX Invoice –India format2 Jasper"
  },
  {
    "code": "LEFTOVER_TAX_INVOICE_INDIA_FORMAT6_JASPER",
    "name": "TAX Invoice –India format6 Jasper",
    "family": "commercial",
    "contexts": [
      "invoice"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 4,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: TAX Invoice –India format6 Jasper"
  },
  {
    "code": "LEFTOVER_TAX_INVOICE_INDIA_FORMAT7_JASPER",
    "name": "TAX Invoice –India format7 Jasper",
    "family": "commercial",
    "contexts": [
      "invoice"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 4,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: TAX Invoice –India format7 Jasper"
  },
  {
    "code": "LEFTOVER_TAX_INVOICE_INDIA_FORMAT8_JASPER",
    "name": "TAX Invoice –India format8 Jasper",
    "family": "commercial",
    "contexts": [
      "invoice"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 4,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: TAX Invoice –India format8 Jasper"
  },
  {
    "code": "LEFTOVER_TAX_INVOICE_INDIA_JASPER",
    "name": "TAX Invoice –India Jasper",
    "family": "commercial",
    "contexts": [
      "invoice"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 4,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: TAX Invoice –India Jasper"
  },
  {
    "code": "LEFTOVER_TAX_INVOICE_INDIA_JASPER_FORMAT1",
    "name": "TAX Invoice –India Jasper Format1",
    "family": "commercial",
    "contexts": [
      "invoice"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 4,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: TAX Invoice –India Jasper Format1"
  },
  {
    "code": "LEFTOVER_TAX_INVOICE_INDIA_REIMBURSEMENT_BILL",
    "name": "TAX Invoice –India (Reimbursement Bill)",
    "family": "commercial",
    "contexts": [
      "invoice"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 4,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: TAX Invoice –India (Reimbursement Bill)"
  },
  {
    "code": "LEFTOVER_TAX_INVOICE_MALAYSIA_JASPER",
    "name": "Tax Invoice Malaysia –Jasper",
    "family": "commercial",
    "contexts": [
      "invoice"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 4,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: Tax Invoice Malaysia –Jasper"
  },
  {
    "code": "LEFTOVER_TAX_INVOICE_SINGAPORE_JASPER",
    "name": "Tax Invoice Singapore –Jasper",
    "family": "commercial",
    "contexts": [
      "invoice"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 4,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: Tax Invoice Singapore –Jasper"
  },
  {
    "code": "LEFTOVER_TAX_INVOICE_WITH_QR_INDIA_FORMAT3_JASPER",
    "name": "TAX Invoice with QR –India format3 Jasper",
    "family": "commercial",
    "contexts": [
      "invoice"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 4,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: TAX Invoice with QR –India format3 Jasper"
  },
  {
    "code": "LEFTOVER_TAX_INVOICE_WITH_QRIRN_INDIA_FORMAT4_JASPER",
    "name": "TAX Invoice with QR/IRN –India format4 Jasper",
    "family": "commercial",
    "contexts": [
      "invoice"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 4,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: TAX Invoice with QR/IRN –India format4 Jasper"
  },
  {
    "code": "LEFTOVER_TAX_INVOICE_WITH_QRIRN_INDIA_FORMAT5_JASPER",
    "name": "TAX Invoice with QR/IRN –India format5 Jasper",
    "family": "commercial",
    "contexts": [
      "invoice"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 4,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: TAX Invoice with QR/IRN –India format5 Jasper"
  },
  {
    "code": "LEFTOVER_VIETNAM_INVOICE",
    "name": "Vietnam Invoice",
    "family": "commercial",
    "contexts": [
      "invoice"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 4,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: Vietnam Invoice"
  },
  {
    "code": "LEFTOVER_WAREHOUSE_INVOICE_INDIA_FORMAT",
    "name": "Warehouse Invoice –India Format",
    "family": "commercial",
    "contexts": [
      "invoice"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 4,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: Warehouse Invoice –India Format"
  },
  {
    "code": "LETTER_OF_GUARANTEE_REPORT_FORMAT",
    "name": "Letter OF Guarantee Report Format",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Letter OF Guarantee Report Format",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "LOADING_CONFIRMATION_REPORT_FORMAT",
    "name": "Loading Confirmation Report Format",
    "family": "other",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: Loading Confirmation Report Format"
  },
  {
    "code": "MANIFEST_NOT_SENT_TO_AGENT_REPORT_FORMAT",
    "name": "Manifest Not Sent To Agent Report Format",
    "family": "ops_list",
    "contexts": [
      "list",
      "job"
    ],
    "formats": [
      "PDF",
      "XLSX",
      "CSV"
    ],
    "rolloutPhase": 1,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Manifest Not Sent To Agent Report Format",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "MAWB_DRAFT_REPORT_FORMAT",
    "name": "MAWB Draft Report Format",
    "family": "air_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 3,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: MAWB Draft Report Format",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "MAWB_DRAFT_REPORT_FORMAT_2",
    "name": "MAWB Draft Report Format-2",
    "family": "air_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 3,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: MAWB Draft Report Format-2",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "MAWB_DRAFT_REPORT_FORMAT_3",
    "name": "MAWB Draft Report Format-3",
    "family": "air_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 3,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: MAWB Draft Report Format-3",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "MAWB_DRAFT_REPORT_FORMAT_4",
    "name": "MAWB Draft Report Format-4",
    "family": "air_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 3,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: MAWB Draft Report Format-4",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "MAWB_DRAFT_REPORT_FORMAT_5",
    "name": "MAWB Draft Report Format-5",
    "family": "air_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 3,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: MAWB Draft Report Format-5",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "MAWB_DRAFT_REPORT_FORMAT_6",
    "name": "MAWB Draft Report Format-6",
    "family": "air_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 3,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: MAWB Draft Report Format-6",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "MAWB_DRAFT_REPORT_FORMAT_7",
    "name": "MAWB Draft Report Format-7",
    "family": "air_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 3,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: MAWB Draft Report Format-7",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "MAWB_DRAFT_REPORT_FORMAT_8",
    "name": "MAWB Draft Report Format-8",
    "family": "air_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 3,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: MAWB Draft Report Format-8",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "MAWB_DRAFT_REPORT_FORMAT_9",
    "name": "MAWB Draft Report Format-9",
    "family": "air_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 3,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: MAWB Draft Report Format-9",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "MAWB_DRAFT_REPORT_FORMAT_10",
    "name": "MAWB Draft Report Format-10",
    "family": "air_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 3,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: MAWB Draft Report Format-10",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "MAWB_DRAFT_REPORT_FORMAT_11",
    "name": "MAWB Draft Report Format-11",
    "family": "air_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 3,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: MAWB Draft Report Format-11",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "MAWB_DRAFT_REPORT_FORMAT_12",
    "name": "MAWB Draft Report Format-12",
    "family": "air_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 3,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: MAWB Draft Report Format-12",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "MAWB_DRAFT_REPORT_FORMAT_13",
    "name": "MAWB Draft Report Format-13",
    "family": "air_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 3,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: MAWB Draft Report Format-13",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "MAWB_DRAFT_REPORT_FORMAT_14",
    "name": "MAWB Draft Report Format-14",
    "family": "air_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 3,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: MAWB Draft Report Format-14",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "MAWB_DRAFT_REPORT_FORMAT_15",
    "name": "MAWB Draft Report Format-15",
    "family": "air_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 3,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: MAWB Draft Report Format-15",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "MAWB_DRAFT_REPORT_FORMAT_16",
    "name": "MAWB Draft Report Format-16",
    "family": "air_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 3,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: MAWB Draft Report Format-16",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "MAWB_ORIGINAL_PREPRINTED_KC_REPORT_FORMAT",
    "name": "MAWB Original Preprinted KC Report Format",
    "family": "air_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 3,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: MAWB Original Preprinted KC Report Format",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "MRN_NUMBER_NOT_ENTERED_JOB_LIST_DUBAI_REPORT_FORMAT",
    "name": "MRN Number Not Entered Job List Dubai Report Format",
    "family": "ops_list",
    "contexts": [
      "list",
      "job"
    ],
    "formats": [
      "PDF",
      "XLSX",
      "CSV"
    ],
    "rolloutPhase": 1,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: MRN Number Not Entered Job List Dubai Report Format",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "OUTSTANDING_LETTER_REPORT_FORMAT_1_OUTSTANDING_LETTER",
    "name": "Outstanding Letter Report Format-1 Outstanding Letter",
    "family": "finance",
    "contexts": [
      "gl",
      "list"
    ],
    "formats": [
      "PDF",
      "XLSX"
    ],
    "rolloutPhase": 5,
    "gapStatus": "covered_analytics",
    "description": "FRESA sample: Outstanding Letter Report Format-1 Outstanding Letter",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ],
    "existingPath": "/gl/ar/aging"
  },
  {
    "code": "OUTSTANDING_LETTER_REPORT_FORMAT_2_OUTSTANDING_LETTER_JASPER",
    "name": "Outstanding Letter Report Format-2 Outstanding Letter Jasper",
    "family": "finance",
    "contexts": [
      "gl",
      "list"
    ],
    "formats": [
      "PDF",
      "XLSX"
    ],
    "rolloutPhase": 5,
    "gapStatus": "covered_analytics",
    "description": "FRESA sample: Outstanding Letter Report Format-2 Outstanding Letter Jasper",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ],
    "existingPath": "/gl/ar/aging"
  },
  {
    "code": "OUTSTANDING_LETTER_REPORT_FORMAT_3_OUTSTANDING_LETTER_WITH_AGING",
    "name": "Outstanding Letter Report Format-3 Outstanding Letter With Aging",
    "family": "finance",
    "contexts": [
      "gl",
      "list"
    ],
    "formats": [
      "PDF",
      "XLSX"
    ],
    "rolloutPhase": 5,
    "gapStatus": "covered_analytics",
    "description": "FRESA sample: Outstanding Letter Report Format-3 Outstanding Letter With Aging",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ],
    "existingPath": "/gl/ar/aging"
  },
  {
    "code": "OUTSTANDING_LETTER_REPORT_FORMAT_4_OUTSTANDING_LETTER_WITH_BL_DETAILS",
    "name": "Outstanding Letter Report Format-4 Outstanding Letter With BL Details",
    "family": "finance",
    "contexts": [
      "gl",
      "list"
    ],
    "formats": [
      "PDF",
      "XLSX"
    ],
    "rolloutPhase": 5,
    "gapStatus": "covered_analytics",
    "description": "FRESA sample: Outstanding Letter Report Format-4 Outstanding Letter With BL Details",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ],
    "existingPath": "/gl/ar/aging"
  },
  {
    "code": "OUTSTANDING_LETTER_REPORT_FORMAT_5_OUTSTANDING_LETTER_WITH_INVOICES",
    "name": "Outstanding Letter Report Format-5 Outstanding Letter With Invoices",
    "family": "finance",
    "contexts": [
      "gl",
      "list"
    ],
    "formats": [
      "PDF",
      "XLSX"
    ],
    "rolloutPhase": 5,
    "gapStatus": "covered_analytics",
    "description": "FRESA sample: Outstanding Letter Report Format-5 Outstanding Letter With Invoices",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ],
    "existingPath": "/gl/ar/aging"
  },
  {
    "code": "OUTSTANDING_LETTER_REPORT_FORMAT_6",
    "name": "Outstanding Letter Report Format-6",
    "family": "finance",
    "contexts": [
      "gl",
      "party"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 5,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Outstanding Letter Report Format-6",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "OUTSTANDING_LETTER_REPORT_FORMAT_7",
    "name": "Outstanding Letter Report Format-7",
    "family": "finance",
    "contexts": [
      "gl",
      "party"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 5,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Outstanding Letter Report Format-7",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "OUTSTANDING_LETTER_REPORT_FORMAT_8",
    "name": "Outstanding Letter Report Format-8",
    "family": "finance",
    "contexts": [
      "gl",
      "party"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 5,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Outstanding Letter Report Format-8",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "OUTSTANDING_LETTER_REPORT_FORMAT_9",
    "name": "Outstanding Letter Report Format-9",
    "family": "finance",
    "contexts": [
      "gl",
      "party"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 5,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Outstanding Letter Report Format-9",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "OUTSTANDING_LETTER_REPORT_FORMAT_10",
    "name": "Outstanding Letter Report Format-10",
    "family": "finance",
    "contexts": [
      "gl",
      "party"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 5,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Outstanding Letter Report Format-10",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "OUTSTANDING_LETTER_REPORT_FORMAT_11",
    "name": "Outstanding Letter Report Format-11",
    "family": "finance",
    "contexts": [
      "gl",
      "party"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 5,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Outstanding Letter Report Format-11",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "OUTSTANDING_LETTER_REPORT_FORMAT_12",
    "name": "Outstanding Letter Report Format-12",
    "family": "finance",
    "contexts": [
      "gl",
      "party"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 5,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Outstanding Letter Report Format-12",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "OUTSTANDING_LETTER_REPORT_FORMAT_13",
    "name": "Outstanding Letter Report Format-13",
    "family": "finance",
    "contexts": [
      "gl",
      "party"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 5,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Outstanding Letter Report Format-13",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "OUTSTANDING_LETTER_REPORT_FORMAT_14",
    "name": "Outstanding Letter Report Format-14",
    "family": "finance",
    "contexts": [
      "gl",
      "party"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 5,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Outstanding Letter Report Format-14",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "OUTSTANDING_LETTER_REPORT_FORMAT_15",
    "name": "Outstanding Letter Report Format-15",
    "family": "finance",
    "contexts": [
      "gl",
      "party"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 5,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Outstanding Letter Report Format-15",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "OUTSTANDING_LETTER_REPORT_FORMAT_16",
    "name": "Outstanding Letter Report Format-16",
    "family": "finance",
    "contexts": [
      "gl",
      "party"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 5,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Outstanding Letter Report Format-16",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "OUTSTANDING_LETTER_REPORT_FORMAT_17",
    "name": "Outstanding Letter Report Format-17",
    "family": "finance",
    "contexts": [
      "gl",
      "party"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 5,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Outstanding Letter Report Format-17",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "OUTSTANDING_LETTER_REPORT_FORMAT_18",
    "name": "Outstanding Letter Report Format-18",
    "family": "finance",
    "contexts": [
      "gl",
      "party"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 5,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Outstanding Letter Report Format-18",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "OUTSTANDING_LETTER_REPORT_FORMAT_19",
    "name": "Outstanding Letter Report Format-19",
    "family": "finance",
    "contexts": [
      "gl",
      "party"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 5,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Outstanding Letter Report Format-19",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "OUTSTANDING_LETTER_REPORT_FORMAT_20",
    "name": "Outstanding Letter Report Format-20",
    "family": "finance",
    "contexts": [
      "gl",
      "party"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 5,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Outstanding Letter Report Format-20",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "PAYMENT_REQUEST_LIST_REPORT_FORMAT",
    "name": "Payment Request List Report Format",
    "family": "ops_list",
    "contexts": [
      "list",
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 1,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: Payment Request List Report Format"
  },
  {
    "code": "PAYMENT_VOUCHER_REPORT_FORMAT_1",
    "name": "Payment Voucher Report Format-1",
    "family": "finance",
    "contexts": [
      "gl"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 5,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Payment Voucher Report Format-1",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "PAYMENT_VOUCHER_REPORT_FORMAT_2",
    "name": "Payment Voucher Report Format-2",
    "family": "finance",
    "contexts": [
      "gl"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 5,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Payment Voucher Report Format-2",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "PAYMENT_VOUCHER_REPORT_FORMAT_3",
    "name": "Payment Voucher Report Format-3",
    "family": "finance",
    "contexts": [
      "gl"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 5,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Payment Voucher Report Format-3",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "PAYMENT_VOUCHER_REPORT_FORMAT_4",
    "name": "Payment Voucher Report Format-4",
    "family": "finance",
    "contexts": [
      "gl"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 5,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Payment Voucher Report Format-4",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "PAYMENT_VOUCHER_REPORT_FORMAT_4_VIETNAM",
    "name": "Payment Voucher Report Format-4 Vietnam",
    "family": "finance",
    "contexts": [
      "gl",
      "list"
    ],
    "formats": [
      "PDF",
      "XLSX"
    ],
    "rolloutPhase": 5,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Payment Voucher Report Format-4 Vietnam",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "PAYMENT_VOUCHER_REPORT_FORMAT_5",
    "name": "Payment Voucher Report Format-5",
    "family": "finance",
    "contexts": [
      "gl"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 5,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Payment Voucher Report Format-5",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "PAYMENT_VOUCHER_REPORT_FORMAT_6",
    "name": "Payment Voucher Report Format-6",
    "family": "finance",
    "contexts": [
      "gl"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 5,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Payment Voucher Report Format-6",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "PAYMENT_VOUCHER_REPORT_FORMAT_7",
    "name": "Payment Voucher Report Format-7",
    "family": "finance",
    "contexts": [
      "gl"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 5,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Payment Voucher Report Format-7",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "PAYMENT_VOUCHER_REPORT_FORMAT_8",
    "name": "Payment Voucher Report Format-8",
    "family": "finance",
    "contexts": [
      "gl"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 5,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Payment Voucher Report Format-8",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "PAYMENT_VOUCHER_REPORT_FORMAT_9",
    "name": "Payment Voucher Report Format-9",
    "family": "finance",
    "contexts": [
      "gl"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 5,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Payment Voucher Report Format-9",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "PAYMENT_VOUCHER_REPORT_FORMAT_10",
    "name": "Payment Voucher Report Format-10",
    "family": "finance",
    "contexts": [
      "gl"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 5,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Payment Voucher Report Format-10",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "PENDING_JOBS_ATD_UPDATED_BUT_CONTAINER_LOADING_DATE_NOT_UPDATED_LIST_REPORT_FORM",
    "name": "Pending Jobs Atd Updated But Container Loading Date Not Updated List Report Format",
    "family": "ops_list",
    "contexts": [
      "list",
      "job"
    ],
    "formats": [
      "PDF",
      "XLSX",
      "CSV"
    ],
    "rolloutPhase": 1,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Pending Jobs Atd Updated But Container Loading Date Not Updated List Report Format",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "PENDING_SHIPMENT_FOR_CARGO_DELIVERY_DO_ISSUED_LIST_REPORT_FORMAT",
    "name": "Pending Shipment For Cargo Delivery Do Issued List Report Format",
    "family": "ops_list",
    "contexts": [
      "list",
      "job"
    ],
    "formats": [
      "PDF",
      "XLSX",
      "CSV"
    ],
    "rolloutPhase": 1,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Pending Shipment For Cargo Delivery Do Issued List Report Format",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "PENDING_SHIPMENTS_FOR_CARGO_ARRIVAL_NOTICE_LIST_REPORT_FORMAT",
    "name": "Pending Shipments For Cargo Arrival Notice List Report Format",
    "family": "ops_list",
    "contexts": [
      "list",
      "job"
    ],
    "formats": [
      "PDF",
      "XLSX",
      "CSV"
    ],
    "rolloutPhase": 1,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Pending Shipments For Cargo Arrival Notice List Report Format",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "PENDING_SHIPMENTS_FOR_CARGO_DELIVERY_LIST_REPORT_FORMAT",
    "name": "pending Shipments For Cargo Delivery List Report Format",
    "family": "ops_list",
    "contexts": [
      "list",
      "job"
    ],
    "formats": [
      "PDF",
      "XLSX",
      "CSV"
    ],
    "rolloutPhase": 1,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: pending Shipments For Cargo Delivery List Report Format",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "PENDING_SHIPMENTS_FOR_DELIVERY_ORDER_LIST_REPORT_FORMAT",
    "name": "Pending Shipments For Delivery Order List Report Format",
    "family": "ops_list",
    "contexts": [
      "list",
      "job"
    ],
    "formats": [
      "PDF",
      "XLSX",
      "CSV"
    ],
    "rolloutPhase": 1,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Pending Shipments For Delivery Order List Report Format",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "PENDING_SHIPMENTS_FOR_DRAFT_BL_LIST_REPORT_FORMAT",
    "name": "Pending Shipments For Draft BL List Report Format",
    "family": "ops_list",
    "contexts": [
      "list",
      "job"
    ],
    "formats": [
      "PDF",
      "XLSX",
      "CSV"
    ],
    "rolloutPhase": 1,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Pending Shipments For Draft BL List Report Format",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "PENDING_SHIPMENTS_LIST_REPORT_FORMAT_1",
    "name": "Pending Shipments List Report Format-1",
    "family": "ops_list",
    "contexts": [
      "list",
      "job"
    ],
    "formats": [
      "PDF",
      "XLSX",
      "CSV"
    ],
    "rolloutPhase": 1,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Pending Shipments List Report Format-1",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "PENDING_SHIPMENTS_LIST_REPORT_FORMAT_2",
    "name": "Pending Shipments List Report Format-2",
    "family": "ops_list",
    "contexts": [
      "list",
      "job"
    ],
    "formats": [
      "PDF",
      "XLSX",
      "CSV"
    ],
    "rolloutPhase": 1,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Pending Shipments List Report Format-2",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "PENDING_SHIPMENTS_LIST_REPORT_FORMAT_3",
    "name": "Pending Shipments List Report Format-3",
    "family": "ops_list",
    "contexts": [
      "list",
      "job"
    ],
    "formats": [
      "PDF",
      "XLSX",
      "CSV"
    ],
    "rolloutPhase": 1,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Pending Shipments List Report Format-3",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "PENDING_SHIPMENTS_LIST_REPORT_FORMAT_4",
    "name": "Pending Shipments List Report Format-4",
    "family": "ops_list",
    "contexts": [
      "list",
      "job"
    ],
    "formats": [
      "PDF",
      "XLSX",
      "CSV"
    ],
    "rolloutPhase": 1,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Pending Shipments List Report Format-4",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "PENDING_SHIPMENTS_LIST_REPORT_FORMAT_5",
    "name": "Pending Shipments List Report Format-5",
    "family": "ops_list",
    "contexts": [
      "list",
      "job"
    ],
    "formats": [
      "PDF",
      "XLSX",
      "CSV"
    ],
    "rolloutPhase": 1,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Pending Shipments List Report Format-5",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "PENDING_SHIPMENTS_LIST_REPORT_FORMAT_6",
    "name": "Pending Shipments List Report Format-6",
    "family": "ops_list",
    "contexts": [
      "list",
      "job"
    ],
    "formats": [
      "PDF",
      "XLSX",
      "CSV"
    ],
    "rolloutPhase": 1,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Pending Shipments List Report Format-6",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "PENDING_SHIPMENTS_LIST_REPORT_FORMAT_7",
    "name": "Pending Shipments List Report Format-7",
    "family": "ops_list",
    "contexts": [
      "list",
      "job"
    ],
    "formats": [
      "PDF",
      "XLSX",
      "CSV"
    ],
    "rolloutPhase": 1,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Pending Shipments List Report Format-7",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "PENDING_SHIPMENTS_LIST_REPORT_FORMAT_8",
    "name": "Pending Shipments List Report Format-8",
    "family": "ops_list",
    "contexts": [
      "list",
      "job"
    ],
    "formats": [
      "PDF",
      "XLSX",
      "CSV"
    ],
    "rolloutPhase": 1,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Pending Shipments List Report Format-8",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "PENDING_SHIPMENTS_LIST_REPORT_FORMAT_9",
    "name": "Pending Shipments List Report Format-9",
    "family": "ops_list",
    "contexts": [
      "list",
      "job"
    ],
    "formats": [
      "PDF",
      "XLSX",
      "CSV"
    ],
    "rolloutPhase": 1,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Pending Shipments List Report Format-9",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "PENDING_SHIPMENTS_LIST_REPORT_FORMAT_10",
    "name": "Pending Shipments List Report Format-10",
    "family": "ops_list",
    "contexts": [
      "list",
      "job"
    ],
    "formats": [
      "PDF",
      "XLSX",
      "CSV"
    ],
    "rolloutPhase": 1,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Pending Shipments List Report Format-10",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "PENDING_SHIPMENTS_LIST_REPORT_FORMAT_11",
    "name": "Pending Shipments List Report Format-11",
    "family": "ops_list",
    "contexts": [
      "list",
      "job"
    ],
    "formats": [
      "PDF",
      "XLSX",
      "CSV"
    ],
    "rolloutPhase": 1,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Pending Shipments List Report Format-11",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "PENDING_SHIPMENTS_LIST_REPORT_FORMAT_12",
    "name": "Pending Shipments List Report Format-12",
    "family": "ops_list",
    "contexts": [
      "list",
      "job"
    ],
    "formats": [
      "PDF",
      "XLSX",
      "CSV"
    ],
    "rolloutPhase": 1,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Pending Shipments List Report Format-12",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "PENDING_SHIPMENTS_LIST_REPORT_FORMAT_13",
    "name": "Pending Shipments List Report Format-13",
    "family": "ops_list",
    "contexts": [
      "list",
      "job"
    ],
    "formats": [
      "PDF",
      "XLSX",
      "CSV"
    ],
    "rolloutPhase": 1,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Pending Shipments List Report Format-13",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "PENDING_SHIPMENTS_LIST_REPORT_FORMAT_14",
    "name": "Pending Shipments List Report Format-14",
    "family": "ops_list",
    "contexts": [
      "list",
      "job"
    ],
    "formats": [
      "PDF",
      "XLSX",
      "CSV"
    ],
    "rolloutPhase": 1,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Pending Shipments List Report Format-14",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "PENDING_SHIPMENTS_LIST_REPORT_FORMAT_15",
    "name": "Pending Shipments List Report Format-15",
    "family": "ops_list",
    "contexts": [
      "list",
      "job"
    ],
    "formats": [
      "PDF",
      "XLSX",
      "CSV"
    ],
    "rolloutPhase": 1,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Pending Shipments List Report Format-15",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "PENDING_SHIPMENTS_LIST_REPORT_FORMAT_16",
    "name": "Pending Shipments List Report Format-16",
    "family": "ops_list",
    "contexts": [
      "list",
      "job"
    ],
    "formats": [
      "PDF",
      "XLSX",
      "CSV"
    ],
    "rolloutPhase": 1,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Pending Shipments List Report Format-16",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "PENDING_SHIPMENTS_LIST_REPORT_FORMAT_17",
    "name": "Pending Shipments List Report Format-17",
    "family": "ops_list",
    "contexts": [
      "list",
      "job"
    ],
    "formats": [
      "PDF",
      "XLSX",
      "CSV"
    ],
    "rolloutPhase": 1,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Pending Shipments List Report Format-17",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "PENDING_SHIPMENTS_LIST_REPORT_FORMAT_18",
    "name": "Pending Shipments List Report Format-18",
    "family": "ops_list",
    "contexts": [
      "list",
      "job"
    ],
    "formats": [
      "PDF",
      "XLSX",
      "CSV"
    ],
    "rolloutPhase": 1,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Pending Shipments List Report Format-18",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "PENDING_SHIPMENTS_LIST_REPORT_FORMAT_19",
    "name": "Pending Shipments List Report Format-19",
    "family": "ops_list",
    "contexts": [
      "list",
      "job"
    ],
    "formats": [
      "PDF",
      "XLSX",
      "CSV"
    ],
    "rolloutPhase": 1,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Pending Shipments List Report Format-19",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "PENDING_SHIPMENTS_LIST_REPORT_FORMAT_20",
    "name": "Pending Shipments List Report Format-20",
    "family": "ops_list",
    "contexts": [
      "list",
      "job"
    ],
    "formats": [
      "PDF",
      "XLSX",
      "CSV"
    ],
    "rolloutPhase": 1,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Pending Shipments List Report Format-20",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "PENDING_SHIPMENTS_LIST_REPORT_FORMAT_21",
    "name": "Pending Shipments List Report Format-21",
    "family": "ops_list",
    "contexts": [
      "list",
      "job"
    ],
    "formats": [
      "PDF",
      "XLSX",
      "CSV"
    ],
    "rolloutPhase": 1,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Pending Shipments List Report Format-21",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "PENDING_SHIPMENTS_LIST_REPORT_FORMAT_22",
    "name": "Pending Shipments List Report Format-22",
    "family": "ops_list",
    "contexts": [
      "list",
      "job"
    ],
    "formats": [
      "PDF",
      "XLSX",
      "CSV"
    ],
    "rolloutPhase": 1,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Pending Shipments List Report Format-22",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "PENDING_SHIPMENTS_LIST_REPORT_FORMAT_23",
    "name": "Pending Shipments List Report Format-23",
    "family": "ops_list",
    "contexts": [
      "list",
      "job"
    ],
    "formats": [
      "PDF",
      "XLSX",
      "CSV"
    ],
    "rolloutPhase": 1,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Pending Shipments List Report Format-23",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "PENDING_SHIPMENTS_LIST_REPORT_FORMAT_24",
    "name": "Pending Shipments List Report Format-24",
    "family": "ops_list",
    "contexts": [
      "list",
      "job"
    ],
    "formats": [
      "PDF",
      "XLSX",
      "CSV"
    ],
    "rolloutPhase": 1,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Pending Shipments List Report Format-24",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "PENDING_SHIPMENTS_LIST_REPORT_FORMAT_25",
    "name": "Pending Shipments List Report Format-25",
    "family": "ops_list",
    "contexts": [
      "list",
      "job"
    ],
    "formats": [
      "PDF",
      "XLSX",
      "CSV"
    ],
    "rolloutPhase": 1,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Pending Shipments List Report Format-25",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "PICKUP_CONFIRMATION_REPORT_FORMAT",
    "name": "Pickup Confirmation Report Format",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Pickup Confirmation Report Format",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "PRE_ALERT_AIR_REPORT_FORMAT",
    "name": "Pre Alert Air Report Format",
    "family": "other",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: Pre Alert Air Report Format"
  },
  {
    "code": "PRE_ALERT_REPORT_FORMAT_1",
    "name": "Pre Alert Report Format-1",
    "family": "other",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Pre Alert Report Format-1",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "PRE_ALERT_REPORT_FORMAT_2",
    "name": "Pre Alert Report Format-2",
    "family": "other",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Pre Alert Report Format-2",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "PRE_ALERT_REPORT_FORMAT_3",
    "name": "Pre Alert Report Format-3",
    "family": "other",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Pre Alert Report Format-3",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "PRE_ALERT_REPORT_FORMAT_4",
    "name": "Pre Alert Report Format-4",
    "family": "other",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Pre Alert Report Format-4",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "PRE_ALERT_REPORT_FORMAT_5",
    "name": "Pre Alert Report Format-5",
    "family": "other",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Pre Alert Report Format-5",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "PRE_ALERT_REPORT_FORMAT_6",
    "name": "Pre Alert Report Format-6",
    "family": "other",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Pre Alert Report Format-6",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "PRE_ALERT_REPORT_FORMAT_7",
    "name": "Pre Alert Report Format-7",
    "family": "other",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Pre Alert Report Format-7",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "PRE_ALERT_REPORT_FORMAT_8",
    "name": "Pre Alert Report Format-8",
    "family": "other",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Pre Alert Report Format-8",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "PRE_ALERT_REPORT_FORMAT_9",
    "name": "Pre Alert Report Format-9",
    "family": "other",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Pre Alert Report Format-9",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "PRE_ALERT_REPORT_FORMAT_10",
    "name": "Pre Alert Report Format-10",
    "family": "other",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Pre Alert Report Format-10",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "PRE_ALERT_REPORT_FORMAT_11",
    "name": "Pre Alert Report Format-11",
    "family": "other",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Pre Alert Report Format-11",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "PRE_ALERT_REPORT_FORMAT_12",
    "name": "Pre Alert Report Format-12",
    "family": "other",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Pre Alert Report Format-12",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "PRE_ALERT_TO_CLIENT_REPORT_FORMAT",
    "name": "Pre Alert To Client Report Format",
    "family": "other",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: Pre Alert To Client Report Format"
  },
  {
    "code": "PREALERT_USA_JASPER_REPORT_FORMAT",
    "name": "Prealert USA Jasper Report Format",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Prealert USA Jasper Report Format",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "PREPAID_SHIPMENT_WITH_NO_PREPAID_CHARGES_LIST_REPORT_FORMAT",
    "name": "Prepaid Shipment With No Prepaid Charges List Report Format",
    "family": "ops_list",
    "contexts": [
      "list",
      "job"
    ],
    "formats": [
      "PDF",
      "XLSX",
      "CSV"
    ],
    "rolloutPhase": 1,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Prepaid Shipment With No Prepaid Charges List Report Format",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "PROFIT_AND_LOSS_REPORT_FORMAT_1_LANDSCAPE",
    "name": "Profit and Loss Report Format-1 Landscape",
    "family": "finance",
    "contexts": [
      "gl",
      "list"
    ],
    "formats": [
      "PDF",
      "XLSX"
    ],
    "rolloutPhase": 5,
    "gapStatus": "covered_analytics",
    "description": "FRESA sample: Profit and Loss Report Format-1 Landscape",
    "existingPath": "/gl/reports",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "PROFIT_AND_LOSS_REPORT_FORMAT_2_JASPER",
    "name": "Profit and Loss Report Format-2 Jasper",
    "family": "finance",
    "contexts": [
      "gl",
      "list"
    ],
    "formats": [
      "PDF",
      "XLSX"
    ],
    "rolloutPhase": 5,
    "gapStatus": "covered_analytics",
    "description": "FRESA sample: Profit and Loss Report Format-2 Jasper",
    "existingPath": "/gl/reports",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "PROFIT_AND_LOSS_REPORT_FORMAT_3_SUMMARY_PERIODWISE",
    "name": "Profit and Loss Report Format-3 Summary Periodwise",
    "family": "finance",
    "contexts": [
      "gl",
      "list"
    ],
    "formats": [
      "PDF",
      "XLSX"
    ],
    "rolloutPhase": 5,
    "gapStatus": "covered_analytics",
    "description": "FRESA sample: Profit and Loss Report Format-3 Summary Periodwise",
    "existingPath": "/gl/reports",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "PROFIT_AND_LOSS_REPORT_FORMAT_4",
    "name": "Profit and Loss Report Format-4",
    "family": "finance",
    "contexts": [
      "gl",
      "list"
    ],
    "formats": [
      "PDF",
      "XLSX"
    ],
    "rolloutPhase": 5,
    "gapStatus": "covered_analytics",
    "description": "FRESA sample: Profit and Loss Report Format-4",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ],
    "existingPath": "/gl/reports"
  },
  {
    "code": "PROFIT_AND_LOSS_REPORT_FORMAT_5",
    "name": "Profit and Loss Report Format-5",
    "family": "finance",
    "contexts": [
      "gl",
      "list"
    ],
    "formats": [
      "PDF",
      "XLSX"
    ],
    "rolloutPhase": 5,
    "gapStatus": "covered_analytics",
    "description": "FRESA sample: Profit and Loss Report Format-5",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ],
    "existingPath": "/gl/reports"
  },
  {
    "code": "PROFIT_AND_LOSS_REPORT_FORMAT_6",
    "name": "Profit and Loss Report Format-6",
    "family": "finance",
    "contexts": [
      "gl",
      "list"
    ],
    "formats": [
      "PDF",
      "XLSX"
    ],
    "rolloutPhase": 5,
    "gapStatus": "covered_analytics",
    "description": "FRESA sample: Profit and Loss Report Format-6",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ],
    "existingPath": "/gl/reports"
  },
  {
    "code": "PROFIT_AND_LOSS_REPORT_FORMAT_7",
    "name": "Profit and Loss Report Format-7",
    "family": "finance",
    "contexts": [
      "gl",
      "list"
    ],
    "formats": [
      "PDF",
      "XLSX"
    ],
    "rolloutPhase": 5,
    "gapStatus": "covered_analytics",
    "description": "FRESA sample: Profit and Loss Report Format-7",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ],
    "existingPath": "/gl/reports"
  },
  {
    "code": "PROFIT_AND_LOSS_REPORT_FORMAT_8",
    "name": "Profit and Loss Report Format-8",
    "family": "finance",
    "contexts": [
      "gl",
      "list"
    ],
    "formats": [
      "PDF",
      "XLSX"
    ],
    "rolloutPhase": 5,
    "gapStatus": "covered_analytics",
    "description": "FRESA sample: Profit and Loss Report Format-8",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ],
    "existingPath": "/gl/reports"
  },
  {
    "code": "PROFIT_AND_LOSS_REPORT_FORMAT_9",
    "name": "Profit and Loss Report Format-9",
    "family": "finance",
    "contexts": [
      "gl",
      "list"
    ],
    "formats": [
      "PDF",
      "XLSX"
    ],
    "rolloutPhase": 5,
    "gapStatus": "covered_analytics",
    "description": "FRESA sample: Profit and Loss Report Format-9",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ],
    "existingPath": "/gl/reports"
  },
  {
    "code": "PROFIT_AND_LOSS_REPORT_FORMAT_10",
    "name": "Profit and Loss Report Format-10",
    "family": "finance",
    "contexts": [
      "gl",
      "list"
    ],
    "formats": [
      "PDF",
      "XLSX"
    ],
    "rolloutPhase": 5,
    "gapStatus": "covered_analytics",
    "description": "FRESA sample: Profit and Loss Report Format-10",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ],
    "existingPath": "/gl/reports"
  },
  {
    "code": "PROFIT_AND_LOSS_REPORT_FORMAT_11",
    "name": "Profit and Loss Report Format-11",
    "family": "finance",
    "contexts": [
      "gl",
      "list"
    ],
    "formats": [
      "PDF",
      "XLSX"
    ],
    "rolloutPhase": 5,
    "gapStatus": "covered_analytics",
    "description": "FRESA sample: Profit and Loss Report Format-11",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ],
    "existingPath": "/gl/reports"
  },
  {
    "code": "PROFIT_AND_LOSS_REPORT_FORMAT_12",
    "name": "Profit and Loss Report Format-12",
    "family": "finance",
    "contexts": [
      "gl",
      "list"
    ],
    "formats": [
      "PDF",
      "XLSX"
    ],
    "rolloutPhase": 5,
    "gapStatus": "covered_analytics",
    "description": "FRESA sample: Profit and Loss Report Format-12",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ],
    "existingPath": "/gl/reports"
  },
  {
    "code": "PROFIT_AND_LOSS_REPORT_FORMAT_13",
    "name": "Profit and Loss Report Format-13",
    "family": "finance",
    "contexts": [
      "gl",
      "list"
    ],
    "formats": [
      "PDF",
      "XLSX"
    ],
    "rolloutPhase": 5,
    "gapStatus": "covered_analytics",
    "description": "FRESA sample: Profit and Loss Report Format-13",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ],
    "existingPath": "/gl/reports"
  },
  {
    "code": "PROFIT_AND_LOSS_REPORT_FORMAT_14",
    "name": "Profit and Loss Report Format-14",
    "family": "finance",
    "contexts": [
      "gl",
      "list"
    ],
    "formats": [
      "PDF",
      "XLSX"
    ],
    "rolloutPhase": 5,
    "gapStatus": "covered_analytics",
    "description": "FRESA sample: Profit and Loss Report Format-14",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ],
    "existingPath": "/gl/reports"
  },
  {
    "code": "PROFIT_AND_LOSS_REPORT_FORMAT_15",
    "name": "Profit and Loss Report Format-15",
    "family": "finance",
    "contexts": [
      "gl",
      "list"
    ],
    "formats": [
      "PDF",
      "XLSX"
    ],
    "rolloutPhase": 5,
    "gapStatus": "covered_analytics",
    "description": "FRESA sample: Profit and Loss Report Format-15",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ],
    "existingPath": "/gl/reports"
  },
  {
    "code": "PROFORMA_INVOICE_ALL_CHARGES_REPORT_FORMAT",
    "name": "Proforma Invoice All Charges Report Format",
    "family": "commercial",
    "contexts": [
      "invoice"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 4,
    "gapStatus": "partial_document_pdf",
    "description": "Proforma Invoice All Charges Report Format — additional format; does not replace default invoice PDF",
    "defaultParams": [
      {
        "name": "invoice_id",
        "label": "Invoice",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "PROFORMA_INVOICE_REPORT_FORMAT_1_PROFORMA_INVOICE_ALL_CHARGES",
    "name": "Proforma Invoice Report Format-1 Proforma Invoice All Charges",
    "family": "commercial",
    "contexts": [
      "invoice"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 4,
    "gapStatus": "partial_document_pdf",
    "description": "Proforma Invoice Report Format-1 Proforma Invoice All Charges — additional format; does not replace default invoice PDF",
    "defaultParams": [
      {
        "name": "invoice_id",
        "label": "Invoice",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "PROFORMA_INVOICE_REPORT_FORMAT_2_PROFORMA_INVOICE_ALL_CHARGES",
    "name": "Proforma Invoice Report Format-2 Proforma Invoice All Charges",
    "family": "commercial",
    "contexts": [
      "invoice"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 4,
    "gapStatus": "partial_document_pdf",
    "description": "Proforma Invoice Report Format-2 Proforma Invoice All Charges — additional format; does not replace default invoice PDF",
    "defaultParams": [
      {
        "name": "invoice_id",
        "label": "Invoice",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "PROFORMA_INVOICE_REPORT_FORMAT_3",
    "name": "Proforma Invoice Report Format-3",
    "family": "commercial",
    "contexts": [
      "invoice"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 4,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Proforma Invoice Report Format-3",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "PROFORMA_INVOICE_REPORT_FORMAT_4",
    "name": "Proforma Invoice Report Format-4",
    "family": "commercial",
    "contexts": [
      "invoice"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 4,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Proforma Invoice Report Format-4",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "PROFORMA_INVOICE_REPORT_FORMAT_5",
    "name": "Proforma Invoice Report Format-5",
    "family": "commercial",
    "contexts": [
      "invoice"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 4,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Proforma Invoice Report Format-5",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "PROFORMA_INVOICE_REPORT_FORMAT_6",
    "name": "Proforma Invoice Report Format-6",
    "family": "commercial",
    "contexts": [
      "invoice"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 4,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Proforma Invoice Report Format-6",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "PROFORMA_INVOICE_REPORT_FORMAT_7",
    "name": "Proforma Invoice Report Format-7",
    "family": "commercial",
    "contexts": [
      "invoice"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 4,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Proforma Invoice Report Format-7",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "PROFORMA_INVOICE_REPORT_FORMAT_8",
    "name": "Proforma Invoice Report Format-8",
    "family": "commercial",
    "contexts": [
      "invoice"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 4,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Proforma Invoice Report Format-8",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "PROFORMA_INVOICE_REPORT_FORMAT_9",
    "name": "Proforma Invoice Report Format-9",
    "family": "commercial",
    "contexts": [
      "invoice"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 4,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Proforma Invoice Report Format-9",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "PROFORMA_INVOICE_REPORT_FORMAT_10",
    "name": "Proforma Invoice Report Format-10",
    "family": "commercial",
    "contexts": [
      "invoice"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 4,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Proforma Invoice Report Format-10",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "PROFORMA_INVOICE_REPORT_FORMAT_11",
    "name": "Proforma Invoice Report Format-11",
    "family": "commercial",
    "contexts": [
      "invoice"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 4,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Proforma Invoice Report Format-11",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "PROFORMA_INVOICE_REPORT_FORMAT_12",
    "name": "Proforma Invoice Report Format-12",
    "family": "commercial",
    "contexts": [
      "invoice"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 4,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Proforma Invoice Report Format-12",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "PROFORMA_INVOICE_REPORT_FORMAT_13",
    "name": "Proforma Invoice Report Format-13",
    "family": "commercial",
    "contexts": [
      "invoice"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 4,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Proforma Invoice Report Format-13",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "PROFORMA_INVOICE_REPORT_FORMAT_14",
    "name": "Proforma Invoice Report Format-14",
    "family": "commercial",
    "contexts": [
      "invoice"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 4,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Proforma Invoice Report Format-14",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "PROFORMA_INVOICE_REPORT_FORMAT_15",
    "name": "Proforma Invoice Report Format-15",
    "family": "commercial",
    "contexts": [
      "invoice"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 4,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Proforma Invoice Report Format-15",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "PROFORMA_INVOICE_REPORT_FORMAT_16",
    "name": "Proforma Invoice Report Format-16",
    "family": "commercial",
    "contexts": [
      "invoice"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 4,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Proforma Invoice Report Format-16",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "PROFORMA_INVOICE_REPORT_FORMAT_17",
    "name": "Proforma Invoice Report Format-17",
    "family": "commercial",
    "contexts": [
      "invoice"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 4,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Proforma Invoice Report Format-17",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "PROOF_OF_DELIVERY_REPORT_FORMAT",
    "name": "Proof Of Delivery Report Format",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: Proof Of Delivery Report Format"
  },
  {
    "code": "PROOF_OF_DELIVERY_RPM_SAMPLE",
    "name": "Proof Of Delivery (RPM Sample)",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: Proof Of Delivery (RPM Sample)"
  },
  {
    "code": "PURCHASE_INVOICE_REPORT_FORMAT_1",
    "name": "Purchase Invoice Report Format-1",
    "family": "commercial",
    "contexts": [
      "invoice"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 4,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: Purchase Invoice Report Format-1"
  },
  {
    "code": "PURCHASE_INVOICE_REPORT_FORMAT_2",
    "name": "Purchase Invoice Report Format-2",
    "family": "commercial",
    "contexts": [
      "invoice"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 4,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: Purchase Invoice Report Format-2"
  },
  {
    "code": "QUOTATION_REPORT_FORMAT_1",
    "name": "Quotation Report Format-1",
    "family": "quotation",
    "contexts": [
      "quotation"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 3,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Quotation Report Format-1",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "QUOTATION_REPORT_FORMAT_2",
    "name": "Quotation Report Format-2",
    "family": "quotation",
    "contexts": [
      "quotation"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 3,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Quotation Report Format-2",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "QUOTATION_REPORT_FORMAT_3",
    "name": "Quotation Report Format-3",
    "family": "quotation",
    "contexts": [
      "quotation"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 3,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Quotation Report Format-3",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "QUOTATION_REPORT_FORMAT_4",
    "name": "Quotation Report Format-4",
    "family": "quotation",
    "contexts": [
      "quotation"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 3,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Quotation Report Format-4",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "QUOTATION_REPORT_FORMAT_5",
    "name": "Quotation Report Format-5",
    "family": "quotation",
    "contexts": [
      "quotation"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 3,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Quotation Report Format-5",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "QUOTATION_REPORT_FORMAT_6",
    "name": "Quotation Report Format-6",
    "family": "quotation",
    "contexts": [
      "quotation"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 3,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Quotation Report Format-6",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "QUOTATION_REPORT_FORMAT_7",
    "name": "Quotation Report Format-7",
    "family": "quotation",
    "contexts": [
      "quotation"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 3,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Quotation Report Format-7",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "QUOTATION_REPORT_FORMAT_8",
    "name": "Quotation Report Format-8",
    "family": "quotation",
    "contexts": [
      "quotation"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 3,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Quotation Report Format-8",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "QUOTATION_REPORT_FORMAT_9",
    "name": "Quotation Report Format-9",
    "family": "quotation",
    "contexts": [
      "quotation"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 3,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Quotation Report Format-9",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "QUOTATION_REPORT_FORMAT_10",
    "name": "Quotation Report Format-10",
    "family": "quotation",
    "contexts": [
      "quotation"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 3,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Quotation Report Format-10",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "QUOTATION_REPORT_FORMAT_11",
    "name": "Quotation Report Format-11",
    "family": "quotation",
    "contexts": [
      "quotation"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 3,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Quotation Report Format-11",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "QUOTATION_REPORT_FORMAT_12",
    "name": "Quotation Report Format-12",
    "family": "quotation",
    "contexts": [
      "quotation"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 3,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Quotation Report Format-12",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "QUOTATION_REPORT_FORMAT_13",
    "name": "Quotation Report Format-13",
    "family": "quotation",
    "contexts": [
      "quotation"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 3,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Quotation Report Format-13",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "QUOTATION_REPORT_FORMAT_14",
    "name": "Quotation Report Format-14",
    "family": "quotation",
    "contexts": [
      "quotation"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 3,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Quotation Report Format-14",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "QUOTATION_REPORT_FORMAT_15",
    "name": "Quotation Report Format-15",
    "family": "quotation",
    "contexts": [
      "quotation"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 3,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Quotation Report Format-15",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "RECEIPT_VOUCHER_REPORT_FORMAT_1",
    "name": "Receipt Voucher Report Format-1",
    "family": "finance",
    "contexts": [
      "gl",
      "list"
    ],
    "formats": [
      "PDF",
      "XLSX"
    ],
    "rolloutPhase": 5,
    "gapStatus": "partial_document_pdf",
    "description": "Receipt Voucher Report Format-1 — Accounts format from Fresa sample-report-formats",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "RECEIPT_VOUCHER_REPORT_FORMAT_2",
    "name": "Receipt Voucher Report Format-2",
    "family": "finance",
    "contexts": [
      "gl",
      "list"
    ],
    "formats": [
      "PDF",
      "XLSX"
    ],
    "rolloutPhase": 5,
    "gapStatus": "partial_document_pdf",
    "description": "Receipt Voucher Report Format-2 — Accounts format from Fresa sample-report-formats",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "RIDER_SHEET_FOR_EXPORT_MANIFEST_REPORT_FORMAT",
    "name": "Rider Sheet For Export Manifest Report Format",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Rider Sheet For Export Manifest Report Format",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "SAILING_CONFIRMATION_REPORT_FORMAT",
    "name": "Sailing Confirmation Report Format",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Sailing Confirmation Report Format",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "SALESPERSON_NOMINATION_REPORT_LIST_REPORT_FORMAT",
    "name": "Salesperson Nomination Report List Report Format",
    "family": "ops_list",
    "contexts": [
      "list",
      "job"
    ],
    "formats": [
      "PDF",
      "XLSX",
      "CSV"
    ],
    "rolloutPhase": 1,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Salesperson Nomination Report List Report Format",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "SEA_ARRIVAL_NOTICE_LCL_VIETNAM",
    "name": "SEA Arrival Notice LCL Vietnam",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: SEA Arrival Notice LCL Vietnam"
  },
  {
    "code": "SHIPMENT_FREIGHT_MANIFEST_REPORT_FORMAT",
    "name": "Shipment Freight Manifest Report Format",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Shipment Freight Manifest Report Format",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "SHIPMENT_IS_NOT_LINKED_WITH_JOB_LIST_REPORT_FORMAT",
    "name": "Shipment Is Not Linked With Job List Report Format",
    "family": "ops_list",
    "contexts": [
      "list",
      "job"
    ],
    "formats": [
      "PDF",
      "XLSX",
      "CSV"
    ],
    "rolloutPhase": 1,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Shipment Is Not Linked With Job List Report Format",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "SHIPMENT_PROFIT_AND_LOSS_REPORT_FORMAT",
    "name": "Shipment Profit And Loss Report Format",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Shipment Profit And Loss Report Format",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "SHIPMENT_STATUS_CONFIRMATION_REPORT_FORMAT",
    "name": "Shipment Status Confirmation Report Format",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Shipment Status Confirmation Report Format",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "SHIPMENT_STATUS_REPORT_LIST_REPORT_FORMAT",
    "name": "Shipment Status Report List Report Format",
    "family": "ops_list",
    "contexts": [
      "list",
      "job"
    ],
    "formats": [
      "PDF",
      "XLSX",
      "CSV"
    ],
    "rolloutPhase": 1,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Shipment Status Report List Report Format",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "SHIPMENT_WITH_NO_JOB_CS_LIST_REPORT_FORMAT",
    "name": "Shipment With No Job CS List Report Format",
    "family": "ops_list",
    "contexts": [
      "list",
      "job"
    ],
    "formats": [
      "PDF",
      "XLSX",
      "CSV"
    ],
    "rolloutPhase": 1,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Shipment With No Job CS List Report Format",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "SHIPMENTS_LIST_IMCO_LIST_REPORT_FORMAT",
    "name": "Shipments List IMCO List Report Format",
    "family": "ops_list",
    "contexts": [
      "list",
      "job"
    ],
    "formats": [
      "PDF",
      "XLSX",
      "CSV"
    ],
    "rolloutPhase": 1,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Shipments List IMCO List Report Format",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "SHIPMENTS_WITH_NO_COST_CHARGES_LIST_REPORT_FORMAT",
    "name": "Shipments With No cost Charges List Report Format",
    "family": "ops_list",
    "contexts": [
      "list",
      "job"
    ],
    "formats": [
      "PDF",
      "XLSX",
      "CSV"
    ],
    "rolloutPhase": 1,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Shipments With No cost Charges List Report Format",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "SHIPMENTS_WITH_NO_HBL_NUMBER_ENTERED_LIST_REPORT_FORMAT",
    "name": "Shipments With No HBL Number Entered List Report Format",
    "family": "ops_list",
    "contexts": [
      "list",
      "job"
    ],
    "formats": [
      "PDF",
      "XLSX",
      "CSV"
    ],
    "rolloutPhase": 1,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Shipments With No HBL Number Entered List Report Format",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "SHIPMENTS_WITH_NO_INVOICES_LIST",
    "name": "Shipments With No Invoices List",
    "family": "ops_list",
    "contexts": [
      "list",
      "job"
    ],
    "formats": [
      "PDF",
      "XLSX",
      "CSV"
    ],
    "rolloutPhase": 1,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Shipments With No Invoices List",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "SHIPMENTS_WITH_NO_INVOICES_LIST_REPORT_FORMAT",
    "name": "Shipments With No Invoices list Report Format",
    "family": "ops_list",
    "contexts": [
      "list",
      "job"
    ],
    "formats": [
      "PDF",
      "XLSX",
      "CSV"
    ],
    "rolloutPhase": 1,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Shipments With No Invoices list Report Format",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "SHIPMENTS_WITH_NO_JOB_NUMBER_MAPPED_LIST_REPORT_FORMAT",
    "name": "Shipments With No Job Number Mapped List Report Format",
    "family": "ops_list",
    "contexts": [
      "list",
      "job"
    ],
    "formats": [
      "PDF",
      "XLSX",
      "CSV"
    ],
    "rolloutPhase": 1,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Shipments With No Job Number Mapped List Report Format",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "SHIPMENTS_WITH_NO_PURCHASE_INVOICES_LIST",
    "name": "Shipments With No Purchase Invoices List",
    "family": "ops_list",
    "contexts": [
      "list",
      "job"
    ],
    "formats": [
      "PDF",
      "XLSX",
      "CSV"
    ],
    "rolloutPhase": 1,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Shipments With No Purchase Invoices List",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "SHIPMENTS_WITH_NO_PURCHASE_INVOICES_LIST_REPORT_FORMAT",
    "name": "Shipments With No Purchase Invoices List Report Format",
    "family": "ops_list",
    "contexts": [
      "list",
      "job"
    ],
    "formats": [
      "PDF",
      "XLSX",
      "CSV"
    ],
    "rolloutPhase": 1,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Shipments With No Purchase Invoices List Report Format",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "SHIPMENTS_WITH_NO_SALESPERSON_ENTERED_LIST_REPORT_FORMAT",
    "name": "Shipments With No Salesperson Entered List Report Format",
    "family": "ops_list",
    "contexts": [
      "list",
      "job"
    ],
    "formats": [
      "PDF",
      "XLSX",
      "CSV"
    ],
    "rolloutPhase": 1,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Shipments With No Salesperson Entered List Report Format",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "SHIPPING_INSTRUCTION_REPORT_FORMAT",
    "name": "Shipping Instruction Report Format",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Shipping Instruction Report Format",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "STATEMENT_OF_ACCOUNTS_REPORT_FORMAT",
    "name": "Statement Of Accounts Report Format",
    "family": "finance",
    "contexts": [
      "gl",
      "list"
    ],
    "formats": [
      "PDF",
      "XLSX"
    ],
    "rolloutPhase": 5,
    "gapStatus": "covered_analytics",
    "description": "FRESA sample: Statement Of Accounts Report Format",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ],
    "existingPath": "/gl/ar/open-items"
  },
  {
    "code": "STATEMENT_OF_ACCOUNTS_REPORT_FORMAT_2",
    "name": "Statement Of Accounts Report Format-2",
    "family": "finance",
    "contexts": [
      "gl",
      "party"
    ],
    "formats": [
      "PDF",
      "XLSX"
    ],
    "rolloutPhase": 5,
    "gapStatus": "covered_analytics",
    "description": "FRESA sample: Statement Of Accounts Report Format-2",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ],
    "existingPath": "/gl/ar/open-items"
  },
  {
    "code": "STATEMENT_OF_ACCOUNTS_REPORT_FORMAT_3",
    "name": "Statement Of Accounts Report Format-3",
    "family": "finance",
    "contexts": [
      "gl",
      "party"
    ],
    "formats": [
      "PDF",
      "XLSX"
    ],
    "rolloutPhase": 5,
    "gapStatus": "covered_analytics",
    "description": "FRESA sample: Statement Of Accounts Report Format-3",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ],
    "existingPath": "/gl/ar/open-items"
  },
  {
    "code": "STATEMENT_OF_ACCOUNTS_REPORT_FORMAT_4",
    "name": "Statement Of Accounts Report Format-4",
    "family": "finance",
    "contexts": [
      "gl",
      "party"
    ],
    "formats": [
      "PDF",
      "XLSX"
    ],
    "rolloutPhase": 5,
    "gapStatus": "covered_analytics",
    "description": "FRESA sample: Statement Of Accounts Report Format-4",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ],
    "existingPath": "/gl/ar/open-items"
  },
  {
    "code": "STATEMENT_OF_ACCOUNTS_REPORT_FORMAT_5",
    "name": "Statement Of Accounts Report Format-5",
    "family": "finance",
    "contexts": [
      "gl",
      "party"
    ],
    "formats": [
      "PDF",
      "XLSX"
    ],
    "rolloutPhase": 5,
    "gapStatus": "covered_analytics",
    "description": "FRESA sample: Statement Of Accounts Report Format-5",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ],
    "existingPath": "/gl/ar/open-items"
  },
  {
    "code": "STATEMENT_OF_ACCOUNTS_REPORT_FORMAT_6",
    "name": "Statement Of Accounts Report Format-6",
    "family": "finance",
    "contexts": [
      "gl",
      "party"
    ],
    "formats": [
      "PDF",
      "XLSX"
    ],
    "rolloutPhase": 5,
    "gapStatus": "covered_analytics",
    "description": "FRESA sample: Statement Of Accounts Report Format-6",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ],
    "existingPath": "/gl/ar/open-items"
  },
  {
    "code": "STATEMENT_OF_ACCOUNTS_REPORT_FORMAT_7",
    "name": "Statement Of Accounts Report Format-7",
    "family": "finance",
    "contexts": [
      "gl",
      "party"
    ],
    "formats": [
      "PDF",
      "XLSX"
    ],
    "rolloutPhase": 5,
    "gapStatus": "covered_analytics",
    "description": "FRESA sample: Statement Of Accounts Report Format-7",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ],
    "existingPath": "/gl/ar/open-items"
  },
  {
    "code": "STATEMENT_OF_ACCOUNTS_REPORT_FORMAT_8",
    "name": "Statement Of Accounts Report Format-8",
    "family": "finance",
    "contexts": [
      "gl",
      "party"
    ],
    "formats": [
      "PDF",
      "XLSX"
    ],
    "rolloutPhase": 5,
    "gapStatus": "covered_analytics",
    "description": "FRESA sample: Statement Of Accounts Report Format-8",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ],
    "existingPath": "/gl/ar/open-items"
  },
  {
    "code": "STATEMENT_OF_ACCOUNTS_REPORT_FORMAT_9",
    "name": "Statement Of Accounts Report Format-9",
    "family": "finance",
    "contexts": [
      "gl",
      "party"
    ],
    "formats": [
      "PDF",
      "XLSX"
    ],
    "rolloutPhase": 5,
    "gapStatus": "covered_analytics",
    "description": "FRESA sample: Statement Of Accounts Report Format-9",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ],
    "existingPath": "/gl/ar/open-items"
  },
  {
    "code": "STUFFING_REPORT_FORMAT",
    "name": "Stuffing Report Format",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Stuffing Report Format",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "STUFFING_REPORT_JASPER_REPORT_FORMAT",
    "name": "Stuffing Report Jasper Report Format",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Stuffing Report Jasper Report Format",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "SURRENDERED_LETTER_REPORT_FORMAT",
    "name": "Surrendered Letter Report Format",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Surrendered Letter Report Format",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "TERMINAL_DEPARTURE_REPORT_TDR_REPORT_FORMAT",
    "name": "Terminal Departure Report (TDR) Report Format",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Terminal Departure Report (TDR) Report Format",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "TRANSSHIPMENT_LIST_REPORT_FORMAT",
    "name": "Transshipment List Report Format",
    "family": "ops_list",
    "contexts": [
      "list",
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 1,
    "gapStatus": "partial_document_pdf",
    "description": "KingFisher layout PDF: Transshipment List Report Format"
  },
  {
    "code": "TRIAL_BALANCE_REPORT_FORMAT_1_TRIAL_BALANCE_SUMMARY",
    "name": "Trial Balance Report Format-1 Trial Balance Summary",
    "family": "finance",
    "contexts": [
      "gl",
      "list"
    ],
    "formats": [
      "PDF",
      "XLSX"
    ],
    "rolloutPhase": 5,
    "gapStatus": "covered_analytics",
    "description": "FRESA sample: Trial Balance Report Format-1 Trial Balance Summary",
    "existingPath": "/gl/accounts/trial-balance",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "TRIAL_BALANCE_REPORT_FORMAT_2_TRIAL_BALANCE_SUMMARY",
    "name": "Trial Balance Report Format-2 Trial Balance Summary",
    "family": "finance",
    "contexts": [
      "gl",
      "list"
    ],
    "formats": [
      "PDF",
      "XLSX"
    ],
    "rolloutPhase": 5,
    "gapStatus": "covered_analytics",
    "description": "FRESA sample: Trial Balance Report Format-2 Trial Balance Summary",
    "existingPath": "/gl/accounts/trial-balance",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "TRIAL_BALANCE_REPORT_FORMAT_3_TRIAL_BALANCE_SUMMARY_BRANCHWISE",
    "name": "Trial Balance Report Format-3 Trial Balance Summary BranchWise",
    "family": "finance",
    "contexts": [
      "gl",
      "list"
    ],
    "formats": [
      "PDF",
      "XLSX"
    ],
    "rolloutPhase": 5,
    "gapStatus": "covered_analytics",
    "description": "FRESA sample: Trial Balance Report Format-3 Trial Balance Summary BranchWise",
    "existingPath": "/gl/accounts/trial-balance",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "TRIAL_BALANCE_REPORT_FORMAT_4_TRIAL_BALANCE_SUMMARY_EXTENDED",
    "name": "Trial Balance Report Format-4 Trial Balance Summary Extended",
    "family": "finance",
    "contexts": [
      "gl",
      "list"
    ],
    "formats": [
      "PDF",
      "XLSX"
    ],
    "rolloutPhase": 5,
    "gapStatus": "covered_analytics",
    "description": "FRESA sample: Trial Balance Report Format-4 Trial Balance Summary Extended",
    "existingPath": "/gl/accounts/trial-balance",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "TRIAL_BALANCE_REPORT_FORMAT_5_TRIAL_BALANCE_SUMMARY_EXTENDED",
    "name": "Trial Balance Report Format-5 Trial Balance Summary Extended",
    "family": "finance",
    "contexts": [
      "gl",
      "list"
    ],
    "formats": [
      "PDF",
      "XLSX"
    ],
    "rolloutPhase": 5,
    "gapStatus": "covered_analytics",
    "description": "FRESA sample: Trial Balance Report Format-5 Trial Balance Summary Extended",
    "existingPath": "/gl/accounts/trial-balance",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "TRIAL_BALANCE_REPORT_FORMAT_6_TRIAL_BALANCE_SUMMARY_EXTENDED_BRANCHWISE",
    "name": "Trial Balance Report Format-6 Trial Balance Summary Extended BranchWise",
    "family": "finance",
    "contexts": [
      "gl",
      "list"
    ],
    "formats": [
      "PDF",
      "XLSX"
    ],
    "rolloutPhase": 5,
    "gapStatus": "covered_analytics",
    "description": "FRESA sample: Trial Balance Report Format-6 Trial Balance Summary Extended BranchWise",
    "existingPath": "/gl/accounts/trial-balance",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "TRIAL_BALANCE_REPORT_FORMAT_7",
    "name": "Trial Balance Report Format-7",
    "family": "finance",
    "contexts": [
      "gl",
      "list"
    ],
    "formats": [
      "PDF",
      "XLSX"
    ],
    "rolloutPhase": 5,
    "gapStatus": "covered_analytics",
    "description": "FRESA sample: Trial Balance Report Format-7",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ],
    "existingPath": "/gl/accounts/trial-balance"
  },
  {
    "code": "TRIAL_BALANCE_REPORT_FORMAT_8",
    "name": "Trial Balance Report Format-8",
    "family": "finance",
    "contexts": [
      "gl",
      "list"
    ],
    "formats": [
      "PDF",
      "XLSX"
    ],
    "rolloutPhase": 5,
    "gapStatus": "covered_analytics",
    "description": "FRESA sample: Trial Balance Report Format-8",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ],
    "existingPath": "/gl/accounts/trial-balance"
  },
  {
    "code": "TRIAL_BALANCE_REPORT_FORMAT_9",
    "name": "Trial Balance Report Format-9",
    "family": "finance",
    "contexts": [
      "gl",
      "list"
    ],
    "formats": [
      "PDF",
      "XLSX"
    ],
    "rolloutPhase": 5,
    "gapStatus": "covered_analytics",
    "description": "FRESA sample: Trial Balance Report Format-9",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ],
    "existingPath": "/gl/accounts/trial-balance"
  },
  {
    "code": "TRIAL_BALANCE_REPORT_FORMAT_10",
    "name": "Trial Balance Report Format-10",
    "family": "finance",
    "contexts": [
      "gl",
      "list"
    ],
    "formats": [
      "PDF",
      "XLSX"
    ],
    "rolloutPhase": 5,
    "gapStatus": "covered_analytics",
    "description": "FRESA sample: Trial Balance Report Format-10",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ],
    "existingPath": "/gl/accounts/trial-balance"
  },
  {
    "code": "TRIAL_BALANCE_REPORT_FORMAT_11",
    "name": "Trial Balance Report Format-11",
    "family": "finance",
    "contexts": [
      "gl",
      "list"
    ],
    "formats": [
      "PDF",
      "XLSX"
    ],
    "rolloutPhase": 5,
    "gapStatus": "covered_analytics",
    "description": "FRESA sample: Trial Balance Report Format-11",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ],
    "existingPath": "/gl/accounts/trial-balance"
  },
  {
    "code": "TRIAL_BALANCE_REPORT_FORMAT_12",
    "name": "Trial Balance Report Format-12",
    "family": "finance",
    "contexts": [
      "gl",
      "list"
    ],
    "formats": [
      "PDF",
      "XLSX"
    ],
    "rolloutPhase": 5,
    "gapStatus": "covered_analytics",
    "description": "FRESA sample: Trial Balance Report Format-12",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ],
    "existingPath": "/gl/accounts/trial-balance"
  },
  {
    "code": "TRIAL_BALANCE_REPORT_FORMAT_13",
    "name": "Trial Balance Report Format-13",
    "family": "finance",
    "contexts": [
      "gl",
      "list"
    ],
    "formats": [
      "PDF",
      "XLSX"
    ],
    "rolloutPhase": 5,
    "gapStatus": "covered_analytics",
    "description": "FRESA sample: Trial Balance Report Format-13",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ],
    "existingPath": "/gl/accounts/trial-balance"
  },
  {
    "code": "TRIAL_BALANCE_REPORT_FORMAT_14",
    "name": "Trial Balance Report Format-14",
    "family": "finance",
    "contexts": [
      "gl",
      "list"
    ],
    "formats": [
      "PDF",
      "XLSX"
    ],
    "rolloutPhase": 5,
    "gapStatus": "covered_analytics",
    "description": "FRESA sample: Trial Balance Report Format-14",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ],
    "existingPath": "/gl/accounts/trial-balance"
  },
  {
    "code": "TRIAL_BALANCE_REPORT_FORMAT_15",
    "name": "Trial Balance Report Format-15",
    "family": "finance",
    "contexts": [
      "gl",
      "list"
    ],
    "formats": [
      "PDF",
      "XLSX"
    ],
    "rolloutPhase": 5,
    "gapStatus": "covered_analytics",
    "description": "FRESA sample: Trial Balance Report Format-15",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ],
    "existingPath": "/gl/accounts/trial-balance"
  },
  {
    "code": "TRIAL_BALANCE_REPORT_FORMAT_16",
    "name": "Trial Balance Report Format-16",
    "family": "finance",
    "contexts": [
      "gl",
      "list"
    ],
    "formats": [
      "PDF",
      "XLSX"
    ],
    "rolloutPhase": 5,
    "gapStatus": "covered_analytics",
    "description": "FRESA sample: Trial Balance Report Format-16",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ],
    "existingPath": "/gl/accounts/trial-balance"
  },
  {
    "code": "TRUCK_CARGO_PICKUP_REQUEST_REPORT_FORMAT",
    "name": "Truck Cargo Pickup Request Report Format",
    "family": "sea_docs",
    "contexts": [
      "job"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 2,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Truck Cargo Pickup Request Report Format",
    "defaultParams": [
      {
        "name": "job_id",
        "label": "Job",
        "type": "uuid",
        "required": true
      }
    ]
  },
  {
    "code": "UNCOLLECTED_CARGO_FOR_AGENT_ROUTED_LIST_REPORT_FORMAT",
    "name": "Uncollected Cargo For Agent Routed List Report Format",
    "family": "ops_list",
    "contexts": [
      "list",
      "job"
    ],
    "formats": [
      "PDF",
      "XLSX",
      "CSV"
    ],
    "rolloutPhase": 1,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: Uncollected Cargo For Agent Routed List Report Format",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "WMS_GDO_REPORT_FORMAT_1",
    "name": "WMS GDO Report Format-1",
    "family": "wms",
    "contexts": [
      "wms"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 6,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: WMS GDO Report Format-1",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "WMS_GDO_REPORT_FORMAT_2",
    "name": "WMS GDO Report Format-2",
    "family": "wms",
    "contexts": [
      "wms"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 6,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: WMS GDO Report Format-2",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "WMS_GDO_REPORT_FORMAT_3",
    "name": "WMS GDO Report Format-3",
    "family": "wms",
    "contexts": [
      "wms"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 6,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: WMS GDO Report Format-3",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "WMS_GDO_REPORT_FORMAT_4",
    "name": "WMS GDO Report Format-4",
    "family": "wms",
    "contexts": [
      "wms"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 6,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: WMS GDO Report Format-4",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "WMS_GDO_REPORT_FORMAT_5",
    "name": "WMS GDO Report Format-5",
    "family": "wms",
    "contexts": [
      "wms"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 6,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: WMS GDO Report Format-5",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "WMS_GDO_REPORT_FORMAT_6",
    "name": "WMS GDO Report Format-6",
    "family": "wms",
    "contexts": [
      "wms"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 6,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: WMS GDO Report Format-6",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "WMS_GDO_REPORT_FORMAT_7",
    "name": "WMS GDO Report Format-7",
    "family": "wms",
    "contexts": [
      "wms"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 6,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: WMS GDO Report Format-7",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "WMS_GDO_REPORT_FORMAT_8",
    "name": "WMS GDO Report Format-8",
    "family": "wms",
    "contexts": [
      "wms"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 6,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: WMS GDO Report Format-8",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "WMS_GDO_REPORT_FORMAT_9",
    "name": "WMS GDO Report Format-9",
    "family": "wms",
    "contexts": [
      "wms"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 6,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: WMS GDO Report Format-9",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "WMS_GDO_REPORT_FORMAT_10",
    "name": "WMS GDO Report Format-10",
    "family": "wms",
    "contexts": [
      "wms"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 6,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: WMS GDO Report Format-10",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "WMS_GRN_REPORT_FORMAT_1",
    "name": "WMS GRN Report Format-1",
    "family": "wms",
    "contexts": [
      "wms"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 6,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: WMS GRN Report Format-1",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "WMS_GRN_REPORT_FORMAT_2",
    "name": "WMS GRN Report Format-2",
    "family": "wms",
    "contexts": [
      "wms"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 6,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: WMS GRN Report Format-2",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "WMS_GRN_REPORT_FORMAT_3",
    "name": "WMS GRN Report Format-3",
    "family": "wms",
    "contexts": [
      "wms"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 6,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: WMS GRN Report Format-3",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "WMS_GRN_REPORT_FORMAT_4",
    "name": "WMS GRN Report Format-4",
    "family": "wms",
    "contexts": [
      "wms"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 6,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: WMS GRN Report Format-4",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "WMS_GRN_REPORT_FORMAT_5",
    "name": "WMS GRN Report Format-5",
    "family": "wms",
    "contexts": [
      "wms"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 6,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: WMS GRN Report Format-5",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "WMS_GRN_REPORT_FORMAT_6",
    "name": "WMS GRN Report Format-6",
    "family": "wms",
    "contexts": [
      "wms"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 6,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: WMS GRN Report Format-6",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "WMS_GRN_REPORT_FORMAT_7",
    "name": "WMS GRN Report Format-7",
    "family": "wms",
    "contexts": [
      "wms"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 6,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: WMS GRN Report Format-7",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "WMS_GRN_REPORT_FORMAT_8",
    "name": "WMS GRN Report Format-8",
    "family": "wms",
    "contexts": [
      "wms"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 6,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: WMS GRN Report Format-8",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "WMS_GRN_REPORT_FORMAT_9",
    "name": "WMS GRN Report Format-9",
    "family": "wms",
    "contexts": [
      "wms"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 6,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: WMS GRN Report Format-9",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "WMS_GRN_REPORT_FORMAT_10",
    "name": "WMS GRN Report Format-10",
    "family": "wms",
    "contexts": [
      "wms"
    ],
    "formats": [
      "PDF"
    ],
    "rolloutPhase": 6,
    "gapStatus": "partial_document_pdf",
    "description": "FRESA sample: WMS GRN Report Format-10",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ]
  },
  {
    "code": "WMS_STOCK_REPORT_FORMAT_1",
    "name": "WMS Stock Report Format-1",
    "family": "wms",
    "contexts": [
      "wms",
      "list"
    ],
    "formats": [
      "PDF",
      "XLSX",
      "CSV"
    ],
    "rolloutPhase": 6,
    "gapStatus": "covered_analytics",
    "description": "FRESA sample: WMS Stock Report Format-1",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ],
    "existingPath": "/warehouse/stock"
  },
  {
    "code": "WMS_STOCK_REPORT_FORMAT_2",
    "name": "WMS Stock Report Format-2",
    "family": "wms",
    "contexts": [
      "wms",
      "list"
    ],
    "formats": [
      "PDF",
      "XLSX",
      "CSV"
    ],
    "rolloutPhase": 6,
    "gapStatus": "covered_analytics",
    "description": "FRESA sample: WMS Stock Report Format-2",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ],
    "existingPath": "/warehouse/stock"
  },
  {
    "code": "WMS_STOCK_REPORT_FORMAT_3",
    "name": "WMS Stock Report Format-3",
    "family": "wms",
    "contexts": [
      "wms",
      "list"
    ],
    "formats": [
      "PDF",
      "XLSX",
      "CSV"
    ],
    "rolloutPhase": 6,
    "gapStatus": "covered_analytics",
    "description": "FRESA sample: WMS Stock Report Format-3",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ],
    "existingPath": "/warehouse/stock"
  },
  {
    "code": "WMS_STOCK_REPORT_FORMAT_4",
    "name": "WMS Stock Report Format-4",
    "family": "wms",
    "contexts": [
      "wms",
      "list"
    ],
    "formats": [
      "PDF",
      "XLSX",
      "CSV"
    ],
    "rolloutPhase": 6,
    "gapStatus": "covered_analytics",
    "description": "FRESA sample: WMS Stock Report Format-4",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ],
    "existingPath": "/warehouse/stock"
  },
  {
    "code": "WMS_STOCK_REPORT_FORMAT_5",
    "name": "WMS Stock Report Format-5",
    "family": "wms",
    "contexts": [
      "wms",
      "list"
    ],
    "formats": [
      "PDF",
      "XLSX",
      "CSV"
    ],
    "rolloutPhase": 6,
    "gapStatus": "covered_analytics",
    "description": "FRESA sample: WMS Stock Report Format-5",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ],
    "existingPath": "/warehouse/stock"
  },
  {
    "code": "WMS_STOCK_REPORT_FORMAT_6",
    "name": "WMS Stock Report Format-6",
    "family": "wms",
    "contexts": [
      "wms",
      "list"
    ],
    "formats": [
      "PDF",
      "XLSX",
      "CSV"
    ],
    "rolloutPhase": 6,
    "gapStatus": "covered_analytics",
    "description": "FRESA sample: WMS Stock Report Format-6",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ],
    "existingPath": "/warehouse/stock"
  },
  {
    "code": "WMS_STOCK_REPORT_FORMAT_7",
    "name": "WMS Stock Report Format-7",
    "family": "wms",
    "contexts": [
      "wms",
      "list"
    ],
    "formats": [
      "PDF",
      "XLSX",
      "CSV"
    ],
    "rolloutPhase": 6,
    "gapStatus": "covered_analytics",
    "description": "FRESA sample: WMS Stock Report Format-7",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ],
    "existingPath": "/warehouse/stock"
  },
  {
    "code": "WMS_STOCK_REPORT_FORMAT_8",
    "name": "WMS Stock Report Format-8",
    "family": "wms",
    "contexts": [
      "wms",
      "list"
    ],
    "formats": [
      "PDF",
      "XLSX",
      "CSV"
    ],
    "rolloutPhase": 6,
    "gapStatus": "covered_analytics",
    "description": "FRESA sample: WMS Stock Report Format-8",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ],
    "existingPath": "/warehouse/stock"
  },
  {
    "code": "WMS_STOCK_REPORT_FORMAT_9",
    "name": "WMS Stock Report Format-9",
    "family": "wms",
    "contexts": [
      "wms",
      "list"
    ],
    "formats": [
      "PDF",
      "XLSX",
      "CSV"
    ],
    "rolloutPhase": 6,
    "gapStatus": "covered_analytics",
    "description": "FRESA sample: WMS Stock Report Format-9",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ],
    "existingPath": "/warehouse/stock"
  },
  {
    "code": "WMS_STOCK_REPORT_FORMAT_10",
    "name": "WMS Stock Report Format-10",
    "family": "wms",
    "contexts": [
      "wms",
      "list"
    ],
    "formats": [
      "PDF",
      "XLSX",
      "CSV"
    ],
    "rolloutPhase": 6,
    "gapStatus": "covered_analytics",
    "description": "FRESA sample: WMS Stock Report Format-10",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ],
    "existingPath": "/warehouse/stock"
  },
  {
    "code": "WMS_STOCK_REPORT_FORMAT_11",
    "name": "WMS Stock Report Format-11",
    "family": "wms",
    "contexts": [
      "wms",
      "list"
    ],
    "formats": [
      "PDF",
      "XLSX",
      "CSV"
    ],
    "rolloutPhase": 6,
    "gapStatus": "covered_analytics",
    "description": "FRESA sample: WMS Stock Report Format-11",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ],
    "existingPath": "/warehouse/stock"
  },
  {
    "code": "WMS_STOCK_REPORT_FORMAT_12",
    "name": "WMS Stock Report Format-12",
    "family": "wms",
    "contexts": [
      "wms",
      "list"
    ],
    "formats": [
      "PDF",
      "XLSX",
      "CSV"
    ],
    "rolloutPhase": 6,
    "gapStatus": "covered_analytics",
    "description": "FRESA sample: WMS Stock Report Format-12",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ],
    "existingPath": "/warehouse/stock"
  },
  {
    "code": "WMS_STOCK_REPORT_FORMAT_13",
    "name": "WMS Stock Report Format-13",
    "family": "wms",
    "contexts": [
      "wms",
      "list"
    ],
    "formats": [
      "PDF",
      "XLSX",
      "CSV"
    ],
    "rolloutPhase": 6,
    "gapStatus": "covered_analytics",
    "description": "FRESA sample: WMS Stock Report Format-13",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ],
    "existingPath": "/warehouse/stock"
  },
  {
    "code": "WMS_STOCK_REPORT_FORMAT_14",
    "name": "WMS Stock Report Format-14",
    "family": "wms",
    "contexts": [
      "wms",
      "list"
    ],
    "formats": [
      "PDF",
      "XLSX",
      "CSV"
    ],
    "rolloutPhase": 6,
    "gapStatus": "covered_analytics",
    "description": "FRESA sample: WMS Stock Report Format-14",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ],
    "existingPath": "/warehouse/stock"
  },
  {
    "code": "WMS_STOCK_REPORT_FORMAT_15",
    "name": "WMS Stock Report Format-15",
    "family": "wms",
    "contexts": [
      "wms",
      "list"
    ],
    "formats": [
      "PDF",
      "XLSX",
      "CSV"
    ],
    "rolloutPhase": 6,
    "gapStatus": "covered_analytics",
    "description": "FRESA sample: WMS Stock Report Format-15",
    "defaultParams": [
      {
        "name": "from_date",
        "label": "From date",
        "type": "date",
        "required": false
      },
      {
        "name": "to_date",
        "label": "To date",
        "type": "date",
        "required": false
      },
      {
        "name": "branch_id",
        "label": "Branch",
        "type": "uuid",
        "required": false
      }
    ],
    "existingPath": "/warehouse/stock"
  }
] as ReportTemplateMeta[];
