matchThree.screens["game-screen"] = (function() {
	var firstRun = true,
        gameState,
		paused,
        pausedStart,
		cursor;

	function startGame() {
		var board = matchThree.board,
			display = matchThree.display;

        gameState = {
            level : 0,
            score : 0,
            timer : 0, // set timeout reference
            startTime : 0, // time at start of level
            endTime : 0
        };

       var activeGame = matchThree.storage.get("activeGameData"),
            useActiveGame,
            startJewels;

        if (activeGame) {
            useActiveGame = window.confirm("Do you want to continue your previous game?");
            if(useActiveGame) {
                var now = Date.now();
                gameState.level = activeGame.level;
                gameState.score = activeGame.score;
                gameState.startTime = now - activeGame.time;
                gameState.endTime = activeGame.endTime;
                startJewels = activeGame.tiles;
            }
        }        

        updateGameInfo();
        matchThree.audio.initialize();

        matchThree.board.initialize(startJewels, function() {
            matchThree.display.initialize(function() {
                cursor = { x : 0, y : 0, selected : false };
                matchThree.display.redraw(matchThree.board.getBoard(), function() {
                    if(useActiveGame) {
                        setLevelTimer();
                    } else
                    {
                        advanceLevel();
                    }
                });
            });
        });

        paused = false;
        var overlay = matchThree.dom.$("#game-screen .pause-overlay")[0];
        overlay.style.display = "none";
	}

    function updateGameInfo() {
        var $ = matchThree.dom.$;
        $("#game-screen .score span")[0].innerHTML = gameState.score;
        $("#game-screen .level span")[0].innerHTML = gameState.level;
    }

    function setLevelTimer(reset) {
        var $ = matchThree.dom.$;
        if (gameState.timer) {
            clearTimeout(gameState.timer);
            gameState.timer = 0;
        }
        if (reset) {
            gameState.startTime = Date.now();
            gameState.endTime = matchThree.settings.baseLevelTimer * Math.pow(gameState.level, -0.05 * gameState.level);
        }
        var delta = gameState.startTime + gameState.endTime - Date.now(),
            percent = (delta / gameState.endTime) * 100,
            progress = $("#game-screen .time .indicator")[0];
        if (delta < 0) {
            gameOver();
        } else {
            progress.style.width = percent + "%";
            gameState.timer = setTimeout(setLevelTimer, 30);
        }
    }

    function setCursor(x, y, select) {
        cursor.x = x;
        cursor.y = y;
        cursor.selected = select;
        matchThree.display.setCursor(x, y, select);
    }
    
    function selectTile(x, y) {
        if(paused) {
            return;
        }

        if (arguments.length === 0) {
            selectTile(cursor.x, cursor.y);
            return;
        }
        if (cursor.selected) {
            var dx = Math.abs(x - cursor.x),
                dy = Math.abs(y - cursor.y),
                dist = dx + dy;

            if (dist === 0) {
                // deselected the selected jewel
                setCursor(x, y, false);
            } else if (dist === 1) {
                // selected an adjacent jewel
                matchThree.board.swap(cursor.x, cursor.y, x, y, playBoardEvents);
                setCursor(x, y, false);
            } else {
                // selected a different jewel
                setCursor(x, y, true);
            }
        } else {
            setCursor(x, y, true);
        }
    }

    function playBoardEvents(events) {
        var display = matchThree.display;
        if (events.length > 0) {
            var boardEvent = events.shift(),
                next = function() {
                    playBoardEvents(events);
                };
            switch (boardEvent.type) {
                case "move" :
                    display.moveJewels(boardEvent.data, next);
                    break;
                case "remove" :
                    matchThree.audio.play("match");
                    display.removeJewels(boardEvent.data, next);
                    break;
                case "badswap" :
                    matchThree.audio.play("badswap");
                    next();
                    break;
                case "refill" :
                    announce("No moves left!");
                    display.refill(boardEvent.data, next);
                    break;
                case "score" : // new score evnt
                    addScore(boardEvent.data);
                    next();
                    break;
                default :
                    next();
                    break;
            }
        } else {
            display.redraw(matchThree.board.getBoard(), function() {
                // good to go again
            });
        }
    }

    function moveCursor(x, y) {
        if (paused) {
            return;
        }

        var settings = matchThree.settings;
        if (cursor.selected) {
            x += cursor.x;
            y += cursor.y;
            if (x >= 0 && x < settings.cols &&
                y >= 0 && y < settings.rows) {
                selectTile(x, y);
            }
        } else {
            x = (cursor.x + x + settings.cols) % settings.cols;
            y = (cursor.y + y + settings.rows) % settings.rows;
            setCursor(x, y, false);
        }
        console.log("Cursor position: " + x + ", " + y);
    }

    function moveUp() {
        moveCursor(0, -1);
    }

    function moveDown() {
        moveCursor(0, 1);
    }

    function moveLeft() {
        moveCursor(-1, 0);
    }

    function moveRight() {
        moveCursor(1, 0);
    }

    function addScore(points) {
        var settings = matchThree.settings,
            nextLevelAt = Math.pow(settings.baseLevelScore, Math.pow(settings.baseLevelExp, gameState.level - 1));
        gameState.score += points;
        if (gameState.score >= nextLevelAt) {
            advanceLevel();
        }
        updateGameInfo();
    }

    function advanceLevel() {
        matchThree.audio.play("levelup");
        gameState.level++;
        announce("Level " + gameState.level);
        updateGameInfo();
        gameState.startTime = Date.now();
        gameState.endTime = matchThree.settings.baseLevelTimer * Math.pow(gameState.level, -0.05 * gameState.level);
        setLevelTimer(true);
        matchThree.display.levelUp();
    }

    function pauseGame() {
        if (paused) {
            return; // do nothing if already paused
        }
        var dom = matchThree.dom,
            overlay = dom.$("#game-screen .pause-overlay")[0];
        overlay.style.display = "block";
        paused = true;
        pausedStart = Date.now();
        clearTimeout(gameState.timer);
        matchThree.display.pause();
    }

    function resumeGame() {
        var dom = matchThree.dom,
            overlay = dom.$("#game-screen .pause-overlay")[0];
        overlay.style.display = "none";
        paused = false;
        var pauseTime = Date.now() - pausedStart;
        gameState.startTime += pauseTime;
        setLevelTimer();
        matchThree.display.resume(pauseTime);
    }

    function saveGameData() {
        matchThree.storage.set("activeGameData", {
            level : gameState.level,
            score : gameState.score, 
            time : Date.now() - gameState.startTime,
            endTime : gameState.endTime,
            tiles : matchThree.board.getBoard() 
        });
    }
    
    function exitGame() {
        pauseGame();
        var confirmed = window.confirm(
            "Do you want to return to the main menu?"
        );
        if (confirmed) {
            clearTimeout(gameState.timer); 
            saveGameData();
            matchThree.showScreen("main-menu");
        } else {
            resumeGame();
        }
    }

    function gameOver() {
        matchThree.audio.play("gameover");
        matchThree.storage.set("lastScore", gameState.score);
        matchThree.storage.set("activeGameData", null);
        matchThree.display.gameOver(function() {
            announce("Game Over!");
            setTimeout(function() {
                matchThree.showScreen("high-scores");
            }, 2500);
        });
    }    

    function announce(str) {
        var dom = matchThree.dom,
            $ = dom.$,
            element = $("#game-screen .announcement")[0];
        element.innerHTML = str;
        dom.removeClass(element, "zoomfade");
        setTimeout(function() {
            dom.addClass(element, "zoomfade");
        }, 1);
    }

    function setup() {
        var dom = matchThree.dom;
        dom.bind("footer button.exit", "click", exitGame);
        dom.bind("footer button.pause", "click", pauseGame);
        dom.bind(".pause-overlay", "click", resumeGame);

        var input = matchThree.input;
        input.initialize();
        input.bind("selectTile", selectTile);
        input.bind("moveUp", moveUp);
        input.bind("moveDown", moveDown);
        input.bind("moveLeft", moveLeft);
        input.bind("moveRight", moveRight);
    }

    function run() {
        if (firstRun) {
            setup();
            firstRun = false;
        }
        startGame();
    }	

	return {
		run: run
	};
})();