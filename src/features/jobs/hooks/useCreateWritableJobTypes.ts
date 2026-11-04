import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '@/lib/axios';
import { JOB_TYPE_WIZARD_OPTIONS, type JobType } from '../constants/job.constants';
import { parseCreateWizardJobTypes } from '../utils/parseCreateWizardJobTypes';
import { useStaffAllowedJobTypes } from './useStaffAllowedJobTypes';

export type CreateWizardSource = 'auth' | 'quotations' | 'shipments' | 'enquiries' | 'documentation';

const WIZARD_PATH: Record<Exclude<CreateWizardSource, 'auth'>, string> = {
  quotations: '/quotations/create-wizard',
  shipments: '/shipments/create-wizard',
  enquiries: '/crm/enquiries/wizard',
  documentation: '/documentation/jobs/create-wizard',
};

/**
 * Writable job types for create UIs.
 * Prefers dedicated create-wizard metadata when available; falls back to /auth/me
 * via useStaffAllowedJobTypes({ mode: 'create' }).
 */
export function useCreateWritableJobTypes(
  source: CreateWizardSource = 'auth',
  candidates: readonly JobType[] = JOB_TYPE_WIZARD_OPTIONS,
): JobType[] {
  const fromAuth = useStaffAllowedJobTypes(candidates, 'create');

  const wizardPath = source === 'auth' ? null : WIZARD_PATH[source];
  const wizardQuery = useQuery({
    queryKey: ['create-wizard-job-types', source],
    queryFn: async () => {
      if (!wizardPath) return [] as JobType[];
      // Documentation create-wizard is POST; others are GET per BE handoff.
      if (source === 'documentation') {
        const res = await axiosInstance.post(wizardPath, {}, { skipErrorToast: true });
        return parseCreateWizardJobTypes(res.data);
      }
      const res = await axiosInstance.get(wizardPath, { skipErrorToast: true });
      return parseCreateWizardJobTypes(res.data);
    },
    enabled: Boolean(wizardPath),
    staleTime: 60_000,
    retry: false,
  });

  return useMemo(() => {
    const fromWizard = wizardQuery.data ?? [];
    if (fromWizard.length) {
      const allow = new Set(candidates);
      const filtered = fromWizard.filter((t) => allow.has(t));
      return filtered.length ? filtered : fromAuth;
    }
    return fromAuth;
  }, [wizardQuery.data, fromAuth, candidates]);
}
