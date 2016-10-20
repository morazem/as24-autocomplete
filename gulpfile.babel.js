import gulp from 'gulp';
import sourcemaps from 'gulp-sourcemaps';
import sass from 'gulp-sass';
import babel from 'rollup-plugin-babel';
import babelrc from 'babelrc-rollup';
import rollup from 'gulp-better-rollup';

var browserSync = require('browser-sync').create();

const pkg = require('./package.json');

gulp.task('sass', () => {
  return gulp.src('./src/as24-autocomplete.scss')
    .pipe(sass())
    .pipe(gulp.dest('./dist'));
});

gulp.task('js', function() {
  gulp.src('./src/as24-autocomplete.js')
    // .pipe(sourcemaps.init())
    .pipe(rollup(
      { plugins: [ babel(babelrc()) ] },
      [ { dest: pkg['main'], format: 'iife' } ]
    ))
    // .pipe(sourcemaps.write(''))
    .pipe(gulp.dest('dist'))
});

gulp.task('sass-watch', ['sass'], done => {browserSync.reload(); done()});
gulp.task('js-watch', ['js'], done => {browserSync.reload(); done()});

gulp.task('serve', ['sass'], function() {
    browserSync.init({
      ghostMode: {
        clicks: true,
        forms: true,
        scroll: false
      },
      server: ["docs", "./"]
    });
    gulp.watch('src/**/*.scss', ['sass-watch']);
    gulp.watch('src/**/*.js', ['js-watch']);
    gulp.watch('docs/*.html').on('change', browserSync.reload);
});

gulp.task('default', ['serve']);
