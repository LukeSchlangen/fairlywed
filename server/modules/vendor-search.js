var pool = require('../modules/pg-pool');

async function vendorSearch(searchObject, orderBy, ratings) {
    var client = await pool.connect();
    try {
        var vendorQueryResult = await client.query(
            'SELECT COALESCE(subvendors.name, vendors.name) AS name, ' +
            'subvendors.id AS id, ' +
            'packages.name AS package, ' +
            'subvendors_packages.price, ' +
            'ST_Distance((SELECT COALESCE(subvendors.location, vendors.location)), CAST(ST_SetSRID(ST_Point($3, $4),4326) As geography)) AS distance ' +
            'FROM subvendors JOIN subvendortypes ON subvendors.vendortype_id = subvendortypes.id ' +
            'AND subvendortypes.name=$1 ' +
            'JOIN vendors ON vendors.id = subvendors.parent_vendor_id ' +
            'JOIN stripe_accounts ON vendors.stripe_account_id=stripe_accounts.id AND stripe_accounts.is_active=TRUE ' +
            'JOIN subvendors_packages ON subvendors.id = subvendors_packages.subvendor_id ' +
            'AND subvendors_packages.package_id=$2 ' +
            'JOIN packages ON subvendors_packages.package_id = packages.id ' +
            'JOIN subvendor_availability ON subvendor_availability.subvendor_id = subvendors.id ' +
            'AND day=$5 ' +
            'AND subvendor_availability.availability_id = (SELECT id FROM availability WHERE status=$6) ' +
            'WHERE (SELECT ST_Distance(' +
            '		(SELECT COALESCE(subvendors.location, vendors.location)),' +
            '		(CAST(ST_SetSRID(ST_Point($3, $4),4326) As geography))' +
            '	)) < (SELECT COALESCE(subvendors.travel_distance, vendors.travel_distance)) ' +
            (orderBy || '') + ' LIMIT 10 ',
            [searchObject.vendorType, searchObject.package, searchObject.longitude, searchObject.latitude, searchObject.date, 'available'])

        client.release();

        // Adds ratings previously found in ratings array (passed in above) and adds them to the subvendors returned
        var subvendorsWithRatings = vendorQueryResult.rows.map((row) => {
            var ratingObject = ratings.filter(rating => rating.subvendor_id === row.id)[0]; // find subvendor with matching id and use that rating
            row.rating = ratingObject ? ratingObject.rating : 50; // default rating is 50
            return row;
        });

        return subvendorsWithRatings;

    } catch (e) {
        console.log('Error user data root GET SQL query task', e);
        throw e;
    }
}

module.exports = vendorSearch;