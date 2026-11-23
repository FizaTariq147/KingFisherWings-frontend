# Decisions needed (agent does not decide)

1. **Credit / debit notes:** API `GET /credit-notes` and `GET /debit-notes` returned **0** rows. This round used anonymized synthetic copies from real invoices. Confirm whether that is acceptable until live notes exist, or whether another tenant/environment should be used.

2. **tax_total vs tax_amount on notes:** Classic CN/DN VAT reads `tax_total` only. Several source invoices (and therefore synthetic notes) have `tax_amount` set and `tax_total` null, so classic prints Tax 0 while flow prints `tax_amount`. Decide whether flow should match classic (`tax_total` only) or whether classic note mapping should also consider `tax_amount` (classic files are read-only this round).

3. **Quotation flow field bindings:** Record holds `transit_time_days`, `gross_weight`, `volume_cbm`, `container_count` / `container_type_id`, and often `incoterm` (singular) / `terms_and_conditions`. Flow currently does not print weight/volume/containers/transit; Incoterms cell looks for `incoterms` (plural); terms look for `terms`. Decide which to bind in flow vs leave blank vs require backend fields (airline, flight number, resolved container type label).

4. **CN wording:** Classic uses “Related Invoice” + `CREDIT NOTE / STATEMENT OF CHARGES`. Flow uses “Original Invoice:” and a fixed terms sentence. No jurisdiction-specific wording was chosen — pick preferred labels/terms text.
