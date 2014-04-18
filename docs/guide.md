# Getting Started with Newton

## The basics

### Installing the library

- [newton.js](https://raw.githubusercontent.com/hunterloftis/newton/master/dist/newton.js)
- [newton.min.js](https://raw.githubusercontent.com/hunterloftis/newton/master/dist/newton.min.js)

**npm:** `npm install newton`

### Creating a simulation

```js
var sim = Newton.Simulator();
sim.start();
```
An empty simulation.

### Adding particles

```js
var particle = Newton.Particle(10, 20);  // x, y
sim.add(particle);
```
Particles are the first basic elements of Newton.

### Rendering

```js
var display = document.getElementById('display');
var renderer = Newton.GLRenderer(display)

renderer.viewport(0, 0, 640, 480);  // x, y, width, height
renderer.render(sim);
```
Newton ships with a WebGL-based renderer for development and debugging.

You can render anyway you like - canvas, webgl, DOM, SVG, etc.
All renderers support a simple interface.

### Basics demo

```js
var sim = Newton.Simulator();
var display = document.getElementById('display');
var renderer = Newton.GLRenderer(display);
var particle = Newton.Particle(500, 300);

renderer.render(sim);

sim.add(particle);
sim.start();
```
[Try it out.](http://hunterloftis.github.io/newton/examples/guide_basics.html)

As you can see, we're up and running - but it's a little boring with just one Particle sitting still.

## Movement

### Adding forces

```js
var gravity = Newton.LinearForce(0, 1);
sim.add(gravity);
```
Forces are the second basic elements of Newton.
By combining them with Particles, we can create movement.

Newton comes with a library of Forces, to which you can also add your own.
Force implementations tend to be very short (< 30 lines).

### Adding constraints

```js
var container = Newton.BoxConstraint(0, 0, 100, 100);   // x, y, width, height
sim.add(container);
```
Constraints are the third basic elements of Newton.
They create rules that Particles follow - for example,
rules about distance can create springs,
rules about location can create containers,
and rules about angles can create hinges.

The BoxConstraint above is a location rule that keeps a particle within a rectangular area.
Newton comes with a library of Constraints to which you can also add your own custom implementations.

### Grouping into bodies

```js
var spring = Newton.Body();
var p1 = spring.add(Newton.Particle(-10, 0));   // create a Particle and add it to the spring Body
var p2 = spring.add(Newton.Particle(10, 0));

spring.add(Newton.SpringConstraint(p1, p2, 0.5));
sim.add(spring);
```
When building a simulation, you frequently want to refer to
a group of particles, forces, and constraints as a single entity.
Newton uses the concept of *bodies* for grouping elements.

Sub-bodies can be added to bodies to build up more complex entities.

Keep in mind, bodies are just for bookkeeping -
arrays of logically grouped particles, forces,
and constraints so your code can be readable.
They have no effect on collisions or any other part of the simulation.
`sim.add(body)` just calls `sim.add(this)` on each element within `body`.

### Movement demo

```js
var sim = Newton.Simulator();
var display = document.getElementById('display');
var renderer = Newton.GLRenderer(display);
var string = Newton.Body();
var prev, current;

for (var i = 0; i < 25; i++) {
  current = string.add(Newton.Particle(500 + i * 20, 180));

  // A PinConstraint pins a Particle in place
  if (i === 0) string.add(Newton.PinConstraint(current));

  // A RopeConstraint attaches this particle to the previous particle
  if (prev) string.add(Newton.RopeConstraint(prev, current));
  prev = current;
}

renderer.render(sim);

sim.add(string);

// A LinearForce simulates gravity
sim.add(Newton.LinearForce(0.01, Math.PI * 1.5));

// A BoxConstraint keeps our string within the viewport
sim.add(Newton.BoxConstraint(0, 0, 1000, 600));
sim.start();
```
[Try it out.](http://hunterloftis.github.io/newton/examples/guide_movement.html)

Now things are getting interesting. Our little chain has come to life!

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

function Shape(material) {
  Newton.Body.call(this);
  var i = 8, angle = (Math.PI * 2) / i;
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

Shape.prototype = Object.create(Newton.Body.prototype);

var rock = Newton.Material({ mass: 3, friction: 1, restitution: 0 });
var plastic = Newton.Material({ mass: 0.5, friction: 0.8, restitution: 0.5 });

renderer.render(sim);
renderer.viewport(0, 0, 500, 500);

for (var i = 0; i < 30; i++) {
  sim.add(new Shape(rock), 'rocks');
  sim.add(new Shape(plastic), 'plastics');
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

### Creating custom body factories

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

### Behavior demo

```js
var sim = Newton.Simulator();
var display = document.getElementById('display');
var renderer = Newton.GLRenderer(display);

function BoobyTrap(x, y) {
  var x1, top, bottom, lastTop, lastBottom;
  Newton.Body.call(this);
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

BoobyTrap.prototype.launch = function() {
  this.pin.remove();
};

renderer.render(sim);
renderer.viewport(0, 0, 500, 500);

var bt = new BoobyTrap(250, 10);

sim.on('step', function checkTime(time, sim) {
  if (time < 2000) return;
  bt.launch();
  sim.off();
});

sim.add(bt);
sim.add(Newton.BoxConstraint(0, 0, 500, 500));
sim.start();
```
[Try it out.](#)

Now we're talking! Implementing Body types with advanced behaviors
opens up a whole world of re-usable game objects. In this case,
dangerous ones.

## Interactivity

### Input

```js
var renderer = Newton.GLRenderer();

renderer.on('pointerdown', function(x, y) {
  var body = sim.hitList(x, y)[0];
  if (body) body.remove();
});
```

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
