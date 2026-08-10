/** ERP motion CSS — page enter, staggered sections, lists, grids, nav. */
export const appAnimationStyles = `
@keyframes app-spotlight {
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
  animation: app-spotlight 2s ease 0.75s 1 forwards;
}

@keyframes app-loading-dot {
  0%, 100% { transform: scale(1); opacity: 0.35; }
  50% { transform: scale(1.4); opacity: 1; }
}

@keyframes app-fetch-shimmer {
  from { transform: translateX(-120%); }
  to { transform: translateX(320%); }
}

@keyframes app-page-enter {
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

@keyframes app-rise {
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

@keyframes app-rise-left {
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

@keyframes app-pop {
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

@keyframes app-nav-in {
  from { opacity: 0; transform: translateX(-12px); }
  to { opacity: 1; transform: translateX(0); }
}

@keyframes app-drawer-in {
  from { transform: translateX(-100%); opacity: 0.6; }
  to { transform: translateX(0); opacity: 1; }
}

@keyframes app-backdrop-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes app-loading-dot {
  0%, 100% { transform: scale(1); opacity: 0.35; }
  50% { transform: scale(1.4); opacity: 1; }
}

.app-page-enter {
  animation: app-page-enter 480ms cubic-bezier(0.22, 1, 0.36, 1) both;
}

.app-js-motion > * {
  animation: app-rise 520ms cubic-bezier(0.22, 1, 0.36, 1) both;
}
.app-js-motion > *:nth-child(1) { animation-delay: 40ms; }
.app-js-motion > *:nth-child(2) { animation-delay: 100ms; }
.app-js-motion > *:nth-child(3) { animation-delay: 160ms; }
.app-js-motion > *:nth-child(4) { animation-delay: 220ms; }
.app-js-motion > *:nth-child(5) { animation-delay: 280ms; }
.app-js-motion > *:nth-child(6) { animation-delay: 340ms; }
.app-js-motion > *:nth-child(7) { animation-delay: 400ms; }
.app-js-motion > *:nth-child(8) { animation-delay: 460ms; }
.app-js-motion > *:nth-child(n+9) { animation-delay: 500ms; }

.app-list-stagger > * {
  animation: app-rise-left 480ms cubic-bezier(0.22, 1, 0.36, 1) both;
}
.app-list-stagger > *:nth-child(1) { animation-delay: 60ms; }
.app-list-stagger > *:nth-child(2) { animation-delay: 110ms; }
.app-list-stagger > *:nth-child(3) { animation-delay: 160ms; }
.app-list-stagger > *:nth-child(4) { animation-delay: 210ms; }
.app-list-stagger > *:nth-child(5) { animation-delay: 260ms; }
.app-list-stagger > *:nth-child(6) { animation-delay: 310ms; }
.app-list-stagger > *:nth-child(7) { animation-delay: 360ms; }
.app-list-stagger > *:nth-child(8) { animation-delay: 410ms; }
.app-list-stagger > *:nth-child(9) { animation-delay: 460ms; }
.app-list-stagger > *:nth-child(10) { animation-delay: 510ms; }
.app-list-stagger > *:nth-child(n+11) { animation-delay: 540ms; }

.app-grid-stagger > * {
  animation: app-pop 520ms cubic-bezier(0.34, 1.4, 0.64, 1) both;
}
.app-grid-stagger > *:nth-child(1) { animation-delay: 80ms; }
.app-grid-stagger > *:nth-child(2) { animation-delay: 140ms; }
.app-grid-stagger > *:nth-child(3) { animation-delay: 200ms; }
.app-grid-stagger > *:nth-child(4) { animation-delay: 260ms; }
.app-grid-stagger > *:nth-child(5) { animation-delay: 320ms; }
.app-grid-stagger > *:nth-child(6) { animation-delay: 380ms; }
.app-grid-stagger > *:nth-child(n+7) { animation-delay: 420ms; }

.app-nav-stagger > * {
  animation: app-nav-in 360ms cubic-bezier(0.22, 1, 0.36, 1) both;
}
.app-nav-stagger > *:nth-child(1) { animation-delay: 40ms; }
.app-nav-stagger > *:nth-child(2) { animation-delay: 70ms; }
.app-nav-stagger > *:nth-child(3) { animation-delay: 100ms; }
.app-nav-stagger > *:nth-child(4) { animation-delay: 130ms; }
.app-nav-stagger > *:nth-child(5) { animation-delay: 160ms; }
.app-nav-stagger > *:nth-child(6) { animation-delay: 190ms; }
.app-nav-stagger > *:nth-child(7) { animation-delay: 220ms; }
.app-nav-stagger > *:nth-child(8) { animation-delay: 250ms; }
.app-nav-stagger > *:nth-child(9) { animation-delay: 280ms; }
.app-nav-stagger > *:nth-child(10) { animation-delay: 310ms; }
.app-nav-stagger > *:nth-child(11) { animation-delay: 340ms; }
.app-nav-stagger > *:nth-child(12) { animation-delay: 370ms; }
.app-nav-stagger > *:nth-child(13) { animation-delay: 400ms; }
.app-nav-stagger > *:nth-child(14) { animation-delay: 430ms; }
.app-nav-stagger > *:nth-child(15) { animation-delay: 460ms; }
.app-nav-stagger > *:nth-child(n+16) { animation-delay: 480ms; }

.app-list-row {
  transition: transform 220ms cubic-bezier(0.22, 1, 0.36, 1), background-color 180ms ease;
}
.app-list-row:hover {
  transform: translateX(4px);
}

.app-loading-dots span:nth-child(1) { animation: app-loading-dot 0.85s ease-in-out infinite; }
.app-loading-dots span:nth-child(2) { animation: app-loading-dot 0.85s ease-in-out 0.14s infinite; }
.app-loading-dots span:nth-child(3) { animation: app-loading-dot 0.85s ease-in-out 0.28s infinite; }

.app-fetch-bar-shimmer {
  animation: app-fetch-shimmer 1.1s ease-in-out infinite;
}

.app-mobile-drawer {
  animation: app-drawer-in 360ms cubic-bezier(0.22, 1, 0.36, 1) both;
}

.app-mobile-backdrop {
  animation: app-backdrop-in 260ms ease both;
}

.app-loading-dots span:nth-child(1) { animation: app-loading-dot 0.85s ease-in-out infinite; }
.app-loading-dots span:nth-child(2) { animation: app-loading-dot 0.85s ease-in-out 0.14s infinite; }
.app-loading-dots span:nth-child(3) { animation: app-loading-dot 0.85s ease-in-out 0.28s infinite; }

.app-login-form > * {
  animation: app-rise 480ms cubic-bezier(0.22, 1, 0.36, 1) both;
}
.app-login-form > *:nth-child(1) { animation-delay: 80ms; }
.app-login-form > *:nth-child(2) { animation-delay: 140ms; }
.app-login-form > *:nth-child(3) { animation-delay: 200ms; }
.app-login-form > *:nth-child(4) { animation-delay: 260ms; }
.app-login-form > *:nth-child(5) { animation-delay: 320ms; }

@media (prefers-reduced-motion: reduce) {
  .app-page-enter,
  .app-js-motion > *,
  .app-list-stagger > *,
  .app-grid-stagger > *,
  .app-nav-stagger > *,
  .app-list-row,
  .app-mobile-drawer,
  .app-mobile-backdrop,
  .app-loading-dots span,
  .app-fetch-bar-shimmer,
  .app-login-form > *,
  .animate-spotlight {
    animation: none !important;
    transition: none !important;
    transform: none !important;
    filter: none !important;
    opacity: 1 !important;
  }
}
`;
