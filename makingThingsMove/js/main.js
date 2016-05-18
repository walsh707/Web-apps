$(document).ready(function(){
	//seeting words to show up in debug
			dBug("document really is ready");
			//making the canvas + ful screen
			var canvas = $("#gameCanvas");
			var context = canvas.get(0).getContext("2d");

			context.canvas.width = window.innerWidth;
			context.canvas.height = window.innerHeight;



	// Lab 003 - Making things move 
	function moveStuff() {

		var numberOfShapes = 20;
		var MAXSIZE = 75; 
		var isRunning = true; 
	    var shapes; 



		var Shape = function(x, y, w, h, v){
			this.x = x; 
			this.y = y; 
			this.w = w; 
			this.h = h; 
			this.vx = v;
			this.vy = v; 
		};

		function init() {
			shapes = new Array();

			for(var i = 0; i < numberOfShapes; i++) {
				// initial size 
				var s = Math.random() * MAXSIZE;
				// initial position 
				do {
					var x = Math.random() * canvas.width();
					var y = Math.random() * canvas.height();
				} while ((x < s || y < s) ||(x + s> canvas.width() || y + s > canvas.height())) ;
				// initial speed 
				var v = 10 / s;
				shapes.push(new Shape(x, y, s, s, v));
			};
		};

		function boundsCheck(obj){
			// left and right 
			if((obj.x < 0) || (obj.x + obj.w > canvas.width())) {
				// we've hit an edge jim 
				dBug("left or right collision");
				obj.vx = obj.vx * -1;
			}; 

			if((obj.y < 0) || (obj.y + obj.h > canvas.height())) {
				// i think you hit a tree jim
				dBug("top or bottom collision");
				obj.vy = obj.vy * -1;
			};
		};


		function animate() {
			dBug("in animate method");
			context.clearRect(0,0, canvas.width(), canvas.height()); 

			if(isRunning) {
				for(var i = 0; i < shapes.length; i++) {
					shapes[i].x += shapes[i].vx	;
					shapes[i].y += shapes[i].vy	;
					boundsCheck(shapes[i]);
					context.fillRect(shapes[i].x,shapes[i].y,shapes[i].w,shapes[i].h);
				};
				setTimeout(animate, 33);
			}
		};
		init();
		animate();
	}; 

		moveStuff();



        		function dBug(data){
					console.log(data);
				};
});