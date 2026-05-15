import {
  eventHandler,
  handleCors,
  getRequestHeader,
  sendRedirect,
  sendNoContent,
  send
} from 'h3';
import { getSessdata } from '../config';
import { vid2bv } from '../bilibili/utils';
import { video_info, video_url } from '../bilibili/video';
import { room_play_url } from '../bilibili/live';

const BROWSER_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36';

async function proxyMedia(url: string, range?: string) {
  const headers: Record<string, string> = {
    Accept: '*/*',
    Referer: 'https://www.bilibili.com/',
    'User-Agent': BROWSER_UA
  };
  if (range) headers.Range = range;

  const upstream = await fetch(url, { headers });
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

export default eventHandler(async event => {
  if (
    handleCors(event, {
      origin: '*',
      methods: ['GET'],
      preflight: { statusCode: 204 }
    })
  )
    return;

  const [id, ext] = event.context.params!.filename.split('.');
  const sessdata = getSessdata(event);
  const searchParams = new URL(event.node.req.url!, 'http://localhost')
    .searchParams;
  switch (ext) {
    case 'mp4': {
      const bvid = vid2bv(id);
      let page = parseInt(searchParams.get('p') ?? '1');
      if (Number.isNaN(page) || page < 1) page = 1;
      const info = await video_info(bvid, sessdata);
      if (info.code !== 0)
        return send(event, { error: info.message }, 'application/json');
      const selectedPage = info.data.pages[page - 1];
      if (!selectedPage) return sendNoContent(event, 404);
      const url = await video_url(bvid, selectedPage.cid, sessdata);
      return proxyMedia(url, getRequestHeader(event, 'range'));
    }
    case 'm3u8': {
      const room_id = parseInt(id);
      if (Number.isNaN(room_id))
        return send(event, { error: 'Invalid ID' }, 'application/json');
      const url = await room_play_url(room_id, sessdata);
      if (!url) return sendNoContent(event, 404);
      return sendRedirect(event, url, 302);
    }
    default:
      return sendNoContent(event, 404);
  }
});
