// Include gulp
var gulp = require('gulp');
var sourcemaps = require('gulp-sourcemaps');
var babel = require('gulp-babel');
var dotenvToJson = require ('gulp-dotenv-to-json');
var webpack = require('webpack-stream');
var fs = require('fs');
var concat = require('gulp-concat');
 
gulp.task('scripts', function() {
  return gulp.src(['./lib/file3.js', './lib/file1.js', './lib/file2.js'])
    .pipe(concat('all.js'))
    .pipe(gulp.dest('./dist/'));
});

gulp.task('dotenvToJson', () => {
    dotenvToJson.copy({
        keys : ['FIREBASE_API_KEY', 
                'FIREBASE_AUTH_DOMAIN', 
                'FIREBASE_DATABASE_URL', 
                'FIREBASE_STORAGE_BUCKET', 
                'FIREBASE_MESSAGING_SENDER_ID' ],
        paths : {
            env : '.env',
            jenv : 'env.json'
        }
    });
    gulp.src(['./env-build/part1.js','./env.json', './env-build/part2.js'])
    .pipe(concat('firebase.config.js', {newLine: ''}))
    .pipe(gulp.dest('dist/public/scripts'));
    // gulp.src('.env')
    // .pipe(gulp.dest('dist'));
    // fs.writeFileSync('dist/public/scripts/firebase.config.js', 'var firebaseConfig = ' + fs.readFile('.env') + '; firebase.initializeApp(firebaseConfig);');

});

// gulp.task('babel', () => {
//     gulp.src(['public/**/*.js', 'server/**/*.js'], {base: '.'})
//         .pipe(sourcemaps.init())
//         .pipe(babel({
//             presets: ['es2015']
//         }))
//         .pipe(sourcemaps.write('.'))
//         .pipe(gulp.dest('dist'))
// });

 gulp.task('moveHTML', () => {
     gulp.src(['public/**/**', 'node_modules/**/*.*'], {base: '.'})
     .pipe(gulp.dest('dist'))
 });

// gulp.task('webpack', ['dotenvToJson'], function() {
//     return gulp.src('./public/scripts/config.js')
//   .pipe(webpack( require('./webpack.config.js') ))
//   .pipe(gulp.dest('dist/'));
// } );

// gulp.task('dotenvToJson', function(){
//     dotenvToJson.copy({
//         keys : ['SERVER'],
//         paths : {
//             env : '.env',
//             jenv : 'env3.json'
//         }
//     });
// });

gulp.task('default', ['moveHTML','dotenvToJson']);


