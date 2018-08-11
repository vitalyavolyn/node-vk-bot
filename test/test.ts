import * as rq from 'request-promise-native'
import * as assert from 'assert'
import { Bot } from '../src'

import 'mocha'

const botToken = process.env.COMMUNITY_TOKEN
const userToken = process.env.USER_TOKEN
const id = Number(process.env.GROUP_ID)

describe('Bot', () => {
  const bot = new Bot({ token: botToken, group_id: id, api: {} })
  let peer

  bot.start()

  it('Gets LongPoll updates', done => {
    bot.on('update', update => {
      peer = update.object.from_id
      done()
    })

    rq('https://api.vk.com/method/messages.send', {
      form: {
        message: 'test',
        access_token: userToken,
        peer_id: -id,
        v: '5.80'
      },
      method: 'POST',
      json: true
    })
  })

  describe('#send', () => {
    it('Sends message', () => {
      return bot.send('test', peer)
    })
  })

  describe('#api', () => {
    describe('Languages', () => {
      it('Gets response in Russian', () => {
        bot.options.api.lang = 'ru'
        return bot.api('users.get', { user_ids: 1 })
          .then(res => res[0])
          .then(durov => {
            assert.equal(durov.first_name, 'Павел')
          })
      })

      it('Gets response in English', () => {
        bot.options.api.lang = 'en'
        return bot.api('users.get', { user_ids: 1 })
          .then(res => res[0])
          .then(durov => {
            assert.equal(durov.first_name, 'Pavel')
          })
      })
    })

    it('Throws error when using old API version', () => {
      assert.throws(() => new Bot({ token: botToken, group_id: id, api: { v: '5.79' } }), Error)
    })
  })
})