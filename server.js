/**  
 * Server Script
 * @author Beau Blyth
*/

// Dependencies
const express = require('express')
const http = require('http')
const path = require('path')
const socketIO = require('socket.io')
const Game = require('./static/Game')
const Constants = require('Constants')

const PORT = process.env.PORT || 5000


// Initialization
const app = express()
const server = http.Server(app)
const io = socketIO(server)

const game = new Game()

app.set('port', PORT)
app.use('/static', express.static(path.join(__dirname + '/static')))

// Routing
app.get('/', (request, response) => {
    response.sendFile(path.join(__dirname, 'static/index.html'))
})
app.listen(PORT, () => console.log(`Listening on ${PORT}`))

// Starts the server.
server.listen(PORT, function () {
    console.log('Starting server on port ' + PORT)
})


// Add the WebSocket handlers
var players = {}
io.on('connection', socket => {

    socket.on('disconnect', function () {
        console.log("server - player disconnected");
        // remove disconnected player
    })

    socket.on(Constants.SOCKET_NEW_PLAYER, function () {
        console.log("server - new player");
        game.addNewPlayer("Robot-" + socket, socket)
        players[socket.id] = {
            x: 300,
            y: 300
        }
    })

    socket.on('playerPosition', function (position, speed, timeStamp) {
        var _currentTime = (new Date()).getTime()
        var _timeElapsed = (_currentTime - timeStamp) / 1000
        var player = players[socket.id] || {}
        var nextPosition = {
            x: _timeElapsed * speed.x,
            y: _timeElapsed * speed.y
        }
        player.x = position.x + nextPosition.x
        player.y = position.y + nextPosition.y
        console.log("server - setting player " + socket.i + " position to " + player.x + " , " + player.y);
    })
})

setInterval(() => {
    //io.sockets.emit('state', players)
    game.update()
    game.sendState()
}, 1000 / 60)