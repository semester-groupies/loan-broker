var express = require('express');
var router = express.Router();
var soap = require('soap');
var request = require("request");
var amqp = require("amqplib/callback_api");
var aggregator = require("./../aggregator/aggregator");

//Get Credit score
var CREDIT = 'http://138.68.85.24:8080/CreditScoreService/CreditScoreService?wsdl';

var url = 'amqp://student:cph@datdb.cphbusiness.dk:5672';

var queue = "group_11_recipient";

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('form');
});

/* Get form data from user. */
router.post('/result', (req, res) => {
    var creditScore;
    var corr = generateUuid();
    var banksList = [];
    res.setTimeout(115000);
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

        request
            .post(
                {
                    headers: {'Content-Type': 'application/json'},
                    url: "http://127.0.0.1:3036/getBanks",
                    body: JSON.stringify(args)
                }
                , function (err, resp, body) {
                    console.log("in the getBanks response");
                    var fullMSGBody = args;
                    fullMSGBody.banks = JSON.parse(body);

                    var bankNumber = Object.keys(JSON.parse(body)).length;
                    amqp.connect(url, function (err, conn) {
                        if (err) {
                            console.log(err)
                        } else {
                            conn.createChannel(function (err, ch) {
                                ch.assertQueue(queue, {durable: true});
                                ch.sendToQueue(queue, Buffer.from(JSON.stringify(fullMSGBody)), {correlationId: corr});
                                ch.assertQueue("final" + corr, {durable: true});
                                aggregator.startAggregator(corr, bankNumber);
                                ch.consume("final" + corr, function (resMQ, err) {
                                    if (res != null)
                                        if (resMQ) {
                                            res.render('result', {data: JSON.parse(resMQ.content),banksSize:JSON.parse(resMQ.content).banks.length});
                                            res = null;
                                        }

                                }, {durable: true});

                            });


                        }
                    });
                });

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


function generateUuid() {
    return Math.random().toString() +
        Math.random().toString() +
        Math.random().toString();
}

module.exports = router;
