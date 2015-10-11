const cellColour = [
    "#ffffff", 	                                // empty
	"#0000cc", "#1111dd", "#2222ee", "#3333ff",	// wire
	"#00cc00", "#11dd11", "#22ee22", "#33ff33",	// wire with signal
	"#cc0000", "#dd1111", "#ee2222", "#ff3333",	// inverter
	"#cccc00", "#dddd11", "#eeee22", "#ffff33",	// inverter with signal
	"#aa00aa", "#ff00ff"                        // splitter
];

function Display(canvasName, simulation, control) {
    this.targetSim = simulation;
    this.targetControl = control;
    this.sqSize = 16;

    this.canvas = document.getElementById(canvasName);
    this.canvas.width = simulation.width* this.sqSize;
    this.canvas.height = simulation.height * this.sqSize;
    this.ctx = this.canvas.getContext("2d");
}

Display.prototype.resizeCanvas = function () {
    this.canvas.width = this.targetSim.width * this.sqSize;
    this.canvas.height = this.targetSim.height * this.sqSize;
    this.update();
}

Display.prototype.update = function () {
    this.ctx.fillStyle = "#ffffff";
    this.ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
    this.drawCAGrid();
    this.drawCAContents();
    //this.drawControl();
    this.drawInfo();
}

Display.prototype.drawCAGrid = function () {
    for (var i = 0; i < this.targetSim.width; i++) {
        for (var j = 0; j < this.targetSim.height; j++) {
            this.ctx.fillStyle = this.chooseCAGridColour(i,j)
            this.drawRect(i * this.sqSize, j * this.sqSize, this.sqSize - 1, this.sqSize - 1);
        }
    }
}

Display.prototype.chooseCAGridColour = function (x, y) {
    var result = "#eeeeee";
    var left = Math.min(this.targetControl.hoverX, this.targetControl.oldX);
    var top = Math.min(this.targetControl.hoverY, this.targetControl.oldY);
    var right = Math.max(this.targetControl.hoverX, this.targetControl.oldX);
    var bottom = Math.max(this.targetControl.hoverY, this.targetControl.oldY);

    if (this.targetControl.mouse.isPressed) {
        if (this.targetControl.mouse.buttonPressed === 1) {
            if (x >= left && x <= right && y === this.targetControl.oldY) {
                result = "#eef5ff";
            }
            if (x === this.targetControl.hoverX && y >= top && y <= bottom) {
                result = "#eef5ff";
            }

            
        } else if (this.targetControl.mouse.buttonPressed === 3) {
            if (x >= left && x <= right && y >= top && y <= bottom) {
                result = "#ffddee";
            }
        }

    }
    return result;
}

Display.prototype.drawCAContents = function () {
    for (var i = 0; i < this.targetSim.width; i++) {
        for (var j = 0; j < this.targetSim.height; j++) {     
            if (this.targetSim.cell[i][j].state !== 0) {
                this.drawCell(i, j);
            }
        }
    }
}

Display.prototype.drawCell = function (i, j) {
    var cell = this.targetSim.cell;
    this.ctx.fillStyle = selectCellColour(cell[i][j]);
    var x = i * this.sqSize;
    var y = j * this.sqSize;

    // ugly hardcoded shapes
    switch(cell[i][j].state) {
        case 1:
            this.drawRect(x + 8, y + 7, 7, 2);
            this.drawRect(x + 13, y + 6, 1, 4);
            this.drawRect(x + 12, y + 5, 1, 6);
            break;
        case 2:
            this.drawRect(x + 7, y + 8, 2, 7);
            this.drawRect(x + 6, y + 13, 4, 1);
            this.drawRect(x + 5, y + 12, 6, 1);
            break;
        case 3:
            this.drawRect(x, y + 7, 8, 2);
            this.drawRect(x + 1, y + 6, 1, 4);
            this.drawRect(x + 2, y + 5, 1, 6);
            break;
        case 4:
            this.drawRect(x + 7, y, 2, 8);
            this.drawRect(x + 6, y + 1, 4, 1);
            this.drawRect(x + 5, y + 2, 6, 1);
            break;
        case 5:
            this.drawRect(x + 7, y, 2, this.sqSize-1);
            this.drawRect(x, y + 7, this.sqSize-1, 2);

            this.drawRect(x + 13, y + 6, 1, 4);
            this.drawRect(x + 12, y + 5, 1, 6);

            this.drawRect(x + 6, y + 13, 4, 1);
            this.drawRect(x + 5, y + 12, 6, 1);

            this.drawRect(x + 1, y + 6, 1, 4);
            this.drawRect(x + 2, y + 5, 1, 6);

            this.drawRect(x + 6, y + 1, 4, 1);
            this.drawRect(x + 5, y + 2, 6, 1);
            break;
    }
    // draw connections
    if (i > 0) {
        if (cell[i - 1][j].state === 1 || cell[i - 1][j].state === 5)
            this.drawRect(x, y + 7, 8, 2);
    }
    if (i < this.targetSim.width - 1) {
        if (cell[i + 1][j].state === 3 || cell[i + 1][j].state === 5)
            this.drawRect(x + 8, y + 7, 7, 2);
    }
    if (j > 0) {
        if (cell[i][j - 1].state === 2 || cell[i][j - 1].state === 5)
            this.drawRect(x + 7, y, 2, 8);
    }
    if (j < this.targetSim.height - 1) {
        if (cell[i][j + 1].state === 4 || cell[i][j + 1].state === 5)
            this.drawRect(x + 7, y + 8, 2, 7);
    }
}

Display.prototype.drawRect = function(x,y,w,h) {
    this.ctx.fillRect(x,y,w,h);
}

Display.prototype.drawControl = function () {
    if (this.targetControl.mouse.isOverCanvas) {
        if (this.targetControl.mouse.isPressed) {
            this.ctx.fillStyle = "#00ffff";
            var x = this.targetControl.oldX;
            var y = this.targetControl.oldY;
            var w = this.targetControl.hoverX - x;
            var h = this.targetControl.hoverY - y;
            this.drawRect(x * this.sqSize, y * this.sqSize, (w * this.sqSize) - 1, this.sqSize - 1);
            this.drawRect(x * this.sqSize + (w * this.sqSize), y * this.sqSize, this.sqSize - 1, (h * this.sqSize) - 1);
        }
    }
}

Display.prototype.drawInfo = function () {
    this.ctx.fillStyle = "#000000";
    var text = "Current tool: " + toolName[this.targetControl.currentTool]
                + ", " + orientName[this.targetControl.currentOrient];
    this.ctx.fillText(text, 5, 12);
}
