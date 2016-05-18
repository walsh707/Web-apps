$(document).ready(function(){
	//seeting words to show up in debug
			dBug("document really is ready");
			//making the canvas + ful screen
			var canvas = $("#gameCanvas");
			var context = canvas.get(0).getContext("2d");

			context.canvas.width = window.innerWidth;
			context.canvas.height = window.innerHeight;


			
			
				// Lab 002 - Mosaic Pixel effect 
					function createMosaic(){
						var imageData = context.createImageData(500, 500);
						var pixels = imageData.data;

						// how big is it? 
							var numTileRows = 4; 
							var numTileCols = 4; 

							var tileWidth = imageData.width / numTileCols;
							var tileHeight = imageData.height / numTileRows;

							for(var r = 0; r < numTileRows; r++){
								for(var c = 0; c < numTileCols; c++) {
									var red = Math.floor(Math.random()*255);
									var green = Math.floor(Math.random()*255);
									var blue = Math.floor(Math.random()*255);
		
									for(var tr = 0; tr < tileHeight; tr++) {
										for(var tc = 0; tc < tileWidth; tc++) {
											var trueX = (c * tileWidth) + tc;
											var trueY = (r * tileHeight) + tr;

											var pos = (trueY * (imageData.width * 4)) + (trueX * 4);

											pixels[pos] = red;
											pixels[pos + 1] = green; 
											pixels[pos + 2] = blue; 
											pixels[pos + 3] = 255; // opacity (opaque)
										};
									};
								};
							};

							context.putImageData(imageData, 0, 0);
						}; // end of createMosaic() function 

						   createMosaic();



        		function dBug(data){
					console.log(data);
				};
});