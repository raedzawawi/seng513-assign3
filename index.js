var app = require('express')();
var path = require('path');
var http = require('http').Server(app);
var io = require('socket.io')(http);
var express = require('express');
var moment = require('moment');
var parseC = require('parse-color');

var users = {};
var colors = {};

// Sample code used from https://socket.io/get-started/chat/

app.get('/', function(req, res){
  res.sendFile(__dirname + '/public/index.html');
});

io.on('connection', function(socket){
  socket.on('new user', function() {
    console.log('a user connected');
    var username = "User" + Math.floor((Math.random() * 1000) + 1);
    users[socket.id] = username;
    io.emit('new signin', users, socket.id);
    io.emit('update users',users);
  });

  io.emit('update users', users);

  // On each message sent
  socket.on('chat message', function(msg) {

    var nickregex = new RegExp('(\/nick) (.*)');
    var colorregex = new RegExp('(\/nickcolor) (.*)');
    var nickCheck = nickregex.exec(msg);
    var colorCheck = colorregex.exec(msg);

    // Check if someone is changing their username
    if(nickCheck) {
      var bol = 0;
      for (u in users) {
        if(users[u] == nickCheck[2]) {
          bol = 1;
        }
      }
      if (bol === 0) {
        users[socket.id] = nickCheck[2];
      }
      io.emit('update users',users);
    }

    // Check if someone is changing the color of their username
    if (colorCheck) {
      var inputtedColor = parseC("#" + colorCheck[2]);
      if (inputtedColor.hex) {
        colors[socket.id] = inputtedColor.hex;
      }
    }

    // Store the information in an object
    var information = {
      id: socket.id,
      username: users[socket.id],
      message: msg,
      color: colors[socket.id],
      time: moment().format("MMM Do YY, h:mm")
    };

    io.emit('print message',information);
  });

  // When the user disconnects delete the user from the list
  socket.on('disconnect', function(){
    console.log('user disconnected');
    delete users[socket.id];
    io.emit('update users', users);
  });

});

http.listen(3000, function(){
  console.log('listening on *:3000');
});