import { DocumentationEdiJobListShell } from '@/features/documentation/components/DocumentationEdiJobListShell';
import { useEqoEdiActions, useOmanEqoEdiJobs } from '@/features/documentation/hooks/useDocumentation';

export default function OmanEqoEdiPage() {
  const actions = useEqoEdiActions('oman');
  return (
    <DocumentationEdiJobListShell
      title="Oman eQO EDI"
      useList={useOmanEqoEdiJobs}
      actions={[
        { key: 'bol', label: 'Generate BOL', run: actions.generateBol.mutateAsync },
        { key: 'submit', label: 'Submit', run: actions.submit.mutateAsync },
      ]}
    />
  );
}
