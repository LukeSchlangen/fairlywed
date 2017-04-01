// Include gulp
var gulp = require('gulp');
var fs = require('fs');
var clean = require('gulp-clean');

gulp.task('remove-dist-folder', function () {
    return gulp.src('dist', { read: false })
        .pipe(clean());
});

// for environment variables
var m = {};

// gulp.task('scripts', function () {
//     return gulp.src(['./lib/file3.js', './lib/file1.js', './lib/file2.js'])
//         .pipe(concat('all.js'))
//         .pipe(gulp.dest('./dist/'));
// });

gulp.task('createDist', ['remove-dist-folder'], () => {
    gulp.src(['public/**/*.*'], { base: '.' })
        .pipe(gulp.dest('dist'));

    copy({
        keys: [
            { newKey: 'apiKey', environmentVariable: 'FIREBASE_API_KEY' },
            { newKey: 'authDomain', environmentVariable: 'FIREBASE_AUTH_DOMAIN' },
            { newKey: 'databaseURL', environmentVariable: 'FIREBASE_DATABASE_URL' },
            { newKey: 'storageBucket', environmentVariable: 'FIREBASE_STORAGE_BUCKET' },
            { newKey: 'messagingSenderId', environmentVariable: 'FIREBASE_MESSAGING_SENDER_ID' }
        ],
        paths: {
            env: '.env',
            destination: 'dist/public/scripts/firebase.config.js'
        },
        stringBuilder: {
            before: 'var config =  ',
            after: '; firebase.initializeApp(config);'
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

    if (!params.paths.env || !params.paths.destination) {
        throw "one of the paths is missing. The params.env object must include the env and jenv attribute";
    }

    return true;
}

function copy(params) {
    validateParams(params);
    var keys = params.keys;
    var paths = params.paths;
    var newObject = {};
    if (fs.existsSync(paths.env)) {
        // If .env file exists, create .env.json from the .env file
        var fileContent = fs.readFileSync(paths.env, 'utf8');
        var lines = fileContent.split('\n'); // break each enviroment variable line into it's own row
        for (var i in lines) {
            if (lines[i] === '') {
                continue;
            }
            var content = lines[i].split('='); // something like [ENVIRONMENT_VARIABLE, "some string value"]
            keys.forEach(function(key){
                // check to see if this key should be added to the new object
                if(key.environmentVariable === content[0]) {
                    // if the environment variable matches the name, then create the new property based on that
                    newObject[key.newKey] = content[1];
                }
            })
            if (keys.indexOf(content[0]) != -1 || keys.indexOf('*') != -1) {
                newObject[content[0]] = content[1];
            }
        }
    } else {
        // If .env file does not exist, create .env.json from environment variables
        keys.forEach(function (key) {
            newObject[key.newKey] = process.env[key.environmentVariable];
        });
    }

    var stringBefore = params.stringBuilder.before || '';
    var stringAfter = params.stringBuilder.after || '';
    var firebaseConfigText = stringBefore + JSON.stringify(newObject) + stringAfter;

    writeFile(params.paths.destination, firebaseConfigText);
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