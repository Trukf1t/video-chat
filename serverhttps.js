const express = require('express')
const app = express()

const https = require('https')
const port = process.env.PORT || 3000;

const fs = require('fs');
const server = https.createServer({
        key: fs.readFileSync('./certssl/key-20200329-184543.pem'),
        cert: fs.readFileSync('./certssl/cert-20200329-184543.crt')
    }, app).listen(port, function(){
    console.log("My https server listening on port " + port + "...");
});

const io = require('socket.io').listen(server);


app.use(express.static(__dirname + "/public"))
let clients = 0

io.on('connection', function (socket) {
    socket.on("NewClient", function () {
        if (clients < 2) {
            if (clients == 1) {
                this.emit('CreatePeer')
            }
        }
        else
            this.emit('SessionActive')
        clients++;
    })
    socket.on('Offer', SendOffer)
    socket.on('Answer', SendAnswer)
    socket.on('disconnect', Disconnect)
})

function Disconnect() {
    if (clients > 0) {
        if (clients <= 2)
            this.broadcast.emit("Disconnect")
        clients--
    }
}

function SendOffer(offer) {
    this.broadcast.emit("BackOffer", offer)
}

function SendAnswer(data) {
    this.broadcast.emit("BackAnswer", data)
}


