// upload.js

var express = require('express');
var router = express.Router();
var fs = require('fs');
// var multer = require('multer');
// var upload = multer({dest: 'uploads/'});
var pool = require('../modules/pg-pool');

// From gCloud demo
// var admin = require('../modules/initialized-firebase-admin');
const format = require('util').format;
const Multer = require('multer');
const multer = Multer({
  storage: Multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // no larger than 5mb, you can change as needed.
  }
});

// By default, the client will authenticate using the service account file
// specified by the GOOGLE_APPLICATION_CREDENTIALS environment variable and use
// the project specified by the GCLOUD_PROJECT environment variable. See
// https://googlecloudplatform.github.io/gcloud-node/#/docs/google-cloud/latest/guides/authentication
// These environment variables are set automatically on Google App Engine
const Storage = require('@google-cloud/storage');

// Instantiate a storage client
const storage = Storage({
    keyFilename: 'server/firebase-service-account.json',
    projectId: process.env.FIREBASE_PROJECT_ID
});

const bucket = storage.bucket(process.env.FIREBASE_STORAGE_BUCKET);

// Process the file upload and upload to Google Cloud Storage.
router.post('/', multer.single('file'), (req, res, next) => {
  console.log('req.body', req.body);
  console.log('req.file', req.file);
  if (!req.file) {
    res.status(400).send('No file uploaded.');
    return;
  }

  // Create a new blob in the bucket and upload the file data.
  const blob = bucket.file(req.file.originalname);
  const blobStream = blob.createWriteStream();

  blobStream.on('error', (err) => {
    next(err);
    return;
  });

  blobStream.on('finish', () => {
    // The public URL can be used to directly access the file via HTTP.
    const publicUrl = format(`https://storage.googleapis.com/${bucket.name}/${blob.name}`);
    res.status(200).send(publicUrl);
  });

  blobStream.end(req.file.buffer);
});

module.exports = router;




// post to database
  // pool.connect(function(err, client, done){
  //   var userId = req.decodedToken.userSQLId;
  //   client.query('INSERT INTO users VALUES () FROM users WHERE id=$1', [userId], function(err, userDataQueryResult){
  //     done();
  //     if(err){
  //       console.log('Error user data root GET SQL query task', err);
  //       res.sendStatus(500);
  //     }else{
  //       res.send({name: userDataQueryResult.rows[0].name});
  //     }
  //   });
  // });



// /**
//  * Gets the list of all files from the database
//  */
// router.get('/', function (req, res, next) {
//   Upload.find({},  function (err, uploads) {
//     if (err) next(err);
//     else {
//       res.send(uploads);
//     }
//   });
// });

// /**
//  * Gets a file from the hard drive based on the unique ID and the filename
//  */
// router.get('/:uuid/:filename', function (req, res, next) {
//   console.log(req.params);
//   Upload.findOne({
//     'file.filename': req.params.uuid,
//     'file.originalname': req.params.filename
//   }, function (err, upload) {

//     if (err) next(err);
//     else {
//       res.set({
//         "Content-Disposition": 'attachment; filename="' + upload.file.originalname + '"',
//         "Content-Type": upload.file.mimetype
//       });
//       fs.createReadStream(upload.file.path).pipe(res);
//     }
//   });
// });