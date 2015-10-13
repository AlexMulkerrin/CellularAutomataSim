const toolType = { charge: 0, wire: 1, inverter: 2, splitter: 3, rotate: 4 }
const toolName = ["charge", "wire", "inverter", "splitter", "rotate"];
const orientName = ["none","right", "down", "left", "up"];

function Control(canvasName, simulation) {
    this.targetCanvas = document.getElementById(canvasName);
    this.targetSim = simulation;
    this.targetDisplay;

    this.mouse = new Mouse();

	this.oldX = -1;
	this.oldY = -1;
    this.hoverX = -1;
    this.hoverY = -1;
    this.currentTool = toolType.wire;
    this.currentOrient = stateType.right;

    this.createInterfaceEventHandlers();
    this.createKeyboardEventHandlers();
    this.createCanvasEventHandlers();
    
}

Control.prototype.linkDisplay = function(display) {
    this.targetDisplay=display;
}

Control.prototype.createInterfaceEventHandlers = function () {
    var t = this;
    document.getElementById("chargeButton").onclick = function () {
        t.currentTool = toolType.charge;
    };
    document.getElementById("wireButton").onclick = function () {
        t.currentTool = toolType.wire;
    };
    document.getElementById("inverterButton").onclick = function () {
        t.currentTool = toolType.inverter;
    };
    document.getElementById("splitterButton").onclick = function () {
        t.currentTool = toolType.splitter;
    };
    document.getElementById("rotateButton").onclick = function () {
        t.currentTool = toolType.rotate;
    };

    document.getElementById("rightButton").onclick = function () {
        t.currentOrient = 1;
    };
    document.getElementById("downButton").onclick = function () {
        t.currentOrient = 2;
    };
    document.getElementById("leftButton").onclick = function () {
        t.currentOrient = 3;
    };
    document.getElementById("upButton").onclick = function () {
        t.currentOrient = 4;
    };
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
                t.currentTool = toolType.charge;
                break;
            case 50:    // 2 key
                t.currentTool = toolType.wire;
                break;
            case 51:    // 3 key
                t.currentTool = toolType.inverter;
                break;
            case 52:    // 4 key
                t.currentTool = toolType.splitter;
                break;
            case 53:    // 5 key
                t.currentTool = toolType.rotate;
                //t.currentOrient++;
                //if (t.currentOrient > 4) t.currentOrient = 1;
                break;
        }
    };
}

Control.prototype.createCanvasEventHandlers = function () {
    var t = this;
    this.targetCanvas.onmouseenter = function (event) { t.mouse.isOverCanvas = true; };
    this.targetCanvas.onmouseleave = function (event) { t.mouseExits(event); };

    this.targetCanvas.onmousemove = function (event) { t.mouseUpdateCoords(event); };

    this.targetCanvas.onmousedown = function (event) { t.mousePressed(event); };
    this.targetCanvas.onmouseup = function (event) { t.mouseReleased(event); };

    this.targetCanvas.oncontextmenu = function (event) { return false; };
    this.targetCanvas.onselectstart = function (event) { return false; };
}

Control.prototype.mouseUpdateCoords = function (event) {
    var rect = this.targetCanvas.getBoundingClientRect();
    this.mouse.x = event.clientX - rect.left;
    this.mouse.y = event.clientY - rect.top;
    this.setHover();
    this.targetDisplay.update();
}

Control.prototype.setHover = function () {
    this.hoverX = Math.floor(this.mouse.x / this.targetDisplay.sqSize);
    this.hoverY  = Math.floor(this.mouse.y / this.targetDisplay.sqSize);
}

Control.prototype.setOldHover = function () {
    this.oldX  = Math.floor(this.mouse.x / this.targetDisplay.sqSize);
    this.oldY  = Math.floor(this.mouse.y / this.targetDisplay.sqSize);
}

Control.prototype.mouseExits = function (event) {
    this.mouse.isOverCanvas = false;
    this.mouse.isPressed = false;
    this.oldX = -1;
    this.oldY = -1;
    this.hoverX = -1;
    this.hoverY = -1;
    this.targetDisplay.update();
}

Control.prototype.mousePressed = function (event) {
    this.mouse.buttonPressed = event.which;
    this.mouse.isPressed = true;
	this.setOldHover();

    
}

Control.prototype.mouseReleased = function (event) {
    this.mouse.isPressed = false;

    if (this.oldX >= 0 && this.oldY >= 0) {
        if (this.mouse.buttonPressed === 1) {
            if (this.oldX === this.hoverX && this.oldY === this.hoverY) {
                this.targetSim.setCell(this.hoverX, this.hoverY, this.currentTool, this.currentOrient);
            } else {
                this.targetSim.setLine(this.hoverX, this.hoverY, this.oldX, this.oldY, this.currentTool, this.currentOrient);
            }
        } else if (this.mouse.buttonPressed === 3) {
            this.targetSim.clearArea(this.hoverX, this.hoverY, this.oldX, this.oldY);
        }
    }
	this.oldX = -1;
	this.oldY = -1;
    this.targetDisplay.update();
}


function Mouse() {
    this.x = 0;
    this.y = 0;
    this.isOverCanvas = false;
    this.isPressed = false;
    this.buttonPressed = 0;
}
