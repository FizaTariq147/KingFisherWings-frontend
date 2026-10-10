import { useEffect, useState } from 'react';
import { type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { jobDetailPath } from '@/features/jobs/utils/jobRoute';
import { MasterPlaceSelect } from '@/features/masters/components/MasterPlaceSelect';
import { buildFclContinuumSteps } from '@/features/shared/continuum/buildFclContinuumSteps';
import { FclContinuumRail } from '@/features/shared/continuum/FclContinuumRail';
import { isUuid } from '@/lib/isUuid';
import { useAppForm } from '@/lib/validation';
import { ENQUIRY_STATUSES, SERVICE_TYPES, crmLabel } from '../constants/crm.constants';
import { CrmCurrencySelect, CrmPartySelect, CrmSalespersonSelect } from '../components/CrmFormControls';
import { CrmSection } from '../components/CrmSection';
import { OperationTypeBadge } from '@/components/erp';
import { erpForm } from '@/lib/erpForm';
import { CrmStatusBadge } from '../components/CrmStatusBadge';
import { CrmAlert, CrmEmpty, CrmPageHeader, Field, SelectInput, TextArea, TextInput } from '../components/CrmUi';
import {
  useCancelCrmEnquiry,
  useConvertCrmEnquiry,
  useCopyCrmEnquiry,
  useCrmEnquiry,
  useGenerateCrmEnquiryJob,
  useGenerateCrmEnquiryQuotation,
  useGenerateCrmEnquiryShipment,
  useUpdateCrmEnquiry,
} from '../hooks/useCrmEnquiries';
import { updateEnquirySchema, type UpdateEnquiryFormValues } from '../schemas/crm.schema';
import { getErrorMessage } from '../utils/getErrorMessage';
import { prepareCrmPayload } from '../utils/prepareCrmPayload';

function extractId(result: Record<string, unknown>, ...keys: string[]): string | undefined {
  for (const key of keys) {
    const v = result[key];
    if (typeof v === 'string' && isUuid(v)) return v;
  }
  if (typeof result.id === 'string' && isUuid(result.id)) return result.id;
  return undefined;
}

type ConfirmKind =
  | 'generate-quotation'
  | 'convert'
  | 'generate-shipment'
  | 'generate-job'
  | 'copy'
  | 'cancel';

export default function CrmEnquiryDetailPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const query = useCrmEnquiry(id);
  const update = useUpdateCrmEnquiry(id);
  const convert = useConvertCrmEnquiry();
  const generateQuotation = useGenerateCrmEnquiryQuotation();
  const generateShipment = useGenerateCrmEnquiryShipment();
  const generateJob = useGenerateCrmEnquiryJob();
  const copyEnquiry = useCopyCrmEnquiry();
  const cancelEnquiry = useCancelCrmEnquiry();
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(() =>
    (location.state as { enquiryCreated?: boolean } | null)?.enquiryCreated
      ? 'Enquiry has been created successfully.'
      : null,
  );
  const [confirmKind, setConfirmKind] = useState<ConfirmKind | null>(null);

  useEffect(() => {
    if (!(location.state as { enquiryCreated?: boolean } | null)?.enquiryCreated) return;
    navigate(location.pathname, { replace: true, state: null });
  }, [location.pathname, location.state, navigate]);

  const form = useAppForm<UpdateEnquiryFormValues>({
    resolver: zodResolver(updateEnquirySchema) as unknown as Resolver<UpdateEnquiryFormValues>,
    defaultValues: {},
  });
  const { register, handleValidatedSubmit, watch, setValue, reset, formState: { errors } } = form;

  useEffect(() => {
    if (!query.data) return;
    const d = query.data;
    reset({
      service_type: d.service_type,
      currency_code: d.currency_code,
      status: d.status,
      lead_id: d.lead_id ?? '',
      party_id: d.party_id ?? '',
      salesperson_id: d.salesperson_id ?? '',
      sales_coordinator_id: d.sales_coordinator_id ?? '',
      price_coordinator_id: d.price_coordinator_id ?? '',
      company_id: d.company_id ?? '',
      branch_id: d.branch_id ?? '',
      department_id: d.department_id ?? '',
      enquiry_date: d.enquiry_date ?? '',
      shipper_id: d.shipper_id ?? '',
      consignee_id: d.consignee_id ?? '',
      shipper_address: d.shipper_address ?? '',
      consignee_address: d.consignee_address ?? '',
      customer_address: d.customer_address ?? '',
      origin_port_id: d.origin_port_id ?? '',
      dest_port_id: d.dest_port_id ?? '',
      por_port_id: d.por_port_id ?? '',
      etd: d.etd ?? '',
      eta: d.eta ?? '',
      payable_at: d.payable_at ?? '',
      dispatch_at: d.dispatch_at ?? '',
      carrier_id: d.carrier_id ?? '',
      voyage_number: d.voyage_number ?? '',
      vessel_name: d.vessel_name ?? '',
      unit_price: d.unit_price,
      gross_weight: d.gross_weight,
      chargeable_weight: d.chargeable_weight,
      net_weight: d.net_weight,
      weight_unit: d.weight_unit ?? 'KG',
      volume_cbm: d.volume_cbm,
      cbm_unit: d.cbm_unit ?? 'CBM',
      hs_code: d.hs_code ?? '',
      pieces: d.pieces,
      container_type_id: d.container_type_id ?? '',
      container_count: d.container_count,
      cargo_details: d.cargo_details ?? '',
      commodity: d.commodity ?? '',
      incoterms: d.incoterms ?? '',
      special_requirements: d.special_requirements ?? '',
      charges: d.charges ?? [],
    });
  }, [query.data, reset]);

  const err = (name: keyof UpdateEnquiryFormValues) =>
    errors[name]?.message ? String(errors[name]?.message) : undefined;

  if (query.isLoading || query.isError || !query.data) {
    return (
      <>
        <CrmPageHeader title="Enquiry" description="Enquiry details" />
        <Card>
          <CrmEmpty loading={query.isLoading} error={query.isError ? getErrorMessage(query.error) : undefined} />
        </Card>
      </>
    );
  }

  const enquiry = query.data;
  const actions = enquiry.actions;
  const status = enquiry.status;
  const serviceType = watch('service_type') || enquiry.service_type;
  const isAir = serviceType === 'AIR_EXPORT' || serviceType === 'AIR_IMPORT';
  const isFcl = serviceType === 'SEA_FCL_EXPORT' || serviceType === 'SEA_FCL_IMPORT';
  const placeKind = isAir ? 'airports' : 'ports';
  const isTerminal = status === 'CANCELLED' || status === 'LOST';
  const hasQuotation = Boolean(enquiry.quotation_id && isUuid(enquiry.quotation_id));
  const hasShipment = Boolean(enquiry.shipment_id && isUuid(enquiry.shipment_id));
  const hasJob = Boolean(enquiry.job_id && isUuid(enquiry.job_id));
  const anyActionPending =
    convert.isPending ||
    generateQuotation.isPending ||
    generateShipment.isPending ||
    generateJob.isPending ||
    copyEnquiry.isPending ||
    cancelEnquiry.isPending;

  const canGenerateQuotation =
    !isTerminal &&
    !hasQuotation &&
    (actions?.can_generate_quotation === true ||
      (actions?.can_generate_quotation !== false && status === 'NEW'));
  const canConvert =
    !isTerminal &&
    !hasQuotation &&
    (actions?.can_convert_to_quote === true ||
      (actions?.can_convert_to_quote !== false && status !== 'QUOTED' && status !== 'BOOKED'));
  const canGenerateShipment = !isTerminal && !hasShipment && actions?.can_generate_shipment === true;
  const canGenerateJob = !isTerminal && !hasJob && actions?.can_generate_job === true;
  const canCancel =
    !isTerminal &&
    (actions?.can_cancel === true || (actions?.can_cancel !== false && status !== 'BOOKED'));
  const canCopy = actions?.can_copy !== false;

  const continuum = buildFclContinuumSteps({
    partyId: enquiry.party_id,
    enquiryId: enquiry.id,
    quotationId: enquiry.quotation_id,
    verified: false,
    approved: status === 'QUOTED' || status === 'BOOKED',
    shipmentId: enquiry.shipment_id,
    jobId: enquiry.job_id,
    jobHref: enquiry.job_id
      ? jobDetailPath({ id: enquiry.job_id, job_type: enquiry.service_type })
      : undefined,
    workflowBlocked: isTerminal,
  });

  const runAction = async (fn: () => Promise<void>) => {
    setActionError(null);
    setActionMessage(null);
    try {
      await fn();
      await query.refetch();
    } catch (e) {
      setActionError(getErrorMessage(e));
    } finally {
      setConfirmKind(null);
    }
  };

  const confirmCopy: Record<
    ConfirmKind,
    { title: string; body: string; label: string; danger?: boolean }
  > = {
    'generate-quotation': {
      title: 'Generate quotation?',
      body: 'Creates a quotation from this enquiry via the backend. Existing quotation links block duplicates.',
      label: 'Generate quotation',
    },
    convert: {
      title: 'Convert to quote?',
      body: 'Converts this enquiry into a quotation using the convert-to-quote endpoint.',
      label: 'Convert to quote',
    },
    'generate-shipment': {
      title: 'Generate shipment?',
      body: 'Creates a shipment from this enquiry when the backend allows it.',
      label: 'Generate shipment',
    },
    'generate-job': {
      title: 'Generate job?',
      body: 'Creates a job from this enquiry when the backend allows it.',
      label: 'Generate job',
    },
    copy: {
      title: 'Copy enquiry?',
      body: 'Creates a new enquiry copy. You will be taken to the new record.',
      label: 'Copy',
    },
    cancel: {
      title: 'Cancel enquiry?',
      body: 'Marks this enquiry as cancelled. This uses the backend cancel action.',
      label: 'Cancel enquiry',
      danger: true,
    },
  };

  const executeConfirm = () => {
    if (!confirmKind) return;
    if (confirmKind === 'generate-quotation') {
      void runAction(async () => {
        const result = await generateQuotation.mutateAsync(id);
        const quoteId = extractId(result, 'quotation_id', 'quotationId', 'id');
        setActionMessage('Quotation generated.');
        if (quoteId) navigate(`/quotations/${quoteId}`);
      });
      return;
    }
    if (confirmKind === 'convert') {
      void runAction(async () => {
        const result = await convert.mutateAsync(id);
        const quoteId = extractId(result, 'quotation_id', 'quotationId', 'id');
        setActionMessage('Converted to quote.');
        if (quoteId) navigate(`/quotations/${quoteId}`);
      });
      return;
    }
    if (confirmKind === 'generate-shipment') {
      void runAction(async () => {
        const result = await generateShipment.mutateAsync(id);
        const shipmentId = extractId(result, 'shipment_id', 'shipmentId', 'id');
        setActionMessage('Shipment generated.');
        if (shipmentId) navigate(`/operations/shipments/${shipmentId}`);
      });
      return;
    }
    if (confirmKind === 'generate-job') {
      void runAction(async () => {
        const result = await generateJob.mutateAsync(id);
        const jobId = extractId(result, 'job_id', 'jobId', 'id');
        setActionMessage('Job generated.');
        if (jobId) {
          navigate(jobDetailPath({ id: jobId, job_type: enquiry.service_type }));
        }
      });
      return;
    }
    if (confirmKind === 'copy') {
      void runAction(async () => {
        const copy = await copyEnquiry.mutateAsync(id);
        setActionMessage('Enquiry copied.');
        navigate(`/sales/enquiries/${copy.id}`);
      });
      return;
    }
    void runAction(async () => {
      await cancelEnquiry.mutateAsync(id);
      setActionMessage('Enquiry cancelled.');
    });
  };

  const titleRef = enquiry.enquiry_number?.trim() || `Enquiry ${id.slice(0, 8)}`;

  return (
    <div className="space-y-3">
      <CrmPageHeader
        title={titleRef}
        description={
          <span className="inline-flex flex-wrap items-center gap-2">
            <OperationTypeBadge code={enquiry.service_type} />
            <CrmStatusBadge status={enquiry.status} />
          </span>
        }
      />

      {/* Fresa-style action toolbar */}
      <div className={erpForm.toolbar}>
        {hasQuotation && (
          <Button size="sm" type="button" variant="secondary" onClick={() => navigate(`/quotations/${enquiry.quotation_id}`)}>
            Open quotation
          </Button>
        )}
        {canGenerateQuotation && (
          <Button size="sm" type="button" disabled={anyActionPending} onClick={() => setConfirmKind('generate-quotation')}>
            Generate Quotation
          </Button>
        )}
        {canConvert && (
          <Button
            size="sm"
            type="button"
            variant={canGenerateQuotation ? 'secondary' : 'primary'}
            disabled={anyActionPending}
            onClick={() => setConfirmKind('convert')}
          >
            Convert to quote
          </Button>
        )}
        {hasShipment ? (
          <Button size="sm" type="button" variant="secondary" onClick={() => navigate(`/operations/shipments/${enquiry.shipment_id}`)}>
            Open shipment
          </Button>
        ) : canGenerateShipment ? (
          <Button size="sm" type="button" disabled={anyActionPending} onClick={() => setConfirmKind('generate-shipment')}>
            Generate Shipment
          </Button>
        ) : null}
        {hasJob ? (
          <Button
            size="sm"
            type="button"
            variant="secondary"
            onClick={() =>
              navigate(jobDetailPath({ id: enquiry.job_id!, job_type: enquiry.service_type }))
            }
          >
            Open job
          </Button>
        ) : canGenerateJob ? (
          <Button size="sm" type="button" disabled={anyActionPending} onClick={() => setConfirmKind('generate-job')}>
            Generate Job
          </Button>
        ) : null}
        {canCopy && (
          <Button size="sm" type="button" variant="secondary" disabled={anyActionPending} onClick={() => setConfirmKind('copy')}>
            Copy
          </Button>
        )}
        {canCancel && (
          <Button size="sm" type="button" variant="danger" disabled={anyActionPending} onClick={() => setConfirmKind('cancel')}>
            Cancel
          </Button>
        )}
      </div>

      <FclContinuumRail steps={continuum} />

      {(actionError || update.isError) && (
        <CrmAlert>{actionError || getErrorMessage(update.error)}</CrmAlert>
      )}
      {(actionMessage || update.isSuccess) && (
        <CrmAlert success>{actionMessage || 'Enquiry updated.'}</CrmAlert>
      )}

      {enquiry.party_id && (
        <div className="rounded-sm border border-[#d0d7de] bg-white px-3 py-2 text-[13px]">
          <span className="font-semibold text-[#0A2942]">Customer / Party: </span>
          <Link className="font-medium text-[var(--color-primary-700)] hover:underline" to={`/parties/${enquiry.party_id}`}>
            {enquiry.party_name || enquiry.party_id.slice(0, 8)}
          </Link>
          {isFcl ? (
            <span className="ml-2 text-[#64748b]">
              · {crmLabel(enquiry.service_type)}
            </span>
          ) : null}
        </div>
      )}

      <form
        className="space-y-3"
        onSubmit={handleValidatedSubmit(async (values) => {
          await update.mutateAsync(prepareCrmPayload(values) as UpdateEnquiryFormValues);
        })}
      >
          <CrmSection title="Party & operation">
            <div className={erpForm.grid2}>
              <Field label="Service" error={err('service_type')}>
                <SelectInput {...register('service_type')}>
                  {SERVICE_TYPES.map((x) => (
                    <option key={x} value={x}>
                      {crmLabel(x)}
                    </option>
                  ))}
                </SelectInput>
              </Field>
              <Field label="Status" error={err('status')}>
                <SelectInput {...register('status')}>
                  {ENQUIRY_STATUSES.map((x) => (
                    <option key={x} value={x}>
                      {crmLabel(x)}
                    </option>
                  ))}
                </SelectInput>
              </Field>
              <CrmCurrencySelect
                label="Currency"
                required
                value={watch('currency_code') ?? ''}
                onChange={(c) => setValue('currency_code', c, { shouldValidate: true })}
                error={err('currency_code')}
              />
              <Field label="Enquiry date" error={err('enquiry_date')}>
                <TextInput type="date" {...register('enquiry_date')} />
              </Field>
              <CrmSalespersonSelect
                label="Salesperson"
                value={watch('salesperson_id') ?? ''}
                onChange={(v) => setValue('salesperson_id', v, { shouldValidate: true })}
                error={err('salesperson_id')}
              />
              <Field label="Lead ID" error={err('lead_id')}>
                <TextInput {...register('lead_id')} />
              </Field>
              <div className="sm:col-span-2">
                <CrmPartySelect
                  label="Party"
                  value={watch('party_id') ?? ''}
                  onChange={(pid) => setValue('party_id', pid, { shouldValidate: true })}
                  error={err('party_id')}
                />
              </div>
              <CrmPartySelect
                label="Shipper"
                value={watch('shipper_id') ?? ''}
                onChange={(id) => setValue('shipper_id', id, { shouldValidate: true })}
                error={err('shipper_id')}
              />
              <CrmPartySelect
                label="Consignee"
                value={watch('consignee_id') ?? ''}
                onChange={(id) => setValue('consignee_id', id, { shouldValidate: true })}
                error={err('consignee_id')}
              />
            </div>
          </CrmSection>

          <CrmSection title="Port Details">
            <div className={erpForm.grid3}>
              <MasterPlaceSelect
                name="por_port_id"
                label="POR"
                kind={placeKind}
                jobType={serviceType}
                value={watch('por_port_id') ?? ''}
                onChange={(v) => setValue('por_port_id', v, { shouldValidate: true })}
                error={err('por_port_id')}
              />
              <MasterPlaceSelect
                name="origin_port_id"
                label={isFcl ? 'POL' : 'Origin'}
                kind={placeKind}
                jobType={serviceType}
                value={watch('origin_port_id') ?? ''}
                onChange={(v) => setValue('origin_port_id', v, { shouldValidate: true })}
                error={err('origin_port_id')}
                excludeId={watch('dest_port_id') || undefined}
              />
              <MasterPlaceSelect
                name="dest_port_id"
                label={isFcl ? 'POD' : 'Destination'}
                kind={placeKind}
                jobType={serviceType}
                value={watch('dest_port_id') ?? ''}
                onChange={(v) => setValue('dest_port_id', v, { shouldValidate: true })}
                error={err('dest_port_id')}
                excludeId={watch('origin_port_id') || undefined}
              />
              <Field label="ETD" error={err('etd')}>
                <TextInput type="date" {...register('etd')} />
              </Field>
              <Field label="ETA" error={err('eta')}>
                <TextInput type="date" {...register('eta')} />
              </Field>
              <Field label="Incoterms" error={err('incoterms')}>
                <TextInput {...register('incoterms')} maxLength={10} />
              </Field>
              <Field label="Vessel" error={err('vessel_name')}>
                <TextInput {...register('vessel_name')} />
              </Field>
              <Field label="Voyage" error={err('voyage_number')}>
                <TextInput {...register('voyage_number')} />
              </Field>
              <Field label="Payable at" error={err('payable_at')}>
                <TextInput {...register('payable_at')} />
              </Field>
            </div>
          </CrmSection>

          <CrmSection title="Consignment">
            <div className={erpForm.grid2}>
              <Field label="Commodity" error={err('commodity')}>
                <TextInput {...register('commodity')} />
              </Field>
              <Field label="HS code" error={err('hs_code')}>
                <TextInput {...register('hs_code')} maxLength={12} />
              </Field>
              <Field label="Pieces" error={err('pieces')}>
                <TextInput type="number" {...register('pieces')} />
              </Field>
              <Field label="Container count" error={err('container_count')}>
                <TextInput type="number" {...register('container_count')} />
              </Field>
              <Field label="Gross weight" error={err('gross_weight')}>
                <TextInput type="number" {...register('gross_weight')} />
              </Field>
              <Field label="Net weight" error={err('net_weight')}>
                <TextInput type="number" {...register('net_weight')} />
              </Field>
              <Field label="Chargeable weight" error={err('chargeable_weight')}>
                <TextInput type="number" {...register('chargeable_weight')} />
              </Field>
              <Field label="Volume CBM" error={err('volume_cbm')}>
                <TextInput type="number" {...register('volume_cbm')} />
              </Field>
            </div>
            <Field label="Cargo details" error={err('cargo_details')}>
              <TextArea {...register('cargo_details')} />
            </Field>
            <Field label="Special requirements" error={err('special_requirements')}>
              <TextArea {...register('special_requirements')} />
            </Field>
          </CrmSection>

          {(enquiry.charges?.length ?? 0) > 0 && (
            <CrmSection title="Charge Details">
              <div className="overflow-x-auto">
                <table className="w-full text-[13px]">
                  <thead>
                    <tr>
                      <th className="px-2 py-1 text-left text-[11px] font-semibold text-[var(--fresa-header-text)]">Description</th>
                      <th className="px-2 py-1 text-right text-[11px] font-semibold text-[var(--fresa-header-text)]">Qty</th>
                      <th className="px-2 py-1 text-right text-[11px] font-semibold text-[var(--fresa-header-text)]">Amount</th>
                      <th className="px-2 py-1 text-left text-[11px] font-semibold text-[var(--fresa-header-text)]">Currency</th>
                    </tr>
                  </thead>
                  <tbody>
                    {enquiry.charges!.map((c, i) => (
                      <tr key={`${c.description}-${i}`} className="border-t border-[var(--fresa-border)]">
                        <td className="px-2 py-1">{c.description}</td>
                        <td className="px-2 py-1 text-right">{c.quantity ?? '—'}</td>
                        <td className="px-2 py-1 text-right">{c.amount}</td>
                        <td className="px-2 py-1">{c.currency_code || enquiry.currency_code}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CrmSection>
          )}

          <div className={erpForm.footer}>
            <Button size="sm" disabled={update.isPending}>
              {update.isPending ? 'Saving…' : 'Save'}
            </Button>
          </div>
        </form>

      {confirmKind && (
        <Modal
          open
          onClose={() => !anyActionPending && setConfirmKind(null)}
          title={confirmCopy[confirmKind].title}
          footer={
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="secondary"
                disabled={anyActionPending}
                onClick={() => setConfirmKind(null)}
              >
                Back
              </Button>
              <Button
                type="button"
                variant={confirmCopy[confirmKind].danger ? 'danger' : 'primary'}
                disabled={anyActionPending}
                onClick={executeConfirm}
              >
                {anyActionPending ? 'Working…' : confirmCopy[confirmKind].label}
              </Button>
            </div>
          }
        >
          <p className="text-sm text-[var(--color-neutral-600)]">
            {confirmCopy[confirmKind].body}
          </p>
        </Modal>
      )}
    </div>
  );
}
