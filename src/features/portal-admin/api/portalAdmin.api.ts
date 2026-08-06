/**
 * @deprecated Prefer `@/features/parties` party portal APIs.
 * Kept for tenant-wide `GET /portal-users` and re-exports.
 */
import { PARTY_API } from '@/features/parties/api/party.api';

export const PORTAL_ADMIN_API = {
  tenantUsers: '/portal-users',
  partyUsers: PARTY_API.portalUsers,
  partyUserStatus: PARTY_API.portalUserStatus,
  partyUserResetPassword: PARTY_API.portalUserResetPassword,
  partyPermissions: PARTY_API.portalPermissions,
  partyPermissionsReset: PARTY_API.portalPermissionsReset,
} as const;

export {
  PARTY_PORTAL_DOCUMENT_TYPES as PORTAL_DOCUMENT_TYPES,
  PARTY_PORTAL_DOCUMENT_TYPE_LABELS as PORTAL_DOCUMENT_TYPE_LABELS,
  type PartyPortalDocumentType as PortalDocumentType,
} from '@/features/parties/api/party.api';
