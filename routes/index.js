var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
 res.render('index', { title: 'Loan Broker Component THIS GOT MERGED INTO MASTER' });
});
module.exports = router;