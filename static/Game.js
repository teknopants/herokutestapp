var goal = {
    position: {
        x: -1,
        y: -1
    }
}

const Vector2 = {
    Zero: function () {
        return {
            x: 0,
            y: 0
        }
    }
}

const KEYSTATE_PRESSED = 1;
const KEYSTATE_HELD = 2;
const KEYSTATE_RELEASED = -1;
const KEYSTATE_NONE = 0;
var keyStates = {
    right: KEYSTATE_NONE,
    left: KEYSTATE_NONE,
    up: KEYSTATE_NONE,
    down: KEYSTATE_NONE
}

var levelSize = {
    width: 20,
    height: 20
}

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

var winnerID = -1;

const STATE_ENTERNAME = -1;
const STATE_GAME = 0;
const STATE_WINNER = 1;
var state = STATE_ENTERNAME;

function ChangeState(_state) {
    timeElapsed = 0;
    state = _state;
    StateMachineStep();
}

function StateMachineStep() {
    switch (state) {
        case STATE_GAME:
            break;

        case STATE_WINNER:
            if (timeElapsed > 2) {
                winnerID = -1;
                player.dead = false;
                player.frozen = false;
                socket.emit('restart_game', socket.id);
                ChangeState(STATE_GAME);
            }
            break;
    }
}

// Player Class
class Player {
    constructor(x, y) {
        this.position = {};
        this.position.x = x;
        this.position.y = y;
        this.canMoveTimer = 0;
        this.dead = false;
        this.frozen = false;
    }

    Update(dt) {
        if (!this.dead && !this.frozen) {

            var _make_wall = true;
            this.canMoveTimer = Approach(this.canMoveTimer, 0, dt);

            // Move Player
            if (this.canMoveTimer == 0) {
                if (VectorMagnitude(inputDirection) > 0.1) {
                    this.position.x += inputDirection.x;
                    this.position.y += inputDirection.y;
                    this.canMoveTimer = .05;

                    this.position.x = Loop(this.position.x, 0, levelSize.width);
                    this.position.y = Loop(this.position.y, 0, levelSize.height);

                    // check collision against walls
                    if (levelWalls[this.position.x][this.position.y] == 1) {
                        this.dead = true;
                        socket.emit('player_lost', socket.id);
                    }

                    // touched goal
                    if (this.position.x == goal.position.x && this.position.y == goal.position.y) {
                        socket.emit('player_won', socket.id);
                        _make_wall = false;
                    }
                }
            }

            socket.emit('player_state', this.position, _make_wall);
        }
    }
}


// our local player
var player = new Player(Math.floor(Math.random() * levelSize.width), Math.floor(Math.random() * levelSize.height));

function CurrentTime() {
    return (new Date()).getTime();
}

var timeStamp = CurrentTime();
var timeElapsed = 0;

// Socket Stuff
var socket = io();

socket.emit('new player');

document.addEventListener('keyup', function (event) {
    switch (event.keyCode) {
        case 37: // A
            keyStates.left = KEYSTATE_RELEASED;
            break;
        case 38: // W
            keyStates.up = KEYSTATE_RELEASED;
            break;
        case 39: // D
            keyStates.right = KEYSTATE_RELEASED;
            break;
        case 40: // S
            keyStates.down = KEYSTATE_RELEASED;
            break;
    }
});


var my_name = "";
var keyboard_string = "";

document.onkeypress = function (e) {
    e = e || window.event;
    var charCode = (typeof e.which == "number") ? e.which : e.keyCode;
    if (charCode) {
        keyboard_string += String.fromCharCode(charCode);
        my_name = String(keyboard_string);
    }
};

document.addEventListener('keydown', function (event) {
    switch (event.keyCode) {
        case 37: // A
            if (keyStates.left <= 1)
                keyStates.left = KEYSTATE_PRESSED;
            break;
        case 38: // W
            if (keyStates.up <= 1)
                keyStates.up = KEYSTATE_PRESSED;
            break;
        case 39: // D
            if (keyStates.right <= 1)
                keyStates.right = KEYSTATE_PRESSED;
            break;
        case 40: // S
            if (keyStates.down <= 1)
                keyStates.down = KEYSTATE_PRESSED;
            break;
        case 13: // ENTER
            if (state == STATE_ENTERNAME) {
                my_name = String(keyboard_string);
                console.log("name input = " + my_name);
                socket.emit('entered_name', my_name);
                keyboard_string = "";
                ChangeState(STATE_GAME);
            }
            break;
    }
});


function GetTimeDifference() {
    var currentTime = (new Date()).getTime();
    var timeDifference = (currentTime - timeStamp) / 1000;
    timeStamp = currentTime;
    return timeDifference;
}

var inputDirection = Vector2.Zero();

// Update
setInterval(function () {

    var _dt = (CurrentTime() - timeStamp) / 1000;
    timeElapsed += _dt;
    timeStamp = CurrentTime();

    if (state == STATE_ENTERNAME) {

    }
    if (state == STATE_GAME) {
        // input
        inputDirection = Vector2.Zero();
        if (CheckHeld(keyStates.right)) {
            inputDirection.x = 1;
        }
        if (CheckHeld(keyStates.left)) {
            inputDirection.x = -1;
        }
        if (CheckHeld(keyStates.up)) {
            inputDirection.y = -1;
        }
        if (CheckHeld(keyStates.down)) {
            inputDirection.y = 1;
        }

        player.Update(_dt);

        // process key states
        keyStates.right = ProcessKey(keyStates.right);
        keyStates.up = ProcessKey(keyStates.up);
        keyStates.left = ProcessKey(keyStates.left);
        keyStates.down = ProcessKey(keyStates.down);
    }

    StateMachineStep();

}, 1000 / 60);


// Draw Game
var canvas = document.getElementById('canvas');
canvas.width = 800;
canvas.height = 800;
var context = canvas.getContext('2d');

socket.on('state', function (players, goalPos, _levelWalls) {

    // update local objects
    levelWalls = _levelWalls;
    goal.position = goalPos;

    // render screen
    context.clearRect(0, 0, canvas.width, canvas.height);

    var _grid_step = canvas.width / levelSize.width;

    if (state == STATE_ENTERNAME) {

        context.fillStyle = 'black';
        context.textAlign = 'center';
        context.font = 'italic 18pt Calibri';
        context.fillText("Type your name and press enter:", 400, 200 - 20);
        context.fillText(keyboard_string, 400, 400 - 20);
    }
    else {
        // Walls
        for (var _x = 0; _x <= levelSize.width; _x++) {
            for (var _y = 0; _y <= levelSize.height; _y++) {
                if (levelWalls[_x][_y] == 1) {

                    context.fillStyle = 'black';
                    context.beginPath();
                    context.arc(_x * _grid_step, _y * _grid_step, 16, 0, 2 * Math.PI);
                    context.fill();
                }
            }
        }

        // other players/
        for (var id in players) {
            var _player = players[id];
            context.fillStyle = _player.colorstring;

            if (id != socket.id) {
                context.beginPath();
                var _size = 16 + _player.points * 4;
                if (_player.dead)
                    _size = 17 + _player.points * 4 + Math.random() * 3;
                if (winnerID == id) {
                    _size += timeElapsed * timeElapsed * 800;
                }
                context.arc(_player.x * _grid_step, _player.y * _grid_step, _size, 0, 2 * Math.PI);
                context.fill();

                context.fillStyle = 'black';
                context.textAlign = 'center';
                context.font = 'italic 18pt Calibri';
                context.fillText(_player.name, _player.x * _grid_step, _player.y * _grid_step - (20 + _player.points * 4) + 2);

                context.fillStyle = _player.colorstring;
                context.textAlign = 'center';
                context.font = 'italic 18pt Calibri';
                context.fillText(_player.name, _player.x * _grid_step, _player.y * _grid_step - (20 + _player.points * 4));

            }
        }

        //goal
        context.fillStyle = 'blue';
        context.beginPath();
        context.arc(goal.position.x * _grid_step, goal.position.y * _grid_step, 25 + Math.sin(timeElapsed * 30) * 10 + Math.random(), 0, 2 * Math.PI);
        context.fill();

    }

    DrawLocalPlayer(context, players, _grid_step);

    if (state == STATE_WINNER) {

        var _winningPlayer = players[winnerID];
        var _winningPlayerName = _winningPlayer.name;
        context.fillStyle = 'black';
        context.textAlign = 'center';
        context.font = 'bold 40pt Calibri';
        context.fillText(_winningPlayerName + " wins!", 400, 400);
    }
    /*
    context.textAlign = 'center';
    context.font = 'italic 12pt Calibri';
    context.fillText(keyboard_string, player.position.x * _grid_step, player.position.y * _grid_step - 40);
    */

});

// when a new round has started
socket.on('new_round', (players, goalPos) => {
    player.position = players[socket.id].position;
    player.dead = false;
    levelWalls
    goal.position = goalPos;
    ClearLevel();
})

socket.on('total_winner', (_winnerID) => {
    ChangeState(STATE_WINNER);
    player.frozen = true;
    winnerID = _winnerID;
})

function DrawLocalPlayer(context, players, _grid_step) {
    //local player
    var _player = players[socket.id] || {}
    var _points = _player.points;
    var _name = _player.name;
    var _size = 16 + _points * 4 + 2 + Math.sin(timeElapsed * 40) * 2;
    if (player.dead)
        _size = 17 + _points * 4 + Math.random() * 3;
    if (winnerID == socket.id) {
        _size += timeElapsed * timeElapsed * 800;
    }

    context.fillStyle = _player.colorstring;
    context.beginPath();
    context.arc(player.position.x * _grid_step, player.position.y * _grid_step, _size, 0, 2 * Math.PI);
    context.fill();

    context.fillStyle = 'black';
    context.textAlign = 'center';
    context.font = 'italic 18pt Calibri';
    context.fillText(_name, player.position.x * _grid_step, player.position.y * _grid_step - (20 + _points * 4) + 2);

    context.fillStyle = _player.colorstring;
    context.textAlign = 'center';
    context.font = 'italic 18pt Calibri';
    context.fillText(_name, player.position.x * _grid_step, player.position.y * _grid_step - (20 + _points * 4));
}

function AngleToVector(angle) {
    angle = DegreesToRadians(angle);
    return {
        x: Math.cos(angle),
        y: Math.sin(angle)
    }
}

function DegreesToRadians(degrees) {
    return degrees *= (Math.PI / 180);
}

function VectorMagnitude(vector2) {
    var _x = vector2.x;
    var _y = vector2.y;
    return Math.sqrt(_x * _x + _y * _y);
}

function VectorNormalized(vector2) {
    var _magnitude = VectorMagnitude(vector2);
    var _x = vector2.x / _magnitude;
    var _y = vector2.y / _magnitude;
    return {
        x: _x,
        y: _y
    }
}

// Motion Functions
function AddMotion(speedVector, speed, direction, maxSpeed) {
    var vector2 = AngleToVector(direction);
    speedVector.x += vector2.x * speed;
    speedVector.y += vector2.y * speed;
    var _speedVectorMagnitude = VectorMagnitude(speedVector);

    if (_speedVectorMagnitude > maxSpeed) {
        speedVector = VectorNormalized(vector2);
        speedVector.x *= maxSpeed;
        speedVector.y *= maxSpeed;
    }

    return speedVector;
}
function AddMotionVector(speedVector, speed, vectorDirection, maxSpeed) {
    speedVector.x += vectorDirection.x * speed;
    speedVector.y += vectorDirection.y * speed;
    var _speedVectorMagnitude = VectorMagnitude(speedVector);

    if (_speedVectorMagnitude > maxSpeed) {
        speedVector = VectorNormalized(speedVector);
        speedVector.x *= maxSpeed;
        speedVector.y *= maxSpeed;
    }

    return speedVector;
}

function Friction(vector2, friction) {
    vector2.x /= friction;
    vector2.y /= friction;
    return vector2;
}

// Key Functions
function ProcessKey(keyState) {
    if (keyState == KEYSTATE_PRESSED) {
        keyState = KEYSTATE_HELD; // pressed set to held
    }
    if (keyState == KEYSTATE_RELEASED) {
        keyState = KEYSTATE_NONE; // released set to nothing
    }
    return keyState;
}
function CheckPressed(keyState) {
    return keyState == KEYSTATE_PRESSED
}
function CheckHeld(keyState) {
    return keyState == KEYSTATE_PRESSED || keyState == KEYSTATE_HELD
}
function CheckNone(keyState) {
    return keyState == KEYSTATE_NONE
}
function CheckReleased(keyState) {
    return keyState == KEYSTATE_RELEASED
}

function Loop(val, min, max) {
    if (val < min) {
        val = max;
    }
    if (val > max) {
        val = min;
    }
    return val;
}

function Approach(val, goal, step) {
    if (val < goal) {
        val += step;
        val = Math.min(goal, val);
    }
    else {
        val -= step;
        val = Math.max(goal, val);
    }
    return val;
}