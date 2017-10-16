
app.controls = (function() {
    let controlsVisible = false;

    let $controlsHover,
        $controlsWrapper;
    function init() {
        $controlsHover = document.getElementById("controlsHover");
        $controlsWrapper = document.getElementById("controlsWrapper");

        document.getElementById("toggleControls").onclick = function() {
            if (controlsVisible) {
                controlsVisible = false;
                $controlsHover.style.height = "0vh";
                $controlsWrapper.style.top = "-100vh";
            } else {
                controlsVisible = true;
                $controlsHover.style.height = "100vh";
                $controlsWrapper.style.top = "0";
            }
        }
    }


    return {
        init
    }
}());
