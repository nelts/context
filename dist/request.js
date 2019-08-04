"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const url = require("url");
const accepts = require("accepts");
const typeis = require("type-is");
class Request {
    constructor(ctx, req) {
        this.ctx = ctx;
        this.req = req;
        const parsed = url.parse(this.url, true);
        this.search = parsed.search;
        this.query = Object.freeze(parsed.query || {});
        this.pathname = parsed.pathname;
        this.path = parsed.path;
        this.href = parsed.href;
        let host = this.get('X-Forwarded-Host');
        if (!host) {
            if (this.req.httpVersionMajor >= 2)
                host = this.get(':authority');
            if (!host)
                host = this.get('Host');
        }
        if (!host) {
            this.host = '';
            this.hostname = '';
        }
        else {
            this.host = host.split(/\s*,\s*/, 1)[0];
            if ('[' == this.host[0]) {
                this.hostname = url.parse(`${this.origin}${this.url}`).hostname || '';
            }
            else {
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
        const proto = this.get('X-Forwarded-Proto');
        return proto ? proto.split(/\s*,\s*/, 1)[0] : 'http';
    }
    get url() {
        return this.req.url;
    }
    get origin() {
        return `${this.protocol}://${this.host}`;
    }
    get type() {
        const type = this.get('Content-Type');
        if (!type)
            return '';
        return type.split(';')[0];
    }
    get length() {
        const len = this.get('Content-Length');
        if (len == '')
            return;
        return ~~len;
    }
    get secure() {
        return 'https' == this.protocol;
    }
    get ips() {
        const val = this.get('X-Forwarded-For');
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
    accepts(...args) {
        return this.accept.types(...args);
    }
    is(types) {
        if (!types)
            return typeis(this.req);
        if (!Array.isArray(types))
            types = [].slice.call(arguments);
        return typeis(this.req, types);
    }
    get(field) {
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
exports.default = Request;
