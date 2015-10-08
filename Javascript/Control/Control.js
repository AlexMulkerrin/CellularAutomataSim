function Control(canvasName, simulation) {
    this.targetCanvas = document.getElementById(canvasName);
    this.targetSim = simulation;
    this.targetDisplay;

    this.mouse = new Mouse();

    this.hoverX = -1;
    this.hoverY = -1;

    this.createCanvasEventHandlers();
}

Control.prototype.linkDisplay = function(display) {
    this.targetDisplay=display;
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
    this.hoverX  = Math.floor(this.mouse.x / this.targetDisplay.sqSize);
    this.hoverY  = Math.floor(this.mouse.y / this.targetDisplay.sqSize);
}

Control.prototype.mouseExits = function (event) {
    this.mouse.isOverCanvas = false;
    this.mouseReleased();
    this.hoverX = -1;
    this.hoverY = -1;
    this.targetDisplay.update();
}

Control.prototype.mousePressed = function (event) {
    this.mouse.buttonPressed = event.which;
    this.targetSim.setCell(this.hoverX, this.hoverY);
    this.targetDisplay.update();
}

Control.prototype.mouseReleased = function (event) {
    this.mouse.isPressed = false;
}


function Mouse() {
    this.x = 0;
    this.y = 0;
    this.isOverCanvas = false;
    this.isPressed = false;
    this.buttonPressed = 0;
}