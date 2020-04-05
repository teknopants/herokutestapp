/**  
 * Server Script
 * @author Beau Blyth
*/

console.log("server.js starting");

// Dependencies
console.log("loading express");
const express = require('express');

console.log("loading http");
const http = require('http');
console.log("loading path");
const path = require('path');
console.log("loading socket.io");
const socketIO = require('socket.io');


// Initialization
console.log("app = express()");
const app = express();
const server = http.Server(app);
const io = socketIO(server);

console.log("setting port 5000");
app.set('port', 5000);
console.log("use static");
app.use('/static', express.static(path.join(__dirname + '/static')));

console.log("routing");
// Routing
app.get('/', (request, response) => {
    response.sendFile(path.join(__dirname, 'static/index.html'));
});

console.log("start server");
// Starts the server.
server.listen(5000, function () {
    console.log('Starting server on port 5000');
});


console.log("add websocket handlers");
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

    socket.on('playerPosition', function (position, speed, timeStamp) {
        var _currentTime = (new Date()).getTime();
        var _timeElapsed = (_currentTime - timeStamp) / 1000;
        var player = players[socket.id] || {};
        var nextPosition = {
            x: _timeElapsed * speed.x,
            y: _timeElapsed * speed.y
        }
        player.x = position.x + nextPosition.x;
        player.y = position.y + nextPosition.y;

    });

});


console.log("set interval");
setInterval(function () {
    console.log("sending state");
    io.sockets.emit('state', players);
}, 1000 / 60);
