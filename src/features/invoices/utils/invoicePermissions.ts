export function canReviewPaymentProofs(user?: { permissions?: string[] } | null): boolean {
  if (!user) return false;
  return user.permissions?.includes('invoices.review_payment_proofs') ?? false;
}
