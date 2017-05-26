var Storage = require('@google-cloud/storage');

var storage = Storage({
  keyFilename: 'server/firebase-service-account.json',
  projectId: process.env.FIREBASE_PROJECT_ID
});

var bucket = storage.bucket(process.env.FIREBASE_STORAGE_BUCKET);

module.exports = bucket;