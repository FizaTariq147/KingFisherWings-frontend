import { Navigate, useLocation, useParams } from 'react-router-dom';

/** Old Masters URLs → Quotations Zip Distance Master. */
export default function RedirectMastersZipDistancesToQuotations() {
  const location = useLocation();
  const { id } = useParams();
  const path = location.pathname;

  if (path.endsWith('/new')) {
    return <Navigate to="/quotations/zip-distance-master/new" replace />;
  }
  if (id && path.endsWith('/edit')) {
    return <Navigate to={`/quotations/zip-distance-master/${id}/edit`} replace />;
  }
  if (id) {
    return <Navigate to={`/quotations/zip-distance-master/${id}`} replace />;
  }
  return <Navigate to="/quotations/zip-distance-master" replace />;
}
