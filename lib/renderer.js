function Renderer() {

}

Renderer.prototype.render = function(sim) {
  this._sim = sim;
};

module.exports = Renderer;
