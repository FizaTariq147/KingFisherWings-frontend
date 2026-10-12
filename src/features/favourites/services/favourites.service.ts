import { axiosInstance } from '@/lib/axios';
import { withGatewayRetry } from '@/lib/wakeApi';
import { FAVOURITES_API } from '../api/favourites.api';

export interface UserFavourite {
  id: string;
  kind: string;
  target_key: string;
  label?: string;
  created_at?: string;
}

export interface CreateFavouriteDto {
  kind: string;
  target_key: string;
  label?: string;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function unwrapList(raw: unknown): UserFavourite[] {
  if (Array.isArray(raw)) return raw as UserFavourite[];
  const root = asRecord(raw);
  const data = root?.data;
  if (Array.isArray(data)) return data as UserFavourite[];
  const nested = asRecord(data);
  if (Array.isArray(nested?.items)) return nested.items as UserFavourite[];
  return [];
}

function normalizeFavourite(raw: unknown): UserFavourite | null {
  const r = asRecord(raw);
  if (!r) return null;
  const id = String(r.id ?? '');
  const kind = String(r.kind ?? '');
  const target_key = String(r.target_key ?? r.targetKey ?? '');
  if (!id || !kind || !target_key) return null;
  return {
    id,
    kind,
    target_key,
    label: typeof r.label === 'string' ? r.label : undefined,
    created_at: typeof r.created_at === 'string' ? r.created_at : undefined,
  };
}

export const favouritesService = {
  async list(): Promise<UserFavourite[]> {
    const res = await withGatewayRetry(() => axiosInstance.get(FAVOURITES_API.list));
    return unwrapList(res.data)
      .map(normalizeFavourite)
      .filter((f): f is UserFavourite => Boolean(f));
  },

  async create(dto: CreateFavouriteDto): Promise<UserFavourite> {
    const res = await withGatewayRetry(() =>
      axiosInstance.post(FAVOURITES_API.create, dto),
    );
    const item = normalizeFavourite(asRecord(res.data)?.data ?? res.data);
    if (item) return item;
    throw new Error('Favourite was created but not returned.');
  },

  async remove(id: string): Promise<void> {
    await withGatewayRetry(() => axiosInstance.delete(FAVOURITES_API.byId(id)));
  },
};
