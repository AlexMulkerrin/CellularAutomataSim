﻿/* Utility scripts that are used across whole program
*/

function random(integer) {
    return Math.floor(Math.random() * integer);
}

function randomBool() {
    if (Math.random() < 0.5) {
        return true;
    } else {
        return false;
    }
}

function toRGBString(red, green, blue) {
    var colourString = '#';
    if (red < 16) colourString += '0';
    colourString += red.toString(16);
    if (green < 16) colourString += '0';
    colourString += green.toString(16);
    if (blue < 16) colourString += '0';
    colourString += blue.toString(16);
    return colourString;
}