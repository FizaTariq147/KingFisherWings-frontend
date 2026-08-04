import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import {
  Table, TableHeader, TableBody,
  TableRow, TableHead, TableCell
} from '../../components/ui/Table';

interface Customer {
  id: string;
  name: string;
  code: string;
  email: string;
  phone: string;
  country: string;
  city: string;
  type: 'Shipper' | 'Consignee' | 'Agent' | 'Both';
  creditLimit: number;
  currency: string;
  status: 'Active' | 'Inactive';
  since: string;
}

interface Shipment {
  id: string;
  jobNo: string;
  mode: string;
  type: string;
  origin: string;
  destination: string;
  etd: string;
  status: 'Open' | 'In Progress' | 'Completed';
}

interface Document {
  id: string;
  name: string;
  type: string;
  jobRef: string;
  uploadDate: string;
  size: string;
}

interface Invoice {
  id: string;
  invoiceNo: string;
  jobNo: string;
  amount: number;
  currency: string;
  dueDate: string;
  status: 'Unpaid' | 'Paid' | 'Overdue';
}

interface Note {
  id: string;
  author: string;
  date: string;
  content: string;
}

const mockCustomer: Customer = {
  id: '1',
  name: 'Al Futtaim LLC',
  code: 'AFC001',
  email: 'logistics@alfuttaim.ae',
  phone: '+971 4 200 0000',
  country: 'UAE',
  city: 'Dubai',
  type: 'Both',
  creditLimit: 500000,
  currency: 'AED',
  status: 'Active',
  since: '2021-03-15',
};

const mockShipments: Shipment[] = [
  { id: '1', jobNo: 'KFW/AE/06/26/00141', mode: 'Air',  type: 'Export', origin: 'Dubai',    destination: 'London',  etd: '2026-06-25', status: 'In Progress' },
  { id: '2', jobNo: 'KFW/SE/05/26/00089', mode: 'Sea',  type: 'Export', origin: 'Dubai',    destination: 'Hamburg', etd: '2026-05-10', status: 'Completed' },
  { id: '3', jobNo: 'KFW/SI/04/26/00034', mode: 'Sea',  type: 'Import', origin: 'Shanghai', destination: 'Dubai',   etd: '2026-04-20', status: 'Completed' },
];

const mockDocuments: Document[] = [
  { id: '1', name: 'Commercial Invoice',  type: 'Invoice',   jobRef: 'KFW/AE/06/26/00141', uploadDate: '2026-06-20', size: '245 KB' },
  { id: '2', name: 'Packing List',        type: 'Packing',   jobRef: 'KFW/AE/06/26/00141', uploadDate: '2026-06-20', size: '180 KB' },
  { id: '3', name: 'House Air Waybill',   type: 'HAWB',      jobRef: 'KFW/AE/06/26/00141', uploadDate: '2026-06-22', size: '320 KB' },
  { id: '4', name: 'Bill of Lading',      type: 'BL',        jobRef: 'KFW/SE/05/26/00089', uploadDate: '2026-05-12', size: '410 KB' },
];

const mockInvoices: Invoice[] = [
  { id: '1', invoiceNo: 'INV/2026/00234', jobNo: 'KFW/AE/06/26/00141', amount: 12500, currency: 'AED', dueDate: '2026-07-10', status: 'Unpaid' },
  { id: '2', invoiceNo: 'INV/2026/00189', jobNo: 'KFW/SE/05/26/00089', amount: 8750,  currency: 'AED', dueDate: '2026-06-10', status: 'Paid' },
  { id: '3', invoiceNo: 'INV/2026/00145', jobNo: 'KFW/SI/04/26/00034', amount: 6200,  currency: 'AED', dueDate: '2026-05-20', status: 'Overdue' },
];

const mockNotes: Note[] = [
  { id: '1', author: 'Shahzad Zafar', date: '2026-06-20', content: 'Client requested priority handling for all air shipments going forward.' },
  { id: '2', author: 'Ahmed Ali',     date: '2026-06-15', content: 'Credit limit review due next quarter. Currently at 60% utilization.' },
];

const statusVariant: Record<string, 'success' | 'warning' | 'danger' | 'neutral' | 'info'> = {
  Active:      'success',
  Inactive:    'neutral',
  Completed:   'success',
  'In Progress': 'warning',
  Open:        'info',
  Paid:        'success',
  Unpaid:      'warning',
  Overdue:     'danger',
};

type Tab = 'overview' | 'shipments' | 'documents' | 'invoices' | 'notes';

const tabs: { key: Tab; label: string }[] = [
  { key: 'overview',   label: 'Overview' },
  { key: 'shipments',  label: 'Shipment History' },
  { key: 'documents',  label: 'Documents' },
  { key: 'invoices',   label: 'Invoices' },
  { key: 'notes',      label: 'Notes' },
];

export default function CustomerProfile() {
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  const { data: customer } = useQuery<Customer>({
    queryKey: ['customer', '1'],
    queryFn: async () => mockCustomer,
  });

  const { data: shipments = [] } = useQuery<Shipment[]>({
    queryKey: ['customer-shipments', '1'],
    queryFn: async () => mockShipments,
  });

  const { data: documents = [] } = useQuery<Document[]>({
    queryKey: ['customer-documents', '1'],
    queryFn: async () => mockDocuments,
  });

  const { data: invoices = [] } = useQuery<Invoice[]>({
    queryKey: ['customer-invoices', '1'],
    queryFn: async () => mockInvoices,
  });

  const { data: notes = [] } = useQuery<Note[]>({
    queryKey: ['customer-notes', '1'],
    queryFn: async () => mockNotes,
  });

  if (!customer) return null;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-[var(--color-primary-100)] flex items-center justify-center text-xl font-bold text-[var(--color-primary-700)]">
            {customer.name[0]}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-[var(--color-neutral-800)]">{customer.name}</h2>
              <Badge variant={statusVariant[customer.status]}>{customer.status}</Badge>
            </div>
            <p className="text-sm text-[var(--color-neutral-400)]">
              {customer.code} · {customer.type} · Customer since {customer.since}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary">Edit</Button>
          <Button>+ New Job</Button>
        </div>
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

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-3 gap-4">
          {/* Contact Info */}
          <Card className="col-span-2">
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <div className="grid grid-cols-2 gap-4 text-sm">
              {[
                { label: 'Email',        value: customer.email },
                { label: 'Phone',        value: customer.phone },
                { label: 'City',         value: customer.city },
                { label: 'Country',      value: customer.country },
                { label: 'Customer Type', value: customer.type },
                { label: 'Currency',     value: customer.currency },
              ].map((field) => (
                <div key={field.label}>
                  <p className="text-xs text-[var(--color-neutral-400)] mb-0.5">{field.label}</p>
                  <p className="font-medium text-[var(--color-neutral-800)]">{field.value}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Credit Info */}
          <Card>
            <CardHeader>
              <CardTitle>Credit Summary</CardTitle>
            </CardHeader>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-xs text-[var(--color-neutral-400)]">Credit Limit</p>
                <p className="text-lg font-bold text-[var(--color-neutral-800)]">
                  {customer.currency} {customer.creditLimit.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-[var(--color-neutral-400)]">Outstanding AR</p>
                <p className="text-lg font-bold text-[var(--color-danger-500)]">AED 18,700</p>
              </div>
              <div>
                <p className="text-xs text-[var(--color-neutral-400)]">Total Shipments</p>
                <p className="text-lg font-bold text-[var(--color-neutral-800)]">{shipments.length}</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'shipments' && (
        <Card padding="none">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Job No.</TableHead>
                <TableHead>Mode</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Origin</TableHead>
                <TableHead>Destination</TableHead>
                <TableHead>ETD</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {shipments.map((s) => (
                <TableRow key={s.id}>
                  <TableCell mono>{s.jobNo}</TableCell>
                  <TableCell>{s.mode}</TableCell>
                  <TableCell>{s.type}</TableCell>
                  <TableCell>{s.origin}</TableCell>
                  <TableCell>{s.destination}</TableCell>
                  <TableCell mono>{s.etd}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant[s.status]}>{s.status}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {activeTab === 'documents' && (
        <div className="grid grid-cols-3 gap-4">
          {documents.map((doc) => (
            <Card key={doc.id}>
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-[var(--color-primary-50)] flex items-center justify-center text-lg">
                  📄
                </div>
                <Badge variant="neutral">{doc.type}</Badge>
              </div>
              <p className="text-sm font-medium text-[var(--color-neutral-800)] mb-1">{doc.name}</p>
              <p className="text-xs text-[var(--color-neutral-400)] mb-1">Job: {doc.jobRef}</p>
              <p className="text-xs text-[var(--color-neutral-400)] mb-3">{doc.uploadDate} · {doc.size}</p>
              <Button variant="secondary" size="sm" className="w-full">⬇ Download</Button>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'invoices' && (
        <Card padding="none">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice No.</TableHead>
                <TableHead>Job No.</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Currency</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((inv) => (
                <TableRow key={inv.id}>
                  <TableCell mono>{inv.invoiceNo}</TableCell>
                  <TableCell mono>{inv.jobNo}</TableCell>
                  <TableCell mono>{inv.amount.toLocaleString()}</TableCell>
                  <TableCell>{inv.currency}</TableCell>
                  <TableCell mono>{inv.dueDate}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant[inv.status]}>{inv.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <button className="text-xs text-[var(--color-primary-500)] hover:underline">View</button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {activeTab === 'notes' && (
        <div className="space-y-3">
          <div className="flex justify-end">
            <Button size="sm">+ Add Note</Button>
          </div>
          {notes.map((note) => (
            <Card key={note.id}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-[var(--color-primary-500)] flex items-center justify-center text-white text-xs font-semibold">
                    {note.author[0]}
                  </div>
                  <span className="text-sm font-medium text-[var(--color-neutral-800)]">{note.author}</span>
                </div>
                <span className="text-xs text-[var(--color-neutral-400)]">{note.date}</span>
              </div>
              <p className="text-sm text-[var(--color-neutral-600)]">{note.content}</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}