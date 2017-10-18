var express = require('express');
var router = express.Router();
var soap = require('soap');


//Get Credit score
var CREDIT = 'http://138.68.85.24:8080/CreditScoreService/CreditScoreService?wsdl';


/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('form');
});

/* Get form data from user. */
router.post('/', (req, res, next) => {
    var ssn = req.body.ssn1+"-"+req.body.ssn2;
    var loanAmount = req.body.loanAmount;
    var loanDuration = req.body.loanDuration;
    console.log("getting score");
    getCreditScore(ssn, function (result) {
        console.log('result :' + result);
        console.log("got score");

        
    });

});

function getCreditScore(ssn, callback) {
    soap.createClient(CREDIT, function (err, client) {
        if (err) {
            console.log(err)
        } else {
            client.creditScore({ssn: ssn}, function (err, result) {
                if (err) {
                    console.log(err);
                } else {
                    console.log(result.return);
                    callback(result.return);
                }
            });
        }
    });
};

module.exports = router;
