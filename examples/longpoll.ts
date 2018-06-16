import { Bot, Message } from '..'
import * as path from 'path'

const bot = new Bot({
  token: 'token',
  prefix: /Bot[,\s]/i,
  prefixOnlyInChats: true
})

bot.start()
bot.get(/cat|kitten/, async (msg: Message) => {
  const photoPath = path.join(__dirname, '../test/kitten.jpg')
  const photo = await bot.uploadPhoto(photoPath)
  bot.send('Take this', msg.peer_id, {
    attachment: `photo${photo.owner_id}_${photo.id}`
  })
})