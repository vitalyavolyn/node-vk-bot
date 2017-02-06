export interface Message {
  id: number,
  peer_id: number,
  date: number,
  title: string,
  body: string,
  user_id: number,
  attachments: any
}
