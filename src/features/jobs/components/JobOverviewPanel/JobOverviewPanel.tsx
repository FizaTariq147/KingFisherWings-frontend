import type { ReactNode } from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { isNvoccJobType } from '@/features/nvocc/hooks/useNvoccJobs';
import { isUuid } from '@/lib/isUuid';
import { JOB_TYPE_LABELS, JOB_STATUS_LABELS } from '../../constants/job.constants';
import { useJobResolvedLabels } from '../../hooks/useJobResolvedLabels';
import type { Job } from '../../types/job.types';
import { jobDisplayNumber } from '../../utils/jobRoute';

/** Prefer a human label; never surface a bare UUID as the overview value. */
function humanValue(value?: string | number | boolean | null): string | number | boolean | undefined {
  if (value == null || value === '') return undefined;
  if (typeof value === 'string' && isUuid(value)) return undefined;
  return value;
}

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
  const isCourier = job.job_type === 'COURIER' || job.job_type.includes('COURIER');
  const isLand = job.job_type === 'LAND';
  const isRoad = job.job_type === 'ROAD_FREIGHT';
  const isWarehouse = job.job_type === 'WAREHOUSE';
  const isCustoms = job.job_type === 'CUSTOMS_CLEARANCE';
  const isService = job.job_type === 'SERVICE_JOB';

  const air = job.air_details;
  const seaFcl = job.sea_fcl_details;
  const seaLcl = job.sea_lcl_details;
  const courier = job.courier_details;
  const land = job.land_details;
  const road = job.road_freight_details;
  const roadLand = isRoad ? road : isLand ? land : undefined;
  const sea = isSeaLcl ? seaLcl : seaFcl;

  const originDisplay = isAir
    ? labels.originAirportLabel
    : isLand || isRoad
      ? roadLand?.origin_city_country || labels.originLabel
      : labels.originLabel;
  const destDisplay = isAir
    ? labels.destAirportLabel
    : isLand || isRoad
      ? roadLand?.destination_city_country || labels.destinationLabel
      : labels.destinationLabel;

  const freightTerms =
    seaFcl?.freight_terms ??
    seaLcl?.freight_terms ??
    roadLand?.freight_terms ??
    air?.freight_type;

  return (
    <div className="space-y-4">
      <Section title="Basic">
        <Row label="Job number" value={jobDisplayNumber(job)} />
        <Row label="Type" value={JOB_TYPE_LABELS[job.job_type] ?? job.job_type} />
        <Row label="Status" value={JOB_STATUS_LABELS[job.status] ?? job.status} />
        <Row label="Branch" value={labels.branchLabel} />
        <Row label="Department" value={humanValue(job.department_id)} />
        <Row label="Parent job" value={humanValue(job.parent_job_id)} />
        <Row label="Salesperson" value={labels.salespersonLabel} />
        <Row label="Ops user" value={humanValue(job.ops_user_id)} />
        <Row label="ETD" value={formatDate(job.etd) || job.etd} />
        <Row label="ETA" value={formatDate(job.eta) || job.eta} />
        <Row label="Incoterms" value={job.incoterms || sea?.incoterms || roadLand?.incoterms} />
        <Row label="Service scope" value={job.service_scope} />
        <Row label="Freight terms" value={freightTerms} />
        <Row label="Tags" value={job.tags?.length ? job.tags.join(', ') : undefined} />
        <Row
          label="Barcode"
          value={
            job.barcode || job.barcode_value || job.courier_details?.barcode_value || undefined
          }
        />
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
        <Row label="Origin door" value={job.origin_door_address} />
        <Row label="Dest door" value={job.dest_door_address} />
      </Section>

      <Section title="Cargo">
        <Row label="Commodity" value={job.commodity} />
        <Row label="Cargo category" value={job.cargo_category} />
        <Row label="HS code" value={job.hs_code} />
        <Row label="Pieces" value={job.pieces} />
        <Row label="Gross weight" value={job.gross_weight} />
        <Row label="Chargeable weight" value={job.chargeable_weight} />
        <Row label="Volume (CBM)" value={job.volume_cbm} />
        <Row label="Container type" value={labels.containerTypeLabel} />
        <Row label="Container count" value={job.container_count} />
        <Row
          label="Dangerous goods"
          value={job.is_dg ? `Yes (${job.dg_class || 'class —'})` : job.is_dg === false ? 'No' : undefined}
        />
        <Row label="DG class" value={job.dg_class} />
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
          <Row label="HBL from agent" value={seaFcl?.hbl_number_from_agent} />
          <Row label="MBL from line" value={seaFcl?.mbl_number_from_line} />
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
          <Row label="SI submitted" value={formatDate(seaFcl?.si_submitted_at) || seaFcl?.si_submitted_at} />
          <Row label="SI version" value={seaFcl?.si_version} />
          <Row label="VGM cutoff" value={formatDate(seaFcl?.vgm_cutoff) || seaFcl?.vgm_cutoff} />
          <Row label="VGM submitted" value={formatDate(seaFcl?.vgm_submitted_at) || seaFcl?.vgm_submitted_at} />
          <Row label="VGM method" value={seaFcl?.vgm_method} />
          <Row label="CY cutoff" value={formatDate(seaFcl?.cy_cutoff) || seaFcl?.cy_cutoff} />
          <Row label="Transhipment" value={seaFcl?.transhipment_port} />
          <Row label="Sailed at" value={formatDate(seaFcl?.sailed_at) || seaFcl?.sailed_at} />
          <Row label="Customs status" value={seaFcl?.customs_status} />
          <Row label="Customs entry" value={seaFcl?.customs_entry_number} />
          <Row label="Customs examination" value={seaFcl?.customs_examination_details} />
          <Row label="Customs duty" value={seaFcl?.customs_duty_amount} />
          <Row label="Customs tax" value={seaFcl?.customs_tax_amount} />
          <Row
            label="Customs clearance date"
            value={formatDate(seaFcl?.customs_clearance_date) || seaFcl?.customs_clearance_date}
          />
          <Row label="CFS storage rate/day" value={seaFcl?.cfs_storage_rate_per_day} />
          <Row
            label="CFS storage start"
            value={formatDate(seaFcl?.cfs_storage_start_date) || seaFcl?.cfs_storage_start_date}
          />
          <Row label="Linked export job" value={humanValue(seaFcl?.linked_export_job_id)} />
        </Section>
      )}

      {isSeaLcl && (
        <Section title="Sea LCL details">
          <Row label="Shipping line" value={labels.shippingLineLabel} />
          <Row label="Vessel" value={labels.vesselLabel} />
          <Row label="Voyage" value={seaLcl?.voyage_number} />
          <Row label="Booking number" value={seaLcl?.booking_number} />
          <Row label="Carrier booking ref" value={seaLcl?.carrier_booking_ref} />
          <Row label="Consolidation" value={seaLcl?.consolidation_number} />
          <Row label="HBL" value={seaLcl?.hbl_number} />
          <Row label="MBL" value={seaLcl?.mbl_number} />
          <Row label="Place of receipt" value={seaLcl?.place_of_receipt} />
          <Row label="Place of delivery" value={seaLcl?.place_of_delivery} />
          <Row label="POL" value={labels.originLabel} />
          <Row label="POD" value={labels.destinationLabel} />
          <Row label="ETD" value={formatDate(seaLcl?.etd) || seaLcl?.etd || job.etd} />
          <Row label="ETA" value={formatDate(seaLcl?.eta) || seaLcl?.eta || job.eta} />
          <Row label="Actual ETA" value={formatDate(seaLcl?.actual_eta) || seaLcl?.actual_eta} />
          <Row label="Incoterms" value={seaLcl?.incoterms || job.incoterms} />
          <Row label="Freight terms" value={seaLcl?.freight_terms} />
          <Row label="BL type" value={seaLcl?.bl_type} />
          <Row label="SI cutoff" value={formatDate(seaLcl?.si_cutoff) || seaLcl?.si_cutoff} />
          <Row label="SI submitted" value={formatDate(seaLcl?.si_submitted_at) || seaLcl?.si_submitted_at} />
          <Row label="SI version" value={seaLcl?.si_version} />
          <Row label="Transhipment" value={seaLcl?.transhipment_port} />
          <Row label="Sailed at" value={formatDate(seaLcl?.sailed_at) || seaLcl?.sailed_at} />
          <Row label="CFS warehouse" value={humanValue(seaLcl?.cfs_warehouse_id)} />
          <Row label="CFS free days" value={seaLcl?.cfs_storage_free_days} />
          <Row label="CFS storage rate/day" value={seaLcl?.cfs_storage_rate_per_day} />
          <Row
            label="CFS storage start"
            value={formatDate(seaLcl?.cfs_storage_start_date) || seaLcl?.cfs_storage_start_date}
          />
          <Row label="Storage rate basis" value={seaLcl?.storage_rate_basis} />
          <Row label="Customs status" value={seaLcl?.customs_status} />
          <Row label="Customs entry" value={seaLcl?.customs_entry_number} />
          <Row label="Customs examination" value={seaLcl?.customs_examination_details} />
          <Row label="Customs duty" value={seaLcl?.customs_duty_amount} />
          <Row label="Customs tax" value={seaLcl?.customs_tax_amount} />
          <Row
            label="Customs clearance date"
            value={formatDate(seaLcl?.customs_clearance_date) || seaLcl?.customs_clearance_date}
          />
          <Row label="Linked export job" value={humanValue(seaLcl?.linked_export_job_id)} />
        </Section>
      )}

      {isCourier && (
        <Section title="Courier details">
          <Row label="Vendor" value={labels.courierVendorLabel} />
          <Row label="Tracking number" value={courier?.tracking_number} />
          <Row label="Service type" value={courier?.service_type} />
          <Row label="Label format" value={courier?.label_format} />
          <Row label="Barcode value" value={courier?.barcode_value} />
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
          <Row label="Linked export job" value={humanValue(courier?.linked_export_job_id)} />
          <Row label="Linked import job" value={humanValue(courier?.linked_import_job_id)} />
        </Section>
      )}

      {(isLand || isRoad) && (
        <Section title={isRoad ? 'Road Freight details' : 'Land details'}>
          <Row label="Trucker" value={labels.truckerLabel} />
          <Row label="Vehicle number" value={roadLand?.vehicle_number} />
          <Row label="Vehicle type" value={roadLand?.vehicle_type} />
          {isRoad ? <Row label="Trailer number" value={road?.trailer_number} /> : null}
          <Row label="Driver" value={roadLand?.driver_name} />
          <Row label="Driver license" value={roadLand?.driver_license} />
          <Row label="Origin city/country" value={roadLand?.origin_city_country} />
          <Row label="Destination city/country" value={roadLand?.destination_city_country} />
          {isRoad ? <Row label="Route notes" value={road?.route_notes} /> : null}
          <Row label="Service scope" value={job.service_scope} />
          <Row label="Incoterms" value={roadLand?.incoterms || job.incoterms} />
          <Row label="Freight terms" value={roadLand?.freight_terms} />
          <Row label="ETD" value={formatDate(roadLand?.etd) || roadLand?.etd} />
          <Row label="ETA" value={formatDate(roadLand?.eta) || roadLand?.eta} />
          <Row label="Border origin country" value={roadLand?.border_origin_country} />
          <Row label="Border destination country" value={roadLand?.border_destination_country} />
          <Row label="Border declaration #" value={roadLand?.border_declaration_number} />
          <Row label="Border HS code" value={roadLand?.border_hs_code} />
          <Row label="Border commodity" value={roadLand?.border_commodity} />
          <Row label="Border declared value" value={roadLand?.border_declared_value} />
          <Row label="Cross-border docs required" value={roadLand?.cross_border_docs_required} />
        </Section>
      )}

      {isWarehouse && (
        <Section title="Warehouse details">
          <Row label="Warehouse / branch" value={labels.branchLabel} />
          <Row label="Cargo category" value={job.cargo_category} />
          <Row label="Commodity" value={job.commodity} />
          <Row label="HS code" value={job.hs_code} />
          <Row label="Pieces" value={job.pieces} />
          <Row label="Gross weight" value={job.gross_weight} />
          <Row label="Volume (CBM)" value={job.volume_cbm} />
          <Row label="Service scope" value={job.service_scope} />
          <Row label="Origin door" value={job.origin_door_address} />
          <Row label="Dest door" value={job.dest_door_address} />
          <Row label="Dangerous goods" value={job.is_dg} />
          <Row label="DG class" value={job.dg_class} />
        </Section>
      )}

      {isCustoms && (
        <Section title="Customs clearance details">
          <Row label="Direction / type" value={job.job_type} />
          <Row label="Cargo category" value={job.cargo_category} />
          <Row label="Commodity" value={job.commodity} />
          <Row label="HS code" value={job.hs_code} />
          <Row label="Pieces" value={job.pieces} />
          <Row label="Gross weight" value={job.gross_weight} />
          <Row label="Volume (CBM)" value={job.volume_cbm} />
          <Row label="Incoterms" value={job.incoterms} />
          <Row label="Origin" value={labels.originLabel} />
          <Row label="Destination" value={labels.destinationLabel} />
          <Row label="Origin door" value={job.origin_door_address} />
          <Row label="Dest door" value={job.dest_door_address} />
          <Row label="Dangerous goods" value={job.is_dg} />
          <Row label="DG class" value={job.dg_class} />
        </Section>
      )}

      {isService && (
        <Section title="Service job details">
          <Row label="Commodity" value={job.commodity} />
          <Row label="Cargo category" value={job.cargo_category} />
          <Row label="Service scope" value={job.service_scope} />
          <Row label="Incoterms" value={job.incoterms} />
          <Row label="Origin" value={labels.originLabel} />
          <Row label="Destination" value={labels.destinationLabel} />
          <Row label="Origin door" value={job.origin_door_address} />
          <Row label="Dest door" value={job.dest_door_address} />
          <Row label="Pieces" value={job.pieces} />
          <Row label="Gross weight" value={job.gross_weight} />
          <Row label="Volume (CBM)" value={job.volume_cbm} />
        </Section>
      )}

      <Section title="Notes">
        <Row label="Customer remarks" value={job.customer_remarks} />
        <Row label="Internal notes" value={job.notes} />
      </Section>

      <Section title="Linked counts">
        <Row label="Charges" value={job.charges?.length ?? 0} />
        <Row label="Milestones" value={job.milestones?.length ?? 0} />
        <Row label="House jobs" value={job.house_jobs?.length ?? 0} />
        <Row label="Containers" value={job.containers?.length ?? 0} />
        <Row label="Cargo lines" value={job.cargo?.length ?? 0} />
        <Row label="Documents" value={job.documents?.length ?? 0} />
        <Row label="Bills of lading" value={job.bills_of_lading?.length ?? 0} />
        <Row label="Pinned / job notes" value={job.notes_list?.length ?? 0} />
      </Section>
    </div>
  );
}
