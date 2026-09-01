import { PageBackLink } from '@/components/ui/PageBackLink';

/** No Documentation API endpoint — finance vouchers module handles batch processing. */
export default function VoucherBatchProcessingPage() {
  return (
    <div className="space-y-3">
      <PageBackLink to="/documentation" label="Back to Documentation" />
      <div className="rounded-md border border-gray-200 bg-white p-6 text-sm text-gray-600">
        Voucher batch processing is not part of the Documentation API. Use Finance → Vouchers for batch voucher operations.
      </div>
    </div>
  );
}
