# Quotation fields — air / FCL / LCL

## Held vs printed

- **valid_until**: classic — dueDate / Valid Until label; flow — Valid Until
- **transit_time_days**: classic — shipment.etdEta (Transit N day(s)); flow — not printed
- **incoterm**: classic — remarks (Incoterm: …); flow — Incoterms grid (reads quotation.incoterms)
- **airline / carrier**: classic — shipment.vesselFlight; flow — Carrier grid
- **flight / voyage**: classic — not printed; flow — not printed
- **gross_weight**: classic — shipment.grossWtCbm; flow — not printed
- **volume_cbm**: classic — shipment.grossWtCbm; flow — not printed
- **container_count / type**: classic — shipment.containerNo; flow — not printed
- **terms**: classic — not as dedicated terms block; flow — termsLines from quotation.terms
- **remarks**: classic — remarks block; flow — Remarks grid + terms

## Bind existing sources not printed on flow

- `quotation.transit_time_days`: held on record, not bound in QUOTATION_FLOW_1. Action: bind into flow field grid.
- `quotation.gross_weight / volume_cbm`: held on record, not bound in QUOTATION_FLOW_1. Action: bind into flow field grid.
- `quotation.container_count / container_type_id`: held on record, not bound in QUOTATION_FLOW_1. Action: bind into flow field grid.
- `quotation.incoterm (singular)`: reads quotation.incoterms (plural) — mapping miss when only incoterm is set. Action: bind quotation.incoterm as fallback in flow Incoterms cell.
- `quotation.terms_and_conditions`: reads quotation.terms only. Action: bind terms_and_conditions as fallback.
- `quotation.voyage_number / vessel_name`: not printed. Action: backend/UI already store; print decision needed.

## Backend requirements (not on record / not resolved)

- airline name as a dedicated field when carrier_name is empty for air jobs
- flight number distinct from voyage_number for air jobs
- resolved container type label (container_type_id alone is an id)
- structured validity / transit display units if free-text is insufficient

## Sample held flags by bucket

```json
{
  "air": [
    {
      "number": "QT/AE/26/00105",
      "job_type": "AIR_EXPORT",
      "held": {
        "valid_until": true,
        "transit_time_days": false,
        "incoterm": false,
        "airline / carrier": false,
        "flight / voyage": false,
        "gross_weight": true,
        "volume_cbm": false,
        "container_count / type": false,
        "terms": false,
        "remarks": true
      }
    },
    {
      "number": "QT/AE/26/00089",
      "job_type": "AIR_EXPORT",
      "held": {
        "valid_until": true,
        "transit_time_days": false,
        "incoterm": false,
        "airline / carrier": false,
        "flight / voyage": false,
        "gross_weight": true,
        "volume_cbm": false,
        "container_count / type": false,
        "terms": false,
        "remarks": true
      }
    },
    {
      "number": "QT/AE/26/00073",
      "job_type": "AIR_EXPORT",
      "held": {
        "valid_until": true,
        "transit_time_days": false,
        "incoterm": false,
        "airline / carrier": false,
        "flight / voyage": false,
        "gross_weight": true,
        "volume_cbm": true,
        "container_count / type": false,
        "terms": false,
        "remarks": true
      }
    }
  ],
  "fcl": [
    {
      "number": "QT/FE/26/00119",
      "job_type": "SEA_FCL_EXPORT",
      "held": {
        "valid_until": true,
        "transit_time_days": false,
        "incoterm": false,
        "airline / carrier": false,
        "flight / voyage": false,
        "gross_weight": true,
        "volume_cbm": false,
        "container_count / type": true,
        "terms": false,
        "remarks": true
      }
    },
    {
      "number": "QT/FE/26/00118",
      "job_type": "SEA_FCL_EXPORT",
      "held": {
        "valid_until": true,
        "transit_time_days": false,
        "incoterm": false,
        "airline / carrier": false,
        "flight / voyage": false,
        "gross_weight": true,
        "volume_cbm": false,
        "container_count / type": false,
        "terms": false,
        "remarks": true
      }
    },
    {
      "number": "QT/FE/26/00117",
      "job_type": "SEA_FCL_EXPORT",
      "held": {
        "valid_until": true,
        "transit_time_days": false,
        "incoterm": false,
        "airline / carrier": false,
        "flight / voyage": false,
        "gross_weight": true,
        "volume_cbm": false,
        "container_count / type": false,
        "terms": false,
        "remarks": true
      }
    },
    {
      "number": "QT/FE/26/00116",
      "job_type": "SEA_FCL_EXPORT",
      "held": {
        "valid_until": true,
        "transit_time_days": true,
        "incoterm": true,
        "airline / carrier": true,
        "flight / voyage": false,
        "gross_weight": true,
        "volume_cbm": true,
        "container_count / type": true,
        "terms": false,
        "remarks": true
      }
    }
  ],
  "lcl": [
    {
      "number": "QT/LE/26/00063",
      "job_type": "SEA_LCL_EXPORT",
      "held": {
        "valid_until": true,
        "transit_time_days": false,
        "incoterm": false,
        "airline / carrier": false,
        "flight / voyage": false,
        "gross_weight": true,
        "volume_cbm": true,
        "container_count / type": false,
        "terms": false,
        "remarks": true
      }
    },
    {
      "number": "QT/LE/26/00014",
      "job_type": "SEA_LCL_EXPORT",
      "held": {
        "valid_until": false,
        "transit_time_days": false,
        "incoterm": false,
        "airline / carrier": false,
        "flight / voyage": false,
        "gross_weight": true,
        "volume_cbm": false,
        "container_count / type": false,
        "terms": false,
        "remarks": true
      }
    },
    {
      "number": "QT/LE/26/00003",
      "job_type": "SEA_LCL_EXPORT",
      "held": {
        "valid_until": true,
        "transit_time_days": true,
        "incoterm": true,
        "airline / carrier": true,
        "flight / voyage": false,
        "gross_weight": true,
        "volume_cbm": true,
        "container_count / type": true,
        "terms": false,
        "remarks": true
      }
    }
  ],
  "other": []
}
```
