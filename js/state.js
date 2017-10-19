"use strict";
//The state module contains state for all other modules, providing easy data access and modification from anywhere in the app
app.state = (function() {
    let a = app;

    //Enum values for all the state.  Keys must be unique
    let e = {
        //Graph types
        DRAW_LINE: 0,
        DRAW_BEZIER: 1,
        //Scrubber drawing values
        DEFAULT_LINE_WIDTH: 7,
        HOVER_LINE_WIDTH: 10,
        DEFAULT_SMALL_RADIUS: 7,
        HOVER_SMALL_RADIUS: 10,
        //Audio stuff
        DEFAULT_VOLUME: 1.0,
        DEFAULT_SONG: 0,
        DEFAULT_NUM_SAMPLES: 1024
    };

    //Main module state
    let main = {
        //Type of audio vis to draw
        graphType: e.DRAW_LINE,
        //Array of bezier curves for audio visualization
        bezierCurves: [],
        animationID: 0
    };

    let controls = {
        visible: false,
        //Controls wrapper elements
        $controlsHover: undefined,
        $controlsWrapper: undefined,
        //Checkboxes
        $bezierCheckbox: undefined,
        $waveformCheckbox: undefined,
        $parallaxCheckbox: undefined,
        $invertCheckbox: undefined,
        $noiseCheckbox: undefined,
        $redshiftCheckbox: undefined,
        $blueshiftCheckbox: undefined,
        $greenshiftCheckbox: undefined,
        //Sliders
        $playbackSpeedSlider: undefined,
        $sampleCountSlider: undefined,
        $logScaleSlider: undefined,
        $delaySlider: undefined,
        //Dropdowns
        $selectSongDropdown: undefined,
        $selectThemeDropdown: undefined
    };

    //Audio module state
    let audio = {
        //Audio context
        audioCtx: undefined,
        //The currently playing song
        currentSong: e.DEFAULT_SONG,
        //Song metadata
        songs: [
            {
                id: 0,
                hasBuffer: false,
                buffer: undefined,
                name: "No Vacancy",
                artist: "OneRepublic",
                album: "No Vacancy",
                filepath: "./media/noVacancy.mp3"
            }, {
                id: 1,
                hasBuffer: false,
                buffer: undefined,
                name: "Firewall",
                artist: "Les Friction",
                album: "Dark Matter",
                filepath: "./media/firewall.mp3"
            }, {
                id: 2,
                hasBuffer: false,
                buffer: undefined,
                name: "Dark Matter",
                artist: "Les Friction",
                album: "Dark Matter",
                filepath: "./media/darkMatter.mp3"
            }, {
                id: 3,
                hasBuffer: false,
                buffer: undefined,
                name: "Devastation and Reform",
                artist: "Relient K",
                album: "Five Score and Seven Years Ago",
                filepath: "./media/devastationAndReform.mp3"
            }
        ],
        //Audio nodes
        nodes: {
            sourceNodeOutput: undefined,
            sourceNode: undefined,
            gainNode: undefined,
            convolverNode: undefined,
            delayNode: undefined,
            analyserNode: undefined
        },
        //Visualizer data
        data: [],
        //Is the data waveform?
        usingWaveform: false,
        //How much to scale the frequency data by to bring out differences
        exponentScale: 8,
        //Is the audio paused
        paused: false,
        //Timestamp in the current song
        audioTimestamp: 0.0,
        //Speed of playback
        playbackSpeed: 1.0,
        //How much to increase/decrease volume when using up/down keys
        volumeIncrement: 0.1
    };

    //Scrubber module state
    let scrubber = {
        //Position of the pull tab
        scrubX: 0,
        scrubY: 0,
        scrubAngle: 0,
        //Radius and center of the scrubber
        radius: 300,
        center: [],
        //Radius of the pull tab
        smallRadius: e.DEFAULT_SMALL_RADIUS,
        //Width of the scrubber line (animate on mouseover)
        lineWidth: e.DEFAULT_LINE_WIDTH,
        //Scrubber HTML elements
        $scrubberWrapper: undefined,
        $songName: undefined,
        $artistName: undefined,
        //Scrubber controls
        $prevSong: undefined,
        $playPauseButton: undefined,
        $nextSong: undefined,
        $volumeDownIcon: undefined,
        $volumeUpIcon: undefined
    };

    //Parallax module state
    let parallax = {
        enabled: false,
        mainParallax: [
            0, 0
        ],
        mainScale: -0.03,
        scrubberParallax: [
            0, 0
        ],
        scrubberScale: 0.03,
        scrubberShadow: [0.5, 0.5]
    };

    //Time module state
    let time = {
        //Delta time
        dt: 0,
        //Total time the app has been running
        runTime: 0,
        //Timestamp of the last update loop
        lastTime: 0,
        //Current frames per second
        fps: 0
    };

    //Image Manipulation state
    let image = {
        inverted: false,
        addNoise: false,
        redshift: false,
        blueshift: false,
        greenshift: false
    };

    //App-wide colors (colors are a custom class with color change events)
    let color = {
        primaryColor: new app.Color(255, 0, 0, 1.0),
        secondaryColor: new app.Color(200, 200, 200, 1.0),
        //UI Colors
        ui: {
            backgroundColor: new app.Color(247, 247, 247, 1.0),
            textHeaderColor: new app.Color(0, 0, 0, 1.0),
            textBodyColor: new app.Color(118, 118, 118, 1.0),
            textInvertedColor: new app.Color(255, 255, 255, 1.0),
            buttonMouseOver: new app.Color(200, 0, 0, 1.0),
            dropdownActiveColor: new app.Color(230, 230, 230, 1.0),
            checkboxBorder: new app.Color(200, 200, 200, 1.0),
            checkboxBackground: new app.Color(255, 255, 255, 1.0)
        },

        //Scrubber colors
        scrubber: {
            scrubberColor: new app.Color(255, 0, 0, 1.0),
            shadowColor: new app.Color(0, 0, 0, 0.01),
            scrubBackgroundColor: new app.Color(0, 0, 0, 0.2),
            gradientColor1: new app.Color(235, 235, 235, 1.0),
            gradientColor2: new app.Color(255, 255, 255, 1.0),
            songNameColor: new app.Color(255, 0, 0, 1.0),
            artistNameColor: new app.Color(255, 0, 0, 1.0),
            skipSongColor: new app.Color(255, 0, 0, 1.0),
            pausePlayColor: new app.Color(255, 0, 0, 1.0),
            volumeColor: new app.Color(255, 0, 0, 1.0)
        }
    };

    //Expose all state variables to the app
    return {
        e: e,
        main: main,
        controls: controls,
        audio: audio,
        scrubber: scrubber,
        parallax: parallax,
        time: time,
        image: image,
        color: color
    };
}());
