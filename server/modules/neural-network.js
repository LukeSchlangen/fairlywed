var pool = require('../modules/pg-pool');
var synaptic = require('synaptic'); // this line is not needed in the browser
var Neuron = synaptic.Neuron,
    Layer = synaptic.Layer,
    Network = synaptic.Network,
    Trainer = synaptic.Trainer,
    Architect = synaptic.Architect;

var neuralNetwork = null;

function orderBy(likedImages) {
    var flattenLikedImages = [].concat.apply([], likedImages.liked_images_final);
    // max is indexed starting at 1
    var finalLikedImages = new Array(neuralNetwork.layers.input.size).fill(.5);
    flattenLikedImages.forEach((image) => {
        // Once again these id's start at index 1
        finalLikedImages[image.subvendor_images_id - 1] = image.liked ? 1 : 0;
    });
    var networkOrder = neuralNetwork.activate(finalLikedImages);
    var orderBy = `ORDER BY
        CASE ${networkOrder.map((order, index) => {
            return `WHEN(
            subvendors.id  = ${index + 1})
        THEN -${order}`
        })}
        ELSE 0
        END`;
    return orderBy;

}

function getLikedImages(userId) {
    pool.connect(function (err, client, done) {
        if (err) {
            console.log('Error connecting to database', err);
        } else {
            client.query(` with joined_matchmaker as (
                select user_id, jsonb_agg(jsonb_build_object(
                        'liked', liked, 
                        'subvendor_images_id', subvendor_images_id 
                    )) as liked_images from matchmaker_liked_photos join matchmaker_run on matchmaker_run_id = matchmaker_run.id where user_id=$1
                    GROUP BY matchmaker_run.id, prior_run_id, user_id)
                select user_id, jsonb_agg(liked_images) as liked_images_final
                from joined_matchmaker group by user_id;`,
                [userId],
                function (err, likedImages) {
                    done();
                    if (err) {
                        console.log('Error getting training data SQL query task', err);
                        //res.sendStatus(500);
                    } else {
                        //res.send(images.rows)
                        orderBy(likedImages)
                    }
                });
        }
    });
}

function getTrainingData(max) {
    pool.connect(function (err, client, done) {
        if (err) {
            console.log('Error connecting to database', err);
        } else {
            client.query(`with joined_matchmaker as (
                select matchmaker_run.id, prior_run_id, user_id, jsonb_agg(jsonb_build_object(
                        'liked', liked, 
                        'subvendor_images_id', subvendor_images_id 
                    )) as liked_images from matchmaker_liked_photos join matchmaker_run on matchmaker_run_id = matchmaker_run.id 
                    GROUP BY matchmaker_run.id, prior_run_id, user_id)
                select current_run.id, current_run.prior_run_id, current_run.liked_images , jsonb_agg(prior_run.liked_images) as prior_liked_images
                from joined_matchmaker as current_run join joined_matchmaker as prior_run on current_run.prior_run_id>=prior_run.id and current_run.user_id=prior_run.user_id
                group by current_run.id, current_run.prior_run_id, current_run.liked_images;`,
                function (err, trainingData) {
                    done();
                    if (err) {
                        console.log('Error getting training data SQL query task', err);
                        //res.sendStatus(500);
                    } else {
                        //res.send(images.rows)
                        runTrainingData(trainingData.rows, max);
                    }
                });
        }
    });
}
function getTotalNumberOfImages() {
    pool.connect(function (err, client, done) {
        if (err) {
            console.log('Error connecting to database', err);
        } else {
            client.query(`SELECT id FROM subvendor_images ORDER BY id DESC LIMIT 1`,
                function (err, max) {
                    done();
                    if (err) {
                        console.log('Error getting training data SQL query task', err);
                        //res.sendStatus(500);
                    } else {
                        //res.send(images.rows)
                        getTrainingData(max.rows[0].id);
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

function runTrainingData(trainingData, max) {
    var finalTrainingSet = trainingData.map((row) => {
        var flattenPriorLikedImages = [].concat.apply([], row.prior_liked_images);
        // max is indexed starting at 1
        var finalPrior = new Array(max - 1).fill(.5);
        flattenPriorLikedImages.forEach((priorImage) => {
            // Once again these id's start at index 1
            finalPrior[priorImage.subvendor_images_id - 1] = priorImage.liked ? 1 : 0;
        });
        var finalAfter = new Array(max - 1).fill(0);
        row.liked_images.forEach((afterImage) => {
            // Once again these id's start at index 1
            finalAfter[afterImage.subvendor_images_id - 1] = afterImage.liked ? 1 : 0;
        });
        return {
            input: finalPrior,
            output: finalAfter
        }
    });

    neuralNetwork = new Perceptron(max - 1, Math.ceil(max * .75), max - 1);
    var trainer = new Trainer(neuralNetwork);
    var trainingOutput = trainer.train(finalTrainingSet);
    console.log(trainingOutput);
}


var neuralNetwork = {
    orderBy: getLikedImages,
    recommendedPhotographers: null,
    train: getTotalNumberOfImages,
}

module.exports = neuralNetwork;

var neuralNetwork;