export default function Message (update) {
  this.id = update[1]
  this.peer_id = update[3]
  this.date = update[4]
  this.title = update[5]
  this.body = update[6]
  this.user_id = update[7].from
  this.attachments = update[7]
  delete this.attachments.from
}
