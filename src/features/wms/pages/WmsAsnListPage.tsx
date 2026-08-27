import { useNavigate } from 'react-router-dom';
import { AlertCircle, Plus, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { WMS_ROUTE_PREFIX } from '../api/wms.api';
import { WmsDocumentTable } from '../components/WmsDocumentTable';
import { WmsPageHeader } from '../components/WmsPageHeader';
import { useWmsAsns } from '../hooks/useWms';
import { getErrorMessage } from '../utils/getErrorMessage';

export default function WmsAsnListPage() {
  const navigate = useNavigate();
  const { data = [], isLoading, isFetching, isError, error, refetch } = useWmsAsns();

  return (
    <div className="space-y-4">
      <WmsPageHeader
        backTo={WMS_ROUTE_PREFIX}
        title="WMS ASN"
        description="Advance shipment notices — expected inbound stock."
        actions={
          <>
            <Button type="button" variant="secondary" onClick={() => refetch()} disabled={isFetching}>
              <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button type="button" onClick={() => navigate(`${WMS_ROUTE_PREFIX}/asns/new`)}>
              <Plus className="h-4 w-4" />
              New ASN
            </Button>
          </>
        }
      />
      <Card className="p-4">
        {isError ? (
          <p className="flex items-start gap-2 text-sm text-[var(--color-danger-600)]">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            {getErrorMessage(error)}
          </p>
        ) : (
          <WmsDocumentTable
            documents={data}
            isLoading={isLoading}
            onView={(doc) => navigate(`${WMS_ROUTE_PREFIX}/asns/${doc.id}`)}
            emptyLabel="No ASNs yet."
          />
        )}
      </Card>
    </div>
  );
}
