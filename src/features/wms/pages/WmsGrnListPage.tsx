import { useNavigate } from 'react-router-dom';
import { AlertCircle, Plus, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { WMS_ROUTE_PREFIX } from '../api/wms.api';
import { WmsDocumentTable } from '../components/WmsDocumentTable';
import { WmsPageHeader } from '../components/WmsPageHeader';
import { useWmsGrns } from '../hooks/useWms';
import { getErrorMessage } from '../utils/getErrorMessage';

export default function WmsGrnListPage() {
  const navigate = useNavigate();
  const { data = [], isLoading, isFetching, isError, error, refetch } = useWmsGrns();

  return (
    <div className="space-y-4">
      <WmsPageHeader
        backTo={WMS_ROUTE_PREFIX}
        title="WMS GRN"
        description="Goods received notes — post inbound stock to lots."
        actions={
          <>
            <Button type="button" variant="secondary" onClick={() => refetch()} disabled={isFetching}>
              <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button type="button" onClick={() => navigate(`${WMS_ROUTE_PREFIX}/grns/new`)}>
              <Plus className="h-4 w-4" />
              New GRN
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
            onView={(doc) => navigate(`${WMS_ROUTE_PREFIX}/grns/${doc.id}`)}
            emptyLabel="No GRNs yet."
          />
        )}
      </Card>
    </div>
  );
}
