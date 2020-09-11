require('dotenv').config()
const app = require('express')();
const server = require('http').createServer(app);

//App config
const config = require('./config');

//init websocket
const io = require('./websocket/io');
io(server);

//Request libs
const bodyParser = require('body-parser');
const multer = require('multer');
const upload = multer();
const cors = require('cors');
const jwt = require('express-jwt');
const jwks = require('jwks-rsa');

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

var jwtCheck = jwt({
    secret: jwks.expressJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: config.auth.jwksUri
    }),
    audience: config.auth.audience,
    issuer: config.auth.issuer,
    algorithms: ['RS256']
});


//Routes
const briefings = require('./rest/briefings');
const twilioSms = require('./rest/twilio-sms');

app.get('/healthcheck',(req,res)=>{
    res.status(200);
    res.end();
});
app.post('/sms', twilioSms)

//enables auth for all routes below this
app.use(jwtCheck);


app.get('/briefings/:feedName',[require('./middlewares/permissions.js')], briefings.get);
app.post('/briefings/:feedName',[upload.any(),require('./middlewares/permissions.js')], briefings.post);

//no matching route execute this
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

//start the server
server.listen(config.port);
console.log(`listening on port: ${config.port}`)

process.on('unhandledRejection', (err) => {
    if(err.stack.indexOf('aws-sdk')  !== -1 && err.message === 'TimeoutError'){
        return;
    }
    console.log(err);
});

process.on('uncaughtException', (err) => {
    console.log(err);
});