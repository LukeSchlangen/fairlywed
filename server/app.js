var dotenv = require('dotenv');
dotenv.config();
var express = require('express');
var app = express();
var path = require('path');
var bodyParser = require('body-parser');
var auth = require('./modules/auth');
var userData = require('./routes/user-data');
var anonymousUserData = require('./routes/anonymous-user-data');
var vendorSearchData = require('./routes/vendor-search-data');
var vendorAccountData = require('./routes/vendor-account-data');
var vendorDetailsData = require('./routes/vendor-details-data');
var subvendorDetailsData = require('./routes/subvendor-details-data');
var galleryImages = require('./routes/gallery-images');
var packageData = require('./routes/package-data');
var booking = require('./routes/booking');
var photographerMatchmaker = require('./routes/photographer-matchmaker')
var enfoceSSL = require('./modules/enforce-ssl');
var stripeConnect = require('./routes/stripe-connect');
var rawStripeResponseRedirect = require('./routes/raw-stripe-response-redirect');

var uploads = require('./routes/uploads');
var portDecision = process.env.PORT || 5000;

app.use(enfoceSSL);

app.get('/', function (req, res) {
  res.sendFile(path.resolve('./dist/public/views/index.html'));
});

app.use(express.static('dist/public'));
app.use(bodyParser.json());

app.use("/packageData", packageData);
app.use('/galleryImages', galleryImages);

app.use('/rawStripeResponse', rawStripeResponseRedirect);

/* Anonymous auth is ok for these routes, created for matchmaking/image comparison
This is used for tracking a user while they are not logged in
and then that tracking can be saved to the user after they log in */
app.use("/vendorSearchData", auth.tokenDecoder, vendorSearchData);
app.use('/matchmaker', auth.tokenDecoder, photographerMatchmaker);
app.use("/anonymousUserData", auth.tokenDecoder, anonymousUserData);

/* These routes must be protected with authentication, so the middleware is listed here. */
app.use('/booking', auth.tokenDecoder, auth.noAnonymousUsers, auth.linkPreviouslyAnonymousUser, booking);
app.use("/userData", auth.tokenDecoder, auth.noAnonymousUsers, auth.linkPreviouslyAnonymousUser, userData);
app.use("/vendorAccountData", auth.tokenDecoder, auth.noAnonymousUsers, auth.linkPreviouslyAnonymousUser, vendorAccountData);
app.use("/vendorDetailsData", auth.tokenDecoder, auth.noAnonymousUsers, auth.linkPreviouslyAnonymousUser, vendorDetailsData);
app.use("/subvendorDetailsData", auth.tokenDecoder, auth.noAnonymousUsers, auth.linkPreviouslyAnonymousUser, subvendorDetailsData);

app.use("/stripeConnect", auth.tokenDecoder, auth.noAnonymousUsers, auth.linkPreviouslyAnonymousUser, stripeConnect);

app.use('/uploads', auth.tokenDecoder, auth.noAnonymousUsers, auth.linkPreviouslyAnonymousUser, uploads);

// /* This catches all requests and returns the index, in case someone lands on a page that is not the index
// It seems like this may innappropriately stop some 404 requests from being delivered and deliver the index instead, 
// but haven't found it to be happenning */
// app.get('/*', function (req, res) {
//   res.sendFile(path.resolve('./dist/public/views/index.html'));
// });

/* Starts the server */
app.listen(portDecision, function () {
  console.log("Listening on port: ", portDecision);
});
