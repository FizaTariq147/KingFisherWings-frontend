/** Portal motion CSS — staggered entrances + AutoAnimate for DOM changes. */
export const portalAnimationStyles = `
@keyframes portal-ambient-drift {
  0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
  50% { transform: translate3d(2%, -1.5%, 0) scale(1.04); }
}

@keyframes portal-page-enter {
  from {
    opacity: 0;
    transform: translateY(18px) scale(0.985);
    filter: blur(6px);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
    filter: blur(0);
  }
}

@keyframes portal-rise {
  from {
    opacity: 0;
    transform: translateY(32px) scale(0.96);
    filter: blur(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
    filter: blur(0);
  }
}

@keyframes portal-rise-left {
  from {
    opacity: 0;
    transform: translateX(-28px) scale(0.97);
    filter: blur(6px);
  }
  to {
    opacity: 1;
    transform: translateX(0) scale(1);
    filter: blur(0);
  }
}

@keyframes portal-pop {
  from {
    opacity: 0;
    transform: scale(0.88) translateY(16px);
  }
  70% {
    transform: scale(1.03) translateY(-2px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

@keyframes portal-loading-dot {
  0%, 100% { transform: scale(1); opacity: 0.35; }
  50% { transform: scale(1.4); opacity: 1; }
}

@keyframes portal-fetch-shimmer {
  from { transform: translateX(-120%); }
  to { transform: translateX(320%); }
}

@keyframes portal-stat-glow {
  0%, 100% { transform: scale(1); opacity: 0.35; }
  50% { transform: scale(1.2); opacity: 0.75; }
}

@keyframes portal-empty-float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}

@keyframes portal-login-draw {
  from { stroke-dashoffset: 420; }
  to { stroke-dashoffset: 0; }
}

@keyframes portal-login-fade {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes portal-drawer-in {
  from { transform: translateX(100%); opacity: 0.6; }
  to { transform: translateX(0); opacity: 1; }
}

@keyframes portal-backdrop-in {
  from { opacity: 0; backdrop-filter: blur(0); }
  to { opacity: 1; backdrop-filter: blur(2px); }
}

@keyframes portal-nav-in {
  from { opacity: 0; transform: translateX(-12px); }
  to { opacity: 1; transform: translateX(0); }
}

@keyframes spotlight {
  0% {
    opacity: 0;
    transform: translate(-72%, -62%) scale(0.5);
  }
  100% {
    opacity: 1;
    transform: translate(-50%, -40%) scale(1);
  }
}

.animate-spotlight {
  animation: spotlight 2s ease 0.75s 1 forwards;
}

.portal-shell-ambient {
  animation: portal-ambient-drift 16s ease-in-out infinite;
}

.portal-page-enter {
  animation: portal-page-enter 480ms cubic-bezier(0.22, 1, 0.36, 1) both;
}

/* Direct page sections cascade in */
.portal-js-motion > * {
  animation: portal-rise 520ms cubic-bezier(0.22, 1, 0.36, 1) both;
}
.portal-js-motion > *:nth-child(1) { animation-delay: 40ms; }
.portal-js-motion > *:nth-child(2) { animation-delay: 100ms; }
.portal-js-motion > *:nth-child(3) { animation-delay: 160ms; }
.portal-js-motion > *:nth-child(4) { animation-delay: 220ms; }
.portal-js-motion > *:nth-child(5) { animation-delay: 280ms; }
.portal-js-motion > *:nth-child(6) { animation-delay: 340ms; }
.portal-js-motion > *:nth-child(7) { animation-delay: 400ms; }
.portal-js-motion > *:nth-child(8) { animation-delay: 460ms; }
.portal-js-motion > *:nth-child(n+9) { animation-delay: 500ms; }

/* List / grid rows cascade */
.portal-list-stagger > * {
  animation: portal-rise-left 480ms cubic-bezier(0.22, 1, 0.36, 1) both;
}
.portal-list-stagger > *:nth-child(1) { animation-delay: 60ms; }
.portal-list-stagger > *:nth-child(2) { animation-delay: 110ms; }
.portal-list-stagger > *:nth-child(3) { animation-delay: 160ms; }
.portal-list-stagger > *:nth-child(4) { animation-delay: 210ms; }
.portal-list-stagger > *:nth-child(5) { animation-delay: 260ms; }
.portal-list-stagger > *:nth-child(6) { animation-delay: 310ms; }
.portal-list-stagger > *:nth-child(7) { animation-delay: 360ms; }
.portal-list-stagger > *:nth-child(8) { animation-delay: 410ms; }
.portal-list-stagger > *:nth-child(9) { animation-delay: 460ms; }
.portal-list-stagger > *:nth-child(10) { animation-delay: 510ms; }
.portal-list-stagger > *:nth-child(n+11) { animation-delay: 540ms; }

.portal-grid-stagger > * {
  animation: portal-pop 520ms cubic-bezier(0.34, 1.4, 0.64, 1) both;
}
.portal-grid-stagger > *:nth-child(1) { animation-delay: 80ms; }
.portal-grid-stagger > *:nth-child(2) { animation-delay: 140ms; }
.portal-grid-stagger > *:nth-child(3) { animation-delay: 200ms; }
.portal-grid-stagger > *:nth-child(4) { animation-delay: 260ms; }
.portal-grid-stagger > *:nth-child(5) { animation-delay: 320ms; }
.portal-grid-stagger > *:nth-child(6) { animation-delay: 380ms; }
.portal-grid-stagger > *:nth-child(n+7) { animation-delay: 420ms; }

.portal-list-row {
  transition: transform 220ms cubic-bezier(0.22, 1, 0.36, 1), background-color 180ms ease;
}
.portal-list-row:hover {
  transform: translateX(6px);
}

.portal-nav-stagger > * {
  animation: portal-nav-in 360ms cubic-bezier(0.22, 1, 0.36, 1) both;
}
.portal-nav-stagger > *:nth-child(1) { animation-delay: 40ms; }
.portal-nav-stagger > *:nth-child(2) { animation-delay: 70ms; }
.portal-nav-stagger > *:nth-child(3) { animation-delay: 100ms; }
.portal-nav-stagger > *:nth-child(4) { animation-delay: 130ms; }
.portal-nav-stagger > *:nth-child(5) { animation-delay: 160ms; }
.portal-nav-stagger > *:nth-child(6) { animation-delay: 190ms; }
.portal-nav-stagger > *:nth-child(7) { animation-delay: 220ms; }
.portal-nav-stagger > *:nth-child(8) { animation-delay: 250ms; }
.portal-nav-stagger > *:nth-child(9) { animation-delay: 280ms; }
.portal-nav-stagger > *:nth-child(10) { animation-delay: 310ms; }
.portal-nav-stagger > *:nth-child(11) { animation-delay: 340ms; }
.portal-nav-stagger > *:nth-child(12) { animation-delay: 370ms; }
.portal-nav-stagger > *:nth-child(13) { animation-delay: 400ms; }
.portal-nav-stagger > *:nth-child(14) { animation-delay: 430ms; }
.portal-nav-stagger > *:nth-child(15) { animation-delay: 460ms; }
.portal-nav-stagger > *:nth-child(n+16) { animation-delay: 480ms; }

.portal-loading-dots span:nth-child(1) { animation: portal-loading-dot 0.85s ease-in-out infinite; }
.portal-loading-dots span:nth-child(2) { animation: portal-loading-dot 0.85s ease-in-out 0.14s infinite; }
.portal-loading-dots span:nth-child(3) { animation: portal-loading-dot 0.85s ease-in-out 0.28s infinite; }

.portal-fetch-bar-shimmer {
  animation: portal-fetch-shimmer 1.1s ease-in-out infinite;
}

.portal-stat-glow {
  animation: portal-stat-glow 3.5s ease-in-out infinite;
}

.portal-empty-icon {
  animation: portal-empty-float 2.2s ease-in-out infinite;
}

.portal-login-route {
  stroke-dasharray: 420;
  animation: portal-login-draw 2.4s ease-out 0.35s both;
}

.portal-login-grid {
  background-image:
    linear-gradient(to right, color-mix(in srgb, white 8%, transparent) 1px, transparent 1px),
    linear-gradient(to bottom, color-mix(in srgb, white 8%, transparent) 1px, transparent 1px);
  background-size: 48px 48px;
  mask-image: radial-gradient(ellipse 80% 70% at 30% 40%, black 20%, transparent 75%);
  animation: portal-login-fade 1.2s ease both;
}

.portal-login-pulse {
  animation: portal-login-fade 2.8s ease-in-out infinite alternate;
}

.portal-login-brand > * {
  animation: portal-rise 560ms cubic-bezier(0.22, 1, 0.36, 1) both;
}
.portal-login-brand > *:nth-child(1) { animation-delay: 80ms; }
.portal-login-brand > *:nth-child(2) { animation-delay: 160ms; }
.portal-login-brand > *:nth-child(3) { animation-delay: 240ms; }
.portal-login-brand > *:nth-child(4) { animation-delay: 320ms; }

.portal-login-form > * {
  animation: portal-rise 480ms cubic-bezier(0.22, 1, 0.36, 1) both;
}
.portal-login-form > *:nth-child(1) { animation-delay: 120ms; }
.portal-login-form > *:nth-child(2) { animation-delay: 180ms; }
.portal-login-form > *:nth-child(3) { animation-delay: 240ms; }
.portal-login-form > *:nth-child(4) { animation-delay: 300ms; }
.portal-login-form > *:nth-child(5) { animation-delay: 360ms; }
.portal-login-form form > * {
  animation: portal-rise 420ms cubic-bezier(0.22, 1, 0.36, 1) both;
}
.portal-login-form form > *:nth-child(1) { animation-delay: 200ms; }
.portal-login-form form > *:nth-child(2) { animation-delay: 260ms; }
.portal-login-form form > *:nth-child(3) { animation-delay: 320ms; }
.portal-login-form form > *:nth-child(4) { animation-delay: 380ms; }
.portal-login-form form > *:nth-child(5) { animation-delay: 440ms; }

.portal-mobile-drawer {
  animation: portal-drawer-in 360ms cubic-bezier(0.22, 1, 0.36, 1) both;
}

.portal-mobile-backdrop {
  animation: portal-backdrop-in 260ms ease both;
}

@media (prefers-reduced-motion: reduce) {
  .portal-shell-ambient,
  .portal-page-enter,
  .portal-js-motion > *,
  .portal-list-stagger > *,
  .portal-grid-stagger > *,
  .portal-nav-stagger > *,
  .portal-loading-dots span,
  .portal-fetch-bar-shimmer,
  .portal-stat-glow,
  .portal-empty-icon,
  .portal-login-route,
  .portal-login-grid,
  .portal-login-pulse,
  .portal-login-brand > *,
  .portal-login-form > *,
  .portal-login-form form > *,
  .portal-mobile-drawer,
  .portal-mobile-backdrop,
  .portal-motion-surface,
  .portal-list-row,
  .animate-spotlight {
    animation: none !important;
    transition: none !important;
    transform: none !important;
    filter: none !important;
    stroke-dashoffset: 0 !important;
    opacity: 1 !important;
  }
}
`;
