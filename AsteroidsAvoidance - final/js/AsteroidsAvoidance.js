$(document).ready(function() 
{
	var canvas = $("#gameCanvas");
	var context = canvas.get(0).getContext("2d");

	// Canvas dimensions
	var canvasWidth = canvas.width();
	var canvasHeight = canvas.height();

	// Game settings
	var playGame;

	var asteroids;
	var numAsteroids;

	var asteroidScore;
	var realScore;
	var highScore;
	var score;
	var scoreTimeout;

	var player;
	var arrowUp = 38;
	var arrowRight = 39;
	var arrowDown = 40;

	// objects
	function Asteroid(x, y, radius, vX)
	{
		this.x = x;
		this.y = y;
		this.radius = radius;
		this.vX = vX;
	};

	function Shot(x, y)
	{
		this.x = x;
		this.y = y;
		this.vX = 10;
		this.length = 10;
	};

	function Player(x, y) // constructor for player modified
	{
		this.x = x;
		this.y = y;
		this.width = 24;
		this.height = 24;
		this.halfWidth = this.width/2;
		this.halfHeight = this.height/2;

		this.vX = 0;
		this.vY = 0;

		this.numShots = 0;
		this.shots = new Array();

		this.moveRight = false;
		this.moveUp = false;
		this.moveDown = false;

		this.flameLength = 20;
	};	

	// Game UI
	var ui = $("#gameUI");
	var uiIntro = $("#gameIntro");
	var uiStats = $("#gameStats");
	var uiComplete = $("#gameComplete");
	var uiPlay = $("#gamePlay");
	var uiReset = $(".gameReset");
	var uiScore = $(".gameTime");
	var uiRealScore = $(".gameScore");
	var uiHighScore = $(".highScore");
	var uiNewHighScore = $("#highScore");

	var soundBackground = $("#gameSoundBackground").get(0);
	var soundThrust = $("#gameSoundThrust").get(0);
	var soundDeath = $("#gameSoundDeath").get(0);

	// Reset and start the game
	function startGame() 
	{
		// Reset game stats
		uiScore.html("0");
		uiRealScore.html("0");
		uiStats.show();

		// Set up initial game settings
		playGame = false;

		asteroids = new Array();
		numAsteroids = 10;
		score = 0;
		asteroidScore = 0;
		realScore = 0;

		player = new Player(150, canvasHeight/2);

		// creating asteroids array
		for (var i = 0; i < numAsteroids; i++)
		{
			var radius = 5+(Math.random()*10);
			var x = canvasWidth+radius+Math.floor(Math.random()*canvasWidth);
			var y = Math.floor(Math.random()*canvasHeight);
			var vX = -5-(Math.random()*5);

			asteroids.push(new Asteroid(x, y, radius, vX));
		};

		// input event listeners
		$(window).keydown(function(e) 
		{
			var keyCode = e.keyCode;

			if (!playGame) 
			{
				playGame = true;
				soundBackground.currentTime = 0;
				soundBackground.play();
				animate();
				timer();
			};

			if (keyCode == arrowRight) 
			{
				player.moveRight = true;
				if (soundThrust.paused) 
				{
					soundThrust.currentTime = 0;
					soundThrust.play();
				};
			} 
			else if (keyCode == arrowUp) 
			{
				player.moveUp = true;
			} 
			else if (keyCode == arrowDown) 
			{
				player.moveDown = true;
			}
			else if (keyCode == 32) //space
			{
				player.shots.push(new Shot(player.x + player.width, player.y));
				player.numShots++;
			};
		});
		
		$(window).keyup(function(e) 
		{
			var keyCode = e.keyCode;

			if (keyCode == arrowRight) 
			{
				player.moveRight = false;
				soundThrust.pause();
			} 
			else if (keyCode == arrowUp) 
			{
				player.moveUp = false;
			} 
			else if (keyCode == arrowDown) 
			{
				player.moveDown = false;
			}
		});

		// Start the animation loop
		animate();
	};

	// Inititialize the game environment
	function init() 
	{
		uiStats.hide();
		uiComplete.hide();
		uiNewHighScore.hide();
		highScore = 0;
		
		// on click, play
		uiPlay.click(function(e) 
		{
			e.preventDefault();
			uiIntro.hide();
			startGame();
		});

		// on enter, play
		$(window).keydown(function(e) 
		{
			var keyCode = e.keyCode;

			if (keyCode == 13) //enter
			{
				e.preventDefault();
				uiIntro.hide();
				startGame();
			};
		});

		// on reset
		uiReset.click(function(e) 
		{
			e.preventDefault();
			uiComplete.hide();
			$(window).unbind("keyup");
			$(window).unbind("keydown");	
			soundThrust.pause();
			soundBackground.pause();	
			clearTimeout(scoreTimeout);

			startGame();
		});
	};

	// increases number of asteroids as time goes on
	function timer() 
	{
		if (playGame) 
		{
			scoreTimeout = setTimeout(function() 
			{
				uiScore.html(++score);
				if (score % 5 == 0) // increase difficulty
				{
					numAsteroids += 5;
				};
				timer();
			}, 1000);
		};
	};

	// checks collisions between shot and asteroids and if shots are off screen
	function shooting()
	{
		var asteroidsLength = asteroids.length;

		// check if shot is offscreen
		for (var j = 0; j < player.numShots; j++)
		{
			if (player.shots[j].x > canvasWidth)
			{
				player.shots.splice(j, 1);
				j--;
				player.numShots--;
			};
		};

		for (var i = 0; i < asteroidsLength; i++) 
		{
			// collision check - player shot vs asteroid
			for(var j = 0; j < player.numShots; j++)
			{
				// checks to see if the asteroid has already been spliced and skips all other collision checks for that asteroid
				if (typeof(asteroids[i]) == 'undefined')
				{
					break;
				}
				else
				{
					var sX = (player.shots[j].x + player.shots[j].length) - asteroids[i].x;
					var sY = player.shots[j].y - asteroids[i].y;
					var sDistance = Math.sqrt((sX*sX) + (sY*sY));

					// check for collision
					if (sDistance < asteroids[i].radius)
					{
						player.shots.splice(j, 1);
						j--; //decrement so it doesn't skip an element after the splice
						player.numShots--;

						// scoring
						if (asteroids[i].radius < 5) // small asteroids 
						{
							asteroidScore += 1000;
						}
						else if (asteroids[i].radius >= 5 && asteroids[i].radius < 10) // medium asteroids
						{
							asteroidScore += 500;
						}
						else if (asteroids[i].radius >= 10) // large asteroids
						{
							asteroidScore += 100; 
						};

						asteroids.splice(i, 1);
						i--;		
					};
				};
			};
		};
	};

	// Animation loop that does all the fun stuff
	function animate() 
	{
		// Clear
		context.clearRect(0, 0, canvasWidth, canvasHeight);

		shooting();


		// update score on collision
		realScore = (score * 100) + asteroidScore;
		uiRealScore.html(realScore);

		// draw asteroids
		var asteroidsLength = asteroids.length;

		for (var i = 0; i < asteroidsLength; i++) 
		{
			var tmpAsteroid = asteroids[i];
			tmpAsteroid.x += tmpAsteroid.vX;			

			// reset offscreen asteroids
			if (tmpAsteroid.x+tmpAsteroid.radius < 0) 
			{
				tmpAsteroid.radius = 5+(Math.random()*10);
				tmpAsteroid.x = canvasWidth+tmpAsteroid.radius;
				tmpAsteroid.y = Math.floor(Math.random()*canvasHeight);
				tmpAsteroid.vX = -5-(Math.random()*5);
			};

			// collision check - player vs asteroid
			var dX = player.x - tmpAsteroid.x;
			var dY = player.y - tmpAsteroid.y;
			var distance = Math.sqrt((dX*dX)+(dY*dY));		
			if (distance < player.halfWidth+tmpAsteroid.radius) 
			{
				soundThrust.pause();
				soundDeath.currentTime = 0;
				soundDeath.play();

				// Game over
				playGame = false;
				clearTimeout(scoreTimeout);
				uiStats.hide();
				uiComplete.show();

				// high score
				if (realScore > highScore)
				{
					highScore = realScore;
					uiHighScore.html(highScore);
					uiNewHighScore.show();
				}
				else
				{
					uiNewHighScore.hide();
				}

				soundBackground.pause();
				$(window).unbind("keyup");
				$(window).unbind("keydown");
			};	

			// draw asteroid
			context.fillStyle = "rgb(255, 255, 255)";
			context.beginPath();
			context.arc(tmpAsteroid.x, tmpAsteroid.y, tmpAsteroid.radius, 0, Math.PI*2, true);
			context.closePath();
			context.fill();
		};

		// player input
		player.vX = 0;
		player.vY = 0;
		if (player.moveRight) 
		{
			player.vX = 10;
		}
		else
		{
			player.vX = -5;
		};

		if (player.moveUp) 
		{
			player.vY = -10;
		};
		if (player.moveDown) 
		{
			player.vY = 10;
		};

		// velocity update
		player.x += player.vX;
		player.y += player.vY;

		// boundaries
		if (player.x-player.halfWidth < 20) 
		{
			player.x = 20+player.halfWidth;
		} 
		else if (player.x+player.halfWidth > canvasWidth-20) 
		{
			player.x = canvasWidth-20-player.halfWidth;
		}

		if (player.y-player.halfHeight < 20) 
		{
			player.y = 20+player.halfHeight;
		} 
		else if (player.y+player.halfHeight > canvasHeight-20) 
		{
			player.y = canvasHeight-20-player.halfHeight;
		};	

		// flame animation
		if (player.moveRight) 
		{
			context.save();
			context.translate(player.x-player.halfWidth, player.y);

			if (player.flameLength == 20) 
			{
				player.flameLength = 15;
			} 
			else 
			{
				player.flameLength = 20;
			};

			context.fillStyle = "orange";
			context.beginPath();
			context.moveTo(0, -5);
			context.lineTo(-player.flameLength, 0);
			context.lineTo(0, 5);
			context.closePath();
			context.fill();
			context.restore();
		};

		// draw shooting and update shot movement
		if (player.shots.length != 0)
		{
			context.fillStyle = "rgb(0, 255, 0)";
			for (var i = 0; i < player.shots.length; i++)
			{
				context.fillRect(player.shots[i].x, player.shots[i].y, 10, 1);
				player.shots[i].x += player.shots[i].vX;
			};
		};

		// draw player
		context.fillStyle = "rgb(255, 0, 0)";
		context.beginPath();
		context.moveTo(player.x+player.halfWidth, player.y);
		context.lineTo(player.x-player.halfWidth, player.y-player.halfHeight);
		context.lineTo(player.x-player.halfWidth, player.y+player.halfHeight);
		context.closePath();
		context.fill();

		// draw new asteroids after they've been killed or as time goes on
		while (asteroids.length < numAsteroids) 
		{
			var radius = 5+(Math.random()*10);
			var x = Math.floor(Math.random()*canvasWidth)+canvasWidth+radius;
			var y = Math.floor(Math.random()*canvasHeight);
			var vX = -5-(Math.random()*5);
			asteroids.push(new Asteroid(x, y, radius, vX));
		};

		if (playGame) 
		{
			// Run the animation loop again in 33 milliseconds
			setTimeout(animate, 33);
		};
	};

	init();
});