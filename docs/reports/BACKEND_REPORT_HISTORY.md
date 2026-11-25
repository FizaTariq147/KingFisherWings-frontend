# Backend task: report run history

The Reporting Dashboard “Recently generated” panel cannot list prior jobs today.

## Current behaviour

- `POST /reports/generate` creates a job.
- `GET /reports/jobs/:jobId` polls that job.
- `GET /reports/jobs/:jobId/download` downloads the file.
- There is **no** authenticated list of the current user’s (or company’s) recent report runs.

Saved GL reports at `/gl/saved-reports` are a different product and must not be faked as PDF run history.

## Proposed API (for Hafsa / backend)

```text
GET /reports/runs?page=&limit=
```

Suggested item fields:

| Field | Meaning |
|---|---|
| `id` | Run / job id |
| `template_code` | Catalogue code |
| `template_name` | Display name |
| `created_at` | Generated date |
| `created_by` | User display name or id |
| `format` | PDF / XLSX / CSV |
| `status` | queued / running / ready / failed |
| `download_url` | Short-lived authorized URL when ready |

Rules:

- Scope by authenticated company (and branch if used).
- Do not accept `companyId` from the client as authority.
- Expire download links; never permanent public URLs.
- Audit who downloaded.

Until this exists, the dashboard shows an honest empty state and does not invent rows.
