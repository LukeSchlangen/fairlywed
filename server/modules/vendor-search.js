var pool = require('../modules/pg-pool');

function vendorSearch(req, res, orderBy, images, ratings, minRating) {
    var searchObject = JSON.parse(req.query.search);
    pool.connect(function (err, client, done) {
        client.query(
            'SELECT COALESCE(subvendors.name, vendors.name) AS name, ' +
            'subvendors.id AS id, ' +
            'packages.name AS package, ' +
            'subvendors_packages.price, ' +
            'ST_Distance((SELECT COALESCE(subvendors.location, vendors.location)), CAST(ST_SetSRID(ST_Point($3, $4),4326) As geography)) AS distance ' +
            'FROM subvendors JOIN subvendortypes ON subvendors.vendortype_id = subvendortypes.id ' +
            'JOIN vendors ON vendors.id = subvendors.parent_vendor_id ' +
            'JOIN subvendors_packages ON subvendors.id = subvendors_packages.subvendor_id ' +
            'JOIN packages ON subvendors_packages.package_id = packages.id ' +
            'JOIN subvendor_availability ON subvendor_availability.subvendor_id = subvendors.id ' +
            'WHERE subvendortypes.name=$1 ' +
            'AND packages.id=$2 ' +
            'AND (SELECT ST_Distance(' +
            '		(SELECT COALESCE(subvendors.location, vendors.location)),' +
            '		(CAST(ST_SetSRID(ST_Point($3, $4),4326) As geography))' +
            '	)) < (SELECT COALESCE(subvendors.travel_distance, vendors.travel_distance)) ' +
            'AND subvendor_availability.date_id = (SELECT id FROM calendar_dates WHERE day=$5) ' +
            (orderBy || '') + ' LIMIT 10 ',
            [searchObject.vendorType, searchObject.package, searchObject.longitude, searchObject.latitude, searchObject.date],
            function (err, vendorQueryResult) {
                done();
                if (err) {
                    console.log('Error user data root GET SQL query task', err);
                    res.sendStatus(500);
                } else {
                    // clean this up
                    const subvendorsWithRatings = vendorQueryResult.rows.map((row) => {
                        const ratingObject = ratings.filter(rating => rating.subvendor_id === row.id)[0]
                        row.rating = ratingObject ? ratingObject.rating : minRating;
                        return row;
                    })
                    var returnObject = images ? { images: images, subvendor: subvendorsWithRatings } : subvendorsWithRatings;
                    res.send(returnObject);
                }
            });
    });
}

module.exports = vendorSearch;