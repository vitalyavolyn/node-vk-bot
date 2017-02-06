import { Message } from '..'
export default function UpdateToObj (update) {
  let msg = {
    id: update[1],
    peer_id: update[3],
    date: update[4],
    title: update[5],
    body: update[6],
    user_id: Number(update[7].from || update[3]),
    attachments: update[7],
  }
  delete msg.attachments.from
  return msg as Message
}
