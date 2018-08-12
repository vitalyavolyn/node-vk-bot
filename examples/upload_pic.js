// Отправляет картинку на любое входящее сообщение

const { Bot } = require('node-vk-bot')
const path = require('path')

const bot = new Bot({
  token: 'TOKEN',
  group_id: 123456
}).start()

bot.on('command-notfound', msg => {
  bot.uploadPhoto(path.join(__dirname, './kitten.jpg'))
    .then(photo => bot.send('', msg.peer_id, {
      attachment: `photo${photo.owner_id}_${photo.id}`
    }))
})