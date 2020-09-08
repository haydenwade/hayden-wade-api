const connectionHandler = require('./connectionHandler');


class SocketIO {
    constructor(server){
        this.io = require('socket.io')(server);
        this.io.on('connection', connectionHandler)
    }
}


module.exports = SocketIO;