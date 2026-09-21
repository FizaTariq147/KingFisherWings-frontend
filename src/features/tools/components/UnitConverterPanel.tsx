import { useState } from 'react';
import type { AxiosInstance } from 'axios';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { getErrorMessage } from '@/features/jobs/utils/getErrorMessage';

type Kind = 'length' | 'weight' | 'liquid' | 'cbm' | 'volume';

const FIELDS: Record<Exclude<Kind, 'cbm' | 'volume'>, string[]> = {
  length: ['mm', 'cm', 'meter', 'inch', 'feet', 'yard', 'mile', 'nautical_mile'],
  weight: ['gram', 'kilogram', 'ton', 'ounce', 'pound'],
  liquid: ['litre', 'fluid_ounce', 'quart', 'gallon', 'imperial_gallon'],
};

export function UnitConverterPanel({
  client,
  basePath,
}: {
  client: AxiosInstance;
  basePath: string;
}) {
  const [kind, setKind] = useState<Kind>('length');
  const [values, setValues] = useState<Record<string, string>>({});
  const [result, setResult] = useState<unknown>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const submit = async () => {
    setPending(true);
    setError(null);
    try {
      let body: Record<string, unknown> = {};
      if (kind === 'cbm') {
        body = {
          length: Number(values.length),
          width: Number(values.width),
          height: Number(values.height),
          quantity: Number(values.quantity || 1),
          unit: values.unit || 'cm',
        };
      } else if (kind === 'volume') {
        body = {
          input_unit: values.input_unit || 'CM',
          output_unit: values.output_unit || 'FT',
          value: Number(values.value),
        };
      } else {
        for (const field of FIELDS[kind]) {
          if (values[field]) body[field] = Number(values[field]);
        }
      }
      const res = await client.post(`${basePath}/converter/${kind}`, body);
      const data = res.data && typeof res.data === 'object' && 'data' in res.data ? res.data.data : res.data;
      setResult(data);
    } catch (err) {
      setResult(null);
      setError(getErrorMessage(err));
    } finally {
      setPending(false);
    }
  };

  const fields =
    kind === 'cbm'
      ? ['length', 'width', 'height', 'quantity', 'unit']
      : kind === 'volume'
        ? ['input_unit', 'value', 'output_unit']
        : FIELDS[kind];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Unit converter</CardTitle>
      </CardHeader>
      <div className="space-y-3 px-4 pb-4">
        <div className="flex flex-wrap gap-2">
          {(['length', 'weight', 'liquid', 'cbm', 'volume'] as Kind[]).map((item) => (
            <Button
              key={item}
              type="button"
              variant={kind === item ? 'primary' : 'secondary'}
              onClick={() => {
                setKind(item);
                setValues({});
                setResult(null);
              }}
            >
              {item}
            </Button>
          ))}
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {fields.map((field) => (
            <Input
              key={field}
              label={field.replaceAll('_', ' ')}
              value={values[field] ?? ''}
              onChange={(e) => setValues((prev) => ({ ...prev, [field]: e.target.value }))}
            />
          ))}
        </div>
        <Button type="button" disabled={pending} onClick={() => void submit()}>
          Convert
        </Button>
        {error ? <p className="text-sm text-[var(--color-danger-600)]">{error}</p> : null}
        {result ? (
          <pre className="overflow-auto rounded bg-[var(--color-neutral-50)] p-3 text-xs">
            {JSON.stringify(result, null, 2)}
          </pre>
        ) : null}
      </div>
    </Card>
  );
}
