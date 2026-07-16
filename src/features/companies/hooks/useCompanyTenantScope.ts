import { useCallback, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { isUuid } from '@/lib/isUuid';

const TENANT_PARAM = 'tenant';

/** Super-admin company APIs are tenant-scoped — tenant id travels in the URL query string. */
export function useCompanyTenantScope() {
  const [searchParams, setSearchParams] = useSearchParams();
  const rawTenantId = searchParams.get(TENANT_PARAM) ?? '';
  const tenantId = isUuid(rawTenantId) ? rawTenantId : '';
  const hasInvalidTenantParam = Boolean(rawTenantId) && !tenantId;

  useEffect(() => {
    if (hasInvalidTenantParam) {
      setSearchParams({}, { replace: true });
    }
  }, [hasInvalidTenantParam, setSearchParams]);

  const setTenantId = useCallback(
    (id: string) => {
      setSearchParams(id && isUuid(id) ? { [TENANT_PARAM]: id } : {}, { replace: true });
    },
    [setSearchParams],
  );

  const companiesBasePath = useMemo(
    () => (tenantId ? `/superadmin/companies?${TENANT_PARAM}=${tenantId}` : '/superadmin/companies'),
    [tenantId],
  );

  const companyPath = useCallback(
    (suffix = '') => {
      const path = `/superadmin/companies${suffix}`;
      return tenantId ? `${path}?${TENANT_PARAM}=${tenantId}` : path;
    },
    [tenantId],
  );

  return { tenantId, hasInvalidTenantParam, setTenantId, companiesBasePath, companyPath };
}
