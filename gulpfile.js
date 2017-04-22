// Include gulp
var gulp = require('gulp');
var fs = require('fs');
var clean = require('gulp-clean');

gulp.task('remove-dist-folder', function () {
    return gulp.src('dist', { read: false })
        .pipe(clean());
});

gulp.task('remove-firebase-service-account', function () {
    return gulp.src('server/firebase-service-account.json', { read: false })
        .pipe(clean());
});

// for environment variables

// gulp.task('scripts', function () {
//     return gulp.src(['./lib/file3.js', './lib/file1.js', './lib/file2.js'])
//         .pipe(concat('all.js'))
//         .pipe(gulp.dest('./dist/'));
// });

gulp.task('createFirebaseServiceAccount', ['remove-firebase-service-account'], () => {

    copy({
        keys: [
            { newKey: "type", environmentVariable: 'FIREBASE_SERVICE_ACCOUNT_TYPE' },
            { newKey: "project_id", environmentVariable: 'FIREBASE_SERVICE_ACCOUNT_PROJECT_ID' },
            { newKey: "private_key_id", environmentVariable: 'FIREBASE_SERVICE_ACCOUNT_PRIVATE_KEY_ID' },
            { newKey: "private_key", environmentVariable: 'FIREBASE_SERVICE_ACCOUNT_PRIVATE_KEY' },
            { newKey: "client_email", environmentVariable: 'FIREBASE_SERVICE_ACCOUNT_CLIENT_EMAIL' },
            { newKey: "client_id", environmentVariable: 'FIREBASE_SERVICE_ACCOUNT_CLIENT_ID' },
            { newKey: "auth_uri", environmentVariable: 'FIREBASE_SERVICE_ACCOUNT_AUTH_URI' },
            { newKey: "token_uri", environmentVariable: 'FIREBASE_SERVICE_ACCOUNT_TOKEN_URI' },
            { newKey: "auth_provider_x509_cert_url", environmentVariable: 'FIREBASE_SERVICE_ACCOUNT_AUTH_PROVIDER_X509_CERT_URL' },
            { newKey: "client_x509_cert_url", environmentVariable: 'FIREBASE_SERVICE_ACCOUNT_CLIENT_X509_CERT_URL' }
        ],
        paths: {
            env: '.env',
            destination: 'server/firebase-service-account.json'
        }
    });
});

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
            before: 'var firebaseConfig =  ',
            after: '; firebase.initializeApp(firebaseConfig);'
        }
    });

    copy({
        keys: [
            { newKey: 'key', environmentVariable: 'STRIPE_PUBLISHABLE_KEY' }
        ],
        paths: {
            env: '.env',
            destination: 'dist/public/scripts/stripe.config.js'
        },
        stringBuilder: {
            before: 'var stripeConfig =  ',
            after: ';'
        }
    });
});

gulp.task('default', ['createDist', 'createFirebaseServiceAccount']);

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
            keys.forEach(function (key) {
                // check to see if this key should be added to the new object
                if (key.environmentVariable === content[0]) {
                    // if the environment variable matches the name, then create the new property based on that
                    newObject[key.newKey] = content[1];
                }
            });
        }
    } else {
        // If .env file does not exist, create .env.json from environment variables
        keys.forEach(function (key) {
            newObject[key.newKey] = process.env[key.environmentVariable];
        });
    }

    var stringBefore = '';
    var stringAfter = '';

    if (params.stringBuilder) {
        stringBefore = params.stringBuilder.before || '';
        stringAfter = params.stringBuilder.after || '';
    }

    var configText = stringBefore + JSON.stringify(newObject) + stringAfter;

    configText = configText.replace(/(?:\\\\n)+/g, "\\n");

    writeFile(params.paths.destination, configText, function () { });
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