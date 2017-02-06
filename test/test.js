const { describe, it } = require('mocha')
const Bot = require('..')

const peer = process.env.TEST_PEER_ID
const token = process.env.TEST_VK_TOKEN

describe('Bot', function () {
  const bot = new Bot({ token })
  
  const engbot = new Bot({ token, api: { lang: 'en' } })
  const rusbot = new Bot({ token, api: { lang: 'ru' } })
  
  const oldVersionBot = new Bot({ token, api: { v: 5.37 } })
  
  const pollingbot = new Bot({ token })
  pollingbot.start()

  describe('Events', function () {
    it('Emits "update" on recieved message', (done) => {
      pollingbot.once('update', () => done())
      setTimeout(function() {
        pollingbot.send('Test message', peer)
      }, 1000) // because sometimes it doesn't work ¯\_(ツ)_/¯ 
    })
  })

  describe('#send', function () {
    it('Sends message', function () {
      return bot.send('Test message 2', peer)
    })
  })

  describe('#api', function () {
    describe('Languages', function () {
      it('Gets response in Russian', function () {
        return rusbot.api('users.get', { user_ids: 1 })
          .then(res => res[0])
          .then(durov => {
            if (durov.first_name !== 'Павел') throw new Error()
          })
      })
      
      it('Gets response in English', function () {
        return engbot.api('users.get', { user_ids: 1 })
          .then(res => res[0])
          .then(durov => {
            if (durov.first_name !== 'Pavel') throw new Error()
          })
      })
      
      it('Gets full response object if using `execute` method', function () {
        return bot.api('execute', {
          code: "return [API.messages.send(), API.messages.send()];"
        }).then(res => {
          if (!res.response) throw new Error('There is no response object')
          if (!res.execute_errors) throw new Error('There is no errors object')
        })
      })
    })

    describe('Versions', function () {
      it('Gets error when using peer_id on version 5.37', function () {
        return oldVersionBot.api('messages.send', {
          peer_id: peer,
          message: '123'
        }).then(() => { throw new Error() }, () => true)
      })
    })
  })
})
