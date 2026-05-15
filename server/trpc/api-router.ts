import { publicProcedure, router } from './trpc';
import { z } from 'zod';
import { video_info } from '../bilibili/video';
import { vid2bv } from '../bilibili/utils';
import { getSessdata } from '../config';

export const appRouter = router({
  getVideoInfo: publicProcedure
    .input(
      z.object({
        id: z.string()
      })
    )
    .query(async opts => {
      const { input } = opts;
      const sessdata = getSessdata(opts.ctx.event);
      const bvid = vid2bv(input.id);
      return video_info(bvid, sessdata);
    })
});

export type AppRouter = typeof appRouter;
