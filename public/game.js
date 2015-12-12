// (function(){
// 	"use strict";
// 	window.onload = function(){
// 		var ajax_load_data = new XMLHttpRequest();
// 	}
// })();

var socket = io();
var canvas = document.getElementById('gameField');
var context = canvas.getContext('2d');

var nickName;
var id;
var dir;

$(document).ready(function(){
	socket.emit('join');
})

$(document).keydown(function(e){
	var charCode = (e.which) ? e.which : e.keyCode;
	if(id != undefined && nickName != undefined){
		var data = {};
		data.id = id;
		if((charCode === 38 || charCode === 87) && dir != 'down') {
		// Up arrow
			data.direction = 'up';
			dir = 'up';
			socket.emit('key',data);
		} else if((charCode === 40 || charCode === 83) && dir != 'up') {
		// Down arrow
			data.direction = 'down';
			dir = 'down';
			socket.emit('key',data);
		} else if((charCode === 39 || charCode === 68) && dir != 'left') {
		// Right arrow
			data.direction = 'right';
			dir = 'right';
			socket.emit('key',data);
		} else if((charCode === 37 || charCode === 65) && dir != 'right') {
		// Left arrow
			data.direction = 'left';
			dir = 'left';
			socket.emit('key',data);
		} else {
		// Not a control key
		}
	}
	return false;
});

socket.on('incoming data', function(data){
	// TODO: set initial dir (global var for direction)
	for(var i=0;i<data.players.length;i++){
		var player = data.players[i];
		for(currId in player){
			id = currId;
			nickName = player[currId].nickname;
			render(player[currId].color, player[currId].coordinate);
			console.log("id:"+id+"\t nick:"+nickName);
		}
	}
});

function render(color, coordinates){
	resetCanvas();
	for(var i in coordinates){
		display(coordinates[i], color);
	}
}

function display(coordinate, color) {
	context.fillStyle = color;
	context.fillRect(coordinate[0], coordinate[1], 5, 5);
}

function resetCanvas(){
	// Reset the canvas
	var width = canvas.clientWidth;
	var height = canvas.clientHeight;
	context.clearRect(0,0,width, height);
}