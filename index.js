var port = process.argv[2] || 12345, // command line arg
	io = require('socket.io'),
	express = require('express'),
	app = express();

app.listen(port);

console.log('Listening on port: ' + port);

app.get('/', function(req, res) {
	res.sendFile(__dirname + '/index.html');
});