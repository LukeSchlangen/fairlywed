var booking = require('./booking');
var photographerMatchmaker = require('./photographer-matchmaker')
var stripeConnect = require('./stripe-connect');
var rawStripeResponseRedirect = require('./raw-stripe-response-redirect');
var vendorPermissionsInvitation = require('./vendor-permissions-invitation');
var uploads = require('./uploads');
var path = require('path');
var bodyParser = require('body-parser');
var auth = require('../modules/auth');
var userData = require('./user-data');
var anonymousUserData = require('./anonymous-user-data');
var vendorSearchData = require('./vendor-search-data');
var vendorAccountData = require('./vendor-account-data');
var vendorDetailsData = require('./vendor-details-data');
var subvendorDetailsData = require('./subvendor-details-data');
var galleryImages = require('./gallery-images');
var packageData = require('./package-data');
var express = require('express');
var router = express.Router();

router.get('/', function (req, res) {
  res.sendFile(path.resolve('./dist/public/views/index.html'));
});

router.use(express.static('dist/public'));
router.use(bodyParser.json());

router.use("/packageData", packageData);
router.use('/galleryImages', galleryImages);

router.use('/rawStripeResponse', rawStripeResponseRedirect);

/* Anonymous auth is ok for these routes, created for matchmaking/image comparison
This is used for tracking a user while they are not logged in
and then that tracking can be saved to the user after they log in */
router.use("/vendorSearchData", auth.tokenDecoder, vendorSearchData);
router.use('/matchmaker', auth.tokenDecoder, photographerMatchmaker);
router.use("/anonymousUserData", auth.tokenDecoder, anonymousUserData);

/* These routes must be protected with authentication, so the middleware is listed here. */
router.use('/booking', auth.tokenDecoder, auth.noAnonymousUsers, auth.linkPreviouslyAnonymousUser, booking);
router.use("/userData", auth.tokenDecoder, auth.noAnonymousUsers, auth.linkPreviouslyAnonymousUser, userData);
router.use("/vendorAccountData", auth.tokenDecoder, auth.noAnonymousUsers, auth.linkPreviouslyAnonymousUser, vendorAccountData);
router.use("/vendorDetailsData", auth.tokenDecoder, auth.noAnonymousUsers, auth.linkPreviouslyAnonymousUser, vendorDetailsData);
router.use("/subvendorDetailsData", auth.tokenDecoder, auth.noAnonymousUsers, auth.linkPreviouslyAnonymousUser, subvendorDetailsData);
router.use("/vendorPermissionsInvitation", auth.tokenDecoder, auth.noAnonymousUsers, auth.linkPreviouslyAnonymousUser, vendorPermissionsInvitation);

router.use("/stripeConnect", auth.tokenDecoder, auth.noAnonymousUsers, auth.linkPreviouslyAnonymousUser, stripeConnect);

router.use('/uploads', auth.tokenDecoder, auth.noAnonymousUsers, auth.linkPreviouslyAnonymousUser, uploads);

// /* This catches all requests and returns the index, in case someone lands on a page that is not the index
// It seems like this may innappropriately stop some 404 requests from being delivered and deliver the index instead, 
// but haven't found it to be happenning */
// router.get('/*', function (req, res) {
//   res.sendFile(path.resolve('./dist/public/views/index.html'));
// });

module.exports = router;