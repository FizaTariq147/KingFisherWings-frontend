import { axiosInstance } from '@/lib/axios';
import { withGatewayRetry } from '@/lib/wakeApi';
import { FAVOURITES_API } from '../api/favourites.api';
import { toFavouriteKind } from '../utils/favouriteKind';

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

export interface FavouriteCheckResult {
  is_favourite: boolean;
  favourite_id?: string;
  favourite?: UserFavourite | null;
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
  const kind = String(r.kind ?? r.entity_type ?? '');
  const target_key = String(
    r.target_key ?? r.targetKey ?? r.entity_id ?? r.entityId ?? '',
  );
  if (!id || !kind || !target_key) return null;
  return {
    id,
    kind,
    target_key,
    label: typeof r.label === 'string' ? r.label : undefined,
    created_at:
      typeof r.created_at === 'string'
        ? r.created_at
        : typeof r.createdAt === 'string'
          ? r.createdAt
          : undefined,
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
    const body = {
      ...dto,
      kind: toFavouriteKind(dto.kind),
    };
    const res = await withGatewayRetry(() =>
      axiosInstance.post(FAVOURITES_API.create, body),
    );
    const item = normalizeFavourite(asRecord(res.data)?.data ?? res.data);
    if (item) return item;
    throw new Error('Favourite was created but not returned.');
  },

  async check(kind: string, targetKey: string): Promise<FavouriteCheckResult> {
    const apiKind = toFavouriteKind(kind);
    const res = await withGatewayRetry(() =>
      axiosInstance.get(FAVOURITES_API.check, {
        params: { kind: apiKind, target_key: targetKey },
      }),
    );
    const root = asRecord(res.data);
    const data = asRecord(root?.data) ?? root ?? {};
    const fav = normalizeFavourite(data.favourite ?? data);
    const isFav =
      data.is_favourite === true ||
      data.isFavourite === true ||
      data.favourited === true ||
      Boolean(fav?.id) ||
      data.exists === true;
    return {
      is_favourite: Boolean(isFav),
      favourite_id: fav?.id ?? (typeof data.favourite_id === 'string' ? data.favourite_id : undefined),
      favourite: fav,
    };
  },

  async toggle(dto: CreateFavouriteDto): Promise<FavouriteCheckResult> {
    const body = {
      ...dto,
      kind: toFavouriteKind(dto.kind),
    };
    const res = await withGatewayRetry(() =>
      axiosInstance.post(FAVOURITES_API.toggle, body),
    );    const root = asRecord(res.data);
    const data = asRecord(root?.data) ?? root ?? {};
    const fav = normalizeFavourite(data.favourite ?? data);
    const removed =
      data.removed === true ||
      data.is_favourite === false ||
      data.isFavourite === false;
    return {
      is_favourite: removed ? false : Boolean(fav?.id) || data.is_favourite === true,
      favourite_id: fav?.id,
      favourite: fav,
    };
  },

  async remove(id: string): Promise<void> {
    await withGatewayRetry(() => axiosInstance.delete(FAVOURITES_API.byId(id)));
  },
};
