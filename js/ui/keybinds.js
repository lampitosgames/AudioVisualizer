"use strict";

//Sets up all keyboard commands for the app
app.keybinds = (function() {
    let a = app;
    let s, sm, sa, ss;
    function init() {
        //Get shorthand state variables
        s = a.state;
        sm = s.main;
        sa = s.audio;
        ss = s.scrubber;

        a.keys.keyUp("g", toggleBezierCurveDisplay);
        a.keys.keyUp("w", toggleWaveform);
        a.keys.keyUp("space", pausePlay);
        a.keys.keyUp("left", previousSong);
        a.keys.keyDown("left", fastBackward);
        a.keys.keyUp("right", nextSong);
        a.keys.keyDown("right", fastForward);
        a.keys.keyDown("up", increaseVolume);
        a.keys.keyDown("down", decreaseVolume);
    }

    function toggleBezierCurveDisplay() {
        if (sm.graphType === s.e.DRAW_LINE) {
            sm.graphType = s.e.DRAW_BEZIER;
        } else if (sm.graphType === s.e.DRAW_BEZIER) {
            sm.graphType = s.e.DRAW_LINE;
        }
    }

    function toggleWaveform() {
        sa.usingWaveform = !sa.usingWaveform;
    }

    function pausePlay() {
        if (sa.paused) {
            a.audio.play();
        } else {
            a.audio.pause();
        }
    }

    function previousSong() {
        if (a.keys.pressed("shift")) return;
        //Get the new index.  Wrap if necissary
        let newIndex = sa.currentSong - 1 < 0 ? sa.songs.length-1 : sa.currentSong - 1;
        //Play the new song
        a.audio.playNewAudio(newIndex);
    }

    function nextSong() {
        if (a.keys.pressed("shift")) return;
        //Get the new index.  Wrap if necissary
        let newIndex = (sa.currentSong + 1) % sa.songs.length;
        //Play the new song
        a.audio.playNewAudio(newIndex);
    }

    function fastBackward() {
        //Fast backward 10 seconds
        if (!a.keys.pressed("shift")) return;
        let newTime = Math.max(0.0, sa.audioTimestamp - 10.0);
        a.audio.seekToTime(newTime);
    }

    function fastForward() {
        if (!a.keys.pressed("shift")) return;
        let newTime = Math.min(a.audio.getAudioLength(), sa.audioTimestamp + 10.0);
        a.audio.seekToTime(newTime);
    }

    function increaseVolume() {
        if (sa.nodes.gainNode.gain.value + sa.volumeIncrement <= 1.0) {
            sa.nodes.gainNode.gain.value += sa.volumeIncrement;
        } else {
            sa.nodes.gainNode.gain.value = 1.0;
        }
    }

    function decreaseVolume() {
        if (sa.nodes.gainNode.gain.value - sa.volumeIncrement >= 0.1) {
            sa.nodes.gainNode.gain.value -= sa.volumeIncrement;
        } else {
            sa.nodes.gainNode.gain.value = 0.001;
        }
    }

    return {
        init: init
    }
}());
