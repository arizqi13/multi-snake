var port = process.argv[2] || 12345; // command line arg
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
app.use(express.static('public'));


// Sample Json format
// var myJson = {"players": {
// 	"id1": {nickname" : "nickname", "color" : "color", "coordinate":[[0,0],[0,1],[0,2]], "direction":"up"},
// 	"id2": {"nickname" : "nickname", "color" : "color", "coordinate":[[1,0], ], "direction":"left"}
// 	}
// };
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
	console.log("New user: " + tempNick);
	res.sendFile(__dirname + '/game.html');
});


io.on('connection', function(socket){
	console.log('a user connected');

	// Assign an id for the new user
	socket.on('join', function(){
		// Assign user an id
		if(totalUsers < 5 && totalUsers >= 0){
			for(var i=0; i<userArray.length;i++){
				if(userArray[i] === undefined || userArray[i] === 0){
					tempID = i;
					userArray[i] = 1;
					break;
				}					
			}
		// find the good coordinate for the new snake
		var newCoord = findCoordinate();
		// Create the player data and add it to the Json
		var tempJson = {};
		tempJson.id = tempID;
		tempJson.nickname = tempNick;
		tempJson.color = colors[tempID];
		tempJson.coordinate = newCoord;
		tempJson.direction = "";
		// var tempJson = '{"id": '+tempID+', "nickname" : "'+tempNick+'", "color" : "'+colors[tempID]+'", "coordinate":'+newCoord+'}';
		myJson.players.push(JSON.stringify(tempJson));
		console.log("Create new users: \n\t"+JSON.stringify(tempJson));
		} else {
			// User can not play

		}
		// Send initial data
		// When user load game.html
		io.emit('incoming data', currentCoord);
		io.emit('data',myJson);
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
		console.log('update client data');
	});
});

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



