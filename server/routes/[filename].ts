import {
  eventHandler,
  handleCors,
  getRequestHeader,
  sendNoContent,
  send
} from 'h3';
import { getSessdata } from '../config';
import { vid2bv } from '../bilibili/utils';
import { video_info, video_url } from '../bilibili/video';
import { proxyBilibiliMedia } from '../bilibili/media-proxy';

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
      return proxyBilibiliMedia(url, getRequestHeader(event, 'range'));
    }
    default:
      return sendNoContent(event, 404);
  }
});
