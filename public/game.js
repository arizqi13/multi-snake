var socket = io();
var canvas = document.getElementById('gameField');
var context = canvas.getContext('2d');
var gridSize = 5;

// an object stores basic info of player: id, nickName, current direction
var client = {};
client["nickName"] = null;
client["id"] = null;
client["direction"] = null;

// request to join the game, starts when load the page
$(document).ready(function(){
  $('#signUp').show();
  $('#gameBoard').hide();
});

$('#join').click(function(){
  var nn = $("#nickName").val();
  if(nn != ""){
    client.nickName = nn;
    client.id = newID();
    socket.emit('join',client);
  }
});

// receive the player's info from the server, use this to set diretion for
// client object
socket.on('confirm join', function(initialDirection){
  if(initialDirection != undefined){
    client.direction = initialDirection;
    $('#signUp').hide();
    $('#gameBoard').show();
  }
});

// receive game over signal
socket.on('game over', function(){
    alert("Sorry, you've lost this game.");
    // Reload the page
    location.reload();
});

// when player hits a key, combine the current and the keypress
// then send the non-conflict key to the server
$(document).keydown(function(e){
  var charCode = (e.which) ? e.which : e.keyCode;
  if(client.id != null && client.nickName != null && client.direction != null){
    var data = {};
    data.id = client.id;
    if((charCode === 38 || charCode === 87) && client.direction != 'down' && client.direction != 'up') {
    // Up arrow
      data.direction = 'up';
      client.direction = 'up';
      socket.emit('key',data);
    } else if((charCode === 40 || charCode === 83) && client.direction != 'up' && client.direction != 'down') {
    // Down arrow
      data.direction = 'down';
      client.direction = 'down';
      socket.emit('key',data);
    } else if((charCode === 39 || charCode === 68) && client.direction != 'left' && client.direction != 'right') {
    // Right arrow
      data.direction = 'right';
      client.direction = 'right';
      socket.emit('key',data);
    } else if((charCode === 37 || charCode === 65) && client.direction != 'right' && client.direction != 'left') {
    // Left arrow
      data.direction = 'left';
      client.direction = 'left';
      socket.emit('key',data);
    } else {
    // Not a control key
    }
  }
});

// receive updates from the server, use this to render the snakes and food
socket.on('incoming data', function(data){
  if(data != undefined) {
    resetCanvas();
    // render the food
    if(data.food != undefined){
      display(data.food, data.food.color);
    }
    // render the players
    for(var player in data.players){
      render(data.players[player].color, data.players[player].coordinate);
      console.log("id:"+client.id+"\t nick:"+client.snickName);
    }
  }
});

// take a coordinate array of a player, and color to render a snake
function render(color, coordinates){
  for(var i in coordinates){
    display(coordinates[i], color);
  }
}

// plot a cell on canvas using the given coordinate obj {x:y} and color
function display(coordinate, color) {
  context.fillStyle = color;
  context.fillRect(coordinate.x * gridSize, coordinate.y * gridSize, 5, 5);
  context.strokeStyle = "white";
  context.strokeRect(coordinate.x * gridSize, coordinate.y * gridSize, 5, 5);
}

// reset the canvas before redraw the new state of the game
function resetCanvas(){
  // Reset the canvas
  var width = canvas.clientWidth;
  var height = canvas.clientHeight;
  context.clearRect(0,0,width, height);
}

// create a uniqe id
function newID(){
  var randomlyGeneratedUID = Math.random().toString(36).substring(3,16)+ +new Date;
  return randomlyGeneratedUID;
}