var gulp = require('gulp');
var gutil = require('gulp-util');
var rename = require('gulp-rename');
var beautify = require('gulp-beautify');
var festHardcore = require('./index.js');
//var spawn = require('gulp-spawn-shim');
//var log = gutil.log;
gulp.task('default', [/*'fest-lua', */'fest-js']);

gulp.task('fest-lua', function () {
  return gulp.src('test/xml/*.xml')
    .pipe(rename(function (path) {
      path.extname = '.lua'
    }))
    .pipe(festHardcore('lua'))
  /*.pipe(spawn({
      cmd: '/./LuaSrcDiet.lua ../../gulp-fest-hardcore/test/lua/for.lua -o test.lua'
    }))*/
  .pipe(gulp.dest('test/lua'));
})

gulp.task('fest-js', function () {
  return gulp.src('test/xml/*.xml')
    .pipe(rename(function (path) {
      path.extname = '.js'
    }))
    .pipe(festHardcore())
    .pipe(gulp.dest('test/js'));
})
//var spawn = require('child_process').spawn;

/*gulp.watch('test/lua/.lua', function (event) {
  var dest = event.path.split('/');
  dest[dest.length - 2] = 'lua-min';
  dest = dest.join('/');
  var lua = spawn('LuaSrcDiet.lua', [event.path, '-o', dest]);

  lua.stdout.on('data', function (data) {
    console.log('stdout: ' + data);
  });

  lua.stderr.on('data', function (data) {
    console.log('stderr: ' + data);
  });


})
*/
