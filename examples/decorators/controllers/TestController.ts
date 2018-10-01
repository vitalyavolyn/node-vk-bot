import {Bot, Get, Sticker, VkController, Voice} from '../../../src/'

@VkController()
export class TestController {
    constructor(private bot: Bot) {}

    @Get(/hi/)
    hi(message, exec, reply) {
        reply('Hello!')
    }

    @Voice()
    voice(msg) {
        this.bot.send('Wooow is voice message!', msg.peer_id)
    }

    @Sticker()
    sticker(msg) {
        this.bot.send('Wooow is sticker!', msg.peer_id)
    }

}