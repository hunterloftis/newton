# Newton

A playful, particle-based physics engine designed from the ground up for JavaScript.

[![Build Status](https://travis-ci.org/hunterloftis/newton.svg?branch=master)](https://travis-ci.org/hunterloftis/newton)

## Reboot

Newton is getting a reboot.

A lot of folks have been excited by playing with this library -
it introduces some new things to the JS physics landscape:

- blazing fast
- soft bodies
- simple API
- decoupled rendering
- deterministic

However, I've been a bad project maintainer.
Partly I've been busy, and partly Newton grew unwieldy and
difficult to maintain.

So instead of leaving it in shambles, I'm rebooting Newton
from the ground up, focusing on maintainability:

- documentation
- automated tests
- minimal API
- a roadmap

If you'd like to help, please get in touch!
[@hunterloftis](http://twitter.com/hunterloftis)

## Demos

- [Drawing a particle](http://hunterloftis.github.io/newton/examples/guide_basics.html)
- [A rope](http://hunterloftis.github.io/newton/examples/guide_movement.html)

## Roadmap

- ☑ [Getting started guide](https://github.com/hunterloftis/newton/blob/master/docs/guide.md)
- ◻ Feature completeness with getting started guide demos
- ◻ Unit tests
- ◻ API docs
- ◻ Performance benchmarks
- ◻ Shape Constraint (rigid bodies)
- ◻ Registration Points (for custom rendering)
- ◻ Web Workers (offloading from the main CPU)

## Contributing quick start

`make build && open examples/guide_movement.html`

- `make watch`: builds into `build/newton.js` and watches for changes
- `make test`: runs unit tests
- `make dist`: builds a minified distribution version

