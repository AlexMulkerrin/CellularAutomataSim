/* Utility scripts that are used across whole program
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

function selectCellColour(cell) {
    if (cell.state === stateType.crossing) {
        switch (cell.crossCharge) { 
            case crossDirec.none:
                return cellColour[19];
                break;
            case crossDirec.horizontal:
                return cellColour[20];
                break;
            case crossDirec.vertical:
                return cellColour[21];
                break;
            case crossDirec.both:
                return cellColour[22];
                break;
        }
    } else if (cell.state === stateType.splitter) {
        if (cell.isCharged) {
            return cellColour[18];
        } else {
            return cellColour[17];
        }
    } else if (cell.isInverter) {
        if (cell.isCharged) {
            return cellColour[cell.state + 12];
        } else {
            return cellColour[cell.state + 8];
        }
    } else {
        if (cell.isCharged) {
            return cellColour[cell.state + 4];
        } else {
            return cellColour[cell.state];
        }
    }
}