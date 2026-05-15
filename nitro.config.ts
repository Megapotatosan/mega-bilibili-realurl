import { fileURLToPath, URL } from 'node:url';
import { defineNitroConfig } from 'nitropack/config';

export default defineNitroConfig({
  compatibilityDate: '2025-04-24',
  srcDir: 'server',
  alias: { '@': fileURLToPath(new URL('./', import.meta.url)) },
  runtimeConfig: {
    sessdata: process.env.SESSDATA ?? ''
  },
  typescript: {
    generateRuntimeConfigTypes: false,
    generateTsConfig: false
  },
  esbuild: {
    options: { target: 'es2020' }
  }
});
