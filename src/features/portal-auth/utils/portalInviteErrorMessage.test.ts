import { describe, expect, it } from 'vitest';
import { PortalApiError } from '@/lib/portalApiClient';
import { portalInviteErrorMessage } from './portalInviteErrorMessage';

describe('portalInviteErrorMessage', () => {
  it('maps expired invitations safely', () => {
    expect(portalInviteErrorMessage(new PortalApiError('Invite token expired', 410))).toMatch(
      /expired/i,
    );
  });

  it('maps already-used invitations safely', () => {
    expect(
      portalInviteErrorMessage(new PortalApiError('Invitation already used', 400)),
    ).toMatch(/already used/i);
  });

  it('maps invalid / not found without leaking internals', () => {
    const msg = portalInviteErrorMessage(
      new PortalApiError('UserInvitation entity id=abc not found in schema public', 404),
    );
    expect(msg).toMatch(/invalid|no longer available/i);
    expect(msg).not.toMatch(/schema|entity|abc/i);
  });

  it('maps revoked invitations', () => {
    expect(portalInviteErrorMessage(new PortalApiError('Invite revoked by admin', 400))).toMatch(
      /invalid|no longer available/i,
    );
  });

  it('falls back for unknown errors', () => {
    expect(portalInviteErrorMessage(new Error('ECONNRESET'))).toMatch(/Could not activate/i);
  });
});
