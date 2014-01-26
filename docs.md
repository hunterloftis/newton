# Newton

(I've taken a new job at Recurly and moved across the country to San Francisco... updates will be slow, but I'll get to them!)

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
