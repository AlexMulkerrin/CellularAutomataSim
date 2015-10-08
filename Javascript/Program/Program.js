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
    this.display = new Display(canvasName, this.simulation);
}
// METHODS
Program.prototype.update = function () {
    this.simulation.update();
    this.display.update();
};