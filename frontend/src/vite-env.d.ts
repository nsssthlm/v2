/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  // Du kan lägga till fler här:
  // readonly VITE_ANOTHER_ENV?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
