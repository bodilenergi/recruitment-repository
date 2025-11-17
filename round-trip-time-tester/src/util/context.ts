import { Context } from '@src/types';

type ResponseBody = string | Record<string, any>;

type WritableContext = Pick<Context, 'status' | 'body'>;

export const writeContextResponse = (ctx: WritableContext, status: number, body: ResponseBody) => {
  ctx.status = status;
  ctx.body = body;
};

export const writeContextError = (ctx: WritableContext, status: number, message: string) => {
  ctx.status = status;
  ctx.body = { error: message };
};
