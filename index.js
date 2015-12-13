var port = process.argv[2] || 12345, // command line arg
	
	io = require('socket.io'),
	express = require('express'),
	UUID = require('node-uuid'),

	http = require('http'),
	app = express(),
	server = http.createServer(app);

app.use(express.static('public'));

// Express server for file redirection
server.listen(port);

console.log("\t Running server on port:" + port);

app.get('/', function(req, res) {
	console.log('trying to load %s', __dirname + '/index.html');
    res.sendFile(__dirname + '/index.html');
});



var sio = io.listen(server);

sio.sockets.on('connection', function(client) {
	console.log("New connection id:"+client.id);

	client.userid = UUID();
	
	client.on('join', function(data) {
		console.log(data);
	});

	client.emit('welcome', {id: 0});
});

