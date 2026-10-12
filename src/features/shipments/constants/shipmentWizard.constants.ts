export const SHIPMENT_WIZARD_STEPS = [
  { key: 'create', label: 'Create Shipment' },
  { key: 'ports', label: 'Port Details' },
  { key: 'consignment', label: 'Container / Consignment' },
  { key: 'costing', label: 'Costing' },
  { key: 'summary', label: 'Summary' },
] as const;

export type ShipmentWizardStepKey = (typeof SHIPMENT_WIZARD_STEPS)[number]['key'];

export const SHIPMENT_WIZARD_STEP_COUNT = SHIPMENT_WIZARD_STEPS.length;

export function shipmentWizardStepKey(index: number): ShipmentWizardStepKey | undefined {
  return SHIPMENT_WIZARD_STEPS[index]?.key;
}

export function isShipmentWizardLastStep(index: number): boolean {
  return index >= SHIPMENT_WIZARD_STEP_COUNT - 1;
}

export const SHIPMENT_CREATE_DRAFT_KEY = 'shipment-create-draft';
