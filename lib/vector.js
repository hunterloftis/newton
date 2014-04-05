function Vector(x, y) {
  if (!(this instanceof Vector)) return new Vector(x, y);
  this.x = x;
  this.y = y;
}

module.exports = Vector;
