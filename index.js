var port = process.argv[2] || 12345; // command line arg
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
app.use(express.static('public'));

// Sample Json format
// var myJson = {"players": [
// 	{"id": "", "nickname" : "nickname", "color" : "color", "coordinate":[1,2,3]},
// 	{"id": "", "nickname" : "nickname", "color" : "color", "coordinate":[1,2,3]}
// ]};
var myJson = {"players": []};
var colors = ["black","red","yellow","green","blue"];
var totalUsers = 0;
var userArray = new Array(5);
var currentCoord = [0,0];
var tempNick;
var tempID;

http.listen(port, function(){
  	console.log('listening on *:'+port);
});

// Feed the index page thwn there is a GET request from client
app.get('/', function(req, res) {
	res.sendFile(__dirname + '/index.html');
});

// Feed the index page thwn there is a GET request from client
app.get('/game.html', function(req, res) {
	tempNick = req.query.nickName;
	res.sendFile(__dirname + '/game.html');
});


io.on('connection', function(socket){
	console.log('a user connected');

	// Assign an id for the new user
	socket.on('hello', function(){
		// Assign user an id
		if(totalUsers < 5 && totalUsers >= 0){
			for(var i=0; i<userArray.length,i++){
				if(userArray[i] === undefined || userArray[i] === 0){
					tempID = i;
					break;
				}					
			}
		// find the good coordinate for the new snake
		var newCoord = {findCoordinate(myJson)};
		// Create the player data and add it to the Json
		var tempJson = '{"id": '+tempID+', "nickname" : "'+tempNick+'", "color" : "'+colors[tempID]+'", "coordinate":'+newCoord+'}';
		myJson.players.push(JSON.stringify(tempJson));
		} else {
			// User can not play

		}
		// Send initial data
		// When user load game.html
		io.emit('incoming data', currentCoord);
		io.emit('data',myJson);
	});

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
		// add this nickname and the id to data JSON
	});
});