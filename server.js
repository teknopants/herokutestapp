/**  
 * Server Script
 * @author Beau Blyth
*/

// Dependencies
var express = require('express');
var http = require('http');
var path = require('path');
var socketIO = require('socket.io');

const Game = require('./server/Game')

// Initialization
var app = express();
var server = http.Server(app);
var io = socketIO(server);
const game = new Game();

app.set('port', 5000);
app.use('/static', express.static(path.join(__dirname + '/static')));

// Routing
app.get('/', (request, response) => {
    response.sendFile(path.join(__dirname, 'index.html'));
});

// Starts the server.
server.listen(5000, function () {
    console.log('Starting server on port 5000');
});


// Add the WebSocket handlers
var players = {};
io.on('connection', function (socket) {

    socket.on('disconnect', function () {
        // remove disconnected player
    });

    socket.on('new player', function () {
        players[socket.id] = {
            x: 300,
            y: 300
        };
    });


    socket.on('playerPosition', function (data) {
        var player = players[socket.id] || {};

        player.x = data.x;
        player.y = data.y;

    });

});

setInterval(() => {
    game.Update();
    game.SendState();
    io.sockets.emit('state', players);
}, 1000 / 60);