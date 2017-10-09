"use strict";

app.utils = {
    //normalize function (find where the 'value' falls percentage-wise between the min and max)
    norm: function(value, min, max) {
        return (value - min) / (max - min);
    },
    //linear interpolation function (find the value from a min and max value, and a normalized number) ((max-min) * norm + min)
    lerp: function(norm, min, max) {
        return (max - min) * norm + min;
    },
    lerp2D: function(norm, p0, p1) {
        var x = (p1[0] - p0[0]) * norm + p0[0];
        var y = (p1[1] - p0[1]) * norm + p0[1];
        return [x, y];
    },
    //Map funciton that gets the normalized value of a number in one range, and returns the interpolated value in a second range
    map: function(value, sourceMin, sourceMax, destMin, destMax) {
        var n = this.norm(value, sourceMin, sourceMax);
        return this.lerp(n, destMin, destMax);
    },
    //Clamp.  Make sure a value stays between two values in a range
    clamp: function(value, min, max) {
        return Math.min(Math.max(value, Math.min(min, max)), Math.max(min, max));
    },
    //convert degrees to radians
    inRads: function(degr) {
        return degr / 180 * Math.PI;
    },
    //convert radians to degrees
    inDegr: function(rads) {
        return rads * 180 / Math.PI;
    },
    //detect if a value is within a range
    inRange: function(value, min, max) {
        return value >= Math.min(min, max) && value <= Math.max(min, max);
    },
    //detect if two ranges overlap
    rangeIntersect: function(min0, max0, min1, max1) {
        return Math.max(min0, max0) >= Math.min(min1, max1) && Math.min(min0, max0) <= Math.min(min1, max1);
    },
    //detect if one range is fully in another range
    rangeContains: function(min0, max0, min1, max1) {
        return Math.max(min0, max0) >= Math.max(min1, max1) && Math.min(min0, max0) <= Math.min(min1, max1);
    },
    //random number within a range
    randomRange: function(min, max) {
        return min + Math.random() * (max - min);
    },
    //random integer within a range
    randomInt: function(min, max) {
        return Math.floor(min + Math.random() * (max - min + 1));
    },
    //random unit vector
    randomVec: function() {
        let vec = [
            this.randomRange(-1, 1),
            this.randomRange(-1, 1)
        ];
        let len = Math.sqrt(vec[0] * vec[0] + vec[1] * vec[1]);
        if (len == 0) {
            vec = [1, 0];
            len = 1;
        }
        return [
            vec[0] / len,
            vec[1] / len
        ];
    },
    //random rgb color
    randomRGB: function() {
        return "rgb(" + this.randomInt(0, 255) + "," + this.randomInt(0, 255) + "," + this.randomInt(0, 255) + ")";
    },
    //random rgba color
    randomRGBA: function() {
        return "rgba(" + this.randomInt(0, 255) + "," + this.randomInt(0, 255) + "," + this.randomInt(0, 255) + "," + this.randomRange(0.0, 1.0) + ")";
    },
    //random rgb color with fixed opacity
    randomRGBOpacity: function(opacity) {
        return "rgba(" + this.randomInt(0, 255) + "," + this.randomInt(0, 255) + "," + this.randomInt(0, 255) + "," + this.clamp(opacity, 0.0, 1.0) + ")";
    },

    //Drawing
    /**
     * Write text with given parameters.
     * From: Boomshine-ICE-start
     */
    fillText: function(string, x, y, css, color) {
        let c = app.ctx;
        c.save();
        // https://developer.mozilla.org/en-US/docs/Web/CSS/font
        c.font = css;
        c.fillStyle = color;
        c.fillText(string, x, y);
        c.restore();
    },
    /**
     * Fill a circle
     */
    fillCircle: function(x, y, radius, fillColor) {
        let c = app.ctx;
        c.fillStyle = fillColor;
        c.globalAlpha = 0.75;
        c.beginPath();
        c.arc(x, y, radius, 0, Math.PI * 2);
        c.fill();
        c.globalAlpha = 1.0;
    },
    /**
     * Stroke a Circle
     * this sounds a little dirty 0_0
     */
    strokeCircle: function(x, y, radius, strokeColor, lineWidth) {
        let c = app.ctx;
        c.save();
        c.beginPath();
        c.strokeStyle = strokeColor;
        c.lineWidth = lineWidth;
        c.arc(x, y, radius, 0, Math.PI * 2);
        c.stroke();
        c.restore();
    },

    /**
     * Draw a bezier curve manually
     */
    drawBezier: function(pointArray) {
        let c = app.ctx;
        c.save();
        c.beginPath();
        c.strokeStyle = "red";
        c.lineJoin = "round";
        c.lineWidth = 4;
        c.moveTo(pointArray[0][0], pointArray[0][1]);

        let threePointLerp = function(norm, tp0, tp1, tp2) {
            let tp0tp1 = app.utils.lerp2D(norm, tp0, tp1);
            let tp1tp2 = app.utils.lerp2D(norm, tp1, tp2);
            return app.utils.lerp2D(norm, tp0tp1, tp1tp2);
        }

        //Loop over the time interval
        for (let t=0; t<=1.0; t = t+1) {
            //Store the current points array
            let currentPoints = pointArray;
            //While there are more than 2 points to lerp between
            while (currentPoints.length > 2) {
                let newArray = [];
                //Loop through all current points and lerp to find a new point in pairs of 3
                for (let i=0; i<currentPoints.length-2; i++) {
                    //Push new lerped point to the newArray
                    newArray.push(threePointLerp(t, currentPoints[i], currentPoints[i+1], currentPoints[i+2]));
                }
                console.log(newArray.length);
                //Replace current points with newly lerped points
                currentPoints = newArray;
            }

            let drawPoint = currentPoints[0];
            if (currentPoints.length > 1) {
                //When there are only 2 points in the currentPoints array, lerp to get the final point
                let drawPoint = app.utils.lerp2D(t, currentPoints[0], currentPoints[1]);
            }

            c.lineTo(drawPoint[0], drawPoint[1]);
            c.stroke();
        }
        c.stroke();
        c.restore();
    }
}

/**
 * Get a cross-browser viewport object with related size data
 */
app.getViewport = function() {
    var ele = window,
        pre = 'inner';
    if (!('innerWidth' in window)) {
        pre = 'client';
        ele = document.documentElement || document.body;
    }
    //Width of window
    return {
        width: ele[pre + 'Width'],
        //Height of window
        height: ele[pre + 'Height'],
        //View width css unit
        vw: ele[pre + 'Width'] / 100.0,
        //View Height css unit
        vh: ele[pre + 'Height'] / 100.0
    };
}

app.getMouse = function(e) {
    return [
        e.pageX - e.target.offsetLeft,
        e.pageY - e.target.offsetTop
    ];
}
