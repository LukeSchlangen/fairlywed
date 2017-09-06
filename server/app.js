var dotenv = require('dotenv');
dotenv.config();
var express = require('express');
var app = express();
var enfoceSSL = require('./modules/enforce-ssl');
var mainRoute = require('./routes/main-route')
var path = require('path');

var portDecision = process.env.PORT || 5000;

app.use(enfoceSSL.redirectChecker);

app.use('/invitation/vendor/:id', mainRoute);
app.use('/invitation/vendor', mainRoute);
app.use('/invitation', mainRoute);
app.use('/account/vendor/details/:id/subvendor/details/:id/packages', mainRoute);
app.use('/account/vendor/details/:id/subvendor/details/:id/images', mainRoute);
app.use('/account/vendor/details/:id/subvendor/details/:id/availability', mainRoute);
app.use('/account/vendor/details/:id/subvendor/details/:id/about', mainRoute);
app.use('/account/vendor/details/:id/subvendor/details/:id', mainRoute);
app.use('/account/vendor/details/:id/subvendor/details', mainRoute);
app.use('/account/vendor/details/:id/subvendor', mainRoute);
app.use('/account/vendor/details/:id', mainRoute);
app.use('/account/vendor/details', mainRoute);
app.use('/account/vendor', mainRoute);
app.use('/account', mainRoute);
app.use('/photographers/:id/about', mainRoute);
app.use('/photographers/:id', mainRoute);
app.use('/photographers', mainRoute);
app.use('/policies/cookie', mainRoute);
app.use('/policies/copyright', mainRoute);
app.use('/policies/nondiscrimination', mainRoute);
app.use('/policies/payment', mainRoute);
app.use('/policies/privacy', mainRoute);
app.use('/policies/refund', mainRoute);
app.use('/policies/terms', mainRoute);
app.use('/policies', mainRoute);
app.use('/home/photographers', mainRoute);
app.use('/home', mainRoute);
app.use('/', mainRoute);
app.get('/*', function(req, res) {
  res.status(404).sendFile(path.resolve('./dist/public/views/index.html'));
});

/* Starts the server */
app.listen(portDecision, function () {
  console.log("Listening on port: ", portDecision);
});
