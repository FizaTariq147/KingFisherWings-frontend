import { DocumentationEdiJobListShell } from '@/features/documentation/components/DocumentationEdiJobListShell';
import { useCcnEdiActions, useCcnEdiJobs } from '@/features/documentation/hooks/useDocumentation';

export default function CcnFwbFhlEdiJobListPage() {
  const actions = useCcnEdiActions();

  return (
    <DocumentationEdiJobListShell
      title="CCN FWB/FHL EDI Job List"
      useList={useCcnEdiJobs}
      actions={[
        { key: 'fwb', label: 'Generate FWB', run: actions.generateFwb.mutateAsync },
        { key: 'fhl', label: 'Generate FHL', run: actions.generateFhl.mutateAsync },
        { key: 'submit', label: 'Submit', run: actions.submit.mutateAsync },
      ]}
    />
  );
}
