# Form Handling

How forms are built, validated, and submitted across the KingFisher Tech Gold frontend.

## Standard stack

| Layer | Library |
|-------|---------|
| Form state | react-hook-form |
| Schema validation | Zod |
| Resolver | `@hookform/resolvers/zod` |
| Shared validators | `@/lib/validation` |
| Form hook | `useAppForm` |

## Business rules (`@/lib/validation`)

| Rule | Helper | Constraints |
|------|--------|-------------|
| Names | `requiredName` / `optionalName` | Trim + collapse spaces; 2–100; must include a letter; multilingual; allow `-'&(),./`; block junk-only / bad edges |
| Codes | `entityCode` | Uppercase; `^[A-Z0-9-]+$`; 2–20 |
| Prefixes | `prefixCode` | Uppercase; `^[A-Z0-9_-]+$`; max 10 |
| Country | `countryCode` | ISO 3166-1 alpha-2 `^[A-Z]{2}$` |
| Email | `requiredEmail` / `optionalEmail` | Lowercase; trim; max 254; valid format; block invalid domains |
| Phone | `requiredPhone` / `optionalPhone` | Optional `+` + digits; 7–20 digits |
| URL | `requiredUrl` / `optionalUrlOrEmpty` | Trim; optional protocol |
| Latitude | `latitude` | −90…90; ≤6 decimals |
| Longitude | `longitude` | −180…180; ≤6 decimals |
| UOM | master select → `units-of-measure` | Active options only |
| Amounts | `amountField` / `integerField` | Numeric min/max/decimals |

UX via `useAppForm`: blur + submit validation; revalidate on change after error; inline errors; focus/scroll first invalid; disable while submitting; `applyApiErrors` for Nest/class-validator responses.

Keep module schemas in `features/<module>/schemas` and compose them from shared helpers. Masters use `createMasterSchema` / `validateMasterValues` with the same rules by field name/type.
