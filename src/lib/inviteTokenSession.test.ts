import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  clearInviteTokenSession,
  readInviteTokenFromSearch,
} from './inviteTokenSession';

describe('inviteTokenSession', () => {
  const store = new Map<string, string>();

  beforeEach(() => {
    store.clear();
    vi.stubGlobal('sessionStorage', {
      getItem: (k: string) => (store.has(k) ? store.get(k)! : null),
      setItem: (k: string, v: string) => {
        store.set(k, v);
      },
      removeItem: (k: string) => {
        store.delete(k);
      },
    });
  });

  afterEach(() => {
    clearInviteTokenSession('portal');
    vi.unstubAllGlobals();
  });

  it('stores token from query and restores after query is empty', () => {
    const first = readInviteTokenFromSearch('?token=abc123', 'portal');
    expect(first).toBe('abc123');
    const restored = readInviteTokenFromSearch('', 'portal');
    expect(restored).toBe('abc123');
  });

  it('clears stored token', () => {
    readInviteTokenFromSearch('?token=abc123', 'portal');
    clearInviteTokenSession('portal');
    expect(readInviteTokenFromSearch('', 'portal')).toBe('');
  });
});

