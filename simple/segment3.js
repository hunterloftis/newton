function Segment(x1, y1, x2, y2, oneWay) {
  this.x1 = x1;
  this.y1 = y1;
  this.x2 = x2;
  this.y2 = y2;
  this.anchor = new Vector(x1, y1);
  this.vector = new Vector(x2 - x1, y2 - y1);
  this.oneWay = oneWay || false;
  this.length = this.vector.getLength();
  this.angle = this.vector.getAngle();
  this.normal = this.vector.clone().turnLeft();
  this.unit = this.vector.clone().unit();
};

Segment.prototype.getProjection = function(vector) {
  var dot = this.vector.getDot(vector);
  return this.unit.clone().scale(dot);
};

Segment.prototype.getAngleDelta = function(vector) {
  return this.angle - vector.getAngle();
};

Segment.prototype.getBounds = function() {
  return {
    left: Math.min(this.x1, this.x2),
    right: Math.max(this.x1, this.x2),
    top: Math.min(this.y1, this.y2),
    bottom: Math.max(this.y1, this.y2)
  };
};

Segment.prototype.abc = function() {
  var a = this.y2 - this.y1;
  var b = this.x1 - this.x2;
  var c = a * this.x1 + b * this.y1;

  return { a: a, b: b, c: c };
}

Segment.prototype.findIntersection = function(x1, y1, x2, y2) {
  var bounds = this.getBounds();

  var toLeft = x1 < bounds.left && x2 < bounds.left;
  var toRight = x1 > bounds.right && x2 > bounds.right;
  var toTop = y1 < bounds.top && y2 < bounds.top;
  var toBottom = y1 > bounds.bottom && y2 > bounds.bottom;

  if (toLeft || toRight || toTop || toBottom) return false;

  var l1 = this.vector.abc();
  var l2 =

};
