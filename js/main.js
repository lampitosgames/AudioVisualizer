"use strict";

//Declare these at the app scope
app.canvas = undefined;
app.ctx = undefined;

//Define main module
app.main = (function() {
    let a = app;

    let animationID = 0;
    let debug = true;
    let paused = false;

    let mouseDown = false;
    let scrubPercent = 0;

    let bezierCurves = [];

    let DRAW_BEZIER = "DRAW_BEZIER";
    let DRAW_LINE = "DRAW_LINE";
    let graphType = DRAW_LINE;

    function init() {
        //Init canvas
        app.canvas = document.getElementById("canvas");
        //Bind resize, then call it as part of initialization
        window.addEventListener('resize', resize);
        resize();

        app.canvas.addEventListener('mousedown', function() {
            mouseDown = true;
        });
        app.canvas.addEventListener('mouseup', function() {
            mouseDown = false;
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
            for (let i = 0; i < bezierCurves.length; i++) {
                a.bezier.drawBezier(bezierCurves[i], aData, "red");
            }
        }

        a.scrubber.update();

        app.ctx.textAlign = "center";
        app.ctx.textBaseline = "middle";
        let songData = a.audio.songs[a.audio.currentSong()];
        if (songData) {
            a.utils.fillText(songData.name, a.viewport.width / 2, a.viewport.height / 2 - 18, "bold 28pt Arial", "red");
            a.utils.fillText(songData.artist, a.viewport.width / 2, a.viewport.height / 2 + 20, "12pt Arial", "red");
        }

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

        bezierCurves = [];
        bezierCurves.push(app.bezier.createBezierCurve(1.0 / 256, [
            [
                0, app.viewport.height / 3
            ],
            [
                app.viewport.width / 2,
                200
            ],
            [0, app.viewport.height]
        ]));
        bezierCurves.push(app.bezier.createBezierCurve(1.0 / 256, [
            [
                app.viewport.width, app.viewport.height * 2 / 3
            ],
            [
                app.viewport.width / 2,
                app.viewport.height - 200
            ],
            [app.viewport.width, 0]
        ]));
    }

    return {
        animationID: animationID,
        debug: debug,
        mouseDown: function() {
            return mouseDown;
        },
        paused: paused,
        init: init,
        update: update,
        resize: resize
    }
}());
