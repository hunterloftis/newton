var Newton = require('../newton.js');
var TestDuration = 100;

module.exports = function(particlesCount, deferred) {
    var sim = Newton.Simulator(simulate, undefined, 60);
    var particles = Newton.Body();
    var accumulator = 0;
    var particleLayer = sim.Layer();

    for (var i = 0; i < particlesCount; ++i) {
        particles.addParticle(Newton.Particle(Math.random() * 1280, 10, Math.random() * 5 + 1));
    }

    particleLayer
        .addBody(particles)
        .addForce(Newton.LinearGravity(0, 0.001, 0))
        .wrapIn(Newton.Rectangle(0, 0, 1280, 450));

    sim.start();

    function simulate(time) {
        accumulator += time;
        if (accumulator > TestDuration) {
            sim.stop();
            deferred.resolve();
        }
    }
};
