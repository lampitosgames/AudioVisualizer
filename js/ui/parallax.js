"use strict";

//Very simple module that handles mouse position based parallax
//Could easily be expanded to include more layers
app.parallax = (function() {
    let a = app;
    function update() {
        let sp = a.state.parallax;

        if (!sp.enabled)
            return;

        let mouse = a.keys.mouse();
        if (!mouse)
            return;
        let center = [
            a.viewport.width / 2,
            a.viewport.height / 2
        ];
        let vec = [
            mouse[0] - center[0],
            mouse[1] - center[1]
        ];

        sp.mainParallax = [
            vec[0] * sp.mainScale,
            vec[1] * sp.mainScale
        ];
        sp.scrubberParallax = [
            vec[0] * sp.scrubberScale,
            vec[1] * sp.scrubberScale
        ];
        sp.scrubberShadow = [
            a.utils.norm(mouse[0], a.viewport.width * 2, 0) * 0.5,
            a.utils.norm(mouse[1], -a.viewport.height, a.viewport.height) * 0.5
        ];
    }
    return {update: update}
}());
