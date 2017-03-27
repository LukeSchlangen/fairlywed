// Include gulp
var gulp = require('gulp');
var sourcemaps = require('gulp-sourcemaps');
var babel = require('gulp-babel');
var webpack = require('webpack-stream');
var fs = require('fs');
var concat = require('gulp-concat');


// for environment variables
var m = {};
 
gulp.task('scripts', function() {
  return gulp.src(['./lib/file3.js', './lib/file1.js', './lib/file2.js'])
    .pipe(concat('all.js'))
    .pipe(gulp.dest('./dist/'));
});

gulp.task('dotenvToJson', () => {
    copy({
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

function validateParams(params) {
    var attrs = ['keys', 'paths'];
    for (var i in attrs) {
        if (!params[attrs[i]]) {
            throw attrs[i]+' must be truthy';
        }
    }

    if (!params.paths.env || !params.paths.jenv) {
        throw "one of the paths is missing. The params.env object must include the env and jenv attribute";
    }

    return true;
}

function copy(params) {
    validateParams(params);
    var keys = params.keys;
    var paths = params.paths;
    var o = {};
    if (fs.existsSync(paths.env)) {
        // If .env file exists, create .env.json from the .env file
        var fileContent = fs.readFileSync(paths.env, 'utf8');
        var lines = fileContent.split('\n');
        for (var i in lines) {
            if (lines[i] === '') {
                continue;
            }
            var content = lines[i].split('=');
            if (keys.indexOf(content[0]) != -1 || keys.indexOf('*') != -1) {
                o[content[0]] = content[1];
            }
        }
    } else {
        // If .env file does not exist, create .env.json from environment variables
        keys.forEach(function(key) {
            o[key] = process.env[key];
        });
    }
    fs.writeFile(paths.jenv, JSON.stringify(o));
    console.log('----- json env version written successfully -------');
};


module.exports = m;

 gulp.task('moveHTML', () => {
     gulp.src(['public/**/**', 'node_modules/**/*.*'], {base: '.'})
     .pipe(gulp.dest('dist'))
 });

gulp.task('default', ['moveHTML','dotenvToJson']);


