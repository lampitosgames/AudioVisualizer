"use strict";

//Declare these at the app scope
app.canvas = undefined;
app.ctx = undefined;

//Define main module
app.main = (function() {
    let a = app;
    let s, sm, sc;

    /**
     * Init the main module.  Setup the canvas.  Call the initial resize and update
     * to trigger requestAnimationFrame()
     */
    function init() {
        //Store the main module state in shorthand
        s = a.state;
        sm = s.main;
        sc = s.color;
        //Init canvas
        a.canvas = document.getElementById("canvas");
        //Bind resize, then call it as part of initialization
        window.addEventListener('resize', resize);
        resize();
        //Start the update loop.
        update();
    }

    /**
     * The main update loop for the app
     */
    function update() {
        //Request animation frame and store the return ID in the state
        sm.animationID = requestAnimationFrame(update.bind(this));

        //Update other modules
        a.time.update();
        a.audio.update();

        //Override everything with a full-size background
        a.ctx.fillStyle = sc.backgroundColor;
        a.ctx.fillRect(0, 0, a.viewport.width, a.viewport.height);

        //Visualiser
        let aData = a.audio.data();

        //If the current visualization method is a straight line, draw a line visualization
        if (sm.graphType === sm.graphTypes.DRAW_LINE) {
            let barSpacing = 2;
            let barWidth = (Math.floor(a.viewport.width) - aData.length * barSpacing) / aData.length;
            for (var i = 0; i < aData.length; i++) {
                a.drawing.drawAudioBar(i * (barWidth + barSpacing), a.viewport.height / 2.5, barWidth, aData[i], a.viewport.height / 4, [255, 0, 0]);
            }
        //If the current visualization method is bezier curves, draw all bezier curves
        } else if (sm.graphType === sm.graphTypes.DRAW_BEZIER) {
            //If the length of the bezier curve doesn't match the length of the audio data, re-render the curve
            if (sm.bezierCurves[0].length != a.audio.getDataLength()) {
                a.bezier.updateBezierCurves();
            }
            //Draw every bezier curve in the primary color
            for (let i = 0; i < sm.bezierCurves.length; i++) {
                a.bezier.drawBezier(sm.bezierCurves[i], aData, sc.primaryColor);
            }
        }

        //Update the UI
        //TODO: Replace this with a ui module
        a.scrubber.update();
    }

    /**
     * Called when the window resize event fires
     * This updates everything about the app that is reliant on screen size
     */
    function resize() {
        //Get the new viewport object
        a.viewport = a.getViewport();
        //Resize the canvas to be 100vwX100vh
        a.canvas.setAttribute("width", a.viewport.width);
        a.canvas.setAttribute("height", a.viewport.height);
        //Replace the old context with the newer, resized version
        a.ctx = a.canvas.getContext('2d');

        //Resize the UI
        //TODO: Replace this with a ui module
        a.scrubber.resize();

        //Re-calculate bezier curves using updated anchor points
        a.bezier.updateBezierCurves();
    }

    return {
        init: init,
        update: update,
        resize: resize
    }
}());
