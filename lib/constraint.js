var id = 0;

function Constraint() {
  this.id = id++;
}

Constraint.prototype.type = 'Constraint';
Constraint.prototype.priority = Infinity;
Constraint.prototype.correct = function() {};

Constraint.prototype.setPriority = function(types) {
  for (var i = 0; i < types.length; i++) {
    if (this instanceof types[i]) {
      this.priority = i;
      return;
    }
  }
  this.priority = Infinity;
  return;
};

module.exports = Constraint;
