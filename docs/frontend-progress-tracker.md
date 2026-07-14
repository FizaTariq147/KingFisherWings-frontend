# Kingfisher Frontend — Progress Tracker

> **Source of truth for requirements:**  
> - Feature Spec: `d:\Crew innovations\Complete-feature specification.md`  
> - Milestones (roadmap only): `d:\Crew innovations\KingFishersWingsscopeofwork.md`  
>
> **Source of truth for progress:** this file + actual `src/` code + your instructions.  
> Milestone order does **not** imply completion status.

**Last updated:** 2026-07-14  
**Overall FE completion (Spec-weighted estimate):** ~40%

---

## Status legend

| Status | Meaning |
|--------|---------|
| **Completed** | Usable CRUD (or equivalent) wired to APIs; not a shell/placeholder |
| **In Progress** | Active work; partial UI or API coverage |
| **Pending** | Not started or menu-only / Coming soon |
| **Blocked** | Explicitly waiting on backend API or confirmed dependency |

---

## Completed

| Module | Spec / SOW alignment | Evidence | Notes |
|--------|----------------------|----------|-------|
| Platform console (Companies, Tenants) | Spec Ch.1 / M1–M2 platform | `src/features/companies`, `tenants`, `superadmin` | SuperAdmin CRUD |
| Auth & access (login, passwords, Users) | Spec Ch.3 / M1 | `src/features/auth`, `users` | Tenant Admin Users CRUD; role gates exist — fine-grained doc rights may still evolve |
| Organization (profile, banks, number formats) | Spec Ch.2 / Ch.4 | `src/features/organization` | |
| Parties (Customer/Vendor master) | Spec Ch.4 | `src/features/parties` | Contacts + addresses |
| API-backed Masters (~20 resources) | Spec Ch.4 / M2–M3 | `masterResources` + `/masters/:resourceKey` | Airlines, airports, ports, currencies, charge codes, vessels, etc. |
| AWB Stock Master | Spec Ch.8 (AWB stock) | `src/features/awbStock` | All 11 Swagger AWB Stock APIs + UI |
| Quotations | Spec Ch.7 / M4 | `src/features/quotations` | List/create/edit/detail, workflow, PDF/email |
| Online Tariff Master | Spec Ch.7 / M4 | `src/features/tariffs` | |
| Zip Distance Master | Spec Ch.7 related | `src/features/zipDistances` | |
| Jobs (Air Export, Sea Export, Sea Import) | Spec Ch.8–11 / M6 | `src/features/jobs` | Full job feature module; other job modes may need more nav coverage |

---

## In Progress

| Module | Spec / SOW | Evidence | Remaining |
|--------|------------|----------|-----------|
| Masters (full catalog) | Spec Ch.4 / M2–M3 | Menu has many tiles without API resources | Connect remaining master tiles when APIs exist |
| Dashboard | Spec Ch.23 widgets | Live Jobs + Quotation widgets; other widgets still mock | Replace mock shipments/invoices/todos |
| Jobs (full Spec modes) | Spec Ch.8–15 | Air/Sea FCL-style segments live | LCL / Land / Courier / NVOCC job UX depth vs Spec |
| Access control depth | Spec Ch.3 | Users + role route gates | Menu-level + document-level permission matrix UI if Spec requires beyond current gates |

---

## Pending

| Module | Spec / SOW | Current state |
|--------|------------|---------------|
| Finance / Accounting / Invoices | Spec Ch.17–20 / M8 | Router Placeholder; legacy mock pages unused |
| WMS | Spec Ch.22 | Unrouted mock only |
| Customer & Vendor Portals | Spec Ch.24 | Not implemented |
| Notifications center | Spec Ch.2/5 | Router Placeholder |
| Global Reports hub | Spec Ch.20/23 / M8 | `/reports` Placeholder |
| Mobile Sales App | Spec Ch.26 | Out of web FE scope unless instructed |
| SaaS multi-tenant admin depth | Spec Ch.28 | Partial via platform console |

---

## Blocked

| Module / item | Reason | Evidence |
|---------------|--------|----------|
| ~25 Masters menu tiles (Activity, Commodity, City, Clause, etc.) | No Master API in backend yet | `mastersMenu.ts` “No Master API yet”; list shows not connected |
| Sales / CRM APIs (leads, call sheet, budget, …) | Stub services / no feature API module | `src/pages/sales/*` shells; placeholder services |
| HR APIs (employees, leave, payroll) | Stub `employeeService` | `src/pages/hr/*` UI without real API |
| Management user-access / performance stubs | Placeholder services | `src/pages/management/*` |
| Password reset (some flows) | API limitation noted in auth UI | Login / forgot-password messaging |

---

## Partial shells (not counted as Completed)

These have menus and/or static filter UIs but **are not API-complete**:

- **Sales / CRM** — Spec Ch.6 / M4–M5  
- **Customer Service** — Spec / M5 (enquiry, sailing, pricing dashboard pages exist as shells)  
- **Documentation** — Spec Ch.16 / M6–M7 (subset of routes; many menu tiles unrouted)  
- **EDI screens** — Spec Ch.25 / M7 (shells only)  
- **NVOCC** — Spec / menus (filter shells)  
- **HR** — Spec Ch.21 / M8 (UI + stub API)  
- **MIS / Management** — Spec Ch.23 / M8 (static/stub)  

---

## Roadmap note (Milestones.md)

The 8 milestones (M1–M8) are the **planned sequence** for delivery gating and acceptance criteria. They do **not** define what is already built. Example: Jobs (M6 in roadmap) can be Completed in code while later Sales screens remain Pending.

---

## Update log

| Date | Change |
|------|--------|
| 2026-07-14 | Initial tracker from codebase audit vs Feature Spec + SOW. Overall ~40%. |
