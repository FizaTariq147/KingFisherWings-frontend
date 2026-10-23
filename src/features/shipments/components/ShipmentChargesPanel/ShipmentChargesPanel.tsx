import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { erpTable } from '@/lib/erpTypography';
import { isUuid } from '@/lib/isUuid';
import {
  useShipmentChargeMutations,
  useShipmentCharges,
  useShipmentDetailTab,
} from '../../hooks/useShipments';
import type { Shipment } from '../../types/shipment.types';
import { getErrorMessage } from '../../utils/getErrorMessage';
import { PartiesIncludedSummary } from '@/features/jobs/components/PartiesIncludedSummary';
import {
  derivePartiesIncludedFromCharges,
  normalizePartiesIncluded,
} from '@/features/jobs/utils/normalizeCostingParties';
import {
  normalizeShipmentCharges,
  type ShipmentChargeRow,
} from '../../utils/normalizeShipmentCharges';

const SALE_TH =
  'bg-[#FF751F] text-white text-left font-semibold px-2 py-1.5 whitespace-nowrap text-[11px]';
const SALE_TD =
  'bg-[#FFE8CC] px-3 py-1.5 text-[13px] text-[#334155] align-middle tabular-nums';
const COST_TH =
  'bg-[#0EA5E9] text-white text-left font-semibold px-2 py-1.5 whitespace-nowrap text-[11px]';
const COST_TD =
  'bg-[#D9F1FB] px-3 py-1.5 text-[13px] text-[#334155] align-middle tabular-nums';

type DialogKey = 'add' | 'getCharges' | 'copyCharges' | null;

interface ShipmentChargesPanelProps {
  shipment: Shipment;
  /** Active detail tab key (costing | charges | cost) for list fallback. */
  tabKey?: string;
  onChanged?: () => void;
}

/**
 * Fresa Costing tab for shipments — toolbar + grid driven by
 * GET/POST /shipments/:id/charges, get-charges, copy-charges.
 */
export function ShipmentChargesPanel({
  shipment,
  tabKey = 'costing',
  onChanged,
}: ShipmentChargesPanelProps) {
  const chargesQuery = useShipmentCharges(shipment.id);
  /** Fallback when GET /charges is empty — detail/{tab} payload. */
  const costingTabQuery = useShipmentDetailTab(shipment.id, tabKey);
  const mutations = useShipmentChargeMutations(shipment.id);

  const charges = useMemo(() => {
    if (chargesQuery.data?.length) return chargesQuery.data;
    const fromTab = normalizeShipmentCharges(costingTabQuery.data);
    return fromTab;
  }, [chargesQuery.data, costingTabQuery.data]);

  const partiesIncluded = useMemo(() => {
    const fromApi = normalizePartiesIncluded(costingTabQuery.data);
    if (fromApi.length) return fromApi;
    return derivePartiesIncludedFromCharges(charges);
  }, [charges, costingTabQuery.data]);

  const [dialog, setDialog] = useState<DialogKey>(null);
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const [chargeCodeId, setChargeCodeId] = useState('');
  const [description, setDescription] = useState('');
  const [unitPrice, setUnitPrice] = useState('');
  const [currency, setCurrency] = useState('AED');
  const [quantity, setQuantity] = useState('1');
  const [isCost, setIsCost] = useState(false);
  const [partyId, setPartyId] = useState('');

  const [fromQuotation, setFromQuotation] = useState(true);
  const [fromPartyStandard, setFromPartyStandard] = useState(true);
  const [quotationId, setQuotationId] = useState(
    () => (shipment.quotation_id && isUuid(shipment.quotation_id) ? shipment.quotation_id : ''),
  );

  const [copyFromShipmentId, setCopyFromShipmentId] = useState('');
  const [copyFromJobId, setCopyFromJobId] = useState('');
  const [copyFromQuotationId, setCopyFromQuotationId] = useState('');
  const [copySale, setCopySale] = useState(true);
  const [copyCost, setCopyCost] = useState(true);

  const closeDialog = () => setDialog(null);

  const refresh = () => {
    void chargesQuery.refetch();
    void costingTabQuery.refetch();
  };

  /** Returns true on success; keeps dialog open and surfaces API message on failure. */
  const run = async (fn: () => Promise<unknown>, success?: string): Promise<boolean> => {
    setError(null);
    setMsg(null);
    try {
      await fn();
      if (success) setMsg(success);
      onChanged?.();
      refresh();
      return true;
    } catch (err) {
      setError(getErrorMessage(err));
      return false;
    }
  };

  const addCharge = async () => {
    const price = Number(unitPrice);
    const qty = quantity === '' ? undefined : Number(quantity);
    if (!description.trim() || !Number.isFinite(price)) {
      setError('Description and unit price are required.');
      return;
    }
    if (chargeCodeId.trim() && !isUuid(chargeCodeId.trim())) {
      setError('Charge code must be a valid UUID when provided.');
      return;
    }
    if (partyId.trim() && !isUuid(partyId.trim())) {
      setError('Party must be a valid UUID when provided.');
      return;
    }
    const ok = await run(
      () =>
        mutations.create.mutateAsync({
          description: description.trim(),
          unit_price: price,
          currency_code: currency.trim().toUpperCase() || undefined,
          quantity: qty != null && Number.isFinite(qty) ? qty : undefined,
          charge_code_id: isUuid(chargeCodeId.trim()) ? chargeCodeId.trim() : undefined,
          is_cost: isCost || undefined,
          party_id: isUuid(partyId.trim()) ? partyId.trim() : undefined,
        }),
      'Charge added.',
    );
    if (!ok) return;
    setChargeCodeId('');
    setDescription('');
    setUnitPrice('');
    setQuantity('1');
    setIsCost(false);
    setPartyId('');
    closeDialog();
  };

  const submitGetCharges = async () => {
    if (!fromQuotation && !fromPartyStandard) {
      setError('Select From quotation and/or From party standard.');
      return;
    }
    if (quotationId.trim() && !isUuid(quotationId.trim())) {
      setError('Quotation must be a valid UUID when provided.');
      return;
    }
    const ok = await run(
      () =>
        mutations.pullCharges.mutateAsync({
          from_quotation: fromQuotation,
          from_party_standard: fromPartyStandard,
          ...(isUuid(quotationId.trim()) ? { quotation_id: quotationId.trim() } : {}),
        }),
      'Charges pulled.',
    );
    if (ok) closeDialog();
  };

  const submitCopyCharges = async () => {
    const dto = {
      from_shipment_id: isUuid(copyFromShipmentId.trim())
        ? copyFromShipmentId.trim()
        : undefined,
      from_job_id: isUuid(copyFromJobId.trim()) ? copyFromJobId.trim() : undefined,
      from_quotation_id: isUuid(copyFromQuotationId.trim())
        ? copyFromQuotationId.trim()
        : undefined,
      copy_sale: copySale,
      copy_cost: copyCost,
    };
    if (!dto.from_shipment_id && !dto.from_job_id && !dto.from_quotation_id) {
      setError('Provide a from shipment, job, or quotation UUID.');
      return;
    }
    const ok = await run(() => mutations.copyCharges.mutateAsync(dto), 'Charges copied.');
    if (ok) closeDialog();
  };

  const listError =
    chargesQuery.isError && !charges.length
      ? getErrorMessage(chargesQuery.error) || 'Failed to load charges.'
      : null;

  const loading = chargesQuery.isLoading && costingTabQuery.isLoading;

  return (
    <div className="kf-section-enter space-y-4 p-3">
      {error ? (
        <p className="rounded-sm border border-[var(--color-danger-200,#fecaca)] bg-[var(--color-danger-50,#fef2f2)] px-3 py-2 text-sm text-[var(--color-danger-600)]">
          {error}
        </p>
      ) : null}
      {listError ? (
        <p className="rounded-sm border border-[var(--color-danger-200,#fecaca)] bg-[var(--color-danger-50,#fef2f2)] px-3 py-2 text-sm text-[var(--color-danger-600)]">
          {listError}
          <Button
            type="button"
            size="sm"
            variant="secondary"
            className="ml-2"
            onClick={() => refresh()}
          >
            Retry
          </Button>
        </p>
      ) : null}
      {msg ? (
        <p className="text-sm text-[var(--color-success-700)]">{msg}</p>
      ) : null}

      <div className="kf-section-ambient flex flex-wrap gap-2 rounded-sm border border-[var(--fresa-border,#C9D3DF)] px-3 py-2.5">
        <Button
          type="button"
          size="sm"
          variant="create"
          onClick={() => {
            setError(null);
            setDialog('add');
          }}
        >
          + Add
        </Button>
        <Button
          type="button"
          size="sm"
          variant="warning"
          onClick={() => {
            setError(null);
            setDialog('getCharges');
          }}
        >
          Get Charges
        </Button>
        <Button
          type="button"
          size="sm"
          variant="edit"
          onClick={() => {
            setError(null);
            setDialog('copyCharges');
          }}
        >
          Copy Charges
        </Button>
      </div>

      <Card
        padding="none"
        className="border-[var(--fresa-border,#C9D3DF)] shadow-none overflow-hidden"
      >
        <CardHeader className="mb-0 border-b border-[var(--fresa-border,#C9D3DF)] bg-white px-4 py-2.5">
          <CardTitle className="text-[#0f172a]">Costing</CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          {loading ? (
            <p className="px-4 py-3 text-sm text-[var(--color-neutral-400)]">
              Loading charges…
            </p>
          ) : charges.length === 0 ? (
            <p className="px-4 py-3 text-sm text-[var(--color-neutral-400)]">
              No charges yet. Use Add or Get Charges.
            </p>
          ) : (
            <table className="w-full min-w-[640px] text-left text-[13px]">
              <thead>
                <tr>
                  <th className={erpTable.th}>Charge</th>
                  <th className={erpTable.th}>Code</th>
                  <th className={SALE_TH}>Sale</th>
                  <th className={COST_TH}>Cost</th>
                  <th className={erpTable.th}>Party</th>
                  <th className={`${erpTable.th} text-right`}>Qty</th>
                  <th className={`${erpTable.th} text-right`}>Amount / Qty</th>
                  <th className={erpTable.th}>CCY</th>
                  <th className={erpTable.th} />
                </tr>
              </thead>
              <tbody>
                {charges.map((c: ShipmentChargeRow) => {
                  const saleVal =
                    c.sale_amount != null
                      ? c.sale_amount
                      : !c.is_cost
                        ? c.unit_price
                        : '—';
                  const costVal =
                    c.cost_amount != null
                      ? c.cost_amount
                      : c.is_cost
                        ? c.unit_price
                        : '—';
                  return (
                    <tr key={c.id} className={erpTable.row}>
                      <td className={`${erpTable.td} font-medium`}>
                        {c.description || '—'}
                      </td>
                      <td className={erpTable.td}>
                        {c.charge_code ||
                          (c.charge_code_id ? c.charge_code_id.slice(0, 8) : '—')}
                      </td>
                      <td className={SALE_TD}>{saleVal}</td>
                      <td className={COST_TD}>{costVal}</td>
                      <td className={erpTable.td}>
                        {c.party_name || (c.party_id ? c.party_id.slice(0, 8) : '—')}
                      </td>
                      <td className={`${erpTable.td} text-right tabular-nums`}>
                        {c.quantity ?? '—'}
                      </td>
                      <td className={`${erpTable.td} text-right tabular-nums`}>
                        {c.line_total ?? c.unit_price}
                      </td>
                      <td className={erpTable.td}>{c.currency_code}</td>
                      <td className={erpTable.td}>
                        <Button
                          type="button"
                          size="sm"
                          variant="danger"
                          disabled={!isUuid(c.id) || mutations.remove.isPending}
                          onClick={() =>
                            void run(
                              () => mutations.remove.mutateAsync(c.id),
                              'Charge removed.',
                            )
                          }
                        >
                          Remove
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </Card>

      <PartiesIncludedSummary parties={partiesIncluded} />

      <Modal
        open={dialog === 'add'}
        onClose={closeDialog}
        title="Add charge"
        size="md"
        footer={
          <>
            <Button type="button" variant="danger" onClick={closeDialog}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="success"
              disabled={mutations.create.isPending}
              onClick={() => void addCharge()}
            >
              {mutations.create.isPending ? 'Saving…' : 'Save and Close'}
            </Button>
          </>
        }
      >
        <div className="grid gap-3 sm:grid-cols-2">
          {error && dialog === 'add' ? (
            <p className="text-sm text-[var(--color-danger-600)] sm:col-span-2">{error}</p>
          ) : null}
          <Input
            label="Charge code UUID"
            value={chargeCodeId}
            onChange={(e) => setChargeCodeId(e.target.value)}
          />
          <Input
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <Input
            label="Unit price"
            type="number"
            value={unitPrice}
            onChange={(e) => setUnitPrice(e.target.value)}
          />
          <Input
            label="Quantity"
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
          />
          <Input
            label="Currency"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
          />
          <Input
            label="Party UUID"
            value={partyId}
            onChange={(e) => setPartyId(e.target.value)}
          />
          <label className="flex items-center gap-2 text-sm sm:col-span-2">
            <input
              type="checkbox"
              checked={isCost}
              onChange={(e) => setIsCost(e.target.checked)}
            />
            Cost line (unchecked = sale)
          </label>
        </div>
      </Modal>

      <Modal
        open={dialog === 'getCharges'}
        onClose={closeDialog}
        title="Get Charges"
        size="sm"
        footer={
          <>
            <Button type="button" variant="danger" onClick={closeDialog}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="success"
              disabled={mutations.pullCharges.isPending}
              onClick={() => void submitGetCharges()}
            >
              {mutations.pullCharges.isPending ? 'Submitting…' : 'Submit'}
            </Button>
          </>
        }
      >
        <div className="space-y-3 text-sm">
          {error && dialog === 'getCharges' ? (
            <p className="text-[var(--color-danger-600)]">{error}</p>
          ) : null}
          <p className="text-[var(--color-neutral-500)]">
            Pull charges from quotation and/or party standards (POST
            /shipments/:id/get-charges).
          </p>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={fromQuotation}
              onChange={(e) => setFromQuotation(e.target.checked)}
            />
            From quotation
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={fromPartyStandard}
              onChange={(e) => setFromPartyStandard(e.target.checked)}
            />
            From party standard
          </label>
          <Input
            label="Quotation UUID (optional)"
            value={quotationId}
            onChange={(e) => setQuotationId(e.target.value)}
            placeholder="Uses linked quotation when set"
          />
        </div>
      </Modal>

      <Modal
        open={dialog === 'copyCharges'}
        onClose={closeDialog}
        title="Copy Charges"
        size="md"
        footer={
          <>
            <Button type="button" variant="danger" onClick={closeDialog}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="success"
              disabled={mutations.copyCharges.isPending}
              onClick={() => void submitCopyCharges()}
            >
              {mutations.copyCharges.isPending ? 'Submitting…' : 'Submit'}
            </Button>
          </>
        }
      >
        <div className="grid gap-3">
          {error && dialog === 'copyCharges' ? (
            <p className="text-sm text-[var(--color-danger-600)]">{error}</p>
          ) : null}
          <Input
            label="From shipment UUID"
            value={copyFromShipmentId}
            onChange={(e) => setCopyFromShipmentId(e.target.value)}
          />
          <Input
            label="From job UUID"
            value={copyFromJobId}
            onChange={(e) => setCopyFromJobId(e.target.value)}
          />
          <Input
            label="From quotation UUID"
            value={copyFromQuotationId}
            onChange={(e) => setCopyFromQuotationId(e.target.value)}
          />
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={copySale}
              onChange={(e) => setCopySale(e.target.checked)}
            />
            Copy sale
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={copyCost}
              onChange={(e) => setCopyCost(e.target.checked)}
            />
            Copy cost
          </label>
        </div>
      </Modal>
    </div>
  );
}
