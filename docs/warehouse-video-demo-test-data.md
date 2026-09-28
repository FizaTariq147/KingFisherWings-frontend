# Warehouse module — manual test data (enter yourself)

No seed scripts. Create party, item, quote, job, ASN, etc. in the UI with the values below.

## Flow (do not skip)

```
Warehouse quotation → Approve (no job yet)
  → Portal booking form → Submit → converts to WAREHOUSE job
  → Staff Ops warehouse booking form
  → Job sticker + driver handoff card
  → Gatekeeper barcode scan
  → ASN yard: Confirm → picked → unloading → unloaded (auto GRN)
  → Storage calculate → DRAFT invoice → Finance Post → portal invoices
  → GDO Post (= GDN) → customer docs
```

---

## Cast

| Role | Enter this |
|------|------------|
| Customer / party | Al Maha Trading LLC |
| Contact | Fatima Al Hashimi |
| Email | fatima.hashimi@almaha-demo.example |
| Phone | +971 50 123 4567 |
| Address | Office 210, Jebel Ali Free Zone, Dubai, UAE |
| Driver | Hassan Al Mazrouei |
| Driver phone | +971 55 987 6543 |
| Emirates ID | 784-1990-1234567-1 |
| Plate / trailer | D-48291 / T-109 |
| Vehicle | Curtain-side truck |
| Gate | JAFZA Gate 3 — inbound dock B |
| Warehouse code | JAFZA-WH-01 |
| Warehouse name | KingFisher Jebel Ali Bonded Warehouse |
| Clerk | Sara Warehouse Ops |
| Gatekeeper | Omar Gate Lead |

---

## Masters (create first)

**Warehouse** (`/masters` warehouses or existing list):

- Code: `JAFZA-WH-01`
- Name: `KingFisher Jebel Ali Bonded Warehouse`
- Address: `Plot WH-12, Jebel Ali Free Zone, Dubai`

**WMS item** (`/warehouse/items/new`):

- Code: `SKU-ELEC-CARTON`
- Name: `Electronics Carton Mix`
- UOM: `CTN`
- Description: `Mixed consumer electronics cartons for bonded storage`

---

## Quotation / cargo

| Field | Value |
|-------|--------|
| Job type | WAREHOUSE |
| Commodity | Consumer electronics — carton storage |
| HS code | 847130 |
| Pieces | 48 |
| CBM | 18.5 |
| Gross weight kg | 4200 |
| Incoterms | DAP |
| Currency | AED |
| Remarks | Hold 7 free days then storage accrual. Driver presents sticker at Gate 3. |

---

## Portal / staff booking form

| Field | Value |
|-------|--------|
| Pickup / origin | Customer warehouse / factory — Jebel Ali |
| Warehouse name | KingFisher Jebel Ali Bonded Warehouse |
| Expected inbound | 2026-09-26T06:00 |
| Expected outbound | 2026-10-10T14:00 |
| Storage days | 14 |
| Bonded | Yes |
| Temp controlled | No |
| Pieces / CBM / kg | 48 / 18.5 / 4200 |
| Stock line SKU | SKU-ELEC-CARTON |
| Stock qty / unit / CBM | 48 / CTN / 18.5 |
| Handling | 48 sealed cartons · Gate 3 dock B |

---

## Sticker (Job Overview → Barcode → Download/Print)

- Size: **100 × 50 mm**
- CODE128 value = your real **job_number** (write it on the handoff card)
- Expect on label: job no, barcode, Al Maha Trading LLC, 48 pcs, 4200 kg, 18.5 CBM, commodity

---

## Driver handoff card (print / give with sticker)

Replace `JOB-NO` with the real job number:

```
Job: JOB-NO
Barcode: JOB-NO
Customer: Al Maha Trading LLC
Driver: Hassan Al Mazrouei
Emirates ID: 784-1990-1234567-1
Plate: D-48291 · Trailer: T-109
Gate: JAFZA Gate 3 — inbound dock B
Cargo: 48 CTN electronics · 18.5 CBM · 4200 kg
Present barcode sticker to gatekeeper Omar
```

---

## Gatekeeper scan (`/jobs/barcode-scan`)

| Field | Value |
|-------|--------|
| Barcode | your job_number |
| Location | JAFZA Gate 3 — inbound dock B |
| Notes | Driver Hassan Al Mazrouei · plate D-48291 · trailer T-109 · gate-in |

---

## ASN (`/warehouse/asns/new`)

| Field | Value |
|-------|--------|
| Warehouse | JAFZA-WH-01 |
| Party | Al Maha Trading LLC |
| Job | your WAREHOUSE job |
| Expected at | 2026-09-26T06:00 |
| Remarks | Hassan · D-48291 / T-109 · Gate 3 dock B |
| Line item | SKU-ELEC-CARTON |
| Qty / CBM | 48 / 18.5 |
| Line remarks | 48 sealed cartons |

Yard: **Confirm → Mark picked → Mark unloading → Mark unloaded** → auto GRN.

---

## Storage invoice (`/warehouse/storage`)

| Field | Value |
|-------|--------|
| Party | Al Maha Trading LLC |
| Period from | 2026-09-26 |
| Period to | 2026-10-10 |
| Free days | 7 |
| Rate / day | 85 AED |
| Overdue / day | 120 AED |

Then: **Calculate** → select OPEN charges from the result → **Invoice selected** → staff **Invoices → Post** → customer `/portal/invoices`.

**Notes (live API):**
- Do **not** rely on `GET /wms/storage/charges` — it currently returns HTTP 500. The Storage page invoices from `POST /wms/storage/calculate` results only.
- Lots must have **`party_id` set** (check Stock → lot aging). If lots show `party_id: null`, calculate returns `[]` even when the GRN has a party — that is a backend/data issue on GRN post / unload.

---

## GDO (`/warehouse/gdos/new`)

| Field | Value |
|-------|--------|
| Warehouse | JAFZA-WH-01 |
| Party | Al Maha Trading LLC |
| Job | same job |
| Delivered at | 2026-10-10T14:00 |
| Remarks | Gate-out · POD Hassan · D-48291 · full release |
| Line | SKU-ELEC-CARTON · qty 48 |

Then **Post** → GDN; customer sees docs on portal (not `/portal/wms`).

---

## Routes

| Screen | Path |
|--------|------|
| Warehouse hub | `/warehouse` |
| Ops board | `/warehouse/ops-board` |
| Items | `/warehouse/items` |
| ASN | `/warehouse/asns` |
| GRN | `/warehouse/grns` |
| GDO | `/warehouse/gdos` |
| Storage | `/warehouse/storage` |
| Scan | `/jobs/barcode-scan` |
| Staff invoices | `/invoices` |
| Portal invoices | `/portal/invoices` |
