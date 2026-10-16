/** User favourites — OpenAPI GET/POST /favourites, check, toggle, DELETE /favourites/:id */
export const FAVOURITES_API = {
  list: '/favourites',
  create: '/favourites',
  check: '/favourites/check',
  toggle: '/favourites/toggle',
  byId: (id: string) => `/favourites/${id}`,
} as const;
