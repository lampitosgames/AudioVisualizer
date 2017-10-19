"use strict";

//File loading module that lets users upload audio files.
//Once uploaded, it verifies the format and plugs the data into the audio module
app.file = (function() {
    let uploaderElement;
    let fileReader;

    //Init function to setup the module
    function init() {
        //Create a file reader so the user can upload songs
        fileReader = new FileReader();
        //Get the uploader HTML element
        uploaderElement = document.getElementById("uploader");
        //Add a listener for when a file is uploaded
        uploaderElement.addEventListener("change", handleUpload);
    }

    //Function called when the user uploads a file
    function handleUpload() {
        //Grab the file and read it as an array buffer if it is an mp3
        let file = this.files[0];
        //Check that the file is an audio file
        if (file.type !== "audio/mp3" && file.type !== "audio/flac")
            return;

        //Read the audio data
        let audioData = fileReader.readAsArrayBuffer(file);

        //Bind a function to the onload event that will execute when the file has been uploaded successfully
        //TODO: add duplicate checking via metadata (this would be difficult)
        //check out this link: https://ericbidelman.tumblr.com/post/8343485440/reading-mp3-id3-tags-in-javascript
        fileReader.onload = function() {
            //Get the new song's ID
            let songId = app.state.audio.songs.length;
            //Get the string split index to cut out the global filepath and leave us with just the filename
            let fName = uploaderElement.value;
            let splitIndex = (fName.indexOf('\\') >= 0
                ? fName.lastIndexOf('\\')
                : fName.lastIndexOf('/'));
            //Push the new song to the song array.
            app.state.audio.songs.push({
                id: songId,
                hasBuffer: true,
                buffer: fileReader.result,
                name: fName.substr(splitIndex + 1),
                artist: "Unknown",
                album: "Unknown"
            });
            //Play the song
            app.audio.playFromBuffer(songId, app.state.audio.paused);
        }

    }

    return {init: init}
}());
