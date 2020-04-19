/**  
 * Server Script
 * @author Beau Blyth
*/

// Dependencies
const express = require('express')
const http = require('http')
const path = require('path')
const socketIO = require('socket.io')

const PORT = process.env.PORT || 5000

// Initialization
const app = express()
const server = http.Server(app)
const io = socketIO(server)

app.set('port', PORT)
app.use('/static', express.static(path.join(__dirname + '/static')))

// Routing
app.get('/', (request, response) => {
    response.sendFile(path.join(__dirname, 'static/index.html'))
})

// Add the WebSocket handlers
var playerData = {}
io.on('connection', socket => {

    socket.on('disconnect', function () {
        // remove disconnected player
        delete playerData[socket.id]
    })


    socket.on("new player", function (player_x, player_y) {
        playerData[socket.id] = {
            x: player_x,
            y: player_y,
            ping: 0,
            colorstring: "rgb(" + Math.random() * 255 + "," + Math.random() * 255 + "," + Math.random() * 255 + ")"
        }
    })

    socket.on('entered_name', (_name) => {
        var _player = playerData[socket.id] || {}
        _player.name = _name;
        console.log("player entered name : " + String(playerData[socket.id].name));
    })

    socket.on('player_click', function (x, y) {
        var _player = playerData[socket.id] || {}
        _player.x = x;
        _player.y = y;
    })

})

setInterval(() => {
    io.sockets.emit('state', playerData)
}, 1000 / 60)

// Starts the server./
server.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Starting server on port ${PORT}`)
})