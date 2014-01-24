// Export entire game function
module.exports = function(io) {

  var players = {};
  var unmatchedPlayers = [];

  io.sockets.on('connection', function(socket) {

    socket.on('newPlayer', function(playerName) {

      // if player with that name already exists
      if (players[playerName] || unmatchedPlayers.indexOf(playerName) != -1) {
        socket.emit('error', 'Player with that name already exists.');
        return;
      }

      console.log("New player joining: " + playerName);

      // If there is another unmatched player, start the game
      if (unmatchedPlayers.length > 0) {
        var opponent = unmatchedPlayers.pop();
      }
      else { // otherwise, add to unmatchedPlayers
        unmatchedPlayers.push(playerName);
      }

    })
  });

};

