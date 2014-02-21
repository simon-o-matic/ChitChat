var express = require('express')
  , app     = express()
  , server  = require('http').createServer(app)
  , io      = require('socket.io').listen(server);

server.listen(8090);

app.use(express.static(__dirname + '/public'));

//app.get('/', function (req, res) {
 // res.sendfile(__dirname + '/index.html');
//});

var chitters = {};

io.sockets.on('connection', function (socket) {
	//chitters[socket.id] = socket; // save the name
  
  socket.broadcast.emit("user_arrive", "Someone arrived..");

  socket.on('message', function (data) {
  	socket.get('username', function (err, name) {
    	console.log(name + ">> " + data);
		  socket.broadcast.emit('message', {username: name, message: data});    		
  	})
	});

 	socket.on('login', function (name) {
    socket.set('username', name, function (err, name) {
		  socket.broadcast.emit('user_arrived', {username: name, message: data});    		
    });
	});

	socket.on('disconnect', function () {
   socket.get('username', function (err, name) {
      socket.broadcast.emit('user_left', name);       
    });
	});
});