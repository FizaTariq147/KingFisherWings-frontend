import {
  RULES,
  V,
  amountField,
  countryCode,
  currencyCode,
  dgClass,
  hsCode,
  iataCode,
  integerField,
  isLogicalName,
  normalizeHsCode,
  normalizeName,
  optionalEmail,
  optionalPhone,
  optionalUrl,
} from '@/lib/validation';

export type PortalBookingFormKind =
  | 'air'
  | 'sea'
  | 'warehouse'
  | 'road'
  | 'land'
  | 'courier'
  | 'customs';

/** Minimal party shape used by booking-form validation (avoids circular imports). */
export type BookingFormPartyInput = {
  full_name: string;
  address: string;
  city: string;
  country: string;
  other_details: string;
};

export type BookingFormValidationInput = {
  date_of_request: string;
  teu_count: string;
  pol: string;
  pod: string;
  origin_airport_code: string;
  dest_airport_code: string;
  pieces: string;
  volume_cbm: string;
  pallet_count: string;
  chargeable_weight_kg: string;
  gross_weight_kg: string;
  net_weight_kg: string;
  is_dg: boolean;
  shipper: BookingFormPartyInput;
  consignee: BookingFormPartyInput;
  notify: BookingFormPartyInput;
  billing: BookingFormPartyInput;
  commodity: string;
  hs_code: string;
  dg_class: string;
  warehouse_name: string;
  expected_inbound_at: string;
  expected_outbound_at: string;
  storage_days_requested: string;
  stock_lines: { sku_code: string; description: string; quantity: string; unit: string; cbm: string }[];
  pallets: {
    pallet_type: string;
    count: string;
    length_cm: string;
    width_cm: string;
    height_cm: string;
    weight_kg: string;
  }[];
  origin_city_country: string;
  dest_city_country: string;
  origin_door_address: string;
  dest_door_address: string;
  etd: string;
  eta: string;
  direction: string;
  border_or_port: string;
  port_of_entry: string;
  country_of_origin: string;
  country_of_destination: string;
  invoice_value_amount: string;
  invoice_currency: string;
  consent_accepted: boolean;
};

export type BookingFormStepId =
  | 'voyage'
  | 'shipper'
  | 'consignee'
  | 'notify'
  | 'billing'
  | 'commodity'
  | 'documents'
  | 'agent'
  | 'review';

const weightSchema = amountField({
  required: true,
  min: 0.001,
  max: 999_999.999,
  maxDecimals: 3,
  allowNegative: false,
});

const optionalWeightSchema = amountField({
  required: false,
  min: 0,
  max: 999_999.999,
  maxDecimals: 3,
  allowNegative: false,
});

const piecesSchema = integerField({
  required: true,
  min: 1,
  max: 999_999,
  allowNegative: false,
});

const optionalPiecesSchema = integerField({
  required: false,
  min: 1,
  max: 999_999,
  allowNegative: false,
});

const teuSchema = amountField({
  required: true,
  min: 0.01,
  max: 10,
  maxDecimals: 2,
  allowNegative: false,
});

const optionalVolumeSchema = amountField({
  required: false,
  min: 0,
  max: 99_999.999,
  maxDecimals: 3,
  allowNegative: false,
});

const optionalAmountSchema = amountField({
  required: false,
  min: 0,
  max: 999_999_999.99,
  maxDecimals: 2,
  allowNegative: false,
});

const optionalDaysSchema = integerField({
  required: false,
  min: 1,
  max: 3650,
  allowNegative: false,
});

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const DATETIME_LOCAL_RE = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}(:\d{2})?)?$/;

function zodMessage(result: { success: boolean; error?: { issues: { message: string }[] } }): string | null {
  if (result.success) return null;
  return result.error?.issues[0]?.message ?? 'Invalid value';
}

function parseOptionalNumber(raw: string): number | undefined {
  const t = raw.trim();
  if (!t) return undefined;
  const n = Number(t);
  return Number.isFinite(n) ? n : undefined;
}

function validateDate(value: string, label: string, opts?: { required?: boolean }): string | null {
  const t = value.trim();
  if (!t) return opts?.required ? `${label} is required.` : null;
  if (!DATE_RE.test(t) || Number.isNaN(Date.parse(t))) {
    return `${label}: use a valid date (YYYY-MM-DD).`;
  }
  return null;
}

function validateDateTimeLocal(value: string, label: string): string | null {
  const t = value.trim();
  if (!t) return null;
  if (!DATETIME_LOCAL_RE.test(t) || Number.isNaN(Date.parse(t))) {
    return `${label}: use a valid date/time.`;
  }
  return null;
}

function validateOptionalIata(value: string, label: string, required: boolean): string | null {
  const t = value.trim().toUpperCase();
  if (!t) return required ? `${label} is required.` : null;
  const msg = zodMessage(iataCode(true).safeParse(t));
  return msg ? `${label}: ${msg} (e.g. DXB).` : null;
}

function validateOptionalHs(value: string): string | null {
  const normalized = String(normalizeHsCode(value.trim()) ?? '').trim();
  if (!normalized) return null;
  const msg = zodMessage(hsCode(true).safeParse(normalized));
  return msg ? `HS code: ${msg}` : null;
}

function validateOptionalDg(
  value: string,
  isDg: boolean,
  opts?: { requireWhenDg?: boolean },
): string | null {
  const t = value.trim();
  if (!t) {
    if (isDg && opts?.requireWhenDg) {
      return 'DG class is required when cargo is dangerous goods (e.g. 3 or 2.1).';
    }
    return null;
  }
  const msg = zodMessage(dgClass(true).safeParse(t));
  return msg ? `DG class: ${msg}` : null;
}

function validateOptionalIsoCountry(value: string, label: string): string | null {
  const t = value.trim();
  if (!t) return null;
  const msg = zodMessage(countryCode(true).safeParse(t));
  return msg ? `${label}: ${msg}` : null;
}

function validateOptionalCurrency(value: string): string | null {
  const t = value.trim();
  if (!t) return null;
  const msg = zodMessage(currencyCode(true).safeParse(t));
  return msg ? `Invoice currency: ${msg}` : null;
}

/**
 * Party "Other details" often holds email / phone / website.
 * Validate clear single-value formats and any embedded emails.
 */
export function validatePartyContactDetails(
  value: string,
  partyLabel: string,
): string | null {
  const t = value.trim();
  if (!t) return null;

  if (t.includes('@') && !/\s/.test(t)) {
    const msg = zodMessage(optionalEmail().safeParse(t));
    return msg ? `${partyLabel} other details: ${msg}` : null;
  }

  if (/^https?:\/\//i.test(t) || /^www\./i.test(t)) {
    const msg = zodMessage(optionalUrl().safeParse(t));
    return msg ? `${partyLabel} other details: ${msg}` : null;
  }

  if (/^\+?[\d\s().-]{7,20}$/.test(t)) {
    const msg = zodMessage(optionalPhone().safeParse(t));
    return msg ? `${partyLabel} other details: ${V.phone}` : null;
  }

  const emails = t.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi) ?? [];
  for (const email of emails) {
    const msg = zodMessage(optionalEmail().safeParse(email));
    if (msg) return `${partyLabel} other details: invalid email "${email}".`;
  }

  return null;
}

function validatePartyName(name: string, label: string, required: boolean): string | null {
  const normalized = String(normalizeName(name) ?? '').trim();
  if (!normalized) return required ? `${label} full name is required.` : null;
  if (normalized.length < RULES.NAME_MIN) {
    return `${label} full name: ${V.minLength(RULES.NAME_MIN)}.`;
  }
  const logical = isLogicalName(normalized);
  if (!logical.ok) {
    return `${label} full name: enter a valid name (letters required).`;
  }
  return null;
}

function validateParty(
  party: BookingFormPartyInput,
  label: string,
  opts: { requireNameAddress: boolean },
): string | null {
  const nameErr = validatePartyName(party.full_name, label, opts.requireNameAddress);
  if (nameErr) return nameErr;
  if (opts.requireNameAddress && !party.address.trim()) {
    return `${label} address is required.`;
  }
  // Country may be full name or ISO-2 — only format-check strict ISO when length is 2
  if (party.country.trim().length === 2) {
    const isoErr = validateOptionalIsoCountry(party.country, `${label} country`);
    if (isoErr) return isoErr;
  }
  return validatePartyContactDetails(party.other_details, label);
}

function validateWeights(form: BookingFormValidationInput): string | null {
  const grossMsg = zodMessage(weightSchema.safeParse(form.gross_weight_kg));
  if (grossMsg) return `Gross weight (kg): ${grossMsg}`;

  const netMsg = zodMessage(weightSchema.safeParse(form.net_weight_kg));
  if (netMsg) return `Net weight (kg): ${netMsg}`;

  const gross = parseOptionalNumber(form.gross_weight_kg);
  const net = parseOptionalNumber(form.net_weight_kg);
  if (gross != null && net != null && net > gross) {
    return 'Net weight cannot be greater than gross weight.';
  }

  if (form.chargeable_weight_kg.trim()) {
    const cwMsg = zodMessage(optionalWeightSchema.safeParse(form.chargeable_weight_kg));
    if (cwMsg) return `Chargeable weight (kg): ${cwMsg}`;
  }

  if (form.volume_cbm.trim()) {
    const volMsg = zodMessage(optionalVolumeSchema.safeParse(form.volume_cbm));
    if (volMsg) return `Volume (CBM): ${volMsg}`;
  }

  if (form.pallet_count.trim()) {
    const pcMsg = zodMessage(optionalPiecesSchema.safeParse(form.pallet_count));
    if (pcMsg) return `Pallet count: ${pcMsg}`;
  }

  return null;
}

function validateVoyage(
  form: BookingFormValidationInput,
  kind: PortalBookingFormKind,
): string | null {
  const dateErr = validateDate(form.date_of_request, 'Date of request', { required: false });
  if (dateErr) return dateErr;

  if (kind === 'sea') {
    if (!form.teu_count.trim()) return 'Number of TEUs is required (e.g. 1 or 2.25).';
    const teuMsg = zodMessage(teuSchema.safeParse(form.teu_count));
    if (teuMsg) return `TEUs: ${teuMsg} (0.01–10).`;
    if (!form.pol.trim()) return 'POL — Port of Loading is required.';
    if (!form.pod.trim()) return 'POD — Port of Discharge is required.';
  } else if (kind === 'air') {
    const originErr = validateOptionalIata(form.origin_airport_code, 'Origin airport code', true);
    if (originErr) return originErr;
    const destErr = validateOptionalIata(form.dest_airport_code, 'Destination airport code', true);
    if (destErr) return destErr;
    if (
      form.origin_airport_code.trim().toUpperCase() ===
      form.dest_airport_code.trim().toUpperCase()
    ) {
      return 'Origin and destination airport codes must be different.';
    }
    if (!form.pieces.trim()) return 'Pieces is required.';
    const piecesMsg = zodMessage(piecesSchema.safeParse(form.pieces));
    if (piecesMsg) return `Pieces: ${piecesMsg}`;
  } else if (kind === 'warehouse') {
    if (!form.origin_door_address.trim() && !form.pol.trim()) {
      return 'Pickup / origin address is required.';
    }
    if (!form.warehouse_name.trim() && !form.pod.trim()) {
      return 'Warehouse name is required.';
    }
    if (!form.pieces.trim()) return 'Pieces is required.';
    const piecesMsg = zodMessage(piecesSchema.safeParse(form.pieces));
    if (piecesMsg) return `Pieces: ${piecesMsg}`;
    const inErr = validateDateTimeLocal(form.expected_inbound_at, 'Expected inbound');
    if (inErr) return inErr;
    const outErr = validateDateTimeLocal(form.expected_outbound_at, 'Expected outbound');
    if (outErr) return outErr;
    if (form.expected_inbound_at.trim() && form.expected_outbound_at.trim()) {
      if (Date.parse(form.expected_outbound_at) < Date.parse(form.expected_inbound_at)) {
        return 'Expected outbound must be on or after expected inbound.';
      }
    }
    if (form.storage_days_requested.trim()) {
      const daysMsg = zodMessage(optionalDaysSchema.safeParse(form.storage_days_requested));
      if (daysMsg) return `Storage days: ${daysMsg}`;
    }
  } else if (kind === 'road' || kind === 'land' || kind === 'courier') {
    const origin =
      form.origin_city_country.trim() || form.origin_door_address.trim() || form.pol.trim();
    const dest =
      form.dest_city_country.trim() || form.dest_door_address.trim() || form.pod.trim();
    if (!origin) return 'Origin city / country is required.';
    if (!dest) return 'Destination city / country is required.';
    if (!form.pieces.trim()) return 'Pieces is required.';
    const piecesMsg = zodMessage(piecesSchema.safeParse(form.pieces));
    if (piecesMsg) return `Pieces: ${piecesMsg}`;
    const etdErr = validateDateTimeLocal(form.etd, 'ETD');
    if (etdErr) return etdErr;
    const etaErr = validateDateTimeLocal(form.eta, 'ETA');
    if (etaErr) return etaErr;
    if (form.etd.trim() && form.eta.trim() && Date.parse(form.eta) < Date.parse(form.etd)) {
      return 'ETA must be on or after ETD.';
    }
  } else if (kind === 'customs') {
    if (!form.direction.trim()) return 'Direction is required.';
    if (!form.border_or_port.trim() && !form.port_of_entry.trim()) {
      return 'Border / port of entry is required.';
    }
    if (!form.pieces.trim()) return 'Pieces is required.';
    const piecesMsg = zodMessage(piecesSchema.safeParse(form.pieces));
    if (piecesMsg) return `Pieces: ${piecesMsg}`;
    const originIso = validateOptionalIsoCountry(form.country_of_origin, 'Country of origin');
    if (originIso) return originIso;
    const destIso = validateOptionalIsoCountry(
      form.country_of_destination,
      'Country of destination',
    );
    if (destIso) return destIso;
    if (form.invoice_value_amount.trim()) {
      const amtMsg = zodMessage(optionalAmountSchema.safeParse(form.invoice_value_amount));
      if (amtMsg) return `Invoice value: ${amtMsg}`;
    }
    const curErr = validateOptionalCurrency(form.invoice_currency);
    if (curErr) return curErr;
  }

  const weightErr = validateWeights(form);
  if (weightErr) return weightErr;

  const dgErr = validateOptionalDg(form.dg_class, form.is_dg, {
    requireWhenDg: kind === 'warehouse',
  });
  if (dgErr) return dgErr;

  // Optional numeric rows on voyage-related stock/pallets
  for (let i = 0; i < form.stock_lines.length; i += 1) {
    const line = form.stock_lines[i];
    if (!line) continue;
    const filled =
      line.sku_code.trim() ||
      line.description.trim() ||
      line.quantity.trim() ||
      line.cbm.trim();
    if (!filled) continue;
    if (line.quantity.trim()) {
      const qMsg = zodMessage(optionalAmountSchema.safeParse(line.quantity));
      if (qMsg) return `Stock line ${i + 1} quantity: ${qMsg}`;
    }
    if (line.cbm.trim()) {
      const cMsg = zodMessage(optionalVolumeSchema.safeParse(line.cbm));
      if (cMsg) return `Stock line ${i + 1} CBM: ${cMsg}`;
    }
  }

  for (let i = 0; i < form.pallets.length; i += 1) {
    const pallet = form.pallets[i];
    if (!pallet) continue;
    const filled =
      pallet.pallet_type.trim() ||
      pallet.length_cm.trim() ||
      pallet.width_cm.trim() ||
      pallet.height_cm.trim() ||
      pallet.weight_kg.trim();
    if (!filled && pallet.count.trim() === '1') continue;
    if (pallet.count.trim()) {
      const cMsg = zodMessage(optionalPiecesSchema.safeParse(pallet.count));
      if (cMsg) return `Pallet ${i + 1} count: ${cMsg}`;
    }
    for (const [key, label] of [
      ['length_cm', 'length'],
      ['width_cm', 'width'],
      ['height_cm', 'height'],
      ['weight_kg', 'weight'],
    ] as const) {
      const raw = pallet[key].trim();
      if (!raw) continue;
      const schema = key === 'weight_kg' ? optionalWeightSchema : optionalAmountSchema;
      const msg = zodMessage(schema.safeParse(raw));
      if (msg) return `Pallet ${i + 1} ${label}: ${msg}`;
    }
  }

  return null;
}

/**
 * Step validation for customer portal booking / compliance form.
 * Enforces required fields and shared format rules (IATA, HS, weights, ISO codes, contacts).
 */
export function validatePortalBookingFormStep(
  step: BookingFormStepId,
  form: BookingFormValidationInput,
  kind: PortalBookingFormKind,
): string | null {
  if (step === 'voyage') return validateVoyage(form, kind);

  if (step === 'shipper') {
    return validateParty(form.shipper, 'Shipper', { requireNameAddress: true });
  }

  if (step === 'consignee') {
    return validateParty(form.consignee, 'Consignee', { requireNameAddress: true });
  }

  if (step === 'notify') {
    // Notify is optional; validate format only when partially filled
    const filled =
      form.notify.full_name.trim() ||
      form.notify.address.trim() ||
      form.notify.other_details.trim();
    if (!filled) return null;
    return validateParty(form.notify, 'Notify party', { requireNameAddress: false });
  }

  if (step === 'billing') {
    const filled =
      form.billing.full_name.trim() ||
      form.billing.address.trim() ||
      form.billing.other_details.trim();
    if (!filled) return null;
    return validateParty(form.billing, 'Billing party', { requireNameAddress: false });
  }

  if (step === 'commodity') {
    if (!form.commodity.trim()) return 'Commodity is required.';
    if (form.commodity.trim().length < 2) {
      return 'Commodity must be at least 2 characters.';
    }
    const hsErr = validateOptionalHs(form.hs_code);
    if (hsErr) return hsErr;
    const dgErr = validateOptionalDg(form.dg_class, form.is_dg, {
      requireWhenDg: kind === 'warehouse',
    });
    if (dgErr) return dgErr;
    return null;
  }

  if (step === 'review') {
    if (!form.consent_accepted) {
      return 'Please accept consent before submitting.';
    }
    return null;
  }

  return null;
}

export function normalizeBookingHsCodeInput(value: string): string {
  return String(normalizeHsCode(value) ?? value).trim();
}

export function normalizeBookingIataInput(value: string): string {
  return value.trim().toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 3);
}

export function normalizeBookingIsoCountryInput(value: string): string {
  return value.trim().toUpperCase().replace(/[^A-Z]/g, '').slice(0, 2);
}

export function normalizeBookingCurrencyInput(value: string): string {
  return value.trim().toUpperCase().replace(/[^A-Z]/g, '').slice(0, 3);
}
