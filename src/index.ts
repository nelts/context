import * as util from 'util';
import * as Keygrip from 'keygrip';
import * as Cookies from 'cookies';
import { IncomingMessage, ServerResponse } from "http";
import { EventEmitter } from '@nelts/utils';
import Request from './request';
import Response, { fieldObjectSchema, fieldValueSchema } from './response';
import { Logger } from 'log4js';

export type RequestParamsSchema = { [schema: string]: string };

export interface ContextError extends Error {
  status?: number;
  code?: number;
  expose?: boolean;
}

export interface ContextOptions {
  cookie?: string[] | Keygrip, 
  logger?: Logger,
}

export default class Context<APP, BODY = any, FILE = any> extends EventEmitter {
  public readonly app: APP;
  public readonly req: IncomingMessage;
  public readonly res: ServerResponse;
  public readonly cookies: Cookies;
  public readonly request: Request<APP, this, BODY, FILE>;
  public readonly response: Response<APP, this, BODY, FILE>;
  public readonly logger: Logger;
  public params: RequestParamsSchema;
  public silent: boolean;
  public respond: boolean;
  constructor(app: APP, req: IncomingMessage, res: ServerResponse, { cookie, logger }: ContextOptions) {
    super();
    this.app = app;
    this.req = req;
    this.res = res;
    this.logger = logger;
    if (cookie) {
      this.cookies = new Cookies(this.req, this.res, {
        keys: cookie || ['nelts', 'context'],
        secure: this.request.secure,
      });
    }
  }

  setParams(value: RequestParamsSchema) {
    Object.defineProperty(this, 'params', {
      get() {
        return Object.freeze(value);
      }
    });
    return this;
  }

  get query() {
    return this.request.query;
  }

  get header() {
    return this.request.header;
  }

  get headers() {
    return this.request.headers;
  }

  get accept() {
    return this.request.accept;
  }

  get url() {
    return this.request.url;
  }

  get ip() {
    return this.request.ip;
  }

  get body() {
    return this.response.body;
  }

  set body(value: any) {
    this.response.body = value;
  }

  get status() {
    return this.response.status;
  }

  set status(value: number) {
    this.response.status = value;
  }

  get method() {
    return this.req.method;
  }

  get length() {
    return this.response.length;
  }

  set length(value: number) {
    this.response.length = value;
  }

  get message() {
    return this.response.message;
  }

  set message(value: any) {
    this.response.message = value;
  }

  get type() {
    return this.response.type;
  }

  set type(value: string) {
    this.response.type = value;
  }

  set lastModified(val: string | Date | number) {
    this.response.lastModified = val;
  }

  get lastModified() {
    return this.response.lastModified;
  }

  set etag(val: string) {
    this.response.etag = val;
  }

  get etag() {
    return this.response.etag;
  }

  get headerSent() {
    return this.response.headerSent;
  }

  set(field: string | fieldObjectSchema, val?: fieldValueSchema) {
    this.response.set(field, val);
  }

  get(field: string) {
    return this.request.get(field);
  }

  error(message: ContextError | string, code?: number) {
    const error: ContextError = typeof message === 'string' ? new Error(message) : message;
    error.status = code || 500;
    return error;
  }

  throw(message: Error | string, code?: number) {
    throw this.error(message, code);
  }

  onerror(err: ContextError) {
    if (!(err instanceof Error)) throw new TypeError(util.format('non-error thrown: %j', err));

    if (404 == err.status || err.expose) return;
    if (this.silent) return;

    const msg = err.stack || err.toString();
    if (this.logger) {
      this.logger.error('');
      this.logger.error(msg.replace(/^/gm, '  '));
      this.logger.error('');
    }
  }

  redirect(url: string, alt?: string) {
    this.response.redirect(url, alt);
  }

  attachment(filename: string, options: any) {
    this.response.attachment(filename, options);
  }

  is(types: string | string[]) {
    return this.response.is(types);
  }

  append(field: string, val: any) {
    return this.response.append(field, val);
  }

  flushHeaders() {
    return this.response.flushHeaders();
  }

  remove(value: string) {
    return this.response.remove(value);
  }
}