import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { CRM_REPORT_TYPES, crmLabel, type CrmReportType } from '../constants/crm.constants';
import { useCrmDashboard, useCrmReport } from '../hooks/useCrmDashboard';
import { CrmSalespersonSelect } from '../components/CrmFormControls';
import { CrmAlert, CrmEmpty, CrmPageHeader, Field, TextInput } from '../components/CrmUi';
import { getErrorMessage } from '../utils/getErrorMessage';

export default function CrmDashboardPage() {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [salesperson, setSalesperson] = useState('');
  const query = useCrmDashboard({
    from: from || undefined,
    to: to || undefined,
    salesperson_id: salesperson || undefined,
  });
  const report = useCrmReport();
  const [selected, setSelected] = useState<CrmReportType | null>(null);

  const run = async (type: CrmReportType) => {
    setSelected(type);
    await report.mutateAsync({
      type,
      from: from || undefined,
      to: to || undefined,
      salesperson_id: salesperson || undefined,
    });
  };

  return (
    <div className="space-y-4">
      <CrmPageHeader
        title="Sales Dashboard"
        description="Monitor CRM activity, conversion, pipeline, and sales performance."
      />
      <Card className="p-4">
        <div className="grid gap-3 md:grid-cols-3">
          <Field label="From">
            <TextInput type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          </Field>
          <Field label="To">
            <TextInput type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </Field>
          <CrmSalespersonSelect
            label="Salesperson"
            placeholder="All salespeople"
            value={salesperson}
            onChange={setSalesperson}
          />
        </div>
      </Card>
      {query.isLoading || query.isError ? (
        <Card>
          <CrmEmpty
            loading={query.isLoading}
            error={query.isError ? getErrorMessage(query.error) : undefined}
          />
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {query.data?.metrics.map((metric) => (
            <Card className="p-4" key={metric.label}>
              <p className="text-xs uppercase tracking-wide text-[var(--color-neutral-500)]">
                {crmLabel(metric.label)}
              </p>
              <p className="mt-2 text-2xl font-semibold text-[var(--color-neutral-800)]">{metric.value}</p>
            </Card>
          ))}
        </div>
      )}
      <Card className="p-4">
        <h2 className="font-semibold">Reports</h2>
        <p className="mb-3 text-sm text-[var(--color-neutral-500)]">Select a report using the filters above.</p>
        <div className="flex flex-wrap gap-2">
          {CRM_REPORT_TYPES.map((type) => (
            <Button
              key={type}
              size="sm"
              variant={selected === type ? 'primary' : 'secondary'}
              disabled={report.isPending}
              onClick={() => run(type)}
            >
              {crmLabel(type)}
            </Button>
          ))}
        </div>
        {report.isError && (
          <div className="mt-4">
            <CrmAlert>{getErrorMessage(report.error)}</CrmAlert>
          </div>
        )}
        {report.isSuccess && (
          <div className="mt-4 overflow-auto rounded-lg bg-[var(--color-neutral-50)] p-4">
            <h3 className="mb-2 text-sm font-semibold">{selected && crmLabel(selected)}</h3>
            <pre className="whitespace-pre-wrap text-xs">{JSON.stringify(report.data, null, 2)}</pre>
          </div>
        )}
      </Card>
    </div>
  );
}
