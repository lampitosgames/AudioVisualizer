"use strict";

app.colorChanging = (function() {
    let a = app;
    let s, sco, scou;

    function init() {
        s = a.state;
        sco = s.color;
        scou = sco.ui;

        sco.primaryColor.addListener(updateCheckboxColor);
        scou.checkboxBackground.addListener(updateCheckboxColor);
        scou.checkboxBorder.addListener(updateCheckboxColor);
        updateCheckboxColor();

        //Hook up buttons to color changes
        sco.primaryColor.addListener(updateButtonColor);
        scou.textInvertedColor.addListener(updateButtonColor);
        updateButtonColor();

        //Hook up the background to color changes
        scou.backgroundColor.addListener(updateBackgroundColor);
        updateBackgroundColor();

        //Hook up the text color
        scou.textHeaderColor.addListener(updateTextColor);
        scou.textBodyColor.addListener(updateTextColor);
        updateTextColor();
    }

    function updateCheckboxColor() {
        let $checkboxes = document.getElementsByClassName("checkbox");
        for (let i=0; i<$checkboxes.length; i++) {
            $checkboxes[i].style.backgroundColor = scou.checkboxBackground.get();
            $checkboxes[i].style.border = "2px solid " + scou.checkboxBorder.get();
            if ($checkboxes[i].classList.contains("checkboxActive")) {
                $checkboxes[i].style.borderColor = sco.primaryColor.get();
                $checkboxes[i].style.borderTopStyle = $checkboxes[i].style.borderRightStyle = "none";
            }
        }
    }

    function updateButtonColor() {
        let $buttons = document.getElementsByClassName("button");
        for (let i=0; i<$buttons.length; i++) {
            $buttons[i].style.backgroundColor = sco.primaryColor.get();
            $buttons[i].style.color = scou.textInvertedColor.get();

            $buttons[i].addEventListener("mouseenter", function(e) {
                e.target.style.backgroundColor = scou.buttonMouseOver.get();
            });
            $buttons[i].addEventListener("mouseleave", function(e) {
                e.target.style.backgroundColor = sco.primaryColor.get();
            });
        }
    }

    function updateBackgroundColor() {
        document.getElementById("controlsWrapper").style.backgroundColor = scou.backgroundColor.get();
    }

    function updateTextColor() {
        document.querySelector("body").style.color = scou.textBodyColor.get();
        let subheaders = document.getElementsByClassName("subheader");
        for (let i=0; i<subheaders.length; i++) {
            subheaders[i].style.color = scou.textHeaderColor.get();
        }
    }

    return {
        init: init,
        updateCheckboxColor: updateCheckboxColor,
        updateButtonColor: updateButtonColor,
        updateBackgroundColor: updateBackgroundColor,
        updateTextColor: updateTextColor
    }
}());
