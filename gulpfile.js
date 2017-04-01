// Include gulp
var gulp = require('gulp');
var fs = require('fs');
var clean = require('gulp-clean');
 
gulp.task('remove-built-files', function () {
    return gulp.src('dist', {read: false})
        .pipe(clean());
});

// for environment variables
var m = {};

// gulp.task('scripts', function () {
//     return gulp.src(['./lib/file3.js', './lib/file1.js', './lib/file2.js'])
//         .pipe(concat('all.js'))
//         .pipe(gulp.dest('./dist/'));
// });

gulp.task('createDist',['remove-built-files'], () => {
    gulp.src(['public/**/*.*'], { base: '.' })
        .pipe(gulp.dest('dist'));
    
    copy({
        keys: ['FIREBASE_API_KEY',
            'FIREBASE_AUTH_DOMAIN',
            'FIREBASE_DATABASE_URL',
            'FIREBASE_STORAGE_BUCKET',
            'FIREBASE_MESSAGING_SENDER_ID'],
        paths: {
            env: '.env',
            jenv: 'env.json'
        }
    });
});

gulp.task('default', ['createDist']);

// ----------- START CODE TO CREATE FIREBASE CONFIG VARIABLES FROM ENVIRONMENT VARIABLES -------------- //
function validateParams(params) {
    var attrs = ['keys', 'paths'];
    for (var i in attrs) {
        if (!params[attrs[i]]) {
            throw attrs[i] + ' must be truthy';
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
        keys.forEach(function (key) {
            o[key] = process.env[key];
        });
    }


    var firebaseConfigText = 'var config =  ' + JSON.stringify(o) + ';' +
        '  const firebaseConfig = {' +
        '    apiKey: config.FIREBASE_API_KEY,' +
        '    authDomain: config.FIREBASE_AUTH_DOMAIN,' +
        '    databaseURL: config.FIREBASE_DATABASE_URL,' +
        '    storageBucket: config.FIREBASE_STORAGE_BUCKET,' +
        '    messagingSenderId: config.FIREBASE_MESSAGING_SENDER_ID' +
        '  };' +
        'firebase.initializeApp(firebaseConfig);'

    writeFile('dist/public/scripts/firebase.config.js', firebaseConfigText);
};
// ----------- END CODE TO CREATE FIREBASE CONFIG VARIABLES FROM ENVIRONMENT VARIABLES -------------- //

// --- start make the folder for the file we are inserting into --- //
var mkdirp = require('mkdirp');
var getDirName = require('path').dirname;

function writeFile(path, contents, cb) {
  mkdirp(getDirName(path), function (err) {
    if (err) return cb(err);

    fs.writeFile(path, contents, cb);
  });
}
// --- end make the folder for the file we are inserting into --- //