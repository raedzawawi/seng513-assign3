var app = require('express')();
var path = require('path');
var http = require('http').Server(app);
var io = require('socket.io')(http);
var express = require('express');
var moment = require('moment');
var parseColour = require('parse-color');

var users = {};
var colors = {};
var namesUsed = [];
var counter = 0;

app.get('/', function(req, res){
  res.sendFile(__dirname + '/public/index.html');
});

io.on('connection', function(socket){
  socket.on('new user', function() {
    console.log('a user connected with id:' + socket.id);
    var username = "User" + Math.floor((Math.random() * 1000) + 1);
    users[socket.id] = username;
    io.emit('new signin', users, socket.id);
    io.emit('update users',users);
  });

  io.emit('update users', users);

  socket.on('chat message', function(msg) {
    console.log('message: ' + msg);

    var nickregex = new RegExp('(\/nick) (.*)');
    var colorregex = new RegExp('(\/nickcolor) (.*)');
    var nickCheck = nickregex.exec(msg);
    var colorCheck = colorregex.exec(msg);


    if(nickCheck) {
      var bol = 0;
      console.log("Herro!");
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

    if (colorCheck) {
      var inputtedColor = parseColour("#" + colorCheck[2]);
      if (inputtedColor.hex) {
        console.log("Heroku!");
        colors[socket.id] = inputtedColor.hex;
      }
    }

    var information = {
      id: socket.id,
      username: users[socket.id],
      message: msg,
      color: colors[socket.id],
      timestamp: moment().format("MMM/DD/YYYY - kk:mm")
    };

    io.emit('print message',information);
  });

  socket.on('disconnect', function(){
    console.log('user disconnected');
    delete users[socket.id];
    io.emit('update users', users);
  });

});

http.listen(3000, function(){
  console.log('listening on *:3000');
});