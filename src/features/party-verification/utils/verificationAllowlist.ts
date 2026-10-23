import {
  PORTAL_VERIFICATION_PATH,
  VENDOR_VERIFICATION_PATH,
} from '../api/partyVerification.api';

/** Paths allowed while party verification is not APPROVED (after password change). */
export function isPortalVerificationAllowlisted(pathname: string): boolean {
  const p = pathname.replace(/\/+$/, '') || '/';
  return (
    p === PORTAL_VERIFICATION_PATH ||
    p === '/portal/change-password' ||
    p === '/portal/account' ||
    p === '/portal/login'
  );
}

export function isVendorVerificationAllowlisted(pathname: string): boolean {
  const p = pathname.replace(/\/+$/, '') || '/';
  return (
    p === VENDOR_VERIFICATION_PATH ||
    p === '/vendor/change-password' ||
    p === '/vendor/account' ||
    p === '/vendor/login'
  );
}

export function portalUserNeedsVerification(user: {
  mustChangePassword?: boolean;
  canUsePortal?: boolean;
  verificationBlocking?: boolean;
  verificationStatus?: string;
} | null | undefined): boolean {
  if (!user || user.mustChangePassword) return false;
  if (typeof user.canUsePortal === 'boolean') return !user.canUsePortal;
  if (typeof user.verificationBlocking === 'boolean') return user.verificationBlocking;
  const status = String(user.verificationStatus || '')
    .toUpperCase()
    .replace(/[\s-]+/g, '_');
  if (!status) return false;
  return status !== 'APPROVED';
}

export function vendorUserNeedsVerification(user: {
  mustChangePassword?: boolean;
  canUseVendor?: boolean;
  verificationBlocking?: boolean;
  verificationStatus?: string;
} | null | undefined): boolean {
  if (!user || user.mustChangePassword) return false;
  if (typeof user.canUseVendor === 'boolean') return !user.canUseVendor;
  if (typeof user.verificationBlocking === 'boolean') return user.verificationBlocking;
  const status = String(user.verificationStatus || '')
    .toUpperCase()
    .replace(/[\s-]+/g, '_');
  if (!status) return false;
  return status !== 'APPROVED';
}
