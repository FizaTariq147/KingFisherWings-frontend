import { normalizeAuthLoginResponse, unwrapEnvelope } from '@/features/auth/utils/normalizeAuthResponse';
import { asRecord, pickString } from '@/features/vendor-shared/normalize';
import type { VendorLoginResult, VendorParty, VendorUser } from '../types/vendorAuth.types';

function normalizeParty(raw: unknown): VendorParty | undefined {
  const r = asRecord(raw);
  if (!r) return undefined;
  const id = pickString(r.id, r.party_id, r.partyId);
  if (!id) return undefined;
  return {
    id,
    name: pickString(r.name, r.party_name, r.partyName) || id,
    code: pickString(r.code, r.party_code, r.partyCode) || undefined,
  };
}

export function normalizeVendorUser(raw: unknown): VendorUser | null {
  const r = asRecord(unwrapEnvelope(raw)) ?? asRecord(raw);
  if (!r) return null;
  const id = pickString(r.id, r.user_id, r.userId);
  const email = pickString(r.email);
  if (!id && !email) return null;
  const party = normalizeParty(r.party) ?? normalizeParty(r.vendor);
  return {
    id: id || email,
    email: email || '',
    fullName: pickString(r.full_name, r.fullName, r.name) || email || 'Vendor',
    tenantId: pickString(r.tenant_id, r.tenantId) || '',
    tenantSlug: pickString(r.tenant_slug, r.tenantSlug) || undefined,
    tenantName: pickString(r.tenant_name, r.tenantName) || undefined,
    party,
    status: pickString(r.status) || undefined,
  };
}

export function normalizeVendorTokenPair(raw: unknown): { accessToken: string; refreshToken: string } | null {
  const login = normalizeAuthLoginResponse(raw, 'VENDOR_USER');
  if (!login?.accessToken) return null;
  return {
    accessToken: login.accessToken,
    refreshToken: login.refreshToken || '',
  };
}

export function normalizeVendorLogin(raw: unknown): VendorLoginResult | null {
  const login = normalizeAuthLoginResponse(raw, 'VENDOR_USER');
  if (!login?.accessToken) return null;
  const envelope = unwrapEnvelope(raw);
  const user =
    normalizeVendorUser(envelope.user) ||
    normalizeVendorUser(envelope) ||
    normalizeVendorUser({
      id: login.user.id,
      email: login.user.email,
      full_name: login.user.fullName,
      tenant_id: login.user.tenantId,
    });
  if (!user) return null;
  return {
    accessToken: login.accessToken,
    refreshToken: login.refreshToken || '',
    user,
  };
}
