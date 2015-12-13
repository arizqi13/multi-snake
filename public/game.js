var socket = io(),
	canvas = document.getElementById('gameField'),
	ctx = canvas.getContext('2d')
	nick = null,
	id = null;

window.onbeforeunload = function () {
	if (id) {
		return false;
	}
};

$(document).ready(function(){
	$("#gameField").hide();

	var queryString = window.location.search;

	if (queryString.length > 0) {
		var qs = queryString.slice(1).split('&', 1);

		for (var i in qs) {
			var temp = qs[i].split("=");

			if (temp[0] === "nick") {
				nick = temp[1];
				break;
			}
		}
	}

	if (nick) {
		$("#gameField").show();
		socket.emit("join", {'nick': nick});
		$("#userInput").hide();
	}

	$("#userInput").on('submit', function(e) {
		e.preventDefault();

		nick = $("#nick").val();

		if (nick) {
			$("#gameField").show();
			window.location.search = '?nick='+nick;
			socket.emit("join", {'nick': nick});
			$("#userInput").hide();
		}

		return false;
	});
});
