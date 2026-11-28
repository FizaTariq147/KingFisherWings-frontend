# Kingfishertec.com Platform — Workflow Matching & Gap Analysis

**Website:** [https://www.kingfishertec.com/](https://www.kingfishertec.com/) · Platform: [https://www.kingfishertec.com/platform](https://www.kingfishertec.com/platform)  
**Product under analysis:** KingFisher Wings / FreightNest frontend (`KingFisherWings-frontend`)  
**Purpose:** Match every **Platform** module and homepage flow claim to live product workflows; flag gaps for website copy, demos, and roadmap.  
**Sources:** Site Platform module list (“20 modules”), eight mode flows, continuum CRM→Finance→Portals; FE menus/router; [`docs/KingFisherWings-Features-Catalog.md`](KingFisherWings-Features-Catalog.md).

**Match legend**

| Status | Meaning |
|--------|---------|
| **Match** | Website claim has a clear FE workflow and routes |
| **Partial** | Module exists but depth is thinner than site wording |
| **Gap** | Claimed as a platform module / flow with no (or only bridge) product surface |
| **Adjacent** | Delivered outside the named module (portal, SuperAdmin, public track) |

---

## 1. Website Platform inventory (authoritative list)

From homepage **“20 modules. One platform”** filters (Business / Operations / Administration) and `/platform`:

### Business

| # | Website module | Website path hint |
|---|----------------|-------------------|
| 1 | Sales & CRM | `/sales` |
| 2 | Customers & Parties | `/customers` · `/parties` |
| 3 | Vendors | `/vendors` |
| 4 | Quotations | `/quotations` |
| 14 | Management | `/management` |
| 15 | Finance | `/finance` |
| 16 | Accounts | `/accounts` |
| 17 | Reports & Analytics | `/reports` |

### Operations

| # | Website module | Website path hint |
|---|----------------|-------------------|
| 5 | Air Freight | `/jobs/air-export` (+ import) |
| 6 | Sea Freight | `/jobs/sea-export` · `/jobs/sea-import` |
| 7 | NVOCC | `/nvocc` |
| 8 | Transport | `/operations/transport-requests` |
| 9 | Customs Clearance | `/customs-clearance` (FE: `/jobs/customs-clearance`) |
| 10 | Documentation | `/documentation` |
| 11 | Shipment Tracking | Job milestones (+ CS / public / portal) |
| 12 | Warehouse | `/warehouse` |
| 13 | General Trading | `/platform/general-trading` |

### Administration

| # | Website module | Website path hint |
|---|----------------|-------------------|
| 18 | HR | `/hr` |
| 19 | Masters & Configuration | `/masters` · `/organization` · `/settings` |
| 20 | Administration & Access | `/admin/users` |

### Homepage mode flows (“Eight flows. One platform”)

| Flow | Website promise |
|------|-----------------|
| Air Freight | Booking → HAWB/MAWB → flight → pre-alert → delivery |
| Sea FCL | Booking → containers → BL → VGM → cut-offs → customs → delivery |
| Sea LCL | House + master → consolidation → CFS → prorated cost → delivery |
| NVOCC | Voyages → bookings → load list → HBL → space / voyage P&L |
| Land & Courier | Pickup → in transit → delivery → POD |
| Warehouse | Gate-in → handling → inventory → onward dispatch |
| Customs Clearance | Declaration → exam/hold → cleared → DO |
| General Trading | PO/SO ↔ freight jobs · quotes · docs · settlement |

### Continuum (site narrative)

`Enquiry → Quotation → Booking → Job → Documentation → Tracking → Customs → Delivery → Costing → Reporting`  
Plus: **CRM → Quote → Job → Docs → Finance → Portals**.

---

## 2. End-to-end continuum match

| Pipeline step (website) | Product workflow | Status |
|-------------------------|------------------|--------|
| Enquiry | Sales CRM enquiries / leads / follow-ups | **Match** |
| Quotation | Quotations module (+ online / tariff) | **Match** |
| Booking | Job create from quote / dept hubs; NVOCC bookings | **Match** |
| Job | Multi-mode jobs (air/sea/road/CC/warehouse/NVOCC) | **Match** |
| Trading | Quote-request integration only (KFPP/KFQA) | **Gap** as module |
| Documentation | Job docs + Documentation hub (EDI, DO, uploads) | **Match** |
| Tracking | Job Track & Trace, CS tracking, public `/track`, portal | **Match** |
| Customs | Customs clearance jobs + job customs/EDI | **Match** |
| Delivery | Milestones / DO / POD / closed-job DO-BL tools | **Match** (POD depth varies by mode) |
| Costing | Job costing, charge templates, bulk cost, P&L | **Match** |
| Reporting | Reports catalogue + module/GL/MIS hubs | **Match** |
| Finance → Portals | AR/AP + Customer / Vendor portals | **Match** |

---

## 3. Module-by-module workflow matching

### 3.1 Sales & CRM — **Partial**

| Website claim | FE workflow | Notes |
|---------------|-------------|-------|
| Leads, follow-ups, sales activity | `/sales/lead`, `/sales/follow-ups`, call sheet, enquiries | Match |
| Customer opportunities → ops | Enquiry → Quotation → Job | Match |
| Full sales desk | Rate charges, client request list, visiting cards | **Partial** tiles |

**Website matching tip:** Prefer “CRM enquiries, leads, follow-ups and sales handoff to quotations” over implying every sales tile is complete.

---

### 3.2 Customers & Parties — **Match**

| Website claim | FE workflow | Notes |
|---------------|-------------|-------|
| Customers, shippers, consignees, agents | Parties CRUD `/parties` | Match |
| Business parties centralization | Types, contacts, credit, KYC | Match |
| Customer collaboration | Portal invite + CS `/customers` hub | Match; `/customers/:id` still thin |

**Website matching tip:** Route visitors to **Parties** as master data; Customer Services for CS ops + portal admin.

---

### 3.3 Vendors — **Partial**

| Website claim | FE workflow | Notes |
|---------------|-------------|-------|
| Carriers / vendors / partners | Party type Vendor/Supplier | Match (master in Parties) |
| Dedicated vendor module | Staff `/vendors` = portal users + disputes | **Partial** hub |
| Vendor collaboration | Vendor Portal (jobs, invoices, payments, TDS…) | **Adjacent — Match** |

**Website matching tip:** Position Vendors as “party master + vendor portal,” not a separate vendor ERP suite.

---

### 3.4 Quotations — **Match**

| Website claim | FE workflow | Notes |
|---------------|-------------|-------|
| Create / manage / convert to jobs | `/quotations` lifecycle | Match |
| Accept / reject / negotiate (portal continuum) | Portal quotes | Match |
| Rate / tariff / online quote | Tariff master, online quote, service catalog | Match |

---

### 3.5 Air Freight — **Match**

| Website claim | FE workflow | Notes |
|---------------|-------------|-------|
| Air export & import | Dept hubs + `/jobs/air-export` · `air-import` | Match |
| AWB / HAWB / MAWB | Job air panels + documents | Match |
| Flight milestones / booking | Show All, Track & Trace, milestones | Match |
| House + Master jobs | Job model + house/sub-jobs | Match |

Aligns with homepage **Air Freight** flow.

---

### 3.6 Sea Freight — **Match**

| Website claim | FE workflow | Notes |
|---------------|-------------|-------|
| FCL & LCL import/export | Sea dept hubs + sea job types | Match |
| Containers, vessels, BL, VGM, cut-offs | Containers / sea detail / docs / VGM fields | Match |
| Consolidation / CFS (LCL) | LCL jobs + warehouse/CFS overlap | Match (CFS depth = warehouse/job, not separate CFS product) |

Aligns with **Sea FCL** and **Sea LCL** flows (CFS wording should stay job/warehouse-linked).

---

### 3.7 NVOCC — **Match**

| Website claim | FE workflow | Notes |
|---------------|-------------|-------|
| Voyages, bookings, load lists | `/nvocc` voyages, bookings, load-list | Match |
| HBL, pre-alerts, DOs | Job/docs + NVOCC ops | Match |
| Space utilization / voyage P&L | Voyage master + reports / P&L | Match (utilization depth = Partial if sold as advanced yield tool) |

Aligns with `/platform` voyage board story.

---

### 3.8 Transport (Land & Courier) — **Partial**

| Website claim | FE workflow | Notes |
|---------------|-------------|-------|
| Road / trucking / courier | `/jobs/road-freight` + Road Freight dept | Match as job mode |
| Transport requests, vehicle assignment | `/operations/transport-requests`, job handoff | **Partial** TMS |
| Pickup → delivery → POD | Milestones / handoff / POD docs | Partial vs full dispatch TMS |
| Fleet / routing / live dispatch board | — | **Gap** |

**Website matching tip:** “Land & Courier jobs + transport handoff” — avoid promising fleet TMS.

---

### 3.9 Customs Clearance — **Match**

| Website claim | FE workflow | Notes |
|---------------|-------------|-------|
| Declarations, exams, holds, release on job | CC jobs + customs tabs | Match |
| Visible to ops/CS | Shared job file | Match |
| Regional filings | Documentation EDI (BOE, Bayan, MPCI, eQO, IAL…) | **Adjacent — Match** |

Not a full customs-broker license product; forwarder CC workflow **Match**.

---

### 3.10 Documentation — **Match**

| Website claim | FE workflow | Notes |
|---------------|-------------|-------|
| BL/AWB, pre-alerts, operational paperwork | Job documents + Documentation hub | Match |
| Docs on the job file | Job Documents / section files | Match |
| EDI / compliance tooling | Bayan, CCN, CGM, MPCI, uploads, closed DO/BL | Match (region-specific) |

---

### 3.11 Shipment Tracking — **Match**

| Website claim | FE workflow | Notes |
|---------------|-------------|-------|
| Milestones / movement / delivery | Job Track & Trace | Match |
| One status for ops, CS, customers | CS tracking + portal + public `/track` | Match |
| Map / live track | Google Maps JS when `VITE_GOOGLE_MAPS_API_KEY` set | Match (config-dependent) |

---

### 3.12 Warehouse — **Partial → Match (core)**

| Website claim | FE workflow | Notes |
|---------------|-------------|-------|
| Receiving, handling, inventory, release | ASN → GRN → stock → GDO `/warehouse` | Match core |
| Connected to freight jobs | WAREHOUSE job type + masters | Match |
| Advanced WMS (complex putaway/rules) | Settings / storage slabs | **Partial** |

Aligns with Warehouse flow if copy stays “cargo handling on the job / WMS lite–mid.”

---

### 3.13 General Trading — **Gap**

| Website claim | FE workflow | Notes |
|---------------|-------------|-------|
| Buy/sell/import/export commercial control | — | No GT ERP module |
| Connect PO/SO to freight jobs | Admin Quote Requests bridge (KFPP/KFQA) | Integration only |
| Site path `/platform/general-trading` | Not a first-class FE app module | **Gap** |

**Website matching tip:** Label as “General Trading **integration** (quote-request bridge)” until a native GT module ships — highest website risk.

---

### 3.14 Management — **Partial → Match**

| Website claim | FE workflow | Notes |
|---------------|-------------|-------|
| Consolidated ops / performance view | `/management` dashboard, MIS, user performance | Match UI |
| Complaints / backup / user access | Present under Management | Match; BE depth varies |

---

### 3.15 Finance — **Match**

| Website claim | FE workflow | Notes |
|---------------|-------------|-------|
| Job costing, expenses, revenue, profitability | Job costing + invoices + P&L | Match |
| AR invoices, notes, payment requests | `/finance` · invoices · CN/DN · payment requests | Match |
| Online payments | Stripe / pay token | Match |

---

### 3.16 Accounts — **Match**

| Website claim | FE workflow | Notes |
|---------------|-------------|-------|
| Accounting, AR/AP, ledgers | `/accounts` + `/gl/*` | Match |
| Aging, open items, vouchers, CoA, TB, BS, P&L | GL menus | Match |
| Bank recon / PDC | Present | Match |

Site often merges “Finance & Accounts” on `/platform` — product correctly splits **Finance** (ops AR/AP docs) vs **Accounts** (GL).

---

### 3.17 Reports & Analytics — **Match**

| Website claim | FE workflow | Notes |
|---------------|-------------|-------|
| Management reports without CSV sprawl | `/reports` catalogue + module hubs | Match |
| Ops / sales / docs / NVOCC / HR / GL | Per-module report pages | Match (some formats still partial) |

---

### 3.18 HR — **Partial → Match**

| Website claim | FE workflow | Notes |
|---------------|-------------|-------|
| Employee records / HR ops | `/hr` employee, leave, timesheets, payroll, loans, letters | Match mid-market HR |
| Full HCM (recruitment, biometric attendance) | — | **Gap** vs enterprise HCM claims |

---

### 3.19 Masters & Configuration — **Match**

| Website claim | FE workflow | Notes |
|---------------|-------------|-------|
| Operational masters | `/masters` (50+ resources) | Match |
| Organization settings | `/organization` | Match |
| System behavior / tools | `/settings` | Match |

---

### 3.20 Administration & Access — **Match**

| Website claim | FE workflow | Notes |
|---------------|-------------|-------|
| Users, roles, permissions | Tenant Admin `/admin/users` | Match |
| Multi-company / multi-tenant | SuperAdmin companies/tenants + module flags | **Adjacent — Match** |
| Separate customer/vendor portals | Portal logins + rights | Match |

Hierarchy for site accuracy: **SuperAdmin → Company → Tenant → Tenant Admin → Staff** (do not conflate SuperAdmin with Tenant Admin).

---

## 4. Surfaces the website implies but lists outside the “20”

| Surface | Website mention | Product | Status |
|---------|-----------------|---------|--------|
| Customer Portal | Continuum step “Portals” | `/portal/*` | **Match** |
| Vendor Portal | Portals + vendors | `/vendor/*` | **Match** |
| Public Track | Tracking / no blind spots | `/track`, widget | **Match** |
| SuperAdmin / multi-tenant | Multi-company | `/superadmin/*` | **Match** |
| Land & Courier (eighth flow) | Mode flow | Road Freight jobs + Transport | **Partial** (see §3.8) |

---

## 5. Priority gap list (for website workflow matching)

Use this when editing kingfishertec.com copy or the Platform module picker.

| Priority | Website item | Product reality | Recommended website action |
|----------|--------------|-----------------|----------------------------|
| P0 | **General Trading** module | Quote-request **integration** only | Downgrade to “Integration” or hide until native GT; do not show as equal to Air/Sea |
| P0 | Full **TMS** under Transport / Land & Courier | Handoff queue + road jobs | Soften to “Land & Courier jobs and transport handoff” |
| P1 | Dedicated **Vendors** module depth | Parties + portal users + disputes | “Vendor parties & vendor portal” |
| P1 | Sales tiles implied complete | Some Sales tiles partial | Name lead → enquiry → quote as core; omit unfinished tools |
| P1 | Warehouse as full WMS | Core ASN/GRN/GDO/stock | “Warehouse handling connected to jobs” |
| P2 | NVOCC “space utilization” as advanced yield | Voyages + P&L present | Keep “voyage control & profitability”; avoid airline-style space RMS |
| P2 | CFS as standalone product | LCL + warehouse | “CFS handling via LCL/warehouse workflows” |
| P2 | HR as enterprise HCM | Mid-market HR | Keep “HR for logistics teams” |
| P3 | Report “no CSV ever” | Strong catalogue; some formats partial | “Unified reports catalogue” |

---

## 6. Workflow matching checklist (demo / sales)

For each Platform checkbox on the site, open this FE path and walk the claim:

| Module | Open in product | Happy-path script |
|--------|-----------------|-------------------|
| Sales & CRM | `/sales` → Lead → Enquiry → Follow-up | Create enquiry → convert to quotation |
| Customers & Parties | `/parties` | Create shipper/consignee; invite portal user |
| Vendors | `/parties` (Vendor) + `/vendor-users` | Invite vendor; open Vendor Portal |
| Quotations | `/quotations/new` | Quote → convert to job |
| Air Freight | `/departments/air-export` → job | Booking → AWB → milestones → track |
| Sea Freight | `/departments/sea-export` | Container → BL/VGM → docs |
| NVOCC | `/nvocc` | Voyage → booking → load list |
| Transport | `/operations/transport-requests` | Pass job to transport / road job |
| Customs Clearance | `/jobs/customs-clearance` | CC stages on job |
| Documentation | `/documentation` | EDI or DO update tile |
| Shipment Tracking | Job Track & Trace + `/track` | Staff + public same reference |
| Warehouse | `/warehouse` | ASN → GRN → stock |
| General Trading | `/admin/integrations/quote-requests` | Show bridge only — **do not demo as GT ERP** |
| Management | `/management` | Dashboard / MIS |
| Finance | `/finance` → invoice from job | Draft → post → PDF |
| Accounts | `/gl/accounts` / aging | AR/AP / trial balance |
| Reports | `/reports/catalog` | Run one ops + one finance report |
| HR | `/hr` | Employee + leave |
| Masters | `/masters` | Port / charge code |
| Admin & Access | `/admin/users` | Create staff user + role |

---

## 7. Summary scorecard

| Bucket | Count (of 20 site modules) |
|--------|----------------------------|
| **Match** | ~14 (Quotations, Parties, Air, Sea, NVOCC, Customs, Documentation, Tracking, Finance, Accounts, Reports, Masters, Admin, core Warehouse/Management) |
| **Partial** | ~5 (Sales, Vendors, Transport/Land, Warehouse advanced, HR vs HCM) |
| **Gap** | **1 critical — General Trading** as a first-class module |

**Overall:** The website’s freight continuum and most of the 20-module stack align with KingFisher Wings. The largest website/product mismatch is **General Trading**; the largest oversell risk is **Transport as full TMS**. Keep portal, public track, and SuperAdmin as adjacent Platform strengths — they support site security/portal claims even though they are not numbered in the “20 modules” grid.

---

## 8. Document control

| Field | Value |
|-------|--------|
| Created for | Website ↔ product workflow matching |
| FE repo | `KingFisherWings-frontend` |
| Refresh when | Platform module list on kingfishertec.com changes, or GT/Transport modules ship |
| Do not use | Outdated `docs/modules.md` alone for maturity claims |
