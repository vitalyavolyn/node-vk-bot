[![Build Status](https://travis-ci.org/vitalyavolyn/node-vk-bot.svg?branch=master)](https://travis-ci.org/vitalyavolyn/node-vk-bot)

[README на русском](https://github.com/vitalyavolyn/node-vk-bot/blob/master/README_ru.md)

# VK BOTS
- Create and control VK bots easily.
- Uses LongPoll or Callback API to get new messages

```sh
npm install --save node-vk-bot
```

If you are cloning this repository, remember to run `npm install` to install dependencies.

# Example <a name="example"></a>
```javascript
const { Bot, Keyboard } = require('node-vk-bot')

const bot = new Bot({
  token: 'YOUR TOKEN',
  group_id: 123456
}).start()

bot.get(/Hi|Hello|Hey/i, (message, exec, reply) => {
  const keyboard = new Keyboard().addButton('Hi!')
  const options =  { forward_messages: message.id, keyboard }

  reply('Hello!', options)
})
```

[More examples](https://github.com/vitalyavolyn/node-vk-bot/tree/master/examples) (how to use webhooks, upload pictures, ...)

# Bots created with this library
if you want your bot to be in this list, just make a pull request

- [**GitHub Events**](https://vk.com/githubbot) - Notifies you about new issues, commits, etc. in private messages _by [@vitalyavolyn](https://github.com/vitalyavolyn)_

# Table of contents
- [Getting Started](#getting-started)
- [`Bot`](#bot)
  - [Methods](#methods)
    - [`start`](#start)
    - [`get`](#get)
    - [`getPayload`](#getPayload)
    - [`send`](#send)
    - [`uploadPhoto`](#uploadPhoto)
    - [`api`](#api)
    - [`processUpdate`](#processUpdate)
    - [`stop`](#stop)
  - [Events](#events)
    - [update](#update)
    - [voice](#voice)
    - [sticker](#sticker)
    - [payload](#payload)
    - [poll-error](#poll-error)
    - [command-notfound](#command-notfound)
- [Keyboard](#keyboard)
  - [addButton](#addButton)
  - [addRow](#addRow)
  - [toString](#toString)
  - [KeyboardColor](#KeyboardColor)
- [The `Message` Object](#the-message-object)

## Getting Started <a name="getting-started"></a>
In the example above you can see a super simple VK Bot. This bot will answer our greetings, that's all.

Let's explain the code, it's pretty simple.

1. Then I create a bot instance with my group's token.
2. By calling `bot.start()` the bot starts polling updates from the server.
3. Then I simply listen on messages which pass the RegExp test, when I get such message, Then I send a new message with text 'Hello' to that chat with a forwarded message.

-------

## Bot <a name="bot"></a>
The class used to create new bots, it takes a single argument, an `options` object.

```javascript
new Bot({
  token: 'TOKEN',
  group_id: 123456
  api: {
    v: 5.80, // >= 5.80
    lang: 'ru'
  }
})
```

| Parameter | Type | Required |
|-----------|:----:|---------:|
| token     | String | Yes |
| group_id  | Number | Yes
| api       | Object| No |
| controllers | String[] | No |

`api` is object with API settings: **v**ersion and **lang**uage. (both strings) ([Read more](https://vk.com/dev/api_requests))

-------

### Methods <a name="methods"></a>
#### start <a name="start"></a>
Starts polling updates from API.
Emits an `update` event after getting updates with the response from server.
[Update examples](https://vk.com/dev/using_longpoll).

-------

#### get <a name="get"></a>
Listens on specific message matching the RegExp pattern.
```javascript
bot.get(/Hello/i, (msg, exec, reply) => {
  console.log(msg)
  reply('Hi!')
})
```

The argument passed to callback is a [`Message`](#the-message-object) object, result of `pattern.exec(text)` and a `reply` function.

`reply` takes text as first argument and optional message.send parameters as second.

-------

#### getPayload <a name="getPayload"></a>
Listens for specific `payload` (used for keyboards)
This is a syntactic sugar for the [`payload` event](#payload)

```
bot.getPayload('{"command": "start"}', (msg, reply) => console.log(msg))
```

Arguments: json string and listener

-------

#### send <a name="send"></a>
Sends message.

```javascript
bot.send('text', peer_id, params)
```

-------

#### uploadPhoto <a name="uploadPhoto"></a>
Upload a photo.

The only parameter is an absolute path to picture or a stream object.
Returns a Promise that resolves with a [photo object](https://vk.com/dev/photos.saveMessagesPhoto)
```javascript
bot.uploadPhoto('~/kittens.png').then(photo => {
  console.log(photo)
})

let stream = fs.createReadStream('./kittens.png')
bot.uploadPhoto(stream).then(photo => {
  console.log(photo)
})
```

-------

#### api <a name="api"></a>
Access VK API.

```javascript
bot.api('users.get', { user_ids: 1 })
  .then(res => console.log(res[0].first_name)) // Pavel
```

When using `execute` method, this function returns full response object. (Because there may be errors and responses in same object).

-------

#### processUpdate <a name="processUpdate"></a>
Process an update from Callback API.
Example of usage may be found in `examples` folder

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
  if (update.from_id === 1) {
    console.log('Got a message from Pavel Durov!');
  }
})
```
-------

#### voice <a name="voice"></a>
The voice event is emitted whenever there is a new voice message. (emits `Message` object)

-------

#### sticker <a name="sticker"></a>
The sticker event is emitted whenever there is a new incoming sticker. (emits `Message` object)

-------

#### payload <a name="payload"></a>
Emitted when bot recieves a message with json payload (used in keyboards)
Emits `Message` object and [reply function](#get)

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

## Keyboard <a name="keyboard"></a>
The class used to create keyboards in messages
```javascript
bot.get(/Hi|Hello|Hey/i, message => {
  const keyboard = new Keyboard(true)
    .addButton('Red', KeyboardColor.NEGATIVE)
    .addButton('Green', KeyboardColor.POSITIVE)
    .addRow()
    .addButton('Blue', KeyboardColor.PRIMARY)
    .addButton('White')

  bot.send('Hello!', message.peer_id, keyboard)
});
```
[Full example](https://github.com/vitalyavolyn/node-vk-bot/blob/master/examples/keyboards.js)

The only argument - one_time 
If `true`, the keyboard hides after user replies
```javascript
new Keyboard(true)
```
-------

### addButton <a name="addButton"></a>
Add a button to the last row.

Parameters:
- label (string) - Text on button (required)
- color (string or [KeyboardColor](#KeyboardColor))
- payload (any) - A parameter for Callback API

Maximum amount of buttons in one row is 4

-------

### addRow <a name="addRow"></a>
Add a new row to the keyboard.

Maximum amount of rows is 10

-------

### toString <a name="toString"></a>
Get the keyboard as a JSON string

-------

### KeyboardColor <a name="KeyboardColor"></a>
```javascript
addButton('label', KeyboardColor.NEGATIVE)
```

Available colors:
- PRIMARY - blue
- DEFAULT - white
- NEGATIVE - red
- POSITIVE - green

-------

## The `Message` Object <a name="the-message-object"></a>
```typescript
interface Message {
  id: number,
  peer_id: number,
  date: number,
  text: string,
  from_id: number,
  attachments: any,
  important: boolean,
  conversation_message_id: number,
  fwd_messages: any
}

// Reference: https://vk.com/dev/objects/message
```
