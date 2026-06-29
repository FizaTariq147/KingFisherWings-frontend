import {
  Users,
  Building,
  FileText,
  Headphones,
  Clipboard,
  Calculator,
  BarChart2,
  Package,
  IdCard,
  type LucideIcon,
} from 'lucide-react'
import { MODULES } from '@/constants/marketingData'

const ICON_MAP: Record<string, LucideIcon> = {
  Users,
  Building,
  FileText,
  Headphones,
  Clipboard,
  Calculator,
  BarChart2,
  Package,
  IdCard,
}

const MODULE_DESCRIPTIONS: Record<string, string> = {
  'Sales & CRM':       'Leads, enquiries, call logs, and pipeline tracking.',
  'Organizations':     'Customer, vendor, and agent master records.',
  'Quotations':        'Multi-mode tariffs, online quoting, GP analysis.',
  'Customer Service':  'Air, sea, land and courier job management.',
  'Documentation':     '35+ shipping documents auto-generated per job.',
  'Accounts':          'UAE VAT invoicing, GL, AR/AP, bank reconciliation.',
  'Management (MIS)':  'Executive dashboards, profit reports, KPI tracking.',
  'WMS':               'Warehouse receipts, inventory control, and releases.',
  'HR & Payroll':      'Employee records, leave, attendance, payroll, WPS.',
}

export default function Modules() {
  return (
    <section className="bg-[#F7F8FA] py-24">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-medium text-gray-900">
            Every department. One system.
          </h2>
          <p className="text-gray-500 mt-3 text-base max-w-xl mx-auto">
            From quotation to final invoice — every team works inside Fresa Gold.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {MODULES.map(({ name, icon }) => {
            const Icon = ICON_MAP[icon]
            return (
              <div
                key={name}
                className="bg-white border border-gray-200 rounded-xl p-6 hover:border-[#1a6e38] transition-colors"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 bg-[#e8f5ee] rounded-lg flex items-center justify-center shrink-0">
                    <Icon size={16} className="text-[#1a6e38]" aria-hidden="true" />
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900">{name}</h3>
                </div>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {MODULE_DESCRIPTIONS[name]}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}