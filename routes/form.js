var express = require('express');
var router = express.Router();
var soap = require('soap');
var request = require("request");
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var xmlhttp = new XMLHttpRequest();

//Get Credit score
var CREDIT = 'http://138.68.85.24:8080/CreditScoreService/CreditScoreService?wsdl';


/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('form');
});

/* Get form data from user. */
router.post('/', (req, res, next) => {
    var creditScore;
    var banksList = [];
    var ssn = req.body.ssn1 + "-" + req.body.ssn2;
    var loanAmount = req.body.loanAmount;
    var loanDuration = req.body.loanDuration;
    console.log("getting score");
    var me = this;
    getCreditScore(ssn, function (result) {
        console.log('result :' + result);
        console.log("got score");
        creditScore = result;

        var args = {
            ssn: ssn,
            creditScore: creditScore,
            loanAmount: loanAmount,
            loanDuration: loanDuration
        };

        var options = {
            method: 'POST',
            uri: 'http://127.0.0.1:3036/getBanks',
            body: args
        };

        console.log("sending to getBanks");
        request
            .post(
            {
                headers : {  'Content-Type': 'application/json'},
                url: "http://127.0.0.1:3036/getBanks",
                body: JSON.stringify(args)
            }
            , function (err, res, body) {
                console.log("got from getBanks");
                console.log(body);
                console.log(res);
            })

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
