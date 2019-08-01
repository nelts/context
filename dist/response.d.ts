/// <reference types="node" />
import Context from './index';
import { ServerResponse } from 'http';
export declare type fieldValueSchema = string | number | string[];
export declare type fieldObjectSchema = {
    [name: string]: fieldValueSchema;
};
export default class Response<M, C extends Context<M, B, F>, B = any, F = any> {
    private _body;
    private _explicitStatus;
    readonly ctx: C;
    readonly res: ServerResponse;
    constructor(ctx: C, res: ServerResponse);
    lastModified: string | Date | number;
    etag: string;
    readonly headerSent: boolean;
    readonly app: M;
    readonly req: import("http").IncomingMessage;
    readonly request: import("./request").default<M, C, B, F>;
    readonly header: any;
    readonly headers: any;
    status: number;
    message: any;
    type: string;
    length: any;
    body: any;
    get(field: string): any;
    set(field: string | fieldObjectSchema, val?: fieldValueSchema): void;
    remove(field: string): void;
    redirect(url: string, alt?: string): void;
    attachment(filename: string, options: any): void;
    is(types: string | string[]): string | false;
    append(field: string, val: any): void;
    flushHeaders(): void;
}
