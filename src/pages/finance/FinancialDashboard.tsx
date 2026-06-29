import { useQuery } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import {
  Table, TableHeader, TableBody,
  TableRow, TableHead, TableCell
} from '../../components/ui/Table';

interface MonthlyRevenue {
  month: string;
  revenue: number;
  expenses: number;
  profit: number;
}

interface TopClient {
  id: string;
  name: string;
  shipments: number;
  revenue: number;
  outstanding: number;
  currency: string;
}

const mockMonthly: MonthlyRevenue[] = [
  { month: 'Jan', revenue: 142000, expenses: 98000,  profit: 44000 },
  { month: 'Feb', revenue: 128000, expenses: 91000,  profit: 37000 },
  { month: 'Mar', revenue: 165000, expenses: 112000, profit: 53000 },
  { month: 'Apr', revenue: 178000, expenses: 119000, profit: 59000 },
  { month: 'May', revenue: 195000, expenses: 131000, profit: 64000 },
  { month: 'Jun', revenue: 210000, expenses: 144000, profit: 66000 },
];

const mockTopClients: TopClient[] = [
  { id: '1', name: 'Al Futtaim LLC',    shipments: 28, revenue: 186500, outstanding: 12500, currency: 'AED' },
  { id: '2', name: 'Jumeirah Group',    shipments: 19, revenue: 142300, outstanding: 8750,  currency: 'AED' },
  { id: '3', name: 'DP World',          shipments: 34, revenue: 128900, outstanding: 0,     currency: 'AED' },
  { id: '4', name: 'Emirates Airlines', shipments: 12, revenue: 98400,  outstanding: 18900, currency: 'AED' },
  { id: '5', name: 'Noon.com',          shipments: 22, revenue: 87600,  outstanding: 4300,  currency: 'AED' },
];

const maxRevenue = Math.max(...mockMonthly.map((m) => m.revenue));

const kpis = [
  {
    label:    'Total Revenue',
    value:    'AED 1,018,000',
    change:   '+12.4% vs last period',
    positive: true,
    icon:     '💰',
  },
  {
    label:    'Outstanding AR',
    value:    'AED 44,450',
    change:   '5 invoices pending',
    positive: false,
    icon:     '📋',
  },
  {
    label:    'AP Due',
    value:    'AED 28,300',
    change:   'Due within 30 days',
    positive: false,
    icon:     '📤',
  },
  {
    label:    'Net Profit',
    value:    'AED 323,000',
    change:   '31.7% margin',
    positive: true,
    icon:     '📈',
  },
];

export default function FinancialDashboard() {
  const { data: monthly = [] } = useQuery<MonthlyRevenue[]>({
    queryKey: ['finance-monthly'],
    queryFn: async () => mockMonthly,
  });

  const { data: topClients = [] } = useQuery<TopClient[]>({
    queryKey: ['finance-top-clients'],
    queryFn: async () => mockTopClients,
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-[var(--color-neutral-800)]">Financial Dashboard</h1>
          <p className="text-sm text-[var(--color-neutral-400)]">Jan 2026 – Jun 2026</p>
        </div>
        <div className="flex gap-2">
          <select className="h-9 rounded-md border border-[var(--color-neutral-200)] px-3 text-sm focus:outline-none focus:border-[var(--color-primary-500)]">
            <option>This Year</option>
            <option>Last Year</option>
            <option>Custom Range</option>
          </select>
          <button className="h-9 px-4 rounded-md border border-[var(--color-neutral-200)] text-sm text-[var(--color-neutral-600)] hover:bg-[var(--color-neutral-50)]">
            ⬇ Export
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label}>
            <div className="flex items-start justify-between mb-2">
              <p className="text-xs font-medium text-[var(--color-neutral-400)]">{kpi.label}</p>
              <span className="text-xl">{kpi.icon}</span>
            </div>
            <p className="text-xl font-bold text-[var(--color-neutral-800)] mb-1">{kpi.value}</p>
            <p className={`text-xs font-medium ${
              kpi.positive
                ? 'text-[var(--color-success-500)]'
                : 'text-[var(--color-warning-500)]'
            }`}>
              {kpi.change}
            </p>
          </Card>
        ))}
      </div>

      {/* Revenue Chart + Mode Split */}
      <div className="grid grid-cols-3 gap-4">
        {/* Monthly Revenue Bar Chart */}
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Monthly Revenue vs Profit</CardTitle>
            <div className="flex items-center gap-3 text-xs text-[var(--color-neutral-400)]">
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-sm bg-[var(--color-primary-500)] inline-block" />
                Revenue
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-sm bg-[var(--color-success-500)] inline-block" />
                Profit
              </span>
            </div>
          </CardHeader>

          {/* Bar Chart */}
          <div className="flex items-end gap-3 h-48 px-2">
            {monthly.map((m) => (
              <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex items-end gap-1 h-40">
                  {/* Revenue bar */}
                  <div
                    className="flex-1 rounded-t-sm bg-[var(--color-primary-200)] hover:bg-[var(--color-primary-400)] transition-colors relative group"
                    style={{ height: `${(m.revenue / maxRevenue) * 100}%` }}
                  >
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-[var(--color-neutral-800)] text-white text-xs px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      AED {m.revenue.toLocaleString()}
                    </div>
                  </div>
                  {/* Profit bar */}
                  <div
                    className="flex-1 rounded-t-sm bg-[var(--color-success-500)] hover:bg-[var(--color-success-700)] transition-colors relative group"
                    style={{ height: `${(m.profit / maxRevenue) * 100}%` }}
                  >
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-[var(--color-neutral-800)] text-white text-xs px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      AED {m.profit.toLocaleString()}
                    </div>
                  </div>
                </div>
                <span className="text-xs text-[var(--color-neutral-400)]">{m.month}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* AR Aging Summary */}
        <Card>
          <CardHeader>
            <CardTitle>AR Aging</CardTitle>
          </CardHeader>
          <div className="space-y-3">
            {[
              { label: 'Current (0–30 days)',  amount: 21200, variant: 'success' as const, pct: 48 },
              { label: '31–60 days',           amount: 12500, variant: 'warning' as const, pct: 28 },
              { label: '61–90 days',           amount: 7300,  variant: 'danger'  as const, pct: 16 },
              { label: '90+ days',             amount: 3450,  variant: 'danger'  as const, pct: 8  },
            ].map((row) => (
              <div key={row.label}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-[var(--color-neutral-600)]">{row.label}</span>
                  <span className="text-xs font-mono font-semibold text-[var(--color-neutral-800)]">
                    AED {row.amount.toLocaleString()}
                  </span>
                </div>
                <div className="h-1.5 w-full bg-[var(--color-neutral-100)] rounded-full">
                  <div
                    className={`h-1.5 rounded-full ${
                      row.variant === 'success'
                        ? 'bg-[var(--color-success-500)]'
                        : row.variant === 'warning'
                        ? 'bg-[var(--color-warning-500)]'
                        : 'bg-[var(--color-danger-500)]'
                    }`}
                    style={{ width: `${row.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-[var(--color-neutral-200)]">
            <div className="flex justify-between text-sm">
              <span className="text-[var(--color-neutral-600)] font-medium">Total AR</span>
              <span className="font-bold font-mono text-[var(--color-neutral-800)]">AED 44,450</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Top Clients Table */}
      <Card padding="none">
        <CardHeader className="px-4 pt-4">
          <CardTitle>Top Clients by Revenue</CardTitle>
          <Badge variant="neutral">{topClients.length} clients</Badge>
        </CardHeader>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>#</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Shipments</TableHead>
              <TableHead>Total Revenue</TableHead>
              <TableHead>Outstanding</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {topClients.map((client, index) => (
              <TableRow key={client.id}>
                <TableCell className="text-[var(--color-neutral-400)] font-medium">
                  {index + 1}
                </TableCell>
                <TableCell className="font-medium">{client.name}</TableCell>
                <TableCell>{client.shipments}</TableCell>
                <TableCell mono className="font-semibold">
                  {client.currency} {client.revenue.toLocaleString()}
                </TableCell>
                <TableCell mono className={
                  client.outstanding > 0
                    ? 'text-[var(--color-warning-500)] font-semibold'
                    : 'text-[var(--color-success-500)]'
                }>
                  {client.outstanding > 0
                    ? `${client.currency} ${client.outstanding.toLocaleString()}`
                    : 'Cleared'}
                </TableCell>
                <TableCell>
                  <Badge variant={client.outstanding > 0 ? 'warning' : 'success'}>
                    {client.outstanding > 0 ? 'Pending' : 'Clear'}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}