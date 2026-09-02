export function canManageServiceCatalog(user?: { permissions?: string[] } | null): boolean {
  if (!user) return false;
  return user.permissions?.includes('quotations.service_catalog.manage') ?? false;
}

export function canNegotiateQuotations(user?: { permissions?: string[] } | null): boolean {
  if (!user) return false;
  return user.permissions?.includes('quotations.negotiate') ?? false;
}
