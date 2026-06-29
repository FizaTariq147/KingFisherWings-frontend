import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import {
  Table, TableHeader, TableBody,
  TableRow, TableHead, TableCell
} from '../../components/ui/Table';

interface Quotation {
  id: string;
  quoteNo: string;
  status: 'Draft' | 'Sent' | 'Approved' | 'Rejected';
  createdAt: string;
  validUntil: string;
  client: { name: string; email: string; phone: string; country: string };
  origin: { city: string; country: string; code: string };
  destination: { city: string; country: string; code: string };
  mode: 'Air' | 'Sea' | 'Road';
  serviceType: 'FCL' | 'LCL' | 'FTL' | 'LTL' | 'Express' | 'Standard';
  incoterm: string;
  commodity: string;
  pieces: number;
  grossWeight: number;
  volume: number;
  containerType?: string;
  containers?: number;
  specialRequirements: string;
  preparedBy: string;
  notes: string;
}

interface QuoteCharge {
  id: string;
  description: string;
  category: 'Origin' | 'Freight' | 'Destination' | 'Other';
  quantity: number;
  unit: string;
  rate: number;
  amount: number;
  currency: string;
}

interface QuoteVersion {
  id: string;
  version: string;
  createdAt: string;
  createdBy: string;
  totalAmount: number;
  currency: string;
  status: 'Current' | 'Superseded';
}

const mockQuotation: Quotation = {
  id: '1',
  quoteNo: 'QT/2026/001',
  status: 'Sent',
  createdAt: '2026-06-01',
  validUntil: '2026-06-30',
  client: {
    name: 'Al Futtaim LLC',
    email: 'logistics@alfuttaim.ae',
    phone: '+971 4 200 0000',
    country: 'UAE',
  },
  origin: { city: 'Dubai', country: 'UAE', code: 'DXB' },
  destination: { city: 'London', country: 'UK', code: 'LHR' },
  mode: 'Air',
  serviceType: 'Express',
  incoterm: 'FOB Dubai',
  commodity: 'Electronics — General Cargo',
  pieces: 12,
  grossWeight: 480,
  volume: 2.4,
  specialRequirements: 'Temperature controlled. Handle with care.',
  preparedBy: 'Shahzad Zafar',
  notes: 'Rate valid for 30 days. Subject to space and equipment availability.',
};

const mockCharges: QuoteCharge[] = [
  { id: '1', description: 'Air Freight Charges',   category: 'Freight',     quantity: 520,  unit: 'KG',  rate: 12.50, amount: 6500,  currency: 'AED' },
  { id: '2', description: 'Fuel Surcharge (YQ)',    category: 'Freight',     quantity: 520,  unit: 'KG',  rate: 3.20,  amount: 1664,  currency: 'AED' },
  { id: '3', description: 'Security Surcharge',     category: 'Freight',     quantity: 12,   unit: 'PCS', rate: 25.00, amount: 300,   currency: 'AED' },
  { id: '4', description: 'Airport Handling — DXB', category: 'Origin',      quantity: 480,  unit: 'KG',  rate: 1.80,  amount: 864,   currency: 'AED' },
  { id: '5', description: 'Export Customs',         category: 'Origin',      quantity: 1,    unit: 'SHP', rate: 450,   amount: 450,   currency: 'AED' },
  { id: '6', description: 'Documentation Fee',      category: 'Other',       quantity: 1,    unit: 'BL',  rate: 250,   amount: 250,   currency: 'AED' },
  { id: '7', description: 'Destination THC — LHR',  category: 'Destination', quantity: 480,  unit: 'KG',  rate: 2.20,  amount: 1056,  currency: 'AED' },
];

const mockVersions: QuoteVersion[] = [
  { id: '1', version: 'v1.0', createdAt: '2026-06-01', createdBy: 'Shahzad Zafar', totalAmount: 10200, currency: 'AED', status: 'Superseded' },
  { id: '2', version: 'v1.1', createdAt: '2026-06-03', createdBy: 'Shahzad Zafar', totalAmount: 11084, currency: 'AED', status: 'Current' },
];

const statusVariant: Record<Quotation['status'], 'neutral' | 'info' | 'success' | 'danger'> = {
  Draft:    'neutral',
  Sent:     'info',
  Approved: 'success',
  Rejected: 'danger',
};

const categoryColors: Record<QuoteCharge['category'], string> = {
  Origin:      'text-blue-700 bg-blue-50',
  Freight:     'text-purple-700 bg-purple-50',
  Destination: 'text-orange-700 bg-orange-50',
  Other:       'text-gray-700 bg-gray-50',
};

type Tab = 'overview' | 'charges' | 'versions';

const tabs: { key: Tab; label: string }[] = [
  { key: 'overview', label: '📋 Overview' },
  { key: 'charges',  label: '💰 Charges' },
  { key: 'versions', label: '🔄 Versions' },
];

export default function QuotationDetail() {
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  const { data: quotation }      = useQuery<Quotation>({ queryKey: ['quotation', '1'],   queryFn: async () => mockQuotation });
  const { data: charges = [] }   = useQuery<QuoteCharge[]>({ queryKey: ['quote-charges', '1'], queryFn: async () => mockCharges });
  const { data: versions = [] }  = useQuery<QuoteVersion[]>({ queryKey: ['quote-versions', '1'], queryFn: async () => mockVersions });

  if (!quotation) return null;

  const total = charges.reduce((s, c) => s + c.amount, 0);

  const byCategory = charges.reduce((acc, c) => {
    acc[c.category] = (acc[c.category] || 0) + c.amount;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-lg font-semibold text-[var(--color-neutral-800)] font-mono">
              {quotation.quoteNo}
            </h1>
            <Badge variant={statusVariant[quotation.status]}>{quotation.status}</Badge>
            <span className={`px-2 py-0.5 rounded text-xs font-medium ${
              quotation.mode === 'Air'  ? 'bg-purple-50 text-purple-700' :
              quotation.mode === 'Sea'  ? 'bg-blue-50 text-blue-700' :
              'bg-orange-50 text-orange-700'
            }`}>
              {quotation.mode} · {quotation.serviceType}
            </span>
          </div>
          <p className="text-sm text-[var(--color-neutral-400)]">
            {quotation.origin.code} → {quotation.destination.code} · Valid until {quotation.validUntil} · Prepared by {quotation.preparedBy}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary">🖨 Print PDF</Button>
          <Button variant="secondary">📧 Send to Client</Button>
          {quotation.status === 'Draft' && <Button>Send Quote</Button>}
          {quotation.status === 'Sent'  && (
            <>
              <Button variant="secondary" className="text-[var(--color-success-500)] border-[var(--color-success-500)]">
                ✓ Approve
              </Button>
              <Button variant="danger">✗ Reject</Button>
            </>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Client',        value: quotation.client.name },
          { label: 'Route',         value: `${quotation.origin.city} → ${quotation.destination.city}` },
          { label: 'Total Amount',  value: `AED ${total.toLocaleString()}` },
          { label: 'Valid Until',   value: quotation.validUntil },
        ].map((s) => (
          <Card key={s.label} padding="sm">
            <p className="text-xs text-[var(--color-neutral-400)] mb-0.5">{s.label}</p>
            <p className="text-sm font-semibold text-[var(--color-neutral-800)]">{s.value}</p>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <div className="border-b border-[var(--color-neutral-200)]">
        <div className="flex gap-0">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key
                  ? 'border-[var(--color-primary-500)] text-[var(--color-primary-600)]'
                  : 'border-transparent text-[var(--color-neutral-400)] hover:text-[var(--color-neutral-800)]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-3 gap-4">
          {/* Client Info */}
          <Card>
            <CardHeader><CardTitle>Client</CardTitle></CardHeader>
            <div className="space-y-2 text-sm">
              {[
                { label: 'Name',    value: quotation.client.name },
                { label: 'Email',   value: quotation.client.email },
                { label: 'Phone',   value: quotation.client.phone },
                { label: 'Country', value: quotation.client.country },
              ].map((f) => (
                <div key={f.label}>
                  <p className="text-xs text-[var(--color-neutral-400)]">{f.label}</p>
                  <p className="font-medium text-[var(--color-neutral-800)]">{f.value}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Shipment Details */}
          <Card>
            <CardHeader><CardTitle>Shipment Details</CardTitle></CardHeader>
            <div className="space-y-3 text-sm">
              {[
                { label: 'Origin',       value: `${quotation.origin.city}, ${quotation.origin.country}` },
                { label: 'Destination',  value: `${quotation.destination.city}, ${quotation.destination.country}` },
                { label: 'Mode',         value: quotation.mode },
                { label: 'Service',      value: quotation.serviceType },
                { label: 'Incoterm',     value: quotation.incoterm },
                { label: 'Commodity',    value: quotation.commodity },
                { label: 'Pieces',       value: `${quotation.pieces} pcs` },
                { label: 'Gross Weight', value: `${quotation.grossWeight} kg` },
                { label: 'Volume',       value: `${quotation.volume} CBM` },
              ].map((f) => (
                <div key={f.label} className="flex justify-between">
                  <span className="text-[var(--color-neutral-400)]">{f.label}</span>
                  <span className="font-medium text-[var(--color-neutral-800)] font-mono">{f.value}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Cost Breakdown + Notes */}
          <div className="space-y-4">
            <Card>
              <CardHeader><CardTitle>Cost Breakdown</CardTitle></CardHeader>
              <div className="space-y-2 text-sm">
                {Object.entries(byCategory).map(([cat, amt]) => (
                  <div key={cat} className="flex justify-between">
                    <span className="text-[var(--color-neutral-400)]">{cat}</span>
                    <span className="font-mono font-medium text-[var(--color-neutral-800)]">
                      AED {amt.toLocaleString()}
                    </span>
                  </div>
                ))}
                <div className="flex justify-between pt-2 border-t border-[var(--color-neutral-200)]">
                  <span className="font-semibold">Total</span>
                  <span className="font-mono font-bold text-[var(--color-primary-600)]">
                    AED {total.toLocaleString()}
                  </span>
                </div>
              </div>
            </Card>
            <Card>
              <CardHeader><CardTitle>Notes</CardTitle></CardHeader>
              <p className="text-sm text-[var(--color-neutral-600)]">{quotation.notes}</p>
            </Card>
            {quotation.specialRequirements && (
              <Card>
                <CardHeader><CardTitle>Special Requirements</CardTitle></CardHeader>
                <p className="text-sm text-[var(--color-neutral-600)]">{quotation.specialRequirements}</p>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* Charges Tab */}
      {activeTab === 'charges' && (
        <div className="space-y-4">
          <div className="flex justify-end gap-2">
            <Button variant="secondary" size="sm">+ Add Charge</Button>
            <Button size="sm">Recalculate Total</Button>
          </div>
          <Card padding="none">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead>Rate</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Currency</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {charges.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.description}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${categoryColors[c.category]}`}>
                        {c.category}
                      </span>
                    </TableCell>
                    <TableCell mono>{c.quantity}</TableCell>
                    <TableCell>{c.unit}</TableCell>
                    <TableCell mono>{c.rate.toFixed(2)}</TableCell>
                    <TableCell mono className="font-semibold">{c.amount.toLocaleString()}</TableCell>
                    <TableCell>{c.currency}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <button className="text-xs text-[var(--color-primary-500)] hover:underline">Edit</button>
                        <button className="text-xs text-[var(--color-danger-500)] hover:underline">Remove</button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
          <div className="flex justify-end">
            <Card className="w-56">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between pt-1">
                  <span className="font-semibold">Grand Total</span>
                  <span className="font-mono font-bold text-[var(--color-primary-600)]">
                    AED {total.toLocaleString()}
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Versions Tab */}
      {activeTab === 'versions' && (
        <div className="space-y-3">
          <div className="flex justify-end">
            <Button size="sm">+ New Version</Button>
          </div>
          <Card padding="none">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Version</TableHead>
                  <TableHead>Created On</TableHead>
                  <TableHead>Created By</TableHead>
                  <TableHead>Total Amount</TableHead>
                  <TableHead>Currency</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {versions.map((v) => (
                  <TableRow key={v.id}>
                    <TableCell mono className="font-semibold">{v.version}</TableCell>
                    <TableCell mono>{v.createdAt}</TableCell>
                    <TableCell>{v.createdBy}</TableCell>
                    <TableCell mono className="font-semibold">
                      {v.currency} {v.totalAmount.toLocaleString()}
                    </TableCell>
                    <TableCell>{v.currency}</TableCell>
                    <TableCell>
                      <Badge variant={v.status === 'Current' ? 'success' : 'neutral'}>
                        {v.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <button className="text-xs text-[var(--color-primary-500)] hover:underline">View</button>
                        <button className="text-xs text-[var(--color-neutral-400)] hover:underline">Compare</button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </div>
      )}
    </div>
  );
}