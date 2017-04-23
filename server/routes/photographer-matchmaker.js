var express = require('express');
var router = express.Router();
var pool = require('../modules/pg-pool');
var neuralNetwork = require('../modules/neural-network');
var simpleRanker = require('../modules/simple-ranker');
var vendorSearch = require('../modules/vendor-search');

router.get('/', function (req, res) {
    var userId = req.decodedToken.userSQLId;
    neuralNetwork.train();
    if (req.query.photos && req.query.photos.length > 0) {
        var photos = req.query.photos.map((photo) => {
            var returnPhoto = JSON.parse(photo);
            returnPhoto.liked = returnPhoto.liked || false;
            return returnPhoto;
        })
        saveLikes(req, res, photos, userId, getImagesWithUserId);
        // get Latest info on Pref for user and get images
    } else {
        pool.connect(function (err, client, done) {
            if (err) {
                console.log('Error connecting to database', err);
                res.sendStatus(500);
            } else {
                client.query('SELECT EXISTS(SELECT 1 FROM matchmaker_run WHERE user_id=$1)',
                    [userId],
                    function (err, hasDoneMatchmakerBefore) {
                        done();
                        if (err) {
                            console.log('Error matchmaker_run SELECT SQL query task', err);
                            res.sendStatus(500);
                        } else {
                            if (hasDoneMatchmakerBefore.rows[0].exists) {
                                // get Latest info on Pref for user and get images;
                                getImagesWithUserId(req, res, userId)
                            } else {
                                // get random images
                                getRandomImages(res);
                            }
                        }
                    });
            }
        });
    }
});

router.post('/runTrainer', function (req, res) {
    neuralNetwork.train();
    res.send(200)
})

function saveLikes(req, res, photos, userId, cb) {
    var likes = photos.map((photo) => photo.liked);
    var ids = photos.map((photo) => photo.id);
    pool.connect(function (err, client, done) {
        if (err) {
            console.log('Error connecting to database', err);
            res.sendStatus(500);
        } else {
            client.query('WITH new_matchmaker_run_id AS ( INSERT INTO matchmaker_run (user_id, prior_run_id) ' +
                'VALUES ($1, (SELECT id FROM matchmaker_run ORDER BY id DESC LIMIT 1)) RETURNING id) ' +
                'INSERT INTO matchmaker_liked_photos (liked, subvendor_images_id, matchmaker_run_id)' +
                'VALUES (unnest($2::bool[]), UNNEST($3::int[]), (SELECT id FROM new_matchmaker_run_id));',
                [userId, likes, ids],
                function (err) {
                    done();
                    if (err) {
                        console.log('Error matchmaker_run INSERT SQL query task', err);
                        res.sendStatus(500);
                    } else {
                        cb && cb(req, res, userId)
                    }
                });
        }
    });
}

function getRandomImages(res) {
    pool.connect(function (err, client, done) {
        if (err) {
            console.log('Error connecting to database', err);
            res.sendStatus(500);
        } else {
            client.query('SELECT * FROM subvendor_images WHERE is_public=true AND is_active=true ORDER BY RANDOM() LIMIT 4',
                function (err, randomImages) {
                    done();
                    if (err) {
                        console.log('Error matchmaker_run SELECT RANDOM SQL query task', err);
                        res.sendStatus(500);
                    } else {
                        res.send({images: randomImages.rows})
                    }
                });
        }
    });
}

function getImagesWithUserId(req, res, userId) {
    var orderBy = simpleRanker.orderBy(userId);
    pool.connect(function (err, client, done) {
        if (err) {
            console.log('Error connecting to database', err);
            res.sendStatus(500);
        } else {
            client.query(`SELECT * FROM subvendor_images 
                left outer join (
                select subvendor_images_id  from matchmaker_liked_photos join matchmaker_run on matchmaker_run_id = matchmaker_run.id where matchmaker_run.user_id = $1
                ) as joined_matchmaker on subvendor_images.id=joined_matchmaker.subvendor_images_id 
                WHERE is_public=true AND is_active=true and joined_matchmaker.subvendor_images_id is null
                ORDER BY $2 limit 4;`,
                [userId, orderBy],
                function (err, images) {
                    done();
                    if (err) {
                        console.log('Error matchmaker_run SELECT RANDOM SQL query task', err);
                        res.sendStatus(500);
                    } else {
                        simpleRanker.reccommendedPhotographers(req, res, userId, images.rows, vendorSearch);
                    }
                });
        }
    });
}

module.exports = router;
