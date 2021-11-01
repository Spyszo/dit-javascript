socket = io.connect('http://localhost:5000') //ip serwera


socket.on('changeBackground',function (file_name) {
	board.setBackground(file_name);
})


socket.on('startPath', function(pos,settings,username){
	board.startPath(pos,settings,username)
})

socket.on('continuePath', function(data,username){
	board.continuePath(data,username)
})

socket.on('endPath',function (username) {
	board.endPath(username)
})

socket.on('undoPath',function (username) {
	board.undoPath(username)
})

socket.on('delete',function (username) {
	board.deletePaths(username)
})

socket.on('old_paths',function (data) {
	console.log("OLD:")
	console.log(data)
	started = false
	for (x in Object.keys(data)){
		var line = data[x]
		if (line.status == "start"){
			started = true
			board.startPath(line.line,line.settings,line.username)
		}
		if (line.status == "end" && started){
			board.endPath(line.username)
		}	
		if (line.status == "continue" && started){
			board.continuePath(line.line,line.username)
		}
	}
})

socket.on('new_user',function (username) {
	$("div.alert").html(username + " dołączył(a)")
	$("div.alert").toggleClass("show");
	setTimeout(function(){ $("div.alert").toggleClass("show"); }, 3000);
})


socket.on('online_users', function(data) {
	console.log("Online",data)
	$('#nicknames').html("");
	nick_list = []
	nick_list.push(localSettings.username);
	var x = 1;
	$('#nicknames').append("<p onmouseover='mouseOverPath(this)' onmouseout='mouseOutOfPath(this)' onclick='nick_visibility(this)' class='nickname your_nickname'>" + localSettings.username + " (Ty)<span class='material-icons'>visibility</span></p>");
	for (i=0;i<data.length;i++){
		if (data[i] !=localSettings. username){
			nick_list.push(data[i]);
			$('#nicknames').append("<p onmouseover='mouseOverPath(this)' onmouseout='mouseOutOfPath(this)' onclick='nick_visibility(this)' class='nickname'>" + data[i] + "<span class='material-icons'>visibility</span></p>")
			x += 1;
		}
	}
	$('#online_users').html(x)
})

function checkIfOnline(nick){
	for (var j = 0;j<nick_list.length;j++){
		if (nick_list[j] == nick) {return true;}
	}
	return false
}

socket.on('users_in_canvas', function(data) {
	for (i=0;i<data.length;i++){
		if (checkIfOnline(data[i]) == false){
			$('#nicknames').append("<p onmouseover='mouseOverPath(this)' onmouseout='mouseOutOfPath(this)' onclick='nick_visibility(this)' class='offline_user nickname'>" + data[i] + "<span class='material-icons'>visibility</span></p>")
		}
	}
})

socket.on('client_create_room_ID',function(id) {
	console.log(id)
	$('#create_room_ID').val(id)
	setCookie('room',id);
})