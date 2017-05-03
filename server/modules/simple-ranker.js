var pool = require('../modules/pg-pool');

function orderBy() {
    return 'RANDOM()'
}

async function recommendedPhotographers(userId) {
    try {
        var client = await pool.connect();

        const recommendedPhotographers = await client.query(`select sum(CASE WHEN liked THEN 1 else 0 END) as likes, sum(CASE WHEN liked THEN 0 else 1 END) as dislikes, subvendor_id from matchmaker_liked_photos 
                join matchmaker_run on matchmaker_run_id = matchmaker_run.id
                join subvendor_images on matchmaker_liked_photos.subvendor_images_id = subvendor_images.id 
                where matchmaker_run.user_id = $1
                group by subvendor_id, matchmaker_run.user_id;`,
            [userId])

        client.release();

        var total = recommendedPhotographers.rows.reduce((acc, row) => {
            return acc + parseInt(row.likes) + parseInt(row.dislikes);
        }, 0)
        const photographersWithRating = recommendedPhotographers.rows.map((row) => {
            row.rating = calculateRating(parseInt(row.likes), parseInt(row.dislikes), total);
            return row;
        })
        var orderBy = photographersWithRating.length === 0 ? '' : `ORDER BY
        CASE ${photographersWithRating.map((photographer) => {
                return ` WHEN(
                subvendors.id  = ${photographer.subvendor_id})
                THEN -${photographer.rating}`
            }).join(' ')}
        ELSE -${calculateRating(0, 1, total)} 
        END`

        return {
            orderBy: orderBy,
            ratings: photographersWithRating,
            minRating: calculateRating(0, 1, total)
        }
    } catch (e) {
        console.log('Error getting training data SQL query task', e);
        throw e;
    }
}

function calculateRating(likes, dislikes, total) {
    const min = 50 / (total + 1);
    const max = 100 - 50 / (total + 1);
    const rating = likes / (likes + dislikes) * 100;
    if (rating > max)
        return max;
    else if (rating < min)
        return min;
    else
        return rating
}

var simpleRanker = {
    orderBy: orderBy,
    recommendedPhotographers: recommendedPhotographers
}

module.exports = simpleRanker;
