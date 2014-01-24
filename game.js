
// Global variables
var unmatchedPlayers = [];

// Constants
var BOARDWIDTH = 8;
var BOARDHEIGHT = 6;

// Export entire game function
module.exports = function(io) {
  io.sockets.on('connection', function(socket) {
    socket.on('newPlayer', function(newPlayerName) {
      handleNewPlayer(newPlayerName, socket);
    });
  });

};


function handleNewPlayer(newPlayerName, socket) {

  console.log("New player joining: " + newPlayerName);
  var newPlayer = new Player(newPlayerName, socket);

  // If there is another unmatched player, start the game
  if (unmatchedPlayers.length > 0) {
    var p2 = unmatchedPlayers.pop();
    console.log("Matched " + newPlayerName + " with " + p2.name);
    var newGame = new Game(newPlayer, p2)
    newGame.start()
  }
  else { // otherwise, add to unmatchedPlayers
    unmatchedPlayers.push(newPlayer);
  }
}

function createNewGameboard() {
  var gameboard = new Array(BOARDWIDTH);
  for (var i = 0; i < BOARDWIDTH; i++) {
    gameboard[i] = new Array(BOARDHEIGHT);
  }
  return gameboard;
}

function Player(name, socket) {
  this.name = name;
  this.socket = socket;
}

function Game(player1, player2) {
  this.player1 = player1;
  this.player2 = player2;
  this.gameboard = createNewGameboard();
  this.curTurn = 0;
}

Game.prototype.start = function() {

  var p1 = this.player1;
  var p2 = this.player2;

  // Decide who goes first
  this.curTurn = 1;
  if (Math.random() < .5) {
    this.curTurn = 2;
  }

  p1.socket.emit('matchFound', {
    playerNum: 1,
    opponentName: p2.name,
    turn: this.curTurn
  });
  p2.socket.emit('matchFound', {
    playerNum: 2,
    opponentName: p1.name,
    turn: this.curTurn
  });

  var game = this;
  p1.socket.on('move', function(column) {
    game.handleMove(1, column);
  });
  p2.socket.on('move', function(column) {
    game.handleMove(2, column);
  });
};

Game.prototype.handleMove = function(pNum, column) {
  if (this.curTurn != pNum)
    return;

  // Make the move
  for (var y = BOARDHEIGHT - 1; y >= 0; y--) {

    // Look for lowest empty spot
    if (this.gameboard[column][y] === undefined) {

      this.gameboard[column][y] = pNum;

      var win = this.checkForWin(column, y);
      this.curTurn = (this.curTurn == 1) ? 2 : 1;

      // Broadcast the move
      this.player1.socket.emit('move', {
        x: column,
        y: y,
        pNum: pNum,
        turn: this.curTurn,
        win: win
      });
      this.player2.socket.emit('move', {
        x: column,
        y: y,
        pNum: pNum,
        turn: this.curTurn,
        win: win
      });

      break;
    }
  }
}

Game.prototype.checkForWin = function(x, y) {
};

