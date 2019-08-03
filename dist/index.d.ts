/// <reference types="node" />
/// <reference types="accepts" />
import * as Keygrip from 'keygrip';
import * as Cookies from 'cookies';
import { IncomingMessage, ServerResponse } from "http";
import { EventEmitter } from '@nelts/utils';
import Request from './request';
import Response, { fieldObjectSchema, fieldValueSchema } from './response';
import { Logger } from 'log4js';
export declare type RequestParamsSchema = {
    [schema: string]: string;
};
export interface ContextError extends Error {
    status?: number;
    code?: number;
    expose?: boolean;
}
export interface ContextOptions {
    cookie?: string[] | Keygrip;
    logger?: Logger;
}
export default class Context<APP, BODY = any, FILE = any> extends EventEmitter {
    readonly app: APP;
    readonly req: IncomingMessage;
    readonly res: ServerResponse;
    readonly cookies: Cookies;
    readonly request: Request<APP, this, BODY, FILE>;
    readonly response: Response<APP, this, BODY, FILE>;
    readonly logger: Logger;
    params: RequestParamsSchema;
    silent: boolean;
    respond: boolean;
    constructor(app: APP, req: IncomingMessage, res: ServerResponse, { cookie, logger }: ContextOptions);
    setParams(value: RequestParamsSchema): this;
    readonly query: import("querystring").ParsedUrlQuery;
    readonly header: import("http").IncomingHttpHeaders;
    readonly headers: import("http").IncomingHttpHeaders;
    readonly accept: import("accepts").Accepts;
    readonly url: string;
    readonly ip: string;
    body: any;
    status: number;
    readonly method: string;
    length: number;
    message: any;
    type: string;
    lastModified: string | Date | number;
    etag: string;
    readonly headerSent: boolean;
    set(field: string | fieldObjectSchema, val?: fieldValueSchema): void;
    get(field: string): string | string[];
    error(message: ContextError | string, code?: number): ContextError;
    throw(message: Error | string, code?: number): void;
    onerror(err: ContextError): void;
    redirect(url: string, alt?: string): void;
    attachment(filename: string, options: any): void;
    is(types: string | string[]): string | false;
    append(field: string, val: any): void;
    flushHeaders(): void;
    remove(value: string): void;
}
