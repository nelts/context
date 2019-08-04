"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util = require("util");
const Cookies = require("cookies");
const utils_1 = require("@nelts/utils");
const request_1 = require("./request");
const response_1 = require("./response");
const statuses = require("statuses");
const utils_2 = require("@nelts/utils");
const Stream = require("stream");
class Context extends utils_1.EventEmitter {
    constructor(app, req, res, { cookie, logger }) {
        super();
        this.app = app;
        this.req = req;
        this.res = res;
        this.logger = logger;
        this.request = new request_1.default(this, req);
        this.response = new response_1.default(this, res);
        if (cookie) {
            this.cookies = new Cookies(this.req, this.res, {
                keys: cookie || ['nelts', 'context'],
                secure: this.request.secure,
            });
        }
    }
    setParams(value) {
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
    set body(value) {
        this.response.body = value;
    }
    get status() {
        return this.response.status;
    }
    set status(value) {
        this.response.status = value;
    }
    get method() {
        return this.req.method;
    }
    get length() {
        return this.response.length;
    }
    set length(value) {
        this.response.length = value;
    }
    get message() {
        return this.response.message;
    }
    set message(value) {
        this.response.message = value;
    }
    get type() {
        return this.response.type;
    }
    set type(value) {
        this.response.type = value;
    }
    set lastModified(val) {
        this.response.lastModified = val;
    }
    get lastModified() {
        return this.response.lastModified;
    }
    set etag(val) {
        this.response.etag = val;
    }
    get etag() {
        return this.response.etag;
    }
    get headerSent() {
        return this.response.headerSent;
    }
    set(field, val) {
        this.response.set(field, val);
    }
    get(field) {
        return this.request.get(field);
    }
    error(message, code) {
        const error = typeof message === 'string' ? new Error(message) : message;
        error.status = code || 500;
        return error;
    }
    throw(message, code) {
        throw this.error(message, code);
    }
    onerror(err) {
        if (!(err instanceof Error))
            throw new TypeError(util.format('non-error thrown: %j', err));
        if (404 == err.status || err.expose)
            return;
        if (this.silent)
            return;
        const msg = err.stack || err.toString();
        if (this.logger) {
            this.logger.error('');
            this.logger.error(msg.replace(/^/gm, '  '));
            this.logger.error('');
        }
    }
    redirect(url, alt) {
        this.response.redirect(url, alt);
    }
    attachment(filename, options) {
        this.response.attachment(filename, options);
    }
    is(types) {
        return this.response.is(types);
    }
    append(field, val) {
        return this.response.append(field, val);
    }
    flushHeaders() {
        return this.response.flushHeaders();
    }
    remove(value) {
        return this.response.remove(value);
    }
    responseBody() {
        const ctx = this;
        if (false === ctx.respond)
            return;
        const res = ctx.res;
        let body = ctx.body;
        const code = ctx.status;
        if (statuses.empty[code]) {
            ctx.body = null;
            return res.end();
        }
        if ('HEAD' == ctx.method) {
            if (!res.headersSent && utils_2.IsJson(body)) {
                ctx.length = Buffer.byteLength(JSON.stringify(body));
            }
            return res.end();
        }
        if (null == body) {
            if (ctx.req.httpVersionMajor >= 2) {
                body = String(code);
            }
            else {
                body = ctx.message || String(code);
            }
            if (!res.headersSent) {
                ctx.type = 'text';
                ctx.length = Buffer.byteLength(body);
            }
            return res.end(body);
        }
        if (Buffer.isBuffer(body))
            return res.end(body);
        if ('string' == typeof body)
            return res.end(body);
        if (body instanceof Stream)
            return body.pipe(res);
        body = JSON.stringify(body);
        if (!res.headersSent) {
            ctx.length = Buffer.byteLength(body);
        }
        res.end(body);
    }
}
exports.default = Context;
