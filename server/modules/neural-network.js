var pool = require('../modules/pg-pool');
var synaptic = require('synaptic'); // this line is not needed in the browser
var Neuron = synaptic.Neuron,
    Layer = synaptic.Layer,
    Network = synaptic.Network,
    Trainer = synaptic.Trainer,
    Architect = synaptic.Architect;


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


var neuralNetwork = {
    orderBy: null,
    reccommendedPhotographers: null
}

module.exports = neuralNetwork;

var neuralNetwork;