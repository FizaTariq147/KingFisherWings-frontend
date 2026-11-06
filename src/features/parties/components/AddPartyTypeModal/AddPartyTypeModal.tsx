import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { getServerErrorMessage } from '@/lib/validation/mapApiErrors';
import { useCreatePartyType } from '../../hooks/useParties';

export type AddPartyTypeModalProps = {
  open: boolean;
  onClose: () => void;
  /** Called after create — parent should select the new type code. */
  onCreated: (code: string, label: string) => void;
  /** Open over another modal / wizard surface. */
  nested?: boolean;
};

const FIELD =
  'h-8 w-full rounded-sm border border-[var(--fresa-border,#C9D3DF)] px-2.5 text-[13px]';

/** CreatePartyTypeDto code: letters (normalized to uppercase + underscore). */
function toCode(raw: string): string {
  return raw
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, '_')
    .replace(/[^A-Z_]/g, '')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
}

/**
 * In-place custom party type create.
 * POST /parties/types — CreatePartyTypeDto `{ code, label }`.
 */
export function AddPartyTypeModal({
  open,
  onClose,
  onCreated,
  nested = true,
}: AddPartyTypeModalProps) {
  const create = useCreatePartyType();
  const [code, setCode] = useState('');
  const [label, setLabel] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setCode('');
    setLabel('');
    setError(null);
  }, [open]);

  const submit = async () => {
    setError(null);
    const normalized = toCode(code || label);
    if (!normalized) {
      setError('Code is required (letters only, e.g. FREIGHT_FORWARDER).');
      return;
    }
    const dto = {
      code: normalized,
      label: label.trim() || normalized.replaceAll('_', ' '),
    };
    try {
      const created = await create.mutateAsync(dto);
      onCreated(created.code || normalized, created.label || dto.label);
      onClose();
    } catch (err) {
      setError(getServerErrorMessage(err) || 'Could not create party type.');
    }
  };

  return (
    <Modal
      open={open}
      onClose={() => !create.isPending && onClose()}
      title="Add custom party type"
      size="sm"
      layer={nested ? 'nested' : 'base'}
      footer={
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            size="sm"
            variant="secondary"
            disabled={create.isPending}
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            variant="create"
            leftIcon={<Plus />}
            disabled={create.isPending || !toCode(code || label)}
            onClick={() => void submit()}
          >
            {create.isPending ? 'Saving…' : 'Add type'}
          </Button>
        </div>
      }
    >
      {error ? (
        <p className="mb-2 text-[13px] text-[var(--color-danger-600)]">{error}</p>
      ) : null}
      <label className="mb-3 block text-[13px]">
        <span className="mb-1 block text-[12px] font-medium text-[#334155]">Code</span>
        <input
          className={FIELD}
          value={code}
          placeholder="FREIGHT_FORWARDER"
          onChange={(e) => setCode(toCode(e.target.value) || e.target.value.toUpperCase())}
          onBlur={() => setCode((c) => toCode(c))}
        />
      </label>
      <label className="block text-[13px]">
        <span className="mb-1 block text-[12px] font-medium text-[#334155]">Label</span>
        <input
          className={FIELD}
          value={label}
          placeholder="Freight forwarder"
          onChange={(e) => {
            setLabel(e.target.value);
            if (!code.trim()) setCode(toCode(e.target.value));
          }}
        />
      </label>
    </Modal>
  );
}
