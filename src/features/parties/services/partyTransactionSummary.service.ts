import { axiosInstance } from '@/lib/axios';
import { isUuid } from '@/lib/isUuid';
import { glPaymentService } from '@/features/glPayments/services/glPayment.service';
import { invoiceService } from '@/features/invoices/services/invoice.service';
import { jobService } from '@/features/jobs/services/job.service';
import { jobDisplayNumber } from '@/features/jobs/utils/jobRoute';
import { paymentRequestService } from '@/features/paymentRequests/services/paymentRequest.service';
import { quotationService } from '@/features/quotations/services/quotation.service';
import { postShareEmail } from '@/features/shared/share-email';
import { PARTY_API } from '../api/party.api';
import type {
  PartyTransactionBucket,
  PartyTransactionItem,
  PartyTransactionSummary,
  SendPartyTransactionSummaryDto,
  SendPartyTransactionSummaryResult,
} from '../types/partyTransactionSummary.types';
import {
  normalizeSendTransactionSummaryResult,
} from '../utils/normalizePartyTransactionSummary';

const LIST_LIMIT = 50;

function formatAxiosError(error: unknown): Error {
  if (error instanceof Error && !(error as { response?: unknown }).response) {
    return error;
  }
  const axiosErr = error as {
    response?: { data?: { message?: string | string[]; error?: string }; status?: number };
    message?: string;
  };
  const data = axiosErr.response?.data;
  const message = data?.message;
  if (Array.isArray(message)) return new Error(message.map(String).join('; '));
  if (typeof message === 'string' && message.trim()) return new Error(message);
  if (typeof data?.error === 'string' && data.error.trim()) return new Error(data.error);
  return new Error(axiosErr.message || 'Request failed');
}

function assertPartyId(id?: string): asserts id is string {
  if (!id || !isUuid(id)) throw new Error('Invalid party id.');
}

function toBucket(items: PartyTransactionItem[]): PartyTransactionBucket {
  const amount = items.reduce((sum, item) => sum + (item.amount ?? 0), 0);
  return {
    count: items.length,
    amount: amount || undefined,
    items,
  };
}

function humanCode(value: string | undefined, fallback: string): string {
  const trimmed = value?.trim();
  if (trimmed && !isUuid(trimmed)) return trimmed;
  return fallback;
}

async function safe<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch {
    return fallback;
  }
}

export const partyTransactionSummaryService = {
  /**
   * Build summary from party-scoped list APIs (numbers/names), not history UUIDs.
   * Quotes → /quotations?customer_id=
   * Jobs → /jobs?shipper_id= + /jobs?consignee_id=
   * Invoices → /invoices?party_id=
   * Payments → /gl/payments?party_id= (fallback /payment-requests)
   */
  async getSummary(partyId: string): Promise<PartyTransactionSummary> {
    assertPartyId(partyId);

    const [quotesRes, shipperJobs, consigneeJobs, invoicesRes, glPaymentsRes, paymentRequestsRes] =
      await Promise.all([
        safe(() => quotationService.list({ customer_id: partyId, page: 1, limit: LIST_LIMIT }), {
          quotations: [],
          meta: { page: 1, limit: LIST_LIMIT, total: 0, totalPages: 1 },
        }),
        safe(() => jobService.list({ shipper_id: partyId, page: 1, limit: LIST_LIMIT }), {
          jobs: [],
          meta: { page: 1, limit: LIST_LIMIT, total: 0, totalPages: 1 },
        }),
        safe(() => jobService.list({ consignee_id: partyId, page: 1, limit: LIST_LIMIT }), {
          jobs: [],
          meta: { page: 1, limit: LIST_LIMIT, total: 0, totalPages: 1 },
        }),
        safe(() => invoiceService.list({ party_id: partyId, page: 1, limit: LIST_LIMIT }), {
          invoices: [],
          meta: { page: 1, limit: LIST_LIMIT, total: 0, totalPages: 1 },
        }),
        safe(() => glPaymentService.list({ party_id: partyId, direction: 'RECEIPT' }), {
          payments: [],
        }),
        safe(
          () => paymentRequestService.list({ party_id: partyId, page: 1, limit: LIST_LIMIT }),
          { paymentRequests: [], meta: { page: 1, limit: LIST_LIMIT, total: 0, totalPages: 1 } },
        ),
      ]);

    const quoteItems: PartyTransactionItem[] = quotesRes.quotations.map((q) => ({
      id: q.id,
      reference: humanCode(
        q.quotation_number || q.quote_no,
        `Quote ${q.id.slice(0, 8).toUpperCase()}`,
      ),
      status: q.status,
      date: q.quotation_date ?? q.created_at ?? q.valid_until,
      amount: q.total_amount ?? q.revenue_total ?? q.subtotal,
    }));

    const jobById = new Map<string, (typeof shipperJobs.jobs)[number]>();
    for (const job of [...shipperJobs.jobs, ...consigneeJobs.jobs]) {
      jobById.set(job.id, job);
    }
    const jobItems: PartyTransactionItem[] = [...jobById.values()].map((job) => ({
      id: job.id,
      reference: humanCode(job.job_number, jobDisplayNumber(job)),
      status: job.status,
      date: job.created_at ?? job.etd ?? job.eta,
      amount: undefined,
    }));

    const invoiceItems: PartyTransactionItem[] = invoicesRes.invoices.map((inv) => {
      const remaining =
        inv.outstanding_balance ??
        (inv.total_amount != null && inv.paid_amount != null
          ? Math.max(0, inv.total_amount - inv.paid_amount)
          : undefined) ??
        inv.total_amount ??
        inv.subtotal;
      const paidLabel =
        inv.paid_amount != null && Number.isFinite(inv.paid_amount)
          ? `Paid ${inv.paid_amount}`
          : null;
      const remainLabel =
        remaining != null && Number.isFinite(remaining) ? `Remaining ${remaining}` : null;
      return {
        id: inv.id,
        reference: humanCode(
          inv.invoice_number,
          `Invoice ${inv.id.slice(0, 8).toUpperCase()}`,
        ),
        status: [inv.status, paidLabel, remainLabel].filter(Boolean).join(' · ') || inv.status,
        date: inv.invoice_date ?? inv.created_at,
        // Credit views show what is still open against each invoice.
        amount: remaining,
      };
    });

    const glItems: PartyTransactionItem[] = glPaymentsRes.payments.map((p) => ({
      id: p.id,
      reference: humanCode(
        p.payment_number,
        `Payment ${p.id.slice(0, 8).toUpperCase()}`,
      ),
      status: p.status,
      date: p.payment_date ?? p.created_at,
      amount: p.amount,
    }));

    const paymentItems: PartyTransactionItem[] =
      glItems.length > 0
        ? glItems
        : paymentRequestsRes.paymentRequests.map((pr) => ({
            id: pr.id,
            reference: humanCode(
              pr.request_number,
              `PR ${pr.id.slice(0, 8).toUpperCase()}`,
            ),
            status: pr.status,
            date: pr.created_at ?? pr.due_date,
            amount: pr.amount,
          }));

    const openBalance = invoicesRes.invoices.reduce((sum, inv) => {
      const due = inv.outstanding_balance;
      return sum + (typeof due === 'number' && Number.isFinite(due) ? due : 0);
    }, 0);

    const currency =
      invoicesRes.invoices.find((inv) => inv.currency_code)?.currency_code ||
      glPaymentsRes.payments.find((p) => p.currency_code)?.currency_code ||
      quotesRes.quotations.find((q) => q.currency_code)?.currency_code;

    return {
      available: true,
      party_id: partyId,
      currency_code: currency,
      quotes: toBucket(quoteItems),
      jobs: toBucket(jobItems),
      invoices: toBucket(invoiceItems),
      payments: toBucket(paymentItems),
      open_balance: openBalance || undefined,
    };
  },

  /** POST /parties/{id}/credit/summary/send-email (DocumentShareEmailDto). */
  async sendSummary(
    partyId: string,
    dto: SendPartyTransactionSummaryDto,
  ): Promise<SendPartyTransactionSummaryResult> {
    assertPartyId(partyId);
    const to = (dto.emails ?? [])
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean);
    const message = dto.message?.trim() || undefined;
    try {
      const result = await postShareEmail(axiosInstance, PARTY_API.creditSummarySendEmail(partyId), {
        ...(to.length ? { to } : {}),
        ...(message ? { message } : {}),
        include_pdf: true,
      });
      return normalizeSendTransactionSummaryResult({
        sent: result.success !== false,
        message:
          result.message ||
          (result.success === false ? 'Failed to send summary.' : 'Summary sent.'),
      });
    } catch (error) {
      throw formatAxiosError(error);
    }
  },
};
