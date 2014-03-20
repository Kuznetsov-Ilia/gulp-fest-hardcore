const PLUGIN_NAME = 'fest-simple';
var through = require('through2');
var gutil = require('gulp-util');
//var log = gutil.log;
var PluginError = gutil.PluginError;
var Parser = require('./parser.js');

module.exports = function () {
  var stream = through.obj(function (file, enc, callback) {
    if (file.isNull()) {
      this.emit('error', new PluginError(PLUGIN_NAME, 'Null not supported!'));
      this.push(file);
      return callback();
    }

    if (file.isBuffer()) {
      var parser = new Parser();
      parser.write(file.contents.toString('utf8'), file.path);
      file.contents = parser.getSource();

      this.push(file);
      return callback();
    }

    if (file.isStream()) {
      this.emit('error', new PluginError(PLUGIN_NAME, 'Streams not supported!'));
      this.push(file);
      return callback();
    }
  });

  return stream;
}
