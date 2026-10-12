/** User favourites — OpenAPI GET/POST /favourites, DELETE /favourites/:id */
export const FAVOURITES_API = {
  list: '/favourites',
  create: '/favourites',
  byId: (id: string) => `/favourites/${id}`,
} as const;
