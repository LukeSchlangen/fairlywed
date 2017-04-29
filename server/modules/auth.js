var admin = require('./initialized-firebase-admin');
var pool = require('./pg-pool');
var logger = require('./logger');

/* This is where the magic happens. We pull the id_token off of the request,
verify it against our firebase service account private_key.
Then we add the decodedToken */
var tokenDecoder = function (req, res, next) {
  if (req.headers.id_token) {
    admin.auth().verifyIdToken(req.headers.id_token).then(function (decodedToken) {
      req.decodedToken = decodedToken;
      pool.connect(function (err, client, done) {
        var firebaseUserId = req.decodedToken.user_id || req.decodedToken.uid;
        // If the user is not in the database, this adds them to the database
        var userEmail = req.decodedToken.email;
        var userName = req.decodedToken.name;
        var authenticationProvider = req.decodedToken.firebase.sign_in_provider;

        if (authenticationProvider == "anonymous") {
          userEmail = "anonymous";
          userName = "anonymous";
        }
        client.query(`INSERT INTO users (name, email, firebase_user_id, authentication_provider) 
        VALUES ($1, $2, $3, $4) 
        ON CONFLICT(firebase_user_id) DO UPDATE SET firebase_user_id=EXCLUDED.firebase_user_id RETURNING id;`,
          [userName, userEmail, firebaseUserId, authenticationProvider], 
          function (err, userSQLIdResult) {
            done();
            if (err) {
              console.log('Error completing user id query task', err);
              res.sendStatus(500);
            } else {
              // this adds the user's id from the database to the request to simplify future database queries
              req.decodedToken.userSQLId = userSQLIdResult.rows[0].id;
              logger.write(req.decodedToken.userSQLId, "User http interaction");
              next();
            }
          });
      });
    })
      .catch(function (error) {
        // If the id_token isn't right, you end up in this callback function
        // Here we are returning a forbidden error
        console.error('User token could not be verified:', error);
        res.sendStatus(403);
      });
  } else {
    // Seems to be hit when chrome makes request for map files
    // Will also be hit when user does not send back an idToken in the header
    // technically, some of these should return 403 and some should return 404
    res.sendStatus(404);
  }
}

var noAnonymousUsers = function (req, res, next) {
  var authenticationProvider = req.decodedToken.provider_id;
  if (authenticationProvider == "anonymous") {
    res.status(403).send('Must be logged in to see private user data.')
  } else {
    next();
  }
}

var linkPreviouslyAnonymousUser = function (req, res, next) {
  if (req.headers.previously_anonymous_id_token) {
    admin.auth().verifyIdToken(req.headers.previously_anonymous_id_token).then(function (previousAnonymousUserDecodedToken) {
      pool.connect(function (err, client, done) {
        var previousAnonymousFirebaseUserId = previousAnonymousUserDecodedToken.user_id || previousAnonymousUserDecodedToken.uid;
        client.query('SELECT id FROM users WHERE firebase_user_id=$1', [previousAnonymousFirebaseUserId], function (err, previousAnonymousUserSQLIdResult) {
          done();
          if (err) {
            console.log('Error completing user id query task', err);
            res.sendStatus(500);
          } else {
            if (previousAnonymousUserSQLIdResult.rows.length === 0) {
              // If the anonymous user is not in the database, move on
              next();
            } else {
              var previousAnonymousFirebaseUserId = previousAnonymousUserSQLIdResult.rows[0].id;
              // Change all of the references to the anonymous user to the non-anonymous user
              // TODO: SOME UPDATE QUERY to Change everything in the ranking table that Miles is creating
              pool.connect(function (err, client, done) {
                if (err) {
                  console.log('Error connecting to database', err);
                  res.sendStatus(500);
                } else {
                  client.query('UPDATE logs SET user_id=$1 WHERE user_id=$2', [req.decodedToken.userSQLId, previousAnonymousFirebaseUserId], function (err) {
                    done();
                    if (err) {
                      console.log('Error updating logs in database', err);
                      res.sendStatus(500);
                    } else {
                      pool.connect(function (err, client, done) {
                        if (err) {
                          console.log('Error connecting to database', err);
                          res.sendStatus(500);
                        } else {
                          client.query('DELETE FROM users WHERE id=$1', [previousAnonymousFirebaseUserId], function (err) {
                            done();
                            if (err) {
                              console.log('Error updating removing anonymous user from database', err);
                              res.sendStatus(500);
                            } else {
                              next();
                            }
                          });
                        }
                      });
                    }
                  });
                }
              });
            }
          }
        });
      });
    });
  } else {
    next();
  }
}

module.exports = {
  tokenDecoder: tokenDecoder,
  noAnonymousUsers: noAnonymousUsers,
  linkPreviouslyAnonymousUser: linkPreviouslyAnonymousUser
};
