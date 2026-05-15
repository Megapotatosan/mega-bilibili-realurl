import { fileURLToPath, URL } from 'node:url';
import { defineNitroConfig } from 'nitropack/config';

const preset = process.env.NITRO_PRESET ?? 'cloudflare_module';

export default defineNitroConfig({
  compatibilityDate: '2025-04-24',
  preset,
  srcDir: 'server',
  alias: { '@': fileURLToPath(new URL('./', import.meta.url)) },
  cloudflare: {
    deployConfig: true,
    nodeCompat: true,
    wrangler: {
      name: 'mega-bilibili-realurl'
    }
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
