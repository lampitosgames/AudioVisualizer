"use strict";

app.drawing = (function() {
    let a = app;
    let scrubAngle;
    let scrubX = 0,
        scrubY = 0;
    let scrubbing = false;

    function getGradient(x1, y1, x2, y2, colorStops) {
        let grad = a.ctx.createLinearGradient(x1, y1, x2, y2);
        for (let i = 0; i < colorStops; i++) {
            grad.addColorStop(colorStops[i][0], colorStops[i][1]);
        }
        return grad;
    }

    function drawCircle(x, y, rad, color) {
        let c = app.ctx;
        c.save();
        c.fillStyle = color;
        c.beginPath();
        c.arc(x, y, rad, 0, Math.PI * 2);
        c.closePath();
        c.fill();
        c.restore();
    }

    function drawAudioCircle(x, y, radius, data) {
        let c = app.ctx;
        //Normalize the data array and map it into the range we want the values to fall between
        let mappedData = new Array(data.length);
        for (let i = 0; i < data.length; i++) {
            mappedData[i] = app.utils.map(data[i], 0, app.audio.getFloatDataMax(), 0, radius / 4);
        }

        //Set up canvas variables
        c.strokeStyle = "rgba(200, 200, 200, 1.0)";
        c.lineWidth = 2;
        c.beginPath();
        let r1 = radius - (mappedData[mappedData.length - 1] + mappedData[0] + mappedData[1]) / 3;
        c.moveTo(x, y - r1);

        //Radians increment based on the granularity of the data
        let increment = (Math.PI * 2) / data.length;
        //Current position around the circle
        let theta = -Math.PI / 2 + increment;
        //Loop through all the data and draw it
        for (let i = 1; i < mappedData.length; i++) {
            //Get three Visualiser data values
            let d0 = mappedData[i - 1];
            let d1 = mappedData[i];
            let d2 = mappedData[(i + 1) % mappedData.length];
            //Average accross 3 data values for smoother curve
            let shiftedRadius = radius - (d0 + d1 + d2) / 3;
            //Line to point on the circle
            c.lineTo(x + Math.cos(theta) * shiftedRadius, y + Math.sin(theta) * shiftedRadius);
            //Increment the theta
            theta += increment;
        }
        c.closePath();
        c.stroke();
    }

    function drawAudioBar(x, y, width, dataVal, maxHeight, color) {
        let height = a.utils.map(dataVal, 0, a.audio.getFloatDataMax(), width, maxHeight);
        height = height == Infinity
            ? 0
            : height;
        let transparencyHeight = Math.pow(height, 1.3);
        let transY = y - transparencyHeight * 0.25;
        let grad = a.ctx.createLinearGradient(x, parseFloat(transY), x, parseFloat(transY + transparencyHeight));
        grad.addColorStop(0, "rgba(" + color[0] + ", " + color[1] + ", " + color[2] + ", 0.0)");
        grad.addColorStop(0.5, "rgba(" + color[0] + ", " + color[1] + ", " + color[2] + ", 0.25)");
        grad.addColorStop(1, "rgba(" + color[0] + ", " + color[1] + ", " + color[2] + ", 0.0)");

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

    return {drawCircle: drawCircle, getGradient: getGradient, drawAudioBar: drawAudioBar, drawAudioCircle: drawAudioCircle};
}());
