console.log("Start");

localSettings = {
	stroke: '#000000',
	strokeWidth: 5,
	lineJoin: "round",
	lineCap: "round",
	globalCompositeOperation:
    mode === 'brush' ? 'source-over' : 'destination-out',
	tension: 1,
}
//Konva.pixelRatio = 1;

// first we need Konva core things: stage and layer
var stage = new Konva.Stage({
	container: 'container',
	width: 1930,
	height: 910,
	id: "C"
});

var layer = new Konva.Layer();
stage.add(layer);

var isPaint = false;
var lastPointerPosition;
var mode = 'brush';
//Konva.dragDistance = 1000


board = {
	paths: {},

	startPath: function(pos, settings,username){
		if (!this.paths[username]){
			this.paths[username] = []
		}
		this.paths[username].push(new Konva.Line({
			stroke: settings.stroke,
			strokeWidth: settings.strokeWidth,
			lineJoin: settings.lineJoin,
			lineCap: settings.lineCap,
			globalCompositeOperation:
			mode === 'brush' ? 'source-over' : 'destination-out',
		}));

		var lastPath = board.paths[username][board.paths[username].length -1]
		lastPath.points([pos.x, pos.y]),
		layer.add(lastPath);
		console.log("Starting line")
	},

	continuePath: function(pos,username) {
		var lastPath = this.paths[username][this.paths[username].length -1]
		newPoints = lastPath.points().concat([pos.x, pos.y]);
		lastPath.points(newPoints);
		layer.batchDraw();
		console.log("Continue line")
	},

	endPath: function(username) {
		var lastPath = this.paths[username][this.paths[username].length -1]

		if(lastPath.points().length <= 2){
			this.paths[username].pop()
			return
		}

		var points = []
		for(j in lastPath.points()){
			if(j% 2 != 0){
				points.push({
					x: lastPath.points()[j-1],
					y: lastPath.points()[j],
				})
			}
		}

		simp = simplify(points,0.5)
		points = []
		for (x in simp){
			points.push(simp[x].x);
		 	points.push(simp[x].y);
		}
		lastPath.points(points)
		lastPath.tension(0.5)
		layer.batchDraw();
		console.log("Ending line")
	},

	undoList: [],
	undoPath: function(username){
		if (username && this.paths[username].length) {
			for(x in this.paths[username]){
				if (this.paths[username][this.paths[username].length-1 -x].isVisible()){
					this.paths[username][this.paths[username].length-1 -x].visible(false);
					if (username == localSettings.username){
						this.undoList.push(this.paths[username][this.paths[username].length-1 -x])
					}
					console.log(this.paths[username][this.paths[username].length-1 -x])
					break;
				}
			}
			layer.batchDraw();
			console.log("Undo line")
		}
	},

	redoPath: function(){
		if (this.undoList.length > 0){
			var last = this.undoList.pop()
			last.visible(true);
			layer.batchDraw();
			console.log("Redo line")
			return last
		}
	},

	deletePaths: function(username){
		if (this.paths[username]){
			for(x in this.paths[username]){
				this.paths[username][this.paths[username].length -x-1].visible(false);
			}
		}
		else {
			console.log("Paths deleted - new room");
			layer.remove()
			layer = new Konva.Layer();
			stage.add(layer);
		}
		layer.batchDraw();
	},

	selectPaths: function(username){
		if (this.paths[username]){
			for (i=0;i<this.paths[username].length;i++){
				this.paths[username][i].fullySelected = true;
			};
		};
	},

	unselectPaths: function(username){
		if (this.paths[username]){
			for (i=0;i<this.paths[username].length;i++){
				this.paths[username][i].fullySelected = false;
			};
		};
	},

	showPaths: function(username){
		if (this.paths[username]){
			for (i=0;i<this.paths[username].length;i++){
				this.paths[username][i].visible = true;
			};
		};
	},

	hidePaths: function(username){
		if (this.paths[username]){
			for (i=0;i<this.paths[username].length;i++){
				this.paths[username][i].visible = false;
			};
		};
	},

	setBackground: function(){},

	cursor:	new cursorSet("black",5),

	changeColor: function(color){
		localSettings.stroke = color;
        this.cursor.changeColor(localSettings.stroke)
	}
};


stage.on('mousedown touchstart', function() {
	console.log("Started")
	isPaint = true;
	step = 0

	lazy = new LazyBrush({
		radius: 3,
		enabled: true,
		initialPoint:  stage.getPointerPosition()
	})
});


stage.on('mousemove touchmove', function() {
	if (!isPaint) {
		return;
	}

	step += 1
	if (step == 1){
		board.startPath(stage.getPointerPosition(),localSettings,localSettings.username)
		socket.emit("startPath", stage.getPointerPosition(),localSettings,localSettings.username);
	}

	var pos = stage.getPointerPosition();
	lazy.update(pos)
	pos = lazy.getBrushCoordinates()

	board.continuePath(pos,localSettings.username)
	socket.emit("continuePath",pos,localSettings.username);

	stage.on('mouseleave', function() {
		isPaint = false;
		board.endPath(localSettings.username)
		socket.emit("endPath",localSettings.username);
		return
	});
});



stage.on('mouseup touchend', function() {
	isPaint = false;
	if (step >= 1){
		board.endPath(localSettings.username)
		socket.emit("endPath",localSettings.username);
	}
});


$(document).click(function(e){
	var container = $(".online_list_users");
	var button = $(".online_list");

	if (!container.is(e.target) && container.has(e.target).length === 0 && !button.is(e.target) && button.has(e.target).length === 0){
		container.hide();
	}
})

$("#online_list_button").click(function(){
	if( $('.online_list_users').css('display') == 'none' ){
		$(".online_list_users").show();
	} else {
		$(".online_list_users").hide();
	}
});



$('#file_save').click(function(){
	if ($("#filename").val()){
		download($("#filename").val(), $("input[name='filetype']:checked").val(), $("#filequality").val());
	};
});


$('#join_room').click(function(){
	socket.emit("client_join_room",$('#room_name').val());
});

$('#create_room').click(function(){
	socket.emit("client_create_room");
	$("#create_room_ID").css('background-color','#00e676');
	setTimeout(function(){ $("#create_room_ID").css('background-color','white')}, 2000);
});





$('#session_button').click(function(){
	if( $('.session').css('display') == 'none' ){
		$(".session").show();
	} else {
		$(".session").hide();
	}
});






var ctrlMode = false;
var zMode = false;
$(document).keydown(function(e){
	if(e.ctrlKey && ctrlMode == false){
		ctrlMode = true;
		$(document).keydown(function(e){
			if(e.keyCode == 90 && zMode == false){
				zMode = true;
				board.undoPath(localSettings.username);
				socket.emit("undoPath",localSettings.username);
			};
		});
	};
});

$(document).keyup(function(e){
	zMode = false;
	ctrlMode = false;
});




function downloadURI(uri, name) {
	var link = document.createElement('a');
	link.download = name;
	link.href = uri;
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
	delete link;
  }


function download(filename,type,quality) {
	var dataURL = stage.toDataURL();
	if (type == "jpeg"){
		var dataURLJ = stage.toCanvas()
		var dataURL = dataURLJ.toDataURL('image/jpeg',quality/10);
	}
    downloadURI(dataURL, filename);
}


$("p.light").click(function(){
	$( "link.css2" ).replaceWith( "<link href='css/style.css' rel='stylesheet' class='css1'>" );

});
$("p.dark").click(function(){
	$( "link.css1" ).replaceWith( "<link href='css/dark.css' rel='stylesheet' class='css2'>" );
});


