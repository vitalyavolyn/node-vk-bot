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
// ES6 and TypeScript
import { Bot } from 'node-vk-bot'

// ES5
const { Bot } = require('node-vk-bot')

const bot = new Bot({
  token: 'YOUR TOKEN',
  prefix: /^Bot[\s,]/
}).start()

bot.get(/Hi|Hello|Hey/i, message => {
  const options =  { forward_messages: message.id }

  bot.send('Hello!', message.peer_id, options)
})
```

# Table of contents
- [Getting Started](#getting-started)
- [`Bot`](#bot)
  - [Methods](#methods)
    - [`start`](#start)
    - [`get`](#get)
    - [`send`](#send)
    - [`uploadPhoto`](#uploadPhoto)
    - [`api`](#api)
    - [`stop`](#stop)
  - [Events](#events)
    - [update](#update)
    - [poll-error](#poll-error)
    - [command-notfound](#command-notfound)
- [The `Message` Object](#the-message-object)

## Getting Started <a name="getting-started"></a>
To get updates from the server, we use [polling](https://vk.com/dev/using_longpoll).

In the example above you can see a super simple VK Bot. This bot will answer our greetings, that's all.

Let's explain the code, it's pretty simple.

1. First of all, you have to import the library.
2. Then I create a bot instance, with my [token](https://vk.com/dev/access_token).
   
   get yourself one:
   ```
   https://oauth.vk.com/authorize?client_id= YOUR APP ID &scope=photos,messages,offline&display=touch&response_type=token
   ```
   
3. By calling `bot.start()` the bot starts polling updates from the server.
4. Then I simply listen on messages which pass the RegExp test, when I get such message, Then I send a new message with text 'Hello' to that chat with a forwarded message.

The API is simple as possible, still, if you have any suggestions about simplifying the API, please fill an [issue](https://github.com/Eblonko/node-vk-bot/issues/new).

-------

## Bot <a name="bot"></a>
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
    v: 5.62, // must be >= 5.38
    lang: 'ru'
  }
})
```

| Parameter | Type | Required |
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

### Methods <a name="methods"></a>
#### start <a name="start"></a>
Starts polling updates from API.
Emits an `update` event after getting updates with the response from server.
[Update examples](https://vk.com/dev/using_longpoll).

See  [`poll.js`](https://github.com/Eblonko/node-vk-bot/blob/master/src/functions/poll.js) for more info.

-------

#### get <a name="get"></a>
Listens on specific message matching the RegExp pattern.
```javascript
bot.get(/Hello/i, msg => {
  console.log(msg)
})
```

The argument passed to callback is a [`Message`](https://github.com/Eblonko/node-vk-bot#the-message-object) object and result of `pattern.exec(text)`.

-------

#### send <a name="send"></a>
Sends message.

```javascript
bot.send('text', peer_id, params)
```

-------

#### uploadPhoto <a name="uploadPhoto"></a>
Upload a photo.

The only parameter is an absolute path to picture.
Returns a Promise that resolves with a [photo object](https://vk.com/dev/photos.saveMessagesPhoto)
```javascript
bot.uploadPhoto('~/kittens.png').then(photo => {
  console.log(photo)
})
```

-------

#### api <a name="api"></a>
Access VK API.

```javascript
bot.api('users.get', { user_ids: 1 })
```

Attention! When using `execute` method, this function returns full response object. (Because there may be errors and responses in same object).

-------

#### stop <a name="stop"></a>
Stops the bot from listening on updates.

```javascript
bot.stop()
```

-------

### Events <a name="events"></a>
#### update <a name="update"></a>
The update event is emitted whenever there is a response from LongPoll.

```javascript
bot.on('update', update => {
  if (update[7].from === 1) {
    console.log('Got an message from Pavel Durov!');
  }
})
```
-------

#### poll-error <a name="poll-error"></a>
The poll-error event is emitted whenever there is an error occurred in LongPoll.

```javascript
bot.on('poll-error', error => {
  console.error('error occurred on a working with the Long Poll server ' +
    `(${util.inspect(error)})`)
})
```
-------

#### command-notfound <a name="command-notfound"></a>
This event is emitted whenever there's no `.get()` listeners matching

```javascript
bot.on('command-notfound', msg => {
  bot.send('What?', msg.peer_id)
})
```

-------

## The `Message` Object <a name="the-message-object"></a>
```typescript
interface Message {
  id: number, // message id
  peer_id: number, // message's chat peer_id
  date: number, // time (in Unixtime format)
  title: string, // chat title 
  body: string, // message text
  user_id: number, // sender's ID 
  attachments: Object // vk.com/dev/using_longpoll - see the attachments section
}
```
