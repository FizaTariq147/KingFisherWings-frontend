import { DocumentationEdiJobListShell } from '@/features/documentation/components/DocumentationEdiJobListShell';
import { useDubaiEqoEdiJobs, useEqoEdiActions } from '@/features/documentation/hooks/useDocumentation';

export default function DubaiEqoEdiPage() {
  const actions = useEqoEdiActions('dubai');
  return (
    <DocumentationEdiJobListShell
      title="Dubai eQO EDI"
      useList={useDubaiEqoEdiJobs}
      actions={[
        { key: 'bol', label: 'Generate BOL', run: actions.generateBol.mutateAsync },
        { key: 'submit', label: 'Submit', run: actions.submit.mutateAsync },
      ]}
    />
  );
}
