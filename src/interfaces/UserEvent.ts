import Message from './Message'
import MessageSendParams from './MessageSendParams'
import { VKResponse } from './APIResponses'

export default interface UserEvent {
  pattern: RegExp,
  listener(msg?: Message, exec?: RegExpExecArray, reply?: (text?: string, params?: MessageSendParams) => Promise<VKResponse>): void
}