# Report Fixture Strategy

**Mode:** Design only. Audit phase — do not invent live production data.

---

## 1. Principles (aligned with MASTER_PROMPT)

1. **Never invent** missing operational fields as Fresa demo parties/banks.  
2. Fixtures are **deterministic** (fixed ISO dates, fixed IDs, fixed weights).  
3. **Org chrome** comes from a dedicated test organization profile (logo + company), never Fresa DEMO / FRESA TECHNOLOGIES identity.  
4. Two modes per code:  
   - `catalogue_preview` (`entityBound: false`) — may use neutral pin-density fillers where product already does (`mergeHawbCatalogPreviewFixture` pattern)  
   - `entity_bound` (`entityBound: true`) — only fields a real job/invoice would hydrate; blanks stay blank  
5. Fixtures are keyed by **fixtureProfile**, not by copying Fresa sample text into asserts.

---

## 2. Profiles

| Profile | Families | Contents |
|---|---|---|
| `shipping.air.hawb` | hawb | MAWB/HAWB, shipper/consignee 3-line, pieces/weight, ports, carrier, org agent |
| `shipping.air.mawb` | mawb | Master AWB routing + sparse cargo |
| `shipping.ocean.hbl` | hbl | HBL no, parties, containers, freight terms blanks if unknown |
| `shipping.arrival` | arrival_notice | Vessel/flight, packages, charges optional |
| `shipping.do` | delivery_order | DO number, consignee, cargo |
| `shipping.manifest` | cargo_manifest | Multi-row house list (stress pagination) |
| `commercial.invoice` | invoice, purchase_invoice, CN/DN | Bill-to, line items (1 / 12 / 40 row stress), tax total single field |
| `commercial.quotation` | quotation | Lanes/charges |
| `financial.voucher` | voucher | Journal lines |
| `financial.ledger` | ledger, statements | Date range + opening/closing |
| `ops.list` | ops_list | Tabular 5 / 50 / 500 row stress (xlsx+pdf where applicable) |
| `ops.form` | booking, pre-alert | Sparse confirmation fields |
| `wms.asn` | wms | ASN lines / locations |
| `other.generic` | other | Minimal letterhead + title |

Each profile ships:

- `base.json` — happy path  
- `stress-long-party.json` — 120-char address lines (overflow tests)  
- `stress-rows.json` — many table rows (pagination)  
- `minimal.json` — almost empty entity-bound (blank honesty)

---

## 3. Storage layout (proposed)

```
reports/fixtures/universal/
  org/test-org.json
  profiles/<profile>/base.json
  profiles/<profile>/stress-long-party.json
  profiles/<profile>/stress-rows.json
  profiles/<profile>/minimal.json
  code-overrides/<CODE>.json    # rare per-code extras
  index.json                    # code → profile mapping
```

**Reuse:** Seed from existing `src/features/reports/qa/phase1-fixtures`, `phase2-hawb-fixtures`, invoice flow fixtures, and `hawbOfficialCatalogFixture.ts` **neutral** names only.

---

## 4. Mapping codes → profiles

Generate `index.json` from `REPORT_FAMILY_MAPPING.json` templateFamily:

| templateFamily | profile |
|---|---|
| hawb | shipping.air.hawb |
| mawb | shipping.air.mawb |
| hbl | shipping.ocean.hbl |
| arrival_notice | shipping.arrival |
| delivery_order | shipping.do |
| cargo_manifest | shipping.manifest |
| invoice / purchase_invoice | commercial.invoice |
| quotation | commercial.quotation |
| voucher | financial.voucher |
| ledger / financial_statement | financial.ledger |
| ops_list | ops.list |
| ops_form | ops.form |
| wms | wms.asn |
| other | other.generic |

Official HAWB five always use `shipping.air.hawb` with entityBound true for regression of leftover-demo-strip class.

---

## 5. Org chrome fixture

`reports/fixtures/universal/org/test-org.json`:

- `companyName`: e.g. `Zoyan Logistics` (or Freightnest Test Org)  
- address / phone / email  
- `logoUrl`: path to bundled test PNG under `reports/fixtures/universal/org/logo.png`  

Asserts must fail if output contains `/fresa/i` identity strings (existing leak-check tools: `tools/reports/leak-check.mjs`).

---

## 6. Reference compare data

When comparing to Fresa pins:

- Use **pin’s own demo values** only inside dynamic-text layer (MASTER_PROMPT) via extract of reference, **or**  
- Prefer geometry/raster with masks and structural product fixtures separately  

Do not require product PDF to equal Fresa demo party names.

---

## 7. Versioning

- `fixtureHash = sha256(canonical JSON)` recorded in each `qa.json`  
- Changing a profile bumps hash → invalidates cached PNGs  
- Pipeline version already exists: `tools/reports/pipeline-version.mjs`

---

## 8. Honesty rules for catalogue preview

Where product injects neutral preview cargo when `!entityBound`, fixtures for preview mode must match that contract and tests must assert **no Fresa DEMO / BABU / AL NASER**. Entity-bound fixtures must not rely on preview fillers.
