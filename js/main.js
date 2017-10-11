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
            let toPercent = a.utils.map(a.drawing.scrubAngle(), -Math.PI*0.5, Math.PI*1.5, 0.0, 100.0);
            console.dir(toPercent);
            a.audio.seekToPercent(toPercent);
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
        let barSpacing = 2;
        let barWidth = (Math.floor(a.viewport.width) - aData.length * barSpacing) / aData.length;

        for (var i = 0; i < aData.length; i++) {
            a.drawing.drawAudioBar(i*(barWidth+barSpacing), a.viewport.height/2.5, barWidth, aData[i], a.viewport.height/4, [255, 0, 0]);
        }

        for (let i = 150; i > 0; i -= 3) {
            a.drawing.drawCircle(a.viewport.width/2 - i, a.viewport.height/2 + i, 300, "rgba(0, 0, 0, 0.01)");
        }
        let grad = a.ctx.createLinearGradient(a.viewport.width/2 + 300, a.viewport.height/2 - 300, a.viewport.width/2 - 300, a.viewport.height/2 + 300);
        grad.addColorStop(0, "rgba(235, 235, 235, 1.0)");
        grad.addColorStop(1, "rgba(255, 255, 255, 1.0)");
        a.drawing.drawCircle(a.viewport.width/2, a.viewport.height/2, 300, grad);

        a.drawing.drawScrubber();
        a.drawing.drawAudioCircle(a.viewport.width/2, a.viewport.height/2, 270, aData);

        app.ctx.textAlign = "center";
        app.ctx.textBaseline = "middle";
        let songData = a.audio.songs[a.audio.currentSong()];
        a.utils.fillText(songData.name, a.viewport.width/2, a.viewport.height/2 - 18, "bold 28pt Arial", "red");
        a.utils.fillText(songData.artist, a.viewport.width/2, a.viewport.height/2 + 20, "12pt Arial", "red");
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
        mouseDown: function() {
            return mouseDown;
        },
        paused: paused,
        init: init,
        update: update,
        resize: resize
    }
}());
