$(document).ready(function(){
	//seeting words to show up in debug
		dBug("document fucking is ready");
		//making the canvas + ful screen
			var canvas = $("#gameCanvas");
			var context = canvas.get(0).getContext("2d");

			



				var image = new Image();
				image.src = "images/bg.jpg";
				
				$(image).load(function() {
				context.drawImage(image, 0, 0, 416, 423, 0, 0, 500, 500);
				
					var imageData = context.getImageData(0, 0, canvas.width(), canvas.height());
					var pixels = imageData.data;
				
					context.clearRect(0, 0, canvas.width(), canvas.height());
				
					var numTileRows = 50;
					var numTileCols = 50;
					var tileWidth = imageData.width/numTileCols;
					var tileHeight = imageData.height/numTileRows;
				
					for (var r = 0; r < numTileRows; r++) {
						for (var c = 0; c < numTileCols; c++) {

							var x = (c*tileWidth)+(tileWidth/2);
							var y = (r*tileHeight)+(tileHeight/2);
							var pos = (Math.floor(y)*(imageData.width*4))+(Math.floor(x)*4);

							var red = pixels[pos];
							var green = pixels[pos+1];
							var blue = pixels[pos+2];
							context.fillStyle = "rgb("+red+", "+green+", "+blue+")";
							context.fillRect(x-(tileWidth/2), y-(tileHeight/2), tileWidth, tileHeight);
						};
					};
	

				});







        		function dBug(data){
					console.log(data);
				};
});