var admin = require("firebase-admin");
var pg = require('pg');
var connectionString = require('../modules/database-config');
var logger = require('./logger');

admin.initializeApp({
  credential: admin.credential.cert("./server/firebase-service-account.json"),
  databaseURL: "https://sigma-test-run.firebaseio.com" // replace this line with your URL
});

/* This is where the magic happens. We pull the id_token off of the request,
verify it against our firebase service account private_key.
Then we add the decodedToken */
var tokenDecoder = function (req, res, next) {
  if (req.headers.id_token) {
    admin.auth().verifyIdToken(req.headers.id_token).then(function (decodedToken) {
      req.decodedToken = decodedToken;
      pg.connect(connectionString, function (err, client, done) {
        var firebaseUserId = req.decodedToken.user_id || req.decodedToken.uid;
        client.query('SELECT id FROM users WHERE firebase_user_id=$1', [firebaseUserId], function (err, userSQLIdResult) {
          done();
          if (err) {
            console.log('Error completing user id query task', err);
            res.sendStatus(500);
          } else {
            pg.connect(connectionString, function (err, client, done) {
              if (userSQLIdResult.rowCount === 0) {
                // If the user is not in the database, this adds them to the database
                var userEmail = req.decodedToken.email;
                var userName = req.decodedToken.name;
                client.query('INSERT INTO users (name, email, firebase_user_id) VALUES ($1, $2, $3) RETURNING id', [userName, userEmail, firebaseUserId], function (err, newUserSQLIdResult) {
                  if (err) {
                    console.log('Error completing new user insert query task', err);
                    res.sendStatus(500);
                  } else {
                    // this adds the users id from the database to the request
                    req.decodedToken.userSQLId = newUserSQLIdResult.rows[0].id;
                    logger.write(req.decodedToken.userSQLId, "New user created");
                    next();
                  }
                });
              } else {
                // this adds the users id from the database to the request
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
    res.sendStatus(404);
  }
}

module.exports = {
  tokenDecoder: tokenDecoder,
};
