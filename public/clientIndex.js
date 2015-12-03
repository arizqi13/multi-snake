var socket = io();

$('#userInput').submit(function(){
	socket.emit('join', $('#nickName').val());
	window.location.replace("/game.html")
});