"use strict";

app.drawing = (function() {
    let a = app;

    function drawCircle(x, y, rad, color) {
        let c = app.ctx;
        c.save();
        c.fillStyle = color;
        c.beginPath();
        c.arc(x, y, rad, 0, Math.PI*2);
        c.closePath();
        c.fill();
        c.restore();
    }

    function drawScrubber() {
        let c = app.ctx;
        let currentTime = a.audio.getAudioTimestamp();
        let songLength = a.audio.getAudioLength();
        let circleX = a.viewport.width/2;
        let circleY = a.viewport.height/2;
        let radius = 300;

        // if (a.keys.mouseDown) {
        //     let m = a.mouse;
        //     scrubAngle = Math.atan((mouse[0] - circleX)/(mouse[1] - circleY));
        // } else {
        let scrubAngle = a.utils.map(currentTime, 0.0, songLength, 0, Math.PI*2) - Math.PI/2;
        // }

        scrubAngle = songLength == -1 ? -Math.PI/2 : scrubAngle;
        let scrubX = circleX + Math.cos(scrubAngle) * radius;
        let scrubY = circleY + Math.sin(scrubAngle) * radius;

        c.strokeStyle = "red";
        c.fillStyle = "white";
        c.lineWidth = 5;
        c.beginPath();
        c.arc(circleX, circleY, radius, -Math.PI/2, scrubAngle);
        c.stroke();
        c.beginPath();
        c.arc(scrubX, scrubY, 10, 0, Math.PI * 2);
        c.fill();
        c.stroke();
    }

    function drawAudioBar(x, y, width, dataVal, maxHeight, color) {
        let height = a.utils.map(dataVal, 0, a.audio.getFloatDataMax(), width, maxHeight);
        height = height == Infinity ? 0 : height;
        let transparencyHeight = Math.pow(height, 1.3);
        let transY = y - transparencyHeight * 0.25;
        let grad = a.ctx.createLinearGradient(x, parseFloat(transY), x, parseFloat(transY+transparencyHeight));
        grad.addColorStop(0,"rgba(" + color[0] + ", " + color[1] + ", " + color[2] + ", 0.0)");
        grad.addColorStop(0.5,"rgba(" + color[0] + ", " + color[1] + ", " + color[2] + ", 0.25)");
        grad.addColorStop(1,"rgba(" + color[0] + ", " + color[1] + ", " + color[2] + ", 0.0)");

        drawLine(x, transY, width, transparencyHeight, grad);
        drawLine(x, y, width, height, "rgba(" + color[0] + ", " + color[1] + ", " + color[2] + ", 1.0)")
    }

    function drawLine(x, y, width, height, color) {
        let c = app.ctx;
        c.save();
        c.lineWidth = width;
        c.strokeStyle = color;
        c.beginPath();
        c.moveTo(x, y);
        c.lineTo(x, y + height);
        c.stroke();
        c.restore();
    }

    return {
        drawAudioBar: drawAudioBar,
        drawCircle: drawCircle,
        drawScrubber: drawScrubber
    };
}());
