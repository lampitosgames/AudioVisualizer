"use strict";

//Module for per-pixel image manipulation.
//It is INCREDIBLY LAGGY USE WITH CAUTION.  The CPU doesn't like rendering pixels on a 1080p monitor
//Since my app is fullscreen, it gets bad
app.image = (function() {
    let a = app;
    let s, si;
    let data;

    function init() {
        s = a.state;
        si = s.image;
    }

    function update() {
        //Only get the image data and update with effects if one or more is enabled.
        //This lags very hard since the app is fullscreen.
        if (!si.inverted && !si.addNoise && !si.redshift && !si.blueshift && !si.greenshift) {
            return;
        }

        //Grab image pixel data
        var imageData = a.ctx.getImageData(0, 0, a.canvas.width, a.canvas.height);
        //Store the data locally
        data = imageData.data;
        //Get the image width
        let width = imageData.width;

        //Loop for every pixel
        for (var i = 0; i < data.length; i += 4) {
            //Apply pixel effects
            invertPixel(i);
            redshiftPixel(i);
            blueshiftPixel(i);
            greenshiftPixel(i);
            generateNoise(i);
        }
        //Put the modified data back onto the canvas
        a.ctx.putImageData(imageData, 0, 0);
    }

    function invertPixel(i) {
        if (si.inverted) {
            //Invert red channel
            data[i] = 255 - data[i];
            //Invert green channel
            data[i + 1] = 255 - data[i + 1]
            //Invert blue channel
            data[i + 2] = 255 - data[i + 2];
        }
    }

    function redshiftPixel(i) {
        if (si.redshift) {
            //Redshift the pixel
            data[i] = data[i] + 100;
        }
    }

    function blueshiftPixel(i) {
        if (si.blueshift) {
            //Blueshift the pixel
            data[i+1] = data[i+1] + 100;
        }
    }

    function greenshiftPixel(i) {
        if (si.greenshift) {
            //Greenshift the pixel
            data[i+2] = data[i+2] + 100;
        }
    }

    function generateNoise(i) {
        if (si.addNoise && a.utils.randomInt(0, 100) < 10) {
            //Add noise
            data[i] = data[i + 1] = data[i + 2] = a.utils.randomInt(0, 255);
        }
    }

    return {
        init: init,
        update: update
    }
}());
