"use strict";

app.image = (function() {

    function update() {
        //Get rgba pixel data
        var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        //ImageData.data is an 8-bit typed array.  Vals from 0-255. 4 vals per pixel
        var data = imageData.data;
        var length = data.length;
        var width = imageData.width;
        //Step through the data
        for (var i = 0; i < length; i += 4) {
            if (tintRed) {
                //Read the red value
                data[i] = data[i] + 100;
            }
            if (invert) {
                //Invert red channel
                data[i] = 255 - data[i];
                //Invert green channel
                data[i + 1] = 255 - data[i + 1]
                //Invert blue channel
                data[i + 2] = 255 - data[i + 2];
            }
            if (noise && Math.random() < 0.1) {
                //Gray noise
                data[i] = data[i + 1] = data[i + 2] = 128;
            }
            if (lines) {
                var row = Math.floor(i / 4 / width);
                //Draw a full-width line every 50 pixels
                if (row % 50 == 0) {
                    //This row
                    data[i] = data[i + 1] = data[i + 2] = data[i + 3] = 255;
                    //next row\
                    var j = width * 4;
                    data[i + j] = data[i + j + 1] = data[i + j + 2] = data[i + j + 3] = 255;
                }
            }

            //Saturation
            data[i] = Math.round(data[i] * brightnessPercent);
            data[i + 1] = Math.round(data[i + 1] * brightnessPercent);
            data[i + 2] = Math.round(data[i + 2] * brightnessPercent);
        }
        //Put the modified data back onto the canvas
        ctx.putImageData(imageData, 0, 0);
    }
}());
