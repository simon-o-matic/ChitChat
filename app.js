var express = require('express')
  , app     = express()
  , server  = require('http').createServer(app)
  , io      = require('socket.io').listen(server);

server.listen(8090);

app.use(express.static(__dirname + '/public'));

var secrets = {
  'gabe': 'cello',
  'isaac': 'fatty',
  'paddy': 'hawksbeast',
  'lochy': 'catan'
}

var chitters = {};

io.sockets.on('connection', function (socket) {
  socket.broadcast.emit("lurker", socket.handshake.address.address + ":" + socket.handshake.address.port);

  socket.on('message', function (data) {
  	socket.get('username', function (err, name) {
     if (name) {
      	console.log(name + ">> " + data);
        broadcast("message", {username: name, message: data});
      }
  	})
	});

 	socket.on('login', function (credentials) {
    console.log("login of " + credentials.username + " from " + socket.handshake.address.address + ":" + socket.handshake.address.port);
    if (secrets[credentials.username] != credentials.password) {
      return 403;
    }
    chitters[credentials.username] = socket; 
    console.log(credentials.username  + " + logged in. Total users: " + Object.keys(chitters).length);
    io.sockets.emit("arrival", {username : credentials.username });
    socket.set('name', credentials.username );
	});

	socket.on('disconnect', function () {
   socket.get('username', function (err, name) {
      delete chitters[name];
      console.log(name + "left. Total users: " + Object.keys(chitters).length);
      var u = name || "Lurker";
      io.sockets.emit("departure", {username: u});
    });
	});

  function broadcast(channel, message) {
    for (var s in chitters) {
      chitters[s].emit(channel, message)
    }
  }
});