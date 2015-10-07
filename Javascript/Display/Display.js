function Display(canvasName, simulation) {
    this.targetSim = simulation;
    this.sqSize = 16;

    this.canvas = document.getElementById(canvasName);
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.ctx = this.canvas.getContext("2d");
}

Display.prototype.update = function () {
    this.ctx.fillStyle = "#ddffff";
    this.ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
    this.drawCALattice();
}

Display.prototype.drawCALattice = function () {
    for (var i = 0; i < this.targetSim.width; i++) {
        for (var j = 0; j < this.targetSim.height; j++) {
            if (this.targetSim.cell[i][j].state !== 0) {
                this.drawCell(i, j);
            }
        }
    }
}

Display.prototype.drawCell = function (i,j) {
    this.ctx.fillStyle = "#00ff00";
    this.ctx.fillRect(i * this.sqSize, j * this.sqSize, this.sqSize-1, this.sqSize-1);
}
