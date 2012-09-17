var COLLISION_TOLERANCE = 0.001;

function Segment(x1, y1, x2, y2) {
  this.x1 = x1;
  this.y1 = y1;
  this.x2 = x2;
  this.y2 = y2;
}

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

  return {
    x: x,
    y: y
  };
};