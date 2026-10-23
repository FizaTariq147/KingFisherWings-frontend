import { useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pencil, RefreshCw, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { PortalApiError } from '@/lib/portalApiClient';
import {
  useDeletePortalQuotation,
  useReplacePortalQuotation,
} from '../hooks/usePortalQuotations';
import type { PortalQuotationDetail } from '../types/portalQuotations.types';
import {
  canPortalCustomerDeleteQuote,
  canPortalCustomerEditQuote,
  canPortalCustomerReplaceQuote,
  formatPortalQuotationActionError,
} from '../utils/portalQuotationStatus';

export interface PortalQuotationLifecycleToolbarProps {
  quote: PortalQuotationDetail;
  onSuccess?: (message: string) => void;
  /** Extra actions (e.g. Download PDF) rendered after lifecycle buttons. */
  trailing?: ReactNode;
}

/**
 * Top-right Edit / Replace / Delete — visibility from GET :id action flags.
 * Edit opens the same Book wizard (`/portal/book?edit=:id`) and saves via PATCH.
 */
export function PortalQuotationLifecycleToolbar({
  quote,
  onSuccess,
  trailing,
}: PortalQuotationLifecycleToolbarProps) {
  const navigate = useNavigate();
  const replaceQuote = useReplacePortalQuotation();
  const deleteQuote = useDeletePortalQuotation();
  const [error, setError] = useState<string | null>(null);

  const canEdit = canPortalCustomerEditQuote(quote);
  const canReplace = canPortalCustomerReplaceQuote(quote);
  const canDelete = canPortalCustomerDeleteQuote(quote);
  if (!canEdit && !canReplace && !canDelete && !trailing) return null;

  const pending = replaceQuote.isPending || deleteQuote.isPending;

  const fail = (err: unknown) => {
    const raw =
      err instanceof PortalApiError || err instanceof Error
        ? err.message
        : 'Action failed.';
    setError(formatPortalQuotationActionError(raw));
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex flex-wrap items-center justify-end gap-2">
        {canEdit ? (
          <Button
            type="button"
            size="sm"
            variant="edit"
            disabled={pending}
            onClick={() =>
              navigate(`/portal/book?edit=${encodeURIComponent(quote.id)}`)
            }
          >
            <Pencil size={14} aria-hidden="true" />
            Edit
          </Button>
        ) : null}
        {canReplace ? (
          <Button
            type="button"
            size="sm"
            variant="secondary"
            disabled={pending}
            onClick={() => {
              setError(null);
              void replaceQuote
                .mutateAsync({ id: quote.id })
                .then((next) => {
                  onSuccess?.('Replacement draft created.');
                  if (next.id && next.id !== quote.id) {
                    navigate(`/portal/quotes/${next.id}`);
                  }
                })
                .catch(fail);
            }}
          >
            <RefreshCw size={14} aria-hidden="true" />
            {replaceQuote.isPending ? 'Replacing…' : 'Replace'}
          </Button>
        ) : null}
        {canDelete ? (
          <Button
            type="button"
            size="sm"
            variant="danger"
            disabled={pending}
            onClick={() => {
              if (
                !window.confirm(
                  'Delete this draft quotation? This cannot be undone.',
                )
              ) {
                return;
              }
              setError(null);
              void deleteQuote
                .mutateAsync(quote.id)
                .then(() => {
                  onSuccess?.('Draft quotation deleted.');
                  navigate('/portal/quotes');
                })
                .catch(fail);
            }}
          >
            <Trash2 size={14} aria-hidden="true" />
            {deleteQuote.isPending ? 'Deleting…' : 'Delete'}
          </Button>
        ) : null}
        {trailing}
      </div>
      {error ? (
        <p className="max-w-md text-right text-xs text-[var(--color-danger-600)]" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
