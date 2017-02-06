import { Message } from '..'

export interface UserEvent {
  pattern: RegExp,
  listener(msg?: Message, exec?: RegExpExecArray) : any
}