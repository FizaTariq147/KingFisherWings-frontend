import { useEffect, useRef, useState } from 'react';
import { type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Briefcase,
  Check,
  Copy,
  FileText,
  Pencil,
  Plus,
  Save,
  Ship,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { jobDetailPath } from '@/features/jobs/utils/jobRoute';
import { MasterPlaceSelect } from '@/features/masters/components/MasterPlaceSelect';
import { buildFclContinuumSteps } from '@/features/shared/continuum/buildFclContinuumSteps';
import { FclContinuumRail } from '@/features/shared/continuum/FclContinuumRail';
import { FavouriteToggle } from '@/features/favourites/components/FavouriteToggle';
import { OpsContinuumRail } from '@/features/ops-activity';
import { isUuid } from '@/lib/isUuid';
import { cn } from '@/lib/utils';
import { useAppForm } from '@/lib/validation';
import { ENQUIRY_STATUSES, SERVICE_TYPES, crmLabel } from '../constants/crm.constants';
import { CrmCurrencySelect, CrmPartySelect, CrmSalespersonSelect } from '../components/CrmFormControls';
import { CrmSection } from '../components/CrmSection';
import { OperationTypeBadge } from '@/components/erp';
import { erpForm } from '@/lib/erpForm';
import { appType } from '@/lib/erpTypography';
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
import { crmEnquiriesService } from '../services/crmEnquiries.service';
import { updateEnquirySchema, type UpdateEnquiryFormValues } from '../schemas/crm.schema';
import { getErrorMessage } from '../utils/getErrorMessage';
import { prepareCrmPayload } from '../utils/prepareCrmPayload';

const ENQUIRY_SHEET_LIST = '/customer-service/enquiry-sheet';

function extractId(result: Record<string, unknown>, ...keys: string[]): string | undefined {
  for (const key of keys) {
    const v = result[key];
    if (typeof v === 'string' && isUuid(v)) return v;
  }
  if (typeof result.id === 'string' && isUuid(result.id)) return result.id;
  return undefined;
}

function extractLabel(result: Record<string, unknown>, ...keys: string[]): string | undefined {
  for (const key of keys) {
    const v = result[key];
    if (typeof v === 'string' && v.trim()) return v.trim();
  }
  return undefined;
}

type ConfirmKind =
  | 'generate-quotation'
  | 'convert'
  | 'generate-shipment'
  | 'generate-job'
  | 'copy'
  | 'cancel';

type GeneratedLink = {
  kind: 'quotation' | 'shipment' | 'job';
  id: string;
  label: string;
  href: string;
};

type EnquiryDetailTab = 'show-all' | 'party' | 'ports' | 'consignment' | 'charges';

function FresaReadonlyField({
  label,
  value,
  href,
}: {
  label: string;
  value?: string | number | null;
  href?: string;
}) {
  const raw = value == null || value === '' ? '' : String(value).trim();
  const shown = !raw || isUuid(raw) ? '' : raw;
  const text = shown || (href ? 'View' : '—');
  return (
    <div className="min-w-0">
      <div className={erpForm.label}>{label}</div>
      <div className="flex h-8 items-center truncate rounded-sm border border-[var(--fresa-border,#C9D3DF)] bg-[#F8FAFC] px-2.5 text-[13px] text-[#0f172a]">
        {href ? (
          <Link className="truncate font-medium text-[var(--color-primary-700)] hover:underline" to={href}>
            {text}
          </Link>
        ) : (
          <span className="truncate">{text}</span>
        )}
      </div>
    </div>
  );
}

export default function CrmEnquiryDetailPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const formRef = useRef<HTMLFormElement>(null);
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
  const [generatedLink, setGeneratedLink] = useState<GeneratedLink | null>(null);
  const [confirmKind, setConfirmKind] = useState<ConfirmKind | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [reportPending, setReportPending] = useState(false);
  const [activeTab, setActiveTab] = useState<EnquiryDetailTab>('show-all');

  const pendingFocusEdit = useRef(
    Boolean((location.state as { focusEdit?: boolean } | null)?.focusEdit),
  );

  useEffect(() => {
    const state = location.state as
      | { enquiryCreated?: boolean; focusEdit?: boolean }
      | null;
    if (!state?.enquiryCreated && !state?.focusEdit) return;
    navigate(location.pathname, { replace: true, state: null });
  }, [location.pathname, location.state, navigate]);

  useEffect(() => {
    if (!pendingFocusEdit.current || !query.data) return;
    pendingFocusEdit.current = false;
    setActiveTab('show-all');
    window.requestAnimationFrame(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      const first = formRef.current?.querySelector<HTMLElement>('input, select, textarea');
      first?.focus();
    });
  }, [query.data]);

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
    enquiryStatus: status,
    shipmentId: enquiry.shipment_id,
    jobId: enquiry.job_id,
    jobHref: enquiry.job_id
      ? jobDetailPath({ id: enquiry.job_id, job_type: enquiry.service_type })
      : undefined,
    workflowBlocked: isTerminal,
  });

  const runAction = async (fn: () => Promise<void>) => {
    setActionError(null);
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
    { title: string; body: string; danger?: boolean }
  > = {
    'generate-quotation': {
      title: 'Generate Quotation?',
      body: 'Generate quotation from this enquiry?',
    },
    convert: {
      title: 'Convert to quote?',
      body: 'Convert this enquiry into a quotation?',
    },
    'generate-shipment': {
      title: 'Generate Shipments?',
      body: 'Generate shipment from this enquiry?',
    },
    'generate-job': {
      title: 'Generate Job?',
      body: 'Generate job from this enquiry?',
    },
    copy: {
      title: 'Copy Enquiries?',
      body: 'Create a copy of this enquiry?',
    },
    cancel: {
      title: 'Cancel enquiry?',
      body: 'Mark this enquiry as cancelled?',
      danger: true,
    },
  };

  const executeConfirm = () => {
    if (!confirmKind) return;
    if (confirmKind === 'generate-quotation') {
      void runAction(async () => {
        const result = await generateQuotation.mutateAsync(id);
        const quoteId = extractId(result, 'quotation_id', 'quotationId', 'id');
        const label =
          (typeof result.quotation_number === 'string' && result.quotation_number) ||
          extractLabel(result, 'quotation_number', 'quotationNumber', 'quote_no', 'quoteNo') ||
          (quoteId ? quoteId.slice(0, 8) : 'Open quotation');
        setActionMessage('Quotation has been successfully created.');
        if (quoteId) {
          setGeneratedLink({
            kind: 'quotation',
            id: quoteId,
            label,
            href: `/quotations/${quoteId}`,
          });
        }
      });
      return;
    }
    if (confirmKind === 'convert') {
      void runAction(async () => {
        const result = await convert.mutateAsync(id);
        const quoteId = extractId(result, 'quotation_id', 'quotationId', 'id');
        const label =
          (typeof result.quotation_number === 'string' && result.quotation_number) ||
          extractLabel(result, 'quotation_number', 'quotationNumber', 'quote_no', 'quoteNo') ||
          (quoteId ? quoteId.slice(0, 8) : 'Open quotation');
        setActionMessage('Quotation has been successfully created.');
        if (quoteId) {
          setGeneratedLink({
            kind: 'quotation',
            id: quoteId,
            label,
            href: `/quotations/${quoteId}`,
          });
        }
      });
      return;
    }
    if (confirmKind === 'generate-shipment') {
      void runAction(async () => {
        const result = await generateShipment.mutateAsync(id);
        const shipmentId = extractId(result, 'shipment_id', 'shipmentId', 'id');
        const label =
          (typeof result.shipment_number === 'string' && result.shipment_number) ||
          extractLabel(result, 'shipment_number', 'shipmentNumber', 'shipment_no', 'shipmentNo') ||
          (shipmentId ? shipmentId.slice(0, 8) : 'Open shipment');
        setActionMessage('Shipment has been successfully created.');
        if (shipmentId) {
          setGeneratedLink({
            kind: 'shipment',
            id: shipmentId,
            label,
            href: `/operations/shipments/${shipmentId}`,
          });
        }
      });
      return;
    }
    if (confirmKind === 'generate-job') {
      void runAction(async () => {
        const result = await generateJob.mutateAsync(id);
        const jobId = extractId(result, 'job_id', 'jobId', 'id');
        const label =
          (typeof result.job_number === 'string' && result.job_number) ||
          extractLabel(result, 'job_number', 'jobNumber', 'job_no', 'jobNo') ||
          (jobId ? jobId.slice(0, 8) : 'Open job');
        setActionMessage('Job has been successfully generated.');
        if (jobId) {
          setGeneratedLink({
            kind: 'job',
            id: jobId,
            label,
            href: jobDetailPath({ id: jobId, job_type: enquiry.service_type }),
          });
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
    const reason = cancelReason.trim();
    if (reason.length < 2) {
      setActionError('Cancel reason is required (min 2 characters).');
      return;
    }
    void runAction(async () => {
      await cancelEnquiry.mutateAsync({ id, cancel_reason: reason });
      setActionMessage('Enquiry cancelled.');
      setGeneratedLink(null);
      setCancelReason('');
    });
  };

  const titleRef = enquiry.enquiry_number?.trim() || `Enquiry ${id.slice(0, 8)}`;

  const quoteDisplay =
    generatedLink?.kind === 'quotation'
      ? generatedLink
      : hasQuotation
        ? {
            kind: 'quotation' as const,
            id: enquiry.quotation_id!,
            label: enquiry.quotation_number?.trim() || enquiry.quotation_id!.slice(0, 8),
            href: `/quotations/${enquiry.quotation_id}`,
          }
        : null;

  const shipmentDisplay =
    generatedLink?.kind === 'shipment'
      ? generatedLink
      : hasShipment
        ? {
            kind: 'shipment' as const,
            id: enquiry.shipment_id!,
            label: enquiry.shipment_number?.trim() || enquiry.shipment_id!.slice(0, 8),
            href: `/operations/shipments/${enquiry.shipment_id}`,
          }
        : null;

  const jobDisplay =
    generatedLink?.kind === 'job'
      ? generatedLink
      : hasJob
        ? {
            kind: 'job' as const,
            id: enquiry.job_id!,
            label: enquiry.job_number?.trim() || enquiry.job_id!.slice(0, 8),
            href: jobDetailPath({ id: enquiry.job_id!, job_type: enquiry.service_type }),
          }
        : null;

  const enquiryTabs: { key: EnquiryDetailTab; label: string }[] = [
    { key: 'show-all', label: 'Show All' },
    { key: 'party', label: 'Party & operation' },
    { key: 'ports', label: 'Port Details' },
    { key: 'consignment', label: 'Consignment Details' },
    ...(enquiry.charges?.length ? [{ key: 'charges' as const, label: 'Charge Details' }] : []),
  ];

  const showParty = activeTab === 'show-all' || activeTab === 'party';
  const showPorts = activeTab === 'show-all' || activeTab === 'ports';
  const showConsignment = activeTab === 'show-all' || activeTab === 'consignment';
  const showCharges =
    (activeTab === 'show-all' || activeTab === 'charges') && (enquiry.charges?.length ?? 0) > 0;

  const focusEditForm = () => {
    setActiveTab('show-all');
    window.requestAnimationFrame(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      const first = formRef.current?.querySelector<HTMLElement>('input, select, textarea');
      first?.focus();
    });
  };

  return (
    <div className="space-y-2.5 bg-[var(--fresa-page-bg,#F4F6F9)] -mx-1 px-1 pb-4 print:space-y-2">
      {/* Header chrome — Create / Edit / Report / Back (same as shipment) */}
      <div className="rounded-sm border border-[var(--fresa-border,#C9D3DF)] bg-white px-3 py-2.5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--fresa-header-text,#0A2942)]">
              Enquiry details
            </p>
            <h1 className={`mt-0.5 ${appType.pageTitle}`}>{titleRef}</h1>
            <p className={`${appType.pageSubtitle} mt-1`}>
              <span className="inline-flex flex-wrap items-center gap-2">
                <OperationTypeBadge code={enquiry.service_type} />
                <CrmStatusBadge status={enquiry.status} />
              </span>
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2 print:hidden">
            <Button
              size="sm"
              type="button"
              variant="create"
              leftIcon={<Plus />}
              onClick={() => navigate('/sales/enquiries/new')}
            >
              Create
            </Button>
            <Button
              size="sm"
              type="button"
              variant="edit"
              leftIcon={<Pencil />}
              onClick={focusEditForm}
            >
              Edit
            </Button>
            <Button
              size="sm"
              type="button"
              variant="report"
              leftIcon={<FileText />}
              disabled={reportPending}
              onClick={() => {
                setReportPending(true);
                setActionError(null);
                void crmEnquiriesService
                  .openReport(id, enquiry.enquiry_number)
                  .catch((e) => setActionError(getErrorMessage(e)))
                  .finally(() => setReportPending(false));
              }}
            >
              {reportPending ? 'Report…' : 'Report'}
            </Button>
            <Button
              size="sm"
              type="button"
              variant="back"
              leftIcon={<ArrowLeft />}
              onClick={() => navigate(ENQUIRY_SHEET_LIST)}
            >
              Back
            </Button>
          </div>
        </div>
      </div>

      <OpsContinuumRail
        entityType="ENQUIRY"
        entityId={id}
        pathHints={enquiry.path_hints}
        opsContinuum={enquiry.ops_continuum}
        actions={enquiry.actions as Record<string, unknown> | undefined}
        links={{
          enquiryId: enquiry.id,
          quotationId: enquiry.quotation_id,
          shipmentId: enquiry.shipment_id,
          jobId: enquiry.job_id,
        }}
      />

      <div className="flex flex-wrap items-center justify-between gap-2">
        <FclContinuumRail steps={continuum} className="flex-1" />
        <FavouriteToggle kind="enquiry" targetKey={id} label={titleRef} />
      </div>

      {(actionError || update.isError) && (
        <CrmAlert>{actionError || getErrorMessage(update.error)}</CrmAlert>
      )}
      {(actionMessage || update.isSuccess) && (
        <CrmAlert success>
          <div className="space-y-1">
            <p>{actionMessage || 'Enquiry updated.'}</p>
            {generatedLink?.kind === 'quotation' ||
            (actionMessage?.includes('Quotation') && quoteDisplay) ? (
              <p>
                Quote No:{' '}
                <Link
                  className="font-semibold text-[var(--color-primary-700)] underline"
                  to={(generatedLink?.kind === 'quotation' ? generatedLink : quoteDisplay)!.href}
                >
                  {(generatedLink?.kind === 'quotation' ? generatedLink : quoteDisplay)!.label}
                </Link>
              </p>
            ) : null}
            {generatedLink?.kind === 'shipment' ? (
              <p>
                Shipment No:{' '}
                <Link
                  className="font-semibold text-[var(--color-primary-700)] underline"
                  to={generatedLink.href}
                >
                  {generatedLink.label}
                </Link>
              </p>
            ) : null}
            {generatedLink?.kind === 'job' ? (
              <p>
                Job No:{' '}
                <Link
                  className="font-semibold text-[var(--color-primary-700)] underline"
                  to={generatedLink.href}
                >
                  {generatedLink.label}
                </Link>
              </p>
            ) : null}
          </div>
        </CrmAlert>
      )}

      {/* Enquiry detail — key fields (like Shipment detail) */}
      <section className={`${erpForm.section} kf-ops-continuum-form-pad`}>
        <div className={erpForm.sectionHeader}>Enquiry detail</div>
        <div className={`${erpForm.sectionBody} grid grid-cols-1 gap-x-4 gap-y-2.5 sm:grid-cols-3`}>
          <FresaReadonlyField label="Enquiry No" value={enquiry.enquiry_number || titleRef} />
          <FresaReadonlyField
            label="Client"
            value={enquiry.party_name}
            href={enquiry.party_id && isUuid(enquiry.party_id) ? `/parties/${enquiry.party_id}` : undefined}
          />
          <FresaReadonlyField label="Department" value={crmLabel(enquiry.service_type)} />
          <FresaReadonlyField label="Status" value={crmLabel(enquiry.status)} />
          <FresaReadonlyField label="Enquiry date" value={enquiry.enquiry_date} />
          <FresaReadonlyField label="Currency" value={enquiry.currency_code} />
          <FresaReadonlyField
            label="Quote No"
            value={quoteDisplay?.label}
            href={quoteDisplay?.href}
          />
          <FresaReadonlyField
            label="Shipment No"
            value={shipmentDisplay?.label}
            href={shipmentDisplay?.href}
          />
          <FresaReadonlyField label="Job No" value={jobDisplay?.label} href={jobDisplay?.href} />
          <FresaReadonlyField label="Incoterms" value={enquiry.incoterms} />
          <FresaReadonlyField label="Commodity" value={enquiry.commodity} />
          <FresaReadonlyField label="ETD" value={enquiry.etd} />
          <FresaReadonlyField label="ETA" value={enquiry.eta} />
        </div>
      </section>

      {/* Generation actions — below Enquiry detail (same pattern as shipment) */}
      <div className={`${erpForm.toolbar} w-full max-w-none print:hidden`}>
        <p className="mr-1 w-full text-[11px] font-semibold uppercase tracking-wide text-[var(--fresa-header-text,#0A2942)] sm:mr-2 sm:w-auto">
          Generation actions
        </p>
        {canCopy && (
          <Button
            size="sm"
            type="button"
            variant="create"
            leftIcon={<Copy />}
            disabled={anyActionPending}
            onClick={() => setConfirmKind('copy')}
          >
            Copy Enquiries
          </Button>
        )}
        {canGenerateQuotation && (
          <Button
            size="sm"
            type="button"
            variant="edit"
            leftIcon={<FileText />}
            disabled={anyActionPending}
            onClick={() => setConfirmKind('generate-quotation')}
          >
            Generate Quotation
          </Button>
        )}
        {canGenerateShipment && (
          <Button
            size="sm"
            type="button"
            variant="report"
            leftIcon={<Ship />}
            disabled={anyActionPending}
            onClick={() => setConfirmKind('generate-shipment')}
          >
            Generate Shipments
          </Button>
        )}
        {canGenerateJob && (
          <Button
            size="sm"
            type="button"
            variant="success"
            leftIcon={<Briefcase />}
            disabled={anyActionPending}
            onClick={() => setConfirmKind('generate-job')}
          >
            Generate Job
          </Button>
        )}
        {canConvert && (
          <Button
            size="sm"
            type="button"
            variant="warning"
            leftIcon={<FileText />}
            disabled={anyActionPending}
            onClick={() => setConfirmKind('convert')}
          >
            Convert to quote
          </Button>
        )}
        {canCancel && (
          <Button
            size="sm"
            type="button"
            variant="danger"
            leftIcon={<X />}
            disabled={anyActionPending}
            onClick={() => {
              setCancelReason('');
              setConfirmKind('cancel');
            }}
          >
            Cancel enquiry
          </Button>
        )}
        {!canCopy &&
        !canGenerateQuotation &&
        !canGenerateShipment &&
        !canGenerateJob &&
        !canConvert &&
        !canCancel ? (
          <span className="text-[12px] text-[var(--color-neutral-500)]">
            No generation actions available for this enquiry status.
          </span>
        ) : null}
      </div>

      {/* Tabs + form body */}
      <form
        ref={formRef}
        id="enquiry-edit-form"
        className={erpForm.section}
        onSubmit={handleValidatedSubmit(async (values) => {
          await update.mutateAsync(prepareCrmPayload(values) as UpdateEnquiryFormValues);
        })}
      >
        <div className="kf-tabs-scroll flex gap-0 overflow-x-auto border-b border-[var(--color-sidebar-bg,#0A2942)] bg-[var(--color-sidebar-bg,#0A2942)]">
          {enquiryTabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'shrink-0 border-b-2 px-3.5 py-2.5 text-[12px] font-semibold capitalize transition-colors',
                activeTab === tab.key
                  ? 'border-white bg-white/15 text-white'
                  : 'border-transparent text-white/80 hover:bg-white/10 hover:text-white',
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="space-y-3 p-3">
          {showParty ? (
            <CrmSection title="Party & operation">
              <div className={erpForm.grid3}>
                <Field label="Department / Service" error={err('service_type')}>
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
                <div className="sm:col-span-3">
                  <CrmPartySelect
                    label="Client"
                    value={watch('party_id') ?? ''}
                    onChange={(pid) => setValue('party_id', pid, { shouldValidate: true })}
                    error={err('party_id')}
                  />
                </div>
                <CrmPartySelect
                  label="Shipper"
                  value={watch('shipper_id') ?? ''}
                  onChange={(partyId) => setValue('shipper_id', partyId, { shouldValidate: true })}
                  error={err('shipper_id')}
                />
                <CrmPartySelect
                  label="Consignee"
                  value={watch('consignee_id') ?? ''}
                  onChange={(partyId) => setValue('consignee_id', partyId, { shouldValidate: true })}
                  error={err('consignee_id')}
                />
              </div>
            </CrmSection>
          ) : null}

          {showPorts ? (
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
                  label={isFcl ? 'Origin / POL' : 'Origin'}
                  kind={placeKind}
                  jobType={serviceType}
                  value={watch('origin_port_id') ?? ''}
                  onChange={(v) => setValue('origin_port_id', v, { shouldValidate: true })}
                  error={err('origin_port_id')}
                  excludeId={watch('dest_port_id') || undefined}
                />
                <MasterPlaceSelect
                  name="dest_port_id"
                  label={isFcl ? 'Destination / POD' : 'Destination'}
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
          ) : null}

          {showConsignment ? (
            <CrmSection title="Consignment Details">
              <div className={erpForm.grid3}>
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
          ) : null}

          {showCharges ? (
            <CrmSection title="Charge Details">
              <div className="overflow-x-auto">
                <table className="w-full text-[13px]">
                  <thead>
                    <tr>
                      <th className="px-2 py-1 text-left text-[11px] font-semibold text-[var(--fresa-header-text)]">
                        Description
                      </th>
                      <th className="px-2 py-1 text-right text-[11px] font-semibold text-[var(--fresa-header-text)]">
                        Qty
                      </th>
                      <th className="px-2 py-1 text-right text-[11px] font-semibold text-[var(--fresa-header-text)]">
                        Amount
                      </th>
                      <th className="px-2 py-1 text-left text-[11px] font-semibold text-[var(--fresa-header-text)]">
                        Currency
                      </th>
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
          ) : null}
        </div>

        <div className={`${erpForm.footer} print:hidden`}>
          <Button size="sm" leftIcon={<Save />} disabled={update.isPending}>
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
                leftIcon={<X />}
                disabled={anyActionPending}
                onClick={() => setConfirmKind(null)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant={confirmCopy[confirmKind].danger ? 'danger' : 'primary'}
                leftIcon={<Check />}
                disabled={
                  anyActionPending ||
                  (confirmKind === 'cancel' && cancelReason.trim().length < 2)
                }
                onClick={executeConfirm}
              >
                {anyActionPending ? 'Working…' : 'OK'}
              </Button>
            </div>
          }
        >
          <div className="space-y-3">
            <p className="text-sm text-[var(--color-neutral-600)]">
              {confirmCopy[confirmKind].body}
            </p>
            {confirmKind === 'cancel' ? (
              <Field label="Cancel reason" required>
                <TextArea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Customer withdrew interest…"
                  maxLength={500}
                />
              </Field>
            ) : null}
          </div>
        </Modal>
      )}
    </div>
  );
}
