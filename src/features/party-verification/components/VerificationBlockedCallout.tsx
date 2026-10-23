import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, FileCheck2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type { VerificationAudience } from '../store/verificationGateStore';
import { openVerificationGateIfNeeded } from '../utils/openVerificationGate';

interface VerificationBlockedCalloutProps {
  audience: VerificationAudience;
  message: string;
  /** Also open the global VerificationRequiredModal. */
  openModal?: boolean;
}

/**
 * Inline KYC gate surface — replaces Retry/error when finance APIs return
 * verification_required (portal + vendor). Popup is primary; Account has upload.
 */
export function VerificationBlockedCallout({
  audience,
  message,
  openModal = true,
}: VerificationBlockedCalloutProps) {
  const navigate = useNavigate();
  const accountPath =
    audience === 'vendor' ? '/vendor/account#verification' : '/portal/account#verification';
  const label = audience === 'vendor' ? 'vendor portal' : 'customer portal';

  useEffect(() => {
    if (openModal) openVerificationGateIfNeeded(message, audience);
  }, [audience, message, openModal]);

  return (
    <div className="space-y-3 rounded-lg border border-[var(--color-primary-200)] bg-[var(--color-primary-50)] p-5">
      <p className="text-sm font-medium text-[var(--color-primary-900)]">
        Company documents required
      </p>
      <p className="text-sm text-[var(--color-neutral-700)]">{message}</p>
      <ul className="space-y-2 text-sm text-[var(--color-neutral-700)]">
        <li className="flex gap-2">
          <FileCheck2
            size={16}
            className="mt-0.5 shrink-0 text-[var(--color-primary)]"
          />
          <span>Upload VAT certificate and business license.</span>
        </li>
        <li className="flex gap-2">
          <Building2
            size={16}
            className="mt-0.5 shrink-0 text-[var(--color-primary)]"
          />
          <span>
            Tenant Admin must approve before {label} invoices and payments unlock.
          </span>
        </li>
      </ul>
      <Button type="button" size="sm" onClick={() => navigate(accountPath)}>
        Go to Account to upload
      </Button>
    </div>
  );
}
