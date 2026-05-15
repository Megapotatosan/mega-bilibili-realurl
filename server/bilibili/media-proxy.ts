const BROWSER_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36';

const ALLOWED_MEDIA_HOSTS = [
  'bilivideo.com',
  'bilivideo.cn',
  'hdslb.com',
  'akamaized.net'
];

function isAllowedMediaUrl(url: URL) {
  return ALLOWED_MEDIA_HOSTS.some(
    host => url.hostname === host || url.hostname.endsWith(`.${host}`)
  );
}

function proxiedMediaPath(url: string) {
  return `/__bili_media?url=${encodeURIComponent(url)}`;
}

function rewritePlaylistUri(uri: string, baseUrl: string) {
  const resolved = new URL(uri, baseUrl);
  return proxiedMediaPath(resolved.toString());
}

function rewritePlaylist(text: string, baseUrl: string) {
  return text
    .split('\n')
    .map(line => {
      const trimmed = line.trim();
      if (trimmed === '') return line;

      if (trimmed.startsWith('#')) {
        return line.replace(/URI="([^"]+)"/g, (_, uri: string) => {
          return `URI="${rewritePlaylistUri(uri, baseUrl)}"`;
        });
      }

      return rewritePlaylistUri(trimmed, baseUrl);
    })
    .join('\n');
}

function isPlaylist(url: URL, contentType: string) {
  return (
    url.pathname.endsWith('.m3u8') ||
    contentType.includes('mpegurl') ||
    contentType.includes('application/vnd.apple.mpegurl')
  );
}

export async function proxyBilibiliMedia(url: string, range?: string) {
  const upstreamUrl = new URL(url);
  if (!isAllowedMediaUrl(upstreamUrl)) {
    return Response.json({ error: 'Unsupported media host' }, { status: 400 });
  }

  const headers: Record<string, string> = {
    Accept: '*/*',
    Referer: 'https://www.bilibili.com/',
    'User-Agent': BROWSER_UA
  };
  if (range) headers.Range = range;

  const upstream = await fetch(upstreamUrl, { headers });
  const contentType = upstream.headers.get('content-type') ?? '';

  if (isPlaylist(upstreamUrl, contentType)) {
    const text = await upstream.text();
    const responseHeaders = new Headers({
      'Access-Control-Allow-Origin': '*',
      'Cache-Control':
        upstream.headers.get('cache-control') ?? 'no-store, max-age=0',
      'Content-Type': 'application/vnd.apple.mpegurl; charset=utf-8'
    });

    return new Response(rewritePlaylist(text, upstreamUrl.toString()), {
      status: upstream.status,
      statusText: upstream.statusText,
      headers: responseHeaders
    });
  }

  const responseHeaders = new Headers();
  for (const header of [
    'accept-ranges',
    'cache-control',
    'content-length',
    'content-range',
    'content-type',
    'etag',
    'last-modified'
  ]) {
    const value = upstream.headers.get(header);
    if (value) responseHeaders.set(header, value);
  }

  responseHeaders.set('Access-Control-Allow-Origin', '*');
  responseHeaders.set('Cross-Origin-Resource-Policy', 'cross-origin');

  return new Response(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: responseHeaders
  });
}
