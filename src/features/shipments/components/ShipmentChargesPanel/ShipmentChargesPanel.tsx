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
} from '../../hooks/useShipments';
import type { Shipment } from '../../types/shipment.types';
import { getErrorMessage } from '../../utils/getErrorMessage';
import type { ShipmentChargeRow } from '../../utils/normalizeShipmentCharges';

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
  onChanged?: () => void;
}

/**
 * Fresa Costing tab for shipments — toolbar + grid driven by
 * GET/POST /shipments/:id/charges, get-charges, copy-charges (no invented APIs).
 */
export function ShipmentChargesPanel({
  shipment,
  onChanged,
}: ShipmentChargesPanelProps) {
  const chargesQuery = useShipmentCharges(shipment.id);
  const mutations = useShipmentChargeMutations(shipment.id);

  const charges = useMemo(() => {
    if (chargesQuery.data?.length) return chargesQuery.data;
    return [];
  }, [chargesQuery.data]);

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

  const [quotationId, setQuotationId] = useState(
    () => (shipment.quotation_id && isUuid(shipment.quotation_id) ? shipment.quotation_id : ''),
  );
  const [includeStandard, setIncludeStandard] = useState(true);

  const [copyFromShipmentId, setCopyFromShipmentId] = useState('');
  const [copyFromJobId, setCopyFromJobId] = useState('');
  const [copyFromQuotationId, setCopyFromQuotationId] = useState('');

  const closeDialog = () => setDialog(null);

  const run = async (fn: () => Promise<unknown>, success?: string) => {
    setError(null);
    setMsg(null);
    try {
      await fn();
      if (success) setMsg(success);
      onChanged?.();
      void chargesQuery.refetch();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const addCharge = async () => {
    const price = Number(unitPrice);
    const qty = quantity === '' ? undefined : Number(quantity);
    if (!description.trim() || !Number.isFinite(price)) {
      setError('Description and unit price are required.');
      return;
    }
    await run(
      () =>
        mutations.create.mutateAsync({
          description: description.trim(),
          unit_price: price,
          currency_code: currency.trim().toUpperCase() || undefined,
          quantity: qty != null && Number.isFinite(qty) ? qty : undefined,
          charge_code_id: isUuid(chargeCodeId.trim()) ? chargeCodeId.trim() : undefined,
          is_cost: isCost,
          party_id: isUuid(partyId.trim()) ? partyId.trim() : undefined,
        }),
      'Charge added.',
    );
    setChargeCodeId('');
    setDescription('');
    setUnitPrice('');
    setIsCost(false);
    setPartyId('');
    closeDialog();
  };

  const submitGetCharges = async () => {
    await run(
      () =>
        mutations.pullCharges.mutateAsync({
          ...(isUuid(quotationId.trim()) ? { quotation_id: quotationId.trim() } : {}),
          include_standard_charges: includeStandard,
        }),
      'Charges pulled.',
    );
    closeDialog();
  };

  const submitCopyCharges = async () => {
    const dto = {
      source_shipment_id: isUuid(copyFromShipmentId.trim())
        ? copyFromShipmentId.trim()
        : undefined,
      source_job_id: isUuid(copyFromJobId.trim()) ? copyFromJobId.trim() : undefined,
      source_quotation_id: isUuid(copyFromQuotationId.trim())
        ? copyFromQuotationId.trim()
        : undefined,
    };
    if (!dto.source_shipment_id && !dto.source_job_id && !dto.source_quotation_id) {
      setError('Provide a source shipment, job, or quotation UUID.');
      return;
    }
    await run(() => mutations.copyCharges.mutateAsync(dto), 'Charges copied.');
    closeDialog();
  };

  return (
    <div className="kf-section-enter space-y-4 p-3">
      {error ? (
        <p className="text-sm text-[var(--color-danger-600)]">{error}</p>
      ) : null}
      {msg ? (
        <p className="text-sm text-[var(--color-success-700)]">{msg}</p>
      ) : null}

      {/* Fresa Costing toolbar — same chrome as job Costing */}
      <div className="kf-section-ambient flex flex-wrap gap-2 rounded-sm border border-[var(--fresa-border,#C9D3DF)] px-3 py-2.5">
        <Button type="button" size="sm" variant="create" onClick={() => setDialog('add')}>
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
          <CardTitle className="text-[#0f172a]">
            Costing
          </CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          {chargesQuery.isLoading ? (
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
                {charges.map((c: ShipmentChargeRow) => (
                  <tr key={c.id} className={erpTable.row}>
                    <td className={`${erpTable.td} font-medium`}>
                      {c.description || '—'}
                    </td>
                    <td className={erpTable.td}>
                      {c.charge_code ||
                        (c.charge_code_id ? c.charge_code_id.slice(0, 8) : '—')}
                    </td>
                    <td className={SALE_TD}>
                      {!c.is_cost ? c.unit_price : '—'}
                    </td>
                    <td className={COST_TD}>
                      {c.is_cost ? c.unit_price : '—'}
                    </td>
                    <td className={erpTable.td}>
                      {c.party_name || (c.party_id ? c.party_id.slice(0, 8) : '—')}
                    </td>
                    <td className={`${erpTable.td} text-right tabular-nums`}>
                      {c.quantity ?? '—'}
                    </td>
                    <td className={`${erpTable.td} text-right tabular-nums`}>
                      {c.unit_price}
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
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Card>

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
              Save and Close
            </Button>
          </>
        }
      >
        <div className="grid gap-3 sm:grid-cols-2">
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
              Submit
            </Button>
          </>
        }
      >
        <div className="space-y-3 text-sm">
          <p className="text-[var(--color-neutral-500)]">
            Pull charges from quotation and/or party standards (POST
            /shipments/:id/get-charges).
          </p>
          <Input
            label="Quotation UUID"
            value={quotationId}
            onChange={(e) => setQuotationId(e.target.value)}
            placeholder="Optional — uses linked quotation when set"
          />
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={includeStandard}
              onChange={(e) => setIncludeStandard(e.target.checked)}
            />
            Include standard charges
          </label>
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
              Submit
            </Button>
          </>
        }
      >
        <div className="grid gap-3">
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
        </div>
      </Modal>
    </div>
  );
}
