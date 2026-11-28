# Phase 1.2 — Format 1 long-party letterhead assessment

**Code:** `INVOICE_REPORT_FORMAT_1_TAX_INVOICE_INDIA`  
**Fixture:** `long_party` (`companyName = LONG_NAME + " Trading Division"`)  
**Pilot verdict:** WARNING (not FAIL)  
**Phase 1.1 stance:** Do not force full suffix into the narrow letterhead if it collides with the address band.

## Geometry (evidence)

| Element | Observation |
|---|---|
| Page | ≈594 × 841.9 pt |
| Company branding slot | Right-aligned, ~137pt wide band (measured branding slots) |
| Extract (y≈811.7) | `"International"` @ x≈460.4 **and** long stem `"…Partners Lim"` @ x≈8 (near full width) |
| `Trading Division` | **Absent** from pdfjs extract |
| Collisions | `TAX INVOICE` vs long company (area ≈389); address `Suite 1204…` vs wrap fragment; phone vs web URL |
| Outside page | Org URL @ x≈524; long company/party widths near MediaBox |

## Root cause

Format 1’s **classic Fresa-style right letterhead** is intentionally narrow. The Phase 1.1 two-line wrap that works on Formats 4/8 (wider left/top company band) cannot place the full 114-character org name here without:

1. Extending left across the title (`TAX INVOICE`), or  
2. Dropping into the address/contact band below the company slot.

Either path is a **layout collision**, not a missing data mapping (fixture and org fields are correct).

## Safe format-specific options (analysis only — not implemented)

| Option | Safe? | Notes |
|---|---|---|
| A. Force full name into existing 137pt slot (smaller font / 3+ lines) | **No** without redesign | Collides address lines; violates “do not force if address collision”. |
| B. Expand company wipe into title/address | **No** | Damages Format 1 identity vs sample. |
| C. Ellipsis truncate with extractable stem (current) | **Yes** | Keeps layout; loses `Trading Division` in extract. Documented limitation. |
| D. Dedicated Format-1 multi-line company band (new measured slots) | Possible later | Format-specific layout change — requires approval; out of Phase 1.2 audit. |
| E. Move long-name stress to party fields only for Format 1 fixture | QA/fixture policy | Would change fixture semantics — not done; assertions not weakened. |

## Recommendation

**Retain as documented legitimate layout limitation / REVIEW item.**

- Keep Phase 1.1 assertion: capacity-fitting stem for Format 1 long_party; **do not** require `Trading Division` here.  
- Do **not** implement speculative wrap into the title/address band.  
- Optional future (approval required): Format-1-only letterhead slot redesign (option D).

## Does this block expansion to other families?

**No** as a hard FAIL — it is a known Format 1 capacity limit.  
**Yes** as a documentation gate: any claim that “all invoice long_party letterheads show full Trading Division” is false until Format 1 is redesigned or scoped out.
