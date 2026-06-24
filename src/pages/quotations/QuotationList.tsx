import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import {
  Table, TableHeader, TableBody,
  TableRow, TableHead, TableCell
} from '../../components/ui/Table';

interface Quotation {
  id: string;
  quoteNo: string;
  client: string;
  origin: string;
  destination: string;
  mode: 'Air' | 'Sea' | 'Road';
  date: string;
  status: 'Draft' | 'Sent' | 'Approved' | 'Rejected';
}

const mockQuotations: Quotation[] = [
  { id: '1', quoteNo: 'QT/2026/001', client: 'Al Futtaim LLC',    origin: 'Dubai',    destination: 'London',   mode: 'Air',  date: '2026-06-01', status: 'Approved' },
  { id: '2', quoteNo: 'QT/2026/002', client: 'Jumeirah Group',    origin: 'Shanghai', destination: 'Dubai',    mode: 'Sea',  date: '2026-06-05', status: 'Sent' },
  { id: '3', quoteNo: 'QT/2026/003', client: 'DP World',          origin: 'Dubai',    destination: 'Mumbai',   mode: 'Road', date: '2026-06-10', status: 'Draft' },
  { id: '4', quoteNo: 'QT/2026/004', client: 'Emirates Airlines', origin: 'New York', destination: 'Dubai',    mode: 'Air',  date: '2026-06-12', status: 'Rejected' },
  { id: '5', quoteNo: 'QT/2026/005', client: 'Noon.com',          origin: 'Dubai',    destination: 'Riyadh',   mode: 'Road', date: '2026-06-15', status: 'Draft' },
];

const statusVariant: Record<Quotation['status'], 'success' | 'info' | 'neutral' | 'danger'> = {
  Approved: 'success',
  Sent:     'info',
  Draft:    'neutral',
  Rejected: 'danger',
};

const modeColors: Record<Quotation['mode'], string> = {
  Air:  'text-purple-600 bg-purple-50',
  Sea:  'text-blue-600 bg-blue-50',
  Road: 'text-orange-600 bg-orange-50',
};

export default function QuotationList() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  const { data: quotations = [] } = useQuery<Quotation[]>({
    queryKey: ['quotations'],
    queryFn: async () => mockQuotations,
  });

  const filtered = quotations.filter((q) => {
    const matchSearch =
      q.quoteNo.toLowerCase().includes(search.toLowerCase()) ||
      q.client.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'All' || q.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-[var(--color-neutral-800)]">Quotations</h1>
          <p className="text-sm text-[var(--color-neutral-400)]">{quotations.length} total quotes</p>
        </div>
        <Button>+ New Quotation</Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <input
          type="text"
          placeholder="Search by quote no. or client..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-9 w-72 rounded-md border border-[var(--color-neutral-200)] px-3 text-sm focus:outline-none focus:border-[var(--color-primary-500)]"
        />
        {(['All', 'Draft', 'Sent', 'Approved', 'Rejected'] as const).map((s) => (
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
              <TableHead>Quote No.</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Origin</TableHead>
              <TableHead>Destination</TableHead>
              <TableHead>Mode</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((q) => (
              <TableRow key={q.id}>
                <TableCell mono>{q.quoteNo}</TableCell>
                <TableCell>{q.client}</TableCell>
                <TableCell>{q.origin}</TableCell>
                <TableCell>{q.destination}</TableCell>
                <TableCell>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${modeColors[q.mode]}`}>
                    {q.mode}
                  </span>
                </TableCell>
                <TableCell>{q.date}</TableCell>
                <TableCell>
                  <Badge variant={statusVariant[q.status]}>{q.status}</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <button className="text-xs text-[var(--color-primary-500)] hover:underline">View</button>
                    <button className="text-xs text-[var(--color-neutral-400)] hover:underline">Edit</button>
                    <button className="text-xs text-[var(--color-danger-500)] hover:underline">Delete</button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-[var(--color-neutral-400)] py-8">
                  No quotations found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm text-[var(--color-neutral-400)]">
        <span>Showing {filtered.length} of {quotations.length} results</span>
        <div className="flex gap-1">
          <button className="px-3 py-1 rounded border border-[var(--color-neutral-200)] hover:bg-[var(--color-neutral-50)]">←</button>
          <button className="px-3 py-1 rounded bg-[var(--color-primary-500)] text-white">1</button>
          <button className="px-3 py-1 rounded border border-[var(--color-neutral-200)] hover:bg-[var(--color-neutral-50)]">→</button>
        </div>
      </div>
    </div>
  );
}