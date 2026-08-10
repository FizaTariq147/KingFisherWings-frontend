import { useAutoAnimate } from '@formkit/auto-animate/react';
import type { AutoAnimateOptions, AutoAnimationPlugin } from '@formkit/auto-animate';
import { appAutoAnimatePlugin } from './autoAnimatePlugin';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';

type AppAutoAnimateConfig =
  | Partial<AutoAnimateOptions>
  | AutoAnimationPlugin
  | undefined;

export function useAppAutoAnimate(options?: AppAutoAnimateConfig) {
  const reduceMotion = usePrefersReducedMotion();

  const config: AppAutoAnimateConfig = reduceMotion
    ? { duration: 0 }
    : options ?? appAutoAnimatePlugin;

  return useAutoAnimate(config as never);
}
