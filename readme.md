# Newton

A playful, particle-based physics engine designed from the ground up for JavaScript.

## Reboot

I'm rebooting Newton.

A lot of folks have been excited by playing with this library -
it introduces some new things to the JS physics landscape:
fast soft-body simulation with a simple API and decoupled rendering.

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

## Roadmap

- [x] [Getting started guide](blob/master/docs/guide.md)
- [ ] Feature completeness with getting started guide demos
- [ ] Unit tests
- [ ] API docs
- [ ] Performance benchmarks
- [ ] Shape Constraint (rigid bodies)
- [ ] Registration Points (for custom rendering)
- [ ] Web Workers (offloading from the main CPU)

## Contributing quick start

`make watch && open examples/guide_movement.html`

- `make watch`: builds into `build/newton.js` and watches for changes
- `make test`: runs unit tests
- `make dist`: builds a minified distribution version
