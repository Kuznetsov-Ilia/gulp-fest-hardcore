var gulp = require('gulp');
var fest = require('../index.js');
var rename = require('gulp-rename');
var concat = require('gulp-concat');
var beautify = require('gulp-beautify');

gulp.task('default', function () {
  return gulp.src('new.xml')
    .pipe(rename({extname:'.js'}))
    .on('data', setTmplName)
    .pipe(festHardcore({name:1}))
    .pipe(concat('index.js'))
    .pipe(festHardcore({finalize: 1}))
    //.pipe(beautify(conf.beautify))
    .pipe(gulp.dest('new'));
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
