import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { isUuid } from '@/lib/isUuid';
import { INVOICE_ROUTE_PREFIX } from '../api/invoice.api';
import { InvoiceForm } from '../components/InvoiceForm';
import { useCreateInvoiceFromJob } from '../hooks/useInvoiceActions';
import { useCreateInvoice } from '../hooks/useInvoices';
import type { CreateInvoiceFormValues } from '../types/invoice.types';
import { getErrorMessage } from '../utils/getErrorMessage';

export default function InvoiceCreatePage() {
  const navigate = useNavigate();
  const create = useCreateInvoice();
  const createFromJob = useCreateInvoiceFromJob();
  const [error, setError] = useState<string | null>(null);
  const [jobId, setJobId] = useState('');

  return (
    <div className="space-y-4">
      <button
        type="button"
        className="text-xs font-medium text-[var(--color-neutral-400)] hover:text-[var(--color-neutral-600)]"
        onClick={() => navigate(INVOICE_ROUTE_PREFIX)}
      >
        ← Back to invoices
      </button>
      <div>
        <h2 className="text-lg font-semibold text-[var(--color-neutral-800)]">New invoice</h2>
        <p className="text-sm text-[var(--color-neutral-400)] mt-0.5">
          Creates a DRAFT invoice. Required: party and currency.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create from job</CardTitle>
        </CardHeader>
        <div className="flex flex-col sm:flex-row gap-2 p-4 pt-0 items-end">
          <div className="flex-1 w-full">
            <Input
              label="Job UUID"
              value={jobId}
              onChange={(e) => setJobId(e.target.value)}
              placeholder="Uninvoiced job id"
            />
          </div>
          <Button
            type="button"
            variant="secondary"
            disabled={!isUuid(jobId.trim()) || createFromJob.isPending}
            onClick={async () => {
              setError(null);
              try {
                const inv = await createFromJob.mutateAsync(jobId.trim());
                navigate(`${INVOICE_ROUTE_PREFIX}/${inv.id}`);
              } catch (err) {
                setError(getErrorMessage(err));
              }
            }}
          >
            {createFromJob.isPending ? 'Creating…' : 'Create from job'}
          </Button>
        </div>
      </Card>

      {error && (
        <div
          role="alert"
          className="rounded-lg border px-4 py-3 text-sm"
          style={{
            background: 'var(--color-danger-100)',
            borderColor: '#FECACA',
            color: 'var(--color-danger-700)',
          }}
        >
          {error}
        </div>
      )}

      <InvoiceForm
        mode="create"
        isSubmitting={create.isPending}
        onCancel={() => navigate(INVOICE_ROUTE_PREFIX)}
        onSubmit={async (values) => {
          setError(null);
          try {
            const created = await create.mutateAsync(values as CreateInvoiceFormValues);
            navigate(`${INVOICE_ROUTE_PREFIX}/${created.id}`);
          } catch (err) {
            setError(getErrorMessage(err));
            throw err;
          }
        }}
      />
    </div>
  );
}
