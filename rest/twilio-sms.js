//webhook for twilio SMS
const twilioSmsHandler = (req, res) => {
    // const twiml = new MessagingResponse();

    console.log('got message', req)
    // twiml.message('some robots got this message'); //this replies back to user over sms

    res.writeHead(200, {'Content-Type': 'text/xml'}); //TODO is this needed for twilio to say OK
    res.end();
}

module.exports = twilioSmsHandler;