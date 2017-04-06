var express = require('express');
var router = express.Router();
var pool = require('../modules/pg-pool');
var bucket = require('../modules/google-storage-bucket');

router.get('/', function (req, res) {
    var subvendorId = req.headers.subvendor_id;
    pool.connect(function (err, client, done) {
        if (err) {
            console.log('Error connecting to database', err);
            res.sendStatus(500);
        } else {
            client.query('SELECT subvendor_images.id ' +
                'FROM subvendor_images ' +
                'WHERE subvendor_id=$1 AND is_public=TRUE AND is_in_gallery=TRUE AND is_active=TRUE;',
                [subvendorId],
                function (err, subvendorQueryResult) {
                    done();
                    if (err) {
                        console.log('Error subvendor data GET SQL query task', err);
                        res.sendStatus(500);
                    } else {
                        res.send(subvendorQueryResult.rows);
                    }
                });
        }
    });
});

router.get('/:imageId', function (req, res) {
    var imageIdToRetrieve = req.params.imageId;
    // Select all images with that id where subvendor is one that user has access to
    pool.connect(function (err, client, done) {
        client.query('SELECT subvendor_images.* ' +
            'FROM subvendor_images ' +
            'WHERE subvendor_images.id=$1 AND is_public=TRUE ' +
            'AND is_in_gallery=TRUE AND is_active=TRUE;',
            [imageIdToRetrieve], function (err, imageInfoResults) {
                done();
                if (err) {
                    console.log('error retrieving public image info', err)
                    res.sendStatus(500);
                } else {
                    if (imageInfoResults.rows.length === 1) {
                        var imageInfo = imageInfoResults.rows[0];
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
                    } else {
                        res.status(404).send('image not found');
                    }

                }
            });
    });


});

module.exports = router;
