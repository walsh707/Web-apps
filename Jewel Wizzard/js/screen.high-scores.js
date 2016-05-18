matchThree.screens["high-scores"] = (function() {
	var firstRun = true;
	var numScores = 10;

	function setup() {
		var $ = matchThree.dom.$,
			backButton = $("#high-scores footer button.back")[0];
		matchThree.dom.bind(backButton, "click", function() {
			matchThree.showScreen("main-menu");
		});
	}

	function run() {
		if(firstRun) { 
			setup();
			firstRun = false;
		}
		populateList();
		var score = matchThree.storage.get("lastScore");
		if(score) {
			matchThree.storage.set("lastScore", null);
			checkScores(score);
		}
	}

	function getScores() {
		return matchThree.storage.get("scores") || [];
	}

	function addScore(score, position) {
		var scores = getScores(),
			name, entry;

		name = prompt("Please enter your name");
		entry = {
			name : name,
			score : score
		};
		scores.splice(position, 0, entry);
		matchThree.storage.set("scores", scores.slice(0, numScores));
		populateList();
	}

	function checkScores(score) {
		var scores = getScores();
		for(var i = 0; i < scores.length; i++) {
			if (score > scores[i].score) {
				addScore(score, i);
				return;
			}
		}
		if(scores.length < numScores) {
			addScore(score, scores.length);
		}
	}

	function populateList() {
		var scores = getScores(),
			list = matchThree.dom.$("#high-scores ol.score-list")[0],
			item, nameEl, scoreEl, i;

		// make surelist is full
		for (i = scores.length; i < numScores; i++) {
			scores.push({
				name : "---",
				score: 0
			});
		}

		list.innerHTML = "";
		
		for (i = 0; i < scores.length; i++) {
			item = document.createElement("li");

			nameEl = document.createElement("span");
			nameEl.innerHTML = scores[i].name;

			scoreEl = document.createElement("span");
			scoreEl.innerHTML = scores[i].score;

			item.appendChild(nameEl);
			item.appendChild(scoreEl);
			list.appendChild(item);
		}
	}

	return {
		run : run
	};
})();