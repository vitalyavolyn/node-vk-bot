"use strict";
const events_1 = require("events");
const rq = require("request-promise-native");
const fs = require("fs");
const Message_1 = require("./functions/Message");
const poll_1 = require("./functions/poll");
class Bot extends events_1.EventEmitter {
    constructor(options) {
        super();
        this._events = {};
        this._userEvents = [];
        this._stop = false;
        if (!options.token)
            throw new Error('Token can\'t be empty');
        this.options = options;
    }
    api(method, params = {}) {
        let o = this.options;
        if (o.api) {
            params.v = params.v || o.api.v || 5.62;
            params.lang = params.lang || o.api.lang;
            if (params.lang === undefined)
                delete params.lang;
        }
        else
            params.v = params.v || 5.62;
        params.access_token = this.options.token;
        return rq({
            baseUrl: 'https://api.vk.com',
            uri: '/method/' + method,
            form: params,
            method: 'POST',
            json: true
        }).then(res => {
            if (res.error) {
                throw res.error;
            }
            return res.response;
        });
    }
    send(text, peer, params = {}) {
        params.message = text;
        params.peer_id = peer;
        return this.api('messages.send', params);
    }
    start() {
        this.on('update', this._update);
        poll_1.default(this);
        return this;
    }
    stop() {
        this._stop = true;
        this.removeListener('update', this._update);
        this._events = {};
        return this;
    }
    get(pattern, listener) {
        this._userEvents.push({
            pattern, listener
        });
        return this;
    }
    uploadPhoto(path) {
        return this.api('photos.getMessagesUploadServer')
            .then(server => rq({
            method: 'POST',
            uri: server.upload_url,
            formData: {
                photo: fs.createReadStream(path)
            },
            json: true
        }))
            .then(upload => this.api('photos.saveMessagesPhoto', {
            server: upload.server,
            photo: upload.photo,
            hash: upload.hash
        }))
            .then(photos => photos[0]);
    }
    _update(update) {
        const text = update[6];
        const peer = update[3];
        const isChat = peer > 2e9;
        if (!text)
            return;
        if (this.options.chats && !this.options.chats.includes(peer))
            return;
        if (this.options.prefix) {
            const p = this.options.prefix;
            if (text.search(p) !== 0) {
                if (!this.options.prefixOnlyInChats)
                    return;
                if (this.options.prefixOnlyInChats && isChat)
                    return;
            }
        }
        const ev = this._userEvents.find(({ pattern }) => pattern.test(text));
        if (!ev) {
            this.emit('command-notfound', new Message_1.default(update));
            return;
        }
        ev.listener(new Message_1.default(update), ev.pattern.exec(text));
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Bot;
(module).exports = Bot;
