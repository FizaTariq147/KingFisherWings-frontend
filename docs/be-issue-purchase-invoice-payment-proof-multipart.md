# BE issue: staff purchase-invoice payment proof upload

## Symptom

`POST /purchase-invoices/{id}/payment-proofs` (multipart) returns **400** with:

```text
Could not save payment proof. Verify amount_claimed and payment_date.
```

even when the client sends OpenAPI-valid fields.

Frontend (staff ERP → Purchase invoice → Payment proofs) already sends:

| Field | Example | Notes |
|-------|---------|--------|
| `file` | binary | field name exactly `file` |
| `amount_claimed` | `"100.00"` | string, 2 dp (OpenAPI example) |
| `payment_date` | `"2026-10-23"` | `YYYY-MM-DD` |

Optional `reference_number` / `notes` are omitted on the first attempt.

## Contract (live OpenAPI)

`POST /purchase-invoices/{id}/payment-proofs`  
`required: ["file", "amount_claimed", "payment_date"]`  
`amount_claimed` type **string** example `"100.00"`  
`payment_date` type **string** example `"2026-09-30"`

Same shape as `POST /invoices/{id}/payment-proofs` and `POST /portal/invoices/{id}/payment-proofs`.

## Likely root cause

Staff DTO (e.g. `StaffUploadPaymentProofDto`) still uses `@Type(() => Number)` + `@IsNumber()` under global `forbidNonWhitelisted` / ValidationPipe.

Multipart text fields arrive as **strings**. Without:

```ts
@Transform(({ value }) => Number(value))
@IsNumber()
@IsPositive()
amount_claimed: number;
```

(or `@IsNumberString()` / portal-aligned Transform), Nest rejects the body. Controllers that catch validation errors and rethrow a single generic message hide the real `message[]` from class-validator.

Portal upload often works because portal DTO already uses `@Transform` for multipart strings.

## Requested fix

1. Align staff purchase + sales payment-proof DTOs with portal:
   - `@Transform(({ value }) => Number(value))` + `@IsNumber()` + `@IsPositive()` for `amount_claimed`
   - Reject `NaN` / empty with a clear message
   - Keep `payment_date` as `@IsDateString()` (YYYY-MM-DD OK)
2. Keep `FileInterceptor('file')` required.
3. Map Multer / validation failures to **JSON** `{ message: string | string[] }` (not empty body / HTML).
4. Do not collapse all 400s into only  
   `Could not save payment proof. Verify amount_claimed and payment_date.`  
   — return the validation array when present.

## How to verify

```http
POST /purchase-invoices/{postedInvoiceId}/payment-proofs
Authorization: Bearer {staffJwt}
Content-Type: multipart/form-data

file: (pdf/png)
amount_claimed: 100.00
payment_date: 2026-10-23
```

Expect **201** + proof id.  
Invalid amount → **400** with explicit validation message (not an empty body).

## Frontend status

No further FE contract change needed once the DTO Transform is deployed. FE already matches OpenAPI multipart field names and examples.

---

## Related: HTTP 500 on upload or Approve & apply

### Symptom A — upload returns 500

Client may show Axios default:

```text
Request failed with status code 500
```

(empty Nest body). Sometimes a `SUBMITTED` proof row still appears afterward (partial write before crash — e.g. DB row then file-storage failure).

### Symptom B — Approve & apply returns 500

Proof is already `SUBMITTED` with file + `amount_claimed`.  
`PATCH /payment-proofs/{id}/approve` with:

```json
{
  "payment_method": "BANK_TRANSFER",
  "bank_account_id": "<uuid>",
  "review_notes": "optional"
}
```

returns **500** (often empty body). Approve is supposed to post a GL AP payment and apply the claimed amount.

### Requested BE checks

1. Upload: after Multer + DTO validation, catch file-storage / S3 errors and return **JSON** `{ message }` (not empty 500). Prefer transaction: no orphan `SUBMITTED` row without file.
2. Approve: do not 500 when `bank_account_id` is missing — return **400** with a clear message; when present, ensure GL payment posting for **purchase invoices** (AP) is implemented the same as AR invoice approve (not a null deref on invoice type).
3. Always return Nest exception JSON on 500 in non-prod (or log `error.message` in the response `message` field for staff).

### FE mitigation (shipped)

- Staff PI panel requires **bank account** with a **Bank/Cash** linked `gl_account_id` before Approve for non-cash methods (blocks Trade Receivables / missing GL).
- Surfaces a clearer message than bare Axios “Request failed with status code 500”.
- When bank GL is already Bank/Cash and Approve still 500s, FE retries via
  `POST /gl/payments` (direction `PAYMENT`, allocation `invoice_id` = purchase invoice id)
  + `POST /gl/payments/{id}/post`, then `PATCH /payment-proofs/{id}/acknowledge`.
  This is a temporary workaround — **approve for purchase invoices must still be fixed on BE**.
- **Open** prefers `GET /payment-proofs/{id}/file` instead of raw absolute `file_url` hosts
  (avoids “Blocked an unsafe payment proof URL” when BE returns S3/Render absolute URLs
  while the app proxies via `/backend`).
- Organization bank-account form now edits `gl_account_id` (CreateTenantBankAccountDto) and can create a dummy Bank/Cash COA.

### Common approve 500 cause (FE observed)

`PATCH /payment-proofs/{id}/approve` with valid `bank_account_id` still returns:

```text
HTTP 500: Internal server error
```

**Case 1:** org bank account has **no** `gl_account_id`, or the linked COA is AR (“Trade Receivables”) instead of Bank/Cash. BE should return **400** with e.g. `Bank account has no linked GL account` instead of empty 500.

**Case 2 (still broken after Case 1 fixed):** bank account correctly links Dummy Bank Cash / other Bank/Cash GL, purchase invoice is Posted, and Approve still empty **500**. That is a BE bug in the purchase-invoice approve → AP GL payment path (not an FE bank-link issue).

---

## Related: Open file after admin upload

### Symptom

Admin uploads remittance proof → proof is `SUBMITTED`. Clicking **Open** shows:

```text
Blocked an unsafe payment proof URL.
```

and/or

```text
HTTP 500: Internal server error
```

### Cause

1. List/create response often includes absolute `file_url` / `storage_url` on object storage
   or API host. FE correctly refuses to send Bearer tokens to non-API origins.
2. If Open falls back to `GET /payment-proofs/{id}/file` and storage is broken / key missing,
   BE returns empty **500**.

### Requested BE fix

1. Prefer returning **relative** paths (`/payment-proofs/{id}/file` or `/files/{tenant}/{name}`)
   in list payloads — not raw bucket URLs — for authenticated viewers.
2. Ensure `GET /payment-proofs/{id}/file` streams the uploaded object for both staff and vendor
   JWTs; on missing object return **404** JSON `{ message }` not empty 500.
3. Vendor list `GET /vendor/invoices/{id}/payment-proofs` should not 500 after staff upload.
