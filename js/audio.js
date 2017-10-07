"use strict";

//Audio module
app.audio = (function(){
    let a = app;

    //Song metadata
    let currentSong;
    let songs = [
        {
            id: 0,
            name: "Firewall",
            artist: "Les Friction",
            album: "Dark Matter",
            filepath: "./media/firewall.mp3"
        },
        {
            id: 1,
            name: "Dark Matter",
            artist: "Les Friction",
            album: "Dark Matter",
            filepath: "./media/darkMatter.mp3"
        }
    ];

    let audioCtx = undefined;
    let nodes = {
        sourceNodeOutput: undefined,
        sourceNode: undefined,
        gainNode: undefined,
        analyserNode: undefined
    };

    //Audio constants
    const DEFAULT_VOLUME = 1.0;
    const DEFAULT_SONG = 0;
    const NUM_SAMPLES = 2048;

    //Visualizer data
    let data = [];
    let audioTimestamp = 0.0;
    let audioTimestampMultiplier = 1.0;

    /**
     * Initialize the audio module
     * Load and play the first song
     */
    function init() {
        //Initialize audio context and nodes
        createAudioContext();
        //Set the volume
        nodes.gainNode.gain.value = DEFAULT_VOLUME;
        //Play the first song
        playNewAudio(DEFAULT_SONG);
        setTimeout(function() {console.log(data)}, 6000);
    }

    function update() {
        //Update the song time
        audioTimestamp += app.time.dt() * audioTimestampMultiplier;

        //Initialize data array
        data = new Float32Array(nodes.analyserNode.frequencyBinCount);
        //Populate the array with frequency data
        nodes.analyserNode.getFloatFrequencyData(data);
        //Populate the array with waveform data
        //nodes.analyserNode.getByteTimeDomainData(data);

    }

    /**
     * Play a new song.  ID can be an index into the array, the name of the song,
     * the artist, or the album.
     */
    function playNewAudio(id) {
        //Check if a search term was passed in place of an index
        if (typeof id === 'string') id = getSongId(id);
        //Prevent invalid calls
        if (!songs[id]) return;

        //Stop the previous song
        stopAudio();
        //Asyncronously load a new song into the audio context
        loadAudio(songs[id].filepath, function() {
            //Play the song
            startAudio();
            currentSong = id;
        });
    }

    /**
     * Seek a percentage of the way through the song
     * Input must be between 0 and 100
     */
    function seekToPercent(percent) {
        //Prevent seeking if there is no song loaded
        if (!nodes.sourceNode || !nodes.sourceNode.buffer) return;
        //Get the song length
        let songLength = getAudioLength();
        //Get the offset (in seconds) based on the percentage
        let offset = app.utils.map(app.utils.clamp(percent, 0.0, 100.0), 0.0, 100.0, 0.0, songLength);
        //After calculating the point in the song to seek to, seek to that time
        seekToTime(offset);
    }

    /**
     * Seek to a specific timestamp in the song
     * Must be in seconds.  Input time is clamped to be > 0 and < the song length
     */
    function seekToTime(time) {
        //Prevent seeking if there is no song loaded
        if (!nodes.sourceNode || !nodes.sourceNode.buffer) return;
        //Clamp the time to the length of the buffer
        time = app.utils.clamp(time, 0.0, getAudioLength());
        //Create a new buffer source and connect it, copying the old buffer
        let newSource = audioCtx.createBufferSource();
        newSource.buffer = nodes.sourceNode.buffer;
        newSource.connect(nodes.sourceNodeOutput);
        //Stop the current source
        stopAudio();
        //Add the new source and start it at the inputted timestamp
        nodes.sourceNode = newSource;
        nodes.sourceNode.start(0, time);
        audioTimestamp = time;
        audioTimestampMultiplier = 1.0;
    }

    /**
     * Get the length (in seconds) of the current audio buffer
     */
    function getAudioLength() {
        if (nodes.sourceNode && nodes.sourceNode.buffer) {
            return nodes.sourceNode.buffer.duration;
        }
        return -1;
    }

    /**
     * Resume the audio context
     */
    function playAudio() {
        audioCtx.resume().then(function() {
            audioTimestampMultiplier = 1.0;
            return;
        });
    }

    /**
     * Pause the audio context
     */
    function pauseAudio() {
        audioCtx.suspend().then(function() {
            audioTimestampMultiplier = 0.0;
            return;
        });
    }


    /**
     * Update the member variables of the audio analyser to change the bounds of its output
     */
    function updateAudioAnalyser(fftSize = NUM_SAMPLES, smoothingTimeConstant = 0.99, minDecibels = -90, maxDecibels = 200) {
        nodes.analyserNode.fftSize = fftSize;
        nodes.analyserNode.smoothingTimeConstant = smoothingTimeConstant;
        nodes.analyserNode.minDecibels = minDecibels;
        nodes.analyserNode.maxDecibels = maxDecibels;
    }

    /**
     * Starts the audio buffer if it exists
     * This function is private
     */
    function startAudio() {
        if (nodes.sourceNode.buffer) {
            nodes.sourceNode.start();
            audioTimestamp = 0.0;
            audioTimestampMultiplier = 1.0;
        }
    }

    /**
     * Stops the audio buffer if it exists
     * This function is private
     */
    function stopAudio() {
        if (nodes.sourceNode.buffer) {
            nodes.sourceNode.stop();
            audioTimestampMultiplier = 0.0;
        }
    }

    /**
     * Lookup a song based on a search term (name, artist, album)
     * This function is private
     */
    function getSongId(searchString) {
        let upper = searchString.toUpperCase();
        //First, lookup by name
        for (var i=0; i<songs.length; i++) {
            let thisSongName = songs[i].name.toUpperCase();
            if (thisSongName === upper) return i;
        }
        //Second, lookup by artist
        for (var i=0; i<songs.length; i++) {
            let thisSongArtist = songs[i].artist.toUpperCase();
            if (thisSongArtist === upper) return i;
        }
        //Last, lookup by album
        for (let i=0; i<songs.length; i++) {
            let thisSongAlbum = songs[i].album.toUpperCase();
            if (thisSongAlbum === upper) return i;
        }
        //No results, return -1
        return -1;
    }

    /**
     * Create an audio context and all associated audio nodes in their default states
     * This function is private
     */
    function createAudioContext() {
        //Create our audio context
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        //Grab the audio source
        nodes.sourceNode = audioCtx.createBufferSource();
        nodes.gainNode = audioCtx.createGain();
        nodes.analyserNode = audioCtx.createAnalyser();

        // fft stands for Fast Fourier Transform
        nodes.analyserNode.fftSize = NUM_SAMPLES;

        //Store the source node's output node for when we create new source nodes later
        nodes.sourceNodeOutput = nodes.gainNode;

        //Hook things up in the right order
        //NOTE: This order is constant
        // source -> gain -> analyser -> output
        nodes.sourceNode.connect(nodes.sourceNodeOutput);
        nodes.gainNode.connect(nodes.analyserNode);
        nodes.analyserNode.connect(audioCtx.destination);
    }

    /**
     * Loads a song into the audio source buffer.
     * Must call createAudioContext before this function.
     * This function is private
     */
    function loadAudio(url, callback) {
        //Create a GET request for the audio buffer
        var request = new XMLHttpRequest();
        request.open('GET', url, true);
        request.responseType = 'arraybuffer';
        //When it loads, call an anonymous function
        request.onload = function() {
            //Decode the data with the pre-existing audio context
            audioCtx.decodeAudioData(request.response, function(buffer) {
                //If there is already a source node, create another
                if (nodes.sourceNode.buffer) {
                    nodes.sourceNode = audioCtx.createBufferSource();
                    nodes.sourceNode.connect(nodes.sourceNodeOutput);
                }
                //Pass this buffer data into the audio source node
                nodes.sourceNode.buffer = buffer;
                //Call the callback that was passed into the loadAudio function
                callback();
            //Print any errors
            }, function(err) {
                console.dir("error loading audio");
                console.dir(err);
            });
        }
        //After creating the request, send it
        request.send();
    }

    return {
        audioCtx: audioCtx,
        songs: songs,
        currentSong: function() { return currentSong; },
        nodes: nodes,
        data: function() { return data; },
        init: init,
        update: update,
        play: playAudio,
        pause: pauseAudio,
        seekToTime: seekToTime,
        seekToPercent: seekToPercent,
        getAudioLength: getAudioLength,
        getAudioTimestamp: function() { return audioTimestamp; },
        playNewAudio: playNewAudio,
        updateAudioAnalyser: updateAudioAnalyser
    }
}());
