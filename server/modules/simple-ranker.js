var pool = require('../modules/pg-pool');

function orderBy() {
    return 'RANDOM()'
}

function reccommendedPhotographers(req, res, userId, data, cb) {
    pool.connect(function (err, client, done) {
        if (err) {
            console.log('Error connecting to database', err);
        } else {
            client.query(` select sum(liked::int) as likes_count, subvendor_id
                from matchmaker_liked_photos 
                join matchmaker_run on matchmaker_run_id = matchmaker_run.id
                join subvendor_images on matchmaker_liked_photos.subvendor_images_id = subvendor_images.id 
                where matchmaker_run.user_id = $1
                group by subvendor_id, matchmaker_run.user_id;`,
                [userId],
                function (err, reccommendedPhotographers) {
                    done();
                    if (err) {
                        console.log('Error getting training data SQL query task', err);
                        //res.sendStatus(500);
                    } else {
                        var orderBy = `ORDER BY
                        CASE ${reccommendedPhotographers.rows.map((row) => {
                               return `WHEN(
                                    subvendors.id  = ${row.subvendor_id})
                                THEN -${row.likes_count}`
                            })}
                         ELSE 0
                        END
                        `
                        cb && cb(req, res, orderBy, data)
                        //res.send(images.rows)
                        //runTrainingData(trainingData);
                    }
                });
        }
    });
}

var simpleRanker = {
    orderBy: orderBy,
    reccommendedPhotographers: reccommendedPhotographers
}

module.exports = simpleRanker;
