export default interface Message {
  id: number,
  peer_id: number,
  date: number,
  text: string,
  from_id: number,
  attachments: any,
  important: boolean,
  conversation_message_id: number,
  fwd_messages: any,
  payload?: string
}
