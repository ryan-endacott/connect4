
// Global variables
var unmatchedPlayers = [];

// Constants
var BOARDWIDTH = 8;
var BOARDHEIGHT = 6;
var WINCOND = 4; // num in a row needed to win

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

// Function to see if someone has won after moving
// at position x, y
Game.prototype.checkForWin = function(x, y) {
  return this.checkForHorizWin(x, y) ||
    this.checkForVertWin(x, y) ||
    this.checkForPosDiagWin(x, y) ||
    this.checkForNegDiagWin(x, y);
};

// Function to see if someone won horizontally
// Row and col are latest move space
Game.prototype.checkForHorizWin = function(col, row) {

  // Only need to check within range of a possible win,
  // Also must be in bounds
  var endCol = min(col + WINCOND - 1, BOARDWIDTH - 1);
  col = max(col - WINCOND + 1, 0);


  var count = 0;
  for (;col <= endCol; col++) {

    if (this.gameboard[col][row] == this.curTurn) {
      count++;
    }
    else
      count = 0;

    if (count == WINCOND)
      return true;

  }

  return false;

};


// Function to see if someone won vertically
// Row and col are latest move space
Game.prototype.checkForVertWin = function(col, row) {


  // Only need to check within range of a possible win,
  // Also must be in bounds
  var endRow = min(row + WINCOND - 1, BOARDHEIGHT - 1);
  row = max(row - WINCOND + 1, 0);


  var count = 0;
  for (;row <= endRow; row++) {

    if (this.gameboard[col][row] == this.curTurn)
      count++;
    else
      count = 0;

    if (count == WINCOND)
      return true;

  }

  return false;

};

// Function to see if someone won positive diagonally
// Row and col are latest move space
Game.prototype.checkForPosDiagWin = function(col, row) {

  // Set up endRow and endCol by setting to both to max possible
  var endRow = min(row + WINCOND - 1, BOARDHEIGHT - 1);
  var endCol = min(col + WINCOND - 1, BOARDWIDTH - 1);

  // Then equalizing them to the max in bounds and on diag
  var diff = min(endRow - row, endCol - col);
  endRow = row + diff;
  endCol = col + diff;

  // Set up row and col the same way, both to min possible
  row = max(row - WINCOND + 1, 0);
  col = max(col - WINCOND + 1, 0);

  // Then equalize to min in bounds and on diag
  diff = min(endRow - row, endCol - col);
  row = endRow - diff;
  col = endCol - diff;



  var count = 0;

  // Because all are equalized, only one counter (row to endRow) should be needed
  while (row <= endRow) {

    if (this.gameboard[col][row] == this.curTurn)
      count++;
    else
      count = 0;

    if (count == WINCOND)
      return true;

    row++;
    col++;
  }

  return false;
};


// Function to see if someone won negative diagonally
// Row and col are latest move space
Game.prototype.checkForNegDiagWin = function(col, row) {

  // Set up endRow and endCol by setting one to max, other to min
  var endRow = min(row + WINCOND - 1, BOARDHEIGHT - 1);
  var endCol = max(col - WINCOND + 1, 0);

  // Then equalizing them to the values such that they will both be in bounds and on the diag
  var diff = min(endRow - row, col - endCol);
  endRow = row + diff;
  endCol = col - diff;

  // Set up row and col the same way, both to best possible
  row = max(row - WINCOND + 1, 0);
  col = min(col + WINCOND - 1, BOARDWIDTH - 1);

  // Then equalize to best in bounds and on diag
  diff = min(endRow - row, col - endCol);
  row = endRow - diff;
  col = endCol + diff;



  var count = 0;

  // Because all are equalized, only one counter (row to endRow) should be needed
  while (row <= endRow) {

    if (this.gameboard[col][row] == this.curTurn)
      count++;
    else
      count = 0;

    if (count == WINCOND)
      return true;

    row++;
    col--;
  }

  return false;
};


// Helper functions
function max(x, y) {
  return (x > y) ? x : y;
}
function min(x, y) {
  return (x < y) ? x : y;
}

