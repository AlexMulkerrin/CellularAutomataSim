/* root program object which handles initialisation, 
 * file loading and saving. 
*/
// INITIALISATION
function loadProgram() {
    var program = new Program("CAcanvas");

    program.display.update();
    setInterval(function () { program.update(); }, program.refreshDelay);
}
// OBJECT CLASS
function Program(canvasName) {
    this.refreshDelay = 500;
    this.simulation = new Simulation(10, 10);
    this.control = new Control(canvasName, this.simulation);
    this.display = new Display(canvasName, this.simulation, this.control);
    this.control.linkDisplay(this.display);

    var image = new Image();
    image.src = "exampleSchematics/logicGates.png";
    var prog = this;
    image.onload = function () {
        prog.simulation.setCALatticeFromImage(image);
        prog.display.resizeCanvas();
    }


    document.getElementById("imageToLoad").onchange = function () {
        prog.loadImage();
    };

    document.getElementById("saveToFile").onclick = function () {
        prog.saveImage();
    };
}
// METHODS
Program.prototype.update = function () {
    this.simulation.update();
    this.display.update();
};

Program.prototype.saveImage = function () {
    var schematicImage = this.simulation.getSchematicAsImage(); // todo!
    var imageData = schematicImage.toDataURL("image/png");
    var imageName = "schematic"; // todo add filename input in user interface
    this.createDownloadPrompt(imageName, imageData);
};

Program.prototype.createDownloadPrompt = function (name, contents) {
    var link = document.createElement("a");
    link.download = name;
    link.innerHTML = "Download File";
    link.href = contents;
    link.onclick = function (event) {
        document.body.removeChild(event.target);
    };
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
};

Program.prototype.loadImage = function () {
    var prog = this;
    var image = new Image();
    var file = document.getElementById("imageToLoad").files[0]; // todo use javascript instead of input element
    var fileReader = new FileReader();
    fileReader.onload = function (event) {
        image.src = event.target.result;
        image.onload = function () {
            prog.simulation.setCALatticeFromImage(image); //todo!
            prog.display.resizeCanvas();

        }
    };
    fileReader.readAsDataURL(file);
};
