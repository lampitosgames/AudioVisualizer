"use strict";

app.file = (function() {
    let uploaderElement;
    let fileReader;

    function init() {
        fileReader = new FileReader();
        uploaderElement = document.getElementById("uploader");
        uploaderElement.addEventListener("change", function() {
            let file = this.files[0];
            if (file.type !== "audio/mp3")
                return;

            let audioData = fileReader.readAsArrayBuffer(file);
            fileReader.onload = function() {
                console.dir(fileReader.result);
                app.audio.playFromBuffer(fileReader.result);
            }
        });
    }

    return {
        init: init
    }
}());
