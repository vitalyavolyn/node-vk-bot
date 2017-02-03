"use strict";
const rq = require("request-promise-native");
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
function poll(bot) {
    return bot.api('messages.getLongPollServer')
        .then(res => {
        request(`https://${res.server}?act=a_check&key=${res.key}` +
            `&wait=25&mode=2&version=1&ts=${res.ts}`);
    })
        .catch(err => console.log(err));
    function request(url) {
        return rq(url, { json: true })
            .then(res => {
            if (!res || !res.ts || res.failed)
                return poll(bot);
            url = url.replace(/ts=.*/, `ts=${res.ts}`);
            if (res.updates.length > 0) {
                for (let i = 0; i < res.updates.length; i++) {
                    let update = res.updates[i];
                    if (update[0] === 4)
                        bot.emit('update', update);
                }
            }
            if (bot._stop)
                return null;
            return sleep(300).then(() => request(url));
        }, () => poll(bot));
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = poll;
