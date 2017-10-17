"use strict";

app.Dropdown = (function() {
    function Dropdown(dropdownID, itemList, getActiveItem) {
        //Slider elements and properties
        this.$dropdown = document.getElementById(dropdownID);
        this.$popout = this.$dropdown.getElementsByClassName("dropdownPopout")[0];
        this.$items = undefined;

        //Store the item list and the function to get the currently active item
        this.itemList = itemList;
        this.getActive = getActiveItem;

        //Events
        this.onchange = function() {};

        this.render = function() {
            let newListItems = "";
            for (let i=0; i<this.itemList.length; i++) {
                if (i == this.getActive()) {
                    newListItems += '<li class="dropdownItem dropdownActive">' + this.itemList[i].name + '</li>'
                } else {
                    newListItems += '<li class="dropdownItem">' + this.itemList[i].name + '</li>'
                }
            }
            this.$popout.innerHTML = newListItems;

            //Bind mouse events to the new items
            this.$items = this.$popout.getElementsByClassName("dropdownItem");
            for (let e=0; e<this.$items.length; e++) {
                this.$items[e].addEventListener("mousedown", function() {
                    this.onchange(this.$items[e].innerHTML);
                }.bind(this));
                this.$items[e].addEventListener("mouseenter", function(e) {
                    e.target.style.backgroundColor = app.state.color.ui.dropdownActiveColor.get();
                });
                this.$items[e].addEventListener("mouseleave", function(e) {
                    e.target.style.backgroundColor = app.state.color.ui.backgroundColor.get();
                });
            }
            this.updateColor();
        }

        this.updateColor = function() {
            this.$dropdown.style.backgroundColor = app.state.color.primaryColor.get();
            this.$dropdown.style.color = app.state.color.ui.textInvertedColor.get();
            this.$popout.style.backgroundColor = app.state.color.ui.backgroundColor.get();
            for (let e=0; e<this.$items.length; e++) {
                this.$items[e].style.color = app.state.color.ui.textBodyColor.get();
            }
            this.$popout.getElementsByClassName("dropdownActive")[0].style.backgroundColor = app.state.color.ui.dropdownActiveColor.get();
        }

        this.render();
        this.updateColor();
        //Add a change listener to used colors
        app.state.color.primaryColor.addListener(this.updateColor.bind(this));
        app.state.color.ui.textInvertedColor.addListener(this.updateColor.bind(this));
        app.state.color.ui.textBodyColor.addListener(this.updateColor.bind(this));
        app.state.color.ui.backgroundColor.addListener(this.updateColor.bind(this));
        app.state.color.ui.dropdownActiveColor.addListener(this.updateColor.bind(this))
    }

    return Dropdown;
}());
