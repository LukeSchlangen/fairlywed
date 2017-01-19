// Include gulp
var gulp = require('gulp');
var sourcemaps = require('gulp-sourcemaps');
var babel = require('gulp-babel');
var dotenvToJson = require ('gulp-dotenv-to-json');
var webpack = require('webpack-stream');

gulp.task('dotenvToJson', () => {
    dotenvToJson.copy({
        keys : ['FIREBASE_API_KEY', 'FIREBASE_AUTH_DOMAIN', 'FIREBASE_DATABASE_URL', 'FIREBASE_STORAGE_BUCKET', 'FIREBASE_MESSAGING_SENDER_ID' ],
        paths : {
            env : '.env',
            jenv : 'env.json'
        }
    });
    gulp.src('./env.json')
    .pipe(gulp.dest('dist'));
    gulp.src('.env')
    .pipe(gulp.dest('dist'));
});

gulp.task('babel', () => {
    gulp.src(['public/**/*.js', 'server/**/*.js'], {base: '.'})
        .pipe(sourcemaps.init())
        .pipe(babel({
            presets: ['es2015']
        }))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('dist'))
});

 gulp.task('moveHTML', () => {
     gulp.src(['public/**/*.html', 'node_modules/**/*.*'], {base: '.'})
     .pipe(gulp.dest('dist'))
 });

gulp.task('webpack', ['dotenvToJson'], function() {
    return gulp.src('./public/scripts/config.js')
  .pipe(webpack( require('./webpack.config.js') ))
  .pipe(gulp.dest('dist/'));
} )

gulp.task('default', ['webpack']);


