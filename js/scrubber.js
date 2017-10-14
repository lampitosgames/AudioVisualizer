"use strict";

app.scrubber = (function() {
    let a = app;

    //Constants
    let DEFAULT_LINE_WIDTH = 5;
    let HOVER_LINE_WIDTH = 10;
    let DEFAULT_SMALL_RADIUS = 7;
    let HOVER_SMALL_RADIUS = 10;

    //Size of scrubber
    let scrubX,
        scrubY,
        scrubAngle;
    //Boolean toggles for UI animation
    let scrubbing = false,
        hover = false;
    //Radius and center of the scrubber
    let radius = 300;
    let center = [];
    //Radius of the pull tab
    let smallRadius = DEFAULT_SMALL_RADIUS;

    //Style values
    let lineWidth = DEFAULT_LINE_WIDTH;
    let color = "rgb(255, 0, 0)";

    /**
     * Init the scrubber
     */
    function init() {}

    /**
     * Update and draw the scrubber
     */
    function update() {
        //draw the circle's shadow by layering very transparent circles in a line
        for (let i = Math.floor(radius / 2); i > 0; i -= 3) {
            a.drawing.drawCircle(center[0] - i, center[1] + i, radius, "rgba(0, 0, 0, 0.01)");
        }
        //Draw the main circle.  The gradient helps it stand out against the background
        let grad = a.ctx.createLinearGradient(center[0] + radius, center[1] - radius, center[0] - radius, center[1] + radius);
        grad.addColorStop(0, "rgba(235, 235, 235, 1.0)");
        grad.addColorStop(1, "rgba(255, 255, 255, 1.0)");
        a.drawing.drawCircle(center[0], center[1], radius, grad);

        //TODO: Update anything that is inside the scrubber display
        app.ctx.textAlign = "center";
        app.ctx.textBaseline = "middle";
        let songData = a.audio.songs[a.audio.currentSong()];
        //TODO: Use HTML for this instead of drawing on the canvas
        if (songData) {
            a.utils.fillText(songData.name, a.viewport.width / 2, a.viewport.height / 2 - 18, "bold 28pt Arial", "red");
            a.utils.fillText(songData.artist, a.viewport.width / 2, a.viewport.height / 2 + 20, "12pt Arial", "red");
        }

        //Grab the audio data
        let aData = a.audio.data();
        //Draw the visualized circle around the edge
        a.drawing.drawAudioCircle(center[0], center[1], radius - 30, aData);
        //Draw the audio scrubber.  It forms a circular ring around the background we just drew
        drawScrubber();
    }

    function resize() {
        //Re-calculate the radius
        radius = a.viewport.height * 0.3;
        //Re-calculate the centerpoint
        center = [
            a.viewport.width / 2,
            a.viewport.height / 2
        ];

        //Find all the defaults based on the other sizes
        DEFAULT_LINE_WIDTH = radius * 0.0166666666666666;
        HOVER_LINE_WIDTH = DEFAULT_LINE_WIDTH * 2;
        DEFAULT_SMALL_RADIUS = radius * 0.02333333333;
        HOVER_SMALL_RADIUS = DEFAULT_SMALL_RADIUS * 1.5;
        //Set variables
        smallRadius = DEFAULT_SMALL_RADIUS;
        lineWidth = DEFAULT_LINE_WIDTH;

    }

    function setColor(newColor) {
        color = newColor;
    }

    function drawScrubber() {
        let c = app.ctx;

        //Update the scrubber position.  This detects scrubber input and gets the arc angle for drawing
        updateScrubberPosition();

        //Draw the scrubber
        scrubX = center[0] + Math.cos(scrubAngle) * radius;
        scrubY = center[1] + Math.sin(scrubAngle) * radius;

        //Draw the timeline
        c.lineWidth = lineWidth;
        //If we are scrubbing, draw a full, slightly-visible scrub track
        if (hover) {
            c.strokeStyle = "rgba(0, 0, 0, 0.2)";
            c.beginPath();
            c.arc(center[0], center[1], radius, 0, Math.PI * 2);
            c.stroke();
        }

        c.strokeStyle = color;
        c.beginPath();
        c.arc(center[0], center[1], radius, -Math.PI / 2, scrubAngle);
        c.stroke();

        //Draw the scrubber circle
        c.fillStyle = hover
            ? color
            : "white";
        c.beginPath();
        c.arc(scrubX, scrubY, smallRadius, 0, Math.PI * 2);
        c.fill();
        c.stroke();
    }

    function updateScrubberPosition() {
        //Get data from the audio module
        let currentTime = a.audio.getAudioTimestamp();
        let songLength = a.audio.getAudioLength();
        //If a song is still loading, set to the default angle and skip the rest of the function
        if (songLength == -1) {
            scrubAngle = -Math.PI / 2;
            return;
        }

        //If the mouse is colliding with the scrubber
        if (isMouseCollidingWithScrubber() || scrubbing) {
            //Animate an increase in line width
            lineWidth = Math.min(lineWidth + a.time.dt() * 40, HOVER_LINE_WIDTH);
            smallRadius = Math.min(smallRadius + a.time.dt() * 40, HOVER_SMALL_RADIUS);
            hover = true;
            //If the mouse is also down, scrubbing is happening
            if (a.keys.mouseDown())
                scrubbing = true;
            }
        else {
            hover = false;
            //Animate the line back to normal
            lineWidth = Math.max(lineWidth - a.time.dt() * 40, DEFAULT_LINE_WIDTH);
            smallRadius = Math.max(smallRadius - a.time.dt() * 40, DEFAULT_SMALL_RADIUS);
        }

        if (scrubbing) {
            //Find the scrub angle with respect to the mouse
            let m = a.keys.mouse();
            let centerToMouse = [
                (m[0] - center[0]),
                (m[1] - center[1])
            ];
            scrubAngle = Math.atan(centerToMouse[1] / centerToMouse[0]);
            if (centerToMouse[0] < 0) {
                scrubAngle += Math.PI;
            }
        } else {
            //Get the scrubber angle based on the current song time
            scrubAngle = a.utils.map(currentTime, 0.0, songLength, 0, Math.PI * 2) - Math.PI / 2;
        }

        //If the mouse isn't down and we are still scrubbing
        if (!a.keys.mouseDown() && scrubbing) {
            //Stop scrubbing
            scrubbing = false;
            //Seek to the point in the song that matches the scrub angle
            let toPercent = a.utils.map(scrubAngle, -Math.PI * 0.5, Math.PI * 1.5, 0.0, 100.0);
            a.audio.seekToPercent(toPercent);
        }
    }

    function isMouseCollidingWithScrubber() {
        let m = a.keys.mouse();
        if (!m)
            return false;
        let collision1 = a.utils.circlePointCollision(m[0], m[1], center[0], center[1], radius + 20);
        let collision2 = a.utils.circlePointCollision(m[0], m[1], center[0], center[1], radius - 20);
        return collision1 && !collision2;
    }

    return {
        init: init,
        update: update,
        resize: resize,
        setColor: setColor
    }
}());
