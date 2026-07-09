import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import {
  Table, TableHeader, TableBody,
  TableRow, TableHead, TableCell
} from '../../components/ui/Table';

interface SeaFCLJob {
  id: string;
  jobNo: string;
  jobType: 'Export' | 'Import';
  status: 'Open' | 'In Progress' | 'Completed' | 'Cancelled';
  createdAt: string;
  shipper: { name: string; address: string; country: string };
  consignee: { name: string; address: string; country: string };
  notifyParty: { name: string; address: string; country: string };
  agent: { name: string; country: string };
  shippingLine: string;
  vessel: string;
  voyage: string;
  pol: { port: string; code: string; country: string };
  pod: { port: string; code: string; country: string };
  etd: string;
  eta: string;
  atd: string;
  mblNo: string;
  hblNo: string;
  containerNos: string[];
  containerType: string;
  containers: number;
  commodity: string;
  grossWeight: number;
  volume: number;
  incoterm: string;
  paymentMode: string;
  freightMode: 'Prepaid' | 'Collect';
  specialInstructions: string;
}

interface Container {
  id: string;
  containerNo: string;
  sealNo: string;
  type: string;
  grossWeight: number;
  tare: number;
  netWeight: number;
  volume: number;
  pieces: number;
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

const mockJob: SeaFCLJob = {
  id: '1',
  jobNo: 'KFW/SE/06/26/00089',
  jobType: 'Export',
  status: 'In Progress',
  createdAt: '2026-06-10',
  shipper: { name: 'Jumeirah Group', address: 'P.O. Box 11416, Dubai', country: 'UAE' },
  consignee: { name: 'Hamburg Logistics GmbH', address: 'Speicherstadt 12, Hamburg', country: 'Germany' },
  notifyParty: { name: 'Hamburg Logistics GmbH', address: 'Speicherstadt 12, Hamburg', country: 'Germany' },
  agent: { name: 'DB Schenker Germany', country: 'Germany' },
  shippingLine: 'Maersk Line',
  vessel: 'MSC Gülsün',
  voyage: '062W',
  pol: { port: 'Jebel Ali Port', code: 'AEJEA', country: 'UAE' },
  pod: { port: 'Hamburg Port', code: 'DEHAM', country: 'Germany' },
  etd: '2026-06-28',
  eta: '2026-07-15',
  atd: '',
  mblNo: 'MAEU123456789',
  hblNo: 'KFW-HBL-00089',
  containerNos: ['MSKU1234567', 'MSKU7654321'],
  containerType: "20'GP",
  containers: 2,
  commodity: 'Household Goods — General Cargo',
  grossWeight: 18500,
  volume: 42.5,
  incoterm: 'CFR Hamburg',
  paymentMode: 'Prepaid',
  freightMode: 'Prepaid',
  specialInstructions: 'Keep dry. Do not stack more than 3 high.',
};

const mockContainers: Container[] = [
  { id: '1', containerNo: 'MSKU1234567', sealNo: 'SL-001-2026', type: "20'GP", grossWeight: 9800,  tare: 2200, netWeight: 7600, volume: 21.5, pieces: 145 },
  { id: '2', containerNo: 'MSKU7654321', sealNo: 'SL-002-2026', type: "20'GP", grossWeight: 8700,  tare: 2200, netWeight: 6500, volume: 21.0, pieces: 132 },
];

const mockCharges: ChargeItem[] = [
  { id: '1', description: 'Ocean Freight',          type: 'Revenue', quantity: 2,  unit: 'CNT', rate: 2800,  amount: 5600,  currency: 'USD' },
  { id: '2', description: 'Origin THC',             type: 'Revenue', quantity: 2,  unit: 'CNT', rate: 350,   amount: 700,   currency: 'AED' },
  { id: '3', description: 'Documentation Fee',      type: 'Revenue', quantity: 1,  unit: 'BL',  rate: 300,   amount: 300,   currency: 'AED' },
  { id: '4', description: 'Export Customs',         type: 'Revenue', quantity: 1,  unit: 'SHP', rate: 450,   amount: 450,   currency: 'AED' },
  { id: '5', description: 'Liner Buy Rate',         type: 'Cost',    quantity: 2,  unit: 'CNT', rate: 2200,  amount: 4400,  currency: 'USD' },
  { id: '6', description: 'Origin THC Cost',        type: 'Cost',    quantity: 2,  unit: 'CNT', rate: 280,   amount: 560,   currency: 'AED' },
  { id: '7', description: 'Customs Agent Cost',     type: 'Cost',    quantity: 1,  unit: 'SHP', rate: 300,   amount: 300,   currency: 'AED' },
];

const mockDocuments: JobDocument[] = [
  { id: '1', name: 'House Bill of Lading',  type: 'HBL',         uploadDate: '2026-06-18', size: '390 KB', status: 'Uploaded' },
  { id: '2', name: 'Master Bill of Lading', type: 'MBL',         uploadDate: '2026-06-18', size: '410 KB', status: 'Uploaded' },
  { id: '3', name: 'Commercial Invoice',    type: 'Invoice',     uploadDate: '2026-06-15', size: '245 KB', status: 'Uploaded' },
  { id: '4', name: 'Packing List',          type: 'Packing',     uploadDate: '2026-06-15', size: '180 KB', status: 'Uploaded' },
  { id: '5', name: 'Cargo Manifest',        type: 'Manifest',    uploadDate: '2026-06-19', size: '520 KB', status: 'Uploaded' },
  { id: '6', name: 'Certificate of Origin', type: 'Certificate', uploadDate: '',           size: '',       status: 'Pending' },
];

const mockTracking: TrackingEvent[] = [
  { id: '1', event: 'Job Created',              location: 'Dubai, UAE',      date: '2026-06-10', time: '09:00', remarks: 'FCL Export job booked with Maersk' },
  { id: '2', event: 'Booking Confirmed',        location: 'Dubai, UAE',      date: '2026-06-12', time: '11:30', remarks: 'Maersk booking confirmed — ref MAEU123456789' },
  { id: '3', event: 'Container Released',       location: 'Jebel Ali Port',  date: '2026-06-20', time: '08:00', remarks: '2x 20GP containers released for stuffing' },
  { id: '4', event: 'Cargo Stuffed & Sealed',   location: 'Shipper Warehouse', date: '2026-06-22', time: '14:00', remarks: 'Containers stuffed, sealed and returned to port' },
  { id: '5', event: 'Gate In at Port',          location: 'Jebel Ali Port',  date: '2026-06-24', time: '10:00', remarks: 'Both containers gated in at Jebel Ali' },
];

const statusVariant: Record<SeaFCLJob['status'], 'success' | 'warning' | 'neutral' | 'danger'> = {
  'Completed':   'success',
  'In Progress': 'warning',
  'Open':        'neutral',
  'Cancelled':   'danger',
};

type Tab = 'overview' | 'containers' | 'charges' | 'documents' | 'tracking';

const tabs: { key: Tab; label: string }[] = [
  { key: 'overview',    label: '📋 Overview' },
  { key: 'containers',  label: '📦 Containers' },
  { key: 'charges',     label: '💰 Charges' },
  { key: 'documents',   label: '📄 Documents' },
  { key: 'tracking',    label: '📍 Tracking' },
];

export default function SeaFCLJobDetail() {
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  const { data: job }             = useQuery<SeaFCLJob>({ queryKey: ['sea-job', '1'],       queryFn: async () => mockJob });
  const { data: containers = [] } = useQuery<Container[]>({ queryKey: ['sea-containers','1'], queryFn: async () => mockContainers });
  const { data: charges = [] }    = useQuery<ChargeItem[]>({ queryKey: ['sea-charges','1'],   queryFn: async () => mockCharges });
  const { data: documents = [] }  = useQuery<JobDocument[]>({ queryKey: ['sea-docs','1'],     queryFn: async () => mockDocuments });
  const { data: tracking = [] }   = useQuery<TrackingEvent[]>({ queryKey: ['sea-track','1'], queryFn: async () => mockTracking });

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
            <span className="text-2xl">🚢</span>
            <h1 className="text-lg font-semibold text-[var(--color-neutral-800)] font-mono">
              {job.jobNo}
            </h1>
            <Badge variant={statusVariant[job.status]}>{job.status}</Badge>
            <span className="px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700">
              Sea FCL {job.jobType}
            </span>
          </div>
          <p className="text-sm text-[var(--color-neutral-400)]">
            {job.pol.code} → {job.pod.code} · {job.vessel} · Voyage {job.voyage} · Created {job.createdAt}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary">🖨 Print</Button>
          <Button variant="secondary">📄 Generate HBL</Button>
          <Button>Edit Job</Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-5 gap-3">
        {[
          { label: 'Vessel / Voyage',    value: `${job.vessel} / ${job.voyage}` },
          { label: 'ETD',                value: job.etd },
          { label: 'ETA',                value: job.eta },
          { label: 'Containers',         value: `${job.containers}x ${job.containerType}` },
          { label: 'Gross Weight',       value: `${job.grossWeight.toLocaleString()} kg` },
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
          {/* Parties */}
          <div className="space-y-4">
            {[
              { title: 'Shipper',       party: job.shipper },
              { title: 'Consignee',     party: job.consignee },
              { title: 'Notify Party',  party: job.notifyParty },
            ].map((p) => (
              <Card key={p.title}>
                <CardHeader><CardTitle>{p.title}</CardTitle></CardHeader>
                <div className="space-y-1 text-sm">
                  <p className="font-medium text-[var(--color-neutral-800)]">{p.party.name}</p>
                  <p className="text-[var(--color-neutral-400)]">{p.party.address}</p>
                  <p className="text-[var(--color-neutral-400)]">{p.party.country}</p>
                </div>
              </Card>
            ))}
          </div>

          {/* Vessel & Port Details */}
          <Card>
            <CardHeader><CardTitle>Vessel & Port Details</CardTitle></CardHeader>
            <div className="space-y-3 text-sm">
              {[
                { label: 'Shipping Line',  value: job.shippingLine },
                { label: 'Vessel',         value: job.vessel },
                { label: 'Voyage',         value: job.voyage },
                { label: 'MBL No.',        value: job.mblNo },
                { label: 'HBL No.',        value: job.hblNo },
                { label: 'POL',            value: `${job.pol.port} (${job.pol.code})` },
                { label: 'POD',            value: `${job.pod.port} (${job.pod.code})` },
                { label: 'ETD',            value: job.etd },
                { label: 'ETA',            value: job.eta },
                { label: 'Incoterm',       value: job.incoterm },
                { label: 'Freight Mode',   value: job.freightMode },
              ].map((f) => (
                <div key={f.label} className="flex justify-between">
                  <span className="text-[var(--color-neutral-400)]">{f.label}</span>
                  <span className="font-medium text-[var(--color-neutral-800)] font-mono text-right max-w-40 truncate">{f.value}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Cargo & P&L */}
          <div className="space-y-4">
            <Card>
              <CardHeader><CardTitle>Cargo Details</CardTitle></CardHeader>
              <div className="space-y-3 text-sm">
                {[
                  { label: 'Commodity',    value: job.commodity },
                  { label: 'Containers',   value: `${job.containers}x ${job.containerType}` },
                  { label: 'Gross Weight', value: `${job.grossWeight.toLocaleString()} kg` },
                  { label: 'Volume',       value: `${job.volume} CBM` },
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
                  <span className="font-mono font-semibold text-[var(--color-neutral-800)]">{revenue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--color-neutral-400)]">Cost</span>
                  <span className="font-mono font-semibold text-[var(--color-danger-500)]">{cost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-[var(--color-neutral-200)]">
                  <span className="font-semibold">Profit</span>
                  <span className="font-mono font-bold text-[var(--color-success-500)]">{profit.toLocaleString()}</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Containers Tab */}
      {activeTab === 'containers' && (
        <div className="space-y-3">
          <div className="flex justify-end">
            <Button size="sm">+ Add Container</Button>
          </div>
          <Card padding="none">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Container No.</TableHead>
                  <TableHead>Seal No.</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Gross Weight</TableHead>
                  <TableHead>Tare</TableHead>
                  <TableHead>Net Weight</TableHead>
                  <TableHead>Volume (CBM)</TableHead>
                  <TableHead>Pieces</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {containers.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell mono className="font-semibold">{c.containerNo}</TableCell>
                    <TableCell mono>{c.sealNo}</TableCell>
                    <TableCell>{c.type}</TableCell>
                    <TableCell mono>{c.grossWeight.toLocaleString()} kg</TableCell>
                    <TableCell mono>{c.tare.toLocaleString()} kg</TableCell>
                    <TableCell mono>{c.netWeight.toLocaleString()} kg</TableCell>
                    <TableCell mono>{c.volume}</TableCell>
                    <TableCell mono>{c.pieces}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
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
                        c.type === 'Revenue' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
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
          <div className="flex justify-end">
            <Card className="w-64">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[var(--color-neutral-400)]">Total Revenue</span>
                  <span className="font-mono font-semibold text-[var(--color-success-500)]">{revenue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--color-neutral-400)]">Total Cost</span>
                  <span className="font-mono font-semibold text-[var(--color-danger-500)]">{cost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-[var(--color-neutral-200)]">
                  <span className="font-semibold">Net Profit</span>
                  <span className="font-mono font-bold text-[var(--color-neutral-800)]">{profit.toLocaleString()}</span>
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
            <Badge variant="warning">In Progress</Badge>
          </CardHeader>
          <div className="relative">
            {tracking.map((event, index) => (
              <div key={event.id} className="flex gap-4 pb-6 last:pb-0">
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