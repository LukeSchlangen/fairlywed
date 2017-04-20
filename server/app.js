var dotenv = require('dotenv');
dotenv.config();
var express = require('express');
var app = express();
var path = require('path');
var bodyParser = require('body-parser');
var auth = require('./modules/auth');
var userData = require('./routes/user-data');
var vendorSearchData = require('./routes/vendor-search-data');
var vendorAccountData = require('./routes/vendor-account-data');
var vendorDetailsData = require('./routes/vendor-details-data');
var subvendorDetailsData = require('./routes/subvendor-details-data');
var galleryImages = require('./routes/gallery-images');
var packageData = require('./routes/package-data');
var booking = require('./routes/booking');
var enfoceSSL = require('./modules/enforce-ssl');

var uploads = require('./routes/uploads');
var portDecision = process.env.PORT || 5000;

app.use(enfoceSSL);

app.get('/', function (req, res) {
  res.sendFile(path.resolve('./dist/public/views/index.html'));
});

app.use(express.static('dist/public'));
app.use(bodyParser.json());

app.use("/vendorSearchData", vendorSearchData);
app.use("/packageData", packageData);
app.use('/booking', booking);
app.use('/galleryImages', galleryImages);

// Decodes the token in the request header and attaches the decoded token to req.decodedToken on the request.
app.use(auth.tokenDecoder);

// Anonymous auth is ok for these routes, created for matchmaking/image comparison
// This is used for tracking a user while they are not logged in
// and then that tracking can be saved to the user after they log in



// Routes that need an actual user account (not an anonymous user), should go below here
app.use(auth.noAnonymousUsers);

// This app.use checks if the user is newly not-anonymous (just logged in)
// and updates all of the database records pointing to the anonymous user to point to the not-anonymous user
app.use(auth.linkPreviouslyAnonymousUser);

/* Whatever you do below this is protected by your authentication. */
app.use("/userData", userData);
app.use("/vendorAccountData", vendorAccountData);
app.use("/vendorDetailsData", vendorDetailsData);
app.use("/subvendorDetailsData", subvendorDetailsData);

app.use('/uploads', uploads);

app.listen(portDecision, function () {
  console.log("Listening on port: ", portDecision);
});
