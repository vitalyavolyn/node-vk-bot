import { EventEmitter } from 'events'
import * as rq from 'request-promise-native'
import * as fs from 'fs'

import UpdateToObj from './functions/UpdateToObj'
import poll from './functions/poll'

import { VKError, VKExecuteResponse, VKResponse } from './interfaces/APIResponses'
import { UploadedPhoto } from './interfaces/UploadedPhoto'
import { Message } from './interfaces/Message'
import { UserEvent } from './interfaces/UserEvent'
import { MessageSendParams } from './interfaces/MessageSendParams'

export interface Options {
  token: string,
  prefix?: RegExp,
  prefixOnlyInChats?: boolean,
  chats?: number[],
  api?: { lang?: string, v?: number}
}

export class Bot extends EventEmitter {
  _events: Object = {}
  _userEvents: UserEvent[] = []
  _stop: boolean = false

  constructor (public options: Options) {
    super()

    if (!options.token) throw new Error('Token can\'t be empty')
  }

  /**
   * Access VK API
   * @param method
   * @param params Optional request params
   *
   * @returns {Promise}
   */
  api (method: string, params: any = {}) : Promise<VKResponse | VKExecuteResponse> {
    let o = this.options
    if (o.api) {
      params.v = params.v || o.api.v || 5.62
      params.lang = params.lang || o.api.lang
      if (params.lang == null) delete params.lang
    } else params.v = params.v || 5.62

    params.access_token = this.options.token

    return rq({
      baseUrl: 'https://api.vk.com',
      uri: '/method/' + method,
      form: params,
      method: 'POST',
      json: true
    }).then(res => {
      if (/execute/.test(method)) { // there may be errors and responses in same object
        return res as VKExecuteResponse
      } else if (res.error) {
        throw res.error as VKError
      }
      return res.response as VKResponse
    })
  }

  /**
   * Send messages
   * @param text Message text
   * @param peer peer_id (https://vk.com/dev/messages.send)
   *
   * @returns {Promise}
   */
  send (text: string, peer: number, params: MessageSendParams = {}) : Promise<VKResponse> {
    params.message = params.message || text
    params.peer_id = params.peer_id || peer
    return this.api('messages.send', params)
  }

  /**
   * Start polling
   * @param {number} poll_delay A delay before a restart of the Long Poll client
   * @returns The bot object
   */
  start (poll_delay?: number) {
    this.on('update', this._update)
    poll(this, poll_delay)
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
  uploadPhoto (path: string) : Promise<UploadedPhoto> {
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
      .then(photos => photos[0] as UploadedPhoto)
  }

  /**
   * The internal update event listener, used to parse messages and fire
   * get events - YOU SHOULD NOT USE THIS
   *
   * @param {object} update
   */
  private _update (update) {
    const text : string = update[6]
    const peer : number = update[3]
    const flag : number = update[2]
    const isChat = peer > 2e9
    const isOutcoming = flag & 2
    const hasAttachments : boolean = !!Object.keys(update[7]).length

    if (!text && !hasAttachments) return
    if (this.options.chats && this.options.chats.length && !this.options.chats.includes(peer)) return

    if (this.options.prefix) {
      const p = this.options.prefix
      if (text.search(p) !== 0) { // not starts with prefix
        if (!this.options.prefixOnlyInChats) return
        if (this.options.prefixOnlyInChats && (isChat || isOutcoming)) return
      }
    } else {
      if (isOutcoming) return
    }
    const ev = this._userEvents.find(({ pattern }) => pattern.test(text))

    if (!ev) {
      this.emit('command-notfound', UpdateToObj(update))
      return
    }

    ev.listener(UpdateToObj(update), ev.pattern.exec(text))
  }
}

export {
  Message,
  UploadedPhoto,
  VKError,
  VKExecuteResponse,
  VKResponse,
  UserEvent,
  MessageSendParams
}
