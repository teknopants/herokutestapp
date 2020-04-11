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

// Game Variables
function SetRandomGoalPos() {
    goalPos = {
        x: Math.floor(Math.random() * 20),
        y: Math.floor(Math.random() * 20)
    }
}
SetRandomGoalPos();

var levelWalls = [];
ClearLevel();
function ClearLevel() {
    for (var _x = 0; _x <= 20; _x++) {
        levelWalls[_x] = []
        for (var _y = 0; _y <= 20; _y++) {
            levelWalls[_x][_y] = 0;
        }
    }
}

const pointsToWin = 10;
var winnerID = -1;

// Add the WebSocket handlers
var players = {}
io.on('connection', socket => {

    socket.on('disconnect', function () {
        // remove disconnected player
        delete players[socket.id]
    })

    socket.on("new player", function () {
        players[socket.id] = {
            x: 0,
            y: 0,
            dead: false,
            points: 0,
            ping: 0,
            colorstring: "rgb(" + Math.random() * 255 + "," + Math.random() * 255 + "," + Math.random() * 255 + ")",
            name: "no name"
        }
    })

    socket.on('entered_name', (_name) => {
        var _player = players[socket.id] || {}
        _player.name = _name;
        console.log("player entered name : " + String(players[socket.id].name));
    })

    socket.on('player_state', function (position, _make_wall) {
        var _player = players[socket.id] || {}
        _player.x = position.x;
        _player.y = position.y;

        if (_make_wall) {
            levelWalls[_player.x][_player.y] = 1;
        }

    })

    socket.on('player_lost', (_socketID) => {
        players[_socketID].dead = true;
        console.log("player lost");
        var _all_dead = true;
        for (var id in players) {
            if (players[id].dead == false) {
                _all_dead = false;
                console.log("game not over because " + id + " is still alive");
                break;
            }
        }
        if (_all_dead) {
            SetupNewRound();
        }
    })

    socket.on("player_won", (_socketID) => {
        // give points to that player
        players[_socketID].points += 1;
        if (players[_socketID].points >= pointsToWin) {
            winnerID = _socketID;
            io.sockets.emit('total_winner', winnerID);
        }
        else {
            SetupNewRound();
        }
    })

    socket.on('restart_game', () => {
        for (var id in players) {
            players[id].points = 0;
            players[id].dead = false;
        }
        SetupNewRound();
    })

})

function SetupNewRound() {
    // change goal position
    SetRandomGoalPos();
    ClearLevel();
    // set players to random positions
    for (var id in players) {
        players[id].dead = false;
        players[id].position = {
            x: Math.floor(Math.random() * 20),
            y: Math.floor(Math.random() * 20)
        }
    }
    io.sockets.emit('new_round', players, goalPos);
}

setInterval(() => {
    io.sockets.emit('state', players, goalPos, levelWalls)
}, 1000 / 60)

// Starts the server./
server.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Starting server on port ${PORT}`)
})