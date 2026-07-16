import { useNavigate } from 'react-router-dom';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { CHART_OF_ACCOUNT_ROUTE_PREFIX } from '../api/chartOfAccount.api';
import { useChartOfAccountTree } from '../hooks/useChartOfAccounts';
import type { ChartOfAccountTreeNode } from '../types/chartOfAccount.types';
import { chartOfAccountDisplayLabel } from '../utils/normalizeChartOfAccount';
import { getErrorMessage } from '../utils/getErrorMessage';

function TreeNodes({
  nodes,
  depth,
  onOpen,
}: {
  nodes: ChartOfAccountTreeNode[];
  depth: number;
  onOpen: (id: string) => void;
}) {
  return (
    <ul className={depth === 0 ? 'space-y-1' : 'mt-1 space-y-1 border-l border-[var(--color-neutral-200)] ml-3 pl-3'}>
      {nodes.map((node) => (
        <li key={node.id}>
          <button
            type="button"
            className="text-left text-sm hover:underline"
            style={{ paddingLeft: depth === 0 ? 0 : undefined }}
            onClick={() => onOpen(node.id)}
          >
            <span className="font-mono text-[var(--color-neutral-700)]">{node.account_code}</span>
            <span className="text-[var(--color-neutral-500)]"> — {node.account_name}</span>
            {node.is_header ? (
              <span className="ml-2 text-xs text-[var(--color-neutral-400)]">(header)</span>
            ) : null}
          </button>
          {node.children?.length ? (
            <TreeNodes nodes={node.children} depth={depth + 1} onOpen={onOpen} />
          ) : null}
        </li>
      ))}
    </ul>
  );
}

export default function ChartOfAccountTreePage() {
  const navigate = useNavigate();
  const { data, isLoading, isFetching, isError, error, refetch } = useChartOfAccountTree();
  const nodes = data ?? [];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <button
            type="button"
            className="text-xs font-medium text-[var(--color-neutral-400)] hover:text-[var(--color-neutral-600)] mb-1"
            onClick={() => navigate(CHART_OF_ACCOUNT_ROUTE_PREFIX)}
          >
            ← Chart of Accounts
          </button>
          <h2 className="text-lg font-semibold text-[var(--color-neutral-800)]">Account tree</h2>
          <p className="text-sm text-[var(--color-neutral-400)] mt-0.5">
            Hierarchical chart of accounts (GET /gl/accounts/tree).
          </p>
        </div>
        <Button type="button" variant="secondary" onClick={() => refetch()} disabled={isFetching}>
          <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <Card className="p-4">
        {isError ? (
          <div className="space-y-3 py-8">
            <p className="flex items-start gap-2 text-sm text-[var(--color-danger-600)]">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              {getErrorMessage(error) || 'Failed to load account tree.'}
            </p>
            <Button type="button" variant="secondary" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        ) : isLoading ? (
          <p className="text-sm text-[var(--color-neutral-400)] py-10 text-center">Loading…</p>
        ) : nodes.length === 0 ? (
          <p className="text-sm text-[var(--color-neutral-400)] py-10 text-center">
            No accounts in tree. Seed defaults or create accounts first.
          </p>
        ) : (
          <TreeNodes
            nodes={nodes}
            depth={0}
            onOpen={(id) => navigate(`${CHART_OF_ACCOUNT_ROUTE_PREFIX}/${id}`)}
          />
        )}
      </Card>

      {nodes.length > 0 && (
        <p className="text-xs text-[var(--color-neutral-400)]">
          Tip: open {chartOfAccountDisplayLabel(nodes[0])} for ledger and edit actions.
        </p>
      )}
    </div>
  );
}
