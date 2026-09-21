/// <reference types="vite/client" />

declare module '*.css';

declare module '*.pdf' {
  const src: string;
  export default src;
}

declare module '*.pdf?url' {
  const src: string;
  export default src;
}
