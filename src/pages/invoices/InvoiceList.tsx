import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import {
  Table, TableHeader, TableBody,
  TableRow, TableHead, TableCell
} from '../../components/ui/Table';

interface Invoice {
  id: string;
  invoiceNo: string;
  jobNo: string;
  client: string;
  amount: number;
  currency: string;
  dueDate: string;
  issueDate: string;
  status: 'Unpaid' | 'Paid' | 'Overdue';
}

const mockInvoices: Invoice[] = [
  { id: '1',  invoiceNo: 'INV/2026/00234', jobNo: 'KFW/AE/06/26/00141', client: 'Al Futtaim LLC',    amount: 12500, currency: 'AED', issueDate: '2026-06-20', dueDate: '2026-07-10', status: 'Unpaid' },
  { id: '2',  invoiceNo: 'INV/2026/00233', jobNo: 'KFW/SE/06/26/00089', client: 'Jumeirah Group',    amount: 8750,  currency: 'AED', issueDate: '2026-06-18', dueDate: '2026-07-08', status: 'Unpaid' },
  { id: '3',  invoiceNo: 'INV/2026/00225', jobNo: 'KFW/SI/06/26/00034', client: 'DP World',          amount: 6200,  currency: 'AED', issueDate: '2026-06-10', dueDate: '2026-06-30', status: 'Overdue' },
  { id: '4',  invoiceNo: 'INV/2026/00210', jobNo: 'KFW/AE/06/26/00130', client: 'Emirates Airlines', amount: 18900, currency: 'AED', issueDate: '2026-06-05', dueDate: '2026-06-25', status: 'Paid' },
  { id: '5',  invoiceNo: 'INV/2026/00198', jobNo: 'KFW/RE/06/26/00012', client: 'Noon.com',          amount: 4300,  currency: 'AED', issueDate: '2026-05-28', dueDate: '2026-06-17', status: 'Overdue' },
  { id: '6',  invoiceNo: 'INV/2026/00185', jobNo: 'KFW/SI/05/26/00028', client: 'Carrefour UAE',     amount: 9100,  currency: 'AED', issueDate: '2026-05-20', dueDate: '2026-06-09', status: 'Paid' },
  { id: '7',  invoiceNo: 'INV/2026/00179', jobNo: 'KFW/AE/05/26/00118', client: 'Al Futtaim LLC',    amount: 7650,  currency: 'AED', issueDate: '2026-05-15', dueDate: '2026-06-04', status: 'Paid' },
  { id: '8',  invoiceNo: 'INV/2026/00165', jobNo: 'KFW/SE/05/26/00076', client: 'Majid Al Futtaim',  amount: 22400, currency: 'AED', issueDate: '2026-05-10', dueDate: '2026-05-30', status: 'Paid' },
];

const statusVariant: Record<Invoice['status'], 'warning' | 'success' | 'danger'> = {
  Unpaid:  'warning',
  Paid:    'success',
  Overdue: 'danger',
};

const summary = {
  total:      mockInvoices.reduce((s, i) => s + i.amount, 0),
  unpaid:     mockInvoices.filter((i) => i.status === 'Unpaid').reduce((s, i) => s + i.amount, 0),
  overdue:    mockInvoices.filter((i) => i.status === 'Overdue').reduce((s, i) => s + i.amount, 0),
  paid:       mockInvoices.filter((i) => i.status === 'Paid').reduce((s, i) => s + i.amount, 0),
};

export default function InvoiceList() {
  const [search, setSearch]           = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const { data: invoices = [] } = useQuery<Invoice[]>({
    queryKey: ['invoices'],
    queryFn: async () => mockInvoices,
  });

  const filtered = invoices.filter((inv) => {
    const matchSearch =
      inv.invoiceNo.toLowerCase().includes(search.toLowerCase()) ||
      inv.jobNo.toLowerCase().includes(search.toLowerCase()) ||
      inv.client.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'All' || inv.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-[var(--color-neutral-800)]">Invoices</h1>
          <p className="text-sm text-[var(--color-neutral-400)]">{invoices.length} total invoices</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary">⬇ Export</Button>
          <Button>+ New Invoice</Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Invoiced', value: summary.total,   color: 'text-[var(--color-neutral-800)]' },
          { label: 'Unpaid',         value: summary.unpaid,  color: 'text-[var(--color-warning-500)]' },
          { label: 'Overdue',        value: summary.overdue, color: 'text-[var(--color-danger-500)]' },
          { label: 'Collected',      value: summary.paid,    color: 'text-[var(--color-success-500)]' },
        ].map((card) => (
          <Card key={card.label}>
            <p className="text-xs text-[var(--color-neutral-400)] font-medium mb-1">{card.label}</p>
            <p className={`text-xl font-bold ${card.color}`}>
              AED {card.value.toLocaleString()}
            </p>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <input
          type="text"
          placeholder="Search by invoice no., job no., or client..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-9 w-80 rounded-md border border-[var(--color-neutral-200)] px-3 text-sm focus:outline-none focus:border-[var(--color-primary-500)]"
        />
        {(['All', 'Unpaid', 'Paid', 'Overdue'] as const).map((s) => (
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

      {/* Table */}
      <Card padding="none">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice No.</TableHead>
              <TableHead>Job No.</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Issue Date</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Currency</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((inv) => (
              <TableRow key={inv.id}>
                <TableCell mono>{inv.invoiceNo}</TableCell>
                <TableCell mono>{inv.jobNo}</TableCell>
                <TableCell>{inv.client}</TableCell>
                <TableCell mono>{inv.issueDate}</TableCell>
                <TableCell mono className={
                  inv.status === 'Overdue'
                    ? 'text-[var(--color-danger-500)] font-medium'
                    : ''
                }>
                  {inv.dueDate}
                </TableCell>
                <TableCell mono className="font-semibold">
                  {inv.amount.toLocaleString()}
                </TableCell>
                <TableCell>{inv.currency}</TableCell>
                <TableCell>
                  <Badge variant={statusVariant[inv.status]}>{inv.status}</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <button className="text-xs text-[var(--color-primary-500)] hover:underline">View</button>
                    <button className="text-xs text-[var(--color-neutral-400)] hover:underline">Print</button>
                    {inv.status !== 'Paid' && (
                      <button className="text-xs text-[var(--color-success-500)] hover:underline">Mark Paid</button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <td colSpan={9} className="text-center text-[var(--color-neutral-400)] py-8">
                  No invoices found.
                </td>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm text-[var(--color-neutral-400)]">
        <span>Showing {filtered.length} of {invoices.length} results</span>
        <div className="flex gap-1">
          <button className="px-3 py-1 rounded border border-[var(--color-neutral-200)] hover:bg-[var(--color-neutral-50)]">←</button>
          <button className="px-3 py-1 rounded bg-[var(--color-primary-500)] text-white">1</button>
          <button className="px-3 py-1 rounded border border-[var(--color-neutral-200)] hover:bg-[var(--color-neutral-50)]">→</button>
        </div>
      </div>
    </div>
  );
}