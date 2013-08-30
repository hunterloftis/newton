require('./vector');
require('./wall');

var a = new Wall(-10, -1, 5, -1);

console.log('should be 0, -1:', a.findIntersection(0, 0, 0, -3));
console.log('should be 1, -1:', a.findIntersection(1, 0, 1, -3));
console.log('should be 1, -1:', a.findIntersection(0, 0, 3, -3));
console.log('should be false:', a.findIntersection(0, 0, 0.5, 0.5));
console.log('should be false:', a.findIntersection(0, -0.5, 5, -0.5));

var b = new Wall(0, 0, 10, -10);
console.log('should be false:', b.findIntersection(1, 0, 10, -9));
