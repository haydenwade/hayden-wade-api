const client = require('twilio');
const config = require('../config');
const socket = require('../websocket/io')();

//webhook for twilio SMS
const twilioSmsHandler = (req, res) => {
    if (client.validateRequest(config.twilio.authToken, req.headers['x-twilio-signature'], config.twilio.webhookEndpoint, req.body)) {
        console.log('valid sms request');
        //parse message, ex: "Sent from your Twilio trial account - {\"text\":\"load\",\"userSessionId\":\"Ms-INqtdsyaAIWOpAAAA\"}\nHaha I'm glad you had fun"
        const body = req.body.Body;
        const index = body.indexOf('userSessionId');
        const newLineIndex = body.indexOf('\n');
        const bracketIndex = body.indexOf('}');
        const length = bracketIndex - index - 17;
        const userSessionId = body.substr(index + 16, length);
        const msg = body.substr(newLineIndex + 1, body.length);

        //emit event to websocket
        socket.io.to(userSessionId).emit('event', { text: msg });
        socket.clearWaitingForText(userSessionId);

        res.status(200);
    } else {
        console.log('invalid sms request');
        res.status(401);
    }
    res.end();
}

module.exports = twilioSmsHandler;