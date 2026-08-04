import { isUuid } from '@/lib/isUuid';
import type { CreditStatus, PartyType } from '../constants/party.constants';
import { CREDIT_STATUSES, PARTY_TYPES } from '../constants/party.constants';
import type { Party, PartyAddress, PartyContact } from '../types/party.types';

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function pickString(raw: Record<string, unknown>, ...keys: string[]): string | undefined {
  for (const key of keys) {
    const value = raw[key];
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return undefined;
}

function pickNumber(raw: Record<string, unknown>, ...keys: string[]): number | undefined {
  for (const key of keys) {
    const value = raw[key];
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    if (typeof value === 'string' && value.trim() && !Number.isNaN(Number(value))) {
      return Number(value);
    }
  }
  return undefined;
}

function pickBoolean(raw: Record<string, unknown>, ...keys: string[]): boolean | undefined {
  for (const key of keys) {
    const value = raw[key];
    if (typeof value === 'boolean') return value;
  }
  return undefined;
}

function normalizePartyType(value: unknown): PartyType {
  const raw = String(value ?? '')
    .trim()
    .toUpperCase();
  return (PARTY_TYPES as readonly string[]).includes(raw) ? (raw as PartyType) : 'OTHER';
}

function normalizeCreditStatus(value: unknown): CreditStatus | undefined {
  const raw = String(value ?? '')
    .trim()
    .toUpperCase();
  return (CREDIT_STATUSES as readonly string[]).includes(raw)
    ? (raw as CreditStatus)
    : undefined;
}

export function normalizePartyContact(raw: unknown): PartyContact | null {
  const record = asRecord(raw);
  if (!record) return null;
  const id = pickString(record, 'id') ?? '';
  const name = pickString(record, 'name') ?? '';
  if (!id || !name) return null;
  return {
    id,
    name,
    designation: pickString(record, 'designation'),
    phone: pickString(record, 'phone'),
    mobile: pickString(record, 'mobile'),
    email: pickString(record, 'email'),
    is_primary: pickBoolean(record, 'is_primary', 'isPrimary'),
  };
}

export function normalizePartyAddress(raw: unknown): PartyAddress | null {
  const record = asRecord(raw);
  if (!record) return null;
  const id = pickString(record, 'id') ?? '';
  const label = pickString(record, 'label') ?? '';
  const address_line1 = pickString(record, 'address_line1', 'addressLine1') ?? '';
  const country_code = pickString(record, 'country_code', 'countryCode')?.toUpperCase() ?? '';
  if (!id || !label || !address_line1 || !country_code) return null;
  return {
    id,
    label,
    address_line1,
    address_line2: pickString(record, 'address_line2', 'addressLine2'),
    city: pickString(record, 'city'),
    state: pickString(record, 'state'),
    postal_code: pickString(record, 'postal_code', 'postalCode'),
    country_code,
    is_default: pickBoolean(record, 'is_default', 'isDefault'),
  };
}

export function normalizeParty(raw: unknown): Party | null {
  const record = asRecord(raw);
  if (!record) return null;
  const id = pickString(record, 'id') ?? '';
  if (!id) return null;

  const companyId = pickString(record, 'company_id', 'companyId');
  const salespersonId = pickString(record, 'salesperson_id', 'salespersonId');
  const tagsRaw = record.tags;
  let tags: string[] | undefined;
  if (Array.isArray(tagsRaw)) {
    tags = [];
    for (const t of tagsRaw) {
      const trimmed = String(t).trim();
      if (trimmed) tags.push(trimmed);
    }
  } else {
    tags = undefined;
  }

  const contactsRaw = record.contacts ?? record.party_contacts;
  const addressesRaw = record.addresses ?? record.party_addresses;

  return {
    id,
    company_id: companyId && isUuid(companyId) ? companyId : undefined,
    party_type: normalizePartyType(record.party_type ?? record.partyType),
    code: pickString(record, 'code') ?? '',
    name: pickString(record, 'name') ?? '—',
    short_name: pickString(record, 'short_name', 'shortName'),
    vat_number: pickString(record, 'vat_number', 'vatNumber'),
    cr_number: pickString(record, 'cr_number', 'crNumber'),
    country_code: pickString(record, 'country_code', 'countryCode')?.toUpperCase(),
    city: pickString(record, 'city'),
    address: pickString(record, 'address'),
    phone: pickString(record, 'phone'),
    email: pickString(record, 'email'),
    credit_limit: pickNumber(record, 'credit_limit', 'creditLimit'),
    credit_days: pickNumber(record, 'credit_days', 'creditDays'),
    currency_code: pickString(record, 'currency_code', 'currencyCode')?.toUpperCase(),
    credit_status: normalizeCreditStatus(record.credit_status ?? record.creditStatus),
    salesperson_id: salespersonId && isUuid(salespersonId) ? salespersonId : undefined,
    portal_access: pickBoolean(record, 'portal_access', 'portalAccess'),
    marketing_subscription: pickBoolean(record, 'marketing_subscription', 'marketingSubscription'),
    iata_code: pickString(record, 'iata_code', 'iataCode'),
    scac_code: pickString(record, 'scac_code', 'scacCode'),
    tags,
    notes: pickString(record, 'notes'),
    is_active: pickBoolean(record, 'is_active', 'isActive') ?? true,
    deleted_at: pickString(record, 'deleted_at', 'deletedAt') ?? null,
    created_at: pickString(record, 'created_at', 'createdAt'),
    updated_at: pickString(record, 'updated_at', 'updatedAt'),
    contacts: Array.isArray(contactsRaw)
      ? contactsRaw.map(normalizePartyContact).filter((c): c is PartyContact => Boolean(c))
      : undefined,
    addresses: Array.isArray(addressesRaw)
      ? addressesRaw.map(normalizePartyAddress).filter((a): a is PartyAddress => Boolean(a))
      : undefined,
  };
}

export function normalizeParties(raw: unknown): Party[] {
  if (!Array.isArray(raw)) return [];
  return raw.map(normalizeParty).filter((p): p is Party => Boolean(p));
}
