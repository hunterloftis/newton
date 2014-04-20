# Getting Started

## The basics

### Install the library

- [newton.js](http://hunterloftis.github.io/newton/dist/current/newton.js)
- [newton.min.js](http://hunterloftis.github.io/newton/dist/current/newton.min.js)

**npm:** `npm install newton`

### Create a simulation

Newton.Simulator is responsible for *integrating Particles,* *applying Forces,* and *resolving Constraints.*
**All the high-level and advanced functionality of Newton is based on these three simple steps.**

```js
var sim = Newton.Simulator();

sim.start();
```

### Add Particles

Newton has three building blocks: Particles, Forces, and Constraints.
Particles are points in space that have X and Y coordinates as well as mass (size).

```js
var sim = Newton.Simulator();
var particle = Newton.Particle(10, 20);  // x, y

sim.add(particle);
sim.start();
```

### Render

Newton ships with a WebGL-based renderer for development and debugging.
To use it, you'll need to create a canvas element on your page.
In this case, we've called our canvas `#display`.

You can render anyway you like - canvas, webgl, DOM, SVG, etc.
All renderers support a simple interface.

```js
var sim = Newton.Simulator();
var display = document.getElementById('display');
var renderer = Newton.GLRenderer(display);

renderer.render(sim);
```

### Demo: Hello, World

As you can see, we're up and running - but it's a little boring with just one Particle sitting still.

<p>
  <iframe src="http://jsbin.com/xidod/4" style="width: 100%; height: 520px;"></iframe>
</p>

```js
var sim = Newton.Simulator();
var display = document.getElementById('display');
var renderer = Newton.GLRenderer(display);

var particle = Newton.Particle(225, 225);

renderer.render(sim);
sim.add(particle);
sim.start();
```

### Add Forces

Forces are the second basic element of Newton.
Each frame, the Simulator applies Forces to Particles in order to create movement.

Newton comes with a library of Forces, and you can easily add your own.

```js
var gravity = Newton.LinearForce(1, Math.PI * 1.5);   // strength, direction

sim.add(gravity);
```

### Add Constraints

Constraints are the third basic element of Newton and are one of its most powerful features.

They create rules that are applied to Particles after integration, like
"All particles should stay within this rectangle," or "These two particles should be connected."

BoxConstraint is a location constraint that keeps a particle within a rectangular area.
Newton comes with a library of Constraints.

```js
var container = Newton.BoxConstraint(0, 0, 1000, 600);   // x, y, width, height

sim.add(container);
```
### Group into Bodies

When building a simulation, you frequently want to refer to
a group of Particles, Forces, and Constraints as a single entity.
Newton uses the concept of *Bodies* for grouping elements.

Sub-Bodies can be added to Bodies to build up more complex entities.

Keep in mind, Bodies are just for bookkeeping - logical groupings so your code can be readable.
They have no impact on the simulation.

```js
var string = Newton.Body();
var prev, current;

// build a string to dangle
for (var i = 0; i < 25; i++) {

  // add a particle to the string
  current = string.add(Newton.Particle(500 + i * 20, 180));

  // a PinConstraint pins the first Particle in place
  if (!prev) string.add(Newton.PinConstraint(current));

  // a RopeConstraint attaches subsequent particles to the previous particle
  else string.add(Newton.RopeConstraint(prev, current));

  prev = current;
}
```

### Demo: Movement

Now things are getting interesting. Our little string has come to life!

<p>
  <iframe src="http://jsbin.com/jiduv/4" style="width: 100%; height: 520px;"></iframe>
</p>

We've given our Simulator a `solve` option.
Newton uses an iterative, convergent solver, which means that constraints are run repeatedly
each frame to converge at an approximate solution for the whole system.
The `solve` option tells the Simulator which constraints are most important.
Try changing the priority order to see how it affects the simulation.

```js
var sim = Newton.Simulator({
  // The PinConstraint should be solved most accurately
  solve: [ Newton.PinConstraint, Newton.BoxConstraint, Newton.RopeConstraint ]
});
var display = document.getElementById('display');
var renderer = Newton.GLRenderer(display);

var gravity = Newton.LinearForce(7, Math.PI * 1.5);
var container = Newton.BoxConstraint(0, 0, 500, 500);
var string = Newton.Body();

var prev, current;

// build a string to dangle
for (var i = 0; i < 40; i++) {

  // add a particle to the string
  current = string.add(Newton.Particle(250 + i * 11, 100));

  // a PinConstraint pins the first Particle in place
  if (!prev) string.add(Newton.PinConstraint(current));

  // a RopeConstraint attaches subsequent particles to the previous particle
  else string.add(Newton.RopeConstraint(prev, current));

  prev = current;
}

renderer.render(sim);

sim.add(string);
sim.add(gravity);
sim.add(container);

sim.start();
```

## Behavior

### Body factories

```js
function SquishyBall(x, y, r) {
  Newton.Body.call(this);

  for (var p = 0; p < 10; p++) {
    var x1 = x + Math.cos(p / 10 * Math.PI * 2);
    var y1 = y + Math.sin(p / 10 * Math.PI * 2);
    this.add(Newton.Particle(x1, y1));
  }
}

SquishyBall.prototype = Object.create(Newton.Body);

var body = new SquishyBall(0, 0, 20);
```
Extending Body allows you to create higher-level abstractions in your simulation.
Since Bodies can include sub-Bodies, you can compose larger components
out of smaller, simpler parts.

### Input

```js
var renderer = Newton.GLRenderer();

renderer.on('pointerdown', function(x, y) {
  var body = sim.hitList(x, y)[0];
  if (body) body.remove();
});
```

### Removing elements

```js
sim.remove(body);       // remove all Particles, Forces, and Constraints attached to this Body

sim.remove(particle);   // these are all equivalent
body.remove(particle);
particle.remove();
```
Elements in Newton also remove themselves whenever they find themselves in an impossible state.
For example, if you remove a Particle referenced by a Constraint, that Constraint will
automatically remove itself.

### Behavior Demo

(destroyable bridge with bridge factory goes here)

## Collisions

### Adding volumes

```js
var particles = [
  Newton.Particle(0, 0),
  Newton.Particle(10, 0),
  Newton.Particle(10, 10),
  Newton.Particle(0, 10)
];

var volume = Newton.Volume(particles);
```
At some point, you'll probably want some parts of your simulation to collide.
For collision detection and resolution, Newton uses the concept of *Volumes*.

A Volume defines the area of space it occupies with a polygon.
Particles that move into this area experience a collision, and are pushed out
of the polygon by Newton
(depending on relative masses, both the Volume and the Particle will experience corrective forces).
It takes at least one Volume to create a collision -
particles can't collide with each other, or with constraints, or with anything else.

Volumes follow right-hand rule.

### Separating with layers

```js
// rain, platform, and character are instances of Newton.Body
sim.add(rain, 'background')
sim.add(platform, ['background', 'foreground'])
sim.add(character, 'foreground');
```
The simulation is sorted into layers. Entities that
share a layer interact with each other - for example, forces apply
to particles that share a layer with them, and collisions happen
between volumes and particles on the same layer.

Entities can exist on multiple layers, specified as an array.
By default, entities have 'no layer', and thus exist on all layers.

In this example, the rain would interact with the platform,
and the character would interact with the platform,
but the rain and character would not effect each other.

### Adding materials

```js
var material = Newton.Material({
  mass: 1,
  friction: 0.5,
  restitution: 0.5
});
var particle = Newton.Particle(0, 0, material);
```
Particles can optionally have a Material.
Materials impact the response of Particles during collisions.
They can make an object heavy, light, hard, soft, bouncy or inelastic.

Materials cascade - Simulation instances have a reasonable default material.
Bodies can have a material, which overrides the Simulation material.
Particles can also have materials, which overrides their Body material.

### Collisions demo

```js
var sim = Newton.Simulator();
var display = document.getElementById('display');
var renderer = Newton.GLRenderer(display);

function Triangle(material) {
  Newton.Body.call(this);
  var i = 3, angle = (Math.PI * 2) / i;
  var x0 = Math.random() * 320, y0 = Math.random() * 200;
  var particles;

  while(i--) {
    var x = x0 + Math.cos(i * angle) * 10;
    var y = y0 + Math.sin(i * angle) * 10;
    particles.push( this.Particle(x, y) );
  }
  this.DistanceConstraint([particles], true);
  this.Volume([particles]);
  this.setMaterial(material);
}

Triangle.prototype = Object.create(Newton.Body.prototype);

var rock = Newton.Material({ mass: 3, friction: 1, restitution: 0 });
var plastic = Newton.Material({ mass: 0.5, friction: 0.8, restitution: 0.5 });

renderer.render(sim);
renderer.viewport(0, 0, 500, 500);

for (var i = 0; i < 30; i++) {
  sim.add(new Triangle(rock), 'rocks');
  sim.add(new Triangle(plastic), 'plastics');
}
sim.add(Newton.BoxConstraint(0, 0, 320, 200));
sim.add(Newton.LinearGravity(0, 1, 1));
sim.start();
```
[Try it out.](#)

The rocks will interact with rocks, and the plastics will interact with plastics -
but they exist on different layers so they won't interfere with each other.

## Dynamic behavior

### Listening to events

```js
sim
  .on('step', function(time) { })
  .on('collision', function(volumeA, volumeB) { });

body.on('collision', function(volumeA, volumeB) { });
body.off('collision');
```
Instances of Simulator, Body, Particle, Constraint, and Volume all broadcast events.
For details about the events and their arguments, check the full API docs for those object types.


### Behavior demo

```js
var sim = Newton.Simulator();
var display = document.getElementById('display');
var renderer = Newton.GLRenderer(display);

function BoobyTrap(x, y) {
  Newton.Body.call(this);

  var x1, top, bottom, lastTop, lastBottom;
  this.time = 0;
  this.pin = Newton.Particle(x, y);
  this.add(pin);

  for (var i = 0; i < 4; i++) {
    x1 = (i - 1.5) * 30;
    top = this.add(Newton.Particle(x1, y + 40));
    bottom = this.add(Newton.Particle(x1, y + 70));
    this.add(Newton.DistanceConstraint(top, bottom));

    if (i == 1 || i == 2) this.add(Newton.DistanceConstraint(this.pin, top));
    if (lastTop) this.add(Newton.DistanceConstraint(lastTop, top));
    if (lastBottom) this.add(Newton.DistanceConstraint(lastBottom, bottom));

    lastTop = top;
    lastBottom = bottom;
  }
}

BoobyTrap.prototype = Object.create(Newton.Body.prototype);

BoobyTrap.prototype.spring = function() {
  this.pin.remove();
};

renderer.render(sim);
renderer.viewport(0, 0, 500, 500);

var trap = new BoobyTrap(250, 10);

sim.on('step', function checkTime(time, sim) {
  if (time < 2000) return;
  trap.spring();
  sim.off();
});

sim.add(trap);
sim.add(Newton.BoxConstraint(0, 0, 500, 500));
sim.start();
```
[Try it out.](#)

Now we're talking! Implementing Body types with advanced behaviors
opens up a whole world of re-usable game objects. In this case,
dangerous ones.

## Output (custom renderers)

```js
var sim = Newton.Simulator();

render();
sim.start();

function render() {
  var state = sim.getState();
  requestAnimationFrame(render);
}
```

### Interactivity demo
