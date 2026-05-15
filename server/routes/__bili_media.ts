import { eventHandler, getQuery, getRequestHeader } from 'h3';
import { proxyBilibiliMedia } from '../bilibili/media-proxy';

export default eventHandler(event => {
  const url = getQuery(event).url;
  if (typeof url !== 'string' || url === '') {
    return Response.json({ error: 'Missing media URL' }, { status: 400 });
  }

  return proxyBilibiliMedia(url, getRequestHeader(event, 'range'));
});
