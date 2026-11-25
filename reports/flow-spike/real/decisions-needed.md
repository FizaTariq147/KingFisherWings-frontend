# Decisions applied

1. CN/DN flow codes staging-only behind soft gate + VITE_REPORTS_FLOW_STAGING; label `staging only: no real records tested`. Synthetic never counts toward release.
2. Tax uses tax_amount only; assertions on every record. Classic difference listed in RELEASE_NOTES_PHASE1.md for six invoices.
3. Quotation binds transit, weights, volumes, containers, incoterm|incoterms, terms_and_conditions, validity, carrier/airline, flight/voyage, remarks — no invented values.
4. CN/DN use Related Invoice; invented terms sentences removed. See wording.md.

