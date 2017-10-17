"use strict";

app.Dropdown = (function() {
    function Slider(dropdownID, activeItem) {
        //Slider elements and properties
        this.$dropdown = document.getElementById(dropdownID);
        this.$popout = this.$dropdown.getElementsByClassName("dropdownPopout")[0];
        this.$elements = this.$popout.getElementsByClassName("dropdownItem")[0];
    }

    return Dropdown;
}());
