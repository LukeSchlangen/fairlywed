var express = require('express');
var app = express();
var path = require('path');
var bodyParser = require('body-parser');
var auth = require('./modules/auth');
var userData = require('./routes/user-data');
var photographerData = require('./routes/photographer-data');
var portDecision = process.env.PORT || 5000;

app.get('/', function(req, res){
  res.sendFile(path.resolve('./public/views/index.html'));
});

app.use(express.static('public'));
app.use(bodyParser.json());

// app.use(function(req, res, next){
//  if (req.headers.private_data_requested === "false") {
//    // This is the code that runs if no private data is requested
//    // Routes available to the public should go here
//     app.use("/photographerData", photographerData);
//  } else {
//    next();
//  }
// });

app.use("/photographerData", photographerData);


// Decodes the token in the request header and attaches the decoded token to req.decodedToken on the request.
app.use(auth.tokenDecoder);

/* Whatever you do below this is protected by your authentication. */

app.use("/userData", userData);

app.listen(portDecision, function(){
  console.log("Listening on port: ", portDecision);
});
