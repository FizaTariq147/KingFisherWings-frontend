import { useMemo, useState } from 'react';
import { PageBackLink } from '@/components/ui/PageBackLink';
import { Button } from '@/components/ui/Button';
import { TextInput } from '@/components/widgets/FilterField';
import {
  DocumentationListState,
  DocumentationRecordTable,
} from '@/features/documentation/components/DocumentationUi';
import { useBayanEdiShipments } from '@/features/documentation/hooks/useDocumentation';
import type { DocumentationListParams } from '@/features/documentation/types/documentation.types';

export default function BayanEdiShipmentHouseListPage() {
  const [search, setSearch] = useState('');
  const [applied, setApplied] = useState<DocumentationListParams>({ page: 1, limit: 50 });
  const query = useBayanEdiShipments(applied, true);
  const rows = useMemo(() => query.data?.items ?? [], [query.data?.items]);

  return (
    <div className="space-y-3">
      <PageBackLink to="/documentation" label="Back to Documentation" />
      <div className="rounded-md border border-gray-200 bg-white">
        <div className="border-b border-gray-200 px-5 py-3">
          <h2 className="text-[17px] font-medium text-gray-800">Bayan EDI Shipment (House) List</h2>
        </div>
        <div className="flex flex-wrap gap-2 border-b border-gray-200 px-5 py-4">
          <TextInput value={search} onChange={(e) => setSearch(e.target.value)} className="w-56" />
          <Button type="button" onClick={() => setApplied({ page: 1, limit: 50, search: search.trim() || undefined })}>
            Load
          </Button>
        </div>
        <DocumentationListState loading={query.isLoading} error={query.error} empty={rows.length === 0} />
        {rows.length > 0 ? (
          <div className="p-4">
            <DocumentationRecordTable
              rows={rows}
              preferredColumns={['house_number', 'job_number', 'mbl_number', 'status', 'consignee']}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}
