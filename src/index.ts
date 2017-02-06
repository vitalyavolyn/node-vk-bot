import { EventEmitter } from 'events'
import * as rq from 'request-promise-native'
import * as fs from 'fs'
import Message from './functions/Message'
import poll from './functions/poll'

export interface Options {
  token: string,
  prefix?: RegExp,
  prefixOnlyInChats?: boolean,
  chats?: number[],
  api?: { lang?: string, v?: number}
}

export interface Message {
  id: number,
  peer_id: number,
  date: number,
  title: string,
  body: string,
  user_id: number,
  attachments: Object
}

export interface UserEvent {
  pattern: RegExp,
  listener(msg?: Message, exec?: RegExpExecArray) : any
}

export default class Bot extends EventEmitter {
  _events: Object = {}
  _userEvents: UserEvent[] = []
  _stop: boolean = false

  constructor (public options: Options) {
    super()

    if (!options.token) throw new Error('Token can\'t be empty')
    this.options = options
  }

  /**
   * Access VK API
   * @param method
   * @param params Optional request params
   *
   * @returns {Promise}
   */
  api (method: string, params: any = {}) {
    let o = this.options
    if (o.api) {
      params.v = params.v || o.api.v || 5.62
      params.lang = params.lang || o.api.lang
      if (params.lang === undefined) delete params.lang
    } else params.v = params.v || 5.62

    params.access_token = this.options.token

    return rq({
      baseUrl: 'https://api.vk.com',
      uri: '/method/' + method,
      form: params,
      method: 'POST',
      json: true
    }).then(res => {
      if (res.error) {
        throw res.error
      }
      return res.response
    })
  }

  /**
   * Send messages
   * @param text Message text
   * @param peer peer_id (https://vk.com/dev/messages.send)
   *
   * @returns {Promise}
   */
  send (text: string, peer: number, params: any = {}) {
    params.message = text
    params.peer_id = peer
    return this.api('messages.send', params)
  }

  /**
   * Start polling
   * @returns The bot object
   */
  start () {
    this.on('update', this._update)
    poll(this)
    return this
  }

  stop () {
    this._stop = true
    this.removeListener('update', this._update)
    this._events = {}
    return this
  }

  /**
   * Listens on specific message matching the RegExp pattern
   * @param pattern
   * @returns The bot object
   */
  get (pattern: RegExp, listener: (msg?: Message, exec?: RegExpExecArray) => any) {
    this._userEvents.push({
      pattern, listener
    })
    return this
  }

  /**
   * Upload photo
   * @returns {Promise}
   */
  uploadPhoto (path: string) {
    return this.api('photos.getMessagesUploadServer')
      .then(server => rq({
        method: 'POST',
        uri: server.upload_url,
        formData: {
          photo: fs.createReadStream(path)
        },
        json: true
      }))
      .then(upload => this.api('photos.saveMessagesPhoto', {
        server: upload.server,
        photo: upload.photo,
        hash: upload.hash
      }))
      .then(photos => photos[0])
  }

  private _update (update) {
    const text = update[6]
    const peer = update[3]
    const isChat = peer > 2e9

    if (!text) return
    if (this.options.chats && !this.options.chats.includes(peer)) return

    if (this.options.prefix) {
      const p = this.options.prefix
      if (text.search(p) !== 0) { // not starts with prefix
        if (!this.options.prefixOnlyInChats) return
        if (this.options.prefixOnlyInChats && isChat) return
      }
    }

    const ev = this._userEvents.find(({ pattern }) => pattern.test(text))

    if (!ev) {
      this.emit('command-notfound', Message(update))
      return
    }

    ev.listener(Message(update), ev.pattern.exec(text))
  }
}

(module).exports = Bot