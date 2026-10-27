import { jobService } from '@/features/jobs/services/job.service';
import { staffBookingFormModeFromJob } from '@/features/jobs/hooks/useStaffBookingForm';
import { asRecord, pickString } from '@/features/portal-shared/normalize';
import { isUuid } from '@/lib/isUuid';
import { shipmentService } from '@/features/shipments/services/shipment.service';

function httpStatus(error: unknown): number | undefined {
  if (!error || typeof error !== 'object') return undefined;
  const status = (error as { response?: { status?: number } }).response?.status;
  return typeof status === 'number' ? status : undefined;
}

function partyFromBooking(
  parties: unknown,
  role: string,
): Record<string, unknown> | undefined {
  if (!Array.isArray(parties)) return undefined;
  const needle = role.toLowerCase();
  for (const item of parties) {
    const rec = asRecord(item);
    if (!rec) continue;
    const type = pickString(
      rec.party_role,
      rec.partyRole,
      rec.role,
      rec.type,
      rec.party_type,
    ).toLowerCase();
    if (type.includes(needle)) return rec;
  }
  return undefined;
}

/** Normalize booking-form / job payloads into BL-draft preview shape. */
export function bookingFormToBlDraftPreview(raw: unknown): Record<string, unknown> {
  const root = asRecord(raw) ?? {};
  const form =
    asRecord(root.form) ??
    asRecord(root.booking_form) ??
    asRecord(root.bookingForm) ??
    asRecord(root.data) ??
    root;

  const parties = form.parties ?? root.parties;
  const shipper =
    partyFromBooking(parties, 'shipper') ??
    asRecord(form.shipper) ??
    asRecord(root.shipper);
  const consignee =
    partyFromBooking(parties, 'consignee') ??
    asRecord(form.consignee) ??
    asRecord(root.consignee);
  const notify =
    partyFromBooking(parties, 'notify') ??
    asRecord(form.notify) ??
    asRecord(form.notify_party) ??
    asRecord(root.notify);

  const containers =
    form.containers ??
    root.containers ??
    form.container_list ??
    root.container_list;

  return {
    ...form,
    shipper,
    consignee,
    notify,
    notify_party: notify,
    containers,
    pol: pickString(form.pol, form.port_of_loading, form.portOfLoading, root.pol),
    pod: pickString(form.pod, form.port_of_discharge, form.portOfDischarge, root.pod),
    place_of_receipt: pickString(
      form.place_of_receipt,
      form.placeOfReceipt,
      form.pol,
      root.place_of_receipt,
    ),
    place_of_delivery: pickString(
      form.place_of_delivery,
      form.placeOfDelivery,
      form.pod,
      root.place_of_delivery,
    ),
    commodity: pickString(form.commodity, form.goods_description, root.commodity),
    vessel: pickString(form.vessel, form.vessel_name, form.vesselName, root.vessel),
    voyage: pickString(form.voyage, form.voyage_no, form.voyageNo, root.voyage),
    freight_terms: pickString(
      form.freight_terms,
      form.freightTerms,
      form.incoterms,
      root.freight_terms,
    ),
    pieces: pickString(form.pieces, form.package_count, root.pieces),
    gross_weight: pickString(
      form.gross_weight_kg,
      form.gross_weight,
      form.grossWeightKg,
      root.gross_weight,
    ),
    volume_cbm: pickString(form.volume_cbm, form.volumeCbm, form.measurement, root.volume_cbm),
    job_number: pickString(form.job_number, form.jobNumber, root.job_number),
    bl_number: pickString(
      form.bl_number,
      form.hbl_number,
      form.hblNumber,
      form.client_booking_no,
      form.clientBookingNo,
    ),
  };
}

async function loadJobBookingFormPreview(jobId: string): Promise<Record<string, unknown>> {
  try {
    const job = await jobService.getById(jobId);
    const mode = staffBookingFormModeFromJob({ job_type: job.job_type });
    if (!mode) {
      return bookingFormToBlDraftPreview({
        shipper_name: job.shipper_name,
        consignee_name: job.consignee_name,
        pol: job.origin_port_code,
        pod: job.dest_port_code,
        commodity: job.commodity,
        job_number: job.job_number,
        etd: job.etd,
        eta: job.eta,
      });
    }

    let form: unknown;
    switch (mode) {
      case 'SEA_FCL':
        form = await jobService.getSeaFclBookingForm(jobId);
        break;
      case 'SEA_LCL':
        form = await jobService.getSeaLclBookingForm(jobId);
        break;
      case 'LAND':
        form = await jobService.getLandBookingForm(jobId);
        break;
      case 'ROAD_FREIGHT':
        form = await jobService.getRoadFreightBookingForm(jobId);
        break;
      case 'COURIER':
        form = await jobService.getCourierBookingForm(jobId);
        break;
      case 'WAREHOUSE':
        form = await jobService.getWarehouseBookingForm(jobId);
        break;
      case 'CUSTOMS_CLEARANCE':
        form = await jobService.getCustomsClearanceBookingForm(jobId);
        break;
      default:
        form = {};
    }
    return bookingFormToBlDraftPreview({
      ...(asRecord(form) ?? {}),
      job_number: job.job_number,
      pol: job.origin_port_code,
      pod: job.dest_port_code,
      etd: job.etd,
      eta: job.eta,
    });
  } catch {
    return {};
  }
}

/**
 * Prefer GET …/bl-draft/preview. On 404/unavailable, fall back to quotation or
 * job booking-form so Generate still works with classic client PDF.
 */
export async function loadBlDraftSource(opts: {
  jobId?: string;
  shipmentId?: string;
  quotationId?: string;
}): Promise<{ preview: Record<string, unknown>; source: 'bl-draft' | 'booking-form' | 'empty' }> {
  const jobId = opts.jobId && isUuid(opts.jobId) ? opts.jobId : '';
  const shipmentId = opts.shipmentId && isUuid(opts.shipmentId) ? opts.shipmentId : '';
  const quotationId = opts.quotationId && isUuid(opts.quotationId) ? opts.quotationId : '';

  if (jobId) {
    try {
      const data = await jobService.getBlDraftPreview(jobId);
      const preview =
        data && typeof data === 'object' && !Array.isArray(data)
          ? (data as Record<string, unknown>)
          : {};
      return { preview, source: 'bl-draft' };
    } catch (err) {
      if (httpStatus(err) !== 404) {
        // Still try booking-form fallback for other failures.
      }
    }
  }

  if (shipmentId) {
    try {
      const data = await shipmentService.getBlDraftPreview(shipmentId);
      const preview =
        data && typeof data === 'object' && !Array.isArray(data)
          ? (data as Record<string, unknown>)
          : {};
      return { preview, source: 'bl-draft' };
    } catch {
      /* fall through */
    }
  }

  if (quotationId) {
    try {
      const { quotationService } = await import(
        '@/features/quotations/services/quotation.service'
      );
      const form = await quotationService.getBookingForm(quotationId);
      return { preview: bookingFormToBlDraftPreview(form), source: 'booking-form' };
    } catch {
      /* fall through */
    }
  }

  if (jobId) {
    const preview = await loadJobBookingFormPreview(jobId);
    if (Object.keys(preview).length) {
      return { preview, source: 'booking-form' };
    }
  }

  return { preview: {}, source: 'empty' };
}
