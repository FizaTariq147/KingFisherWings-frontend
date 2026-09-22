import {
  CC_STAGES,
  type CcStageId,
} from '../constants/ccWorkflow';

interface CcFlowRailProps {
  current: CcStageId;
  done: Partial<Record<CcStageId, boolean>>;
}

export function CcFlowRail({ current, done }: CcFlowRailProps) {
  const idx = CC_STAGES.findIndex((s) => s.id === current);
  return (
    <ol className="flex flex-wrap gap-1.5 text-[11px]">
      {CC_STAGES.map((s, i) => {
        const complete = Boolean(done[s.id]) || (idx >= 0 && i < idx);
        const active = s.id === current;
        return (
          <li
            key={s.id}
            className={`rounded px-2 py-1 border ${
              active
                ? 'border-[var(--color-primary-400)] bg-[var(--color-primary-50)] text-[var(--color-primary-800)]'
                : complete
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                  : 'border-[var(--color-neutral-200)] text-[var(--color-neutral-500)]'
            }`}
          >
            <span className="font-medium">{s.owner}</span> · {s.label}
          </li>
        );
      })}
    </ol>
  );
}
