import { useNavigate } from 'react-router-dom';
import { AlertCircle, Plus, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { WMS_ROUTE_PREFIX } from '../api/wms.api';
import { WmsDocumentTable } from '../components/WmsDocumentTable';
import { WmsPageHeader } from '../components/WmsPageHeader';
import { useWmsGdos } from '../hooks/useWms';
import { getErrorMessage } from '../utils/getErrorMessage';

export default function WmsGdoListPage() {
  const navigate = useNavigate();
  const { data = [], isLoading, isFetching, isError, error, refetch } = useWmsGdos();

  return (
    <div className="space-y-4">
      <WmsPageHeader
        backTo={WMS_ROUTE_PREFIX}
        title="WMS GDO"
        description="Goods dispatch orders — consume stock FIFO/LIFO."
        actions={
          <>
            <Button type="button" variant="secondary" onClick={() => refetch()} disabled={isFetching}>
              <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button type="button" onClick={() => navigate(`${WMS_ROUTE_PREFIX}/gdos/new`)}>
              <Plus className="h-4 w-4" />
              New GDO
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
            onView={(doc) => navigate(`${WMS_ROUTE_PREFIX}/gdos/${doc.id}`)}
            emptyLabel="No GDOs yet."
          />
        )}
      </Card>
    </div>
  );
}
