// (function(){
// 	"use strict";
// 	window.onload = function(){
// 		var ajax_load_data = new XMLHttpRequest();
// 	}
// })();

var socket = io();
var canvas = $('#canvas')[0];
var context = canvas.getContext('2d');

document.onkeypress = function(e){
	var charCode = (e.which) ? e.which : e.keyCode;
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
	return false;
};

socket.on('incoming data', function(data){
// Do something with the received data
// Assuming the data will be jason contain cordinate of the current point
	display(data);
});

function display(coordinate) {
	// Reset the canvas
	var width = canvas.clientWidth;
	var height = canvas.clientHeight;
	context.clearRect(0,0,width, height);
	context.fillStyle = "red";
	context.fillRect(coordinate[0], coordinate[1], 5, 5);
}