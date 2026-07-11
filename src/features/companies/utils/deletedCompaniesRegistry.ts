import type { Company } from '../types/company.types';

export type DeletedCompanySnapshot = Company & {
  tenant_id: string;
  tenant_name: string;
  tenant_code: string;
};

const STORAGE_KEY = 'kf-deleted-companies-v1';
const SHARED_KEY = 'platform';

type DeletedCompaniesStore = Record<string, DeletedCompanySnapshot[]>;

function readStore(): DeletedCompaniesStore {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
    return parsed as DeletedCompaniesStore;
  } catch {
    return {};
  }
}

function writeStore(store: DeletedCompaniesStore) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    // Ignore quota / private-mode failures.
  }
}

export function isDeletedCompany(company: {
  deleted_at?: string | null;
  deletedAt?: unknown;
  is_deleted?: unknown;
  isDeleted?: unknown;
}): boolean {
  if (company.deleted_at) return true;
  if (typeof company.deletedAt === 'string' && company.deletedAt) return true;
  if (company.is_deleted === true || company.isDeleted === true) return true;
  return false;
}

function toDeletedSnapshot(company: DeletedCompanySnapshot): DeletedCompanySnapshot {
  return {
    ...company,
    deleted_at: company.deleted_at || new Date().toISOString(),
    is_active: false,
  };
}

/** Remember soft-deleted company — GET /companies omits them (no include_deleted). */
export function rememberDeletedCompany(company: DeletedCompanySnapshot): void {
  const store = readStore();
  const snapshot = toDeletedSnapshot(company);
  const existing = store[SHARED_KEY] ?? [];
  store[SHARED_KEY] = [snapshot, ...existing.filter((item) => item.id !== company.id)];
  writeStore(store);
}

export function forgetDeletedCompany(companyId: string): void {
  const store = readStore();
  for (const key of Object.keys(store)) {
    store[key] = (store[key] ?? []).filter((item) => item.id !== companyId);
  }
  writeStore(store);
}

export function listRememberedDeletedCompanies(): DeletedCompanySnapshot[] {
  const store = readStore();
  const byId = new Map<string, DeletedCompanySnapshot>();

  for (const companies of Object.values(store)) {
    for (const company of companies ?? []) {
      byId.set(company.id, toDeletedSnapshot(company));
    }
  }

  return Array.from(byId.values()).sort((a, b) => {
    const aTime = a.deleted_at ? Date.parse(a.deleted_at) : 0;
    const bTime = b.deleted_at ? Date.parse(b.deleted_at) : 0;
    return bTime - aTime;
  });
}

export function isRememberedDeletedCompany(companyId: string): boolean {
  return listRememberedDeletedCompanies().some((company) => company.id === companyId);
}

export function formatCompanyLabel(
  company: Pick<Company, 'name' | 'code'> & { legal_name?: string | null },
): string {
  for (const value of [company.name, company.legal_name, company.code]) {
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return 'This company';
}
