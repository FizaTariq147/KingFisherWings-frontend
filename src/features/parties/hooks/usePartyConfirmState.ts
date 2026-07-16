import { useState } from 'react';
import type { Party } from '../types/party.types';
import type { PartyConfirmAction } from '../components/PartyConfirmModal';

export type PartyConfirmState = {
  action: PartyConfirmAction;
  party: Party;
} | null;

export function usePartyConfirmState() {
  const [confirm, setConfirm] = useState<PartyConfirmState>(null);

  const requestConfirm = (action: PartyConfirmAction, party: Party) => {
    setConfirm({ action, party });
  };

  const closeConfirm = () => setConfirm(null);

  return { confirm, requestConfirm, closeConfirm };
}
