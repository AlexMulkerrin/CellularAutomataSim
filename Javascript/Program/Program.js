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
    this.refreshDelay = 50;
    this.simulation = new Simulation(10, 10);
    var t = this;
    this.control = new Control(canvasName, this.simulation, t);
    this.display = new Display(canvasName, this.simulation, this.control);
    this.control.linkDisplay(this.display);

    


    var image = new Image();
    image.src = "exampleSchematics/4-bit counter.png";
    var prog = this;
    image.onload = function () {
        prog.simulation.setCALatticeFromImage(image);
        prog.display.resizeCanvas();
    }


    //document.getElementById("imageToLoad").onchange = function () {
        //prog.loadImage();
    //};
    


    //document.getElementById("saveToFile").onclick = function () {
        //prog.saveImage();
   // };
}
// METHODS
Program.prototype.update = function () {
    if (this.simulation.isRunning) {
        this.simulation.update();
    }
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

Program.prototype.createOpenPrompt = function () {
    var t = this;
    var test = document.createElement('input');
    test.setAttribute("type", "file");
    document.body.appendChild(test);
    test.onchange = function (event) {
        t.loadImage(test);
        document.body.removeChild(event.target);
    };
    test.click();
}

Program.prototype.loadImage = function (fileInput) {
    var prog = this;
    var image = new Image();
    var file = fileInput.files[0]; // todo use javascript instead of input element
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
