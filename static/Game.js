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
canvas.width = 1080;
canvas.height = 1920;
var context = canvas.getContext('2d');


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
    userMove(e.pageX, e.pageY);
}

function userMove(x, y) {
    if (updatePlayerPos) {
        player_x = x - context.canvas.offsetLeft;
        player_y = y - context.canvas.offsetTop;
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

    for (var p in playerData) {
        var player = playerData[p];
        context.fillStyle = player.colorstring;
        context.fillRect(player.x - 8, player.y - 8, 16, 16);
    }

    context.fillRect(player_x - 8, player_y - 8, 16, 16);
});
