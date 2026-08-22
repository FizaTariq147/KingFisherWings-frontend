import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, ListTodo } from 'lucide-react';
import type { PortalTaskItem } from '../../utils/portalDashboardFormat';
import { cn } from '@/lib/utils';
import { dashType } from '@/lib/dashboardTypography';

export function PortalTodaysTasksPanel({
  tasks,
  loading,
}: {
  tasks: PortalTaskItem[];
  loading: boolean;
}) {
  const [doneIds, setDoneIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    setDoneIds(new Set(tasks.filter((task) => task.done).map((task) => task.id)));
  }, [tasks]);

  const toggle = (id: string) => {
    setDoneIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <section className="rounded-[20px] bg-white p-5 shadow-[0_10px_30px_rgba(10,41,66,0.05)]">
      <div className="mb-4 flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#E8EEF4] text-[#0A2942]">
          <ListTodo className="h-4 w-4" aria-hidden="true" />
        </span>
        <h2 className={dashType.panel.title}>Today&apos;s tasks</h2>
      </div>

      {loading ? (
        <div className="space-y-2">
          <div className="h-8 animate-pulse rounded bg-[#EEF2F5]" />
          <div className="h-8 animate-pulse rounded bg-[#EEF2F5]" />
        </div>
      ) : tasks.length === 0 ? (
        <p className={dashType.panel.empty}>
          No tasks right now.
        </p>
      ) : (
        <ul className="space-y-3">
          {tasks.map((task) => {
            const done = doneIds.has(task.id);
            return (
              <li key={task.id} className="flex items-start gap-2.5">
                <button
                  type="button"
                  onClick={() => toggle(task.id)}
                  className={cn(
                    'mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[4px] border',
                    done
                      ? 'border-[#22C55E] bg-[#22C55E] text-white'
                      : 'border-[#C9D3DC] bg-white',
                  )}
                  aria-label={done ? 'Mark incomplete' : 'Mark complete'}
                >
                  {done ? <Check size={12} strokeWidth={3} /> : null}
                </button>
                {task.href ? (
                  <Link
                    to={task.href}
                    className={cn(dashType.panel.body, done && 'text-[var(--color-neutral-400)] line-through')}
                  >
                    {task.label}
                  </Link>
                ) : (
                  <span
                    className={cn(dashType.panel.body, done && 'text-[var(--color-neutral-400)] line-through')}
                  >
                    {task.label}
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
