import type { AuthUser } from '@/types/auth.types';
import {
  isOpsUnrestrictedRole,
  isTenantUserManagerRole,
  resolveAuthRoleSlug,
} from '@/features/users/constants/userPermissions';

export type InvoiceListSide = 'sale' | 'purchase';

type InvoiceFlagActor = Pick<
  AuthUser,
  | 'role'
  | 'unrestrictedOps'
  | 'canSeeSaleInvoices'
  | 'canSeePurchaseInvoices'
  | 'permissions'
> | null | undefined;

function actorSeesAllInvoices(user: InvoiceFlagActor): boolean {
  if (!user) return false;
  if (user.unrestrictedOps) return true;
  const slug = resolveAuthRoleSlug(user.role);
  return isTenantUserManagerRole(slug) || isOpsUnrestrictedRole(slug);
}

/**
 * Staff invoice side flags (independent of costing can_see_sales / can_see_cost).
 * Sale → customer invoices + debit notes; purchase → purchase invoices + credit notes.
 * Tenant Admin / sees-all → both. When /auth/me omits both flags, keep legacy both
 * (BE still enforces after deploy). Explicit false on a side denies that side.
 */
export function resolveInvoiceListVisibility(user?: InvoiceFlagActor): {
  canSeeSaleInvoices: boolean;
  canSeePurchaseInvoices: boolean;
  canSeeDebitNotes: boolean;
  canSeeCreditNotes: boolean;
  canSeeAnyInvoices: boolean;
} {
  if (actorSeesAllInvoices(user)) {
    return {
      canSeeSaleInvoices: true,
      canSeePurchaseInvoices: true,
      canSeeDebitNotes: true,
      canSeeCreditNotes: true,
      canSeeAnyInvoices: true,
    };
  }

  const saleRaw = user?.canSeeSaleInvoices;
  const purchaseRaw = user?.canSeePurchaseInvoices;

  // /auth/me omitted both → legacy open until BE sends flags.
  if (saleRaw === undefined && purchaseRaw === undefined) {
    return {
      canSeeSaleInvoices: true,
      canSeePurchaseInvoices: true,
      canSeeDebitNotes: true,
      canSeeCreditNotes: true,
      canSeeAnyInvoices: true,
    };
  }

  const sale = saleRaw === true;
  const purchase = purchaseRaw === true;
  return {
    canSeeSaleInvoices: sale,
    canSeePurchaseInvoices: purchase,
    canSeeDebitNotes: sale,
    canSeeCreditNotes: purchase,
    canSeeAnyInvoices: sale || purchase,
  };
}

export function canAccessInvoiceSide(
  user: InvoiceFlagActor,
  side: InvoiceListSide,
): boolean {
  const vis = resolveInvoiceListVisibility(user);
  return side === 'sale' ? vis.canSeeSaleInvoices : vis.canSeePurchaseInvoices;
}
