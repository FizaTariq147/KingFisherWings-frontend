import { create } from 'zustand';

export type VerificationAudience = 'portal' | 'vendor';

interface VerificationGateState {
  open: boolean;
  audience: VerificationAudience;
  message: string;
  openGate: (opts: { audience: VerificationAudience; message?: string }) => void;
  closeGate: () => void;
}

const DEFAULT_MESSAGE =
  'Upload required business documents (VAT certificate and license) before using the portal. Tenant Admin must approve before quotes and bookings unlock.';

export const useVerificationGateStore = create<VerificationGateState>((set) => ({
  open: false,
  audience: 'portal',
  message: DEFAULT_MESSAGE,
  openGate: ({ audience, message }) =>
    set({
      open: true,
      audience,
      message: message?.trim() || DEFAULT_MESSAGE,
    }),
  closeGate: () => set({ open: false }),
}));
