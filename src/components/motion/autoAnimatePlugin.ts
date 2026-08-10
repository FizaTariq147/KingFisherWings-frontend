import type { AutoAnimationPlugin } from '@formkit/auto-animate';

const EASE_OUT = 'cubic-bezier(0.22, 1, 0.36, 1)';
const EASE_IN = 'cubic-bezier(0.4, 0, 1, 1)';
const EASE_BOUNCE = 'cubic-bezier(0.34, 1.56, 0.64, 1)';

type Coords = { top: number; left: number; width: number; height: number };

/** Expressive AutoAnimate plugin for ERP lists, grids, and nav. */
export const appAutoAnimatePlugin: AutoAnimationPlugin = (
  el,
  action,
  newCoords,
  oldCoords,
) => {
  const coords = newCoords as Coords | undefined;
  const prev = oldCoords as Coords | undefined;

  if (action === 'add') {
    return new KeyframeEffect(
      el,
      [
        {
          transform: 'translateY(28px) scale(0.94)',
          opacity: 0,
          filter: 'blur(8px)',
        },
        {
          transform: 'translateY(-4px) scale(1.01)',
          opacity: 1,
          filter: 'blur(0px)',
          offset: 0.72,
        },
        {
          transform: 'translateY(0) scale(1)',
          opacity: 1,
          filter: 'blur(0px)',
        },
      ],
      { duration: 520, easing: EASE_BOUNCE, fill: 'both' },
    );
  }

  if (action === 'remove') {
    return new KeyframeEffect(
      el,
      [
        {
          transform: 'translateY(0) scale(1)',
          opacity: 1,
          filter: 'blur(0px)',
        },
        {
          transform: 'translateY(-16px) scale(0.96)',
          opacity: 0,
          filter: 'blur(6px)',
        },
      ],
      { duration: 280, easing: EASE_IN, fill: 'both' },
    );
  }

  if (coords && prev) {
    const deltaX = prev.left - coords.left;
    const deltaY = prev.top - coords.top;
    const scaleX = prev.width / Math.max(coords.width, 1);
    const scaleY = prev.height / Math.max(coords.height, 1);

    return new KeyframeEffect(
      el,
      [
        {
          transformOrigin: '0 0',
          transform: `translate(${deltaX}px, ${deltaY}px) scale(${scaleX}, ${scaleY})`,
        },
        {
          transformOrigin: '0 0',
          transform: 'translate(0, 0) scale(1, 1)',
        },
      ],
      { duration: 420, easing: EASE_OUT, fill: 'both' },
    );
  }

  return new KeyframeEffect(el, [{ opacity: 1 }, { opacity: 1 }], {
    duration: 1,
  });
};
