# Chrome Claude — Full Product Video Capture Prompt

Copy everything inside the box below into Chrome Claude. Replace the `[BRACKETS]` first.

---

## PROMPT (copy from here)

```
You are recording a professional product demo video of KingFisher Tech Gold (freight-forwarding ERP) using Chrome screen capture / tab recording.

GOAL
Produce one continuous, clear walkthrough video covering:
1) SuperAdmin / Platform
2) Tenant Admin
3) Staff ERP (Sales → Ops → Finance → Docs)
4) Customer Portal
5) Vendor Portal
6) Invoice workflows (Sales AR + Purchase AP)
7) Track & Trace + public track

Do NOT invent features. Only click and narrate what is actually on screen.
Speak briefly before each click: what you will show, then show it, then move on.
Keep pace steady. Avoid long idle time. If a page fails to load, say so once and continue.

CREDENTIALS / URLS (fill before starting)
- App base URL: [e.g. https://YOUR-FRONTEND-URL]
- SuperAdmin URL: […/superadmin/login]  User: […]  Pass: […]
- Tenant Admin (Company Admin) login: […/login]  Tenant slug: […]  User: […]  Pass: […]
- Staff login: […/staff/login]  Tenant: […]  User: […]  Pass: […]
- Customer Portal: […/portal/login]  User: […]  Pass: […]
- Vendor Portal: […/vendor/login]  User: […]  Pass: […]
- Prefer demo data that already has: 1 open job with costing, 1 draft/posted invoice, 1 purchase invoice or vendor offer, 1 trackable shipment.

RECORDING RULES
- Start recording BEFORE first login.
- Use a clean browser profile (no unrelated tabs).
- Zoom 90–100%. Window maximized.
- Prefer existing records over creating new ones unless creation is the feature.
- For create wizards: enter 1–2 fields only, then Cancel unless the flow requires Save to show the next screen.
- Never show real secrets longer than needed; blur if prompted.
- Target total length: 12–18 minutes.
- Section title cards: pause 2 seconds on each major section header page before clicking in.

============================================================
SECTION 0 — OPENING (15–20 sec)
============================================================
Narrate:
“This is KingFisher Tech Gold — a multi-tenant freight ERP with Staff ERP, Customer Portal, and Vendor Portal.”
Show the login landing briefly.

============================================================
SECTION 1 — SUPERADMIN / PLATFORM (60–90 sec)
============================================================
1. Open SuperAdmin login → sign in.
2. Dashboard: show tenant stats / shortcuts.
3. Companies: open list → open one company detail → back.
4. Tenants: open list → open one tenant → show Features / enabled modules panel (Operations, Shipments, Sales, Finance, etc.).
5. Billing: briefly open Plans / Invoices / Payments / Webhooks (one screen each).
6. Logout SuperAdmin.
Narrate hierarchy: “SuperAdmin manages Companies and Tenants only — not tenant staff users.”

============================================================
SECTION 2 — TENANT ADMIN (90–120 sec)
============================================================
1. Company Admin login with tenant slug.
2. Dashboard overview.
3. Admin → Users: list → open one user → show role / permission flags (salesperson, ops, finance, visibility flags).
4. Organization: Profile, Bank Accounts, Number Formats, Job date / Costing settings (quick pass).
5. Masters: open Masters hub → click 3–4 examples (Ports, Charge Codes, Shipping Lines, Container Type).
6. Settings: Public API, Online Payments/Stripe, Billing Plans, Login Security (open each briefly).
7. Stay logged in OR switch to Staff if Admin cannot access ops modules.

============================================================
SECTION 3 — STAFF DASHBOARD + SALES (2–3 min)
============================================================
If needed, Staff login.
1. Dashboard: KPIs + Active shipments grid (point out Job, Route, Mode, Client/Shipper/Consignee, ETD/ETA, status).
2. Sales hub:
   - Leads list → open one
   - Follow-ups
   - Enquiries list → open one enquiry detail (tabs/links)
3. Quotations:
   - All Quotations list
   - Open one quotation detail
   - Point status lifecycle (Draft / Sent / Approved / Converted)
   - Show PDF / convert-to-job action if visible (do not break data)

============================================================
SECTION 4 — OPERATIONS / MULTI-MODE JOBS (3–4 min)
============================================================
1. Show department hubs strip/menu: Air Export, Air Import, Sea Export, Sea Import, Road Freight, Customs Clearance, NVOCC.
2. Open All Jobs (or one department Jobs list).
3. Open ONE rich job detail (prefer sea or air with parties + costing).
4. On job detail, walk tabs in order (only those visible):
   - Show All (mention editable commercial aggregate)
   - Info / Party (point Client vs Customer if both exist — CLIENT ≠ CUSTOMER)
   - Dimensions
   - Containers (sea) OR MAWB (air)
   - Costing (charge lines)
   - Shipments
   - Customs (if present)
   - Booking form / Delivery acknowledgement if present
   - Track & Trace (must show; point ETD/ETA on progress if present)
5. Job Actions toolbar (do not run destructive actions): Documents, Invoices, P&L, Milestones, Notes, Vendor offers — open Documents and Invoices panels briefly.
6. Open Shipments → All Shipments → open one shipment detail → Show All / status.
7. Customs Clearance hub: open hub + one CC job if available.
8. Documentation hub: open 2–3 EDI tiles (BOE / Bayan / eQO / MPCI) without submitting.
9. NVOCC menu: Jobs / Tariffs / Booking / Vessel Voyage — one click each.
10. Warehouse (WMS) if enabled: Ops Board / ASN / Stock — brief.

============================================================
SECTION 5 — FINANCE: SALES INVOICE WORKFLOW AR (2–3 min)
============================================================
Narrate: “Sales invoice workflow — Accounts Receivable.”
1. Finance → All Invoices list (statuses Draft/Posted/Sent/Paid).
2. Open Create Invoice wizard if safe:
   - Choose Create from Job (preferred) OR Manual
   - Walk steps: Department → Invoice Info → Notes → Charge Lines → Summary
   - Save as Draft OR open existing Draft
3. Open invoice detail:
   - Show lines
   - Point actions: Post, Generate PDF, Send, Cancel
   - If already Posted/Sent, do not re-post; just narrate next steps
4. Overdue list — open briefly
5. Credit Notes / Debit Notes — open list + one detail
6. Payment Requests + Online Payments — brief
7. Return to the Job → Invoices panel to show job-linked AR

============================================================
SECTION 6 — FINANCE: PURCHASE INVOICE WORKFLOW AP (90–120 sec)
============================================================
Narrate: “Purchase invoice workflow — Accounts Payable.”
1. Finance → All Purchase Invoices
2. Open one PI (or Create from Job, leave Draft)
3. Point statuses: Draft / Submitted / Posted
4. Show Post action (do not post if it will mess demo data — narrate instead)
5. Payment proofs panel if present
6. Accounts: AP Aging / AP open items / Payments AR-AP — brief pass
7. Say: “Posted purchase invoices also appear on the Vendor Portal.”

============================================================
SECTION 7 — PARTIES + PORTAL ADMIN (60–90 sec)
============================================================
1. Parties list → open a Customer party → contacts / credit / Customer Portal Users
2. Open a Supplier/Vendor party → Vendor Portal Users
3. Customer Services: Portal Inbox, Customer Portal Users, Shipment Tracking
4. Vendor Services: Vendor Portal Users, Vendor Disputes

============================================================
SECTION 8 — CUSTOMER PORTAL (2–3 min)
============================================================
Logout staff. Login Customer Portal.
Walk every nav item that exists:
1. Dashboard
2. Booking — start wizard, show steps, Cancel before final submit unless demo booking is allowed
3. Track — search/show a shipment
4. Jobs — list → detail
5. Customs clearance — list → detail if any
6. Quotes — list → detail
7. Invoices — list → detail → point Pay if available
8. Credit notes / Debit notes
9. Payments / Credit / Credit requests
10. Documents
11. Messages
12. Disputes
13. Alerts / Account / Tools
Narrate: “Customer portal is self-service for booking, tracking, quotes, invoices, and documents.”

============================================================
SECTION 9 — VENDOR PORTAL (90–120 sec)
============================================================
Logout. Login Vendor Portal.
Walk nav:
1. Home
2. Jobs — open an offer; point that customer sell prices are hidden
3. Invoices — list → detail (submit flow if visible)
4. Payments / Advances / Schedule / Statement
5. % TDS
6. Payment requests
7. Credit notes / Disputes / Alerts / Account
Narrate: “Vendors price jobs and submit invoices into the AP workflow.”

============================================================
SECTION 10 — PUBLIC TRACK / PAY (30–45 sec)
============================================================
1. Open public /track (or widget) with a sample ref if available
2. Mention /pay/:token for customer payment links (open only if you have a safe demo token)

============================================================
SECTION 11 — CLOSE (20 sec)
============================================================
Narrate summary:
“KingFisher covers SuperAdmin provisioning, Tenant Admin control, multi-mode staff ops, Customer Portal, Vendor Portal, and full AR/AP invoice workflows — with Track & Trace across job, portal, and public surfaces.”
Stop recording.

CHECKLIST BEFORE YOU FINISH
[ ] SuperAdmin companies/tenants/modules shown
[ ] Tenant Admin users + masters shown
[ ] Dashboard active shipments shown
[ ] Enquiry + Quotation shown
[ ] Job Show All + Party (Client/Customer) + Costing + Track & Trace shown
[ ] Air OR Sea mode-specific tab shown (MAWB or Containers)
[ ] Sales invoice create/detail + Post/PDF/Send path narrated
[ ] Purchase invoice path narrated
[ ] Customer Portal major nav covered
[ ] Vendor Portal jobs + invoices covered
[ ] Public track mentioned/shown

If any section is blocked by permissions, say “not enabled for this tenant/user” and continue — do not stop the whole video.
```

## PROMPT (copy ends here)

---

## How to use with Chrome Claude

1. Fill every `[…]` credential/URL in the prompt.
2. Start **Chrome tab recording** (or Claude’s video capture) on the app tab.
3. Paste the prompt into Chrome Claude and tell it: **Follow the prompt exactly. Start Section 0.**
4. When finished, save MP4 → upload to Google Drive with the features PDF → share link (Anyone with link → Viewer).

## Suggested Drive folder

- `KingFisherWings-Features-Catalog.pdf`
- `KingFisherWings-Product-Demo.mp4`
