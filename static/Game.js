import Controls from './Controls.js';
var controls = new Controls();

var player_x = Math.random() * 800;
var player_y = Math.random() * 800;

// Socket Stuff
//import io from 'socket.io-client';
var socket = io();
socket.emit('new player', player_x, player_y);

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

    controls.Update();

    if (controls.CheckPressed(controls.click)) {
        console.log("click pressed");
    }

}, 1000 / 60);


// Draw Game
var canvas = document.getElementById('canvas');
canvas.width = 800;
canvas.height = 800;
var context = canvas.getContext('2d');

canvas.addEventListener('click', function OnClick(e) {
    player_x = e.clientX;
    player_y = e.clientY;
    console.log("x = " + player_x);
    socket.emit('player_click', player_x, player_y);
});

socket.on('state', function (playerData) {

    // render screen
    context.clearRect(0, 0, canvas.width, canvas.height);

    for (var p in playerData) {
        var player = playerData[p];
        context.fillStyle = player.colorstring;
        context.fillRect(player.x, player.y, 16, 16);
    }
});
