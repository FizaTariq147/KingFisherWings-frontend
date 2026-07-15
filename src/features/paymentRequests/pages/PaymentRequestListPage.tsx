import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Plus, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { isUuid } from '@/lib/isUuid';
import { PAYMENT_REQUEST_ROUTE_PREFIX } from '../api/paymentRequest.api';
import { PaymentRequestFilters } from '../components/PaymentRequestFilters';
import { PaymentRequestTable } from '../components/PaymentRequestTable';
import {
  DEFAULT_PAYMENT_REQUEST_PAGE_SIZE,
  type PaymentRequestStatus,
} from '../constants/paymentRequest.constants';
import { usePaymentRequests } from '../hooks/usePaymentRequests';
import { getErrorMessage } from '../utils/getErrorMessage';

export default function PaymentRequestListPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<PaymentRequestStatus | 'all'>('all');
  const [partyId, setPartyId] = useState('');
  const [jobId, setJobId] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [status, partyId, jobId]);

  const listParams = {
    page,
    limit: DEFAULT_PAYMENT_REQUEST_PAGE_SIZE,
    status: status === 'all' ? undefined : status,
    party_id: isUuid(partyId.trim()) ? partyId.trim() : undefined,
    job_id: isUuid(jobId.trim()) ? jobId.trim() : undefined,
  };

  const { data, isLoading, isFetching, isError, error, refetch } =
    usePaymentRequests(listParams);
  const paymentRequests = data?.paymentRequests ?? [];
  const meta = data?.meta;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <button
            type="button"
            className="text-xs font-medium text-[var(--color-neutral-400)] hover:text-[var(--color-neutral-600)] mb-1"
            onClick={() => navigate('/finance')}
          >
            ← Finance
          </button>
          <h2 className="text-lg font-semibold text-[var(--color-neutral-800)]">
            Payment Requests
          </h2>
          <p className="text-sm text-[var(--color-neutral-400)] mt-0.5">
            List and manage payment requests (approve, reject, mark paid).
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="secondary" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button type="button" onClick={() => navigate(`${PAYMENT_REQUEST_ROUTE_PREFIX}/new`)}>
            <Plus className="h-4 w-4" />
            New
          </Button>
        </div>
      </div>

      <Card className="p-4 space-y-4">
        <PaymentRequestFilters
          status={status}
          onStatusChange={setStatus}
          partyId={partyId}
          onPartyIdChange={setPartyId}
          jobId={jobId}
          onJobIdChange={setJobId}
        />

        {isError ? (
          <div className="space-y-3 py-8">
            <p className="flex items-start gap-2 text-sm text-[var(--color-danger-600)]">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              {getErrorMessage(error) || 'Failed to load payment requests.'}
            </p>
            <Button type="button" variant="secondary" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        ) : isLoading ? (
          <p className="text-sm text-[var(--color-neutral-400)] py-10 text-center">Loading…</p>
        ) : (
          <PaymentRequestTable
            paymentRequests={paymentRequests}
            isFetching={isFetching}
            meta={meta}
            onPage={setPage}
            onView={(pr) => navigate(`${PAYMENT_REQUEST_ROUTE_PREFIX}/${pr.id}`)}
          />
        )}
      </Card>
    </div>
  );
}
