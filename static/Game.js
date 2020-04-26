import Controls from './Controls.js';
var controls = new Controls();

// Draw Game
var canvas = document.getElementById('canvas');
canvas.width = 1920;
canvas.height = 1080;
var context = canvas.getContext('2d');

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

function touchDown(e) {
    updatePlayerPos = true;
    touchMove(e);
}
function touchUp(e) {
    touchMove(e);
    updatePlayerPos = true;
}
function touchMove(e) {
    userMove(e.touches[0].clientX, e.touches[0].clientY);
}

function mouseDown(e) {
    updatePlayerPos = true;
    mouseMove(e);
}
function mouseUp(e) {
    mouseMove(e);
    updatePlayerPos = false;
}
function mouseMove(e) {
    userMove(e.clientX, e.clientY);
}

function userMove(x, y) {
    if (updatePlayerPos) {
        var ratio_x = (x / document.documentElement.clientWidth);
        var ratio_y = (y / document.documentElement.clientHeight);
        player_x = ratio_x * context.canvas.width;
        player_y = ratio_y * context.canvas.height;
        /*
                player_x = x - context.canvas.offsetLeft;
                player_y = y - context.canvas.offsetTop;*/
        // prediction
        /*
        player_x += e.movementX;
        player_y += e.movementY;
        */
        socket.emit('player_click', player_x, player_y);
    }
}

var updatePlayerPos = false;
document.addEventListener('mousedown', mouseDown);
document.addEventListener('mouseup', mouseUp);
document.addEventListener('mousemove', mouseMove);

document.addEventListener('touchstart', touchDown);
document.addEventListener('touchend', touchUp);
document.addEventListener('touchmove', touchMove);


socket.on('state', function (playerData) {

    // render screen
    context.clearRect(0, 0, canvas.width, canvas.height);

    var size = 64;

    for (var p in playerData) {
        var player = playerData[p];
        context.fillStyle = player.colorstring;
        context.fillRect(player.x - size / 2, player.y - size / 2, size, size);
    }

    context.fillRect(player_x - size / 2, player_y - size / 2, size, size);
});
