// Main app file that links everything together and runs the app

var express = require('express'),
    http = require('http');


var app = express();

// Configure app bootup
require('./config/bootup')(app);

// Configure routes
require('./config/routes')(app);

var server = http.createServer(app);

// Set up socket.io
var io = require('socket.io').listen(server);

server.listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

// Set up the rest of the websocket stuff
require('./game.js')(io);
