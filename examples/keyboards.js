const { Bot, Keyboard, KeyboardColor } = require('..');
const bot = new Bot({
  token: 'Community API token',
  group_id: 123456
}).start();

bot.get(/Hi|Hello|Hey/i, message => {
  const keyboard = new Keyboard(true)
    .addButton('Red', KeyboardColor.NEGATIVE)
    .addButton('Green', KeyboardColor.POSITIVE)

  bot.send('Hello!', message.peer_id, keyboard)
});

bot.get(/Red|Green/, msg => bot.send('You clicked a button - ' + msg.body, msg.peer_id))