const connectionHandler = require('./connectionHandler');


class SocketIO {
    constructor(server) {
        this.io = require('socket.io')(server);
        this.io.on('connection', connectionHandler)
        this.waitingTextsTimeouts = new Map();
    }
    clearWaitingForText(userSessionId) {
        const timeout = this.waitingTextsTimeouts.get(userSessionId);
        clearTimeout(timeout);
        this.waitingTextsTimeouts.delete(userSessionId);
    }
    setWaitingForText(userSessionId) {
        const timeout = setTimeout(() => {
            this.io.to(userSessionId).emit('event', { text: 'Sorry I don\'t know that one and unfortunately Hayden is not around to answer it. If it is urgent regarding one of Hayden\'s services please send an email to solutions@haydenwade.com.' });
            this.waitingTextsTimeouts.delete(userSessionId);
        }, 120000)//2 minutes
        this.waitingTextsTimeouts.set(userSessionId, timeout);
    }
}

let instance;
const createInstance = (server) => {
    if (!instance) {
        instance = new SocketIO(server);
    }
    return instance;
}
module.exports = createInstance