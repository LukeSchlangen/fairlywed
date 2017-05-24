var express = require('express');
var router = express.Router();
var pool = require('../modules/pg-pool');

router.get('/', async (req, res) => {
    var userId = req.decodedToken.userSQLId;
    var subvendorId = req.headers.subvendor_id;
    try {
        var client = await pool.connect();
        const subvendorQueryResult = await client.query(`SELECT subvendors.id AS subvendor_id, 
            subvendors.name AS name, 
            subvendors.description AS description, 
            subvendors.is_active AS is_active 
            FROM users_vendors 
            JOIN vendors ON users_vendors.user_id=$1 AND vendors.id=users_vendors.vendor_id 
            JOIN subvendors ON vendors.id=subvendors.parent_vendor_id AND subvendors.id=$2;`,
            [userId, subvendorId]);
        res.send(subvendorQueryResult.rows[0]);
    } catch (e) {
        console.log('Error subvendor data GET SQL query task', err);
        res.sendStatus(500);
    } finally {
        client && client.release && client.release();
    }
});

router.get('/packages', async (req, res) => {
    var userId = req.decodedToken.userSQLId;
    var subvendorId = req.headers.subvendor_id;
    try {
        var client = await pool.connect();
        const subvendorQueryResult = await client.query(`SELECT subvendors_packages.id AS id, 
            packages.id AS package_id, 
            subvendors.id AS subvendor_id, 
            packages.name AS name, 
            subvendors_packages.price AS price, 
            subvendors_packages.is_active AS is_active 
            FROM users_vendors 
            JOIN vendors ON users_vendors.user_id=$1 AND vendors.id=users_vendors.vendor_id 
            JOIN subvendors ON vendors.id=subvendors.parent_vendor_id AND subvendors.id=$2 
            JOIN subvendors_packages ON subvendors_packages.subvendor_id=subvendors.id 
            RIGHT OUTER JOIN packages ON subvendors_packages.package_id=packages.id 
            WHERE packages.is_active=TRUE AND packages.vendortype_id=1 
            ORDER BY packages.id;`,
            [userId, subvendorId]);
        res.send({ packages: subvendorQueryResult.rows });
    } catch (e) {
        console.log('Error getting subvendor package data, GET SQL query task', err);
        res.sendStatus(500);
    } finally {
        client && client.release && client.release();
    }
});

router.get('/availability', async (req, res) => {
    var userId = req.decodedToken.userSQLId;
    var subvendorId = req.headers.subvendor_id;
    var selectedDate = pgFormatDate(req.headers.selected_date);
    try {
        var client = await pool.connect();
        const subvendorQueryResult = await client.query(`SELECT day, status  
            FROM subvendor_availability  
            JOIN availability ON availability.id=subvendor_availability.availability_id AND subvendor_id =(  
                SELECT subvendors.id  
                FROM users_vendors 
                JOIN vendors ON users_vendors.user_id=$1 AND vendors.id=users_vendors.vendor_id  
                JOIN subvendors ON vendors.id=subvendors.parent_vendor_id AND subvendors.id=$2)  
            WHERE day >= (SELECT date_trunc('month', coalesce($3, current_date)::date)::date - cast(extract(dow from date_trunc('month', coalesce($3, current_date)::date)::date) as int)) AND day < (SELECT date_trunc('month', coalesce($3, current_date)::date)::date - cast(extract(dow from date_trunc('month', coalesce($3, current_date)::date)::date) as int)) + 42  
            ORDER BY day;`,
            [userId, subvendorId, selectedDate]);
        res.send(subvendorQueryResult.rows);
    } catch (e) {
        console.log('Error getting subvendor package data, GET SQL query task', err);
        res.sendStatus(500);
    } finally {
        client && client.release && client.release();
    }
});

router.get('/images', async (req, res) => {
    var userId = req.decodedToken.userSQLId;
    var subvendorId = req.headers.subvendor_id;
    try {
        var client = await pool.connect();
        const subvendorQueryResult = await client.query(`SELECT subvendor_images.id, subvendor_images.is_public, 
            subvendor_images.is_in_gallery, subvendor_images.is_active 
            FROM subvendor_images 
            WHERE subvendor_id =( 
                SELECT subvendors.id 
                FROM users_vendors  
                JOIN vendors ON users_vendors.user_id=$1 AND vendors.id=users_vendors.vendor_id 
                JOIN subvendors ON vendors.id=subvendors.parent_vendor_id AND subvendors.id=$2 
            ) AND subvendor_images.is_active=TRUE;`,
            [userId, subvendorId]);
        res.send(subvendorQueryResult.rows);
    } catch (e) {
        console.log('Error getting subvendor image data, GET SQL query task', err);
        res.sendStatus(500);
    } finally {
        client && client.release && client.release();
    }
});

router.post('/', async (req, res) => {
    var userId = req.decodedToken.userSQLId;
    var vendorId = req.headers.vendor_id;
    var subvendor = req.body;
    try {
        var client = await pool.connect();
        const newSubvendorResults = await client.query(`INSERT INTO subvendors (name, parent_vendor_id, vendortype_id) 
            VALUES ($3, 
            (SELECT vendors.id 
            FROM users_vendors 
            JOIN vendors ON users_vendors.user_id=$1 AND vendors.id=users_vendors.vendor_id 
            WHERE vendors.id=$2), 
            1) RETURNING id, parent_vendor_id;`, // -- hard coded for photographers
            [userId, vendorId, subvendor.name]);
        res.send({ vendorId: newSubvendorResults.rows[0].parent_vendor_id, newSubvendorId: newSubvendorResults.rows[0].id });
    } catch (e) {
        console.log('Error adding new subvendor data, POST SQL query task', err);
        res.sendStatus(500);
    } finally {
        client && client.release && client.release();
    }
});

router.put('/', async (req, res) => {
    var userId = req.decodedToken.userSQLId;
    var subvendorId = req.headers.subvendor_id;
    var subvendorDetails = req.body;
    // var travelDistanceInMeters = parseInt(subvendorDetails.travel_distance * 1609.34).toString(); Not asking user for this yet
    try {
        var client = await pool.connect();
        const subvendorQueryResult = await client.query(`UPDATE subvendors 
            SET name=$3, description=$4 
            WHERE id = ( 
            SELECT subvendors.id 
            FROM users_vendors 
            JOIN vendors ON users_vendors.user_id=$1 AND vendors.id=users_vendors.vendor_id 
            JOIN subvendors ON subvendors.parent_vendor_id=vendors.id AND subvendors.id=$2);`,
            [userId, subvendorId, subvendorDetails.name, subvendorDetails.description]);
        res.sendStatus(200);
    } catch (e) {
        console.log('Error adding updating subvendor data, UPDATE SQL query task', err);
        res.sendStatus(500);
    } finally {
        client && client.release && client.release();
    }
});

router.post('/upsertPackage', async (req, res) => {
    var userId = req.decodedToken.userSQLId;
    var subvendorId = req.headers.subvendor_id;
    var packageObject = req.body;
    try {
        var client = await pool.connect();
        if ((isNaN(packageObject.price) || packageObject.price == "") && packageObject.id) {
            // if package was removed
            await client.query(`DELETE FROM subvendors_packages 
                WHERE id = ( 
                SELECT subvendors_packages.id 
                FROM users_vendors 
                JOIN vendors ON users_vendors.user_id=$1 AND vendors.id=users_vendors.vendor_id 
                JOIN subvendors ON vendors.id=subvendors.parent_vendor_id AND subvendors.id=$2 
                JOIN subvendors_packages ON subvendors_packages.subvendor_id=subvendors.id 
                WHERE subvendors_packages.id=$3);`,
                [userId, subvendorId, packageObject.id]);
        } else if (packageObject.id) {
            // if package was updated
            await client.query(`UPDATE subvendors_packages 
                SET price=$4, is_active=$5 
                WHERE id = ( 
                SELECT subvendors_packages.id 
                FROM users_vendors 
                JOIN vendors ON users_vendors.user_id=$1 AND vendors.id=users_vendors.vendor_id 
                JOIN subvendors ON vendors.id=subvendors.parent_vendor_id AND subvendors.id=$2 
                JOIN subvendors_packages ON subvendors_packages.subvendor_id=subvendors.id 
                WHERE subvendors_packages.id=$3)`,
                [userId, subvendorId, packageObject.id, packageObject.price, !!packageObject.is_active]);

        } else if (!isNaN(Number(packageObject.price)) && !packageObject.price == "") {
            // new package was created
            await client.query(`INSERT INTO subvendors_packages (subvendor_id, package_id, price, is_active)
                VALUES (
                    (SELECT subvendors.id  
                    FROM users_vendors 
                    JOIN vendors ON users_vendors.user_id=$1 AND vendors.id=users_vendors.vendor_id 
                    JOIN subvendors ON vendors.id=subvendors.parent_vendor_id AND subvendors.id=$2), 
                    (SELECT id 
                    FROM packages 
                    WHERE id=$3 AND vendortype_id=1), 
                    $4, 
                    $5
                );`,
                [userId, subvendorId, packageObject.package_id, packageObject.price, !!packageObject.is_active]);
        } else {
            // attempt to create a new package, but price isn't valid
            throw 'New package price was invalid: ' + packageObject.price;
        }
        res.sendStatus(200);
    } catch (e) {
        console.log('Error adding updating subvendor data, UPDATE SQL query task', err);
        res.sendStatus(500);
    } finally {
        client && client.release && client.release();
    }
});

// This route accepts an availability to change that includes, the subvendorId, availabilityStatus, and the day of the availability
// If an array is passed in for the availability, the upsert will update all of the dates, allowing for mass changes
router.post('/upsertAvailability', async (req, res) => {
    var userId = req.decodedToken.userSQLId;
    var subvendorId = req.headers.subvendor_id;
    var availability = req.body;
    if (!Array.isArray(availability.day)) {
        availability.day = [availability.day];
    }

    var queryArgumentsArray = [userId, subvendorId, availability.status];
    var valuesToInsert = [];
    for (var i=0; i < availability.day.length; i++) {
        valuesToInsert.push( `(
                    (SELECT id FROM validated_subvendor), 
                    $` + (i + 4) + `, 
                    (SELECT id FROM availaibity_temp)
                )`);
        console.log('Availability to upsert was', availability.day[i], ', the actual upserted was ', pgFormatDate(availability.day[i]))
        queryArgumentsArray.push(pgFormatDate(availability.day[i]));
    }
    
    var queryStatement = `WITH validated_subvendor AS (SELECT subvendors.id FROM users_vendors 
            JOIN vendors ON users_vendors.user_id=$1 AND vendors.id=users_vendors.vendor_id 
            JOIN subvendors ON vendors.id=subvendors.parent_vendor_id AND subvendors.id=$2),
            
            availaibity_temp AS (SELECT id FROM availability WHERE status=$3)

            INSERT INTO subvendor_availability (subvendor_id, day, availability_id)
            VALUES ` + valuesToInsert.join(',') + 
            `ON CONFLICT (subvendor_id, day) DO UPDATE
            SET availability_id = excluded.availability_id 
            WHERE subvendor_availability.availability_id != (SELECT id FROM availability WHERE status='booked');`;

    try {
        var client = await pool.connect();
        await client.query(queryStatement, queryArgumentsArray);
        res.sendStatus(200);
    } catch (e) {
        console.log('Error adding updating subvendor availability data, UPDATE SQL query task', err);
        res.sendStatus(500);
    } finally {
        client && client.release && client.release();
    }
});

router.put('/updateImage', async (req, res) => {
    var userId = req.decodedToken.userSQLId;
    var subvendorId = req.headers.subvendor_id;
    var imageObject = req.body;
    try {
        var client = await pool.connect();
        await client.query(`UPDATE subvendor_images 
            SET is_public=$4, is_in_gallery=$5, is_active=$6 
            WHERE id = ( 
            SELECT subvendor_images.id 
            FROM users_vendors 
            JOIN vendors ON users_vendors.user_id=$1 AND vendors.id=users_vendors.vendor_id 
            JOIN subvendors ON vendors.id=subvendors.parent_vendor_id AND subvendors.id=$2 
            JOIN subvendor_images ON subvendor_images.subvendor_id=subvendors.id 
            WHERE subvendor_images.id=$3);`,
            [userId, subvendorId, imageObject.id, imageObject.is_public, imageObject.is_in_gallery, imageObject.is_active]);
        res.sendStatus(200);
    } catch (e) {
        console.log('Error adding updating subvendor data, UPDATE SQL query task', err);
        res.sendStatus(500);
    } finally {
        client && client.release && client.release();
    }
});

function pgFormatDate(date) {
    /* Via http://stackoverflow.com/questions/3605214/javascript-add-leading-zeroes-to-date */
    function zeroPad(d) {
        return ("0" + d).slice(-2)
    }

    if (date) {
        var parsed = new Date(date)
        return [parsed.getUTCFullYear(), zeroPad(parsed.getMonth() + 1), zeroPad(parsed.getDate())].join("-");
    } else {
        return null;
    }
}

module.exports = router;
