"use strict";

//Sets up all keyboard commands for the app
app.keybinds = (function() {
    let a = app;
    function init() {
        a.keys.keyUp("space", pausePlay);
        a.keys.keyUp("g", toggleBezierCurveDisplay);
    }

    function pausePlay() {
        if (a.audio.paused()) {
            a.audio.play();
        } else {
            a.audio.pause();
        }
    }

    function toggleBezierCurveDisplay() {
        let s = a.state.main;
        if (s.graphType === s.graphTypes.DRAW_LINE) {
            s.graphType = s.graphTypes.DRAW_BEZIER;
        } else if (s.graphType === s.graphTypes.DRAW_BEZIER) {
            s.graphType = s.graphTypes.DRAW_LINE;
        }
    }

    return {
        init: init
    }
}());
