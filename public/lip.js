var socket = io.connect('http://localhost');

//
// Message arrival handlers
//
socket.on('message', function (data) {
   $("#messages").append("<div><b>" + data.username + "</b>>> " + data.message + "</div>");
});
socket.on('arrival', function (data) {
    $("#messages").append("<div><b>" + data.username + "</b> has swankered in for a chat.");
});
socket.on('lurker', function (data) {
    $("#messages").append("<div>There is a new lurker in the house... (" + data + ")</div>");
});
socket.on('departure', function (data) {
    $("#messages").append("<div><b>" + data.username + "</b> has left the building.");
});
socket.on('switcharoo', function (data) {
    $("#messages").append("<div><b>" + data.oldname + "</b> has switched to " + data.newname);
});
socket.on('booted', function (data) {
    $("#messages").append("<div><b>You have been booted from reality. You are now lurking");
});
socket.on('lipsters', function(data) {
    var lipsters = "";
    for (var i = 0; i<data.length; i++) {
        lipsters +=  "<p>" + data[i] + "</p>" + "</br>";
    }
    $("#lipsters").html(lipsters);
})

//
// Click handlers
//
$("#send").click(function (e) {
    sendMessage($("#message").val()); 
});
$("#login").click(function (e) {
    socket.emit("login", {username: $("#username").val(), password: prompt('password')}, function (result) {
      if (result != 200) {
        alert("That login didn't really work so well. Try again?");
      }
    });
});
$("#message").keypress(function (e) {
    if (e.keyCode == 13) {
      sendMessage($("#message").val());
    }
});

//
// Helpers
//
function sendMessage(message) {
    socket.emit("message", message);
    $("#message").val("");
}
