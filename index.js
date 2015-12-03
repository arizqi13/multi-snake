var port = process.argv[2] || 12345; // command line arg
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
app.use(express.static('public'));

http.listen(port, function(){
  	console.log('listening on *:'+port);
});

// Feed the index page thwn there is a GET request from client
app.get('/', function(req, res) {
	res.sendFile(__dirname + '/index.html');
});

var current_coord = [0,0];
io.on('connection', function(socket){
	console.log('a user connected');
	io.emit('incoming data', current_coord);
	socket.on('key', function(keycode){
		console.log('receive key ' + keycode);
		if(keycode === 'up') {
			current_coord[1] -= 5;
		} else if(keycode === 'down'){
			current_coord[1] += 5;
		} else if(keycode === 'right') {
			current_coord[0] += 5;
		} else {
			current_coord[0] -= 5;
		}
		io.emit('incoming data', current_coord);
		console.log('sent new coordinate to client');
	});
});