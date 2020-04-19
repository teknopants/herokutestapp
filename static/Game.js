var player_x = Math.random() * 800;
var player_y = Math.random() * 800;


// Socket Stuff
var socket = io();
socket.emit('new player', player_x, player_y);



document.addEventListener('keyup', function (event) {
    switch (event.keyCode) {
        case 37: // A
            keyStates.left = KEYSTATE_RELEASED;
            break;
    }
});

document.addEventListener('keydown', function (event) {
    switch (event.keyCode) {
        case 37: // A
            break;
    }
});


function CurrentTime() {
    return (new Date()).getTime();
}
// Update
var timeStamp = CurrentTime();
var timeElapsed = 0;
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

socket.on('state', function (playerData) {

    // render screen
    context.clearRect(0, 0, canvas.width, canvas.height);

    for (var p in playerData) {
        var player = playerData[p];
        context.fillStyle = player.colorstring;
        context.fillRect(player.x, player.y, 16, 16);
    }
});
