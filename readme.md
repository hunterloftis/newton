# Newton

Newton is a fast, powerful, easy-to-use soft-body physics engine
designed from the ground up for JavaScript.

```js
var sim = newton.Simulator()
  .add(newton.LinearForce(0, 1))              // gravity
  .add(newton.SquishBody(0, 0, 50, 10))       // falling object
  .add(newton.BoxConstraint(0, 0, 400, 480))  // container
  .start();

var display = document.getElementById('display');
var renderer = newton.GLRenderer(display).render(sim);
```

[Check out this example](#) or [see other examples.](#)

- **Soft bodies** - Newton is based on verlet particle integration,
which enables *deformation and destruction* and thus better simulation
of fabric, fluids, and organic characters than
traditional rigid-body engines.
- **Fixed-time** - Newton's simulator runs in a fixed-interval time accumulator,
separate from the renderer. This keeps rendering smooth and fast while
ensuring that simulations will be *identical and repeatable*
even across different machines.
- **Arbitrary renderer** - Newton comes with a WebGL-based debug renderer,
but allows you to render any way you like including Canvas, SVG, or on the DOM.
It can also run simulations in node.js.
- **Web workers** - Physics have *almost zero CPU cost* because
Newton runs on a web-worker thread in the background.

[Learn how to use Newton in your own project.](docs/guide.md)

## Installation

### in the browser:

```
bower install newton
```

*Or, drop
[newton.js](https://raw.github.com/hunterloftis/newton/master/newton.js) or
[newton.min.js](https://raw.github.com/hunterloftis/newton/master/newton.min.js)
into your page with a `script` tag.*

### in node.js:

```
npm install newton --save
```

```js
var newton = require('newton');
```

## Documentation

- Users
  - **[Getting started guide](docs/guide.md)**
  - **[Complete API reference](#)**
  - [Examples](#)
  - [Comparison with other physics engines](docs/comparison.md)
- Contributors
  - [Under the hood](#)
  - [Motivation and philosophy](#)
  - [How and what to contribute](#)
- Simulation topics
  - [Deformation and destruction](#)
  - [Explosions](#)
  - [Characters and enemies](#)
  - [DOM rendering](#)
  - [Fluids and particle effects](#)
  - [Rigid vs deformable bodies](#)
  - [Mechanics (springs, axles, etc)](#)
  - [Multi-user simulations with node.js](#)

## License

(The MIT License)

Copyright (c) 2014 Hunter Loftis [&lt;hunterloftis@hunterloftis.com&gt;](mailto:hunter@hunterloftis.com)

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
