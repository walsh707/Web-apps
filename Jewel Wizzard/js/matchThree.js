/* ***************************************
   Main matchThree namespace
**************************************** */
 var matchThree = (function() {
 	
 	var settings = {
 		baseLevelTimer : 60000,
        baseLevelScore : 1500,
        baseLevelExp : 1.05,
 		rows: 8, 
 		cols: 8, 
 		baseScore: 100, 
 		numTileTypes: 7,
 		controls : {
            // keyboard controls
            KEY_UP : "moveUp",
            KEY_LEFT : "moveLeft",
            KEY_DOWN : "moveDown",
            KEY_RIGHT : "moveRight",
            KEY_ENTER : "selectTile",
            KEY_SPACE : "selectTile",
            // mouse and touch controls
            CLICK : "selectTile",
            TOUCH : "selectTile",
            SWIPE_LEFT : "moveLeft",
            SWIPE_RIGHT : "moveRight",
            SWIPE_UP : "moveUp", 
            SWIPE_DOWN : "moveDown",
            // gamepad controls
            BUTTON_A: "selectTile",
            LEFT_STICK_UP: "moveUp",
            LEFT_STICK_DOWN: "moveDown",
            LEFT_STICK_LEFT: "moveLeft",
            LEFT_STICK_RIGHT: "moveRight"
        }
 	};

 	var scriptQueue = [],
		numResourcesLoaded = 0, 
		numResources = 0;
		executeRunning = false;

 	function executeScriptQueue()
 	{
 		var next = scriptQueue[0], 
 			first, script;

 		if (next && next.loaded)
 		{
 			executeRunning = true;
 			// remove first element
 			scriptQueue.shift();
 			first = document.getElementsByTagName("script")[0];
 			script = document.createElement("script");
 			script.onload = function()
 			{
 				if(next.callback)
 				{
 					next.callback();
 				}

 				// try to execute more scripts
 				executeScriptQueue();
 			};

 			script.src = next.src;
 			first.parentNode.insertBefore(script, first);
 		}
 		else
 		{
 			executeRunning = false;
 		}
 	}	

 	function load (src, callback)
 	{
 		var image, queueEntry;
 		numResources++;

 		// add this resource to the execution queue
 		queueEntry = {
 			src: src, 
 			callback: callback, 
 			loaded: false
 		};

 		scriptQueue.push(queueEntry);

 		image = new Image();
 		image.onload = image.onerror = function()
 		{
 			numResourcesLoaded++;
 			queueEntry.loaded = true;
 			if (!executeRunning)
 			{
 				executeScriptQueue();
 			}
 		};

 		image.src = src;
 	}

 	// hide the active screen (if any) and show the screen
	// with the specified id
	function showScreen(screenId) 
	{
		var dom = matchThree.dom,
		$ = dom.$,
		activeScreen = $("#game .screen.active")[0],
		screen = $("#" + screenId)[0];
		if(!matchThree.screens[screenId]) {
			console.log("This module is not implemented yet!");
			return;
		}
		if (activeScreen) 
		{
			dom.removeClass(activeScreen, "active");
		}
		dom.addClass(screen, "active");
		// run the screen module
		matchThree.screens[screenId].run();
	}

	function isStandalone () {
		return (window.navigator.standalone !== false);
	}

 	function setup()
 	{
 		// hid the address bar on Android devices
 		if (/Android/.test(navigator.userAgent)) {
 			matchThree.dom.$("html")[0].style.height = "200%";
			setTimeout(function() {
				window.scrollTo(0, 1);
			}, 0);
		}

 		// disable native touchmove behavior to prevent overscroll
 		matchThree.dom.bind(document, "touchmove", function(event) {
 			event.preventDefault();
 		});		

 		if (isStandalone()) {
 			matchThree.showScreen("screen-splash");
 		}
 		else {
 			matchThree.showScreen("install-screen");
 		}
 	}

 	function hasWebWorkers() {
 		return ("Worker" in window);
 	}

 	function preload(src) {
		var image = new Image();
		image.src = src;
	}

	function getLoadProgress() {
		return numResourcesLoaded / numResources;
	}

    return {
    	getLoadProgress: getLoadProgress,
        hasWebWorkers: hasWebWorkers,
        isStandalone: isStandalone,
        preload: preload,
        load: load,
        setup: setup,
        showScreen : showScreen,
        settings: settings,
        screens: {}
    };
 }) ();