"use strict";

app.bezier = (function() {
    let activeBezier;
    let anchorPoints;

    function setAnchorPoints(points) {
        anchorPoints = points;
        activeBezier = calculateBezier();
    }

    function updateAnchorPointFast(index, newPos) {
        anchorPoints[index][0] = newPos[0];
        anchorPoints[index][1] = newPos[1];
        let tempBezier = calculateBezier(0.05);
        drawBezier(tempBezier);
    }

    function updateAnchorPoint(index, newPos) {
        anchorPoints[index][0] = newPos[0];
        anchorPoints[index][1] = newPos[1];
        activeBezier = calculateBezier();
        drawBezier();
    }

    function calculateBezier(increment = 0.01) {
        let renderedCurve = new Array(Math.floor(1/increment));
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
                renderedCurve[bezInd] = app.utils.lerp2D(t, currentPoints[0], currentPoints[1]);
            } else {
                renderedCurve[bezInd] = currentPoints[0];
            }
            bezInd += 1;
        }
        return renderedCurve;
    }

    function drawBezier(curve = activeBezier) {
        let c = app.ctx;
        c.save();
        c.strokeStyle = "red";
        c.lineJoin = "round";
        c.lineWidth = 4;
        c.beginPath();
        c.moveTo(curve[0][0], curve[0][1]);
        for (let i=1; i<curve.length; i++) {
            c.lineTo(curve[i][0], curve[i][1]);
        }
        c.stroke();
        c.restore();
    }

    function threePointLerp(norm, p0, p1, p2) {
        let p0p1 = app.utils.lerp2D(norm, p0, p1);
        let p1p2 = app.utils.lerp2D(norm, p1, p2);
        return app.utils.lerp2D(norm, p0p1, p1p2);
    }

    return {
        setAnchorPoints: setAnchorPoints,
        updateAnchorPointFast: updateAnchorPointFast,
        updateAnchorPoint: updateAnchorPoint,
        calculateBezier: calculateBezier,
        drawBezier: drawBezier
    }
}())
