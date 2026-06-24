import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import {
  Table, TableHeader, TableBody,
  TableRow, TableHead, TableCell
} from '../../components/ui/Table';

interface Job {
  id: string;
  jobNo: string;
  type: 'Export' | 'Import';
  mode: 'Air' | 'Sea' | 'Road';
  client: string;
  etd: string;
  eta: string;
  status: 'Open' | 'In Progress' | 'Completed';
}

const mockJobs: Job[] = [
  { id: '1', jobNo: 'KFW/AE/06/26/00141', type: 'Export', mode: 'Air',  client: 'Al Futtaim LLC',    etd: '2026-06-25', eta: '2026-06-26', status: 'In Progress' },
  { id: '2', jobNo: 'KFW/SE/06/26/00089', type: 'Export', mode: 'Sea',  client: 'Jumeirah Group',    etd: '2026-06-28', eta: '2026-07-15', status: 'Open' },
  { id: '3', jobNo: 'KFW/SI/06/26/00034', type: 'Import', mode: 'Sea',  client: 'DP World',          etd: '2026-06-10', eta: '2026-06-20', status: 'Completed' },
  { id: '4', jobNo: 'KFW/AE/06/26/00140', type: 'Export', mode: 'Air',  client: 'Emirates Airlines', etd: '2026-06-30', eta: '2026-07-01', status: 'Open' },
  { id: '5', jobNo: 'KFW/RE/06/26/00012', type: 'Export', mode: 'Road', client: 'Noon.com',          etd: '2026-06-24', eta: '2026-06-25', status: 'In Progress' },
  { id: '6', jobNo: 'KFW/SI/06/26/00035', type: 'Import', mode: 'Sea',  client: 'Carrefour UAE',     etd: '2026-06-15', eta: '2026-06-28', status: 'In Progress' },
];

const statusVariant: Record<Job['status'], 'success' | 'warning' | 'neutral'> = {
  'Completed':   'success',
  'In Progress': 'warning',
  'Open':        'neutral',
};

const modeColors: Record<Job['mode'], string> = {
  Air:  'text-purple-600 bg-purple-50',
  Sea:  'text-blue-600 bg-blue-50',
  Road: 'text-orange-600 bg-orange-50',
};

const typeColors: Record<Job['type'], string> = {
  Export: 'text-green-700 bg-green-50',
  Import: 'text-cyan-700 bg-cyan-50',
};

export default function JobList() {
  const [search, setSearch]           = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [modeFilter, setModeFilter]   = useState('All');

  const { data: jobs = [] } = useQuery<Job[]>({
    queryKey: ['jobs'],
    queryFn: async () => mockJobs,
  });

  const filtered = jobs.filter((j) => {
    const matchSearch =
      j.jobNo.toLowerCase().includes(search.toLowerCase()) ||
      j.client.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'All' || j.status === statusFilter;
    const matchMode   = modeFilter   === 'All' || j.mode   === modeFilter;
    return matchSearch && matchStatus && matchMode;
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-[var(--color-neutral-800)]">Jobs</h1>
          <p className="text-sm text-[var(--color-neutral-400)]">{jobs.length} total jobs</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary">Export</Button>
          <Button>+ New Job</Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="text"
          placeholder="Search by job no. or client..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-9 w-72 rounded-md border border-[var(--color-neutral-200)] px-3 text-sm focus:outline-none focus:border-[var(--color-primary-500)]"
        />

        {/* Status filter */}
        <div className="flex items-center gap-1">
          {(['All', 'Open', 'In Progress', 'Completed'] as const).map((s) => (
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

        {/* Mode filter */}
        <div className="flex items-center gap-1">
          {(['All', 'Air', 'Sea', 'Road'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setModeFilter(m)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                modeFilter === m
                  ? 'bg-[var(--color-neutral-800)] text-white'
                  : 'bg-white border border-[var(--color-neutral-200)] text-[var(--color-neutral-600)] hover:bg-[var(--color-neutral-50)]'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <Card padding="none">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Job No.</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Mode</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>ETD</TableHead>
              <TableHead>ETA</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((j) => (
              <TableRow key={j.id}>
                <TableCell mono>{j.jobNo}</TableCell>
                <TableCell>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${typeColors[j.type]}`}>
                    {j.type}
                  </span>
                </TableCell>
                <TableCell>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${modeColors[j.mode]}`}>
                    {j.mode}
                  </span>
                </TableCell>
                <TableCell>{j.client}</TableCell>
                <TableCell mono>{j.etd}</TableCell>
                <TableCell mono>{j.eta}</TableCell>
                <TableCell>
                  <Badge variant={statusVariant[j.status]}>{j.status}</Badge>
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
                  No jobs found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm text-[var(--color-neutral-400)]">
        <span>Showing {filtered.length} of {jobs.length} results</span>
        <div className="flex gap-1">
          <button className="px-3 py-1 rounded border border-[var(--color-neutral-200)] hover:bg-[var(--color-neutral-50)]">←</button>
          <button className="px-3 py-1 rounded bg-[var(--color-primary-500)] text-white">1</button>
          <button className="px-3 py-1 rounded border border-[var(--color-neutral-200)] hover:bg-[var(--color-neutral-50)]">→</button>
        </div>
      </div>
    </div>
  );
}