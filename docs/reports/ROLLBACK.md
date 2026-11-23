# Rollback — flow release set

Release set: `INVOICE_FLOW_TAX_INVOICE_1`, `QUOTATION_FLOW_1` on branch `reports/integration`.

## Fastest: env kill switch (no git revert)

1. Set `VITE_REPORTS_ENGINE` to unset or `legacy` on the production/staging host.
2. Restart or rebuild the frontend so the new env is loaded.
3. Result: no flow / v2 catalogue entries; Generate PDF stays on classic.

This does not require deploying a previous git revision.

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
2. Confirm Formats no longer offers the flow layouts (or engine is legacy).
3. Leave `reports/signoff.csv` and acceptance thresholds untouched unless a separate, explicit process says otherwise.
