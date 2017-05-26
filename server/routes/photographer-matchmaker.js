var express = require('express');
var router = express.Router();
var pool = require('../modules/pg-pool');
// var neuralNetwork = require('../modules/neural-network');
var simpleRanker = require('../modules/simple-ranker');
var vendorSearch = require('../modules/vendor-search');

router.get('/', async (req, res) => {
    try {
        var userId = req.decodedToken.userSQLId;
        var searchObject = JSON.parse(req.query.search);
        let hasDoneMatchmakerBefore = false;
        if (req.query.photos && req.query.photos.length > 0) {
            hasDoneMatchmakerBefore = true;
            var photos = objectToArrayCheck(req.query.photos).map((photo) => {
                var returnPhoto = JSON.parse(photo);
                returnPhoto.liked = returnPhoto.liked || false;
                return returnPhoto;
            })
            // this can be refactored to run at the same time as the other things
            var likes = await saveLikes(photos, userId);
        } else {
            var client = await pool.connect();
            try {
                var hasDoneMatchmakerBeforeSQL = await client.query('SELECT EXISTS(SELECT 1 FROM matchmaker_run WHERE user_id=$1)', [userId]);
                hasDoneMatchmakerBefore = hasDoneMatchmakerBeforeSQL.rows[0].exists;
            } catch (e) {
                console.log('Error matchmaker_run SELECT SQL query task', e);
                throw e;
            } finally {
                client && client.release && client.release();
            }
        }
        var getImageFunction = hasDoneMatchmakerBefore ? getImagesWithUserId : getRandomImages;
        var [images, subvendorsWithRatings] = await Promise.all([getImageFunction(userId), getSubvendorsWithRating(userId, searchObject)]);

        res.send({ images: images, subvendor: subvendorsWithRatings });
    } catch (e) {
        console.log('error in matchmaker', e);
        res.sendStatus(500);
    }
});
// // change this
// router.get('/runTrainer', function (req, res) {
//     neuralNetwork.train();
//     res.send(200)
// })

async function getSubvendorsWithRating(userId, searchObject) {
    var recommendedPhotographers = await simpleRanker.recommendedPhotographers(userId);
    var subvendorsWithRatings = await vendorSearch(searchObject, recommendedPhotographers.orderBy, recommendedPhotographers.ratings, recommendedPhotographers.minRating);
    return subvendorsWithRatings;
}

async function saveLikes(photos, userId) {
    var client = await pool.connect();
    try {
        var likes = photos.map((photo) => photo.liked);
        var ids = photos.map((photo) => photo.id);

        var success = await client.query('WITH new_matchmaker_run_id AS ( INSERT INTO matchmaker_run (user_id, prior_run_id) ' +
            'VALUES ($1, (SELECT id FROM matchmaker_run where user_id=$1 ORDER BY id DESC LIMIT 1)) RETURNING id) ' +
            'INSERT INTO matchmaker_liked_photos (liked, subvendor_images_id, matchmaker_run_id)' +
            'VALUES (unnest($2::bool[]), UNNEST($3::int[]), (SELECT id FROM new_matchmaker_run_id));',
            [userId, likes, ids])
    } catch (e) {
        console.log('Error matchmaker_run INSERT SQL query task', e);
    } finally {
        client && client.release && client.release();
    }
    return true;
}

async function getRandomImages() {
    var client = await pool.connect();
    try {
        var randomImages = await client.query('SELECT * FROM subvendor_images WHERE is_public=true AND is_active=true ORDER BY RANDOM() LIMIT 2');
        client.release();
        return randomImages.rows;
    } catch (e) {
        console.log('Error matchmaker_run SELECT RANDOM SQL query task', e);
        throw e
    }
}

async function getImagesWithUserId(userId) {
    var orderBy = simpleRanker.orderBy(userId);
    var client = await pool.connect();

    var images = await client.query(`SELECT * FROM subvendor_images 
        left outer join (
        select subvendor_images_id  from matchmaker_liked_photos join matchmaker_run on matchmaker_run_id = matchmaker_run.id where matchmaker_run.user_id = $1
        ) as joined_matchmaker on subvendor_images.id=joined_matchmaker.subvendor_images_id 
        WHERE is_public=true AND is_active=true and joined_matchmaker.subvendor_images_id is null
        ORDER BY $2 limit 2;`,
        [userId, orderBy])

    client.release();

    return images.rows;
}

function objectToArrayCheck(photos) {
    if (Array.isArray(photos)) {
        return photos;
    }
    else if (typeof photos === 'string') {
        return [photos];
    } else {
        throw new Error('Unknown type of photos passed in. photos is typeof ' + typeof photos);
    }
}

module.exports = router;
