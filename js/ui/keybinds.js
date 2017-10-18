"use strict";

//Sets up all keyboard commands for the app
app.keybinds = (function() {
    let a = app;
    let s, sm, sc, sa, ss, sp;
    function init() {
        //Get shorthand state variables
        s = a.state;
        sm = s.main;
        sc = s.controls;
        sa = s.audio;
        ss = s.scrubber;
        sp = s.parallax;

        a.keys.keyUp("c", function() { toggleControlsPanel(!sc.visible); });
        a.keys.keyUp("esc", function() { toggleControlsPanel(false); });
        a.keys.keyUp("g", toggleBezierCurveDisplay);
        a.keys.keyUp("w", toggleWaveform);
        a.keys.keyUp("p", toggleParallax);
        a.keys.keyUp("space", pausePlay);
        a.keys.keyUp("left", previousSong);
        a.keys.keyDown("left", fastBackward);
        a.keys.keyUp("right", nextSong);
        a.keys.keyDown("right", fastForward);
        a.keys.keyDown("up", increaseVolume);
        a.keys.keyDown("down", decreaseVolume);
    }

    function toggleControlsPanel(visible) {
        if (!visible) {
            sc.visible = false;
            sc.$controlsHover.style.height = "0vh";
            sc.$controlsWrapper.style.top = "-100vh";
        } else {
            sc.visible = true;
            sc.$controlsHover.style.height = "100vh";
            sc.$controlsWrapper.style.top = "0";
        }
    }

    function toggleBezierCurveDisplay() {
        if (sm.graphType === s.e.DRAW_LINE) {
            sm.graphType = s.e.DRAW_BEZIER;
            sc.$bezierCheckbox.classList.add("checkboxActive");
        } else if (sm.graphType === s.e.DRAW_BEZIER) {
            sm.graphType = s.e.DRAW_LINE;
            sc.$bezierCheckbox.classList.remove("checkboxActive");
        }
        a.colorChanging.updateCheckboxColor();
    }

    function toggleWaveform() {
        sa.usingWaveform = !sa.usingWaveform;
        if (sa.usingWaveform) {
            sc.$waveformCheckbox.classList.add("checkboxActive");
        } else {
            sc.$waveformCheckbox.classList.remove("checkboxActive");
        }
        a.colorChanging.updateCheckboxColor();
    }

    function toggleParallax() {
        sp.enabled = !sp.enabled;
        sp.mainParallax = [0, 0];
        sp.scrubberParallax = [0, 0];
        sp.scrubberShadow = [0.5, 0.5];
        if (sp.enabled) {
            sc.$parallaxCheckbox.classList.add("checkboxActive");
        } else {
            sc.$parallaxCheckbox.classList.remove("checkboxActive");
        }
        a.colorChanging.updateCheckboxColor();
    }

    function pausePlay() {
        if (sa.paused) {
            a.audio.play();
        } else {
            a.audio.pause();
        }
    }

    function previousSong() {
        if (a.keys.pressed("windows")) return;
        if (a.keys.pressed("shift")) return;
        //Get the new index.  Wrap if necissary
        let newIndex = sa.currentSong - 1 < 0 ? sa.songs.length-1 : sa.currentSong - 1;
        //Play the new song
        a.audio.playNewAudio(newIndex);
    }

    function nextSong() {
        if (a.keys.pressed("windows")) return;
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
        if (a.keys.pressed("windows")) return;
        if (sa.nodes.gainNode.gain.value + sa.volumeIncrement <= 2.0) {
            sa.nodes.gainNode.gain.value += sa.volumeIncrement;
        } else {
            sa.nodes.gainNode.gain.value = 2.0;
        }
        sc.$volumeSlider.setCSS(sa.nodes.gainNode.gain.value);
        sc.$volumeSlider.value = sa.nodes.gainNode.gain.value;
    }

    function decreaseVolume() {
        if (a.keys.pressed("windows")) return;
        if (sa.nodes.gainNode.gain.value - sa.volumeIncrement >= 0.1) {
            sa.nodes.gainNode.gain.value -= sa.volumeIncrement;
        } else {
            sa.nodes.gainNode.gain.value = 0.001;
        }
        sc.$volumeSlider.setCSS(sa.nodes.gainNode.gain.value);
        sc.$volumeSlider.value = sa.nodes.gainNode.gain.value;
    }

    return {
        init: init,
        toggleControlsPanel: toggleControlsPanel,
        toggleBezierCurveDisplay: toggleBezierCurveDisplay,
        toggleWaveform: toggleWaveform,
        toggleParallax: toggleParallax
    }
}());
