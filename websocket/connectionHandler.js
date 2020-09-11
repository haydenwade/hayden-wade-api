const config = require('../config');
const tc = require('twilio')(config.awsAmplify.accountSid, config.awsAmplify.authToken);
const { Amplify, Interactions } = require('aws-amplify');
const x = require('./io');
const io = x();

Amplify.configure({
    Auth: {
        identityPoolId: config.awsAmplify.authIdentityPoolId,
        region: 'us-east-1'
    },
    Interactions: {
        bots: {
            "HaydenWade": {
                "name": "HaydenWade",
                "alias": "$LATEST",
                "region": "us-east-1",
            },
        }
    }
});

const connectionHandler = (socket) => {
    console.log('new connection');
    socket.on('event', async data => {

        try {
            const res = await Interactions.send('HaydenWade', data.text);

            if (res.dialogState === 'Fulfilled') {
                socket.emit('event', { text: res.message })
            } else {
                console.log('no response lets text hayden')
                tc.messages.create({
                    body: JSON.stringify({
                        text: data.text,
                        userSessionId: socket.id
                    }),
                    from: config.twilio.from,
                    to: config.twilio.to
                });
                io.setWaitingForText(socket.id);
            }
        }
        catch (err) {
            console.log(err)
        }

    });

    socket.on('disconnect', () => {
        console.log('disconnected');
    });
}

module.exports = connectionHandler;