import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { handleValidatedFileInput } from '@/lib/fileUploadValidation';
import { LayoutGrid, List, Plus, Upload } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import {
  CRM_PAGE_SIZE,
  LEAD_SOURCES,
  LEAD_STATUSES,
  crmLabel,
  type LeadSource,
  type LeadStatus,
} from '../constants/crm.constants';
import { useCrmLeadPipeline, useCrmLeads, useImportCrmLeads } from '../hooks/useCrmLeads';
import { CrmSalespersonSelect } from '../components/CrmFormControls';
import { CrmStatusBadge } from '../components/CrmStatusBadge';
import {
  CrmAlert,
  CrmEmpty,
  CrmPageHeader,
  Field,
  Pagination,
  SelectInput,
  TextInput,
  tdClass,
  thClass,
} from '../components/CrmUi';
import { getErrorMessage } from '../utils/getErrorMessage';
import { normalizeLead } from '../utils/normalizeCrm';
import type { Lead } from '../types/crm.types';

function asPipelineColumns(raw: unknown): { status: LeadStatus; leads: Lead[] }[] {
  const columns: { status: LeadStatus; leads: Lead[] }[] = LEAD_STATUSES.map((status) => ({
    status,
    leads: [],
  }));
  const bucket = (status: string, items: unknown[]) => {
    const key = status.toUpperCase() as LeadStatus;
    const col = columns.find((c) => c.status === key);
    if (!col) return;
    for (const item of items) {
      const lead = normalizeLead(item);
      if (lead) col.leads.push(lead);
    }
  };

  if (Array.isArray(raw)) {
    for (const entry of raw) {
      if (!entry || typeof entry !== 'object') continue;
      const record = entry as Record<string, unknown>;
      const status = String(record.status ?? record.stage ?? '');
      const items = Array.isArray(record.leads)
        ? record.leads
        : Array.isArray(record.items)
          ? record.items
          : [];
      if (status) bucket(status, items);
      else {
        const lead = normalizeLead(entry);
        if (lead) {
          const col = columns.find((c) => c.status === lead.status);
          col?.leads.push(lead);
        }
      }
    }
    return columns;
  }

  if (raw && typeof raw === 'object') {
    const record = raw as Record<string, unknown>;
    const nested =
      (record.data && typeof record.data === 'object' ? (record.data as Record<string, unknown>) : record);
    for (const [key, value] of Object.entries(nested)) {
      if (Array.isArray(value)) bucket(key, value);
    }
  }
  return columns;
}

export default function CrmLeadsPage() {
  const navigate = useNavigate();
  const [view, setView] = useState<'list' | 'pipeline'>('list');
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<LeadStatus | ''>('');
  const [source, setSource] = useState<LeadSource | ''>('');
  const [salespersonId, setSalespersonId] = useState('');
  const query = useCrmLeads({
    page,
    limit: CRM_PAGE_SIZE,
    search: search || undefined,
    status: status || undefined,
    source: source || undefined,
    assigned_salesperson_id: salespersonId || undefined,
  });
  const pipeline = useCrmLeadPipeline(salespersonId, view === 'pipeline');
  const importer = useImportCrmLeads();
  const columns = useMemo(() => asPipelineColumns(pipeline.data), [pipeline.data]);

  return (
    <div className="space-y-4">
      <CrmPageHeader
        title="CRM Leads"
        description="Capture prospects, qualify opportunities, and convert won leads to parties."
        actions={
          <>
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm">
              <Upload className="h-4 w-4" />
              Import CSV
              <input
                type="file"
                accept=".csv,text/csv"
                className="hidden"
                onChange={(e) => {
                  handleValidatedFileInput(
                    e.target.files,
                    (file) => {
                      if (file) importer.mutate(file);
                    },
                    undefined,
                    {
                      maxBytes: 5 * 1024 * 1024,
                      allowedExtensions: ['csv'],
                      allowedMimeTypes: ['text/csv', 'application/vnd.ms-excel'],
                    },
                  );
                }}
              />
            </label>
            <Button onClick={() => navigate('/sales/lead/new')}>
              <Plus className="h-4 w-4" />
              New lead
            </Button>
          </>
        }
      />
      {importer.isError && <CrmAlert>{getErrorMessage(importer.error)}</CrmAlert>}
      {importer.isSuccess && <CrmAlert success>Lead CSV import completed.</CrmAlert>}

      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-end gap-3 border-b border-[var(--color-neutral-100)] p-4">
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={view === 'list' ? 'primary' : 'secondary'}
              onClick={() => setView('list')}
            >
              <List className="h-4 w-4" />
              List
            </Button>
            <Button
              size="sm"
              variant={view === 'pipeline' ? 'primary' : 'secondary'}
              onClick={() => setView('pipeline')}
            >
              <LayoutGrid className="h-4 w-4" />
              Pipeline
            </Button>
          </div>
          <div className="grid flex-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Field label="Search">
              <TextInput
                placeholder="Company or contact"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </Field>
            <Field label="Status">
              <SelectInput
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value as LeadStatus | '');
                  setPage(1);
                }}
              >
                <option value="">All statuses</option>
                {LEAD_STATUSES.map((x) => (
                  <option key={x} value={x}>
                    {crmLabel(x)}
                  </option>
                ))}
              </SelectInput>
            </Field>
            <Field label="Source">
              <SelectInput
                value={source}
                onChange={(e) => {
                  setSource(e.target.value as LeadSource | '');
                  setPage(1);
                }}
              >
                <option value="">All sources</option>
                {LEAD_SOURCES.map((x) => (
                  <option key={x} value={x}>
                    {crmLabel(x)}
                  </option>
                ))}
              </SelectInput>
            </Field>
            <CrmSalespersonSelect
              label="Salesperson"
              placeholder={view === 'pipeline' ? 'Select for pipeline' : 'All salespeople'}
              value={salespersonId}
              onChange={(id) => {
                setSalespersonId(id);
                setPage(1);
              }}
            />
          </div>
        </div>

        {view === 'pipeline' ? (
          !salespersonId ? (
            <CrmEmpty>Select a salesperson to load the lead pipeline.</CrmEmpty>
          ) : pipeline.isLoading || pipeline.isError ? (
            <CrmEmpty
              loading={pipeline.isLoading}
              error={pipeline.isError ? getErrorMessage(pipeline.error) : undefined}
              onRetry={() => pipeline.refetch()}
            />
          ) : (
            <div className="overflow-x-auto p-4">
              <div className="flex min-w-max gap-3">
                {columns.map((col) => (
                  <div
                    key={col.status}
                    className="w-64 shrink-0 rounded-lg border border-[var(--color-neutral-200)] bg-[var(--color-neutral-50)]"
                  >
                    <div className="flex items-center justify-between border-b border-[var(--color-neutral-200)] px-3 py-2">
                      <span className="text-sm font-semibold text-[var(--color-neutral-700)]">
                        {crmLabel(col.status)}
                      </span>
                      <span className="text-xs text-[var(--color-neutral-400)]">{col.leads.length}</span>
                    </div>
                    <div className="space-y-2 p-2">
                      {col.leads.length === 0 ? (
                        <p className="px-1 py-4 text-center text-xs text-[var(--color-neutral-400)]">Empty</p>
                      ) : (
                        col.leads.map((lead) => (
                          <Link
                            key={lead.id}
                            to={`/sales/lead/${lead.id}`}
                            className="block rounded-md border border-[var(--color-neutral-200)] bg-white p-3 hover:border-[var(--color-primary-300)]"
                          >
                            <p className="text-sm font-medium text-[var(--color-neutral-800)]">
                              {lead.company_name}
                            </p>
                            <p className="mt-0.5 text-xs text-[var(--color-neutral-500)]">
                              {lead.contact_name}
                            </p>
                            {lead.priority && (
                              <p className="mt-1 text-[10px] uppercase tracking-wide text-[var(--color-neutral-400)]">
                                {crmLabel(lead.priority)}
                              </p>
                            )}
                          </Link>
                        ))
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        ) : query.isLoading || query.isError || !query.data?.items.length ? (
          <CrmEmpty
            loading={query.isLoading}
            error={query.isError ? getErrorMessage(query.error) : undefined}
            onRetry={() => query.refetch()}
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[var(--color-neutral-50)]">
                  <tr>
                    <th className={thClass}>Company</th>
                    <th className={thClass}>Contact</th>
                    <th className={thClass}>Source</th>
                    <th className={thClass}>Priority</th>
                    <th className={thClass}>Status</th>
                    <th className={thClass}></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-neutral-100)]">
                  {query.data.items.map((lead) => (
                    <tr key={lead.id}>
                      <td className={tdClass}>
                        <Link
                          className="font-medium text-[var(--color-primary-600)]"
                          to={`/sales/lead/${lead.id}`}
                        >
                          {lead.company_name}
                        </Link>
                      </td>
                      <td className={tdClass}>
                        {lead.contact_name}
                        <div className="text-xs text-[var(--color-neutral-400)]">
                          {lead.email || lead.phone}
                        </div>
                      </td>
                      <td className={tdClass}>{lead.source ? crmLabel(lead.source) : '—'}</td>
                      <td className={tdClass}>{lead.priority ? crmLabel(lead.priority) : '—'}</td>
                      <td className={tdClass}>
                        <CrmStatusBadge status={lead.status} />
                      </td>
                      <td className={tdClass}>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => navigate(`/sales/lead/${lead.id}`)}
                        >
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination {...query.data.meta} onPage={setPage} />
          </>
        )}
      </Card>
    </div>
  );
}
