
var gulp = require('gulp');
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var importCss = require('gulp-import-css');
var csscomb = require('gulp-csscomb');

gulp.task('sass', function () {
  gulp.src('src/styles/*.scss')
    .pipe(sass.sync().on('error', function (err) {
      console.log(err)
    }))
    .pipe(autoprefixer([
     'Chrome >= 20',
     'Firefox >= 24',
     'Explorer >= 6',
     'Opera >= 12',
     'Safari >= 6',
      'iOS >= 6',
      'Android 2.3',
      'Android >= 4'
     ]))
    .pipe(importCss())
    .pipe(csscomb())
    .pipe(gulp.dest('dist/styles'));
});

gulp.task('start', function () {
  gulp.watch('src/styles/*.scss', ['sass']);
});

gulp