matchThree.board = (function() {

	var settings;
	var tiles;
	var rows, cols;
	var baseScore;
	var numTileTypes;

	// initialize gameboard
	function initialize(startJewels, callback) {
		//console.log("init all the boards!");
		settings = matchThree.settings;
		numTileTypes = settings.numTileTypes;
		baseScore = settings.baseScore;
		cols = settings.cols;
		rows = settings.rows;

		if (startJewels) {
			tiles = startJewels;
		} else {
			fillBoard();
		}
		callback();
	}

	// fills the board with tiles
	function fillBoard() {
		var x, y;
		var type;
		tiles = [];

		for (var x = 0; x < cols; x++) {
			tiles[x] = [];
			for (var y = 0; y < rows; y++) {
				type = randomTile();
				while((type === getTile(x-1, y) && type === getTile(x-2, y)) ||
					  (type === getTile(x, y-1) && type === getTile(x, y-2))) {
					type = randomTile(); // get a new one
				}
				tiles[x][y] = type;
			}
		}

		if(!hasMoves()) {
			fillBoard();
		}
	}

	// creates a random tile
	function randomTile() {
		return Math.floor(Math.random() * numTileTypes);
	}

	// returns tile at coordinate
	function getTile(x, y) {
		if (x < 0 || x > cols-1 || y < 0 || y > rows-1) {
			return -1;
		}
		else {
			return tiles[x][y];
		}
	}

	function checkChain(x, y) {
		var type = getTile(x, y);
		var left = 0, right = 0, up = 0, down = 0;

		while (type === getTile(x + right + 1, y)) {right++;} // look right
		while (type === getTile(x - left - 1, y)) {left++;} // look left
		while (type === getTile(x, y + up + 1)) {up++;} // look up
		while (type === getTile(x, y - down - 1)) {down++;} // look down

		return Math.max(left + 1 + right, up + 1 + down);
	}

	function canSwap(x1, y1, x2, y2) {
		var type1 = getTile(x1, y1);
		var type2 = getTile(x2, y2);
		var chain;

		if (!isAdjacent(x1, y1, x2, y2)) {
			return false;
		}

		// temp swap
		tiles[x1][y1] = type2;
		tiles[x2][y2] = type1;
		// get the lengths
		chain = (checkChain(x2, y2) > 2 || checkChain(x1, y1) > 2);
		// swap back
		tiles[x1][y1] = type1;
		tiles[x2][y2] = type2;

		return chain;
	}

	function isAdjacent(x1, y1, x2, y2) {
		var dx = Math.abs(x1 - x2);
		var dy = Math.abs(y1 - y2);

		return (dx + dy === 1);
	}

	function getChains() {
		var x, y;
		var chains = [];

		for (var x = 0; x < cols; x++) {
			chains[x] = [];
			for (var y = 0; y < rows; y++) {
				chains[x][y] = checkChain(x, y);
			}
		}

		return chains;
	}

	function check(events) {
		var chains = getChains();
		var hadChains = false;
		var score = 0;
		var removed = [], moved = [], gaps = [];

		for (var x = 0; x < cols; x++) {
			gaps[x] = 0;
			for (var y = rows-1; y >= 0; y--) {
				if(chains[x][y] > 2) {
					hadChains = true;
					gaps[x]++;
					removed.push({x : x, y : y, type : getTile(x, y)});
					// add score
					score += baseScore * Math.pow(2, (chains[x][y] - 3));
				}
				else if (gaps[x] > 0) {
					moved.push({toX : x, toY : y + gaps[x], fromX : x, fromY : y, type : getTile(x, y)});
					tiles[x][y + gaps[x]] = getTile(x, y);
				}
			}
		}

		for (var x = 0; x < cols; x++) {
			for (var y = 0; y < gaps[x]; y++) {
				tiles[x][y] = randomTile();
				moved.push({
					toX : x, toY : y, 
					fromX : x, fromY : y - gaps[x],
					type : tiles[x][y] 
				});
			}
		}

		events = events || [];
		
		if(hadChains) {
			events.push({
				type : "remove",
				data : removed
			}, {
				type : "score",
				data : score
			}, {
				type : "move",
				data : moved
			});

			if(!hasMoves()) {
				fillBoard();
				events.push({
					type : "refill",
					data : getBoard() 
				});
			}

			return check(events);
		} else {
			return events;
		}
	}

	function swap(x1, y1, x2, y2, callback) { 
		var tmp, swap1, swap2,
		events = [];
		swap1 = {
			type : "move",
			data : [{
				type : getTile(x1, y1),
				fromX : x1, fromY : y1, toX : x2, toY : y2
			},{
				type : getTile(x2, y2),
				fromX : x2, fromY : y2, toX : x1, toY : y1
			}]
		};
		swap2 = {
			type : "move",
			data : [{
				type : getTile(x2, y2),
				fromX : x1, fromY : y1, toX : x2, toY : y2
			},{
				type : getTile(x1, y1),
				fromX : x2, fromY : y2, toX : x1, toY : y1
			}]
		};
		if (isAdjacent(x1, y1, x2, y2)) {
			events.push(swap1);
			if (canSwap(x1, y1, x2, y2)) {
				tmp = getTile(x1, y1);
				tiles[x1][y1] = getTile(x2, y2);
				tiles[x2][y2] = tmp;
				events = events.concat(check());
			} else {
				events.push(swap2, {type : "badswap"});
			}
			callback(events);
		}
	}	

	function hasMoves() {
		for (var x = 0; x < cols; x++) {
			for (var y = 0; y < rows; y++) {
				if(canJewelMove(x, y)) { 
					return true;
				}
			}
		}
		return false;
	}

	function canJewelMove(x, y) {
		return ((x > 0 && canSwap(x, y, x-1, y)) ||
				(x < cols-1 && canSwap(x, y, x+1, y)) ||
				(y > 0 && canSwap(x, y, x, y-1)) ||
				(y < rows-1 && canSwap(x, y, x, y+1)));
	}

	function getBoard() { 
		var copy = [], x;
		for (x = 0; x < cols; x++) {
			copy[x] = tiles[x].slice(0);
		}
		return copy;
	}

	// debugging
	function print() {
		var str = "";
		for (var y = 0; y < rows; y++) {
			for (var x = 0; x < cols; x++) {
				str += getTile(x, y) + " ";
			}
			str += "\r\n"
		}
		console.log(str);
	}

	return {
		initialize : initialize,
		swap : swap,
		canSwap : canSwap,
		getBoard : getBoard, 
		print : print
	};
})();