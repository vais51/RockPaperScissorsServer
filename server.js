var express = require('express');
var app = express();
var model = require('./model.js');
var server = require('http').createServer(app).listen(4000);
var io = require('socket.io').listen(server);

io.sockets.on('connection', function(socket) {

    socket.on('join', function(username) {
      console.log("Hi");
      var user1 = model.createNewUser(socket);
      model.users.push(user1);
      var user2 = model.findFreeUser(user1);
      if(user2 == null) {
        // no free users will wait for another user
        return
      }
      var room = model.createNewRoom(user1, user2);
      model.rooms.push(room);
      model.join(room)
      io.sockets.in(room.name).emit('join', 'you in room: ' + room.name );
  });

    socket.on("Hi", function(text) {
      console.log("Hi");
      socket.emit('message', text);
    });

    socket.on("isReady", function(text) {
      console.log("true");
      for (var i = 0; i < model.rooms.length; i++) {
        var room = model.rooms[i];
        var players = room.players;
        for (var i = 0; i < players.length; i++) {
           if (players[i].socket == socket) {
             console.log("room.name: " +  room.name);
             players[i].isReady = true;
           }

        }
        if (players[0].isReady && players[1].isReady) {
            room.timeCreate = new Date().getTime();
            io.sockets.in(room.name).emit('opIsReady', true, room.timeCreate);
        }
      }

    });

    socket.on("isNotReady", function(text) {
      console.log("true");
      socket.broadcast.to(socket.room).emit('opIsNotReady', true);
    });

    // socket.on("time", function(time) {
    //   var roomName;
    //   for (var i = 0; i < model.users.length; i++) {
    //     if (model.users[i].socket == socket) {
    //       roomName = model.users[i].rooms[0];
    //     }
    //   }
    //   console.log("time" + time);
    //   var i = time;
    //   var timerId = setInterval(function() {
    //     io.sockets.in(roomName).emit('time', i );
    //     i--;
    //     if (i == 0) {
    //       myStopFunction();
    //     }
    //   }, 1000);
    //   function myStopFunction() {
    //     clearTimeout(timerId);
    //   }
    // });

    socket.on("leaveFromRoom", function(text) {
        socket.leave(socket.room);
    });

    socket.on("move", function(move){
      var obj;
      console.log("move: " + move);
        for (var i = 0; i < model.rooms.length; i++) {
          var room = model.rooms[i];
          var players = room.players;
          for (var i = 0; i < players.length; i++) {
             if (players[i].socket == socket) {
               console.log("players[i].move = " + move);
                players[i].move = move;
             }
          }

          if (players[0].move != "" && players[1].move != "" ) {
            console.log("players[0].move !=  && players[1] != ");
              if (players[0].socket == socket) {
                  console.log("players[0].move,players[1].move" + players[0].move + " " + players[1].move);
                    socket.emit("moves",players[0].move,players[1].move);
                    socket.broadcast.to(players[0].rooms[0])
                      .emit("moves",players[1].move,players[0].move);
                  }
              else {
                console.log("players[1].move,players[0].move" + players[1].move + " " + players[0].move);
                    socket.emit("moves",players[1].move,players[0].move);
                    socket.broadcast.to(players[0].rooms[0])
                      .emit("moves",players[0].move,players[1].move);
              }
            players[0].move = "";
            players[1].move = "";
          }
        }
    });

    socket.on('disconnect', function() {
        // Если потеряна связь с пользователем
        console.log("user:" + socket + "disconnect");
        // leave from all players
        // socket.leave(socket.room);
        // delete of user from array user
        var deleteUser;
        var deleteUser2;
        for (var i = 0; i < model.users.length; i++) {
          //undefined
          if (model.users[i].socket == socket) {
            console.log("deleteUser i: " + i);
            deleteUser = model.users[i];
          }
        }

        if (deleteUser != null) {
          //delete model.users[model.users.indexOf(deleteUser)];
          console.log("Socket.broadcast.to(deleteUser.roomName)" + model.users[model.users.indexOf(deleteUser)].rooms[0]);
          socket.broadcast.to(model.users[model.users.indexOf(deleteUser)].rooms[0])
            .emit("endGame", true);
          socket.leave(model.users[model.users.indexOf(deleteUser)].rooms[0]);
          // remove(model.users, deleteUser);
          model.users.splice(model.users.indexOf(deleteUser), 1);
        }
        // for (var i = 0; i < model.rooms.length; i++) {
        //   var room = model.rooms[i];
        //   for (var i = 0; i < room.players.length; i++) {
        //     var player = room.players[i];
        //     if (player.socket == socket) {
        //       delete model.users[model.users.indexOf(deleteUser)];
        //     }
        //   }
        // }
    });

    socket.on('searchOpponentAgain', function() {
        // Если потеряна связь с пользователем
        console.log("user again:" + socket + "disconnect");
        // leave from all players
        // socket.leave(socket.room);
        // delete of user from array user
        var deleteUser;
        var deleteRoom;
        for (var i = 0; i < model.users.length; i++) {
          if (model.users[i].socket == socket) {
            deleteUser = model.users[i];
            console.log("again model.users[i].rooms.length" +  model.users[i].rooms.length);
            model.users[i].rooms.splice(0,model.users[i].rooms.length);
            console.log("again model.users[i].rooms.length" +  model.users[i].rooms.length);
            console.log("deleteUseri: " + i);
          }
        }
        for (var i = 0; i < model.rooms.length; i++) {
          var room = model.rooms[i];
          for (var j = 0; j < room.players.length; j++) {
            var player = room.players[j];
            if (player.socket == socket) {
              deleteRoom = room;
              console.log("deleteRoomi: " + i);
            }
          }
        }
        if (deleteUser != null && deleteRoom != null) {
          socket.leave(model.users[model.users.indexOf(deleteUser)].rooms[0]);
          // remove(model.users, deleteUser);
          // remove(model.rooms, deleteRoom);
          // model.users.splice(model.users.indexOf(deleteUser), 1);
          console.log(" model.rooms.length" +  model.rooms.length);
          model.rooms.splice(model.rooms.indexOf(deleteRoom), 1);
          console.log(" model.rooms.length" +  model.rooms.length);
        }
    });

    socket.on('deleteRoom', function() {
        // Если потеряна связь с пользователем
        console.log("user:" + socket + "disconnect");
        // leave from all players
        // socket.leave(socket.room);
        // delete of user from array user
        var deleteUser;
        var deleteRoom;
        for (var i = 0; i < model.users.length; i++) {
          if (model.users[i].socket == socket) {
            deleteUser = model.users[i];
            console.log("deleteUseri: " + i);
          }
        }
        for (var i = 0; i < model.rooms.length; i++) {
          var room = model.rooms[i];
          console.log(" room.players.length" +  room.players.length);
          for (var j = 0; j < room.players.length; j++) {
            var player = room.players[j];
            console.log(" player.socket" +  player.socket);
            console.log(" player.rooms" +  player.rooms[0]);
            if (player.socket == socket) {
              deleteRoom = room;
              console.log("deleteRoomi: " + i);
            }
          }
        }
        if (deleteUser != null && deleteRoom != null) {
          socket.leave(model.users[model.users.indexOf(deleteUser)].rooms[0]);
          // remove(model.users, deleteUser);
          // remove(model.rooms, deleteRoom);
          model.users.splice(model.users.indexOf(deleteUser), 1);
          model.rooms.splice(model.rooms.indexOf(deleteRoom), 1);
        }
    });
 });

console.log('Running a GraphQL API server at localhost:4000/graphql');
