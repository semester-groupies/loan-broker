var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('form');
});

/* Get form data from user. */
router.post('/', function(req, res, next) {
  var ssn = req.body.ssn;




});

module.exports = router;
