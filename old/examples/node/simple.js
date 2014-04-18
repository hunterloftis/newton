var Newton = require('../../newton.js');

var sim = Newton.Simulator(simulate, undefined, 60);
var particleBody = Newton.Body();
var blackhole = Newton.RadialGravity(640, 225, 10, 2);
var accumulator = 0;

var particleLayer = sim.Layer();

particleLayer
  .addBody(particleBody)
  .addForce(Newton.LinearGravity(0, 0.001, 0))
  .addForce(blackhole)
  .wrapIn(Newton.Rectangle(0, 0, 1280, 450));

sim.start();

function simulate(time) {
  accumulator += time;
  blackhole.x = (blackhole.x + time * 0.5) % 1280;
  blackhole.y = 225 + Math.sin(blackhole.x / 100) * 120;
  while (accumulator > 250) {
    particleBody.addParticle(Newton.Particle(Math.random() * 1280, 10, Math.random() * 5 + 1));
    console.log('particles:', particleBody.particles.length);
    accumulator -= 250;
  }
}
