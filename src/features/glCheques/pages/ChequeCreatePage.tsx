import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AccountsCreatePageLayout } from '@/features/accounts/components';
import { CHEQUE_ROUTE_PREFIX } from '../api/cheque.api';
import { ChequeForm } from '../components/ChequeForm';
import type { ChequeType } from '../constants/cheque.constants';
import { useCreateCheque } from '../hooks/useGlCheques';
import type { CreateChequeFormValues } from '../types/cheque.types';
import { getErrorMessage } from '../utils/getErrorMessage';

export default function ChequeCreatePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const create = useCreateCheque();
  const [error, setError] = useState<string | null>(null);

  const typeParam = searchParams.get('type')?.toUpperCase();
  const initialType: ChequeType = typeParam === 'PAYABLE' ? 'PAYABLE' : 'RECEIVABLE';
  const isPayable = initialType === 'PAYABLE';

  return (
    <AccountsCreatePageLayout
      backLabel="Back to cheques"
      backTo={CHEQUE_ROUTE_PREFIX}
      title={isPayable ? 'Register payable cheque' : 'Register receivable cheque / PDC'}
      subtitle={
        isPayable
          ? 'Record a vendor or carrier cheque issued by your company.'
          : 'Record a customer cheque, including post-dated (PDC) instruments.'
      }
      error={error}
    >
      <ChequeForm
        key={initialType}
        mode="create"
        defaultValues={{ cheque_type: initialType }}
        isSubmitting={create.isPending}
        onCancel={() => navigate(CHEQUE_ROUTE_PREFIX)}
        onSubmit={async (values) => {
          setError(null);
          try {
            const created = await create.mutateAsync(values as CreateChequeFormValues);
            navigate(`${CHEQUE_ROUTE_PREFIX}/${created.id}`);
          } catch (err) {
            setError(getErrorMessage(err));
          }
        }}
      />
    </AccountsCreatePageLayout>
  );
}
