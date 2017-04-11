const Storage = require('@google-cloud/storage');

const storage = Storage({
  keyFilename: 'server/firebase-service-account.json',
  projectId: process.env.FIREBASE_PROJECT_ID
});

const bucket = storage.bucket(process.env.FIREBASE_STORAGE_BUCKET);

module.exports = bucket;