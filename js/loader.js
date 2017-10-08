"use strict";

//Init global app
let app = {};

window.onload = function() {
    //Initialize the mouse so errors don't get thrown
    app.mouse = [0, 0];

    //Initialize modules
    app.audio.init();
    app.keys.init();
    app.time.init();
    app.file.init();

    //Initialize main
    app.main.init();
}

document.onmousemove = function(e) {
    app.mouse = app.getMouse(e);
}
