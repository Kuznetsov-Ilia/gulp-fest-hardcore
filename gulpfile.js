var gulp = require('gulp');
var gutil = require('gulp-util');
var rename = require('gulp-rename');
var beautify = require('gulp-beautify');
var festHardcore = require('./index.js');
//var spawn = require('gulp-spawn-shim');
//var log = gutil.log;
gulp.task('default', ['fest-lua', 'fest-js']);

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
    .pipe(beautify({
      indentSize: 2
    }))
    .pipe(gulp.dest('test/js'));
})
var concat = require('gulp-concat');
gulp.task('dom', function () {
  return gulp.src('test/new.xml')
    .pipe(rename({extname:'.js'}))
    .on('data', setTmplName)
    .pipe(festHardcore({name:1}))
    .pipe(concat('index.js'))
    .pipe(festHardcore({finalize: 1}))
    //.pipe(beautify(conf.beautify))
    .pipe(gulp.dest('test'));
});

function setTmplName(file) {
  var name = file.path
      .replace(file.base, '')
      .replace('/template/', '/')
      .replace('/index.js', '/')
      .replace('.js', '');
  
  if (name[name.length-1] == '/') {
    name = name.slice(0, -1);
  }
  file.name = name;
}

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
