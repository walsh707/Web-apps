matchThree.screens["main-menu"] = (function() {
	var dom = matchThree.dom,
			  firstRun = true;

	function setup() {
		dom.bind("#main-menu ul.menu", "click", function(e) {
			if (e.target.nodeName.toLowerCase() === "button") {
				var action = e.target.getAttribute("name");
				if (action === "exit-screen") {
				    dom.allow_scripts_to_close_windows = true;
				    window.open('','_self');
				    window.close();
					
				} else {
					matchThree.showScreen(action);
				}
			}
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