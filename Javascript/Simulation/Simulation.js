const stateType = { empty: 0, right: 1, down: 2, left: 3, up: 4, splitter: 5, crossing: 6 };
const nextDirec = [[0, 0], [1, 0], [0, 1], [-1, 0], [0, -1]];
const crossDirec = {none:0, vertical:1, horizontal:2, both:3}

function Simulation(w, h) {
    this.isRunning = true;
    this.generation = 0;
    this.width = w;
    this.height = h;
    this.cell = [];

    this.createCALattice();
}

Simulation.prototype.createCALattice = function () {
    this.generation = 0;
    for (var i = 0; i < this.width; i++) {
        this.cell[i] = [];
        for (var j = 0; j < this.height; j++) {
            this.cell[i][j] = new Cell();
        }
    }
}

function Cell() {
    this.state = stateType.empty;
    this.isCharged = false;
    this.nextCharge = false;
    this.isInverter = false;
    this.crossCharge = crossDirec.none;
    this.nextCrossCharge = crossDirec.none;
}

Simulation.prototype.randomiseCALattice = function () {
    for (var i = 0; i < this.width; i++) {
        for (var j = 0; j < this.height; j++) {
            this.cell[i][j].state = random(6);
            this.cell[i][j].isCharged = randomBool();
            this.cell[i][j].isInverter = randomBool();
        }
    }
}

Simulation.prototype.getSchematicAsImage =  function() {
    var tempCanvas = document.createElement('canvas');
    tempCanvas.width = this.width;
    tempCanvas.height = this.height;
    var ctx = tempCanvas.getContext("2d");

    for (var i = 0; i < this.width; i++) {
        for (var j = 0; j < this.height; j++) {
            ctx.fillStyle = selectCellColour(this.cell[i][j]);
            ctx.fillRect(i, j, 1, 1);
        }
    }
    return tempCanvas;
    
}

Simulation.prototype.setCALatticeFromImage = function (image) {
    var index, r, g, b;
    var colourString;

    var tempCanvas = document.createElement('canvas');
    tempCanvas.width = image.width;
    tempCanvas.height = image.height;
    var ctx = tempCanvas.getContext("2d");
    ctx.drawImage(image, 0, 0);
    var imageData = ctx.getImageData(0, 0, image.width, image.height);

    this.width = image.width;
    this.height = image.height;
    this.createCALattice();

    for (var i = 0; i < this.width; i++) {
        for (var j = 0; j < this.height; j++) {
            index = (i + j * this.width) * 4;
            r = imageData.data[index];
            g = imageData.data[index+1];
            b = imageData.data[index + 2];
            colourString = toRGBString(r, g, b);
            for (var e = 0; e < cellColour.length; e++) {
                if (colourString === cellColour[e]) {
                    this.cell[i][j].state = e;
                    if (this.cell[i][j].state > 4) {
                        this.cell[i][j].state = (e - 1) % 4 + 1;
                        if (e > 18) {
                            this.cell[i][j].state = stateType.crossing;
                            switch (e) {
                                case 19:
                                    this.cell[i][j].crossCharge = crossDirec.none;
                                    break;
                                case 20:
                                    this.cell[i][j].crossCharge = crossDirec.horizontal;
                                    this.cell[i][j].isCharged = true;
                                    break;
                                case 21:
                                    this.cell[i][j].crossCharge = crossDirec.vertical;
                                    this.cell[i][j].isCharged = true;
                                    break;
                                case 22:
                                    this.cell[i][j].crossCharge = crossDirec.both;
                                    this.cell[i][j].isCharged = true;
                                    break;
                            }
                        } else if (e > 16) {
                            this.cell[i][j].state = stateType.splitter;
                            if (e === 18) {
                                this.cell[i][j].isCharged = true;
                            }
                        } else if (e > 12) {
                            this.cell[i][j].isCharged = true;
                            this.cell[i][j].isInverter = true;
                        } else if (e > 8) {
                            this.cell[i][j].isInverter = true;
                        } else {
                            this.cell[i][j].isCharged = true;
                        }
                    }
                }
            }
        }
    }

}

Simulation.prototype.setCell = function (x, y, type, orient) {
    cell = this.cell[x][y];
    switch (type) {
        case toolType.charge:
            cell.isCharged = (!cell.isCharged);
            break;
        case toolType.wire:
            if (cell.state > 0 && cell.state < 5) {
                cell.isInverter = false;
                cell.state = stateType.crossing;
            } else {
                cell.state = orient;
            }
            break;
        case toolType.inverter:
            if (cell.state > 0 && cell.state < 5) {
                cell.isInverter = (!cell.isInverter);
            }
            break;
        case toolType.splitter:
            cell.state = stateType.splitter;
            break;
        case toolType.rotate:
            cell.state = cell.state+1;
            if (cell.state > 4) cell.state = 1;
            break;
        case toolType.remove:
            //cell.state = stateType.empty;
            this.clearCell(cell);
            break;

    }
}

Simulation.prototype.clearCell = function (cell) {
    this.state = stateType.empty;
    this.isCharged = false;
    this.nextCharge = false;
    this.isInverter = false;
    this.crossCharge = crossDirec.none;
    this.nextCrossCharge = crossDirec.none;
}

Simulation.prototype.setLine = function (x, y, oldX, oldY, type, orient) {
    var left, right, top, bottom;
    var orientX, orientY;
    if (x < oldX) {
        left = x;
        right = oldX;
        orientX = stateType.left;
    } else {
        left = oldX;
        right = x;
        orientX = stateType.right;
    }
    if (y < oldY) {
        top = y;
        bottom = oldY;
        orientY = stateType.up;
    } else {
        top = oldY;
        bottom = y;
        orientY = stateType.down;
    }

    if (top !== bottom) {
        if (orientX === stateType.right) { // don't overwrite cells
            right--;
        } else {
            left++;
        }
    }
    for (var i = left; i <= right; i++) {
        this.setCell(i, oldY, type, orientX);
    }
    if (top !== bottom) {
        for (var j = top; j <= bottom; j++) {
            this.setCell(x, j, type, orientY);

        }
    }
}

Simulation.prototype.clearArea = function (x, y, oldX, oldY) {
    var left = Math.min(x, oldX);
    var top = Math.min(y, oldY);
    var right = Math.max(x, oldX);
    var bottom = Math.max(y, oldY);

    for (var i = left; i <= right; i++) {
        for (var j = top; j <= bottom; j++) {
            this.cell[i][j].state = 0;
            this.cell[i][j].isCharged = 0;
            this.cell[i][j].isInverter = 0;
        }
    }
}

Simulation.prototype.update = function () {
    for (var i = 0; i < this.width; i++) {
        for (var j = 0; j < this.height; j++) {
            if (this.cell[i][j].isCharged) {
                this.setNextCharge(i, j, this.cell[i][j].state);
            }
        }
    }
    for (var i = 0; i < this.width; i++) {
        for (var j = 0; j < this.height; j++) {
            if (this.cell[i][j].isInverter) {
                this.cell[i][j].isCharged = !(this.cell[i][j].nextCharge);
            } else {
                this.cell[i][j].isCharged = this.cell[i][j].nextCharge;
                this.cell[i][j].crossCharge = this.cell[i][j].nextCrossCharge;

            }
            this.cell[i][j].nextCharge = false;
            this.cell[i][j].nextCrossCharge = crossDirec.none;
            
        }
    }
    this.generation++;
}

Simulation.prototype.setNextCharge = function (x, y, sourceState) {
    var nx, ny, opposite;
    if (sourceState === stateType.splitter) {
        for (var i = 1; i < 5; i++) {
            nx = x + nextDirec[i][0];
            ny = y + nextDirec[i][1];
            this.checkNextCharge(nx, ny, i);
        }

    } else if (sourceState === stateType.crossing) {
        switch (this.cell[x][y].crossCharge){
            case crossDirec.both:
                for (var i = 1; i < 5; i++) {
                    nx = x + nextDirec[i][0];
                    ny = y + nextDirec[i][1];
                    this.checkNextCharge(nx, ny, i);
                }
                break;

            case crossDirec.horizontal:
                nx = x + nextDirec[1][0];
                ny = y + nextDirec[1][1];
                this.checkNextCharge(nx, ny, 1);
                nx = x + nextDirec[3][0];
                ny = y + nextDirec[3][1];
                this.checkNextCharge(nx, ny, 3);
                break;

            case crossDirec.vertical:
                nx = x + nextDirec[2][0];
                ny = y + nextDirec[2][1];
                this.checkNextCharge(nx, ny, 2);
                nx = x + nextDirec[4][0];
                ny = y + nextDirec[4][1];
                this.checkNextCharge(nx, ny, 4);
                break;
        }

    } else {
        nx = x + nextDirec[sourceState][0];
        ny = y + nextDirec[sourceState][1];
        this.checkNextCharge(nx, ny, sourceState);
    }
}

Simulation.prototype.checkNextCharge= function(x,y,sourceState) {
    if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
        if (this.cell[x][y].state !== stateType.empty) {
            var opposite = ((sourceState + 1) % 4) + 1; //disallow input into outputs
            if (this.cell[x][y].state !== opposite) {
                this.cell[x][y].nextCharge = true;
                if (this.cell[x][y].state === stateType.crossing) {
                    if (this.cell[x][y].nextCrossCharge === crossDirec.none) {
                        var direc = (sourceState % 2) + 1; // this some pretty kludgy modulo arthimetic
                        this.cell[x][y].nextCrossCharge += direc;
                    } else if (this.cell[x][y].nextCrossCharge === crossDirec.horizontal) {
                        if (sourceState === stateType.down || sourceState === stateType.up) {
                            this.cell[x][y].nextCrossCharge = crossDirec.both;
                        }
                    } else if (this.cell[x][y].nextCrossCharge === crossDirec.vertical) {
                        if (sourceState === stateType.left || sourceState === stateType.right) {
                            this.cell[x][y].nextCrossCharge = crossDirec.both;
                        }
                    }
                }
            }
        }
    }
}

Simulation.prototype.togglePause = function () {
    this.isRunning = !this.isRunning
};

