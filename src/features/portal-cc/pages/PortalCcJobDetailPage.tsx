import { useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { PortalApiError } from '@/lib/portalApiClient';
import { PortalPageHeader, PortalPanel } from '@/features/portal-auth/components/portal-ui';
import {
  usePortalCcChecklist,
  usePortalCcJob,
  usePortalCcUpload,
} from '../hooks/usePortalCc';

export default function PortalCcJobDetailPage() {
  const { id = '' } = useParams();
  const jobQuery = usePortalCcJob(id);
  const checklistQuery = usePortalCcChecklist(id);
  const upload = usePortalCcUpload(id);
  const fileRef = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const job = jobQuery.data;
  const checklist = checklistQuery.data ?? [];

  const onUpload = async () => {
    const file = fileRef.current?.files?.[0];
    if (!file) {
      setErr('Choose a file first.');
      return;
    }
    setErr(null);
    setMsg(null);
    try {
      const form = new FormData();
      form.append('file', file);
      await upload.mutateAsync(form);
      setMsg(`Uploaded ${file.name}`);
      if (fileRef.current) fileRef.current.value = '';
      await checklistQuery.refetch();
    } catch (e) {
      setErr(e instanceof PortalApiError ? e.message : e instanceof Error ? e.message : String(e));
    }
  };

  return (
    <div className="space-y-4">
      <PortalPageHeader
        title={job?.job_number || 'CC job'}
        description={[job?.stage, job?.status].filter(Boolean).join(' · ') || 'Customs clearance'}
      />
      <p className="text-sm">
        <Link to="/portal/cc-jobs" className="underline">
          ← All CC jobs
        </Link>
      </p>

      {jobQuery.isLoading ? <p className="text-sm opacity-70">Loading…</p> : null}
      {jobQuery.isError ? (
        <p className="text-sm text-red-600">
          {jobQuery.error instanceof PortalApiError
            ? jobQuery.error.message
            : 'Could not load job.'}
        </p>
      ) : null}

      {job ? (
        <PortalPanel>
          <h2 className="mb-2 text-sm font-semibold">Job</h2>
          <dl className="grid gap-2 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-xs opacity-60">Number</dt>
              <dd>{job.job_number || job.id}</dd>
            </div>
            <div>
              <dt className="text-xs opacity-60">Status</dt>
              <dd>{job.status || '—'}</dd>
            </div>
            <div>
              <dt className="text-xs opacity-60">Stage</dt>
              <dd>{job.stage || '—'}</dd>
            </div>
            {job.notes ? (
              <div className="sm:col-span-2">
                <dt className="text-xs opacity-60">Notes</dt>
                <dd>{job.notes}</dd>
              </div>
            ) : null}
          </dl>
        </PortalPanel>
      ) : null}

      <PortalPanel>
        <h2 className="mb-2 text-sm font-semibold">Checklist</h2>
        {checklistQuery.isLoading ? <p className="text-sm opacity-70">Loading…</p> : null}
        <ul className="space-y-2 text-sm">
          {checklist.map((item) => (
            <li key={item.id} className="flex justify-between gap-2 border-b border-black/5 py-2">
              <span>
                {item.label || item.code || item.id.slice(0, 8)}
                {item.required ? <span className="ml-1 text-xs text-amber-700">*</span> : null}
              </span>
              <span className="text-xs opacity-70">
                {item.status || (item.completed ? 'done' : 'pending')}
              </span>
            </li>
          ))}
          {!checklistQuery.isLoading && checklist.length === 0 ? (
            <li className="opacity-70">No checklist items.</li>
          ) : null}
        </ul>
      </PortalPanel>

      <PortalPanel>
        <h2 className="mb-2 text-sm font-semibold">Upload document</h2>
        <div className="flex flex-wrap items-center gap-2">
          <input ref={fileRef} type="file" className="text-sm" />
          <button
            type="button"
            className="rounded bg-black px-3 py-1.5 text-sm text-white disabled:opacity-50"
            disabled={upload.isPending}
            onClick={() => void onUpload()}
          >
            {upload.isPending ? 'Uploading…' : 'Upload'}
          </button>
        </div>
        {err ? <p className="mt-2 text-sm text-red-600">{err}</p> : null}
        {msg ? <p className="mt-2 text-sm text-emerald-700">{msg}</p> : null}
      </PortalPanel>
    </div>
  );
}
