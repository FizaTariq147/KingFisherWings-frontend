# Rollback — flow release set

Release set: `INVOICE_FLOW_TAX_INVOICE_1`, `QUOTATION_FLOW_1` on branch `reports/integration`.

## Fastest: runtime kill switch (no rebuild, no git revert)

`VITE_REPORTS_ENGINE` is **build-time only**. Do **not** treat env changes as “off without deploy.” Use the runtime file:

**File:** `public/reports-config.json` (URL `/reports-config.json`)

### Turn all v2 / flow off for everyone

1. On the static host, set:
   ```json
   { "engine": "legacy", "gate": "soft", "disabledCodes": [] }
   ```
   (keep existing `gate` / `disabledCodes` if you prefer; only `engine` must be `legacy`).
2. Users reload the app (boot fetches with `cache: 'no-store'`).
3. Result: catalogue lists **no** gated flow / v2 codes; Generate PDF stays classic.
4. **No** frontend rebuild. **No** git revert.

### Disable one code only

1. Keep `"engine": "v2"`.
2. Add the code to `disabledCodes`, e.g.:
   ```json
   { "engine": "v2", "gate": "soft", "disabledCodes": ["INVOICE_FLOW_TAX_INVOICE_1"] }
   ```
3. Reload. That code is hidden and not generatable; other codes unchanged.

### Turn v2 back on

1. Set `"engine": "v2"` and remove codes from `disabledCodes` (or set `"disabledCodes": []`).
2. Reload.

### Cache lifetime

- App fetch: `cache: 'no-store'` — no browser HTTP cache of the JSON.
- Users need a full page reload (or new session) so boot re-runs `loadReportsRuntimeConfig`.
- If a CDN caches `/reports-config.json`, purge or set a short TTL on **that path only**. The JS bundle does not need redeploy for a config flip.
- If fetch fails (404 / network), the app defaults engine to **`legacy`** (safe off).

### Still requires rebuild

| Change | Rebuild? |
|---|---|
| `public/reports-config.json` flip | No |
| `VITE_REPORTS_*` env change | Yes |
| `reports/status.json` acceptance change | Yes (bundled import) |

## Git revert (code)

On `reports/integration` only (never force-push `develop` / `main`):

```bash
git fetch origin
git checkout reports/integration
git pull origin reports/integration
# identify the release commit(s), then:
git revert <commit-sha> --no-edit
git push origin reports/integration
```

Or redeploy the previous known-good commit of `reports/integration`:

```bash
git checkout reports/integration
git reset --hard <good-sha>   # only on this branch, with team agreement
git push origin reports/integration
```

Do **not** push `--force` to `develop` or `main`.

## After rollback

1. Confirm Generate PDF on an invoice and a quotation is classic.
2. Confirm Formats no longer offers the flow layouts (or engine is legacy via runtime file).
3. Leave `reports/signoff.csv` and acceptance thresholds untouched unless a separate, explicit process says otherwise.
