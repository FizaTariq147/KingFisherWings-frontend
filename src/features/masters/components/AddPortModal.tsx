import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { getServerErrorMessage } from '@/lib/validation/mapApiErrors';
import { MASTER_PATHS } from '../api/masterPaths';
import { useMasterMutations } from '../hooks/useMasterResource';
import type { MasterRecord } from '../types/master.types';

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
  /** ports → POST /masters/ports; airports → POST /masters/airports */
  resource?: 'ports' | 'airports';
  /** Prefill mode for ports (AIR when job type is air). */
  defaultMode?: CreatePortInlineDto['mode'];
  title?: string;
  /** Use when opening over another modal. */
  nested?: boolean;
  /** Called after successful POST — parent should select the new id. */
  onCreated: (record: MasterRecord) => void;
};

const FIELD =
  'h-9 w-full rounded-md border border-[var(--color-neutral-200)] bg-white px-3 text-sm focus:outline-none focus:border-[var(--color-primary-500)]';

/**
 * In-place create for Masters → Ports or Airports.
 * POST /masters/ports|airports via useMasterMutations — invalidates place option caches.
 */
export function AddPortModal({
  open,
  onClose,
  resource = 'ports',
  defaultMode = 'SEA',
  title,
  nested = false,
  onCreated,
}: AddPortModalProps) {
  const isAirport = resource === 'airports';
  const { create } = useMasterMutations(
    isAirport ? 'airports' : 'ports',
    isAirport ? MASTER_PATHS.airports : MASTER_PATHS.ports,
  );

  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [mode, setMode] = useState<CreatePortInlineDto['mode']>(defaultMode);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setCode('');
    setName('');
    setCity('');
    setCountry('');
    setMode(defaultMode);
    setError(null);
  }, [open, defaultMode]);

  const placeWord = isAirport ? 'airport' : 'port';
  const modalTitle = title ?? (isAirport ? 'Add airport' : 'Add port');

  const submit = async () => {
    setError(null);
    const codeTrim = code.trim().toUpperCase();
    const placeName = name.trim();
    const country_code = country.trim().toUpperCase();

    if (isAirport) {
      if (codeTrim.length < 3 || codeTrim.length > 4) {
        setError('IATA code is required (e.g. DXB).');
        return;
      }
    } else if (codeTrim.length < 3) {
      setError('UN/LOCODE is required (e.g. AEJEA).');
      return;
    }
    if (placeName.length < 2) {
      setError('Name is required.');
      return;
    }
    if (!/^[A-Z]{2}$/.test(country_code)) {
      setError('Country code must be 2 letters (e.g. AE).');
      return;
    }

    const dto: Record<string, unknown> = isAirport
      ? {
          iata_code: codeTrim.slice(0, 3),
          name: placeName,
          country_code,
          ...(city.trim() ? { city: city.trim() } : {}),
          is_active: true,
        }
      : {
          un_locode: codeTrim,
          name: placeName,
          country_code,
          ...(city.trim() ? { city: city.trim() } : {}),
          mode: mode ?? defaultMode,
          is_active: true,
        };

    try {
      const created = await create.mutateAsync(dto);
      onCreated(created);
      onClose();
    } catch (err) {
      setError(getServerErrorMessage(err) || `Could not create ${placeWord}.`);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={modalTitle}
      size="md"
      layer={nested ? 'nested' : 'base'}
      footer={
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={onClose}
            disabled={create.isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={() => void submit()}
            disabled={create.isPending}
          >
            {create.isPending ? 'Saving…' : `Save ${placeWord}`}
          </Button>
        </div>
      }
    >
      <div className="space-y-3 text-sm">
        <p className="text-[var(--color-neutral-600)]">
          Creates a master {placeWord} immediately. It will appear in this dropdown after save.
        </p>
        {error ? (
          <p className="rounded-md border border-[var(--color-danger-200)] bg-[var(--color-danger-50)] px-3 py-2 text-[var(--color-danger-700)]">
            {error}
          </p>
        ) : null}
        <Input
          label={isAirport ? 'IATA code' : 'UN/LOCODE'}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder={isAirport ? 'DXB' : 'AEJEA'}
          className="font-mono uppercase"
        />
        <Input
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={isAirport ? 'Dubai International' : 'Jebel Ali'}
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
        {!isAirport ? (
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
        ) : null}
      </div>
    </Modal>
  );
}
