import { Context as KoaContext } from 'koa';
import { Adapters } from './adapters';

export type Context = KoaContext & {
  adapters: Adapters;
};
