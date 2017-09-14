var pool = require('../modules/pg-pool');
var dateFormatter = require('../modules/date-formatter');

async function vendorSearch(searchObject, userId) {
    var client = await pool.connect();
    try {
        var vendorQueryResult = await client.query(
            `WITH winning_counts AS (SELECT subvendor_id, count(winning_image=subvendor_id) AS wins FROM subvendor_matchup 
            FULL OUTER JOIN subvendor_images ON subvendor_matchup.winning_image = subvendor_images.id 
            WHERE subvendor_matchup.user_id=$7 
            group by subvendor_id), 
            losing_counts AS (SELECT subvendor_id, count(winning_image=subvendor_id) AS losses FROM subvendor_matchup 
            FULL OUTER JOIN subvendor_images ON subvendor_matchup.losing_image = subvendor_images.id 
            WHERE subvendor_matchup.user_id=$7 
            group by subvendor_id) 
            SELECT COALESCE(subvendors.name, vendors.name) AS name,  
            subvendors.id AS id,  
            packages.name AS package,  
            subvendors_packages.price,  
            wins, 
            losses, 
            ST_Distance((SELECT COALESCE(subvendors.location, vendors.location)), CAST(ST_SetSRID(ST_Point($3, $4),4326) As geography)) AS distance  
            FROM subvendors JOIN subvendortypes ON subvendors.vendortype_id = subvendortypes.id  
            AND subvendortypes.name=$1  
            JOIN vendors ON vendors.id = subvendors.parent_vendor_id  
            JOIN stripe_accounts ON vendors.stripe_account_id=stripe_accounts.id AND stripe_accounts.is_active=TRUE  
            JOIN subvendors_packages ON subvendors.id = subvendors_packages.subvendor_id  
            AND subvendors_packages.package_id=$2  
            JOIN packages ON subvendors_packages.package_id = packages.id  
            JOIN subvendor_availability ON subvendor_availability.subvendor_id = subvendors.id  
            AND day=$5  
            AND subvendor_availability.availability_id = (SELECT id FROM availability WHERE status=$6)  
            LEFT OUTER JOIN winning_counts ON subvendors.id = winning_counts.subvendor_id  
            LEFT OUTER JOIN losing_counts ON subvendors.id = losing_counts.subvendor_id  
            WHERE (SELECT ST_Distance( 
            		(SELECT COALESCE(subvendors.location, vendors.location)), 
            		(CAST(ST_SetSRID(ST_Point($3, $4),4326) As geography)) 
            	)) < (SELECT COALESCE(subvendors.travel_distance, vendors.travel_distance))  
            LIMIT 10; `,
            [searchObject.vendorType, searchObject.package, searchObject.longitude, searchObject.latitude, dateFormatter.javascriptToPostgres(searchObject.date), 'available', userId])

        client.release();

        // Adds ratings previously found in ratings array (passed in above) and adds them to the subvendors returned
        var subvendorsWithRatings = vendorQueryResult.rows.map((row) => {
            var wins = parseInt(row.wins) || 0;
            var losses = parseInt(row.losses) || 0;
            row.rating = parseInt(wins / (wins + losses + 1) * 100); // find subvendor with matching id and use that rating
            return row;
        });

        return subvendorsWithRatings;

    } catch (e) {
        console.log('Error user data root GET SQL query task', e);
        throw e;
    }
}

module.exports = vendorSearch;