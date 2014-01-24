
$(document).ready(initialize);


// Global variables
var canvas;
var ctx;
var width;
var height;
var socket;
var gameboard;
var pname; // player name

// constants
var P1 = 1;
var P2 = 2;
var BOARDWIDTH = 8;
var BOARDHEIGHT = 6;

// Note:  The values below need to change if canvas size changes.
// Short for tilesize,
var TSIZE = 100;
// Center modifier to center circles in tiles
var CMOD = TSIZE / 2;
var RAD = 40; // gamepiece radius

// initialize game
function initialize(playerName) {

  canvas = document.getElementById('connect4');
  ctx = canvas.getContext('2d');
  width = canvas.width;
  height = canvas.height;

  // setup gameboard
  gameboard = new Array(BOARDWIDTH);
  for (var i = 0; i < BOARDWIDTH; i++) {
    gameboard[i] = new Array(BOARDHEIGHT);
  }

  render();

  pname = prompt("Hi! What's your name?");

  socket = io.connect('http://localhost');
  socket.emit('newPlayer', pname);
  socket.on('opponentFound', opponentFound);
  socket.on('error', handleError);
}

function handleError(error) {
  alert("Error: " + error + "\nStarting over...");
  initialize();
}

function opponentFound(opponentName) {
}

function update(newMove) {
}

function render() {

  ctx.fillStyle = '#FFCC00'; // Connect4 looking yellow

  ctx.fillRect(0, 0, width, height);

  for (var x = 0; x < BOARDWIDTH; x++) {
    for (y = 0; y < BOARDHEIGHT; y++) {
      // top left of tile coords
      var tx = x * TSIZE;
      var ty = y * TSIZE;
      ctx.beginPath();

      // select color based on player
      switch(gameboard[x][y]) {
        case P1:
          ctx.fillStyle = 'red';
          break;
        case P2:
          ctx.fillStyle = 'blue';
          break;
        default:
          ctx.fillStyle = 'white';
      }

      ctx.arc(tx + CMOD, ty + CMOD, RAD, 0, 2 * Math.PI, false);
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#B28F00;'; // Darker yellow
      ctx.stroke();
    }
  }

}
