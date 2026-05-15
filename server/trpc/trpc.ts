import { initTRPC } from '@trpc/server';
import type { H3Event } from 'h3';

export type TrpcContext = {
  event: H3Event;
};

const t = initTRPC.context<TrpcContext>().create();
export const router = t.router;
export const publicProcedure = t.procedure;
