
app.controls = (function() {
    let a = app;
    let sc, sco, scou;

    function init() {
        sc = a.state.controls;
        sco = a.state.color;
        scou = sco.ui;

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

        //Volume slider
        sc.$volumeSlider = new app.Slider("volumeSlider", 1.0, 0.001, 2.0, 0.001);
        sc.$volumeSlider.onupdate = function(val) {
            a.state.audio.nodes.gainNode.gain.value = val;
        }

        //Logarithmic scale slider
        sc.$logScaleSlider = new app.Slider("logScaleSlider", 8, 1, 10, 1);
        sc.$logScaleSlider.onchange = function(val) {
            a.state.audio.exponentScale = val;
        }

        //Playback speed slider
        sc.$playbackSpeedSlider = new app.Slider("playbackSpeedSlider", 1.0, 0.1, 3.0, 0.1);
        sc.$playbackSpeedSlider.onchange = a.audio.setPlaybackSpeed;

        sc.$delaySlider = new app.Slider("delaySlider", 0.0, 0.0, 1.0, 0.01);
        sc.$delaySlider.onchange = function(val) {
            a.state.audio.nodes.delayNode.delayTime.value = val;
        }

        //Select song dropdown
        sc.$selectSongDropdown = new app.Dropdown("selectSongDropdown", a.state.audio.songs, function() { return a.state.audio.currentSong; });
        sc.$selectSongDropdown.onchange = a.audio.playNewAudio;

        //Select theme dropdown
        sc.$selectThemeDropdown = new app.Dropdown("themeDropdown", a.colorChanging.themes, a.colorChanging.currentTheme);
        sc.$selectThemeDropdown.onchange = a.colorChanging.setTheme;
    }

    function bindCheckbox(stateVariable, checkboxId, func) {
        sc[stateVariable] = document.getElementById(checkboxId);
        sc[stateVariable].parentElement.addEventListener("click", function() {
            if (sc[stateVariable].classList.contains("checkboxActive")) {
                sc[stateVariable].classList.remove("checkboxActive");
                func(false);
            } else {
                sc[stateVariable].classList.add("checkboxActive");
                func(true);
            }
            a.colorChanging.updateCheckboxColor();
        });
    }

    return {
        init: init
    }
}());
