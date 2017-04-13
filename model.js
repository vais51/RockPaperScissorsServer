// nameRoom
// player1
  //player1.move
// player2
  //player2.move
var rooms = [];


//socket
//rooms
var users = [];
function findFreeUser(toPlayWith) {
  console.log("users.length" + users.length );
  for (var i = 0; i < users.length; i++ ) {
     console.log("users.length" + users.length );
     var user = users[i];
     if (user.rooms.length == 0 && user.socket != toPlayWith.socket) {
       return users[i];
     }
  }
  return null;
}

function createNewUser(socket) {
  console.log("createNewUser");
  return {
    socket,
    isReady:false,
    rooms:[]
  };
}

function randomName () {
  var words = "qwertyuiopasdfghjklzxcvbnm0123456789";
  var name = "";
  for(var i = 0; i < 10; i++){
    name += words.charAt(Math.random()*36);
  }
  return name;
}
function createMove() {
}
function createNewRoom(user1,user2){
  var roomName = randomName();
  user1.rooms.push(roomName);
  user2.rooms.push(roomName);
  var player1 = user1;
  var player2 = user2;
  var move = {};
  player1.move = "";
  player2.move = "";
  return {
    "name": roomName,
    "timeCreate": new Date().getTime(),
    "players": [player1, player2]
  };
}


function join(room) {
  for (var i = 0; i < room.players.length; i++) {
    var player = room.players[i];
    player.socket.join(room.name);
  }
}

module.exports = {
    findFreeUser:findFreeUser,
    createNewUser:createNewUser,
    randomName:randomName,
    createNewRoom:createNewRoom,
    join:join,
    rooms:rooms,
    users:users
};
