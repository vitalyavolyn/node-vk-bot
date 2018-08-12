import { Bot, Message } from '..'
import * as path from 'path'

const bot = new Bot({
  token: 'token',
  group_id: 123456
})
  .start()
  .get(/cat|kitten/, async (msg, exec, reply) => {
    const photoPath = path.join(__dirname, 'kitten.jpg')
    const photo = await bot.uploadPhoto(photoPath)
    reply('Take this', {
      attachment: `photo${photo.owner_id}_${photo.id}`
    })
  })