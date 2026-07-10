import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CreateCompanyFormValues } from '@/features/companies/types/company.types';

export interface DraftCompany extends CreateCompanyFormValues {
  id: string;
  saved_at: string;
}

interface PersistedV1 {
  pendingCompany?: DraftCompany | { id: string; saved_at: string } & CreateCompanyFormValues;
  draftCompanies?: DraftCompany[];
  lastProvisionedTenantId?: string | null;
}

interface PlatformOnboardingState {
  draftCompanies: DraftCompany[];
  lastProvisionedTenantId: string | null;
  addDraftCompany: (company: CreateCompanyFormValues) => DraftCompany;
  removeDraftCompany: (id: string) => void;
  clearDraftCompanies: () => void;
  setLastProvisionedTenantId: (tenantId: string | null) => void;
}

function createDraft(company: CreateCompanyFormValues): DraftCompany {
  return {
    ...company,
    id: crypto.randomUUID(),
    saved_at: new Date().toISOString(),
  };
}

export const usePlatformOnboardingStore = create<PlatformOnboardingState>()(
  persist(
    (set, get) => ({
      draftCompanies: [],
      lastProvisionedTenantId: null,
      addDraftCompany: (company) => {
        const draft = createDraft(company);
        set({
          draftCompanies: [
            ...get().draftCompanies.filter((item) => item.code !== company.code),
            draft,
          ],
        });
        return draft;
      },
      removeDraftCompany: (id) =>
        set({ draftCompanies: get().draftCompanies.filter((item) => item.id !== id) }),
      clearDraftCompanies: () => set({ draftCompanies: [] }),
      setLastProvisionedTenantId: (tenantId) => set({ lastProvisionedTenantId: tenantId }),
    }),
    {
      name: 'fresa-platform-onboarding',
      version: 2,
      migrate: (persisted) => {
        const state = persisted as PersistedV1;
        if (state.draftCompanies?.length) {
          return persisted;
        }
        if (state.pendingCompany) {
          const legacy = state.pendingCompany;
          const draft: DraftCompany = {
            ...legacy,
            id: legacy.id === 'pending' ? crypto.randomUUID() : legacy.id,
            saved_at: legacy.saved_at ?? new Date().toISOString(),
          };
          return {
            ...state,
            draftCompanies: [draft],
            pendingCompany: undefined,
          };
        }
        return { ...state, draftCompanies: state.draftCompanies ?? [] };
      },
    },
  ),
);

/** @deprecated Use draftCompanies from the store */
export type PendingCompany = DraftCompany;
