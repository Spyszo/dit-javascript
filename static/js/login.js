(function() {
	if (!localStorage.getItem('cookieconsent')) {
		document.body.innerHTML += '\
		<div class="cookieconsent" style="position:fixed;padding:20px;left:0;bottom:0;background-color:#000;color:#FFF;text-align:center;width:100%;z-index:99999;">\
			This site uses cookies. By continuing to use this website, you agree to their use. \
			<a href="#" style="color:#CCCCCC;">I Understand</a>\
		</div>\
		';
		document.querySelector('.cookieconsent a').onclick = function(e) {
			e.preventDefault();
			document.querySelector('.cookieconsent').style.display = 'none';
			localStorage.setItem('cookieconsent', true);
		};
    }	
})();

localSettings.username = $("#your_nick").html();

$('#nicknames').html("<p onmouseover='mouseOverPath(this)' onmouseout='mouseOutOfPath(this)' onclick='nick_visibility(this)' class='nickname your_nickname'>" + localSettings.username + " (Ty)<span class='material-icons'>visibility</span></p>");

var room = getCookie('room');
if (room) {
    socket.emit('user_login',localSettings.username,room);
}
else {
    socket.emit('user_login',localSettings.username, "");
}



            let clipboard = new ClipboardJS('#copy_button');
    clipboard.on('success', function(event = ClipboardJS.Event) {
        event.clearSelection();
        if ($("#create_room_ID").val() != "Copied!"){

			var temp = $("#create_room_ID").val()
			$("#create_room_ID").val("Copied!")
			$("#create_room_ID").css('background-color','#00e676')
			setTimeout(function(){ 
				$("#create_room_ID").val(temp); 
				$("#create_room_ID").css('background-color','white')
			}, 1000);
		}
	});

$('form').submit(function (e) {
    e.preventDefault();
})


function quality_input_change(e){
    $("#quality_number").html(e.value)
}


function show_user_settings(){
	if( $('.user_settings').css('display') == 'none' ){
		$(".user_settings").show();
	} else {
		$(".user_settings").hide();
	}
}

$(document).click(function(e){
	var container = $(".user_settings");
	var button = $(".settings_button");

	if (!container.is(e.target) && container.has(e.target).length === 0 && !button.is(e.target) && button.has(e.target).length === 0){
		container.hide();		
	}
	
})