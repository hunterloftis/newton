;(function(Newton) {

  'use strict';

  function rgbToHex(r, g, b) {
    return ((1 << 24) + (r << 16) + (g << 8) + b);
  }

  function PixiRenderer(el, width, height) {
    if (!(this instanceof PixiRenderer)) return new PixiRenderer(el, width, height);

    this.stage = new PIXI.Stage(0x000000, true);
    this.stage.setInteractive(true);

    this.width = width;
    this.height = height;
    this.renderer = PIXI.autoDetectRenderer(this.width, this.height, null, false, true);
    this.renderer.view.style.display = "block";
    el.appendChild(this.renderer.view);

    this.infoText = new PIXI.Text("FPS: ??", { fill: '#ffffff', font:'10pt Helvetica' });
    this.stage.addChild(this.infoText);
    this.graphics = new PIXI.Graphics();
    this.stage.addChild(this.graphics);
    this.callback = this.callback.bind(this); // TODO: shim for Function.bind
  }

  PixiRenderer.prototype = {
    callback: function(time, sim) {
      var particles = 0;
      var edges = 0;

      this.graphics.clear();

      for (var i = 0, ilen = sim.layers.length; i < ilen; i++) {
        for (var j = 0, jlen = sim.layers[i].bodies.length; j < jlen; j++) {
          particles += this.drawParticles(sim.layers[i].bodies[j].particles);
          edges += this.drawEdges(sim.layers[i].bodies[j].edges);
        }
        this.drawForces(sim.layers[i].forces);
      }

      this.infoText.setText("FPS: " + sim.fps + "\nparticles: " + particles + "\nedges: " + edges);

      this.renderer.render(this.stage);
    },
    drawForces: function(forces) {

      this.graphics.lineStyle(2, 0xFFFFFF, 0.30);

      for (var i = 0, ilen = forces.length; i < ilen; i++) {
        var force = forces[i];
        if (force instanceof Newton.RadialGravity) {
          this.graphics.beginFill(0xFFFFFF, 0.20);
          this.graphics.drawCircle(force.x, force.y, force.strength * force.strength * 0.5);
          this.graphics.endFill();
        }
      }
    },
    drawParticles: function(particles) {
      var particle, pos, last, mass, brightness;

      for (var j = 0, jlen = particles.length; j < jlen; j++) {
        particle = particles[j];
        pos = particle.position;
        last = particle.lastValidPosition;
        mass = particle.getMass();
        brightness = ~~((mass - 1) / 5 * 128);
        if (particle.colliding) {
          this.graphics.lineStyle(mass, rgbToHex(255, 255, 100), 1);
        }
        else {
          this.graphics.lineStyle(mass, rgbToHex(255, 28 + brightness, 108 + brightness), 1);
        }
        this.graphics.moveTo(last.x - 1, last.y);
        this.graphics.lineTo(pos.x + 1, pos.y);
      }

      return particles.length;
    },
    drawEdges: function(edges) {
      this.graphics.lineStyle(1, 0xFFFFFF, 0.5);
      var edge, i = edges.length;
      while (i--) {
        edge = edges[i].getCoords();
        this.graphics.moveTo(edge.x1, edge.y1);
        this.graphics.lineTo(edge.x2, edge.y2);
      }
      return edges.length;
    }
  };

  Newton.PixiRenderer = PixiRenderer;

})(typeof exports === 'undefined'? this['Newton']=this['Newton'] || {} : exports);
