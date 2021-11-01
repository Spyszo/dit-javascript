var express = require('express');
var app = express();
var http = require('http').createServer(app);
var path = require('path');
const { NONAME } = require('dns');
var io = require('socket.io')(http);
var bodyParser = require('body-parser');
var session = require('express-session');
var sharedsession = require('express-socket.io-session');
var mongoose = require('mongoose');

mongoose.connect(
  "mongodb+srv://szymon:szymon@cluster0.yfwbg.mongodb.net/DIT_Javascript?retryWrites=true&w=majority",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  },
  (err) => {
    if (err) throw err;
    console.log('MongoDB connection establisched');
  },
);

const userSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  username: { type: String, required: true },
});

mongoose.model('User', userSchema);

const User = require('mongoose').model('User');

app.use(express.static(path.join(__dirname, 'static')));

app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());

app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));


app.set('viev engine','ejs')

app.get('/', function(req, res){
  if (req.session.loggedin) {
		res.render('index.ejs',{username: req.session.username})
	} else {
		res.redirect('/login')
	}
	res.end();
});


app.post('/login', async function(req,res){
  var email = req.body.email_login;
	var password = req.body.password_login;
	if (email && password) {

    const user = await User.findOne({ email });
    if (!user) { 				
      res.render('login.ejs',{
        title: "DRAW IT",
        error: "Złe hasło lub nazwa użytkownika",
      }) 
      res.end()
      return
    }

    if (password === user.password) {
      req.session.loggedin = true;
      req.session.username = user.username;
      res.redirect('/');
    } else {
      res.render('login.ejs',{
        title: "DRAW IT",
        error: "Złe hasło lub nazwa użytkownika",
      })
    }	
    res.end();

	} else {
		res.render('login.ejs',{
      title: "DRAW IT",
      error: "Wprowadź nazwę użytkownika i hasło",
    })
	}
});

app.post('/register', async function(req,res){
  var username = req.body.username_register;
  var password = req.body.password_register;
  var email =    req.body.email_register;
  console.log(username,password,email)

	if (username && password && email) {

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.render('login.ejs',{
        title: "DRAW IT",
        error: "Użytkownik już istnieje",
      })
    }

    const newUser = new User({
      email,
      password,
      username
    });

    await newUser.save();

    res.redirect('/login');
  } 
  else {
		res.render('login.ejs',{
      title: "DRAW IT",
      error: "Wprowadź nazwę użytkownika, hasło oraz adres e-mail",
  })
}
  

});

app.get('/login', function(req, res) {
	res.render('login.ejs',{
    title: "DRAW IT",
    error: "",
  })
});

app.get('/logout', (req, res) => {
  if (req.session.user && req.cookies.user_sid) {
      res.clearCookie('user_sid');
      res.redirect('/');
  } else {
      req.session.loggedin = false;
      res.redirect('/login');
  }
});


var online_in_canvas = {}
var users = {};
var clients = {};
var roomData = {}


io.sockets.on('connection', function (client) { 

  if ( !client.id ) {
    client.disconnect();
    return;
  }

  if (clients[client.id]) {  
    clients[client.id].disconnect(); 
    clients[client.id] = client;   
  } else {                         
    clients[client.id] = client;     
  }

  function createRoomIfNotExist(roomID){
    if (!roomData[roomID]) {
      roomData[roomID] = {
        paths: [],
        board_settings: {
          texture: "None",
        },
        users: {}
      }
    }
  }

  function joinRoom (client) {
    client.join(client.roomID)
    client.emit("delete",client.username)
    createRoomIfNotExist(client.roomID)
    io.in(client.roomID).emit('new_user',client.nickname)
    var online = []
    for (x in Object.keys(users)) {
      if (users[Object.keys(users)[x]].roomID == client.roomID){
        online.push(Object.keys(users)[x])
      }
    }
    io.in(client.roomID).emit('online_users',online)
    io.in(client.roomID).emit('users_in_canvas',Object.keys(roomData[client.roomID].users))
    if (roomData[client.roomID].paths){
      console.log("emit")
      client.emit('old_paths',roomData[client.roomID].paths)
    }
  }

  client.on('client_join_room', function(id){
    client.leave(client.roomID)
    client.roomID = id
    users[client.nickname].roomID = id
    joinRoom(client,client.roomID)
    console.log(client.nickname,"dołączył do pokoju:", users[client.nickname].roomID)
    client.emit('client_create_room_ID',id)
  })

  client.on('client_create_room', function(){
    var online = []
    for (x in Object.keys(users)) {
      if (users[Object.keys(users)[x]].roomID == client.roomID){
        if (!Object.keys(users)[x] == client.nickname){
          online.push(Object.keys(users)[x])
        }
      }
    }
    io.in(client.roomID).emit('online_users',online)
    io.in(client.roomID).emit('users_in_canvas',Object.keys(roomData[client.roomID].paths))
    let random_id = Math.random().toString(36).substring(7);
    client.roomID = random_id
    client.emit('client_create_room_ID',random_id)
    joinRoom(client,client.roomID)
    users[client.nickname].roomID = random_id
    console.log(client.nickname,"dołączył do pokoju:", users[client.nickname].roomID)
  })
  
  client.on('startPath', function(pos,settings,username){
    client.to(client.roomID).emit('startPath',pos,settings,username)
    var data2 = {
      username:username,
      line: pos,
      settings: settings,
      status: "start",
    }
    createRoomIfNotExist(client.roomID)

    roomData[client.roomID].users[client.nickname] = "User"
    roomData[client.roomID].paths.push(data2)
  })

  client.on('continuePath', function(data,username){
    client.to(client.roomID).emit('continuePath',data,username)
    var data2 = {line:data, username:username, status: "continue",}
    roomData[client.roomID].paths.push(data2)
    //console.log(client.roomID)
  })

  client.on('endPath', function(username){
    client.to(client.roomID).emit('endPath',username)
    var data2 = {username:username, status:"end",}
    roomData[client.roomID].paths.push(data2)
    //console.log(roomData[client.roomID].paths)
  })

  client.on('undoPath', function(username){
    client.to(client.roomID).emit('undoPath',username)
    var paths_len = roomData[client.roomID].paths.length
    for (i = 1;i<=paths_len;i++){
      if(roomData[client.roomID].paths[paths_len-i].username == username){
        if (roomData[client.roomID].paths[paths_len-i].status == "start") {
          roomData[client.roomID].paths.pop()
          break;
        }
        roomData[client.roomID].paths.pop()
    }
    }
  })

  client.on('redoPath', function(pos,settings,username){
    client.to(client.roomID).emit('redoPath',username)
    for (i = 0;i<=pos.length;i++){
      if(i == 0){
        client.to(client.roomID).emit('startPath',pos[i],settings,username)
        var data2 = {
          username:username,
          line: pos[i],
          settings: settings,
          status: "start",
        }
      }
      else if (i == pos.length){
        console.log("end")
        client.to(client.roomID).emit('endPath',username)
        var data2 = {username:username, status:"end",}
        roomData[client.roomID].paths.push(data2)
      }
      else{
        client.to(client.roomID).emit('continuePath',pos[i],username)
        var data2 = {line:pos[i], username:username, status: "continue",}
        roomData[client.roomID].paths.push(data2)
      }

      roomData[client.roomID].paths.push(data2)
    }
  })

  client.on('changeBackground', function(file_name){
    client.to(client.roomID).emit('changeBackground',file_name)
    roomData[client.roomID].board_settings.texture = file_name
    console.log(roomData[client.roomID].board_settings.texture)
  })

  client.on('delete', function(username){
    client.to(client.roomID).emit('delete',username)
    if (roomData[client.roomID].paths) {
      roomData[client.roomID].paths = []
    }
  })

  client.on('user_login', function(user_login,room){ 
    client.nickname = user_login
    if (!users[client.nickname]){
      if (room == ""){
        client.roomID = Math.random().toString(36).substring(7)
      }
      else {
        client.roomID = room
      }
      console.log(client.roomID)
      users[client.nickname] = {
        ID: [client.id],
        roomID: client.roomID
      }

      joinRoom(client,client.roomID)
    }
    else {
      users[client.nickname].ID.push(client.id) 
      client.roomID = users[client.nickname].roomID

      joinRoom(client,users[client.nickname].roomID)
    }
    console.log("Użytkownik", client.nickname, "dołączył")
    console.log("ID użytkownika:",users[client.nickname].ID)
    console.log("Użykownicy online: " + Object.keys(users))
    client.emit('client_create_room_ID',client.roomID)

  })

  client.on('disconnect', function() {
    delete clients[client.id];
    if (users[client.nickname]){
      if (users[client.nickname].ID.length > 1){
        users[client.nickname].ID.pop(client.id)
      }
      else {
        console.log(client.nickname,"Wyszedł")
        delete users[client.nickname]
      }
      
      var online = []
      for (x in Object.keys(users)) {
        if (users[Object.keys(users)[x]].roomID == client.roomID){
          console.log("Po wyjściu:", Object.keys(users)[x])
          online.push(Object.keys(users)[x])
        }
      }
      client.to(client.roomID).emit('online_users',online)
      
      if (roomData[client.roomID]){
        client.to(client.roomID).emit('users_in_canvas',Object.keys(roomData[client.roomID].users))
      }
    }
  })
})


http.listen(5000, function(){
  console.log('listening on *:5000');
});
