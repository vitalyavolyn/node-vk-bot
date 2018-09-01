import Message from './Message'
import MessageSendParams from './MessageSendParams'
import { VKResponse } from './APIResponses'
import { replyFunc } from '..'

export default interface UserEvent {
  pattern: RegExp,
  listener(msg?: Message, exec?: RegExpExecArray, reply?: replyFunc): void
}