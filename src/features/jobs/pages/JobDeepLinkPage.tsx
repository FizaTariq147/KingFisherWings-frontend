import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { AppLoadingState } from '@/components/motion';
import { isUuid } from '@/lib/isUuid';
import { jobService } from '../services/job.service';
import { jobDetailPath } from '../utils/jobRoute';

/**
 * BE / notifications often link `/jobs/:id` without a segment prefix.
 * Staff routes only exist under `/jobs/{air-export|…}/:id` — resolve type then redirect.
 */
export default function JobDeepLinkPage() {
  const { id = '' } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const tab = searchParams.get('tab') || undefined;

    if (!id.trim() || !isUuid(id)) {
      navigate('/jobs/all', { replace: true });
      return;
    }

    void (async () => {
      try {
        const job = await jobService.getById(id);
        if (cancelled) return;
        navigate(jobDetailPath({ id: job.id, job_type: job.job_type }, tab ? { tab } : undefined), {
          replace: true,
        });
      } catch {
        if (cancelled) return;
        setError('Job not found.');
        navigate('/jobs/all', { replace: true });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id, navigate, searchParams]);

  if (error) {
    return <p className="p-6 text-sm text-[var(--color-danger-600)]">{error}</p>;
  }

  return <AppLoadingState label="Opening job…" />;
}
