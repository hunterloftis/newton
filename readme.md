# Newton

An easy-to-use, feature-rich physics engine that's designed from the ground up for JavaScript.

```js
var renderer = new Newton.Renderer(document.getElementById('viewport'));
var sim = new Newton.Simulator(simulate, renderer, 60);
var particles = new Newton.Body();

var particleLayer = sim.createLayer();

particleLayer
  .addBody(particles)
  .addForce(new Newton.LinearGravity(Math.PI * 0.5, 0.01, 0))
  .wrapIn(new Newton.Rectangle(0, 0, 640, 480));

sim.start();

function simulate(time) {
  while (time--) {
    particles.addParticle(new Newton.Particle(Math.random() * 640, 0));
  }
}
```

See this [simple demo](http://www.google.com) in action or check out [more examples](http://www.google.com).

## Installation

```
$ bower install newton
```

## Philosophy

Until Newton, the best physics libraries available for JavaScript were
[Box2d](https://github.com/kripken/box2d.js/) and
[Chipmunk](https://github.com/josephg/Chipmunk-js) -
both of which are JS ports of very capable and popular C++ projects.
Unfortunately, these ports combine the clarity and conciseness of C++ with the speed of JavaScript.
Still,
[CoffeePhysics](https://github.com/soulwire/Coffee-Physics),
[Verlet-JS](https://github.com/subprotocol/verlet-js), and
[PhysicsJS](https://github.com/wellcaffeinated/PhysicsJS)
have failed to supplant these clunky libraries.

A game-ready HTML5 physics engine should be:

- Written in and optimized for idiomatic JavaScript
- Designed with garbage collection in mind
- Decoupled from rendering
- Consistent across browsers and hardware
- Fluid and without stutter
- Stable, fast, and predictable

Read all the [nerdy details](http://www.google.com).

## Quick Start

### The loop

At its core, Newton is a loop that periodically calls two callbacks: `simulate` and `render`.
`simulate` is called in regular time steps and should be used to add simulation logic, like
behaviors responding to user input. `render` is called as quickly as possible based on
RequestAnimationFrame and should be used to draw the scene in its current state.

#### Newton.Simulator

```js
var sim = new Newton.Simulator(simulateFn, renderFn, simulationFps);
sim.start();
sim.stop();

function simulateFn(time, simulator) {}
function renderFn(time, simulator) {}
```

- simulateFn: optional callback for simulation logic
- renderFn: optional callback for drawing the scene
- simulationFps: optional number of frames per second for the fixed time step. defaults to 60.

#### Newton.Renderer

You can render the scene however you like by providing a render function
that takes the arguments *(frameTimeInMs, simulator)*. However, it's often convenient to
have a default renderer for quick development. Newton provides one based on Canvas:

```js
var renderer = new Newton.Renderer(document.getElementById('viewport'));
var sim = new Newton.Simulator(null, renderer);
```

### Layers and bodies

A physics engine needs some sort of organization that allows you to group logically
related entities and to tie external actors to simulated objects. Newton uses Layers
and Bodies.

#### Newton.Layer

Layers control which Bodies collide with each other. Layers also provide a mechanism
for applying shared forces like gravity, wind, and explosions.

Created via `Simulator.createLayer`.

```js
var envLayer = sim.createLayer();
var fixedLayer = sim.createLayer();
var playerLayer = sim.createLayer();

envLayer                // shared forces like gravity
  .addForce(gravity);

fixedLayer              // responds to no forces, no collisions
  .watch([])
  .addBody(terrain);

playerLayer             // responds to forces and collisions on all layers
  .addBody(player)
  .watch([playerLayer, fixedLayer, envLayer]);

```

#### Newton.Body

Bodies group related Particles, Edges, and Constraints together into logical entities.
The player's character in a game, a vehicle, and a bridge could all be represented as
instances of Body.

### Forces

#### LinearGravity

#### RadialGravity

### Math primitives

#### Newton.Vector

#### Newton.Rectangle

## Examples

## The nerdy details

Physics major?
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

