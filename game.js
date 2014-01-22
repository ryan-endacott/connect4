// Export entire game function
module.exports = function(io) {

  io.sockets.on('connection', function(socket) {
    socket.emit('hi', 'hello world');
    socket.on('hi', function(data) {
      console.log(data);
    })
  });

};
