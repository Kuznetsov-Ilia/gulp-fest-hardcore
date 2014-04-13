const PLUGIN_NAME = 'gulp-fest-hardcore';
var through = require('through2');
var gutil = require('gulp-util');
//var log = gutil.log;
var PluginError = gutil.PluginError;
var Parser = require('./parser.js');

module.exports = function (options) {
  var stream = through.obj(function (file, enc, callback) {
    if (file.isNull()) {
      this.emit('error', new PluginError(PLUGIN_NAME, 'Null not supported!'));
      this.push(file);
      return callback();
    }

    if (file.isBuffer()) {
      //log('Buffer mode');
      var parser = new Parser(options);
      parser.write(file.contents.toString('utf8'), file.path);
      file.contents = parser.getSource();

      this.push(file);
      return callback();
    }

    if (file.isStream()) {
      // this.emit('error', new PluginError(PLUGIN_NAME, 'Streams not supported!'));
      /*log('Stream mode');

      file.contents = file.contents.pipe(Parser());*/
      this.push(file);
      return callback();
    }
  });

  return stream;
}
