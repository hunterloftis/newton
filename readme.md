# What is Newton?

Newton is an easy-to-use, feature-rich physics engine that's designed from the ground up for JavaScript.

## JS Physics needs a refresh

The best physics libraries available for JavaScript are still
[Box2d](https://github.com/kripken/box2d.js/) and
[Chipmunk](https://github.com/josephg/Chipmunk-js) -
both of which are automated ports from very capable and popular C++ projects.
Unfortunately, the JS ports combine the clarity and conciseness of C++ with the speed of JavaScript.
Other libraries like
[CoffeePhysics](https://github.com/soulwire/Coffee-Physics),
[Verlet-JS](https://github.com/subprotocol/verlet-js), and
[PhysicsJS](https://github.com/wellcaffeinated/PhysicsJS)
are too limited or slow for non-trivial games and simulations, so they see almost no production use.

## Nerdy details

### Verlet integration

Under the hood, Newton uses the simple and stable
[verlet method](http://www.gamedev.net/page/resources/_/technical/math-and-physics/a-verlet-based-approach-for-2d-game-physics-r2714)
to integrate the equations of motion.

### Decoupled render and simulation steps

JavaScript physics engines must deal with a variety of framerates, simulation complexities,
browsers, and hardware. To deliver smooth performance across many scenarios, Newton uses a
[render-independent fixed-time simulation step](http://gafferongames.com/game-physics/fix-your-timestep/).

The render step runs as quickly as possible via RequestAnimationFrame, while the simulation runs at a separate, fixed interval via a time
accumulator. This maintains a consistent, smooth simulation across a wide variety of
framerates, simulation complexities, browsers, and hardware.

### Arbitrary renderer

Newton allows you to use any renderer you like, but comes with a simple built-in canvas renderer
for development and experimentation. 
