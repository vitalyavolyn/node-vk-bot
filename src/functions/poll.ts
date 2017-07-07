import * as rq from 'request-promise-native'

const DEFAULT_DELAY = 334 // 1/3 of a second

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

export default function poll (bot, delay: number = DEFAULT_DELAY) {
  return bot.api('messages.getLongPollServer')
    .then(res => {
      return request(`https://${res.server}?act=a_check&key=${res.key}` +
        `&wait=25&mode=2&version=1&ts=${res.ts}`, delay)
    })
    .catch(error => {
      bot.emit('poll-error', error)

      // перезапуск при ошибке
      return poll(bot, delay)
    })

  function request (url, delay: number) {
    return rq(url, { json: true })
      .then(res => {
        if (!res || !res.ts || res.failed)
          throw new Error("response of the Long Poll server isn't valid " +
            `(${JSON.stringify(res)})`)
        url = url.replace(/ts=.*/, `ts=${res.ts}`) // ставим новое время

        if (res.updates.length > 0) {
          for (let i = 0; i < res.updates.length; i++) {
            let update = res.updates[i]
            if (update[0] === 4) bot.emit('update', update)
          }
        }

        if (bot._stop) return null
        return sleep(delay).then(() => request(url, delay))
      })
  }
}
