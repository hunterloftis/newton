var Particle = require('./particle');
var Segment = require('./segment');
var p, s;

console.log('==========');
p = new Particle(0, 0, 1);
s = new Segment(-10, 1, 10, 1, true);
p.move(0, 2);
collisions = p.collide([s]);
console.log('collisions:', collisions);

console.log('==========');
p = new Particle(0, 0, 1);
p.move(3, 3);
collisions = p.collide([s]);
console.log('collisions:', collisions);

console.log('==========');
s = new Segment(-10, 0, 10, 1, true);
p = new Particle(0, 0, 1);
p.move(3, 3);
collisions = p.collide([s]);
console.log('collisions:', collisions);

