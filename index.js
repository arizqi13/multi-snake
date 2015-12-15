var port = process.argv[2] || 12345; // command line arg
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
app.use(express.static('public'));

var MAX_NUM_USER = 5;
var gridSize = 6;
var maxX = 100;
var maxY = 100;
var FOOD = null;
var FOOD_COLOR = 'brown';

// var INTERVAL = 70;
var INTERVAL = process.argv[3] || 70; // command arg for interval, needs to have port# argument first

/*
Sample Json format
 var myJson = {"players": {
  "id1": {nickname" : "nickname", "color" : "color", "coordinate":[{"x":1,"y":2},{"x":1,"y":2}], "direction":"up", "lengthBuffer":2},
  "id2": {"nickname" : "nickname", "color" : "color", "coordinate":[{"x":1,"y":2}], "direction":"left", "lengthBuffer":0}
  }
  "food": {"x":x, "y":y, "color": color},
	"scoreBoard": [
	{nick: 'score'}, ..., {nick: 'score'}	
	],
 };
*/

// Sample board format
// {"{"x":1,"y":2}":[{'id':id, 'bodyNum': 0}], "{"x":2,"y":2}":[{'id':id, 'bodyNum': 0}]}

// Sample clientSockets format
// clientSockets = {"userid":"correspnding socket id"}

var clientSockets = {};
var myJson = {};
var board = {};
myJson["players"] = {};
myJson.food = {coordinate:null, color: FOOD_COLOR};
myJson.scoreBoard = [
	{'xxx':4},{'xxx':3},{'xxx':2},{'xxx':1},{'xxx':0}
];
var availableColors = ["purple","red","orange","green","blue", "aqua", "#5F9EA0", "#DC143C", "#B8860B", 
                        "#FF1493", "#B22222", "#008080", "#FA8072"];
var colorInUsed = [];
var diePlayer = [];
var directionBuffer = {};

var currentCoord = [0,0];
var tempNick;
var tempColorIndex;
var tempID;

setInterval(go, INTERVAL);

function go() {
  if(!Object.keys(myJson.players).length){
   return;
  }
  updateBoard();
  collision();
  gameOver();
  spawnFood();
  eat();
  move();
  io.emit('incoming data', myJson);
}


http.listen(port, function(){
    console.log('listening on *:'+port);
});

// Feed the index page thwn there is a GET request from client
app.get('/', function(req, res) {
  res.sendFile(__dirname + '/index.html');
});

// Feed the index page thwn there is a GET request from client
app.get('/game.html', function(req, res) {
  res.sendFile(__dirname + '/game.html');
});


io.sockets.on('connection', function(socket){
  console.log('connected to client:' + socket.id);
  var currentClient = socket.id;
 
  // Assign an id for the new user
  socket.on('join', function(clientData){

    if(clientData != undefined){
      // Assign user an id
      var totalUsers = Object.keys(myJson.players).length;
      if(totalUsers < MAX_NUM_USER && totalUsers >= 0 && myJson.players[clientData.id] == undefined){
        // Find the good coordinate for the new snake
        // Create the player data and add it to the Json
        var tempJson = {};
        tempJson.nickname = clientData.nickName;
        tempJson.color = pickColor();
        tempJson.coordinate = findSpawn();
        console.log("Found New Coordinate:" + JSON.stringify(tempJson.coordinate));
        console.log(">>"+JSON.stringify(tempJson.coordinate[0]));
        tempJson.direction = findDirection(tempJson.coordinate);
        tempJson.lengthBuffer = 0;
        myJson.players[clientData.id] = tempJson;

        // directionBuffer
        directionBuffer[clientData.id] = [];

        console.log("Create new users: \n\t"+JSON.stringify(tempJson));
        console.log("MyJSON:"+JSON.stringify(myJson));
        // Send game initial direction to clients
        socket.emit('confirm join', tempJson.direction);
        clientSockets[clientData.id] = socket.id;
        socket.clientID = clientData.id;
      }
      // Send game state data to user
      io.emit('incoming data', myJson);
    }

  });

  // Receiving new key press from the client
  socket.on('key', function(data){
    if(data != undefined){
      var direction = data.direction;
      var userID = data.id;
      // var userJson = myJson.players[userID];
      
      console.log("Received data:" + data);
      console.log("Received direction:" + direction);
      console.log("MyJSON:"+JSON.stringify(myJson));
      console.log('receive key action:' + JSON.stringify(data));
      
      if(direction === 'up' || direction === 'down' || direction === 'right' || direction === 'left') {
        // userJson["direction"] = direction;
        directionBuffer[userID].push(direction);
      }
      // io.emit('incoming data', currentCoord);
      console.log('updated client direction');
    }
  });

  // When the user disconnect
  socket.on('disconnect', function(){
    console.log('disconnect user: ' + socket.id);
    delete myJson.players[socket.clientID];
    console.log('removed user data');
  });
});

// pick a random color from the list of availble colors
function pickColor(){
  if(availableColors.length > 0){
    var i = randInt(0,availableColors.length-1);
    var color = availableColors[i];
    availableColors.splice(i,1);
    colorInUsed.push(color);
    return color;
  }
  return "black";
}

function gameOver(){
  // base on the diePlayer array to remove death players from myJson
  // add the color back to availableColors
  // emit an event to that client to notify them
  if(diePlayer.length > 0){
    // emit the gameOver event to clients
    // io.emit('game over', diePlayer);

    for(var i in diePlayer){
      var deathID = diePlayer[i];
      // add the client's color back to availableColors
      var color = myJson.players[deathID].color;
      availableColors.push(color);
      var dieClient = clientSockets[deathID];
      io.sockets.connected[dieClient].emit('game over');
      // remove the player from myJson
      delete myJson.players[deathID];
      delete clientSockets[deathID];
    }
    diePlayer = [];
  }
}


// Check collision. The board must be up to date and reflects the current position
// of all snakes

function collision() {
  var all = myJson.players;

  var id;
  for (id in all) {
    if (diePlayer.indexOf(id) > -1) {
      // skip this player, has died
      continue;
    }
    var player = all[id];
    var head = player.coordinate[0];

    // maxX = right most grid
    // maxY = bottom grid
    if (head.x == -1 || head.x == maxX || head.y == -1 || head.y == maxY) {
      diePlayer.push(id);
      continue;
    }

    var square = board[JSON.stringify(head)].slice();
    // This location should at least have this snake's head
    // if > 1, collision with player happen
    if (square.length > 1) {
      // TODO: update for >2 players collision

      var enemy;
      for (var i = 0; i < square.length; i++) {
        //square.indexOf({'id':id, 'bodyNum': 0})
        var sq = square[i];

        if (diePlayer.indexOf(sq.id) > -1) {
          // skip this enemy, has died
          continue;
        }

        if (sq.id === id && sq.bodyNum != 0) {
          // hit itself, die. stop searching enemy
          diePlayer.push(id);
          break;
        }

        if (sq.id != id) {
          // Found the enemy
          enemy = sq;
          break;
        }
      }

      if (diePlayer.indexOf(id) > -1) {
        // skip this player, has died
        continue;
      }

      var enemyBody = all[enemy.id].coordinate;
      var eaten = enemyBody.length - enemy.bodyNum;

      if (eaten >= player.coordinate.length) {
        // gameOver(id);
        diePlayer.push(id);
        if (eaten == enemyBody.length) {
          diePlayer.push(enemy.id);
        }
      } else {
        // lengthBuffer is the buffered length
        // also used when the snake eats
        // if buffer > 0, instead of moving the tail to the head,
        // we simply extend the head by one until buffer = 0
        if (!player.lengthBuffer) {
          player.lengthBuffer = 0;
        }
        player.lengthBuffer += eaten;
        if (eaten == enemyBody.length) {
          diePlayer.push(enemy.id);
        } else {
          all[enemy.id].coordinate = enemyBody.slice(0, enemy.bodyNum);
        }
      }
    }
  } 
}

function updateBoard() {
  board = null;
  var all = myJson.players;
  board = {};
  var id;
  for (id in all) {
    var player = all[id].coordinate;

    for (var i = 0; i < player.length; i++) {
      var location = JSON.stringify(player[i]);

      if (!board[location]) {
        board[location] = [];
      }
      board[location].push({'id': id, 'bodyNum': i});
    }

    // update direction
	var arr = directionBuffer[id];
	if (arr && arr.length > 0) {
		myJson.players[id].direction = arr.shift();
	}

    // update score board
    var newScore = {};
	newScore[all[id].nickname] = player.length;

    var scb = myJson.scoreBoard;
    var str = JSON.stringify(scb);
    if (str.indexOf(JSON.stringify(newScore)) > -1) {
		continue;
	}
    for (var i = 0; i < myJson.scoreBoard.length; i++) {
    	var oldVal = scb[i];
    	var oldNick = Object.keys(oldVal);
    	if (player.length >= oldVal[oldNick]) {
    		if (all[id].nickname == oldNick) {
    			scb[i] = newScore;
    			break;
    		}
    		scb.pop();
    		scb.splice(i, 0, newScore);
    		break;
    	}
    }
  }

}

// finds a horizontal position on the board at least SPAWN_LEN long.
// Will never spawn head closer than SPAWN_LEN squares away from wall
// returns an ARRAY OF COORDINATES YAY

// This is a very simple approach, it does not take into account
// other snakes near head.
// I figured first entering the game it would be hard
// to dodge a snake even 4-6 spaces in front of you, and I thought
// it would not be worth it to check at all.......................
// Although, with the isOpen(x,y) method, it would not be too hard
// to add this in. It may slow down the algorithm though if there are
// long snakes on the board. Something to consider. Need to see how the
// game plays.. If spawning running into enemies happens often, let's change
var SPAWN_LEN = 5;
function findSpawn(){
  var res = [];
  while (res.length == 0) {
    // Gives them 2x the snake length for the sides. Will spawn them
    // horizontally
    var openSpace = findOpenSquare(SPAWN_LEN * 2, maxX - (SPAWN_LEN * 2),
     0, maxY - 1);
    res.push(openSpace);
    
    // found open space on the left half of the board. Let's
    // try and extend to the left with head facing right
    if (openSpace.x < (maxX / 2)) {
      while (res.length < SPAWN_LEN) {
        var lastPushed = res[res.length - 1];
        if (isOpen(lastPushed.x - 1, lastPushed.y)) {
          var nextBodyPart = {"x":(lastPushed.x - 1), "y":lastPushed.y};
          res.push(nextBodyPart);
        } else {
          res = [];
          break; // go back around outer loop and find new 
          // starting square.
        }
      }
    } else {
      while (res.length < SPAWN_LEN) {
        var lastPushed = res[res.length - 1];
        if (isOpen(lastPushed.x + 1, lastPushed.y)) {
          var nextBodyPart = {"x":(lastPushed.x + 1), "y":lastPushed.y};
          res.push(nextBodyPart);
        } else {
          res = [];
          break; // go back around outer loop and find new 
          // starting square.
        }
      }
    }
  }
  return res;
}

// Returns direction based on which end the head is facing
function findDirection(coordinateArray) {
  if (coordinateArray[0].x < coordinateArray[1].x) {
    return "left";
  } else {
    return "right";
  }
}


// adds coordinates in coordArray to board and assigns
// them to the player with the corresponding playerID
function addCoordsToBoard(coordArray, playerID) {
  for (var i = 0; i < coordArray.length; i++) {
    var c = coordArray[i];
    // push into the array at the coordinate
    var ob = {};
    ob["id"] = playerID;
    ob["bodyNum"] = i;
    board[JSON.stringify(c)].push(ob);
  }
}

// Moves each snake based on their direction
// assumes that the head of the snake is snake_array[0]
// and that the tail is snake_array[snake_array.length - 1]
// decrements lengthBuffer and adds one coordinate in snake_array
// as new head else if lengthBuffer = 0 places tail as new head
// as stands, the direction can go back on itself. The game.js
// should restrict movement to not go against its current direction
function move() {
  var all = myJson.players;
  var id;

  for (id in all) {
    var player = all[id];
    var head = player.coordinate[0];

    //The movement code for the snake to come here.
    var d = player.direction;
    var nx = head.x;
    var ny = head.y;
    if(d == "right") nx++;
    else if(d == "left") nx--;
    else if(d == "up") ny--;
    else if(d == "down") ny++;

    // make the tail the new head
    if (player.lengthBuffer == undefined || player.lengthBuffer == 0) {
      player.coordinate.pop();
      
      player.coordinate.unshift({x: nx, y: ny});

    // make a new head and unshift onto the player.coordinate array
    } else {
      player.lengthBuffer--;
      var newHead = {
        x:nx,
        y:ny
      };
      player.coordinate.unshift(newHead);

    }
  }
}


// updates board based on moved snake body parts
// does not update board for deleted players.
function updateBoardAfterMove(playerCoords, playerID) {
  var tempArray = playerCoords;
  for(var i in tempArray){
    var boardArr = board[JSON.stringify(tempArray[i])];
    for (var j in boardArr) {
      if (boardArr[j]["id"] == playerID) {
        boardArr[j].bodyNum += 1;
      }
    }
  }
}


// checks the heads of the snakes against the 
// location of the food.
// increments the player's lengthBuffer
// and sets the food to null if the snake eats
// This comes after collision(), so only one snake
// can possibly eat the food
function eat() {
	var all = myJson.players;
	var id;
	var foodCoordinate = JSON.stringify(myJson.food.coordinate);
	var snake = board[foodCoordinate];

	if (snake == undefined || snake == null	|| snake.length == 0) {
		return;
	} else {
		// since we make sure to spawn food in a free area, eating can only be
		// done from head
		if(all[snake[0].id]){
			all[snake[0].id].lengthBuffer++;
		}
		myJson.food.coordinate = null;
	}
}

function spawnFood() {
	if (!myJson.food.coordinate) {
		myJson.food["coordinate"] = findOpenSquare(0, maxX - 1, 0, maxY - 1);
	}
}

// Finds a coordinate position not currently
// occupied by a player's snake and returns it as an object
// with an x and y field. 
// maxX and maxY are exclusive. ie. will NEVER
// return {x:max, y:max}
function findOpenSquare(minimumX, maximumX, minimumY, maximumY) {
  // the global variables maxX maxY and board might
  // have been changed since this was written. Also maxX/maxY
  // is a value that does exist in the board, not one past the edge
  while (true) {
    var potentialY = randInt(minimumY, maximumY - 1);
    var potentialX = randInt(minimumX, maximumX - 1);
    console.log("In findOpenSquare minimumX:"+minimumX+" maximumX:"+maximumX+
      "minimumY:"+minimumY + " maximumY:"+maximumX+ 
      " potentialX:"+potentialX+" potentialY:"+potentialY);
    if (isOpen(potentialX, potentialY)) {
      var openSquare = {
        x:potentialX,
        y:potentialY
      };
      return openSquare;
    }
  }
}

// Tests if the coordinates (xval,yval) are occupied by a snake
// note that this does not test agains the food
function isOpen(xval, yval) {
  if(xval == null || xval == undefined || yval == null || yval == undefined)
    return false;
  var testThisCoord = {
    x:xval,
    y:yval
  };
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

function initBoard() {
  for (var x = 0; x < maxX; x++) {
    for (var y = 0; y < maxY; y++) {
      var temp = {x:x, y:y};
      board[JSON.stringify(temp)] = [];
    }
  }
}
