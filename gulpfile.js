'use strict';

var gulp = require('gulp'),
  nodemon = require('gulp-nodemon'),
  plumber = require('gulp-plumber'),
  livereload = require('gulp-livereload'),
  mocha = require('gulp-mocha'),
  autoPrefixer = require('gulp-autoprefixer'),
  cached = require('gulp-cached'),
  debug = require('gulp-debug'),
  gulpIf = require('gulp-if'),
  minifyCss = require('gulp-minify-css'),
  notify = require('gulp-notify'),
  remember = require('gulp-remember'),
  sass = require('gulp-sass'),
  sourceMaps = require('gulp-sourcemaps'),
  browserSync = require('browser-sync').create(),
  combiner = require('stream-combiner2').obj;

var isDevelopment = !process.env.NODE_ENV;
var paths = {
  css: 'public/css/*.css',
  sass: 'public/sass/*.sass'
};

var sassTask = function() {
  return combiner(
    gulp.src(paths.sass),
    cached('sass'),
    gulpIf(isDevelopment, sourceMaps.init()),
    sass(),
    debug({title: 'SASS'}),
    gulpIf(!isDevelopment, minifyCss()),
    gulpIf(isDevelopment, sourceMaps.write()),
    autoPrefixer({
      browsers: ['last 2 versions'],
      cascade: false
    }),
    remember('sass'),
    gulp.dest('public/css'),
    browserSync.stream()
  ).on('error', notify.onError());
};
gulp.task('sass', sassTask);


gulp.task('watch', function() {
  gulp.watch('./public/css/*.scss', ['sass']);
});

gulp.task('develop', function () {
  livereload.listen();
  nodemon({
    script: 'app.js',
    ext: 'js coffee ejs',
    stdout: false
  }).on('readable', function () {
    this.stdout.on('data', function (chunk) {
      if(/^Express server listening on port/.test(chunk)){
        livereload.changed(__dirname);
      }
    });
    this.stdout.pipe(process.stdout);
    this.stderr.pipe(process.stderr);
  });
});

function handleError(err) {
  console.log(err.toString());
  this.emit('end');
}

gulp.task("test", function() {
  return gulp.src('backendTest/**/*.test.js')
    .pipe(mocha(({reporter: 'spec', timeout: '30000'}))
      .on("error", handleError));
});

gulp.task('default', [
  'sass',
  'develop',
  'watch'
]);
