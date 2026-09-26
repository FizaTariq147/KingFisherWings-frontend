# Warehouse workflow video — dummy data & step-by-step guide

Test case for filming the full warehouse flow: **sticker → customer gives driver → gatekeeper scan → GRN → invoice → portal invoice → GDO**.

---

## Dummy cast

| Role | Details |
|------|---------|
| **Customer** | Al Noor Trading LLC |
| **Contact** | Fatima Al Hashimi · +971 50 123 4567 · fatima.hashimi@almaha-demo.example |
| **Address** | Office 1204, Business Bay, Dubai, UAE |
| **Driver** | Hassan Al Mazrouei · +971 55 987 6543 |
| **Vehicle** | Plate **D-48291** · Trailer **T-109** · Curtain-side truck |
| **Emirates ID** | 784-1990-1234567-1 |
| **Gatekeeper** | Omar Gate Lead · JAFZA Gate 3 — inbound dock B · shift 06:00–14:00 |
| **Warehouse clerk** | Sara Warehouse Ops · WMS inbound desk |
| **Warehouse** | KingFisher Jebel Ali Bonded Warehouse (JAFZA-WH-01) |

---

## Cargo / job dummy data

| Field | Value |
|-------|--------|
| **Job type** | `WAREHOUSE` |
| **Commodity** | Consumer electronics — carton storage |
| **HS code** | `847130` |
| **Pieces** | `48` |
| **Volume CBM** | `18.5` |
| **Gross weight kg** | `4200` |
| **Currency** | `AED` |
| **Incoterms** | `DAP` |
| **Customer remarks** | Hold 7 free days then storage accrual. Driver will present sticker at Gate 3. |
| **Item SKU** | `SKU-ELEC-CARTON` — Electronics Carton Mix · UOM `CTN` |

### Live seeded example (if already created)

| Field | Value |
|-------|--------|
| **Job number** | `JOB-WH-2026-00139` |
| **Barcode (sticker)** | `JOBWH202600139` |
| **Job URL** | `/jobs/air-export/ff5731c5-0349-4684-9066-5c79cf1b685e` |
| **GRN** | `/warehouse/grns/f81f63f5-c111-49a4-9556-0c122f9f799c` |

> If you create a new job, replace barcode / job number with the values shown on that job’s sticker.

---

## Driver handoff card (print / show on camera)

Give this **with the printed barcode sticker** to the driver:

```
Job: JOB-WH-2026-00139
Barcode: JOBWH202600139
Customer: Al Noor Trading LLC
Driver: Hassan Al Mazrouei
Plate: D-48291 · Trailer: T-109
Gate: JAFZA Gate 3 — inbound dock B
Cargo: 48 CTN electronics · 18.5 CBM · 4200 kg
Present barcode sticker to gatekeeper
```

---

## Gatekeeper scan payload

| Field | Value |
|-------|--------|
| **UI** | `/jobs/barcode-scan` |
| **Barcode** | `JOBWH202600139` (or job number from sticker) |
| **Location** | `JAFZA Gate 3 — inbound dock B` |
| **Notes** | `Driver Hassan Al Mazrouei · plate D-48291 · trailer T-109 · VIDEO DEMO gate-in` |

---

## GRN (gate-in) dummy data

| Field | Value |
|-------|--------|
| **UI** | `/warehouse/grns/new` |
| **Party** | Al Noor Trading LLC |
| **Job** | Link warehouse job |
| **Received at** | `2026-09-26T08:30:00` |
| **Remarks** | `Gate-in · driver Hassan Al Mazrouei · plate D-48291 · sticker JOBWH202600139` |
| **Line item** | Electronics Carton Mix |
| **Quantity** | `48` |
| **CBM** | `18.5` |
| **Unit cost** | `12.5` |
| **Batch** | `BATCH-DXB-0926` |
| **After create** | Open GRN → **Post** → download gate-pass PDF if shown |

---

## Storage / invoice dummy data

| Field | Value |
|-------|--------|
| **UI** | `/warehouse/storage` or job → **Invoices** tab |
| **Period from** | `2026-09-26` |
| **Period to** | `2026-10-10` |
| **Free days** | `7` |
| **Rate per day** | `85` AED |
| **Overdue rate per day** | `120` AED |
| **Currency** | `AED` |

### Sample invoice lines

| Description | Qty | Unit price | Unit |
|-------------|-----|------------|------|
| Warehouse storage — Al Noor electronics (post free days) | 7 | 85 | DAY |
| Inbound handling / gate-in | 1 | 250 | SHPT |

**Customer views invoice at:** `/invoices/:id` (staff) or `/portal/invoices/:id` (portal).

---

## GDO (gate-out) dummy data

| Field | Value |
|-------|--------|
| **UI** | `/warehouse/gdos/new` |
| **Party** | Al Noor Trading LLC |
| **Job** | Same warehouse job |
| **Delivered at** | `2026-10-10T14:00:00` |
| **Remarks** | `Gate-out · POD signed by driver Hassan · plate D-48291 · full release` |
| **Line qty** | `48` |
| **After create** | Open GDO → **Post** → download gate-pass PDF if shown |

---

## Step-by-step film guide

### Step 1 — Create / open warehouse job

1. Staff login → **Jobs** → **New** (or open existing warehouse job).
2. Job type: **WAREHOUSE**.
3. Shipper: **Al Noor Trading LLC**.
4. Fill commodity, pieces `48`, CBM `18.5`, weight `4200`.
5. Save and note the **job number**.

**Say on camera:** “Customer booked warehouse storage.”

---

### Step 2 — Print sticker (what the label looks like)

1. Open the job → **Overview**.
2. Open barcode / sticker panel.
3. **Download PDF** or **Print**.
4. Film the CODE128 sticker clearly (job number + barcode).

**Say on camera:** “This sticker goes with the cargo.”

---

### Step 3 — Customer gives driver (handoff)

1. Show printed sticker.
2. Show **Driver handoff card** (section above).

**Say on camera:** “Customer hands sticker and gate card to the driver.”

---

### Step 4 — Gatekeeper scan

1. Go to `/jobs/barcode-scan`.
2. Paste / type the **barcode from the sticker**.
3. Lookup / Scan.
4. Location: `JAFZA Gate 3 — inbound dock B`.
5. Notes: driver name + plate + trailer.

**Say on camera:** “Gatekeeper scans sticker and sees full job details.”

---

### Step 5 — Gate-in stock (GRN)

1. Go to `/warehouse/grns/new`.
2. Select warehouse + party **Al Noor Trading LLC**.
3. Link the **job**.
4. Add line: qty `48`, CBM `18.5`.
5. Remarks with driver + plate.
6. Save → open GRN → **Post**.
7. Download gate-pass PDF if shown.

**Say on camera:** “Stock is booked in at the gate.”

---

### Step 6 — Invoice (storage / charges)

**Option A — Storage:** `/warehouse/storage`  
- Party Al Noor · free days `7` · rate/day `85` · overdue `120` → Calculate → create invoice.

**Option B — From job:** Job → **Invoices** tab → create / open invoice.

Then open `/invoices/<id>` and show PDF/amount.

**Say on camera:** “Warehouse storage invoice for the customer.”

---

### Step 7 — Customer sees invoice

1. Customer portal login → `/portal/invoices`.
2. Open the same invoice.

**Say on camera:** “Customer reviews the invoice in the portal.”

---

### Step 8 — Driver collects (GDO / gate-out)

1. Go to `/warehouse/gdos/new`.
2. Same warehouse + party + job.
3. Line qty `48`.
4. Remarks: gate-out + POD signed by Hassan.
5. Save → **Post** → gate-pass PDF if available.

**Say on camera:** “Full release — driver exits with cargo.”

---

## Quick film order

1. Job  
2. **Sticker PDF**  
3. Handoff card  
4. **Barcode scan**  
5. **GRN Post**  
6. **Invoice**  
7. Portal invoice  
8. **GDO Post**

---

## UI routes cheat sheet

| Screen | Path |
|--------|------|
| Warehouse hub | `/warehouse` |
| Barcode scan (gatekeeper) | `/jobs/barcode-scan` |
| New job | `/jobs/new` |
| Job detail (WAREHOUSE) | `/jobs/air-export/:id` |
| Job invoices tab | `/jobs/air-export/:id?tab=invoices` |
| GRN list / new | `/warehouse/grns` · `/warehouse/grns/new` |
| GDO list / new | `/warehouse/gdos` · `/warehouse/gdos/new` |
| Storage charges | `/warehouse/storage` |
| Stock | `/warehouse/stock` |
| Staff invoices | `/invoices` · `/invoices/:id` |
| Portal invoices | `/portal/invoices` · `/portal/invoices/:id` |
