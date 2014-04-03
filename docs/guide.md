# Getting Started with Newton

## The basics

### Installing the library

```
bower install newton
```

**old-school:** *Drop
[newton.js](https://raw.github.com/hunterloftis/newton/master/newton.js) or
[newton.min.js](https://raw.github.com/hunterloftis/newton/master/newton.min.js)
into your page with a `<script>` tag.*

**npm:** `npm install newton`

### Creating a simulation

```js
var sim = newton.Simulator();
sim.start();
```
An empty simulation.

### Adding particles

```js
var particle = newton.Particle(10, 20);  // x, y
sim.add(particle);
```
Particles are the first basic elements of Newton.

### Rendering

```js
var display = document.getElementById('display');
var renderer = newton.GLRenderer(display)

renderer.viewport(0, 0, 640, 480);  // x, y, width, height
renderer.render(sim);
```
Newton ships with a WebGL-based renderer for development and debugging.

You can render anyway you like - canvas, webgl, DOM, SVG, etc.
All renderers support a simple interface.

### Basics demo

```js
var sim = newton.Simulator();
var particle = newton.Particle(20, 10);
var display = document.getElementById('display');
var renderer = newton.GLRenderer(display);

renderer.viewport(0, 0, 40, 20);
renderer.render(sim);

sim.add(particle);
sim.start();
```
[Try it out.](#)

As you can see, we're up and running - but it's a little boring with just one Particle sitting still.

## Movement

### Adding forces

```js
var gravity = newton.LinearForce(0, 1);
sim.add(gravity);
```
Forces are the second basic elements of Newton.
By combining them with Particles, we can create movement.

Newton comes with a library of Forces, to which you can also add your own.
Force implementations tend to be very short (< 30 lines).

### Adding constraints

```js
var container = newton.BoxConstraint(0, 0, 100, 100);   // x, y, width, height
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
var spring = newton.Body();
var p1 = spring.Particle(-10, 0);
var p2 = spring.Particle(10, 0);

spring.SpringConstraint(p1, p2, 0.5);
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
var sim = newton.Simulator();
var display = document.getElementById('display');
var renderer = newton.GLRenderer(display);

var string = newton.Body();
var i = 7, last, current;
while (i--) {
  current = string.Particle(250 + i * 20, 10);
  if (last) string.DistanceConstraint(current, last);
  last = current;
}
string.PinConstraint(last);

renderer.render(sim);
renderer.viewport(0, 0, 500, 500);

sim.add(string);
sim.start();
```
[Try it out.](#)

Now things are getting interesting. Our little chain has come to life!

## Collisions

### Adding volumes

```js
var particles = [
  newton.Particle(0, 0),
  newton.Particle(10, 0),
  newton.Particle(10, 10),
  newton.Particle(0, 10)
];

var volume = newton.Volume(particles);
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
var material = newton.Material({
  mass: 1,
  friction: 0.5,
  restitution: 0.5
});
var particle = newton.Particle(0, 0, material);
```
Particles can optionally have a Material.
Materials impact the response of Particles during collisions.
They can make an object heavy, light, hard, soft, bouncy or inelastic.

Materials cascade - Simulation instances have a reasonable default material.
Bodies can have a material, which overrides the Simulation material.
Particles can also have materials, which overrides their Body material.

### Collisions demo

```js
var sim = newton.Simulator();
var display = document.getElementById('display');
var renderer = newton.GLRenderer(display);

function Shape(material) {
  newton.Body.call(this);
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

Shape.prototype = Object.create(newton.Body.prototype);

var rock = newton.Material({ mass: 3, friction: 1, restitution: 0 });
var plastic = newton.Material({ mass: 0.5, friction: 0.8, restitution: 0.5 });

for (var i = 0; i < 30; i++) {
  sim.add(new Shape(rock), 'rocks');
  sim.add(new Shape(plastic), 'plastics');
}

renderer.render(sim);
renderer.viewport(0, 0, 500, 500);

sim.add(newton.BoxConstraint(0, 0, 320, 200));
sim.add(newton.LinearGravity(0, 1, 1));
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
```
Instances of Simulator, Body, Particle, Constraint, and Volume all broadcast events.
For details about the events and their arguments, check the full API docs for those object types.

### Removing elements

```js
sim.remove(body);       // remove all Particles, Forces, and Constraints attached to this Body
sim.remove(particle);   // remove this Particle from the Simulation (and all Bodies in its chain)
body.remove(particle);
particle.remove();
```

### Creating custom body factories

```js
function SquishBody(x, y, r) {
  newton.Body.call(this);

  for (var p = 0; p < 10; p++) {
    var x1 = x + Math.cos(p / 10 * Math.PI * 2);
    var y1 = y + Math.sin(p / 10 * Math.PI * 2);
    this.add(newton.Particle(x1, y1));
  }
}

SquishBody.prototype = newton.Body;

var body = new SquishBody(0, 0, 20);
```

### Behavior demo

```js

```

## Interactivity

### Input

```js
var renderer = newton.GLRenderer();

renderer.on('pointerdown', function(x, y) {
  var body = sim.hitList(x, y)[0];
  if (body) body.remove();
});
```

## Output (custom renderers)

```js
var sim = newton.Simulator();

render();
sim.start();

function render() {
  var state = sim.getState();
  requestAnimationFrame(render);
}
```

### Interactivity demo
