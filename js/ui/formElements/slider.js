"use strict";

//The Slider class
//Each slider on the UI has an instance of this class to handle its input
app.Slider = (function() {
    function Slider(sliderID, defaultVal, minVal, maxVal, increment) {
        //Slider elements and properties
        this.$slider = document.getElementById(sliderID);
        this.$sliderFill = this.$slider.getElementsByClassName("sliderFill")[0];
        this.$sliderHandle = this.$slider.getElementsByClassName("sliderHandle")[0];
        this.$sliderValue = this.$slider.parentElement.getElementsByClassName("sliderValue")[0];

        //Slider-related values
        this.dragging = false;
        this.minVal = minVal;
        this.maxVal = maxVal;
        this.increment = increment;
        this.value = defaultVal;

        //Events
        this.onchange = function() {};
        this.onupdate = function() {};

        //Set the percentage of the slider based on a value
        this.setCSS = function(val) {
            //Get the CSS percentage value
            let cssPerc = app.utils.map(val, this.minVal, this.maxVal, 0, 100);
            //Update the slider style to reflect changes
            this.$sliderFill.style.width = cssPerc + "%";
            this.$sliderHandle.style.left = cssPerc + "%";
            //Update the slider value
            if (!this.$sliderValue)
                return;
            this.$sliderValue.innerHTML = this.value.toPrecision(2);
        }

        //Updates the color of the slider to colors in the state
        this.updateColor = function() {
            this.$sliderFill.style.backgroundColor = app.state.color.primaryColor.get();
            this.$sliderHandle.style.backgroundColor = app.state.color.primaryColor.get();
            this.$slider.style.backgroundColor = app.state.color.ui.textBodyColor.get();
        }

        //Bind mouse click
        this.$slider.addEventListener("mousedown", function() {
            this.dragging = true;
        }.bind(this));

        //Add a mouseup listener to the whole window (so the mouse doesn't need to stay within the slider bounds)
        window.addEventListener("mouseup", function() {
            if (this.dragging) {
                this.dragging = false;
                //Call the change event
                this.onchange(this.value);
            }
        }.bind(this));

        //Bind mouse move
        window.addEventListener("mousemove", mouseMove.bind(this));

        //Set the initial slider position
        this.setCSS(this.value);
        //Init the slider color
        this.updateColor();
        //Add a change listener to used colors
        app.state.color.primaryColor.addListener(this.updateColor.bind(this));
        app.state.color.ui.textBodyColor.addListener(this.updateColor.bind(this));
    }

    function mouseMove() {
        //If the slider is being dragged
        if (this.dragging) {
            //Get the mouse position
            let m = app.keys.mouse();
            //Get the slider bounds
            let sliderBounds = this.$slider.getBoundingClientRect();
            //Get relative mouse position to this element as a percent
            let relX = app.utils.map(m[0] - sliderBounds.x, 0, sliderBounds.width, this.minVal, this.maxVal);
            //Clamp the value
            relX = app.utils.clamp(relX, this.minVal, this.maxVal);
            relX = Math.round(relX / this.increment) * this.increment;
            //Set the css to match the new value
            this.setCSS(relX);
            //Set the slider value
            this.value = relX;
            //Call the update event
            this.onupdate(relX);
        }
    }

    return Slider;
}());
