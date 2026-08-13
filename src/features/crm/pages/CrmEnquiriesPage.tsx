import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { CRM_PAGE_SIZE, ENQUIRY_STATUSES, crmLabel, type EnquiryStatus } from '../constants/crm.constants';
import { useCrmEnquiries } from '../hooks/useCrmEnquiries';
import { CrmSalespersonSelect } from '../components/CrmFormControls';
import { CrmStatusBadge } from '../components/CrmStatusBadge';
import {
  CrmEmpty,
  CrmPageHeader,
  Pagination,
  SelectInput,
  tdClass,
  thClass,
} from '../components/CrmUi';
import { getErrorMessage } from '../utils/getErrorMessage';

export default function CrmEnquiriesPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<EnquiryStatus | ''>('');
  const [salesperson, setSalesperson] = useState('');
  const query = useCrmEnquiries({
    page,
    limit: CRM_PAGE_SIZE,
    status: status || undefined,
    salesperson_id: salesperson || undefined,
  });

  return (
    <div className="space-y-4">
      <CrmPageHeader
        title="Enquiries"
        description="Capture freight requirements and convert qualified enquiries into quotations."
        actions={
          <Button onClick={() => navigate('/sales/enquiries/new')}>
            <Plus className="h-4 w-4" />
            New enquiry
          </Button>
        }
      />
      <Card className="overflow-hidden">
        <div className="grid gap-3 p-4 sm:grid-cols-2">
          <SelectInput value={status} onChange={(e) => setStatus(e.target.value as EnquiryStatus | '')}>
            <option value="">All statuses</option>
            {ENQUIRY_STATUSES.map((x) => (
              <option key={x} value={x}>
                {crmLabel(x)}
              </option>
            ))}
          </SelectInput>
          <CrmSalespersonSelect
            label="Salesperson"
            placeholder="All salespeople"
            value={salesperson}
            onChange={setSalesperson}
          />
        </div>
        {query.isLoading || query.isError || !query.data?.items.length ? (
          <CrmEmpty
            loading={query.isLoading}
            error={query.isError ? getErrorMessage(query.error) : undefined}
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className={thClass}>Enquiry</th>
                    <th className={thClass}>Service</th>
                    <th className={thClass}>Currency</th>
                    <th className={thClass}>Party / Lead</th>
                    <th className={thClass}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {query.data.items.map((x) => (
                    <tr key={x.id} className="border-t">
                      <td className={tdClass}>
                        <Link className="font-medium text-[var(--color-primary-600)]" to={`/sales/enquiries/${x.id}`}>
                          {x.id.slice(0, 8)}
                        </Link>
                      </td>
                      <td className={tdClass}>{crmLabel(x.service_type)}</td>
                      <td className={tdClass}>{x.currency_code}</td>
                      <td className={tdClass}>{x.party_id || x.lead_id || '—'}</td>
                      <td className={tdClass}>
                        <CrmStatusBadge status={x.status} />
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
