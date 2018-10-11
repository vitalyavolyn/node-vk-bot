import Keyboard from '../Keyboard'

export default interface MessageSendParams {
  message?: string,
  peer_id?: number,
  random_id?: number,
  domain?: string,
  chat_id?: string,
  user_ids?: string, // list of comma-separated numbers, max 100
  lat?: number,
  long?: number,
  attachment?: string,
  forward_messages?: string | number,
  sticker_id?: number,
  keyboard?: string | Keyboard,
  payload?: any
}