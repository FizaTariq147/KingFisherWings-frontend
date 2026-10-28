import { jobService } from '@/features/jobs/services/job.service';
import type { AirBookingForm, AirBookingFormParty } from '@/features/jobs/types/job.types';
import { asRecord, pickString } from '@/features/portal-shared/normalize';
import { isUuid } from '@/lib/isUuid';
import { shipmentService } from '@/features/shipments/services/shipment.service';

function httpStatus(error: unknown): number | undefined {
  if (!error || typeof error !== 'object') return undefined;
  const status = (error as { response?: { status?: number } }).response?.status;
  return typeof status === 'number' ? status : undefined;
}

function numStr(value: unknown): string {
  if (value == null || value === '') return '';
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  return String(value).trim();
}

function partyFromAirBooking(
  parties: unknown,
  kind: string,
): Record<string, unknown> | undefined {
  if (!Array.isArray(parties)) return undefined;
  const needle = kind.toLowerCase();
  for (const item of parties) {
    const rec = asRecord(item);
    if (!rec) continue;
    const type = pickString(
      rec.party_kind,
      rec.partyKind,
      rec.party_role,
      rec.role,
      rec.type,
    ).toLowerCase();
    if (type.includes(needle)) return rec;
  }
  return undefined;
}

function partyLines(raw: Record<string, unknown> | undefined): string[] {
  if (!raw) return [];
  const name = pickString(
    raw.full_name,
    raw.fullName,
    raw.name,
    raw.party_name,
    raw.company_name,
  );
  const address = pickString(raw.address, raw.full_address, raw.address_line1);
  const city = pickString(raw.city);
  const country = pickString(raw.country, raw.country_code, raw.countryCode);
  const other = pickString(raw.other_details, raw.otherDetails);
  return [name, address, [city, country].filter(Boolean).join(', '), other]
    .map((l) => String(l || '').trim())
    .filter(Boolean);
}

/**
 * Normalize air booking-form + air_details + job header into AWB draft preview shape
 * (same role as bookingFormToBlDraftPreview for sea BL).
 */
export function bookingFormToAwbDraftPreview(raw: unknown): Record<string, unknown> {
  const root = asRecord(raw) ?? {};
  const form =
    asRecord(root.form) ??
    asRecord(root.booking_form) ??
    asRecord(root.bookingForm) ??
    asRecord(root.air_booking_form) ??
    asRecord(root.data) ??
    root;
  const airDetails =
    asRecord(root.air_details) ??
    asRecord(root.airDetails) ??
    asRecord(form.air_details) ??
    {};

  const parties = form.parties ?? root.parties;
  const shipper =
    partyFromAirBooking(parties, 'shipper') ??
    asRecord(form.shipper) ??
    asRecord(root.shipper);
  const consignee =
    partyFromAirBooking(parties, 'consignee') ??
    asRecord(form.consignee) ??
    asRecord(root.consignee);
  const notify =
    partyFromAirBooking(parties, 'notify') ??
    asRecord(form.notify) ??
    asRecord(form.notify_party) ??
    asRecord(root.notify);

  const originAirport = pickString(
    form.origin_airport_code,
    form.originAirportCode,
    airDetails.origin_airport_code,
    root.origin_airport_code,
    root.origin_port_code,
  );
  const destAirport = pickString(
    form.dest_airport_code,
    form.destAirportCode,
    airDetails.dest_airport_code,
    root.dest_airport_code,
    root.dest_port_code,
  );

  const flightNumber = pickString(
    form.flight_number,
    form.flightNumber,
    airDetails.flight_number,
    root.flight_number,
  );
  const flightDate = pickString(
    form.flight_date,
    form.flightDate,
    airDetails.flight_date,
    root.flight_date,
  );
  const vesselFlight = [flightNumber, flightDate].filter(Boolean).join(' / ');

  const hawbNumber = pickString(
    airDetails.hawb_number,
    airDetails.hawbNumber,
    form.hawb_number,
    form.hawbNumber,
    root.hawb_number,
  );
  const mawbNumber = pickString(
    airDetails.mawb_number,
    airDetails.mawbNumber,
    form.mawb_from_origin,
    form.mawbFromOrigin,
    form.mawb_number,
    root.mawb_number,
  );

  return {
    ...form,
    shipper,
    consignee,
    notify,
    notify_party: notify,
    shipper_lines: partyLines(shipper),
    consignee_lines: partyLines(consignee),
    notify_lines: partyLines(notify),
    origin_airport_code: originAirport,
    dest_airport_code: destAirport,
    pol: originAirport,
    pod: destAirport,
    flight_number: flightNumber,
    flight_date: flightDate,
    vessel_flight: vesselFlight,
    hawb_number: hawbNumber,
    mawb_number: mawbNumber,
    pieces: numStr(form.pieces ?? root.pieces),
    gross_weight: numStr(
      form.gross_weight_kg ?? form.gross_weight ?? root.gross_weight_kg ?? root.gross_weight,
    ),
    chargeable_weight: numStr(
      form.chargeable_weight_kg ??
        form.chargeable_weight ??
        root.chargeable_weight_kg ??
        root.chargeable_weight,
    ),
    volume_cbm: numStr(form.volume_cbm ?? form.volumeCbm ?? root.volume_cbm),
    commodity: pickString(form.commodity, form.goods_description, root.commodity),
    freight_type: pickString(
      airDetails.freight_type,
      form.freight_type,
      form.freight_terms,
      root.freight_type,
    ),
    awb_type: pickString(airDetails.awb_type, form.awb_type, root.awb_type),
    customs_value: numStr(form.customs_value ?? root.customs_value),
    agent_at_origin: pickString(form.agent_at_origin, form.agentAtOrigin),
    delivery_address: pickString(form.delivery_address, form.deliveryAddress),
    job_number: pickString(form.job_number, form.jobNumber, root.job_number),
    etd: pickString(form.etd, form.flight_date, root.etd),
    eta: pickString(form.eta, root.eta),
    currency_code: pickString(form.currency_code, root.currency_code),
  };
}

async function loadJobAirBookingPreview(jobId: string): Promise<Record<string, unknown>> {
  try {
    const job = await jobService.getById(jobId);
    let form: AirBookingForm = {};
    try {
      form = await jobService.getAirBookingForm(jobId);
    } catch {
      form = {};
    }

    const airDetails = asRecord(job.air_details) ?? {};
    const headerShipper =
      job.shipper_name?.trim()
        ? ({ full_name: job.shipper_name } as AirBookingFormParty)
        : undefined;
    const headerConsignee =
      job.consignee_name?.trim()
        ? ({ full_name: job.consignee_name } as AirBookingFormParty)
        : undefined;

    const parties =
      Array.isArray(form.parties) && form.parties.length
        ? form.parties
        : [
            ...(headerShipper
              ? [{ ...headerShipper, party_kind: 'SHIPPER' as const }]
              : []),
            ...(headerConsignee
              ? [{ ...headerConsignee, party_kind: 'CONSIGNEE' as const }]
              : []),
          ];

    return bookingFormToAwbDraftPreview({
      ...(asRecord(form) ?? {}),
      parties,
      air_details: airDetails,
      job_number: job.job_number,
      origin_port_code: job.origin_port_code,
      dest_port_code: job.dest_port_code,
      etd: job.etd,
      eta: job.eta,
      commodity: form.commodity || job.commodity,
      currency_code: job.currency_code,
    });
  } catch {
    return {};
  }
}

/**
 * Prefer optional GET …/hawb-draft|awb-draft/preview (job or shipment).
 * On 404/unavailable, fall back to air-booking-form + air_details (BL-parity).
 *
 * Backend requirements (optional — soft-404 → FE merge):
 * - GET /jobs/:id/hawb-draft/preview
 * - GET /jobs/:id/mawb-draft/preview
 * - GET /jobs/:id/awb-draft/preview
 * - GET /shipments/:id/hawb-draft/preview (or /awb-draft/preview)
 * - POST /jobs/:id/hawb-draft/generate · POST /shipments/:id/hawb-draft/generate
 */
export async function loadAwbDraftSource(opts: {
  jobId?: string;
  shipmentId?: string;
  quotationId?: string;
  documentKind?: 'hawb' | 'mawb' | 'awb';
}): Promise<{
  preview: Record<string, unknown>;
  source: 'awb-draft' | 'booking-form' | 'empty';
  resolvedJobId?: string;
}> {
  const jobId = opts.jobId && isUuid(opts.jobId) ? opts.jobId : '';
  const shipmentId = opts.shipmentId && isUuid(opts.shipmentId) ? opts.shipmentId : '';
  const quotationId = opts.quotationId && isUuid(opts.quotationId) ? opts.quotationId : '';
  const kind = opts.documentKind ?? 'hawb';

  if (jobId) {
    try {
      const data = await jobService.getAwbDraftPreview(jobId, kind);
      const preview =
        data && typeof data === 'object' && !Array.isArray(data)
          ? bookingFormToAwbDraftPreview(data)
          : {};
      if (Object.keys(preview).length) {
        return { preview, source: 'awb-draft', resolvedJobId: jobId };
      }
    } catch (err) {
      if (httpStatus(err) !== 404) {
        /* still try booking-form fallback */
      }
    }
  }

  if (shipmentId) {
    try {
      const data = await shipmentService.getAwbDraftPreview(shipmentId, kind);
      const preview =
        data && typeof data === 'object' && !Array.isArray(data)
          ? bookingFormToAwbDraftPreview(data)
          : {};
      if (Object.keys(preview).length) {
        return { preview, source: 'awb-draft', resolvedJobId: jobId || undefined };
      }
    } catch {
      /* fall through */
    }
  }

  if (quotationId && !jobId) {
    try {
      const { quotationService } = await import(
        '@/features/quotations/services/quotation.service'
      );
      const form = await quotationService.getBookingForm(quotationId);
      const preview = bookingFormToAwbDraftPreview(form);
      if (Object.keys(preview).length) {
        return { preview, source: 'booking-form' };
      }
    } catch {
      /* fall through */
    }
  }

  if (jobId) {
    const preview = await loadJobAirBookingPreview(jobId);
    if (Object.keys(preview).length) {
      return { preview, source: 'booking-form', resolvedJobId: jobId };
    }
  }

  return { preview: {}, source: 'empty', resolvedJobId: jobId || undefined };
}
