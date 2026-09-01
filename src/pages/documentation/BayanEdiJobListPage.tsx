import { DocumentationEdiJobListShell } from '@/features/documentation/components/DocumentationEdiJobListShell';
import { useBayanEdiActions, useBayanEdiJobs } from '@/features/documentation/hooks/useDocumentation';

export default function BayanEdiJobListPage() {
  const actions = useBayanEdiActions();

  return (
    <DocumentationEdiJobListShell
      title="Bayan EDI Job List (Master)"
      useList={useBayanEdiJobs}
      actions={[
        { key: 'generate', label: 'Generate', run: actions.generate.mutateAsync, pending: actions.generate.isPending },
        { key: 'submit', label: 'Submit', run: actions.submit.mutateAsync, pending: actions.submit.isPending },
        { key: 'amend', label: 'Amend', run: actions.amend.mutateAsync, pending: actions.amend.isPending },
      ]}
    />
  );
}
