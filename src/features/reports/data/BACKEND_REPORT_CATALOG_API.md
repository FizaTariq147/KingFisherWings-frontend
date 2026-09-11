# FRESA Report Catalog — Backend API Contract

**Status:** Live on Swagger tag **Reports — Catalog**  
Base: `https://kingfisherwings-backend.onrender.com` (tenant Bearer auth)

Frontend catalog UI: `/reports/catalog`  
Client: `src/features/reports/api/reportCatalog.api.ts` + `reportCatalog.service.ts`

Do **not** change existing document PDF APIs (`POST /quotations/:id/pdf`, `POST /invoices/:id/pdf`, portal/vendor PDF flows). Catalog templates are additive.

**Rendering:** There is **no Jasper upload**. Templates bind to existing **Puppeteer data packs** (~18 keys today) via `renderer_key` pattern `^(ops|sea)\.[a-z0-9_]+$`.

Restart the API after deploy so Swagger picks up new routes.

---

## Endpoints (live)

### 1. `GET /reports/templates`

Paginated template list. Params: `page`, `limit` (max 200), `search`, `family`, `context`, `include_inactive`.

### 2. `GET /reports/templates/:idOrCode`

Detail + parameter schema (UUID or `code`).

### 3. `POST /reports/templates/import` → **201**

Import FRESA registry (inactive unless pack-protected). Body: array or `{ templates: [] }`.  
New rows typically get `renderer_key=pending.{CODE}` until bound.

### 4. `GET /reports/templates/renderers`

List **implemented** Puppeteer pack keys (for bind / activate). Not Jasper upload.

### 5. `POST /reports/templates/:code/bind-renderer` → **201**

`BindRendererDto`:

```json
{
  "renderer_key": "ops.delivered_jobs_period",
  "activate": true,
  "formats": ["PDF"]
}
```

- `renderer_key` required — must be from `/renderers`
- `activate: true` — one-shot bind + activate for FE

### 6. `POST /reports/templates/:code/activate` → **201**

Optional `ActivateTemplateDto`:

```json
{ "renderer_key": "ops.delivered_jobs_period" }
```

If still `pending.*`, pass `renderer_key` to bind+activate.

### 7. `POST /reports/templates/:code/deactivate` → **201**

### 8. `POST /reports/generate` → **201**

`ReportGenerateDto`: `format` required; `template_id` and/or `code`; `parameters`; `context`.

### 9. `GET /reports/jobs/:jobId`

### 10. `GET /reports/jobs/:jobId/download`

---

## Frontend flow

1. **Import registry** (batched)  
2. **Include inactive** → select template  
3. Pick pack from **Puppeteer pack** dropdown (`GET …/renderers`)  
4. **Bind pack + Activate**  
5. **Generate** → poll → download  

Only templates whose codes map to an existing pack can render. Other FRESA names stay pending until backend adds more packs.

---

## FE reference

| Item | Path |
|------|------|
| API | `src/features/reports/api/reportCatalog.api.ts` |
| Service | `src/features/reports/services/reportCatalog.service.ts` |
| Hooks | `src/features/reports/hooks/useReportCatalog.ts` |
| Panel | `src/features/reports/components/ReportCatalog/ReportGeneratePanel.tsx` |
