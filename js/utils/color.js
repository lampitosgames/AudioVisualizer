"use strict";

//This is a color class that lets other modules listen for changes to the color
app.Color = (function() {
    function Color(r, g, b, a = 1.0) {
        this.val = [r, g, b, a];

        this.listeners = [];

        this.addListener = function(callback) {
            this.listeners.push(callback);
        }

        this.updateColor = function() {
            for (let i = 0; i < this.listeners.length; i++) {
                this.listeners[i]();
            }
        }

        this.get = function() {
            return "rgba(" + this.val[0] + ", " + this.val[1] + ", " + this.val[2] + ", " + this.val[3] + ")"
        }

        this.set = function(r, g, b, a = 1.0) {
            this.val = [r, g, b, a];
            this.updateColor();
        }

        this.r = function(r = this.val[0]) {
            if (r == this.val[0])
                return r;
            this.val[0] = r;
            this.updateColor();
        }

        this.g = function(g = this.val[1]) {
            if (g == this.val[1])
                return g;
            this.val[1] = g;
            this.updateColor();
        }

        this.b = function(b = this.val[2]) {
            if (b == this.val[2])
                return b;
            this.val[2] = b;
            this.updateColor();
        }

        this.a = function(a = this.val[3]) {
            if (a == this.val[3])
                return a;
            this.val[3] = a;
            this.updateColor();
        }
    }

    return Color
}());
