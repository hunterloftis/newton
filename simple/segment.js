var COLLISION_TOLERANCE = 0.5;
var CIRCLE_RADS = Math.PI * 2;
var QUARTER = Math.PI * 0.5;

function Segment(x1, y1, x2, y2, oneWay) {
  this.x1 = x1;
  this.y1 = y1;
  this.x2 = x2;
  this.y2 = y2;
  this.oneWay = oneWay || false;
  this.size = Segment.size(x1, y1, x2, y2);
}

Segment.size = function(x1, y1, x2, y2) {
  var dx = x2 - x1;
  var dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
};

Segment.angle = function(x1, y1, x2, y2) {
  var dx = x2 - x1;
  var dy = y2 - y1;
  return Math.atan2(dy, dx);
};

// Get the angle between this vector's normal and another vector
Segment.prototype.nAngle = function(x1, y1, x2, y2) {
  var dxA = -(this.y2 - this.y1); // normal.x = -dy
  var dyA = this.x2 - this.x1;    // normal.y = dx
  var dxB = x2 - x1;
  var dyB = y2 - y1;
  var dotProduct = dxA * dxB + dyA * dyB;
  var size = this.size * Segment.size(x1, y1, x2, y2);
  return Math.acos(dotProduct / size);
};

Segment.prototype.intersection = function(x1, y1, x2, y2) {
  // This line
  var a1 = this.y2 - this.y1;
  var b1 = this.x1 - this.x2;
  var c1 = a1 * this.x1 + b1 * this.y1;

  // Passed-in line
  var a2 = y2 - y1;
  var b2 = x1 - x2;
  var c2 = a2 * x1 + b2 * y1;

  // return false if lines are parallel
  var det = a1 * b2 - a2 * b1;
  if (det === 0) return false;

  // Determine intersection
  var x = (b2 * c1 - b1 * c2) / det;
  var y = (a1 * c2 - a2 * c1) / det;

  // Determine whether or not intersection is over the segments
  var withinOtherX = (x >= x1 - COLLISION_TOLERANCE || x >= x2 - COLLISION_TOLERANCE) && (x <= x1 + COLLISION_TOLERANCE || x <= x2 + COLLISION_TOLERANCE);
  var withinOtherY = (y >= y1 - COLLISION_TOLERANCE || y >= y2 - COLLISION_TOLERANCE) && (y <= y1 + COLLISION_TOLERANCE || y <= y2 + COLLISION_TOLERANCE);
  var withinThisX = (x >= this.x1 - COLLISION_TOLERANCE || x >= this.x2 - COLLISION_TOLERANCE) && (x <= this.x1 + COLLISION_TOLERANCE || x <= this.x2 + COLLISION_TOLERANCE);
  var withinThisY = (y >= this.y1 - COLLISION_TOLERANCE || y >= this.y2 - COLLISION_TOLERANCE) && (y <= this.y1 + COLLISION_TOLERANCE || y <= this.y2 + COLLISION_TOLERANCE);
  var within = withinOtherX && withinOtherY && withinThisX && withinThisY;
  if (!within) return false;

  // If this is a one-way barrier, determine if the motion through the segment is in a colliding direction
  var incidence;
  if (this.oneWay) {
    incidence = this.nAngle(x1, y1, x2, y2);
    if (incidence < -QUARTER || incidence > QUARTER) return false;
  }

  return {
    x: x,
    y: y,
    angle: incidence
  };
};