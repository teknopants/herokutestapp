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

function userDown() {
    updatePlayerPos = true;
}
function userUp() {
    updatePlayerPos = false;
}
function userMove(e) {
    if (updatePlayerPos) {
        player_x = e.pageX + e.movementX - context.canvas.offsetLeft;
        player_y = e.pageY + e.movementY - context.canvas.offsetTop;
        socket.emit('player_click', player_x, player_y);
    }
}

var updatePlayerPos = false;
document.addEventListener('mousedown', userDown);
document.addEventListener('mouseup', userUp);
document.addEventListener('mousemove', userMove);

document.addEventListener('touchstart', userDown);
document.addEventListener('touchend', userUp);
document.addEventListener('touchmove', userMove);


socket.on('state', function (playerData) {

    // render screen
    context.clearRect(0, 0, canvas.width, canvas.height);

    for (var p in playerData) {
        var player = playerData[p];
        context.fillStyle = player.colorstring;
        context.fillRect(player.x, player.y, 16, 16);
    }

    context.fillRect(player_x, player_y, 16, 16);
});
