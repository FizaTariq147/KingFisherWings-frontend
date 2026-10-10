import type { ReactNode } from 'react';
import { FormSection } from '@/components/erp';

/** CRM form section — uses shared ERP FormSection styling. */
export function CrmSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <FormSection title={title} description={description}>
      {children}
    </FormSection>
  );
}
