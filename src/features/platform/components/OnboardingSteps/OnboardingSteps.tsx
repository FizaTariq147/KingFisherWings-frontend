import { useLocation } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import { useCompanyRegistry } from '@/features/companies/hooks/useCompanies';
import { useTenants } from '@/features/tenants/hooks/useTenants';
import { ONBOARDING_STEPS, type OnboardingStep } from '../../constants/onboarding';
import { usePlatformOnboardingStore } from '../../store/platformOnboardingStore';

interface OnboardingStepsProps {
  current?: OnboardingStep;
  className?: string;
}

export function resolveOnboardingStep(pathname: string): OnboardingStep {
  if (pathname.includes('/tenants')) return 'tenant';
  return 'company';
}

function stepState(
  stepId: OnboardingStep,
  current: OnboardingStep,
  hasCompany: boolean,
  hasTenant: boolean,
): 'complete' | 'current' | 'upcoming' {
  const order: OnboardingStep[] = ['company', 'tenant'];
  const currentIdx = order.indexOf(current);
  const stepIdx = order.indexOf(stepId);

  if (stepId === 'company' && hasCompany) return 'complete';
  if (stepId === 'tenant' && hasTenant) return 'complete';
  if (stepIdx < currentIdx) return 'complete';
  if (stepIdx === currentIdx) return 'current';
  return 'upcoming';
}

export function OnboardingSteps({ current, className }: OnboardingStepsProps) {
  const location = useLocation();
  const activeStep = current ?? resolveOnboardingStep(location.pathname);
  const draftCompanies = usePlatformOnboardingStore((s) => s.draftCompanies);
  const { data: companiesData } = useCompanyRegistry({ limit: 1 });
  const { data: tenantsData } = useTenants({ page: 1, limit: 1 });
  const hasCompany =
    draftCompanies.length > 0 ||
    (companiesData?.companies.length ?? 0) > 0 ||
    (tenantsData?.tenants.length ?? 0) > 0;
  const hasTenant = (tenantsData?.tenants.length ?? 0) > 0;

  return (
    <Card className={cn('p-4', className)}>
      <nav aria-label="Onboarding progress" className="flex flex-col gap-3">
        <p className="text-sm font-semibold text-[var(--color-neutral-800)]">Setup flow</p>
        <ol className="grid grid-cols-1 gap-2 md:grid-cols-2">
          {ONBOARDING_STEPS.map((step, index) => {
            const state = stepState(step.id, activeStep, hasCompany, hasTenant);
            const isLast = index === ONBOARDING_STEPS.length - 1;
            const tenantBlocked = step.id === 'tenant' && !hasCompany;

            return (
              <li key={step.id} className="flex items-center gap-2 min-w-0">
                <Link
                  to={tenantBlocked ? '/superadmin/companies/new' : step.path}
                  className={cn(
                    'flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm transition-colors min-w-0 flex-1 shadow-sm',
                    state === 'current' &&
                      'border-[var(--color-primary-500)] bg-[var(--color-primary-50)] text-[var(--color-primary-700)]',
                    state === 'complete' &&
                      'border-[var(--color-success-500)] bg-[var(--color-success-100)] text-[var(--color-success-700)]',
                    state === 'upcoming' &&
                      'border-[var(--color-neutral-200)] bg-white text-[var(--color-neutral-600)] hover:border-[var(--color-neutral-300)]',
                  )}
                >
                  <span
                    className={cn(
                      'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold',
                      state === 'current' && 'bg-[var(--color-primary-500)] text-white',
                      state === 'complete' && 'bg-[var(--color-success-500)] text-white',
                      state === 'upcoming' && 'bg-[var(--color-neutral-100)] text-[var(--color-neutral-500)]',
                    )}
                  >
                    {state === 'complete' ? <Check className="h-4 w-4" /> : index + 1}
                  </span>
                  <span className="font-medium leading-tight">{step.label}</span>
                </Link>
                {!isLast && (
                  <span className="hidden md:block text-[var(--color-neutral-300)]" aria-hidden="true">
                    →
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </Card>
  );
}
