var socket = io();

$('#userInput').submit(function(){
	socket.emit('join', $('#nickName').val());
});