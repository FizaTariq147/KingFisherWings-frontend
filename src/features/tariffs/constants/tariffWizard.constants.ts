export const TARIFF_WIZARD_STEPS = [
  { key: 'create', label: 'Service type' },
  { key: 'ports', label: 'Port Details' },
  { key: 'charge', label: 'Charge / Unit' },
  { key: 'costing', label: 'Pricing' },
  { key: 'summary', label: 'Summary' },
] as const;

export type TariffWizardStepKey = (typeof TARIFF_WIZARD_STEPS)[number]['key'];

export const TARIFF_WIZARD_STEP_COUNT = TARIFF_WIZARD_STEPS.length;

export function tariffWizardStepKey(index: number): TariffWizardStepKey | undefined {
  return TARIFF_WIZARD_STEPS[index]?.key;
}

export function isTariffWizardLastStep(index: number): boolean {
  return index >= TARIFF_WIZARD_STEP_COUNT - 1;
}
