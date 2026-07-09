import { useState } from 'react'
import { WelcomeBanner } from '../../../../components/dashboard/WelcomeBanner'
import { QuickAccessToolbar } from '../../../../components/dashboard/QuickAccessToolbar'
import { DashboardCard } from '../../../../components/dashboard/DashboardCard'
import { TodoDetailCell } from '../../../../components/dashboard/TodoDetailCell'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../../../components/ui/Table'
import { Badge } from '../../../../components/ui/Badge'
import type { ShipmentRow, JobRow, InvoiceRow, TodoRow, Priority } from '@/types/dashboard.types'

// ── Mock data — typed as drop-in replacements for real API responses ──────
const activeShipments: ShipmentRow[] = [
  { id: 's1', shipmentNo: 'KFW/AE/06/26/B/00024', client: 'ABDO OTHAM BY AIR SHIPPMENTS MR ABDULLAH', jobNo: 'KFW/AE/06/26/00144', por: 'DXB', pof: 'BAH' },
  { id: 's2', shipmentNo: 'KFW/AE/06/26/B/00023', client: 'ABDO OTHAM BY AIR SHIPPMENTS MR ABDULLAH', jobNo: 'KFW/AE/06/26/00143', por: 'DXB', pof: 'BAH' },
  { id: 's3', shipmentNo: 'KFW/NI/06/26/B/00022', client: 'BPA WORLD LOGISTIC LLC', jobNo: 'KFW/NI/06/26/00140', por: 'PKKHI', pof: 'AEJEA' },
]

const activeJobs: JobRow[] = [
  { id: 'j1', jobNo: 'KFW/AE/07/26/00159', client: 'ABDO OTHAM BY AIR SHIPPMENTS MR ABDULLAH', pol: 'DXB', pod: 'BAH', etd: '05-JUL-26', eta: '' },
  { id: 'j2', jobNo: 'KFW/AI/07/26/00158', client: 'INTELLECT SHIPPING LLC', pol: 'DEL', pod: 'DXB', etd: '01-JUL-26', eta: '02-JUL-26' },
  { id: 'j3', jobNo: 'KFW/FI/07/26/00157', client: 'INTELLECT SHIPPING LLC', pol: 'INMUN', pod: 'INMUN', etd: '19-MAY-26', eta: '02-JUL-26' },
]

const recentInvoices: InvoiceRow[] = [
  { id: 'i1', voucherNo: 'INV-00981', client: 'ABDO OTHAM BY AIR SHIPPMENTS', date: '05-JUL-26', amount: 4250.0, currency: 'AED' },
  { id: 'i2', voucherNo: 'INV-00980', client: 'INTELLECT SHIPPING LLC', date: '04-JUL-26', amount: 1980.0, currency: 'AED' },
  { id: 'i3', voucherNo: 'INV-00979', client: 'BPA WORLD LOGISTIC LLC', date: '03-JUL-26', amount: 3120.0, currency: 'AED' },
]

const todoList: TodoRow[] = [
  { id: 't1', details: 'KFW/JOB/06/25/00024 // In this job 200000 AED Dubai customs fine is pending, issued the post dated cheque by King Fisher General Trading Account // Cheque No: 500009', priority: 'High', date: '12-NOV-25', assigned: 'Shahzad Zafar By Shahida Kadri' },
  { id: 't2', details: 'Confirm AWB stock for DXB export', priority: 'Medium', date: '08-JUL-26', assigned: 'Fiza' },
  { id: 't3', details: 'Send invoice to Intellect Shipping', priority: 'Low', date: '09-JUL-26', assigned: 'Farhan' },
]

const PRIORITY_VARIANT: Record<Priority, 'danger' | 'warning' | 'info'> = {
  High: 'danger',
  Medium: 'warning',
  Low: 'info',
}



export function DashboardPage() {
  // Wire these to real queries once the endpoints are live — kept as local
  // state here so the empty/loading states below are easy to demo/test.
  const [isLoading] = useState(false)

  return (
    <div className="pb-16">
      {/* space-y-4 keeps the sections apart; pb-16 clears the fixed footer bar */}
      <div className="space-y-4">
        <WelcomeBanner />
        <QuickAccessToolbar />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <DashboardCard
            title="Current Active Shipments"
            accent="primary"
            isLoading={isLoading}
            isEmpty={!isLoading && activeShipments.length === 0}
            emptyMessage="No active shipments right now."
          >
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Shipment No.</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Job No.</TableHead>
                  <TableHead>POR</TableHead>
                  <TableHead>POF</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeShipments.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell mono className="text-[var(--color-primary)]">{row.shipmentNo}</TableCell>
                    <TableCell className="max-w-[220px] truncate"><div title={row.client}>{row.client}</div></TableCell>
                    <TableCell mono className="text-[var(--color-primary)]">{row.jobNo}</TableCell>
                    <TableCell>{row.por}</TableCell>
                    <TableCell>{row.pof}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </DashboardCard>

          <DashboardCard
            title="Current Active Jobs"
            accent="secondary"
            isLoading={isLoading}
            isEmpty={!isLoading && activeJobs.length === 0}
            emptyMessage="No active jobs right now."
          >
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Job No.</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>POL</TableHead>
                  <TableHead>POD</TableHead>
                  <TableHead>ETD</TableHead>
                  <TableHead>ETA</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeJobs.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell mono className="text-[var(--color-primary)]">{row.jobNo}</TableCell>
                    <TableCell className="max-w-[220px] truncate"><div title={row.client}>{row.client}</div></TableCell>
                    <TableCell>{row.pol}</TableCell>
                    <TableCell>{row.pod}</TableCell>
                    <TableCell>{row.etd}</TableCell>
                    <TableCell>{row.eta || '—'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </DashboardCard>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <DashboardCard
            title="Recent Created Invoices"
            accent="primaryTint"
            isLoading={isLoading}
            isEmpty={!isLoading && recentInvoices.length === 0}
            emptyMessage="No invoices created recently."
          >
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Voucher No.</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Amount (AED)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentInvoices.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell mono className="text-[var(--color-primary)]">{row.voucherNo}</TableCell>
                    <TableCell className="max-w-[220px] truncate"><div title={row.client}>{row.client}</div></TableCell>
                    <TableCell>{row.date}</TableCell>
                    <TableCell mono className="text-right">
                      {row.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </DashboardCard>

          <DashboardCard
            title="Todo List"
            accent="neutral"
            isLoading={isLoading}
            isEmpty={!isLoading && todoList.length === 0}
            emptyMessage="Nothing on the todo list."
          >
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-6">&nbsp;</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Assigned</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {todoList.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>
                      <input type="checkbox" className="accent-[var(--color-secondary)]" aria-label={`Mark "${row.details.slice(0, 30)}…" done`} />
                    </TableCell>
                    <TableCell className="max-w-[320px]">
                      <TodoDetailCell text={row.details} />
                    </TableCell>
                    <TableCell>
                      <Badge variant={PRIORITY_VARIANT[row.priority]}>{row.priority}</Badge>
                    </TableCell>
                    <TableCell>{row.date}</TableCell>
                    <TableCell className="max-w-[140px] truncate"><div title={row.assigned}>{row.assigned}</div></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </DashboardCard>
        </div>
      </div>

    
    </div>
  )
}
