import { cloneElement, isValidElement, type ReactElement } from 'react';
import { useOutlet } from 'react-router-dom';
import { cn } from '@/lib/utils';

/**
 * Ensures the active portal page root has `portal-js-motion`
 * so CSS stagger runs on every route enter (first paint).
 * List/grid AutoAnimate handles subsequent DOM changes.
 */
export function PortalPageOutlet() {
  const outlet = useOutlet();

  if (!outlet || !isValidElement(outlet)) {
    return outlet;
  }

  const page = outlet as ReactElement<{ className?: string }>;
  const className = typeof page.props.className === 'string' ? page.props.className : '';

  if (className.includes('portal-js-motion')) {
    return outlet;
  }

  return cloneElement(page, {
    className: cn(page.props.className, 'portal-js-motion'),
  });
}
