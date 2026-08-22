import type { RefObject } from 'react';

export async function toggleTableFullscreen(target: RefObject<HTMLElement | null>): Promise<void> {
  if (document.fullscreenElement) {
    await document.exitFullscreen();
    return;
  }
  await target.current?.requestFullscreen();
}
