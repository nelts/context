import * as url from 'url';
import * as querystring from 'querystring';
import * as accepts from 'accepts';
import * as typeis from 'type-is';
import { IncomingMessage } from "http";
import Context from './index';

export default class Request<M, C extends Context<M, B, F>, B = any, F = any> {
  private _ip: string;
  private _accept: accepts.Accepts;
  public readonly ctx: C;
  public readonly req: IncomingMessage;
  public readonly search: string;
  public readonly query: querystring.ParsedUrlQuery;
  public readonly pathname: string;
  public readonly path: string;
  public readonly href: string;
  public readonly host: string;
  public readonly hostname: string;
  public body: B;
  public files: F;
  constructor(ctx: C, req: IncomingMessage) {
    this.ctx = ctx;
    this.req = req;
    const parsed = url.parse(this.url, true);
    this.search = parsed.search;
    this.query = Object.freeze(parsed.query || {});
    this.pathname = parsed.pathname;
    this.path = parsed.path;
    this.href = parsed.href;

    let host = this.get('X-Forwarded-Host') as string;
    if (!host) {
      if (this.req.httpVersionMajor >= 2) host = this.get(':authority') as string;
      if (!host) host = this.get('Host') as string;
    }
    if (!host) {
      this.host = '';
      this.hostname = '';
    } else {
      this.host = host.split(/\s*,\s*/, 1)[0];
      if ('[' == this.host[0]) {
        this.hostname = url.parse(`${this.origin}${this.url}`).hostname || '';
      } else {
        this.hostname = host.split(':', 1)[0];
      }
    }
  }

  get accept() {
    return this._accept || (this._accept = accepts(this.req));
  }

  get res() {
    return this.ctx.res;
  }

  get app() {
    return this.ctx.app;
  }

  get response() {
    return this.ctx.response;
  }

  get protocol() {
    const proto = this.get('X-Forwarded-Proto') as string;
    return proto ? proto.split(/\s*,\s*/, 1)[0] : 'http';
  }

  get url() {
    return this.req.url;
  }

  get origin() {
    return `${this.protocol}://${this.host}`;
  }

  get type() {
    const type = this.get('Content-Type') as string;
    if (!type) return '';
    return type.split(';')[0];
  }

  get length() {
    const len = this.get('Content-Length');
    if (len == '') return;
    return ~~len;
  }

  get secure() {
    return 'https' == this.protocol;
  }

  get ips() {
    // const proxy = this.app.proxy;
    const val = this.get('X-Forwarded-For') as string;
    return val
      ? val.split(/\s*,\s*/)
      : [];
  }

  get ip() {
    if (!this._ip) {
      this._ip = this.ips[0] || this.req.socket.remoteAddress || '';
    }
    return this._ip;
  }

  get header() {
    return this.req.headers;
  }

  get headers() {
    return this.req.headers;
  }

  accepts(...args: string[]) {
    return this.accept.types(...args);
  }

  is(types?: string) {
    if (!types) return typeis(this.req);
    if (!Array.isArray(types)) types = [].slice.call(arguments);
    return typeis(this.req, types);
  }

  get(field: string) {
    const req = this.req;
    switch (field = field.toLowerCase()) {
      case 'referer':
      case 'referrer':
        return req.headers.referrer || req.headers.referer || '';
      default:
        return req.headers[field] || '';
    }
  }
}