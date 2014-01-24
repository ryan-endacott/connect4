
// Global variables
var players = {};
var unmatchedPlayers = [];

// Constants
var BOARDWIDTH = 8;
var BOARDHEIGHT = 6;

// Export entire game function
module.exports = function(io) {
  io.sockets.on('connection', function(socket) {
    socket.on('newPlayerName', function(newPlayerName) {
      handleNewPlayer(newPlayerName, socket);
    });
  });

};


function handleNewPlayer(newPlayerName, socket) {
  // if player with that name already exists
  if (players[newPlayerName] || unmatchedPlayers.indexOf(newPlayerName) != -1) {
    socket.emit('error', 'Player with that name already exists.');
    return;
  }

  console.log("New player joining: " + newPlayerName);
  var newPlayer = new Player(socket, null);
  players[newPlayerName] = newPlayer;

  // If there is another unmatched player, start the game
  if (unmatchedPlayers.length > 0) {
    var p2Name = unmatchedPlayers.pop();
    var p2 = players[p2Name]
    newPlayer.opponent = p2;
    newPlayer.gameboard = p2.gameboard;
    p2.opponent = newPlayer;
    console.log("Matched " + opponent + " with " + newPlayerName);
    playGame(newPlayer, p2);
  }
  else { // otherwise, add to unmatchedPlayers and create gameboard
    newPlayerName.gameboard = createNewGameboard();
    unmatchedPlayers.push(newPlayerName);
  }
}

function playGame(player1, player2) {
}

function createNewGameboard(width, height) {
  var gameboard = new Array(width);
  for (var i = 0; i < width; i++) {
    gameboard[i] = new Array(height);
  }
  return gameboard;
}


function Player(socket, opponent) {
  this.socket = socket;
  this.opponent = null;
  this.gameboard = null;
}
