$(document).ready(function() {	
	var canvas = $("#myCanvas");
	var context = canvas.get(0).getContext("2d");
	
	var canvasWidth = canvas.width();
	var canvasHeight = canvas.height();
	
	$(window).resize(resizeCanvas);
	
	function resizeCanvas() {
		canvas.attr("width", $(window).get(0).innerWidth);
		canvas.attr("height", $(window).get(0).innerHeight);
		
		canvasWidth = canvas.width();
		canvasHeight = canvas.height();
	};
	
	resizeCanvas();
	
	var playAnimation = true;
	
	
	
	// Making the asteroids
	var Asteroid = function(x, y, radius, mass, vX, vY, aX, aY) {
		this.x = x;
		this.y = y;
		this.radius = radius;
		this.mass = mass;
		
		this.vX = vX;
		this.vY = vY;
		this.aX = aX;
		this.aY = aY;
	};
	
	// Array that holds the asteroids 
	var asteroids = new Array();
	
	// Setting the asteroids
	for (var i = 0; i < 30; i++) {
		var x = 20+(Math.random()*(canvasWidth-40));
		var y = 20+(Math.random()*(canvasHeight-40));
		
		var radius = 5+Math.random()*10;
		var mass = radius/2;
		
		var vX = Math.random()*10-2;
		var vY = Math.random()*10-2;
		
		var aX = 0;
		var aY = 0;
		
		asteroids.push(new Asteroid(x, y, radius, mass, vX, vY, aX, aY));
	};
	
	// Animation loop
	function animate() {					
		// Clear
		context.clearRect(0, 0, canvasWidth, canvasHeight);
		
		context.fillStyle = "rgb(255, 255, 255)";
		
		// Loop through every asteroid
		var asteroidsLength = asteroids.length;
		for (var i = 0; i < asteroidsLength; i++) {
			var Asteroid = asteroids[i];
			
			for (var j = i+1; j < asteroidsLength; j++) {
				var AsteroidB = asteroids[j];
				
				var dX = AsteroidB.x - Asteroid.x;
				var dY = AsteroidB.y - Asteroid.y;
				var distance = Math.sqrt((dX*dX)+(dY*dY));
				
				if (distance < Asteroid.radius + AsteroidB.radius) {								
					var angle = Math.atan2(dY, dX);
					var sine = Math.sin(angle);
					var cosine = Math.cos(angle);
					
					// Rotate asteroid position
					var x = 0;
					var y = 0;
					
					// Rotate asteroidB position
					var xB = dX * cosine + dY * sine;
					var yB = dY * cosine - dX * sine;
						
					// Rotate asteroid velocity
					var vX = Asteroid.vX * cosine + Asteroid.vY * sine;
					var vY = Asteroid.vY * cosine - Asteroid.vX * sine;
					
					// Rotate asteroidB velocity
					var vXb = AsteroidB.vX * cosine + AsteroidB.vY * sine;
					var vYb = AsteroidB.vY * cosine - AsteroidB.vX * sine;
					
					// Reverse the velocities
					var vTotal = vX - vXb;
					vX = ((Asteroid.mass - AsteroidB.mass) * vX + 2 * AsteroidB.mass * vXb) / (Asteroid.mass + AsteroidB.mass);
					vXb = vTotal + vX;
					
					// Move asteroids apart
					xB = x + (Asteroid.radius + AsteroidB.radius);
					
					// Rotate asteroid positions back
					Asteroid.x = Asteroid.x + (x * cosine - y * sine);
					Asteroid.y = Asteroid.y + (y * cosine + x * sine);
					
					AsteroidB.x = Asteroid.x + (xB * cosine - yB * sine);
					AsteroidB.y = Asteroid.y + (yB * cosine + xB * sine);
					
					// Rotate asteroid velocities back
					Asteroid.vX = vX * cosine - vY * sine;
					Asteroid.vY = vY * cosine + vX * sine;
					
					AsteroidB.vX = vXb * cosine - vYb * sine;
					AsteroidB.vY = vYb * cosine + vXb * sine;
				};
			};
			
			// Calculate velocity
			Asteroid.x += Asteroid.vX;
			Asteroid.y += Asteroid.vY;
			
			// Add acceleration to velocity
			if (Math.abs(Asteroid.vX) < 10) {
				Asteroid.vX += Asteroid.aX;
			};
			
			if (Math.abs(Asteroid.vY) < 10) {
				Asteroid.vY += Asteroid.aY;
			};
			

			
			// Boundary collision checks
			if (Asteroid.x-Asteroid.radius < 0) {
				Asteroid.x = Asteroid.radius; 
				Asteroid.vX *= -1;
				Asteroid.aX *= -1;
			} else if (Asteroid.x+Asteroid.radius > canvasWidth) {
				Asteroid.x = canvasWidth-Asteroid.radius; 
				Asteroid.vX *= -1;
				Asteroid.aX *= -1;
			};
			
			if (Asteroid.y-Asteroid.radius < 0) {
				Asteroid.y = Asteroid.radius; 
				Asteroid.vY *= -1;
				Asteroid.aY *= -1;
			} else if (Asteroid.y+Asteroid.radius > canvasHeight) {
				Asteroid.y = canvasHeight-Asteroid.radius; 
				Asteroid.vY *= -1;
				Asteroid.aY *= -1;
			};
			
			context.beginPath();
			context.arc(Asteroid.x, Asteroid.y, Asteroid.radius, 0, Math.PI*2);
			context.closePath();
			context.fill();
		};
		
		if (playAnimation) {
			// Run the animation loop again in 33 milliseconds
			setTimeout(animate, 33);
		};
	};
	
	// Start the animation loop
	animate();
});
