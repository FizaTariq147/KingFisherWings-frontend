import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { PageBackLink } from '@/components/ui/PageBackLink';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Plus } from 'lucide-react';
import { hrService } from '@/features/hr/services/hr.service';
import type { EvaluationRecord } from '@/features/hr/types/hr.types';
import {
  createEvaluationSchema,
  evaluationCycleSchema,
  evaluationTemplateSchema,
  parseWithFieldErrors,
  type FieldErrors,
} from '@/features/hr/schemas/hr.schema';

type Tab = 'templates' | 'cycles' | 'evaluations';

const DEFAULT_KPIS = JSON.stringify(
  [{ id: 'quality', name: 'Quality of work', weight: 40 }, { id: 'teamwork', name: 'Teamwork', weight: 30 }, { id: 'initiative', name: 'Initiative', weight: 30 }],
  null,
  2,
);

function isEvaluationFinalized(ev: EvaluationRecord): boolean {
  return /FINALIZED|COMPLETE|CLOSED/i.test(ev.status);
}

function isManagerSubmitted(ev: EvaluationRecord): boolean {
  return Boolean(ev.manager_submitted || ev.manager_score != null);
}

function isSelfSubmitted(ev: EvaluationRecord): boolean {
  return Boolean(ev.self_submitted || ev.self_score != null);
}

function formatEvaluationScore(ev: EvaluationRecord, kind: 'self' | 'manager'): string {
  const score = kind === 'self' ? ev.self_score : ev.manager_score;
  if (score != null) return String(score);
  const submitted = kind === 'self' ? isSelfSubmitted(ev) : isManagerSubmitted(ev);
  return submitted ? 'Submitted' : '—';
}

export default function EvaluationsPage() {
  const queryClient = useQueryClient();
  const year = new Date().getFullYear();
  const [tab, setTab] = useState<Tab>('evaluations');
  const [cycleFilter, setCycleFilter] = useState('');
  const [employeeFilter, setEmployeeFilter] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const [templateOpen, setTemplateOpen] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [kpisJson, setKpisJson] = useState(DEFAULT_KPIS);

  const [cycleOpen, setCycleOpen] = useState(false);
  const [cycleName, setCycleName] = useState('');
  const [cycleTemplateId, setCycleTemplateId] = useState('');
  const [cycleYear, setCycleYear] = useState(String(year));
  const [cycleStart, setCycleStart] = useState(`${year}-01-01`);
  const [cycleEnd, setCycleEnd] = useState(`${year}-12-31`);

  const [evalOpen, setEvalOpen] = useState(false);
  const [evalCycleId, setEvalCycleId] = useState('');
  const [evalEmployeeId, setEvalEmployeeId] = useState('');

  const [scoreOpen, setScoreOpen] = useState<string | null>(null);
  const [scoreMode, setScoreMode] = useState<'self' | 'manager'>('self');
  const [scoresJson, setScoresJson] = useState('{"quality":4,"teamwork":4,"initiative":3}');
  const [scoreComments, setScoreComments] = useState('');

  const { data: employees = [] } = useQuery({
    queryKey: ['hr', 'employees', 'evaluations'],
    queryFn: () => hrService.listEmployees({ limit: 100, status: 'ACTIVE' }),
  });

  const employeeNameById = useMemo(
    () => new Map(employees.map((employee) => [employee.id, employee.name])),
    [employees],
  );

  const { data: templates = [] } = useQuery({
    queryKey: ['hr', 'evaluation-templates'],
    queryFn: () => hrService.listEvaluationTemplates(),
  });

  const { data: cycles = [] } = useQuery({
    queryKey: ['hr', 'evaluation-cycles', year],
    queryFn: () => hrService.listEvaluationCycles(year),
  });

  const { data: evaluations = [], isLoading } = useQuery({
    queryKey: ['hr', 'evaluations', cycleFilter, employeeFilter],
    queryFn: () => hrService.listEvaluations(cycleFilter, employeeFilter),
    enabled: Boolean(cycleFilter && employeeFilter),
  });

  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: ['hr', 'evaluation-templates'] });
    void queryClient.invalidateQueries({ queryKey: ['hr', 'evaluation-cycles'] });
    void queryClient.invalidateQueries({ queryKey: ['hr', 'evaluations'] });
  };

  const saveTemplate = useMutation({
    mutationFn: async () => {
      const parsed = parseWithFieldErrors(evaluationTemplateSchema, { name: templateName.trim(), kpisJson });
      if (!parsed.success) throw new Error(parsed.message);
      let kpis: Record<string, unknown>[];
      try {
        const raw = JSON.parse(parsed.data.kpisJson);
        if (!Array.isArray(raw)) throw new Error('KPIs must be a JSON array.');
        kpis = raw as Record<string, unknown>[];
      } catch {
        throw new Error('KPIs must be valid JSON array.');
      }
      await hrService.createEvaluationTemplate({ name: parsed.data.name, kpis });
    },
    onSuccess: () => {
      setTemplateOpen(false);
      setTemplateName('');
      setFieldErrors({});
      refresh();
    },
    onError: (err) => setActionError(err instanceof Error ? err.message : 'Could not save template.'),
  });

  const saveCycle = useMutation({
    mutationFn: async () => {
      const parsed = parseWithFieldErrors(evaluationCycleSchema, {
        template_id: cycleTemplateId,
        name: cycleName.trim(),
        year: Number(cycleYear),
        start_date: cycleStart,
        end_date: cycleEnd,
      });
      if (!parsed.success) {
        setFieldErrors(parsed.fieldErrors);
        throw new Error(parsed.message);
      }
      await hrService.createEvaluationCycle({
        template_id: parsed.data.template_id,
        name: parsed.data.name,
        year: parsed.data.year!,
        start_date: parsed.data.start_date!,
        end_date: parsed.data.end_date!,
      });
    },
    onSuccess: () => {
      setCycleOpen(false);
      setCycleName('');
      setFieldErrors({});
      refresh();
    },
    onError: (err) => setActionError(err instanceof Error ? err.message : 'Could not save cycle.'),
  });

  const saveEval = useMutation({
    mutationFn: async () => {
      const parsed = parseWithFieldErrors(createEvaluationSchema, {
        cycle_id: evalCycleId,
        employee_id: evalEmployeeId,
      });
      if (!parsed.success) {
        setFieldErrors(parsed.fieldErrors);
        throw new Error(parsed.message);
      }
      await hrService.createEvaluation(parsed.data);
    },
    onSuccess: () => {
      setEvalOpen(false);
      setFieldErrors({});
      if (evalCycleId) setCycleFilter(evalCycleId);
      if (evalEmployeeId) setEmployeeFilter(evalEmployeeId);
      refresh();
    },
    onError: (err) => setActionError(err instanceof Error ? err.message : 'Could not create evaluation.'),
  });

  const submitScores = useMutation({
    mutationFn: async (id: string) => {
      let scores: Record<string, number>;
      try {
        scores = JSON.parse(scoresJson) as Record<string, number>;
      } catch {
        throw new Error('Scores must be valid JSON object.');
      }
      if (!scores || typeof scores !== 'object' || Array.isArray(scores) || !Object.keys(scores).length) {
        throw new Error('Enter at least one KPI score.');
      }
      for (const [key, value] of Object.entries(scores)) {
        if (typeof value !== 'number' || !Number.isFinite(value)) {
          throw new Error(`Score for "${key}" must be a number.`);
        }
      }
      const dto = { scores, comments: scoreComments.trim() || undefined };
      if (scoreMode === 'self') await hrService.submitSelfEvaluation(id, dto);
      else await hrService.submitManagerEvaluation(id, dto);
    },
    onSuccess: () => {
      setScoreOpen(null);
      setActionError(null);
      setActionMessage(
        scoreMode === 'manager'
          ? 'Manager evaluation submitted. You can now finalize this evaluation.'
          : 'Self evaluation submitted. Next: submit the manager score, then finalize.',
      );
      refresh();
    },
    onError: (err) => setActionError(err instanceof Error ? err.message : 'Could not submit scores.'),
  });

  const finalize = useMutation({
    mutationFn: (ev: EvaluationRecord) => {
      if (isEvaluationFinalized(ev)) {
        throw new Error('This evaluation is already finalized.');
      }
      if (!isManagerSubmitted(ev)) {
        throw new Error('Submit the manager score before finalizing this evaluation.');
      }
      return hrService.finalizeEvaluation(ev.id);
    },
    onSuccess: () => {
      setActionError(null);
      setActionMessage('Evaluation finalized.');
      refresh();
    },
    onError: (err) => setActionError(err instanceof Error ? err.message : 'Finalize failed.'),
  });

  const tabs: { key: Tab; label: string }[] = [
    { key: 'evaluations', label: 'Evaluations' },
    { key: 'cycles', label: 'Cycles' },
    { key: 'templates', label: 'Templates' },
  ];

  return (
    <div className="space-y-4">
      <PageBackLink to="/hr" label="Back to HR" />
      <h1 className="text-lg font-semibold text-gray-800">Performance Evaluations</h1>

      <div className="flex gap-2 border-b">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            className={`px-4 py-2 text-sm border-b-2 -mb-px ${
              tab === t.key ? 'border-[#0A2942] font-medium text-[#0A2942]' : 'border-transparent text-gray-500'
            }`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {actionError && <p className="text-sm text-red-600">{actionError}</p>}
      {actionMessage && <p className="text-sm text-green-700">{actionMessage}</p>}

      {tab === 'templates' && (
        <div className="space-y-3">
          <Button type="button" onClick={() => setTemplateOpen(true)}>
            <Plus size={14} className="mr-1" />
            New template
          </Button>
          <div className="bg-white border rounded-md overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left px-4 py-2 font-semibold text-[#0A2942]">Name</th>
                  <th className="text-left px-4 py-2 font-semibold text-[#0A2942]">KPIs</th>
                </tr>
              </thead>
              <tbody>
                {templates.map((tpl) => (
                  <tr key={tpl.id} className="border-b border-gray-100">
                    <td className="px-4 py-2">{tpl.name}</td>
                    <td className="px-4 py-2">{tpl.kpis.length} KPI(s)</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'cycles' && (
        <div className="space-y-3">
          <Button type="button" onClick={() => setCycleOpen(true)}>
            <Plus size={14} className="mr-1" />
            New cycle
          </Button>
          <div className="bg-white border rounded-md overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  {['Name', 'Year', 'Start', 'End', 'Status'].map((col) => (
                    <th key={col} className="text-left px-4 py-2 font-semibold text-[#0A2942]">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {cycles.map((cycle) => (
                  <tr key={cycle.id} className="border-b border-gray-100">
                    <td className="px-4 py-2">{cycle.name}</td>
                    <td className="px-4 py-2">{cycle.year}</td>
                    <td className="px-4 py-2">{cycle.start_date}</td>
                    <td className="px-4 py-2">{cycle.end_date}</td>
                    <td className="px-4 py-2">{cycle.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'evaluations' && (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-3 items-end">
            <label className="text-sm flex flex-col gap-1">
              Cycle
              <select
                className="border rounded px-2 py-1.5 min-w-[180px]"
                value={cycleFilter}
                onChange={(e) => setCycleFilter(e.target.value)}
              >
                <option value="">Select cycle…</option>
                {cycles.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm flex flex-col gap-1">
              Employee
              <select
                className="border rounded px-2 py-1.5 min-w-[180px]"
                value={employeeFilter}
                onChange={(e) => setEmployeeFilter(e.target.value)}
              >
                <option value="">Select employee…</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name}
                  </option>
                ))}
              </select>
            </label>
            <Button type="button" onClick={() => setEvalOpen(true)}>
              <Plus size={14} className="mr-1" />
              New evaluation
            </Button>
          </div>

          {!cycleFilter || !employeeFilter ? (
            <p className="text-sm text-gray-500">Select cycle and employee to view evaluations.</p>
          ) : isLoading ? (
            <p className="text-sm text-gray-500">Loading…</p>
          ) : (
            <div className="bg-white border rounded-md overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    {['Employee', 'Status', 'Self', 'Manager', 'Actions'].map((col) => (
                      <th key={col} className="text-left px-4 py-2 font-semibold text-[#0A2942]">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {evaluations.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-6 text-gray-500 text-center">
                        No evaluations yet.
                      </td>
                    </tr>
                  ) : (
                    evaluations.map((ev) => (
                      <tr key={ev.id} className="border-b border-gray-100">
                        <td className="px-4 py-2">
                          {employeeNameById.get(ev.employee_id) || ev.employee}
                        </td>
                        <td className="px-4 py-2">{ev.status}</td>
                        <td className="px-4 py-2">{formatEvaluationScore(ev, 'self')}</td>
                        <td className="px-4 py-2">{formatEvaluationScore(ev, 'manager')}</td>
                        <td className="px-4 py-2 flex gap-2 flex-wrap">
                          {!isEvaluationFinalized(ev) ? (
                            <>
                              <button
                                type="button"
                                className="text-xs text-blue-700 hover:underline disabled:opacity-50"
                                disabled={submitScores.isPending}
                                onClick={() => {
                                  setActionError(null);
                                  setScoreMode('self');
                                  setScoreOpen(ev.id);
                                }}
                              >
                                Self score
                              </button>
                              <button
                                type="button"
                                className="text-xs text-indigo-700 hover:underline disabled:opacity-50"
                                disabled={submitScores.isPending}
                                onClick={() => {
                                  setActionError(null);
                                  setScoreMode('manager');
                                  setScoreOpen(ev.id);
                                }}
                              >
                                Manager score
                              </button>
                              <button
                                type="button"
                                className="text-xs text-green-700 hover:underline disabled:opacity-50"
                                disabled={finalize.isPending || !isManagerSubmitted(ev)}
                                title={
                                  isManagerSubmitted(ev)
                                    ? 'Finalize this evaluation'
                                    : 'Submit manager score first'
                                }
                                onClick={() => finalize.mutate(ev)}
                              >
                                Finalize
                              </button>
                            </>
                          ) : (
                            <span className="text-xs text-gray-500">Finalized</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      <Modal open={templateOpen} onClose={() => setTemplateOpen(false)} title="New evaluation template">
        <div className="space-y-3">
          <label className="text-sm block">
            Name
            <input
              className="mt-1 w-full border rounded px-2 py-1.5"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
            />
          </label>
          <label className="text-sm block">
            KPIs (JSON array)
            <textarea
              className="mt-1 w-full border rounded px-2 py-1.5 font-mono text-xs"
              rows={6}
              value={kpisJson}
              onChange={(e) => setKpisJson(e.target.value)}
            />
          </label>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setTemplateOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={() => saveTemplate.mutate()} disabled={saveTemplate.isPending}>
              Save
            </Button>
          </div>
        </div>
      </Modal>

      <Modal open={cycleOpen} onClose={() => setCycleOpen(false)} title="New evaluation cycle">
        <div className="space-y-3">
          <label className="text-sm block">
            Template
            <select
              className="mt-1 w-full border rounded px-2 py-1.5"
              value={cycleTemplateId}
              onChange={(e) => setCycleTemplateId(e.target.value)}
            >
              <option value="">Select…</option>
              {templates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
            {fieldErrors.template_id && <span className="text-red-600 text-xs">{fieldErrors.template_id}</span>}
          </label>
          <label className="text-sm block">
            Name
            <input className="mt-1 w-full border rounded px-2 py-1.5" value={cycleName} onChange={(e) => setCycleName(e.target.value)} />
          </label>
          <label className="text-sm block">
            Year
            <input type="number" className="mt-1 w-full border rounded px-2 py-1.5" value={cycleYear} onChange={(e) => setCycleYear(e.target.value)} />
          </label>
          <label className="text-sm block">
            Start date
            <input type="date" className="mt-1 w-full border rounded px-2 py-1.5" value={cycleStart} onChange={(e) => setCycleStart(e.target.value)} />
          </label>
          <label className="text-sm block">
            End date
            <input type="date" className="mt-1 w-full border rounded px-2 py-1.5" value={cycleEnd} onChange={(e) => setCycleEnd(e.target.value)} />
          </label>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setCycleOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={() => saveCycle.mutate()} disabled={saveCycle.isPending}>
              Save
            </Button>
          </div>
        </div>
      </Modal>

      <Modal open={evalOpen} onClose={() => setEvalOpen(false)} title="New evaluation">
        <div className="space-y-3">
          <label className="text-sm block">
            Cycle
            <select className="mt-1 w-full border rounded px-2 py-1.5" value={evalCycleId} onChange={(e) => setEvalCycleId(e.target.value)}>
              <option value="">Select…</option>
              {cycles.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm block">
            Employee
            <select className="mt-1 w-full border rounded px-2 py-1.5" value={evalEmployeeId} onChange={(e) => setEvalEmployeeId(e.target.value)}>
              <option value="">Select…</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name}
                </option>
              ))}
            </select>
          </label>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setEvalOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={() => saveEval.mutate()} disabled={saveEval.isPending}>
              Create
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        open={Boolean(scoreOpen)}
        onClose={() => setScoreOpen(null)}
        title={scoreMode === 'self' ? 'Submit self evaluation' : 'Submit manager evaluation'}
      >
        <div className="space-y-3">
          {scoreMode === 'manager' ? (
            <p className="text-xs text-gray-500">
              Manager submission is required before you can finalize this evaluation.
            </p>
          ) : null}
          <label className="text-sm block">
            Scores (JSON: KPI id → score)
            <textarea
              className="mt-1 w-full border rounded px-2 py-1.5 font-mono text-xs"
              rows={4}
              value={scoresJson}
              onChange={(e) => setScoresJson(e.target.value)}
            />
          </label>
          <label className="text-sm block">
            Comments
            <textarea className="mt-1 w-full border rounded px-2 py-1.5" rows={2} value={scoreComments} onChange={(e) => setScoreComments(e.target.value)} />
          </label>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setScoreOpen(null)}>
              Cancel
            </Button>
            <Button type="button" onClick={() => scoreOpen && submitScores.mutate(scoreOpen)} disabled={submitScores.isPending}>
              Submit
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
