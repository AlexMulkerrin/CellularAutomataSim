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
    this.canvas.width = window.innerWidth;//simulation.width * this.sqSize;
    this.canvas.height = window.innerHeight;//simulation.height * this.sqSize;
    this.ctx = this.canvas.getContext("2d");

    this.icon = [];
    this.loadIcons();

    var t = this;
    window.onresize = function () { t.resizeCanvas(); };
}

Display.prototype.loadIcons = function () {
    var iconName = [   "new", "load", "save", "wire", "charge", "inverter", "splitter",
						"rotate", "remove", "undo", "redo", "run", "pause", "fullscreen",
						"windowed", "scrollUp", "scrollDown", "scrollLeft", "scrollRight",
						"resize", "position", "fitToWindow", "zoomIn", "zoomOut",
                        "wirehead", "wireInLeft", "wireInRight", "wireInBack", "wireInverter"];
    for (var i = 0; i < iconName.length; i++) {
        this.icon[i] = new Image();
        this.icon[i].src = "Resources/Icons/" + iconName[i] + ".svg";
    }
}

Display.prototype.resizeCanvas = function () {
    this.canvas.width = window.innerWidth;//this.targetSim.width * this.sqSize;
    this.canvas.height = window.innerHeight;//this.targetSim.height * this.sqSize;
    this.targetControl.repositionButtons();
    this.update();
}

Display.prototype.update = function () {
    this.clearCanvas();
    this.drawCAGrid();
    this.drawCAContents();
    this.drawInterface();
    this.drawButtons();
    this.drawInfo();
}

Display.prototype.clearCanvas = function () {
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.fillStyle = "#DCE5F2";
    this.ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
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
    var left = Math.min(this.targetControl.mouse.latticeX, this.targetControl.oldX);
    var top = Math.min(this.targetControl.mouse.latticeY, this.targetControl.oldY);
    var right = Math.max(this.targetControl.mouse.latticeX, this.targetControl.oldX);
    var bottom = Math.max(this.targetControl.mouse.latticeY, this.targetControl.oldY);

    if (this.targetControl.mouse.isPressed) {
        if (this.targetControl.mouse.buttonPressed === 1) {
            if (x >= left && x <= right && y === this.targetControl.oldY) {
                result = "#eef5ff";
            }
            if (x === this.targetControl.mouse.latticeX && y >= top && y <= bottom) {
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

    //this.drawScaledImage(24, i, j);
    //this.drawScaledImage(25, i, j);
    //this.drawScaledImage(26, i, j);
    //this.drawScaledImage(27, i, j);
    //this.drawScaledImage(28, i, j);
    

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
    this.ctx.fillRect(x + this.targetControl.view.x, y + this.targetControl.view.y, w, h);
}

Display.prototype.drawRectangle = function (x, y, w, h, colour) {
    this.ctx.fillStyle = colour;
    this.ctx.fillRect(x, y, w, h);
}

Display.prototype.drawScaledImage = function (icon, x, y) {
    var size = this.targetControl.view.pixelPerCell;
    this.ctx.drawImage(this.icon[icon],x*size + this.targetControl.view.x, y*size + this.targetControl.view.y, size, size);
}

Display.prototype.drawInterface = function () {
    var c = this.canvas;
    // top info bar
    this.drawRectangle(0, 0, c.width, 21, "#DBE8F5");
    this.drawRectangle(0, 21, c.width, 1, "#365D90");
    // tool bar
    this.drawRectangle(0, 22, c.width, 25, "#FBFDFF");
    this.drawRectangle(0, 47, c.width, 1, "#9FAEC2");
    // vertical scrollbar
    this.drawRectangle(c.width - 16, 48, 16, c.height - 90, "#fcfcfc");
    this.drawRectangle(c.width - 17, 48, 1, c.height - 90, "#9FAEC2");
    // horizontal scrollbar
    this.drawRectangle(0, c.height - 42, c.width, 16, "#fcfcfc");
    this.drawRectangle(0, c.height - 43, c.width - 16, 1, "#9FAEC2");
    // bottom info bar
    this.drawRectangle(0, c.height - 25, c.width, 25, "#FBFDFF");
    this.drawRectangle(0, c.height - 26, c.width, 1, "#919191");
    // tool bar dividers
    this.ctx.fillStyle = "#9FAEC2";
    this.ctx.fillRect(77, 29, 1, 13);
    this.ctx.fillRect(231, 29, 1, 13);
    this.ctx.fillRect(289, 29, 1, 13);
    // bottom bar dividers
    this.ctx.fillStyle = "#9FAEC2";
    this.ctx.fillRect(85, c.height - 19, 1, 13);
    this.ctx.fillRect(c.width - 122, c.height - 19, 1, 13);
}

Display.prototype.drawButtons = function () {
    for (var i = 0; i < this.targetControl.button.length; i++) {
        this.drawButton(this.targetControl.button[i]);
    }
    // drawing scrollbar sections goes here
}

Display.prototype.drawButton = function (button) {
    var nx, ny;
    if (button.isClicked) {
        this.ctx.fillStyle = "#dddddd";
    } else if (button.isSelected) {
        this.ctx.fillStyle = "#bbccff";
    } else if (button.isHovered) {
        this.ctx.fillStyle = "#ddf5ff";
    } else {
        this.ctx.fillStyle = "#EEEEEE";
    }
    this.ctx.fillRect(button.x, button.y, button.width, button.height);

    if (button.icon !== null) {
        nx = (button.width - this.icon[button.icon].width) / 2;
        ny = (button.height - this.icon[button.icon].height) / 2;
        this.ctx.drawImage(this.icon[button.icon], button.x + nx, button.y + ny);
    }
}

Display.prototype.drawInfo = function () {
    var c = this.canvas;
    // top bar info
    this.ctx.fillStyle = "#000033";
    this.ctx.fillText("File", 5, 13);
    this.ctx.fillText("*Example.png - Template Program Interface v0.1", 45, 13);

    // bottom bar info
    this.ctx.fillText(this.targetSim.width + " x " + this.targetSim.height, 29, c.height - 10);
    this.ctx.fillText("mouse: " + this.targetControl.mouse.latticeX + "," + this.targetControl.mouse.latticeY, 129, c.height - 10);
    this.ctx.fillText("view: " + this.targetControl.view.x + "," + this.targetControl.view.y, 299, c.height - 10);
    this.ctx.fillText(this.targetControl.view.pixelPerCell + ":" + this.targetControl.view.cellPerPixel, c.width - 102, c.height - 10);

    // debug info
    this.ctx.fillText(this.targetControl.select, 100, 100);


    //this.ctx.fillStyle = "#000000";
    //var text = "Current tool: " + toolName[this.targetControl.currentTool]
              //  + ", " + orientName[this.targetControl.currentOrient];
    //this.ctx.fillText(text, 5, 12);
    //this.ctx.fillText(this.targetControl.select, 5, 24);
}
