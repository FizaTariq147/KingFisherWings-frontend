import { crmLabel } from '@/features/crm/constants/crm.constants';
import type { Lead } from '@/features/crm/types/crm.types';
import { PARTY_TYPE_LABELS, CREDIT_STATUS_LABELS } from '@/features/parties/constants/party.constants';
import type { Party } from '@/features/parties/types/party.types';
import { tariffDisplayLabel } from '@/features/tariffs/utils/normalizeTariff';
import type { Tariff } from '@/features/tariffs/types/tariff.types';
import type { SalesClientRow, SalesTariffRow, SalesVisitingCardRow } from '../types/sales.types';

export function mapPartyToClientRow(party: Party): SalesClientRow {
  const raw = party as Record<string, unknown>;
  return {
    id: party.id,
    createdBy: String(raw.created_by ?? raw.createdBy ?? party.salesperson_id ?? '—'),
    code: party.code,
    name: party.name,
    status: party.credit_status
      ? CREDIT_STATUS_LABELS[party.credit_status] ?? party.credit_status
      : party.is_active === false
        ? 'Inactive'
        : 'Active',
    type: PARTY_TYPE_LABELS[party.party_type] ?? party.party_type,
    category: (party.tags ?? []).join(', ') || party.party_type,
    port: party.city || party.iata_code || '—',
    website: party.email || '—',
    vendorCode: party.scac_code || party.code,
    remarks: party.notes || '—',
  };
}

export function mapTariffToSalesRow(tariff: Tariff): SalesTariffRow {
  return {
    id: tariff.id,
    owner: tariff.customer_name || tariff.charge_name || '—',
    client: tariff.customer_name || '—',
    service: tariff.service_type.replaceAll('_', ' '),
    origin: tariff.origin_port_code || tariff.origin_port_name || tariff.origin_port_id || '—',
    destination: tariff.dest_port_code || tariff.dest_port_name || tariff.dest_port_id || '—',
    charge: tariff.charge_code || tariff.charge_name || tariffDisplayLabel(tariff),
    currency: tariff.currency_code,
    saleRate: tariff.sale_rate,
    costRate: tariff.cost_rate,
    validFrom: tariff.valid_from?.slice(0, 10) || '—',
    validTo: tariff.valid_to?.slice(0, 10) || '—',
    active: tariff.is_active === false ? 'Inactive' : 'Active',
  };
}

export function mapLeadToVisitingCardRow(lead: Lead): SalesVisitingCardRow {
  return {
    id: lead.id,
    company: lead.company_name,
    contact: lead.contact_name,
    email: lead.email || '—',
    phone: lead.phone || '—',
    source: lead.source ? crmLabel(lead.source) : '—',
    status: crmLabel(lead.status),
    createdAt: lead.created_at?.slice(0, 10) || '—',
  };
}

export function filterVisitingCardLeads(leads: Lead[], search?: string): Lead[] {
  const cardSources = new Set(['EXHIBITION', 'REFERRAL', 'WEBSITE', 'COLD_CALL', 'OTHER']);
  let rows = leads.filter(
    (lead) =>
      (lead.source && cardSources.has(lead.source)) ||
      Boolean(lead.email?.trim()) ||
      Boolean(lead.phone?.trim()),
  );
  if (search?.trim()) {
    const term = search.trim().toLowerCase();
    rows = rows.filter((lead) =>
      [lead.company_name, lead.contact_name, lead.email, lead.phone, lead.source, lead.notes]
        .join(' ')
        .toLowerCase()
        .includes(term),
    );
  }
  return rows;
}
