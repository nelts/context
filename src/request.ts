import * as url from 'url';
import * as accepts from 'accepts';
import * as typeis from 'type-is';
import { IncomingMessage } from "http";
import Context from './index';

export default class Request<M, C extends Context<M, B, F>, B = any, F = any> {
  private _ip: string;
  private _accept: accepts.Accepts;
  private _parsed: url.UrlWithParsedQuery = null;
  private _protocol: string;
  private _type: string = null;
  private _length: number = null;
  private _ips: string[] = [];
  private _host: string = null;
  private _hostname: string = null;
  public readonly ctx: C;
  public readonly req: IncomingMessage;
  public body: B;
  public files: F;
  constructor(ctx: C, req: IncomingMessage) {
    this.ctx = ctx;
    this.req = req;
  }

  private get parsed() {
    if (!this._parsed) {
      const parsed = url.parse(this.url, true);
      parsed.query = Object.freeze(parsed.query || {});
      this._parsed = parsed;
    }
    return this._parsed;
  }

  get host() {
    if (!this._host) {
      let host = this.get('X-Forwarded-Host') as string;
      if (!host) {
        if (this.req.httpVersionMajor >= 2) host = this.get(':authority') as string;
        if (!host) host = this.get('Host') as string;
      }
      if (!host) {
        this._host = '';
      } else {
        this._host = host.split(/\s*,\s*/, 1)[0];
      }
    }
    return this._host;
  }

  get hostname() {
    if (!this._hostname) {
      if (this.host === '') {
        this._hostname = '';
      } else if ('[' == this.host[0]) {
        this._hostname = url.parse(`${this.origin}${this.url}`).hostname || '';
      } else {
        this._hostname = this.host.split(':', 1)[0];
      }
    }
    return this._hostname;
  }

  get pathname() {
    return this.parsed.pathname;
  }

  get path() {
    return this.parsed.path;
  }

  get href() {
    return this.req.url;
  }

  get search() {
    return this.parsed.search;
  }

  get query() {
    return this.parsed.query;
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
    if (!this._protocol) {
      const proto = this.get('X-Forwarded-Proto') as string;
      this._protocol = proto ? proto.split(/\s*,\s*/, 1)[0] : 'http';
    }
    return this._protocol;
  }

  get url() {
    return this.req.url;
  }

  get origin() {
    return `${this.protocol}://${this.host}`;
  }

  get type() {
    if (this._type === null) {
      const type = this.get('Content-Type') as string;
      if (!type) {
        this._type = '';
      } else {
        this._type = type.split(';')[0];
      }
    }
    return this._type;
  }

  get length() {
    if (!this._length) {
      const len = this.get('Content-Length');
      if (len == '')  {
        this._length = 0;
      } else {
        this._length = ~~len;
      }
    }
    return this._length;
  }

  get secure() {
    return 'https' == this.protocol;
  }

  get ips() {
    if (!this._ips) {
      const val = this.get('X-Forwarded-For') as string;
      this._ips = val
        ? val.split(/\s*,\s*/)
        : [];
    }
    return this._ips;
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