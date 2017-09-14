var express = require('express');
var router = express.Router();
var pool = require('../modules/pg-pool');
// var neuralNetwork = require('../modules/neural-network');
var vendorSearch = require('../modules/vendor-search');

router.get('/', async (req, res) => {
    try {
        var userId = req.decodedToken.userSQLId;
        var searchObject = JSON.parse(req.query.search);
        if (req.query.photos && req.query.photos.length > 0) {
            var photos = objectToArrayCheck(req.query.photos).map((photo) => {
                var returnPhoto = JSON.parse(photo);
                returnPhoto.liked = returnPhoto.liked || false;
                return returnPhoto;
            });
            var likes = await saveLikes(photos, userId);
        }
        var [images, subvendorsWithRatings] = await Promise.all([getMatchmakerImages(userId, searchObject), getSubvendorsWithRating(userId, searchObject)]);

        res.send({ images: images, subvendor: subvendorsWithRatings });
    } catch (e) {
        console.log('error in matchmaker', e);
        res.sendStatus(500);
    }
});

async function getSubvendorsWithRating(userId, searchObject) {
    var subvendorsWithRatings = await vendorSearch(searchObject);
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

async function getMatchmakerImages(userId, searchObject) {
    var client = await pool.connect();

    var images = await client.query(`WITH initial_query AS (SELECT DISTINCT ON (subvendor_id) * FROM subvendor_images 
        left outer join (
        select losing_image from subvendor_matchup join matchmaker_run on matchmaker_run_id = matchmaker_run.id where matchmaker_run.user_id = $1
        ) as joined_matchmaker on subvendor_images.id=joined_matchmaker.subvendor_images_id 
        WHERE is_public=true AND is_active=true AND is_in_gallery=true AND joined_matchmaker.subvendor_images_id is null

        AND subvendor_id = ANY (SELECT subvendors.id
            FROM subvendors JOIN subvendortypes ON subvendors.vendortype_id = subvendortypes.id  
            AND subvendortypes.name=$2  
            JOIN vendors ON vendors.id = subvendors.parent_vendor_id  
            JOIN stripe_accounts ON vendors.stripe_account_id=stripe_accounts.id AND stripe_accounts.is_active=TRUE  
            JOIN subvendors_packages ON subvendors.id = subvendors_packages.subvendor_id  
            AND subvendors_packages.package_id=$3  
            JOIN packages ON subvendors_packages.package_id = packages.id  
            JOIN subvendor_availability ON subvendor_availability.subvendor_id = subvendors.id  
            AND day=$6  
            AND subvendor_availability.availability_id = (SELECT id FROM availability WHERE status=$7)  
            WHERE (SELECT ST_Distance( 
            		(SELECT COALESCE(subvendors.location, vendors.location)), 
            		(CAST(ST_SetSRID(ST_Point($4, $5),4326) As geography)) 
            	)) < (SELECT COALESCE(subvendors.travel_distance, vendors.travel_distance))) 

        ORDER BY  subvendor_id, RANDOM() )
        SELECT * FROM initial_query ORDER BY RANDOM() LIMIT 2;`,
        [userId, searchObject.vendorType, searchObject.package, searchObject.longitude, searchObject.latitude, searchObject.date, 'available']);

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
