var express = require('express');
var app = express();
var path = require('path');
var bodyParser = require('body-parser');
var auth = require('./modules/auth');
var userData = require('./routes/user-data');
var vendorData = require('./routes/vendor-data');
var packageData = require('./routes/package-data');
var portDecision = process.env.PORT || 5000;

app.get('/', function(req, res){
  res.sendFile(path.resolve('./public/views/index.html'));
});

app.use(express.static('public'));
app.use(bodyParser.json());

app.use("/vendorData", vendorData);
app.use("/packageData", packageData);

// Decodes the token in the request header and attaches the decoded token to req.decodedToken on the request.
app.use(auth.tokenDecoder);

/* Whatever you do below this is protected by your authentication. */

app.use("/userData", userData);

app.listen(portDecision, function(){
  console.log("Listening on port: ", portDecision);
});
