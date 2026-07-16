import { Navigate, useLocation, useParams } from 'react-router-dom';

/** Old Masters URLs → Quotations Online Tariff Master. */
export default function RedirectMastersTariffsToQuotations() {
  const location = useLocation();
  const { id } = useParams();
  const path = location.pathname;

  if (path.endsWith('/new')) {
    return <Navigate to="/quotations/tariff-master/new" replace />;
  }
  if (id && path.endsWith('/edit')) {
    return <Navigate to={`/quotations/tariff-master/${id}/edit`} replace />;
  }
  if (id) {
    return <Navigate to={`/quotations/tariff-master/${id}`} replace />;
  }
  return <Navigate to="/quotations/tariff-master" replace />;
}
