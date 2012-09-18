function Stepper(callback) {
  this.callback = callback;
  this.step = this.getStep();
  this.lastTime = 0;
  this.lastStep = 0;
  this.started = false;
}

Stepper.prototype.start = function() {
  this.started = true;
  requestAnimationFrame(this.step);
};

Stepper.prototype.stop = function() {
  this.started = false;
};

Stepper.prototype.getStep = function() {
  var self = this;
  return function generatedStep() {
    var time = Date.now();
    var step = self.lastTime ? time - self.lastTime : 0;
    if (step > 100) step = 100; // in case you leave / return
    var correction = (step && self.lastStep) ? step / self.lastStep : 1;
    self.callback(step, correction);
    self.lastTime = time;
    self.lastStep = step;
    if (self.started) requestAnimationFrame(self.step);
  };
};