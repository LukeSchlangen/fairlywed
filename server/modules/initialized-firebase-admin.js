var admin = require("firebase-admin");

admin.initializeApp({
  credential: admin.credential.cert('server/firebase-service-account.json'),
  databaseURL: process.env.FIREBASE_DATABASE_URL
});

module.exports = admin;