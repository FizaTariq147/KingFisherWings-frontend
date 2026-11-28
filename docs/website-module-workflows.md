# Kingfisher Website — Module Workflows (Implement Ready)

**Use this file to implement workflow copy, steps, and module pages on** [kingfishertec.com](https://www.kingfishertec.com/) / Platform.  
**Product reference:** KingFisher Wings (FreightNest).  
**Companion gap map:** [`website-platform-workflow-matching.md`](website-platform-workflow-matching.md)

---

## How the platform connects (use on every module page)

```
Enquiry → Quotation → Booking → Job → Documentation → Tracking → Customs / Delivery → Costing → Invoice → Reporting
```

Customers and vendors collaborate on the same continuum through dedicated portals. Staff stay on one job file per shipment.

**Suggested homepage / Platform intro line**

> From quotation to booking, documentation to delivery, every shipment moves through one connected freight platform — Air, Sea, NVOCC, Land & Courier, Customs, Warehouse, Tracking, Finance, and Reports.

---

# OPERATIONS

## 1. Air Freight

**Tagline:** Import & export air shipments — booking, AWB, flight milestones, and delivery on one job file.

**What you get:** House + Master jobs · HAWB / MAWB · Flight milestones · Pre-alert · Track & Trace · Costing & invoice

### Workflow — Air Export

1. Capture enquiry or convert an approved air quotation.
2. Create the **Air Export** job (department hub or quote convert).
3. Complete parties: shipper, consignee, notify, billing, agent.
4. Enter cargo dimensions, pieces, chargeable weight, and commodity.
5. Confirm airline, routing, flight number, and space / booking.
6. Issue or manage **HAWB / MAWB** (house and master as needed).
7. Generate pre-alert and operational documents from the job.
8. Update milestones: booked → cargo accepted → departed → in flight → arrived.
9. Track progress on job Track & Trace (and air cargo track by MAWB).
10. Post costs, review job P&L, generate sales / purchase invoices.
11. Confirm delivery / POD and close the job.

### Workflow — Air Import

1. Open or convert into an **Air Import** job from quote or booking.
2. Capture inbound MAWB / HAWB and flight arrival details.
3. Complete consignee, notify, and billing parties.
4. Record arrival, customs readiness, and delivery instructions.
5. Run clearance handoff if needed (see Customs Clearance).
6. Update milestones through arrival → cleared → out for delivery → delivered.
7. Cost, invoice, and close with POD on the same job file.

### Website chips / bullets

`Air Export` · `Air Import` · `HAWB / MAWB` · `Flight milestones` · `Pre-alert` · `POD`

### Network story (homepage style)

Warehouse → Origin airport → Airline uplift → Destination → Consignee (POD)

---

## 2. Sea Freight (FCL & LCL · Export & Import)

**Tagline:** Full-container and LCL ocean operations — vessels, containers, BL, VGM, cut-offs, customs, and delivery.

**What you get:** Booking · Containers · HBL / MBL · VGM · Cut-offs · Arrival Notice · DO · Costing

### Workflow — Sea Export (FCL)

1. Convert approved sea quotation or create a **Sea Export FCL** job.
2. Confirm POL / POD, vessel, voyage, ETD / ETA, and cut-offs.
3. Assign containers, seals, and stuffing plan.
4. Capture **VGM** and container numbers.
5. Issue **HBL / MBL** and export document pack.
6. Update milestones: booked → gated in → sailed → arrived (destination).
7. Cost ocean + local charges; invoice from the job; close after delivery confirmation.

### Workflow — Sea Export (LCL)

1. Create **Sea Export LCL** house booking(s) and link to master consolidation.
2. Consolidate cargo; manage CFS / warehouse handoff where used.
3. Apply prorated ocean and local costs across houses.
4. Issue house docs; master BL as applicable.
5. Sail → arrive → deliver per consignment; invoice and close.

### Workflow — Sea Import (FCL) — emphasize on site

1. Open **Sea Import FCL** job from quote, booking, or inbound advice.
2. Capture MBL / HBL, vessel, voyage, and ETA.
3. Issue / receive **Arrival Notice**.
4. Manage discharge, CY pickup, and container status.
5. File / track customs (BOE / entry) on the job or via Customs Clearance.
6. Issue **Delivery Order**; arrange inland haul if needed (Land & Courier).
7. Confirm empty return / delivery acknowledgement; cost, invoice, close.

### Workflow — Sea Import (LCL)

1. Create **Sea Import LCL** job for each house or master as your ops model requires.
2. CFS de-stuff / warehouse receive against the job.
3. Customs and DO per consignment.
4. Deliver to consignee; prorate costs; invoice and close.

### Website chips / bullets

`FCL Export` · `FCL Import` · `LCL Export` · `LCL Import` · `Containers` · `BL` · `VGM` · `Cut-offs` · `DO`

---

## 3. NVOCC

**Tagline:** Operate as the carrier — voyages, bookings, load lists, HBL, space, and voyage profitability.

**What you get:** Voyage control · Enquiry & booking · Load list · HBL · Pre-alert / DO · Voyage P&L

### Workflow

1. Maintain **vessel / voyage** master (ports, ETD / ETA, capacity context).
2. Capture NVOCC **enquiries**; price with NVOCC **tariffs**.
3. Create and manage **bookings** (portal-gated accept / compliance where enabled).
4. Convert booking into an executable NVOCC job.
5. Build the **load list** by vessel, voyage, container, origin, and destination.
6. Issue **HBL**, pre-alerts, and delivery orders from the job.
7. Track voyage execution and job milestones.
8. Review **voyage / job P&L**; invoice; close jobs.
9. Run NVOCC module reports for management.

### Website chips / bullets

`Voyages` · `Bookings` · `Load list` · `HBL` · `Space / utilization` · `Voyage P&L`

### Stage board (platform page style)

1. Space held  
2. HBL draft  
3. Load list locked  
4. Voyage P&L live  
5. Pre-alerts queued  

---

## 4. Land & Courier

**Tagline:** Road transport and courier movements — pickup, assignment, in-transit tracking, and POD.

**What you get:** Pickup · Vehicle / trucker assignment · In transit · Border (when used) · Delivery · POD

### Workflow

1. Create a **Road / Land / Courier** job from quote or department hub.
2. Set origin / destination, dates, freight terms, and vehicle type.
3. Assign trucker, driver, vehicle, and trailer (or pass job to Transport handoff).
4. Confirm pickup; update status to in transit.
5. For cross-border moves: capture declaration / HS / value; clear border milestones.
6. Optional bulk updates: truck position and transport charge uploads.
7. Deliver cargo; capture **POD** (date, received by, delivered by, remarks).
8. Cost, invoice, and close on the same job file.

### Website chips / bullets

`Road freight` · `Courier` · `Pickup` · `In transit` · `POD` · `Transport handoff`

**Website wording caution:** Position as land & courier **jobs + transport handoff**, not a full fleet TMS / routing engine.

---

## 5. Customs Clearance

**Tagline:** Declarations, exams, holds, and release — clearance stages on the operational shipment.

**What you get:** Docs checklist · HS classify · Declaration · Duty · Exam / hold · Cleared · DO · Invoice

### Workflow

1. Create a **Customs Clearance** job (or attach clearance to a freight job).
2. Open the file and complete the **documents checklist**.
3. Enter cargo lines and **classify HS** codes.
4. Prepare and file the **customs declaration** (BOE / entry).
5. Assess duties; raise duty payment request; mark duty paid.
6. Handle examination / queries / holds if raised.
7. Clear the shipment; issue **release / Delivery Order**.
8. Generate customs agency invoice; mark invoice-ready and close.
9. Customer can follow progress on the portal CC jobs view where invited.

### Website chips / bullets

`Declaration` · `Exam / Hold` · `Duty` · `Cleared` · `DO`

---

## 6. Documentation

**Tagline:** Shipment paperwork, BL / AWB workflows, pre-alerts, EDI, and operational uploads — on the job and in one docs hub.

**What you get:** Job document packs · Pre-alerts · Regional EDI · Bulk uploads · Charge templates · Closed-job DO / BL updates

### Workflow

1. From the live job, open **Documents** and section files for the shipment set.
2. Generate mode documents (HAWB, MAWB, HBL, MBL, Arrival Notice, DO, VGM, packing list, commercial invoice, POD, labels).
3. Send **pre-alerts** and share packs with customers / agents as needed.
4. Run regional **EDI / compliance** tools from the Documentation hub (e.g. BOE, Bayan, CCN, CGM, eQO, IAL, UAE MPCI).
5. Bulk-update ops data: container numbers, transport charges, truck positions, tracking file ingest.
6. Apply **charge templates** or **bulk cost entry** across jobs.
7. After close, update **DO** or **shipment / BL status** on closed jobs without reopening when required.
8. Review Documentation reports (job lists, ETA / ETD follow-up, and related ops lists).

### Website chips / bullets

`BL / AWB` · `Pre-alert` · `EDI` · `Bulk uploads` · `Charge templates` · `Closed-job updates`

---

## 7. Warehouse

**Tagline:** Receiving, handling, inventory, and release — warehouse / CFS activity connected to the freight job.

**What you get:** Gate-in · ASN → GRN · Inventory · GDO / GDN · Storage charges · Onward dispatch

### Workflow

1. Configure warehouse settings, SKUs / items, and storage rules.
2. Create an **ASN** for expected inbound cargo.
3. Gate-in / unload; system posts or creates **GRN** into stock lots.
4. Manage on-hand stock, lots, transfers, and low-stock visibility.
5. Create **GDO** for outbound dispatch (customer GDN where portal-enabled).
6. Calculate **storage** charges and raise draft invoices when due.
7. Link handling / storage back to the freight or warehouse job costing.
8. Release cargo to onward road delivery or delivery to consignee; close the loop on the job.

### Website chips / bullets

`Gate-in` · `Handling` · `Inventory` · `GDO` · `Storage` · `Onward dispatch`

---

## 8. General Trading

**Tagline (accurate for current product):** Connect external trading quote requests to freight quotations and jobs — commercial intent flows into logistics on one continuum.

**What you get today:** Quote-request integration (KFPP / KFQA) · Sync to quotations · Convert to freight jobs · Standard docs & settlement

### Workflow (integration continuum)

1. Enable the General Trading **quote-request** connection in tenant admin.
2. Sync inbound commercial quote requests from the trading site / provider.
3. Review and map each request into a staff **quotation**.
4. Customer / sales approve the freight quote.
5. Convert to the correct **operations job** (air, sea, land, etc.).
6. Execute documentation, tracking, costing, and settlement in standard modules.

### Website chips / bullets

`Quote-request bridge` · `Quotation` · `Freight job` · `Documents` · `Settlement`

**Implement note:** Do **not** present General Trading as a full buy/sell merchandising ERP equal to Air/Sea until a native GT module ships. Prefer “integration” language on the Platform module card.

---

## 9. Shipment Tracking

**Tagline:** One status story for ops, CS, and customers — milestones, movement, and delivery progress.

**What you get:** Job Track & Trace · CS tracking · Customer portal track · Public track / widget · POD close-out

### Workflow

1. Ops update **milestones** and shipment status on the job.
2. View the live timeline (and map when Maps is configured) on **Track & Trace**.
3. Customer Service monitors tracking desks and shipment lists.
4. Invited customers track on the **Customer Portal**.
5. Share **public Track** (or embeddable widget) with a job / shipment reference.
6. Ingest external position updates where used (e.g. air MAWB track, tracking file upload).
7. Close the continuum with **POD / delivery acknowledgement**.
8. Surface delays and exceptions in operations reports and dashboards.

### Website chips / bullets

`Milestones` · `Live track` · `Portal` · `Public track` · `POD`

---

# BUSINESS

## 10. Finance & Accounts

**Tagline:** Job costing through invoicing, receivables, payables, and the ledger — finance linked directly to operational jobs.

**What you get:** Job costing & P&L · Sales invoices · Purchase invoices · Credit / debit notes · AR / AP · Payments · GL · Financial statements

Treat as one continuum on the website (product UI splits Finance vs Accounts).

### Workflow — Costing → Invoice

1. Capture costs and revenue charges on the **job costing** tab (templates / bulk cost where used).
2. Review **job P&L** before billing.
3. Create **sales invoice** from the job (preferred) or manually.
4. Post invoice → generate PDF → send to customer.
5. Track partially paid / paid / overdue status.
6. Adjust with **credit notes** / **debit notes**; use payment requests and online pay links when enabled.
7. Raise **purchase invoices** from job costs or vendor submissions; post for AP.

### Workflow — AR / AP → Ledger

8. Allocate **AR / AP payments** against open invoices.
9. Work **aging** and open-item lists for collections and payables.
10. Manage cheques / PDC and bank reconciliation.
11. Post **vouchers**; maintain chart of accounts.
12. Run trial balance, P&L, balance sheet, cash flow, and VAT / MIS packs.

### Website chips / bullets

`Job costing` · `Sales invoice` · `Purchase invoice` · `AR / AP` · `Payments` · `GL` · `P&L`

### Continuum strip for site

`Quotation → Job → Costing → Invoice → Payment → Ledger → Report`

---

## 11. Reports & Analytics

**Tagline:** Turn operational and financial data into management reports — without stitching five spreadsheets.

**What you get:** Report formats catalogue · Ops KPI / exception packs · Sales & quotation analytics · Docs / NVOCC / HR reports · GL & MIS dashboards

### Workflow

1. Open the **Reports** hub and reporting dashboard.
2. Browse the **report formats catalogue** (quotation, AWB/BL, arrival notice, DO, invoice, WMS, ops lists, accounts).
3. Generate a format from a live quotation, job, or invoice so data fills automatically.
4. Run **operations** reports (e.g. DO not invoiced, job finance, exceptions, KPI, closed jobs, voyage lists).
5. Run **sales / quotation / documentation / NVOCC / HR** module reports as needed.
6. Open **finance & GL** analytics: aging, overdue, trial balance, P&L, MIS dashboard, saved reports.
7. Export or print management packs; feed exceptions back into ops and collections.

### Website chips / bullets

`Catalogue` · `Ops KPI` · `Job finance` · `Aging` · `MIS` · `Export / PDF`

---

# Optional supporting modules (short workflows for Platform grid)

Use these if the site still shows the full “20 modules” set.

## Sales & CRM

1. Log calls / leads.  
2. Create enquiry (mode-scoped).  
3. Follow up until quote-ready.  
4. Hand off to Quotations.

## Customers & Parties

1. Create party (customer, shipper, consignee, agent…).  
2. Add contacts, addresses, credit.  
3. Invite Customer Portal user when needed.

## Vendors

1. Maintain vendor / carrier party.  
2. Invite Vendor Portal user.  
3. Receive costs / invoices via portal → AP.

## Quotations

1. Create quotation from enquiry or blank.  
2. Price lines / tariffs / online quote.  
3. Send → negotiate → approve.  
4. Convert to booking / job.

## Management

1. Open management dashboard / MIS.  
2. Review user performance and complaints.  
3. Drill into ops or finance exceptions.

## HR

1. Maintain employee master.  
2. Leave / timesheets / payroll as configured.  
3. HR letters and HR reports.

## Masters & Configuration

1. Configure ports, carriers, charge codes, vessels, etc.  
2. Set organization profile and number formats.  
3. Enable modules and integrations.

## Administration & Access

1. Tenant Admin creates staff users and roles.  
2. Assign permissions / visibility flags.  
3. Enforce login security; SuperAdmin provisions companies / tenants.

---

# Website implementation helpers

## Suggested Platform filter groups

| Filter | Modules |
|--------|---------|
| **Operations** | Air Freight, Sea Freight, NVOCC, Land & Courier, Customs Clearance, Documentation, Warehouse, General Trading, Shipment Tracking |
| **Business** | Finance & Accounts, Reports & Analytics (+ Sales & CRM, Customers & Parties, Vendors, Quotations, Management if shown) |
| **Administration** | HR, Masters & Configuration, Administration & Access |

## Suggested module card template

| Field | Content |
|-------|---------|
| Title | Module name |
| One-liner | Tagline from this doc |
| Chips | Website chips list |
| Steps | 4–6 short steps (compress the numbered workflows) |
| CTA | “See workflow” / “Book demo” |

## Compress example (Air Freight card)

**Title:** Air Freight  
**Line:** Import & export — AWB, flight milestones, and delivery on one job.  
**Chips:** Air Export · Air Import · HAWB/MAWB · Pre-alert  
**Steps:** Quote → Book job → Issue AWB → Flight milestones → Track → Invoice & deliver  

## Compress example (Finance & Accounts card)

**Title:** Finance & Accounts  
**Line:** Costing to ledger — invoices, AR/AP, and P&L linked to every job.  
**Chips:** Costing · Invoice · AR/AP · GL · P&L  
**Steps:** Cost job → Invoice → Collect / pay → Post to ledger → Report  

---

## Document control

| Field | Value |
|-------|--------|
| Audience | Website / marketing implementation |
| Detail level | Full workflows + compressible card copy |
| Accuracy notes | General Trading = integration; Land & Courier ≠ full TMS |
| Refresh when | Product modules or site Platform list change |
