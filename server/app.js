const express = require('express');
var app = express();
var path = require('path');
var bodyParser = require('body-parser');
var auth = require('./modules/auth');
var userData = require('./routes/user-data');
var vendorSearchData = require('./routes/vendor-search-data');
var vendorAccountData = require('./routes/vendor-account-data');
var vendorDetailsData = require('./routes/vendor-details-data');
var subvendorDetailsData = require('./routes/subvendor-details-data');
var packageData = require('./routes/package-data');
var portDecision = process.env.PORT || 5000;

app.get('/', function(req, res){
  res.sendFile(path.resolve('./dist/public/views/index.html'));
});

app.use(express.static('dist/public'));
app.use(bodyParser.json());

app.use("/vendorSearchData", vendorSearchData);
app.use("/packageData", packageData);

// Decodes the token in the request header and attaches the decoded token to req.decodedToken on the request.
app.use(auth.tokenDecoder);

/* Whatever you do below this is protected by your authentication. */
app.use("/userData", userData);
app.use("/vendorAccountData", vendorAccountData);
app.use("/vendorDetailsData", vendorDetailsData);
app.use("/subvendorDetailsData", subvendorDetailsData);

app.listen(portDecision, function(){
  console.log("Listening on port: ", portDecision);
});
