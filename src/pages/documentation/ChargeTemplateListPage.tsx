import { useMemo, useState } from 'react';
import { PageBackLink } from '@/components/ui/PageBackLink';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  DocumentationListState,
  DocumentationRecordTable,
} from '@/features/documentation/components/DocumentationUi';
import {
  useChargeTemplateActions,
  useChargeTemplates,
} from '@/features/documentation/hooks/useDocumentation';
import { extractAxiosErrorDetail } from '@/lib/extractAxiosErrorDetail';

export default function ChargeTemplateListPage() {
  const [applied] = useState({ page: 1, limit: 50 });
  const query = useChargeTemplates(applied, true);
  const actions = useChargeTemplateActions();
  const [name, setName] = useState('');
  const [jobId, setJobId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const rows = useMemo(() => query.data?.items ?? [], [query.data?.items]);

  return (
    <div className="space-y-3">
      <PageBackLink to="/documentation" label="Back to Documentation" />
      <div className="rounded-md border border-gray-200 bg-white">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-200 px-5 py-3">
          <h2 className="text-[17px] font-medium text-gray-800">Charge Template List</h2>
          <Button
            type="button"
            disabled={!name.trim() || actions.create.isPending}
            onClick={async () => {
              setError(null);
              try {
                await actions.create.mutateAsync({
                  name: name.trim(),
                  lines: [{ description: 'Default charge', currency_code: 'AED', default_amount: 0 }],
                });
                setName('');
                await query.refetch();
              } catch (err) {
                setError(extractAxiosErrorDetail(err));
              }
            }}
          >
            Create template
          </Button>
        </div>

        <div className="flex flex-wrap gap-2 border-b border-gray-200 px-5 py-4">
          <Input placeholder="New template name" value={name} onChange={(e) => setName(e.target.value)} />
          <Input placeholder="Job ID to apply template" value={jobId} onChange={(e) => setJobId(e.target.value)} className="w-72" />
          <Button type="button" variant="secondary" onClick={() => void query.refetch()}>Refresh</Button>
        </div>

        {error ? <p className="px-5 py-2 text-sm text-red-600">{error}</p> : null}

        <DocumentationListState loading={query.isLoading} error={query.error} empty={rows.length === 0} />
        {rows.length > 0 ? (
          <div className="p-4">
            <DocumentationRecordTable
              rows={rows}
              preferredColumns={['name', 'description', 'is_active', 'job_types']}
              actionColumn={(row) => (
                <div className="flex gap-1">
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    disabled={!jobId.trim()}
                    onClick={() => void actions.apply.mutateAsync({ id: row.id, dto: { job_id: jobId.trim() } })}
                  >
                    Apply
                  </Button>
                  <Button type="button" size="sm" variant="secondary" onClick={() => void actions.remove.mutateAsync(row.id)}>
                    Delete
                  </Button>
                </div>
              )}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}
