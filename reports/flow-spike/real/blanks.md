# Real-record blanks — after decision bindings

Fetched at: 2026-11-23T05:55:24.772Z

CREDIT_NOTE_FLOW_1 / DEBIT_NOTE_FLOW_1 are staging-only (soft gate + VITE_REPORTS_FLOW_STAGING); synthetic notes never count toward release.

## Quotation fill share by type

### Before (prior binding)

```json
{
  "air": {
    "filled": 6,
    "total": 30,
    "share": 0.2,
    "pct": "20.0%"
  },
  "fcl": {
    "filled": 9,
    "total": 40,
    "share": 0.225,
    "pct": "22.5%"
  },
  "lcl": {
    "filled": 6,
    "total": 30,
    "share": 0.2,
    "pct": "20.0%"
  }
}
```

### After (bound transit, weights, volumes, containers, incoterm|incoterms, terms_and_conditions, carrier/airline, flight/voyage, remarks)

```json
{
  "air": {
    "filled": 10,
    "total": 30,
    "share": 0.3333,
    "pct": "33.3%"
  },
  "fcl": {
    "filled": 18,
    "total": 40,
    "share": 0.45,
    "pct": "45.0%"
  },
  "lcl": {
    "filled": 14,
    "total": 30,
    "share": 0.4667,
    "pct": "46.7%"
  }
}
```

## Quotation empty boxes (after)

### QT/FE/26/00119 (fcl)
- **Bill To name**: empty in the record
- **Incoterms**: empty in the record
- **Carrier / Airline**: empty in the record
- **Flight / Voyage**: empty in the record
- **Transit**: empty in the record
- **Volume**: empty in the record
- **Terms**: empty in the record

### QT/FE/26/00118 (fcl)
- **Incoterms**: empty in the record
- **Carrier / Airline**: empty in the record
- **Flight / Voyage**: empty in the record
- **Transit**: empty in the record
- **Volume**: empty in the record
- **Containers**: empty in the record
- **Terms**: empty in the record

### QT/FE/26/00117 (fcl)
- **Incoterms**: empty in the record
- **Carrier / Airline**: empty in the record
- **Flight / Voyage**: empty in the record
- **Transit**: empty in the record
- **Volume**: empty in the record
- **Containers**: empty in the record
- **Terms**: empty in the record

### QT/FE/26/00116 (fcl)
- **Flight / Voyage**: empty in the record
- **Terms**: empty in the record
- **Lines**: empty in the record

### QT/AE/26/00105 (air)
- **Incoterms**: empty in the record
- **Carrier / Airline**: empty in the record
- **Flight / Voyage**: empty in the record
- **Transit**: empty in the record
- **Volume**: empty in the record
- **Containers**: empty in the record
- **Terms**: empty in the record

### QT/AE/26/00089 (air)
- **Incoterms**: empty in the record
- **Carrier / Airline**: empty in the record
- **Flight / Voyage**: empty in the record
- **Transit**: empty in the record
- **Volume**: empty in the record
- **Containers**: empty in the record
- **Terms**: empty in the record

### QT/AE/26/00073 (air)
- **Incoterms**: empty in the record
- **Carrier / Airline**: empty in the record
- **Flight / Voyage**: empty in the record
- **Transit**: empty in the record
- **Containers**: empty in the record
- **Terms**: empty in the record

### QT/LE/26/00063 (lcl)
- **Incoterms**: empty in the record
- **Carrier / Airline**: empty in the record
- **Flight / Voyage**: empty in the record
- **Transit**: empty in the record
- **Containers**: empty in the record
- **Terms**: empty in the record

### QT/LE/26/00014 (lcl)
- **Valid Until**: empty in the record
- **Incoterms**: empty in the record
- **Carrier / Airline**: empty in the record
- **Flight / Voyage**: empty in the record
- **Transit**: empty in the record
- **Volume**: empty in the record
- **Containers**: empty in the record
- **Terms**: empty in the record

### QT/LE/26/00003 (lcl)
- **Flight / Voyage**: empty in the record
- **Terms**: empty in the record

## Credit note

Real count: 0 (synthetic used for testing only).

## Debit note

Real count: 0 (synthetic used for testing only).

## Tax assertion violations

- (none)

