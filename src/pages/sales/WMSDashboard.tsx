import { useQuery } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import {
  Table, TableHeader, TableBody,
  TableRow, TableHead, TableCell
} from '../../components/ui/Table';

interface WarehouseStock {
  id: string;
  warehouse: string;
  location: string;
  totalSKUs: number;
  totalUnits: number;
  capacity: number;
  utilization: number;
  lowStockItems: number;
}

interface StockActivity {
  id: string;
  type: 'GRN' | 'GDN';
  refNo: string;
  jobNo: string;
  client: string;
  warehouse: string;
  items: number;
  units: number;
  time: string;
  status: 'Completed' | 'Pending' | 'In Progress';
}

interface LowStockAlert {
  id: string;
  sku: string;
  description: string;
  warehouse: string;
  currentQty: number;
  minQty: number;
  unit: string;
}

const mockWarehouses: WarehouseStock[] = [
  { id: '1', warehouse: 'DXB Main Warehouse',  location: 'Dubai — Jebel Ali',    totalSKUs: 342, totalUnits: 18450, capacity: 25000, utilization: 74, lowStockItems: 5 },
  { id: '2', warehouse: 'AUH Warehouse',        location: 'Abu Dhabi — ICAD',     totalSKUs: 189, totalUnits: 9200,  capacity: 15000, utilization: 61, lowStockItems: 2 },
  { id: '3', warehouse: 'SHJ Bonded Warehouse', location: 'Sharjah — SAIF Zone',  totalSKUs: 98,  totalUnits: 4100,  capacity: 8000,  utilization: 51, lowStockItems: 1 },
];

const mockActivity: StockActivity[] = [
  { id: '1', type: 'GRN', refNo: 'GRN/2026/00089', jobNo: 'KFW/SI/06/26/00034', client: 'DP World',          warehouse: 'DXB Main',  items: 12, units: 480,  time: '10:30 AM', status: 'Completed' },
  { id: '2', type: 'GDN', refNo: 'GDN/2026/00076', jobNo: 'KFW/SE/06/26/00089', client: 'Jumeirah Group',    warehouse: 'DXB Main',  items: 8,  units: 320,  time: '09:45 AM', status: 'Completed' },
  { id: '3', type: 'GRN', refNo: 'GRN/2026/00088', jobNo: 'KFW/SI/06/26/00033', client: 'Carrefour UAE',     warehouse: 'AUH',       items: 24, units: 960,  time: '09:00 AM', status: 'In Progress' },
  { id: '4', type: 'GDN', refNo: 'GDN/2026/00075', jobNo: 'KFW/AE/06/26/00141', client: 'Al Futtaim LLC',   warehouse: 'DXB Main',  items: 6,  units: 144,  time: '08:30 AM', status: 'Pending' },
  { id: '5', type: 'GRN', refNo: 'GRN/2026/00087', jobNo: 'KFW/SI/06/26/00032', client: 'Noon.com',         warehouse: 'SHJ Bonded', items: 18, units: 720, time: 'Yesterday', status: 'Completed' },
];

const mockAlerts: LowStockAlert[] = [
  { id: '1', sku: 'SKU-10234', description: 'Bubble Wrap Roll 50m',   warehouse: 'DXB Main',  currentQty: 12,  minQty: 50,  unit: 'Rolls' },
  { id: '2', sku: 'SKU-10891', description: 'Wooden Pallet 120x80',   warehouse: 'DXB Main',  currentQty: 8,   minQty: 30,  unit: 'Pcs' },
  { id: '3', sku: 'SKU-10456', description: 'Strapping Band 500m',    warehouse: 'AUH',       currentQty: 3,   minQty: 20,  unit: 'Rolls' },
  { id: '4', sku: 'SKU-10678', description: 'Cardboard Box L',        warehouse: 'SHJ Bonded', currentQty: 24, minQty: 100, unit: 'Pcs' },
];

const activityVariant: Record<StockActivity['status'], 'success' | 'warning' | 'info'> = {
  Completed:   'success',
  Pending:     'warning',
  'In Progress': 'info',
};

export default function WMSDashboard() {
  const { data: warehouses = [] } = useQuery<WarehouseStock[]>({
    queryKey: ['wms-warehouses'],
    queryFn: async () => mockWarehouses,
  });

  const { data: activity = [] } = useQuery<StockActivity[]>({
    queryKey: ['wms-activity'],
    queryFn: async () => mockActivity,
  });

  const { data: alerts = [] } = useQuery<LowStockAlert[]>({
    queryKey: ['wms-alerts'],
    queryFn: async () => mockAlerts,
  });

  const totalUnits  = warehouses.reduce((s, w) => s + w.totalUnits, 0);
  const grnToday    = activity.filter((a) => a.type === 'GRN' && a.time !== 'Yesterday').length;
  const gdnToday    = activity.filter((a) => a.type === 'GDN' && a.time !== 'Yesterday').length;
  const totalAlerts = alerts.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-[var(--color-neutral-800)]">WMS Dashboard</h1>
          <p className="text-sm text-[var(--color-neutral-400)]">Warehouse Management — Today</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary">+ New GRN</Button>
          <Button>+ New GDN</Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Stock Units', value: totalUnits.toLocaleString(), icon: '📦', color: 'text-[var(--color-neutral-800)]' },
          { label: 'GRN Today',         value: grnToday.toString(),         icon: '📥', color: 'text-[var(--color-primary-600)]' },
          { label: 'GDN Today',         value: gdnToday.toString(),         icon: '📤', color: 'text-[var(--color-warning-500)]' },
          { label: 'Low Stock Alerts',  value: totalAlerts.toString(),      icon: '⚠️', color: 'text-[var(--color-danger-500)]' },
        ].map((kpi) => (
          <Card key={kpi.label}>
            <div className="flex items-start justify-between mb-2">
              <p className="text-xs font-medium text-[var(--color-neutral-400)]">{kpi.label}</p>
              <span className="text-xl">{kpi.icon}</span>
            </div>
            <p className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</p>
          </Card>
        ))}
      </div>

      {/* Warehouse Stock Table + Low Stock Alerts */}
      <div className="grid grid-cols-3 gap-4">
        {/* Stock by Warehouse */}
        <Card padding="none" className="col-span-2">
          <CardHeader className="px-4 pt-4">
            <CardTitle>Stock by Warehouse</CardTitle>
            <Badge variant="neutral">{warehouses.length} warehouses</Badge>
          </CardHeader>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Warehouse</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>SKUs</TableHead>
                <TableHead>Units</TableHead>
                <TableHead>Utilization</TableHead>
                <TableHead>Low Stock</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {warehouses.map((w) => (
                <TableRow key={w.id}>
                  <TableCell className="font-medium">{w.warehouse}</TableCell>
                  <TableCell className="text-[var(--color-neutral-400)]">{w.location}</TableCell>
                  <TableCell mono>{w.totalSKUs}</TableCell>
                  <TableCell mono>{w.totalUnits.toLocaleString()}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-[var(--color-neutral-100)] rounded-full w-20">
                        <div
                          className={`h-1.5 rounded-full ${
                            w.utilization > 80
                              ? 'bg-[var(--color-danger-500)]'
                              : w.utilization > 60
                              ? 'bg-[var(--color-warning-500)]'
                              : 'bg-[var(--color-success-500)]'
                          }`}
                          style={{ width: `${w.utilization}%` }}
                        />
                      </div>
                      <span className="text-xs font-mono text-[var(--color-neutral-600)]">
                        {w.utilization}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {w.lowStockItems > 0 ? (
                      <Badge variant="danger">{w.lowStockItems} items</Badge>
                    ) : (
                      <Badge variant="success">None</Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        {/* Low Stock Alerts */}
        <Card>
          <CardHeader>
            <CardTitle>⚠️ Low Stock Alerts</CardTitle>
            <Badge variant="danger">{alerts.length}</Badge>
          </CardHeader>
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className="p-3 rounded-lg bg-[var(--color-danger-100)] border border-[var(--color-danger-500)]/20"
              >
                <div className="flex items-start justify-between mb-1">
                  <p className="text-xs font-mono font-semibold text-[var(--color-neutral-800)]">
                    {alert.sku}
                  </p>
                  <span className="text-xs text-[var(--color-danger-500)] font-medium">
                    {alert.currentQty}/{alert.minQty} {alert.unit}
                  </span>
                </div>
                <p className="text-xs text-[var(--color-neutral-600)] mb-1">{alert.description}</p>
                <p className="text-xs text-[var(--color-neutral-400)]">📍 {alert.warehouse}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Recent GRN/GDN Activity */}
      <Card padding="none">
        <CardHeader className="px-4 pt-4">
          <CardTitle>Recent GRN / GDN Activity</CardTitle>
          <Button variant="secondary" size="sm">View All</Button>
        </CardHeader>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Ref No.</TableHead>
              <TableHead>Job No.</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Warehouse</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Units</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {activity.map((a) => (
              <TableRow key={a.id}>
                <TableCell>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                    a.type === 'GRN'
                      ? 'bg-[var(--color-primary-100)] text-[var(--color-primary-700)]'
                      : 'bg-[var(--color-warning-100)] text-[var(--color-warning-700)]'
                  }`}>
                    {a.type}
                  </span>
                </TableCell>
                <TableCell mono>{a.refNo}</TableCell>
                <TableCell mono>{a.jobNo}</TableCell>
                <TableCell>{a.client}</TableCell>
                <TableCell>{a.warehouse}</TableCell>
                <TableCell mono>{a.items}</TableCell>
                <TableCell mono>{a.units}</TableCell>
                <TableCell className="text-[var(--color-neutral-400)]">{a.time}</TableCell>
                <TableCell>
                  <Badge variant={activityVariant[a.status]}>{a.status}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}