import { DocumentationEdiJobListShell } from '@/features/documentation/components/DocumentationEdiJobListShell';
import { useIalEdiActions, useIalEdiJobs } from '@/features/documentation/hooks/useDocumentation';

export default function IalEdiJobListPage() {
  const actions = useIalEdiActions();
  return (
    <DocumentationEdiJobListShell
      title="IAL EDI Job List"
      useList={useIalEdiJobs}
      actions={[
        { key: 'generate', label: 'Generate', run: actions.generate.mutateAsync },
        { key: 'submit', label: 'Submit', run: actions.submit.mutateAsync },
      ]}
    />
  );
}
