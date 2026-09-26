import { JOB_STATUS_LABELS, JOB_TYPE_LABELS } from '../constants/job.constants';
import type { Job } from '../types/job.types';
import { jobDisplayNumber } from './jobRoute';
import { resolveJobBarcodeValue } from './resolveJobBarcode';
import type { JobBarcodePdfField, JobBarcodePdfModel } from './generateJobBarcodePdf';

export type JobBarcodePdfLabelBundle = {
  shipperLabel?: string;
  consigneeLabel?: string;
  billingPartyLabel?: string;
  agentLabel?: string;
  originLabel?: string;
  destinationLabel?: string;
  originAirportLabel?: string;
  destAirportLabel?: string;
  containerTypeLabel?: string;
  branchLabel?: string;
  salespersonLabel?: string;
  airlineLabel?: string;
  shippingLineLabel?: string;
  vesselLabel?: string;
  truckerLabel?: string;
  courierVendorLabel?: string;
};

function field(label: string, value?: string | number | boolean | null): JobBarcodePdfField | null {
  if (value == null || value === '') return null;
  if (typeof value === 'boolean') return { label, value: value ? 'Yes' : 'No' };
  const s = String(value).trim();
  if (!s || s === '—') return null;
  return { label, value: s };
}

function collect(...items: Array<JobBarcodePdfField | null | undefined>): JobBarcodePdfField[] {
  return items.filter((x): x is JobBarcodePdfField => Boolean(x));
}

function fmtDate(value?: string | null): string | undefined {
  if (!value?.trim()) return undefined;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

/** Map a job (+ resolved labels) into the barcode PDF model. */
export function jobToBarcodePdfModel(
  job: Job,
  labels: JobBarcodePdfLabelBundle = {},
  barcodePngBytes?: Uint8Array,
): JobBarcodePdfModel {
  const isAir = job.job_type === 'AIR_EXPORT' || job.job_type === 'AIR_IMPORT';
  const isSea =
    job.job_type.startsWith('SEA_') ||
    job.job_type.startsWith('NVOCC_');
  const isCourier = job.job_type.includes('COURIER');
  const isRoad = job.job_type === 'ROAD_FREIGHT';
  const isLand = job.job_type === 'LAND';

  const air = job.air_details;
  const seaFcl = job.sea_fcl_details;
  const seaLcl = job.sea_lcl_details;
  const courier = job.courier_details;
  const road = job.road_freight_details;
  const land = job.land_details;
  const roadLand = isRoad ? road : isLand ? land : undefined;

  const origin = isAir
    ? labels.originAirportLabel || labels.originLabel
    : labels.originLabel || job.origin_port_code || job.origin_port_name;
  const destination = isAir
    ? labels.destAirportLabel || labels.destinationLabel
    : labels.destinationLabel || job.dest_port_code || job.dest_port_name;

  const parties = collect(
    field('Shipper', labels.shipperLabel || job.shipper_name),
    field('Consignee', labels.consigneeLabel || job.consignee_name),
    field('Billing party', labels.billingPartyLabel),
    field('Agent', labels.agentLabel || job.agent_name),
  );

  const route = collect(
    field('Origin', origin),
    field('Destination', destination),
    field('ETD', fmtDate(job.etd) || job.etd),
    field('ETA', fmtDate(job.eta) || job.eta),
    field('Incoterms', job.incoterms),
  );

  const cargo = collect(
    field('Commodity', job.commodity),
    field('HS code', job.hs_code),
    field('Pieces', job.pieces),
    field('Gross weight', job.gross_weight != null ? `${job.gross_weight} kg` : undefined),
    field(
      'Chargeable wt',
      job.chargeable_weight != null ? `${job.chargeable_weight} kg` : undefined,
    ),
    field('Volume', job.volume_cbm != null ? `${job.volume_cbm} CBM` : undefined),
    field('Container type', labels.containerTypeLabel),
    field('Containers', job.container_count),
    field('Dangerous goods', job.is_dg ? `Yes (${job.dg_class || '—'})` : undefined),
  );

  const modeDetails = collect(
    ...(isAir
      ? [
          field('Airline', labels.airlineLabel),
          field('HAWB', air?.hawb_number),
          field('MAWB', air?.mawb_number),
          field('Flight', air?.flight_number),
          field('Flight date', fmtDate(air?.flight_date) || air?.flight_date),
          field('AWB type', air?.awb_type),
          field('Freight type', air?.freight_type),
        ]
      : []),
    ...(isSea
      ? [
          field('Shipping line', labels.shippingLineLabel),
          field('Vessel', labels.vesselLabel),
          field('Voyage', seaFcl?.voyage_number || seaLcl?.voyage_number),
          field('HBL', seaFcl?.hbl_number || seaLcl?.hbl_number),
          field('MBL', seaFcl?.mbl_number || seaLcl?.mbl_number),
          field('Booking No.', seaFcl?.booking_number || seaLcl?.booking_number),
        ]
      : []),
    ...(isCourier
      ? [
          field('Courier vendor', labels.courierVendorLabel),
          field('Tracking', courier?.tracking_number),
          field('Service type', courier?.service_type),
        ]
      : []),
    ...(isRoad || isLand
      ? [
          field('Trucker', labels.truckerLabel),
          field('Vehicle', roadLand?.vehicle_number),
          field('Driver', roadLand?.driver_name),
          field('Origin', roadLand?.origin_city_country),
          field('Destination', roadLand?.destination_city_country),
        ]
      : []),
  );

  const other = collect(
    field('Branch', labels.branchLabel || job.branch_name),
    field('Salesperson', labels.salespersonLabel || job.salesperson_name),
    field('Created', fmtDate(job.created_at) || job.created_at),
  );

  return {
    jobNumber: jobDisplayNumber(job),
    barcodeValue: resolveJobBarcodeValue(job),
    barcodePngBytes,
    jobType: JOB_TYPE_LABELS[job.job_type] ?? job.job_type,
    status: JOB_STATUS_LABELS[job.status] ?? job.status,
    documentDate: new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }),
    parties,
    route,
    cargo,
    modeDetails,
    other,
    notes: job.notes || job.customer_remarks || undefined,
  };
}
