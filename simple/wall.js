function Wall(x1, y1, x2, y2, oneWay) {
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

Wall.getAbc = function(x1, y1, x2, y2) {
  var a = y2 - y1;
  var b = x1 - x2;
  var c = a * x1 + b * y1;

  return { a: a, b: b, c: c };
};

Wall.prototype.getProjection = function(vector) {
  var dot = this.vector.getDot(vector);
  return this.unit.clone().scale(dot);
};

Wall.prototype.getAngleDelta = function(vector) {
  return this.angle - vector.getAngle();
};

Wall.prototype.getBounds = function() {
  return {
    left: Math.min(this.x1, this.x2),
    right: Math.max(this.x1, this.x2),
    top: Math.min(this.y1, this.y2),
    bottom: Math.max(this.y1, this.y2)
  };
};

Wall.prototype.getAbc = function() {
  return Wall.getAbc(this.x1, this.y1, this.x2, this.y2);
}

Wall.prototype.findIntersection = function(x1, y1, x2, y2) {
  var bounds = this.getBounds();

  var toLeft = x1 < bounds.left && x2 < bounds.left;
  var toRight = x1 > bounds.right && x2 > bounds.right;
  var toTop = y1 < bounds.top && y2 < bounds.top;
  var toBottom = y1 > bounds.bottom && y2 > bounds.bottom;

  if (toLeft || toRight || toTop || toBottom) return false;

  var l1 = this.getAbc();
  var l2 = Wall.getAbc(x1, y1, x2, y2);
  var det = l1.a * l2.b - l2.a * l1.b;

  if (det === 0) return false;
  console.log('det:', det);

  var x = (l2.b * l1.c  - l1.b * l2.c) / det;
  var y = (l1.a * l2.c - l2.a * l1.c) / det;

  return {
    x: x,
    y: y
  };
};

if (typeof module !== 'undefined') global.Wall = Wall;
