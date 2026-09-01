import { PageBackLink } from '@/components/ui/PageBackLink';

/** No Documentation API endpoint — finance module handles payment requests. */
export default function PaymentRequestMonitorPage() {
  return (
    <div className="space-y-3">
      <PageBackLink to="/documentation" label="Back to Documentation" />
      <div className="rounded-md border border-gray-200 bg-white p-6 text-sm text-gray-600">
        Payment Request Monitor is not part of the Documentation API. Use Finance → Payment Requests when that module is enabled.
      </div>
    </div>
  );
}
