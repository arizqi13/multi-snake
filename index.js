var port = process.argv[2] || 12345; // command line arg
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
app.use(express.static('public'));

http.listen(port, function(){
  	console.log('listening on *:'+port);
});

var nickName = "";
// Feed the index page thwn there is a GET request from client
app.get('/', function(req, res) {
	res.sendFile(__dirname + '/index.html');
});

// Feed the index page thwn there is a GET request from client
app.get('/game.html', function(req, res) {
	res.sendFile(__dirname + '/game.html');
	io.emit('nick name', nickName);
});


var totalUsers = 0;
var currentCoord = [0,0];
io.on('connection', function(socket){
	console.log('a user connected');
	// Send initial data
	io.emit('incoming data', currentCoord);

	// Receiving new key press from the client
	socket.on('key', function(keycode){
		console.log('receive key ' + keycode);
		if(keycode === 'up') {
			currentCoord[1] -= 5;
		} else if(keycode === 'down'){
			currentCoord[1] += 5;
		} else if(keycode === 'right') {
			currentCoord[0] += 5;
		} else {
			currentCoord[0] -= 5;
		}
		io.emit('incoming data', currentCoord);
		console.log('sent new coordinate to client');
	});

	// Accepting new user
	socket.on('join', function(nickName){
		console.log("Accepting player " + nickName);
		this.nickName = nickName;
	});
});