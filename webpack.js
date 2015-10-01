var Parser = require('./parser');
module.exports = function (source) {
  this.cacheable();
  var parser = new Parser();
  parser.write(source, this.resourse);
  return parser.getSource();
}
