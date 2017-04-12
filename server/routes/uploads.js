var express = require('express');
var router = express.Router();
var pool = require('../modules/pg-pool');
var bucket = require('../modules/google-storage-bucket');
const Multer = require('multer');
const multer = Multer({
  storage: Multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // no larger than 5mb, you can change as needed.
  }
});

// Process the file upload and upload to Google Cloud Storage.
router.post('/', multer.single('file'), (req, res) => {
  console.log('req.body', req.body);
  console.log('req.file', req.file);
  if (!req.file) {
    res.status(400).send('No file uploaded.');
    return;
  }

  var file = req.file;
  var userId = req.decodedToken.userSQLId;
  var subvendorId = req.headers.subvendor_id;

  pool.connect(function (err, client, done) {
    client.query('INSERT INTO subvendor_images (original_name, encoding, mime_type, subvendor_id) '
      + 'VALUES ($1, $2, $3, ( ' +
      '    SELECT subvendors.id ' +
      '    FROM users_vendors  ' +
      '    JOIN vendors ON users_vendors.user_id=$4 AND vendors.id=users_vendors.vendor_id ' +
      '    JOIN subvendors ON vendors.id=subvendors.parent_vendor_id AND subvendors.id=$5) ' +
      ') RETURNING id',
      [file.originalname, file.encoding, file.mimetype, userId, subvendorId], function (err, imageId) {
        done();
        if (err) {
          console.log('Error user data root GET SQL query task', err);
          res.sendStatus(500);
        } else {
          // Create a new blob in the bucket and upload the file data.
          const blob = bucket.file(imageId.rows[0].id.toString());
          const blobStream = blob.createWriteStream();

          blobStream.on('error', (err) => {
            console.log('error', err);
            res.send(500);
          });

          blobStream.on('finish', () => {
            console.log('The image has been successfully uploaded to google cloud storage');
            res.end();
          });

          blobStream.end(req.file.buffer);
        }
      });
  });
});

router.get('/:imageId', function (req, res, next) {
  var userId = req.decodedToken.userSQLId;
  var imageIdToRetrieve = req.params.imageId;

  // Select all images with that id where subvendor is one that user has access to
  pool.connect(function (err, client, done) {
    client.query('SELECT subvendor_images.* ' +
      'FROM users_vendors ' +
      'JOIN vendors ON users_vendors.user_id=$1 AND vendors.id=users_vendors.vendor_id ' +
      'JOIN subvendors ON vendors.id=subvendors.parent_vendor_id ' +
      'JOIN subvendor_images ON subvendor_images.id = $2 AND subvendor_images.subvendor_id=subvendors.id;',
      [userId, imageIdToRetrieve], function (err, imageInfoResults) {
        done();
        if (imageInfoResults.rows.length === 1) {
          var imageInfo = imageInfoResults.rows[0];
          if (err) {
            console.log('Error user data root GET SQL query task', err);
            res.sendStatus(500);
          } else {
            var stream = bucket.file(imageInfo.id.toString()).createReadStream();

            res.writeHead(200, { 'Content-Type': imageInfo.mime_type });

            stream.on('data', function (data) {
              res.write(data);
            });

            stream.on('error', function (err) {
              console.log('error reading stream', err);
            });

            stream.on('end', function () {
              res.end();
            });
          }
        } else {
          res.status(404).send('image not found');
        }
      });
  });


});

module.exports = router;