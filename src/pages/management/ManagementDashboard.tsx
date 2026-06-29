import { useQuery } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import {
  Table, TableHeader, TableBody,
  TableRow, TableHead, TableCell
} from '../../components/ui/Table';

interface KPI {
  label: string;
  value: string;
  change: string;
  positive: boolean;
  icon: string;
}

interface ShipmentTrend {
  month: string;
  air: number;
  sea: number;
  road: number;
}

interface LaneProfit {
  id: string;
  lane: string;
  shipments: number;
  revenue: number;
  cost: number;
  profit: number;
  margin: number;
  currency: string;
}

interface Alert {
  id: string;
  type: 'warning' | 'danger' | 'info';
  title: string;
  description: string;
  time: string;
}

const kpis: KPI[] = [
  { label: 'Shipments This Month', value: '141',         change: '+18 vs last month',  positive: true,  icon: '📦' },
  { label: 'Revenue This Month',   value: 'AED 210,000', change: '+7.6% vs last month', positive: true,  icon: '💰' },
  { label: 'Profit Margin',        value: '31.4%',       change: '-0.8% vs last month', positive: false, icon: '📈' },
  { label: 'Active Jobs',          value: '38',          change: '12 due this week',    positive: true,  icon: '🔄' },
  { label: 'Pending Quotations',   value: '23',          change: '5 expiring soon',     positive: false, icon: '💬' },
  { label: 'Outstanding AR',       value: 'AED 44,450',  change: '8 invoices overdue',  positive: false, icon: '📋' },
];

const mockTrend: ShipmentTrend[] = [
  { month: 'Jan', air: 28, sea: 42, road: 15 },
  { month: 'Feb', sea: 38, air: 24, road: 12 },
  { month: 'Mar', air: 32, sea: 48, road: 18 },
  { month: 'Apr', air: 35, sea: 51, road: 20 },
  { month: 'May', air: 38, sea: 55, road: 22 },
  { month: 'Jun', air: 42, sea: 58, road: 24 },
  { month: 'Jul', air: 45, sea: 60, road: 26 },
];

const mockLanes: LaneProfit[] = [
  { id: '1', lane: 'Dubai → London',      shipments: 28, revenue: 186500, cost: 124300, profit: 62200, margin: 33.4, currency: 'AED' },
  { id: '2', lane: 'Shanghai → Dubai',    shipments: 34, revenue: 142300, cost: 98100,  profit: 44200, margin: 31.1, currency: 'AED' },
  { id: '3', lane: 'Dubai → New York',    shipments: 19, revenue: 128900, cost: 91200,  profit: 37700, margin: 29.2, currency: 'AED' },
  { id: '4', lane: 'Dubai → Mumbai',      shipments: 22, revenue: 98400,  cost: 71300,  profit: 27100, margin: 27.5, currency: 'AED' },
  { id: '5', lane: 'Hamburg → Dubai',     shipments: 16, revenue: 87600,  cost: 64800,  profit: 22800, margin: 26.0, currency: 'AED' },
];

const mockAlerts: Alert[] = [
  { id: '1', type: 'danger',  title: '3 Invoices Overdue',          description: 'Total AED 17,500 overdue by more than 30 days.',      time: '2 hrs ago' },
  { id: '2', type: 'warning', title: '5 Quotations Expiring',       description: 'Quotes QT/2026/001–005 expire within 48 hours.',       time: '3 hrs ago' },
  { id: '3', type: 'warning', title: 'Low Stock Alert — DXB WH',   description: '8 SKUs below minimum threshold in Dubai warehouse.',    time: '5 hrs ago' },
  { id: '4', type: 'info',    title: 'New Customer Onboarded',      description: 'Majid Al Futtaim Group added as a new client.',        time: '1 day ago' },
  { id: '5', type: 'danger',  title: 'Job Deadline Tomorrow',       description: 'KFW/AE/06/26/00141 ETD is 2026-06-25. Docs pending.',  time: '1 day ago' },
  { id: '6', type: 'info',    title: 'Monthly Report Ready',        description: 'June 2026 MIS report is ready for review.',           time: '2 days ago' },
];

const alertVariant: Record<Alert['type'], 'danger' | 'warning' | 'info'> = {
  danger:  'danger',
  warning: 'warning',
  info:    'info',
};

const alertBg: Record<Alert['type'], string> = {
  danger:  'bg-[var(--color-danger-100)] border-[var(--color-danger-500)]/20',
  warning: 'bg-[var(--color-warning-100)] border-[var(--color-warning-500)]/20',
  info:    'bg-[var(--color-info-100)] border-[var(--color-info-500)]/20',
};

const maxTotal = Math.max(...mockTrend.map((t) => t.air + t.sea + t.road));

const modeSplit = [
  { label: 'Sea Freight', count: 58, pct: 47, color: 'bg-[var(--color-mode-sea)]' },
  { label: 'Air Freight', count: 42, pct: 34, color: 'bg-purple-500' },
  { label: 'Road Freight', count: 24, pct: 19, color: 'bg-[var(--color-mode-road)]' },
];

export default function ManagementDashboard() {
  const { data: lanes = [] } = useQuery<LaneProfit[]>({
    queryKey: ['management-lanes'],
    queryFn: async () => mockLanes,
  });

  const { data: alerts = [] } = useQuery<Alert[]>({
    queryKey: ['management-alerts'],
    queryFn: async () => mockAlerts,
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-[var(--color-neutral-800)]">Management Dashboard</h1>
          <p className="text-sm text-[var(--color-neutral-400)]">Kingfisher Wings Logistic LLC — June 2026</p>
        </div>
        <div className="flex gap-2">
          <select className="h-9 rounded-md border border-[var(--color-neutral-200)] px-3 text-sm focus:outline-none focus:border-[var(--color-primary-500)]">
            <option>June 2026</option>
            <option>May 2026</option>
            <option>Q2 2026</option>
            <option>YTD 2026</option>
          </select>
          <button className="h-9 px-4 rounded-md border border-[var(--color-neutral-200)] text-sm text-[var(--color-neutral-600)] hover:bg-[var(--color-neutral-50)]">
            ⬇ Export Report
          </button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-6 gap-3">
        {kpis.map((kpi) => (
          <Card key={kpi.label} padding="sm">
            <div className="flex items-start justify-between mb-2">
              <span className="text-lg">{kpi.icon}</span>
              <span className={`text-xs font-medium ${
                kpi.positive
                  ? 'text-[var(--color-success-500)]'
                  : 'text-[var(--color-danger-500)]'
              }`}>
                {kpi.positive ? '↑' : '↓'}
              </span>
            </div>
            <p className="text-lg font-bold text-[var(--color-neutral-800)] leading-tight">{kpi.value}</p>
            <p className="text-xs text-[var(--color-neutral-400)] mt-0.5 leading-tight">{kpi.label}</p>
            <p className={`text-xs mt-1 font-medium ${
              kpi.positive
                ? 'text-[var(--color-success-500)]'
                : 'text-[var(--color-warning-500)]'
            }`}>
              {kpi.change}
            </p>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-3 gap-4">
        {/* Shipment Trend */}
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Shipment Trend by Mode</CardTitle>
            <div className="flex items-center gap-3 text-xs text-[var(--color-neutral-400)]">
              <span className="flex items-center gap-1">
                <span className="w-3 h-2 rounded-sm bg-[var(--color-mode-sea)] inline-block" /> Sea
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-2 rounded-sm bg-purple-500 inline-block" /> Air
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-2 rounded-sm bg-[var(--color-mode-road)] inline-block" /> Road
              </span>
            </div>
          </CardHeader>
          <div className="flex items-end gap-2 h-44">
            {mockTrend.map((t) => {
              const total = t.air + t.sea + t.road;
              const seaPct  = (t.sea  / maxTotal) * 100;
              const airPct  = (t.air  / maxTotal) * 100;
              const roadPct = (t.road / maxTotal) * 100;
              return (
                <div key={t.month} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-xs text-[var(--color-neutral-400)]">{total}</span>
                  <div className="w-full flex flex-col-reverse rounded-t-sm overflow-hidden" style={{ height: `${(total / maxTotal) * 140}px` }}>
                    <div className="bg-[var(--color-mode-sea)]"  style={{ height: `${seaPct}%` }} />
                    <div className="bg-purple-500"               style={{ height: `${airPct}%` }} />
                    <div className="bg-[var(--color-mode-road)]" style={{ height: `${roadPct}%` }} />
                  </div>
                  <span className="text-xs text-[var(--color-neutral-400)]">{t.month}</span>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Mode Split */}
        <Card>
          <CardHeader><CardTitle>Mode Split — Jun 2026</CardTitle></CardHeader>
          <div className="space-y-4">
            {modeSplit.map((m) => (
              <div key={m.label}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-[var(--color-neutral-700)]">{m.label}</span>
                  <span className="text-sm font-semibold text-[var(--color-neutral-800)]">
                    {m.count} <span className="text-xs text-[var(--color-neutral-400)] font-normal">({m.pct}%)</span>
                  </span>
                </div>
                <div className="h-2 w-full bg-[var(--color-neutral-100)] rounded-full">
                  <div
                    className={`h-2 rounded-full ${m.color}`}
                    style={{ width: `${m.pct}%` }}
                  />
                </div>
              </div>
            ))}

            <div className="pt-3 border-t border-[var(--color-neutral-200)]">
              <div className="flex justify-between text-sm">
                <span className="text-[var(--color-neutral-600)]">Total Shipments</span>
                <span className="font-bold text-[var(--color-neutral-800)]">124</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Lane Profit + Alerts */}
      <div className="grid grid-cols-3 gap-4">
        {/* Lane-wise Profit Table */}
        <Card padding="none" className="col-span-2">
          <CardHeader className="px-4 pt-4">
            <CardTitle>Lane-wise Profitability</CardTitle>
            <Badge variant="neutral">Top {lanes.length} lanes</Badge>
          </CardHeader>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Lane</TableHead>
                <TableHead>Shipments</TableHead>
                <TableHead>Revenue</TableHead>
                <TableHead>Cost</TableHead>
                <TableHead>Profit</TableHead>
                <TableHead>Margin</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lanes.map((lane, i) => (
                <TableRow key={lane.id}>
                  <TableCell className="text-[var(--color-neutral-400)] font-medium">
                    {i + 1}
                  </TableCell>
                  <TableCell className="font-medium">{lane.lane}</TableCell>
                  <TableCell mono>{lane.shipments}</TableCell>
                  <TableCell mono>{lane.revenue.toLocaleString()}</TableCell>
                  <TableCell mono className="text-[var(--color-neutral-400)]">
                    {lane.cost.toLocaleString()}
                  </TableCell>
                  <TableCell mono className="font-semibold text-[var(--color-success-500)]">
                    {lane.profit.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-[var(--color-neutral-100)] rounded-full">
                        <div
                          className="h-1.5 rounded-full bg-[var(--color-success-500)]"
                          style={{ width: `${lane.margin}%` }}
                        />
                      </div>
                      <span className="text-xs font-mono font-semibold text-[var(--color-neutral-700)]">
                        {lane.margin}%
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        {/* Alerts Panel */}
        <Card>
          <CardHeader>
            <CardTitle>🔔 Alerts & Notifications</CardTitle>
            <Badge variant="danger">{alerts.filter((a) => a.type === 'danger').length} critical</Badge>
          </CardHeader>
          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-3 rounded-lg border ${alertBg[alert.type]}`}
              >
                <div className="flex items-start justify-between mb-1">
                  <p className="text-xs font-semibold text-[var(--color-neutral-800)]">{alert.title}</p>
                  <Badge variant={alertVariant[alert.type]}>
                    {alert.type === 'danger' ? '!' : alert.type === 'warning' ? '⚠' : 'i'}
                  </Badge>
                </div>
                <p className="text-xs text-[var(--color-neutral-600)] mb-1">{alert.description}</p>
                <p className="text-xs text-[var(--color-neutral-400)]">{alert.time}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}