import { useState } from 'react';
import { Card, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';

type QuoteMode = 'Air' | 'Sea' | 'Road';
type ServiceType = 'FCL' | 'LCL' | 'Express' | 'Standard' | 'FTL' | 'LTL';

interface FormStep {
  id: number;
  label: string;
  description: string;
}

interface ChargeRow {
  id: string;
  description: string;
  category: 'Origin' | 'Freight' | 'Destination' | 'Other';
  quantity: number;
  unit: string;
  rate: number;
  currency: string;
}

const steps: FormStep[] = [
  { id: 1, label: 'Basic Info',  description: 'Client & shipment details' },
  { id: 2, label: 'Route',       description: 'Origin, destination & carrier' },
  { id: 3, label: 'Cargo',       description: 'Cargo specifications' },
  { id: 4, label: 'Charges',     description: 'Build the rate sheet' },
  { id: 5, label: 'Review',      description: 'Preview & send' },
];

const defaultCharges: ChargeRow[] = [
  { id: '1', description: 'Freight Charges',   category: 'Freight',     quantity: 1, unit: 'KG',  rate: 0, currency: 'AED' },
  { id: '2', description: 'Fuel Surcharge',    category: 'Freight',     quantity: 1, unit: 'KG',  rate: 0, currency: 'AED' },
  { id: '3', description: 'Origin Handling',   category: 'Origin',      quantity: 1, unit: 'SHP', rate: 0, currency: 'AED' },
  { id: '4', description: 'Documentation Fee', category: 'Other',       quantity: 1, unit: 'BL',  rate: 0, currency: 'AED' },
];

const customers  = ['Al Futtaim LLC', 'Jumeirah Group', 'DP World', 'Emirates Airlines', 'Noon.com', 'Carrefour UAE'];
const incoterms  = ['EXW', 'FCA', 'FOB', 'CFR', 'CIF', 'CPT', 'CIP', 'DAP', 'DPU', 'DDP'];
const currencies = ['AED', 'USD', 'EUR', 'GBP', 'SAR'];
const units      = ['KG', 'CBM', 'PCS', 'SHP', 'BL', 'CNT'];
const categories = ['Origin', 'Freight', 'Destination', 'Other'] as const;

const categoryColors: Record<string, string> = {
  Origin:      'text-blue-700 bg-blue-50',
  Freight:     'text-purple-700 bg-purple-50',
  Destination: 'text-orange-700 bg-orange-50',
  Other:       'text-gray-700 bg-gray-50',
};

export default function CreateQuotationForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [mode, setMode]               = useState<QuoteMode | ''>('');
  const [serviceType, setServiceType] = useState<ServiceType | ''>('');
  const [charges, setCharges]         = useState<ChargeRow[]>(defaultCharges);
  const [validDays, setValidDays]     = useState('30');

  function next() { if (currentStep < steps.length) setCurrentStep(s => s + 1); }
  function prev() { if (currentStep > 1) setCurrentStep(s => s - 1); }

  function addCharge() {
    setCharges((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        description: '',
        category: 'Other',
        quantity: 1,
        unit: 'SHP',
        rate: 0,
        currency: 'AED',
      },
    ]);
  }

  function removeCharge(id: string) {
    setCharges((prev) => prev.filter((c) => c.id !== id));
  }

  function updateCharge(id: string, field: keyof ChargeRow, value: string | number) {
    setCharges((prev) =>
      prev.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    );
  }

  const total = charges.reduce((s, c) => s + c.quantity * c.rate, 0);

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-[var(--color-neutral-800)]">New Quotation</h1>
          <p className="text-sm text-[var(--color-neutral-400)]">Step {currentStep} of {steps.length}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary">Save Draft</Button>
          <Button variant="ghost">Cancel</Button>
        </div>
      </div>

      {/* Step Progress */}
      <div className="flex items-center gap-0">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${
                step.id < currentStep
                  ? 'bg-[var(--color-success-500)] text-white'
                  : step.id === currentStep
                  ? 'bg-[var(--color-primary-500)] text-white'
                  : 'bg-[var(--color-neutral-100)] text-[var(--color-neutral-400)]'
              }`}>
                {step.id < currentStep ? '✓' : step.id}
              </div>
              <p className={`text-xs mt-1 font-medium whitespace-nowrap ${
                step.id === currentStep  ? 'text-[var(--color-primary-600)]'  :
                step.id < currentStep   ? 'text-[var(--color-success-500)]'   :
                'text-[var(--color-neutral-400)]'
              }`}>
                {step.label}
              </p>
            </div>
            {index < steps.length - 1 && (
              <div className={`flex-1 h-0.5 mx-2 mb-4 ${
                step.id < currentStep ? 'bg-[var(--color-success-500)]' : 'bg-[var(--color-neutral-200)]'
              }`} />
            )}
          </div>
        ))}
      </div>

      {/* Step 1 — Basic Info */}
      {currentStep === 1 && (
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Client Information</CardTitle></CardHeader>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-[var(--color-neutral-600)]">Client *</label>
                <select className="h-9 rounded-md border border-[var(--color-neutral-200)] px-3 text-sm focus:outline-none focus:border-[var(--color-primary-500)]">
                  <option value="">-- Select client --</option>
                  {customers.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-[var(--color-neutral-600)]">Contact Person</label>
                <input type="text" className="h-9 rounded-md border border-[var(--color-neutral-200)] px-3 text-sm focus:outline-none focus:border-[var(--color-primary-500)]" placeholder="Contact name..." />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-[var(--color-neutral-600)]">Email</label>
                <input type="email" className="h-9 rounded-md border border-[var(--color-neutral-200)] px-3 text-sm focus:outline-none focus:border-[var(--color-primary-500)]" placeholder="client@company.com" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-[var(--color-neutral-600)]">Phone</label>
                <input type="text" className="h-9 rounded-md border border-[var(--color-neutral-200)] px-3 text-sm focus:outline-none focus:border-[var(--color-primary-500)]" placeholder="+971..." />
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader><CardTitle>Mode of Transport *</CardTitle></CardHeader>
            <div className="grid grid-cols-3 gap-4">
              {(['Air', 'Sea', 'Road'] as QuoteMode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => { setMode(m); setServiceType(''); }}
                  className={`p-5 rounded-xl border-2 transition-all text-center ${
                    mode === m
                      ? 'border-[var(--color-primary-500)] bg-[var(--color-primary-50)]'
                      : 'border-[var(--color-neutral-200)] hover:border-[var(--color-primary-200)]'
                  }`}
                >
                  <div className="text-3xl mb-2">
                    {m === 'Air' ? '✈️' : m === 'Sea' ? '🚢' : '🚛'}
                  </div>
                  <p className="font-semibold text-sm text-[var(--color-neutral-800)]">{m} Freight</p>
                </button>
              ))}
            </div>

            {mode === 'Sea' && (
              <div className="mt-4">
                <p className="text-xs font-medium text-[var(--color-neutral-600)] mb-2">Service Type *</p>
                <div className="flex gap-2">
                  {(['FCL', 'LCL'] as ServiceType[]).map((s) => (
                    <button
                      key={s}
                      onClick={() => setServiceType(s)}
                      className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                        serviceType === s
                          ? 'border-[var(--color-primary-500)] bg-[var(--color-primary-50)] text-[var(--color-primary-700)]'
                          : 'border-[var(--color-neutral-200)] text-[var(--color-neutral-600)]'
                      }`}
                    >
                      {s} — {s === 'FCL' ? 'Full Container Load' : 'Less Container Load'}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {mode === 'Air' && (
              <div className="mt-4">
                <p className="text-xs font-medium text-[var(--color-neutral-600)] mb-2">Service Type *</p>
                <div className="flex gap-2">
                  {(['Express', 'Standard'] as ServiceType[]).map((s) => (
                    <button
                      key={s}
                      onClick={() => setServiceType(s)}
                      className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                        serviceType === s
                          ? 'border-[var(--color-primary-500)] bg-[var(--color-primary-50)] text-[var(--color-primary-700)]'
                          : 'border-[var(--color-neutral-200)] text-[var(--color-neutral-600)]'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </Card>

          <Card>
            <CardHeader><CardTitle>Quote Settings</CardTitle></CardHeader>
            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-[var(--color-neutral-600)]">Valid For</label>
                <select
                  value={validDays}
                  onChange={(e) => setValidDays(e.target.value)}
                  className="h-9 rounded-md border border-[var(--color-neutral-200)] px-3 text-sm focus:outline-none focus:border-[var(--color-primary-500)]"
                >
                  <option value="7">7 days</option>
                  <option value="14">14 days</option>
                  <option value="30">30 days</option>
                  <option value="60">60 days</option>
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-[var(--color-neutral-600)]">Incoterm</label>
                <select className="h-9 rounded-md border border-[var(--color-neutral-200)] px-3 text-sm focus:outline-none focus:border-[var(--color-primary-500)]">
                  <option value="">-- Select --</option>
                  {incoterms.map((i) => <option key={i}>{i}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-[var(--color-neutral-600)]">Currency</label>
                <select className="h-9 rounded-md border border-[var(--color-neutral-200)] px-3 text-sm focus:outline-none focus:border-[var(--color-primary-500)]">
                  {currencies.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Step 2 — Route */}
      {currentStep === 2 && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader><CardTitle>Origin *</CardTitle></CardHeader>
              <div className="space-y-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-[var(--color-neutral-600)]">City / Country</label>
                  <input type="text" className="h-9 rounded-md border border-[var(--color-neutral-200)] px-3 text-sm focus:outline-none focus:border-[var(--color-primary-500)]" placeholder="e.g. Dubai, UAE" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-[var(--color-neutral-600)]">
                    {mode === 'Air' ? 'Airport Code' : 'Port Code'}
                  </label>
                  <input type="text" className="h-9 rounded-md border border-[var(--color-neutral-200)] px-3 text-sm focus:outline-none focus:border-[var(--color-primary-500)]" placeholder={mode === 'Air' ? 'DXB' : 'AEJEA'} />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-[var(--color-neutral-600)]">Expected ETD</label>
                  <input type="date" className="h-9 rounded-md border border-[var(--color-neutral-200)] px-3 text-sm focus:outline-none focus:border-[var(--color-primary-500)]" />
                </div>
              </div>
            </Card>

            <Card>
              <CardHeader><CardTitle>Destination *</CardTitle></CardHeader>
              <div className="space-y-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-[var(--color-neutral-600)]">City / Country</label>
                  <input type="text" className="h-9 rounded-md border border-[var(--color-neutral-200)] px-3 text-sm focus:outline-none focus:border-[var(--color-primary-500)]" placeholder="e.g. London, UK" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-[var(--color-neutral-600)]">
                    {mode === 'Air' ? 'Airport Code' : 'Port Code'}
                  </label>
                  <input type="text" className="h-9 rounded-md border border-[var(--color-neutral-200)] px-3 text-sm focus:outline-none focus:border-[var(--color-primary-500)]" placeholder={mode === 'Air' ? 'LHR' : 'DEHAM'} />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-[var(--color-neutral-600)]">Expected ETA</label>
                  <input type="date" className="h-9 rounded-md border border-[var(--color-neutral-200)] px-3 text-sm focus:outline-none focus:border-[var(--color-primary-500)]" />
                </div>
              </div>
            </Card>
          </div>

          <Card>
            <CardHeader><CardTitle>
              {mode === 'Air' ? 'Preferred Airline' : mode === 'Sea' ? 'Preferred Shipping Line' : 'Trucker / Road Carrier'}
            </CardTitle></CardHeader>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-[var(--color-neutral-600)]">Carrier (optional)</label>
                <input type="text" className="h-9 rounded-md border border-[var(--color-neutral-200)] px-3 text-sm focus:outline-none focus:border-[var(--color-primary-500)]" placeholder="Leave blank for best rate" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-[var(--color-neutral-600)]">Transit Time (days)</label>
                <input type="number" className="h-9 rounded-md border border-[var(--color-neutral-200)] px-3 text-sm focus:outline-none focus:border-[var(--color-primary-500)]" placeholder="e.g. 7" />
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Step 3 — Cargo */}
      {currentStep === 3 && (
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Cargo Specifications</CardTitle></CardHeader>
            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-[var(--color-neutral-600)]">Commodity *</label>
                <input type="text" className="h-9 rounded-md border border-[var(--color-neutral-200)] px-3 text-sm focus:outline-none focus:border-[var(--color-primary-500)]" placeholder="e.g. Electronics" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-[var(--color-neutral-600)]">No. of Pieces</label>
                <input type="number" className="h-9 rounded-md border border-[var(--color-neutral-200)] px-3 text-sm focus:outline-none focus:border-[var(--color-primary-500)]" placeholder="0" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-[var(--color-neutral-600)]">Gross Weight (kg) *</label>
                <input type="number" className="h-9 rounded-md border border-[var(--color-neutral-200)] px-3 text-sm focus:outline-none focus:border-[var(--color-primary-500)]" placeholder="0.00" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-[var(--color-neutral-600)]">Volume (CBM)</label>
                <input type="number" className="h-9 rounded-md border border-[var(--color-neutral-200)] px-3 text-sm focus:outline-none focus:border-[var(--color-primary-500)]" placeholder="0.00" />
              </div>
              {mode === 'Air' && (
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-[var(--color-neutral-600)]">Chargeable Weight (kg)</label>
                  <input type="number" className="h-9 rounded-md border border-[var(--color-neutral-200)] px-3 text-sm focus:outline-none focus:border-[var(--color-primary-500)] bg-[var(--color-neutral-50)]" placeholder="Auto-calculated" readOnly />
                </div>
              )}
              {mode === 'Sea' && serviceType === 'FCL' && (
                <>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-[var(--color-neutral-600)]">Container Type</label>
                    <select className="h-9 rounded-md border border-[var(--color-neutral-200)] px-3 text-sm focus:outline-none focus:border-[var(--color-primary-500)]">
                      {["20'GP", "40'GP", "40'HC", "20'RF", "40'RF"].map((t) => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-[var(--color-neutral-600)]">No. of Containers</label>
                    <input type="number" className="h-9 rounded-md border border-[var(--color-neutral-200)] px-3 text-sm focus:outline-none focus:border-[var(--color-primary-500)]" placeholder="1" />
                  </div>
                </>
              )}
            </div>
          </Card>

          <Card>
            <CardHeader><CardTitle>Cargo Requirements</CardTitle></CardHeader>
            <div className="grid grid-cols-3 gap-3">
              {[
                'Dangerous Goods (DG)',
                'Temperature Controlled',
                'Fragile / Handle with Care',
                'Oversized Cargo',
                'High Value Cargo',
                'Perishable Goods',
              ].map((req) => (
                <label key={req} className="flex items-center gap-2 text-sm text-[var(--color-neutral-700)] p-3 rounded-lg border border-[var(--color-neutral-200)] hover:bg-[var(--color-neutral-50)] cursor-pointer">
                  <input type="checkbox" className="rounded" />
                  {req}
                </label>
              ))}
            </div>
          </Card>

          <Card>
            <CardHeader><CardTitle>Additional Notes</CardTitle></CardHeader>
            <textarea
              rows={3}
              className="w-full rounded-md border border-[var(--color-neutral-200)] px-3 py-2 text-sm focus:outline-none focus:border-[var(--color-primary-500)] resize-none"
              placeholder="Any special instructions or requirements for this quotation..."
            />
          </Card>
        </div>
      )}

      {/* Step 4 — Charges */}
      {currentStep === 4 && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Rate Sheet</CardTitle>
              <Button size="sm" variant="secondary" onClick={addCharge}>+ Add Line</Button>
            </CardHeader>

            <div className="space-y-2">
              {/* Header Row */}
              <div className="grid grid-cols-12 gap-2 px-2 text-xs font-semibold text-[var(--color-neutral-400)] uppercase">
                <div className="col-span-3">Description</div>
                <div className="col-span-2">Category</div>
                <div className="col-span-1">Qty</div>
                <div className="col-span-1">Unit</div>
                <div className="col-span-2">Rate</div>
                <div className="col-span-1">Currency</div>
                <div className="col-span-1">Amount</div>
                <div className="col-span-1"></div>
              </div>

              {/* Charge Rows */}
              {charges.map((charge) => (
                <div key={charge.id} className="grid grid-cols-12 gap-2 items-center p-2 rounded-lg bg-[var(--color-neutral-50)] hover:bg-[var(--color-neutral-100)]">
                  <div className="col-span-3">
                    <input
                      type="text"
                      value={charge.description}
                      onChange={(e) => updateCharge(charge.id, 'description', e.target.value)}
                      className="h-8 w-full rounded border border-[var(--color-neutral-200)] px-2 text-sm focus:outline-none focus:border-[var(--color-primary-500)]"
                      placeholder="Description..."
                    />
                  </div>
                  <div className="col-span-2">
                    <select
                      value={charge.category}
                      onChange={(e) => updateCharge(charge.id, 'category', e.target.value)}
                      className="h-8 w-full rounded border border-[var(--color-neutral-200)] px-2 text-xs focus:outline-none focus:border-[var(--color-primary-500)]"
                    >
                      {categories.map((c) => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="col-span-1">
                    <input
                      type="number"
                      value={charge.quantity}
                      onChange={(e) => updateCharge(charge.id, 'quantity', Number(e.target.value))}
                      className="h-8 w-full rounded border border-[var(--color-neutral-200)] px-2 text-sm text-right focus:outline-none focus:border-[var(--color-primary-500)]"
                    />
                  </div>
                  <div className="col-span-1">
                    <select
                      value={charge.unit}
                      onChange={(e) => updateCharge(charge.id, 'unit', e.target.value)}
                      className="h-8 w-full rounded border border-[var(--color-neutral-200)] px-1 text-xs focus:outline-none focus:border-[var(--color-primary-500)]"
                    >
                      {units.map((u) => <option key={u}>{u}</option>)}
                    </select>
                  </div>
                  <div className="col-span-2">
                    <input
                      type="number"
                      value={charge.rate}
                      onChange={(e) => updateCharge(charge.id, 'rate', Number(e.target.value))}
                      className="h-8 w-full rounded border border-[var(--color-neutral-200)] px-2 text-sm text-right focus:outline-none focus:border-[var(--color-primary-500)]"
                      placeholder="0.00"
                    />
                  </div>
                  <div className="col-span-1">
                    <select
                      value={charge.currency}
                      onChange={(e) => updateCharge(charge.id, 'currency', e.target.value)}
                      className="h-8 w-full rounded border border-[var(--color-neutral-200)] px-1 text-xs focus:outline-none focus:border-[var(--color-primary-500)]"
                    >
                      {currencies.map((c) => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="col-span-1 text-right">
                    <span className="text-sm font-mono font-semibold text-[var(--color-neutral-800)]">
                      {(charge.quantity * charge.rate).toLocaleString()}
                    </span>
                  </div>
                  <div className="col-span-1 text-center">
                    <button
                      onClick={() => removeCharge(charge.id)}
                      className="text-[var(--color-danger-500)] hover:text-[var(--color-danger-700)] text-sm"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="flex justify-end mt-4 pt-3 border-t border-[var(--color-neutral-200)]">
              <div className="text-right">
                <p className="text-xs text-[var(--color-neutral-400)] mb-0.5">Grand Total</p>
                <p className="text-xl font-bold font-mono text-[var(--color-primary-600)]">
                  AED {total.toLocaleString()}
                </p>
              </div>
            </div>
          </Card>

          {/* Category Breakdown */}
          <Card padding="sm">
            <div className="flex items-center gap-6">
              <p className="text-xs font-semibold text-[var(--color-neutral-400)] uppercase">Breakdown</p>
              {categories.map((cat) => {
                const catTotal = charges
                  .filter((c) => c.category === cat)
                  .reduce((s, c) => s + c.quantity * c.rate, 0);
                if (catTotal === 0) return null;
                return (
                  <div key={cat} className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${categoryColors[cat]}`}>{cat}</span>
                    <span className="text-sm font-mono font-semibold text-[var(--color-neutral-800)]">
                      AED {catTotal.toLocaleString()}
                    </span>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      )}

      {/* Step 5 — Review */}
      {currentStep === 5 && (
        <div className="space-y-4">
          {/* Quote Preview Card */}
          <Card>
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="w-12 h-12 rounded-xl bg-[var(--color-primary-900)] flex items-center justify-center text-white font-bold text-sm mb-3">
                  FG
                </div>
                <p className="text-lg font-bold text-[var(--color-neutral-800)]">KingFisher Tech Gold</p>
                <p className="text-sm text-[var(--color-neutral-400)]">Kingfisher Wings Logistic LLC</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-[var(--color-neutral-400)]">Quotation No.</p>
                <p className="text-lg font-bold font-mono text-[var(--color-neutral-800)]">QT/2026/006</p>
                <Badge variant="neutral">Draft</Badge>
                <p className="text-xs text-[var(--color-neutral-400)] mt-1">Valid for {validDays} days</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-6 mb-6 text-sm">
              <div>
                <p className="text-xs font-semibold text-[var(--color-neutral-400)] uppercase mb-2">Client</p>
                <p className="font-medium text-[var(--color-neutral-800)]">Al Futtaim LLC</p>
                <p className="text-[var(--color-neutral-400)]">logistics@alfuttaim.ae</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-[var(--color-neutral-400)] uppercase mb-2">Route</p>
                <p className="font-medium text-[var(--color-neutral-800)]">Dubai (DXB) → London (LHR)</p>
                <p className="text-[var(--color-neutral-400)]">{mode || 'Air'} · {serviceType || 'Express'}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-[var(--color-neutral-400)] uppercase mb-2">Total</p>
                <p className="text-2xl font-bold font-mono text-[var(--color-primary-600)]">
                  AED {total.toLocaleString()}
                </p>
              </div>
            </div>

            {/* Charges Preview Table */}
            <table className="w-full text-sm border-t border-[var(--color-neutral-200)]">
              <thead>
                <tr className="bg-[var(--color-neutral-50)]">
                  <th className="text-left px-3 py-2 text-xs font-semibold text-[var(--color-neutral-600)]">Description</th>
                  <th className="text-left px-3 py-2 text-xs font-semibold text-[var(--color-neutral-600)]">Category</th>
                  <th className="text-right px-3 py-2 text-xs font-semibold text-[var(--color-neutral-600)]">Qty</th>
                  <th className="text-left px-3 py-2 text-xs font-semibold text-[var(--color-neutral-600)]">Unit</th>
                  <th className="text-right px-3 py-2 text-xs font-semibold text-[var(--color-neutral-600)]">Rate</th>
                  <th className="text-right px-3 py-2 text-xs font-semibold text-[var(--color-neutral-600)]">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-neutral-100)]">
                {charges.map((c) => (
                  <tr key={c.id}>
                    <td className="px-3 py-2 font-medium">{c.description || '—'}</td>
                    <td className="px-3 py-2">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${categoryColors[c.category]}`}>
                        {c.category}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right font-mono">{c.quantity}</td>
                    <td className="px-3 py-2">{c.unit}</td>
                    <td className="px-3 py-2 text-right font-mono">{c.rate.toFixed(2)}</td>
                    <td className="px-3 py-2 text-right font-mono font-semibold">
                      {(c.quantity * c.rate).toLocaleString()}
                    </td>
                  </tr>
                ))}
                <tr className="bg-[var(--color-neutral-50)] font-semibold">
                  <td colSpan={5} className="px-3 py-2 text-right">Total</td>
                  <td className="px-3 py-2 text-right font-mono font-bold text-[var(--color-primary-600)]">
                    AED {total.toLocaleString()}
                  </td>
                </tr>
              </tbody>
            </table>

            <p className="text-xs text-[var(--color-neutral-400)] mt-4">
              This quotation is valid for {validDays} days from the date of issue. Rates are subject to space and equipment availability.
            </p>
          </Card>

          {/* Action Options */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { icon: '💾', label: 'Save as Draft',    desc: 'Save and continue editing later',  action: 'draft' },
              { icon: '📧', label: 'Send to Client',   desc: 'Email quote PDF to client now',    action: 'send' },
              { icon: '📥', label: 'Download PDF',     desc: 'Download and share manually',      action: 'pdf' },
            ].map((opt) => (
              <button
                key={opt.action}
                className="p-4 rounded-xl border-2 border-[var(--color-neutral-200)] hover:border-[var(--color-primary-500)] hover:bg-[var(--color-primary-50)] transition-all text-left"
              >
                <span className="text-2xl">{opt.icon}</span>
                <p className="font-semibold text-sm text-[var(--color-neutral-800)] mt-2">{opt.label}</p>
                <p className="text-xs text-[var(--color-neutral-400)] mt-0.5">{opt.desc}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between pt-2 border-t border-[var(--color-neutral-200)]">
        <Button variant="secondary" onClick={prev} disabled={currentStep === 1}>
          ← Previous
        </Button>
        <span className="text-xs text-[var(--color-neutral-400)]">
          {steps[currentStep - 1].description}
        </span>
        {currentStep < steps.length ? (
          <Button onClick={next}>
            Next →
          </Button>
        ) : (
          <Button>
            ✓ Create Quotation
          </Button>
        )}
      </div>
    </div>
  );
}