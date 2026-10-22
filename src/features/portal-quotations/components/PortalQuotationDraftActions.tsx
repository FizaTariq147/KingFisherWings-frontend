import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { PortalApiError } from '@/lib/portalApiClient';
import {
  useDeletePortalQuotation,
  useReplacePortalQuotation,
  useUpdatePortalQuotation,
} from '../hooks/usePortalQuotations';
import type { PortalQuotationDetail } from '../types/portalQuotations.types';
import {
  canPortalCustomerDeleteQuote,
  canPortalCustomerEditQuote,
  canPortalCustomerReplaceQuote,
  formatPortalQuotationActionError,
} from '../utils/portalQuotationStatus';

/**
 * DRAFT + CUSTOMER_PORTAL owned quote actions:
 * Edit (PATCH), Replace (POST …/replace), Delete (DELETE).
 */
export function PortalQuotationDraftActions({
  quote,
  onSuccess,
}: {
  quote: PortalQuotationDetail;
  onSuccess?: (message: string) => void;
}) {
  const navigate = useNavigate();
  const updateQuote = useUpdatePortalQuotation();
  const replaceQuote = useReplacePortalQuotation();
  const deleteQuote = useDeletePortalQuotation();
  const [error, setError] = useState<string | null>(null);
  const [commodity, setCommodity] = useState(quote.commodity ?? '');
  const [notes, setNotes] = useState(quote.specialRequirements ?? '');
  const [editing, setEditing] = useState(false);

  const canEdit = canPortalCustomerEditQuote(quote);
  const canReplace = canPortalCustomerReplaceQuote(quote);
  const canDelete = canPortalCustomerDeleteQuote(quote);
  if (!canEdit && !canReplace && !canDelete) return null;

  const pending =
    updateQuote.isPending || replaceQuote.isPending || deleteQuote.isPending;

  const fail = (err: unknown) => {
    const raw =
      err instanceof PortalApiError || err instanceof Error
        ? err.message
        : 'Action failed.';
    setError(formatPortalQuotationActionError(raw));
  };

  return (
    <div className="space-y-3 rounded-lg border border-[var(--color-neutral-200)] bg-white p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-[var(--color-neutral-900)]">
          Draft actions
        </h2>
        <p className="text-xs text-[var(--color-neutral-500)]">
          Edit, replace, or delete while this quote is still a draft.
        </p>
      </div>

      {error ? (
        <p className="text-sm text-[var(--color-danger-600)]" role="alert">
          {error}
        </p>
      ) : null}

      {canEdit && editing ? (
        <div className="grid gap-2 sm:grid-cols-2">
          <label className="block text-xs font-medium text-[var(--color-neutral-600)]">
            Commodity
            <input
              className="mt-1 h-9 w-full rounded-md border border-[var(--color-neutral-200)] px-3 text-sm"
              value={commodity}
              onChange={(e) => setCommodity(e.target.value)}
            />
          </label>
          <label className="block text-xs font-medium text-[var(--color-neutral-600)]">
            Special requirements
            <input
              className="mt-1 h-9 w-full rounded-md border border-[var(--color-neutral-200)] px-3 text-sm"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </label>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2">
        {canEdit ? (
          editing ? (
            <>
              <Button
                type="button"
                size="sm"
                variant="edit"
                disabled={pending}
                onClick={() => {
                  setError(null);
                  void updateQuote
                    .mutateAsync({
                      id: quote.id,
                      dto: {
                        commodity: commodity.trim() || undefined,
                        special_requirements: notes.trim() || undefined,
                      },
                    })
                    .then(() => {
                      setEditing(false);
                      onSuccess?.('Draft quotation updated.');
                    })
                    .catch(fail);
                }}
              >
                {updateQuote.isPending ? 'Saving…' : 'Save changes'}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                disabled={pending}
                onClick={() => {
                  setEditing(false);
                  setCommodity(quote.commodity ?? '');
                  setNotes(quote.specialRequirements ?? '');
                }}
              >
                Cancel
              </Button>
            </>
          ) : (
            <Button
              type="button"
              size="sm"
              variant="edit"
              disabled={pending}
              onClick={() => {
                setError(null);
                setEditing(true);
              }}
            >
              Edit draft
            </Button>
          )
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
            {replaceQuote.isPending ? 'Replacing…' : 'Replace draft'}
          </Button>
        ) : null}

        {canDelete ? (
          <Button
            type="button"
            size="sm"
            variant="danger"
            disabled={pending}
            onClick={() => {
              if (!window.confirm('Delete this draft quotation? This cannot be undone.')) {
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
            {deleteQuote.isPending ? 'Deleting…' : 'Delete draft'}
          </Button>
        ) : null}
      </div>
    </div>
  );
}
