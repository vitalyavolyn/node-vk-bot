if (!global._babelPolyfill) require('babel-polyfill')

import API from './functions/api'
import poll from './functions/poll'

import { EventEmitter } from 'events'

/**
 * Класс бота
 */
export default class Bot extends EventEmitter {
  /**
   * Конструктор бота.
   * @param {Object} options Объект с параметрами:
   *                           - token: API токен ВКонтакте. Требуется
   *                                    право на методы messages.
   *                           - prefix (необязательно) Строка или регулярное
   *                                    выражение, с которого должно
   *                                    начинаться каждое сообщение для бота.
   *                                    Если не задавать, то обрабатываться
   *                                    будут все приходящие сообщения.
   *                           - prefixOnlyInChats (необязательно) Если true и есть prefix,
   *                                    то префикс будет проверяться только для сообщений из
   *                                    бесед.
   *                           - chats (необязатально) Массив с peer_id чатов,
   *                                    сообщения которых будут обрабатываться.
   *                                    Если не задавать, то обрабатываться
   *                                    будут все приходящие сообщения.
   */
  constructor (options = {}) {
    super()

    if (!options.token) throw new Error('Token can\'t be empty')
    this.token = options.token
    this.api = API(this.token)

    this.options = options

    // EventEmitter
    this._events = {}
    this._userEvents = []
  }

  /**
   * Отправка сообщений
   * @param text {String} Текст сообщения
   * @param peer {Number} peer_id, см. vk.com/dev/messages.send
   * @param params {Object} (Необязательно) Дополнительные параметры
   *
   * @returns {Promise}
   */
  send (text, peer, params = {}) {
    params.message = text
    params.peer_id = peer
    return this.api('messages.send', params)
  }

  /**
   * "Включить" бота, начать получать новые сообщения
   * @returns Объект бота
   */
  start () {
    this.on('update', this._update)
    poll(this)
    return this
  }

  /**
   * Остановить бота, отключить поллинг и
   * убрать все слушатели событий
   * @returns Объект бота
   */
  stop () {
    this._stop = true
    this.removeListener('update', this._update)
    this._events = {}
    return this
  }

  /**
   * Устанавливает слушатель на определенный шаблон сообщения
   * @param {RegEx} pattern
   * @param {Function} listener Функция, которой будет передан
   *                            объект сообщения LongPoll
   * @returns Объект бота
   */
  get (pattern, listener) {
    this._userEvents.push({
      pattern, listener
    })
    return this
  }

  /**
   * Не используйте это. Нужно для парсинга сообщений
   * и отправки события get
   */
  _update (update) {
    const text = update[6]
    const peer = update[3]
    const isChat = peer > 2e9

    if (!text) return
    if (this.options.chats && !this.options.chats.includes(peer)) return
    // если задан список чатов и сообщение не из них, то пропустить его

    if (this.options.prefix) {
      let p = this.options.prefx
      if (typeof p === 'string') p = new RegExp(`^${p}`)

      if (text.search(p) !== 0) { // если не начинается с префикса
        if (this.options.prefixOnlyInChats && isChat) return
      }
    }

    const ev = this._userEvents.find(({ pattern }) => pattern.test(text))

    if (!ev) {
      this.emit('command-notfound', update)
      return
    }

    ev.listener(update)
  }
}
