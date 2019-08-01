/// <reference types="node" />
import * as querystring from 'querystring';
import * as accepts from 'accepts';
import { IncomingMessage } from "http";
import Context from './index';
export default class Request<M, C extends Context<M, B, F>, B = any, F = any> {
    private _ip;
    private _accept;
    readonly ctx: C;
    readonly req: IncomingMessage;
    readonly search: string;
    readonly query: querystring.ParsedUrlQuery;
    readonly pathname: string;
    readonly path: string;
    readonly href: string;
    readonly host: string;
    readonly hostname: string;
    body: B;
    files: F;
    constructor(ctx: C, req: IncomingMessage);
    readonly accept: accepts.Accepts;
    readonly res: import("http").ServerResponse;
    readonly app: M;
    readonly response: import("./response").default<M, C, B, F>;
    readonly protocol: string;
    readonly url: string;
    readonly origin: string;
    readonly type: string;
    readonly length: number;
    readonly secure: boolean;
    readonly ips: string[];
    readonly ip: string;
    readonly header: import("http").IncomingHttpHeaders;
    readonly headers: import("http").IncomingHttpHeaders;
    accepts(...args: string[]): string | false | string[];
    is(types?: string): string | false;
    get(field: string): string | string[];
}
