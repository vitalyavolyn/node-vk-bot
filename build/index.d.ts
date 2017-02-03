/// <reference types="node" />
import { EventEmitter } from 'events';
export interface Options {
    token: string;
    prefix?: RegExp;
    prefixOnlyInChats?: boolean;
    chats?: number[];
    api?: {
        lang?: string;
        v?: number;
    };
}
export default class Bot extends EventEmitter {
    options: Options;
    _events: Object;
    _userEvents: any[];
    _stop: boolean;
    constructor(options: Options);
    api(method: string, params?: any): Promise<any>;
    send(text: string, peer: number, params?: any): Promise<any>;
    start(): this;
    stop(): this;
    get(pattern: RegExp, listener: Function): this;
    uploadPhoto(path: string): Promise<any>;
    private _update(update);
}
