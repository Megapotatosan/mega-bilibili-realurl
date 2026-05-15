import { eventHandler, toWebRequest } from 'h3';
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from '../../trpc/api-router';

export default eventHandler(event => {
  return fetchRequestHandler({
    endpoint: '/rpc',
    req: toWebRequest(event),
    router: appRouter,
    createContext: async () => ({ event })
  });
});
