import { appAnimationStyles } from './appAnimationStyles';

/** Injects ERP motion CSS once into the document. */
export function AppMotionStyles() {
  return <style data-app-motion>{appAnimationStyles}</style>;
}
