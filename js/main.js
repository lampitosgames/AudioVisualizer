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

    function init() {
        //Store the canvas element
        a.canvas = document.getElementById("canvas");
        //Bind resize, then call it as part of initialization
        window.addEventListener('resize', resize);
        resize();

        window.addEventListener('mousedown', function() {mouseDown = true;});
        window.addEventListener('mouseup', function() {
            mouseDown = false;
            a.audio.seekToPercent(scrubPercent);
            console.log(a);
        });

        //Start the update loop.
        update();
        console.log(app);
    }

    function update() {
        animationID = requestAnimationFrame(update.bind(this));

        //Update other modules
        a.time.update();
        a.audio.update();

        //Override everything with a full-size background
        a.ctx.fillStyle = "#171717";
        a.ctx.fillRect(0, 0, a.viewport.width, a.viewport.height);

        //Visualizer
        let barWidth = (Math.floor(a.viewport.width)) / 512;
        let barSpacing = 0;

        let aData = a.audio.data();
        let multiplier = (1.001/(aData.length/2));

        let dData = new Array(aData.length);

        for (var i=0; i<aData.length/2; i++) {
            dData[i] = Math.min(270, aData[i] * (1 + multiplier*i));

            a.ctx.fillStyle = "red";

            a.ctx.fillRect(i*(barWidth + barSpacing),
                           0,
                           barWidth,
                        //    a.utils.map(Math.pow(aData[i], 2), 0, 65025, barWidth, a.viewport.height/2));
                           a.utils.map(Math.pow(dData[i], 6), 0, Math.pow(270, 6), barWidth, a.viewport.height/2));
        }

        drawScrubber();
    }

    function drawScrubber() {
        //First off, check for mouse down
        if (mouseDown) {
            scrubPercent = a.utils.norm(a.mouse[0], 0, a.viewport.width) * 100;
        }


        let currentTime = a.audio.getAudioTimestamp();
        let songLength = a.audio.getAudioLength();
        let circlePos = a.utils.map(currentTime, 0.0, songLength, 0, a.viewport.width);
        a.ctx.strokeStyle = "red";
        a.ctx.lineWidth = 5;
        a.ctx.beginPath();
        a.ctx.arc(circlePos, a.viewport.height - 100, 15, 0, Math.PI*2);
        a.ctx.stroke();
        a.ctx.closePath();
        a.ctx.beginPath();
        a.ctx.moveTo(0, a.viewport.height - 100);
        a.ctx.lineTo(circlePos - 15, a.viewport.height - 100);
        a.ctx.moveTo(circlePos + 15, a.viewport.height - 100);
        a.ctx.lineTo(a.viewport.width, a.viewport.height - 100);
        a.ctx.stroke();
        a.ctx.font = "14pt Courier";
        a.ctx.fillText(String(Math.floor(currentTime)), circlePos - 15, a.viewport.height - 130);
    }

    function resize() {
        //Get new viewport variables
        a.viewport = a.getViewport();
        //Resize the canvas to be 100vwX100vh
        a.canvas.setAttribute("width", a.viewport.width);
        a.canvas.setAttribute("height", a.viewport.height);
        //Replace the old context with the newer, resized version
        a.ctx = a.canvas.getContext('2d');
    }

    return {
        animationID: animationID,
        debug: debug,
        paused: paused,
        init: init,
        update: update,
        resize: resize
    }
}());
