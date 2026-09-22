import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { customsClearanceService } from '../services/customsClearance.service';
import type { HsValidateResult } from '../types/customsClearance.types';

export default function HsValidatePage() {
  const [hsCode, setHsCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<HsValidateResult | null>(null);

  const run = async () => {
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      const res = await customsClearanceService.validateHsCode({
        hs_code: hsCode.trim(),
      });
      setResult(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-semibold">HS code validate</h1>
          <p className="text-sm text-[var(--color-neutral-500)]">
            POST /masters/hs-codes/validate
          </p>
        </div>
        <Link to="/customs-clearance" className="text-sm underline">
          Back to CC hub
        </Link>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Validate</CardTitle>
        </CardHeader>
        <div className="space-y-3 px-4 pb-4">
          <Input
            placeholder="HS code"
            value={hsCode}
            onChange={(e) => setHsCode(e.target.value)}
          />
          <Button type="button" disabled={busy || !hsCode.trim()} onClick={() => void run()}>
            {busy ? 'Validating…' : 'Validate'}
          </Button>
          {error ? <p className="text-sm text-[var(--color-danger-600)]">{error}</p> : null}
          {result ? (
            <div className="rounded-md border border-[var(--color-neutral-200)] bg-[var(--color-neutral-50)] p-3 text-sm">
              <p>
                <strong>{result.hs_code || hsCode}</strong>
                {result.valid === false ? (
                  <span className="ml-2 text-[var(--color-danger-600)]">Invalid</span>
                ) : (
                  <span className="ml-2 text-[var(--color-success-700)]">Valid</span>
                )}
              </p>
              {result.description ? <p className="mt-1">{result.description}</p> : null}
              <p className="mt-1 text-xs text-[var(--color-neutral-500)]">
                {[
                  result.is_prohibited ? 'Prohibited' : null,
                  result.is_restricted ? 'Restricted' : null,
                  result.dg_class ? `DG ${result.dg_class}` : null,
                  result.message,
                ]
                  .filter(Boolean)
                  .join(' · ') || 'No flags'}
              </p>
            </div>
          ) : null}
        </div>
      </Card>
    </div>
  );
}
