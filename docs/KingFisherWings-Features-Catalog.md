# KingFisher Tech Gold — Product Features Catalog

**Document type:** Client / demo features PDF source  
**Product:** KingFisher Wings / KingFisher Tech Gold freight-forwarding ERP  
**Audience:** Stakeholders, demos, onboarding  

---

## 1. Product overview

**KingFisher Tech Gold** is a multi-tenant freight-forwarding ERP for logistics companies. It covers the full commercial-to-operations continuum in one workspace: CRM enquiries, quotations, multi-mode jobs (air, sea FCL/LCL, road/land/courier, customs clearance, NVOCC, warehouse), shipments, documentation and EDI, costing, AR/AP finance, GL accounts, HR, and warehouse (WMS).

Platform hierarchy is explicit:

**SuperAdmin → Company → Tenant → Tenant Admin → Staff users**

Staff roles include Sales, Customer Service, Operations, Finance, Branch Manager, Documentation, Warehouse, HR, and other scoped roles. Separate **Customer Portal** and **Vendor Portal** give parties self-service booking, tracking, billing, and vendor costing without ERP staff credentials.

Public surfaces include **Track**, embeddable **Track widget**, and **Pay** (token payment link), plus invite/accept flows for staff, portal, and vendor users.

---

## 2. Who uses it

| Layer | Who | Sign-in | Owns |
|--------|-----|---------|------|
| **SuperAdmin** | Platform operator | SuperAdmin login | Companies, Tenants, platform billing. Does **not** manage tenant staff users. |
| **Company** | Legal entity | Managed by SuperAdmin | Parent of one or more tenant workspaces |
| **Tenant** | Workspace | — | Isolated data, branding, enabled modules |
| **Tenant Admin** | Workspace owner | Company Admin login | Users, Organization, Masters, Billing Plans, Public API, Stripe, integrations |
| **Branch Manager** | Broad ops staff | Staff login | Wide ops access; not full Users admin unless also Tenant Admin |
| **Sales** | Sales manager / executive | Staff login | Sales / CRM, Quotations |
| **Customer Service** | Support staff | Staff login | Customer Services, Parties / portal users |
| **Operations** | Ops manager / executive | Staff login | Department hubs, Jobs, Docs, NVOCC, Shipments, Transport |
| **Finance** | Finance manager / accountant | Staff login | AR invoices, purchase invoices, notes, payments, GL |
| **Warehouse / HR / Docs** | Specialized staff | Staff login | WMS, HR, Documentation / EDI |
| **Customer portal user** | Invited on a non-vendor party | Customer Portal login | Booking, track, jobs, quotes, invoices, documents, messages |
| **Vendor portal user** | Invited on Supplier/Vendor party | Vendor Portal login | Job offers, invoices, payments, advances, TDS, disputes |

**Login separation:** Company Admin · Staff/User · Customer Portal · Vendor Portal · Super Admin — separate shells.

---

## 3. Platform / SuperAdmin features

### Platform Overview
- Provisioning guidance: Register company → Create tenant
- Tenant statistics (total / active / inactive / trial / MRR)
- Shortcuts to Companies and Tenants

### Companies
- List, create (wizard), detail, edit
- Company registry required before tenant creation

### Tenants
- List, create (wizard), detail, edit
- **Features panel:** enable/disable modules (Operations, Shipments, Sales, Parties, Vendor Services, Finance, Masters, Admin, HR, Warehouse/WMS, Transport, NVOCC, Documentation, Support, Logistics)
- Subscription / limits context

### Platform Billing
- **Plans** — subscription plans
- **Invoices** — platform invoices by tenant; payments / manual payment
- **Payments** — verify, reject, refund
- **Webhooks** — Stripe events and replay

---

## 4. Tenant Admin features

| Area | Capabilities |
|------|----------------|
| **Users** | Create/edit staff; role wizard; functional flags (salesperson, CS, ops, finance); visibility flags (sales, cost, GP, invoices, payments, AR/AP, reports, job P&L) |
| **Organization** | Profile, bank accounts, number formats, job date, costing settings |
| **Masters** | Full master-data catalog (see Masters section) |
| **Quote Requests** | External quote-request bridge admin |
| **Billing Plans** | Tenant platform subscription, invoices, payments |
| **Public API** | API keys, webhooks, API billing |
| **Online Payments / Stripe** | Gateway settings, webhook rotation, reconciliation |
| **Login Security** | IP / MAC / office-hours restrictions |
| **Portal / Vendor admin** | Portal Inbox, Customer Portal Users, Vendor Portal Users, Vendor Disputes |

Tenant Admin sees all modules SuperAdmin has enabled for the tenant.

---

## 5. Staff / ERP modules

### Dashboard
- KPIs (jobs, quotes, receivables, delivered)
- Active shipments grid
- Report cards (receivables aging, lane profitability, operator productivity, customs delay, and more)
- Period filters; department-scoped counts from staff grants

### Sales / CRM
- Call Sheet
- Client Request List *(partial)*
- Leads (list / create / detail)
- Follow-ups
- Enquiries (list / create / detail — mode-scoped from department hubs)
- Rate Charges *(partial)*
- Sales Budget
- Sales Dashboard
- Email Marketing
- Jobs List-Sales
- Visiting Card List Report *(partial)*
- Reports - Sales

### Quotations
- All Quotations (list / create / edit / detail; department filter)
- Online Quote
- Service catalog
- Online Tariff Master
- Zip Distance Master
- Reports - Quotation
- Statuses: Draft → Submitted → Internally approved / Rejected → Sent → Customer review → Negotiating → Approved / Expired / Converted
- PDF generation; convert-to-job; portal-linked lifecycle

### Jobs (multi-mode)
**Department hubs** (Jobs · Shipments · Enquiries · Quotations):
- Air Export / Air Import
- Sea Export / Sea Import (FCL + LCL)
- Road Freight (Road / Land / Courier)
- Customs Clearance
- NVOCC (dedicated module menu)

**Job capabilities:**
- Create Job wizard for AIR, SEA FCL/LCL, ROAD/LAND/COURIER, CUSTOMS, NVOCC, SERVICE_JOB, WAREHOUSE
- All jobs / On hold / Barcode scan
- **Show All** (default aggregate edit surface)
- Tabs: Info, Party, Dimensions, Containers, MAWB (air), Costing, History, Shipments, Department, Exchange rate, Routing, Customs, Shipping bill / BOE, Booking form, Delivery acknowledgement, Job ledger, **Track & Trace**, Section files
- Actions: Documents, Invoices, P&L, Milestones, Notes, Vendor offers, Logistics, GPUM, Vouchers, Cargo, Bills of lading / Airway Bill, Stuffing (FCL), Sea scans, Port token, House jobs, CC panels
- Lifecycle: change status (catalog), stop/hold, resume, reopen, close, cancel, copy

### Shipments
- All Shipments (ops list / create / detail)
- Show All / status catalog / party patterns aligned with jobs
- Customer Services shipment views

### Track & Trace
- Job Track & Trace tab (timeline + map)
- Customer Services Shipment Tracking
- Public Track + embeddable widget
- Portal Track
- Cargo Tracking - Air (MAWB)
- Tracking profile editor; barcode scan

### Customs
- Customs Clearance hub (docs → classify → file → duty → clear → invoice → close)
- Job Customs / BOE tabs; CC Details, Lines, Checklist, Declaration, Queries, CC Finance
- Portal customs clearance jobs
- BOE Dashboard, UAE MPCI, Bayan / eQO / IAL EDI tools

### Documents
- Job Documents (HAWB, MAWB, HBL, MBL, DO, arrival notice, packing list, commercial invoice, VGM, POD, labels, job card / P&L / costing, and more)
- Section files
- Report formats catalogue (FRESA-parity PDF formats)

### Containers
- Planned / actual containers; stuffing (FCL); sea scans
- Container upload tools; Container Type / Inventory masters

### Costing / Charges
- Job Costing tab; charge templates; bulk cost entry
- Cost / GP / P&L visibility flags
- Organization costing settings

### Finance — Sales invoices (AR)
- All Invoices, Overdue, Credit Notes, Debit Notes, Payment Requests, Online Payments
- Create: Manual Invoice or Create from Job
- Draft → Post → Generate PDF → Send → Partially paid → Paid
- Cancel / Void where allowed
- Job Invoices panel for job-linked AR

### Finance — Purchase invoices (AP)
- All Purchase Invoices (manual or from job)
- Draft / Submitted → Post (posted PIs appear on vendor portal)
- Payment proofs; Payment Requests; Advances; TDS
- AP aging / open items / statements

### EDI / Documentation
- BOE Dashboard
- Bayan EDI (job / house shipment)
- CCN FWB/FHL EDI
- CGM EDI Vessel List
- Dubai eQO / Oman eQO
- IAL EDI
- UAE MPCI Monitor
- Agent EDI; tracking / truck / DO uploads
- Reports - Docs

### Mode-specific highlights

| Mode | Highlights |
|------|------------|
| **Air** | MAWB tab; Airway Bill; AWB Stock; air cargo tracking |
| **Sea** | Containers, stuffing, B/L, sea scans; sailing schedule |
| **Road / Land / Courier** | Door/land fields; truckers; truck position upload |
| **Customs Clearance** | Dedicated hub + CC action panels + portal CC jobs |
| **Warehouse (WMS)** | Ops board, ASN → GRN, GDO, stock, storage charges → draft invoices *(some advanced steps partial)* |
| **NVOCC** | Jobs, tariffs, bookings, enquiries, load list, vessel/voyage, reports |

### Masters (examples)
Airlines, Airports, Banks, Branches, Charge Codes, Container Types, Air Pallet Types, Courier Vendors, Country, Currency, Departments, Designation, Exchange Rates, Holidays, HS Codes, Ports / Seaport / Landport, Shipping Lines, Tax Rates, Truckers, UOM, Vessels, Warehouses, AWB Stock, Commodity, Contacts, Activity Master, and more.

### Parties / Customer & Vendor Services
- Parties CRUD: addresses, contacts, credit, KYC, EDI & charges, portal/vendor users
- Party types: Customer, Agent, Airline, Shipping Line, Trucker, Customs Broker, CFS/Port Agent, Warehouse, Supplier, Vendor, Overseas Agent, Other
- Customer Services: Portal Inbox, Portal Users, Shipments, Enquiry Sheet, Pricing, Sailing Schedule, Agent EDI, Costing Search, Tracking
- Vendor Services: Vendor Disputes, Vendor Portal Users

### Accounts (GL)
- AR/AP payments, aging, open items, statements
- Cheques / PDC; bank reconciliation
- Chart of Accounts, Account Tree, Trial Balance
- All Vouchers; Financial Reports; MIS Dashboard

### HR
- Employee Master, Leave, Timesheets, Payroll, Loans, Performance, HR Letters, Reports

### Management / Settings
- All Jobs-MIS, Complaints, Data Backup Export, Management Dashboard, User Access, User-wise performance
- My Profile, Sessions, Password, Login Security, Public API, Stripe, Billing Plans, Notifications

---

## 6. Customer portal features

| Area | Features |
|------|----------|
| **Dashboard** | Home overview |
| **Booking** | Multi-step book/quote wizard |
| **Track** | Shipment / job tracking |
| **Jobs** | Shipment list & detail |
| **Customs clearance** | CC jobs list & detail |
| **Quotes** | List, detail, edit/book |
| **Invoices** | List & detail; pay where enabled |
| **Credit / Debit notes** | List & detail |
| **Payments / Credit** | History, credit summary, credit requests |
| **Documents** | Downloadable documents |
| **Messages / Disputes / Alerts** | Messaging, disputes, notifications |
| **Account / Tools** | Profile, unit converters, verification |

Public adjuncts: `/track`, `/track/widget`, `/pay/:token`.

---

## 7. Vendor portal features

| Area | Features |
|------|----------|
| **Home** | Vendor dashboard |
| **Jobs** | Cost pricing offers (customer sell prices hidden) |
| **Invoices** | Submit / view invoices into AP flow |
| **Payments / Advances / Schedule / Statement** | Settlement views |
| **% TDS** | TDS view |
| **Payment requests** | List & detail |
| **Credit notes / Disputes / Alerts** | Adjustments and support |
| **Account / Tools / Verification** | Account settings and KYC |

---

## 8. Invoice workflow

### Sales AR (customer invoices)
1. Create from **Finance → All Invoices** (Manual or From Job) or from **Job → Invoices**
2. Save as **Draft**; edit charge lines
3. **Post** (accounting commitment)
4. **Generate PDF**
5. **Send** (email + PDF) → Sent
6. Collect via Online Payments / Stripe and/or GL AR payments → Partially paid → Paid
7. Adjust with Credit / Debit Notes; chase via Overdue list
8. Customer sees posted/sent invoices in the Customer Portal

### Purchase AP (purchase invoices)
1. Staff create Manual / From Job, **or** vendor submits via Vendor Portal
2. Draft / Submitted while editable / awaiting finance
3. Staff **Post** → Posted (visible on vendor portal)
4. Attach / review **payment proofs**
5. Pay via GL Payments, Payment Requests, Advances; apply TDS as needed
6. Control via AP Aging / open items / statements

---

## 9. Notable differentiators

- **Multi-mode freight in one ERP** — Air, Sea FCL/LCL, Road/Land/Courier, Customs, NVOCC, Warehouse
- **Show All** — Aggregate job/shipment edit instead of tab-by-tab only
- **Status catalog** — Tenant-defined statuses; create and apply in one step
- **CLIENT ≠ CUSTOMER** — Commercial Client and deal Customer stay separate party roles
- **API-driven job tabs** — Tab strip and actions follow backend metadata / permissions
- **Three portals + public track/pay** — Staff ERP, Customer Portal, Vendor Portal, anonymous track/pay
- **Party-gated portal type** — Supplier/Vendor → Vendor Portal; others → Customer Portal
- **SuperAdmin module allow-list** — Per-tenant enabled modules gate whole menu families
- **Staff access model** — Functional flags + visibility flags + permission matrix
- **FRESA-parity report catalogue** — Large document format library
- **Regional EDI pack** — Bayan, eQO, IAL, CCN, CGM, UAE MPCI, agent EDI
- **Vendor costing privacy** — Vendor never sees customer sell prices
- **Ops continuum + tracking profile** — Continuum rail and editable Track & Trace profiles

---

## 10. Document notes

- Features map to routed pages and user-visible menu titles in the current frontend.
- Items marked **(partial)** have UI entry points that are placeholders, reuse another screen, or have limited capability.
- This file is the source for the demo PDF — export via Google Docs / Word → Download as PDF.

---

*KingFisher Tech Gold — Features Catalog*  
*Prepared for demo / stakeholder sharing*
