var express = require('express');
var router = express.Router();

router.get('/', function(req, res) {
  res.status('Anonymous User Authenticated').sendStatus(200);
});

module.exports = router;