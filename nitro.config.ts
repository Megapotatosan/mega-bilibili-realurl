import { fileURLToPath, URL } from 'node:url';
import { defineNitroConfig } from 'nitropack/config';

export default defineNitroConfig({
  compatibilityDate: '2025-04-24',
  preset: 'cloudflare_module',
  srcDir: 'server',
  alias: { '@': fileURLToPath(new URL('./', import.meta.url)) },
  cloudflare: {
    deployConfig: true,
    nodeCompat: true
  },
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
