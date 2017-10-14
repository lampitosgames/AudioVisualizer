"use strict";

//Declare these at the app scope
app.canvas = undefined;
app.ctx = undefined;

//Define main module
app.main = (function() {
    let a = app;
    let animationID = 0;

    let bezierCurves = [];

    const DRAW_BEZIER = "DRAW_BEZIER";
    const DRAW_LINE = "DRAW_LINE";
    let graphType = DRAW_LINE;

    function init() {
        //Init canvas
        a.canvas = document.getElementById("canvas");
        //Bind resize, then call it as part of initialization
        window.addEventListener('resize', resize);
        resize();

        a.keys.keyUp("space", function() {
            if (a.audio.paused()) {
                a.audio.play();
            } else {
                a.audio.pause();
            }
        });

        //Start the update loop.
        update();
    }

    function update() {
        animationID = requestAnimationFrame(update.bind(this));

        //Update other modules
        a.time.update();
        a.audio.update();

        //Override everything with a full-size background
        a.ctx.fillStyle = "#f7f7f7";
        a.ctx.fillRect(0, 0, a.viewport.width, a.viewport.height);

        //Visualiser
        a.ctx.fillStyle = "red";
        let aData = a.audio.data();

        if (graphType == DRAW_LINE) {
            let barSpacing = 2;
            let barWidth = (Math.floor(a.viewport.width) - aData.length * barSpacing) / aData.length;
            for (var i = 0; i < aData.length; i++) {
                a.drawing.drawAudioBar(i * (barWidth + barSpacing), a.viewport.height / 2.5, barWidth, aData[i], a.viewport.height / 4, [255, 0, 0]);
            }
        } else if (graphType = DRAW_BEZIER) {
            //If the length of the bezier curve doesn't match the length of the audio data, re-render the curve
            if (bezierCurves[0].length != a.audio.getDataLength()) {
                updateBezierCurves();
            }

            for (let i = 0; i < bezierCurves.length; i++) {
                a.bezier.drawBezier(bezierCurves[i], aData, "red");
            }
        }

        a.scrubber.update();

    }

    function resize() {
        //Get new viewport variables
        a.viewport = a.getViewport();
        //Resize the canvas to be 100vwX100vh
        a.canvas.setAttribute("width", a.viewport.width);
        a.canvas.setAttribute("height", a.viewport.height);
        //Replace the old context with the newer, resized version
        a.ctx = a.canvas.getContext('2d');

        a.scrubber.resize();
        updateBezierCurves();
    }

    function updateBezierCurves() {
        //Re-calculate bezier curves.  The values are hardcoded but use relative positioning based on the viewport
        bezierCurves = [];
        let v = a.viewport;
        let rel100 = 0.0909090909 * v.height;
        bezierCurves.push(a.bezier.createBezierCurve(1.0/a.audio.getDataLength(), [
            [0, v.height / 3],
            [v.width / 2, 2*rel100],
            [0, v.height]
        ]));
        bezierCurves.push(a.bezier.createBezierCurve(1.0/a.audio.getDataLength(), [
            [v.width, v.height * 2 / 3],
            [v.width / 2, v.height - 2*rel100],
            [v.width, 0]
        ]));
        bezierCurves.push(a.bezier.createBezierCurve(1.0/a.audio.getDataLength(), [
            [0, 0],
            [v.width * 3 / 7, 7*rel100],
            [v.width * 3 / 7, -6*rel100],
            [v.width * 2 / 3, 6*rel100],
            [v.width * 7 / 8, 0]
        ]));
        bezierCurves.push(a.bezier.createBezierCurve(1.0/a.audio.getDataLength(), [
            [v.width, v.height],
            [v.width * 4 / 7, v.height - 7*rel100],
            [v.width * 4 / 7, v.height + 6*rel100],
            [v.width / 3, v.height - 6*rel100],
            [v.width / 8, v.height]
        ]));
    }

    return {
        init: init,
        update: update,
        resize: resize
    }
}());
