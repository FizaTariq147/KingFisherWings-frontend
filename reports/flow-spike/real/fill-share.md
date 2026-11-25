# Quotation fill share before / after field binding

## Before

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

## After

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

## Remaining empty (after) — why

- **QT/FE/26/00119** (fcl): incoterm (empty in the record); carrier_airline (empty in the record); flight (empty in the record); transit (empty in the record); volume_cbm (empty in the record); terms (empty in the record)
- **QT/FE/26/00118** (fcl): incoterm (empty in the record); carrier_airline (empty in the record); flight (empty in the record); transit (empty in the record); volume_cbm (empty in the record); containers (empty in the record); terms (empty in the record)
- **QT/FE/26/00117** (fcl): incoterm (empty in the record); carrier_airline (empty in the record); flight (empty in the record); transit (empty in the record); volume_cbm (empty in the record); containers (empty in the record); terms (empty in the record)
- **QT/FE/26/00116** (fcl): flight (empty in the record); terms (empty in the record)
- **QT/AE/26/00105** (air): incoterm (empty in the record); carrier_airline (empty in the record); flight (empty in the record); transit (empty in the record); volume_cbm (empty in the record); containers (empty in the record); terms (empty in the record)
- **QT/AE/26/00089** (air): incoterm (empty in the record); carrier_airline (empty in the record); flight (empty in the record); transit (empty in the record); volume_cbm (empty in the record); containers (empty in the record); terms (empty in the record)
- **QT/AE/26/00073** (air): incoterm (empty in the record); carrier_airline (empty in the record); flight (empty in the record); transit (empty in the record); containers (empty in the record); terms (empty in the record)
- **QT/LE/26/00063** (lcl): incoterm (empty in the record); carrier_airline (empty in the record); flight (empty in the record); transit (empty in the record); containers (empty in the record); terms (empty in the record)
- **QT/LE/26/00014** (lcl): valid_until (empty in the record); incoterm (empty in the record); carrier_airline (empty in the record); flight (empty in the record); transit (empty in the record); volume_cbm (empty in the record); containers (empty in the record); terms (empty in the record)
- **QT/LE/26/00003** (lcl): flight (empty in the record); terms (empty in the record)
