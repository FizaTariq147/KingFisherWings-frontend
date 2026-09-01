import { useRef, useState } from 'react';
import { PageBackLink } from '@/components/ui/PageBackLink';
import { Button } from '@/components/ui/Button';
import { useJobTransferActions } from '@/features/documentation/hooks/useDocumentation';
import { extractAxiosErrorDetail } from '@/lib/extractAxiosErrorDetail';

export default function JobDownloadPage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const actions = useJobTransferActions();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="space-y-3">
      <PageBackLink to="/documentation" label="Back to Documentation" />
      <div className="rounded-md border border-gray-200 bg-white p-5 space-y-4">
        <h2 className="text-[17px] font-medium text-gray-800">Job Download / Transfer</h2>
        <p className="text-sm text-gray-500">
          Export jobs for branch transfer, or import a job package exported from another branch.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button type="button" disabled={actions.exportJobs.isPending} onClick={() => void actions.exportJobs.mutateAsync({})}>
            Export jobs
          </Button>
          <Button type="button" onClick={() => inputRef.current?.click()}>Import jobs</Button>
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            accept=".zip,.json"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              setError(null);
              setMessage(null);
              try {
                await actions.importJobs.mutateAsync(file);
                setMessage('Jobs imported successfully.');
              } catch (err) {
                setError(extractAxiosErrorDetail(err));
              }
              e.target.value = '';
            }}
          />
        </div>
        {message ? <p className="text-sm text-emerald-700">{message}</p> : null}
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
      </div>
    </div>
  );
}
