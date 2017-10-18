"use strict";

app.scrubber = (function() {
    let a = app;
    //Shorthand for the scrubber state
    let s, sa, ss, sc, sp, scs;

    //Boolean toggles for UI animation
    let scrubbing = false;
    let hover = false;

    /**
     * Init the scrubber
     */
    function init() {
        //Get shorthand state
        s = a.state;
        sa = a.state.audio;
        ss = a.state.scrubber;
        sc = a.state.color;
        sp = a.state.parallax;
        scs = a.state.color.scrubber;

        ss.$scrubberWrapper = document.getElementById("scrubberWrapper");
        ss.$songName = document.getElementById("songName");
        ss.$artistName = document.getElementById("artistName");
        ss.$prevSong = document.getElementById("prevSong");
        ss.$playPauseButton = document.getElementById("playPauseButton");
        ss.$nextSong = document.getElementById("nextSong");
        ss.$volumeDownIcon = document.getElementById("volumeDownIcon");
        ss.$volumeUpIcon = document.getElementById("volumeUpIcon");

        //Bind events to elements
        ss.$prevSong.addEventListener("click", a.keybinds.previousSong);
        ss.$playPauseButton.addEventListener("click", a.keybinds.pausePlay);
        ss.$nextSong.addEventListener("click", a.keybinds.nextSong);
        ss.$volumeUpIcon.addEventListener("click", function() {
            sa.nodes.gainNode.gain.value = 2.0;
            s.controls.$volumeSlider.setCSS(sa.nodes.gainNode.gain.value);
            s.controls.$volumeSlider.value = sa.nodes.gainNode.gain.value;
        });
        ss.$volumeDownIcon.addEventListener("click", function() {
            sa.nodes.gainNode.gain.value = 0.001;
            s.controls.$volumeSlider.setCSS(sa.nodes.gainNode.gain.value);
            s.controls.$volumeSlider.value = sa.nodes.gainNode.gain.value;
        });
    }

    /**
     * Update and draw the scrubber
     */
    function update() {
        //Grab variables from state
        let radius = ss.radius;
        let center = ss.center = [
            a.viewport.width/2 + sp.scrubberParallax[0],
            a.viewport.height/2 + sp.scrubberParallax[1]
        ];

        //draw the circle's shadow by layering very transparent circles in a line
        for (let i = Math.floor(radius * 0.5); i > 0; i -= 3) {
            a.drawing.drawCircle(center[0] - sp.scrubberShadow[0]*i, center[1] + sp.scrubberShadow[1]*i, radius, scs.shadowColor.get());
        }
        //Draw the main circle.  The gradient helps it stand out against the background
        let grad = a.ctx.createLinearGradient(center[0] + radius, center[1] - radius, center[0] - radius, center[1] + radius);
        grad.addColorStop(0, scs.gradientColor1.get());
        grad.addColorStop(1, scs.gradientColor2.get());
        a.drawing.drawCircle(center[0], center[1], radius, grad);

        //Get the song data
        let songData = s.audio.songs[s.audio.currentSong];
        if (songData) {
            //Put the song data on the page
            if (ss.$songName.innerHTML != songData.name) {
                ss.$songName.innerHTML = songData.name;
            }
            if (ss.$artistName.innerHTML != songData.artist) {
                ss.$artistName.innerHTML = songData.artist;
            }
        }
        //Get the bounding client rect for the scrubber wrapper html element
        let sWrapperRect = ss.$scrubberWrapper.getBoundingClientRect();
        //Center the element.  This isn't done in CSS because of parallax
        ss.$scrubberWrapper.style.left = center[0] - (sWrapperRect.width/2) + "px";
        ss.$scrubberWrapper.style.top = center[1] - (sWrapperRect.height/2) + "px";

        //Grab the audio data
        let aData = s.audio.data;
        //Draw the visualized circle around the edge
        a.drawing.drawAudioCircle(center[0], center[1], radius - 30, aData, sc.secondaryColor.get());
        //Draw the audio scrubber.  It forms a circular ring around the background we just drew
        drawScrubber();
    }

    function resize() {
        //Re-calculate the radius
        ss.radius = a.viewport.height * 0.3;
        //Re-calculate the centerpoint
        ss.center = [
            a.viewport.width / 2,
            a.viewport.height / 2
        ];

        //Find all the defaults based on the other sizes
        s.e.DEFAULT_LINE_WIDTH = ss.radius * 0.0166666666666666;
        s.e.HOVER_LINE_WIDTH = s.e.DEFAULT_LINE_WIDTH * 2;
        s.e.DEFAULT_SMALL_RADIUS = ss.radius * 0.02333333333;
        s.e.HOVER_SMALL_RADIUS = s.e.DEFAULT_SMALL_RADIUS * 1.5;
        //Set variables
        ss.smallRadius = s.e.DEFAULT_SMALL_RADIUS;
        ss.lineWidth = s.e.DEFAULT_LINE_WIDTH;

    }

    function drawScrubber() {
        let c = app.ctx;

        //Update the scrubber position.  This detects scrubber input and gets the arc angle for drawing
        updateScrubberPosition();

        //Draw the scrubber
        ss.scrubX = ss.center[0] + Math.cos(ss.scrubAngle) * ss.radius;
        ss.scrubY = ss.center[1] + Math.sin(ss.scrubAngle) * ss.radius;

        //Draw the timeline
        c.lineWidth = ss.lineWidth;
        //If we are scrubbing, draw a full, slightly-visible scrub track
        if (hover) {
            c.strokeStyle = scs.scrubBackgroundColor.get();
            c.beginPath();
            c.arc(ss.center[0], ss.center[1], ss.radius, 0, Math.PI * 2);
            c.stroke();
        }

        c.strokeStyle = scs.scrubberColor.get();
        c.beginPath();
        c.arc(ss.center[0], ss.center[1], ss.radius, -Math.PI / 2, ss.scrubAngle);
        c.stroke();

        //Draw the scrubber circle
        c.fillStyle = hover
            ? scs.scrubberColor.get()
            : scs.gradientColor2.get();
        c.beginPath();
        c.arc(ss.scrubX, ss.scrubY, ss.smallRadius, 0, Math.PI * 2);
        c.fill();
        c.stroke();
    }

    function updateScrubberPosition() {
        //Get data from the audio module
        let currentTime = s.audio.audioTimestamp;
        let songLength = a.audio.getAudioLength();
        //If a song is still loading, set to the default angle and skip the rest of the function
        if (songLength == -1) {
            ss.scrubAngle = -Math.PI / 2;
            return;
        }

        //If the mouse is colliding with the scrubber
        if (isMouseCollidingWithScrubber() || scrubbing) {
            //Animate an increase in line width
            ss.lineWidth = Math.min(ss.lineWidth + a.time.dt() * 40, s.e.HOVER_LINE_WIDTH);
            ss.smallRadius = Math.min(ss.smallRadius + a.time.dt() * 40, s.e.HOVER_SMALL_RADIUS);
            hover = true;
            //If the mouse is also down, scrubbing is happening
            if (a.keys.mouseDown())
                scrubbing = true;
            }
        else {
            hover = false;
            //Animate the line back to normal
            ss.lineWidth = Math.max(ss.lineWidth - a.time.dt() * 40, s.e.DEFAULT_LINE_WIDTH);
            ss.smallRadius = Math.max(ss.smallRadius - a.time.dt() * 40, s.e.DEFAULT_SMALL_RADIUS);
        }

        if (scrubbing) {
            //Find the scrub angle with respect to the mouse
            let m = a.keys.mouse();
            let centerToMouse = [
                (m[0] - ss.center[0]),
                (m[1] - ss.center[1])
            ];
            ss.scrubAngle = Math.atan(centerToMouse[1] / centerToMouse[0]);
            if (centerToMouse[0] < 0) {
                ss.scrubAngle += Math.PI;
            }
        } else {
            //Get the scrubber angle based on the current song time
            ss.scrubAngle = a.utils.map(currentTime, 0.0, songLength, 0, Math.PI * 2) - Math.PI / 2;
        }

        //If the mouse isn't down and we are still scrubbing
        if (!a.keys.mouseDown() && scrubbing) {
            //Stop scrubbing
            scrubbing = false;
            //Seek to the point in the song that matches the scrub angle
            let toPercent = a.utils.map(ss.scrubAngle, -Math.PI * 0.5, Math.PI * 1.5, 0.0, 100.0);
            a.audio.seekToPercent(toPercent);
        }
    }

    function isMouseCollidingWithScrubber() {
        let m = a.keys.mouse();
        if (!m)
            return false;
        let collision1 = a.utils.circlePointCollision(m[0], m[1], ss.center[0], ss.center[1], ss.radius + 20);
        let collision2 = a.utils.circlePointCollision(m[0], m[1], ss.center[0], ss.center[1], ss.radius - 20);
        return collision1 && !collision2;
    }

    return {init: init, update: update, resize: resize}
}());
