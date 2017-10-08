"use strict";

//Keys module
app.keys = (function() {
    let a = app;

    let keydown = [];
    let KEYBOARD = Object.freeze({
        "KEY_LEFT": 37,
        "KEY_UP": 38,
        "KEY_RIGHT": 39,
        "KEY_DOWN": 40,
        "KEY_SPACE": 32,
        "KEY_SHIFT": 16
    });

    function init() { // event listeners
        window.addEventListener("keydown", function(e) {
            keydown[e.keyCode] = true;
        });

        window.addEventListener("keyup", function(e) {
            keydown[e.keyCode] = false;
        });
    }

    return {keydown: keydown, KEYBOARD: KEYBOARD, init: init}
}());
