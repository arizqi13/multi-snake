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

$(document).ready(function(){
	socket.emit('join');
})

$(document).keydown(function(e){
	var charCode = (e.which) ? e.which : e.keyCode;
	if(id != undefined && nickName != undefined){
		if(charCode === 38 || charCode === 87) {
		// Up arrow
			socket.emit('key','up');
		} else if(charCode === 40 || charCode === 83) {
		// Down arrow
			socket.emit('key','down');
		} else if(charCode === 39 || charCode === 68) {
		// Right arrow
			socket.emit('key','right');
		} else if(charCode === 37 || charCode === 65) {
		// Left arrow
			socket.emit('key','left');
		} else {
		// Not a control key
		}
	}
	return false;
});

socket.on('data', function(data){
	for(var i in data.players){
		var player = JSON.parse(data.players[i]);
		nickName = player.nickname;
		id = player.id;
		render(player.color, player.coordinate);
		console.log("id:"+id+"\t nick:"+nickName);
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