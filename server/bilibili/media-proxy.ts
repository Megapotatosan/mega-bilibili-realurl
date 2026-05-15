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
