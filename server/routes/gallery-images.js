var express = require('express');
var router = express.Router();
var pool = require('../modules/pg-pool');
var bucket = require('../modules/google-storage-bucket');

router.get('/', async (req, res) => {
    var client = await pool.connect();
    try {
        var subvendorId = req.headers.subvendor_id;

        var subvendorQueryResult = await client.query('SELECT subvendor_images.id ' +
            'FROM subvendor_images ' +
            'WHERE subvendor_id=$1 AND is_public=TRUE AND is_in_gallery=TRUE AND is_active=TRUE;',
            [subvendorId]);
        client.release();
        res.send(subvendorQueryResult.rows);
    }
    catch (e) {
        console.log('Error subvendor data GET SQL query task', err);
        res.sendStatus(500);
    }
});

router.get('/:imageId', async (req, res) => {
    var client = await pool.connect();
    try {
        var imageIdToRetrieve = req.params.imageId;
        // Select all images with that id where subvendor is one that user has access to
        var imageInfoResults = await client.query('SELECT subvendor_images.* ' +
            'FROM subvendor_images ' +
            'WHERE subvendor_images.id=$1 AND is_public=TRUE ' +
            'AND is_in_gallery=TRUE AND is_active=TRUE;',
            [imageIdToRetrieve]);
        client.release();

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
    } catch (e) {
        console.log('error retrieving public image info', err)
        res.sendStatus(500);
    }
});

module.exports = router;
