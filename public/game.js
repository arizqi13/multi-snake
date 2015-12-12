// (function(){
// 	"use strict";
// 	window.onload = function(){
// 		var ajax_load_data = new XMLHttpRequest();
// 	}
// })();

var socket = io();
var canvas = document.getElementById('gameField');
var context = canvas.getContext('2d');
var gridSize = 5;
var client = {};
client["nickName"]=null;
client["id"] = null;
client["direction"]=null;

$(document).ready(function(){
	socket.emit('join');
})

$(document).keydown(function(e){
	var charCode = (e.which) ? e.which : e.keyCode;
	if(client.id != undefined && client.nickName != undefined){
		var data = {};
		data.id = client.id;
		if((charCode === 38 || charCode === 87) && client.direction != 'down') {
		// Up arrow
			data.direction = 'up';
			client.direction = 'up';
			socket.emit('key',data);
		} else if((charCode === 40 || charCode === 83) && client.direction != 'up') {
		// Down arrow
			data.direction = 'down';
			client.direction = 'down';
			socket.emit('key',data);
		} else if((charCode === 39 || charCode === 68) && client.direction != 'left') {
		// Right arrow
			data.direction = 'right';
			client.direction = 'right';
			socket.emit('key',data);
		} else if((charCode === 37 || charCode === 65) && client.direction != 'right') {
		// Left arrow
			data.direction = 'left';
			client.direction = 'left';
			socket.emit('key',data);
		} else {
		// Not a control key
		}
	}
	return false;
});

socket.on('incoming data', function(data){
	// TODO: set initial dir (global var for direction)
	if(data != undefined) {
		resetCanvas();
		for(var player in data.players){
		// var player = data.players[i];
			client.id = player;
			client.nickName = data.players[player].nickname;
			client.direction = data.players[player].direction;
			render(data.players[player].color, data.players[player].coordinate);
			console.log("id:"+client.id+"\t nick:"+client.snickName);
		}
	}
});

function render(color, coordinates){
	for(var i in coordinates){
		display(coordinates[i], color);
	}
}

function display(coordinate, color) {
	context.fillStyle = color;
	context.fillRect(coordinate.x * gridSize, coordinate.y * gridSize, 5, 5);
	context.strokeStyle = "white";
	context.strokeRect(coordinate.x * gridSize, coordinate.y * gridSize, 5, 5);
}

function resetCanvas(){
	// Reset the canvas
	var width = canvas.clientWidth;
	var height = canvas.clientHeight;
	context.clearRect(0,0,width, height);
}