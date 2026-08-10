import type { ReactNode } from 'react';
import { PortalPageOutlet } from './PortalPageOutlet';

/** @deprecated Use PortalPageOutlet via PortalPageTransition. Kept for compatibility. */
export function PortalAutoStagger({ children }: { children: ReactNode }) {
  return children ?? <PortalPageOutlet />;
}
