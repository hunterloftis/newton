!function(Newton) {
    "use strict";
    function Body(material) {
        return this instanceof Body ? (this.particles = [], this.edges = [], this.constraints = [], 
        this.material = material, this.simulator = void 0, void 0) : new Body(material);
    }
    Body.prototype.addTo = function(simulator) {
        if (this.simulator) throw new Error("Not implemented: reparenting a body");
        simulator.addParticles(this.particles), simulator.addEdges(this.edges), simulator.addConstraints(this.constraints), 
        this.simulator = simulator;
    }, Body.prototype.addParticle = function(particle) {
        this.particles.push(particle), this.simulator && this.simulator.addParticles([ particle ]);
    }, Body.prototype.Particle = function() {
        var particle = Newton.Particle.apply(Newton.Particle, Array.prototype.slice.call(arguments));
        return this.addParticle(particle), particle;
    }, Body.prototype.addEdge = function(edge) {
        this.edges.push(edge), this.simulator && this.simulator.addEdges([ edge ]);
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
    }, Newton.Body = Body;
}("undefined" == typeof exports ? this.Newton = this.Newton || {} : exports), function(Newton) {
    "use strict";
    function DistanceConstraint(p1, p2, stiffness, distance) {
        return this instanceof DistanceConstraint ? (this.p1 = p1, this.p2 = p2, this.stiffness = stiffness || 1, 
        this.distance = "undefined" == typeof distance ? this.getDistance() : distance, 
        this.isDestroyed = !1, void 0) : new DistanceConstraint(p1, p2, stiffness, distance);
    }
    DistanceConstraint.prototype.category = "linear", DistanceConstraint.prototype.priority = 4, 
    DistanceConstraint.prototype.getDistance = function() {
        var pos1 = this.p1.position, pos2 = this.p2.position, diff = pos2.clone().sub(pos1);
        return diff.getLength();
    }, DistanceConstraint.prototype.resolve = function() {
        if (this.p1.isDestroyed || this.p2.isDestroyed) return this.isDestroyed = !0, void 0;
        var pos1 = this.p1.position, pos2 = this.p2.position, delta = pos2.clone().sub(pos1), length = delta.getLength(), invmass1 = 1 / this.p1.getMass(), invmass2 = 1 / this.p2.getMass(), factor = (length - this.distance) / (length * (invmass1 + invmass2)) * this.stiffness, correction1 = delta.clone().scale(factor * invmass1), correction2 = delta.clone().scale(-factor * invmass2);
        this.p1.correct(correction1), this.p2.correct(correction2);
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
    function Edge(p1, p2, material) {
        return this instanceof Edge ? (this.p1 = p1, this.p2 = p2, this.material = material || Material.simple, 
        this.compute(), this._rect = new Newton.Rectangle(0, 0, 0, 0), void 0) : new Edge(p1, p2, material);
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
    }, Edge.prototype.getRepelled = function(x, y) {
        return new Newton.Vector(x, y).add(this.normal);
    }, Edge.prototype.getProjection = function(vector) {
        var dot = this.vector.getDot(vector);
        return this.unit.clone().scale(dot);
    }, Edge.prototype.getAngleDelta = function(vector) {
        return this.angle - vector.getAngle();
    }, Edge.prototype.getAbc = function() {
        return Edge.getAbc(this.p1.position.x, this.p1.position.y, this.p2.position.x, this.p2.position.y);
    }, Edge.prototype.findIntersection = function(x1, y1, x2, y2) {
        var bounds1 = this.bounds, bounds2 = this._rect.set(x1, y1, x2, y2).expand(Edge.COLLISION_TOLERANCE);
        if (!bounds1.overlaps(bounds2)) return !1;
        var l1 = this.getAbc(), l2 = Edge.getAbc(x1, y1, x2, y2), det = l1.a * l2.b - l2.a * l1.b;
        if (0 === det) return !1;
        var x = (l2.b * l1.c - l1.b * l2.c) / det, y = (l1.a * l2.c - l2.a * l1.c) / det;
        if (!bounds1.contains(x, y) || !bounds2.contains(x, y)) return !1;
        var dot = Newton.Vector.scratch.set(x2 - x1, y2 - y1).getDot(this.normal);
        return dot >= 0 ? !1 : {
            x: x,
            y: y
        };
    }, Edge.prototype.getReflection = function(velocity, restitution) {
        var dir = this.normal.clone(), friction = this.material.friction, velN = dir.multScalar(velocity.getDot(dir)).multScalar(restitution), velT = velocity.clone().sub(velN).multScalar(1 - friction), reflectedVel = velT.sub(velN);
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
    function Layer() {
        return this instanceof Layer ? (this.bodies = [], this.forces = [], this.watchedLayers = [ this ], 
        this.wrapper = void 0, this.container = void 0, this.cachedParticles = [], this.cachedForces = [], 
        this.cachedEdges = [], void 0) : new Layer();
    }
    Layer.prototype.respondTo = function(layers) {
        return this.watchedLayers = layers || [], this;
    }, Layer.prototype.addForce = function(force) {
        return this.forces.push(force), this;
    }, Layer.prototype.wrapIn = function(rect) {
        return this.wrapper = rect, this;
    }, Layer.prototype.containBy = function(rect) {
        return this.container = rect, this;
    }, Layer.prototype.addBody = function(body) {
        return this.bodies.push(body), this;
    }, Layer.prototype.collect = function() {
        var i, ilen, j, jlen, particles = this.cachedParticles, forces = this.cachedForces, edges = this.cachedEdges, bodies = this.bodies, watched = this.watchedLayers;
        for (particles.length = 0, forces.length = 0, edges.length = 0, i = 0, ilen = bodies.length; ilen > i; i++) particles.push.apply(particles, bodies[i].particles);
        for (i = 0, ilen = this.watchedLayers.length; ilen > i; i++) for (forces.push.apply(forces, watched[i].forces), 
        j = 0, jlen = watched[i].bodies.length; jlen > j; j++) edges.push.apply(edges, watched[i].bodies[j].edges);
    }, Layer.prototype.integrate = function(time) {
        for (var particle, particles = this.cachedParticles, forces = this.cachedForces, i = 0, ilen = particles.length; ilen > i; i++) {
            particle = particles[i];
            for (var j = 0, jlen = forces.length; jlen > j; j++) forces[j].applyTo(particle);
            particle.integrate(time);
        }
    }, Layer.prototype.constrain = function() {
        for (var particles = this.cachedParticles, i = 0, ilen = particles.length; ilen > i; i++) this.wrapper && particles[i].wrap(this.wrapper), 
        this.container && particles[i].contain(this.container);
    }, Layer.prototype.collide = function() {
        for (var particles = this.cachedParticles, edges = this.cachedEdges, i = 0, ilen = particles.length; ilen > i; i++) particles[i].collide(edges);
    }, Newton.Layer = Layer;
}("undefined" == typeof exports ? this.Newton = this.Newton || {} : exports), function(Newton) {
    "use strict";
    function LinearGravity(angle, strength, falloff) {
        return this instanceof LinearGravity ? (this.angle = angle, this.strength = strength, 
        this.vector = new Newton.Vector(0, strength).rotate(angle), this.simulator = void 0, 
        void 0) : new LinearGravity(angle, strength, falloff);
    }
    LinearGravity.prototype.addTo = function(simulator) {
        simulator.forces.push(this), this.simulator = simulator;
    }, LinearGravity.prototype.setAngle = function(angle) {
        this.angle = angle, this.vector.set(0, this.strength).rotate(this.angle);
    }, LinearGravity.prototype.setStrength = function(strength) {
        this.strength = strength, this.vector.set(0, this.strength).rotate(this.angle);
    }, LinearGravity.prototype.applyTo = function(particle) {
        particle.accelerateVector(this.vector);
    }, Newton.LinearGravity = LinearGravity;
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
    function mod(a, b) {
        return (a % b + b) % b;
    }
    function Particle(x, y, size, material) {
        return this instanceof Particle ? (this.position = new Newton.Vector(x, y), this.lastPosition = this.position.clone(), 
        this.lastValidPosition = this.position.clone(), this.velocity = new Newton.Vector(0, 0), 
        this.acceleration = new Newton.Vector(0, 0), this.material = material || Newton.Material.simple, 
        this.size = size || 1, this.randomDrag = 0, this.pinned = !1, this.colliding = !1, 
        this.isDestroyed = !1, void 0) : new Particle(x, y, size, material);
    }
    Particle.randomness = 25, Particle.prototype.integrate = function(time) {
        if (!this.pinned) {
            this.velocity.copy(this.position).sub(this.lastPosition);
            var drag = Math.min(1, this.velocity.getSquaredLength() / (this.material.maxVelocitySquared + this.randomDrag));
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
    }, Particle.prototype.destroy = function() {
        this.isDestroyed = !0;
    }, Particle.prototype.moveBy = function(dx, dy) {
        return this.lastPosition = this.position.clone(), this.position.add(dx, dy), this;
    }, Particle.prototype.getDistance = function(x, y) {
        return this.position.clone().subXY(x, y).getLength();
    }, Particle.prototype.pin = function(x, y) {
        x = "undefined" != typeof x ? x : this.position.x, y = "undefined" != typeof y ? y : this.position.y, 
        this.placeAt(x, y), this.pinned = !0, this.size = 1/0;
    }, Particle.prototype.setVelocity = function(x, y) {
        return this.lastPosition.copy(this.position).subXY(x, y), this;
    }, Particle.prototype.contain = function(bounds) {
        this.position.x > bounds.right ? this.position.x = this.lastPosition.x = this.lastValidPosition.x = bounds.right : this.position.x < bounds.left && (this.position.x = this.lastPosition.x = this.lastValidPosition.x = bounds.left), 
        this.position.y > bounds.bottom ? this.position.y = this.lastPosition.y = this.lastValidPosition.y = bounds.bottom : this.position.y < bounds.top && (this.position.y = this.lastPosition.y = this.lastValidPosition.y = bounds.top);
    }, Particle.prototype.wrap = function(bounds) {
        var velocity = this.position.clone().sub(this.lastPosition), newX = mod(this.position.x, bounds.width) + bounds.left, newY = mod(this.position.y, bounds.height) + bounds.top;
        this.lastPosition.x = this.lastValidPosition.x = newX - velocity.x, this.lastPosition.y = this.lastValidPosition.y = newY - velocity.y, 
        this.position.x = newX, this.position.y = newY;
    }, Particle.prototype.applyForce = function(force) {
        this.pinned || this.accelerateVector(force.vector);
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
        var mass = this.getMass(), delta = new Newton.Vector(x, y).sub(this.position), r = Math.max(delta.getLength(), minDist || 1), f = m * mass / (r * r), ratio = m / (m + mass);
        this.acceleration.add({
            x: -f * (delta.x / r) * ratio,
            y: -f * (delta.y / r) * ratio
        });
    }, Particle.prototype.collide = function(edges) {
        for (var nearest, intersect, dx, dy, oldDistance, newDistance, partOfEdge, i = edges.length; i--; ) partOfEdge = this === edges[i].p1 || this === edges[i].p2, 
        intersect = !partOfEdge && edges[i].findIntersection(this.lastPosition.x, this.lastPosition.y, this.position.x, this.position.y), 
        intersect && (dx = intersect.x - this.lastPosition.x, dy = intersect.y - this.lastPosition.y, 
        nearest ? (oldDistance = nearest.dx * nearest.dx + nearest.dy * nearest.dy, newDistance = dx * dx + dy * dy, 
        oldDistance > newDistance && (nearest = {
            dx: dx,
            dy: dy,
            x: intersect.x,
            y: intersect.y,
            wall: edges[i]
        })) : nearest = {
            dx: dx,
            dy: dy,
            x: intersect.x,
            y: intersect.y,
            wall: edges[i]
        });
        if (nearest) {
            var velocity = this.position.clone().sub(this.lastPosition), bouncePoint = nearest.wall.getRepelled(nearest.x, nearest.y), reflectedVelocity = nearest.wall.getReflection(velocity, this.material.restitution);
            return this.position.copy(bouncePoint), this.setVelocity(reflectedVelocity.x, reflectedVelocity.y), 
            this.lastValidPosition = bouncePoint, this.colliding = !0, nearest;
        }
    }, Newton.Particle = Particle;
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
    function RadialGravity(x, y, strength, falloff) {
        return this instanceof RadialGravity ? (this.x = x, this.y = y, this.strength = strength, 
        void 0) : new RadialGravity(x, y, strength, falloff);
    }
    RadialGravity.prototype.setLocation = function(x, y) {
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
            ctx.save(), ctx.strokeStyle = "rgba(255, 255, 255, 0.2)", ctx.lineWidth = 1;
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
    }, RigidConstraint.prototype.getAngleAbout = function(center) {
        for (var angleDelta = 0, i = -1, len = this.particles.length; ++i < len; ) angleDelta += this.particles[i].position.clone().sub(center).getAngleFrom(this.deltas[i]);
        return angleDelta / len;
    }, RigidConstraint.prototype.resolve = function() {
        for (var center = this.getCenterMass(), angleDelta = this.getAngleAbout(center), cos = Math.cos(angleDelta), sin = Math.sin(angleDelta), i = -1, len = this.particles.length; ++i < len; ) {
            var q = this.deltas[i], correction = Newton.Vector(cos * q.x - sin * q.y, sin * q.x + cos * q.y);
            correction.add(center).sub(this.particles[i].position).scale(1), this.particles[i].position.add(correction);
        }
    }, Newton.RigidConstraint = RigidConstraint;
}("undefined" == typeof exports ? this.Newton = this.Newton || {} : exports), function(Newton) {
    "use strict";
    function noop() {}
    function prioritySort(a, b) {
        return b.priority - a.priority;
    }
    function Simulator(preSimulator, renderer, integrationFps, iterations) {
        return this instanceof Simulator ? (this.preSimulator = preSimulator || noop, this.renderer = renderer || noop, 
        this.step = this._step.bind(this), this.lastTime = 0, this.running = !1, this.fps = 0, 
        this.frames = 0, this.countTime = 0, this.countInterval = 250, this.accumulator = 0, 
        this.simulationStep = 1e3 / (integrationFps || 60), this.iterations = iterations || 3, 
        this.layers = [], this.particles = [], this.edges = [], this.forces = [], this.constraints = [], 
        void 0) : new Simulator(preSimulator, renderer, integrationFps, iterations);
    }
    Simulator.prototype.start = function() {
        this.running = !0, this.countTime = Date.now() + 1e3, Newton.frame(this.step);
    }, Simulator.prototype.stop = function() {
        this.running = !1;
    }, Simulator.prototype.simulate = function(time) {
        this.cull(this.particles), this.cull(this.constraints), this.preSimulator(time, this), 
        this.integrate(time), this.constrain(time), this.collide(time);
    }, Simulator.prototype.cull = function(array) {
        var i = 0;
        do array[i].isDestroyed ? array.splice(i, 1) : i++; while (i < array.length);
    }, Simulator.prototype.integrate = function(time) {
        for (var particle, particles = this.particles, forces = this.forces, i = 0, ilen = particles.length; ilen > i; i++) {
            particle = particles[i];
            for (var j = 0, jlen = forces.length; jlen > j; j++) particle.applyForce(forces[j]);
            particle.integrate(time);
        }
    }, Simulator.prototype.constrain = function(time) {
        for (var constraints = this.constraints, j = 0, jlen = this.iterations; jlen > j; j++) for (var i = constraints.length - 1; i >= 0; i--) constraints[i].resolve(time, this.particles);
        this.wrap(this.wrapper), this.contain(this.container);
    }, Simulator.prototype.collide = function() {
        for (var particles = this.particles, edges = this.edges, i = 0, ilen = particles.length; ilen > i; i++) particles[i].collide(edges);
    }, Simulator.prototype.add = function(entity) {
        return entity.addTo(this), this;
    }, Simulator.prototype.addParticles = function(particles) {
        this.particles.push.apply(this.particles, particles);
    }, Simulator.prototype.addEdges = function(edges) {
        this.edges.push.apply(this.edges, edges);
    }, Simulator.prototype.addConstraints = function(constraints) {
        this.constraints.push.apply(this.constraints, constraints), this.constraints.sort(prioritySort);
    }, Simulator.prototype.findParticle = function(x, y, radius) {
        for (var distance, particles = this.particles, found = void 0, nearest = radius, i = 0, ilen = particles.length; ilen > i; i++) distance = particles[i].getDistance(x, y), 
        nearest >= distance && (found = particles[i], nearest = distance);
        return found;
    }, Simulator.prototype.wrap = function(rect) {
        if (rect) for (var particles = this.particles, i = 0, ilen = particles.length; ilen > i; i++) particles[i].wrap(rect);
    }, Simulator.prototype.containBy = function(rect) {
        return this.container = rect, this;
    }, Simulator.prototype.contain = function(rect) {
        if (rect) for (var particles = this.particles, i = 0, ilen = this.particles.length; ilen > i; i++) particles[i].contain(rect);
    }, Simulator.prototype.addBody = function(body) {
        this.particles.push.apply(this.particles, body.particles), this.edges.push.apply(this.edges, body.edges), 
        this.bodies.push(body);
    }, Simulator.prototype.Layer = function() {
        var newLayer = Newton.Layer();
        return this.layers.push(newLayer), newLayer;
    }, Simulator.prototype._step = function() {
        if (this.running) {
            var time = Date.now(), step = time - this.lastTime;
            for (step > 100 && (step = 0), this.accumulator += step; this.accumulator >= this.simulationStep; ) this.simulate(this.simulationStep), 
            this.accumulator -= this.simulationStep;
            this.renderer(step, this), this.frames++, time >= this.countTime && (this.fps = (1e3 * (this.frames / (this.countInterval + time - this.countTime))).toFixed(0), 
            this.frames = 0, this.countTime = time + this.countInterval), this.lastTime = time, 
            Newton.frame(this.step);
        }
    }, Newton.Simulator = Simulator;
}("undefined" == typeof exports ? this.Newton = this.Newton || {} : exports), function(Newton) {
    "use strict";
    function Vector(x, y) {
        return this instanceof Vector ? (this.x = x, this.y = y, void 0) : new Vector(x, y);
    }
    Vector.scratch = new Vector(), Vector.prototype.clone = function() {
        return new Newton.Vector(this.x, this.y);
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
    }, Vector.prototype.mult = Vector.prototype.multVector = function(v) {
        return this.x *= v.x, this.y *= v.y, this;
    }, Vector.prototype.reverse = function() {
        return this.x = -this.x, this.y = -this.y, this;
    }, Vector.prototype.div = function(v) {
        return this.x /= v.x, this.y /= v.y, this;
    }, Vector.prototype.multScalar = Vector.prototype.scale = function(scalar) {
        return this.x *= scalar, this.y *= scalar, this;
    }, Vector.prototype.unit = function() {
        return this.scale(1 / this.getLength()), this;
    }, Vector.prototype.turnRight = function() {
        var x = this.x, y = this.y;
        return this.x = -y, this.y = x, this;
    }, Vector.prototype.turnLeft = function() {
        var x = this.x, y = this.y;
        return this.x = y, this.y = -x, this;
    }, Vector.prototype.rotate = function(angle) {
        var x = this.x, y = this.y, sin = Math.sin(angle), cos = Math.cos(angle);
        return this.x = x * cos - y * sin, this.y = x * sin + y * cos, this;
    }, Vector.prototype.getDot = function(v) {
        return this.x * v.x + this.y * v.y;
    }, Vector.prototype.getCross = function(v) {
        return this.x * v.y + this.y * v.x;
    }, Vector.prototype.getLength = function() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }, Vector.prototype.getSquaredLength = function() {
        return this.x * this.x + this.y * this.y;
    }, Vector.prototype.getAngle = function() {
        return Math.atan2(this.y, this.x);
    }, Vector.prototype.getAngleFrom = function(v) {
        var cos = this.x * v.x + this.y * v.y, sin = this.y * v.x - this.x * v.y;
        return Math.atan2(sin, cos);
    }, Newton.Vector = Vector;
}("undefined" == typeof exports ? this.Newton = this.Newton || {} : exports);
//# sourceMappingURL=newton-map.js