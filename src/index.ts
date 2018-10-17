import { EventEmitter } from 'events'
import * as rq from 'request-promise-native'
import * as fs from 'fs'
import * as stream from 'stream'

import poll from './functions/poll'

import { VKError, VKExecuteResponse, VKResponse } from './interfaces/APIResponses'
import UploadedPhoto from './interfaces/UploadedPhoto'
import Message from './interfaces/Message'
import UserEvent from './interfaces/UserEvent'
import MessageSendParams from './interfaces/MessageSendParams'
import { build } from './decorators/builder'
import Keyboard, { KeyboardColor } from './Keyboard'

export interface Options {
  token: string,
  api?: { lang?: string, v?: string },
  group_id: number,
  controllers?: string[]
}

export type replyFunc = (text?: string, params?: MessageSendParams) => Promise<VKResponse>

export class Bot extends EventEmitter {
  _events: Object = {}
  _userEvents: UserEvent[] = []
  _stop: boolean = false

  constructor(public options: Options) {
    super()

    if (!options.token) throw new Error('token can\'t be empty')
    if (!options.group_id) throw new Error('group_id can\'t be empty')
    if (options.api && Number(options.api.v) < 5.80) throw new Error('API version must be > 5.80')
    if (options.controllers && options.controllers.length) build(this, options.controllers)
  }

  /**
   * Access VK API
   */
  api(method: string, params: any = {}): Promise<VKResponse | VKExecuteResponse> {
    let o = this.options
    if (o.api) {
      params.v = params.v || o.api.v || '5.80'
      params.lang = params.lang || o.api.lang
      if (params.lang == null) delete params.lang
    } else params.v = params.v || '5.80'

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
   */
  send(text: string, peer: number, params: MessageSendParams = {}): Promise<VKResponse> {
    params.message = params.message || text
    params.peer_id = params.peer_id || peer

    if (params.keyboard && params.keyboard instanceof Keyboard) {
      params.keyboard = params.keyboard.toString()
    }

    return this.api('messages.send', params)
  }

  /**
   * Process Callback API response when using webhook
   */
  processUpdate(res: any) {
    if (res.type === 'message_new') return this._update(res)
  }

  /**
   * Start polling
   */
  start(poll_delay?: number) {
    this.on('update', this._update)
    poll(this, poll_delay)
    return this
  }

  stop() {
    this._stop = true
    this.removeListener('update', this._update)
    this._events = {}
    return this
  }

  /**
   * Listens on specific message matching the RegExp pattern
   */
  get(pattern: UserEvent['pattern'], listener: UserEvent['listener']) {
    this._userEvents.push({
      pattern, listener
    })
    return this
  }

  getPayload(jsonString: string, listener: (msg?: Message, reply?: replyFunc) => void) {
    this.on('payload', (msg, reply) => {
      if (JSON.stringify(JSON.parse(msg.payload)) === JSON.stringify(JSON.parse(jsonString))) {
        listener(msg, reply)
      }
    })
  }

  /**
   * Upload photo
   */
  uploadPhoto(photo: string | stream.Stream): Promise<UploadedPhoto> {
    let photoStream: stream.Stream
    if (typeof photo === 'string') {
      photoStream = fs.createReadStream(photo)
    } else if (photo instanceof stream.Stream) {
      photoStream = photo
    }

    return this.api('photos.getMessagesUploadServer')
      .then(server => rq({
        method: 'POST',
        uri: server.upload_url,
        formData: {
          photo: photoStream
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
   * The internal update event listener,
   * used to parse messages and fire
   * get events - YOU SHOULD NOT USE THIS
   */
  private _update(update: { object?, group_id: number }) {
    if (update.group_id !== this.options.group_id) return

    let msg = update.object || false
    if (!msg) return false

    const hasAttachments: boolean = msg.attachments && msg.attachments.length || false

    const message: Message = {
      id: msg.id,
      peer_id: msg.peer_id,
      from_id: msg.from_id,
      date: msg.date,
      text: msg.text,
      attachments: msg.attachments,
      important: msg.important,
      conversation_message_id: msg.conversation_message_id,
      fwd_messages: msg.fwd_messages
    }

    const reply = (text: string, params: MessageSendParams = {}) => this.send(text, message.peer_id, params)

    if (msg.payload) {
      message.payload = msg.payload
      this.emit('payload', msg, reply)
    }

    if (hasAttachments && msg.attachments[0].type === 'sticker') return this.emit('sticker', message)
    if (hasAttachments && msg.attachments[0].type === 'doc' && msg.attachments[0].doc.preview.audio_msg) return this.emit('voice', message)

    if (!message.text && !hasAttachments) return

    const ev = this._userEvents.find(({ pattern }) => pattern.test(message.text))

    if (!ev) {
      this.emit('command-notfound', message)
      return
    }

    ev.listener(
      message,
      ev.pattern.exec(message.text),
      reply
    )
  }
}

export {
  Message,
  UploadedPhoto,
  VKError,
  VKExecuteResponse,
  VKResponse,
  UserEvent,
  MessageSendParams,
  Keyboard,
  KeyboardColor
}

export * from './decorators'