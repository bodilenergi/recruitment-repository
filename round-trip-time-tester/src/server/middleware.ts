import { Server } from '@src/types';
import cors from '@koa/cors';

export const useMiddleware = (server: Server) => {
  server.use(cors());
};
