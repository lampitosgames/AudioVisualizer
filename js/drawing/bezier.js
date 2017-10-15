"use strict";

app.bezier = (function() {
    let a = app;
    /**
     * This function re-calculates the hardcoded bezier anchor points for the main module
     * While the values are hardcoded, they are relative to the viewport size
     */
    function updateBezierCurves() {
        //Re-calculate bezier curves.  The values are hardcoded but use relative positioning based on the viewport
        a.state.main.bezierCurves = [];
        //Store the viewport object shorthand
        let v = a.viewport;
        //Relative size modifier of 100px on a 1080p screen.
        let rel100 = 0.0909090909 * v.height;

        //Hardcoded bezier curves
        a.state.main.bezierCurves.push(createBezierCurve(1.0/a.audio.getDataLength(), [
            [0, v.height / 3],
            [v.width / 2, 2*rel100],
            [0, v.height]
        ]));
        a.state.main.bezierCurves.push(createBezierCurve(1.0/a.audio.getDataLength(), [
            [v.width, v.height * 2 / 3],
            [v.width / 2, v.height - 2*rel100],
            [v.width, 0]
        ]));
        a.state.main.bezierCurves.push(createBezierCurve(1.0/a.audio.getDataLength(), [
            [0, 0],
            [v.width * 3 / 7, 7*rel100],
            [v.width * 3 / 7, -6*rel100],
            [v.width * 2 / 3, 6*rel100],
            [v.width * 7 / 8, 0]
        ]));
        a.state.main.bezierCurves.push(createBezierCurve(1.0/a.audio.getDataLength(), [
            [v.width, v.height],
            [v.width * 4 / 7, v.height - 7*rel100],
            [v.width * 4 / 7, v.height + 6*rel100],
            [v.width / 3, v.height - 6*rel100],
            [v.width / 8, v.height]
        ]));
    }

    /**
     * A function that creates a bezier curve based on an array of anchorPoints
     * Returns a rasterized list of points and their curve normals for drawing
     *
     * The increment parameter is how much the t value increases every iteration
     * and 1/increment is how long the returned list will be
     */
    function createBezierCurve(increment = 1.0/app.audio.getDataLength(), anchorPoints) {
        let renderedCurvePoints = new Array(Math.floor(1/increment));
        //Loop over the interval
        let bezInd = 0;
        for (let t=0; t < 1+increment; t += increment) {
            //Store the current points array
            let currentPoints = anchorPoints;
            //While there are more than 2 points to lerp between
            while (currentPoints.length > 2) {
                let newArray = new Array(currentPoints.length - 2);
                //Loop through all current points and lerp to find a new point in pairs of 3
                for (let i=0; i<currentPoints.length-2; i++) {
                    //Push new lerped point to the newArray
                    newArray[i] = threePointLerp(t, currentPoints[i], currentPoints[i+1], currentPoints[i+2]);
                }
                //Replace current points with newly lerped points
                currentPoints = newArray;
            }

            if (currentPoints.length > 1) {
                renderedCurvePoints[bezInd] = app.utils.lerp2D(t, currentPoints[0], currentPoints[1]);
            } else {
                renderedCurvePoints[bezInd] = currentPoints[0];
            }
            bezInd += 1;
        }

        //Get normals to the curve
        //Not actually using derivatives, just an approximation
        let renderedCurve = new Array(renderedCurvePoints.length);
        renderedCurve[0] = {
            x: renderedCurvePoints[0][0],
            y: renderedCurvePoints[0][1],
            norm: getNormal(renderedCurvePoints[0], renderedCurvePoints[1])
        }
        for (let i=1; i<renderedCurvePoints.length; i++) {
            renderedCurve[i] = {
                x: renderedCurvePoints[i][0],
                y: renderedCurvePoints[i][1],
                norm: getNormal(renderedCurvePoints[i-1], renderedCurvePoints[i]),
                angle: 0
            }
            //Get the angle of canvas rotation that will align it with the local coordinates
            renderedCurve[i].angle = Math.atan2(-renderedCurve[i].norm[0], renderedCurve[i].norm[1]);
        }
        return renderedCurve;
    }

    /**
     * Draw an audio visualized curve
     * Accepts a rendered curve, the audio data, and a color to draw in
     */
    function drawBezier(curve, data, color) {
        //If there is no data, do nothing
        if (!data) return;
        let c = app.ctx;
        //For every position on the curve
        for (let n=1; n<curve.length; n++) {
            //Save and restore the canvas state so any canvas rotations get undone
            c.save();
            //Translate the canvas to the current point on the curve
            c.translate(curve[n].x, curve[n].y);
            //Get the angle of the normal and rotate the canvas to it
            c.rotate(curve[n].angle);
            //Map the audio data to get a normalized height
            let height = app.utils.map(data[n], 0, app.audio.getDataMax(), 2, app.viewport.height/4);
            height = height == Infinity ? 0 : height;

            //Draw a line normal to the curve based on the intensity of the audio
            c.strokeStyle = color;
            c.lineWidth = 2;
            c.beginPath();
            c.moveTo(0, 0);
            c.lineTo(0, height);
            c.stroke();

            c.restore();
        }
    }

    /**
     * Get a normal vector to a lineTo
     */
    function getNormal(p1, p2) {
        let tangent = [
            p2[0]-p1[0],
            p2[1]-p1[1]
        ];
        let length = Math.sqrt(tangent[0]*tangent[0]+tangent[1]*tangent[1]);
        return [tangent[1]/length, -tangent[0]/length];
    }

    /**
     * Helper function for bezier curves.
     */
    function threePointLerp(norm, p0, p1, p2) {
        let p0p1 = app.utils.lerp2D(norm, p0, p1);
        let p1p2 = app.utils.lerp2D(norm, p1, p2);
        return app.utils.lerp2D(norm, p0p1, p1p2);
    }

    return {
        updateBezierCurves: updateBezierCurves,
        createBezierCurve: createBezierCurve,
        drawBezier: drawBezier
    }
}())
