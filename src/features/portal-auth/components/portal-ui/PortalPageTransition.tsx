import { useLocation } from 'react-router-dom';
import { PortalPageOutlet } from './PortalPageOutlet';

/** Route wrapper — page enter CSS + AutoAnimate on page sections. */
export function PortalPageTransition() {
  const location = useLocation();

  return (
    <div key={location.pathname} className="portal-page-root portal-page-enter">
      <PortalPageOutlet />
    </div>
  );
}
