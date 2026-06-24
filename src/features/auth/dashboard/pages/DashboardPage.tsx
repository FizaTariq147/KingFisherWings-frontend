import { Card, CardHeader, CardTitle } from '../../../../components/ui/Card/Card';
import { Badge } from '../../../../components/ui/Badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../../../components/ui/Table';

const kpis = [
  { label: 'Active Jobs',      value: '141',   change: '+12 this week' },
  { label: 'Pending Quotes',   value: '23',    change: '5 expiring soon' },
  { label: 'Invoiced',         value: '$84K',  change: 'This month' },
  { label: 'Profit',           value: '$12K',  change: '14.3% margin' },
];

const recentJobs = [
  { no: 'KFW/AE/06/26/00141', customer: 'Al Futtaim LLC',    type: 'Air Export', status: 'In Transit', etd: '25 Jun 2026' },
  { no: 'KFW/SE/06/26/00089', customer: 'Jumeirah Group',    type: 'Sea Export', status: 'Booked',     etd: '28 Jun 2026' },
  { no: 'KFW/SI/06/26/00034', customer: 'DP World',          type: 'Sea Import', status: 'Delivered',  etd: '20 Jun 2026' },
  { no: 'KFW/AE/06/26/00140', customer: 'Emirates Airlines', type: 'Air Export', status: 'Draft',      etd: '30 Jun 2026' },
];

const statusVariant: Record<string, 'success' | 'warning' | 'info' | 'neutral'> = {
  'Delivered':  'success',
  'In Transit': 'warning',
  'Booked':     'info',
  'Draft':      'neutral',
};

export function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label}>
            <p className="text-xs text-[var(--color-neutral-400)] font-medium">{kpi.label}</p>
            <p className="text-2xl font-bold text-[var(--color-neutral-800)] mt-1">{kpi.value}</p>
            <p className="text-xs text-[var(--color-neutral-400)] mt-1">{kpi.change}</p>
          </Card>
        ))}
      </div>

      {/* Recent Jobs */}
      <Card padding="none">
        <CardHeader className="px-4 pt-4">
          <CardTitle>Recent Jobs</CardTitle>
          <a href="/jobs" className="text-xs text-[var(--color-primary-500)] hover:underline">
            View all
          </a>
        </CardHeader>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Job No.</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>ETD</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentJobs.map((job) => (
              <TableRow key={job.no}>
                <TableCell mono>{job.no}</TableCell>
                <TableCell>{job.customer}</TableCell>
                <TableCell>{job.type}</TableCell>
                <TableCell>
                  <Badge variant={statusVariant[job.status]}>{job.status}</Badge>
                </TableCell>
                <TableCell>{job.etd}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}