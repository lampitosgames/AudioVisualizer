"use strict";

app.Dropdown = (function() {
    function Dropdown(dropdownID, itemList, getActiveItem) {
        //Slider elements and properties
        this.$dropdown = document.getElementById(dropdownID);
        this.$popout = this.$dropdown.getElementsByClassName("dropdownPopout")[0];

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
            let $items = this.$popout.getElementsByClassName("dropdownItem");
            for (let e=0; e<$items.length; e++) {
                $items[e].addEventListener("mousedown", function() {
                    this.onchange($items[e].innerHTML);
                }.bind(this));
            }
        }

        this.updateColor = function() {
            this.$dropdown.style.backgroundColor = app.state.color.primaryColor();
        }

        this.render();
        this.updateColor();
    }

    return Dropdown;
}());
