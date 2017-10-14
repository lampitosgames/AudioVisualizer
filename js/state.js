"use strict";

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

    let main = {
        parallax: [0, 0],
        //Type of audio vis to draw
        graphType: e.DRAW_LINE,
        //Array of bezier curves for audio visualization
        bezierCurves: [],
        animationID: 0
    };

    let audio = {
        audioCtx: undefined,
        currentSong: e.DEFAULT_SONG,
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
        nodes: {
            sourceNodeOutput: undefined,
            sourceNode: undefined,
            gainNode: undefined,
            analyserNode: undefined
        },
        data: [],
        usingWaveform: false,
        exponentScale: 8,
        paused: false,
        audioTimestamp: 0.0,
        playbackSpeed: 1.0,
        volumeIncrement: 0.1
    };

    let scrubber = {
        parallax: [0, 0],
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
        lineWidth: e.DEFAULT_LINE_WIDTH
    };

    let time = {
        dt: 0,
        runTime: 0,
        lastTime: 0,
        fps: 0
    }

    let color = {
        a_primaryColor: [
            255, 0, 0, 1.0
        ],
        a_secondaryColor: [
            200, 200, 200, 1.0
        ],
        a_backgroundColor: [
            247, 247, 247, 1.0
        ],
        primaryColor: function() {
            return this.getColor("a_primaryColor");
        },
        secondaryColor: function() {
            return this.getColor("a_secondaryColor");
        },
        backgroundColor: function() {
            return this.getColor("a_backgroundColor");
        },

        //Scrubber colors
        scrubber: {
            a_scrubberColor: [
                255, 0, 0, 1.0
            ],
            a_shadowColor: [
                0, 0, 0, 0.01
            ],
            a_scrubBackgroundColor: [
                0, 0, 0, 0.2
            ],
            a_gradientColor1: [
                235, 235, 235, 1.0
            ],
            a_gradientColor2: [
                255, 255, 255, 1.0
            ],
            scrubberColor: function() {
                return color.getColor("a_scrubberColor", this);
            },
            shadowColor: function() {
                return color.getColor("a_shadowColor", this);
            },
            scrubBackgroundColor: function() {
                return color.getColor("a_scrubBackgroundColor", this);
            },
            gradientColor1: function() {
                return color.getColor("a_gradientColor1", this);
            },
            gradientColor2: function() {
                return color.getColor("a_gradientColor2", this);
            }
        },

        //Helper function to turn arrays into colors
        getColor: function(name, obj = this) {
            return "rgba(" + obj[name][0] + ", " + obj[name][1] + ", " + obj[name][2] + ", " + obj[name][3] + ")"
        }
    };

    return {
        e: e,
        main: main,
        audio: audio,
        scrubber: scrubber,
        time: time,
        color: color
    };
}());
