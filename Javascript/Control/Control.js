const toolType = { charge: 0, wire: 1, inverter: 2, splitter: 3, rotate: 4 , remove:5}
const toolName = ["charge", "wire", "inverter", "splitter", "rotate","remove"];
const orientName = ["none","right", "down", "left", "up"];

function Control(canvasName, simulation, program) {
    this.targetProgram = program;
    this.targetCanvas = document.getElementById(canvasName);
    this.targetSim = simulation;
    this.targetDisplay;


    this.mouse = new Mouse();
    this.view = new View();
    this.button = [];

    this.select = "none";

    this.currentTool = toolType.wire;
    this.currentOrient = stateType.right;

    this.createButtons();
    this.createKeyboardEventHandlers();
    this.createCanvasEventHandlers();
    
}

Control.prototype.linkDisplay = function(display) {
    this.targetDisplay=display;
}

Control.prototype.createKeyboardEventHandlers = function () {
    var t = this;
    document.onkeydown = function (event) {
        var keyCode;
        if (event === null) {
            keyCode = window.event.keyCode;
        } else {
            keyCode = event.keyCode;
        }

        switch (keyCode) {
            case 49:    // 1 key
                t.mouse.newSelected = toolType.wire + 2;
                t.selectTool();
                break;
            case 50:    // 2 key
                t.mouse.newSelected = toolType.charge + 4;
                t.selectTool();
                break;
            case 51:    // 3 key
                t.mouse.newSelected = toolType.inverter + 3;
                t.selectTool();
                break;
            case 52:    // 4 key
                t.mouse.newSelected = toolType.splitter + 3;
                t.selectTool();
                break;
            case 53:    // 5 key
                t.mouse.newSelected = toolType.rotate + 3;
                t.selectTool();
                //t.currentOrient++;
                //if (t.currentOrient > 4) t.currentOrient = 1;
                break;
            case 54:    // 6 key
                t.mouse.newSelected = toolType.remove + 3;
                t.selectTool();
                break;

            case 32:    // spacebar
            case 80:    // p key
                t.targetSim.togglePause();
                break;

            case 13:    // enter
                t.targetSim.update();
                t.targetDisplay.update();
                break;

            case 65:
            case 37: // a or left arrow
                t.scrollLeft();
                break;
            case 38:
            case 87: // w or up arrow
                t.scrollUp();
                break;
            case 39:
            case 68: // d or right arrow
                t.scrollRight();
                break;
            case 40:
            case 83: // s or down arrow
                t.scrollDown();
                break;
        }
    };
}

Control.prototype.createCanvasEventHandlers = function () {
    var t = this;

    this.targetCanvas.onmousemove = function (event) { t.mouseUpdateCoords(event); };

    this.targetCanvas.onmousedown = function (event) { t.mousePressed(event); };
    this.targetCanvas.onmouseup = function (event) { t.mouseReleased(event); };

    this.targetCanvas.onmousewheel = function (event) { t.mouseWheel(event.wheelDelta); return false; };
    // special case for Mozilla...
    this.targetCanvas.onwheel = function (event) { t.mouseWheel(event); return false; };

    this.targetCanvas.oncontextmenu = function (event) { return false; };
    this.targetCanvas.onselectstart = function (event) { return false; };
}

Control.prototype.mouseUpdateCoords = function (event) {
    var rect = this.targetCanvas.getBoundingClientRect();
    this.mouse.x = event.clientX - rect.left;
    this.mouse.y = event.clientY - rect.top;
    this.checkHover();
}

Control.prototype.checkHover = function () {
    this.mouse.isOverButton = false;
    var button;
    for (var i = 0; i < this.button.length; i++) {
        button = this.button[i];
        button.isHovered = false;
        button.isClicked = false;
        if (this.mouse.x >= button.x && this.mouse.x <= button.x + button.width) {
            if (this.mouse.y >= button.y && this.mouse.y <= button.y + button.height) {
                if (this.mouse.isReleased) {
                    this.mouse.newSelected = i;
                    this[button.function]();
                } else if (this.mouse.isPressed) {
                    button.isClicked = true;
                } else {
                    button.isHovered = true;
                }
                this.mouse.isOverButton = true;
            }
        }
    }
    if (this.mouse.isOverButton === false) {
        this.checkLattice();
    }
    this.targetDisplay.update();
}

Control.prototype.checkLattice = function () {
    this.mouse.isOverWorkspace = true;
    var cellSize = this.view.cellPerPixel/this.view.pixelPerCell;
    this.mouse.latticeX = Math.floor((this.mouse.x - this.view.x) * cellSize);
    this.mouse.latticeY = Math.floor((this.mouse.y - this.view.y) * cellSize);

    if (this.mouse.latticeX < 0) {
        this.mouse.isOverWorkspace = false;
        this.mouse.latticeX = 0;
    }
    if (this.mouse.latticeX >= this.targetSim.width) {
        this.mouse.isOverWorkspace = false;
        this.mouse.latticeX = this.targetSim.width - 1;
    }
    if (this.mouse.latticeY < 0) {
        this.mouse.isOverWorkspace = false;
        this.mouse.latticeY = 0;
    }
    if (this.mouse.latticeY >= this.targetSim.height) {
        this.mouse.isOverWorkspace = false;
        this.mouse.latticeY = this.targetSim.height - 1;
    }
}

Control.prototype.setOldHover = function () {
    this.mouse.oldLatticeX = this.mouse.latticeX;
    this.mouse.oldLatticeY = this.mouse.latticeY;
}

Control.prototype.mousePressed = function (event) {
    this.mouse.buttonPressed = event.which;
    this.mouse.isPressed = true;
    this.setOldHover();
    this.checkHover();
	

    
}

Control.prototype.mouseReleased = function (event) {
    this.mouse.isReleased = true;
    this.mouse.isPressed = false;
    this.checkHover();
    this.mouse.isReleased = false;
    this.checkHover();

    if (this.mouse.isOverWorkspace) {
        if (this.mouse.buttonPressed === 1) {
            if (this.mouse.oldLatticeX === this.mouse.latticeX && this.mouse.oldLatticeY === this.mouse.latticeY) {
                this.targetSim.setCell(this.mouse.latticeX, this.mouse.latticeY, this.currentTool, this.currentOrient);
            } else {
                this.targetSim.setLine(this.mouse.latticeX, this.mouse.latticeY, this.mouse.oldLatticeX, this.mouse.oldLatticeY, this.currentTool, this.currentOrient);
            }
        } else if (this.mouse.buttonPressed === 3) {
            this.targetSim.clearArea(this.mouse.latticeX, this.mouse.latticeY, this.mouse.oldLatticeX, this.mouse.oldLatticeY);
        }
    }
	this.oldX = -1;
	this.oldY = -1;
    this.targetDisplay.update();
}

Control.prototype.mouseWheel = function (event) {
    var change = -event.deltaY || event.wheelDelta;
    if (change < 0) {
        this.zoomOut();
    } else if (change > 0) {
        this.zoomIn();
    }
    this.checkHover();
}

function Mouse() {
    this.x = 0;
    this.y = 0;
    this.isOverWorkspace = false;
    this.isPressed = false;
    this.isReleased = false;
    this.buttonPressed = 0;

    this.isOverButton = false;
    this.selected = 3;
    this.newSelected = 0;

    this.latticeX = 0;
    this.latticeY = 0;
    this.oldLatticeX = 0;
    this.oldLatticeY = 0;
}

Control.prototype.fileMenu = function () {
    this.select = "file Menu";
}
Control.prototype.newFile = function () {
    this.select = "new file";
    this.targetSim.createCALattice();
}
Control.prototype.loadFile = function() {
    this.select = "load file";
    this.targetProgram.createOpenPrompt();
}
Control.prototype.saveFile = function() {
    this.select = "save file";
    this.targetProgram.saveImage();
}
Control.prototype.selectTool = function() {
    var typeName = ["wire","charge","inverter","splitter","rotate","remove"];
    var type = this.mouse.newSelected - 3;
    this.currentTool = toolType[typeName[type]];
    this.button[this.mouse.selected].isSelected = false;
    this.mouse.selected = this.mouse.newSelected;
    this.button[this.mouse.selected].isSelected = true;
    this.select = "select " + typeName[type];
}
Control.prototype.undo = function() {
    this.select = "undo";
}
Control.prototype.redo = function() {
    this.select = "redo";
}
Control.prototype.run = function () {
    this.targetSim.isRunning = true;
    this.select = "run";
}
Control.prototype.pause = function () {
    this.targetSim.isRunning = false;
    this.select = "pause";
}
Control.prototype.fullscreen = function() {
    this.select = "fullscreen";

    if (!document.mozFullScreen && !document.webkitFullScreen) {
        if (this.targetCanvas.mozRequestFullScreen) {
            this.targetCanvas.mozRequestFullScreen();
        } else {
            this.targetCanvas.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
        }
    } else {
        if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else {
            document.webkitCancelFullScreen();
        }
    }
}
Control.prototype.scrollUp = function() {
    this.select = "scroll up";
    this.view.y += this.view.pixelPerCell;
}
Control.prototype.scrollDown = function() {
    this.select = "scroll down";
    this.view.y -= this.view.pixelPerCell;
}
Control.prototype.scrollLeft = function() {
    this.select = "scroll left";
    this.view.x += this.view.pixelPerCell;
}
Control.prototype.scrollRight = function() {
    this.select = "scroll right";
    this.view.x -= this.view.pixelPerCell;
}
Control.prototype.resize = function() {
    this.select = "resize";
}
Control.prototype.noEffect = function() {
    this.select = "...";
}
Control.prototype.fitToWindow = function() {
    this.select = "fit to window";
    this.view.pixelPerCell = 32;
    this.view.cellPerPixel = 1;

    var maxWorkspaceWidth = this.targetCanvas.width - (this.view.borderLeft + this.view.borderRight);
    var maxWorkspaceHeight = this.targetCanvas.height - (this.view.borderTop + this.view.borderBottom);

    while (this.view.pixelPerCell > maxWorkspaceWidth / this.targetSim.width && this.view.pixelPerCell > 1) {
        this.view.pixelPerCell = this.view.pixelPerCell / 2;
    }
    while (this.view.pixelPerCell > maxWorkspaceHeight / this.targetSim.height && this.view.pixelPerCell > 1) {
        this.view.pixelPerCell = this.view.pixelPerCell / 2;
    }
    this.view.cellPerPixel = 1;

    var workspaceWidth = this.targetSim.width * this.view.pixelPerCell / this.view.cellPerPixel;
    var workspaceHeight = this.targetSim.height * this.view.pixelPerCell / this.view.cellPerPixel;

    if (workspaceWidth < maxWorkspaceWidth) {
        this.view.x = this.view.borderLeft + (maxWorkspaceWidth - workspaceWidth) / 2;
    }
    if (workspaceHeight < maxWorkspaceHeight) {
        this.view.y = this.view.borderTop + (maxWorkspaceHeight - workspaceHeight) / 2;
    }
    this.view.x = Math.floor(this.view.x);
    this.view.y = Math.floor(this.view.y);
}



Control.prototype.zoomIn = function () {
    this.select = "zoom in";
    this.view.cellPerPixel = this.view.cellPerPixel / 2;
    if (this.view.cellPerPixel < 1) {
        this.view.cellPerPixel = 1;
        this.view.pixelPerCell = this.view.pixelPerCell * 2;
    }

    var maxWorkspaceWidth = this.targetCanvas.width - (this.view.borderLeft + this.view.borderRight);
    var maxWorkspaceHeight = this.targetCanvas.height - (this.view.borderTop + this.view.borderBottom);

    var workspaceWidth = this.targetSim.width * this.view.pixelPerCell / this.view.cellPerPixel;
    var workspaceHeight = this.targetSim.height * this.view.pixelPerCell / this.view.cellPerPixel;

    this.view.x = Math.floor(this.view.x * 2 - this.mouse.x);
    this.view.y = Math.floor(this.view.y * 2 - this.mouse.y);
}

Control.prototype.zoomOut = function () {
    this.select = "zoom out";
    this.view.pixelPerCell = this.view.pixelPerCell / 2;
    if (this.view.pixelPerCell < 1) {
        this.view.pixelPerCell = 1;
        this.view.cellPerPixel = this.view.cellPerPixel * 2;
    }

    this.view.x = (this.view.x + this.targetCanvas.width - this.mouse.x) / 2;
    this.view.y = (this.view.y + this.targetCanvas.height - this.mouse.y) / 2;

    var maxWorkspaceWidth = this.targetCanvas.width - (this.view.borderLeft + this.view.borderRight);
    var maxWorkspaceHeight = this.targetCanvas.height - (this.view.borderTop + this.view.borderBottom);

    var workspaceWidth = this.targetSim.width * this.view.pixelPerCell / this.view.cellPerPixel;
    var workspaceHeight = this.targetSim.height * this.view.pixelPerCell / this.view.cellPerPixel;

    if (workspaceWidth < maxWorkspaceWidth) {
        this.view.x = this.view.borderLeft + (maxWorkspaceWidth - workspaceWidth) / 2;
    }
    if (workspaceHeight < maxWorkspaceHeight) {
        this.view.y = this.view.borderTop + (maxWorkspaceHeight - workspaceHeight) / 2;
    }
    this.view.x = Math.floor(this.view.x);
    this.view.y = Math.floor(this.view.y);
}

function View() {
    this.offsetX = 5;
    this.offsetY = 53;
    this.x = this.offsetX;
    this.y = this.offsetY;

    this.borderTop = 53;
    this.borderLeft = 5;
    this.borderRight = 22;
    this.borderBottom = 48;

    this.pixelPerCell = 16;
    this.cellPerPixel = 1;
}

Control.prototype.createButtons = function () {
    var c = this.targetCanvas;
    var t = this;
    // file modification
    this.button[0] = new Button(2, 24, 22, 22, 0, "newFile");
    this.button[1] = new Button(26, 24, 22, 22, 1, "loadFile");
    this.button[2] = new Button(50, 24, 22, 22, 2, "saveFile");
    // tools
    this.button[3] = new Button(84, 24, 22, 22, 3, "selectTool");
    this.button[4] = new Button(108, 24, 22, 22, 4, "selectTool");
    this.button[5] = new Button(132, 24, 22, 22, 5, "selectTool");
    this.button[6] = new Button(156, 24, 22, 22, 6, "selectTool");
    this.button[7] = new Button(180, 24, 22, 22, 7, "selectTool");
    this.button[8] = new Button(204, 24, 22, 22, 8, "selectTool");

    this.button[9] = new Button(238, 24, 0, 0, null, "undo");
    this.button[10] = new Button(262, 24, 0, 0, null, "redo");

    // simulation controls
    this.button[11] = new Button(296, 24, 22, 22, 11, "run");
    this.button[12] = new Button(320, 24, 22, 22, 12, "pause");

    // viewport controls
    this.button[13] = new Button(c.width - 21, 1, 20, 20, 13, "fullscreen");

    this.button[14] = new Button(c.width - 16, 48, 16, 16, 15, "scrollUp");
    this.button[15] = new Button(c.width - 16, c.height - 58, 16, 16, 16, "scrollDown");
    this.button[16] = new Button(0, c.height - 42, 16, 16, 17, "scrollLeft");
    this.button[17] = new Button(c.width - 32, c.height - 42, 16, 16, 18, "scrollRight");

    // size and scale
    this.button[18] = new Button(3, c.height - 23, 20, 20, 19, "resize");
    this.button[19] = new Button(102, c.height - 23, 20, 20, 20, "noEffect");
    this.button[20] = new Button(c.width - 70, c.height - 23, 20, 20, 21, "fitToWindow");
    this.button[21] = new Button(c.width - 46, c.height - 23, 20, 20, 22, "zoomIn");
    this.button[22] = new Button(c.width - 22, c.height - 23, 20, 20, 23, "zoomOut");

    // scrollbar sections
    this.button[23] = new Button(c.width - 16, 64, 16, 16, null, "scrollUp");
    this.button[24] = new Button(c.width - 16, c.height - 74, 16, 16, null, "scrollDown");
    this.button[25] = new Button(16, c.height - 42, 16, 16, null, "scrollLeft");
    this.button[26] = new Button(c.width - 48, c.height - 42, 16, 16, null, "scrollRight");

    // file tab button
    this.button[27] = new Button(1, 1, 30, 19, null, "fileMenu");
}

function Button(x, y, width, height, icon, func) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.icon = icon;
    this.function = func;
    this.isHovered = false;
    this.isSelected = false;
    this.isClicked = false;
}

Control.prototype.repositionButtons = function () {
    this.createButtons();
    this.button[this.mouse.selected].isSelected = true;
}