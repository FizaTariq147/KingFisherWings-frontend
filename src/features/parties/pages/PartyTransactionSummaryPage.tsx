import { useNavigate, useParams } from 'react-router-dom';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { isUuid } from '@/lib/isUuid';
import { PartyTransactionSummarySection } from '../components/PartyTransactionSummarySection';
import { useParty } from '../hooks/useParties';

export default function PartyTransactionSummaryPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { data: party, isLoading, isError, error, refetch } = useParty(id);

  if (!isUuid(id)) {
    return <Card className="p-6 text-sm text-[var(--color-danger-700)]">Invalid party id.</Card>;
  }

  if (isLoading) {
    return <Card className="p-8 text-sm text-[var(--color-neutral-400)]">Loading…</Card>;
  }

  if (isError || !party) {
    return (
      <div className="space-y-3">
        <div className="flex items-start gap-2 text-sm text-[var(--color-danger-700)]">
          <AlertCircle className="h-4 w-4 mt-0.5" />
          <span>{error instanceof Error ? error.message : 'Failed to load party.'}</span>
        </div>
        <Button variant="secondary" size="sm" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4" /> Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <button
          type="button"
          className="text-xs font-medium text-[var(--color-neutral-400)] hover:text-[var(--color-neutral-600)] mb-1"
          onClick={() => navigate(`/parties/${id}`)}
        >
          ← Back to party
        </button>
        <h2 className="text-lg font-semibold text-[var(--color-neutral-800)]">
          Transaction summary
        </h2>
        <p className="text-sm text-[var(--color-neutral-400)] mt-0.5">
          {party.name} · {party.code}
        </p>
      </div>
      <PartyTransactionSummarySection party={party} compact />
    </div>
  );
}
