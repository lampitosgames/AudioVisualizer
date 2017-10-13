"use strict";

app.bezier = (function() {
    function createBezierCurve(increment = 1.0/256, anchorPoints) {
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
                norm: getNormal(renderedCurvePoints[i-1], renderedCurvePoints[i])
            }
        }

        return renderedCurve;
    }

    function drawBezier(curve, data, color) {
        if (!data) return;

        let c = app.ctx;

        for (let n=0; n<curve.length; n++) {
            c.save();

            c.translate(curve[n].x, curve[n].y);
            let angle = Math.atan2(-curve[n].norm[0], curve[n].norm[1]);
            c.rotate(angle);

            let height = app.utils.map(data[n], 0, app.audio.getFloatDataMax(), 2, app.viewport.height/4);
            height = height == Infinity ? 0 : height;
            c.strokeStyle = color;
            c.lineWidth = 2;
            c.beginPath();
            c.moveTo(0, 0);
            c.lineTo(0, height);
            c.stroke();

            c.restore();
        }
    }


    function getNormal(p1, p2) {
        let tangent = [
            p2[0]-p1[0],
            p2[1]-p1[1]
        ];
        let length = Math.sqrt(tangent[0]*tangent[0]+tangent[1]*tangent[1]);
        return [tangent[1]/length, -tangent[0]/length];
    }

    function threePointLerp(norm, p0, p1, p2) {
        let p0p1 = app.utils.lerp2D(norm, p0, p1);
        let p1p2 = app.utils.lerp2D(norm, p1, p2);
        return app.utils.lerp2D(norm, p0p1, p1p2);
    }

    return {
        createBezierCurve: createBezierCurve,
        drawBezier: drawBezier
    }
}())
