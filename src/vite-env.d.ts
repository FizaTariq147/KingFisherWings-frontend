/// <reference types="vite/client" />

import 'axios';

declare module 'axios' {
  export interface AxiosRequestConfig {
    /** When true, response interceptor skips the global error toast. */
    skipErrorToast?: boolean;
  }
}

declare module '*.css';

declare module '*.pdf' {
  const src: string;
  export default src;
}

declare module '*.pdf?url' {
  const src: string;
  export default src;
}
