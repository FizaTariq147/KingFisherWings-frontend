import { useState } from 'react';
import type { Job } from '../types/job.types';

export type JobConfirmAction = 'cancel' | 'close' | 'delete';

export function useJobConfirmState() {
  const [confirm, setConfirm] = useState<{
    action: JobConfirmAction;
    job: Job;
  } | null>(null);

  const requestConfirm = (action: JobConfirmAction, job: Job) => setConfirm({ action, job });
  const closeConfirm = () => setConfirm(null);

  return { confirm, requestConfirm, closeConfirm };
}
