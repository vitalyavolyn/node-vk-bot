[![Codacy Badge](https://api.codacy.com/project/badge/Grade/a0950ccdf7b54dd7a7b7bc23fa7e7123)](https://www.codacy.com/app/Eblonko/node-vk-bot?utm_source=github.com&utm_medium=referral&utm_content=Eblonko/node-vk-bot&utm_campaign=badger)
[![CircleCI](https://circleci.com/gh/vitalyavolyn/node-vk-bot.svg?style=shield)](https://circleci.com/gh/vitalyavolyn/node-vk-bot)

# VK BOTS
Create and control VK bots easily.
```sh
npm install --save node-vk-bot
```

If you are cloning this repository, remember to run `npm install` to install dependencies.

# Example
```javascript
// ES6
import Bot from 'node-vk-bot'

// ES5
const Bot = require('node-vk-bot')

const bot = new Bot({
  token: 'YOUR TOKEN',
  prefix: /^Bot[\s,]/
})

bot
  .start()
  .get(/Hi|Hello|Hey/i, message => {
    const options =  { forward_messages: message.id }

    bot.send('Hello!', message.peer_id, options)
  })
```

# Documentation
## Getting Started
To get updates from the server, we use [polling](https://vk.com/dev/using_longpoll).

In the example above you can see a super simple VK Bot. This bot will answer our greetings, that's all.

Let's explain the code, it's pretty simple.

1. First of all, you have to import the library.
2. Then I create a bot instance, with my [token](https://vk.com/dev/access_token).
3. By calling `bot.start()` the bot starts polling updates from the server.
4. Then I simply listen on messages which pass the RegExp test, when I get such message, Then I send a new message with text 'Hello' to that chat with a forwarded message.

The API is simple as possible, still, if you have any suggestions about simplifying the API, please fill an [issue](https://github.com/Eblonko/node-vk-bot/issues/new).

-------

### Bot
The class used to create new bots, it takes a single argument, an `options` object.

```javascript
new Bot({
  token: '5a9bdc30ea18ab4a685a8f773642ba0d', // don't even try to use this token
  prefix: /^Bot[\s,]/,
  prefixOnlyInChats: true,
  chats: [
    1,
    2e9 + 12
  ],
  api: {
    v: 5.62,
    lang: 'ru'
  }
})
```

| Parameter | Type | Requried |
|-----------|:----:|---------:|
| token     | String | Yes |
| prefix    | RexExp | No |
| prefixOnlyInChats | Boolean | No |
| chats     | Array | No |
| api       | Object| No |

If `prefix` is set, the bot will work only with messages with prefix match. (if `prefixOnlyInChats` is `true`, then prefix will be checked only for messages from group chats)<br>
If `chats` is set, the bot will work only with messages from these chats

`api` is object with API settings: **v**ersion and **lang**uage. ([Read more](https://vk.com/dev/api_requests))

-------

#### Methods
##### start
Starts polling updates from API.
Emits an `update` event after getting updates with the response from server.
[Update examples](https://vk.com/dev/using_longpoll).

See  [`poll.js`](https://github.com/Eblonko/node-vk-bot/blob/master/src/functions/poll.js) for more info.

-------

##### get
Listens on specific message matching the RegExp pattern.
```javascript
bot.get(/Hello/i, msg => {
  console.log(msg)
})
```

The argument passed to callback is a [`Message`](https://github.com/Eblonko/node-vk-bot#the-message-object) object and result of `pattern.exec(text)`.

-------

##### send
Sends message.

```javascript
bot.send('text', peer_id, params)
```

-------

##### uploadPhoto
Upload a photo.

The only parameter is a path to picture.
Returns a Promise that resolves with a [photo object](https://vk.com/dev/photos.saveMessagesPhoto)
```javascript
bot.uploadPhoto('~/kittens.png').then(photo => {
  console.log(photo)
})
```

-------

##### api
Access VK API.

```javascript
bot.api('users.get', { user_ids: 1 })
```

-------

##### stop
Stops the bot from listening on updates.

```javascript
bot.stop()
```

-------

#### Events
##### update
The update event is emitted whenever there is a response from LongPoll.

```javascript
bot.on('update', update => {
  if (update[7].from === 1) {
    console.log('Got an message from Pavel Durov!');
  }
})
```
-------

##### command-notfound
This event is emitted whenever there's no `.get()` listeners matching

```javascript
bot.on('command-notfound', msg => {
  bot.send('What?', msg.peer_id)
}
```

-------

### The `Message` Object
```javascript
{
  id: Number, // message id
  peer_id: Number, // message's chat peer id
  date: Number, // time (in Unixtime format)
  title: String, // chat title
  body: String, // message body
  user_id: Number // sender's ID
  attachments: Object // vk.com/dev/using_longpoll - see the attachments section
}
```
