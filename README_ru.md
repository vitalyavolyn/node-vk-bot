[![Build Status](https://travis-ci.org/vitalyavolyn/node-vk-bot.svg?branch=master)](https://travis-ci.org/vitalyavolyn/node-vk-bot)

# Боты ВКонтакте
Библиотека для создания чат-ботов ВК.
Для получения новых сообщений используется LongPoll или Callback API.

```sh
npm install --save node-vk-bot
```

Не забудьте выполнить `npm i` при клонировании репозитория

# Пример <a name="example"></a>
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

[Больше примеров](https://github.com/vitalyavolyn/node-vk-bot/tree/master/examples) (как использовать вебхуки, загружать фото, ...)

# Боты, созданные с помощью этой библиотеки
если вы хотите добавить своего в этот список, просто сделайте pull request

- [**GitHub Events**](https://vk.com/githubbot) - Оповещения о новых коммитах, issues и т.д. в сообщения ВК _by [@vitalyavolyn](https://github.com/vitalyavolyn)_

# Содержание
- [Начало работы](#getting-started)
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

## Начало работы <a name="getting-started"></a>
В примере выше показан бот, который лишь отвечает на приветствия

Разберем код примера c LongPoll
1. Создаем бота, используя класс `Bot`.
2. Вызов `bot.start()` начинает получение новых сообщений.
3. Затем мы тестируем каждое входящее сообщение с помощью `/Hi|Hello|Hey/i`, и если сообщеине подходит, отвечаем на него.

-------

## Bot <a name="bot"></a>
Класс, используемый для создания ботов, принимает один аргумент: `options`.

```javascript
new Bot({
  token: 'TOKEN',
  group_id: 123456,
  api: {
    v: 5.80, // >= 5.80
    lang: 'ru'
  }
})
```

| Параметр | Тип | Обязателен? |
|-----------|:----:|---------:|
| token     | String | Да |
| group_id  | Number | Да |
| api       | Object| Нет |
| controllers | String[] | Нет |

`api` - объект с настройками API: **v**ersion и **lang**uage. (и то, и то - строки) ([узнать больше](https://vk.com/dev/api_requests))

-------

### Методы <a name="methods"></a>
#### start <a name="start"></a>
Начинает получение новых сообщений используя LongPoll.
Бот вызывает событие `update` после получения сообщений с сервера.
[Примеры объектов событий](https://vk.com/dev/using_longpoll).

-------

#### get <a name="get"></a>
Проверяет полученные сообщения RegExp'ом
```javascript
bot.get(/Hello/i, (msg, exec, reply) => {
  console.log(msg)
  reply('Hi!')
})

Аргументы callback:
msg - [объект сообщения](#the-message-object)
exec - результат `pattern.exec(text)`
reply - Функция для ответа на сообщение, принимает текст сообщения и необязательные параметры message.send
```

Аргументы, с которыми вызывается callback - объект [`Message`](#the-message-object) и результат `pattern.exec(text)` (где `text` - текст сообщения).

-------

#### getPayload <a name="getPayload"></a>
То же самое, что и get, но для payload клавиатур

Это синтаксический сахар для [события `payload`](#payload)

```
bot.getPayload('{"command": "start"}', (msg, reply) => console.log(msg))
```

Аргументы: строка json и callback

-------

#### send <a name="send"></a>
Отправляет сообщение.

```javascript
bot.send('text', peer_id, params)
```

-------

#### uploadPhoto <a name="uploadPhoto"></a>
Загружает фото.

Принимает абсолютный путь к изображению или `Stream`
Возвращает Promise с [объектом фотографии](https://vk.com/dev/photos.saveMessagesPhoto)
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
Доступ к VK API.

```javascript
bot.api('users.get', { user_ids: 1 })
  .then(res => console.log(res[0].first_name)) // Павел
```

При использовании метода API `execute`, функция возвращает результат в том же виде, в котором о н пришел с сервера.

-------

#### processUpdate <a name="processUpdate"></a>
Функция для использования Callback API.
Пример в папке `examples`

-------

#### stop <a name="stop"></a>
Остановить проверку новых сообщений

```javascript
bot.stop()
```

-------

### События <a name="events"></a>
#### update <a name="update"></a>
Вызывается при получении новых соообщений с LongPoll сервера

```javascript
bot.on('update', update => {
  if (update.from_id === 1) {
    console.log('Got a message from Pavel Durov!');
  }
})
```
-------

#### voice <a name="voice"></a>
Вызывется при получении голосового сообщения (возвращает объект `Message`).

-------

#### sticker <a name="sticker"></a>
Вызывется при получении стикера (возвращает объект `Message`).

-------

#### payload <a name="payload"></a>
Вызывается при получении сообщения с json payload (используется в клавиатурах)
Возвращает объект `Message` и функцию [reply](#get)

-------

#### poll-error <a name="poll-error"></a>
Вызывается при ошибке при использовании LongPoll

```javascript
bot.on('poll-error', error => {
  console.error('error occurred on a working with the Long Poll server ' +
    `(${util.inspect(error)})`)
})
```
-------

#### command-notfound <a name="command-notfound"></a>
Вызывается при получении сообщения, которое не подходит ни к одному RegExp'у `.get()`

```javascript
bot.on('command-notfound', msg => {
  bot.send('What?', msg.peer_id)
})
```

-------

## Keyboard <a name="keyboard"></a>
Класс для создания клавиатуры для бота
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
[Пример целиком](https://github.com/vitalyavolyn/node-vk-bot/blob/master/examples/keyboards.js)

Единственный параметр - one_time 
Если True, клавиатура исчезнет после нажатия на кнопку
```javascript
new Keyboard(true)
```
-------

### addButton <a name="addButton"></a>
Добавить кнопку в последнюю строчку кнопок.

Parameters:
- label (string) - Текст на кнопке (required)
- color (string или [KeyboardColor](#KeyboardColor))
- payload (any) - Параметр для callback api

Максимальное количество кнопок на строке - 4

-------

### addRow <a name="addRow"></a>
Добавляет новую строчку для кнопок

Максимальное количество строк - 10

-------

### toString <a name="toString"></a>
Получить клавиатуру в виде JSON строки

-------

### KeyboardColor <a name="KeyboardColor"></a>
```javascript
addButton('label', KeyboardColor.NEGATIVE)
```

Возможные цвета кнопок:
- PRIMARY - синяя
- DEFAULT - белая
- NEGATIVE - красная
- POSITIVE - зеленая

-------

## Объект `Message` <a name="the-message-object"></a>
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

// https://vk.com/dev/objects/message
```
