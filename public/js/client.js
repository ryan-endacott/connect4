
var socket = io.connect('http://localhost');
socket.on('hi', function(data) {
  console.log(data);
  socket.emit('hi', 'whatup');
})
