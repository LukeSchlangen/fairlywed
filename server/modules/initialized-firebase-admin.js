var admin = require("firebase-admin");
var credentials = require('./firebase-service-account-credentials');

admin.initializeApp({
  credential: admin.credential.cert(credentials),
  databaseURL: process.env.FIREBASE_DATABASE_URL
});

module.exports = admin;