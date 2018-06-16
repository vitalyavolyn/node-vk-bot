[![Codacy Badge](https://api.codacy.com/project/badge/Grade/a0950ccdf7b54dd7a7b7bc23fa7e7123)](https://www.codacy.com/app/Eblonko/node-vk-bot?utm_source=github.com&utm_medium=referral&utm_content=Eblonko/node-vk-bot&utm_campaign=badger)
[![CircleCI](https://circleci.com/gh/vitalyavolyn/node-vk-bot.svg?style=shield)](https://circleci.com/gh/vitalyavolyn/node-vk-bot)

# Боты ВКонтакте
Библиотека для создания чат-ботов ВК.
Поддерживает создание ботоов и на страницах пользователей, и в сообществах.
Для получения новых сообщений используется LongPoll, для сообществ также можно использовать Callback API.

```sh
npm install --save node-vk-bot
```

Не забудьте выполнить `npm i` при клонировании репозитория

# Пример <a name="example"></a>
```javascript
// TypeScript
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

Тот же пример, используя webhook:
```javascript
const express = require('express');
const bodyParser = require('body-parser');
const { Bot } = require('node-vk-bot');
const bot = new Bot({
    token: 'Community API token'
})

const port = 8000
const app = express();

app.use(bodyParser.json());

app.post('/bot', (req, res) => {
  if (req.body.type == 'confirmation') res.send('CONFIRMATION CODE')
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

app.listen(port, () => {
  console.log(`Express server is listening on ${port}`);
});

bot.get(/Hi|Hello|Hey/i, message => {
  bot.send('Hello!', message.peer_id)
})
```

(настройте адрес сервера в настройках сообщества)


# Боты, созданные с помощью этой библиотеки
если вы хотите добавить своего в этот список, просто сделайте pull request

- [**GitHub Events**](https://vk.com/githubbot) - Оповещения о новых коммитах, issues и т.д. в сообщения ВК _by [@vitalyavolyn](https://github.com/vitalyavolyn)_

# Содержание
- [Начало работы](#getting-started)
- [`Bot`](#bot)
  - [Methods](#methods)
    - [`start`](#start)
    - [`get`](#get)
    - [`send`](#send)
    - [`uploadPhoto`](#uploadPhoto)
    - [`api`](#api)
    - [`processUpdate`](#processUpdate)
    - [`stop`](#stop)
  - [Events](#events)
    - [update](#update)
    - [voice](#voice)
    - [sticker](#sticker)
    - [poll-error](#poll-error)
    - [command-notfound](#command-notfound)
- [The `Message` Object](#the-message-object)

## Начало работы <a name="getting-started"></a>
В примере выше показан бот, который лишь отвечает на приветствия

Разберем код примера c LongPoll
1. Создаем бота, используя класс `Bot` c [токеном доступа](https://vk.com/dev/access_token).
   
   Получить токен:
   ```
   https://oauth.vk.com/authorize?client_id= АЙДИ ПРИЛОЖЕНИЯ ВК &scope=photos,messages,offline&display=touch&response_type=token
   ```

2. Вызов `bot.start()` начинает получение новых сообщений.
3. Затем мы тестируем каждое входящее сообщение с помощью `/Hi|Hello|Hey/i`, и если сообщеине подходит, отвечаем на него.

-------

## Bot <a name="bot"></a>
Класс, используемый для создания ботов, принимает один аргумент: `options`.

```javascript
new Bot({
  token: '5a9bdc30ea18ab4a685a8f773642ba0d', // Нет, этот токен не работает
  prefix: /^Bot[\s,]/,
  prefixOnlyInChats: true,
  chats: [
    1,
    2e9 + 12
  ],
  api: {
    v: 5.62, // >= 5.38
    lang: 'ru'
  }
})
```

| Параметр | Тип | Обязателен? |
|-----------|:----:|---------:|
| token     | String | Да |
| prefix    | RexExp | Нет |
| prefixOnlyInChats | Boolean | Нет |
| chats     | Array | Нет |
| api       | Object| Нет |

Если `prefix` установлен, бот будет работать только с сообщениями, в начале которых есть префикс. (если `prefixOnlyInChats` = `true`, префикс будет проверен только для сообщений из групповых чатов). `prefix` не проверяется, если используется Callback API<br>
Если указать `chats`, бот будет работать только с сообщениями из этих чатов

`api` - объект с настройками API: **v**ersion и **lang**uage. ([узнать больше](https://vk.com/dev/api_requests))

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
bot.get(/Hello/i, (msg, exec) => {
  console.log(msg)
})
```

Аргументы, с которыми вызывается callback - объект [`Message`](#the-message-object) и результат `pattern.exec(text)` (где `text` - текст сообщения).

-------

#### send <a name="send"></a>
Отправляет сообщение.

```javascript
bot.send('text', peer_id, params)
```

-------

#### uploadPhoto <a name="uploadPhoto"></a>
Загружает фото.

Принимает абсолютный путь к изображению
Возвращает Promise с [объектом фотографии](https://vk.com/dev/photos.saveMessagesPhoto)
```javascript
bot.uploadPhoto('~/kittens.png').then(photo => {
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
[Пример](#example)

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
  if (update[7].from === 1) {
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

## Объект `Message` <a name="the-message-object"></a>
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
