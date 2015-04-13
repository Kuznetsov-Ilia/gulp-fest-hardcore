var Parser = require('./parser.js');
module.exports = function (source) {
  var parser = new Parser();
  parser.write(source, '');
  return parser.getSource();
}
