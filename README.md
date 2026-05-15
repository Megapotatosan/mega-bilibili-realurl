# Bilibili Real URL

![GitHub last commit](https://img.shields.io/github/last-commit/gizmo-ds/bilibili-real-url/main)
![GitHub License](https://img.shields.io/github/license/gizmo-ds/bilibili-real-url?style=flat&label=License)

Bilibili Real URL is a small web utility that resolves Bilibili video and live room pages into playable MP4 or M3U8 stream URLs. It is useful when you need a direct playback link for external players, automation, or VRChat video players.

The app includes a Vue frontend and a Nitro server that proxies the Bilibili API calls needed to fetch video, page, live room, and stream metadata.

## Features

- Parse Bilibili video URLs, including BV and AV identifiers.
- Parse Bilibili list URLs and choose a specific page or episode.
- Parse Bilibili live room URLs and return an M3U8 URL when the room is live.
- Preview generated MP4 links in the browser.
- Copy the generated playback URL with one click.
- Deploy to Vercel, Deno Deploy, Cloudflare, or any Nitro-compatible host.

## Demo

[https://bilibili-real-url.deno.dev](https://bilibili-real-url.deno.dev)

[https://bilibili-real-url.vercel.app](https://bilibili-real-url.vercel.app)

## Local Development

Install dependencies:

```bash
pnpm install
```

Run the Nitro server:

```bash
pnpm dev:nitro
```

Run the Vite frontend in another terminal:

```bash
pnpm dev:app
```

Build the frontend and server:

```bash
pnpm build
```

Preview the production server:

```bash
pnpm preview
```

## Environment

Create a `.env` file if you need authenticated Bilibili requests:

```bash
SESSDATA=
```

`SESSDATA` is optional for public videos and live rooms, but some region-limited, age-gated, or account-dependent content may require a valid Bilibili session cookie.
For deployed Nitro servers, set `NITRO_SESSDATA` as a runtime secret so it is read from the request environment.

## Deployment

[![Badge](https://img.shields.io/badge/Vercel-blue?style=flat-square&logo=vercel&logoColor=%23fff&label=Deploy%20to)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fgizmo-ds%2Fbilibili-real-url&demo-title=Demo&demo-url=https%3A%2F%2Fbilibili-real-url.vercel.app%2F)

[![Badge](https://img.shields.io/badge/Deno_Deploy-blue?style=flat-square&logo=deno&logoColor=%23fff&label=Deploy%20to)](https://nitro.build/deploy/providers/deno-deploy)

[![Badge](https://img.shields.io/badge/Cloudflare-blue?style=flat-square&logo=cloudflare&logoColor=origin&label=Deploy%20to)](https://nitro.build/deploy/providers/cloudflare)

See the [Nitro deployment documentation](https://nitro.build/deploy) for additional providers and platform-specific settings.

## License

This project is released under the GNU General Public License v3.0. See [LICENSE](LICENSE) for details.
