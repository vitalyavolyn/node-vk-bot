export interface MessageSendParams {
  message?: string,
  peer_id?: number,
  random_id?: number,
  domain?: string,
  chat_id?: string,
  user_ids?: string, // list of comma-separated numbers
  lat?: number,
  long?: number,
  attachment?: string,
  forward_messages?: string,
  sticker_id?: number,

  // deprecated
  guid?: number
}