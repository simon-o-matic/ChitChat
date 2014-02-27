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
  'locky': 'catan'
}

var chitters = {};

io.sockets.on('connection', function (socket) {
  socket.broadcast.emit("lurker", socket.handshake.address.address + ":" + socket.handshake.address.port);
  socket.emit("lipsters", Object.keys(chitters));

  socket.on('message', function (data) {
  	socket.get('username', function (err, name) {
     if (name) {
      	console.log(name + ">> " + data);
        broadcast("message", {username: name, message: data});
      }
  	})
	});

 	socket.on('login', function (credentials, fn) {
    console.log("login of " + credentials.username + " from " + socket.handshake.address.address + ":" + socket.handshake.address.port);
    
    // check for valid credentials
    if (!credentials.username || !credentials.password) {
      fn(403);
      return;
    } else if (secrets[credentials.username] != credentials.password) {
      fn(403);
      return;
    }

    // check if logged in somewhere else, thats fine just move them
    if (chitters[credentials.username]) {
      var oldSocket = chitters[credentials.username];
      chitters[credentials.username] = socket;
      fn(200);
      oldSocket.emit("booted","");
    }

    // Check if this socket has already logged in (a re-login)
    socket.get('username', function (err, name) {
      if (name) {
        // already logged in, so switch the name
        var existingSocket = chitters[name];
        delete chitters[name];
        chitters[credentials.username] = existingSocket;
        socket.set('username', credentials.username);
        io.sockets.emit("switcharoo", {oldname: name, newname: credentials.username });
        fn(200);
      } else {
        // its a brand spanking new login (by a lurker)
        chitters[credentials.username] = socket; 
        console.log(credentials.username  + " + logged in. Total users: " + Object.keys(chitters).length);
        io.sockets.emit("arrival", {username : credentials.username });
        socket.set('username', credentials.username );
        fn(200);    
      }
    });
	});

	socket.on('disconnect', function () {
   socket.get('username', function (err, name) {
      delete chitters[name];
      console.log(name + "left. Total users: " + Object.keys(chitters).length);
      var u = name || "Lurker";
      io.sockets.emit("departure", {username: u});
    });
	});

});

// helper function to send message to all "logged in" users
function broadcast(channel, message) {
  for (var s in chitters) {
    chitters[s].emit(channel, message)
  }
}
