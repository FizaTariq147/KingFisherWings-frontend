import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import {
  Table, TableHeader, TableBody,
  TableRow, TableHead, TableCell
} from '../../components/ui/Table';

interface AirExportJob {
  id: string;
  jobNo: string;
  status: 'Open' | 'In Progress' | 'Completed' | 'Cancelled';
  createdAt: string;
  shipper: { name: string; address: string; country: string };
  consignee: { name: string; address: string; country: string };
  agent: { name: string; country: string };
  origin: { airport: string; code: string; country: string };
  destination: { airport: string; code: string; country: string };
  airline: string;
  flightNo: string;
  mawbNo: string;
  hawbNo: string;
  etd: string;
  eta: string;
  atd: string;
  pieces: number;
  grossWeight: number;
  chargeableWeight: number;
  volume: number;
  commodity: string;
  incoterm: string;
  paymentMode: string;
  specialInstructions: string;
}

interface ChargeItem {
  id: string;
  description: string;
  type: 'Revenue' | 'Cost';
  quantity: number;
  unit: string;
  rate: number;
  amount: number;
  currency: string;
}

interface JobDocument {
  id: string;
  name: string;
  type: string;
  uploadDate: string;
  size: string;
  status: 'Uploaded' | 'Pending';
}

interface TrackingEvent {
  id: string;
  event: string;
  location: string;
  date: string;
  time: string;
  remarks: string;
}

const mockJob: AirExportJob = {
  id: '1',
  jobNo: 'KFW/AE/06/26/00141',
  status: 'In Progress',
  createdAt: '2026-06-20',
  shipper: { name: 'Al Futtaim LLC', address: 'P.O. Box 152, Dubai', country: 'UAE' },
  consignee: { name: 'British Airways Cargo', address: 'Heathrow Airport, London', country: 'UK' },
  agent: { name: 'DHL Global Forwarding', country: 'UK' },
  origin: { airport: 'Dubai International Airport', code: 'DXB', country: 'UAE' },
  destination: { airport: 'London Heathrow Airport', code: 'LHR', country: 'UK' },
  airline: 'Emirates',
  flightNo: 'EK 001',
  mawbNo: '176-12345678',
  hawbNo: 'KFW-HAWB-00141',
  etd: '2026-06-25',
  eta: '2026-06-26',
  atd: '2026-06-25',
  pieces: 12,
  grossWeight: 480,
  chargeableWeight: 520,
  volume: 2.4,
  commodity: 'Electronics — General Cargo',
  incoterm: 'FOB Dubai',
  paymentMode: 'Prepaid',
  specialInstructions: 'Handle with care. Temperature sensitive cargo.',
};

const mockCharges: ChargeItem[] = [
  { id: '1', description: 'Air Freight Charges',   type: 'Revenue', quantity: 520,  unit: 'KG',  rate: 12.50, amount: 6500,  currency: 'AED' },
  { id: '2', description: 'Fuel Surcharge',         type: 'Revenue', quantity: 520,  unit: 'KG',  rate: 3.20,  amount: 1664,  currency: 'AED' },
  { id: '3', description: 'Security Surcharge',     type: 'Revenue', quantity: 12,   unit: 'PCS', rate: 25.00, amount: 300,   currency: 'AED' },
  { id: '4', description: 'Documentation Fee',      type: 'Revenue', quantity: 1,    unit: 'BL',  rate: 250,   amount: 250,   currency: 'AED' },
  { id: '5', description: 'Airport Handling Fee',   type: 'Revenue', quantity: 480,  unit: 'KG',  rate: 1.80,  amount: 864,   currency: 'AED' },
  { id: '6', description: 'Airline Buy Rate',       type: 'Cost',    quantity: 520,  unit: 'KG',  rate: 9.00,  amount: 4680,  currency: 'AED' },
  { id: '7', description: 'Ground Handling Cost',   type: 'Cost',    quantity: 480,  unit: 'KG',  rate: 1.20,  amount: 576,   currency: 'AED' },
  { id: '8', description: 'Customs Clearance Cost', type: 'Cost',    quantity: 1,    unit: 'SHP', rate: 350,   amount: 350,   currency: 'AED' },
];

const mockDocuments: JobDocument[] = [
  { id: '1', name: 'House Air Waybill',    type: 'HAWB',        uploadDate: '2026-06-22', size: '320 KB', status: 'Uploaded' },
  { id: '2', name: 'Master Air Waybill',   type: 'MAWB',        uploadDate: '2026-06-22', size: '280 KB', status: 'Uploaded' },
  { id: '3', name: 'Commercial Invoice',   type: 'Invoice',     uploadDate: '2026-06-20', size: '245 KB', status: 'Uploaded' },
  { id: '4', name: 'Packing List',         type: 'Packing',     uploadDate: '2026-06-20', size: '180 KB', status: 'Uploaded' },
  { id: '5', name: 'Export Declaration',   type: 'Customs',     uploadDate: '',           size: '',       status: 'Pending' },
  { id: '6', name: 'Certificate of Origin', type: 'Certificate', uploadDate: '',          size: '',       status: 'Pending' },
];

const mockTracking: TrackingEvent[] = [
  { id: '1', event: 'Shipment Booked',          location: 'Dubai, UAE',   date: '2026-06-20', time: '10:30', remarks: 'Job created and confirmed' },
  { id: '2', event: 'Documents Received',        location: 'Dubai, UAE',   date: '2026-06-22', time: '14:00', remarks: 'All shipper documents received' },
  { id: '3', event: 'Cargo Received at Airline', location: 'DXB Airport',  date: '2026-06-24', time: '09:00', remarks: 'Cargo handed over to Emirates Cargo' },
  { id: '4', event: 'Flight Departed',           location: 'DXB Airport',  date: '2026-06-25', time: '02:15', remarks: 'EK 001 departed on schedule' },
  { id: '5', event: 'In Transit',                location: 'In Flight',    date: '2026-06-25', time: '06:00', remarks: 'En route to London Heathrow' },
];

const statusVariant: Record<AirExportJob['status'], 'success' | 'warning' | 'neutral' | 'danger'> = {
  'Completed':   'success',
  'In Progress': 'warning',
  'Open':        'neutral',
  'Cancelled':   'danger',
};

type Tab = 'overview' | 'charges' | 'documents' | 'tracking';

const tabs: { key: Tab; label: string }[] = [
  { key: 'overview',   label: '📋 Overview' },
  { key: 'charges',    label: '💰 Charges' },
  { key: 'documents',  label: '📄 Documents' },
  { key: 'tracking',   label: '📍 Tracking' },
];

export default function AirExportJobDetail() {
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  const { data: job }             = useQuery<AirExportJob>({ queryKey: ['job', '1'],       queryFn: async () => mockJob });
  const { data: charges = [] }    = useQuery<ChargeItem[]>({ queryKey: ['job-charges','1'], queryFn: async () => mockCharges });
  const { data: documents = [] }  = useQuery<JobDocument[]>({ queryKey: ['job-docs','1'],   queryFn: async () => mockDocuments });
  const { data: tracking = [] }   = useQuery<TrackingEvent[]>({ queryKey: ['job-track','1'], queryFn: async () => mockTracking });

  if (!job) return null;

  const revenue = charges.filter((c) => c.type === 'Revenue').reduce((s, c) => s + c.amount, 0);
  const cost    = charges.filter((c) => c.type === 'Cost').reduce((s, c) => s + c.amount, 0);
  const profit  = revenue - cost;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <span className="text-2xl">✈️</span>
            <h1 className="text-lg font-semibold text-[var(--color-neutral-800)] font-mono">
              {job.jobNo}
            </h1>
            <Badge variant={statusVariant[job.status]}>{job.status}</Badge>
          </div>
          <p className="text-sm text-[var(--color-neutral-400)]">
            Air Export · Created {job.createdAt} · {job.origin.code} → {job.destination.code}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary">🖨 Print</Button>
          <Button variant="secondary">📄 Generate HAWB</Button>
          <Button>Edit Job</Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-5 gap-3">
        {[
          { label: 'Flight',            value: job.flightNo },
          { label: 'ETD',               value: job.etd },
          { label: 'ETA',               value: job.eta },
          { label: 'Pieces / Weight',   value: `${job.pieces} pcs / ${job.grossWeight} kg` },
          { label: 'Chargeable Weight', value: `${job.chargeableWeight} kg` },
        ].map((s) => (
          <Card key={s.label} padding="sm">
            <p className="text-xs text-[var(--color-neutral-400)] mb-0.5">{s.label}</p>
            <p className="text-sm font-semibold text-[var(--color-neutral-800)] font-mono">{s.value}</p>
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
          {/* Shipper & Consignee */}
          <div className="space-y-4">
            <Card>
              <CardHeader><CardTitle>Shipper</CardTitle></CardHeader>
              <div className="space-y-1 text-sm">
                <p className="font-medium text-[var(--color-neutral-800)]">{job.shipper.name}</p>
                <p className="text-[var(--color-neutral-400)]">{job.shipper.address}</p>
                <p className="text-[var(--color-neutral-400)]">{job.shipper.country}</p>
              </div>
            </Card>
            <Card>
              <CardHeader><CardTitle>Consignee</CardTitle></CardHeader>
              <div className="space-y-1 text-sm">
                <p className="font-medium text-[var(--color-neutral-800)]">{job.consignee.name}</p>
                <p className="text-[var(--color-neutral-400)]">{job.consignee.address}</p>
                <p className="text-[var(--color-neutral-400)]">{job.consignee.country}</p>
              </div>
            </Card>
            <Card>
              <CardHeader><CardTitle>Overseas Agent</CardTitle></CardHeader>
              <div className="space-y-1 text-sm">
                <p className="font-medium text-[var(--color-neutral-800)]">{job.agent.name}</p>
                <p className="text-[var(--color-neutral-400)]">{job.agent.country}</p>
              </div>
            </Card>
          </div>

          {/* Flight Details */}
          <Card>
            <CardHeader><CardTitle>Flight Details</CardTitle></CardHeader>
            <div className="space-y-3 text-sm">
              {[
                { label: 'Airline',             value: job.airline },
                { label: 'Flight No.',          value: job.flightNo },
                { label: 'MAWB No.',            value: job.mawbNo },
                { label: 'HAWB No.',            value: job.hawbNo },
                { label: 'Origin',              value: `${job.origin.airport} (${job.origin.code})` },
                { label: 'Destination',         value: `${job.destination.airport} (${job.destination.code})` },
                { label: 'ETD',                 value: job.etd },
                { label: 'ETA',                 value: job.eta },
                { label: 'ATD',                 value: job.atd },
                { label: 'Incoterm',            value: job.incoterm },
                { label: 'Payment Mode',        value: job.paymentMode },
              ].map((f) => (
                <div key={f.label} className="flex justify-between">
                  <span className="text-[var(--color-neutral-400)]">{f.label}</span>
                  <span className="font-medium text-[var(--color-neutral-800)] font-mono text-right">{f.value}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Cargo Details */}
          <div className="space-y-4">
            <Card>
              <CardHeader><CardTitle>Cargo Details</CardTitle></CardHeader>
              <div className="space-y-3 text-sm">
                {[
                  { label: 'Commodity',          value: job.commodity },
                  { label: 'Pieces',             value: `${job.pieces} pcs` },
                  { label: 'Gross Weight',        value: `${job.grossWeight} kg` },
                  { label: 'Chargeable Weight',   value: `${job.chargeableWeight} kg` },
                  { label: 'Volume',              value: `${job.volume} CBM` },
                ].map((f) => (
                  <div key={f.label} className="flex justify-between">
                    <span className="text-[var(--color-neutral-400)]">{f.label}</span>
                    <span className="font-medium text-[var(--color-neutral-800)] font-mono">{f.value}</span>
                  </div>
                ))}
              </div>
            </Card>
            <Card>
              <CardHeader><CardTitle>Special Instructions</CardTitle></CardHeader>
              <p className="text-sm text-[var(--color-neutral-600)]">{job.specialInstructions}</p>
            </Card>
            <Card>
              <CardHeader><CardTitle>P&L Summary</CardTitle></CardHeader>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[var(--color-neutral-400)]">Revenue</span>
                  <span className="font-mono font-semibold text-[var(--color-neutral-800)]">AED {revenue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--color-neutral-400)]">Cost</span>
                  <span className="font-mono font-semibold text-[var(--color-danger-500)]">AED {cost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-[var(--color-neutral-200)]">
                  <span className="font-semibold text-[var(--color-neutral-800)]">Profit</span>
                  <span className="font-mono font-bold text-[var(--color-success-500)]">AED {profit.toLocaleString()}</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Charges Tab */}
      {activeTab === 'charges' && (
        <div className="space-y-4">
          <div className="flex justify-end gap-2">
            <Button variant="secondary" size="sm">+ Add Charge</Button>
            <Button size="sm">Generate Invoice</Button>
          </div>
          <Card padding="none">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead>Rate</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Currency</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {charges.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.description}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        c.type === 'Revenue'
                          ? 'bg-green-50 text-green-700'
                          : 'bg-red-50 text-red-700'
                      }`}>
                        {c.type}
                      </span>
                    </TableCell>
                    <TableCell mono>{c.quantity}</TableCell>
                    <TableCell>{c.unit}</TableCell>
                    <TableCell mono>{c.rate.toFixed(2)}</TableCell>
                    <TableCell mono className="font-semibold">{c.amount.toLocaleString()}</TableCell>
                    <TableCell>{c.currency}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
          {/* Totals */}
          <div className="flex justify-end">
            <Card className="w-64">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[var(--color-neutral-400)]">Total Revenue</span>
                  <span className="font-mono font-semibold text-[var(--color-success-500)]">AED {revenue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--color-neutral-400)]">Total Cost</span>
                  <span className="font-mono font-semibold text-[var(--color-danger-500)]">AED {cost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-[var(--color-neutral-200)]">
                  <span className="font-semibold">Net Profit</span>
                  <span className="font-mono font-bold text-[var(--color-neutral-800)]">AED {profit.toLocaleString()}</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Documents Tab */}
      {activeTab === 'documents' && (
        <div className="space-y-3">
          <div className="flex justify-end">
            <Button size="sm">⬆ Upload Document</Button>
          </div>
          <Card padding="none">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Document</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Upload Date</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {documents.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell className="font-medium">{doc.name}</TableCell>
                    <TableCell>{doc.type}</TableCell>
                    <TableCell mono>{doc.uploadDate || '—'}</TableCell>
                    <TableCell>{doc.size || '—'}</TableCell>
                    <TableCell>
                      <Badge variant={doc.status === 'Uploaded' ? 'success' : 'warning'}>
                        {doc.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {doc.status === 'Uploaded' ? (
                        <div className="flex gap-2">
                          <button className="text-xs text-[var(--color-primary-500)] hover:underline">View</button>
                          <button className="text-xs text-[var(--color-neutral-400)] hover:underline">Download</button>
                        </div>
                      ) : (
                        <button className="text-xs text-[var(--color-warning-500)] hover:underline">Upload</button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </div>
      )}

      {/* Tracking Tab */}
      {activeTab === 'tracking' && (
        <Card>
          <CardHeader>
            <CardTitle>Shipment Timeline</CardTitle>
            <Badge variant="warning">In Transit</Badge>
          </CardHeader>
          <div className="relative">
            {tracking.map((event, index) => (
              <div key={event.id} className="flex gap-4 pb-6 last:pb-0">
                {/* Timeline line */}
                <div className="flex flex-col items-center">
                  <div className={`w-3 h-3 rounded-full border-2 shrink-0 mt-1 ${
                    index === tracking.length - 1
                      ? 'border-[var(--color-primary-500)] bg-[var(--color-primary-500)]'
                      : 'border-[var(--color-success-500)] bg-[var(--color-success-500)]'
                  }`} />
                  {index < tracking.length - 1 && (
                    <div className="w-0.5 flex-1 bg-[var(--color-neutral-200)] mt-1" />
                  )}
                </div>
                {/* Event content */}
                <div className="flex-1 pb-2">
                  <div className="flex items-start justify-between">
                    <p className="text-sm font-semibold text-[var(--color-neutral-800)]">{event.event}</p>
                    <span className="text-xs font-mono text-[var(--color-neutral-400)]">
                      {event.date} {event.time}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--color-primary-600)] mb-0.5">📍 {event.location}</p>
                  <p className="text-xs text-[var(--color-neutral-400)]">{event.remarks}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}