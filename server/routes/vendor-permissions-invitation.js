var express = require('express');
var router = express.Router();
var pool = require('../modules/pg-pool');

// Accepting an invitation
router.post('/accept', async (req, res) => {
    var client = await pool.connect();
    try {
        var vendorId = req.headers.vendor_id;
        var invitationToken = req.headers.invitation_token;
        var userId = req.decodedToken.userSQLId;
        
        // Find and return invitation that is active where vendor_id and invitation_id
        // match the query and aren't over a week old
        // If that exists, add them to the users_vendors table to give access
        // If the user already exists in that database with that vendor, deactivate the invitation,
        // and redirect as if they were just accepted (instead of showing an error to the user)
        var vendorIdToShareResult = await client.query(
            `WITH vendor_id_return AS (UPDATE vendor_invitations 
            SET is_active=FALSE, 
            accepted_by_user_id=$2, 
            accepted_at=NOW() 
            WHERE invitation_token=$3 
            AND vendor_id=$1 
            AND is_active=TRUE 
            AND created_at > NOW() - INTERVAL '7 days' 
            RETURNING vendor_id)

            INSERT INTO users_vendors (user_id, vendor_id)
            VALUES (
                $2, 
                COALESCE(
                    (SELECT vendor_id FROM vendor_id_return), 
                    (SELECT vendor_id FROM users_vendors WHERE user_id=$2 AND vendor_id=$1)
                )
            )
            ON CONFLICT(vendor_id, user_id) DO UPDATE SET user_id=EXCLUDED.user_id 
            RETURNING vendor_id;`,
            [vendorId, userId, invitationToken]);
        client.release();
        // if a result was returned, then pick off the vendor_id
        if (vendorIdToShareResult.rows[0] && vendorIdToShareResult.rows[0].vendor_id) {
            var verifiedVendorIdToShare = vendorIdToShareResult.rows[0].vendor_id;
        }
        
        // Redirect the user to the /account/vendor page
        if (verifiedVendorIdToShare) {
            res.sendStatus(200);
        } else {
            console.log('There was no active invitiation to match the invitationToken received');
            res.sendStatus(403);
        }
    } catch (e) {
        console.log('Error vendor id GET SQL query task', e);
        res.sendStatus(500);
    }
});

// Creating an invitation
router.post('/create', async (req, res) => {
    var client = await pool.connect();
    try {
        var userId = req.decodedToken.userSQLId;
        var vendorToShareId = req.headers.vendor_id;

        var invitationTokenResult = await client.query(`INSERT INTO vendor_invitations (inviter_user_id, vendor_id) 
        VALUES ($1, 
        (SELECT vendor_id FROM users_vendors WHERE user_id=$1 AND vendor_id=$2) 
        ) RETURNING invitation_token;`, [userId, vendorToShareId]);

        if (invitationTokenResult.rows[0] && invitationTokenResult.rows[0].invitation_token) {
            var invitationToken = invitationTokenResult.rows[0].invitation_token;
        }

        if (invitationToken) {
            var invitationObject = {
                invitationToken: invitationToken,
                vendorId: vendorToShareId,
                invitationUrl: [req.protocol, '://', req.get('Host'), '/#/invitation/vendor?invitationToken=', invitationToken,'&vendorId=',vendorToShareId].join('')
            }
            res.send(invitationObject);
        }else {
            res.sendStatus(403);
        }

    } catch (e) {
        console.log('Error vendor id GET SQL query task', e);
        res.sendStatus(500);
    }
});

module.exports = router;