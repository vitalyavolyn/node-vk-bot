export default function Message (update) {
  this.id = update[1]
  this.peer_id = update[3]
  this.date = update[4]
  this.title = update[5]
  this.body = update[6]
  this.user_id = Number(update[7].from || update[3])
  this.attachments = update[7]
  delete this.attachments.from
}
