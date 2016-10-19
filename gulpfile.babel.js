import gulp from 'gulp';
import sourcemaps from 'gulp-sourcemaps';
import sass from 'gulp-sass';
import babel from 'rollup-plugin-babel';
import babelrc from 'babelrc-rollup';
import rollup from 'gulp-better-rollup';

const pkg = require('./package.json');

gulp.task('style', () => {
  return gulp.src('./src/as24-autocomplete.scss')
    .pipe(sass())
    .pipe(gulp.dest('./dist'));
});

gulp.task('js', function() {
  gulp.src('./src/as24-autocomplete.js')
    .pipe(sourcemaps.init())
    .pipe(rollup({
      plugins: [ babel(babelrc()) ]
    }, [{
        dest: pkg['main'],
        format: 'iife',
    }]))
    .pipe(sourcemaps.write(''))
    .pipe(gulp.dest('dist'))
});

gulp.task('default', ['style', 'js']);
