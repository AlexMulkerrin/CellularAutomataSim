const stateType = { empty: 0, right: 1, down: 2, left: 3, up: 4, splitter: 5 };
const nextDirec = [[0, 0], [1, 0], [0, 1], [-1, 0], [0, -1]];

function Simulation(w, h) {
    this.width = w;
    this.height = h;
    this.cell = [];

    this.createCALattice();
    //this.randomiseCALattice();
}

Simulation.prototype.createCALattice = function () {
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
}

Simulation.prototype.randomiseCALattice = function () {
    //Todo add image loading
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
                        if (e > 16) {
                            this.cell[i][j].state = 5;
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
            }
            this.cell[i][j].nextCharge = false;
        }
    }
}

Simulation.prototype.setNextCharge = function (x, y, sourceState) {
    var nx, ny, opposite;
    if (sourceState === stateType.splitter) {
        for (var i = 1; i < 5; i++) {
            nx = x + nextDirec[i][0];
            ny = y + nextDirec[i][1];
            if (nx >= 0 && nx < this.width && ny >= 0 && ny < this.height) {
                if (this.cell[nx][ny].state !== stateType.empty) {
                    opposite = ((i + 1) % 4) + 1; //disallow input into outputs
                    if (this.cell[nx][ny].state !== opposite) {
                        this.cell[nx][ny].nextCharge = true;
                    }
                }
            }
        }
    } else {
        nx = x + nextDirec[sourceState][0];
        ny = y + nextDirec[sourceState][1];
        if (nx >= 0 && nx < this.width && ny >= 0 && ny < this.height) {
            if (this.cell[nx][ny].state !== stateType.empty) {
                opposite = ((sourceState + 1) % 4) + 1; //disallow input into outputs
                if (this.cell[nx][ny].state !== opposite) {
                    this.cell[nx][ny].nextCharge = true;
                }
            }
        }
    }
}


