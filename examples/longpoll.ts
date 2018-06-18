import { Bot, Message } from '..'
import * as path from 'path'

const bot = new Bot({
  token: 'token',
  group_id: 123456
})
  .start()
  .get(/cat|kitten/, async (msg: Message) => {
    const photoPath = path.join(__dirname, '../test/kitten.jpg')
    const photo = await bot.uploadPhoto(photoPath)
    bot.send('Take this', msg.peer_id, {
      attachment: `photo${photo.owner_id}_${photo.id}`
    })
  })