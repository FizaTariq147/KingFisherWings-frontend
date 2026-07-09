import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import {
  Table, TableHeader, TableBody,
  TableRow, TableHead, TableCell
} from '../../components/ui/Table';

interface Customer {
  id: string;
  code: string;
  name: string;
  email: string;
  phone: string;
  country: string;
  type: 'Shipper' | 'Consignee' | 'Agent' | 'Both';
  totalShipments: number;
  outstandingAR: number;
  currency: string;
  status: 'Active' | 'Inactive';
}

const mockCustomers: Customer[] = [
  { id: '1', code: 'AFC001', name: 'Al Futtaim LLC',    email: 'logistics@alfuttaim.ae',   phone: '+971 4 200 0000', country: 'UAE',          type: 'Both',      totalShipments: 28, outstandingAR: 12500, currency: 'AED', status: 'Active' },
  { id: '2', code: 'JGP002', name: 'Jumeirah Group',    email: 'supply@jumeirah.com',       phone: '+971 4 301 0000', country: 'UAE',          type: 'Shipper',   totalShipments: 19, outstandingAR: 8750,  currency: 'AED', status: 'Active' },
  { id: '3', code: 'DPW003', name: 'DP World',          email: 'freight@dpworld.com',       phone: '+971 4 881 5555', country: 'UAE',          type: 'Both',      totalShipments: 34, outstandingAR: 0,     currency: 'AED', status: 'Active' },
  { id: '4', code: 'EKA004', name: 'Emirates Airlines', email: 'cargo@emirates.com',        phone: '+971 4 708 1111', country: 'UAE',          type: 'Consignee', totalShipments: 12, outstandingAR: 18900, currency: 'AED', status: 'Active' },
  { id: '5', code: 'NOO005', name: 'Noon.com',          email: 'ops@noon.com',              phone: '+971 4 440 0000', country: 'UAE',          type: 'Consignee', totalShipments: 22, outstandingAR: 4300,  currency: 'AED', status: 'Active' },
  { id: '6', code: 'CAR006', name: 'Carrefour UAE',     email: 'logistics@carrefour.ae',    phone: '+971 4 200 1111', country: 'UAE',          type: 'Consignee', totalShipments: 16, outstandingAR: 0,     currency: 'AED', status: 'Active' },
  { id: '7', code: 'MAF007', name: 'Majid Al Futtaim', email: 'supply@majidalfuttaim.com', phone: '+971 4 294 9999', country: 'UAE',          type: 'Both',      totalShipments: 9,  outstandingAR: 6200,  currency: 'AED', status: 'Active' },
  { id: '8', code: 'GFC008', name: 'Gulf Cargo LLC',    email: 'ops@gulfcargo.ae',          phone: '+971 2 555 0000', country: 'UAE',          type: 'Agent',     totalShipments: 7,  outstandingAR: 0,     currency: 'AED', status: 'Inactive' },
  { id: '9', code: 'SAM009', name: 'Samsung Gulf',      email: 'logistics@samsung.ae',      phone: '+971 4 700 0000', country: 'South Korea',  type: 'Shipper',   totalShipments: 11, outstandingAR: 3100,  currency: 'AED', status: 'Active' },
  { id: '10',code: 'AMZ010', name: 'Amazon UAE',        email: 'freight@amazon.ae',         phone: '+971 4 800 0000', country: 'UAE',          type: 'Consignee', totalShipments: 18, outstandingAR: 0,     currency: 'AED', status: 'Active' },
];

const statusVariant: Record<Customer['status'], 'success' | 'neutral'> = {
  Active:   'success',
  Inactive: 'neutral',
};

const typeColors: Record<Customer['type'], string> = {
  Both:      'text-purple-700 bg-purple-50',
  Shipper:   'text-blue-700 bg-blue-50',
  Consignee: 'text-orange-700 bg-orange-50',
  Agent:     'text-green-700 bg-green-50',
};

export default function CustomerList() {
  const [search, setSearch]           = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter]   = useState('All');

  const { data: customers = [] } = useQuery<Customer[]>({
    queryKey: ['customers'],
    queryFn: async () => mockCustomers,
  });

  const filtered = customers.filter((c) => {
    const matchSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'All' || c.status === statusFilter;
    const matchType   = typeFilter   === 'All' || c.type   === typeFilter;
    return matchSearch && matchStatus && matchType;
  });

  const totalAR = customers.reduce((s, c) => s + c.outstandingAR, 0);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-[var(--color-neutral-800)]">Customers</h1>
          <p className="text-sm text-[var(--color-neutral-400)]">{customers.length} total customers</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary">⬇ Export</Button>
          <Button>+ New Customer</Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Customers', value: customers.length.toString(),                                    color: 'text-[var(--color-neutral-800)]' },
          { label: 'Active',          value: customers.filter((c) => c.status === 'Active').length.toString(), color: 'text-[var(--color-success-500)]' },
          { label: 'Total Shipments', value: customers.reduce((s, c) => s + c.totalShipments, 0).toString(), color: 'text-[var(--color-primary-600)]' },
          { label: 'Outstanding AR',  value: `AED ${totalAR.toLocaleString()}`,                              color: 'text-[var(--color-warning-500)]' },
        ].map((card) => (
          <Card key={card.label}>
            <p className="text-xs text-[var(--color-neutral-400)] font-medium mb-1">{card.label}</p>
            <p className={`text-xl font-bold ${card.color}`}>{card.value}</p>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="text"
          placeholder="Search by name, code, or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-9 w-72 rounded-md border border-[var(--color-neutral-200)] px-3 text-sm focus:outline-none focus:border-[var(--color-primary-500)]"
        />
        {/* Status */}
        <div className="flex gap-1">
          {(['All', 'Active', 'Inactive'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                statusFilter === s
                  ? 'bg-[var(--color-primary-500)] text-white'
                  : 'bg-white border border-[var(--color-neutral-200)] text-[var(--color-neutral-600)] hover:bg-[var(--color-neutral-50)]'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        {/* Type */}
        <div className="flex gap-1">
          {(['All', 'Shipper', 'Consignee', 'Agent', 'Both'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                typeFilter === t
                  ? 'bg-[var(--color-neutral-800)] text-white'
                  : 'bg-white border border-[var(--color-neutral-200)] text-[var(--color-neutral-600)] hover:bg-[var(--color-neutral-50)]'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <Card padding="none">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Country</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Shipments</TableHead>
              <TableHead>Outstanding AR</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((c) => (
              <TableRow key={c.id}>
                <TableCell mono>{c.code}</TableCell>
                <TableCell className="font-medium">{c.name}</TableCell>
                <TableCell className="text-[var(--color-neutral-400)]">{c.email}</TableCell>
                <TableCell mono>{c.phone}</TableCell>
                <TableCell>{c.country}</TableCell>
                <TableCell>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${typeColors[c.type]}`}>
                    {c.type}
                  </span>
                </TableCell>
                <TableCell mono>{c.totalShipments}</TableCell>
                <TableCell mono className={
                  c.outstandingAR > 0
                    ? 'text-[var(--color-warning-500)] font-semibold'
                    : 'text-[var(--color-success-500)]'
                }>
                  {c.outstandingAR > 0 ? `AED ${c.outstandingAR.toLocaleString()}` : 'Clear'}
                </TableCell>
                <TableCell>
                  <Badge variant={statusVariant[c.status]}>{c.status}</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <a href={`/customers/${c.id}`} className="text-xs text-[var(--color-primary-500)] hover:underline">View</a>
                    <button className="text-xs text-[var(--color-neutral-400)] hover:underline">Edit</button>
                    <button className="text-xs text-[var(--color-danger-500)] hover:underline">Delete</button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <td colSpan={10} className="text-center text-[var(--color-neutral-400)] py-8">
                  No customers found.
                </td>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm text-[var(--color-neutral-400)]">
        <span>Showing {filtered.length} of {customers.length} results</span>
        <div className="flex gap-1">
          <button className="px-3 py-1 rounded border border-[var(--color-neutral-200)] hover:bg-[var(--color-neutral-50)]">←</button>
          <button className="px-3 py-1 rounded bg-[var(--color-primary-500)] text-white">1</button>
          <button className="px-3 py-1 rounded border border-[var(--color-neutral-200)] hover:bg-[var(--color-neutral-50)]">→</button>
        </div>
      </div>
    </div>
  );
}