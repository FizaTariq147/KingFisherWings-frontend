import { useLocation } from 'react-router-dom';
import { AppPageOutlet } from './AppPageOutlet';

/** Route wrapper — page enter CSS + stagger on page sections. */
export function AppPageTransition() {
  const location = useLocation();

  return (
    <div key={location.pathname} className="app-page-root app-page-enter">
      <AppPageOutlet />
    </div>
  );
}
