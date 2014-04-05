var Renderer = require('../renderer');

function GLRenderer(el) {
  if (!(this instanceof GLRenderer)) return new GLRenderer(el);
  this._el = el;
  this._sim = undefined;
}

GLRenderer.prototype = Object.create(Renderer.prototype);

GLRenderer.prototype.render = function(sim) {
  this._sim = sim;
};

module.exports = GLRenderer;
