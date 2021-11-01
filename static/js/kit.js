function draw_preview(width){
	var stage = new Konva.Stage({
		container: 'brush_preview_canvas',
		width: 400,
		height: 100,
		id: "preview_canvas"
	});
	
	var layer = new Konva.Layer();

	var redLine = new Konva.Line({
        points: [30, 60, 160, 30, 250, 70, 370, 30],
        stroke: 'red',
        strokeWidth: width,
        lineCap: 'round',
        lineJoin: 'round',
	  });
	  layer.add(redLine);
	  stage.add(layer);
}

function updateTextInput(val) {
    localSettings.strokeWidth = val;
    board.cursor.changeWidth(val)
    $('#brush_width_number').html(val);
    draw_preview(val)
}


$(".icon-button").click(function(){
    if(this.id == "undo"){
        board.undoPath(localSettings.username);
		socket.emit("undoPath",localSettings.username);
    }
    else if(this.id == "redo"){
        var path = board.redoPath(localSettings.username);
		if (path){
			var points = []
			for(j in path.points()){
				if(j% 2 != 0){
					points.push({
						x: path.points()[j-1],
						y: path.points()[j],
					})
				}
			}
			var settings = {
				stroke: path.stroke(),
				strokeWidth: path.strokeWidth(),
				lineJoin: path.lineJoin(),
				lineCap: path.lineCap(),
				globalCompositeOperation:
				mode === 'brush' ? 'source-over' : 'destination-out',
				tension: path.tension(),
			}

			socket.emit("redoPath",points,settings,localSettings.username);
		}
    }
    else if(this.id == "print"){
        var image = stage.toDataURL();
		var img = document.getElementById("print_boxIMG");
		img.src = image;
		$("#print_box_window").show();
		$("#print_box").toggleClass('show_printbox')
    }
    else if(this.id == "delete"){
        board.deletePaths(localSettings.username);
		socket.emit("delete",localSettings.username);
    }

    else if(this.id == "palette"){
		$("#popWindow_palette").addClass('popWindow_show')
		$(".popWindow_container").css("visibility","visible")
		$(".popWindow_container").css("opacity","1")
    }

    else if(this.id == "brush"){
		draw_preview(4)
        $("#popWindow_brush").addClass('popWindow_show')
		$(".popWindow_container").css("visibility","visible")
		$(".popWindow_container").css("opacity","1")
    }
})

$('div.color').click(function(){
	$("div.paleta_kolorow").toggleClass("show");
	paleta_show = false;
	localSettings.stroke = $(this).css("background-color");
	board.cursor.changeColor(localSettings.stroke)
});

$(".popWindow_container").click(function(event){
	if (event.target.className == "popWindow_container" || event.target.className == "color") {
		$(".popWindow_container").css("visibility","hidden")
		$(".popWindow_container").css("opacity","0")
		$(".popWindow").removeClass('popWindow_show')
	}
})


