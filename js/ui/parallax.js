"use strict";

app.parallax = (function() {
    let a = app;
    function update() {
        let sm = a.state.main;
        let ss = a.state.scrubber;

        let mouse = a.keys.mouse();
        if (!mouse) return;
        let center = [a.viewport.width/2, a.viewport.height/2];
        let vec = [mouse[0] - center[0], mouse[1] - center[1]];

        sm.parallax = [vec[0]*-0.03, vec[1]*-0.03];
        ss.parallax = [vec[0]*0.03, vec[1]*0.03];
    }
    return {
        update: update
    }
}());
