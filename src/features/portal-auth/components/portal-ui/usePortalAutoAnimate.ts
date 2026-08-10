import { useAutoAnimate } from '@formkit/auto-animate/react';
import type { AutoAnimateOptions, AutoAnimationPlugin } from '@formkit/auto-animate';
import { portalAutoAnimatePlugin } from './portalAutoAnimatePlugin';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';

type PortalAutoAnimateConfig =
  | Partial<AutoAnimateOptions>
  | AutoAnimationPlugin
  | undefined;

/** Portal AutoAnimate — custom expressive plugin, disabled when reduced motion. */
export function usePortalAutoAnimate(options?: PortalAutoAnimateConfig) {
  const reduceMotion = usePrefersReducedMotion();

  const config: PortalAutoAnimateConfig = reduceMotion
    ? { duration: 0 }
    : options ?? portalAutoAnimatePlugin;

  return useAutoAnimate(config as never);
}
