# API coverage report

Generated: 2026-09-30T10:36:42.960Z
OpenAPI: **KingFisher Wings ERP API** v1.0

| Metric | Count |
| --- | ---: |
| OpenAPI operations | 1348 |
| Frontend route literals | 1161 |
| Covered (heuristic) | 1259 |
| Missing in frontend | 89 |
| Priority missing (Jobs/Quotations/Portal/Notifications/NVOCC) | 0 |

## Priority gaps

- None

## Missing by tag

### Platform Billing (Super Admin) (31)

- `GET /platform/billing/stripe/status`
- `POST /platform/billing/reconcile`
- `GET /platform/billing/webhook-events`
- `POST /platform/billing/webhook-events/{id}/replay`
- `GET /platform/tenants/{tenantId}/payment-gateway`
- `PUT /platform/tenants/{tenantId}/payment-gateway`
- `GET /platform/billing/plans`
- `POST /platform/billing/plans`
- `PATCH /platform/billing/plans/{id}`
- `DELETE /platform/billing/plans/{id}`
- `GET /platform/tenants/{tenantId}/subscription`
- `POST /platform/tenants/{tenantId}/subscription/change-plan`
- `POST /platform/tenants/{tenantId}/subscription/cancel`
- `GET /platform/invoices`
- `POST /platform/invoices`
- `GET /platform/invoices/{id}`
- `PATCH /platform/invoices/{id}`
- `DELETE /platform/invoices/{id}`
- `POST /platform/invoices/{id}/send`
- `POST /platform/invoices/{id}/payment-link`
- `POST /platform/invoices/{id}/cancel`
- `GET /platform/invoices/{id}/pdf`
- `GET /platform/invoices/{id}/payment-status`
- `GET /platform/invoices/{id}/payments`
- `POST /platform/invoices/{id}/manual-payments`
- `GET /platform/payments`
- `GET /platform/payments/{id}`
- `GET /platform/payments/{id}/proof`
- `POST /platform/payments/{id}/verify`
- `POST /platform/payments/{id}/reject`
- `POST /platform/payments/{id}/refund`

### Online Payments (Stripe) (19)

- `GET /payments/stripe/status`
- `GET /payments/stripe/config`
- `GET /payments/stripe/settings`
- `PUT /payments/stripe/settings`
- `POST /payments/stripe/settings/rotate-webhook`
- `POST /payments/stripe/reconcile`
- `GET /payments/history`
- `GET /payments/history/customer/{customerId}`
- `GET /payments/history/vendor/{vendorId}`
- `GET /payments/history/invoice/{invoiceId}`
- `GET /payments/refunds/{refundId}`
- `GET /payments`
- `GET /payments/{id}`
- `GET /payments/{id}/checkout-status`
- `POST /payments/{id}/retry`
- `POST /payments/{id}/checkout`
- `POST /payments/{id}/cancel`
- `POST /payments/{id}/refund`
- `GET /payments/{id}/refunds`

### Platform Billing (Tenant) (15)

- `GET /tenant/platform-invoices`
- `GET /tenant/platform-invoices/{id}`
- `GET /tenant/platform-invoices/{id}/pdf`
- `GET /tenant/platform-invoices/{id}/payment-status`
- `POST /tenant/platform-invoices/{id}/pay`
- `POST /tenant/platform-invoices/{id}/checkout`
- `POST /tenant/platform-invoices/{id}/payment-proof`
- `GET /tenant/platform-payments`
- `GET /tenant/platform-payments/{id}`
- `GET /tenant/platform-payments/{id}/proof`
- `GET /tenant/billing/plans`
- `GET /tenant/subscription`
- `POST /tenant/subscription/checkout`
- `POST /tenant/subscription/change-plan`
- `POST /tenant/subscription/cancel`

### Admin — Quote Requests Integration (10)

- `GET /admin/integrations/quote-requests/connection`
- `PUT /admin/integrations/quote-requests/connection`
- `POST /admin/integrations/quote-requests/connection/test`
- `POST /admin/integrations/quote-requests/sync`
- `GET /admin/integrations/quote-requests/sync-runs`
- `GET /admin/integrations/quote-requests`
- `GET /admin/integrations/quote-requests/{id}`
- `PATCH /admin/integrations/quote-requests/{id}/status`
- `POST /admin/integrations/quote-requests/{id}/link-crm`
- `POST /admin/integrations/quote-requests/{id}/convert-to-quote`

### Job Offers (4)

- `GET /job-offers/{id}/negotiation`
- `POST /job-offers/{id}/revise-and-send`
- `POST /job-offers/{id}/negotiation/accept`
- `POST /job-offers/{id}/negotiation/reject`

### Public API v1 (4)

- `GET /api/v1/health`
- `GET /api/v1/jobs`
- `GET /api/v1/jobs/{id}`
- `GET /api/v1/track/{token}`

### Payment Proofs (2)

- `PATCH /payment-proofs/{id}/approve`
- `GET /payment-proofs/{id}/file`

### Stripe Webhook (2)

- `POST /payments/stripe/webhook`
- `POST /payments/stripe/webhook/{token}`

### Payment Links (public) (2)

- `GET /pay/{token}`
- `POST /pay/{token}/checkout`


_Heuristic match: string literals in `src/` vs OpenAPI paths with `{param}` → `{id}`. Masters CRUD often uses a shared client with basePath constants — verify those before treating as truly missing._
