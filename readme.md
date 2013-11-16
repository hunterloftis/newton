# Newton

An easy-to-use, feature-rich physics engine that's designed from the ground up for JavaScript.

```js
var $display = $('#display'),
    width = $display.width(),
    height = $display.height();

var renderer = Newton.GLRenderer($display[0]),
    sim = Newton.Simulator(simulate, renderer.callback, 60, 10);

var particleMaterial = Newton.Material(),
    particles = Newton.Body(particleMaterial),
    gravity = Newton.LinearGravity(0, 0.001, 0),
    radial = Newton.RadialGravity(0, 0, -4, 2),
    container = Newton.BoxConstraint(0, 0, width, height);

sim
  .add(gravity)
  .add(particles)
  .add(radial)
  .add(container)
  .start();

function simulate(time) {
  // Custom behavior
}

```

Check out [examples](#examples)
or the [API Reference](https://github.com/hunterloftis/newton/blob/master/docs.md).

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

- [Particles - WebGL](http://hunterloftis.github.io/newton/examples/particles)
- [Constraints - Canvas](http://hunterloftis.github.com/newton/examples/constraints)
- [node.js - Simple](https://github.com/hunterloftis/newton/blob/master/examples/node/simple.js)

## Contributing

Contributions are very welcome. You'll need:

- node &amp; npm
- grunt

Common tasks are handled by the makefile:

- `make setup` installs node modules, bower, and bower modules
- `make dev` watches /src for changes, rebuilding newton.js

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
