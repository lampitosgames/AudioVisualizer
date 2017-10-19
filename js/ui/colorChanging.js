"use strict";

//This module binds HTML elements to color change events
//Also handles color themes
app.colorChanging = (function() {
    let a = app;
    let s, ss, sco, scou, scos;

    let currentTheme = 0;
    let themes = [
        {
            id: 0,
            name: "Red Theme"
        },
        {
            id: 1,
            name: "Dark Theme"
        },
        {
            id: 2,
            name: "Random Theme"
        }
    ];

    function init() {
        s = a.state;
        ss = s.scrubber;
        sco = s.color;
        scou = sco.ui;
        scos = sco.scrubber;

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

        //Hook up scrubber colors
        scos.songNameColor.addListener(updateScrubberColor);
        scos.artistNameColor.addListener(updateScrubberColor);
        scos.skipSongColor.addListener(updateScrubberColor);
        scos.pausePlayColor.addListener(updateScrubberColor);
        scos.volumeColor.addListener(updateScrubberColor);
        updateScrubberColor();
    }

    function setTheme(newTheme) {
        switch (newTheme) {
            case "Red Theme":
                setRedTheme();
                break;
            case "Dark Theme":
                setDarkTheme();
                break;
            case "Random Theme":
                setRandomTheme();
                break;
            default:
                setRedTheme();
                break;
        }
        s.controls.$selectThemeDropdown.render();
    }

    function setRedTheme() {
        sco.primaryColor.set(255, 0, 0, 1.0);
        sco.secondaryColor.set(200, 200, 200, 1.0);
        //UI colors
        scou.backgroundColor.set(247, 247, 247, 1.0);
        scou.textHeaderColor.set(0, 0, 0, 1.0);
        scou.textBodyColor.set(110, 110, 110, 1.0);
        scou.textInvertedColor.set(255, 255, 255, 1.0);
        scou.buttonMouseOver.set(200, 0, 0, 1.0);
        scou.dropdownActiveColor.set(230, 230, 230, 1.0);
        scou.checkboxBorder.set(200, 200, 200, 1.0);
        scou.checkboxBackground.set(255, 255, 255, 1.0);
        //Scrubber colors
        scos.scrubberColor.set(255, 0, 0, 1.0);
        scos.shadowColor.set(0, 0, 0, 0.01);
        scos.scrubBackgroundColor.set(0, 0, 0, 0.2);
        scos.gradientColor1.set(235, 235, 235, 1.0);
        scos.gradientColor2.set(255, 255, 255, 1.0);
        scos.songNameColor.set(255, 0, 0, 1.0);
        scos.artistNameColor.set(255, 0, 0, 1.0);
        scos.skipSongColor.set(255, 0, 0, 1.0);
        scos.pausePlayColor.set(255, 0, 0, 1.0);
        scos.volumeColor.set(255, 0, 0, 1.0);
        currentTheme = 0;
    }

    function setDarkTheme() {
        sco.primaryColor.set(5, 142, 217, 1.0);
        sco.secondaryColor.set(55, 55, 55, 1.0);
        //UI colors
        scou.backgroundColor.set(8, 8, 8, 1.0);
        scou.textHeaderColor.set(255, 255, 255, 1.0);
        scou.textBodyColor.set(145, 145, 145, 1.0);
        scou.textInvertedColor.set(255, 255, 255, 1.0);
        scou.buttonMouseOver.set(5, 117, 178, 1.0);
        scou.dropdownActiveColor.set(25, 25, 25, 1.0);
        scou.checkboxBorder.set(200, 200, 200, 1.0);
        scou.checkboxBackground.set(0, 0, 0, 1.0);
        //Scrubber colors
        scos.scrubberColor.set(250, 121, 33, 1.0);
        scos.shadowColor.set(0, 0, 0, 0.01);
        scos.scrubBackgroundColor.set(200, 200, 200, 0.2);
        scos.gradientColor1.set(30, 30, 30, 1.0);
        scos.gradientColor2.set(20, 20, 20, 1.0);
        scos.songNameColor.set(5, 142, 217, 1.0);
        scos.artistNameColor.set(5, 142, 217, 1.0);
        scos.skipSongColor.set(250, 121, 33, 1.0);
        scos.pausePlayColor.set(250, 121, 33, 1.0);
        scos.volumeColor.set(250, 121, 33, 1.0);
        currentTheme = 1;
    }

    function setRandomTheme() {
        let r = function() {
            return a.utils.randomInt(0, 255);
        }
        sco.primaryColor.set(r(), r(), r(), 1.0);
        sco.secondaryColor.set(r(), r(), r(), 1.0);
        //UI colors
        scou.backgroundColor.set(r(), r(), r(), 1.0);
        scou.textHeaderColor.set(r(), r(), r(), 1.0);
        scou.textBodyColor.set(r(), r(), r(), 1.0);
        scou.textInvertedColor.set(r(), r(), r(), 1.0);
        scou.buttonMouseOver.set(r(), r(), r(), 1.0);
        scou.dropdownActiveColor.set(r(), r(), r(), 1.0);
        scou.checkboxBorder.set(r(), r(), r(), 1.0);
        scou.checkboxBackground.set(r(), r(), r(), 1.0);
        //Scrubber colors
        scos.scrubberColor.set(r(), r(), r(), 1.0);
        scos.shadowColor.set(r(), r(), r(), 0.01);
        scos.scrubBackgroundColor.set(r(), r(), r(), 0.2);
        scos.gradientColor1.set(r(), r(), r(), 1.0);
        scos.gradientColor2.set(r(), r(), r(), 1.0);
        scos.songNameColor.set(r(), r(), r(), 1.0);
        scos.artistNameColor.set(r(), r(), r(), 1.0);
        scos.skipSongColor.set(r(), r(), r(), 1.0);
        scos.pausePlayColor.set(r(), r(), r(), 1.0);
        scos.volumeColor.set(r(), r(), r(), 1.0);
        currentTheme = 2;
    }

    function updateScrubberColor() {
        ss.$songName.style.color = scos.songNameColor.get();
        ss.$artistName.style.color = scos.artistNameColor.get();
        ss.$prevSong.style.color = scos.skipSongColor.get();
        ss.$nextSong.style.color = scos.skipSongColor.get();
        ss.$playPauseButton.style.color = scos.pausePlayColor.get();
        ss.$volumeUpIcon.style.color = scos.volumeColor.get();
        ss.$volumeDownIcon.style.color = scos.volumeColor.get();
        let volSlider = document.getElementById("volumeSlider");
        volSlider.getElementsByClassName("sliderFill")[0].style.backgroundColor = scos.volumeColor.get();
        volSlider.getElementsByClassName("sliderHandle")[0].style.backgroundColor = scos.volumeColor.get();
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
        themes: themes,
        setTheme: setTheme,
        currentTheme: function() {
            return currentTheme;
        },
        setRedTheme: setRedTheme,
        setDarkTheme: setDarkTheme,
        setRandomTheme: setRandomTheme,
        updateCheckboxColor: updateCheckboxColor,
        updateButtonColor: updateButtonColor,
        updateBackgroundColor: updateBackgroundColor,
        updateTextColor: updateTextColor
    }
}());
