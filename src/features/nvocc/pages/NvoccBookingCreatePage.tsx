import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PageBackLink } from '@/components/ui/PageBackLink';
import { FieldError } from '@/components/ui/FieldError/FieldError';
import { SelectInput, TextInput } from '@/components/widgets/FilterField';
import { useParties } from '@/features/parties/hooks/useParties';
import { useMasterOptions } from '@/features/masters/hooks/useMasterResource';
import { MASTER_PATHS } from '@/features/masters/api/masterPaths';
import { NvoccFormActions, NvoccFormField } from '@/features/nvocc/components/NvoccFormField';
import { NvoccPermissionNotice } from '@/features/nvocc/components/NvoccPermissionNotice';
import { NVOCC_CARGO_TYPES } from '@/features/nvocc/constants/nvocc.constants';
import type { NvoccCargoType } from '@/features/nvocc/constants/nvocc.constants';
import { useCreateNvoccBooking, useNvoccVoyages } from '@/features/nvocc/hooks/useNvocc';
import { nvoccBookingService } from '@/features/nvocc/services/nvocc.service';
import {
  bookingFormToSchemaInput,
  createNvoccBookingFormSchema,
  toBookingPayload,
} from '@/features/nvocc/schemas/nvocc.schema';
import {
  emptyNvoccCreateBookingForm,
  mergeQuotationAndPortalIntoCreateForm,
  portalPayloadToNvoccBookingFormDto,
  resolvePartyIdsFromPortal,
} from '@/features/nvocc/utils/nvoccBookingPrefill';
import { quotationService } from '@/features/quotations/services/quotation.service';
import { portalAdminInboxService } from '@/features/portal-admin-inbox/services/portalAdminInbox.service';
import { quotationDisplayNumber } from '@/features/quotations/utils/normalizeQuotation';
import { rememberQuoteBookingLink } from '@/features/nvocc/utils/quoteBookingLink';
import { useOrganizationProfile } from '@/features/organization/hooks/useOrganizationProfile';
import { useInlineValidation } from '@/lib/validation';
import { isUuid } from '@/lib/isUuid';

function voyageOptionLabel(v: {
  id: string;
  voyage_number?: string;
  pol_name?: string;
  pod_name?: string;
  etd?: string;
}): string {
  const route =
    v.pol_name && v.pod_name ? `${v.pol_name} → ${v.pod_name}` : v.pol_name || v.pod_name || '';
  const parts = [v.voyage_number || v.id.slice(0, 8), route, v.etd?.slice(0, 10)].filter(Boolean);
  return parts.join(' · ');
}

export default function NvoccBookingCreatePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const quotationIdParam = searchParams.get('quotationId')?.trim() || '';
  const enquiryIdParam = searchParams.get('enquiryId')?.trim() || '';

  const create = useCreateNvoccBooking();
  const { fieldError, formError, clearErrors, runValidated, revalidate } = useInlineValidation();
  const [form, setForm] = useState(emptyNvoccCreateBookingForm);
  const [prefillNote, setPrefillNote] = useState<string | null>(null);
  const [prefillLoading, setPrefillLoading] = useState(Boolean(quotationIdParam));
  const [partySearch, setPartySearch] = useState('');
  const { data: organization } = useOrganizationProfile();

  const voyagesQuery = useNvoccVoyages({ limit: 100 });
  const { data: containerTypes = [] } = useMasterOptions(
    'container-types',
    MASTER_PATHS['container-types'],
  );
  const { data: partiesResult } = useParties({
    page: 1,
    limit: 50,
    search: partySearch.trim() || undefined,
    order: 'asc',
  });

  const voyageOptions = useMemo(
    () =>
      (voyagesQuery.data?.items ?? []).map((v) => ({
        value: v.id,
        label: voyageOptionLabel(v),
      })),
    [voyagesQuery.data?.items],
  );

  const partyOptions = useMemo(
    () =>
      (partiesResult?.parties ?? []).map((p) => ({
        value: p.id,
        label: p.short_name?.trim() ? `${p.name} (${p.short_name})` : p.name,
      })),
    [partiesResult?.parties],
  );

  const containerTypeOptions = useMemo(
    () =>
      containerTypes.map((row) => {
        const id = String(row.id ?? '').trim();
        const code = String(row.code ?? row.size ?? '').trim();
        const name = String(row.name ?? code).trim();
        return {
          value: isUuid(id) ? id : code,
          label: name && code && name !== code ? `${name} (${code})` : name || code || id,
        };
      }),
    [containerTypes],
  );

  useEffect(() => {
    if (enquiryIdParam && isUuid(enquiryIdParam)) {
      setForm((prev) => ({ ...prev, enquiry_id: enquiryIdParam }));
    }
  }, [enquiryIdParam]);

  useEffect(() => {
    if (!quotationIdParam || !isUuid(quotationIdParam)) {
      setPrefillLoading(false);
      return;
    }
    let cancelled = false;
    void (async () => {
      setPrefillLoading(true);
      try {
        const quotation = await quotationService.getById(quotationIdParam);
        const quoteNumber = quotation.quotation_number || quotation.quote_no;
        const portal = await portalAdminInboxService.findCustomerPortalBookingForm({
          quotationId: quotation.id,
          quoteNumber,
          jobTypePrefix: 'NVOCC',
          bookingId: quotation.booking_id,
        });
        let shipperId: string | undefined;
        let consigneeId: string | undefined;
        if (portal) {
          const resolved = await resolvePartyIdsFromPortal(portal);
          shipperId = resolved.shipperId;
          consigneeId = resolved.consigneeId;
        }
        if (cancelled) return;
        setForm((prev) =>
          mergeQuotationAndPortalIntoCreateForm(prev, {
            quotation,
            portal,
            shipperId,
            consigneeId,
          }),
        );
        const label = quotationDisplayNumber(quotation);
        setPrefillNote(
          portal
            ? `Prefilled from quotation ${label} and the customer portal booking form. Review voyage and parties, then create.`
            : `Prefilled from quotation ${label}. No portal form in inbox yet — fields come from the quote API.`,
        );
      } catch {
        if (!cancelled) {
          setPrefillNote('Could not load quotation / portal prefill. Enter booking details manually.');
        }
      } finally {
        if (!cancelled) setPrefillLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [quotationIdParam]);

  const patch = (next: Partial<typeof form>) => {
    setForm((prev) => {
      const merged = { ...prev, ...next };
      revalidate(createNvoccBookingFormSchema, bookingFormToSchemaInput(merged));
      return merged;
    });
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    clearErrors();
    await runValidated(createNvoccBookingFormSchema, bookingFormToSchemaInput(form), async (parsed) => {
      const booking = await create.mutateAsync(toBookingPayload(parsed));
      if (quotationIdParam && isUuid(quotationIdParam)) {
        rememberQuoteBookingLink({
          quotationId: quotationIdParam,
          bookingId: booking.id,
        });
      }
      if (quotationIdParam && isUuid(quotationIdParam)) {
        try {
          const portal = await portalAdminInboxService.findCustomerPortalBookingForm({
            quotationId: quotationIdParam,
            bookingId: booking.id,
            jobTypePrefix: 'NVOCC',
          });
          const agentLine = (organization?.display_name || organization?.name || '').trim();
          const opsDto = portal ? portalPayloadToNvoccBookingFormDto(portal, { defaultAgentLine: agentLine }) : null;
          if (opsDto) {
            await nvoccBookingService.updateBookingForm(booking.id, opsDto);
          }
        } catch {
          /* booking row exists; Ops form can sync later on detail page */
        }
      }
      navigate(`/nvocc/bookings/${booking.id}`);
    });
  };

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <PageBackLink to="/nvocc/booking-list" label="Back to bookings" />
      <NvoccPermissionNotice />
      <form onSubmit={submit} className="space-y-4 rounded-md border border-gray-200 bg-white p-5">
        <h1 className="text-lg font-semibold text-gray-900">New NVOCC booking</h1>
        <p className="text-sm text-gray-500">
          Voyage is required. Open with{' '}
          <code className="text-xs">?quotationId=…</code> to pull customer portal + quotation fields
          from the API.
        </p>
        {prefillLoading ? (
          <p className="text-sm text-gray-600">Loading quotation and customer booking form…</p>
        ) : null}
        {prefillNote ? <p className="text-sm text-emerald-800 rounded-md bg-emerald-50 px-3 py-2">{prefillNote}</p> : null}

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <NvoccFormField label="Voyage" required error={fieldError('voyage_id')}>
              <SelectInput
                options={[{ value: '', label: 'Select voyage…' }, ...voyageOptions]}
                value={form.voyage_id}
                onChange={(e) => patch({ voyage_id: e.target.value })}
              />
            </NvoccFormField>
          </div>

          <NvoccFormField label="Enquiry" error={fieldError('enquiry_id')}>
            <TextInput
              value={form.enquiry_id}
              onChange={(e) => patch({ enquiry_id: e.target.value })}
              placeholder="Optional — from enquiry convert"
              readOnly={Boolean(enquiryIdParam)}
            />
          </NvoccFormField>

          <NvoccFormField label="Job type" error={fieldError('job_type')}>
            <TextInput
              value={form.job_type}
              onChange={(e) => patch({ job_type: e.target.value })}
              placeholder="e.g. NVOCC_EXPORT"
            />
          </NvoccFormField>

          <NvoccFormField label="Cargo type" required error={fieldError('cargo_type')}>
            <SelectInput
              options={NVOCC_CARGO_TYPES.map((v) => ({ value: v, label: v }))}
              value={form.cargo_type}
              onChange={(e) => patch({ cargo_type: e.target.value as NvoccCargoType })}
            />
          </NvoccFormField>

          <NvoccFormField label="Container type" error={fieldError('container_type_id')}>
            <SelectInput
              options={[{ value: '', label: 'Select container type…' }, ...containerTypeOptions]}
              value={form.container_type_id}
              onChange={(e) => patch({ container_type_id: e.target.value })}
            />
          </NvoccFormField>

          <NvoccFormField label="Container count" error={fieldError('container_count')}>
            <TextInput
              type="number"
              value={form.container_count}
              onChange={(e) => patch({ container_count: e.target.value })}
            />
          </NvoccFormField>

          <NvoccFormField label="Shipper" error={fieldError('shipper_id')}>
            <div className="space-y-1">
              <TextInput
                value={partySearch}
                onChange={(e) => setPartySearch(e.target.value)}
                placeholder="Search parties…"
              />
              <SelectInput
                options={[{ value: '', label: 'Select shipper…' }, ...partyOptions]}
                value={form.shipper_id}
                onChange={(e) => patch({ shipper_id: e.target.value })}
              />
            </div>
          </NvoccFormField>

          <NvoccFormField label="Consignee" error={fieldError('consignee_id')}>
            <SelectInput
              options={[{ value: '', label: 'Select consignee…' }, ...partyOptions]}
              value={form.consignee_id}
              onChange={(e) => patch({ consignee_id: e.target.value })}
            />
          </NvoccFormField>

          <NvoccFormField label="CBM allocated" error={fieldError('cbm_allocated')}>
            <TextInput
              type="number"
              value={form.cbm_allocated}
              onChange={(e) => patch({ cbm_allocated: e.target.value })}
            />
          </NvoccFormField>

          <NvoccFormField label="Gross weight (kg)" error={fieldError('gross_weight')}>
            <TextInput
              type="number"
              value={form.gross_weight}
              onChange={(e) => patch({ gross_weight: e.target.value })}
            />
          </NvoccFormField>

          <NvoccFormField label="Pieces" error={fieldError('pieces')}>
            <TextInput
              type="number"
              value={form.pieces}
              onChange={(e) => patch({ pieces: e.target.value })}
            />
          </NvoccFormField>

          <NvoccFormField label="HS code" error={fieldError('hs_code')}>
            <TextInput value={form.hs_code} onChange={(e) => patch({ hs_code: e.target.value })} />
          </NvoccFormField>

          <NvoccFormField label="Shipper ref" error={fieldError('shipper_ref')}>
            <TextInput value={form.shipper_ref} onChange={(e) => patch({ shipper_ref: e.target.value })} />
          </NvoccFormField>

          <NvoccFormField label="Incoterms" error={fieldError('incoterms')}>
            <TextInput value={form.incoterms} onChange={(e) => patch({ incoterms: e.target.value })} />
          </NvoccFormField>

          <NvoccFormField label="Freight terms" error={fieldError('freight_terms')}>
            <TextInput
              value={form.freight_terms}
              onChange={(e) => patch({ freight_terms: e.target.value })}
            />
          </NvoccFormField>

          <div className="sm:col-span-2">
            <NvoccFormField label="Commodity" error={fieldError('commodity')}>
              <TextInput value={form.commodity} onChange={(e) => patch({ commodity: e.target.value })} />
            </NvoccFormField>
          </div>

          <label className="flex items-center gap-2 text-sm text-gray-700 sm:col-span-2">
            <input
              type="checkbox"
              checked={form.is_dg}
              onChange={(e) => patch({ is_dg: e.target.checked })}
              className="rounded border-gray-300"
            />
            Dangerous goods (is_dg)
          </label>

          <label className="flex items-center gap-2 text-sm text-gray-700 sm:col-span-2">
            <input
              type="checkbox"
              checked={form.apply_tariff}
              onChange={(e) => patch({ apply_tariff: e.target.checked })}
              className="rounded border-gray-300"
            />
            Auto-apply matching NVOCC tariff charge lines
          </label>
        </div>

        <FieldError message={formError} />
        <NvoccFormActions
          pending={create.isPending || prefillLoading}
          submitLabel="Create booking"
          onClear={() => {
            clearErrors();
            setForm(emptyNvoccCreateBookingForm());
            setPrefillNote(null);
          }}
        />
      </form>
    </div>
  );
}
