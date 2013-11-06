# Newton

An easy-to-use, feature-rich physics engine that's designed from the ground up for JavaScript.

[API Reference](https://github.com/hunterloftis/newton/blob/master/docs.md)

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

## Contributing

Contributions are very welcome.
After you clone the repository, `make setup` will install npm and bower.
Then, `make dev` will watch the src directory and rebuild newton.js on changes.
Time from time use `make bench` to see benchmarks results.

## License

(The MIT License)

Copyright (c) 2013 Hunter Loftis &lt;hunterloftis@hunterloftis.com&gt;

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
