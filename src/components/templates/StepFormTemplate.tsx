// PASTE THIS AT: src/components/templates/StepFormTemplate.tsx
// Generalized version of the tenant-creation wizard pattern — any multi-step
// form (New Quotation, New Job, New Employee, etc.) composes this.

import { type ReactNode, useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Check, ChevronLeft, ChevronRight } from 'lucide-react';

export interface FormStep {
  key: string;
  label: string;
  description?: string;
  icon?: LucideIcon;
  content: ReactNode;
  isValid?: () => boolean; // return false to block "Continue"
}

interface StepFormTemplateProps {
  title: string;
  subtitle?: string;
  steps: FormStep[];
  onSubmit: () => void | Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
  sidebar?: ReactNode; // live preview panel, e.g. a summary card
}

export function StepFormTemplate({
  title, subtitle, steps, onSubmit, onCancel, submitLabel = 'Submit', sidebar,
}: StepFormTemplateProps) {
  const [step, setStep] = useState(0);
  const [maxStep, setMaxStep] = useState(0);
  const [showError, setShowError] = useState(false);
  const current = steps[step];

  const goNext = async () => {
    if (current.isValid && !current.isValid()) { setShowError(true); return; }
    setShowError(false);
    if (step === steps.length - 1) { await onSubmit(); return; }
    setMaxStep((m) => Math.max(m, step + 1));
    setStep((s) => s + 1);
  };

  const goBack = () => { setShowError(false); setStep((s) => Math.max(0, s - 1)); };
  const jumpTo = (idx: number) => { if (idx <= maxStep) { setShowError(false); setStep(idx); } };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-navy">{title}</h1>
        {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-3">
          <div className="bg-white border border-slate-200 rounded-2xl p-4">
            {steps.map((s, idx) => {
              const Icon = s.icon;
              const isDone = idx < step;
              const isCurrent = idx === step;
              const clickable = idx <= maxStep;
              return (
                <button
                  key={s.key}
                  onClick={() => jumpTo(idx)}
                  disabled={!clickable}
                  className={`w-full flex gap-3 text-left p-2.5 rounded-xl transition-colors ${
                    isCurrent ? 'bg-brandOrange/10' : clickable ? 'hover:bg-surface' : 'opacity-50 cursor-not-allowed'
                  }`}
                >
                  <span className={`flex items-center justify-center h-8 w-8 rounded-full text-xs font-semibold shrink-0 ${
                    isCurrent ? 'bg-brandOrange text-white' : isDone ? 'bg-navy text-white' : 'bg-white border-2 border-slate-300 text-slate-400'
                  }`}>
                    {isDone ? <Check className="h-4 w-4" /> : Icon ? <Icon className="h-4 w-4" /> : idx + 1}
                  </span>
                  <span>
                    <span className={`block text-sm font-medium ${isCurrent ? 'text-navy' : 'text-slate-600'}`}>{s.label}</span>
                    {s.description && <span className="block text-xs text-slate-400 mt-0.5">{s.description}</span>}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className={sidebar ? 'lg:col-span-6' : 'lg:col-span-9'}>
          <div className="bg-white border border-slate-200 rounded-2xl p-8">
            {current.content}
            {showError && (
              <p className="mt-3 text-xs text-rose-600">Please complete the required fields before continuing.</p>
            )}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-100">
              <button
                onClick={step === 0 ? onCancel : goBack}
                className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors"
              >
                {step === 0 ? 'Cancel' : (<><ChevronLeft className="h-4 w-4" /> Back</>)}
              </button>
              <button
                onClick={goNext}
                className="flex items-center gap-1.5 rounded-lg bg-brandOrange hover:bg-brandOrange-700 text-white text-sm font-semibold px-5 py-2.5 transition-colors"
              >
                {step === steps.length - 1 ? submitLabel : 'Continue'}
                {step < steps.length - 1 && <ChevronRight className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>

        {sidebar && <div className="lg:col-span-3">{sidebar}</div>}
      </div>
    </div>
  );
}