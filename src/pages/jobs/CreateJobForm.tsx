import { useState } from 'react';
import { Card, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';

type JobMode = 'Air' | 'Sea' | 'Road';
type JobType = 'Export' | 'Import';
type ServiceType = 'FCL' | 'LCL' | 'FTL' | 'LTL' | 'Express' | 'Standard';

interface FormStep {
  id: number;
  label: string;
  description: string;
}

const steps: FormStep[] = [
  { id: 1, label: 'Job Type',      description: 'Mode & direction' },
  { id: 2, label: 'Parties',       description: 'Shipper & consignee' },
  { id: 3, label: 'Route',         description: 'Origin & destination' },
  { id: 4, label: 'Cargo',         description: 'Cargo & container details' },
  { id: 5, label: 'Charges',       description: 'Revenue & cost items' },
  { id: 6, label: 'Review',        description: 'Confirm & create' },
];

const airlines    = ['Emirates', 'Qatar Airways', 'Etihad', 'Flydubai', 'Air Arabia'];
const shippingLines = ['Maersk', 'MSC', 'CMA CGM', 'Hapag-Lloyd', 'Evergreen'];
const incoterms   = ['EXW', 'FCA', 'FOB', 'CFR', 'CIF', 'CPT', 'CIP', 'DAP', 'DPU', 'DDP'];
const containerTypes = ["20'GP", "40'GP", "40'HC", "20'RF", "40'RF"];
const customers   = ['Al Futtaim LLC', 'Jumeirah Group', 'DP World', 'Emirates Airlines', 'Noon.com'];
const airports    = ['Dubai (DXB)', 'Abu Dhabi (AUH)', 'London Heathrow (LHR)', 'Frankfurt (FRA)', 'JFK New York (JFK)'];
const ports       = ['Jebel Ali (AEJEA)', 'Dubai Port (AEDXB)', 'Hamburg (DEHAM)', 'Rotterdam (NLRTM)', 'Singapore (SGSIN)'];

export default function CreateJobForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [mode, setMode]               = useState<JobMode | ''>('');
  const [jobType, setJobType]         = useState<JobType | ''>('');
  const [serviceType, setServiceType] = useState<ServiceType | ''>('');

  function next() { if (currentStep < steps.length) setCurrentStep(s => s + 1); }
  function prev() { if (currentStep > 1) setCurrentStep(s => s - 1); }

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-[var(--color-neutral-800)]">Create New Job</h1>
          <p className="text-sm text-[var(--color-neutral-400)]">Step {currentStep} of {steps.length}</p>
        </div>
        <Button variant="secondary">Cancel</Button>
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
                step.id === currentStep
                  ? 'text-[var(--color-primary-600)]'
                  : step.id < currentStep
                  ? 'text-[var(--color-success-500)]'
                  : 'text-[var(--color-neutral-400)]'
              }`}>
                {step.label}
              </p>
            </div>
            {index < steps.length - 1 && (
              <div className={`flex-1 h-0.5 mx-2 mb-4 ${
                step.id < currentStep
                  ? 'bg-[var(--color-success-500)]'
                  : 'bg-[var(--color-neutral-200)]'
              }`} />
            )}
          </div>
        ))}
      </div>

      {/* Step 1 — Job Type */}
      {currentStep === 1 && (
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Select Mode of Transport</CardTitle></CardHeader>
            <div className="grid grid-cols-3 gap-4">
              {(['Air', 'Sea', 'Road'] as JobMode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`p-6 rounded-xl border-2 transition-all text-center ${
                    mode === m
                      ? 'border-[var(--color-primary-500)] bg-[var(--color-primary-50)]'
                      : 'border-[var(--color-neutral-200)] hover:border-[var(--color-primary-200)] hover:bg-[var(--color-neutral-50)]'
                  }`}
                >
                  <div className="text-4xl mb-3">
                    {m === 'Air' ? '✈️' : m === 'Sea' ? '🚢' : '🚛'}
                  </div>
                  <p className="font-semibold text-[var(--color-neutral-800)]">{m} Freight</p>
                  <p className="text-xs text-[var(--color-neutral-400)] mt-1">
                    {m === 'Air'  ? 'HAWB / MAWB' :
                     m === 'Sea'  ? 'HBL / MBL' :
                     'Road Waybill'}
                  </p>
                </button>
              ))}
            </div>
          </Card>

          <Card>
            <CardHeader><CardTitle>Job Direction</CardTitle></CardHeader>
            <div className="grid grid-cols-2 gap-4">
              {(['Export', 'Import'] as JobType[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setJobType(t)}
                  className={`p-5 rounded-xl border-2 transition-all text-left ${
                    jobType === t
                      ? 'border-[var(--color-primary-500)] bg-[var(--color-primary-50)]'
                      : 'border-[var(--color-neutral-200)] hover:border-[var(--color-primary-200)]'
                  }`}
                >
                  <p className="font-semibold text-[var(--color-neutral-800)] text-base mb-1">
                    {t === 'Export' ? '📤' : '📥'} {t}
                  </p>
                  <p className="text-xs text-[var(--color-neutral-400)]">
                    {t === 'Export' ? 'Outbound from UAE' : 'Inbound to UAE'}
                  </p>
                </button>
              ))}
            </div>
          </Card>

          {mode === 'Sea' && (
            <Card>
              <CardHeader><CardTitle>Service Type</CardTitle></CardHeader>
              <div className="grid grid-cols-2 gap-3">
                {(['FCL', 'LCL'] as ServiceType[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => setServiceType(s)}
                    className={`p-4 rounded-lg border-2 transition-all text-left ${
                      serviceType === s
                        ? 'border-[var(--color-primary-500)] bg-[var(--color-primary-50)]'
                        : 'border-[var(--color-neutral-200)] hover:border-[var(--color-primary-200)]'
                    }`}
                  >
                    <p className="font-semibold text-[var(--color-neutral-800)]">{s}</p>
                    <p className="text-xs text-[var(--color-neutral-400)] mt-0.5">
                      {s === 'FCL' ? 'Full Container Load' : 'Less than Container Load'}
                    </p>
                  </button>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Step 2 — Parties */}
      {currentStep === 2 && (
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardHeader><CardTitle>Shipper</CardTitle></CardHeader>
            <div className="space-y-3">
              <label className="flex flex-col gap-1">
                <span className="text-xs font-medium text-[var(--color-neutral-600)]">Select Customer</span>
                <select className="h-9 w-full rounded-md border border-[var(--color-neutral-200)] px-3 text-sm focus:outline-none focus:border-[var(--color-primary-500)]">
                  <option value="">-- Select customer --</option>
                  {customers.map((c) => <option key={c}>{c}</option>)}
                </select>
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs font-medium text-[var(--color-neutral-600)]">Address</span>
                <textarea rows={2} className="w-full rounded-md border border-[var(--color-neutral-200)] px-3 py-2 text-sm focus:outline-none focus:border-[var(--color-primary-500)] resize-none" placeholder="Shipper address..." />
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-[var(--color-neutral-600)]">Country</span>
                  <input type="text" className="h-9 rounded-md border border-[var(--color-neutral-200)] px-3 text-sm focus:outline-none focus:border-[var(--color-primary-500)]" placeholder="UAE" />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-[var(--color-neutral-600)]">Phone</span>
                  <input type="text" className="h-9 rounded-md border border-[var(--color-neutral-200)] px-3 text-sm focus:outline-none focus:border-[var(--color-primary-500)]" placeholder="+971..." />
                </label>
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader><CardTitle>Consignee</CardTitle></CardHeader>
            <div className="space-y-3">
              <label className="flex flex-col gap-1">
                <span className="text-xs font-medium text-[var(--color-neutral-600)]">Company Name</span>
                <input type="text" className="h-9 w-full rounded-md border border-[var(--color-neutral-200)] px-3 text-sm focus:outline-none focus:border-[var(--color-primary-500)]" placeholder="Consignee name..." />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs font-medium text-[var(--color-neutral-600)]">Address</span>
                <textarea rows={2} className="w-full rounded-md border border-[var(--color-neutral-200)] px-3 py-2 text-sm focus:outline-none focus:border-[var(--color-primary-500)] resize-none" placeholder="Consignee address..." />
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-[var(--color-neutral-600)]">Country</span>
                  <input type="text" className="h-9 rounded-md border border-[var(--color-neutral-200)] px-3 text-sm focus:outline-none focus:border-[var(--color-primary-500)]" placeholder="UK" />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-[var(--color-neutral-600)]">Email</span>
                  <input type="email" className="h-9 rounded-md border border-[var(--color-neutral-200)] px-3 text-sm focus:outline-none focus:border-[var(--color-primary-500)]" placeholder="email@company.com" />
                </label>
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader><CardTitle>Notify Party</CardTitle></CardHeader>
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <input type="checkbox" id="same-as-consignee" className="rounded" />
                <label htmlFor="same-as-consignee" className="text-sm text-[var(--color-neutral-600)]">Same as consignee</label>
              </div>
              <label className="flex flex-col gap-1">
                <span className="text-xs font-medium text-[var(--color-neutral-600)]">Company Name</span>
                <input type="text" className="h-9 w-full rounded-md border border-[var(--color-neutral-200)] px-3 text-sm focus:outline-none focus:border-[var(--color-primary-500)]" placeholder="Notify party name..." />
              </label>
            </div>
          </Card>

          <Card>
            <CardHeader><CardTitle>Overseas Agent</CardTitle></CardHeader>
            <div className="space-y-3">
              <label className="flex flex-col gap-1">
                <span className="text-xs font-medium text-[var(--color-neutral-600)]">Agent Name</span>
                <input type="text" className="h-9 w-full rounded-md border border-[var(--color-neutral-200)] px-3 text-sm focus:outline-none focus:border-[var(--color-primary-500)]" placeholder="Agent company name..." />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs font-medium text-[var(--color-neutral-600)]">Country</span>
                <input type="text" className="h-9 w-full rounded-md border border-[var(--color-neutral-200)] px-3 text-sm focus:outline-none focus:border-[var(--color-primary-500)]" placeholder="Country..." />
              </label>
            </div>
          </Card>
        </div>
      )}

      {/* Step 3 — Route */}
      {currentStep === 3 && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader><CardTitle>Origin</CardTitle></CardHeader>
              <div className="space-y-3">
                <label className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-[var(--color-neutral-600)]">
                    {mode === 'Air' ? 'Origin Airport' : 'Port of Loading (POL)'}
                  </span>
                  <select className="h-9 w-full rounded-md border border-[var(--color-neutral-200)] px-3 text-sm focus:outline-none focus:border-[var(--color-primary-500)]">
                    <option value="">-- Select --</option>
                    {(mode === 'Air' ? airports : ports).map((p) => <option key={p}>{p}</option>)}
                  </select>
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-[var(--color-neutral-600)]">ETD</span>
                  <input type="date" className="h-9 rounded-md border border-[var(--color-neutral-200)] px-3 text-sm focus:outline-none focus:border-[var(--color-primary-500)]" />
                </label>
              </div>
            </Card>

            <Card>
              <CardHeader><CardTitle>Destination</CardTitle></CardHeader>
              <div className="space-y-3">
                <label className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-[var(--color-neutral-600)]">
                    {mode === 'Air' ? 'Destination Airport' : 'Port of Discharge (POD)'}
                  </span>
                  <select className="h-9 w-full rounded-md border border-[var(--color-neutral-200)] px-3 text-sm focus:outline-none focus:border-[var(--color-primary-500)]">
                    <option value="">-- Select --</option>
                    {(mode === 'Air' ? airports : ports).map((p) => <option key={p}>{p}</option>)}
                  </select>
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-[var(--color-neutral-600)]">ETA</span>
                  <input type="date" className="h-9 rounded-md border border-[var(--color-neutral-200)] px-3 text-sm focus:outline-none focus:border-[var(--color-primary-500)]" />
                </label>
              </div>
            </Card>
          </div>

          <Card>
            <CardHeader><CardTitle>
              {mode === 'Air' ? 'Airline & Flight Details' : 'Vessel & Voyage Details'}
            </CardTitle></CardHeader>
            <div className="grid grid-cols-3 gap-4">
              <label className="flex flex-col gap-1">
                <span className="text-xs font-medium text-[var(--color-neutral-600)]">
                  {mode === 'Air' ? 'Airline' : 'Shipping Line'}
                </span>
                <select className="h-9 rounded-md border border-[var(--color-neutral-200)] px-3 text-sm focus:outline-none focus:border-[var(--color-primary-500)]">
                  <option value="">-- Select --</option>
                  {(mode === 'Air' ? airlines : shippingLines).map((a) => <option key={a}>{a}</option>)}
                </select>
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs font-medium text-[var(--color-neutral-600)]">
                  {mode === 'Air' ? 'Flight No.' : 'Vessel Name'}
                </span>
                <input type="text" className="h-9 rounded-md border border-[var(--color-neutral-200)] px-3 text-sm focus:outline-none focus:border-[var(--color-primary-500)]" placeholder={mode === 'Air' ? 'EK 001' : 'MSC Gülsün'} />
              </label>
              {mode === 'Sea' && (
                <label className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-[var(--color-neutral-600)]">Voyage No.</span>
                  <input type="text" className="h-9 rounded-md border border-[var(--color-neutral-200)] px-3 text-sm focus:outline-none focus:border-[var(--color-primary-500)]" placeholder="062W" />
                </label>
              )}
              <label className="flex flex-col gap-1">
                <span className="text-xs font-medium text-[var(--color-neutral-600)]">Incoterm</span>
                <select className="h-9 rounded-md border border-[var(--color-neutral-200)] px-3 text-sm focus:outline-none focus:border-[var(--color-primary-500)]">
                  <option value="">-- Select --</option>
                  {incoterms.map((i) => <option key={i}>{i}</option>)}
                </select>
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs font-medium text-[var(--color-neutral-600)]">Payment Mode</span>
                <select className="h-9 rounded-md border border-[var(--color-neutral-200)] px-3 text-sm focus:outline-none focus:border-[var(--color-primary-500)]">
                  <option>Prepaid</option>
                  <option>Collect</option>
                </select>
              </label>
            </div>
          </Card>
        </div>
      )}

      {/* Step 4 — Cargo */}
      {currentStep === 4 && (
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Cargo Information</CardTitle></CardHeader>
            <div className="grid grid-cols-3 gap-4">
              <label className="flex flex-col gap-1">
                <span className="text-xs font-medium text-[var(--color-neutral-600)]">Commodity</span>
                <input type="text" className="h-9 rounded-md border border-[var(--color-neutral-200)] px-3 text-sm focus:outline-none focus:border-[var(--color-primary-500)]" placeholder="e.g. Electronics" />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs font-medium text-[var(--color-neutral-600)]">No. of Pieces</span>
                <input type="number" className="h-9 rounded-md border border-[var(--color-neutral-200)] px-3 text-sm focus:outline-none focus:border-[var(--color-primary-500)]" placeholder="0" />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs font-medium text-[var(--color-neutral-600)]">Gross Weight (kg)</span>
                <input type="number" className="h-9 rounded-md border border-[var(--color-neutral-200)] px-3 text-sm focus:outline-none focus:border-[var(--color-primary-500)]" placeholder="0.00" />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs font-medium text-[var(--color-neutral-600)]">Volume (CBM)</span>
                <input type="number" className="h-9 rounded-md border border-[var(--color-neutral-200)] px-3 text-sm focus:outline-none focus:border-[var(--color-primary-500)]" placeholder="0.00" />
              </label>
              {mode === 'Air' && (
                <label className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-[var(--color-neutral-600)]">Chargeable Weight (kg)</span>
                  <input type="number" className="h-9 rounded-md border border-[var(--color-neutral-200)] px-3 text-sm focus:outline-none focus:border-[var(--color-primary-500)]" placeholder="Auto-calculated" />
                </label>
              )}
            </div>
          </Card>

          {mode === 'Sea' && serviceType === 'FCL' && (
            <Card>
              <CardHeader>
                <CardTitle>Container Details</CardTitle>
                <Button size="sm" variant="secondary">+ Add Container</Button>
              </CardHeader>
              <div className="grid grid-cols-3 gap-4">
                <label className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-[var(--color-neutral-600)]">Container Type</span>
                  <select className="h-9 rounded-md border border-[var(--color-neutral-200)] px-3 text-sm focus:outline-none focus:border-[var(--color-primary-500)]">
                    {containerTypes.map((t) => <option key={t}>{t}</option>)}
                  </select>
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-[var(--color-neutral-600)]">Container No.</span>
                  <input type="text" className="h-9 rounded-md border border-[var(--color-neutral-200)] px-3 text-sm focus:outline-none focus:border-[var(--color-primary-500)]" placeholder="MSKU1234567" />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-[var(--color-neutral-600)]">Seal No.</span>
                  <input type="text" className="h-9 rounded-md border border-[var(--color-neutral-200)] px-3 text-sm focus:outline-none focus:border-[var(--color-primary-500)]" placeholder="SL-001-2026" />
                </label>
              </div>
            </Card>
          )}

          <Card>
            <CardHeader><CardTitle>Special Requirements</CardTitle></CardHeader>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                {['Dangerous Goods', 'Temperature Controlled', 'Fragile', 'Oversized', 'Live Animals', 'Valuable Cargo'].map((req) => (
                  <label key={req} className="flex items-center gap-2 text-sm text-[var(--color-neutral-700)]">
                    <input type="checkbox" className="rounded" />
                    {req}
                  </label>
                ))}
              </div>
              <label className="flex flex-col gap-1">
                <span className="text-xs font-medium text-[var(--color-neutral-600)]">Special Instructions</span>
                <textarea rows={5} className="w-full rounded-md border border-[var(--color-neutral-200)] px-3 py-2 text-sm focus:outline-none focus:border-[var(--color-primary-500)] resize-none" placeholder="Any special handling instructions..." />
              </label>
            </div>
          </Card>
        </div>
      )}

      {/* Step 5 — Charges */}
      {currentStep === 5 && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Charge Items</CardTitle>
              <Button size="sm" variant="secondary">+ Add Charge</Button>
            </CardHeader>
            <div className="space-y-3">
              {['Air Freight Charges', 'Fuel Surcharge', 'Documentation Fee'].map((charge, i) => (
                <div key={i} className="grid grid-cols-6 gap-3 items-end p-3 rounded-lg bg-[var(--color-neutral-50)]">
                  <label className="col-span-2 flex flex-col gap-1">
                    <span className="text-xs font-medium text-[var(--color-neutral-600)]">Description</span>
                    <input type="text" defaultValue={charge} className="h-9 rounded-md border border-[var(--color-neutral-200)] px-3 text-sm focus:outline-none focus:border-[var(--color-primary-500)]" />
                  </label>
                  <label className="flex flex-col gap-1">
                    <span className="text-xs font-medium text-[var(--color-neutral-600)]">Type</span>
                    <select className="h-9 rounded-md border border-[var(--color-neutral-200)] px-3 text-sm focus:outline-none focus:border-[var(--color-primary-500)]">
                      <option>Revenue</option>
                      <option>Cost</option>
                    </select>
                  </label>
                  <label className="flex flex-col gap-1">
                    <span className="text-xs font-medium text-[var(--color-neutral-600)]">Qty</span>
                    <input type="number" className="h-9 rounded-md border border-[var(--color-neutral-200)] px-3 text-sm focus:outline-none focus:border-[var(--color-primary-500)]" placeholder="1" />
                  </label>
                  <label className="flex flex-col gap-1">
                    <span className="text-xs font-medium text-[var(--color-neutral-600)]">Rate</span>
                    <input type="number" className="h-9 rounded-md border border-[var(--color-neutral-200)] px-3 text-sm focus:outline-none focus:border-[var(--color-primary-500)]" placeholder="0.00" />
                  </label>
                  <button className="h-9 text-[var(--color-danger-500)] hover:text-[var(--color-danger-700)] text-sm">
                    ✕ Remove
                  </button>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Step 6 — Review */}
      {currentStep === 6 && (
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Review & Confirm</CardTitle></CardHeader>
            <div className="grid grid-cols-3 gap-6 text-sm">
              <div>
                <p className="text-xs font-semibold text-[var(--color-neutral-400)] uppercase mb-2">Job Details</p>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-[var(--color-neutral-400)]">Mode</span>
                    <Badge variant="info">{mode || '—'}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--color-neutral-400)]">Type</span>
                    <span className="font-medium">{jobType || '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--color-neutral-400)]">Service</span>
                    <span className="font-medium">{serviceType || '—'}</span>
                  </div>
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-[var(--color-neutral-400)] uppercase mb-2">Route</p>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-[var(--color-neutral-400)]">Origin</span>
                    <span className="font-mono font-medium">DXB</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--color-neutral-400)]">Destination</span>
                    <span className="font-mono font-medium">LHR</span>
                  </div>
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-[var(--color-neutral-400)] uppercase mb-2">Summary</p>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-[var(--color-neutral-400)]">Est. Revenue</span>
                    <span className="font-mono font-semibold text-[var(--color-success-500)]">AED 9,578</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--color-neutral-400)]">Est. Cost</span>
                    <span className="font-mono font-semibold text-[var(--color-danger-500)]">AED 5,606</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-[var(--color-neutral-200)]">
                    <span className="font-semibold">Est. Profit</span>
                    <span className="font-mono font-bold text-[var(--color-neutral-800)]">AED 3,972</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <div className="flex items-center gap-3 p-4 rounded-lg bg-[var(--color-primary-50)] border border-[var(--color-primary-200)]">
            <span className="text-2xl">ℹ️</span>
            <p className="text-sm text-[var(--color-primary-700)]">
              A job number will be auto-generated in format <span className="font-mono font-semibold">KFW/AE/06/26/00142</span> upon creation.
            </p>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-2 border-t border-[var(--color-neutral-200)]">
        <Button variant="secondary" onClick={prev} disabled={currentStep === 1}>
          ← Previous
        </Button>
        <span className="text-xs text-[var(--color-neutral-400)]">
          {steps[currentStep - 1].description}
        </span>
        {currentStep < steps.length ? (
          <Button onClick={next} disabled={currentStep === 1 && (!mode || !jobType)}>
            Next →
          </Button>
        ) : (
          <Button onClick={() => alert('Job created!')}>
            ✓ Create Job
          </Button>
        )}
      </div>
    </div>
  );
}