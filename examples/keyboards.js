const express = require('express');
const bodyParser = require('body-parser');
const { Bot } = require('node-vk-bot');
const bot = new Bot({
    token: 'Community API token',
    group_id: 123456
});

const port = 8000;
const app = express();

app.use(bodyParser.json());

app.post('/bot', (req, res) => {
    if (req.body.type == 'confirmation') return res.send('CONFIRMATION CODE');
    bot.processUpdate(req.body);
    res.sendStatus(200);
});

app.listen(port, () => {
    console.log(`Express server is listening on ${port}`);
});

bot.get(/Hi|Hello|Hey/i, message => {
    bot.send('Hello!', message.peer_id, {
        keyboard: JSON.stringify({
            one_time: true,
            buttons: [
                {
                    action: {
                        type: 'text',
                        label: 'Red'
                    },
                    color: 'negative'
                },
                {
                    action: {
                        type: 'text',
                        label: 'Green'
                    },
                    color: 'positive'
                },
            ]
        })
    });
});

bot.get(/Red|Green/, msg => bot.send('You clicked a button - ' + msg.body, msg.peer_id))