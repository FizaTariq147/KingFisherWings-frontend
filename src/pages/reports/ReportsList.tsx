import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';

interface Report {
  id: string;
  name: string;
  description: string;
  category: 'Operations' | 'Finance' | 'Sales' | 'HR' | 'WMS' | 'Management';
  format: 'PDF' | 'Excel' | 'Both';
  lastGenerated: string;
  frequency: 'Daily' | 'Weekly' | 'Monthly' | 'On Demand';
  icon: string;
}

interface ScheduledReport {
  id: string;
  reportName: string;
  frequency: string;
  nextRun: string;
  recipients: string[];
  status: 'Active' | 'Paused';
}

const mockReports: Report[] = [
  // Operations
  { id: '1',  name: 'Shipment Summary',          description: 'All shipments by mode, status, and lane',          category: 'Operations',  format: 'Both',  lastGenerated: '2026-06-28', frequency: 'Daily',     icon: '📦' },
  { id: '2',  name: 'Job Status Report',          description: 'Open, in-progress, and completed jobs',            category: 'Operations',  format: 'Excel', lastGenerated: '2026-06-28', frequency: 'Daily',     icon: '🔄' },
  { id: '3',  name: 'Air Export Summary',         description: 'AWB, carrier, weight, and revenue breakdown',      category: 'Operations',  format: 'Both',  lastGenerated: '2026-06-27', frequency: 'Weekly',    icon: '✈️' },
  { id: '4',  name: 'Sea FCL Summary',            description: 'Container, vessel, voyage details and P&L',        category: 'Operations',  format: 'Both',  lastGenerated: '2026-06-27', frequency: 'Weekly',    icon: '🚢' },
  { id: '5',  name: 'Document Checklist',         description: 'Pending and completed documents per job',          category: 'Operations',  format: 'PDF',   lastGenerated: '2026-06-26', frequency: 'On Demand', icon: '📄' },
  // Finance
  { id: '6',  name: 'Revenue & Profit Report',    description: 'Monthly revenue, cost, and net profit breakdown',  category: 'Finance',     format: 'Both',  lastGenerated: '2026-06-28', frequency: 'Monthly',   icon: '💰' },
  { id: '7',  name: 'Accounts Receivable (AR)',   description: 'Outstanding invoices and aging analysis',          category: 'Finance',     format: 'Excel', lastGenerated: '2026-06-28', frequency: 'Weekly',    icon: '📋' },
  { id: '8',  name: 'Accounts Payable (AP)',       description: 'Vendor invoices due and payment schedule',        category: 'Finance',     format: 'Excel', lastGenerated: '2026-06-27', frequency: 'Weekly',    icon: '📤' },
  { id: '9',  name: 'VAT Report',                 description: 'UAE VAT 5% summary for FTA filing',               category: 'Finance',     format: 'PDF',   lastGenerated: '2026-06-01', frequency: 'Monthly',   icon: '🧾' },
  { id: '10', name: 'Profit & Loss Statement',    description: 'Full P&L with revenue, expenses, and margin',     category: 'Finance',     format: 'Both',  lastGenerated: '2026-06-01', frequency: 'Monthly',   icon: '📊' },
  // Sales
  { id: '11', name: 'Quotation Conversion',       description: 'Quote sent vs approved vs rejected ratios',       category: 'Sales',       format: 'Both',  lastGenerated: '2026-06-27', frequency: 'Weekly',    icon: '💬' },
  { id: '12', name: 'Customer Revenue Report',    description: 'Top clients by revenue and shipment volume',      category: 'Sales',       format: 'Excel', lastGenerated: '2026-06-28', frequency: 'Monthly',   icon: '👥' },
  { id: '13', name: 'Lane Performance Report',    description: 'Profit margin by trade lane and corridor',        category: 'Sales',       format: 'Both',  lastGenerated: '2026-06-25', frequency: 'Monthly',   icon: '🗺️' },
  // HR
  { id: '14', name: 'Employee Directory',         description: 'Full employee list with contact and status',      category: 'HR',          format: 'Excel', lastGenerated: '2026-06-28', frequency: 'On Demand', icon: '👤' },
  { id: '15', name: 'Leave Summary Report',       description: 'Leave taken, balance, and pending requests',      category: 'HR',          format: 'Both',  lastGenerated: '2026-06-28', frequency: 'Monthly',   icon: '📅' },
  { id: '16', name: 'Payroll Summary',            description: 'Monthly salary, allowances, and deductions',      category: 'HR',          format: 'PDF',   lastGenerated: '2026-05-31', frequency: 'Monthly',   icon: '💵' },
  { id: '17', name: 'Document Expiry Report',     description: 'Visa, passport, and labour card expiry alerts',  category: 'HR',          format: 'Excel', lastGenerated: '2026-06-28', frequency: 'Weekly',    icon: '⚠️' },
  // WMS
  { id: '18', name: 'Stock Inventory Report',     description: 'Current stock levels by warehouse and SKU',      category: 'WMS',         format: 'Excel', lastGenerated: '2026-06-28', frequency: 'Daily',     icon: '🏭' },
  { id: '19', name: 'GRN / GDN Activity',         description: 'Daily goods received and dispatched summary',    category: 'WMS',         format: 'Both',  lastGenerated: '2026-06-28', frequency: 'Daily',     icon: '📥' },
  { id: '20', name: 'Low Stock Alert Report',     description: 'Items below minimum threshold',                  category: 'WMS',         format: 'PDF',   lastGenerated: '2026-06-28', frequency: 'Daily',     icon: '🔔' },
  // Management
  { id: '21', name: 'MIS Executive Dashboard',   description: 'KPIs, trends, and alerts for management',        category: 'Management',  format: 'PDF',   lastGenerated: '2026-06-28', frequency: 'Daily',     icon: '📈' },
  { id: '22', name: 'Monthly Business Review',   description: 'Comprehensive monthly performance report',       category: 'Management',  format: 'Both',  lastGenerated: '2026-06-01', frequency: 'Monthly',   icon: '📑' },
];

const mockScheduled: ScheduledReport[] = [
  { id: '1', reportName: 'MIS Executive Dashboard',  frequency: 'Daily',   nextRun: '2026-06-30 07:00', recipients: ['shahzad@kfw.ae'],                         status: 'Active' },
  { id: '2', reportName: 'Accounts Receivable (AR)', frequency: 'Weekly',  nextRun: '2026-07-01 08:00', recipients: ['ahmed@kfw.ae', 'shahzad@kfw.ae'],          status: 'Active' },
  { id: '3', reportName: 'Document Expiry Report',   frequency: 'Weekly',  nextRun: '2026-07-01 09:00', recipients: ['sara@kfw.ae'],                             status: 'Active' },
  { id: '4', reportName: 'Payroll Summary',          frequency: 'Monthly', nextRun: '2026-07-31 10:00', recipients: ['ahmed@kfw.ae', 'sara@kfw.ae'],             status: 'Paused' },
];

const CATEGORIES = ['All', 'Operations', 'Finance', 'Sales', 'HR', 'WMS', 'Management'] as const;

type Tab = 'reports' | 'scheduled';

export default function ReportsList() {
  const [activeTab, setActiveTab]       = useState<Tab>('reports');
  const [search, setSearch]             = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');

  const { data: reports = [] } = useQuery<Report[]>({
    queryKey: ['reports'],
    queryFn: async () => mockReports,
  });

  const { data: scheduled = [] } = useQuery<ScheduledReport[]>({
    queryKey: ['scheduled-reports'],
    queryFn: async () => mockScheduled,
  });

  const filtered = reports.filter((r) => {
    const matchSearch   = r.name.toLowerCase().includes(search.toLowerCase()) ||
                          r.description.toLowerCase().includes(search.toLowerCase());
    const matchCategory = categoryFilter === 'All' || r.category === categoryFilter;
    return matchSearch && matchCategory;
  });

  const grouped = CATEGORIES.slice(1).reduce((acc, cat) => {
    const items = filtered.filter((r) => r.category === cat);
    if (items.length > 0) acc[cat] = items;
    return acc;
  }, {} as Record<string, Report[]>);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-[var(--color-neutral-800)]">Reports & MIS</h1>
          <p className="text-sm text-[var(--color-neutral-400)]">{reports.length} reports available</p>
        </div>
        <Button variant="secondary">+ Schedule Report</Button>
      </div>

      {/* Tabs */}
      <div className="border-b border-[var(--color-neutral-200)]">
        <div className="flex gap-0">
          {([
            { key: 'reports',   label: '📊 All Reports' },
            { key: 'scheduled', label: '⏰ Scheduled' },
          ] as const).map((tab) => (
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

      {/* Reports Tab */}
      {activeTab === 'reports' && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <input
              type="text"
              placeholder="Search reports..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 w-64 rounded-md border border-[var(--color-neutral-200)] px-3 text-sm focus:outline-none focus:border-[var(--color-primary-500)]"
            />
            <div className="flex flex-wrap gap-1">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    categoryFilter === cat
                      ? 'bg-[var(--color-primary-500)] text-white'
                      : 'bg-white border border-[var(--color-neutral-200)] text-[var(--color-neutral-600)] hover:bg-[var(--color-neutral-50)]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Grouped Report Cards */}
          {categoryFilter === 'All' ? (
            Object.entries(grouped).map(([category, items]) => (
              <div key={category}>
                <div className="flex items-center gap-2 mb-3">
                  <h2 className="text-sm font-semibold text-[var(--color-neutral-700)]">{category}</h2>
                  <span className="text-xs text-[var(--color-neutral-400)]">({items.length})</span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {items.map((report) => (
                    <ReportCard key={report.id} report={report} />
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {filtered.map((report) => (
                <ReportCard key={report.id} report={report} />
              ))}
            </div>
          )}

          {filtered.length === 0 && (
            <Card>
              <div className="text-center py-12 text-[var(--color-neutral-400)]">
                <p className="text-4xl mb-3">📊</p>
                <p className="text-sm font-medium">No reports found</p>
                <p className="text-xs mt-1">Try a different search or category</p>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Scheduled Tab */}
      {activeTab === 'scheduled' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Scheduled Reports</CardTitle>
              <Badge variant="info">{scheduled.filter((s) => s.status === 'Active').length} active</Badge>
            </CardHeader>
            <div className="space-y-3">
              {scheduled.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-[var(--color-neutral-200)] hover:bg-[var(--color-neutral-50)]"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-2 h-2 rounded-full ${
                      s.status === 'Active'
                        ? 'bg-[var(--color-success-500)]'
                        : 'bg-[var(--color-neutral-300)]'
                    }`} />
                    <div>
                      <p className="text-sm font-medium text-[var(--color-neutral-800)]">{s.reportName}</p>
                      <p className="text-xs text-[var(--color-neutral-400)] mt-0.5">
                        {s.frequency} · Next run: <span className="font-mono">{s.nextRun}</span>
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        <span className="text-xs text-[var(--color-neutral-400)]">To:</span>
                        {s.recipients.map((r) => (
                          <span key={r} className="text-xs px-1.5 py-0.5 rounded bg-[var(--color-neutral-100)] text-[var(--color-neutral-600)]">
                            {r}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={s.status === 'Active' ? 'success' : 'neutral'}>{s.status}</Badge>
                    <Button variant="secondary" size="sm">
                      {s.status === 'Active' ? 'Pause' : 'Resume'}
                    </Button>
                    <Button variant="ghost" size="sm" className="text-[var(--color-danger-500)]">Remove</Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

function ReportCard({ report }: { report: Report }) {
  const categoryColors: Record<Report['category'], string> = {
    Operations: 'text-blue-700 bg-blue-50',
    Finance:    'text-green-700 bg-green-50',
    Sales:      'text-purple-700 bg-purple-50',
    HR:         'text-orange-700 bg-orange-50',
    WMS:        'text-cyan-700 bg-cyan-50',
    Management: 'text-rose-700 bg-rose-50',
  };

  const formatVariant: Record<Report['format'], 'info' | 'success' | 'primary'> = {
    PDF:   'info',
    Excel: 'success',
    Both:  'primary',
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-lg bg-[var(--color-neutral-100)] flex items-center justify-center text-xl shrink-0">
          {report.icon}
        </div>
        <div className="flex items-center gap-1">
          <Badge variant={formatVariant[report.format]}>{report.format}</Badge>
        </div>
      </div>

      <p className="text-sm font-semibold text-[var(--color-neutral-800)] mb-1">{report.name}</p>
      <p className="text-xs text-[var(--color-neutral-400)] mb-3 leading-relaxed">{report.description}</p>

      <div className="flex items-center gap-2 mb-3">
        <span className={`px-2 py-0.5 rounded text-xs font-medium ${categoryColors[report.category]}`}>
          {report.category}
        </span>
        <span className="text-xs text-[var(--color-neutral-400)]">{report.frequency}</span>
      </div>

      <p className="text-xs text-[var(--color-neutral-400)] mb-3">
        Last generated: <span className="font-mono">{report.lastGenerated}</span>
      </p>

      <div className="flex gap-2">
        <Button variant="secondary" size="sm" className="flex-1">
          👁 Preview
        </Button>
        <Button size="sm" className="flex-1">
          ⬇ Generate
        </Button>
      </div>
    </Card>
  );
}