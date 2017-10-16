
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
    }

    function bindCheckbox(stateVariable, checkboxId, func) {
        sc[stateVariable] = document.getElementById(checkboxId);
        sc[stateVariable].addEventListener("change", func);
    }


    return {
        init: init
    }
}());
