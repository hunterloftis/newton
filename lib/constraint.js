var id = 0;

function Constraint() {
  this.id = id++;
}

Constraint.prototype.type = 'Constraint';
Constraint.prototype.priority = 10;
Constraint.prototype.correct = function() {};

module.exports = Constraint;
