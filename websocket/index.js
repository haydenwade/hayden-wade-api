const connectionHandler = require('./connectionHandler');


class SocketIO {
    constructor(server){
        this.io = require('socket.io')(server);
        this.io.on('connection', connectionHandler)
    }
}

let instance;
const createInstance = (server)=>{
    if(!instance){
        instance = new SocketIO(server);
    }
    return instance;
}
module.exports = createInstance;