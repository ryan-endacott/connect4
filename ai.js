
// Each node is a gameboard
function minimax(node, depth, maximizingPlayer) {
}


// Helper functions

function cloneGameBoard(board) {
  var clone = Array(board.length);
  for (var i = 0; i < board.length; i++) {
    clone[i] = board[i].slice(0);
  }
  return clone;
}
