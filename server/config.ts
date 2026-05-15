import type { H3Event } from 'h3';
import { useRuntimeConfig } from 'nitropack/runtime';

type CloudflareRuntime = {
  env?: {
    NITRO_SESSDATA?: string;
    SESSDATA?: string;
  };
};

export function getSessdata(event?: H3Event) {
  const runtimeConfig = useRuntimeConfig(event);
  const cloudflare = event?.node.req.runtime?.cloudflare as
    | CloudflareRuntime
    | undefined;

  return (
    cloudflare?.env?.NITRO_SESSDATA ??
    cloudflare?.env?.SESSDATA ??
    runtimeConfig.sessdata ??
    ''
  );
}
