import {
  normalizeAuthLoginResponse,
  resolveAuthTenantBranding,
  unwrapEnvelope,
} from '@/features/auth/utils/normalizeAuthResponse';
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

function pickVendorUserSource(envelope: Record<string, unknown>): Record<string, unknown> | null {
  return (
    asRecord(envelope.user) ||
    asRecord(envelope.vendor_user) ||
    asRecord(envelope.profile) ||
    envelope
  );
}

export function normalizeVendorUser(raw: unknown): VendorUser | null {
  const envelope = unwrapEnvelope(raw);
  const r = pickVendorUserSource(envelope) ?? asRecord(raw);
  if (!r) return null;
  const id = pickString(r.id, r.user_id, r.userId);
  const email = pickString(r.email);
  if (!id && !email) return null;

  const party = normalizeParty(r.party) ?? normalizeParty(r.vendor) ?? normalizeParty(envelope.party);
  const { tenantId, tenantSlug, tenantName } = resolveAuthTenantBranding(r, envelope);

  return {
    id: id || email,
    email: email || '',
    fullName: pickString(r.full_name, r.fullName, r.name) || email || 'Vendor',
    tenantId: tenantId || '',
    tenantSlug,
    tenantName,
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

  const userFromPayload = normalizeVendorUser(raw);
  const user: VendorUser | null = userFromPayload
    ? {
        ...userFromPayload,
        id: userFromPayload.id || login.user.id,
        email: userFromPayload.email || login.user.email,
        fullName:
          userFromPayload.fullName !== 'Vendor'
            ? userFromPayload.fullName
            : login.user.name || userFromPayload.fullName,
        tenantId: userFromPayload.tenantId || login.user.tenantId || '',
      }
    : normalizeVendorUser({
        id: login.user.id,
        email: login.user.email,
        full_name: login.user.name,
        tenant_id: login.user.tenantId,
      });

  if (!user) return null;
  return {
    accessToken: login.accessToken,
    refreshToken: login.refreshToken || '',
    user,
  };
}
