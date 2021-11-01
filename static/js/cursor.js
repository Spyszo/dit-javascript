class cursorSet{
	constructor(color,width){
		this.color = color;
		this.width = width;
		this.createCursor();
		console.log("XD")
	}

	changeColor(color) {
		this.color = color;
		this.createCursor();
	}

	changeWidth(width){
		this.width = parseInt(width) + 2;
		this.createCursor();
	}

	createCursor(){
		var cursor = document.createElement('canvas');
		var ctx = cursor.getContext('2d');

		cursor.width = 30;
		cursor.height = 30;

		ctx.beginPath();
		ctx.arc(12, 12, this.width/2, 0, 2 * Math.PI);
		ctx.strokeStyle = this.color;
		ctx.stroke();
		ctx.fillStyle = this.color;
		ctx.fill();

		var element = document.getElementById("container");
		element.style.cursor = 'url(' + cursor.toDataURL() + ') 11 11, auto';
	}
}


