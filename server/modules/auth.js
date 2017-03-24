var admin = require("firebase-admin");
var pool = require('../modules/pg-pool');
var logger = require('./logger');
var dotenv = require('dotenv')
dotenv.config();

admin.initializeApp({
  credential: admin.credential.cert({
    "type": process.env.FIREBASE_SERVICE_ACCOUNT_TYPE,
    "project_id": process.env.FIREBASE_SERVICE_ACCOUNT_PROJECT_ID,
    "private_key_id": process.env.FIREBASE_SERVICE_ACCOUNT_PRIVATE_KEY_ID,
    "private_key": process.env.FIREBASE_SERVICE_ACCOUNT_PRIVATE_KEY,
    "client_email": process.env.FIREBASE_SERVICE_ACCOUNT_CLIENT_EMAIL,
    "client_id": process.env.FIREBASE_SERVICE_ACCOUNT_CLIENT_ID,
    "auth_uri": process.env.FIREBASE_SERVICE_ACCOUNT_AUTH_URI,
    "token_uri": process.env.FIREBASE_SERVICE_ACCOUNT_TOKEN_URI,
    "auth_provider_x509_cert_url": process.env.FIREBASE_SERVICE_ACCOUNT_AUTH_PROVIDER_X509_CERT_URL,
    "client_x509_cert_url": process.env.FIREBASE_SERVICE_ACCOUNT_CLIENT_X509_CERT_URL
  }
  ),
  databaseURL: process.env.FIREBASE_DATABASE_URL
});

/* This is where the magic happens. We pull the id_token off of the request,
verify it against our firebase service account private_key.
Then we add the decodedToken */
var tokenDecoder = function (req, res, next) {
  if (req.headers.id_token) {
    admin.auth().verifyIdToken(req.headers.id_token).then(function (decodedToken) {
      req.decodedToken = decodedToken;
      pool.connect(function (err, client, done) {
        var firebaseUserId = req.decodedToken.user_id || req.decodedToken.uid;
        client.query('SELECT id FROM users WHERE firebase_user_id=$1', [firebaseUserId], function (err, userSQLIdResult) {
          done();
          if (err) {
            console.log('Error completing user id query task', err);
            res.sendStatus(500);
          } else {
            pool.connect(function (err, client, done) {
              if (userSQLIdResult.rows.length === 0) {
                // If the user is not in the database, this adds them to the database
                var userEmail = req.decodedToken.email;
                var userName = req.decodedToken.name;
                client.query('INSERT INTO users (name, email, firebase_user_id) VALUES ($1, $2, $3) RETURNING id', [userName, userEmail, firebaseUserId], function (err, newUserSQLIdResult) {
                  if (err) {
                    console.log('Error completing new user insert query task', err);
                    res.sendStatus(500);
                  } else {
                    // this adds the user's id from the database to the request to simplify future database queries
                    req.decodedToken.userSQLId = newUserSQLIdResult.rows[0].id;
                    logger.write(req.decodedToken.userSQLId, "New user created");
                    next();
                  }
                });
              } else if (userSQLIdResult.rows.length > 1) {
                // If there is more than one user with the unique firebase id assigned, there is a major problem
                console.error("More than one user with firebase_user_id: ", firebaseUserId);
                res.sendStatus(500);
              } else {
                // this else is for users that already exist. This should be the most common path
                // this adds the user's id from the database to the request to simplify future database queries
                req.decodedToken.userSQLId = userSQLIdResult.rows[0].id;
                logger.write(req.decodedToken.userSQLId, "Logged in user interaction");
                next();
              }
              done();
            });
          }
        });
      });
    })
      .catch(function (error) {
        // If the id_token isn't right, you end up in this callback function
        // Here we are returning a forbidden error
        console.log('User token could not be verified');
        res.sendStatus(403);
      });
  } else {
    // Seems to be hit when chrome makes request for map files
    // Will also be hit when user does not send back an idToken in the header
    // technically, some of these should return 403 and some should return 404
    res.sendStatus(404);
  }
}

module.exports = {
  tokenDecoder: tokenDecoder,
};
