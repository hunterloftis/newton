!function(Newton) {
    "use strict";
    function Body(material) {
        return this instanceof Body ? (this.particles = [], this.edges = [], this.material = material, 
        void 0) : new Body(material);
    }
    Body.prototype.addParticle = function(particle) {
        this.particles.push(particle);
    }, Body.prototype.addEdge = function(edge) {
        this.edges.push(edge);
    }, Body.prototype.each = function(method, args) {
        for (var particle, i = this.particles.length; i--; ) particle = this.particles[i], 
        particle[method].apply(particle, args);
    }, Body.prototype.callback = function(callback) {
        for (var i = this.particles.length; i--; ) callback(this.particles[i]);
    }, Newton.Body = Body;
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
        return bounds1.contains(x, y) && bounds2.contains(x, y) ? {
            x: x,
            y: y
        } : !1;
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
        this.wrapper = void 0, void 0) : new Layer();
    }
    Layer.prototype.respondTo = function(layers) {
        return this.watchedLayers = layers || [], this;
    }, Layer.prototype.addForce = function(force) {
        return this.forces.push(force), this;
    }, Layer.prototype.wrapIn = function(rect) {
        return this.wrapper = rect, this;
    }, Layer.prototype.addBody = function(body) {
        return this.bodies.push(body), this;
    }, Layer.prototype.integrate = function(time) {
        var i, ilen, j, jlen, forces, particles, particle, edges;
        for (forces = [], particles = [], edges = [], i = 0, ilen = this.bodies.length; ilen > i; i++) particles = particles.concat(this.bodies[i].particles);
        for (i = 0, ilen = this.watchedLayers.length; ilen > i; i++) {
            forces = forces.concat(this.watchedLayers[i].forces);
            for (var j = 0, jlen = this.watchedLayers[i].bodies.length; jlen > j; j++) edges = edges.concat(this.watchedLayers[i].bodies[j].edges);
        }
        for (i = 0, ilen = particles.length; ilen > i; i++) {
            for (particle = particles[i], j = 0, jlen = forces.length; jlen > j; j++) forces[j].applyTo(particle);
            particle.integrate(time), this.wrapper && particle.wrap(this.wrapper), particle.collide(edges);
        }
    }, Newton.Layer = Layer;
}("undefined" == typeof exports ? this.Newton = this.Newton || {} : exports), function(Newton) {
    "use strict";
    function LinearGravity(angle, strength, falloff) {
        return this instanceof LinearGravity ? (this.angle = angle, this.strength = strength, 
        this.vector = new Newton.Vector(0, strength).rotate(angle), void 0) : new LinearGravity(angle, strength, falloff);
    }
    LinearGravity.prototype.setAngle = function(angle) {
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
        this.size = size || 1, this.randomDrag = Math.random() * Particle.randomness + 1e-10, 
        void 0) : new Particle(x, y, size, material);
    }
    Particle.randomness = 25, Particle.prototype.integrate = function(time) {
        this.velocity.copy(this.position).sub(this.lastPosition);
        var drag = Math.min(1, this.velocity.getSquaredLength() / (this.material.maxVelocitySquared + this.randomDrag));
        this.velocity.scale(1 - drag), this.acceleration.scale(1 - drag).scale(time * time), 
        this.lastPosition.copy(this.position), this.position.add(this.velocity).add(this.acceleration), 
        this.acceleration.zero(), this.lastValidPosition.copy(this.lastPosition);
    }, Particle.prototype.placeAt = function(x, y) {
        return this.position.set(x, y), this.lastPosition.copy(this.position), this.lastValidPosition.copy(this.lastPosition), 
        this;
    }, Particle.prototype.moveBy = function(dx, dy) {
        return this.lastPosition = this.position.clone(), this.position.add(dx, dy), this;
    }, Particle.prototype.setVelocity = function(x, y) {
        return this.lastPosition.copy(this.position).subXY(x, y), this;
    }, Particle.prototype.contain = function(bounds) {
        this.position.x > bounds.right ? this.position.x = this.lastPosition.x = this.lastValidPosition.x = bounds.right : this.position.x < bounds.left && (this.position.x = this.lastPosition.x = this.lastValidPosition.x = bounds.left), 
        this.position.y > bounds.bottom ? this.position.y = this.lastPosition.y = this.lastValidPosition.y = bounds.bottom : this.position.y < bounds.top && (this.position.y = this.lastPosition.y = this.lastValidPosition.y = bounds.top);
    }, Particle.prototype.wrap = function(bounds) {
        var velocity = this.position.clone().sub(this.lastPosition), newX = mod(this.position.x, bounds.width) + bounds.left, newY = mod(this.position.y, bounds.height) + bounds.top;
        this.lastPosition.x = this.lastValidPosition.x = newX - velocity.x, this.lastPosition.y = this.lastValidPosition.y = newY - velocity.y, 
        this.position.x = newX, this.position.y = newY;
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
            this.lastValidPosition = bouncePoint, nearest;
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
            brightness = ~~(128 * ((mass - 1) / 5)), this.graphics.lineStyle(mass, rgbToHex(255, 28 + brightness, 108 + brightness), 1), 
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
            var ctx = this.ctx, particleCount = 0, edgeCount = 0;
            this.clear(ctx, time);
            for (var i = 0, ilen = sim.layers.length; ilen > i; i++) {
                for (var j = 0, jlen = sim.layers[i].bodies.length; jlen > j; j++) particleCount += this.drawParticles(ctx, sim.layers[i].bodies[j].particles), 
                edgeCount += this.drawEdges(ctx, sim.layers[i].bodies[j].edges);
                this.drawForces(ctx, sim.layers[i].forces);
            }
            this.drawCounts(ctx, particleCount, edgeCount), this.drawFPS(ctx, sim);
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
            var particle, pos, last, mass, brightness;
            ctx.save(), ctx.lineCap = "butt";
            for (var j = 0, jlen = particles.length; jlen > j; j++) particle = particles[j], 
            pos = particle.position, last = particle.lastValidPosition, mass = particle.getMass(), 
            brightness = ~~(128 * ((mass - 1) / 5)), ctx.beginPath(), ctx.lineWidth = mass, 
            ctx.strokeStyle = "rgba(" + [ 255, 28 + brightness, 108 + brightness ].join(",") + ", 1)", 
            ctx.moveTo(last.x, last.y), ctx.lineTo(pos.x, pos.y + 2), ctx.stroke();
            return ctx.restore(), particles.length;
        },
        drawEdges: function(ctx, edges) {
            ctx.save(), ctx.strokeStyle = "rgba(255, 255, 255, 0.2)", ctx.lineWidth = 1;
            for (var edge, i = edges.length; i--; ) edge = edges[i].getCoords(), ctx.beginPath(), 
            ctx.moveTo(edge.x1, edge.y1), ctx.lineTo(edge.x2, edge.y2), ctx.closePath(), ctx.stroke();
            return ctx.restore(), edges.length;
        },
        drawCounts: function(ctx, particleCount, edgeCount) {
            ctx.save(), ctx.fillStyle = "#fff", ctx.font = "10pt Helvetica", ctx.fillText("Particles: " + particleCount, 10, 20), 
            ctx.fillText("Edges: " + edgeCount, 10, 40), ctx.restore();
        },
        drawFPS: function(ctx, sim) {
            var text = "FPS: " + sim.fps;
            ctx.save(), ctx.fillStyle = "#fff", ctx.font = "10pt Helvetica", ctx.fillText(text, 10, 60), 
            ctx.restore();
        }
    }, Newton.Renderer = Renderer;
}("undefined" == typeof exports ? this.Newton = this.Newton || {} : exports), function(Newton) {
    "use strict";
    function noop() {}
    function Simulator(simulator, renderer, integrationFps) {
        return this instanceof Simulator ? (this.simulator = simulator || noop, this.renderer = renderer || noop, 
        this.step = this.getStep(), this.lastTime = 0, this.running = !1, this.fps = 0, 
        this.frames = 0, this.countTime = 0, this.countInterval = 250, this.accumulator = 0, 
        this.integrationStep = 1e3 / (integrationFps || 60), this.layers = [], void 0) : new Simulator(simulator, renderer, integrationFps);
    }
    Simulator.prototype.start = function() {
        this.running = !0, this.countTime = Date.now() + 1e3, Newton.frame(this.step);
    }, Simulator.prototype.stop = function() {
        this.running = !1;
    }, Simulator.prototype.integrate = function(time) {
        for (var i = 0, ilen = this.layers.length; ilen > i; i++) this.layers[i].integrate(time);
    }, Simulator.prototype.Layer = function() {
        var newLayer = Newton.Layer();
        return this.layers.push(newLayer), newLayer;
    }, Simulator.prototype.getStep = function() {
        var self = this;
        return function() {
            if (self.running) {
                var time = Date.now(), step = time - self.lastTime;
                for (step > 100 && (step = 0), self.accumulator += step; self.accumulator >= self.integrationStep; ) self.simulator(self.integrationStep, self), 
                self.integrate(self.integrationStep), self.accumulator -= self.integrationStep;
                self.renderer(step, self), self.frames++, time >= self.countTime && (self.fps = (1e3 * (self.frames / (self.countInterval + time - self.countTime))).toFixed(0), 
                self.frames = 0, self.countTime = time + self.countInterval), self.lastTime = time, 
                Newton.frame(self.step);
            }
        };
    }, Newton.Simulator = Simulator;
}("undefined" == typeof exports ? this.Newton = this.Newton || {} : exports), function(Newton) {
    "use strict";
    function Vector(x, y) {
        return this instanceof Vector ? (this.x = x, this.y = y, void 0) : new Vector(x, y);
    }
    Vector.prototype.clone = function() {
        return new Newton.Vector(this.x, this.y);
    }, Vector.prototype.copy = function(v) {
        return this.x = v.x, this.y = v.y, this;
    }, Vector.prototype.zero = function() {
        return this.x = 0, this.y = 0, this;
    }, Vector.prototype.set = function(x, y) {
        return this.x = x, this.y = y, this;
    }, Vector.prototype.add = function(v) {
        return this.x += v.x, this.y += v.y, this;
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
    }, Newton.Vector = Vector;
}("undefined" == typeof exports ? this.Newton = this.Newton || {} : exports);