import {Bot} from '../../src'

const bot = new Bot({
    token: 'TOKEN',
    group_id: 123456,
    controllers: [__dirname + '/controllers/*.ts']
}).start()