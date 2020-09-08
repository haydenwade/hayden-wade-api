const config = require('../config');
const tc = require('twilio')(config.awsAmplify.accountSid, config.awsAmplify.authToken);
const { Amplify, Interactions } = require('aws-amplify');

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
                //TODO: emit "typing event" - needs ui to implement
                tc.messages.create({
                    body: JSON.stringify({
                        text: data.text,
                        userSessionId: socket.id
                    }),
                    from: config.twilio.from,
                    to: config.twilio.to
                }).then(message => {
                    if(!message.errorCode && !message.errorMessage){
                        const interval = setInterval(() => {
                            tc.calls(message.sid).fetch().then(call => {
                                console.log('polling call:', call)
                            })
                        }, 10000);
                        
                        setTimeout(()=>{
                            clearInterval(interval)
                        },600000) //10 minutes
                    }
                });
            }

        }
        catch (err) {
            console.log('boom', err)
        }

    });

    socket.on('disconnect', () => {
        console.log('disconnected');
    });
}

module.exports = connectionHandler;