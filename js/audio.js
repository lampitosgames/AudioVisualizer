"use strict";

//Audio module
app.audio = (function() {
    let a = app;
    let s, sa;

    //Promise used for async loading of new songs
    let newAudioPromise = undefined;

    /**
     * Initialize the audio module
     * Load and play the first song
     */
    function init() {
        //Get shorthand state variables
        s = app.state;
        sa = app.state.audio;
        //Initialize audio context and nodes
        createAudioContext();
        //Set the volume
        sa.nodes.gainNode.gain.value = s.e.DEFAULT_VOLUME;

        //Play the first song
        playNewAudio(s.e.DEFAULT_SONG);
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
        if (sa.paused)
            return;

        //Check if the current song is done playing.  If it is, go to the next one.
        if (getAudioLength() != -1 && sa.audioTimestamp > getAudioLength()) {
            newAudioPromise = playNewAudio((sa.currentSong + 1) % sa.songs.length);
            newAudioPromise.then(function() {
                newAudioPromise = undefined;
            });
            return;
        }

        //Update the song time
        sa.audioTimestamp += app.time.dt() * sa.nodes.sourceNode.playbackRate.value;

        //Update with either frequency or waveform data
        if (!sa.usingWaveform) {
            //Initialize data array
            let floatRawData = new Float32Array(sa.nodes.analyserNode.frequencyBinCount);
            //Populate the array with frequency data
            sa.nodes.analyserNode.getFloatFrequencyData(floatRawData);

            //Scale float data logrithmically and cut off the latter half.  This is so displaying is easier
            sa.data = new Float32Array(sa.nodes.analyserNode.frequencyBinCount / 2);
            for (let i = 0; i < sa.data.length; i++) {
                sa.data[i] = Math.pow((floatRawData[i] + 145) * 2, sa.exponentScale);
            }
        } else {
            //Initialize the waveform array
            sa.data = new Uint8Array(sa.nodes.analyserNode.frequencyBinCount);
            //Populate the array with waveform data
            sa.nodes.analyserNode.getByteTimeDomainData(sa.data);
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
        if (!sa.songs[id])
            return;

        //Stop the previous song
        stopAudio();

        //If there is already a buffer loaded for this song, don't load another
        if (sa.songs[id].hasBuffer) {
            //Play from the already-loaded buffer, returning a promise
            return playFromBuffer(id);
        }

        //Asyncronously load a new song into the audio context
        //Return a promise that resolves when the audio loads successfully
        return new Promise(function(resolve, reject) {
            loadAudio(id, function() {
                //Play the song
                startAudio();
                sa.currentSong = id;
                resolve();
            }, reject);
        });
    }

    /**
     * Play a song from a pre-existing buffer instead of from the server.
     * This prevents the server form having to re-fetch already loaded audio
     * This function assumes that songs[id].buffer is defined as an ArrayBuffer or an AudioBuffer
     */
    function playFromBuffer(id) {
        //Stop the currently playing audio
        stopAudio();
        //If the sourceNode already has a defined buffer, re-create it
        if (sa.nodes.sourceNode.buffer) {
            sa.nodes.sourceNode = sa.audioCtx.createBufferSource();
            sa.nodes.sourceNode.connect(sa.nodes.sourceNodeOutput);
        }

        //Return a promise that resolves when the audio has loaded
        return new Promise(function(resolve, reject) {
            //Local function that sets the current song, starts the buffer, and resolves the promise
            let startTheBuffer = function() {
                //Set the current song
                sa.currentSong = id;
                //Point the sourceNode to the audio buffer
                sa.nodes.sourceNode.buffer = sa.songs[id].buffer;
                //Start the audio
                startAudio();
                resolve();
            }
            //If the buffer is an ArrayBuffer, decode it into an AudioBuffer
            if (sa.songs[id].buffer instanceof ArrayBuffer) {
                sa.audioCtx.decodeAudioData(sa.songs[id].buffer, function(decodedBuffer) {
                    //Set the song buffer
                    sa.songs[id].buffer = decodedBuffer;
                    //Start the buffer
                    startTheBuffer();
                }, reject);
                //Prevent this code from running if the buffer needs to be converted to prevent errors
            } else {
                //Start the buffer
                startTheBuffer();
            }
        });
    }

    /**
     * Seek a percentage of the way through the song
     * Input must be between 0 and 100
     */
    function seekToPercent(percent) {
        //Prevent seeking if there is no song loaded
        if (!sa.nodes.sourceNode || !sa.nodes.sourceNode.buffer)
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
        if (!sa.nodes.sourceNode || !sa.nodes.sourceNode.buffer)
            return;

        //Clamp the time to the length of the buffer
        time = app.utils.clamp(time, 0.0, getAudioLength());
        //Create a new buffer source and connect it, copying the old buffer
        let newSource = sa.audioCtx.createBufferSource();
        newSource.buffer = sa.nodes.sourceNode.buffer;
        newSource.connect(sa.nodes.sourceNodeOutput);
        //Store the pause state before stopping the buffer.
        let savePausedState = sa.paused;
        //Stop the current source
        stopAudio();
        //Add the new source and start it at the inputted timestamp
        sa.nodes.sourceNode = newSource;
        sa.nodes.sourceNode.start(0, time);
        //Change the manually-tracked timestamp variables to match the updated song time
        sa.audioTimestamp = time;
        if (savePausedState) {
            pauseAudio();
        } else {
            playAudio();
        }
        sa.nodes.sourceNode.playbackRate.value = sa.playbackSpeed;
    }

    /**
     * Get the length (in seconds) of the current audio buffer
     */
    function getAudioLength() {
        if (sa.nodes.sourceNode && sa.nodes.sourceNode.buffer) {
            return sa.nodes.sourceNode.buffer.duration;
        }
        return -1;
    }

    /**
     * Resume the audio context
     */
    function playAudio() {
        sa.audioCtx.resume().then(function() {
            sa.paused = false;
            return;
        });
    }

    /**
     * Pause the audio context
     */
    function pauseAudio() {
        sa.audioCtx.suspend().then(function() {
            sa.paused = true;
            return;
        });
    }

    /**
     * Set the audio playback speed
     */
    function setPlaybackSpeed(multiplier) {
        sa.playbackSpeed = multiplier;
        sa.nodes.sourceNode.playbackRate.value = sa.playbackSpeed;
    }

    /**
     * Update the member variables of the audio analyser to change the bounds of its output
     */
    function updateAudioAnalyser(fftSize = s.e.DEFAULT_NUM_SAMPLES, smoothingTimeConstant = 0.8, minDecibels = -100, maxDecibels = 50) {
        sa.nodes.analyserNode.fftSize = fftSize;
        sa.nodes.analyserNode.smoothingTimeConstant = smoothingTimeConstant;
        sa.nodes.analyserNode.minDecibels = minDecibels;
        sa.nodes.analyserNode.maxDecibels = maxDecibels;
    }

    /**
     * Starts the audio buffer if it exists
     * This function is private
     */
    function startAudio() {
        if (sa.nodes.sourceNode.buffer) {
            sa.nodes.sourceNode.start();
            sa.audioTimestamp = 0.0;
            sa.paused = false;
            sa.nodes.sourceNode.playbackRate.value = sa.playbackSpeed;
        }
    }

    /**
     * Stops the audio buffer if it exists
     * This function is private
     */
    function stopAudio() {
        if (sa.nodes.sourceNode.buffer) {
            sa.nodes.sourceNode.stop();
            sa.paused = true;
        }
    }

    /**
     * Lookup a song based on a search term (name, artist, album)
     * This function is private
     */
    function getSongId(searchString) {
        let upper = searchString.toUpperCase();
        //First, lookup by name
        for (var i = 0; i < sa.songs.length; i++) {
            let thisSongName = sa.songs[i].name.toUpperCase();
            if (thisSongName === upper)
                return i;
            }
        //Second, lookup by artist
        for (var i = 0; i < sa.songs.length; i++) {
            let thisSongArtist = sa.songs[i].artist.toUpperCase();
            if (thisSongArtist === upper)
                return i;
            }
        //Last, lookup by album
        for (let i = 0; i < sa.songs.length; i++) {
            let thisSongAlbum = sa.songs[i].album.toUpperCase();
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
        sa.audioCtx = new(window.AudioContext || window.webkitAudioContext)();
        //Grab the audio source
        sa.nodes.sourceNode = sa.audioCtx.createBufferSource();
        //Create a gain node (volume)
        sa.nodes.gainNode = sa.audioCtx.createGain();
        //Create an analyser node (visualization)
        sa.nodes.analyserNode = sa.audioCtx.createAnalyser();

        // fft stands for Fast Fourier Transform
        sa.nodes.analyserNode.fftSize = s.e.DEFAULT_NUM_SAMPLES;

        //Store the source node's output node for when we create new source nodes later
        sa.nodes.sourceNodeOutput = sa.nodes.gainNode;

        //Hook things up in the right order
        //NOTE: This order is constant
        // source -> gain -> analyser -> output
        sa.nodes.sourceNode.connect(sa.nodes.sourceNodeOutput);
        sa.nodes.gainNode.connect(sa.nodes.analyserNode);
        sa.nodes.analyserNode.connect(sa.audioCtx.destination);
    }

    /**
     * Loads a song into the audio source buffer.
     * Must call createAudioContext before this function.
     * This function is private
     */
    function loadAudio(id, successCallback, failureCallback) {
        //Create a GET request for the audio buffer
        var request = new XMLHttpRequest();
        request.open('GET', sa.songs[id].filepath, true);
        request.responseType = 'arraybuffer';
        //When it loads, call an anonymous function
        request.onload = function() {
            //Decode the data with the pre-existing audio context
            sa.audioCtx.decodeAudioData(request.response, function(buffer) {
                //If there is already a source node, create another
                if (sa.nodes.sourceNode.buffer) {
                    sa.nodes.sourceNode = sa.audioCtx.createBufferSource();
                    sa.nodes.sourceNode.connect(sa.nodes.sourceNodeOutput);
                }
                //Pass this buffer data into the audio source node
                sa.nodes.sourceNode.buffer = buffer;
                //Set the song buffer so we don't have to re-load it from the server
                sa.songs[id].hasBuffer = true;
                sa.songs[id].buffer = buffer;
                //Call the callback that was passed into the loadAudio function
                successCallback();
                //Call the failure callback
            }, failureCallback);
        }
        //After creating the request, send it
        request.send();
    }

    return {
        init: init,
        update: update,
        play: playAudio,
        pause: pauseAudio,
        seekToTime: seekToTime,
        seekToPercent: seekToPercent,
        getAudioLength: getAudioLength,
        setPlaybackSpeed: setPlaybackSpeed,
        playNewAudio: playNewAudio,
        updateAudioAnalyser: updateAudioAnalyser,
        playFromBuffer: playFromBuffer,
        getDataMax: function() {
            return sa.usingWaveform ? 255 : Math.pow(255, sa.exponentScale);
        },
        getDataLength: function() {
            return sa.nodes.analyserNode.fftSize/4;
        }
    }
}());
