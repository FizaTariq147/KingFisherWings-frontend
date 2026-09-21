import type { ReactNode } from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { isNvoccJobType } from '@/features/nvocc/hooks/useNvoccJobs';
import { JOB_TYPE_LABELS, JOB_STATUS_LABELS } from '../../constants/job.constants';
import { useJobResolvedLabels } from '../../hooks/useJobResolvedLabels';
import type { Job } from '../../types/job.types';
import { jobDisplayNumber } from '../../utils/jobRoute';

function Row({ label, value }: { label: string; value?: string | number | boolean | null }) {
  let display = '—';
  if (typeof value === 'boolean') display = value ? 'Yes' : 'No';
  else if (value != null && value !== '') display = String(value);
  return (
    <div className="flex justify-between gap-4 py-1.5 text-sm border-b border-[var(--color-neutral-100)] last:border-0">
      <span className="shrink-0 text-[var(--color-neutral-500)]">{label}</span>
      <span className="text-[var(--color-neutral-800)] text-right font-medium break-all">
        {display}
      </span>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <div className="px-4 pb-4">{children}</div>
    </Card>
  );
}

function formatDate(value?: string | null): string | undefined {
  if (!value?.trim()) return undefined;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString(undefined, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function JobOverviewPanel({ job }: { job: Job }) {
  const labels = useJobResolvedLabels(job);

  const isAir = job.job_type === 'AIR_EXPORT' || job.job_type === 'AIR_IMPORT';
  const isSeaFcl =
    job.job_type === 'SEA_FCL_EXPORT' || job.job_type === 'SEA_FCL_IMPORT';
  const isSeaLcl =
    job.job_type === 'SEA_LCL_EXPORT' || job.job_type === 'SEA_LCL_IMPORT';
  const isNvocc = isNvoccJobType(job.job_type);
  const isCourier = job.job_type.includes('COURIER');
  const isLand = job.job_type.includes('LAND') || job.job_type.includes('ROAD');

  const air = job.air_details;
  const seaFcl = job.sea_fcl_details;
  const seaLcl = job.sea_lcl_details;
  const courier = job.courier_details;
  const land = job.land_details;

  const originDisplay = isAir ? labels.originAirportLabel : labels.originLabel;
  const destDisplay = isAir ? labels.destAirportLabel : labels.destinationLabel;

  return (
    <div className="space-y-4">
      <Section title="Basic">
        <Row label="Job number" value={jobDisplayNumber(job)} />
        <Row label="Type" value={JOB_TYPE_LABELS[job.job_type] ?? job.job_type} />
        <Row label="Status" value={JOB_STATUS_LABELS[job.status] ?? job.status} />
        <Row label="Branch" value={labels.branchLabel} />
        <Row label="Salesperson" value={labels.salespersonLabel} />
        <Row label="ETD" value={formatDate(job.etd) || job.etd} />
        <Row label="ETA" value={formatDate(job.eta) || job.eta} />
        <Row label="Incoterms" value={job.incoterms} />
        <Row label="Tags" value={job.tags?.length ? job.tags.join(', ') : undefined} />
        <Row label="Created" value={formatDate(job.created_at) || job.created_at} />
        <Row label="Updated" value={formatDate(job.updated_at) || job.updated_at} />
      </Section>

      <Section title="Parties">
        <Row label="Shipper" value={labels.shipperLabel} />
        <Row label="Consignee" value={labels.consigneeLabel} />
        <Row label="Billing party" value={labels.billingPartyLabel} />
        <Row label="Agent" value={labels.agentLabel} />
      </Section>

      <Section title="Route">
        <Row label="Origin" value={originDisplay} />
        <Row label="Destination" value={destDisplay} />
      </Section>

      <Section title="Cargo">
        <Row label="Commodity" value={job.commodity} />
        <Row label="HS code" value={job.hs_code} />
        <Row label="Pieces" value={job.pieces} />
        <Row label="Gross weight" value={job.gross_weight} />
        <Row label="Chargeable weight" value={job.chargeable_weight} />
        <Row label="Volume (CBM)" value={job.volume_cbm} />
        <Row label="Container type" value={labels.containerTypeLabel} />
        <Row label="Container count" value={job.container_count} />
        <Row
          label="Dangerous goods"
          value={job.is_dg ? `Yes (${job.dg_class || 'class —'})` : 'No'}
        />
      </Section>

      {isAir && (
        <Section title="Air details">
          <Row label="Airline" value={labels.airlineLabel} />
          <Row label="HAWB" value={air?.hawb_number} />
          <Row label="MAWB" value={air?.mawb_number} />
          <Row label="Flight number" value={air?.flight_number} />
          <Row label="Flight date" value={formatDate(air?.flight_date) || air?.flight_date} />
          <Row label="Origin airport" value={labels.originAirportLabel} />
          <Row label="Dest airport" value={labels.destAirportLabel} />
          <Row label="AWB type" value={air?.awb_type} />
          <Row label="Freight type" value={air?.freight_type} />
          <Row label="Screened" value={air?.screened} />
          <Row label="Screening ref" value={air?.screening_ref} />
          <Row label="Conversion factor" value={air?.conversion_factor} />
        </Section>
      )}

      {(isSeaFcl || isNvocc) && (
        <Section title={isNvocc ? 'NVOCC / sea details' : 'Sea FCL details'}>
          <Row label="Shipping line" value={labels.shippingLineLabel} />
          <Row label="Vessel" value={labels.vesselLabel} />
          <Row label="Voyage" value={seaFcl?.voyage_number} />
          <Row label="Booking number" value={seaFcl?.booking_number} />
          <Row label="Carrier booking ref" value={seaFcl?.carrier_booking_ref} />
          <Row label="HBL" value={seaFcl?.hbl_number} />
          <Row label="MBL" value={seaFcl?.mbl_number} />
          <Row label="Place of receipt" value={seaFcl?.place_of_receipt} />
          <Row label="Place of delivery" value={seaFcl?.place_of_delivery} />
          <Row label="POL" value={labels.originLabel} />
          <Row label="POD" value={labels.destinationLabel} />
          <Row label="ETD" value={formatDate(seaFcl?.etd) || seaFcl?.etd || job.etd} />
          <Row label="ETA" value={formatDate(seaFcl?.eta) || seaFcl?.eta || job.eta} />
          <Row label="Actual ETA" value={formatDate(seaFcl?.actual_eta) || seaFcl?.actual_eta} />
          <Row label="Incoterms" value={seaFcl?.incoterms || job.incoterms} />
          <Row label="Freight terms" value={seaFcl?.freight_terms} />
          <Row label="BL type" value={seaFcl?.bl_type} />
          <Row label="Stuffing location" value={seaFcl?.stuffing_location} />
          <Row label="Stuffing date" value={formatDate(seaFcl?.stuffing_date) || seaFcl?.stuffing_date} />
          <Row label="SI cutoff" value={formatDate(seaFcl?.si_cutoff) || seaFcl?.si_cutoff} />
          <Row label="VGM cutoff" value={formatDate(seaFcl?.vgm_cutoff) || seaFcl?.vgm_cutoff} />
          <Row label="CY cutoff" value={formatDate(seaFcl?.cy_cutoff) || seaFcl?.cy_cutoff} />
          <Row label="Transhipment" value={seaFcl?.transhipment_port} />
          <Row label="Sailed at" value={formatDate(seaFcl?.sailed_at) || seaFcl?.sailed_at} />
          <Row label="Customs status" value={seaFcl?.customs_status} />
          <Row label="Customs entry" value={seaFcl?.customs_entry_number} />
        </Section>
      )}

      {isSeaLcl && (
        <Section title="Sea LCL details">
          <Row label="Shipping line" value={labels.shippingLineLabel} />
          <Row label="Vessel" value={labels.vesselLabel} />
          <Row label="Voyage" value={seaLcl?.voyage_number} />
          <Row label="Booking number" value={seaLcl?.booking_number} />
          <Row label="Consolidation" value={seaLcl?.consolidation_number} />
          <Row label="HBL" value={seaLcl?.hbl_number} />
          <Row label="MBL" value={seaLcl?.mbl_number} />
          <Row label="POL" value={labels.originLabel} />
          <Row label="POD" value={labels.destinationLabel} />
          <Row label="ETD" value={formatDate(seaLcl?.etd) || seaLcl?.etd || job.etd} />
          <Row label="ETA" value={formatDate(seaLcl?.eta) || seaLcl?.eta || job.eta} />
          <Row label="Freight terms" value={seaLcl?.freight_terms} />
          <Row label="Customs status" value={seaLcl?.customs_status} />
        </Section>
      )}

      {isCourier && (
        <Section title="Courier details">
          <Row label="Vendor" value={labels.courierVendorLabel} />
          <Row label="Tracking number" value={courier?.tracking_number} />
          <Row label="Service type" value={courier?.service_type} />
          <Row label="Pickup address" value={courier?.pickup_address} />
          <Row label="Delivery address" value={courier?.delivery_address} />
          <Row
            label="Dimensions (cm)"
            value={
              courier?.length_cm != null || courier?.width_cm != null || courier?.height_cm != null
                ? `${courier?.length_cm ?? '—'} × ${courier?.width_cm ?? '—'} × ${courier?.height_cm ?? '—'}`
                : undefined
            }
          />
        </Section>
      )}

      {isLand && (
        <Section title="Land details">
          <Row label="Trucker" value={labels.truckerLabel} />
          <Row label="Vehicle number" value={land?.vehicle_number} />
          <Row label="Vehicle type" value={land?.vehicle_type} />
          <Row label="Driver" value={land?.driver_name} />
          <Row label="Driver license" value={land?.driver_license} />
          <Row label="Origin" value={land?.origin_city_country} />
          <Row label="Destination" value={land?.destination_city_country} />
          <Row label="ETD" value={formatDate(land?.etd) || land?.etd} />
          <Row label="ETA" value={formatDate(land?.eta) || land?.eta} />
          <Row label="Border commodity" value={land?.border_commodity} />
        </Section>
      )}

      <Section title="Notes">
        <Row label="Customer remarks" value={job.customer_remarks} />
        <Row label="Internal notes" value={job.notes} />
      </Section>

      {(job.charges?.length || job.milestones?.length || job.house_jobs?.length) && (
        <Section title="Linked counts">
          <Row label="Charges" value={job.charges?.length ?? 0} />
          <Row label="Milestones" value={job.milestones?.length ?? 0} />
          <Row label="House jobs" value={job.house_jobs?.length ?? 0} />
          <Row label="Containers" value={job.containers?.length ?? 0} />
          <Row label="Documents" value={job.documents?.length ?? 0} />
        </Section>
      )}
    </div>
  );
}
