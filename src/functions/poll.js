import unirest from 'unirest'
import sleep from './sleep'

export default function poll (bot) {
  return bot.api('messages.getLongPollServer').then(res => {
    rq(`https://${res.server}?act=a_check&key=${res.key}` +
      `&wait=25&mode=2&version=1&ts=${res.ts}`)
  }).catch(err => console.log(err))

  function rq (url) {
    unirest.get(url)
      .end(res => {
        res = JSON.parse(res.body)
        if (!res || !res.ts || res.failed) return poll(bot) // перезапуск при ошибке
        url = url.replace(/ts=.*/, `ts=${res.ts}`) // ставим новое время

        if (res.updates.length > 0) {
          for (let i = 0; i < res.updates.length; i++) {
            let update = res.updates[i]
            if (update[0] === 4) bot.emit('update', update)
          }
        }

        if (bot._stop) return null
        return sleep(500).then(() => rq(url))
      })
  }
}
