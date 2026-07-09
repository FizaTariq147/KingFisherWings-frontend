import { useQuery } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle } from '../../components/ui/Card';
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
  issueDate: string;
  dueDate: string;
  status: 'Unpaid' | 'Paid' | 'Overdue';
  paymentTerms: string;
  currency: string;
  client: {
    name: string;
    address: string;
    country: string;
    email: string;
    phone: string;
    taxNo: string;
  };
  company: {
    name: string;
    address: string;
    phone: string;
    email: string;
    trn: string;
  };
  notes: string;
  paidOn?: string;
  paidAmount?: number;
}

interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  taxPct: number;
  amount: number;
}

interface PaymentRecord {
  id: string;
  date: string;
  amount: number;
  currency: string;
  method: string;
  reference: string;
}

const mockInvoice: Invoice = {
  id: '1',
  invoiceNo: 'INV/2026/00234',
  jobNo: 'KFW/AE/06/26/00141',
  issueDate: '2026-06-20',
  dueDate: '2026-07-10',
  status: 'Unpaid',
  paymentTerms: 'Net 30',
  currency: 'AED',
  client: {
    name: 'Al Futtaim LLC',
    address: 'P.O. Box 152, Sheikh Zayed Road, Dubai, UAE',
    country: 'UAE',
    email: 'accounts@alfuttaim.ae',
    phone: '+971 4 200 0000',
    taxNo: 'TRN-100234567890003',
  },
  company: {
    name: 'Kingfisher Wings Logistic LLC',
    address: 'P.O. Box 45678, Deira, Dubai, UAE',
    phone: '+971 4 555 0000',
    email: 'accounts@kingfisherwings.ae',
    trn: 'TRN-100123456789001',
  },
  notes: 'Payment via bank transfer only. Please quote invoice number as reference.',
  paidOn: undefined,
  paidAmount: undefined,
};

const mockLineItems: InvoiceLineItem[] = [
  { id: '1', description: 'Air Freight Charges — DXB to LHR (520 KG @ AED 12.50)', quantity: 520,  unit: 'KG',  unitPrice: 12.50, taxPct: 5, amount: 6500  },
  { id: '2', description: 'Fuel Surcharge (YQ) — 520 KG @ AED 3.20',               quantity: 520,  unit: 'KG',  unitPrice: 3.20,  taxPct: 5, amount: 1664  },
  { id: '3', description: 'Security Surcharge — 12 PCS @ AED 25.00',               quantity: 12,   unit: 'PCS', unitPrice: 25.00, taxPct: 5, amount: 300   },
  { id: '4', description: 'Airport Handling Fee — DXB',                             quantity: 480,  unit: 'KG',  unitPrice: 1.80,  taxPct: 5, amount: 864   },
  { id: '5', description: 'Documentation & HAWB Issuance Fee',                      quantity: 1,    unit: 'BL',  unitPrice: 250,   taxPct: 5, amount: 250   },
  { id: '6', description: 'Export Customs Clearance',                               quantity: 1,    unit: 'SHP', unitPrice: 450,   taxPct: 0, amount: 450   },
];

const mockPayments: PaymentRecord[] = [];

const statusVariant: Record<Invoice['status'], 'warning' | 'success' | 'danger'> = {
  Unpaid:  'warning',
  Paid:    'success',
  Overdue: 'danger',
};

export default function InvoiceDetail() {
  const { data: invoice }        = useQuery<Invoice>({ queryKey: ['invoice', '1'],        queryFn: async () => mockInvoice });
  const { data: lineItems = [] } = useQuery<InvoiceLineItem[]>({ queryKey: ['invoice-lines', '1'], queryFn: async () => mockLineItems });
  const { data: payments = [] }  = useQuery<PaymentRecord[]>({ queryKey: ['invoice-payments', '1'], queryFn: async () => mockPayments });

  if (!invoice) return null;

  const subtotal  = lineItems.reduce((s, l) => s + l.amount, 0);
  const taxAmount = lineItems.reduce((s, l) => s + (l.amount * l.taxPct) / 100, 0);
  const total     = subtotal + taxAmount;
  const paid      = payments.reduce((s, p) => s + p.amount, 0);
  const balance   = total - paid;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-lg font-semibold text-[var(--color-neutral-800)] font-mono">
              {invoice.invoiceNo}
            </h1>
            <Badge variant={statusVariant[invoice.status]}>{invoice.status}</Badge>
          </div>
          <p className="text-sm text-[var(--color-neutral-400)]">
            Job: <span className="font-mono">{invoice.jobNo}</span> · Issued {invoice.issueDate} · Due {invoice.dueDate}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary">🖨 Print</Button>
          <Button variant="secondary">⬇ Download PDF</Button>
          <Button variant="secondary">📧 Send to Client</Button>
          {invoice.status !== 'Paid' && <Button>✓ Record Payment</Button>}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Subtotal',    value: `AED ${subtotal.toLocaleString()}`,  color: 'text-[var(--color-neutral-800)]' },
          { label: 'VAT (5%)',    value: `AED ${taxAmount.toLocaleString()}`,  color: 'text-[var(--color-neutral-800)]' },
          { label: 'Total',       value: `AED ${total.toLocaleString()}`,      color: 'text-[var(--color-primary-600)]' },
          { label: 'Balance Due', value: `AED ${balance.toLocaleString()}`,    color: balance > 0 ? 'text-[var(--color-danger-500)]' : 'text-[var(--color-success-500)]' },
        ].map((s) => (
          <Card key={s.label} padding="sm">
            <p className="text-xs text-[var(--color-neutral-400)] mb-0.5">{s.label}</p>
            <p className={`text-lg font-bold font-mono ${s.color}`}>{s.value}</p>
          </Card>
        ))}
      </div>

      {/* Invoice Document */}
      <Card>
        {/* Invoice Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <div className="w-12 h-12 rounded-xl bg-[var(--color-primary-900)] flex items-center justify-center text-white font-bold text-sm mb-3">
              FG
            </div>
            <p className="font-bold text-[var(--color-neutral-800)]">{invoice.company.name}</p>
            <p className="text-sm text-[var(--color-neutral-400)]">{invoice.company.address}</p>
            <p className="text-sm text-[var(--color-neutral-400)]">{invoice.company.phone}</p>
            <p className="text-sm text-[var(--color-neutral-400)]">{invoice.company.email}</p>
            <p className="text-xs font-mono text-[var(--color-neutral-500)] mt-1">TRN: {invoice.company.trn}</p>
          </div>
          <div className="text-right">
            <h2 className="text-3xl font-bold text-[var(--color-neutral-800)] mb-2">TAX INVOICE</h2>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between gap-8">
                <span className="text-[var(--color-neutral-400)]">Invoice No.</span>
                <span className="font-mono font-semibold">{invoice.invoiceNo}</span>
              </div>
              <div className="flex justify-between gap-8">
                <span className="text-[var(--color-neutral-400)]">Job Ref.</span>
                <span className="font-mono">{invoice.jobNo}</span>
              </div>
              <div className="flex justify-between gap-8">
                <span className="text-[var(--color-neutral-400)]">Issue Date</span>
                <span className="font-mono">{invoice.issueDate}</span>
              </div>
              <div className="flex justify-between gap-8">
                <span className="text-[var(--color-neutral-400)]">Due Date</span>
                <span className={`font-mono font-semibold ${
                  invoice.status === 'Overdue' ? 'text-[var(--color-danger-500)]' : ''
                }`}>{invoice.dueDate}</span>
              </div>
              <div className="flex justify-between gap-8">
                <span className="text-[var(--color-neutral-400)]">Payment Terms</span>
                <span>{invoice.paymentTerms}</span>
              </div>
            </div>
            <div className="mt-3">
              <Badge variant={statusVariant[invoice.status]}>{invoice.status}</Badge>
            </div>
          </div>
        </div>

        {/* Bill To */}
        <div className="mb-6 p-4 rounded-lg bg-[var(--color-neutral-50)]">
          <p className="text-xs font-semibold text-[var(--color-neutral-400)] uppercase mb-2">Bill To</p>
          <p className="font-semibold text-[var(--color-neutral-800)]">{invoice.client.name}</p>
          <p className="text-sm text-[var(--color-neutral-500)]">{invoice.client.address}</p>
          <p className="text-sm text-[var(--color-neutral-500)]">{invoice.client.email} · {invoice.client.phone}</p>
          <p className="text-xs font-mono text-[var(--color-neutral-500)] mt-1">TRN: {invoice.client.taxNo}</p>
        </div>

        {/* Line Items */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>#</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Qty</TableHead>
              <TableHead>Unit</TableHead>
              <TableHead>Unit Price</TableHead>
              <TableHead>Tax %</TableHead>
              <TableHead>Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {lineItems.map((item, index) => (
              <TableRow key={item.id}>
                <TableCell className="text-[var(--color-neutral-400)]">{index + 1}</TableCell>
                <TableCell>{item.description}</TableCell>
                <TableCell mono>{item.quantity.toLocaleString()}</TableCell>
                <TableCell>{item.unit}</TableCell>
                <TableCell mono>{item.unitPrice.toFixed(2)}</TableCell>
                <TableCell>
                  {item.taxPct > 0
                    ? <Badge variant="info">{item.taxPct}%</Badge>
                    : <Badge variant="neutral">Exempt</Badge>
                  }
                </TableCell>
                <TableCell mono className="font-semibold">
                  {invoice.currency} {item.amount.toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Totals */}
        <div className="flex justify-end mt-4">
          <div className="w-64 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-[var(--color-neutral-400)]">Subtotal</span>
              <span className="font-mono">{invoice.currency} {subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--color-neutral-400)]">VAT (5%)</span>
              <span className="font-mono">{invoice.currency} {taxAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-[var(--color-neutral-200)]">
              <span className="font-bold text-[var(--color-neutral-800)]">Total</span>
              <span className="font-mono font-bold text-[var(--color-primary-600)]">
                {invoice.currency} {total.toLocaleString()}
              </span>
            </div>
            {paid > 0 && (
              <>
                <div className="flex justify-between">
                  <span className="text-[var(--color-neutral-400)]">Paid</span>
                  <span className="font-mono text-[var(--color-success-500)]">- {invoice.currency} {paid.toLocaleString()}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-[var(--color-neutral-200)]">
                  <span className="font-bold">Balance Due</span>
                  <span className="font-mono font-bold text-[var(--color-danger-500)]">
                    {invoice.currency} {balance.toLocaleString()}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Notes */}
        {invoice.notes && (
          <div className="mt-6 pt-4 border-t border-[var(--color-neutral-200)]">
            <p className="text-xs font-semibold text-[var(--color-neutral-400)] uppercase mb-1">Notes</p>
            <p className="text-sm text-[var(--color-neutral-600)]">{invoice.notes}</p>
          </div>
        )}
      </Card>

      {/* Payment History */}
      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
          {invoice.status !== 'Paid' && (
            <Button size="sm">+ Record Payment</Button>
          )}
        </CardHeader>
        {payments.length === 0 ? (
          <div className="text-center py-8 text-[var(--color-neutral-400)]">
            <p className="text-2xl mb-2">💳</p>
            <p className="text-sm">No payments recorded yet.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Reference</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((p) => (
                <TableRow key={p.id}>
                  <TableCell mono>{p.date}</TableCell>
                  <TableCell mono className="font-semibold text-[var(--color-success-500)]">
                    {p.currency} {p.amount.toLocaleString()}
                  </TableCell>
                  <TableCell>{p.method}</TableCell>
                  <TableCell mono>{p.reference}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}