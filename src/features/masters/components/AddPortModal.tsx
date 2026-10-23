import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { getServerErrorMessage } from '@/lib/validation/mapApiErrors';

export type CreatePortInlineDto = {
  un_locode: string;
  name: string;
  country_code: string;
  city?: string;
  mode?: 'AIR' | 'SEA' | 'LAND' | 'ROAD' | 'COURIER';
  latitude?: number;
  longitude?: number;
  is_active?: boolean;
};

export type AddPortModalProps = {
  open: boolean;
  onClose: () => void;
  /** Prefill mode from job type (AIR → AIR, else SEA). */
  defaultMode?: CreatePortInlineDto['mode'];
  title?: string;
  /**
   * Called with CreatePortDto fields for inline create_origin_port / create_dest_port
   * (or POST /masters/ports if the parent prefers).
   */
  onSubmit: (dto: CreatePortInlineDto) => void;
};

const FIELD =
  'h-9 w-full rounded-md border border-[var(--color-neutral-200)] bg-white px-3 text-sm focus:outline-none focus:border-[var(--color-primary-500)]';

/**
 * Collect CreatePortDto for quote/job inline create_origin_port / create_dest_port.
 * Staff/admin only — portal/vendor stay read-only.
 */
export function AddPortModal({
  open,
  onClose,
  defaultMode = 'SEA',
  title = 'Add port',
  onSubmit,
}: AddPortModalProps) {
  const [unLocode, setUnLocode] = useState('');
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [mode, setMode] = useState<CreatePortInlineDto['mode']>(defaultMode);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setUnLocode('');
    setName('');
    setCity('');
    setCountry('');
    setMode(defaultMode);
    setError(null);
  }, [open, defaultMode]);

  const submit = () => {
    setError(null);
    const un_locode = unLocode.trim().toUpperCase();
    const portName = name.trim();
    const country_code = country.trim().toUpperCase();
    if (un_locode.length < 3) {
      setError('UN/LOCODE is required (e.g. AEJEA).');
      return;
    }
    if (portName.length < 2) {
      setError('Name is required.');
      return;
    }
    if (!/^[A-Z]{2}$/.test(country_code)) {
      setError('Country code must be 2 letters (e.g. AE).');
      return;
    }
    try {
      onSubmit({
        un_locode,
        name: portName,
        country_code,
        ...(city.trim() ? { city: city.trim() } : {}),
        mode: mode ?? defaultMode,
        is_active: true,
      });
      onClose();
    } catch (err) {
      setError(getServerErrorMessage(err));
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="md"
      footer={
        <div className="flex justify-end gap-2">
          <Button type="button" size="sm" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" size="sm" onClick={submit}>
            Use on form
          </Button>
        </div>
      }
    >
      <div className="space-y-3 text-sm">
        <p className="text-[var(--color-neutral-600)]">
          Creates the port when you save the quote/job (
          <code className="text-[11px]">create_origin_port</code> /{' '}
          <code className="text-[11px]">create_dest_port</code>). Existing UN/LOCODE
          is reused by the server.
        </p>
        {error ? (
          <p className="rounded-md border border-[var(--color-danger-200)] bg-[var(--color-danger-50)] px-3 py-2 text-[var(--color-danger-700)]">
            {error}
          </p>
        ) : null}
        <Input
          label="UN/LOCODE"
          value={unLocode}
          onChange={(e) => setUnLocode(e.target.value)}
          placeholder="AEJEA"
          className="font-mono uppercase"
        />
        <Input
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Jebel Ali"
        />
        <Input
          label="City"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Dubai"
        />
        <Input
          label="Country code"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          placeholder="AE"
          className="font-mono uppercase"
        />
        <label className="block space-y-1">
          <span className="text-xs font-medium text-[var(--color-neutral-600)]">Mode</span>
          <select
            className={FIELD}
            value={mode ?? 'SEA'}
            onChange={(e) =>
              setMode(e.target.value as CreatePortInlineDto['mode'])
            }
          >
            <option value="SEA">Sea</option>
            <option value="AIR">Air</option>
            <option value="LAND">Land</option>
            <option value="ROAD">Road</option>
            <option value="COURIER">Courier</option>
          </select>
        </label>
      </div>
    </Modal>
  );
}
