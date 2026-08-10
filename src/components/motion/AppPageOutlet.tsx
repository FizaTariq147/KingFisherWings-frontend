import { cloneElement, isValidElement, type ReactElement } from 'react';
import { useOutlet } from 'react-router-dom';
import { cn } from '@/lib/utils';

/** Adds `app-js-motion` to the active page root for CSS stagger on route enter. */
export function AppPageOutlet() {
  const outlet = useOutlet();

  if (!outlet || !isValidElement(outlet)) {
    return outlet;
  }

  const page = outlet as ReactElement<{ className?: string }>;
  const className = typeof page.props.className === 'string' ? page.props.className : '';

  if (className.includes('app-js-motion')) {
    return outlet;
  }

  return cloneElement(page, {
    className: cn(page.props.className, 'app-js-motion'),
  });
}
