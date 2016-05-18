matchThree.screens["about"] = (function() {
	var firstRun = true;

	function setup() {
		var $ = matchThree.dom.$,
			backButton = $("#about footer button.back")[0];
		matchThree.dom.bind(backButton, "click", function() {
			matchThree.showScreen("main-menu");
		});
	}
	function run() {
		if (firstRun) {
			setup();
			firstRun = false;
		}
	}
	return {
		run : run
	};
})();