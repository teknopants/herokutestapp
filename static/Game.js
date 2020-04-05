const KEYSTATE_PRESSED = 1;
const KEYSTATE_HELD = 2;
const KEYSTATE_RELEASED = -1;
const KEYSTATE_NONE = 0;

const Vector2 = {
    Zero: function () {
        return {
            x: 0,
            y: 0
        }
    }
}

var keyStates = {
    right: KEYSTATE_NONE,
    left: KEYSTATE_NONE,
    up: KEYSTATE_NONE,
    down: KEYSTATE_NONE
}

var playerSpeed = {
    x: 0,
    y: 0
}
var playerPosition = {
    x: Math.random() * 400,
    y: Math.random() * 400
}

var timeStamp = (new Date()).getTime();

// Socket Stuff
var socket = io();

socket.emit('new player');

function sendState() {
    socket.emit('playerPosition', playerPosition, playerSpeed, (new Date()).getTime());
}


document.addEventListener('keyup', function (event) {
    switch (event.keyCode) {
        case 65: // A
            keyStates.left = KEYSTATE_RELEASED;
            break;
        case 68: // D
            keyStates.right = KEYSTATE_RELEASED;
            break;
        case 87: // W
            keyStates.up = KEYSTATE_RELEASED;
            break;
        case 83: // S
            keyStates.down = KEYSTATE_RELEASED;
            break;
    }
});

document.addEventListener('keydown', function (event) {
    switch (event.keyCode) {
        case 65: // A
            if (keyStates.left <= 1)
                keyStates.left = KEYSTATE_PRESSED;
            break;
        case 68: // D
            if (keyStates.right <= 1)
                keyStates.right = KEYSTATE_PRESSED;
            break;
        case 87: // W
            if (keyStates.up <= 1)
                keyStates.up = KEYSTATE_PRESSED;
            break;
        case 83: // S
            if (keyStates.down <= 1)
                keyStates.down = KEYSTATE_PRESSED;
            break;
    }
});

function GetTimeDifference() {
    var currentTime = (new Date()).getTime();
    var timeDifference = (currentTime - timeStamp) / 1000;
    timeStamp = currentTime;
    return timeDifference;
}

document.addEventListener('keyup', function (event) {
    switch (event.keyCode) {
        case 65: // A
            break;
        case 87: // W
            break;
        case 68: // D
            break;
        case 83: // S
            break;
    }
});

// Update
setInterval(function () {

    var _timeDifference = GetTimeDifference();

    // input
    var _spd = 60 * _timeDifference;
    var _maxSpd = 10;
    var _inputDirection = Vector2.Zero();

    if (CheckHeld(keyStates.right)) {
        _inputDirection.x = 1;
    }
    if (CheckHeld(keyStates.left)) {
        _inputDirection.x = -1;
    }
    if (CheckHeld(keyStates.up)) {
        _inputDirection.y = -1;
    }
    if (CheckHeld(keyStates.down)) {
        _inputDirection.y = 1;
    }

    // Move Player
    if (VectorMagnitude(_inputDirection) > 0.1) {
        playerSpeed = AddMotionVector(playerSpeed, _spd, _inputDirection, _maxSpd);
    }

    playerPosition.x += playerSpeed.x;
    playerPosition.y += playerSpeed.y;
    playerSpeed = Friction(playerSpeed, 1.05);

    // process key states
    keyStates.right = ProcessKey(keyStates.right);
    keyStates.up = ProcessKey(keyStates.up);
    keyStates.left = ProcessKey(keyStates.left);
    keyStates.down = ProcessKey(keyStates.down);

    sendState();

}, 1000 / 60);

// Draw Game
var canvas = document.getElementById('canvas');
canvas.width = 800;
canvas.height = 600;
var context = canvas.getContext('2d');

socket.on('state', function (players) {
    context.clearRect(0, 0, 800, 600);
    context.fillStyle = 'green';
    for (var id in players) {
        var player = players[id];
        context.beginPath();
        context.arc(player.x, player.y, 10, 0, 2 * Math.PI);
        context.fill();
    }

    //local player
    context.fillStyle = 'red';
    context.beginPath();
    context.arc(playerPosition.x, playerPosition.y, 5, 0, 2 * Math.PI);
    context.fill();
});


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