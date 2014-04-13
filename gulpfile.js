var gulp = require('gulp');
var gutil = require('gulp-util');
var rename = require('gulp-rename');
var beautify = require('gulp-beautify');
var festHardcore = require('./index.js');
var log = gutil.log;
gulp.task('default', function () {
  return gulp.src('test/xml/*.xml')
    .pipe(rename(function (path) {
      path.extname = '.js'
    }))
    .pipe(festHardcore())
    .pipe(beautify({
      indentSize: 2
    }))
    .pipe(gulp.dest('test/output'))
})
