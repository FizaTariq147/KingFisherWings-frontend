# How to see invoice v2

Generate PDF on the invoice screen stays on the classic generator. v2 is the spec draw used from Reports and Formats.

## Enable it locally

In `.env` (this file is not committed):

```
VITE_REPORTS_ENGINE=v2
```

Stop and start `npm run dev`. The dev server exposes `POST /__reports/invoice-v2`, which the catalogue calls. There is no stored `reports.engine` field. Unset the variable, or set it to `legacy`, and the catalogue does not open the spec PDF.

## Open a format

1. Sign in.
2. Open an invoice.
3. Click **Formats** or **Reports catalog**. Both go to `/reports/catalog` with that invoice id.
4. The formats that have a v2 spec are listed first. Each shows the status badge **approximate, not final** (nothing is accepted).
5. Click one. The preview opens with that invoice's record, its job and party when they load, and the organization profile. Missing fields stay blank.

Family strips are the same list under **Family strips**. The default view is the catalogue table.
