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
var photographerMatchmaker = require('./routes/photographer-matchmaker')

var uploads = require('./routes/uploads');
var portDecision = process.env.PORT || 5000;

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
app.use('/matchmaker', photographerMatchmaker);

/* Whatever you do below this is protected by your authentication. */
app.use("/userData", userData);
app.use("/vendorAccountData", vendorAccountData);
app.use("/vendorDetailsData", vendorDetailsData);
app.use("/subvendorDetailsData", subvendorDetailsData);

app.use('/uploads', uploads);

app.listen(portDecision, function () {
  console.log("Listening on port: ", portDecision);
});
