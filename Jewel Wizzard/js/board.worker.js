var matchThree = {};

importScripts("matchThree.board.js");

addEventListener("message", function(event) {
	var board = matchThree.board, 
		message = event.data;

	switch (message.command) {
		case "initialize" :
			matchThree.settings = message.data.settings;
			board.initialize(message.data.startJewels, callback);
			break;
		case "swap" :
			board.swap(
					message.data.x1, 
					message.data.y1, 
					message.data.x2,
					message.data.y2,
					callback
				);
			break;
	}

	function callback(data) {
		postMessage({
			id : message.id,
			data : data,
			tiles : board.getBoard()
		});
	}
}, false);