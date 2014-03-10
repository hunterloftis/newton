# Getting Started with Newton

## Creating a simulation

```js
var sim = newton.Simulator();
sim.start();
```

## Adding particles

```js
var particle = newton.Particle(10, 20);  // x = 10, y = 20
sim.add(particle);
```

## Rendering

```js
var display = document.getElementById('display');
var renderer = newton.GLRenderer(display).render(sim);
```

## Adding forces

```js
var gravity = newton.LinearForce(0, 1);
sim.add(gravity);
```

## Adding constraints

```js
var container = newton.BoxConstraint(0, 0, 100, 100);
sim.add(container);
```

## Grouping into bodies

```js
var body = newton.Body();
var p1 = body.Particle(-10, 0);
var p2 = body.Particle(10, 0);

body.SpringConstraint(p1, p2, 0.5);
sim.add(body);
```

```js
var p1 = newton.Particle(-10, 0);
var p2 = newton.Particle(10, 0);
var spring = newton.SpringConstraint(p1, p2, 0.5);
var body = newton.Body();

body.add(p1, p2, spring);
sim.add(body);
```

## Handling collisions

```js
var particles = [
  newton.Particle(0, 0),
  newton.Particle(10, 0),
  newton.Particle(10, 10),
  newton.Particle(0, 10)
];

var volume = newton.Volume(particles);
```

## Separating with layers

```js
sim
  .add(rain, 'background')
  .add(platform, 'foreground')
  .add(character, 'foreground');

```
## Listening to events

```js
sim
  .on('step', function(time) {

  })
  .on('collision', function(v1, v2) {

  });
```

## Removing elements

```js
sim.remove(body);
```

```js
sim.remove(particle);
```

```js
body.remove(particle);
```

```js
particle.remove();
```

## Creating custom body factories

```js
function SquishBody(x, y, r) {
  newton.Body.call(this);

  var particles = [];
  for (var p = 0; p < 10; p++) {
    var x1 = x + Math.cos(p / 10 * Math.PI * 2);
    var y1 = y + Math.sin(p / 10 * Math.PI * 2);
    particles.push(newton.Particle(x1, y1));
  }
  this.add(particles);
}

SquishBody.prototype = newton.Body;

var body = new SquishBody(0, 0, 20);
```

## Adding interactivity

```js
var renderer = newton.GLRenderer();

renderer.on('pointerdown', function(x, y) {
  var bodies = sim.hitList(x, y);
  var body = bodies[0];
  if (!body) return;

  body.remove();
});
```

## Using a custom renderer

```js
var sim = newton.Simulator();

render();
sim.start();

function render() {
  var state = sim.getState();
  requestAnimationFrame(render);
}
```

## Putting it all together
