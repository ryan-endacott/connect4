
$(document).ready(initialize);


// Global variables
var canvas;
var ctx;
var width;
var height;
var socket;
var gameboard;
var pname; // player name
var pNum; // player ID
var curTurn;
var opponentName;

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

  socket = io.connect();
  socket.emit('newPlayer', pname);

  socket.on('matchFound', matchFound);
  socket.on('error', handleError);
  socket.on('move', handleMove);

  $(canvas).click(handleClick);
}

function handleError(error) {
  alert("Error: " + error + "\nStarting over...");
  initialize();
}

function matchFound(data) {
  pNum = data.playerNum;
  opponentName = data.opponentName;
  alert("You will be playing against " + opponentName + "!");
  setTurn(data.turn);
}

function setTurn(turn) {
  curTurn = turn;
  if (pNum == turn) {
    $('#turninfo').text("It's your turn...");
  }
  else {
    $('#turninfo').text("It's " + opponentName + "'s turn...");
  }
}

// Handle a gameboard click and make a move if it is
// your turn.
function handleClick(evt) {
  if (pNum != curTurn) // do nothing if not your turn
    return;

  var mousePos = getMousePos(canvas, evt);
  var column = Math.floor(mousePos.x / TSIZE);
  // Don't do anything if click was in a full column
  if (gameboard[column][0] !== undefined)
    return;

  curTurn = (pNum == 1) ? 2 : 1
  socket.emit('move', column);
}

// Get mouse position from a mouse event
function getMousePos(canvas, evt) {
  var rect = canvas.getBoundingClientRect();
  return {
    x: evt.clientX - rect.left,
    y: evt.clientY - rect.top
  };
}


function handleMove(move) {
  setTurn(move.turn);
  gameboard[move.x][move.y] = move.pNum;
  render();
  if (move.win) {
    if (move.pNum == pNum) {
      alert('You won!');
    }
    else {
      alert('You lost!');
    }
  }
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
