"use strict";

//Init global app
let app = {};

//This is the app loader.  It initiallizes all modules when the window onload event fires
window.onload = function() {
    //Initialize the mouse so errors don't get thrown
    app.mouse = [0, 0];

    //Initialize modules
    app.audio.init();
    app.keys.init();
    app.time.init();
    app.file.init();
    app.scrubber.init();
    app.keybinds.init();
    app.controls.init();
    app.colorChanging.init();
    app.image.init();

    //Initialize main
    app.main.init();

    //Bind mouse events after main
    //This requires that main be initialized first since it requires the canvas element to be set in the app state
    app.keys.bindMouse();
}
