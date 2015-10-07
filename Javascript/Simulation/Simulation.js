function Simulation(w, h) {
    this.width = w;
    this.height = h;
    this.cell = [];

    this.createCALattice();
    this.setCells();
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
    this.state = 0;
    this.isCharged = false;
    this.nextCharge = false;
    this.isInverter = false;
}

Simulation.prototype.setCells = function () {
    //Todo add image loading
    for (var i = 0; i < this.width; i++) {
        for (var j = 0; j < this.height; j++) {
            this.cell[i][j].state = random(5);
        }
    }
}
