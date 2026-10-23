import { useNavigate } from 'react-router-dom';
import { Building2, FileCheck2, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useVerificationGateStore } from '../store/verificationGateStore';

/**
 * Custom gate dialog — not a generic API error / Retry surface.
 * Opened when BE returns verification_required / upload-docs messages.
 */
export function VerificationRequiredModal() {
  const navigate = useNavigate();
  const open = useVerificationGateStore((s) => s.open);
  const audience = useVerificationGateStore((s) => s.audience);
  const message = useVerificationGateStore((s) => s.message);
  const closeGate = useVerificationGateStore((s) => s.closeGate);

  const accountPath =
    audience === 'vendor' ? '/vendor/account#verification' : '/portal/account#verification';
  const label = audience === 'vendor' ? 'vendor portal' : 'customer portal';

  return (
    <Modal
      open={open}
      onClose={closeGate}
      title="Company documents required"
      size="md"
      footer={
        <div className="flex flex-wrap justify-end gap-2">
          <Button type="button" size="sm" variant="secondary" onClick={closeGate}>
            Later
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={() => {
              closeGate();
              navigate(accountPath);
            }}
          >
            Upload documents
          </Button>
        </div>
      }
    >
      <div className="space-y-4 text-sm text-[var(--color-neutral-700)]">
        <p>{message}</p>
        <ul className="space-y-2">
          <li className="flex gap-2">
            <FileCheck2 size={16} className="mt-0.5 shrink-0 text-[var(--color-primary)]" />
            <span>Upload VAT certificate and business license (PDF or image).</span>
          </li>
          <li className="flex gap-2">
            <Building2 size={16} className="mt-0.5 shrink-0 text-[var(--color-primary)]" />
            <span>Submit for review — Tenant Admin must approve your company.</span>
          </li>
          <li className="flex gap-2">
            <ShieldCheck size={16} className="mt-0.5 shrink-0 text-[var(--color-primary)]" />
            <span>
              Until approved, {label} quotes, bookings, and finance stay locked. You can always
              manage documents under Account.
            </span>
          </li>
        </ul>
      </div>
    </Modal>
  );
}
