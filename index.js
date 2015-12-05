var port = process.argv[2] || 12345; // command line arg
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
app.use(express.static('public'));

var MAX_NUM_USER = 5;
var MAX_WIDTH = 500;
var MAX_HEIGHT = 500;

// Sample Json format
// var myJson = {"players": {
// 	"id1": {nickname" : "nickname", "color" : "color", "coordinate":[[0,0],[0,1],[0,2]], "direction":"up"},
// 	"id2": {"nickname" : "nickname", "color" : "color", "coordinate":[[1,0], ], "direction":"left"}
// 	}
// };
var clientSockets = [];
var myJson = {"players": []};
var availableColors = ["black","red","yellow","green","blue"];
var colorInUsed = [];
var userArray = new Array();
var currentCoord = [0,0];
var tempNick;
var tempColorIndex;
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
	console.log("New user: " + tempNick);
	res.sendFile(__dirname + '/game.html');
});


io.sockets.on('connection', function(socket){
	clientSockets.push(socket);
	console.log('connected to client:' + socket.id);
	tempID = socket.id;
	// Assign an id for the new user
	socket.on('join', function(){
		// Assign user an id
		var totalUsers = userArray.length;
		if(totalUsers < MAX_NUM_USER && totalUsers >= 0){
			// Find the good coordinate for the new snake
			// Create the player data and add it to the Json
			userArray.push(tempID);
			var tempJson = {};
			tempJson.id = tempID;
			tempJson.nickname = tempNick;
			tempJson.color = pickColor();
			tempJson.coordinate = findCoordinate();
			tempJson.direction = "";

			myJson.players.push(JSON.stringify(tempJson));
			console.log("Create new users: \n\t"+JSON.stringify(tempJson));
		}
		// Send game state data to clients
		io.emit('incoming data', myJson);
	});

	// Receiving new key press from the client
	socket.on('key', function(data){
		var direction = data.direction;
		var userID = data.id;
		var userJson = myJson.players.userID;
		console.log('receive key action:' + JSON.stringify(data));
		if(direction === 'up' || direction === 'down' || direction === 'right' || direction === 'left') {
			userJson.direction === direction;
		}
		// io.emit('incoming data', currentCoord);
		console.log('updated client data');
	});

	// When the user disconnect
	socket.on('disconnect', function(){
		var socketIndex = clientSockets.indexOf(socket);
		clientSockets.splice(i,1);
    	console.log('disconnect user: ' + socket.id);
    	gameOver(socket.id);
  });
});

function pickColor(){
	if(availableColors.length > 0){
		var i = randInt(-1,availableColors.length-1);
		var color = availableColors[i];
		availableColors.splice(i,1);
		colorInUsed.push(color);
		return color;
	}
	return "red";
}

//TODO:
//Movement, and broadcast data to clients every 60 ms


/////////////////////////////////////////////////////////
// Alfian's space

function collision() {
	var all = myJson.players;

	var player;
	for (player in all) {
		var body = player.coordinate;
		var head = body[0];

		// rg = right most grid
		// bg = bottom grid
		// TODO: replace rg and bg with correct variable
		// TODO: replace gameOver call with the correct function
		if (head.x == -1 || head.x == rg || head.y == -1 || head.y == bg) {
			gameOver(player.id);
			continue;
		}

		var headLocation = 
	}	
}

// TODO: remove this function. right now this is just to separated code writing
// Go through all snakes and check if it hits the wall
function wallCollision() {
	var all = myJson.players;

	for (var i = 0; i < all.length; i++) {
		var player = all[i].coordinate;
		var head = player[0];

		// rg = right most grid
		// bg = bottom grid
		// TODO: replace rg and bg with correct variable
		// TODO: replace gameOver call with the correct function
		if (head.x == -1 || head.x == rg || head.y == -1 || head.y == bg) {
			gameOver(player.id);
		}
	}
}

//////////////////////////////////////////////////////////
// Tad's space

// Finds a coordinate position not currently
// occupied by a player's snake and returns it as an object
// with an x and y field
function findOpenSquare(minimumX, maximumX, minimumY, minimumX) {
	// TODO: the global variables maxX maxY and board might
	// have been changed since this was written. Also maxX/maxY
	// is a value that does exist in the board, not one past the edge
	while (true) {
		var potentialX = randInt(minimumX, maximumX);
		var potentialY = randInt(minimumX, maximumY);
		if (isOpen(potentialX, potentialY)) {
			var openSquare = {
				x:potentialX;
				y:potentialY;
			}
			return openSquare;
		}
	}
}

// Tests if the coordinates (xval,yval) are occupied by a snake
// note that this does not test agains the food
function isOpen(xval, yval) {
	var testThisCoord = {
		x:xval;
		y:yval;
	}
	var str = JSON.stringify(testThisCoord);
	if (board[str] == undefined || board[str].length == 0) {
		return true;
	} else {
		return false;
	}
}

// returns random int between minimum (included) and max (included)
function randInt(minimumInt, maximumInt) {
	return Math.floor(Math.random() * (maximumInt + 1 - minimumInt) + minimumInt);
}

function buildCoordinateString(x, y) {
	return "(" + x + "," + y ")";
}



