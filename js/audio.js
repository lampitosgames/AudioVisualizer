"use strict";

//Audio module
app.audio = (function() {
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
        }, {
            id: 1,
            name: "Dark Matter",
            artist: "Les Friction",
            album: "Dark Matter",
            filepath: "./media/darkMatter.mp3"
        }, {
            id: 2,
            name: "No Vacancy",
            artist: "OneRepublic",
            album: "No Vacancy",
            filepath: "./media/noVacancy.mp3"
        }
    ];

    //Audio API variables
    let audioCtx = undefined;
    //Promise used for async loading of new songs
    let newAudioPromise = undefined;
    //Active audio nodes
    let nodes = {
        sourceNodeOutput: undefined,
        sourceNode: undefined,
        gainNode: undefined,
        analyserNode: undefined
    };

    //Audio constants
    const DEFAULT_VOLUME = 1.0;
    const DEFAULT_SONG = 0;
    const NUM_SAMPLES = 1024;

    //Visualizer data
    let data = [];
    //Maximum value of any single item in the data array.  By default, the data array is floats
    let floatDataMaxValue = Math.pow(255, 8);

    //Audio timing trackers
    let audioTimestamp = 0.0;
    let paused = false;
    let playbackSpeed = 1.0;

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
    }

    /**
     * Update the audio module.
     * Play new songs, update visualizer data, apply audio effects
     */
    function update() {
        //If a promise is waiting to be resolved (new song loading), pause
        if (newAudioPromise != undefined)
            return;

        //If the audio is paused, return
        if (paused)
            return;

        //Check if the current song is done playing.  If it is, go to the next one.
        if (getAudioLength() != -1 && audioTimestamp > getAudioLength()) {
            newAudioPromise = playNewAudio((currentSong + 1) % songs.length);
            newAudioPromise.then(function() {
                newAudioPromise = undefined;
            });
            return;
        }

        //Update the song time
        audioTimestamp += app.time.dt() * nodes.sourceNode.playbackRate.value;

        //Initialize data array
        let floatRawData = new Float32Array(nodes.analyserNode.frequencyBinCount);
        let waveRawData = new Uint8Array(nodes.analyserNode.frequencyBinCount);
        //Populate the array with frequency data
        nodes.analyserNode.getFloatFrequencyData(floatRawData);
        //Populate the array with waveform data
        // nodes.analyserNode.getByteTimeDomainData(waveRawData);

        //Scale float data logrithmically and cut off the latter half.  This is so displaying is easier
        data = new Float32Array(nodes.analyserNode.frequencyBinCount / 2);
        for (let i = 0; i < data.length; i++) {
            data[i] = Math.pow((floatRawData[i] + 145) * 2, 8);
        }
    }

    /**
     * Play a new song.  ID can be an index into the array, the name of the song,
     * the artist, or the album.
     * Returns a promise that resolves when the audio is loaded
     */
    function playNewAudio(id) {
        //Check if a search term was passed in place of an index
        if (typeof id === 'string')
            id = getSongId(id);

        //Prevent invalid calls
        if (!songs[id])
            return;

        //Stop the previous song
        stopAudio();

        //Asyncronously load a new song into the audio context
        //Return a promise that resolves when the audio loads successfully
        return new Promise(function(resolve, reject) {
            loadAudio(songs[id].filepath, function() {
                //Play the song
                startAudio();
                currentSong = id;
                resolve();
            }, reject);
        });
    }

    /**
     * Seek a percentage of the way through the song
     * Input must be between 0 and 100
     */
    function seekToPercent(percent) {
        //Prevent seeking if there is no song loaded
        if (!nodes.sourceNode || !nodes.sourceNode.buffer)
            return;

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
        if (!nodes.sourceNode || !nodes.sourceNode.buffer)
            return;

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
        //Change the manually-tracked timestamp variables to match the updated song time
        audioTimestamp = time;
        paused = false;
        nodes.sourceNode.playbackRate.value = playbackSpeed;
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
            paused = false;
            return;
        });
    }

    /**
     * Pause the audio context
     */
    function pauseAudio() {
        audioCtx.suspend().then(function() {
            paused = true;
            return;
        });
    }

    /**
     * Set the audio playback speed
     */
    function setPlaybackSpeed(multiplier) {
        playbackSpeed = multiplier;
        nodes.sourceNode.playbackRate.value = playbackSpeed;
    }

    /**
     * Update the member variables of the audio analyser to change the bounds of its output
     */
    function updateAudioAnalyser(fftSize = NUM_SAMPLES, smoothingTimeConstant = 0.99, minDecibels = -100, maxDecibels = 50) {
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
            paused = false;
            nodes.sourceNode.playbackRate.value = playbackSpeed;
        }
    }

    /**
     * Stops the audio buffer if it exists
     * This function is private
     */
    function stopAudio() {
        if (nodes.sourceNode.buffer) {
            nodes.sourceNode.stop();
            paused = true;
        }
    }

    /**
     * Lookup a song based on a search term (name, artist, album)
     * This function is private
     */
    function getSongId(searchString) {
        let upper = searchString.toUpperCase();
        //First, lookup by name
        for (var i = 0; i < songs.length; i++) {
            let thisSongName = songs[i].name.toUpperCase();
            if (thisSongName === upper)
                return i;
            }
        //Second, lookup by artist
        for (var i = 0; i < songs.length; i++) {
            let thisSongArtist = songs[i].artist.toUpperCase();
            if (thisSongArtist === upper)
                return i;
            }
        //Last, lookup by album
        for (let i = 0; i < songs.length; i++) {
            let thisSongAlbum = songs[i].album.toUpperCase();
            if (thisSongAlbum === upper)
                return i;
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
        audioCtx = new(window.AudioContext || window.webkitAudioContext)();
        //Grab the audio source
        nodes.sourceNode = audioCtx.createBufferSource();
        //Create a gain node (volume)
        nodes.gainNode = audioCtx.createGain();
        //Create an analyser node (visualization)
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

    function playFromBuffer(buffer) {
        stopAudio();
        if (nodes.sourceNode.buffer) {
            nodes.sourceNode = audioCtx.createBufferSource();
            nodes.sourceNode.connect(nodes.sourceNodeOutput);
        }
        audioCtx.decodeAudioData(buffer, function(audioBuffer) {
            nodes.sourceNode.buffer = audioBuffer;
            startAudio();
        });
    }

    /**
     * Loads a song into the audio source buffer.
     * Must call createAudioContext before this function.
     * This function is private
     */
    function loadAudio(url, successCallback, failureCallback) {
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
                successCallback();
                //Call the failure callback
            }, failureCallback);
        }
        //After creating the request, send it
        request.send();
    }

    return {
        audioCtx: audioCtx,
        songs: songs,
        currentSong: function() {
            return currentSong;
        },
        nodes: nodes,
        data: function() {
            return data;
        },
        getFloatDataMax: function() {
            return floatDataMaxValue;
        },
        init: init,
        update: update,
        play: playAudio,
        pause: pauseAudio,
        seekToTime: seekToTime,
        seekToPercent: seekToPercent,
        getAudioLength: getAudioLength,
        getAudioTimestamp: function() {
            return audioTimestamp;
        },
        playNewAudio: playNewAudio,
        updateAudioAnalyser: updateAudioAnalyser,
        playFromBuffer: playFromBuffer
    }
}());
