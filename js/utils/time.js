"use strict";

//Timing module
app.time = (function() {
    let a = app;
    let st;

    function init() {
        st = app.state.time;
    }

    /**
     * Calculates the time between frames
     */
    function calculateDeltaTime() {
        let now;
        //Get time in ms
        now = performance.now();
        //Get capped instant FPS (from last frame to this frame)
        st.fps = a.utils.clamp(1000 / (now - st.lastTime), 5, 60);
        //Store this frame time
        st.lastTime = now;
        //Return the last frame's time (delta time) in seconds
        return 1 / st.fps;
    }

    /**
     * Update the module
     */
    function update() {
        //Get the delta time
        st.dt = calculateDeltaTime();
        //Add the delta to the total runtime
        st.runTime += st.dt;
    }

    //Exports
    return {
        calculateDeltaTime: calculateDeltaTime,
        update: update,
        init: init,
        dt: function() {
            return st.dt;
        },
        runTime: function() {
            return st.runTime;
        },
        fps: function() {
            return st.fps;
        }
    };
}());
