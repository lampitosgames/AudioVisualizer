"use strict";

//Timing module
app.time = (function() {
    let a = app;

    let dt;
    let lastTime = 0;
    let runTime = 0;
    let fps;

    function init() {
        return;
    }

    /**
     * Calculates the time between frames
     */
    function calculateDeltaTime() {
    	let now;
        //Get time in ms
        now = performance.now();
        //Get capped instant FPS (from last frame to this frame)
    	fps = a.utils.clamp(1000 / (now - lastTime), 5, 60);
        //Store this frame time
        lastTime = now;
        //Return the last frame's time (delta time) in seconds
    	return 1/fps;
    }

    /**
     * Update the module
     */
    function update() {
        //Get the delta time
        dt = calculateDeltaTime();
        //Add the delta to the total runtime
        runTime += dt;
    }

    //Exports
    return {
        calculateDeltaTime: calculateDeltaTime,
        update: update,
        init: init,
        dt: function() { return dt; },
        runTime: function() { return runTime; },
        fps: function() { return fps; }
    }
}());
