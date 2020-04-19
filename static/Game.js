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
        case 37:
            break;
    }
});

// Update
setInterval(function () {

    var _dt = (CurrentTime() - timeStamp) / 1000;
    timeElapsed += _dt;
    timeStamp = CurrentTime();

}, 1000 / 60);

// Draw Game
var canvas = document.getElementById('canvas');
canvas.width = 800;
canvas.height = 800;
var context = canvas.getContext('2d');

socket.on('state', function (players) {

    // render screen
    context.clearRect(0, 0, canvas.width, canvas.height);

});
