"use strict";

app.state = (function() {
    let a = app;

    let main = {
        graphTypes: {
            DRAW_LINE: 0,
            DRAW_BEZIER: 1,
        },
        graphType: 0,
        bezierCurves: [],
        animationID: 0,

    };
    let color = {
        primaryColor: "rgb(255, 0, 0)",
        backgroundColor: "rgb(247, 247, 247)",
    }
    return {
        main: main,
        color: color,
    }
}());
