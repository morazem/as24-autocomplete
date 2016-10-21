import gulp from 'gulp';
import sourcemaps from 'gulp-sourcemaps';
import copy from 'gulp-contrib-copy';
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

gulp.task('js', () => {
  return gulp.src('./src/as24-autocomplete.js')
    .pipe(sourcemaps.init())
    .pipe(rollup(
      { plugins: [ babel(babelrc()) ] },
      [
          { dest: pkg['main'], format: 'iife' },
          { dest: pkg['jsnext:main'] }
      ],
    ))
    .pipe(sourcemaps.write(''))
    .pipe(gulp.dest('dist'))
});

gulp.task('copy', () => {
    return gulp.src('dist/*')
        .pipe(copy())
        .pipe(gulp.dest('docs/'));
});

gulp.task('sass-watch', ['sass', 'copy'], done => {browserSync.reload(); done()});
gulp.task('js-watch', ['js', 'copy'], done => {browserSync.reload(); done()});

gulp.task('serve', ['sass', 'js', 'copy'], () => {
    browserSync.init({
      ghostMode: {
        clicks: true,
        forms: true,
        scroll: false
      },
      server: ["docs"]
    });
    gulp.watch('src/**/*.scss', ['sass-watch']);
    gulp.watch('src/**/*.js', ['js-watch']);
    gulp.watch('docs/*.html').on('change', browserSync.reload);
});


gulp.task('default', ['js', 'sass', 'copy']);
