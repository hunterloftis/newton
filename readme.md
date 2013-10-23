# What is Newton?

Newton is an easy-to-use, feature-rich physics engine that's designed from the ground up for JavaScript.

[Quick Start](http://www.google.com)

```
$ bower install newton
```

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

See this [simple demo](http://www.google.com) in action.

## State of the art

Until Newton, the best physics libraries available for JavaScript were
[Box2d](https://github.com/kripken/box2d.js/) and
[Chipmunk](https://github.com/josephg/Chipmunk-js) -
both of which are automated ports of very capable and popular C++ projects.
Unfortunately, these ports combine the clarity and conciseness of C++ with the speed of JavaScript.
Still,
[CoffeePhysics](https://github.com/soulwire/Coffee-Physics),
[Verlet-JS](https://github.com/subprotocol/verlet-js), and
[PhysicsJS](https://github.com/wellcaffeinated/PhysicsJS)
have failed to match the clunkier but more effective C-based simulators.

## Nerdy details

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


