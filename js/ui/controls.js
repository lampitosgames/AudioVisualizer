
app.controls = (function() {
    let a = app;
    let sc;

    function init() {
        sc = a.state.controls;
        sc.$controlsHover = document.getElementById("controlsHover");
        sc.$controlsWrapper = document.getElementById("controlsWrapper");

        bindCheckbox("$bezierCheckbox", "bezierEnabled", a.keybinds.toggleBezierCurveDisplay);
        bindCheckbox("$waveformCheckbox", "waveformEnabled", a.keybinds.toggleWaveform);
        bindCheckbox("$parallaxCheckbox", "parallaxEnabled", a.keybinds.toggleParallax);

        document.getElementById("toggleControls").onclick = function() { a.keybinds.toggleControlsPanel(!sc.visible); };

        //Sample count slider
        sc.$sampleCountSlider = new app.Slider("sampleCountSlider", 10, 7, 12, 1);
        sc.$sampleCountSlider.onchange = function(val) {
            a.audio.updateAudioAnalyser(Math.pow(2, val));
        }

        //Logarithmic scale slider
        sc.$logScaleSlider = new app.Slider("logScaleSlider", 8, 1, 10, 1);
        sc.$logScaleSlider.onchange = function(val) {
            a.state.audio.exponentScale = val;
        }

        //Playback speed slider
        sc.$playbackSpeedSlider = new app.Slider("playbackSpeedSlider", 1.0, 0.1, 3.0, 0.1);
        sc.$playbackSpeedSlider.onchange = a.audio.setPlaybackSpeed;

        //Select song dropdown
        sc.$selectSongDropdown = new app.Dropdown("selectSongDropdown", a.state.audio.songs, function() { return a.state.audio.currentSong; });
        sc.$selectSongDropdown.onchange = a.audio.playNewAudio;
    }

    function bindCheckbox(stateVariable, checkboxId, func) {
        sc[stateVariable] = document.getElementById(checkboxId);
        sc[stateVariable].addEventListener("change", func);
    }

    return {
        init: init
    }
}());
