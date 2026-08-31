import { useNavigate } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import type { PaginationMeta } from '../../types/company.types';
import type { CompanyListItem } from '../../utils/mergeDraftCompanies';
import { CompanyActionMenu } from '../CompanyActionMenu';
import { CompanyDefaultBadge, CompanyStatusBadge } from '../CompanyStatusBadge';

interface CompanyTableProps {
  companies: CompanyListItem[];
  meta?: PaginationMeta;
  isFetching?: boolean;
  pendingActionId?: string | null;
  showTenant?: boolean;
  onPage: (page: number) => void;
  onView: (c: CompanyListItem) => void;
  onEdit: (c: CompanyListItem) => void;
  onDelete: (c: CompanyListItem) => void;
  onActivate?: (c: CompanyListItem) => void;
  onDeactivate?: (c: CompanyListItem) => void;
  onContinueSetup?: (c: CompanyListItem) => void;
  detailPath: (id: string) => string;
}

export function CompanyTable({
  companies,
  meta,
  isFetching,
  pendingActionId,
  showTenant = false,
  onPage,
  onView,
  onEdit,
  onDelete,
  onActivate,
  onDeactivate,
  onContinueSetup,
  detailPath,
}: CompanyTableProps) {
  const navigate = useNavigate();
  const colSpan = showTenant ? 6 : 5;

  return (
    <div className={isFetching ? 'opacity-60 pointer-events-none' : undefined}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Code</TableHead>
            <TableHead>Company</TableHead>
            {showTenant && <TableHead className="hidden lg:table-cell">Tenant</TableHead>}
            <TableHead className="hidden md:table-cell">City</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {companies.length === 0 && (
            <TableRow>
              <TableCell colSpan={colSpan} className="px-4 py-12 text-center text-sm text-[var(--color-neutral-400)]">
                No companies found
              </TableCell>
            </TableRow>
          )}
          {companies.map((c) => (
            <TableRow key={c.is_draft ? `draft-${c.id}` : c.id}>
              <TableCell>{c.code}</TableCell>
              <TableCell>
                <button
                  type="button"
                  onClick={() => navigate(detailPath(c.id))}
                  className="text-left"
                >
                  <p className="hover:text-[var(--color-primary-600)]">
                    {c.name}
                  </p>
                  <p className="text-xs text-[var(--color-neutral-400)]">{c.email}</p>
                </button>
              </TableCell>
              {showTenant && (
                <TableCell className="hidden lg:table-cell">
                  {c.tenant_name || '—'}
                </TableCell>
              )}
              <TableCell className="hidden md:table-cell">{c.city}</TableCell>
              <TableCell>
                <div className="flex flex-wrap items-center gap-1.5">
                  <CompanyStatusBadge company={c} />
                  {!c.is_draft && <CompanyDefaultBadge isDefault={c.is_default} />}
                </div>
              </TableCell>
              <TableCell className="text-right">
                {c.is_draft ? (
                  <div className="flex justify-end gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => onContinueSetup?.(c)}
                    >
                      Link tenant
                    </Button>
                    <CompanyActionMenu
                      company={c}
                      disabled={pendingActionId === c.id}
                      onView={onView}
                      onEdit={onEdit}
                      onDelete={onDelete}
                      onActivate={onActivate}
                      onDeactivate={onDeactivate}
                    />
                  </div>
                ) : (
                  <CompanyActionMenu
                    company={c}
                    disabled={pendingActionId === c.id}
                    onView={onView}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onActivate={onActivate}
                    onDeactivate={onDeactivate}
                  />
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-[var(--color-neutral-100)] px-4 py-3">
          <p className="text-xs text-[var(--color-neutral-500)]">
            Page {meta.page} of {meta.totalPages} · {meta.total} total
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={meta.page <= 1}
              onClick={() => onPage(meta.page - 1)}
              className="px-3 py-1 text-xs rounded border border-[var(--color-neutral-200)] disabled:opacity-40"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={meta.page >= meta.totalPages}
              onClick={() => onPage(meta.page + 1)}
              className="px-3 py-1 text-xs rounded border border-[var(--color-neutral-200)] disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
