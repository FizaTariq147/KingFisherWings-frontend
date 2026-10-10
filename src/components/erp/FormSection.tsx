import type { ReactNode } from 'react';
import { erpForm } from '@/lib/erpForm';
import { cn } from '@/lib/utils';

export function FormSection({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn(erpForm.section, className)}>
      <div className={erpForm.sectionHeader}>
        {title}
        {description ? <p className={erpForm.sectionDesc}>{description}</p> : null}
      </div>
      <div className={erpForm.sectionBody}>{children}</div>
    </section>
  );
}
