!function(Newton) {
    "use strict";
    function AngleConstraint(p1, axis, p2, stiffness, angle) {
        return this instanceof AngleConstraint ? (this.axis = axis, this.p1 = p1, this.p2 = p2, 
        this.angle = "undefined" == typeof angle ? this.getAngle() : angle, this.stiffness = stiffness || 1, 
        this.isDestroyed = !1, void 0) : new AngleConstraint(p1, axis, p2, stiffness, angle);
    }
    Math.PI, 2 * Math.PI, AngleConstraint.prototype.category = "angular", AngleConstraint.prototype.priority = 6, 
    AngleConstraint.prototype.getAngle = function() {
        var p1 = this.p1.position.pool().sub(this.axis.position), p2 = this.p2.position.pool().sub(this.axis.position), angle = p1.getAngleTo(p2);
        return p1.free(), p2.free(), angle;
    }, AngleConstraint.prototype.resolve = function() {
        if (this.p1.isDestroyed || this.p2.isDestroyed || this.axis.isDestroyed) return this.isDestroyed = !0, 
        void 0;
        var diff = this.angle - this.getAngle();
        diff <= -Math.PI ? diff += 2 * Math.PI : diff >= Math.PI && (diff -= 2 * Math.PI), 
        diff *= -.25 * this.stiffness, this.p1.pinned || this.p1.position.rotateAbout(this.axis.position, diff), 
        this.p2.pinned || this.p2.position.rotateAbout(this.axis.position, -diff), this.axis.pinned || (this.axis.position.rotateAbout(this.p1.position, diff), 
        this.axis.position.rotateAbout(this.p2.position, -diff));
    }, Newton.AngleConstraint = AngleConstraint;
}("undefined" == typeof exports ? this.Newton = this.Newton || {} : exports), function(Newton) {
    "use strict";
    function BoxConstraint(left, top, right, bottom, particles) {
        return this instanceof BoxConstraint ? (this.rect = Newton.Rectangle(left, top, right, bottom), 
        this.particles = particles, void 0) : new BoxConstraint(left, top, right, bottom, particles);
    }
    BoxConstraint.prototype.category = "boxconstraint", BoxConstraint.prototype.priority = 0, 
    BoxConstraint.prototype.addTo = function(simulator) {
        simulator.addConstraints([ this ]);
    }, BoxConstraint.prototype.resolve = function(time, allParticles) {
        for (var particles = this.particles || allParticles, i = -1, len = particles.length; ++i < len; ) particles[i].contain(this.rect);
    }, Newton.BoxConstraint = BoxConstraint;
}("undefined" == typeof exports ? this.Newton = this.Newton || {} : exports), function(Newton) {
    "use strict";
    function DistanceConstraint(p1, p2, stiffness, distance) {
        return this instanceof DistanceConstraint ? (this.p1 = p1, this.p2 = p2, this.stiffness = stiffness || 1, 
        this.distance = "undefined" == typeof distance ? this.getDistance() : distance, 
        this.isDestroyed = !1, void 0) : new DistanceConstraint(p1, p2, stiffness, distance);
    }
    DistanceConstraint.prototype.category = "linear", DistanceConstraint.prototype.priority = 4, 
    DistanceConstraint.prototype.getDistance = function() {
        return Newton.Vector.getDistance(this.p1.position, this.p2.position);
    }, DistanceConstraint.prototype.resolve = function() {
        if (this.p1.isDestroyed || this.p2.isDestroyed) return this.isDestroyed = !0, void 0;
        var pos1 = this.p1.position, pos2 = this.p2.position, delta = pos2.pool().sub(pos1), length = delta.getLength(), invmass1 = 1 / this.p1.getMass(), invmass2 = 1 / this.p2.getMass(), factor = (length - this.distance) / (length * (invmass1 + invmass2)) * this.stiffness, correction1 = delta.pool().scale(factor * invmass1), correction2 = delta.scale(-factor * invmass2);
        this.p1.correct(correction1), this.p2.correct(correction2), delta.free(), correction1.free();
    }, DistanceConstraint.prototype.getCoords = function() {
        return {
            x1: this.p1.position.x,
            y1: this.p1.position.y,
            x2: this.p2.position.x,
            y2: this.p2.position.y
        };
    }, Newton.DistanceConstraint = DistanceConstraint;
}("undefined" == typeof exports ? this.Newton = this.Newton || {} : exports), function(Newton) {
    "use strict";
    function RigidConstraint(particles, iterations) {
        return this instanceof RigidConstraint ? (this.particles = particles, this.deltas = this.getDeltas(), 
        void 0) : new RigidConstraint(particles, iterations);
    }
    RigidConstraint.prototype.category = "", RigidConstraint.prototype.priority = 2, 
    RigidConstraint.prototype.getCenterMass = function() {
        for (var i = -1, len = this.particles.length, center = Newton.Vector(0, 0); ++i < len; ) center.add(this.particles[i].position);
        return center.scale(1 / len), center;
    }, RigidConstraint.prototype.getDeltas = function() {
        for (var center = this.getCenterMass(), i = -1, len = this.particles.length, deltas = Array(len); ++i < len; ) deltas[i] = this.particles[i].position.clone().sub(center);
        return deltas;
    }, RigidConstraint.prototype.resolve = function() {
        for (var center = this.getCenterMass(), angleDelta = 0, i = -1, len = this.particles.length; ++i < len; ) {
            var currentDelta = this.particles[i].position.clone().sub(center), targetDelta = this.deltas[i];
            angleDelta += currentDelta.getAngleTo(targetDelta);
        }
        for (angleDelta /= len, i = -1; ++i < len; ) {
            var goal = this.deltas[i].clone().rotateBy(-angleDelta).add(center), diff = goal.sub(this.particles[i].position);
            this.particles[i].position.add(diff.scale(.5));
        }
    }, Newton.RigidConstraint = RigidConstraint;
}("undefined" == typeof exports ? this.Newton = this.Newton || {} : exports), function(Newton) {
    "use strict";
    function mod(a, b) {
        return (a % b + b) % b;
    }
    function WrapConstraint(left, top, right, bottom, particles) {
        return this instanceof WrapConstraint ? (this.rect = Newton.Rectangle(left, top, right, bottom), 
        this.particles = particles, this.layer = void 0, void 0) : new WrapConstraint(left, top, right, bottom, particles);
    }
    WrapConstraint.prototype.category = "WrapConstraint", WrapConstraint.prototype.priority = 0, 
    WrapConstraint.prototype.addTo = function(simulator, layer) {
        simulator.addConstraints([ this ]), this.layer = layer;
    }, WrapConstraint.prototype.resolve = function(time, allParticles) {
        for (var particle, pos, particles = this.particles || allParticles, i = -1, len = particles.length, rect = this.rect; ++i < len; ) if (pos = particles[i].position, 
        pos.x < rect.left || pos.x > rect.right || pos.y < rect.top || pos.y > rect.bottom) {
            particle = particles[i];
            var newX = mod(particle.position.x, this.rect.width) + this.rect.left, newY = mod(particle.position.y, this.rect.height) + this.rect.top;
            particle.shiftTo(newX, newY);
        }
    }, Newton.WrapConstraint = WrapConstraint;
}("undefined" == typeof exports ? this.Newton = this.Newton || {} : exports), function(Newton) {
    "use strict";
    function Body(material) {
        return this instanceof Body ? (this.particles = [], this.edges = [], this.constraints = [], 
        this.material = material, this.simulator = void 0, this.layer = void 0, this.isFree = !1, 
        void 0) : new Body(material);
    }
    Body.prototype.addTo = function(simulator, layer) {
        if (this.simulator) throw new Error("Not implemented: reparenting a body");
        simulator.addParticles(this.particles), simulator.addEdges(this.edges), simulator.addConstraints(this.constraints), 
        this.simulator = simulator, this.layer = layer;
        for (var i = 0, ilen = this.particles.length; ilen > i; i++) this.particles[i].layer = layer;
        for (var i = 0, ilen = this.edges.length; ilen > i; i++) this.edges[i].layer = layer;
    }, Body.prototype.free = function() {
        this.isFree = !0, this.simulator && this.simulator.addCollisionParticles(this.particles);
    }, Body.prototype.addParticle = function(particle) {
        this.particles.push(particle), particle.layer = this.layer, this.simulator && (this.simulator.addParticles([ particle ]), 
        this.isFree && this.simulator.addCollisionParticles([ particle ]));
    }, Body.prototype.Particle = function() {
        var particle = Newton.Particle.apply(Newton.Particle, Array.prototype.slice.call(arguments));
        return this.addParticle(particle), particle;
    }, Body.prototype.addEdge = function(edge) {
        this.edges.push(edge), edge.layer = this.layer, this.simulator && this.simulator.addEdges([ edge ]);
    }, Body.prototype.Edge = function() {
        var edge = Newton.Edge.apply(Newton.Edge, Array.prototype.slice.call(arguments));
        return this.addEdge(edge), edge;
    }, Body.prototype.addConstraint = function(constraint) {
        this.constraints.push(constraint), this.simulator && this.simulator.addConstraints([ constraint ]);
    }, Body.prototype.DistanceConstraint = function() {
        var constraint = Newton.DistanceConstraint.apply(Newton.DistanceConstraint, Array.prototype.slice.call(arguments));
        return this.addConstraint(constraint), constraint;
    }, Body.prototype.RigidConstraint = function() {
        var constraint = Newton.RigidConstraint.apply(Newton.RigidConstraint, Array.prototype.slice.call(arguments));
        return this.addConstraint(constraint), constraint;
    }, Body.prototype.AngleConstraint = function() {
        var constraint = Newton.AngleConstraint.apply(Newton.AngleConstraint, Array.prototype.slice.call(arguments));
        return this.addConstraint(constraint), constraint;
    }, Newton.Body = Body;
}("undefined" == typeof exports ? this.Newton = this.Newton || {} : exports), function(Newton) {
    "use strict";
    function Edge(p1, p2, material) {
        return this instanceof Edge ? (this.p1 = p1, this.p2 = p2, this.material = material || Newton.Material.simple, 
        this.compute(), this._rect = new Newton.Rectangle(0, 0, 0, 0), this.layer = void 0, 
        void 0) : new Edge(p1, p2, material);
    }
    Edge.COLLISION_TOLERANCE = .5, Edge.getAbc = function(x1, y1, x2, y2) {
        var a = y2 - y1, b = x1 - x2, c = a * x1 + b * y1;
        return {
            a: a,
            b: b,
            c: c
        };
    }, Edge.prototype.compute = function() {
        this.anchor = this.p1.position.clone(), this.vector = this.p2.position.clone().sub(this.p1.position), 
        this.length = this.vector.getLength(), this.angle = this.vector.getAngle(), this.normal = this.vector.clone().turnLeft().unit(), 
        this.unit = this.vector.clone().unit(), this.bounds = Newton.Rectangle.fromVectors(this.p1.position, this.p2.position).expand(Edge.COLLISION_TOLERANCE);
    }, Edge.prototype.getCoords = function() {
        return {
            x1: this.p1.position.x,
            y1: this.p1.position.y,
            x2: this.p2.position.x,
            y2: this.p2.position.y
        };
    }, Edge.prototype.getProjection = function(vector) {
        var dot = this.vector.getDot(vector);
        return this.unit.clone().scale(dot);
    }, Edge.prototype.getAngleDelta = function(vector) {
        return this.angle - vector.getAngle();
    }, Edge.prototype.getAbc = function() {
        return Edge.getAbc(this.p1.position.x, this.p1.position.y, this.p2.position.x, this.p2.position.y);
    }, Edge.prototype.findIntersection = function(v1, v2) {
        var x1 = v1.x, y1 = v1.y, x2 = v2.x, y2 = v2.y, dot = Newton.Vector.scratch.set(x2 - x1, y2 - y1).getDot(this.normal);
        if (dot >= 0) return !1;
        var bounds1 = this.bounds, bounds2 = this._rect.set(x1, y1, x2, y2).expand(Edge.COLLISION_TOLERANCE);
        if (!bounds1.overlaps(bounds2)) return !1;
        var l1 = this.getAbc(), l2 = Edge.getAbc(x1, y1, x2, y2), det = l1.a * l2.b - l2.a * l1.b;
        if (0 === det) return !1;
        var x = (l2.b * l1.c - l1.b * l2.c) / det, y = (l1.a * l2.c - l2.a * l1.c) / det;
        if (!bounds1.contains(x, y) || !bounds2.contains(x, y)) return !1;
        var dx = x - x1, dy = y - y1;
        return {
            x: x,
            y: y,
            dx: dx,
            dy: dy,
            distance: dx * dx + dy * dy,
            wall: this
        };
    }, Edge.prototype.getReflection = function(velocity, restitution) {
        var dir = this.normal.clone(), friction = this.material.friction, velN = dir.scale(velocity.getDot(dir)).scale(restitution), velT = velocity.clone().sub(velN).scale(1 - friction), reflectedVel = velT.sub(velN);
        return reflectedVel;
    }, Newton.Edge = Edge;
}("undefined" == typeof exports ? this.Newton = this.Newton || {} : exports), function(Newton) {
    "use strict";
    function timeoutFrame(simulator) {
        var currTime = new Date().getTime(), timeToCall = Math.max(0, 16 - (currTime - lastTime)), id = setTimeout(function() {
            simulator(currTime + timeToCall);
        }, timeToCall);
        return lastTime = currTime + timeToCall, id;
    }
    function cancelTimeoutFrame(id) {
        clearTimeout(id);
    }
    var lastTime = 0;
    if ("undefined" != typeof window) {
        var vendors = [ "ms", "moz", "webkit", "o" ], isOpera = !!window.opera || navigator.userAgent.indexOf(" OPR/") >= 0;
        Object.prototype.toString.call(window.HTMLElement).indexOf("Constructor") > 0, !!window.chrome && !isOpera;
        for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) window.requestAnimationFrame = window[vendors[x] + "RequestAnimationFrame"], 
        window.cancelAnimationFrame = window[vendors[x] + "CancelAnimationFrame"] || window[vendors[x] + "CancelRequestAnimationFrame"];
        window.requestAnimationFrame || (window.requestAnimationFrame = timeoutFrame, window.cancelAnimationFrame = cancelTimeoutFrame), 
        Newton.frame = window.requestAnimationFrame.bind(window), Newton.cancelFrame = window.cancelAnimationFrame.bind(window);
    } else Newton.frame = timeoutFrame, Newton.cancelFrame = cancelTimeoutFrame;
}("undefined" == typeof exports ? this.Newton = this.Newton || {} : exports), function(Newton) {
    "use strict";
    function Material(options) {
        return this instanceof Material ? (options = options || {}, this.weight = options.weight || 1, 
        this.restitution = options.restitution || 1, this.friction = options.friction || 0, 
        this.maxVelocity = options.maxVelocity || 100, this.maxVelocitySquared = this.maxVelocity * this.maxVelocity, 
        void 0) : new Material(options);
    }
    Material.prototype.setMaxVelocity = function(v) {
        return this.maxVelocity = v, this.maxVelocitySquared = v * v, this;
    }, Material.simple = new Material(), Newton.Material = Material;
}("undefined" == typeof exports ? this.Newton = this.Newton || {} : exports), function(Newton) {
    "use strict";
    function Particle(x, y, size, material) {
        return this instanceof Particle ? (this.position = new Newton.Vector(x, y), this.lastPosition = this.position.clone(), 
        this.lastValidPosition = this.position.clone(), this.velocity = new Newton.Vector(0, 0), 
        this.acceleration = new Newton.Vector(0, 0), this.material = material || Newton.Material.simple, 
        this.size = size || 1, this.randomDrag = 0, this.pinned = !1, this.colliding = !1, 
        this.isDestroyed = !1, this.layer = void 0, void 0) : new Particle(x, y, size, material);
    }
    Particle.randomness = 25, Particle.prototype.integrate = function(time) {
        if (!this.pinned) {
            this.velocity.copy(this.position).sub(this.lastPosition);
            var drag = Math.min(1, this.velocity.getLength2() / (this.material.maxVelocitySquared + this.randomDrag));
            this.velocity.scale(1 - drag), this.acceleration.scale(1 - drag).scale(time * time), 
            this.lastPosition.copy(this.position), this.position.add(this.velocity).add(this.acceleration), 
            this.acceleration.zero(), this.lastValidPosition.copy(this.lastPosition), this.colliding = !1;
        }
    }, Particle.prototype.placeAt = function(x, y) {
        return this.position.set(x, y), this.lastPosition.copy(this.position), this.lastValidPosition.copy(this.lastPosition), 
        this;
    }, Particle.prototype.correct = function(v) {
        this.pinned || this.position.add(v);
    }, Particle.prototype.moveTo = function(x, y) {
        return this.position.set(x, y), this;
    }, Particle.prototype.shiftTo = function(x, y) {
        var deltaX = x - this.position.x, deltaY = y - this.position.y;
        this.position.addXY(deltaX, deltaY), this.lastValidPosition.addXY(deltaX, deltaY), 
        this.lastPosition.addXY(deltaX, deltaY);
    }, Particle.prototype.destroy = function() {
        this.isDestroyed = !0;
    }, Particle.prototype.getDistance = function(x, y) {
        return this.position.pool().subXY(x, y).getLength();
    }, Particle.prototype.pin = function(x, y) {
        x = "undefined" != typeof x ? x : this.position.x, y = "undefined" != typeof y ? y : this.position.y, 
        this.placeAt(x, y), this.pinned = !0, this.size = 1/0;
    }, Particle.prototype.setVelocity = function(x, y) {
        return this.lastPosition.copy(this.position).subXY(x, y), this;
    }, Particle.prototype.contain = function(bounds) {
        this.position.x > bounds.right ? this.position.x = this.lastPosition.x = this.lastValidPosition.x = bounds.right : this.position.x < bounds.left && (this.position.x = this.lastPosition.x = this.lastValidPosition.x = bounds.left), 
        this.position.y > bounds.bottom ? this.position.y = this.lastPosition.y = this.lastValidPosition.y = bounds.bottom : this.position.y < bounds.top && (this.position.y = this.lastPosition.y = this.lastValidPosition.y = bounds.top);
    }, Particle.prototype.applyForce = function(force) {
        this.accelerateVector(force.vector);
    }, Particle.prototype.accelerateVector = function(vector) {
        this.acceleration.add(vector);
    }, Particle.prototype.force = function(x, y, mass) {
        mass = mass || this.getMass(), this.acceleration.add({
            x: x / mass,
            y: y / mass
        });
    }, Particle.prototype.getMass = function() {
        return this.size * this.material.weight;
    }, Particle.prototype.getSquaredSpeed = function() {
        return this.velocity.getSquaredLength();
    }, Particle.prototype.attractSquare = function(x, y, m, minDist) {
        var mass = this.getMass(), delta = new Newton.Vector.claim().set(x, y).sub(this.position), r = Math.max(delta.getLength(), minDist || 1), f = m * mass / (r * r), ratio = m / (m + mass);
        this.acceleration.add({
            x: -f * (delta.x / r) * ratio,
            y: -f * (delta.y / r) * ratio
        }), delta.free();
    }, Particle.prototype.collide = function(intersection) {
        var velocity = this.position.pool().sub(this.lastPosition), bouncePoint = Newton.Vector.claim().set(intersection.x, intersection.y).add(intersection.wall.normal), reflectedVelocity = intersection.wall.getReflection(velocity, this.material.restitution);
        this.position.copy(bouncePoint), this.setVelocity(reflectedVelocity.x, reflectedVelocity.y), 
        this.lastValidPosition = bouncePoint, this.colliding = !0, velocity.free(), bouncePoint.free();
    }, Newton.Particle = Particle;
}("undefined" == typeof exports ? this.Newton = this.Newton || {} : exports), function(Newton) {
    "use strict";
    function noop() {}
    function prioritySort(a, b) {
        return b.priority - a.priority;
    }
    function Simulator(callback, renderers, integrationFps, iterations) {
        return this instanceof Simulator ? (this.callback = callback || noop, this.renderers = renderers || noop, 
        Array.isArray(this.renderers) || (this.renderers = [ this.renderers ]), this.step = this._step.bind(this), 
        this.lastTime = 0, this.running = !1, this.fps = 0, this.frames = 0, this.countTime = 0, 
        this.countInterval = 250, this.accumulator = 0, this.simulationStep = 1e3 / (integrationFps || 60), 
        this.iterations = iterations || 3, this.startTime = 0, this.layers = {}, this.particles = [], 
        this.edges = [], this.forces = [], this.constraints = [], this.collisionParticles = [], 
        void 0) : new Simulator(callback, renderers, integrationFps, iterations);
    }
    Array.isArray || (Array.isArray = function(vArg) {
        return "[object Array]" === Object.prototype.toString.call(vArg);
    }), Simulator.prototype.start = function() {
        this.running = !0, this.countTime = Date.now() + 1e3, this.startTime = Date.now(), 
        Newton.frame(this.step);
    }, Simulator.prototype.stop = function() {
        this.running = !1;
    }, Simulator.prototype._step = function() {
        if (this.running) {
            var time = Date.now(), step = time - this.lastTime;
            for (this.lastTime = time, step > 100 && (step = 0), this.accumulator += step; this.accumulator >= this.simulationStep; ) this.simulate(this.simulationStep, time - this.startTime), 
            this.accumulator -= this.simulationStep;
            for (var i = 0; i < this.renderers.length; i++) this.renderers[i](step, this);
            this.frames++, time >= this.countTime && (this.fps = (1e3 * (this.frames / (this.countInterval + time - this.countTime))).toFixed(0), 
            this.frames = 0, this.countTime = time + this.countInterval), Newton.frame(this.step);
        }
    }, Simulator.prototype.simulate = function(time, totalTime) {
        this.cull(this.particles), this.cull(this.constraints), this.callback(time, this, totalTime), 
        this.integrate(time), this.constrain(time), this.updateEdges(), this.collide(time);
    }, Simulator.prototype.cull = function(array) {
        for (var i = 0; i < array.length; ) array[i].isDestroyed ? array.splice(i, 1) : i++;
    }, Simulator.prototype.integrate = function(time) {
        for (var particle, force, linked, particles = this.particles, forces = this.forces, layers = this.layers, emptyLink = [], i = 0, ilen = particles.length; ilen > i; i++) {
            if (particle = particles[i], linked = particle.layer ? layers[particle.layer].linked : emptyLink, 
            !particle.pinned) for (var j = 0, jlen = forces.length; jlen > j; j++) force = forces[j], 
            force.layer && -1 === linked.indexOf(force.layer) || force.applyTo(particle);
            particle.integrate(time);
        }
    }, Simulator.prototype.constrain = function(time) {
        for (var constraints = this.constraints, j = 0, jlen = this.iterations; jlen > j; j++) for (var i = 0, ilen = constraints.length; ilen > i; i++) constraints[i].resolve(time, this.particles);
    }, Simulator.prototype.updateEdges = function() {
        for (var i = 0, ilen = this.edges.length; ilen > i; i++) this.edges[i].compute();
    }, Simulator.prototype.collide = function() {
        for (var intersect, particle, edge, nearest, linked, particles = this.collisionParticles, edges = this.edges, layers = this.layers, emptyLink = [], i = 0, ilen = particles.length; ilen > i; i++) {
            particle = particles[i], linked = particle.layer ? layers[particle.layer].linked : emptyLink, 
            intersect = void 0, nearest = void 0;
            for (var j = 0, jlen = edges.length; jlen > j; j++) edge = edges[j], edge.layer && -1 === linked.indexOf(edge.layer) || particle !== edge.p1 && particle !== edge.p2 && (intersect = edge.findIntersection(particle.lastPosition, particle.position), 
            intersect && (!nearest || intersect.distance < nearest.distance) && (nearest = intersect));
            nearest && particle.collide(nearest);
        }
    }, Simulator.prototype.ensureLayer = function(name) {
        name && (this.layers[name] || (this.layers[name] = {
            linked: [ name ]
        }));
    }, Simulator.prototype.add = function(entity, layer) {
        var entities = Array.isArray(entity) ? entity : [ entity ];
        for (this.ensureLayer(layer); entities.length; ) entities.shift().addTo(this, layer);
        return this;
    }, Simulator.prototype.link = function(layer, linkedLayers) {
        return this.ensureLayer(layer), this.layers[layer].linked = linkedLayers.split(" "), 
        this;
    }, Simulator.prototype.addParticles = function(particles) {
        this.particles.push.apply(this.particles, particles);
    }, Simulator.prototype.addEdges = function(edges) {
        this.edges.push.apply(this.edges, edges);
        for (var i = 0; i < edges.length; i++) this.addCollisionParticles([ edges[i].p1, edges[i].p2 ]);
    }, Simulator.prototype.addCollisionParticles = function(particles) {
        for (var i = particles.length; i--; ) -1 === this.collisionParticles.indexOf(particles[i]) && this.collisionParticles.push(particles[i]);
        return this;
    }, Simulator.prototype.addConstraints = function(constraints) {
        this.constraints.push.apply(this.constraints, constraints), this.constraints.sort(prioritySort);
    }, Simulator.prototype.findParticle = function(x, y, radius) {
        for (var distance, particles = this.particles, found = void 0, nearest = radius, i = 0, ilen = particles.length; ilen > i; i++) distance = particles[i].getDistance(x, y), 
        nearest >= distance && (found = particles[i], nearest = distance);
        return found;
    }, Simulator.prototype.addBody = function(body) {
        this.particles.push.apply(this.particles, body.particles), this.edges.push.apply(this.edges, body.edges), 
        this.bodies.push(body);
    }, Simulator.prototype.Layer = function() {
        var newLayer = Newton.Layer();
        return this.layers.push(newLayer), newLayer;
    }, Newton.Simulator = Simulator;
}("undefined" == typeof exports ? this.Newton = this.Newton || {} : exports), function(Newton) {
    "use strict";
    function Box(x, y, size) {
        var body = Newton.Body(), ul = body.Particle(x - size, y - size), ur = body.Particle(x + size, y - size), ll = body.Particle(x - size, y + size), lr = body.Particle(x + size, y + size);
        return body.DistanceConstraint(ul, ur), body.DistanceConstraint(ur, lr), body.DistanceConstraint(lr, ll), 
        body.DistanceConstraint(ll, ul), body.DistanceConstraint(ul, lr), body.DistanceConstraint(ur, ll), 
        body.Edge(ul, ur), body.Edge(ur, lr), body.Edge(lr, ll), body.Edge(ll, ul), body;
    }
    Newton.Box = Box;
}("undefined" == typeof exports ? this.Newton = this.Newton || {} : exports), function(Newton) {
    "use strict";
    function Fabric(x1, y1, x2, y2, width, height) {
        for (var particle, spacing = (x2 - x1) / width, body = Newton.Body(), w = 0; width > w; w++) for (var h = 0; height > h; h++) particle = body.Particle(x1 + w * spacing, y1 + h * spacing), 
        0 === h && particle.pin();
        for (var w = 0; width > w; w++) for (var h = 0; height > h; h++) h > 0 && body.DistanceConstraint(body.particles[w * height + h], body.particles[w * height + h - 1], .2), 
        w > 0 && body.DistanceConstraint(body.particles[w * height + h], body.particles[w * height + h - height], .2), 
        0 === w && h > 0 && body.Edge(body.particles[w * height + h], body.particles[w * height + h - 1]), 
        h === height - 1 && w > 0 && body.Edge(body.particles[w * height + h], body.particles[w * height + h - height]), 
        w === width - 1 && h > 0 && body.Edge(body.particles[w * height + h - 1], body.particles[w * height + h]);
        return body;
    }
    Newton.Fabric = Fabric;
}("undefined" == typeof exports ? this.Newton = this.Newton || {} : exports), function(Newton) {
    "use strict";
    function Lattice(x, y, segmentLength, segments, pinLeft, pinRight) {
        var body = Newton.Body(), top = body.Particle(x, y), bottom = body.Particle(x, y + segmentLength);
        pinLeft && (top.pin(), bottom.pin());
        for (var i = 1; segments >= i; i++) {
            var nextTop = body.Particle(x + i * segmentLength, y), nextBottom = body.Particle(x + i * segmentLength, y + segmentLength);
            body.DistanceConstraint(top, nextTop), body.DistanceConstraint(bottom, nextBottom), 
            body.DistanceConstraint(top, nextBottom), body.DistanceConstraint(nextTop, bottom), 
            body.DistanceConstraint(nextTop, nextBottom), body.Edge(top, nextTop), body.Edge(bottom, nextBottom), 
            i === segments && body.Edge(nextTop, nextBottom), top = nextTop, bottom = nextBottom;
        }
        return pinRight && (top.pin(), bottom.pin()), body;
    }
    Newton.Lattice = Lattice;
}("undefined" == typeof exports ? this.Newton = this.Newton || {} : exports), function(Newton) {
    "use strict";
    function Squishy(ox, oy, r, points) {
        for (var spacing = 2 * Math.PI / points, body = Newton.Body(), i = 0; points > i; i++) {
            var x = ox + r * Math.cos(i * spacing - .5 * Math.PI), y = oy + r * Math.sin(i * spacing - .5 * Math.PI);
            body.Particle(x, y);
            for (var j = 0; i > j; j++) body.DistanceConstraint(body.particles[i], body.particles[j], .002);
            i > 0 && body.Edge(body.particles[i - 1], body.particles[i]);
        }
        return body.Edge(body.particles[points - 1], body.particles[0]), body;
    }
    Newton.Squishy = Squishy;
}("undefined" == typeof exports ? this.Newton = this.Newton || {} : exports), function(Newton) {
    "use strict";
    function LinearGravity(angle, strength, falloff) {
        return this instanceof LinearGravity ? (this.angle = angle, this.strength = strength, 
        this.vector = new Newton.Vector(0, strength).rotateBy(angle), this.simulator = void 0, 
        this.layer = void 0, void 0) : new LinearGravity(angle, strength, falloff);
    }
    LinearGravity.prototype.addTo = function(simulator, layer) {
        simulator.forces.push(this), this.simulator = simulator, this.layer = layer;
    }, LinearGravity.prototype.setAngle = function(angle) {
        this.angle = angle, this.vector.set(0, this.strength).rotateBy(this.angle);
    }, LinearGravity.prototype.setStrength = function(strength) {
        this.strength = strength, this.vector.set(0, this.strength).rotateBy(this.angle);
    }, LinearGravity.prototype.applyTo = function(particle) {
        particle.accelerateVector(this.vector);
    }, Newton.LinearGravity = LinearGravity;
}("undefined" == typeof exports ? this.Newton = this.Newton || {} : exports), function(Newton) {
    "use strict";
    function RadialGravity(x, y, strength, falloff) {
        return this instanceof RadialGravity ? (this.x = x, this.y = y, this.strength = strength, 
        this.simulator = void 0, this.layer = void 0, void 0) : new RadialGravity(x, y, strength, falloff);
    }
    RadialGravity.prototype.addTo = function(simulator, layer) {
        simulator.forces.push(this), this.simulator = simulator, this.layer = layer;
    }, RadialGravity.prototype.setLocation = function(x, y) {
        this.x = x, this.y = y;
    }, RadialGravity.prototype.setStrength = function(strength) {
        this.strength = strength;
    }, RadialGravity.prototype.applyTo = function(particle) {
        particle.attractSquare(this.x, this.y, this.strength, 20);
    }, Newton.RadialGravity = RadialGravity;
}("undefined" == typeof exports ? this.Newton = this.Newton || {} : exports), function(Newton) {
    "use strict";
    function Rectangle(left, top, right, bottom) {
        return this instanceof Rectangle ? (this.set.apply(this, arguments), void 0) : new Rectangle(left, top, right, bottom);
    }
    Rectangle.fromVectors = function(v1, v2) {
        return new Rectangle(v1.x, v1.y, v2.x, v2.y);
    }, Rectangle.prototype = {
        set: function(left, top, right, bottom) {
            return this.left = Math.min(left, right), this.top = Math.min(top, bottom), this.right = Math.max(right, left), 
            this.bottom = Math.max(bottom, top), this.width = this.right - this.left, this.height = this.bottom - this.top, 
            this;
        },
        contains: function(x, y) {
            return x >= this.left && x <= this.right && y >= this.top && y <= this.bottom;
        },
        overlaps: function(rect) {
            return !(rect.left > this.right || rect.right < this.left || rect.top > this.bottom || rect.bottom < this.top);
        },
        expand: function(amount) {
            return this.left -= amount, this.right += amount, this.top -= amount, this.bottom += amount, 
            this;
        }
    }, Newton.Rectangle = Rectangle;
}("undefined" == typeof exports ? this.Newton = this.Newton || {} : exports), function(Newton) {
    "use strict";
    function Vector(x, y) {
        return this instanceof Vector ? (this.x = x, this.y = y, void 0) : new Vector(x, y);
    }
    Vector._pool = [], Vector.pool = function(size) {
        if ("undefined" == typeof size) return Vector._pool.length;
        Vector._pool.length = 0;
        for (var i = 0; size > i; i++) Vector._pool.push(Newton.Vector());
    }, Vector.claim = function() {
        return Vector._pool.pop() || Newton.Vector();
    }, Vector.prototype.free = function() {
        return Vector._pool.push(this), this;
    }, Vector.prototype.pool = function() {
        return Vector.claim().copy(this);
    }, Vector.scratch = new Vector(), Vector.getDistance = function(a, b) {
        var dx = a.x - b.x, dy = a.y - b.y;
        return Math.sqrt(dx * dx + dy * dy);
    }, Vector.prototype.clone = function() {
        return Newton.Vector(this.x, this.y);
    }, Vector.prototype.copy = function(v) {
        return this.x = v.x, this.y = v.y, this;
    }, Vector.prototype.zero = function() {
        return this.x = 0, this.y = 0, this;
    }, Vector.prototype.set = function(x, y) {
        return this.x = x, this.y = y, this;
    }, Vector.prototype.add = function(v) {
        return this.x += v.x, this.y += v.y, this;
    }, Vector.prototype.addXY = function(x, y) {
        return this.x += x, this.y += y, this;
    }, Vector.prototype.sub = function(v) {
        return this.x -= v.x, this.y -= v.y, this;
    }, Vector.prototype.subXY = function(x, y) {
        return this.x -= x, this.y -= y, this;
    }, Vector.prototype.mult = function(v) {
        return this.x *= v.x, this.y *= v.y, this;
    }, Vector.prototype.scale = function(scalar) {
        return this.x *= scalar, this.y *= scalar, this;
    }, Vector.prototype.div = function(v) {
        return this.x /= v.x, this.y /= v.y, this;
    }, Vector.prototype.reverse = function() {
        return this.x = -this.x, this.y = -this.y, this;
    }, Vector.prototype.unit = function() {
        return this.scale(1 / this.getLength()), this;
    }, Vector.prototype.turnRight = function() {
        var x = this.x, y = this.y;
        return this.x = -y, this.y = x, this;
    }, Vector.prototype.turnLeft = function() {
        var x = this.x, y = this.y;
        return this.x = y, this.y = -x, this;
    }, Vector.prototype.rotateBy = function(angle) {
        var x = this.x, y = -this.y, sin = Math.sin(angle), cos = Math.cos(angle);
        return this.x = x * cos - y * sin, this.y = -(x * sin + y * cos), this;
    }, Vector.prototype.rotateAbout = function(pivot, angle) {
        return this.sub(pivot).rotateBy(angle).add(pivot), this;
    }, Vector.prototype.getDot = function(v) {
        return this.x * v.x + this.y * v.y;
    }, Vector.prototype.getCross = function(v) {
        return this.x * v.y + this.y * v.x;
    }, Vector.prototype.getLength = function() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }, Vector.prototype.getLength2 = function() {
        return this.x * this.x + this.y * this.y;
    }, Vector.prototype.getAngle = function() {
        return Math.atan2(-this.y, this.x);
    }, Vector.prototype.getAngleTo = function(v) {
        var cos = this.x * v.x + this.y * v.y, sin = this.y * v.x - this.x * v.y;
        return Math.atan2(sin, cos);
    }, Newton.Vector = Vector;
}("undefined" == typeof exports ? this.Newton = this.Newton || {} : exports), function(Newton) {
    "use strict";
    function rgbToHex(r, g, b) {
        return (1 << 24) + (r << 16) + (g << 8) + b;
    }
    function PixiRenderer(el, width, height) {
        return this instanceof PixiRenderer ? (this.stage = new PIXI.Stage(0, !0), this.stage.setInteractive(!0), 
        this.width = width, this.height = height, this.renderer = PIXI.autoDetectRenderer(this.width, this.height, null, !1, !0), 
        this.renderer.view.style.display = "block", el.appendChild(this.renderer.view), 
        this.infoText = new PIXI.Text("FPS: ??", {
            fill: "#ffffff",
            font: "10pt Helvetica"
        }), this.stage.addChild(this.infoText), this.graphics = new PIXI.Graphics(), this.stage.addChild(this.graphics), 
        this.callback = this.callback.bind(this), void 0) : new PixiRenderer(el, width, height);
    }
    PixiRenderer.prototype = {
        callback: function(time, sim) {
            var particles = 0, edges = 0;
            this.graphics.clear();
            for (var i = 0, ilen = sim.layers.length; ilen > i; i++) {
                for (var j = 0, jlen = sim.layers[i].bodies.length; jlen > j; j++) particles += this.drawParticles(sim.layers[i].bodies[j].particles), 
                edges += this.drawEdges(sim.layers[i].bodies[j].edges);
                this.drawForces(sim.layers[i].forces);
            }
            this.infoText.setText("FPS: " + sim.fps + "\nparticles: " + particles + "\nedges: " + edges), 
            this.renderer.render(this.stage);
        },
        drawForces: function(forces) {
            this.graphics.lineStyle(2, 16777215, .3);
            for (var i = 0, ilen = forces.length; ilen > i; i++) {
                var force = forces[i];
                force instanceof Newton.RadialGravity && (this.graphics.beginFill(16777215, .2), 
                this.graphics.drawCircle(force.x, force.y, .5 * force.strength * force.strength), 
                this.graphics.endFill());
            }
        },
        drawParticles: function(particles) {
            for (var particle, pos, last, mass, brightness, j = 0, jlen = particles.length; jlen > j; j++) particle = particles[j], 
            pos = particle.position, last = particle.lastValidPosition, mass = particle.getMass(), 
            brightness = ~~(128 * ((mass - 1) / 5)), particle.colliding ? this.graphics.lineStyle(mass, rgbToHex(255, 255, 100), 1) : this.graphics.lineStyle(mass, rgbToHex(255, 28 + brightness, 108 + brightness), 1), 
            this.graphics.moveTo(last.x - 1, last.y), this.graphics.lineTo(pos.x + 1, pos.y);
            return particles.length;
        },
        drawEdges: function(edges) {
            this.graphics.lineStyle(1, 16777215, .5);
            for (var edge, i = edges.length; i--; ) edge = edges[i].getCoords(), this.graphics.moveTo(edge.x1, edge.y1), 
            this.graphics.lineTo(edge.x2, edge.y2);
            return edges.length;
        }
    }, Newton.PixiRenderer = PixiRenderer;
}("undefined" == typeof exports ? this.Newton = this.Newton || {} : exports), function(Newton) {
    "use strict";
    function Renderer(el) {
        return this instanceof Renderer ? (this.ctx = el.getContext("2d"), this.width = el.width, 
        this.height = el.height, this.callback = this.callback.bind(this), void 0) : new Renderer(el);
    }
    Renderer.prototype = {
        callback: function(time, sim) {
            var ctx = this.ctx;
            this.clear(ctx, time), this.drawConstraints(ctx, sim.constraints), this.drawEdges(ctx, sim.edges), 
            this.drawParticles(ctx, sim.particles), this.drawForces(ctx, sim.forces), this.drawCounts(ctx, {
                particles: sim.particles.length,
                edges: sim.edges.length,
                forces: sim.forces.length,
                constraints: sim.constraints.length
            }), this.drawFPS(ctx, sim);
        },
        clear: function(ctx) {
            ctx.save(), ctx.fillStyle = "#000000", ctx.fillRect(0, 0, this.width, this.height), 
            ctx.restore();
        },
        drawForces: function(ctx, forces) {
            ctx.save(), ctx.lineWidth = 2, ctx.strokeStyle = "rgba(255, 255, 255, 0.25)", ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
            for (var i = 0, ilen = forces.length; ilen > i; i++) {
                var force = forces[i];
                force instanceof Newton.RadialGravity && (ctx.beginPath(), ctx.arc(force.x, force.y, .5 * force.strength * force.strength, 0, 2 * Math.PI, !1), 
                ctx.fill());
            }
            ctx.restore();
        },
        drawParticles: function(ctx, particles) {
            var particle, pos, last, mass;
            ctx.save(), ctx.lineCap = "round", ctx.lineJoin = "round";
            for (var j = 0, jlen = particles.length; jlen > j; j++) particle = particles[j], 
            pos = particle.position, last = particle.lastValidPosition, mass = particle.getMass(), 
            ctx.beginPath(), particle.pinned ? (ctx.strokeStyle = "rgba(255, 255, 255, 1)", 
            ctx.lineWidth = 1, ctx.moveTo(last.x - 3, last.y - 3), ctx.lineTo(last.x + 3, last.y + 3), 
            ctx.moveTo(last.x + 3, last.y - 3), ctx.lineTo(last.x - 3, last.y + 3)) : (ctx.lineWidth = ~~(mass / 3) + 2, 
            ctx.strokeStyle = particle.colliding ? "rgba(255, 255, 100, 1)" : "rgba(255, 28, 108, 1)", 
            ctx.moveTo(last.x, last.y), ctx.lineTo(pos.x + 1, pos.y)), ctx.stroke();
            ctx.restore();
        },
        drawConstraints: function(ctx, constraints) {
            var coords, constraint;
            ctx.save(), ctx.strokeStyle = "rgba(100, 100, 255, 1)", ctx.lineWidth = 1;
            for (var i = 0, ilen = constraints.length; ilen > i; i++) constraint = constraints[i], 
            "linear" === constraint.category ? (coords = constraint.getCoords(), ctx.beginPath(), 
            ctx.moveTo(coords.x1, coords.y1), ctx.lineTo(coords.x2, coords.y2), ctx.closePath(), 
            ctx.stroke()) : "rigid" === constraint.category && (coords = constraint.centerMass, 
            ctx.beginPath(), ctx.moveTo(coords.x - 3, coords.y - 3), ctx.lineTo(coords.x + 3, coords.y + 3), 
            ctx.closePath(), ctx.stroke());
            ctx.restore();
        },
        drawEdges: function(ctx, edges) {
            ctx.save(), ctx.strokeStyle = "rgba(255, 255, 255, 0.4)", ctx.lineWidth = 1;
            for (var edge, i = edges.length; i--; ) edge = edges[i].getCoords(), ctx.beginPath(), 
            ctx.moveTo(edge.x1, edge.y1), ctx.lineTo(edge.x2, edge.y2), ctx.closePath(), ctx.stroke();
            return ctx.restore(), edges.length;
        },
        drawCounts: function(ctx, counts) {
            ctx.save(), ctx.fillStyle = "#fff", ctx.font = "10pt Helvetica", ctx.fillText("Particles: " + counts.particles, 10, 20), 
            ctx.fillText("Edges: " + counts.edges, 10, 40), ctx.fillText("Forces: " + counts.forces, 10, 60), 
            ctx.fillText("Constraints: " + counts.constraints, 10, 80), ctx.restore();
        },
        drawFPS: function(ctx, sim) {
            var text = "FPS: " + sim.fps;
            ctx.save(), ctx.fillStyle = "#fff", ctx.font = "10pt Helvetica", ctx.fillText(text, 10, 120), 
            ctx.restore();
        }
    }, Newton.Renderer = Renderer;
}("undefined" == typeof exports ? this.Newton = this.Newton || {} : exports), function(Newton) {
    "use strict";
    function getGLContext(canvas) {
        for (var gl, names = [ "webgl", "experimental-webgl", "webkit-3d", "moz-webgl" ], i = 0; !gl && i++ < names.length; ) try {
            gl = canvas.getContext(names[i]);
        } catch (e) {}
        return gl;
    }
    function createShaderProgram(gl, vsText, fsText) {
        var vs = gl.createShader(gl.VERTEX_SHADER), fs = gl.createShader(gl.FRAGMENT_SHADER);
        if (gl.shaderSource(vs, vsText), gl.shaderSource(fs, fsText), gl.compileShader(vs), 
        gl.compileShader(fs), !gl.getShaderParameter(vs, gl.COMPILE_STATUS)) throw console.error("error compiling VS shaders:", gl.getShaderInfoLog(vs)), 
        new Error("shader failure");
        if (!gl.getShaderParameter(fs, gl.COMPILE_STATUS)) throw console.error("error compiling FS shaders:", gl.getShaderInfoLog(fs)), 
        new Error("shader failure");
        var program = gl.createProgram();
        return gl.attachShader(program, vs), gl.attachShader(program, fs), gl.linkProgram(program), 
        program;
    }
    function createCircleTexture(gl, size) {
        size = size || 128;
        var canvas = document.createElement("canvas");
        canvas.width = canvas.height = size;
        var ctx = canvas.getContext("2d"), rad = .5 * size;
        return ctx.beginPath(), ctx.arc(rad, rad, rad, 0, 2 * Math.PI, !1), ctx.closePath(), 
        ctx.fillStyle = "#fff", ctx.fill(), createTexture(gl, canvas);
    }
    function createTexture(gl, data) {
        var texture = gl.createTexture();
        return gl.bindTexture(gl.TEXTURE_2D, texture), gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, data), 
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR), gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR), 
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE), gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE), 
        gl.generateMipmap(gl.TEXTURE_2D), gl.bindTexture(gl.TEXTURE_2D, null), texture;
    }
    function GLRenderer(el) {
        return this instanceof GLRenderer ? (this.el = el, this.width = el.width, this.height = el.height, 
        this.gl = getGLContext(el), this.vertices = [], this.sizes = [], this.vArray = new Float32Array(3 * GLRenderer.MAX_PARTICLES), 
        this.sArray = new Float32Array(GLRenderer.MAX_PARTICLES), this.callback = this.callback.bind(this), 
        this.gl.viewport(0, 0, this.width, this.height), this.viewportArray = new Float32Array([ this.width, this.height ]), 
        this.initShaders(), this.initBuffers(), this.particleTexture = createCircleTexture(this.gl), 
        this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE), this.gl.enable(this.gl.BLEND), 
        void 0) : new GLRenderer(el);
    }
    var POINT_VS = [ "uniform vec2 viewport;", "attribute vec3 position;", "attribute float size;", "void main() {", "vec2 scaled = ((position.xy / viewport) * 2.0) - 1.0;", "vec2 flipped = vec2(scaled.x, -scaled.y);", "gl_Position = vec4(flipped, 0, 1);", "gl_PointSize = size + 1.0;", "}" ].join("\n"), LINE_VS = [ "uniform vec2 viewport;", "attribute vec3 position;", "void main() {", "vec2 scaled = ((position.xy / viewport) * 2.0) - 1.0;", "vec2 flipped = vec2(scaled.x, -scaled.y);", "gl_Position = vec4(flipped, 0, 1);", "}" ].join("\n"), PARTICLE_FS = [ "precision mediump float;", "uniform sampler2D texture;", "void main() {", "gl_FragColor = texture2D(texture, gl_PointCoord);", "}" ].join("\n"), CONSTRAINT_FS = [ "void main() {", "gl_FragColor = vec4(0.0, 0.5, 1.0, 1.0);", "}" ].join("\n"), EDGE_FS = [ "void main() {", "gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);", "}" ].join("\n");
    GLRenderer.MAX_PARTICLES = 1e4, GLRenderer.prototype = {
        initShaders: function() {
            var gl = this.gl;
            this.particleShader = createShaderProgram(gl, POINT_VS, PARTICLE_FS), this.particleShader.uniforms = {
                viewport: gl.getUniformLocation(this.particleShader, "viewport")
            }, this.particleShader.attributes = {
                position: gl.getAttribLocation(this.particleShader, "position"),
                size: gl.getAttribLocation(this.particleShader, "size")
            }, gl.useProgram(this.particleShader), gl.uniform2fv(this.particleShader.uniforms.viewport, this.viewportArray), 
            this.edgeShader = createShaderProgram(gl, LINE_VS, EDGE_FS), this.edgeShader.uniforms = {
                viewport: gl.getUniformLocation(this.edgeShader, "viewport")
            }, this.edgeShader.attributes = {
                position: gl.getAttribLocation(this.edgeShader, "position")
            }, gl.useProgram(this.edgeShader), gl.uniform2fv(this.edgeShader.uniforms.viewport, this.viewportArray), 
            this.constraintShader = createShaderProgram(gl, LINE_VS, CONSTRAINT_FS), this.constraintShader.uniforms = {
                viewport: gl.getUniformLocation(this.constraintShader, "viewport")
            }, this.constraintShader.attributes = {
                position: gl.getAttribLocation(this.constraintShader, "position")
            }, gl.useProgram(this.constraintShader), gl.uniform2fv(this.constraintShader.uniforms.viewport, this.viewportArray);
        },
        initBuffers: function() {
            var gl = this.gl;
            this.particlePositionBuffer = gl.createBuffer(), this.particleSizeBuffer = gl.createBuffer(), 
            this.edgePositionBuffer = gl.createBuffer();
        },
        callback: function(time, sim) {
            this.clear(time), this.drawParticles(sim.particles), this.drawEdges(sim.edges), 
            this.drawConstraints(sim.constraints);
        },
        clear: function() {
            var gl = this.gl;
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        },
        drawForces: function(ctx, forces) {
            ctx.save(), ctx.lineWidth = 2, ctx.strokeStyle = "rgba(255, 255, 255, 0.25)", ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
            for (var i = 0, ilen = forces.length; ilen > i; i++) {
                var force = forces[i];
                force instanceof Newton.RadialGravity && (ctx.beginPath(), ctx.arc(force.x, force.y, .5 * force.strength * force.strength, 0, 2 * Math.PI, !1), 
                ctx.fill());
            }
            ctx.restore();
        },
        drawParticles: function(particles) {
            var gl = this.gl, vertices = this.vertices, sizes = this.sizes;
            vertices.length = 0, sizes.length = 0;
            for (var particle, i = 0, ilen = particles.length; ilen > i; i++) particle = particles[i], 
            vertices.push(particle.position.x, particle.position.y, 0), sizes.push(particle.size < 8 ? particle.size : 8);
            if (vertices.length > this.vArray.length) throw new Error("vArray too small to hold vertices");
            if (this.vArray.set(vertices, 0), sizes.length > this.sArray.length) throw new Error("sArray too small to hold sizes");
            this.sArray.set(sizes, 0), gl.activeTexture(gl.TEXTURE0), gl.bindTexture(gl.TEXTURE_2D, this.particleTexture), 
            gl.useProgram(this.particleShader), gl.bindBuffer(gl.ARRAY_BUFFER, this.particlePositionBuffer), 
            gl.bufferData(gl.ARRAY_BUFFER, this.vArray, gl.STATIC_DRAW), gl.vertexAttribPointer(this.particleShader.attributes.position, 3, gl.FLOAT, !1, 0, 0), 
            gl.enableVertexAttribArray(this.particleShader.attributes.position), gl.bindBuffer(gl.ARRAY_BUFFER, this.particleSizeBuffer), 
            gl.bufferData(gl.ARRAY_BUFFER, this.sArray, gl.STATIC_DRAW), gl.vertexAttribPointer(this.particleShader.attributes.size, 1, gl.FLOAT, !1, 0, 0), 
            gl.enableVertexAttribArray(this.particleShader.attributes.size), gl.drawArrays(gl.POINTS, 0, vertices.length / 3);
        },
        drawConstraints: function(constraints) {
            for (var constraint, coords, gl = this.gl, vertices = [], i = 0, ilen = constraints.length; ilen > i; i++) constraint = constraints[i], 
            "linear" === constraint.category && (coords = constraint.getCoords(), vertices.push(coords.x1, coords.y1, 0), 
            vertices.push(coords.x2, coords.y2, 0));
            gl.useProgram(this.constraintShader), gl.bindBuffer(gl.ARRAY_BUFFER, this.edgePositionBuffer), 
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW), gl.vertexAttribPointer(this.constraintShader.attributes.position, 3, gl.FLOAT, !1, 0, 0), 
            gl.enableVertexAttribArray(this.constraintShader.attributes.position), gl.lineWidth(1), 
            gl.drawArrays(gl.LINES, 0, vertices.length / 3);
        },
        drawEdges: function(edges) {
            for (var edge, gl = this.gl, vertices = [], i = 0, ilen = edges.length; ilen > i; i++) edge = edges[i].getCoords(), 
            vertices.push(edge.x1, edge.y1, 0), vertices.push(edge.x2, edge.y2, 0);
            gl.useProgram(this.edgeShader), gl.bindBuffer(gl.ARRAY_BUFFER, this.edgePositionBuffer), 
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW), gl.vertexAttribPointer(this.edgeShader.attributes.position, 3, gl.FLOAT, !1, 0, 0), 
            gl.enableVertexAttribArray(this.edgeShader.attributes.position), gl.lineWidth(3), 
            gl.drawArrays(gl.LINES, 0, vertices.length / 3);
        },
        drawCounts: function(ctx, counts) {
            ctx.save(), ctx.fillStyle = "#fff", ctx.font = "10pt Helvetica", ctx.fillText("Particles: " + counts.particles, 10, 20), 
            ctx.fillText("Edges: " + counts.edges, 10, 40), ctx.fillText("Forces: " + counts.forces, 10, 60), 
            ctx.fillText("Constraints: " + counts.constraints, 10, 80), ctx.restore();
        },
        drawFPS: function(sim) {
            var text = "FPS: " + sim.fps;
            ctx.save(), ctx.fillStyle = "#fff", ctx.font = "10pt Helvetica", ctx.fillText(text, 10, 120), 
            ctx.restore();
        }
    }, Newton.GLRenderer = GLRenderer;
}("undefined" == typeof exports ? this.Newton = this.Newton || {} : exports);
//# sourceMappingURL=newton-map.js