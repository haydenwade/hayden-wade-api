const config = {
    port: process.env.PORT || 3000,
    auth:{
        issuer: 'https://haydenty.auth0.com/',
        jwksUri: 'https://haydenty.auth0.com/.well-known/jwks.json',
        audience:'http://vi.com',
        userInfo: 'https://haydenty.auth0.com/userinfo',
        domain:'https://haydenwade.com'
    },
    s3bucket:{
        region: 'us-east-1',
        accessKeyId: process.env.S3_ACCESS_KEY_ID,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
        bucketName: 'hayden-wade'
    },
    awsAmplify:{
        accountSid : process.env.AWS_AMPLIFY_ACCOUNT_SID,
        authToken: process.env.AWS_AMPLIFY_AUTH_TOKEN,
        authIdentityPoolId: process.env.AWS_AMPLIFY_AUTH_IDENTITY_POOL_ID
    },
    twilio:{
        from: process.env.TWILIO_FROM,
        to: process.env.TWILIO_TO,
        authToken: process.env.TWILIO_AUTH_TOKEN,
        webhookEndpoint: process.env.TWILIO_WEBHOOK_ENDPOINT || 'https://fc1a36a8a70c.ngrok.io/sms'
    }
};

module.exports = config;