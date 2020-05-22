const express = require('express')
const app = express()
const http = require('http').Server(app)
const io = require('socket.io')(http)
const port = process.env.PORT || 3000;

let activeSockets = [] // Array to store all te active sockets

app.use(express.static(__dirname + "/public"))

app.set('view engine', 'hbs'); // Handlebars, this is to send informcion from server to front(index.html)...trukfit

app.get('/', (req, res)=>{
    res.render('index',{
        mysocket: activeSockets[0]
    });
})

app.use(ignoreFavicon);

function ignoreFavicon(req, res, next) {
    if (req.originalUrl === '/favicon.ico') {
      res.status(204).json({nope: true});
    } else {
      next();
    }
  }

let clients = 0

io.on('connection', function (socket) {
    
    const existingSocket = activeSockets.find(
        existingSocket => existingSocket === socket.id
    );
    
    if (!existingSocket) {
        activeSockets.push(socket.id);
        console.log(`Lista de sockets ${activeSockets}`);
        socket.emit("update-user-list", {
          users: activeSockets.filter(
            existingSocket => existingSocket !== socket.id
          ),
          myuser: activeSockets.find(
            existingSocket => existingSocket === socket.id
          )
        });

        socket.broadcast.emit("update-user-list", {
          users: [socket.id],
          myuser: existingSocket
        });
    }

    socket.on("NewClient", function () {
        if (clients < 2) {            
            if (clients == 1) {                
                this.emit('CreatePeer')
                console.log(`Second user socket: ${socket.id}`);
            }else{
                console.log(`My socket: ${socket.id}`);
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
        //activeSockets.pop()
    }
}

function SendOffer(offer) {
    this.broadcast.emit("BackOffer", offer)
}

function SendAnswer(data) {
    this.broadcast.emit("BackAnswer", data)
}

http.listen(port, () => console.log(`Active on ${port} port`))


