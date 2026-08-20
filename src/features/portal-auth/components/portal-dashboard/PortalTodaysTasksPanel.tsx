import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';
import type { PortalTaskItem } from '../../utils/portalDashboardFormat';
import { cn } from '@/lib/utils';

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
      <h2 className="mb-4 text-[15px] font-semibold text-[#0A2942]">Today&apos;s tasks</h2>

      {loading ? (
        <div className="space-y-2">
          <div className="h-8 animate-pulse rounded bg-[#EEF2F5]" />
          <div className="h-8 animate-pulse rounded bg-[#EEF2F5]" />
        </div>
      ) : tasks.length === 0 ? (
        <p className="rounded-xl bg-[#F4F7F9] px-3 py-6 text-center text-sm text-[#7A8A98]">
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
                    className={cn(
                      'text-sm leading-snug text-[#3D4F5F]',
                      done && 'text-[#9AA8B5] line-through',
                    )}
                  >
                    {task.label}
                  </Link>
                ) : (
                  <span
                    className={cn(
                      'text-sm leading-snug text-[#3D4F5F]',
                      done && 'text-[#9AA8B5] line-through',
                    )}
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
