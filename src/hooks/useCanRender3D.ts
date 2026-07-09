import { useEffect, useState } from 'react'

function detectWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas')
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    )
  } catch {
    return false
  }
}

export function useCanRender3D(): boolean {
  const [canRender, setCanRender] = useState(false)

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches
    setCanRender(!prefersReducedMotion && detectWebGL())
  }, [])

  return canRender
}