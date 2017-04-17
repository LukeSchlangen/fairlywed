var express = require('express');
var router = express.Router();
var pool = require('../modules/pg-pool');
var synaptic = require('synaptic'); // this line is not needed in the browser
var Neuron = synaptic.Neuron,
    Layer = synaptic.Layer,
    Network = synaptic.Network,
    Trainer = synaptic.Trainer,
    Architect = synaptic.Architect;

router.get('/', function (req, res) {
    var firebaseUserId = req.decodedToken.user_id || req.decodedToken.uid;
    if (req.query.photos && req.query.photos.length > 0) {
        var photos = req.query.photos.map((photo) => {
            var returnPhoto = JSON.parse(photo);
            returnPhoto.liked = returnPhoto.liked || false;
            return returnPhoto;
        })
        getTrainingData();
        saveLikes(photos, res, firebaseUserId, getImagesWithUserId);
        // get Latest info on Pref for user and get images
    } else {
        pool.connect(function (err, client, done) {
            if (err) {
                console.log('Error connecting to database', err);
                res.sendStatus(500);
            } else {
                client.query('SELECT EXISTS(SELECT 1 FROM matchmaker_run WHERE firebase_user_id=$1)',
                    [firebaseUserId],
                    function (err, hasDoneMatchmakerBefore) {
                        done();
                        if (err) {
                            console.log('Error matchmaker_run SELECT SQL query task', err);
                            res.sendStatus(500);
                        } else {
                            if (hasDoneMatchmakerBefore.rows[0].exists) {
                                // get Latest info on Pref for user and get images;
                                getRandomImages(res);
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

function saveLikes(photos, res, firebaseUserId, cb) {
    var likes = photos.map((photo) => photo.liked);
    var ids = photos.map((photo) => photo.id);
    pool.connect(function (err, client, done) {
        if (err) {
            console.log('Error connecting to database', err);
            res.sendStatus(500);
        } else {
            client.query('WITH new_matchmaker_run_id AS ( INSERT INTO matchmaker_run (firebase_user_id, prior_run_id) ' +
                'VALUES ($1, (SELECT id FROM matchmaker_run ORDER BY id DESC LIMIT 1)) RETURNING id) ' +
                'INSERT INTO matchmaker_liked_photos (liked, subvendor_images_id, matchmaker_run_id)' +
                'VALUES (unnest($2::bool[]), UNNEST($3::int[]), (SELECT id FROM new_matchmaker_run_id));',
                [firebaseUserId, likes, ids],
                function (err) {
                    done();
                    if (err) {
                        console.log('Error matchmaker_run INSERT SQL query task', err);
                        res.sendStatus(500);
                    } else {
                        cb && cb(res, firebaseUserId)
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
                        res.send(randomImages.rows)
                    }
                });
        }
    });
}

function getImagesWithUserId(res, firebaseUserId) {
    var orderBy = getOrderBy(firebaseUserId);
    pool.connect(function (err, client, done) {
        if (err) {
            console.log('Error connecting to database', err);
            res.sendStatus(500);
        } else {
            client.query(`SELECT * FROM subvendor_images 
                left outer join (
                select subvendor_images_id  from matchmaker_liked_photos join matchmaker_run on matchmaker_run_id = matchmaker_run.id where matchmaker_run.firebase_user_id = $1
                ) as joined_matchmaker on subvendor_images.id=joined_matchmaker.subvendor_images_id 
                WHERE is_public=true AND is_active=true and joined_matchmaker.subvendor_images_id is null
                ORDER BY $2 limit 4;`,
                [firebaseUserId, orderBy],
                function (err, images) {
                    done();
                    if (err) {
                        console.log('Error matchmaker_run SELECT RANDOM SQL query task', err);
                        res.sendStatus(500);
                    } else {
                        res.send(images.rows)
                    }
                });
        }
    });
}

function getOrderBy(firebaseUserId) {
    if (!neuralNetwork) {
        return 'RANDOM()'
    } else {

    }
}

function getTrainingData() {
    pool.connect(function (err, client, done) {
        if (err) {
            console.log('Error connecting to database', err);
        } else {
            client.query(`with joined_matchmaker as (
                select matchmaker_run.id, prior_run_id, firebase_user_id, jsonb_agg(jsonb_build_object(
                        'liked', liked, 
                        'subvendor_images_id', subvendor_images_id 
                    )) as liked_images from matchmaker_liked_photos join matchmaker_run on matchmaker_run_id = matchmaker_run.id 
                    GROUP BY matchmaker_run.id, prior_run_id, firebase_user_id)
                select current_run.id, current_run.prior_run_id, current_run.liked_images , jsonb_agg(prior_run.liked_images) as prior_liked_images
                from joined_matchmaker as current_run join joined_matchmaker as prior_run on current_run.prior_run_id>=prior_run.id and current_run.firebase_user_id=prior_run.firebase_user_id
                group by current_run.id, current_run.prior_run_id, current_run.liked_images;`,
                function (err, trainingData) {
                    done();
                    if (err) {
                        console.log('Error getting training data SQL query task', err);
                        //res.sendStatus(500);
                    } else {
                        //res.send(images.rows)
                        runTrainingData(trainingData);
                    }
                });
        }
    });
}

function getTrainingData() {
    pool.connect(function (err, client, done) {
        if (err) {
            console.log('Error connecting to database', err);
        } else {
            client.query(`with joined_matchmaker as (
                select matchmaker_run.id, prior_run_id, firebase_user_id, jsonb_agg(jsonb_build_object(
                        'liked', liked, 
                        'subvendor_images_id', subvendor_images_id 
                    )) as liked_images from matchmaker_liked_photos join matchmaker_run on matchmaker_run_id = matchmaker_run.id 
                    GROUP BY matchmaker_run.id, prior_run_id, firebase_user_id)
                select current_run.id, current_run.prior_run_id, current_run.liked_images , jsonb_agg(prior_run.liked_images) as prior_liked_images
                from joined_matchmaker as current_run join joined_matchmaker as prior_run on current_run.prior_run_id>=prior_run.id and current_run.firebase_user_id=prior_run.firebase_user_id
                group by current_run.id, current_run.prior_run_id, current_run.liked_images;`,
                function (err, trainingData) {
                    done();
                    if (err) {
                        console.log('Error getting training data SQL query task', err);
                        //res.sendStatus(500);
                    } else {
                        //res.send(images.rows)
                        runTrainingData(trainingData);
                    }
                });
        }
    });
}

function Perceptron(input, hidden, output) {
    // create the layers
    var inputLayer = new Layer(input);
    var hiddenLayer1 = new Layer(hidden);
    var hiddenLayer2 = new Layer(hidden);
    var outputLayer = new Layer(output);

    // connect the layers
    inputLayer.project(hiddenLayer1);
    hiddenLayer1.project(hiddenLayer2);
    hiddenLayer2.project(outputLayer);

    // set the layers
    this.set({
        input: inputLayer,
        hidden: [hiddenLayer1, hiddenLayer2],
        output: outputLayer
    });
}

// extend the prototype chain
Perceptron.prototype = new Network();
Perceptron.prototype.constructor = Perceptron;

function runTrainingData(trainingData) {

}

module.exports = router;

var neuralNetwork;


var knownUserPreference = null;


function photos() {
    return [
        {
            id: 0,
            url: "https://d2ezq7t0wj6z8f.cloudfront.net/2IBsNSbJSww6twLv3qmcNU34_v8=/280x204/smart/product/d/a/0fde4a090fec4501b1d53eb8c92e41ff.jpg"
        },
        {
            id: 1,
            url: "https://d2ezq7t0wj6z8f.cloudfront.net/tq8jA95oHG4LV66FSXsw7WxMgaU=/280x237/smart/product/7/e/24f2b8aef3414b2ea53112b356e53f87.jpg"
        },
        {
            id: 2,
            url: "https://d2ezq7t0wj6z8f.cloudfront.net/2ijaIPc-2lfyn8TrbqN-TFW1F38=/280x336/smart/product/9/c/0522cfbe48bb4a58a3cfe8bba45d3b7f.jpg"
        },
        {
            id: 3,
            url: "https://d2ezq7t0wj6z8f.cloudfront.net/-sTctKSnogiwFq6djT9geYl8MSg=/280x312/smart/product/8/4/54d70e2ed5034caea04d971a789e4ebb.jpg"
        },
        {
            id: 4,
            url: "https://d2ezq7t0wj6z8f.cloudfront.net/TXEa9EtxL3kO56Ra3p4vTY4MsAY=/280x234/smart/product/a/e/a0ac1c41ca08495087b441ad9f08d55b.jpg"
        },
        {
            id: 5,
            url: "https://d2ezq7t0wj6z8f.cloudfront.net/boksU3CLi_bkIgs51S2Cokfj90Y=/280x232/smart/product/a/0/656972b89a9a466db1278e000c773a22.jpg"
        },
        {
            id: 6,
            url: "https://d2ezq7t0wj6z8f.cloudfront.net/ntNkd-aScD1nCMogbm0QGqSrvZw=/280x361/smart/product/2/7/fbef689fbcde4fae8dafbe1999966713.jpg"
        },
        {
            id: 7,
            url: "https://d2ezq7t0wj6z8f.cloudfront.net/cScnMMPjuen_8tZROFM9QjKJjqQ=/280x204/smart/product/4/f/6a8940aeec2e4dd8aa75c612ed922122.jpg"
        },
        {
            id: 8,
            url: "https://d2ezq7t0wj6z8f.cloudfront.net/owDdO4Wfz_6AsZteESSmd-oSZHI=/280x280/smart/product/b/8/07512abb20ee4ba393a5d4fe56aaccf0.jpg"
        },
        {
            id: 9,
            url: "https://d2ezq7t0wj6z8f.cloudfront.net/tLKcpvL_C4zKaqdFHPf2xj25pYs=/280x281/smart/product/d/1/144e2ef9f0414874a16d14bc81a383c4.jpg"
        },
        {
            id: 10,
            url: "https://d2ezq7t0wj6z8f.cloudfront.net/hzvNOegD5krTeyYfkb-wnGcX9co=/280x362/smart/product/a/5/557d6af755be436cb1bc540fd9d10344.jpg"
        },

    ]
}