import {
  SEA_EXPORT_KIND_STYLES,
  SEA_EXPORT_STAGES,
  type SeaExportStageId,
} from '../constants/seaExportWorkflow';

interface NvoccSeaExportFlowRailProps {
  current: SeaExportStageId;
  done?: Partial<Record<SeaExportStageId, boolean>>;
  band?: '1-2' | '3-4' | 'all';
  className?: string;
}

export function NvoccSeaExportFlowRail({
  current,
  done = {},
  band = 'all',
  className = '',
}: NvoccSeaExportFlowRailProps) {
  const stages = SEA_EXPORT_STAGES.filter((s) => band === 'all' || s.band === band);
  const currentIdx = stages.findIndex((s) => s.id === current);

  return (
    <div className={className}>
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-medium text-gray-800">NVOCC Sea Export Workflow</p>
        <p className="text-xs text-gray-500">
          {band === '1-2'
            ? 'Stage 1–2 · Quotation & booking'
            : band === '3-4'
              ? 'Stage 3–4 · Pickup, loading & delivery'
              : 'End-to-end · quote → report'}
        </p>
      </div>
      <ol className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {stages.map((stage, index) => {
          const styles = SEA_EXPORT_KIND_STYLES[stage.kind];
          const completed = Boolean(done[stage.id]) || (currentIdx >= 0 && index < currentIdx);
          const active = stage.id === current;
          return (
            <li
              key={stage.id}
              className="rounded-md border px-3 py-2 text-left transition-shadow"
              style={{
                background: styles.bg,
                borderColor: active ? '#0A2942' : styles.border,
                color: styles.text,
                boxShadow: active ? '0 0 0 2px rgba(10,41,66,0.25)' : undefined,
                opacity: completed && !active ? 0.72 : 1,
              }}
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-[11px] font-semibold uppercase tracking-wide opacity-80">
                  {index + 1}. {stage.owner}
                </span>
                {completed ? (
                  <span className="text-[10px] font-semibold uppercase opacity-80">Done</span>
                ) : active ? (
                  <span className="text-[10px] font-semibold uppercase">Now</span>
                ) : null}
              </div>
              <p className="mt-1 text-sm font-medium leading-snug">{stage.label}</p>
              {stage.detail ? (
                <p className="mt-0.5 text-[11px] leading-snug opacity-80">{stage.detail}</p>
              ) : null}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
