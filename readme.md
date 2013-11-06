# Newton

An easy-to-use, feature-rich physics engine that's designed from the ground up for JavaScript.

```js
var renderer = Newton.Renderer(document.getElementById('display'));
var sim = Newton.Simulator(simulate, renderer.callback, 60);
var particles = Newton.Body();
var blackhole = Newton.RadialGravity(640, 225, 10, 2);
var accumulator = 0;

var particleLayer = sim.Layer();

particleLayer
  .addBody(particles)
  .addForce(Newton.LinearGravity(0, 0.001, 0))
  .addForce(blackhole)
  .wrapIn(Newton.Rectangle(0, 0, 1280, 450));

sim.start();

function simulate(time) {
  accumulator += time;
  blackhole.x = (blackhole.x + time * 0.5) % 1280;
  blackhole.y = 225 + Math.sin(blackhole.x / 100) * 120;
  while (accumulator > 250) {
    particles.addParticle(Newton.Particle(Math.random() * 1280, 10, Math.random() * 5 + 1));
    accumulator -= 250;
  }
}
```

See this
[simple demo](http://hunterloftis.github.io/newton/examples/simple) in action or check out
[more examples](#examples).

- [Installation](#installation)
- [Philosophy](#philosophy)
- [API Reference](#api-reference)
- [Examples](#examples)
- [The Nerdy Details](#the-nerdy-details)
- [Contributing](#contributing)
- [License](#license)

## Installation

**in the browser:**

```
$ bower install newton
```

Or, drop
[newton.js](https://raw.github.com/hunterloftis/newton/master/newton.js) or
[newton.min.js](https://raw.github.com/hunterloftis/newton/master/newton.min.js)
into your page with a `script` tag.

**in node.js:**

```
$ npm install newton --save
```

```js
var Newton = require('newton');
```

## Philosophy

I started Newton after struggling to find an engine
with a normal, simple JavaScript API that was also
powerful enough to complete a non-trivial HTML5 game with physics.

Until Newton, the best physics libraries available for JavaScript were
[Box2d](https://github.com/kripken/box2d.js/) and
[Chipmunk](https://github.com/josephg/Chipmunk-js) -
both of which are JS ports of very capable and popular C++ projects.
Unfortunately, these ports combine the clarity and conciseness of C++ with the speed of JavaScript.
[CoffeePhysics](https://github.com/soulwire/Coffee-Physics),
[Verlet-JS](https://github.com/subprotocol/verlet-js), and
[PhysicsJS](https://github.com/wellcaffeinated/PhysicsJS)
haven't supplanted these C-based libraries for various reasons.

A game-ready HTML5 physics engine should be:

- Written in and optimized for idiomatic JavaScript
- Easily orchestrated through a simple API
- Featureful for non-trivial games and simulations
- Designed with garbage collection in mind
- Decoupled from rendering
- Consistent across browsers and hardware
- Fluid, fast, stable, and predictable

Read all the [nerdy details](#the-nerdy-details) about how Newton accomplishes these goals.

Follow newton developments on twitter: [@hunterloftis](http://twitter.com/hunterloftis)

## API Reference

- The loop ([Overview](#theloop), [Simulator](#newtonsimulator), [Renderer](#newtonrenderer))
- Layers and bodies ([Overview](#layersandbodies), [Layer](#newtonlayer), [Body](#newtonbody), [Particle](#newtonparticle), [Edge](#newtonedge), [Material](#newtonmaterial))
- Constraints ([Overview](#constraints), [DistanceConstraint](#newtondistanceconstraint), [AngleConstraint](#newtonangleconstraint), [PinConstraint](#newtonpinconstraint))
- Forces ([Overview](#forces), [LinearGravity](#newtonlineargravity), [RadialGravity](#newtonradialgravity))
- Math Primitives ([Overview](#mathprimitives), [Vector](#newtonvector), [Rectangle](#newtonrectangle))

### The loop

At its core, Newton is a loop that periodically calls two callbacks: `simulate` and `render`.
`simulate` is called in regular time steps and should be used to add simulation logic, like
behaviors responding to user input. `render` is called as quickly as possible based on
RequestAnimationFrame and should be used to draw the scene in its current state.

#### Newton.Simulator

```js
var sim = Newton.Simulator(simulateFn, renderFn, simulationFps);
sim.start();
sim.stop();

function simulateFn(time, simulator) {}
function renderFn(time, simulator) {}
```

- simulateFn: Function, callback for simulation logic; optional
- renderFn: Function, callback for drawing the scene; optional
- simulationFps: Number, frames per second for the fixed time step; optional, defaults to 60

#### Newton.Renderer

You can render the scene however you like by providing a render function
that takes the arguments *(frameTimeInMs, simulator)*. However, it's often convenient to
have a default renderer for quick development. Newton provides two renderers:

One based on Canvas:

```js
// viewport - is a Canvas element
var renderer = Newton.Renderer(document.getElementById('viewport'));
var sim = Newton.Simulator(null, renderer.callback);
```

And based on WebGL (you will need to include [Pixi](https://github.com/GoodBoyDigital/pixi.js) library into web page):

```js
// viewport - is a Div element
var renderer = Newton.PixiRenderer(document.getElementById('viewport'), 800, 600);
var sim = Newton.Simulator(null, renderer.callback);
```

### Layers and bodies

A physics engine needs some sort of organization that allows you to group physical
entities into logical objects. Newton uses Layers and Bodies.

#### Newton.Layer

Layers control which Bodies collide with each other. Layers also provide a mechanism
for applying shared forces like gravity, wind, and explosions.

Created via `Simulator.Layer`.

```js
var envLayer = sim.Layer();
var fixedLayer = sim.Layer();
var playerLayer = sim.Layer();

envLayer                // shared forces like gravity
  .addForce(gravity);

fixedLayer              // responds to no forces, no collisions
  .respondTo([])
  .addBody(terrain);

playerLayer             // responds to forces and collisions on all layers
  .addBody(player)
  .respondTo([playerLayer, fixedLayer, envLayer]);

```

By default, Layers respond to themselves, eg: `layer.respondTo([layer])`.

#### Newton.Body

Bodies group related Particles, Edges, and Constraints together into logical entities.
The player's character in a game, a vehicle, and a bridge could all be represented as
instances of Body.

```js
var body = Newton.Body();

body
  .addParticle(particle)
  .addEdge(edge);
```

#### Newton.Particle

All physics in newton are based on simple Particles.

```js
var particle = Newton.Particle(x, y, size, material);
```

- x: Number
- y: Number
- size: Number; optional, default = 1, typical range = 1 - 10
- material: Number; optional, default = bodymaterial || Material.simple

#### Newton.Edge

An Edge is a one-way wall.
Each end of an Edge is attached to a Particle.

The direction of the Edge controls which side is passable and which side is blocked.
If you define a shape clockwise, the edge will point outwards.
For example, an Edge from (0, 0) to (100, 0) will act as a floor,
while an Edge from (100, 0) to (0, 0) will act as a ceiling.

```js
var edge = Newton.Edge(fromParticle, toParticle, material);
```

- fromParticle: [Newton.Particle](#newtonparticle)
- toParticle: [Newton.Particle](#newtonparticle)
- material: [Newton.Material](#newtonmaterial); optional, default = Body material || Material.simple

#### Newton.Material

Materials determine how objects move (mass, drag) and how colliding objects react.

```js
var material = Newton.Material({
  weight: 2,
  restitution: 0.5,
  friction: 0.2,
  maxVelocity: 50
});

var body = Newton.Body(material);   // default for contained Particles and Edges
var particle = Newton.Particle(0, 0, 1, material);  // overrides Body value
```

- weight: Number, multiplier for a Particle's mass (0 .. N); optional, default = 1
- restitution: Number, bounciness of a Particle (0 .. 1); optional, default = 1
- friction: Number, roughness of an Edge; optional (0 .. 1), default = 0
- maxVelocity: Number, determines drag and terminal velocity (0 .. 1000); optional, default = 100

### Constraints

Sometimes you need to constrain a Particle's range of motion.
You may want two Particles to stay a certain distance apart, or to maintain a particular angle of separation.
With Constraints, you can compose Particles and Edges into more complex structures like boxes, ropes, and wheels.

Constraints can be applied between Particles of the same Body
or between Particles on different Bodies.
For example, you may want to build a fabric Body
using a mesh of Particles with Distance constraints,
but you might also use a Distance constraint to connect the fabric to a different Body.

#### Particle.DistanceConstraint

A DistanceConstraint keeps two particles at a specified distance from one another.
The constraint behaves like a spring but can also be hard, like a metal girder, with a high stiffness.
Ropes, bridges, and fabric can all be made with DistanceConstraints.

DistanceConstraints can optionally be set to break under sufficient pulling force.

```js
var constraint = particle.DistanceConstraint(toParticle, distance, stiffness, strength);
```

- toParticle: [Particle](#newtonparticle)
- distance: Number, the target distance between the two Particles
- stiffness: Number, lower is more springy higher is more stiff; optional, default = 1, reasonable = 0.1 - 2
- strength: Number, breaking tensile strength; optional, default = 0 (unbreakable), reasonable = 0 - 100

#### Particle.AngleConstraint

An AngleConstraint keeps two particles (anchors) at a specified angle from each other with respect to a third particle.
AngleConstraints can be used in conjunction with DistanceConstraints to construct objects like
boxes, ragdolls, polygons, and wheels.

```js
var constraint = particle.AngleConstraint(anchor1, anchor2, angle, stiffness, strength);
```

- anchor1: [Particle](#newtonparticle)
- anchor2: [Particle](#newtonparticle)
- angle: Number, radians of the angle between anchor1 and anchor2
- stiffness: Number, lower is more springy higher is more stuff; optional, default = 1, reasonable = 0.1 - 2
- strength: Number, breaking rotational strength; optional, default = 0 (unbreakable), reasonable = 0 - 100

#### Newton.PinConstraint

A PinConstraint keeps a particle fixed in place regardless of outside forces.

Optionally, a breaking strength can be supplied to destroy the constraint.
Otherwise, the PinConstraint is unbreakable.

```js
var constraint = particle.PinConstraint(x, y, strength);
```

- x: Number
- y: Number
- strength: Number, breaking strength; optional, default = 0 (unbreakable), reasonable = 0 - 100

### Forces

Forces and impulses (force * time) can be applied via methods, but can also be represented
as objects in the scene. For example, instead of manually applying gravity as a force
each frame, it's convenient to attach a LinearGravity instance to a Layer in the Simulation.

#### applyImpulse

`applyImpulse(force, direction, time)`

Impulses allow programmatic, time-based changes to the velocities of Bodies and Particles.
They're the 'verb' form of forces.

```js
particle.applyImpulse(0.025, 0, 100);       // apply an impulse to a single Particle
body.applyImpulse(0.1, Math.PI * 0.5, 16);  // applies to all Particles in this Body
```

#### LinearGravity

Adding a LinearGravity instance to a Layer creates a force that's exerted on all
Particles in that Layer (and in Layers that [respondTo](#newtonlayer) that layer).

```js
var gravity = new LinearGravity(force, direction);

layer.addForce(gravity);
```

- force: strength of the gravity
- direction: angle in radians (0 = down)

#### RadialGravity

#### LinearForce

#### RadialForce

### Math primitives

#### Newton.Vector

#### Newton.Rectangle

## Examples

- [Simple - Canvas](http://hunterloftis.github.io/newton/examples/simple)
- [Particles - WebGL / Pixi](http://hunterloftis.github.io/newton/examples/particles)
- [node.js - Simple](https://github.com/hunterloftis/newton/blob/master/examples/node/simple.js)

## The nerdy details

Physics major?
Game programmer?
Browser performance wizard?
Like to argue about Euler vs. Verlet vs. RK4?
This is for you.

### Verlet integration

Under the hood, Newton.js uses the simple and stable
[verlet method](http://www.gamedev.net/page/resources/_/technical/math-and-physics/a-verlet-based-approach-for-2d-game-physics-r2714)
to integrate Newton's equations of motion.

### Decoupled simulation

JavaScript physics engines must deal with a wide variety of unstable framerates,
simulation complexities,
browsers, and hardware. To deliver consistent simulations in different scenarios, Newton uses a
[render-independent fixed-time simulation step](http://gafferongames.com/game-physics/fix-your-timestep/).

The render step runs as quickly as possible via RequestAnimationFrame while the simulation runs at a separate,
fixed interval via a time accumulator. This keeps Newton smooth, fast, and stutter-free.

### Arbitrary renderer

Newton comes with a simple built-in canvas renderer for development and experimentation but allows
you to render any way you like - including Canvas, WebGL, SVG, and CSS. Newton can even run simulations
in node.js!

### Garbage collector-friendly

Newton's 2D Vector class uses mutable operations by default to avoid flooding the garbage
collector with extraneous objects. Garbage-collector abuse is an issue with most JS physics engines,
including
[Chipmunk](https://groups.google.com/forum/#!topic/v8-users/e9HNSVoovEU) and
[Box2d](https://www.scirra.com/blog/76/how-to-write-low-garbage-real-time-javascript).

## License

(The MIT License)

Copyright (c) 2013 Hunter Loftis &lt;hunterloftis@hunterloftis.com&gt;

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
