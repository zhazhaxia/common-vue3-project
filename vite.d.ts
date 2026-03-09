/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

interface ImportMetaEnv {
  readonly PROJECT_NAME: string
  readonly ENV_TYPE: string
  readonly VITE_APP_TITLE: string
  readonly VITE_APP_ENV: string
  readonly VITE_APP_API_BASE_URL: string
  readonly VITE_APP_APP_ID: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
