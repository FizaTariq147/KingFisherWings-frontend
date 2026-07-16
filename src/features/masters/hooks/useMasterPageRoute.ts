import { useParams } from 'react-router-dom';

export type MasterPageRouteProps = {
  /** Fixed resource key when not taken from `/masters/:resourceKey`. */
  resourceKey?: string;
  /** UI path prefix without trailing slash (e.g. `/quotations/tariff-master`). */
  routePrefix?: string;
  backHref?: string;
  backLabel?: string;
};

/** Resolve list/form/detail navigation for Masters or Quotation-hosted masters. */
export function useMasterPageRoute(props: MasterPageRouteProps = {}) {
  const params = useParams();
  const resourceKey = props.resourceKey ?? params.resourceKey ?? '';
  const id = params.id ?? '';
  const routePrefix = props.routePrefix ?? (resourceKey ? `/masters/${resourceKey}` : '');
  const backHref = props.backHref ?? '/masters';
  const backLabel = props.backLabel ?? 'Masters';

  return {
    resourceKey,
    id,
    routePrefix,
    backHref,
    backLabel,
    listPath: routePrefix,
    newPath: `${routePrefix}/new`,
    detailPath: (recordId: string) => `${routePrefix}/${recordId}`,
    editPath: (recordId: string) => `${routePrefix}/${recordId}/edit`,
  };
}
