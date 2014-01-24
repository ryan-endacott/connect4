
$(document).ready(initialize);


// Global variables
var canvas;
var ctx;
var width;
var height;
var socket;

// initialize game
function initialize() {

  socket = io.connect('http://localhost');
  socket.on('hi', function(data) {
    console.log(data);
    socket.emit('hi', 'whatup');
  })

  canvas = document.getElementById('connect4');
  ctx = canvas.getContext('2d');
  width = canvas.width;
  height = canvas.height;

  ctx.fillRect(0, 0, width, height);

}

function render(ctx) {
}
